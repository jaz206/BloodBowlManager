import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import type { ManagedTeam, GameEvent, GameEventType, ManagedPlayer, WeatherCondition, KickoffEvent, PlayerStatus, StarPlayer, SppActionType, Team, Skill } from '../../types';
import { weatherConditions } from '../../data/weather';
import { kickoffEvents } from '../../data/kickoffEvents';
import { teamsData } from '../../data/teams';
import { starPlayersData } from '../../data/starPlayers';
import { casualtyResults } from '../../data/casualties';
import { lastingInjuryResults } from '../../data/lastingInjuries';
import { generateRandomName } from '../../data/randomNames';
import SunIcon from '../../components/icons/SunIcon';
import CloudRainIcon from '../../components/icons/CloudRainIcon';
import SnowflakeIcon from '../../components/icons/SnowflakeIcon';
import FireIcon from '../../components/icons/FireIcon';
import CloudIcon from '../../components/icons/CloudIcon';
import PlayerStatusCard from '../../components/arena/PlayerStatusCard';
import PostGameWizardComponent from '../../components/arena/PostGameWizard';
import DownloadIcon from '../../components/icons/DownloadIcon';
import StarPlayerModal from '../../components/oracle/StarPlayerModal';
import QuestionMarkCircleIcon from '../../components/icons/QuestionMarkCircleIcon';
import TdIcon from '../../components/icons/TdIcon';
import PassIcon from '../../components/icons/PassIcon';
import CasualtyIcon from '../../components/icons/CasualtyIcon';
import InterferenceIcon from '../../components/icons/InterferenceIcon';
import PrayersModal from '../../components/arena/PrayersModal';
import TurnoverModal from '../../components/arena/TurnoverModal';
import PlayerCardModal from '../../components/arena/PlayerCardModal';
import { skillsData } from '../../data/skills';
import SkillModal from '../../components/oracle/SkillModal';
import ApothecaryModal from '../../components/arena/ApothecaryModal';
import ChevronDownIcon from '../../components/icons/ChevronDownIcon';
import ShieldCheckIcon from '../../components/icons/ShieldCheckIcon';
import MiniField from '../../components/common/MiniField';
import MatchNarrator from '../../components/arena/MatchNarrator';
import StadiumIcon from '../../components/icons/StadiumIcon';
import DiceIcon from '../../components/icons/DiceIcon';
import BallIcon from '../../components/icons/BallIcon';


const playSound = (type: string) => {
    console.log(`Playing sound: ${type}`);
};

declare const Html5Qrcode: any;
declare const XLSX: any;

export interface BlockResolution {
    knockDowns: { id: number; isTurnoverSource: boolean }[];
    ballBecomesLoose: boolean;
    summary: string[];
}

interface GameBoardProps {
    managedTeams: ManagedTeam[];
    onTeamUpdate: (team: ManagedTeam) => void;
}

type GameState = 'setup' | 'selection' | 'pre_game' | 'in_progress' | 'post_game' | 'ko_recovery';

