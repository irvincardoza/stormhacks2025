import requests
import os

from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "config", ".env"))
LLM_API_URL = os.getenv("LLM_API_URL", "http://localhost:8000/api/gemini/")  # Replace with your actual endpoint

def get_llm_response(user_text, context=None):
    payload = {"user_text": user_text}
    if context:
        payload["context"] = context
    try:
        response = requests.post(LLM_API_URL, json=payload, timeout=30)
        if response.ok:
            llm_response = response.json().get("response", "")
            print(f"[LLM] Gemini response: {llm_response}")
            return llm_response
        else:
            print("[ERROR] LLM backend error:", response.text)
            return "Sorry, I couldn't get a response from the assistant."
    except Exception as e:
        print("[ERROR] Exception contacting LLM backend:", e)
        return "Sorry, there was an error contacting the assistant."