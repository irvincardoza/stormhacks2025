# StormHacks 2025 

Cross-platform desktop time tracking with an Electron + React dashboard, a local Django backend for analytics, and a Windows C++ tracker for high-fidelity activity logging.

This README gives the high-level getting started. See docs/RUNBOOK.md for full setup, API, and troubleshooting.

## Project Structure

- `frontend-react/electron-react-app` — Electron + React dashboard UI
- `backend/pyton-backend/pyproj` — Django backend API + background analytics
- `backend/cpp-backend` — Windows-only tracker that logs active window + idle
- `backend/data-backend` — Shared data directory (JSON/JSONL artifacts)

## Quick Start (Development)

Prereqs: Node 18+, npm, Python 3.10+, pip, (Windows for C++ tracker), and a Gemini API key for screenshot analysis.

1) Backend (Django)

```bash
cd backend/pyton-backend/pyproj
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
echo "GEMINI_API_KEY=your_key_here" > .env
python manage.py migrate  # optional, minimal DB
python manage.py runserver 127.0.0.1:8000
```

2) Frontend (Electron + React)

```bash
cd frontend-react/electron-react-app
cp env.example .env  # optional; defaults to http://127.0.0.1:8000
npm install
npm run electron-dev
```

3) Windows-only tracker (optional on Windows)

Run the built tracker so activity lines flow into `backend/data-backend/activity.jsonl`:

```powershell
cd backend\cpp-backend\src
./tracker.exe
```

4) Optional: screenshot-to-analysis loop

Send periodic screenshots to the Django `POST /api/analyze/` endpoint:

```bash
cd backend/pyton-backend/pyproj
python screenshot_taker.py --interval 60
```

The provider in the React app auto-fetches the dashboard payload from `GET /api/dashboard/` and overlays it on top of local mock data, so the UI renders immediately and enriches as data arrives.

## Documentation

- Runbook and API: docs/RUNBOOK.md
- Backend integration notes: frontend-react/electron-react-app/docs/BACKEND_INTEGRATION.md
- Change log for this integration: docs/CHANGES-2025-10-05.md
