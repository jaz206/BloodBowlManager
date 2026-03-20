
import type { ManagedTeam, Player } from '../types';

const BASE_URL = "https://raw.githubusercontent.com/jaz206/Bloodbowl-image/main/Foto%20plantilla/";

// Map internal roster names to GitHub prefix
// Map internal roster names to GitHub folder prefix (For player images)
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
  "Nórdicos": "Nordicos",
  "Ogros": "Ogros",
  "Skaven": "Skaven",
  "Slaanesh": "Slaanesh",
  "Tomb Kings": "Khemri",
  "Unión Élfica": "Union Elfica",
  "Vampiros": "Vampiros",
  "Wood Elves": "Silvanos"
};

// Map internal roster names to GitHub shield filenames (For Crests)
const CREST_PREFIX_MAP: Record<string, string> = {
  "Amazonas": "Amazonas",
  "Orcos": "Orcos", 
  "Orcos Negros": "Orcos Negros",
  "Union Elfica": "Union Elfica",
  "Unión Élfica": "Union Elfica",
  "Renegados del Caos": "Renegados del Caos",
  "Enanos del Caos": "Enanos del caos",
  "Elegidos del Caos": "Elegidos del Caos",
  "Enanos": "Enanos",
  "Goblins": "Goblins",
  "Elfos Oscuros": "Elfos Oscuros"
};

export const getTeamPrefix = (rosterName: string): string => {
  let prefix = ROSTER_PREFIX_MAP[rosterName] || rosterName;
  if (prefix === "Orcos Negros") prefix = "Orcos negros";
  if (prefix === "Humanos") prefix = "Humanos";
  return prefix;
};

export interface PositionStock {
    [posTag: string]: number[]; // List of available numbers for that position
}

export const fetchTeamImageStock = async (rosterName: string): Promise<PositionStock> => {
  const prefix = getTeamPrefix(rosterName);
  try {
    const res = await fetch(`https://api.github.com/repos/jaz206/Bloodbowl-image/contents/Foto%20plantilla/${encodeURIComponent(prefix)}`);
    if (!res.ok) return {};
    const files = await res.json();
    
    const stock: PositionStock = {};
    files.forEach((f: any) => {
        if (f.type === 'file' && f.name.endsWith('.png')) {
            const parts = f.name.split(' ');
            if (parts.length >= 2) {
                const tag = parts[0].toLowerCase();
                const numMatch = parts[1].match(/\d+/);
                if (numMatch) {
                    const num = parseInt(numMatch[0]);
                    if (!stock[tag]) stock[tag] = [];
                    stock[tag].push(num);
                }
            }
        }
    });
    return stock;
  } catch (e) {
    return {};
  }
};

// Map internal position names to GitHub position tags
const POSITION_TAG_MAP: Record<string, string> = {
  "Vampiros Corredor": "Vampire Runner",
  "Vampiros Lanzador": "Vampire Thrower",
  "Vampiros Placador": "Vampire Blitzer",
  "Vargheist": "Vargheist",
  "Thrall": "Thrall linea",
  "Línea": "linea",
  "Bloqueador Línea": "linea",
  "Eagle Guerrero Línea": "linea",
  "Bestia del Caos": "linea",
  "Hobgoblin Línea": "linea",
  "Skeleton Línea": "linea",
  "Zombi Línea": "linea",
  "Lineman": "linea",
  "Bloqueador": "bloqueador",
  "Enanos Bloqueador Línea": "bloqueador",
  "Elegido Bloqueador": "bloqueador",
  "Corredor": "corredor",
  "Python Guerrero Lanzador": "lanzador",
  "Lanzador": "lanzador",
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
  "Troll": "troll",
  "Ogre": "ogro",
  "Rat Ogre": "rata ogro",
  "Minotaur": "minotauro",
  "Deathroller": "deathroller",
  "Witch Elf": "witch elf"
};

/**
 * Gets a random photo number (01-15) for a position, trying to avoid immediate duplicates
 */
export const getRandomImageNumber = (team: ManagedTeam, position: string): number => {
  const used = team.players
    .filter(p => p.position === position && p.image)
    .map(p => {
        const match = p.image!.match(/(\d+)\.png$/);
        return match ? parseInt(match[1]) : 0;
    });
  
  // Try up to 10 times to get a number not in use
  for (let i = 0; i < 10; i++) {
    const candidate = Math.floor(Math.random() * 15) + 1;
    if (!used.includes(candidate)) return candidate;
  }
  
  // Fallback to random if all 15 are (unlikely) in use or bad luck
  return Math.floor(Math.random() * 15) + 1;
};

