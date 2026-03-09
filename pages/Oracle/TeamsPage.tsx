import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { teamsData as staticTeams } from '../../data/teams';
import type { Team, Skill } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useMasterData } from '../../hooks/useMasterData';
import { storage } from '../../firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import SkillModal from '../../components/oracle/SkillModal';
import ImageModal from '../../components/common/ImageModal';
import RadarChart from '../../components/oracle/RadarChart';
import RadarChartModal from '../../components/oracle/RadarChartModal';
import TeamDetailPage from './TeamDetailPage';
import SkillBadge from '../../components/shared/SkillBadge';
import { useLanguage } from '../../contexts/LanguageContext';

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
    onSkillClick: (skill: Skill) => void;
    isAdmin: boolean;
    onUpdateImage: (name: string, url: string) => Promise<void>;
}> = ({ team, onViewRoster, onSkillClick, isAdmin, onUpdateImage }) => {
    const [isRadarModalOpen, setIsRadarModalOpen] = useState(false);
    const [isFullscreenImage, setIsFullscreenImage] = useState(false);

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
                    <div
                        onClick={() => team.image && setIsFullscreenImage(true)}
                        className="w-full aspect-[16/9] rounded-2xl bg-primary/5 border border-primary/20 flex items-center justify-center mb-6 shadow-2xl overflow-hidden group cursor-pointer relative"
                    >
                        {team.image ? (
                            <img src={team.image} alt={team.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        ) : (
                            <span className="material-symbols-outlined text-primary text-6xl opacity-20">landscape</span>
                        )}
                        {team.image && (
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                                <span className="text-[10px] text-white font-black uppercase tracking-widest flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm">zoom_in</span> Ver Completa
                                </span>
                            </div>
                        )}
                    </div>
                    <h3 className="text-4xl font-display font-black text-slate-100 italic uppercase tracking-tighter">{team.name}</h3>
                    <div className="mt-4 flex flex-wrap justify-center gap-2">
                        <span className="px-3 py-1.5 rounded-xl bg-green-500/20 text-green-400 text-[10px] font-black border border-green-500/20 uppercase tracking-widest">Tier {team.tier}</span>
                        <span className="px-3 py-1.5 rounded-xl bg-primary/10 text-primary text-[10px] font-black border border-primary/20 tracking-widest uppercase italic">Reroll: {team.rerollCost / 1000}k</span>
                        <span className="px-3 py-1.5 rounded-xl bg-premium-gold/10 text-premium-gold text-[10px] font-black border border-premium-gold/20 tracking-widest uppercase italic">APO: {team.apothecary}</span>
                    </div>

                    <div className="mt-10 w-full flex flex-col items-center">
                        <p className="text-slate-500 text-[9px] uppercase font-black mb-4 tracking-[0.3em] italic">Estadísticas Promedio</p>
                        <div className="w-52 h-52 cursor-pointer hover:scale-105 transition-all bg-black/20 rounded-full border border-white/5 p-4" onClick={() => setIsRadarModalOpen(true)}>
                            <RadarChart ratings={[{ data: team.ratings, color: '#f59f0a' }]} size={176} />
                        </div>
                    </div>

                    {isAdmin && (
                        <button
                            onClick={() => onUpdateImage(team.name, team.image || '')}
                            className="mt-8 text-[10px] text-primary font-black uppercase tracking-widest border border-primary/30 px-6 py-3 rounded-xl hover:bg-primary hover:text-black transition-all italic shadow-lg shadow-primary/5"
                        >
                            Gestionar Imagen
                        </button>
                    )}
                </div>

                {/* Content Section */}
                <div className="lg:col-span-8">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-slate-500 text-[9px] uppercase tracking-[0.2em] border-b border-white/5">
                                    <th className="py-4 px-2 font-black">Posición</th>
                                    <th className="py-4 px-2 font-black text-center">MA</th>
                                    <th className="py-4 px-2 font-black text-center">FU</th>
                                    <th className="py-4 px-2 font-black text-center">AG</th>
                                    <th className="py-4 px-2 font-black text-center">PA</th>
                                    <th className="py-4 px-2 font-black text-center">AR</th>
                                    <th className="py-4 px-2 font-black">Habilidades</th>
                                    <th className="py-4 px-2 font-black text-right">Coste</th>
                                </tr>
                            </thead>
                            <tbody className="text-xs">
                                {team.roster.slice(0, 5).map((player, idx) => (
                                    <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                                        <td className="py-5 px-2 font-black text-slate-100 italic">{player.position}</td>
                                        <td className="py-5 px-2 text-center text-slate-400 font-display font-bold">{player.stats.MV}</td>
                                        <td className="py-5 px-2 text-center text-slate-200 font-display font-black">{player.stats.FU}</td>
                                        <td className="py-5 px-2 text-center text-slate-400 font-mono italic">{player.stats.AG}</td>
                                        <td className="py-5 px-2 text-center text-slate-400 font-mono italic">{player.stats.PS}</td>
                                        <td className="py-5 px-2 text-center text-slate-400 font-mono italic">{player.stats.AR}</td>
                                        <td className="py-5 px-2">
                                            <div className="flex flex-wrap gap-1">
                                                {(player.skillKeys || []).map(skillKey => (
                                                    <SkillBadge
                                                        key={skillKey}
                                                        skillKey={skillKey}
                                                        onClick={(skill) => onSkillClick(skill)}
                                                    />
                                                ))}
                                            </div>
                                        </td>
                                        <td className="py-5 px-2 text-right font-black text-premium-gold italic">{player.cost.toLocaleString('es-ES')}</td>
                                    </tr>
                                ))}
                                {team.roster.length > 5 && (
                                    <tr>
                                        <td colSpan={8} className="py-6 text-center">
                                            <button
                                                onClick={onViewRoster}
                                                className="text-[10px] text-slate-500 hover:text-primary uppercase font-black tracking-[0.3em] transition-all bg-white/5 px-6 py-2 rounded-full border border-white/5 hover:border-primary/30"
                                            >
                                                + {team.roster.length - 5} Posiciones adicionales
                                            </button>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="bg-black/30 rounded-2xl p-6 flex justify-between items-center border border-white/5 group hover:border-primary/20 transition-all shadow-inner">
                            <div className="flex items-center gap-4">
                                <span className="material-symbols-outlined text-primary">cached</span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 italic">Segunda Oportunidad</span>
                            </div>
                            <span className="text-primary font-display font-black text-lg italic">{team.rerollCost.toLocaleString('es-ES')}</span>
                        </div>
                        <button
                            onClick={onViewRoster}
                            className="bg-primary text-background-dark font-black px-8 py-5 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs italic shadow-[0_10px_30px_rgba(245,159,10,0.2)]"
                        >
                            <span className="material-symbols-outlined text-sm font-bold">visibility</span>
                            Ver Roster Completo
                        </button>
                    </div>
                </div>
            </div>

            {/* Lightbox / Fullscreen Image */}
            <AnimatePresence>
                {isFullscreenImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsFullscreenImage(false)}
                        className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-xl flex items-center justify-center p-8 cursor-zoom-out"
                    >
                        <motion.button
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute top-10 right-10 text-white/50 hover:text-white transition-colors"
                        >
                            <span className="material-symbols-outlined !text-4xl">close</span>
                        </motion.button>
                        <motion.img
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            src={team.image}
                            alt={team.name}
                            className="max-w-full max-h-full object-contain shadow-[0_0_100px_rgba(245,159,10,0.2)] rounded-3xl"
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {isRadarModalOpen && <RadarChartModal team={team} onClose={() => setIsRadarModalOpen(false)} />}
        </motion.article>
    );
};

const Teams: React.FC<{
    onRequestTeamCreation?: (rosterName: string) => void;
    initialTeamName?: string | null;
}> = ({ onRequestTeamCreation = (_name: string) => { }, initialTeamName }) => {
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
    const [selectedTiers, setSelectedTiers] = useState<number[]>([]);
    const [sortOrder, setSortOrder] = useState<'alpha' | 'tier_asc' | 'tier_desc'>('alpha');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [toastMessage, setToastMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
    const [confirmModal, setConfirmModal] = useState<{ title: string, message: string, onConfirm: () => void } | null>(null);

    const showToast = (text: string, type: 'success' | 'error' = 'success') => {
        setToastMessage({ text, type });
        setTimeout(() => setToastMessage(null), 4000);
    };

    // Auto-select team if initialTeamName is provided (from Hub)
    React.useEffect(() => {
        if (initialTeamName) {
            const team = teams.find(t => t.name === initialTeamName);
            if (team) {
                setSelectedTeam(team);
            }
        }
    }, [initialTeamName, teams]);

    const filteredTeams = useMemo(() => {
        let result = teams;

        if (searchTerm) {
            result = result.filter(team =>
                team.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (selectedTiers.length > 0) {
            result = result.filter(team => selectedTiers.includes(team.tier));
        }

        result = [...result].sort((a, b) => {
            if (sortOrder === 'alpha') return a.name.localeCompare(b.name);
            if (sortOrder === 'tier_asc') return a.tier - b.tier || a.name.localeCompare(b.name);
            if (sortOrder === 'tier_desc') return b.tier - a.tier || a.name.localeCompare(b.name);
            return 0;
        });

        return result;
    }, [searchTerm, selectedTiers, sortOrder, teams]);

    const toggleSort = () => {
        setSortOrder(prev => {
            if (prev === 'alpha') return 'tier_asc';
            if (prev === 'tier_asc') return 'tier_desc';
            return 'alpha';
        });
    };

    const toggleTier = (tier: number) => {
        setSelectedTiers(prev =>
            prev.includes(tier) ? prev.filter(t => t !== tier) : [...prev, tier]
        );
    };

    const popularTeams = useMemo(() => {
        const names = ['Orcos', 'Humanos', 'Elfos Oscuros', 'Skaven'];
        return teams.filter(t => names.includes(t.name));
    }, [teams]);

    const handleSkillClick = (skill: Skill) => {
        setSelectedSkill(skill);
    };

    const handleSync = () => {
        setConfirmModal({
            title: 'Sincronizar Facciones',
            message: '¿Quieres buscar y añadir nuevas razas desde el código fuente sin sobreescribir tus cambios actuales?',
            onConfirm: async () => {
                setConfirmModal(null);
                setIsSyncing(true);
                try {
                    await syncMasterData();
                    showToast('Sincronización completada con éxito.');
                } catch (e) {
                    showToast('Error al sincronizar datos.', 'error');
                } finally {
                    setIsSyncing(false);
                }
            }
        });
    };

    const updateTeamImage = async (teamName: string, url: string) => {
        await updateMasterItem('teams', teamName, { image: url });
    };

    if (selectedTeam) {
        return (
            <TeamDetailPage
                team={selectedTeam}
                onBack={() => setSelectedTeam(null)}
                onRequestTeamCreation={onRequestTeamCreation}
            />
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-7xl mx-auto px-4 py-8 w-full space-y-12"
        >
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
                        <div className="relative">
                            <button
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                className={`flex items-center gap-2 px-4 py-3 rounded-xl ${selectedTiers.length > 0 ? 'bg-primary text-background-dark shadow-[0_0_15px_rgba(245,159,10,0.3)]' : 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20'} font-black text-[10px] uppercase italic transition-all`}
                            >
                                <span className="material-symbols-outlined text-sm">filter_list</span>
                                Filtrar Tiers {selectedTiers.length > 0 && `(${selectedTiers.length})`}
                            </button>
                            <AnimatePresence>
                                {isFilterOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute right-0 top-full mt-2 w-48 bg-background-dark border border-primary/30 rounded-xl shadow-2xl overflow-hidden z-50"
                                    >
                                        <div className="p-2 space-y-1">
                                            {[1, 2, 3].map(tier => (
                                                <button
                                                    key={tier}
                                                    onClick={() => toggleTier(tier)}
                                                    className={`w-full text-left px-4 py-2 text-xs font-black uppercase italic rounded-lg transition-colors flex items-center justify-between ${selectedTiers.includes(tier)
                                                            ? 'bg-primary/20 text-primary border border-primary/30'
                                                            : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                                                        }`}
                                                >
                                                    Tier {tier}
                                                    {selectedTiers.includes(tier) && <span className="material-symbols-outlined text-[14px]">check</span>}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <button
                            onClick={toggleSort}
                            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors font-black text-[10px] uppercase italic w-32 justify-center"
                        >
                            <span className="material-symbols-outlined text-sm">sort</span>
                            {sortOrder === 'alpha' ? 'A-Z' : sortOrder === 'tier_asc' ? 'Tier ↑' : 'Tier ↓'}
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
            {selectedSkill && <SkillModal skill={selectedSkill} onClose={() => setSelectedSkill(null)} />}

            {confirmModal && (
                <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-[500] p-4">
                    <div className="bg-background-dark border border-white/10 p-10 rounded-[2.5rem] shadow-2xl max-w-sm w-full text-center space-y-6">
                        <div className="size-16 rounded-3xl flex items-center justify-center mx-auto bg-primary/10 text-primary">
                            <span className="material-symbols-outlined text-4xl">sync</span>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">{confirmModal.title}</h3>
                            <p className="text-slate-400 text-sm font-medium leading-relaxed">{confirmModal.message}</p>
                        </div>
                        <div className="flex flex-col gap-3">
                            <button onClick={confirmModal.onConfirm} className="w-full py-4 bg-primary text-black font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-primary/90 transition-all">CONFIRMAR</button>
                            <button onClick={() => setConfirmModal(null)} className="w-full py-4 bg-white/5 text-slate-400 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all">CANCELAR</button>
                        </div>
                    </div>
                </div>
            )}

            {toastMessage && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[600] animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className={`px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 backdrop-blur-xl border ${toastMessage.type === 'error' ? 'bg-red-950/80 border-red-500/30 text-red-400' : 'bg-zinc-900/90 border-white/10 text-primary'}`}>
                        <span className="material-symbols-outlined font-bold">{toastMessage.type === 'error' ? 'error' : 'check_circle'}</span>
                        <p className="text-white font-bold text-sm">{toastMessage.text}</p>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default Teams;
