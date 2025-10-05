from elevenlabs import ElevenLabs
import os
from pydub import AudioSegment
from pydub.playback import play
import io

# Initialize ElevenLabs client with API key
client = ElevenLabs(api_key=os.getenv("ELEVENLABS_API_KEY"))

def speak_text(text: str, voice: str = "Charlotte"):
    """
    Generate speech using ElevenLabs new client API and play it.
    """
    # Generate audio using the new SDK format
    response = client.text_to_speech.convert(
        voice_id=voice,
        model_id="eleven_multilingual_v2",
        text=text,
        output_format="mp3_44100_128",
    )

    # Convert byte stream to playable audio
    audio_bytes = b"".join(chunk for chunk in response)
    audio = AudioSegment.from_file(io.BytesIO(audio_bytes), format="mp3")
    play(audio)
