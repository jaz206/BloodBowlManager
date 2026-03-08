import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { teamsData as staticTeams } from '../../data/teams';
import { skillsData } from '../../data/skills';
import type { Team, Skill } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useMasterData } from '../../hooks/useMasterData';
import { storage } from '../../firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import SkillModal from '../../components/oracle/SkillModal';
import ImageModal from '../../components/common/ImageModal';
import RadarChart from '../../components/oracle/RadarChart';
import RadarChartModal from '../../components/oracle/RadarChartModal';

const PopularTeamCard: React.FC<{ team: Team; icon: string; subtitle: string; onClick: () => void }> = ({ team, icon, subtitle, onClick }) => (
    <motion.div
        whileHover={{ y: -5 }}
        onClick={onClick}
        className="group relative overflow-hidden rounded-xl border border-primary/20 bg-background-dark/50 hover:border-primary transition-all cursor-pointer"
    >
        <div className="h-32 w-full bg-gradient-to-br from-primary/40 to-background-dark">
            <img
                src={team.image}
                alt={team.name}
                className="w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity"
            />
        </div>
        <div className="p-4 relative -mt-8">
            <div className="size-16 rounded-xl bg-background-dark border-2 border-primary flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-primary text-3xl">{icon}</span>
            </div>
            <h3 className="text-xl font-display font-bold text-slate-100">{team.name}</h3>
            <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 rounded bg-green-500/20 text-green-400 text-[10px] font-bold uppercase tracking-tight">Tier {team.tier}</span>
                <span className="text-slate-400 text-xs italic">{subtitle}</span>
            </div>
        </div>
    </motion.div>
);

