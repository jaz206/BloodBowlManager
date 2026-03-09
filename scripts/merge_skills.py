import re
import json

def parse_ts_skills(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract entries using a more robust regex to handle multiple lines
    # { keyEN: "...", name: "...", category: "...", description: "..." }
    pattern = re.compile(r'\{.*?keyEN:\s*"(.*?)",\s*name:\s*"(.*?)",\s*category:\s*"(.*?)",\s*description:\s*"(.*?)"\s*\}', re.DOTALL)
    
    skills = {}
    for match in pattern.finditer(content):
        key_en, name, category, description = match.groups()
        skills[key_en] = {
            "name": name,
            "category": category,
            "description": description
        }
    return skills

def merge_and_generate(en_path, es_path, out_path):
    en_skills = parse_ts_skills(en_path)
    es_skills = parse_ts_skills(es_path)
    
    master_skills = []
    
    # Use EN as the primary list
    for key, en_data in en_skills.items():
        es_data = es_skills.get(key, {})
        
        master_entry = {
            "keyEN": key,
            "name_en": en_data["name"],
            "name_es": es_data.get("name", en_data["name"]), # Fallback to EN if missing
            "category": en_data["category"],
            "desc_en": en_data["description"],
            "desc_es": es_data.get("description", en_data["description"]) # Fallback to EN
        }
        master_skills.append(master_entry)
        
    content = "import { Skill } from '../types';\n\n"
    content += "/**\n * Master Bilingual Blood Bowl 2020 Skills Dictionary\n"
    content += " * Consolidated from skills_en.ts and skills_es.ts\n */\n"
    content += "export const skillsData: Skill[] = "
    content += json.dumps(master_skills, indent=2, ensure_ascii=False)
    content += ";\n"
    
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    return len(master_skills)

if __name__ == "__main__":
    count = merge_and_generate(
        'C:/Users/jazex/Documents/Antigravity/BloodBowlManager/data/skills_en.ts',
        'C:/Users/jazex/Documents/Antigravity/BloodBowlManager/data/skills_es.ts',
        'C:/Users/jazex/Documents/Antigravity/BloodBowlManager/data/skills.ts'
    )
    print(f"Merged {count} bilingual skills into data/skills.ts")
