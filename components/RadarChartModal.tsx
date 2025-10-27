import React from 'react';
import RadarChart from './RadarChart';
import type { Team } from '../types';

interface RadarChartModalProps {
  team: Team;
  onClose: () => void;
}

const RadarChartModal: React.FC<RadarChartModalProps> = ({ team, onClose }) => {
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
      <div className="bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-w-lg w-full transform animate-slide-in-up">
        <div className="flex justify-between items-center p-4 border-b border-slate-700">
          <h2 className="text-xl font-bold text-amber-400">Análisis de Facción: {team.name}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-full"
            aria-label="Cerrar modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-5 flex flex-col items-center">
            <div className="w-full max-w-sm sm:max-w-md">
                 <RadarChart 
                    ratings={[{ data: team.ratings, color: '#f59e0b' }]} 
                    size={400} 
                    showValues={true}
                 />
            </div>
            <div className="mt-4 p-3 bg-slate-900/50 rounded-md text-center">
                <p className="text-sm text-slate-400">
                    Este gráfico representa una valoración de 0 a 100 del estilo de juego de la facción, basada en las estadísticas y habilidades de su roster.
                </p>
            </div>
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
