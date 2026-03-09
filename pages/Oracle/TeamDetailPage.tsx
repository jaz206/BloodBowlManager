import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Team } from '../../types';
import RadarChart from '../../components/oracle/RadarChart';
import RadarChartModal from '../../components/oracle/RadarChartModal';
import SkillBadge from '../../components/shared/SkillBadge';
import SkillModal from '../../components/oracle/SkillModal';
import { useLanguage } from '../../contexts/LanguageContext';
import type { Skill } from '../../types';

interface TeamDetailPageProps {
    team: Team;
    onBack: () => void;
    onRequestTeamCreation?: (name: string) => void;
}

const TeamDetailPage: React.FC<TeamDetailPageProps> = ({ team, onBack, onRequestTeamCreation }) => {
    const { language } = useLanguage();
    const [isRadarModalOpen, setIsRadarModalOpen] = useState(false);
    const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
    const [isFullscreenImage, setIsFullscreenImage] = useState(false);

    const currentSpecialRules = language === 'es' ? (team.specialRules_es || team.specialRules) : (team.specialRules_en || team.specialRules);

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="min-h-screen bg-background-dark text-slate-100 font-display p-4 md:p-0"
        >
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-accent-gold text-xs font-bold uppercase tracking-widest mb-8">
                <button onClick={onBack} className="hover:text-primary transition-colors">Enciclopedia</button>
                <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                <span className="text-slate-100 italic">{team.name}</span>
            </nav>

            {/* Hero Section */}
            <section className="flex flex-col md:flex-row gap-8 items-start mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
                <div
                    onClick={() => team.image && setIsFullscreenImage(true)}
                    className="w-48 h-48 md:w-64 md:h-64 bg-surface-dark rounded-3xl border-2 border-primary/20 p-6 flex items-center justify-center relative overflow-hidden group shadow-[0_20px_60px_rgba(0,0,0,0.5)] cursor-pointer"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent group-hover:from-primary/20 transition-all duration-700"></div>
                    {team.image ? (
                        <img src={team.image} alt={team.name} className="relative z-10 w-full h-full object-contain group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                        <span className="material-symbols-outlined text-primary text-8xl relative z-10 opacity-30">groups</span>
                    )}
                    {team.image && (
                        <div className="absolute inset-0 z-20 bg-primary/0 group-hover:bg-primary/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <span className="material-symbols-outlined text-white text-3xl drop-shadow-[0_0_10px_rgba(0,0,0,1)]">zoom_in</span>
                        </div>
                    )}
                </div>
                <div className="flex-1 space-y-6">
                    <div className="flex items-center gap-4">
                        <span className="px-3 py-1.5 bg-primary text-black font-black text-xs rounded uppercase tracking-tighter shadow-lg shadow-primary/20">Tier {team.tier}</span>
                        <h1 className="text-4xl md:text-7xl font-black text-slate-100 tracking-tighter uppercase italic drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                            {team.name}
                        </h1>
                    </div>
                    <p className="text-accent-gold text-lg max-w-2xl leading-relaxed italic border-l-2 border-primary/40 pl-6">
                        {currentSpecialRules || (language === 'es' ? "Una facción legendaria lista para la gloria en el césped de Blood Bowl." : "A legendary faction ready for glory on the pitch.")}
                    </p>
                    <div className="flex gap-8 pt-2">
                        <div className="flex flex-col border-l-2 border-primary pl-4 bg-primary/5 pr-6 py-2 rounded-r-xl">
                            <span className="text-[10px] text-accent-gold uppercase font-black tracking-widest leading-none mb-1 opacity-70">Estilo de Juego</span>
                            <span className="text-slate-100 font-bold italic">
                                {team.tier === 1 ? 'Competitivo / Control' : team.tier === 2 ? 'Equilibrado / Bash' : 'Desafío / Caos'}
                            </span>
                        </div>
                        <div className="flex flex-col border-l-2 border-primary pl-4 bg-primary/5 pr-6 py-2 rounded-r-xl">
                            <span className="text-[10px] text-accent-gold uppercase font-black tracking-widest leading-none mb-1 opacity-70">Dificultad</span>
                            <span className="text-slate-100 font-bold italic">
                                {team.tier === 1 ? 'Principiante' : team.tier === 2 ? 'Intermedio' : 'Experto'}
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Stats & Radar */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-surface-dark rounded-2xl border border-white/5 p-8 flex flex-col items-center shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
                        <h3 className="text-slate-400 font-black uppercase tracking-[0.3em] text-[9px] mb-8 text-center italic">Atributos Promedio</h3>

                        <div className="relative w-72 h-72 mb-8 cursor-pointer hover:scale-105 transition-all duration-700 bg-black/40 rounded-full border border-white/5 p-8 shadow-inner" onClick={() => setIsRadarModalOpen(true)}>
                            <div className="relative z-10">
                                <RadarChart ratings={[{ data: team.ratings, color: '#f59f0a' }]} size={224} />
                            </div>
                        </div>

                        <div className="w-full space-y-4 pt-8 border-t border-white/5">
                            {[
                                { label: 'Movimiento (MA)', val: team.ratings.velocidad },
                                { label: 'Fuerza (ST)', val: team.ratings.fuerza },
                                { label: 'Agilidad (AG)', val: team.ratings.agilidad + '+' },
                                { label: 'Pase (PA)', val: team.ratings.pase + '+' },
                                { label: 'Armadura (AV)', val: team.ratings.armadura + '+' }
                            ].map((stat, i) => (
                                <div key={i} className="flex justify-between items-center text-sm group/stat">
                                    <span className="text-slate-400 font-black uppercase tracking-wider text-[10px] italic group-hover/stat:text-primary transition-colors">{stat.label}</span>
                                    <span className="text-white font-black font-display text-lg italic">{stat.val}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Team Wide Costs */}
                    <div className="bg-surface-dark rounded-2xl border border-white/5 p-8 space-y-8 shadow-2xl relative overflow-hidden">
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -translate-x-1/2 translate-y-1/2"></div>
                        <h3 className="text-slate-400 font-black uppercase tracking-[0.3em] text-[9px] border-b border-white/5 pb-4 italic">Costes de Equipo</h3>
                        <div className="grid grid-cols-2 gap-4 relative z-10">
                            {[
                                { label: 'Segunda Oportunidad', value: team.rerollCost.toLocaleString('es-ES'), highlight: true },
                                { label: 'Apoticario', value: team.apothecary },
                                { label: 'Sobornos', value: '100.000' },
                                { label: 'Animadoras', value: '10.000' }
                            ].map((cost, idx) => (
                                <div key={idx} className="p-4 bg-background-dark/80 rounded-xl border border-white/5 flex flex-col justify-center group/cost hover:border-primary/30 transition-all">
                                    <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest mb-1 group-hover/cost:text-accent-gold transition-colors">{cost.label}</p>
                                    <p className={`text-xl font-black italic tracking-tighter ${cost.highlight ? 'text-primary' : 'text-slate-100'}`}>{cost.value}</p>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={() => onRequestTeamCreation?.(team.name)}
                            className="w-full py-5 bg-primary hover:bg-white text-black font-black uppercase tracking-[0.2em] text-xs italic rounded-2xl transition-all transform hover:scale-[1.02] active:scale-95 shadow-[0_15px_40px_rgba(245,159,10,0.3)]"
                        >
                            Crear este Equipo
                        </button>
                    </div>
                </div>

                {/* Roster Table */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="bg-surface-dark rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl">
                        <div className="px-10 py-8 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
                            <div>
                                <h3 className="text-slate-100 font-black uppercase tracking-[0.3em] text-xs italic">Roster de Posicionales</h3>
                                <p className="text-[9px] text-slate-500 uppercase font-bold tracking-widest mt-1">Estadísticas Oficiales Nuffle V2.0</p>
                            </div>
                            <span className="material-symbols-outlined text-primary opacity-20 text-4xl">shield</span>
                        </div>
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left border-collapse min-w-[700px]">
                                <thead>
                                    <tr className="text-slate-500 text-[10px] uppercase tracking-[0.3em]">
                                        <th className="py-6 px-10 font-black">Posición</th>
                                        <th className="py-6 px-2 font-black text-center">MA</th>
                                        <th className="py-6 px-2 font-black text-center">FU</th>
                                        <th className="py-6 px-2 font-black text-center">AG</th>
                                        <th className="py-6 px-2 font-black text-center">PA</th>
                                        <th className="py-6 px-2 font-black text-center">AR</th>
                                        <th className="py-6 px-10 font-black">Habilidades</th>
                                        <th className="py-6 px-10 font-black text-right">Coste</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {team.roster.map((player, idx) => (
                                        <tr key={idx} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors group">
                                            <td className="py-6 px-10">
                                                <div className="flex flex-col">
                                                    <span className="font-black text-slate-100 uppercase tracking-tighter italic text-lg group-hover:text-primary transition-colors">{player.position}</span>
                                                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{player.qty} disponibles</span>
                                                </div>
                                            </td>
                                            <td className="py-6 px-2 text-center text-slate-400 font-display font-bold text-lg">{player.stats.MV}</td>
                                            <td className="py-6 px-2 text-center text-slate-100 font-display font-black text-lg italic">{player.stats.FU}</td>
                                            <td className="py-6 px-2 text-center text-slate-400 font-mono italic">{player.stats.AG}</td>
                                            <td className="py-6 px-2 text-center text-slate-400 font-mono italic">{player.stats.PS}</td>
                                            <td className="py-6 px-2 text-center text-slate-400 font-mono italic">{player.stats.AR}</td>
                                            <td className="py-6 px-10">
                                                <div className="flex flex-wrap gap-2">
                                                    {(player.skillKeys || []).map(skillKey => (
                                                        <SkillBadge
                                                            key={skillKey}
                                                            skillKey={skillKey}
                                                            onClick={setSelectedSkill}
                                                        />
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="py-6 px-10 text-right">
                                                <span className="font-display font-black text-xl italic text-premium-gold">{player.cost.toLocaleString('es-ES')}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Special Rules / Themes */}
                    <div className="bg-surface-dark rounded-2xl border border-primary/20 p-8 shadow-inner">
                        <h3 className="text-slate-100 font-bold uppercase tracking-[0.2em] text-[10px] mb-6 opacity-70">Reglas Especiales de Facción</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 leading-relaxed">
                            <div className="p-6 bg-background-dark/40 rounded-xl border-l-4 border-primary group hover:bg-background-dark transition-all">
                                <h4 className="text-primary font-black text-xs uppercase mb-2 tracking-widest italic">{team.name} Style</h4>
                                <p className="text-xs text-accent-gold font-medium italic">Esta facción rinde gloria a Nuffle bajo sus propias leyes. Estudia su flexibilidad y coste de reroll antes de saltar al césped.</p>
                            </div>
                            <div className="p-6 bg-background-dark/40 rounded-xl border-l-4 border-primary group hover:bg-background-dark transition-all">
                                <h4 className="text-primary font-black text-xs uppercase mb-2 tracking-widest italic">Animosidad / Reglas BB2020</h4>
                                <p className="text-xs text-accent-gold font-medium italic">Totalmente compatible con las últimas erratas y suplementos de la Temporada 2 de 2020.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer / Bottom Navigation */}
            <div className="mt-16 flex justify-between items-center border-t border-primary/20 pt-10 pb-20">
                <button
                    onClick={onBack}
                    className="flex items-center gap-3 text-accent-gold hover:text-primary transition-all font-black uppercase tracking-[0.2em] text-[10px] group italic"
                >
                    <span className="material-symbols-outlined font-bold group-hover:-translate-x-2 transition-transform">arrow_back</span>
                    Volver a la Enciclopedia
                </button>
                <div className="flex gap-4">
                    <button className="h-12 w-12 flex items-center justify-center rounded-xl bg-surface-dark text-accent-gold hover:text-primary transition-all border border-primary/10 hover:border-primary/40 group shadow-lg">
                        <span className="material-symbols-outlined group-hover:scale-110 transition-transform">share</span>
                    </button>
                    <button className="h-12 w-12 flex items-center justify-center rounded-xl bg-surface-dark text-accent-gold hover:text-primary transition-all border border-primary/10 hover:border-primary/40 group shadow-lg">
                        <span className="material-symbols-outlined group-hover:scale-110 transition-transform">bookmark</span>
                    </button>
                </div>
            </div>

            {isRadarModalOpen && <RadarChartModal team={team} onClose={() => setIsRadarModalOpen(false)} />}
            {selectedSkill && <SkillModal skill={selectedSkill} onClose={() => setSelectedSkill(null)} />}
        </motion.div>
    );
};

export default TeamDetailPage;
