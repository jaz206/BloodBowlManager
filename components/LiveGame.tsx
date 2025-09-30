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

const LiveGame = ({ managedTeams, onTeamsUpdate }: LiveGameProps): React.ReactElement => {
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
                 return <div className="p-5"><DoubleDiceInputStep title="Paso 5: Tirada de Heridas" value={foulState.injuryRollInput} onChange={v => setFoulState(prev => ({...prev, injuryRollInput: v}))} onNext={() => handleFoulAction('next')} label="Introduce el resultado de 2D6" /></div>;
            case 'casualty_roll':
                return <div className="p-5"><RollInputStep title="Paso 6: Tirada de Lesión" value={foulState.casualtyRollInput} onChange={v => setFoulState(prev => ({...prev, casualtyRollInput: v.replace(/\D/g, '')}))} onNext={() => handleFoulAction('next')} label="Introduce el resultado de D16" pattern="\d*" placeholder="1-16"/></div>;
            case 'lasting_injury_roll':
                 return <div className="p-5"><RollInputStep title="Paso 7: Lesión Permanente" value={foulState.lastingInjuryRollInput} onChange={v => setFoulState(prev => ({...prev, lastingInjuryRollInput: v.replace(/[^1-6]/g, '')}))} onNext={() => handleFoulAction('next')} label="Introduce el resultado de D6" pattern="[1-6]" placeholder="1-6"/></div>;
            case 'summary':
                return (
                    <>
                        <h2 className="text-xl font-bold text-amber-400 p-4 border-b border-slate-700">Resumen de la Falta</h2>
                        <div className="p-5 space-y-2 text-slate-300">
                            {foulState.log.map((line, i) => <p key={i}>{line}</p>)}
                            {foulState.wasExpelled && <p className="font-bold text-red-400 mt-4">{foulState.expulsionReason || `¡${foulState.foulingPlayer?.customName} ha sido expulsado!`}</p>}
                        </div>
                         <div className="p-4 bg-slate-900/50 border-t border-slate-700 flex justify-end">
                            <button onClick={() => handleFoulAction('next')} className="bg-amber-500 text-slate-900 font-bold py-2 px-6 rounded-md shadow-md hover:bg-amber-400">Finalizar y Registrar</button>
                        </div>
                    </>
                );
            default:
                return null;
        }
    }

    const renderManualOpponentSelect = () => {
        if (!homeTeam) {
            return (
                <div className="text-center p-8 max-w-lg mx-auto">
                    <h2 className="text-2xl font-bold text-amber-400 mb-4">Primero selecciona tu equipo</h2>
                    <p className="text-slate-400 mb-4">Vuelve y elige el equipo que quieres usar.</p>
                    <button onClick={() => setGameState('select_team')} className="mt-4 text-amber-400 hover:underline">Volver a la selección</button>
                </div>
            )
        }
        const opponentOptions = managedTeams.filter(t => t.name !== homeTeam.name);

        if (opponentOptions.length === 0) {
            return (
                <div className="text-center p-8 max-w-lg mx-auto">
                    <h2 className="text-2xl font-bold text-amber-400 mb-4">No hay oponentes disponibles</h2>
                    <p className="text-slate-400 mb-4">Necesitas al menos dos equipos creados para seleccionar un oponente manualmente.</p>
                    <button onClick={() => setGameState('select_team')} className="mt-4 text-amber-400 hover:underline">Volver a la selección</button>
                </div>
            );
        }

        return (
            <div className="text-center p-8 max-w-lg mx-auto">
                <h2 className="text-2xl font-bold text-amber-400 mb-4">Selecciona tu Oponente</h2>
                <div className="space-y-3">
                    {opponentOptions.map(team => (
                        <button
                            key={team.name}
                            onClick={() => handleManualOpponentSelect(team.name)}
                            className="w-full bg-slate-700/50 text-slate-200 font-semibold p-4 rounded-lg shadow-md hover:bg-slate-700 hover:text-white transition-all duration-200"
                        >
                            {team.name} <span className="text-xs text-slate-400">({team.rosterName})</span>
                        </button>
                    ))}
                </div>
                <button onClick={() => setGameState('select_team')} className="mt-6 text-amber-400 hover:underline">Volver</button>
            </div>
        );
    }

    const renderContent = () => {
        switch (gameState) {
            case 'setup':
                if (managedTeams.length === 0) {
                    return (
                        <div className="text-center p-8 max-w-lg mx-auto">
                            <h2 className="text-3xl font-bold text-amber-400 mb-4">No tienes equipos</h2>
                            <p className="text-slate-400 mb-8">
                                Para empezar un partido, primero debes crear al menos una plantilla en el "Gestor de Equipo".
                            </p>
                        </div>
                    );
                }
                return (
                    <div className="text-center p-8 max-w-lg mx-auto">
                        <h2 className="text-3xl font-bold text-amber-400 mb-4">Empezar Partido</h2>
                        <p className="text-slate-400 mb-8">Elige tu equipo y configura el partido contra tu oponente.</p>
                        <button onClick={() => setGameState('select_team')} className="w-full bg-amber-500 text-slate-900 font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-amber-400 transition-all duration-200">
                            Empezar
                        </button>
                    </div>
                );
            case 'select_team':
                return (
                     <div className="text-center p-8 max-w-lg mx-auto">
                        <h2 className="text-2xl font-bold text-amber-400 mb-4">Selecciona tu equipo</h2>
                        <select onChange={e => setHomeTeam(managedTeams.find(t => t.name === e.target.value) || null)} className="w-full bg-slate-800 border border-slate-600 rounded-md py-2 px-3 text-white mb-6">
                            <option>Elige un equipo...</option>
                            {managedTeams.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
                        </select>
                        {homeTeam && (
                            <>
                                <h3 className="text-xl font-semibold text-slate-300 mb-4">¿Cómo juega tu oponente?</h3>
                                <div className="space-y-4">
                                    {hasCamera && <button onClick={() => setGameState('scanning')} className="w-full bg-sky-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-sky-500 transition-colors">Escanear QR del Oponente</button>}
                                    <button onClick={() => setGameState('manual_select')} className="w-full bg-slate-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-slate-500 transition-colors">Introducir manualmente</button>
                                </div>
                            </>
                        )}
                    </div>
                );
            case 'scanning':
                return (
                    <div className="text-center p-4">
                        <h2 className="text-xl font-bold text-amber-400 mb-4">Escanea el QR del Equipo Rival</h2>
                        <div id="qr-reader" ref={scannerContainerRef} className="max-w-sm mx-auto aspect-square bg-slate-900 rounded-lg"></div>
                        <button onClick={() => setGameState('select_team')} className="mt-4 text-amber-400 hover:underline">Cancelar</button>
                    </div>
                );
            case 'manual_select': 
                return renderManualOpponentSelect();
            case 'pre_game': {
                if (!homeTeam || !opponentTeam || !liveHomeTeam || !liveOpponentTeam) {
                    return (
                        <div className="text-center p-8">
                            <p className="text-red-500">Error: No se han configurado los equipos.</p>
                            <button onClick={() => setGameState('setup')} className="mt-4 text-amber-400 hover:underline">Volver al inicio</button>
                        </div>
                    );
                }
                
                const isFullPregameSequence = turn === 0 && half === 1;

                const renderPreGameContent = () => {
                     if (journeymenNotification && preGameStep === 0) {
                        return (
                            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in-fast">
                                <div className="bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-w-md w-full transform animate-slide-in-up">
                                    <div className="p-4 border-b border-slate-700">
                                        <h2 className="text-xl font-bold text-amber-400">Jugadores Insuficientes</h2>
                                    </div>
                                    <div className="p-5">
                                        <p className="text-slate-300 whitespace-pre-line">{journeymenNotification}</p>
                                    </div>
                                    <div className="p-4 bg-slate-900/50 border-t border-slate-700 flex justify-end">
                                        <button onClick={handleConfirmJourneymen} className="bg-amber-500 text-slate-900 font-bold py-2 px-6 rounded-md shadow-md hover:bg-amber-400">
                                            Entendido
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    }
                    switch (preGameStep) {
                         case 0:
                            return (
                                <div className="text-center p-8 max-w-4xl mx-auto">
                                    <h2 className="text-3xl font-bold text-amber-400 mb-4">Paso 1: Sustitutos</h2>
                                    <p className="text-slate-400">Comprobando plantillas para jugadores insuficientes...</p>
                                </div>
                            );
                         case 1: // Incentives
                            const { underdog, money } = inducementState;
                            const underdogTeam = underdog === 'home' ? liveHomeTeam : liveOpponentTeam;
                            const baseUnderdogRoster = teamsData.find(t => t.name === underdogTeam?.rosterName);

                            const availableStars = underdog ? starPlayersData.filter(star => {
                                if (star.cost > money) return false;
                                if (inducementState.hiredStars.length >= 2) return false;
                                if (inducementState.hiredStars.some(hired => hired.customName === star.name)) return false;
                                return isEligibleStar(star, baseUnderdogRoster);
                            }) : [];
                           
                             const handleInducementPurchase = (type: 'bribes' | 'cheerleaders' | 'assistantCoaches', cost: number, delta: 1 | -1) => {
                                if (!underdog) return;
                                if (delta === 1 && money < cost) return;

                                const setUnderdogTeam = underdog === 'home' ? setLiveHomeTeam : setLiveOpponentTeam;
                                setUnderdogTeam(prev => {
                                    if (!prev) return null;
                                    const key = `temp${type.charAt(0).toUpperCase() + type.slice(1)}` as 'tempBribes' | 'tempCheerleaders' | 'tempAssistantCoaches';
                                    return { ...prev, [key]: (prev[key] || 0) + delta };
                                });

                                setInducementState(prev => ({ ...prev, money: prev.money - (cost * delta) }));
                            };


                            return (
                                <div className="text-center p-4 sm:p-8 max-w-4xl mx-auto">
                                    <h2 className="text-3xl font-bold text-amber-400 mb-4">Paso 2: Incentivos</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2 text-slate-300 bg-slate-900/50 p-4 rounded-lg">
                                            <p>{liveHomeTeam.name} TV: <span className="font-bold text-white">{homeTV.toLocaleString()}</span></p>
                                        </div>
                                        <div className="space-y-2 text-slate-300 bg-slate-900/50 p-4 rounded-lg">
                                            <p>{liveOpponentTeam.name} TV: <span className="font-bold text-white">{opponentTV.toLocaleString()}</span></p>
                                        </div>
                                    </div>
                                    <p className="my-4 text-lg">Diferencia: <span className="font-bold text-amber-300">{Math.abs(homeTV - opponentTV).toLocaleString()}</span></p>

                                    {underdog ? (
                                        <div className="mt-4 bg-emerald-900/50 p-4 rounded-lg text-emerald-300">
                                            <p className="font-bold text-lg mb-2">{underdogTeam.name} es el desvalido y recibe:</p>
                                            <p>Dinero para incentivos: <span className="font-bold text-white">{money.toLocaleString()} M.O.</span></p>
                                            
                                            <div className="mt-4 space-y-4 text-left">
                                                {/* Other Inducements */}
                                                <div className="flex justify-between items-center p-2 bg-slate-800/50 rounded">
                                                    <div>
                                                        <p className="font-semibold text-white">Soborno (100.000)</p>
                                                        <p className="text-xs text-slate-400">Comprados: {underdogTeam.tempBribes || 0}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button onClick={() => handleInducementPurchase('bribes', 100000, -1)} disabled={(underdogTeam.tempBribes || 0) === 0} className="font-bold text-xl bg-red-600 rounded-full w-6 h-6 leading-6 text-center disabled:bg-slate-600">-</button>
                                                        <button onClick={() => handleInducementPurchase('bribes', 100000, 1)} disabled={money < 100000} className="font-bold text-xl bg-green-600 rounded-full w-6 h-6 leading-6 text-center disabled:bg-slate-600">+</button>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between items-center p-2 bg-slate-800/50 rounded">
                                                    <div>
                                                        <p className="font-semibold text-white">Animadora Adicional (10.000)</p>
                                                        <p className="text-xs text-slate-400">Comprados: {underdogTeam.tempCheerleaders || 0}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                         <button onClick={() => handleInducementPurchase('cheerleaders', 10000, -1)} disabled={(underdogTeam.tempCheerleaders || 0) === 0} className="font-bold text-xl bg-red-600 rounded-full w-6 h-6 leading-6 text-center disabled:bg-slate-600">-</button>
                                                        <button onClick={() => handleInducementPurchase('cheerleaders', 10000, 1)} disabled={money < 10000} className="font-bold text-xl bg-green-600 rounded-full w-6 h-6 leading-6 text-center disabled:bg-slate-600">+</button>
                                                    </div>
                                                </div>
                                                 <div className="flex justify-between items-center p-2 bg-slate-800/50 rounded">
                                                    <div>
                                                        <p className="font-semibold text-white">Ayudante Adicional (10.000)</p>
                                                        <p className="text-xs text-slate-400">Comprados: {underdogTeam.tempAssistantCoaches || 0}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button onClick={() => handleInducementPurchase('assistantCoaches', 10000, -1)} disabled={(underdogTeam.tempAssistantCoaches || 0) === 0} className="font-bold text-xl bg-red-600 rounded-full w-6 h-6 leading-6 text-center disabled:bg-slate-600">-</button>
                                                        <button onClick={() => handleInducementPurchase('assistantCoaches', 10000, 1)} disabled={money < 10000} className="font-bold text-xl bg-green-600 rounded-full w-6 h-6 leading-6 text-center disabled:bg-slate-600">+</button>
                                                    </div>
                                                </div>

                                                <h4 className="font-bold text-amber-300 mb-2 pt-4">Contratar Jugadores Estrella (máx. 2)</h4>
                                                {availableStars.length > 0 ? (
                                                    <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                                                        {availableStars.map(star => (
                                                            <div key={star.name} className="flex justify-between items-center bg-slate-800/50 p-2 rounded">
                                                                <div>
                                                                    <button onClick={() => setSelectedStarPlayer(star)} className="font-semibold text-white text-left hover:underline focus:outline-none">
                                                                        {star.name}
                                                                    </button>
                                                                    <p className="text-xs text-slate-400">{star.cost.toLocaleString()} M.O.</p>
                                                                </div>
                                                                <button onClick={() => handleHireStar(star)} className="bg-green-600 text-white font-bold py-1 px-3 rounded shadow hover:bg-green-500">Contratar</button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : <p className="text-sm text-slate-400">No hay jugadores estrella disponibles para contratar.</p>}
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="mt-4 text-slate-300">Los valores de equipo son iguales, no hay incentivos.</p>
                                    )}
                                    <button onClick={() => setPreGameStep(2)} className="mt-6 bg-sky-600 text-white font-bold py-2 px-6 rounded-md shadow-md hover:bg-sky-500">Siguiente &rarr;</button>
                                </div>
                            );
                        case 2: // Fans & FAME
                            const homeAttendance = (parseInt(fansRoll.home) || 0) + (homeTeam.dedicatedFans || 0);
                            const opponentAttendance = (parseInt(fansRoll.opponent) || 0) + (opponentTeam.dedicatedFans || 0);
                            let homeFame = 0, opponentFame = 0;
                            if(homeAttendance > opponentAttendance) homeFame = 1;
                            if(homeAttendance >= opponentAttendance * 2) homeFame = 2;
                            if(opponentAttendance > homeAttendance) opponentFame = 1;
                            if(opponentAttendance >= homeAttendance * 2) opponentFame = 2;

                             return (
                                <div className="text-center p-8 max-w-lg mx-auto">
                                    <h2 className="text-3xl font-bold text-amber-400 mb-4">Paso 3: Hinchas y FAMA</h2>
                                    <div className="grid grid-cols-2 gap-4 text-left">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-1">{homeTeam.name}</label>
                                            <input type="number" placeholder="Tirada 2D6" value={fansRoll.home} onChange={e => setFansRoll(p => ({...p, home: e.target.value}))} className="w-full bg-slate-800 border border-slate-600 rounded-md p-2" />
                                            <p className="text-xs text-slate-400 mt-1">Hinchas: {homeTeam.dedicatedFans}</p>
                                            <p className="text-lg">Total: <span className="font-bold">{homeAttendance}</span></p>
                                        </div>
                                        <div>
                                             <label className="block text-sm font-medium text-slate-300 mb-1">{opponentTeam.name}</label>
                                            <input type="number" placeholder="Tirada 2D6" value={fansRoll.opponent} onChange={e => setFansRoll(p => ({...p, opponent: e.target.value}))} className="w-full bg-slate-800 border border-slate-600 rounded-md p-2" />
                                             <p className="text-xs text-slate-400 mt-1">Hinchas: {opponentTeam.dedicatedFans}</p>
                                            <p className="text-lg">Total: <span className="font-bold">{opponentAttendance}</span></p>
                                        </div>
                                    </div>
                                    <div className="mt-4 text-xl font-bold text-amber-300">FAMA: {homeFame} - {opponentFame}</div>
                                    <button onClick={() => {
                                        setFame({ home: homeFame, opponent: opponentFame });
                                        logEvent('INFO', `Asistencia: ${homeAttendance} - ${opponentAttendance}. FAMA: ${homeFame} - ${opponentFame}.`);
                                        setPreGameStep(3);
                                    }} className="mt-6 bg-sky-600 text-white font-bold py-2 px-6 rounded-md shadow-md hover:bg-sky-500">Siguiente &rarr;</button>
                                </div>
                            );
                        case 3: // Weather
                            return (
                                <div className="text-center p-8 max-w-lg mx-auto">
                                    <h2 className="text-3xl font-bold text-amber-400 mb-4">Paso 4: Clima del Partido</h2>
                                    <p className="text-slate-400 mb-6">Selecciona las condiciones climáticas para el partido.</p>
                                    <select 
                                        className="w-full bg-slate-800 border border-slate-600 rounded-md py-2 px-3 text-white mb-4"
                                        value={gameStatus.weather?.title || ''}
                                        onChange={(e) => {
                                            const selectedWeather = weatherConditions.find(w => w.title === e.target.value);
                                            if (selectedWeather) {
                                                setGameStatus(prev => ({ ...prev, weather: selectedWeather }));
                                            }
                                        }}
                                    >
                                        <option value="" disabled>Selecciona un resultado de 2D6...</option>
                                        {weatherConditions.map(w => <option key={w.title} value={w.title}>[{w.roll}] {w.title}</option>)}
                                    </select>
                                    <button 
                                        onClick={() => {
                                            if (gameStatus.weather) {
                                                logEvent('WEATHER', `El clima es: ${gameStatus.weather.title}.`);
                                                setPreGameStep(4);
                                            } else {
                                                alert("Por favor, selecciona un clima.");
                                            }
                                        }} 
                                        disabled={!gameStatus.weather}
                                        className="bg-sky-600 text-white font-bold py-2 px-6 rounded-md shadow-md hover:bg-sky-500 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed">
                                        Siguiente &rarr;
                                    </button>
                                </div>
                            );
                        case 4: // Prayers to Nuffle
                             const homeTVWithInducements = calculateTeamValue(liveHomeTeam, true);
                             const oppTVWithInducements = calculateTeamValue(liveOpponentTeam, true);
                             const prayersUnderdog = homeTVWithInducements < oppTVWithInducements ? 'home' : (oppTVWithInducements < homeTVWithInducements ? 'opponent' : null);
                             const prayersUnderdogName = prayersUnderdog === 'home' ? liveHomeTeam.name : liveOpponentTeam?.name;
                             return (
                                <div className="text-center p-8 max-w-lg mx-auto">
                                    <h2 className="text-3xl font-bold text-amber-400 mb-4">Paso 5: Plegarias a Nuffle</h2>
                                    <p className="text-xs text-slate-500">VE Local: {homeTVWithInducements.toLocaleString()} | VE Visitante: {oppTVWithInducements.toLocaleString()}</p>
                                    {prayersUnderdog ? (
                                        <>
                                            <p className="text-slate-300 mb-4">{prayersUnderdogName} todavía tiene un VE inferior y puede tirar en la tabla de Plegarias a Nuffle.</p>
                                            <button onClick={() => setIsPrayersModalOpen(true)} className="bg-purple-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-purple-500 transition-all duration-200">
                                                Abrir Tabla de Plegarias
                                            </button>
                                        </>
                                    ) : (
                                        <p className="text-slate-400">Ningún equipo tiene un VE inferior después de los incentivos, no hay plegarias.</p>
                                    )}
                                    <button onClick={() => setPreGameStep(5)} className="mt-6 bg-sky-600 text-white font-bold py-2 px-6 rounded-md shadow-md hover:bg-sky-500">Siguiente &rarr;</button>
                                </div>
                             );
                        case 5: // Coin Toss
                             return (
                                <div className="text-center p-8 max-w-lg mx-auto">
                                    <h2 className="text-3xl font-bold text-amber-400 mb-4">Paso 6: Lanzamiento de Moneda</h2>
                                     <button onClick={() => {
                                        const winner = Math.random() < 0.5 ? 'home' : 'opponent';
                                        setGameStatus(prev => ({ ...prev, coinTossWinner: winner }));
                                        const winnerName = winner === 'home' ? homeTeam.name : opponentTeam.name;
                                        logEvent('INFO', `Lanzamiento de moneda: Gana ${winnerName}.`);
                                        setPreGameStep(6);
                                    }} className="bg-amber-500 text-slate-900 font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-500/50 transform hover:scale-105 transition-all duration-200">
                                        Lanzar Moneda
                                    </button>
                                </div>
                            );
                        case 6: // Winner Decides
                            if (!gameStatus.coinTossWinner) return null;
                            const winnerName = gameStatus.coinTossWinner === 'home' ? homeTeam.name : opponentTeam.name;
                            return (
                                 <div className="text-center p-8 max-w-lg mx-auto">
                                    <h2 className="text-3xl font-bold text-amber-400 mb-4">{winnerName} ha ganado el sorteo</h2>
                                    <p className="text-slate-400 mb-6">Elige si quieres patear el balón o recibirlo.</p>
                                    <div className="flex gap-4 justify-center">
                                        <button onClick={() => {
                                            const receiving = gameStatus.coinTossWinner === 'home' ? 'opponent' : 'home';
                                            setGameStatus(prev => ({...prev, receivingTeam: receiving}));
                                            if (half === 1) setFirstHalfReceiver(receiving);
                                            logEvent('INFO', `${winnerName} elige PATEAR.`);
                                            setPreGameStep(7);
                                        }} className="bg-sky-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-sky-500 transition-all duration-200">
                                            Patear
                                        </button>
                                        <button onClick={() => {
                                            if (!gameStatus.coinTossWinner) return;
                                            setGameStatus(prev => ({...prev, receivingTeam: prev.coinTossWinner}));
                                            if (half === 1) setFirstHalfReceiver(gameStatus.coinTossWinner);
                                            logEvent('INFO', `${winnerName} elige RECIBIR.`);
                                            setPreGameStep(7);
                                        }} className="bg-emerald-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-emerald-500 transition-all duration-200">
                                            Recibir
                                        </button>
                                    </div>
                                </div>
                            );
                        case 7: // Kick-off Event
                            return (
                                 <div className="text-center p-8 max-w-lg mx-auto">
                                    <h2 className="text-3xl font-bold text-amber-400 mb-4">{isFullPregameSequence ? 'Paso 7: Evento de Patada' : 'Nueva Patada Inicial'}</h2>
                                    {!gameStatus.kickoffEvent ? (
                                        <button onClick={() => {
                                            const die1 = Math.floor(Math.random() * 6) + 1;
                                            const die2 = Math.floor(Math.random() * 6) + 1;
                                            const roll = die1 + die2;
                                            const event = kickoffEvents.find(e => parseInt(e.diceRoll, 10) === roll);
                                            if (event) {
                                                setGameStatus(prev => ({...prev, kickoffEvent: event}));
                                                logEvent('KICKOFF', `Evento de Patada (${roll}): ${event.title}.`);
                                                setKickoffActionCompleted(false);
                                            }
                                        }} className="bg-amber-500 text-slate-900 font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-500/50 transform hover:scale-105 transition-all duration-200">
                                            Generar Evento de Patada
                                        </button>
                                    ) : (
                                        <div className="mt-8 p-6 bg-slate-900/70 border border-slate-700 rounded-lg shadow-xl text-left animate-fade-in">
                                            <h3 className="text-xl font-bold text-amber-300 mb-2 flex items-center">
                                                <span className="bg-slate-700 text-amber-300 text-lg font-mono px-3 py-1 rounded-md mr-4">{gameStatus.kickoffEvent.diceRoll}</span>
                                                <span>{gameStatus.kickoffEvent.title}</span>
                                            </h3>
                                            <p className="text-slate-300 mt-4">{gameStatus.kickoffEvent.description}</p>
                                            <div className="text-right mt-6">
                                                <button onClick={() => {
                                                    setGameState('in_progress');
                                                    if (isFullPregameSequence) {
                                                        logEvent('INFO', `¡Comienza el partido!`);
                                                        setTurn(1);
                                                    }
                                                }} className="bg-green-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-green-500 transition-all duration-200">
                                                    {isFullPregameSequence ? '¡Empezar Partido!' : '¡Continuar Partido!'}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        default:
                            return null;
                    }
                }
                return renderPreGameContent();
            }
             case 'ko_recovery': {
                if (!liveHomeTeam) return null;
                const koPlayers = liveHomeTeam.players.filter(p => p.status === 'KO');
                if (koPlayers.length === 0) {
                    setGameStatus(prev => ({...prev, kickoffEvent: null}));
                     if (turn >= 8 && half === 2) {
                        logEvent('INFO', '¡Fin del partido!'); setGameState('post_game');
                    } else if (turn >= 8 && half < 2) {
                        handleHalftime();
                    } else {
                        const newTurn = turn + 1;
                        setTurn(newTurn);
                        logEvent('INFO', `Touchdown! Comienza el turno ${newTurn}. Se prepara una nueva patada inicial.`);
                        setGameState('pre_game');
                        setPreGameStep(7);
                    }
                    return null;
                }
                return (
                    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                        <div className="bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-w-md w-full">
                            <h2 className="text-xl font-bold text-amber-400 p-4 border-b border-slate-700">Recuperación de K.O.</h2>
                            <div className="p-5 max-h-[60vh] overflow-y-auto space-y-3">
                                {koPlayers.map(p => (
                                    <div key={p.id} className="flex justify-between items-center bg-slate-700/50 p-3 rounded-md">
                                        <div>
                                            <p className="font-semibold text-white">{p.customName}</p>
                                            <p className="text-xs text-slate-400">{p.position}</p>
                                        </div>
                                        {koRecoveryRolls[p.id] ? (
                                            <p className={`font-bold ${koRecoveryRolls[p.id]?.success ? 'text-green-400' : 'text-red-400'}`}>
                                                Tirada: {koRecoveryRolls[p.id]?.roll} - {koRecoveryRolls[p.id]?.success ? 'Recuperado' : 'Sigue KO'}
                                            </p>
                                        ) : (
                                            <button onClick={() => rollKoRecovery(p)} className="bg-sky-600 text-white font-bold py-1 px-3 rounded-md shadow-md hover:bg-sky-500">Tirar 4+</button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="p-4 bg-slate-900/50 border-t border-slate-700 flex justify-end">
                                <button onClick={() => {
                                    setKoRecoveryRolls({});
                                    setGameStatus(prev => ({...prev, kickoffEvent: null}));
                                    if (turn >= 8 && half === 2) {
                                        logEvent('INFO', '¡Fin del partido!'); setGameState('post_game');
                                    } else if (turn >= 8 && half < 2) {
                                        handleHalftime();
                                    } else {
                                        const newTurn = turn + 1;
                                        setTurn(newTurn);
                                        logEvent('INFO', `Touchdown! Comienza el turno ${newTurn}. Se prepara una nueva patada inicial.`);
                                        setGameState('pre_game');
                                        setPreGameStep(7);
                                    }
                                }} className="bg-amber-500 text-slate-900 font-bold py-2 px-6 rounded-md shadow-md hover:bg-amber-400">
                                    Continuar a la Patada
                                </button>
                            </div>
                        </div>
                    </div>
                );
            }
            case 'in_progress':
                if (!liveHomeTeam || !liveOpponentTeam) return <p>Cargando...</p>;
                return (
                    <div className="p-2 sm:p-4">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                            <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700 space-y-2">
                                <h3 className="text-lg font-bold text-amber-400 truncate">{liveHomeTeam.name}</h3>
                                {liveHomeTeam.players.map(p => <PlayerStatusCard key={p.id} player={p} onViewPlayer={setViewingPlayer} onSkillClick={handleSkillClick} />)}
                            </div>
                            <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700 flex flex-col gap-4">
                                <div className="text-center border-b border-slate-700 pb-4">
                                    <p className="text-sm text-slate-400">Parte {half} - Turno {turn}</p>
                                    <p className="text-5xl font-bold my-2">{score.home} - {score.opponent}</p>
                                    <button 
                                        onClick={() => gameStatus.weather && setIsWeatherModalOpen(true)}
                                        disabled={!gameStatus.weather}
                                        className="flex justify-center items-center gap-2 text-sm text-slate-400 hover:text-amber-300 transition-colors disabled:hover:text-slate-400 disabled:cursor-default mx-auto"
                                    >
                                        {gameStatus.weather && renderWeatherIcon(gameStatus.weather.title)}
                                        <span>{gameStatus.weather?.title || 'Clima Desconocido'}</span>
                                    </button>
                                </div>

                                {gameStatus.kickoffEvent && (
                                    <div className="border-b border-slate-700 pb-4">
                                        <h4 className="text-sm font-bold text-amber-300 mb-2 text-center">Evento de Patada Activo</h4>
                                        <div className="bg-slate-800/50 p-2 rounded-md">
                                            <p className="text-xs text-slate-300 text-center"><strong>{gameStatus.kickoffEvent.title}</strong></p>
                                            <p className="text-xs text-slate-400 mt-1 text-center">{gameStatus.kickoffEvent.description}</p>
                                        </div>
                                        <div className="flex flex-col items-center gap-2 mt-2">
                                            {!kickoffActionCompleted && (
                                                <>
                                                    {gameStatus.kickoffEvent.title === 'Los Hinchas Animan' && (
                                                        <button onClick={() => { setIsPrayersModalOpen(true); setKickoffActionCompleted(true); }} className="text-xs bg-sky-700 text-white font-bold py-1 px-3 rounded-md shadow-md hover:bg-sky-600 transition-colors">Abrir Plegarias</button>
                                                    )}
                                                    {gameStatus.kickoffEvent.title === 'Tiempo Muerto' && (
                                                        <button onClick={handleAdjustTurnCounter} className="text-xs bg-sky-700 text-white font-bold py-1 px-3 rounded-md shadow-md hover:bg-sky-600 transition-colors">Ajustar Turno</button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}
                                
                                <div className="grid grid-cols-2 gap-3 flex-grow content-start">
                                    <button onClick={() => { setIsTdModalOpen(true); setTdModalTeam('home'); }} className="bg-green-600 text-white font-bold py-2 rounded-md hover:bg-green-500 text-sm">TD Local</button>
                                    <button onClick={() => { setIsTdModalOpen(true); setTdModalTeam('opponent'); }} className="bg-green-700 text-white font-bold py-2 rounded-md hover:bg-green-600 text-sm">TD Visitante</button>
                                    
                                    <button onClick={() => openSppModal('pass')} className="col-span-2 bg-sky-600 text-white font-bold py-2 rounded-md hover:bg-sky-500 text-sm">Pase Completo (+1 PE)</button>
                                    <button onClick={() => openSppModal('interference')} className="col-span-2 bg-purple-600 text-white font-bold py-2 rounded-md hover:bg-purple-500 text-sm">Interferencia</button>
                                    <button onClick={() => openSppModal('casualty')} className="col-span-2 bg-orange-600 text-white font-bold py-2 rounded-md hover:bg-orange-500 text-sm">Lesión Causada (+2 PE)</button>
                                    <button onClick={() => { setIsFoulModalOpen(true); setFoulState(initialFoulState); }} className="col-span-2 bg-red-600 text-white font-bold py-2 rounded-md hover:bg-red-500 text-sm">Falta</button>
                                    <button onClick={() => setIsTurnoverModalOpen(true)} className="col-span-2 bg-red-800 text-white font-extrabold py-3 rounded-md hover:bg-red-700 text-lg tracking-wider">¡TURNOVER!</button>
                                    <button onClick={() => setIsCustomEventModalOpen(true)} className="col-span-2 bg-slate-600 text-white font-bold py-2 rounded-md hover:bg-slate-500 text-sm">Otro Evento</button>
                                </div>
                                <button onClick={handleNextTurn} className="bg-amber-500 text-slate-900 font-bold py-3 rounded-md hover:bg-amber-400">Siguiente Turno</button>
                            </div>
                            <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700 space-y-2">
                                <h3 className="text-lg font-bold text-sky-400 truncate">{liveOpponentTeam.name}</h3>
                                {liveOpponentTeam.players.map(p => <PlayerStatusCard key={p.id} player={p} onViewPlayer={setViewingPlayer} onSkillClick={handleSkillClick} />)}
                            </div>
                            <div className="lg:col-span-3 bg-slate-900/50 p-3 rounded-lg border border-slate-700">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-lg font-bold text-amber-400 flex items-center gap-2">
                                        Registro del Partido
                                        <button onClick={() => setIsLegendOpen(true)} className="text-slate-400 hover:text-amber-400 transition-colors" aria-label="Mostrar leyenda de iconos">
                                            <QuestionMarkCircleIcon className="w-5 h-5" />
                                        </button>
                                    </h3>
                                    <button onClick={handleExportLog} className="flex items-center gap-2 text-xs bg-sky-700 text-white font-bold py-1 px-3 rounded-md shadow-md hover:bg-sky-600 transition-colors">
                                        <DownloadIcon className="w-4 h-4" />
                                        Descargar Bitácora
                                    </button>
                                </div>
                                <div className="space-y-2 text-sm h-48 overflow-y-auto pr-2">
                                    {gameLog.map(e => <p key={e.id} className="text-slate-300"><span className="font-mono text-slate-500 mr-2">{e.timestamp}</span>[{e.type}] {e.description}</p>)}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'post_game':
                if (!liveHomeTeam || !opponentTeam) return null;
                return <PostGameWizard 
                    initialHomeTeam={liveHomeTeam} 
                    opponentTeam={opponentTeam} 
                    score={score} 
                    fame={fame.home}
                    onConfirm={handleConfirmPostGame} 
                />;
            default:
                return <p>Estado de juego desconocido.</p>;
        }
    };

    return (
        <div className="animate-fade-in-slow">
            {renderContent()}

            {viewingPlayer && <PlayerCardModal player={viewingPlayer} onClose={() => setViewingPlayer(null)} />}
            
            {selectedSkillForModal && <SkillModal skill={selectedSkillForModal} onClose={() => setSelectedSkillForModal(null)} />}

            {isTurnoverModalOpen && (
                <TurnoverModal 
                    onClose={() => setIsTurnoverModalOpen(false)}
                    onConfirm={handleTurnover}
                />
            )}

            {isTdModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => setIsTdModalOpen(false)}>
                    <div className="bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-w-md w-full" onClick={e => e.stopPropagation()}>
                        <h2 className="text-xl font-bold text-amber-400 p-4 border-b border-slate-700">Selecciona el Anotador</h2>
                        <div className="p-5 max-h-[60vh] overflow-y-auto space-y-2">
                            {(tdModalTeam === 'home' ? liveHomeTeam?.players : liveOpponentTeam?.players)?.filter(p => p.status === 'Activo').map(player => (
                                <button key={player.id} onClick={() => handleSelectTdScorer(player)} className="w-full text-left bg-slate-700/50 p-3 rounded-md hover:bg-slate-700 transition-colors">
                                    <p className="font-bold text-white">{player.customName}</p>
                                    <p className="text-xs text-slate-400">{player.position}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {sppModalState.isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => setSppModalState({ isOpen: false, type: null, step: 'select_team', teamId: null, selectedPlayer: null })}>
                    <div className="bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-w-md w-full" onClick={e => e.stopPropagation()}>
                        {sppModalState.step === 'select_team' && (
                            <>
                                <h2 className="text-xl font-bold text-amber-400 p-4 border-b border-slate-700">Selecciona el Equipo</h2>
                                <div className="p-5 space-y-3">
                                    <button onClick={() => setSppModalState(prev => ({ ...prev, teamId: 'home', step: 'select_player' }))} className="w-full bg-slate-700/50 p-4 rounded-md hover:bg-slate-700 font-semibold text-lg">{liveHomeTeam?.name}</button>
                                    <button onClick={() => setSppModalState(prev => ({ ...prev, teamId: 'opponent', step: 'select_player' }))} className="w-full bg-slate-700/50 p-4 rounded-md hover:bg-slate-700 font-semibold text-lg">{liveOpponentTeam?.name}</button>
                                </div>
                            </>
                        )}
                        {sppModalState.step === 'select_player' && (
                            <>
                                <h2 className="text-xl font-bold text-amber-400 p-4 border-b border-slate-700">Selecciona el Jugador</h2>
                                <div className="p-5 max-h-[60vh] overflow-y-auto space-y-2">
                                    {(sppModalState.teamId === 'home' ? liveHomeTeam?.players : liveOpponentTeam?.players)?.filter(p => p.status === 'Activo').map(player => (
                                        <button key={player.id} onClick={() => {
                                            if (sppModalState.type === 'pass') {
                                                handleSppActionAward(player, sppModalState.teamId!, 1, 'PASS', 'un Pase Completo');
                                            } else if (sppModalState.type === 'casualty') {
                                                handleSppActionAward(player, sppModalState.teamId!, 2, 'CASUALTY', 'causar una lesión');
                                            } else if (sppModalState.type === 'interference') {
                                                setSppModalState(prev => ({...prev, selectedPlayer: player, step: 'interference_type'}));
                                            }
                                        }} className="w-full text-left bg-slate-700/50 p-3 rounded-md hover:bg-slate-700 transition-colors">
                                            <p className="font-bold text-white">{player.customName}</p>
                                            <p className="text-xs text-slate-400">{player.position}</p>
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                        {sppModalState.step === 'interference_type' && sppModalState.selectedPlayer && (
                             <>
                                <h2 className="text-xl font-bold text-amber-400 p-4 border-b border-slate-700">Tipo de Interferencia</h2>
                                <div className="p-5 space-y-3">
                                    <p className="text-slate-300 text-center">¿Qué tipo de interferencia ha realizado {sppModalState.selectedPlayer.customName}?</p>
                                    <button onClick={() => handleSppActionAward(sppModalState.selectedPlayer!, sppModalState.teamId!, 1, 'INTERFERENCE', 'una Interferencia (Corte)')} className="w-full bg-slate-700/50 p-4 rounded-md hover:bg-slate-700 font-semibold text-lg">Corte (+1 PE)</button>
                                    <button onClick={() => handleSppActionAward(sppModalState.selectedPlayer!, sppModalState.teamId!, 2, 'INTERFERENCE', 'una Interferencia (Intercepción)')} className="w-full bg-slate-700/50 p-4 rounded-md hover:bg-slate-700 font-semibold text-lg">Intercepción (+2 PE)</button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {isCustomEventModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => setIsCustomEventModalOpen(false)}>
                    <div className="bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-w-md w-full" onClick={e => e.stopPropagation()}>
                        <h2 className="text-xl font-bold text-amber-400 p-4 border-b border-slate-700">Añadir Evento Personalizado</h2>
                        <div className="p-5">
                            <textarea
                                value={customEventDescription}
                                onChange={(e) => setCustomEventDescription(e.target.value)}
                                className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white"
                                rows={3}
                                placeholder="Describe lo que ha ocurrido..."
                            />
                        </div>
                        <div className="p-4 bg-slate-900/50 border-t border-slate-700 flex justify-end gap-3">
                            <button onClick={() => setIsCustomEventModalOpen(false)} className="bg-slate-600 text-white font-bold py-2 px-4 rounded-md hover:bg-slate-500">Cancelar</button>
                            <button onClick={() => {
                                if (customEventDescription.trim()) {
                                    logEvent('OTHER', customEventDescription.trim());
                                    setCustomEventDescription('');
                                    setIsCustomEventModalOpen(false);
                                }
                            }} className="bg-amber-500 text-slate-900 font-bold py-2 px-4 rounded-md hover:bg-amber-400">Añadir al Registro</button>
                        </div>
                    </div>
                </div>
            )}

            {isFoulModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => setIsFoulModalOpen(false)}>
                    <div className="bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-w-md w-full" onClick={e => e.stopPropagation()}>
                        {renderFoulModalContent()}
                    </div>
                </div>
            )}

            {isWeatherModalOpen && gameStatus.weather && (
                 <div 
                    className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in-fast"
                    onClick={() => setIsWeatherModalOpen(false)}
                    role="dialog"
                    aria-modal="true"
                >
                    <div className="bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-w-md w-full transform animate-slide-in-up" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center p-4 border-b border-slate-700">
                            <h2 className="text-xl font-bold text-amber-400 flex items-center gap-3">
                                {renderWeatherIcon(gameStatus.weather.title)}
                                {gameStatus.weather.title}
                            </h2>
                            <button
                                onClick={() => setIsWeatherModalOpen(false)}
                                className="text-slate-400 hover:text-white transition-colors p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-white"
                                aria-label="Cerrar modal"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-5">
                            <p className="text-slate-300">{gameStatus.weather.description}</p>
                        </div>
                    </div>
                </div>
            )}
            {selectedStarPlayer && (
                <StarPlayerModal player={selectedStarPlayer} onClose={() => setSelectedStarPlayer(null)} />
            )}
             {isPrayersModalOpen && (
                <PrayersModal onClose={() => setIsPrayersModalOpen(false)} />
            )}

            {isChangingWeatherModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => setIsChangingWeatherModalOpen(false)}>
                    <div className="bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-w-md w-full" onClick={e => e.stopPropagation()}>
                        <h2 className="text-xl font-bold text-amber-400 p-4 border-b border-slate-700">Clima Cambiante</h2>
                        <div className="p-5">
                            <label htmlFor="weather-roll-modal-input" className="block text-sm font-medium text-slate-300 mb-2">Introduce la nueva tirada de 2D6 para el clima:</label>
                            <input
                                id="weather-roll-modal-input"
                                type="text"
                                pattern="\d*"
                                inputMode="numeric"
                                value={weatherRerollInput}
                                onChange={e => setWeatherRerollInput(e.target.value)}
                                placeholder="Resultado entre 2 y 12"
                                className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white text-center"
                                autoFocus
                            />
                        </div>
                        <div className="p-4 bg-slate-900/50 border-t border-slate-700 flex justify-end">
                            <button 
                                onClick={handleConfirmWeatherReroll} 
                                className="bg-amber-500 text-slate-900 font-bold py-2 px-6 rounded-md shadow-md hover:bg-amber-400"
                            >
                                Confirmar Clima
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isLegendOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in-fast"
                    onClick={() => setIsLegendOpen(false)}
                    role="dialog"
                    aria-modal="true"
                >
                    <div className="bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-w-md w-full transform animate-slide-in-up" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center p-4 border-b border-slate-700">
                            <h2 className="text-xl font-bold text-amber-400">Leyenda de Iconos de PE</h2>
                            <button
                                onClick={() => setIsLegendOpen(false)}
                                className="text-slate-400 hover:text-white transition-colors p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-white"
                                aria-label="Cerrar modal"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-5">
                            <ul className="space-y-4 text-slate-300">
                                <li className="flex items-center gap-3">
                                    <TdIcon className="w-6 h-6 text-amber-300 flex-shrink-0" />
                                    <div>
                                        <span className="font-semibold text-white">Touchdown:</span> +3 PE
                                    </div>
                                </li>
                                <li className="flex items-center gap-3">
                                    <PassIcon className="w-6 h-6 text-amber-300 flex-shrink-0" />
                                    <div>
                                        <span className="font-semibold text-white">Pase Completado:</span> +1 PE
                                    </div>
                                </li>
                                <li className="flex items-center gap-3">
                                    <CasualtyIcon className="w-6 h-6 text-amber-300 flex-shrink-0" />
                                    <div>
                                        <span className="font-semibold text-white">Lesión Causada:</span> +2 PE
                                    </div>
                                </li>
                                <li className="flex items-center gap-3">
                                    <InterferenceIcon className="w-6 h-6 text-amber-300 flex-shrink-0" />
                                    <div>
                                        <span className="font-semibold text-white">Interferencia:</span> Corte (+1 PE) o Intercepción (+2 PE)
                                    </div>
                                </li>
            
                            </ul>
                        </div>
                    </div>
                </div>
            )}
             <style>{`
                @keyframes fade-in-slow { from { opacity: 0; } to { opacity: 1; } }
                .animate-fade-in-slow { animation: fade-in-slow 0.5s ease-out forwards; }
                @keyframes fade-in-fast { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slide-in-up { from { transform: translateY(20px) scale(0.98); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
                .animate-fade-in-fast { animation: fade-in-fast 0.2s ease-out forwards; }
                .animate-slide-in-up { animation: slide-in-up 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default LiveGame;