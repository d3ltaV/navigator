from flask import Flask, render_template, request, jsonify, redirect, url_for
import json
from dotenv import load_dotenv

import requests
import os

load_dotenv()
from utils.workjobs import WORKJOBS
from utils.classes import CLASSES #format: list of [Class objects]
from utils.cocurriculars import COCURRICULARS #format: list of [Cocurricular objects]
from utils.clubs import CLUBS

BUILDINGS = ["Bolger", "Alumni Hall", "Schauffler Library", "Gym", "Gilder", "Various Locations", "RAC",
             "Health Center", "Communications Office", "Early Childhood Center", "Farm", "Service Learning",
             "Plant Facilities", "BEV"]
GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", None)
GOOGLE_CLIENT_SECRET = os.environ.get("GOOGLE_CLIENT_SECRET", None)
GOOGLE_DISCOVERY_URL = "https://accounts.google.com/.well-known/openid-configuration"


app = Flask(__name__)

app.secret_key = os.environ.get("CLIENT_ID", None)


@app.route('/')
def home():
    return render_template("index.html")

@app.route("/cocurriculars")
def cocurricular_view():
    return render_template("cocurriculars.html")

@app.route("/workjobs")
def workjob_view():
    return render_template("workjobs.html", buildings=BUILDINGS)

@app.route("/clubs")
def club_view():
    return render_template("clubs.html")

@app.route("/classes")
def class_view():
    return render_template("classes.html")

@app.route("/api/search")
def api_search():
    query = request.args.get('q', '').lower().strip()
    searchType = request.args.get('s', '').lower().strip()

    if searchType == 'workjobs':
        if not query:
            all_jobs = []
            for jobs in WORKJOBS.values():
                all_jobs.extend([job.to_dict() for job in jobs])
            return jsonify(all_jobs)

        results = []
        for jobs in WORKJOBS.values():
            for job in jobs:
                job_dict = job.to_dict()
                searchable_text = f"{job_dict.get('name', '')} {job_dict.get('location', '')} {job_dict.get('description', '')} {job_dict.get('supervisor', '')}".lower()
                if query in searchable_text:
                    results.append(job_dict)
        return jsonify(results)

    elif searchType == 'classes':
        if not query:
            all_classes = []
            for c in CLASSES:
                all_classes.append(c.to_dict())
            return jsonify(all_classes)

        results = []
        for c in CLASSES:
            class_dict = c.to_dict()
            searchable_text = f"{class_dict.get('bnc', '')} {class_dict.get('name', '')} {class_dict.get('semester', '')} {class_dict.get('room', '')}".lower()
            if query in searchable_text:
                results.append(class_dict)
        return jsonify(results)

    elif (searchType == 'cocurriculars'):
        if not query:
            all_co = []
            for co in COCURRICULARS:
                all_co.append(co.to_dict())
            return jsonify(all_co) # list of dictionary of all cocurriculars

        results = []
        for co in COCURRICULARS:
            # for x in co: add this loop if cocurriculars become grouped like workjobs
            co_dict = co.to_dict()
            searchable_text = f"{co_dict.get('name', '')} {co_dict.get('category', '')} {co_dict.get('season', '')} {co_dict.get('prerequisites', '')} {co_dict.get('location', '')} {co_dict.get('schedule', '')} {co_dict.get('advisor', '')}".lower()

            if query in searchable_text:
                results.append(co_dict)
        return jsonify(results)
    elif searchType == 'clubs':
        if not query:
            return jsonify([c.to_dict() for c in CLUBS])
        results = []
        for c in CLUBS:
            d = c.to_dict()
            searchable_text = f"{d.get('Name of Club', '')} {d.get('Type of Club', '')} {d.get('Description of Club', '')}".lower()
            if query in searchable_text:
                results.append(d)
        return jsonify(results)
    else:
        return jsonify({"error": "somethings broken"}), 400


@app.route("/map")
def map():
    load_dotenv()
    key = os.getenv('API')
    return render_template("map.html", api=key)


@app.route("/api/workjobs/<location>")
def api_workjobs(location):
    loc = location.lower().strip()
    # print(f"Searching for location: '{loc}'")
    # print(f"Available keys: {list(WORKJOBS.keys())}")

    for key, jobs in WORKJOBS.items():
        if key.lower().strip() == loc:
            # print(f"Found match: {key}")
            # print(jobs)
            return jsonify([job.to_dict() for job in jobs])

    print(f"No match found for: '{loc}'")
    return jsonify({"error": "No workjobs found"}), 404


@app.route("/resources")
def resources():
    return render_template("reference.html")

if __name__ == "__main__":
    app.run(debug=True)