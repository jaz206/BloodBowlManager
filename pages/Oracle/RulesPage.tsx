import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';

const KICKOFF_EVENTS = [
    { roll: '2', name: 'Árbitro Intimidado', desc: 'Cada equipo recibe un Incentivo de Soborno gratuito que debe usarse antes del final del partido.' },
    { roll: '3', name: 'Tiempo Muerto', desc: 'Si el equipo pateador está en su turno 6, 7 u 8, ambos equipos retroceden un espacio en el marcador de turnos; de lo contrario, ambos avanzan un espacio.' },
    { roll: '4', name: 'Defensa Sólida', desc: 'El entrenador pateador puede elegir 1D3+3 jugadores desmarcados para retirarlos y volver a desplegarlos cumpliendo las reglas normales.' },
    { roll: '5', name: 'Patada Alta', desc: 'Un jugador desmarcado del equipo receptor puede colocarse inmediatamente en la casilla donde caerá el balón.' },
    { roll: '6', name: 'Los Hinchas Animan', desc: 'Se hace una tirada enfrentada (1D6 + Animadoras). El ganador recibe un apoyo ofensivo adicional en el primer placaje de su siguiente turno.' },
    { roll: '7', name: 'Entrenador Brillante', desc: 'Tirada enfrentada (1D6 + Ayudantes). El ganador recibe una Segunda Oportunidad gratuita válida solo para esa entrada.' },
    { roll: '8', name: 'Clima Cambiante', desc: 'Se tira de nuevo en la tabla de Clima. Si sale "Clima Agradable", el balón rebota una vez antes de caer.' },
    { roll: '9', name: '¡Corre, Muchacho, Corre!', desc: 'Cualquier jugador de ambos equipos que no esté en una zona de defensa de un rival puede moverse una casilla inmediatamente.' },
    { roll: '10', name: '¡A la Carga!', desc: 'El equipo pateador puede realizar un turno adicional inmediatamente, pero solo puede mover o placar con D3+3 jugadores.' },
    { roll: '11', name: 'Disturbios', desc: 'El tiempo se detiene. Tira 1D6. Con un 1-3, ambos marcadores de turno retroceden una casilla. Con 4-6, ambos avanzan.' },
    { roll: '12', name: 'Invasión de Campo', desc: 'Ambos entrenadores tiran 1D6 + Factor de Hinchas. El que saque menos ve cómo sus jugadores en el campo son aturdidos por los hinchas rivales.' }
];

const WEATHER_TABLE = [
    { roll: '2', name: 'Calor Asfixiante', desc: 'Al final de cada entrada, tira 1D6 por cada jugador en el campo. Con un 1, el jugador se desmaya y debe ir al banquillo de Reservas.' },
    { roll: '3', name: 'Soleado', desc: 'El sol brilla intensamente. Todas las tiradas de Pase tienen un penalizador de -1 debido al deslumbramiento.' },
    { roll: '4-10', name: 'Clima Agradable', desc: 'Condiciones perfectas para jugar al Blood Bowl.' },
    { roll: '11', name: 'Lluvia', desc: 'El balón se vuelve resbaladizo. Todas las tiradas para Recoger el balón tienen un penalizador de -1.' },
    { roll: '12', name: 'Ventisca', desc: 'La visibilidad es nula. Solo se pueden realizar Pases Rápidos o Cortos, y las tiradas de "A por ellos" (GFI) fallan con un 1-2.' }
];

