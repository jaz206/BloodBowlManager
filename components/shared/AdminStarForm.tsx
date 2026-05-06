import React, { useMemo, useState } from 'react';
import AdminGitHubImagePicker from './AdminGitHubImagePicker';
import { getStarPlayerImageFilename, getStarPlayerImageUrl } from '../../utils/imageUtils';
import { isEliteSkill } from '../../utils/skillUtils';

type AdminStarFormProps = {
    editingItem: any;
    skills: any[];
    language: string;
    setEditingItem: React.Dispatch<React.SetStateAction<any>>;
    isImageExplorerExpanded: boolean;
    setIsImageExplorerExpanded: React.Dispatch<React.SetStateAction<boolean>>;
    gitHubImages: any[];
    isLoadingGitHub: boolean;
    githubSearch: string;
    setGithubSearch: React.Dispatch<React.SetStateAction<string>>;
};

const STAR_FACTIONS = [
    'Any Team',
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

const STAT_KEYS = ['MV', 'FU', 'AG', 'PA', 'AR'] as const;

const AdminStarForm: React.FC<AdminStarFormProps> = ({
    editingItem,
    skills,
    language,
    setEditingItem,
    isImageExplorerExpanded,
    setIsImageExplorerExpanded,
    gitHubImages,
    isLoadingGitHub,
    githubSearch,
    setGithubSearch,
}) => {
    const [skillSearch, setSkillSearch] = useState('');
    const [factionSearch, setFactionSearch] = useState('');
    const data = editingItem.data || {};
    const currentImage = data.image || '';
    const suggestedImage = getStarPlayerImageUrl(data.name || '');
    const expectedFilename = getStarPlayerImageFilename(data.name || '');
    const selectedSkillKeys: string[] = Array.isArray(data.skillKeys) ? data.skillKeys : [];
    const selectedFactions: string[] = Array.isArray(data.playsFor) ? data.playsFor : [];

    const updateField = (field: string, value: unknown) => {
        setEditingItem({
            ...editingItem,
            data: {
                ...editingItem.data,
                [field]: value,
            },
        });
    };

    const updateImage = (url: string) => updateField('image', url);

    const updateStat = (stat: (typeof STAT_KEYS)[number], value: string) => {
        setEditingItem({
            ...editingItem,
            data: {
                ...editingItem.data,
                stats: {
                    ...(editingItem.data.stats || {}),
                    [stat]: value,
                },
            },
        });
    };

    const toggleSkill = (skillKey: string) => {
        const next = selectedSkillKeys.includes(skillKey)
            ? selectedSkillKeys.filter((key) => key !== skillKey)
            : [...selectedSkillKeys, skillKey];
        updateField('skillKeys', next);
    };

    const toggleFaction = (faction: string) => {
        const next = selectedFactions.includes(faction)
            ? selectedFactions.filter((item) => item !== faction)
            : [...selectedFactions, faction];
        updateField('playsFor', next);
    };

    const displaySkillName = (skill: any) =>
        language === 'es'
            ? skill?.name_es || skill?.name || skill?.name_en || skill?.keyEN || 'Skill'
            : skill?.name_en || skill?.name || skill?.name_es || skill?.keyEN || 'Skill';

    const normalizedSkillSearch = skillSearch.trim().toLowerCase();
    const normalizedFactionSearch = factionSearch.trim().toLowerCase();

    const sortedSkills = useMemo(
        () =>
            skills
                .slice()
                .sort((a, b) => displaySkillName(a).localeCompare(displaySkillName(b))),
        [skills, language]
    );

    const selectedSkills = useMemo(
        () => sortedSkills.filter((skill) => selectedSkillKeys.includes(skill.keyEN)),
        [sortedSkills, selectedSkillKeys]
    );

    const filteredSkills = useMemo(
        () =>
            sortedSkills.filter((skill) => {
                if (!normalizedSkillSearch) return true;
                const haystack = [skill.keyEN, skill.name_es, skill.name_en, skill.name, skill.category]
                    .filter(Boolean)
                    .join(' ')
                    .toLowerCase();
                return haystack.includes(normalizedSkillSearch);
            }),
        [sortedSkills, normalizedSkillSearch]
    );

    const filteredFactions = useMemo(
        () =>
            STAR_FACTIONS.filter((faction) =>
                !normalizedFactionSearch || faction.toLowerCase().includes(normalizedFactionSearch)
            ),
        [normalizedFactionSearch]
    );

    const statsFilled = STAT_KEYS.filter((key) => String(data.stats?.[key] || '').trim().length > 0).length;
    const previewDescription = data.description || data.specialRules_es || data.specialRules_en || 'Todavia no hay trasfondo o regla especial definida para esta estrella.';

    const qaChecks = [
        { ok: Boolean(String(data.name || '').trim()), label: 'Nombre definido' },
        { ok: Number(data.cost || 0) > 0, label: 'Coste informado' },
        { ok: statsFilled === STAT_KEYS.length, label: 'Perfil completo' },
        { ok: selectedSkillKeys.length > 0, label: 'Al menos una habilidad' },
        { ok: selectedFactions.length > 0, label: 'Compatibilidad definida' },
        { ok: Boolean(String(data.specialRules_es || '').trim()) && Boolean(String(data.specialRules_en || '').trim()), label: 'Regla especial bilingue' },
    ];

    return (
        <div className="mt-6 space-y-8">
            <div className="rounded-[1.75rem] border border-[#e3cfaa] bg-[#fffaf1] p-5">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0 space-y-3">
                        <p className="text-[9px] font-black uppercase tracking-[0.32em] text-gold">Editor de estrellas</p>
                        <h4 className="text-3xl font-header font-black italic uppercase tracking-tight leading-none text-[#2b1d12]">
                            {data.name || 'Nueva estrella'}
                        </h4>
                        <p className="max-w-3xl text-[11px] leading-relaxed text-[#6f5738]">
                            Estamos editando una ficha completa: imagen, coste, perfil, habilidades, compatibilidad y regla especial.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 self-stretch md:grid-cols-4 xl:min-w-[360px]">
                        {[
                            { label: 'Coste', value: data.cost ? `${Math.round(Number(data.cost) / 1000)}k` : '0k' },
                            { label: 'Skills', value: selectedSkillKeys.length },
                            { label: 'Ligas', value: selectedFactions.length },
                            { label: 'Stats', value: `${statsFilled}/${STAT_KEYS.length}` },
                        ].map((item) => (
                            <div key={item.label} className="rounded-2xl border border-[#e3cfaa] bg-[#fcf6ea] px-4 py-3 text-center">
                                <p className="text-[8px] font-black uppercase tracking-[0.28em] text-[#8a7760]">{item.label}</p>
                                <p className="mt-2 text-lg font-header font-black italic text-[#2b1d12]">{item.value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,380px)]">
                    <div className="space-y-6">
                        <div className="space-y-6">
                            <label className="ml-1 block text-[10px] font-black uppercase tracking-widest text-[#7b6853]">Imagen oficial</label>
                            <AdminGitHubImagePicker
                                title="Imagen de la estrella"
                                helperText="Explora GitHub o pega una URL manual."
                                isExpanded={isImageExplorerExpanded}
                                setIsExpanded={setIsImageExplorerExpanded}
                                search={githubSearch}
                                setSearch={setGithubSearch}
                                images={gitHubImages}
                                isLoading={isLoadingGitHub}
                                currentImage={currentImage}
                                onPick={updateImage}
                            />

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
                                <div className="space-y-2">
                                    <label className="ml-1 block text-[10px] font-black uppercase tracking-widest text-[#7b6853]">URL de imagen</label>
                                    <input
                                        type="text"
                                        value={currentImage}
                                        onChange={(e) => updateImage(e.target.value)}
                                        className="w-full rounded-2xl border border-[#d7c39a] bg-[#fcf6ea] px-5 py-4 font-mono text-sm text-[#2b1d12] outline-none focus:border-premium-gold/50"
                                        placeholder="Pega URL o usa el explorador..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="ml-1 block text-[10px] font-black uppercase tracking-widest text-[#7b6853]">Vista previa</label>
                                    <div className="flex h-28 w-full items-center justify-center overflow-hidden rounded-2xl border border-[#d7c39a] bg-[#f7efe1]">
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
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <span className="material-symbols-outlined text-[#c8b79e]">image_not_supported</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-[#e3cfaa] bg-[#fcf6ea] px-5 py-4">
                                <p className="text-[9px] font-black uppercase tracking-[0.28em] text-gold">Imagen esperada en GitHub</p>
                                <div className="mt-3 flex flex-wrap items-center gap-3">
                                    <span className="rounded-xl border border-[#d7c39a] bg-[#fffaf1] px-3 py-2 font-mono text-[10px] font-bold text-[#2b1d12]">
                                        {expectedFilename}
                                    </span>
                                    <span className="text-[10px] font-bold text-[#7b6853]">
                                        Carpeta: <span className="font-mono text-[#2b1d12]">Star Players</span>
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_160px]">
                            <div className="space-y-2">
                                <label className="ml-1 block text-[10px] font-black uppercase tracking-widest text-[#7b6853]">Nombre visible</label>
                                <input
                                    type="text"
                                    value={data.name || ''}
                                    onChange={(e) => updateField('name', e.target.value)}
                                    className="w-full rounded-2xl border border-[#d7c39a] bg-[#fcf6ea] px-5 py-4 text-sm text-[#2b1d12] outline-none focus:border-premium-gold/50"
                                    placeholder="Ej: Griff Oberwald"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="ml-1 block text-[10px] font-black uppercase tracking-widest text-[#7b6853]">Coste</label>
                                <input
                                    type="number"
                                    value={data.cost || 0}
                                    onChange={(e) => updateField('cost', parseInt(e.target.value) || 0)}
                                    className="w-full rounded-2xl border border-[#d7c39a] bg-[#fcf6ea] px-5 py-4 text-sm text-[#2b1d12] outline-none focus:border-premium-gold/50"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="ml-1 block text-[10px] font-black uppercase tracking-widest text-[#7b6853]">Perfil de atributos</label>
                            <div className="grid grid-cols-5 gap-3 rounded-2xl border border-[#e3cfaa] bg-[#fcf6ea] p-4">
                                {STAT_KEYS.map((stat) => (
                                    <div key={stat} className="space-y-1">
                                        <span className="block text-center text-[8px] font-bold uppercase text-[#8a7760]">{stat}</span>
                                        <input
                                            type="text"
                                            value={data.stats?.[stat] || ''}
                                            onChange={(e) => updateStat(stat, e.target.value)}
                                            className="w-full border-b border-[#d7c39a] bg-transparent py-1 text-center font-display text-sm font-black text-[#2b1d12] outline-none transition-colors focus:border-premium-gold"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                <label className="ml-1 block text-[10px] font-black uppercase tracking-widest text-[#7b6853]">Habilidades base</label>
                                <input
                                    type="text"
                                    value={skillSearch}
                                    onChange={(e) => setSkillSearch(e.target.value)}
                                    className="w-full rounded-xl border border-[#e3cfaa] bg-white/80 px-4 py-2 text-[11px] text-[#2b1d12] outline-none focus:border-premium-gold/50 md:max-w-[260px]"
                                    placeholder="Filtrar skills..."
                                />
                            </div>

                            <div className="rounded-2xl border border-[#e3cfaa] bg-[#fff8eb] p-4">
                                <p className="text-[9px] font-black uppercase tracking-[0.28em] text-gold">Skills elegidas</p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {selectedSkills.length > 0 ? selectedSkills.map((skill) => (
                                        <button
                                            key={skill.keyEN}
                                            type="button"
                                            onClick={() => toggleSkill(skill.keyEN)}
                                            className="rounded-xl border border-[#d7c39a] bg-white px-3 py-2 text-[10px] font-black uppercase tracking-widest text-[#2b1d12] transition-colors hover:border-red-400 hover:text-red-700"
                                        >
                                            {displaySkillName(skill)}
                                        </button>
                                    )) : (
                                        <p className="text-[11px] leading-relaxed text-[#7b6853]">Todavia no hay habilidades asignadas a esta estrella.</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid max-h-80 grid-cols-1 gap-2 overflow-y-auto rounded-2xl border border-[#e3cfaa] bg-[#fcf6ea] p-4 custom-scrollbar sm:grid-cols-2 xl:grid-cols-3">
                                {filteredSkills.map((skill) => {
                                    const isSelected = selectedSkillKeys.includes(skill.keyEN);
                                    const isElite = isEliteSkill(skill);
                                    return (
                                        <button
                                            key={skill.keyEN}
                                            type="button"
                                            onClick={() => toggleSkill(skill.keyEN)}
                                            className={`min-w-0 rounded-xl border px-3 py-3 text-left text-[10px] font-black uppercase tracking-widest transition-all ${isSelected
                                                ? 'border-sky-500/30 bg-sky-500/20 text-sky-700'
                                                : 'border-[#e3cfaa] bg-white text-[#8a7760] hover:border-gold/30 hover:text-[#2b1d12]'
                                            }`}
                                            title={skill.desc_es || skill.desc_en || ''}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <span className="leading-tight break-words">{displaySkillName(skill)}</span>
                                                {isElite && <span className="shrink-0 rounded-full border border-[#efc666] bg-[#fff1c4] px-2 py-0.5 text-[8px] text-[#9e6500]">Elite</span>}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                <label className="ml-1 block text-[10px] font-black uppercase tracking-widest text-[#7b6853]">Equipos compatibles</label>
                                <input
                                    type="text"
                                    value={factionSearch}
                                    onChange={(e) => setFactionSearch(e.target.value)}
                                    className="w-full rounded-xl border border-[#e3cfaa] bg-white/80 px-4 py-2 text-[11px] text-[#2b1d12] outline-none focus:border-premium-gold/50 md:max-w-[220px]"
                                    placeholder="Filtrar facciones..."
                                />
                            </div>
                            <div className="flex max-h-48 flex-wrap gap-2 overflow-y-auto rounded-2xl border border-[#e3cfaa] bg-[#fcf6ea] p-4 custom-scrollbar">
                                {filteredFactions.map((faction) => {
                                    const isSelected = selectedFactions.includes(faction);
                                    return (
                                        <button
                                            key={faction}
                                            type="button"
                                            onClick={() => toggleFaction(faction)}
                                            className={`rounded-xl border px-3 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${isSelected
                                                ? 'border-premium-gold/30 bg-premium-gold/20 text-premium-gold'
                                                : 'border-[#e3cfaa] bg-white text-[#8a7760] hover:border-gold/30 hover:text-[#2b1d12]'
                                            }`}
                                        >
                                            {faction}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="ml-1 block text-[10px] font-black uppercase tracking-widest text-[#7b6853]">Regla especial ES</label>
                                <textarea
                                    value={data.specialRules_es || ''}
                                    onChange={(e) => updateField('specialRules_es', e.target.value)}
                                    className="h-28 w-full resize-none rounded-2xl border border-[#d7c39a] bg-[#fcf6ea] px-5 py-4 text-[11px] leading-relaxed text-[#2b1d12] outline-none focus:border-premium-gold/50"
                                    placeholder="Regla especial en espanol..."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="ml-1 block text-[10px] font-black uppercase tracking-widest text-[#7b6853]">Special Rule EN</label>
                                <textarea
                                    value={data.specialRules_en || ''}
                                    onChange={(e) => updateField('specialRules_en', e.target.value)}
                                    className="h-28 w-full resize-none rounded-2xl border border-[#d7c39a] bg-[#fcf6ea] px-5 py-4 text-[11px] leading-relaxed text-[#2b1d12] outline-none focus:border-premium-gold/50"
                                    placeholder="Special rule in English..."
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="ml-1 block text-[10px] font-black uppercase tracking-widest text-[#7b6853]">Biografia y trasfondo</label>
                            <textarea
                                value={data.description || ''}
                                onChange={(e) => updateField('description', e.target.value)}
                                className="h-32 w-full resize-none rounded-2xl border border-[#d7c39a] bg-[#fcf6ea] px-5 py-4 text-[11px] leading-relaxed text-[#2b1d12] outline-none focus:border-premium-gold/50"
                                placeholder="Describe aqui el trasfondo de la leyenda..."
                            />
                        </div>
                    </div>

                    <aside className="space-y-4">
                        <div className="rounded-[1.75rem] border border-[#e3cfaa] bg-[#fcf6ea] p-5">
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gold">Vista rapida</p>
                            <div className="mt-4 flex items-start justify-between gap-3">
                                <div className="min-w-0 space-y-2">
                                    <h5 className="break-words text-2xl font-header font-black italic uppercase tracking-tight text-[#2b1d12]">
                                        {data.name || 'Nueva estrella'}
                                    </h5>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="rounded-xl border border-[#e9cf99] bg-[#fff5dc] px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#8a5b00]">
                                            Star Player
                                        </span>
                                        <span className="rounded-xl border border-[#d7c39a] bg-white/75 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#6f5738]">
                                            {data.cost ? `${Math.round(Number(data.cost) / 1000)}k MO` : 'Sin coste'}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#d7c39a] bg-white/70">
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
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <span className="material-symbols-outlined text-[#c8b79e]">star</span>
                                    )}
                                </div>
                            </div>
                            <p className="mt-5 text-[12px] leading-relaxed text-[#6f5738]">{previewDescription}</p>
                        </div>

                        <div className="space-y-4 rounded-[1.75rem] border border-[#e3cfaa] bg-[#fffaf1] p-5">
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gold">Chequeo de datos</p>
                            <div className="space-y-3">
                                {qaChecks.map((item) => (
                                    <div key={item.label} className="flex items-center justify-between gap-3 rounded-xl border border-[#ead9b8] bg-white/75 px-3 py-2">
                                        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#6f5738]">{item.label}</span>
                                        <span className={`rounded-full px-2 py-1 text-[9px] font-black uppercase tracking-widest ${item.ok ? 'bg-emerald-500/10 text-emerald-700' : 'bg-red-500/10 text-red-700'}`}>
                                            {item.ok ? 'OK' : 'Falta'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-[1.75rem] border border-[#e3cfaa] bg-[#fff8eb] p-5">
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gold">Uso recomendado</p>
                            <p className="mt-3 text-[11px] leading-relaxed text-[#7b6853]">
                                La ficha ideal deja tres cosas cerradas: skills canonizadas por `skillKeys`, facciones compatibles bien delimitadas y una regla especial bilingue lista para el Oraculo.
                            </p>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default AdminStarForm;
