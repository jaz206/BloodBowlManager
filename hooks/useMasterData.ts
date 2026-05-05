import { useState, useEffect, useCallback } from 'react';
import { db } from '../firebaseConfig';
import { collection, doc, onSnapshot, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { useLanguage } from '../contexts/LanguageContext';

// â”€â”€ Static Fallback Data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
import { starPlayersData as staticStarsData } from '../data/starPlayers';
import { inducements as staticInducementsEs } from '../data/inducements';
import { inducementsData as staticInducementsEn } from '../data/inducements_en';
import { ensureTeamRecord, normalizeTeamCollection, type TeamAsset } from '../utils/teamData';
import { deepSanitizeText, sanitizeMojibakeText } from '../utils/textSanitizer';

import type { Team, Skill, StarPlayer, Inducement } from '../types';

// â”€â”€ Firestore collection ID â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const MASTER_COL = 'master_data';

const normalizeStarPlayerRecord = (star: StarPlayer): StarPlayer => {
    const normalized = deepSanitizeText(star);

    return {
        ...normalized,
        stats: normalized.stats
            ? {
                ...normalized.stats,
                PA: normalized.stats.PA === 'Ã¢â‚¬â€œ' ? '-' : normalized.stats.PA
            }
            : normalized.stats
    };
};

const normalizeStarPlayersCollection = (items: StarPlayer[]) =>
    items.map(normalizeStarPlayerRecord);

const coerceFirestoreItemsArray = <T,>(value: unknown): T[] => {
    if (Array.isArray(value)) return value as T[];
    if (value && typeof value === 'object') {
        return Object.keys(value as Record<string, unknown>)
            .sort((a, b) => Number(a) - Number(b))
            .map((key) => (value as Record<string, unknown>)[key] as T);
    }
    return [];
};

const extractMasterDocItems = <T,>(rawData: unknown): T[] => {
    if (!rawData || typeof rawData !== 'object') return [];

    const data = rawData as Record<string, unknown>;

    if ('items' in data) {
        return coerceFirestoreItemsArray<T>(data.items);
    }

    // Some master docs were saved as indexed root fields: { "0": {...}, "1": {...} }
    const numericRootKeys = Object.keys(data).filter((key) => /^\d+$/.test(key));
    if (numericRootKeys.length > 0) {
        return numericRootKeys
            .sort((a, b) => Number(a) - Number(b))
            .map((key) => data[key] as T);
    }

    return [];
};

const normalizeSkillRecord = (skill: Skill): Skill => {
    const normalized = deepSanitizeText(skill) as Skill & Record<string, any>;
    const keyEN = sanitizeMojibakeText(String(normalized.keyEN || normalized.name_en || normalized.name || normalized.name_es || '')).trim();
    const nameEs = sanitizeMojibakeText(String(normalized.name_es || normalized.name || normalized.name_en || keyEN || '')).trim();
    const nameEn = sanitizeMojibakeText(String(normalized.name_en || normalized.keyEN || normalized.name || normalized.name_es || '')).trim();
    const descEs = sanitizeMojibakeText(String(normalized.desc_es || normalized.description || normalized.desc_en || '')).trim();
    const descEn = sanitizeMojibakeText(String(normalized.desc_en || normalized.description || normalized.desc_es || '')).trim();
    const category = sanitizeMojibakeText(String(normalized.category || 'General')).trim() || 'General';

    return {
        ...normalized,
        keyEN,
        name_es: nameEs,
        name_en: nameEn,
        desc_es: descEs,
        desc_en: descEn,
        category,
        name: normalized.name || nameEs || nameEn || keyEN,
        description: normalized.description || descEs || descEn || ''
    };
};

const getSkillIdentityKey = (skill: Skill) =>
    sanitizeMojibakeText(String(skill.keyEN || skill.name_en || skill.name_es || skill.name || ''))
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();

const getSkillRichnessScore = (skill: Skill) => {
    const fields = [skill.keyEN, skill.name_en, skill.name_es, skill.desc_en, skill.desc_es, skill.description];
    return fields.reduce((score, field) => score + (String(field || '').trim().length > 0 ? 1 : 0), 0);
};

const mergeSkillRecords = (base: Skill, incoming: Skill): Skill => ({
    ...base,
    ...incoming,
    keyEN: base.keyEN || incoming.keyEN,
    name_en: base.name_en || incoming.name_en,
    name_es: base.name_es || incoming.name_es,
    name: base.name || incoming.name,
    desc_en: base.desc_en || incoming.desc_en,
    desc_es: base.desc_es || incoming.desc_es,
    description: base.description || incoming.description,
    category: base.category || incoming.category,
    isElite: base.isElite === true || incoming.isElite === true,
});

const normalizeSkillsCollection = (items: Skill[]) => {
    const normalized = items
        .map(normalizeSkillRecord)
        .filter((skill) => Boolean(skill.keyEN || skill.name_es || skill.name_en));

    const deduped = new Map<string, Skill>();

    normalized.forEach((skill) => {
        const identity = getSkillIdentityKey(skill);
        if (!identity) return;

        const existing = deduped.get(identity);
        if (!existing) {
            deduped.set(identity, skill);
            return;
        }

        const existingScore = getSkillRichnessScore(existing) + (existing.isElite === true ? 10 : 0);
        const incomingScore = getSkillRichnessScore(skill) + (skill.isElite === true ? 10 : 0);

        if (incomingScore > existingScore) {
            deduped.set(identity, mergeSkillRecords(skill, existing));
        } else {
            deduped.set(identity, mergeSkillRecords(existing, skill));
        }
    });

    return [...deduped.values()];
};

const stripUndefinedDeep = <T,>(value: T): T => {
    if (Array.isArray(value)) {
        return value
            .filter((item) => item !== undefined)
            .map((item) => stripUndefinedDeep(item)) as T;
    }

    if (value && typeof value === 'object') {
        return Object.fromEntries(
            Object.entries(value as Record<string, unknown>)
                .filter(([, entry]) => entry !== undefined)
                .map(([key, entry]) => [key, stripUndefinedDeep(entry)])
        ) as T;
    }

    return value;
};

const sanitizeCollectionForFirestore = <T,>(items: T[]): T[] =>
    items.map((item) => stripUndefinedDeep(item));

// â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

/**
 * useMasterData hook -- Firestore-first.
 *
 * Data layout in Firestore:
 *   master_data/teams          â†’ { items: Team[], updatedAt }
 *   master_data/skills         â†’ { items: Skill[], updatedAt }
 *   master_data/star_players   â†’ { items: StarPlayer[], updatedAt }
 *   master_data/inducements_es â†’ { items: Inducement[], updatedAt }
 *   master_data/inducements_en â†’ { items: Inducement[], updatedAt }
 *   master_data/meta           â†’ { lastSync, version, ... }
 */
export const useMasterData = () => {
    const { language } = useLanguage();

    // â”€â”€ State â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const [teams, setTeams] = useState<Team[]>([]);
    const [skills, setSkills] = useState<Skill[]>([]);
    const [starPlayers, setStarPlayers] = useState<StarPlayer[]>(normalizeStarPlayersCollection(staticStarsData));
    const [inducements, setInducements] = useState<Inducement[]>(language === 'es' ? staticInducementsEs : (staticInducementsEn as unknown as Inducement[]));
    const [heraldoItems, setHeraldoItems] = useState<any[]>([]);
    const [heroImage, setHeroImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
    const [lastSync, setLastSync] = useState<string | null>(null);
    const [isFromFirestore, setIsFromFirestore] = useState(false);

    const normalizeTeams = useCallback((items: Team[]) => {
        return normalizeTeamCollection(items as Partial<TeamAsset>[]);
    }, []);

    // â”€â”€ Firestore listeners â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    useEffect(() => {
        if (!db) {
            setTeams([]);
            setSkills([]);
            setStarPlayers(normalizeStarPlayersCollection(staticStarsData));
            setInducements(language === 'es' ? staticInducementsEs : (staticInducementsEn as unknown as Inducement[]));
            setLoading(false);
            return;
        }

        setLoading(true);
        let resolved = 0;
        const TOTAL = 6; // teams, skills, stars, inducements, hero, heraldo

        const checkDone = () => {
            resolved++;
            if (resolved >= TOTAL) setLoading(false);
        };

        // Teams listener
        const unsubTeams = onSnapshot(
            doc(db, MASTER_COL, 'teams'),
            (snap) => {
                const teamItems = snap.exists() ? extractMasterDocItems<Team>(snap.data()) : [];
                if (teamItems.length > 0) {
                    setTeams(normalizeTeams(teamItems));
                    setIsFromFirestore(true);
                    setError(null);
                } else {
                    setTeams([]);
                    setIsFromFirestore(true);
                }
                checkDone();
            },
            (err) => {
                console.warn("Firestore Teams error:", err.code);
                if (err.code === 'permission-denied') {
                    setError(err);
                }
                setTeams([]);
                setIsFromFirestore(false);
                checkDone();
            }
        );

        // Skills listener â€” uses consolidated bilingual document
        const unsubSkills = onSnapshot(
            doc(db, MASTER_COL, 'skills'),
            (snap) => {
                const skillItems = snap.exists() ? extractMasterDocItems<Skill>(snap.data()) : [];
                if (skillItems.length > 0) {
                    setSkills(normalizeSkillsCollection(skillItems));
                } else {
                    setSkills([]);
                }
                checkDone();
            },
            () => { setSkills([]); checkDone(); }
        );

        // Star Players listener
        const unsubStars = onSnapshot(
            doc(db, MASTER_COL, 'star_players'),
            (snap) => {
                const starItems = snap.exists() ? extractMasterDocItems<StarPlayer>(snap.data()) : [];
                if (starItems.length > 0) {
                    setStarPlayers(normalizeStarPlayersCollection(starItems));
                } else {
                    setStarPlayers(normalizeStarPlayersCollection(staticStarsData));
                }
                checkDone();
            },
            () => { setStarPlayers(normalizeStarPlayersCollection(staticStarsData)); checkDone(); }
        );

        // Inducements listener â€” language-aware
        const inducementsDoc = language === 'es' ? 'inducements_es' : 'inducements_en';
        const staticInducementsFallback = language === 'es' ? staticInducementsEs : (staticInducementsEn as unknown as Inducement[]);
        const unsubInducements = onSnapshot(
            doc(db, MASTER_COL, inducementsDoc),
            (snap) => {
                const inducementItems = snap.exists() ? extractMasterDocItems<Inducement>(snap.data()) : [];
                if (inducementItems.length > 0) {
                    setInducements(inducementItems);
                } else {
                    setInducements(staticInducementsFallback);
                }
                checkDone();
            },
            () => { setInducements(staticInducementsFallback); checkDone(); }
        );

        // Hero image + meta listener
        const unsubHero = onSnapshot(
            doc(db, 'settings_master', 'home_hero'),
            (snap) => {
                if (snap.exists()) setHeroImage(snap.data().url);
                checkDone();
            },
            () => checkDone()
        );

        // Heraldo listener
        const unsubHeraldo = onSnapshot(
            doc(db, MASTER_COL, 'heraldo'),
            (snap) => {
                const heraldoData = snap.exists() ? extractMasterDocItems<any>(snap.data()) : [];
                if (heraldoData.length > 0) {
                    setHeraldoItems(heraldoData);
                } else {
                    setHeraldoItems([]);
                }
                checkDone();
            },
            () => { setHeraldoItems([]); checkDone(); }
        );

        // Meta listener (for last sync info)
        const unsubMeta = onSnapshot(
            doc(db, MASTER_COL, 'meta'),
            (snap) => {
                if (snap.exists()) {
                    const d = snap.data();
                    setLastSync(d.version ?? null);
                }
            },
            () => { }
        );

        return () => {
            unsubTeams();
            unsubSkills();
            unsubStars();
            unsubInducements();
            unsubHero();
            unsubHeraldo();
            unsubMeta();
        };
        // Re-subscribe when language changes to get the right inducements doc
    }, [language]);

    // â”€â”€ Sync to Firestore (admin action) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    /**
     * Uploads all master data to Firestore.
     * Overwrites existing documents atomically.
     * Only admins should be able to call this (enforced by Firestore Rules).
     */
    // â”€â”€ Sync to Firestore (admin action) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    /**
     * Uploads master data to Firestore using Firestore as source of truth.
     * @param force - If true, performs a full overwrite.
     */
    const syncMasterData = useCallback(async (force = false): Promise<void> => {
        if (!db) throw new Error('Firebase no estÃ¡ disponible');

        setSyncStatus('syncing');
        setError(null);

        try {
            const ts = serverTimestamp();

            // Helper to merge arrays preserving Firestore versions
            const mergeItems = (firestoreItems: any[], staticItems: any[], identifier: string) => {
                if (force) return staticItems;
                const merged = [...firestoreItems];
                staticItems.forEach(si => {
                    const id = si[identifier];
                    if (!merged.find(mi => mi[identifier] === id)) {
                        merged.push(si);
                    }
                });
                return merged;
            };

            // Fetch current data for merging
            const [teamsSnap, skillsSnap, starsSnap, inducEsSnap, inducEnSnap] = await Promise.all([
                getDoc(doc(db, MASTER_COL, 'teams')),
                getDoc(doc(db, MASTER_COL, 'skills')),
                getDoc(doc(db, MASTER_COL, 'star_players')),
                getDoc(doc(db, MASTER_COL, 'inducements_es')),
                getDoc(doc(db, MASTER_COL, 'inducements_en')),
                getDoc(doc(db, MASTER_COL, 'heraldo')),
            ]);

            const teamsToSave = sanitizeCollectionForFirestore(
                normalizeTeams(teamsSnap.exists() ? extractMasterDocItems<Team>(teamsSnap.data()) : [])
            );
            const skillsToSave = sanitizeCollectionForFirestore(
                normalizeSkillsCollection(skillsSnap.exists() ? extractMasterDocItems<Skill>(skillsSnap.data()) : [])
            );
            const starsToSave = sanitizeCollectionForFirestore(normalizeStarPlayersCollection(mergeItems(starsSnap.exists() ? extractMasterDocItems<StarPlayer>(starsSnap.data()) : [], staticStarsData, 'name')));
            const inducEsToSave = sanitizeCollectionForFirestore(mergeItems(inducEsSnap.exists() ? extractMasterDocItems<Inducement>(inducEsSnap.data()) : [], staticInducementsEs, 'name'));
            const inducEnToSave = sanitizeCollectionForFirestore(mergeItems(inducEnSnap.exists() ? extractMasterDocItems<Inducement>(inducEnSnap.data()) : [], staticInducementsEn, 'name'));

            await Promise.all([
                setDoc(doc(db, MASTER_COL, 'teams'), { items: teamsToSave, updatedAt: ts }),
                setDoc(doc(db, MASTER_COL, 'skills'), { items: skillsToSave, updatedAt: ts }),
                setDoc(doc(db, MASTER_COL, 'star_players'), { items: starsToSave, updatedAt: ts }),
                setDoc(doc(db, MASTER_COL, 'inducements_es'), { items: inducEsToSave, updatedAt: ts }),
                setDoc(doc(db, MASTER_COL, 'inducements_en'), { items: inducEnToSave, updatedAt: ts }),
                setDoc(doc(db, MASTER_COL, 'heraldo'), { items: sanitizeCollectionForFirestore(heraldoItems), updatedAt: ts }),
                setDoc(doc(db, MASTER_COL, 'meta'), {
                    lastSync: ts,
                    version: new Date().toISOString().split('T')[0],
                    strategy: force ? 'overwrite-firestore' : 'firestore-source-of-truth',
                    source: 'admin-panel',
                    teamsCount: teamsToSave.length,
                    skillsCount: skillsToSave.length,
                    starsCount: starsToSave.length,
                }),
            ]);

            setSyncStatus('success');
            setIsFromFirestore(true);
            setTimeout(() => setSyncStatus('idle'), 3000);
        } catch (err: any) {
            setSyncStatus('error');
            setError(err.message ?? 'Error al sincronizar con Firestore');
            throw err;
        }
    }, [db, normalizeTeams, heraldoItems]);

    // â”€â”€ Update a single field in a Firestore master doc â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    /**
     * Updates a single item within a master_data document's items array.
     * Finds the item by keyEN (skills) or name (teams/stars/inducements).
     */
    const normalizeMasterKey = (value: string) =>
        sanitizeMojibakeText(value)
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/\s+/g, ' ')
            .trim();

    const updateMasterItem = useCallback(async (
        docId: 'teams' | 'skills' | 'star_players' | 'inducements_es' | 'inducements_en' | 'heraldo',
        itemId: string,
        patch: Record<string, unknown>
    ): Promise<void> => {
        if (!db) return;

        const ref = doc(db, MASTER_COL, docId);
        const snap = await getDoc(ref);

        const getFallbackItems = () => {
            if (docId === 'star_players') return staticStarsData as any[];
            if (docId === 'inducements_es') return staticInducementsEs as any[];
            if (docId === 'inducements_en') return staticInducementsEn as any[];
            return heraldoItems as any[];
        };

        const getMatchIndex = (items: any[]) => items.findIndex((item) => {
            const candidates = [
                item?.keyEN,
                item?.name,
                item?.title,
                item?.slug,
                item?.rosterName,
                item?.displayName
            ].filter(Boolean).map(value => normalizeMasterKey(String(value)));
            const normalizedItemId = normalizeMasterKey(itemId);
            return candidates.includes(normalizedItemId);
        });

        const currentItems: any[] = snap.exists() ? coerceFirestoreItemsArray<any>(snap.data()?.items) : [];
        const items = [...currentItems];
        let idx = getMatchIndex(items);

        if (idx === -1) {
            if (docId === 'teams') {
                throw new Error(`Item "${itemId}" no encontrado en Firestore para ${docId}`);
            }
            const fallbackItems = getFallbackItems();
            const fallbackIdx = getMatchIndex(fallbackItems);

            if (fallbackIdx === -1) {
                throw new Error(`Item "${itemId}" no encontrado en ${docId}`);
            }

            const mergedFallbackItems = fallbackItems.map((item, index) => index === fallbackIdx ? { ...item, ...patch } : item);
            const mergedItems = items.length > 0 ? [...items] : mergedFallbackItems;

            if (items.length > 0) {
                mergedItems[fallbackIdx] = { ...(mergedItems[fallbackIdx] || fallbackItems[fallbackIdx]), ...patch };
            }

            await setDoc(ref, { items: sanitizeCollectionForFirestore(mergedItems), updatedAt: serverTimestamp() }, { merge: true });

            if (docId === 'teams') setTeams(normalizeTeams(mergedItems as Team[]));
            if (docId === 'skills') setSkills(normalizeSkillsCollection(mergedItems as Skill[]));
            if (docId === 'star_players') setStarPlayers(normalizeStarPlayersCollection(mergedItems as StarPlayer[]));
            if (docId === 'inducements_es' || docId === 'inducements_en') setInducements(mergedItems as Inducement[]);
            if (docId === 'heraldo') setHeraldoItems(mergedItems);
            return;
        }

        items[idx] = { ...items[idx], ...patch };
        await setDoc(ref, { items: sanitizeCollectionForFirestore(items), updatedAt: serverTimestamp() }, { merge: true });

        if (docId === 'teams') setTeams(normalizeTeams(items as Team[]));
        if (docId === 'skills') setSkills(normalizeSkillsCollection(items as Skill[]));
        if (docId === 'star_players') setStarPlayers(normalizeStarPlayersCollection(items as StarPlayer[]));
        if (docId === 'inducements_es' || docId === 'inducements_en') setInducements(items as Inducement[]);
        if (docId === 'heraldo') setHeraldoItems(items);
    }, []);

    /**
     * Replaces the full items array in a master_data document.
     * Useful for bulk maintenance actions like image autofill.
     */
    const replaceMasterItems = useCallback(async (
        docId: 'teams' | 'skills' | 'star_players' | 'inducements_es' | 'inducements_en' | 'heraldo',
        items: any[]
    ): Promise<void> => {
        if (!db) return;

        const ref = doc(db, MASTER_COL, docId);
        await setDoc(ref, { items: sanitizeCollectionForFirestore(items), updatedAt: serverTimestamp() }, { merge: true });
    }, []);

    // â”€â”€ Hero image helper â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const updateHeroImage = useCallback(async (url: string): Promise<void> => {
        if (!db) return;
        await setDoc(doc(db, 'settings_master', 'home_hero'), { url });
    }, []);

    return {
        // Data
        teams,
        skills,
        starPlayers,
        inducements,
        heraldoItems,
        heroImage,
        // Status
        loading,
        error,
        syncStatus,
        lastSync,
        isFromFirestore,
        // Actions
        syncMasterData,
        updateMasterItem,
        replaceMasterItems,
        updateHeroImage,
        addItemToMaster: async (docId: 'teams' | 'skills' | 'star_players' | 'heraldo', item: any) => {
            if (!db) return;
            const ref = doc(db, MASTER_COL, docId);
            const snap = await getDoc(ref);
            const items = snap.exists() ? coerceFirestoreItemsArray<any>(snap.data()?.items) : [];
            items.push(item);
            await setDoc(ref, { items: sanitizeCollectionForFirestore(items), updatedAt: serverTimestamp() }, { merge: true });
        },
        deleteMasterItem: async (docId: 'teams' | 'skills' | 'star_players' | 'heraldo', itemId: string) => {
            if (!db) return;
            const ref = doc(db, MASTER_COL, docId);
            const snap = await getDoc(ref);
            if (!snap.exists()) return;
            const items = coerceFirestoreItemsArray<any>(snap.data()?.items).filter((i: any) => (i.keyEN ?? i.name ?? i.title) !== itemId);
            await setDoc(ref, { items: sanitizeCollectionForFirestore(items), updatedAt: serverTimestamp() }, { merge: true });
        },
        refresh: () => setLoading(true),
    };
};



