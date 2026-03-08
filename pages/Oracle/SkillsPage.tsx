import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Skill } from '../../types';
import { useMasterData } from '../../hooks/useMasterData';
import { useLanguage } from '../../contexts/LanguageContext';

const Categories = [
    { id: 'General', label: 'General', icon: 'shield' },
    { id: 'Fuerza', label: 'Fuerza', icon: 'fitness_center' },
    { id: 'Agilidad', label: 'Agilidad', icon: 'directions_run' },
    { id: 'Pase', label: 'Pase', icon: 'sports_football' },
    { id: 'Mutación', label: 'Mutación', icon: 'genetics' },
    { id: 'Rasgo', label: 'Rasgo', icon: 'star' },
];

const SkillCard: React.FC<{ skill: Skill; onClick: () => void; isSelected: boolean }> = ({ skill, onClick, isSelected }) => {
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
                {skill.name}
            </h4>
            <p className="text-sm text-accent-gold line-clamp-3 leading-relaxed font-medium italic">
                {skill.description}
            </p>
        </motion.div>
    );
};

const Skills: React.FC = () => {
    const { skills, loading } = useMasterData();
    const { t } = useLanguage();
    const [activeCategory, setActiveCategory] = useState('General');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSkillName, setSelectedSkillName] = useState<string | null>(null);

    const filteredSkills = useMemo(() => {
        return skills.filter(skill => {
            const matchesCategory = activeCategory === 'Todos' || skill.category === activeCategory;
            const matchesSearch = !searchTerm ||
                skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                skill.description.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [activeCategory, searchTerm, skills]);

    // Get the currently "Featured" skill (first in list or selected)
    const featuredSkill = useMemo(() => {
        if (selectedSkillName) {
            return skills.find(s => s.name === selectedSkillName) || filteredSkills[0];
        }
        return filteredSkills[0];
    }, [selectedSkillName, filteredSkills, skills]);

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
        <div className="flex flex-col lg:flex-row gap-8 pb-20">
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
                                    setSearchTerm(''); // Clear search when switching categories
                                    setSelectedSkillName(null);
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

                <div className="p-6 rounded-3xl bg-surface-dark border border-primary/20 text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <span className="material-symbols-outlined text-7xl text-primary font-black">psychology</span>
                    </div>
                    <h4 className="font-black text-xs mb-3 uppercase italic tracking-tighter text-primary">Consejo del Oráculo</h4>
                    <p className="text-[11px] text-accent-gold leading-relaxed italic font-medium">
                        Las habilidades de <strong className="text-primary uppercase">Fuerza</strong> son vitales para equipos como Orcos o Enanos. ¡Prioriza Golpe Mortífero!
                    </p>
                </div>
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
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-surface-dark border border-primary/10 text-white text-xs rounded-2xl py-4 pl-12 pr-6 outline-none focus:border-primary/50 transition-all font-medium placeholder:text-slate-600 shadow-inner"
                    />
                </div>

                {/* Header Information */}
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <h2 className="text-2xl font-black text-slate-100 uppercase italic tracking-tighter">
                        Habilidades: <span className="text-primary">{activeCategory}</span>
                    </h2>
                    <span className="text-[10px] text-accent-gold uppercase font-black tracking-widest opacity-60">
                        Mostrando {filteredSkills.length} resultados
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
                                            Nivel Pro
                                        </span>
                                    </div>
                                    <h3 className="text-4xl md:text-6xl font-black text-slate-100 uppercase italic tracking-tighter leading-none">
                                        {featuredSkill.name}
                                    </h3>
                                    <p className="text-lg md:text-xl text-accent-gold leading-relaxed font-medium italic max-w-2xl border-l-2 border-primary/30 pl-6">
                                        {featuredSkill.description}
                                    </p>
                                    <div className="flex flex-wrap gap-8 pt-4">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] text-primary uppercase font-black tracking-widest mb-1 opacity-60">Uso obligatorio</span>
                                            <span className="text-slate-100 font-black italic text-sm">Depende de la Regla</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[9px] text-primary uppercase font-black tracking-widest mb-1 opacity-60">Tipo</span>
                                            <span className="text-slate-100 font-black italic text-sm">{featuredSkill.category}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[9px] text-primary uppercase font-black tracking-widest mb-1 opacity-60">Frecuencia</span>
                                            <span className="text-slate-100 font-black italic text-sm">Alta</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-3 w-full md:w-64">
                                    <button className="w-full py-4 bg-primary text-black font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all transform hover:scale-105 active:scale-95 shadow-xl shadow-primary/10 italic">
                                        Añadir a Referencia
                                    </button>
                                    <button className="w-full py-4 bg-background-dark/80 border border-primary/20 text-slate-100 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-primary/5 transition-all italic">
                                        Ver Regla Completa
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="py-20 text-center bg-surface-dark border border-white/5 rounded-[2.5rem] italic text-slate-500 uppercase tracking-widest text-xs">
                            No se encontraron habilidades que coincidan con los filtros
                        </div>
                    )}
                </AnimatePresence>

                {/* Skills Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
                    <AnimatePresence mode="popLayout">
                        {filteredSkills.map((skill) => (
                            <SkillCard
                                key={skill.name}
                                skill={skill}
                                onClick={() => setSelectedSkillName(skill.name)}
                                isSelected={selectedSkillName === skill.name}
                            />
                        ))}
                    </AnimatePresence>
                </div>

                {/* Pagination UI Placeholder */}
                {filteredSkills.length > 8 && (
                    <div className="pt-10 flex justify-center gap-3">
                        <button className="size-12 flex items-center justify-center rounded-2xl bg-primary text-black font-black italic text-xs shadow-xl shadow-primary/20">1</button>
                        <button className="size-12 flex items-center justify-center rounded-2xl bg-surface-dark border border-primary/10 text-accent-gold font-black hover:border-primary transition-all text-xs italic">2</button>
                        <button className="size-12 flex items-center justify-center rounded-2xl bg-surface-dark border border-primary/10 text-accent-gold font-black hover:border-primary transition-all text-xs italic">3</button>
                        <button className="size-12 flex items-center justify-center rounded-2xl bg-surface-dark border border-primary/10 text-accent-gold font-black hover:border-primary transition-all text-xs italic">
                            <span className="material-symbols-outlined text-sm font-bold">chevron_right</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Skills;