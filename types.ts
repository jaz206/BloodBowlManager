
export interface User {
  id: string;
  name: string;
  email: string;
  picture: string;
  isAdmin?: boolean;
}

export interface PlayerStats {
  MV: number;
  FU: string;
  AG: string;
  PS: string;
  AR: string;
}

export interface Player {
  qty: string;
  position: string;
  cost: number;
  stats: PlayerStats;
  /** Canonical English skill keys — resolved to localized names via the skills data */
  skillKeys: string[];
  primary: string;
  secondary: string;
  /** @deprecated Kept for migration */
  skills?: string;
}

export const ELITE_SKILLS = ["Block", "Dodge", "Guard", "Mighty Blow (+1)", "Mighty Blow (+2)", "Mighty Blow"];

export const getSkillExtraCost = (skillKey: string): number => {
    if (ELITE_SKILLS.includes(skillKey)) return 10000;
    return 0;
};

export interface Skill {
  keyEN: string; // Now required for the ecosystem
  name_es: string;
  name_en: string;
  category: string;
  desc_es: string;
  desc_en: string;
  /** @deprecated Kept temporarily for migration */
  name?: string;
  /** @deprecated Kept temporarily for migration */
  description?: string;
}

export interface StarPlayer {
  name: string;
  cost: number;
  stats?: PlayerStats;
  /** List of canonical skill keys (e.g., ["Block", "Dodge"]) */
  skillKeys?: string[];
  /** Bilingual special rules */
  specialRules_es: string;
  specialRules_en: string;
  playsFor: string[];
  image?: string;
  description?: string;
  /** @deprecated Use skillKeys instead */
  skills?: string;
  /** @deprecated Use specialRules_es/en */
  specialRules?: string;
  pair?: { name: string; stats: PlayerStats; skills: string; skillKeys?: string[]; }[];
}

export interface Team {
  name: string;
  specialRules_es: string;
  specialRules_en: string;
  rerollCost: number;
  tier: number;
  apothecary: string;
  roster: Player[];
  image?: string;
  /** @deprecated Use specialRules_es/en */
  specialRules?: string;
  ratings: {
    fuerza: number;
    agilidad: number;
    velocidad: number;
    armadura: number;
    pase: number;
  };
}

export type PlayerStatus = 'Activo' | 'Reserva' | 'KO' | 'Lesionado' | 'Expulsado' | 'Muerto';

export interface Prayer {
  diceRoll: string;
  title: string;
  description: string;
}

export type AdvancementType = 'RandomPrimary' | 'ChosenPrimary' | 'RandomSecondary' | 'ChosenSecondary' | 'Characteristic';

export interface Advancement {
  type: AdvancementType;
  sppCost: number;
  skillName?: string;
  characteristicName?: string;
}

export interface ManagedPlayer extends Player {
  id: number;
  customName: string;
  spp: number;
  gainedSkills: string[];
  lastingInjuries: string[];
  status: PlayerStatus;
  statusDetail?: string;
  isBenched?: boolean;
  missNextGame?: number;
  fieldPosition?: { x: number; y: number };
  sppActions?: Record<string, number>;
  isStarPlayer?: boolean;
  isJourneyman?: boolean;
  advancements?: Advancement[];
}

export interface ManagedTeam {
  id?: string;
  ownerId?: string;
  name: string;
  rosterName: string;
  treasury: number;
  rerolls: number;
  dedicatedFans: number;
  cheerleaders: number;
  assistantCoaches: number;
  apothecary: boolean;
  players: ManagedPlayer[];
  crestImage?: string;
  isAutoCalculating?: boolean;

  // For Live Match
  liveRerolls?: number;
  tempBribes?: number;
  tempCheerleaders?: number;
  tempAssistantCoaches?: number;
  coachExpelled?: boolean;
  apothecaryUsedOnKO?: boolean;
  biasedRef?: boolean;
  wanderingApothecaries?: number;
  plagueDoctors?: number;
  mortuaryAssistants?: number;
  updatedAt?: any;
  totalTV?: number;
  record?: {
    wins: number;
    draws: number;
    losses: number;
  };
  history?: Array<{
    id: string;
    opponentName: string;
    score: string;
    date: string;
    result: 'W' | 'D' | 'L';
  }>;
}

export interface DrawingPath {
  id: string;
  type: 'move' | 'pass' | 'defense';
  points: { x: number; y: number }[];
}

export interface Play {
  id?: string;
  name: string;
  description?: string;
  rosterName: string;
  tokens: BoardToken[];
  paths?: DrawingPath[];
}

export interface CompetitionTeam {
  teamName: string;
  ownerId: string;
  ownerName: string;
}

