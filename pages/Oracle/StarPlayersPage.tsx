import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { StarPlayer, PlayerStats } from '../../types';
import { useMasterData } from '../../hooks/useMasterData';
import { useLanguage } from '../../contexts/LanguageContext';

const StatBox: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
    <div className="bg-border-gold/40 p-2 rounded-lg border border-border-gold flex flex-col items-center justify-center min-w-[45px]">
        <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-tighter">{label}</span>
        <span className="text-base font-black text-white italic leading-tight">{value}</span>
    </div>
);

const StarPlayerCard: React.FC<{
    player: StarPlayer;
    isSelected: boolean;
    onSelect: () => void
}> = ({ player, isSelected, onSelect }) => {
    const isElite = player.cost > 250000;
    const isBrutal = (player.stats?.FU || '0') >= '5' || (player.stats?.FU || 0) >= 5;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            onClick={onSelect}
            className={`group bg-card-dark border ${isSelected ? 'border-primary ring-2 ring-primary ring-offset-4 ring-offset-background-dark' : 'border-border-gold'} rounded-xl overflow-hidden hover:border-primary/50 transition-all flex flex-col shadow-lg cursor-pointer h-full`}
        >
            <div className="h-52 relative overflow-hidden">
                {isSelected && (
                    <div className="absolute top-4 left-4 z-10 bg-primary text-background-dark rounded-full p-1 shadow-lg">
                        <span className="material-symbols-outlined text-sm font-bold">check</span>
                    </div>
                )}

                <img
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    src={player.image || "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop"}
                    alt={player.name}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card-dark via-transparent to-transparent"></div>

                <div className={`absolute top-4 right-4 font-black px-3 py-1 rounded-full text-[10px] italic z-10 ${isElite ? 'bg-primary text-background-dark' : 'bg-slate-700 text-white'
                    }`}>
                    {isElite ? 'ELITE' : isBrutal ? 'BRUTAL' : 'LEYENDA'}
                </div>

                <div className="absolute bottom-4 left-4">
                    <h3 className="text-white text-xl font-black italic uppercase leading-none tracking-tight group-hover:text-primary transition-colors">
                        {player.name}
                    </h3>
                    <p className="text-primary font-bold text-[10px] mt-1 uppercase tracking-widest">{player.playsFor[0]}</p>
                </div>
            </div>

            <div className="p-5 flex flex-col grow">
                {/* Stats Bar */}
                {player.stats && (
                    <div className="grid grid-cols-5 gap-1.5 mb-5">
                        <StatBox label="MA" value={player.stats.MV} />
                        <StatBox label="ST" value={player.stats.FU} />
                        <StatBox label="AG" value={player.stats.AG} />
                        <StatBox label="PA" value={player.stats.PS || '-'} />
                        <StatBox label="AV" value={player.stats.AR} />
                    </div>
                )}

                {/* Skills */}
                <div className="mb-5 grow">
                    <span className="block text-[9px] font-black text-primary uppercase mb-2 tracking-[0.2em] opacity-80">Habilidades</span>
                    <div className="flex flex-wrap gap-1">
                        {player.skills?.split(',').slice(0, 4).map((skill, idx) => (
                            <span key={idx} className="bg-slate-800/80 text-slate-300 text-[9px] px-2 py-0.5 rounded border border-white/5 font-medium">
                                {skill.trim()}
                            </span>
                        ))}
                        {(player.skills?.split(',').length || 0) > 4 && (
                            <span className="text-[9px] text-slate-500 font-bold px-1">...</span>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="pt-4 border-t border-border-gold/30 flex justify-between items-center">
                    <div className="flex flex-col">
                        <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Coste</span>
                        <span className="text-primary font-black text-lg italic leading-none">{(player.cost / 1000)}k MO</span>
                    </div>
                    <button className="bg-border-gold/50 hover:bg-primary hover:text-background-dark text-slate-100 font-black py-2 px-4 rounded-lg text-[10px] transition-all uppercase tracking-tighter italic">
                        Detalles
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

const StarPlayers: React.FC = () => {
    const { starPlayers, loading } = useMasterData();
    const { t } = useLanguage();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFaction, setSelectedFaction] = useState('Todas');
    const [selectedPlayerName, setSelectedPlayerName] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const factions = useMemo(() => {
        const all = new Set<string>();
        starPlayers.forEach(p => p.playsFor.forEach(f => all.add(f)));
        return ['Todas', ...Array.from(all).sort()];
    }, [starPlayers]);

    const filteredPlayers = useMemo(() => {
        return starPlayers.filter(p => {
            const matchesSearch = (p.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                (p.skills?.toLowerCase() || '').includes(searchTerm.toLowerCase());
            const matchesFaction = selectedFaction === 'Todas' ||
                (p.playsFor && (
                    p.playsFor.includes(selectedFaction) ||
                    p.playsFor.includes('Any Team')
                ));
            return matchesSearch && matchesFaction;
        });
    }, [searchTerm, selectedFaction, starPlayers]);

    const selectedPlayer = useMemo(() =>
        starPlayers.find(p => p.name === selectedPlayerName) || filteredPlayers[0],
        [selectedPlayerName, filteredPlayers, starPlayers]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary border-transparent"></div>
                <span className="text-xs font-black text-primary uppercase tracking-[0.3em] animate-pulse">Contactando al Oráculo...</span>
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-20 max-w-7xl mx-auto">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                <span className="text-slate-500">Oráculo</span>
                <span className="text-slate-700">/</span>
                <span className="text-primary italic">Jugadores Estrella</span>
            </nav>

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-slate-100 text-4xl md:text-5xl font-black leading-tight tracking-tight uppercase italic border-l-4 border-primary pl-6">
                        Compendio de <span className="text-primary italic">Estrellas</span>
                    </h1>
                    <p className="text-slate-400 text-sm mt-3 font-medium italic opacity-80 max-w-xl">
                        Consulta las leyendas vivas de los campos de Blood Bowl. Contrataciones de élite para entrenadores con ambición.
                    </p>
                </div>
                <button className="bg-primary text-background-dark px-8 py-3 rounded-xl font-black text-[10px] flex items-center gap-3 hover:bg-primary-dark transition-all uppercase tracking-[0.15em] shadow-xl shadow-primary/10 italic">
                    <span className="material-symbols-outlined text-lg">add_circle</span>
                    Nuevo Jugador
                </button>
            </div>

            {/* Filters */}
            <section className="grid grid-cols-1 lg:grid-cols-4 gap-6 bg-card-dark/40 p-8 rounded-[2rem] border border-border-gold shadow-2xl backdrop-blur-sm">
                <div className="lg:col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-3 tracking-[0.2em] italic pl-1">Buscar Leyenda</label>
                    <div className="relative group">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors text-sm">search</span>
                        <input
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-border-gold/20 border-border-gold/50 rounded-2xl pl-12 pr-4 py-4 text-xs text-slate-100 placeholder:text-slate-600 focus:ring-1 focus:ring-primary focus:border-primary transition-all font-bold italic"
                            placeholder="Ej: Morg 'n' Thorg, Griff Oberwald..."
                            type="text"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-3 tracking-[0.2em] italic pl-1">Afiliación / Raza</label>
                    <select
                        value={selectedFaction}
                        onChange={e => setSelectedFaction(e.target.value)}
                        className="w-full bg-border-gold/20 border-border-gold/50 rounded-2xl py-4 px-5 text-xs text-slate-100 focus:ring-1 focus:ring-primary focus:border-primary appearance-none transition-all font-bold italic"
                    >
                        {factions.map(f => <option key={f} value={f} className="bg-slate-900">{f}</option>)}
                    </select>
                </div>
                <div className="flex items-end gap-2">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`flex-1 flex items-center justify-center gap-2 h-14 rounded-2xl transition-all ${viewMode === 'grid' ? 'bg-primary text-background-dark font-black' : 'bg-border-gold/20 text-slate-500 font-bold hover:bg-border-gold/40'}`}
                    >
                        <span className="material-symbols-outlined text-sm">grid_view</span>
                        <span className="text-[10px] uppercase tracking-widest">Cuadrícula</span>
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`flex-1 flex items-center justify-center gap-2 h-14 rounded-2xl transition-all ${viewMode === 'list' ? 'bg-primary text-background-dark font-black' : 'bg-border-gold/20 text-slate-500 font-bold hover:bg-border-gold/40'}`}
                    >
                        <span className="material-symbols-outlined text-sm">format_list_bulleted</span>
                        <span className="text-[10px] uppercase tracking-widest">Lista</span>
                    </button>
                </div>
            </section>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 items-stretch">
                <AnimatePresence mode="popLayout">
                    {filteredPlayers.map(player => (
                        <StarPlayerCard
                            key={player.name}
                            player={player}
                            isSelected={selectedPlayerName === player.name}
                            onSelect={() => setSelectedPlayerName(player.name)}
                        />
                    ))}
                </AnimatePresence>
            </div>

            {/* Detailed Selection View */}
            <AnimatePresence mode="wait">
                {selectedPlayer && (
                    <motion.section
                        key={selectedPlayer.name}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-12 bg-card-dark/20 p-8 md:p-14 rounded-[3rem] border border-primary/20 shadow-2xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 size-96 bg-primary/5 rounded-full blur-[100px] -mr-48 -mt-48"></div>

                        <div className="lg:col-span-1 space-y-8 relative z-10">
                            <motion.div
                                className="aspect-[3/4] rounded-3xl border-2 border-primary overflow-hidden shadow-[0_30px_60px_rgba(245,159,10,0.15)] bg-black"
                                layoutId={`img-${selectedPlayer.name}`}
                            >
                                <img
                                    className="w-full h-full object-cover"
                                    src={selectedPlayer.image || "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop"}
                                    alt={selectedPlayer.name}
                                />
                            </motion.div>
                            <div className="space-y-4">
                                <h4 className="text-primary font-black uppercase tracking-[0.2em] text-[10px] italic border-l-2 border-primary pl-4">Equipos Compatibles</h4>
                                <div className="flex flex-wrap gap-2">
                                    {selectedPlayer.playsFor.map(team => (
                                        <span key={team} className="px-3 py-1.5 bg-border-gold/20 rounded-xl text-[9px] font-bold text-slate-300 border border-border-gold shadow-sm uppercase italic">
                                            {team}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-2 space-y-10 relative z-10">
                            <div>
                                <h2 className="text-5xl md:text-7xl font-black text-white italic uppercase mb-2 tracking-tighter">
                                    {selectedPlayer.name}
                                </h2>
                                <p className="text-xl text-primary font-black italic tracking-tight">{selectedPlayer.playsFor[0]}</p>
                            </div>

                            <div className="p-8 bg-black/40 rounded-3xl border border-white/5 space-y-4 shadow-inner">
                                <h4 className="text-slate-100 font-black italic uppercase tracking-widest text-xs flex items-center gap-3">
                                    <span className="material-symbols-outlined text-primary text-sm">info</span>
                                    Biografía y Trasfondo
                                </h4>
                                <p className="text-slate-400 leading-relaxed text-sm font-medium italic">
                                    {selectedPlayer.description || `Esta leyenda de los campos de Blood Bowl es conocida por su impecable técnica y su capacidad para cambiar el rumbo de cualquier partido. Con un coste de ${(selectedPlayer.cost / 1000)},000 monedas de oro, es una inversión en victoria.`}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="p-8 bg-black/30 rounded-3xl border border-white/5 shadow-xl">
                                    <h4 className="text-slate-100 font-black italic uppercase tracking-widest text-xs mb-6">Regla Especial</h4>
                                    <div className="flex gap-4">
                                        <div className="size-10 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0 border border-primary/20">
                                            <span className="material-symbols-outlined text-lg text-primary">star</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-200 font-black italic block text-sm mb-2">Habilidad Maestra</span>
                                            <p className="text-[11px] text-slate-500 font-medium italic leading-relaxed">
                                                {selectedPlayer.specialRules}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-8 bg-black/30 rounded-3xl border border-white/5 shadow-xl">
                                    <h4 className="text-slate-100 font-black italic uppercase tracking-widest text-xs mb-6">Habilidades Base</h4>
                                    <div className="grid grid-cols-1 gap-2">
                                        {selectedPlayer.skills?.split(',').map((skill, idx) => (
                                            <div key={idx} className="flex justify-between items-center py-2.5 border-b border-white/5 last:border-0">
                                                <span className="text-slate-300 font-bold italic text-[11px] uppercase tracking-wider">{skill.trim()}</span>
                                                <span className="material-symbols-outlined text-sm text-primary opacity-60">check_circle</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="flex flex-col md:flex-row items-center justify-between p-8 bg-primary rounded-[2rem] shadow-[0_20px_50px_rgba(245,159,10,0.3)] group overflow-hidden relative"
                            >
                                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="text-background-dark relative z-10 mb-6 md:mb-0">
                                    <span className="text-[9px] font-black uppercase tracking-[0.3em] opacity-80 block mb-1">Honorarios de Contratación</span>
                                    <p className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter leading-none border-l-2 border-black/40 pl-6">
                                        {selectedPlayer.cost.toLocaleString('es-ES')} <span className="text-base">M.O.</span>
                                    </p>
                                </div>
                                <button className="w-full md:w-auto bg-background-dark text-primary px-10 py-5 rounded-2xl font-black uppercase italic tracking-widest text-xs hover:shadow-2xl transition-all border-2 border-background-dark/20 relative z-10">
                                    Contratar Ahora
                                </button>
                            </motion.div>
                        </div>
                    </motion.section>
                )}
            </AnimatePresence>

            {/* Footer Rules Citation */}
            <div className="pt-20 border-t border-white/5 flex flex-col items-center gap-6">
                <div className="flex items-center gap-3 bg-card-dark/50 px-6 py-3 rounded-full border border-border-gold">
                    <span className="material-symbols-outlined text-primary text-lg">auto_fix</span>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 italic">BB Oracle Core Engine v2.4.0</span>
                </div>
                <div className="flex gap-8 text-[9px] font-black text-slate-700 uppercase tracking-[0.3em]">
                    <a href="#" className="hover:text-primary transition-colors">Privacidad</a>
                    <a href="#" className="hover:text-primary transition-colors">Términos</a>
                    <a href="#" className="hover:text-primary transition-colors">API Endpoint</a>
                </div>
            </div>
        </div>
    );
};

export default StarPlayers;
