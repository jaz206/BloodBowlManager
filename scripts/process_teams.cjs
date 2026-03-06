const fs = require('fs');
const path = require('path');

const catsDir = 'C:/tmp/bloodbowl_cats/';
const teamsFile = 'c:/Users/jazex/Documents/Antigravity/BloodBowlManager/data/teams.ts';
const imageMap = JSON.parse(fs.readFileSync('c:/tmp/image_map.json', 'utf8'));

const translations = {
    // Teams
    "Amazon": "Amazonas", "Bretonnian": "Bretonia", "Black Orc": "Orcos Negros", "Gnome": "Gnomos",
    "Chaos Dwarf": "Enanos del Caos", "Elven Union": "Unión Élfica", "Chaos Chosen": "Elegidos del Caos", "Goblin": "Goblins",
    "Dark Elf": "Elfos Oscuros", "Human": "Humanos", "Chaos Renegades": "Renegados del Caos", "Halfling": "Halflings",
    "Dwarf": "Enanos", "Imperial Nobility": "Nobleza Imperial", "Khorne": "Khorne", "Ogre": "Ogros",
    "High Elf": "Altos Elfos", "Necromantic Horror": "Horror Nigromántico", "Nurgle": "Nurgle", "Snotling": "Snotlings",
    "Lizardmen": "Hombres Lagarto", "Orc": "Orcos", "Norse": "Nórdicos", "Shambling Undead": "No Muertos",
    "Old World Alliance": "Alianza del Viejo Mundo", "Skaven": "Skaven", "Underworld Denizens": "Habitantes del Inframundo",
    "Tomb Kings": "Reyes de las Tumbas", "Wood Elf": "Elfos Silvanos", "Vampire": "Vampiros", "Slann": "Slann",

    // Positions
    "Lineman": "Línea", "Linewoman": "Línea", "Blitzer": "Placador", "Thrower": "Lanzador", "Catcher": "Receptor",
    "Runner": "Corredor", "Blocker": "Bloqueador", "Berserker": "Berserker", "Ulwerener": "Ulfwerener", "Yeti": "Yeti",
    "Skeleton": "Esqueleto", "Zombie": "Zombie", "Mummy": "Momia", "Wight": "Túmulo", "Ghoul": "Ghoul",
    "Wolf": "Lobo Solitario", "Golem": "Golem de Carne", "Wraith": "Espectro", "Beastman": "Hombre Bestia",
    "Warrior": "Guerrero", "Minotaur": "Minotauro", "Troll": "Troll", "Rat Ogre": "Rata Ogro", "Big Un": "Fortachón",
    "Noble": "Noble", "Bodyguard": "Guardaespaldas", "Standard Bearer": "Portaestandarte",

    // Skills (subset, will apply as replace)
    "Block": "Placaje", "Dodge": "Esquivar", "Sure Hands": "Manos Seguras", "Pass": "Pasar", "Catch": "Atrapar",
    "Tackle": "Placar", "Mighty Blow": "Golpe Mortífero", "Guard": "Defensa", "Stand Firm": "Mantenerse Firme",
    "Frenzy": "Furia", "Dauntless": "Agallas", "Pro": "Profesional", "Leader": "Líder", "Accurate": "Preciso",
    "Strong Arm": "Brazo Fuerte", "Sure Feet": "Pies Firmes", "Sprint": "Esprintar", "Jump Up": "Saltar",
    "Leap": "Salto", "Sidestep": "Echarse a un lado", "Diving Tackle": "Placaje de Buceo", "Diving Catch": "Recepción en Plancha",
    "Shadowing": "Marcaje", "Fend": "Apartar", "Grab": "Agarrar", "Juggernaut": "Juggernaut", "Thick Skull": "Cabeza Dura",
    "Break Tackle": "Romper Placaje", "Multiple Block": "Placaje Múltiple", "Strip Ball": "Balón Robado",
    "Wrestle": "Lucha", "Sneaky Git": "Sucio y Rastrero", "Dirty Player": "Jugador Sucio", "Kick": "Patada",
    "Nerves of Steel": "Nervios de Acero", "Right Stuff": "Buena Gente", "Stunty": "Canijo", "Regeneration": "Regeneración",
    "Always Hungry": "Siempre Hambriento", "Really Stupid": "Realmente Estúpido", "Bone-head": "Cabeza de Chorlito",
    "Wild Animal": "Animal Salvaje", "Loner": "Solitario", "Decay": "Descomposición", "Animosity": "Animosidad",
    "Titchy": "Diminuto", "Very Long Legs": "Piernas Muy Largas", "Cloud Burster": "Rompe nubes", "Cannoneer": "Cañonero"
};