const RulesPage: React.FC = () => {
    const { language } = useLanguage();
    const [activeSection, setActiveSection] = useState<'pre' | 'kick' | 'post' | 'weather'>('pre');

    const sections = [
        { id: 'pre', label: 'Pre-Partido', icon: 'history' },
        { id: 'kick', label: 'Patada Inicial', icon: 'sports_soccer' },
        { id: 'weather', label: 'El Clima', icon: 'cloud' },
        { id: 'post', label: 'Post-Partido', icon: 'description' }
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <header className="text-center md:text-left">
                <h2 className="text-4xl md:text-6xl font-black text-slate-100 italic uppercase italic tracking-tighter">
                    Manual de <span className="text-primary">Campo</span>
                </h2>
                <p className="text-slate-400 text-sm mt-4 max-w-2xl font-medium italic border-l-4 border-primary/20 pl-6">
                    Reglas oficiales de la Tercera Temporada (BB2025). Todo lo que necesitas saber antes, durante y después del caos en el emparrillado.
                </p>
            </header>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-2 p-1 bg-surface-dark/50 rounded-2xl border border-white/5 sticky top-4 z-40 backdrop-blur-md">
                {sections.map(s => (
                    <button
                        key={s.id}
                        onClick={() => setActiveSection(s.id as any)}
                        className={`flex-1 min-w-[120px] flex items-center justify-center gap-3 py-3 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                            activeSection === s.id 
                                ? 'bg-primary text-black shadow-lg shadow-primary/20 scale-105' 
                                : 'text-slate-500 hover:text-slate-100 hover:bg-white/5'
                        }`}
                    >
                        <span className="material-symbols-outlined text-sm">{s.icon}</span>
                        {s.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <AnimatePresence mode="wait">
                {activeSection === 'pre' && (
                    <motion.div
                        key="pre"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                        {[
                            { step: 1, title: 'DETERMINAR FACTOR DE HINCHAS', desc: 'Cada entrenador tira 1D3 y suma los aficionados ocasionales de su hoja de plantilla.', effect: 'Crucial para Invasión de Campo y ganancias finales.' },
                            { step: 2, title: 'DETERMINAR EL CLIMA', desc: 'Ambos tiran 2D6 y consultan la tabla de clima.', effect: 'Afecta movimiento, pases y manejo de balón.' },
                            { step: 3, title: 'CONSEGUIR INCENTIVOS', desc: 'El equipo con menos TV recibe presupuesto igual a la diferencia.', effect: 'Úsalo en Jugadores Estrella, Sobornos, Médicos, etc.' },
                            { step: 4, title: 'REZOS A NUFFLE', desc: 'Si tras incentivos sigue habiendo diferencia, el equipo inferior tira en la tabla de Rezos.', effect: 'Efectos aleatorios beneficiosos para el "underdog".' },
                            { step: 5, title: 'EL LANZAMIENTO DE MONEDA', desc: 'Tirada enfrentada de 1D6. El ganador elige Patear o Recibir.', effect: 'Define la estrategia de la primera parte.' }
                        ].map(item => (
                            <div key={item.step} className="bg-surface-dark border border-white/5 rounded-2xl p-6 group hover:border-primary/40 transition-all shadow-xl">
                                <span className="text-primary font-black text-[10px] uppercase tracking-widest mb-2 block italic opacity-50">Paso {item.step}</span>
                                <h3 className="text-white font-black text-lg uppercase tracking-tight italic mb-3 group-hover:text-primary transition-colors">{item.title}</h3>
                                <p className="text-slate-400 text-xs leading-relaxed mb-4 italic">{item.desc}</p>
                                <div className="p-3 bg-black/40 rounded-xl border border-primary/10">
                                    <p className="text-[10px] text-accent-gold font-bold uppercase tracking-widest leading-tight">{item.effect}</p>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                )}

                {activeSection === 'kick' && (
                    <motion.div
                        key="kick"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-surface-dark rounded-3xl border border-white/5 overflow-hidden shadow-2xl"
                    >
                        <table className="w-full text-left">
                            <thead className="bg-white/5 text-slate-500 text-[10px] uppercase tracking-[0.3em]">
                                <tr>
                                    <th className="py-6 px-8 font-black w-24">2D6</th>
                                    <th className="py-6 px-8 font-black">Evento</th>
                                    <th className="py-6 px-8 font-black">Efecto del Caos</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {KICKOFF_EVENTS.map(ev => (
                                    <tr key={ev.roll} className="hover:bg-primary/5 transition-colors group">
                                        <td className="py-5 px-8">
                                            <div className="w-10 h-10 rounded-xl bg-black/40 border border-primary/20 flex items-center justify-center text-primary font-black text-lg shadow-inner group-hover:bg-primary group-hover:text-black transition-all">
                                                {ev.roll}
                                            </div>
                                        </td>
                                        <td className="py-5 px-8">
                                            <h4 className="text-white font-black uppercase text-sm italic group-hover:text-primary transition-colors">{ev.name}</h4>
                                        </td>
                                        <td className="py-5 px-8">
                                            <p className="text-slate-400 text-xs italic leading-relaxed">{ev.desc}</p>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </motion.div>
                )}

                {activeSection === 'weather' && (
                    <motion.div
                        key="weather"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-4"
                    >
                        {WEATHER_TABLE.map(w => (
                            <div key={w.roll} className="flex gap-6 bg-surface-dark p-6 rounded-2xl border border-white/5 hover:border-primary/20 transition-all shadow-xl group">
                                <div className="w-16 h-16 rounded-2xl bg-black/40 border border-white/10 flex flex-col items-center justify-center shrink-0 shadow-inner group-hover:bg-primary transition-all">
                                    <span className="text-[10px] text-slate-500 group-hover:text-black font-black uppercase tracking-widest">{w.roll === '4-10' ? 'ROLL' : '2D6'}</span>
                                    <span className="text-2xl font-black text-white group-hover:text-black italic">{w.roll}</span>
                                </div>
                                <div>
                                    <h3 className="text-white font-black uppercase italic tracking-tight text-xl mb-1 group-hover:text-primary transition-colors">{w.name}</h3>
                                    <p className="text-slate-400 text-xs italic leading-relaxed">{w.desc}</p>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                )}

                {activeSection === 'post' && (
                    <motion.div
                        key="post"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-8"
                    >
                        <div className="bg-gradient-to-r from-primary/20 to-transparent p-8 rounded-3xl border border-primary/10">
                            <h3 className="text-premium-gold font-black uppercase italic tracking-widest text-lg mb-4 flex items-center gap-3">
                                <span className="material-symbols-outlined">payments</span>
                                GESTIÓN ECONÓMICA
                            </h3>
                            <div className="bg-black/60 p-6 rounded-2xl border border-white/5 shadow-inner">
                                <p className="text-xs text-slate-300 mb-4 font-medium italic">Calcula tus ganancias tras el pitido final:</p>
                                <div className="text-3xl font-black text-white tracking-tighter italic mb-4">
                                    (Afluencia / 2) + TDs + 1*
                                </div>
                                <p className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">*Bono si no retuviste el balón. Multiplica el total por 10,000 monedas de oro.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { title: 'DETERMINAR MVP', icon: 'military_tech', desc: 'Elige un jugador (o tira aleatoriamente) para recibir 4 PE adicionales.' },
                                { title: 'EXPENSIVOS ERRORES', icon: 'money_off', desc: 'Si tienes más de 100k en el banco, corres riesgo de que desaparezca parte de la tesorería.' },
                                { title: 'ACTUALIZAR HINCHAS', icon: 'trending_up', desc: 'Tira 2D6 + Factores. Si superas tu Hinchada actual, ganas +1. Si fallas por mucho, pierdes popularidad.' }
                            ].map(card => (
                                <div key={card.title} className="bg-surface-dark p-6 rounded-2xl border border-white/5 flex flex-col items-center text-center group hover:border-primary/40 transition-all">
                                    <div className="size-14 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-all">
                                        <span className="material-symbols-outlined text-3xl">{card.icon}</span>
                                    </div>
                                    <h4 className="text-white font-black uppercase italic text-xs mb-3 tracking-widest group-hover:text-primary transition-colors">{card.title}</h4>
                                    <p className="text-slate-500 text-[10px] font-medium leading-relaxed italic">{card.desc}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            
            <footer className="pt-10 pb-20 border-t border-white/5 text-center">
                <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.3em] italic">
                    Blood Bowl Manager - Datos Sincronizados con Season 3 (BB2025)
                </p>
            </footer>
        </div>
    );
};

export default RulesPage;
