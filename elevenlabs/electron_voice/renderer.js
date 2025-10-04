// This code runs inside index.html's renderer context. Use the exposed electronAPI for wake-up events.
let mediaRecorder
let recordedChunks = []
const MAX_RECORD_MS = 15000  // max 15s recording by default
const UPLOAD_ENDPOINT = window.VOICE_CONFIG?.uploadUrl || 'https://localhost:8000/api/voice/ingest/'

async function startRecording(){
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
  mediaRecorder = new MediaRecorder(stream)
  recordedChunks = []
  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) recordedChunks.push(e.data)
  }
  mediaRecorder.onstop = async () => {
    const blob = new Blob(recordedChunks, { type: 'audio/webm' })
    await uploadAudioBlob(blob)
  }
  mediaRecorder.start()
  // auto-stop after MAX
  setTimeout(() => { if (mediaRecorder && mediaRecorder.state === 'recording') mediaRecorder.stop() }, MAX_RECORD_MS)
}

function stopRecording(){
  if (mediaRecorder && mediaRecorder.state === 'recording') mediaRecorder.stop()
}

async function uploadAudioBlob(blob){
  const form = new FormData()
  // Encode to wav if needed; send webm works for many STT services — backend should handle
  form.append('audio_file', blob, 'ptt_audio.webm')
  const token = localStorage.getItem('auth_token') // ensure auth
  const resp = await fetch(UPLOAD_ENDPOINT, {
    method: 'POST',
    body: form,
    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
  })
  const data = await resp.json()
  // Poll for result and play TTS when ready
  if (data.id) {
    pollForTTS(data.id)
  }
}

async function pollForTTS(id) {
  const token = localStorage.getItem('auth_token')
  const statusUrl = `${UPLOAD_ENDPOINT.replace('/ingest/','/requests/')}${id}/`
  // Poll simple
  for (let i=0;i<30;i++){
    const r = await fetch(statusUrl, { headers: token ? { 'Authorization': `Bearer ${token}` } : {} })
    const j = await r.json()
    if (j.status === 'tts_done' && j.tts_audio_file) {
      // play audio
      playAudioFromUrl(j.tts_audio_file)
      return
    }
    await new Promise(res => setTimeout(res, 1000))
  }
}

function playAudioFromUrl(url) {
  const audio = new Audio(url)
  audio.play().catch(e => console.error("Audio playback failed", e))
}

// Hook PTT pressed event from main
window.electronAPI.onPttPressed(async () => {
  // start recording on press; stop recording on next press within MAX time — for simplicity we toggle
  if (!mediaRecorder || mediaRecorder.state === 'inactive') {
    startRecording()
  } else if (mediaRecorder.state === 'recording') {
    stopRecording()
  }
})
