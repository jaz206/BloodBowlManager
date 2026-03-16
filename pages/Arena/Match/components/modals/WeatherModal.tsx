import React from 'react';
import { useMatch } from '../../context/MatchContext';

const WeatherModal: React.FC = () => {
    const {
        isWeatherModalOpen,
        setIsWeatherModalOpen,
        isChangingWeatherModalOpen,
        setIsChangingWeatherModalOpen,
        weatherRerollInput,
        setWeatherRerollInput,
        handleGenerateWeather,
        handleConfirmWeatherReroll
    } = useMatch();

    if (!isWeatherModalOpen && !isChangingWeatherModalOpen) return null;

    if (isWeatherModalOpen) {
        return (
            <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[300] p-4" onClick={() => setIsWeatherModalOpen(false)}>
                <div className="glass-panel p-8 max-w-sm w-full text-center border-premium-gold/30 bg-black shadow-[0_0_50px_rgba(0,0,0,1)]" onClick={e => e.stopPropagation()}>
                    <div className="w-20 h-20 bg-premium-gold/10 rounded-full flex items-center justify-center border border-premium-gold/20 mx-auto mb-6">
                        <span className="material-symbols-outlined text-premium-gold text-4xl animate-premium-pulse">cyclone</span>
                    </div>
                    <h3 className="text-2xl font-display font-black text-white uppercase italic tracking-tighter mb-2">Clima de <span className="text-premium-gold">Nuffle</span></h3>
                    <p className="text-slate-400 text-sm mb-8">El destino del campo pende de un hilo. Lanza los dados para invocar las fuerzas de la naturaleza.</p>
                    <button onClick={handleGenerateWeather} className="w-full bg-premium-gold text-black font-display font-black py-4 px-6 rounded-2xl shadow-2xl hover:bg-premium-light transition-all active:scale-95 uppercase tracking-widest italic text-sm">
                        Invocar (2D6)
                    </button>
                </div>
            </div>
        );
    }

    if (isChangingWeatherModalOpen) {
        return (
            <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[300] p-4" onClick={() => setIsChangingWeatherModalOpen(false)}>
                <div className="glass-panel p-8 max-w-sm w-full text-center border-blood-red/30 bg-black shadow-[0_0_50px_rgba(0,0,0,1)]" onClick={e => e.stopPropagation()}>
                    <div className="w-20 h-20 bg-blood-red/10 rounded-full flex items-center justify-center border border-blood-red/20 mx-auto mb-6">
                        <span className="material-symbols-outlined text-blood-red text-4xl animate-pulse">air</span>
                    </div>
                    <h3 className="text-2xl font-display font-black text-white uppercase italic tracking-tighter mb-2">¡Vientos de <span className="text-blood-red">Cambio</span>!</h3>
                    <p className="text-slate-400 text-sm mb-6">El clima está mutando. Introduce el nuevo resultado del destino.</p>
                    <input 
                        type="text" 
                        pattern="([2-9]|1[0-2])" 
                        value={weatherRerollInput} 
                        onChange={e => setWeatherRerollInput(e.target.value.replace(/[^0-9]/g, '').slice(0, 2))} 
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-2xl text-white font-display text-center mb-6 focus:border-premium-gold outline-none transition-all" 
                        placeholder="2-12" 
                        autoFocus 
                    />
                    <button onClick={handleConfirmWeatherReroll} className="w-full bg-blood-red text-white font-display font-black py-4 px-6 rounded-2xl shadow-2xl hover:bg-red-600 transition-all active:scale-95 uppercase tracking-widest italic text-sm">
                        Confirmar Cambio
                    </button>
                </div>
            </div>
        );
    }

    return null;
};

export default WeatherModal;
