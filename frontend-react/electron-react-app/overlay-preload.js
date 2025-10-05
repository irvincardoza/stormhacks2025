// Preload script for the overlay window.
// Exposes a safe API to capture a full-screen PNG of the display nearest the cursor.

// Try multiple import paths for robustness across Electron versions
let electronMod
try { electronMod = require('electron') } catch (_) { electronMod = {} }
let rendererMod
try { rendererMod = require('electron/renderer') } catch (_) { rendererMod = {} }

const contextBridge = (electronMod && electronMod.contextBridge) || (rendererMod && rendererMod.contextBridge)
const ipcRenderer = (electronMod && electronMod.ipcRenderer) || (rendererMod && rendererMod.ipcRenderer)
const desktopCapturer = (electronMod && electronMod.desktopCapturer) || (rendererMod && rendererMod.desktopCapturer)

async function captureScreenDataURL() {
  try {
    if (ipcRenderer && typeof ipcRenderer.invoke === 'function') {
      const dataURL = await ipcRenderer.invoke('overlay:capture')
      if (dataURL) return dataURL
      // Fall through to try renderer-based capture for resilience
    }
    if (desktopCapturer && typeof desktopCapturer.getSources === 'function') {
      const sources = await desktopCapturer.getSources({
        types: ['screen', 'window'],
        thumbnailSize: { width: 0, height: 0 },
      })
      if (!sources || sources.length === 0) {
        throw new Error('No screen sources available')
      }
      const nonEmpty = sources.filter(s => {
        try { return !s.thumbnail.isEmpty() } catch (_) { return true }
      })
      const list = nonEmpty.length ? nonEmpty : sources
      let match = list[0]
      let maxArea = match.thumbnail.getSize().width * match.thumbnail.getSize().height
      for (const s of list) {
        const sz = s.thumbnail.getSize()
        const area = sz.width * sz.height
        if (area > maxArea) { maxArea = area; match = s }
      }
      if (match.thumbnail.isEmpty && match.thumbnail.isEmpty()) {
        throw new Error('Screen Recording permission required: thumbnails are empty')
      }
      return match.thumbnail.toDataURL()
    }
    throw new Error('No capture method available')
  } catch (err) {
    console.error('captureScreenDataURL failed:', err)
    throw err
  }
}

if (contextBridge) {
  contextBridge.exposeInMainWorld('overlayAPI', {
    captureScreen: captureScreenDataURL,
  })
} else {
  // As a last resort, attach directly (less safe, but keeps feature working if contextBridge missing)
  try { window.overlayAPI = { captureScreen: captureScreenDataURL } } catch (_) {}
}
