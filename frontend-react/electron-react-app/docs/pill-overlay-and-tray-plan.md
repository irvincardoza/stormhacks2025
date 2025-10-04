## Intent

- Build a macOS-style, Spotlight-like pill input bar (chatbot entry) that appears over all apps when a global keyboard shortcut is pressed.
- Add a menu bar icon (system tray) that shows a dropdown with options to show/hide the dashboard.
- Keep the dashboard work going (shadcn UI in React) and integrate the overlay in parallel.

## Scope & Constraints

- Target platform: macOS first; keep Windows/Linux compatibility in mind where feasible.
- App stack: Electron + React (CRA), with `electron.js` as main entry.
- Avoid conflicting system shortcuts (don’t use Cmd+Space). Prefer Option+Space or Ctrl+Space.
- Overlay should be lightweight, frameless, always-on-top, transparent, visible on all workspaces, and easy to dismiss (Esc/blur).
- Secure IPC: enable `contextIsolation`, disable `nodeIntegration` in renderer, use a `preload` bridge.

## High-level Architecture

- Main process (Electron):
  - `mainWindow`: dashboard
  - `overlayWindow`: pill-style overlay window (frameless, transparent)
  - Global shortcut via `globalShortcut` to toggle `overlayWindow` visibility
  - `Tray` with a context `Menu` to show/hide `mainWindow`
  - IPC (`ipcMain`) handlers for overlay submit and visibility control

- Renderer (React):
  - Dashboard (existing; shadcn components)
  - Overlay route/component (e.g., `#/overlay` or separate file) rendering the pill input UI
  - Uses `window.api` from `preload` to submit input and hide the overlay

## Implementation Plan (step-by-step)

1) Foundation (main process hardening)

- Add a `preload.js` (or `src/preload/index.ts`) that exposes a minimal API via `contextBridge`.
- Update `BrowserWindow` webPreferences in `electron.js` to:
  - `contextIsolation: true`
  - `nodeIntegration: false`
  - `preload: path.join(__dirname, 'preload.js')`
- Ensure single instance lock so shortcuts/tray don’t duplicate:
  - `if (!app.requestSingleInstanceLock()) app.quit()`

2) Create the overlay window

- In `electron.js`, implement `createOverlayWindow()`:
  - `frame: false`, `transparent: true`, `resizable: false`, `movable: false`, `skipTaskbar: true`, `focusable: true`, `fullscreenable: false`
  - `alwaysOnTop: true` with level `'screen-saver'` (mac) or `'floating'` as fallback
  - `visibleOnAllWorkspaces: true` (with `{ visibleOnFullScreen: true }` on mac)
  - Optional mac polish: `vibrancy`/`backgroundMaterial` and `visualEffectState: 'active'`
  - Load `startURL + '#/overlay'` (dev) and `file://.../index.html#overlay` (prod)
- Use `screen` API to position top-center of the active display:
  - Get display bounds; compute centered X; Y near top (e.g., `workArea.y + 20`)
  - Handle `display-metrics-changed` to re-center if resolution changes
- Behavior:
  - Show on shortcut; focus input automatically (via IPC to renderer)
  - Hide on `Esc` or when window loses focus (`blur`)

3) Global shortcut

- Register on `app.whenReady()` a combo like `Alt+Space` (mac Option+Space):
  - `globalShortcut.register('Alt+Space', toggleOverlay)`
- On `will-quit`, call `globalShortcut.unregisterAll()`
- Avoid `CommandOrControl+Space` (conflicts with Spotlight)

4) Tray (menu bar) icon + menu

- Create `Tray` with `assets/icon.png` (consider template image for mac for auto light/dark inversion)
- `tray.setToolTip('Your App Name')`
- Build a context `Menu` with:
  - `Toggle Dashboard` (or `Show Dashboard`/`Hide Dashboard` based on state)
  - `Quit`
