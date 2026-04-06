import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { StarPlayer, PlayerStats, Skill } from '../../types';
import { useMasterData } from '../../hooks/useMasterData';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../hooks/useAuth';
import SkillBadge from '../../components/shared/SkillBadge';
import SkillModal from '../../components/oracle/SkillModal';
import { getStarPlayerImageUrl } from '../../utils/imageUtils';

const StatBox: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
    <div className="blood-ui-light-card p-2 rounded-xl border border-[rgba(111,87,56,0.12)] flex flex-col items-center justify-center min-w-[45px] shadow-[0_10px_20px_rgba(92,68,39,0.08)]">
        <span className="block text-[9px] text-[#7b6853] font-bold uppercase tracking-tighter">{label}</span>
        <span className="text-base font-black text-[#2b1d12] italic leading-tight">{value}</span>
    </div>
);

const StarPlayerCard: React.FC<{
    player: StarPlayer;
    isSelected: boolean;
    onSelect: () => void;
    onSkillClick: (skill: Skill) => void;
}> = ({ player, isSelected, onSelect, onSkillClick }) => {
    const isElite = player.cost > 250000;
    const isBrutal = Number(player.stats?.FU || 0) >= 5;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            onClick={onSelect}
            className={`group blood-ui-light-card border ${isSelected ? 'border-primary ring-2 ring-primary ring-offset-4 ring-offset-[rgba(255,248,231,0.92)]' : 'border-[rgba(111,87,56,0.18)]'} rounded-[1.6rem] overflow-hidden hover:border-primary/50 transition-all flex flex-col shadow-[0_18px_48px_rgba(92,68,39,0.12)] cursor-pointer h-full`}
        >
            <div className="h-52 relative overflow-hidden">
                {isSelected && (
                    <div className="absolute top-4 left-4 z-10 bg-[#ca8a04] text-[#2b1d12] rounded-full p-1 shadow-lg">
                        <span className="material-symbols-outlined text-sm font-bold">check</span>
                    </div>
                )}

                <motion.div
                    layoutId={`img-${player.name}`}
                    className="w-full h-full"
                >
                    <img
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        src={getStarPlayerImageUrl(player.name)}
                        onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            if (player.image && img.src !== player.image) {
                                img.src = player.image;
                            } else {
                                img.src = "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop";
                            }
                        }}
                        alt={player.name}
                    />
                </motion.div>
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(43,29,18,0.78)] via-transparent to-transparent"></div>

                <div className={`absolute top-4 right-4 font-black px-3 py-1 rounded-full text-[10px] italic z-10 ${isElite ? 'bg-primary text-background-dark' : 'bg-[rgba(43,29,18,0.8)] text-white'
                    }`}>
                    {isElite ? 'ELITE' : isBrutal ? 'BRUTAL' : 'LEYENDA'}
                </div>

                <div className="absolute bottom-4 left-4">
                    <h3 className="text-[#fff8e7] text-xl font-black italic uppercase leading-none tracking-tight group-hover:text-[#ca8a04] transition-colors">
                        {player.name}
                    </h3>
                    <p className="text-[#ca8a04] font-bold text-[10px] mt-1 uppercase tracking-widest">{player.playsFor[0]}</p>
                </div>
            </div>

            <div className="p-5 flex flex-col grow">
                {/* Stats Bar */}
                {player.stats && (
                    <div className="grid grid-cols-5 gap-1.5 mb-5">
                        <StatBox label="MA" value={player.stats.MV} />
                        <StatBox label="ST" value={player.stats.FU} />
                        <StatBox label="AG" value={player.stats.AG} />
                        <StatBox label="PA" value={player.stats.PA || '-'} />
                        <StatBox label="AV" value={player.stats.AR} />
                    </div>
                )}

                {/* Skills */}
                <div className="mb-5 grow">
                    <span className="block text-[9px] font-black text-primary uppercase mb-2 tracking-[0.2em] opacity-80">Habilidades</span>
                    <div className="flex flex-wrap gap-1">
                        {(player.skillKeys || []).slice(0, 4).map((skillKey) => (
                            <SkillBadge
                                key={skillKey}
                                skillKey={skillKey}
                                onClick={(skill) => onSkillClick(skill)}
                            />
                        ))}
                        {(player.skillKeys?.length || 0) > 4 && (
                            <span className="text-[9px] text-[#7b6853] font-bold px-1">...</span>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="pt-4 border-t border-border-gold/30">
                    <div className="flex flex-col">
                        <span className="text-[9px] text-[#7b6853] font-black uppercase tracking-widest">Coste</span>
                        <span className="text-primary font-black text-lg italic leading-none">{(player.cost / 1000)}k MO</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const StarPlayers: React.FC = () => {
    const { starPlayers, loading } = useMasterData();
    const { isAdmin } = useAuth();
    const { language } = useLanguage();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFaction, setSelectedFaction] = useState('Todas');
    const [selectedPlayerName, setSelectedPlayerName] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 2500);
    };

    const factions = useMemo(() => {
        const all = new Set<string>();
        starPlayers.forEach(p => p.playsFor.forEach(f => all.add(f)));
        return ['Todas', ...Array.from(all).sort()];
    }, [starPlayers]);

    const filteredPlayers = useMemo(() => {
        return starPlayers.filter(p => {
            const matchesSearch = (p.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                (p.skillKeys?.some(k => k.toLowerCase().includes(searchTerm.toLowerCase())) || false);
            const matchesFaction = selectedFaction === 'Todas' ||
                (p.playsFor && (
                    p.playsFor.includes(selectedFaction) ||
                    p.playsFor.includes('Any Team')
                ));
            return matchesSearch && matchesFaction;
        });
    }, [searchTerm, selectedFaction, starPlayers]);

    const selectedPlayer = useMemo(() =>
        selectedPlayerName ? starPlayers.find(p => p.name === selectedPlayerName) : null,
        [selectedPlayerName, starPlayers]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary border-transparent"></div>
                <span className="text-xs font-black text-primary uppercase tracking-[0.3em] animate-pulse">Contactando al Oráculo...</span>
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-20 max-w-7xl mx-auto relative">
            {/* Toast Notification */}
            <AnimatePresence>
                {toastMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-primary text-black font-black text-[10px] uppercase tracking-widest italic px-6 py-4 rounded-2xl shadow-2xl shadow-primary/20 flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                        {toastMessage}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                <span className="text-[#7b6853]">Oráculo</span>
                <span className="text-[#2b1d12]">/</span>
                <span className="text-primary italic">Jugadores Estrella</span>
            </nav>

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-[#2b1d12] text-4xl md:text-5xl font-black leading-tight tracking-tight uppercase italic border-l-4 border-primary pl-6">
                        Compendio de <span className="text-primary italic">Estrellas</span>
                    </h1>
                    <p className="text-[#7b6853] text-sm mt-3 font-medium italic opacity-80 max-w-xl">
                        Consulta las leyendas vivas de los campos de Blood Bowl. Contrataciones de élite para entrenadores con ambición.
                    </p>
                </div>
                {isAdmin && (
                    <button
                        onClick={() => showToast('Funcionalidad de creación en desarrollo para administradores.')}
                        className="flex items-center gap-3 bg-primary text-background-dark px-8 py-4 rounded-2xl font-black uppercase italic tracking-widest text-xs hover:scale-105 transition-all shadow-xl shadow-primary/20"
                    >
                        <span className="material-symbols-outlined font-bold">add</span>
                        Nuevo Jugador
                    </button>
                )}
            </div>

            {/* Filters */}
            <section className="grid grid-cols-1 lg:grid-cols-4 gap-6 blood-ui-light-card p-8 rounded-[2rem] border border-[rgba(111,87,56,0.16)] shadow-[0_18px_50px_rgba(92,68,39,0.12)]">
                <div className="lg:col-span-2">
                    <label className="block text-[10px] font-black text-[#7b6853] uppercase mb-3 tracking-[0.2em] italic pl-1">Buscar Leyenda</label>
                    <div className="relative group">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#7b6853] group-focus-within:text-primary transition-colors text-sm">search</span>
                        <input
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="blood-ui-light-input w-full rounded-2xl pl-12 pr-4 py-4 text-xs text-[#2b1d12] placeholder:text-[#8d7a63] focus:ring-1 focus:ring-primary focus:border-primary transition-all font-bold italic"
                            placeholder="Ej: Morg 'n' Thorg, Griff Oberwald..."
                            type="text"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-[10px] font-black text-[#7b6853] uppercase mb-3 tracking-[0.2em] italic pl-1">Afiliación / Raza</label>
                    <select
                        value={selectedFaction}
                        onChange={e => setSelectedFaction(e.target.value)}
                        className="blood-ui-light-input w-full rounded-2xl py-4 px-5 text-xs text-[#2b1d12] focus:ring-1 focus:ring-primary focus:border-primary appearance-none transition-all font-bold italic"
                    >
                        {factions.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                </div>
                <div className="flex items-end gap-2">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`flex-1 flex items-center justify-center gap-2 h-14 rounded-2xl transition-all ${viewMode === 'grid' ? 'bg-primary text-background-dark font-black' : 'bg-border-gold/20 text-[#7b6853] font-bold hover:bg-border-gold/40'}`}
                    >
                        <span className="material-symbols-outlined text-sm">grid_view</span>
                        <span className="text-[10px] uppercase tracking-widest">Cuadrícula</span>
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`flex-1 flex items-center justify-center gap-2 h-14 rounded-2xl transition-all ${viewMode === 'list' ? 'bg-primary text-background-dark font-black' : 'bg-border-gold/20 text-[#7b6853] font-bold hover:bg-border-gold/40'}`}
                    >
                        <span className="material-symbols-outlined text-sm">format_list_bulleted</span>
                        <span className="text-[10px] uppercase tracking-widest">Lista</span>
                    </button>
                </div>
            </section>

            {/* Main Content Area */}
            <div className={`grid gap-8 items-stretch ${viewMode === 'grid'
                ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
                : 'grid-cols-1 lg:grid-cols-2'
                }`}>
                <AnimatePresence mode="popLayout">
                    {filteredPlayers.map(player => (
                        <StarPlayerCard
                            key={player.name}
                            player={player}
                            isSelected={selectedPlayerName === player.name}
                            onSelect={() => setSelectedPlayerName(player.name)}
                            onSkillClick={(skill) => setSelectedSkill(skill)}
                        />
                    ))}
                </AnimatePresence>
            </div>

            {/* Detailed Selection View - Premium Modal Overlay */}
            <AnimatePresence>
                {selectedPlayer && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[150] flex flex-col items-center justify-start p-4 md:p-20 bg-[rgba(255,248,231,0.72)] backdrop-blur-md overflow-y-auto"
                        onClick={() => setSelectedPlayerName(null)}
                    >
                        <motion.section
                            key={selectedPlayer.name}
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="w-full max-w-6xl max-h-none md:max-h-[85vh] grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 blood-ui-light-card border border-[rgba(111,87,56,0.16)] p-8 md:p-14 rounded-[3rem] shadow-[0_50px_100px_rgba(92,68,39,0.16)] relative overflow-y-auto overflow-x-hidden premium-scrollbar my-auto"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setSelectedPlayerName(null)}
                                className="absolute top-8 right-8 size-12 rounded-full bg-[rgba(255,251,241,0.8)] border border-[rgba(111,87,56,0.12)] flex items-center justify-center text-[#7b6853] hover:text-[#ca8a04] transition-all z-50 hover:bg-white/70"
                            >
                                <span className="material-symbols-outlined font-bold">close</span>
                            </button>

                            <div className="absolute top-0 right-0 size-96 bg-primary/5 rounded-full blur-[100px] -mr-48 -mt-48 pointer-events-none"></div>

                            <div className="lg:col-span-1 space-y-8 relative z-10">
                                <motion.div
                                    layoutId={`img-${selectedPlayer.name}`}
                                    className="aspect-[3/4] rounded-3xl border-2 border-primary overflow-hidden shadow-[0_30px_60px_rgba(245,159,10,0.15)] bg-[rgba(255,251,241,0.82)]"
                                >
                                    <img
                                        className="w-full h-full object-cover"
                                        src={getStarPlayerImageUrl(selectedPlayer.name)}
                                        onError={(e) => {
                                            const img = e.target as HTMLImageElement;
                                            if (selectedPlayer.image && img.src !== selectedPlayer.image) {
                                                img.src = selectedPlayer.image;
                                            } else {
                                                img.src = "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop";
                                            }
                                        }}
                                        alt={selectedPlayer.name}
                                    />
                                </motion.div>
                                <div className="space-y-4">
                                    <h4 className="text-primary font-black uppercase tracking-[0.2em] text-[10px] italic border-l-2 border-primary pl-4">Equipos Compatibles</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedPlayer.playsFor.map(team => (
                                            <span key={team} className="px-3 py-1.5 bg-[rgba(202,138,4,0.12)] rounded-xl text-[9px] font-bold text-[#6f5738] border border-[rgba(202,138,4,0.2)] shadow-sm uppercase italic">
                                                {team}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-2 space-y-8 relative z-10 flex flex-col justify-between">
                                <div className="space-y-8">
                                    <div>
                                        <h2 className="text-4xl md:text-7xl font-black text-[#2b1d12] italic uppercase mb-2 tracking-tighter">
                                            {selectedPlayer.name}
                                        </h2>
                                        <p className="text-xl text-[#ca8a04] font-black italic tracking-tight">{selectedPlayer.playsFor[0]}</p>
                                    </div>

                                    <div className="p-8 bg-[rgba(255,251,241,0.7)] rounded-3xl border border-[rgba(111,87,56,0.12)] space-y-4 shadow-inner">
                                        <h4 className="text-[#2b1d12] font-black italic uppercase tracking-widest text-xs flex items-center gap-3">
                                            <span className="material-symbols-outlined text-primary text-sm">info</span>
                                            Biografía y Trasfondo
                                        </h4>
                                        <p className="text-[#7b6853] leading-relaxed text-sm font-medium italic">
                                            {selectedPlayer.description || `Esta leyenda de los campos de Blood Bowl es conocida por su impecable técnica y su capacidad para cambiar el rumbo de cualquier partido. Con un coste de ${(selectedPlayer.cost / 1000)},000 monedas de oro, es una inversión en victoria.`}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="p-8 bg-[rgba(255,251,241,0.66)] rounded-3xl border border-[rgba(111,87,56,0.16)] shadow-xl">
                                            <h4 className="text-[#2b1d12] font-black italic uppercase tracking-widest text-xs mb-6">Regla Especial</h4>
                                            <div className="flex gap-4">
                                                <div className="size-10 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0 border border-primary/20">
                                                    <span className="material-symbols-outlined text-lg text-primary">star</span>
                                                </div>
                                                <div>
                                                    <span className="text-[#2b1d12] font-black italic block text-sm mb-2">Habilidad Maestra</span>
                                                    <p className="text-[11px] text-[#7b6853] font-medium italic leading-relaxed">
                                                        {language === 'es' ? (selectedPlayer.specialRules_es || selectedPlayer.specialRules) : (selectedPlayer.specialRules_en || selectedPlayer.specialRules)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-8 bg-[rgba(255,251,241,0.66)] rounded-3xl border border-[rgba(111,87,56,0.16)] shadow-xl">
                                            <h4 className="text-[#2b1d12] font-black italic uppercase tracking-widest text-xs mb-6">Habilidades Base</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {(selectedPlayer.skillKeys || []).map((skillKey) => (
                                                    <SkillBadge
                                                        key={skillKey}
                                                        skillKey={skillKey}
                                                        onClick={(skill) => setSelectedSkill(skill)}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <motion.div
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                    className="flex flex-col md:flex-row items-center justify-between p-8 bg-primary rounded-[2.5rem] shadow-[0_20px_50px_rgba(245,159,10,0.3)] group overflow-hidden relative mt-8"
                                >
                                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <div className="text-background-dark relative z-10 mb-6 md:mb-0">
                                        <span className="text-[9px] font-black uppercase tracking-[0.3em] opacity-80 block mb-1">Honorarios de Contratación</span>
                                        <p className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter leading-none border-l-2 border-black/40 pl-6">
                                            {selectedPlayer.cost.toLocaleString('es-ES')} <span className="text-base">M.O.</span>
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => showToast(`¡${selectedPlayer.name} anotado para contratación!`)}
                                        className="w-full md:w-auto bg-background-dark text-primary px-12 py-5 rounded-2xl font-black uppercase italic tracking-widest text-xs hover:shadow-2xl transition-all border-2 border-background-dark/20 relative z-10"
                                    >
                                        Contratar Ahora
                                    </button>
                                </motion.div>
                            </div>
                        </motion.section>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Rules / Engine Citation */}
            <div className="pt-20 border-t border-[rgba(111,87,56,0.12)] flex flex-col items-center gap-6">
                <div className="flex items-center gap-3 bg-[rgba(255,251,241,0.82)] px-6 py-3 rounded-full border border-[rgba(202,138,4,0.22)] shadow-[0_12px_28px_rgba(92,68,39,0.10)]">
                    <span className="material-symbols-outlined text-primary text-lg">auto_fix</span>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7b6853] italic">BB Oracle Core Engine v2.4.0</span>
                </div>
                <div className="flex gap-8 text-[9px] font-black text-[#2b1d12] uppercase tracking-[0.3em]">
                    <a href="#" className="hover:text-primary transition-colors">Privacidad</a>
                    <a href="#" className="hover:text-primary transition-colors">Términos</a>
                    <a href="#" className="hover:text-primary transition-colors">API Endpoint</a>
                </div>
            </div>

            {/* Skill Modal */}
            {selectedSkill && (
                <SkillModal skill={selectedSkill} onClose={() => setSelectedSkill(null)} />
            )}

            <style>{`
                .premium-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .premium-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.02);
                    border-radius: 10px;
                }
                .premium-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(245, 159, 10, 0.3);
                    border-radius: 10px;
                    border: 2px solid transparent;
                    background-clip: content-box;
                }
                .premium-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(245, 159, 10, 0.5);
                    background-clip: content-box;
                }
            `}</style>
        </div>
    );
};

export default StarPlayers;
