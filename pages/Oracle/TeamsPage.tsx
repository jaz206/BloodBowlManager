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

const renderPlusValue = (value: string | number) => {
    const raw = value == null || value === 'undefined' || value === 'null' ? '—' : String(value);
    return <span className="inline-flex min-w-[2.75ch] items-center justify-center font-black tabular-nums not-italic leading-none text-[#2b1d12] text-[1.1rem] tracking-tight">{raw}</span>;
};

const PopularTeamCard: React.FC<{ team: Team; icon: string; subtitle: string; onClick: () => void }> = ({ team, icon, subtitle, onClick }) => (
    <motion.button
        type="button"
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.985 }}
        onClick={onClick}
        className="blood-ui-light-card group relative overflow-hidden rounded-[1.6rem] text-left shadow-[0_20px_60px_rgba(92,68,39,0.12)] focus:outline-none focus:ring-2 focus:ring-[rgba(202,138,4,0.25)]"
    >
        <div className="relative h-44 overflow-hidden">
            {team.image ? (
                <img
                    src={team.image}
                    alt={team.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
            ) : (
                <div className="h-full w-full bg-[linear-gradient(135deg,rgba(255,247,228,0.75),rgba(238,216,170,0.9))] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[72px] text-[#7b6853]/30">{icon}</span>
                </div>
            )}
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,244,218,0.08),rgba(40,25,13,0.72))]" />
            <div className="absolute left-4 top-4 flex items-center gap-2">
                <span className="blood-ui-light-button-secondary px-3 py-1 rounded-full text-[9px] uppercase tracking-[0.28em]">
                    Tier {team.tier}
                </span>
            </div>
            <div className="absolute right-4 top-4 size-11 rounded-full bg-[rgba(43,29,18,0.82)] border border-[rgba(202,138,4,0.35)] flex items-center justify-center text-[rgba(202,138,4,0.95)] shadow-lg">
                <span className="material-symbols-outlined text-[22px]">{icon}</span>
            </div>
        </div>
        <div className="p-5 space-y-4">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="blood-ui-light-meta text-[9px] uppercase tracking-[0.35em] font-black">Franquicia destacada</p>
                    <h3 className="blood-ui-light-title text-2xl leading-tight uppercase italic mt-2">{team.name}</h3>
                    <p className="blood-ui-light-body text-sm mt-2 line-clamp-2">{subtitle}</p>
                </div>
                <div className="text-right shrink-0">
                    <p className="blood-ui-light-meta text-[9px] uppercase tracking-[0.28em] font-black">Roster</p>
                    <p className="text-3xl font-black italic text-[#2b1d12] mt-1">{team.roster.length}</p>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
                <div className="rounded-2xl border border-[rgba(111,87,56,0.12)] bg-[rgba(255,251,241,0.58)] px-3 py-2">
                    <p className="text-[8px] uppercase tracking-[0.35em] text-[#7b6853] font-black">Reroll</p>
                    <p className="text-[#2b1d12] font-black italic mt-1 text-sm">{team.rerollCost / 1000}k</p>
                </div>
                <div className="rounded-2xl border border-[rgba(111,87,56,0.12)] bg-[rgba(255,251,241,0.58)] px-3 py-2">
                    <p className="text-[8px] uppercase tracking-[0.35em] text-[#7b6853] font-black">APO</p>
                    <p className="text-[#2b1d12] font-black italic mt-1 text-sm">{team.apothecary}</p>
                </div>
                <div className="rounded-2xl border border-[rgba(111,87,56,0.12)] bg-[rgba(255,251,241,0.58)] px-3 py-2">
                    <p className="text-[8px] uppercase tracking-[0.35em] text-[#7b6853] font-black">Tier</p>
                    <p className="text-[#2b1d12] font-black italic mt-1 text-sm">S3</p>
                </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-[rgba(111,87,56,0.12)]">
                <span className="text-[9px] uppercase tracking-[0.28em] font-black text-[#7b6853]">Toca para abrir la ficha completa</span>
                <span className="material-symbols-outlined text-[rgba(202,138,4,0.95)]">arrow_forward</span>
            </div>
        </div>
    </motion.button>
);

const TeamStatValue: React.FC<{ value: string | number }> = ({ value }) => {
    const raw = value == null ? '—' : String(value);
    return (
        <span className="inline-flex items-baseline justify-center font-black tabular-nums italic text-[#2b1d12]">
            {raw}
        </span>
    );
};


