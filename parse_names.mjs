import fs from 'fs';

const FILE_PATH = 'c:/Users/jazex/Documents/Antigravity/BloodBowlManager/Name_players.md';
const content = fs.readFileSync(FILE_PATH, 'utf-8');

const RACES = [
    "AMAZONAS", "ORCOS", "HUMANOS", "SKAVENS", "ENANOS", 
    "ELFOS OSCUROS", "ELFOS SILVANOS", "UNIÓN ÉLFICA", "ALTOS ELFOS", 
    "ELEGIDOS DEL CAOS", "NURGLE", "KHORNE", "RENEGADOS DEL CAOS", 
    "NO MUERTOS", "HORROR NECROMÁNTICO", "REYES DE LA TUMBA", 
    "VAMPIROS", "HOMBRES LAGARTO", "NÓRDICOS", "OGROS", 
    "HALFLINGS", "GOBLINS", "SNOTLINGS", "HABITANTES DEL INFRAMUNDO", 
    "ALIANZA DEL VIEJO MUNDO", "ORCOS NEGROS", "NOBLEZA IMPERIAL", 
    "SLANN", "ENANOS DEL CAOS"
].sort((a, b) => b.length - a.length); // IMPORTANT: longer names first

const raceRegex = new RegExp(`(\\d+)\\.\\s+(${RACES.join('|')})`, 'g');
const raceStarts = [];
let match;
while ((match = raceRegex.exec(content)) !== null) {
    raceStarts.push({
        num: parseInt(match[1]),
        name: match[2],
        index: match.index
    });
}

const raceData = {};
for (let i = 0; i < raceStarts.length; i++) {
    const start = raceStarts[i].index;
    const end = raceStarts[i + 1] ? raceStarts[i+1].index : content.length;
    let section = content.slice(start, end);
    
    // Header can be something like "1. AMAZONAS (AMAZONS)"
    const headerMatch = section.match(/^\d+\.\s+[A-Z\sÑÁÉÍÓÚ]+(?:\s+\([^)]+\))?/);
    if (headerMatch) {
      section = section.slice(headerMatch[0].length);
    }
    
    // Clean names
    const names = section.split(',').map(n => {
        let name = n.replace(/^\s*\d+\.\s*/, '').trim();
        // Remove leading (EN_NAME) if it's there (sometimes the header part is messy)
        name = name.replace(/^\([^)]+\)/, '').trim();
        return name;
    }).filter(n => n.length > 0 && n.length < 100);

    if (names.length > 0) {
        names[names.length - 1] = names[names.length - 1].replace(/\.+$/, '');
    }
    
    raceData[raceStarts[i].name] = names;
}

fs.writeFileSync('c:/Users/jazex/Documents/Antigravity/BloodBowlManager/name_players_parsed.json', JSON.stringify(raceData, null, 2));
console.log('Successfully parsed', Object.keys(raceData).length, 'races');
