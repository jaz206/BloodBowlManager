const dwarfFirst = ['Gotrek', 'Thorgrim', 'Gimli', 'Durin', 'Bardin', 'Borin', 'Dwalin', 'Balin', 'Oin', 'Gloin'];
const dwarfLast1 = ['Stone', 'Iron', 'Gold', 'Bronze', 'Steel', 'Silver', 'Mithril', 'Rock', 'Grim'];
const dwarfLast2 = ['beard', 'hammer', 'fist', 'axe', 'helm', 'hand', 'shield', 'brow', 'foot'];

const orcFirst = ['Ghaz', 'Grimgor', 'Morglum', 'Azhag', 'Gor', 'Bad', 'Urg'];
const orcLast = ['ruk', 'fang', 'jaw', 'snik', 'gash', 'smasha', 'rippa'];

const humanFirst = ['Griff', 'Eldric', 'Luther', 'Markus', 'Wilhelm', 'Jurgen', 'Dieter', 'Konrad'];
const humanLast = ['Oberwald', 'Swift', 'von Kill', 'Wulf', 'Schwartz', 'Hoffman', 'Bauer'];

const elfFirst = ['Eldril', 'Jordell', 'Lucien', 'Valen', 'Gloriel', 'Rowana', 'Ariel', 'Elara'];
const elfLast = ['Sidewinder', 'Freshbreeze', 'Swift', 'Summerbloom', 'Starstriker', 'Surehand'];

const skavenFirst = ['Skritch', 'Kreek', 'Queek', 'Ikit', 'Thanquol', 'Snikch', 'Vermin'];
const skavenLast = ['Spiteclaw', 'Stab-Stab', 'Rustgouger', 'Head-Taker', 'Claw', 'Tail'];

const chaosFirst = ['Archaon', 'Khorgor', 'Slambo', 'Vorgar', 'Zar', 'Gorth'];
const chaosLast = ['the Everchosen', 'Skulltaker', 'Bloodbath', 'the Despoiler', 'the Vile'];

const undeadFirst = ['Ramut', 'Nekaph', 'Setep', 'Kemmler', 'Luthor', 'Vlad'];
const undeadLast = ['von Carstein', 'the Wight', 'the Ghoul King'];

const lizardmenFirst = ['Kroq', 'Mazda', 'Gor-Rok', 'Nakai', 'Itzi', 'Xili'];
const lizardmenLast = ['-Gar', 'mundi', 'the Great White Lizard', '-Bok', '-Topec'];

const nurgleFirst = ['Guffle', 'Bilerot', 'Fester', 'Pus', 'Rot', 'Bloat'];
const nurgleLast = ['Pusmaw', 'Vomitflesh', 'Spume', 'Maggot', 'Blight'];

const goblinFirst = ['Skrag', 'Grom', 'Sniv', 'Grot', 'Skarsnik', 'Gobbla'];
const goblinLast = ['the Slaughterer', 'the Paunch', 'Groinbiter', 'the Git', 'da Gobbo'];

const halflingFirst = ['Puggy', 'Cindy', 'Rumbelow', 'Gaffer', 'Pippin', 'Merry'];
const halflingLast = ['Baconbreath', 'Piewhistle', 'Sheepskin', 'Gamgee', 'Brandybuck'];

const snotlingFirst = ['Snot', 'Fungo', 'Stilty', 'Pump', 'Tiny'];
const snotlingLast = ['Flinga', 'Hoppa', 'Runna', 'Wagon', 'the Small'];


const getRandom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

export const generateRandomName = (rosterName: string): string => {
    const lowerRoster = rosterName.toLowerCase();

    if (lowerRoster.includes('dwarf')) {
        return `${getRandom(dwarfFirst)} ${getRandom(dwarfLast1)}${getRandom(dwarfLast2)}`;
    }
    if (lowerRoster.includes('orc')) {
        return `${getRandom(orcFirst)}${getRandom(orcLast)}`;
    }
    if (lowerRoster.includes('human') || lowerRoster.includes('nobility') || lowerRoster.includes('alliance')) {
        return `${getRandom(humanFirst)} ${getRandom(humanLast)}`;
    }
    if (lowerRoster.includes('elf') || lowerRoster.includes('elven')) {
        return `${getRandom(elfFirst)} ${getRandom(elfLast)}`;
    }
    if (lowerRoster.includes('skaven')) {
        return `${getRandom(skavenFirst)} ${getRandom(skavenLast)}`;
    }
    if (lowerRoster.includes('chaos') || lowerRoster.includes('renegade')) {
        return `${getRandom(chaosFirst)} ${getRandom(chaosLast)}`;
    }
    if (lowerRoster.includes('undead') || lowerRoster.includes('necromantic')) {
        return `${getRandom(undeadFirst)} ${getRandom(undeadLast)}`;
    }
    if (lowerRoster.includes('lizardmen')) {
        return `${getRandom(lizardmenFirst)}${getRandom(lizardmenLast)}`;
    }
    if (lowerRoster.includes('nurgle')) {
        return `${getRandom(nurgleFirst)}${getRandom(nurgleLast)}`;
    }
    if (lowerRoster.includes('goblin') || lowerRoster.includes('underworld')) {
        return `${getRandom(goblinFirst)} ${getRandom(goblinLast)}`;
    }
     if (lowerRoster.includes('halfling')) {
        return `${getRandom(halflingFirst)} ${getRandom(halflingLast)}`;
    }
    if (lowerRoster.includes('snotling')) {
        return `${getRandom(snotlingFirst)} ${getRandom(snotlingLast)}`;
    }
    
    // Fallback
    return `${getRandom(humanFirst)} ${getRandom(humanLast)}`;
};