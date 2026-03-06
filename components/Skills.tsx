
import React, { useState, useMemo } from 'react';
import { skillsData } from '../data/skills';
import type { Skill } from '../types';

const SkillCard: React.FC<{ skill: Skill }> = ({ skill }) => {
    const categoryColor: Record<string, string> = {
        'General': 'bg-slate-600 text-slate-200',
        'Agilidad': 'bg-emerald-600 text-white',
        'Fuerza': 'bg-red-700 text-white',
        'Pase': 'bg-sky-600 text-white',
        'Mutación': 'bg-purple-600 text-white',
        'Rasgo': 'bg-yellow-700 text-white',
    };

    return (
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
            <div className="flex justify-between items-start gap-4">
                <h3 className="text-lg font-semibold text-amber-400">{skill.name}</h3>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${categoryColor[skill.category] || 'bg-gray-500'}`}>
                    {skill.category}
                </span>
            </div>
            <p className="text-slate-300 mt-2 text-sm">{skill.description}</p>
        </div>
    );
};

const Skills: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredSkills = useMemo(() => {
        if (!searchTerm) {
            return skillsData;
        }
        return skillsData.filter(skill =>
            skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            skill.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            skill.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm]);

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-semibold text-amber-400 mb-2">Referencia de Habilidades</h2>
                <p className="text-slate-400 max-w-lg mx-auto">Busca habilidades por nombre, categoría o descripción.</p>
            </div>

            <div className="sticky top-2 z-10">
                <input
                    type="text"
                    placeholder="Buscar habilidad o rasgo..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-900 border-2 border-slate-600 rounded-lg py-3 px-4 text-white placeholder-slate-400 focus:ring-amber-500 focus:border-amber-500 shadow-lg"
                    aria-label="Buscar habilidad o rasgo"
                />
            </div>

            <div className="space-y-4">
                {filteredSkills.length > 0 ? (
                    filteredSkills.map(skill => <SkillCard key={skill.name} skill={skill} />)
                ) : (
                    <p className="text-center text-slate-400 py-8">No se encontraron habilidades que coincidan con la búsqueda.</p>
                )}
            </div>
        </div>
    );
};

export default Skills;