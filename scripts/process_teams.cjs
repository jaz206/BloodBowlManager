const fs = require('fs');
const path = require('path');

const catsDir = 'C:/tmp/bloodbowl_cats/';
const teamsFile = 'c:/Users/jazex/Documents/Antigravity/BloodBowlManager/data/teams.ts';

// Detailed Tier map from user's manual list
const tierMap = {
    "Amazon": 1, "Bretonnian": 1, "Black Orc": 1, "Gnome": 1,
    "Chaos Dwarf": 2, "Elven Union": 2, "Chaos Chosen": 2, "Goblin": 2,
    "Dark Elf": 3, "Human": 3, "Chaos Renegades": 3, "Halfling": 3,
    "Dwarf": 4, "Imperial Nobility": 4, "Khorne": 4, "Ogre": 4,
    "High Elf": 1, "Necromantic Horror": 1, "Nurgle": 2, "Snotling": 3,
    "Lizardmen": 1, "Orc": 1, "Norse": 1, "Shambling Undead": 1,
    "Old World Alliance": 1, "Skaven": 1, "Underworld Denizens": 1,
    "Tomb Kings": 1, "Wood Elf": 1, "Vampires": 1, "Vampire": 1,
    "Slann": 2, "Khemri": 1
};

function normalizeName(n) {
    return n.toLowerCase().replace(/s$/, '').replace(/equipos\s+/i, '').trim();
}

function normalizeCharName(name) {
    return name.replace(/&amp;/g, '&').replace(/&quot;/g, '"').trim();
}

function parseStat(val, name) {
    if (!val) return "-";
    let s = val.trim();
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
    let existingTeams = {};
    if (fs.existsSync(teamsFile)) {
        const content = fs.readFileSync(teamsFile, 'utf8');
        const teamBlocks = content.split('  {');
        teamBlocks.forEach(block => {
            const nameMatch = block.match(/name:\s*"(.*?)"/);
            const imageMatch = block.match(/image:\s*"(.*?)"/);
            if (nameMatch) {
                const name = normalizeName(nameMatch[1]);
                existingTeams[name] = imageMatch ? imageMatch[1] : null;
            }
        });
    }

    const catFiles = fs.readdirSync(catsDir).filter(f => f.endsWith('.cat'));
    const finalTeams = [];

    catFiles.forEach(file => {
        const content = fs.readFileSync(path.join(catsDir, file), 'utf8');
        const teamNameRaw = file.replace('.cat', '').replace(' Team', '').replace('s Team', '').trim();
        const normName = normalizeName(teamNameRaw);

        if (normName.includes("star player") || normName.includes("freebooter") || normName.includes("college")) return;

        const profiles = {};
        const profileRegex = /<profile id="([^"]*)" name="([^"]*)"[^>]*>[\s\S]*?<characteristics>([\s\S]*?)<\/characteristics>/g;
        let pMatch;
        while ((pMatch = profileRegex.exec(content)) !== null) {
            const charSection = pMatch[3];
            const stats = {};
            const charRegex = /<characteristic name="([^"]*)"[^>]*>([\s\S]*?)<\/characteristic>/g;
            let cMatch;
            while ((cMatch = charRegex.exec(charSection)) !== null) {
                stats[normalizeCharName(cMatch[1])] = cMatch[2].trim();
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
                const catEntryMatch = content.match(new RegExp(`<categoryEntry[^>]*name="${name}"[\\s\\S]*?<constraint[^>]*value="(\\d+)"[^>]*type="max"`));
                if (catEntryMatch) qty = `0-${catEntryMatch[1]}`;

                roster.push({
                    qty: qty,
                    position: name,
                    cost: costMatch ? parseInt(costMatch[1]) : 50000,
                    stats: {
                        MV: parseInt(profile.stats.MA || profile.stats.MV) || 0,
                        FU: parseStat(profile.stats.ST || profile.stats.FU, "FU"),
                        AG: parseStat(profile.stats.AG, "AG"),
                        PS: parseStat(profile.stats.PA || profile.stats.PS, "PS"),
                        AR: parseStat(profile.stats.AV || profile.stats.AR, "AR")
                    },
                    skills: (profile.stats["Skills & Traits"] || profile.stats["Skills"] || "").replace(/&amp;/g, '&').replace(/&quot;/g, '"'),
                    primary: profile.stats.Primary || "",
                    secondary: profile.stats.Secondary || ""
                });
            }
        });

        if (roster.length > 0) {
            const tier = tierMap[teamNameRaw.replace('s', '')] || tierMap[teamNameRaw] || 2;
            const img = existingTeams[normName] || "https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0";

            let rCost = 50000;
            const rMatch = content.match(/name="Team Reroll"[\s\S]*?<cost[^>]*value="(\d+)"/);
            if (rMatch) rCost = parseInt(rMatch[1]);

            let sRules = "Standard";
            const sMatch = content.match(/<selectionEntry[^>]*name="Special Rules"[\s\S]*?<entryLinks>([\s\S]*?)<\/entryLinks>/);
            if (sMatch) {
                const links = sMatch[1].match(/name="([^"]*)"/g);
                if (links) sRules = links.map(l => l.match(/"([^"]*)"/)[1]).join(", ");
            }

            finalTeams.push({
                name: "Equipos " + teamNameRaw,
                specialRules: sRules,
                rerollCost: rCost,
                tier: tier,
                apothecary: (normName.includes("undead") || normName.includes("khemri") || normName.includes("necromantic")) ? "No" : "Sí",
                image: img,
                ratings: calculateRatings(roster),
                roster: roster
            });
        }
    });

    const tsContent = 'import type { Team } from "../types";\n\nexport const teamsData: Team[] = ' + JSON.stringify(finalTeams, null, 2) + ';\n';
    fs.writeFileSync(teamsFile, tsContent);
    process.stdout.write(`Éxito final: ${finalTeams.length} equipos sincronizados.\n`);

} catch (e) {
    process.stderr.write('Error: ' + e.message + '\n');
}
