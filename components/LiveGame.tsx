import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { ManagedTeam, GameEvent, GameEventType, ManagedPlayer, WeatherCondition, KickoffEvent, PlayerStatus, StarPlayer, SppActionType, Team, Skill } from '../types';
import { weatherConditions } from '../data/weather';
import { kickoffEvents } from '../data/kickoffEvents';
import { teamsData } from '../data/teams';
import { starPlayersData } from '../data/starPlayers';
import { casualtyResults } from '../data/casualties';
import { lastingInjuryResults } from '../data/lastingInjuries';
import { generateRandomName } from '../data/randomNames';
import SunIcon from './icons/SunIcon';
import CloudRainIcon from './icons/CloudRainIcon';
import SnowflakeIcon from './icons/SnowflakeIcon';
import FireIcon from './icons/FireIcon';
import CloudIcon from './icons/CloudIcon';
import PlayerStatusCard from './PlayerStatusCard';
import PostGameWizard from './PostGameWizard';
import DownloadIcon from './icons/DownloadIcon';
import StarPlayerModal from './StarPlayerModal';
import QuestionMarkCircleIcon from './icons/QuestionMarkCircleIcon';
import TdIcon from './icons/TdIcon';
import PassIcon from './icons/PassIcon';
import CasualtyIcon from './icons/CasualtyIcon';
import InterferenceIcon from './icons/InterferenceIcon';
import PrayersModal from './PrayersModal';
import TurnoverModal from './TurnoverModal';
import PlayerCardModal from './PlayerCardModal';
import { skillsData } from '../data/skills';
import SkillModal from './SkillModal';
import ApothecaryModal from './ApothecaryModal';

declare const Html5Qrcode: any;
declare const XLSX: any;

interface LiveGameProps {
    managedTeams: ManagedTeam[];
    onTeamsUpdate: (teams: ManagedTeam[]) => void;
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
    step: 'select_victim_team' | 'select_victim' | 'armor_roll' | 'injury_roll' | 'apothecary' | 'casualty_roll' | 'lasting_injury_roll' | 'summary';
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
}

const PlayerButton: React.FC<{ player: ManagedPlayer, onSelect: (p: ManagedPlayer) => void }> = ({ player, onSelect }) => (
    <button onClick={() => onSelect(player)} className="w-full text-left bg-slate-700/50 p-3 rounded-md hover:bg-slate-700 transition-colors">
        <p className="font-bold text-white">
            {player.isStarPlayer && <span className="text-amber-400 mr-1">★</span>}
            {player.customName}
            {player.isJourneyman && <span className="text-slate-400 font-normal italic ml-1">(Sustituto)</span>}
        </p>
        <p className="text-xs text-slate-400">{player.position}</p>
    </button>
);

