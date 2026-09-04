import os, re, json

with open('data/translations.json', encoding='utf-8') as f:
    d = json.load(f)
keys = set(d['en'].keys())

used_keys = set()
used_ph_keys = set()
for root, dirs, files in os.walk('templates'):
    for f in files:
        if f.endswith('.html'):
            with open(os.path.join(root, f), encoding='utf-8') as tf:
                content = tf.read()
            found = re.findall(r'data-i18n=[\'"]([^\s\'"]+)[\'"]', content)
            used_keys.update(found)
            found_ph = re.findall(r'data-i18n-ph=[\'"]([^\s\'"]+)[\'"]', content)
            used_ph_keys.update(found_ph)

missing_from_json = (used_keys | used_ph_keys) - keys
print('Total keys used in templates:', len(used_keys | used_ph_keys))
print('Used in templates but missing from translations.json:', sorted(list(missing_from_json)))
