import React, { useState } from 'react';
import { kickoffEvents } from '../data/kickoffEvents';
import type { KickoffEvent } from '../types';

const KickoffEvents: React.FC = () => {
  const [currentEvent, setCurrentEvent] = useState<KickoffEvent | null>(null);
  const [lastRoll, setLastRoll] = useState<number | null>(null);

  const generateEvent = () => {
    // Simulate a 2D6 roll to get a weighted result
    const die1 = Math.floor(Math.random() * 6) + 1;
    const die2 = Math.floor(Math.random() * 6) + 1;
    const roll = die1 + die2;
    setLastRoll(roll);
    
    // Find the event corresponding to the roll
    const event = kickoffEvents.find(e => parseInt(e.diceRoll, 10) === roll);
    setCurrentEvent(event || null);
  };

  return (
    <div className="text-center">
      <h2 className="text-2xl font-semibold text-amber-400 mb-3">Tabla de Eventos de Patada Inicial</h2>
      <p className="text-slate-400 mb-6 max-w-md mx-auto">
        Tira 2D6 y consulta la tabla para determinar el evento de la patada inicial. O, ¡pulsa el botón para un resultado aleatorio!
      </p>

      <button
        onClick={generateEvent}
        className="bg-amber-500 text-slate-900 font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-500/50 transform hover:scale-105 transition-all duration-200"
      >
        Generar Evento Aleatorio (2D6)
      </button>

      {currentEvent && lastRoll !== null && (
        <div className="mt-8 p-6 bg-slate-900/70 border border-slate-700 rounded-lg shadow-xl text-left animate-fade-in">
          <h3 className="text-xl font-bold text-amber-300 mb-2 flex items-center">
            <span className="bg-slate-700 text-amber-300 text-lg font-mono px-3 py-1 rounded-md mr-4">{lastRoll}</span>
            <span>{currentEvent.title}</span>
          </h3>
          <p className="text-slate-300 mt-4">{currentEvent.description}</p>
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

export default KickoffEvents;