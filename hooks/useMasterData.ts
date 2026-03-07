import { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { useLanguage } from '../contexts/LanguageContext';

// ── Static Spanish Data ───────────────────────────────────────────────────────
import { teamsData as teamsDataEs } from '../data/teams';
import { skillsData as skillsDataEs } from '../data/skills_es';
import { starPlayersData as starsDataEs } from '../data/starPlayers';
import { inducements as inducementsEs } from '../data/inducements';

// ── Static English Data ───────────────────────────────────────────────────────
// (For demo, using localized versions if available, fallback to ES for now on non-created yet)
import { skillsData as skillsDataEn } from '../data/skills_en';
import { inducementsData as inducementsEn } from '../data/inducements_en';

import type { Team, Skill, StarPlayer, Inducement } from '../types';

export const useMasterData = () => {
    const { language } = useLanguage();

    // Resolve static data based on language
    const staticSkills = language === 'es' ? skillsDataEs : skillsDataEn;
    const staticInducements = language === 'es' ? inducementsEs : (inducementsEn as any as Inducement[]);
    const staticTeams = teamsDataEs; // TODO: Localize teams
    const staticStars = starsDataEs; // TODO: Localize stars

    const [teams, setTeams] = useState<Team[]>([]);
    const [skills, setSkills] = useState<Skill[]>([]);
    const [starPlayers, setStarPlayers] = useState<StarPlayer[]>([]);
    const [inducements, setInducements] = useState<Inducement[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Reset when language changes if not using Firestore primarily
        if (!db) {
            setTeams(staticTeams);
            setSkills(staticSkills);
            setStarPlayers(staticStars);
            setInducements(staticInducements);
            setLoading(false);
            return;
        }

        let teamsLoaded = false;
        let skillsLoaded = false;
        let starsLoaded = false;
        let inducementsLoaded = false;

        const checkLoading = () => {
            if (teamsLoaded && skillsLoaded && starsLoaded && inducementsLoaded) {
                setLoading(false);
            }
        };

        // Note: Firestore data is currently language-agnostic. 
        // In a real production app, we would fetch from different collections or fields.
        // For this localized demonstration, if Firestore is empty, we use our localized static files.

        // Teams Listener
        const unsubTeams = onSnapshot(collection(db, 'teams_master'), (snapshot) => {
            if (snapshot.empty) {
                setTeams(staticTeams);
            } else {
                const fetched = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as unknown as Team));
                fetched.sort((a, b) => a.name.localeCompare(b.name));
                setTeams(fetched);
            }
            teamsLoaded = true;
            checkLoading();
        }, (err) => {
            setTeams(staticTeams);
            teamsLoaded = true;
            checkLoading();
        });

        // Skills Listener
        const unsubSkills = onSnapshot(collection(db, 'skills_master'), (snapshot) => {
            if (snapshot.empty) {
                setSkills(staticSkills);
            } else {
                // If using Firestore, we still use static as fallback
                const fetched = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as unknown as Skill));
                fetched.sort((a, b) => a.name.localeCompare(b.name));
                setSkills(fetched);
            }
            skillsLoaded = true;
            checkLoading();
        }, (err) => {
            setSkills(staticSkills);
            skillsLoaded = true;
            checkLoading();
        });

        // Star Players Listener
        const unsubStars = onSnapshot(collection(db, 'star_players_master'), (snapshot) => {
            if (snapshot.empty) {
                setStarPlayers(staticStars);
            } else {
                const fetched = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as unknown as StarPlayer));
                fetched.sort((a, b) => a.name.localeCompare(b.name));
                setStarPlayers(fetched);
            }
            starsLoaded = true;
            checkLoading();
        }, (err) => {
            setStarPlayers(staticStars);
            starsLoaded = true;
            checkLoading();
        });

        // Inducements Listener
        const unsubInducements = onSnapshot(collection(db, 'inducements_master'), (snapshot) => {
            if (snapshot.empty) {
                setInducements(staticInducements);
            } else {
                const fetched = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as unknown as Inducement));
                setInducements(fetched);
            }
            inducementsLoaded = true;
            checkLoading();
        }, (err) => {
            setInducements(staticInducements);
            inducementsLoaded = true;
            checkLoading();
        });

        return () => {
            unsubTeams();
            unsubSkills();
            unsubStars();
            unsubInducements();
        };
    }, [language]); // Depend on language to re-trigger fallback if db is not connected

    const updateMasterItem = async (type: 'team' | 'skill' | 'starPlayer' | 'inducement', itemId: string, data: any) => {
        if (!db) return;
        const collectionMap = {
            team: 'teams_master',
            skill: 'skills_master',
            starPlayer: 'star_players_master',
            inducement: 'inducements_master'
        };
        const docRef = doc(db, collectionMap[type], itemId);
        await setDoc(docRef, data, { merge: true });
    };

    const syncMasterData = async () => {
        if (!db) return;
        // Syncing always uses ES data as default "source of truth" for Firestore for now
        for (const item of teamsDataEs) await setDoc(doc(db, 'teams_master', item.name), item);
        for (const item of skillsDataEs) await setDoc(doc(db, 'skills_master', item.name), item);
        for (const item of starsDataEs) await setDoc(doc(db, 'star_players_master', item.name), item);
        for (const item of inducementsEs) await setDoc(doc(db, 'inducements_master', item.name), item);
    };

    return {
        teams,
        skills,
        starPlayers,
        inducements,
        loading,
        error,
        updateMasterItem,
        syncMasterData,
        refresh: () => setLoading(true)
    };
};
