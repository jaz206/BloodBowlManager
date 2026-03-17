

import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { ManagedTeam } from '../../types';
import TeamCreator from './CreateTeamPage';
import { TeamDashboard } from './TeamDetailPage';
import { calculateTeamValue } from '../../utils/teamUtils';
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


const calculateTV = (team: ManagedTeam) => calculateTeamValue(team);

interface TeamManagerProps {
    teams: ManagedTeam[];
    onTeamCreate: (team: Omit<ManagedTeam, 'id'>, index?: number) => void;
    onTeamUpdate: (team: ManagedTeam) => void;
    onTeamDelete: (teamId: string) => void;
    requestedRoster?: string | null;
    onRosterRequestHandled?: () => void;
    isGuest: boolean;
    matchReports: any[];
}

const TeamManager: React.FC<TeamManagerProps> = ({ teams, onTeamCreate, onTeamUpdate, onTeamDelete, requestedRoster, onRosterRequestHandled = () => { }, isGuest, matchReports }) => {
    const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(requestedRoster !== null && requestedRoster !== undefined);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [selectedTeamsForExport, setSelectedTeamsForExport] = useState<string[]>([]);
    const [initialRosterForCreation, setInitialRosterForCreation] = useState<string | null>(requestedRoster ?? null);
    const [confirmation, setConfirmation] = useState<{ title: string; message: string; onConfirm: () => void; type?: 'danger' | 'info' } | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 4000);
    };

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

    const handleTeamCreate = async (newTeam: ManagedTeam) => {
        const teamNameExists = teams.some(team => team.name.toLowerCase() === newTeam.name.toLowerCase());
        if (teamNameExists) {
            setConfirmation({ title: 'Nombre en uso', message: 'Ya existe un equipo con este nombre en el Gremio. Por favor, elige otro.', onConfirm: () => setConfirmation(null), type: 'info' });
            return;
        }
        const { id, ...teamData } = newTeam;
        try {
            await onTeamCreate(teamData);
            setIsCreating(false);
            showToast('¡Equipo creado y registrado en el Gremio!');
        } catch (error) {
            console.error("Guild: Error al crear el equipo:", error);
            showToast('Error crítico: El equipo no se ha podido guardar en el Gremio.');
        }
    };

    const requestTeamDelete = (teamId: string) => {
        const teamToDelete = teams.find(t => t.id === teamId);
        if (teamToDelete) {
            setConfirmation({
                title: '¿Disolver equipo?',
                message: `"${teamToDelete.name}" será eliminado permanentemente. Esta acción no puede deshacerse.`,
                type: 'danger',
                onConfirm: () => {
                    onTeamDelete(teamId);
                    setConfirmation(null);
                    if (selectedTeamId === teamId) setSelectedTeamId(null);
                    showToast('El equipo ha sido disuelto.');
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

                let importResult = '';
                if (newTeamsCount > 0) importResult += `${newTeamsCount} equipos importados con éxito.`;
                if (skippedTeams.length > 0) importResult += `${skippedTeams.length} duplicados omitidos.`;
                if (!importResult) importResult = 'No se importaron nuevos equipos. Archivo vacío o duplicados.';
                showToast(importResult.trim());


            } catch (error) {
                console.error("Error importing teams:", error);
                showToast(`Error al importar: ${error instanceof Error ? error.message : 'Error desconocido'}`);
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
            showToast('Selecciona al menos un equipo para exportar.');
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
                    matchReports={matchReports}
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
            <div className="p-2 sm:p-4 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <button
                    onClick={handleCancelCreation}
                    className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px] mb-2 hover:underline group italic transition-all"
                >
                    <span className="material-symbols-outlined font-bold transform group-hover:-translate-x-1 transition-transform">arrow_back</span>
                    Volver al Gremio
                </button>
                <TeamCreator onTeamCreate={handleTeamCreate} initialRosterName={initialRosterForCreation} />
            </div>
        );
    }

    return (
        <main className="px-4 lg:px-40 py-8 animate-fade-in-slow">
            <div className="max-w-[1000px] mx-auto">
                {/* Title Section */}
                <div className="flex flex-wrap items-center justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-slate-100 text-4xl font-black leading-tight tracking-[-0.033em] uppercase italic">
                            GESTIÓN DE <span className="text-primary italic">EQUIPOS</span>
                        </h1>
                        <p className="text-primary/70 text-sm mt-1 font-medium italic">Administra tus plantillas de Blood Bowl</p>
                    </div>
                    <button
                        onClick={() => setIsCreating(true)}
                        className="flex min-w-[120px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-xl h-12 px-8 bg-primary text-background-dark text-xs font-black leading-normal tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.05] transition-all uppercase italic"
                    >
                        <span className="material-symbols-outlined font-bold">add_circle</span>
                        <span className="truncate">CREAR EQUIPO</span>
                    </button>
                </div>

                {/* Team List */}
                <div className="flex flex-col gap-5">
                    {teams.length > 0 ? (
                        teams.map(team => {
                            const tv = calculateTV(team);
                            const hasInjuries = team.players.some(p => p.lastingInjuries && p.lastingInjuries.length > 0);

                            return (
                                <div key={team.id || team.name} className="flex items-center gap-6 rounded-2xl bg-primary/5 border border-primary/10 p-5 hover:border-primary/40 hover:bg-primary/[0.08] transition-all group relative overflow-hidden">
                                    {/* Background Decor */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[40px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

                                    {/* Icon / Crest */}
                                    <div className="size-20 lg:size-24 shrink-0 bg-background-dark rounded-xl flex items-center justify-center border border-primary/20 overflow-hidden relative shadow-2xl">
                                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-60"></div>
                                        {team.crestImage ? (
                                            <img src={team.crestImage} alt="" className="w-full h-full object-cover relative z-10" />
                                        ) : (
                                            <span className="material-symbols-outlined text-primary text-4xl z-10 font-light opacity-80 group-hover:scale-110 transition-transform">
                                                {hasInjuries ? 'skull' : 'shield'}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex flex-1 flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                                        <div className="flex flex-col gap-1.5 min-w-0">
                                            <div className="flex items-center gap-3">
                                                <p className="text-slate-100 text-xl font-black leading-tight uppercase italic tracking-tighter truncate group-hover:text-primary transition-colors">
                                                    {team.name}
                                                </p>
                                                <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-black tracking-[0.1em] uppercase shadow-sm ${hasInjuries
                                                    ? 'bg-red-500/20 text-red-500 border border-red-500/20'
                                                    : 'bg-primary/20 text-primary border border-primary/20'
                                                    }`}>
                                                    {hasInjuries ? 'Lesionado' : 'Activo'}
                                                </span>
                                            </div>
                                            <p className="text-primary/80 text-xs font-black tracking-widest uppercase italic opacity-70">
                                                {team.rosterName}
                                            </p>
                                            <div className="flex flex-wrap items-center gap-5 mt-2">
                                                <div className="flex items-center gap-2 text-slate-500 group-hover:text-slate-400 transition-colors">
                                                    <span className="material-symbols-outlined text-sm text-primary/60">payments</span>
                                                    <span className="text-[10px] font-black uppercase tracking-tighter">TV: {tv.toLocaleString()}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-slate-500 group-hover:text-slate-400 transition-colors">
                                                    <span className="material-symbols-outlined text-sm text-primary/60">groups</span>
                                                    <span className="text-[10px] font-black uppercase tracking-tighter">{team.players.length} Jugadores</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            {/* We use DETALLES as the main button, and a separate delete */}
                                            <button
                                                onClick={() => setSelectedTeamId(team.id!)}
                                                className="flex items-center justify-center h-11 px-6 rounded-xl bg-primary/10 text-primary border border-primary/20 font-black text-[10px] gap-3 hover:bg-primary hover:text-background-dark transition-all uppercase tracking-widest italic shadow-lg shadow-primary/5"
                                            >
                                                <span>DETALLES</span>
                                                <span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
                                            </button>

                                            <div className="h-8 w-px bg-primary/10 mx-2 hidden lg:block"></div>

                                            <button
                                                onClick={() => requestTeamDelete(team.id!)}
                                                className="flex items-center justify-center h-11 w-11 rounded-xl bg-red-500/10 text-red-500 border border-red-500/10 hover:bg-red-500 hover:text-white transition-all shadow-lg"
                                                aria-label="Eliminar equipo"
                                            >
                                                <span className="material-symbols-outlined text-lg">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center p-20 bg-primary/5 rounded-[2.5rem] border border-primary/10 shadow-inner group">
                            <span className="material-symbols-outlined text-6xl text-primary/20 mb-6 block group-hover:scale-110 transition-transform duration-700">stadium</span>
                            <p className="text-slate-100 font-black italic uppercase tracking-widest text-sm mb-2">Sin equipos en el Gremio</p>
                            <p className="text-slate-500 text-xs font-medium italic">¡Pulsa "Crear Equipo" para empezar tu legado!</p>
                        </div>
                    )}
                </div>

                {/* Data Management Section */}
                <div className="mt-16 pt-10 border-t border-primary/10 relative">
                    <div className="absolute top-0 left-0 w-40 h-1 bg-gradient-to-r from-primary to-transparent -translate-y-px"></div>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-10">
                        <div className="flex flex-col gap-2">
                            <h3 className="text-white font-black text-xl uppercase italic tracking-tighter">Gestión de <span className="text-primary italic">Datos</span></h3>
                            <p className="text-slate-500 text-sm font-medium italic">Transfiere tus equipos entre diferentes dispositivos o haz copias de seguridad.</p>
                        </div>
                        <div className="flex gap-4 w-full sm:w-auto">
                            <button
                                onClick={() => handleImportClick()}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-3 h-12 px-8 rounded-xl bg-slate-800 text-slate-100 hover:bg-slate-700 border border-white/5 transition-all text-[10px] font-black uppercase tracking-widest italic"
                            >
                                <span className="material-symbols-outlined text-primary font-bold">upload</span>
                                IMPORTAR
                            </button>
                            <input type="file" accept=".json" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                            <button
                                onClick={() => teams.length > 0 ? setIsExportModalOpen(true) : showToast('No hay equipos para exportar.')}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-3 h-12 px-8 rounded-xl bg-slate-800 text-slate-100 hover:bg-slate-700 border border-white/5 transition-all text-[10px] font-black uppercase tracking-widest italic"
                            >
                                <span className="material-symbols-outlined text-primary font-bold">download</span>
                                EXPORTAR
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {isExportModalOpen && (
                <div
                    className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[200] p-4 animate-fade-in-fast"
                    onClick={() => setIsExportModalOpen(false)}
                >
                    <div className="bg-background-dark/95 border border-primary/20 rounded-[2.5rem] shadow-2xl max-w-lg w-full transform animate-slide-in-up overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="p-8 border-b border-primary/10 flex items-center justify-between">
                            <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Exportar <span className="text-primary">Equipos</span></h2>
                            <button onClick={() => setIsExportModalOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-8 max-h-[50vh] overflow-y-auto space-y-4">
                            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                                <input
                                    type="checkbox"
                                    id="select-all-export"
                                    className="h-5 w-5 rounded border-primary/20 text-primary focus:ring-primary bg-transparent"
                                    checked={teams.length > 0 && selectedTeamsForExport.length === teams.length}
                                    onChange={(e) => handleSelectAllForExport(e.target.checked)}
                                />
                                <label htmlFor="select-all-export" className="text-xs font-black text-slate-300 uppercase italic tracking-widest cursor-pointer">
                                    Seleccionar Todos
                                </label>
                            </div>
                            <div className="grid gap-2">
                                {teams.map(team => (
                                    <div key={team.id} className="flex items-center gap-3 bg-black/40 p-4 rounded-xl border border-white/5 hover:border-primary/20 transition-all">
                                        <input
                                            type="checkbox"
                                            id={`export-${team.id}`}
                                            className="h-5 w-5 rounded border-primary/20 text-primary focus:ring-primary bg-transparent"
                                            checked={selectedTeamsForExport.includes(team.id!)}
                                            onChange={() => handleExportSelectionChange(team.id!)}
                                        />
                                        <label htmlFor={`export-${team.id}`} className="text-sm font-black text-slate-200 italic uppercase cursor-pointer">
                                            {team.name}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="p-8 bg-black/40 border-t border-primary/10 flex gap-4">
                            <button onClick={() => setIsExportModalOpen(false)} className="flex-1 py-4 px-6 rounded-2xl bg-white/5 text-slate-400 font-black text-[10px] uppercase tracking-widest italic hover:bg-white/10 transition-all">
                                Cancelar
                            </button>
                            <button onClick={triggerExport} className="flex-1 py-4 px-6 rounded-2xl bg-primary text-background-dark font-black text-[10px] uppercase tracking-widest italic shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                                Exportar Selección
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {confirmation && (
                <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-[300] p-4">
                    <div className="bg-background-dark border border-white/10 p-10 rounded-[2.5rem] shadow-2xl max-w-sm w-full text-center space-y-6">
                        <div className={`size-16 rounded-3xl flex items-center justify-center mx-auto ${confirmation.type === 'danger' ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary'
                            }`}>
                            <span className="material-symbols-outlined text-4xl">
                                {confirmation.type === 'danger' ? 'warning' : 'info'}
                            </span>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">{(confirmation as any).title || '¿Estás seguro?'}</h3>
                            <p className="text-slate-400 text-sm font-medium italic leading-relaxed">{confirmation.message}</p>
                        </div>
                        <div className="flex flex-col gap-3">
                            {confirmation.type === 'danger' && (
                                <button onClick={confirmation.onConfirm} className="w-full py-4 bg-red-600 text-white font-black text-xs uppercase tracking-widest italic rounded-2xl shadow-xl shadow-red-600/10 hover:bg-red-500 transition-all">
                                    CONFIRMAR
                                </button>
                            )}
                            {confirmation.type !== 'danger' && (
                                <button onClick={confirmation.onConfirm} className="w-full py-4 bg-primary text-background-dark font-black text-xs uppercase tracking-widest italic rounded-2xl shadow-xl shadow-primary/10 hover:bg-primary/90 transition-all">
                                    ENTENDIDO
                                </button>
                            )}
                            <button onClick={() => setConfirmation(null)} className="w-full py-4 bg-white/5 text-slate-400 font-black text-xs uppercase tracking-widest italic rounded-2xl hover:bg-white/10 transition-all">
                                CANCELAR
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {toastMessage && (
                <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[400] animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-zinc-900 border border-white/10 px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 backdrop-blur-xl">
                        <span className="material-symbols-outlined text-primary font-bold">check_circle</span>
                        <p className="text-white font-bold text-sm">{toastMessage}</p>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes fade-in-slow { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in-slow { animation: fade-in-slow 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                @keyframes fade-in-fast { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slide-in-up { from { transform: translateY(40px) scale(0.95); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
                .animate-fade-in-fast { animation: fade-in-fast 0.3s ease-out forwards; }
                .animate-slide-in-up { animation: slide-in-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            `}</style>
        </main>
    );
};

export default TeamManager;
