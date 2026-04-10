import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ManagedTeam, ManagedPlayer, Player, Skill, ManagedTeamSnapshot, MatchReport } from '../../types';
import { ELITE_SKILLS } from '../../types';
import { teamsData } from '../../data/teams';
import { skillsData } from '../../data/skills';
import PlayerModal from './PlayerModal';
import SkillModal from '../oracle/SkillModal';
import { generateRandomName } from '../../data/randomNames';
import { PlayerAdvancementModal } from './PlayerAdvancementModal';
import { useMasterData } from '../../hooks/useMasterData';
import { calculateTeamValue } from '../../utils/teamUtils';
import { sanitizeMojibakeText } from '../../utils/textSanitizer';
import {
    getPlayerImageUrl,
    getTeamLogoUrl,
    fetchTeamImageStock,
    type PositionStock,
    type PositionStockEntry,
    getPosTag
} from '../../utils/imageUtils';
import { mergeTeamWithFallback } from '../../utils/teamData';

declare const QRCode: any;

const LEAGUE_MAP: Record<string, string> = {
    "Superliga Lustria": "Lustrian Superleague",
    "Pelea de Badlands": "Badlands Brawl",
    "Clásico del Viejo Mundo": "Old World Classic",
    "Superliga del Borde del Mundo": "Worlds Edge Superleague",
    "Favorito de...": "Favoured of",
    "Copa Halfling Thimble": "Halfling Thimble Cup",
    "Liga de los Reinos Élficos": "Elven Kingdoms League",
    "Desafío del Inframundo": "Underworld Challenge",
    "Foco de Sylvana": "Sylvanian Spotlight",
    "Liga de Woodland": "Woodland League",
    "Choque del Caos": "Chaos Clash",
    "Favorito de Hashut": "Favoured of Hashut",
    "Favorito de Khorne": "Favoured of Khorne",
    "Favorito de Nurgle": "Favoured of Nurgle",
    "Favorito de Slaanesh": "Favoured of Slaanesh",
    "Favorito de Tzeentch": "Favoured of Tzeentch",
    "Copa de la Jungla": "Jungle Cup"
};

const SPP_LEVELS = [6, 16, 31, 51, 76, 126, 176];

interface AssetCardProps {
    title: string;
    value: number;
    limit: number;
    price: number;
    onBuy: () => void;
    onSell: () => void;
    icon: string;
    canSell: boolean;
}

