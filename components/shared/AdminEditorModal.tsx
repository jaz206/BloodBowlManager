import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import AdminTeamForm from './AdminTeamForm';
import AdminStarForm from './AdminStarForm';
import AdminSkillsForm from './AdminSkillsForm';
import AdminInducementForm from './AdminInducementForm';
import AdminHeraldoForm from './AdminHeraldoForm';

type AdminTab = 'general' | 'heraldo' | 'arena' | 'teams' | 'stars' | 'skills' | 'inducements';

type AdminEditorModalProps = {
    editingItem: { type: AdminTab | 'hero'; data: any } | null;
    tabs: { id: AdminTab; label: string; icon: string }[];
    isSaving: boolean;
    language: string;
    skills: any[];
    arenaConfig: any;
    heraldoItems: any[];
    gitHubImages: any[];
    isLoadingGitHub: boolean;
    githubSearch: string;
    setGithubSearch: React.Dispatch<React.SetStateAction<string>>;
    isImageExplorerExpanded: boolean;
    setIsImageExplorerExpanded: React.Dispatch<React.SetStateAction<boolean>>;
    activeTeamTab: 'general' | 'identidad' | 'roster' | 'nombres';
    setActiveTeamTab: React.Dispatch<React.SetStateAction<'general' | 'identidad' | 'roster' | 'nombres'>>;
    handleSave: (e: React.FormEvent) => void;
    setEditingItem: React.Dispatch<React.SetStateAction<{ type: AdminTab | 'hero'; data: any } | null>>;
};

