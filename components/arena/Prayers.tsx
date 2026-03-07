
import React, { useState } from 'react';
import { prayersData } from '../../data/prayers';
import type { Prayer } from '../../types';

const Prayers: React.FC = () => {
  const [currentPrayer, setCurrentPrayer] = useState<Prayer | null>(null);
  const [lastRoll, setLastRoll] = useState<number | null>(null);

  const generatePrayer = () => {
    const roll = Math.floor(Math.random() * 16) + 1;
    setLastRoll(roll);

    const prayer = prayersData.find(p => parseInt(p.diceRoll, 10) === roll);
    setCurrentPrayer(prayer || null);
  };

  return (
    <div className="text-center">
      <h2 className="text-3xl font-display font-black text-white italic uppercase tracking-tighter mb-4">Plegarias a Nuffle</h2>
      <p className="text-[10px] font-display font-bold text-slate-500 uppercase tracking-[0.2em] mb-8 max-w-md mx-auto leading-relaxed border-b border-white/5 pb-4">
        Cuando la suerte te abandona, solo queda implorar clemencia al Gran Dios del Blood Bowl.
      </p>

      <button
        onClick={generatePrayer}
        className="group relative bg-premium-gold text-black font-display font-black uppercase tracking-widest text-xs py-5 px-12 rounded-xl transition-premium hover:scale-105 active:scale-95 shadow-2xl shadow-premium-gold/30 border border-white/20 overflow-hidden"
      >
        <span className="relative z-10">Lanzar Plegaria (D16)</span>
        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
      </button>

      {currentPrayer && lastRoll !== null && (
        <div className="mt-12 group">
          <div className="glass-panel p-8 border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] text-left animate-slide-in-up relative overflow-hidden bg-white/5">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none">
              <svg className="w-32 h-32 text-premium-gold" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l-5.5 9h11L12 2zm0 14c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5z" /></svg>
            </div>

            <h3 className="text-3xl font-display font-black text-white italic uppercase tracking-tighter mb-4 flex items-center gap-6">
              <span className="bg-premium-gold text-black text-2xl not-italic font-black px-4 py-1.5 rounded-xl shadow-xl border border-white/20">{lastRoll}</span>
              <span>{currentPrayer.title}</span>
            </h3>
            <p className="text-white font-medium italic opacity-80 leading-relaxed max-w-2xl border-l-4 border-premium-gold/50 pl-6">{currentPrayer.description}</p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-in-up { animation: slide-in-up 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
      `}</style>
    </div>
  );
};

export default Prayers;