import json
import re

def refactor_teams(ts_path):
    with open(ts_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    start_idx = content.find('=')
    json_part = content[content.find('[', start_idx):content.rfind(']')+1]
    teams = json.loads(json_part)
    
    for t in teams:
        old_rules = t.get('specialRules', "")
        t['specialRules_es'] = old_rules
        t['specialRules_en'] = old_rules # Default same
        # Optional: del t['specialRules']
        
    # Write back
    new_content = "import type { Team } from '../types';\n\n"
    new_content += "export const teamsData: Team[] = "
    new_content += json.dumps(teams, indent=2, ensure_ascii=False)
    new_content += ";\n"
    
    with open(ts_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    return len(teams)

if __name__ == "__main__":
    TEAMS_FILE = 'C:/Users/jazex/Documents/Antigravity/BloodBowlManager/data/teams.ts'
    count = refactor_teams(TEAMS_FILE)
    print(f"Refactored {count} Teams to new schema.")
