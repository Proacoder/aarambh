import requests
import json

API_KEY = "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"
url = "https://integrate.api.nvidia.com/v1/chat/completions"

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

# Test models: meta/llama-3.1-70b-instruct, meta/llama-3.3-70b-instruct, mistralai/mixtral-8x7b-instruct-v0.1
test_models = [
    "meta/llama-3.1-70b-instruct",
    "meta/llama-3.3-70b-instruct",
    "mistralai/mixtral-8x7b-instruct-v0.1",
    "nvidia/llama-3.1-nemotron-70b-instruct"
]

for model in test_models:
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": "You are Mitra, an empathetic Marathi career counselor. Reply in pure Marathi."},
            {"role": "user", "content": "१०वी नंतर सायन्स की डिप्लोमा काय चांगलं आहे?"}
        ],
        "temperature": 0.5,
        "max_tokens": 200
    }
    try:
        print(f"Testing model: {model}...")
        r = requests.post(url, headers=headers, json=payload, timeout=10)
        print(f"Status Code: {r.status_code}")
        if r.status_code == 200:
            res_data = r.json()
            reply = res_data["choices"][0]["message"]["content"]
            print(f"SUCCESS with model {model}!")
            print(f"Response: {reply[:150]}...")
            break
        else:
            print(f"Error: {r.text}")
    except Exception as e:
        print(f"Exception for {model}: {e}")
