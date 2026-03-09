import React, { useState } from 'react';
import { motion } from 'framer-motion';
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

    const currentSpecialRules = language === 'es' ? (team.specialRules_es || team.specialRules) : (team.specialRules_en || team.specialRules);


    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="min-h-screen bg-background-dark text-slate-100 font-display"
        >
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-accent-gold text-xs font-bold uppercase tracking-widest mb-8">
                <button onClick={onBack} className="hover:text-primary transition-colors">Enciclopedia</button>
                <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                <span className="text-slate-100 italic">{team.name}</span>
            </nav>

            {/* Hero Section */}
            <section className="flex flex-col md:flex-row gap-8 items-start mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="w-40 h-40 md:w-56 md:h-56 bg-surface-dark rounded-xl border border-primary/20 p-4 flex items-center justify-center relative overflow-hidden group shadow-2xl shadow-primary/5">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent"></div>
                    {team.image ? (
                        <img src={team.image} alt={team.name} className="relative z-10 w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                        <span className="material-symbols-outlined text-primary text-6xl relative z-10">groups</span>
                    )}
                </div>
                <div className="flex-1 space-y-6">
                    <div className="flex items-center gap-4">
                        <span className="px-3 py-1 bg-primary text-black font-black text-xs rounded uppercase tracking-tighter">Tier {team.tier}</span>
                        <h1 className="text-4xl md:text-6xl font-black text-slate-100 tracking-tighter uppercase italic drop-shadow-[0_0_15px_rgba(245,159,10,0.1)]">
                            {team.name}
                        </h1>
                    </div>
                    <p className="text-accent-gold text-lg max-w-2xl leading-relaxed italic">
                        {currentSpecialRules || (language === 'es' ? "Una facción legendaria lista para la gloria en el césped de Blood Bowl." : "A legendary faction ready for glory on the pitch.")}
                    </p>
                    <div className="flex gap-8 pt-2">
                        <div className="flex flex-col border-l-2 border-primary pl-4">
                            <span className="text-[10px] text-accent-gold uppercase font-black tracking-widest leading-none mb-1">Estilo de Juego</span>
                            <span className="text-slate-100 font-bold italic">
                                {team.tier === 1 ? 'Competitivo / Control' : team.tier === 2 ? 'Equilibrado / Bash' : 'Desafío / Caos'}
                            </span>
                        </div>
                        <div className="flex flex-col border-l-2 border-primary pl-4">
                            <span className="text-[10px] text-accent-gold uppercase font-black tracking-widest leading-none mb-1">Dificultad</span>
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
                    <div className="bg-surface-dark rounded-xl border border-primary/20 p-8 flex flex-col items-center shadow-inner relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
                        <h3 className="text-slate-100 font-bold uppercase tracking-[0.2em] text-[10px] mb-8 text-center opacity-60">Atributos Promedio</h3>

                        <div className="relative w-64 h-64 mb-8 cursor-pointer hover:scale-105 transition-transform duration-500" onClick={() => setIsRadarModalOpen(true)}>
                            <div className="absolute inset-0 radar-grid bg-primary/5 border border-primary/20"></div>
                            <div className="absolute inset-4 radar-grid bg-primary/10 border border-primary/30"></div>
                            <div className="absolute inset-8 radar-grid bg-primary/20 border border-primary/40"></div>

                            <div className="relative z-10">
                                <RadarChart ratings={[{ data: team.ratings, color: '#f59f0a' }]} size={256} />
                            </div>

                            {/* Labels */}
                            <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] font-black text-primary uppercase tracking-widest z-20">MOV</span>
                            <span className="absolute top-1/4 -right-10 text-[10px] font-black text-primary uppercase tracking-widest z-20">FUER</span>
                            <span className="absolute bottom-0 -right-6 text-[10px] font-black text-primary uppercase tracking-widest z-20">AGIL</span>
                            <span className="absolute bottom-0 -left-6 text-[10px] font-black text-primary uppercase tracking-widest z-20">PASE</span>
                            <span className="absolute top-1/4 -left-10 text-[10px] font-black text-primary uppercase tracking-widest z-20">ARM</span>
                        </div>

                        <div className="w-full space-y-3 pt-6 border-t border-white/5">
                            {[
                                { label: 'Movimiento (MA)', val: team.ratings.velocidad },
                                { label: 'Fuerza (ST)', val: team.ratings.fuerza },
                                { label: 'Agilidad (AG)', val: team.ratings.agilidad + '+' },
                                { label: 'Pase (PA)', val: team.ratings.pase + '+' },
                                { label: 'Armadura (AV)', val: team.ratings.armadura + '+' }
                            ].map((stat, i) => (
                                <div key={i} className="flex justify-between items-center text-sm border-b border-white/[0.02] last:border-0 pb-2">
                                    <span className="text-accent-gold font-medium italic">{stat.label}</span>
                                    <span className="text-white font-black font-mono">{stat.val}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Team Wide Costs */}
                    <div className="bg-surface-dark rounded-xl border border-primary/20 p-8 space-y-8 shadow-inner relative overflow-hidden">
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -translate-x-1/2 translate-y-1/2"></div>
                        <h3 className="text-slate-100 font-bold uppercase tracking-[0.2em] text-[10px] border-b border-primary/20 pb-4 opacity-70">Costes de Equipo</h3>
                        <div className="grid grid-cols-2 gap-4 relative z-10">
                            {[
                                { label: 'Segunda Oportunidad', value: (team.rerollCost / 1000) + 'k', highlight: true },
                                { label: 'Apoticario', value: team.apothecary },
                                { label: 'Sobornos', value: '100k' },
                                { label: 'Animadoras', value: '10,000' }
                            ].map((cost, idx) => (
                                <div key={idx} className="p-4 bg-background-dark/60 rounded-xl border border-primary/10 flex flex-col justify-center">
                                    <p className="text-[8px] text-accent-gold uppercase font-black tracking-widest mb-2 opacity-50">{cost.label}</p>
                                    <p className={`text-xl font-black italic tracking-tighter ${cost.highlight ? 'text-primary' : 'text-slate-100'}`}>{cost.value}</p>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={() => onRequestTeamCreation?.(team.name)}
                            className="w-full py-5 bg-primary hover:bg-white text-black font-black uppercase tracking-[0.2em] text-xs italic rounded-2xl transition-all transform hover:scale-[1.02] active:scale-95 shadow-xl shadow-primary/20"
                        >
                            Crear este Equipo
                        </button>
                    </div>
                </div>

                {/* Roster Table */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="bg-surface-dark rounded-2xl border border-primary/20 overflow-hidden shadow-2xl">
                        <div className="px-8 py-6 border-b border-primary/20 bg-primary/5 flex justify-between items-center">
                            <h3 className="text-slate-100 font-bold uppercase tracking-[0.2em] text-xs italic">Roster de Posicionales</h3>
                            <span className="text-[10px] text-accent-gold italic font-black uppercase tracking-widest opacity-60">Temporada 2024 V2.0</span>
                        </div>
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left border-collapse min-w-[600px]">
                                <thead>
                                    <tr className="bg-background-dark/50 text-accent-gold text-[9px] uppercase font-black tracking-[0.2em] border-b border-primary/10">
                                        <th className="px-6 py-4">Cant.</th>
                                        <th className="px-6 py-4">Posición</th>
                                        <th className="px-2 py-4 text-center">MA</th>
                                        <th className="px-2 py-4 text-center">ST</th>
                                        <th className="px-2 py-4 text-center">AG</th>
                                        <th className="px-2 py-4 text-center">PA</th>
                                        <th className="px-2 py-4 text-center">AV</th>
                                        <th className="px-6 py-4">Habilidades</th>
                                        <th className="px-6 py-4 text-right">Coste</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-primary/5 text-sm">
                                    {team.roster.map((pos, idx) => (
                                        <tr key={idx} className="hover:bg-primary/[0.03] transition-colors group">
                                            <td className="px-6 py-5 text-[10px] font-black text-accent-gold italic opacity-60">{pos.qty}</td>
                                            <td className="px-6 py-5 font-black text-slate-100 group-hover:text-primary transition-colors italic uppercase tracking-tighter text-base">{pos.position}</td>
                                            <td className="px-2 py-5 text-center font-mono font-black text-slate-400">{pos.stats.MV}</td>
                                            <td className="px-2 py-5 text-center font-mono font-black text-primary italic text-lg">{pos.stats.FU}</td>
                                            <td className="px-2 py-5 text-center font-mono font-black text-slate-400">{pos.stats.AG}</td>
                                            <td className="px-2 py-5 text-center font-mono font-black text-slate-400">{pos.stats.PS}</td>
                                            <td className="px-2 py-5 text-center font-mono font-black text-slate-200 border-r border-white/5">{pos.stats.AR}</td>
                                            <td className="px-6 py-5 flex flex-wrap gap-1 max-w-[250px]">
                                                {(pos.skillKeys || []).map(skillKey => (
                                                    <SkillBadge
                                                        key={skillKey}
                                                        skillKey={skillKey}
                                                        onClick={(skill) => setSelectedSkill(skill)}
                                                    />
                                                ))}
                                                {(!pos.skillKeys || pos.skillKeys.length === 0) && <span className="text-slate-500 italic text-[10px]">Ninguna</span>}
                                            </td>
                                            <td className="px-6 py-5 text-right font-black text-white italic tracking-tighter text-base">
                                                {pos.cost.toLocaleString()}
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
