import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useMasterData } from '../../hooks/useMasterData';
import type { Skill } from '../../types';

interface SkillBadgeProps {
    skillKey: string;
    onClick?: (skill: Skill) => void;
    variant?: 'premium' | 'default' | 'accent';
}

const SkillBadge: React.FC<SkillBadgeProps> = ({ skillKey, onClick, variant = 'default' }) => {
    const { language } = useLanguage();
    const { skills } = useMasterData();

    // Find the skill by keyEN (canonical)
    const skill = skills.find(s => s.keyEN === skillKey);

    if (!skill) {
        return (
            <span className="bg-slate-800/50 border border-slate-700/50 text-slate-500 text-[10px] font-display font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg">
                {skillKey}
            </span>
        );
    }

    const name = language === 'es' ? (skill.name_es || skill.name_en) : skill.name_en;

    const variants = {
        premium: 'bg-premium-gold/10 border-premium-gold/30 text-premium-gold hover:bg-premium-gold/20',
        default: 'bg-sky-500/10 border-sky-500/20 text-sky-400 hover:bg-sky-500/20 hover:border-sky-500/40',
        accent: 'bg-blood-red/10 border-blood-red/20 text-blood-red hover:bg-blood-red/20 hover:border-blood-red/40',
    };

    return (
        <button
            onClick={() => onClick?.(skill)}
            className={`${variants[variant]} text-[10px] font-display font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 border`}
        >
            {name}
        </button>
    );
};

export default SkillBadge;
