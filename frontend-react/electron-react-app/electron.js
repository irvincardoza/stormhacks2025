// electron.js
const { app, BrowserWindow, Tray, Menu, globalShortcut, screen, nativeImage, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const screenshot = require('screenshot-desktop');

let mainWindow;
let overlayWindow;
let tray;

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
