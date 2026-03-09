import re
import json

def parse_md_table(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # Skip header and separator
    data_lines = lines[4:]
    
    star_players = []
    
    for line in data_lines:
        line = line.strip()
        if not line or not line.startswith('|'):
            continue
            
        cells = [c.strip() for c in line.split('|')][1:-1]
        if len(cells) < 10:
            continue
            
        name = cells[0].replace('**', '').strip()
        # Handle cases like '8 & 8' for MA
        ma_match = re.search(r'\d+', cells[1])
        ma = int(ma_match.group(0)) if ma_match else 0
        st = cells[2]
        ag = cells[3]
        pa = cells[4]
        av = cells[5]
        skills = cells[6]
        cost_str = cells[7].lower().replace('k', '000').replace('.', '').replace(',', '')
        try:
            cost = int(re.sub(r'[^0-9]', '', cost_str))
        except:
            cost = 0
            
        plays_for = [p.strip() for p in cells[8].split(',')]
        special_rules = cells[9]
        
        # Handle pairs if needed (Dribl & Drull, Grak & Crumbleberry, etc)
        # For now, let's keep it simple as the TS handles them in a specific way
        # But for the bulk migration, let's just use the primary stats
        
        sp = {
            "name": name,
            "cost": cost,
            "stats": {
                "MV": ma,
                "FU": st,
                "AG": ag,
                "PS": pa,
                "AR": av
            },
            "skills": skills,
            "specialRules": special_rules,
            "playsFor": plays_for
        }
        
        star_players.append(sp)
        
    return star_players

def generate_ts(star_players, output_path):
    content = "import type { StarPlayer } from '../types';\n\n"
    content += "export const starPlayersData: StarPlayer[] = "
    content += json.dumps(star_players, indent=2, ensure_ascii=False)
    content += ";\n"
    
    # Fix some formatting issues from json.dumps (optional)
    # content = content.replace('"stats": {', 'stats: {')
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == "__main__":
    players = parse_md_table('C:/Users/jazex/Documents/Antigravity/BloodBowlManager/STar Players.md')
    generate_ts(players, 'C:/Users/jazex/Documents/Antigravity/BloodBowlManager/data/starPlayers.ts')
    print(f"Generated {len(players)} star players.")
