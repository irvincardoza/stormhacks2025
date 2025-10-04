from google import genai
import os

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY not found in environment (.env).")

client = genai.Client(api_key=api_key)

def analyze_image(image_path: str, prompt: str) -> str:
    with open(image_path, "rb") as f:
        image_data = f.read()

    resp = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=[{
            "role": "user",
            "parts": [
                {"text": prompt},
                {"inline_data": {"mime_type": "image/png", "data": image_data}}
            ]
        }]
    )
    return resp.text