const TeamArticle: React.FC<{
    team: Team;
    onViewRoster: () => void;
    onSkillClick: (skill: string) => void;
    isAdmin: boolean;
    onUpdateImage: (name: string, url: string) => Promise<void>;
}> = ({ team, onViewRoster, onSkillClick, isAdmin, onUpdateImage }) => {
    const [isRadarModalOpen, setIsRadarModalOpen] = useState(false);

    return (
        <motion.article
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-background-dark/30 border border-primary/10 rounded-2xl overflow-hidden shadow-xl"
        >
            <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Visual Section */}
                <div className="lg:col-span-4 flex flex-col items-center text-center border-b lg:border-b-0 lg:border-r border-primary/10 pb-8 lg:pb-0 lg:pr-8">
                    <div className="size-32 rounded-3xl bg-primary/10 border border-primary/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(245,159,10,0.1)] overflow-hidden group">
                        {team.image ? (
                            <img src={team.image} alt={team.name} className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform" />
                        ) : (
                            <span className="material-symbols-outlined text-primary text-6xl">groups</span>
                        )}
                    </div>
                    <h3 className="text-3xl font-display font-bold text-slate-100">{team.name}</h3>
                    <div className="mt-4 flex flex-wrap justify-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-bold border border-green-500/20 uppercase tracking-tighter">Tier {team.tier}</span>
                        <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20 tracking-tighter">Reroll: {team.rerollCost / 1000}k</span>
                        <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20 tracking-tighter">APO: {team.apothecary}</span>
                    </div>

                    <div className="mt-10 w-full flex flex-col items-center">
                        <p className="text-slate-400 text-[10px] uppercase font-bold mb-4 tracking-widest">Estadísticas Promedio</p>
                        <div className="w-48 h-48 cursor-pointer hover:scale-105 transition-transform" onClick={() => setIsRadarModalOpen(true)}>
                            <RadarChart ratings={[{ data: team.ratings, color: '#f59f0a' }]} size={192} />
                        </div>
                    </div>

                    {isAdmin && (
                        <button className="mt-6 text-[10px] text-primary/60 hover:text-primary uppercase font-bold tracking-widest border border-primary/20 px-4 py-2 rounded-lg hover:bg-primary/5 transition-colors">
                            Gestionar Imagen
                        </button>
                    )}
                </div>

                {/* Content Section */}
                <div className="lg:col-span-8">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-slate-500 text-[10px] uppercase tracking-widest border-b border-primary/10">
                                    <th className="py-3 px-2 font-bold">Posición</th>
                                    <th className="py-3 px-2 font-bold text-center">MA</th>
                                    <th className="py-3 px-2 font-bold text-center">FU</th>
                                    <th className="py-3 px-2 font-bold text-center">AG</th>
                                    <th className="py-3 px-2 font-bold text-center">PA</th>
                                    <th className="py-3 px-2 font-bold text-center">AR</th>
                                    <th className="py-3 px-2 font-bold">Habilidades</th>
                                    <th className="py-3 px-2 font-bold text-right">Coste</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {team.roster.slice(0, 5).map((player, idx) => (
                                    <tr key={idx} className="border-b border-primary/5 hover:bg-primary/5 transition-colors group">
                                        <td className="py-4 px-2 font-bold text-slate-200">{player.position}</td>
                                        <td className="py-4 px-2 text-center text-slate-400 font-mono">{player.stats.MV}</td>
                                        <td className="py-4 px-2 text-center text-slate-400 font-mono font-bold">{player.stats.FU}</td>
                                        <td className="py-4 px-2 text-center text-slate-400 font-mono">{player.stats.AG}</td>
                                        <td className="py-4 px-2 text-center text-slate-400 font-mono">{player.stats.PS}</td>
                                        <td className="py-4 px-2 text-center text-slate-400 font-mono">{player.stats.AR}</td>
                                        <td className="py-4 px-2 text-[10px] text-slate-500 max-w-[150px] truncate group-hover:whitespace-normal group-hover:truncate-none transition-all">
                                            {player.skills}
                                        </td>
                                        <td className="py-4 px-2 text-right font-bold text-primary">{player.cost.toLocaleString()}</td>
                                    </tr>
                                ))}
                                {team.roster.length > 5 && (
                                    <tr>
                                        <td colSpan={8} className="py-4 text-center">
                                            <button
                                                onClick={onViewRoster}
                                                className="text-[10px] text-slate-500 hover:text-primary uppercase font-bold tracking-[0.2em] transition-colors"
                                            >
                                                + {team.roster.length - 5} Posiciones adicionales
                                            </button>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-primary/5 rounded-xl p-4 flex justify-between items-center border border-primary/10 group hover:border-primary/30 transition-colors">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary text-xl">refresh</span>
                                <span className="text-xs font-bold uppercase tracking-widest">Segunda Oportunidad</span>
                            </div>
                            <span className="text-primary font-bold font-mono">{team.rerollCost.toLocaleString()}</span>
                        </div>
                        <button
                            onClick={onViewRoster}
                            className="bg-primary text-background-dark font-black px-6 py-4 rounded-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs italic shadow-lg shadow-primary/20"
                        >
                            <span className="material-symbols-outlined text-sm font-bold">visibility</span>
                            Ver Roster Completo
                        </button>
                    </div>
                </div>
            </div>
            {isRadarModalOpen && <RadarChartModal team={team} onClose={() => setIsRadarModalOpen(false)} />}
        </motion.article>
    );
};

const Teams: React.FC<{ onRequestTeamCreation?: (rosterName: string) => void }> = ({ onRequestTeamCreation = (_name: string) => { } }) => {
    const { teams: fetchedTeams, updateMasterItem, syncMasterData, loading } = useMasterData();
    const { isAdmin } = useAuth();

    // Safety merge: ensures teams have rosters from static data if Firestore is incomplete
    const teams = useMemo(() => {
        return fetchedTeams.map(ft => {
            const st = staticTeams.find(s => s.name === ft.name);
            return {
                ...st, // Use static as base
                ...ft, // Override with Firestore fields
                roster: ft.roster && ft.roster.length > 0 ? ft.roster : st?.roster || [] // Ensure roster exists
            };
        });
    }, [fetchedTeams]);

    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
    const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSyncing, setIsSyncing] = useState(false);

    const filteredTeams = useMemo(() => {
        if (!searchTerm) return teams;
        return teams.filter(team =>
            team.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, teams]);

    const popularTeams = useMemo(() => {
        const names = ['Orcos', 'Humanos', 'Elfos Oscuros', 'Skaven'];
        return teams.filter(t => names.includes(t.name));
    }, [teams]);

    const handleSkillClick = (skillName: string) => {
        const cleanedName = skillName.split('(')[0].trim();
        const foundSkill = skillsData.find(s => s.name.toLowerCase().startsWith(cleanedName.toLowerCase()));
        if (foundSkill) setSelectedSkill(foundSkill);
    };

    const handleSync = async () => {
        if (!window.confirm("¿Sincronizar datos?")) return;
        setIsSyncing(true);
        try {
            await syncMasterData();
            alert("Sincronizado");
        } catch (e) {
            alert("Error");
        } finally {
            setIsSyncing(false);
        }
    };

    const updateTeamImage = async (teamName: string, url: string) => {
        await updateMasterItem('team', teamName, { image: url });
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 w-full space-y-12">
            {/* Hero & Header */}
            <section>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-5xl font-display font-black text-slate-100 mb-4 italic uppercase tracking-tighter">
                            Enciclopedia de <span className="text-primary italic">Equipos</span>
                        </h1>
                        <p className="text-slate-400 max-w-2xl text-sm leading-relaxed">
                            Explora todas las facciones del Viejo Mundo. Analiza sus estadísticas promedio, rosters oficiales y costes para planificar tu próxima temporada.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <div className="relative group">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                <span className="material-symbols-outlined text-slate-500 text-sm group-focus-within:text-primary transition-colors">search</span>
                            </span>
                            <input
                                type="text"
                                placeholder="Buscar raza..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="bg-background-dark/50 border border-primary/20 text-slate-100 text-sm rounded-xl focus:ring-primary focus:border-primary block w-64 pl-10 p-3 backdrop-blur-md transition-all"
                            />
                        </div>
                        {isAdmin && (
                            <button
                                onClick={handleSync}
                                disabled={isSyncing}
                                className="p-3 rounded-xl bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-background-dark transition-all"
                            >
                                <span className="material-symbols-outlined">{isSyncing ? 'sync' : 'database'}</span>
                            </button>
                        )}
                        <button className="flex items-center gap-2 px-4 py-3 rounded-xl bg-primary text-background-dark font-black text-[10px] uppercase italic shadow-lg shadow-primary/10">
                            <span className="material-symbols-outlined text-sm">filter_list</span>
                            Filtrar Tiers
                        </button>
                        <button className="flex items-center gap-2 px-4 py-3 rounded-xl bg-primary/10 text-primary border border-primary/20 font-black text-[10px] uppercase italic">
                            <span className="material-symbols-outlined text-sm">sort</span>
                            Ordenar
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                    {[
                        { label: 'Total Facciones', value: `${teams.length} Razas`, icon: 'groups' },
                        { label: 'Niveles Disponibles', value: 'Tier 1 - 3', icon: 'military_tech' },
                        { label: 'Última Actualización', value: 'Edición 2020', icon: 'update' }
                    ].map((stat, i) => (
                        <div key={i} className="bg-primary/5 border border-primary/10 p-5 rounded-2xl flex items-center gap-4 hover:bg-primary/10 transition-colors group">
                            <div className="size-12 rounded-full bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined">{stat.icon}</span>
                            </div>
                            <div>
                                <p className="text-slate-500 text-[10px] uppercase tracking-widest font-black leading-none mb-1">{stat.label}</p>
                                <p className="text-2xl text-slate-100 font-display font-black italic">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Popular Factions */}
            {!searchTerm && popularTeams.length > 0 && (
                <section>
                    <h2 className="text-2xl font-display font-black text-slate-100 mb-6 flex items-center gap-3 italic uppercase tracking-tight">
                        <span className="material-symbols-outlined text-primary font-bold">star</span>
                        Facciones Populares
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {popularTeams.map((team) => {
                            let icon = 'groups';
                            let subtitle = 'Versatilidad total';
                            if (team.name.includes('Orcos')) { icon = 'skull'; subtitle = 'Combatientes puros'; }
                            if (team.name.includes('Elfos')) { icon = 'auto_fix_high'; subtitle = 'Agilidad letal'; }
                            if (team.name.includes('Skaven')) { icon = 'pest_control_rodent'; subtitle = 'Velocidad extrema'; }
                            return (
                                <PopularTeamCard
                                    key={team.name}
                                    team={team}
                                    icon={icon}
                                    subtitle={subtitle}
                                    onClick={() => setSelectedTeam(team)}
                                />
                            );
                        })}
                    </div>
                </section>
            )}

            {/* All Races List */}
            <section className="space-y-8">
                <div className="flex items-center justify-between mb-8 border-b border-primary/20 pb-4">
                    <h2 className="text-2xl font-display font-black text-slate-100 flex items-center gap-3 italic uppercase tracking-tight">
                        <span className="material-symbols-outlined text-primary">menu_book</span>
                        Todas las Razas
                    </h2>
                    <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
                        Mostrando {filteredTeams.length} resultados
                    </span>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                            className="size-12 border-4 border-primary border-t-transparent rounded-full"
                        />
                    </div>
                ) : (
                    <div className="space-y-12 pb-20">
                        <AnimatePresence>
                            {filteredTeams.map((team) => (
                                <TeamArticle
                                    key={team.name}
                                    team={team}
                                    isAdmin={!!isAdmin}
                                    onViewRoster={() => setSelectedTeam(team)}
                                    onSkillClick={handleSkillClick}
                                    onUpdateImage={updateTeamImage}
                                />
                            ))}
                        </AnimatePresence>

                        {filteredTeams.length === 0 && (
                            <p className="text-center text-slate-500 py-20 italic">
                                No se encontraron facciones que coincidan con la búsqueda.
                            </p>
                        )}
                    </div>
                )}
            </section>

            {/* Modals */}
            {selectedTeam && (
                <RadarChartModal
                    team={selectedTeam}
                    onClose={() => setSelectedTeam(null)}
                    customTitle={
                        <div className="flex items-center gap-4">
                            <span className="text-primary italic font-black uppercase tracking-tighter text-3xl">{selectedTeam.name}</span>
                            <button
                                onClick={() => { onRequestTeamCreation(selectedTeam.name); setSelectedTeam(null); }}
                                className="bg-primary text-background-dark font-black px-4 py-2 rounded-xl text-xs uppercase italic"
                            >
                                Crear Equipo
                            </button>
                        </div>
                    }
                />
            )}
            {selectedSkill && <SkillModal skill={selectedSkill} onClose={() => setSelectedSkill(null)} />}
        </div>
    );
};

export default Teams;
