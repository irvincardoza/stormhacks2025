// electron.js
const { app, BrowserWindow, Tray, Menu, globalShortcut, screen, nativeImage, ipcMain } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const isDev = require('electron-is-dev');
const screenshot = require('screenshot-desktop');

let mainWindow;
let overlayWindow;
let tray;
let micProc = null;
let micOverlayWindow;
let micOverlayHideTimeout;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      // Keep current renderer behavior for dashboard
      nodeIntegration: true,
    },
  });

  const startURL = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../build/index.html')}`;

  mainWindow.loadURL(startURL);

  mainWindow.on('closed', () => (mainWindow = null));
}

function positionOverlay() {
  if (!overlayWindow) return;
  const cursorPoint = screen.getCursorScreenPoint();
  const display = screen.getDisplayNearestPoint(cursorPoint);
  const { x, y, width, height } = display.bounds;
  // Make the overlay window span the entire display so the pill can be dragged anywhere
  overlayWindow.setBounds({ x, y, width, height });
}

function createOverlayWindow() {
  if (overlayWindow) return overlayWindow;
  // Initialize to full-screen size on the display nearest the cursor
  const cursorPoint = screen.getCursorScreenPoint();
  const display = screen.getDisplayNearestPoint(cursorPoint);
  const { width: dispWidth, height: dispHeight } = display.bounds;
  overlayWindow = new BrowserWindow({
    width: dispWidth,
    height: dispHeight,
    frame: false,
    transparent: true,
    resizable: false,
    movable: true,
    skipTaskbar: true,
    focusable: true,
    fullscreenable: false,
    alwaysOnTop: true,
    hasShadow: false,
    backgroundColor: '#00000000',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      preload: path.join(__dirname, 'overlay-preload.js'),
    },
  });

  // Keep overlay visible above full-screen apps on macOS
  try {
    overlayWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    overlayWindow.setAlwaysOnTop(true, 'screen-saver');
  } catch (_) {
    // Fallback without crashing on other platforms
    overlayWindow.setAlwaysOnTop(true);
  }

  // The overlay captures input while visible; click-through is not enabled to keep behavior simple

  const baseURL = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../build/index.html')}`;
  const overlayURL = `${baseURL}${baseURL.startsWith('file://') ? '?' : '?'}view=overlay`;
  overlayWindow.loadURL(overlayURL);

  positionOverlay();

  // Hide on blur to act like a pill/Spotlight
  overlayWindow.on('blur', () => {
    if (!overlayWindow) return;
    overlayWindow.hide();
  });

  // Hide on Esc from overlay window
  overlayWindow.webContents.on('before-input-event', (_event, input) => {
    if (input.key && input.key.toLowerCase() === 'escape') {
      overlayWindow?.hide();
    }
  });

  return overlayWindow;
}

function ensureMicOverlayWindow() {
  if (micOverlayWindow) return micOverlayWindow;

  const baseURL = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../build/index.html')}`;

  micOverlayWindow = new BrowserWindow({
    width: 440,
    height: 260,
    frame: false,
    transparent: true,
    resizable: false,
    movable: false,
    skipTaskbar: true,
    focusable: false,
    fullscreenable: false,
    alwaysOnTop: true,
    hasShadow: false,
    show: false,
    backgroundColor: '#00000000',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      preload: path.join(__dirname, 'overlay-preload.js'),
    },
  });

  try {
    micOverlayWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    micOverlayWindow.setAlwaysOnTop(true, 'screen-saver');
  } catch (_) {
    micOverlayWindow.setAlwaysOnTop(true);
  }

  const micURL = `${baseURL}${baseURL.startsWith('file://') ? '?' : '?'}view=mic-overlay`;
  micOverlayWindow.loadURL(micURL);

  micOverlayWindow.on('closed', () => {
    micOverlayWindow = null;
  });

  return micOverlayWindow;
}

