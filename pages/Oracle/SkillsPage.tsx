import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Skill } from '../../types';
import { useMasterData } from '../../hooks/useMasterData';
import { useLanguage } from '../../contexts/LanguageContext';

const SKILLS_PER_PAGE = 8;

const Categories = [
    { id: 'General', label: 'General', icon: 'shield' },
    { id: 'Strength', label: 'Fuerza', icon: 'fitness_center' },
    { id: 'Agility', label: 'Agilidad', icon: 'directions_run' },
    { id: 'Passing', label: 'Pase', icon: 'sports_football' },
    { id: 'Mutation', label: 'Mutación', icon: 'genetics' },
    { id: 'Trait', label: 'Rasgo', icon: 'star' },
    { id: 'Triquiñuelas', label: 'Triquiñuelas', icon: 'vocal_remover' },
];

const OracleTips: Record<string, string> = {
    General: 'Block y Dodge son las habilidades más universales. Prioriza Block en líneas de ataque.',
    Strength: 'Golpe Mortífero (+1) es vital en Orcos y Enanos. Combínalo con Foul Appearance.',
    Agility: 'Esquivar (Dodge) + Nerves of Steel convierte a cualquier receptor en una amenaza constante.',
    Passing: 'Pase Seguro y Manos Seguras son la base de cualquier estrategia de bombardeo.',
    Mutation: 'Brazo Extra es la mutación más disruptiva, especialmente en portadores de balón.',
    Trait: 'Los rasgos son exclusivos de ciertos perfiles; consulta siempre la plantilla del equipo.',
    Triquiñuelas: 'Habilidades especiales de Temporada 3. Perfectas para jugar sucio y sorprender al rival.',
};

