
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
  skills: string;
  primary: string;
  secondary: string;
}

export interface Skill {
  name: string;
  category: string;
  description: string;
}

export interface StarPlayer {
  name: string;
  cost: number;
  stats: PlayerStats;
  skills: string;
  specialRules: string;
  playsFor: string[];
  image?: string;
  description?: string;
  pair?: { name: string; stats: PlayerStats; skills: string; }[];
}

export interface Team {
  name: string;
  specialRules: string;
  rerollCost: number;
  tier: number;
  apothecary: string;
  roster: Player[];
  image?: string;
  ratings: {
    fuerza: number;
    agilidad: number;
    velocidad: number;
    armadura: number;
    pase: number;
  };
}

export type PlayerStatus = 'Activo' | 'Reserva' | 'KO' | 'Lesionado' | 'Expulsado' | 'Muerto';

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
}

export interface Play {
  id?: string;
  name: string;
  description?: string;
  rosterName: string;
  tokens: BoardToken[];
}

export interface League {
  id: string;
  ownerId: string;
  name: string;
  description?: string;
  participants: { teamId: string; ownerName: string; teamName: string; }[];
  status: 'Abierta' | 'En Progreso' | 'Finalizada';
  createdAt: any;
}

export type GameEventType =
  | 'TOUCHDOWN'
  | 'INJURY'
  | 'FOUL'
  | 'INTERCEPTION'
  | 'PICKUP'
  | 'PASS'
  | 'EXPULSION'
  | 'TURNOVER'
  | 'WEATHER'
  | 'KICKOFF'
  | 'INFO'
  | 'OTHER';

export interface GameEvent {
  id: number;
  turn: number;
  half: 1 | 2;
  type: GameEventType;
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
  roll: string; // Corrected field name
  title: string;
  description: string;
}

export interface KickoffEvent {
  roll: string; // Corrected field name
  title: string;
  description: string;
}

export type SppActionType = 'TD' | 'CAS' | 'COMP' | 'INT' | 'MVP' | 'INTERFERENCE';

// Board / Tactical
export interface BoardToken {
  id: number;
  x: number;
  y: number;
  playerRef?: string;
  teamSide: 'home' | 'away';
  isDown?: boolean;
}