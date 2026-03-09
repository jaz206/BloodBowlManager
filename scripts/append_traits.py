
import os

def append_traits():
    path = 'c:/Users/jazex/Documents/Antigravity/BloodBowlManager/data/skills.ts'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the end of the array
    end_index = content.rfind('];')
    if end_index == -1:
        print("Could not find end of array")
        return

    new_traits = [
        {
            "keyEN": "No Ball",
            "name_en": "No Ball",
            "name_es": "Sin Manos",
            "category": "Trait",
            "desc_en": "This player is unable to pick up, intercept or carry the ball.",
            "desc_es": "Este jugador no puede recoger, interceptar ni llevar el balón."
        },
        {
            "keyEN": "Secret Weapon",
            "name_en": "Secret Weapon",
            "name_es": "Arma Secreta",
            "category": "Trait",
            "desc_en": "Once the drive ends, this player is sent off to the Dungeon for the rest of the game.",
            "desc_es": "Una vez finalizada la entrada, este jugador es expulsado a las mazmorras por el resto del partido."
        },
        {
            "keyEN": "Timmm-ber!",
            "name_en": "Timmm-ber!",
            "name_es": "¡Meeeedra!",
            "category": "Trait",
            "desc_en": "If this player has a Strength of 5 or more and is attempting to Stand Up, they gain a +1 modifier to the 4+ roll for each adjacent standing team-mate.",
            "desc_es": "Si este jugador tiene Fuerza 5 o más e intenta Levantarse, gana un modificador de +1 a la tirada de 4+ por cada compañero adyacente que esté de pie."
        },
        {
            "keyEN": "Lone Fouler",
            "name_en": "Lone Fouler",
            "name_es": "Faltón Solitario",
            "category": "Trait",
            "desc_en": "This player is so committed to fouling that they do not require assistance to be more effective.",
            "desc_es": "Este jugador está tan comprometido con las faltas que no requiere asistencia para ser más efectivo."
        },
        {
            "keyEN": "Quick Foul",
            "name_en": "Quick Foul",
            "name_es": "Falta Rápida",
            "category": "Trait",
            "desc_en": "This player may commit a Foul action as part of a Move or Blitz action, though their activation ends immediately after.",
            "desc_es": "Este jugador puede realizar una acción de Falta como parte de un Movimiento o Blitz, aunque su activación termina inmediatamente después."
        },
        {
            "keyEN": "Bullseye",
            "name_en": "Bullseye",
            "name_es": "Ojo de Buey",
            "category": "Trait",
            "desc_en": "This player is exceptionally accurate when throwing teammates or bombs.",
            "desc_es": "Este jugador es excepcionalmente preciso al lanzar compañeros o bombas."
        },
        {
            "keyEN": "Ghostly Flames",
            "name_en": "Ghostly Flames",
            "name_es": "Llamas Espectrales",
            "category": "Trait",
            "desc_en": "A mystical aura of fire that burns opponents upon contact.",
            "desc_es": "Un aura mística de fuego que quema a los oponentes al contacto."
        },
        {
            "keyEN": "Brutal Block",
            "name_en": "Brutal Block",
            "name_es": "Bloqueo Brutal",
            "category": "Trait",
            "desc_en": "A powerful block that ignores certain defensive abilities.",
            "desc_es": "Un bloqueo poderoso que ignora ciertas habilidades defensivas."
        },
        {
            "keyEN": "Unsteady",
            "name_en": "Unsteady",
            "name_es": "Inestable",
            "category": "Trait",
            "desc_en": "This player is poorly balanced. If pushed, they always fall over.",
            "desc_es": "Este jugador tiene poco equilibrio. Si es empujado, siempre se cae."
        },
        {
            "keyEN": "Hatred (Undead)",
            "name_en": "Hatred (Undead)",
            "name_es": "Odio (No Muertos)",
            "category": "Trait",
            "desc_en": "This player gains bonuses when blocking Undead opponents.",
            "desc_es": "Este jugador gana bonificaciones al bloquear a oponentes No Muertos."
        },
        {
            "keyEN": "Hatred (Dwarf)",
            "name_en": "Hatred (Dwarf)",
            "name_es": "Odio (Enanos)",
            "category": "Trait",
            "desc_en": "This player gains bonuses when blocking Dwarf opponents.",
            "desc_es": "Este jugador gana bonificaciones al bloquear a oponentes Enanos."
        },
        {
            "keyEN": "Hatred (Big Guy)",
            "name_en": "Hatred (Big Guy)",
            "name_es": "Odio (Tipos Grandes)",
            "category": "Trait",
            "desc_en": "This player gains bonuses when blocking Big Guys.",
            "desc_es": "Este jugador gana bonificaciones al bloquear a Tipos Grandes."
        },
        {
            "keyEN": "Drunkard",
            "name_en": "Drunkard",
            "name_es": "Borracho",
            "category": "Trait",
            "desc_en": "This player suffers penalties to Rush and Dodge tests due to their intoxicated state.",
            "desc_es": "Este jugador sufre penalizaciones en las pruebas de A Todo Gas y Esquiva debido a su estado de embriaguez."
        },
        {
            "keyEN": "Monstrous Mouth",
            "name_en": "Monstrous Mouth",
            "name_es": "Boca Monstruosa",
            "category": "Mutation",
            "desc_en": "Gains the Catch skill and cannot have the ball stripped.",
            "desc_es": "Gana la habilidad Atrapar y no se le puede despojar del balón."
        },
        {
            "keyEN": "Plague Ridden",
            "name_en": "Plague Ridden",
            "name_es": "Portador de Plaga",
            "category": "Mutation",
            "desc_en": "If this player causes a casualty, you might gain a Rotter for your team.",
            "desc_es": "Si este jugador causa una baja, podrías ganar un Podrido para tu equipo."
        },
        {
            "keyEN": "Lethal Flight",
            "name_en": "Lethal Flight",
            "name_es": "Vuelo Letal",
            "category": "Trait",
            "desc_en": "If this player lands in an occupied square, they make an Armour roll against the occupant.",
            "desc_es": "Si este jugador aterriza en una casilla ocupada, realiza una tirada de Armadura contra el ocupante."
        },
        {
            "keyEN": "Bloodlust (2+)",
            "name_en": "Bloodlust (2+)",
            "name_es": "Sed de Sangre (2+)",
            "category": "Trait",
            "desc_en": "Before activating, roll 1D6. On a 1, the player must bite a teammate or suffer a turnover.",
            "desc_es": "Antes de activarse, lanza 1D6. Con un 1, el jugador debe morder a un compañero o sufrir un cambio de turno."
        }
    ]

    import json
    traits_json = ",\n".join([json.dumps(t, indent=2, ensure_ascii=False).replace("\n", "\n  ") for t in new_traits])
    
    # Check if they are already there to avoid duplicates
    existing_keys = set(re.findall(r'"keyEN":\s*[\'"](.+?)[\'"]', content))
    filtered_traits = [t for t in new_traits if t["keyEN"] not in existing_keys]
    
    if not filtered_traits:
        print("All traits already exist.")
        return

    filtered_json = ",\n".join([json.dumps(t, indent=2, ensure_ascii=False).replace("\n", "\n  ") for t in filtered_traits])
    
    new_content = content[:end_index].rstrip() + ",\n  " + filtered_json + "\n];\n"
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f"Added {len(filtered_traits)} missing traits to skills.ts")

if __name__ == "__main__":
    import re
    append_traits()
