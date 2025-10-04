const { app, BrowserWindow, globalShortcut, ipcMain } = require('electron')
const path = require('path')

let win
function createWindow () {
  win = new BrowserWindow({
    width: 800, height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  })
  win.loadFile('index.html')
}

app.whenReady().then(() => {
  createWindow()
  // Register global shortcut for Push-to-Talk (Ctrl+Shift+Space)
  const PTT = 'CommandOrControl+Shift+Space'
  const registered = globalShortcut.register(PTT, () => {
    // send IPC to renderer to start recording
    win.webContents.send('ptt-pressed')
  })
  if (!registered) {
    console.warn('PTT hotkey registration failed')
  }

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})
