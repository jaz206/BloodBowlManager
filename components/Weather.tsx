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
      <h2 className="text-3xl font-display font-black text-white italic uppercase tracking-tighter mb-4">Tabla de Clima</h2>
      <p className="text-[10px] font-display font-bold text-slate-500 uppercase tracking-[0.2em] mb-8 max-w-md mx-auto leading-relaxed border-b border-white/5 pb-4">
        Las condiciones atmosféricas en Nuffle's Peak pueden alterar drásticamente el flujo del partido.
      </p>

      <button
        onClick={generateWeather}
        className="group relative bg-premium-gold text-black font-display font-black uppercase tracking-widest text-xs py-5 px-12 rounded-xl transition-premium hover:scale-105 active:scale-95 shadow-2xl shadow-premium-gold/30 border border-white/20 overflow-hidden"
      >
        <span className="relative z-10">Generar Clima Aleatorio (2D6)</span>
        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
      </button>

      {currentWeather && lastRoll !== null && (
        <div className="mt-12 group">
          <div className="glass-panel p-8 border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] text-left animate-slide-in-up relative overflow-hidden bg-white/5">
            {/* Weather Icons (visual representation) */}
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none">
              {lastRoll >= 4 && lastRoll <= 10 ? (
                <svg className="w-32 h-32 text-premium-gold animate-spin-slow" fill="currentColor" viewBox="0 0 24 24"><path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.42 1.42c.39.39 1.02.39 1.41 0s.39-1.02 0-1.41L5.99 4.58zm12.02 12.02a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.42 1.42c.39.39 1.02.39 1.41 0s.39-1.02 0-1.41l-1.42-1.42zm-12.02 0l-1.42 1.42a.996.996 0 000 1.41.996.996 0 001.41 0l1.42-1.42c.39-.39.39-1.02 0-1.41s-1.02-.39-1.41 0zM18.01 4.58l-1.42 1.42c-.39.39-.39 1.02 0 1.41s1.02.39 1.41 0l1.42-1.42a.996.996 0 000-1.41.996.996 0 00-1.41 0z" /></svg>
              ) : (
                <svg className="w-32 h-32 text-sky-400 opacity-20" fill="currentColor" viewBox="0 0 24 24"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" /></svg>
              )}
            </div>

            <h3 className="text-3xl font-display font-black text-white italic uppercase tracking-tighter mb-4 flex items-center gap-6">
              <span className="bg-premium-gold text-black text-2xl not-italic font-black px-4 py-1.5 rounded-xl shadow-xl border border-white/20">{lastRoll}</span>
              <span>{currentWeather.title}</span>
            </h3>
            <p className="text-white font-medium italic opacity-80 leading-relaxed max-w-2xl border-l-4 border-premium-gold/50 pl-6">{currentWeather.description}</p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-in-up { animation: slide-in-up 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
        .animate-spin-slow { animation: spin 12s linear infinite; }
      `}</style>
    </div>
  );
};

export default Weather;