import React, { useMemo, useState } from 'react';
import AdminGitHubImagePicker from './AdminGitHubImagePicker';
import { getTeamLogoFilename, getTeamLogoUrl, resolveTeamLogoPreference } from '../../utils/imageUtils';
import { PLAYER_NAMES } from '../../pages/Guild/playerNames';

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


const normalizeNamePoolKey = (value: string): string =>
    value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/Ã/g, 'A')
        .replace(/Â/g, '')
        .toUpperCase()
        .trim();

const getCrestPresentationStyle = (crestScale?: number, crestOffsetY?: number): React.CSSProperties => ({
    transform: `scale(${crestScale ?? 1.14}) translateY(${crestOffsetY ?? 0}px)`,
    transformOrigin: 'center center',
});

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
    const [pendingName, setPendingName] = useState('');
    const [pendingSkillSelections, setPendingSkillSelections] = useState<Record<number, string>>({});
    const currentImage = resolveTeamLogoPreference(
        editingItem.data.name || '',
        editingItem.data.image || editingItem.data.crestImage || ''
    );
    const suggestedImage = getTeamLogoUrl(editingItem.data.name || '');
    const expectedFilename = getTeamLogoFilename(editingItem.data.name || '');
    const defaultNamePool = useMemo(() => {
        const rawName = editingItem.data.name || '';
        const normalized = normalizeNamePoolKey(rawName);
        const direct = PLAYER_NAMES[normalized] || PLAYER_NAMES[rawName.toUpperCase()];
        if (direct) return direct;
        const fallbackEntry = Object.entries(PLAYER_NAMES).find(([key]) => normalizeNamePoolKey(key) === normalized);
        return fallbackEntry?.[1] || [];
    }, [editingItem.data.name]);
    const visibleNamePool = editingItem.data.namePools?.length ? editingItem.data.namePools : defaultNamePool;

    const updateTeamImage = (url: string) => {
        setEditingItem({
            ...editingItem,
            data: { ...editingItem.data, image: url, crestImage: url },
        });
    };

    const updateCrestPresentation = (patch: { crestScale?: number; crestOffsetY?: number }) => {
        setEditingItem({
            ...editingItem,
            data: { ...editingItem.data, ...patch },
        });
    };


    const updateRosterPlayer = (idx: number, patch: Record<string, unknown>) => {
        const newRoster = [...(editingItem.data.roster || [])];
        newRoster[idx] = { ...newRoster[idx], ...patch };
        setEditingItem({ ...editingItem, data: { ...editingItem.data, roster: newRoster } });
    };

    const addInitialSkill = (idx: number) => {
        const nextSkill = pendingSkillSelections[idx];
        if (!nextSkill) return;
        const currentKeys = editingItem.data.roster?.[idx]?.skillKeys || [];
        if (currentKeys.includes(nextSkill)) return;
        updateRosterPlayer(idx, { skillKeys: [...currentKeys, nextSkill] });
        setPendingSkillSelections(prev => ({ ...prev, [idx]: '' }));
    };

    const removeInitialSkill = (idx: number, skillKey: string) => {
        const currentKeys = editingItem.data.roster?.[idx]?.skillKeys || [];
        updateRosterPlayer(idx, { skillKeys: currentKeys.filter((k: string) => k !== skillKey) });
    };

    const addNameToPool = () => {
        const clean = pendingName.trim();
        if (!clean) return;
        const next = Array.from(new Set([...(visibleNamePool || []), clean]));
        setEditingItem({
            ...editingItem,
            data: { ...editingItem.data, namePools: next },
        });
        setPendingName('');
    };

    const removeNameFromPool = (nameToRemove: string) => {
        const next = (visibleNamePool || []).filter((name: string) => name !== nameToRemove);
        setEditingItem({
            ...editingItem,
            data: { ...editingItem.data, namePools: next },
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
                                style={getCrestPresentationStyle(editingItem.data.crestScale, editingItem.data.crestOffsetY)}
                                className="w-full h-full object-contain p-0.5 transform-gpu"
                            />
                        ) : (
                            <span className="material-symbols-outlined text-white/10">image_not_supported</span>
                        )}
                    </div>
                </div>

                <div className="rounded-2xl border border-[#e3cfaa] bg-[#fcf6ea] px-5 py-4 space-y-4">
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.28em] text-gold">Ajuste del escudo</p>
                        <p className="mt-2 text-[10px] leading-relaxed text-[#7b6853]">
                            Usa estos controles para acercar el escudo al encuadre del cuadrado y centrarlo mejor.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="space-y-2">
                            <span className="block text-[9px] font-black text-[#7b6853] uppercase tracking-widest">Escala</span>
                            <input
                                type="range"
                                min="0.85"
                                max="1.6"
                                step="0.01"
                                value={editingItem.data.crestScale ?? 1.14}
                                onChange={(e) => updateCrestPresentation({ crestScale: parseFloat(e.target.value) })}
                                className="w-full accent-gold"
                            />
                        </label>
                        <label className="space-y-2">
                            <span className="block text-[9px] font-black text-[#7b6853] uppercase tracking-widest">Desplazamiento</span>
                            <input
                                type="range"
                                min="-40"
                                max="40"
                                step="1"
                                value={editingItem.data.crestOffsetY ?? 0}
                                onChange={(e) => updateCrestPresentation({ crestOffsetY: parseInt(e.target.value, 10) })}
                                className="w-full accent-gold"
                            />
                        </label>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="rounded-2xl border border-[#d7c39a] bg-[#fffaf1] px-4 py-3">
                            <p className="text-[8px] font-black uppercase tracking-[0.28em] text-[#7b6853]">Escala ideal</p>
                            <p className="mt-1 text-sm font-black italic text-[#2b1d12] font-epilogue">1.12 - 1.18</p>
                        </div>
                        <div className="rounded-2xl border border-[#d7c39a] bg-[#fffaf1] px-4 py-3">
                            <p className="text-[8px] font-black uppercase tracking-[0.28em] text-[#7b6853]">Desplazamiento ideal</p>
                            <p className="mt-1 text-sm font-black italic text-[#2b1d12] font-epilogue">-4 a +4 px</p>
                        </div>
                        <div className="rounded-2xl border border-[#d7c39a] bg-[#fffaf1] px-4 py-3">
                            <p className="text-[8px] font-black uppercase tracking-[0.28em] text-[#7b6853]">Encuadre recomendado</p>
                            <p className="mt-1 text-[10px] leading-relaxed text-[#5f4d39]">PNG cuadrado, logo centrado y sin mucho margen vacio arriba o abajo.</p>
                        </div>
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
                                         position: 'Lineman',
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
                                                        updateRosterPlayer(idx, { position: e.target.value });
                                                    }}
                                                    className="w-full bg-[#fffaf1] border border-[#d7c39a] rounded-xl px-4 py-2 text-xs text-[#2b1d12] outline-none focus:border-premium-gold/30"
                                                />
                                            </Field>
                                            <Field label="Cantidad">
                                                <input
                                                    type="text"
                                                    value={player.qty}
                                                    onChange={(e) => {
                                                        updateRosterPlayer(idx, { qty: e.target.value });
                                                    }}
                                                    className="w-full bg-[#fffaf1] border border-[#d7c39a] rounded-xl px-4 py-2 text-xs text-[#2b1d12] outline-none focus:border-premium-gold/30"
                                                />
                                            </Field>
                                            <Field label="Costo (MO)">
                                                <input
                                                    type="number"
                                                    value={player.cost}
                                                    onChange={(e) => {
                                                        updateRosterPlayer(idx, { cost: parseInt(e.target.value) || 0 });
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
                                                        const currentStats = editingItem.data.roster?.[idx]?.stats || {};
                                                        updateRosterPlayer(idx, {
                                                            stats: { ...currentStats, [stat]: e.target.value },
                                                        });
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
                                        <div className="space-y-3 p-3 bg-[#fffaf1] rounded-xl border border-[#ead9bb]">
                                            <div className="flex flex-wrap gap-1.5 min-h-[40px]">
                                                {(player.skillKeys || []).length > 0 ? (
                                                    (player.skillKeys || []).map((skillKey: string) => {
                                                        const skill = skills.find((entry: any) => entry.keyEN === skillKey);
                                                        return (
                                                            <button
                                                                key={skillKey}
                                                                type="button"
                                                                onClick={() => removeInitialSkill(idx, skillKey)}
                                                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-tighter border bg-premium-gold/20 border-premium-gold/40 text-premium-gold hover:bg-blood-red/10 hover:border-blood-red/30 hover:text-blood-red transition-all"
                                                            >
                                                                {language === 'es' ? (skill?.name_es || skill?.name_en || skillKey) : (skill?.name_en || skill?.name_es || skillKey)}
                                                                <span className="material-symbols-outlined text-[12px]">close</span>
                                                            </button>
                                                        );
                                                    })
                                                ) : (
                                                    <p className="text-[9px] font-bold text-[#8a7760]">Sin habilidades asignadas todavía.</p>
                                                )}
                                            </div>
                                            <div className="flex flex-col md:flex-row gap-3">
                                                <select
                                                    value={pendingSkillSelections[idx] || ''}
                                                    onChange={(e) => setPendingSkillSelections(prev => ({ ...prev, [idx]: e.target.value }))}
                                                    className="flex-1 bg-white border border-[#d7c39a] rounded-xl px-4 py-2 text-[10px] font-bold text-[#2b1d12] outline-none focus:border-premium-gold/40"
                                                >
                                                    <option value="">Añadir habilidad...</option>
                                                    {skills
                                                        .filter((skill: any) => !(player.skillKeys || []).includes(skill.keyEN))
                                                        .map((skill: any) => (
                                                            <option key={skill.keyEN} value={skill.keyEN}>
                                                                {language === 'es' ? (skill.name_es || skill.name_en) : (skill.name_en || skill.name_es)}
                                                            </option>
                                                        ))}
                                                </select>
                                                <button
                                                    type="button"
                                                    onClick={() => addInitialSkill(idx)}
                                                    disabled={!pendingSkillSelections[idx]}
                                                    className="px-4 py-2 rounded-xl bg-premium-gold text-black text-[10px] font-black uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed"
                                                >
                                                    Añadir
                                                </button>
                                            </div>
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
                            <div className="bg-[#fcf6ea] border border-[#d7c39a] rounded-2xl p-4 space-y-4">
                                <div className="flex flex-col md:flex-row gap-3">
                                    <input
                                        type="text"
                                        value={pendingName}
                                        onChange={(e) => setPendingName(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                addNameToPool();
                                            }
                                        }}
                                        className="flex-1 bg-[#fffaf1] border border-[#d7c39a] rounded-xl px-4 py-3 text-[11px] text-[#2b1d12] outline-none focus:border-sky-500/50"
                                        placeholder="Añadir nombre nuevo..."
                                    />
                                    <button
                                        type="button"
                                        onClick={addNameToPool}
                                        disabled={!pendingName.trim()}
                                        className="px-4 py-3 rounded-xl bg-premium-gold text-black text-[10px] font-black uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        Añadir nombre
                                    </button>
                                </div>
                                <div className="max-h-64 overflow-y-auto rounded-xl border border-[#ead9bb] bg-[#fffaf1] p-3">
                                    <div className="flex flex-wrap gap-2">
                                        {visibleNamePool.length > 0 ? (
                                            visibleNamePool.map((name: string) => (
                                                <button
                                                    key={name}
                                                    type="button"
                                                    onClick={() => removeNameFromPool(name)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#d7c39a] bg-white text-[10px] font-bold text-[#2b1d12] hover:border-blood-red/30 hover:text-blood-red transition-all"
                                                >
                                                    <span>{name}</span>
                                                    <span className="material-symbols-outlined text-[12px]">close</span>
                                                </button>
                                            ))
                                        ) : (
                                            <p className="text-[10px] font-bold text-[#8a7760]">No hay nombres en este pool todavía.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
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