interface FoulState {
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

interface InjuryState {
    step: 'select_victim_team' | 'select_victim' | 'armor_roll' | 'injury_roll' | 'apothecary' | 'casualty_roll' | 'lasting_injury_roll' | 'regeneration_check' | 'regeneration_roll' | 'staff_reroll_choice' | 'summary';
    victimTeamId: 'home' | 'opponent' | null;
    victimPlayer: ManagedPlayer | null;
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

const PlayerButton: React.FC<{ player: ManagedPlayer, onSelect: (p: ManagedPlayer) => void, disabled?: boolean }> = ({ player, onSelect, disabled }) => (
    <button onClick={() => onSelect(player)} className="bento-card w-full text-left p-4 disabled:opacity-30 disabled:cursor-not-allowed group" disabled={disabled}>
        <div className="flex justify-between items-start">
            <p className="font-display text-lg font-bold text-white group-hover:text-premium-gold transition-colors">
                {player.isStarPlayer && <span className="text-premium-gold mr-2">★</span>}
                {player.customName}
            </p>
            {player.isJourneyman && <span className="text-[10px] font-display bg-white/10 px-2 py-0.5 rounded text-slate-400 uppercase tracking-tighter">Sustituto</span>}
        </div>
        <p className="text-xs font-display text-slate-500 uppercase tracking-wider mt-1">{player.position}</p>
    </button>
);

const DiceBulletIcon = () => (
    <div className="grid grid-cols-2 gap-1 px-1">
        <div className="w-1.5 h-1.5 bg-blood-red rounded-full"></div>
        <div className="w-1.5 h-1.5 bg-blood-red rounded-full"></div>
        <div className="w-1.5 h-1.5 bg-blood-red rounded-full"></div>
        <div className="w-1.5 h-1.5 bg-blood-red rounded-full"></div>
    </div>
);

const DiceRollButton = ({ onRoll, max = 6, onPlaySound }: { onRoll: (val: number) => void, max?: number, onPlaySound?: () => void }) => {
    const [isRolling, setIsRolling] = React.useState(false);
    const handleRoll = () => {
        setIsRolling(true);
        if (onPlaySound) onPlaySound();
        setTimeout(() => {
            const roll = Math.floor(Math.random() * max) + 1;
            onRoll(roll);
            setIsRolling(false);
        }, 600);
    };

    return (
        <button
            onClick={handleRoll}
            disabled={isRolling}
            className={`die-container ${isRolling ? 'animate-roll shake' : ''} bg-white rounded-lg shadow-lg flex items-center justify-center border-2 border-slate-200 hover:border-premium-gold transition-colors w-12 h-12`}
            title={`Lanzar D${max}`}
        >
            <div className="die-face relative flex items-center justify-center w-full h-full">
                {max === 6 ? (
                    <DiceBulletIcon />
                ) : (
                    <span className="text-xl font-display font-black text-blood-red drop-shadow-sm">
                        {max}
                    </span>
                )}
                <div className="absolute -bottom-1 -right-1 text-[8px] font-bold text-slate-400 opacity-50 bg-white/80 px-0.5 rounded">
                    D{max}
                </div>
            </div>
        </button>
    );
};

const RollInputStep = ({ title, value, onChange, onNext, onBack, label, pattern, placeholder, onPlaySound }: { title: string, value: string, onChange: (v: string) => void, onNext: () => void, onBack?: () => void, label: string, pattern: string, placeholder?: string, onPlaySound?: () => void }) => {
    const maxVal = pattern.includes('16') ? 16 : 6;
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h3 className="text-2xl font-display font-bold text-premium-gold mb-4 uppercase tracking-wider underline decoration-premium-gold/30 underline-offset-8">{title}</h3>
            <label className="block text-xs font-display font-bold text-slate-400 mb-2 uppercase tracking-widest">{label}</label>

            <div className="flex items-center gap-6 mb-8 bg-black/20 p-6 rounded-2xl border border-white/5">
                <input
                    type="text"
                    pattern={pattern}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    className="flex-1 bg-black/40 border border-white/10 rounded-xl py-3 px-6 text-xl text-white font-display focus:border-premium-gold/50 outline-none transition-premium"
                    placeholder={placeholder || ""}
                    autoFocus
                />
                <div className="w-px h-12 bg-white/10"></div>
                <DiceRollButton max={maxVal} onRoll={v => onChange(v.toString())} onPlaySound={() => onPlaySound && onPlaySound()} />
            </div>

            <div className="flex justify-between gap-4">
                {onBack && <button onClick={onBack} className="flex-1 font-display font-bold uppercase tracking-widest text-slate-400 py-3 px-6 rounded-xl border border-white/10 hover:bg-white/5 transition-premium">Atrás</button>}
                <button onClick={onNext} className="flex-1 bg-premium-gold text-black font-display font-black uppercase tracking-widest py-3 px-6 rounded-xl shadow-2xl hover:bg-premium-light transition-premium">Siguiente</button>
            </div>
        </div>
    );
};

const DoubleDiceInputStep = ({ title, value, onChange, onNext, onBack, label, onPlaySound }: { title: string, value: { die1: string; die2: string; }, onChange: (v: { die1: string; die2: string; }) => void, onNext: () => void, onBack?: () => void, label: string, onPlaySound?: () => void }) => {
    const die1Ref = React.useRef<HTMLInputElement>(null);
    const die2Ref = React.useRef<HTMLInputElement>(null);

    const handleDieChange = (die: 'die1' | 'die2', val: string) => {
        const cleanVal = val.replace(/[^1-6]/g, '').slice(0, 1);
        onChange({ ...value, [die]: cleanVal });
        if (die === 'die1' && cleanVal.length === 1) die2Ref.current?.focus();
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h3 className="text-2xl font-display font-bold text-premium-gold mb-4 uppercase tracking-wider underline decoration-premium-gold/30 underline-offset-8">{title}</h3>
            <label className="block text-xs font-display font-bold text-slate-400 mb-2 uppercase tracking-widest">{label}</label>

            <div className="flex items-center gap-4 mb-8 bg-black/20 p-6 rounded-2xl border border-white/5">
                <div className="flex-1 space-y-2">
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Manual</p>
                    <div className="flex items-center gap-2">
                        <input ref={die1Ref} type="text" pattern="[1-6]" value={value.die1} onChange={e => handleDieChange('die1', e.target.value)} className="w-12 bg-black/40 border border-white/10 rounded-xl py-2 text-center text-xl text-white font-display focus:border-premium-gold/50 outline-none transition-premium" placeholder="?" autoFocus />
                        <span className="text-xl font-bold text-slate-600">+</span>
                        <input ref={die2Ref} type="text" pattern="[1-6]" value={value.die2} onChange={e => handleDieChange('die2', e.target.value)} className="w-12 bg-black/40 border border-white/10 rounded-xl py-2 text-center text-xl text-white font-display focus:border-premium-gold/50 outline-none transition-premium" placeholder="?" />
                    </div>
                </div>

                <div className="w-px h-12 bg-white/10"></div>

                <div className="flex-1 space-y-2 flex flex-col items-center">
                    <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Lanzar</p>
                    <div className="flex gap-2">
                        <DiceRollButton onRoll={v => onChange({ ...value, die1: v.toString() })} onPlaySound={() => onPlaySound && onPlaySound()} />
                        <DiceRollButton onRoll={v => onChange({ ...value, die2: v.toString() })} onPlaySound={() => onPlaySound && onPlaySound()} />
                    </div>
                </div>
            </div>

            <div className="flex justify-between gap-4">
                {onBack && <button onClick={onBack} className="flex-1 font-display font-bold uppercase tracking-widest text-slate-400 py-3 px-6 rounded-xl border border-white/10 hover:bg-white/5 transition-premium">Atrás</button>}
                <button onClick={onNext} className="flex-1 bg-premium-gold text-black font-display font-black uppercase tracking-widest py-3 px-6 rounded-xl shadow-2xl hover:bg-premium-light transition-premium">Siguiente</button>
            </div>
        </div>
    );
};

const calculateTeamValue = (team: ManagedTeam | null, includeInducementsForPrayers = false): number => {
    if (!team) return 0;
    const baseRoster = teamsData.find(t => t.name === team.rosterName);
    if (!baseRoster) return 0;

    const playersValue = team.players.reduce((sum, p) => {
        const skillsValue = p.gainedSkills.reduce((skillSum, skillName) => {
            if (skillName.toLowerCase().includes('secundaria')) return skillSum + 40000;
            if (skillName.toLowerCase().includes('solitario')) return skillSum;
            return skillSum + 20000;
        }, 0);
        return sum + p.cost + skillsValue;
    }, 0);

    const rerollsValue = team.rerolls * baseRoster.rerollCost;
    const apothecaryValue = team.apothecary && baseRoster.apothecary === "Sí" ? 50000 : 0;
    const staffValue = (team.cheerleaders + team.assistantCoaches) * 10000;
    const fansValue = (team.dedicatedFans - 1) * 10000;

    let totalValue = playersValue + rerollsValue + apothecaryValue + staffValue + fansValue;

    if (includeInducementsForPrayers) {
        const tempStaffValue = ((team.tempCheerleaders || 0) + (team.tempAssistantCoaches || 0)) * 10000;
        const tempBribesValue = (team.tempBribes || 0) * (baseRoster.specialRules.includes("Sobornos y corrupción") ? 50000 : 100000);
        totalValue += tempStaffValue + tempBribesValue;
    }

    return totalValue;
};


const isEligibleStar = (star: StarPlayer, teamRoster: Team | undefined) => {
    if (!teamRoster) return false;
    const teamRules = (teamRoster.specialRules || teamRoster.specialRules_es || '').split(', ').map((r: string) => r.trim());
    const anyTeamRule = star.playsFor.find(r => r.startsWith("Any Team"));
    if (anyTeamRule) {
        if (anyTeamRule.includes("except Sylvanian Spotlight")) return !teamRules.includes("Selectiva de Sylvania");
        return true;
    }
    return star.playsFor.some(faction => {
        if (teamRules.includes(faction)) return true;
        if (faction.startsWith("Elegidos de")) {
            const chaosGod = faction.replace("Elegidos de ", "").trim();
            if (chaosGod === "...") return teamRules.some(rule => rule.startsWith("Elegidos de..."));
            return teamRules.some(rule => rule.startsWith("Elegidos de...") && rule.includes(chaosGod));
        }
        return false;
    });
};

const cloneLiveTeam = (team: ManagedTeam): ManagedTeam => {
    // Safe deep clone to prevent circular reference errors with Firestore objects
    const clonedPlayers = team.players.map(p => {
        const clonedPlayer = { ...p };
        // Deep copy nested objects/arrays inside player
        clonedPlayer.gainedSkills = [...p.gainedSkills];
        clonedPlayer.lastingInjuries = [...p.lastingInjuries];
        if (p.sppActions) {
            clonedPlayer.sppActions = { ...p.sppActions };
        }
        if (p.fieldPosition) {
            clonedPlayer.fieldPosition = { ...p.fieldPosition };
        }
        return clonedPlayer;
    });

    const clonedTeam: ManagedTeam = {
        name: team.name,
        rosterName: team.rosterName,
        treasury: team.treasury,
        rerolls: team.rerolls,
        dedicatedFans: team.dedicatedFans,
        cheerleaders: team.cheerleaders,
        assistantCoaches: team.assistantCoaches,
        apothecary: team.apothecary,
        players: clonedPlayers,
    };

    // Copy optional properties
    if (team.id) clonedTeam.id = team.id;
    if (team.crestImage) clonedTeam.crestImage = team.crestImage;
    if (team.liveRerolls !== undefined) clonedTeam.liveRerolls = team.liveRerolls;
    if (team.tempBribes !== undefined) clonedTeam.tempBribes = team.tempBribes;
    if (team.tempCheerleaders !== undefined) clonedTeam.tempCheerleaders = team.tempCheerleaders;
    if (team.tempAssistantCoaches !== undefined) clonedTeam.tempAssistantCoaches = team.tempAssistantCoaches;
    if (team.coachExpelled !== undefined) clonedTeam.coachExpelled = team.coachExpelled;
    if (team.apothecaryUsedOnKO !== undefined) clonedTeam.apothecaryUsedOnKO = team.apothecaryUsedOnKO;

    return clonedTeam;
};

const initialFoulState: FoulState = { step: 'select_fouler_team', foulingTeamId: null, foulingPlayer: null, victimPlayer: null, armorRoll: null, injuryRoll: null, casualtyRoll: null, lastingInjuryRoll: null, wasExpelled: false, expulsionReason: '', log: [], armorRollInput: { die1: '', die2: '' }, injuryRollInput: { die1: '', die2: '' }, casualtyRollInput: '', lastingInjuryRollInput: '' };
const initialInjuryState: InjuryState = { step: 'select_victim_team', victimTeamId: null, victimPlayer: null, isStunty: false, armorRoll: null, injuryRoll: null, casualtyRoll: null, lastingInjuryRoll: null, log: [], armorRollInput: { die1: '', die2: '' }, injuryRollInput: { die1: '', die2: '' }, casualtyRollInput: '', lastingInjuryRollInput: '', apothecaryAction: null, regenerationRollInput: '', regenerationRoll: null };

const GameBoard = ({ managedTeams, onTeamUpdate }: GameBoardProps): React.ReactElement => {
    const [gameState, setGameState] = useState<GameState>('setup');
    const [hasCamera, setHasCamera] = useState<boolean | null>(null);
    const [opponentTeam, setOpponentTeam] = useState<ManagedTeam | null>(null);
    const [homeTeam, setHomeTeam] = useState<ManagedTeam | null>(null);
    const [liveHomeTeam, setLiveHomeTeam] = useState<ManagedTeam | null>(null);
    const [liveOpponentTeam, setLiveOpponentTeam] = useState<ManagedTeam | null>(null);
    const [viewingPlayer, setViewingPlayer] = useState<ManagedPlayer | null>(null);
    const [selectedSkillForModal, setSelectedSkillForModal] = useState<Skill | null>(null);
    const [gameLog, setGameLog] = useState<GameEvent[]>([]);
    const [score, setScore] = useState({ home: 0, opponent: 0 });
    const [turn, setTurn] = useState(0);
    const [half, setHalf] = useState(1);
    const [firstHalfReceiver, setFirstHalfReceiver] = useState<'home' | 'opponent' | null>(null);
    const [fame, setFame] = useState({ home: 0, opponent: 0 });
    const [fansRoll, setFansRoll] = useState({ home: '', opponent: '' });
    const [preGameStep, setPreGameStep] = useState(0);
    const [gameStatus, setGameStatus] = useState<{ weather: WeatherCondition | null; kickoffEvent: KickoffEvent | null; coinTossWinner: 'home' | 'opponent' | null, receivingTeam: 'home' | 'opponent' | null }>({ weather: null, kickoffEvent: null, coinTossWinner: null, receivingTeam: null });
    const [inducementState, setInducementState] = useState<{ underdog: 'home' | 'opponent' | null, money: number; hiredStars: StarPlayer[] }>({ underdog: null, money: 0, hiredStars: [] });
    const [isTdModalOpen, setIsTdModalOpen] = useState(false);
    const [isFoulModalOpen, setIsFoulModalOpen] = useState(false);
    const [isTurnoverModalOpen, setIsTurnoverModalOpen] = useState(false);
    const [tdModalTeam, setTdModalTeam] = useState<'home' | 'opponent' | null>(null);
    const [isCustomEventModalOpen, setIsCustomEventModalOpen] = useState(false);
    const [customEventDescription, setCustomEventDescription] = useState('');
    const [isWeatherModalOpen, setIsWeatherModalOpen] = useState(false);
    const [isChangingWeatherModalOpen, setIsChangingWeatherModalOpen] = useState(false);
    const [koRecoveryRolls, setKoRecoveryRolls] = useState<Record<number, { roll: number, success: boolean } | null>>({});
    const [selectedStarPlayer, setSelectedStarPlayer] = useState<StarPlayer | null>(null);
    const [isPrayersModalOpen, setIsPrayersModalOpen] = useState(false);
    const [weatherRerollInput, setWeatherRerollInput] = useState('');
    const [kickoffActionCompleted, setKickoffActionCompleted] = useState(false);
    const [journeymenNotification, setJourneymenNotification] = useState<string | null>(null);
    const [pendingJourneymen, setPendingJourneymen] = useState<{ home: ManagedPlayer[], opponent: ManagedPlayer[] }>({ home: [], opponent: [] });
    const [activeTeamId, setActiveTeamId] = useState<'home' | 'opponent'>('home');
    const [selectedPlayerForAction, setSelectedPlayerForAction] = useState<ManagedPlayer | null>(null);
    type SppModalType = 'pass' | 'interference' | 'casualty';
    const [sppModalState, setSppModalState] = useState<{ isOpen: boolean; type: SppModalType | null; step: 'select_team' | 'select_player' | 'interference_type'; teamId: 'home' | 'opponent' | null; selectedPlayer: ManagedPlayer | null; }>({ isOpen: false, type: null, step: 'select_team', teamId: null, selectedPlayer: null });
    const [foulState, setFoulState] = useState<FoulState>(initialFoulState);
    const [isInjuryModalOpen, setIsInjuryModalOpen] = useState(false);
    const [injuryState, setInjuryState] = useState<InjuryState>(initialInjuryState);
    const [isApothecaryModalOpen, setIsApothecaryModalOpen] = useState(false);
    const [isLogVisible, setIsLogVisible] = useState(false);
    const [playersMissingNextGame, setPlayersMissingNextGame] = useState<{ playerId: number, teamId: 'home' | 'opponent' }[]>([]);
    const [ballCarrierId, setBallCarrierId] = useState<number | null>(null);
    const [prayersAlert, setPrayersAlert] = useState<{ underdog: string, difference: number } | null>(null);
    const [activeTab, setActiveTab] = useState<'assistant' | 'narrator'>('assistant');

    const playSound = useCallback((type: 'td' | 'injury' | 'turnover' | 'dice') => {
        // En un entorno real, aquí cargaríamos archivos .mp3 o .wav
        // Por ahora, simulamos con logs y preparamos la infraestructura
        console.log(`[AUDIO] Reproduciendo: ${type}`);
        // const audio = new Audio(`/sounds/${type}.mp3`);
        // audio.play().catch(e => console.warn("Audio play blocked", e));
    }, []);

    const handleBallToggle = (playerId: number) => {
        setBallCarrierId(prev => prev === playerId ? null : playerId);
    };

    const scannerRef = useRef<any>(null);
    const scannerContainerRef = useRef<HTMLDivElement>(null);
    const homeTV = useMemo(() => calculateTeamValue(liveHomeTeam), [liveHomeTeam]);
    const opponentTV = useMemo(() => calculateTeamValue(liveOpponentTeam), [liveOpponentTeam]);

    useEffect(() => { Html5Qrcode.getCameras().then((d: any[]) => setHasCamera(!!(d && d.length))).catch(() => setHasCamera(false)); }, []);
    useEffect(() => { if (gameStatus.kickoffEvent?.title === 'Clima Cambiante' && !kickoffActionCompleted) setIsChangingWeatherModalOpen(true); }, [gameStatus.kickoffEvent, kickoffActionCompleted]);

    useEffect(() => {
        if (gameState === 'selection' && scannerContainerRef.current) {
            // Scanner logic will be triggered by a button in selection view
        }
    }, [gameState]);

    useEffect(() => {
        if (homeTeam) {
            const liveTeam = cloneLiveTeam(homeTeam);
            liveTeam.players.forEach((p: ManagedPlayer) => {
                p.status = (p.isBenched ?? true) ? 'Reserva' : 'Activo';
                if (!p.sppActions) p.sppActions = {};
            });
            liveTeam.liveRerolls = liveTeam.rerolls;
            setLiveHomeTeam(liveTeam);
        }
    }, [homeTeam]);

    useEffect(() => {
        if (opponentTeam) {
            const liveTeam = cloneLiveTeam(opponentTeam);
            liveTeam.players.forEach((p: ManagedPlayer) => {
                if (!p.status) p.status = 'Reserva';
                p.fieldPosition = undefined;
                if (!p.sppActions) p.sppActions = {};
            });
            liveTeam.liveRerolls = liveTeam.rerolls;
            setLiveOpponentTeam(liveTeam);
        }
    }, [opponentTeam]);

    useEffect(() => {
        if (gameState === 'pre_game' && preGameStep === 0 && liveHomeTeam && liveOpponentTeam) {
            if (journeymenNotification || (pendingJourneymen.home.length > 0 || pendingJourneymen.opponent.length > 0)) return;
            const homeNeeded = Math.max(0, 11 - liveHomeTeam.players.length);
            const oppNeeded = Math.max(0, 11 - liveOpponentTeam.players.length);
            if (homeNeeded === 0 && oppNeeded === 0) {
                setPreGameStep(1);
                return;
            }
            let newHomeJourneymen: ManagedPlayer[] = [], homeMsg = '';
            if (homeNeeded > 0) {
                const baseRoster = teamsData.find(t => t.name === liveHomeTeam.rosterName);
                const lineman = baseRoster?.roster.find(p => p.position.toLowerCase().includes('línea') || p.position.toLowerCase().includes('lineman')) || baseRoster?.roster[0];
                if (lineman) {
                    const existingNames = new Set(liveHomeTeam.players.map(p => p.customName.toLowerCase()));
                    newHomeJourneymen = Array.from({ length: homeNeeded }).map((_, i): ManagedPlayer => {
                        let randomName = generateRandomName(liveHomeTeam.rosterName);
                        while (existingNames.has(randomName.toLowerCase())) randomName = generateRandomName(liveHomeTeam.rosterName);
                        existingNames.add(randomName.toLowerCase());
                        return { ...lineman, id: Date.now() + i + 1000, customName: randomName, spp: 0, gainedSkills: ['Solitario (4+)'], lastingInjuries: [], isJourneyman: true, status: 'Reserva' };
                    });
                    homeMsg = `${liveHomeTeam.name} añade ${homeNeeded} Sustituto(s).`;
                }
            }
            let newOppJourneymen: ManagedPlayer[] = [], oppMsg = '';
            if (oppNeeded > 0) {
                const baseRoster = teamsData.find(t => t.name === liveOpponentTeam.rosterName);
                const lineman = baseRoster?.roster.find(p => p.position.toLowerCase().includes('línea') || p.position.toLowerCase().includes('lineman')) || baseRoster?.roster[0];
                if (lineman) {
                    const existingNames = new Set(liveOpponentTeam.players.map(p => p.customName.toLowerCase()));
                    newOppJourneymen = Array.from({ length: oppNeeded }).map((_, i): ManagedPlayer => {
                        let randomName = generateRandomName(liveOpponentTeam.rosterName);
                        while (existingNames.has(randomName.toLowerCase())) randomName = generateRandomName(liveOpponentTeam.rosterName);
                        existingNames.add(randomName.toLowerCase());
                        return { ...lineman, id: Date.now() - i - 1000, customName: randomName, spp: 0, gainedSkills: ['Solitario (4+)'], lastingInjuries: [], isJourneyman: true, status: 'Reserva' };
                    });
                    oppMsg = `${liveOpponentTeam.name} añade ${oppNeeded} Sustituto(s).`;
                }
            }
            const notification = [homeMsg, oppMsg].filter(Boolean).join('\n');
            if (notification) { setPendingJourneymen({ home: newHomeJourneymen, opponent: newOppJourneymen }); setJourneymenNotification(notification); }
            else { setPreGameStep(1); }
        }
    }, [gameState, preGameStep, liveHomeTeam, liveOpponentTeam, journeymenNotification, pendingJourneymen]);

    useEffect(() => {
        if (gameState === 'pre_game' && preGameStep === 1 && liveHomeTeam && liveOpponentTeam) {
            const tvDiff = Math.abs(homeTV - opponentTV);
            const underdog = homeTV < opponentTV ? 'home' : (opponentTV < homeTV ? 'opponent' : null);
            if (underdog) {
                setInducementState(prev => ({ ...prev, money: tvDiff, underdog }));
                if (tvDiff >= 50000) {
                    setPrayersAlert({
                        underdog: underdog === 'home' ? liveHomeTeam.name : liveOpponentTeam.name,
                        difference: tvDiff
                    });
                }
            } else {
                setInducementState({ money: 0, hiredStars: [], underdog: null });
                setPrayersAlert(null);
            }
        }
    }, [gameState, preGameStep, homeTV, opponentTV, liveHomeTeam, liveOpponentTeam]);

    const logEvent = (type: GameEventType, description: string, extra?: Partial<Pick<GameEvent, 'team' | 'player' | 'result' | 'target'>>) => {
        setGameLog(prev => [{
            id: Date.now(),
            timestamp: new Date().toLocaleTimeString('es-ES'),
            turn,
            half,
            type,
            description,
            ...extra
        } as GameEvent, ...prev]);
    };
    const handleHalftime = () => {
        setTurn(0);
        setHalf(2);
        logEvent('INFO', 'Fin de la primera parte. Comienza la segunda parte.');
        setGameStatus(prev => ({ ...prev, kickoffEvent: null }));

        if (firstHalfReceiver) {
            const secondHalfReceiver = firstHalfReceiver === 'home' ? 'opponent' : 'home';
            setGameStatus(prev => ({ ...prev, receivingTeam: secondHalfReceiver }));
            logEvent('INFO', `Recibe en la segunda parte ${secondHalfReceiver === 'home' ? homeTeam?.name : opponentTeam?.name}.`);
            setGameState('pre_game');
            setPreGameStep(2); // Deployment
        } else {
            setGameState('pre_game');
            setPreGameStep(1); // Inducements/Fate/Coin Toss
        }
    };
    const handleConfirmJourneymen = () => { if (pendingJourneymen.home.length > 0 && liveHomeTeam) { setLiveHomeTeam(prev => prev ? ({ ...prev, players: [...prev.players, ...pendingJourneymen.home] }) : null); logEvent('INFO', `${liveHomeTeam.name} añade ${pendingJourneymen.home.length} Sustituto(s).`); } if (pendingJourneymen.opponent.length > 0 && liveOpponentTeam) { setLiveOpponentTeam(prev => prev ? ({ ...prev, players: [...prev.players, ...pendingJourneymen.opponent] }) : null); logEvent('INFO', `${liveOpponentTeam.name} añade ${pendingJourneymen.opponent.length} Sustituto(s).`); } setJourneymenNotification(null); setPendingJourneymen({ home: [], opponent: [] }); setPreGameStep(1); };
    const handleSkillClick = useCallback((skillName: string) => { const cleanedName = (skillName || '').split('(')[0].trim(); const foundSkill = skillsData.find(s => s.name.toLowerCase().startsWith(cleanedName.toLowerCase())); if (foundSkill) setSelectedSkillForModal(foundSkill); else console.warn(`Skill not found: ${cleanedName}`); }, []);
    const updatePlayerSppAndAction = (player: ManagedPlayer, teamId: 'home' | 'opponent', spp: number, action: SppActionType, description: string) => { const setTeam = teamId === 'home' ? setLiveHomeTeam : setLiveOpponentTeam; setTeam(prev => { if (!prev) return null; return { ...prev, players: prev.players.map(p => { if (p.id === player.id) { const newActions = { ...(p.sppActions || {}) }; newActions[action] = (newActions[action] || 0) + 1; return { ...p, spp: p.spp + spp, sppActions: newActions }; } return p; }) }; }); logEvent('INFO', `${player.customName} gana ${spp} PE por ${description}.`); setSppModalState({ isOpen: false, type: null, step: 'select_team', teamId: null, selectedPlayer: null }); };
    const updatePlayerStatus = (playerId: number, teamId: 'home' | 'opponent', status: PlayerStatus, statusDetail?: string) => { const setTeamToUpdate = teamId === 'home' ? setLiveHomeTeam : setLiveOpponentTeam; setTeamToUpdate(prevTeam => { if (!prevTeam) return null; return { ...prevTeam, players: prevTeam.players.map(p => p.id === playerId ? { ...p, status, statusDetail: statusDetail || '' } : p) }; }); };

    const handleSelectTdScorer = (scorer: ManagedPlayer) => {
        if (!tdModalTeam || !liveHomeTeam || !liveOpponentTeam) return;
        const teamName = tdModalTeam === 'home' ? liveHomeTeam.name : liveOpponentTeam.name;
        logEvent('touchdown', `${scorer.customName} ha anotado un Touchdown para ${teamName}!`, { team: tdModalTeam, player: scorer.id });
        setScore(s => ({ ...s, [tdModalTeam]: s[tdModalTeam] + 1 }));
        playSound('td');
        updatePlayerSppAndAction(scorer, tdModalTeam, 3, 'TD', `anotar un Touchdown para ${teamName}`);
        setIsTdModalOpen(false);
        setTdModalTeam(null);

        // This logic handles advancing turn/half after a TD
        const currentTurnForCheck = turn === 0 ? 1 : turn; // If TD happens during kickoff (turn 0), count as turn 1
        if (currentTurnForCheck >= 8 && half === 1) {
            handleHalftime();
        } else if (currentTurnForCheck >= 8 && half === 2) {
            logEvent('INFO', '¡Fin del partido!');
            setGameState('post_game');
        } else {
            setGameState('ko_recovery');
        }
    };

    const openSppModal = (type: SppModalType) => { setSppModalState({ isOpen: true, type: type, step: 'select_team', teamId: null, selectedPlayer: null }); };

    const handleStartDrive = () => {
        setGameState('in_progress');
        const isFirstTurnOfHalf = turn === 0;

        if (isFirstTurnOfHalf) {
            setTurn(1);
            if (half === 1) {
                logEvent('INFO', '¡Comienza el partido!');
            } else {
                logEvent('INFO', '¡Comienza la segunda parte!');
            }
        } else {
            logEvent('INFO', `Comienza la patada del turno ${turn}.`);
        }
    };

    const handleNextTurn = () => { if (turn < 8) { const newTurn = turn + 1; setTurn(newTurn); logEvent('INFO', `Comienza el turno ${newTurn} de la parte ${half}.`); } else if (half === 1) { handleHalftime(); } else { logEvent('INFO', '¡Fin del partido!'); setGameState('post_game'); } };
    const handleTurnover = (reason: string) => {
        logEvent('TURNOVER', `Cambio de turno: ${reason}.`);
        playSound('turnover');
        setIsTurnoverModalOpen(false);
        handleNextTurn();
    };
    const handleConfirmPostGame = (finalTeamState: ManagedTeam) => {
        if (!homeTeam) return;

        // Update History and Records
        const matchResult = score.home > score.opponent ? 'W' : score.home < score.opponent ? 'L' : 'D';
        const historyEntry = {
            id: Date.now().toString(),
            opponentName: opponentTeam?.name || 'Desconocido',
            score: `${score.home}-${score.opponent}`,
            date: new Date().toLocaleDateString('es-ES'),
            result: matchResult as 'W' | 'D' | 'L'
        };

        const finalTeamWithStats = {
            ...finalTeamState,
            history: [historyEntry, ...(finalTeamState.history || [])].slice(0, 20), // Keep last 20
            record: {
                wins: (finalTeamState.record?.wins || 0) + (matchResult === 'W' ? 1 : 0),
                draws: (finalTeamState.record?.draws || 0) + (matchResult === 'D' ? 1 : 0),
                losses: (finalTeamState.record?.losses || 0) + (matchResult === 'L' ? 1 : 0),
            }
        };

        onTeamUpdate(finalTeamWithStats);
        setGameState('setup');
        setHomeTeam(null);
        setOpponentTeam(null);
        setLiveHomeTeam(null);
        setLiveOpponentTeam(null);
        setGameLog([]);
        setScore({ home: 0, opponent: 0 });
        setTurn(0);
        setHalf(1);
        setFame({ home: 0, opponent: 0 });
        setFansRoll({ home: '', opponent: '' });
        setPlayersMissingNextGame([]);
    };
    const handleFoulAction = (action: 'next' | 'back') => {
        const { step, foulingPlayer, victimPlayer, armorRollInput, wasExpelled, log, foulingTeamId, injuryRollInput, casualtyRollInput, lastingInjuryRollInput } = foulState;
        if (action === 'back') {
            const steps: FoulState['step'][] = ['select_fouler_team', 'select_fouler', 'select_victim', 'armor_roll', 'injury_roll', 'casualty_roll', 'lasting_injury_roll', 'summary'];
            const currentIndex = steps.indexOf(step);
            if (currentIndex > 0) setFoulState(prev => ({ ...prev, step: steps[currentIndex - 1] }));
            return;
        }

        const foulingTeam = foulingTeamId === 'home' ? liveHomeTeam : liveOpponentTeam;
        const setFoulingTeam = foulingTeamId === 'home' ? setLiveHomeTeam : setLiveOpponentTeam;

        switch (step) {
            case 'select_fouler': if (foulingPlayer) setFoulState(prev => ({ ...prev, step: 'select_victim' })); break;
            case 'select_victim': if (victimPlayer) setFoulState(prev => ({ ...prev, step: 'armor_roll' })); break;
            case 'armor_roll': {
                const die1 = parseInt(armorRollInput.die1), die2 = parseInt(armorRollInput.die2);
                if (isNaN(die1) || isNaN(die2)) break;
                const roll = die1 + die2, armorValue = parseInt(victimPlayer!.stats.AR.replace('+', '')), armorBroken = roll > armorValue, isDoubles = die1 === die2;
                let logMsg = `Tirada Armadura (${victimPlayer!.stats.AR}) a ${victimPlayer!.customName}: ${die1}+${die2}=${roll}.`;
                if (isDoubles) logMsg += " ¡Dobles!";

                let currentlyExpelled = isDoubles;

                if (isDoubles && foulingTeam?.biasedRef) {
                    const biasedRoll = Math.floor(Math.random() * 6) + 1;
                    if (biasedRoll >= 2) {
                        logMsg += ` ¡Árbitro Parcial (tirada ${biasedRoll}) evita la expulsión!`;
                        currentlyExpelled = false;
                    } else {
                        logMsg += ` ¡Árbitro Parcial (tirada ${biasedRoll}) falla!`;
                        setFoulingTeam(prev => prev ? ({ ...prev, biasedRef: false }) : null);
                    }
                }

                if (armorBroken) {
                    logMsg += " ¡Rota!";
                    setFoulState(prev => ({ ...prev, armorRoll: { roll, armorBroken }, step: 'injury_roll', log: [...log, logMsg], wasExpelled: wasExpelled || currentlyExpelled, expulsionReason: currentlyExpelled ? `¡${foulingPlayer?.customName} expulsado por dobles!` : '' }));
                } else {
                    logMsg += " Aguanta.";
                    setFoulState(prev => ({ ...prev, armorRoll: { roll, armorBroken }, step: 'summary', log: [...log, logMsg], wasExpelled: wasExpelled || currentlyExpelled, expulsionReason: currentlyExpelled ? `¡${foulingPlayer?.customName} expulsado por dobles!` : '' }));
                }
                break;
            }
            case 'injury_roll': {
                const die1 = parseInt(injuryRollInput.die1), die2 = parseInt(injuryRollInput.die2);
                if (isNaN(die1) || isNaN(die2)) break;
                const roll = die1 + die2, isDoubles = die1 === die2;
                let result: PlayerStatus = roll <= 7 ? 'Activo' : roll <= 9 ? 'KO' : 'Lesionado';
                let resultText = roll <= 7 ? 'Aturdido' : roll <= 9 ? 'Inconsciente (KO)' : '¡Lesionado!';
                let logMsg = `Tirada Heridas: ${die1}+${die2}=${roll} -> ${resultText}.`;
                if (isDoubles) logMsg += " ¡Dobles!";

                let currentlyExpelled = wasExpelled || isDoubles;

                if (isDoubles && foulingTeam?.biasedRef && !wasExpelled) {
                    const biasedRoll = Math.floor(Math.random() * 6) + 1;
                    if (biasedRoll >= 2) {
                        logMsg += ` ¡Árbitro Parcial (tirada ${biasedRoll}) evita la expulsión!`;
                        currentlyExpelled = false;
                    } else {
                        logMsg += ` ¡Árbitro Parcial (tirada ${biasedRoll}) falla!`;
                        setFoulingTeam(prev => prev ? ({ ...prev, biasedRef: false }) : null);
                    }
                }

                const victimTeamId = foulingTeamId === 'home' ? 'opponent' : 'home';
                updatePlayerStatus(victimPlayer!.id, victimTeamId, result === 'Activo' ? 'Activo' : result, resultText);
                if (result === 'Lesionado') setFoulState(prev => ({ ...prev, injuryRoll: { roll, result: resultText }, step: 'casualty_roll', log: [...log, logMsg], wasExpelled: currentlyExpelled, expulsionReason: currentlyExpelled ? `¡${foulingPlayer?.customName} expulsado por dobles!` : prev.expulsionReason }));
                else setFoulState(prev => ({ ...prev, injuryRoll: { roll, result: resultText }, step: 'summary', log: [...log, logMsg], wasExpelled: currentlyExpelled, expulsionReason: currentlyExpelled ? `¡${foulingPlayer?.customName} expulsado por dobles!` : prev.expulsionReason }));
                break;
            }
            case 'casualty_roll': {
                const roll = parseInt(casualtyRollInput);
                if (isNaN(roll) || roll < 1 || roll > 16) break;
                const event = casualtyResults.find(e => { const range = e.diceRoll.split('-').map(Number); return range.length > 1 ? (roll >= range[0] && roll <= range[1]) : roll === range[0]; });
                if (!event) return;
                let logMsg = `Tirada Lesión (D16): ${roll} -> ${event.title}.`;
                const victimTeamId = foulingTeamId === 'home' ? 'opponent' : 'home';
                if (['Gravemente Herido', 'Lesion Seria', 'Lesion Permanente'].includes(event.title)) { setPlayersMissingNextGame(prev => [...prev, { playerId: victimPlayer!.id, teamId: victimTeamId }]); }
                updatePlayerStatus(victimPlayer!.id, victimTeamId, event.title === 'Muerto' ? 'Muerto' : 'Lesionado', event.title);
                setFoulState(prev => ({ ...prev, casualtyRoll: { roll, result: event.title }, step: event.title === 'Lesion Permanente' ? 'lasting_injury_roll' : 'summary', log: [...log, logMsg] }));
                break;
            }
            case 'lasting_injury_roll': {
                const roll = parseInt(lastingInjuryRollInput);
                if (isNaN(roll) || roll < 1 || roll > 6) break;
                const event = lastingInjuryResults.find(e => { const range = e.diceRoll.split('-').map(Number); return range.length > 1 ? (roll >= range[0] && roll <= range[1]) : roll === range[0]; });
                if (!event) return;
                let logMsg = `Lesión Permanente (D6): ${roll} -> ${event.permanentInjury} (${event.characteristicReduction}).`;
                const victimTeamId = foulingTeamId === 'home' ? 'opponent' : 'home';
                const setVictimTeam = victimTeamId === 'home' ? setLiveHomeTeam : setLiveOpponentTeam;
                setVictimTeam(prev => prev ? ({ ...prev, players: prev.players.map(p => p.id === victimPlayer!.id ? { ...p, lastingInjuries: [...p.lastingInjuries, `${event.permanentInjury} (${event.characteristicReduction})`] } : p) }) : null);
                setFoulState(prev => ({ ...prev, lastingInjuryRoll: { roll, result: event.permanentInjury, characteristic: event.characteristicReduction }, step: 'summary', log: [...log, logMsg] }));
                break;
            }
            case 'summary':
                if (wasExpelled) { const victimTeamId = foulingTeamId === 'home' ? 'home' : 'opponent'; updatePlayerStatus(foulingPlayer!.id, victimTeamId, 'Expulsado', 'Expulsado por falta'); }
                logEvent('FOUL', `Falta cometida por ${foulingPlayer?.customName} sobre ${victimPlayer?.customName}. ${foulState.log.join(' ')}`);
                setIsFoulModalOpen(false);
                setFoulState(initialFoulState);
                break;
        }
    };
    const handleInjuryAction = (action: 'next' | 'back') => {
        const { step, victimPlayer, armorRollInput, log, victimTeamId, injuryRollInput, casualtyRollInput, lastingInjuryRollInput, casualtyRoll, apothecaryAction, isStunty, regenerationRollInput } = injuryState;
        if (action === 'back') {
            const steps: InjuryState['step'][] = ['select_victim_team', 'select_victim', 'armor_roll', 'injury_roll', 'apothecary', 'casualty_roll', 'lasting_injury_roll', 'regeneration_check', 'regeneration_roll', 'staff_reroll_choice', 'summary'];
            const currentIndex = steps.indexOf(step);
            if (currentIndex > 0) setInjuryState(prev => ({ ...prev, step: steps[currentIndex - 1] }));
            return;
        }

        const victimTeam = victimTeamId === 'home' ? liveHomeTeam : liveOpponentTeam;
        const setVictimTeam = victimTeamId === 'home' ? setLiveHomeTeam : setLiveOpponentTeam;

        switch (step) {
            case 'select_victim':
                if (victimPlayer) {
                    const hasStunty = victimPlayer.skills.toLowerCase().includes('escurridizo');
                    setInjuryState(prev => ({ ...prev, step: 'armor_roll', isStunty: hasStunty }));
                } break;
            case 'armor_roll': {
                const die1 = parseInt(armorRollInput.die1), die2 = parseInt(armorRollInput.die2);
                if (isNaN(die1) || isNaN(die2)) break;
                const roll = die1 + die2, armorValue = parseInt(victimPlayer!.stats.AR.replace('+', '')), armorBroken = roll > armorValue;
                let logMsg = `Tirada Armadura (${victimPlayer!.stats.AR}) a ${victimPlayer!.customName}: ${die1}+${die2}=${roll}.`;
                if (armorBroken) {
                    logMsg += " ¡Rota!";
                    setInjuryState(prev => ({ ...prev, armorRoll: { roll, armorBroken }, step: 'injury_roll', log: [...log, logMsg] }));
                } else {
                    logMsg += " Aguanta.";
                    setInjuryState(prev => ({ ...prev, armorRoll: { roll, armorBroken }, step: 'summary', log: [...log, logMsg] }));
                } break;
            }
            case 'injury_roll': {
                const die1 = parseInt(injuryRollInput.die1), die2 = parseInt(injuryRollInput.die2);
                if (isNaN(die1) || isNaN(die2)) break;
                const roll = die1 + die2;
                let result: PlayerStatus = 'Activo', resultText = '';

                if (isStunty) {
                    if (roll <= 6) { result = 'Activo'; resultText = 'Aturdido'; }
                    else if (roll <= 8) { result = 'KO'; resultText = 'Inconsciente (KO)'; }
                    else if (roll === 9) { result = 'Lesionado'; resultText = 'Magullado (solo reservas)'; }
                    else { result = 'Lesionado'; resultText = '¡Lesionado!'; }
                } else {
                    if (roll <= 7) { result = 'Activo'; resultText = 'Aturdido'; }
                    else if (roll <= 9) { result = 'KO'; resultText = 'Inconsciente (KO)'; }
                    else { result = 'Lesionado'; resultText = '¡Lesionado!'; }
                }

                let logMsg = `Tirada Heridas: ${die1}+${die2}=${roll} -> ${resultText}.`;
                const hasApo = victimTeam?.apothecary || (victimTeam?.wanderingApothecaries && victimTeam.wanderingApothecaries > 0);

                if (hasApo && (result === 'KO' || result === 'Lesionado')) {
                    setIsApothecaryModalOpen(true);
                    setInjuryState(prev => ({ ...prev, injuryRoll: { roll, result: resultText }, step: 'apothecary', log: [...log, logMsg] }));
                } else {
                    playSound('injury');
                    if (result !== 'Lesionado' || resultText === 'Magullado (solo reservas)') {
                        updatePlayerStatus(victimPlayer!.id, victimTeamId!, result, resultText);
                    }
                    setInjuryState(prev => ({
                        ...prev,
                        injuryRoll: { roll, result: resultText },
                        step: result === 'Lesionado' && resultText !== 'Magullado (solo reservas)' ? 'regeneration_check' : 'summary',
                        log: [...log, logMsg]
                    }));
                }
                break;
            }
            case 'casualty_roll': {
                const roll = parseInt(casualtyRollInput);
                if (isNaN(roll) || roll < 1 || roll > 16) break;
                const event = casualtyResults.find(e => { const range = e.diceRoll.split('-').map(Number); return range.length > 1 ? (roll >= range[0] && roll <= range[1]) : roll === range[0]; });
                if (!event) return;
                let logMsg = `Tirada Lesión (D16)${casualtyRoll?.rerolled ? ' (repetida)' : ''}: ${roll} -> ${event.title}.`;

                const hasApo = victimTeam?.apothecary || (victimTeam?.wanderingApothecaries && victimTeam.wanderingApothecaries > 0);

                if (['Gravemente Herido', 'Lesion Seria', 'Lesion Permanente'].includes(event.title)) { setPlayersMissingNextGame(prev => [...prev, { playerId: victimPlayer!.id, teamId: victimTeamId! }]); }
                if (hasApo && !casualtyRoll?.rerolled && apothecaryAction !== 'patch_ko') {
                    setIsApothecaryModalOpen(true);
                    setInjuryState(prev => ({ ...prev, casualtyRoll: { roll, result: event.title, rerolled: false }, step: 'apothecary', log: [...log, logMsg] }));
                } else {
                    setInjuryState(prev => ({ ...prev, casualtyRoll: { ...(prev.casualtyRoll!), roll, result: event.title }, step: 'regeneration_check', log: [...log, logMsg] }));
                } break;
            }
            case 'regeneration_check': {
                const hasRegeneration = victimPlayer?.skills.toLowerCase().includes('regeneración');
                if (hasRegeneration) {
                    setInjuryState(prev => ({ ...prev, step: 'regeneration_roll' }));
                } else {
                    // Skip to status update or lasting injury
                    const eventTitle = injuryState.casualtyRoll?.result;
                    if (eventTitle) {
                        updatePlayerStatus(victimPlayer!.id, victimTeamId!, eventTitle === 'Muerto' ? 'Muerto' : 'Lesionado', eventTitle);
                        setInjuryState(prev => ({ ...prev, step: eventTitle === 'Lesion Permanente' ? 'lasting_injury_roll' : 'summary' }));
                    } else {
                        setInjuryState(prev => ({ ...prev, step: 'summary' }));
                    }
                }
                break;
            }
            case 'regeneration_roll': {
                const roll = parseInt(regenerationRollInput);
                if (isNaN(roll) || roll < 1 || roll > 6) break;
                const success = roll >= 4;
                let logMsg = `Tirada Regeneración: ${roll} -> ${success ? '¡Éxito!' : 'Falla.'}`;

                const hasStaff = (victimTeam?.mortuaryAssistants && victimTeam.mortuaryAssistants > 0) || (victimTeam?.plagueDoctors && victimTeam.plagueDoctors > 0);

                if (success) {
                    updatePlayerStatus(victimPlayer!.id, victimTeamId!, 'Reserva', 'Regenerado');
                    setInjuryState(prev => ({ ...prev, regenerationRoll: { roll, success }, step: 'summary', log: [...log, logMsg] }));
                } else if (hasStaff && !injuryState.regenerationRoll) {
                    setInjuryState(prev => ({ ...prev, regenerationRoll: { roll, success }, step: 'staff_reroll_choice', log: [...log, logMsg] }));
                } else {
                    const eventTitle = injuryState.casualtyRoll?.result;
                    updatePlayerStatus(victimPlayer!.id, victimTeamId!, eventTitle === 'Muerto' ? 'Muerto' : 'Lesionado', eventTitle);
                    setInjuryState(prev => ({ ...prev, regenerationRoll: { roll, success }, step: eventTitle === 'Lesion Permanente' ? 'lasting_injury_roll' : 'summary', log: [...log, logMsg] }));
                }
                break;
            }
            case 'staff_reroll_choice': {
                const eventTitle = injuryState.casualtyRoll?.result;
                updatePlayerStatus(victimPlayer!.id, victimTeamId!, eventTitle === 'Muerto' ? 'Muerto' : 'Lesionado', eventTitle);
                setInjuryState(prev => ({ ...prev, step: eventTitle === 'Lesion Permanente' ? 'lasting_injury_roll' : 'summary', log: [...log, 'No se utiliza personal médico.'] }));
                break;
            }
            case 'lasting_injury_roll': {
                const roll = parseInt(lastingInjuryRollInput); if (isNaN(roll) || roll < 1 || roll > 6) break;
                const event = lastingInjuryResults.find(e => { const range = e.diceRoll.split('-').map(Number); return range.length > 1 ? (roll >= range[0] && roll <= range[1]) : roll === range[0]; });
                if (!event) return;
                let logMsg = `Lesión Permanente (D6): ${roll} -> ${event.permanentInjury} (${event.characteristicReduction}).`;
                setVictimTeam(prev => prev ? ({ ...prev, players: prev.players.map(p => p.id === victimPlayer!.id ? { ...p, lastingInjuries: [...p.lastingInjuries, `${event.permanentInjury} (${event.characteristicReduction})`] } : p) }) : null);
                setInjuryState(prev => ({ ...prev, lastingInjuryRoll: { roll, result: event.permanentInjury, characteristic: event.characteristicReduction }, step: 'summary', log: [...log, logMsg] }));
                break;
            }
            case 'summary': {
                const finalLog = injuryState.log.join(' ');
                logEvent('INJURY', `Herida a ${victimPlayer?.customName}. ${finalLog}`);
                setIsInjuryModalOpen(false);
                setInjuryState(initialInjuryState);
                break;
            }
        }
    }
    const handleManualOpponentSelect = (teamName: string) => { const selectedOpponent = managedTeams.find(t => t.name === teamName); if (selectedOpponent) { setOpponentTeam(selectedOpponent); setGameState('pre_game'); } };
    const handleExportLog = () => { if (!homeTeam || !opponentTeam) return; try { const worksheet = XLSX.utils.json_to_sheet([...gameLog].reverse().map(e => ({ 'Hora': e.timestamp, 'Parte': e.half, 'Turno': e.turn, 'Tipo': e.type, 'Descripción': e.description }))); const workbook = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(workbook, worksheet, 'Bitácora'); XLSX.writeFile(workbook, `bitacora_${homeTeam.name}_vs_${opponentTeam.name}.xlsx`); } catch (error) { console.error("Error al exportar:", error); alert("Error al exportar bitácora."); } };
    const rollKoRecovery = (player: ManagedPlayer) => { const roll = Math.floor(Math.random() * 6) + 1; const success = roll >= 4; setKoRecoveryRolls(prev => ({ ...prev, [player.id]: { roll, success } })); if (success) { const teamId = liveHomeTeam?.players.some(p => p.id === player.id) ? 'home' : 'opponent'; updatePlayerStatus(player.id, teamId, 'Reserva'); } };
    const renderWeatherIcon = (title: string) => { const lowerTitle = title.toLowerCase(); if (lowerTitle.includes('calor')) return <FireIcon className="w-5 h-5 text-red-400" />; if (lowerTitle.includes('soleado')) return <SunIcon className="w-5 h-5 text-yellow-300" />; if (lowerTitle.includes('perfecto')) return <CloudIcon className="w-5 h-5 text-blue-300" />; if (lowerTitle.includes('lluvioso')) return <CloudRainIcon className="w-5 h-5 text-cyan-300" />; if (lowerTitle.includes('ventisca')) return <SnowflakeIcon className="w-5 h-5 text-white" />; return null; };
    const handleConfirmWeatherReroll = () => { const roll = parseInt(weatherRerollInput); if (isNaN(roll) || roll < 2 || roll > 12) { alert("Introduce un resultado de 2D6 válido (2-12)."); return; } let newWeather: WeatherCondition | undefined; if (roll === 2) newWeather = weatherConditions.find(w => w.diceRoll === "2"); else if (roll === 3) newWeather = weatherConditions.find(w => w.diceRoll === "3"); else if (roll >= 4 && roll <= 10) newWeather = weatherConditions.find(w => w.diceRoll === "4-10"); else if (roll === 11) newWeather = weatherConditions.find(w => w.diceRoll === "11"); else if (roll === 12) newWeather = weatherConditions.find(w => w.diceRoll === "12"); if (newWeather) { setGameStatus(prev => ({ ...prev, weather: newWeather })); let logMessage = `Clima Cambiante (Tirada ${roll}): Nuevo clima es ${newWeather.title}.`; if (newWeather.title === 'Clima Perfecto') logMessage += " El balón se escorará."; logEvent('WEATHER', logMessage); } setIsChangingWeatherModalOpen(false); setKickoffActionCompleted(true); setWeatherRerollInput(''); };
    const handleAdjustTurnCounter = (kickingTeamId: 'home' | 'opponent') => { const kickingTeam = kickingTeamId === 'home' ? liveHomeTeam : liveOpponentTeam; if (!kickingTeam) return; const isTurn6to8 = turn >= 6 && turn <= 8; if (isTurn6to8) { setTurn(t => { const newTurn = Math.max(1, t - 1); logEvent('INFO', `Tiempo Muerto: Los marcadores de turno se retrasan. Turno actual: ${newTurn}.`); return newTurn; }); } else { setTurn(t => { const newTurn = Math.min(8, t + 1); logEvent('INFO', `Tiempo Muerto: Los marcadores de turno se adelantan. Turno actual: ${newTurn}.`); return newTurn; }); } setKickoffActionCompleted(true); };

    const handleHireStar = (star: StarPlayer) => {
        if (!inducementState.underdog) return;
        const setUnderdogTeam = inducementState.underdog === 'home' ? setLiveHomeTeam : setLiveOpponentTeam;
        const underdogTeam = inducementState.underdog === 'home' ? liveHomeTeam : liveOpponentTeam;

        let playersToAdd: ManagedPlayer[] = [];
        if (star.pair) {
            playersToAdd = star.pair.map((p) => ({
                id: Date.now() + Math.random(),
                customName: p.name,
                position: "Jugador Estrella",
                cost: star.cost / 2,
                stats: p.stats,
                skills: p.skills,
                skillKeys: p.skills ? p.skills.split(',').map((s: string) => s.trim()) : [],
                primary: 'G', secondary: 'A,F,P',
                spp: 0, gainedSkills: [], lastingInjuries: [],
                isStarPlayer: true, qty: "0-1", status: 'Reserva',
            }));
        } else {
            const newPlayer: ManagedPlayer = {
                id: Date.now() + Math.random(),
                customName: star.name,
                position: "Jugador Estrella",
                cost: star.cost,
                stats: star.stats!,
                skills: star.skills || '',
                skillKeys: star.skills ? star.skills.split(',').map(s => s.trim()) : [],
                primary: 'G', secondary: 'A,F,P',
                spp: 0, gainedSkills: [], lastingInjuries: [],
                isStarPlayer: true, qty: "0-1", status: 'Reserva',
            };
            playersToAdd.push(newPlayer);
        }

        setUnderdogTeam(prev => prev ? ({ ...prev, players: [...prev.players, ...playersToAdd] }) : null);
        setInducementState(prev => ({ ...prev, money: prev.money - star.cost, hiredStars: [...prev.hiredStars, star] }));
        if (underdogTeam) logEvent('INFO', `${underdogTeam.name} contrata a ${star.name} por ${star.cost.toLocaleString()} M.O.`);
    };

    const handleFireStar = (star: StarPlayer) => {
        if (!inducementState.underdog) return;
        const setUnderdogTeam = inducementState.underdog === 'home' ? setLiveHomeTeam : setLiveOpponentTeam;
        const underdogTeam = inducementState.underdog === 'home' ? liveHomeTeam : liveOpponentTeam;

        const playerNamesToRemove = star.pair ? star.pair.map(p => p.name) : [star.name];

        setUnderdogTeam(prev => prev ? ({ ...prev, players: prev.players.filter(p => !playerNamesToRemove.includes(p.customName)) }) : null);
        setInducementState(prev => ({ ...prev, money: prev.money + star.cost, hiredStars: prev.hiredStars.filter(s => s.name !== star.name) }));
        if (underdogTeam) logEvent('INFO', `${underdogTeam.name} despide a ${star.name} y recupera ${star.cost.toLocaleString()} M.O.`);
    };

    const handleBuyInducement = (item: 'reroll' | 'bribe' | 'cheerleader' | 'coach' | 'biasedRef' | 'wanderingApothecary' | 'mortuaryAssistant' | 'plagueDoctor', cost: number) => {
        if (inducementState.money < cost) { alert("Fondos insuficientes."); return; }
        const setUnderdogTeam = inducementState.underdog === 'home' ? setLiveHomeTeam : setLiveOpponentTeam;
        setInducementState(prev => ({ ...prev, money: prev.money - cost }));
        setUnderdogTeam(prev => {
            if (!prev) return null;
            const newTeam = { ...prev };
            if (item === 'reroll') newTeam.liveRerolls = (newTeam.liveRerolls || 0) + 1;
            if (item === 'bribe') newTeam.tempBribes = (newTeam.tempBribes || 0) + 1;
            if (item === 'cheerleader') newTeam.tempCheerleaders = (newTeam.tempCheerleaders || 0) + 1;
            if (item === 'coach') newTeam.tempAssistantCoaches = (newTeam.tempAssistantCoaches || 0) + 1;
            if (item === 'biasedRef') newTeam.biasedRef = true;
            if (item === 'wanderingApothecary') newTeam.wanderingApothecaries = (newTeam.wanderingApothecaries || 0) + 1;
            if (item === 'mortuaryAssistant') newTeam.mortuaryAssistants = (newTeam.mortuaryAssistants || 0) + 1;
            if (item === 'plagueDoctor') newTeam.plagueDoctors = (newTeam.plagueDoctors || 0) + 1;
            return newTeam;
        });
    };
    const handleSellInducement = (item: 'reroll' | 'bribe' | 'cheerleader' | 'coach' | 'biasedRef' | 'wanderingApothecary' | 'mortuaryAssistant' | 'plagueDoctor', cost: number) => {
        const underdogTeam = inducementState.underdog === 'home' ? liveHomeTeam : liveOpponentTeam;
        if (!underdogTeam) return;
        const canSell = (item === 'reroll' && (underdogTeam.liveRerolls || 0) > underdogTeam.rerolls) ||
            (item === 'bribe' && (underdogTeam.tempBribes || 0) > 0) ||
            (item === 'cheerleader' && (underdogTeam.tempCheerleaders || 0) > 0) ||
            (item === 'coach' && (underdogTeam.tempAssistantCoaches || 0) > 0) ||
            (item === 'biasedRef' && underdogTeam.biasedRef) ||
            (item === 'wanderingApothecary' && (underdogTeam.wanderingApothecaries || 0) > 0) ||
            (item === 'mortuaryAssistant' && (underdogTeam.mortuaryAssistants || 0) > 0) ||
            (item === 'plagueDoctor' && (underdogTeam.plagueDoctors || 0) > 0);
        if (!canSell) { alert("No tienes de este incentivo para vender."); return; }
        const setUnderdogTeam = inducementState.underdog === 'home' ? setLiveHomeTeam : setLiveOpponentTeam;
        setInducementState(prev => ({ ...prev, money: prev.money + cost }));
        setUnderdogTeam(prev => {
            if (!prev) return null;
            const newTeam = { ...prev };
            if (item === 'reroll') newTeam.liveRerolls = (newTeam.liveRerolls || 1) - 1;
            if (item === 'bribe') newTeam.tempBribes = (newTeam.tempBribes || 1) - 1;
            if (item === 'cheerleader') newTeam.tempCheerleaders = (newTeam.tempCheerleaders || 1) - 1;
            if (item === 'coach') newTeam.tempAssistantCoaches = (newTeam.tempAssistantCoaches || 1) - 1;
            if (item === 'biasedRef') newTeam.biasedRef = false;
            if (item === 'wanderingApothecary') newTeam.wanderingApothecaries = (newTeam.wanderingApothecaries || 1) - 1;
            if (item === 'mortuaryAssistant') newTeam.mortuaryAssistants = (newTeam.mortuaryAssistants || 1) - 1;
            if (item === 'plagueDoctor') newTeam.plagueDoctors = (newTeam.plagueDoctors || 1) - 1;
            return newTeam;
        });
    };
    const handleGenerateWeather = () => { const die1 = Math.floor(Math.random() * 6) + 1, die2 = Math.floor(Math.random() * 6) + 1, roll = die1 + die2; let result: WeatherCondition | undefined; if (roll === 2) result = weatherConditions.find(w => w.diceRoll === "2"); else if (roll === 3) result = weatherConditions.find(w => w.diceRoll === "3"); else if (roll >= 4 && roll <= 10) result = weatherConditions.find(w => w.diceRoll === "4-10"); else if (roll === 11) result = weatherConditions.find(w => w.diceRoll === "11"); else if (roll === 12) result = weatherConditions.find(w => w.diceRoll === "12"); if (result) { setGameStatus(prev => ({ ...prev, weather: result })); logEvent('WEATHER', `Tirada Clima (${roll}): ${result.title}.`); } setIsWeatherModalOpen(false); };
    const useReroll = (teamId: 'home' | 'opponent') => {
        const team = teamId === 'home' ? liveHomeTeam : liveOpponentTeam;
        const setTeam = teamId === 'home' ? setLiveHomeTeam : setLiveOpponentTeam;
        if (team && (team.liveRerolls || 0) > 0) {
            setTeam(prev => prev ? ({ ...prev, liveRerolls: (prev.liveRerolls || 1) - 1 }) : null);
            logEvent('INFO', `${team.name} ha usado una Segunda Oportunidad.`);
        }
    };

    const handlePlayerStatusToggle = (player: ManagedPlayer, teamId: 'home' | 'opponent') => {
        const setTeam = teamId === 'home' ? setLiveHomeTeam : setLiveOpponentTeam;
        setTeam(prevTeam => {
            if (!prevTeam) return null;
            const newStatus: PlayerStatus = player.status === 'Activo' ? 'Reserva' : 'Activo';

            if (newStatus === 'Activo' && prevTeam.players.filter(p => p.status === 'Activo').length >= 11) {
                alert('No puedes tener más de 11 jugadores en el campo.');
                return prevTeam;
            }

            const updatedPlayers = prevTeam.players.map(p => {
                if (p.id === player.id) {
                    const updatedPlayer = { ...p, status: newStatus };
                    if (newStatus === 'Activo') {
                        const onFieldPlayers = prevTeam.players.filter(pl => pl.status === 'Activo' && pl.id !== player.id);
                        const occupiedPositions = new Set(onFieldPlayers.map(pl => pl.fieldPosition ? `${pl.fieldPosition.x},${pl.fieldPosition.y}` : '').filter(Boolean));

                        let x = 7;
                        let y = 6;
                        while (occupiedPositions.has(`${x},${y}`)) {
                            x = (x + 1) % 15;
                            if (x === 0) y--;
                            if (y < 3) {
                                x = 7; y = 6; break; // fallback
                            }
                        }
                        updatedPlayer.fieldPosition = { x, y };
                    } else if (newStatus === 'Reserva') {
                        delete updatedPlayer.fieldPosition;
                    }
                    return updatedPlayer;
                }
                return p;
            });

            return { ...prevTeam, players: updatedPlayers };
        });
    };

    const handlePlayerMove = useCallback((teamId: 'home' | 'opponent', playerId: number, newPos: { x: number, y: number }) => {
        const setTeam = teamId === 'home' ? setLiveHomeTeam : setLiveOpponentTeam;
        setTeam(prev => {
            if (!prev) return null;
            const isOccupied = prev.players.some(p => p.id !== playerId && p.fieldPosition?.x === newPos.x && p.fieldPosition?.y === newPos.y);
            if (isOccupied) return prev; // Simple collision detection: don't move.

            return {
                ...prev,
                players: prev.players.map(p => p.id === playerId ? { ...p, fieldPosition: newPos } : p)
            };
        });
    }, []);

    const handleSuggestDeployment = () => {
        const deployTeam = (players: ManagedPlayer[]) => {
            if (players.length === 0) return players;

            const GRID_COLS = 15;
            const GRID_ROWS = 7;
            const SCRIMMAGE_Y = 3;
            const WIDE_ZONE_X_END = 3;
            const WIDE_ZONE_X_START_RIGHT = 11;

            let availableSquares: { x: number, y: number }[] = [];
            for (let y = GRID_ROWS - 1; y >= SCRIMMAGE_Y; y--) {
                for (let x = 0; x < GRID_COLS; x++) {
                    availableSquares.push({ x, y });
                }
            }
            availableSquares.sort(() => 0.5 - Math.random());

            const newPlayers = players.map(p => ({ ...p }));
            const assignedPositions = new Set<string>();

            let scrimmageCount = 0;
            let wideLeftCount = 0;
            let wideRightCount = 0;

            newPlayers.forEach(player => {
                for (let i = 0; i < availableSquares.length; i++) {
                    const pos = availableSquares[i];
                    if (assignedPositions.has(`${pos.x},${pos.y}`)) continue;

                    const isScrimmage = pos.y === SCRIMMAGE_Y;
                    const isWideLeft = pos.x <= WIDE_ZONE_X_END;
                    const isWideRight = pos.x >= WIDE_ZONE_X_START_RIGHT;

                    if (isScrimmage && scrimmageCount >= 3) continue;
                    if (isWideLeft && wideLeftCount >= 2) continue;
                    if (isWideRight && wideRightCount >= 2) continue;

                    player.fieldPosition = pos;
                    assignedPositions.add(`${pos.x},${pos.y}`);

                    if (isScrimmage) scrimmageCount++;
                    if (isWideLeft) wideLeftCount++;
                    if (isWideRight) wideRightCount++;

                    break;
                }
            });

            return newPlayers;
        };

        const updateTeamDeployment = (setTeam: React.Dispatch<React.SetStateAction<ManagedTeam | null>>) => {
            setTeam(prevTeam => {
                if (!prevTeam) return null;
                const activePlayers = prevTeam.players.filter(p => p.status === 'Activo');
                const benchPlayers = prevTeam.players.filter(p => p.status !== 'Activo');
                const deployedActivePlayers = deployTeam(activePlayers);
                return { ...prevTeam, players: [...benchPlayers, ...deployedActivePlayers] };
            });
        };

        updateTeamDeployment(setLiveHomeTeam);
        updateTeamDeployment(setLiveOpponentTeam);
    };

    const handleAutoSelectTeam = (teamId: 'home' | 'opponent') => {
        const setTeam = teamId === 'home' ? setLiveHomeTeam : setLiveOpponentTeam;
        setTeam(prevTeam => {
            if (!prevTeam) return null;
            // 1. Filter out unavailable players
            const availablePlayers = prevTeam.players.filter(p =>
                p.status !== 'Muerto' &&
                p.status !== 'Lesionado' &&
                (p.missNextGame || 0) <= 0
            );

            // 2. Sort by cost (proxy for "best")
            const sortedByCost = [...availablePlayers].sort((a, b) => b.cost - a.cost);

            // 3. Take top 11
            const bestElevenIds = new Set(sortedByCost.slice(0, 11).map(p => p.id));

            // 4. Update status and positions
            const updatedPlayers = prevTeam.players.map(p => {
                if (bestElevenIds.has(p.id)) {
                    return { ...p, status: 'Activo' as PlayerStatus };
                }
                return { ...p, status: 'Reserva' as PlayerStatus, fieldPosition: undefined };
            });

            return { ...prevTeam, players: updatedPlayers };
        });

        // 5. Trigger deployment layout
        setTimeout(() => handleSuggestDeployment(), 50);
    };

    const renderContent = () => {
        switch (gameState) {
            case 'setup': return (
                <div className="relative flex flex-col items-center justify-center py-24 min-h-[70vh] animate-fade-in overflow-hidden">
                    {/* Background decorations */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blood-red/5 rounded-full blur-[100px] pointer-events-none"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-premium-gold/5 rounded-full blur-[80px] pointer-events-none"></div>

                    <div className="relative z-10 w-32 h-32 bg-gradient-to-br from-black to-zinc-900 rounded-full border-2 border-premium-gold/40 flex items-center justify-center mb-10 shadow-[0_0_80px_rgba(245,159,10,0.15)] group hover:scale-105 transition-transform duration-500">
                        <div className="absolute inset-0 rounded-full border border-premium-gold/20 animate-ping opacity-20"></div>
                        <StadiumIcon className="w-16 h-16 text-premium-gold group-hover:drop-shadow-[0_0_15px_rgba(245,159,10,0.8)] transition-all duration-300" />
                    </div>

                    <h2 className="relative z-10 text-5xl md:text-6xl font-display font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 italic tracking-tighter uppercase mb-4 text-center">
                        Arena de <span className="bg-clip-text bg-gradient-to-r from-blood-red to-red-500">Gloria</span>
                    </h2>

                    <p className="relative z-10 text-slate-400 font-medium mb-14 max-w-lg text-center leading-relaxed text-sm md:text-base px-4">
                        Prepara tu escuadra y desafía al destino. La sangre de los caídos y la arena rojiblanca te esperan en el eterno Coliseo de Nuffle.
                    </p>

                    <div className="relative z-10 flex flex-col gap-5 w-full max-w-sm px-4">
                        {managedTeams.length > 0 ? (
                            <button
                                onClick={() => setGameState('selection')}
                                className="peer w-full group relative overflow-hidden bg-gradient-to-b from-premium-gold to-yellow-600 text-black font-display font-black py-5 px-8 rounded-2xl shadow-[0_20px_40px_rgba(245,159,10,0.25)] hover:shadow-[0_25px_50px_rgba(245,159,10,0.4)] transform hover:-translate-y-1 transition-all duration-300"
                            >
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/40 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
                                <span className="relative flex items-center justify-center gap-3 tracking-[0.25em] uppercase text-sm">
                                    <span className="material-symbols-outlined text-[20px]">sports_mma</span>
                                    Iniciar Duelo
                                </span>
                            </button>
                        ) : (
                            <div className="glass-panel p-8 border-blood-red/30 bg-blood-red/10 text-center space-y-4 shadow-[0_0_30px_rgba(220,38,38,0.1)]">
                                <div className="w-12 h-12 mx-auto bg-blood-red/20 rounded-full flex items-center justify-center mb-2">
                                    <span className="material-symbols-outlined text-blood-red">skull</span>
                                </div>
                                <p className="text-red-400 text-base font-black uppercase tracking-widest italic">Naces sin Legado</p>
                                <p className="text-red-300/60 text-xs leading-relaxed">Debes forjar un equipo en el Gremio antes de que el Coliseo abra sus puertas.</p>
                            </div>
                        )}

                        <button className="peer-hover:opacity-50 text-[10px] font-display font-black text-slate-500 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 uppercase tracking-[0.3em] transition-all py-4 rounded-xl flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-sm">school</span>
                            Tutorial de Combate
                        </button>
                    </div>
                </div>
            );
            case 'selection': {
                const isScanning = scannerRef.current?.isScanning;

                const handleStartScanner = () => {
                    if (!scannerContainerRef.current) return;
                    scannerRef.current = new Html5Qrcode(scannerContainerRef.current.id);
                    scannerRef.current.start(
                        { facingMode: "environment" }, { fps: 10, qrbox: { width: 250, height: 250 } },
                        (decodedText: string) => {
                            try {
                                const parsedTeam = JSON.parse(decodedText);
                                const isNewFormat = 'n' in parsedTeam && 'rN' in parsedTeam;
                                const teamName = isNewFormat ? parsedTeam.n : parsedTeam.name;
                                const rosterName = isNewFormat ? parsedTeam.rN : parsedTeam.rosterName;
                                if (!teamName || !rosterName) { alert('Código QR no válido: Faltan datos esenciales.'); return; }
                                const baseTeam = teamsData.find(t => t.name === rosterName);
                                if (!baseTeam) { alert(`Facción "${rosterName}" no encontrada.`); return; }
                                const playersData = isNewFormat ? parsedTeam.pl : parsedTeam.players;
                                const fullPlayers: ManagedPlayer[] = playersData.map((p: any, i: number) => {
                                    const position = isNewFormat ? p.p : p.position;
                                    const basePlayer = baseTeam.roster.find(bp => bp.position === position);
                                    if (!basePlayer) throw new Error(`Jugador "${position}" no encontrado.`);
                                    return { ...basePlayer, id: Date.now() + i, customName: (isNewFormat ? p.cN : p.customName) || basePlayer.position, spp: (isNewFormat ? p.s : p.spp) || 0, gainedSkills: (isNewFormat ? p.gS : p.gainedSkills) || [], lastingInjuries: (isNewFormat ? p.lI : p.lastingInjuries) || [], status: 'Reserva' };
                                });
                                const opponentWithDefaults: ManagedTeam = { name: teamName, rosterName: rosterName, treasury: (isNewFormat ? parsedTeam.t : parsedTeam.treasury) || 0, rerolls: (isNewFormat ? parsedTeam.rr : parsedTeam.rerolls) || 0, dedicatedFans: (isNewFormat ? parsedTeam.df : parsedTeam.dedicatedFans) || 1, cheerleaders: (isNewFormat ? parsedTeam.ch : parsedTeam.cheerleaders) || 0, assistantCoaches: (isNewFormat ? parsedTeam.ac : parsedTeam.assistantCoaches) || 0, apothecary: (isNewFormat ? parsedTeam.ap : parsedTeam.apothecary) || false, players: fullPlayers };
                                setOpponentTeam(opponentWithDefaults);
                                scannerRef.current.stop();
                            } catch (e) { alert(`Error al procesar el código QR: ${e instanceof Error ? e.message : 'Error desconocido.'}`); }
                        }, () => { }
                    ).catch((err: any) => { console.error("Error al iniciar escáner", err); alert(`Error al iniciar cámara: ${err}.`); });
                };

                return (
                    <div className="max-w-6xl mx-auto py-10 px-4 animate-fade-in">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-display font-black text-white uppercase italic tracking-tighter mb-2">Preparar <span className="text-premium-gold">Confrontación</span></h2>
                            <p className="text-slate-500 text-sm tracking-wide">Forja el duelo definitivo en la arena de Nuffle.</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
                            {/* Lado Izquierdo: Tu Equipo (Local) */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-sky-500/20 border border-sky-500/30 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-sky-400">house</span>
                                    </div>
                                    <h3 className="text-xl font-display font-black text-white uppercase italic">Tu Escuadra</h3>
                                </div>

                                {homeTeam ? (
                                    <div className="glass-panel p-6 border-sky-500/30 bg-sky-500/5 relative group">
                                        <button
                                            onClick={() => setHomeTeam(null)}
                                            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 text-slate-500 hover:text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <span className="material-symbols-outlined text-sm">close</span>
                                        </button>
                                        <div className="flex items-center gap-6">
                                            {homeTeam.crestImage ? (
                                                <img src={homeTeam.crestImage} alt="Escudo" className="w-20 h-20 rounded-2xl object-cover border-2 border-sky-500/30" />
                                            ) : (
                                                <div className="w-20 h-20 rounded-2xl bg-black/60 border-2 border-sky-500/30 flex items-center justify-center">
                                                    <ShieldCheckIcon className="w-10 h-10 text-sky-500/40" />
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-2xl font-display font-black text-white uppercase italic leading-tight">{homeTeam.name}</p>
                                                <p className="text-xs font-bold text-sky-400 uppercase tracking-widest">{homeTeam.rosterName}</p>
                                                <div className="mt-2 flex gap-3">
                                                    <span className="text-[10px] font-black bg-black/40 px-3 py-1 rounded-full text-slate-400 border border-white/5 uppercase">TV {calculateTeamValue(homeTeam).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                        {managedTeams.map(team => (
                                            <button
                                                key={team.name}
                                                onClick={() => setHomeTeam(team)}
                                                className="group w-full flex items-center gap-4 glass-panel p-4 border-white/5 bg-black/20 hover:bg-sky-500/10 hover:border-sky-500/50 transition-all duration-300"
                                            >
                                                <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center border border-white/5 overflow-hidden">
                                                    {team.crestImage ? <img src={team.crestImage} className="w-full h-full object-cover" /> : <ShieldCheckIcon className="w-6 h-6 text-slate-700" />}
                                                </div>
                                                <div className="flex-grow text-left">
                                                    <p className="text-sm font-display font-black text-white uppercase transition-colors">{team.name}</p>
                                                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{team.rosterName}</p>
                                                </div>
                                                <span className="material-symbols-outlined text-slate-700 group-hover:text-sky-400">radio_button_unchecked</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Lado Derecho: El Rival (Oponente) */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-red-500">swords</span>
                                    </div>
                                    <h3 className="text-xl font-display font-black text-white uppercase italic">El Rival</h3>
                                </div>

                                {opponentTeam ? (
                                    <div className="glass-panel p-6 border-red-500/30 bg-red-500/5 relative group animate-slide-in-up">
                                        <button
                                            onClick={() => setOpponentTeam(null)}
                                            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 text-slate-500 hover:text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <span className="material-symbols-outlined text-sm">close</span>
                                        </button>
                                        <div className="flex items-center gap-6">
                                            {opponentTeam.crestImage ? (
                                                <img src={opponentTeam.crestImage} alt="Escudo" className="w-20 h-20 rounded-2xl object-cover border-2 border-red-500/30" />
                                            ) : (
                                                <div className="w-20 h-20 rounded-2xl bg-black/60 border-2 border-red-500/30 flex items-center justify-center">
                                                    <ShieldCheckIcon className="w-10 h-10 text-red-500/40" />
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-2xl font-display font-black text-white uppercase italic leading-tight">{opponentTeam.name}</p>
                                                <p className="text-xs font-bold text-red-400 uppercase tracking-widest">{opponentTeam.rosterName}</p>
                                                <div className="mt-2 flex gap-3">
                                                    <span className="text-[10px] font-black bg-black/40 px-3 py-1 rounded-full text-slate-400 border border-white/5 uppercase">TV {calculateTeamValue(opponentTeam).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <button
                                                onClick={handleStartScanner}
                                                className="flex flex-col items-center justify-center gap-3 p-8 rounded-3xl bg-black/40 border border-white/5 hover:border-premium-gold/50 hover:bg-premium-gold/5 transition-all group"
                                            >
                                                <div className="w-14 h-14 rounded-2xl bg-premium-gold/10 flex items-center justify-center border border-premium-gold/30 group-hover:scale-110 transition-transform">
                                                    <span className="material-symbols-outlined text-3xl text-premium-gold">qr_code_scanner</span>
                                                </div>
                                                <span className="text-[10px] font-display font-black text-white uppercase tracking-widest">Escanear Sello</span>
                                            </button>
                                            <div className="relative group">
                                                <div className="absolute inset-0 bg-red-500/5 blur-xl group-hover:bg-red-500/10 transition-all"></div>
                                                <div className="relative h-full flex flex-col items-center justify-center gap-3 p-8 rounded-3xl bg-black/40 border border-white/5 hover:border-red-500/50 hover:bg-red-500/5 transition-all">
                                                    <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/30 group-hover:rotate-12 transition-transform">
                                                        <span className="material-symbols-outlined text-3xl text-red-500">list_alt</span>
                                                    </div>
                                                    <span className="text-[10px] font-display font-black text-white uppercase tracking-widest">Lista Manual</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div id="qr-reader" ref={scannerContainerRef} className="w-full aspect-square bg-black/60 rounded-3xl border border-white/5 overflow-hidden empty:hidden"></div>

                                        <div className="grid gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar pt-4 border-t border-white/5">
                                            <p className="text-[9px] font-display font-black text-slate-600 uppercase tracking-widest mb-2">Equipos Disponibles</p>
                                            {managedTeams.filter(t => t.name !== homeTeam?.name).map(team => (
                                                <button
                                                    key={team.name}
                                                    onClick={() => {
                                                        const baseTeam = team;
                                                        const fullPlayers: ManagedPlayer[] = baseTeam.players.map(p => ({ ...p, status: 'Reserva' }));
                                                        setOpponentTeam({ ...baseTeam, players: fullPlayers });
                                                    }}
                                                    className="group w-full flex items-center gap-4 p-3 rounded-2xl bg-white/5 border border-transparent hover:border-red-500/30 hover:bg-red-500/5 transition-all"
                                                >
                                                    <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center border border-white/5 overflow-hidden">
                                                        {team.crestImage ? <img src={team.crestImage} className="w-full h-full object-cover" /> : <ShieldCheckIcon className="w-5 h-5 text-slate-800" />}
                                                    </div>
                                                    <div className="flex-grow text-left">
                                                        <p className="text-xs font-display font-black text-white uppercase">{team.name}</p>
                                                        <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{team.rosterName}</p>
                                                    </div>
                                                    <span className="material-symbols-outlined text-slate-800 group-hover:text-red-500 text-sm">swords</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {homeTeam && opponentTeam && (
                            <div className="mt-16 flex flex-col items-center animate-bounce-in">
                                <button
                                    onClick={() => setGameState('pre_game')}
                                    className="group relative overflow-hidden bg-gradient-to-b from-premium-gold to-yellow-600 text-black font-display font-black py-6 px-20 rounded-[2rem] shadow-[0_30px_60px_rgba(245,159,10,0.3)] hover:scale-105 active:scale-95 transition-all duration-300"
                                >
                                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                    <span className="relative flex items-center justify-center gap-4 tracking-[0.4em] uppercase text-sm">
                                        Entrar al Coliseo
                                        <span className="material-symbols-outlined font-black">login</span>
                                    </span>
                                </button>
                            </div>
                        )}

                        <div className="mt-12 text-center">
                            <button onClick={() => setGameState('setup')} className="text-[10px] font-display font-black text-slate-500 hover:text-white uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-2 mx-auto py-4 px-8 border border-transparent hover:border-white/10 rounded-2xl">
                                <span className="material-symbols-outlined text-sm">arrow_back</span>
                                Cancelar Invocación
                            </button>
                        </div>
                    </div>
                );
            }
            case 'pre_game': {
                if (!liveHomeTeam || !liveOpponentTeam) return <div className="flex items-center justify-center py-20 text-premium-gold font-display font-black animate-pulse uppercase tracking-widest">Invocando Equipos...</div>;
                if (journeymenNotification) return (
                    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
                        <div className="glass-panel p-8 max-w-sm w-full text-center border-premium-gold/30 shadow-[0_0_50px_rgba(245,159,10,0.2)] animate-slide-in-up">
                            <div className="w-16 h-16 bg-premium-gold/10 rounded-2xl border border-premium-gold/30 flex items-center justify-center mx-auto mb-6">
                                <span className="material-symbols-outlined text-3xl text-premium-gold">person_add</span>
                            </div>
                            <h3 className="text-xl font-display font-black text-premium-gold uppercase italic tracking-tighter mb-4">Sustitutos Requeridos</h3>
                            <p className="text-slate-400 text-sm mb-8 leading-relaxed whitespace-pre-wrap">{journeymenNotification}</p>
                            <button onClick={handleConfirmJourneymen} className="w-full bg-premium-gold text-black font-display font-black py-3 rounded-xl uppercase tracking-widest text-xs hover:bg-white hover:scale-105 transition-all shadow-lg">Entendido, Capitán</button>
                        </div>
                    </div>
                );

                const preGameTitles = [
                    "Levantamiento de Muertos", // 0 (Journeymen)
                    "El Centro de Mando",       // 1 (Inducements, Fate, Coin Toss)
                    "Despliegue de Guerra",     // 2 (Deployment)
                    "El Gran Kickoff"           // 3 (Kickoff Event)
                ];

                const handleKickoffRoll = () => {
                    setKickoffActionCompleted(false);
                    const die1 = Math.floor(Math.random() * 6) + 1, die2 = Math.floor(Math.random() * 6) + 1, roll = die1 + die2;
                    const event = kickoffEvents.find(e => e.diceRoll === roll.toString());
                    if (event) {
                        setGameStatus(prev => ({ ...prev, kickoffEvent: event }));
                        logEvent('KICKOFF', `Evento de Patada (${roll}): ${event.title}`);
                        if (event.title !== 'Clima Cambiante') setKickoffActionCompleted(true);
                    }
                };

                return (
                    <div className="max-w-6xl mx-auto space-y-10 py-6 animate-fade-in">
                        {/* Pre-Game Stepper Header */}
                        <div className="flex flex-col items-center">
                            <div className="text-[10px] font-display font-black text-premium-gold uppercase tracking-[0.4em] mb-2 opacity-60">Fase de Preparación</div>
                            <h2 className="text-4xl font-display font-black text-white italic tracking-tighter uppercase text-center">
                                {preGameTitles[preGameStep]}
                            </h2>
                            <div className="mt-4 flex gap-1">
                                {preGameTitles.map((_, i) => (
                                    <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i === preGameStep ? 'w-8 bg-premium-gold' : i < preGameStep ? 'w-4 bg-premium-gold/40' : 'w-4 bg-white/5'}`}></div>
                                ))}
                            </div>
                        </div>

                        <div className="glass-panel border-white/5 bg-black/40 p-8 shadow-2xl">
                            {preGameStep === 1 && (
                                <div className='space-y-10 animate-fade-in'>
                                    {/* Dashboard Layout: Inducements + Fate */}
                                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                                        {/* Left Side: Inducements Market (Col 7) */}
                                        <div className="xl:col-span-7 space-y-6">
                                            <div className="flex items-center gap-4 mb-2">
                                                <div className="w-10 h-10 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-green-500">payments</span>
                                                </div>
                                                <h3 className="text-xl font-display font-black text-white uppercase italic">Mercado de Incentivos</h3>
                                            </div>

                                            {inducementState.underdog ? (() => {
                                                const underdogTeam = inducementState.underdog === 'home' ? liveHomeTeam : liveOpponentTeam;
                                                const baseRoster = teamsData.find(t => t.name === underdogTeam.rosterName);
                                                const eligibleStars = starPlayersData.filter(star => isEligibleStar(star, baseRoster));
                                                const bribeCost = baseRoster?.specialRules.includes("Sobornos y corrupción") ? 50000 : 100000;
                                                const isUndead = ["Nigrománticos", "No Muertos", "Khemri", "Vampiros"].includes(underdogTeam.rosterName);
                                                const isNurgle = underdogTeam.rosterName === "Nurgle";
                                                const canHaveApo = baseRoster?.apothecary === "Sí";

                                                const options = [
                                                    { name: 'reroll', icon: 'refresh', label: 'Reroll Extra', cost: 100000, count: (underdogTeam.liveRerolls || 0) - underdogTeam.rerolls },
                                                    { name: 'bribe', icon: 'payments', label: 'Soborno', cost: bribeCost, count: underdogTeam.tempBribes || 0 },
                                                    { name: 'cheerleader', icon: 'campaign', label: 'Animadora', cost: 10000, count: underdogTeam.tempCheerleaders || 0 },
                                                    { name: 'coach', icon: 'person', label: 'Ayudante', cost: 10000, count: underdogTeam.tempAssistantCoaches || 0 },
                                                    { name: 'biasedRef', icon: 'gavel', label: 'Árbitro Parcial', cost: 50000, count: underdogTeam.biasedRef ? 1 : 0 },
                                                ];

                                                if (canHaveApo) options.push({ name: 'wanderingApothecary', icon: 'medical_services', label: 'Boticario', cost: 100000, count: underdogTeam.wanderingApothecaries || 0 });
                                                if (isUndead) options.push({ name: 'mortuaryAssistant', icon: 'skull', label: 'Asistente Necromante', cost: 100000, count: underdogTeam.mortuaryAssistants || 0 });
                                                if (isNurgle) options.push({ name: 'plagueDoctor', icon: 'coronavirus', label: 'Médico de la Peste', cost: 100000, count: underdogTeam.plagueDoctors || 0 });

                                                return (
                                                    <div className="space-y-6">
                                                        <div className="glass-panel p-6 border-green-500/20 bg-green-500/5 flex items-center justify-between">
                                                            <div>
                                                                <p className="text-[10px] font-display font-black text-green-500 uppercase tracking-widest mb-1">Tesoro de Indulgencia</p>
                                                                <p className="text-3xl font-display font-black text-white italic">
                                                                    {inducementState.money.toLocaleString()} <span className="text-xs text-green-500/50">m.o.</span>
                                                                </p>
                                                            </div>
                                                            <div className="w-16 h-16 rounded-full bg-black/60 border border-white/10 flex items-center justify-center">
                                                                <span className="material-symbols-outlined text-green-500 text-3xl">account_balance_wallet</span>
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-3">
                                                                <h4 className="text-[10px] font-display font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Favores y Personal</h4>
                                                                {options.map(item => (
                                                                    <div key={item.name} className="flex justify-between items-center bg-white/5 p-3 rounded-2xl border border-white/5 group hover:border-premium-gold/30 transition-all">
                                                                        <div className="flex items-center gap-3">
                                                                            <span className="material-symbols-outlined text-lg text-slate-500 group-hover:text-premium-gold">{item.icon}</span>
                                                                            <div>
                                                                                <p className="text-[10px] font-bold text-white uppercase tracking-wider">{item.label}</p>
                                                                                <p className="text-[8px] text-slate-500 font-bold">{item.cost / 1000}k</p>
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex items-center gap-3">
                                                                            <button onClick={() => handleSellInducement(item.name as any, item.cost)} className="w-8 h-8 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">
                                                                                <span className="material-symbols-outlined text-sm">remove</span>
                                                                            </button>
                                                                            <span className="font-display font-black text-white text-lg w-6 text-center">{item.count}</span>
                                                                            <button onClick={() => handleBuyInducement(item.name as any, item.cost)} className="w-8 h-8 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center hover:bg-green-500 hover:text-white transition-all">
                                                                                <span className="material-symbols-outlined text-sm">add</span>
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>

                                                            <div className="space-y-4">
                                                                <h4 className="text-[10px] font-display font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Jugadores Estrella</h4>
                                                                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                                                    {eligibleStars.map(star => {
                                                                        const isHired = inducementState.hiredStars.some(s => s.name === star.name);
                                                                        return (
                                                                            <div key={star.name} className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${isHired ? 'bg-premium-gold/10 border-premium-gold/40' : 'bg-white/5 border-white/5 shadow-xl hover:border-white/20'}`}>
                                                                                <div className="flex-1 min-w-0 mr-4">
                                                                                    <button onClick={() => setSelectedStarPlayer(star)} className="text-[10px] font-black text-white hover:text-premium-gold uppercase italic tracking-tighter truncate w-full text-left transition-colors">{star.name}</button>
                                                                                    <p className="text-[8px] font-bold text-slate-500">{star.cost / 1000}k m.o.</p>
                                                                                </div>
                                                                                <button
                                                                                    onClick={() => isHired ? handleFireStar(star) : handleHireStar(star)}
                                                                                    disabled={!isHired && inducementState.money < star.cost}
                                                                                    className={`p-2 rounded-xl transition-all ${isHired ? 'text-red-500 hover:bg-red-500/10' : 'text-green-500 hover:bg-green-500/10 disabled:opacity-20'}`}
                                                                                >
                                                                                    <span className="material-symbols-outlined text-sm">{isHired ? 'person_remove' : 'person_add'}</span>
                                                                                </button>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })() : (
                                                <div className="glass-panel p-10 border-white/5 bg-white/5 text-center space-y-4">
                                                    <div className="w-16 h-16 mx-auto bg-white/10 rounded-full flex items-center justify-center mb-2">
                                                        <span className="material-symbols-outlined text-slate-500 text-3xl">balance</span>
                                                    </div>
                                                    <p className="text-slate-400 text-sm font-medium italic">"Los equipos están equilibrados. Nuffle no otorga oro adicional hoy."</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Right Side: Fate & Environment (Col 5) */}
                                        <div className="xl:col-span-5 space-y-8">
                                            {/* Environment Card */}
                                            <div className="space-y-6">
                                                <div className="flex items-center gap-4 mb-2">
                                                    <div className="w-10 h-10 rounded-full bg-sky-500/10 border border-sky-500/30 flex items-center justify-center">
                                                        <span className="material-symbols-outlined text-sky-400">cyclone</span>
                                                    </div>
                                                    <h3 className="text-xl font-display font-black text-white uppercase italic">Destino y Entorno</h3>
                                                </div>

                                                <div className="glass-panel p-6 border-white/10 bg-black/40 space-y-6">
                                                    <div className="flex justify-between items-start">
                                                        <div className="space-y-4 flex-1">
                                                            {/* Clima Box */}
                                                            <div className={`p-4 rounded-2xl border transition-all ${gameStatus.weather ? 'bg-sky-500/10 border-sky-500/30 shadow-[0_0_20px_rgba(14,165,233,0.1)]' : 'bg-white/5 border-white/5 opacity-50'}`}>
                                                                <p className="text-[10px] font-display font-black text-sky-400 uppercase tracking-widest mb-2">Clima</p>
                                                                {gameStatus.weather ? (
                                                                    <div className="flex items-center gap-3">
                                                                        <span className="material-symbols-outlined text-2xl text-white">cloud_queue</span>
                                                                        <h4 className="text-lg font-display font-black text-white uppercase italic">{gameStatus.weather.title}</h4>
                                                                    </div>
                                                                ) : (
                                                                    <p className="text-[10px] text-slate-500 uppercase font-bold italic tracking-wider">Pendiente de Consultar</p>
                                                                )}
                                                            </div>

                                                            {/* Fans/Fame Box */}
                                                            <div className={`p-4 rounded-2xl border transition-all ${fame.home !== 0 || fame.opponent !== 0 ? 'bg-amber-500/10 border-amber-500/30 shadow-[0_0_20px_rgba(245,159,10,0.1)]' : 'bg-white/5 border-white/5 opacity-50'}`}>
                                                                <p className="text-[10px] font-display font-black text-amber-500 uppercase tracking-widest mb-2">Influencia de FAMA</p>
                                                                {fame.home !== 0 || fame.opponent !== 0 ? (
                                                                    <div className="flex justify-around items-center text-center">
                                                                        <div>
                                                                            <p className="text-[8px] font-bold text-slate-500 uppercase mb-1">Local</p>
                                                                            <p className="text-xl font-display font-black text-white leading-none">+{fame.home}</p>
                                                                        </div>
                                                                        <div className="w-px h-8 bg-white/10"></div>
                                                                        <div>
                                                                            <p className="text-[8px] font-bold text-slate-500 uppercase mb-1">Rival</p>
                                                                            <p className="text-xl font-display font-black text-white leading-none">+{fame.opponent}</p>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <p className="text-[10px] text-slate-500 uppercase font-bold italic tracking-wider">Sin Registro del Grito</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={() => {
                                                            // Resolve Weather
                                                            const die1 = Math.floor(Math.random() * 6) + 1, die2 = Math.floor(Math.random() * 6) + 1, total = die1 + die2;
                                                            const w = weatherConditions.find(wc => wc.diceRoll === total.toString());
                                                            if (w) { setGameStatus(prev => ({ ...prev, weather: w })); logEvent('INFO', `Clima Invocado (${total}): ${w.title}`); }

                                                            // Resolve Fame
                                                            const hf = (Math.floor(Math.random() * 6) + 1) + (Math.floor(Math.random() * 6) + 1);
                                                            const of = (Math.floor(Math.random() * 6) + 1) + (Math.floor(Math.random() * 6) + 1);
                                                            const hTotal = liveHomeTeam.dedicatedFans + hf;
                                                            const oTotal = liveOpponentTeam.dedicatedFans + of;
                                                            let homeFame = 0, oppFame = 0;
                                                            if (hTotal >= oTotal * 2) homeFame = 2; else if (hTotal > oTotal) homeFame = 1;
                                                            if (oTotal >= hTotal * 2) oppFame = 2; else if (oTotal > hTotal) oppFame = 1;
                                                            setFame({ home: homeFame, opponent: oppFame });
                                                            setFansRoll({ home: hf.toString(), opponent: of.toString() });
                                                            logEvent('INFO', `Tirada Hinchas - ${liveHomeTeam.name}: ${hTotal}, ${liveOpponentTeam.name}: ${oTotal}. FAMA: ${homeFame} - ${oppFame}`);
                                                            playSound('dice');
                                                        }}
                                                        className="w-full bg-sky-500 text-black font-display font-black py-4 rounded-[1.5rem] shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
                                                    >
                                                        <span className="material-symbols-outlined text-lg">casino</span>
                                                        <span className="text-[10px] uppercase tracking-[0.2em]">Consultar Oráculos</span>
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Coin Toss Section */}
                                            <div className="space-y-6">
                                                <div className="flex items-center gap-4 mb-2">
                                                    <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                                                        <span className="material-symbols-outlined text-amber-500">toll</span>
                                                    </div>
                                                    <h3 className="text-xl font-display font-black text-white uppercase italic">Juicio de la Moneda</h3>
                                                </div>

                                                <div className="glass-panel p-6 border-white/10 bg-black/40 space-y-6">
                                                    {!gameStatus.coinTossWinner ? (
                                                        <div className="flex gap-4">
                                                            <button
                                                                onClick={() => { setGameStatus(p => ({ ...p, coinTossWinner: 'home' })); logEvent('INFO', `Duelo Ganado (Moneda): ${liveHomeTeam.name}`); }}
                                                                className="flex-1 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-sky-500/20 hover:border-sky-500/40 transition-all text-center group"
                                                            >
                                                                <p className="text-[10px] font-display font-black text-slate-500 group-hover:text-sky-400 uppercase tracking-widest mb-1">Cara (Local)</p>
                                                                <p className="text-xs font-display font-black text-white uppercase truncate">{liveHomeTeam?.name?.split(' ')[0] || 'Local'}</p>
                                                            </button>
                                                            <button
                                                                onClick={() => { setGameStatus(p => ({ ...p, coinTossWinner: 'opponent' })); logEvent('INFO', `Duelo Ganado (Moneda): ${liveOpponentTeam.name}`); }}
                                                                className="flex-1 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-red-500/20 hover:border-red-500/40 transition-all text-center group"
                                                            >
                                                                <p className="text-[10px] font-display font-black text-slate-500 group-hover:text-red-400 uppercase tracking-widest mb-1">Cruz (Rival)</p>
                                                                <p className="text-xs font-display font-black text-white uppercase truncate">{liveOpponentTeam?.name?.split(' ')[0] || 'Rival'}</p>
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="animate-slide-in-up space-y-4">
                                                            <div className={`p-4 rounded-2xl border ${gameStatus.coinTossWinner === 'home' ? 'bg-sky-500/10 border-sky-500/30' : 'bg-red-500/10 border-red-500/30'} text-center`}>
                                                                <p className="text-[10px] font-display font-black uppercase tracking-widest opacity-60">Ganador del Sorteo</p>
                                                                <p className="text-lg font-display font-black text-white uppercase italic">{(gameStatus.coinTossWinner === 'home' ? liveHomeTeam : liveOpponentTeam).name}</p>
                                                            </div>

                                                            {!gameStatus.receivingTeam ? (
                                                                <div className="flex gap-3">
                                                                    <button
                                                                        onClick={() => { setGameStatus(p => ({ ...p, receivingTeam: gameStatus.coinTossWinner })); logEvent('INFO', `${(gameStatus.coinTossWinner === 'home' ? liveHomeTeam : liveOpponentTeam).name} ha decidido RECIBIR.`); }}
                                                                        className="flex-1 py-3 rounded-xl bg-premium-gold/10 border border-premium-gold/30 text-premium-gold text-[10px] font-display font-black uppercase tracking-widest hover:bg-premium-gold hover:text-black transition-all"
                                                                    >
                                                                        Recibir el Balón
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            const kicker = gameStatus.coinTossWinner;
                                                                            const receiver = kicker === 'home' ? 'opponent' : 'home';
                                                                            setGameStatus(p => ({ ...p, receivingTeam: receiver }));
                                                                            logEvent('INFO', `${(gameStatus.coinTossWinner === 'home' ? liveHomeTeam : liveOpponentTeam).name} ha decidido PATEAR.`);
                                                                        }}
                                                                        className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-[10px] font-display font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all"
                                                                    >
                                                                        Patear
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center justify-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5">
                                                                    <span className="material-symbols-outlined text-green-500 text-sm">check_circle</span>
                                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                                        {gameStatus.receivingTeam === 'home' ? liveHomeTeam.name : liveOpponentTeam.name} Recibe
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Final Confirmation */}
                                    {gameStatus.weather && gameStatus.receivingTeam && (
                                        <div className="pt-10 border-t border-white/5 flex justify-center animate-bounce-in">
                                            <button
                                                onClick={() => {
                                                    // Prepare for deployment
                                                    setFirstHalfReceiver(gameStatus.receivingTeam);
                                                    setPreGameStep(2); // Deployment
                                                    logEvent('INFO', 'Preparativos completados. Entrando en fase de Despliegue.');
                                                }}
                                                className="group relative overflow-hidden bg-gradient-to-b from-green-600 to-green-700 text-white font-display font-black py-6 px-24 rounded-[2rem] shadow-[0_20px_40px_rgba(34,197,94,0.2)] hover:scale-105 active:scale-95 transition-all duration-300"
                                            >
                                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                                <span className="relative flex items-center justify-center gap-4 tracking-[0.4em] uppercase text-sm">
                                                    Confirmar Estrategia
                                                    <span className="material-symbols-outlined font-black">shield_with_heart</span>
                                                </span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {preGameStep === 2 && (
                                <div className="space-y-10">
                                    <div className="text-center max-w-lg mx-auto">
                                        <p className="text-slate-500 text-sm leading-relaxed tracking-wide italic">"Despliega tus tropas. El campo de batalla se tiñe de verde y gloria. Solo 11 guerreros pueden pisar el césped al unísono."</p>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                        {[liveHomeTeam, liveOpponentTeam].map((team, index) => {
                                            const teamId = index === 0 ? 'home' : 'opponent';
                                            const onField = team.players.filter(p => p.status === 'Activo');
                                            const onBench = team.players.filter(p => p.status === 'Reserva');
                                            const accentColor = teamId === 'home' ? 'sky' : 'red';

                                            return (
                                                <div key={teamId} className="flex flex-col gap-6">
                                                    <div className="flex items-center justify-between border-b border-white/5 pb-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className={`w-12 h-12 rounded-2xl bg-black/60 border border-white/10 flex items-center justify-center overflow-hidden`}>
                                                                {team.crestImage ? <img src={team.crestImage} className="w-full h-full object-cover" /> : <ShieldCheckIcon className="w-6 h-6 text-slate-700" />}
                                                            </div>
                                                            <div>
                                                                <h4 className={`text-lg font-display font-black text-${accentColor}-400 uppercase italic tracking-tighter leading-none`}>{team.name}</h4>
                                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{team.rosterName}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className={`text-xl font-display font-black ${onField.length > 11 ? 'text-red-500' : 'text-white'}`}>{onField.length}/11</div>
                                                            <div className="text-[8px] font-bold text-slate-600 uppercase">En el Campo</div>
                                                        </div>
                                                    </div>

                                                    <div className="relative group">
                                                        <div className={`absolute -inset-1 bg-gradient-to-b from-${accentColor}-500/20 to-transparent rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000`}></div>
                                                        <div className="relative bg-black/60 rounded-[2.5rem] border border-white/10 p-4 shadow-3xl">
                                                            <MiniField
                                                                players={onField}
                                                                teamColor={teamId === 'home' ? 'bg-sky-500' : 'bg-red-500'}
                                                                onPlayerMove={(playerId, pos) => handlePlayerMove(teamId, playerId, pos)}
                                                                ballCarrierId={ballCarrierId}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="bg-black/40 border border-white/5 rounded-3xl p-5 h-[350px] overflow-hidden flex flex-col">
                                                        <div className="flex justify-between items-center mb-4">
                                                            <h5 className="text-[10px] font-display font-black text-slate-500 uppercase tracking-widest">
                                                                Roster de Guerra
                                                                <span className="ml-2 text-[8px] bg-white/5 px-2 py-0.5 rounded-full">{team.players.length} Total</span>
                                                            </h5>
                                                            <button
                                                                onClick={() => handleAutoSelectTeam(teamId as 'home' | 'opponent')}
                                                                className="text-[8px] font-display font-black text-premium-gold hover:text-white border border-premium-gold/30 hover:border-premium-gold bg-premium-gold/5 px-3 py-1.5 rounded-lg transition-all uppercase tracking-widest"
                                                            >
                                                                Sugerir 11 Inicial
                                                            </button>
                                                        </div>
                                                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2">
                                                            {/* Grouped statuses for better UI */}
                                                            <div className="space-y-1">
                                                                {team.players.map((p, idx) => (
                                                                    <PlayerStatusCard
                                                                        key={p.id}
                                                                        player={p}
                                                                        playerNumber={p.status === 'Activo' ? onField.findIndex(pl => pl.id === p.id) + 1 : undefined}
                                                                        onViewPlayer={setViewingPlayer}
                                                                        onSkillClick={handleSkillClick}
                                                                        canToggleStatus={true}
                                                                        onStatusToggle={() => handlePlayerStatusToggle(p, teamId)}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="flex flex-wrap justify-center gap-6 pt-10 border-t border-white/5">
                                        <button
                                            onClick={() => {
                                                const homeOnField = liveHomeTeam.players.filter(p => p.status === 'Activo').length;
                                                const oppOnField = liveOpponentTeam.players.filter(p => p.status === 'Activo').length;
                                                const homeAvailable = liveHomeTeam.players.filter(p => p.status !== 'Muerto' && p.status !== 'Lesionado' && (p.missNextGame || 0) <= 0).length;
                                                const oppAvailable = liveOpponentTeam.players.filter(p => p.status !== 'Muerto' && p.status !== 'Lesionado' && (p.missNextGame || 0) <= 0).length;

                                                if (homeOnField === 0 || oppOnField === 0) {
                                                    alert('Ambos equipos deben tener al menos un guerrero en el campo para la batalla.');
                                                    return;
                                                }

                                                if ((homeOnField < 11 && homeOnField < homeAvailable) || (oppOnField < 11 && oppOnField < oppAvailable)) {
                                                    if (!confirm('Uno de los equipos tiene menos de 11 jugadores en el campo pudiendo desplegar más. ¿Deseas continuar con estas bajas?')) return;
                                                }
                                                setPreGameStep(3); // Kickoff Event
                                                logEvent('INFO', 'Despliegue confirmado. ¡Que ruede el balón!');
                                            }}
                                            className="bg-premium-gold text-black font-display font-black py-4 px-12 rounded-2xl shadow-xl hover:scale-105 transition-all text-xs uppercase tracking-[0.3em]"
                                        >
                                            Confirmar Despliegue
                                        </button>

                                        <button
                                            onClick={() => {
                                                if (liveHomeTeam.players.filter(p => p.status === 'Activo').length === 0) handleAutoSelectTeam('home');
                                                if (liveOpponentTeam.players.filter(p => p.status === 'Activo').length === 0) handleAutoSelectTeam('opponent');
                                                handleSuggestDeployment();
                                            }}
                                            className="bg-white/5 border border-white/10 text-white font-display font-black py-4 px-8 rounded-2xl hover:bg-white/10 transition-all text-xs uppercase tracking-widest"
                                        >
                                            Sugerir Despliegue
                                        </button>
                                    </div>
                                </div>
                            )}

                            {preGameStep === 3 && (
                                <div className='max-w-xl mx-auto space-y-12 text-center py-6'>
                                    {!gameStatus.kickoffEvent ? (
                                        <div className="space-y-10">
                                            <div className="flex flex-col items-center gap-6">
                                                <div className="w-40 h-40 bg-premium-gold/5 rounded-[3rem] border-2 border-premium-gold/20 flex items-center justify-center shadow-[0_0_80px_rgba(245,159,10,0.1)] relative group">
                                                    <div className="absolute inset-0 bg-premium-gold/10 rounded-[3rem] blur-2xl animate-pulse"></div>
                                                    <span className="material-symbols-outlined text-7xl text-premium-gold relative z-10 animate-bounce">sports_football</span>
                                                </div>
                                                <div className="space-y-2">
                                                    <h3 className="text-3xl font-display font-black text-white italic uppercase tracking-tighter">La Patada Inicial</h3>
                                                    <p className="text-slate-500 text-sm max-w-xs mx-auto">Lanza los dados del destino para determinar el evento impredecible que marcará el inicio del asalto.</p>
                                                </div>
                                            </div>

                                            <div className="flex justify-center">
                                                <DiceRollButton onRoll={handleKickoffRoll} onPlaySound={() => playSound('dice')} />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-10 animate-slide-in-up">
                                            <div className="relative">
                                                <div className="absolute -inset-8 bg-sky-500/10 blur-[80px] rounded-full"></div>
                                                <div className="relative glass-panel border-sky-500/30 bg-black/60 p-10 rounded-[4rem] shadow-4xl transform hover:scale-[1.02] transition-transform duration-700">
                                                    <div className="text-[10px] font-display font-black text-sky-400 uppercase tracking-[0.4em] mb-4">Intervención del Destino</div>
                                                    <h4 className="text-4xl font-display font-black text-white italic uppercase tracking-tighter mb-4">{gameStatus.kickoffEvent.title}</h4>
                                                    <div className="w-16 h-1 bg-sky-500/30 mx-auto mb-6 rounded-full"></div>
                                                    <p className="text-slate-400 text-sm leading-relaxed max-w-sm mx-auto italic">{gameStatus.kickoffEvent.description}</p>
                                                </div>
                                            </div>

                                            {kickoffActionCompleted && (
                                                <button
                                                    onClick={handleStartDrive}
                                                    className="group relative overflow-hidden bg-green-500 text-black font-display font-black py-6 px-20 rounded-2xl shadow-[0_30px_60px_rgba(34,197,94,0.3)] hover:scale-105 active:scale-95 transition-all duration-300"
                                                >
                                                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                                    <span className="relative text-xs uppercase tracking-[0.4em]">¡Que Corra la Sangre!</span>
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                );
            }
            case 'ko_recovery': {
                if (!liveHomeTeam || !liveOpponentTeam) return <div>Cargando...</div>;
                const homeKOs = liveHomeTeam.players.filter(p => p.status === 'KO');
                const oppKOs = liveOpponentTeam.players.filter(p => p.status === 'KO');
                const handleStartNextDrive = () => {
                    setKoRecoveryRolls({});
                    setGameStatus(prev => ({ ...prev, kickoffEvent: null, receivingTeam: prev.receivingTeam === 'home' ? 'opponent' : 'home' }));
                    setTurn(t => t + 1);
                    setPreGameStep(2); // Deployment
                    setGameState('pre_game');
                };
                return (
                    <div className="bg-slate-900/70 p-4 sm:p-6 rounded-lg border border-slate-700 max-w-3xl mx-auto space-y-6">
                        <h2 className="text-2xl font-bold text-amber-400 text-center">Recuperación de Inconscientes</h2>
                        <p className="text-center text-slate-400">Tira 1D6 por cada jugador KO. Con 4+, se recupera y va al banquillo.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    {liveHomeTeam.crestImage && (
                                        <img src={liveHomeTeam.crestImage} alt="Escudo" className="w-10 h-10 rounded-full object-cover" />
                                    )}
                                    <h3 className="text-lg font-bold text-sky-400">{liveHomeTeam.name}</h3>
                                </div>
                                {homeKOs.length > 0 ? homeKOs.map(p => (<div key={p.id} className="flex justify-between items-center p-2 bg-slate-800 rounded-md mb-2"> <span className="text-white">{p.customName}</span> {koRecoveryRolls[p.id] ? <span className={`font-bold ${koRecoveryRolls[p.id]?.success ? 'text-green-400' : 'text-red-400'}`}>Tirada {koRecoveryRolls[p.id]?.roll} - {koRecoveryRolls[p.id]?.success ? 'Recuperado' : 'KO'}</span> : <button onClick={() => rollKoRecovery(p)} className="text-xs bg-amber-500 text-slate-900 font-bold py-1 px-2 rounded">Tirar</button>} </div>)) : <p className="text-slate-400 text-sm">Sin jugadores KO.</p>}
                            </div>
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    {liveOpponentTeam.crestImage && (
                                        <img src={liveOpponentTeam.crestImage} alt="Escudo" className="w-10 h-10 rounded-full object-cover" />
                                    )}
                                    <h3 className="text-lg font-bold text-red-400">{liveOpponentTeam.name}</h3>
                                </div>
                                {oppKOs.length > 0 ? oppKOs.map(p => (<div key={p.id} className="flex justify-between items-center p-2 bg-slate-800 rounded-md mb-2"> <span className="text-white">{p.customName}</span> {koRecoveryRolls[p.id] ? <span className={`font-bold ${koRecoveryRolls[p.id]?.success ? 'text-green-400' : 'text-red-400'}`}>Tirada {koRecoveryRolls[p.id]?.roll} - {koRecoveryRolls[p.id]?.success ? 'Recuperado' : 'KO'}</span> : <button onClick={() => rollKoRecovery(p)} className="text-xs bg-amber-500 text-slate-900 font-bold py-1 px-2 rounded">Tirar</button>} </div>)) : <p className="text-slate-400 text-sm">Sin jugadores KO.</p>}
                            </div>
                        </div>
                        <div className="text-center pt-4 border-t border-slate-700"> <button onClick={handleStartNextDrive} className="bg-amber-500 text-slate-900 font-bold py-2 px-6 rounded-md shadow-md hover:bg-amber-400">Comenzar Siguiente Patada</button> </div>
                    </div>
                );
            }
            case 'in_progress':
                if (!liveHomeTeam || !liveOpponentTeam) return <div className="text-white font-display font-black text-center py-20 animate-pulse">Invocando escuadras...</div>;

                return (
                    <div className="flex h-[calc(100vh-180px)] gap-6 overflow-hidden animate-fade-in-slow">
                        {/* SIDEBAR IZQUIERDA: Marcador y Recursos */}
                        <aside className="w-80 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
                            {/* Scoreboard */}
                            <div className="glass-panel p-6 border-white/5 bg-black/40 space-y-8">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center bg-black/60 p-4 rounded-3xl border border-white/10 shadow-inner">
                                        <div className="text-center flex-1">
                                            <p className="text-[10px] font-display font-black text-sky-500 uppercase tracking-widest mb-1">Local</p>
                                            <span className="text-5xl font-display font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">{score.home}</span>
                                        </div>
                                        <div className="text-premium-gold/30 font-black text-2xl px-2 italic select-none">VS</div>
                                        <div className="text-center flex-1">
                                            <p className="text-[10px] font-display font-black text-red-500 uppercase tracking-widest mb-1">Rival</p>
                                            <span className="text-5xl font-display font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">{score.opponent}</span>
                                        </div>
                                    </div>

                                    <div className="bg-premium-gold/5 border border-premium-gold/20 p-4 rounded-2xl text-center relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-premium-gold/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                        <p className="text-[9px] font-display font-black text-premium-gold uppercase tracking-[0.3em] mb-2">Reloj de Arena</p>
                                        <div className="flex items-center justify-center gap-3">
                                            <div className="flex flex-col">
                                                <span className="text-white font-display font-black text-lg leading-none italic">{half === 1 ? '1ª' : '2ª'}</span>
                                                <span className="text-[8px] text-slate-500 font-bold uppercase">Mitad</span>
                                            </div>
                                            <div className="w-px h-8 bg-premium-gold/20"></div>
                                            <div className="flex flex-col">
                                                <span className="text-white font-display font-black text-lg leading-none italic">{turn}</span>
                                                <span className="text-[8px] text-slate-500 font-bold uppercase">Turno</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Active Team Selector */}
                                <div className="space-y-3">
                                    <h4 className="text-[10px] font-display font-black text-slate-500 uppercase tracking-widest px-2">Posesión Activa</h4>
                                    <div className="flex gap-2 p-1.5 bg-black/60 rounded-2xl border border-white/10">
                                        <button
                                            onClick={() => setActiveTeamId('home')}
                                            className={`flex-1 py-3 rounded-xl text-[10px] font-display font-black uppercase tracking-widest transition-all duration-300 ${activeTeamId === 'home' ? 'bg-sky-500 text-black shadow-[0_0_20px_rgba(14,165,233,0.4)] scale-105' : 'text-slate-500 hover:text-sky-400 hover:bg-sky-500/5'}`}
                                        >
                                            {liveHomeTeam?.name?.split(' ')[0] || 'Local'}
                                        </button>
                                        <button
                                            onClick={() => setActiveTeamId('opponent')}
                                            className={`flex-1 py-3 rounded-xl text-[10px] font-display font-black uppercase tracking-widest transition-all duration-300 ${activeTeamId === 'opponent' ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)] scale-105' : 'text-slate-500 hover:text-red-400 hover:bg-red-500/5'}`}
                                        >
                                            {liveOpponentTeam?.name?.split(' ')[0] || 'Rival'}
                                        </button>
                                    </div>
                                </div>

                                {/* Rerolls & Inducements */}
                                <div className="space-y-4 pt-6 border-t border-white/5">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-sky-500/5 border border-sky-500/20 p-4 rounded-2xl flex flex-col items-center gap-2 group transition-all hover:bg-sky-500/10">
                                            <span className="text-[9px] font-display font-black text-sky-500 uppercase tracking-tighter">Segundas Oportunidades</span>
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl font-display font-black text-white">{liveHomeTeam.liveRerolls || 0}</span>
                                                <button
                                                    onClick={() => useReroll('home')}
                                                    disabled={(liveHomeTeam.liveRerolls || 0) === 0}
                                                    className="w-7 h-7 rounded-xl bg-sky-500 text-black flex items-center justify-center hover:bg-sky-400 disabled:opacity-20 transition-all active:scale-90 shadow-lg"
                                                >
                                                    <span className="material-symbols-outlined text-sm font-black text-black">remove</span>
                                                </button>
                                            </div>
                                        </div>
                                        <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-2xl flex flex-col items-center gap-2 group transition-all hover:bg-red-500/10">
                                            <span className="text-[9px] font-display font-black text-red-500 uppercase tracking-tighter">Segundas Oportunidades</span>
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl font-display font-black text-white">{liveOpponentTeam.liveRerolls || 0}</span>
                                                <button
                                                    onClick={() => useReroll('opponent')}
                                                    disabled={(liveOpponentTeam.liveRerolls || 0) === 0}
                                                    className="w-7 h-7 rounded-xl bg-red-600 text-white flex items-center justify-center hover:bg-red-500 disabled:opacity-20 transition-all active:scale-90 shadow-lg"
                                                >
                                                    <span className="material-symbols-outlined text-sm font-black text-white">remove</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Dugout / Casualty Summary */}
                                <div className="space-y-3 pt-6 border-t border-white/5">
                                    <h4 className="text-[10px] font-display font-black text-slate-500 uppercase tracking-widest px-2">Baneados y Bajas</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-amber-500 text-sm">hotel</span>
                                                <span className="text-[10px] font-display font-bold text-slate-400 uppercase">Inconscientes (KO)</span>
                                            </div>
                                            <span className="text-xs font-display font-black text-white">
                                                <span className="text-sky-400">{liveHomeTeam.players.filter(p => p.status === 'KO').length}</span>
                                                <span className="mx-1 text-slate-600">|</span>
                                                <span className="text-red-400">{liveOpponentTeam.players.filter(p => p.status === 'KO').length}</span>
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-blood-red text-sm">skull</span>
                                                <span className="text-[10px] font-display font-bold text-slate-400 uppercase">Bajas Críticas</span>
                                            </div>
                                            <span className="text-xs font-display font-black text-white">
                                                <span className="text-sky-400">{liveHomeTeam.players.filter(p => ['Lesionado', 'Expulsado', 'Muerto'].includes(p.status || '')).length}</span>
                                                <span className="mx-1 text-slate-600">|</span>
                                                <span className="text-red-400">{liveOpponentTeam.players.filter(p => ['Lesionado', 'Expulsado', 'Muerto'].includes(p.status || '')).length}</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setGameState('post_game')}
                                className="w-full group relative overflow-hidden text-[10px] font-display font-black uppercase tracking-[0.3em] bg-blood-red/10 border border-blood-red/30 text-blood-red hover:bg-black hover:text-white py-4 px-6 rounded-2xl transition-all shadow-xl mt-auto"
                            >
                                <div className="absolute inset-0 bg-blood-red -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-in-out -z-10"></div>
                                Finalizar Encuentro
                            </button>
                        </aside>

                        {/* PANEL CENTRAL: Consola de Jugador y Acciones */}
                        <main className="flex-1 flex flex-col gap-6 overflow-hidden">
                            {/* Player Selection Header */}
                            <div className="glass-panel p-6 border-premium-gold/30 bg-black/60 shadow-[0_0_50px_rgba(245,159,10,0.1)] flex-shrink-0 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-premium-gold/5 blur-[100px] -z-10"></div>
                                {selectedPlayerForAction ? (
                                    <div className="flex items-center gap-8 animate-slide-in-up">
                                        <div className="relative">
                                            <div className="w-24 h-24 rounded-3xl bg-premium-gold/5 border-2 border-premium-gold/20 flex items-center justify-center overflow-hidden shadow-2xl">
                                                <span className="material-symbols-outlined text-premium-gold text-5xl">person</span>
                                            </div>
                                            <div className={`absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl ${activeTeamId === 'home' ? 'bg-sky-500 shadow-[0_0_20px_rgba(14,165,233,0.5)]' : 'bg-red-600 shadow-[0_0_20px_rgba(220,38,38,0.5)]'} flex items-center justify-center border-4 border-black`}>
                                                <span className="text-xs font-display font-black text-white">#{selectedPlayerForAction.id.toString().slice(-2)}</span>
                                            </div>
                                        </div>
                                        <div className="flex-grow min-w-0">
                                            <div className="flex items-center gap-4 mb-3">
                                                <h3 className="text-3xl font-display font-black text-white uppercase italic tracking-tighter truncate leading-none">
                                                    {selectedPlayerForAction.customName}
                                                </h3>
                                                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-display font-black text-slate-500 uppercase tracking-widest leading-none">
                                                    {selectedPlayerForAction.position}
                                                </span>
                                            </div>
                                            <div className="flex gap-8 items-center">
                                                <div className="flex gap-6">
                                                    {[
                                                        { l: 'MA', v: selectedPlayerForAction.stats.MV },
                                                        { l: 'ST', v: selectedPlayerForAction.stats.FU },
                                                        { l: 'AG', v: selectedPlayerForAction.stats.AG },
                                                        { l: 'AV', v: selectedPlayerForAction.stats.AR }
                                                    ].map(s => (
                                                        <div key={s.l} className="flex flex-col items-center">
                                                            <span className="text-[9px] text-premium-gold/50 font-display font-black uppercase tracking-widest leading-none mb-2">{s.l}</span>
                                                            <span className="text-lg font-display font-black text-white leading-none">{s.v}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="h-10 w-px bg-white/10"></div>
                                                <div className="flex flex-wrap gap-2">
                                                    {(selectedPlayerForAction?.skills || '').split(',').map((s, i) => s.trim()).filter(Boolean).map((s, i) => (
                                                        <button
                                                            key={i}
                                                            onClick={() => handleSkillClick(s.trim())}
                                                            className="text-[10px] font-display font-bold text-sky-400 hover:text-white hover:bg-sky-400/10 px-2 py-1 rounded-md transition-all border border-transparent hover:border-sky-400/30"
                                                        >
                                                            {s.trim()}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setSelectedPlayerForAction(null)}
                                            className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-blood-red/20 text-slate-500 hover:text-blood-red transition-all flex items-center justify-center border border-white/5"
                                            title="Liberar Guerrero"
                                        >
                                            <span className="material-symbols-outlined text-2xl">close</span>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="py-8 text-center animate-fade-in">
                                        <div className="flex items-center justify-center gap-3 text-slate-500 mb-1">
                                            <span className="material-symbols-outlined text-lg">touch_app</span>
                                            <p className="font-display font-bold italic text-sm uppercase tracking-widest">Selecciona un Campeón en la Plantilla</p>
                                        </div>
                                        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em]">Nuffle aguarda tu siguiente movimiento</p>
                                    </div>
                                )}
                            </div>

                            {/* Center Action Grid */}
                            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar pb-8">
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                    <button
                                        onClick={() => setIsTdModalOpen(true)}
                                        className="group relative overflow-hidden bg-green-950/20 border-2 border-green-500/20 text-white font-display font-black p-8 rounded-[2rem] hover:bg-green-600 hover:text-black hover:border-green-400 transition-all duration-500 shadow-2xl flex flex-col items-center gap-4"
                                    >
                                        <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center border border-green-500/30 group-hover:bg-black group-hover:border-black group-hover:scale-110 transition-all duration-300">
                                            <TdIcon className="w-8 h-8 text-green-500" />
                                        </div>
                                        <span className="uppercase italic text-[10px] tracking-[0.3em]">Cantar Touchdown</span>
                                        <div className="absolute -bottom-2 -right-2 opacity-5 translate-y-4 group-hover:translate-y-0 transition-transform duration-700">
                                            <TdIcon className="w-24 h-24 text-white" />
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => setIsInjuryModalOpen(true)}
                                        className="group relative overflow-hidden bg-orange-950/20 border-2 border-orange-500/20 text-white font-display font-black p-8 rounded-[2rem] hover:bg-orange-600 hover:text-black hover:border-orange-400 transition-all duration-500 shadow-2xl flex flex-col items-center gap-4"
                                    >
                                        <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center border border-orange-500/30 group-hover:bg-black group-hover:border-black group-hover:scale-110 transition-all duration-300">
                                            <CasualtyIcon className="w-8 h-8 text-orange-500" />
                                        </div>
                                        <span className="uppercase italic text-[10px] tracking-[0.3em]">Registrar Baja</span>
                                        <div className="absolute -bottom-2 -right-2 opacity-10 translate-y-4 group-hover:translate-y-0 transition-transform duration-700">
                                            <CasualtyIcon className="w-24 h-24 text-white" />
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => setIsFoulModalOpen(true)}
                                        className="group relative overflow-hidden bg-amber-950/20 border-2 border-amber-500/20 text-white font-display font-black p-8 rounded-[2rem] hover:bg-amber-600 hover:text-black hover:border-amber-400 transition-all duration-500 shadow-2xl flex flex-col items-center gap-4"
                                    >
                                        <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/30 group-hover:bg-black group-hover:border-black group-hover:scale-110 transition-all duration-300">
                                            <span className="material-symbols-outlined text-amber-500 text-3xl">skull</span>
                                        </div>
                                        <span className="uppercase italic text-[10px] tracking-[0.3em]">Cometer Falta</span>
                                        <div className="absolute -bottom-2 -right-2 opacity-5 translate-y-4 group-hover:translate-y-0 transition-transform duration-700">
                                            <span className="material-symbols-outlined text-8xl text-white">skull</span>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => setIsTurnoverModalOpen(true)}
                                        className="group relative overflow-hidden bg-blood-red/5 border-2 border-blood-red/20 text-blood-red font-display font-black p-8 rounded-[2rem] hover:bg-blood-red hover:text-white hover:border-red-400 transition-all duration-500 shadow-2xl flex flex-col items-center gap-4"
                                    >
                                        <div className="w-16 h-16 bg-blood-red/10 rounded-2xl flex items-center justify-center border border-blood-red/30 group-hover:bg-black group-hover:border-black group-hover:scale-110 transition-all duration-300">
                                            <span className="material-symbols-outlined text-3xl">error</span>
                                        </div>
                                        <span className="uppercase italic text-[10px] tracking-[0.3em]">¡TURNOVER!</span>
                                        <div className="absolute -bottom-2 -right-2 opacity-10 translate-y-4 group-hover:translate-y-0 transition-transform duration-700">
                                            <span className="material-symbols-outlined text-8xl text-white">bolt</span>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => openSppModal('pass')}
                                        className="group relative overflow-hidden bg-sky-950/20 border-2 border-sky-500/20 text-white font-display font-black p-8 rounded-[2rem] hover:bg-sky-500 hover:text-black hover:border-sky-400 transition-all duration-500 shadow-2xl flex flex-col items-center gap-4"
                                    >
                                        <div className="w-16 h-16 bg-sky-500/10 rounded-2xl flex items-center justify-center border border-sky-500/30 group-hover:bg-black group-hover:border-black group-hover:scale-110 transition-all duration-300">
                                            <PassIcon className="w-8 h-8 text-sky-400" />
                                        </div>
                                        <span className="uppercase italic text-[10px] tracking-[0.3em]">Lanzar Pase</span>
                                        <div className="absolute -bottom-2 -right-2 opacity-10 translate-y-4 group-hover:translate-y-0 transition-transform duration-700">
                                            <PassIcon className="w-24 h-24 text-white" />
                                        </div>
                                    </button>

                                    <button
                                        onClick={handleNextTurn}
                                        className="group relative overflow-hidden bg-premium-gold/5 border-2 border-dashed border-premium-gold/30 text-premium-gold font-display font-black p-8 rounded-[2rem] hover:bg-premium-gold hover:text-black hover:border-solid hover:border-premium-gold transition-all duration-500 shadow-2xl flex flex-col items-center gap-4"
                                    >
                                        <div className="w-16 h-16 bg-premium-gold/10 rounded-2xl flex items-center justify-center border border-premium-gold/30 group-hover:bg-black group-hover:border-black group-hover:scale-110 transition-all duration-300">
                                            <span className="material-symbols-outlined text-3xl">forward</span>
                                        </div>
                                        <span className="uppercase italic text-[10px] tracking-[0.3em]">Cambiar Turno</span>
                                        <div className="absolute -bottom-2 -right-2 opacity-10 translate-y-4 group-hover:translate-y-0 transition-transform duration-700">
                                            <span className="material-symbols-outlined text-8xl text-white">redo</span>
                                        </div>
                                    </button>
                                </div>

                                {/* Event Quick Bar */}
                                <div className="mt-10 flex flex-wrap gap-4">
                                    <button onClick={() => setIsCustomEventModalOpen(true)} className="group bg-white/5 border border-white/5 px-6 py-4 rounded-2xl text-[10px] font-display font-black uppercase tracking-widest text-slate-400 hover:text-premium-gold hover:border-premium-gold/30 hover:bg-premium-gold/5 transition-all flex items-center gap-3">
                                        <span className="material-symbols-outlined text-lg transition-transform group-hover:rotate-12">edit_note</span>
                                        Intervención Divina
                                    </button>
                                    <button onClick={() => setIsPrayersModalOpen(true)} className="group bg-white/5 border border-white/5 px-6 py-4 rounded-2xl text-[10px) font-display font-black uppercase tracking-widest text-slate-400 hover:text-sky-400 hover:border-sky-400/30 hover:bg-sky-400/5 transition-all flex items-center gap-3">
                                        <span className="material-symbols-outlined text-lg transition-transform group-hover:scale-110">auto_awesome</span>
                                        Plegarias
                                    </button>
                                    <button onClick={() => setIsWeatherModalOpen(true)} className="group bg-white/5 border border-white/5 px-6 py-4 rounded-2xl text-[10px) font-display font-black uppercase tracking-widest text-slate-400 hover:text-amber-400 hover:border-amber-400/30 hover:bg-amber-400/5 transition-all flex items-center gap-3">
                                        <span className="material-symbols-outlined text-lg animate-spin-slow">cyclone</span>
                                        Vientos de Nuffle
                                    </button>
                                </div>
                            </div>

                            {/* Team Player List Toggler */}
                            <div className="flex gap-10 mt-auto pt-6 border-t border-white/5">
                                <div className="flex-1 space-y-3">
                                    <div className="flex items-center justify-between px-2">
                                        <h4 className="text-[10px] font-display font-black text-sky-500 uppercase tracking-widest">Plantilla Local</h4>
                                        <span className="text-[8px] font-bold text-slate-600 uppercase italic">Activos: {liveHomeTeam.players.filter(p => p.status === 'Activo').length}</span>
                                    </div>
                                    <div className="flex gap-2 overflow-x-auto pb-4 custom-scrollbar">
                                        {liveHomeTeam.players.filter(p => p.status === 'Activo').map(p => (
                                            <div
                                                key={p.id}
                                                onClick={() => { setSelectedPlayerForAction(p); setActiveTeamId('home'); }}
                                                className={`flex-shrink-0 w-14 h-14 rounded-2xl border-2 flex items-center justify-center cursor-pointer transition-all duration-300 transform hover:scale-110 ${selectedPlayerForAction?.id === p.id ? 'bg-sky-500 border-sky-300 shadow-[0_0_20px_rgba(14,165,233,0.4)]' : 'bg-black/60 border-white/10 hover:border-sky-500/50'}`}
                                            >
                                                <span className={`text-base font-display font-black ${selectedPlayerForAction?.id === p.id ? 'text-black' : 'text-slate-400'}`}>{p.id.toString().slice(-2)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex-1 space-y-3">
                                    <div className="flex items-center justify-between px-2 flex-row-reverse">
                                        <h4 className="text-[10px] font-display font-black text-red-500 uppercase tracking-widest text-right">Plantilla Rival</h4>
                                        <span className="text-[8px] font-bold text-slate-600 uppercase italic">Activos: {liveOpponentTeam.players.filter(p => p.status === 'Activo').length}</span>
                                    </div>
                                    <div className="flex flex-row-reverse gap-2 overflow-x-auto pb-4 custom-scrollbar">
                                        {liveOpponentTeam.players.filter(p => p.status === 'Activo').map(p => (
                                            <div
                                                key={p.id}
                                                onClick={() => { setSelectedPlayerForAction(p); setActiveTeamId('opponent'); }}
                                                className={`flex-shrink-0 w-14 h-14 rounded-2xl border-2 flex items-center justify-center cursor-pointer transition-all duration-300 transform hover:scale-110 ${selectedPlayerForAction?.id === p.id ? 'bg-red-600 border-red-400 shadow-[0_0_20px_rgba(220,38,38,0.4)]' : 'bg-black/60 border-white/10 hover:border-red-500/50'}`}
                                            >
                                                <span className={`text-base font-display font-black ${selectedPlayerForAction?.id === p.id ? 'text-white' : 'text-slate-400'}`}>{p.id.toString().slice(-2)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </main>

                        {/* SIDEBAR DERECHA: Bitácora y Crónica */}
                        <aside className="w-96 glass-panel border-white/5 bg-black/40 flex flex-col overflow-hidden relative">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-premium-gold/20 to-transparent"></div>
                            <div className="p-5 border-b border-white/5 flex items-center justify-between bg-black/40">
                                <div className="flex items-center gap-3">
                                    <div className="w-2.5 h-2.5 bg-premium-gold rounded-full animate-pulse shadow-[0_0_12px_rgba(245,159,10,1)]"></div>
                                    <h3 className="text-xs font-display font-black text-white uppercase tracking-[0.3em]">Ecos de la Arena</h3>
                                </div>
                                <button onClick={handleExportLog} className="p-2.5 hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-white/10" title="Codificar Crónica">
                                    <DownloadIcon className="w-4 h-4 text-slate-500 hover:text-premium-gold" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
                                {[...gameLog].map((event, idx) => (
                                    <div key={event.id} className={`group relative p-4 rounded-2xl border transition-all duration-300 ${idx === 0 ? 'bg-premium-gold/10 border-premium-gold/40 shadow-[0_0_20px_rgba(245,159,10,0.1)] animate-fade-in-fast scale-[1.02]' : 'bg-black/40 border-white/5 opacity-50 hover:opacity-100 hover:border-white/20'}`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-[9px] font-display font-black text-slate-500 uppercase tracking-widest">{event.timestamp} <span className="mx-1 opacity-30">•</span> T{event.turn}</span>
                                            <div className={`text-[8px] font-display font-black uppercase px-2 py-0.5 rounded-lg border ${event.type === 'touchdown' ? 'bg-green-500/10 text-green-400 border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.2)]' :
                                                event.type === 'INJURY' || event.type === 'FOUL' ? 'bg-orange-500/10 text-orange-400 border-orange-500/30' :
                                                    event.type === 'TURNOVER' ? 'bg-blood-red/10 text-blood-red border-blood-red/30 shadow-[0_0_10px_rgba(185,28,28,0.2)]' :
                                                        'bg-white/5 text-slate-500 border-white/10'
                                                }`}>
                                                {event.type}
                                            </div>
                                        </div>
                                        <p className="text-xs text-slate-200 mt-2 leading-relaxed font-display font-medium tracking-wide">
                                            {event.description}
                                        </p>
                                        <div className="absolute left-0 top-0 w-1 h-full bg-premium-gold scale-y-0 group-hover:scale-y-100 transition-transform origin-top"></div>
                                    </div>
                                ))}
                                {gameLog.length === 0 && (
                                    <div className="h-full flex flex-col items-center justify-center text-center opacity-10 py-32">
                                        <span className="material-symbols-outlined text-6xl mb-6">history_edu</span>
                                        <p className="text-sm uppercase font-display font-black tracking-[0.5em] italic">La arena esta en silencio</p>
                                    </div>
                                )}
                            </div>

                            {/* Match Narrator Toggler */}
                            <div className="p-5 bg-black/60 border-t border-white/5 space-y-3">
                                <button
                                    onClick={() => setActiveTab(activeTab === 'assistant' ? 'narrator' : 'assistant')}
                                    className="w-full relative group overflow-hidden py-3 rounded-2xl border border-white/10 text-[10px] font-display font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-all shadow-inner"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                    {activeTab === 'assistant' ? 'Invocar Crónica de Nuffle' : 'Regresar a la Batalla'}
                                </button>
                                {activeTab === 'narrator' && (
                                    <div className="fixed inset-0 z-[250] bg-black/98 backdrop-blur-3xl animate-fade-in">
                                        <div className="h-full w-full max-w-6xl mx-auto p-12 flex flex-col">
                                            <div className="flex justify-between items-center mb-16">
                                                <div className="space-y-2">
                                                    <h2 className="text-5xl font-display font-black text-white italic tracking-tighter uppercase">La Crónica de <span className="text-blood-red drop-shadow-[0_0_15px_rgba(185,28,28,0.5)]">Nuffle</span></h2>
                                                    <p className="text-[10px] font-display font-bold text-slate-500 uppercase tracking-[0.5em]">Relato sagrado de la carnicería</p>
                                                </div>
                                                <button
                                                    onClick={() => setActiveTab('assistant')}
                                                    className="w-16 h-16 rounded-3xl bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-all border border-white/10 shadow-2xl group"
                                                >
                                                    <span className="material-symbols-outlined text-3xl group-hover:rotate-90 transition-transform">close</span>
                                                </button>
                                            </div>
                                            <div className="flex-1 overflow-y-auto custom-scrollbar pr-6 pb-20">
                                                <MatchNarrator events={gameLog} homeTeamName={liveHomeTeam.name} awayTeamName={liveOpponentTeam.name} />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </aside>
                    </div>
                );
            case 'post_game': if (!homeTeam || !liveHomeTeam || !liveOpponentTeam) return <div>Cargando...</div>; return <PostGameWizardComponent initialHomeTeam={homeTeam} finalHomeTeam={liveHomeTeam} opponentTeam={liveOpponentTeam} score={score} fame={fame.home} playersMNG={playersMissingNextGame.filter(p => p.teamId === 'home')} onConfirm={handleConfirmPostGame} />;
            default: return <div>Estado de juego desconocido.</div>;
        }
    };

    return (
        <div className="animate-fade-in-slow min-h-screen bg-[#0a0502]/40">
            <div className="p-2 sm:p-4 max-w-[1600px] mx-auto">
                <div className="flex items-center gap-4 mb-8 bg-black/40 backdrop-blur-xl p-4 rounded-3xl border border-white/5 shadow-2xl">
                    <div className="w-12 h-12 bg-premium-gold/10 rounded-2xl flex items-center justify-center border border-premium-gold/20 shadow-[0_0_15px_rgba(202,138,4,0.2)]">
                        <StadiumIcon className="w-7 h-7 text-premium-gold" />
                    </div>
                    <div>
                        <h1 className="text-xl font-display font-black text-white uppercase italic tracking-tighter">Arena <span className="text-premium-gold not-italic ml-1 drop-shadow-[0_0_8px_rgba(202,138,4,0.4)]">Mortal</span></h1>
                        <p className="text-[10px] font-display font-bold text-slate-500 uppercase tracking-[0.3em]">Match Console v2.0</p>
                    </div>
                    <div className="ml-auto flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                            <span className="material-symbols-outlined text-slate-500 text-sm">schedule</span>
                            <span className="text-xs font-display font-bold text-slate-300 uppercase tracking-widest">Tiempo: 48:00</span>
                        </div>
                    </div>
                </div>

                {renderContent()}
            </div>

            {/* Modals */}
            {isPrayersModalOpen && <PrayersModal onClose={() => setIsPrayersModalOpen(false)} />}
            {isWeatherModalOpen && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[200] p-4" onClick={() => setIsWeatherModalOpen(false)}>
                    <div className="glass-panel p-8 max-w-sm w-full text-center border-premium-gold/30 bg-black shadow-[0_0_50px_rgba(0,0,0,1)]" onClick={e => e.stopPropagation()}>
                        <div className="w-20 h-20 bg-premium-gold/10 rounded-full flex items-center justify-center border border-premium-gold/20 mx-auto mb-6">
                            <span className="material-symbols-outlined text-premium-gold text-4xl animate-premium-pulse">cyclone</span>
                        </div>
                        <h3 className="text-2xl font-display font-black text-white uppercase italic tracking-tighter mb-2">Clima de <span className="text-premium-gold">Nuffle</span></h3>
                        <p className="text-slate-400 text-sm mb-8">El destino del campo pende de un hilo. Lanza los dados para invocar las fuerzas de la naturaleza.</p>
                        <button onClick={handleGenerateWeather} className="w-full bg-premium-gold text-black font-display font-black py-4 px-6 rounded-2xl shadow-2xl hover:bg-premium-light transition-all active:scale-95 uppercase tracking-widest italic text-sm">
                            Invocar (2D6)
                        </button>
                    </div>
                </div>
            )}
            {isChangingWeatherModalOpen && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[200] p-4" onClick={() => setIsChangingWeatherModalOpen(false)}>
                    <div className="glass-panel p-8 max-w-sm w-full text-center border-blood-red/30 bg-black shadow-[0_0_50px_rgba(0,0,0,1)]" onClick={e => e.stopPropagation()}>
                        <div className="w-20 h-20 bg-blood-red/10 rounded-full flex items-center justify-center border border-blood-red/20 mx-auto mb-6">
                            <span className="material-symbols-outlined text-blood-red text-4xl animate-pulse">air</span>
                        </div>
                        <h3 className="text-2xl font-display font-black text-white uppercase italic tracking-tighter mb-2">¡Vientos de <span className="text-blood-red">Cambio</span>!</h3>
                        <p className="text-slate-400 text-sm mb-6">El clima está mutando. Introduce el nuevo resultado del destino.</p>
                        <input type="text" pattern="([2-9]|1[0-2])" value={weatherRerollInput} onChange={e => setWeatherRerollInput(e.target.value.replace(/[^0-9]/g, '').slice(0, 2))} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-2xl text-white font-display text-center mb-6 focus:border-premium-gold outline-none transition-all" placeholder="2-12" autoFocus />
                        <button onClick={handleConfirmWeatherReroll} className="w-full bg-blood-red text-white font-display font-black py-4 px-6 rounded-2xl shadow-2xl hover:bg-red-600 transition-all active:scale-95 uppercase tracking-widest italic text-sm">
                            Confirmar Cambio
                        </button>
                    </div>
                </div>
            )}
            {isTdModalOpen && liveHomeTeam && liveOpponentTeam && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[200] p-4" onClick={() => setIsTdModalOpen(false)}>
                    <div className="glass-panel max-w-md w-full border-green-500/30 bg-black shadow-[0_0_50px_rgba(0,0,0,1)] overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="bg-green-500/10 p-6 border-b border-white/5 flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center border border-green-500/30">
                                <TdIcon className="w-8 h-8 text-green-500" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-display font-black text-white uppercase italic tracking-tighter">¡Gloria Inmortal!</h2>
                                <p className="text-[10px] font-display font-bold text-green-500 uppercase tracking-widest">Touchdown Anotado</p>
                            </div>
                        </div>
                        {!tdModalTeam ? (
                            <div className="p-6 space-y-4">
                                <h3 className="text-xs font-display font-black text-slate-500 uppercase tracking-[0.2em] mb-4">¿Quién reclama la gloria?</h3>
                                <button onClick={() => setTdModalTeam('home')} className="w-full group flex items-center gap-4 text-left bg-white/5 p-4 rounded-2xl border border-white/5 hover:border-sky-500/50 hover:bg-sky-500/10 transition-all">
                                    <div className="w-14 h-14 bg-black/40 rounded-xl border border-white/5 p-1">
                                        {liveHomeTeam.crestImage ? <img src={liveHomeTeam.crestImage} alt="Escudo" className="w-full h-full object-cover rounded-lg" /> : <div className="w-full h-full flex items-center justify-center"><ShieldCheckIcon className="w-8 h-8 text-slate-700" /></div>}
                                    </div>
                                    <div className="flex-grow">
                                        <p className="text-xs font-display font-black text-sky-500 uppercase tracking-widest mb-1">Equipo Local</p>
                                        <span className="font-display font-bold text-lg text-white group-hover:text-sky-400 transition-colors">{liveHomeTeam.name}</span>
                                    </div>
                                    <span className="material-symbols-outlined text-slate-700 group-hover:text-sky-500 transition-colors">chevron_right</span>
                                </button>
                                <button onClick={() => setTdModalTeam('opponent')} className="w-full group flex items-center gap-4 text-left bg-white/5 p-4 rounded-2xl border border-white/5 hover:border-red-500/50 hover:bg-red-500/10 transition-all">
                                    <div className="w-14 h-14 bg-black/40 rounded-xl border border-white/5 p-1">
                                        {liveOpponentTeam.crestImage ? <img src={liveOpponentTeam.crestImage} alt="Escudo" className="w-full h-full object-cover rounded-lg" /> : <div className="w-full h-full flex items-center justify-center"><ShieldCheckIcon className="w-8 h-8 text-slate-700" /></div>}
                                    </div>
                                    <div className="flex-grow">
                                        <p className="text-xs font-display font-black text-red-500 uppercase tracking-widest mb-1">Equipo Rival</p>
                                        <span className="font-display font-bold text-lg text-white group-hover:text-red-400 transition-colors">{liveOpponentTeam.name}</span>
                                    </div>
                                    <span className="material-symbols-outlined text-slate-700 group-hover:text-red-500 transition-colors">chevron_right</span>
                                </button>
                            </div>
                        ) : (
                            <div className="p-6 space-y-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-xs font-display font-black text-slate-500 uppercase tracking-[0.2em]">El héroe del momento</h3>
                                    <button onClick={() => setTdModalTeam(null)} className="text-[10px] font-display font-bold text-premium-gold uppercase">&larr; Volver</button>
                                </div>
                                <div className="grid grid-cols-1 gap-2 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                                    {(tdModalTeam === 'home' ? liveHomeTeam : liveOpponentTeam).players.filter(p => p.status === 'Activo').map(p => (
                                        <button key={p.id} onClick={() => handleSelectTdScorer(p)} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-premium-gold/50 hover:bg-premium-gold/5 transition-all group text-left">
                                            <div>
                                                <p className="text-sm font-display font-bold text-white group-hover:text-premium-gold transition-colors">{p.customName}</p>
                                                <p className="text-[10px] font-display font-black text-slate-500 uppercase tracking-widest">{p.position}</p>
                                            </div>
                                            <span className="text-xs font-display font-black text-premium-gold/40 group-hover:text-premium-gold transition-all"># {p.stats.MV}-{p.stats.FU}-{p.stats.AG}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
            {sppModalState.isOpen && liveHomeTeam && liveOpponentTeam && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[250] p-4" onClick={() => setSppModalState({ isOpen: false, type: null, step: 'select_team', teamId: null, selectedPlayer: null })}>
                    <div className="glass-panel max-w-md w-full border-premium-gold/30 bg-black shadow-[0_0_100px_rgba(245,159,10,0.1)] overflow-hidden animate-slide-in-up" onClick={e => e.stopPropagation()}>
                        <div className="bg-premium-gold/10 p-6 border-b border-white/5 flex items-center gap-4">
                            <div className="w-12 h-12 bg-premium-gold/20 rounded-xl flex items-center justify-center border border-premium-gold/30">
                                <span className="material-symbols-outlined text-premium-gold text-2xl">{sppModalState.type === 'pass' ? 'forward' : sppModalState.type === 'interference' ? 'block' : 'personal_injury'}</span>
                            </div>
                            <div>
                                <h2 className="text-2xl font-display font-black text-white uppercase italic tracking-tighter">Mérito de Guerra</h2>
                                <p className="text-[10px] font-display font-bold text-premium-gold uppercase tracking-widest">{sppModalState.type === 'pass' ? 'Pase de Precisión' : sppModalState.type === 'interference' ? 'Interferencia' : 'Baja Causada'}</p>
                            </div>
                        </div>
                        <div className="p-6">
                            {sppModalState.step === 'select_team' && (
                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-display font-black text-slate-500 uppercase tracking-widest mb-4">¿Qué estandarte reclama el honor?</h3>
                                    <button onClick={() => setSppModalState(p => ({ ...p, step: 'select_player', teamId: 'home' }))} className="w-full group flex items-center gap-4 text-left bg-white/5 p-4 rounded-2xl border border-white/5 hover:border-sky-500/50 hover:bg-sky-500/10 transition-all">
                                        <div className="w-12 h-12 bg-black/40 rounded-xl border border-white/5 flex items-center justify-center">
                                            {liveHomeTeam.crestImage ? <img src={liveHomeTeam.crestImage} alt="Escudo" className="w-full h-full object-cover rounded-lg" /> : <ShieldCheckIcon className="w-6 h-6 text-slate-700" />}
                                        </div>
                                        <span className="font-display font-bold text-base text-white group-hover:text-sky-400 transition-colors uppercase italic">{liveHomeTeam.name}</span>
                                    </button>
                                    <button onClick={() => setSppModalState(p => ({ ...p, step: 'select_player', teamId: 'opponent' }))} className="w-full group flex items-center gap-4 text-left bg-white/5 p-4 rounded-2xl border border-white/5 hover:border-red-500/50 hover:bg-red-500/10 transition-all">
                                        <div className="w-12 h-12 bg-black/40 rounded-xl border border-white/5 flex items-center justify-center">
                                            {liveOpponentTeam.crestImage ? <img src={liveOpponentTeam.crestImage} alt="Escudo" className="w-full h-full object-cover rounded-lg" /> : <ShieldCheckIcon className="w-6 h-6 text-slate-700" />}
                                        </div>
                                        <span className="font-display font-bold text-base text-white group-hover:text-red-400 transition-colors uppercase italic">{liveOpponentTeam.name}</span>
                                    </button>
                                </div>
                            )}
                            {sppModalState.step === 'select_player' && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-[10px] font-display font-black text-slate-500 uppercase tracking-widest">Héroe de la jugada</h3>
                                        <button onClick={() => setSppModalState(p => ({ ...p, step: 'select_team' }))} className="text-[9px] font-display font-black text-premium-gold uppercase">&larr; Volver</button>
                                    </div>
                                    <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                                        {(sppModalState.teamId === 'home' ? liveHomeTeam : liveOpponentTeam).players.filter(p => p.status === 'Activo').map(p => (
                                            <button key={p.id} onClick={() => {
                                                if (sppModalState.type === 'interference') setSppModalState(s => ({ ...s, selectedPlayer: p, step: 'interference_type' }));
                                                else updatePlayerSppAndAction(p, sppModalState.teamId!, sppModalState.type === 'pass' ? 1 : 2, sppModalState.type!.toUpperCase() as SppActionType, sppModalState.type!);
                                            }} className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-premium-gold/50 hover:bg-premium-gold/5 transition-all group">
                                                <div className="text-left">
                                                    <p className="text-sm font-display font-bold text-white group-hover:text-premium-gold transition-colors">{p.customName}</p>
                                                    <p className="text-[10px] font-display font-black text-slate-500 uppercase tracking-widest">{p.position}</p>
                                                </div>
                                                <span className="text-xs font-display font-black text-premium-gold/30">#{p.id.toString().slice(-2)}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {sppModalState.step === 'interference_type' && (
                                <div className="space-y-6 text-center">
                                    <h3 className="text-[10px] font-display font-black text-slate-500 uppercase tracking-widest">Magnitud de la Interferencia</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button onClick={() => updatePlayerSppAndAction(sppModalState.selectedPlayer!, sppModalState.teamId!, 2, 'INTERFERENCE', 'interferencia exitosa')} className="bg-green-500/10 border border-green-500/20 p-6 rounded-2xl hover:bg-green-500 hover:text-black transition-all group">
                                            <p className="text-2xl font-display font-black italic mb-1 transition-colors">ÉXITO</p>
                                            <p className="text-[10px] font-display font-bold uppercase tracking-widest opacity-60">2 PE Ganados</p>
                                        </button>
                                        <button onClick={() => updatePlayerSppAndAction(sppModalState.selectedPlayer!, sppModalState.teamId!, 1, 'INTERFERENCE', 'interferencia fallida')} className="bg-blood-red/10 border border-blood-red/20 p-6 rounded-2xl hover:bg-blood-red hover:text-white transition-all group">
                                            <p className="text-2xl font-display font-black italic mb-1 transition-colors">FALLO</p>
                                            <p className="text-[10px] font-display font-bold uppercase tracking-widest opacity-60">1 PE Ganado</p>
                                        </button>
                                    </div>
                                    <button onClick={() => setSppModalState(p => ({ ...p, step: 'select_player' }))} className="text-[9px] font-display font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors">Regresar a selección</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {isCustomEventModalOpen && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[250] p-4" onClick={() => setIsCustomEventModalOpen(false)}>
                    <div className="glass-panel max-w-md w-full border-white/10 bg-black shadow-4xl animate-slide-in-up" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-white/5 bg-white/5">
                            <h2 className="text-xl font-display font-black text-white uppercase italic tracking-tighter">Cronista de Guerra</h2>
                            <p className="text-[9px] font-display font-black text-slate-500 uppercase tracking-widest">Registrar evento personalizado</p>
                        </div>
                        <div className="p-6">
                            <textarea
                                value={customEventDescription}
                                onChange={e => setCustomEventDescription(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-display text-sm focus:border-premium-gold outline-none transition-all placeholder:text-slate-600 italic custom-scrollbar"
                                rows={4}
                                placeholder="Nuffle ha intervenido... describe el caos ocurrido en la arena."
                                autoFocus
                            ></textarea>
                        </div>
                        <div className="p-6 bg-black/40 border-t border-white/5 flex justify-end gap-3">
                            <button onClick={() => setIsCustomEventModalOpen(false)} className="px-6 py-2.5 rounded-xl text-[10px] font-display font-black text-slate-500 uppercase tracking-[0.2em] hover:text-white transition-colors">Descartar</button>
                            <button onClick={() => { logEvent('OTHER', customEventDescription); setIsCustomEventModalOpen(false); setCustomEventDescription(''); }} className="px-8 py-2.5 bg-premium-gold text-black rounded-xl text-[10px] font-display font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all">Sellar Destino</button>
                        </div>
                    </div>
                </div>
            )}
            {selectedStarPlayer && <StarPlayerModal player={selectedStarPlayer} onClose={() => setSelectedStarPlayer(null)} />}
            {viewingPlayer && (
                <PlayerCardModal
                    player={viewingPlayer}
                    isBallCarrier={ballCarrierId === viewingPlayer.id}
                    onBallToggle={() => handleBallToggle(viewingPlayer.id)}
                    onClose={() => setViewingPlayer(null)}
                />
            )}
            {selectedSkillForModal && <SkillModal skill={selectedSkillForModal} onClose={() => setSelectedSkillForModal(null)} />}
            {isFoulModalOpen && (
                <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center z-[300] p-4" onClick={() => { setIsFoulModalOpen(false); setFoulState(initialFoulState); }}>
                    <div className="glass-panel max-w-lg w-full border-blood-red/30 bg-black shadow-[0_0_100px_rgba(185,28,28,0.1)] overflow-hidden animate-slide-in-up" onClick={e => e.stopPropagation()}>
                        <div className="bg-blood-red/10 p-6 border-b border-white/5 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blood-red/20 rounded-xl flex items-center justify-center border border-blood-red/30">
                                    <span className="material-symbols-outlined text-blood-red text-2xl">gavel</span>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-display font-black text-white uppercase italic tracking-tighter">Juicio de Sangre</h2>
                                    <p className="text-[10px] font-display font-bold text-blood-red uppercase tracking-widest">Asistente de Falta</p>
                                </div>
                            </div>
                            <button onClick={() => { setIsFoulModalOpen(false); setFoulState(initialFoulState); }} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-blood-red/20 text-slate-500 hover:text-blood-red transition-all flex items-center justify-center border border-white/5">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-8">
                            {(() => {
                                if (!liveHomeTeam || !liveOpponentTeam) return null;
                                switch (foulState.step) {
                                    case 'select_fouler_team': return (
                                        <div className="space-y-6">
                                            <h3 className="text-xs font-display font-black text-slate-500 uppercase tracking-widest">¿Quién inicia la agresión?</h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                <button onClick={() => setFoulState(prev => ({ ...prev, foulingTeamId: 'home', step: 'select_fouler' }))} className="bg-white/5 border border-white/5 p-6 rounded-3xl hover:border-sky-500/50 hover:bg-sky-500/10 transition-all group">
                                                    <span className="text-xs font-display font-black text-sky-500 uppercase tracking-widest block mb-2 opacity-50">Local</span>
                                                    <p className="text-lg font-display font-black text-white group-hover:text-sky-400 transition-colors uppercase italic">{liveHomeTeam.name}</p>
                                                </button>
                                                <button onClick={() => setFoulState(prev => ({ ...prev, foulingTeamId: 'opponent', step: 'select_fouler' }))} className="bg-white/5 border border-white/5 p-6 rounded-3xl hover:border-red-500/50 hover:bg-red-500/10 transition-all group">
                                                    <span className="text-xs font-display font-black text-red-500 uppercase tracking-widest block mb-1 opacity-50">Rival</span>
                                                    <p className="text-lg font-display font-black text-white group-hover:text-red-400 transition-colors uppercase italic">{liveOpponentTeam.name}</p>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                    case 'select_fouler': {
                                        const team = foulState.foulingTeamId === 'home' ? liveHomeTeam : liveOpponentTeam;
                                        return (
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-xs font-display font-black text-slate-500 uppercase tracking-widest">El Infractor</h3>
                                                    <button onClick={() => setFoulState(prev => ({ ...prev, step: 'select_fouler_team' }))} className="text-[9px] font-display font-bold text-blood-red uppercase tracking-widest">&larr; Volver</button>
                                                </div>
                                                <div className="max-h-[50vh] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                                    {team.players.filter(p => p.status === 'Activo').map(p => <PlayerButton key={p.id} player={p} onSelect={player => setFoulState(prev => ({ ...prev, foulingPlayer: player, step: 'select_victim' }))} />)}
                                                </div>
                                            </div>
                                        );
                                    }
                                    case 'select_victim': {
                                        const team = foulState.foulingTeamId === 'home' ? liveOpponentTeam : liveHomeTeam;
                                        return (
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-xs font-display font-black text-slate-500 uppercase tracking-widest">La Víctima</h3>
                                                    <button onClick={() => setFoulState(prev => ({ ...prev, step: 'select_fouler' }))} className="text-[9px] font-display font-bold text-blood-red uppercase tracking-widest">&larr; Volver</button>
                                                </div>
                                                <div className="max-h-[50vh] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                                    {team.players.map(p => <PlayerButton key={p.id} player={p} onSelect={player => setFoulState(prev => ({ ...prev, victimPlayer: player, step: 'armor_roll' }))} />)}
                                                </div>
                                            </div>
                                        );
                                    }
                                    case 'armor_roll': return <DoubleDiceInputStep title="Tirada de Armadura" value={foulState.armorRollInput} onChange={v => setFoulState(prev => ({ ...prev, armorRollInput: v }))} onNext={() => handleFoulAction('next')} onBack={() => handleFoulAction('back')} label={`2D6 contra AR ${foulState.victimPlayer?.stats.AR}`} onPlaySound={() => playSound('dice')} />;
                                    case 'injury_roll': return <DoubleDiceInputStep title="Tirada de Heridas" value={foulState.injuryRollInput} onChange={v => setFoulState(prev => ({ ...prev, injuryRollInput: v }))} onNext={() => handleFoulAction('next')} onBack={() => handleFoulAction('back')} label="Introduce el golpe final (2D6)" onPlaySound={() => playSound('dice')} />;
                                    case 'casualty_roll': return <RollInputStep title="Tirada de Lesión" value={foulState.casualtyRollInput} onChange={v => setFoulState(prev => ({ ...prev, casualtyRollInput: v }))} onNext={() => handleFoulAction('next')} onBack={() => handleFoulAction('back')} label="Introduce el D16 de la agonía" pattern="([1-9]|1[0-6])" placeholder="1-16" onPlaySound={() => playSound('dice')} />;
                                    case 'lasting_injury_roll': return <RollInputStep title="Lesión Permanente" value={foulState.lastingInjuryRollInput} onChange={v => setFoulState(prev => ({ ...prev, lastingInjuryRollInput: v }))} onNext={() => handleFoulAction('next')} onBack={() => handleFoulAction('back')} label="Introduce D6 del destino" pattern="[1-6]" placeholder="1-6" onPlaySound={() => playSound('dice')} />;
                                    case 'summary': return (
                                        <div className="space-y-8 animate-fade-in text-center">
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-center gap-6">
                                                    <div className="text-center">
                                                        <p className="text-[10px] font-display font-black text-slate-500 uppercase tracking-widest mb-1">Culpable</p>
                                                        <p className="text-lg font-display font-black text-white italic truncate w-32">{foulState.foulingPlayer?.customName}</p>
                                                    </div>
                                                    <span className="material-symbols-outlined text-blood-red text-2xl">swords</span>
                                                    <div className="text-center">
                                                        <p className="text-[10px] font-display font-black text-slate-500 uppercase tracking-widest mb-1">Víctima</p>
                                                        <p className="text-lg font-display font-black text-white italic truncate w-32">{foulState.victimPlayer?.customName}</p>
                                                    </div>
                                                </div>
                                                <div className="glass-panel p-6 bg-black/60 border-white/5 space-y-2 mt-6">
                                                    {foulState.log.map((l, i) => <p key={i} className="text-xs text-slate-400 font-display italic">"{l}"</p>)}
                                                    {foulState.wasExpelled && (
                                                        <div className="mt-4 pt-4 border-t border-white/5">
                                                            <div className="flex items-center justify-center gap-2 text-blood-red">
                                                                <span className="material-symbols-outlined text-xl">person_remove</span>
                                                                <p className="font-display font-black text-sm uppercase tracking-widest">{foulState.expulsionReason || '¡EXPULSADO!'}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <button onClick={() => handleFoulAction('next')} className="w-full bg-blood-red text-white font-display font-black py-4 rounded-2xl shadow-xl hover:bg-red-600 transition-all uppercase tracking-[0.2em] text-xs">Cerrar Crónica</button>
                                        </div>
                                    );
                                    default: return null;
                                }
                            })()}
                        </div>
                    </div>
                </div>
            )}

            {isInjuryModalOpen && (
                <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center z-[300] p-4" onClick={() => { setIsInjuryModalOpen(false); setInjuryState(initialInjuryState); }}>
                    <div className="glass-panel max-w-lg w-full border-premium-gold/30 bg-black shadow-[0_0_100px_rgba(245,159,10,0.1)] overflow-hidden animate-slide-in-up" onClick={e => e.stopPropagation()}>
                        <div className="bg-premium-gold/10 p-6 border-b border-white/5 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-premium-gold/20 rounded-xl flex items-center justify-center border border-premium-gold/30">
                                    <span className="material-symbols-outlined text-premium-gold text-2xl">healing</span>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-display font-black text-white uppercase italic tracking-tighter">Santuario de Heridas</h2>
                                    <p className="text-[10px] font-display font-bold text-premium-gold uppercase tracking-widest">Asistente de Lesión</p>
                                </div>
                            </div>
                            <button onClick={() => { setIsInjuryModalOpen(false); setInjuryState(initialInjuryState); }} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-premium-gold/20 text-slate-500 hover:text-premium-gold transition-all flex items-center justify-center border border-white/5">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-8">
                            {(() => {
                                if (!liveHomeTeam || !liveOpponentTeam) return null;
                                switch (injuryState.step) {
                                    case 'select_victim_team': return (
                                        <div className="space-y-6">
                                            <h3 className="text-xs font-display font-black text-slate-500 uppercase tracking-widest">¿Qué estandarte ha tropezado?</h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                <button onClick={() => setInjuryState(prev => ({ ...prev, victimTeamId: 'home', step: 'select_victim' }))} className="bg-white/5 border border-white/5 p-6 rounded-3xl hover:border-sky-500/50 hover:bg-sky-500/10 transition-all group">
                                                    <span className="text-xs font-display font-black text-sky-500 uppercase tracking-widest block mb-1 opacity-50">Local</span>
                                                    <p className="text-lg font-display font-black text-white group-hover:text-sky-400 transition-colors uppercase italic">{liveHomeTeam.name}</p>
                                                </button>
                                                <button onClick={() => setInjuryState(prev => ({ ...prev, victimTeamId: 'opponent', step: 'select_victim' }))} className="bg-white/5 border border-white/5 p-6 rounded-3xl hover:border-red-500/50 hover:bg-red-500/10 transition-all group">
                                                    <span className="text-xs font-display font-black text-red-500 uppercase tracking-widest block mb-1 opacity-50">Rival</span>
                                                    <p className="text-lg font-display font-black text-white group-hover:text-red-400 transition-colors uppercase italic">{liveOpponentTeam.name}</p>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                    case 'select_victim': {
                                        const team = injuryState.victimTeamId === 'home' ? liveHomeTeam : liveOpponentTeam;
                                        return (
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-xs font-display font-black text-slate-500 uppercase tracking-widest">La Víctima en Suelo</h3>
                                                    <button onClick={() => setInjuryState(prev => ({ ...prev, step: 'select_victim_team' }))} className="text-[9px] font-display font-bold text-premium-gold uppercase tracking-widest">&larr; Volver</button>
                                                </div>
                                                <div className="max-h-[50vh] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                                    {team.players.map(p => <PlayerButton key={p.id} player={p} onSelect={player => setInjuryState(prev => ({ ...prev, victimPlayer: player, isStunty: player.skills.includes('Escurridizo'), hasRegeneration: player.skills.includes('Regeneración'), step: 'armor_roll' }))} />)}
                                                </div>
                                            </div>
                                        );
                                    }
                                    case 'armor_roll': return <DoubleDiceInputStep title="Tirada de Armadura" value={injuryState.armorRollInput} onChange={v => setInjuryState(prev => ({ ...prev, armorRollInput: v }))} onNext={() => handleInjuryAction('next')} onBack={() => handleInjuryAction('back')} label={`2D6 contra AR ${injuryState.victimPlayer?.stats.AR}`} onPlaySound={() => playSound('dice')} />;
                                    case 'injury_roll': return <DoubleDiceInputStep title="Tirada de Heridas" value={injuryState.injuryRollInput} onChange={v => setInjuryState(prev => ({ ...prev, injuryRollInput: v }))} onNext={() => handleInjuryAction('next')} onBack={() => handleInjuryAction('back')} label={`Introduce 2D6${injuryState.isStunty ? ' (Tabla Escurridizo)' : ''}`} onPlaySound={() => playSound('dice')} />;
                                    case 'casualty_roll': return <RollInputStep title="Tirada de Lesión" value={injuryState.casualtyRollInput} onChange={v => setInjuryState(prev => ({ ...prev, casualtyRollInput: v }))} onNext={() => handleInjuryAction('next')} onBack={() => handleInjuryAction('back')} label="Introduce el D16 de la agonía" pattern="([1-9]|1[0-6])" placeholder="1-16" onPlaySound={() => playSound('dice')} />;
                                    case 'lasting_injury_roll': return <RollInputStep title="Lesión Permanente" value={injuryState.lastingInjuryRollInput} onChange={v => setInjuryState(prev => ({ ...prev, lastingInjuryRollInput: v }))} onNext={() => handleInjuryAction('next')} onBack={() => handleInjuryAction('back')} label="Introduce D6 del destino" pattern="[1-6]" placeholder="1-6" onPlaySound={() => playSound('dice')} />;
                                    case 'regeneration_check': return (
                                        <div className="text-center py-6 space-y-6">
                                            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/30 mx-auto animate-premium-pulse">
                                                <span className="material-symbols-outlined text-4xl text-emerald-400">restart_alt</span>
                                            </div>
                                            <div className="space-y-2">
                                                <h3 className="text-xl font-display font-black text-white uppercase italic tracking-tighter">Comprobar Regeneración</h3>
                                                <p className="text-slate-400 text-sm italic">"Los dioses pueden conceder una secondaria oportunidad."</p>
                                            </div>
                                            <button onClick={() => handleInjuryAction('next')} className="w-full bg-emerald-600 text-white font-display font-black py-4 rounded-2xl shadow-xl hover:bg-emerald-500 transition-all uppercase tracking-[0.2em] text-xs">Apelar a los Dioses</button>
                                        </div>
                                    );
                                    case 'regeneration_roll': return <RollInputStep title="Tirada de Regeneración" value={injuryState.regenerationRollInput} onChange={v => setInjuryState(prev => ({ ...prev, regenerationRollInput: v }))} onNext={() => handleInjuryAction('next')} onBack={() => handleInjuryAction('back')} label="Introduce D6 (4+ Éxito)" pattern="[1-6]" placeholder="1-6" onPlaySound={() => playSound('dice')} />;
                                    case 'staff_reroll_choice': {
                                        const victimTeam = injuryState.victimTeamId === 'home' ? liveHomeTeam : liveOpponentTeam;
                                        const staffType = victimTeam?.mortuaryAssistants ? 'Asistente de Necromantes' : 'Médico de la Peste';
                                        return (
                                            <div className="space-y-8 text-center animate-fade-in">
                                                <div className="w-20 h-20 bg-blood-red/10 rounded-full flex items-center justify-center border border-blood-red/30 mx-auto animate-pulse">
                                                    <span className="material-symbols-outlined text-4xl text-blood-red">warning</span>
                                                </div>
                                                <div className="space-y-2">
                                                    <h3 className="text-xl font-display font-black text-white uppercase italic tracking-tighter">¡Regeneración Fallida!</h3>
                                                    <p className="text-slate-400 text-sm">¿Deseas que tu {staffType} intente recomponer los restos? (4+ Éxito)</p>
                                                </div>
                                                <div className="flex gap-4">
                                                    <button onClick={() => {
                                                        const setTeam = injuryState.victimTeamId === 'home' ? setLiveHomeTeam : setLiveOpponentTeam;
                                                        setTeam(prev => prev ? ({ ...prev, mortuaryAssistants: prev.mortuaryAssistants ? prev.mortuaryAssistants - 1 : 0, plagueDoctors: prev.plagueDoctors ? prev.plagueDoctors - 1 : 0 }) : null);
                                                        setInjuryState(prev => ({ ...prev, step: 'regeneration_roll', regenerationRollInput: '' }));
                                                    }} className="flex-1 bg-emerald-600 text-white font-display font-black py-4 rounded-2xl hover:bg-emerald-500 transition-all uppercase tracking-widest text-[10px]">Usar {staffType}</button>
                                                    <button onClick={() => handleInjuryAction('next')} className="flex-1 bg-white/5 border border-white/10 text-slate-500 font-display font-black py-4 rounded-2xl hover:bg-white/10 hover:text-white transition-all uppercase tracking-widest text-[10px]">Dejar Morir</button>
                                                </div>
                                            </div>
                                        );
                                    }
                                    case 'summary': return (
                                        <div className="space-y-8 animate-fade-in text-center">
                                            <div className="space-y-4">
                                                <div className="text-center">
                                                    <p className="text-[10px] font-display font-black text-slate-500 uppercase tracking-widest mb-1">Víctima Registrada</p>
                                                    <p className="text-xl font-display font-black text-white italic truncate uppercase">{injuryState.victimPlayer?.customName}</p>
                                                </div>
                                                <div className="glass-panel p-6 bg-black/60 border-white/5 space-y-2 mt-6">
                                                    {injuryState.log.map((l, i) => <p key={i} className="text-xs text-slate-400 font-display italic">"{l}"</p>)}
                                                </div>
                                            </div>
                                            <button onClick={() => handleInjuryAction('next')} className="w-full bg-premium-gold text-black font-display font-black py-4 rounded-2xl shadow-xl hover:bg-white transition-all uppercase tracking-[0.2em] text-xs">Sellar Parte médico</button>
                                        </div>
                                    );
                                    default: return null;
                                }
                            })()}
                        </div>
                    </div>
                </div>
            )}
            {isTurnoverModalOpen && <TurnoverModal onClose={() => setIsTurnoverModalOpen(false)} onConfirm={handleTurnover} />}
            {isApothecaryModalOpen && injuryState.victimPlayer && <ApothecaryModal player={injuryState.victimPlayer} hasUsedOnKO={(injuryState.victimTeamId === 'home' ? liveHomeTeam?.apothecaryUsedOnKO : liveOpponentTeam?.apothecaryUsedOnKO) || false} onClose={() => { setIsApothecaryModalOpen(false); setInjuryState(prev => ({ ...prev, step: 'regeneration_check' })); }} onPatchUp={() => { setIsApothecaryModalOpen(false); const teamId = injuryState.victimTeamId!; const setTeam = teamId === 'home' ? setLiveHomeTeam : setLiveOpponentTeam; setTeam(prev => prev ? ({ ...prev, apothecaryUsedOnKO: true }) : null); updatePlayerStatus(injuryState.victimPlayer!.id, teamId, 'Activo', 'Recuperado por Boticario'); setInjuryState(prev => ({ ...prev, step: 'summary', log: [...prev.log, 'Boticario lo recupera (KO -> Reservas).'] })); }} onReroll={() => { setIsApothecaryModalOpen(false); const teamId = injuryState.victimTeamId!; const setTeam = teamId === 'home' ? setLiveHomeTeam : setLiveOpponentTeam; const team = teamId === 'home' ? liveHomeTeam : liveOpponentTeam; if (team?.apothecary) { setTeam(prev => prev ? ({ ...prev, apothecary: false }) : null); } else if (team?.wanderingApothecaries && team.wanderingApothecaries > 0) { setTeam(prev => prev ? ({ ...prev, wanderingApothecaries: team.wanderingApothecaries - 1 }) : null); } if (injuryState.casualtyRoll) { setInjuryState(prev => ({ ...prev, step: 'casualty_roll', casualtyRollInput: '', log: [...prev.log, 'Boticario repite tirada de lesión.'], casualtyRoll: { ...prev.casualtyRoll!, rerolled: true } })); } else { setInjuryState(prev => ({ ...prev, step: 'injury_roll', injuryRollInput: { die1: '', die2: '' }, log: [...prev.log, 'Boticario repite tirada de herida.'] })); } }} />}
            <style>{`
                @keyframes fade-in-slow { from { opacity: 0; } to { opacity: 1; } }
                .animate-fade-in-slow { animation: fade-in-slow 0.5s ease-out forwards; }
                @keyframes fade-in-fast { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slide-in-up { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                .animate-fade-in-fast { animation: fade-in-fast 0.2s ease-out forwards; }
                .animate-slide-in-up { animation: slide-in-up 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};
export default GameBoard;
