import React, { useState } from 'react';
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

    const [manualWeather, setManualWeather] = useState('');
    const [manualFansHome, setManualFansHome] = useState('');
    const [manualFansOpp, setManualFansOpp] = useState('');
    const [manualCoinHome, setManualCoinHome] = useState('');
    const [manualCoinOpp, setManualCoinOpp] = useState('');

    const handleWeatherRoll = (manualVal?: number) => {
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
            logEvent('INFO', `Clima Invocado (Resultado ${total}): ${w.title}`);
        }
        playSound('dice');
    };

    const handleFansRoll = (manualH?: number, manualO?: number) => {
        const hf = manualH || (Math.floor(Math.random() * 3) + 1);
        const of = manualO || (Math.floor(Math.random() * 3) + 1);
        const hTotal = liveHomeTeam.dedicatedFans + hf;
        const oTotal = liveOpponentTeam.dedicatedFans + of;
        let homeFame = 0, oppFame = 0;
        if (hTotal >= oTotal * 2) homeFame = 2; else if (hTotal > oTotal) homeFame = 1;
        if (oTotal >= hTotal * 2) oppFame = 2; else if (oTotal > hTotal) oppFame = 1;
        setFame({ home: homeFame, opponent: oppFame });
        setFansRoll({ home: hf.toString(), opponent: of.toString() });
        logEvent('INFO', `Hinchas (S3 1D3) — ${liveHomeTeam.name}: +${hf}, ${liveOpponentTeam.name}: +${of}`);
        playSound('dice');
    };

    const handleCoinTossRoll = (manualH?: number, manualO?: number) => {
        const hRoll = manualH || (Math.floor(Math.random() * 6) + 1);
        const oRoll = manualO || (Math.floor(Math.random() * 6) + 1);
        
        let winner: 'home' | 'opponent';
        if (hRoll > oRoll) winner = 'home';
        else if (oRoll > hRoll) winner = 'opponent';
        else winner = Math.random() > 0.5 ? 'home' : 'opponent';

        setGameStatus((prev: any) => ({ ...prev, coinTossWinner: winner }));
        logEvent('INFO', `Sorteo de Moneda (1D6 vs 1D6) — ${liveHomeTeam.name}: ${hRoll}, ${liveOpponentTeam.name}: ${oRoll}. Ganador: ${winner === 'home' ? liveHomeTeam.name : liveOpponentTeam.name}`);
        playSound('dice');
    };

    const commandReady = !!gameStatus.weather && !!fansRoll.home;

    return (
        <div className='space-y-8 animate-fade-in'>
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

                {/* ── Left: Mercado de Incentivos ── */}
                <div className="xl:col-span-7 space-y-6">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-10 h-10 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                            <span className="material-symbols-outlined text-green-500">payments</span>
                        </div>
                        <h3 className="text-xl font-display font-black text-white uppercase italic">Mercado de Incentivos</h3>
                    </div>

                    {inducementState.underdog ? (
                        <div className="space-y-4">
                            {/* Underdog Banner */}
                            <div className="rounded-[1.75rem] border border-green-500/20 bg-green-500/5 p-5 flex items-center gap-4 animate-slide-in-right">
                                <div className="w-12 h-12 rounded-xl bg-black/40 border border-green-500/30 flex items-center justify-center">
                                     {underdogTeam.crestImage 
                                         ? <img src={underdogTeam.crestImage} className="w-10 h-10 object-contain" alt="Underdog" />
                                         : <span className="material-symbols-outlined text-green-500">trending_up</span>
                                     }
                                 </div>
                                 <div>
                                     <p className="text-[10px] font-display font-black text-green-500 uppercase tracking-widest leading-none mb-1">Equipo Infractor / Underdog</p>
                                     <h4 className="text-lg font-display font-black text-white uppercase italic tracking-tighter leading-none">{underdogTeam.name}</h4>
                                 </div>
                                 <div className="ml-auto bg-black/20 px-3 py-2 rounded-xl border border-green-500/20 text-center">
                                     <p className="text-[8px] font-black text-green-500 uppercase leading-none">Incentivos</p>
                                     <p className="text-xs font-black text-white">S3 Match</p>
                                 </div>
                             </div>

                             {/* Wallet */}
                             <div className="rounded-[1.75rem] border border-premium-gold/20 bg-premium-gold/5 p-5 flex items-center justify-between">
                                 <div>
                                     <p className="text-[10px] font-display font-black text-premium-gold uppercase tracking-widest mb-1">Bolsa de Incentivos</p>
                                     <p className="text-3xl font-display font-black text-white italic">
                                         {inducementState.money.toLocaleString()} <span className="text-xs text-premium-gold/50">m.o.</span>
                                     </p>
                                 </div>
                                 <div className="w-16 h-16 rounded-full bg-black/60 border border-white/10 flex items-center justify-center">
                                     <span className="material-symbols-outlined text-premium-gold text-3xl">account_balance_wallet</span>
                                 </div>
                             </div>

                            <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-4">
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
                                    <div className="space-y-2 max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
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
                        <div className="glass-panel p-8 border-white/5 bg-white/5 text-center space-y-4">
                            <div className="w-16 h-16 mx-auto bg-white/10 rounded-full flex items-center justify-center mb-2">
                                <span className="material-symbols-outlined text-slate-500 text-3xl">balance</span>
                            </div>
                            <p className="text-slate-400 text-sm font-medium italic">Los equipos estan equilibrados. Nuffle no otorga oro adicional hoy.</p>
                        </div>
                    )}
                </div>

                {/* ── Right: Destino y Entorno ── */}
                <div className="xl:col-span-5 space-y-5">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-10 h-10 rounded-full bg-sky-500/10 border border-sky-500/30 flex items-center justify-center">
                            <span className="material-symbols-outlined text-sky-400">cyclone</span>
                        </div>
                        <h3 className="text-xl font-display font-black text-white uppercase italic">Destino y Entorno</h3>
                    </div>
                    <div className="glass-panel p-5 border-white/10 bg-black/40 space-y-4">
                        {/* Clima */}
                        <div className={`p-4 rounded-[1.5rem] border transition-all ${gameStatus.weather ? 'bg-sky-500/10 border-sky-500/30' : 'bg-white/5 border-white/5'}`}>
                            <div className="mb-3 flex items-center justify-between gap-4">
                                <p className="text-[10px] font-display font-black text-sky-400 uppercase tracking-widest">Clima</p>
                                <span className="rounded-full border border-sky-500/20 bg-black/20 px-3 py-1 text-[9px] font-display font-black uppercase tracking-[0.2em] text-sky-300">2D6</span>
                            </div>
                            {gameStatus.weather ? (
                                <div className="flex items-center gap-3 rounded-xl border border-sky-500/20 bg-black/20 px-4 py-3">
                                    <span className="material-symbols-outlined text-2xl text-white">cloud_queue</span>
                                    <h4 className="text-lg font-display font-black text-white uppercase italic tracking-tight">{gameStatus.weather.title}</h4>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <input 
                                        type="number" min="2" max="12" placeholder="2D6" 
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-3 text-center text-sm font-black text-white focus:border-sky-500 transition-all"
                                        value={manualWeather} onChange={(e) => setManualWeather(e.target.value)}
                                    />
                                    <button 
                                        onClick={() => manualWeather && handleWeatherRoll(Number(manualWeather))}
                                        className="bg-white text-black px-4 rounded-xl font-display font-black text-[10px] uppercase tracking-[0.16em] hover:bg-sky-500 transition-all"
                                    >
                                        Manual
                                    </button>
                                </div>
                            )}
                        </div>
                        <button
                            disabled={!!gameStatus.weather}
                            onClick={() => handleWeatherRoll()}
                            className={`w-full font-display font-black py-3 rounded-xl transition-all flex items-center justify-center gap-3 text-[10px] uppercase tracking-[0.2em] ${gameStatus.weather ? 'bg-green-900/30 text-green-500 border border-green-500/20 cursor-not-allowed opacity-60' : 'bg-sky-500 text-black hover:scale-[1.01] hover:bg-white'}`}
                        >
                            <span className="material-symbols-outlined text-base">{gameStatus.weather ? 'check_circle' : 'thunderstorm'}</span>
                            {gameStatus.weather ? 'Clima resuelto' : 'Resolver aleatorio'}
                        </button>

                        {/* Fans / FAMA */}
                        <div className={`p-4 rounded-[1.5rem] border transition-all ${fansRoll.home ? 'bg-amber-500/10 border-amber-500/30' : 'bg-white/5 border-white/5'}`}>
                            <div className="mb-3 flex items-center justify-between gap-4">
                                <p className="text-[10px] font-display font-black text-amber-500 uppercase tracking-widest">FAMA</p>
                                <span className="rounded-full border border-amber-500/20 bg-black/20 px-3 py-1 text-[9px] font-display font-black uppercase tracking-[0.2em] text-amber-300">1D3 vs 1D3</span>
                            </div>
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
                                <div className="space-y-2">
                                    <div className="flex gap-2">
                                        <input 
                                            type="number" min="1" max="3" placeholder="Local" 
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-2 py-3 text-center text-[10px] font-black text-white focus:border-amber-500 transition-all"
                                            value={manualFansHome} onChange={(e) => setManualFansHome(e.target.value)}
                                        />
                                        <input 
                                            type="number" min="1" max="3" placeholder="Rival" 
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-2 py-3 text-center text-[10px] font-black text-white focus:border-amber-500 transition-all"
                                            value={manualFansOpp} onChange={(e) => setManualFansOpp(e.target.value)}
                                        />
                                        <button 
                                            onClick={() => manualFansHome && manualFansOpp && handleFansRoll(Number(manualFansHome), Number(manualFansOpp))}
                                            className="bg-white text-black px-4 rounded-xl font-display font-black text-[10px] uppercase tracking-[0.16em] hover:bg-amber-500 transition-all"
                                        >
                                            Manual
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                        <button
                            disabled={!!fansRoll.home}
                            onClick={() => handleFansRoll()}
                            className={`w-full font-display font-black py-3 rounded-xl transition-all flex items-center justify-center gap-3 text-[10px] uppercase tracking-[0.2em] ${fansRoll.home ? 'bg-green-900/30 text-green-500 border border-green-500/20 cursor-not-allowed opacity-60' : 'bg-amber-500 text-black hover:scale-[1.01] hover:bg-white'}`}
                        >
                            <span className="material-symbols-outlined text-base">{fansRoll.home ? 'check_circle' : 'groups'}</span>
                            {fansRoll.home ? 'FAMA resuelta' : 'Resolver aleatorio'}
                        </button>
                        {/* Coin Toss */}
                    <div className={`space-y-6 transition-all duration-500 ${(!gameStatus.weather || !fansRoll.home) ? 'opacity-40 pointer-events-none select-none' : 'opacity-100'}`}>
                        <div className="flex items-center gap-4 mb-2">
                            <div className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${(gameStatus.weather && fansRoll.home) ? 'bg-amber-500/10 border-amber-500/30' : 'bg-white/5 border-white/10'}`}>
                                <span className={`material-symbols-outlined ${(gameStatus.weather && fansRoll.home) ? 'text-amber-500' : 'text-slate-600'}`}>toll</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-display font-black text-white uppercase italic">Juicio de la moneda</h3>
                                {!gameStatus.weather && <p className="text-[9px] font-display font-black text-blood-red/60 uppercase tracking-[0.2em] animate-pulse mt-0.5">Resuelve clima y FAMA antes de lanzar la moneda</p>}
                            </div>
                        </div>
                        <div className="rounded-[1.75rem] border border-premium-gold/20 bg-premium-gold/5 p-5 space-y-6">
                            {!gameStatus.coinTossWinner ? (
                                <div className="space-y-6">
                                    <div className="flex justify-center gap-6">
                                        <div className="flex flex-col items-center gap-2">
                                            <span className="text-[8px] font-black text-sky-400 uppercase tracking-widest">Local (1D6)</span>
                                            <input 
                                                type="number" min="1" max="6" placeholder="D6"
                                                value={manualCoinHome} onChange={(e) => setManualCoinHome(e.target.value)}
                                                className="w-20 bg-black/60 border border-sky-500/30 rounded-xl px-2 py-3 text-center text-xl font-black text-white focus:border-sky-500 outline-none"
                                            />
                                        </div>
                                        <div className="flex items-center text-slate-700 font-display font-black text-xs pt-6 italic">VS</div>
                                        <div className="flex flex-col items-center gap-2">
                                            <span className="text-[8px] font-black text-red-400 uppercase tracking-widest">Rival (1D6)</span>
                                            <input 
                                                type="number" min="1" max="6" placeholder="D6"
                                                value={manualCoinOpp} onChange={(e) => setManualCoinOpp(e.target.value)}
                                                className="w-20 bg-black/60 border border-red-500/30 rounded-xl px-2 py-3 text-center text-xl font-black text-white focus:border-red-500 outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <button 
                                            onClick={() => manualCoinHome && manualCoinOpp && handleCoinTossRoll(Number(manualCoinHome), Number(manualCoinOpp))}
                                            className="flex-1 bg-white text-black py-3 rounded-xl font-display font-black text-[10px] uppercase tracking-[0.18em] hover:bg-premium-gold transition-all shadow-lg"
                                        >
                                            Confirmar manual
                                        </button>
                                        <button 
                                            onClick={() => handleCoinTossRoll()}
                                            className="flex-1 bg-premium-gold text-black py-3 rounded-xl font-display font-black text-[10px] uppercase tracking-[0.18em] hover:bg-white transition-all shadow-lg flex items-center justify-center gap-2"
                                        >
                                            <span className="material-symbols-outlined text-sm">casino</span> Sorteo digital
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-4 w-full">
                                        <div className="h-px bg-white/5 flex-1"></div>
                                        <span className="text-[8px] font-bold text-slate-700 uppercase">o elige ganador</span>
                                        <div className="h-px bg-white/5 flex-1"></div>
                                    </div>
                                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                        <button onClick={() => { setGameStatus((p: any) => ({ ...p, coinTossWinner: 'home' })); logEvent('INFO', `Duelo ganado (moneda): ${liveHomeTeam.name}`); }} className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-sky-500/20 hover:border-sky-500/40 transition-all text-center group">
                                            <p className="text-[10px] font-display font-black text-slate-500 group-hover:text-sky-400 uppercase tracking-widest mb-1">Cara</p>
                                            <p className="text-xs font-display font-black text-white uppercase truncate">{liveHomeTeam?.name?.split(' ')[0] || 'Local'}</p>
                                        </button>
                                        <button onClick={() => { setGameStatus((p: any) => ({ ...p, coinTossWinner: 'opponent' })); logEvent('INFO', `Duelo ganado (moneda): ${liveOpponentTeam.name}`); }} className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-red-500/20 hover:border-red-500/40 transition-all text-center group">
                                            <p className="text-[10px] font-display font-black text-slate-500 group-hover:text-red-400 uppercase tracking-widest mb-1">Cruz</p>
                                            <p className="text-xs font-display font-black text-white uppercase truncate">{liveOpponentTeam?.name?.split(' ')[0] || 'Rival'}</p>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="animate-slide-in-up space-y-4">
                                    <div className={`p-4 rounded-2xl border ${gameStatus.coinTossWinner === 'home' ? 'bg-sky-500/10 border-sky-500/30' : 'bg-red-500/10 border-red-500/30'} text-center`}>
                                        <p className="text-[10px] font-display font-black uppercase tracking-widest opacity-60">Ganador del sorteo</p>
                                        <p className="text-lg font-display font-black text-white uppercase italic">{(gameStatus.coinTossWinner === 'home' ? liveHomeTeam : liveOpponentTeam).name}</p>
                                    </div>
                                    {!gameStatus.receivingTeam ? (
                                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                            <button onClick={() => { setGameStatus((p: any) => ({ ...p, receivingTeam: gameStatus.coinTossWinner })); logEvent('INFO', `${(gameStatus.coinTossWinner === 'home' ? liveHomeTeam : liveOpponentTeam).name} ha decidido recibir.`); }} className="py-3 rounded-xl bg-premium-gold/10 border border-premium-gold/30 text-premium-gold text-[10px] font-display font-black uppercase tracking-widest hover:bg-premium-gold hover:text-black transition-all">
                                                Recibir el balon
                                            </button>
                                            <button onClick={() => { const kicker = gameStatus.coinTossWinner; const receiver = kicker === 'home' ? 'opponent' : 'home'; setGameStatus((p: any) => ({ ...p, receivingTeam: receiver })); logEvent('INFO', `${(gameStatus.coinTossWinner === 'home' ? liveHomeTeam : liveOpponentTeam).name} ha decidido patear.`); }} className="py-3 rounded-xl bg-white/5 border border-white/10 text-white text-[10px] font-display font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                                                Patear
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5">
                                            <span className="material-symbols-outlined text-green-500 text-sm">check_circle</span>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                {gameStatus.receivingTeam === 'home' ? liveHomeTeam.name : liveOpponentTeam.name} recibe
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
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

    const [showAdvanced, setShowAdvanced] = useState(false);
    const [homePreset, setHomePreset] = useState('balanceado');
    const [opponentPreset, setOpponentPreset] = useState('cobertura-profunda');

    if (!liveHomeTeam || !liveOpponentTeam) return null;

    const presetOptions = [
        { id: 'balanceado', label: 'Equilibrado', note: 'Salida estable para cualquier drive.' },
        { id: 'linea-dura', label: 'Linea dura', note: 'Presencia central y contacto temprano.' },
        { id: 'cobertura-profunda', label: 'Cobertura profunda', note: 'Mas seguridad ante recepcion y avance rival.' },
        { id: 'presion-blitz', label: 'Presion blitz', note: 'Pensado para patear y atacar la primera jugada.' },
    ] as const;

    const homeOnField = liveHomeTeam.players.filter((p: any) => p.status === 'Activo').length;
    const oppOnField = liveOpponentTeam.players.filter((p: any) => p.status === 'Activo').length;
    const homeAvailable = liveHomeTeam.players.filter((p: any) => p.status !== 'Muerto' && p.status !== 'Lesionado' && (p.missNextGame || 0) <= 0).length;
    const oppAvailable = liveOpponentTeam.players.filter((p: any) => p.status !== 'Muerto' && p.status !== 'Lesionado' && (p.missNextGame || 0) <= 0).length;

    const handleConfirmDeployment = () => {
        if (homeOnField === 0 || oppOnField === 0) {
            alert('Ambos equipos deben tener al menos un guerrero en el campo para la batalla.');
            return;
        }

        if ((homeOnField < 11 && homeOnField < homeAvailable) || (oppOnField < 11 && oppOnField < oppAvailable)) {
            if (!confirm('Uno de los equipos tiene menos de 11 jugadores pudiendo desplegar mas. ?Continuar?')) return;
        }

        const homePresetLabel = presetOptions.find(option => option.id === homePreset)?.label || 'Equilibrado';
        const opponentPresetLabel = presetOptions.find(option => option.id === opponentPreset)?.label || 'Equilibrado';

        logEvent('INFO', `Despliegue express confirmado. ${liveHomeTeam.name}: ${homePresetLabel}. ${liveOpponentTeam.name}: ${opponentPresetLabel}.`);
        setPreGameStep(3);
    };

    const renderTeamPanel = (team: any, teamId: 'home' | 'opponent', preset: string, setPreset: (value: string) => void) => {
        const onField = team.players.filter((p: any) => p.status === 'Activo');
        const accentClass = teamId === 'home' ? 'sky' : 'red';

        return (
            <div key={teamId} className='flex flex-col gap-5 rounded-[2rem] border border-white/10 bg-black/35 p-5'>
                <div className='flex items-center justify-between gap-4 border-b border-white/5 pb-4'>
                    <div className='flex items-center gap-4'>
                        <div className='h-12 w-12 overflow-hidden rounded-2xl border border-white/10 bg-black/60 flex items-center justify-center'>
                            {team.crestImage
                                ? <img src={team.crestImage} className='h-full w-full object-cover' alt={team.name} />
                                : <ShieldCheckIcon className='h-6 w-6 text-slate-700' />
                            }
                        </div>
                        <div>
                            <h4 className={`text-lg font-display font-black uppercase italic tracking-tighter text-${accentClass}-400`}>{team.name}</h4>
                            <p className='text-[10px] font-bold uppercase tracking-widest text-slate-500'>{team.rosterName}</p>
                        </div>
                    </div>
                    <div className='text-right'>
                        <p className='text-[8px] font-display font-black uppercase tracking-[0.2em] text-slate-500'>En campo</p>
                        <p className='text-2xl font-display font-black italic text-white'>{onField.length}/11</p>
                    </div>
                </div>

                <div className='grid gap-4 xl:grid-cols-[0.95fr_1.05fr]'>
                    <div className='rounded-[1.5rem] border border-white/10 bg-white/5 p-4 space-y-4'>
                        <div>
                            <p className='mb-1 text-[9px] font-display font-black uppercase tracking-[0.22em] text-premium-gold/70'>Preset tactico</p>
                            <h5 className='text-base font-display font-black uppercase italic text-white'>Despliegue express</h5>
                        </div>
                        <div className='grid gap-2'>
                            {presetOptions.map(option => (
                                <button
                                    key={option.id}
                                    onClick={() => setPreset(option.id)}
                                    className={`rounded-2xl border px-4 py-3 text-left transition-all ${preset === option.id ? 'border-premium-gold bg-premium-gold/10 text-white shadow-[0_0_20px_rgba(202,138,4,0.16)]' : 'border-white/10 bg-black/20 text-slate-300 hover:border-white/25 hover:bg-white/5'}`}
                                >
                                    <p className='text-[10px] font-display font-black uppercase tracking-[0.18em]'>{option.label}</p>
                                    <p className='mt-1 text-xs text-slate-500'>{option.note}</p>
                                </button>
                            ))}
                        </div>
                        <div className='flex flex-wrap gap-2 pt-2'>
                            <button
                                onClick={() => handleAutoSelectTeam(teamId)}
                                className='rounded-xl border border-premium-gold/20 bg-premium-gold/10 px-3 py-2 text-[9px] font-display font-black uppercase tracking-[0.16em] text-premium-gold transition-all hover:bg-premium-gold hover:text-black'
                            >
                                Once inicial
                            </button>
                            <span className='rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-[9px] font-display font-black uppercase tracking-[0.16em] text-slate-400'>
                                Disponibles: {teamId === 'home' ? homeAvailable : oppAvailable}
                            </span>
                        </div>
                    </div>

                    <div className='flex h-[360px] flex-col overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/25 p-4'>
                        <div className='mb-3 flex items-center justify-between gap-4'>
                            <div>
                                <p className='text-[9px] font-display font-black uppercase tracking-[0.2em] text-slate-500'>Plantilla activa</p>
                                <p className='text-xs font-bold uppercase tracking-wide text-white'>Marca quien sale al campo y quien espera en banquillo</p>
                            </div>
                            <span className='rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[9px] font-display font-black uppercase tracking-[0.16em] text-slate-400'>{team.players.length} total</span>
                        </div>
                        <div className='custom-scrollbar flex-1 space-y-2 overflow-y-auto pr-2'>
                            {team.players.map((player: any) => (
                                <PlayerStatusCard
                                    key={player.id}
                                    player={player}
                                    playerNumber={player.status === 'Activo' ? onField.findIndex((pl: any) => pl.id === player.id) + 1 : undefined}
                                    onViewPlayer={setViewingPlayer}
                                    onSkillClick={handleSkillClick}
                                    canToggleStatus={true}
                                    onStatusToggle={() => handlePlayerStatusToggle(player, teamId)}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className='space-y-8'>
            <div className='rounded-[2rem] border border-white/10 bg-black/35 p-6 md:p-8'>
                <div className='grid grid-cols-1 gap-6 xl:grid-cols-[0.85fr_1.15fr] xl:items-center'>
                    <div className='space-y-3'>
                        <p className='text-[10px] font-display font-black uppercase tracking-[0.32em] text-premium-gold/70'>Despliegue rapido</p>
                        <h3 className='text-3xl font-display font-black uppercase italic tracking-tighter text-white'>Preparar drive sin friccion</h3>
                        <p className='max-w-xl text-sm leading-relaxed text-slate-400'>
                            Aqui solo decidimos quienes saltan al campo y con que enfoque abre cada equipo. El ajuste manual del mini campo queda como modo avanzado opcional.
                        </p>
                    </div>
                    <div className='grid grid-cols-2 gap-4'>
                        <div className='rounded-[1.4rem] border border-white/10 bg-white/5 p-4'>
                            <p className='mb-1 text-[9px] font-display font-black uppercase tracking-[0.22em] text-slate-500'>Local en campo</p>
                            <p className='text-2xl font-display font-black italic text-white'>{homeOnField}/11</p>
                        </div>
                        <div className='rounded-[1.4rem] border border-white/10 bg-white/5 p-4'>
                            <p className='mb-1 text-[9px] font-display font-black uppercase tracking-[0.22em] text-slate-500'>Rival en campo</p>
                            <p className='text-2xl font-display font-black italic text-white'>{oppOnField}/11</p>
                        </div>
                        <div className='rounded-[1.4rem] border border-white/10 bg-white/5 p-4'>
                            <p className='mb-1 text-[9px] font-display font-black uppercase tracking-[0.22em] text-slate-500'>Disponibles local</p>
                            <p className='text-2xl font-display font-black italic text-white'>{homeAvailable}</p>
                        </div>
                        <div className='rounded-[1.4rem] border border-white/10 bg-white/5 p-4'>
                            <p className='mb-1 text-[9px] font-display font-black uppercase tracking-[0.22em] text-slate-500'>Disponibles rival</p>
                            <p className='text-2xl font-display font-black italic text-white'>{oppAvailable}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className='grid grid-cols-1 gap-8 xl:grid-cols-2'>
                {renderTeamPanel(liveHomeTeam, 'home', homePreset, setHomePreset)}
                {renderTeamPanel(liveOpponentTeam, 'opponent', opponentPreset, setOpponentPreset)}
            </div>

            <div className='rounded-[2rem] border border-white/10 bg-black/35 p-6'>
                <button
                    onClick={() => setShowAdvanced(prev => !prev)}
                    className='flex w-full items-center justify-between rounded-[1.5rem] border border-white/10 bg-white/5 px-5 py-4 text-left transition-all hover:border-premium-gold/30 hover:bg-white/10'
                >
                    <div>
                        <p className='text-[9px] font-display font-black uppercase tracking-[0.22em] text-slate-500'>Modo avanzado</p>
                        <p className='text-sm font-display font-black uppercase italic text-white'>Ajuste manual del mini campo</p>
                    </div>
                    <span className='material-symbols-outlined text-slate-400'>{showAdvanced ? 'expand_less' : 'expand_more'}</span>
                </button>

                {showAdvanced && (
                    <div className='mt-5 grid grid-cols-1 gap-6 xl:grid-cols-2 animate-fade-in-slow'>
                        {[
                            { team: liveHomeTeam, teamId: 'home' as const, color: 'bg-sky-500', label: 'Local' },
                            { team: liveOpponentTeam, teamId: 'opponent' as const, color: 'bg-red-500', label: 'Rival' },
                        ].map(({ team, teamId, color, label }) => {
                            const onField = team.players.filter((player: any) => player.status === 'Activo');
                            return (
                                <div key={teamId} className='rounded-[1.75rem] border border-white/10 bg-black/20 p-4'>
                                    <div className='mb-3 flex items-center justify-between gap-4'>
                                        <div>
                                            <p className='text-[9px] font-display font-black uppercase tracking-[0.22em] text-slate-500'>{label}</p>
                                            <p className='text-sm font-display font-black uppercase italic text-white'>Posicion manual opcional</p>
                                        </div>
                                        <span className='rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-[9px] font-display font-black uppercase tracking-[0.16em] text-slate-400'>{onField.length} fichas</span>
                                    </div>
                                    <MiniField
                                        players={onField}
                                        teamColor={color}
                                        onPlayerMove={(playerId: number, pos: any) => handlePlayerMove(teamId, playerId, pos)}
                                        ballCarrierId={ballCarrierId}
                                    />
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className='rounded-[2rem] border border-white/10 bg-black/35 px-6 py-8'>
                <div className='mb-6 flex flex-wrap items-center justify-between gap-4'>
                    <div>
                        <p className='text-[10px] font-display font-black uppercase tracking-[0.28em] text-premium-gold/70'>Validacion final</p>
                        <h4 className='text-2xl font-display font-black uppercase italic tracking-tight text-white'>Listos para el saque</h4>
                    </div>
                    <div className='flex flex-wrap gap-2'>
                        <span className='rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-[9px] font-display font-black uppercase tracking-[0.18em] text-sky-300'>Local: {homeOnField}/11</span>
                        <span className='rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-[9px] font-display font-black uppercase tracking-[0.18em] text-red-300'>Rival: {oppOnField}/11</span>
                    </div>
                </div>
                <div className='flex flex-wrap justify-center gap-6 border-t border-white/5 pt-6'>
                    <button
                        onClick={handleConfirmDeployment}
                        className='rounded-2xl bg-premium-gold px-12 py-4 text-xs font-display font-black uppercase tracking-[0.3em] text-black shadow-xl transition-all hover:scale-105'
                    >
                        Confirmar despliegue
                    </button>
                    <button
                        onClick={() => {
                            if (liveHomeTeam.players.filter((p: any) => p.status === 'Activo').length === 0) handleAutoSelectTeam('home');
                            if (liveOpponentTeam.players.filter((p: any) => p.status === 'Activo').length === 0) handleAutoSelectTeam('opponent');
                            handleSuggestDeployment();
                        }}
                        className='rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-xs font-display font-black uppercase tracking-widest text-white transition-all hover:bg-white/10'
                    >
                        Sugerir despliegue
                    </button>
                </div>
            </div>
        </div>
    );
};

// Step 3 - Kickoff event
// ────────────────────────────────────────────────────────────
const KickoffStep: React.FC = () => {
    const {
        gameStatus, setGameStatus, kickoffActionCompleted, setKickoffActionCompleted,
        logEvent, playSound, handleStartDrive, liveHomeTeam, liveOpponentTeam,
        setLiveHomeTeam, setLiveOpponentTeam, turn, setTurn
    } = useMatch();

    const [manualWeatherRoll, setManualWeatherRoll] = useState('');
    const [manualScatterDir, setManualScatterDir] = useState('');
    const [manualScatterDist, setManualScatterDist] = useState('');
    const [manualKickoffRoll, setManualKickoffRoll] = useState('');
    const [manualEventDice1, setManualEventDice1] = useState('');
    const [manualEventDice2, setManualEventDice2] = useState('');

    const handleKickoffWeatherRoll = (total: number) => {
        const w = weatherConditions.find(wc => {
            if (wc.diceRoll.includes('-')) {
                const [min, max] = wc.diceRoll.split('-').map(Number);
                return total >= min && total <= max;
            }
            return wc.diceRoll === total.toString();
        });
        if (w) {
            setGameStatus((prev: any) => ({ ...prev, weather: w }));
            logEvent('INFO', `Clima Cambiante (Resultado ${total}): ${w.title}`);
            setKickoffActionCompleted(true);
        }
        playSound('dice');
    };

    const handleKickoffRoll = (manualVal?: number) => {
        setKickoffActionCompleted(false);
        const roll = manualVal || (Math.floor(Math.random() * 6) + Math.floor(Math.random() * 6) + 2);
        const event = kickoffEvents.find((e: any) => e.diceRoll === roll.toString());
        if (event) {
            setGameStatus((prev: any) => ({ ...prev, kickoffEvent: event }));
            logEvent('KICKOFF', `Evento de Patada (${roll}): ${event.title}`);
            
            // EFECTOS INMEDIATOS (S3)
            if (event.title === '�rbitro Intimidado') {
                setLiveHomeTeam(prev => prev ? ({ ...prev, tempBribes: (prev.tempBribes || 0) + 1 }) : null);
                setLiveOpponentTeam(prev => prev ? ({ ...prev, tempBribes: (prev.tempBribes || 0) + 1 }) : null);
                logEvent('SUCCESS', 'Ambos equipos reciben un soborno gratuito.');
            }
            
            if (event.title === 'Tiempo Muerto') {
                const isKickerTurnLate = (turn >= 6);
                if (isKickerTurnLate) {
                    setTurn(t => Math.max(0, t - 1));
                    logEvent('INFO', 'Tiempo Muerto: Los marcadores de turno retroceden un espacio.');
                } else {
                    setTurn(t => Math.min(8, t + 1));
                    logEvent('INFO', 'Tiempo Muerto: Los marcadores de turno avanzan un espacio.');
                }
            }

            // Solo se marca como completado si no requiere tiradas adicionales
            const needsExtra = ['Clima Cambiante', 'Defensa S�lida', 'Anticipaci�n', '�A la Carga! (Blitz)', 'Los Hinchas Animan', 'Entrenador Brillante', 'Indigestion', 'Invasi�n de Campo'].includes(event.title);
            if (!needsExtra) setKickoffActionCompleted(true);
        }
        setManualKickoffRoll('');
        setManualEventDice1('');
        setManualEventDice2('');
    };

    const handleResolveEventDice = (d1?: number, d2?: number) => {
        const title = gameStatus.kickoffEvent?.title;
        const roll1 = d1 || (Math.floor(Math.random() * 6) + 1);
        const roll2 = d2 || (Math.floor(Math.random() * 6) + 1);
        
        let msg = '';
        if (['Los Hinchas Animan', 'Entrenador Brillante', 'Indigestion', 'Invasi�n de Campo'].includes(title)) {
            const winner = roll1 > roll2 ? 'home' : roll1 < roll2 ? 'opponent' : 'draw';
            const winnerName = winner === 'home' ? liveHomeTeam.name : liveOpponentTeam.name;

            if (title === 'Entrenador Brillante' && winner !== 'draw') {
                const setWinnerTeam = winner === 'home' ? setLiveHomeTeam : setLiveOpponentTeam;
                setWinnerTeam(prev => prev ? ({ ...prev, liveRerolls: (prev.liveRerolls || 0) + 1 }) : null);
                msg = `Entrenador brillante: ${winnerName} obtiene una segunda oportunidad extra (${roll1} vs ${roll2}).`;
            } else if (title === 'Indigestion' && winner !== 'draw') {
                const loserName = winner === 'home' ? liveOpponentTeam.name : liveHomeTeam.name;
                msg = `Indigestion: ${loserName} sufre las consecuencias del rancho barato (${roll1} vs ${roll2}).`;
            } else if (title === 'Invasi�n de Campo' && winner !== 'draw') {
                const loserName = winner === 'home' ? liveOpponentTeam.name : liveHomeTeam.name;
                msg = `Invasion de campo: los hinchas de ${winnerName} saltan al campo. ${loserName} tiene problemas (${roll1} vs ${roll2}).`;
            } else {
                msg = `Resolucion de evento - ${liveHomeTeam.name}: ${roll1}, ${liveOpponentTeam.name}: ${roll2}`;
            }
        } else {
            msg = `Resolucion de evento (1D3+3 jugadores afectados): ${Math.floor(roll1/2)+3}`;
        }
        
        logEvent('INFO', msg);
        setKickoffActionCompleted(true);
        playSound('dice');
    };

    const needsEventDice = ['Defensa S�lida', 'Anticipaci�n', '�A la Carga! (Blitz)', 'Los Hinchas Animan', 'Entrenador Brillante', 'Indigestion', 'Invasi�n de Campo'].includes(gameStatus.kickoffEvent?.title || '');
    const versusEvent = ['Los Hinchas Animan', 'Entrenador Brillante', 'Indigestion', 'Invasi�n de Campo'].includes(gameStatus.kickoffEvent?.title || '');

    return (
        <div className='max-w-4xl mx-auto space-y-6 py-4'>
            {!gameStatus.kickoffEvent ? (
                <div className="rounded-[2rem] border border-premium-gold/20 bg-black/45 p-6 md:p-8">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                        <div className="flex flex-col items-center gap-5 text-center">
                            <div className="relative flex h-32 w-32 items-center justify-center rounded-[2rem] border border-premium-gold/20 bg-premium-gold/5">
                                <div className="absolute inset-0 rounded-[2rem] bg-premium-gold/10 blur-2xl"></div>
                                <span className="material-symbols-outlined relative z-10 text-6xl text-premium-gold">sports_football</span>
                            </div>
                            <div className="space-y-2">
                                <p className="text-[10px] font-display font-black uppercase tracking-[0.35em] text-premium-gold/70">Kickoff</p>
                                <h3 className="text-3xl font-display font-black text-white italic uppercase tracking-tighter">Patada inicial</h3>
                                <p className="max-w-sm text-sm text-slate-400">
                                    Resuelve el evento que abre el drive. Puedes introducir el 2D6 manualmente o dejar que Nuffle lo determine.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4 rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="mb-1 text-[9px] font-display font-black uppercase tracking-[0.28em] text-slate-500">Evento de saque</p>
                                    <h4 className="text-lg font-display font-black uppercase italic tracking-tight text-white">Tirada principal</h4>
                                </div>
                                <span className="rounded-full border border-premium-gold/20 bg-premium-gold/10 px-3 py-1 text-[9px] font-display font-black uppercase tracking-[0.2em] text-premium-gold">2D6</span>
                            </div>

                            <div className="grid grid-cols-[1fr_auto] gap-3">
                                <input
                                    type="number" min="2" max="12" placeholder="2D6 evento"
                                    className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-center text-xl font-black text-white focus:outline-none focus:border-premium-gold transition-all"
                                    value={manualKickoffRoll}
                                    onChange={(e) => setManualKickoffRoll(e.target.value)}
                                />
                                <button
                                    onClick={() => manualKickoffRoll && handleKickoffRoll(Number(manualKickoffRoll))}
                                    className="rounded-xl bg-white px-5 text-[10px] font-display font-black uppercase tracking-[0.18em] text-black transition-all hover:bg-premium-gold"
                                >
                                    Aplicar
                                </button>
                            </div>

                            <button
                                onClick={() => handleKickoffRoll()}
                                className="w-full rounded-xl bg-premium-gold py-3 text-[10px] font-display font-black uppercase tracking-[0.22em] text-black transition-all hover:bg-white"
                            >
                                Resolver automatico
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-6 animate-slide-in-up">
                    <div className="rounded-[2rem] border border-sky-500/20 bg-sky-500/5 p-6 md:p-8">
                        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                            <div className="space-y-3">
                                <p className="text-[10px] font-display font-black uppercase tracking-[0.35em] text-sky-300">Intervencion del destino</p>
                                <h4 className="text-3xl font-display font-black text-white italic uppercase tracking-tighter">{gameStatus.kickoffEvent.title}</h4>
                                <p className="max-w-2xl text-sm leading-relaxed text-slate-300">{gameStatus.kickoffEvent.description}</p>
                            </div>
                            <div className="rounded-2xl border border-sky-500/20 bg-black/25 px-4 py-3 text-center">
                                <p className="text-[9px] font-display font-black uppercase tracking-[0.22em] text-sky-300 mb-1">Estado</p>
                                <p className="text-sm font-display font-black uppercase italic text-white">{kickoffActionCompleted ? 'Listo para drive' : 'Pendiente de resolver'}</p>
                            </div>
                        </div>
                    </div>

                    {gameStatus.kickoffEvent.title === 'Clima Cambiante' && !kickoffActionCompleted && (
                        <div className="rounded-[1.75rem] border border-sky-500/20 bg-black/35 p-5 space-y-4">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="mb-1 text-[9px] font-display font-black uppercase tracking-[0.28em] text-sky-300">Resolucion extra</p>
                                    <h5 className="text-lg font-display font-black uppercase italic tracking-tight text-white">Nueva tirada de clima</h5>
                                </div>
                                <span className="rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-[9px] font-display font-black uppercase tracking-[0.2em] text-sky-300">2D6</span>
                            </div>

                            <div className="grid grid-cols-[1fr_auto] gap-3">
                                <input
                                    type="number"
                                    min="2" max="12"
                                    value={manualWeatherRoll}
                                    onChange={(e) => setManualWeatherRoll(e.target.value)}
                                    placeholder="2-12"
                                    className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-center text-xl font-black text-white focus:outline-none focus:border-sky-500 transition-all"
                                />
                                <button
                                    onClick={() => manualWeatherRoll && handleKickoffWeatherRoll(Number(manualWeatherRoll))}
                                    className="rounded-xl bg-white px-5 text-[10px] font-display font-black uppercase tracking-[0.18em] text-black transition-all hover:bg-sky-500"
                                >
                                    Aplicar
                                </button>
                            </div>

                            <button
                                onClick={() => handleKickoffWeatherRoll(Math.floor(Math.random() * 6) + Math.floor(Math.random() * 6) + 2)}
                                className="w-full rounded-xl border border-sky-500/20 bg-sky-500/10 py-3 text-[10px] font-display font-black uppercase tracking-[0.22em] text-sky-300 transition-all hover:bg-sky-500 hover:text-black"
                            >
                                Resolver automatico
                            </button>
                        </div>
                    )}

                    {needsEventDice && !kickoffActionCompleted && (
                        <div className="rounded-[1.75rem] border border-premium-gold/20 bg-black/35 p-5 space-y-4">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="mb-1 text-[9px] font-display font-black uppercase tracking-[0.28em] text-premium-gold/80">Resolucion extra</p>
                                    <h5 className="text-lg font-display font-black uppercase italic tracking-tight text-white">Dados del suceso</h5>
                                </div>
                                <span className="rounded-full border border-premium-gold/20 bg-premium-gold/10 px-3 py-1 text-[9px] font-display font-black uppercase tracking-[0.2em] text-premium-gold">{versusEvent ? '1D6 vs 1D6' : '1D3'}</span>
                            </div>

                            <div className={`grid gap-3 ${versusEvent ? 'grid-cols-[1fr_auto_1fr]' : 'grid-cols-1 max-w-[160px]'}`}>
                                <div>
                                    <p className="mb-2 text-[9px] font-display font-black uppercase tracking-[0.2em] text-slate-500">{versusEvent ? 'Local' : 'Dado'}</p>
                                    <input
                                        type="number" min="1" max="6" value={manualEventDice1} onChange={e => setManualEventDice1(e.target.value)}
                                        className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-3 text-center text-xl font-black text-white focus:border-premium-gold"
                                        placeholder="?"
                                    />
                                </div>
                                {versusEvent && (
                                    <>
                                        <div className="flex items-end justify-center pb-3 text-xs font-display font-black italic text-slate-600">VS</div>
                                        <div>
                                            <p className="mb-2 text-[9px] font-display font-black uppercase tracking-[0.2em] text-slate-500">Rival</p>
                                            <input
                                                type="number" min="1" max="6" value={manualEventDice2} onChange={e => setManualEventDice2(e.target.value)}
                                                className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-3 text-center text-xl font-black text-white focus:border-premium-gold"
                                                placeholder="?"
                                            />
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                <button
                                    onClick={() => handleResolveEventDice(Number(manualEventDice1), Number(manualEventDice2))}
                                    className="rounded-xl bg-white py-3 text-[10px] font-display font-black uppercase tracking-[0.2em] text-black transition-all hover:bg-premium-gold"
                                >
                                    Confirmar dados
                                </button>
                                <button
                                    onClick={() => handleResolveEventDice()}
                                    className="rounded-xl border border-white/10 bg-white/5 py-3 text-[10px] font-display font-black uppercase tracking-[0.2em] text-white transition-all hover:bg-white hover:text-black"
                                >
                                    Resolver automatico
                                </button>
                            </div>
                        </div>
                    )}

                    {kickoffActionCompleted && (
                        <div className="rounded-[1.75rem] border border-premium-gold/20 bg-black/35 p-5 space-y-4">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="mb-1 text-[9px] font-display font-black uppercase tracking-[0.28em] text-premium-gold/80">Ultimo paso</p>
                                    <h5 className="text-lg font-display font-black uppercase italic tracking-tight text-white">Desvio del balon</h5>
                                </div>
                                <span className="rounded-full border border-premium-gold/20 bg-premium-gold/10 px-3 py-1 text-[9px] font-display font-black uppercase tracking-[0.2em] text-premium-gold">1D8 + 1D6</span>
                            </div>

                            <div className="grid grid-cols-2 gap-3 max-w-xs">
                                <div>
                                    <p className="mb-2 text-[9px] font-display font-black uppercase tracking-[0.2em] text-slate-500">Direccion</p>
                                    <input
                                        type="number" min="1" max="8" value={manualScatterDir} onChange={e => setManualScatterDir(e.target.value)}
                                        className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-3 text-center text-xl font-black text-white focus:border-premium-gold"
                                        placeholder="D8"
                                    />
                                </div>
                                <div>
                                    <p className="mb-2 text-[9px] font-display font-black uppercase tracking-[0.2em] text-slate-500">Distancia</p>
                                    <input
                                        type="number" min="1" max="6" value={manualScatterDist} onChange={e => setManualScatterDist(e.target.value)}
                                        className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-3 text-center text-xl font-black text-white focus:border-premium-gold"
                                        placeholder="D6"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    const d8 = manualScatterDir ? Number(manualScatterDir) : (Math.floor(Math.random() * 8) + 1);
                                    const d6 = manualScatterDist ? Number(manualScatterDist) : (Math.floor(Math.random() * 6) + 1);
                                    logEvent('INFO', `Desvio del balon - Direccion: ${d8}, Distancia: ${d6} casillas.`);
                                    handleStartDrive();
                                }}
                                className="w-full rounded-xl bg-premium-gold py-4 text-xs font-display font-black uppercase tracking-[0.26em] text-black transition-all hover:bg-white"
                            >
                                Comenzar el asalto
                            </button>
                            <p className="text-[9px] font-display font-black uppercase tracking-[0.18em] text-slate-500">Dados automaticos si se dejan en blanco</p>
                        </div>
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

const PreGameStatusChip: React.FC<{ label: string; value: string; accent?: 'gold' | 'sky' | 'green' | 'red' }> = ({
    label,
    value,
    accent = 'gold',
}) => {
    const accentMap = {
        gold: 'text-premium-gold border-premium-gold/20 bg-premium-gold/5',
        sky: 'text-sky-400 border-sky-500/20 bg-sky-500/5',
        green: 'text-green-400 border-green-500/20 bg-green-500/5',
        red: 'text-red-400 border-red-500/20 bg-red-500/5',
    };

    return (
        <div className={`rounded-2xl border px-4 py-3 ${accentMap[accent]}`}>
            <p className="mb-1 text-[9px] font-display font-black uppercase tracking-[0.25em] opacity-70">{label}</p>
            <p className="text-sm font-display font-black uppercase italic tracking-tight text-white">{value}</p>
        </div>
    );
};

const PreGameSectionFrame: React.FC<{
    step: number;
    currentStep: number;
    eyebrow: string;
    title: string;
    description: string;
    children: React.ReactNode;
}> = ({ step, currentStep, eyebrow, title, description, children }) => {
    const isActive = currentStep === step;
    const isUnlocked = currentStep >= step;

    return (
        <section
            className={`relative overflow-hidden rounded-[2rem] border transition-all duration-300 ${
                isActive
                    ? 'border-premium-gold/35 bg-black/55 shadow-[0_0_50px_rgba(245,159,10,0.08)]'
                    : isUnlocked
                        ? 'border-white/10 bg-black/40'
                        : 'border-white/5 bg-black/30 opacity-75'
            }`}
        >
            <div className="border-b border-white/5 px-6 py-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-2">
                        <p className="text-[9px] font-display font-black uppercase tracking-[0.35em] text-premium-gold/70">
                            {eyebrow}
                        </p>
                        <h3 className="text-2xl font-display font-black uppercase italic tracking-tighter text-white">
                            {title}
                        </h3>
                        <p className="max-w-2xl text-xs text-slate-400">{description}</p>
                    </div>
                    <div
                        className={`rounded-full border px-3 py-1 text-[9px] font-display font-black uppercase tracking-[0.28em] ${
                            isActive
                                ? 'border-premium-gold/30 bg-premium-gold/10 text-premium-gold'
                                : isUnlocked
                                    ? 'border-green-500/20 bg-green-500/10 text-green-400'
                                    : 'border-white/10 bg-white/5 text-slate-500'
                        }`}
                    >
                        {isActive ? 'Activa' : isUnlocked ? 'Lista' : `Paso ${step}`}
                    </div>
                </div>
            </div>

            {!isUnlocked && (
                <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-black/65 backdrop-blur-[2px]">
                    <div className="rounded-2xl border border-white/10 bg-black/70 px-6 py-4 text-center">
                        <p className="mb-2 text-[9px] font-display font-black uppercase tracking-[0.3em] text-slate-500">
                            Bloqueado
                        </p>
                        <p className="text-sm font-display font-black uppercase italic tracking-tight text-white">
                            Resuelve el paso anterior
                        </p>
                    </div>
                </div>
            )}

            <div className="p-6 md:p-8">{children}</div>
        </section>
    );
};

const PreGameStage: React.FC = () => {
    const {
        liveHomeTeam,
        liveOpponentTeam,
        preGameStep,
        journeymenNotification,
        gameStatus,
        inducementState,
        fame,
        fansRoll,
    } = useMatch();

    if (!liveHomeTeam || !liveOpponentTeam) {
        return (
            <div className="flex items-center justify-center py-20 text-premium-gold font-display font-black animate-pulse uppercase tracking-widest">
                Invocando Equipos...
            </div>
        );
    }

    if (journeymenNotification) return <JourneymenNotification />;

    const activeTeam =
        preGameStep === 1
            ? 'Centro de mando'
            : preGameStep === 2
                ? 'Despliegue'
                : 'Patada inicial';

    const setupSummary = [
        gameStatus.weather ? `Clima: ${gameStatus.weather.title}` : 'Clima pendiente',
        fansRoll.home ? `FAMA ${fame.home} - ${fame.opponent}` : 'Hinchas pendientes',
        gameStatus.receivingTeam
            ? `${gameStatus.receivingTeam === 'home' ? liveHomeTeam.name : liveOpponentTeam.name} recibe`
            : 'Sin receptor decidido',
    ];

    const underdogName =
        inducementState.underdog === 'home'
            ? liveHomeTeam.name
            : inducementState.underdog === 'opponent'
                ? liveOpponentTeam.name
                : 'Sin underdog';

    return (
        <div className="max-w-[1600px] mx-auto space-y-8 py-6 animate-fade-in">
            <div className="rounded-[2rem] border border-white/10 bg-black/45 px-6 py-6 md:px-8">
                <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                    <div className="space-y-3">
                        <p className="text-[10px] font-display font-black uppercase tracking-[0.45em] text-premium-gold/70">
                            Sala de Operaciones
                        </p>
                        <h2 className="text-4xl md:text-5xl font-display font-black text-white italic tracking-tighter uppercase">
                            Prepartido Integrado
                        </h2>
                        <p className="max-w-3xl text-sm text-slate-400">
                            Todo el arranque del encuentro en una sola mesa: incentivos, clima, decision de recepcion,
                            despliegue y kickoff. Resolvemos cada bloque una vez y dejamos el drive listo para entrar al partido.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-premium-gold/20 bg-premium-gold/5 px-4 py-3">
                        <p className="mb-1 text-[9px] font-display font-black uppercase tracking-[0.35em] text-premium-gold/70">
                            Fase activa
                        </p>
                        <p className="text-lg font-display font-black uppercase italic tracking-tight text-white">
                            {activeTeam}
                        </p>
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-6">
                    <PreGameStatusChip label="Local" value={liveHomeTeam.name} accent="sky" />
                    <PreGameStatusChip label="Rival" value={liveOpponentTeam.name} accent="red" />
                    <PreGameStatusChip
                        label="Clima"
                        value={gameStatus.weather?.title || 'Pendiente'}
                        accent={gameStatus.weather ? 'green' : 'gold'}
                    />
                    <PreGameStatusChip
                        label="FAMA"
                        value={fansRoll.home ? `${fame.home} - ${fame.opponent}` : 'Pendiente'}
                        accent={fansRoll.home ? 'green' : 'gold'}
                    />
                    <PreGameStatusChip label="Underdog" value={underdogName} accent="gold" />
                    <PreGameStatusChip
                        label="Recibe"
                        value={
                            gameStatus.receivingTeam
                                ? gameStatus.receivingTeam === 'home'
                                    ? liveHomeTeam.name
                                    : liveOpponentTeam.name
                                : 'Pendiente'
                        }
                        accent={gameStatus.receivingTeam ? 'green' : 'gold'}
                    />
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                    {setupSummary.map((item, index) => (
                        <span
                            key={index}
                            className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[10px] font-display font-black uppercase tracking-[0.22em] text-slate-300"
                        >
                            {item}
                        </span>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
                <PreGameSectionFrame
                    step={1}
                    currentStep={preGameStep}
                    eyebrow="Paso 1"
                    title="Centro de mando"
                    description="Gestiona incentivos, determina clima, resuelve la FAMA y decide quien recibe el balon."
                >
                    <CommandCenterStep />
                </PreGameSectionFrame>

                <PreGameSectionFrame
                    step={2}
                    currentStep={preGameStep}
                    eyebrow="Paso 2"
                    title="Despliegue"
                    description="Ambos banquillos preparan el drive inicial. Manten el campo visible y valida el once antes de pasar."
                >
                    <DeploymentStep />
                </PreGameSectionFrame>

                <PreGameSectionFrame
                    step={3}
                    currentStep={preGameStep}
                    eyebrow="Paso 3"
                    title="Patada inicial"
                    description="Resuelve el evento de kickoff, aplica las tiradas necesarias y deja el balon listo para comenzar el asalto."
                >
                    <KickoffStep />
                </PreGameSectionFrame>
            </div>
        </div>
    );
};

export default PreGameStage;


