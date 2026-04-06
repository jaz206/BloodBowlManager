import React from 'react';
import AdminGitHubImagePicker from './AdminGitHubImagePicker';
import { getStarPlayerImageFilename, getStarPlayerImageUrl } from '../../utils/imageUtils';

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
    const currentImage = editingItem.data.image || '';
    const suggestedImage = getStarPlayerImageUrl(editingItem.data.name || '');
    const expectedFilename = getStarPlayerImageFilename(editingItem.data.name || '');

    const updateImage = (url: string) => {
        setEditingItem({
            ...editingItem,
            data: { ...editingItem.data, image: url },
        });
    };

    return (
        <div className="space-y-10 animate-fade-in-slow mt-8">
            <div className="space-y-6">
                <label className="block text-[10px] font-black text-[#7b6853] uppercase tracking-widest ml-1">Imagen de la estrella</label>
                <AdminGitHubImagePicker
                    title="Imagen de la Estrella"
                    helperText="Haz clic para configurar imagen"
                    isExpanded={isImageExplorerExpanded}
                    setIsExpanded={setIsImageExplorerExpanded}
                    search={githubSearch}
                    setSearch={setGithubSearch}
                    images={gitHubImages}
                    isLoading={isLoadingGitHub}
                    currentImage={currentImage}
                    onPick={updateImage}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <label className="block text-[10px] font-black text-[#7b6853] uppercase tracking-widest ml-1">URL de imagen</label>
                        <input
                            type="text"
                            value={currentImage}
                            onChange={(e) => updateImage(e.target.value)}
                            className="w-full bg-[#fcf6ea] border border-[#d7c39a] rounded-2xl py-4 px-6 text-[10px] text-[#5f4d39] font-mono focus:border-premium-gold/50 outline-none transition-all"
                            placeholder="Introduce URL o usa el explorador..."
                        />
                    </div>
                    <div className="space-y-4">
                        <label className="block text-[10px] font-black text-[#7b6853] uppercase tracking-widest ml-1">Vista previa</label>
                        <div className="w-full h-28 rounded-2xl border border-[#d7c39a] bg-[#f7efe1] overflow-hidden flex items-center justify-center">
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
                </div>

                <div className="rounded-2xl border border-[#e3cfaa] bg-[#fcf6ea] px-5 py-4">
                    <p className="text-[9px] font-black uppercase tracking-[0.28em] text-gold">Imagen esperada en GitHub</p>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                        <span className="px-3 py-2 rounded-xl bg-[#fffaf1] border border-[#d7c39a] text-[10px] font-mono font-bold text-[#2b1d12]">
                            {expectedFilename}
                        </span>
                        <span className="text-[10px] font-bold text-[#7b6853]">
                            Carpeta: <span className="font-mono text-[#2b1d12]">Star Players</span>
                        </span>
                    </div>
                    <p className="mt-3 text-[10px] leading-relaxed text-[#7b6853]">
                        Este es el nombre exacto que la app espera para la imagen oficial del jugador estrella si quieres que el catálogo la resuelva automáticamente.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <label className="block text-[10px] font-black text-[#7b6853] uppercase tracking-widest ml-1">Precio de fichaje (GP)</label>
                    <input
                        type="number"
                        value={editingItem.data.cost || 0}
                        onChange={(e) => setEditingItem({
                            ...editingItem,
                            data: { ...editingItem.data, cost: parseInt(e.target.value) || 0 },
                        })}
                        className="w-full bg-[#fcf6ea] border border-[#d7c39a] rounded-2xl py-4 px-6 text-[#2b1d12] text-sm focus:border-premium-gold/50 outline-none transition-all"
                    />
                </div>

                <div className="space-y-4">
                    <label className="block text-[10px] font-black text-[#7b6853] uppercase tracking-widest ml-1">Perfil de atributos</label>
                    <div className="grid grid-cols-5 gap-3 bg-[#fcf6ea] p-4 rounded-2xl border border-[#e3cfaa]">
                        {['MV', 'FU', 'AG', 'PA', 'AR'].map(stat => (
                            <div key={stat} className="space-y-1">
                                <span className="block text-[8px] font-bold text-[#8a7760] uppercase text-center">{stat}</span>
                                <input
                                    type="text"
                                    value={editingItem.data.stats?.[stat] || ''}
                                    onChange={(e) => setEditingItem({
                                        ...editingItem,
                                        data: {
                                            ...editingItem.data,
                                            stats: { ...editingItem.data.stats, [stat]: e.target.value },
                                        },
                                    })}
                                    className="w-full bg-transparent border-b border-[#d7c39a] text-center text-[#2b1d12] text-xs py-1 focus:border-premium-gold outline-none font-display font-black transition-colors"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <label className="block text-[10px] font-black text-[#7b6853] uppercase tracking-widest ml-1">Habilidades base</label>
                <div className="flex flex-wrap gap-2 p-6 bg-[#fcf6ea] border border-[#e3cfaa] rounded-2xl max-h-64 overflow-y-auto custom-scrollbar">
                    {skills
                        .slice()
                        .sort((a, b) => {
                            const nameA = language === 'es' ? (a?.name_es || a?.name_en || a?.name || '') : (a?.name_en || a?.name || '');
                            const nameB = language === 'es' ? (b?.name_es || b?.name_en || b?.name || '') : (b?.name_en || b?.name || '');
                            return nameA.localeCompare(nameB);
                        })
                        .map(skill => {
                            const isSelected = (editingItem.data.skillKeys || []).includes(skill.keyEN);
                            return (
                                <button
                                    key={skill.keyEN}
                                    type="button"
                                    onClick={() => {
                                        const current = editingItem.data.skillKeys || [];
                                        const next = isSelected ? current.filter((k: string) => k !== skill.keyEN) : [...current, skill.keyEN];
                                        setEditingItem({
                                            ...editingItem,
                                            data: { ...editingItem.data, skillKeys: next },
                                        });
                                    }}
                                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${isSelected
                                        ? 'bg-sky-500/20 text-sky-400 border-sky-500/30'
                                        : 'bg-white text-[#8a7760] border-[#e3cfaa] hover:border-gold/30 hover:text-[#2b1d12]'
                                        }`}
                                >
                                    {language === 'es' ? (skill.name_es || skill.name_en) : skill.name_en}
                                </button>
                            );
                        })}
                </div>
            </div>

            <div className="space-y-4">
                <label className="block text-[10px] font-black text-[#7b6853] uppercase tracking-widest ml-1">Equipos compatibles</label>
                <div className="flex flex-wrap gap-2 p-6 bg-[#fcf6ea] border border-[#e3cfaa] rounded-2xl">
                    {STAR_FACTIONS.map(faction => {
                        const isSelected = (editingItem.data.playsFor || []).includes(faction);
                        return (
                            <button
                                key={faction}
                                type="button"
                                onClick={() => {
                                    const current = editingItem.data.playsFor || [];
                                    const next = isSelected ? current.filter((f: string) => f !== faction) : [...current, faction];
                                    setEditingItem({
                                        ...editingItem,
                                        data: { ...editingItem.data, playsFor: next },
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <label className="block text-[10px] font-black text-[#7b6853] uppercase tracking-widest ml-1">Regla especial ES</label>
                    <textarea
                        value={editingItem.data.specialRules_es || ''}
                        onChange={(e) => setEditingItem({
                            ...editingItem,
                            data: { ...editingItem.data, specialRules_es: e.target.value },
                        })}
                        className="w-full bg-[#fcf6ea] border border-[#d7c39a] rounded-2xl py-4 px-6 text-[#2b1d12] focus:border-premium-gold/50 outline-none h-24 resize-none text-[11px] leading-relaxed transition-all"
                        placeholder="Regla especial en español..."
                    />
                </div>
                <div className="space-y-4">
                    <label className="block text-[10px] font-black text-[#7b6853] uppercase tracking-widest ml-1">Special Rule EN</label>
                    <textarea
                        value={editingItem.data.specialRules_en || ''}
                        onChange={(e) => setEditingItem({
                            ...editingItem,
                            data: { ...editingItem.data, specialRules_en: e.target.value },
                        })}
                        className="w-full bg-[#fcf6ea] border border-[#d7c39a] rounded-2xl py-4 px-6 text-[#2b1d12] focus:border-premium-gold/50 outline-none h-24 resize-none text-[11px] leading-relaxed transition-all"
                        placeholder="Special rule in English..."
                    />
                </div>
            </div>

            <div className="space-y-4">
                <label className="block text-[10px] font-black text-[#7b6853] uppercase tracking-widest ml-1">Biografía y trasfondo</label>
                <textarea
                    value={editingItem.data.description || ''}
                    onChange={(e) => setEditingItem({
                        ...editingItem,
                        data: { ...editingItem.data, description: e.target.value },
                    })}
                    className="w-full bg-[#fcf6ea] border border-[#d7c39a] rounded-2xl py-4 px-6 text-[#2b1d12] focus:border-premium-gold/50 outline-none h-32 resize-none text-[11px] leading-relaxed transition-all"
                    placeholder="Describe aquí el trasfondo de la leyenda..."
                />
            </div>
        </div>
    );
};

export default AdminStarForm;

