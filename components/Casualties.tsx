import React, { useState } from 'react';
import { casualtyResults } from '../data/casualties';
import { lastingInjuryResults } from '../data/lastingInjuries';
import type { CasualtyEvent, LastingInjuryEvent } from '../types';

const Casualties: React.FC = () => {
  const [currentCasualty, setCurrentCasualty] = useState<CasualtyEvent | null>(null);
  const [currentLastingInjury, setCurrentLastingInjury] = useState<LastingInjuryEvent | null>(null);
  const [lastD16Roll, setLastD16Roll] = useState<number | null>(null);
  const [lastD6Roll, setLastD6Roll] = useState<number | null>(null);

  const generateCasualty = () => {
    const roll = Math.floor(Math.random() * 16) + 1;
    setLastD16Roll(roll);

    let result: CasualtyEvent | undefined;
    if (roll <= 8) {
      result = casualtyResults.find(e => e.diceRoll === '1-8');
    } else if (roll <= 10) {
      result = casualtyResults.find(e => e.diceRoll === '9-10');
    } else if (roll <= 12) {
      result = casualtyResults.find(e => e.diceRoll === '11-12');
    } else if (roll <= 14) {
        result = casualtyResults.find(e => e.diceRoll === '13-14');
    } else {
      result = casualtyResults.find(e => e.diceRoll === '15-16');
    }
    setCurrentCasualty(result || null);
  };
  
  const generateLastingInjury = () => {
    const roll = Math.floor(Math.random() * 6) + 1;
    setLastD6Roll(roll);
    
    let result: LastingInjuryEvent | undefined;
    if (roll <= 2) {
        result = lastingInjuryResults.find(e => e.diceRoll === '1-2');
    } else {
        result = lastingInjuryResults.find(e => e.diceRoll === roll.toString());
    }
    setCurrentLastingInjury(result || null);
  };


  return (
    <div className="space-y-8">
      {/* Casualty Table */}
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-amber-400 mb-3">Tabla de Lesiones</h2>
        <p className="text-slate-400 mb-6 max-w-md mx-auto">
          Siempre que un jugador resulte Herido, el entrenador rival hace una tirada de D16 en esta tabla.
        </p>
        <button
          onClick={generateCasualty}
          className="bg-amber-500 text-slate-900 font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-500/50 transform hover:scale-105 transition-all duration-200"
        >
          Generar Lesión (D16)
        </button>
        {currentCasualty && (
          <div className="mt-8 p-6 bg-slate-900/70 border border-slate-700 rounded-lg shadow-xl text-left animate-fade-in">
            <h3 className="text-xl font-bold text-amber-300 mb-2 flex items-center">
              <span className="bg-slate-700 text-amber-300 text-lg font-mono px-3 py-1 rounded-md mr-4">{lastD16Roll} ({currentCasualty.diceRoll})</span>
              <span>{currentCasualty.title}</span>
            </h3>
            <p className="text-slate-300 mt-4">{currentCasualty.description}</p>
          </div>
        )}
      </div>

      <hr className="border-slate-700" />

      {/* Lasting Injury Table */}
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-amber-400 mb-3">Tabla de Lesiones Permanentes</h2>
        <p className="text-slate-400 mb-6 max-w-md mx-auto">
          Si el resultado anterior fue "Lesion Permanente", tira un D6 en esta tabla.
        </p>
        <button
          onClick={generateLastingInjury}
          className="bg-rose-500 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-rose-400 focus:outline-none focus:ring-4 focus:ring-rose-500/50 transform hover:scale-105 transition-all duration-200"
        >
          Generar Lesión Permanente (D6)
        </button>
        {currentLastingInjury && (
          <div className="mt-8 p-6 bg-slate-900/70 border border-slate-700 rounded-lg shadow-xl text-left animate-fade-in">
            <h3 className="text-xl font-bold text-amber-300 mb-2 flex items-center">
              <span className="bg-slate-700 text-amber-300 text-lg font-mono px-3 py-1 rounded-md mr-4">{lastD6Roll} ({currentLastingInjury.diceRoll})</span>
              <span>{currentLastingInjury.permanentInjury}</span>
              <span className="ml-auto bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">{currentLastingInjury.characteristicReduction}</span>
            </h3>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default Casualties;
