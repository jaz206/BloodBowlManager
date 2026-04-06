import type { Player, PlayerStats, Skill, StarPlayer, Team } from '../types';

const SKILL_CATEGORIES = ['General', 'Strength', 'Agility', 'Passing', 'Mutation', 'Trait', 'Elite'];

const cleanText = (value: unknown): string =>
    typeof value === 'string'
        ? value.replace(/\s+/g, ' ').trim()
        : '';

const cleanLongText = (value: unknown): string =>
    typeof value === 'string'
        ? value.replace(/\r\n/g, '\n').trim()
        : '';

const cleanStringArray = (value: unknown): string[] =>
    Array.from(new Set(
        (Array.isArray(value) ? value : [])
            .map(item => cleanText(item))
            .filter(Boolean)
    ));

const toInt = (value: unknown, fallback = 0): number => {
    const parsed = typeof value === 'number' ? value : parseInt(String(value ?? ''), 10);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const clampMin = (value: number, min = 0) => value < min ? min : value;

const cleanStatString = (value: unknown, fallback = '-'): string => {
    const cleaned = cleanText(value);
    return cleaned || fallback;
};

const sanitizePlayerStats = (stats: Partial<PlayerStats> | undefined): PlayerStats => ({
    MV: clampMin(toInt(stats?.MV, 0), 0),
    FU: cleanStatString(stats?.FU, '0'),
    AG: cleanStatString(stats?.AG, '-'),
    PA: cleanStatString(stats?.PA, '-'),
    AR: cleanStatString(stats?.AR, '-'),
});

const sanitizePlayer = (player: Partial<Player> | undefined): Player => ({
    qty: cleanText(player?.qty) || '0-1',
    position: cleanText(player?.position) || 'Línea',
    cost: clampMin(toInt(player?.cost, 0), 0),
    stats: sanitizePlayerStats(player?.stats),
    skillKeys: cleanStringArray(player?.skillKeys),
    primary: cleanText(player?.primary),
    secondary: cleanText(player?.secondary),
    skills: cleanText(player?.skills) || undefined,
});

export const sanitizeTeamForSave = (raw: any): Team & { crestImage?: string } => {
    const name = cleanText(raw?.name);
    if (!name) throw new Error('El equipo necesita un nombre.');

    const image = cleanText(raw?.image) || cleanText(raw?.crestImage) || undefined;
    const crestImage = cleanText(raw?.crestImage) || image || undefined;
    const tier = toInt(raw?.tier, 1);

    return {
        name,
        specialRules_es: cleanLongText(raw?.specialRules_es) || cleanLongText(raw?.specialRules) || '',
        specialRules_en: cleanLongText(raw?.specialRules_en) || cleanLongText(raw?.specialRules) || '',
        specialRules: cleanLongText(raw?.specialRules) || undefined,
        rerollCost: clampMin(toInt(raw?.rerollCost, 0), 0),
        tier: [1, 2, 3].includes(tier) ? tier : 1,
        apothecary: cleanText(raw?.apothecary) || 'No',
        roster: (Array.isArray(raw?.roster) ? raw.roster : []).map(sanitizePlayer),
        image,
        crestImage,
        ratings: {
            fuerza: clampMin(toInt(raw?.ratings?.fuerza, 0), 0),
            agilidad: clampMin(toInt(raw?.ratings?.agilidad, 0), 0),
            velocidad: clampMin(toInt(raw?.ratings?.velocidad, 0), 0),
            armadura: clampMin(toInt(raw?.ratings?.armadura, 0), 0),
            pase: clampMin(toInt(raw?.ratings?.pase, 0), 0),
        },
        description: cleanLongText(raw?.description) || undefined,
        megaFactions: cleanStringArray(raw?.megaFactions),
        namePools: cleanStringArray(raw?.namePools),
    };
};

export const sanitizeSkillForSave = (raw: any): Skill => {
    const name_es = cleanText(raw?.name_es) || cleanText(raw?.name);
    const name_en = cleanText(raw?.name_en) || cleanText(raw?.name);
    const keyEN = cleanText(raw?.keyEN) || name_en || name_es;

    if (!keyEN) throw new Error('La habilidad necesita keyEN o nombre.');

    const category = cleanText(raw?.category) || 'General';

    return {
        keyEN,
        name_es: name_es || keyEN,
        name_en: name_en || keyEN,
        category: SKILL_CATEGORIES.includes(category) ? category : 'General',
        desc_es: cleanLongText(raw?.desc_es) || cleanLongText(raw?.description) || '',
        desc_en: cleanLongText(raw?.desc_en) || cleanLongText(raw?.description) || '',
        name: cleanText(raw?.name) || undefined,
        description: cleanLongText(raw?.description) || undefined,
    };
};

export const sanitizeStarPlayerForSave = (raw: any): StarPlayer => {
    const name = cleanText(raw?.name);
    if (!name) throw new Error('La estrella necesita un nombre.');

    const skillKeys = cleanStringArray(raw?.skillKeys?.length ? raw.skillKeys : cleanText(raw?.skills).split(','));

    return {
        name,
        cost: clampMin(toInt(raw?.cost, 0), 0),
        stats: sanitizePlayerStats(raw?.stats),
        skillKeys,
        specialRules_es: cleanLongText(raw?.specialRules_es) || cleanLongText(raw?.specialRules) || '',
        specialRules_en: cleanLongText(raw?.specialRules_en) || cleanLongText(raw?.specialRules) || '',
        playsFor: cleanStringArray(raw?.playsFor),
        image: cleanText(raw?.image) || undefined,
        description: cleanLongText(raw?.description) || undefined,
        skills: cleanText(raw?.skills) || undefined,
        specialRules: cleanLongText(raw?.specialRules) || undefined,
        pair: Array.isArray(raw?.pair)
            ? raw.pair.map((item: any) => ({
                name: cleanText(item?.name),
                stats: sanitizePlayerStats(item?.stats),
                skills: cleanText(item?.skills),
                skillKeys: cleanStringArray(item?.skillKeys),
            }))
            : undefined,
    };
};

export const sanitizeInducementForSave = (raw: any) => {
    const name = cleanText(raw?.name);
    if (!name) throw new Error('El incentivo necesita un nombre.');

    return {
        name,
        cost: clampMin(toInt(raw?.cost, 0), 0),
        description: cleanLongText(raw?.description),
    };
};

export const sanitizeHeraldoItemForSave = (raw: any) => {
    const title = cleanText(raw?.title);
    if (!title) throw new Error('La noticia necesita un título.');

    const type = ['starplayer', 'team', 'skill'].includes(cleanText(raw?.type))
        ? cleanText(raw?.type)
        : 'skill';

    return {
        ...raw,
        type,
        title,
        tag: cleanText(raw?.tag) || 'Destacado',
        category: cleanText(raw?.category),
        content: cleanLongText(raw?.content),
        rule: cleanText(raw?.rule),
        active: raw?.active !== false,
    };
};

