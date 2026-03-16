import type { 
    ManagedTeam, 
    GameEvent, 
    ManagedPlayer, 
    WeatherCondition, 
    KickoffEvent, 
    StarPlayer, 
    MatchReport,
    SppActionType
} from '../../../../types';

export type GameState = 'setup' | 'selection' | 'pre_game' | 'in_progress' | 'post_game' | 'ko_recovery' | 'reports';

export interface BlockResolution {
    knockDowns: { id: number; isTurnoverSource: boolean }[];
    ballBecomesLoose: boolean;
    summary: string[];
}

export interface FoulState {
    step: 'select_fouler_team' | 'select_fouler' | 'select_victim' | 'armor_roll' | 'injury_roll' | 'casualty_roll' | 'lasting_injury_roll' | 'summary';
    foulingTeamId: 'home' | 'opponent' | null;
    foulingPlayer: ManagedPlayer | null;
    victimPlayer: ManagedPlayer | null;
    armorRoll: { roll: number; armorBroken: boolean; } | null;
    injuryRoll: { roll: number; result: string; } | null;
    casualtyRoll: { roll: number; result: string; } | null;
    lastingInjuryRoll: { roll: number; result: string; characteristic: string; } | null;
    wasExpelled: boolean;
    expulsionReason: string;
    log: string[];
    armorRollInput: { die1: string; die2: string; };
    injuryRollInput: { die1: string; die2: string; };
    casualtyRollInput: string;
    lastingInjuryRollInput: string;
}

export interface InjuryState {
    step: 'select_casualty_type' | 'select_attacker_team' | 'select_attacker' | 'select_victim_team' | 'select_victim' | 'armor_roll' | 'injury_roll' | 'apothecary' | 'casualty_roll' | 'lasting_injury_roll' | 'regeneration_check' | 'regeneration_roll' | 'staff_reroll_choice' | 'summary';
    victimTeamId: 'home' | 'opponent' | null;
    victimPlayer: ManagedPlayer | null;
    attackerTeamId: 'home' | 'opponent' | null;
    attackerPlayer: ManagedPlayer | null;
    isCasualty: boolean;
    isStunty: boolean;
    armorRoll: { roll: number; armorBroken: boolean; } | null;
    injuryRoll: { roll: number; result: string; } | null;
    casualtyRoll: { roll: number; result: string; rerolled: boolean } | null;
    lastingInjuryRoll: { roll: number; result: string; characteristic: string; } | null;
    log: string[];
    armorRollInput: { die1: string; die2: string; };
    injuryRollInput: { die1: string; die2: string; };
    casualtyRollInput: string;
    lastingInjuryRollInput: string;
    apothecaryAction: 'reroll' | 'patch_ko' | null;
    regenerationRollInput: string;
    regenerationRoll: { roll: number; success: boolean; } | null;
}

export type SppModalType = 'pass' | 'interference' | 'casualty' | 'deflect' | 'throw_team_mate';

export interface SppModalState {
    isOpen: boolean;
    type: SppModalType | null;
    step: 'select_team' | 'select_player' | 'interference_type';
    teamId: 'home' | 'opponent' | null;
    selectedPlayer: ManagedPlayer | null;
}

export interface TurnActions {
    home: { blitz: boolean; pass: boolean; foul: boolean; handoff: boolean; };
    opponent: { blitz: boolean; pass: boolean; foul: boolean; handoff: boolean; };
}

export interface InducementState {
    underdog: 'home' | 'opponent' | null;
    money: number;
    hiredStars: StarPlayer[];
}

export interface GameStatusState {
    weather: WeatherCondition | null;
    kickoffEvent: KickoffEvent | null;
    coinTossWinner: 'home' | 'opponent' | null;
    receivingTeam: 'home' | 'opponent' | null;
}

export interface GameBoardProps {
    managedTeams: ManagedTeam[];
    matchReports?: MatchReport[];
    onTeamUpdate: (team: ManagedTeam) => void;
    onMatchReportCreate?: (report: Omit<MatchReport, 'id'>) => Promise<string | null>;
}
