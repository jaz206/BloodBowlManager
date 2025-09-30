import React from 'react';
import type { ManagedPlayer } from '../types';

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
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in-fast"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-w-md w-full transform animate-slide-in-up">
        <div className="p-4 border-b border-slate-700">
          <h2 className="text-xl font-bold text-amber-400">Usar Boticario</h2>
          <p className="text-sm text-slate-400">Elige una acción para {player.customName}.</p>
        </div>
        <div className="p-5 space-y-3">
          <p className="text-slate-300">Puedes usar al boticario para una de estas dos opciones:</p>
          <button
            onClick={onReroll}
            className="w-full text-left bg-sky-700/80 p-3 rounded-md hover:bg-sky-700 transition-colors"
          >
            <p className="font-bold text-white">Volver a tirar la Lesión</p>
            <p className="text-xs text-sky-200">Realiza una nueva tirada en la Tabla de Lesiones y aplica el segundo resultado.</p>
          </button>
          <button
            onClick={onPatchUp}
            disabled={hasUsedOnKO}
            className="w-full text-left bg-emerald-700/80 p-3 rounded-md hover:bg-emerald-700 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed"
          >
            <p className="font-bold text-white">Remendar y a jugar</p>
            <p className="text-xs text-emerald-200">Si un jugador queda Inconsciente, puede recuperarse y pasar a la zona de Reservas. (Solo una vez por partido)</p>
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