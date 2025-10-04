# pip install mss pillow requests
import argparse, os, signal, sys, time, uuid
from datetime import datetime
from pathlib import Path

import mss
from PIL import Image
import requests

# ---- Config ----
# Point to your Django endpoint (adjust host/port/path)
API_URL = os.getenv("ANALYZE_API_URL", "http://127.0.0.1:8000/api/analyze/")  # your analyze_screenshot view
API_PROMPT = os.getenv("ANALYZE_PROMPT", "Classify this screenshot by activity type")

# If you have auth, set an env var like AUTH_TOKEN and uncomment headers below
AUTH_TOKEN = os.getenv("AUTH_TOKEN", "")

_shutdown = False
def _sig(_s, _f): 
    global _shutdown; _shutdown = True

def iso_now(): 
    return datetime.now().isoformat(timespec="seconds")

def save_atomic(img: Image.Image, target: Path):
    target.parent.mkdir(parents=True, exist_ok=True)
    tmp = target.with_suffix(target.suffix + f".{uuid.uuid4().hex}.tmp")
    try:
        img.save(tmp, "PNG")
        os.replace(tmp, target)  # atomic
    finally:
        try:
            if tmp.exists(): tmp.unlink()
        except Exception:
            pass

def grab_primary() -> Image.Image:
    with mss.mss() as sct:
        mon = sct.monitors[1]
        shot = sct.grab(mon)
        return Image.frombytes("RGB", (shot.width, shot.height), shot.rgb)

def post_to_view(png_path: Path):
    # Read after atomic replace -> fully written
    data = {"prompt": API_PROMPT}
    files = {"screenshot": (png_path.name, png_path.read_bytes(), "image/png")}
    headers = {}
    if AUTH_TOKEN:
        headers["Authorization"] = f"Bearer {AUTH_TOKEN}"
    r = requests.post(API_URL, data=data, files=files, headers=headers, timeout=20)
    r.raise_for_status()
    return r.json()

def main():
    parser = argparse.ArgumentParser(description="Capture -> save latest.png -> POST to Django analyze view.")
    parser.add_argument("--dir", default=str(Path(__file__).resolve().parents[1] / "screenshots"),
                        help="Output dir for latest.png (default: ../pyproj/screenshots)")
    parser.add_argument("--filename", default="latest.png", help="Output filename (default: latest.png)")
    parser.add_argument("--interval", type=int, default=30, help="Seconds between captures (default: 10 for testing)")
    parser.add_argument("--quiet", action="store_true", help="Only log errors")
    args = parser.parse_args()

    out_dir = Path(args.dir).expanduser().resolve()
    target = out_dir / args.filename

    signal.signal(signal.SIGINT, _sig)
    try: signal.signal(signal.SIGTERM, _sig)
    except: pass

    if not args.quiet:
        print(f"[{iso_now()}] writing to {target} every {args.interval}s and POSTing to {API_URL}")

    while not _shutdown:
        t0 = time.time()
        try:
            # 1) capture & save
            img = grab_primary()
            save_atomic(img, target)
            if not args.quiet:
                print(f"[{iso_now()}] updated: {target}")

            # 2) POST to your view
            resp = post_to_view(target)
            if not args.quiet:
                print(f"[{iso_now()}] analyze response: {str(resp)[:160]}")
        except Exception as e:
            print(f"[{iso_now()}] ERROR: {type(e).__name__}: {e}", file=sys.stderr)

        # keep stable cadence
        elapsed = time.time() - t0
        sleep_for = max(0, args.interval - elapsed)
        end = time.time() + sleep_for
        while not _shutdown and time.time() < end:
            time.sleep(min(0.5, end - time.time()))

    if not args.quiet:
        print(f"[{iso_now()}] shutting down")

if __name__ == "__main__":
    main()
