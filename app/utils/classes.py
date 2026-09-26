import pandas as pd
from dotenv import load_dotenv
import os


def _yes(value):
    """Coerce a spreadsheet 'Yes'/'No'/'' cell into a bool."""
    if pd.isna(value):
        return False
    return str(value).strip().lower() in ("yes", "y", "true", "1")


def _clean(value):
    """Return None for NaN/blank cells so the frontend can fall back cleanly."""
    if pd.isna(value):
        return None
    text = str(value).strip()
    return text or None


class ClassList:

    def __init__(self, dpt, code, name, credit, nine, ten, eleven,
                 twelve, pg, prereq, ncaa, desc):
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
            "desc": self.desc,
        }

    @classmethod
    def getTable(cls):
        load_dotenv()
        docs = os.getenv('CLASS_URL')
        # Header row lives on the second row of the sheet (first row is empty).
        table = pd.read_csv(docs, header=1)
        table.columns = table.columns.str.strip()
        return table

    @classmethod
    def getClasses(cls):
        table = cls.getTable()
        classes = []
        for _, r in table.iterrows():
            name = _clean(r.get("Course Name"))
            if not name:
                continue
            classes.append(cls(
                dpt=_clean(r.get("Department")),
                code=_clean(r.get("Course Code")),
                name=name,
                credit=_clean(r.get("Credit Level")),
                nine=_yes(r.get("9th")),
                ten=_yes(r.get("10th")),
                eleven=_yes(r.get("11th")),
                twelve=_yes(r.get("12th")),
                pg=_yes(r.get("PG")),
                prereq=_clean(r.get("Prerequisites")),
                ncaa=_yes(r.get("NCAA")),
                desc=_clean(r.get("Full Description")),
            ))
        return classes


CLASSES = ClassList.getClasses()
