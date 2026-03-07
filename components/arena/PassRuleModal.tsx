
import React from 'react';

const PassRuleModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[60] p-4 animate-fade-in-fast"
      onClick={handleBackdropClick}
    >
      <div
        className="glass-panel max-w-2xl w-full transform animate-slide-in-up flex flex-col max-h-[90vh] border-white/10 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-white/5 bg-white/5">
          <h2 className="text-2xl font-display font-black text-white italic uppercase tracking-tighter">Reglas de Pase</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-premium">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-8 overflow-y-auto space-y-8 scrollbar-hide">
          <div className="space-y-4">
            <h3 className="font-display font-black text-premium-gold uppercase tracking-widest text-sm italic flex items-center gap-3">
              <span className="w-6 h-6 bg-premium-gold/10 rounded-md flex items-center justify-center text-[10px] not-italic border border-premium-gold/20">1</span>
              Medir Distancia y Modificadores
            </h3>
            <p className="text-white/70 font-display font-medium leading-relaxed italic border-l-2 border-white/5 pl-4 ml-3">Determina la dificultad según las casillas X e Y.</p>
            <div className="grid grid-cols-2 gap-3 ml-3">
              {[
                { label: 'Pase Rápido', mod: 'Sin mod.' },
                { label: 'Pase Corto', mod: '-1' },
                { label: 'Pase Largo', mod: '-2' },
                { label: 'Bomba Larga', mod: '-3' }
              ].map(item => (
                <div key={item.label} className="bg-white/5 border border-white/10 rounded-xl p-3 flex justify-between items-center group hover:bg-white/10 transition-premium">
                  <span className="text-[10px] font-display font-black uppercase tracking-widest text-slate-400 group-hover:text-white transition-colors">{item.label}</span>
                  <span className="text-premium-gold font-display font-black">{item.mod}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-display font-black text-premium-gold uppercase tracking-widest text-sm italic flex items-center gap-3">
              <span className="w-6 h-6 bg-premium-gold/10 rounded-md flex items-center justify-center text-[10px] not-italic border border-premium-gold/20">2</span>
              Chequeo de Precisión (1D6)
            </h3>
            <div className="bg-black/40 border border-white/5 rounded-2xl p-6 relative overflow-hidden group ml-3">
              <p className="text-white/80 font-display font-medium leading-relaxed italic relative z-10">
                Suma el modificador a tu tirada de dado. El resultado debe igualar o superar el atributo de <span className="text-white font-black uppercase tracking-tighter">PS (Pase)</span>.
              </p>
              <div className="flex gap-4 mt-6">
                <div className="flex-1 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                  <span className="block text-[8px] font-display font-black text-emerald-400/60 uppercase tracking-[0.2em] mb-1">Éxito Crítico</span>
                  <p className="text-xs font-display font-bold text-white uppercase italic tracking-widest">6 Natural: Preciso</p>
                </div>
                <div className="flex-1 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                  <span className="block text-[8px] font-display font-black text-red-400/60 uppercase tracking-[0.2em] mb-1">Fallo Crítico</span>
                  <p className="text-xs font-display font-bold text-white uppercase italic tracking-widest">1 Natural: Perdido</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-display font-black text-premium-gold uppercase tracking-widest text-sm italic flex items-center gap-3">
              <span className="w-6 h-6 bg-premium-gold/10 rounded-md flex items-center justify-center text-[10px] not-italic border border-premium-gold/20">3</span>
              Resultados del Trayecto
            </h3>
            <div className="space-y-2 ml-3">
              {[
                { title: 'Preciso', desc: 'Aterriza en la casilla objetivo.', text: 'text-emerald-400', bg: 'bg-emerald-500/5', border: 'border-emerald-500/20' },
                { title: 'Impreciso', desc: 'Se desvía desde el OBJETIVO.', text: 'text-yellow-400', bg: 'bg-yellow-500/5', border: 'border-yellow-500/20' },
                { title: 'Muy Impreciso', desc: 'Se desvía desde el LANZADOR.', text: 'text-orange-400', bg: 'bg-orange-500/5', border: 'border-orange-500/20' },
                { title: 'Balón Perdido', desc: 'Rebota desde el LANZADOR + Turnover.', text: 'text-red-400', bg: 'bg-red-500/5', border: 'border-red-500/20' }
              ].map(res => (
                <div key={res.title} className={`${res.bg} ${res.border} border rounded-xl p-4 flex justify-between items-center`}>
                  <span className={`text-[10px] font-display font-black uppercase tracking-widest ${res.text}`}>{res.title}</span>
                  <span className="text-[11px] text-white/50 font-display font-medium italic">{res.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="p-6 bg-black/20 border-t border-white/5 flex gap-4">
          <button onClick={onClose} className="flex-1 bg-premium-gold text-black font-display font-black uppercase tracking-[0.2em] text-[10px] py-4 rounded-xl shadow-xl shadow-premium-gold/10 hover:scale-[1.02] active:scale-95 transition-premium border border-white/20">
            Entendido
          </button>
        </div>
      </div>
      <style>{`
          @keyframes fade-in-fast { from { opacity: 0; } to { opacity: 1; } }
          @keyframes slide-in-up { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
          .animate-fade-in-fast { animation: fade-in-fast 0.2s ease-out forwards; }
          .animate-slide-in-up { animation: slide-in-up 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default PassRuleModal;
