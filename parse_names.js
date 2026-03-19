const fs = require('fs');

const content = fs.readFileSync('c:/Users/jazex/Documents/Antigravity/BloodBowlManager/Name_players.md', 'utf-8');

// The races seem to be formatted as X. RACE (EN_RACE) or X. RACE
// Let's use a regex to find all race starts and their positions
const raceStarts = [];
const raceRegex = /(\d+)\.\s+([A-Z\sÑÁÉÍÓÚ]+)(?:\s+\(([^)]+)\))?/g;
let match;

while ((match = raceRegex.exec(content)) !== null) {
    // Only count as race if the index is sequential and it's uppercase
    // But since they are all one after another, it's easier to verify 
    // the structure of the surrounding text if needed.
    // Actually, looking at the content, races are the only things that match
    // N. UPPERCASE (UPPERCASE) or N. UPPERCASE followed by names.
    // But the names also use N. 
    // Wait! Inside Amazonas we have "1. Penthesilea, 2. Myrina".
    // No, wait, in view_file it was "Penthesilea, 2. Myrina".
    // So the FIRST name doesn't have a number, or it does?
    // "1. AMAZONAS (AMAZONS)Penthesilea, 2. Myrina" - No 1. for Penthesilea.
    
    // BUT! Look at Orcos: "2. ORCOS (ORCS)Grak, 2. Varag"
    // So the numbers inside names repeat from 2.
    
    raceStarts.push({
        num: parseInt(match[1]),
        nameEs: match[2].trim(),
        nameEn: match[3]?.trim(),
        index: match.index
    });
}

// Filter out those that are not actually race headers (they should be sequential 1..29)
// but the number 2. in "2. Varag" will match.
// However, the race headers have (UPPERCASE) or are all uppercase.
// Names like "Varag" are capitalized but not all uppercase.
const actualRaces = raceStarts.filter(r => {
    // Race headers are sequential 1, 2, 3...
    // and they are usually uppercase.
    return r.nameEs === r.nameEs.toUpperCase();
});

// Refine: only keep the first occurrence of each sequential number 1..29
const finalRaces = [];
let nextNum = 1;
for (const r of actualRaces) {
    if (r.num === nextNum) {
        finalRaces.push(r);
        nextNum++;
    }
}

const raceData = {};
for (let i = 0; i < finalRaces.length; i++) {
    const start = finalRaces[i].index;
    const end = finalRaces[i+1] ? finalRaces[i+1].index : content.length;
    let section = content.slice(start, end);
    
    // Remove the header: N. RACE (EN_RACE)
    const headerMatch = section.match(/^\d+\.\s+[A-Z\sÑÁÉÍÓÚ]+(?:\s+\(([^)]+)\))?/);
    if (headerMatch) {
        section = section.slice(headerMatch[0].length);
    }
    
    // Clean names: split by comma, remove numbers
    const names = section.split(/,?\s*\d+\.\s*/).map(n => n.trim()).filter(n => n.length > 0 && n.length < 50);
    // Remove trailing dot if it's the last one
    if (names.length > 0) {
        names[names.length-1] = names[names.length-1].replace(/\.$/, '');
    }
    
    const es = finalRaces[i].nameEs;
    const en = finalRaces[i].nameEn || es;
    
    raceData[es] = names;
    if (en !== es) raceData[en] = names;
}

fs.writeFileSync('c:/Users/jazex/Documents/Antigravity/BloodBowlManager/name_players_parsed.json', JSON.stringify(raceData, null, 2));
console.log('Parsed races:', finalRaces.length);
