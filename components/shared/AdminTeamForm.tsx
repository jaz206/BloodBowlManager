import React from 'react';
import AdminGitHubImagePicker from './AdminGitHubImagePicker';
import { getTeamLogoFilename, getTeamLogoUrl, resolveTeamLogoPreference } from '../../utils/imageUtils';

type AdminTeamFormProps = {
    editingItem: any;
    skills: any[];
    language: string;
    activeTeamTab: 'general' | 'identidad' | 'roster' | 'nombres';
    setActiveTeamTab: React.Dispatch<React.SetStateAction<'general' | 'identidad' | 'roster' | 'nombres'>>;
    setEditingItem: React.Dispatch<React.SetStateAction<any>>;
    isImageExplorerExpanded: boolean;
    setIsImageExplorerExpanded: React.Dispatch<React.SetStateAction<boolean>>;
    gitHubImages: any[];
    isLoadingGitHub: boolean;
    githubSearch: string;
    setGithubSearch: React.Dispatch<React.SetStateAction<string>>;
};

const TEAM_FACTIONS = [
    'Old World Classic',
    'Worlds Edge Superleague',
    'Lustrian Superleague',
    'Badlands Brawl',
    'Favoured of Nurgle',
    'Favoured of Slaanesh',
    'Favoured of Khorne',
    'Favoured of Tzeentch',
    'Underworld Challenge',
    'Sylvanian Spotlight',
    'Elven Kingdoms League',
];

const TEAM_STATS = [
    { k: 'fuerza', l: 'FUE' },
    { k: 'agilidad', l: 'AGI' },
    { k: 'velocidad', l: 'VEL' },
    { k: 'armadura', l: 'ARM' },
    { k: 'pase', l: 'PAS' },
];

const ROSTER_STATS = ['MV', 'FU', 'AG', 'PA', 'AR'];

