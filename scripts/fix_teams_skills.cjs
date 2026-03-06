const fs = require('fs');
const path = 'c:/Users/jazex/Documents/Antigravity/BloodBowlManager/data/teams.ts';
let content = fs.readFileSync(path, 'utf8');

const mapping = {
    "Jump Up": "Saltar",
    "Hit and Run": "Pegar y Correr",
    "Loner (4+)": "Solitario (4+)",
    "Loner (3+)": "Solitario (3+)",
    "Loner (2+)": "Solitario (2+)",
    "Always Hungry": "Siempre Hambriento",
    "Throw Team-mate": "Lanzar Compañero",
    "Right Stuff": "Buena Gente",
    "Tackle": "Placaje",
    "Block": "Placar",
    "Dirty Player (+1)": "Jugador Sucio (+1)",
    "Dirty Player (+2)": "Jugador Sucio (+2)",
    "Diving Tackle": "Placaje de Buceo",
    "Strong Arm": "Brazo Fuerte",
    "Animosity": "Animosidad",
    "Frenzy": "Furia",
    "Secret Weapon": "Arma Secreta",
    "Ball & Chain": "Bola y Cadena",
    "Chainsaw": "Motosierra",
    "Bombardier": "Bombardero",
    "Take Root": "Enraizarse",
    "Brawler": "Luchador",
    "Arm Bar": "Palanca de Brazo",
    "Disturbing Presence": "Presencia Perturbadora",
    "Foul Appearance": "Apariencia Asquerosa",
    "Regeneration": "Regeneración",
    "Decay": "Descomposición",
    "Swarming": "Enjambre",
    "Swoop": "Planeo",
    "Stunty": "Canijo",
    "Titchy": "Diminuto",
    "No Hands": "Sin Manos",
    "Pick-Me-Up": "Levantarse",
    "Iron Hard Skin": "Piel de Hierro",
    "On the Ball": "A por el balón",
    "Safe Pair of Hands": "Manos Seguras",
    "Mighty Blow (+1)": "Golpe Poderoso (+1)",
    "Mighty Blow (+2)": "Golpe Poderoso (+2)",
    "Prehensile Tail": "Cola Prensil",
    "Animal Savagery": "Salvajismo Animal",
    "Unchannelled Fury": "Furia Desencadenada",
    "Projectile Vomit": "Vómito Proyectil",
    "Stab": "Puñalada",
    "Sed de Sangre": "Sed de Sangre",
    "Hypnotic Gaze": "Mirada Hipnótica",
    "Trickster": "Tramposo",
    "Side Step": "Echarse a un lado",
    "Sure Feet": "Pies Firmes",
    "Sure Hands": "Manos Seguras",
    "Sprint": "Esprintar",
    "Grab": "Agarrar",
    "Stand Firm": "Mantenerse Firme",
    "Multiple Block": "Placaje Múltiple",
    "Wrestle": "Lucha",
    "Pro": "Profesional",
    "Leader": "Líder"
};

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

let count = 0;
// We only want to replace skill strings in the skills property (CSV)
Object.entries(mapping).forEach(([eng, esp]) => {
    const escEng = escapeRegExp(eng);
    const findInList = new RegExp('([,\\s])' + escEng + '([,\\s"])', 'g');
    if (content.match(findInList)) {
        content = content.replace(findInList, '$1' + esp + '$2');
        count++;
    }
    const findSingle = new RegExp('"skills": "' + escEng + '"', 'g');
    if (content.match(findSingle)) {
        content = content.replace(findSingle, '"skills": "' + esp + '"');
        count++;
    }
    const findStart = new RegExp('"skills": "' + escEng + ', ', 'g');
    if (content.match(findStart)) {
        content = content.replace(findStart, '"skills": "' + esp + ', ');
        count++;
    }
});

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed English skills in teams.ts (' + count + ' replacements)');
