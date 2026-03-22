import React, { useMemo } from 'react';
import { useMatch } from '../context/MatchContext';
import GameLog from '../log/GameLog';
import { S3ActionType } from '../types/match.types';
import { ManagedPlayer, ManagedTeam } from '../../../../types';
import S3ActionOrchestrator from '../components/S3ActionOrchestrator';
import MatchTeamRoster from '../components/MatchTeamRoster';

type TeamSide = 'home' | 'opponent';

type ActionButtonConfig = {
    key: S3ActionType | 'ACTION_OK' | 'BONE_HEAD' | 'INDIGESTION';
    label: string;
    icon: string;
    tone: string;
    group: 'primary' | 'secondary';
};

const actionButtons: ActionButtonConfig[] = [
    { key: 'ACTION_OK', label: 'Acción OK', icon: 'task_alt', tone: 'bg-primary text-midnight border-primary-dark shadow-lg shadow-primary/20', group: 'primary' },
    { key: 'DODGE', label: 'Caída / Fallo', icon: 'trending_down', tone: 'bg-red-600/15 border-red-500/30 text-red-300 hover:bg-red-500/25', group: 'primary' },
    { key: 'BLOCK', label: 'Placaje', icon: 'back_hand', tone: 'bg-orange-500/10 border-orange-500/20 text-orange-300 hover:bg-orange-500/20', group: 'primary' },
    { key: 'FOUL', label: 'Falta', icon: 'gavel', tone: 'bg-rose-500/10 border-rose-500/20 text-rose-300 hover:bg-rose-500/20', group: 'primary' },
    { key: 'PASS', label: 'Pase', icon: 'shortcut', tone: 'bg-sky-500/10 border-sky-500/20 text-sky-300 hover:bg-sky-500/20', group: 'primary' },
    { key: 'TOUCHDOWN', label: 'Touchdown', icon: 'sports_score', tone: 'bg-amber-500/10 border-amber-500/20 text-amber-300 hover:bg-amber-500/20', group: 'primary' },
    { key: 'SECURE_BALL', label: 'Asegurar', icon: 'inventory_2', tone: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/20', group: 'primary' },
    { key: 'BONE_HEAD', label: 'Bone Head', icon: 'psychology_alt', tone: 'border-red-600/30 text-red-500/70 hover:border-red-500 hover:text-red-300 bg-red-500/5', group: 'secondary' },
    { key: 'INDIGESTION', label: 'Indigestión', icon: 'sick', tone: 'border-amber-500/30 text-amber-500/70 hover:border-amber-500 hover:text-amber-300 bg-amber-500/5', group: 'secondary' }
];

const weatherMeta = {
    Lluvioso: { icon: 'umbrella', tone: 'text-blue-300', note: '-1 Recoger' },
    'Muy Soleado': { icon: 'light_mode', tone: 'text-amber-300', note: '-1 Pase' },
    Ventisca: { icon: 'ac_unit', tone: 'text-slate-200', note: '-1 Rush' },
    Perfecto: { icon: 'wb_sunny', tone: 'text-primary', note: '' }
} as const;

const getScorerName = (event: any, teams: { home: ManagedTeam; opponent: ManagedTeam }) => {
    const actorTeam = event.team === 'home' ? teams.home : teams.opponent;
    const actor = actorTeam.players.find(player => player.id === event.player);
    if (actor?.customName) return actor.customName;

    const description = String(event.description || '').replace(/^¡/, '').replace(/!$/, '');
    if (description.includes(' anota')) {
        return description.split(' anota')[0].trim();
    }

    return 'Anotador';
};

const TeamScoreCard: React.FC<{
    side: TeamSide;
    team: ManagedTeam;
    score: number;
    rerolls: number;
    isActive: boolean;
    scorers: { name: string; turn: number; half: number }[];
    onToggleStalling: () => void;
}> = ({ side, team, score, rerolls, isActive, scorers, onToggleStalling }) => {
    const isHome = side === 'home';
    const accent = isHome
        ? 'border-sky-500/20 bg-sky-500/5'
        : 'border-red-500/20 bg-red-500/5';
    const accentText = isHome ? 'text-sky-300' : 'text-red-300';

    return (
        <div className={`rounded-[2rem] border ${accent} bg-black/35 px-5 py-4 backdrop-blur-xl`}>
            <div className={`flex items-start gap-4 ${isHome ? 'justify-start' : 'justify-end text-right'}`}>
                {isHome && (
                    <div className="size-14 rounded-2xl border border-white/10 bg-black/50 overflow-hidden shrink-0 flex items-center justify-center">
                        {team.crestImage ? <img src={team.crestImage} alt={team.name} className="w-full h-full object-cover" /> : <span className="material-symbols-outlined text-primary">shield</span>}
                    </div>
                )}
                <div className="min-w-0 flex-1">
                    <div className={`flex items-center gap-2 mb-1 ${isHome ? '' : 'justify-end'}`}>
                        <span className={`text-[9px] font-black uppercase tracking-[0.35em] ${accentText}`}>{isHome ? 'Local' : 'Rival'}</span>
                        {isActive && <span className="px-2 py-0.5 rounded-full bg-primary text-black text-[8px] font-black uppercase tracking-widest">Activo</span>}
                    </div>
                    <div className={`flex items-center gap-3 ${isHome ? '' : 'justify-end'}`}>
                        <h3 className="text-xl font-black italic uppercase tracking-tighter text-white truncate">{team.name}</h3>
                        <button
                            onClick={onToggleStalling}
                            className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest transition-all ${team.hasStalled ? 'bg-red-500/15 border-red-500/40 text-red-300' : 'bg-black/30 border-white/10 text-slate-400 hover:border-primary/30 hover:text-primary'}`}
                            title={`Marcar stalling para ${team.name}`}
                        >
                            <span className="material-symbols-outlined text-sm">flag</span>
                            <span>Stalling</span>
                        </button>
                    </div>
                    <div className={`mt-3 flex items-center gap-3 ${isHome ? '' : 'justify-end'}`}>
                        <div className="px-4 py-2 rounded-2xl border border-white/10 bg-black/45 min-w-[84px] text-center">
                            <p className="text-[8px] font-black uppercase tracking-[0.25em] text-slate-500">Resultado</p>
                            <p className="text-3xl font-black italic text-primary leading-none">{score}</p>
                        </div>
                        <div className="px-3 py-2 rounded-2xl border border-white/10 bg-black/45 text-center min-w-[74px]">
                            <p className="text-[8px] font-black uppercase tracking-[0.25em] text-slate-500">RR</p>
                            <p className="text-lg font-black text-white leading-none">{rerolls}</p>
                        </div>
                    </div>
                    <div className={`mt-3 flex flex-wrap gap-2 ${isHome ? '' : 'justify-end'}`}>
                        {(scorers.length ? scorers : [{ name: 'Sin TD', turn: 0, half: 0 }]).map((scorer, index) => (
                            <span key={`${scorer.name}-${index}`} className="px-2.5 py-1 rounded-full border border-white/10 bg-white/5 text-[8px] font-black uppercase tracking-widest text-slate-300">
                                {scorer.turn > 0 ? `T${scorer.turn}·P${scorer.half} ${scorer.name}` : scorer.name}
                            </span>
                        ))}
                    </div>
                </div>
                {!isHome && (
                    <div className="size-14 rounded-2xl border border-white/10 bg-black/50 overflow-hidden shrink-0 flex items-center justify-center">
                        {team.crestImage ? <img src={team.crestImage} alt={team.name} className="w-full h-full object-cover" /> : <span className="material-symbols-outlined text-primary">shield</span>}
                    </div>
                )}
            </div>
        </div>
    );
};

const MatchInProgress: React.FC = () => {
    const {
        liveHomeTeam,
        liveOpponentTeam,
        score,
        turn,
        half,
        activeTeamId,
        setActiveTeamId,
        setLiveHomeTeam,
        setLiveOpponentTeam,
        selectedPlayerForAction,
        setSelectedPlayerForAction,
        setIsInjuryModalOpen,
        setIsWeatherModalOpen,
        setIsMatchSummaryOpen,
        handleNextTurn,
        handleUpdatePlayerCondition,
        handleSelectTdScorer,
        handleSkillClick,
        logEvent,
        interactionState,
        setInteractionState,
        handleS3Action,
        playSound,
        gameStatus,
        handleDeselectPlayer,
        gameLog
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
    const weatherTitle = gameStatus.weather?.title || 'Perfecto';
    const weatherInfo = weatherMeta[weatherTitle as keyof typeof weatherMeta] || weatherMeta.Perfecto;
    const actionPanelEnabled = !!selectedPlayerForAction;
    const homeRerolls = liveHomeTeam.liveRerolls ?? liveHomeTeam.rerolls ?? 0;
    const opponentRerolls = liveOpponentTeam.liveRerolls ?? liveOpponentTeam.rerolls ?? 0;

    const scorers = useMemo(() => {
        const tdEvents = (gameLog || []).filter((event: any) =>
            event.type === 'touchdown' ||
            event.type === 'TOUCHDOWN' ||
            String(event.description || '').toLowerCase().includes('anota un td') ||
            String(event.description || '').toLowerCase().includes('touchdown')
        );

        return {
            home: tdEvents.filter((event: any) => event.team === 'home').map((event: any) => ({
                name: getScorerName(event, { home: liveHomeTeam, opponent: liveOpponentTeam }),
                turn: event.turn || 0,
                half: event.half || 1
            })),
            opponent: tdEvents.filter((event: any) => event.team === 'opponent').map((event: any) => ({
                name: getScorerName(event, { home: liveHomeTeam, opponent: liveOpponentTeam }),
                turn: event.turn || 0,
                half: event.half || 1
            }))
        };
    }, [gameLog, liveHomeTeam, liveOpponentTeam]);

    const primaryButtons = actionButtons.filter(button => button.group === 'primary');
    const secondaryButtons = actionButtons.filter(button => button.group === 'secondary');
    const selectedSummary = selectedPlayerForAction
        ? `${selectedPlayerForAction.customName} · ${selectedPlayerForAction.position}`
        : 'Ninguna pieza seleccionada';
    const modeSummary = mode === 'idle'
        ? 'Esperando acción'
        : mode === 'selecting_objective'
            ? 'Seleccionando objetivo'
            : 'Resolviendo tirada';

    const openPlayerActionPanel = (player: ManagedPlayer, teamId: TeamSide) => {
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

    const toggleTeamStalling = (teamId: TeamSide) => {
        const setTeam = teamId === 'home' ? setLiveHomeTeam : setLiveOpponentTeam;
        const team = teamId === 'home' ? liveHomeTeam : liveOpponentTeam;
        const nextValue = !team.hasStalled;
        setTeam(prev => prev ? ({ ...prev, hasStalled: nextValue }) : prev);
        logEvent('INFO', `${team.name} ${nextValue ? 'marca' : 'retira'} la bandera de stalling.`);
    };

    const handleTriggerAction = (type: S3ActionType | string) => {
        if (!selectedPlayerForAction) {
            logEvent('WARNING', 'Selecciona primero una pieza para habilitar la acción.');
            return;
        }

        if (type === 'TD' || type === 'TOUCHDOWN') {
            handleSelectTdScorer(selectedPlayerForAction, activeTeamId);
            setSelectedPlayerForAction(null);
            setInteractionState({
                mode: 'idle',
                pending: {
                    actorId: null,
                    actionType: null,
                    objectiveId: null,
                    diceResult: null,
                    manualMode: true
                }
            });
            return;
        }

        if (type === 'CAS') {
            setIsInjuryModalOpen(true);
            return;
        }

        const needsObjective = ['BLOCK', 'PASS', 'HANDOFF', 'FOUL'].includes(type);

        if (needsObjective) {
            setInteractionState(prev => ({
                ...prev,
                mode: 'selecting_objective',
                pending: { ...prev.pending, actorId: selectedPlayerForAction.id, actionType: type as S3ActionType }
            }));
            return;
        }

        setInteractionState(prev => ({
            ...prev,
            mode: 'awaiting_dice',
            pending: { ...prev.pending, actorId: selectedPlayerForAction.id, actionType: type as S3ActionType }
        }));
    };

    const markPlayerAsActivated = () => {
        if (!selectedPlayerForAction) return;
        const setTeam = activeTeamId === 'home' ? setLiveHomeTeam : setLiveOpponentTeam;
        setTeam(prev => prev ? ({
            ...prev,
            players: prev.players.map(player => player.id === selectedPlayerForAction.id ? { ...player, isActivated: true } : player)
        }) : prev);
        setSelectedPlayerForAction(null);
        setInteractionState({ mode: 'idle', pending: { actorId: null, actionType: null, objectiveId: null, diceResult: null, manualMode: true } });
    };

    const handleActionButton = (button: ActionButtonConfig) => {
        if (!selectedPlayerForAction) return;

        if (button.key === 'ACTION_OK') {
            markPlayerAsActivated();
            return;
        }

        if (button.key === 'BONE_HEAD') {
            handleUpdatePlayerCondition(selectedPlayerForAction.id, activeTeamId, 'isDistracted');
            return;
        }

        if (button.key === 'INDIGESTION') {
            handleUpdatePlayerCondition(selectedPlayerForAction.id, activeTeamId, 'hasIndigestion');
            return;
        }

        if (button.key === 'DODGE') {
            handleTriggerAction('DODGE');
            return;
        }

        handleTriggerAction(button.key);
    };

    return (
        <div className="font-display min-h-screen overflow-hidden flex flex-col bg-midnight text-diente-orco selection:bg-primary selection:text-midnight">
            <header className="w-full border-b border-white/5 glass px-6 py-5 z-50">
                <div className="max-w-[1800px] mx-auto space-y-4">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500">Mesa de partido</p>
                            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">Cabina de partido</h2>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 mt-1">Turnos, clima, touchdowns y acciones de mesa</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleNextTurn}
                                className="px-5 py-3 rounded-full bg-primary hover:brightness-110 text-midnight text-[10px] font-black uppercase tracking-[0.3em] shadow-lg shadow-primary/20 border-b-4 border-primary-dark transition-all"
                            >
                                Terminar turno
                            </button>
                            <button
                                onClick={() => setIsMatchSummaryOpen(true)}
                                className="size-11 rounded-full glass flex items-center justify-center hover:bg-gold hover:text-midnight transition-all group"
                                title="Resumen del partido"
                            >
                                <span className="material-symbols-outlined text-sm group-hover:rotate-90 transition-transform">tune</span>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-[1fr_auto_1fr] gap-4 items-stretch">
                        <TeamScoreCard
                            side="home"
                            team={liveHomeTeam}
                            score={score.home}
                            rerolls={homeRerolls}
                            isActive={activeTeamId === 'home'}
                            scorers={scorers.home}
                            onToggleStalling={() => toggleTeamStalling('home')}
                        />

                        <div className="rounded-[2rem] border border-gold/20 bg-black/40 px-6 py-5 flex flex-col items-center justify-center min-w-[340px]">
                            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500">Marcador central</p>
                            <div className="mt-2 flex items-center gap-5">
                                <span className="text-6xl font-black italic text-primary leading-none">{score.home}</span>
                                <span className="text-2xl font-black text-slate-600">-</span>
                                <span className="text-6xl font-black italic text-white leading-none">{score.opponent}</span>
                            </div>
                            <div className="mt-4 flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                                <span>Parte {half}</span>
                                <span className="text-white/15">•</span>
                                <span>Turno {turn}/8</span>
                                <span className="text-white/15">•</span>
                                <span className="text-primary">Actúa {activeTeam.name}</span>
                            </div>
                            <div className="mt-4 w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 grid grid-cols-3 gap-3 text-center">
                                <div>
                                    <p className="text-[8px] font-black uppercase tracking-[0.25em] text-slate-600">Equipo activo</p>
                                    <p className="mt-1 text-[11px] font-black uppercase tracking-[0.12em] text-white truncate">{activeTeam.name}</p>
                                </div>
                                <div>
                                    <p className="text-[8px] font-black uppercase tracking-[0.25em] text-slate-600">Pieza activa</p>
                                    <p className="mt-1 text-[11px] font-black uppercase tracking-[0.12em] text-primary truncate">{selectedPlayerForAction ? selectedPlayerForAction.customName : '—'}</p>
                                </div>
                                <div>
                                    <p className="text-[8px] font-black uppercase tracking-[0.25em] text-slate-600">Acción en curso</p>
                                    <p className="mt-1 text-[11px] font-black uppercase tracking-[0.12em] text-white truncate">{modeSummary}</p>
                                </div>
                            </div>
                        </div>

                        <TeamScoreCard
                            side="opponent"
                            team={liveOpponentTeam}
                            score={score.opponent}
                            rerolls={opponentRerolls}
                            isActive={activeTeamId === 'opponent'}
                            scorers={scorers.opponent}
                            onToggleStalling={() => toggleTeamStalling('opponent')}
                        />
                    </div>

                    <div className="rounded-full border border-white/10 bg-black/35 px-6 py-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[10px] font-black uppercase tracking-[0.22em]">
                        <button onClick={() => setIsWeatherModalOpen(true)} className={`inline-flex items-center gap-2 ${weatherInfo.tone} hover:brightness-110 transition-all`}>
                            <span className="material-symbols-outlined text-sm">{weatherInfo.icon}</span>
                            <span>Clima {weatherTitle}</span>
                            {weatherInfo.note && <span className="text-slate-500">{weatherInfo.note}</span>}
                        </button>
                        <span className="text-white/10">|</span>
                        <span className="inline-flex items-center gap-2 text-slate-300"><span className="material-symbols-outlined text-sm">groups</span>Afluencia {(activeTeam.fanAttendance || 12500).toLocaleString()}</span>
                        <span className="text-white/10">|</span>
                        <span className={`inline-flex items-center gap-2 ${activeTeam.tempWizard ? 'text-fuchsia-300' : 'text-slate-500'}`}><span className="material-symbols-outlined text-sm">magic_button</span>Mago {activeTeam.tempWizard ? 'Sí' : 'No'}</span>
                        <span className="text-white/10">|</span>
                        <span className="inline-flex items-center gap-2 text-gold"><span className="material-symbols-outlined text-sm">payments</span>Sobornos {activeTeam.tempBribes || 0}</span>
                        <span className="text-white/10">|</span>
                        <span className={`inline-flex items-center gap-2 ${activeTeam.apothecary && !activeTeam.apothecaryUsedOnKO ? 'text-emerald-300' : 'text-slate-500'}`}><span className="material-symbols-outlined text-sm">medical_services</span>Apotecario {activeTeam.apothecary && !activeTeam.apothecaryUsedOnKO ? 'Sí' : 'No'}</span>
                    </div>
                </div>
            </header>

            <main className="flex-1 grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_400px_minmax(0,1fr)] gap-6 overflow-hidden p-6 min-h-0">
                <MatchTeamRoster
                    team={liveHomeTeam}
                    side="home"
                    activeTeamId={activeTeamId}
                    selectedPlayerId={selectedPlayerForAction?.id ?? null}
                    locked={activeTeamId !== 'home'}
                    onSelectPlayer={(player) => openPlayerActionPanel(player, 'home')}
                />

                <aside className="rounded-[2rem] border border-gold/20 bg-black/40 backdrop-blur-xl p-5 flex flex-col min-h-0">
                    <div className="pb-4 border-b border-white/10">
                        <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500">Centro de mando</p>
                        <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white mt-1">Panel de acciones</h3>
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-600 mt-2">
                            La botonera permanece visible y solo se activa cuando eliges una pieza.
                        </p>
                    </div>

                    <div className={`mt-4 rounded-[1.75rem] border p-4 ${actionPanelEnabled ? 'border-primary/25 bg-primary/5' : 'border-white/10 bg-black/30'}`}>
                        {selectedPlayerForAction ? (
                            <div className="grid grid-cols-[72px_1fr] gap-4 items-center">
                                <div className={`size-[72px] rounded-2xl border overflow-hidden bg-black/50 shrink-0 ${selectedPlayerForAction.isDistracted ? 'border-slate-600 grayscale' : 'border-gold/30 shadow-[0_0_18px_rgba(202,138,4,0.18)]'}`}>
                                    {selectedPlayerForAction.image ? <img src={selectedPlayerForAction.image} alt={selectedPlayerForAction.customName} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl font-black text-slate-700">#{selectedPlayerForAction.id.toString().slice(-2)}</div>}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">#{selectedPlayerForAction.id.toString().slice(-2)} · {activeTeamId === 'home' ? 'Local' : 'Rival'}</p>
                                            <h4 className="text-xl font-black italic uppercase tracking-tighter text-white truncate">{selectedPlayerForAction.customName}</h4>
                                            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 truncate">{selectedPlayerForAction.position}</p>
                                        </div>
                                        <button
                                            onClick={handleDeselectPlayer}
                                            className="size-9 rounded-full border border-white/10 bg-white/5 text-slate-400 hover:bg-blood-red/20 hover:text-blood-red transition-all"
                                            title="Deseleccionar pieza"
                                        >
                                            <span className="material-symbols-outlined text-sm">close</span>
                                        </button>
                                    </div>
                                    <div className="mt-3 grid grid-cols-5 gap-1.5">
                                        {[
                                            ['MA', selectedPlayerForAction.stats.MV],
                                            ['FU', selectedPlayerForAction.stats.FU],
                                            ['AG', selectedPlayerForAction.stats.AG],
                                            ['PA', selectedPlayerForAction.stats.PA],
                                            ['AV', selectedPlayerForAction.stats.AR]
                                        ].map(([label, value]) => (
                                            <div key={String(label)} className="rounded-xl border border-white/5 bg-black/40 py-1.5 text-center">
                                                <p className="text-[8px] font-black uppercase tracking-widest text-slate-600">{label}</p>
                                                <p className="text-sm font-black text-white">{String(value).replace('undefined', '--')}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="mt-3 text-[9px] font-black uppercase tracking-[0.18em] text-slate-500 truncate">
                                        {selectedSummary}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="min-h-[150px] rounded-[1.5rem] border border-dashed border-white/10 bg-black/20 flex flex-col items-center justify-center text-center px-6">
                                <span className="material-symbols-outlined text-6xl text-slate-700 mb-3">gesture_select</span>
                                <p className="text-sm font-black uppercase tracking-[0.35em] text-slate-400">Selecciona una pieza</p>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 mt-2">La botonera se activará al instante</p>
                            </div>
                        )}
                    </div>

                    <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500">Acciones principales</p>
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">{actionPanelEnabled ? 'Panel activo' : 'Selecciona una pieza'}</p>
                        </div>
                        <div className={`grid grid-cols-2 gap-2 ${actionPanelEnabled ? '' : 'opacity-45'}`}>
                        {primaryButtons.map(button => {
                            const isToggle = button.key === 'BONE_HEAD' || button.key === 'INDIGESTION';
                            const isPressed = button.key === 'BONE_HEAD'
                                ? !!selectedPlayerForAction?.isDistracted
                                : button.key === 'INDIGESTION'
                                    ? !!selectedPlayerForAction?.hasIndigestion
                                    : false;

                            return (
                                <button
                                    key={button.key}
                                    disabled={!actionPanelEnabled || mode !== 'idle'}
                                    onClick={() => handleActionButton(button)}
                                    className={`py-3 rounded-2xl border flex flex-col items-center justify-center transition-all ${button.tone} ${isToggle && isPressed ? 'ring-2 ring-primary/50' : ''} ${!actionPanelEnabled || mode !== 'idle' ? 'cursor-not-allowed opacity-60' : ''}`}
                                >
                                    <span className="material-symbols-outlined text-base">{button.icon}</span>
                                    <span className="text-[9px] font-black uppercase mt-1 tracking-[0.18em]">{button.label}</span>
                                </button>
                            );
                        })}
                        </div>
                    </div>

                    <div className="mt-3">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500">Estados y condiciones</p>
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">Toggles de mesa</p>
                        </div>
                        <div className={`grid grid-cols-2 gap-2 ${actionPanelEnabled ? '' : 'opacity-45'}`}>
                        {secondaryButtons.map(button => {
                            const isPressed = button.key === 'BONE_HEAD'
                                ? !!selectedPlayerForAction?.isDistracted
                                : !!selectedPlayerForAction?.hasIndigestion;

                            return (
                                <button
                                    key={button.key}
                                    disabled={!actionPanelEnabled || mode !== 'idle'}
                                    onClick={() => handleActionButton(button)}
                                    className={`py-3 rounded-2xl border flex flex-col items-center justify-center transition-all ${button.tone} ${isPressed ? 'ring-2 ring-primary/50' : ''} ${!actionPanelEnabled || mode !== 'idle' ? 'cursor-not-allowed opacity-60' : ''}`}
                                >
                                    <span className="material-symbols-outlined text-base">{button.icon}</span>
                                    <span className="text-[9px] font-black uppercase mt-1 tracking-[0.18em]">{button.label}</span>
                                </button>
                            );
                        })}
                        </div>
                    </div>

                    <div className="mt-4 flex-1 min-h-0 flex flex-col">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500">Resolución</p>
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">
                                {mode === 'idle' ? 'Esperando acción' : 'Secuencia en curso'}
                            </p>
                        </div>
                        <div className="flex-1 min-h-[220px] rounded-[1.75rem] border border-white/10 bg-black/30 p-3 overflow-hidden">
                            {mode === 'idle' ? (
                                <div className="h-full flex flex-col items-center justify-center text-center px-6">
                                    <span className="material-symbols-outlined text-5xl text-slate-700 mb-3">assistant_navigation</span>
                                    <p className="text-sm font-black uppercase tracking-[0.3em] text-slate-400">Botonera preparada</p>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 mt-2">Selecciona un jugador y elige la acción desde este panel central.</p>
                                </div>
                            ) : (
                                <S3ActionOrchestrator />
                            )}
                        </div>
                    </div>
                </aside>

                <MatchTeamRoster
                    team={liveOpponentTeam}
                    side="opponent"
                    activeTeamId={activeTeamId}
                    selectedPlayerId={selectedPlayerForAction?.id ?? null}
                    locked={activeTeamId !== 'opponent'}
                    onSelectPlayer={(player) => openPlayerActionPanel(player, 'opponent')}
                />
            </main>

            <footer className="w-full glass border-t border-white/10 p-4 flex flex-col gap-4 mt-auto">
                <div className="bg-black/90 rounded-xl p-5 border border-gold/30 font-mono text-sm h-56 overflow-hidden relative shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex flex-col backdrop-blur-xl">
                    <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-3">
                        <div className="flex items-center gap-3">
                            <span className="size-2.5 rounded-full bg-gold animate-pulse shadow-[0_0_10px_rgba(212,175,55,0.8)]"></span>
                            <span className="text-gold font-black tracking-[0.3em] uppercase">Cronista de campo</span>
                        </div>
                        <span className="text-slate-500 font-bold text-[10px] tracking-widest">Blood Bowl OS v3.0</span>
                    </div>
                    <GameLog hideHeader />
                </div>
            </footer>
        </div>
    );
};

export default MatchInProgress;