const TeamArticle: React.FC<{
    team: Team;
    onViewRoster: () => void;
    onSkillClick: (skill: Skill) => void;
    isAdmin: boolean;
    onUpdateImage: (name: string, url: string) => Promise<void>;
}> = ({ team, onViewRoster, onSkillClick, isAdmin, onUpdateImage }) => {
    const [isRadarModalOpen, setIsRadarModalOpen] = useState(false);
    const [isFullscreenImage, setIsFullscreenImage] = useState(false);
    const topRoster = team.roster.slice(0, 4);
    const moreCount = Math.max(team.roster.length - topRoster.length, 0);

    return (
        <motion.article
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="blood-ui-light-card rounded-[2rem] overflow-hidden shadow-[0_28px_80px_rgba(92,68,39,0.16)]"
        >
            <div className="grid grid-cols-1 lg:grid-cols-12">
                <div className="lg:col-span-4 p-6 md:p-8 border-b lg:border-b-0 lg:border-r border-[rgba(111,87,56,0.12)] bg-[linear-gradient(180deg,rgba(255,249,235,0.84),rgba(243,227,192,0.64))]">
                    <div
                        onClick={() => team.image && setIsFullscreenImage(true)}
                        className="group relative w-full aspect-[4/3] rounded-[1.6rem] overflow-hidden border border-[rgba(111,87,56,0.14)] shadow-[0_18px_40px_rgba(92,68,39,0.16)] cursor-pointer"
                    >
                        {team.image ? (
                            <img src={team.image} alt={team.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        ) : (
                            <div className="h-full w-full bg-[linear-gradient(135deg,rgba(255,247,228,0.7),rgba(238,216,170,0.85))] flex items-center justify-center">
                                <span className="material-symbols-outlined text-[72px] text-[#7b6853]/30">shield</span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,251,241,0.06),rgba(40,25,13,0.72))]" />
                        <div className="absolute inset-x-0 bottom-0 p-4 flex items-center justify-between gap-3">
                            <span className="blood-ui-light-button-secondary px-3 py-1.5 rounded-full text-[9px] uppercase tracking-[0.28em]">
                                Tier {team.tier}
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#6f5738]">Abre imagen</span>
                        </div>
                    </div>

                    <div className="mt-6 flex items-start justify-between gap-4">
                        <div>
                            <p className="blood-ui-light-meta text-[9px] uppercase tracking-[0.35em] font-black">Dossier de equipo</p>
                            <h3 className="blood-ui-light-title text-4xl leading-tight uppercase italic mt-2">{team.name}</h3>
                        </div>
                        <div className="text-right">
                            <p className="blood-ui-light-meta text-[9px] uppercase tracking-[0.28em] font-black">Roster</p>
                            <p className="text-3xl font-black italic text-[#2b1d12] mt-1">{team.roster.length}</p>
                        </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                        <span className="px-3 py-1.5 rounded-full bg-[rgba(255,255,255,0.55)] border border-[rgba(111,87,56,0.12)] text-[#2b1d12] text-[9px] font-black uppercase tracking-[0.28em]">Reroll: {team.rerollCost / 1000}k</span>
                        <span className="px-3 py-1.5 rounded-full bg-[rgba(255,255,255,0.55)] border border-[rgba(111,87,56,0.12)] text-[#2b1d12] text-[9px] font-black uppercase tracking-[0.28em]">APO: {team.apothecary}</span>
                    </div>

                    <div className="mt-6 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-2xl border border-[rgba(111,87,56,0.12)] bg-[rgba(255,251,241,0.7)] p-4">
                                 <p className="text-[8px] uppercase tracking-[0.35em] text-[#7b6853] font-black">Alineación</p>
                                <p className="text-[#2b1d12] font-black italic mt-2 text-sm">Plantilla oficial S3</p>
                            </div>
                            <div className="rounded-2xl border border-[rgba(111,87,56,0.12)] bg-[rgba(255,251,241,0.7)] p-4">
                                <p className="text-[8px] uppercase tracking-[0.35em] text-[#7b6853] font-black">Escudo</p>
                                <p className="text-[#2b1d12] font-black italic mt-2 text-sm">{team.image ? 'Disponible' : 'Pendiente'}</p>
                            </div>
                        </div>
                        <button
                            onClick={onViewRoster}
                            className="blood-ui-button-primary w-full py-4 rounded-2xl text-xs"
                        >
                            Ver ficha completa
                        </button>
                    </div>

                    {isAdmin && (
                        <button
                            onClick={() => onUpdateImage(team.name, team.image || '')}
                            className="mt-4 w-full blood-ui-button-secondary py-3 rounded-2xl text-[10px]"
                        >
                            Gestionar imagen
                        </button>
                    )}
                </div>

                <div className="lg:col-span-8 p-6 md:p-8 space-y-6">
                    <div className="grid grid-cols-1 xl:grid-cols-[1.35fr_0.65fr] gap-6">
                        <div className="rounded-[1.6rem] border border-[rgba(111,87,56,0.12)] bg-[rgba(255,251,241,0.72)] p-6">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="blood-ui-light-meta text-[9px] uppercase tracking-[0.35em] font-black">Plantilla activa</p>
                                    <h4 className="blood-ui-light-title text-2xl uppercase italic mt-2">Primeras posiciones</h4>
                                </div>
                                <span className="material-symbols-outlined text-[rgba(202,138,4,0.95)] text-3xl">sports_rugby</span>
                            </div>

                            <div className="mt-5 overflow-x-auto custom-scrollbar">
                                <table className="w-full min-w-[640px] text-left">
                                    <thead>
                                        <tr className="text-[9px] uppercase tracking-[0.28em] text-[#7b6853] border-b border-[rgba(111,87,56,0.12)]">
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
                                    <tbody>
                                        {topRoster.map((player, idx) => (
                                            <tr key={idx} className="border-b border-[rgba(111,87,56,0.08)] hover:bg-[rgba(202,138,4,0.04)] transition-colors">
                                                <td className="py-4 px-2">
                                                    <div className="flex flex-col">
                                                        <span className="text-[#2b1d12] font-black italic uppercase tracking-tight">{player.position}</span>
                                                        <span className="text-[9px] text-[#7b6853] uppercase tracking-[0.28em] font-black">{player.qty} x equipo</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-2 text-center text-[#2b1d12] font-display text-lg">{renderPlusValue(player.stats.MV)}</td>
                                                <td className="py-4 px-2 text-center text-[#2b1d12] font-display text-lg">{renderPlusValue(player.stats.FU)}</td>
                                                <td className="py-4 px-2 text-center text-[#2b1d12] font-display text-lg">{renderPlusValue(player.stats.AG)}</td>
                                                <td className="py-4 px-2 text-center text-[#2b1d12] font-display text-lg">{renderPlusValue(player.stats.PA)}</td>
                                                <td className="py-4 px-2 text-center text-[#2b1d12] font-display text-lg">{renderPlusValue(player.stats.AR)}</td>
                                                <td className="py-4 px-2">
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {(player.skillKeys || []).map(skillKey => (
                                                            <SkillBadge
                                                                key={skillKey}
                                                                skillKey={skillKey}
                                                                onClick={(skill) => onSkillClick(skill)}
                                                            />
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-2 text-right text-[#ca8a04] font-black italic">{player.cost.toLocaleString('es-ES')}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {moreCount > 0 && (
                                <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl border border-[rgba(111,87,56,0.12)] bg-[rgba(255,251,241,0.62)] px-4 py-3">
                                     <span className="text-[9px] uppercase tracking-[0.28em] text-[#7b6853] font-black">Más posiciones en la ficha completa</span>
                                    <button
                                        onClick={onViewRoster}
                                        className="text-[10px] uppercase tracking-[0.28em] font-black text-[#2b1d12] hover:text-[#ca8a04] transition-colors"
                                    >
                                        <span className="inline-flex items-baseline gap-0.5 font-black">
                                            <span>{moreCount}</span>
                                            <span>+</span>
                                        </span>
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="space-y-6">
                            <div className="rounded-[1.6rem] border border-[rgba(111,87,56,0.12)] bg-[rgba(255,251,241,0.72)] p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                             <p className="text-[8px] uppercase tracking-[0.35em] text-[#7b6853] font-black">Perfil táctico</p>
                             <h4 className="blood-ui-light-title text-xl uppercase italic mt-2">Lectura rápida</h4>
                                    </div>
                                    <button
                                        onClick={() => setIsRadarModalOpen(true)}
                                        className="size-10 rounded-full border border-[rgba(202,138,4,0.2)] bg-[rgba(202,138,4,0.12)] text-[#ca8a04] flex items-center justify-center hover:bg-[rgba(202,138,4,0.2)] transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">radar</span>
                                    </button>
                                </div>
                                <div className="mt-4 grid grid-cols-2 gap-3">
                                    {[
                                        { label: 'Potencia', value: team.ratings.fuerza },
                                        { label: 'Agilidad', value: team.ratings.agilidad },
                                        { label: 'Pase', value: team.ratings.pase },
                                        { label: 'Armadura', value: team.ratings.armadura }
                                    ].map((item) => (
                                        <div key={item.label} className="rounded-2xl border border-[rgba(111,87,56,0.12)] bg-white/55 px-4 py-3">
                                            <p className="text-[8px] uppercase tracking-[0.35em] text-[#7b6853] font-black">{item.label}</p>
                                            <p className="mt-2 text-2xl font-black italic text-[#2b1d12]">{item.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="rounded-[1.6rem] border border-[rgba(111,87,56,0.12)] bg-[rgba(255,251,241,0.72)] p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="blood-ui-light-meta text-[9px] uppercase tracking-[0.35em] font-black">Escudo</p>
                                        <h4 className="blood-ui-light-title text-xl uppercase italic mt-2">Imagen del equipo</h4>
                                    </div>
                                    <span className="material-symbols-outlined text-[rgba(202,138,4,0.95)] text-3xl">shield</span>
                                </div>
                                <button
                                    onClick={onViewRoster}
                                    className="mt-5 blood-ui-button-primary w-full py-4 rounded-2xl text-xs"
                                >
                                    Abrir ficha completa
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

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
                            className="max-w-full max-h-full object-contain shadow-[0_0_100px_rgba(202,138,4,0.2)] rounded-3xl"
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
            const nameA = a.name || '';
            const nameB = b.name || '';
            if (sortOrder === 'alpha') return nameA.localeCompare(nameB);
            if (sortOrder === 'tier_asc') return a.tier - b.tier || nameA.localeCompare(nameB);
            if (sortOrder === 'tier_desc') return b.tier - a.tier || nameA.localeCompare(nameB);
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
            <section className="blood-ui-light-card rounded-[2rem] p-6 md:p-8 mb-10 shadow-[0_26px_70px_rgba(92,68,39,0.12)]">
                <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
                    <div className="max-w-3xl space-y-4">
                        <p className="blood-ui-light-meta text-[9px] uppercase tracking-[0.35em] font-black">Enciclopedia t?ctica</p>
                        <h1 className="blood-ui-light-title text-5xl md:text-6xl uppercase italic leading-[0.95]">
                            Equipos, rosters y ADN <span className="text-[#ca8a04]">Blood Bowl</span>
                        </h1>
                        <p className="blood-ui-light-body text-sm md:text-base max-w-2xl leading-relaxed">
                            Explora todas las facciones del Viejo Mundo, compara sus estad?sticas, abre sus fichas completas y analiza qu? estrellas pueden usar antes de planificar tu pr?xima temporada.
                        </p>
                    </div>
                    <div className="flex flex-col gap-3 w-full xl:w-auto xl:min-w-[560px]">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative group flex-1">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-4">
                                    <span className="material-symbols-outlined text-[#7b6853] text-sm group-focus-within:text-[#ca8a04] transition-colors">search</span>
                                </span>
                                <input
                                    type="text"
                                    placeholder="Buscar raza..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="blood-ui-light-input block w-full pl-11 p-3 rounded-2xl text-sm"
                                />
                            </div>
                            {isAdmin && (
                                <button
                                    onClick={handleSync}
                                    disabled={isSyncing}
                                    className="blood-ui-light-button-secondary px-4 py-3 rounded-2xl text-[10px] uppercase italic font-black flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-sm">{isSyncing ? 'sync' : 'database'}</span>
                                    {isSyncing ? 'Sincronizando' : 'Sincronizar'}
                                </button>
                            )}
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 justify-end">
                            <div className="relative">
                                <button
                                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                                    className={`flex items-center gap-2 px-4 py-3 rounded-2xl ${selectedTiers.length > 0 ? 'bg-[#ca8a04] text-[#2b1d12] shadow-[0_0_15px_rgba(202,138,4,0.18)]' : 'blood-ui-light-button-secondary'} font-black text-[10px] uppercase italic transition-all`}
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
                                            className="absolute right-0 top-full mt-2 w-48 blood-ui-light-card rounded-2xl shadow-2xl overflow-hidden z-50"
                                        >
                                            <div className="p-2 space-y-1">
                                                {[1, 2, 3].map(tier => (
                                                    <button
                                                        key={tier}
                                                        onClick={() => toggleTier(tier)}
                                                        className={`w-full text-left px-4 py-2 text-xs font-black uppercase italic rounded-xl transition-colors flex items-center justify-between ${selectedTiers.includes(tier)
                                                                ? 'bg-[rgba(202,138,4,0.18)] text-[#2b1d12] border border-[rgba(202,138,4,0.24)]'
                                                                : 'text-[#4b3a28] hover:bg-white/50 hover:text-[#2b1d12]'
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
                                className="blood-ui-light-button-secondary flex items-center gap-2 px-4 py-3 rounded-2xl font-black text-[10px] uppercase italic w-full sm:w-36 justify-center"
                            >
                                <span className="material-symbols-outlined text-sm">sort</span>
                                {sortOrder === 'alpha' ? 'A-Z' : sortOrder === 'tier_asc' ? 'Tier ?' : 'Tier ?'}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                    {[
                        { label: 'Total Facciones', value: `${teams.length} Razas`, icon: 'groups' },
                        { label: 'Niveles Disponibles', value: 'Tier 1 - 3', icon: 'military_tech' },
                        { label: '?ltima Actualizaci?n', value: 'Edici?n 2020', icon: 'update' }
                    ].map((stat, i) => (
                        <div key={i} className="rounded-[1.4rem] border border-[rgba(111,87,56,0.12)] bg-[rgba(255,251,241,0.74)] p-5 flex items-center gap-4 hover:border-[rgba(202,138,4,0.2)] transition-colors group">
                            <div className="size-12 rounded-full bg-[rgba(202,138,4,0.12)] flex items-center justify-center text-[#ca8a04] group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined">{stat.icon}</span>
                            </div>
                            <div>
                                <p className="text-[#7b6853] text-[10px] uppercase tracking-widest font-black leading-none mb-1">{stat.label}</p>
                                <p className="text-2xl text-[#2b1d12] font-display font-black italic">{stat.value}</p>
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
        <div className="fixed inset-0 bg-[rgba(255,248,231,0.72)] backdrop-blur-md flex items-center justify-center z-[500] p-4">
            <div className="blood-ui-light-card border border-[rgba(111,87,56,0.14)] p-10 rounded-[2.5rem] shadow-2xl max-w-sm w-full text-center space-y-6">
                <div className="size-16 rounded-3xl flex items-center justify-center mx-auto bg-[rgba(202,138,4,0.14)] text-[#ca8a04]">
                            <span className="material-symbols-outlined text-4xl">sync</span>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-black text-[#2b1d12] italic uppercase tracking-tighter">{confirmModal.title}</h3>
                            <p className="text-[#6f5738] text-sm font-medium leading-relaxed">{confirmModal.message}</p>
                        </div>
                        <div className="flex flex-col gap-3">
                            <button onClick={confirmModal.onConfirm} className="w-full py-4 bg-primary text-black font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-primary/90 transition-all">CONFIRMAR</button>
                            <button onClick={() => setConfirmModal(null)} className="w-full py-4 bg-[rgba(255,251,241,0.72)] text-[#6f5738] font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-[rgba(255,251,241,0.88)] transition-all">Cancelar</button>
                        </div>
                    </div>
                </div>
            )}

            {toastMessage && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[600] animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div
                        className={`px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 backdrop-blur-xl border ${
                            toastMessage.type === 'error'
                                ? 'bg-[rgba(115,28,28,0.92)] border-[rgba(220,38,38,0.35)] text-[#ffe4e4]'
                                : 'bg-[rgba(255,248,231,0.92)] border-[rgba(111,87,56,0.16)] text-[#2b1d12]'
                        }`}
                    >
                        <span className="material-symbols-outlined font-bold">
                            {toastMessage.type === 'error' ? 'error' : 'check_circle'}
                        </span>
                        <p className="font-bold text-sm">{toastMessage.text}</p>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default Teams;