const tierMap = {
    "Amazon": 1, "Bretonnian": 1, "Black Orc": 1, "Gnome": 1,
    "Chaos Dwarf": 2, "Elven Union": 2, "Chaos Chosen": 2, "Goblin": 2,
    "Dark Elf": 3, "Human": 3, "Chaos Renegades": 3, "Halfling": 3,
    "Dwarf": 4, "Imperial Nobility": 4, "Khorne": 4, "Ogre": 4,
    "High Elf": 1, "Necromantic Horror": 1, "Nurgle": 2, "Snotling": 3,
    "Lizardmen": 1, "Orc": 1, "Norse": 1, "Shambling Undead": 1,
    "Old World Alliance": 1, "Skaven": 1, "Underworld Denizens": 1,
    "Tomb Kings": 1, "Wood Elf": 1, "Vampire": 1, "Slann": 2
};

function stripTags(str) {
    if (!str) return "";
    return str.replace(/<[^>]*>?/gm, '').trim();
}

function translate(text, dict) {
    if (!text) return "";
    let res = text;
    Object.keys(dict).forEach(key => {
        const regex = new RegExp(`\\b${key}\\b`, 'g');
        res = res.replace(regex, dict[key]);
    });
    return res;
}

function normalizeCharName(name) {
    return name.replace(/&amp;/g, '&').replace(/&quot;/g, '"').trim();
}

function parseStat(val, name) {
    let s = stripTags(val);
    if (!s || s === "") return "-";
    if (["AG", "PA", "PS", "AV", "AR"].includes(name) && !s.includes('+') && s !== "-") {
        return s + "+";
    }
    return s;
}

function calculateRatings(roster) {
    let f = 0, a = 0, v = 0, ar = 0, p = 0;
    roster.forEach(pl => {
        f += parseInt(pl.stats.FU) || 0;
        let ag = parseInt(pl.stats.AG) || 5;
        a += (7 - ag);
        v += pl.stats.MV;
        let av = parseInt(pl.stats.AR) || 7;
        ar += av;
        let ps = parseInt(pl.stats.PS) || 6;
        p += (7 - ps);
    });
    const len = roster.length || 1;
    return {
        fuerza: Math.min(100, Math.round((f / len) * 20)),
        agilidad: Math.min(100, Math.round((a / len) * 20)),
        velocidad: Math.min(100, Math.round((v / len) * 12)),
        armadura: Math.min(100, Math.round((ar / len) * 10)),
        pase: Math.min(100, Math.round((p / len) * 20))
    };
}

