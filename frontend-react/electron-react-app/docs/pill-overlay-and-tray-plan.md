## Intent

- Provide a polished, macOS-style “pill” overlay input that appears with a global shortcut and hides on blur/Esc.
- Add a robust menu bar (Tray) icon with a focused “Show Dashboard” action and session-related placeholders.
- Keep implementation minimal, reliable, and free of race conditions.

## Scope & Decisions

- Platform: macOS first; works cross‑platform where possible.
- Stack: Electron + React (CRA). Main entry: `electron.js`.
- Shortcut: Cmd+\ (Command+Backslash) on macOS; Ctrl+\ on other platforms.
- Overlay: frameless, transparent, always‑on‑top, visible on all workspaces, dismissable via blur/Esc.
 - Overlay: frameless, transparent, always‑on‑top, visible on all workspaces, dismissable via blur/Esc, and movable via a small drag handle.
- Tray menu items: 1) Start session, 2) Take a break, 3) Stop session, 4) Show dashboard.
  - “Show Dashboard” brings the dashboard window to front and focuses it.
  - Other items are placeholders, intentionally left open for future use.

## What’s Implemented

- Global shortcut to toggle overlay: Cmd+\ on mac, Ctrl+\ elsewhere.
- Overlay pill window: top‑center, transparent, auto‑focus input, hides on blur/Esc.
 - Overlay pill window: top‑center, transparent but darker tint for contrast, auto‑focus input, hides on blur/Esc, and can be dragged by a handle.
- Tray icon using `assets/icon.png` (mac template for auto light/dark). Tooltip: “Stormhacks App”.
- Tray menu items created per spec; “Show dashboard” shows and focuses main window.
- Renderer overlay route via `?view=overlay` with conditional rendering; background is truly transparent under overlay mode.

## File Changes (key sections)

- `electron.js`
  - Added: `positionOverlay()` (lines 29–37), `createOverlayWindow()` (lines 39–91), `toggleOverlay()` (lines 93–103), `showDashboard()` (lines 105–110), `createTray()` (lines 112–140).
  - Updated: `app.on('ready', ...)` to create tray and register global shortcut (lines 142–152). Added `will-quit` cleanup (lines 166–168).
  - “Show Dashboard” calls `mainWindow.restore()`, `show()`, and `focus()` to guarantee focus.

- `src/index.tsx`
  - Added conditional overlay rendering based on `?view=overlay` and sets `data-overlay` attribute for CSS transparency (lines 17–21, 23–29). Import: `pages/overlay-pill` (line 6).

- `src/pages/overlay-pill.tsx`
  - New overlay pill component: translucent rounded input, autofocus, Enter clears, blur hides via main.

- `src/styles/globals.css`
  - Added transparent background rules when `data-overlay='1'` is set (after body styles).

## How It Works

- Overlay positioning: Uses `screen.getDisplayNearestPoint()` + current cursor to center a 720×64 window near the top (`workArea.y + 20`).
- Visibility: Toggle with global shortcut; hide on blur or Esc via `before-input-event` in the main process (avoids renderer IPC and races).
- Focus: Overlay input auto‑focuses and selects on mount for immediate typing.
- Tray: Uses template image on macOS for crisp appearance in light/dark menu bars.
- Dashboard focus: “Show Dashboard” ensures it’s restored, shown, and focused.

## Acceptance Criteria

- Cmd+\ (mac) or Ctrl+\ (others) toggles the overlay on the active screen’s top center.
- Overlay hides on blur or Esc; always stays on top, including over full‑screen apps (mac).
- Tray shows with 4 items; “Show Dashboard” brings the dashboard to front and focuses it.
- No spurious timers or race‑y state transitions; behavior is deterministic.

## Notes / Next Steps (optional)

- Session items (Start/Break/Stop) are intentionally open for future hooks (IPC, analytics, timers). They’re stubs for now.
- If you want the overlay to submit commands to the app, we can wire IPC with a small `preload` bridge. Not needed yet.

## References

- [Electron globalShortcut](https://www.electronjs.org/docs/latest/api/global-shortcut)
- [Electron Tray](https://www.electronjs.org/docs/latest/api/tray)
- [Electron Menu](https://www.electronjs.org/docs/latest/api/menu)
- [Electron BrowserWindow](https://www.electronjs.org/docs/latest/api/browser-window)
- [Electron screen](https://www.electronjs.org/docs/latest/api/screen)
- [Always-on-top levels](https://www.electronjs.org/docs/latest/api/browser-window#winsetalwaysontopflag-level-relativelevel)
- [All workspaces (mac)](https://www.electronjs.org/docs/latest/api/browser-window#winsetvisibleonallworkspacesvisible-options)
