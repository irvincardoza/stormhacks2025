const { contextBridge, ipcRenderer } = require('electron')
contextBridge.exposeInMainWorld('electronAPI', {
  onPttPressed: (cb) => ipcRenderer.on('ptt-pressed', cb),
  sendAudioBlob: (blob) => ipcRenderer.invoke('upload-audio', blob)
})

// main process handler to accept file upload via IPC
const { ipcMain } = require('electron')
const { writeFile } = require('fs/promises')
ipcMain.handle('upload-audio', async (event, arrayBuffer) => {
  // write to a temporary file and return path — but simpler: forward to server via fetch in renderer
  return { ok: true }
})
