# Tracklet Runbook

This document covers end-to-end setup, commands, and integration details for the Electron + Django + C++ stack.

## 1. Architecture Overview

- C++ tracker (Windows + macOS): writes active window + idle seconds to `backend/data-backend/activity.jsonl`.
- Django backend: accepts screenshot uploads for analysis and runs background tasks to merge and aggregate data into metrics JSON.
- Electron + React: displays charts and dashboard; auto-fetches `GET /api/dashboard/` and renders immediately with mock fallbacks.

Data flow:

```
C++ tracker → activity.jsonl
Screenshot POST (/api/analyze/) → q_analysis.jsonl
Combiner/background tasks → metrics.jsonl + hourly_productivity.json + context_switches.json + productivity_summary.json + monitor_status.json
Electron Dashboard → GET /api/dashboard/ (aggregated payload)
```

## 2. Prerequisites

- Node 18+ and npm
- Python 3.10+ and pip
- Windows (optional) if you want the native tracker running
- Google Gemini API key (for screenshot analysis): set `GEMINI_API_KEY` in `backend/pyton-backend/pyproj/.env`

## 3. Backend (Django)

From `backend/pyton-backend/pyproj`:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
echo "GEMINI_API_KEY=your_key_here" > .env
python manage.py migrate  # optional
python manage.py runserver 127.0.0.1:8000
```

Notes:
- Background analytics start automatically when the server boots.
- CORS is enabled for `http://127.0.0.1:3000` and `http://localhost:3000`.

### API Endpoints

- `POST /api/analyze/` — multipart form upload with field `screenshot`; optional `prompt`.
  - Response: where the structured label was appended (`q_analysis.jsonl`) and an echo of the entry.
  - Example:

    ```bash
    curl -X POST http://127.0.0.1:8000/api/analyze/ \
      -F screenshot=@/path/to/file.png \
      -F 'prompt=Classify activity' 
    ```

- `GET /api/dashboard/` — returns the dashboard payload:
  - `data`: object with sections (`overview`, `idle`, `apps`, `switches`, `timeline`, `focus`, `settings`)
  - `generated_at`: ISO timestamp

## 4. Frontend (Electron + React)

From `frontend-react/electron-react-app`:

```bash
cp env.example .env   # optional; defaults to http://127.0.0.1:8000
npm install
npm run electron-dev
```

The app will render with mock data and automatically hydrate with live data from the Django backend. You can point to a different backend using `REACT_APP_API_BASE` in `.env`.

## 5. C++ Tracker (Windows and macOS)

### Windows
From `backend/cpp-backend/src` (PowerShell or CMD):

```powershell
./tracker.exe
```

### macOS (Apple Silicon / Intel)
From `backend/cpp-backend`:

```bash
cmake -S . -B build -DCMAKE_BUILD_TYPE=Release -DCMAKE_OSX_ARCHITECTURES=arm64   # use x86_64 on Intel Macs
cmake --build build --config Release
./build/tracker
```

The tracker writes to `backend/data-backend/activity.jsonl` (relative path). By default it targets `../../data-backend/activity.jsonl` from the current working directory. You can override with `TRACKER_ACTIVITY_PATH`.

## 6. Screenshot Capture Loop (Optional)

From `backend/pyton-backend/pyproj`:

```bash
python screenshot_taker.py --interval 60
```

This captures and posts `latest.png` to `POST /api/analyze/`, which updates `q_analysis.jsonl`. Background tasks merge it with `activity.jsonl` into `metrics.jsonl` and derived JSON.

## 7. Data Files

Produced in `backend/data-backend`:

- `activity.jsonl` — raw activity lines from C++ tracker
- `q_analysis.jsonl` — screenshot labels (from `POST /api/analyze/`)
- `metrics.jsonl` — combined activity + labels (pandas merge)
- `hourly_productivity.json` — `[ { hour, productive, unproductive } ]`
- `context_switches.json` — `[ { hour, switches } ]`
- `productivity_summary.json` — `{ productive, unproductive, idle, total_minutes }`
- `monitor_status.json` — `{ unproductive_streak, checked_at }`

## 8. Packaging Notes

- Electron: you can package with `npm run dist` (see `electron-builder` config in `package.json`).
- Django: for packaged desktop use, ship a local server (gunicorn/uvicorn) and set `REACT_APP_API_BASE` to that localhost port.
- Data directory: consider switching to Electron `app.getPath('userData')` and pass it into Python/C++ via env var; the code currently uses the repo-relative `backend/data-backend` defaults.

## 9. Troubleshooting

- 404/Network errors in the UI: confirm Django is running at `http://127.0.0.1:8000` and that `.env` sets `REACT_APP_API_BASE` correctly.
- CORS errors: backend CORS allows `localhost:3000` out of the box.
- `GEMINI_API_KEY` missing: the analyze endpoint will raise; set it in `backend/pyton-backend/pyproj/.env`.
- No graphs: start the tracker and/or screenshot loop so files appear in `backend/data-backend`. The UI will still render with mock data until live data arrives.
