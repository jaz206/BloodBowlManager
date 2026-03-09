
import sys
import os
import re

def check_skills():
    skills_path = 'c:/Users/jazex/Documents/Antigravity/BloodBowlManager/data/skills.ts'
    star_players_path = 'c:/Users/jazex/Documents/Antigravity/BloodBowlManager/data/starPlayers.ts'
    teams_path = 'c:/Users/jazex/Documents/Antigravity/BloodBowlManager/data/teams.ts'

    # Extract skill keys from skills.ts
    with open(skills_path, 'r', encoding='utf-8') as f:
        skills_content = f.read()
    
    skill_keys = set(re.findall(r'"keyEN":\s*[\'"](.+?)[\'"]', skills_content))
    print(f"Loaded {len(skill_keys)} skill keys from skills.ts")

    def find_missing(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Find skillKeys: [...] arrays
        missing = set()
        matches = re.finditer(r'skillKeys":\s*\[(.*?)\]', content, re.DOTALL)
        for match in matches:
            keys_str = match.group(1)
            keys = [k.strip().strip('\'"') for k in keys_str.split(',') if k.strip()]
            for k in keys:
                if k not in skill_keys:
                    missing.add(k)
        return missing

    missing_stars = find_missing(star_players_path)
    print(f"\nMissing skills in starPlayers.ts: {missing_stars}")

    missing_teams = find_missing(teams_path)
    print(f"\nMissing skills in teams.ts: {missing_teams}")

if __name__ == "__main__":
    check_skills()
