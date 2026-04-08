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

const TEAM_NAME_ALIASES: Record<string, string> = {
    'Alianza del Viejo Mundo': 'Old World Alliance',
    'Altos Elfos': 'High Elves',
    'Amazonas': 'Amazons',
    'Bretonnian': 'Bretonnians',
    'Elegidos del Caos': 'Chosen of Chaos',
    'Elfos Oscuros': 'Dark Elves',
    'Elfos Silvanos': 'Wood Elves',
    'Enanos': 'Dwarfs',
    'Enanos del Caos': 'Chaos Dwarfs',
    'Gnomos': 'Gnomes',
    'Habitantes del Inframundo': 'Underworld Denizens',
    'Hombres Lagarto': 'Lizardmen',
    'Horror Nigromántico': 'Necromantic Horror',
    'Horror Nigrom??ntico': 'Necromantic Horror',
    'Horror Nigrom?ntico': 'Necromantic Horror',
    'Humanos': 'Humans',
    'Nórdicos': 'Norse',
    'N?rdicos': 'Norse',
    'No Muertos': 'Shambling Undead',
    'Nordicos': 'Norse',
    'Ogros': 'Ogres',
    'Orcos': 'Orcs',
    'Orcos Negros': 'Black Orcs',
    'Renegados del Caos': 'Chaos Renegades',
    'Reyes de las Tumbas': 'Tomb Kings',
    'Unión Élfica': 'Elven Union',
    'Uni?n ?lfica': 'Elven Union',
    'Union Elfica': 'Elven Union',
    'Vampiros': 'Vampires',
    'Amazons': 'Amazons',
    'Black Orcs': 'Black Orcs',
    'Bretonnians': 'Bretonnians',
    'Chaos Dwarfs': 'Chaos Dwarfs',
    'Chaos Renegades': 'Chaos Renegades',
    'Chosen of Chaos': 'Chosen of Chaos',
    'Dark Elves': 'Dark Elves',
    'Dwarfs': 'Dwarfs',
    'Elven Union': 'Elven Union',
    'Gnomes': 'Gnomes',
    'High Elves': 'High Elves',
    'Humans': 'Humans',
    'Lizardmen': 'Lizardmen',
    'Necromantic Horror': 'Necromantic Horror',
    'Norse': 'Norse',
    'Ogres': 'Ogres',
    'Old World Alliance': 'Old World Alliance',
    'Orcs': 'Orcs',
    'Shambling Undead': 'Shambling Undead',
    'Tomb Kings': 'Tomb Kings',
    'Underworld Denizens': 'Underworld Denizens',
    'Vampires': 'Vampires',
    'Wood Elves': 'Wood Elves',
};

const normalizeTeamName = (name?: string): string => TEAM_NAME_ALIASES[name || ''] || name || '';

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
