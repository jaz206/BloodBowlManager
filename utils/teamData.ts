import type { Team } from '../types';
import { getTeamLogoUrl, resolveTeamLogoPreference } from './imageUtils';
import { deepSanitizeText, sanitizeMojibakeText } from './textSanitizer';

export type TeamAsset = Team & {
    crestImage?: string;
    image?: string;
    record?: {
        wins: number;
        draws: number;
        losses: number;
    };
};

const EMPTY_RECORD = { wins: 0, draws: 0, losses: 0 };

const fixMojibake = (value: string): string => sanitizeMojibakeText(value);

const normalizeLookupKey = (value?: string): string =>
    fixMojibake(String(value || ''))
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9()]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

const TEAM_NAME_ALIASES: Record<string, string> = {
    'alianza del viejo mundo': 'Old World Alliance',
    'altos elfos': 'High Elves',
    'amazonas': 'Amazons',
    'amazons': 'Amazons',
    'black orcs': 'Black Orcs',
    'bretonianos': 'Bretonnians',
    'bretonnian': 'Bretonnians',
    'bretonnians': 'Bretonnians',
    'chaos dwarfs': 'Chaos Dwarfs',
    'chaos renegades': 'Chaos Renegades',
    'chosen of chaos': 'Chosen of Chaos',
    'dark elves': 'Dark Elves',
    'dwarfs': 'Dwarfs',
    'elegidos del caos': 'Chosen of Chaos',
    'elfos oscuros': 'Dark Elves',
    'elfos silvanos': 'Wood Elves',
    'elven union': 'Elven Union',
    'enanos': 'Dwarfs',
    'enanos del caos': 'Chaos Dwarfs',
    'gnomes': 'Gnomes',
    'gnomos': 'Gnomes',
    'habitantes del inframundo': 'Underworld Denizens',
    'high elves': 'High Elves',
    'hombres lagarto': 'Lizardmen',
    'horror nigromantico': 'Necromantic Horror',
    'humans': 'Humans',
    'humanos': 'Humans',
    'imperial nobility': 'Imperial Nobility',
    'lizardmen': 'Lizardmen',
    'necromantic horror': 'Necromantic Horror',
    'nobleza imperial': 'Imperial Nobility',
    'nordicos': 'Norse',
    'no muertos': 'Shambling Undead',
    'norse': 'Norse',
    'ogres': 'Ogres',
    'ogros': 'Ogres',
    'old world alliance': 'Old World Alliance',
    'orcos': 'Orcs',
    'orcos negros': 'Black Orcs',
    'orcs': 'Orcs',
    'renegados del caos': 'Chaos Renegades',
    'reyes de las tumbas': 'Tomb Kings',
    'shambling undead': 'Shambling Undead',
    'snotling': 'Snotling',
    'snotlings': 'Snotling',
    'tomb kings': 'Tomb Kings',
    'underworld denizens': 'Underworld Denizens',
    'union elfica': 'Elven Union',
    'vampires': 'Vampires',
    'vampiros': 'Vampires',
    'wood elves': 'Wood Elves',
};

const normalizeTeamName = (name?: string): string => {
    const fixed = fixMojibake(String(name || '')).trim();
    return TEAM_NAME_ALIASES[normalizeLookupKey(fixed)] || fixed;
};

