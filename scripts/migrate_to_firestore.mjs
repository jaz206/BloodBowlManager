/**
 * migrate_to_firestore.mjs
 * ──────────────────────────────────────────────────────────────────────────────
 * One-time migration script: uploads all static master data to Firestore.
 * Uses the same Firebase client SDK as the app (no firebase-admin needed).
 *
 * Structure in Firestore:
 *   master_data/
 *     teams          → { items: Team[] }
 *     skills_es      → { items: Skill[] }
 *     skills_en      → { items: Skill[] }
 *     star_players   → { items: StarPlayer[] }
 *     inducements_es → { items: Inducement[] }
 *     inducements_en → { items: Inducement[] }
 *     meta           → { lastSync: timestamp, version: string }
 *
 * Each collection stores data as a SINGLE document with an "items" array.
 * This avoids per-document read costs and keeps migrations atomic.
 *
 * Usage:
 *   node scripts/migrate_to_firestore.mjs
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// ── Resolve __dirname in ESM ──────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ── Firebase Config (same as app) ────────────────────────────────────────────
const firebaseConfig = {
    apiKey: "AIzaSyAiHG1HLEdt-kVtYrtPdOopr5RrQha1cTs",
    authDomain: "asistente-blood-bowl.firebaseapp.com",
    projectId: "asistente-blood-bowl",
    storageBucket: "asistente-blood-bowl.firebasestorage.app",
    messagingSenderId: "789696388629",
    appId: "1:789696388629:web:e856e15e3f33a78045b81c",
};

// ── Initialize Firebase ───────────────────────────────────────────────────────
const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// ── Load static data as JSON via dynamic import ───────────────────────────────
// We need to convert TS → use the pre-bundled approach: read the modules via tsx/ts-node or
// use a workaround: create a temporary JSON export. Instead, we inline the import path
// and use vite's build output or ts-node. 
// For simplicity, we import directly from the compiled JS in dist/ if available,
// otherwise we use ts-node/tsx via a helper approach.

// Detect if running with ts-node or tsx or node
// Actually: let's just import the raw data using dynamic require trick
const require = createRequire(import.meta.url);

// ── Helper: upload a document to Firestore ────────────────────────────────────
async function uploadMasterDoc(docId, items) {
    const ref = doc(db, 'master_data', docId);
    await setDoc(ref, { items, updatedAt: serverTimestamp() });
    console.log(`  ✅ ${docId}: ${items.length} items`);
}

// ── Main migration ────────────────────────────────────────────────────────────
async function migrate() {
    console.log('\n🩸 BloodBowl Manager — Migración a Firestore');
    console.log('─'.repeat(50));

    try {
        // Dynamic import of data files
        // Since this is ESM and the data files are TS, we need to use a workaround.
        // We JSON-serialize the data on the spot using tsx's ability to import TS.
        // Fallback: if not available, we'll read compiled versions.

        let teamsData, skillsEs, skillsEn, starsData, inducementsEs, inducementsEn;

        try {
            // Try tsx/ts-node path
            const teamsModule = await import('../data/teams.ts');
            const skillsEsModule = await import('../data/skills_es.ts');
            const skillsEnModule = await import('../data/skills_en.ts');
            const starsModule = await import('../data/starPlayers.ts');
            const inducementsEsModule = await import('../data/inducements.ts');
            const inducementsEnModule = await import('../data/inducements_en.ts');

            teamsData = teamsModule.teamsData;
            skillsEs = skillsEsModule.skillsData;
            skillsEn = skillsEnModule.skillsData;
            starsData = starsModule.starPlayersData;
            inducementsEs = inducementsEsModule.inducements;
            inducementsEn = inducementsEnModule.inducementsData;
        } catch (e) {
            console.error('❌ Cannot import TS files directly. Please run with: npx tsx scripts/migrate_to_firestore.mjs');
            console.error('   or: node --require tsx/cjs scripts/migrate_to_firestore.mjs');
            throw e;
        }

        console.log('\n📤 Subiendo datos a Firestore...\n');

        // Upload each collection
        await uploadMasterDoc('teams', teamsData);
        await uploadMasterDoc('skills_es', skillsEs);
        await uploadMasterDoc('skills_en', skillsEn);
        await uploadMasterDoc('star_players', starsData);
        await uploadMasterDoc('inducements_es', inducementsEs);
        await uploadMasterDoc('inducements_en', inducementsEn);

        // Meta document
        const metaRef = doc(db, 'master_data', 'meta');
        await setDoc(metaRef, {
            lastSync: serverTimestamp(),
            version: '2026-03-09',
            source: 'migrate_to_firestore.mjs',
            teamsCount: teamsData.length,
            skillsEsCount: skillsEs.length,
            skillsEnCount: skillsEn.length,
            starsCount: starsData.length,
        });

        console.log('\n🎉 Migración completada exitosamente!');
        console.log('   Datos accesibles en Firestore > master_data');
        console.log('\n⚠️  SIGUIENTE PASO: Actualiza las Firestore Security Rules en Firebase Console:');
        console.log('   Consulta el archivo FIRESTORE_RULES.md en este proyecto.');

    } catch (err) {
        console.error('\n❌ Error durante la migración:', err.message);
        process.exit(1);
    }

    process.exit(0);
}

migrate();
