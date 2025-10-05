"""Audio capture utilities for ElevenLabs speech workflows."""

from __future__ import annotations

import queue
import threading
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

import numpy as np
import sounddevice as sd
import scipy.io.wavfile as wav


@dataclass
class RecordingSession:
    """Manage a push-to-talk recording using a sounddevice stream."""

    samplerate: int = 16000
    channels: int = 1
    dtype: str = "int16"
    debug: bool = False
    _stream: Optional[sd.InputStream] = None
    _frames: Optional[queue.Queue[np.ndarray]] = None
    _lock: threading.Lock = threading.Lock()

    def _ensure_input_device(self) -> None:
        default = sd.default.device
        if default and default[0] not in (-1, None):
            return

        devices = sd.query_devices()
        candidates = [idx for idx, dev in enumerate(devices) if dev.get("max_input_channels", 0) > 0]
        if not candidates:
            raise RuntimeError(
                "No input audio devices available. Check microphone permissions and active devices."
            )
        chosen = candidates[0]
        current_output = default[1] if default and len(default) > 1 else None
        sd.default.device = (chosen, current_output)
        if self.debug:
            info = devices[chosen]
            print(f"[DEBUG] Selected input device {chosen}: {info['name']}")

    def start(self) -> None:
        """Begin capturing audio frames."""
        with self._lock:
            if self._stream is not None:
                return
            if self.debug:
                print("[DEBUG] RecordingSession.start() invoked")
            self._ensure_input_device()
            self._frames = queue.Queue()
            self._stream = sd.InputStream(
                samplerate=self.samplerate,
                channels=self.channels,
                dtype=self.dtype,
                callback=self._callback,
                blocksize=0,
            )
            self._stream.start()

    def _callback(self, indata, frames, time, status):
        if status:
            print(f"[WARN] Recording status: {status}")
        if self.debug:
            print(f"[DEBUG] Callback received {frames} frames")
        if self._frames is not None:
            self._frames.put(indata.copy())

    def stop(self, filename: str = "user_input.wav") -> Optional[str]:
        """Stop capturing and write the collected audio to disk."""
        with self._lock:
            if self._stream is None:
                return None
            if self.debug:
                print("[DEBUG] RecordingSession.stop() invoked")
            self._stream.stop()
            self._stream.close()
            self._stream = None

        frames: list[np.ndarray] = []
        if self._frames is not None:
            while not self._frames.empty():
                frames.append(self._frames.get())

        if not frames:
            if self.debug:
                print("[DEBUG] No frames captured")
            return None

        data = np.concatenate(frames)
        wav.write(filename, self.samplerate, data)
        print(f"[INFO] Audio saved to {Path(filename).resolve()}")
        return filename


def record_audio(filename="user_input.wav", duration=5, fs=16000):
    """Legacy helper kept for backwards compatibility."""
    print(f"[INFO] Recording for {duration} seconds...")
    audio = sd.rec(int(duration * fs), samplerate=fs, channels=1, dtype="int16")
    sd.wait()
    wav.write(filename, fs, audio)
    print(f"[INFO] Audio saved to {filename}")
    return filename
