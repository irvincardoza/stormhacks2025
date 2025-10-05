/**
 * mic-control.ts
 * Renderer-safe wrapper around overlay preload mic APIs.
 */

export type MicStatus = {
  recording: boolean
  message?: string
}

const getApi = (): any => (typeof window !== 'undefined' ? (window as any).overlayAPI : undefined)

export async function startMic(): Promise<{ ok: boolean; error?: string }>
{
  try {
    const api = getApi()
    if (api?.startMic) return await api.startMic()
    return { ok: false, error: 'overlayAPI.startMic unavailable' }
  } catch (e: any) {
    return { ok: false, error: e?.message || 'startMic failed' }
  }
}

export async function stopMic(): Promise<{ ok: boolean; error?: string }>
{
  try {
    const api = getApi()
    if (api?.stopMic) return await api.stopMic()
    return { ok: false, error: 'overlayAPI.stopMic unavailable' }
  } catch (e: any) {
    return { ok: false, error: e?.message || 'stopMic failed' }
  }
}

export function subscribeMicStatus(listener: (s: MicStatus) => void): () => void {
  const api = getApi()
  if (api?.onMicStatus) {
    return api.onMicStatus((payload: MicStatus) => listener(payload))
  }
  // no-op unsubscribe
  return () => {}
}


