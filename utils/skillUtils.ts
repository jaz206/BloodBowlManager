import type { Skill } from '../types';
import { sanitizeMojibakeText } from './textSanitizer';

export const normalizeSkillLookup = (value?: string) =>
    sanitizeMojibakeText(String(value || ''))
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9+]+/g, ' ')
        .trim();

export const getSkillDisplayName = (skill: Skill, preferredLanguage: 'es' | 'en' = 'es') =>
    sanitizeMojibakeText(
        preferredLanguage === 'es'
            ? skill.name_es || skill.name_en || skill.name || skill.keyEN
            : skill.name_en || skill.name_es || skill.name || skill.keyEN
    );

export const getSkillDescription = (skill: Skill, preferredLanguage: 'es' | 'en' = 'es') =>
    sanitizeMojibakeText(
        preferredLanguage === 'es'
            ? skill.desc_es || skill.desc_en || skill.description || ''
            : skill.desc_en || skill.desc_es || skill.description || ''
    );

export const findSkillRecord = (skills: Skill[], skillRef: string) => {
    const cleanRef = sanitizeMojibakeText(skillRef.split('(')[0].trim());
    const lookup = normalizeSkillLookup(cleanRef);
    return skills.find((skill) =>
        [skill.keyEN, skill.name_es, skill.name_en, skill.name].some(
            (candidate) => normalizeSkillLookup(candidate) === lookup || normalizeSkillLookup(candidate).startsWith(lookup)
        )
    );
};

export const skillHasDescription = (skills: Skill[], skillRef: string) => !!findSkillRecord(skills, skillRef);

export const skillCategoryMatches = (skill: Skill, allowedCategories: string[]) => {
    const normalizedCategory = normalizeSkillLookup(skill.category);
    return allowedCategories.some((category) => normalizeSkillLookup(category) === normalizedCategory);
};
