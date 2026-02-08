import pandas as pd
from dotenv import load_dotenv
import os


class ClassList:

    def __init__(self, dpt, code, name, credit, nine, ten, eleven, twelve, pg, prereq, ncaa, desc):
        self.dpt = dpt
        self.code = code
        self.name = name
        self.credit = credit
        self.nine = nine
        self.ten = ten
        self.eleven = eleven
        self.twelve = twelve
        self.pg = pg
        self.prereq = prereq
        self.ncaa = ncaa
        self.desc = desc

    def to_dict(self):
        return {
            "dpt": self.dpt,
            "code": self.code,
            "name": self.name,
            "credit": self.credit,
            "nine": self.nine,
            "ten": self.ten,
            "eleven": self.eleven,
            "twelve": self.twelve,
            "pg": self.pg,
            "prereq": self.prereq,
            "ncaa": self.ncaa,
            "desc": self.desc
        }

    @classmethod
    def getTable(cls):
        load_dotenv()
        docs = os.getenv('CLASS_WK')
        table = pd.read_csv(docs, skiprows=1)
        table.columns = table.columns.str.strip()
        return table

    @classmethod
    def getClasses(cls):
        table = cls.getTable()
        classes = []
        for i, r in table.iterrows():
            if r["Department"] == "Department" or r["Course Name"] == "Course Name":
                continue
            class_obj = cls(
                dpt=r["Department"] if pd.notna(r["Department"]) else None,
                code=r["Course Code"] if pd.notna(r["Course Code"]) else None,
                name=r["Course Name"] if pd.notna(r["Course Name"]) else None,
                credit=r["Credit Level"] if pd.notna(r["Credit Level"]) else None,
                nine=r["9th"] if pd.notna(r["9th"]) else None,
                ten=r["10th"] if pd.notna(r["10th"]) else None,
                eleven=r["11th"] if pd.notna(r["11th"]) else None,
                twelve=r["12th"] if pd.notna(r["12th"]) else None,
                pg=r["PG"] if pd.notna(r["PG"]) else None,
                prereq=r["Prerequisites"] if pd.notna(r["Prerequisites"]) else None,
                ncaa=r["NCAA"] if pd.notna(r["NCAA"]) else None,
                desc=r["Full Description"] if pd.notna(r["Full Description"]) else None,
            )

            classes.append(class_obj)

        return classes
    @classmethod
    def printClasses(cls):
        classes = ClassList.getClasses()
        for c in classes:
            print(c.to_dict())

CLASSES = ClassList.getClasses()
# ClassList.printClasses()