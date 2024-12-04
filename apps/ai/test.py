import os

print(os.environ.get("DATABASE_URL_1"))

from litellm import LiteLLM

print(os.environ.get("OPENAI_API_KEY"))
client = LiteLLM(api_key="OPENAI_API_KEY", model="gpt-4o-2024-11-20")
print("LiteLLM loaded successfully!")
