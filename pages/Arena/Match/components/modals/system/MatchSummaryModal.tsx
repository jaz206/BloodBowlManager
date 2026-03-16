import React from 'react';
import { useMatch } from '../../../context/MatchContext';

const MatchSummaryModal: React.FC = () => {
    const {
        isMatchSummaryOpen,
        setIsMatchSummaryOpen,
        liveHomeTeam,
        liveOpponentTeam,
        gameLog,
        score,
        gameStatus,
        fame
    } = useMatch();

    if (!isMatchSummaryOpen || !liveHomeTeam || !liveOpponentTeam) return null;

    const onClose = () => setIsMatchSummaryOpen(false);

    // Normalize event types for filtering
    const tds = gameLog.filter(e => e.type === 'touchdown' || e.type === 'TOUCHDOWN' || e.description.toLowerCase().includes('ha anotado un touchdown'));
    const injuries = gameLog.filter(e => e.type === 'injury_casualty' || e.type === 'INJURY' || e.type === 'DEATH');
    const fouls = gameLog.filter(e => e.type === 'foul_attempt' || e.type === 'FOUL' || e.type === 'player_sent_off' || e.type === 'EXPULSION');

    // Count touchdowns per team - Fallback to current score if log filtering is ambiguous
    const logHomeScore = tds.filter(e => e.team === 'home').length;
    const logOpponentScore = tds.filter(e => e.team === 'opponent').length;
    
    const homeScoreValue = Math.max(logHomeScore, score.home);
    const opponentScoreValue = Math.max(logOpponentScore, score.opponent);

    const spectators = (fame.home + fame.opponent) * 1000 + 10000;
    const weather = gameStatus.weather?.title;

    const renderEmpty = (text: string) => (
        <div className="py-8 text-center border-2 border-dashed border-white/5 rounded-2xl">
            <p className="text-[10px] font-display font-black text-slate-600 uppercase tracking-widest">{text}</p>
        </div>
    );

    const StatMiniCard = ({ label, home, away, icon, color = "premium-gold" }: { label: string, home: number, away: number, icon: string, color?: string }) => (
        <div className="bg-black/40 border border-white/5 p-4 rounded-2xl flex flex-col items-center gap-2 group hover:border-premium-gold/20 transition-all">
            <span className={`material-symbols-outlined text-${color} text-lg mb-1`}>{icon}</span>
            <div className="flex items-center gap-3 w-full justify-between px-2">
                <span className="text-xl font-display font-black text-white">{home}</span>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
                <span className="text-xl font-display font-black text-white">{away}</span>
            </div>
        </div>
    );

    // Simulated stats calculation based on log
    const stats = {
        passes: {
            home: gameLog.filter(e => e.team === 'home' && (e.type === 'pass_complete' || e.type === 'PASS')).length,
            opponent: gameLog.filter(e => e.team === 'opponent' && (e.type === 'pass_complete' || e.type === 'PASS')).length
        },
        interceptions: {
            home: gameLog.filter(e => e.team === 'home' && (e.type === 'interception' || e.type === 'INTERCEPTION')).length,
            opponent: gameLog.filter(e => e.team === 'opponent' && (e.type === 'interception' || e.type === 'INTERCEPTION')).length
        },
        fouls: {
            home: gameLog.filter(e => e.team === 'home' && (e.type === 'foul_attempt' || e.type === 'FOUL')).length,
            opponent: gameLog.filter(e => e.team === 'opponent' && (e.type === 'foul_attempt' || e.type === 'FOUL')).length
        },
        casualties: {
            home: gameLog.filter(e => e.team === 'home' && (e.type === 'injury_casualty' || e.type === 'INJURY' || e.type === 'DEATH')).length,
            opponent: gameLog.filter(e => e.team === 'opponent' && (e.type === 'injury_casualty' || e.type === 'INJURY' || e.type === 'DEATH')).length
        }
    };

    return (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center z-[500] p-4 lg:p-12">
            <div className="glass-panel max-w-6xl w-full max-h-[92vh] flex flex-col border-premium-gold/30 bg-black/60 shadow-[0_0_120px_rgba(245,159,10,0.2)] animate-slide-in-up overflow-hidden">
                {/* Sticky Header */}
                <div className="sticky top-0 z-10 flex justify-between items-center p-6 md:p-8 border-b border-white/10 bg-black/80 backdrop-blur-md">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-display font-black text-white uppercase italic tracking-tighter">Crónica de <span className="text-premium-gold">Nuffle</span></h2>
                        <div className="flex items-center gap-4 mt-1">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">El eco de los gritos en la arena</p>
                            <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
                                🏟️ {spectators.toLocaleString()} Espectadores
                            </span>
                            {weather && (
                                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                                    ☀️ {weather}
                                </span>
                            )}
                        </div>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-black/40 border border-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto custom-scrollbar p-6 md:p-8 space-y-12">
                    {/* Score Hero */}
                    <div className="grid grid-cols-3 gap-8 items-center max-w-2xl mx-auto bg-black/40 p-8 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-white/5 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-sky-500/5 via-transparent to-red-500/5"></div>
                        <div className="text-right relative z-10">
                            <p className="text-[10px] font-display font-black text-sky-400 uppercase tracking-widest mb-2 line-clamp-1">{liveHomeTeam.name}</p>
                            <div className="text-5xl md:text-6xl font-display font-black text-white italic drop-shadow-[0_0_30px_rgba(14,165,233,0.3)]">{homeScoreValue}</div>
                        </div>
                        <div className="flex flex-col items-center relative z-10">
                            <div className="w-px h-10 md:h-12 bg-premium-gold/30"></div>
                            <span className="text-[10px] font-display font-black text-premium-gold uppercase tracking-[0.3em] my-3 md:my-4">Final</span>
                            <div className="w-px h-10 md:h-12 bg-premium-gold/30"></div>
                        </div>
                        <div className="text-left relative z-10">
                            <p className="text-[10px] font-display font-black text-red-500 uppercase tracking-widest mb-2 line-clamp-1">{liveOpponentTeam.name}</p>
                            <div className="text-5xl md:text-6xl font-display font-black text-white italic drop-shadow-[0_0_30px_rgba(220,38,38,0.3)]">{opponentScoreValue}</div>
                        </div>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatMiniCard label="Pases" home={stats.passes.home} away={stats.passes.opponent} icon="pbolt" />
                        <StatMiniCard label="Interc." home={stats.interceptions.home} away={stats.interceptions.opponent} icon="gesture" />
                        <StatMiniCard label="Faltas" home={stats.fouls.home} away={stats.fouls.opponent} icon="gavel" color="amber-500" />
                        <StatMiniCard label="Bajas" home={stats.casualties.home} away={stats.casualties.opponent} icon="skull" color="blood-red" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        <section className="space-y-4">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="w-10 h-10 rounded-full bg-premium-gold/10 border border-premium-gold/30 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-premium-gold text-xl">sports_football</span>
                                </div>
                                <h3 className="text-sm font-display font-black text-white uppercase tracking-widest">Touchdowns Añadidos</h3>
                            </div>
                            {tds.length > 0 ? (
                                <div className="space-y-3">
                                    {tds.map((td, i) => (
                                        <div key={i} className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 group hover:border-premium-gold/30 transition-all">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border font-display font-black text-xs ${td.team === 'home' ? 'bg-sky-500/20 border-sky-500/30 text-sky-400' : 'bg-red-500/20 border-red-500/30 text-red-500'}`}>
                                                TD
                                            </div>
                                            <div>
                                                <p className="text-xs font-display font-black text-white uppercase line-clamp-1">{td.description.split('ha anotado')[0].trim()}</p>
                                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Parte {td.half} · Turno {td.turn}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : renderEmpty('Sin Touchdowns registrados')}
                        </section>

                        <section className="space-y-4">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="w-10 h-10 rounded-full bg-blood-red/10 border border-blood-red/30 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-blood-red text-xl">skull</span>
                                </div>
                                <h3 className="text-sm font-display font-black text-white uppercase tracking-widest">Informe de Bajas</h3>
                            </div>
                            {injuries.length > 0 ? (
                                <div className="grid grid-cols-1 gap-3">
                                    {injuries.map((injury, i) => {
                                        const match = injury.description.match(/Herida a (.*?)\. (.*)/) || injury.description.match(/¡MUERTE! (.*?) (.*)/);
                                        const name = match ? match[1] : (injury.type === 'DEATH' ? '¡ÓBITO!' : 'Jugador');
                                        const description = match ? match[2] : injury.description;

                                        return (
                                            <div key={i} className="bg-blood-red/5 p-4 rounded-2xl border border-blood-red/20 border-l-4 border-l-blood-red">
                                                <div className="flex justify-between items-start mb-2">
                                                    <p className="text-xs font-display font-black text-white uppercase line-clamp-1">{name}</p>
                                                    <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest min-w-max ml-2">P.{injury.half} T.{injury.turn}</span>
                                                </div>
                                                <p className="text-[10px] text-slate-400 leading-relaxed italic">
                                                    {description}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : renderEmpty('Sin bajas mayores registradas')}
                        </section>
                    </div>

                    {(fouls.length > 0) && (
                        <section className="space-y-4">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-amber-500 text-xl">gavel</span>
                                </div>
                                <h3 className="text-sm font-display font-black text-white uppercase tracking-widest">Incidentes Disciplinarios</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {fouls.map((foul, i) => (
                                    <div key={i} className="flex items-center gap-4 bg-amber-500/5 p-4 rounded-2xl border border-amber-500/20 border-l-4 border-l-amber-500">
                                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-amber-500 text-lg">person_off</span>
                                        </div>
                                        <div>
                                            <p className="text-xs font-display font-black text-white uppercase leading-tight line-clamp-2">{foul.description}</p>
                                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Parte {foul.half} · Turno {foul.turn}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MatchSummaryModal;

