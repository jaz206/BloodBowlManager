

import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { ManagedTeam } from '../../types';
import TeamCreator from './CreateTeamPage';
import { TeamDashboard } from './TeamDetailPage';
import UploadIcon from '../../components/icons/UploadIcon';
import DownloadIcon from '../../components/icons/DownloadIcon';
import ShieldCheckIcon from '../../components/icons/ShieldCheckIcon';
import TrashIcon from '../../components/icons/TrashIcon';

// Helper to create a plain JS object from a ManagedTeam, suitable for JSON stringification.
// This prevents "circular structure" errors from Firestore objects.
const sanitizeTeamForExport = (team: ManagedTeam): Omit<ManagedTeam, 'id'> => {
    return {
        name: team.name,
        rosterName: team.rosterName,
        treasury: team.treasury,
        rerolls: team.rerolls,
        dedicatedFans: team.dedicatedFans,
        cheerleaders: team.cheerleaders,
        assistantCoaches: team.assistantCoaches,
        apothecary: team.apothecary,
        crestImage: team.crestImage,
        players: team.players.map(p => {
            const { stats, sppActions, gainedSkills, lastingInjuries, ...rest } = p;
            return {
                ...rest,
                stats: { ...stats },
                sppActions: sppActions ? { ...sppActions } : undefined,
                gainedSkills: [...gainedSkills],
                lastingInjuries: [...lastingInjuries]
            };
        })
    };
};


interface TeamManagerProps {
    teams: ManagedTeam[];
    onTeamCreate: (team: Omit<ManagedTeam, 'id'>, index?: number) => void;
    onTeamUpdate: (team: ManagedTeam) => void;
    onTeamDelete: (teamId: string) => void;
    requestedRoster?: string | null;
    onRosterRequestHandled?: () => void;
    isGuest: boolean;
}

