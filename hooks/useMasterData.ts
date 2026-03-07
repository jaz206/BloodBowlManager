import { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { teamsData as staticTeams } from '../data/teams';
import { skillsData as staticSkills } from '../data/skills';
import { starPlayersData as staticStars } from '../data/starPlayers';
import { inducements as staticInducements } from '../data/inducements';
import type { Team, Skill, StarPlayer, Inducement } from '../types';

export const useMasterData = () => {
    const [teams, setTeams] = useState<Team[]>([]);
    const [skills, setSkills] = useState<Skill[]>([]);
    const [starPlayers, setStarPlayers] = useState<StarPlayer[]>([]);
    const [inducements, setInducements] = useState<Inducement[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
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
            console.error("Error fetching teams:", err);
            setTeams(staticTeams);
            teamsLoaded = true;
            checkLoading();
        });

        // Skills Listener
        const unsubSkills = onSnapshot(collection(db, 'skills_master'), (snapshot) => {
            if (snapshot.empty) {
                setSkills(staticSkills);
            } else {
                const fetched = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as unknown as Skill));
                fetched.sort((a, b) => a.name.localeCompare(b.name));
                setSkills(fetched);
            }
            skillsLoaded = true;
            checkLoading();
        }, (err) => {
            console.error("Error fetching skills:", err);
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
    }, []);

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
        for (const item of staticTeams) await setDoc(doc(db, 'teams_master', item.name), item);
        for (const item of staticSkills) await setDoc(doc(db, 'skills_master', item.name), item);
        for (const item of staticStars) await setDoc(doc(db, 'star_players_master', item.name), item);
        for (const item of staticInducements) await setDoc(doc(db, 'inducements_master', item.name), item);
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
        refresh: () => setLoading(true) // Triggers re-fetch by logic if needed, but snapshots handle it
    };
};
