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
        const TOTAL = 5; // teams, skills, stars, inducements, hero

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
    const syncMasterData = useCallback(async (): Promise<void> => {
        if (!db) throw new Error('Firebase no está disponible');

        setSyncStatus('syncing');
        setError(null);

        try {
            const ts = serverTimestamp();

            await Promise.all([
                setDoc(doc(db, MASTER_COL, 'teams'), { items: staticTeamsData, updatedAt: ts }),
                setDoc(doc(db, MASTER_COL, 'skills'), { items: staticSkills, updatedAt: ts }),
                setDoc(doc(db, MASTER_COL, 'star_players'), { items: staticStarsData, updatedAt: ts }),
                setDoc(doc(db, MASTER_COL, 'inducements_es'), { items: staticInducementsEs, updatedAt: ts }),
                setDoc(doc(db, MASTER_COL, 'inducements_en'), { items: staticInducementsEn, updatedAt: ts }),
                setDoc(doc(db, MASTER_COL, 'meta'), {
                    lastSync: ts,
                    version: new Date().toISOString().split('T')[0],
                    source: 'admin-panel',
                    teamsCount: staticTeamsData.length,
                    skillsCount: staticSkills.length,
                    starsCount: staticStarsData.length,
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
    }, []);

    // ── Update a single field in a Firestore master doc ───────────────────────
    /**
     * Updates a single item within a master_data document's items array.
     * Finds the item by keyEN (skills) or name (teams/stars/inducements).
     */
    const updateMasterItem = useCallback(async (
        docId: 'teams' | 'skills' | 'star_players' | 'inducements_es' | 'inducements_en',
        itemId: string,
        patch: Record<string, unknown>
    ): Promise<void> => {
        if (!db) return;

        const ref = doc(db, MASTER_COL, docId);
        const snap = await getDoc(ref);
        if (!snap.exists()) throw new Error(`Documento ${docId} no encontrado`);

        const items: any[] = snap.data().items ?? [];
        const idx = items.findIndex(i => (i.keyEN ?? i.name) === itemId);
        if (idx === -1) throw new Error(`Item "${itemId}" no encontrado en ${docId}`);

        items[idx] = { ...items[idx], ...patch };
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
        updateHeroImage,
        refresh: () => setLoading(true),
    };
};
