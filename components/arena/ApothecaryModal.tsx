import React from 'react';
import type { ManagedPlayer } from '../../types';

interface ApothecaryModalProps {
  player: ManagedPlayer;
  onClose: () => void;
  onReroll: () => void;
  onPatchUp: () => void;
  hasUsedOnKO: boolean;
}

const ApothecaryModal: React.FC<ApothecaryModalProps> = ({ player, onClose, onReroll, onPatchUp, hasUsedOnKO }) => {
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
      <div className="glass-panel max-w-md w-full transform animate-slide-in-up border-white/10 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        <div className="p-6 border-b border-white/5 bg-white/5">
          <h2 className="text-2xl font-display font-black text-white italic uppercase tracking-tighter">Usar Boticario</h2>
          <p className="text-[10px] font-display font-bold text-slate-500 uppercase tracking-widest mt-1">Intervención médica para {player.customName}</p>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-white/70 font-display font-medium italic mb-2">Selecciona el procedimiento de emergencia:</p>

          <button
            onClick={onReroll}
            className="w-full text-left group relative overflow-hidden rounded-xl border border-sky-500/20 bg-sky-500/10 p-5 transition-premium hover:border-sky-400/50 hover:bg-sky-500/20"
          >
            <div className="relative z-10">
              <p className="font-display font-black text-sky-400 uppercase tracking-tighter text-lg italic">Volver a tirar la Lesión</p>
              <p className="text-[11px] text-sky-300/60 font-medium leading-tight mt-1">Realiza una nueva tirada médica y aplica el segundo resultado obtenido.</p>
            </div>
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <svg className="w-12 h-12 text-sky-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
            </div>
          </button>

          <button
            onClick={onPatchUp}
            disabled={hasUsedOnKO}
            className="w-full text-left group relative overflow-hidden rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-5 transition-premium hover:border-emerald-400/50 hover:bg-emerald-500/20 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed"
          >
            <div className="relative z-10">
              <p className="font-display font-black text-emerald-400 uppercase tracking-tighter text-lg italic">Remendar y a jugar</p>
              <p className="text-[11px] text-emerald-300/60 font-medium leading-tight mt-1">Recupera a un jugador Inconsciente para la zona de Reservas. (Una vez por partido)</p>
            </div>
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <svg className="w-12 h-12 text-emerald-400" fill="currentColor" viewBox="0 0 24 24"><path d="M13 3h-2v10h2V3zm4.83 2.17l-1.42 1.42C17.99 7.86 19 9.81 19 12c0 3.87-3.13 7-7 7s-7-3.13-7-7c0-2.19 1.01-4.14 2.58-5.42L6.17 5.17C4.23 6.82 3 9.26 3 12c0 4.97 4.03 9 9 9s9-4.03 9-9c0-2.74-1.23-5.18-3.17-6.83z" /></svg>
            </div>
          </button>
        </div>

        <div className="p-4 bg-black/20 border-t border-white/5 flex justify-end">
          <button
            onClick={onClose}
            className="text-[10px] font-display font-black uppercase tracking-[0.2em] text-slate-500 hover:text-white transition-premium py-2 px-6"
          >
            Cancelar
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

export default ApothecaryModal;