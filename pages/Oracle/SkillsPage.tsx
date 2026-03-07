import React, { useState, useMemo } from 'react';
import type { Skill } from '../../types';
import { useMasterData } from '../../hooks/useMasterData';
import { useLanguage } from '../../contexts/LanguageContext';

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
            <p className="text-slate-300 mt-2 text-sm leading-relaxed">{skill.description}</p>
        </div>
    );
};

const Skills: React.FC = () => {
    const { skills, loading } = useMasterData();
    const { t } = useLanguage();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredSkills = useMemo(() => {
        if (!searchTerm) {
            return skills;
        }
        return skills.filter(skill =>
            skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            skill.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            skill.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, skills]);

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-semibold text-amber-400 mb-2">{t('oracle.skills.title')}</h2>
                <p className="text-slate-400 max-w-lg mx-auto">Busca habilidades por nombre, categoría o descripción.</p>
            </div>

            <div className="sticky top-2 z-10 mb-6 flex justify-center">
                <input
                    type="text"
                    placeholder={t('oracle.skills.filter')}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full max-w-md bg-slate-900 border-2 border-slate-600 rounded-lg py-3 px-4 text-white placeholder-slate-400 focus:ring-amber-500 focus:border-amber-500 shadow-lg"
                    aria-label={t('oracle.skills.filter')}
                />
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
                </div>
            ) : filteredSkills.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredSkills.map(skill => (
                        <SkillCard key={skill.name} skill={skill} />
                    ))}
                </div>
            ) : (
                <p className="text-center text-slate-400 py-8">
                    {t('oracle.skills.empty')}
                </p>
            )}
        </div>
    );
};

export default Skills;