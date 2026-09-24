# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

NMH Navigator: a Flask app (Python 3.10+) where Northfield Mount Hermon students browse workjobs, classes and co-curriculars/PEs, and see workjobs on a campus map. Requirements and user stories are in `docs/SRS.md`. On the `experiment` branch, login (Google OAuth), reviews/ratings and the SQLite database have been removed entirely. The README still describes them.

## Commands

```bash
pip install -r requirements.txt   # dependencies are unpinned
python app/main.py                # dev server at http://127.0.0.1:3000 (debug=True, port set in `app.run`)
```

The repo has no test suite, linter config or build step. SCSS is compiled at request time by Flask-Assets (`auto_build=True`) into `app/static/css/compiled.css` (gitignored). The webassets cache and manifest are disabled in `main.py` (`assets.cache = False`, `assets.manifest = False`). Leave them off: on Windows, the cache's rename-into-place raises `FileExistsError` and returns a 500 whenever two threaded requests build the CSS at once.

Configuration lives in **`app/.env`**, not the repo root. `load_dotenv()` searches upward from the calling module. Keys used: `API` (Google Maps), `WORKJOB_URL`, `CLASS_URL`, `COCURRICULAR_URL` (CSV URLs). Always run the app against this real data rather than stubbing it.

## Architecture

**Run from the repo root.** `app/main.py` imports `utils.*` as a top-level package, so `app/` must be on `sys.path` (running `python app/main.py` handles this).

**Catalog data comes from remote CSVs.** `utils/workjobs.py`, `utils/classes.py`, `utils/cocurriculars.py` and `utils/clubs.py` each define a `*List` class that reads its CSV URL from `.env` with `pandas.read_csv` and maps named CSV columns to attributes. Each exposes `to_dict()`. Env keys: `WORKJOB_URL`, `CLASS_URL`, `COCURRICULAR_URL`, `CLUBS_URL`. Cocurriculars and clubs are SEPARATE catalogs served from different sheets — cocurriculars carry season/schedule/advisor; clubs carry type/meeting/description. Don't collapse them. They build module-level globals **at import time**:
- `WORKJOBS`: a dict keyed by location → list of `WorkJobList`
- `CLASSES`, `COCURRICULARS`, `CLUBS`: flat lists

Data is loaded once per process, so a server restart is needed to pick up sheet changes. If the sheet's column headers change, these modules break. `utils/scraper.py` is a standalone Selenium scraper for the NMH course catalog. The app does not use it.

**Frontend pattern:** Jinja templates extend `base.html` and render mostly empty shells. The page JS in `app/static/js/` fills them from the JSON API:
- `GET /api/search?s=<workjobs|classes|cocurriculars>&q=<text>`: substring search across selected fields. An empty `q` returns everything.
- `GET /api/workjobs/<location>`: used by `map.js` when a map pin is clicked. The pin titles in `map.js` must case-insensitively match the workjob CSV's `Location` values.

**Styling:** every `scss/*.scss` file is compiled into one bundle (`scss_all` in `main.py`). A new stylesheet must be added to that `Bundle`. libsass compiles each file separately, so shared design tokens are CSS custom properties on `:root` in `base.scss`, not Sass variables. libsass also mis-evaluates CSS `min()` with mixed units, so wrap it: `unquote("min(300px, 80vw)")`. `theme.scss` loads last and overrides the older per-page stylesheets (`classes.scss`, `workjobs.scss`, `cocurriculars.scss`, `map.scss`, `reference.scss`). Those files duplicate selectors such as `.container` and `.search-box`, so the last definition wins.

**Visual style:** editorial ethereal minimalism. Sharp corners; no box shadows; buttons only change color on hover, no transforms. Buttons use `--navy`/`--crimson` — never black. Palette is pale: lavender-cream `--paper`, dusty rose `--pink`, soft sky `--sky`, muted `--gold`, with `--navy` and `--crimson` for buttons and text emphasis (tokens in `base.scss`). Display typography is a variable serif — Fraunces — with italics reserved for editorial emphasis (`<em>` renders in crimson). Body is Inter. The page background is a soft prismatic wash (`.geo-bg`) with three translucent glass-shard triangles drifting (`templates/_background.html`); use only one shape family. Cards are frosted glass — translucent white with `backdrop-filter` blur.

**Mascot assets** (`static/images/`): `pig.png` is the hand-drawn Hogger News mascot with newspaper detail — used in the header brand mark; `favicon.png` derives from it. The four `pig-*.svg` files are low-poly glass-geometric variants generated for the ethereal look: `pig-headbust.svg` (front-facing head, faceted, currently used in the home hero), plus `pig-prismatic.svg`, `pig-silhouette.svg`, `pig-iconic.svg` (alternatives). Swap by changing the `<img src=…>` in `templates/index.html`.
