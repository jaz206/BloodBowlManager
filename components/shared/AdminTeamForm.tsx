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
    const roster = editingItem.data.roster || [];

    const getSkillLabel = (skill: any, fallbackKey: string) =>
        language === 'es'
            ? (skill?.name_es || skill?.name_en || fallbackKey)
            : (skill?.name_en || skill?.name_es || fallbackKey);

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

    const addRosterPlayer = () => {
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
            data: { ...editingItem.data, roster: [...roster, newPlayer] },
        });
    };

    const removeRosterPlayer = (idx: number) => {
        const newRoster = roster.filter((_: any, i: number) => i !== idx);
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
                <div className="rounded-[2rem] border border-[#e3cfaa] bg-[#fcf6ea] p-5">
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                        <div className="flex items-center gap-4 min-w-0">
                            <div className="h-20 w-28 shrink-0 overflow-hidden rounded-[1.5rem] border border-[#d7c39a] bg-[#f7efe1] flex items-center justify-center">
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
                                        className="w-full h-full object-contain p-1 transform-gpu"
                                    />
                                ) : (
                                    <span className="material-symbols-outlined text-[#c8b79e]">image_not_supported</span>
                                )}
                            </div>
                            <div className="min-w-0">
                                <p className="text-[9px] font-black uppercase tracking-[0.32em] text-gold">Editor de equipo</p>
                                <h3 className="mt-2 truncate text-3xl font-header font-black italic uppercase tracking-tight text-[#2b1d12]">
                                    {editingItem.data.name || 'Nueva raza'}
                                </h3>
                                <p className="mt-2 text-[11px] leading-relaxed text-[#7b6853] max-w-2xl">
                                    Gestiona identidad, reglas base, roster y diccionario de nombres desde un flujo mas corto y mas orientado a tareas.
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 xl:min-w-[520px]">
                            <div className="rounded-2xl border border-[#d7c39a] bg-[#fffaf1] px-4 py-3">
                                <p className="text-[8px] font-black uppercase tracking-[0.28em] text-[#8a7760]">Tier</p>
                                <p className="mt-1 text-lg font-header font-black italic text-[#2b1d12]">{editingItem.data.tier || 1}</p>
                            </div>
                            <div className="rounded-2xl border border-[#d7c39a] bg-[#fffaf1] px-4 py-3">
                                <p className="text-[8px] font-black uppercase tracking-[0.28em] text-[#8a7760]">Reroll</p>
                                <p className="mt-1 text-lg font-header font-black italic text-[#2b1d12]">
                                    {Math.round((editingItem.data.rerollCost || 0) / 1000)}k
                                </p>
                            </div>
                            <div className="rounded-2xl border border-[#d7c39a] bg-[#fffaf1] px-4 py-3">
                                <p className="text-[8px] font-black uppercase tracking-[0.28em] text-[#8a7760]">Posiciones</p>
                                <p className="mt-1 text-lg font-header font-black italic text-[#2b1d12]">{roster.length}</p>
                            </div>
                            <div className="rounded-2xl border border-[#d7c39a] bg-[#fffaf1] px-4 py-3">
                                <p className="text-[8px] font-black uppercase tracking-[0.28em] text-[#8a7760]">Pool nombres</p>
                                <p className="mt-1 text-lg font-header font-black italic text-[#2b1d12]">{visibleNamePool.length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="sticky top-0 z-30 border-b border-[#e6d2ad] bg-[rgba(248,240,227,0.94)] px-1 py-3 backdrop-blur">
                    <div className="flex flex-wrap gap-2 p-1.5 bg-[#f6e9d0] border border-[#dfcaa7] rounded-2xl w-fit shadow-[0_8px_24px_rgba(111,87,56,0.08)]">
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
                </div>

                {activeTeamTab === 'general' && (
                    <div className="space-y-8 animate-fade-in-up">
                        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,0.9fr)_minmax(320px,0.7fr)] gap-8">
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
                            <div className="rounded-[2rem] border border-[#e3cfaa] bg-[#fcf6ea] p-6 space-y-5">
                                <div>
                                    <p className="text-[10px] font-black text-[#7b6853] uppercase tracking-widest">Chequeo rapido</p>
                                    <p className="mt-2 text-[11px] leading-relaxed text-[#7b6853]">
                                        Usa esta columna para vigilar la consistencia del equipo mientras editas el reglamento base.
                                    </p>
                                </div>
                                <div className="space-y-3">
                                    {[
                                        ['Nombre visible', editingItem.data.name ? 'OK' : 'Falta'],
                                        ['Reroll definido', editingItem.data.rerollCost ? 'OK' : 'Falta'],
                                        ['Tier asignado', editingItem.data.tier ? 'OK' : 'Falta'],
                                        ['Roster cargado', roster.length > 0 ? 'OK' : 'Falta'],
                                    ].map(([label, state]) => (
                                        <div key={label} className="flex items-center justify-between rounded-2xl border border-[#dcc8a1] bg-[#fffaf1] px-4 py-3">
                                            <span className="text-[10px] font-black uppercase tracking-[0.22em] text-[#7b6853]">{label}</span>
                                            <span className={`rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-[0.22em] ${state === 'OK' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                                {state}
                                            </span>
                                        </div>
                                    ))}
                                </div>
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
                        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,0.95fr)_minmax(360px,0.75fr)] gap-8">
                            <div className="space-y-6">
                                <div className="space-y-4">
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
                                </div>

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

                                <div className="rounded-2xl border border-[#e3cfaa] bg-[#fcf6ea] px-5 py-4 space-y-4">
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-[0.28em] text-gold">Medidas por superficie</p>
                                        <p className="mt-2 text-[10px] leading-relaxed text-[#7b6853]">
                                            Usa esta referencia para preparar un solo escudo maestro que encuadre bien en todas las zonas de la web.
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                                        <div className="rounded-2xl border border-[#d7c39a] bg-[#fffaf1] px-4 py-3">
                                            <p className="text-[8px] font-black uppercase tracking-[0.28em] text-[#7b6853]">Dossier de Gremio</p>
                                            <p className="mt-1 text-sm font-black italic text-[#2b1d12] font-epilogue">128 x 128 px</p>
                                            <p className="mt-1 text-[10px] leading-relaxed text-[#5f4d39]">Cabecera del equipo. Safe zone recomendada: 86%.</p>
                                        </div>
                                        <div className="rounded-2xl border border-[#d7c39a] bg-[#fffaf1] px-4 py-3">
                                            <p className="text-[8px] font-black uppercase tracking-[0.28em] text-[#7b6853]">Lista de Gremio</p>
                                            <p className="mt-1 text-sm font-black italic text-[#2b1d12] font-epilogue">192 x 192 px</p>
                                            <p className="mt-1 text-[10px] leading-relaxed text-[#5f4d39]">Tarjeta grande de franquicia. Conviene centrar símbolo y texto.</p>
                                        </div>
                                        <div className="rounded-2xl border border-[#d7c39a] bg-[#fffaf1] px-4 py-3">
                                            <p className="text-[8px] font-black uppercase tracking-[0.28em] text-[#7b6853]">Cuadrícula de Gremio</p>
                                            <p className="mt-1 text-sm font-black italic text-[#2b1d12] font-epilogue">160 x 160 px</p>
                                            <p className="mt-1 text-[10px] leading-relaxed text-[#5f4d39]">Vista compacta; evita marcos muy finos en el borde.</p>
                                        </div>
                                        <div className="rounded-2xl border border-[#d7c39a] bg-[#fffaf1] px-4 py-3">
                                            <p className="text-[8px] font-black uppercase tracking-[0.28em] text-[#7b6853]">Fundar equipo</p>
                                            <p className="mt-1 text-sm font-black italic text-[#2b1d12] font-epilogue">174 x 174 px</p>
                                            <p className="mt-1 text-[10px] leading-relaxed text-[#5f4d39]">Selector principal. Mejor con logo más grande y poco margen vacío.</p>
                                        </div>
                                        <div className="rounded-2xl border border-[#d7c39a] bg-[#fffaf1] px-4 py-3">
                                            <p className="text-[8px] font-black uppercase tracking-[0.28em] text-[#7b6853]">Oráculo</p>
                                            <p className="mt-1 text-sm font-black italic text-[#2b1d12] font-epilogue">450 x 338 px</p>
                                            <p className="mt-1 text-[10px] leading-relaxed text-[#5f4d39]">Aquí el escudo se usa como hero 4:3; funciona mejor un PNG de 1:1 con fondo generoso.</p>
                                        </div>
                                        <div className="rounded-2xl border border-[#d7c39a] bg-[#fffaf1] px-4 py-3">
                                            <p className="text-[8px] font-black uppercase tracking-[0.28em] text-[#7b6853]">Archivo maestro</p>
                                            <p className="mt-1 text-sm font-black italic text-[#2b1d12] font-epilogue">1024 x 1024 px</p>
                                            <p className="mt-1 text-[10px] leading-relaxed text-[#5f4d39]">Zona segura recomendada: 820 x 820 px, logo centrado y sin tocar borde.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
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
                        </div>
                    </div>
                )}

                {activeTeamTab === 'roster' && (
                    <div className="space-y-6 animate-fade-in-up">
                        <div className="rounded-[2rem] border border-[#e3cfaa] bg-[#fcf6ea] p-5 space-y-5">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <p className="text-[10px] font-black text-[#7b6853] uppercase tracking-widest">Roster de jugadores</p>
                                    <p className="mt-1 text-[11px] text-[#7b6853]">
                                        Edicion densa del roster: posicion, coste, cantidad, perfil y skills en una sola mesa.
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="rounded-2xl border border-[#d7c39a] bg-[#fffaf1] px-4 py-2 text-center">
                                        <p className="text-[8px] font-black uppercase tracking-[0.28em] text-[#8a7760]">Posiciones</p>
                                        <p className="mt-1 text-lg font-header font-black italic text-[#2b1d12]">{roster.length}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={addRosterPlayer}
                                        className="inline-flex items-center gap-2 rounded-2xl bg-premium-gold px-4 py-3 text-[10px] font-black uppercase tracking-widest text-black transition-all hover:shadow-[0_0_24px_rgba(202,138,4,0.25)]"
                                    >
                                        <span className="material-symbols-outlined text-sm">add</span>
                                        Añadir posicion
                                    </button>
                                </div>
                            </div>

                            <div className="overflow-hidden rounded-[1.5rem] border border-[#e3cfaa] bg-[#fffaf1] shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]">
                                <div className="flex items-center justify-between gap-3 border-b border-[#ead9bb] bg-[#fbf3e4] px-4 py-3 text-[9px] font-bold uppercase tracking-[0.22em] text-[#8a7760]">
                                    <span>Tabla con scroll independiente</span>
                                    <span className="text-[#b88a1d]">Cabecera fija · scroll horizontal visible abajo</span>
                                </div>
                                <div className="max-h-[68vh] overflow-auto overscroll-contain">
                                    <table className="min-w-[1120px] w-full text-left">
                                        <thead className="sticky top-0 z-20 border-b border-[#e7d8bb] bg-[#f8efdf] shadow-[0_1px_0_rgba(231,216,187,0.95)]">
                                            <tr className="text-[9px] font-black uppercase tracking-[0.24em] text-[#8a7760]">
                                                <th className="sticky left-0 z-30 bg-[#f8efdf] px-4 py-3 min-w-[220px]">Posicion</th>
                                                <th className="px-3 py-3 text-center">Coste</th>
                                                <th className="px-3 py-3 text-center">Cant.</th>
                                                {ROSTER_STATS.map((stat) => (
                                                    <th key={stat} className="px-2 py-3 text-center">{stat}</th>
                                                ))}
                                                <th className="px-3 py-3 text-center">1ª</th>
                                                <th className="px-3 py-3 text-center">2ª</th>
                                                <th className="px-4 py-3">Skills iniciales</th>
                                                <th className="px-3 py-3 text-right">Accion</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#eee1c7]">
                                            {roster.map((player: any, idx: number) => (
                                                <tr key={idx} className="align-top hover:bg-[#fff8ec] transition-colors">
                                                    <td className="sticky left-0 z-10 bg-[#fffaf1] px-4 py-4 min-w-[220px]">
                                                        <input
                                                            type="text"
                                                            value={player.position}
                                                            onChange={(e) => updateRosterPlayer(idx, { position: e.target.value })}
                                                            className="w-full rounded-xl border border-[#d7c39a] bg-white px-3 py-2 text-[11px] font-bold text-[#2b1d12] outline-none focus:border-premium-gold/40"
                                                        />
                                                    </td>
                                                    <td className="px-3 py-4">
                                                        <input
                                                            type="number"
                                                            value={player.cost}
                                                            onChange={(e) => updateRosterPlayer(idx, { cost: parseInt(e.target.value) || 0 })}
                                                            className="w-24 rounded-xl border border-[#d7c39a] bg-white px-3 py-2 text-center text-[11px] font-mono text-[#2b1d12] outline-none focus:border-premium-gold/40"
                                                        />
                                                    </td>
                                                    <td className="px-3 py-4">
                                                        <input
                                                            type="text"
                                                            value={player.qty}
                                                            onChange={(e) => updateRosterPlayer(idx, { qty: e.target.value })}
                                                            className="w-16 rounded-xl border border-[#d7c39a] bg-white px-2 py-2 text-center text-[11px] font-bold text-[#2b1d12] outline-none focus:border-premium-gold/40"
                                                        />
                                                    </td>
                                                    {ROSTER_STATS.map((stat) => (
                                                        <td key={stat} className="px-2 py-4">
                                                            <input
                                                                type="text"
                                                                value={player.stats?.[stat] || ''}
                                                                onChange={(e) => {
                                                                    const currentStats = roster[idx]?.stats || {};
                                                                    updateRosterPlayer(idx, {
                                                                        stats: { ...currentStats, [stat]: e.target.value },
                                                                    });
                                                                }}
                                                                className="w-14 rounded-xl border border-[#d7c39a] bg-white px-2 py-2 text-center text-[11px] font-black text-[#2b1d12] outline-none focus:border-premium-gold/40"
                                                            />
                                                        </td>
                                                    ))}
                                                    <td className="px-3 py-4">
                                                        <input
                                                            type="text"
                                                            value={player.primary || ''}
                                                            onChange={(e) => updateRosterPlayer(idx, { primary: e.target.value })}
                                                            className="w-14 rounded-xl border border-[#d7c39a] bg-white px-2 py-2 text-center text-[11px] font-black text-emerald-700 outline-none focus:border-premium-gold/40"
                                                        />
                                                    </td>
                                                    <td className="px-3 py-4">
                                                        <input
                                                            type="text"
                                                            value={player.secondary || ''}
                                                            onChange={(e) => updateRosterPlayer(idx, { secondary: e.target.value })}
                                                            className="w-16 rounded-xl border border-[#d7c39a] bg-white px-2 py-2 text-center text-[11px] font-black text-purple-700 outline-none focus:border-premium-gold/40"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-4 min-w-[340px]">
                                                        <div className="space-y-3">
                                                            <div className="flex flex-wrap gap-1.5 min-h-[34px]">
                                                                {(player.skillKeys || []).length > 0 ? (
                                                                    (player.skillKeys || []).map((skillKey: string) => {
                                                                        const skill = skills.find((entry: any) => entry.keyEN === skillKey);
                                                                        return (
                                                                            <button
                                                                                key={skillKey}
                                                                                type="button"
                                                                                onClick={() => removeInitialSkill(idx, skillKey)}
                                                                                className="inline-flex items-center gap-1.5 rounded-lg border border-premium-gold/30 bg-premium-gold/15 px-2.5 py-1 text-[9px] font-black uppercase tracking-tight text-[#2b1d12] transition-all hover:border-blood-red/30 hover:bg-blood-red/10 hover:text-blood-red"
                                                                            >
                                                                                {getSkillLabel(skill, skillKey)}
                                                                                <span className="material-symbols-outlined text-[12px]">close</span>
                                                                            </button>
                                                                        );
                                                                    })
                                                                ) : (
                                                                    <span className="text-[10px] font-bold text-[#8a7760]">Sin skills iniciales.</span>
                                                                )}
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <select
                                                                    value={pendingSkillSelections[idx] || ''}
                                                                    onChange={(e) => setPendingSkillSelections(prev => ({ ...prev, [idx]: e.target.value }))}
                                                                    className="min-w-0 flex-1 rounded-xl border border-[#d7c39a] bg-white px-3 py-2 text-[10px] font-bold text-[#2b1d12] outline-none focus:border-premium-gold/40"
                                                                >
                                                                    <option value="">Añadir habilidad...</option>
                                                                    {skills
                                                                        .filter((skill: any) => !(player.skillKeys || []).includes(skill.keyEN))
                                                                        .map((skill: any) => (
                                                                            <option key={skill.keyEN} value={skill.keyEN}>
                                                                                {getSkillLabel(skill, skill.keyEN)}
                                                                            </option>
                                                                        ))}
                                                                </select>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => addInitialSkill(idx)}
                                                                    disabled={!pendingSkillSelections[idx]}
                                                                    className="rounded-xl bg-premium-gold px-3 py-2 text-[10px] font-black uppercase tracking-widest text-black disabled:cursor-not-allowed disabled:opacity-40"
                                                                >
                                                                    Añadir
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-4 text-right">
                                                        <button
                                                            type="button"
                                                            onClick={() => removeRosterPlayer(idx)}
                                                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-blood-red/20 bg-blood-red/10 text-blood-red transition-all hover:bg-blood-red hover:text-white"
                                                        >
                                                            <span className="material-symbols-outlined text-sm">delete</span>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <p className="px-1 text-[9px] font-bold uppercase tracking-tight text-[#8a7760]">
                                Edicion rapida inspirada en el editor maestro: cambia costes, cantidades, perfil y skills sin abrir subpaneles.
                            </p>
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

export default AdminTeamForm;




