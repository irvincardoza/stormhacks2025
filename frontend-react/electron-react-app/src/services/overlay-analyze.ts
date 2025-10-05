/**
 * overlay-analyze.ts
 * Helpers to capture a screenshot via the overlay preload and post it with a prompt.
 */

const API_BASE = process.env.REACT_APP_API_BASE || 'http://127.0.0.1:8000'

export type OverlayAssistResponse = {
  reply: string
  model?: string
}

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl)
  return await res.blob()
}

export async function captureScreenshot(): Promise<Blob> {
  if (typeof window !== 'undefined' && (window as any).overlayAPI?.captureScreen) {
    const dataUrl: string = await (window as any).overlayAPI.captureScreen()
    const blob = await dataUrlToBlob(dataUrl)
    return blob
  }
  throw new Error('overlayAPI.captureScreen not available. Run inside Electron overlay window.')
}

export async function assistWithScreenshot(prompt: string): Promise<OverlayAssistResponse> {
  const blob = await captureScreenshot()
  const file = new File([blob], 'overlay_capture.png', { type: 'image/png' })

  const form = new FormData()
  form.set('prompt', prompt || '')
  form.set('screenshot', file)

  const resp = await fetch(`${API_BASE}/api/overlay-assist/`, {
    method: 'POST',
    body: form,
  })

  if (!resp.ok) {
    const text = await resp.text().catch(() => '')
    throw new Error(`Overlay assist failed: ${resp.status} ${text}`)
  }
  return (await resp.json()) as OverlayAssistResponse
}
