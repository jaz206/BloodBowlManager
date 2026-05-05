import React, { useMemo } from 'react';

type AdminSkillsFormProps = {
    editingItem: any;
    setEditingItem: React.Dispatch<React.SetStateAction<any>>;
};

const SKILL_CATEGORY_OPTIONS = [
    {
        value: 'General',
        label: 'General',
        helper: 'Nucleo tactico universal y habilidades base del juego.',
        accent: 'bg-[#fff5dc] border-[#e9cf99] text-[#8a5b00]',
    },
    {
        value: 'Strength',
        label: 'Fuerza',
        helper: 'Impacto fisico, control del contacto y dominio del bloqueo.',
        accent: 'bg-[#ffe8e0] border-[#efb19e] text-[#9f4628]',
    },
    {
        value: 'Agility',
        label: 'Agilidad',
        helper: 'Movimiento fino, esquiva, recepcion y reposicionamiento.',
        accent: 'bg-[#e9fef4] border-[#a9dfc1] text-[#177a53]',
    },
    {
        value: 'Passing',
        label: 'Pase',
        helper: 'Herramientas de balon y precision ofensiva.',
        accent: 'bg-[#e8f6ff] border-[#a8d0ee] text-[#185f96]',
    },
    {
        value: 'Mutation',
        label: 'Mutacion',
        helper: 'Cambios biologicos, presion y ventajas monstruosas.',
        accent: 'bg-[#f5ebff] border-[#ceb3ef] text-[#6b3ea6]',
    },
    {
        value: 'Trait',
        label: 'Rasgo',
        helper: 'Comportamientos o limitaciones especiales del jugador.',
        accent: 'bg-[#f3f1ff] border-[#c9c5ec] text-[#53468f]',
    },
    {
        value: 'Devious',
        label: 'Triquinuelas',
        helper: 'Juego sucio, trampa y trucos de oficio poco ortodoxos.',
        accent: 'bg-[#fff3ec] border-[#f0c2a8] text-[#a14b20]',
    },
] as const;

const normalizeAscii = (value: string) =>
    value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9+]+/g, ' ')
        .trim();

const buildKeySuggestion = (value: string) =>
    normalizeAscii(value)
        .split(/\s+/)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');

