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
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in-fast"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-w-md w-full transform animate-slide-in-up">
        <div className="p-4 border-b border-slate-700">
          <h2 className="text-xl font-bold text-red-500">¡TURNOVER!</h2>
          <p className="text-sm text-slate-400">Selecciona la causa del cambio de turno.</p>
        </div>
        <div className="p-5 space-y-2 max-h-[60vh] overflow-y-auto">
          {turnoverReasons.map(reason => (
            <button
              key={reason}
              onClick={() => onConfirm(reason)}
              className="w-full text-left bg-slate-700/50 p-3 rounded-md hover:bg-slate-700 transition-colors font-semibold"
            >
              {reason}
            </button>
          ))}
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