function positionMicOverlayWindow() {
  if (!micOverlayWindow) return;
  const cursorPoint = screen.getCursorScreenPoint();
  const display = screen.getDisplayNearestPoint(cursorPoint);
  const { x, y, width, height } = display.workArea;
  const { width: winW, height: winH } = micOverlayWindow.getBounds();
  const posX = Math.round(x + (width - winW) / 2);
  const posY = Math.round(y + (height - winH) / 2);
  micOverlayWindow.setBounds({ x: posX, y: posY, width: winW, height: winH });
}

function showMicOverlayWindow() {
  const win = ensureMicOverlayWindow();
  if (!win) return;
  clearTimeout(micOverlayHideTimeout);
  positionMicOverlayWindow();
  if (typeof win.showInactive === 'function') {
    win.showInactive();
  } else {
    win.show();
  }
}

function hideMicOverlayWindow() {
  clearTimeout(micOverlayHideTimeout);
  if (micOverlayWindow && micOverlayWindow.isVisible()) {
    micOverlayWindow.hide();
  }
}

function scheduleMicOverlayHide(delayMs = 0) {
  clearTimeout(micOverlayHideTimeout);
  if (delayMs <= 0) {
    hideMicOverlayWindow();
    return;
  }
  micOverlayHideTimeout = setTimeout(() => {
    hideMicOverlayWindow();
  }, delayMs);
}

function broadcastMicEvent(channel, payload) {
  try { overlayWindow?.webContents.send(channel, payload) } catch (_) {}
  try { micOverlayWindow?.webContents.send(channel, payload) } catch (_) {}
}

ipcMain.handle('overlay:capture', async () => {
  try {
    const imgBuffer = await screenshot({ format: 'png' })
    return `data:image/png;base64,${imgBuffer.toString('base64')}`
  } catch (e) {
    console.error('overlay:capture error', e)
    const msg = e && e.message ? e.message : String(e)
    throw new Error(msg)
  }
})

// Mic IPC: start/stop a Python speech cycle process from elevenlabs_module
ipcMain.handle('mic:start', async () => {
  try {
    if (micProc) {
      return { ok: false, error: 'mic already running' }
    }
    // Resolve script path relative to repo root (app.asar unpack not required during dev)
    const repoRoot = path.resolve(__dirname, '..')
    const scriptPath = path.resolve(repoRoot, '..', 'elevenlabs_module', 'sts', 'hotkey_runner.py')

    // Prefer system python; optionally respect PYTHON env
    const pyExec = process.env.PYTHON || 'python3'
    micProc = spawn(pyExec, [scriptPath], {
      cwd: path.resolve(repoRoot, '..'),
      env: { ...process.env, HOTKEY_RUNNER_MODE: 'overlay' },
      stdio: ['ignore', 'pipe', 'pipe']
    })

    showMicOverlayWindow()

    const publish = (message) => {
      if (message && message.recording) {
        showMicOverlayWindow()
        clearTimeout(micOverlayHideTimeout)
      }
      broadcastMicEvent('mic:status', message)
    }

    // Accumulate stdout and try to parse JSON results from overlay mode
    let stdoutBuf = ''
    micProc.stdout.on('data', (d) => {
      const text = d.toString()
      stdoutBuf += text
      // Handle possibly multiple lines per chunk
      const lines = stdoutBuf.split(/\r?\n/)
      // Keep the last partial line in the buffer
      stdoutBuf = lines.pop() || ''
      for (const line of lines) {
        const trimmed = (line || '').trim()
        if (!trimmed) continue
        // Try to parse structured result from Python overlay mode
        let parsed = null
        if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
          try { parsed = JSON.parse(trimmed) } catch (_) { /* fallthrough */ }
        }
        if (parsed && typeof parsed === 'object') {
          showMicOverlayWindow()
          broadcastMicEvent('mic:response', parsed)
          scheduleMicOverlayHide(6000)
        } else {
          let message = trimmed
          let recordingFlag = true
          if (trimmed.startsWith('[overlay]')) {
            const payload = trimmed.replace('[overlay]', '').trim()
            if (payload === 'recording') {
              message = 'Listening…'
              recordingFlag = true
            } else if (payload === 'no-audio') {
              message = 'No speech detected.'
              recordingFlag = false
            } else if (payload === 'empty-response') {
              message = 'No assistant response.'
              recordingFlag = false
            } else if (payload.startsWith('error')) {
              message = payload.replace(/^error[:\s]*/i, '') || 'Microphone flow error.'
              recordingFlag = false
            } else {
              message = payload
            }
          }
          publish({ recording: recordingFlag, message })
          if (!recordingFlag) {
            scheduleMicOverlayHide(3500)
          }
        }
      }
    })
    micProc.stderr.on('data', (d) => publish({ recording: true, message: d.toString() }))
    micProc.on('exit', (code, signal) => {
      publish({ recording: false, message: `mic exited (${code ?? ''} ${signal ?? ''})` })
      scheduleMicOverlayHide(1500)
      micProc = null
    })

    publish({ recording: true, message: 'mic started' })
    return { ok: true }
  } catch (e) {
    scheduleMicOverlayHide(0)
    micProc = null
    return { ok: false, error: e && e.message ? e.message : String(e) }
  }
})