const AdminSkillsForm: React.FC<AdminSkillsFormProps> = ({ editingItem, setEditingItem }) => {
    const data = editingItem.data || {};
    const activeCategory = SKILL_CATEGORY_OPTIONS.find((option) => option.value === data.category) || SKILL_CATEGORY_OPTIONS[0];
    const suggestedKey = useMemo(
        () => buildKeySuggestion(data.name_en || data.name_es || data.keyEN || ''),
        [data.name_en, data.name_es, data.keyEN]
    );

    const updateField = (field: string, value: unknown) => {
        setEditingItem({
            ...editingItem,
            data: {
                ...editingItem.data,
                [field]: value,
            },
        });
    };

    const previewDescription = data.desc_es || data.desc_en || 'La descripcion aparecera aqui mientras editas el registro.';

    const categoryCounts = [
        { label: 'ES', value: String(data.name_es || '').trim().length },
        { label: 'EN', value: String(data.name_en || '').trim().length },
        {
            label: 'Desc',
            value: Math.max(String(data.desc_es || '').trim().length, String(data.desc_en || '').trim().length),
        },
    ];

    return (
        <div className="space-y-8 mt-6">
            <div className="rounded-[1.75rem] border border-[#e3cfaa] bg-[#fffaf1] p-5">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                    <div className="space-y-3 min-w-0">
                        <p className="text-[9px] font-black uppercase tracking-[0.32em] text-gold">Editor operativo</p>
                        <h4 className="text-3xl font-header font-black italic uppercase tracking-tight text-[#2b1d12] leading-none">
                            {data.name_es || data.name_en || data.keyEN || 'Nueva habilidad'}
                        </h4>
                        <p className="text-[11px] leading-relaxed text-[#6f5738] max-w-3xl">
                            Esta ficha queda lista para trabajo de catalogo: identificador canonico, categoria, textos bilingues
                            y control explicito del estado Elite.
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 self-stretch xl:min-w-[260px]">
                        {categoryCounts.map((item) => (
                            <div key={item.label} className="rounded-2xl border border-[#e3cfaa] bg-[#fcf6ea] px-4 py-3 text-center">
                                <p className="text-[8px] font-black uppercase tracking-[0.28em] text-[#8a7760]">{item.label}</p>
                                <p className="mt-2 text-lg font-header font-black italic text-[#2b1d12]">{item.value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-5 grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(320px,380px)] gap-6">
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_280px] gap-4">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-[#7b6853] uppercase tracking-widest ml-1">KeyEN</label>
                                <input
                                    type="text"
                                    value={data.keyEN || ''}
                                    onChange={(e) => updateField('keyEN', e.target.value)}
                                    className="w-full bg-[#fcf6ea] border border-[#d7c39a] rounded-2xl py-4 px-5 text-[#2b1d12] font-mono text-sm focus:border-premium-gold/50 outline-none"
                                />
                                <div className="flex flex-wrap items-center gap-2 text-[10px] text-[#8a7760]">
                                    <span className="font-black uppercase tracking-[0.2em]">Sugerencia</span>
                                    <span className="rounded-xl border border-[#e3cfaa] bg-white/70 px-3 py-1 font-mono text-[#5f4d39]">
                                        {suggestedKey || 'Sin sugerencia'}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => updateField('keyEN', suggestedKey)}
                                        className="rounded-xl border border-[#d7c39a] bg-[#fff8eb] px-3 py-1 font-black uppercase tracking-widest text-[#6f5738] hover:border-gold hover:text-[#2b1d12] transition-colors"
                                    >
                                        Usar
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-[#7b6853] uppercase tracking-widest ml-1">Estado Elite</label>
                                <button
                                    type="button"
                                    onClick={() => updateField('isElite', !(data.isElite === true))}
                                    className={`w-full rounded-[1.4rem] border px-5 py-4 text-left transition-all ${
                                        data.isElite === true
                                            ? 'border-[#efc666] bg-[#fff3cf] text-[#8f5b00] shadow-[0_8px_20px_rgba(212,151,22,0.12)]'
                                            : 'border-[#d7c39a] bg-[#fcf6ea] text-[#7b6853]'
                                    }`}
                                >
                                    <div className="flex items-center justify-between gap-4">
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-[0.28em]">Etiqueta especial</p>
                                            <p className="mt-2 text-lg font-header font-black italic uppercase">
                                                {data.isElite === true ? 'Elite activa' : 'Skill normal'}
                                            </p>
                                        </div>
                                        <div
                                            className={`h-7 w-12 rounded-full border p-1 transition-all ${
                                                data.isElite === true ? 'border-[#efc666] bg-[#ffdf86]' : 'border-[#d7c39a] bg-white/80'
                                            }`}
                                        >
                                            <div
                                                className={`h-5 w-5 rounded-full transition-all ${
                                                    data.isElite === true ? 'translate-x-5 bg-[#8f5b00]' : 'translate-x-0 bg-[#b7a289]'
                                                }`}
                                            ></div>
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-[#7b6853] uppercase tracking-widest ml-1">Nombre (ES)</label>
                                <input
                                    type="text"
                                    value={data.name_es || ''}
                                    onChange={(e) => updateField('name_es', e.target.value)}
                                    className="w-full bg-[#fcf6ea] border border-[#d7c39a] rounded-2xl py-4 px-5 text-[#2b1d12] text-sm focus:border-premium-gold/50 outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-[#7b6853] uppercase tracking-widest ml-1">Name (EN)</label>
                                <input
                                    type="text"
                                    value={data.name_en || ''}
                                    onChange={(e) => updateField('name_en', e.target.value)}
                                    className="w-full bg-[#fcf6ea] border border-[#d7c39a] rounded-2xl py-4 px-5 text-[#2b1d12] text-sm focus:border-premium-gold/50 outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="block text-[10px] font-black text-[#7b6853] uppercase tracking-widest ml-1">Categoria operativa</label>
                            <div className="flex flex-wrap gap-2">
                                {SKILL_CATEGORY_OPTIONS.map((option) => {
                                    const isActive = option.value === activeCategory.value;
                                    return (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => updateField('category', option.value)}
                                            className={`rounded-xl border px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                                                isActive
                                                    ? `${option.accent} shadow-[0_8px_20px_rgba(0,0,0,0.06)]`
                                                    : 'border-[#e3cfaa] bg-white/75 text-[#8a7760] hover:border-gold hover:text-[#2b1d12]'
                                            }`}
                                        >
                                            {option.label}
                                        </button>
                                    );
                                })}
                            </div>
                            <p className="text-[11px] leading-relaxed text-[#7b6853] rounded-2xl border border-[#ead9b8] bg-[#fff8eb] px-4 py-3">
                                {activeCategory.helper}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-[#7b6853] uppercase tracking-widest ml-1">Descripcion (ES)</label>
                                <textarea
                                    value={data.desc_es || ''}
                                    onChange={(e) => updateField('desc_es', e.target.value)}
                                    className="w-full bg-[#fcf6ea] border border-[#d7c39a] rounded-2xl py-4 px-5 text-[#2b1d12] focus:border-premium-gold/50 outline-none h-44 resize-none text-xs leading-relaxed"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-[#7b6853] uppercase tracking-widest ml-1">Description (EN)</label>
                                <textarea
                                    value={data.desc_en || ''}
                                    onChange={(e) => updateField('desc_en', e.target.value)}
                                    className="w-full bg-[#fcf6ea] border border-[#d7c39a] rounded-2xl py-4 px-5 text-[#2b1d12] focus:border-premium-gold/50 outline-none h-44 resize-none text-xs leading-relaxed"
                                />
                            </div>
                        </div>
                    </div>

                    <aside className="space-y-4">
                        <div className="rounded-[1.75rem] border border-[#e3cfaa] bg-[#fcf6ea] p-5">
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gold">Vista rapida</p>
                            <div className="mt-4 flex items-start justify-between gap-3">
                                <div className="space-y-2 min-w-0">
                                    <h5 className="text-2xl font-header font-black italic uppercase tracking-tight text-[#2b1d12] break-words">
                                        {data.name_es || data.name_en || data.keyEN || 'Nueva habilidad'}
                                    </h5>
                                    <div className="flex flex-wrap gap-2">
                                        <span className={`rounded-xl border px-3 py-1 text-[10px] font-black uppercase tracking-widest ${activeCategory.accent}`}>
                                            {activeCategory.label}
                                        </span>
                                        {data.isElite === true && (
                                            <span className="rounded-xl border border-[#efc666] bg-[#fff1c4] px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#9e6500]">
                                                Elite
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="rounded-2xl border border-[#ead9b8] bg-white/75 px-3 py-2 text-right">
                                    <p className="text-[8px] font-black uppercase tracking-[0.28em] text-[#8a7760]">ID</p>
                                    <p className="mt-1 font-mono text-[10px] font-bold text-[#5f4d39] break-all max-w-[120px]">
                                        {data.keyEN || 'Sin clave'}
                                    </p>
                                </div>
                            </div>
                            <p className="mt-5 text-[12px] leading-relaxed text-[#6f5738]">{previewDescription}</p>
                        </div>

                        <div className="rounded-[1.75rem] border border-[#e3cfaa] bg-[#fffaf1] p-5 space-y-4">
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gold">Chequeo de datos</p>
                            <div className="space-y-3">
                                {[
                                    { ok: Boolean(String(data.keyEN || '').trim()), label: 'KeyEN definido' },
                                    { ok: Boolean(String(data.name_es || '').trim()), label: 'Nombre ES completo' },
                                    { ok: Boolean(String(data.name_en || '').trim()), label: 'Nombre EN completo' },
                                    { ok: Boolean(String(data.desc_es || '').trim()), label: 'Descripcion ES completa' },
                                    { ok: Boolean(String(data.desc_en || '').trim()), label: 'Descripcion EN completa' },
                                ].map((item) => (
                                    <div key={item.label} className="flex items-center justify-between gap-3 rounded-xl border border-[#ead9b8] bg-white/75 px-3 py-2">
                                        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#6f5738]">{item.label}</span>
                                        <span
                                            className={`rounded-full px-2 py-1 text-[9px] font-black uppercase tracking-widest ${
                                                item.ok ? 'bg-emerald-500/10 text-emerald-700' : 'bg-red-500/10 text-red-700'
                                            }`}
                                        >
                                            {item.ok ? 'OK' : 'Falta'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-[1.75rem] border border-[#e3cfaa] bg-[#fff8eb] p-5">
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gold">Uso recomendado</p>
                            <p className="mt-3 text-[11px] leading-relaxed text-[#7b6853]">
                                Para dejar el catalogo perfecto, intenta que cada habilidad tenga un `keyEN` estable, nombres
                                bilingues completos y una descripcion equivalente en ambos idiomas. El sello `Elite` debe
                                depender de Firebase, no de listas auxiliares.
                            </p>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default AdminSkillsForm;
