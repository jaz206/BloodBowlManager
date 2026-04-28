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
import { handleHalftimeLogic, handleNextTurnLogic, checkStalling } from '../engine/matchEngine';
import { skillsData } from '../../../../data/skills';
import { weatherConditions } from '../../../../data/weather';
import { useMasterData } from '../../../../hooks/useMasterData';

/**
 * useMatchActions — encapsula toda la lógica de acciones del partido.
 * Recibe el estado del hook useMatchState y retorna funciones de acción memoizadas.
 */
export const useMatchActions = (state: ReturnType<typeof useMatchState>, _props: GameBoardProps) => {
    const { teams } = useMasterData();
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
        tdModalTeam, setInteractionState, setIsTurnoverModalOpen, setRosterViewId,
        setIsWeatherModalOpen, setIsChangingWeatherModalOpen, setWeatherRerollInput, weatherRerollInput,
        driveResetTarget, setDriveResetTarget
    } = state;

    // ─── HELPER S3: BRUTOS BRUTALES ──────────────────────────────────────────
    const hasBrutosBrutales = (team: ManagedTeam) => {
        const name = team.rosterName.toLowerCase();
        return name.includes('khorne') || name.includes('orcos negros') || name.includes('black orcs');
    };

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

const updatePlayerSppAndAction = useCallback((
    player: ManagedPlayer,
    teamId: 'home' | 'opponent',
    action: SppActionType,
    description: string,
    sppOverride?: number
) => {
    const arenaSpp = state.arenaConfig.spp;
    let finalSpp = sppOverride !== undefined ? sppOverride : 0;

    if (sppOverride === undefined) {
        switch (action) {
            case 'TD': finalSpp = arenaSpp.touchdown; break;
            case 'CASUALTY': finalSpp = arenaSpp.casualty; break;
            case 'PASS': finalSpp = arenaSpp.pass; break;
            case 'HANDOFF': finalSpp = arenaSpp.handoff; break;
            case 'MVP': finalSpp = arenaSpp.mvp; break;
            case 'INT': finalSpp = 2; break; 
            case 'INTERFERENCE': finalSpp = 2; break;
            case 'DEFLECT': finalSpp = 1; break;
            case 'THROW_TEAM_MATE': finalSpp = 1; break;
            default: finalSpp = 0;
        }
    }
    
    const team = teamId === 'home' ? liveHomeTeam : liveOpponentTeam;
    
    if (team && hasBrutosBrutales(team)) {
        if (action === 'TD') finalSpp = 2; // Fixed logic for Brutos Brutales if they exist
        if (action === 'CASUALTY') finalSpp = 3;
    }

    updatePlayerSppActionLogic(
        { setLiveHomeTeam, setLiveOpponentTeam, logEvent, setSppModalState },
        player, teamId, finalSpp, action, description
    );
}, [state.arenaConfig, setLiveHomeTeam, setLiveOpponentTeam, logEvent, setSppModalState, liveHomeTeam, liveOpponentTeam]);

    // ─── FLUJO DE PARTIDO ────────────────────────────────────────────────────

    /** Gestiona la transición al descanso (Half Time). */
    const handleHalftime = useCallback(() => {
        const { setPreGameStep } = state as any;
        handleHalftimeLogic({
            turn, half, setTurn, setHalf, logEvent,
            setGameStatus, firstHalfReceiver,
            homeTeam, opponentTeam, setGameState,
            setInteractionState
        });
        setPreGameStep(2);
    }, [state, turn, half, setTurn, setHalf, logEvent, setGameStatus, firstHalfReceiver, homeTeam, opponentTeam, setGameState, setInteractionState]);

    /** Avanza al siguiente turno alternando el equipo activo. */
    const handleNextTurn = useCallback(() => {
        // RESET ACTIVATIONS
        const resetActivations = (setTeam: any) => {
            setTeam((prev: ManagedTeam | null) => {
                if (!prev) return null;
                return { ...prev, players: prev.players.map(p => ({ ...p, isActivated: false })) };
            });
        };
        resetActivations(setLiveHomeTeam);
        resetActivations(setLiveOpponentTeam);

        handleNextTurnLogic({
            activeTeamId, setTurn, setActiveTeamId,
            setTurnActions, half, handleHalftime, setGameState, logEvent
        });
        
        // El Oráculo sincroniza automáticamente la vista de plantilla con el equipo activo
        const nextActiveTeamId = activeTeamId === 'home' ? 'opponent' : 'home';
        setRosterViewId(nextActiveTeamId);
        setSelectedPlayerForAction(null);
    }, [activeTeamId, setTurn, setActiveTeamId, setTurnActions, half, handleHalftime, setGameState, logEvent, setLiveHomeTeam, setLiveOpponentTeam, setSelectedPlayerForAction, setRosterViewId]);

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

    /** Registra un turnover y avanza al siguiente turno. */
    const handleTurnover = useCallback((reason: string) => {
        logEvent('TURNOVER', `¡Fin de turno! ${reason}.`);
        playSound('turnover');
        setIsTurnoverModalOpen(false);
        handleNextTurn();
    }, [logEvent, playSound, handleNextTurn, setIsTurnoverModalOpen]);

    /** Gestiona el flujo paso a paso de una lesión. */
    const handleInjuryAction = useCallback((action: 'next' | 'back') => {
        handleInjuryActionLogic({
            injuryState, setInjuryState,
            liveHomeTeam, liveOpponentTeam,
            setLiveHomeTeam, setLiveOpponentTeam,
            updatePlayerStatus, updatePlayerSppAndAction,
            logEvent, setIsInjuryModalOpen,
            setIsApothecaryModalOpen, handleTurnover, initialInjuryState, playSound,
            turn
        }, action);
    }, [injuryState, setInjuryState, liveHomeTeam, liveOpponentTeam, setLiveHomeTeam, setLiveOpponentTeam, updatePlayerStatus, updatePlayerSppAndAction, logEvent, setIsInjuryModalOpen, setIsApothecaryModalOpen, handleTurnover, playSound, turn]);

    // ─── ACCIONES DE UI ──────────────────────────────────────────────────────

    const handleSkillClick = useCallback((skillName: string) => {
        if (!skillName) return;
        const name = skillName.trim();
        const baseName = name.split('(')[0].trim().toLowerCase();
        
        // 1. Búsqueda por coincidencia exacta o Key EN
        let found = skillsData.find(s => 
            (s.keyEN && s.keyEN.toLowerCase() === name.toLowerCase()) ||
            (s.name_en && s.name_en.toLowerCase() === name.toLowerCase()) ||
            (s.name_es && s.name_es.toLowerCase() === name.toLowerCase())
        );
        
        // 2. Búsqueda por el nombre "limpio" (sin +1, +2 o puntuación)
        if (!found) {
            found = skillsData.find(s => 
                (s.keyEN && s.keyEN.toLowerCase().startsWith(baseName)) ||
                (s.name_en && s.name_en.toLowerCase().startsWith(baseName)) ||
                (s.name_es && s.name_es.toLowerCase().startsWith(baseName))
            );
        }

        if (found) {
            setSelectedSkillForModal(found);
            console.log(`[handleSkillClick] Mostrando: ${found.name_es} / ${found.name_en}`);
        } else {
            console.warn(`[handleSkillClick] No se encontró definición para: "${skillName}"`);
        }
    }, [setSelectedSkillForModal]);

    /** Alterna al portador del balón. */
    const handleBallToggle = useCallback((playerId: number) => {
        setBallCarrierId(prev => prev === playerId ? null : playerId);
    }, [setBallCarrierId]);

    /** Deselecciona al jugador actual. */
    const handleDeselectPlayer = useCallback(() => {
        setSelectedPlayerForAction(null);
    }, [setSelectedPlayerForAction]);

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
    const handleSelectTdScorer = useCallback((scorer: ManagedPlayer, teamIdOverride?: 'home' | 'opponent') => {
        const teamId = teamIdOverride || tdModalTeam;
        if (!teamId || !liveHomeTeam || !liveOpponentTeam) return;
        const teamName = teamId === 'home' ? liveHomeTeam.name : liveOpponentTeam.name;

        logEvent('touchdown', `¡${scorer.customName} anota un TD para ${teamName}!`, { team: teamId, player: scorer.id });
        setScore(s => ({ ...s, [teamId]: s[teamId] + 1 }));
        playSound('td');
        updatePlayerSppAndAction(scorer, teamId, 'TD', `anotar un TD para ${teamName}`);
        setIsTdModalOpen(false);
        setTdModalTeam(null);

        const currentTurn = turn === 0 ? 1 : turn;
        const nextResetTarget =
            currentTurn >= 8
                ? (half === 1 ? 'halftime' : 'post_game')
                : 'next_drive';

        setDriveResetTarget(nextResetTarget);
        setGameState('ko_recovery');
    }, [tdModalTeam, liveHomeTeam, liveOpponentTeam, logEvent, setScore, playSound, updatePlayerSppAndAction, setIsTdModalOpen, setTdModalTeam, turn, half, setDriveResetTarget, setGameState]);

    /** Resuelve daño automático de una caída o tropiezo. */
    const resolveAutomaticFallDamage = useCallback((player: ManagedPlayer, teamId: 'home' | 'opponent') => {
        const setTeam = teamId === 'home' ? setLiveHomeTeam : setLiveOpponentTeam;
        const armorValue = Number.parseInt(String(player.stats.AR).replace('+', ''), 10);
        const armorRoll = (Math.floor(Math.random() * 6) + 1) + (Math.floor(Math.random() * 6) + 1);

        if (Number.isNaN(armorValue)) {
            logEvent('WARNING', `Caída de ${player.customName}: no se pudo calcular la armadura.`);
            return;
        }

        if (armorRoll <= armorValue) {
            setTeam(prev => prev ? ({
                ...prev,
                players: prev.players.map(p => p.id === player.id ? {
                    ...p,
                    isActivated: true,
                    statusDetail: 'Derribado'
                } : p)
            }) : prev);
            logEvent('INFO', `Caída de ${player.customName}: la armadura resiste (${armorRoll} vs ${armorValue}). Queda derribado.`, { team: teamId, player: player.id });
            return;
        }

        const injuryRoll = (Math.floor(Math.random() * 6) + 1) + (Math.floor(Math.random() * 6) + 1);
        let finalStatus: PlayerStatus = 'Activo';
        let statusDetail = 'Aturdido';

        if (injuryRoll <= 7) {
            finalStatus = 'Activo';
            statusDetail = 'Aturdido';
        } else if (injuryRoll <= 9) {
            finalStatus = 'KO';
            statusDetail = 'KO';
        } else {
            finalStatus = 'Lesionado';
            statusDetail = 'Lesionado';
        }

        setTeam(prev => prev ? ({
            ...prev,
            players: prev.players.map(p => p.id === player.id ? {
                ...p,
                isActivated: true,
                status: finalStatus,
                statusDetail
            } : p)
        }) : prev);
        playSound('injury');
        logEvent(
            finalStatus === 'Lesionado' ? 'WARNING' : 'INFO',
            `Caída de ${player.customName}: armadura ${armorRoll} vs ${armorValue}, heridas ${injuryRoll} => ${statusDetail}.`,
            { team: teamId, player: player.id }
        );
    }, [setLiveHomeTeam, setLiveOpponentTeam, logEvent, playSound]);

    /** Abre el flujo de lesión para una caída accidental. */
    const openFallInjuryModal = useCallback((player: ManagedPlayer, teamId: 'home' | 'opponent') => {
        setIsInjuryModalOpen(true);
        setInjuryState({
            ...initialInjuryState,
            source: 'fall',
            autoTurnover: true,
            isCasualty: false,
            victimPlayer: player,
            victimTeamId: teamId,
            step: 'armor_roll'
        });
    }, [initialInjuryState, setInjuryState, setIsInjuryModalOpen]);

    /** Mecánica de Soborno (S3): 1 falla, 2-6 éxito. */
    const handleBribe = useCallback((teamId: 'home' | 'opponent') => {
        const setTeam = teamId === 'home' ? setLiveHomeTeam : setLiveOpponentTeam;
        const targetTeam = teamId === 'home' ? liveHomeTeam : liveOpponentTeam;
        if (!targetTeam || (targetTeam.tempBribes || 0) <= 0) return;

        const roll = Math.floor(Math.random() * 6) + 1;
        setTeam(prev => prev ? ({ ...prev, tempBribes: (prev.tempBribes || 1) - 1 }) : null);

        if (roll === 1) {
            logEvent('WARNING', `¡SOBORNO FALLIDO! El árbitro devuelve el sobre con desprecio. "${targetTeam.name} no tiene suficiente oro para mi silencio". (Dado: ${roll}).`, { team: teamId });
        } else {
            logEvent('SUCCESS', `¡SOBORNO ACEPTADO! Un guiño cómplice y el jugador vuelve al campo tras "limpiarse el uniforme". (Dado: ${roll}).`, { team: teamId });
        }
    }, [setLiveHomeTeam, setLiveOpponentTeam, liveHomeTeam, liveOpponentTeam, logEvent]);

    /** Orquestador de lógica Season 3 tras recibir resultados de dados. */
    const handleS3Action = useCallback((pending: any, result: any) => {
        const { actionType, actorId, objectiveId } = pending;
        
        let actor = (activeTeamId === 'home' ? liveHomeTeam : liveOpponentTeam)?.players.find(p => p.id === actorId);
        if (!actor) actor = (activeTeamId === 'home' ? liveOpponentTeam : liveHomeTeam)?.players.find(p => p.id === actorId);
        
        let objective = (activeTeamId === 'home' ? liveOpponentTeam : liveHomeTeam)?.players.find(p => p.id === objectiveId);
        if (!objective) objective = (activeTeamId === 'home' ? liveHomeTeam : liveOpponentTeam)?.players.find(p => p.id === objectiveId);

        if (!actor) return;

        // Log genérico de la acción registrada
        // Crónica Narrativa Elegante
        const getThematicDesc = (type: string, actor: any, obj?: any, res?: any) => {
            const flavor = {
                'BLOCK': [`¡Choque brutal! ${actor.customName} embiste a ${obj?.customName || 'su rival'}...`],
                'PASS': [`${actor.customName} otea el horizonte y lanza el esferoide...`],
                'FOUL': [`¡Juego sucio! ${actor.customName} aprovecha que el árbitro parpadea para pisar a ${obj?.customName}...`],
                'RUSH': [`${actor.customName} fuerza sus pulmones en un sprint desesperado...`],
                'DODGE': [`${actor.customName} intenta una finta elegante para zafarse...`],
                'HANDOFF': [`${actor.customName} entrega el balón en mano, ¡precisión quirúrgica!`],
                'SECURE_BALL': [`${actor.customName} se abalanza sobre el cuero para asegurarlo.`]
            }[type] || [`${actor.customName} realiza una acción de ${type}...`];
            
            return `${flavor[0]} (Resultado: ${res})`;
        };
                          
        logEvent('INFO', getThematicDesc(actionType, actor, objective, result));

        // MARCAR JUGADOR COMO ACTIVADO (S3)
        const setTeamActor = activeTeamId === 'home' ? setLiveHomeTeam : setLiveOpponentTeam;
        setTeamActor(prev => {
            if (!prev) return null;
            return { ...prev, players: prev.players.map(p => p.id === actorId ? { ...p, isActivated: true } : p) };
        });

        switch (actionType) {
            case 'TOUCHDOWN':
                handleSelectTdScorer(actor, activeTeamId);
                break;
            case 'BLOCK':
                if (result === 'Calavera') {
                    handleTurnover(`jugador ${actor.customName} derribado en placaje`);
                } else if (result === 'Ambos') {
                    // Si actor no tiene Placaje -> turnover
                    const hasBlock = actor.skillKeys.includes('BLOCK') || actor.gainedSkills.includes('BLOCK');
                    if (!hasBlock) handleTurnover(`${actor.customName} derribado por Ambos Derribados`);
                } else if (result === 'Zaca!') {
                    setIsInjuryModalOpen(true);
                    setInjuryState({
                        ...initialInjuryState,
                        attackerPlayer: actor,
                        attackerTeamId: activeTeamId,
                        victimPlayer: objective || null,
                        victimTeamId: activeTeamId === 'home' ? 'opponent' : 'home',
                        step: 'armor_roll'
                    });
                }
                break;
            case 'FOUL': {
                const roll = parseInt(result);
                if (!objective) return;
                
                // Marcar acción de falta como usada
                setTurnActions(prev => ({ ...prev, [activeTeamId]: { ...prev[activeTeamId], foul: true } }));

                const arString = objective.stats.AR;
                const arValue = parseInt(arString.replace('+', ''));
                
                if (roll > arValue) {
                    logEvent('SUCCESS', `¡ARMADURA ROTA! La falta de ${actor.customName} sobre ${objective.customName} ha funcionado (Resultado: ${roll} > AR: ${arString}).`);
                    setIsInjuryModalOpen(true);
                    setInjuryState({
                        ...initialInjuryState,
                        attackerPlayer: actor,
                        attackerTeamId: activeTeamId,
                        victimPlayer: objective,
                        victimTeamId: activeTeamId === 'home' ? 'opponent' : 'home',
                        step: 'injury_roll' // Saltamos directamente a la tirada de lesión
                    });
                } else {
                    logEvent('INFO', `La falta de ${actor.customName} no ha logrado penetrar la armadura de ${objective.customName} (Resultado: ${roll} <= AR: ${arString}).`);
                }
                break;
            }
            case 'DODGE': {
                const roll = parseInt(result);
                if (roll < 2) {
                    openFallInjuryModal(actor, activeTeamId);
                }
                break;
            }
            case 'PASS': {
                const roll = parseInt(result);
                
                // Marcar acción de pase como usada
                setTurnActions(prev => ({ ...prev, [activeTeamId]: { ...prev[activeTeamId], pass: true } }));

                if (roll === 1) {
                    handleTurnover(`¡FUMBLE! ${actor.customName} pierde el balón`);
                } else if (roll >= 2) {
                    logEvent('SUCCESS', `${actor.customName} realiza un pase con éxito.`);
                    updatePlayerSppAndAction(actor, activeTeamId, 'PASS', 'pase completado');
                }
                break;
            }
            case 'RUSH': {
                const roll = parseInt(result);
                if (roll === 1) {
                    openFallInjuryModal(actor, activeTeamId);
                } else {
                    logEvent('INFO', `${actor.customName} corre extra con éxito.`);
                }
                break;
            }
            case 'HANDOFF': {
                const roll = parseInt(result);

                // Marcar acción de entrega como usada
                setTurnActions(prev => ({ ...prev, [activeTeamId]: { ...prev[activeTeamId], handoff: true } }));

                if (roll < 2) {
                    handleTurnover(`fallo en la entrega de ${actor.customName}`);
                } else {
                    logEvent('SUCCESS', `${actor.customName} entrega el balón con éxito.`);
                }
                break;
            }
            case 'MOVE': {
                // Chequear Stalling
                const roll = parseInt(result);
                const stalling = checkStalling(turn, roll);
                if (stalling.isTurnover) {
                    handleTurnover(stalling.description);
                }
                break;
            }
            case 'BONE_HEAD': {
                const roll = parseInt(result);
                if (roll === 1) {
                    handleUpdatePlayerCondition(actor.id, activeTeamId, 'isDistracted');
                    logEvent('INFO', `¡Cabeza Dura! ${actor.customName} queda distraído.`);
                }
                break;
            }
            case 'SECURE_BALL': {
                const roll = parseInt(result);
                if (roll < 2) {
                    handleTurnover(`fallo al asegurar el balón por parte de ${actor.customName}`);
                } else {
                    setBallCarrierId(actor.id);
                }
                break;
            }
            default:
                logEvent('S3_ACTION', `Acción ${actionType} registrada para ${actor.customName}. Resultado: ${result}`);
        }
    }, [activeTeamId, liveHomeTeam, liveOpponentTeam, handleSelectTdScorer, handleTurnover, setIsInjuryModalOpen, setInjuryState, handleUpdatePlayerCondition, logEvent, setBallCarrierId, resolveAutomaticFallDamage]);

    /** Alterna el estado Activo/Reserva de un jugador durante el despliegue. */
    const handlePlayerStatusToggle = useCallback((player: ManagedPlayer, teamId: 'home' | 'opponent') => {
        const setTeam = teamId === 'home' ? setLiveHomeTeam : setLiveOpponentTeam;
        setTeam(prevTeam => {
            if (!prevTeam) return null;
            const newStatus: PlayerStatus = player.status === 'Activo' ? 'Reserva' : 'Activo';

            if (newStatus === 'Activo' && prevTeam.players.filter(p => p.status === 'Activo').length >= 11) {
                return prevTeam; 
            }

            return {
                ...prevTeam,
                players: prevTeam.players.map(p =>
                    p.id === player.id ? { ...p, status: newStatus } : p
                )
            };
        });
    }, [setLiveHomeTeam, setLiveOpponentTeam]);

    /** Mueve un jugador en el campo táctico validando colisiones en ambos equipos. */
    const handlePlayerMove = useCallback((
        teamId: 'home' | 'opponent',
        playerId: number,
        newPos: { x: number; y: number }
    ) => {
        const setTeam = teamId === 'home' ? setLiveHomeTeam : setLiveOpponentTeam;
        
        // Verificar ocupación global (en ambos equipos)
        const isOccupied = (liveHomeTeam?.players || []).some(
            p => p.fieldPosition?.x === newPos.x && p.fieldPosition?.y === newPos.y
        ) || (liveOpponentTeam?.players || []).some(
            p => p.fieldPosition?.x === newPos.x && p.fieldPosition?.y === newPos.y
        );

        if (isOccupied) return;

        setTeam(prev => {
            if (!prev) return null;
            return { 
                ...prev, 
                players: prev.players.map(p => p.id === playerId ? { ...p, fieldPosition: newPos } : p) 
            };
        });
    }, [liveHomeTeam, liveOpponentTeam, setLiveHomeTeam, setLiveOpponentTeam]);

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
        setGameState('in_progress');
        if (state.gameStatus.receivingTeam) {
            setActiveTeamId(state.gameStatus.receivingTeam);
            setRosterViewId(state.gameStatus.receivingTeam);
        }
        const isFirstTurnOfHalf = turn === 0;
        if (isFirstTurnOfHalf) {
            setTurn(1);
            logEvent('INFO', half === 1 ? 'Comienza el partido!' : 'Comienza la segunda parte!');
        } else {
            logEvent('INFO', `Comienza la patada del turno ${turn}.`);
        }
    }, [state.gameStatus.receivingTeam, turn, half, setTurn, setGameState, setActiveTeamId, setRosterViewId, logEvent]);

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
            mortuaryAssistant: 'mortuaryAssistants', plagueDoctor: 'plagueDoctors',
            wizard: 'tempWizard'
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
            mortuaryAssistant: 'mortuaryAssistants', plagueDoctor: 'plagueDoctors',
            wizard: 'tempWizard'
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
    }, [setLiveHomeTeam, setLiveOpponentTeam]);

    /** Maneja la selección de equipo (local o visitante), gestionando snapshots en modo amistoso. */
    const handleSelectTeamInternal = useCallback((team: ManagedTeam, side: 'home' | 'opponent') => {
        const { setSelectingSnapshotFor, setHomeTeam, setOpponentTeam, matchMode } = state as any;
        if (matchMode === 'friendly' && team.snapshots && team.snapshots.length > 0) {
            setSelectingSnapshotFor({ team, side });
        } else {
            if (side === 'home') setHomeTeam(team);
            else setOpponentTeam({ ...team, players: team.players.map(p => ({ ...p, status: 'Reserva' })) });
        }
    }, [state, teams]);

    /** Procesa los datos decodificados de un código QR para importar un equipo oponente. */
    const handleProcessQrCode = useCallback((decodedText: string) => {
        const { setOpponentTeam } = state as any;
        try {
            const parsedTeam = JSON.parse(decodedText);
            const isNewFormat = 'n' in parsedTeam && 'rN' in parsedTeam;
            const teamName = isNewFormat ? parsedTeam.n : parsedTeam.name;
            const rosterName = isNewFormat ? parsedTeam.rN : parsedTeam.rosterName;

            if (!teamName || !rosterName) throw new Error('Código QR no válido.');

            const baseTeam = teams.find((t: any) => t.name === rosterName);
            if (!baseTeam) throw new Error(`Facción "${rosterName}" no encontrada.`);

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

            setOpponentTeam({ 
                name: teamName, rosterName: rosterName, 
                treasury: (isNewFormat ? parsedTeam.t : parsedTeam.treasury) || 0, 
                rerolls: (isNewFormat ? parsedTeam.rr : parsedTeam.rerolls) || 0, 
                dedicatedFans: (isNewFormat ? parsedTeam.df : parsedTeam.dedicatedFans) || 1, 
                cheerleaders: (isNewFormat ? parsedTeam.ch : parsedTeam.cheerleaders) || 0, 
                assistantCoaches: (isNewFormat ? parsedTeam.ac : parsedTeam.assistantCoaches) || 0, 
                apothecary: (isNewFormat ? parsedTeam.ap : parsedTeam.apothecary) || false, 
                players: fullPlayers 
            });
            return true;
        } catch (e: any) {
            alert(`Error QR: ${e instanceof Error ? e.message : 'Error.'}`);
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
                return {
                    ...prev,
                    players: prev.players.map((p: any) => {
                        if (p.status !== 'Activo') return p;
                        const idx = active.findIndex((a: any) => a.id === p.id);
                        return { ...p, fieldPosition: { x: cols[idx % cols.length] || 1, y: Math.floor(idx / 7) + 1 } };
                    })
                };
            });
        };
        suggestForTeam(setLiveHomeTeam);
        suggestForTeam(setLiveOpponentTeam);
        logEvent('INFO', 'Despliegue sugerido aplicado.');
    }, [setLiveHomeTeam, setLiveOpponentTeam, logEvent]);

    /** Maneja la tirada de recuperación de un jugador KO. 4+ recupera al banquillo.
     * @param player - El jugador KO a recuperar.
     * @param manualVal - Valor manual de dado (1-6) introducido por el usuario. Si no se provee, se tira digitalmente.
     */
    const rollKoRecovery = useCallback((player: any, manualVal?: number) => {
        const { setKoRecoveryRolls } = state as any;
        const roll = manualVal ?? (Math.floor(Math.random() * 6) + 1);
        const success = roll >= 4;
        setKoRecoveryRolls((prev: any) => ({ ...prev, [player.id]: { roll, success } }));
        if (success) {
            const teamId = liveHomeTeam?.players.some(p => p.id === player.id) ? 'home' : 'opponent';
            updatePlayerStatus(player.id, teamId, 'Reserva');
        }
    }, [state, liveHomeTeam, updatePlayerStatus]);

    /** Reinicia el estado necesario para comenzar una nueva patada tras un TD o fin de mitad. */
    const handleStartNextDrive = useCallback(() => {
        const {
            setKoRecoveryRolls,
            setGameStatus,
            setTurn,
            setPreGameStep,
            setKickoffActionCompleted
        } = state as any;

        setKoRecoveryRolls({});
        setKickoffActionCompleted(false);
        setSelectedPlayerForAction(null);
        setTurnActions({
            home: { blitz: false, pass: false, foul: false, handoff: false },
            opponent: { blitz: false, pass: false, foul: false, handoff: false }
        });

        if (driveResetTarget === 'post_game') {
            logEvent('INFO', 'Fin del partido!');
            setDriveResetTarget('next_drive');
            setGameState('post_game');
            return;
        }

        if (driveResetTarget === 'halftime') {
            const secondHalfReceiver =
                firstHalfReceiver === 'home'
                    ? 'opponent'
                    : firstHalfReceiver === 'opponent'
                        ? 'home'
                        : null;
            setTurn(0);
            setHalf(2);
            setGameStatus((prev: any) => ({
                ...prev,
                kickoffEvent: null,
                receivingTeam: secondHalfReceiver || prev.receivingTeam
            }));
            if (secondHalfReceiver) {
                setActiveTeamId(secondHalfReceiver);
                setRosterViewId(secondHalfReceiver);
                const receiverName = secondHalfReceiver === 'home' ? homeTeam?.name : opponentTeam?.name;
                logEvent('INFO', `Fin de la primera parte. ${receiverName} recibira la segunda parte.`);
            } else {
                logEvent('INFO', 'Fin de la primera parte. Preparamos la segunda parte.');
            }
            setPreGameStep(2);
            setDriveResetTarget('next_drive');
            setGameState('pre_game');
            return;
        }

        let nextReceiver: 'home' | 'opponent' | null = null;
        setGameStatus((prev: any) => {
            nextReceiver =
                prev.receivingTeam === 'home'
                    ? 'opponent'
                    : prev.receivingTeam === 'opponent'
                        ? 'home'
                        : null;
            return { ...prev, kickoffEvent: null, receivingTeam: nextReceiver };
        });
        if (nextReceiver) {
            setActiveTeamId(nextReceiver);
            setRosterViewId(nextReceiver);
        }
        setTurn((t: number) => t + 1);
        setPreGameStep(2);
        setDriveResetTarget('next_drive');
        setGameState('pre_game');
    }, [state, driveResetTarget, firstHalfReceiver, homeTeam?.name, opponentTeam?.name, logEvent, setActiveTeamId, setDriveResetTarget, setGameState, setHalf, setRosterViewId, setSelectedPlayerForAction, setTurnActions]);

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
            setPendingJourneymen, setMatchMode, setDriveResetTarget
        } = state as any;

        setLiveHomeTeam(null); setLiveOpponentTeam(null); setGameLog([]);
        setScore({ home: 0, opponent: 0 }); setTurn(0); setHalf(1);
        setCurrentChronicle(null); setFame({ home: 0, opponent: 0 }); setFansRoll({ home: '', opponent: '' });
        setPreGameStep(0); setGameStatus({ weather: null, kickoffEvent: null, coinTossWinner: null, receivingTeam: null });
        setKickoffActionCompleted(false); setInducementState({ underdog: null, money: 0, hiredStars: [] });
        setFirstHalfReceiver(null); setPlayersMissingNextGame([]); setBallCarrierId(null);
        setDriveResetTarget('next_drive');
        setKoRecoveryRolls({}); setFoulState(initialFoulState); setInjuryState(initialInjuryState);
        setSelectedPlayerForAction(null); setSppModalState({ isOpen: false, type: null, step: 'select_team', teamId: null, selectedPlayer: null });
        setIsMatchSummaryOpen(false); setActiveTab('assistant'); setActiveTeamId('home');
        setRosterViewId('home'); setJourneymenNotification(null); setPendingJourneymen({ home: [], opponent: [] });
        setMatchMode('competition'); setGameState('setup');
    }, [state, setGameState]);

    /** Finaliza el partido, guarda reportes y actualiza el equipo en la liga. */
    const handleConfirmPostGame = useCallback(async (finalTeamState: any) => {
        const { matchMode, score, fame, gameLog, gameStatus, concessionState, currentChronicle } = state as any;
        if (!homeTeam) return;

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
                losses: (finalTeamState.record?.losses || 0) + (matchResult === 'L' ? 1 : 0)
            }
        };

        if (_props.onMatchReportCreate && liveHomeTeam && liveOpponentTeam) {
            const stats = {
                passes: { home: gameLog.filter((e: any) => e.team === 'home' && (e.type === 'pass_complete' || e.type === 'PASS')).length, opponent: gameLog.filter((e: any) => e.team === 'opponent' && (e.type === 'pass_complete' || e.type === 'PASS')).length },
                casualties: { home: gameLog.filter((e: any) => e.team === 'home' && (e.type === 'injury_casualty' || e.type === 'INJURY')).length, opponent: gameLog.filter((e: any) => e.team === 'opponent' && (e.type === 'injury_casualty' || e.type === 'INJURY')).length }
            };
            const baseReport: any = {
                date: historyEntry.date,
                matchMode,
                competitionId: _props.competition?.id,
                homeTeam: { id: homeTeam.id, name: liveHomeTeam.name, score: score.home },
                opponentTeam: { id: opponentTeam?.id, name: liveOpponentTeam?.name, score: score.opponent },
                gameLog,
                weather: gameStatus.weather?.title,
                winner: matchResult,
                stats,
                wasConceded: concessionState
            };
            let finalNewsData;
            if (currentChronicle) {
                const parts = currentChronicle.split('\n\n');
                finalNewsData = { headline: parts[0], article: parts.slice(1).join('\n\n'), summary: `Final: ${liveHomeTeam.name} ${score.home} - ${score.opponent} ${liveOpponentTeam?.name}` };
            } else {
                finalNewsData = (await import('../../../../utils/newsGenerator')).generateMatchArticle(baseReport as any);
            }
            const reportId = await _props.onMatchReportCreate({ ...baseReport, ...finalNewsData });
            if (reportId) historyEntry.id = reportId;
        }
        _props.onTeamUpdate(finalTeamWithStats);
        logEvent('INFO', matchMode === 'friendly' ? 'Partido amistoso finalizado y archivado.' : 'Partido de competición cerrado y archivado.');
        resetGameState();
    }, [state, _props, homeTeam, opponentTeam, liveHomeTeam, liveOpponentTeam, logEvent, resetGameState]);

    return {
        logEvent, updatePlayerStatus, updatePlayerSppAndAction, handleHalftime, handleNextTurn, handleFoulAction, handleInjuryAction, handleSkillClick, handleBallToggle, handleUpdatePlayerCondition,
        openSppModal, handleStrategicAction, handleSelectTdScorer, handleS3Action, handlePlayerStatusToggle, handlePlayerMove, useReroll, handleConfirmJourneymen, handleStartDrive,
        handleTurnover, handleBuyInducement, handleSellInducement, handleHireStar, handleFireStar, handleAutoSelectTeam, handleSuggestDeployment, handleSelectTeamInternal,
        handleProcessQrCode, handleConfirmPostGame, resetGameState, rollKoRecovery, handleStartNextDrive, handleBribe, handleDeselectPlayer,

    /** Genera un nuevo evento de clima (2D6). */
    handleGenerateWeather: useCallback((manualVal?: number) => {
        const total = manualVal || (Math.floor(Math.random() * 6) + Math.floor(Math.random() * 6) + 2);
        const w = weatherConditions.find(wc => {
            if (wc.diceRoll.includes('-')) {
                const [min, max] = wc.diceRoll.split('-').map(Number);
                return total >= min && total <= max;
            }
            return wc.diceRoll === total.toString();
        });
        if (w) {
            setGameStatus((prev: any) => ({ ...prev, weather: w }));
            logEvent('WEATHER', `Nuffle ha hablado: ${w.title} (${total})`);
            playSound('dice');
        }
        setIsWeatherModalOpen(false);
    }, [setGameStatus, logEvent, playSound, setIsWeatherModalOpen]),

    /** Confirma un cambio forzado de clima. */
    handleConfirmWeatherReroll: useCallback(() => {
        const val = parseInt(weatherRerollInput);
        if (isNaN(val) || val < 2 || val > 12) return;
        
        const w = weatherConditions.find(wc => {
            if (wc.diceRoll.includes('-')) {
                const [min, max] = wc.diceRoll.split('-').map(Number);
                return val >= min && val <= max;
            }
            return wc.diceRoll === val.toString();
        });
        if (w) {
            setGameStatus((prev: any) => ({ ...prev, weather: w }));
            logEvent('WEATHER', `¡Vientos de cambio! Nuevo clima: ${w.title} (${val})`);
            playSound('dice');
        }
        setIsChangingWeatherModalOpen(false);
        setWeatherRerollInput('');
    }, [weatherRerollInput, setGameStatus, logEvent, playSound, setIsChangingWeatherModalOpen, setWeatherRerollInput]),

    /** Mecánica de Mago (S3): Bola de Fuego / Rayo. */
    handleWizard: useCallback((teamId: 'home' | 'opponent') => {
        const setTeam = teamId === 'home' ? setLiveHomeTeam : setLiveOpponentTeam;
        const targetTeam = teamId === 'home' ? liveHomeTeam : liveOpponentTeam;
        if (!targetTeam || !targetTeam.tempWizard) return;

        setTeam(prev => prev ? ({ ...prev, tempWizard: false }) : null);
        logEvent('SUCCESS', `¡LANZAMIENTO DE HECHIZO! El mago de ${targetTeam.name} interviene en el campo.`, { team: teamId });
        playSound('dice');
    }, [setLiveHomeTeam, setLiveOpponentTeam, liveHomeTeam, liveOpponentTeam, logEvent, playSound])
    };
};
