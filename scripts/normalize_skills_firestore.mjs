#!/usr/bin/env node
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'node:fs';
import path from 'node:path';

const ELITE_KEYS = [
  'Sidestep','Sprint','Hit and Run','Safe Pair of Hands','Defensive','Leap',
  'Strong Arm','Juggernaut','Arm Bar','Stand Firm','Bullseye','Multiple Block',
  'Dauntless','Frenzy','Kick','Pro','Taunt',
  'Foul Appearance','Monstrous Mouth','Prehensile Tail','Claws','Big Hand','Iron Hard Skin','Very Long Legs','Disturbing Presence','Tentacles',
  'Leader','Cloud Burster','Give and Go','Hail Mary Pass','Dump-off','Punt',
  'Lone Fouler','Pile Driver','Fumblerooski','Violent Innovator','Eye Gouge','Saboteur','Lethal Flight'
];

const SPANISH_CANON = {
  Frenzy: 'Furia',
  Dauntless: 'Agallas',
  Kick: 'Patada',
  Pro: 'Profesional',
  Taunt: 'Provocar',
  Sidestep: 'Echarse a un lado',
  Sprint: 'Esprintar',
  'Hit and Run': 'Golpe a la carrera',
  'Safe Pair of Hands': 'Proteger el cuero',
  Defensive: 'Romper defensas',
  Leap: 'Saltar',
  'Strong Arm': 'Brazo fuerte',
  Juggernaut: 'Imparable',
  'Arm Bar': 'Llave de brazo',
  'Stand Firm': 'Mantenerse firme',
  Bullseye: 'Ojo de halcón',
  'Multiple Block': 'Placaje múltiple',
  'Foul Appearance': 'Apariencia asquerosa',
  'Monstrous Mouth': 'Boca monstruosa',
  'Prehensile Tail': 'Cola prensil',
  Claws: 'Garras',
  'Big Hand': 'Mano grande',
  'Iron Hard Skin': 'Piel férrea',
  'Very Long Legs': 'Piernas muy largas',
  'Disturbing Presence': 'Presencia perturbadora',
  Tentacles: 'Tentáculos',
  Leader: 'Líder',
  'Cloud Burster': 'Partenubes',
  'Give and Go': 'Pasar y seguir',
  'Hail Mary Pass': 'Pase a lo loco',
  'Dump-off': 'Pase precipitado',
  Punt: 'Patada de despeje',
  'Lone Fouler': 'Agresor discreto',
  'Pile Driver': 'Crujir',
  Fumblerooski: 'Dejada',
  'Violent Innovator': 'Innovador violento',
  'Eye Gouge': 'Piquete de ojos',
  Saboteur: 'Saboteador',
  'Lethal Flight': 'Vuelo letal'
};

function parseServiceAccountFromEnv() {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (serviceAccountJson) {
    const parsed = JSON.parse(serviceAccountJson);
    if (parsed.projectId && parsed.clientEmail && parsed.privateKey) {
      return {
        projectId: parsed.projectId,
        clientEmail: parsed.clientEmail,
        privateKey: parsed.privateKey.replace(/\\n/g, '\n'),
      };
    }
  }

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (projectId && clientEmail && privateKey) {
    return { projectId, clientEmail, privateKey };
  }

  throw new Error('Missing Firebase Admin credentials in env.');
}

function ensureAdminApp() {
  if (getApps().length) return getApps()[0];
  const creds = parseServiceAccountFromEnv();
  return initializeApp({ credential: cert(creds) });
}

