import type { ManagedTeam } from '../types';

const BASE_URL = "https://raw.githubusercontent.com/jaz206/Bloodbowl-image/main/Foto%20plantilla/";
const CREST_BASE_URL = "https://raw.githubusercontent.com/jaz206/Bloodbowl-image/main/Escudos/";
const STAR_BASE_URL = "https://raw.githubusercontent.com/jaz206/Bloodbowl-image/main/Star%20Players/";

export type PlayerImageStorageMode = 'nested' | 'legacy';

const ROSTER_PREFIX_MAP: Record<string, string> = {
  "Amazonas": "Amazonas",
  "Amazons": "Amazonas",
  "Orcos": "Orcos",
  "Orcs": "Orcos",
  "Orcos Negros": "Orcos negros",
  "Black Orcs": "Orcos negros",
  "Elegidos del Caos": "Elegidos del Caos",
  "Chosen of Chaos": "Elegidos del Caos",
  "Enanos del Caos": "Enanos del caos",
  "Chaos Dwarfs": "Enanos del caos",
  "Renegados del Caos": "Renegados",
  "Chaos Renegades": "Renegados",
  "Elfos Oscuros": "Elfos Oscuros",
  "Dark Elves": "Elfos Oscuros",
  "Enanos": "Enanos",
  "Dwarfs": "Enanos",
  "Gnomos": "Gnomos",
  "Gnomes": "Gnomos",
  "Goblins": "Goblins",
  "Halflings": "Halflings",
  "Humanos": "Humano",
  "Humans": "Humano",
  "Khorne": "Khorne",
  "Lagartos": "Lagartos",
  "Hombres Lagarto": "Lagartos",
  "Lizardmen": "Lagartos",
  "Nurgle": "Nurgle",
  "No Muertos": "No Muertos",
  "Shambling Undead": "No Muertos",
  "Nigromantes": "Nigromantes",
  "Horror Nigromántico": "Nigromantes",
  "Horror Nigrom?ntico": "Nigromantes",
  "Necromantic Horror": "Nigromantes",
  "Nórdicos": "Nordicos",
  "N????rdicos": "Nordicos",
  "Nordicos": "Nordicos",
  "N??rdicos": "Nordicos",
  "N?rdicos": "Nordicos",
  "Norse": "Nordicos",
  "Ogros": "Ogros",
  "Ogres": "Ogros",
  "Skaven": "Skaven",
  "Slaanesh": "Slaanesh",
  "Tomb Kings": "Khemri",
  "Reyes de las Tumbas": "Khemri",
  "Unión Élfica": "Union Elfica",
  "Uni????n ?????lfica": "Union Elfica",
  "Union Elfica": "Union Elfica",
  "Uni??n ??lfica": "Union Elfica",
  "Uni?n ?lfica": "Union Elfica",
  "Elven Union": "Union Elfica",
  "Vampiros": "Vampiros",
  "Vampires": "Vampiros",
  "Wood Elves": "Silvanos",
  "Elfos Silvanos": "Silvanos",
  "Alianza del Viejo Mundo": "Old World Alliance",
  "Old World Alliance": "Old World Alliance",
  "Bretonnian": "Bretonnian",
  "Bretonnians": "Bretonnian",
  "Imperial Nobility": "Imperial Nobility",
  "Snotling": "Snotling",
  "Snotlings": "Snotling",
  "Habitantes del Inframundo": "Inframundo",
  "Underworld Denizens": "Inframundo",
  "Altos Elfos": "Altos Elfos",
  "High Elves": "Altos Elfos",
};