- Hook `tray.on('click', ...)` to show the menu or toggle the dashboard
- Ensure menu labeling reflects window visibility (`mainWindow.isVisible()`)

5) Renderer: overlay UI (pill)

- Add an `Overlay` React component/route that mounts in a small, centered container with pill style:
  - Tailwind/shadcn: rounded-full, shadow, translucent backdrop
  - Input + optional microphone/send button; `Enter` submits, `Esc` hides
  - Keep it self-contained; no page chrome
- On mount, focus the input; listen for `Esc` to request hide via `window.api.overlay.hide()`
- On submit:
  - Call `window.api.overlay.submit(text)` → IPC to main
  - Optionally hide immediately or keep open to show suggestions

6) IPC wiring

- Preload exposes `overlay.submit(text)`, `overlay.hide()`, and `overlay.focusInput()`
- `ipcMain.handle('overlay:submit')` processes chatbot request or forwards to your agent/backend
- `ipcMain.on('overlay:hide')` hides the overlay window
- Optionally `ipcMain.on('overlay:focus')` to focus and select input

7) Dashboard integration

- Ensure dashboard exposes show/hide behavior from main:
  - `mainWindow.show()` / `mainWindow.hide()` / `mainWindow.focus()`
- Tray menu toggles dashboard visibility accordingly
- Keep UI styling consistent by reusing shadcn tokens for colors/shadows/spacing

8) Testing checklist

- Global shortcut registers once; unregisters on quit
- Overlay shows on the active display, top-centered, above full-screen apps (mac)
- Overlay can be dismissed by `Esc` and blur
- Multi-display: switch active display and verify centering
- Tray menu labels update correctly; click events work
- Dev and prod URLs for both windows resolve
- No security regressions: `nodeIntegration: false`, `contextIsolation: true`

## Optional Enhancements

- Intelligent focus: if overlay already visible, pressing the shortcut re-focuses input and cycles suggestions
- Type-to-search suggestions (debounced) under the pill
- Keep history; up/down to navigate prior prompts
- Theming with shadcn primitives for consistent look
- Windows/Linux: map shortcut to `Ctrl+Space` fallback; `alwaysOnTop` level `'normal'`/`'modal-panel'` as supported

## Risks & Mitigations

- Shortcut conflicts on macOS (Spotlight): avoid `Cmd+Space`; use `Option+Space` or configurable shortcut via preferences later
- Transparent window click-through: ensure `focusable: true` and do not set `clickThrough` behavior unless intended
- Full-screen apps: use `setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })` and a high always-on-top level
- Security: never enable `nodeIntegration` in overlay/dashboard; only expose minimal IPC surface via preload

## File/Code Changes (at-a-glance)

- `electron.js`
  - Add `preload` to `webPreferences`
  - Add single-instance guard
  - Implement `createOverlayWindow()`, `toggleOverlay()`
  - Register/unregister global shortcut
  - Create `Tray` and context `Menu`
- `preload.js`
  - `contextBridge.exposeInMainWorld('api', { overlay: { submit, hide, focus } })`
- React (renderer)
  - Add `Overlay` route/component for the pill UI
  - Hook into `window.api` for submit/hide/focus

## Example Snippets (illustrative)

```js
// main (electron.js) – key parts only
const { app, BrowserWindow, globalShortcut, Tray, Menu, screen, nativeImage, ipcMain } = require('electron');
const path = require('path');

let mainWindow, overlayWindow, tray;

function positionOverlay(width = 640, height = 64) {
  const display = screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
  const { x, y, width: w, height: h } = display.workArea;
  const targetX = Math.round(x + (w - width) / 2);
  const targetY = Math.round(y + 20);
  overlayWindow.setBounds({ x: targetX, y: targetY, width, height });
}

function createOverlayWindow() {
  overlayWindow = new BrowserWindow({
    width: 640,
    height: 64,
    frame: false,
    transparent: true,
    resizable: false,
    movable: false,
    skipTaskbar: true,
    focusable: true,
    fullscreenable: false,
    alwaysOnTop: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  overlayWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  overlayWindow.setAlwaysOnTop(true, 'screen-saver');
  const startURL = process.env.ELECTRON_START_URL || 'http://localhost:3000';
  overlayWindow.loadURL(`${startURL}#/overlay`);
  positionOverlay();
  overlayWindow.on('blur', () => overlayWindow.hide());
}

