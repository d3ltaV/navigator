import pandas as pd
from dotenv import load_dotenv
import os

class WorkJobList:

    def __init__(self, name, location, supervisor, supervisor_email,
                 spots, blocks, selected_or_assigned, description, notes):
        self.name = name
        self.location = location
        self.supervisor = supervisor
        self.supervisor_email = supervisor_email
        self.spots = spots
        self.blocks = blocks
        self.selected_or_assigned = selected_or_assigned
        self.description = description
        self.notes = notes

    def to_dict(self):
        return {
            "name": self.name,
            "location": self.location,
            "supervisor": self.supervisor,
            "supervisor_email": self.supervisor_email,
            "spots": self.spots,
            "blocks": self.blocks,
            "selected_or_assigned": self.selected_or_assigned,
            "description": self.description,
            "notes": self.notes
        }
    
    @classmethod
    def getTable(cls):
        load_dotenv()
        docs = os.getenv('WORKJOB_URL')
        table = pd.read_csv(docs)
        return table

    @classmethod
    def getWorkjobs(cls):
        table = cls.getTable()
        workjobs = []
        for i, r in table.iterrows():
            def get(col):
                return r[col] if col in table.columns and pd.notna(r[col]) else None
            job = cls(
                name=get("Workjob Name"),
                location=get("Location"),
                supervisor=get("Supervisor"),
                supervisor_email=get("Supervisor Email"),
                spots=get("Spots"),
                blocks=get("Blocks (if availiable)"),
                selected_or_assigned=get("Selected/Assigned"),
                description=get("Description"),
                notes=get("Notes"),
            )
            workjobs.append(job)

        return workjobs

    @staticmethod
    def sortByLocation(workjobs):
        sorted_workjobs = {}
        for wj in workjobs:
            loc = wj.location
            if loc not in sorted_workjobs:
                sorted_workjobs[loc] = []
            sorted_workjobs[loc].append(wj)
        return sorted_workjobs

    @staticmethod
    def printWorkjobs():
        wj = WorkJobList.getWorkjobs()
        workjobs = WorkJobList.sortByLocation(wj)
        print("Workjobs by Location:")
        for location, jobs in workjobs.items():
            print(f"----------------{location}----------------")
            for job in jobs:
                print(job.to_dict())


wj = WorkJobList.getWorkjobs()
WORKJOBS = WorkJobList.sortByLocation(wj)