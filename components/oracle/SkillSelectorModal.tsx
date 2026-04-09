import React, { useState, useMemo } from 'react';
import type { Skill } from '../../types';

interface SkillSelectorModalProps {
    allSkills: Skill[];
    selectedSkills: string[];
    onSave: (skills: string[]) => void;
    onClose: () => void;
}

const SkillSelectorModal: React.FC<SkillSelectorModalProps> = ({ allSkills, selectedSkills, onSave, onClose }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentSelection, setCurrentSelection] = useState<string[]>(selectedSkills || []);

    const filteredSkills = useMemo(() => {
        if (!searchTerm) {
            return allSkills;
        }
        const lowerSearchTerm = searchTerm.toLowerCase();
        return allSkills.filter((skill) =>
            (skill.name_es || skill.name_en || skill.name || '').toLowerCase().includes(lowerSearchTerm) ||
            skill.category.toLowerCase().includes(lowerSearchTerm) ||
            (skill.desc_es || skill.desc_en || skill.description || '').toLowerCase().includes(lowerSearchTerm)
        );
    }, [searchTerm, allSkills]);

    const handleCheckboxChange = (skillName: string) => {
        setCurrentSelection((prev) =>
            prev.includes(skillName)
                ? prev.filter((s) => s !== skillName)
                : [...prev, skillName]
        );
    };

    const handleSave = () => {
        onSave(currentSelection);
        onClose();
    };

    return (
        <div
            className="fixed inset-0 bg-black/55 backdrop-blur-md flex items-center justify-center z-[260] p-4 animate-fade-in-fast"
            onClick={onClose}
        >
            <div
                className="w-full max-w-3xl rounded-[2rem] border border-[rgba(111,87,56,0.14)] bg-[rgba(255,251,241,0.98)] shadow-[0_30px_80px_rgba(0,0,0,0.28)] overflow-hidden transform animate-slide-in-up flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 border-b border-[rgba(111,87,56,0.12)] bg-[rgba(255,248,235,0.85)]">
                    <h2 className="text-2xl font-display font-black text-[#2b1d12] italic uppercase tracking-tighter">Seleccionar habilidades extra</h2>
                </div>
                <div className="p-6 flex-shrink-0 bg-[rgba(255,248,235,0.65)]">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <svg className="h-4 w-4 text-[#8a7760] group-focus-within:text-premium-gold transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar habilidad por nombre o categoría..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white border border-[#d7c39a] rounded-2xl py-4 pl-12 pr-4 text-[#2b1d12] font-display font-bold uppercase tracking-wider placeholder-[#a79479] focus:border-premium-gold outline-none transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]"
                        />
                    </div>
                </div>
                <div className="p-4 overflow-y-auto space-y-2 custom-scrollbar flex-grow bg-[rgba(255,248,235,0.35)]">
                    {filteredSkills.map((skill) => {
                        const displayName = skill.name_es || skill.name_en || skill.name || skill.keyEN;
                        const description = skill.desc_es || skill.desc_en || skill.description || '';
                        const selectionKey = skill.keyEN || displayName;
                        const isSelected = currentSelection.includes(selectionKey);
                        return (
                            <div
                                key={selectionKey}
                                onClick={() => handleCheckboxChange(selectionKey)}
                                className={`flex items-center group/skill p-4 rounded-xl border transition-all cursor-pointer ${isSelected ? 'bg-premium-gold/10 border-premium-gold/30' : 'bg-white border-[#e3cfaa] hover:border-premium-gold/30 hover:bg-[#fffaf1]'}`}
                            >
                                <div className={`h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-premium-gold border-premium-gold' : 'border-[#b7a382] group-hover/skill:border-premium-gold/50 bg-[#fffaf1]'}`}>
                                    {isSelected && (
                                        <svg className="h-4 w-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                                <div className="ml-4 flex-grow">
                                    <div className="flex items-center gap-2">
                                        <span className={`font-display font-bold uppercase tracking-tight text-base ${isSelected ? 'text-premium-gold' : 'text-[#2b1d12]'}`}>{displayName}</span>
                                        <span className="text-[10px] font-display font-black text-[#8a7760] uppercase tracking-widest bg-[rgba(255,248,235,0.9)] px-2 py-0.5 rounded-md border border-[#e3cfaa]">{skill.category}</span>
                                    </div>
                                    <p className="text-[11px] text-[#6f5738] mt-1 leading-relaxed line-clamp-1 group-hover/skill:line-clamp-none transition-all">{description}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="p-6 bg-[rgba(255,248,235,0.85)] border-t border-[rgba(111,87,56,0.12)] flex flex-wrap gap-4 justify-between items-center flex-shrink-0">
                    <span className="text-[10px] font-display font-bold text-[#8a7760] uppercase tracking-widest italic">{currentSelection.length} habilidades seleccionadas</span>
                    <div className="flex gap-4">
                        <button type="button" onClick={onClose} className="px-8 py-3 rounded-lg font-display font-bold uppercase tracking-widest text-xs text-[#8a7760] hover:text-[#2b1d12] hover:bg-white/60 transition-all">
                            Cancelar
                        </button>
                        <button type="button" onClick={handleSave} className="bg-premium-gold text-black font-display font-black uppercase tracking-widest text-xs py-3 px-10 rounded-lg transition-premium hover:scale-105 active:scale-95 shadow-2xl shadow-premium-gold/20">
                            Confirmar selección
                        </button>
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes fade-in-fast { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slide-in-up { from { transform: translateY(20px) scale(0.98); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
                .animate-fade-in-fast { animation: fade-in-fast 0.2s ease-out forwards; }
                .animate-slide-in-up { animation: slide-in-up 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default SkillSelectorModal;
