from flask import Flask, render_template, request, jsonify
from flask_assets import Environment, Bundle
from dotenv import load_dotenv

import os
load_dotenv()
from utils.workjobs import WORKJOBS
from utils.classes import CLASSES #format: list of [Class objects]
from utils.cocurriculars import COCURRICULARS #format: list of [Cocurricular objects]
from utils.clubs import CLUBS #format: list of [Club objects]

BUILDINGS = ["Bolger", "Alumni Hall", "Schauffler Library", "Gym", "Gilder", "Various Locations", "RAC",
             "Health Center", "Communications Office", "Early Childhood Center", "Farm", "Service Learning",
             "Plant Facilities", "BEV"]


app = Flask(__name__)

assets = Environment(app)
assets.url = app.static_url_path
assets.directory = app.static_folder
assets.debug = True
assets.auto_build = True
# The on-disk filter cache renames files into place, which fails on Windows when
# two threaded requests build at once (FileExistsError). Rebuilds are cheap without it.
assets.cache = False
assets.manifest = False

scss_all = Bundle(
    'scss/index.scss',
    'scss/base.scss',
    'scss/classes.scss',
    'scss/workjobs.scss',
    'scss/map.scss',
    'scss/cocurriculars.scss',
    'scss/reference.scss',
    'scss/theme.scss',
    filters='libsass',
    output='css/compiled.css'
)
assets.register('scss_all', scss_all)

@app.route('/')
def home():
    return render_template("index.html")

@app.route("/cocurriculars")
def cocurricular_view():
    return render_template("cocurriculars.html")

@app.route("/workjobs")
def workjob_view():
    return render_template("workjobs.html", buildings=BUILDINGS)


@app.route("/classes")
def class_view():
    return render_template("classes.html")

@app.route("/clubs")
def club_view():
    return render_template("clubs.html")

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
                searchable_text = f"{job_dict.get('name', '')} {job_dict.get('location', '')} {job_dict.get('description', '')}".lower()
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
            searchable_text = " ".join(str(class_dict.get(k) or "") for k in (
                "name", "code", "dpt", "credit", "prereq", "desc"
            )).lower()
            if query in searchable_text:
                results.append(class_dict)
        return jsonify(results)

    elif searchType == 'clubs':
        if not query:
            return jsonify([c.to_dict() for c in CLUBS])

        results = []
        for c in CLUBS:
            club_dict = c.to_dict()
            searchable_text = f"{club_dict.get('Name of Club', '')} {club_dict.get('Type of Club', '')} {club_dict.get('Description of Club', '')} {club_dict.get('Club Meeting Time and Location', '')}".lower()
            if query in searchable_text:
                results.append(club_dict)
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
            searchable_text = f"{co_dict.get('name', '')} {co_dict.get('category', '')} {co_dict.get('season', '')} {co_dict.get('prerequisites', '')} {co_dict.get('location', '')} {co_dict.get('schedule', '')}".lower()

            if query in searchable_text:
                results.append(co_dict)
        return jsonify(results)
    else:
        return jsonify({"error": "somethings broken"}), 400


@app.route("/map")
def map():
    load_dotenv()
    key = os.getenv('API')
    return render_template("map.html", api=key)


@app.route("/api/config")
def api_config():
    # Google Maps JS API key — served to the React frontend at boot so it can
    # load the Maps SDK. Key is already client-visible via the /map template,
    # so returning it here is not a new exposure.
    load_dotenv()
    return jsonify({"mapsApiKey": os.getenv('API')})


@app.route("/api/workjobs/<location>")
def api_workjobs(location):
    loc = location.lower().strip()
    print(f"Searching for location: '{loc}'")
    print(f"Available keys: {list(WORKJOBS.keys())}")

    for key, jobs in WORKJOBS.items():
        if key.lower().strip() == loc:
            print(f"Found match: {key}")
            print(jobs)
            return jsonify([job.to_dict() for job in jobs])

    print(f"No match found for: '{loc}'")
    return jsonify({"error": "No workjobs found"}), 404

@app.route("/resources")
def resources():
    return render_template("reference.html")

if __name__ == "__main__":
    app.run(debug=True, port=3000)