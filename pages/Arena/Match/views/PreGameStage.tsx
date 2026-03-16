import React from 'react';
import { useMatch } from '../context/MatchContext';
import { teamsData } from '../../../../data/teams';
import { starPlayersData } from '../../../../data/starPlayers';
import { weatherConditions } from '../../../../data/weather';
import { kickoffEvents } from '../../../../data/kickoffEvents';
import MiniField from '../../../../components/common/MiniField';
import PlayerStatusCard from '../../../../components/arena/PlayerStatusCard';
import ShieldCheckIcon from '../../../../components/icons/ShieldCheckIcon';
import { DiceRollButton } from '../components/MatchUIComponents';
import { StarPlayer, Team } from '../../../../types';

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────
const isEligibleStar = (star: StarPlayer, teamRoster: Team | undefined) => {
    if (!teamRoster) return false;
    const teamRules = (teamRoster.specialRules || teamRoster.specialRules_es || '').split(', ').map((r: string) => r.trim());
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

// ────────────────────────────────────────────────────────────
// SubComponent: JourneymenNotification
// ────────────────────────────────────────────────────────────
const JourneymenNotification: React.FC = () => {
    const { journeymenNotification, handleConfirmJourneymen } = useMatch();
    if (!journeymenNotification) return null;
    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="glass-panel p-8 max-w-sm w-full text-center border-premium-gold/30 shadow-[0_0_50px_rgba(245,159,10,0.2)] animate-slide-in-up">
                <div className="w-16 h-16 bg-premium-gold/10 rounded-2xl border border-premium-gold/30 flex items-center justify-center mx-auto mb-6">
                    <span className="material-symbols-outlined text-3xl text-premium-gold">person_add</span>
                </div>
                <h3 className="text-xl font-display font-black text-premium-gold uppercase italic tracking-tighter mb-4">Sustitutos Requeridos</h3>
                <p className="text-slate-400 text-sm mb-8 leading-relaxed whitespace-pre-wrap">{journeymenNotification}</p>
                <button
                    onClick={handleConfirmJourneymen}
                    className="w-full bg-premium-gold text-black font-display font-black py-3 rounded-xl uppercase tracking-widest text-xs hover:bg-white hover:scale-105 transition-all shadow-lg"
                >
                    Entendido, Capitán
                </button>
            </div>
        </div>
    );
};

