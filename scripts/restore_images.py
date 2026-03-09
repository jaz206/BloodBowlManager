import re
import json

# Recovered images mapping from turn 495 history
old_images = {
    "'Captain' Karina Von Riesz": "https://bloodbowlbase.ru/media/starplayers/CptKarinaVonRiesz1.jpg",
    "Akhorne The Squirrel": "https://www.warhammer.com/app/resources/catalog/product/threeSixty/99120999007_BloodBowlTreemanOTT1360/02-02.jpg",
    "Anqi Panqi": "https://i.redd.it/anqi-panqi-is-back-on-tabletop-v0-1nt28dkhxkqd1.png?width=1080&format=png&auto=webp&s=c58d3de9dab93388dafe3e8ddbb81754f562f832",
    "Barik Farblast": "https://www.warhammer.com/app/resources/catalog/product/920x950/99850999037_BBBarikFarblastLead.jpg?fm=webp&w=670&h=691",
    "Bilerot Vomitflesh": "https://www.warhammer.com/app/resources/catalog/product/920x950/99850999058_Bilerot1.jpg?fm=webp&w=670&h=691",
    "Boa Kon'ssstriktr": "https://bloodbowlbase.ru/media/starplayers/BBBoaKonssstriktrLead.jpg",
    "Bomber Dribblesnot": "https://bloodbowlbase.ru/media/starplayers/BomberDribblesnotLead.jpg",
    "Bryce 'The Slice' Cambuel": "https://bloodbowlbase.ru/media/starplayers/BryceSlice1.jpg",
    "Cindy Piewhistle": "https://bloodbowlbase.ru/media/starplayers/CindyPiewhistle01.jpg",
    "Count Luthor von Drakenborg": "https://bloodbowlbase.ru/media/starplayers/LuthorVonDrakenborg1.jpg",
    "Grak and Crumbleberry": "https://bloodbowlbase.ru/media/starplayers/GrakCrumbleberry11hw.jpg",
    "Deeproot Strongbranch": "https://bloodbowlbase.ru/media/starplayers/DeeprootStrongbranch01.jpg",
    "Dribl & Drull": "https://bloodbowlbase.ru/media/starplayers/DrullDrible2.jpg",
    "Eldril Sidewinder": "https://bloodbowlbase.ru/media/starplayers/BBEldrilSidewinder01.jpg",
    "Estelle La Veneaux": "https://bloodbowlbase.ru/media/starplayers/BBEstellelaVeneauxLead.jpg",
    "Frank 'n' Stein": "https://bloodbowlbase.ru/media/starplayers/FrankNSteinLead.jpg",
    "Fungus the Loon": "https://bloodbowlbase.ru/media/starplayers/FungusTheLoon.jpg",
    "Glart Smashrip": "https://bloodbowlbase.ru/media/starplayers/GlartSmashrip01.jpg",
    "Lucian and Valen Swift": "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhC_xWJ4s34hKkR7YwMh7G7k0y21X9W6iJjH_7L2D2v02oG99eF0J7X8mF3sY_G3G3e3-L9lB8b7b7kQ8-v-R2u3D7w-M3gS_L_Z7v_G5_Jg/s1600/Lucian%20and%2Valen%20Swift.jpg"
}

def merge_images(ts_path):
    with open(ts_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Skip the type declaration part StarPlayer[] to avoid matching its brackets
    start_idx = content.find('=')
    if start_idx == -1: start_idx = 0
    
    json_part = content[content.find('[', start_idx):content.rfind(']')+1]
    players = json.loads(json_part)
    
    for p in players:
        name = p['name']
        # Try exact or partial match
        if name in old_images:
            p['image'] = old_images[name]
        else:
            # Check for name without quotes etc
            clean_name = name.replace("'", "").replace("’", "").replace('"', '')
            for old_name, img in old_images.items():
                old_clean = old_name.replace("'", "").replace("’", "").replace('"', '')
                if clean_name == old_clean or clean_name in old_clean or old_clean in clean_name:
                    p['image'] = img
                    break
            
    # Write back
    new_content = "import type { StarPlayer } from '../types';\n\n"
    new_content += "export const starPlayersData: StarPlayer[] = "
    new_content += json.dumps(players, indent=2, ensure_ascii=False)
    new_content += ";\n"
    
    with open(ts_path, 'w', encoding='utf-8') as f:
        f.write(new_content)

if __name__ == "__main__":
    merge_images('C:/Users/jazex\Documents\Antigravity\BloodBowlManager/data/starPlayers.ts')
    print("Images restored.")