const RollInputStep = ({ title, value, onChange, onNext, label, pattern, placeholder }: { title: string, value: string, onChange: (v:string)=>void, onNext: ()=>void, label: string, pattern: string, placeholder?: string }) => (
    <>
        <h3 className="text-lg font-bold text-amber-400 mb-4">{title}</h3>
        <label className="block text-sm font-medium text-slate-300 mb-1">{label}</label>
        <input
            type="text"
            pattern={pattern}
            value={value}
            onChange={e => onChange(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white mb-4"
            placeholder={placeholder || ""}
            autoFocus
        />
        <div className="text-right">
            <button onClick={onNext} className="bg-amber-500 text-slate-900 font-bold py-2 px-6 rounded-md shadow-md hover:bg-amber-400">Siguiente</button>
        </div>
    </>
);

const DoubleDiceInputStep = ({ title, value, onChange, onNext, label }: { title: string, value: { die1: string; die2: string; }, onChange: (v: { die1: string; die2: string; })=>void, onNext: ()=>void, label: string }) => {
    const die1Ref = React.useRef<HTMLInputElement>(null);
    const die2Ref = React.useRef<HTMLInputElement>(null);

    const handleDieChange = (die: 'die1' | 'die2', val: string) => {
        const cleanVal = val.replace(/[^1-6]/g, '').slice(0, 1);
        onChange({ ...value, [die]: cleanVal });

        if (die === 'die1' && cleanVal.length === 1) {
            die2Ref.current?.focus();
        }
    };

    return (
        <>
            <h3 className="text-lg font-bold text-amber-400 mb-4">{title}</h3>
            <label className="block text-sm font-medium text-slate-300 mb-1">{label}</label>
            <div className="flex items-center gap-4 mb-4">
                <input
                    ref={die1Ref}
                    type="text"
                    pattern="[1-6]"
                    value={value.die1}
                    onChange={e => handleDieChange('die1', e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white text-center text-lg"
                    placeholder="D6"
                    autoFocus
                />
                <span className="text-2xl font-bold text-slate-400">+</span>
                <input
                    ref={die2Ref}
                    type="text"
                    pattern="[1-6]"
                    value={value.die2}
                    onChange={e => handleDieChange('die2', e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white text-center text-lg"
                    placeholder="D6"
                />
            </div>
            <div className="text-right">
                <button onClick={onNext} className="bg-amber-500 text-slate-900 font-bold py-2 px-6 rounded-md shadow-md hover:bg-amber-400">Siguiente</button>
            </div>
        </>
    );
};

const calculateTeamValue = (team: ManagedTeam | null, includeInducementsForPrayers = false): number => {
    if (!team) return 0;
    const baseRoster = teamsData.find(t => t.name === team.rosterName);
    if (!baseRoster) return 0;

    const playersValue = team.players.reduce((sum, p) => {
        const skillsValue = p.gainedSkills.reduce((skillSum, skillName) => {
             if (skillName.toLowerCase().includes('secundaria')) {
                return skillSum + 40000;
            }
            if(skillName.toLowerCase().includes('solitario')) return skillSum;
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
        const tempBribesValue = (team.tempBribes || 0) * 100000;
        totalValue += tempStaffValue + tempBribesValue;
    }
    
    return totalValue;
};


const isEligibleStar = (star: StarPlayer, teamRoster: Team | undefined) => {
    if (!teamRoster) return false;

    const teamRules = teamRoster.specialRules.split(', ').map((r: string) => r.trim());

    const anyTeamRule = star.playsFor.find(r => r.startsWith("Any Team"));
    if (anyTeamRule) {
        if (anyTeamRule.includes("except Sylvanian Spotlight")) {
            return !teamRules.includes("Selectiva de Sylvania");
        }
        return true; 
    }

    return star.playsFor.some(faction => {
        if (teamRules.includes(faction)) return true;

        if (faction.startsWith("Elegidos de")) {
            const chaosGod = faction.replace("Elegidos de ", "").trim();
            if (chaosGod === "...") { 
                return teamRules.some(rule => rule.startsWith("Elegidos de..."));
            }
            return teamRules.some(rule => 
                rule.startsWith("Elegidos de...") && rule.includes(chaosGod)
            );
        }

        return false;
    });
};

// FIX: Changed to a named export to resolve the import error in App.tsx.
export const LiveGame = ({ managedTeams, onTeamsUpdate }: LiveGameProps): React.ReactElement => {
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
    const [fansRoll, setFansRoll] = useState({ home: '', opponent: ''});
    
    const [preGameStep, setPreGameStep] = useState(0);
    const [gameStatus, setGameStatus] = useState<{ weather: WeatherCondition | null; kickoffEvent: KickoffEvent | null; coinTossWinner: 'home'|'opponent'|null, receivingTeam: 'home'|'opponent'|null }>({ weather: null, kickoffEvent: null, coinTossWinner: null, receivingTeam: null });
    const [inducementState, setInducementState] = useState<{ underdog: 'home' | 'opponent' | null, money: number; hiredStars: ManagedPlayer[] }>({ underdog: null, money: 0, hiredStars: [] });
    
    const [isTdModalOpen, setIsTdModalOpen] = useState(false);
    const [isFoulModalOpen, setIsFoulModalOpen] = useState(false);
    const [isTurnoverModalOpen, setIsTurnoverModalOpen] = useState(false);
    const [tdModalTeam, setTdModalTeam] = useState<'home' | 'opponent' | null>(null);
    const [isCustomEventModalOpen, setIsCustomEventModalOpen] = useState(false);
    const [customEventDescription, setCustomEventDescription] = useState('');
    const [isWeatherModalOpen, setIsWeatherModalOpen] = useState(false);
    const [isChangingWeatherModalOpen, setIsChangingWeatherModalOpen] = useState(false);
    const [koRecoveryRolls, setKoRecoveryRolls] = useState<Record<number, {roll: number, success: boolean} | null>>({});
    const [selectedStarPlayer, setSelectedStarPlayer] = useState<StarPlayer | null>(null);
    const [isLegendOpen, setIsLegendOpen] = useState(false);
    const [isPrayersModalOpen, setIsPrayersModalOpen] = useState(false);
    const [weatherRerollInput, setWeatherRerollInput] = useState('');
    const [kickoffActionCompleted, setKickoffActionCompleted] = useState(false);
    const [journeymenNotification, setJourneymenNotification] = useState<string | null>(null);
    const [pendingJourneymen, setPendingJourneymen] = useState<{ home: ManagedPlayer[], opponent: ManagedPlayer[] }>({ home: [], opponent: [] });


    type SppModalType = 'pass' | 'interference' | 'casualty';
    const [sppModalState, setSppModalState] = useState<{
        isOpen: boolean;
        type: SppModalType | null;
        step: 'select_team' | 'select_player' | 'interference_type';
        teamId: 'home' | 'opponent' | null;
        selectedPlayer: ManagedPlayer | null;
    }>({
        isOpen: false,
        type: null,
        step: 'select_team',
        teamId: null,
        selectedPlayer: null,
    });

    
    const initialFoulState: FoulState = {
        step: 'select_fouler_team', foulingTeamId: null, foulingPlayer: null, victimPlayer: null,
        armorRoll: null, injuryRoll: null, casualtyRoll: null, lastingInjuryRoll: null,
        wasExpelled: false, expulsionReason: '', log: [],
        armorRollInput: { die1: '', die2: '' },
        injuryRollInput: { die1: '', die2: '' },
        casualtyRollInput: '',
        lastingInjuryRollInput: '',
    };
    const [foulState, setFoulState] = useState<FoulState>(initialFoulState);

    const initialInjuryState: InjuryState = {
        step: 'select_victim_team', victimTeamId: null, victimPlayer: null, isStunty: false,
        armorRoll: null, injuryRoll: null, casualtyRoll: null, lastingInjuryRoll: null,
        log: [], armorRollInput: { die1: '', die2: '' }, injuryRollInput: { die1: '', die2: '' },
        casualtyRollInput: '', lastingInjuryRollInput: '',
    };
    const [isInjuryModalOpen, setIsInjuryModalOpen] = useState(false);
    const [injuryState, setInjuryState] = useState<InjuryState>(initialInjuryState);
    const [isApothecaryModalOpen, setIsApothecaryModalOpen] = useState(false);

    const scannerRef = useRef<any>(null);
    const scannerContainerRef = useRef<HTMLDivElement>(null);

    const homeTV = useMemo(() => calculateTeamValue(liveHomeTeam), [liveHomeTeam]);
    const opponentTV = useMemo(() => calculateTeamValue(liveOpponentTeam), [liveOpponentTeam]);
    
    useEffect(() => {
        Html5Qrcode.getCameras().then((d: any[]) => setHasCamera(!!(d && d.length))).catch(() => setHasCamera(false));
    }, []);

    useEffect(() => {
        if (gameStatus.kickoffEvent?.title === 'Clima Cambiante' && !kickoffActionCompleted) {
            setIsChangingWeatherModalOpen(true);
        }
    }, [gameStatus.kickoffEvent, kickoffActionCompleted]);

    useEffect(() => {
        if (gameState === 'scanning' && scannerContainerRef.current) {
            scannerRef.current = new Html5Qrcode(scannerContainerRef.current.id);
            scannerRef.current.start(
                { facingMode: "environment" },
                { fps: 10, qrbox: { width: 250, height: 250 } },
                (decodedText: string) => {
                    try {
                        const parsedTeam = JSON.parse(decodedText);
                        const isNewFormat = 'n' in parsedTeam && 'rN' in parsedTeam;

                        const teamName = isNewFormat ? parsedTeam.n : parsedTeam.name;
                        const rosterName = isNewFormat ? parsedTeam.rN : parsedTeam.rosterName;
                        const playersData = isNewFormat ? parsedTeam.pl : parsedTeam.players;

                        if (!teamName || !rosterName) {
                            alert('Código QR no válido: Faltan datos esenciales del equipo.'); return;
                        }

                        const baseTeam = teamsData.find(t => t.name === rosterName);
                        if (!baseTeam) {
                            alert(`Facción del equipo "${rosterName}" no encontrada.`); return;
                        }
                        
                        const fullPlayers: ManagedPlayer[] = playersData.map((p: any, i: number) => {
                            const position = isNewFormat ? p.p : p.position;
                            const basePlayer = baseTeam.roster.find(bp => bp.position === position);
                            if (!basePlayer) throw new Error(`Jugador "${position}" no encontrado.`);

                            return {
                                ...basePlayer, id: Date.now() + i,
                                customName: (isNewFormat ? p.cN : p.customName) || basePlayer.position,
                                spp: (isNewFormat ? p.s : p.spp) || 0,
                                gainedSkills: (isNewFormat ? p.gS : p.gainedSkills) || [],
                                lastingInjuries: (isNewFormat ? p.lI : p.lastingInjuries) || [],
                                status: 'Activo'
                            };
                        });

                        const opponentWithDefaults: ManagedTeam = {
                            name: teamName, rosterName: rosterName,
                            treasury: (isNewFormat ? parsedTeam.t : parsedTeam.treasury) || 0,
                            rerolls: (isNewFormat ? parsedTeam.rr : parsedTeam.rerolls) || 0,
                            dedicatedFans: (isNewFormat ? parsedTeam.df : parsedTeam.dedicatedFans) || 1,
                            cheerleaders: (isNewFormat ? parsedTeam.ch : parsedTeam.cheerleaders) || 0,
                            assistantCoaches: (isNewFormat ? parsedTeam.ac : parsedTeam.assistantCoaches) || 0,
                            apothecary: (isNewFormat ? parsedTeam.ap : parsedTeam.apothecary) || false,
                            players: fullPlayers,
                        };

                        setOpponentTeam(opponentWithDefaults);
                        setGameState('pre_game');
                        scannerRef.current.stop();

                    } catch (e) {
                        const message = e instanceof Error ? e.message : 'Error desconocido.';
                        alert(`Error al procesar el código QR: ${message}`);
                    }
                },
                () => {} 
            ).catch((err: any) => {
                console.error("Error al iniciar el escáner QR", err);
                alert(`Error al iniciar la cámara: ${err}.`);
                setGameState('select_team');
            });
        }

        return () => {
            if (scannerRef.current && scannerRef.current.isScanning) {
                scannerRef.current.stop().catch((e:any) => console.warn("Error al detener el escáner.", e));
            }
        };
    }, [gameState]);


    useEffect(() => {
        if (homeTeam) {
            const liveTeam = JSON.parse(JSON.stringify(homeTeam));
            liveTeam.players.forEach((p: ManagedPlayer) => { if (!p.status) p.status = 'Activo'; if (!p.sppActions) p.sppActions = {}; });
            setLiveHomeTeam(liveTeam);
        }
    }, [homeTeam]);

    useEffect(() => {
        if (opponentTeam) {
             const liveTeam = JSON.parse(JSON.stringify(opponentTeam));
            liveTeam.players.forEach((p: ManagedPlayer) => { if (!p.status) p.status = 'Activo'; if (!p.sppActions) p.sppActions = {}; });
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

            let newHomeJourneymen: ManagedPlayer[] = [];
            let homeMsg = '';
            if (homeNeeded > 0) {
                const baseHomeRoster = teamsData.find(t => t.name === liveHomeTeam.rosterName);
                const lineman = baseHomeRoster?.roster.find(p => p.position.toLowerCase().includes('línea') || p.position.toLowerCase().includes('lineman')) || baseHomeRoster?.roster[0];

                if (lineman) {
                    newHomeJourneymen = Array.from({ length: homeNeeded }).map((_, i): ManagedPlayer => ({
                        ...lineman,
                        id: Date.now() + i + 1000,
                        customName: generateRandomName(liveHomeTeam.rosterName),
                        spp: 0,
                        gainedSkills: ['Solitario (4+)'],
                        lastingInjuries: [],
                        isJourneyman: true,
                        status: 'Activo'
                    }));
                    homeMsg = `${liveHomeTeam.name} añade ${homeNeeded} Sustituto(s) para llegar a 11 jugadores.`;
                }
            }

            let newOppJourneymen: ManagedPlayer[] = [];
            let oppMsg = '';
            if (oppNeeded > 0) {
                const baseOppRoster = teamsData.find(t => t.name === liveOpponentTeam.rosterName);
                const lineman = baseOppRoster?.roster.find(p => p.position.toLowerCase().includes('línea') || p.position.toLowerCase().includes('lineman')) || baseOppRoster?.roster[0];
                
                if (lineman) {
                    newOppJourneymen = Array.from({ length: oppNeeded }).map((_, i): ManagedPlayer => ({
                        ...lineman,
                        id: Date.now() - i - 1000,
                        customName: generateRandomName(liveOpponentTeam.rosterName),
                        spp: 0,
                        gainedSkills: ['Solitario (4+)'],
                        lastingInjuries: [],
                        isJourneyman: true,
                        status: 'Activo'
                    }));
                    oppMsg = `${liveOpponentTeam.name} añade ${oppNeeded} Sustituto(s) para llegar a 11 jugadores.`;
                }
            }
            
            const notification = [homeMsg, oppMsg].filter(Boolean).join('\n');
            if (notification) {
                setPendingJourneymen({ home: newHomeJourneymen, opponent: newOppJourneymen });
                setJourneymenNotification(notification);
            } else {
                setPreGameStep(1);
            }
        }
    }, [gameState, preGameStep, liveHomeTeam, liveOpponentTeam, journeymenNotification, pendingJourneymen]);


    // Inducements effect
     useEffect(() => {
        if (gameState === 'pre_game' && preGameStep === 1 && liveHomeTeam && liveOpponentTeam) {
            const tvDiff = Math.abs(homeTV - opponentTV);
            const underdog = homeTV < opponentTV ? 'home' : (opponentTV < homeTV ? 'opponent' : null);
            
            if (underdog) {
                setInducementState(prev => ({ ...prev, money: tvDiff, underdog }));
            } else {
                setInducementState({ money: 0, hiredStars: [], underdog: null });
            }
        }
    }, [gameState, preGameStep, homeTV, opponentTV]);


    const logEvent = (type: GameEventType, description: string) => {
        const newEvent: GameEvent = {
            id: Date.now(), timestamp: new Date().toLocaleTimeString('es-ES'),
            turn, half, type, description,
        };
        setGameLog(prev => [newEvent, ...prev]);
    };

    const handleHalftime = () => {
        setTurn(0);
        setHalf(2);
        logEvent('INFO', 'Fin de la primera parte. Comienza la segunda parte.');
        setGameStatus(prev => ({...prev, kickoffEvent: null}));

        if (firstHalfReceiver) {
            const secondHalfReceiver = firstHalfReceiver === 'home' ? 'opponent' : 'home';
            setGameStatus(prev => ({ ...prev, receivingTeam: secondHalfReceiver }));
            const receiverName = secondHalfReceiver === 'home' ? homeTeam?.name : opponentTeam?.name;
            logEvent('INFO', `El equipo que recibe en la segunda parte es ${receiverName}.`);
            setGameState('pre_game');
            setPreGameStep(7); // Go directly to kickoff
        } else {
            // Fallback to original logic if something went wrong
            setGameState('pre_game');
            setPreGameStep(6);
        }
    };

    const handleConfirmJourneymen = () => {
        if (pendingJourneymen.home.length > 0 && liveHomeTeam) {
            setLiveHomeTeam(prev => prev ? ({...prev, players: [...prev.players, ...pendingJourneymen.home]}) : null);
            logEvent('INFO', `${liveHomeTeam.name} añade ${pendingJourneymen.home.length} Sustituto(s).`);
        }
        if (pendingJourneymen.opponent.length > 0 && liveOpponentTeam) {
            setLiveOpponentTeam(prev => prev ? ({...prev, players: [...prev.players, ...pendingJourneymen.opponent]}) : null);
            logEvent('INFO', `${liveOpponentTeam.name} añade ${pendingJourneymen.opponent.length} Sustituto(s).`);
        }
        
        setJourneymenNotification(null);
        setPendingJourneymen({ home: [], opponent: [] });
        setPreGameStep(1);
    };

    const handleSkillClick = (skillName: string) => {
        const cleanedName = skillName.split('(')[0].trim();
        const foundSkill = skillsData.find(s => s.name.toLowerCase().startsWith(cleanedName.toLowerCase()));
        if (foundSkill) {
            setSelectedSkillForModal(foundSkill);
        } else {
            console.warn(`Skill not found: ${cleanedName}`);
        }
    };

    const updatePlayerSppAndAction = (player: ManagedPlayer, teamId: 'home' | 'opponent', spp: number, action: SppActionType, description: string) => {
        const setTeam = teamId === 'home' ? setLiveHomeTeam : setLiveOpponentTeam;
        setTeam(prev => {
            if (!prev) return null;
            return {
                ...prev,
                players: prev.players.map(p => {
                    if (p.id === player.id) {
                        const newActions = { ...(p.sppActions || {}) };
                        newActions[action] = (newActions[action] || 0) + 1;
                        return { ...p, spp: p.spp + spp, sppActions: newActions };
                    }
                    return p;
                })
            };
        });
        logEvent('INFO', `${player.customName} gana ${spp} PE por ${description}.`);
        setSppModalState({ isOpen: false, type: null, step: 'select_team', teamId: null, selectedPlayer: null });
    };

    const updatePlayerStatus = (playerId: number, teamId: 'home' | 'opponent', status: PlayerStatus, statusDetail?: string) => {
        const setTeamToUpdate = teamId === 'home' ? setLiveHomeTeam : setLiveOpponentTeam;
        
        setTeamToUpdate(prevTeam => {
            if (!prevTeam) return null;
            return {
                ...prevTeam,
                players: prevTeam.players.map(p => p.id === playerId ? { ...p, status, statusDetail: statusDetail || '' } : p)
            };
        });
    };
    
    const handleSelectTdScorer = (scorer: ManagedPlayer) => {
        if (!tdModalTeam || !liveHomeTeam || !liveOpponentTeam) return;

        const teamName = tdModalTeam === 'home' ? liveHomeTeam.name : liveOpponentTeam.name;
        setScore(s => ({ ...s, [tdModalTeam]: s[tdModalTeam] + 1 }));
        updatePlayerSppAndAction(scorer, tdModalTeam, 3, 'TD', `anotar un Touchdown para ${teamName}`);
        
        setIsTdModalOpen(false);
        setTdModalTeam(null);
        setGameStatus(prev => ({...prev, kickoffEvent: null}));
        setGameState('ko_recovery');
    };

    const openSppModal = (type: SppModalType) => {
        setSppModalState({
            isOpen: true,
            type: type,
            step: 'select_team',
            teamId: null,
            selectedPlayer: null,
        });
    };

    const handleSppActionAward = (player: ManagedPlayer, teamId: 'home' | 'opponent', spp: number, action: SppActionType, reason: string) => {
        updatePlayerSppAndAction(player, teamId, spp, action, reason);
    };

    const handleTurnover = (reason: string) => {
        logEvent('TURNOVER', `Cambio de turno: ${reason}.`);
        setIsTurnoverModalOpen(false);
        handleNextTurn();
    };


    const handleNextTurn = () => {
       if (turn < 8) {
           const newTurn = turn + 1;
           setTurn(newTurn);
           logEvent('INFO', `Comienza el turno ${newTurn} de la parte ${half}.`);
       } else if (half === 1) {
            handleHalftime();
       } else {
            logEvent('INFO', '¡Fin del partido!');
            setGameState('post_game');
       }
    };
    
    const handleConfirmPostGame = (finalTeamState: ManagedTeam) => {
        if (!homeTeam) return;
    
        const allTeams = managedTeams.map(t => t.name === finalTeamState.name ? finalTeamState : t);
        onTeamsUpdate(allTeams);
    
        setGameState('setup');
        setHomeTeam(null); setOpponentTeam(null); setLiveHomeTeam(null); setLiveOpponentTeam(null);
        setGameLog([]); setScore({home: 0, opponent: 0}); setTurn(0); setHalf(1);
        setFame({ home: 0, opponent: 0 }); setFansRoll({ home: '', opponent: ''});
    };

    const handleFoulAction = (action: 'next') => {
        const { step, foulingPlayer, victimPlayer, armorRollInput, wasExpelled, log, foulingTeamId, injuryRollInput, casualtyRollInput, lastingInjuryRollInput } = foulState;
        
        if (action === 'next') {
            switch(step) {
                case 'select_victim':
                    if (foulingPlayer && victimPlayer) setFoulState(prev => ({...prev, step: 'armor_roll'}));
                    break;
                case 'armor_roll': {
                    const die1 = parseInt(armorRollInput.die1);
                    const die2 = parseInt(armorRollInput.die2);
                    if (isNaN(die1) || isNaN(die2)) break;

                    const roll = die1 + die2;
                    const armorValue = parseInt(victimPlayer!.stats.AR.replace('+', ''));
                    const armorBroken = roll > armorValue;
                    const isDoubles = die1 === die2;
                    
                    let logMsg = `Tirada de Armadura contra ${victimPlayer!.customName} (AR ${victimPlayer!.stats.AR}): ${die1}+${die2}=${roll}.`;
                    if (isDoubles) logMsg += " ¡Dobles!";
                    
                    if(armorBroken) {
                        logMsg += " ¡Armadura rota!";
                        setFoulState(prev => ({ ...prev, armorRoll: {roll, armorBroken}, step: 'injury_roll', log: [...log, logMsg], wasExpelled: wasExpelled || isDoubles, expulsionReason: isDoubles ? `Dobles en la tirada de armadura. ¡${foulingPlayer?.customName} es expulsado!` : ''}));
                    } else {
                        logMsg += " La armadura aguanta.";
                        setFoulState(prev => ({ ...prev, armorRoll: {roll, armorBroken}, step: 'summary', log: [...log, logMsg], wasExpelled: wasExpelled || isDoubles, expulsionReason: isDoubles ? `Dobles en la tirada de armadura. ¡${foulingPlayer?.customName} es expulsado!` : ''}));
                    }
                    break;
                }
                case 'injury_roll': {
                    const die1 = parseInt(injuryRollInput.die1);
                    const die2 = parseInt(injuryRollInput.die2);
                    if (isNaN(die1) || isNaN(die2)) break;
                    
                    const roll = die1 + die2;
                    const isDoubles = die1 === die2;
                    let result: PlayerStatus = roll <= 7 ? 'KO' : roll <= 9 ? 'KO' : 'Lesionado';
                    let resultText = roll <= 7 ? 'Aturdido' : roll <= 9 ? 'Inconsciente (KO)' : '¡Lesionado!';

                    let logMsg = `Tirada de Heridas: ${die1}+${die2}=${roll} -> ${resultText}.`;
                    if(isDoubles) logMsg += " ¡Dobles!";
                    
                    const newExpulsion = wasExpelled || isDoubles;
                    
                    const victimTeamId = foulingTeamId === 'home' ? 'opponent' : 'home';
                    updatePlayerStatus(victimPlayer!.id, victimTeamId, result, resultText === '¡Lesionado!' ? 'Lesionado' : resultText);

                    if(result === 'Lesionado') {
                         setFoulState(prev => ({...prev, injuryRoll: {roll, result: resultText}, step: 'casualty_roll', log: [...log, logMsg], wasExpelled: newExpulsion, expulsionReason: isDoubles ? `Dobles en la tirada de heridas. ¡${foulingPlayer?.customName} es expulsado!` : prev.expulsionReason}));
                    } else {
                        setFoulState(prev => ({...prev, injuryRoll: {roll, result: resultText}, step: 'summary', log: [...log, logMsg], wasExpelled: newExpulsion, expulsionReason: isDoubles ? `Dobles en la tirada de heridas. ¡${foulingPlayer?.customName} es expulsado!` : prev.expulsionReason}));
                    }
                    break;
                }
                case 'casualty_roll': {
                    const roll = parseInt(casualtyRollInput);
                    if (isNaN(roll) || casualtyRollInput.length === 0) break;
                    const event = casualtyResults.find(e => {
                        const range = e.diceRoll.split('-').map(Number);
                        return roll >= range[0] && roll <= range[1];
                    });
                    if (!event) return;
                    let logMsg = `Tirada de Lesión (D16): ${roll} -> ${event.title}. ${event.description}`;
                    
                    const victimTeamId = foulingTeamId === 'home' ? 'opponent' : 'home';
                    if (event.title === 'Muerto') {
                        updatePlayerStatus(victimPlayer!.id, victimTeamId, 'Muerto', event.title);
                    } else {
                        updatePlayerStatus(victimPlayer!.id, victimTeamId, 'Lesionado', event.title);
                    }

                    if (event.title === 'Lesion Permanente') {
                        setFoulState(prev => ({...prev, casualtyRoll: {roll, result: event.title}, step: 'lasting_injury_roll', log: [...log, logMsg]}));
                    } else {
                        setFoulState(prev => ({...prev, casualtyRoll: {roll, result: event.title}, step: 'summary', log: [...log, logMsg]}));
                    }
                    break;
                }
                case 'lasting_injury_roll': {
                    const roll = parseInt(lastingInjuryRollInput);
                    if (isNaN(roll) || lastingInjuryRollInput.length === 0) break;
                    const event = lastingInjuryResults.find(e => {
                         const range = e.diceRoll.split('-').map(Number);
                        return range.length > 1 ? (roll >= range[0] && roll <= range[1]) : roll === range[0];
                    });
                    if (!event) return;
                    let logMsg = `Lesión Permanente (D6): ${roll} -> ${event.permanentInjury} (${event.characteristicReduction}).`;
                    
                    const setTeamToUpdate = foulingTeamId === 'home' ? setLiveOpponentTeam : setLiveHomeTeam;
                    setTeamToUpdate(prev => prev ? ({ ...prev, players: prev.players.map(p => p.id === victimPlayer!.id ? {...p, lastingInjuries: [...p.lastingInjuries, `${event.permanentInjury} (${event.characteristicReduction})`]} : p)}) : null);
                    
                    setFoulState(prev => ({...prev, lastingInjuryRoll: {roll, result: event.permanentInjury, characteristic: event.characteristicReduction }, step: 'summary', log: [...log, logMsg]}));
                    break;
                }
                case 'summary': {
                    const finalLog = foulState.log.join(' ');
                    logEvent('FOUL', `Falta de ${foulingPlayer?.customName} (${foulingTeamId === 'home' ? homeTeam?.name : opponentTeam?.name}) a ${victimPlayer?.customName}. ${finalLog}`);
                    
                    if (foulingPlayer && foulingTeamId && (foulState.injuryRoll?.result === '¡Lesionado!' || foulState.casualtyRoll)) {
                       updatePlayerSppAndAction(foulingPlayer, foulingTeamId, 2, 'CASUALTY', 'causar una lesión en una falta');
                    }

                    if (foulState.wasExpelled) {
                        logEvent('INFO', foulState.expulsionReason || `El jugador ${foulingPlayer?.customName} ha sido expulsado.`);
                        updatePlayerStatus(foulingPlayer!.id, foulingTeamId!, 'Expulsado', 'Expulsado');
                    }
                    
                    setIsFoulModalOpen(false);
                    setFoulState(initialFoulState);
                    break;
                }
            }
        }
    };

    const handleInjuryAction = (action: 'next' | 'back') => {
        const { step, victimPlayer, armorRollInput, log, victimTeamId, injuryRollInput, casualtyRollInput, lastingInjuryRollInput, casualtyRoll } = injuryState;

        if (action === 'back') {
            const history: InjuryState['step'][] = ['select_victim_team', 'select_victim', 'armor_roll', 'injury_roll', 'apothecary', 'casualty_roll', 'lasting_injury_roll'];
            const currentStepIndex = history.indexOf(step);
            if (currentStepIndex > 0) {
                setInjuryState(prev => ({ ...prev, step: history[currentStepIndex - 1] }));
            }
            return;
        }

        if (action === 'next') {
            switch(step) {
                case 'select_victim':
                    if (victimPlayer) {
                        const isStunty = victimPlayer.skills.toLowerCase().includes('escurridizo');
                        setInjuryState(prev => ({...prev, step: 'armor_roll', isStunty }));
                    }
                    break;
                case 'armor_roll': {
                    const die1 = parseInt(armorRollInput.die1);
                    const die2 = parseInt(armorRollInput.die2);
                    if (isNaN(die1) || isNaN(die2)) break;

                    const roll = die1 + die2;
                    const armorValue = parseInt(victimPlayer!.stats.AR.replace('+', ''));
                    const armorBroken = roll > armorValue;
                    
                    let logMsg = `Tirada de Armadura contra ${victimPlayer!.customName} (AR ${victimPlayer!.stats.AR}): ${die1}+${die2}=${roll}.`;
                    if (armorBroken) {
                        logMsg += " ¡Armadura rota!";
                        setInjuryState(prev => ({ ...prev, armorRoll: {roll, armorBroken}, step: 'injury_roll', log: [...log, logMsg]}));
                    } else {
                        logMsg += " La armadura aguanta.";
                        setInjuryState(prev => ({ ...prev, armorRoll: {roll, armorBroken}, step: 'summary', log: [...log, logMsg]}));
                    }
                    break;
                }
                 case 'injury_roll': {
                    const die1 = parseInt(injuryRollInput.die1);
                    const die2 = parseInt(injuryRollInput.die2);
                    if (isNaN(die1) || isNaN(die2)) break;
                    
                    const roll = die1 + die2;
                    let result: PlayerStatus = 'Activo';
                    let resultText = '';
                    
                    if (roll <= 7) { result = 'Activo'; resultText = 'Aturdido'; }
                    else if (roll <= 9) { result = 'KO'; resultText = 'Inconsciente (KO)'; }
                    else { result = 'Lesionado'; resultText = '¡Lesionado!'; }

                    let logMsg = `Tirada de Heridas: ${die1}+${die2}=${roll} -> ${resultText}.`;
                    
                    const team = victimTeamId === 'home' ? liveHomeTeam : liveOpponentTeam;
                    const hasApo = team?.apothecary;

                    if (hasApo && (result === 'KO' || result === 'Lesionado')) {
                         setInjuryState(prev => ({...prev, injuryRoll: {roll, result: resultText}, step: 'apothecary', log: [...log, logMsg]}));
                    } else {
                        if (result !== 'Lesionado') updatePlayerStatus(victimPlayer!.id, victimTeamId!, result, resultText);
                        setInjuryState(prev => ({...prev, injuryRoll: {roll, result: resultText}, step: result === 'Lesionado' ? 'casualty_roll' : 'summary', log: [...log, logMsg]}));
                    }
                    break;
                }
                case 'apothecary': // This step is just a decision point, handled by modal buttons
                    break; 
                case 'casualty_roll': {
                    const roll = parseInt(casualtyRollInput);
                    if (isNaN(roll) || casualtyRollInput.length === 0) break;
                    const event = casualtyResults.find(e => {
                        const range = e.diceRoll.split('-').map(Number);
                        return range.length > 1 ? (roll >= range[0] && roll <= range[1]) : roll === range[0];
                    });
                    if (!event) return;
                    
                    let logMsg = `Tirada de Lesión (D16)${casualtyRoll?.rerolled ? ' (repetida)' : ''}: ${roll} -> ${event.title}. ${event.description}`;
                    
                    const team = victimTeamId === 'home' ? liveHomeTeam : liveOpponentTeam;
                    const hasApo = team?.apothecary && !casualtyRoll?.rerolled;

                    if (hasApo) {
                        setInjuryState(prev => ({...prev, casualtyRoll: { roll, result: event.title, rerolled: false }, step: 'apothecary', log: [...log, logMsg]}));
                    } else {
                         if (event.title === 'Muerto') updatePlayerStatus(victimPlayer!.id, victimTeamId!, 'Muerto', event.title);
                         else updatePlayerStatus(victimPlayer!.id, victimTeamId!, 'Lesionado', event.title);

                        setInjuryState(prev => ({...prev, casualtyRoll: { ...(prev.casualtyRoll!), roll, result: event.title }, step: event.title === 'Lesion Permanente' ? 'lasting_injury_roll' : 'summary', log: [...log, logMsg]}));
                    }
                    break;
                }
                case 'lasting_injury_roll': {
                     const roll = parseInt(lastingInjuryRollInput);
                    if (isNaN(roll) || lastingInjuryRollInput.length === 0) break;
                    const event = lastingInjuryResults.find(e => {
                         const range = e.diceRoll.split('-').map(Number);
                        return range.length > 1 ? (roll >= range[0] && roll <= range[1]) : roll === range[0];
                    });
                    if (!event) return;
                    let logMsg = `Lesión Permanente (D6): ${roll} -> ${event.permanentInjury} (${event.characteristicReduction}).`;
                    
                    const setTeamToUpdate = victimTeamId === 'home' ? setLiveHomeTeam : setLiveOpponentTeam;
                    setTeamToUpdate(prev => prev ? ({ ...prev, players: prev.players.map(p => p.id === victimPlayer!.id ? {...p, lastingInjuries: [...p.lastingInjuries, `${event.permanentInjury} (${event.characteristicReduction})`]} : p)}) : null);
                    
                    setInjuryState(prev => ({...prev, lastingInjuryRoll: {roll, result: event.permanentInjury, characteristic: event.characteristicReduction }, step: 'summary', log: [...log, logMsg]}));
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
    }


    const handleManualOpponentSelect = (teamName: string) => {
        const selectedOpponent = managedTeams.find(t => t.name === teamName);
        if (selectedOpponent) {
            setOpponentTeam(selectedOpponent);
            setGameState('pre_game');
        }
    };

    const handleExportLog = () => {
        if (!homeTeam || !opponentTeam) return;
        try {
            const worksheet = XLSX.utils.json_to_sheet(
                [...gameLog].reverse().map(e => ({ 
                    'Hora': e.timestamp, 'Parte': e.half, 'Turno': e.turn, 'Tipo': e.type, 'Descripción': e.description,
                }))
            );
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Bitácora');
            XLSX.writeFile(workbook, `bitacora_${homeTeam.name}_vs_${opponentTeam.name}.xlsx`);
        } catch (error) {
            console.error("Error exporting log:", error);
            alert("Hubo un error al exportar la bitácora.");
        }
    };
    
    const rollKoRecovery = (player: ManagedPlayer) => {
        const roll = Math.floor(Math.random() * 6) + 1;
        const success = roll >= 4;
        setKoRecoveryRolls(prev => ({ ...prev, [player.id]: { roll, success } }));
        if (success) {
            updatePlayerStatus(player.id, 'home', 'Activo');
        }
    };

    const renderWeatherIcon = (title: string) => {
        const lowerTitle = title.toLowerCase();
        if (lowerTitle.includes('calor')) return <FireIcon className="w-5 h-5 text-red-400" />;
        if (lowerTitle.includes('soleado')) return <SunIcon className="w-5 h-5 text-yellow-300" />;
        if (lowerTitle.includes('perfecto')) return <CloudIcon className="w-5 h-5 text-blue-300" />;
        if (lowerTitle.includes('lluvioso')) return <CloudRainIcon className="w-5 h-5 text-cyan-300" />;
        if (lowerTitle.includes('ventisca')) return <SnowflakeIcon className="w-5 h-5 text-white" />;
        return null;
    };

    const handleConfirmWeatherReroll = () => {
        const roll = parseInt(weatherRerollInput);
        if (isNaN(roll) || roll < 2 || roll > 12) {
            alert("Por favor, introduce un resultado de 2D6 válido (entre 2 y 12).");
            return;
        }
    
        let newWeather: WeatherCondition | undefined;
        if (roll === 2) newWeather = weatherConditions.find(w => w.roll === "2");
        else if (roll === 3) newWeather = weatherConditions.find(w => w.roll === "3");
        else if (roll >= 4 && roll <= 10) newWeather = weatherConditions.find(w => w.roll === "4-10");
        else if (roll === 11) newWeather = weatherConditions.find(w => w.roll === "11");
        else if (roll === 12) newWeather = weatherConditions.find(w => w.roll === "12");
    
        if (newWeather) {
            setGameStatus(prev => ({ ...prev, weather: newWeather }));
            let logMessage = `Clima Cambiante (Tirada ${roll}): El nuevo clima es ${newWeather.title}.`;
            if (newWeather.title === 'Clima Perfecto') {
                logMessage += " El balón se escorará.";
            }
            logEvent('WEATHER', logMessage);
        }
        
        setIsChangingWeatherModalOpen(false);
        setKickoffActionCompleted(true);
        setWeatherRerollInput('');
    };
    
    const handleAdjustTurnCounter = () => {
        const isKickingTeamTurn6to8 = turn >= 6 && turn <= 8;
        if (isKickingTeamTurn6to8) {
            setTurn(t => {
                const newTurn = Math.max(0, t - 1);
                logEvent('INFO', `Tiempo Muerto: El contador de turno se retrasa a ${newTurn}.`);
                return newTurn;
            });
        } else {
            setTurn(t => {
                const newTurn = Math.min(8, t + 1);
                logEvent('INFO', `Tiempo Muerto: El contador de turno se adelanta a ${newTurn}.`);
                return newTurn;
            });
        }
        setKickoffActionCompleted(true);
    };

    const handleHireStar = (star: StarPlayer) => {
        if (!inducementState.underdog) return;

        const newPlayer: ManagedPlayer = {
            id: Date.now() + Math.random(),
            customName: star.name,
            position: "Jugador Estrella",
            cost: star.cost,
            stats: star.stats,
            skills: star.skills,
            primary: 'G', secondary: 'A,F,P',
            spp: 0, gainedSkills: [], lastingInjuries: [],
            isStarPlayer: true, qty: "0-1",
            status: 'Activo'
        };

        const setUnderdogTeam = inducementState.underdog === 'home' ? setLiveHomeTeam : setLiveOpponentTeam;
        const underdogTeam = inducementState.underdog === 'home' ? liveHomeTeam : liveOpponentTeam;

        setUnderdogTeam(prev => prev ? ({ ...prev, players: [...prev.players, newPlayer] }) : null);

        setInducementState(prev => ({ ...prev, money: prev.money - star.cost, hiredStars: [...prev.hiredStars, newPlayer] }));
        if (underdogTeam) {
            logEvent('INFO', `${underdogTeam.name} contrata al jugador estrella ${star.name} por ${star.cost.toLocaleString()} M.O.`);
        }
    };
    
    const renderFoulModalContent = () => {
        if (!liveHomeTeam || !liveOpponentTeam) return null;

        switch (foulState.step) {
            case 'select_fouler_team':
                return (
                    <>
                        <h2 className="text-xl font-bold text-amber-400 p-4 border-b border-slate-700">Paso 1: ¿Qué equipo comete la falta?</h2>
                        <div className="p-5 space-y-3">
                            <button onClick={() => setFoulState(prev => ({ ...prev, foulingTeamId: 'home', step: 'select_fouler' }))} className="w-full bg-slate-700/50 p-4 rounded-md hover:bg-slate-700 font-semibold text-lg">{liveHomeTeam.name}</button>
                            <button onClick={() => setFoulState(prev => ({ ...prev, foulingTeamId: 'opponent', step: 'select_fouler' }))} className="w-full bg-slate-700/50 p-4 rounded-md hover:bg-slate-700 font-semibold text-lg">{liveOpponentTeam.name}</button>
                        </div>
                    </>
                );
            case 'select_fouler': {
                const team = foulState.foulingTeamId === 'home' ? liveHomeTeam : liveOpponentTeam;
                return (
                    <>
                        <h2 className="text-xl font-bold text-amber-400 p-4 border-b border-slate-700">Paso 2: Selecciona al Infractor</h2>
                        <div className="p-5 max-h-[60vh] overflow-y-auto space-y-2">
                            {team.players.filter(p => p.status === 'Activo').map(p => 
                                <PlayerButton key={p.id} player={p} onSelect={player => setFoulState(prev => ({...prev, foulingPlayer: player, step: 'select_victim'}))} />
                            )}
                        </div>
                    </>
                );
            }
            case 'select_victim': {
                const team = foulState.foulingTeamId === 'home' ? liveOpponentTeam : liveHomeTeam;
                return (
                    <>
                        <h2 className="text-xl font-bold text-amber-400 p-4 border-b border-slate-700">Paso 3: Selecciona a la Víctima</h2>
                        <div className="p-5 max-h-[60vh] overflow-y-auto space-y-2">
                             {team.players.map(p => 
                                <PlayerButton key={p.id} player={p} onSelect={player => setFoulState(prev => ({...prev, victimPlayer: player, step: 'armor_roll'}))} />
                            )}
                        </div>
                    </>
                );
            }
            case 'armor_roll':
                return <div className="p-5"><DoubleDiceInputStep title="Paso 4: Tirada de Armadura" value={foulState.armorRollInput} onChange={v => setFoulState(prev => ({...prev, armorRollInput: v}))} onNext={() => handleFoulAction('next')} label={`Introduce el resultado de 2D6 contra AR ${foulState.victimPlayer?.stats.AR}`} /></div>;
            case 'injury_roll':
                 return <div className="p-5