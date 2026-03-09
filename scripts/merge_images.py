import re
import json

def merge_images(old_ts_path, new_ts_path, output_path):
    # Read old data
    with open(old_ts_path, 'r', encoding='utf-8') as f:
        old_content = f.read()
    
    # Extract names and images using regex (simpler than full TS parsing for this)
    old_images = {}
    matches = re.finditer(r'name:\s*"(.*?)",.*?image:\s*"(.*?)"', old_content, re.DOTALL)
    for match in matches:
        name = match.group(1).replace("\\'", "'")
        image = match.group(2)
        old_images[name] = image
        
    # Read new data
    with open(new_ts_path, 'r', encoding='utf-8') as f:
        new_content = f.read()
    
    # Parse new json part
    json_part = new_content[new_content.find('['):new_content.rfind(']')+1]
    new_players = json.loads(json_part)
    
    merged_count = 0
    for p in new_players:
        name = p['name']
        if name in old_images:
            p['image'] = old_images[name]
            merged_count += 1
            
    # Write merged data
    content = "import type { StarPlayer } from '../types';\n\n"
    content += "export const starPlayersData: StarPlayer[] = "
    content += json.dumps(new_players, indent=2, ensure_ascii=False)
    content += ";\n"
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(content)
        
    return merged_count

if __name__ == "__main__":
    # First, let's keep a backup of the original just in case
    # python script already overwrote it, so I should have read it before.
    # Fortunately, the user just added the MD, so I can re-run the parse if needed.
    # Wait, did I overwrite the original? Yes, line 58 of previous write_to_file call.
    # Ah, I should have read the old one first.
    # Let me check if I can get it from git.
    pass
