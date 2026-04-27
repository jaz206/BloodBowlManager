
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
  PA: string;
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
  crestScale?: number;
  crestOffsetY?: number;
  /** @deprecated Use specialRules_es/en */
  specialRules?: string;
  ratings: {
    fuerza: number;
    agilidad: number;
    velocidad: number;
    armadura: number;
    pase: number;
  };
  description?: string;
  megaFactions?: string[];
  namePools?: string[];
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
  jerseyNumber?: number;
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
  // S3 Condition States
  isDistracted?: boolean;
  hasIndigestion?: boolean;
  isActivated?: boolean;
  image?: string;
}

export interface ManagedTeamSnapshot {
  id: string;
  timestamp: string;
  matchId?: string;
  teamState: Omit<ManagedTeam, 'snapshots'>; // Prevent deep nesting
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
  crestScale?: number;
  crestOffsetY?: number;
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
  tempWizard?: boolean;
  fanAttendance?: number;
  hasStalled?: boolean;
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
  snapshots?: ManagedTeamSnapshot[];
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
  style?: string;
  teamId?: string;
  opponentTeamId?: string;
  rosterName: string;
  tokens: BoardToken[];
  paths?: DrawingPath[];
  ballPosition?: { x: number; y: number };
}

export interface CompetitionTeam {
  teamName: string;
  ownerId: string;
  ownerName: string;
  // Franquicia de Competición (Clon)
  teamState?: ManagedTeam;
  stats?: {
    played: number;
    won: number;
    drawn: number;
    lost: number;
    tdFor: number;
    tdAgainst: number;
    casFor: number;
    casAgainst: number;
    points: number;
  };
}

export type MatchInjuryOutcome = 'none' | 'stunned' | 'ko' | 'mng' | 'casualty' | 'death';

export interface MatchPlayerResult {
  playerId: number;
  playerName: string;
  td: number;
  cas: number;
  passes: number;
  interceptions: number;
  mvp: boolean;
  injury: MatchInjuryOutcome;
  permanentInjury?: string;
}

export interface MatchTeamResult {
  teamName: string;
  ownerId: string;
  ownerName: string;
  score: number;
  mvpPlayerId?: number | null;
  players: MatchPlayerResult[];
}

export interface MatchResolution {
  submittedBy?: string;
  submittedAt?: any;
  notes?: string;
  winnerTeam?: string;
  team1: MatchTeamResult;
  team2: MatchTeamResult;
}

export interface Matchup {
  team1: string;
  team2: string;
  score1?: number;
  score2?: number;
  winner?: string;
  played?: boolean;
  resolution?: MatchResolution;
}

export interface CompetitionRules {
  reglamento: 'BB2025' | 'BB2020' | 'BB2016' | 'Sevens';
  muerteSubita: boolean;
  incentivos: 'Todos' | 'Reducidos' | 'Ninguno';
  tiempoTurno: number;
  mercenarios: boolean;
}

export interface Competition {
  id: string;
  name: string;
  ownerId: string;
  ownerName?: string;
  createdBy?: string;
  participantIds?: string[];
  joinCode?: string;
  format: 'Liguilla' | 'Torneo';
  status: 'Open' | 'In Progress' | 'Finished';
  visibility?: 'Public' | 'Private'; // Nueva propiedad
  maxTeams?: number; // Nueva propiedad S3
  teams: CompetitionTeam[];
  schedule?: Record<string, Matchup[]> | null;
  bracket?: Record<string, Matchup[]> | null;
  createdAt?: any;
  rules?: CompetitionRules;
  baseTeam?: ManagedTeam; // Equipo base del propietario (host)
  reports?: MatchReport[]; // Crónicas y noticias S3
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

export type SppActionType = 'TD' | 'CASUALTY' | 'PASS' | 'INT' | 'MVP' | 'INTERFERENCE' | 'DEFLECT' | 'THROW_TEAM_MATE' | 'HANDOFF';

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
  matchMode?: 'friendly' | 'competition';
  competitionId?: string;
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

export interface HeraldoItem {
  id?: string;
  type: 'starplayer' | 'skill' | 'team';
  tag: string;
  category: string;
  title: string;
  content: string;
  rule: string;
  image?: string;
  active?: boolean;
}
