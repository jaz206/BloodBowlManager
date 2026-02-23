
import React, { useState } from 'react';
import { skillCategories } from '../data/skillCategories';
import { advancementCosts, valuationIncreases, costlyErrors, errorDefinitions } from '../data/managementTables';
import { weatherConditions } from '../data/weather';
import { kickoffEvents } from '../data/kickoffEvents';
import { casualtyResults } from '../data/casualties';
import { stuntyInjuryResults } from '../data/stuntyInjuries';
import { lastingInjuryResults } from '../data/lastingInjuries';
import { prayersData } from '../data/prayers';

type CheatSection = 'game' | 'management' | 'skills' | 'injuries';

const CheatSheet: React.FC = () => {
    const [activeSection, setActiveSection] = useState<CheatSection>('game');

    const sections = [
        { id: 'game', label: 'Tablas de Juego' },
        { id: 'management', label: 'Gestión y TV' },
        { id: 'skills', label: 'Habilidades D66' },
        { id: 'injuries', label: 'Bajas y Reglas' }
    ];

    return (
        <div className="bg-slate-900/50 rounded-xl border border-white/10 overflow-hidden">
            {/* Navigation */}
            <div className="flex bg-black/40 border-b border-white/5 overflow-x-auto thin-scrollbar">
                {sections.map(s => (
                    <button
                        key={s.id}
                        onClick={() => setActiveSection(s.id as CheatSection)}
                        className={`flex-1 min-w-[120px] py-4 px-2 text-xs uppercase tracking-tighter font-bold transition-all ${activeSection === s.id ? 'text-premium-gold bg-white/5 border-b-2 border-premium-gold' : 'text-slate-500 hover:text-slate-300'
                            }`}
                    >
                        {s.label}
                    </button>
                ))}
            </div>

            <div className="p-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                {activeSection === 'game' && <GameTables />}
                {activeSection === 'management' && <ManagementTables />}
                {activeSection === 'skills' && <SkillsTable />}
                {activeSection === 'injuries' && <InjuriesAndRules />}
            </div>
        </div>
    );
};

