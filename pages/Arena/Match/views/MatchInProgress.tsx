import React, { useState } from 'react';
import { useMatch } from '../context/MatchContext';
import GameLog from '../log/GameLog';
import { S3ActionType } from '../types/match.types';
import { ManagedPlayer, PlayerStatus } from '../../../../types';
import S3ActionOrchestrator from '../components/S3ActionOrchestrator';
import MatchTeamRoster from '../components/MatchTeamRoster';

/**
 * MatchInProgress ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â Arena Console V3 "Elite Assistant & Chronicle"
 * Integramos modificadores climÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ticos, gestiÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â³n de activaciones y narrativa dinÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡mica.
 */
const MatchInProgress: React.FC = () => {
        const {
        liveHomeTeam, liveOpponentTeam,
        score, turn, half, activeTeamId, setActiveTeamId,
        setLiveHomeTeam, setLiveOpponentTeam,
        selectedPlayerForAction, setSelectedPlayerForAction,
        setIsTdModalOpen, setIsInjuryModalOpen, setIsPrayersModalOpen,
        setIsWeatherModalOpen, setIsSequenceGuideOpen,
        setIsMatchSummaryOpen, setIsConcedeModalOpen,
        handleNextTurn, handleUpdatePlayerCondition, handleSkillClick,
        logEvent, interactionState, setInteractionState, handleS3Action, playSound,
        gameStatus, handleBribe, handleWizard, handleDeselectPlayer,
        handleStrategicAction, turnActions
    } = useMatch();

    if (!liveHomeTeam || !liveOpponentTeam) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-midnight font-display">
                <div className="text-primary font-black text-center animate-pulse tracking-[0.5em] uppercase">
                    Invocando escuadras de Nuffle...
                </div>
            </div>
        );
    }

    const { mode, pending } = interactionState;
    const activeTeam = activeTeamId === 'home' ? liveHomeTeam : liveOpponentTeam;

    // LÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â³gica de Modificadores ClimÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ticos (S3)
    const currentWeather = gameStatus.weather?.title || 'Perfecto';
    const isRainy = currentWeather === 'Lluvioso';
    const isSunny = currentWeather === 'Muy Soleado';
    const isBlizzard = currentWeather === 'Ventisca';

    const openPlayerActionPanel = (player: ManagedPlayer, teamId: 'home' | 'opponent') => {
        setSelectedPlayerForAction(player);
        setActiveTeamId(teamId);
        setInteractionState({
            mode: 'idle',
            pending: {
                actorId: player.id,
                actionType: null,
                objectiveId: null,
                diceResult: null,
                manualMode: true
            }
        });
    };

    const applyAutoFallDamage = (player: ManagedPlayer, teamId: 'home' | 'opponent') => {
        const setTeam = teamId === 'home' ? setLiveHomeTeam : setLiveOpponentTeam;
        const armorValue = Number.parseInt(String(player.stats.AR).replace('+', ''), 10);
        const armorRoll = Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1;

        if (Number.isNaN(armorValue)) {
            logEvent('WARNING', `No se pudo resolver la armadura de ${player.customName}. Se registra la caída sin daño adicional.`, { team: teamId, player: player.id });
            return;
        }

        if (armorRoll <= armorValue) {
            logEvent('INFO', `Caída de ${player.customName}: armadura aguanta (${armorRoll} vs ${armorValue}).`, { team: teamId, player: player.id });
            setTeam(prev => prev ? ({
                ...prev,
                players: prev.players.map(p => p.id === player.id ? {
                    ...p,
                    isActivated: true,
                    statusDetail: 'Caído'
                } : p)
            }) : prev);
            return;
        }

        const injuryRoll = Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1;
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

        playSound('injury');
        logEvent(
            finalStatus === 'Lesionado' ? 'WARNING' : 'INFO',
            `Caída de ${player.customName}: armadura ${armorRoll} vs ${armorValue}, heridas ${injuryRoll} => ${statusDetail}.`,
            { team: teamId, player: player.id }
        );

        setTeam(prev => prev ? ({
            ...prev,
            players: prev.players.map(p => p.id === player.id ? {
                ...p,
                isActivated: true,
                status: finalStatus,
                statusDetail
            } : p)
        }) : prev);
    };

    const toggleStallingFlag = () => {
        const setTeam = activeTeamId === 'home' ? setLiveHomeTeam : setLiveOpponentTeam;
        setTeam(prev => prev ? ({ ...prev, hasStalled: !prev.hasStalled }) : prev);
        logEvent('INFO', `${activeTeam.name} ${activeTeam.hasStalled ? 'retira' : 'marca'} la bandera de stalling.`);
    };

    const handleTriggerAction = (type: S3ActionType | string) => {
        if (!selectedPlayerForAction) {
            logEvent('WARNING', 'El OrÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡culo exige que selecciones un jugador primero.');
            return;
        }

        if (type === 'TD' || type === 'TOUCHDOWN') { setIsTdModalOpen(true); return; }
        if (type === 'CAS') { setIsInjuryModalOpen(true); return; }

        const needsObjective = ['BLOCK', 'PASS', 'HANDOFF', 'FOUL'].includes(type);
        
        if (needsObjective) {
            setInteractionState(prev => ({
                ...prev,
                mode: 'selecting_objective',
                pending: { ...prev.pending, actorId: selectedPlayerForAction.id, actionType: type as S3ActionType }
            }));
        } else {
            setInteractionState(prev => ({
                ...prev,
                mode: 'awaiting_dice',
                pending: { ...prev.pending, actorId: selectedPlayerForAction.id, actionType: type as S3ActionType }
            }));
        }
    };

    const [manualRollVal, setManualRollVal] = useState('');

    const handleDiceResultInternal = (result: any) => {
        let finalResult = result;
        if (typeof result === 'undefined') {
            const diceMap: Record<string, number> = {
                'BLOCK': 6, 'PASS': 6, 'RUSH': 6, 'DODGE': 6, 'HANDOFF': 6, 'SECURE_BALL': 6,
                'CAS': 16, 'FOUL': 6, 'DAUNTLESS': 6, 'REGEN': 6, 'KO_RECOVERY': 6, 'SCATTER': 8, 'FANS': 3,
                'INJURY': 16, 'CHARACTERISTIC': 16
            };
            const sides = diceMap[pending.actionType || ''] || 6;
            finalResult = Math.floor(Math.random() * sides) + 1;
        }
        
        handleS3Action(pending, finalResult);
        playSound('dice');
        setInteractionState({
            mode: 'idle',
            pending: { actorId: null, actionType: null, objectiveId: null, diceResult: null, manualMode: true }
        });
        setSelectedPlayerForAction(null);
        setManualRollVal('');
    };

    return (
        <div className="font-display min-h-screen overflow-hidden flex flex-col bg-midnight text-diente-orco selection:bg-primary selection:text-midnight">
            
            {/* ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ 1. CABECERA GLOBAL Y ESTADO DE CAMPO ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ */}
            <header className="w-full border-b border-white/5 glass px-6 py-2 flex flex-col gap-2 z-50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-4">
                            {/* Local Team */}
                            <div className="flex flex-col items-end">
                                <div className="flex items-center gap-1.5">
                                    <span className={`text-[8px] px-1.5 py-0.5 rounded-sm font-black border uppercase tracking-tighter ${activeTeamId === 'home' ? 'bg-gold/20 text-gold border-gold/40 shadow-[0_0_8px_rgba(212,175,55,0.2)]' : 'bg-slate-800 text-slate-500 border-white/5'}`}>
                                        {activeTeamId === 'home' ? 'ACTIVO' : 'RECEPTOR'}
                                    </span>
                                    <span className="text-[10px] uppercase tracking-widest text-primary font-bold">Local</span>
                                </div>
                                <span className="text-xl font-black text-diente-orco uppercase truncate max-w-[150px]">{liveHomeTeam.name}</span>
                            </div>
                            <div className={`p-2 rounded-lg border transition-all ${activeTeamId === 'home' ? 'bg-gold/10 border-gold/40 shadow-lg' : 'bg-primary/5 border-primary/20'}`}>
                                {liveHomeTeam.crestImage ? <img src={liveHomeTeam.crestImage} className="w-10 h-10 object-contain" alt="Logo Local" /> : <div className="w-10 h-10 flex items-center justify-center text-primary font-black italic">BB</div>}
                            </div>

                            {/* Score Display (Central) */}
                            <div className="flex items-center gap-3 px-6 py-1 bg-black/60 rounded-full border border-gold/20 shadow-inner">
                                <span className="text-3xl font-black text-gold">{score.home}</span>
                                <span className="text-slate-600 font-bold">-</span>
                                <span className="text-3xl font-black text-slate-400">{score.opponent}</span>
                            </div>

                            {/* Opponent Team */}
                            <div className={`p-2 rounded-lg border transition-all ${activeTeamId === 'opponent' ? 'bg-gold/10 border-gold/40 shadow-lg' : 'bg-slate-900/50 border-white/5'}`}>
                                {liveOpponentTeam.crestImage ? <img src={liveOpponentTeam.crestImage} className="w-10 h-10 object-contain" alt="Logo Rival" /> : <div className="w-10 h-10 flex items-center justify-center text-slate-500 font-black italic">??</div>}
                            </div>
                            <div className="flex flex-col items-start">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Rival</span>
                                    <span className={`text-[8px] px-1.5 py-0.5 rounded-sm font-black border uppercase tracking-tighter ${activeTeamId === 'opponent' ? 'bg-gold/20 text-gold border-gold/40 shadow-[0_0_8px_rgba(212,175,55,0.2)]' : 'bg-slate-800 text-slate-500 border-white/5'}`}>
                                        {activeTeamId === 'opponent' ? 'ACTIVO' : 'PATEADOR'}
                                    </span>
                                </div>
                                <span className="text-xl font-black text-slate-500 uppercase truncate max-w-[150px]">{liveOpponentTeam.name}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <button
                            onClick={handleNextTurn}
                            className="px-4 py-2 rounded-full bg-primary hover:brightness-110 text-midnight text-[10px] font-black uppercase tracking-[0.3em] shadow-lg shadow-primary/20 border-b-4 border-primary-dark transition-all"
                        >
                            Terminar turno
                        </button>
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 border border-white/5 ring-1 ring-white/5">
                            <span className={`size-2 rounded-full ${activeTeamId === 'home' ? 'bg-sky-400' : 'bg-red-400'} shadow-lg`} />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">ActÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Âºa</span>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-diente-orco">{activeTeam.name}</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] uppercase text-slate-500 font-bold">Turno</span>
                            <span className="text-xl font-black italic tabular-nums text-slate-100">{turn} / 8</span>
                        </div>
                        <button onClick={() => setIsMatchSummaryOpen(true)} className="size-10 rounded-full glass flex items-center justify-center hover:bg-gold hover:text-midnight transition-all group">
                             <span className="material-symbols-outlined text-sm group-hover:rotate-90 transition-transform">settings</span>
                        </button>
                    </div>
                </div>

                {/* -- Field Status Pill -- */}
                <div className="flex items-center justify-center -mt-1">
                    <div className="glass-dark px-6 py-1.5 rounded-full flex items-center gap-6 border border-gold/10 shadow-lg text-[10px] font-bold uppercase tracking-wider animate-in slide-in-from-top-4 duration-500">
                        <button onClick={() => setIsWeatherModalOpen(true)} className={`flex items-center gap-2 transition-colors hover:brightness-125 ${isRainy ? 'text-blue-400' : isSunny ? 'text-amber-400' : isBlizzard ? 'text-slate-200' : 'text-primary'}`}>
                            <span className="material-symbols-outlined text-sm">{isRainy ? 'umbrella' : isSunny ? 'light_mode' : isBlizzard ? 'ac_unit' : 'wb_sunny'}</span>
                            <span>{currentWeather} {isRainy ? '(-1 Recoger)' : isSunny ? '(-1 Pase)' : isBlizzard ? '(-1 Rush)' : ''}</span>
                        </button>
                        <div className="w-px h-3 bg-white/10"></div>
                        <div className="flex items-center gap-2 text-slate-400">
                            <span className="material-symbols-outlined text-sm">groups</span>
                            <span>Afluencia: <span className="text-diente-orco">{(activeTeam.fanAttendance || 12500).toLocaleString()}</span></span>
                        </div>
                        <div className="w-px h-3 bg-white/10"></div>
                        <div className={`flex items-center gap-2 transition-all ${activeTeam.tempWizard ? 'text-purple-400 opacity-100' : 'text-slate-600 opacity-40'}`}>
                            <span className="material-symbols-outlined text-sm">magic_button</span>
                            <span>Mago: {activeTeam.tempWizard ? 'SÍ' : 'NO'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gold">
                            <span className="material-symbols-outlined text-sm tracking-tighter">payments</span>
                            <span>Sobornos: {activeTeam.tempBribes || 0}</span>
                        </div>
                        <div className={`flex items-center gap-2 ${activeTeam.apothecary && !activeTeam.apothecaryUsedOnKO ? 'text-emerald-400' : 'text-slate-600 opacity-40'}`}>
                            <span className="material-symbols-outlined text-sm">medical_services</span>
                            <span>Apotecario: {activeTeam.apothecary && !activeTeam.apothecaryUsedOnKO ? 'SÍ' : 'NO'}</span>
                        </div>
                        <button onClick={toggleStallingFlag} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${activeTeam.hasStalled ? 'bg-red-500/15 border-red-500/40 text-red-300' : 'bg-black/20 border-white/10 text-slate-500 hover:text-primary hover:border-primary/30'}`}>
                            <span className="material-symbols-outlined text-sm">flag</span>
                            <span>Stalling</span>
                        </button>
                        <div className="flex items-center gap-2">
                            <span className="text-primary">RR:</span>
                            <div className="flex items-center gap-1.5 font-black">
                                <span className="text-gold">{liveHomeTeam.liveRerolls}</span>
                                <span className="text-white/10">|</span>
                                <span className="text-slate-500">{liveOpponentTeam.liveRerolls}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ 2. CUERPO: GESTIÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã¢â‚¬Å“N DE PLANTILLA Y DETALLE (THE HUB) ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ */}
            <main className="flex-1 flex overflow-hidden p-6 gap-6 min-h-0">
                
                {/* ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ Roster de Jugadores (Mesa ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¡nica) ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ */}
                <section className="flex-[3] flex flex-col gap-4 overflow-hidden min-h-0">
                    <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
                        <div>
                            <h2 className="text-xs font-bold tracking-[0.3em] uppercase text-slate-500 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-lg">view_quilt</span>
                                Mesa de Partido
                            </h2>
                            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-600 mt-1">
                                Solo actÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Âºa el equipo activo. Pulsa una ficha para abrir su panel.
                            </p>
                        </div>

                        <div className="flex gap-4 text-[10px] font-bold uppercase text-slate-500">
                            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-primary shadow-lg shadow-primary/40"></span> Activo</span>
                            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-slate-700"></span> Bloqueado</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 2xl:grid-cols-2 gap-6 flex-1 min-h-0">
                        <MatchTeamRoster
                            team={liveHomeTeam}
                            side="home"
                            activeTeamId={activeTeamId}
                            selectedPlayerId={selectedPlayerForAction?.id ?? null}
                            locked={activeTeamId !== 'home'}
                            onSelectPlayer={(player) => openPlayerActionPanel(player, 'home')}
                        />
                        <MatchTeamRoster
                            team={liveOpponentTeam}
                            side="opponent"
                            activeTeamId={activeTeamId}
                            selectedPlayerId={selectedPlayerForAction?.id ?? null}
                            locked={activeTeamId !== 'opponent'}
                            onSelectPlayer={(player) => openPlayerActionPanel(player, 'opponent')}
                        />
                    </div>
                </section>

                {/* ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ Panel de Detalle (The Hub) ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ */}
                <aside className="flex-[1.2] min-w-[420px] flex flex-col gap-6 animate-in fade-in slide-in-from-right-8 duration-700">
                    <div className="glass-dark rounded-2xl p-6 border border-gold/20 shadow-2xl relative h-full flex flex-col">
                        {selectedPlayerForAction ? (
                            <>
                                <button 
                                    onClick={handleDeselectPlayer}
                                    className="absolute top-2 left-2 size-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-blood-red/20 text-slate-500 hover:text-blood-red transition-all border border-white/5 z-20"
                                    title="Deseleccionar"
                                >
                                    <span className="material-symbols-outlined text-sm">close</span>
                                </button>
                                <div className="absolute top-0 right-0 px-4 py-1 bg-gold text-midnight text-[10px] font-black uppercase rounded-bl-xl tracking-widest shadow-lg">DETALLE HUB</div>
                                
                                <div className="flex flex-col items-center text-center mb-6 pt-6">
                                    <div className={`w-36 h-36 rounded-2xl bg-black border-4 shadow-2xl mb-4 flex items-center justify-center relative overflow-hidden ${selectedPlayerForAction.isDistracted ? 'grayscale border-slate-600' : 'border-gold/30'}`}>
                                        {selectedPlayerForAction.image ? (
                                            <img src={selectedPlayerForAction.image} className="w-full h-full object-cover" alt={selectedPlayerForAction.customName} />
                                        ) : (
                                            <>
                                                <span className="text-6xl font-black text-white/5">#{selectedPlayerForAction.id.toString().slice(-2)}</span>
                                                {selectedPlayerForAction.isDistracted && <div className="absolute inset-0 bg-white/10 flex items-center justify-center"><span className="material-symbols-outlined text-6xl text-white/40">question_mark</span></div>}
                                            </>
                                        )}
                                    </div>
                                    <h3 className="text-2xl font-black uppercase italic text-diente-orco tracking-tight">{selectedPlayerForAction.customName}</h3>
                                    <p className="text-primary text-[10px] font-black uppercase tracking-[0.4em]">{selectedPlayerForAction.position}</p>
                                </div>

                                {/* Atributos S3 */}
                                <div className="grid grid-cols-5 gap-3 mb-8 w-full">
                                    {[
                                        { l: 'MA', v: selectedPlayerForAction.stats.MV, bad: selectedPlayerForAction.hasIndigestion },
                                        { l: 'ST', v: selectedPlayerForAction.stats.FU },
                                        { l: 'AG', v: selectedPlayerForAction.stats.AG, isRoll: true, bad: false },
                                        { l: 'PA', v: selectedPlayerForAction.stats.PA === '-' ? '-' : selectedPlayerForAction.stats.PA, isRoll: selectedPlayerForAction.stats.PA !== '-', bad: false },
                                        { l: 'AV', v: selectedPlayerForAction.stats.AR, isRoll: true, bad: selectedPlayerForAction.hasIndigestion }
                                    ].map(attr => (
                                        <div key={attr.l} className="flex flex-col items-center bg-black/60 py-3 rounded-xl border border-white/5 relative">
                                            <span className="text-[10px] font-bold text-slate-500 mb-1">{attr.l}</span>
                                            <span className={`text-2xl font-black ${attr.bad ? 'text-red-500 underline decoration-double' : 'text-gold-gradient'}`}>
                                                {(!attr.v || attr.v === 'undefined' || attr.v === 'null') ? '--' : String(attr.v).replace(/\+/g, '')}
                                                {attr.isRoll && attr.v && attr.v !== '-' && attr.v !== 'undefined' ? '+' : ''}
                                            </span>
                                            {attr.bad && <div className="absolute -top-1 -right-1 bg-red-600 size-5 rounded-full flex items-center justify-center text-[10px] font-black shadow-lg">-1</div>}
                                        </div>
                                    ))}
                                </div>

                                {/* Habilidades Interactivas */}
                                <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                                    <h4 className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary text-sm">auto_fix_high</span> CODEX SKILLS
                                    </h4>
                                    <div className="space-y-2">
                                        {(selectedPlayerForAction.skillKeys || []).map((s, i) => (
                                            <button key={`base-${i}`} onClick={() => handleSkillClick(s)} className={`w-full flex items-center gap-3 p-3 glass border-white/5 rounded-xl hover:bg-white/10 transition-all text-left group ${selectedPlayerForAction.isDistracted ? 'opacity-30' : ''}`}>
                                                <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20"><span className="material-symbols-outlined text-primary text-sm">menu_book</span></div>
                                                <div>
                                                    <p className={`text-[11px] font-black uppercase text-diente-orco ${selectedPlayerForAction.isDistracted ? 'line-through decoration-red-500' : ''}`}>{s}</p>
                                                    <p className="text-[8px] text-slate-600 font-bold tracking-tight uppercase">Click para Detalles</p>
                                                </div>
                                            </button>
                                        ))}
                                        {(selectedPlayerForAction.gainedSkills || []).map((s, i) => (
                                            <button key={`gained-${i}`} onClick={() => handleSkillClick(s)} className="w-full flex items-center gap-3 p-3 bg-gold/5 border border-gold/20 rounded-xl hover:bg-gold/10 transition-all text-left group">
                                                <div className="size-8 rounded-lg bg-gold/10 flex items-center justify-center group-hover:bg-gold/20"><span className="material-symbols-outlined text-gold text-sm">workspace_premium</span></div>
                                                <div>
                                                    <p className="text-[11px] font-black uppercase text-gold">{s}</p>
                                                    <p className="text-[8px] text-gold/60 font-bold tracking-tight uppercase">Habilidad Adquirida</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-3">
                                    {mode === 'idle' ? (
                                        <>
                                            <div className="grid grid-cols-2 gap-2">
                                                <button onClick={() => {
                                                    const setTeam = activeTeamId === 'home' ? setLiveHomeTeam : setLiveOpponentTeam;
                                                    setTeam(prev => prev ? ({ ...prev, players: prev.players.map(p => p.id === selectedPlayerForAction.id ? { ...p, isActivated: true } : p) }) : prev);
                                                    setSelectedPlayerForAction(null);
                                                    setInteractionState({ mode: 'idle', pending: { actorId: null, actionType: null, objectiveId: null, diceResult: null, manualMode: true } });
                                                }} className="py-3 rounded-xl border flex flex-col items-center transition-all bg-primary text-midnight border-primary-dark hover:brightness-110 shadow-lg shadow-primary/20">
                                                    <span className="material-symbols-outlined text-sm">task_alt</span>
                                                    <span className="text-[8px] font-black uppercase mt-0.5 tracking-tighter">ACCION OK</span>
                                                </button>
                                                <button onClick={() => {
                                                    if (selectedPlayerForAction) {
                                                        applyAutoFallDamage(selectedPlayerForAction, activeTeamId);
                                                    }
                                                    logEvent('TURNOVER', `Caída o fallo de ${selectedPlayerForAction?.customName || 'el jugador seleccionado'}.`);
                                                    playSound('turnover');
                                                    handleNextTurn();
                                                    setSelectedPlayerForAction(null);
                                                    setInteractionState({ mode: 'idle', pending: { actorId: null, actionType: null, objectiveId: null, diceResult: null, manualMode: true } });
                                                }} className="py-3 rounded-xl border flex flex-col items-center transition-all bg-red-600/15 border-red-500/30 text-red-300 hover:bg-red-500/25">
                                                    <span className="material-symbols-outlined text-sm">trending_down</span>
                                                    <span className="text-[8px] font-black uppercase mt-0.5 tracking-tighter">CAIDA / FALLO</span>
                                                </button>
                                                <button onClick={() => handleTriggerAction('BLOCK')} className="py-3 rounded-xl border flex flex-col items-center transition-all bg-orange-500/10 border-orange-500/20 text-orange-300 hover:bg-orange-500/20">
                                                    <span className="material-symbols-outlined text-sm">back_hand</span>
                                                    <span className="text-[8px] font-black uppercase mt-0.5 tracking-tighter">PLACAJE</span>
                                                </button>
                                                <button onClick={() => handleTriggerAction('FOUL')} className="py-3 rounded-xl border flex flex-col items-center transition-all bg-rose-500/10 border-rose-500/20 text-rose-300 hover:bg-rose-500/20">
                                                    <span className="material-symbols-outlined text-sm">gavel</span>
                                                    <span className="text-[8px] font-black uppercase mt-0.5 tracking-tighter">FALTA</span>
                                                </button>
                                                <button onClick={() => handleTriggerAction('PASS')} className="py-3 rounded-xl border flex flex-col items-center transition-all bg-sky-500/10 border-sky-500/20 text-sky-300 hover:bg-sky-500/20">
                                                    <span className="material-symbols-outlined text-sm">shortcut</span>
                                                    <span className="text-[8px] font-black uppercase mt-0.5 tracking-tighter">PASE</span>
                                                </button>
                                                <button onClick={() => handleTriggerAction('TOUCHDOWN')} className="py-3 rounded-xl border flex flex-col items-center transition-all bg-amber-500/10 border-amber-500/20 text-amber-300 hover:bg-amber-500/20">
                                                    <span className="material-symbols-outlined text-sm">sports_score</span>
                                                    <span className="text-[8px] font-black uppercase mt-0.5 tracking-tighter">TOUCHDOWN</span>
                                                </button>
                                                <button onClick={() => handleTriggerAction('SECURE_BALL')} className="py-3 rounded-xl border flex flex-col items-center transition-all bg-emerald-500/10 border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/20">
                                                    <span className="material-symbols-outlined text-sm">inventory_2</span>
                                                    <span className="text-[8px] font-black uppercase mt-0.5 tracking-tighter">ASEGURAR</span>
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2">
                                                <button onClick={() => handleUpdatePlayerCondition(selectedPlayerForAction.id, activeTeamId, 'isDistracted')} className={`py-2 rounded-xl border flex flex-col items-center transition-all ${selectedPlayerForAction.isDistracted ? 'bg-red-600 border-red-600 text-midnight' : 'border-red-600/30 text-red-500/60 hover:border-red-600 hover:text-red-600'}`}>
                                                    <span className="material-symbols-outlined text-sm">psychology_alt</span>
                                                    <span className="text-[8px] font-black uppercase mt-0.5 tracking-tighter">BONE HEAD</span>
                                                </button>
                                                <button onClick={() => handleUpdatePlayerCondition(selectedPlayerForAction.id, activeTeamId, 'hasIndigestion')} className={`py-2 rounded-xl border flex flex-col items-center transition-all ${selectedPlayerForAction.hasIndigestion ? 'bg-amber-500 border-amber-500 text-midnight' : 'border-amber-500/30 text-amber-500/60 hover:border-amber-500 hover:text-amber-500'}`}>
                                                    <span className="material-symbols-outlined text-sm">sick</span>
                                                    <span className="text-[8px] font-black uppercase mt-0.5 tracking-tighter">INDIGESTIÓN</span>
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="rounded-2xl border border-white/5 bg-black/30 p-2">
                                            <S3ActionOrchestrator />
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                                <span className="material-symbols-outlined text-7xl mb-4 animate-bounce">hand_gesture</span>
                                <p className="text-sm font-black uppercase tracking-[0.4em]">Selecciona <br/> una pieza</p>
                            </div>
                        )}
                    </div>
                </aside>
            </main>

            {/* -- 3. EL CRONISTA NARRATIVO (single source of truth) -- */}
            <footer className="w-full glass border-t border-white/10 p-4 flex flex-col gap-4 mt-auto">
                <div className="bg-black/90 rounded-xl p-5 border border-gold/30 font-mono text-sm h-56 overflow-hidden relative shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex flex-col backdrop-blur-xl">
                    <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-3">
                        <div className="flex items-center gap-3">
                            <span className="size-2.5 rounded-full bg-gold animate-pulse shadow-[0_0_10px_rgba(212,175,55,0.8)]"></span>
                            <span className="text-gold font-black tracking-[0.3em] uppercase">Cronista de Campo</span>
                        </div>
                        <span className="text-slate-500 font-bold text-[10px] tracking-widest">BLOOD BOWL OS v3.0 NARRATION</span>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                        <GameLog hideHeader />
                    </div>
                </div>
            </footer>

        </div>
    );
};

const PEDockButton: React.FC<{ label: string, pe: string, icon: string, onClick: () => void, warning: boolean }> = ({ label, pe, icon, onClick, warning }) => (
    <button onClick={onClick} className="btn-pe flex flex-col items-center justify-center py-2.5 rounded-xl transition-all group relative overflow-hidden active:scale-95">
        <span className="material-symbols-outlined text-midnight text-xl group-hover:scale-110 transition-transform">{icon}</span>
        <span className="text-[9px] font-black text-midnight uppercase mt-1 leading-none">{label}</span>
        <span className="text-[8px] font-bold text-midnight/40">{pe} PE</span>
        {warning && <div className="warning-badge shadow-lg">-1</div>}
    </button>
);

const OracleButton: React.FC<{ label: string, icon: string, onClick: () => void, warning?: boolean }> = ({ label, icon, onClick, warning }) => (
    <button onClick={onClick} className="glass border-white/10 hover:border-gold/40 flex items-center gap-2 px-3 py-2 rounded-xl transition-all group relative active:scale-95">
        <span className="material-symbols-outlined text-gold text-sm group-hover:rotate-12 transition-transform">{icon}</span>
        <span className="text-[9px] font-bold text-slate-400 group-hover:text-diente-orco uppercase leading-tight text-left">{label}</span>
        {warning && <div className="warning-badge shadow-lg">-1</div>}
    </button>
);

export default MatchInProgress;


