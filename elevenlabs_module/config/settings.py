"""
elevenlabs_module.config.settings

Single source of configuration for the standalone ElevenLabs voice component.

How to use:
    from elevenlabs_module.config.settings import get_settings
    settings = get_settings()
    print(settings.ANALYSIS_FILE_PATH)
"""

from __future__ import annotations
import os
from dataclasses import dataclass
from pathlib import Path
from typing import Dict
from dotenv import load_dotenv

# Load .env from module root (if present). This will populate ELEVEN_API_KEY etc.
# If your .env lives elsewhere, set environment variables externally or adjust this call.
load_dotenv(dotenv_path=Path(__file__).parents[1] / ".env")

# Defaults (you can override with environment variables)
DEFAULT_ANALYSIS_FILE = os.getenv("ANALYSIS_FILE_PATH", "../pyproj/1_analysis.jsonl")
DEFAULT_POLL_INTERVAL_SECONDS = int(os.getenv("POLL_INTERVAL_SECONDS", "5"))
DEFAULT_ALERT_COOLDOWN_SECONDS = int(os.getenv("ALERT_COOLDOWN_SECONDS", "180"))  # 3 minutes
DEFAULT_VOICE_NAME = os.getenv("VOICE_NAME", "alloy")  # placeholder voice name
DEFAULT_TTS_MODEL = os.getenv("TTS_MODEL", "eleven_monolingual_v1")
DEFAULT_LOG_DIR = os.getenv("LOG_DIR", "elevenlabs_module/logs")
DEFAULT_LAST_ALERT_PATH = os.getenv("LAST_ALERT_PATH", "")
DEFAULT_DECISION_LOG = os.getenv("DECISION_LOG_PATH", "")

# Message templates: you can add more variants or make them configurable via env vars.
DEFAULT_SPEECH_TEMPLATES: Dict[str, str] = {
    "friendly": "Hey — you’ve been on {app_name} ({window_title}) for a while. Looks like you lost focus. Time to get back to work!",
    "firm": "Heads up: you’ve been on {app_name} — {window_title} — and not working. Please refocus now.",
    "soft": "Quick reminder: you’re still on {window_title} in {app_name}. Let’s return to your task.",
}

@dataclass(frozen=True)
class Settings:
    # File paths
    ANALYSIS_FILE_PATH: Path
    LOG_DIR: Path
    MONITOR_LOG_PATH: Path
    DECISION_LOG_PATH: Path
    LAST_ALERT_PATH: Path

    # Polling & cooldowns
    POLL_INTERVAL_SECONDS: int
    ALERT_COOLDOWN_SECONDS: int

    # ElevenLabs / TTS
    ELEVEN_API_KEY: str | None
    VOICE_NAME: str
    TTS_MODEL: str

    # Message templates
    SPEECH_TEMPLATES: Dict[str, str]
    DEFAULT_TEMPLATE_KEY: str

    # Behavior flags
    DEBUG: bool

def _ensure_dir(path: Path) -> None:
    if not path.exists():
        path.mkdir(parents=True, exist_ok=True)

def get_settings() -> Settings:
    """
    Build and return a Settings object using environment variables (or defaults).
    Call this from other modules to get configuration.
    """
    # Resolve paths relative to repo/module root when appropriate
    analysis_path = Path(os.getenv("ANALYSIS_FILE_PATH", DEFAULT_ANALYSIS_FILE)).resolve()

    # If LOG_DIR is absolute or relative, convert and ensure it exists
    log_dir = Path(os.getenv("LOG_DIR", DEFAULT_LOG_DIR)).resolve()
    _ensure_dir(log_dir)

    # Default files inside log_dir unless explicitly set
    monitor_log = Path(os.getenv("MONITOR_LOG_PATH", log_dir / "monitor.log")).resolve()
    decision_log = Path(os.getenv("DECISION_LOG_PATH", log_dir / "decision.log")).resolve()
    last_alert_path = Path(os.getenv("LAST_ALERT_PATH", log_dir / "last_alert.json")).resolve()

    # Read API key from env (expected to be set in .env or CI)
    eleven_key = os.getenv("ELEVEN_API_KEY")  # intentionally not required here

    # Templates: allow overriding via JSON string in env (optional)
    templates_env = os.getenv("SPEECH_TEMPLATES_JSON")
    if templates_env:
        try:
            import json
            templates = json.loads(templates_env)
            # ensure it's a dict of strings
            if not isinstance(templates, dict):
                raise ValueError("SPEECH_TEMPLATES_JSON must be a JSON object")
        except Exception:
            # fallback to default if parsing fails
            templates = DEFAULT_SPEECH_TEMPLATES
    else:
        templates = DEFAULT_SPEECH_TEMPLATES

    settings = Settings(
        ANALYSIS_FILE_PATH=analysis_path,
        LOG_DIR=log_dir,
        MONITOR_LOG_PATH=monitor_log,
        DECISION_LOG_PATH=decision_log,
        LAST_ALERT_PATH=last_alert_path,
        POLL_INTERVAL_SECONDS=int(os.getenv("POLL_INTERVAL_SECONDS", DEFAULT_POLL_INTERVAL_SECONDS)),
        ALERT_COOLDOWN_SECONDS=int(os.getenv("ALERT_COOLDOWN_SECONDS", DEFAULT_ALERT_COOLDOWN_SECONDS)),
        ELEVEN_API_KEY=eleven_key,
        VOICE_NAME=os.getenv("VOICE_NAME", DEFAULT_VOICE_NAME),
        TTS_MODEL=os.getenv("TTS_MODEL", DEFAULT_TTS_MODEL),
        SPEECH_TEMPLATES=templates,
        DEFAULT_TEMPLATE_KEY=os.getenv("DEFAULT_TEMPLATE_KEY", "friendly"),
        DEBUG=os.getenv("DEBUG", "false").lower() in ("1", "true", "yes"),
    )

    return settings

# expose a module-level default settings instance for convenience
# but prefer get_settings() in other modules to allow runtime changes in tests
DEFAULTS = get_settings()
