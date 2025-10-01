


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
  x: number; // grid x (0-14)
  y: number; // grid y (0-12)
  position: PlayerPosition;
}

export interface Play {
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

export interface StarPlayer {
    name: string;
    cost: number;
    stats: PlayerStats;
    skills: string;
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
}

export interface ManagedTeam {
  name: string;
  rosterName: string;
  treasury: number;
  rerolls: number;
  dedicatedFans: number;
  cheerleaders: number;
  assistantCoaches: number;
  apothecary: boolean;
  players: ManagedPlayer[];
  // Live game specific, optional
  liveRerolls?: number;
  tempBribes?: number;
  tempCheerleaders?: number;
  tempAssistantCoaches?: number;
  coachExpelled?: boolean;
  apothecaryUsedOnKO?: boolean;
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