export const getPosTag = (position: string): string => {
  let posTag = "";
  for (const [key, tag] of Object.entries(POSITION_TAG_MAP)) {
    if (position.includes(key)) {
      posTag = tag;
      break;
    }
  }
  
  if (!posTag) {
    posTag = position.toLowerCase().replace(/línea/g, 'linea').split(' ').pop() || 'jugador';
  }
  return posTag;
};

export const getPlayerImageUrl = (rosterName: string, position: string, number: number): string => {
  const teamPrefix = getTeamPrefix(rosterName);
  const posTag = getPosTag(position);

  // Special case for Vampires naming inconsistency in GitHub (-Thrall vs - Thrall)
  if (posTag === "Thrall linea") {
      return `${BASE_URL}${encodeURIComponent(teamPrefix)}/${encodeURIComponent(posTag + " " + number + ".png")}`;
  }

  const paddedNumber = number < 10 ? `0${number}` : `${number}`;
  const capitalizedPos = posTag.charAt(0).toUpperCase() + posTag.slice(1);
  const filename = `${capitalizedPos} ${paddedNumber}.png`;
  
  return `${BASE_URL}${encodeURIComponent(teamPrefix)}/${encodeURIComponent(filename)}`;
};

const CREST_BASE_URL = "https://raw.githubusercontent.com/jaz206/Bloodbowl-image/main/Escudos/";

/**
 * Special case for team logos if they follow a similar pattern
 */
export const getTeamLogoUrl = (rosterName: string): string => {
  const prefix = CREST_PREFIX_MAP[rosterName] || getTeamPrefix(rosterName);
  return `${CREST_BASE_URL}${encodeURIComponent(prefix + ".png")}`;
};

const STAR_BASE_URL = "https://raw.githubusercontent.com/jaz206/Bloodbowl-image/main/Star%20Players/";

/**
 * Generates the GitHub image URL for a star player
 */
export const getStarPlayerImageUrl = (starName: string): string => {
  // Normalize naming inconsistencies:
  // 1. Curly quotes -> Straight quotes ('Captain', 'The Slice')
  // 2. '&' -> 'and' (Dribl and Drill)
  // 3. Curly ' -> straight ' (H’thark -> H'thark)
    // Mapeo exhaustivo para corregir inconsistencias en los nombres de archivos de GitHub
    const STAR_PLAYER_MAPPINGS: Record<string, string> = {
        "Dribl & Drull": "Dribl and Drill", // El archivo en GitHub tiene un typo "Drill"
        "Grak & Crumbleberry": "Grak & Crumbleberry", // Usa ampersand directamente
        "Frank 'n' Stein": "Frank ‘n’ Stein", // Usa comillas curvas y 'n' minúscula
        "Morg 'n' Thorg": "Morg ‘n’ Thorg", // Usa comillas curvas y 'n' minúscula
        "Boa Kon'ssstriktr": "Boa Kon’ssstriktr", // Usa apóstrofo curvo
        "Bryce 'The Slice' Cambuel": "Bryce ‘The Slice’ Cambuel", // Usa comillas curvas
        "Captain Karina Von Riesz": "‘Captain’ Karina Von Riesz", // Añade comillas curvas
        "‘Captain’ Karina Von Riesz": "‘Captain’ Karina Von Riesz",
        "Ivar Eriksson": "IVAR ERIKSSON", // Caso especial PJ- sin espacio
    };

    let filename = "";
    if (STAR_PLAYER_MAPPINGS[starName]) {
        const mapped = STAR_PLAYER_MAPPINGS[starName];
        if (starName === "Ivar Eriksson") {
            filename = `PJ- ${mapped}.png`;
        } else {
            filename = `PJ - ${mapped}.png`;
        }
    } else {
        // Normalización general para el resto
        const normalized = starName
            .replace(/[‘’]/g, "'")
            .replace(/[“”]/g, '"')
            .replace(/&/g, "and");
        filename = `PJ - ${normalized}.png`;
    }

    return `${STAR_BASE_URL}${encodeURIComponent(filename)}`;
};
