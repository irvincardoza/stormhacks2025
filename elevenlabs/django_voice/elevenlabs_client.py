import os
import requests
from pathlib import Path

ELEVEN_API_KEY = os.getenv('ELEVENLABS_API_KEY') or os.getenv('ELEVENLABS_API_KEY')  # env name guidance
ELEVEN_BASE = "https://api.elevenlabs.io/v1"

# Simple synchronous TTS: text -> audio bytes
def synthesize_text_to_file(text: str, voice_id: str = "alloy", out_path: str = None) -> str:
    """
    Synthesize text using ElevenLabs REST endpoint and save to out_path.
    Returns path to saved audio file.
    """
    assert ELEVEN_API_KEY, "Set ELEVENLABS_API_KEY in env"
    url = f"{ELEVEN_BASE}/text-to-speech/{voice_id}"
    headers = {
        "xi-api-key": ELEVEN_API_KEY,
        "Content-Type": "application/json"
    }
    payload = { "text": text }

    resp = requests.post(url, json=payload, headers=headers, stream=True, timeout=60)
    if resp.status_code != 200:
        raise RuntimeError(f"ElevenLabs TTS failed: {resp.status_code} {resp.text}")

    if out_path is None:
        out_path = Path("tmp") / "tts_out.wav"
    out_path = Path(out_path)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, 'wb') as f:
        for chunk in resp.iter_content(chunk_size=4096):
            if chunk:
                f.write(chunk)
    return str(out_path)

# Placeholder for websocket-based streaming (for future upgrade)
def synthesize_stream_socket(text: str, voice_id: str = "alloy"):
    """
    Advanced: implement WebSocket streaming for lower latency.
    Not implemented in MVP; placeholder hints go here.
    """
    raise NotImplementedError("Streaming path not implemented in MVP")