const AdminEditorModal: React.FC<AdminEditorModalProps> = ({
    editingItem,
    tabs,
    isSaving,
    language,
    skills,
    arenaConfig,
    heraldoItems,
    gitHubImages,
    isLoadingGitHub,
    githubSearch,
    setGithubSearch,
    isImageExplorerExpanded,
    setIsImageExplorerExpanded,
    activeTeamTab,
    setActiveTeamTab,
    handleSave,
    setEditingItem,
}) => {
    if (!editingItem) return null;

    return (
        <>
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

                                        {/* ARENA CONFIG EDITOR */}
                                        {editingItem.type === 'arena' && (
                                            <div className="space-y-10">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                                    {/* SPP */}
                                                    <div className="space-y-4">
                                                        <h5 className="text-[10px] font-black text-premium-gold uppercase tracking-[0.3em] mb-4">Recompensas SPP</h5>
                                                        <div className="space-y-4 bg-black/40 p-6 rounded-2xl border border-white/5">
                                                            {Object.entries(editingItem.data.spp).map(([key, value]) => (
                                                                <div key={key} className="flex justify-between items-center gap-4">
                                                                    <label className="text-[10px] font-bold text-slate-500 uppercase flex-1">{key}</label>
                                                                    <input 
                                                                        type="number"
                                                                        value={value as number}
                                                                        onChange={(e) => setEditingItem({
                                                                            ...editingItem,
                                                                            data: {
                                                                                ...editingItem.data,
                                                                                spp: { ...editingItem.data.spp, [key]: parseInt(e.target.value) || 0 }
                                                                            }
                                                                        })}
                                                                        className="w-20 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-center text-white text-xs outline-none focus:border-premium-gold"
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Economics */}
                                                    <div className="space-y-4">
                                                        <h5 className="text-[10px] font-black text-green-500 uppercase tracking-[0.3em] mb-4">ParÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡metros EconÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³micos</h5>
                                                        <div className="space-y-4 bg-black/40 p-6 rounded-2xl border border-white/5">
                                                            {Object.entries(editingItem.data.economics).map(([key, value]) => (
                                                                <div key={key} className="flex justify-between items-center gap-4">
                                                                    <label className="text-[10px] font-bold text-slate-500 uppercase flex-1">{key.replace(/_/g, ' ')}</label>
                                                                    <input 
                                                                        type="number"
                                                                        value={value as number}
                                                                        onChange={(e) => setEditingItem({
                                                                            ...editingItem,
                                                                            data: {
                                                                                ...editingItem.data,
                                                                                economics: { ...editingItem.data.economics, [key]: parseInt(e.target.value) || 0 }
                                                                            }
                                                                        })}
                                                                        className="w-24 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-center text-white text-xs outline-none focus:border-green-500"
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Dice */}
                                                <div className="space-y-4">
                                                    <h5 className="text-[10px] font-black text-sky-500 uppercase tracking-[0.3em] mb-4">LÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³gica de Dados</h5>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-black/40 p-6 rounded-2xl border border-white/5">
                                                        {Object.entries(editingItem.data.dice).map(([key, value]) => (
                                                            <div key={key} className="space-y-2">
                                                                <label className="text-[10px] font-bold text-slate-500 uppercase block text-center italic">{key}</label>
                                                                <input 
                                                                    type="text"
                                                                    value={value as string}
                                                                    onChange={(e) => setEditingItem({
                                                                        ...editingItem,
                                                                        data: {
                                                                            ...editingItem.data,
                                                                            dice: { ...editingItem.data.dice, [key]: e.target.value }
                                                                        }
                                                                    })}
                                                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-center text-white text-xs font-black outline-none focus:border-sky-500"
                                                                    placeholder="Ej: 1D3"
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* HERO BACKGROUND URL */}
                                        {editingItem.type === 'hero' && (
                                            <div className="space-y-6">
                                                <div className="flex justify-between items-end">
                                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Origen de la Imagen</label>
                                                    <span className="text-[9px] font-bold text-premium-gold/50 uppercase tracking-tighter">Fondo hero</span>
                                                </div>

                                                <div className="relative">
                                                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center px-8 opacity-20 pointer-events-none">
                                                        <div className="h-px w-full bg-white/50"></div>
                                                        <span className="mx-4 text-[9px] font-black uppercase tracking-widest bg-zinc-950 px-2 whitespace-nowrap">O introduce URL manual</span>
                                                        <div className="h-px w-full bg-white/50"></div>
                                                    </div>
                                                    <div className="h-10"></div>
                                                </div>

                                                <div className="flex gap-4 items-center">
                                                    <div className="grow">
                                                        <input
                                                            type="text"
                                                            value={editingItem.data.url || ''}
                                                            onChange={(e) => {
                                                                const val = e.target.value;
                                                                setEditingItem({
                                                                    ...editingItem,
                                                                    data: { ...editingItem.data, url: val }
                                                                });
                                                            }}
                                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-[10px] text-slate-400 font-mono focus:border-premium-gold/50 outline-none transition-all"
                                                            placeholder="URL personalizada..."
                                                        />
                                                    </div>
                                                    <div className="w-24 h-16 rounded-2xl border border-white/10 bg-black overflow-hidden flex-shrink-0 flex items-center justify-center">
                                                        {editingItem.data.url ? (
                                                            <img src={editingItem.data.url} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="material-symbols-outlined text-white/10">image_not_supported</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {editingItem.type === 'teams' && (
                                            <AdminTeamForm
                                                editingItem={editingItem}
                                                skills={skills}
                                                language={language}
                                                activeTeamTab={activeTeamTab}
                                                setActiveTeamTab={setActiveTeamTab}
                                                setEditingItem={setEditingItem}
                                                isImageExplorerExpanded={isImageExplorerExpanded}
                                                setIsImageExplorerExpanded={setIsImageExplorerExpanded}
                                                gitHubImages={gitHubImages}
                                                isLoadingGitHub={isLoadingGitHub}
                                                githubSearch={githubSearch}
                                                setGithubSearch={setGithubSearch}
                                            />
                                        )}
                                        {editingItem.type === 'stars' && (
                                            <AdminStarForm
                                                editingItem={editingItem}
                                                skills={skills}
                                                language={language}
                                                setEditingItem={setEditingItem}
                                                isImageExplorerExpanded={isImageExplorerExpanded}
                                                setIsImageExplorerExpanded={setIsImageExplorerExpanded}
                                                gitHubImages={gitHubImages}
                                                isLoadingGitHub={isLoadingGitHub}
                                                githubSearch={githubSearch}
                                                setGithubSearch={setGithubSearch}
                                            />
                                        )}
                                        {/* SKILLS SPECIFIC (Bilingual) */}
                                        {editingItem.type === 'skills' && (
                                            <AdminSkillsForm editingItem={editingItem} setEditingItem={setEditingItem} />
                                        )}

                                        {editingItem.type === 'inducements' && (
                                            <AdminInducementForm editingItem={editingItem} setEditingItem={setEditingItem} />
                                        )}

                                        {editingItem.type === 'heraldo' && (
                                            <AdminHeraldoForm editingItem={editingItem} setEditingItem={setEditingItem} />
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
        </>
    );
};

export default AdminEditorModal;

