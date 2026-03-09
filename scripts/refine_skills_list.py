
import os
import re
import json

def update_skills():
    path = 'c:/Users/jazex/Documents/Antigravity/BloodBowlManager/data/skills.ts'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Fix Sidestep -> Side Step
    content = content.replace('"keyEN": "Sidestep"', '"keyEN": "Side Step"')
    content = content.replace('"name_en": "Sidestep"', '"name_en": "Side Step"')

    # 2. Add missing ones
    new_traits = [
        {
            "keyEN": "Taunt",
            "name_en": "Taunt",
            "name_es": "Provocar",
            "category": "Trait",
            "desc_en": "Once per game, force an opponent to move towards and block this player.",
            "desc_es": "Una vez por partido, obliga a un oponente a moverse hacia este jugador y bloquearlo."
        },
        {
            "keyEN": "Steady Footing",
            "name_en": "Steady Footing",
            "name_es": "Pie Firme",
            "category": "Trait",
            "desc_en": "Once per game, pass a Dodge, Leap or Rush test on a 2+ regardless of modifiers.",
            "desc_es": "Una vez por partido, supera una prueba de Esquiva, Salto o A Todo Gas con un 2+ sin importar los modificadores."
        },
        {
            "keyEN": "Put the Boot In",
            "name_en": "Put the Boot In",
            "name_es": "Meter la Bota",
            "category": "Trait",
            "desc_en": "Provides bonuses when performing a Foul action.",
            "desc_es": "Proporciona bonificaciones al realizar una acción de Falta."
        }
    ]

    existing_keys = set(re.findall(r'"keyEN":\s*[\'"](.+?)[\'"]', content))
    
    # Filter out what's already there
    to_add = [t for t in new_traits if t["keyEN"] not in existing_keys]
    
    if to_add:
        end_index = content.rfind('];')
        filtered_json = ",\n  " + ",\n  ".join([json.dumps(t, indent=2, ensure_ascii=False).replace("\n", "\n  ") for t in to_add])
        content = content[:end_index].rstrip() + filtered_json + "\n];\n"

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Updated skills.ts with {len(to_add)} new traits and normalized Sidestep")

if __name__ == "__main__":
    update_skills()
