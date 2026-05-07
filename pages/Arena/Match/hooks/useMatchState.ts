import { useState, useMemo, useEffect } from 'react';
import { useArenaConfig } from '../../../../hooks/useArenaConfig';
import { 
    GameState, 
    DriveResetTarget,
    GameBoardProps, 
    FoulState, 
    InjuryState, 
    SppModalState, 
    TurnActions,
    InducementState,
    GameStatusState,
    InteractionSequenceState
} from '../types/match.types';
import { 
    ManagedTeam, 
    GameEvent, 
    ManagedPlayer, 
    Skill, 
    StarPlayer, 
    MatchReport,
    PlayerStatus
} from '../../../../types';
import { buildMatchReadyTeamSummary, calculateTeamValue, createJourneymen } from '../../../../utils/teamUtils';
import { useMasterData } from '../../../../hooks/useMasterData';

export const initialFoulState: FoulState = {
    step: 'select_fouler_team',
    foulingTeamId: null,
    foulingPlayer: null,
    victimPlayer: null,
    armorRoll: null,
    injuryRoll: null,
    casualtyRoll: null,
    lastingInjuryRoll: null,
    wasExpelled: false,
    expulsionReason: '',
    log: [],
    armorRollInput: { die1: '', die2: '' },
    injuryRollInput: { die1: '', die2: '' },
    casualtyRollInput: '',
    lastingInjuryRollInput: ''
};

export const initialInjuryState: InjuryState = {
    step: 'select_casualty_type',
    source: null,
    autoTurnover: false,
    victimTeamId: null,
    victimPlayer: null,
    attackerTeamId: null,
    attackerPlayer: null,
    isCasualty: false,
    isStunty: false,
    armorRoll: null,
    injuryRoll: null,
    casualtyRoll: null,
    lastingInjuryRoll: null,
    log: [],
    armorRollInput: { die1: '', die2: '' },
    injuryRollInput: { die1: '', die2: '' },
    casualtyRollInput: '',
    lastingInjuryRollInput: '',
    apothecaryAction: null,
    regenerationRollInput: '',
    regenerationRoll: null
};

