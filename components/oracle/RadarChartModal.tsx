import React from 'react';
import RadarChart from './RadarChart';
import type { Team } from '../../types';

interface RadarChartModalProps {
  team: Team;
  onClose: () => void;
  customTitle?: React.ReactNode;
}

const RadarChartModal: React.FC<RadarChartModalProps> = ({ team, onClose, customTitle }) => {
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-[rgba(255,248,231,0.68)] backdrop-blur-md flex items-center justify-center z-[2000] p-4 animate-fade-in-fast"
      style={{ zIndex: 2000 }}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      <div className="blood-ui-light-card max-w-lg w-full transform animate-slide-in-up overflow-hidden shadow-[0_24px_70px_rgba(92,68,39,0.16)] rounded-[1.8rem]">
        <div className="flex justify-between items-center p-6 border-b border-[rgba(111,87,56,0.12)] bg-[rgba(255,251,241,0.55)]">
          {customTitle ? customTitle : (
            <h2 className="blood-ui-light-title text-2xl uppercase italic tracking-tighter leading-none">Análisis Táctico: {team.name}</h2>
          )}
          <button
            onClick={onClose}
            className="text-[#7b6853] hover:text-[#2b1d12] p-2 rounded-xl hover:bg-white/50 transition-premium"
            aria-label="Cerrar modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-8 flex flex-col items-center">
          <div className="w-full max-w-sm sm:max-w-md rounded-3xl p-4 border border-[rgba(111,87,56,0.12)] bg-[rgba(255,251,241,0.68)] shadow-inner">
            <RadarChart
              ratings={[{ data: team.ratings, color: '#f59e0b' }]}
              size={400}
              showValues={true}
            />
          </div>
          <div className="mt-8 blood-ui-light-card p-6 relative overflow-hidden group rounded-[1.4rem]">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#ca8a04]/30"></div>
            <p className="blood-ui-light-body text-[11px] font-medium italic leading-relaxed">
              Este gráfico representa una valoración militar-deportiva del estilo de juego de la facción, proyectada sobre una escala de 0 a 100 basada en estadísticas de roster y entrenamiento avanzado.
            </p>
          </div>
        </div>
        <div className="p-4 bg-[rgba(255,251,241,0.62)] border-t border-[rgba(111,87,56,0.12)]">
          <button
            onClick={onClose}
            className="w-full text-[10px] font-display font-black uppercase tracking-[0.2em] text-[#7b6853] hover:text-[#2b1d12] transition-premium py-2"
          >
            Cerrar Análisis
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

export default RadarChartModal;
