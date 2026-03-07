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
import PostGameWizard from '../../components/arena/PostGameWizard';
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


declare const Html5Qrcode: any;
declare const XLSX: any;

export interface BlockResolution {
    knockDowns: { id: number; isTurnoverSource: boolean }[];
    ballBecomesLoose: boolean;
}

interface GameBoardProps {
    managedTeams: ManagedTeam[];
    onTeamUpdate: (team: ManagedTeam) => void;
}

type GameState = 'setup' | 'scanning' | 'manual_select' | 'select_team' | 'pre_game' | 'in_progress' | 'post_game' | 'ko_recovery';

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
    const teamRules = teamRoster.specialRules.split(', ').map((r: string) => r.trim());
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
    type SppModalType = 'pass' | 'interference' | 'casualty';
    const [sppModalState, setSppModalState] = useState<{ isOpen: boolean; type: SppModalType | null; step: 'select_team' | 'select_player' | 'interference_type'; teamId: 'home' | 'opponent' | null; selectedPlayer: ManagedPlayer | null; }>({ isOpen: false, type: null, step: 'select_team', teamId: null, selectedPlayer: null });
    const initialFoulState: FoulState = { step: 'select_fouler_team', foulingTeamId: null, foulingPlayer: null, victimPlayer: null, armorRoll: null, injuryRoll: null, casualtyRoll: null, lastingInjuryRoll: null, wasExpelled: false, expulsionReason: '', log: [], armorRollInput: { die1: '', die2: '' }, injuryRollInput: { die1: '', die2: '' }, casualtyRollInput: '', lastingInjuryRollInput: '' };
    const [foulState, setFoulState] = useState<FoulState>(initialFoulState);
    const initialInjuryState: InjuryState = { step: 'select_victim_team', victimTeamId: null, victimPlayer: null, isStunty: false, armorRoll: null, injuryRoll: null, casualtyRoll: null, lastingInjuryRoll: null, log: [], armorRollInput: { die1: '', die2: '' }, injuryRollInput: { die1: '', die2: '' }, casualtyRollInput: '', lastingInjuryRollInput: '', apothecaryAction: null, regenerationRollInput: '', regenerationRoll: null };
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
        if (gameState === 'scanning' && scannerContainerRef.current) {
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
                        setGameState('pre_game');
                        scannerRef.current.stop();
                    } catch (e) { alert(`Error al procesar el código QR: ${e instanceof Error ? e.message : 'Error desconocido.'}`); }
                }, () => { }
            ).catch((err: any) => { console.error("Error al iniciar escáner", err); alert(`Error al iniciar cámara: ${err}.`); setGameState('select_team'); });
        }
        return () => { if (scannerRef.current && scannerRef.current.isScanning) scannerRef.current.stop().catch((e: any) => console.warn("Error al detener escáner.", e)); };
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
            if (homeNeeded === 0 && oppNeeded === 0) { setPreGameStep(1); return; }
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
        }, ...prev]);
    };
    const handleHalftime = () => { setTurn(0); setHalf(2); logEvent('INFO', 'Fin de la primera parte. Comienza la segunda parte.'); setGameStatus(prev => ({ ...prev, kickoffEvent: null })); if (firstHalfReceiver) { const secondHalfReceiver = firstHalfReceiver === 'home' ? 'opponent' : 'home'; setGameStatus(prev => ({ ...prev, receivingTeam: secondHalfReceiver })); logEvent('INFO', `Recibe en la segunda parte ${secondHalfReceiver === 'home' ? homeTeam?.name : opponentTeam?.name}.`); setGameState('pre_game'); setPreGameStep(7); } else { setGameState('pre_game'); setPreGameStep(6); } };
    const handleConfirmJourneymen = () => { if (pendingJourneymen.home.length > 0 && liveHomeTeam) { setLiveHomeTeam(prev => prev ? ({ ...prev, players: [...prev.players, ...pendingJourneymen.home] }) : null); logEvent('INFO', `${liveHomeTeam.name} añade ${pendingJourneymen.home.length} Sustituto(s).`); } if (pendingJourneymen.opponent.length > 0 && liveOpponentTeam) { setLiveOpponentTeam(prev => prev ? ({ ...prev, players: [...prev.players, ...pendingJourneymen.opponent] }) : null); logEvent('INFO', `${liveOpponentTeam.name} añade ${pendingJourneymen.opponent.length} Sustituto(s).`); } setJourneymenNotification(null); setPendingJourneymen({ home: [], opponent: [] }); setPreGameStep(1); };
    const handleSkillClick = useCallback((skillName: string) => { const cleanedName = skillName.split('(')[0].trim(); const foundSkill = skillsData.find(s => s.name.toLowerCase().startsWith(cleanedName.toLowerCase())); if (foundSkill) setSelectedSkillForModal(foundSkill); else console.warn(`Skill not found: ${cleanedName}`); }, []);
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
    const handleConfirmPostGame = (finalTeamState: ManagedTeam) => { if (!homeTeam) return; onTeamUpdate(finalTeamState); setGameState('setup'); setHomeTeam(null); setOpponentTeam(null); setLiveHomeTeam(null); setLiveOpponentTeam(null); setGameLog([]); setScore({ home: 0, opponent: 0 }); setTurn(0); setHalf(1); setFame({ home: 0, opponent: 0 }); setFansRoll({ home: '', opponent: '' }); };
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

    const renderContent = () => {
        switch (gameState) {
            case 'setup': return (
                <div className="text-center p-4 sm:p-8">
                    <h2 className="text-3xl font-bold text-amber-400 mb-4">Configurar Partida</h2>
                    <p className="text-slate-400 mb-8 max-w-lg mx-auto">Selecciona tu equipo y el del oponente para empezar.</p>
                    {managedTeams.length > 0 ? (
                        <button onClick={() => setGameState('select_team')} className="w-full max-w-sm mx-auto bg-amber-500 text-slate-900 font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-500/50 transform hover:scale-105">Seleccionar Equipo Local</button>
                    ) : (
                        <p className="text-yellow-400">Debes crear un equipo en el "Gestor de Equipo" primero.</p>
                    )}
                </div>
            );
            case 'select_team': return (
                <div className="text-center p-4 sm:p-8 max-w-md mx-auto">
                    <h2 className="text-3xl font-bold text-amber-400 mb-4">Elige tu Equipo</h2>
                    <div className="space-y-3">
                        {managedTeams.map(team => (
                            <button key={team.name} onClick={() => { setHomeTeam(team); setGameState(hasCamera ? 'scanning' : 'manual_select'); }} className="w-full flex items-center gap-4 text-left bg-slate-700/50 p-4 rounded-lg shadow-md hover:bg-slate-700 hover:text-white transition-colors">
                                {team.crestImage ? (
                                    <img src={team.crestImage} alt="Escudo" className="w-12 h-12 rounded-full object-cover bg-slate-900" />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0">
                                        <ShieldCheckIcon className="w-8 h-8 text-slate-600" />
                                    </div>
                                )}
                                <div className="flex-grow min-w-0">
                                    <p className="font-semibold truncate">{team.name}</p>
                                    <p className="text-xs text-slate-400 truncate">{team.rosterName}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                    <button onClick={() => setGameState('setup')} className="text-amber-400 hover:underline mt-6 text-sm">&larr; Volver</button>
                </div>
            );
            case 'scanning': return (
                <div className="text-center p-4 sm:p-8">
                    <h2 className="text-3xl font-bold text-amber-400 mb-4">Escanear QR del Oponente</h2>
                    <p className="text-slate-400 mb-6 max-w-lg mx-auto">Usa la cámara para escanear el QR del equipo rival.</p>
                    <div id="qr-reader" ref={scannerContainerRef} className="max-w-sm mx-auto aspect-square bg-slate-900 rounded-lg overflow-hidden border-2 border-slate-700"></div>
                    <button onClick={() => setGameState('manual_select')} className="mt-6 text-amber-400 hover:underline">O selecciona un equipo manualmente</button>
                </div>
            );
            case 'manual_select': return (
                <div className="text-center p-4 sm:p-8 max-w-md mx-auto">
                    <h2 className="text-3xl font-bold text-amber-400 mb-4">Elige al Oponente</h2>
                    <div className="space-y-3">
                        {managedTeams.filter(t => t.name !== homeTeam?.name).map(team => (
                            <button key={team.name} onClick={() => handleManualOpponentSelect(team.name)} className="w-full flex items-center gap-4 text-left bg-slate-700/50 p-4 rounded-lg shadow-md hover:bg-slate-700 hover:text-white transition-colors">
                                {team.crestImage ? (
                                    <img src={team.crestImage} alt="Escudo" className="w-12 h-12 rounded-full object-cover bg-slate-900" />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0">
                                        <ShieldCheckIcon className="w-8 h-8 text-slate-600" />
                                    </div>
                                )}
                                <div className="flex-grow min-w-0">
                                    <p className="font-semibold truncate">{team.name}</p>
                                    <p className="text-xs text-slate-400 truncate">{team.rosterName}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            );
            case 'pre_game': {
                if (!liveHomeTeam || !liveOpponentTeam) return <div>Cargando equipos...</div>;
                if (journeymenNotification) return (
                    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                        <div className="bg-slate-800 p-6 rounded-lg shadow-xl border border-slate-700 max-w-sm w-full text-center">
                            <h3 className="text-lg font-bold text-amber-400 mb-4">Sustitutos Requeridos</h3>
                            <p className="text-slate-300 mb-6 whitespace-pre-wrap">{journeymenNotification}</p>
                            <button onClick={handleConfirmJourneymen} className="bg-amber-500 text-slate-900 font-bold py-2 px-4 rounded">Entendido</button>
                        </div>
                    </div>
                );
                const preGameTitles = ["Paso 1: Contratar Sustitutos", "Paso 2: Incentivos", "Paso 3: Hinchas y FAMA", "Paso 4: El Clima", "Paso 5: Plegarias a Nuffle", "Paso 6: Lanzamiento de Moneda", "Paso 7: Patada o Recepción", "Paso 8: Despliegue", "Paso 9: Evento de Patada Inicial"];
                const handleKickoffRoll = () => {
                    setKickoffActionCompleted(false); // Reset before rolling for a new kickoff
                    const die1 = Math.floor(Math.random() * 6) + 1, die2 = Math.floor(Math.random() * 6) + 1, roll = die1 + die2;
                    const event = kickoffEvents.find(e => e.diceRoll === roll.toString());
                    if (event) {
                        setGameStatus(prev => ({ ...prev, kickoffEvent: event }));
                        logEvent('KICKOFF', `Evento de Patada (${roll}): ${event.title}`);
                        if (event.title !== 'Clima Cambiante' && event.title !== 'Tiempo Muerto') setKickoffActionCompleted(true);
                    }
                };

                return (
                    <div className="bg-slate-900/70 p-4 sm:p-6 rounded-lg border border-slate-700 max-w-6xl mx-auto space-y-6">
                        <h2 className="text-2xl font-bold text-amber-400 text-center">{preGameTitles[preGameStep]}</h2>
                        {preGameStep === 1 && (
                            <div className='text-center space-y-4'>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                                    <p>VE {liveHomeTeam.name}: <span className='font-bold text-sky-400'>{homeTV.toLocaleString()}</span></p>
                                    <p>VE {liveOpponentTeam.name}: <span className='font-bold text-red-400'>{opponentTV.toLocaleString()}</span></p>
                                </div>

                                {prayersAlert && (
                                    <div className="glass-panel border-premium-gold/30 p-4 animate-premium-pulse shadow-[0_0_20px_rgba(202,138,4,0.1)]">
                                        <p className="text-premium-gold font-display font-black italic uppercase tracking-wider text-sm">
                                            ⚠️ Sugerencia de Nuffle: {prayersAlert.underdog} tiene {Math.max(1, Math.floor(prayersAlert.difference / 100000))} Plegaria(s) disponibles por diferencia de TV.
                                        </p>
                                    </div>
                                )}

                                {inducementState.underdog ? (() => {
                                    const underdogTeam = inducementState.underdog === 'home' ? liveHomeTeam : liveOpponentTeam; const baseRoster = teamsData.find(t => t.name === underdogTeam.rosterName); const eligibleStars = starPlayersData.filter(star => isEligibleStar(star, baseRoster)); const bribeCost = baseRoster?.specialRules.includes("Sobornos y corrupción") ? 50000 : 100000;
                                    const isUndead = ["Nigrománticos", "No Muertos", "Khemri", "Vampiros"].includes(underdogTeam.rosterName);
                                    const isNurgle = underdogTeam.rosterName === "Nurgle";
                                    const canHaveApo = baseRoster?.apothecary === "Sí";

                                    const options = [
                                        { name: 'reroll', label: 'Segunda Oportunidad Extra', cost: 100000, count: (underdogTeam.liveRerolls || 0) - underdogTeam.rerolls },
                                        { name: 'bribe', label: 'Soborno', cost: bribeCost, count: underdogTeam.tempBribes || 0 },
                                        { name: 'cheerleader', label: 'Animadora', cost: 10000, count: underdogTeam.tempCheerleaders || 0 },
                                        { name: 'coach', label: 'Ayudante', cost: 10000, count: underdogTeam.tempAssistantCoaches || 0 },
                                        { name: 'biasedRef', label: 'Árbitro Parcial', cost: 50000, count: underdogTeam.biasedRef ? 1 : 0 },
                                    ];

                                    if (canHaveApo) options.push({ name: 'wanderingApothecary', label: 'Boticario Errante', cost: 100000, count: underdogTeam.wanderingApothecaries || 0 });
                                    if (isUndead) options.push({ name: 'mortuaryAssistant', label: 'Asistente de Necromantes', cost: 100000, count: underdogTeam.mortuaryAssistants || 0 });
                                    if (isNurgle) options.push({ name: 'plagueDoctor', label: 'Médico de la Peste', cost: 100000, count: underdogTeam.plagueDoctors || 0 });

                                    return (<div className="space-y-6 text-left"> <p className="text-center">{(inducementState.underdog === 'home' ? liveHomeTeam.name : liveOpponentTeam.name)} es desvalido y recibe <span className='font-bold text-green-400'>{inducementState.money.toLocaleString()} M.O.</span> para incentivos.</p> <div className="bg-slate-800 p-4 rounded-lg"> <h4 className="font-bold text-amber-300 mb-2">Incentivos</h4> <div className="space-y-2 text-sm"> {options.map(item => (<div key={item.name} className="flex justify-between items-center"> <span>{item.label} ({item.cost / 1000}k)</span> <div className="flex items-center gap-2"> <button onClick={() => handleSellInducement(item.name as any, item.cost)} className="bg-rose-600 h-6 w-6 rounded-full font-bold">-</button> <span className="font-mono w-6 text-center">{item.count}</span> <button onClick={() => handleBuyInducement(item.name as any, item.cost)} className="bg-green-600 h-6 w-6 rounded-full font-bold">+</button> </div> </div>))} </div> </div> <div className="bg-slate-800 p-4 rounded-lg"> <h4 className="font-bold text-amber-300 mb-2">Jugadores Estrella</h4> <div className="max-h-60 overflow-y-auto space-y-2 pr-2"> {eligibleStars.map(star => (<div key={star.name} className="flex justify-between items-center text-sm"> <button onClick={() => setSelectedStarPlayer(star)} className="text-sky-400 hover:underline">{star.name} ({star.cost / 1000}k)</button> {inducementState.hiredStars.some(s => s.name === star.name) ? <button onClick={() => handleFireStar(star)} className="bg-rose-600 text-white font-bold py-1 px-2 text-xs rounded">Despedir</button> : <button onClick={() => handleHireStar(star)} disabled={inducementState.money < star.cost} className="bg-green-600 text-white font-bold py-1 px-2 text-xs rounded disabled:bg-slate-600">Contratar</button>} </div>))} </div> </div> <div className="text-center pt-4 border-t border-slate-700"> <button onClick={() => setPreGameStep(2)} className="bg-amber-500 text-slate-900 font-bold py-2 px-6 rounded-md shadow-md hover:bg-amber-400">Confirmar y Continuar</button> </div> </div>)
                                })() : (<> <p className="text-center">¡Equipos igualados! No hay incentivos.</p> <button onClick={() => setPreGameStep(2)} className="bg-amber-500 text-slate-900 font-bold py-2 px-6 rounded-md shadow-md hover:bg-amber-400">Continuar</button> </>)} </div>)}
                        {preGameStep === 2 && (<div className='text-center space-y-4'> <p>Cada entrenador tira 2D6 y suma sus Hinchas. El más alto gana +1 FAMA (+2 si dobla o más).</p> <div className="grid grid-cols-2 gap-4"> <div> <label className='block text-sm font-medium text-slate-300 mb-1'>{liveHomeTeam.name} (Hinchas: {liveHomeTeam.dedicatedFans})</label> <input type="text" pattern="[2-9]|1[0-2]" value={fansRoll.home} onChange={e => setFansRoll(p => ({ ...p, home: e.target.value.replace(/[^0-9]/g, '').slice(0, 2) }))} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-center" placeholder="2D6" /> </div> <div> <label className='block text-sm font-medium text-slate-300 mb-1'>{liveOpponentTeam.name} (Hinchas: {liveOpponentTeam.dedicatedFans})</label> <input type="text" pattern="[2-9]|1[0-2]" value={fansRoll.opponent} onChange={e => setFansRoll(p => ({ ...p, opponent: e.target.value.replace(/[^0-9]/g, '').slice(0, 2) }))} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-center" placeholder="2D6" /> </div> </div> <button onClick={() => { const homeTotal = liveHomeTeam.dedicatedFans + parseInt(fansRoll.home || '0'); const oppTotal = liveOpponentTeam.dedicatedFans + parseInt(fansRoll.opponent || '0'); let homeFame = 0, oppFame = 0; if (homeTotal >= oppTotal * 2) homeFame = 2; else if (homeTotal > oppTotal) homeFame = 1; if (oppTotal >= homeTotal * 2) oppFame = 2; else if (oppTotal > homeTotal) oppFame = 1; setFame({ home: homeFame, opponent: oppFame }); logEvent('INFO', `Tirada Hinchas - ${liveHomeTeam.name}: ${homeTotal}, ${liveOpponentTeam.name}: ${oppTotal}. FAMA: ${homeFame} - ${oppFame}`); setPreGameStep(3); }} className="bg-amber-500 text-slate-900 font-bold py-2 px-6 rounded-md shadow-md hover:bg-amber-400">Calcular FAMA</button> </div>)}
                        {preGameStep === 3 && (<div className='text-center space-y-4'> <p>Tira 2D6 para determinar el clima.</p> <button onClick={() => setIsWeatherModalOpen(true)} className="bg-sky-600 text-white font-bold py-2 px-4 rounded-md shadow-md hover:bg-sky-500">Generar Clima</button> {gameStatus.weather && <div><p>Clima: <span className='font-bold text-white'>{gameStatus.weather.title}</span></p><p className='text-slate-400 text-sm'>{gameStatus.weather.description}</p></div>} {gameStatus.weather && <button onClick={() => setPreGameStep(4)} className="bg-amber-500 text-slate-900 font-bold py-2 px-6 rounded-md shadow-md hover:bg-amber-400">Continuar</button>} </div>)}
                        {preGameStep === 4 && (<div className='text-center space-y-4'> <p>Un equipo con menor VE (tras incentivos) puede tirar en la tabla de Plegarias a Nuffle.</p> <button onClick={() => setIsPrayersModalOpen(true)} className="bg-sky-600 text-white font-bold py-2 px-4 rounded-md shadow-md hover:bg-sky-500">Ver Tabla de Plegarias</button> <button onClick={() => setPreGameStep(5)} className="bg-amber-500 text-slate-900 font-bold py-2 px-6 rounded-md shadow-md hover:bg-amber-400">Continuar</button> </div>)}
                        {preGameStep === 5 && (<div className='text-center space-y-4'> <p>Lanza una moneda para ver quién patea.</p> <div className="flex gap-4 justify-center"> <button onClick={() => { setGameStatus(p => ({ ...p, coinTossWinner: 'home' })); setPreGameStep(6) }} className="bg-sky-600 text-white font-bold py-2 px-4 rounded-md shadow-md hover:bg-sky-500">Gana {liveHomeTeam.name}</button> <button onClick={() => { setGameStatus(p => ({ ...p, coinTossWinner: 'opponent' })); setPreGameStep(6) }} className="bg-red-600 text-white font-bold py-2 px-4 rounded-md shadow-md hover:bg-red-500">Gana {liveOpponentTeam.name}</button> </div> </div>)}
                        {preGameStep === 6 && gameStatus.coinTossWinner && (<div className='text-center space-y-4'> <p><span className='font-bold text-white'>{(gameStatus.coinTossWinner === 'home' ? liveHomeTeam.name : liveOpponentTeam.name)}</span> gana el sorteo. ¿Elige patear o recibir?</p> <div className="flex gap-4 justify-center"> <button onClick={() => { const receiving = gameStatus.coinTossWinner === 'home' ? 'opponent' : 'home'; setGameStatus(p => ({ ...p, receivingTeam: receiving })); setFirstHalfReceiver(receiving); logEvent('INFO', `${(gameStatus.coinTossWinner === 'home' ? liveHomeTeam.name : liveOpponentTeam.name)} elige patear.`); setPreGameStep(7); }} className="bg-gray-600 text-white font-bold py-2 px-4 rounded-md shadow-md hover:bg-gray-500">Patear</button> <button onClick={() => { const receiving = gameStatus.coinTossWinner; setGameStatus(p => ({ ...p, receivingTeam: receiving })); setFirstHalfReceiver(receiving); logEvent('INFO', `${(gameStatus.coinTossWinner === 'home' ? liveHomeTeam.name : liveOpponentTeam.name)} elige recibir.`); setPreGameStep(7); }} className="bg-amber-600 text-white font-bold py-2 px-4 rounded-md shadow-md hover:bg-amber-500">Recibir</button> </div> </div>)}
                        {preGameStep === 7 && (
                            <div className="space-y-4">
                                <p className="text-center text-slate-300">Coloca hasta 11 jugadores en el campo. El resto quedará en el banquillo.</p>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {[liveHomeTeam, liveOpponentTeam].map((team, index) => {
                                        const teamId = index === 0 ? 'home' : 'opponent';
                                        const onField = team.players.filter(p => p.status === 'Activo');
                                        const onBench = team.players.filter(p => p.status === 'Reserva');
                                        return (
                                            <div key={teamId} className="bg-slate-800 p-3 rounded-lg flex flex-col">
                                                <div className="flex items-center gap-3 mb-2">
                                                    {team.crestImage && (
                                                        <img src={team.crestImage} alt="Escudo" className="w-10 h-10 rounded-full object-cover" />
                                                    )}
                                                    <h3 className={`font-bold text-lg ${teamId === 'home' ? 'text-sky-400' : 'text-red-400'}`}>{team.name}</h3>
                                                </div>
                                                <MiniField
                                                    players={onField}
                                                    teamColor={teamId === 'home' ? 'bg-sky-500' : 'bg-red-500'}
                                                    onPlayerMove={(playerId, pos) => handlePlayerMove(teamId, playerId, pos)}
                                                    ballCarrierId={ballCarrierId}
                                                />
                                                <div className="space-y-2 max-h-[30vh] overflow-y-auto pr-2">
                                                    <div>
                                                        <h4 className="font-semibold text-slate-400 text-sm sticky top-0 bg-slate-800 z-10 py-1 -mx-3 px-3">En el Campo ({onField.length}/11)</h4>
                                                        {onField.length > 0 ? onField.map((p, idx) => <PlayerStatusCard key={p.id} player={p} playerNumber={idx + 1} onViewPlayer={setViewingPlayer} onSkillClick={handleSkillClick} canToggleStatus={true} onStatusToggle={() => handlePlayerStatusToggle(p, teamId)} />) : <p className="text-xs text-slate-500">Ningún jugador en el campo.</p>}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-slate-400 text-sm mt-3 sticky top-0 bg-slate-800 z-10 py-1 -mx-3 px-3">Banquillo ({onBench.length})</h4>
                                                        {onBench.length > 0 ? onBench.map(p => <PlayerStatusCard key={p.id} player={p} onViewPlayer={setViewingPlayer} onSkillClick={handleSkillClick} canToggleStatus={true} onStatusToggle={() => handlePlayerStatusToggle(p, teamId)} />) : <p className="text-xs text-slate-500">Banquillo vacío.</p>}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="text-center pt-4 border-t border-slate-700 flex flex-wrap justify-center gap-4">
                                    <button onClick={handleSuggestDeployment} className="bg-teal-600 text-white font-bold py-2 px-6 rounded-md shadow-md hover:bg-teal-500">
                                        Sugerir Despliegue Aleatorio
                                    </button>
                                    <button onClick={() => { const homeOnField = liveHomeTeam.players.filter(p => p.status === 'Activo').length; const oppOnField = liveOpponentTeam.players.filter(p => p.status === 'Activo').length; if (homeOnField === 0 || oppOnField === 0) { alert('Ambos equipos deben tener al menos un jugador en el campo para continuar.'); return; } setPreGameStep(8); }} className="bg-amber-500 text-slate-900 font-bold py-2 px-6 rounded-md shadow-md hover:bg-amber-400">
                                        Confirmar Despliegue
                                    </button>
                                </div>
                            </div>
                        )}
                        {preGameStep === 8 && (
                            <div className='text-center space-y-6'>
                                {!gameStatus.kickoffEvent ? (
                                    <div className="space-y-4">
                                        <p className="text-slate-400 font-display uppercase tracking-widest text-sm text-center">Tirar para Evento de Patada</p>
                                        <div className="flex justify-center">
                                            <DiceRollButton onRoll={handleKickoffRoll} onPlaySound={() => playSound('dice')} />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="glass-panel border-sky-500/30 p-6 animate-slide-in-up">
                                        <p className="text-sky-400 font-display font-black text-xl italic uppercase mb-1">Evento de Patada</p>
                                        <p className="text-white font-bold text-lg mb-2">{gameStatus.kickoffEvent.title}</p>
                                        <p className="text-slate-400 text-sm max-w-md mx-auto">{gameStatus.kickoffEvent.description}</p>
                                    </div>
                                )}
                                {gameStatus.kickoffEvent && kickoffActionCompleted && (
                                    <button onClick={handleStartDrive} className="bg-green-600 text-white font-display font-black italic uppercase tracking-widest py-3 px-10 rounded-xl shadow-[0_0_30px_rgba(22,163,74,0.4)] hover:bg-green-500 transition-premium transform hover:scale-105 active:scale-95">
                                        ¡A JUGAR!
                                    </button>
                                )}
                            </div>
                        )}
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
                    setPreGameStep(7);
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
                if (!liveHomeTeam || !liveOpponentTeam) return <div>Cargando equipos...</div>;

                const homeScorers = liveHomeTeam.players.filter(p => p.sppActions?.TD);
                const oppScorers = liveOpponentTeam.players.filter(p => p.sppActions?.TD);

                const renderPlayerGroup = (title: string, players: ManagedPlayer[], teamId: 'home' | 'opponent') => {
                    if (players.length === 0) return null;
                    const onFieldNumberOffset = teamId === 'home'
                        ? 0
                        : liveHomeTeam.players.filter(p => p.status === 'Activo').length;

                    return (
                        <div className="mt-2">
                            <h4 className="font-bold text-xs uppercase text-slate-500 mb-1 px-2">{title}</h4>
                            <div className="space-y-1">
                                {players.map((p, idx) =>
                                    <PlayerStatusCard
                                        key={p.id}
                                        player={p}
                                        playerNumber={p.status === 'Activo' ? onFieldNumberOffset + idx + 1 : undefined}
                                        onViewPlayer={setViewingPlayer}
                                        onSkillClick={handleSkillClick}
                                    />
                                )}
                            </div>
                        </div>
                    );
                };

                return (
                    <div className="space-y-4">
                        <div className="bg-slate-900/70 p-4 rounded-lg border border-slate-700">
                            <div className="flex justify-around items-center">
                                {/* Home Team */}
                                <div className="flex flex-col items-center gap-2 w-1/3">
                                    {liveHomeTeam.crestImage ? (
                                        <img src={liveHomeTeam.crestImage} alt="Escudo Local" className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover bg-slate-900 border-2 border-sky-500" />
                                    ) : (
                                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0 border-2 border-sky-500">
                                            <ShieldCheckIcon className="w-12 sm:w-16 h-12 sm:h-16 text-slate-600" />
                                        </div>
                                    )}
                                    <h3 className="text-lg sm:text-xl font-bold text-sky-400 truncate text-center">{liveHomeTeam.name}</h3>
                                </div>

                                {/* Score */}
                                <div className="text-center flex-shrink-0">
                                    <div className="text-5xl sm:text-7xl font-black text-white tracking-wider" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.7)' }}>
                                        {score.home} - {score.opponent}
                                    </div>
                                    <div className="font-display font-black text-[10px] uppercase tracking-widest text-amber-500 mt-1">Parte {half} - Turno {turn}</div>
                                    <div className="flex justify-center gap-4 mt-2">
                                        <div className="flex items-center gap-1 bg-sky-900/40 px-2 py-0.5 rounded border border-sky-500/30">
                                            <span className="text-[10px] text-sky-300 font-bold">RR:</span>
                                            <span className="text-sm text-white font-black">{liveHomeTeam.liveRerolls || 0}</span>
                                        </div>
                                        <div className="flex items-center gap-1 bg-red-900/40 px-2 py-0.5 rounded border border-red-500/30">
                                            <span className="text-[10px] text-red-300 font-bold">RR:</span>
                                            <span className="text-sm text-white font-black">{liveOpponentTeam.liveRerolls || 0}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Opponent Team */}
                                <div className="flex flex-col items-center gap-2 w-1/3">
                                    {liveOpponentTeam.crestImage ? (
                                        <img src={liveOpponentTeam.crestImage} alt="Escudo Rival" className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover bg-slate-900 border-2 border-red-500" />
                                    ) : (
                                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0 border-2 border-red-500">
                                            <ShieldCheckIcon className="w-12 sm:w-16 h-12 sm:h-16 text-slate-600" />
                                        </div>
                                    )}
                                    <h3 className="text-lg sm:text-xl font-bold text-red-400 truncate text-center">{liveOpponentTeam.name}</h3>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-xs text-slate-400 mt-2 min-h-[40px]">
                                <div className="text-left pl-4">
                                    {homeScorers.map(p => <p key={p.id} className="truncate">{p.customName} {p.sppActions?.TD && p.sppActions.TD > 1 ? `(x${p.sppActions.TD})` : ''}</p>)}
                                </div>
                                <div className="text-right pr-4">
                                    {oppScorers.map(p => <p key={p.id} className="truncate">{p.customName} {p.sppActions?.TD && p.sppActions.TD > 1 ? `(x${p.sppActions.TD})` : ''}</p>)}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            {gameStatus.weather && (
                                <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                                    <h4 className="font-bold text-amber-300 flex items-center gap-2 mb-1">
                                        {renderWeatherIcon(gameStatus.weather.title)} Clima: {gameStatus.weather.title}
                                    </h4>
                                    <p className="text-slate-400 text-xs">{gameStatus.weather.description}</p>
                                </div>
                            )}
                            {gameStatus.kickoffEvent && (
                                <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                                    <h4 className="font-bold text-amber-300 mb-1">Patada: <span className="text-white">{gameStatus.kickoffEvent.title}</span></h4>
                                    <p className="text-slate-400 text-xs">{gameStatus.kickoffEvent.description}</p>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-slate-900/70 p-3 rounded-lg border border-slate-700 space-y-2">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        {liveHomeTeam.crestImage && (
                                            <img src={liveHomeTeam.crestImage} alt="Escudo" className="w-10 h-10 rounded-full object-cover" />
                                        )}
                                        <h3 className="text-lg font-bold text-sky-400">{liveHomeTeam.name}</h3>
                                    </div>
                                    <div className="text-xs text-slate-400 flex items-center gap-2">RR: <span className="font-bold text-lg text-white">{(liveHomeTeam.liveRerolls || 0)}</span> <button onClick={() => useReroll('home')} disabled={(liveHomeTeam.liveRerolls || 0) === 0} className="bg-sky-800 text-white font-bold h-6 w-6 rounded-full disabled:bg-slate-600 disabled:opacity-50">-</button></div>
                                </div>
                                <div className="max-h-[50vh] overflow-y-auto pr-2">
                                    {renderPlayerGroup(`En el Campo (${liveHomeTeam.players.filter(p => p.status === 'Activo').length}/11)`, liveHomeTeam.players.filter(p => p.status === 'Activo'), 'home')}
                                    {renderPlayerGroup(`Banquillo (${liveHomeTeam.players.filter(p => p.status === 'Reserva').length})`, liveHomeTeam.players.filter(p => p.status === 'Reserva'), 'home')}
                                    {renderPlayerGroup(`Inconscientes (${liveHomeTeam.players.filter(p => p.status === 'KO').length})`, liveHomeTeam.players.filter(p => p.status === 'KO'), 'home')}
                                    {renderPlayerGroup(`Bajas (${liveHomeTeam.players.filter(p => ['Lesionado', 'Expulsado', 'Muerto'].includes(p.status || '')).length})`, liveHomeTeam.players.filter(p => ['Lesionado', 'Expulsado', 'Muerto'].includes(p.status || '')), 'home')}
                                </div>
                            </div>
                            <div className="bg-slate-900/70 p-3 rounded-lg border border-slate-700 space-y-2">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        {liveOpponentTeam.crestImage && (
                                            <img src={liveOpponentTeam.crestImage} alt="Escudo" className="w-10 h-10 rounded-full object-cover" />
                                        )}
                                        <h3 className="text-lg font-bold text-red-400">{liveOpponentTeam.name}</h3>
                                    </div>
                                    <div className="text-xs text-slate-400 flex items-center gap-2">RR: <span className="font-bold text-lg text-white">{(liveOpponentTeam.liveRerolls || 0)}</span> <button onClick={() => useReroll('opponent')} disabled={(liveOpponentTeam.liveRerolls || 0) === 0} className="bg-red-800 text-white font-bold h-6 w-6 rounded-full disabled:bg-slate-600 disabled:opacity-50">-</button></div>
                                </div>
                                <div className="max-h-[50vh] overflow-y-auto pr-2">
                                    {renderPlayerGroup(`En el Campo (${liveOpponentTeam.players.filter(p => p.status === 'Activo').length}/11)`, liveOpponentTeam.players.filter(p => p.status === 'Activo'), 'opponent')}
                                    {renderPlayerGroup(`Banquillo (${liveOpponentTeam.players.filter(p => p.status === 'Reserva').length})`, liveOpponentTeam.players.filter(p => p.status === 'Reserva'), 'opponent')}
                                    {renderPlayerGroup(`Inconscientes (${liveOpponentTeam.players.filter(p => p.status === 'KO').length})`, liveOpponentTeam.players.filter(p => p.status === 'KO'), 'opponent')}
                                    {renderPlayerGroup(`Bajas (${liveOpponentTeam.players.filter(p => ['Lesionado', 'Expulsado', 'Muerto'].includes(p.status || '')).length})`, liveOpponentTeam.players.filter(p => ['Lesionado', 'Expulsado', 'Muerto'].includes(p.status || '')), 'opponent')}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2 mb-4 bg-black/40 p-1 rounded-xl border border-white/5">
                            <button
                                onClick={() => setActiveTab('assistant')}
                                className={`flex-1 py-3 rounded-lg font-display font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'assistant' ? 'bg-premium-gold text-black' : 'text-slate-500 hover:text-white'}`}
                            >
                                Asistente
                            </button>
                            <button
                                onClick={() => setActiveTab('narrator')}
                                className={`flex-1 py-3 rounded-lg font-display font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'narrator' ? 'bg-blood-red text-white' : 'text-slate-500 hover:text-white'}`}
                            >
                                Crónica de Nuffle
                            </button>
                        </div>

                        {activeTab === 'assistant' ? (
                            <>
                                <div className="bg-slate-900/70 p-3 rounded-lg border border-slate-700">
                                    <h3 className="text-lg font-semibold text-amber-400 mb-3">Acciones de Juego</h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                                        <button onClick={() => setIsTdModalOpen(true)} className="bg-green-600/80 text-white font-display font-black p-3 rounded-xl hover:bg-green-500 transition-premium shadow-lg uppercase italic text-[10px] tracking-widest">Anotar TD</button>
                                        <button onClick={() => setIsFoulModalOpen(true)} className="bg-amber-600/80 text-black font-display font-black p-3 rounded-xl hover:bg-amber-500 transition-premium shadow-lg uppercase italic text-[10px] tracking-widest">Falta</button>
                                        <button onClick={() => setIsInjuryModalOpen(true)} className="bg-orange-600/80 text-white font-display font-black p-3 rounded-xl hover:bg-orange-500 transition-premium shadow-lg uppercase italic text-[10px] tracking-widest">Lesión</button>
                                        <button onClick={() => setIsTurnoverModalOpen(true)} className="bg-red-600/80 text-white font-display font-black p-3 rounded-xl hover:bg-red-500 transition-premium shadow-lg uppercase italic text-[10px] tracking-widest">Turnover</button>

                                        <button onClick={() => logEvent('block', 'Acción de bloque declarada.')} className="bg-slate-700 text-white font-display font-black p-3 rounded-xl hover:bg-slate-600 transition-premium shadow-lg uppercase italic text-[10px] tracking-widest">Bloqueo</button>
                                        <button onClick={() => logEvent('move', 'Acción de movimiento declarada.')} className="bg-slate-700 text-white font-display font-black p-3 rounded-xl hover:bg-slate-600 transition-premium shadow-lg uppercase italic text-[10px] tracking-widest">Movimiento</button>
                                        <button onClick={() => logEvent('dodge', 'Intento de esquiva.')} className="bg-slate-700 text-white font-display font-black p-3 rounded-xl hover:bg-slate-600 transition-premium shadow-lg uppercase italic text-[10px] tracking-widest">Esquiva</button>
                                        <button onClick={() => logEvent('pickup_ball', 'Intento de recoger balón.')} className="bg-slate-700 text-white font-display font-black p-3 rounded-xl hover:bg-slate-600 transition-premium shadow-lg uppercase italic text-[10px] tracking-widest">Recoger Balón</button>

                                        <button onClick={() => openSppModal('pass')} className="bg-sky-600/80 text-white font-display font-black p-3 rounded-xl hover:bg-sky-500 transition-premium shadow-lg uppercase italic text-[10px] tracking-widest">Pase (PE)</button>
                                        <button onClick={() => openSppModal('interference')} className="bg-sky-800/80 text-white font-display font-black p-3 rounded-xl hover:bg-sky-700 transition-premium shadow-lg uppercase italic text-[10px] tracking-widest">Interf. (PE)</button>
                                        <button onClick={() => openSppModal('casualty')} className="bg-rose-800/80 text-white font-display font-black p-3 rounded-xl hover:bg-rose-700 transition-premium shadow-lg uppercase italic text-[10px] tracking-widest">Baja Caus. (PE)</button>
                                        <button onClick={handleNextTurn} className="bg-amber-400 text-slate-900 font-display font-black p-3 rounded-xl hover:bg-amber-300 transition-premium shadow-lg uppercase italic text-[10px] tracking-widest">Siguiente Turno</button>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-slate-700 flex flex-wrap gap-2">
                                        <button onClick={() => setIsCustomEventModalOpen(true)} className="text-xs bg-slate-600 text-slate-200 font-semibold py-1 px-3 rounded hover:bg-slate-500">Evento Personalizado</button>
                                        <button onClick={handleExportLog} className="text-xs bg-slate-600 text-slate-200 font-semibold py-1 px-3 rounded hover:bg-slate-500 flex items-center gap-1"><DownloadIcon className="w-4 h-4" /> Exportar Bitácora</button>
                                        <button onClick={() => setGameState('post_game')} className="text-xs bg-red-800 text-red-200 font-semibold py-1 px-3 rounded hover:bg-red-700 ml-auto">Finalizar Partido</button>
                                    </div>
                                </div>

                                <div className="bg-slate-900/70 p-3 rounded-lg border border-slate-700">
                                    <button onClick={() => setIsLogVisible(!isLogVisible)} className="w-full text-left flex justify-between items-center group">
                                        <h3 className="text-lg font-semibold text-amber-400">
                                            Bitácora del Partido
                                        </h3>
                                        <ChevronDownIcon className={`w-5 h-5 text-amber-400 transform transition-transform duration-200 group-hover:text-amber-300 ${isLogVisible ? 'rotate-180' : ''}`} />
                                    </button>
                                    {isLogVisible && (
                                        <div className="mt-3 max-h-60 overflow-y-auto space-y-2 text-sm pr-2 animate-fade-in-fast">
                                            {gameLog.map(event => (
                                                <div key={event.id} className="border-b border-slate-800 pb-1 last:border-b-0">
                                                    <p>
                                                        <span className="text-slate-500 mr-2 font-mono text-xs">
                                                            [{event.half}-{event.turn} | {event.timestamp}]
                                                        </span>
                                                        <span className={`font-semibold ${event.type === 'TURNOVER' ? 'text-red-400' :
                                                            event.type === 'TOUCHDOWN' ? 'text-green-400' :
                                                                event.type === 'INJURY' || event.type === 'FOUL' ? 'text-orange-400' :
                                                                    'text-slate-400'
                                                            }`}>
                                                            {event.type !== 'INFO' && `${event.type}: `}
                                                        </span>
                                                        <span className="text-slate-300">{event.description}</span>
                                                    </p>
                                                </div>
                                            ))}
                                            {gameLog.length === 0 && <p className="text-slate-500">No hay eventos registrados.</p>}
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <MatchNarrator events={gameLog} homeTeamName={liveHomeTeam.name} awayTeamName={liveOpponentTeam.name} />
                        )}
                    </div>
                );
            case 'post_game': if (!homeTeam || !liveHomeTeam || !liveOpponentTeam) return <div>Cargando...</div>; return <PostGameWizard initialHomeTeam={homeTeam} finalHomeTeam={liveHomeTeam} opponentTeam={liveOpponentTeam} score={score} fame={fame.home} playersMNG={playersMissingNextGame.filter(p => p.teamId === 'home')} onConfirm={handleConfirmPostGame} />;
            default: return <div>Estado de juego desconocido.</div>;
        }
    };

    return (<div className="animate-fade-in-slow"> <div className="p-2 sm:p-4">{renderContent()}</div> {/* Modals */} {isPrayersModalOpen && <PrayersModal onClose={() => setIsPrayersModalOpen(false)} />} {isWeatherModalOpen && (<div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => setIsWeatherModalOpen(false)}> <div className="bg-slate-800 p-6 rounded-lg shadow-xl border border-slate-700 max-w-sm w-full text-center" onClick={e => e.stopPropagation()}> <h3 className="text-lg font-bold text-amber-400 mb-4">Generar Clima</h3> <p className="text-slate-300 mb-6">Tira 2D6 para determinar el clima.</p> <button onClick={handleGenerateWeather} className="bg-amber-500 text-slate-900 font-bold py-2 px-6 rounded-md shadow-md hover:bg-amber-400">Tirar 2D6</button> </div> </div>)} {isChangingWeatherModalOpen && (<div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => setIsChangingWeatherModalOpen(false)}> <div className="bg-slate-800 p-6 rounded-lg shadow-xl border border-slate-700 max-w-sm w-full text-center" onClick={e => e.stopPropagation()}> <h3 className="text-lg font-bold text-amber-400 mb-4">¡Clima Cambiante!</h3> <p className="text-slate-300 mb-4">Haz una nueva tirada en la Tabla de Clima (2D6) e introduce el resultado.</p> <input type="text" pattern="([2-9]|1[0-2])" value={weatherRerollInput} onChange={e => setWeatherRerollInput(e.target.value.replace(/[^0-9]/g, '').slice(0, 2))} className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white mb-4 text-center" placeholder="Resultado 2D6 (2-12)" autoFocus /> <button onClick={handleConfirmWeatherReroll} className="bg-amber-500 text-slate-900 font-bold py-2 px-6 rounded-md shadow-md hover:bg-amber-400">Confirmar Clima</button> </div> </div>)} {isTdModalOpen && liveHomeTeam && liveOpponentTeam && (<div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => setIsTdModalOpen(false)}> <div className="bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-w-md w-full" onClick={e => e.stopPropagation()}> <h2 className="text-xl font-bold text-amber-400 p-4 border-b border-slate-700">Anotar Touchdown</h2> {!tdModalTeam ? (<div className="p-5 space-y-3"><h3 className="text-lg text-slate-300 mb-4">¿Qué equipo ha anotado?</h3>
        <button onClick={() => setTdModalTeam('home')} className="w-full flex items-center gap-4 text-left bg-slate-700/50 p-4 rounded-md hover:bg-slate-700 font-semibold text-lg transition-colors">
            {liveHomeTeam.crestImage ? <img src={liveHomeTeam.crestImage} alt="Escudo" className="w-12 h-12 rounded-full" /> : <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0"><ShieldCheckIcon className="w-8 h-8 text-slate-600" /></div>}
            <span>{liveHomeTeam.name}</span>
        </button>
        <button onClick={() => setTdModalTeam('opponent')} className="w-full flex items-center gap-4 text-left bg-slate-700/50 p-4 rounded-md hover:bg-slate-700 font-semibold text-lg transition-colors">
            {liveOpponentTeam.crestImage ? <img src={liveOpponentTeam.crestImage} alt="Escudo" className="w-12 h-12 rounded-full" /> : <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0"><ShieldCheckIcon className="w-8 h-8 text-slate-600" /></div>}
            <span>{liveOpponentTeam.name}</span>
        </button>
    </div>) : (<div className="p-5 space-y-2 max-h-[60vh] overflow-y-auto"><h3 className="text-lg text-slate-300 mb-4">¿Qué jugador ha anotado?</h3> {(tdModalTeam === 'home' ? liveHomeTeam : liveOpponentTeam).players.filter(p => p.status === 'Activo').map(p => <PlayerButton key={p.id} player={p} onSelect={handleSelectTdScorer} />)} </div>)} </div> </div>)} {sppModalState.isOpen && liveHomeTeam && liveOpponentTeam && (<div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => setSppModalState({ isOpen: false, type: null, step: 'select_team', teamId: null, selectedPlayer: null })}> <div className="bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-w-md w-full" onClick={e => e.stopPropagation()}> <h2 className="text-xl font-bold text-amber-400 p-4 border-b border-slate-700">Añadir PE por {sppModalState.type === 'pass' ? 'Pase' : sppModalState.type === 'interference' ? 'Interferencia' : 'Lesión'}</h2> <div className="p-5"> {sppModalState.step === 'select_team' && <div className="space-y-3"><h3 className="text-lg text-slate-300 mb-4">¿De qué equipo es el jugador?</h3> <button onClick={() => setSppModalState(p => ({ ...p, step: 'select_player', teamId: 'home' }))} className="w-full bg-slate-700/50 p-4 rounded-md hover:bg-slate-700 font-semibold">{liveHomeTeam.name}</button> <button onClick={() => setSppModalState(p => ({ ...p, step: 'select_player', teamId: 'opponent' }))} className="w-full bg-slate-700/50 p-4 rounded-md hover:bg-slate-700 font-semibold">{liveOpponentTeam.name}</button> </div>} {sppModalState.step === 'select_player' && <div className="space-y-2 max-h-[60vh] overflow-y-auto"><h3 className="text-lg text-slate-300 mb-4">¿Qué jugador?</h3> {(sppModalState.teamId === 'home' ? liveHomeTeam : liveOpponentTeam).players.filter(p => p.status === 'Activo').map(p => <PlayerButton key={p.id} player={p} onSelect={pl => { if (sppModalState.type === 'interference') { setSppModalState(s => ({ ...s, selectedPlayer: pl, step: 'interference_type' })); } else { updatePlayerSppAndAction(pl, sppModalState.teamId!, sppModalState.type === 'pass' ? 1 : 2, sppModalState.type!.toUpperCase() as SppActionType, sppModalState.type!); } }} />)} </div>} {sppModalState.step === 'interference_type' && <div className="space-y-3"><h3 className="text-lg text-slate-300 mb-4">¿La interferencia fue exitosa?</h3> <button onClick={() => updatePlayerSppAndAction(sppModalState.selectedPlayer!, sppModalState.teamId!, 2, 'INTERFERENCE', 'interferencia exitosa')} className="w-full bg-green-600 p-4 rounded-md hover:bg-green-500 font-semibold">Sí, exitosa (2 PE)</button> <button onClick={() => updatePlayerSppAndAction(sppModalState.selectedPlayer!, sppModalState.teamId!, 1, 'INTERFERENCE', 'interferencia fallida')} className="w-full bg-rose-600 p-4 rounded-md hover:bg-rose-500 font-semibold">No, fallida (1 PE)</button> </div>} </div> </div> </div>)} {isCustomEventModalOpen && (<div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => setIsCustomEventModalOpen(false)}> <div className="bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-w-md w-full" onClick={e => e.stopPropagation()}> <h2 className="text-xl font-bold text-amber-400 p-4 border-b border-slate-700">Registrar Evento Personalizado</h2> <div className="p-5"> <textarea value={customEventDescription} onChange={e => setCustomEventDescription(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white" rows={3} placeholder="Describe el evento..."></textarea> </div> <div className="p-4 bg-slate-900/50 border-t border-slate-700 flex justify-end"> <button onClick={() => { logEvent('OTHER', customEventDescription); setIsCustomEventModalOpen(false); setCustomEventDescription(''); }} className="bg-amber-500 text-slate-900 font-bold py-2 px-6 rounded-md">Guardar</button> </div> </div> </div>)}                 {selectedStarPlayer && <StarPlayerModal player={selectedStarPlayer} onClose={() => setSelectedStarPlayer(null)} />}
        {viewingPlayer && (
            <PlayerCardModal
                player={viewingPlayer}
                isBallCarrier={ballCarrierId === viewingPlayer.id}
                onBallToggle={() => handleBallToggle(viewingPlayer.id)}
                onClose={() => setViewingPlayer(null)}
            />
        )}
        {selectedSkillForModal && <SkillModal skill={selectedSkillForModal} onClose={() => setSelectedSkillForModal(null)} />} {isFoulModalOpen && (<div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => { setIsFoulModalOpen(false); setFoulState(initialFoulState); }}> <div className="bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-w-md w-full" onClick={e => e.stopPropagation()}> <div className="p-4 border-b border-slate-700 flex justify-between items-center"><h2 className="text-xl font-bold text-amber-400">Asistente de Falta</h2> <button onClick={() => { setIsFoulModalOpen(false); setFoulState(initialFoulState); }} className="text-slate-400 hover:text-white">&times;</button></div> <div className="p-5">{(() => {
            if (!liveHomeTeam || !liveOpponentTeam) return null; switch (foulState.step) {
                case 'select_fouler_team': return <><h3 className="text-lg text-slate-300 mb-4">Paso 1: ¿Qué equipo comete la falta?</h3><div className="space-y-3"><button onClick={() => setFoulState(prev => ({ ...prev, foulingTeamId: 'home', step: 'select_fouler' }))} className="w-full bg-slate-700/50 p-4 rounded-md hover:bg-slate-700 font-semibold">{liveHomeTeam.name}</button><button onClick={() => setFoulState(prev => ({ ...prev, foulingTeamId: 'opponent', step: 'select_fouler' }))} className="w-full bg-slate-700/50 p-4 rounded-md hover:bg-slate-700 font-semibold">{liveOpponentTeam.name}</button></div></>; case 'select_fouler': { const team = foulState.foulingTeamId === 'home' ? liveHomeTeam : liveOpponentTeam; return <><h3 className="text-lg text-slate-300 mb-4">Paso 2: ¿Qué jugador comete la falta?</h3><div className="max-h-[60vh] overflow-y-auto space-y-2">{team.players.filter(p => p.status === 'Activo').map(p => <PlayerButton key={p.id} player={p} onSelect={player => setFoulState(prev => ({ ...prev, foulingPlayer: player, step: 'select_victim' }))} />)}</div></>; } case 'select_victim': { const team = foulState.foulingTeamId === 'home' ? liveOpponentTeam : liveHomeTeam; return <><h3 className="text-lg text-slate-300 mb-4">Paso 3: ¿Quién es la víctima?</h3><div className="max-h-[60vh] overflow-y-auto space-y-2">{team.players.map(p => <PlayerButton key={p.id} player={p} onSelect={player => setFoulState(prev => ({ ...prev, victimPlayer: player, step: 'armor_roll' }))} />)}</div></>; } case 'armor_roll': return <DoubleDiceInputStep title="Paso 4: Tirada de Armadura" value={foulState.armorRollInput} onChange={v => setFoulState(prev => ({ ...prev, armorRollInput: v }))} onNext={() => handleFoulAction('next')} onBack={() => handleFoulAction('back')} label={`Introduce 2D6 contra AR ${foulState.victimPlayer?.stats.AR}`} onPlaySound={() => playSound('dice')} />; case 'injury_roll': return <DoubleDiceInputStep title="Paso 5: Tirada de Heridas" value={foulState.injuryRollInput} onChange={v => setFoulState(prev => ({ ...prev, injuryRollInput: v }))} onNext={() => handleFoulAction('next')} onBack={() => handleFoulAction('back')} label="Introduce 2D6 para la herida" onPlaySound={() => playSound('dice')} />; case 'casualty_roll': return <RollInputStep title="Paso 6: Tirada de Lesión" value={foulState.casualtyRollInput} onChange={v => setFoulState(prev => ({ ...prev, casualtyRollInput: v }))} onNext={() => handleFoulAction('next')} onBack={() => handleFoulAction('back')} label="Introduce D16" pattern="([1-9]|1[0-6])" placeholder="1-16" onPlaySound={() => playSound('dice')} />; case 'lasting_injury_roll': return <RollInputStep title="Paso 7: Lesión Permanente" value={foulState.lastingInjuryRollInput} onChange={v => setFoulState(prev => ({ ...prev, lastingInjuryRollInput: v }))} onNext={() => handleFoulAction('next')} onBack={() => handleFoulAction('back')} label="Introduce D6" pattern="[1-6]" placeholder="1-6" onPlaySound={() => playSound('dice')} />;
                case 'summary': return <><div className="space-y-2 text-sm"><p><span className="font-semibold text-slate-300">Infractor:</span> {foulState.foulingPlayer?.customName}</p><p><span className="font-semibold text-slate-300">Víctima:</span> {foulState.victimPlayer?.customName}</p><ul className="list-disc list-inside text-slate-400">{foulState.log.map((l, i) => <li key={i}>{l}</li>)}</ul>{foulState.wasExpelled && <p className="font-bold text-red-500 mt-2">{foulState.expulsionReason || `¡${foulState.foulingPlayer?.customName} expulsado!`}</p>}</div><div className="pt-4 mt-4 border-t border-slate-700 flex justify-end"><button onClick={() => handleFoulAction('next')} className="bg-amber-500 text-slate-900 font-bold py-2 px-6 rounded-md">Finalizar</button></div></>; default: return null;
            }
        })()}</div> </div> </div>)} {isInjuryModalOpen && (<div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => { setIsInjuryModalOpen(false); setInjuryState(initialInjuryState); }}> <div className="bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-w-md w-full" onClick={e => e.stopPropagation()}> <div className="p-4 border-b border-slate-700 flex justify-between items-center"><h2 className="text-xl font-bold text-amber-400">Asistente de Lesión</h2> <button onClick={() => { setIsInjuryModalOpen(false); setInjuryState(initialInjuryState); }} className="text-slate-400 hover:text-white">&times;</button></div> <div className="p-5">{(() => {
            if (!liveHomeTeam || !liveOpponentTeam) return null; switch (injuryState.step) {
                case 'select_victim_team': return <><h3 className="text-lg text-slate-300 mb-4">Paso 1: ¿Qué equipo sufre la lesión?</h3><div className="space-y-3"><button onClick={() => setInjuryState(prev => ({ ...prev, victimTeamId: 'home', step: 'select_victim' }))} className="w-full bg-slate-700/50 p-4 rounded-md hover:bg-slate-700 font-semibold">{liveHomeTeam.name}</button><button onClick={() => setInjuryState(prev => ({ ...prev, victimTeamId: 'opponent', step: 'select_victim' }))} className="w-full bg-slate-700/50 p-4 rounded-md hover:bg-slate-700 font-semibold">{liveOpponentTeam.name}</button></div></>; case 'select_victim': { const team = injuryState.victimTeamId === 'home' ? liveHomeTeam : liveOpponentTeam; return <><h3 className="text-lg text-slate-300 mb-4">Paso 2: ¿Quién es la víctima?</h3><div className="max-h-[60vh] overflow-y-auto space-y-2">{team.players.map(p => <PlayerButton key={p.id} player={p} onSelect={player => setInjuryState(prev => ({ ...prev, victimPlayer: player, isStunty: player.skills.includes('Escurridizo'), hasRegeneration: player.skills.includes('Regeneración'), step: 'armor_roll' }))} />)}</div></>; } case 'armor_roll': return <DoubleDiceInputStep title="Paso 3: Tirada de Armadura" value={injuryState.armorRollInput} onChange={v => setInjuryState(prev => ({ ...prev, armorRollInput: v }))} onNext={() => handleInjuryAction('next')} onBack={() => handleInjuryAction('back')} label={`Introduce 2D6 contra AR ${injuryState.victimPlayer?.stats.AR}`} onPlaySound={() => playSound('dice')} />; case 'injury_roll': return <DoubleDiceInputStep title="Paso 4: Tirada de Heridas" value={injuryState.injuryRollInput} onChange={v => setInjuryState(prev => ({ ...prev, injuryRollInput: v }))} onNext={() => handleInjuryAction('next')} onBack={() => handleInjuryAction('back')} label={`Introduce 2D6 para la herida${injuryState.isStunty ? ' (Tabla Escurridizo)' : ''}`} onPlaySound={() => playSound('dice')} />; case 'casualty_roll': return <RollInputStep title="Paso 5: Tirada de Lesión" value={injuryState.casualtyRollInput} onChange={v => setInjuryState(prev => ({ ...prev, casualtyRollInput: v }))} onNext={() => handleInjuryAction('next')} onBack={() => handleInjuryAction('back')} label="Introduce D16" pattern="([1-9]|1[0-6])" placeholder="1-16" onPlaySound={() => playSound('dice')} />;
                case 'lasting_injury_roll': return <RollInputStep title="Paso 6: Lesión Permanente" value={injuryState.lastingInjuryRollInput} onChange={v => setInjuryState(prev => ({ ...prev, lastingInjuryRollInput: v }))} onNext={() => handleInjuryAction('next')} onBack={() => handleInjuryAction('back')} label="Introduce D6" pattern="[1-6]" placeholder="1-6" onPlaySound={() => playSound('dice')} />;
                case 'regeneration_check': return <div className="text-center py-4"><h3 className="text-lg text-slate-300 mb-4">Comprobando Regeneración...</h3><button onClick={() => handleInjuryAction('next')} className="bg-amber-500 text-slate-900 font-bold py-2 px-6 rounded-md shadow-md hover:bg-amber-400">Continuar</button></div>;
                case 'regeneration_roll': return <RollInputStep title="Tirada de Regeneración" value={injuryState.regenerationRollInput} onChange={v => setInjuryState(prev => ({ ...prev, regenerationRollInput: v }))} onNext={() => handleInjuryAction('next')} onBack={() => handleInjuryAction('back')} label="Introduce D6 (4+ Éxito)" pattern="[1-6]" placeholder="1-6" onPlaySound={() => playSound('dice')} />;
                case 'staff_reroll_choice': {
                    const victimTeam = injuryState.victimTeamId === 'home' ? liveHomeTeam : liveOpponentTeam;
                    const staffType = victimTeam?.mortuaryAssistants ? 'Asistente de Necromantes' : 'Médico de la Peste';
                    const handleReroll = () => {
                        const setTeam = injuryState.victimTeamId === 'home' ? setLiveHomeTeam : setLiveOpponentTeam;
                        setTeam(prev => prev ? ({
                            ...prev,
                            mortuaryAssistants: prev.mortuaryAssistants ? prev.mortuaryAssistants - 1 : 0,
                            plagueDoctors: prev.plagueDoctors ? prev.plagueDoctors - 1 : 0
                        }) : null);
                        setInjuryState(prev => ({ ...prev, step: 'regeneration_roll', regenerationRollInput: '' }));
                    };
                    return (
                        <div className="space-y-4 text-center">
                            <h3 className="text-lg text-amber-400 font-bold italic uppercase">¡Regeneración Fallida!</h3>
                            <p className="text-slate-300">¿Quieres usar tu <span className="text-white font-bold">{staffType}</span> para intentar salvar al jugador? (4+ Éxito)</p>
                            <div className="flex gap-4 justify-center">
                                <button onClick={handleReroll} className="bg-emerald-600 text-white font-bold py-2 px-6 rounded-md hover:bg-emerald-500 transition-colors uppercase italic text-sm">Usar {staffType}</button>
                                <button onClick={() => handleInjuryAction('next')} className="bg-slate-700 text-slate-300 font-bold py-2 px-6 rounded-md hover:bg-slate-600 transition-colors uppercase italic text-sm">No utilizar</button>
                            </div>
                        </div>
                    );
                }
                case 'summary': return <><div className="space-y-2 text-sm"><p><span className="font-semibold text-slate-300">Víctima:</span> {injuryState.victimPlayer?.customName}</p><ul className="list-disc list-inside text-slate-400">{injuryState.log.map((l, i) => <li key={i}>{l}</li>)}</ul></div><div className="pt-4 mt-4 border-t border-slate-700 flex justify-end"><button onClick={() => handleInjuryAction('next')} className="bg-amber-500 text-slate-900 font-bold py-2 px-6 rounded-md">Finalizar</button></div></>; default: return null;
            }
        })()}</div> </div> </div>)}
        {isTurnoverModalOpen && <TurnoverModal onClose={() => setIsTurnoverModalOpen(false)} onConfirm={handleTurnover} />} {isApothecaryModalOpen && injuryState.victimPlayer && <ApothecaryModal player={injuryState.victimPlayer} hasUsedOnKO={(injuryState.victimTeamId === 'home' ? liveHomeTeam?.apothecaryUsedOnKO : liveOpponentTeam?.apothecaryUsedOnKO) || false} onClose={() => { setIsApothecaryModalOpen(false); setInjuryState(prev => ({ ...prev, step: 'regeneration_check' })); }} onPatchUp={() => { setIsApothecaryModalOpen(false); const teamId = injuryState.victimTeamId!; const setTeam = teamId === 'home' ? setLiveHomeTeam : setLiveOpponentTeam; setTeam(prev => prev ? ({ ...prev, apothecaryUsedOnKO: true }) : null); updatePlayerStatus(injuryState.victimPlayer!.id, teamId, 'Activo', 'Recuperado por Boticario'); setInjuryState(prev => ({ ...prev, step: 'summary', log: [...prev.log, 'Boticario lo recupera (KO -> Reservas).'] })); }} onReroll={() => { setIsApothecaryModalOpen(false); const teamId = injuryState.victimTeamId!; const setTeam = teamId === 'home' ? setLiveHomeTeam : setLiveOpponentTeam; const team = teamId === 'home' ? liveHomeTeam : liveOpponentTeam; if (team?.apothecary) { setTeam(prev => prev ? ({ ...prev, apothecary: false }) : null); } else if (team?.wanderingApothecaries && team.wanderingApothecaries > 0) { setTeam(prev => prev ? ({ ...prev, wanderingApothecaries: team.wanderingApothecaries - 1 }) : null); } if (injuryState.casualtyRoll) { setInjuryState(prev => ({ ...prev, step: 'casualty_roll', casualtyRollInput: '', log: [...prev.log, 'Boticario repite tirada de lesión.'], casualtyRoll: { ...prev.casualtyRoll!, rerolled: true } })); } else { setInjuryState(prev => ({ ...prev, step: 'injury_roll', injuryRollInput: { die1: '', die2: '' }, log: [...prev.log, 'Boticario repite tirada de herida.'] })); } }} />} <style>{` @keyframes fade-in-slow { from { opacity: 0; } to { opacity: 1; } } .animate-fade-in-slow { animation: fade-in-slow 0.5s ease-out forwards; } @keyframes fade-in-fast { from { opacity: 0; } to { opacity: 1; } } @keyframes slide-in-up { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } } .animate-fade-in-fast { animation: fade-in-fast 0.2s ease-out forwards; } .animate-slide-in-up { animation: slide-in-up 0.3s ease-out forwards; } `}</style> </div>);
};

export default GameBoard;