// ────────────────────────────────────────────────────────────
// SubComponent: Step 1 — Inducements + Fate + Coin Toss
// ────────────────────────────────────────────────────────────
const CommandCenterStep: React.FC = () => {
    const {
        liveHomeTeam, liveOpponentTeam, gameStatus, setGameStatus,
        inducementState, setInducementState, fame, setFame,
        fansRoll, setFansRoll, logEvent, playSound,
        setFirstHalfReceiver, setPreGameStep,
        handleBuyInducement, handleSellInducement,
        handleHireStar, handleFireStar, setSelectedStarPlayer
    } = useMatch();

    if (!liveHomeTeam || !liveOpponentTeam) return null;

    const underdogTeam = inducementState.underdog === 'home' ? liveHomeTeam : liveOpponentTeam;
    const baseRoster = underdogTeam ? teamsData.find((t: any) => t.name === underdogTeam.rosterName) : null;
    const eligibleStars = baseRoster ? starPlayersData.filter((star: StarPlayer) => isEligibleStar(star, baseRoster)) : [];
    const bribeCost = baseRoster?.specialRules.includes("Sobornos y corrupción") ? 50000 : 100000;
    const isUndead = ["Nigrománticos", "No Muertos", "Khemri", "Vampiros"].includes(underdogTeam?.rosterName || '');
    const isNurgle = underdogTeam?.rosterName === "Nurgle";
    const canHaveApo = baseRoster?.apothecary === "Sí";

    const options = underdogTeam ? [
        { name: 'reroll', icon: 'refresh', label: 'Reroll Extra', cost: 100000, count: (underdogTeam.liveRerolls || 0) - underdogTeam.rerolls },
        { name: 'bribe', icon: 'payments', label: 'Soborno', cost: bribeCost, count: underdogTeam.tempBribes || 0 },
        { name: 'cheerleader', icon: 'campaign', label: 'Animadora', cost: 10000, count: underdogTeam.tempCheerleaders || 0 },
        { name: 'coach', icon: 'person', label: 'Ayudante', cost: 10000, count: underdogTeam.tempAssistantCoaches || 0 },
        { name: 'biasedRef', icon: 'gavel', label: 'Árbitro Parcial', cost: 50000, count: underdogTeam.biasedRef ? 1 : 0 },
        ...(canHaveApo ? [{ name: 'wanderingApothecary', icon: 'medical_services', label: 'Boticario', cost: 100000, count: underdogTeam.wanderingApothecaries || 0 }] : []),
        ...(isUndead ? [{ name: 'mortuaryAssistant', icon: 'skull', label: 'Asistente Necromante', cost: 100000, count: underdogTeam.mortuaryAssistants || 0 }] : []),
        ...(isNurgle ? [{ name: 'plagueDoctor', icon: 'coronavirus', label: 'Médico de la Peste', cost: 100000, count: underdogTeam.plagueDoctors || 0 }] : []),
    ] : [];

    const handleWeatherRoll = () => {
        const die1 = Math.floor(Math.random() * 6) + 1;
        const die2 = Math.floor(Math.random() * 6) + 1;
        const total = die1 + die2;
        const w = weatherConditions.find(wc => {
            if (wc.diceRoll.includes('-')) {
                const [min, max] = wc.diceRoll.split('-').map(Number);
                return total >= min && total <= max;
            }
            return wc.diceRoll === total.toString();
        });
        if (w) {
            setGameStatus((prev: any) => ({ ...prev, weather: w }));
            logEvent('INFO', `Clima Invocado (${die1}+${die2}=${total}): ${w.title}`);
        }
        playSound('dice');
    };

    const handleFansRoll = () => {
        const hf = (Math.floor(Math.random() * 6) + 1) + (Math.floor(Math.random() * 6) + 1);
        const of = (Math.floor(Math.random() * 6) + 1) + (Math.floor(Math.random() * 6) + 1);
        const hTotal = liveHomeTeam.dedicatedFans + hf;
        const oTotal = liveOpponentTeam.dedicatedFans + of;
        let homeFame = 0, oppFame = 0;
        if (hTotal >= oTotal * 2) homeFame = 2; else if (hTotal > oTotal) homeFame = 1;
        if (oTotal >= hTotal * 2) oppFame = 2; else if (oTotal > hTotal) oppFame = 1;
        setFame({ home: homeFame, opponent: oppFame });
        setFansRoll({ home: hf.toString(), opponent: of.toString() });
        logEvent('INFO', `Hinchas — ${liveHomeTeam.name}: ${hTotal} (${homeFame} FAMA), ${liveOpponentTeam.name}: ${oTotal} (${oppFame} FAMA)`);
        playSound('dice');
    };

    return (
        <div className='space-y-10 animate-fade-in'>
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">

                {/* ── Left: Mercado de Incentivos ── */}
                <div className="xl:col-span-7 space-y-6">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-10 h-10 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                            <span className="material-symbols-outlined text-green-500">payments</span>
                        </div>
                        <h3 className="text-xl font-display font-black text-white uppercase italic">Mercado de Incentivos</h3>
                    </div>

                    {inducementState.underdog ? (
                        <div className="space-y-6">
                            {/* Wallet */}
                            <div className="glass-panel p-6 border-green-500/20 bg-green-500/5 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-display font-black text-green-500 uppercase tracking-widest mb-1">Tesoro de Indulgencia</p>
                                    <p className="text-3xl font-display font-black text-white italic">
                                        {inducementState.money.toLocaleString()} <span className="text-xs text-green-500/50">m.o.</span>
                                    </p>
                                </div>
                                <div className="w-16 h-16 rounded-full bg-black/60 border border-white/10 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-green-500 text-3xl">account_balance_wallet</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Options */}
                                <div className="space-y-3">
                                    <h4 className="text-[10px] font-display font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Favores y Personal</h4>
                                    {options.map(item => (
                                        <div key={item.name} className="flex justify-between items-center bg-white/5 p-3 rounded-2xl border border-white/5 group hover:border-premium-gold/30 transition-all">
                                            <div className="flex items-center gap-3">
                                                <span className="material-symbols-outlined text-lg text-slate-500 group-hover:text-premium-gold">{item.icon}</span>
                                                <div>
                                                    <p className="text-[10px] font-bold text-white uppercase tracking-wider">{item.label}</p>
                                                    <p className="text-[8px] text-slate-500 font-bold">{item.cost / 1000}k</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button onClick={() => handleSellInducement(item.name, item.cost)} className="w-8 h-8 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">
                                                    <span className="material-symbols-outlined text-sm">remove</span>
                                                </button>
                                                <span className="font-display font-black text-white text-lg w-6 text-center">{item.count}</span>
                                                <button onClick={() => handleBuyInducement(item.name, item.cost)} className="w-8 h-8 rounded-xl bg-green-500/10 text-green-500 flex items-center justify-center hover:bg-green-500 hover:text-white transition-all">
                                                    <span className="material-symbols-outlined text-sm">add</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Star Players */}
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-display font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Jugadores Estrella</h4>
                                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                        {eligibleStars.map((star: StarPlayer) => {
                                            const isHired = inducementState.hiredStars.some((s: StarPlayer) => s.name === star.name);
                                            return (
                                                <div key={star.name} className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${isHired ? 'bg-premium-gold/10 border-premium-gold/40' : 'bg-white/5 border-white/5 hover:border-white/20'}`}>
                                                    <div className="flex-1 min-w-0 mr-4">
                                                        <button onClick={() => setSelectedStarPlayer(star)} className="text-[10px] font-black text-white hover:text-premium-gold uppercase italic tracking-tighter truncate w-full text-left transition-colors">{star.name}</button>
                                                        <p className="text-[8px] font-bold text-slate-500">{star.cost / 1000}k m.o.</p>
                                                    </div>
                                                    <button
                                                        onClick={() => isHired ? handleFireStar(star) : handleHireStar(star)}
                                                        disabled={!isHired && inducementState.money < star.cost}
                                                        className={`p-2 rounded-xl transition-all ${isHired ? 'text-red-500 hover:bg-red-500/10' : 'text-green-500 hover:bg-green-500/10 disabled:opacity-20'}`}
                                                    >
                                                        <span className="material-symbols-outlined text-sm">{isHired ? 'person_remove' : 'person_add'}</span>
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="glass-panel p-10 border-white/5 bg-white/5 text-center space-y-4">
                            <div className="w-16 h-16 mx-auto bg-white/10 rounded-full flex items-center justify-center mb-2">
                                <span className="material-symbols-outlined text-slate-500 text-3xl">balance</span>
                            </div>
                            <p className="text-slate-400 text-sm font-medium italic">"Los equipos están equilibrados. Nuffle no otorga oro adicional hoy."</p>
                        </div>
                    )}
                </div>

                {/* ── Right: Destino y Entorno ── */}
                <div className="xl:col-span-5 space-y-8">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-10 h-10 rounded-full bg-sky-500/10 border border-sky-500/30 flex items-center justify-center">
                            <span className="material-symbols-outlined text-sky-400">cyclone</span>
                        </div>
                        <h3 className="text-xl font-display font-black text-white uppercase italic">Destino y Entorno</h3>
                    </div>
                    <div className="glass-panel p-6 border-white/10 bg-black/40 space-y-4">
                        {/* Clima */}
                        <div className={`p-4 rounded-2xl border transition-all ${gameStatus.weather ? 'bg-sky-500/10 border-sky-500/30' : 'bg-white/5 border-white/5'}`}>
                            <p className="text-[10px] font-display font-black text-sky-400 uppercase tracking-widest mb-2">Clima</p>
                            {gameStatus.weather ? (
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-2xl text-white">cloud_queue</span>
                                    <h4 className="text-lg font-display font-black text-white uppercase italic">{gameStatus.weather.title}</h4>
                                </div>
                            ) : (
                                <p className="text-[10px] text-slate-500 uppercase font-bold italic tracking-wider mb-3">Pendiente de Consultar</p>
                            )}
                        </div>
                        <button
                            disabled={!!gameStatus.weather}
                            onClick={handleWeatherRoll}
                            className={`w-full font-display font-black py-3 rounded-2xl transition-all flex items-center justify-center gap-3 text-[10px] uppercase tracking-[0.2em] ${gameStatus.weather ? 'bg-green-900/30 text-green-500 border border-green-500/20 cursor-not-allowed opacity-60' : 'bg-sky-500 text-black hover:scale-105 active:scale-95 shadow-lg'}`}
                        >
                            <span className="material-symbols-outlined text-base">{gameStatus.weather ? 'check_circle' : 'thunderstorm'}</span>
                            {gameStatus.weather ? 'Clima Registrado' : 'Tirar Clima (2D6)'}
                        </button>

                        {/* Fans / FAMA */}
                        <div className={`p-4 rounded-2xl border transition-all ${fansRoll.home ? 'bg-amber-500/10 border-amber-500/30' : 'bg-white/5 border-white/5'}`}>
                            <p className="text-[10px] font-display font-black text-amber-500 uppercase tracking-widest mb-2">Influencia de FAMA</p>
                            {fansRoll.home ? (
                                <div className="flex justify-around items-center text-center">
                                    <div>
                                        <p className="text-[8px] font-bold text-slate-500 uppercase mb-1">Local</p>
                                        <p className="text-xl font-display font-black text-white leading-none">+{fame.home}</p>
                                    </div>
                                    <div className="w-px h-8 bg-white/10"></div>
                                    <div>
                                        <p className="text-[8px] font-bold text-slate-500 uppercase mb-1">Rival</p>
                                        <p className="text-xl font-display font-black text-white leading-none">+{fame.opponent}</p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-[10px] text-slate-500 uppercase font-bold italic tracking-wider">Sin Registro del Grito</p>
                            )}
                        </div>
                        <button
                            disabled={!!fansRoll.home}
                            onClick={handleFansRoll}
                            className={`w-full font-display font-black py-3 rounded-2xl transition-all flex items-center justify-center gap-3 text-[10px] uppercase tracking-[0.2em] ${fansRoll.home ? 'bg-green-900/30 text-green-500 border border-green-500/20 cursor-not-allowed opacity-60' : 'bg-amber-500 text-black hover:scale-105 active:scale-95 shadow-lg'}`}
                        >
                            <span className="material-symbols-outlined text-base">{fansRoll.home ? 'check_circle' : 'groups'}</span>
                            {fansRoll.home ? 'Hinchas Registrados' : 'Tirar Hinchas (2D6+2D6)'}
                        </button>
                    </div>

                    {/* Coin Toss — visible solo cuando clima y fans están listos */}
                    <div className={`space-y-6 transition-all duration-500 ${(!gameStatus.weather || !fansRoll.home) ? 'opacity-40 pointer-events-none select-none' : 'opacity-100'}`}>
                        <div className="flex items-center gap-4 mb-2">
                            <div className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${(gameStatus.weather && fansRoll.home) ? 'bg-amber-500/10 border-amber-500/30' : 'bg-white/5 border-white/10'}`}>
                                <span className={`material-symbols-outlined ${(gameStatus.weather && fansRoll.home) ? 'text-amber-500' : 'text-slate-600'}`}>toll</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-display font-black text-white uppercase italic">Juicio de la Moneda</h3>
                                {!gameStatus.weather && <p className="text-[9px] font-display font-black text-blood-red/60 uppercase tracking-[0.2em] animate-pulse mt-0.5">Consulta los Oráculos primero ↑</p>}
                            </div>
                        </div>
                        <div className="glass-panel p-6 border-white/10 bg-black/40 space-y-6">
                            {!gameStatus.coinTossWinner ? (
                                <div className="flex gap-4">
                                    <button onClick={() => { setGameStatus((p: any) => ({ ...p, coinTossWinner: 'home' })); logEvent('INFO', `Duelo Ganado (Moneda): ${liveHomeTeam.name}`); }} className="flex-1 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-sky-500/20 hover:border-sky-500/40 transition-all text-center group">
                                        <p className="text-[10px] font-display font-black text-slate-500 group-hover:text-sky-400 uppercase tracking-widest mb-1">Cara (Local)</p>
                                        <p className="text-xs font-display font-black text-white uppercase truncate">{liveHomeTeam?.name?.split(' ')[0] || 'Local'}</p>
                                    </button>
                                    <button onClick={() => { setGameStatus((p: any) => ({ ...p, coinTossWinner: 'opponent' })); logEvent('INFO', `Duelo Ganado (Moneda): ${liveOpponentTeam.name}`); }} className="flex-1 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-red-500/20 hover:border-red-500/40 transition-all text-center group">
                                        <p className="text-[10px] font-display font-black text-slate-500 group-hover:text-red-400 uppercase tracking-widest mb-1">Cruz (Rival)</p>
                                        <p className="text-xs font-display font-black text-white uppercase truncate">{liveOpponentTeam?.name?.split(' ')[0] || 'Rival'}</p>
                                    </button>
                                </div>
                            ) : (
                                <div className="animate-slide-in-up space-y-4">
                                    <div className={`p-4 rounded-2xl border ${gameStatus.coinTossWinner === 'home' ? 'bg-sky-500/10 border-sky-500/30' : 'bg-red-500/10 border-red-500/30'} text-center`}>
                                        <p className="text-[10px] font-display font-black uppercase tracking-widest opacity-60">Ganador del Sorteo</p>
                                        <p className="text-lg font-display font-black text-white uppercase italic">{(gameStatus.coinTossWinner === 'home' ? liveHomeTeam : liveOpponentTeam).name}</p>
                                    </div>
                                    {!gameStatus.receivingTeam ? (
                                        <div className="flex gap-3">
                                            <button onClick={() => { setGameStatus((p: any) => ({ ...p, receivingTeam: gameStatus.coinTossWinner })); logEvent('INFO', `${(gameStatus.coinTossWinner === 'home' ? liveHomeTeam : liveOpponentTeam).name} ha decidido RECIBIR.`); }} className="flex-1 py-3 rounded-xl bg-premium-gold/10 border border-premium-gold/30 text-premium-gold text-[10px] font-display font-black uppercase tracking-widest hover:bg-premium-gold hover:text-black transition-all">
                                                Recibir el Balón
                                            </button>
                                            <button onClick={() => { const kicker = gameStatus.coinTossWinner; const receiver = kicker === 'home' ? 'opponent' : 'home'; setGameStatus((p: any) => ({ ...p, receivingTeam: receiver })); logEvent('INFO', `${(gameStatus.coinTossWinner === 'home' ? liveHomeTeam : liveOpponentTeam).name} ha decidido PATEAR.`); }} className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-[10px] font-display font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                                                Patear
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5">
                                            <span className="material-symbols-outlined text-green-500 text-sm">check_circle</span>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                {gameStatus.receivingTeam === 'home' ? liveHomeTeam.name : liveOpponentTeam.name} Recibe
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA final */}
            {gameStatus.receivingTeam && (
                <div className="pt-10 border-t border-white/5 flex justify-center animate-bounce-in">
                    <button
                        onClick={() => { setFirstHalfReceiver(gameStatus.receivingTeam); setPreGameStep(2); logEvent('INFO', 'Preparativos completados. Entrando en fase de Despliegue.'); }}
                        className="group relative overflow-hidden bg-gradient-to-b from-green-600 to-green-700 text-white font-display font-black py-6 px-24 rounded-[2rem] shadow-[0_20px_40px_rgba(34,197,94,0.2)] hover:scale-105 active:scale-95 transition-all duration-300"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                        <span className="relative flex items-center justify-center gap-4 tracking-[0.4em] uppercase text-sm">
                            Confirmar Estrategia
                            <span className="material-symbols-outlined font-black">shield_with_heart</span>
                        </span>
                    </button>
                </div>
            )}
        </div>
    );
};

// ────────────────────────────────────────────────────────────
// SubComponent: Step 2 — Deployment
// ────────────────────────────────────────────────────────────
const DeploymentStep: React.FC = () => {
    const {
        liveHomeTeam, liveOpponentTeam, ballCarrierId, logEvent,
        setPreGameStep, handlePlayerMove, handlePlayerStatusToggle,
        handleAutoSelectTeam, handleSuggestDeployment, setViewingPlayer, handleSkillClick
    } = useMatch();

    if (!liveHomeTeam || !liveOpponentTeam) return null;

    const handleConfirmDeployment = () => {
        const homeOnField = liveHomeTeam.players.filter((p: any) => p.status === 'Activo').length;
        const oppOnField = liveOpponentTeam.players.filter((p: any) => p.status === 'Activo').length;
        const homeAvailable = liveHomeTeam.players.filter((p: any) => p.status !== 'Muerto' && p.status !== 'Lesionado' && (p.missNextGame || 0) <= 0).length;
        const oppAvailable = liveOpponentTeam.players.filter((p: any) => p.status !== 'Muerto' && p.status !== 'Lesionado' && (p.missNextGame || 0) <= 0).length;

        if (homeOnField === 0 || oppOnField === 0) {
            alert('Ambos equipos deben tener al menos un guerrero en el campo para la batalla.');
            return;
        }
        if ((homeOnField < 11 && homeOnField < homeAvailable) || (oppOnField < 11 && oppOnField < oppAvailable)) {
            if (!confirm('Uno de los equipos tiene menos de 11 jugadores pudiendo desplegar más. ¿Continuar?')) return;
        }
        setPreGameStep(3);
        logEvent('INFO', 'Despliegue confirmado. ¡Que ruede el balón!');
    };

    return (
        <div className="space-y-10">
            <div className="text-center max-w-lg mx-auto">
                <p className="text-slate-500 text-sm leading-relaxed tracking-wide italic">
                    "Despliega tus tropas. El campo de batalla se tiñe de verde y gloria. Solo 11 guerreros pueden pisar el césped al unísono."
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {([liveHomeTeam, liveOpponentTeam] as any[]).map((team, index) => {
                    const teamId = index === 0 ? 'home' : 'opponent';
                    const onField = team.players.filter((p: any) => p.status === 'Activo');
                    const accentColor = teamId === 'home' ? 'sky' : 'red';

                    return (
                        <div key={teamId} className="flex flex-col gap-6">
                            <div className="flex items-center justify-between border-b border-white/5 pb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-black/60 border border-white/10 flex items-center justify-center overflow-hidden">
                                        {team.crestImage
                                            ? <img src={team.crestImage} className="w-full h-full object-cover" alt={team.name} />
                                            : <ShieldCheckIcon className="w-6 h-6 text-slate-700" />
                                        }
                                    </div>
                                    <div>
                                        <h4 className={`text-lg font-display font-black text-${accentColor}-400 uppercase italic tracking-tighter leading-none`}>{team.name}</h4>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{team.rosterName}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`text-xl font-display font-black ${onField.length > 11 ? 'text-red-500' : 'text-white'}`}>{onField.length}/11</div>
                                    <div className="text-[8px] font-bold text-slate-600 uppercase">En el Campo</div>
                                </div>
                            </div>

                            {/* Mini campo */}
                            <div className="relative group">
                                <div className={`absolute -inset-1 bg-gradient-to-b from-${accentColor}-500/20 to-transparent rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000`}></div>
                                <div className="relative bg-black/60 rounded-[2.5rem] border border-white/10 p-4">
                                    <MiniField
                                        players={onField}
                                        teamColor={teamId === 'home' ? 'bg-sky-500' : 'bg-red-500'}
                                        onPlayerMove={(playerId: number, pos: any) => handlePlayerMove(teamId, playerId, pos)}
                                        ballCarrierId={ballCarrierId}
                                    />
                                </div>
                            </div>

                            {/* Roster */}
                            <div className="bg-black/40 border border-white/5 rounded-3xl p-5 h-[350px] overflow-hidden flex flex-col">
                                <div className="flex justify-between items-center mb-4">
                                    <h5 className="text-[10px] font-display font-black text-slate-500 uppercase tracking-widest">
                                        Roster de Guerra
                                        <span className="ml-2 text-[8px] bg-white/5 px-2 py-0.5 rounded-full">{team.players.length} Total</span>
                                    </h5>
                                    <button
                                        onClick={() => handleAutoSelectTeam(teamId)}
                                        className="text-[8px] font-display font-black text-premium-gold hover:text-white border border-premium-gold/30 hover:border-premium-gold bg-premium-gold/5 px-3 py-1.5 rounded-lg transition-all uppercase tracking-widest"
                                    >
                                        Sugerir 11 Inicial
                                    </button>
                                </div>
                                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2">
                                    {team.players.map((p: any) => (
                                        <PlayerStatusCard
                                            key={p.id}
                                            player={p}
                                            playerNumber={p.status === 'Activo' ? onField.findIndex((pl: any) => pl.id === p.id) + 1 : undefined}
                                            onViewPlayer={setViewingPlayer}
                                            onSkillClick={handleSkillClick}
                                            canToggleStatus={true}
                                            onStatusToggle={() => handlePlayerStatusToggle(p, teamId)}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap justify-center gap-6 pt-10 border-t border-white/5">
                <button
                    onClick={handleConfirmDeployment}
                    className="bg-premium-gold text-black font-display font-black py-4 px-12 rounded-2xl shadow-xl hover:scale-105 transition-all text-xs uppercase tracking-[0.3em]"
                >
                    Confirmar Despliegue
                </button>
                <button
                    onClick={() => {
                        if (liveHomeTeam.players.filter((p: any) => p.status === 'Activo').length === 0) handleAutoSelectTeam('home');
                        if (liveOpponentTeam.players.filter((p: any) => p.status === 'Activo').length === 0) handleAutoSelectTeam('opponent');
                        handleSuggestDeployment();
                    }}
                    className="bg-white/5 border border-white/10 text-white font-display font-black py-4 px-8 rounded-2xl hover:bg-white/10 transition-all text-xs uppercase tracking-widest"
                >
                    Sugerir Despliegue
                </button>
            </div>
        </div>
    );
};

// ────────────────────────────────────────────────────────────
// SubComponent: Step 3 — Kickoff Event
// ────────────────────────────────────────────────────────────
const KickoffStep: React.FC = () => {
    const {
        gameStatus, setGameStatus, kickoffActionCompleted, setKickoffActionCompleted,
        logEvent, playSound, handleStartDrive
    } = useMatch();

    const handleKickoffRoll = () => {
        setKickoffActionCompleted(false);
        const die1 = Math.floor(Math.random() * 6) + 1;
        const die2 = Math.floor(Math.random() * 6) + 1;
        const roll = die1 + die2;
        const event = kickoffEvents.find((e: any) => e.diceRoll === roll.toString());
        if (event) {
            setGameStatus((prev: any) => ({ ...prev, kickoffEvent: event }));
            logEvent('KICKOFF', `Evento de Patada (${roll}): ${event.title}`);
            if (event.title !== 'Clima Cambiante') setKickoffActionCompleted(true);
        }
    };

    return (
        <div className='max-w-xl mx-auto space-y-12 text-center py-6'>
            {!gameStatus.kickoffEvent ? (
                <div className="space-y-10">
                    <div className="flex flex-col items-center gap-6">
                        <div className="w-40 h-40 bg-premium-gold/5 rounded-[3rem] border-2 border-premium-gold/20 flex items-center justify-center shadow-[0_0_80px_rgba(245,159,10,0.1)] relative">
                            <div className="absolute inset-0 bg-premium-gold/10 rounded-[3rem] blur-2xl animate-pulse"></div>
                            <span className="material-symbols-outlined text-7xl text-premium-gold relative z-10 animate-bounce">sports_football</span>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-3xl font-display font-black text-white italic uppercase tracking-tighter">La Patada Inicial</h3>
                            <p className="text-slate-500 text-sm max-w-xs mx-auto">Lanza los dados del destino para determinar el evento que marcará el inicio del asalto.</p>
                        </div>
                    </div>
                    <div className="flex justify-center">
                        <DiceRollButton onRoll={handleKickoffRoll} onPlaySound={() => playSound('dice')} />
                    </div>
                </div>
            ) : (
                <div className="space-y-10 animate-slide-in-up">
                    <div className="relative">
                        <div className="absolute -inset-8 bg-sky-500/10 blur-[80px] rounded-full"></div>
                        <div className="relative glass-panel border-sky-500/30 bg-black/60 p-10 rounded-[4rem] shadow-4xl transform hover:scale-[1.02] transition-transform duration-700">
                            <div className="text-[10px] font-display font-black text-sky-400 uppercase tracking-[0.4em] mb-4">Intervención del Destino</div>
                            <h4 className="text-4xl font-display font-black text-white italic uppercase tracking-tighter mb-4">{gameStatus.kickoffEvent.title}</h4>
                            <div className="w-16 h-1 bg-sky-500/30 mx-auto mb-6 rounded-full"></div>
                            <p className="text-slate-400 text-sm leading-relaxed max-w-sm mx-auto italic">{gameStatus.kickoffEvent.description}</p>
                        </div>
                    </div>
                    {kickoffActionCompleted && (
                        <button
                            onClick={handleStartDrive}
                            className="group relative overflow-hidden bg-green-500 text-black font-display font-black py-6 px-20 rounded-2xl shadow-[0_30px_60px_rgba(34,197,94,0.3)] hover:scale-105 active:scale-95 transition-all duration-300"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                            <span className="relative text-xs uppercase tracking-[0.4em]">¡Que Corra la Sangre!</span>
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

// ────────────────────────────────────────────────────────────
// Main Component: PreGameStage
// ────────────────────────────────────────────────────────────
const preGameTitles = [
    "Levantamiento de Muertos",  // 0 - Journeymen
    "El Centro de Mando",        // 1 - Inducements, Fate, Coin Toss
    "Despliegue de Guerra",      // 2 - Deployment
    "El Gran Kickoff"            // 3 - Kickoff Event
];

const PreGameStage: React.FC = () => {
    const { liveHomeTeam, liveOpponentTeam, preGameStep, journeymenNotification } = useMatch();

    if (!liveHomeTeam || !liveOpponentTeam) {
        return (
            <div className="flex items-center justify-center py-20 text-premium-gold font-display font-black animate-pulse uppercase tracking-widest">
                Invocando Equipos...
            </div>
        );
    }

    if (journeymenNotification) return <JourneymenNotification />;

    return (
        <div className="max-w-6xl mx-auto space-y-10 py-6 animate-fade-in">
            {/* Stepper Header */}
            <div className="flex flex-col items-center">
                <div className="text-[10px] font-display font-black text-premium-gold uppercase tracking-[0.4em] mb-2 opacity-60">
                    Fase de Preparación
                </div>
                <h2 className="text-4xl font-display font-black text-white italic tracking-tighter uppercase text-center">
                    {preGameTitles[preGameStep]}
                </h2>
                <div className="mt-4 flex gap-1">
                    {preGameTitles.map((_, i) => (
                        <div
                            key={i}
                            className={`h-1 rounded-full transition-all duration-500 ${i === preGameStep ? 'w-8 bg-premium-gold' : i < preGameStep ? 'w-4 bg-premium-gold/40' : 'w-4 bg-white/5'}`}
                        />
                    ))}
                </div>
            </div>

            {/* Step Content */}
            <div className="glass-panel border-white/5 bg-black/40 p-8 shadow-2xl">
                {preGameStep === 1 && <CommandCenterStep />}
                {preGameStep === 2 && <DeploymentStep />}
                {preGameStep === 3 && <KickoffStep />}
            </div>
        </div>
    );
};

export default PreGameStage;
