# NMH Navigator

Student-built directory of workjobs, clubs and cocurriculars at Northfield Mount Hermon, plus an interactive campus map. Data is pulled live from Google Sheets.

## Stack

- **Backend:** Flask (Python 3.10+). Serves the JSON APIs and the built React bundle.
- **Frontend:** React + TypeScript + Vite + Tailwind + shadcn/ui.

## Configuration

`app/.env` (gitignored) holds the four data-feed URLs and the Google Maps JS API key:

```
API=<google maps js api key>
WORKJOB_URL=<csv url>
CLASS_URL=<csv url>
COCURRICULAR_URL=<csv url>
CLUBS_URL=<csv url>
```

## Run locally

Two servers in two terminals:

```bash
# Flask on :3000 (APIs + /static assets)
python app/main.py

# Vite on :5173 (React dev server, proxies /api and /static to :3000)
npm --prefix frontend install   # first time only
npm --prefix frontend run dev
```

Open http://localhost:5173.
