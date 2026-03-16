import { useState, useMemo, useEffect } from 'react';
import { 
    GameState, 
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
import { calculateTeamValue } from '../../../../utils/teamUtils';

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
    // ESTADOS DE NAVEGACIÓN Y CONFIGURACIÓN
    const [gameState, setGameState] = useState<GameState>('selection');
    const [matchMode, setMatchMode] = useState<'friendly' | 'competition'>('competition');
    const [activeTab, setActiveTab] = useState<'assistant' | 'narrator'>('assistant');
    const [rosterViewId, setRosterViewId] = useState<'home' | 'opponent'>('home');

    // ESTADOS DE EQUIPO
    const [homeTeam, setHomeTeam] = useState<ManagedTeam | null>(null);
    const [opponentTeam, setOpponentTeam] = useState<ManagedTeam | null>(null);
    const [liveHomeTeam, setLiveHomeTeam] = useState<ManagedTeam | null>(null);
    const [liveOpponentTeam, setLiveOpponentTeam] = useState<ManagedTeam | null>(null);

    // ESTADOS DE JUEGO (REGLAS)
    const [gameLog, setGameLog] = useState<GameEvent[]>([]);
    const [score, setScore] = useState({ home: 0, opponent: 0 });
    const [turn, setTurn] = useState(0);
    const [half, setHalf] = useState(1);
    const [firstHalfReceiver, setFirstHalfReceiver] = useState<'home' | 'opponent' | null>(null);
    const [activeTeamId, setActiveTeamId] = useState<'home' | 'opponent'>('home');
    const [ballCarrierId, setBallCarrierId] = useState<number | null>(null);

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
    const homeTV = useMemo(() => liveHomeTeam ? calculateTeamValue(liveHomeTeam) : 0, [liveHomeTeam]);
    const opponentTV = useMemo(() => liveOpponentTeam ? calculateTeamValue(liveOpponentTeam) : 0, [liveOpponentTeam]);

    const playSound = (type: 'td' | 'injury' | 'turnover' | 'dice') => {
        const audio = new Audio(`/sounds/${type}.mp3`);
        audio.play().catch(() => {});
    };

    // SINCRONIZACIÓN INICIAL CON PROPS
    useEffect(() => {
        if (props.managedTeams && props.managedTeams.length > 0 && !homeTeam) {
            if (props.managedTeams.length === 1) {
                setHomeTeam(props.managedTeams[0]);
            }
        }
    }, [props.managedTeams, homeTeam]);

    // INICIALIZACIÓN DE EQUIPOS EN VIVO AL EMPEZAR EL PRE-GAME
    useEffect(() => {
        if (gameState === 'pre_game' && homeTeam && !liveHomeTeam) {
            console.log("[MatchState] Inicializando equipos en vivo...");
            
            const initLiveTeam = (team: ManagedTeam): ManagedTeam => ({
                ...team,
                players: team.players.map(p => ({
                    ...p,
                    status: (p.status === 'Muerto' || p.status === 'Lesionado') ? p.status : 'Reserva',
                    fieldPosition: null
                })),
                liveRerolls: team.rerolls || 0
            });

            setLiveHomeTeam(initLiveTeam(homeTeam));
            if (opponentTeam) {
                setLiveOpponentTeam(initLiveTeam(opponentTeam));
            }

            // CALCULAR INCENTIVOS (UNDERDOG) Y AVANZAR
            const hTV = calculateTeamValue(homeTeam);
            const oTV = opponentTeam ? calculateTeamValue(opponentTeam) : 0;
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

            // Saltamos a paso 1 (Mercado) si no hay heridos procesados por JourneymenNotification
            setPreGameStep(1);
        }
    }, [gameState, homeTeam, opponentTeam, liveHomeTeam]);

    // Log de estado para depuración (opcional, pero útil ahora)
    useEffect(() => {
        console.log("[MatchState] Cambiado a:", gameState);
    }, [gameState]);

    return {
        gameState, setGameState,
        matchMode, setMatchMode,
        activeTab, setActiveTab,
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