ipcMain.handle('mic:stop', async () => {
  try {
    if (!micProc) return { ok: true }
    // Politely terminate; fall back to kill if needed
    let done = false
    return await new Promise((resolve) => {
      const publish = (msg) => { broadcastMicEvent('mic:status', msg) }
      micProc.once('exit', () => {
        publish({ recording: false, message: 'mic stopped' });
        scheduleMicOverlayHide(1200)
        done = true;
        micProc = null;
        resolve({ ok: true })
      })
      try { process.platform === 'win32' ? micProc.kill() : micProc.kill('SIGTERM') } catch (_) {}
      setTimeout(() => {
        if (!done && micProc) {
          try { micProc.kill('SIGKILL') } catch (_) {}
          micProc = null;
          scheduleMicOverlayHide(1200)
          resolve({ ok: true })
        }
      }, 1500)
    })
  } catch (e) {
    scheduleMicOverlayHide(0)
    micProc = null
    return { ok: false, error: e && e.message ? e.message : String(e) }
  }
})

function toggleOverlay() {
  if (!overlayWindow) createOverlayWindow();
  if (!overlayWindow) return;
  if (overlayWindow.isVisible()) {
    overlayWindow.hide();
  } else {
    positionOverlay();
    overlayWindow.show();
    overlayWindow.focus();
  }
}

function showDashboard() {
  if (!mainWindow) return;
  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.show();
  mainWindow.focus();
}

function createTray() {
  const iconPath = isDev
    ? path.join(__dirname, 'assets', 'icon.png')
    : path.join(process.resourcesPath || __dirname, 'assets', 'icon.png');
  let img = nativeImage.createFromPath(iconPath);
  if (process.platform === 'darwin') {
    const size = 18; // Typical menu bar icon size on macOS
    img = img.resize({ width: size, height: size, quality: 'best' });
  }
  try {
    img.setTemplateImage(true); // macOS auto-invert for menu bar
  } catch (_) {
    // ignore if unsupported
  }
  tray = new Tray(img);
  tray.setToolTip('Stormhacks App');

  const buildMenu = () => Menu.buildFromTemplate([
    { label: 'Start session', click: () => { /* open for any use */ } },
    { label: 'Take a break', click: () => { /* open for any use */ } },
    { label: 'Stop session', click: () => { /* open for any use */ } },
    { type: 'separator' },
    { label: 'Show dashboard', click: () => showDashboard() },
    { type: 'separator' },
    { label: 'Quit', role: 'quit' },
  ]);

  tray.setContextMenu(buildMenu());
  tray.on('click', () => {
    // Pop menu on click for convenience
    tray.popUpContextMenu();
  });
}

app.on('ready', () => {
  createWindow();
  createTray();
  // Register Cmd+\\ on mac and Ctrl+\\ on other platforms
  try {
    globalShortcut.register(process.platform === 'darwin' ? 'Command+\\' : 'CommandOrControl+\\', toggleOverlay);
  } catch (e) {
    // If registration fails, continue app without shortcut
    console.error('Failed to register global shortcut for overlay:', e);
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

app.on('will-quit', () => {
  try { globalShortcut.unregisterAll(); } catch (_) {}
});
