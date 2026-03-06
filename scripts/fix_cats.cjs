const fs = require('fs');
const path = 'c:/Users/jazex/Documents/Antigravity/BloodBowlManager/data/skills.ts';
let content = fs.readFileSync(path, 'utf8');

const before = {
    Agility: (content.match(/"category": "Agility"/g) || []).length,
    Strength: (content.match(/"category": "Strength"/g) || []).length,
    Passing: (content.match(/"category": "Passing"/g) || []).length,
    Mutation: (content.match(/"category": "Mutation"/g) || []).length,
    Trait: (content.match(/"category": "Trait"/g) || []).length,
};

content = content
    .replace(/"category": "Agility"/g, '"category": "Agilidad"')
    .replace(/"category": "Strength"/g, '"category": "Fuerza"')
    .replace(/"category": "Passing"/g, '"category": "Pase"')
    .replace(/"category": "Mutation"/g, '"category": "Mutaci\u00f3n"')
    .replace(/"category": "Trait"/g, '"category": "Rasgo"');

fs.writeFileSync(path, content, 'utf8');

console.log('Categories translated:');
Object.entries(before).forEach(([k, v]) => console.log('  ' + k + ' -> ' + v + ' occurrences translated'));
console.log('Done!');
