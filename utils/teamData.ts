import type { Team } from '../types';

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

export const mergeTeamWithFallback = (
    team: Partial<TeamAsset> | undefined,
    fallback?: TeamAsset | null
): TeamAsset => {
    const source = fallback || ({} as TeamAsset);
    const roster = team?.roster?.length ? team.roster : source.roster || [];

    return {
        name: team?.name || source.name || '',
        specialRules_es: team?.specialRules_es || source.specialRules_es || team?.specialRules || source.specialRules || '',
        specialRules_en: team?.specialRules_en || source.specialRules_en || team?.specialRules || source.specialRules || '',
        specialRules: team?.specialRules || source.specialRules || team?.specialRules_es || source.specialRules_es || team?.specialRules_en || source.specialRules_en || '',
        rerollCost: team?.rerollCost ?? source.rerollCost ?? 0,
        tier: team?.tier ?? source.tier ?? 0,
        apothecary: team?.apothecary || source.apothecary || 'No',
        roster,
        image: team?.image || source.image || source.crestImage || '',
        crestImage: team?.crestImage || source.crestImage || source.image || team?.image || '',
        ratings: team?.ratings || source.ratings || {
            fuerza: 0,
            agilidad: 0,
            velocidad: 0,
            armadura: 0,
            pase: 0,
        },
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