export const mergeTeamWithFallback = (
    team: Partial<TeamAsset> | undefined,
    fallback?: TeamAsset | null
): TeamAsset => {
    const source = fallback || ({} as TeamAsset);
    const sanitizedTeam = deepSanitizeText(team || {} as Partial<TeamAsset>);
    const sanitizedSource = deepSanitizeText(source);
    const roster = sanitizedTeam?.roster?.length ? sanitizedTeam.roster : sanitizedSource.roster || [];
    const resolvedName = normalizeTeamName(sanitizedTeam?.name || sanitizedSource.name || '');
    const computedLogo = resolvedName ? getTeamLogoUrl(resolvedName) : '';
    const preferredImage = resolvedName
        ? resolveTeamLogoPreference(resolvedName, sanitizedTeam?.image || sanitizedTeam?.crestImage)
        : (sanitizedTeam?.image || sanitizedTeam?.crestImage || '');
    const fallbackImage = resolvedName
        ? resolveTeamLogoPreference(resolvedName, sanitizedSource.image || sanitizedSource.crestImage)
        : (sanitizedSource.image || sanitizedSource.crestImage || '');
    const resolvedRatings = {
        fuerza: sanitizedTeam?.ratings?.fuerza ?? sanitizedSource.ratings?.fuerza ?? 0,
        agilidad: sanitizedTeam?.ratings?.agilidad ?? sanitizedSource.ratings?.agilidad ?? 0,
        velocidad: sanitizedTeam?.ratings?.velocidad ?? sanitizedSource.ratings?.velocidad ?? 0,
        armadura: sanitizedTeam?.ratings?.armadura ?? sanitizedSource.ratings?.armadura ?? 0,
        pase: sanitizedTeam?.ratings?.pase ?? sanitizedSource.ratings?.pase ?? 0,
    };

    return {
        name: resolvedName,
        specialRules_es: sanitizedTeam?.specialRules_es || sanitizedSource.specialRules_es || sanitizedTeam?.specialRules || sanitizedSource.specialRules || '',
        specialRules_en: sanitizedTeam?.specialRules_en || sanitizedSource.specialRules_en || sanitizedTeam?.specialRules || sanitizedSource.specialRules || '',
        specialRules: sanitizedTeam?.specialRules || sanitizedSource.specialRules || sanitizedTeam?.specialRules_es || sanitizedSource.specialRules_es || sanitizedTeam?.specialRules_en || sanitizedSource.specialRules_en || '',
        rerollCost: sanitizedTeam?.rerollCost ?? sanitizedSource.rerollCost ?? 0,
        tier: sanitizedTeam?.tier ?? sanitizedSource.tier ?? 0,
        apothecary: sanitizedTeam?.apothecary || sanitizedSource.apothecary || 'No',
        roster,
        image: preferredImage || fallbackImage || computedLogo,
        crestImage: preferredImage || fallbackImage || computedLogo,
        ratings: resolvedRatings,
        description: sanitizedTeam?.description || sanitizedSource.description || '',
        megaFactions: sanitizedTeam?.megaFactions || sanitizedSource.megaFactions || [],
        namePools: sanitizedTeam?.namePools || sanitizedSource.namePools || [],
    };
};

export const ensureTeamRecord = (team: Partial<TeamAsset> | undefined, fallback?: TeamAsset | null): TeamAsset => {
    const merged = mergeTeamWithFallback(team, fallback);
    return {
        ...merged,
        record: merged.record || fallback?.record || EMPTY_RECORD,
    };
};

export const normalizeTeamCollection = (items: Partial<TeamAsset>[], fallbacks: TeamAsset[] = []): TeamAsset[] => {
    const deduped = new Map<string, Partial<TeamAsset>>();

    items.forEach((item) => {
        const normalizedName = normalizeTeamName(item?.name);
        const key = normalizeLookupKey(normalizedName);
        const previous = deduped.get(key) || {};
        deduped.set(key, {
            ...previous,
            ...item,
            name: normalizedName,
            image: item?.image ?? previous.image,
            crestImage: item?.crestImage ?? previous.crestImage,
            roster: item?.roster?.length ? item.roster : previous.roster,
            ratings: item?.ratings ? { ...(previous.ratings || {}), ...item.ratings } : previous.ratings,
            megaFactions: item?.megaFactions?.length ? item.megaFactions : previous.megaFactions,
            namePools: item?.namePools?.length ? item.namePools : previous.namePools,
        });
    });

    return Array.from(deduped.values()).map((item) => {
        const normalizedName = normalizeTeamName(item?.name);
        const fallback = fallbacks.find((candidate) => normalizeTeamName(candidate.name) === normalizedName) || null;
        return ensureTeamRecord({ ...item, name: normalizedName }, fallback);
    });
};
