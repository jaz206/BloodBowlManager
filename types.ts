

export interface User {
  id: string;
  name: string;
  email: string;
  picture: string;
}

export interface Rule {
  text: string;
  subRules?: Rule[];
  dice?: string;
}

export interface GameSection {
  title: string;
  rules: Rule[];
}

export interface WeatherCondition {
  roll: string;
  title: string;
  description: string;
}

export interface KickoffEvent {
  diceRoll: string;
  title: string;
  description: string;
}

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

export type PlayerPosition = 'Blitzer' | 'Lanzador' | 'Corredor' | 'Línea' | 'Receptor';

export interface Token {
  id: number;
  x: number; // grid x
  y: number; // grid y
  position: PlayerPosition;
}

export interface BoardToken extends Token {
    teamId: 'home' | 'away';
    playerData?: ManagedPlayer;
    isDown?: boolean;
    hasMoved?: boolean;
    hasActed?: boolean;
}

export interface Play {
  id?: string;
  name: string;
  tokens: Token[];
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
  skills: string;
  primary: string;
  secondary: string;
}

export interface PairedPlayer {
    name: string;
    stats: PlayerStats;
    skills: string;
}

export interface StarPlayer {
    name: string;
    cost: number;
    stats?: PlayerStats;
    skills?: string;
    pair?: [PairedPlayer, PairedPlayer];
    specialRules: string;
    playsFor: string[];
    image?: string;
}


export interface Team {
  name: string;
  specialRules: string;
  rerollCost: number;
  tier: number;
  apothecary: string;
  roster: Player[];
  image?: string;
}

export interface Skill {
    name: string;
    category: string;
    description: string;
}

export interface Prayer {
    diceRoll: string;
    title: string;
    description: string;
}

export type PlayerStatus = 'Activo' | 'Reserva' | 'KO' | 'Lesionado' | 'Expulsado' | 'Muerto';
export type SppActionType = 'TD' | 'PASS' | 'CASUALTY' | 'INTERFERENCE';

// Team Manager Types
export interface ManagedPlayer extends Player {
  id: number;
  customName: string;
  spp: number;
  gainedSkills: string[];
  lastingInjuries: string[];
  status?: PlayerStatus;
  statusDetail?: string;
  isStarPlayer?: boolean;
  sppActions?: Partial<Record<SppActionType, number>>;
  isJourneyman?: boolean;
  missNextGame?: number;
  isBenched?: boolean;
}

export interface ManagedTeam {
  id?: string; // For Firestore document ID
  name: string;
  rosterName: string;
  treasury: number;
  rerolls: number;
  dedicatedFans: number;
  cheerleaders: number;
  assistantCoaches: number;
  apothecary: boolean;
  players: ManagedPlayer[];
  crestImage?: string; // Base64 data URL for the team crest
  // Live game specific, optional
  liveRerolls?: number;
  tempBribes?: number;
  tempCheerleaders?: number;
  tempAssistantCoaches?: number;
  coachExpelled?: boolean;
  apothecaryUsedOnKO?: boolean;
}

// Competition Types
export interface Matchup {
  team1: string;
  team2: string;
  winner?: string | null;
  score1?: number | null;
  score2?: number | null;
}

export interface CompetitionTeam {
  teamName: string;
  ownerId: string;
  ownerName: string;
}

export interface Competition {
  id: string;
  name: string;
  format: 'Liguilla' | 'Torneo';
  teams: CompetitionTeam[];
  schedule?: Record<string, Matchup[]> | null; // For Liguilla (round-robin)
  bracket?: Record<string, Matchup[]> | null;  // For Torneo (knockout)
  ownerId: string;
  ownerName: string;
  status: 'Open' | 'In Progress' | 'Finished';
}


// Live Game Types
export type GameEventType = 'INFO' | 'KICKOFF' | 'TOUCHDOWN' | 'INJURY' | 'FOUL' | 'WEATHER' | 'OTHER' | 'TURNOVER';

export interface GameEvent {
    id: number;
    timestamp: string;
    turn: number;
    half: number;
    type: GameEventType;
    description: string;
}