import { useState, useEffect, useCallback } from 'react';
import { db } from '../firebaseConfig';
import { collection, doc, onSnapshot, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { useLanguage } from '../contexts/LanguageContext';

// ── Static Fallback Data ──────────────────────────────────────────────────────
import { teamsData as staticTeamsData } from '../data/teams';
import { skillsData as staticSkills } from '../data/skills';
import { starPlayersData as staticStarsData } from '../data/starPlayers';
import { inducements as staticInducementsEs } from '../data/inducements';
import { inducementsData as staticInducementsEn } from '../data/inducements_en';

import type { Team, Skill, StarPlayer, Inducement } from '../types';

// ── Firestore collection ID ───────────────────────────────────────────────────
const MASTER_COL = 'master_data';

// ── Types ─────────────────────────────────────────────────────────────────────
export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

/**
 * useMasterData hook — Firestore-first with static fallback.
 *
 * Data layout in Firestore:
 *   master_data/teams          → { items: Team[], updatedAt }
 *   master_data/skills_es      → { items: Skill[], updatedAt }
 *   master_data/skills_en      → { items: Skill[], updatedAt }
 *   master_data/star_players   → { items: StarPlayer[], updatedAt }
 *   master_data/inducements_es → { items: Inducement[], updatedAt }
 *   master_data/inducements_en → { items: Inducement[], updatedAt }
 *   master_data/meta           → { lastSync, version, ... }
 */
export const useMasterData = () => {
    const { language } = useLanguage();

    // ── State ─────────────────────────────────────────────────────────────────
    const [teams, setTeams] = useState<Team[]>(staticTeamsData);
    const [skills, setSkills] = useState<Skill[]>(staticSkills);
    const [starPlayers, setStarPlayers] = useState<StarPlayer[]>(staticStarsData);
    const [inducements, setInducements] = useState<Inducement[]>(language === 'es' ? staticInducementsEs : (staticInducementsEn as unknown as Inducement[]));
    const [heraldoItems, setHeraldoItems] = useState<any[]>([]);
    const [heroImage, setHeroImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
    const [lastSync, setLastSync] = useState<string | null>(null);
    const [isFromFirestore, setIsFromFirestore] = useState(false);

    // ── Firestore listeners ───────────────────────────────────────────────────
    useEffect(() => {
        if (!db) {
            setTeams(staticTeamsData);
            setSkills(staticSkills);
            setStarPlayers(staticStarsData);
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
                if (snap.exists() && snap.data()?.items?.length > 0) {
                    setTeams(snap.data().items as Team[]);
                    setIsFromFirestore(true);
                    setError(null);
                } else {
                    setTeams(staticTeamsData);
                    setIsFromFirestore(false);
                }
                checkDone();
            },
            (err) => {
                console.warn("Firestore Teams error:", err.code);
                if (err.code === 'permission-denied') {
                    setError(err);
                }
                setTeams(staticTeamsData);
                setIsFromFirestore(false);
                checkDone();
            }
        );

        // Skills listener — uses consolidated bilingual document
        const unsubSkills = onSnapshot(
            doc(db, MASTER_COL, 'skills'),
            (snap) => {
                if (snap.exists() && snap.data()?.items?.length > 0) {
                    setSkills(snap.data().items as Skill[]);
                } else {
                    setSkills(staticSkills);
                }
                checkDone();
            },
            () => { setSkills(staticSkills); checkDone(); }
        );

        // Star Players listener
        const unsubStars = onSnapshot(
            doc(db, MASTER_COL, 'star_players'),
            (snap) => {
                if (snap.exists() && snap.data()?.items?.length > 0) {
                    setStarPlayers(snap.data().items as StarPlayer[]);
                } else {
                    setStarPlayers(staticStarsData);
                }
                checkDone();
            },
            () => { setStarPlayers(staticStarsData); checkDone(); }
        );

        // Inducements listener — language-aware
        const inducementsDoc = language === 'es' ? 'inducements_es' : 'inducements_en';
        const staticInducementsFallback = language === 'es' ? staticInducementsEs : (staticInducementsEn as unknown as Inducement[]);
        const unsubInducements = onSnapshot(
            doc(db, MASTER_COL, inducementsDoc),
            (snap) => {
                if (snap.exists() && snap.data()?.items?.length > 0) {
                    setInducements(snap.data().items as Inducement[]);
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
                if (snap.exists() && snap.data()?.items?.length > 0) {
                    setHeraldoItems(snap.data().items);
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
        // Re-subscribe when language changes to get the right skills/inducements doc
    }, [language]);

    // ── Sync to Firestore (admin action) ─────────────────────────────────────
    /**
     * Uploads all static master data to Firestore.
     * Overwrites existing documents atomically.
     * Only admins should be able to call this (enforced by Firestore Rules).
     */
    // ── Sync to Firestore (admin action) ─────────────────────────────────────
    /**
     * Uploads static master data to Firestore using a Smart Merge strategy.
     * Preserves existing items in Firestore (with their manual edits) and adds new ones from code.
     * @param force - If true, performs a full overwrite.
     */
    const syncMasterData = useCallback(async (force = false): Promise<void> => {
        if (!db) throw new Error('Firebase no está disponible');

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

            const teamsToSave = mergeItems(teamsSnap.exists() ? teamsSnap.data().items : [], staticTeamsData, 'name');
            const skillsToSave = mergeItems(skillsSnap.exists() ? skillsSnap.data().items : [], staticSkills, 'keyEN');
            const starsToSave = mergeItems(starsSnap.exists() ? starsSnap.data().items : [], staticStarsData, 'name');
            const inducEsToSave = mergeItems(inducEsSnap.exists() ? inducEsSnap.data().items : [], staticInducementsEs, 'name');
            const inducEnToSave = mergeItems(inducEnSnap.exists() ? inducEnSnap.data().items : [], staticInducementsEn, 'name');

            await Promise.all([
                setDoc(doc(db, MASTER_COL, 'teams'), { items: teamsToSave, updatedAt: ts }),
                setDoc(doc(db, MASTER_COL, 'skills'), { items: skillsToSave, updatedAt: ts }),
                setDoc(doc(db, MASTER_COL, 'star_players'), { items: starsToSave, updatedAt: ts }),
                setDoc(doc(db, MASTER_COL, 'inducements_es'), { items: inducEsToSave, updatedAt: ts }),
                setDoc(doc(db, MASTER_COL, 'inducements_en'), { items: inducEnToSave, updatedAt: ts }),
                setDoc(doc(db, MASTER_COL, 'heraldo'), { items: heraldoItems, updatedAt: ts }),
                setDoc(doc(db, MASTER_COL, 'meta'), {
                    lastSync: ts,
                    version: new Date().toISOString().split('T')[0],
                    strategy: force ? 'overwrite' : 'smart-merge',
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
    }, [db]);

    // ── Update a single field in a Firestore master doc ───────────────────────
    /**
     * Updates a single item within a master_data document's items array.
     * Finds the item by keyEN (skills) or name (teams/stars/inducements).
     */
    const normalizeMasterKey = (value: string) =>
        fixMojibake(value)
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
        if (!snap.exists()) throw new Error(`Documento ${docId} no encontrado`);

        const items: any[] = snap.data().items ?? [];
        const idx = items.findIndex(i => normalizeMasterKey(String(i.keyEN ?? i.name ?? i.title ?? '')) === normalizeMasterKey(itemId));
        if (idx === -1) throw new Error(`Item "${itemId}" no encontrado en ${docId}`);

        items[idx] = { ...items[idx], ...patch };
        await setDoc(ref, { items, updatedAt: serverTimestamp() }, { merge: true });

        if (docId === 'teams') setTeams(items as Team[]);
        if (docId === 'skills') setSkills(items as Skill[]);
        if (docId === 'star_players') setStarPlayers(items as StarPlayer[]);
        if (docId === 'inducements_es') setInducements(items as Inducement[]);
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
        await setDoc(ref, { items, updatedAt: serverTimestamp() }, { merge: true });
    }, []);

    // ── Hero image helper ─────────────────────────────────────────────────────
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
            const items = (snap.exists() ? snap.data().items : []) || [];
            items.push(item);
            await setDoc(ref, { items, updatedAt: serverTimestamp() }, { merge: true });
        },
        deleteMasterItem: async (docId: 'teams' | 'skills' | 'star_players' | 'heraldo', itemId: string) => {
            if (!db) return;
            const ref = doc(db, MASTER_COL, docId);
            const snap = await getDoc(ref);
            if (!snap.exists()) return;
            const items = (snap.data().items || []).filter((i: any) => (i.keyEN ?? i.name ?? i.title) !== itemId);
            await setDoc(ref, { items, updatedAt: serverTimestamp() }, { merge: true });
        },
        refresh: () => setLoading(true),
    };
};
