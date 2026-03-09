
import re
import os

def fix_keys():
    path = 'c:/Users/jazex/Documents/Antigravity/BloodBowlManager/data/starPlayers.ts'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Regex to find skillKeys arrays
    def clean_skill(s):
        s = s.strip().strip('\'"')
        # Remove bold prefixes like **Name:**
        s = re.sub(r'\*\*.*?\*\*:\s*', '', s)
        # Remove trailing/leading dots or markers from poor splitting
        s = s.replace('Stunty. ', 'Stunty').replace('. ', ', ')
        if ',' in s: # If it's still a combined string
            return [x.strip() for x in s.split(',')]
        return [s]

    def process_match(match):
        keys_str = match.group(1)
        # Handle cases like "Stunty. **Drull:** Dodge" which were poorly split
        raw_keys = [k.strip() for k in keys_str.split(',') if k.strip()]
        new_keys = []
        for rk in raw_keys:
            cleaned = clean_skill(rk)
            for ck in cleaned:
                if ck and ck not in new_keys:
                    new_keys.append(ck)
        
        # Mapping common typos also
        mapping = {
            "Might Blow": "Mighty Blow (+1)",
            "Mighty Blow": "Mighty Blow (+1)",
            "No Ball": "No Hands",
            "Nerves of Steel": "Nerves Of Steel",
            "On the Ball": "On The Ball"
        }
        final_keys = []
        for k in new_keys:
            mapped = mapping.get(k, k)
            if mapped not in final_keys:
                final_keys.append(mapped)

        return 'skillKeys": [\n      ' + ',\n      '.join([f'"{k}"' for k in final_keys]) + '\n    ]'

    new_content = re.sub(r'skillKeys":\s*\[(.*?)\]', process_match, content, flags=re.DOTALL)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Fixed skillKeys in starPlayers.ts")

if __name__ == "__main__":
    fix_keys()
