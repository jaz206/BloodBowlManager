import React from 'react';
import { useMatch } from '../context/MatchContext';
import { skillsData } from '../../../../data/skills';
import TdIcon from '../../../../components/icons/TdIcon';
import PassIcon from '../../../../components/icons/PassIcon';
import CasualtyIcon from '../../../../components/icons/CasualtyIcon';
import GameLog from '../log/GameLog';

/**
 * MatchInProgress — consola completa del partido activo.
 * Layout: sidebar izquierda | panel central de acciones | log derecho.
 * Extraído del case 'in_progress' de MatchPage.tsx (líneas 2555–3150).
 */
const MatchInProgress: React.FC = () => {
    const {
        liveHomeTeam, liveOpponentTeam,
        score, turn, half, activeTeamId, setActiveTeamId,
        selectedPlayerForAction, setSelectedPlayerForAction,
        turnActions, rosterViewId, setRosterViewId,
        setIsTdModalOpen, setIsInjuryModalOpen, setIsTurnoverModalOpen,
        setIsPrayersModalOpen, setIsWeatherModalOpen, setIsSequenceGuideOpen,
        setIsMatchSummaryOpen, setIsConcedeModalOpen, setGameState,
        handleStrategicAction, handleNextTurn, openSppModal,
        handleUpdatePlayerCondition, logEvent,
        useReroll
    } = useMatch();

    if (!liveHomeTeam || !liveOpponentTeam) {
        return (
            <div className="text-white font-display font-black text-center py-20 animate-pulse">
                Invocando escuadras...
            </div>
        );
    }

    const actions = turnActions[activeTeamId];

    return (
        <div className="flex h-[calc(100vh-180px)] gap-6 overflow-hidden animate-fade-in-slow">

            {/* ── SIDEBAR IZQUIERDA: Marcador y Recursos ── */}
            <aside className="w-80 flex flex-col gap-3 overflow-y-auto pr-1 custom-scrollbar">
                <div className="glass-panel p-4 border-white/5 bg-black/40 space-y-4">

                    {/* Scoreboard */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center bg-black/60 p-3 rounded-2xl border border-white/10 shadow-inner">
                            <div className="text-center flex-1">
                                <p className="text-[8px] font-display font-black text-sky-500 uppercase tracking-widest mb-1">Local</p>
                                <span className="text-4xl font-display font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">{score.home}</span>
                            </div>
                            <div className="text-premium-gold/30 font-black text-xl px-2 italic select-none">VS</div>
                            <div className="text-center flex-1">
                                <p className="text-[8px] font-display font-black text-red-500 uppercase tracking-widest mb-1">Rival</p>
                                <span className="text-4xl font-display font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">{score.opponent}</span>
                            </div>
                        </div>

                        {/* Reloj de Arena */}
                        <div className="bg-premium-gold/5 border border-premium-gold/20 p-3 rounded-2xl text-center relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-premium-gold/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                            <p className="text-[8px] font-display font-black text-premium-gold uppercase tracking-[0.2em] mb-1">Reloj de Arena</p>
                            <div className="flex items-center justify-center gap-3">
                                <div className="flex flex-col">
                                    <span className="text-white font-display font-black text-base leading-none italic">{half === 1 ? '1ª' : '2ª'}</span>
                                    <span className="text-[7px] text-slate-500 font-bold uppercase">Mitad</span>
                                </div>
                                <div className="w-px h-6 bg-premium-gold/20"></div>
                                <div className="flex flex-col">
                                    <span className="text-white font-display font-black text-base leading-none italic">{turn}</span>
                                    <span className="text-[7px] text-slate-500 font-bold uppercase">Turno</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Posesión Activa */}
                    <div className="space-y-2">
                        <h4 className="text-[9px] font-display font-black text-slate-600 uppercase tracking-widest px-2">Posesión Activa</h4>
                        <div className="flex gap-1.5 p-1 bg-black/60 rounded-xl border border-white/10">
                            <button
                                onClick={() => setActiveTeamId('home')}
                                className={`flex-1 py-2 rounded-lg text-[9px] font-display font-black uppercase tracking-widest transition-all duration-300 ${activeTeamId === 'home' ? 'bg-sky-500 text-black shadow-[0_0_15px_rgba(14,165,233,0.3)]' : 'text-slate-500 hover:text-sky-400'}`}
                            >
                                {liveHomeTeam?.name?.split(' ')[0] || 'Local'}
                            </button>
                            <button
                                onClick={() => setActiveTeamId('opponent')}
                                className={`flex-1 py-2 rounded-lg text-[9px] font-display font-black uppercase tracking-widest transition-all duration-300 ${activeTeamId === 'opponent' ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.3)]' : 'text-slate-500 hover:text-red-400'}`}
                            >
                                {liveOpponentTeam?.name?.split(' ')[0] || 'Rival'}
                            </button>
                        </div>
                    </div>

                    {/* Segundas Oportunidades (Rerolls) */}
                    <div className="space-y-4 pt-6 border-t border-white/5">
                        <div className="grid grid-cols-2 gap-4">
                            {(['home', 'opponent'] as const).map(teamId => {
                                const team = teamId === 'home' ? liveHomeTeam : liveOpponentTeam;
                                const color = teamId === 'home' ? 'sky' : 'red';
                                return (
                                    <div key={teamId} className={`bg-${color}-500/5 border border-${color}-500/20 p-4 rounded-2xl flex flex-col items-center gap-2 group transition-all hover:bg-${color}-500/10`}>
                                        <span className={`text-[9px] font-display font-black text-${color}-500 uppercase tracking-tighter`}>S.Op.</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl font-display font-black text-white">{team.liveRerolls || 0}</span>
                                            <button
                                                onClick={() => useReroll(teamId)}
                                                disabled={(team.liveRerolls || 0) === 0}
                                                className={`w-7 h-7 rounded-xl bg-${color}-600 text-white flex items-center justify-center hover:bg-${color}-500 disabled:opacity-20 transition-all active:scale-90 shadow-lg`}
                                            >
                                                <span className="material-symbols-outlined text-sm font-black">remove</span>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Dugout / Casualty Summary */}
                    <div className="space-y-3 pt-6 border-t border-white/5">
                        <h4 className="text-[10px] font-display font-black text-slate-500 uppercase tracking-widest px-2">Baneados y Bajas</h4>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-amber-500 text-sm">hotel</span>
                                    <span className="text-[10px] font-display font-bold text-slate-400 uppercase">KO</span>
                                </div>
                                <span className="text-xs font-display font-black text-white">
                                    <span className="text-sky-400">{liveHomeTeam.players.filter((p: any) => p.status === 'KO').length}</span>
                                    <span className="mx-1 text-slate-600">|</span>
                                    <span className="text-red-400">{liveOpponentTeam.players.filter((p: any) => p.status === 'KO').length}</span>
                                </span>
                            </div>
                            <div className="flex justify-between items-center p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-blood-red text-sm">skull</span>
                                    <span className="text-[10px] font-display font-bold text-slate-400 uppercase">Bajas Críticas</span>
                                </div>
                                <span className="text-xs font-display font-black text-white">
                                    <span className="text-sky-400">{liveHomeTeam.players.filter((p: any) => ['Lesionado', 'Expulsado', 'Muerto'].includes(p.status || '')).length}</span>
                                    <span className="mx-1 text-slate-600">|</span>
                                    <span className="text-red-400">{liveOpponentTeam.players.filter((p: any) => ['Lesionado', 'Expulsado', 'Muerto'].includes(p.status || '')).length}</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom CTA buttons */}
                <div className="space-y-3 mt-auto">
                    <button
                        onClick={() => setIsMatchSummaryOpen(true)}
                        className="w-full text-[10px] font-display font-black uppercase tracking-[0.3em] bg-sky-500/10 border border-sky-500/30 text-sky-500 hover:bg-sky-500 hover:text-black py-4 px-6 rounded-2xl transition-all shadow-xl flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined text-sm">leaderboard</span>
                        Resumen de Encuentro
                    </button>
                    <button
                        onClick={() => setGameState('post_game')}
                        className="w-full text-[10px] font-display font-black uppercase tracking-[0.3em] bg-blood-red/10 border border-blood-red/30 text-blood-red hover:bg-black hover:text-white py-4 px-6 rounded-2xl transition-all shadow-xl"
                    >
                        Finalizar Encuentro
                    </button>
                    <button
                        onClick={() => setIsConcedeModalOpen(true)}
                        className="w-full text-[10px] font-display font-black uppercase tracking-[0.3em] bg-white/5 border border-white/10 text-slate-500 hover:text-white py-3 px-6 rounded-2xl transition-all"
                    >
                        Conceder Partido
                    </button>
                </div>
            </aside>

            {/* ── PANEL CENTRAL: Consola de Jugador y Acciones ── */}
            <main className="flex-1 flex flex-col gap-6 overflow-hidden">

                {/* Player Selection Header */}
                <div className="glass-panel p-4 border-premium-gold/30 bg-black/60 shadow-[0_0_50px_rgba(245,159,10,0.1)] flex-shrink-0 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-premium-gold/5 blur-[100px] -z-10"></div>
                    {selectedPlayerForAction ? (
                        <div className="flex items-center gap-6 animate-slide-in-up">
                            {/* Avatar */}
                            <div className="relative">
                                <div className="w-16 h-16 rounded-2xl bg-premium-gold/5 border-2 border-premium-gold/20 flex items-center justify-center overflow-hidden shadow-2xl">
                                    <span className="material-symbols-outlined text-premium-gold text-3xl">person</span>
                                </div>
                                <div className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-xl ${activeTeamId === 'home' ? 'bg-sky-500' : 'bg-red-600'} flex items-center justify-center border-2 border-black`}>
                                    <span className="text-[10px] font-display font-black text-white">#{selectedPlayerForAction.id.toString().slice(-2)}</span>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="flex-grow min-w-0">
                                <div className="flex items-center gap-4 mb-1">
                                    <h3 className="text-2xl font-display font-black text-white uppercase italic tracking-tighter truncate leading-none">
                                        {selectedPlayerForAction.customName}
                                    </h3>
                                    <span className={`px-1.5 py-0.5 rounded text-[7px] font-display font-black uppercase tracking-widest ${activeTeamId === 'home' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' : 'bg-red-500/20 text-red-500 border border-red-500/30'}`}>
                                        {activeTeamId === 'home' ? liveHomeTeam.name : liveOpponentTeam.name}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-display font-black text-slate-500 uppercase tracking-widest leading-none">
                                        {selectedPlayerForAction.position}
                                    </span>
                                    {selectedPlayerForAction.status !== 'Activo' && (
                                        <span className={`px-2 py-1 rounded-md text-[9px] font-display font-black uppercase tracking-widest ${selectedPlayerForAction.status === 'KO' ? 'bg-amber-500 text-black' : selectedPlayerForAction.status === 'Expulsado' ? 'bg-red-600 text-white' : 'bg-blood-red text-white'}`}>
                                            {selectedPlayerForAction.status}: {selectedPlayerForAction.statusDetail || 'Baja en Arena'}
                                        </span>
                                    )}
                                </div>

                                {/* Stats */}
                                <div className="flex gap-4 items-center">
                                    <div className="flex gap-4">
                                        {[
                                            { l: 'MA', v: selectedPlayerForAction.stats.MV, penalty: selectedPlayerForAction.hasIndigestion ? -1 : 0, isRoll: false },
                                            { l: 'ST', v: selectedPlayerForAction.stats.FU, isRoll: false },
                                            { l: 'AG', v: selectedPlayerForAction.stats.AG, isRoll: true },
                                            { l: 'PA', v: selectedPlayerForAction.stats.PA, isRoll: true },
                                            { l: 'AV', v: selectedPlayerForAction.stats.AR, penalty: selectedPlayerForAction.hasIndigestion ? -1 : 0, isRoll: true }
                                        ].map(s => {
                                            const baseStr = s.v?.toString() || '';
                                            const baseValue = parseInt(baseStr.replace('+', ''));
                                            const hasValue = !isNaN(baseValue);
                                            const finalValue = hasValue ? baseValue + (s.penalty || 0) : baseStr;
                                            return (
                                                <div key={s.l} className="flex flex-col items-center min-w-[32px]">
                                                    <span className="text-[8px] text-premium-gold/50 font-display font-black uppercase tracking-widest leading-none mb-1">{s.l}</span>
                                                    <span className={`text-base font-display font-black leading-none ${s.penalty && hasValue ? 'text-amber-500' : 'text-white'}`}>
                                                        {finalValue}{hasValue && s.isRoll && '+'}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="h-8 w-px bg-white/10"></div>

                                    {/* S3 Conditions */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleUpdatePlayerCondition(selectedPlayerForAction.id, activeTeamId, 'isDistracted')}
                                            className={`p-2 rounded-xl border transition-all flex items-center gap-1.5 ${selectedPlayerForAction.isDistracted ? 'bg-red-500/20 border-red-500 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'bg-white/5 border-white/10 text-slate-500 hover:border-white/20'}`}
                                            title="Distraído (Sin Zona de Defensa)"
                                        >
                                            <span className="material-symbols-outlined text-sm">{selectedPlayerForAction.isDistracted ? 'psychology_alt' : 'psychology'}</span>
                                            <span className="text-[8px] font-black uppercase tracking-tighter">Distraído</span>
                                        </button>
                                        <button
                                            onClick={() => handleUpdatePlayerCondition(selectedPlayerForAction.id, activeTeamId, 'hasIndigestion')}
                                            className={`p-2 rounded-xl border transition-all flex items-center gap-1.5 ${selectedPlayerForAction.hasIndigestion ? 'bg-amber-500/20 border-amber-500 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'bg-white/5 border-white/10 text-slate-500 hover:border-white/20'}`}
                                            title="Indigestión (-1 MV, -1 AR)"
                                        >
                                            <span className="material-symbols-outlined text-sm">restaurant</span>
                                            <span className="text-[8px] font-black uppercase tracking-tighter">Indigestión</span>
                                        </button>
                                    </div>

                                    <div className="h-8 w-px bg-white/10"></div>

                                    {/* Skills */}
                                    <div className="flex flex-wrap gap-1.5">
                                        {[
                                            ...(selectedPlayerForAction.skillKeys || []),
                                            ...(selectedPlayerForAction.gainedSkills || [])
                                        ].map((keyOrName: string, i: number) => {
                                            const skillEntry = skillsData.find((s: any) => s.keyEN === keyOrName || s.name_es === keyOrName || s.name_en === keyOrName);
                                            const displayName = skillEntry?.name_es || keyOrName;
                                            return (
                                                <button
                                                    key={i}
                                                    onClick={() => {
                                                        const cleanedName = (displayName || '').split('(')[0].trim();
                                                        const found = skillsData.find((s: any) => s.name.toLowerCase().startsWith(cleanedName.toLowerCase()));
                                                    }}
                                                    className={`text-[10px] font-display font-bold px-2 py-1 rounded-md transition-all border border-transparent ${selectedPlayerForAction.isDistracted ? 'text-slate-600 line-through opacity-50 cursor-not-allowed' : 'text-sky-400 hover:text-white hover:bg-sky-400/10 hover:border-sky-400/30'}`}
                                                    disabled={selectedPlayerForAction.isDistracted}
                                                    title={skillEntry?.desc_es || ''}
                                                >
                                                    {displayName}
                                                </button>
                                            );
                                        })}
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

                        {/* TD */}
                        <ActionButton icon={<TdIcon className="w-6 h-6 text-green-500" />} label="Cantar Touchdown" color="green" onClick={() => setIsTdModalOpen(true)} />

                        {/* Lesión */}
                        <ActionButton icon={<CasualtyIcon className="w-6 h-6 text-orange-500" />} label="Registrar Baja" color="orange" onClick={() => setIsInjuryModalOpen(true)} />

                        {/* Falta */}
                        <ActionButton
                            icon={<span className="material-symbols-outlined text-amber-500 text-2xl">skull</span>}
                            label="Cometer Falta" color="amber"
                            onClick={() => handleStrategicAction('foul')}
                            disabled={actions.foul}
                        />

                        {/* Blitz */}
                        <ActionButton
                            icon={<span className="material-symbols-outlined text-amber-500 text-2xl">bolt</span>}
                            label="Realizar Blitz" color="amber"
                            onClick={() => handleStrategicAction('blitz')}
                            disabled={actions.blitz}
                        />

                        {/* Pase de Mano */}
                        <ActionButton
                            icon={<span className="material-symbols-outlined text-green-500 text-2xl">pan_tool</span>}
                            label="Entregar Balón" color="green"
                            onClick={() => handleStrategicAction('handoff')}
                            disabled={actions.handoff}
                        />

                        {/* Pase */}
                        <ActionButton
                            icon={<PassIcon className="w-6 h-6 text-sky-400" />}
                            label="Lanzar Pase" color="sky"
                            onClick={() => handleStrategicAction('pass')}
                            disabled={actions.pass}
                        />

                        {/* Asegurar Balón */}
                        <ActionButton
                            icon={<span className="material-symbols-outlined text-sky-400 text-2xl">shield</span>}
                            label="Asegurar Balón" color="sky"
                            onClick={() => logEvent('INFO', `¡ASEGURAR BALÓN! ${selectedPlayerForAction?.customName || 'Un jugador'} protege el cuero.`, { team: activeTeamId, player: selectedPlayerForAction?.id })}
                        />

                        {/* Stalling */}
                        <ActionButton
                            icon={<span className="material-symbols-outlined text-amber-500 text-2xl">timer</span>}
                            label="Stalling Check" color="amber"
                            onClick={() => logEvent('INFO', `¡STALLING CHECK! ${selectedPlayerForAction?.customName || 'Un jugador'} pierde tiempo.`, { team: activeTeamId, player: selectedPlayerForAction?.id })}
                        />

                        {/* Turnover */}
                        <ActionButton
                            icon={<span className="material-symbols-outlined text-2xl">error</span>}
                            label="¡TURNOVER!" color="blood-red"
                            onClick={() => setIsTurnoverModalOpen(true)}
                        />

                        {/* Desviar Pase */}
                        <ActionButton
                            icon={<span className="material-symbols-outlined text-sky-400 text-2xl">front_hand</span>}
                            label="Desviar Pase" color="sky"
                            onClick={() => openSppModal('deflect')}
                        />

                        {/* Lanzar Compañero */}
                        <ActionButton
                            icon={<span className="material-symbols-outlined text-sky-500 text-2xl">hail</span>}
                            label="Lanzar Compañero" color="sky"
                            onClick={() => openSppModal('throw_team_mate')}
                        />

                        {/* Cambiar Turno */}
                        <ActionButton
                            icon={<span className="material-symbols-outlined text-2xl">forward</span>}
                            label="Cambiar Turno" color="premium-gold"
                            onClick={handleNextTurn}
                            dashed
                        />
                    </div>

                    {/* Event Quick Bar */}
                    <div className="mt-10 flex flex-wrap gap-4">
                        <QuickBarButton label="Intervención Divina" icon="edit_note" color="premium-gold" onClick={() => {/* setIsCustomEventModalOpen(true) */}} />
                        <QuickBarButton label="Plegarias" icon="auto_awesome" color="sky-400" onClick={() => setIsPrayersModalOpen(true)} />
                        <QuickBarButton label="Vientos de Nuffle" icon="cyclone" color="amber-400" onClick={() => setIsWeatherModalOpen(true)} />
                        <QuickBarButton label="Guía de Secuencia" icon="list_alt" color="premium-gold" onClick={() => setIsSequenceGuideOpen(true)} />
                    </div>
                </div>

                {/* Bottom Roster Switcher */}
                <div className="mt-auto bg-black/40 rounded-t-[2.5rem] border-t border-white/5 p-4 space-y-4">
                    <div className="flex bg-black/60 rounded-full p-1 max-w-sm mx-auto border border-white/5">
                        <button
                            onClick={() => setRosterViewId('home')}
                            className={`flex-1 py-1.5 rounded-full text-[9px] font-display font-black uppercase tracking-widest transition-all ${rosterViewId === 'home' ? 'bg-sky-500 text-black' : 'text-slate-500'}`}
                        >
                            Local ({liveHomeTeam.players.filter((p: any) => p.status === 'Activo').length}/11)
                        </button>
                        <button
                            onClick={() => setRosterViewId('opponent')}
                            className={`flex-1 py-1.5 rounded-full text-[9px] font-display font-black uppercase tracking-widest transition-all ${rosterViewId === 'opponent' ? 'bg-red-600 text-white' : 'text-slate-500'}`}
                        >
                            Rival ({liveOpponentTeam.players.filter((p: any) => p.status === 'Activo').length}/11)
                        </button>
                    </div>

                    <div className="px-4">
                        <RosterTokenGrid
                            team={rosterViewId === 'home' ? liveHomeTeam : liveOpponentTeam}
                            teamId={rosterViewId}
                            selectedId={selectedPlayerForAction?.id}
                            onSelect={(p: any) => { setSelectedPlayerForAction(p); setActiveTeamId(rosterViewId); }}
                        />
                    </div>
                </div>
            </main>

            {/* ── SIDEBAR DERECHA: Game Log ── */}
            <aside className="w-72 flex flex-col glass-panel border-white/5 bg-black/40 p-4 overflow-hidden">
                <GameLog />
            </aside>
        </div>
    );
};

// ──────────────────────────────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────────────────────────────

const ActionButton: React.FC<{
    icon: React.ReactNode;
    label: string;
    color: string;
    onClick: () => void;
    disabled?: boolean;
    dashed?: boolean;
}> = ({ icon, label, color, onClick, disabled, dashed }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`group relative overflow-hidden text-white font-display font-black p-5 rounded-[1.5rem] transition-all duration-500 shadow-xl flex flex-col items-center gap-3
      ${disabled ? 'bg-white/5 border-2 border-white/5 opacity-40 cursor-not-allowed' : `bg-${color}-950/20 border-2 ${dashed ? 'border-dashed' : ''} border-${color}-500/20 hover:bg-${color}-500 hover:text-black hover:border-${color}-400`}`}
    >
        <div className={`w-12 h-12 bg-${color}-500/10 rounded-xl flex items-center justify-center border border-${color}-500/30 group-hover:bg-black group-hover:border-black group-hover:scale-110 transition-all duration-300`}>
            {icon}
        </div>
        <span className="uppercase italic text-[9px] tracking-[0.2em]">{label}</span>
    </button>
);

const QuickBarButton: React.FC<{
    label: string;
    icon: string;
    color: string;
    onClick: () => void;
}> = ({ label, icon, color, onClick }) => (
    <button
        onClick={onClick}
        className={`group bg-white/5 border border-white/5 px-6 py-4 rounded-2xl text-[10px] font-display font-black uppercase tracking-widest text-slate-400 hover:text-${color} hover:border-${color}/30 hover:bg-${color}/5 transition-all flex items-center gap-3`}
    >
        <span className="material-symbols-outlined text-lg">{icon}</span>
        {label}
    </button>
);

const RosterTokenGrid: React.FC<{
    team: any;
    teamId: 'home' | 'opponent';
    selectedId?: number;
    onSelect: (p: any) => void;
}> = ({ team, teamId, selectedId, onSelect }) => {
    const color = teamId === 'home' ? 'sky' : 'red';
    const activeText = teamId === 'home' ? 'text-black' : 'text-white';
    const activeBg = teamId === 'home' ? 'bg-sky-500 border-sky-300' : 'bg-red-600 border-red-400';

    const onField = team.players.filter((p: any) => p.status === 'Activo');
    const offField = team.players.filter((p: any) => p.status !== 'Activo');

    return (
        <div className="space-y-4">
            <div className="space-y-1">
                <p className={`text-[8px] font-black text-${color}-500/60 uppercase tracking-widest text-center mb-1`}>Titulares en Campo</p>
                <div className="flex flex-wrap justify-center gap-2">
                    {onField.map((p: any) => (
                        <div
                            key={p.id}
                            onClick={() => onSelect(p)}
                            className={`w-11 h-11 rounded-2xl border flex items-center justify-center cursor-pointer transition-all duration-300 relative ${selectedId === p.id ? `${activeBg} shadow-[0_0_15px_rgba(14,165,233,0.4)] z-20 scale-110` : 'bg-black/60 border-white/10 hover:border-sky-500/50'}`}
                        >
                            <span className={`text-sm font-display font-black ${selectedId === p.id ? activeText : 'text-slate-400'}`}>{p.id.toString().slice(-2)}</span>
                        </div>
                    ))}
                    {onField.length === 0 && <span className="text-[8px] font-bold text-slate-600 uppercase opacity-30 py-4">Sin despliegue activo</span>}
                </div>
            </div>
            <div className="space-y-1">
                <p className="text-[8px] font-black text-slate-700 uppercase tracking-widest text-center mb-1">Banquillo y Bajas</p>
                <div className="flex flex-wrap justify-center gap-2">
                    {offField.map((p: any) => (
                        <div
                            key={p.id}
                            onClick={() => onSelect(p)}
                            className={`w-9 h-9 rounded-xl border flex items-center justify-center cursor-pointer transition-all duration-300 opacity-60 hover:opacity-100 relative ${selectedId === p.id ? `bg-${color}-500/30 border-${color}-500 shadow-lg scale-105 opacity-100` : 'bg-black/40 border-dashed border-white/10'}`}
                        >
                            <span className={`text-[10px] font-display font-bold ${selectedId === p.id ? `text-${color}-300` : 'text-slate-600'}`}>{p.id.toString().slice(-2)}</span>
                            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-black border border-white/20 flex items-center justify-center scale-90">
                                <span className="material-symbols-outlined text-[6px] text-amber-500">{p.status === 'KO' ? 'hotel' : 'skull'}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MatchInProgress;
