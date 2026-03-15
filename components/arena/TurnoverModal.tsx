import React from 'react';

interface TurnoverModalProps {
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

const turnoverReasons = [
  "Fallo al placar (Derribado)",
  "Fallo al esquivar",
  "Fallo al recoger el balón",
  "Fallo al pasar/atrapar",
  "Fallo al esprintar",
  "Falta (dobles o expulsión)",
  "Otra causa",
];

const TurnoverModal: React.FC<TurnoverModalProps> = ({ onClose, onConfirm }) => {
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in-fast"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      <div className="glass-panel max-w-md w-full transform animate-slide-in-up border-red-500/30 overflow-hidden shadow-[0_0_50px_rgba(239,68,68,0.2)]">
        <div className="p-6 border-b border-red-500/10 bg-red-500/5">
          <h2 className="text-4xl font-display font-black text-red-500 italic uppercase tracking-tighter text-center">¡TURNOVER!</h2>
          <p className="text-[10px] font-display font-bold text-red-400/60 uppercase tracking-[0.2em] mt-2 text-center">Fallo crítico en el sistema de juego</p>
        </div>
        <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto scrollbar-hide">
          <p className="text-white/70 font-display font-medium italic mb-4 text-center text-xs">Determina la causa de la interrupción:</p>
          {turnoverReasons.map(reason => (
            <button
              key={reason}
              onClick={() => onConfirm(reason)}
              className="w-full group relative overflow-hidden rounded-xl border border-white/5 bg-white/5 p-4 transition-premium hover:border-red-500/30 hover:bg-red-500/10 text-left"
            >
              <span className="relative z-10 font-display font-black text-slate-400 uppercase tracking-widest text-[10px] group-hover:text-red-400 transition-colors">{reason}</span>
              <div className="absolute inset-y-0 right-0 w-1 bg-red-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
          ))}
        </div>
        <div className="p-4 bg-black/20 border-t border-white/5">
          <button
            onClick={onClose}
            className="w-full text-[10px] font-display font-black uppercase tracking-[0.2em] text-slate-500 hover:text-white transition-premium py-2"
          >
            Ignorar Aviso
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

export default TurnoverModal;
