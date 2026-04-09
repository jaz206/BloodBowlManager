import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMasterData } from '../../hooks/useMasterData';
import { useLanguage } from '../../contexts/LanguageContext';
import SearchIcon from '../icons/SearchIcon';
import type { Competition, ManagedTeam, Team, StarPlayer, Skill, Inducement } from '../../types';
import AdminGeneralForm from './AdminGeneralForm';
import AdminEditorModal from './AdminEditorModal';
import { downloadCSV, parseCSV, transformGitHubUrl } from './adminPanelUtils';
import AdminFeedbackOverlays from './AdminFeedbackOverlays';
import { getStarPlayerImageUrl, getTeamLogoUrl, resolveTeamLogoPreference } from '../../utils/imageUtils';
import AdminCompetitionLab from './AdminCompetitionLab';
import {
    getHeraldoValidationIssues,
    getInducementValidationIssues,
    getSkillValidationIssues,
    getStarPlayerValidationIssues,
    getTeamValidationIssues,
    sanitizeHeraldoItemForSave,
    sanitizeInducementForSave,
    sanitizeSkillForSave,
    sanitizeStarPlayerForSave,
    sanitizeTeamForSave,
} from '../../utils/adminSanitizers';

type AdminTab = 'general' | 'heraldo' | 'arena' | 'competitions' | 'teams' | 'stars' | 'skills' | 'inducements';
import { useArenaConfig, ArenaConfig } from '../../hooks/useArenaConfig';
import { PLAYER_NAMES } from '../../pages/Guild/playerNames';

interface AdminPanelProps {
    managedTeams: ManagedTeam[];
    competitions: Competition[];
    onCompetitionCreate: (comp: Omit<Competition, 'id'>) => void | Promise<void>;
    onOpenLeagues?: () => void;
    onNotify?: (notification: { title: string; message: string; type: 'success' | 'error' | 'info'; source?: string }) => void;
}

const ADMIN_STORAGE_MAP: Record<AdminTab, { target: string; mode: string; description: string }> = {
    general: {
        target: 'settings_master/home_hero',
        mode: 'Firestore directo',
        description: 'Configura la imagen hero principal visible en Inicio.'
    },
    heraldo: {
        target: 'master_data/heraldo',
        mode: 'Array en Firestore',
        description: 'Guarda noticias, reglas destacadas y piezas editoriales del Heraldo.'
    },
    arena: {
        target: 'settings_master/arena_config',
        mode: 'Firestore directo',
        description: 'Controla la configuración maestra de SPP, economía y dados.'
    },
    competitions: {
        target: 'competitions / leagues',
        mode: 'Flujo propio',
        description: 'Laboratorio de competiciones; no usa el editor maestro de contenidos.'
    },
    teams: {
        target: 'master_data/teams',
        mode: 'Array en Firestore',
        description: 'Edita facciones, roster, identidad y pools de nombres.'
    },
    stars: {
        target: 'master_data/star_players',
        mode: 'Array en Firestore',
        description: 'Edita catálogo, stats, facciones compatibles e imagen de estrellas.'
    },
    skills: {
        target: 'master_data/skills',
        mode: 'Array en Firestore',
        description: 'Edita nombres bilingües, descripciones y categoría del Codex.'
    },
    inducements: {
        target: 'master_data/inducements_es|en',
        mode: 'Array en Firestore',
        description: 'Guarda incentivos en el documento del idioma activo.'
    },
};