const GameTables = () => (
    <div className="space-y-8 animate-fade-in">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section className="bg-slate-800/20 p-4 rounded-xl border border-white/5">
                <h3 className="text-premium-gold font-display uppercase tracking-widest text-xs mb-4 border-b border-premium-gold/30 pb-1">Secuencia Anterior al Partido</h3>
                <ol className="list-decimal list-inside text-xs text-slate-300 space-y-1 ml-2">
                    <li>Factor de Hinchas</li>
                    <li>El Clima</li>
                    <li>Contratar Sustitutos</li>
                    <li>Incentivos</li>
                    <li>Determinar Equipo Pateador</li>
                    <li>Equipo Pateador se acomoda primero</li>
                    <li>Patada Inicial</li>
                    <li>Evento de Patada</li>
                </ol>
            </section>
            <section className="bg-slate-800/20 p-4 rounded-xl border border-white/5">
                <h3 className="text-premium-gold font-display uppercase tracking-widest text-xs mb-4 border-b border-premium-gold/30 pb-1">Secuencia Posterior al Partido</h3>
                <ol className="list-decimal list-inside text-xs text-slate-300 space-y-1 ml-2">
                    <li>Resultado y Ganancias</li>
                    <li>Actualizar Hinchas</li>
                    <li>Progreso de Jugadores</li>
                    <li>Fichar, Despedir o Retirar Jugadores</li>
                    <li>Errores Costosos</li>
                    <li>Actualizar Tabla de Equipo</li>
                </ol>
            </section>
        </div>

        <section>
            <h3 className="text-premium-gold font-display uppercase tracking-widest text-sm mb-4 border-b border-premium-gold/30 pb-1">Tablas de Clima (2D6)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {weatherConditions.map(w => (
                    <div key={w.roll} className="bg-slate-800/40 p-3 rounded-lg border border-white/5">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-premium-gold font-bold">{w.title}</span>
                            <span className="bg-slate-700 px-2 py-0.5 rounded text-xs font-mono">{w.roll}</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">{w.description}</p>
                    </div>
                ))}
            </div>
        </section>

        <section>
            <h3 className="text-premium-gold font-display uppercase tracking-widest text-sm mb-4 border-b border-premium-gold/30 pb-1">Eventos de Patada Inicial (2D6)</h3>
            <div className="space-y-3">
                {kickoffEvents.map(e => (
                    <div key={e.diceRoll} className="bg-slate-800/40 p-3 rounded-lg border border-white/5 flex gap-4">
                        <div className="flex-shrink-0 bg-slate-700 w-10 h-10 flex items-center justify-center rounded-lg text-premium-gold font-bold shadow-inner">
                            {e.diceRoll}
                        </div>
                        <div>
                            <h4 className="text-slate-200 font-bold text-sm mb-1 uppercase">{e.title}</h4>
                            <p className="text-xs text-slate-400 leading-relaxed">{e.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    </div>
);

const ManagementTables = () => (
    <div className="space-y-8 animate-fade-in">
        <section>
            <h3 className="text-premium-gold font-display uppercase tracking-widest text-sm mb-4 border-b border-premium-gold/30 pb-1">Tabla de Mejoras (Pág. 97)</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                    <thead>
                        <tr className="bg-black/40 text-slate-300">
                            <th className="p-2 border border-white/5 uppercase tracking-tighter">Nivel</th>
                            <th className="p-2 border border-white/5 text-center">Random Prima.</th>
                            <th className="p-2 border border-white/5 text-center">Elegida Prima.</th>
                            <th className="p-2 border border-white/5 text-center">Elegida Secun.</th>
                            <th className="p-2 border border-white/5 text-center">Atributo</th>
                        </tr>
                    </thead>
                    <tbody>
                        {advancementCosts.map((a, i) => (
                            <tr key={i} className="hover:bg-white/5 transition-colors">
                                <td className="p-2 border border-white/5 text-premium-gold font-semibold">{a.level}</td>
                                <td className="p-2 border border-white/5 text-center text-slate-300">{a.randomPrimary} PE</td>
                                <td className="p-2 border border-white/5 text-center text-slate-300">{a.chosenPrimary} PE</td>
                                <td className="p-2 border border-white/5 text-center text-slate-300">{a.chosenSecondary} PE</td>
                                <td className="p-2 border border-white/5 text-center text-slate-300">{a.attribute} PE</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <section>
                <h3 className="text-premium-gold font-display uppercase tracking-widest text-sm mb-4 border-b border-premium-gold/30 pb-1">Aumento de Valoración (TV)</h3>
                <div className="bg-slate-800/40 rounded-lg overflow-hidden border border-white/5">
                    {valuationIncreases.map((v, i) => (
                        <div key={i} className="flex justify-between p-2 border-b border-white/5 text-xs">
                            <span className="text-slate-400">{v.item}</span>
                            <span className="text-premium-gold font-bold">{v.value}</span>
                        </div>
                    ))}
                </div>
            </section>

            <section>
                <h3 className="text-premium-gold font-display uppercase tracking-widest text-sm mb-4 border-b border-premium-gold/30 pb-1">Errores Costosos</h3>
                <div className="space-y-4">
                    {costlyErrors.map((e, i) => (
                        <div key={i} className="bg-slate-800/40 p-2 rounded-lg border border-white/5 text-xs">
                            <div className="text-premium-gold font-bold mb-1">{e.range}</div>
                            <div className="text-slate-300">{e.common}</div>
                            <div className="text-slate-500 italic">{e.safe}</div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    </div>
);

const SkillsTable = () => (
    <div className="space-y-6 animate-fade-in">
        <div className="bg-slate-800/20 p-3 rounded-lg border border-premium-gold/20 mb-4">
            <p className="text-[10px] text-slate-400 leading-tight">
                <span className="text-premium-gold font-bold">REGLA 2D6:</span> Lanza 2D6 dos veces y elige la habilidad que prefieras (dentro de la misma categoría). Si se repite, se asigna directamente.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {skillCategories.map(cat => (
                <div key={cat.category} className="bg-slate-800/40 rounded-lg overflow-hidden border border-white/10">
                    <div className="bg-black/40 p-2 border-b border-premium-gold/30 text-center">
                        <span className="text-premium-gold font-display uppercase tracking-widest text-[10px] font-bold">{cat.category}</span>
                    </div>
                    <div className="p-2 space-y-1">
                        {cat.skills.map(s => (
                            <div key={s.roll} className="flex justify-between items-center text-[10px] py-1 px-1.5 hover:bg-white/5 rounded group">
                                <span className="text-slate-500 font-mono group-hover:text-premium-gold">{s.roll}</span>
                                <span className="text-slate-300 font-semibold">{s.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const InjuriesAndRules = () => (
    <div className="space-y-10 animate-fade-in">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <section>
                <h3 className="text-premium-gold font-display uppercase tracking-widest text-sm mb-4 border-b border-premium-gold/30 pb-1">Tablas de Lesiones</h3>
                <div className="space-y-6">
                    <div>
                        <h4 className="text-slate-200 text-xs font-bold mb-2 uppercase tracking-tighter">Estándar (1D16)</h4>
                        <div className="space-y-1">
                            {casualtyResults.map(c => (
                                <div key={c.diceRoll} className="flex gap-3 text-[10px] p-1.5 bg-slate-800/30 rounded border border-white/5">
                                    <span className="w-8 flex-shrink-0 text-premium-gold font-bold">{c.diceRoll}</span>
                                    <div>
                                        <span className="font-bold text-slate-200">{c.title}</span>
                                        <p className="text-slate-500 leading-tight">{c.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-slate-200 text-xs font-bold mb-2 uppercase tracking-tighter text-blue-400">Escurridizos (2D6)</h4>
                        <div className="space-y-1">
                            {stuntyInjuryResults.map(s => (
                                <div key={s.diceRoll} className="flex gap-3 text-[10px] p-1.5 bg-blue-900/10 rounded border border-blue-900/20">
                                    <span className="w-8 flex-shrink-0 text-blue-400 font-bold">{s.diceRoll}</span>
                                    <div>
                                        <span className="font-bold text-slate-200">{s.title}</span>
                                        <p className="text-slate-500 leading-tight">{s.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="space-y-8">
                <div>
                    <h3 className="text-premium-gold font-display uppercase tracking-widest text-sm mb-4 border-b border-premium-gold/30 pb-1">Heridas de Atributo (1D6)</h3>
                    <div className="space-y-1">
                        {lastingInjuryResults.map(l => (
                            <div key={l.diceRoll} className="flex justify-between items-center text-[10px] p-2 bg-slate-800/30 rounded border border-white/5">
                                <span className="text-premium-gold font-bold w-6">{l.diceRoll}</span>
                                <span className="text-slate-200 flex-1">{l.permanentInjury}</span>
                                <span className="text-red-400 font-bold">{l.characteristicReduction}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-black/40 p-4 rounded-xl border border-red-900/30 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-100 transition-opacity">
                        <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" /></svg>
                    </div>
                    <h3 className="text-red-400 font-display uppercase tracking-widest text-xs mb-2">Retener el Balón (Pág. 80)</h3>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                        Si un jugador con el balón puede llegar a la línea de anotación sin lanzar ningún dado y NO lo hace, el entrenador debe tirar 1D6.
                        Si el resultado es <span className="text-red-300 font-bold">≥ al turno actual</span> del equipo, el jugador es <span className="text-red-300">DERRIBADO</span> y deja caer el balón. ¡Turnover!
                    </p>
                </div>
            </section>
        </div>

        <section className="bg-premium-gold/5 p-4 rounded-xl border border-premium-gold/20">
            <h3 className="text-premium-gold font-display uppercase tracking-widest text-sm mb-4">Intercepción y Pase (Pág. 48-71)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-[10px]">
                <div className="space-y-2">
                    <h4 className="border-b border-premium-gold/20 pb-1 text-slate-400 uppercase">Tipos de Pase</h4>
                    <p><span className="text-green-400 font-bold">Preciso (+0):</span> Supera la tirada.</p>
                    <p><span className="text-yellow-500 font-bold">Impreciso (-1):</span> Falla por poco, el balón se escora (3) desde el objetivo.</p>
                    <p><span className="text-orange-500 font-bold">Wildly Inaccurate (-2):</span> Falla más, se escora (3) desde el lanzador.</p>
                    <p><span className="text-red-500 font-bold">Perdido / Fumble (-3):</span> 1 Natural o resultado final ≤ 0. El balón rebota 1D8 desde el lanzador. Turnover.</p>
                </div>
                <div className="space-y-2">
                    <h4 className="border-b border-premium-gold/20 pb-1 text-slate-400 uppercase">Interceptar</h4>
                    <p>Interferir Pase Preciso: <span className="text-red-400">-3</span></p>
                    <p>Interferir Pase Impreciso: <span className="text-red-400">-2</span></p>
                    <p><span className="text-slate-500 italic">Modificadores: -1 por cada jugador marcando al interceptor. Si lo logra: 2PE y Turnover.</span></p>
                </div>
                <div className="space-y-2">
                    <h4 className="border-b border-premium-gold/20 pb-1 text-slate-400 uppercase">Lanzar Compañero</h4>
                    <p>Lanzamiento Rápido: <span className="text-green-400">Sin modificador</span></p>
                    <p>Lanzamiento Corto: <span className="text-red-400">-1</span></p>
                    <p><span className="text-slate-500">Aterrizar: Sin modificador (Soberbio) o -1 (Mediocre/Pifa). +1 PE si anota lanzada.</span></p>
                </div>
            </div>
        </section>

        <section>
            <h3 className="text-premium-gold font-display uppercase tracking-widest text-sm mb-4 border-b border-premium-gold/30 pb-1">Tabla de Nuffle (Pág. 143)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                {prayersData.map(p => (
                    <div key={p.diceRoll} className="flex gap-3 text-[10px] p-2 bg-slate-800/20 rounded border border-white/5 items-start">
                        <span className="bg-slate-700 w-6 h-6 flex items-center justify-center rounded text-premium-gold font-bold flex-shrink-0">{p.diceRoll}</span>
                        <div>
                            <span className="font-bold text-slate-200 block mb-0.5">{p.title}</span>
                            <p className="text-slate-400 leading-tight">{p.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    </div>
);

export default CheatSheet;
