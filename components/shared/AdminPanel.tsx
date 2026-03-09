import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMasterData } from '../../hooks/useMasterData';
import { useLanguage } from '../../contexts/LanguageContext';
import SearchIcon from '../icons/SearchIcon';
import type { Team, StarPlayer, Skill, Inducement } from '../../types';

type AdminTab = 'general' | 'teams' | 'stars' | 'skills' | 'inducements';

const transformGitHubUrl = (url: string | undefined | null): string => {
    if (!url || typeof url !== 'string') return url || '';

    // Check if it's a standard GitHub URL with /blob/
    if (url.includes('github.com') && url.includes('/blob/')) {
        return url
            .replace('github.com', 'raw.githubusercontent.com')
            .replace('/blob/', '/');
    }

    // Check if it's already a raw URL but with /blob/ (some users copy it wrong)
    if (url.includes('raw.githubusercontent.com') && url.includes('/blob/')) {
        return url.replace('/blob/', '/');
    }

    return url;
};

const AdminPanel: React.FC = () => {
    const {
        teams,
        starPlayers,
        skills,
        inducements,
        heroImage,
        updateHeroImage,
        loading,
        refresh,
        syncMasterData,
        syncStatus,
        isFromFirestore,
        updateMasterItem
    } = useMasterData();

    const { language } = useLanguage();
    const [activeTab, setActiveTab] = useState<AdminTab>('general');
    const [searchTerm, setSearchTerm] = useState('');
    const [editingItem, setEditingItem] = useState<{ type: AdminTab | 'hero', data: any } | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Filtering logic
    const filteredContent = useMemo(() => {
        const term = searchTerm.toLowerCase();
        switch (activeTab) {
            case 'teams':
                return teams.filter(t => t.name.toLowerCase().includes(term));
            case 'stars':
                return starPlayers.filter(s => s.name.toLowerCase().includes(term));
            case 'skills':
                return skills.filter(s =>
                    s.name_es.toLowerCase().includes(term) ||
                    s.name_en.toLowerCase().includes(term) ||
                    s.keyEN.toLowerCase().includes(term)
                );
            case 'inducements':
                return inducements.filter(i => i.name.toLowerCase().includes(term));
            default:
                return [];
        }
    }, [activeTab, searchTerm, teams, starPlayers, skills, inducements]);

    // Automatic URL transformation effect
    useEffect(() => {
        if (!editingItem) return;

        const { type, data } = editingItem;
        const isHero = type === 'hero';
        const urlField = isHero ? 'url' : 'image';
        const currentUrl = data[urlField];

        if (currentUrl && typeof currentUrl === 'string') {
            const transformed = transformGitHubUrl(currentUrl);
            if (transformed !== currentUrl) {
                setEditingItem({
                    ...editingItem,
                    data: {
                        ...data,
                        [urlField]: transformed,
                        // Also update crestImage for teams just in case
                        ...(type === 'teams' ? { crestImage: transformed } : {})
                    }
                });
            }
        }
    }, [editingItem]);

    const handleSync = async () => {
        if (!window.confirm('¿Estás seguro de que quieres sobreescribir los datos de Firestore con los archivos estáticos del proyecto? Esta acción es irreversible.')) return;
        try {
            await syncMasterData();
            alert('Sincronización completada con éxito. Los datos en la nube ahora coinciden con los archivos locales.');
        } catch (err: any) {
            console.error('Error syncing:', err);
            alert('Error al sincronizar: ' + (err.message || 'Desconocido'));
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingItem) return;
        setIsSaving(true);
        try {
            const { type, data } = editingItem;

            if (type === 'hero') {
                await updateHeroImage(data.url);
            } else if (type === 'teams') {
                await updateMasterItem('teams', data.name, data);
            } else if (type === 'stars') {
                await updateMasterItem('star_players', data.name, data);
            } else if (type === 'skills') {
                await updateMasterItem('skills', data.keyEN, data);
            } else if (type === 'inducements') {
                const docId = language === 'es' ? 'inducements_es' : 'inducements_en';
                await updateMasterItem(docId, data.name, data);
            }

            alert('Cambios guardados con éxito en la Base de Datos.');
            setEditingItem(null);
            refresh();
        } catch (error) {
            console.error('Error saving:', error);
            alert('Error al guardar: ' + (error instanceof Error ? error.message : 'Desconocido'));
        } finally {
            setIsSaving(false);
        }
    };

    const tabs: { id: AdminTab; label: string; icon: string }[] = [
        { id: 'general', label: 'General', icon: 'settings' },
        { id: 'teams', label: 'Equipos', icon: 'groups' },
        { id: 'stars', label: 'Estrellas', icon: 'star' },
        { id: 'skills', label: 'Habilidades', icon: 'bolt' },
        { id: 'inducements', label: 'Incentivos', icon: 'payments' },
    ];

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-premium-gold shadow-[0_0_20px_rgba(202,138,4,0.3)]"></div>
            <p className="text-[10px] font-black uppercase text-premium-gold animate-pulse tracking-widest">Invocando a Nuffle...</p>
        </div>
    );

    return (
        <div className="p-4 sm:p-8 animate-fade-in-slow max-w-7xl mx-auto min-h-screen">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                    <div className="flex items-center gap-3">
                        <span className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blood-red/20 to-premium-gold/20 border border-white/10 flex items-center justify-center shadow-2xl">
                            <span className="material-symbols-outlined text-premium-gold text-2xl">admin_panel_settings</span>
                        </span>
                        <div>
                            <h2 className="text-4xl font-display font-black text-white italic tracking-tighter uppercase leading-none">Nursery de Nuffle</h2>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-1 ml-1">Módulo de Administración de Datos Maestros</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-4 items-center">
                    <div className={`px-4 py-2 rounded-xl flex items-center gap-2 border transition-colors ${isFromFirestore ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-orange-500/10 border-orange-500/30 text-orange-400'}`}>
                        <div className={`w-2 h-2 rounded-full ${isFromFirestore ? 'bg-green-400 animate-pulse' : 'bg-orange-400'}`}></div>
                        <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                            {isFromFirestore ? 'LIVE: FIRESTORE' : 'LOCAL: STATIC FALLBACK'}
                        </span>
                    </div>

                    <button
                        onClick={handleSync}
                        disabled={syncStatus === 'syncing'}
                        className={`px-6 py-2.5 rounded-xl border font-display font-black uppercase tracking-widest text-[10px] transition-all flex items-center gap-3 shadow-xl ${syncStatus === 'syncing'
                            ? 'bg-zinc-800 border-zinc-700 text-zinc-500 cursor-not-allowed'
                            : 'bg-blood-red/20 border-blood-red/30 text-blood-red hover:bg-blood-red hover:text-white hover:shadow-blood-red/20'
                            }`}
                    >
                        {syncStatus === 'syncing' ? (
                            <span className="w-3 h-3 border-2 border-zinc-500 border-t-white rounded-full animate-spin"></span>
                        ) : (
                            <span className="material-symbols-outlined text-sm">sync</span>
                        )}
                        {syncStatus === 'syncing' ? 'Sincronizando...' : 'Sincronizar BBDD'}
                    </button>
                </div>
            </header>

            {/* Navigation Tabs */}
            <div className="flex overflow-x-auto pb-4 mb-8 custom-scrollbar gap-2 no-scrollbar">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => { setActiveTab(tab.id); setSearchTerm(''); }}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-display font-black uppercase tracking-widest text-[10px] transition-all whitespace-nowrap border ${activeTab === tab.id
                            ? 'bg-premium-gold text-black border-premium-gold shadow-lg shadow-premium-gold/20'
                            : 'bg-white/5 text-slate-400 border-white/5 hover:border-white/20 hover:text-white'
                            }`}
                    >
                        <span className="material-symbols-outlined text-sm">{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-8"
                >
                    {activeTab === 'general' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Hero Card */}
                            <div className="glass-panel p-8 border-white/5 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <span className="material-symbols-outlined text-8xl">image</span>
                                </div>
                                <h4 className="text-xl font-display font-black text-white uppercase italic mb-4">Imagen de Cabecera</h4>
                                <p className="text-sm text-slate-400 mb-6 max-w-sm">Esta es la imagen principal que aparece en el Inicio de la aplicación. Usa una URL directa de alta calidad.</p>

                                <div className="relative mb-6 aspect-video rounded-2xl border border-white/10 bg-black/40 overflow-hidden shadow-2xl">
                                    {heroImage ? (
                                        <img src={heroImage} alt="Hero" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-600 italic text-xs">Sin imagen configurada</div>
                                    )}
                                </div>

                                <button
                                    onClick={() => setEditingItem({ type: 'hero', data: { url: heroImage || '' } })}
                                    className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white font-display font-black uppercase tracking-[0.2em] text-[10px] hover:bg-premium-gold hover:text-black hover:border-premium-gold transition-all"
                                >
                                    Editar Imagen Hero
                                </button>
                            </div>

                            {/* Stats Card */}
                            <div className="glass-panel p-8 border-white/5 flex flex-col justify-between">
                                <div>
                                    <h4 className="text-xl font-display font-black text-white uppercase italic mb-6">Estadísticas de Nuffle</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            { label: 'Facciones', val: teams.length, icon: 'groups' },
                                            { label: 'Habilidades', val: skills.length, icon: 'bolt' },
                                            { label: 'Star Players', val: starPlayers.length, icon: 'star' },
                                            { label: 'Incentivos', val: inducements.length, icon: 'payments' },
                                        ].map(stat => (
                                            <div key={stat.label} className="bg-black/40 p-4 rounded-xl border border-white/5">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="material-symbols-outlined text-sm text-premium-gold">{stat.icon}</span>
                                                    <span className="text-[10px] text-slate-500 font-bold uppercase truncate">{stat.label}</span>
                                                </div>
                                                <div className="text-2xl font-display font-black text-white italic">{stat.val}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="mt-6 pt-6 border-t border-white/5">
                                    <p className="text-[10px] text-slate-500 font-bold uppercase leading-relaxed italic">
                                        * Los cambios realizados en el resto de pestañas se guardan directamente en Firestore y se reflejan instantáneamente para todos los usuarios.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Search for Content Tabs */}
                            <div className="relative max-w-xl group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-premium-gold transition-colors">
                                    <SearchIcon className="h-5 w-5" />
                                </div>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder={`Buscar ${tabs.find(t => t.id === activeTab)?.label.toLowerCase()}...`}
                                    className="block w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-premium-gold/30 shadow-2xl transition-all"
                                />
                            </div>

                            {/* List Container */}
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 custom-scrollbar max-h-[70vh] overflow-y-auto pr-2">
                                {filteredContent.map((item: any) => (
                                    <motion.div
                                        key={item.keyEN || item.name}
                                        layout
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="group flex justify-between items-center p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-premium-gold/30 hover:bg-white/[0.08] transition-all"
                                    >
                                        <div className="flex items-center gap-4 min-w-0">
                                            {(activeTab === 'teams' || activeTab === 'stars') && (
                                                <div className="w-12 h-12 rounded-xl bg-black/60 border border-white/10 overflow-hidden flex-shrink-0 shadow-inner">
                                                    <img src={item.image || item.crestImage} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                                                </div>
                                            )}
                                            {activeTab === 'skills' && (
                                                <div className="w-10 h-10 rounded-xl bg-premium-gold/10 border border-premium-gold/20 flex items-center justify-center text-premium-gold">
                                                    <span className="material-symbols-outlined text-base">bolt</span>
                                                </div>
                                            )}
                                            {activeTab === 'inducements' && (
                                                <div className="w-10 h-10 rounded-xl bg-blood-red/10 border border-blood-red/20 flex items-center justify-center text-blood-red">
                                                    <span className="material-symbols-outlined text-base">payments</span>
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <h5 className="font-display font-black text-white uppercase tracking-wider text-sm truncate group-hover:text-premium-gold transition-colors italic">
                                                    {activeTab === 'skills'
                                                        ? (language === 'es' ? (item.name_es || item.name_en) : item.name_en)
                                                        : item.name}
                                                </h5>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase truncate tracking-tighter">
                                                    {activeTab === 'skills' ? item.category : (item.cost ? `${(item.cost / 1000)}k MO` : item.tier ? `Tier ${item.tier}` : 'Consitente')}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setEditingItem({ type: activeTab, data: { ...item } })}
                                            className="ml-4 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-premium-gold hover:text-black hover:border-premium-gold font-display font-black text-[9px] uppercase tracking-widest transition-all whitespace-nowrap"
                                        >
                                            Editar
                                        </button>
                                    </motion.div>
                                ))}
                                {filteredContent.length === 0 && (
                                    <div className="col-span-full py-20 text-center glass-panel border-dashed border-white/10">
                                        <span className="material-symbols-outlined text-4xl text-slate-700 mb-2">search_off</span>
                                        <p className="text-slate-500 font-display font-bold uppercase text-[10px] tracking-[0.3em]">No se encontraron resultados para "{searchTerm}"</p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Editing Modal */}
            <AnimatePresence>
                {editingItem && (
                    <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center z-[200] p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-zinc-950 border border-white/10 rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] w-full max-w-3xl overflow-hidden relative"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-premium-gold to-transparent opacity-50"></div>

                            {/* Modal Header */}
                            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                                <div>
                                    <span className="text-[10px] font-black text-premium-gold uppercase tracking-[0.4em] mb-1 block opacity-70">
                                        Editor de {tabs.find(t => t.id === (editingItem.type === 'hero' ? 'general' : editingItem.type))?.label}
                                    </span>
                                    <h3 className="text-2xl font-display font-black text-white uppercase tracking-tighter italic leading-none">
                                        {editingItem.type === 'hero' ? 'Configurar Fondo Hero' : (editingItem.data.name || editingItem.data.keyEN)}
                                    </h3>
                                </div>
                                <button
                                    onClick={() => setEditingItem(null)}
                                    className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-slate-500 hover:text-white hover:border-white/30 transition-all hover:rotate-90 duration-500"
                                >
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>

                            {/* Modal Form */}
                            <div className="p-10 max-h-[70vh] overflow-y-auto custom-scrollbar bg-black/40">
                                <form onSubmit={handleSave} className="space-y-8">
                                    <div className="grid grid-cols-1 gap-8">

                                        {/* IMAGE / DATA URL FIELD */}
                                        {(editingItem.type === 'hero' || editingItem.type === 'teams' || editingItem.type === 'stars') && (
                                            <div className="space-y-4">
                                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Enlace de Imagen</label>
                                                <div className="flex gap-4">
                                                    <div className="grow">
                                                        <input
                                                            type="text"
                                                            value={editingItem.type === 'hero' ? editingItem.data.url : (editingItem.data.image || editingItem.data.crestImage || '')}
                                                            onChange={(e) => {
                                                                const val = e.target.value;
                                                                setEditingItem({
                                                                    ...editingItem,
                                                                    data: { ...editingItem.data, [editingItem.type === 'hero' ? 'url' : 'image']: val }
                                                                });
                                                            }}
                                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-premium-gold/50 outline-none transition-all placeholder-slate-700 font-medium"
                                                            placeholder="https://..."
                                                        />
                                                    </div>
                                                    <div className="w-24 h-16 rounded-2xl border border-white/10 bg-black overflow-hidden flex-shrink-0">
                                                        <img src={editingItem.type === 'hero' ? editingItem.data.url : editingItem.data.image} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* TEAMS SPECIFIC */}
                                        {editingItem.type === 'teams' && (
                                            <div className="space-y-8">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                    <div className="space-y-4">
                                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Costo Segunda Tirada</label>
                                                        <input
                                                            type="number"
                                                            value={editingItem.data.rerollCost || 0}
                                                            onChange={(e) => setEditingItem({
                                                                ...editingItem,
                                                                data: { ...editingItem.data, rerollCost: parseInt(e.target.value) }
                                                            })}
                                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-premium-gold/50 outline-none"
                                                        />
                                                    </div>
                                                    <div className="space-y-4">
                                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Tier (Nivel)</label>
                                                        <select
                                                            value={editingItem.data.tier || 1}
                                                            onChange={(e) => setEditingItem({
                                                                ...editingItem,
                                                                data: { ...editingItem.data, tier: parseInt(e.target.value) }
                                                            })}
                                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-premium-gold/50 outline-none"
                                                        >
                                                            {[1, 2, 3].map(t => <option key={t} value={t}>Tier {t}</option>)}
                                                        </select>
                                                    </div>
                                                </div>

                                                {/* Ratings for Teams */}
                                                <div className="space-y-4">
                                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Ratings de Facción (Comparativa)</label>
                                                    <div className="grid grid-cols-5 gap-4">
                                                        {[
                                                            { k: 'fuerza', l: 'FUE' },
                                                            { k: 'agilidad', l: 'AGI' },
                                                            { k: 'velocidad', l: 'VEL' },
                                                            { k: 'armadura', l: 'ARM' },
                                                            { k: 'pase', l: 'PAS' }
                                                        ].map(stat => (
                                                            <div key={stat.k} className="space-y-2">
                                                                <span className="block text-[9px] font-bold text-slate-600 uppercase text-center">{stat.l}</span>
                                                                <input
                                                                    type="number"
                                                                    value={editingItem.data.ratings?.[stat.k] || 0}
                                                                    onChange={(e) => setEditingItem({
                                                                        ...editingItem,
                                                                        data: {
                                                                            ...editingItem.data,
                                                                            ratings: { ...editingItem.data.ratings, [stat.k]: parseInt(e.target.value) }
                                                                        }
                                                                    })}
                                                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-1 text-center text-white focus:border-premium-gold/50 outline-none"
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* STARS SPECIFIC */}
                                        {editingItem.type === 'stars' && (
                                            <div className="space-y-8">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                    <div className="space-y-4">
                                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Precio de Fichaje (GP)</label>
                                                        <input
                                                            type="number"
                                                            value={editingItem.data.cost || 0}
                                                            onChange={(e) => setEditingItem({
                                                                ...editingItem,
                                                                data: { ...editingItem.data, cost: parseInt(e.target.value) }
                                                            })}
                                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-premium-gold/50 outline-none"
                                                        />
                                                    </div>
                                                    <div className="space-y-4">
                                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Key Habilidades</label>
                                                        <input
                                                            type="text"
                                                            value={Array.isArray(editingItem.data.skillKeys) ? editingItem.data.skillKeys.join(', ') : editingItem.data.skillKeys || ''}
                                                            onChange={(e) => setEditingItem({
                                                                ...editingItem,
                                                                data: { ...editingItem.data, skillKeys: e.target.value.split(',').map(s => s.trim()) }
                                                            })}
                                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-premium-gold/50 outline-none"
                                                            placeholder="Block, Dodge..."
                                                        />
                                                    </div>
                                                </div>

                                                {/* Stats for Stars */}
                                                <div className="space-y-4">
                                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Perfil de Atributos</label>
                                                    <div className="grid grid-cols-5 gap-4">
                                                        {['MV', 'FU', 'AG', 'PS', 'AR'].map(stat => (
                                                            <div key={stat} className="space-y-2">
                                                                <span className="block text-[9px] font-bold text-slate-600 uppercase text-center">{stat}</span>
                                                                <input
                                                                    type="text"
                                                                    value={editingItem.data.stats?.[stat] || ''}
                                                                    onChange={(e) => setEditingItem({
                                                                        ...editingItem,
                                                                        data: {
                                                                            ...editingItem.data,
                                                                            stats: { ...editingItem.data.stats, [stat]: e.target.value }
                                                                        }
                                                                    })}
                                                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-1 text-center text-white focus:border-premium-gold/50 outline-none font-display font-black"
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* SKILLS SPECIFIC (Bilingual) */}
                                        {editingItem.type === 'skills' && (
                                            <div className="grid grid-cols-1 gap-8">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-4">
                                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nombre (ES)</label>
                                                        <input
                                                            type="text"
                                                            value={editingItem.data.name_es || ''}
                                                            onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, name_es: e.target.value } })}
                                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-premium-gold/50 outline-none"
                                                        />
                                                    </div>
                                                    <div className="space-y-4">
                                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Name (EN)</label>
                                                        <input
                                                            type="text"
                                                            value={editingItem.data.name_en || ''}
                                                            onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, name_en: e.target.value } })}
                                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-premium-gold/50 outline-none"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-4">
                                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Descripción (ES)</label>
                                                        <textarea
                                                            value={editingItem.data.desc_es || ''}
                                                            onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, desc_es: e.target.value } })}
                                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-premium-gold/50 outline-none h-40 resize-none text-xs leading-relaxed"
                                                        />
                                                    </div>
                                                    <div className="space-y-4">
                                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Description (EN)</label>
                                                        <textarea
                                                            value={editingItem.data.desc_en || ''}
                                                            onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, desc_en: e.target.value } })}
                                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-premium-gold/50 outline-none h-40 resize-none text-xs leading-relaxed"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-4">
                                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Categoría</label>
                                                    <select
                                                        value={editingItem.data.category || 'General'}
                                                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, category: e.target.value } })}
                                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-premium-gold/50 outline-none"
                                                    >
                                                        {['General', 'Strength', 'Agility', 'Passing', 'Mutation', 'Trait'].map(c => <option key={c} value={c}>{c}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                        )}

                                        {/* INCENTIVOS SPECIFIC */}
                                        {editingItem.type === 'inducements' && (
                                            <div className="space-y-8">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-4">
                                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nombre</label>
                                                        <input
                                                            type="text"
                                                            value={editingItem.data.name || ''}
                                                            onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, name: e.target.value } })}
                                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-premium-gold/50 outline-none"
                                                        />
                                                    </div>
                                                    <div className="space-y-4">
                                                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Costo (GP)</label>
                                                        <input
                                                            type="number"
                                                            value={editingItem.data.cost || 0}
                                                            onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, cost: parseInt(e.target.value) } })}
                                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-premium-gold/50 outline-none"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-4">
                                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Descripción</label>
                                                    <textarea
                                                        value={editingItem.data.description || ''}
                                                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, description: e.target.value } })}
                                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-premium-gold/50 outline-none h-40 resize-none text-sm leading-relaxed"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* BILINGUAL SPECIAL RULES FOR TEAMS/STARS */}
                                        {(editingItem.type === 'teams' || editingItem.type === 'stars') && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="space-y-4">
                                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Reglas Especiales (ES)</label>
                                                    <textarea
                                                        value={editingItem.data.specialRules_es || ''}
                                                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, specialRules_es: e.target.value } })}
                                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-premium-gold/50 outline-none h-40 resize-none text-xs leading-relaxed"
                                                    />
                                                </div>
                                                <div className="space-y-4">
                                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Special Rules (EN)</label>
                                                    <textarea
                                                        value={editingItem.data.specialRules_en || ''}
                                                        onChange={(e) => setEditingItem({ ...editingItem, data: { ...editingItem.data, specialRules_en: e.target.value } })}
                                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-premium-gold/50 outline-none h-40 resize-none text-xs leading-relaxed"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                    </div>

                                    <div className="flex justify-end gap-6 pt-10 border-t border-white/5">
                                        <button
                                            type="button"
                                            onClick={() => setEditingItem(null)}
                                            className="px-10 py-4 rounded-2xl border border-white/10 text-slate-400 font-display font-black uppercase tracking-widest text-[10px] hover:bg-white/5 transition-all"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSaving}
                                            className="px-12 py-4 rounded-2xl bg-premium-gold text-black font-display font-black uppercase tracking-widest text-[10px] hover:shadow-[0_0_30px_rgba(202,138,4,0.4)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all flex items-center gap-3"
                                        >
                                            {isSaving && <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></span>}
                                            {isSaving ? 'Guardando...' : 'Confirmar Cambios'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style>{`
                 @keyframes fade-in-slow {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-slow {
                    animation: fade-in-slow 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(202, 138, 4, 0.2);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(202, 138, 4, 0.4);
                }
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                textarea::placeholder, input::placeholder {
                    opacity: 0.3;
                }
            `}</style>
        </div >
    );
};

export default AdminPanel;

