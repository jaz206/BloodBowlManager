

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
        <div className="p-4 sm:p-8 animate-fade-in-slow max-w-2xl mx-auto pb-20">
            {/* Header */}
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter border-l-4 border-primary pl-5">
                        Mis <span className="text-primary">Equipos</span>
                    </h2>
                    <p className="text-slate-500 text-xs mt-2 font-bold italic pl-6">
                        {teams.length} {teams.length === 1 ? 'equipo gestionado' : 'equipos gestionados'}
                    </p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="flex items-center gap-3 bg-primary text-background-dark font-black py-3 px-8 rounded-xl shadow-lg shadow-primary/10 hover:bg-primary-dark focus:outline-none focus:ring-4 focus:ring-primary/30 transform hover:scale-105 transition-all text-[10px] uppercase tracking-widest italic"
                >
                    <span className="material-symbols-outlined text-lg">add_circle</span>
                    Crear Equipo
                </button>
            </div>

            {/* Team Cards */}
            {teams.length > 0 ? (
                <div className="space-y-3 mb-10">
                    {teams.map(team => (
                        <div key={team.id || team.name} className="flex items-center gap-3">
                            <button
                                onClick={() => setSelectedTeamId(team.id!)}
                                className="flex-grow bg-card-dark/60 border border-border-gold/30 p-5 rounded-2xl shadow-md hover:border-primary/60 hover:bg-card-dark transition-all flex items-center gap-5 text-left group"
                            >
                                <div className="size-14 rounded-2xl bg-background-dark border border-border-gold/20 flex items-center justify-center flex-shrink-0 group-hover:border-primary/40 transition-colors overflow-hidden">
                                    {team.crestImage ? (
                                        <img src={team.crestImage} alt="Escudo" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="material-symbols-outlined text-slate-600 group-hover:text-primary transition-colors">shield</span>
                                    )}
                                </div>
                                <div className="flex-grow min-w-0">
                                    <p className="font-black text-white italic uppercase tracking-tight truncate text-lg group-hover:text-primary transition-colors">{team.name}</p>
                                    <p className="text-xs text-slate-500 font-bold truncate mt-0.5">{team.rosterName}</p>
                                </div>
                                <span className="material-symbols-outlined text-slate-700 group-hover:text-primary transition-all group-hover:translate-x-1">chevron_right</span>
                            </button>
                            <button
                                onClick={() => requestTeamDelete(team.id!)}
                                className="flex-shrink-0 bg-red-900/20 text-red-500/60 p-4 rounded-2xl border border-red-900/30 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all"
                                aria-label={`Eliminar equipo ${team.name}`}
                            >
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center p-14 mb-10 bg-card-dark/30 rounded-[2rem] border border-border-gold/20">
                    <span className="material-symbols-outlined text-5xl text-slate-700 mb-4 block">shield</span>
                    <p className="text-slate-500 font-bold italic text-sm">
                        Aún no has creado ningún equipo.
                    </p>
                    <p className="text-slate-600 text-xs mt-1">¡Pulsa Crear Equipo para empezar tu legado!</p>
                </div>
            )}

            {/* Import / Export */}
            <div className="pt-6 border-t border-white/5">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] italic mb-4">Gestión de Datos</h3>
                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={handleImportClick}
                        className="flex-1 flex items-center justify-center gap-2 bg-slate-800 border border-white/5 text-slate-300 font-black py-3 px-6 rounded-xl hover:border-primary/30 hover:text-white transition-all text-[10px] uppercase tracking-widest italic"
                        title="Importar equipos desde un archivo .json"
                    >
                        <UploadIcon />
                        Importar Equipos
                    </button>
                    <input type="file" accept=".json" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                    <button
                        onClick={() => teams.length > 0 ? setIsExportModalOpen(true) : alert('No hay equipos para exportar.')}
                        className="flex-1 flex items-center justify-center gap-2 bg-primary/10 border border-primary/20 text-primary font-black py-3 px-6 rounded-xl hover:bg-primary hover:text-black transition-all text-[10px] uppercase tracking-widest italic"
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