# Activity Processor - Using activity.jsonl as Source of Truth

## Overview

Created a new `activity_processor.py` module that processes `activity.jsonl` directly as the single source of truth for all dashboard metrics. This fixes timestamp issues and ensures accurate, real-time data display in the frontend.

## What Was Fixed

### Problem
- Backend was reading from `metrics.jsonl` which had rounded timestamps (losing precision)
- Frontend showed wrong times (e.g., showing "6pm" when data was from 11pm)
- Timestamps weren't properly converted to local timezone
- Time labels didn't match frontend format expectations

### Solution
- **New Module**: `pyapp/services/activity_processor.py`
  - Reads `activity.jsonl` directly (line-by-line JSONL parsing)
  - Parses precise ISO timestamps with proper timezone handling
  - Converts to local timezone using Django's timezone settings
  - Formats time labels as "6a", "11pm", etc. to match frontend expectations
  - Computes all metrics on-the-fly from raw activity data

- **Updated**: `pyapp/services/dashboard_data.py`
  - Now uses activity processor for Overview, Timeline, and Switches sections
  - Falls back to old metrics.jsonl for sections not yet migrated (Idle, Apps, Focus)

## Key Functions

### `load_activity_data()` 
Loads and enriches all activity records from `activity.jsonl`:
- Parses each JSONL line
- Converts timestamps to local timezone
- Calculates active time (assuming 5-second polling)
- Classifies productivity (productive/unproductive/neutral)
- Returns sorted list of enriched records

### `compute_hourly_productivity(activities)`
Computes hourly productive/unproductive percentages:
- Groups activity by hour
- Calculates percentage of time spent productive vs unproductive
- Returns array of `{hour, productive, unproductive}` dicts

### `compute_context_switches(activities)`
Counts app switches per hour:
- Detects when `app_name` changes between consecutive records
- Groups switches by hour
- Returns array of `{hour, switches}` dicts

### `build_timeline_data(activities)`
Builds timeline visualization data:
- **dailyTimeline**: Stacked bar chart of top 5 apps by hour
  - Format: `{name: "11pm", "Cursor": 45.2, "Chrome": 12.5, ...}`
- **activityEvents**: Last 200 activity records for the feed
  - Format: `{ts, app, window, domain, idleSec, category, productivity}`

### `build_overview_data(activities)`
Builds overview dashboard section:
- **productivityBreakdown**: Donut chart of productivity categories
- **hourlyProductivity**: Area chart of productive/unproductive over time
- **contextSwitchTrend**: Line chart of switches per hour
- **weeklyProductivity**: Placeholder (needs historical data)

## Time Format

All time labels now use the format: `"6a"`, `"11a"`, `"2p"`, `"11pm"`
- This matches the frontend mock data format in `dashboard.ts`
- Examples: `"12a"` (midnight), `"6a"`, `"12p"` (noon), `"11p"`

## Productivity Classification

Simple heuristic (can be expanded):
- **Productive**: Cursor, VS Code, Terminal, Figma, GitHub, development-related windows
- **Unproductive**: Spotify, YouTube, Twitter, Facebook, Reddit
- **Neutral**: Everything else

## Testing

### 1. Test the processor directly:
```bash
cd backend/pyton-backend/pyproj
python3 test_activity_processor.py
```

This will show:
- Number of activity records loaded
- First/last timestamps
- Sample hourly productivity points
- Sample context switch counts
- Sample overview data
- Sample timeline points and events

### 2. Test the API endpoint:
```bash
# Start Django server
python3 manage.py runserver 127.0.0.1:8000

# In another terminal, fetch the dashboard:
curl http://127.0.0.1:8000/api/dashboard/ | jq .
```

Check that:
- `data.overview.hourlyProductivity.points[0].name` shows time like `"11p"` or `"6a"`
- Timestamps in `data.timeline.activityEvents[0].ts` are ISO strings with your local timezone
- Numbers make sense (not all zeros)

### 3. Test in the frontend:
```bash
cd frontend-react/electron-react-app
npm run electron-dev
```

Navigate to:
- **Overview** page: Should show correct hourly times on x-axis
- **Timeline** page: Should show recent activity with correct timestamps

## Data Flow

```
activity.jsonl (source of truth)
    ↓
load_activity_data()
    ↓ (enriched records with timestamps, productivity, etc.)
build_overview_data() ──→ Overview page
build_timeline_data() ──→ Timeline page
compute_context_switches() ──→ Switches data
    ↓
GET /api/dashboard/
    ↓
Frontend DashboardDataProvider
    ↓
Pages (overview.tsx, timeline.tsx, etc.)
```

## Migration Path

Currently migrated to activity processor:
- ✅ Overview section
- ✅ Timeline section  
- ✅ Context switches

Still using old metrics.jsonl:
- ⏳ Idle section
- ⏳ Apps section
- ⏳ Focus section

To migrate remaining sections, add similar functions to `activity_processor.py` and update `build_dashboard_payload()` in `dashboard_data.py`.

## Notes

- Activity records are assumed to be collected every ~5 seconds
- Timezone conversion uses Django's `get_current_timezone()`
- JSONL parsing is robust (skips invalid lines rather than crashing)
- Last 200 events are shown in the activity feed (configurable)
- Top 5 apps are shown in timeline (others grouped as "Other")
