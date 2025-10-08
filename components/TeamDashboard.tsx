import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { ManagedTeam, ManagedPlayer, Player, Skill } from '../types';
import { teamsData } from '../data/teams';
import { skillsData } from '../data/skills';
import PlayerModal from './PlayerModal';
import QrCodeIcon from './icons/QrCodeIcon';
import SkillModal from './SkillModal';
import { generateRandomName } from '../data/randomNames';
import ShieldCheckIcon from './icons/ShieldCheckIcon';
import ImageModal from './ImageModal';
import UploadIcon from './icons/UploadIcon';

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
    const qrCanvasRef = useRef<HTMLCanvasElement>(null);
    const crestInputRef = useRef<HTMLInputElement>(null);
    const baseRoster = useMemo(() => teamsData.find(t => t.name === team.rosterName), [team.rosterName]);

    useEffect(() => {
        if (showQr && qrCanvasRef.current && team) {
            // Use shortened keys to reduce QR code data size
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
            const skillsValue = p.gainedSkills.reduce((skillSum, skillName) => {
                 if (skillName.toLowerCase().includes('secundaria')) {
                    return skillSum + 40000;
                }
                return skillSum + 20000;
            }, 0);
            return sum + p.cost + skillsValue;
        }, 0);
        
        const rerollsValue = team.rerolls * baseRoster.rerollCost;
        const apothecaryValue = team.apothecary && baseRoster.apothecary === "Sí" ? 50000 : 0;
        const dedicatedFansValue = (team.dedicatedFans - 1) * 10000;
        const cheerleadersValue = team.cheerleaders * 10000;
        const assistantCoachesValue = team.assistantCoaches * 10000;
        return playersValue + rerollsValue + apothecaryValue + cheerleadersValue + assistantCoachesValue + dedicatedFansValue;
    }, [team, baseRoster]);
    
    const handleSkillClick = (skillName: string) => {
        const cleanedName = skillName.split('(')[0].trim();
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
        return <div className="p-8 text-center text-red-500">Error: No se encontró la facción del equipo.</div>;
    }

    const handleBuyReroll = () => {
        if (team.rerolls >= 8) {
            alert('No puedes tener más de 8 Segundas Oportunidades.');
            return;
        }
        if (team.treasury >= baseRoster.rerollCost) {
            onUpdate({
                ...team,
                treasury: team.treasury - baseRoster.rerollCost,
                rerolls: team.rerolls + 1,
            });
        } else {
            alert('¡No tienes suficiente dinero!');
        }
    };

    const handleSellReroll = () => {
        if (team.rerolls > 0) {
            onUpdate({
                ...team,
                treasury: team.treasury + (baseRoster.rerollCost / 2),
                rerolls: team.rerolls - 1,
            });
        }
    };

    const handleBuyApothecary = () => {
        if (team.treasury >= 50000 && !team.apothecary) {
            onUpdate({
                ...team,
                treasury: team.treasury - 50000,
                apothecary: true,
            });
        } else if (team.apothecary) {
            alert('¡Ya tienes un boticario!');
        } else {
            alert('¡No tienes suficiente dinero!');
        }
    };

    const handleSellApothecary = () => {
        if (team.apothecary) {
             onUpdate({
                ...team,
                treasury: team.treasury + 25000,
                apothecary: false,
            });
        }
    };
    
    const handleBuyFan = () => {
        if (team.dedicatedFans >= 6) {
            alert('No puedes tener más de 6 Hinchas.');
            return;
        }
        if (team.treasury >= 10000) {
            onUpdate({ ...team, treasury: team.treasury - 10000, dedicatedFans: team.dedicatedFans + 1 });
        } else {
            alert('¡No tienes suficiente dinero!');
        }
    };

    const handleSellFan = () => {
        if (team.dedicatedFans > 1) {
             onUpdate({ ...team, treasury: team.treasury + 5000, dedicatedFans: team.dedicatedFans - 1 });
        }
    };

    const handleBuyCheerleader = () => {
        if (team.cheerleaders >= 12) {
            alert('No puedes tener más de 12 animadoras.');
            return;
        }
        if (team.treasury >= 10000) {
            onUpdate({ ...team, treasury: team.treasury - 10000, cheerleaders: team.cheerleaders + 1 });
        } else {
            alert('¡No tienes suficiente dinero!');
        }
    };

    const handleSellCheerleader = () => {
        if (team.cheerleaders > 0) {
             onUpdate({ ...team, treasury: team.treasury + 5000, cheerleaders: team.cheerleaders - 1 });
        }
    };
    
    const handleBuyAssistantCoach = () => {
        if (team.assistantCoaches >= 6) {
            alert('No puedes tener más de 6 ayudantes de entrenador.');
            return;
        }
        if (team.treasury >= 10000) {
            onUpdate({ ...team, treasury: team.treasury - 10000, assistantCoaches: team.assistantCoaches + 1 });
        } else {
            alert('¡No tienes suficiente dinero!');
        }
    };

    const handleSellAssistantCoach = () => {
        if (team.assistantCoaches > 0) {
            onUpdate({ ...team, treasury: team.treasury + 5000, assistantCoaches: team.assistantCoaches - 1 });
        }
    };
    
    const countPlayersByPosition = (position: string) => {
        return team.players.filter(p => p.position === position).length;
    };

    const handleHirePlayer = (player: Player) => {
        const positionLimit = parseInt(player.qty.split('-')[1]);
        if (countPlayersByPosition(player.position) >= positionLimit) {
            alert(`Ya tienes el máximo de ${player.position}.`);
            return;
        }
        if (team.players.length >= 16) {
            alert('Tu plantilla no puede tener más de 16 jugadores.');
            return;
        }

        if (team.treasury >= player.cost) {
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
                isBenched: false, // Default to starter
            };
            onUpdate({
                ...team,
                treasury: team.treasury - player.cost,
                players: [...team.players, newPlayer],
            });
        } else {
            alert('¡No tienes suficiente dinero!');
        }
    };
    
    const togglePlayerBenched = (playerId: number) => {
        const updatedPlayers = team.players.map(p => 
            p.id === playerId ? { ...p, isBenched: !(p.isBenched ?? false) } : p
        );
        onUpdate({ ...team, players: updatedPlayers });
    };

    const handleFirePlayer = (playerId: number) => {
        const playerToFire = team.players.find(p => p.id === playerId);
        if (!playerToFire) return;

        if (confirm(`¿Estás seguro de que quieres despedir a ${playerToFire.customName}? Recibirás la mitad de su coste (${(playerToFire.cost / 2).toLocaleString()} M.O.) de vuelta a tu tesorería.`)) {
            onUpdate({
                ...team,
                treasury: team.treasury + (playerToFire.cost / 2),
                players: team.players.filter(p => p.id !== playerId)
            });
        }
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

    const starterCount = team.players.filter(p => !(p.isBenched ?? false)).length;

    return (
        <div className="space-y-6">
             <div className="flex justify-between items-center">
                <button onClick={onBack} className="text-amber-400 hover:underline text-sm">
                    &larr; Volver a la lista de equipos
                </button>
                {!isGuest && (
                    <button onClick={() => setShowQr(true)} className="flex items-center gap-2 bg-slate-700 text-slate-200 font-bold py-2 px-4 rounded-lg shadow-md hover:bg-slate-600 transition-colors">
                        <QrCodeIcon />
                        Generar QR
                    </button>
                )}
            </div>
            {/* Team Info Header */}
            <div className="bg-slate-900/70 p-4 rounded-lg border border-slate-700">
                <div className="flex flex-wrap justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <button onClick={() => team.crestImage && setIsCrestModalOpen(true)} className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0 border-2 border-slate-600 overflow-hidden">
                                {team.crestImage ? (
                                    <img src={team.crestImage} alt="Escudo del equipo" className="w-full h-full object-cover" />
                                ) : (
                                    <ShieldCheckIcon className="w-10 h-10 text-slate-600" />
                                )}
                            </button>
                             <input
                                type="file"
                                ref={crestInputRef}
                                onChange={handleCrestUpload}
                                accept="image/*"
                                className="hidden"
                            />
                            <div className="absolute bottom-0 -right-1 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={() => crestInputRef.current?.click()}
                                    className="bg-slate-600 hover:bg-slate-500 text-white p-1.5 rounded-full shadow-md"
                                    aria-label="Cambiar escudo"
                                >
                                    <UploadIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-amber-400">{team.name}</h2>
                            <p className="text-slate-400">{team.rosterName}</p>
                        </div>
                    </div>
                     <div className="text-right flex-shrink-0">
                        <p className="text-lg font-semibold text-slate-200">Tesorería: <span className="text-green-400">{team.treasury.toLocaleString()} M.O.</span></p>
                        <p className="text-lg font-semibold text-slate-200">Valor de Equipo (VE): <span className="text-sky-400">{teamValue.toLocaleString()}</span></p>
                    </div>
                </div>
            </div>

            {/* Team Assets */}
            <div className="bg-slate-900/70 p-4 rounded-lg border border-slate-700">
                <h3 className="text-lg font-semibold text-amber-400 mb-3">Activos del Equipo</h3>
                <div className="space-y-4">
                    {/* Rerolls */}
                    <div className="flex justify-between items-center flex-wrap gap-2">
                        <span className="text-slate-300">Segundas Oportunidades (0-8): <span className="font-bold text-white">{team.rerolls}</span></span>
                        <div className="flex gap-2">
                            <button onClick={handleBuyReroll} disabled={team.rerolls >= 8} className="bg-sky-600 text-white font-bold py-1 px-3 rounded-md shadow-md hover:bg-sky-500 transition-colors text-xs disabled:bg-slate-600 disabled:cursor-not-allowed">Comprar ({baseRoster.rerollCost.toLocaleString()})</button>
                            <button onClick={handleSellReroll} disabled={team.rerolls === 0} className="bg-rose-600 text-white font-bold py-1 px-3 rounded-md shadow-md hover:bg-rose-500 transition-colors text-xs disabled:bg-slate-600 disabled:cursor-not-allowed">Vender</button>
                        </div>
                    </div>
                    {/* Dedicated Fans */}
                    <div className="flex justify-between items-center flex-wrap gap-2">
                        <span className="text-slate-300">Hinchas (1-6): <span className="font-bold text-white">{team.dedicatedFans}</span></span>
                        <div className="flex gap-2">
                            <button onClick={handleBuyFan} disabled={team.dedicatedFans >= 6} className="bg-sky-600 text-white font-bold py-1 px-3 rounded-md shadow-md hover:bg-sky-500 transition-colors text-xs disabled:bg-slate-600 disabled:cursor-not-allowed">Comprar (10,000)</button>
                            <button onClick={handleSellFan} disabled={team.dedicatedFans <= 1} className="bg-rose-600 text-white font-bold py-1 px-3 rounded-md shadow-md hover:bg-rose-500 transition-colors text-xs disabled:bg-slate-600 disabled:cursor-not-allowed">Vender</button>
                        </div>
                    </div>
                     {/* Cheerleaders */}
                     <div className="flex justify-between items-center flex-wrap gap-2">
                        <span className="text-slate-300">Animadoras (0-12): <span className="font-bold text-white">{team.cheerleaders}</span></span>
                        <div className="flex gap-2">
                            <button onClick={handleBuyCheerleader} disabled={team.cheerleaders >= 12} className="bg-sky-600 text-white font-bold py-1 px-3 rounded-md shadow-md hover:bg-sky-500 transition-colors text-xs disabled:bg-slate-600 disabled:cursor-not-allowed">Comprar (10,000)</button>
                            <button onClick={handleSellCheerleader} disabled={team.cheerleaders === 0} className="bg-rose-600 text-white font-bold py-1 px-3 rounded-md shadow-md hover:bg-rose-500 transition-colors text-xs disabled:bg-slate-600 disabled:cursor-not-allowed">Vender</button>
                        </div>
                    </div>
                     {/* Assistant Coaches */}
                    <div className="flex justify-between items-center flex-wrap gap-2">
                        <span className="text-slate-300">Ayudantes de Entrenador (0-6): <span className="font-bold text-white">{team.assistantCoaches}</span></span>
                        <div className="flex gap-2">
                            <button onClick={handleBuyAssistantCoach} disabled={team.assistantCoaches >= 6} className="bg-sky-600 text-white font-bold py-1 px-3 rounded-md shadow-md hover:bg-sky-500 transition-colors text-xs disabled:bg-slate-600 disabled:cursor-not-allowed">Comprar (10,000)</button>
                            <button onClick={handleSellAssistantCoach} disabled={team.assistantCoaches === 0} className="bg-rose-600 text-white font-bold py-1 px-3 rounded-md shadow-md hover:bg-rose-500 transition-colors text-xs disabled:bg-slate-600 disabled:cursor-not-allowed">Vender</button>
                        </div>
                    </div>
                    {/* Apothecary */}
                    {baseRoster.apothecary === 'Sí' && (
                         <div className="flex justify-between items-center flex-wrap gap-2">
                            <span className="text-slate-300">Boticario (0-1): <span className={`font-bold ${team.apothecary ? 'text-green-400' : 'text-red-400'}`}>{team.apothecary ? 'Sí' : 'No'}</span></span>
                            <div className="flex gap-2">
                                <button onClick={handleBuyApothecary} disabled={team.apothecary} className="bg-emerald-600 text-white font-bold py-1 px-3 rounded-md shadow-md hover:bg-emerald-500 transition-colors text-xs disabled:bg-slate-600 disabled:cursor-not-allowed">Comprar (50,000)</button>
                                <button onClick={handleSellApothecary} disabled={!team.apothecary} className="bg-rose-600 text-white font-bold py-1 px-3 rounded-md shadow-md hover:bg-rose-500 transition-colors text-xs disabled:bg-slate-600 disabled:cursor-not-allowed">Vender</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Hire Players */}
            <div className="bg-slate-900/70 p-4 rounded-lg border border-slate-700">
                 <h3 className="text-lg font-semibold text-amber-400 mb-3">Fichar Jugadores</h3>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-700 text-amber-300">
                            <tr>
                                <th className="p-2">Posición</th>
                                <th className="p-2">Coste</th>
                                <th className="p-2">Plantilla</th>
                                <th className="p-2">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {baseRoster.roster.map(p => (
                                <tr key={p.position}>
                                    <td className="p-2 font-semibold text-slate-200">{p.position}</td>
                                    <td className="p-2">{p.cost.toLocaleString()}</td>
                                    <td className="p-2">{countPlayersByPosition(p.position)}/{p.qty.split('-')[1]}</td>
                                    <td className="p-2">
                                        <button onClick={() => handleHirePlayer(p)} className="bg-green-600 text-white font-bold py-1 px-3 rounded shadow hover:bg-green-500 transition-colors">Fichar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
             {/* Current Roster */}
            <div className="bg-slate-900/70 p-4 rounded-lg border border-slate-700">
                <h3 className="text-lg font-semibold text-amber-400 mb-3">
                    Plantilla Actual ({team.players.length}/16)
                    <span className={`ml-4 text-base ${starterCount > 11 ? 'text-red-400' : 'text-slate-400'}`}>
                        (Titulares: {starterCount}/11)
                    </span>
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-700 text-amber-300">
                            <tr>
                                <th className="p-2">Nombre</th>
                                <th className="p-2">Posición</th>
                                <th className="p-2 text-center">MV</th>
                                <th className="p-2 text-center">FU</th>
                                <th className="p-2 text-center">AG</th>
                                <th className="p-2 text-center">PS</th>
                                <th className="p-2 text-center">AR</th>
                                <th className="p-2">Alineación</th>
                                <th className="p-2 text-center">PE</th>
                                <th className="p-2">Habilidades</th>
                                <th className="p-2">Lesiones Perm.</th>
                                <th className="p-2">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {team.players.map(p => {
                                const allSkills = [
                                    ...(p.skills && p.skills.toLowerCase() !== 'ninguna' ? p.skills.split(', ').map(s => s.trim()) : []),
                                    ...p.gainedSkills
                                ];
                                return (
                                <tr key={p.id} className={p.isBenched ? 'opacity-60' : ''}>
                                    <td className="p-2 font-bold text-white min-w-[150px]" onDoubleClick={() => handleNameDoubleClick(p)}>
                                        {editingPlayerId === p.id ? (
                                            <input
                                                type="text"
                                                value={editingName}
                                                onChange={handleNameChange}
                                                onBlur={handleNameUpdate}
                                                onKeyDown={handleNameKeyDown}
                                                autoFocus
                                                className="bg-slate-900 border border-amber-400 rounded px-1 w-full"
                                            />
                                        ) : (
                                            <span>{p.customName}</span>
                                        )}
                                    </td>
                                    <td className="p-2">{p.position}</td>
                                    <td className="p-2 text-center">{p.stats.MV}</td>
                                    <td className="p-2 text-center">{p.stats.FU}</td>
                                    <td className="p-2 text-center">{p.stats.AG}</td>
                                    <td className="p-2 text-center">{p.stats.PS}</td>
                                    <td className="p-2 text-center">{p.stats.AR}</td>
                                    <td className="p-2">
                                        <button 
                                            onClick={() => togglePlayerBenched(p.id)}
                                            className={`text-xs font-bold py-1 px-3 rounded-full ${p.isBenched ? 'bg-slate-600 text-slate-200 hover:bg-slate-500' : 'bg-green-600 text-white hover:bg-green-500'}`}
                                        >
                                            {p.isBenched ? 'Banquillo' : 'Titular'}
                                        </button>
                                    </td>
                                    <td className="p-2 text-center">{p.spp}</td>
                                    <td className="p-2 text-xs min-w-[250px]">
                                        {allSkills.length > 0 ? (
                                            allSkills.map((skill, index) => (
                                                <React.Fragment key={`${p.id}-${skill}`}>
                                                    <button
                                                        onClick={() => handleSkillClick(skill)}
                                                        className="text-sky-400 hover:text-sky-300 hover:underline focus:outline-none"
                                                    >
                                                        {skill}
                                                    </button>
                                                    {index < allSkills.length - 1 && ', '}
                                                </React.Fragment>
                                            ))
                                        ) : 'Ninguna'}
                                    </td>
                                    <td className="p-2 text-xs text-red-400">{p.lastingInjuries.join(', ') || 'Ninguna'}</td>
                                    <td className="p-2">
                                        <div className="flex gap-2">
                                            <button onClick={() => setEditingPlayer(p)} className="text-sky-400 hover:underline text-xs">Editar</button>
                                            <button onClick={() => handleFirePlayer(p.id)} className="text-red-400 hover:underline text-xs">Despedir</button>
                                        </div>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>
            </div>


            {/* Danger Zone */}
            <div className="bg-red-900/30 p-4 rounded-lg border border-red-700">
                <h3 className="text-lg font-semibold text-red-400 mb-3">Zona Peligrosa</h3>
                <button onClick={handleDeleteTeam} className="bg-red-600 text-white font-bold py-2 px-4 rounded-md shadow-md hover:bg-red-500 transition-colors">
                    Disolver Equipo
                </button>
            </div>

            {editingPlayer && <PlayerModal player={editingPlayer} allSkills={skillsData} onSave={handleSavePlayer} onClose={() => setEditingPlayer(null)} />}
            {selectedSkillForModal && <SkillModal skill={selectedSkillForModal} onClose={() => setSelectedSkillForModal(null)} />}
            {isCrestModalOpen && team.crestImage && <ImageModal src={team.crestImage} alt={`Escudo de ${team.name}`} onClose={() => setIsCrestModalOpen(false)} />}


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
        </div>
    );
};