const CREST_PREFIX_MAP: Record<string, string> = {
  "amazonas": "Amazons",
  "amazons": "Amazons",
  "alianza del viejo mundo": "Old World Alliance",
  "old world alliance": "Old World Alliance",
  "bretonianos": "Bretonnians",
  "bretonnian": "Bretonnians",
  "bretonnians": "Bretonnians",
  "altos elfos": "High Elves",
  "high elves": "High Elves",
  "humanos": "Humans",
  "humans": "Humans",
  "nobleza imperial": "Imperial Nobility",
  "imperial nobility": "Imperial Nobility",
  "halflings": "Halflings",
  "gnomos": "Gnomes",
  "gnomes": "Gnomes",
  "goblins": "Goblins",
  "enanos": "Dwarfs",
  "dwarfs": "Dwarfs",
  "enanos del caos": "Chaos Dwarfs",
  "chaos dwarfs": "Chaos Dwarfs",
  "elegidos del caos": "Chosen of Chaos",
  "chosen of chaos": "Chosen of Chaos",
  "renegados del caos": "Chaos Renegades",
  "chaos renegades": "Chaos Renegades",
  "elfos oscuros": "Dark Elves",
  "dark elves": "Dark Elves",
  "elfos silvanos": "Wood Elves",
  "wood elves": "Wood Elves",
  "nurgle": "Nurgle",
  "hombres lagarto": "Lizardmen",
  "lagartos": "Lizardmen",
  "lizardmen": "Lizardmen",
  "nordicos": "Norse",
  "norse": "Norse",
  "orcos": "Orcs",
  "orcs": "Orcs",
  "orcos negros": "Black Orcs",
  "black orcs": "Black Orcs",
  "vampiros": "Vampires",
  "vampires": "Vampires",
  "khorne": "Khorne",
  "skaven": "skaven",
  "snotlings": "Snotling",
  "snotling": "Snotling",
  "no muertos": "Shambling Undead",
  "shambling undead": "Shambling Undead",
  "horror nigromantico": "Necromantic Horror",
  "horror nigromántico": "Necromantic Horror",
  "necromantic horror": "Necromantic Horror",
  "slann (naf)": "Slann (NAF)",
  "union elfica": "Elven Union",
  "elven union": "Elven Union",
  "habitantes del inframundo": "Underworld Denizens",
  "underworld denizens": "Underworld Denizens",
  "tomb kings": "Tomb Kings",
  "reyes de las tumbas": "Tomb Kings",
};

const LEGACY_POSITION_FILE_MAP: Record<string, string> = {
  "Vampiros Corredor": "Vampire Runner",
  "Vampiros Lanzador": "Vampire Thrower",
  "Vampiros Placador": "Vampire Blitzer",
  "Vargheist": "Vargheist",
  "Thrall": "Thrall linea",
  "LÃƒÂ­nea": "linea",
  "LÃ­nea": "linea",
  "Linea": "linea",
  "Bloqueador LÃƒÂ­nea": "linea",
  "Bloqueador LÃ­nea": "linea",
  "Eagle Guerrero LÃƒÂ­nea": "linea",
  "Eagle Guerrero LÃ­nea": "linea",
  "Bestia del Caos": "linea",
  "Hobgoblin LÃƒÂ­nea": "linea",
  "Hobgoblin LÃ­nea": "linea",
  "Skeleton LÃƒÂ­nea": "linea",
  "Skeleton LÃ­nea": "linea",
  "Zombi LÃƒÂ­nea": "linea",
  "Zombi LÃ­nea": "linea",
  "Lineman": "linea",
  "Bloqueador": "bloqueador",
  "Enanos Bloqueador LÃƒÂ­nea": "bloqueador",
  "Enanos Bloqueador LÃ­nea": "bloqueador",
  "Elegido Bloqueador": "bloqueador",
  "Placador Blitzer": "Blitzer",
  "Blitzer Orco": "Blitzer orco",
  "Untrained Troll": "Untrained Troll",
  "Corredor": "corredor",
  "Python Guerrero Lanzador": "lanzador",
  "Lanzador": "Lanzador",
  "Piranha Guerrero Placador": "placador",
  "Placador": "placador",
  "Receptor": "receptor",
  "Ulwerener": "hombre lobo",
  "Werewolf": "hombre lobo",
  "Flesh Golem": "golem",
  "Mummy": "momia",
  "Kroxigor": "kroxigor",
  "Big Un": "orco negro",
  "Orcos Negros": "orco negro",
  "Troll": "Troll",
  "Ogre": "ogro",
  "Rat Ogre": "rata ogro",
  "Minotaur": "minotauro",
  "Deathroller": "deathroller",
  "Witch Elf": "witch elf"
};

