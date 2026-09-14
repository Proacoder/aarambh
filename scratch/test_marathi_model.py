import requests

API_KEY = "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"
url = "https://integrate.api.nvidia.com/v1/chat/completions"
headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

payload = {
    "model": "meta/llama-3.2-11b-vision-instruct",
    "messages": [
        {
            "role": "system",
            "content": "You are Mitra Tai (मित्र ताई), an intelligent, warm, and highly encouraging Marathi career counselor. Reply fluently in Devanagari Marathi (मराठी)."
        },
        {
            "role": "user",
            "content": "नमस्कार! मला १०वी नंतर इंजिनिअरिंग करायचं आहे, काय करू?"
        }
    ],
    "temperature": 0.6,
    "max_tokens": 300
}

r = requests.post(url, headers=headers, json=payload, timeout=15)
print("Status:", r.status_code)
if r.status_code == 200:
    reply = r.json()["choices"][0]["message"]["content"]
    print("Marathi Response from NVIDIA NIM:")
    print(reply)
else:
    print("Error:", r.text)
