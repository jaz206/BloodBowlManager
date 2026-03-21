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
import { getPlayerImageUrl, getRandomImageNumber, getTeamLogoUrl, fetchTeamImageStock, type PositionStock, getPosTag } from '../../utils/imageUtils';

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
    const [showQr, setShowQr] = useState(false);
    const [selectedSkillForModal, setSelectedSkillForModal] = useState<Skill | null>(null);
    const [editingPlayerId, setEditingPlayerId] = useState<number | null>(null);
    const [editingName, setEditingName] = useState('');
    const [fireConfirmation, setFireConfirmation] = useState<ManagedPlayer | null>(null);
    const [advancingPlayer, setAdvancingPlayer] = useState<ManagedPlayer | null>(null);
    const { starPlayers } = useMasterData();
    const [snapshotToRestore, setSnapshotToRestore] = useState<ManagedTeamSnapshot | null>(null);

    const qrCanvasRef = useRef<HTMLCanvasElement>(null);
    const crestInputRef = useRef<HTMLInputElement>(null);
    const [activeTab, setActiveTab] = useState<'roster' | 'recruit' | 'staff' | 'history'>('roster');
    const [zoomedImage, setZoomedImage] = useState<string | null>(null);
    const [imageStock, setImageStock] = useState<PositionStock | null>(null);

    useEffect(() => {
        const loadStock = async () => {
            const stock = await fetchTeamImageStock(team.rosterName);
            setImageStock(stock);
        };
        loadStock();
    }, [team.rosterName]);
    const baseRoster = useMemo(() => teamsData.find(t => t.name === team.rosterName), [team.rosterName]);

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

    const handleSkillClick = (skillName: string) => {
        const cleanedName = (skillName || '').split('(')[0].trim();
        const foundSkill = skillsData.find(s => s.name.toLowerCase().startsWith(cleanedName.toLowerCase()));
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
            players: team.players.map(p => p.id === editingPlayerId ? { ...p, customName: newName } : p),
        });
        setEditingPlayerId(null);
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

    const getExpectedPlayerFilename = (position: string, number: number): string => {
        const posTag = getPosTag(position);
        if (posTag === "Thrall linea") {
            return `${posTag} ${number}.png`;
        }
        const paddedNumber = number < 10 ? `0${number}` : `${number}`;
        const capitalizedPos = posTag.charAt(0).toUpperCase() + posTag.slice(1);
        return `${capitalizedPos} ${paddedNumber}.png`;
    };

    const getExistingFilename = (url?: string): string => {
        if (!url) return "";
        const filename = url.split("/").pop() || "";
        return decodeURIComponent(filename).split("?")[0];
    };

    const handleHirePlayer = (player: Player) => {
        const limit = parseInt((player?.qty || '0-16').split('-')[1]);
        if (team.players.filter(p => p.position === player.position).length >= limit) return;
        if (team.players.length >= 16) return;
        if (team.treasury < player.cost && !team.isAutoCalculating) return;

        // Use stock if available, else fallback to 15
        const posTag = getPosTag(player.position).toLowerCase();
        const availableNumbers = imageStock?.[posTag] || Array.from({length: 15}, (_, i) => i + 1);
        const imgNumber = availableNumbers[Math.floor(Math.random() * availableNumbers.length)];
        
        const playerImageUrl = getPlayerImageUrl(team.rosterName, player.position, imgNumber);

        const newPlayer: ManagedPlayer = {
            ...player,
            id: Date.now(),
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
            const availableNumbers = stock[posTag] || Array.from({length: 15}, (_, i) => i + 1);
            const expectedFilenames = availableNumbers.map(num => getExpectedPlayerFilename(p.position, num));
            const existingFilename = getExistingFilename(p.image);

            // Keep the image only if it already matches one of the valid filenames for that position.
            if (existingFilename && expectedFilenames.includes(existingFilename)) {
                return p;
            }

            const imgNum = availableNumbers[Math.floor(Math.random() * availableNumbers.length)];

            return {
                ...p,
                image: getPlayerImageUrl(team.rosterName, p.position, imgNum)
            };
        });

        onUpdate({
            ...team,
            crestImage: getTeamLogoUrl(team.rosterName) || team.crestImage,
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
            players: team.players.map(pl => pl.id === playerId ? { ...pl, isBenched: !pl.isBenched } : pl)
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
        onUpdate({ ...team, players: team.players.map(p => p.id === updatedPlayer.id ? updatedPlayer : p) });
        setEditingPlayer(null);
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
        <div className="min-h-screen bg-background-dark text-slate-100 font-display">
            {/* Top Navigation & Header */}
            <header className={`border-b border-white/10 bg-black/40 backdrop-blur-md sticky ${stickyOffset} z-50`}>
                <div className="max-w-[1400px] mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                        <div
                            className="size-12 bg-black/40 rounded-xl flex items-center justify-center text-background-dark shadow-glow cursor-pointer hover:scale-105 transition-transform overflow-hidden"
                            onClick={() => crestInputRef.current?.click()}
                        >
                            <img 
                                src={team.crestImage || getTeamLogoUrl(team.rosterName)} 
                                onError={(e) => {
                                    const img = e.target as HTMLImageElement;
                                    const githubUrl = getTeamLogoUrl(team.rosterName);
                                    if (img.src !== githubUrl) {
                                        img.src = githubUrl;
                                    } else {
                                        const originalData = teamsData.find(t => t.name === team.rosterName);
                                        if (originalData && img.src !== originalData.image) {
                                            img.src = originalData.image;
                                        }
                                    }
                                }}
                                alt={team.name} 
                                className="w-full h-full object-contain p-1" 
                            />
                        </div>
                        <div>
                            <h1 className="font-epilogue text-3xl md:text-4xl italic font-black tracking-tighter text-primary uppercase leading-tight">
                                {team.name}
                            </h1>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{team.rosterName}</p>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <nav className="flex items-center gap-6">
                            {[
                                { id: 'roster', label: 'Plantilla', icon: 'groups' },
                                { id: 'recruit', label: 'Reclutar', icon: 'person_add' },
                                { id: 'staff', label: 'Staff', icon: 'support_agent' },
                                { id: 'history', label: 'Historia', icon: 'history_edu' }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`text-xs font-black uppercase tracking-widest transition-all pb-1 border-b-2 ${activeTab === tab.id ? 'text-primary border-primary' : 'text-slate-500 border-transparent hover:text-slate-300'}`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </nav>

                        <div className="flex items-center gap-2">
                            <button onClick={handleAutoSyncImages} className="bg-gold/10 border border-gold/20 text-gold px-4 py-2 rounded-xl text-[10px] font-black tracking-widest hover:bg-gold/20 transition-all uppercase flex items-center gap-2 shadow-lg shadow-gold/5" title="Sincronizar fotos desde GitHub">
                                <span className="material-symbols-outlined text-base">image</span>
                                Fotos
                            </button>
                            <button onClick={onBack} className="bg-white/5 border border-white/10 text-slate-400 px-4 py-2 rounded-xl text-[10px] font-black tracking-widest hover:bg-white/10 transition-all uppercase flex items-center gap-2">
                                <span className="material-symbols-outlined text-base">arrow_back</span>
                                Volver
                            </button>
                            {!isGuest && (
                                <button onClick={() => onSync ? onSync() : setShowQr(true)} className="bg-primary/10 border border-primary/20 text-primary px-4 py-2 rounded-xl text-[10px] font-black tracking-widest hover:bg-primary/20 transition-all uppercase flex items-center gap-2">
                                    <span className="material-symbols-outlined text-base">{onSync ? 'sync' : 'qr_code'}</span>
                                    {syncLabel}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-[1400px] mx-auto px-6 py-8">
                {/* KPIs Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-custom flex flex-col items-center justify-center text-center group hover:border-primary/30 transition-all">
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">VAE (Valor de Equipo)</p>
                        <p className="text-primary text-4xl font-black italic font-epilogue tracking-tight group-hover:scale-105 transition-transform">
                            {teamValue.toLocaleString()}
                        </p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-custom flex flex-col items-center justify-center text-center group hover:border-primary/30 transition-all">
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Tesorería</p>
                        <div className="flex items-baseline gap-2 group-hover:scale-105 transition-transform">
                            <p className={`text-4xl font-black italic font-epilogue tracking-tight ${team.treasury > 100000 ? 'text-blood animate-pulse' : 'text-primary'}`}>
                                {team.treasury.toLocaleString()}
                            </p>
                            <span className="text-slate-600 text-[10px] font-black">MO</span>
                        </div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-custom flex flex-col items-center justify-center text-center group hover:border-primary/30 transition-all">
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
                                {team.players.map(p => {
                                    const allSkills = [
                                        ...((p?.skills || '').toLowerCase() !== 'ninguna' ? (p?.skills || '').split(', ').map((s: string) => s.trim()).filter(Boolean) : []),
                                        ...p.gainedSkills
                                    ];
                                    const nextAdvanceCost = SPP_LEVELS[p.advancements?.length || 0] || 999;
                                    const hasLevelUp = p.spp >= nextAdvanceCost;
                                    const isMNG = p.lastingInjuries?.includes('MNG');
                                    const isBenched = p.isBenched ?? true;
                                    const statusLabel = p.statusDetail
                                        || (hasLevelUp ? 'Pendiente de subida' : '')
                                        || (isMNG ? `Lesionado${(p.missNextGame || 0) > 0 ? ` · MNG x${p.missNextGame}` : ''}` : '')
                                        || (p.lastingInjuries?.length ? 'Con lesiones permanentes' : '')
                                        || (isBenched ? 'Reserva' : 'Activo');

                                    return (
                                        <div
                                            key={p.id}
                                            className={`bg-white/5 border rounded-2xl p-5 backdrop-blur-custom player-row-glow transition-all relative overflow-hidden group/card ${hasLevelUp ? 'border-primary/40 bg-primary/5' : 'border-white/10'} ${isBenched ? 'opacity-80' : ''}`}
                                        >
                                            {hasLevelUp && (
                                                <div className="absolute top-0 left-0 w-1 h-full bg-primary shadow-[0_0_15px_rgba(202,138,4,0.6)]"></div>
                                            )}

                                            <div className="flex flex-col md:flex-row items-center gap-6">
                                                <div className="flex-shrink-0 flex items-center gap-4">
                                                    <div className="w-12 text-center">
                                                        <span className={`font-epilogue italic text-2xl font-black ${hasLevelUp ? 'text-primary' : 'text-slate-700 group-hover/card:text-primary transition-colors'}`}>
                                                            #{p.id.toString().slice(-2)}
                                                        </span>
                                                    </div>
                                                        {p.image && (
                                                            <div 
                                                                onClick={() => setZoomedImage(p.image!)}
                                                                className="w-24 aspect-[4/3] rounded-lg overflow-hidden border-2 border-slate-800 bg-black cursor-zoom-in hover:scale-105 hover:border-gold/50 transition-all group/img relative"
                                                            >
                                                                {/* Blurred layer */}
                                                                <img src={p.image} className="absolute inset-0 w-full h-full object-cover blur-lg opacity-30 scale-125" alt="" />
                                                                {/* Main Image layer */}
                                                                <img 
                                                                    src={p.image} 
                                                                    alt={p.customName} 
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
                                                                className="bg-black/40 border border-primary text-white rounded px-2 py-1 w-full text-sm font-black uppercase italic"
                                                                autoFocus
                                                            />
                                                        ) : (
                                                            <>
                                                                <h3 className="font-black font-epilogue italic text-lg uppercase tracking-tighter leading-none mb-1 group-hover/card:text-primary transition-colors cursor-pointer" onDoubleClick={() => handleNameDoubleClick(p)}>
                                                                    {p.customName}
                                                                </h3>
                                                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest leading-none">{p.position}</p>
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
                                                                    {isBenched && !hasLevelUp && !isMNG && (p.missNextGame || 0) === 0 && (
                                                                        <span className="px-2 py-1 rounded-full bg-slate-800/80 border border-white/5 text-slate-400 text-[9px] font-black uppercase tracking-widest">
                                                                            Reserva
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
                                                        {allSkills.map(skill => {
                                                            const isElite = ELITE_SKILLS.includes(skill);
                                                            return (
                                                                <button
                                                                    key={skill}
                                                                    onClick={() => handleSkillClick(skill)}
                                                                    className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter transition-all ${isElite ? 'bg-primary/20 border border-primary/30 text-primary' : 'bg-slate-800 text-slate-400 border border-white/5 hover:border-slate-500'}`}
                                                                >
                                                                    {skill}{isElite && ' (E)'}
                                                                </button>
                                                            );
                                                        })}
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
                                                            <button className="text-slate-600 hover:text-white transition-colors p-1">
                                                                <span className="material-symbols-outlined">more_vert</span>
                                                            </button>
                                                            <div className="absolute right-0 top-full mt-2 w-48 bg-black/95 border border-white/10 rounded-xl py-2 shadow-2xl opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-20 backdrop-blur-xl">
                                                                <button onClick={() => setEditingPlayer(p)} className="w-full px-4 py-2 text-left text-[10px] font-black text-slate-400 hover:text-white hover:bg-white/5 uppercase tracking-widest flex items-center gap-2">
                                                                    <span className="material-symbols-outlined text-sm">edit</span>
                                                                    Perfil
                                                                </button>
                                                                <button onClick={() => togglePlayerBenched(p.id)} className="w-full px-4 py-2 text-left text-[10px] font-black text-slate-400 hover:text-white hover:bg-white/5 uppercase tracking-widest flex items-center gap-2">
                                                                    <span className="material-symbols-outlined text-sm">swap_horiz</span>
                                                                    {isBenched ? 'Alinear' : 'Banquillo'}
                                                                </button>
                                                                <div className="h-px bg-white/5 my-1"></div>
                                                                <button onClick={() => setFireConfirmation(p)} className="w-full px-4 py-2 text-left text-[10px] font-black text-blood hover:bg-blood/10 uppercase tracking-widest flex items-center gap-2">
                                                                    <span className="material-symbols-outlined text-sm">person_remove</span>
                                                                    Despedir
                                                                </button>
                                                            </div>
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
                                <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8">
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
                                    <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8">
                                        <div className="flex items-center justify-between mb-8">
                                            <h3 className="text-xl font-epilogue font-black text-primary uppercase tracking-widest italic">Mercenarios y Estrellas</h3>
                                            <span className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-[9px] font-black text-primary uppercase tracking-widest">Incentivos S3</span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                            {eligibleStars.map(star => (
                                                <div key={star.name} className="bg-black/60 border border-white/5 rounded-2xl p-5 hover:border-primary/30 transition-all group">
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
                            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h3 className="text-xl font-epilogue font-black text-primary uppercase tracking-widest mb-8 italic">Staff Técnico</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <AssetCard title="Segundas Oportunidades" value={team.rerolls} limit={8} price={baseRoster?.rerollCost || 60000} onBuy={() => handleBuyAsset('rerolls', baseRoster?.rerollCost || 60000, 8)} onSell={() => handleSellAsset('rerolls', (baseRoster?.rerollCost || 60000) / 2)} icon="refresh" canSell={team.rerolls > 0} />
                                    <AssetCard title="Hinchas Dedicados" value={team.dedicatedFans} limit={6} price={10000} onBuy={() => handleBuyAsset('dedicatedFans', 10000, 6)} onSell={() => handleSellAsset('dedicatedFans', 5000, 1)} icon="campaign" canSell={team.dedicatedFans > 1} />
                                    <AssetCard title="Animadoras" value={team.cheerleaders} limit={12} price={10000} onBuy={() => handleBuyAsset('cheerleaders', 10000, 12)} onSell={() => handleSellAsset('cheerleaders', 5000)} icon="celebration" canSell={team.cheerleaders > 0} />
                                    <AssetCard title="Ayudantes de Entrenador" value={team.assistantCoaches} limit={6} price={10000} onBuy={() => handleBuyAsset('assistantCoaches', 10000, 6)} onSell={() => handleSellAsset('assistantCoaches', 5000)} icon="sports" canSell={team.assistantCoaches > 0} />

                                    <div className={`p-6 rounded-[2rem] border flex items-center justify-between transition-all ${team.apothecary ? 'bg-green-500/5 border-green-500/20' : 'bg-black/40 border-white/5'}`}>
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
                                <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8">
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
                                    <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8">
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

                                <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8">
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
                                        <button onClick={() => onDeleteRequest(team.id!)} className="px-8 py-4 bg-blood text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-glow shadow-blood/20">
                                            Disolver Equipo
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Sidebar Sidebar */}
                    <div className="w-full lg:w-80 space-y-6">
                        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 overflow-hidden relative group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-all"></div>
                            <h3 className="text-sm font-epilogue font-black text-primary uppercase italic tracking-widest mb-6 relative z-10">Escudo Heráldico</h3>
                            <div
                                className="aspect-square bg-black/40 border-2 border-dashed border-white/10 rounded-2xl flex items-center justify-center cursor-pointer hover:border-primary/40 transition-all overflow-hidden relative z-10"
                                onClick={() => crestInputRef.current?.click()}
                            >
                                {team.crestImage ? (
                                    <div className="w-24 h-24 rounded-3xl overflow-hidden bg-black/40 border border-white/5 flex items-center justify-center relative group">
                                        <img 
                                            src={team.crestImage || getTeamLogoUrl(team.rosterName)} 
                                            onError={(e) => {
                                                const img = e.target as HTMLImageElement;
                                                const githubUrl = getTeamLogoUrl(team.rosterName);
                                                if (img.src !== githubUrl) {
                                                    img.src = githubUrl;
                                                } else {
                                                    // Final fallback if github is also missing
                                                    const originalData = teamsData.find(t => t.name === team.rosterName);
                                                    if (originalData && img.src !== originalData.image) {
                                                        img.src = originalData.image;
                                                    }
                                                }
                                            }}
                                            alt={team.name} 
                                            className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.1)] group-hover:scale-110 transition-transform duration-500" 
                                        />
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <span className="material-symbols-outlined text-4xl text-slate-700 mb-2">upload</span>
                                        <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">SVG / PNG</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8">
                            <h3 className="text-sm font-epilogue font-black text-primary uppercase italic tracking-widest mb-6">Resumen de Staff</h3>
                            <div className="space-y-4">
                                {[
                                    { label: 'Rerolls', val: team.rerolls, icon: 'refresh' },
                                    { label: 'Fans', val: team.dedicatedFans, icon: 'campaign' },
                                    { label: 'Boticario', val: team.apothecary ? 'SÍ' : 'NO', icon: 'emergency' }
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

            {/* Modals */}
            <AnimatePresence>
                {editingPlayer && <PlayerModal player={editingPlayer} allSkills={skillsData} onSave={handleSavePlayer} onClose={() => setEditingPlayer(null)} />}
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
