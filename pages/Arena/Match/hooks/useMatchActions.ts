import { useCallback } from 'react';
import { useMatchState, initialFoulState, initialInjuryState } from './useMatchState';
import { GameBoardProps, SppModalType } from '../types/match.types';
import {
    ManagedPlayer,
    PlayerStatus,
    SppActionType,
    GameEvent,
    ManagedTeam
} from '../../../../types';
import { handleFoulActionLogic } from '../engine/foulEngine';
import { handleInjuryActionLogic } from '../engine/injuryEngine';
import { updatePlayerSppActionLogic } from '../engine/sppEngine';
import { handleHalftimeLogic, handleNextTurnLogic } from '../engine/matchEngine';
import { skillsData } from '../../../../data/skills';
import { teamsData } from '../../../../data/teams';

/**
 * useMatchActions — encapsula toda la lógica de acciones del partido.
 * Recibe el estado del hook useMatchState y retorna funciones de acción memoizadas.
 */
export const useMatchActions = (state: ReturnType<typeof useMatchState>, _props: GameBoardProps) => {
    const {
        setGameLog, turn, half, setTurn, setHalf, setGameState, setGameStatus,
        firstHalfReceiver, homeTeam, opponentTeam, liveHomeTeam, liveOpponentTeam,
        setLiveHomeTeam, setLiveOpponentTeam,
        setSppModalState, setIsTdModalOpen, setTdModalTeam, playSound,
        setScore, activeTeamId, setActiveTeamId, setTurnActions, turnActions,
        setIsFoulModalOpen, setFoulState, foulState,
        setIsInjuryModalOpen, setInjuryState, injuryState,
        setIsApothecaryModalOpen, setSelectedSkillForModal,
        setBallCarrierId, setSelectedPlayerForAction, selectedPlayerForAction,
        tdModalTeam
    } = state;

    // ─── UTILIDADES CORE ─────────────────────────────────────────────────────

    /** Añade un evento al log del partido. */
    const logEvent = useCallback((
        type: any,
        description: string,
        extra?: Partial<Pick<GameEvent, 'team' | 'player' | 'result' | 'target'>>
    ) => {
        setGameLog(prev => [{
            id: Date.now(),
            timestamp: new Date().toLocaleTimeString('es-ES'),
            turn,
            half,
            type,
            description,
            ...extra
        } as GameEvent, ...prev]);
    }, [turn, half, setGameLog]);

    /** Actualiza el estado de un jugador en el equipo en vivo. */
    const updatePlayerStatus = useCallback((
        playerId: number,
        teamId: 'home' | 'opponent',
        status: PlayerStatus,
        statusDetail?: string
    ) => {
        const setTeam = teamId === 'home' ? setLiveHomeTeam : setLiveOpponentTeam;
        setTeam(prev => {
            if (!prev) return null;
            return {
                ...prev,
                players: prev.players.map(p =>
                    p.id === playerId ? { ...p, status, statusDetail: statusDetail || '' } : p
                )
            };
        });
    }, [setLiveHomeTeam, setLiveOpponentTeam]);

    /** Otorga SPP a un jugador y lo registra en el log. */
    const updatePlayerSppAndAction = useCallback((
        player: ManagedPlayer,
        teamId: 'home' | 'opponent',
        spp: number,
        action: SppActionType,
        description: string
    ) => {
        updatePlayerSppActionLogic(
            { setLiveHomeTeam, setLiveOpponentTeam, logEvent, setSppModalState },
            player, teamId, spp, action, description
        );
    }, [setLiveHomeTeam, setLiveOpponentTeam, logEvent, setSppModalState]);

    // ─── FLUJO DE PARTIDO ────────────────────────────────────────────────────

    /** Gestiona la transición al descanso (Half Time). */
    const handleHalftime = useCallback(() => {
        handleHalftimeLogic({
            turn, half, setTurn, setHalf, logEvent,
            setGameStatus, firstHalfReceiver,
            homeTeam, opponentTeam, setGameState
        });
    }, [turn, half, setTurn, setHalf, logEvent, setGameStatus, firstHalfReceiver, homeTeam, opponentTeam, setGameState]);

    /** Avanza al siguiente turno alternando el equipo activo. */
    const handleNextTurn = useCallback(() => {
        handleNextTurnLogic({
            activeTeamId, setTurn, setActiveTeamId,
            setTurnActions, half, handleHalftime, setGameState, logEvent
        });
    }, [activeTeamId, setTurn, setActiveTeamId, setTurnActions, half, handleHalftime, setGameState, logEvent]);

    // ─── ACCIONES DE REGLAS ──────────────────────────────────────────────────

    /** Gestiona el flujo paso a paso de una falta. */
    const handleFoulAction = useCallback((action: 'next' | 'back') => {
        handleFoulActionLogic({
            foulState, setFoulState,
            liveHomeTeam, liveOpponentTeam,
            setLiveHomeTeam, setLiveOpponentTeam,
            updatePlayerStatus, logEvent,
            setIsFoulModalOpen, initialFoulState, playSound
        }, action);
    }, [foulState, setFoulState, liveHomeTeam, liveOpponentTeam, setLiveHomeTeam, setLiveOpponentTeam, updatePlayerStatus, logEvent, setIsFoulModalOpen, playSound]);

    /** Gestiona el flujo paso a paso de una lesión. */
    const handleInjuryAction = useCallback((action: 'next' | 'back') => {
        handleInjuryActionLogic({
            injuryState, setInjuryState,
            liveHomeTeam, liveOpponentTeam,
            setLiveHomeTeam, setLiveOpponentTeam,
            updatePlayerStatus, updatePlayerSppAndAction,
            logEvent, setIsInjuryModalOpen,
            setIsApothecaryModalOpen, initialInjuryState, playSound
        }, action);
    }, [injuryState, setInjuryState, liveHomeTeam, liveOpponentTeam, setLiveHomeTeam, setLiveOpponentTeam, updatePlayerStatus, updatePlayerSppAndAction, logEvent, setIsInjuryModalOpen, setIsApothecaryModalOpen, playSound]);

    // ─── ACCIONES DE UI ──────────────────────────────────────────────────────

    /** Abre el modal de información de una skill. */
    const handleSkillClick = useCallback((skillName: string) => {
        const cleanedName = (skillName || '').split('(')[0].trim();
        const foundSkill = skillsData.find(s => s.name.toLowerCase().startsWith(cleanedName.toLowerCase()));
        if (foundSkill) setSelectedSkillForModal(foundSkill);
    }, [setSelectedSkillForModal]);

    /** Alterna al portador del balón. */
    const handleBallToggle = useCallback((playerId: number) => {
        setBallCarrierId(prev => prev === playerId ? null : playerId);
    }, [setBallCarrierId]);

    /** Actualiza una condición S3 (Distraído / Indigestión) de un jugador. */
    const handleUpdatePlayerCondition = useCallback((
        playerId: number,
        teamId: 'home' | 'opponent',
        field: 'isDistracted' | 'hasIndigestion'
    ) => {
        const setTeam = teamId === 'home' ? setLiveHomeTeam : setLiveOpponentTeam;
        const targetTeam = teamId === 'home' ? liveHomeTeam : liveOpponentTeam;
        const player = targetTeam?.players.find(p => p.id === playerId);

        setTeam(prev => {
            if (!prev) return null;
            return { ...prev, players: prev.players.map(p => p.id === playerId ? { ...p, [field]: !p[field] } : p) };
        });

        if (selectedPlayerForAction?.id === playerId) {
            setSelectedPlayerForAction(prev => prev ? ({ ...prev, [field]: !prev[field] }) : null);
        }

        const conditionName = field === 'isDistracted' ? 'Distraído' : 'Indigestión';
        const isNowActive = player && !player[field];
        logEvent(
            'INFO',
            isNowActive
                ? `¡INCIDENCIA S3! ${player?.customName} sufre de ${conditionName}.`
                : `${player?.customName} ya no está ${conditionName}.`,
            { team: teamId, player: playerId }
        );
    }, [setLiveHomeTeam, setLiveOpponentTeam, liveHomeTeam, liveOpponentTeam, selectedPlayerForAction, logEvent, setSelectedPlayerForAction]);

    /** Abre el modal de SPP para el tipo indicado. */
    const openSppModal = useCallback((type: SppModalType) => {
        setSppModalState({ isOpen: true, type, step: 'select_team', teamId: null, selectedPlayer: null });
    }, [setSppModalState]);

    /** Registra una acción estratégica del turno (blitz, pase, falta, manos). */
    const handleStrategicAction = useCallback((action: 'blitz' | 'pass' | 'foul' | 'handoff') => {
        if (turnActions[activeTeamId][action]) return;
        if (action === 'foul') setIsFoulModalOpen(true);
        else if (action === 'pass') openSppModal('pass');

        setTurnActions(prev => ({
            ...prev,
            [activeTeamId]: { ...prev[activeTeamId], [action]: true }
        }));
        const teamName = activeTeamId === 'home' ? liveHomeTeam?.name : liveOpponentTeam?.name;
        logEvent('INFO', `${teamName} usa su acción de ${action.toUpperCase()} este turno.`);
    }, [activeTeamId, turnActions, liveHomeTeam, liveOpponentTeam, logEvent, setIsFoulModalOpen, openSppModal, setTurnActions]);

    /** Registra un touchdown y avanza el estado del partido. */
    const handleSelectTdScorer = useCallback((scorer: ManagedPlayer) => {
        if (!tdModalTeam || !liveHomeTeam || !liveOpponentTeam) return;
        const teamName = tdModalTeam === 'home' ? liveHomeTeam.name : liveOpponentTeam.name;

        logEvent('touchdown', `¡${scorer.customName} anota un TD para ${teamName}!`, { team: tdModalTeam, player: scorer.id });
        setScore(s => ({ ...s, [tdModalTeam]: s[tdModalTeam] + 1 }));
        playSound('td');
        updatePlayerSppAndAction(scorer, tdModalTeam, 3, 'TD', `anotar un TD para ${teamName}`);
        setIsTdModalOpen(false);
        setTdModalTeam(null);

        const currentTurn = turn === 0 ? 1 : turn;
        if (currentTurn >= 8 && half === 1) {
            handleHalftime();
        } else if (currentTurn >= 8 && half === 2) {
            logEvent('INFO', '¡Fin del partido!');
            setGameState('post_game');
        } else {
            setGameState('ko_recovery');
        }
    }, [tdModalTeam, liveHomeTeam, liveOpponentTeam, logEvent, setScore, playSound, updatePlayerSppAndAction, setIsTdModalOpen, setTdModalTeam, turn, half, handleHalftime, setGameState]);

    /** Alterna el estado Activo/Reserva de un jugador durante el despliegue. */
    const handlePlayerStatusToggle = useCallback((player: ManagedPlayer, teamId: 'home' | 'opponent') => {
        const setTeam = teamId === 'home' ? setLiveHomeTeam : setLiveOpponentTeam;
        setTeam(prevTeam => {
            if (!prevTeam) return null;
            const newStatus: PlayerStatus = player.status === 'Activo' ? 'Reserva' : 'Activo';

            if (newStatus === 'Activo' && prevTeam.players.filter(p => p.status === 'Activo').length >= 11) {
                return prevTeam; // sin alert — la UI debe indicarlo visualmente
            }

            return {
                ...prevTeam,
                players: prevTeam.players.map(p =>
                    p.id === player.id ? { ...p, status: newStatus } : p
                )
            };
        });
    }, [setLiveHomeTeam, setLiveOpponentTeam]);

    /** Mueve un jugador en el campo táctico validando colisiones. */
    const handlePlayerMove = useCallback((
        teamId: 'home' | 'opponent',
        playerId: number,
        newPos: { x: number; y: number }
    ) => {
        const setTeam = teamId === 'home' ? setLiveHomeTeam : setLiveOpponentTeam;
        setTeam(prev => {
            if (!prev) return null;
            const isOccupied = prev.players.some(
                p => p.id !== playerId &&
                    p.fieldPosition?.x === newPos.x &&
                    p.fieldPosition?.y === newPos.y
            );
            if (isOccupied) return prev;
            return { ...prev, players: prev.players.map(p => p.id === playerId ? { ...p, fieldPosition: newPos } : p) };
        });
    }, [setLiveHomeTeam, setLiveOpponentTeam]);

    /** Usa un reroll del equipo indicado. */
    const useReroll = useCallback((teamId: 'home' | 'opponent') => {
        const team = teamId === 'home' ? liveHomeTeam : liveOpponentTeam;
        const setTeam = teamId === 'home' ? setLiveHomeTeam : setLiveOpponentTeam;
        if (team && (team.liveRerolls || 0) > 0) {
            setTeam(prev => prev ? ({ ...prev, liveRerolls: (prev.liveRerolls || 1) - 1 }) : null);
            logEvent('INFO', `${team.name} ha usado una Segunda Oportunidad.`);
        }
    }, [liveHomeTeam, liveOpponentTeam, setLiveHomeTeam, setLiveOpponentTeam, logEvent]);

    // ─── PRE-GAME ACTIONS ────────────────────────────────────────────────────

    /** Confirma los sustitutos pendientes y avanza el paso de pre_game. */
    const handleConfirmJourneymen = useCallback(() => {
        const { pendingJourneymen, setPendingJourneymen, setJourneymenNotification, setPreGameStep } = state as any;
        if (pendingJourneymen.home.length > 0 && liveHomeTeam) {
            setLiveHomeTeam((prev: any) => prev ? ({ ...prev, players: [...prev.players, ...pendingJourneymen.home] }) : null);
            logEvent('INFO', `${liveHomeTeam.name} añade ${pendingJourneymen.home.length} Sustituto(s).`);
        }
        if (pendingJourneymen.opponent.length > 0 && liveOpponentTeam) {
            setLiveOpponentTeam((prev: any) => prev ? ({ ...prev, players: [...prev.players, ...pendingJourneymen.opponent] }) : null);
            logEvent('INFO', `${liveOpponentTeam.name} añade ${pendingJourneymen.opponent.length} Sustituto(s).`);
        }
        setJourneymenNotification(null);
        setPendingJourneymen({ home: [], opponent: [] });
        setPreGameStep(1);
    }, [liveHomeTeam, liveOpponentTeam, setLiveHomeTeam, setLiveOpponentTeam, logEvent, state]);

    /** Transiciona de pre_game a in_progress al inicio de cada drive. */
    const handleStartDrive = useCallback(() => {
        const { setPreGameStep } = state as any;
        setGameState('in_progress');
        const isFirstTurnOfHalf = turn === 0;
        if (isFirstTurnOfHalf) {
            setTurn(1);
            logEvent('INFO', half === 1 ? '¡Comienza el partido!' : '¡Comienza la segunda parte!');
        } else {
            logEvent('INFO', `Comienza la patada del turno ${turn}.`);
        }
    }, [turn, half, setTurn, setGameState, logEvent, state]);

    /** Registra un turnover y avanza al siguiente turno. */
    const handleTurnover = useCallback((reason: string) => {
        logEvent('TURNOVER', `Cambio de turno: ${reason}.`);
        playSound('turnover');
        (state as any).setIsTurnoverModalOpen(false);
        handleNextTurn();
    }, [logEvent, playSound, handleNextTurn, state]);

    /** Compra un incentivo del mercado de pre_game. */
    const handleBuyInducement = useCallback((name: string, cost: number) => {
        const { inducementState, setInducementState } = state as any;
        if (inducementState.money < cost) return;
        const underdogTeam = inducementState.underdog === 'home' ? liveHomeTeam : liveOpponentTeam;
        const setTeam = inducementState.underdog === 'home' ? setLiveHomeTeam : setLiveOpponentTeam;

        setInducementState((prev: any) => ({ ...prev, money: prev.money - cost }));

        const fieldMap: Record<string, string> = {
            reroll: 'liveRerolls', bribe: 'tempBribes', cheerleader: 'tempCheerleaders',
            coach: 'tempAssistantCoaches', wanderingApothecary: 'wanderingApothecaries',
            mortuaryAssistant: 'mortuaryAssistants', plagueDoctor: 'plagueDoctors'
        };

        if (name === 'biasedRef') {
            setTeam((prev: any) => prev ? ({ ...prev, biasedRef: true }) : null);
        } else if (fieldMap[name]) {
            setTeam((prev: any) => prev ? ({ ...prev, [fieldMap[name]]: (prev[fieldMap[name]] || 0) + 1 }) : null);
        }
        logEvent('INFO', `Incentivo comprado: ${name} (${cost / 1000}k) para ${underdogTeam?.name}.`);
    }, [liveHomeTeam, liveOpponentTeam, setLiveHomeTeam, setLiveOpponentTeam, logEvent, state]);

    /** Vende (devuelve) un incentivo del mercado de pre_game. */
    const handleSellInducement = useCallback((name: string, cost: number) => {
        const { inducementState, setInducementState } = state as any;
        const setTeam = inducementState.underdog === 'home' ? setLiveHomeTeam : setLiveOpponentTeam;
        const underdogTeam = inducementState.underdog === 'home' ? liveHomeTeam : liveOpponentTeam;

        const fieldMap: Record<string, string> = {
            reroll: 'liveRerolls', bribe: 'tempBribes', cheerleader: 'tempCheerleaders',
            coach: 'tempAssistantCoaches', wanderingApothecary: 'wanderingApothecaries',
            mortuaryAssistant: 'mortuaryAssistants', plagueDoctor: 'plagueDoctors'
        };

        if (name === 'biasedRef') {
            setTeam((prev: any) => {
                if (!prev?.biasedRef) return prev;
                setInducementState((p: any) => ({ ...p, money: p.money + cost }));
                return { ...prev, biasedRef: false };
            });
        } else if (fieldMap[name]) {
            setTeam((prev: any) => {
                if (!prev || (prev[fieldMap[name]] || 0) <= 0) return prev;
                setInducementState((p: any) => ({ ...p, money: p.money + cost }));
                return { ...prev, [fieldMap[name]]: (prev[fieldMap[name]] || 1) - 1 };
            });
        }
        logEvent('INFO', `Incentivo devuelto: ${name} (+${cost / 1000}k) de ${underdogTeam?.name}.`);
    }, [liveHomeTeam, liveOpponentTeam, setLiveHomeTeam, setLiveOpponentTeam, logEvent, state]);

    /** Contrata un jugador estrella con los fondos disponibles. */
    const handleHireStar = useCallback((star: any) => {
        const { inducementState, setInducementState } = state as any;
        if (inducementState.money < star.cost) return;
        const setTeam = inducementState.underdog === 'home' ? setLiveHomeTeam : setLiveOpponentTeam;
        const underdogTeam = inducementState.underdog === 'home' ? liveHomeTeam : liveOpponentTeam;
        const starPlayer = {
            ...star,
            id: Date.now(),
            customName: star.name,
            spp: 0,
            gainedSkills: [],
            lastingInjuries: [],
            isStarPlayer: true,
            status: 'Reserva'
        };
        setTeam((prev: any) => prev ? ({ ...prev, players: [...prev.players, starPlayer] }) : null);
        setInducementState((prev: any) => ({
            ...prev,
            money: prev.money - star.cost,
            hiredStars: [...prev.hiredStars, star]
        }));
        logEvent('INFO', `Jugador Estrella contratado: ${star.name} (${star.cost / 1000}k) para ${underdogTeam?.name}.`);
    }, [liveHomeTeam, liveOpponentTeam, setLiveHomeTeam, setLiveOpponentTeam, logEvent, state]);

    /** Despide un jugador estrella contratado. */
    const handleFireStar = useCallback((star: any) => {
        const { inducementState, setInducementState } = state as any;
        const setTeam = inducementState.underdog === 'home' ? setLiveHomeTeam : setLiveOpponentTeam;
        setTeam((prev: any) => prev ? ({ ...prev, players: prev.players.filter((p: any) => !p.isStarPlayer || p.customName !== star.name) }) : null);
        setInducementState((prev: any) => ({
            ...prev,
            money: prev.money + star.cost,
            hiredStars: prev.hiredStars.filter((s: any) => s.name !== star.name)
        }));
        logEvent('INFO', `Jugador Estrella despedido: ${star.name} (+${star.cost / 1000}k devueltos).`);
    }, [setLiveHomeTeam, setLiveOpponentTeam, logEvent, state]);

    /** Auto-selecciona los mejores 11 jugadores disponibles para el despliegue. */
    const handleAutoSelectTeam = useCallback((teamId: 'home' | 'opponent') => {
        const setTeam = teamId === 'home' ? setLiveHomeTeam : setLiveOpponentTeam;
        setTeam((prev: any) => {
            if (!prev) return null;
            const available = prev.players
                .filter((p: any) => p.status !== 'Muerto' && p.status !== 'Lesionado' && !(p.missNextGame > 0))
                .sort((a: any, b: any) => (b.spp || 0) - (a.spp || 0));
            const starters = new Set(available.slice(0, 11).map((p: any) => p.id));
            return {
                ...prev,
                players: prev.players.map((p: any) => ({
                    ...p,
                    status: starters.has(p.id) ? 'Activo' : (p.status === 'Muerto' || p.status === 'Lesionado' || p.status === 'Expulsado' ? p.status : 'Reserva')
                }))
            };
        });
        const teamName = teamId === 'home' ? liveHomeTeam?.name : liveOpponentTeam?.name;
        logEvent('INFO', `${teamName}: 11 inicial sugerido.`);
    }, [setLiveHomeTeam, setLiveOpponentTeam, liveHomeTeam, liveOpponentTeam, logEvent]);

    /** Maneja la selección de equipo (local o visitante), gestionando snapshots en modo amistoso. */
    const handleSelectTeamInternal = useCallback((team: ManagedTeam, side: 'home' | 'opponent') => {
        const { setSelectingSnapshotFor, setHomeTeam, setOpponentTeam, matchMode } = state as any;
        
        if (matchMode === 'friendly' && team.snapshots && team.snapshots.length > 0) {
            setSelectingSnapshotFor({ team, side });
        } else {
            if (side === 'home') {
                setHomeTeam(team);
            } else {
                const fullPlayers: ManagedPlayer[] = team.players.map(p => ({ 
                    ...p, 
                    status: 'Reserva' as PlayerStatus 
                }));
                setOpponentTeam({ ...team, players: fullPlayers });
            }
        }
    }, [state]);

    /** Procesa los datos decodificados de un código QR para importar un equipo oponente. */
    const handleProcessQrCode = useCallback((decodedText: string) => {
        const { setOpponentTeam } = state as any;
        try {
            const parsedTeam = JSON.parse(decodedText);
            const isNewFormat = 'n' in parsedTeam && 'rN' in parsedTeam;
            const teamName = isNewFormat ? parsedTeam.n : parsedTeam.name;
            const rosterName = isNewFormat ? parsedTeam.rN : parsedTeam.rosterName;

            if (!teamName || !rosterName) {
                throw new Error('Código QR no válido: Faltan datos esenciales.');
            }

            const baseTeam = teamsData.find((t: any) => t.name === rosterName);
            if (!baseTeam) {
                throw new Error(`Facción "${rosterName}" no encontrada.`);
            }

            const playersData = isNewFormat ? parsedTeam.pl : parsedTeam.players;
            const fullPlayers: ManagedPlayer[] = playersData.map((p: any, i: number) => {
                const position = isNewFormat ? p.p : p.position;
                const basePlayer = baseTeam.roster.find((bp: any) => bp.position === position);
                if (!basePlayer) throw new Error(`Jugador "${position}" no encontrado.`);
                return { 
                    ...basePlayer, 
                    id: Date.now() + i, 
                    customName: (isNewFormat ? p.cN : p.customName) || basePlayer.position, 
                    spp: (isNewFormat ? p.s : p.spp) || 0, 
                    gainedSkills: (isNewFormat ? p.gS : p.gainedSkills) || [], 
                    lastingInjuries: (isNewFormat ? p.lI : p.lastingInjuries) || [], 
                    status: 'Reserva' 
                };
            });

            const opponentWithDefaults: ManagedTeam = { 
                name: teamName, 
                rosterName: rosterName, 
                treasury: (isNewFormat ? parsedTeam.t : parsedTeam.treasury) || 0, 
                rerolls: (isNewFormat ? parsedTeam.rr : parsedTeam.rerolls) || 0, 
                dedicatedFans: (isNewFormat ? parsedTeam.df : parsedTeam.dedicatedFans) || 1, 
                cheerleaders: (isNewFormat ? parsedTeam.ch : parsedTeam.cheerleaders) || 0, 
                assistantCoaches: (isNewFormat ? parsedTeam.ac : parsedTeam.assistantCoaches) || 0, 
                apothecary: (isNewFormat ? parsedTeam.ap : parsedTeam.apothecary) || false, 
                players: fullPlayers 
            };

            setOpponentTeam(opponentWithDefaults);
            return true;
        } catch (e: any) {
            alert(`Error al procesar el código QR: ${e instanceof Error ? e.message : 'Error desconocido.'}`);
            return false;
        }
    }, [state]);

    /** Sugiere un despliegue táctico en el MiniField para ambos equipos. */
    const handleSuggestDeployment = useCallback(() => {
        const suggestForTeam = (setTeam: any) => {
            setTeam((prev: any) => {
                if (!prev) return null;
                const active = prev.players.filter((p: any) => p.status === 'Activo');
                const cols = [1, 2, 3, 4, 5, 6, 7];
                const updatedPlayers = prev.players.map((p: any) => {
                    if (p.status !== 'Activo') return p;
                    const idx = active.findIndex((a: any) => a.id === p.id);
                    return { ...p, fieldPosition: { x: cols[idx % cols.length] || 1, y: Math.floor(idx / 7) + 1 } };
                });
                return { ...prev, players: updatedPlayers };
            });
        };
        suggestForTeam(setLiveHomeTeam);
        suggestForTeam(setLiveOpponentTeam);
        logEvent('INFO', 'Despliegue sugerido aplicado a ambos equipos.');
    }, [setLiveHomeTeam, setLiveOpponentTeam, logEvent]);

    /** Maneja la tirada de recuperación de un jugador KO. 4+ recupera al banquillo. */
    const rollKoRecovery = useCallback((player: any) => {
        const { setKoRecoveryRolls } = state as any;
        const roll = Math.floor(Math.random() * 6) + 1;
        const success = roll >= 4;
        
        setKoRecoveryRolls((prev: any) => ({ ...prev, [player.id]: { roll, success } }));
        
        if (success) {
            const teamId = liveHomeTeam?.players.some(p => p.id === player.id) ? 'home' : 'opponent';
            updatePlayerStatus(player.id, teamId, 'Reserva');
        }
    }, [state, liveHomeTeam, updatePlayerStatus]);

    /** Reinicia el estado necesario para comenzar una nueva patada tras un TD o fin de mitad. */
    const handleStartNextDrive = useCallback(() => {
        const { setKoRecoveryRolls, setGameStatus, setTurn, setPreGameStep } = state as any;
        
        setKoRecoveryRolls({});
        setGameStatus((prev: any) => ({ 
            ...prev, 
            kickoffEvent: null, 
            receivingTeam: prev.receivingTeam === 'home' ? 'opponent' : 'home' 
        }));
        setTurn((t: number) => t + 1);
        setPreGameStep(2); // Deployment
        setGameState('pre_game');
    }, [state, setGameState]);

    /** Resetea todo el estado del partido a sus valores iniciales. */
    const resetGameState = useCallback(() => {
        const {
            setLiveHomeTeam, setLiveOpponentTeam, setGameLog, setScore,
            setTurn, setHalf, setCurrentChronicle, setFame, setFansRoll,
            setPreGameStep, setGameStatus, setKickoffActionCompleted,
            setInducementState, setFirstHalfReceiver, setPlayersMissingNextGame,
            setBallCarrierId, setKoRecoveryRolls, setFoulState, setInjuryState,
            setSelectedPlayerForAction, setSppModalState, setIsMatchSummaryOpen,
            setActiveTab, setActiveTeamId, setRosterViewId, setJourneymenNotification,
            setPendingJourneymen, setMatchMode
        } = state as any;

        setLiveHomeTeam(null);
        setLiveOpponentTeam(null);
        setGameLog([]);
        setScore({ home: 0, opponent: 0 });
        setTurn(0);
        setHalf(1);
        setCurrentChronicle(null);
        setFame({ home: 0, opponent: 0 });
        setFansRoll({ home: '', opponent: '' });
        setPreGameStep(0);
        setGameStatus({ weather: null, kickoffEvent: null, coinTossWinner: null, receivingTeam: null });
        setKickoffActionCompleted(false);
        setInducementState({ underdog: null, money: 0, hiredStars: [] });
        setFirstHalfReceiver(null);
        setPlayersMissingNextGame([]);
        setBallCarrierId(null);
        setKoRecoveryRolls({});
        setFoulState(initialFoulState);
        setInjuryState(initialInjuryState);
        setSelectedPlayerForAction(null);
        setSppModalState({ isOpen: false, type: null, step: 'select_team', teamId: null, selectedPlayer: null });
        setIsMatchSummaryOpen(false);
        setActiveTab('assistant');
        setActiveTeamId('home');
        setRosterViewId('home');
        setJourneymenNotification(null);
        setPendingJourneymen({ home: [], opponent: [] });
        setMatchMode('competition');
        setGameState('setup');
    }, [state, setGameState]);

    /** Finaliza el partido, guarda reportes y actualiza el equipo en la liga. */
    const handleConfirmPostGame = useCallback(async (finalTeamState: any) => {
        const {
            matchMode, score, fame, gameLog, gameStatus,
            concessionState, currentChronicle
        } = state as any;
        const { onMatchReportCreate, onTeamUpdate } = _props;

        if (!homeTeam) return;

        if (matchMode === 'friendly') {
            logEvent('INFO', 'Partido Amistoso finalizado. No se guardarán cambios permanentes.');
        } else {
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
                history: [historyEntry, ...(finalTeamState.history || [])].slice(0, 20),
                record: {
                    wins: (finalTeamState.record?.wins || 0) + (matchResult === 'W' ? 1 : 0),
                    draws: (finalTeamState.record?.draws || 0) + (matchResult === 'D' ? 1 : 0),
                    losses: (finalTeamState.record?.losses || 0) + (matchResult === 'L' ? 1 : 0),
                }
            };

            if (onMatchReportCreate && liveHomeTeam && liveOpponentTeam) {
                const stats = {
                    passes: {
                        home: gameLog.filter((e: any) => e.team === 'home' && (e.type === 'pass_complete' || e.type === 'PASS')).length,
                        opponent: gameLog.filter((e: any) => e.team === 'opponent' && (e.type === 'pass_complete' || e.type === 'PASS')).length
                    },
                    interceptions: {
                        home: gameLog.filter((e: any) => e.team === 'home' && (e.type === 'interception' || e.type === 'INTERCEPTION')).length,
                        opponent: gameLog.filter((e: any) => e.team === 'opponent' && (e.type === 'interception' || e.type === 'INTERCEPTION')).length
                    },
                    fouls: {
                        home: gameLog.filter((e: any) => e.team === 'home' && (e.type === 'foul_attempt' || e.type === 'FOUL')).length,
                        opponent: gameLog.filter((e: any) => e.team === 'opponent' && (e.type === 'foul_attempt' || e.type === 'FOUL')).length
                    },
                    expulsions: {
                        home: gameLog.filter((e: any) => e.team === 'home' && (e.type === 'player_sent_off' || e.type === 'EXPULSION')).length,
                        opponent: gameLog.filter((e: any) => e.team === 'opponent' && (e.type === 'player_sent_off' || e.type === 'EXPULSION')).length
                    },
                    casualties: {
                        home: gameLog.filter((e: any) => e.team === 'home' && (e.type === 'injury_casualty' || e.type === 'INJURY' || e.type === 'DEATH')).length,
                        opponent: gameLog.filter((e: any) => e.team === 'opponent' && (e.type === 'injury_casualty' || e.type === 'INJURY' || e.type === 'DEATH')).length
                    },
                    rerollsUsed: {
                        home: gameLog.filter((e: any) => e.team === 'home' && e.type === 'reroll_used').length,
                        opponent: gameLog.filter((e: any) => e.team === 'opponent' && e.type === 'reroll_used').length
                    }
                };

                const baseSpectators = (fame.home + fame.opponent) * 1000 + 10000;
                const spectators = isNaN(baseSpectators) ? 10000 : baseSpectators;
                const baseReport: any = {
                    date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
                    homeTeam: { id: homeTeam.id, name: liveHomeTeam.name, rosterName: liveHomeTeam.rosterName, score: score.home, crestImage: liveHomeTeam.crestImage },
                    opponentTeam: { id: opponentTeam?.id, name: liveOpponentTeam?.name || 'Desconocido', rosterName: liveOpponentTeam?.rosterName || 'Rival', score: score.opponent, crestImage: liveOpponentTeam?.crestImage },
                    gameLog,
                    weather: gameStatus.weather?.title,
                    winner: score.home > score.opponent ? 'home' : score.home < score.opponent ? 'opponent' : 'draw',
                    stats,
                    spectators,
                    wasConceded: concessionState
                };

                let finalNewsData;
                if (currentChronicle) {
                    const parts = currentChronicle.split('\n\n');
                    finalNewsData = { headline: parts[0] || 'CRÓNICA DE COMBATE', article: parts.slice(1).join('\n\n'), summary: `Final: ${liveHomeTeam.name} ${score.home} - ${score.opponent} ${liveOpponentTeam?.name}` };
                } else {
                    finalNewsData = (await import('../../../../utils/newsGenerator')).generateMatchArticle(baseReport as any);
                }

                const reportId = await onMatchReportCreate({ ...baseReport, ...finalNewsData });
                if (reportId) historyEntry.id = reportId;
            }

            onTeamUpdate(finalTeamWithStats);
        }

        resetGameState();
    }, [state, _props, homeTeam, opponentTeam, liveHomeTeam, liveOpponentTeam, logEvent, resetGameState]);

    return {
        logEvent,
        updatePlayerStatus,
        updatePlayerSppAndAction,
        handleHalftime,
        handleNextTurn,
        handleFoulAction,
        handleInjuryAction,
        handleSkillClick,
        handleBallToggle,
        handleUpdatePlayerCondition,
        openSppModal,
        handleStrategicAction,
        handleSelectTdScorer,
        handlePlayerStatusToggle,
        handlePlayerMove,
        useReroll,
        // Pre-game
        handleConfirmJourneymen,
        handleStartDrive,
        handleTurnover,
        handleBuyInducement,
        handleSellInducement,
        handleHireStar,
        handleFireStar,
        handleAutoSelectTeam,
        handleSuggestDeployment,
        handleSelectTeamInternal,
        handleProcessQrCode,
        // Post-game & Recovery
        handleConfirmPostGame,
        resetGameState,
        rollKoRecovery,
        handleStartNextDrive
    };
};
