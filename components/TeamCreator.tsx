
import React, { useState, useRef } from 'react';
import { teamsData } from '../data/teams';
import type { ManagedTeam } from '../types';
import SparklesIcon from './icons/SparklesIcon';
import { generateRandomName as generateRandomNameLocally } from '../data/randomNames';
import UploadIcon from './icons/UploadIcon';

interface TeamCreatorProps {
    onTeamCreate: (team: Omit<ManagedTeam, 'id'>) => void;
    initialRosterName?: string | null;
}

const TeamCreator: React.FC<TeamCreatorProps> = ({ onTeamCreate, initialRosterName }) => {
    const [teamName, setTeamName] = useState('');
    const [rosterName, setRosterName] = useState(initialRosterName || teamsData[0].name);
    const [isGenerating, setIsGenerating] = useState(false);
    const [crestPreview, setCrestPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleGenerateName = async () => {
        if (!rosterName) {
            alert('Por favor, selecciona primero una facción.');
            return;
        }
        setIsGenerating(true);
        try {
            const response = await fetch('/api/generate-name', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ rosterName }),
            });

            if (!response.ok) {
                // Si la API falla, lanzamos un error para que el 'catch' lo recoja
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
            // Si la API segura falla, usamos el generador local como respaldo
            const fallbackName = generateRandomNameLocally(rosterName);
            setTeamName(fallbackName);
        } finally {
            setIsGenerating(false);
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

        const newTeam: Omit<ManagedTeam, 'id' | 'crestImage'> & { crestImage?: string } = {
            name: teamName.trim(),
            rosterName,
            treasury: 1000000,
            rerolls: 0,
            dedicatedFans: 1,
            cheerleaders: 0,
            assistantCoaches: 0,
            apothecary: false,
            players: [],
        };

        if (crestPreview) {
            newTeam.crestImage = crestPreview;
        }

        onTeamCreate(newTeam);
    };

    return (
        <div className="text-center max-w-lg mx-auto p-4 sm:p-8">
            <h2 className="text-3xl font-bold text-amber-400 mb-4">Crear Nuevo Equipo</h2>
            <p className="text-slate-400 mb-8">
                ¡Bienvenido, entrenador! Dale un nombre a tu equipo, elige tu facción y prepárate para la gloria. Empezarás con 1,000,000 M.O. para construir tu plantilla.
            </p>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex items-center gap-4">
                    <div 
                        className="w-24 h-24 rounded-full bg-slate-900/50 border-2 border-dashed border-slate-600 flex items-center justify-center cursor-pointer hover:border-amber-400 transition-colors flex-shrink-0"
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                            backgroundImage: crestPreview ? `url(${crestPreview})` : 'none',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }}
                    >
                        {!crestPreview && (
                             <div className="text-center">
                                <UploadIcon className="w-8 h-8 mx-auto text-slate-500" />
                                <span className="text-xs text-slate-500">Escudo</span>
                            </div>
                        )}
                    </div>
                     <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        accept="image/*"
                        className="hidden"
                    />
                    <div className="flex-grow">
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
                                disabled={isGenerating}
                                className="flex-shrink-0 bg-teal-600 text-white font-bold p-3 rounded-lg shadow-md hover:bg-teal-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-teal-400 disabled:bg-slate-500 disabled:cursor-wait"
                                aria-label="Generar nombre de equipo"
                            >
                                {isGenerating ? (
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
                </div>
                <div>
                    <label htmlFor="rosterName" className="block text-sm font-medium text-slate-300 mb-2 text-left">Facciones</label>
                    <select
                        id="rosterName"
                        value={rosterName}
                        onChange={(e) => setRosterName(e.target.value)}
                        className="w-full bg-slate-900 border-2 border-slate-600 rounded-lg py-3 px-4 text-white focus:ring-amber-500 focus:border-amber-500 shadow-sm"
                    >
                        {teamsData.map(team => (
                            <option key={team.name} value={team.name}>{team.name}</option>
                        ))}
                    </select>
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
