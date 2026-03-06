const fs = require('fs');
const skillsPath = 'c:/Users/jazex/Documents/Antigravity/BloodBowlManager/data/skills.ts';
let content = fs.readFileSync(skillsPath, 'utf8');

// Rename skill entries whose name in the data file is still in English
// but the rosters now use the Spanish name. We rename the skill 'name' field.
const nameMap = {
    '"name": "Agallas"': '"name": "Agallas"', // already OK
    '"name": "Garras"': '"name": "Garras"',   // already OK
    '"name": "Bone Head"': '"name": "Cabeza de Hueso"',
    '"name": "Brawler"': '"name": "Luchador"',
    '"name": "Arm Bar"': '"name": "Palanca de Brazo"',
    '"name": "Take Root"': '"name": "Enraizarse"',
    '"name": "Throw Team-mate"': '"name": "Lanzar Compa\u00f1ero"',
    '"name": "Timmm-ber!"': '"name": "\u00a1Timmm-ber!"',
    '"name": "Animal Savagery"': '"name": "Salvajismo Animal"',
    '"name": "Prehensile Tail"': '"name": "Cola Prensil"',
    '"name": "Unchannelled Fury"': '"name": "Furia Desencadenada"',
    '"name": "Disturbing Presence"': '"name": "Presencia Perturbadora"',
    '"name": "Foul Appearance"': '"name": "Apariencia Asquerosa"',
    '"name": "Plague Ridden"': '"name": "Plagado"',
    '"name": "No Hands"': '"name": "Sin Manos"',
    '"name": "Secret Weapon"': '"name": "Arma Secreta"',
    '"name": "Ball & Chain"': '"name": "Bola y Cadena"',
    '"name": "On the Ball"': '"name": "A por el bal\u00f3n"',
    '"name": "Safe Pair of Hands"': '"name": "Manos Seguras"',
    '"name": "Dump-Off"': '"name": "Pase R\u00e1pido"',
    '"name": "Defensive"': '"name": "Defensa"',
    '"name": "Tentacles"': '"name": "Tent\u00e1culos"',
    '"name": "Trickster"': '"name": "Tramposo"',
    '"name": "Bloodlust (2+)"': '"name": "Sed de Sangre (2+)"',
    '"name": "Bloodlust (3+)"': '"name": "Sed de Sangre (3+)"',
    '"name": "Hypnotic Gaze"': '"name": "Mirada Hipn\u00f3tica"',
    '"name": "Pick-Me-Up"': '"name": "Levantarse"',
    '"name": "Iron Hard Skin"': '"name": "Piel de Hierro"',
    '"name": "Claws"': '"name": "Garras"',
    '"name": "Horns"': '"name": "Cuernos"',
    '"name": "Swarming"': '"name": "Enjambre"',
    '"name": "Swoop"': '"name": "Planeo"',
    '"name": "Decay"': '"name": "Descomposici\u00f3n"',
    '"name": "Regeneration"': '"name": "Regeneraci\u00f3n"',
};

let changed = 0;
Object.entries(nameMap).forEach(([from, to]) => {
    if (from !== to && content.includes(from)) {
        content = content.split(from).join(to);
        changed++;
        console.log('  Renamed: ' + from + ' -> ' + to);
    }
});

fs.writeFileSync(skillsPath, content, 'utf8');
console.log('Total rename operations: ' + changed);
