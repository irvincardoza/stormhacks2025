CPP Tracker
=================

Native tracker that logs the active window (app name + title) and idle seconds to `backend/data-backend/activity.jsonl`.

Supported platforms
- Windows (existing, prebuilt `.exe` present under `src/`)
- macOS (Apple Silicon and Intel)

Build (macOS)
1) Generate build files with CMake:
   
   ```bash
   cd backend/cpp-backend
   cmake -S . -B build -DCMAKE_BUILD_TYPE=Release -DCMAKE_OSX_ARCHITECTURES=arm64
   # For Intel Macs, omit or set: -DCMAKE_OSX_ARCHITECTURES=x86_64
   ```

2) Build the tracker:
   
   ```bash
   cmake --build build --config Release
   ```

3) Run the tracker (write logs into `backend/data-backend`):
   
   ```bash
   cd build
   ./tracker
   ```

Notes
- Output path: defaults to `../../data-backend/activity.jsonl` from the current working directory. You can override with env var `TRACKER_ACTIVITY_PATH`.
- Accessibility: The macOS implementation uses CoreGraphics window APIs; window titles may be empty for some apps due to privacy. No additional permissions are required for basic app name/title on most setups.
- Idle detection: Uses `CGEventSourceSecondsSinceLastEventType` on macOS.

Windows usage
```powershell
cd backend\cpp-backend\src
./tracker.exe
```