const SkillCard: React.FC<{ skill: Skill; onClick: () => void; isSelected: boolean }> = ({ skill, onClick, isSelected }) => {
    const { language } = useLanguage();
    const name = language === 'es' ? (skill.name_es || skill.name_en) : skill.name_en;
    const description = language === 'es' ? (skill.desc_es || skill.desc_en) : skill.desc_en;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileHover={{ y: -5 }}
            onClick={onClick}
            className={`group flex flex-col p-6 rounded-2xl bg-surface-dark border transition-all cursor-pointer shadow-xl ${isSelected ? 'border-primary ring-1 ring-primary/30' : 'border-primary/10 hover:border-primary/50'
                }`}
        >
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl transition-colors ${isSelected ? 'bg-primary text-black' : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-black'
                    }`}>
                    <span className="material-symbols-outlined text-sm">
                        {Categories.find(c => c.id === skill.category)?.icon || 'auto_awesome'}
                    </span>
                </div>
                <span className="text-[10px] font-black text-accent-gold uppercase tracking-[0.2em]">{skill.category}</span>
            </div>
            <h4 className="text-xl font-black text-slate-100 mb-2 uppercase italic tracking-tighter group-hover:text-primary transition-colors">
                {name}
            </h4>
            <div className="text-sm text-accent-gold line-clamp-3 leading-relaxed font-medium italic">
                {description}
            </div>
        </motion.div>
    );
};

interface SkillsProps {
    initialCategory?: string;
    initialSearchTerm?: string;
}

const Skills: React.FC<SkillsProps> = ({ initialCategory, initialSearchTerm = '' }) => {
    const { skills, loading } = useMasterData();
    const { t, language } = useLanguage();
    const [activeCategory, setActiveCategory] = useState(initialCategory || 'General');
    const [searchTerm, setSearchTerm] = useState(initialSearchTerm);

    // Sync search term if changed from parent
    React.useEffect(() => {
        if (initialSearchTerm) {
            setSearchTerm(initialSearchTerm);
        }
    }, [initialSearchTerm]);

    const [selectedSkillName, setSelectedSkillName] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pinnedSkills, setPinnedSkills] = useState<string[]>([]);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 2500);
    };

    const filteredSkills = useMemo(() => {
        return skills.filter(skill => {
            const searchTermLower = searchTerm.trim().toLowerCase();
            const matchesSearch = !searchTermLower ||
                (skill.name_es?.toLowerCase().includes(searchTermLower)) ||
                (skill.name_en?.toLowerCase().includes(searchTermLower)) ||
                (skill.desc_es?.toLowerCase().includes(searchTermLower)) ||
                (skill.desc_en?.toLowerCase().includes(searchTermLower)) ||
                (skill.name?.toLowerCase().includes(searchTermLower)) ||
                (skill.description?.toLowerCase().includes(searchTermLower));

            // If there's a search term, allow matches across all categories
            if (searchTermLower) return matchesSearch;

            // Otherwise match current category
            return skill.category === activeCategory;
        });
    }, [activeCategory, searchTerm, skills]);

    const totalPages = Math.max(1, Math.ceil(filteredSkills.length / SKILLS_PER_PAGE));

    // Ensure currentPage is within bounds when filters change
    const safeCurrentPage = Math.min(currentPage, totalPages);
    const paginatedSkills = filteredSkills.slice((safeCurrentPage - 1) * SKILLS_PER_PAGE, safeCurrentPage * SKILLS_PER_PAGE);

    const featuredSkill = useMemo(() => {
        if (selectedSkillName) {
            return skills.find(s => s.name === selectedSkillName) || filteredSkills[0];
        }
        return filteredSkills[0];
    }, [selectedSkillName, filteredSkills, skills]);

    const handlePinSkill = (skill: Skill) => {
        if (pinnedSkills.includes(skill.name)) {
            setPinnedSkills(prev => prev.filter(n => n !== skill.name));
            showToast(`"${skill.name}" eliminada de tu referencia`);
        } else {
            setPinnedSkills(prev => [...prev, skill.name]);
            showToast(`"${skill.name}" añadida a tu referencia`);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-40">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="size-12 border-4 border-primary border-t-white rounded-full"
                />
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row gap-8 pb-20 relative">
            {/* Toast Notification */}
            <AnimatePresence>
                {toastMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-primary text-black font-black text-[10px] uppercase tracking-widest italic px-6 py-4 rounded-2xl shadow-2xl shadow-primary/20"
                    >
                        <span className="material-symbols-outlined text-sm align-middle mr-2">check_circle</span>
                        {toastMessage}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Sidebar: Categories */}
            <aside className="lg:w-64 shrink-0 space-y-8">
                <div>
                    <h3 className="text-[10px] font-black text-accent-gold uppercase tracking-[0.3em] mb-6 pl-2">Categorías</h3>
                    <nav className="flex flex-col gap-2">
                        {Categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => {
                                    setActiveCategory(cat.id);
                                    setSearchTerm('');
                                    setSelectedSkillName(null);
                                    setCurrentPage(1);
                                }}
                                className={`flex items-center gap-3 px-5 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeCategory === cat.id
                                    ? 'bg-primary text-black shadow-lg shadow-primary/20'
                                    : 'text-accent-gold hover:bg-white/5 hover:text-white border border-transparent'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-sm">{cat.icon}</span>
                                <span>{cat.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                {/* My Reference / Oracle Tip */}
                {pinnedSkills.length > 0 ? (
                    <div className="p-6 rounded-3xl bg-surface-dark border border-primary/20 text-white shadow-2xl space-y-3">
                        <h4 className="font-black text-xs mb-3 uppercase italic tracking-tighter text-primary flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">bookmark</span>
                            Mi Referencia
                        </h4>
                        {pinnedSkills.map(name => (
                            <div key={name} className="flex items-center justify-between gap-2 py-1 border-b border-white/5 last:border-0">
                                <span className="text-[10px] text-slate-300 font-black italic uppercase truncate">{name}</span>
                                <button onClick={() => handlePinSkill({ keyEN: name, name_en: name, name_es: name, category: '', desc_en: '', desc_es: '' })} className="text-slate-600 hover:text-red-400 transition-colors shrink-0">
                                    <span className="material-symbols-outlined text-xs">close</span>
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-6 rounded-3xl bg-surface-dark border border-primary/20 text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <span className="material-symbols-outlined text-7xl text-primary font-black">psychology</span>
                        </div>
                        <h4 className="font-black text-xs mb-3 uppercase italic tracking-tighter text-primary">Consejo del Oráculo</h4>
                        <p className="text-[11px] text-accent-gold leading-relaxed italic font-medium">
                            {OracleTips[activeCategory] || 'Selecciona una habilidad para ver su descripción completa.'}
                        </p>
                    </div>
                )}
            </aside>

            {/* Content Area */}
            <div className="flex-1 space-y-10">
                {/* Search Header */}
                <div className="relative group">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-4">
                        <span className="material-symbols-outlined text-slate-500 text-sm group-focus-within:text-primary transition-colors">search</span>
                    </span>
                    <input
                        type="text"
                        placeholder="Buscar habilidad por nombre o efecto..."
                        value={searchTerm}
                        onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        className="w-full bg-surface-dark border border-primary/10 text-white text-xs rounded-2xl py-4 pl-12 pr-6 outline-none focus:border-primary/50 transition-all font-medium placeholder:text-slate-600 shadow-inner"
                    />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <h2 className="text-2xl font-black text-slate-100 uppercase italic tracking-tighter">
                        Habilidades: <span className="text-primary">{activeCategory}</span>
                    </h2>
                    <span className="text-[10px] text-accent-gold uppercase font-black tracking-widest opacity-60">
                        {filteredSkills.length} resultados
                    </span>
                </div>

                {/* Featured Detail Card */}
                <AnimatePresence mode="wait">
                    {featuredSkill ? (
                        <motion.div
                            key={featuredSkill.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="relative overflow-hidden rounded-[2.5rem] bg-surface-dark border border-primary/20 p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.5)] group"
                        >
                            <div className="absolute top-0 right-0 p-12 opacity-[0.03]">
                                <span className="material-symbols-outlined !text-[200px] text-primary">
                                    {Categories.find(c => c.id === featuredSkill.category)?.icon || 'auto_awesome'}
                                </span>
                            </div>

                            <div className="relative z-10 flex flex-col md:flex-row gap-10 items-start justify-between">
                                <div className="space-y-6 flex-1">
                                    <div className="flex items-center gap-3">
                                        <span className="px-3 py-1 rounded-lg bg-primary/20 text-primary text-[8px] font-black uppercase tracking-[0.2em] border border-primary/20">
                                            Habilidad Destacada
                                        </span>
                                        <span className="flex items-center gap-1 text-[8px] text-accent-gold font-black uppercase tracking-[0.3em]">
                                            <span className="material-symbols-outlined text-sm text-primary">bolt</span>
                                            {featuredSkill.category}
                                        </span>
                                    </div>
                                    <h3 className="text-4xl md:text-6xl font-black text-slate-100 uppercase italic tracking-tighter leading-none">
                                        {language === 'es' ? (featuredSkill.name_es || featuredSkill.name_en || featuredSkill.name) : (featuredSkill.name_en || featuredSkill.name)}
                                    </h3>
                                    <p className="text-lg md:text-xl text-accent-gold leading-relaxed font-medium italic max-w-2xl border-l-2 border-primary/30 pl-6">
                                        {language === 'es' ? (featuredSkill.desc_es || featuredSkill.desc_en || featuredSkill.description) : (featuredSkill.desc_en || featuredSkill.description)}
                                    </p>
                                </div>
                                <div className="flex flex-col gap-3 w-full md:w-64">
                                    <button
                                        onClick={() => handlePinSkill(featuredSkill)}
                                        className={`w-full py-4 font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all transform hover:scale-105 active:scale-95 shadow-xl italic flex items-center justify-center gap-2 ${pinnedSkills.includes(featuredSkill.name)
                                            ? 'bg-primary/20 text-primary border border-primary/50'
                                            : 'bg-primary text-black shadow-primary/10'
                                            }`}
                                    >
                                        <span className="material-symbols-outlined text-sm">{pinnedSkills.includes(featuredSkill.name) ? 'bookmark_added' : 'bookmark_add'}</span>
                                        {pinnedSkills.includes(featuredSkill.name) ? 'En Mi Referencia' : 'Añadir a Referencia'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="py-20 text-center bg-surface-dark border border-white/5 rounded-[2.5rem] italic text-slate-500 uppercase tracking-widest text-xs">
                            No se encontraron habilidades
                        </div>
                    )}
                </AnimatePresence>

                {/* Skills Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
                    <AnimatePresence mode="popLayout">
                        {paginatedSkills.map((skill) => (
                            <SkillCard
                                key={skill.name}
                                skill={skill}
                                onClick={() => setSelectedSkillName(skill.name)}
                                isSelected={selectedSkillName === skill.name}
                            />
                        ))}
                    </AnimatePresence>
                </div>

                {/* Real Pagination */}
                {totalPages > 1 && (
                    <div className="pt-10 flex justify-center gap-2 flex-wrap">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="size-12 flex items-center justify-center rounded-2xl bg-surface-dark border border-primary/10 text-accent-gold font-black hover:border-primary transition-all text-xs italic disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <span className="material-symbols-outlined text-sm font-bold">chevron_left</span>
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`size-12 flex items-center justify-center rounded-2xl font-black italic text-xs transition-all ${currentPage === page
                                    ? 'bg-primary text-black shadow-xl shadow-primary/20'
                                    : 'bg-surface-dark border border-primary/10 text-accent-gold hover:border-primary'
                                    }`}
                            >
                                {page}
                            </button>
                        ))}
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="size-12 flex items-center justify-center rounded-2xl bg-surface-dark border border-primary/10 text-accent-gold font-black hover:border-primary transition-all text-xs italic disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <span className="material-symbols-outlined text-sm font-bold">chevron_right</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Skills;