function clean(v) { return String(v || '').trim(); }
function norm(v) {
  return clean(v)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9+]+/g, ' ')
    .trim();
}
function extractItems(rawData) {
  if (!rawData || typeof rawData !== 'object') return [];
  if (Array.isArray(rawData.items)) return rawData.items;
  const keys = Object.keys(rawData).filter(k => /^\d+$/.test(k)).sort((a,b)=>Number(a)-Number(b));
  return keys.map(k => ({ __key: k, ...rawData[k] }));
}
function identity(item) {
  return norm(item.keyEN || item.name_en || item.name || item.name_es);
}
function score(item) {
  const fields = [item.keyEN, item.name_en, item.name_es, item.name, item.desc_en, item.desc_es];
  return fields.reduce((n, f) => n + (clean(f) ? 1 : 0), 0) + (item.isElite === true ? 10 : 0);
}
function normalizeItem(item) {
  const keyEN = clean(item.keyEN || item.name_en);
  const name_en = clean(item.name_en || item.keyEN);
  const name_es = clean(SPANISH_CANON[keyEN] || item.name_es || item.name);
  const name = clean(item.name || name_es || name_en || keyEN);
  const desc_en = clean(item.desc_en || item.description);
  const desc_es = clean(item.desc_es || item.description);
  const category = clean(item.category || 'General');
  const isElite = ELITE_KEYS.includes(keyEN) ? true : item.isElite === true;
  return {
    keyEN,
    name_en,
    name_es,
    name,
    desc_en,
    desc_es,
    category,
    isElite,
  };
}

async function main() {
  const mode = process.argv.includes('--apply') ? 'apply' : 'report';
  ensureAdminApp();
  const db = getFirestore();
  const ref = db.doc('master_data/skills');
  const snap = await ref.get();
  const raw = snap.data() || {};
  const items = extractItems(raw);

  const groups = new Map();
  for (const item of items) {
    const id = identity(item);
    if (!groups.has(id)) groups.set(id, []);
    groups.get(id).push(item);
  }

  const duplicates = [...groups.entries()]
    .filter(([, rows]) => rows.length > 1)
    .map(([id, rows]) => ({
      identity: id,
      count: rows.length,
      rows: rows.map(r => ({
        idx: r.__key,
        keyEN: clean(r.keyEN || r.name_en),
        name_en: clean(r.name_en),
        name_es: clean(r.name_es || r.name),
        category: clean(r.category),
        isElite: r.isElite === true,
      })),
    }));

  const normalizedMap = new Map();
  for (const [, rows] of groups.entries()) {
    const chosen = rows.slice().sort((a,b) => score(b) - score(a))[0];
    const merged = rows.reduce((acc, row) => ({
      ...acc,
      ...row,
      keyEN: clean(acc.keyEN || row.keyEN || row.name_en),
      name_en: clean(acc.name_en || row.name_en || row.keyEN),
      name_es: clean(acc.name_es || row.name_es || row.name),
      name: clean(acc.name || row.name || row.name_es || row.name_en),
      desc_en: clean(acc.desc_en || row.desc_en || row.description),
      desc_es: clean(acc.desc_es || row.desc_es || row.description),
      category: clean(acc.category || row.category),
      isElite: acc.isElite === true || row.isElite === true,
    }), {});
    normalizedMap.set(identity(chosen), normalizeItem(merged));
  }

  const normalized = [...normalizedMap.values()].sort((a, b) => a.name_en.localeCompare(b.name_en));

  const report = {
    totalRaw: items.length,
    totalNormalized: normalized.length,
    duplicates,
    eliteTrueCount: normalized.filter(item => item.isElite === true).length,
    eliteMissing: normalized.filter(item => ELITE_KEYS.includes(item.keyEN) && item.isElite !== true).map(item => item.keyEN),
  };

  const reportPath = path.join(process.cwd(), 'skills_firestore_report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');

  if (mode === 'apply') {
    const payload = {};
    normalized.forEach((item, idx) => { payload[String(idx)] = item; });
    await ref.set(payload);
  }

  console.log(JSON.stringify({ mode, reportPath, summary: { totalRaw: report.totalRaw, totalNormalized: report.totalNormalized, duplicateCount: report.duplicates.length, eliteTrueCount: report.eliteTrueCount } }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
