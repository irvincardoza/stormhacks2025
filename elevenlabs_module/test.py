from dotenv import load_dotenv
import os
from elevenlabs import voices, set_api_key

# Load .env from the config folder
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "config", ".env"))

api_key = os.getenv("ELEVEN_API_KEY")
if not api_key:
    print("ELEVEN_API_KEY not found. Check your .env file path and contents.")
else:
    set_api_key(api_key)
    print(voices())