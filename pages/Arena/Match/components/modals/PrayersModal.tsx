import React, { useState } from 'react';
import { useMatch } from '../../context/MatchContext';
import { prayersData } from '../../../../../data/prayers';
import type { Prayer } from '../../../../../types';

const PrayersModal: React.FC = () => {
    const {
        isPrayersModalOpen,
        setIsPrayersModalOpen,
        logEvent,
        activeTeamId,
        playSound
    } = useMatch();

    const [currentPrayer, setCurrentPrayer] = useState<Prayer | null>(null);
    const [lastRoll, setLastRoll] = useState<number | null>(null);

    if (!isPrayersModalOpen) return null;

    const onClose = () => {
        setIsPrayersModalOpen(false);
        setCurrentPrayer(null);
        setLastRoll(null);
    };

    const generatePrayer = () => {
        playSound('dice');
        const roll = Math.floor(Math.random() * 16) + 1;
        setLastRoll(roll);

        const prayer = prayersData.find(p => parseInt(p.diceRoll, 10) === roll);
        if (prayer) {
            setCurrentPrayer(prayer);
            logEvent('INFO', `¡PLEGARIA A NUFFLE! ${prayer.title}: ${prayer.description}`, { team: activeTeamId });
        }
    };

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[300] p-4" onClick={onClose}>
            <div className="glass-panel max-w-2xl w-full border-premium-gold/30 bg-black shadow-[0_0_80px_rgba(245,159,10,0.15)] overflow-hidden animate-slide-in-up" onClick={e => e.stopPropagation()}>
                <div className="bg-premium-gold/10 p-6 border-b border-white/5 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-premium-gold/20 rounded-xl flex items-center justify-center border border-premium-gold/30">
                            <span className="material-symbols-outlined text-premium-gold text-2xl">auto_awesome</span>
                        </div>
                        <div>
                            <h2 className="text-2xl font-display font-black text-white uppercase italic tracking-tighter">Plegarias a Nuffle</h2>
                            <p className="text-[10px] font-display font-bold text-premium-gold uppercase tracking-widest text-shadow-glow">Cuando la táctica no basta, queda la fe</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-premium-gold/20 text-slate-500 hover:text-premium-gold transition-all flex items-center justify-center border border-white/5">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                
                <div className="p-10 text-center">
                    {!currentPrayer ? (
                        <div className="space-y-8 animate-fade-in">
                            <div className="max-w-md mx-auto space-y-4">
                                <p className="text-slate-400 font-display italic text-sm leading-relaxed">
                                    "Aquel que no confía en Nuffle, no merece su favor. Lanza los dados y acepta tu destino en la arena."
                                </p>
                            </div>
                            
                            <button
                                onClick={generatePrayer}
                                className="group relative bg-premium-gold text-black font-display font-black uppercase tracking-[0.2em] text-sm py-6 px-16 rounded-[2rem] transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-premium-gold/20 border border-white/20 overflow-hidden"
                            >
                                <span className="relative z-10 flex items-center gap-3">
                                    <span className="material-symbols-outlined font-black">casino</span>
                                    Implorar Clemenica (D16)
                                </span>
                                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-30 transition-opacity"></div>
                            </button>
                        </div>
                    ) : (
                        <div className="animate-fade-in space-y-8">
                            <div className="flex flex-col items-center gap-6">
                                <div className="w-24 h-24 bg-premium-gold text-black rounded-3xl flex items-center justify-center text-4xl font-display font-black shadow-2xl border-4 border-white/10 rotate-3">
                                    {lastRoll}
                                </div>
                                <div className="space-y-3">
                                    <h3 className="text-4xl font-display font-black text-white italic uppercase tracking-tighter leading-none">{currentPrayer.title}</h3>
                                    <div className="h-1 w-24 bg-gradient-to-r from-transparent via-premium-gold to-transparent mx-auto"></div>
                                </div>
                            </div>
                            
                            <div className="glass-panel p-8 bg-white/5 border-white/10 text-left relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 pointer-events-none transition-opacity">
                                    <span className="material-symbols-outlined text-[120px] text-premium-gold">temple_buddhist</span>
                                </div>
                                <p className="text-lg text-slate-200 font-display italic leading-relaxed border-l-4 border-premium-gold/40 pl-6 relative z-10">
                                    {currentPrayer.description}
                                </p>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setCurrentPrayer(null)}
                                    className="flex-1 bg-white/5 border border-white/10 text-slate-500 py-4 rounded-2xl font-display font-black uppercase tracking-widest text-xs hover:text-white transition-all"
                                >
                                    Nueva Súplica
                                </button>
                                <button
                                    onClick={onClose}
                                    className="flex-1 bg-premium-gold text-black py-4 rounded-2xl font-display font-black uppercase tracking-widest text-xs hover:bg-white transition-all shadow-xl"
                                >
                                    ¡Que así sea!
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PrayersModal;
