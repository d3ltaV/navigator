import pandas as pd
from dotenv import load_dotenv
import os


class ClubList:

    def __init__(self, type, name, desc, meeting, publish):
        self.type = type
        self.name = name
        self.desc = desc
        self.meeting = meeting
        self.publish = publish

    def to_dict(self):
        return {
            "Type of Club": self.type,
            "Name of Club": self.name,
            "Club Meeting Time and Location": self.meeting,
            "Publish": self.publish,
            "Description of Club": self.desc,
        }

    @classmethod
    def getTable(cls):
        load_dotenv()
        docs = os.getenv('CLUBS_URL')
        table = pd.read_csv(docs)
        table.columns = table.columns.str.strip()
        return table

    @classmethod
    def getClubs(cls):
        table = cls.getTable()
        clubs = []
        for i, r in table.iterrows():
            if r["Name of Club"] == "Name of Club" or r["Description of Club"] == "Description of Club":
                continue
            class_obj = cls(
                name=r["Name of Club"] if pd.notna(r["Name of Club"]) else None,
                desc=r["Description of Club"] if pd.notna(r["Description of Club"]) else None,
                meeting=r["Club Meeting Time and Location"] if pd.notna(r["Club Meeting Time and Location"]) else None,
                type=r["Type of Club"] if pd.notna(r["Type of Club"]) else None,
                publish=r["Publish"] if pd.notna(r["Publish"]) else None,
            )

            clubs.append(class_obj)

        return clubs
    @classmethod
    def printClubs(cls):
        co = ClubList.getClubs()
        for c in co:
            print(c.to_dict())


CLUBS = ClubList.getClubs()
ClubList.printClubs()