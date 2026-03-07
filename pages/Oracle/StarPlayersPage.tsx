import React, { useState, useMemo } from 'react';
import type { StarPlayer } from '../../types';
import SearchIcon from '../../components/icons/SearchIcon';
import SparklesIcon from '../../components/icons/SparklesIcon';
import { useMasterData } from '../../hooks/useMasterData';
import { useLanguage } from '../../contexts/LanguageContext';

const PlayerStatsRow: React.FC<{ stats: any }> = ({ stats }) => (
    <div className="flex gap-2 mt-2 text-[10px] items-center">
        <div className="flex flex-col items-center bg-black/40 px-2 py-0.5 rounded border border-white/5 min-w-[32px]">
            <span className="text-slate-500 font-bold">MV</span>
            <span className="text-white font-mono">{stats.MV}</span>
        </div>
        <div className="flex flex-col items-center bg-black/40 px-2 py-0.5 rounded border border-white/5 min-w-[32px]">
            <span className="text-slate-500 font-bold">FU</span>
            <span className="text-white font-mono">{stats.FU}</span>
        </div>
        <div className="flex flex-col items-center bg-black/40 px-2 py-0.5 rounded border border-white/5 min-w-[32px]">
            <span className="text-slate-500 font-bold">AG</span>
            <span className="text-white font-mono">{stats.AG}</span>
        </div>
        <div className="flex flex-col items-center bg-black/40 px-2 py-0.5 rounded border border-white/5 min-w-[32px]">
            <span className="text-slate-500 font-bold">PA</span>
            <span className="text-white font-mono">{stats.PS}</span>
        </div>
        <div className="flex flex-col items-center bg-black/40 px-2 py-0.5 rounded border border-white/5 min-w-[32px]">
            <span className="text-slate-500 font-bold">AR</span>
            <span className="text-white font-mono">{stats.AR}</span>
        </div>
    </div>
);

const StarPlayerCard: React.FC<{ player: StarPlayer }> = ({ player }) => {
    const [imgError, setImgError] = useState(false);
    return (
        <div className="bg-slate-800/80 backdrop-blur-sm p-4 rounded-xl border border-white/5 hover:border-premium-gold/30 transition-all group overflow-hidden flex flex-col h-full">
            <div className="flex gap-4">
                <div className="w-20 h-20 rounded-lg overflow-hidden border border-white/10 flex-shrink-0 bg-black/40 flex items-center justify-center">
                    {(!player.image || imgError) ? (
                        <SparklesIcon className="w-8 h-8 text-premium-gold/20" />
                    ) : (
                        <img
                            src={player.image}
                            alt={player.name}
                            onError={() => setImgError(true)}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                        <h3 className="text-lg font-display font-bold text-white group-hover:text-premium-gold transition-colors truncate">{player.name}</h3>
                        <span className="text-sm font-mono font-black text-premium-gold tracking-tighter">{(player.cost / 1000)}k MO</span>
                    </div>

                    {!player.pair && player.stats && (
                        <PlayerStatsRow stats={player.stats} />
                    )}
                </div>
            </div>

            {player.pair ? (
                <div className="mt-4 space-y-4">
                    {player.pair.map((p, idx) => (
                        <div key={idx} className="bg-black/20 p-2 rounded-lg border border-white/5">
                            <p className="text-[10px] font-bold text-premium-gold uppercase tracking-widest mb-1">{p.name}</p>
                            <PlayerStatsRow stats={p.stats} />
                            {p.skills && <p className="text-[10px] text-slate-400 mt-1 italic">{p.skills}</p>}
                        </div>
                    ))}
                </div>
            ) : (
                player.skills && (
                    <div className="mt-4">
                        <p className="text-[11px] text-slate-300 font-medium leading-relaxed">
                            <span className="text-premium-gold/80 font-bold uppercase tracking-widest text-[9px] block mb-1">Habilidades:</span>
                            {player.skills}
                        </p>
                    </div>
                )
            )}

            {player.specialRules && (
                <div className="mt-2">
                    <p className="text-[10px] text-slate-400 italic bg-black/20 p-2 rounded">
                        <span className="text-blood-red not-italic font-bold uppercase tracking-widest text-[9px] block mb-1">Regla Especial:</span>
                        {player.specialRules}
                    </p>
                </div>
            )}

            <div className="mt-auto pt-3 flex flex-wrap gap-1">
                {player.playsFor.map(team => (
                    <span key={team} className="text-[8px] uppercase tracking-wider bg-white/5 px-2 py-0.5 rounded-full text-slate-500 border border-white/5">
                        {team}
                    </span>
                ))}
            </div>
        </div>
    );
};

const StarPlayers: React.FC = () => {
    const { starPlayers, loading } = useMasterData();
    const { t } = useLanguage();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFaction, setSelectedFaction] = useState('Todas');

    const factions = useMemo(() => {
        const all = new Set<string>();
        starPlayers.forEach(p => p.playsFor.forEach(f => all.add(f)));
        return [t('oracle.stars.all'), ...Array.from(all).sort()];
    }, [starPlayers, t]);

    const filteredPlayers = useMemo(() => {
        return starPlayers.filter(p => {
            const matchesSearch = (p.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                (p.skills?.toLowerCase() || '').includes(searchTerm.toLowerCase());
            const matchesFaction = selectedFaction === t('oracle.stars.all') ||
                (p.playsFor && (
                    p.playsFor.includes(selectedFaction) ||
                    p.playsFor.includes('Any Team') ||
                    p.playsFor.includes('Any team except Sylvanian Spotlight')
                ));
            return matchesSearch && matchesFaction;
        });
    }, [searchTerm, selectedFaction, starPlayers, t]);

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-premium-gold"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full max-w-md">
                    <input
                        type="text"
                        placeholder={t('oracle.stars.search')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:border-premium-gold outline-none transition-all"
                    />
                    <SearchIcon className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                </div>

                <div className="flex gap-4 w-full md:w-auto">
                    <select
                        value={selectedFaction}
                        onChange={(e) => setSelectedFaction(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-slate-300 outline-none focus:border-premium-gold"
                    >
                        {factions.map(f => <option key={f} value={f} className="bg-slate-900">{f}</option>)}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredPlayers.map(player => (
                    <StarPlayerCard key={player.name} player={player} />
                ))}
            </div>

            {filteredPlayers.length === 0 && (
                <div className="text-center py-20">
                    <p className="text-slate-500 font-display italic">{t('oracle.stars.empty')}</p>
                </div>
            )}
        </div>
    );
};

export default StarPlayers;
