import React, { useState } from 'react';
import { weatherConditions } from '../data/weather';
import type { WeatherCondition } from '../types';

const Weather: React.FC = () => {
  const [currentWeather, setCurrentWeather] = useState<WeatherCondition | null>(null);
  const [lastRoll, setLastRoll] = useState<number | null>(null);

  const generateWeather = () => {
    // Simulate a 2D6 roll
    const die1 = Math.floor(Math.random() * 6) + 1;
    const die2 = Math.floor(Math.random() * 6) + 1;
    const roll = die1 + die2;
    setLastRoll(roll);

    let result: WeatherCondition | undefined;
    if (roll === 2) {
      result = weatherConditions.find(e => e.roll === '2');
    } else if (roll === 3) {
      result = weatherConditions.find(e => e.roll === '3');
    } else if (roll >= 4 && roll <= 10) {
      result = weatherConditions.find(e => e.roll === '4-10');
    } else if (roll === 11) {
      result = weatherConditions.find(e => e.roll === '11');
    } else { // roll === 12
      result = weatherConditions.find(e => e.roll === '12');
    }
    
    setCurrentWeather(result || null);
  };

  return (
    <div className="text-center">
      <h2 className="text-2xl font-semibold text-amber-400 mb-3">Tabla de Clima</h2>
      <p className="text-slate-400 mb-6 max-w-md mx-auto">
        Durante la secuencia anterior al partido cada entrenador tira 1D6, se suman ambos resultados y se consulta la tabla. O simplemente... ¡pulsa el botón para un resultado aleatorio!
      </p>

      <button
        onClick={generateWeather}
        className="bg-amber-500 text-slate-900 font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-500/50 transform hover:scale-105 transition-all duration-200"
      >
        Generar Clima Aleatorio (2D6)
      </button>

      {currentWeather && lastRoll !== null && (
        <div className="mt-8 p-6 bg-slate-900/70 border border-slate-700 rounded-lg shadow-xl text-left animate-fade-in">
          <h3 className="text-xl font-bold text-amber-300 mb-2 flex items-center">
            <span className="bg-slate-700 text-amber-300 text-lg font-mono px-3 py-1 rounded-md mr-4">{lastRoll} ({currentWeather.roll})</span>
            <span>{currentWeather.title}</span>
          </h3>
          <p className="text-slate-300">{currentWeather.description}</p>
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

export default Weather;