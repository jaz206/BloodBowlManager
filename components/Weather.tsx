import React, { useState } from 'react';
import { weatherConditions } from '../data/weather';
import type { WeatherCondition } from '../types';

const Weather: React.FC = () => {
  const [currentWeather, setCurrentWeather] = useState<WeatherCondition | null>(null);

  const generateWeather = () => {
    const randomIndex = Math.floor(Math.random() * weatherConditions.length);
    setCurrentWeather(weatherConditions[randomIndex]);
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
        Generar Clima Aleatorio
      </button>

      {currentWeather && (
        <div className="mt-8 p-6 bg-slate-900/70 border border-slate-700 rounded-lg shadow-xl text-left animate-fade-in">
          <h3 className="text-xl font-bold text-amber-300 mb-2">{currentWeather.title}</h3>
          <p className="text-slate-300">{currentWeather.description}</p>
        </div>
      )}

      {/* Fix: Removed invalid `jsx` prop from the `<style>` tag. */}
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