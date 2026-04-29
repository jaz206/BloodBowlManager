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

const SKILL_CATEGORY_MAP: Record<string, string> = {
    general: 'General',
    fuerza: 'Strength',
    strength: 'Strength',
    agilidad: 'Agility',
    agility: 'Agility',
    pase: 'Passing',
    passing: 'Passing',
    mutacion: 'Mutation',
    mutation: 'Mutation',
    rasgo: 'Trait',
    trait: 'Trait',
    triquinuelas: 'Triquiñuelas',
    trickery: 'Triquiñuelas',
    elite: 'Elite'
};

export const getSkillCategoryId = (value?: string) => {
    const normalized = normalizeSkillLookup(value);
    return SKILL_CATEGORY_MAP[normalized] || sanitizeMojibakeText(value || '');
};

export const isEliteSkill = (skill: Skill, eliteSkillKeys: string[]) =>
    eliteSkillKeys.includes(skill.keyEN) || getSkillCategoryId(skill.category) === 'Elite';

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
    const normalizedCategory = getSkillCategoryId(skill.category);
    return allowedCategories.some((category) => getSkillCategoryId(category) === normalizedCategory);
};
