
import React, { useState } from 'react';
import { prayersData } from '../data/prayers';
import type { Prayer } from '../types';

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
      <h2 className="text-2xl font-semibold text-amber-400 mb-3">Tabla de Plegarias a Nuffle</h2>
      <p className="text-slate-400 mb-6 max-w-md mx-auto">
        Si tu equipo tiene un valor inferior, puedes tirar 1D16 en esta tabla. ¡O simplemente pulsa el botón para un resultado aleatorio!
      </p>

      <button
        onClick={generatePrayer}
        className="bg-amber-500 text-slate-900 font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-500/50 transform hover:scale-105 transition-all duration-200"
      >
        Generar Plegaria Aleatoria (D16)
      </button>

      {currentPrayer && lastRoll !== null && (
        <div className="mt-8 p-6 bg-slate-900/70 border border-slate-700 rounded-lg shadow-xl text-left animate-fade-in">
          <h3 className="text-xl font-bold text-amber-300 mb-2 flex items-center">
            <span className="bg-slate-700 text-amber-300 text-lg font-mono px-3 py-1 rounded-md mr-4">{lastRoll}</span>
            <span>{currentPrayer.title}</span>
          </h3>
          <p className="text-slate-300 mt-4">{currentPrayer.description}</p>
        </div>
      )}

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Prayers;