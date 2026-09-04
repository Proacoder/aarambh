import os, re, json

with open('data/translations.json', encoding='utf-8') as f:
    d = json.load(f)
keys = set(d['en'].keys())

template_usages = {}
for root, dirs, files in os.walk('templates'):
    for f in files:
        if f.endswith('.html'):
            fpath = os.path.join(root, f)
            with open(fpath, encoding='utf-8') as tf:
                content = tf.read()
            for m in re.finditer(r'data-i18n=[\'"]([^\s\'"]+)[\'"][^>]*>(.*?)</', content, re.DOTALL):
                k, text = m.group(1), m.group(2).strip()
                if k not in keys and k not in template_usages:
                    clean = re.sub(r'<[^>]+>', '', text).strip()
                    template_usages[k] = (f, clean)
            for m in re.finditer(r'data-i18n-ph=[\'"]([^\s\'"]+)[\'"][^>]*placeholder=[\'"]([^\'"]+)[\'"]', content):
                k, text = m.group(1), m.group(2).strip()
                if k not in keys and k not in template_usages:
                    template_usages[k] = (f, text)

print(f'Total missing keys to add: {len(template_usages)}')
with open('scratch/missing_keys_dump.json', 'w', encoding='utf-8') as out:
    json.dump(template_usages, out, ensure_ascii=False, indent=2)
print('Saved to scratch/missing_keys_dump.json')