const fixMojibake = (value: string): string => value
  .replace(/ÃƒÂ¡/g, 'a')
  .replace(/ÃƒÂ©/g, 'e')
  .replace(/ÃƒÂ­/g, 'i')
  .replace(/ÃƒÂ³/g, 'o')
  .replace(/ÃƒÂº/g, 'u')
  .replace(/ÃƒÂ±/g, 'n')
  .replace(/Ãƒâ€°/g, 'E')
  .replace(/Ãƒ"/g, 'O')
  .replace(/Ãƒ/g, 'A')
  .replace(/Ã‡Ã°/g, 'i')
  .replace(/Ã‡Ã¼n/g, 'on')
  .replace(/Ã‡%l/g, 'El');

const slugify = (value: string): string =>
  fixMojibake(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const normalizeTeamAssetKey = (value: string): string =>
  fixMojibake(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9()]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export const getTeamPrefix = (rosterName: string): string => {
  let prefix = ROSTER_PREFIX_MAP[rosterName] || fixMojibake(rosterName);
  if (prefix === "Orcos Negros") prefix = "Orcos negros";
  if (prefix === "Humanos") prefix = "Humano";
  return prefix;
};

export interface PositionStockEntry {
  numbers: number[];
  files: string[];
  storage: PlayerImageStorageMode;
}

export interface PositionStock {
  [posTag: string]: PositionStockEntry;
}

const addStockNumber = (
  stock: PositionStock,
  key: string,
  number: number,
  storage: PlayerImageStorageMode,
  filename: string
) => {
  if (!stock[key]) {
    stock[key] = { numbers: [], files: [], storage };
  }

  if (!stock[key].numbers.includes(number)) {
    stock[key].numbers.push(number);
  }

  if (!stock[key].files.includes(filename)) {
    stock[key].files.push(filename);
  }
};

export const getPosTag = (position: string): string => slugify(position || 'jugador');

const getLegacyPosTag = (position: string): string => {
  for (const [key, value] of Object.entries(LEGACY_POSITION_FILE_MAP)) {
    if (position.includes(key)) {
      return value;
    }
  }

  const fixedPosition = fixMojibake(position);
  return fixedPosition.split(' ').pop() || 'jugador';
};

export const fetchTeamImageStock = async (rosterName: string): Promise<PositionStock> => {
  const teamFolder = getTeamPrefix(rosterName);

  try {
    const response = await fetch(`https://api.github.com/repos/jaz206/Bloodbowl-image/contents/Foto%20plantilla/${encodeURIComponent(teamFolder)}`);
    if (!response.ok) return {};

    const entries = await response.json();
    const stock: PositionStock = {};
    const hasNestedFolders = entries.some((entry: any) => entry.type === 'dir');

    if (hasNestedFolders) {
      await Promise.all(entries.map(async (entry: any) => {
        if (entry.type !== 'dir') return;

        const folderResponse = await fetch(entry.url);
        if (!folderResponse.ok) return;

        const folderEntries = await folderResponse.json();
        folderEntries.forEach((file: any) => {
          if (file.type !== 'file' || !file.name.endsWith('.png')) return;
          const match = file.name.match(/(\d+)\.png$/i);
          if (!match) return;
          addStockNumber(stock, entry.name.toLowerCase(), parseInt(match[1], 10), 'nested', file.name);
        });
      }));

      return stock;
    }

    entries.forEach((entry: any) => {
      if (entry.type !== 'file' || !entry.name.endsWith('.png')) return;
      const decodedName = decodeURIComponent(entry.name);
      const numberMatch = decodedName.match(/(\d+)\.png$/i);
      if (!numberMatch) return;

      const label = decodedName.replace(/\s+\d+\.png$/i, '');
      addStockNumber(stock, getPosTag(label), parseInt(numberMatch[1], 10), 'legacy', decodedName);
    });

    return stock;
  } catch {
    return {};
  }
};

export const getRandomImageNumber = (team: ManagedTeam, position: string): number => {
  const used = team.players
    .filter(p => p.position === position && p.image)
    .map(p => {
      const match = p.image!.match(/(\d+)\.png$/);
      return match ? parseInt(match[1], 10) : 0;
    });

  for (let i = 0; i < 10; i++) {
    const candidate = Math.floor(Math.random() * 15) + 1;
    if (!used.includes(candidate)) return candidate;
  }

  return Math.floor(Math.random() * 15) + 1;
};

export const getLegacyPlayerImageUrl = (rosterName: string, position: string, number: number): string => {
  const teamPrefix = getTeamPrefix(rosterName);
  const posTag = getLegacyPosTag(position);

  if (posTag === "Thrall linea") {
    return `${BASE_URL}${encodeURIComponent(teamPrefix)}/${encodeURIComponent(`${posTag} ${number}.png`)}`;
  }

  const paddedNumber = number < 10 ? `0${number}` : `${number}`;
  const filename = `${posTag} ${paddedNumber}.png`;
  return `${BASE_URL}${encodeURIComponent(teamPrefix)}/${encodeURIComponent(filename)}`;
};

export const getPlayerImageUrl = (
  rosterName: string,
  position: string,
  number: number,
  storage: PlayerImageStorageMode = 'nested',
  filename?: string
): string => {
  if (storage === 'legacy') {
    if (filename) {
      const teamPrefix = getTeamPrefix(rosterName);
      return `${BASE_URL}${encodeURIComponent(teamPrefix)}/${encodeURIComponent(filename)}`;
    }
    return getLegacyPlayerImageUrl(rosterName, position, number);
  }

  const teamPrefix = getTeamPrefix(rosterName);
  const positionFolder = getPosTag(position);
  const resolvedFilename = filename || `${number < 10 ? `0${number}` : `${number}`}.png`;

  return `${BASE_URL}${encodeURIComponent(teamPrefix)}/${encodeURIComponent(positionFolder)}/${encodeURIComponent(resolvedFilename)}`;
};

export const getTeamLogoUrl = (rosterName: string): string => {
  const prefix = CREST_PREFIX_MAP[normalizeTeamAssetKey(rosterName)] || getTeamPrefix(rosterName);
  return `${CREST_BASE_URL}${encodeURIComponent(prefix + ".png")}`;
};

export const getTeamLogoFilename = (rosterName: string): string => {
  const prefix = CREST_PREFIX_MAP[normalizeTeamAssetKey(rosterName)] || getTeamPrefix(rosterName);
  return `${prefix}.png`;
};

export const isOfficialTeamLogoUrl = (url?: string | null): boolean => {
  const clean = String(url || '').trim();
  if (!clean) return false;
  return clean.startsWith(CREST_BASE_URL);
};

export const isDeprecatedTeamLogoUrl = (url?: string | null): boolean => {
  const clean = String(url || '').trim();
  if (!clean) return false;
  return /(^https?:\/\/)?(i\.)?pinimg\.com\//i.test(clean) ||
    /raw\.githubusercontent\.com\/jaz206\/Bloodbowl-image\/main\/(?!Escudos\/)/i.test(clean);
};

export const resolveTeamLogoPreference = (rosterName: string, url?: string | null): string => {
  const clean = String(url || '').trim();
  const hasOfficialMapping = Boolean(CREST_PREFIX_MAP[normalizeTeamAssetKey(rosterName)]);
  const official = getTeamLogoUrl(rosterName);

  if (!clean) return hasOfficialMapping ? official : clean;
  if (clean.startsWith('data:')) return clean;
  if (isOfficialTeamLogoUrl(clean)) {
    return hasOfficialMapping ? official : clean;
  }
  if (hasOfficialMapping) return official;
  if (isDeprecatedTeamLogoUrl(clean)) return official;
  return clean;
};

const STAR_FILE_MAP: Record<string, string> = {
  "Boa Kon'ssstriktr":         "PJ - Boa Kon\u2019ssstriktr.png",
  "Bryce 'The Slice' Cambuel": "PJ - Bryce \u2018The Slice\u2019 Cambuel.png",
  "'Captain' Karina Von Riesz":"PJ - \u2018Captain\u2019 Karina Von Riesz.png",
  "Frank 'n' Stein":           "PJ - Frank \u2018n\u2019 Stein.png",
  "Morg 'n' Thorg":            "PJ - Morg \u2018n\u2019 Thorg.png",
  "Dribl & Drull":             "PJ - Dribl and Drill.png",
  "Grak & Crumbleberry":       "PJ - Grak & Crumbleberry.png",
  "H\u2019thark the Unstoppable": "PJ - H'thark the Unstoppable.png",
  "H'thark the Unstoppable":   "PJ - H'thark the Unstoppable.png",
  "Gretchen Wachter":          "PJ - GRETCHEN WACHTER.png",
  "Grim Ironjaw":              "PJ - GRIM IRONJAW.png",
  "Helmut Wolf":               "PJ - HELMUT WULF.png",
  "Ivan Deathshroud":          "PJ - IVAN DEATHSHROUD.png",
  "Jeremiah Kool":             "PJ - JEREMIAH KOOL.png",
  "Jordell Freshbreeze":       "PJ - JORDELL FRESHBREEZE.png",
  "Josef Bugman":              "PJ - JOSEF BUGMAN.png",
  "Rashnak Backstabber":       "PJ - RASHNAK BACKSTABBER.png",
  "Ripper Bolgrot":            "PJ - RIPPER BOLGROT.png",
  "Rodney Roachbait":          "PJ - RODNEY ROACHBAIT.png",
  "Rowana Forestfoot":         "PJ - ROWANA FORESTFOOT.png",
  "Roxanna Darknail":          "PJ - ROXANNA DARKNAIL.png",
  "Scrappa Sorehead":          "PJ - SCRAPPA SOREHEAD.png",
  "Scyla Anfingrimm":          "PJ - SCYLA ANFINGRIMM.png",
  "Skitter Stab-Stab":         "PJ - SKITTER STAB-STAB.png",
  "Skrorg Snowpelt":           "PJ - SKRORG SNOWPELT.png",
  "Skrull Halfheight":         "PJ - SKRULL HALFHEIGHT.png",
  "Swiftvine Glimmershard":    "PJ - SWIFTVINE GLIMMERSHARD.png",
  "The Swift Twins":           "PJ - THE SWIFT TWINS.png",
  "Thorsson Stoutmead":        "PJ - THORSSON STOUTMEAD.png",
  "Wilhelm Chaney":            "PJ - WILHELM CHANEY.png",
  "Willow Rosebark":           "PJ - WILLOW ROSEBARK.png",
  "Zzharg Madeye":             "PJ - ZZHARG MADEYE.png",
  "Varag Ghoul-Chewer":        "PJ - Varag Ghoul-Chewer (Varag Masticamuertos).png",
  "Kreek Rustgouger":          "PJ -  Kreek Rustgouger.png",
  "Ivar Eriksson":             "PJ- IVAR ERIKSSON.png",
};

export const getStarPlayerImageUrl = (starName: string): string => {
  const key = starName
    .replace(/[\u2018\u2019\u02BC\u0060]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .trim();

  const filename = STAR_FILE_MAP[key] ?? `PJ - ${key}.png`;
  return `${STAR_BASE_URL}${encodeURIComponent(filename)}`;
};

export const getStarPlayerImageFilename = (starName: string): string => {
  const key = starName
    .replace(/[\u2018\u2019\u02BC\u0060]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .trim();

  return STAR_FILE_MAP[key] ?? `PJ - ${key}.png`;
};

