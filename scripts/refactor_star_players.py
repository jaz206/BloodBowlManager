import re
import json
import os

def load_skills(skills_path):
    with open(skills_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract JSON array from file
    start_idx = content.find('=')
    json_part = content[content.find('[', start_idx):content.rfind(']')+1]
    skills = json.loads(json_part)
    
    mapping = {} # Name (ES or EN) -> keyEN
    for s in skills:
        key = s['keyEN']
        mapping[s['name_en'].lower()] = key
        mapping[s['name_es'].lower()] = key
        # Also handle partials or common variations if needed
        mapping[key.lower()] = key
        
    return mapping

def refactor_star_players(ts_path, skills_mapping):
    with open(ts_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    start_idx = content.find('=')
    json_part = content[content.find('[', start_idx):content.rfind(']')+1]
    players = json.loads(json_part)
    
    for p in players:
        # 1. Convert skills string to skillKeys array
        raw_skills = p.get('skills', "")
        if isinstance(raw_skills, str) and raw_skills:
            skill_names = [s.strip() for s in raw_skills.split(',')]
            keys = []
            for name in skill_names:
                # Direct check
                if name.lower() in skills_mapping:
                    keys.append(skills_mapping[name.lower()])
                else:
                    # Try to handle "Loner (X+)" variations or small typos
                    clean_name = name.lower()
                    found = False
                    for m_name, m_key in skills_mapping.items():
                        if m_name == clean_name:
                            keys.append(m_key)
                            found = True
                            break
                    if not found:
                        # Log or keep as is (likely a new trait or rare rule)
                        print(f"Warning: Skill '{name}' not found for {p['name']}")
                        keys.append(name) # Fallback to original name as key
            p['skillKeys'] = keys
            # Remove old 'skills' field
            # del p['skills'] # Keep it as @deprecated? TS says it is deprecated
        else:
            p['skillKeys'] = p.get('skillKeys', [])
            
        # 2. Convert specialRules to specialRules_es and specialRules_en
        old_rules = p.get('specialRules', "")
        p['specialRules_es'] = old_rules
        p['specialRules_en'] = old_rules # Default to same for now
        # del p['specialRules']
        
    # Write back
    new_content = "import type { StarPlayer } from '../types';\n\n"
    new_content += "export const starPlayersData: StarPlayer[] = "
    new_content += json.dumps(players, indent=2, ensure_ascii=False)
    new_content += ";\n"
    
    with open(ts_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    return len(players)

if __name__ == "__main__":
    SKILLS_FILE = 'C:/Users/jazex/Documents/Antigravity/BloodBowlManager/data/skills.ts'
    STARS_FILE = 'C:/Users/jazex/Documents/Antigravity/BloodBowlManager/data/starPlayers.ts'
    
    mapping = load_skills(SKILLS_FILE)
    count = refactor_star_players(STARS_FILE, mapping)
    print(f"Refactored {count} Star Players to new schema.")
