import os, re

files_to_process = [
    "./static/js/onboarding.js",
    "./static/js/assessment.js",
    "./static/js/careerverse.js",
    "./templates/index.html",
    "./templates/base.html",
    "./templates/kiosk.html",
    "./templates/careerverse.html",
    "./templates/login.html",
    "./templates/dashboard.html",
    "./templates/resume_builder.html",
    "./templates/parent_mode.html",
    "./templates/skill_quest.html",
    "./templates/assessment.html",
    "./templates/career_dna.html",
    "./templates/onboarding.html"
]

def resolve_file(filepath):
    if not os.path.exists(filepath):
        return
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    if "<<<<<<<" not in content:
        return

    # Regex for conflict markers
    pattern = re.compile(r'<<<<<<< HEAD\n(.*?>?)\n=======\n(.*?)\n>>>>>>> [^\n]+', re.DOTALL)

    def replacer(match):
        head = match.group(1)
        nishad = match.group(2)
        
        # If nishad contains data-i18n or translation attributes, prefer nishad if it has more details or is longer
        if "data-i18n" in nishad:
            return nishad
        elif "data-i18n" in head:
            return head
        elif len(nishad.strip()) > len(head.strip()):
            return nishad
        else:
            return head

    new_content = pattern.sub(replacer, content)
    
    # Write back
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(new_content)
    print(f"Resolved conflicts in {filepath}")

for fp in files_to_process:
    resolve_file(fp)
