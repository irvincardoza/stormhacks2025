# pip install mss pillow
import argparse, os, signal, sys, time, uuid
from datetime import datetime
from pathlib import Path
import mss
from PIL import Image

# --- Config / paths (no Django imports) ---
# Project root = this file's grandparent: .../pyproj
PROJ_ROOT = Path(__file__).resolve().parents[1]   # pyproj
DEFAULT_DIR = PROJ_ROOT / "screenshots"

# Allow override via env
ENV_DIR = os.getenv("SCREENSHOT_DIR")

_shutdown = False
def _sig(_s, _f):
    global _shutdown; _shutdown = True

def iso_now():
    return datetime.now().isoformat(timespec="seconds")

def save_atomic(img, target: Path):
    target.parent.mkdir(parents=True, exist_ok=True)
    tmp = target.with_suffix(target.suffix + f".{uuid.uuid4().hex}.tmp")
    try:
        img.save(tmp, "PNG")
        os.replace(tmp, target)
    finally:
        try:
            if tmp.exists(): tmp.unlink()
        except Exception:
            pass

def grab_primary():
    with mss.mss() as sct:
        mon = sct.monitors[1]
        shot = sct.grab(mon)
        return Image.frombytes("RGB", (shot.width, shot.height), shot.rgb)

def main():
    parser = argparse.ArgumentParser(description="Overwrite latest.png in screenshots dir on an interval.")
    parser.add_argument("--dir", default=str(ENV_DIR or DEFAULT_DIR), help="Output dir (default: pyproj/screenshots or $SCREENSHOT_DIR)")
    parser.add_argument("--filename", default="latest.png", help="Output filename (default: latest.png)")
    parser.add_argument("--interval", type=int, default=10, help="Seconds between captures (default: 10)")
    parser.add_argument("--quiet", action="store_true", help="Only log errors")
    args = parser.parse_args()

    out_dir = Path(args.dir).expanduser().resolve()
    target = out_dir / args.filename

    signal.signal(signal.SIGINT, _sig)
    try: signal.signal(signal.SIGTERM, _sig)
    except Exception: pass

    if not args.quiet:
        print(f"[{iso_now()}] writing to {target} every {args.interval}s")

    while not _shutdown:
        t0 = time.time()
        try:
            img = grab_primary()
            save_atomic(img, target)
            if not args.quiet:
                print(f"[{iso_now()}] updated: {target}")
        except Exception as e:
            print(f"[{iso_now()}] ERROR: {type(e).__name__}: {e}", file=sys.stderr)
        elapsed = time.time() - t0
        sleep_for = max(0, args.interval - elapsed)
        end = time.time() + sleep_for
        while not _shutdown and time.time() < end:
            time.sleep(min(0.5, end - time.time()))

    if not args.quiet:
        print(f"[{iso_now()}] shutting down")

if __name__ == "__main__":
    main()