const AdminTeamForm: React.FC<AdminTeamFormProps> = ({
    editingItem,
    skills,
    language,
    activeTeamTab,
    setActiveTeamTab,
    setEditingItem,
    isImageExplorerExpanded,
    setIsImageExplorerExpanded,
    gitHubImages,
    isLoadingGitHub,
    githubSearch,
    setGithubSearch,
}) => {
    const currentImage = resolveTeamLogoPreference(
        editingItem.data.name || '',
        editingItem.data.image || editingItem.data.crestImage || ''
    );
    const suggestedImage = getTeamLogoUrl(editingItem.data.name || '');
    const expectedFilename = getTeamLogoFilename(editingItem.data.name || '');

    const updateTeamImage = (url: string) => {
        setEditingItem({
            ...editingItem,
            data: { ...editingItem.data, image: url, crestImage: url },
        });
    };

    return (
        <>
        <div className="space-y-6">
            <label className="block text-[10px] font-black text-[#7b6853] uppercase tracking-widest ml-1">Origen de la imagen</label>
                <AdminGitHubImagePicker
                    title="Explorador de GitHub"
                    helperText="Haz clic para buscar imágenes en el repositorio"
                    isExpanded={isImageExplorerExpanded}
                    setIsExpanded={setIsImageExplorerExpanded}
                    search={githubSearch}
                    setSearch={setGithubSearch}
                    images={gitHubImages}
                    isLoading={isLoadingGitHub}
                    currentImage={currentImage}
                    onPick={updateTeamImage}
                />

                <div className="relative">
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center px-8 opacity-20 pointer-events-none">
                        <div className="h-px w-full bg-white/50"></div>
                        <span className="mx-4 text-[9px] font-black uppercase tracking-widest bg-[#f4ead7] px-2 whitespace-nowrap text-[#7b6853]">
                            O introduce URL manual
                        </span>
                        <div className="h-px w-full bg-white/50"></div>
                    </div>
                    <div className="h-10"></div>
                </div>

                <div className="flex gap-4 items-center">
                    <div className="grow">
                        <input
                            type="text"
                            value={currentImage}
                            onChange={(e) => updateTeamImage(e.target.value)}
                            className="w-full bg-[#fcf6ea] border border-[#d7c39a] rounded-2xl py-4 px-6 text-[10px] text-[#5f4d39] font-mono focus:border-premium-gold/50 outline-none transition-all"
                            placeholder="URL personalizada..."
                        />
                    </div>
                    <div className="w-24 h-16 rounded-2xl border border-[#d7c39a] bg-[#f7efe1] overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {currentImage || suggestedImage ? (
                            <img
                                src={currentImage || suggestedImage}
                                alt=""
                                onError={(e) => {
                                    const fallback = suggestedImage;
                                    if ((e.currentTarget as HTMLImageElement).src !== fallback) {
                                        (e.currentTarget as HTMLImageElement).src = fallback;
                                    }
                                }}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="material-symbols-outlined text-white/10">image_not_supported</span>
                        )}
                    </div>
                </div>

                <div className="rounded-2xl border border-[#e3cfaa] bg-[#fcf6ea] px-5 py-4">
                    <p className="text-[9px] font-black uppercase tracking-[0.28em] text-gold">Escudo esperado en GitHub</p>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                        <span className="px-3 py-2 rounded-xl bg-[#fffaf1] border border-[#d7c39a] text-[10px] font-mono font-bold text-[#2b1d12]">
                            {expectedFilename}
                        </span>
                        <span className="text-[10px] font-bold text-[#7b6853]">
                            Carpeta: <span className="font-mono text-[#2b1d12]">Escudos</span>
                        </span>
                    </div>
                    <p className="mt-3 text-[10px] leading-relaxed text-[#7b6853]">
                        Este es el PNG base que se usará por defecto para la raza. Si luego el jugador cambia el escudo, ese override pasará a ser el visible en su franquicia.
                    </p>
                </div>
            </div>

            <div className="space-y-6 mt-8">
                <div className="flex flex-wrap gap-2 p-1.5 bg-[#f6e9d0] border border-[#dfcaa7] rounded-2xl w-fit">
                    {(['general', 'identidad', 'roster', 'nombres'] as const).map(tab => (
                        <button
                            key={tab}
                            type="button"
                            onClick={() => setActiveTeamTab(tab)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTeamTab === tab
                                ? 'bg-premium-gold text-black shadow-lg shadow-premium-gold/20'
                                : 'text-[#7b6853] hover:text-[#2b1d12] hover:bg-white/40'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {activeTeamTab === 'general' && (
                    <div className="space-y-8 animate-fade-in-up">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-[#fcf6ea] p-6 rounded-[2rem] border border-[#e3cfaa]">
                            <div className="space-y-4">
                                <label className="block text-[10px] font-black text-[#7b6853] uppercase tracking-widest ml-1">Costo segunda tirada</label>
                                <input
                                    type="number"
                                    value={editingItem.data.rerollCost || 0}
                                    onChange={(e) => setEditingItem({
                                        ...editingItem,
                                        data: { ...editingItem.data, rerollCost: parseInt(e.target.value) || 0 },
                                    })}
                                    className="w-full bg-[#fcf6ea] border border-[#d7c39a] rounded-2xl py-4 px-6 text-[#2b1d12] text-sm focus:border-premium-gold/50 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-4">
                                <label className="block text-[10px] font-black text-[#7b6853] uppercase tracking-widest ml-1">Tier (nivel)</label>
                                <select
                                    value={editingItem.data.tier || 1}
                                    onChange={(e) => setEditingItem({
                                        ...editingItem,
                                        data: { ...editingItem.data, tier: parseInt(e.target.value) },
                                    })}
                                    className="w-full bg-[#fcf6ea] border border-[#d7c39a] rounded-2xl py-4 px-6 text-[#2b1d12] focus:border-premium-gold/50 outline-none"
                                >
                                    {[1, 2, 3].map(t => <option key={t} value={t}>Tier {t}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="block text-[10px] font-black text-[#7b6853] uppercase tracking-widest ml-1">Ligas y alianzas</label>
                            <div className="flex flex-wrap gap-2 p-6 bg-[#fcf6ea] border border-[#e3cfaa] rounded-[2rem]">
                                {TEAM_FACTIONS.map(faction => {
                                    const isSelected = (editingItem.data.megaFactions || []).includes(faction);
                                    return (
                                        <button
                                            key={faction}
                                            type="button"
                                            onClick={() => {
                                                const current = editingItem.data.megaFactions || [];
                                                const next = isSelected
                                                    ? current.filter((f: string) => f !== faction)
                                                    : [...current, faction];
                                                setEditingItem({
                                                    ...editingItem,
                                                    data: { ...editingItem.data, megaFactions: next },
                                                });
                                            }}
                                            className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${isSelected
                                                ? 'bg-premium-gold/20 text-premium-gold border-premium-gold/30'
                                                : 'bg-white text-[#8a7760] border-[#e3cfaa] hover:border-gold/30 hover:text-[#2b1d12]'
                                                }`}
                                        >
                                            {faction}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="block text-[10px] font-black text-[#7b6853] uppercase tracking-widest ml-1">Ratings de facción</label>
                            <div className="grid grid-cols-5 gap-3 bg-[#fcf6ea] p-6 rounded-2xl border border-[#e3cfaa]">
                                {TEAM_STATS.map(stat => (
                                    <div key={stat.k} className="space-y-1">
                                        <span className="block text-[8px] font-bold text-[#8a7760] uppercase text-center">{stat.l}</span>
                                        <input
                                            type="number"
                                            value={editingItem.data.ratings?.[stat.k] || 0}
                                            onChange={(e) => setEditingItem({
                                                ...editingItem,
                                                data: {
                                                    ...editingItem.data,
                                                    ratings: { ...editingItem.data.ratings, [stat.k]: parseInt(e.target.value) || 0 },
                                                },
                                            })}
                                            className="w-full bg-[#f8f0e3] border border-[#d7c39a] rounded-xl py-2 px-1 text-center text-[#2b1d12] focus:border-premium-gold/50 outline-none text-[10px]"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTeamTab === 'identidad' && (
                    <div className="space-y-8 animate-fade-in-up">
                        <div className="space-y-4">
                            <label className="block text-[10px] font-black text-[#7b6853] uppercase tracking-widest ml-1">Biografía y trasfondo de la facción</label>
                            <textarea
                                value={editingItem.data.description || ''}
                                onChange={(e) => setEditingItem({
                                    ...editingItem,
                                    data: { ...editingItem.data, description: e.target.value },
                                })}
                                className="w-full bg-[#fcf6ea] border border-[#d7c39a] rounded-2xl py-4 px-6 text-[#2b1d12] focus:border-premium-gold/50 outline-none h-64 resize-none text-[11px] leading-relaxed transition-all"
                                placeholder="Describe aquí el trasfondo de esta raza en el mundo de Blood Bowl..."
                            />
                        </div>
                    </div>
                )}

                {activeTeamTab === 'roster' && (
                    <div className="space-y-6 animate-fade-in-up">
                        <div className="flex justify-between items-center px-1">
                            <label className="block text-[10px] font-black text-[#7b6853] uppercase tracking-widest">Roster de jugadores</label>
                            <button
                                type="button"
                                onClick={() => {
                                    const newPlayer = {
                                        qty: '0-16',
                                        position: 'Linea',
                                        cost: 50000,
                                        stats: { MV: 6, FU: '3', AG: '3+', PA: '4+', AR: '9+' },
                                        skillKeys: [],
                                        primary: 'G',
                                        secondary: 'A, S',
                                    };
                                    setEditingItem({
                                        ...editingItem,
                                        data: { ...editingItem.data, roster: [...(editingItem.data.roster || []), newPlayer] },
                                    });
                                }}
                                className="text-premium-gold hover:text-white transition-colors flex items-center gap-1 text-[9px] font-black uppercase tracking-widest"
                            >
                                <span className="material-symbols-outlined text-sm">add</span> Añadir posición
                            </button>
                        </div>

                        <div className="space-y-4">
                            {(editingItem.data.roster || []).map((player: any, idx: number) => (
                                <div key={idx} className="bg-[#fcf6ea] border border-[#e3cfaa] rounded-[1.75rem] p-5 space-y-4">
                                    <div className="flex justify-between gap-4">
                                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            <Field label="Posicion">
                                                <input
                                                    type="text"
                                                    value={player.position}
                                                    onChange={(e) => {
                                                        const newRoster = [...editingItem.data.roster];
                                                        newRoster[idx] = { ...newRoster[idx], position: e.target.value };
                                                        setEditingItem({ ...editingItem, data: { ...editingItem.data, roster: newRoster } });
                                                    }}
                                                    className="w-full bg-[#fffaf1] border border-[#d7c39a] rounded-xl px-4 py-2 text-xs text-[#2b1d12] outline-none focus:border-premium-gold/30"
                                                />
                                            </Field>
                                            <Field label="Cantidad">
                                                <input
                                                    type="text"
                                                    value={player.qty}
                                                    onChange={(e) => {
                                                        const newRoster = [...editingItem.data.roster];
                                                        newRoster[idx] = { ...newRoster[idx], qty: e.target.value };
                                                        setEditingItem({ ...editingItem, data: { ...editingItem.data, roster: newRoster } });
                                                    }}
                                                    className="w-full bg-[#fffaf1] border border-[#d7c39a] rounded-xl px-4 py-2 text-xs text-[#2b1d12] outline-none focus:border-premium-gold/30"
                                                />
                                            </Field>
                                            <Field label="Costo (MO)">
                                                <input
                                                    type="number"
                                                    value={player.cost}
                                                    onChange={(e) => {
                                                        const newRoster = [...editingItem.data.roster];
                                                        newRoster[idx] = { ...newRoster[idx], cost: parseInt(e.target.value) || 0 };
                                                        setEditingItem({ ...editingItem, data: { ...editingItem.data, roster: newRoster } });
                                                    }}
                                                    className="w-full bg-[#fffaf1] border border-[#d7c39a] rounded-xl px-4 py-2 text-xs text-[#2b1d12] outline-none focus:border-premium-gold/30"
                                                />
                                            </Field>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newRoster = (editingItem.data.roster || []).filter((_: any, i: number) => i !== idx);
                                                setEditingItem({ ...editingItem, data: { ...editingItem.data, roster: newRoster } });
                                            }}
                                            className="w-10 h-10 rounded-xl bg-blood-red/10 border border-blood-red/20 text-blood-red flex items-center justify-center hover:bg-blood-red hover:text-white transition-all self-end"
                                        >
                                            <span className="material-symbols-outlined text-sm">delete</span>
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-5 gap-3 bg-[#fffaf1] p-3 rounded-xl border border-[#ead9bb]">
                                        {ROSTER_STATS.map(stat => (
                                            <div key={stat} className="space-y-1">
                                                <span className="block text-[8px] font-bold text-[#8a7760] uppercase text-center">{stat}</span>
                                                <input
                                                    type="text"
                                                    value={player.stats?.[stat] || ''}
                                                    onChange={(e) => {
                                                        const newRoster = [...editingItem.data.roster];
                                                        newRoster[idx] = {
                                                            ...newRoster[idx],
                                                            stats: { ...newRoster[idx].stats, [stat]: e.target.value },
                                                        };
                                                        setEditingItem({ ...editingItem, data: { ...editingItem.data, roster: newRoster } });
                                                    }}
                                                    className="w-full bg-transparent border-b border-[#d7c39a] text-center text-[#2b1d12] text-xs py-1 focus:border-premium-gold outline-none font-display font-black transition-colors"
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <Field label="Primarias">
                                            <input
                                                type="text"
                                                value={player.primary || ''}
                                                onChange={(e) => {
                                                    const newRoster = [...editingItem.data.roster];
                                                    newRoster[idx] = { ...newRoster[idx], primary: e.target.value };
                                                    setEditingItem({ ...editingItem, data: { ...editingItem.data, roster: newRoster } });
                                                }}
                                                className="w-full bg-[#fffaf1] border border-[#d7c39a] rounded-xl px-4 py-2 text-xs text-[#2b1d12] outline-none focus:border-premium-gold/30"
                                            />
                                        </Field>
                                        <Field label="Secundarias">
                                            <input
                                                type="text"
                                                value={player.secondary || ''}
                                                onChange={(e) => {
                                                    const newRoster = [...editingItem.data.roster];
                                                    newRoster[idx] = { ...newRoster[idx], secondary: e.target.value };
                                                    setEditingItem({ ...editingItem, data: { ...editingItem.data, roster: newRoster } });
                                                }}
                                                className="w-full bg-[#fffaf1] border border-[#d7c39a] rounded-xl px-4 py-2 text-xs text-[#2b1d12] outline-none focus:border-premium-gold/30"
                                            />
                                        </Field>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[8px] font-bold text-[#8a7760] uppercase ml-1">Habilidades Iniciales</label>
                                        <div className="flex flex-wrap gap-1.5 min-h-[40px] p-3 bg-[#fffaf1] rounded-xl border border-[#ead9bb]">
                                            {skills.map((skill: any) => {
                                                const isSelected = (player.skillKeys || []).includes(skill.keyEN);
                                                return (
                                                    <button
                                                        key={skill.keyEN}
                                                        type="button"
                                                        onClick={() => {
                                                            const currentKeys = player.skillKeys || [];
                                                            const nextKeys = isSelected
                                                                ? currentKeys.filter((k: string) => k !== skill.keyEN)
                                                                : [...currentKeys, skill.keyEN];
                                                            const newRoster = [...editingItem.data.roster];
                                                            newRoster[idx] = { ...newRoster[idx], skillKeys: nextKeys };
                                                            setEditingItem({ ...editingItem, data: { ...editingItem.data, roster: newRoster } });
                                                        }}
                                                        className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-tighter border transition-all ${isSelected
                                                            ? 'bg-premium-gold/20 border-premium-gold/40 text-premium-gold'
                                                            : 'bg-white border-[#e3cfaa] text-[#8a7760] hover:text-[#2b1d12]'
                                                            }`}
                                                    >
                                                        {language === 'es' ? (skill.name_es || skill.name_en) : skill.name_en}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTeamTab === 'nombres' && (
                    <div className="space-y-8 animate-fade-in-up">
                        <div className="space-y-4">
                            <label className="block text-[10px] font-black text-sky-600 uppercase tracking-widest ml-1">Diccionario de nombres temáticos</label>
                            <textarea
                                value={(editingItem.data.namePools?.length ? editingItem.data.namePools : (editingItem.data.name ? (PLAYER_NAMES[editingItem.data.name.toUpperCase()] || []) : [])).join(', ')}
                                onChange={(e) => {
                                    const names = e.target.value.split(',').map((n: string) => n.trim()).filter(Boolean);
                                    setEditingItem({
                                        ...editingItem,
                                        data: { ...editingItem.data, namePools: names },
                                    });
                                }}
                                className="w-full bg-[#fcf6ea] border border-[#d7c39a] rounded-2xl py-4 px-6 text-[#2b1d12] focus:border-sky-500/50 outline-none h-64 resize-none text-[11px] leading-relaxed transition-all"
                                placeholder="Morg, Throg, Grashnak... (separados por comas)"
                            />
                            <p className="text-[9px] text-[#8a7760] uppercase tracking-tight ml-1 font-bold">
                                {!editingItem.data.namePools?.length
                                    ? 'Mostrando borrador por defecto de las reglas base.'
                                    : 'Diccionario personalizado guardado en Firestore para esta facción.'}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div className="space-y-1">
        <label className="text-[8px] font-bold text-[#8a7760] uppercase ml-1">{label}</label>
        {children}
    </div>
);

export default AdminTeamForm;



