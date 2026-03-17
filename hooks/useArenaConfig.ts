import { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';

export interface ArenaConfig {
    spp: {
        touchdown: number;
        casualty: number;
        pass: number;
        handoff: number;
        mvp: number;
    };
    economics: {
        win_bonus: number;
        no_stalling_bonus: number;
        multiplier: number;
    };
    dice: {
        winnings: string;
        mvp: string;
        fans: string;
    };
}

const DEFAULT_CONFIG: ArenaConfig = {
    spp: {
        touchdown: 3,
        casualty: 2,
        pass: 1,
        handoff: 0,
        mvp: 4
    },
    economics: {
        win_bonus: 0, // En BB2020 no hay bono fijo por ganar, es todo por fans/score
        no_stalling_bonus: 5, // Representa 50k (5 * 10k)
        multiplier: 10000
    },
    dice: {
        winnings: '1D3',
        mvp: '1D3', // Para BB2025/S3 (3 nominados)
        fans: '1D6'
    }
};

export const useArenaConfig = () => {
    const [config, setConfig] = useState<ArenaConfig>(DEFAULT_CONFIG);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!db) return;

        const configRef = doc(db, 'settings_master', 'arena_config');
        
        const unsub = onSnapshot(configRef, (snapshot) => {
            if (snapshot.exists()) {
                setConfig(snapshot.data() as ArenaConfig);
            } else {
                // Initialize with defaults if it doesn't exist
                setDoc(configRef, DEFAULT_CONFIG);
            }
            setLoading(false);
        }, (err) => {
            console.error("Error loading arena config:", err);
            setLoading(false);
        });

        return () => unsub();
    }, []);

    const updateConfig = async (newConfig: ArenaConfig) => {
        if (!db) return;
        const configRef = doc(db, 'settings_master', 'arena_config');
        await setDoc(configRef, newConfig);
    };

    return { config, updateConfig, loading };
};
