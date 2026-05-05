import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useMasterData } from '../../hooks/useMasterData';
import type { Skill } from '../../types';
import { getSkillDescription, getSkillDisplayName, isEliteSkill } from '../../utils/skillUtils';

interface SkillBadgeProps {
    skillKey: string;
    onClick?: (skill: Skill) => void;
    variant?: 'premium' | 'default' | 'accent';
}

const SkillBadge: React.FC<SkillBadgeProps> = ({ skillKey, onClick, variant = 'default' }) => {
    const { language } = useLanguage();
    const { skills } = useMasterData();

    const skill = skills.find(s => s.keyEN === skillKey);

    if (!skill) {
        return (
            <span className="bg-slate-800/50 border border-slate-700/50 text-slate-500 text-[10px] font-display font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg">
                {skillKey}
            </span>
        );
    }

    const preferredLanguage = language === 'es' ? 'es' : 'en';
    const name = getSkillDisplayName(skill, preferredLanguage);
    const description = getSkillDescription(skill, preferredLanguage);
    const elite = isEliteSkill(skill);

    const variants = {
        premium: 'bg-premium-gold/10 border-premium-gold/30 text-premium-gold hover:bg-premium-gold/20',
        default: elite
            ? 'bg-[rgba(202,138,4,0.16)] border-[rgba(202,138,4,0.4)] text-[#8a5f10] hover:bg-[rgba(202,138,4,0.24)]'
            : 'bg-sky-500/10 border-sky-500/20 text-sky-400 hover:bg-sky-500/20 hover:border-sky-500/40',
        accent: 'bg-blood-red/10 border-blood-red/20 text-blood-red hover:bg-blood-red/20 hover:border-blood-red/40',
    };

    return (
        <div className="relative inline-flex group align-middle">
            <button
                onClick={() => onClick?.(skill)}
                className={`${variants[variant]} text-[10px] font-display font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 border inline-flex items-center gap-2`}
            >
                <span>{name}</span>
                {elite && (
                    <span className="rounded-full border border-[rgba(202,138,4,0.35)] bg-[rgba(202,138,4,0.18)] px-2 py-[2px] text-[8px] leading-none tracking-[0.2em] text-[#8a5f10]">
                        ELITE
                    </span>
                )}
            </button>

            <div className="pointer-events-none absolute left-1/2 top-full z-50 mt-3 hidden w-72 -translate-x-1/2 rounded-2xl border border-[rgba(202,138,4,0.18)] bg-[rgba(255,251,241,0.98)] p-4 text-left shadow-[0_16px_40px_rgba(92,68,39,0.18)] group-hover:block group-focus-within:block">
                <div className="mb-2 flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.24em] text-[#2b1d12] italic">{name}</span>
                    {elite && (
                        <span className="rounded-full border border-[rgba(202,138,4,0.35)] bg-[rgba(202,138,4,0.12)] px-2 py-1 text-[8px] font-black uppercase tracking-[0.22em] text-[#8a5f10]">
                            Elite
                        </span>
                    )}
                </div>
                <p className="text-[11px] leading-relaxed text-[#6f5738] italic font-medium">
                    {description || 'Sin descripción disponible.'}
                </p>
            </div>
        </div>
    );
};

export default SkillBadge;