try {
    const catFiles = fs.readdirSync(catsDir).filter(f => f.endsWith('.cat'));
    const finalTeams = [];

    catFiles.forEach(file => {
        const content = fs.readFileSync(path.join(catsDir, file), 'utf8');
        const teamNameRaw = file.replace('.cat', '').replace(' Team', '').replace('s Team', '').trim();
        const normNameForImage = teamNameRaw.toLowerCase().replace(/s$/, '').trim();

        if (normNameForImage.includes("star player") || normNameForImage.includes("freebooter") || normNameForImage.includes("college")) return;

        const profiles = {};
        const profileRegex = /<profile id="([^"]*)" name="([^"]*)"[^>]*>[\s\S]*?<characteristics>([\s\S]*?)<\/characteristics>/g;
        let pMatch;
        while ((pMatch = profileRegex.exec(content)) !== null) {
            const charSection = pMatch[3];
            const stats = {};
            const charRegex = /<characteristic name="([^"]*)"[^>]*>([\s\S]*?)<\/characteristic>/g;
            let cMatch;
            while ((cMatch = charRegex.exec(charSection)) !== null) {
                stats[normalizeCharName(cMatch[1])] = stripTags(cMatch[2]);
            }
            profiles[pMatch[1]] = { name: pMatch[2], stats };
        }

        const roster = [];
        const selectionEntries = content.match(/<selectionEntry id="[^"]*" name="[^"]*"[^>]*type="model"[\s\S]*?<\/selectionEntry>/g) || [];

        selectionEntries.forEach(block => {
            const nameMatch = block.match(/name="([^"]*)"/);
            const name = nameMatch ? nameMatch[1] : "";
            if (name.includes("Mercenary") || name.includes("Journeyman") || name.includes("Star Player")) return;

            const costMatch = block.match(/<cost[^>]*name=" TV"[^>]*value="(\d+)"/);
            const targetIdMatch = block.match(/<infoLink[^>]*targetId="([^"]*)"/);

            if (targetIdMatch && profiles[targetIdMatch[1]]) {
                const profile = profiles[targetIdMatch[1]];
                let qty = "0-16";
                const catEntryMatch = content.match(new RegExp(`<categoryEntry[^>]*name="${name.replace('[', '\\[').replace(']', '\\]')}"[\\s\\S]*?<constraint[^>]*value="(\\d+)"[^>]*type="max"`));
                if (catEntryMatch) qty = `0-${catEntryMatch[1]}`;

                roster.push({
                    qty: qty,
                    position: translate(name, translations),
                    cost: costMatch ? parseInt(costMatch[1]) : 50000,
                    stats: {
                        MV: parseInt(profile.stats.MA || profile.stats.MV) || 0,
                        FU: parseStat(profile.stats.ST || profile.stats.FU, "FU"),
                        AG: parseStat(profile.stats.AG, "AG"),
                        PS: parseStat(profile.stats.PA || profile.stats.PS, "PS"),
                        AR: parseStat(profile.stats.AV || profile.stats.AR, "AR")
                    },
                    skills: translate((profile.stats["Skills & Traits"] || profile.stats["Skills"] || "").replace(/&amp;/g, '&').replace(/&quot;/g, '"'), translations),
                    primary: stripTags(profile.stats.Primary || "").replace(/&amp;/g, '&'),
                    secondary: stripTags(profile.stats.Secondary || "").replace(/&amp;/g, '&')
                });
            }
        });

        if (roster.length > 0) {
            const tier = tierMap[teamNameRaw.replace(/s$/, '')] || tierMap[teamNameRaw] || 2;
            const img = imageMap[normNameForImage] || "https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0";

            let rCost = 50000;
            const rMatch = content.match(/name="Team Reroll"[\s\S]*?<cost[^>]*value="(\d+)"/);
            if (rMatch) rCost = parseInt(rMatch[1]);

            let sRules = "Estándar";
            const sMatch = content.match(/<selectionEntry[^>]*name="Special Rules"[\s\S]*?<entryLinks>([\s\S]*?)<\/entryLinks>/);
            if (sMatch) {
                const links = sMatch[1].match(/name="([^"]*)"/g);
                if (links) sRules = translate(links.map(l => l.match(/"([^"]*)"/)[1]).join(", "), translations);
            }

            finalTeams.push({
                name: translate(teamNameRaw, translations),
                specialRules: sRules,
                rerollCost: rCost,
                tier: tier,
                apothecary: (normNameForImage.includes("undead") || normNameForImage.includes("khemri") || normNameForImage.includes("necromantic")) ? "No" : "Sí",
                image: img,
                ratings: calculateRatings(roster),
                roster: roster
            });
        }
    });

    const tsContent = 'import type { Team } from "../types";\n\nexport const teamsData: Team[] = ' + JSON.stringify(finalTeams, null, 2) + ';\n';
    fs.writeFileSync(teamsFile, tsContent);
    process.stdout.write(`Éxito total: ${finalTeams.length} equipos sincronizados y traducidos.\n`);

} catch (e) {
    process.stderr.write('Error: ' + e.message + '\n');
}
