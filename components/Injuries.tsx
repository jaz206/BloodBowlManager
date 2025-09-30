import React, { useState } from 'react';
import { injuryResults } from '../data/injuries';
import { stuntyInjuryResults } from '../data/stuntyInjuries';
import type { InjuryEvent } from '../types';

const Injuries: React.FC = () => {
  const [currentInjury, setCurrentInjury] = useState<InjuryEvent | null>(null);
  const [currentStuntyInjury, setCurrentStuntyInjury] = useState<InjuryEvent | null>(null);
  const [lastRoll, setLastRoll] = useState<number | null>(null);
  const [lastStuntyRoll, setLastStuntyRoll] = useState<number | null>(null);


  const generateInjury = () => {
    const die1 = Math.floor(Math.random() * 6) + 1;
    const die2 = Math.floor(Math.random() * 6) + 1;
    const roll = die1 + die2;
    setLastRoll(roll);

    let result: InjuryEvent | undefined;
    if (roll >= 2 && roll <= 7) {
      result = injuryResults.find(e => e.diceRoll === '2-7');
    } else if (roll >= 8 && roll <= 9) {
      result = injuryResults.find(e => e.diceRoll === '8-9');
    } else {
      result = injuryResults.find(e => e.diceRoll === '10-12');
    }
    setCurrentInjury(result || null);
  };

  const generateStuntyInjury = () => {
    const die1 = Math.floor(Math.random() * 6) + 1;
    const die2 = Math.floor(Math.random() * 6) + 1;
    const roll = die1 + die2;
    setLastStuntyRoll(roll);

    let result: InjuryEvent | undefined;
    if (roll >= 2 && roll <= 6) {
      result = stuntyInjuryResults.find(e => e.diceRoll === '2-6');
    } else if (roll >= 7 && roll <= 8) {
      result = stuntyInjuryResults.find(e => e.diceRoll === '7-8');
    } else if (roll === 9) {
        result = stuntyInjuryResults.find(e => e.diceRoll === '9');
    } else {
      result = stuntyInjuryResults.find(e => e.diceRoll === '10-12');
    }
    setCurrentStuntyInjury(result || null);
  };

  return (
    <div className="space-y-8">
      {/* Standard Injury Table */}
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-amber-400 mb-3">Tirada de Heridas</h2>
        <p className="text-slate-400 mb-6 max-w-md mx-auto">
          Cuando se rompre la Armadura de un jugador, el entrenador rival tira 2D6 y consulta la siguiente tabla.
        </p>
        <button
          onClick={generateInjury}
          className="bg-amber-500 text-slate-900 font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-500/50 transform hover:scale-105 transition-all duration-200"
        >
          Generar Tirada Estándar
        </button>
        {currentInjury && (
          <div className="mt-8 p-6 bg-slate-900/70 border border-slate-700 rounded-lg shadow-xl text-left animate-fade-in">
            <h3 className="text-xl font-bold text-amber-300 mb-2 flex items-center">
              <span className="bg-slate-700 text-amber-300 text-lg font-mono px-3 py-1 rounded-md mr-4">{lastRoll} ({currentInjury.diceRoll})</span>
              <span>{currentInjury.title}</span>
            </h3>
            <p className="text-slate-300 mt-4">{currentInjury.description}</p>
          </div>
        )}
      </div>

      <hr className="border-slate-700" />

      {/* Stunty Injury Table */}
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-amber-400 mb-3">Tabla de Heridas para Escurridizos</h2>
        <p className="text-slate-400 mb-6 max-w-md mx-auto">
          Para jugadores con el rasgo Escurridizo, se debe tirar en esta tabla en lugar de la normal.
        </p>
        <button
          onClick={generateStuntyInjury}
          className="bg-rose-500 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-rose-400 focus:outline-none focus:ring-4 focus:ring-rose-500/50 transform hover:scale-105 transition-all duration-200"
        >
          Generar Tirada Escurridizo
        </button>
        {currentStuntyInjury && (
          <div className="mt-8 p-6 bg-slate-900/70 border border-slate-700 rounded-lg shadow-xl text-left animate-fade-in">
            <h3 className="text-xl font-bold text-amber-300 mb-2 flex items-center">
              <span className="bg-slate-700 text-amber-300 text-lg font-mono px-3 py-1 rounded-md mr-4">{lastStuntyRoll} ({currentStuntyInjury.diceRoll})</span>
              <span>{currentStuntyInjury.title}</span>
            </h3>
            <p className="text-slate-300 mt-4">{currentStuntyInjury.description}</p>
          </div>
        )}
      </div>

      {/* Fix: Removed invalid `jsx` prop from the `<style>` tag. */}
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

export default Injuries;