"""Simple test harness for the hotkey-triggered speech cycle."""

from __future__ import annotations

import logging
import time

try:
    from .hotkey_runner import main as run_hotkey_listener
except ImportError:  # pragma: no cover
    from hotkey_runner import main as run_hotkey_listener


def main():
    logging.basicConfig(level=logging.INFO, format="[%(levelname)s] %(message)s")
    print("Launching hotkey listener test. Use Ctrl+Shift+Space to trigger speech cycle.")
    print("Press Ctrl+C to exit. This script will idle for 5 minutes by default.")

    try:
        run_hotkey_listener()
    except KeyboardInterrupt:
        print("\nTest stopped by user.")


if __name__ == "__main__":
    main()
