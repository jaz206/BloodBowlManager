import React from 'react';
import { useMatch } from '../../context/MatchContext';

const SequenceGuideModal: React.FC = () => {
    const {
        isSequenceGuideOpen,
        setIsSequenceGuideOpen
    } = useMatch();

    if (!isSequenceGuideOpen) return null;

    const onClose = () => setIsSequenceGuideOpen(false);

    return (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-[300] p-4" onClick={onClose}>
            <div className="glass-panel max-w-2xl w-full max-h-[85vh] border-premium-gold/30 bg-black/90 shadow-4xl flex flex-col overflow-hidden animate-slide-in-up" onClick={e => e.stopPropagation()}>
                <div className="p-8 border-b border-white/5 bg-premium-gold/5 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-display font-black text-white uppercase italic tracking-tighter">Códice de <span className="text-premium-gold">Batalla</span></h2>
                        <p className="text-[10px] font-display font-black text-premium-gold uppercase tracking-[0.4em] opacity-60">Secuencia Oficial BB Season 3 (2025)</p>
                    </div>
                    <button onClick={onClose} className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-blood-red/20 text-slate-500 hover:text-blood-red transition-all flex items-center justify-center border border-white/5">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                <div className="p-8 overflow-y-auto custom-scrollbar space-y-10">
                    <section className="relative pl-8 border-l-2 border-sky-500/30">
                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-sky-500 shadow-[0_0_10px_rgba(14,165,233,0.5)]"></div>
                        <h3 className="text-sky-400 font-display font-black uppercase tracking-widest text-sm mb-4">I. Preparación del Sacrificio</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { t: 'Hinchas', d: 'Lanza 1D3 + Hinchas Dedicados para determinar el Factor de Popularidad.' },
                                { t: 'El Clima', d: 'Lanza 2D6 para determinar las condiciones del campo.' },
                                { t: 'Jornaleros', d: 'Contrata líneas con Solitario (4+) hasta completar 11 guerreros.' },
                                { t: 'Incentivos', d: 'El equipo de menor valor recibe presupuesto para estrellas y sobornos.' }
                            ].map((item, i) => (
                                <div key={i} className="bg-white/5 p-4 rounded-xl border border-white/5">
                                    <p className="font-display font-bold text-white text-[11px] uppercase mb-1">{item.t}</p>
                                    <p className="text-[10px] text-slate-400 leading-relaxed italic">{item.d}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                    <section className="relative pl-8 border-l-2 border-blood-red/30">
                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blood-red shadow-[0_0_100px_rgba(239,68,68,0.5)]"></div>
                        <h3 className="text-blood-red font-display font-black uppercase tracking-widest text-sm mb-4">II. La Danza de la Sangre</h3>
                        <div className="space-y-4">
                            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                <p className="font-display font-bold text-white text-[11px] uppercase mb-2">Entrada (Drive)</p>
                                <p className="text-[10px] text-slate-400 leading-relaxed italic">Despliegue &rarr; Patada Inicial &rarr; Evento (2D6) &rarr; Aterrizaje del balón.</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-[10px] font-display font-black text-slate-500">
                                <div className="border border-white/5 p-3 rounded-lg text-center uppercase tracking-widest">Blitz (1/Turno)</div>
                                <div className="border border-white/5 p-3 rounded-lg text-center uppercase tracking-widest">Pase (1/Turno)</div>
                                <div className="border border-white/5 p-3 rounded-lg text-center uppercase tracking-widest">Falta (1/Turno)</div>
                                <div className="border border-white/5 p-3 rounded-lg text-center uppercase tracking-widest">Hand-off (1/Turno)</div>
                            </div>
                        </div>
                    </section>
                    <section className="relative pl-8 border-l-2 border-premium-gold/30">
                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-premium-gold shadow-[0_0_10px_rgba(245,159,10,0.5)]"></div>
                        <h3 className="text-premium-gold font-display font-black uppercase tracking-widest text-sm mb-4">III. El Peso de la Experiencia</h3>
                        <div className="bg-black/40 rounded-2xl border border-premium-gold/10 overflow-hidden">
                            <table className="w-full text-left text-[10px]">
                                <thead className="bg-premium-gold/10 text-premium-gold font-black uppercase tracking-widest">
                                    <tr>
                                        <th className="p-3">Hazaña</th>
                                        <th className="p-3 text-right">Puntos (PE)</th>
                                    </tr>
                                </thead>
                                <tbody className="text-slate-300 divide-y divide-white/5">
                                    {[
                                        { a: 'Pase Completado', p: '+1' },
                                        { a: 'Lanzar Compañero (Superb)', p: '+1' },
                                        { a: 'Desviar Pase', p: '+1' },
                                        { a: 'Intercepción', p: '+2' },
                                        { a: 'Baja (Placaje)', p: '+2' },
                                        { a: 'Touchdown', p: '+3' },
                                        { a: 'Jugador Más Valioso (MVP)', p: '+4' }
                                    ].map((r, i) => (
                                        <tr key={i} className="hover:bg-white/5 transition-colors">
                                            <td className="p-3 italic">{r.a}</td>
                                            <td className="p-3 text-right font-black text-premium-gold">{r.p}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                    <section className="relative pl-8 border-l-2 border-green-500/30">
                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                        <h3 className="text-green-500 font-display font-black uppercase tracking-widest text-sm mb-4">IV. El Cierre de la Jornada</h3>
                        <div className="bg-white/5 p-5 rounded-2xl border border-white/5 space-y-4">
                            <div className="flex justify-between items-center text-[11px]">
                                <span className="text-white font-display font-bold uppercase">Actualizar Hinchas</span>
                                <span className="text-slate-500 italic">Victoria: 1D6 ≥ Fans / Derrota: 1D6 &lt; Fans</span>
                            </div>
                            <div className="flex justify-between items-center text-[11px]">
                                <span className="text-white font-display font-bold uppercase">Recaudación</span>
                                <span className="text-slate-500 italic">(Popularidad/2 + TDs + FairPlay) * 10k</span>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default SequenceGuideModal;
