
import os
import re

def final_fix():
    star_path = 'c:/Users/jazex/Documents/Antigravity/BloodBowlManager/data/starPlayers.ts'
    teams_path = 'c:/Users/jazex/Documents/Antigravity/BloodBowlManager/data/teams.ts'
    skills_path = 'c:/Users/jazex/Documents/Antigravity/BloodBowlManager/data/skills.ts'

    # Mapping common typos also
    mapping = {
        "Nerves Of Steel": "Nerves of Steel",
        "Nerves of Steel": "Nerves of Steel",
        "On the Ball": "On The Ball",
        "On The Ball": "On The Ball",
        "Sidestep": "Side Step",
        "Side Step": "Side Step",
        "Thick Skull!": "Thick Skull",
        "Thick Skull": "Thick Skull",
        "Dirty Player": "Dirty Player (+1)",
        "Dirty Player (+1)": "Dirty Player (+1)",
        "Mighty Blow": "Mighty Blow (+1)",
        "Might Blow": "Mighty Blow (+1)",
        "Mighty Blow (+1)": "Mighty Blow (+1)",
        "Throw Team Mate": "Throw Team-mate",
        "Throw Team-mate": "Throw Team-mate",
        "No Ball": "No Hands",
        "No Hands": "No Hands",
        "Pogo": "Pogo Stick"
    }

    def fix_file(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        def replacer(match):
            keys_str = match.group(1)
            raw_keys = [k.strip().strip('\'"') for k in keys_str.split(',') if k.strip()]
            new_keys = []
            for k in raw_keys:
                # Remove bold prefixes
                k = re.sub(r'\*\*.*?\*\*:\s*', '', k)
                mapped = mapping.get(k, k)
                if mapped not in new_keys:
                    new_keys.append(mapped)
            return 'skillKeys": [\n      ' + ',\n      '.join([f'"{k}"' for k in new_keys]) + '\n    ]'

        new_content = re.sub(r'skillKeys":\s*\[(.*?)\]', replacer, content, flags=re.DOTALL)
        
        # Also handle skills string in some files
        def replacer_str(match):
            skills_str = match.group(1)
            raw = [k.strip() for k in skills_str.split(',') if k.strip()]
            new = []
            for k in raw:
                k = re.sub(r'\*\*.*?\*\*:\s*', '', k)
                mapped = mapping.get(k, k)
                if mapped not in new:
                    new.append(mapped)
            return f'"skills": "{", ".join(new)}"'

        new_content = re.sub(r'"skills":\s*"(.+?)"', replacer_str, new_content)

        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)

    fix_file(star_path)
    fix_file(teams_path)
    print("Fixed skillKeys in starPlayers.ts and teams.ts")

if __name__ == "__main__":
    final_fix()