const TeamManager: React.FC<TeamManagerProps> = ({ teams, onTeamCreate, onTeamUpdate, onTeamDelete, requestedRoster, onRosterRequestHandled = () => { }, isGuest }) => {
    const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(requestedRoster !== null && requestedRoster !== undefined);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [selectedTeamsForExport, setSelectedTeamsForExport] = useState<string[]>([]);
    const [initialRosterForCreation, setInitialRosterForCreation] = useState<string | null>(requestedRoster ?? null);
    const [confirmation, setConfirmation] = useState<{ message: string; onConfirm: () => void; } | null>(null);

    const selectedTeam = useMemo(() => {
        if (!selectedTeamId) return null;
        return teams.find(t => t.id === selectedTeamId) || null;
    }, [selectedTeamId, teams]);

    useEffect(() => {
        if (requestedRoster !== null && requestedRoster !== undefined) {
            setInitialRosterForCreation(requestedRoster);
            setIsCreating(true);
            onRosterRequestHandled();
        }
    }, [requestedRoster, onRosterRequestHandled]);

    const handleTeamCreate = (newTeam: ManagedTeam) => {
        const teamNameExists = teams.some(team => team.name.toLowerCase() === newTeam.name.toLowerCase());
        if (teamNameExists) {
            alert('Ya existe un equipo con este nombre. Por favor, elige otro.');
            return;
        }
        const { id, ...teamData } = newTeam;
        onTeamCreate(teamData);
        setIsCreating(false);
    };

    const requestTeamDelete = (teamId: string) => {
        const teamToDelete = teams.find(t => t.id === teamId);
        if (teamToDelete) {
            setConfirmation({
                message: `¿Estás seguro de que quieres disolver el equipo "${teamToDelete.name}"? Esta acción no se puede deshacer.`,
                onConfirm: () => {
                    onTeamDelete(teamId);
                    setConfirmation(null);
                    if (selectedTeamId === teamId) {
                        setSelectedTeamId(null);
                    }
                }
            });
        }
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') throw new Error("El archivo no es texto");
                const importedTeams = JSON.parse(text);

                if (!Array.isArray(importedTeams) || (importedTeams.length > 0 && (!importedTeams[0].name || !importedTeams[0].rosterName))) {
                    throw new Error("El archivo no parece contener una lista de equipos válida.");
                }

                const existingTeamNames = new Set(teams.map(t => t.name.toLowerCase()));
                let newTeamsCount = 0;
                const skippedTeams: string[] = [];

                for (const [index, importedTeam] of (importedTeams as ManagedTeam[]).entries()) {
                    if (existingTeamNames.has(importedTeam.name.toLowerCase())) {
                        skippedTeams.push(importedTeam.name);
                    } else {
                        const { id, ...teamData } = importedTeam;
                        onTeamCreate(teamData, index);
                        newTeamsCount++;
                    }
                }

                let alertMessage = '';
                if (newTeamsCount > 0) {
                    alertMessage += `${newTeamsCount} equipos importados con éxito.\n`;
                }
                if (skippedTeams.length > 0) {
                    alertMessage += `${skippedTeams.length} equipos omitidos por tener nombres duplicados: ${skippedTeams.join(', ')}.`;
                }
                if (!alertMessage) {
                    alertMessage = "No se importaron nuevos equipos. Puede que ya existan todos o que el archivo esté vacío.";
                }
                alert(alertMessage.trim());


            } catch (error) {
                console.error("Error importing teams:", error);
                alert(`Error al importar el archivo: ${error instanceof Error ? error.message : 'Error desconocido'}`);
            } finally {
                if (event.target) {
                    event.target.value = '';
                }
            }
        };
        reader.readAsText(file);
    };

    const handleExportSelectionChange = (teamId: string) => {
        setSelectedTeamsForExport(prev =>
            prev.includes(teamId)
                ? prev.filter(id => id !== teamId)
                : [...prev, teamId]
        );
    };

    const handleSelectAllForExport = (select: boolean) => {
        if (select) {
            setSelectedTeamsForExport(teams.map(t => t.id!).filter(Boolean));
        } else {
            setSelectedTeamsForExport([]);
        }
    };

    const triggerExport = () => {
        const teamsToExport = teams.filter(team => team.id && selectedTeamsForExport.includes(team.id));

        if (teamsToExport.length === 0) {
            alert("Selecciona al menos un equipo para exportar.");
            return;
        }

        const sanitizedData = teamsToExport.map(sanitizeTeamForExport);
        const dataStr = JSON.stringify(sanitizedData, null, 2);

        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const exportFileDefaultName = teamsToExport.length > 1
            ? 'bloodbowl_teams.json'
            : `${teamsToExport[0].name.replace(/ /g, '_')}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', url);
        linkElement.setAttribute('download', exportFileDefaultName);
        document.body.appendChild(linkElement);
        linkElement.click();
        document.body.removeChild(linkElement);
        URL.revokeObjectURL(url);

        setIsExportModalOpen(false);
        setSelectedTeamsForExport([]);
    };

    const handleCancelCreation = () => {
        setIsCreating(false);
        setInitialRosterForCreation(null);
    };

    if (selectedTeam) {
        return (
            <div className="p-2 sm:p-4 animate-fade-in-slow">
                <TeamDashboard
                    team={selectedTeam}
                    onUpdate={onTeamUpdate}
                    onDeleteRequest={requestTeamDelete}
                    onBack={() => setSelectedTeamId(null)}
                    isGuest={isGuest}
                />
                <style>{`
                    @keyframes fade-in-slow {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                    .animate-fade-in-slow {
                        animation: fade-in-slow 0.5s ease-out forwards;
                    }
                `}</style>
            </div>
        );
    }

    if (isCreating) {
        return (
            <div className="p-2 sm:p-4 animate-fade-in-slow">
                <TeamCreator onTeamCreate={handleTeamCreate} initialRosterName={initialRosterForCreation} />
                <button onClick={handleCancelCreation} className="text-amber-400 hover:underline mt-4">Volver a la lista</button>
                <style>{`
                    @keyframes fade-in-slow {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                    .animate-fade-in-slow {
                        animation: fade-in-slow 0.5s ease-out forwards;
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-8 animate-fade-in-slow text-center max-w-md mx-auto">
            <h2 className="text-3xl font-bold text-amber-400 mb-4">Mis Equipos</h2>

            {teams.length > 0 ? (
                <div className="space-y-3 mb-6">
                    {teams.map(team => (
                        <div key={team.id || team.name} className="w-full flex items-center gap-2">
                            <button
                                onClick={() => setSelectedTeamId(team.id!)}
                                className="flex-grow bg-slate-700/50 text-slate-200 p-4 rounded-lg shadow-md hover:bg-slate-700 hover:text-white transition-all duration-200 flex items-center gap-4 text-left"
                            >
                                {team.crestImage ? (
                                    <img src={team.crestImage} alt="Escudo del equipo" className="w-10 h-10 rounded-full object-cover flex-shrink-0 bg-slate-900" />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0">
                                        <ShieldCheckIcon className="w-6 h-6 text-slate-600" />
                                    </div>
                                )}
                                <div className="flex-grow min-w-0">
                                    <p className="font-semibold truncate">{team.name}</p>
                                    <p className="text-xs text-slate-400 truncate">{team.rosterName}</p>
                                </div>
                            </button>
                            <button
                                onClick={() => requestTeamDelete(team.id!)}
                                className="flex-shrink-0 bg-red-800/50 text-red-400 p-4 rounded-lg shadow-md hover:bg-red-800 hover:text-white transition-colors"
                                aria-label={`Eliminar equipo ${team.name}`}
                            >
                                <TrashIcon className="w-6 h-6" />
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center p-8 mb-6 bg-slate-900/50 rounded-lg border border-slate-700">
                    <p className="text-slate-400">
                        Aún no has creado ningún equipo. ¡Usa los botones de abajo para empezar!
                    </p>
                </div>
            )}

            <button
                onClick={() => setIsCreating(true)}
                className="w-full bg-amber-500 text-slate-900 font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-500/50 transform hover:scale-105 transition-all duration-200"
            >
                Crear Nuevo Equipo
            </button>
            <div className="mt-8 pt-6 border-t border-slate-700">
                <h3 className="text-xl font-semibold text-slate-300 mb-4">Opciones de Datos</h3>
                <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={handleImportClick}
                        className="flex-1 flex items-center justify-center gap-2 bg-slate-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-slate-500 transition-colors"
                        title="Importar equipos desde un archivo .json"
                    >
                        <UploadIcon />
                        Importar Equipos
                    </button>
                    <input type="file" accept=".json" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                    <button
                        onClick={() => teams.length > 0 ? setIsExportModalOpen(true) : alert("No hay equipos para exportar.")}
                        className="flex-1 flex items-center justify-center gap-2 bg-sky-700 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-sky-600 transition-colors"
                        title="Exportar equipos a un archivo .json"
                    >
                        <DownloadIcon />
                        Exportar Equipos
                    </button>
                </div>
            </div>

            {isExportModalOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in-fast"
                    onClick={() => setIsExportModalOpen(false)}
                    role="dialog" aria-modal="true"
                >
                    <div className="bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-w-lg w-full transform animate-slide-in-up" onClick={e => e.stopPropagation()}>
                        <div className="p-4 border-b border-slate-700">
                            <h2 className="text-xl font-bold text-amber-400">Seleccionar Equipos para Exportar</h2>
                        </div>
                        <div className="p-5 max-h-[60vh] overflow-y-auto">
                            <div className="flex items-center mb-4">
                                <input
                                    type="checkbox"
                                    id="select-all-export"
                                    className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                                    checked={teams.length > 0 && selectedTeamsForExport.length === teams.length}
                                    onChange={(e) => handleSelectAllForExport(e.target.checked)}
                                />
                                <label htmlFor="select-all-export" className="ml-3 block text-sm font-medium text-slate-300">
                                    Seleccionar Todos
                                </label>
                            </div>
                            <div className="space-y-2">
                                {teams.map(team => (
                                    <div key={team.id} className="flex items-center bg-slate-700/50 p-3 rounded-md">
                                        <input
                                            type="checkbox"
                                            id={`export-${team.id}`}
                                            className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                                            checked={selectedTeamsForExport.includes(team.id!)}
                                            onChange={() => handleExportSelectionChange(team.id!)}
                                        />
                                        <label htmlFor={`export-${team.id}`} className="ml-3 block text-sm font-medium text-slate-200">
                                            {team.name}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="p-4 bg-slate-900/50 border-t border-slate-700 flex justify-end gap-3">
                            <button type="button" onClick={() => setIsExportModalOpen(false)} className="bg-slate-600 text-white font-bold py-2 px-6 rounded-md shadow-md hover:bg-slate-500 transition-colors">
                                Cancelar
                            </button>
                            <button type="button" onClick={triggerExport} className="bg-amber-500 text-slate-900 font-bold py-2 px-6 rounded-md shadow-md hover:bg-amber-400 transition-colors">
                                Exportar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {confirmation && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 p-6 rounded-lg shadow-xl border border-slate-700 max-w-sm w-full">
                        <h3 className="text-lg font-bold text-amber-400 mb-4">¿Estás seguro?</h3>
                        <p className="text-slate-300 mb-6">{confirmation.message}</p>
                        <div className="flex justify-end gap-4">
                            <button onClick={() => setConfirmation(null)} className="bg-slate-600 text-white font-bold py-2 px-4 rounded">Cancelar</button>
                            <button onClick={confirmation.onConfirm} className="bg-red-600 text-white font-bold py-2 px-4 rounded">Confirmar</button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes fade-in-slow {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in-slow {
                    animation: fade-in-slow 0.5s ease-out forwards;
                }
                @keyframes fade-in-fast { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slide-in-up { from { transform: translateY(20px) scale(0.98); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
                .animate-fade-in-fast { animation: fade-in-fast 0.2s ease-out forwards; }
                .animate-slide-in-up { animation: slide-in-up 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default TeamManager;