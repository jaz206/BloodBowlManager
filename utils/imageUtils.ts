
import type { ManagedTeam, Player } from '../types';

const BASE_URL = "https://raw.githubusercontent.com/jaz206/Bloodbowl-image/main/Foto%20plantilla/";

// Map internal roster names to GitHub prefix
const ROSTER_PREFIX_MAP: Record<string, string> = {
  "Amazonas": "Amazonas",
  "Orcos Negros": "Orco negro",
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
  "Vampiros": "Vampiros",
  "Wood Elves": "Silvanos"
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
 * Gets the number of players of the same position to avoid repeating images
 */
export const getNextImageNumber = (team: ManagedTeam, position: string): number => {
  const count = team.players.filter(p => p.position === position).length;
  return count + 1;
};

/**
 * Generates the GitHub image URL for a player
 */
export const getPlayerImageUrl = (rosterName: string, position: string, number: number): string => {
  let teamPrefix = ROSTER_PREFIX_MAP[rosterName] || rosterName;
  
  // Try to find a tag match
  let posTag = "";
  for (const [key, tag] of Object.entries(POSITION_TAG_MAP)) {
    if (position.includes(key)) {
      posTag = tag;
      break;
    }
  }
  
  // Case-sensitive check for specific high-level tags
  const exactTags = ["Vargheist", "Vampire Thrower", "Vampire Runner", "Vampire Blitzer", "Thrall linea"];
  
  if (exactTags.includes(posTag)) {
    // Keep as is
  } else if (!posTag) {
    posTag = position.toLowerCase().replace(/línea/g, 'linea').split(' ').pop() || 'jugador';
  }

  // Handle plural/singular for Team Name if needed
  if (teamPrefix === "Orcos Negros") teamPrefix = "Orco negro";
  if (teamPrefix === "Orcos") teamPrefix = "Orco";
  if (teamPrefix === "Humanos") teamPrefix = "Humano";
  if (teamPrefix === "Vampiros") teamPrefix = "Vampiros"; 

  // Special case for Vampires naming inconsistency in GitHub (-Thrall vs - Thrall)
  // If we move to subfolders, we can simplify this, but keeping it for backward compat if needed.
  if (posTag === "Thrall linea") {
      // New structure: Vampiros/Thrall linea 1.png
      return `${BASE_URL}${encodeURIComponent(teamPrefix)}/${encodeURIComponent(posTag + " " + number + ".png")}`;
  }

  // New Recommended Structure: TeamFolder/Position Number.png
  const filename = `${posTag} ${number}.png`;
  return `${BASE_URL}${encodeURIComponent(teamPrefix)}/${encodeURIComponent(filename)}`;
};

/**
 * Special case for team logos if they follow a similar pattern
 */
export const getTeamLogoUrl = (rosterName: string): string => {
  const prefix = ROSTER_PREFIX_MAP[rosterName] || rosterName;
  return `${BASE_URL}${encodeURIComponent(prefix + ".png")}`;
};
