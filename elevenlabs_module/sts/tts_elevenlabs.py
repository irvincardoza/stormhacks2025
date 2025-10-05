from elevenlabs.client import ElevenLabs
import os
from ..config.settings import get_settings
from pydub import AudioSegment
from pydub.playback import play
import io

# Initialize ElevenLabs client with API key (supports both env var names)
_settings = get_settings()
_env_key = os.getenv("ELEVEN_API_KEY") or os.getenv("ELEVENLABS_API_KEY") or _settings.ELEVEN_API_KEY
if not _env_key:
    raise RuntimeError(
        "Missing ElevenLabs API key. Set ELEVEN_API_KEY (preferred) or ELEVENLABS_API_KEY in environment or elevenlabs_module/.env"
    )
client = ElevenLabs(api_key=_env_key)

def _resolve_voice_id(preferred: str | None) -> str:
    """Return a valid ElevenLabs voice_id.
    Order: explicit env ELEVEN_VOICE_ID -> match by name -> first available.
    """
    # 1) explicit voice id via env
    env_voice_id = os.getenv("ELEVEN_VOICE_ID")
    if env_voice_id:
        return env_voice_id

    voices = client.voices.get_all().voices
    if not voices:
        raise RuntimeError("No ElevenLabs voices available for this account.")

    # 2) try to match by provided name (case-insensitive)
    if preferred:
        for v in voices:
            try:
                if v.name.lower() == preferred.lower():
                    return v.voice_id
            except AttributeError:
                continue

    # 3) fallback to first voice
    return voices[0].voice_id

def speak_text(text: str, voice: str = "Rachel"):
    """
    Generate speech using ElevenLabs new client API and play it.
    """
    if not text or not str(text).strip():
        # Nothing meaningful to say; avoid playing placeholder or empty audio
        return
    # Generate audio using the new SDK format
    voice_id = _resolve_voice_id(voice)
    response = client.text_to_speech.convert(
        voice_id=voice_id,
        model_id="eleven_multilingual_v2",
        text=text,
        output_format="mp3_44100_128",
    )

    # Convert byte stream to playable audio
    audio_bytes = b"".join(chunk for chunk in response)
    audio = AudioSegment.from_file(io.BytesIO(audio_bytes), format="mp3")
    play(audio)