export interface Matchup {
  team1: string;
  team2: string;
  score1?: number;
  score2?: number;
  winner?: string;
  played?: boolean;
}

export interface Competition {
  id: string;
  name: string;
  ownerId: string;
  ownerName?: string;
  format: 'Liguilla' | 'Torneo';
  status: 'Open' | 'In Progress' | 'Finished';
  teams: CompetitionTeam[];
  schedule?: Record<string, Matchup[]> | null;
  bracket?: Record<string, Matchup[]> | null;
  createdAt?: any;
}

export type League = Competition;

export type GameEventType =
  // Match & Turn
  | 'match_start' | 'match_end' | 'turn_start' | 'turn_end'
  | 'TOUCHDOWN' | 'INJURY' | 'FOUL' | 'INTERCEPTION' | 'PICKUP' | 'PASS' | 'EXPULSION'
  // Movement
  | 'move' | 'rush' | 'rush_fail' | 'dodge' | 'dodge_fail' | 'pickup_ball' | 'pickup_fail'
  // Block
  | 'block' | 'push' | 'knockdown' | 'both_down' | 'attacker_down'
  // Armor & Injury
  | 'armor_break' | 'armor_hold' | 'injury_stunned' | 'injury_ko' | 'injury_casualty'
  // Ball
  | 'pass_attempt' | 'pass_complete' | 'pass_failed' | 'interception' | 'handoff' | 'ball_scatter' | 'ball_drop'
  // Scoring
  | 'touchdown' | 'extra_point'
  // Fouls
  | 'foul_attempt' | 'foul_success' | 'foul_fail' | 'player_sent_off'
  // Players
  | 'star_player_hired' | 'star_player_action' | 'mvp_awarded'
  // Resources
  | 'reroll_used' | 'apothecary_used' | 'bribe_used'
  // Info & Other
  | 'WEATHER' | 'KICKOFF' | 'TURNOVER' | 'INFO' | 'OTHER' | 'DEATH'
  | 'DEFLECT' | 'THROW_TEAM_MATE';

export interface GameEvent {
  id: number;
  matchId?: string;
  team?: string;
  player?: string | number;
  turn: number;
  half: 1 | 2;
  type: GameEventType;
  result?: 'success' | 'fail' | string;
  target?: string | number;
  description: string;
  timestamp: string;
}

export interface Inducement {
  name: string;
  cost: number;
  description: string;
  strategy?: string;
  category?: string;
}

export interface WeatherCondition {
  diceRoll: string;
  title: string;
  description: string;
}

export interface KickoffEvent {
  diceRoll: string;
  title: string;
  description: string;
}

export type SppActionType = 'TD' | 'CASUALTY' | 'PASS' | 'INT' | 'MVP' | 'INTERFERENCE' | 'DEFLECT' | 'THROW_TEAM_MATE';

// Board / Tactical
export interface InjuryEvent {
  diceRoll: string;
  title: string;
  description: string;
}

export interface CasualtyEvent {
  diceRoll: string;
  title: string;
  description: string;
}

export interface LastingInjuryEvent {
  diceRoll: string;
  permanentInjury: string;
  characteristicReduction: string;
}

export interface Rule {
  text: string;
  dice?: string;
  subRules?: Rule[];
}

export interface Token {
  id: number;
  x: number;
  y: number;
}

export type PlayerPosition = 'Blitzer' | 'Lanzador' | 'Corredor' | 'Línea' | 'Receptor';

export interface BoardToken extends Token {
  playerRef?: string;
  position?: string;
  teamSide: 'home' | 'away';
  teamId?: string;
  playerData?: ManagedPlayer;
  isDown?: boolean;
}

export interface GameRule {
  text: string;
  dice?: string;
  subRules?: { text: string; dice?: string }[];
}

export interface GameSection {
  title: string;
  rules: GameRule[];
}

export interface MatchStats {
  passes: { home: number, opponent: number };
  interceptions: { home: number, opponent: number };
  fouls: { home: number, opponent: number };
  expulsions: { home: number, opponent: number };
  casualties: { home: number, opponent: number };
  rerollsUsed: { home: number, opponent: number };
}

export interface MatchReport {
  id: string;
  date: string;
  homeTeam: {
    id?: string;
    name: string;
    rosterName: string;
    score: number;
    crestImage?: string;
  };
  opponentTeam: {
    id?: string;
    name: string;
    rosterName: string;
    score: number;
    crestImage?: string;
  };
  gameLog: GameEvent[];
  weather?: string;
  spectators?: number;
  winner?: 'home' | 'opponent' | 'draw';
  createdAt?: any;
  headline?: string;
  subHeadline?: string;
  article?: string;
  summary?: string;
  stats?: MatchStats;
  wasConceded?: 'home' | 'opponent' | 'none';
}