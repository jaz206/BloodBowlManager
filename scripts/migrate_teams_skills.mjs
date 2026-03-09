/**
 * Migration script: Convert teams.ts from skills (ES string) → skillKeys (EN string[])
 * Run with: node scripts/migrate_teams_skills.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

// Full mapping: Spanish skill name → canonical English key
const ES_TO_EN = {
    "Placar": "Block",
    "Agallas": "Dauntless",
    "Jugador Sucio (+1)": "Dirty Player (+1)",
    "Jugador Sucio (+2)": "Dirty Player (+1)", // normalize +2 to +1 as that's the standard
    "Apartar": "Fend",
    "Furia": "Frenzy",
    "Patada": "Kick",
    "A por el balón": "Kick-Off Return",
    "Bloqueo de Pase": "Pass Block",
    "Pro": "Pro",
    "Marcaje": "Shadowing",
    "Balón Robado": "Strip Ball",
    "Manos Seguras": "Sure Hands",
    "Placaje": "Tackle",
    "Lucha": "Wrestle",
    // Agility
    "Atrapar": "Catch",
    "Defensa": "Defensive",
    "Recepción en Plancha": "Diving Catch",
    "Placaje de Buceo": "Diving Tackle",
    "Esquivar": "Dodge",
    "Levantarse": "Jump Up",
    "En pie de un salto": "Jump Up",
    "Salto": "Leap",
    "Saltar": "Leap",
    "Manos con Agarre": "Safe Pair of Hands",
    "Echarse a un lado": "Sidestep",
    "Sucio y Rastrero": "Sneaky Git",
    "Esprintar": "Sprint",
    "Pies Firmes": "Sure Feet",
    // Passing
    "Preciso": "Accurate",
    "Cañonero": "Cannoneer",
    "Rompe nubes": "Cloud Burster",
    "Rompe Nubes": "Cloud Burster",
    "Pase Rápido": "Dump-Off",
    "Fumblerooskie": "Fumblerooskie",
    "Dar y Correr": "Give and Go",
    "Hail Mary Pass": "Hail Mary Pass",
    "Líder": "Leader",
    "Nervios de Acero": "Nerves of Steel",
    "Al Acecho": "On The Ball",
    "Pasar": "Pass",
    "Pase en Carrera": "Running Pass",
    "Pase Seguro": "Safe Pass",
    // Strength
    "Palanca de Brazo": "Arm Bar",
    "Luchador": "Brawler",
    "Romper Placar": "Break Tackle",
    "Romper placaje": "Break Tackle",
    "Agarrar": "Grab",
    "Juggernaut": "Juggernaut",
    "Golpe Mortífero (+1)": "Mighty Blow (+1)",
    "Golpe Poderoso (+1)": "Mighty Blow (+1)",
    "Placaje Múltiple": "Multiple Block",
    "Piling On": "Piling On",
    "Martillo": "Pile Driver",
    "Mantenerse Firme": "Stand Firm",
    "Brazo Fuerte": "Strong Arm",
    "Cabeza Dura": "Thick Skull",
    // Mutation
    "Mano Grande": "Big Hand",
    "Garras": "Claws",
    "Presencia Perturbadora": "Disturbing Presence",
    "Brazos Extras": "Extra Arms",
    "Apariencia Asquerosa": "Foul Appearance",
    "Cuernos": "Horns",
    "Piel de Hierro": "Iron Hard Skin",
    "Boca Monstruosa": "Monstrous Mouth",
    "Cola Prensil": "Prehensile Tail",
    "Tentáculos": "Tentacles",
    "Dos Cabezas": "Two Heads",
    "Piernas Muy Largas": "Very Long Legs",
    // Traits
    "Siempre Hambriento": "Always Hungry",
    "Salvajismo Animal": "Animal Savagery",
    "Animosidad (todos los compañeros)": "Animosity (all team-mates)",
    "Animosidad (all team-mates)": "Animosity (all team-mates)",
    "Animosidad (Underworld Goblins Linemen)": "Animosity (all team-mates)",
    "Animosidad (Enanos y Halflings del equipo)": "Animosity (all team-mates)",
    "Animosidad (Enanos y Humanos del equipo)": "Animosity (all team-mates)",
    "Animosidad (Fortachones Bloqueadores)": "Animosity (all team-mates)",
    "Animosidad (Línea de Orcos)": "Animosity (all team-mates)",
    "Animosidad (Underworld Goblin Lineman)": "Animosity (all team-mates)",
    "Bola y Cadena": "Ball & Chain",
    "Sed de Sangre (2+)": "Bloodlust (2+)",
    "Sed de Sangre (3+)": "Bloodlust (3+)",
    "Bombardero": "Bombardier",
    "Cabeza de Hueso": "Bone Head",
    "Bone Head": "Bone Head",
    "Escupir Fuego": "Breathe Fire",
    "Motosierra": "Chainsaw",
    "Descomposición": "Decay",
    "Borracho": "Drunkard",
    "Drunkard": "Drunkard",
    "Favorito del Público": "Fan Favourite",
    "Pegar y Correr": "Hit and Run",
    "Mirada Hipnótica": "Hypnotic Gaze",
    "Patada Team-Mate": "Kick Team-mate",
    "Solitario (3+)": "Loner (3+)",
    "Solitario (4+)": "Loner (4+)",
    "Solitario (5+)": "Loner (5+)",
    "My Ball": "My Ball",
    "Sin Manos": "No Hands",
    "Levántame": "Pick-Me-Up",
    "Plagado": "Plague Ridden",
    "Pogo Stick": "Pogo Stick",
    "Vómito Proyectil": "Projectile Vomit",
    "Realmente Estúpido": "Really Stupid",
    "Regeneración": "Regeneration",
    "Buena Gente": "Right Stuff",
    "Arma Secreta": "Secret Weapon",
    "Puñalada": "Stab",
    "Estacas": "Stakes",
    "Canijo": "Stunty",
    "Enjambre": "Swarming",
    "Planeo": "Swoop",
    "Enraizarse": "Take Root",
    "Lanzar Compañero": "Throw Team-mate",
    "Diminuto": "Titchy",
    "Tramposo": "Trickster",
    "¡Timmm-ber!": "Throw Team-mate", // rare edge case — maps to closest equivalent
    "Furia Desencadenada": "Unchannelled Fury",
};

function mapSkills(skillsStr) {
    if (!skillsStr || skillsStr === "-") return [];
    return skillsStr.split(',').map(s => {
        const trimmed = s.trim();
        const mapped = ES_TO_EN[trimmed];
        if (!mapped) {
            console.warn(`  ⚠️  No mapping found for: "${trimmed}"`);
            return trimmed; // Leave as-is with a warning
        }
        return mapped;
    }).filter(Boolean);
}

const teamsPath = path.join(ROOT, 'data', 'teams.ts');
let content = fs.readFileSync(teamsPath, 'utf8');

let migratedCount = 0;
let notFoundSkills = new Set();

// Replace each "skills": "..." with "skillKeys": [...]
content = content.replace(/"skills":\s*"([^"]*)"/g, (match, skillStr) => {
    if (skillStr === "-" || skillStr === "") {
        migratedCount++;
        return `"skillKeys": []`;
    }
    // Check for letter-only strings (primary/secondary fields mismatched)
    if (/^[A-Z]{1,5}$/.test(skillStr.trim())) {
        return match; // Don't touch primary/secondary fields
    }
    const keys = mapSkills(skillStr);
    keys.forEach(k => {
        if (!Object.values(ES_TO_EN).includes(k)) {
            notFoundSkills.add(k);
        }
    });
    migratedCount++;
    return `"skillKeys": [${keys.map(k => `"${k}"`).join(', ')}]`;
});

fs.writeFileSync(teamsPath, content, 'utf8');

console.log(`\n✅ Migration complete! ${migratedCount} skill fields converted in teams.ts`);
if (notFoundSkills.size > 0) {
    console.log(`\n⚠️  Skills with no mapping (left as-is):\n${[...notFoundSkills].map(s => `  - ${s}`).join('\n')}`);
} else {
    console.log(`\n✅ All skills mapped successfully.`);
}
