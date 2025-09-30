
import React, { useState, useMemo } from 'react';
import type { Skill } from '../types';

interface SkillSelectorModalProps {
    allSkills: Skill[];
    selectedSkills: string[];
    onSave: (skills: string[]) => void;
    onClose: () => void;
}

const SkillSelectorModal: React.FC<SkillSelectorModalProps> = ({ allSkills, selectedSkills, onSave, onClose }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentSelection, setCurrentSelection] = useState<string[]>(selectedSkills);

    const filteredSkills = useMemo(() => {
        if (!searchTerm) {
            return allSkills;
        }
        const lowerSearchTerm = searchTerm.toLowerCase();
        return allSkills.filter(skill =>
            skill.name.toLowerCase().includes(lowerSearchTerm) ||
            skill.category.toLowerCase().includes(lowerSearchTerm) ||
            skill.description.toLowerCase().includes(lowerSearchTerm)
        );
    }, [searchTerm, allSkills]);

    const handleCheckboxChange = (skillName: string) => {
        setCurrentSelection(prev =>
            prev.includes(skillName)
                ? prev.filter(s => s !== skillName)
                : [...prev, skillName]
        );
    };
    
    const handleSave = () => {
        onSave(currentSelection);
        onClose();
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] p-4 animate-fade-in-fast" 
            onClick={onClose}
        >
            <div 
                className="bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-w-2xl w-full transform animate-slide-in-up flex flex-col max-h-[90vh]" 
                onClick={e => e.stopPropagation()}
            >
                <div className="p-4 border-b border-slate-700">
                    <h2 className="text-xl font-bold text-amber-400">Seleccionar Habilidades</h2>
                </div>
                <div className="p-5 flex-shrink-0">
                    <input
                        type="text"
                        placeholder="Buscar habilidad..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-900 border-2 border-slate-600 rounded-lg py-2 px-4 text-white placeholder-slate-400 focus:ring-amber-500 focus:border-amber-500"
                    />
                </div>
                <div className="p-5 overflow-y-auto space-y-2">
                    {filteredSkills.map(skill => (
                        <div key={skill.name} className="flex items-center bg-slate-700/50 p-3 rounded-md">
                            <input
                                type="checkbox"
                                id={`skill-${skill.name}`}
                                className="h-5 w-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                                checked={currentSelection.includes(skill.name)}
                                onChange={() => handleCheckboxChange(skill.name)}
                            />
                            <label htmlFor={`skill-${skill.name}`} className="ml-3 block text-sm">
                                <span className="font-medium text-slate-200">{skill.name}</span>
                                <span className="text-xs text-slate-400 ml-2">({skill.category})</span>
                            </label>
                        </div>
                    ))}
                </div>
                <div className="p-4 bg-slate-900/50 border-t border-slate-700 flex justify-end gap-3 flex-shrink-0">
                    <button type="button" onClick={onClose} className="bg-slate-600 text-white font-bold py-2 px-6 rounded-md shadow-md hover:bg-slate-500 transition-colors">
                        Cancelar
                    </button>
                    <button type="button" onClick={handleSave} className="bg-amber-500 text-slate-900 font-bold py-2 px-6 rounded-md shadow-md hover:bg-amber-400 transition-colors">
                        Guardar Cambios
                    </button>
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