export const useMatchState = (props: GameBoardProps) => {
    const { teams: baseTeams, skills } = useMasterData();
    // ESTADOS DE NAVEGACIÓN Y CONFIGURACIÓN
    const [gameState, setGameState] = useState<GameState>('selection');
    const [matchMode, setMatchMode] = useState<'friendly' | 'competition'>('competition');
    const [activeTab, setActiveTab] = useState<'assistant' | 'narrator'>('assistant');
    const [rosterViewId, setRosterViewId] = useState<'home' | 'opponent'>('home');
    const [rosterDisplayMode, setRosterDisplayMode] = useState<'cards' | 'tactical'>('cards');

    // ESTADOS DE EQUIPO
    const [homeTeam, setHomeTeam] = useState<ManagedTeam | null>(props.initialHomeTeam || null);
    const [opponentTeam, setOpponentTeam] = useState<ManagedTeam | null>(props.initialOpponentTeam || null);
    const [liveHomeTeam, setLiveHomeTeam] = useState<ManagedTeam | null>(props.initialHomeTeam ? {
        ...props.initialHomeTeam,
        players: props.initialHomeTeam.players.map(p => ({
            ...p,
            status: (p.status === 'Muerto' || p.status === 'Lesionado' || (p.missNextGame && p.missNextGame > 0)) ? p.status : 'Reserva',
            fieldPosition: null
        })),
        liveRerolls: props.initialHomeTeam.rerolls || 0
    } : null);
    const [liveOpponentTeam, setLiveOpponentTeam] = useState<ManagedTeam | null>(props.initialOpponentTeam ? {
        ...props.initialOpponentTeam,
        players: props.initialOpponentTeam.players.map(p => ({
            ...p,
            status: (p.status === 'Muerto' || p.status === 'Lesionado' || (p.missNextGame && p.missNextGame > 0)) ? p.status : 'Reserva',
            fieldPosition: null
        })),
        liveRerolls: props.initialOpponentTeam.rerolls || 0
    } : null);

    // ESTADOS DE JUEGO (REGLAS)
    const [gameLog, setGameLog] = useState<GameEvent[]>([]);
    const [score, setScore] = useState({ home: 0, opponent: 0 });
    const [turn, setTurn] = useState(0);
    const [half, setHalf] = useState(1);
    const [firstHalfReceiver, setFirstHalfReceiver] = useState<'home' | 'opponent' | null>(null);
    const [activeTeamId, setActiveTeamId] = useState<'home' | 'opponent'>('home');
    const [ballCarrierId, setBallCarrierId] = useState<number | null>(null);
    const [driveResetTarget, setDriveResetTarget] = useState<DriveResetTarget>('next_drive');

    // ESTADOS DE PRE-GAME
    const [preGameStep, setPreGameStep] = useState(0);
    const [gameStatus, setGameStatus] = useState<GameStatusState>({
        weather: null,
        kickoffEvent: null,
        coinTossWinner: null,
        receivingTeam: null
    });
    const [inducementState, setInducementState] = useState<InducementState>({
        underdog: null,
        money: 0,
        hiredStars: []
    });
    const [fame, setFame] = useState({ home: 0, opponent: 0 });
    const [fansRoll, setFansRoll] = useState({ home: '', opponent: '' });
    const [pendingJourneymen, setPendingJourneymen] = useState<{ home: ManagedPlayer[], opponent: ManagedPlayer[] }>({
        home: [],
        opponent: []
    });
    const [kickoffActionCompleted, setKickoffActionCompleted] = useState(false);

    // ESTADOS DE ACCIONES Y MODALES
    const [selectedPlayerForAction, setSelectedPlayerForAction] = useState<ManagedPlayer | null>(null);
    const [turnActions, setTurnActions] = useState<TurnActions>({
        home: { blitz: false, pass: false, foul: false, handoff: false },
        opponent: { blitz: false, pass: false, foul: false, handoff: false }
    });

    // ESTADOS DE MODALES ESPECÍFICOS
    const [isTdModalOpen, setIsTdModalOpen] = useState(false);
    const [tdModalTeam, setTdModalTeam] = useState<'home' | 'opponent' | null>(null);

    const [isFoulModalOpen, setIsFoulModalOpen] = useState(false);
    const [foulState, setFoulState] = useState<FoulState>(initialFoulState);

    const [isInjuryModalOpen, setIsInjuryModalOpen] = useState(false);
    const [injuryState, setInjuryState] = useState<InjuryState>(initialInjuryState);

    const [sppModalState, setSppModalState] = useState<SppModalState>({
        isOpen: false,
        type: null,
        step: 'select_team',
        teamId: null,
        selectedPlayer: null
    });

    const [isTurnoverModalOpen, setIsTurnoverModalOpen] = useState(false);
    const [isApothecaryModalOpen, setIsApothecaryModalOpen] = useState(false);
    const [isPrayersModalOpen, setIsPrayersModalOpen] = useState(false);
    const [isWeatherModalOpen, setIsWeatherModalOpen] = useState(false);
    const [isChangingWeatherModalOpen, setIsChangingWeatherModalOpen] = useState(false);
    const [isSequenceGuideOpen, setIsSequenceGuideOpen] = useState(false);
    const [isMatchSummaryOpen, setIsMatchSummaryOpen] = useState(false);
    const [isConcedeModalOpen, setIsConcedeModalOpen] = useState(false);
    const [isCustomEventModalOpen, setIsCustomEventModalOpen] = useState(false);

    // ESTADOS DE APOYO
    const [viewingPlayer, setViewingPlayer] = useState<ManagedPlayer | null>(null);
    const [selectedSkillForModal, setSelectedSkillForModal] = useState<Skill | null>(null);
    const [selectedStarPlayer, setSelectedStarPlayer] = useState<StarPlayer | null>(null);
    const [selectedReport, setSelectedReport] = useState<MatchReport | null>(null);
    const [weatherRerollInput, setWeatherRerollInput] = useState('');
    const [customEventDescription, setCustomEventDescription] = useState('');
    const [concessionState, setConcessionState] = useState<'none' | 'home' | 'opponent'>('none');
    const [currentChronicle, setCurrentChronicle] = useState<string | null>(null);
    const [playersMissingNextGame, setPlayersMissingNextGame] = useState<{ playerId: number, teamId: 'home' | 'opponent' }[]>([]);
    const [koRecoveryRolls, setKoRecoveryRolls] = useState<Record<number, { roll: number, success: boolean } | null>>({});
    const [prayersAlert, setPrayersAlert] = useState<{ underdog: string, difference: number } | null>(null);
    const [journeymenNotification, setJourneymenNotification] = useState<string | null>(null);
    const [selectingSnapshotFor, setSelectingSnapshotFor] = useState<{ team: ManagedTeam, side: 'home' | 'opponent' } | null>(null);
    
    // ESTADO DE SECUENCIA S3 (Vínculo de Nuffle)
    const [interactionState, setInteractionState] = useState<InteractionSequenceState>({
        mode: 'idle',
        pending: {
            actorId: null,
            actionType: null,
            objectiveId: null,
            diceResult: null,
            manualMode: true
        }
    });

    // VALOR DE EQUIPO DINÁMICO
    const homeTV = useMemo(() => {
        if (!liveHomeTeam) return 0;
        const baseRoster = baseTeams.find(team => team.name === liveHomeTeam.rosterName);
        const summary = buildMatchReadyTeamSummary(liveHomeTeam, baseRoster, skills);
        return summary?.realTV ?? calculateTeamValue(liveHomeTeam, false, baseRoster, skills);
    }, [liveHomeTeam, baseTeams, skills]);
    const opponentTV = useMemo(() => {
        if (!liveOpponentTeam) return 0;
        const baseRoster = baseTeams.find(team => team.name === liveOpponentTeam.rosterName);
        const summary = buildMatchReadyTeamSummary(liveOpponentTeam, baseRoster, skills);
        return summary?.realTV ?? calculateTeamValue(liveOpponentTeam, false, baseRoster, skills);
    }, [liveOpponentTeam, baseTeams, skills]);

    const playSound = (type: 'td' | 'injury' | 'turnover' | 'dice') => {
        const audio = new Audio(`/sounds/${type}.mp3`);
        audio.play().catch(() => {});
    };

    // SINCRONIZACIÓN INICIAL CON PROPS
    useEffect(() => {
        if (props.initialHomeTeam && props.initialOpponentTeam) {
            setGameState('pre_game');
        } else if (props.managedTeams && props.managedTeams.length > 0 && !homeTeam) {
            if (props.managedTeams.length === 1) {
                setHomeTeam(props.managedTeams[0]);
            }
        }
    }, [props.managedTeams, props.initialHomeTeam, props.initialOpponentTeam]);

    // INICIALIZACIÓN DE EQUIPOS EN VIVO AL EMPEZAR EL PRE-GAME
    useEffect(() => {
        if (gameState === 'pre_game' && homeTeam && preGameStep === 0) {
            console.log("[MatchState] Inicializando equipos en vivo...");
            
            const initLiveTeam = (team: ManagedTeam): ManagedTeam => ({
                ...team,
                players: team.players.map(p => ({
                    ...p,
                    status: (p.status === 'Muerto' || p.status === 'Lesionado' || (p.missNextGame && p.missNextGame > 0)) ? p.status : 'Reserva',
                    fieldPosition: null
                })),
                liveRerolls: team.rerolls || 0
            });

            const preparedHomeTeam = liveHomeTeam ?? initLiveTeam(homeTeam);
            const preparedOpponentTeam = opponentTeam ? (liveOpponentTeam ?? initLiveTeam(opponentTeam)) : null;

            if (!liveHomeTeam) {
                setLiveHomeTeam(preparedHomeTeam);
            }
            if (opponentTeam && preparedOpponentTeam && !liveOpponentTeam) {
                setLiveOpponentTeam(preparedOpponentTeam);
            }

            // CALCULAR INCENTIVOS (UNDERDOG) Y AVANZAR
            const homeBaseRoster = baseTeams.find(team => team.name === homeTeam.rosterName);
            const opponentBaseRoster = opponentTeam ? baseTeams.find(team => team.name === opponentTeam.rosterName) : null;
            const homeSummary = buildMatchReadyTeamSummary(homeTeam, homeBaseRoster, skills);
            const opponentSummary = opponentTeam ? buildMatchReadyTeamSummary(opponentTeam, opponentBaseRoster, skills) : null;

            const hTV = homeSummary?.realTV ?? calculateTeamValue(homeTeam, false, homeBaseRoster, skills);
            const oTV = opponentTeam ? (opponentSummary?.realTV ?? calculateTeamValue(opponentTeam, false, opponentBaseRoster, skills)) : 0;
            const diff = oTV - hTV; // Positivo si local es underdog

            if (Math.abs(diff) >= 10000) {
                setInducementState({
                    underdog: diff > 0 ? 'home' : 'opponent',
                    money: Math.abs(diff),
                    hiredStars: []
                });
            } else {
                setInducementState({ underdog: null, money: 0, hiredStars: [] });
            }

            const homeJourneymen = homeSummary?.journeymenNeeded
                ? createJourneymen(preparedHomeTeam, homeBaseRoster, homeSummary.journeymenNeeded)
                : [];
            const opponentJourneymen = opponentSummary?.journeymenNeeded && preparedOpponentTeam
                ? createJourneymen(preparedOpponentTeam, opponentBaseRoster, opponentSummary.journeymenNeeded)
                : [];

            if (homeJourneymen.length > 0 || opponentJourneymen.length > 0) {
                setPendingJourneymen({ home: homeJourneymen, opponent: opponentJourneymen });

                const notificationLines: string[] = [];
                if (homeJourneymen.length > 0) {
                    notificationLines.push(
                        `${preparedHomeTeam.name} llega con ${homeSummary?.availableCount || 0} jugadores disponibles y recibe ${homeJourneymen.length} sustituto(s): ${homeJourneymen.map(player => player.position).join(', ')}.`
                    );
                }
                if (opponentJourneymen.length > 0 && preparedOpponentTeam) {
                    notificationLines.push(
                        `${preparedOpponentTeam.name} llega con ${opponentSummary?.availableCount || 0} jugadores disponibles y recibe ${opponentJourneymen.length} sustituto(s): ${opponentJourneymen.map(player => player.position).join(', ')}.`
                    );
                }
                notificationLines.push('Confirma para añadirlos antes de entrar al mercado prepartido.');
                setJourneymenNotification(notificationLines.join('\n\n'));
                return;
            }

            // Saltamos a paso 1 (Mercado) si no hay sustitutos pendientes
            setPreGameStep(1);
        }
    }, [gameState, homeTeam, opponentTeam, liveHomeTeam, liveOpponentTeam, baseTeams, skills, preGameStep]);

    // Log de estado para depuración (opcional, pero útil ahora)
    useEffect(() => {
        console.log("[MatchState] Cambiado a:", gameState);
    }, [gameState]);

    const { config: arenaConfig } = useArenaConfig();

    return {
        arenaConfig,
        gameState, setGameState,
        matchMode, setMatchMode,
        activeTab, setActiveTab,
        rosterDisplayMode, setRosterDisplayMode,
        rosterViewId, setRosterViewId,
        homeTeam, setHomeTeam,
        opponentTeam, setOpponentTeam,
        liveHomeTeam, setLiveHomeTeam,
        liveOpponentTeam, setLiveOpponentTeam,
        gameLog, setGameLog,
        score, setScore,
        turn, setTurn,
        half, setHalf,
        firstHalfReceiver, setFirstHalfReceiver,
        activeTeamId, setActiveTeamId,
        ballCarrierId, setBallCarrierId,
        driveResetTarget, setDriveResetTarget,
        preGameStep, setPreGameStep,
        gameStatus, setGameStatus,
        inducementState, setInducementState,
        fame, setFame,
        fansRoll, setFansRoll,
        pendingJourneymen, setPendingJourneymen,
        kickoffActionCompleted, setKickoffActionCompleted,
        selectedPlayerForAction, setSelectedPlayerForAction,
        turnActions, setTurnActions,
        isTdModalOpen, setIsTdModalOpen,
        tdModalTeam, setTdModalTeam,
        isFoulModalOpen, setIsFoulModalOpen,
        foulState, setFoulState,
        isInjuryModalOpen, setIsInjuryModalOpen,
        injuryState, setInjuryState,
        sppModalState, setSppModalState,
        isTurnoverModalOpen, setIsTurnoverModalOpen,
        isApothecaryModalOpen, setIsApothecaryModalOpen,
        isPrayersModalOpen, setIsPrayersModalOpen,
        isWeatherModalOpen, setIsWeatherModalOpen,
        isChangingWeatherModalOpen, setIsChangingWeatherModalOpen,
        isSequenceGuideOpen, setIsSequenceGuideOpen,
        isMatchSummaryOpen, setIsMatchSummaryOpen,
        isConcedeModalOpen, setIsConcedeModalOpen,
        isCustomEventModalOpen, setIsCustomEventModalOpen,
        viewingPlayer, setViewingPlayer,
        selectedSkillForModal, setSelectedSkillForModal,
        selectedStarPlayer, setSelectedStarPlayer,
        selectedReport, setSelectedReport,
        weatherRerollInput, setWeatherRerollInput,
        customEventDescription, setCustomEventDescription,
        concessionState, setConcessionState,
        currentChronicle, setCurrentChronicle,
        playersMissingNextGame, setPlayersMissingNextGame,
        koRecoveryRolls, setKoRecoveryRolls,
        prayersAlert, setPrayersAlert,
        journeymenNotification, setJourneymenNotification,
        selectingSnapshotFor, setSelectingSnapshotFor,
        interactionState, setInteractionState,
        homeTV,
        opponentTV,
        playSound,
        calculateTeamValue
    };
};