const AdminPanel: React.FC<AdminPanelProps> = ({ managedTeams, competitions, onCompetitionCreate, onOpenLeagues, onNotify }) => {
    const {
        teams,
        starPlayers,
        skills,
        inducements,
        heroImage,
        updateHeroImage,
        loading,
        refresh,
        syncMasterData,
        isFromFirestore,
        updateMasterItem,
        replaceMasterItems,
        addItemToMaster,
        deleteMasterItem,
        heraldoItems
    } = useMasterData() as any;

    const { config: arenaConfig, updateConfig: saveArenaConfig } = useArenaConfig();

    const { language } = useLanguage();
    const [activeTab, setActiveTab] = useState<AdminTab>('general');
    const [activeTeamTab, setActiveTeamTab] = useState<'general' | 'identidad' | 'roster' | 'nombres'>('general');
    const [searchTerm, setSearchTerm] = useState('');
    const [editingItem, setEditingItem] = useState<{ type: AdminTab | 'hero', data: any } | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
    const [confirmModal, setConfirmModal] = useState<{ title: string; message: string; onConfirm: () => void; danger?: boolean } | null>(null);
    const [syncProgress, setSyncProgress] = useState<'idle' | 'syncing' | 'done' | 'error'>('idle');
    const [isAutoFillingImages, setIsAutoFillingImages] = useState(false);
    const [importProgress, setImportProgress] = useState<{ total: number; done: number; errors: string[] } | null>(null);
    const [isImporting, setIsImporting] = useState(false);
    const importInputRef = React.useRef<HTMLInputElement>(null);
    const [importTarget, setImportTarget] = useState<'stars' | 'teams' | null>(null);
    const syncButtonLabel = syncProgress === 'syncing'
        ? 'Sincronizando...'
        : syncProgress === 'done'
            ? '¡Completado!'
            : syncProgress === 'error'
                ? 'Error'
                : 'Sincronización inteligente';

    const showToast = (text: string, type: 'success' | 'error' = 'success', title?: string) => {
        setToastMessage({ text, type });
        onNotify?.({
            title: title || (type === 'error' ? 'Error de administraci?n' : 'Acci?n completada'),
            message: text,
            type,
            source: `Admin ? ${ADMIN_STORAGE_MAP[activeTab].target}`,
        });
        setTimeout(() => setToastMessage(null), 4500);
    };

    // GitHub Image Explorer State
    const [gitHubImages, setGitHubImages] = useState<any[]>([]);
    const [isLoadingGitHub, setIsLoadingGitHub] = useState(false);
    const [githubSearch, setGithubSearch] = useState('');
    const [isImageExplorerExpanded, setIsImageExplorerExpanded] = useState(false);
    const activeStorageInfo = ADMIN_STORAGE_MAP[activeTab];
    const validationIssues = useMemo(() => {
        if (!editingItem) return [];
        if (editingItem.type === 'teams') return getTeamValidationIssues(editingItem.data);
        if (editingItem.type === 'stars') return getStarPlayerValidationIssues(editingItem.data);
        if (editingItem.type === 'skills') return getSkillValidationIssues(editingItem.data);
        if (editingItem.type === 'inducements') return getInducementValidationIssues(editingItem.data);
        if (editingItem.type === 'heraldo') return getHeraldoValidationIssues(editingItem.data);
        return [];
    }, [editingItem]);

    // Filtering logic
    const filteredContent = useMemo(() => {
        const term = searchTerm.toLowerCase();
        switch (activeTab) {
            case 'teams':
                return teams.filter(t => t.name.toLowerCase().includes(term));
            case 'stars':
                return starPlayers.filter(s => s.name.toLowerCase().includes(term));
            case 'skills':
                return skills.filter(s =>
                    s.name_es.toLowerCase().includes(term) ||
                    s.name_en.toLowerCase().includes(term) ||
                    s.keyEN.toLowerCase().includes(term)
                );
            case 'inducements':
                return inducements.filter(i => i.name.toLowerCase().includes(term));
            case 'heraldo':
                return heraldoItems.filter(h => h.title.toLowerCase().includes(term) || h.content.toLowerCase().includes(term));
            default:
                return [];
        }
    }, [activeTab, searchTerm, teams, starPlayers, skills, inducements, heraldoItems]);

    // Automatic URL transformation effect
    useEffect(() => {
        if (!editingItem) return;

        const { type, data } = editingItem;
        const isHero = type === 'hero';
        const urlField = isHero ? 'url' : 'image';
        const currentUrl = data[urlField];

        if (currentUrl && typeof currentUrl === 'string') {
            const transformed = transformGitHubUrl(currentUrl);
            if (transformed !== currentUrl) {
                setEditingItem({
                    ...editingItem,
                    data: {
                        ...data,
                        [urlField]: transformed,
                        // Also update crestImage for teams just in case
                        ...(type === 'teams' ? { crestImage: transformed } : {})
                    }
                });
            }
        }
    }, [editingItem]);

    // Fetch GitHub images when editing or modal opens
    useEffect(() => {
        if (!editingItem) return;

        const fetchGitHubImages = async () => {
            const folder =
                editingItem.type === 'teams'
                    ? 'Escudos'
                    : editingItem.type === 'stars'
                        ? 'Star Players'
                        : null;

            if (!folder) {
                setGitHubImages([]);
                setIsLoadingGitHub(false);
                return;
            }

            setIsLoadingGitHub(true);
            try {
                const response = await fetch(`https://api.github.com/repos/jaz206/Bloodbowl-image/contents/${encodeURIComponent(folder)}?ref=main`);
                if (!response.ok) throw new Error('Error al conectar con GitHub');
                const data = await response.json();
                // Filter only images
                const images = data.filter((file: any) =>
                    file.type === 'file' &&
                    /\.(png|jpe?g|gif|webp)$/i.test(file.name)
                );
                setGitHubImages(images);
            } catch (err) {
                console.error('GitHub fetch failed:', err);
            } finally {
                setIsLoadingGitHub(false);
            }
        };

        fetchGitHubImages();
    }, [editingItem]);

    const getSuggestedImageUrl = (item: any, tab: 'teams' | 'stars') => {
        return tab === 'teams'
            ? resolveTeamLogoPreference(item.name, item.image || item.crestImage) || getTeamLogoUrl(item.name)
            : getStarPlayerImageUrl(item.name);
    };

    const handleAutofillImages = () => {
        if (activeTab !== 'teams' && activeTab !== 'stars') return;

        const total = activeTab === 'teams' ? teams.length : starPlayers.length;
        setConfirmModal({
            title: 'Autorrellenar imágenes',
            message: activeTab === 'teams'
                ? 'Se actualizarán todos los escudos de equipos usando el nombre de cada equipo como referencia. Esto sobrescribirá las imágenes actuales de la pestaña Equipos.'
                : 'Se actualizarán todas las imágenes de Star Players usando el nombre de cada jugador como referencia. Esto sobrescribirá las imágenes actuales de la pestaña Estrellas.',
            danger: true,
            onConfirm: async () => {
                setConfirmModal(null);
                setIsAutoFillingImages(true);
                try {
                    if (activeTab === 'teams') {
                        const updatedTeams = teams.map(team => {
                            const image = getTeamLogoUrl(team.name);
                            return { ...team, image, crestImage: image };
                        });
                        await replaceMasterItems('teams', updatedTeams);
                        showToast(`${total} escudos actualizados automáticamente.`);
                    } else {
                        const updatedStars = starPlayers.map(star => {
                            const image = getStarPlayerImageUrl(star.name);
                            return { ...star, image };
                        });
                        await replaceMasterItems('star_players', updatedStars);
                        showToast(`${total} estrellas actualizadas automáticamente.`);
                    }
                    refresh();
                } catch (err) {
                    console.error('Error autofilling images:', err);
                    showToast('No se pudieron actualizar las imágenes automáticamente.', 'error');
                } finally {
                    setIsAutoFillingImages(false);
                }
            },
        });
    };
    // CSV EXPORT
    const handleExportStars = () => {
        const headers = ['name', 'cost', 'MV', 'FU', 'AG', 'PA', 'AR', 'skills', 'playsFor', 'specialRules_es', 'specialRules_en', 'image'];
        const rows = [headers, ...starPlayers.map(s => [
            s.name,
            s.cost,
            s.stats?.MV ?? '',
            s.stats?.FU ?? '',
            s.stats?.AG ?? '',
            s.stats?.PA ?? '',
            s.stats?.AR ?? '',
            s.skills ?? '',
            Array.isArray(s.playsFor) ? s.playsFor.join(' | ') : '',
            (s as any).specialRules_es ?? s.specialRules ?? '',
            (s as any).specialRules_en ?? s.specialRules ?? '',
            s.image ?? '',
        ])];
        downloadCSV(`star_players_${new Date().toISOString().slice(0,10)}.csv`, rows);
                    showToast('CSV de Star Players descargado.')
    };

    const handleExportTeams = () => {
        const headers = ['name', 'tier', 'rerollCost', 'fuerza', 'agilidad', 'velocidad', 'armadura', 'pase', 'image'];
        const rows = [headers, ...teams.map(t => [
            t.name,
            (t as any).tier ?? '',
            (t as any).rerollCost ?? '',
            (t as any).ratings?.fuerza ?? '',
            (t as any).ratings?.agilidad ?? '',
            (t as any).ratings?.velocidad ?? '',
            (t as any).ratings?.armadura ?? '',
            (t as any).ratings?.pase ?? '',
            (t as any).image ?? (t as any).crestImage ?? '',
        ])];
        downloadCSV(`teams_${new Date().toISOString().slice(0,10)}.csv`, rows);
                    showToast('CSV de Equipos descargado.')
    };
    // CSV IMPORT
    const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!importTarget || !e.target.files?.length) return;
        const file = e.target.files[0];
        e.target.value = '';
        const text = await file.text();
        const { headers, rows } = parseCSV(text);

        const requiredStars = ['name', 'cost'];
        const requiredTeams = ['name'];
        const required = importTarget === 'stars' ? requiredStars : requiredTeams;
        const missing = required.filter(h => !headers.includes(h));
        if (missing.length) {
                    showToast(`Columnas faltantes: ${missing.join(', ')}`, 'error');
            return;
        }

        setIsImporting(true);
        setImportProgress({ total: rows.length, done: 0, errors: [] });
        const errs: string[] = [];

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            if (!row['name']?.trim()) continue;
            try {
                let payload: any;
                if (importTarget === 'stars') {
                    const rawPayload = {
                        name: row.name.trim(),
                        cost: parseInt(row.cost) || 0,
                        stats: { MV: row.MV, FU: row.FU, AG: row.AG, PA: row.PA, AR: row.AR },
                        skills: row.skills ?? '',
                        skillKeys: (row.skills ?? '').split(',').map((s: string) => s.trim()).filter(Boolean),
                        playsFor: (row.playsFor ?? '').split('|').map((s: string) => s.trim()).filter(Boolean),
                        specialRules_es: row.specialRules_es ?? '',
                        specialRules_en: row.specialRules_en ?? '',
                        image: row.image ?? '',
                    };
                    const rowIssues = getStarPlayerValidationIssues(rawPayload);
                    if (rowIssues.length > 0) {
                        throw new Error(`Faltan campos obligatorios: ${rowIssues.join(', ')}`);
                    }
                    payload = sanitizeStarPlayerForSave(rawPayload);
                    await updateMasterItem('star_players', payload.name, payload);
                } else {
                    const rawPayload = {
                        name: row.name.trim(),
                        tier: parseInt(row.tier) || 1,
                        rerollCost: parseInt(row.rerollCost) || 0,
                        ratings: {
                            fuerza: parseInt(row.fuerza) || 0,
                            agilidad: parseInt(row.agilidad) || 0,
                            velocidad: parseInt(row.velocidad) || 0,
                            armadura: parseInt(row.armadura) || 0,
                            pase: parseInt(row.pase) || 0,
                        },
                        ...(row.image ? { image: row.image, crestImage: row.image } : {}),
                    };
                    const rowIssues = getTeamValidationIssues(rawPayload, { requireRoster: false });
                    if (rowIssues.length > 0) {
                        throw new Error(`Faltan campos obligatorios: ${rowIssues.join(', ')}`);
                    }
                    payload = sanitizeTeamForSave(rawPayload);
                    await updateMasterItem('teams', payload.name, payload);
                }
            } catch (err: any) {
                errs.push(`Fila ${i + 2} (${row.name}): ${err.message ?? 'Error desconocido'}`);
            }
            setImportProgress({ total: rows.length, done: i + 1, errors: errs });
        }

        setIsImporting(false);
        refresh();
        if (errs.length === 0) {
                    showToast(`${rows.length} registros importados correctamente.`);
            setImportProgress(null);
        } else {
            showToast(`Importación completada con ${errs.length} errores.`, 'error');
        }
    };

    const handleSync = async (force = false) => {
        const title = force ? '⚠️ Restablecimiento total' : 'Sincronización inteligente';
        const message = force
            ? 'Esta acción reconstruirá los datos maestros desde la base local de referencia. Se conservarán tus cambios manuales si son compatibles.'
            : 'Se sincronizarán los datos maestros añadiendo lo que falte y preservando tus cambios actuales cuando sea posible.';

        setConfirmModal({
            title,
            message,
            danger: force,
            onConfirm: async () => {
                setConfirmModal(null);
                setSyncProgress('syncing');
                try {
                    await syncMasterData(force);
                    setSyncProgress('done');
                    showToast(force
                    ? 'Base de datos restablecida por completo.'
                    : 'Sincronización completada. Nuevos elementos añadidos preservando tus cambios.' );
                    setTimeout(() => setSyncProgress('idle'), 3000);
                } catch (err: any) {
                    console.error('Error syncing:', err);
                    setSyncProgress('error');
                    showToast('Error al sincronizar: ' + (err.message || 'Desconocido'), 'error');
                    setTimeout(() => setSyncProgress('idle'), 3000);
                }
            }
        });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingItem) return;
        if (validationIssues.length > 0) {
            showToast(`Faltan campos obligatorios: ${validationIssues.join(', ')}`, 'error');
            return;
        }
        setIsSaving(true);
        try {
            const { type, data } = editingItem;
            let nextEditingData = data;

            if (type === 'hero') {
                await updateHeroImage(data.url);
            } else if (type === 'arena') {
                await saveArenaConfig(data);
            } else if (type === 'teams') {
                const payload = sanitizeTeamForSave(data);
                nextEditingData = payload;
                await updateMasterItem('teams', payload.name, payload);
            } else if (type === 'stars') {
                const payload = sanitizeStarPlayerForSave(data);
                nextEditingData = payload;
                await updateMasterItem('star_players', payload.name, payload);
            } else if (type === 'skills') {
                const payload = sanitizeSkillForSave(data);
                nextEditingData = payload;
                await updateMasterItem('skills', payload.keyEN, payload);
            } else if (type === 'inducements') {
                const docId = language === 'es' ? 'inducements_es' : 'inducements_en';
                const payload = sanitizeInducementForSave(data);
                nextEditingData = payload;
                await updateMasterItem(docId, payload.name, payload);
            } else if (type === 'heraldo') {
                const payload = sanitizeHeraldoItemForSave(editingItem.data);
                nextEditingData = payload;
                // Use title as ID for heraldo items for now
                const isNew = !heraldoItems.find((h: any) => h.title === payload.title);
            
                if (isNew) {
                    await addItemToMaster('heraldo', payload);
                } else {
                    await updateMasterItem('heraldo', payload.title, payload);
                }
                    showToast('Noticia guardada con éxito en la Base de Datos.')
            }

            // This toast is for all other types that don't have a specific success message
            if (type !== 'heraldo') {
                    showToast('Cambios guardados con éxito en la Base de Datos.')
            }
            setEditingItem((current) => current ? { ...current, data: nextEditingData } : current);
            refresh();
        } catch (error) {
            console.error('Error saving:', error);
            showToast('Error al guardar: ' + (error instanceof Error ? error.message : 'Desconocido'), 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const tabs: { id: AdminTab; label: string; icon: string }[] = [
        { id: 'general', label: 'General', icon: 'settings' },
        { id: 'heraldo', label: 'Heraldo', icon: 'newspaper' },
        { id: 'arena', label: 'Reglas Arena', icon: 'stadia_controller' },
        { id: 'competitions', label: 'Competiciones', icon: 'emoji_events' },
        { id: 'teams', label: 'Equipos', icon: 'groups' },
        { id: 'stars', label: 'Estrellas', icon: 'star' },
        { id: 'skills', label: 'Habilidades', icon: 'bolt' },
        { id: 'inducements', label: 'Incentivos', icon: 'payments' },
    ];

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-premium-gold shadow-[0_0_20px_rgba(202,138,4,0.3)]"></div>
            <p className="text-[10px] font-black uppercase text-premium-gold animate-pulse tracking-widest">Invocando a Nuffle...</p>
        </div>
    );

    return (
        <div className="admin-light p-4 sm:p-8 animate-fade-in-slow max-w-7xl mx-auto min-h-screen">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                    <div className="flex items-center gap-3">
                        <span className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blood-red/20 to-premium-gold/20 border border-white/10 flex items-center justify-center shadow-2xl">
                            <span className="material-symbols-outlined text-premium-gold text-2xl">admin_panel_settings</span>
                        </span>
                        <div>
                            <h2 className="text-4xl font-display font-black text-white italic tracking-tighter uppercase leading-none">Nursery de Nuffle</h2>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-1 ml-1">Módulo de Administración de Datos Maestros</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-4 items-center">
                    <div className={`px-4 py-2 rounded-xl flex items-center gap-2 border transition-colors ${isFromFirestore ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-orange-500/10 border-orange-500/30 text-orange-400'}`}>
                        <div className={`w-2 h-2 rounded-full ${isFromFirestore ? 'bg-green-400 animate-pulse' : 'bg-orange-400'}`}></div>
                        <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                            {isFromFirestore ? 'LIVE: FIRESTORE' : 'LOCAL: STATIC FALLBACK'}
                        </span>
                    </div>

                    <button
                        onClick={() => handleSync(false)}
                        disabled={syncProgress === 'syncing'}
                        className={`px-6 py-2.5 rounded-xl border font-display font-black uppercase tracking-widest text-[10px] transition-all flex items-center gap-3 shadow-xl ${syncProgress === 'syncing'
                            ? 'bg-zinc-800 border-zinc-700 text-zinc-500 cursor-not-allowed'
                            : syncProgress === 'done'
                                ? 'bg-green-500/20 border-green-500/30 text-green-400'
                                : syncProgress === 'error'
                                    ? 'bg-red-500/20 border-red-500/30 text-red-400'
                                    : 'bg-blood-red/20 border-blood-red/30 text-blood-red hover:bg-blood-red hover:text-white hover:shadow-blood-red/20'
                            }`}
                    >
                        {syncProgress === 'syncing' ? (
                            <span className="w-3 h-3 border-2 border-zinc-500 border-t-white rounded-full animate-spin"></span>
                        ) : syncProgress === 'done' ? (
                            <span className="material-symbols-outlined text-sm">check_circle</span>
                        ) : syncProgress === 'error' ? (
                            <span className="material-symbols-outlined text-sm">error</span>
                        ) : (
                            <span className="material-symbols-outlined text-sm">sync</span>
                        )}
                        <span>{syncButtonLabel}</span>
                    </button>
                </div>
            </header>

            {/* Navigation Tabs */}
            <div className="flex overflow-x-auto pb-4 mb-8 custom-scrollbar gap-2 no-scrollbar">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => { setActiveTab(tab.id); setSearchTerm(''); }}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-display font-black uppercase tracking-widest text-[10px] transition-all whitespace-nowrap border ${activeTab === tab.id
                            ? 'bg-premium-gold text-black border-premium-gold shadow-lg shadow-premium-gold/20'
                            : 'bg-white/5 text-slate-400 border-white/5 hover:border-white/20 hover:text-white'
                            }`}
                    >
                        <span className="material-symbols-outlined text-sm">{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="glass-panel border-white/5 bg-black/30 p-5 mb-8">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                        <p className="text-[10px] font-black text-premium-gold uppercase tracking-[0.3em] mb-1">
                            Destino de guardado activo
                        </p>
                        <h4 className="text-lg font-display font-black text-white uppercase italic tracking-tight">
                            {tabs.find(tab => tab.id === activeTab)?.label}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-2 max-w-2xl">
                            {activeStorageInfo.description}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2 md:justify-end">
                        <span className="px-3 py-1.5 rounded-xl bg-premium-gold/10 border border-premium-gold/20 text-premium-gold text-[10px] font-black uppercase tracking-widest">
                            {activeStorageInfo.mode}
                        </span>
                        <span className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-[10px] font-mono">
                            {activeStorageInfo.target}
                        </span>
                        {isFromFirestore && (
                            <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                                Fuente viva: Firestore
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-8"
                >
                    {activeTab === 'general' ? (
                        <AdminGeneralForm
                            heroImage={heroImage}
                            teams={teams}
                            skills={skills}
                            starPlayers={starPlayers}
                            inducements={inducements}
                            setEditingItem={setEditingItem}
                        />
                    ) : activeTab === 'arena' ? (
                        <div className="space-y-8">
                            <div className="glass-panel p-8 border-white/5 bg-black/40">
                                <div className="flex justify-between items-center mb-8">
                                    <div>
                                        <h4 className="text-2xl font-display font-black text-white uppercase italic tracking-tighter">Reglamento de la Arena</h4>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Configuración dinámica de SPP, Economía y Dados</p>
                                    </div>
                                    <button 
                                        onClick={() => setEditingItem({ type: 'arena', data: { ...arenaConfig } })}
                                        className="bg-premium-gold text-black px-6 py-3 rounded-xl font-display font-black uppercase tracking-widest text-[10px] shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
                                    >
                                        <span className="material-symbols-outlined text-sm">edit</span>
                                        Editar Reglamento
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* SPP Values */}
                                    <div className="bg-white/5 rounded-2xl p-6 border border-white/5 space-y-4">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="material-symbols-outlined text-premium-gold">workspace_premium</span>
                                            <span className="text-[10px] font-black text-white uppercase tracking-widest">Recompensas SPP</span>
                                        </div>
                                        <div className="space-y-2">
                                            {Object.entries(arenaConfig.spp).map(([key, value]) => (
                                                <div key={key} className="flex justify-between items-center text-sm">
                                                    <span className="text-slate-500 uppercase text-[10px] font-bold">{key}</span>
                                                    <span className="text-white font-black">{value} pts</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Economics */}
                                    <div className="bg-white/5 rounded-2xl p-6 border border-white/5 space-y-4">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="material-symbols-outlined text-green-500">payments</span>
                                            <span className="text-[10px] font-black text-white uppercase tracking-widest">Economía & Bonos</span>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-slate-500 uppercase text-[10px] font-bold">Bono Victoria</span>
                                                <span className="text-white font-black">{arenaConfig.economics.win_bonus * 10}k</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-slate-500 uppercase text-[10px] font-bold">Bono Fair Play</span>
                                                <span className="text-white font-black">{arenaConfig.economics.no_stalling_bonus * 10}k</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-slate-500 uppercase text-[10px] font-bold">Multiplicador</span>
                                                <span className="text-white font-black">x{arenaConfig.economics.multiplier / 1000}k</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Dice Config */}
                                    <div className="bg-white/5 rounded-2xl p-6 border border-white/5 space-y-4">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="material-symbols-outlined text-sky-500">casino</span>
                                            <span className="text-[10px] font-black text-white uppercase tracking-widest">Configuración Dados</span>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-slate-500 uppercase text-[10px] font-bold">Recaudación</span>
                                                <span className="text-white font-black bg-sky-500/10 px-2 py-0.5 rounded text-[10px]">{arenaConfig.dice.winnings}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-slate-500 uppercase text-[10px] font-bold">MVP</span>
                                                <span className="text-white font-black bg-sky-500/10 px-2 py-0.5 rounded text-[10px]">{arenaConfig.dice.mvp}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-slate-500 uppercase text-[10px] font-bold">Hinchas</span>
                                                <span className="text-white font-black bg-sky-500/10 px-2 py-0.5 rounded text-[10px]">{arenaConfig.dice.fans}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : activeTab === 'competitions' ? (
                        <AdminCompetitionLab
                            managedTeams={managedTeams}
                            competitions={competitions}
                            onCompetitionCreate={onCompetitionCreate}
                            onOpenLeagues={onOpenLeagues}
                        />
                    ) : (
                        <>
                            {/* Search + CSV toolbar for Content Tabs */}
                            <div className="flex flex-wrap gap-3 items-center">
                                <div className="relative flex-1 min-w-[200px] group">
                                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-premium-gold transition-colors">
                                        <SearchIcon className="h-5 w-5" />
                                    </div>
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder={`Buscar ${tabs.find(t => t.id === activeTab)?.label.toLowerCase()}...`}
                                        className="block w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-premium-gold/30 shadow-2xl transition-all"
                                    />
                                </div>

                                {(activeTab === 'stars' || activeTab === 'teams') && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleAutofillImages}
                                            disabled={isAutoFillingImages}
                                            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-display font-black uppercase tracking-widest text-[10px] hover:bg-amber-500/20 transition-all whitespace-nowrap shadow-lg disabled:opacity-40"
                                            title="Autorrellenar imagenes segun el nombre"
                                        >
                                            <span className="material-symbols-outlined text-sm">auto_fix_high</span>
                                            {isAutoFillingImages ? 'Autorrellenando...' : 'Autorrellenar imagenes'}
                                        </button>

                                        {/* Export CSV */}
                                        <button
                                            onClick={activeTab === 'stars' ? handleExportStars : handleExportTeams}
                                            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-display font-black uppercase tracking-widest text-[10px] hover:bg-emerald-500/20 transition-all whitespace-nowrap shadow-lg"
                                            title={`Exportar ${activeTab === 'stars' ? 'Star Players' : 'Equipos'} como CSV`}
                                        >
                                            <span className="material-symbols-outlined text-sm">download</span>
                                            Exportar CSV
                                        </button>

                                        {/* Import CSV */}
                                        <button
                                            onClick={() => { setImportTarget(activeTab); importInputRef.current?.click(); }}
                                            disabled={isImporting}
                                            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-400 font-display font-black uppercase tracking-widest text-[10px] hover:bg-sky-500/20 transition-all whitespace-nowrap shadow-lg disabled:opacity-40"
                                            title={`Importar ${activeTab === 'stars' ? 'Star Players' : 'Equipos'} desde CSV`}
                                        >
                                            <span className="material-symbols-outlined text-sm">upload</span>
                                            Importar CSV
                                        </button>

                                        <input
                                            ref={importInputRef}
                                            type="file"
                                            accept=".csv,text/csv"
                                            className="hidden"
                                            onChange={handleImportCSV}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Import Progress Bar */}
                            {importProgress && (
                                <div className="glass-panel p-5 border-sky-500/30 bg-black/60 space-y-3 animate-slide-in-up">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-display font-black text-sky-400 uppercase tracking-widest">
                                            {isImporting ? `Importando... ${importProgress.done} / ${importProgress.total}` : `Completado: ${importProgress.done} filas`}
                                        </span>
                                        {!isImporting && (
                                            <button onClick={() => setImportProgress(null)} className="text-slate-500 hover:text-white text-xs">
                                                <span className="material-symbols-outlined text-base">close</span>
                                            </button>
                                        )}
                                    </div>
                                    <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                                        <div
                                            className="h-2 bg-sky-500 rounded-full transition-all duration-300"
                                            style={{ width: `${importProgress.total ? (importProgress.done / importProgress.total) * 100 : 0}%` }}
                                        />
                                    </div>
                                    {importProgress.errors.length > 0 && (
                                        <div className="max-h-24 overflow-y-auto space-y-1 custom-scrollbar">
                                            {importProgress.errors.map((e, i) => (
                                                <p key={i} className="text-[9px] text-blood-red font-mono">{e}</p>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* List Container */}
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 custom-scrollbar max-h-[70vh] overflow-y-auto pr-2">
                                {filteredContent.map((item: any) => (
                                    <motion.div
                                        key={item.keyEN || item.name}
                                        layout
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="group flex justify-between items-center p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-premium-gold/30 hover:bg-white/[0.08] transition-all"
                                    >
                                        <div className="flex items-center gap-4 min-w-0">
                                            {(activeTab === 'teams' || activeTab === 'stars') && (
                                                <div className="w-12 h-12 rounded-xl bg-black/60 border border-white/10 overflow-hidden flex-shrink-0 shadow-inner">
                                                        <img
                                                        src={getSuggestedImageUrl(item, activeTab as 'teams' | 'stars')}
                                                        alt=""
                                                        onError={(e) => {
                                                            const fallback = getSuggestedImageUrl(item, activeTab as 'teams' | 'stars');
                                                            if ((e.currentTarget as HTMLImageElement).src !== fallback) {
                                                                (e.currentTarget as HTMLImageElement).src = fallback;
                                                            }
                                                        }}
                                                        className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
                                                    />
                                                </div>
                                            )}
                                            {activeTab === 'skills' && (
                                                <div className="w-10 h-10 rounded-xl bg-premium-gold/10 border border-premium-gold/20 flex items-center justify-center text-premium-gold">
                                                    <span className="material-symbols-outlined text-base">bolt</span>
                                                </div>
                                            )}
                                            {activeTab === 'inducements' && (
                                                <div className="w-10 h-10 rounded-xl bg-blood-red/10 border border-blood-red/20 flex items-center justify-center text-blood-red">
                                                    <span className="material-symbols-outlined text-base">payments</span>
                                                </div>
                                            )}
                                            {activeTab === 'heraldo' && (
                                                <div className="w-10 h-10 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-premium-gold">
                                                    <span className="material-symbols-outlined text-base">{item.type === 'starplayer' ? 'star' : item.type === 'team' ? 'groups' : 'bolt'}</span>
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <h5 className="font-display font-black text-white uppercase tracking-wider text-sm truncate group-hover:text-premium-gold transition-colors italic">
                                                    {activeTab === 'skills'
                                                        ? (language === 'es' ? (item.name_es || item.name_en) : item.name_en)
                                                        : item.title || item.name}
                                                </h5>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase truncate tracking-tighter">
                                                    {activeTab === 'skills' ? item.category : activeTab === 'heraldo' ? item.category : (item.cost ? `${(item.cost / 1000)}k MO` : item.tier ? `Tier ${item.tier}` : 'Consistente')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 ml-4">
                                            <button
                                                onClick={() => setEditingItem({ type: activeTab, data: { ...item } })}
                                                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-premium-gold hover:text-black hover:border-premium-gold font-display font-black text-[9px] uppercase tracking-widest transition-all whitespace-nowrap"
                                            >
                                                Editar
                                            </button>
                                            {activeTab === 'heraldo' && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setConfirmModal({
                                                            title: '¿Eliminar noticia?',
                                                            message: `Vas a borrar permanentemente "${item.title}". Esta acción no se puede deshacer.`,
                                                            danger: true,
                                                            onConfirm: async () => {
                                                                try {
                                                                    await deleteMasterItem('heraldo', item.title);
                                                                    showToast('Noticia eliminada correctamente');
                                                                    refresh();
                                                                } catch (err) {
                                                                }
                                                                setConfirmModal(null);
                                                            }
                                                        });
                                                    }}
                                                    className="w-10 h-10 rounded-xl bg-blood/10 border border-blood/20 text-blood hover:bg-blood hover:text-white transition-all flex items-center justify-center"
                                                >
                                                    <span className="material-symbols-outlined text-sm">delete</span>
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                                {filteredContent.length === 0 && (
                                    <div className="col-span-full py-20 text-center glass-panel border-dashed border-white/10">
                                        <span className="material-symbols-outlined text-4xl text-slate-700 mb-2">search_off</span>
                                        <p className="text-slate-500 font-display font-bold uppercase text-[10px] tracking-[0.3em]">No se encontraron resultados para "{searchTerm}"</p>
                                    </div>
                                )}

                                {activeTab === 'heraldo' && (
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => setEditingItem({ 
                                                type: 'heraldo', 
                                                data: { type: 'skill', title: 'NUEVA NOTICIA', active: true, tag: 'Destacado', content: '', category: 'Sección de Habilidades' } 
                                            })}
                                            className="px-6 py-3 rounded-xl bg-premium-gold/10 border border-premium-gold/30 text-premium-gold font-display font-black uppercase tracking-widest text-[10px] hover:bg-premium-gold hover:text-black transition-all flex items-center gap-2"
                                        >
                                            <span className="material-symbols-outlined text-sm">add</span>
                                            Añadir Noticia
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </motion.div>
            </AnimatePresence>

            <AdminEditorModal
                editingItem={editingItem}
                tabs={tabs}
                activeTab={activeTab}
                isSaving={isSaving}
                language={language}
                skills={skills}
                arenaConfig={arenaConfig}
                heraldoItems={heraldoItems}
                gitHubImages={gitHubImages}
                isLoadingGitHub={isLoadingGitHub}
                githubSearch={githubSearch}
                setGithubSearch={setGithubSearch}
                validationIssues={validationIssues}
                isImageExplorerExpanded={isImageExplorerExpanded}
                setIsImageExplorerExpanded={setIsImageExplorerExpanded}
                activeTeamTab={activeTeamTab}
                setActiveTeamTab={setActiveTeamTab}
                handleSave={handleSave}
                filteredContent={filteredContent}
                onSelectItem={(item) => setEditingItem({ type: activeTab, data: { ...item } })}
                setEditingItem={setEditingItem}
            />
            <AdminFeedbackOverlays
                syncProgress={syncProgress}
                confirmModal={confirmModal}
                toastMessage={toastMessage}
                onDismissConfirm={() => setConfirmModal(null)}
            />
        </div>
    );
};

export default AdminPanel;

