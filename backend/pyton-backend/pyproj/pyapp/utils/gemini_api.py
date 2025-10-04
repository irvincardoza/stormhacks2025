from google import genai
import os, json, mimetypes, re

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY not found in environment (.env).")

client = genai.Client(api_key=api_key)

def _force_parse_json(s: str) -> dict:
    try:
        return json.loads(s)
    except Exception:
        pass
    m = re.search(r"\{.*\}", s, flags=re.S)
    if m:
        try:
            return json.loads(m.group(0))
        except Exception:
            pass
    return {"app_name": "unknown", "window_title": "unknown", "productive": None}

def analyze_image(image_path: str, prompt: str) -> dict:
    mime, _ = mimetypes.guess_type(image_path)
    mime = mime or "image/png"

    with open(image_path, "rb") as f:
        image_data = f.read()

    structured_prompt = f"""
You are an activity classifier.
Analyze the screenshot and return ONLY a valid JSON object with EXACT keys:
- "app_name": the application/window name (e.g., Chrome, VS Code, Slack)
- "window_title": the active tab/page/title bar text (string; "unknown" if not visible)
- "productive": true if this looks like work/study/coding; false otherwise.

Example outputs:
{{"app_name":"Chrome","window_title":"YouTube - Lofi Beats","productive":false}}
{{"app_name":"VS Code","window_title":"main.py — stormhacks2025","productive":true}}

Do NOT include any explanation or extra text. Return JSON only.
Additional instruction from caller:
{prompt}
""".strip()

    resp = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=[{
            "role": "user",
            "parts": [
                {"text": structured_prompt},
                {"inline_data": {"mime_type": mime, "data": image_data}}
            ]
        }]
    )

    parsed = _force_parse_json(resp.text or "")

    # normalize/ensure keys
    return {
        "app_name": parsed.get("app_name", "unknown"),
        "window_title": parsed.get("window_title", "unknown"),
        "productive": parsed.get("productive", None),
    }
