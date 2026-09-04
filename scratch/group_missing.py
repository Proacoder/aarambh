import json, sys
sys.stdout.reconfigure(encoding='utf-8')

with open('scratch/missing_keys_dump.json', encoding='utf-8') as f:
    d = json.load(f)
by_file = {}
for k, (f, text) in d.items():
    by_file.setdefault(f, []).append((k, text))
for f, items in sorted(by_file.items()):
    print(f'=== {f} ({len(items)} missing keys) ===')
    for k, text in items[:5]:
        print(f'  {k}: "{text[:40]}"')
