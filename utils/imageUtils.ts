import type { ManagedTeam } from '../types';

const BASE_URL = "https://raw.githubusercontent.com/jaz206/Bloodbowl-image/main/Foto%20plantilla/";
const CREST_BASE_URL = "https://raw.githubusercontent.com/jaz206/Bloodbowl-image/main/Escudos/";
const STAR_BASE_URL = "https://raw.githubusercontent.com/jaz206/Bloodbowl-image/main/Star%20Players/";

export type PlayerImageStorageMode = 'nested' | 'legacy';

const ROSTER_PREFIX_MAP: Record<string, string> = {
  "Amazonas": "Amazonas",
  "Orcos": "Orcos",
  "Orcos Negros": "Orcos negros",
  "Elegidos del Caos": "Elegidos del Caos",
  "Enanos del Caos": "Enanos del caos",
  "Renegados del Caos": "Renegados",
  "Elfos Oscuros": "Elfos Oscuros",
  "Enanos": "Enanos",
  "Gnomos": "Gnomos",
  "Goblins": "Goblins",
  "Halflings": "Halflings",
  "Humanos": "Humano",
  "Khorne": "Khorne",
  "Lagartos": "Lagartos",
  "Nurgle": "Nurgle",
  "No Muertos": "No Muertos",
  "Nigromantes": "Nigromantes",
  "NÃƒÂ³rdicos": "Nordicos",
  "Nordicos": "Nordicos",
  "NÃ³rdicos": "Nordicos",
  "Ogros": "Ogros",
  "Skaven": "Skaven",
  "Slaanesh": "Slaanesh",
  "Tomb Kings": "Khemri",
  "UniÃƒÂ³n Ãƒâ€°lfica": "Union Elfica",
  "Union Elfica": "Union Elfica",
  "UniÃ³n Ã‰lfica": "Union Elfica",
  "Vampiros": "Vampiros",
  "Wood Elves": "Silvanos"
};

const CREST_PREFIX_MAP: Record<string, string> = {
  "amazonas": "Amazonas",
  "alianza del viejo mundo": "Alianza del Viejo Mundo",
  "bretonianos": "Bretonianos",
  "bretonnian": "Bretonianos",
  "altos elfos": "Altos Elfos",
  "humanos": "Humanos",
  "nobleza imperial": "Nobleza Imperial",
  "imperial nobility": "Nobleza Imperial",
  "halflings": "Halflings",
  "gnomos": "Gnomos",
  "goblins": "Goblins",
  "enanos": "Enanos",
  "enanos del caos": "Enanos del caos",
  "elegidos del caos": "Elegidos del caos",
  "renegados del caos": "Renegados del caos",
  "elfos oscuros": "Elfos oscuros",
  "elfos silvanos": "Elfos silvanos",
  "wood elves": "Elfos silvanos",
  "nurgle": "Nurgle",
  "hombres lagarto": "Hombres Lagarto",
  "lagartos": "Hombres Lagarto",
  "nordicos": "Nordicos",
  "orcos": "orcos",
  "orcos negros": "Orcos Negros",
  "vampiros": "vampiros",
  "khorne": "Khorne",
  "skaven": "SKAVEN",
  "snotlings": "Snotlings",
  "snotling": "Snotlings",
  "no muertos": "no muertos",
  "horror nigromantico": "Horror Nigromántico",
  "slann (naf)": "Slann (NAF)",
  "union elfica": "Union Elfica"
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
  if (isOfficialTeamLogoUrl(clean)) return clean;
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

