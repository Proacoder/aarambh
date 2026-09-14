import requests
import json

API_KEY = "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"
url = "https://integrate.api.nvidia.com/v1/models"

headers = {
    "Authorization": f"Bearer {API_KEY}"
}

try:
    r = requests.get(url, headers=headers, timeout=10)
    print("Status:", r.status_code)
    if r.status_code == 200:
        models = r.json()
        model_ids = [m["id"] for m in models.get("data", [])]
        print("Available active models count:", len(model_ids))
        print("Models:")
        for mid in model_ids[:25]:
            print(" -", mid)
    else:
        print("Error:", r.text)
except Exception as e:
    print("Exception:", e)
