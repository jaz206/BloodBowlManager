

import React, { useState, useRef, useEffect } from 'react';
import { teamsData } from '../data/teams';
import type { ManagedTeam } from '../types';
import SparklesIcon from './icons/SparklesIcon';
import { generateRandomName as generateRandomNameLocally } from '../data/randomNames';
import UploadIcon from './icons/UploadIcon';
import ShieldCheckIcon from './icons/ShieldCheckIcon';

interface TeamCreatorProps {
    onTeamCreate: (team: Omit<ManagedTeam, 'id'>) => void;
    initialRosterName?: string | null;
}

const TeamCreator: React.FC<TeamCreatorProps> = ({ onTeamCreate, initialRosterName }) => {
    const [teamName, setTeamName] = useState('');
    const [isAutoCalculating, setIsAutoCalculating] = useState(false);
    const [isGeneratingName, setIsGeneratingName] = useState(false);
    const [crestPreview, setCrestPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [previewIndex, setPreviewIndex] = useState(() => {
        if (!initialRosterName) return 0;
        const index = teamsData.findIndex(t => t.name === initialRosterName);
        return index !== -1 ? index : 0;
    });

    // RosterName is now derived from the previewIndex state
    const rosterName = teamsData[previewIndex].name;

    const handleGenerateName = async () => {
        if (!rosterName) {
            alert('Por favor, selecciona primero una facción.');
            return;
        }
        setIsGeneratingName(true);
        try {
            const response = await fetch('/api/generate-name', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ rosterName }),
            });

            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }

            const data = await response.json();
            const generatedName = data.name;
            
            if (!generatedName) {
                throw new Error("La IA no generó un nombre válido.");
            }
            
            setTeamName(generatedName);

        } catch (error) {
            console.error("Error generating AI team name, using local fallback:", error);
            const fallbackName = generateRandomNameLocally(rosterName);
            setTeamName(fallbackName);
        } finally {
            setIsGeneratingName(false);
        }
    };
    
    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
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
                setCrestPreview(canvas.toDataURL('image/png'));
            };
            img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!teamName.trim() || !rosterName) {
            alert('Por favor, introduce un nombre para el equipo y selecciona una facción.');
            return;
        }

        const newTeam: Omit<ManagedTeam, 'id'> = {
            name: teamName.trim(),
            rosterName,
            treasury: isAutoCalculating ? 0 : 1000000,
            rerolls: 0,
            dedicatedFans: 1,
            cheerleaders: 0,
            assistantCoaches: 0,
            apothecary: false,
            players: [],
            isAutoCalculating: isAutoCalculating,
            ...(crestPreview && { crestImage: crestPreview }),
        };

        onTeamCreate(newTeam);
    };

    const handlePrevTeam = () => {
        setPreviewIndex(prev => (prev === 0 ? teamsData.length - 1 : prev - 1));
    };

    const handleNextTeam = () => {
        setPreviewIndex(prev => (prev === teamsData.length - 1 ? 0 : prev + 1));
    };

    const handleRosterSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const index = teamsData.findIndex(t => t.name === e.target.value);
        if (index !== -1) {
            setPreviewIndex(index);
        }
    };
    
    const teamToPreview = teamsData[previewIndex];

    return (
        <div className="text-center max-w-4xl mx-auto p-4 sm:p-8">
            <h2 className="text-3xl font-bold text-amber-400 mb-4">Crear Nuevo Equipo</h2>
            <p className="text-slate-400 mb-8">
                Explora las facciones, dale un nombre a tu equipo y prepárate para la gloria.
            </p>

             <div className="bg-slate-900/50 p-4 sm:p-6 rounded-lg border border-slate-700 mb-8">
                <h3 className="text-xl font-semibold text-amber-400 mb-4">Elige una Facción</h3>
                
                <div className="flex justify-between items-center mb-4">
                    <button onClick={handlePrevTeam} className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-md transition-colors">&larr; Anterior</button>
                    <h4 className="text-lg font-bold text-white text-center truncate px-2">{teamToPreview.name}</h4>
                    <button onClick={handleNextTeam} className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-md transition-colors">Siguiente &rarr;</button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 flex flex-col items-center">
                        <img src={teamToPreview.image} alt={`Arte de ${teamToPreview.name}`} className="w-full h-auto object-cover rounded-lg shadow-lg border-2 border-slate-700 mb-4" />
                        <div className="text-sm text-slate-300 space-y-2 text-left bg-slate-800 p-3 rounded-md w-full">
                            <p><span className='font-bold text-slate-400'>Coste Reroll:</span> {teamToPreview.rerollCost.toLocaleString()} M.O.</p>
                            <p><span className='font-bold text-slate-400'>Rango:</span> {teamToPreview.tier}</p>
                            <p><span className='font-bold text-slate-400'>Boticario:</span> {teamToPreview.apothecary}</p>
                            <p><span className='font-bold text-slate-400'>Reglas:</span> {teamToPreview.specialRules}</p>
                        </div>
                    </div>
                    <div className="lg:col-span-2 max-h-80 overflow-y-auto pr-2 bg-slate-800 rounded-md p-2 border border-slate-700">
                        <table className="w-full text-left text-xs whitespace-nowrap">
                            <thead className="bg-slate-700 text-amber-300 sticky top-0">
                                <tr>
                                    <th className="p-2">Posición</th>
                                    <th className="p-2 text-center">Cant.</th>
                                    <th className="p-2 text-center">MV/FU/AG/PS/AR</th>
                                    <th className="p-2">Habilidades</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {teamToPreview.roster.map(player => (
                                    <tr key={player.position}>
                                        <td className="p-2 font-semibold text-slate-200">{player.position}</td>
                                        <td className="p-2 text-center">{player.qty}</td>
                                        <td className="p-2 font-mono text-center">{player.stats.MV}/{player.stats.FU}/{player.stats.AG}/{player.stats.PS}/{player.stats.AR}</td>
                                        <td className="p-2 whitespace-normal">{player.skills}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto">
                 <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2 text-left">Escudo del Equipo (Opcional)</label>
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-24 h-24 rounded-full bg-slate-900/50 border-2 border-dashed border-slate-600 flex items-center justify-center flex-shrink-0 relative overflow-hidden group hover:border-amber-400 transition-colors"
                        >
                            {crestPreview ? (
                                <img src={crestPreview} alt="Previsualización del escudo" className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-center p-2 text-slate-500">
                                    <UploadIcon className="w-8 h-8 mx-auto" />
                                    <span className="text-xs mt-1">Subir Imagen</span>
                                </div>
                            )}
                             <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                 <p className="text-xs font-bold">Cambiar</p>
                             </div>
                        </button>
                        <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                         <p className="text-slate-400 text-sm flex-1">
                           Sube una imagen para tu equipo. <br/>
                           <span className="text-xs">(Recomendado: 200x200px)</span>
                         </p>
                    </div>
                </div>
                 <div>
                    <label htmlFor="teamName" className="block text-sm font-medium text-slate-300 mb-2 text-left">Nombre del Equipo</label>
                    <div className="flex items-center gap-2">
                        <input
                            id="teamName"
                            type="text"
                            value={teamName}
                            onChange={(e) => setTeamName(e.target.value)}
                            placeholder="Ej: Los Rompehuesos"
                            className="flex-grow w-full bg-slate-900 border-2 border-slate-600 rounded-lg py-3 px-4 text-white placeholder-slate-500 focus:ring-amber-500 focus:border-amber-500 shadow-sm"
                            required
                        />
                        <button
                            type="button"
                            onClick={handleGenerateName}
                            disabled={isGeneratingName}
                            className="flex-shrink-0 bg-teal-600 text-white font-bold p-3 rounded-lg shadow-md hover:bg-teal-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-teal-400 disabled:bg-slate-500 disabled:cursor-wait"
                            aria-label="Generar nombre de equipo"
                        >
                            {isGeneratingName ? (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <SparklesIcon className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                </div>
                <div>
                    <label htmlFor="rosterName" className="block text-sm font-medium text-slate-300 mb-2 text-left">Facción seleccionada</label>
                    <select
                        id="rosterName"
                        value={rosterName}
                        onChange={handleRosterSelectChange}
                        className="w-full bg-slate-900 border-2 border-slate-600 rounded-lg py-3 px-4 text-white focus:ring-amber-500 focus:border-amber-500 shadow-sm"
                    >
                        {teamsData.map(team => (
                            <option key={team.name} value={team.name}>{team.name}</option>
                        ))}
                    </select>
                </div>
                
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 text-left">
                    <div className="flex items-center">
                        <input
                            id="auto-calculate"
                            type="checkbox"
                            checked={isAutoCalculating}
                            onChange={(e) => setIsAutoCalculating(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                        />
                        <label htmlFor="auto-calculate" className="ml-3 block text-sm font-medium text-slate-200">
                           Modo Auto-cálculo (para equipos existentes)
                        </label>
                    </div>
                    <p className="text-xs text-slate-400 mt-2 ml-7">
                        {isAutoCalculating
                            ? "El equipo empezará con 0 M.O. y sin límite de presupuesto. El valor del equipo se calculará a medida que fiches."
                            : "El equipo empezará con un presupuesto estándar de 1,000,000 M.O."
                        }
                    </p>
                </div>

                <button
                    type="submit"
                    className="w-full bg-amber-500 text-slate-900 font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-500/50 transform hover:scale-105 transition-all duration-200"
                >
                    ¡A Jugar!
                </button>
            </form>
        </div>
    );
};

export default TeamCreator;
