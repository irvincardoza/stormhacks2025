import sounddevice as sd
import scipy.io.wavfile as wav

def record_audio(filename="user_input.wav", duration=5, fs=16000):
    print(f"[INFO] Recording for {duration} seconds...")
    audio = sd.rec(int(duration * fs), samplerate=fs, channels=1, dtype='int16')
    sd.wait()
    wav.write(filename, fs, audio)
    print(f"[INFO] Audio saved to {filename}")
    return filename