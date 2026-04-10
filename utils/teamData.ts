import type { Team, ManagedPlayer, ManagedTeam } from '../types';
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


const ensureArray = <T = any>(value: unknown): T[] => Array.isArray(value) ? value : [];
const normalizeJerseyNumber = (value: unknown): number | undefined => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 1 || parsed > 99) return undefined;
    return Math.trunc(parsed);
};

export const normalizeManagedPlayerRecord = (player: Partial<ManagedPlayer> | undefined): ManagedPlayer => {
    const raw = deepSanitizeText((player || {}) as Partial<ManagedPlayer>);
    const stats = raw.stats || { MV: 0, FU: 0, AG: '-', PA: '-', AR: '-' };
    const jerseyNumber = normalizeJerseyNumber((raw as any).jerseyNumber ?? (raw as any).number);

    return {
        id: Number(raw.id ?? Date.now()),
        jerseyNumber,
        qty: raw.qty || '0-1',
        position: raw.position || '',
        cost: Number(raw.cost ?? 0),
        stats: {
            MV: Number((stats as any).MV ?? 0),
            FU: String((stats as any).FU ?? '0'),
            AG: String((stats as any).AG ?? '-'),
            PA: String((stats as any).PA ?? '-'),
            AR: String((stats as any).AR ?? '-'),
        },
        primary: raw.primary || '',
        secondary: raw.secondary || '',
        skillKeys: ensureArray(raw.skillKeys).filter(Boolean),
        skills: raw.skills || '',
        customName: raw.customName || raw.position || 'Jugador',
        spp: Number(raw.spp ?? 0),
        gainedSkills: ensureArray(raw.gainedSkills).filter(Boolean),
        lastingInjuries: ensureArray(raw.lastingInjuries).filter(Boolean),
        status: (raw.status as ManagedPlayer['status']) || 'Reserva',
        statusDetail: raw.statusDetail,
        isBenched: raw.isBenched ?? true,
        missNextGame: Number(raw.missNextGame ?? 0),
        fieldPosition: raw.fieldPosition,
        sppActions: raw.sppActions || {},
        isStarPlayer: !!raw.isStarPlayer,
        isJourneyman: !!raw.isJourneyman,
        advancements: ensureArray(raw.advancements),
        isDistracted: !!raw.isDistracted,
        hasIndigestion: !!raw.hasIndigestion,
        isActivated: !!raw.isActivated,
        image: raw.image,
    };
};

export const normalizeManagedTeamRecord = (team: Partial<ManagedTeam> | undefined): ManagedTeam => {
    const raw = deepSanitizeText((team || {}) as Partial<ManagedTeam>);

    return {
        id: raw.id,
        ownerId: raw.ownerId,
        name: raw.name || 'Franquicia',
        rosterName: normalizeTeamName(raw.rosterName || raw.name || ''),
        treasury: Number(raw.treasury ?? 0),
        rerolls: Number(raw.rerolls ?? 0),
        dedicatedFans: Number(raw.dedicatedFans ?? 0),
        cheerleaders: Number(raw.cheerleaders ?? 0),
        assistantCoaches: Number(raw.assistantCoaches ?? 0),
        apothecary: !!raw.apothecary,
        players: ensureArray(raw.players).map((player) => normalizeManagedPlayerRecord(player as Partial<ManagedPlayer>)),
        crestImage: raw.crestImage,
        isAutoCalculating: raw.isAutoCalculating ?? false,
        liveRerolls: Number(raw.liveRerolls ?? raw.rerolls ?? 0),
        tempBribes: Number(raw.tempBribes ?? 0),
        tempCheerleaders: Number(raw.tempCheerleaders ?? 0),
        tempAssistantCoaches: Number(raw.tempAssistantCoaches ?? 0),
        coachExpelled: !!raw.coachExpelled,
        apothecaryUsedOnKO: !!raw.apothecaryUsedOnKO,
        biasedRef: !!raw.biasedRef,
        wanderingApothecaries: Number(raw.wanderingApothecaries ?? 0),
        plagueDoctors: Number(raw.plagueDoctors ?? 0),
        mortuaryAssistants: Number(raw.mortuaryAssistants ?? 0),
        tempWizard: !!raw.tempWizard,
        fanAttendance: Number(raw.fanAttendance ?? 0),
        hasStalled: !!raw.hasStalled,
        updatedAt: raw.updatedAt,
        totalTV: Number(raw.totalTV ?? 0),
        record: raw.record || { wins: 0, draws: 0, losses: 0 },
        history: ensureArray(raw.history),
        snapshots: ensureArray(raw.snapshots),
    };
};

export const normalizeManagedTeamCollection = (items: Partial<ManagedTeam>[] = []): ManagedTeam[] =>
    ensureArray(items).map((team) => normalizeManagedTeamRecord(team));
