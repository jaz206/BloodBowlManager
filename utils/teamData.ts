import type { Team } from '../types';
import { getTeamLogoUrl, resolveTeamLogoPreference } from './imageUtils';

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

const fixMojibake = (value: string): string => value
    .replace(/Ã¡/g, 'á')
    .replace(/Ã©/g, 'é')
    .replace(/Ã­/g, 'í')
    .replace(/Ã³/g, 'ó')
    .replace(/Ãº/g, 'ú')
    .replace(/Ã‰/g, 'É')
    .replace(/Ã/g, 'Á')
    .replace(/\?\?/g, '')
    .replace(/\?/g, '');

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
    'lizardmen': 'Lizardmen',
    'necromantic horror': 'Necromantic Horror',
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
    const roster = team?.roster?.length ? team.roster : source.roster || [];
    const resolvedName = normalizeTeamName(team?.name || source.name || '');
    const computedLogo = resolvedName ? getTeamLogoUrl(resolvedName) : '';
    const preferredImage = resolvedName
        ? resolveTeamLogoPreference(resolvedName, team?.image || team?.crestImage)
        : (team?.image || team?.crestImage || '');
    const fallbackImage = resolvedName
        ? resolveTeamLogoPreference(resolvedName, source.image || source.crestImage)
        : (source.image || source.crestImage || '');
    const resolvedRatings = {
        fuerza: team?.ratings?.fuerza ?? source.ratings?.fuerza ?? 0,
        agilidad: team?.ratings?.agilidad ?? source.ratings?.agilidad ?? 0,
        velocidad: team?.ratings?.velocidad ?? source.ratings?.velocidad ?? 0,
        armadura: team?.ratings?.armadura ?? source.ratings?.armadura ?? 0,
        pase: team?.ratings?.pase ?? source.ratings?.pase ?? 0,
    };

    return {
        name: resolvedName,
        specialRules_es: team?.specialRules_es || source.specialRules_es || team?.specialRules || source.specialRules || '',
        specialRules_en: team?.specialRules_en || source.specialRules_en || team?.specialRules || source.specialRules || '',
        specialRules: team?.specialRules || source.specialRules || team?.specialRules_es || source.specialRules_es || team?.specialRules_en || source.specialRules_en || '',
        rerollCost: team?.rerollCost ?? source.rerollCost ?? 0,
        tier: team?.tier ?? source.tier ?? 0,
        apothecary: team?.apothecary || source.apothecary || 'No',
        roster,
        image: preferredImage || fallbackImage || computedLogo,
        crestImage: preferredImage || fallbackImage || computedLogo,
        ratings: resolvedRatings,
        description: team?.description || source.description || '',
        megaFactions: team?.megaFactions || source.megaFactions || [],
        namePools: team?.namePools || source.namePools || [],
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
    return items.map((item) => {
        const normalizedName = normalizeTeamName(item?.name);
        const fallback = fallbacks.find((candidate) => normalizeTeamName(candidate.name) === normalizedName) || null;
        return ensureTeamRecord({ ...item, name: normalizedName }, fallback);
    });
};

