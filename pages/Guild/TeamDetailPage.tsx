import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { ManagedTeam, ManagedPlayer, Player, Skill } from '../../types';
import { teamsData } from '../../data/teams';
import { skillsData } from '../../data/skills';
import PlayerModal from '../../components/guild/PlayerModal';
import QrCodeIcon from '../../components/icons/QrCodeIcon';
import SkillModal from '../../components/oracle/SkillModal';
import { generateRandomName } from '../../data/randomNames';
import ShieldCheckIcon from '../../components/icons/ShieldCheckIcon';
import ImageModal from '../../components/common/ImageModal';
import UploadIcon from '../../components/icons/UploadIcon';
import MedicalCrossIcon from '../../components/icons/MedicalCrossIcon';
import MiniField from '../../components/common/MiniField';
import { PlayerAdvancementModal } from '../../components/guild/PlayerAdvancementModal';


declare const QRCode: any;

interface TeamDashboardProps {
    team: ManagedTeam;
    onUpdate: (team: ManagedTeam) => void;
    onDeleteRequest: (teamId: string) => void;
    onBack: () => void;
    isGuest: boolean;
}

export const TeamDashboard: React.FC<TeamDashboardProps> = ({ team, onUpdate, onDeleteRequest, onBack, isGuest }) => {
    const [editingPlayer, setEditingPlayer] = useState<ManagedPlayer | null>(null);
    const [showQr, setShowQr] = useState(false);
    const [selectedSkillForModal, setSelectedSkillForModal] = useState<Skill | null>(null);
    const [editingPlayerId, setEditingPlayerId] = useState<number | null>(null);
    const [editingName, setEditingName] = useState('');
    const [isCrestModalOpen, setIsCrestModalOpen] = useState(false);
    const [fireConfirmation, setFireConfirmation] = useState<ManagedPlayer | null>(null);
    const [advancingPlayer, setAdvancingPlayer] = useState<ManagedPlayer | null>(null);

    const qrCanvasRef = useRef<HTMLCanvasElement>(null);
    const crestInputRef = useRef<HTMLInputElement>(null);
    const baseRoster = useMemo(() => teamsData.find(t => t.name === team.rosterName), [team.rosterName]);

    useEffect(() => {
        if (showQr && qrCanvasRef.current && team) {
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
                    alert('Error al generar el QR: los datos del equipo son demasiado grandes, incluso optimizados.');
                    setShowQr(false);
                }
            })
        }
    }, [showQr, team]);

    const teamValue = useMemo(() => {
        if (!baseRoster) return 0;

        const playersValue = team.players.reduce((sum, p) => {
            let improvementsValue = 0;
            if (p.advancements && p.advancements.length > 0) {
                improvementsValue = p.advancements.reduce((advSum, adv) => {
                    switch (adv.type) {
                        case 'RandomPrimary': return advSum + 10000;
                        case 'ChosenPrimary': return advSum + 20000;
                        case 'RandomSecondary': return advSum + 20000;
                        case 'ChosenSecondary': return advSum + 40000;
                        case 'Characteristic':
                            if (adv.characteristicName === 'FU') return advSum + 40000;
                            if (adv.characteristicName === 'AG' || adv.characteristicName === 'PS') return advSum + 20000;
                            return advSum + 10000; // MV, AR
                        default: return advSum;
                    }
                }, 0);
            } else {
                // Fallback for legacy skills
                improvementsValue = p.gainedSkills.reduce((skillSum, skillName) => {
                    if (skillName.toLowerCase().includes('secundaria')) return skillSum + 40000;
                    return skillSum + 20000;
                }, 0);
            }
            return sum + p.cost + improvementsValue;
        }, 0);

        const rerollsValue = team.rerolls * baseRoster.rerollCost;
        const apothecaryValue = team.apothecary && baseRoster.apothecary === "Sí" ? 50000 : 0;
        const dedicatedFansValue = (team.dedicatedFans - 1) * 10000;
        const cheerleadersValue = team.cheerleaders * 10000;
        const assistantCoachesValue = team.assistantCoaches * 10000;
        return playersValue + rerollsValue + apothecaryValue + cheerleadersValue + assistantCoachesValue + dedicatedFansValue;
    }, [team, baseRoster]);

    const playersForField = useMemo(() => {
        const starters = team.players.filter(p => !(p.isBenched ?? true));
        const playersWithPositions = [...starters];

        const occupiedPositions = new Set(
            playersWithPositions
                .filter(p => p.fieldPosition)
                .map(p => `${p.fieldPosition!.x},${p.fieldPosition!.y}`)
        );

        playersWithPositions.forEach(player => {
            if (!player.fieldPosition) {
                let placed = false;
                for (let y = 6; y >= 3 && !placed; y--) {
                    for (let x = 2; x < 13 && !placed; x++) {
                        const posKey = `${x},${y}`;
                        if (!occupiedPositions.has(posKey)) {
                            player.fieldPosition = { x, y };
                            occupiedPositions.add(posKey);
                            placed = true;
                        }
                    }
                }
                if (!placed) {
                    player.fieldPosition = { x: 7, y: 6 };
                }
            }
        });

        return playersWithPositions;
    }, [team.players]);

    const handleSkillClick = (skillName: string) => {
        const cleanedName = (skillName || '').split('(')[0].trim();
        const foundSkill = skillsData.find(s => s.name.toLowerCase().startsWith(cleanedName.toLowerCase()));
        if (foundSkill) {
            setSelectedSkillForModal(foundSkill);
        } else {
            console.warn(`Skill not found: ${cleanedName}`);
        }
    };

    const handleNameDoubleClick = (player: ManagedPlayer) => {
        setEditingPlayerId(player.id);
        setEditingName(player.customName);
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditingName(e.target.value);
    };

    const handleNameUpdate = () => {
        if (editingPlayerId === null) return;

        const newName = editingName.trim();
        if (newName === '') {
            setEditingPlayerId(null);
            setEditingName('');
            return;
        }

        const updatedTeam = {
            ...team,
            players: team.players.map(p =>
                p.id === editingPlayerId ? { ...p, customName: newName } : p
            ),
        };
        onUpdate(updatedTeam);
        setEditingPlayerId(null);
        setEditingName('');
    };

    const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.currentTarget.blur();
        } else if (e.key === 'Escape') {
            setEditingPlayerId(null);
            setEditingName('');
        }
    };

    const handleCrestUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 200;
                const MAX_HEIGHT = 200;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);
                onUpdate({ ...team, crestImage: canvas.toDataURL('image/png') });
            };
            img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
    };


    if (!baseRoster) {
        return (
            <div className="flex flex-col items-center justify-center p-20 min-h-[60vh] text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-premium-gold mb-6 mx-auto"></div>
                <h3 className="text-xl font-display font-black text-white uppercase italic tracking-tighter mb-2">Sincronizando Facciones de Nuffle...</h3>
                <p className="text-slate-500 text-sm font-medium italic mb-8 max-w-md mx-auto">No pudimos encontrar la facción "{team.rosterName}" en los datos guardados. Estamos recuperando los archivos del templo...</p>
                <button
                    onClick={onBack}
                    className="px-8 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-display font-bold uppercase tracking-widest text-xs hover:bg-premium-gold hover:text-black transition-all"
                >
                    Regresar al Gremio
                </button>
            </div>
        );
    }

    const handleBuyReroll = () => {
        if (team.rerolls >= 8) {
            alert('No puedes tener más de 8 Segundas Oportunidades.');
            return;
        }
        if (!team.isAutoCalculating && team.treasury < baseRoster.rerollCost) {
            alert('¡No tienes suficiente dinero!');
            return;
        }
        onUpdate({
            ...team,
            treasury: team.isAutoCalculating ? team.treasury : team.treasury - baseRoster.rerollCost,
            rerolls: team.rerolls + 1,
        });
    };

    const handleSellReroll = () => {
        if (team.rerolls > 0) {
            onUpdate({
                ...team,
                treasury: team.isAutoCalculating ? team.treasury : team.treasury + (baseRoster.rerollCost / 2),
                rerolls: team.rerolls - 1,
            });
        }
    };

    const handleBuyApothecary = () => {
        if (team.apothecary) {
            alert('¡Ya tienes un boticario!');
            return;
        }
        if (!team.isAutoCalculating && team.treasury < 50000) {
            alert('¡No tienes suficiente dinero!');
            return;
        }
        onUpdate({
            ...team,
            treasury: team.isAutoCalculating ? team.treasury : team.treasury - 50000,
            apothecary: true,
        });
    };

    const handleSellApothecary = () => {
        if (team.apothecary) {
            onUpdate({
                ...team,
                treasury: team.isAutoCalculating ? team.treasury : team.treasury + 25000,
                apothecary: false,
            });
        }
    };

    const handleBuyFan = () => {
        if (team.dedicatedFans >= 6) {
            alert('No puedes tener más de 6 Hinchas.');
            return;
        }
        if (!team.isAutoCalculating && team.treasury < 10000) {
            alert('¡No tienes suficiente dinero!');
            return;
        }
        onUpdate({ ...team, treasury: team.isAutoCalculating ? team.treasury : team.treasury - 10000, dedicatedFans: team.dedicatedFans + 1 });
    };

    const handleSellFan = () => {
        if (team.dedicatedFans > 1) {
            onUpdate({ ...team, treasury: team.isAutoCalculating ? team.treasury : team.treasury + 5000, dedicatedFans: team.dedicatedFans - 1 });
        }
    };

    const handleBuyCheerleader = () => {
        if (team.cheerleaders >= 12) {
            alert('No puedes tener más de 12 animadoras.');
            return;
        }
        if (!team.isAutoCalculating && team.treasury < 10000) {
            alert('¡No tienes suficiente dinero!');
            return;
        }
        onUpdate({ ...team, treasury: team.isAutoCalculating ? team.treasury : team.treasury - 10000, cheerleaders: team.cheerleaders + 1 });
    };

    const handleSellCheerleader = () => {
        if (team.cheerleaders > 0) {
            onUpdate({ ...team, treasury: team.isAutoCalculating ? team.treasury : team.treasury + 5000, cheerleaders: team.cheerleaders - 1 });
        }
    };

    const handleBuyAssistantCoach = () => {
        if (team.assistantCoaches >= 6) {
            alert('No puedes tener más de 6 ayudantes de entrenador.');
            return;
        }
        if (!team.isAutoCalculating && team.treasury < 10000) {
            alert('¡No tienes suficiente dinero!');
            return;
        }
        onUpdate({ ...team, treasury: team.isAutoCalculating ? team.treasury : team.treasury - 10000, assistantCoaches: team.assistantCoaches + 1 });
    };

    const handleSellAssistantCoach = () => {
        if (team.assistantCoaches > 0) {
            onUpdate({ ...team, treasury: team.isAutoCalculating ? team.treasury : team.treasury + 5000, assistantCoaches: team.assistantCoaches - 1 });
        }
    };

    const countPlayersByPosition = (position: string) => {
        return team.players.filter(p => p.position === position).length;
    };

    const handleHirePlayer = (player: Player) => {
        const positionLimit = parseInt((player?.qty || '0-16').split('-')[1]);
        if (countPlayersByPosition(player.position) >= positionLimit) {
            alert(`Ya tienes el máximo de ${player.position}.`);
            return;
        }
        if (team.players.length >= 16) {
            alert('Tu plantilla no puede tener más de 16 jugadores.');
            return;
        }

        if (!team.isAutoCalculating && team.treasury < player.cost) {
            alert('¡No tienes suficiente dinero!');
            return;
        }

        const existingNames = new Set(team.players.map(p => p.customName.toLowerCase()));
        let randomName = generateRandomName(team.rosterName);
        while (existingNames.has(randomName.toLowerCase())) {
            randomName = generateRandomName(team.rosterName);
        }

        const newPlayer: ManagedPlayer = {
            ...player,
            id: Date.now(),
            customName: randomName,
            spp: 0,
            gainedSkills: [],
            lastingInjuries: [],
            status: 'Activo',
            isBenched: true, // New players start on the bench
            missNextGame: 0,
        };
        onUpdate({
            ...team,
            treasury: team.isAutoCalculating ? team.treasury : team.treasury - player.cost,
            players: [...team.players, newPlayer],
        });
    };

    const togglePlayerBenched = (playerId: number) => {
        const player = team.players.find(p => p.id === playerId);
        if (!player) return;

        const isCurrentlyBenched = player.isBenched ?? false;
        const startersCount = team.players.filter(p => !(p.isBenched ?? false)).length;

        if (isCurrentlyBenched && startersCount >= 11) {
            alert('No puedes tener más de 11 jugadores titulares.');
            return;
        }

        const updatedPlayers = team.players.map(p => {
            if (p.id === playerId) {
                const isNowBenched = !isCurrentlyBenched;
                const updatedPlayer = { ...p, isBenched: isNowBenched };

                if (isNowBenched) {
                    delete updatedPlayer.fieldPosition;
                } else {
                    if (!updatedPlayer.fieldPosition) {
                        const onFieldPlayers = team.players.filter(pl => !(pl.isBenched ?? false) && pl.id !== playerId);
                        const occupied = new Set(onFieldPlayers.map(pl => pl.fieldPosition ? `${pl.fieldPosition.x},${pl.fieldPosition.y}` : '').filter(Boolean));
                        let x = 7, y = 6;
                        let attempts = 0;
                        while (occupied.has(`${x},${y}`) && attempts < 15 * 4) {
                            x = (x + 1) % 15;
                            if (x === 0) y--;
                            if (y < 3) { y = 6; }
                            attempts++;
                        }
                        updatedPlayer.fieldPosition = { x, y };
                    }
                }
                return updatedPlayer;
            }
            return p;
        });

        onUpdate({ ...team, players: updatedPlayers });
    };

    const handlePlayerMoveOnField = (playerId: number, newPos: { x: number; y: number }) => {
        const currentPlayers = team.players;
        const playerBeingMoved = currentPlayers.find(p => p.id === playerId);
        if (!playerBeingMoved) return;

        const playerAtTarget = currentPlayers.find(p =>
            p.id !== playerId &&
            p.fieldPosition?.x === newPos.x &&
            p.fieldPosition?.y === newPos.y
        );

        const updatedPlayers = currentPlayers.map(p => {
            if (p.id === playerId) {
                return { ...p, fieldPosition: newPos };
            }
            // If there's a player at the target, swap positions with them
            if (playerAtTarget && p.id === playerAtTarget.id) {
                return { ...p, fieldPosition: playerBeingMoved.fieldPosition };
            }
            return p;
        });

        onUpdate({ ...team, players: updatedPlayers });
    };

    const requestFirePlayer = (playerId: number) => {
        const playerToFire = team.players.find(p => p.id === playerId);
        if (playerToFire) {
            setFireConfirmation(playerToFire);
        }
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
        onUpdate({
            ...team,
            players: team.players.map(p => p.id === updatedPlayer.id ? updatedPlayer : p)
        });
        setEditingPlayer(null);
    };

    const handleDeleteTeam = () => {
        onDeleteRequest(team.id!);
    };

    const starterCount = team.players.filter(p => !(p.isBenched ?? true)).length;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center px-4 pt-4">
                <button onClick={onBack} className="group flex items-center gap-2 text-slate-400 hover:text-white transition-premium">
                    <span className="text-premium-gold transition-transform group-hover:-translate-x-1">←</span>
                    <span className="font-display font-bold uppercase tracking-widest text-xs">Volver</span>
                </button>
                {!isGuest && (
                    <button onClick={() => setShowQr(true)} className="flex items-center gap-2 bg-white/5 border border-white/10 text-white font-display font-bold uppercase tracking-widest text-xs py-2 px-4 rounded-xl hover:bg-white/10 transition-premium shadow-xl">
                        <QrCodeIcon className="w-4 h-4 text-premium-gold" />
                        Código QR
                    </button>
                )}
            </div>
            {/* Team Info Header */}
            <div className="glass-panel p-6 border-white/10 relative overflow-hidden group/header">
                <div className="absolute inset-0 bg-gradient-to-r from-premium-gold/10 to-transparent pointer-events-none"></div>
                <div className="flex flex-wrap justify-between items-center gap-6 relative z-10">
                    <div className="flex items-center gap-6">
                        <div className="relative group/crest">
                            <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl bg-black/40 flex items-center justify-center flex-shrink-0 border-2 border-white/10 overflow-hidden shadow-2xl transition-premium group-hover/crest:border-premium-gold/50">
                                {team.crestImage ? (
                                    <img src={team.crestImage} alt="Escudo del equipo" className="w-full h-full object-cover" />
                                ) : (
                                    <ShieldCheckIcon className="w-12 h-12 text-slate-600" />
                                )}
                            </div>
                            <input
                                type="file"
                                ref={crestInputRef}
                                onChange={handleCrestUpload}
                                accept="image/*"
                                className="hidden"
                            />
                            <div className="absolute -bottom-2 -right-2 flex flex-col gap-2 opacity-0 group-hover/crest:opacity-100 transition-opacity duration-300">
                                <button
                                    onClick={() => crestInputRef.current?.click()}
                                    className="bg-premium-gold text-black p-2 rounded-xl shadow-2xl hover:bg-white transition-premium"
                                    aria-label="Cambiar escudo"
                                >
                                    <UploadIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div>
                            <h2 className="text-4xl sm:text-5xl font-display font-black text-white italic tracking-tighter uppercase leading-none drop-shadow-lg">{team.name}</h2>
                            <p className="text-premium-gold font-display font-bold uppercase tracking-[0.2em] text-xs mt-2 opacity-80">{team.rosterName}</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        {!team.isAutoCalculating && (
                            <div className="bg-black/40 border border-white/5 py-1 px-4 rounded-full">
                                <p className="text-xs font-display font-bold text-slate-400 uppercase tracking-widest">
                                    Tesorería: <span className="text-green-400 ml-2">{team.treasury.toLocaleString()} M.O.</span>
                                </p>
                            </div>
                        )}
                        <div className="bg-black/40 border border-white/5 py-2 px-6 rounded-2xl">
                            <p className="text-xs font-display font-bold text-slate-400 uppercase tracking-widest mb-1">Valor de Equipo</p>
                            <p className="text-3xl font-display font-black text-white tracking-wider">{teamValue.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Team Assets & Staff */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bento-card p-6 border-white/5 h-full">
                    <h3 className="text-xl font-display font-bold text-premium-gold mb-6 uppercase tracking-wider flex items-center gap-3">
                        <span className="material-symbols-outlined text-premium-gold">groups</span>
                        Personal y Apoyo
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <AssetCard
                            title="Segundas Oportunidades"
                            value={team.rerolls}
                            limit={8}
                            price={baseRoster.rerollCost}
                            onBuy={handleBuyReroll}
                            onSell={handleSellReroll}
                            icon="refresh"
                            canSell={team.rerolls > 0}
                        />
                        <AssetCard
                            title="Hinchas Dedicados"
                            value={team.dedicatedFans}
                            limit={6}
                            price={10000}
                            onBuy={handleBuyFan}
                            onSell={handleSellFan}
                            icon="campaign"
                            canSell={team.dedicatedFans > 1}
                        />
                        <AssetCard
                            title="Animadoras"
                            value={team.cheerleaders}
                            limit={12}
                            price={10000}
                            onBuy={handleBuyCheerleader}
                            onSell={handleSellCheerleader}
                            icon="celebration"
                            canSell={team.cheerleaders > 0}
                        />
                        <AssetCard
                            title="Ayudantes de Entrenador"
                            value={team.assistantCoaches}
                            limit={6}
                            price={10000}
                            onBuy={handleBuyAssistantCoach}
                            onSell={handleSellAssistantCoach}
                            icon="sports"
                            canSell={team.assistantCoaches > 0}
                        />
                    </div>
                </div>

                <div className="bento-card p-6 border-white/5 h-full flex flex-col">
                    <h3 className="text-xl font-display font-bold text-premium-gold mb-6 uppercase tracking-wider flex items-center gap-3">
                        <span className="material-symbols-outlined text-premium-gold">medical_services</span>
                        Servicios Médicos
                    </h3>
                    <div className="flex-grow flex flex-col justify-center gap-6">
                        <div className={`p-6 rounded-2xl border transition-premium text-center ${team.apothecary ? 'bg-green-400/5 border-green-400/20 shadow-[0_0_30px_rgba(74,222,128,0.1)]' : 'bg-black/40 border-white/5 opacity-50'}`}>
                            <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${team.apothecary ? 'bg-green-400 text-black' : 'bg-slate-800 text-slate-500'}`}>
                                <span className="material-symbols-outlined text-3xl">emergency</span>
                            </div>
                            <p className={`font-display font-black uppercase tracking-tighter italic text-xl ${team.apothecary ? 'text-white' : 'text-slate-500'}`}>
                                {team.apothecary ? 'Boticario Activo' : 'Sin Boticario'}
                            </p>
                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-1">Garantía de Supervivencia</p>
                        </div>

                        {baseRoster.apothecary === 'Sí' && (
                            <div className="space-y-3">
                                {!team.apothecary ? (
                                    <button
                                        onClick={handleBuyApothecary}
                                        className="w-full bg-premium-gold text-black font-display font-black uppercase tracking-widest text-xs py-4 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-premium shadow-2xl"
                                    >
                                        Contratar (50,000 M.O.)
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleSellApothecary}
                                        className="w-full bg-white/5 border border-white/10 text-white font-display font-bold uppercase tracking-widest text-xs py-4 rounded-xl hover:bg-blood-red/20 hover:text-blood-red hover:border-blood-red/50 transition-premium"
                                    >
                                        Despedir Personal
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Default Deployment */}
            <div className="bento-card p-6 border-white/5">
                <h3 className="text-xl font-display font-bold text-premium-gold mb-2 uppercase tracking-wider flex items-center gap-3">
                    <span className="w-8 h-8 bg-premium-gold/10 rounded-lg flex items-center justify-center text-sm italic">D</span>
                    Despliegue Táctico
                </h3>
                <p className="text-[10px] font-display font-bold text-slate-500 uppercase tracking-widest mb-6">Configura la formación inicial de tus jugadores titulares.</p>
                <div className="max-w-xl mx-auto bg-black/40 p-4 rounded-2xl border border-white/5 shadow-2xl">
                    <MiniField
                        players={playersForField}
                        teamColor="bg-premium-gold"
                        onPlayerMove={handlePlayerMoveOnField}
                        onPlayerClick={setEditingPlayer}
                    />
                </div>
            </div>


            {/* Hire Players */}
            <div className="bento-card overflow-hidden border-white/5">
                <div className="p-6 border-b border-white/5 bg-white/5 flex justify-between items-center">
                    <h3 className="text-xl font-display font-bold text-premium-gold uppercase tracking-wider flex items-center gap-3">
                        <span className="material-symbols-outlined text-premium-gold">person_add</span>
                        Mercado de Fichajes
                    </h3>
                    <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-xl border border-white/5">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Tesorería:</span>
                        <span className="text-xs font-mono font-bold text-green-400">{team.treasury.toLocaleString()} M.O.</span>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs whitespace-nowrap">
                        <thead className="bg-black/40 text-slate-400 font-display uppercase tracking-widest">
                            <tr>
                                <th className="p-4">Posición</th>
                                <th className="p-4">Coste</th>
                                <th className="p-4 text-center">MV</th>
                                <th className="p-4 text-center">FU</th>
                                <th className="p-4 text-center">AG</th>
                                <th className="p-4 text-center">PS</th>
                                <th className="p-4 text-center">AR</th>
                                <th className="p-4">Habilidades</th>
                                <th className="p-4 text-center">Cupo</th>
                                <th className="p-4 text-right">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {baseRoster.roster.map(p => {
                                const currentCount = countPlayersByPosition(p.position);
                                const limit = parseInt((p?.qty || '0-16').split('-').pop() || '16');
                                const isFull = currentCount >= limit;
                                const canAfford = team.isAutoCalculating || team.treasury >= p.cost;

                                return (
                                    <tr key={p.position} className={`hover:bg-white/5 transition-colors ${isFull ? 'opacity-40 grayscale' : ''}`}>
                                        <td className="p-4 font-display font-bold text-white text-base">{p.position}</td>
                                        <td className="p-4 font-mono text-green-400">{p.cost.toLocaleString()}</td>
                                        <td className="p-4 text-center font-display font-black text-white text-sm bg-white/5">{p.stats.MV}</td>
                                        <td className="p-4 text-center font-display font-black text-white text-sm">{p.stats.FU}</td>
                                        <td className="p-4 text-center font-display font-black text-white text-sm bg-white/5">{p.stats.AG}</td>
                                        <td className="p-4 text-center font-display font-black text-white text-sm">{p.stats.PS}</td>
                                        <td className="p-4 text-center font-display font-black text-white text-sm bg-white/5">{p.stats.AR}</td>
                                        <td className="p-4 whitespace-normal min-w-[200px]">
                                            <div className="flex flex-wrap gap-1">
                                                {(p.skills || '').split(', ').map((skill) => {
                                                    const cleanSkillName = skill.trim();
                                                    if (cleanSkillName && cleanSkillName.toLowerCase() !== 'ninguna') {
                                                        return (
                                                            <button
                                                                key={skill}
                                                                onClick={() => handleSkillClick(cleanSkillName)}
                                                                className="text-[10px] font-bold px-2 py-0.5 rounded bg-premium-gold/10 text-premium-gold hover:bg-premium-gold hover:text-black transition-premium"
                                                            >
                                                                {cleanSkillName}
                                                            </button>
                                                        );
                                                    }
                                                    return <span key={skill} className="text-slate-500 italic text-[10px]">{cleanSkillName}</span>;
                                                })}
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex flex-col items-center">
                                                <span className={`font-display font-bold ${isFull ? 'text-blood-red' : 'text-slate-400'}`}>
                                                    {currentCount} <span className="text-[10px] opacity-30">/</span> {limit}
                                                </span>
                                                {isFull && <span className="text-[8px] text-blood-red uppercase font-black tracking-tighter">Máximo</span>}
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                disabled={isFull || !canAfford}
                                                onClick={() => handleHirePlayer(p)}
                                                className={`font-display font-black uppercase tracking-widest text-[10px] py-2.5 px-6 rounded-xl transition-premium shadow-xl ${isFull || !canAfford
                                                    ? 'bg-white/5 text-slate-600 cursor-not-allowed border border-white/5'
                                                    : 'bg-premium-gold text-black hover:scale-105 active:scale-95 shadow-premium-gold/20'
                                                    }`}
                                            >
                                                {isFull ? 'Sin Cupo' : !canAfford ? 'Sin Fondos' : 'Contratar'}
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Current Roster */}
            <div className="bento-card overflow-hidden border-white/5">
                <div className="p-6 border-b border-white/5 bg-white/5 flex flex-wrap justify-between items-center gap-4">
                    <h3 className="text-xl font-display font-bold text-premium-gold uppercase tracking-wider flex items-center gap-3">
                        <span className="w-8 h-8 bg-premium-gold/10 rounded-lg flex items-center justify-center text-sm italic">P</span>
                        Plantilla Actual
                        <span className="text-xs text-slate-500 font-normal">({team.players.length}/16)</span>
                    </h3>
                    <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-display font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full ${starterCount > 11 ? 'bg-blood-red/20 text-blood-red' : 'bg-green-400/10 text-green-400 border border-green-400/20 shadow-[0_0_15px_rgba(74,222,128,0.1)]'}`}>
                            Titulares: {starterCount}/11
                        </span>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs whitespace-nowrap">
                        <thead className="bg-black/40 text-slate-400 font-display uppercase tracking-widest">
                            <tr>
                                <th className="p-4">Nombre</th>
                                <th className="p-4">Posición</th>
                                <th className="p-4 text-center">MV</th>
                                <th className="p-4 text-center">FU</th>
                                <th className="p-4 text-center">AG</th>
                                <th className="p-4 text-center">PS</th>
                                <th className="p-4 text-center">AR</th>
                                <th className="p-4">Titular</th>
                                <th className="p-4 text-center">PE</th>
                                <th className="p-4">Habilidades</th>
                                <th className="p-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {team.players.map(p => {
                                const allSkills = [
                                    ...((p?.skills || '').toLowerCase() !== 'ninguna' ? (p?.skills || '').split(', ').map(s => s.trim()).filter(Boolean) : []),
                                    ...p.gainedSkills
                                ];
                                const isBenched = p.isBenched ?? true;
                                return (
                                    <tr key={p.id} className={`group/row transition-colors ${isBenched ? 'bg-black/20 opacity-60 grayscale-[0.5]' : 'hover:bg-white/5'}`}>
                                        <td className="p-4 min-w-[150px]" onDoubleClick={() => handleNameDoubleClick(p)}>
                                            <div className="flex items-center gap-2">
                                                {p.missNextGame && p.missNextGame > 0 && (
                                                    <span title={`Se pierde ${p.missNextGame} partido(s)`} className="animate-pulse">
                                                        <MedicalCrossIcon className="w-4 h-4 text-blood-red flex-shrink-0 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                                                    </span>
                                                )}
                                                {editingPlayerId === p.id ? (
                                                    <input
                                                        type="text"
                                                        value={editingName}
                                                        onChange={handleNameChange}
                                                        onBlur={handleNameUpdate}
                                                        onKeyDown={handleNameKeyDown}
                                                        autoFocus
                                                        className="bg-black border border-premium-gold text-white rounded px-2 py-1 outline-none w-full font-display font-bold uppercase italic shadow-[0_0_15px_rgba(202,138,4,0.3)]"
                                                    />
                                                ) : (
                                                    <span className="font-display font-black text-white text-base uppercase italic tracking-tight group-hover/row:text-premium-gold transition-colors">{p.customName}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4 font-display font-bold text-slate-400 uppercase tracking-widest text-[10px]">{p.position}</td>
                                        <td className="p-4 text-center font-display font-black text-white text-sm bg-white/5">{p.stats.MV}</td>
                                        <td className="p-4 text-center font-display font-black text-white text-sm">{p.stats.FU}</td>
                                        <td className="p-4 text-center font-display font-black text-white text-sm bg-white/5">{p.stats.AG}</td>
                                        <td className="p-4 text-center font-display font-black text-white text-sm">{p.stats.PS}</td>
                                        <td className="p-4 text-center font-display font-black text-white text-sm bg-white/5">{p.stats.AR}</td>
                                        <td className="p-4">
                                            <button
                                                onClick={() => togglePlayerBenched(p.id)}
                                                className={`text-[10px] font-display font-black uppercase tracking-[0.2em] py-1.5 px-4 rounded-full transition-premium ${isBenched ? 'bg-white/5 text-slate-500 border border-white/5' : 'bg-green-400 text-black shadow-[0_0_15px_rgba(74,222,128,0.3)]'}`}
                                            >
                                                {isBenched ? 'Banquillo' : 'Titular'}
                                            </button>
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex flex-col items-center gap-1">
                                                <span className="font-mono text-premium-gold font-bold bg-premium-gold/5 px-2 py-1 rounded border border-premium-gold/10">{p.spp}</span>
                                                {p.spp >= 3 && (
                                                    <button
                                                        onClick={() => setAdvancingPlayer(p)}
                                                        className="text-[8px] font-display font-black uppercase tracking-widest text-green-400 hover:text-white transition-premium bg-green-400/10 px-1 rounded border border-green-400/20"
                                                    >
                                                        Mejorar
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4 whitespace-normal min-w-[250px]">
                                            <div className="flex flex-wrap gap-1">
                                                {allSkills.length > 0 ? (
                                                    allSkills.map((skill) => (
                                                        <button
                                                            key={`${p.id}-${skill}`}
                                                            onClick={() => handleSkillClick(skill)}
                                                            className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/5 border border-white/5 text-slate-300 hover:bg-premium-gold hover:text-black hover:border-premium-gold transition-premium"
                                                        >
                                                            {skill}
                                                        </button>
                                                    ))
                                                ) : <span className="text-slate-600 italic text-[10px]">Sin habilidades</span>}
                                            </div>
                                            {p.lastingInjuries.length > 0 && (
                                                <div className="mt-1 flex flex-wrap gap-1">
                                                    {p.lastingInjuries.map(injury => (
                                                        <span key={`${p.id}-${injury}`} className="text-[9px] font-bold text-blood-red uppercase tracking-widest bg-blood-red/10 px-1.5 rounded">{injury}</span>
                                                    ))}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover/row:opacity-100 transition-opacity">
                                                <button onClick={() => setEditingPlayer(p)} className="p-2 rounded-lg bg-white/5 border border-white/10 text-sky-400 hover:bg-sky-400 hover:text-black transition-premium" title="Editar Jugador">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                </button>
                                                <button onClick={() => requestFirePlayer(p.id)} className="p-2 rounded-lg bg-white/5 border border-white/10 text-blood-red hover:bg-blood-red hover:text-white transition-premium" title="Despedir Jugador">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>


            {/* History and Legacy */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bento-card p-6 border-white/5 h-full">
                    <h3 className="text-xl font-display font-bold text-premium-gold mb-6 uppercase tracking-wider flex items-center gap-3">
                        <span className="material-symbols-outlined text-premium-gold text-2xl">history_edu</span>
                        Historial de Batalla
                    </h3>
                    <div className="space-y-3">
                        {team.history && team.history.length > 0 ? (
                            team.history.map((record, idx) => (
                                <div key={idx} className="flex justify-between items-center p-4 bg-black/20 rounded-xl border border-white/5 hover:border-white/10 transition-premium group">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-display font-black italic text-lg ${record.result === 'W' ? 'bg-green-400/20 text-green-400' : record.result === 'L' ? 'bg-blood-red/20 text-blood-red' : 'bg-slate-400/20 text-slate-400'
                                            }`}>
                                            {record.result}
                                        </div>
                                        <div>
                                            <p className="text-sm font-display font-black text-white uppercase italic tracking-tighter">{record.opponentName}</p>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{record.date}</p>
                                        </div>
                                    </div>
                                    <div className="text-xl font-display font-black text-white tracking-widest group-hover:text-premium-gold transition-colors">
                                        {record.score}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-12 text-center">
                                <span className="material-symbols-outlined text-slate-700 text-5xl mb-4">pending_actions</span>
                                <p className="text-slate-500 text-[10px] font-bold uppercase italic tracking-widest block">Aun no hay crónicas de guerra...</p>
                                <p className="text-slate-600 text-[8px] uppercase tracking-tighter mt-1">Disputa partidos para forjar una leyenda</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bento-card p-6 border-white/5 h-full">
                    <h3 className="text-xl font-display font-bold text-premium-gold mb-6 uppercase tracking-wider flex items-center gap-3">
                        <span className="material-symbols-outlined text-premium-gold text-2xl">military_tech</span>
                        Estadísticas de Temporada
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 bg-black/40 rounded-2xl border border-white/5 text-center">
                            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Victorias</p>
                            <p className="text-3xl font-display font-black text-green-400 italic">{team.record?.wins || 0}</p>
                        </div>
                        <div className="p-4 bg-black/40 rounded-2xl border border-white/5 text-center">
                            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Empates</p>
                            <p className="text-3xl font-display font-black text-slate-400 italic">{team.record?.draws || 0}</p>
                        </div>
                        <div className="p-4 bg-black/40 rounded-2xl border border-white/5 text-center">
                            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Derrotas</p>
                            <p className="text-3xl font-display font-black text-blood-red italic">{team.record?.losses || 0}</p>
                        </div>
                    </div>
                    <div className="mt-8 pt-8 border-t border-white/5">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-[10px] font-display font-bold text-slate-500 uppercase">Progreso del Plantel</span>
                            <span className="text-[10px] font-mono text-premium-gold font-bold">{team.players.reduce((sum, p) => sum + p.spp, 0)} PE Totales</span>
                        </div>
                        <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
                            <div
                                className="h-full bg-gradient-to-r from-premium-gold to-white shadow-[0_0_10px_rgba(202,138,4,0.5)]"
                                style={{ width: `${Math.min(100, ((team.players.reduce((sum, p) => sum + p.spp, 0) || 1) / 50) * 100)}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>


            {/* Danger Zone */}
            <div className="bento-card p-6 border-blood-red/20 bg-blood-red/5">
                <h3 className="text-xl font-display font-bold text-blood-red uppercase tracking-wider mb-2">Zona Peligrosa</h3>
                <p className="text-[10px] font-display font-bold text-slate-500 uppercase tracking-widest mb-6 border-b border-blood-red/10 pb-4">Acciones irreversibles para la gestión de la franquicia.</p>
                <button onClick={handleDeleteTeam} className="bg-blood-red text-white font-display font-black uppercase tracking-widest text-xs py-3 px-8 rounded-lg transition-premium hover:scale-105 active:scale-95 shadow-xl shadow-blood-red/20 border border-white/10">
                    Disolver Franquicia
                </button>
            </div>

            {editingPlayer && <PlayerModal player={editingPlayer} allSkills={skillsData} onSave={handleSavePlayer} onClose={() => setEditingPlayer(null)} />}
            {advancingPlayer && <PlayerAdvancementModal player={advancingPlayer} isOpen={!!advancingPlayer} onAdvance={handleSavePlayer} onClose={() => setAdvancingPlayer(null)} />}
            {selectedSkillForModal && <SkillModal skill={selectedSkillForModal} onClose={() => setSelectedSkillForModal(null)} />}
            {isCrestModalOpen && team.crestImage && <ImageModal src={team.crestImage} alt={`Escudo de ${team.name}`} onClose={() => setIsCrestModalOpen(false)} />}
            {fireConfirmation && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="glass-panel w-full max-w-sm border-blood-red/20 overflow-hidden shadow-[0_0_50px_rgba(239,68,68,0.2)]">
                        <div className="p-6 bg-gradient-to-br from-blood-red/20 to-transparent border-b border-blood-red/10">
                            <div className="w-16 h-16 bg-blood-red/10 rounded-full flex items-center justify-center text-blood-red mb-4 border border-blood-red/20">
                                <span className="material-symbols-outlined text-3xl">person_remove</span>
                            </div>
                            <h3 className="text-2xl font-display font-black text-white italic tracking-tighter uppercase leading-none">Despedir Jugador</h3>
                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2">¿Confirmar disolución de contrato?</p>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-slate-300 text-sm leading-relaxed">
                                Estas a punto de rescindir el contrato de <span className="font-bold text-white uppercase italic">{fireConfirmation.customName}</span>.
                            </p>
                            <div className="bg-black/40 p-3 rounded-lg border border-white/5 flex justify-between items-center">
                                <span className="text-[10px] font-bold text-slate-500 uppercase">Recuperación:</span>
                                <span className="font-mono font-bold text-green-400">
                                    {!team.isAutoCalculating ? `+${(fireConfirmation.cost / 2).toLocaleString()} M.O.` : '0 M.O.'}
                                </span>
                            </div>
                        </div>
                        <div className="p-6 bg-black/20 flex flex-col gap-3">
                            <button
                                onClick={confirmFirePlayer}
                                className="w-full bg-blood-red text-white font-display font-black uppercase tracking-widest py-3 rounded-xl hover:scale-105 transition-premium shadow-xl shadow-blood-red/20"
                            >
                                Confirmar Despido
                            </button>
                            <button
                                onClick={() => setFireConfirmation(null)}
                                className="w-full text-slate-400 font-display font-bold uppercase tracking-widest text-[10px] py-2 hover:text-white transition-premium"
                            >
                                Mantener en Plantilla
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showQr && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
                    onClick={() => setShowQr(false)}
                >
                    <div className="bg-slate-800 p-4 rounded-lg shadow-xl border border-slate-700" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-amber-400 mb-4 text-center">Código QR de {team.name}</h3>
                        <canvas ref={qrCanvasRef}></canvas>
                        <p className="text-xs text-slate-400 mt-2 text-center">Escanea este código para importar el equipo.</p>
                    </div>
                </div>
            )}
            <style>{`
                @keyframes fade-in-fast { from { opacity: 0; } to { opacity: 1; } }
                .animate-fade-in-fast { animation: fade-in-fast 0.2s ease-out forwards; }
            `}</style>
        </div>
    );
};
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
    <div className='flex flex-col p-4 bg-black/20 rounded-2xl border border-white/5 group hover:border-premium-gold/30 transition-premium'>
        <div className='flex justify-between items-start mb-4'>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${value > 0 ? 'bg-premium-gold text-black' : 'bg-white/5 text-slate-500'}`}>
                <span className='material-symbols-outlined text-xl'>{icon}</span>
            </div>
            <div className='text-right'>
                <span className='text-[10px] font-display font-black text-slate-600 uppercase tracking-widest block'>Nivel</span>
                <span className='text-2xl font-display font-black text-white italic'>{value}<span className='text-xs text-slate-600 ml-1 not-italic'>/{limit}</span></span>
            </div>
        </div>
        <p className='text-[10px] font-display font-bold text-slate-400 uppercase tracking-[0.1em] mb-4 h-8 overflow-hidden line-clamp-2'>{title}</p>
        <div className='flex gap-2 mt-auto'>
            <button
                onClick={onBuy}
                disabled={value >= limit}
                className='flex-grow bg-premium-gold/10 border border-premium-gold/20 text-premium-gold font-display font-black uppercase text-[10px] py-2 rounded-lg hover:bg-premium-gold hover:text-black transition-premium disabled:opacity-20'
            >
                +{price.toLocaleString()}
            </button>
            <button
                onClick={onSell}
                disabled={!canSell}
                className='w-10 flex items-center justify-center bg-white/5 border border-white/10 text-white font-bold rounded-lg hover:bg-blood-red/20 hover:text-blood-red hover:border-blood-red/50 transition-premium disabled:opacity-20'
            >
                -
            </button>
        </div>
    </div>
);