function toggleOverlay() {
  if (!overlayWindow) createOverlayWindow();
  if (overlayWindow.isVisible()) overlayWindow.hide();
  else { positionOverlay(); overlayWindow.show(); overlayWindow.focus(); }
}

function createTray() {
  const icon = nativeImage.createFromPath(path.join(__dirname, 'assets', 'icon.png'));
  tray = new Tray(icon);
  tray.setToolTip('My Electron App');
  const buildMenu = () => Menu.buildFromTemplate([
    { label: mainWindow?.isVisible() ? 'Hide Dashboard' : 'Show Dashboard', click: () => {
      if (!mainWindow) return;
      if (mainWindow.isVisible()) mainWindow.hide(); else { mainWindow.show(); mainWindow.focus(); }
    }},
    { type: 'separator' },
    { label: 'Quit', role: 'quit' },
  ]);
  tray.setContextMenu(buildMenu());
  tray.on('click', () => tray.popUpContextMenu());
}

app.whenReady().then(() => {
  // createWindow(); // existing dashboard window
  createTray();
  globalShortcut.register('Alt+Space', toggleOverlay);
});

app.on('will-quit', () => globalShortcut.unregisterAll());
```

```tsx
// renderer Overlay (React) – key parts only
export default function Overlay() {
  const [value, setValue] = useState('');
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') window.api.overlay.hide(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  const submit = () => { if (!value.trim()) return; window.api.overlay.submit(value); setValue(''); window.api.overlay.hide(); };
  return (
    <div className="fixed inset-0 pointer-events-none flex items-start justify-center" style={{ paddingTop: 20 }}>
      <div className="pointer-events-auto w-[640px] rounded-full bg-white/90 backdrop-blur shadow-xl border border-black/5 p-2 flex items-center gap-2">
        <input className="flex-1 bg-transparent outline-none px-4" placeholder="Ask anything…" value={value} onChange={e => setValue(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} />
        <button className="px-3 py-1 rounded-full bg-black text-white" onClick={submit}>Send</button>
      </div>
    </div>
  );
}
```

## Acceptance Criteria

- Pressing Option+Space shows the overlay on the active screen; pressing again (or Esc) hides it
- Overlay stays above other windows and on full-screen apps (mac)
- Tray icon appears; menu toggles dashboard visibility; Quit works
- No renderer has Node integration; IPC surface is minimal and typed (if TS)

## References

- [Electron globalShortcut](https://www.electronjs.org/docs/latest/api/global-shortcut)
- [Electron Tray](https://www.electronjs.org/docs/latest/api/tray)
- [Electron Menu](https://www.electronjs.org/docs/latest/api/menu)
- [Electron BrowserWindow](https://www.electronjs.org/docs/latest/api/browser-window)
- [Electron screen](https://www.electronjs.org/docs/latest/api/screen)
- [Always-on-top levels](https://www.electronjs.org/docs/latest/api/browser-window#winsetalwaysontopflag-level-relativelevel)
- [All workspaces (mac)](https://www.electronjs.org/docs/latest/api/browser-window#winsetvisibleonallworkspacesvisible-options)
- [Transparent windows & vibrancy](https://www.electronjs.org/docs/latest/tutorial/window-customization#transparent-window)
- [Security: contextIsolation & preload](https://www.electronjs.org/docs/latest/tutorial/sandbox)
- [Single instance lock](https://www.electronjs.org/docs/latest/api/app#apprequestsingleinstancelock)


