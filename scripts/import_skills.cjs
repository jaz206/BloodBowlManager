const fs = require('fs');
const path = require('path');

const xmlPath = 'C:/tmp/bloodbowl_gst/Blood Bowl.gst';
process.stdout.write('Iniciando importacion con categorias...\n');

try {
    const content = fs.readFileSync(xmlPath, 'utf8');
    process.stdout.write('Archivo leido: ' + content.length + '\n');

    const rulesMatch = content.match(/<sharedRules>([\s\S]*?)<\/sharedRules>/);
    if (!rulesMatch) {
        process.stderr.write('No se encontro sharedRules\n');
        process.exit(1);
    }

    const rulesSection = rulesMatch[1];
    const ruleRegex = /<rule[^>]*name="([^"]*)"[^>]*>[\s\S]*?<description>([\s\S]*?)<\/description>/g;

    const agility = ["Catch", "Diving Catch", "Diving Tackle", "Dodge", "Jump Up", "Leap", "Safe Pair of Hands", "Sidestep", "Sneaky Git", "Sure Feet"];
    const strength = ["Arm Bar", "Brawler", "Break Tackle", "Grab", "Guard", "Juggernaut", "Mighty Blow (+1)", "Mighty Blow (+2)", "Multiple Block", "Pile Driver", "Stand Firm", "Thick Skull"];
    const passing = ["Accurate", "Cannoneer", "Cloud Burster", "Dump-Off", "Fumblerooskie", "Hail Mary Pass", "Leader", "Nerves of Steel", "On the Ball", "Pass", "Running Pass", "Safe Pass"];
    const general = ["Block", "Dauntless", "Dirty Player (+1)", "Dirty Player (+2)", "Fend", "Frenzy", "Kick", "Pro", "Shadowing", "Strip Ball", "Sure Hands", "Tackle", "Wrestle"];
    const mutation = ["Big Hand", "Claws", "Disturbing Presence", "Extra Arms", "Foul Appearance", "Iron Hard Skin", "Monstrous Mouth", "Prehensile Tail", "Tentacles", "Two Heads", "Very Long Legs"];

    const skills = [];
    let match;

    while ((match = ruleRegex.exec(rulesSection)) !== null) {
        let name = match[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&');
        let description = match[2]
            .replace(/&quot;/g, '"')
            .replace(/&amp;/g, '&')
            .replace(/&#10;/g, '\n')
            .replace(/&apos;/g, "'")
            .replace(/<.*?>/g, '')
            .trim();

        let category = "Trait";
        if (agility.includes(name)) category = "Agility";
        else if (strength.includes(name)) category = "Strength";
        else if (passing.includes(name)) category = "Passing";
        else if (general.includes(name)) category = "General";
        else if (mutation.includes(name)) category = "Mutation";

        skills.push({ name, category, description });
    }

    process.stdout.write('Skills encontrados: ' + skills.length + '\n');

    const tsContent = 'import { Skill } from "../types";\n\nexport const skillsData: Skill[] = ' + JSON.stringify(skills, null, 2) + ';\n';
    fs.writeFileSync('c:/Users/jazex/Documents/Antigravity/BloodBowlManager/data/skills.ts', tsContent);
    process.stdout.write('Finalizado con exito\n');

} catch (e) {
    process.stderr.write('Error: ' + e.message + '\n');
    process.exit(1);
}
