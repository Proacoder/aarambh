import requests

API_KEY = "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"
url = "https://integrate.api.nvidia.com/v1/chat/completions"
headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

r = requests.get("https://integrate.api.nvidia.com/v1/models", headers=headers).json()
models = [m["id"] for m in r.get("data", [])]

working_models = []

for m in models:
    try:
        resp = requests.post(
            url,
            headers=headers,
            json={
                "model": m,
                "messages": [{"role": "user", "content": "Hello"}],
                "max_tokens": 10
            },
            timeout=5
        )
        if resp.status_code == 200:
            print(f"[WORKING] {m}")
            working_models.append(m)
        else:
            # print(f"[{resp.status_code}] {m}")
            pass
    except Exception as e:
        pass

print("\nAll working models:", working_models)
