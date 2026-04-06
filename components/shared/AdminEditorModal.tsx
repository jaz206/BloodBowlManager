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
    activeTab: AdminTab;
    isSaving: boolean;
    language: string;
    skills: any[];
    arenaConfig: any;
    heraldoItems: any[];
    gitHubImages: any[];
    isLoadingGitHub: boolean;
    githubSearch: string;
    setGithubSearch: React.Dispatch<React.SetStateAction<string>>;
    validationIssues: string[];
    isImageExplorerExpanded: boolean;
    setIsImageExplorerExpanded: React.Dispatch<React.SetStateAction<boolean>>;
    activeTeamTab: 'general' | 'identidad' | 'roster' | 'nombres';
    setActiveTeamTab: React.Dispatch<React.SetStateAction<'general' | 'identidad' | 'roster' | 'nombres'>>;
    handleSave: (e: React.FormEvent) => void;
    filteredContent: any[];
    onSelectItem: (item: any) => void;
    setEditingItem: React.Dispatch<React.SetStateAction<{ type: AdminTab | 'hero'; data: any } | null>>;
};

const AdminEditorModal: React.FC<AdminEditorModalProps> = ({
    editingItem,
    tabs,
    activeTab,
    isSaving,
    language,
    skills,
    arenaConfig,
    heraldoItems,
    gitHubImages,
    isLoadingGitHub,
    githubSearch,
    setGithubSearch,
    validationIssues,
    isImageExplorerExpanded,
    setIsImageExplorerExpanded,
    activeTeamTab,
    setActiveTeamTab,
    handleSave,
    filteredContent,
    onSelectItem,
    setEditingItem,
}) => {
    if (!editingItem) return null;

    const showNavigator = ['teams', 'stars', 'skills', 'inducements', 'heraldo'].includes(editingItem.type);
    const currentItemKey = String(editingItem.data?.keyEN || editingItem.data?.name || editingItem.data?.title || '');
    const currentTitle = editingItem.type === 'hero'
        ? 'Configurar Fondo Hero'
        : editingItem.data.name || editingItem.data.title || editingItem.data.keyEN || 'Editor';
    const currentSubtitle = editingItem.type === 'hero'
        ? 'Ajusta la portada principal de Inicio.'
        : editingItem.type === 'teams'
            ? 'Edición completa de roster, identidad, imagen y pools de nombres.'
            : editingItem.type === 'stars'
                ? 'Edición completa de ficha, imagen, atributos y compatibilidad.'
                : editingItem.type === 'skills'
                    ? 'Edición bilingüe del Codex de habilidades.'
                    : editingItem.type === 'inducements'
                        ? 'Edición del catálogo de incentivos por idioma.'
                        : editingItem.type === 'heraldo'
                            ? 'Edición editorial del Heraldo.'
                            : 'Editor maestro';

    const getNavigatorLabel = (item: any) => item.name || item.title || item.keyEN || 'Sin título';
    const getNavigatorMeta = (item: any) => {
        if (editingItem.type === 'teams') return item.tier ? `Tier ${item.tier}` : 'Equipo';
        if (editingItem.type === 'stars') return item.cost ? `${Math.round(Number(item.cost) / 1000)}k MO` : 'Estrella';
        if (editingItem.type === 'skills') return item.category || 'Habilidad';
        if (editingItem.type === 'inducements') return item.cost ? `${Math.round(Number(item.cost) / 1000)}k MO` : 'Incentivo';
        if (editingItem.type === 'heraldo') return item.category || item.tag || 'Entrada';
        return '';
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[200] bg-[rgba(16,10,7,0.82)] backdrop-blur-xl p-4">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 24 }}
                    className="h-full w-full rounded-[2rem] overflow-hidden border border-[rgba(111,87,56,0.18)] bg-[radial-gradient(circle_at_top,rgba(255,248,233,0.98),rgba(226,194,142,0.88))] text-[#2b1d12] shadow-[0_30px_120px_rgba(0,0,0,0.55)] flex"
                >
                    {showNavigator && (
                        <aside className="w-[320px] shrink-0 border-r border-[rgba(111,87,56,0.14)] bg-[rgba(255,251,241,0.82)] flex flex-col">
                            <div className="px-6 py-6 border-b border-[rgba(111,87,56,0.12)]">
                                <p className="text-[9px] font-black text-gold uppercase tracking-[0.35em]">Mesa de edición</p>
                                <h3 className="mt-2 text-2xl font-header font-black italic uppercase tracking-tighter">
                                    {tabs.find(t => t.id === activeTab)?.label}
                                </h3>
                                <p className="mt-3 text-[11px] leading-relaxed text-[#7b6853]">
                                    Cambia de registro sin cerrar el editor. Todo el detalle vive a la derecha.
                                </p>
                            </div>
                            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 custom-scrollbar">
                                {filteredContent.map((item: any) => {
                                    const itemKey = String(item.keyEN || item.name || item.title || '');
                                    const isActive = itemKey === currentItemKey;
                                    return (
                                        <button
                                            key={`${editingItem.type}-${itemKey}`}
                                            type="button"
                                            onClick={() => onSelectItem(item)}
                                            className={`w-full text-left rounded-2xl border px-4 py-3 transition-all ${
                                                isActive
                                                    ? 'bg-gold/15 border-gold/40 shadow-[0_0_0_1px_rgba(202,138,4,0.18)]'
                                                    : 'bg-white/45 border-[rgba(111,87,56,0.10)] hover:border-gold/25 hover:bg-[rgba(255,251,241,0.96)]'
                                            }`}
                                        >
                                            <p className="text-[13px] font-black uppercase italic tracking-tight text-[#2b1d12] truncate">
                                                {getNavigatorLabel(item)}
                                            </p>
                                            <p className="mt-1 text-[9px] font-black uppercase tracking-[0.2em] text-[#8a7760] truncate">
                                                {getNavigatorMeta(item)}
                                            </p>
                                        </button>
                                    );
                                })}
                            </div>
                        </aside>
                    )}

                    <section className="flex-1 min-w-0 flex flex-col">
                        <div className="px-8 py-7 border-b border-[rgba(111,87,56,0.12)] bg-[rgba(255,251,241,0.72)] flex justify-between items-start gap-6">
                            <div className="min-w-0">
                                <span className="text-[10px] font-black text-gold uppercase tracking-[0.4em] mb-2 block">
                                    Editor de {tabs.find(t => t.id === (editingItem.type === 'hero' ? 'general' : editingItem.type))?.label}
                                </span>
                                <h3 className="text-3xl font-header font-black italic uppercase tracking-tighter leading-none text-[#2b1d12]">
                                    {currentTitle}
                                </h3>
                                <p className="mt-3 text-[12px] leading-relaxed text-[#6f5738] max-w-3xl">
                                    {currentSubtitle}
                                </p>
                                {showNavigator && (
                                    <p className="mt-3 text-[9px] font-black uppercase tracking-[0.28em] text-[#8a7760]">
                                        {filteredContent.length} registros visibles · cambio rápido activo
                                    </p>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => setEditingItem(null)}
                                className="shrink-0 w-14 h-14 rounded-full border border-[rgba(111,87,56,0.18)] flex items-center justify-center text-[#7b6853] hover:text-[#2b1d12] hover:border-gold hover:bg-white/60 transition-all"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar px-8 py-8 bg-[rgba(255,248,233,0.46)]">
                            <form onSubmit={handleSave} className="space-y-8 max-w-[1520px] mx-auto">
                                {validationIssues.length > 0 && (
                                    <div className="rounded-3xl border border-amber-500/30 bg-amber-500/10 p-5">
                                        <div className="flex items-start gap-3">
                                            <span className="material-symbols-outlined text-amber-600 mt-0.5">warning</span>
                                            <div>
                                                <p className="text-[10px] font-black text-amber-700 uppercase tracking-[0.3em] mb-2">
                                                    Faltan campos obligatorios
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {validationIssues.map((issue) => (
                                                        <span
                                                            key={issue}
                                                            className="px-3 py-1.5 rounded-xl bg-white/60 border border-amber-500/20 text-[#6f5738] text-[10px] font-bold"
                                                        >
                                                            {issue}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {editingItem.type === 'arena' && (
                                    <div className="space-y-10">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                            <div className="space-y-4">
                                                <h5 className="text-[10px] font-black text-premium-gold uppercase tracking-[0.3em] mb-4">Recompensas SPP</h5>
                                                <div className="space-y-4 bg-[rgba(255,251,241,0.82)] p-6 rounded-2xl border border-[rgba(111,87,56,0.12)]">
                                                    {Object.entries(editingItem.data.spp).map(([key, value]) => (
                                                        <div key={key} className="flex justify-between items-center gap-4">
                                                            <label className="text-[10px] font-bold text-[#7b6853] uppercase flex-1">{key}</label>
                                                            <input
                                                                type="number"
                                                                value={value as number}
                                                                onChange={(e) => setEditingItem({
                                                                    ...editingItem,
                                                                    data: {
                                                                        ...editingItem.data,
                                                                        spp: { ...editingItem.data.spp, [key]: parseInt(e.target.value) || 0 },
                                                                    },
                                                                })}
                                                                className="w-20 bg-[#fcf6ea] border border-[#d7c39a] rounded-lg px-2 py-1 text-center text-[#2b1d12] text-xs outline-none focus:border-premium-gold"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <h5 className="text-[10px] font-black text-green-700 uppercase tracking-[0.3em] mb-4">Parámetros económicos</h5>
                                                <div className="space-y-4 bg-[rgba(255,251,241,0.82)] p-6 rounded-2xl border border-[rgba(111,87,56,0.12)]">
                                                    {Object.entries(editingItem.data.economics).map(([key, value]) => (
                                                        <div key={key} className="flex justify-between items-center gap-4">
                                                            <label className="text-[10px] font-bold text-[#7b6853] uppercase flex-1">{key.replace(/_/g, ' ')}</label>
                                                            <input
                                                                type="number"
                                                                value={value as number}
                                                                onChange={(e) => setEditingItem({
                                                                    ...editingItem,
                                                                    data: {
                                                                        ...editingItem.data,
                                                                        economics: { ...editingItem.data.economics, [key]: parseInt(e.target.value) || 0 },
                                                                    },
                                                                })}
                                                                className="w-24 bg-[#fcf6ea] border border-[#d7c39a] rounded-lg px-2 py-1 text-center text-[#2b1d12] text-xs outline-none focus:border-green-500"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h5 className="text-[10px] font-black text-sky-600 uppercase tracking-[0.3em] mb-4">Lógica de datos</h5>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-[rgba(255,251,241,0.82)] p-6 rounded-2xl border border-[rgba(111,87,56,0.12)]">
                                                {Object.entries(editingItem.data.dice).map(([key, value]) => (
                                                    <div key={key} className="space-y-2">
                                                        <label className="text-[10px] font-bold text-[#7b6853] uppercase block text-center italic">{key}</label>
                                                        <input
                                                            type="text"
                                                            value={value as string}
                                                            onChange={(e) => setEditingItem({
                                                                ...editingItem,
                                                                data: {
                                                                    ...editingItem.data,
                                                                    dice: { ...editingItem.data.dice, [key]: e.target.value },
                                                                },
                                                            })}
                                                            className="w-full bg-[#fcf6ea] border border-[#d7c39a] rounded-xl py-2 px-4 text-center text-[#2b1d12] text-xs font-black outline-none focus:border-sky-500"
                                                            placeholder="Ej: 1D3"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {editingItem.type === 'hero' && (
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-end">
                                            <label className="block text-[10px] font-black text-[#7b6853] uppercase tracking-widest ml-1">Origen de la imagen</label>
                                            <span className="text-[9px] font-bold text-premium-gold/70 uppercase tracking-tighter">Fondo hero</span>
                                        </div>

                                        <div className="relative">
                                            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center px-8 opacity-20 pointer-events-none">
                                                <div className="h-px w-full bg-white/50"></div>
                                                <span className="mx-4 text-[9px] font-black uppercase tracking-widest bg-[#f8f0e3] px-2 whitespace-nowrap text-[#7b6853]">O introduce URL manual</span>
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
                                                            data: { ...editingItem.data, url: val },
                                                        });
                                                    }}
                                                    className="w-full bg-[#fcf6ea] border border-[#d7c39a] rounded-2xl py-4 px-6 text-[10px] text-[#5f4d39] font-mono focus:border-premium-gold/50 outline-none transition-all"
                                                    placeholder="URL personalizada..."
                                                />
                                            </div>
                                            <div className="w-24 h-16 rounded-2xl border border-[#d7c39a] bg-[#f7efe1] overflow-hidden flex-shrink-0 flex items-center justify-center">
                                                {editingItem.data.url ? (
                                                    <img src={editingItem.data.url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="material-symbols-outlined text-[#c8b79e]">image_not_supported</span>
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

                                {editingItem.type === 'skills' && (
                                    <AdminSkillsForm editingItem={editingItem} setEditingItem={setEditingItem} />
                                )}

                                {editingItem.type === 'inducements' && (
                                    <AdminInducementForm editingItem={editingItem} setEditingItem={setEditingItem} />
                                )}

                                {editingItem.type === 'heraldo' && (
                                    <AdminHeraldoForm editingItem={editingItem} setEditingItem={setEditingItem} />
                                )}

                                <div className="sticky bottom-0 pt-6">
                                    <div className="rounded-[2rem] border border-[rgba(111,87,56,0.12)] bg-[rgba(255,251,241,0.92)] backdrop-blur px-6 py-5 flex flex-wrap items-center justify-between gap-4">
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-[0.28em] text-[#7b6853]">Edición activa</p>
                                            <p className="mt-1 text-[12px] font-black uppercase tracking-tight text-[#2b1d12]">
                                                {currentTitle}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <button
                                                type="button"
                                                onClick={() => setEditingItem(null)}
                                                className="px-8 py-4 rounded-2xl border border-[rgba(111,87,56,0.14)] text-[#6f5738] font-display font-black uppercase tracking-widest text-[10px] hover:bg-white/60 transition-all"
                                            >
                                                Cerrar editor
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isSaving || validationIssues.length > 0}
                                                className="px-10 py-4 rounded-2xl bg-premium-gold text-black font-display font-black uppercase tracking-widest text-[10px] hover:shadow-[0_0_30px_rgba(202,138,4,0.25)] hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-3"
                                            >
                                                {isSaving && <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></span>}
                                                {isSaving ? 'Guardando...' : validationIssues.length > 0 ? 'Completa los campos obligatorios' : 'Confirmar cambios'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </section>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default AdminEditorModal;
