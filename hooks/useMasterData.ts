import { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { teamsData as staticTeams } from '../data/teams';
import { skillsData as staticSkills } from '../data/skills';
import type { Team, Skill } from '../types';

export const useMasterData = () => {
    const [teams, setTeams] = useState<Team[]>([]);
    const [skills, setSkills] = useState<Skill[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!db) {
            setTeams(staticTeams);
            setSkills(staticSkills);
            setLoading(false);
            return;
        }

        let teamsLoaded = false;
        let skillsLoaded = false;

        const checkLoading = () => {
            if (teamsLoaded && skillsLoaded) {
                setLoading(false);
            }
        };

        // Teams Listener
        const unsubTeams = onSnapshot(collection(db, 'teams_master'), (snapshot) => {
            if (snapshot.empty) {
                console.log("Firestore 'teams_master' is empty. Using static data.");
                setTeams(staticTeams);
            } else {
                const fetched = snapshot.docs.map(doc => doc.data() as Team);
                fetched.sort((a, b) => a.name.localeCompare(b.name));
                setTeams(fetched);
            }
            teamsLoaded = true;
            checkLoading();
        }, (err) => {
            console.error("Error fetching teams from Firestore:", err);
            setTeams(staticTeams); // Fallback to static on error
            teamsLoaded = true;
            checkLoading();
        });

        // Skills Listener
        const unsubSkills = onSnapshot(collection(db, 'skills_master'), (snapshot) => {
            if (snapshot.empty) {
                console.log("Firestore 'skills_master' is empty. Using static data.");
                setSkills(staticSkills);
            } else {
                const fetched = snapshot.docs.map(doc => doc.data() as Skill);
                fetched.sort((a, b) => a.name.localeCompare(b.name));
                setSkills(fetched);
            }
            skillsLoaded = true;
            checkLoading();
        }, (err) => {
            console.error("Error fetching skills from Firestore:", err);
            setSkills(staticSkills); // Fallback to static on error
            skillsLoaded = true;
            checkLoading();
        });

        return () => { unsubTeams(); unsubSkills(); };
    }, []);

    const updateTeamImage = async (teamName: string, newImageUrl: string) => {
        if (!db) return;
        const teamRef = doc(db, 'teams_master', teamName);
        const teamToUpdate = teams.find(t => t.name === teamName);
        if (teamToUpdate) {
            await setDoc(teamRef, { ...teamToUpdate, image: newImageUrl });
        }
    };

    const updateSkillDescription = async (skillName: string, newDesc: string) => {
        if (!db) return;
        const skillRef = doc(db, 'skills_master', skillName);
        const skillToUpdate = skills.find(s => s.name === skillName);
        if (skillToUpdate) {
            await setDoc(skillRef, { ...skillToUpdate, description: newDesc });
        }
    };

    const syncMasterData = async () => {
        if (!db) return;
        console.log("Syncing master data to Firestore...");
        for (const team of staticTeams) {
            await setDoc(doc(db, 'teams_master', team.name), team);
        }
        for (const skill of staticSkills) {
            await setDoc(doc(db, 'skills_master', skill.name), skill);
        }
        console.log("Sync complete.");
    };

    return { teams, skills, loading, error, updateTeamImage, updateSkillDescription, syncMasterData };
};