const AssetCard: React.FC<AssetCardProps> = ({ title, value, limit, price, onBuy, onSell, icon, canSell }) => (
    <div className='flex flex-col p-4 bg-black/20 rounded-2xl border border-white/5 group hover:border-primary/30 transition-all'>
        <div className='flex justify-between items-start mb-4'>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${value > 0 ? 'bg-primary text-black' : 'bg-white/5 text-slate-500'}`}>
                <span className='material-symbols-outlined text-xl'>{icon}</span>
            </div>
            <div className='text-right'>
                <span className='text-[10px] font-display font-black text-slate-600 uppercase tracking-widest block'>Cantidad</span>
                <span className='text-2xl font-display font-black text-white italic'>{value}<span className='text-xs text-slate-600 ml-1 not-italic'>/{limit}</span></span>
            </div>
        </div>
        <p className='text-[10px] font-display font-bold text-slate-400 uppercase tracking-[0.1em] mb-4 h-6 overflow-hidden line-clamp-1'>{title}</p>
        <div className='flex gap-2 mt-auto'>
            <button
                onClick={onBuy}
                disabled={value >= limit}
                className='flex-grow bg-primary/10 border border-primary/20 text-primary font-display font-black uppercase text-[10px] py-2 rounded-lg hover:bg-primary hover:text-black transition-all disabled:opacity-20'
            >
                +{(price / 1000)}k
            </button>
            <button
                onClick={onSell}
                disabled={!canSell}
                className='w-10 flex items-center justify-center bg-white/5 border border-white/10 text-white font-bold rounded-lg hover:bg-blood/20 hover:text-blood hover:border-blood/50 transition-all disabled:opacity-20'
            >
                -
            </button>
        </div>
    </div>
);

interface TeamDashboardProps {
    team: ManagedTeam;
    onUpdate: (team: ManagedTeam) => void;
    onDeleteRequest?: (teamId: string) => void;
    onBack: () => void;
    isGuest: boolean;
    matchReports?: MatchReport[];
    hideDelete?: boolean;
    syncLabel?: string;
    onSync?: () => void;
    stickyOffset?: string;
}

export const TeamDashboard: React.FC<TeamDashboardProps> = ({ 
    team, 
    onUpdate, 
    onDeleteRequest, 
    onBack, 
    isGuest, 
    matchReports = [],
    hideDelete = false,
    syncLabel = "Sincronizar",
    onSync,
    stickyOffset = "top-16"
}) => {
    const [editingPlayer, setEditingPlayer] = useState<ManagedPlayer | null>(null);
    const [openPlayerMenuId, setOpenPlayerMenuId] = useState<number | null>(null);
    const [showQr, setShowQr] = useState(false);
    const [selectedSkillForModal, setSelectedSkillForModal] = useState<Skill | null>(null);
    const [editingPlayerId, setEditingPlayerId] = useState<number | null>(null);
    const [editingName, setEditingName] = useState('');
    const [editingJerseyId, setEditingJerseyId] = useState<number | null>(null);
    const [editingJerseyValue, setEditingJerseyValue] = useState('');
    const [fireConfirmation, setFireConfirmation] = useState<ManagedPlayer | null>(null);
    const [advancingPlayer, setAdvancingPlayer] = useState<ManagedPlayer | null>(null);
    const { starPlayers, teams: masterTeams, skills: masterSkills } = useMasterData();
    const [snapshotToRestore, setSnapshotToRestore] = useState<ManagedTeamSnapshot | null>(null);

    const qrCanvasRef = useRef<HTMLCanvasElement>(null);
    const crestInputRef = useRef<HTMLInputElement>(null);
    const [activeTab, setActiveTab] = useState<'roster' | 'recruit' | 'staff' | 'history'>('roster');
    const [zoomedImage, setZoomedImage] = useState<string | null>(null);
    const [imageStock, setImageStock] = useState<PositionStock | null>(null);
    const [hiddenPlayerImages, setHiddenPlayerImages] = useState<Record<number, boolean>>({});

    useEffect(() => {
        const loadStock = async () => {
            const stock = await fetchTeamImageStock(team.rosterName);
            setImageStock(stock);
        };
        loadStock();
    }, [team.rosterName]);
    const baseRoster = useMemo(() => {
        const master = masterTeams.find(t => t.name === team.rosterName);
        const staticRoster = teamsData.find(t => t.name === team.rosterName);
        return mergeTeamWithFallback(master as any, staticRoster as any);
    }, [masterTeams, team.rosterName]);
    const canonicalTeamTemplate = useMemo(() => teamsData.find(t => t.name === team.rosterName), [team.rosterName]);

    const skillCatalog = useMemo(() => (masterSkills?.length ? masterSkills : skillsData), [masterSkills]);

    const normalizeLookupKey = (value?: string) =>
        sanitizeMojibakeText(String(value || ''))
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, ' ')
            .trim();

    const normalizeJerseyNumber = (value: unknown): number | undefined => {
        const parsed = Number(value);
        if (!Number.isFinite(parsed) || parsed < 1 || parsed > 99) return undefined;
        return Math.trunc(parsed);
    };
    const normalizeManagedPlayerStatus = (status: ManagedPlayer['status'] | undefined, isBenched: boolean): ManagedPlayer['status'] => {
        if (status && ['KO', 'Lesionado', 'Expulsado', 'Muerto'].includes(status)) {
            return status;
        }
        return isBenched ? 'Reserva' : 'Activo';
    };

    const resolveSkillRecord = (skillRef: string): Skill | undefined => {
        const lookup = normalizeLookupKey(skillRef);
        return skillCatalog.find((skill) => [skill.keyEN, skill.name_es, skill.name_en, skill.name]
            .some((candidate) => normalizeLookupKey(candidate) === lookup));
    };

    const resolveSkillLabel = (skillRef: string): string => {
        const record = resolveSkillRecord(skillRef);
        return record?.name_es || record?.name_en || sanitizeMojibakeText(skillRef);
    };

    const findRosterTemplateForPlayer = (player: ManagedPlayer): Player | undefined => {
        const playerKey = normalizeLookupKey(player.position);
        const rosterPool = [...(baseRoster?.roster || []), ...(canonicalTeamTemplate?.roster || [])];
        const matchedByName = rosterPool.find((entry) => {
            const entryKey = normalizeLookupKey(entry.position);
            return entryKey === playerKey || entryKey.includes(playerKey) || playerKey.includes(entryKey);
        });
        if (matchedByName) return matchedByName;
        return rosterPool.find((entry) =>
            entry.cost === player.cost &&
            entry.stats.MV === player.stats.MV &&
            String(entry.stats.FU) === String(player.stats.FU) &&
            String(entry.stats.AG) === String(player.stats.AG) &&
            String(entry.stats.PA) === String(player.stats.PA) &&
            String(entry.stats.AR) === String(player.stats.AR)
        );
    };

    const getPlayerCoreSkillKeys = (player: ManagedPlayer): string[] => {
        const template = findRosterTemplateForPlayer(player);
        const current = Array.isArray(player.skillKeys) ? player.skillKeys.filter(Boolean) : [];
        if (current.length > 0) return current;
        if (template?.skillKeys?.length) return template.skillKeys;
        return (player.skills || '')
            .split(',')
            .map((skill) => skill.trim())
            .filter((skill) => skill && !['ninguna', 'none'].includes(skill.toLowerCase()));
    };

    const getPlayerDisplayedSkills = (player: ManagedPlayer) => {
        const combined = [...getPlayerCoreSkillKeys(player), ...(player.gainedSkills || [])];
        const deduped = combined.filter((skill, index) => {
            const lookup = normalizeLookupKey(skill);
            return combined.findIndex((candidate) => normalizeLookupKey(candidate) === lookup) === index;
        });
        return deduped.map((skill) => ({
            key: resolveSkillRecord(skill)?.keyEN || skill,
            label: resolveSkillLabel(skill),
            isElite: ELITE_SKILLS.includes(resolveSkillRecord(skill)?.keyEN || skill) || ELITE_SKILLS.includes(skill),
        }));
    };

    const normalizeManagedPlayer = (player: ManagedPlayer): ManagedPlayer => ({
        ...player,
        jerseyNumber: normalizeJerseyNumber((player as any).jerseyNumber ?? (player as any).number),
        skillKeys: Array.isArray(player.skillKeys) && player.skillKeys.length > 0 ? player.skillKeys.filter(Boolean) : getPlayerCoreSkillKeys(player),
        gainedSkills: Array.isArray(player.gainedSkills) ? player.gainedSkills.filter(Boolean) : [],
        lastingInjuries: Array.isArray(player.lastingInjuries) ? player.lastingInjuries.filter(Boolean) : [],
        missNextGame: player.missNextGame || 0,
        isBenched: player.isBenched ?? true,
        status: normalizeManagedPlayerStatus(player.status, player.isBenched ?? true),
    });

    const getPlayerVisibleImage = (player: ManagedPlayer) => {
        if (!player.image || hiddenPlayerImages[player.id]) return '';
        return player.image;
    };

    const hideBrokenPlayerImage = (playerId: number) => {
        setHiddenPlayerImages((current) => ({ ...current, [playerId]: true }));
    };

    const resolveTeamCrestUrl = (managedTeam: ManagedTeam): string => {
        const staticTeam = teamsData.find(t => t.name === managedTeam.rosterName);
        const masterTeam = masterTeams.find(t => t.name === managedTeam.rosterName);
        const merged = mergeTeamWithFallback(managedTeam as any, (masterTeam || staticTeam) as any);
        return (
            managedTeam.crestImage ||
            merged.crestImage ||
            merged.image ||
            getTeamLogoUrl(managedTeam.rosterName) ||
            ''
        );
    };

    useEffect(() => {
        if (showQr && qrCanvasRef.current && team && typeof QRCode !== 'undefined') {
            const shareableTeam = {
                n: team.name,
                rN: team.rosterName,
                t: team.treasury,
                rr: team.rerolls,
                df: team.dedicatedFans,
                ch: team.cheerleaders,
                ac: team.assistantCoaches,
                ap: team.apothecary,
                pl: team.players.map(p => ({
                    p: p.position,
                    cN: p.customName,
                    s: p.spp,
                    gS: p.gainedSkills,
                    lI: p.lastingInjuries,
                }))
            };
            const teamJson = JSON.stringify(shareableTeam);

            QRCode.toCanvas(qrCanvasRef.current, teamJson, { width: 256, margin: 2, errorCorrectionLevel: 'L' }, function (error: any) {
                if (error) {
                    console.error(error);
                    alert('Error al generar el QR: los datos del equipo son demasiado grandes.');
                    setShowQr(false);
                }
            })
        }
    }, [showQr, team]);

    const teamValue = useMemo(() => calculateTeamValue(team), [team]);
    const historySummary = useMemo(() => {
        const matches = team.history || [];
        return matches.reduce((acc, match) => {
            acc.played += 1;
            acc.wins += match.result === 'W' ? 1 : 0;
            acc.draws += match.result === 'D' ? 1 : 0;
            acc.losses += match.result === 'L' ? 1 : 0;
            const [forScoreRaw, againstScoreRaw] = match.score.split('-');
            const forScore = Number(forScoreRaw) || 0;
            const againstScore = Number(againstScoreRaw) || 0;
            acc.tdFor += forScore;
            acc.tdAgainst += againstScore;
            return acc;
        }, { played: 0, wins: 0, draws: 0, losses: 0, tdFor: 0, tdAgainst: 0 });
    }, [team.history]);
    const recordSummary = `${historySummary.wins}-${historySummary.draws}-${historySummary.losses}`;
    const hasRegisteredCrest = Boolean(team.crestImage || baseRoster?.crestImage);

    const handleSkillClick = (skillName: string) => {
        const foundSkill = resolveSkillRecord(skillName);
        if (foundSkill) {
            setSelectedSkillForModal(foundSkill);
        }
    };

    const handleNameDoubleClick = (player: ManagedPlayer) => {
        setEditingPlayerId(player.id);
        setEditingName(player.customName);
    };

    const handleNameUpdate = () => {
        if (editingPlayerId === null) return;
        const newName = editingName.trim();
        if (newName === '') {
            setEditingPlayerId(null);
            return;
        }
        onUpdate({
            ...team,
            players: team.players.map(p => p.id === editingPlayerId ? normalizeManagedPlayer({ ...p, customName: newName }) : p),
        });
        setEditingPlayerId(null);
    };

    const handleJerseyDoubleClick = (player: ManagedPlayer, fallbackNumber: number) => {
        setEditingJerseyId(player.id);
        setEditingJerseyValue(String(player.jerseyNumber || fallbackNumber || ''));
    };

    const handleJerseyUpdate = () => {
        if (editingJerseyId === null) return;
        const parsed = parseInt(editingJerseyValue, 10);
        onUpdate({
            ...team,
            players: team.players.map(p => p.id === editingJerseyId ? {
                ...normalizeManagedPlayer(p),
                jerseyNumber: Number.isFinite(parsed) && parsed > 0 ? parsed : undefined,
            } : p),
        });
        setEditingJerseyId(null);
        setEditingJerseyValue('');
    };

    const handleCrestUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_SIZE = 200;
                let width = img.width, height = img.height;
                if (width > height) {
                    if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; }
                } else {
                    if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; }
                }
                canvas.width = width; canvas.height = height;
                canvas.getContext('2d')?.drawImage(img, 0, 0, width, height);
                onUpdate({ ...team, crestImage: canvas.toDataURL('image/png') });
            };
            img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    const handleBuyAsset = (asset: keyof ManagedTeam, cost: number, limit: number) => {
        if ((team[asset] as number) >= limit) return;
        if (team.treasury < cost && !team.isAutoCalculating) return;
        onUpdate({
            ...team,
            treasury: team.isAutoCalculating ? team.treasury : team.treasury - cost,
            [asset]: (team[asset] as number) + 1
        });
    };

    const handleSellAsset = (asset: keyof ManagedTeam, refund: number, min: number = 0) => {
        if ((team[asset] as number) <= min) return;
        onUpdate({
            ...team,
            treasury: team.isAutoCalculating ? team.treasury : team.treasury + refund,
            [asset]: (team[asset] as number) - 1
        });
    };

    const getImageStockEntry = (position: string): PositionStockEntry | null => {
        const posTag = getPosTag(position).toLowerCase();
        return imageStock?.[posTag] || null;
    };

    const getExistingImageParts = (url?: string): { folder: string; filename: string } => {
        if (!url) return { folder: '', filename: '' };
        const cleanUrl = url.split('?')[0];
        const parts = cleanUrl.split('/').map(part => decodeURIComponent(part));
        return {
            folder: (parts[parts.length - 2] || '').toLowerCase(),
            filename: parts[parts.length - 1] || ''
        };
    };

    const isValidNestedImage = (url: string | undefined, position: string, filenames: string[]): boolean => {
        if (!url) return false;
        const { folder, filename } = getExistingImageParts(url);
        if (folder !== getPosTag(position).toLowerCase()) return false;
        return filenames.includes(filename);
    };

    const isValidLegacyImage = (url: string | undefined, position: string, filenames: string[]): boolean => {
        if (!url) return false;
        const { filename } = getExistingImageParts(url);
        if (filenames.length > 0) {
            return filenames.includes(filename);
        }
        return false;
    };

    const handleHirePlayer = (player: Player) => {
        const limit = parseInt((player?.qty || '0-16').split('-')[1]);
        if (team.players.filter(p => p.position === player.position).length >= limit) return;
        if (team.players.length >= 16) return;
        if (team.treasury < player.cost && !team.isAutoCalculating) return;

        // Use stock if available, else fallback to 15
        const stockEntry = getImageStockEntry(player.position);
        const availableNumbers = stockEntry?.numbers || Array.from({ length: 15 }, (_, i) => i + 1);
        const availableFiles = stockEntry?.files || [];
        const imgNumber = availableNumbers[Math.floor(Math.random() * availableNumbers.length)];
        const selectedFilename = availableFiles.length > 0
            ? availableFiles[Math.floor(Math.random() * availableFiles.length)]
            : undefined;
        
        const playerImageUrl = getPlayerImageUrl(
            team.rosterName,
            player.position,
            imgNumber,
            stockEntry?.storage || 'nested',
            selectedFilename
        );
        const nextJerseyNumber = Math.max(
            1,
            ...team.players.map((pl, idx) => Number(pl.jerseyNumber) || (idx + 1))
        ) + 1;

        const newPlayer: ManagedPlayer = {
            ...player,
            id: Date.now(),
            jerseyNumber: nextJerseyNumber,
            customName: generateRandomName(team.rosterName),
            spp: 0,
            gainedSkills: [],
            lastingInjuries: [],
            status: 'Activo',
            isBenched: true,
            image: playerImageUrl,
        };
        onUpdate({
            ...team,
            treasury: team.isAutoCalculating ? team.treasury : team.treasury - player.cost,
            players: [...team.players, newPlayer],
        });
    };

    const handleAutoSyncImages = async () => {
        const stock = imageStock || await fetchTeamImageStock(team.rosterName);
        const updatedPlayers = team.players.map(p => {
            const posTag = getPosTag(p.position).toLowerCase();
            const stockEntry = stock[posTag] || null;
            const availableNumbers = stockEntry?.numbers || Array.from({ length: 15 }, (_, i) => i + 1);
            const availableFiles = stockEntry?.files || [];

            if (stockEntry && (
                isValidNestedImage(p.image, p.position, availableFiles) ||
                isValidLegacyImage(p.image, p.position, availableFiles)
            )) {
                return p;
            }

            const imgNum = availableNumbers[Math.floor(Math.random() * availableNumbers.length)];
            const selectedFilename = availableFiles.length > 0
                ? availableFiles[Math.floor(Math.random() * availableFiles.length)]
                : undefined;

            return {
                ...p,
                image: getPlayerImageUrl(
                    team.rosterName,
                    p.position,
                    imgNum,
                    stockEntry?.storage || 'nested',
                    selectedFilename
                )
            };
        });

        onUpdate({
            ...team,
            crestImage: resolveTeamCrestUrl(team) || team.crestImage,
            players: updatedPlayers
        });
    };

    const togglePlayerBenched = (playerId: number) => {
        const p = team.players.find(pl => pl.id === playerId);
        if (!p) return;
        const starters = team.players.filter(pl => !(pl.isBenched ?? true));
        if ((p.isBenched ?? true) && starters.length >= 11) return;

        onUpdate({
            ...team,
            players: team.players.map(pl => pl.id === playerId ? normalizeManagedPlayer({ ...pl, isBenched: !(pl.isBenched ?? true) }) : pl)
        });
    };

    const confirmFirePlayer = () => {
        if (!fireConfirmation) return;
        onUpdate({
            ...team,
            treasury: team.isAutoCalculating ? team.treasury : team.treasury + (fireConfirmation.cost / 2),
            players: team.players.filter(p => p.id !== fireConfirmation.id),
        });
        setFireConfirmation(null);
    };

    const handleSavePlayer = (updatedPlayer: ManagedPlayer) => {
        onUpdate({ ...team, players: team.players.map(p => p.id === updatedPlayer.id ? normalizeManagedPlayer(updatedPlayer) : p) });
        setEditingPlayer(null);
        setOpenPlayerMenuId(null);
        setAdvancingPlayer(null);
    };

    const handleRestoreSnapshot = () => {
        if (!snapshotToRestore) return;
        const restored = { ...snapshotToRestore.teamState, id: team.id, ownerId: team.ownerId, snapshots: team.snapshots } as ManagedTeam;
        onUpdate(restored);
        setSnapshotToRestore(null);
    };

    const specialRulesList = useMemo(() => (baseRoster?.specialRules_es || baseRoster?.specialRules || '').split(',').map((s: string) => s.trim()).filter(Boolean), [baseRoster]);

    const eligibleStars = useMemo(() => {
        if (!starPlayers) return [];
        return starPlayers.filter(star => {
            if (star.playsFor.includes("Any Team")) return true;
            if (star.playsFor.includes(team.rosterName)) return true;
            return specialRulesList.some((rule: string) => {
                const eng = LEAGUE_MAP[rule];
                return eng && (eng === "Favoured of" ? star.playsFor.some(p => p.startsWith("Favoured of")) : star.playsFor.includes(eng));
            });
        }).sort((a, b) => a.cost - b.cost);
    }, [starPlayers, specialRulesList, team.rosterName]);

    return (
        <div className="blood-ui-shell min-h-screen text-slate-100 font-display">
            <div className="guild-dossier-light">
            {/* Top Navigation & Header */}
            <header className={`blood-ui-header border-b border-white/10 backdrop-blur-md sticky ${stickyOffset} z-50`}>
                <div className="max-w-[1480px] mx-auto px-6 py-4 flex flex-col xl:flex-row xl:items-stretch justify-between gap-5">
                    <div className="flex flex-1 xl:max-w-[46%] items-start gap-5 md:gap-6 min-w-0">
                        <div
                            className="w-28 h-28 md:w-32 md:h-32 blood-ui-card-soft rounded-3xl flex items-center justify-center text-background-dark shadow-glow cursor-pointer hover:scale-105 transition-transform overflow-hidden shrink-0 border border-[rgba(202,138,4,0.2)]"
                            onClick={() => crestInputRef.current?.click()}
                        >
                                <img
                                    src={resolveTeamCrestUrl(team)}
                                    onError={(e) => {
                                        const img = e.target as HTMLImageElement;
                                        const rosterUrl = getTeamLogoUrl(team.rosterName);
                                        if (img.src !== rosterUrl) {
                                            img.src = rosterUrl;
                                        } else {
                                            const originalData = teamsData.find(t => t.name === team.rosterName);
                                            if (originalData && img.src !== originalData.image) {
                                            img.src = originalData.image;
                                        }
                                    }
                                }}
                                alt={team.name}
                                className="w-full h-full object-contain p-0 scale-[1.18]"
                            />
                        </div>
                        <div className="space-y-3 max-w-[860px] flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="px-3 py-1.5 rounded-full border border-[rgba(202,138,4,0.22)] bg-[rgba(255,251,241,0.72)] text-[9px] font-black uppercase tracking-[0.28em] text-[#7b6853] italic">
                                    Dossier de franquicia
                                </span>
                                <span className="px-3 py-1.5 rounded-full border border-[rgba(111,87,56,0.12)] bg-[rgba(255,251,241,0.72)] text-[9px] font-black uppercase tracking-[0.28em] text-[#7b6853] italic">
                                    Franquicia activa
                                </span>
                            </div>
                            <h1 className="font-epilogue text-3xl md:text-5xl italic font-black tracking-tighter text-primary uppercase leading-tight text-shadow-premium">
                                {team.name}
                            </h1>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{team.rosterName}</p>
                            <div className="flex flex-wrap gap-2 md:gap-3 max-w-[820px] xl:hidden">
                                <span className="px-3 py-1.5 rounded-full bg-[rgba(255,251,241,0.84)] border border-[rgba(111,87,56,0.12)] text-[#2b1d12] text-[9px] font-black uppercase tracking-[0.28em]">
                                    VAE {teamValue.toLocaleString('es-ES')}
                                </span>
                                <span className="px-3 py-1.5 rounded-full bg-[rgba(255,251,241,0.84)] border border-[rgba(111,87,56,0.12)] text-[#2b1d12] text-[9px] font-black uppercase tracking-[0.28em]">
                                    Roster {team.players.length}/16
                                </span>
                                <span className="px-3 py-1.5 rounded-full bg-[rgba(255,251,241,0.84)] border border-[rgba(111,87,56,0.12)] text-[#2b1d12] text-[9px] font-black uppercase tracking-[0.28em]">
                                    Récord {recordSummary}
                                </span>
                                <span className="px-3 py-1.5 rounded-full bg-[rgba(202,138,4,0.14)] border border-[rgba(202,138,4,0.18)] text-[#ca8a04] text-[9px] font-black uppercase tracking-[0.28em]">
                                    Tier {team.tier}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="w-full xl:max-w-[52%] flex flex-col justify-between gap-5 xl:self-stretch">
                        <div className="hidden xl:grid grid-cols-4 gap-3">
                            {[
                                { label: 'VAE', value: teamValue.toLocaleString('es-ES'), tone: 'text-[#2b1d12]' },
                                { label: 'Plantilla', value: `${team.players.length}/16`, tone: 'text-[#2b1d12]' },
                                { label: 'Record', value: recordSummary, tone: 'text-[#2b1d12]' },
                                { label: 'Tier', value: team.tier, tone: 'text-[#ca8a04]' }
                            ].map((item) => (
                                <div
                                    key={item.label}
                                    className="rounded-[1.6rem] border border-[rgba(111,87,56,0.10)] bg-[rgba(255,251,241,0.72)] px-4 py-4 shadow-[0_14px_30px_rgba(89,59,21,0.05)]"
                                >
                                    <p className="text-[9px] font-black uppercase tracking-[0.26em] text-[#8d7863] italic mb-2">
                                        {item.label}
                                    </p>
                                    <p className={`font-epilogue text-xl font-black italic tracking-tight ${item.tone}`}>
                                        {item.value}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center gap-2 flex-wrap justify-end">
                            <button onClick={handleAutoSyncImages} className="blood-ui-button-secondary border border-gold/20 text-gold px-3 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all uppercase flex items-center gap-2 shadow-lg shadow-gold/5 whitespace-nowrap shrink-0" title="Sincronizar fotos desde GitHub">
                                <span className="material-symbols-outlined text-base">image</span>
                                Sincronizar fotos
                            </button>
                            <button onClick={onBack} className="blood-ui-button-secondary border border-white/10 text-slate-400 px-3 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all uppercase flex items-center gap-2 whitespace-nowrap shrink-0">
                                <span className="material-symbols-outlined text-base">arrow_back</span>
                                Volver
                            </button>
                            {!isGuest && (
                                <button onClick={() => onSync ? onSync() : setShowQr(true)} className="blood-ui-button-primary border border-primary/20 text-primary px-3 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all uppercase flex items-center gap-2 whitespace-nowrap shrink-0">
                                    <span className="material-symbols-outlined text-base">{onSync ? 'sync' : 'qr_code'}</span>
                                    {syncLabel}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-[1480px] mx-auto px-6 pt-5">
                <div className="blood-ui-card-strong border border-white/10 rounded-[1.8rem] px-4 py-3 flex items-center justify-center xl:justify-end">
                    <nav className="flex flex-wrap items-center gap-2 md:gap-3">
                        {[
                            { id: 'roster', label: 'Plantilla', icon: 'groups' },
                            { id: 'recruit', label: 'Reclutar', icon: 'person_add' },
                            { id: 'staff', label: 'Staff', icon: 'support_agent' },
                            { id: 'history', label: 'Historia', icon: 'history_edu' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`text-xs font-black uppercase tracking-widest transition-all px-4 py-2 rounded-xl border ${activeTab === tab.id ? 'text-primary border-primary bg-[rgba(202,138,4,0.08)]' : 'text-slate-500 border-transparent hover:text-slate-300 hover:bg-white/5'}`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            <main className="max-w-[1400px] mx-auto px-6 py-8">
                {/* KPIs Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="blood-ui-card-strong rounded-2xl p-6 backdrop-blur-custom flex flex-col items-center justify-center text-center group hover:border-primary/30 transition-all">
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">VAE (Valor de Equipo)</p>
                        <p className="text-primary text-4xl font-black italic font-epilogue tracking-tight group-hover:scale-105 transition-transform">
                            {teamValue.toLocaleString()}
                        </p>
                    </div>
                    <div className="blood-ui-card-strong rounded-2xl p-6 backdrop-blur-custom flex flex-col items-center justify-center text-center group hover:border-primary/30 transition-all">
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Tesorería</p>
                        <div className="flex items-baseline gap-2 group-hover:scale-105 transition-transform">
                            <p className={`text-4xl font-black italic font-epilogue tracking-tight ${team.treasury > 100000 ? 'text-blood animate-pulse' : 'text-primary'}`}>
                                {team.treasury.toLocaleString()}
                            </p>
                            <span className="text-slate-600 text-[10px] font-black">MO</span>
                        </div>
                    </div>
                    <div className="blood-ui-card-strong rounded-2xl p-6 backdrop-blur-custom flex flex-col items-center justify-center text-center group hover:border-primary/30 transition-all">
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Segundas Oportunidades</p>
                        <div className="flex items-center gap-3 group-hover:scale-105 transition-transform">
                            <span className="material-symbols-outlined text-primary text-3xl">refresh</span>
                            <p className="text-primary text-4xl font-black italic font-epilogue tracking-tight">{team.rerolls}</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Main Content Area */}
                    <div className="flex-1 space-y-6">
                        {activeTab === 'roster' && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex items-center justify-between px-4 mb-2">
                                    <h2 className="text-lg font-black uppercase tracking-tighter italic flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">groups</span>
                                        Plantilla Activa
                                    </h2>
                                    <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
                                        {team.players.length} / 16 Jugadores
                                    </span>
                                </div>

                                {/* Player Cards */}
                                {team.players.map((p, index) => {
                                    const playerImage = getPlayerVisibleImage(p);
                                    const displayedSkills = getPlayerDisplayedSkills(p);
                                    const nextAdvanceCost = SPP_LEVELS[p.advancements?.length || 0] || 999;
                                    const hasLevelUp = p.spp >= nextAdvanceCost;
                                    const isMNG = p.lastingInjuries?.includes('MNG');
                                    const isBenched = p.isBenched ?? true;
                                    const playerNumber = Number(p.jerseyNumber) || (index + 1);
                                    const statusLabel = p.statusDetail
                                        || (hasLevelUp ? 'Pendiente de subida' : '')
                                        || (isMNG ? `Lesionado${(p.missNextGame || 0) > 0 ? ` · MNG x${p.missNextGame}` : ''}` : '')
                                        || (p.lastingInjuries?.length ? 'Con lesiones permanentes' : '')
                                        || (isBenched ? 'Reserva' : 'Activo');

                                    return (
                                        <div
                                            key={p.id}
                                            className={`blood-ui-card-strong border rounded-2xl p-5 backdrop-blur-custom player-row-glow transition-all relative group/card ${hasLevelUp ? 'border-primary/40 bg-primary/8' : 'border-white/10'} ${isBenched ? 'opacity-80' : ''} ${openPlayerMenuId === p.id ? 'z-30' : 'z-0'}`}
                                        >
                                            {hasLevelUp && (
                                                <div className="absolute top-0 left-0 w-1 h-full bg-primary shadow-[0_0_15px_rgba(202,138,4,0.6)]"></div>
                                            )}

                                            <div className="flex flex-col md:flex-row items-center gap-6">
                                                <div className="flex-shrink-0 flex items-center gap-4">
                                                    <div className="w-12 text-center">
                                                        {editingJerseyId === p.id ? (
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                value={editingJerseyValue}
                                                                onChange={(e) => setEditingJerseyValue(e.target.value)}
                                                                onBlur={handleJerseyUpdate}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') {
                                                                        e.preventDefault();
                                                                        handleJerseyUpdate();
                                                                    }
                                                                    if (e.key === 'Escape') {
                                                                        setEditingJerseyId(null);
                                                                        setEditingJerseyValue('');
                                                                    }
                                                                }}
                                                                autoFocus
                                                                className="blood-ui-input w-12 text-center bg-black/30 border border-primary text-white rounded px-2 py-1 text-sm font-black italic"
                                                            />
                                                        ) : (
                                                            <span
                                                                className={`cursor-text font-epilogue italic text-2xl font-black ${hasLevelUp ? 'text-primary' : 'text-slate-700 group-hover/card:text-primary transition-colors'}`}
                                                                onDoubleClick={() => handleJerseyDoubleClick(p, playerNumber)}
                                                                title="Doble clic para editar dorsal"
                                                            >
                                                                #{playerNumber}
                                                            </span>
                                                        )}
                                                    </div>
                                                        {playerImage && (
                                                            <div 
                                                                onClick={() => setZoomedImage(playerImage)}
                                                                className="w-24 aspect-[4/3] rounded-lg overflow-hidden border-2 border-slate-800 bg-[#efe0bf] cursor-zoom-in hover:scale-105 hover:border-gold/50 transition-all group/img relative"
                                                            >
                                                                {/* Blurred layer */}
                                                                <img src={playerImage} onError={() => hideBrokenPlayerImage(p.id)} className="absolute inset-0 w-full h-full object-cover blur-lg opacity-30 scale-125" alt="" />
                                                                {/* Main Image layer */}
                                                                <img 
                                                                    src={playerImage} 
                                                                    alt={p.customName} 
                                                                    onError={() => hideBrokenPlayerImage(p.id)}
                                                                    className="relative w-full h-full object-contain z-10 transition-all opacity-90 group-hover/img:opacity-100"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>

                                                <div className="flex-1 grid grid-cols-1 md:grid-cols-6 gap-6 items-center w-full">
                                                    <div className="md:col-span-1">
                                                        {editingPlayerId === p.id ? (
                                                            <input
                                                                type="text"
                                                                value={editingName}
                                                                onChange={(e) => setEditingName(e.target.value)}
                                                                onBlur={handleNameUpdate}
                                                                className="blood-ui-input bg-black/40 border border-primary text-white rounded px-2 py-1 w-full text-sm font-black uppercase italic"
                                                                autoFocus
                                                            />
                                                        ) : (
                                                            <>
                                                                <h3 className="font-black font-epilogue italic text-lg uppercase tracking-tighter leading-none mb-1 group-hover/card:text-primary transition-colors cursor-pointer" onDoubleClick={() => handleNameDoubleClick(p)}>
                                                                    {p.customName}
                                                                </h3>
                                                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest leading-none">{p.position}</p>
                                                                <div
                                                                    onClick={() => togglePlayerBenched(p.id)}
                                                                    className={`mt-2 inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all cursor-pointer select-none ${isBenched ? 'bg-slate-800/80 border-white/5 text-slate-400 hover:border-gold/30 hover:text-gold' : 'bg-green-500/10 border-green-500/25 text-green-500 hover:border-gold/30 hover:text-gold'}`}
                                                                    title={isBenched ? 'Pasar a titular' : 'Enviar a reserva'}
                                                                >
                                                                    <span className="material-symbols-outlined text-[11px]">{isBenched ? 'event_seat' : 'sports'}</span>
                                                                    {isBenched ? 'Reserva' : 'Titular'}
                                                                </div>
                                                                <div className="flex flex-wrap gap-1.5 mt-2">
                                                                    {hasLevelUp && (
                                                                        <span className="px-2 py-1 rounded-full bg-primary/15 border border-primary/25 text-primary text-[9px] font-black uppercase tracking-widest">
                                                                            Subida pendiente
                                                                        </span>
                                                                    )}
                                                                    {isMNG && (
                                                                        <span className="px-2 py-1 rounded-full bg-blood/10 border border-blood/25 text-blood text-[9px] font-black uppercase tracking-widest">
                                                                            Lesionado
                                                                        </span>
                                                                    )}
                                                                    {(p.missNextGame || 0) > 0 && (
                                                                        <span className="px-2 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-[9px] font-black uppercase tracking-widest">
                                                                            MNG x{p.missNextGame}
                                                                        </span>
                                                                    )}
                                                                    {(p.lastingInjuries?.length || 0) > 0 && (
                                                                        <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 text-[9px] font-black uppercase tracking-widest">
                                                                            {p.lastingInjuries.length} lesión{p.lastingInjuries.length > 1 ? 'es' : ''}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>

                                                    <div className="md:col-span-1 flex flex-col gap-1.5">
                                                        <div className="grid grid-cols-5 gap-1 text-[9px] text-slate-500 font-black text-center uppercase tracking-tighter">
                                                            <span>MA</span><span>ST</span><span>AG</span><span>PA</span><span>AV</span>
                                                        </div>
                                                        <div className="grid grid-cols-5 gap-1 text-sm font-black text-center font-epilogue italic">
                                                            <span className="text-white">{p.stats.MV}</span>
                                                            <span className="text-white">{p.stats.FU}</span>
                                                            <span className="text-white">{p.stats.AG}</span>
                                                            <span className="text-white">{p.stats.PA}</span>
                                                            <span className="text-white">{p.stats.AR}</span>
                                                        </div>
                                                    </div>

                                                    <div className="md:col-span-2 flex flex-wrap gap-1.5">
                                                        {displayedSkills.map(skill => {
                                                            return (
                                                                <button
                                                                    key={skill.key}
                                                                    onClick={() => handleSkillClick(skill.key)}
                                                                    className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter transition-all ${skill.isElite ? 'bg-primary/20 border border-primary/30 text-primary' : 'bg-slate-800 text-slate-400 border border-white/5 hover:border-slate-500'}`}
                                                                >
                                                                    {skill.label}{skill.isElite && ' (E)'}
                                                                </button>
                                                            );
                                                        })}
                                                        {displayedSkills.length === 0 && (
                                                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                                                Sin habilidades visibles
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="md:col-span-1 flex flex-col gap-1.5">
                                                        <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest leading-none">
                                                            <span className={hasLevelUp ? 'text-primary' : 'text-slate-500'}>SPP: {p.spp}</span>
                                                            {hasLevelUp && (
                                                                <button onClick={() => setAdvancingPlayer(p)} className="material-symbols-outlined text-primary text-sm fill-1 hover:scale-125 transition-transform animate-pulse" title="Aplicar subida">star</button>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 bg-black/40 h-1 rounded-full overflow-hidden border border-white/5">
                                                            <div
                                                                className={`h-full transition-all duration-1000 ${hasLevelUp ? 'bg-primary shadow-[0_0_8px_rgba(202,138,4,0.5)]' : 'bg-slate-700'}`}
                                                                style={{ width: `${Math.min(100, (p.spp / nextAdvanceCost) * 100)}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>

                                                    <div className="md:col-span-1 flex items-center justify-end gap-4 text-right">
                                                        <div>
                                                            <p className="text-2xl font-epilogue italic font-black text-white leading-none">{p.cost / 1000}k</p>
                                                            <span className={`text-[9px] font-black uppercase tracking-widest flex items-center justify-end gap-1 mt-1 leading-none ${hasLevelUp ? 'text-primary' : isMNG ? 'text-blood' : 'text-green-500'}`}>
                                                                <span className="material-symbols-outlined text-[12px]">{hasLevelUp ? 'star' : isMNG ? 'cancel' : 'check_circle'}</span>
                                                                {statusLabel}
                                                            </span>
                                                        </div>
                                                        <div className="relative group/menu">
                                                            <button
                                                                type="button"
                                                                onClick={() => setOpenPlayerMenuId((current) => current === p.id ? null : p.id)}
                                                                className="text-slate-600 hover:text-white transition-colors p-1"
                                                            >
                                                                <span className="material-symbols-outlined">more_vert</span>
                                                            </button>
                                                            {openPlayerMenuId === p.id && (
                                                            <div className="absolute right-0 top-full mt-2 w-48 bg-[rgba(255,251,241,0.98)] border border-[rgba(111,87,56,0.14)] rounded-xl py-2 shadow-2xl z-50 backdrop-blur-xl">
                                                                <button onClick={() => { setEditingPlayer(normalizeManagedPlayer({ ...p, skillKeys: getPlayerCoreSkillKeys(p) })); setOpenPlayerMenuId(null); }} className="w-full px-4 py-2 text-left text-[10px] font-black text-[#6f5738] hover:text-[#2b1d12] hover:bg-[rgba(202,138,4,0.08)] uppercase tracking-widest flex items-center gap-2">
                                                                    <span className="material-symbols-outlined text-sm">edit</span>
                                                                    Perfil
                                                                </button>
                                                                <button onClick={() => { togglePlayerBenched(p.id); setOpenPlayerMenuId(null); }} className="w-full px-4 py-2 text-left text-[10px] font-black text-[#6f5738] hover:text-[#2b1d12] hover:bg-[rgba(202,138,4,0.08)] uppercase tracking-widest flex items-center gap-2">
                                                                    <span className="material-symbols-outlined text-sm">swap_horiz</span>
                                                                    {isBenched ? 'Pasar a titular' : 'Enviar a reserva'}
                                                                </button>
                                                                <div className="h-px bg-[rgba(111,87,56,0.1)] my-1"></div>
                                                                <button onClick={() => { setFireConfirmation(p); setOpenPlayerMenuId(null); }} className="w-full px-4 py-2 text-left text-[10px] font-black text-blood hover:bg-blood/10 uppercase tracking-widest flex items-center gap-2">
                                                                    <span className="material-symbols-outlined text-sm">person_remove</span>
                                                                    Despedir
                                                                </button>
                                                            </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {activeTab === 'recruit' && (
                            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="blood-ui-card-strong border border-white/10 rounded-[2rem] p-8">
                                    <h3 className="text-xl font-epilogue font-black text-primary uppercase tracking-widest mb-8 italic">Contratar Plantilla</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {(baseRoster?.roster || []).map(pos => {
                                            const count = team.players.filter(pl => pl.position === pos.position).length;
                                            const limit = parseInt(pos.qty.split('-').pop() || '16');
                                            const isFull = count >= limit;
                                            const canAfford = team.treasury >= pos.cost || team.isAutoCalculating;

                                            return (
                                                <div key={pos.position} className={`bg-black/40 border border-white/5 rounded-2xl p-6 relative group transition-all ${isFull ? 'opacity-30' : 'hover:border-primary/40'}`}>
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div>
                                                            <h4 className="text-lg font-epilogue font-black uppercase text-white italic tracking-tighter leading-none mb-1">{pos.position}</h4>
                                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">{count} / {limit}</p>
                                                        </div>
                                                        <span className="text-xl font-epilogue font-black text-primary">{(pos.cost / 1000)}k</span>
                                                    </div>
                                                    <div className="flex gap-2 mb-6">
                                                        {Object.entries(pos.stats).map(([k, v]) => (
                                                            <div key={k} className="flex-1 bg-white/5 rounded-lg py-2 text-center border border-white/5">
                                                                <p className="text-[7px] text-slate-600 font-black uppercase">{k}</p>
                                                                <p className="text-xs font-epilogue font-black text-white">{v}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <button
                                                        disabled={isFull || !canAfford}
                                                        onClick={() => handleHirePlayer(pos)}
                                                        className={`w-full py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all ${isFull || !canAfford ? 'bg-white/5 text-slate-600 cursor-not-allowed' : 'bg-primary text-black shadow-lg shadow-primary/20 hover:scale-[1.02]'}`}
                                                    >
                                                        Fichar Jugador
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {eligibleStars.length > 0 && (
                                    <div className="blood-ui-card-strong border border-white/10 rounded-[2rem] p-8">
                                        <div className="flex items-center justify-between mb-8">
                                            <h3 className="text-xl font-epilogue font-black text-primary uppercase tracking-widest italic">Mercenarios y Estrellas</h3>
                                            <span className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-[9px] font-black text-primary uppercase tracking-widest">Incentivos S3</span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                            {eligibleStars.map(star => (
                                                <div key={star.name} className="blood-ui-card-soft border rounded-2xl p-5 hover:border-primary/30 transition-all group">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <h4 className="text-sm font-epilogue font-black uppercase text-white italic tracking-tighter group-hover:text-primary transition-colors">{star.name}</h4>
                                                        <span className="text-xs font-epilogue font-black text-primary">{(star.cost / 1000)}k</span>
                                                    </div>
                                                    <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mb-4 line-clamp-2">{star.skills}</p>
                                                    <button
                                                        onClick={() => handleHirePlayer(star as any)}
                                                        className="w-full py-2 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-400 hover:bg-primary hover:text-black transition-all"
                                                    >
                                                        Contratar para Partido
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'staff' && (
                            <div className="blood-ui-card-strong border border-white/10 rounded-[2rem] p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h3 className="text-xl font-epilogue font-black text-primary uppercase tracking-widest mb-8 italic">Staff Técnico</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <AssetCard title="Segundas Oportunidades" value={team.rerolls} limit={8} price={baseRoster?.rerollCost || 60000} onBuy={() => handleBuyAsset('rerolls', baseRoster?.rerollCost || 60000, 8)} onSell={() => handleSellAsset('rerolls', (baseRoster?.rerollCost || 60000) / 2)} icon="refresh" canSell={team.rerolls > 0} />
                                    <AssetCard title="Hinchas Dedicados" value={team.dedicatedFans} limit={6} price={10000} onBuy={() => handleBuyAsset('dedicatedFans', 10000, 6)} onSell={() => handleSellAsset('dedicatedFans', 5000, 1)} icon="campaign" canSell={team.dedicatedFans > 1} />
                                    <AssetCard title="Animadoras" value={team.cheerleaders} limit={12} price={10000} onBuy={() => handleBuyAsset('cheerleaders', 10000, 12)} onSell={() => handleSellAsset('cheerleaders', 5000)} icon="celebration" canSell={team.cheerleaders > 0} />
                                    <AssetCard title="Ayudantes de Entrenador" value={team.assistantCoaches} limit={6} price={10000} onBuy={() => handleBuyAsset('assistantCoaches', 10000, 6)} onSell={() => handleSellAsset('assistantCoaches', 5000)} icon="sports" canSell={team.assistantCoaches > 0} />

                                    <div className={`p-6 rounded-[2rem] border flex items-center justify-between transition-all ${team.apothecary ? 'bg-green-500/10 border-green-500/30' : 'blood-ui-card-soft'}`}>
                                        <div className="flex items-center gap-6">
                                            <div className={`size-16 rounded-2xl flex items-center justify-center shadow-2xl ${team.apothecary ? 'bg-green-500 text-black' : 'bg-slate-800 text-slate-500'}`}>
                                                <span className="material-symbols-outlined text-3xl">emergency</span>
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-epilogue font-black uppercase text-white italic leading-none mb-1">Boticario</h4>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">{team.apothecary ? 'En Nómina' : 'No Contratado'}</p>
                                            </div>
                                        </div>
                                        {baseRoster?.apothecary === 'Sí' && (
                                            <button
                                                onClick={() => onUpdate({ ...team, apothecary: !team.apothecary, treasury: team.apothecary ? team.treasury + 25000 : team.treasury - 50000 })}
                                                className={`px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all ${team.apothecary ? 'bg-white/5 text-blood border border-white/10' : 'bg-primary text-black shadow-lg shadow-primary/20'}`}
                                            >
                                                {team.apothecary ? 'Despedir' : 'Fichar (50k)'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'history' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="blood-ui-card-strong border border-white/10 rounded-[2rem] p-8">
                                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                                        <div>
                                            <h3 className="text-xl font-epilogue font-black text-primary uppercase tracking-widest italic">Análisis de Partidos</h3>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Balance real del clon en competición</p>
                                        </div>
                                        <span className="px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
                                            {historySummary.played} jugados
                                        </span>
                                    </div>

                                    {team.history && team.history.length > 0 ? (
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                            <div className="rounded-2xl bg-black/30 border border-white/5 p-5">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Victorias</p>
                                                <p className="text-3xl font-epilogue font-black text-green-400 italic mt-2">{historySummary.wins}</p>
                                            </div>
                                            <div className="rounded-2xl bg-black/30 border border-white/5 p-5">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Empates</p>
                                                <p className="text-3xl font-epilogue font-black text-amber-300 italic mt-2">{historySummary.draws}</p>
                                            </div>
                                            <div className="rounded-2xl bg-black/30 border border-white/5 p-5">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Derrotas</p>
                                                <p className="text-3xl font-epilogue font-black text-blood italic mt-2">{historySummary.losses}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-8 text-center">
                                            <p className="text-slate-400 font-black uppercase tracking-widest italic text-xs">Aún no hay partidos registrados para este clon</p>
                                        </div>
                                    )}
                                </div>

                                {team.history && team.history.length > 0 && (
                                    <div className="blood-ui-card-strong border border-white/10 rounded-[2rem] p-8">
                                        <h3 className="text-xl font-epilogue font-black text-primary uppercase tracking-widest mb-8 italic">Partidos Jugados</h3>
                                        <div className="space-y-4">
                                            {team.history.slice().reverse().map(match => {
                                                const resultTone = match.result === 'W'
                                                    ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                                    : match.result === 'D'
                                                        ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                                                        : 'bg-blood/10 text-blood border-blood/20';

                                                return (
                                                    <div key={match.id} className="rounded-2xl bg-black/30 border border-white/5 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                        <div className="min-w-0">
                                                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                                                <span className={`px-2.5 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${resultTone}`}>
                                                                    {match.result === 'W' ? 'Victoria' : match.result === 'D' ? 'Empate' : 'Derrota'}
                                                                </span>
                                                                <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{match.date}</span>
                                                            </div>
                                                            <p className="text-white font-black italic uppercase tracking-tight text-lg truncate">
                                                                vs {match.opponentName}
                                                            </p>
                                                            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">
                                                                Marcador final: {match.score}
                                                            </p>
                                                        </div>
                                                        <div className="shrink-0 text-right">
                                                            <p className="text-2xl font-epilogue font-black italic text-white leading-none">{match.score}</p>
                                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mt-1">{match.result}</p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                <div className="blood-ui-card-strong border border-white/10 rounded-[2rem] p-8">
                                    <h3 className="text-xl font-epilogue font-black text-primary uppercase tracking-widest mb-8 italic">Archivo Histórico</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {team.snapshots?.map(snapshot => (
                                            <div key={snapshot.id} className="bg-black/40 border border-white/5 rounded-2xl p-6 group hover:border-primary/40 transition-all">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <p className="text-sm font-epilogue font-black text-white italic">{new Date(snapshot.timestamp).toLocaleDateString()}</p>
                                                        <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">Snapshot Temporal</p>
                                                    </div>
                                                    <span className="material-symbols-outlined text-primary/30 group-hover:text-primary transition-colors">history</span>
                                                </div>
                                                <button
                                                    onClick={() => setSnapshotToRestore(snapshot)}
                                                    className="w-full mt-4 py-2 bg-white/5 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-400 hover:bg-primary hover:text-black transition-all"
                                                >
                                                    Restaurar Estado
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {!hideDelete && onDeleteRequest && (
                                    <div className="bg-blood/5 border border-blood/20 rounded-[2rem] p-8 flex items-center justify-between">
                                        <div>
                                            <h3 className="text-xl font-epilogue font-black text-blood uppercase italic leading-none mb-1">Zona Crítica</h3>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Acción irreversible de disolución de equipo</p>
                                        </div>
                                        <button onClick={() => onDeleteRequest(team.id!)} className="px-8 py-4 bg-blood !text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-glow shadow-blood/20">
                                            Disolver Equipo
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Sidebar Sidebar */}
                    <div className="w-full lg:w-[24rem] space-y-6">
                        <div className="bg-white/5 border border-white/10 rounded-[2.2rem] p-6 xl:p-8 overflow-hidden relative group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-all"></div>
                            <h3 className="text-sm font-epilogue font-black text-primary uppercase italic tracking-widest mb-6 relative z-10">Escudo Heráldico</h3>
                            <div
                                className="aspect-square bg-black/40 border-2 border-dashed border-white/10 rounded-[2rem] flex items-center justify-center cursor-pointer hover:border-primary/40 transition-all overflow-hidden relative z-10 p-2"
                                onClick={() => crestInputRef.current?.click()}
                            >
                                {resolveTeamCrestUrl(team) ? (
                                    <div className="w-full h-full rounded-[1.75rem] overflow-hidden bg-black/40 border border-white/5 flex items-center justify-center relative group">
                                        <img
                                            src={resolveTeamCrestUrl(team)}
                                            onError={(e) => {
                                                const img = e.target as HTMLImageElement;
                                                const rosterUrl = getTeamLogoUrl(team.rosterName);
                                                if (img.src !== rosterUrl) {
                                                    img.src = rosterUrl;
                                                } else {
                                                    const originalData = teamsData.find(t => t.name === team.rosterName);
                                                    if (originalData && img.src !== originalData.image) {
                                                        img.src = originalData.image;
                                                    }
                                                }
                                            }}
                                            alt={team.name}
                                            className="w-full h-full object-contain scale-[1.16] drop-shadow-[0_0_10px_rgba(255,255,255,0.1)] group-hover:scale-[1.22] transition-transform duration-500"
                                        />
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <span className="material-symbols-outlined text-4xl text-slate-700 mb-2">upload</span>
                                        <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">SVG / PNG</p>
                                    </div>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => crestInputRef.current?.click()}
                                className="mt-4 w-full blood-ui-button-secondary border border-gold/20 text-gold px-4 py-3 rounded-2xl text-[10px] font-black tracking-widest transition-all uppercase flex items-center justify-center gap-2 shadow-lg shadow-gold/5"
                            >
                                <span className="material-symbols-outlined text-base">edit</span>
                                Cambiar escudo
                            </button>
                            <p className="mt-3 text-[9px] font-black uppercase tracking-[0.22em] text-slate-500">
                                {hasRegisteredCrest ? 'Escudo registrado' : 'Escudo pendiente'}
                            </p>
                        </div>

                        <div className="blood-ui-card-strong border border-white/10 rounded-[2rem] p-8">
                            <h3 className="text-sm font-epilogue font-black text-primary uppercase italic tracking-widest mb-6">Resumen de Staff</h3>
                            <div className="space-y-4">
                                {[
                                    { label: 'Rerolls', val: team.rerolls, icon: 'refresh' },
                                    { label: 'Fans', val: team.dedicatedFans, icon: 'campaign' },
                                    { label: 'Boticario', val: team.apothecary ? 'Sí' : 'NO', icon: 'emergency' }
                                ].map(item => (
                                    <div key={item.label} className="flex items-center justify-between p-3 bg-black/40 rounded-xl border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <span className="material-symbols-outlined text-slate-500 text-sm">{item.icon}</span>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                                        </div>
                                        <p className="text-sm font-epilogue font-black text-white">{item.val}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            </div>

            {/* Modals */}
            <AnimatePresence>
                {editingPlayer && <PlayerModal player={editingPlayer} allSkills={skillCatalog} onSave={handleSavePlayer} onClose={() => setEditingPlayer(null)} />}
                {advancingPlayer && <PlayerAdvancementModal player={advancingPlayer} isOpen={!!advancingPlayer} onAdvance={handleSavePlayer} onClose={() => setAdvancingPlayer(null)} />}
                {selectedSkillForModal && <SkillModal skill={selectedSkillForModal} onClose={() => setSelectedSkillForModal(null)} />}

                {snapshotToRestore && (
                    <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
                        <div className="bg-white/5 border border-primary/20 p-8 rounded-[2.5rem] max-w-sm text-center shadow-4xl backdrop-blur-xl">
                            <span className="material-symbols-outlined text-5xl text-primary animate-pulse mb-6">history</span>
                            <h3 className="text-2xl font-epilogue font-black text-white uppercase italic tracking-tighter">Alteración Temporal</h3>
                            <p className="text-xs text-slate-400 mt-4 leading-relaxed font-bold">Se perderá el progreso actual. ¿Permitir que Nuffle reescriba la historia?</p>
                            <div className="mt-10 flex flex-col gap-3">
                                <button onClick={handleRestoreSnapshot} className="w-full bg-primary text-black font-black uppercase py-4 rounded-2xl tracking-widest shadow-xl hover:scale-[1.02] transition-all">Confirmar Restauración</button>
                                <button onClick={() => setSnapshotToRestore(null)} className="w-full text-slate-500 font-black uppercase text-[10px] py-2">Mantener Presente</button>
                            </div>
                        </div>
                    </div>
                )}

                {fireConfirmation && (
                    <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
                        <div className="bg-white/5 border border-blood/20 p-8 rounded-[2.5rem] max-w-sm text-center shadow-4xl backdrop-blur-xl">
                            <span className="material-symbols-outlined text-5xl text-blood mb-6">person_off</span>
                            <h3 className="text-2xl font-epilogue font-black text-white uppercase italic tracking-tighter">Cese de Contrato</h3>
                            <p className="text-xs text-slate-400 mt-4 leading-relaxed font-bold">¿Seguro que quieres rescindir el contrato de <span className="text-white">{fireConfirmation.customName}</span>?</p>
                            <div className="mt-10 flex flex-col gap-3">
                                <button onClick={confirmFirePlayer} className="w-full bg-blood text-white font-black uppercase py-4 rounded-2xl tracking-widest shadow-xl hover:scale-[1.02] transition-all">Cortar Contrato</button>
                                <button onClick={() => setFireConfirmation(null)} className="w-full text-slate-500 font-black uppercase text-[10px] py-2">Mantener en Plantilla</button>
                            </div>
                        </div>
                    </div>
                )}

                {showQr && (
                    <div className="fixed inset-0 bg-black/98 backdrop-blur-3xl flex items-center justify-center z-[250] p-4" onClick={() => setShowQr(false)}>
                        <div className="bg-white/5 border border-white/10 p-12 rounded-[3.5rem] shadow-glow relative" onClick={e => e.stopPropagation()}>
                            <button onClick={() => setShowQr(false)} className="absolute top-8 right-8 text-slate-600 hover:text-white transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                            <h3 className="text-3xl font-epilogue font-black text-primary mb-8 text-center uppercase italic tracking-tighter">Sincronización Nuffle</h3>
                            <div className="bg-white p-6 rounded-[2.5rem] shadow-2xl mx-auto"><canvas ref={qrCanvasRef}></canvas></div>
                            <p className="text-[10px] text-slate-500 mt-8 text-center font-black uppercase tracking-[0.2em] max-w-[240px] mx-auto">Escanea desde otro dispositivo para transferir la franquicia</p>
                        </div>
                    </div>
                )}

                {zoomedImage && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setZoomedImage(null)}
                        className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-xl flex items-center justify-center p-8 cursor-zoom-out"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative flex items-center justify-center blood-bowl-photo-frame p-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Blur Background Box (4:3) */}
                            <div className="relative w-[75vw] max-w-[800px] aspect-[4/3] rounded-sm overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.9)] border-4 border-[#1a1a1a] bg-black">
                                {/* Blurred layer */}
                                <img src={zoomedImage} className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 scale-110" alt="" />
                                {/* Main Image layer (Full view) */}
                                <img src={zoomedImage} className="relative w-full h-full object-contain z-10" alt="Zoomed view" />
                            </div>
                            
                            {/* Decorative Rivets */}
                            <div className="absolute top-2 left-2 w-3 h-3 rounded-full bg-slate-800 border border-slate-600 shadow-inner z-20"></div>
                            <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-slate-800 border border-slate-600 shadow-inner z-20"></div>
                            <div className="absolute bottom-2 left-2 w-3 h-3 rounded-full bg-slate-800 border border-slate-600 shadow-inner z-20"></div>
                            <div className="absolute bottom-2 right-2 w-3 h-3 rounded-full bg-slate-800 border border-slate-600 shadow-inner z-20"></div>

                            <button 
                                onClick={() => setZoomedImage(null)}
                                className="absolute -top-8 -right-8 bg-gold text-black w-12 h-12 rounded-full flex items-center justify-center font-black shadow-2xl hover:scale-110 transition-transform z-[30] hover:bg-white"
                            >
                                <span className="material-symbols-outlined text-xl">close</span>
                                <div className="absolute inset-0 bg-black/10 rounded-full animate-ping"></div>
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .player-row-glow:hover { box-shadow: 0 0 20px rgba(202, 138, 4, 0.1); }
                .blood-bowl-photo-frame {
                    background: #2a2a2a;
                    background-image: linear-gradient(135deg, #1f1f1f 25%, transparent 25%), 
                                    linear-gradient(225deg, #1f1f1f 25%, transparent 25%), 
                                    linear-gradient(45deg, #1f1f1f 25%, transparent 25%), 
                                    linear-gradient(315deg, #1f1f1f 25%, #2a2a2a 25%);
                    background-position: 10px 0, 10px 0, 0 0, 0 0;
                    background-size: 20px 20px;
                    background-repeat: repeat;
                    border: 12px solid #1a1a1a;
                    box-shadow: 0 0 40px rgba(0,0,0,0.8), inset 0 0 20px rgba(0,0,0,0.5);
                    border-radius: 8px;
                }
            `}</style>
            <input type="file" ref={crestInputRef} onChange={handleCrestUpload} accept="image/*" className="hidden" />
        </div>
    );
};


