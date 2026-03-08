import React, { useState } from 'react';
import { useMasterData } from '../../hooks/useMasterData';
import { db } from '../../firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';
import SearchIcon from '../icons/SearchIcon';

const AdminPanel: React.FC = () => {
    const { teams, starPlayers, heroImage, updateHeroImage, loading, refresh } = useMasterData();
    const [searchTerm, setSearchTerm] = useState('');
    const [editingItem, setEditingItem] = useState<{ type: 'team' | 'starPlayer' | 'hero', data: any } | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const filteredTeams = teams.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredStars = starPlayers.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingItem) return;
        setIsSaving(true);
        try {
            if (editingItem.type === 'hero') {
                await updateHeroImage(editingItem.data.url);
                alert('Imagen de fondo actualizada con éxito.');
                setEditingItem(null);
                return;
            }
            const collectionName = editingItem.type === 'team' ? 'teams_master' : 'star_players_master';
            const docId = editingItem.data.id || editingItem.data.name;
            const docRef = doc(db, collectionName, docId);

            const { id, ...dataToSave } = editingItem.data;
            await updateDoc(docRef, dataToSave);
            alert('Cambios guardados con éxito.');
            setEditingItem(null);
            refresh();
        } catch (error) {
            console.error('Error saving master data:', error);
            alert('Error al guardar: ' + (error instanceof Error ? error.message : 'Desconocido'));
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center p-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-premium-gold"></div>
        </div>
    );

    return (
        <div className="p-4 sm:p-8 animate-fade-in-slow max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                <div>
                    <h2 className="text-4xl font-display font-black text-white italic tracking-tighter uppercase">Panel de Control de Nuffle</h2>
                    <p className="text-premium-gold font-display font-bold uppercase tracking-widest text-xs mt-2">Área de Administración de Datos Maestros</p>
                </div>
                <div className="flex flex-wrap gap-4">
                    <button
                        onClick={() => setEditingItem({ type: 'hero', data: { url: heroImage || '' } })}
                        className="px-6 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-display font-bold uppercase tracking-widest text-[10px] hover:bg-premium-gold hover:text-black transition-all"
                    >
                        Cambiar Fondo Portada
                    </button>
                    <button
                        onClick={() => {
                            if (window.confirm('¿Estás seguro de que quieres sobreescribir los datos de Firestore con los archivos estáticos del proyecto?')) {
                                useMasterData().syncMasterData();
                                alert('Sincronización iniciada.');
                            }
                        }}
                        className="px-6 py-2 rounded-xl bg-blood-red/20 border border-blood-red/30 text-blood-red font-display font-bold uppercase tracking-widest text-[10px] hover:bg-blood-red hover:text-white transition-all"
                    >
                        Sincronizar Datos Estáticos
                    </button>
                </div>
            </div>

            {/* General Settings Section */}
            <div className="mb-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6 flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-premium-gold/10 rounded-xl flex items-center justify-center text-premium-gold font-bold">
                            <span className="material-symbols-outlined">image</span>
                        </div>
                        <div>
                            <p className="font-display font-bold text-white uppercase tracking-wider text-sm">Fondo de Bienvenida</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase">Personaliza la imagen principal</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setEditingItem({ type: 'hero', data: { url: heroImage || '' } })}
                        className="px-4 py-2 rounded-lg bg-premium-gold/10 border border-premium-gold/30 text-premium-gold group-hover:bg-premium-gold group-hover:text-black font-display font-bold text-[10px] uppercase tracking-widest transition-all"
                    >
                        {heroImage ? 'Modificar' : 'Subir'}
                    </button>
                </div>
            </div>

            <div className="mb-8 relative max-w-md">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <SearchIcon className="h-5 w-5 text-slate-500" />
                </div>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar facción o jugador estrella..."
                    className="block w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-premium-gold/50 shadow-2xl transition-all"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <section>
                    <h3 className="text-xl font-display font-bold text-premium-gold mb-6 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-8 h-8 bg-premium-gold/10 rounded-lg flex items-center justify-center text-sm italic">F</span>
                        Facciones ({filteredTeams.length})
                    </h3>
                    <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                        {filteredTeams.map(team => (
                            <div key={team.name} className="flex justify-between items-center p-4 bg-white/5 border border-white/5 rounded-xl hover:border-white/20 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded bg-black/40 border border-white/10 overflow-hidden flex-shrink-0">
                                        <img src={team.image} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all font-bold" />
                                    </div>
                                    <span className="font-display font-bold text-white uppercase tracking-wider text-sm">{team.name}</span>
                                </div>
                                <button
                                    onClick={() => setEditingItem({ type: 'team', data: { ...team } })}
                                    className="px-4 py-2 rounded-lg bg-white/5 hover:bg-premium-gold hover:text-black font-display font-bold text-[10px] uppercase tracking-widest transition-all"
                                >
                                    Editar
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                <section>
                    <h3 className="text-xl font-display font-bold text-premium-gold mb-6 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-8 h-8 bg-premium-gold/10 rounded-lg flex items-center justify-center text-sm italic">S</span>
                        Jugadores Estrella ({filteredStars.length})
                    </h3>
                    <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                        {filteredStars.map(star => (
                            <div key={star.name} className="flex justify-between items-center p-4 bg-white/5 border border-white/5 rounded-xl hover:border-white/20 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded bg-black/40 border border-white/10 overflow-hidden flex-shrink-0">
                                        <img src={star.image} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all font-bold" />
                                    </div>
                                    <span className="font-display font-bold text-white uppercase tracking-wider text-sm">{star.name}</span>
                                </div>
                                <button
                                    onClick={() => setEditingItem({ type: 'starPlayer', data: { ...star } })}
                                    className="px-4 py-2 rounded-lg bg-white/5 hover:bg-premium-gold hover:text-black font-display font-bold text-[10px] uppercase tracking-widest transition-all"
                                >
                                    Editar
                                </button>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {editingItem && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[110] p-4 animate-in fade-in duration-300">
                    <div className="bg-slate-900 border border-white/10 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/40">
                            <h3 className="text-xl font-display font-black text-premium-gold uppercase tracking-widest italic leading-none">
                                {editingItem.type === 'hero' ? 'Configurar Fondo Hero' : `Editar ${editingItem.type === 'team' ? 'Facción' : 'Estrella'}: ${editingItem.data.name}`}
                            </h3>
                            <button onClick={() => setEditingItem(null)} className="text-slate-500 hover:text-white transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-8 space-y-6">
                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="block text-[10px] font-display font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">URL de la Imagen (Pinterest/GitHub/Firebase)</label>
                                    <input
                                        type="text"
                                        value={editingItem.type === 'hero' ? editingItem.data.url : (editingItem.data.image || editingItem.data.crestImage || '')}
                                        onChange={(e) => setEditingItem({
                                            ...editingItem,
                                            data: { ...editingItem.data, [editingItem.type === 'hero' ? 'url' : (editingItem.type === 'team' ? 'image' : 'image')]: e.target.value }
                                        })}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-premium-gold/50 outline-none transition-all"
                                    />
                                    {(editingItem.type === 'hero' ? editingItem.data.url : editingItem.data.image) && (
                                        <div className="mt-4 w-full aspect-video rounded-xl bg-black/40 border border-white/10 overflow-hidden shadow-2xl">
                                            <img src={editingItem.type === 'hero' ? editingItem.data.url : editingItem.data.image} alt="Vista previa" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                </div>

                                {editingItem.type === 'team' && (
                                    <div>
                                        <label className="block text-[10px] font-display font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Reglas Especiales</label>
                                        <textarea
                                            value={editingItem.data.specialRules || ''}
                                            onChange={(e) => setEditingItem({
                                                ...editingItem,
                                                data: { ...editingItem.data, specialRules: e.target.value }
                                            })}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-premium-gold/50 outline-none transition-all h-24"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setEditingItem(null)}
                                    className="px-6 py-3 rounded-xl border border-white/10 text-slate-400 font-display font-bold uppercase tracking-widest text-[10px] hover:bg-white/5 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-8 py-3 rounded-xl bg-premium-gold text-black font-display font-black uppercase tracking-widest text-[10px] hover:scale-105 active:scale-95 shadow-xl shadow-premium-gold/20 disabled:opacity-50"
                                >
                                    {isSaving ? 'Guardando...' : 'Confirmar Cambios'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                 @keyframes fade-in-slow {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-slow {
                    animation: fade-in-slow 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.05);
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(202, 138, 4, 0.2);
                    border-radius: 10px;
                }
            `}</style>
        </div>
    );
};

export default AdminPanel;
