const fs = require('fs');
const skillsPath = 'c:/Users/jazex/Documents/Antigravity/BloodBowlManager/data/skills.ts';
let content = fs.readFileSync(skillsPath, 'utf8');

const nameMap = {
    '"name": "Mighty Blow (+1)"': '"name": "Golpe Poderoso (+1)"',
    '"name": "Mighty Blow (+2)"': '"name": "Golpe Poderoso (+2)"',
    '"name": "Dirty Player (+1)"': '"name": "Jugador Sucio (+1)"',
    '"name": "Dirty Player (+2)"': '"name": "Jugador Sucio (+2)"',
    '"name": "Bombardier"': '"name": "Bombardero"',
    '"name": "Stab"': '"name": "Pu\u00f1alada"',
    '"name": "Cloud Burster"': '"name": "Rompe nubes"',
    '"name": "Cannoneer"': '"name": "Ca\u00f1onero"',
    '"name": "Projectile Vomit"': '"name": "V\u00f3mito Proyectil"',
};

let changed = 0;
Object.entries(nameMap).forEach(([from, to]) => {
    if (content.includes(from)) {
        content = content.split(from).join(to);
        changed++;
        console.log('  Renamed: ' + from + ' -> ' + to);
    }
});

fs.writeFileSync(skillsPath, content, 'utf8');
console.log('Total rename operations: ' + changed);
