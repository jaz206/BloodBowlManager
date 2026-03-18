
import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { ManagedTeam } from '../../types';
import TeamCreator from './CreateTeamPage';
import { TeamDashboard } from './TeamDetailPage';
import { calculateTeamValue } from '../../utils/teamUtils';

// SPP Levels for S3
const SPP_LEVELS = [0, 6, 16, 31, 51, 76, 176];

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
    initialTeamId?: string | null;
    onInitialTeamHandled?: () => void;
}

const TeamManager: React.FC<TeamManagerProps> = ({ teams, onTeamCreate, onTeamUpdate, onTeamDelete, requestedRoster, onRosterRequestHandled = () => { }, isGuest, matchReports, initialTeamId, onInitialTeamHandled = () => {} }) => {
    // State for which team is shown in the top summary bar
    const [activeSummaryTeamId, setActiveSummaryTeamId] = useState<string | null>(null);
    // State for which team is being edited (inline rename)
    const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
    const [newName, setNewName] = useState('');
    // State to open the Detailed Roster View
    const [openTeamId, setOpenTeamId] = useState<string | null>(null);
    
    const [isCreating, setIsCreating] = useState(requestedRoster !== null && requestedRoster !== undefined);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [selectedTeamsForExport, setSelectedTeamsForExport] = useState<string[]>([]);
    const [initialRosterForCreation, setInitialRosterForCreation] = useState<string | null>(requestedRoster ?? null);
    const [confirmation, setConfirmation] = useState<{ title: string; message: string; onConfirm: () => void; type?: 'danger' | 'info' } | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // Calculate records for all teams based on matchReports and team.history
    const teamRecords = useMemo(() => {
        const records: Record<string, { wins: number; draws: number; losses: number; total: number }> = {};
        
        teams.forEach(team => {
            let wins = 0, draws = 0, losses = 0;
            
            // 1. Check matchReports for this team
            matchReports?.forEach(match => {
                const isHome = match.homeTeam.name === team.name || match.homeTeam.id === team.id;
                const isOpponent = match.opponentTeam.name === team.name || match.opponentTeam.id === team.id;
                
                if (isHome || isOpponent) {
                    if (match.winner === 'draw') draws++;
                    else if ((match.winner === 'home' && isHome) || (match.winner === 'opponent' && isOpponent)) wins++;
                    else losses++;
                }
            });

            // 2. Fallback or merge with team.record if provided
            if (team.record) {
                wins = Math.max(wins, team.record.wins);
                draws = Math.max(draws, team.record.draws);
                losses = Math.max(losses, team.record.losses);
            }

            records[team.id || team.name] = { wins, draws, losses, total: wins + draws + losses };
        });
        
        return records;
    }, [teams, matchReports]);

    const activeSummaryTeamData = useMemo(() => {
        const tId = activeSummaryTeamId || (teams.length > 0 ? teams[0].id : null);
        return tId ? teamRecords[tId] : { wins: 0, draws: 0, losses: 0, total: 0 };
    }, [activeSummaryTeamId, teamRecords, teams]);

    const activeSummaryTeam = useMemo(() => {
        return teams.find(t => t.id === activeSummaryTeamId) || teams[0] || null;
    }, [activeSummaryTeamId, teams]);

    const openTeam = useMemo(() => {
        return teams.find(t => t.id === openTeamId) || null;
    }, [openTeamId, teams]);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 4000);
    };

    useEffect(() => {
        if (requestedRoster !== null && requestedRoster !== undefined) {
            setInitialRosterForCreation(requestedRoster);
            setIsCreating(true);
            onRosterRequestHandled();
        }
    }, [requestedRoster, onRosterRequestHandled]);

    useEffect(() => {
        if (initialTeamId) {
            setOpenTeamId(initialTeamId);
            onInitialTeamHandled();
        }
    }, [initialTeamId, onInitialTeamHandled]);

    const handleTeamCreate = async (newTeam: ManagedTeam) => {
        const teamNameExists = teams.some(team => team.name.toLowerCase() === newTeam.name.toLowerCase());
        if (teamNameExists) {
            setConfirmation({ title: 'Nombre en uso', message: 'Ya existe un equipo con este nombre en el Gremio.', onConfirm: () => setConfirmation(null), type: 'info' });
            return;
        }
        const { id, ...teamData } = newTeam;
        try {
            await onTeamCreate(teamData);
            setIsCreating(false);
            showToast('¡Franquicia fundada con éxito!');
        } catch (error) {
            showToast('Error al fundar la franquicia.');
        }
    };

    const handleRenameSubmit = (team: ManagedTeam) => {
        if (!newName.trim()) {
            setEditingTeamId(null);
            return;
        }
        onTeamUpdate({ ...team, name: newName.trim() });
        setEditingTeamId(null);
        showToast('Nombre actualizado.');
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

    if (openTeam) {
        return (
            <div className="animate-in fade-in duration-500">
                <TeamDashboard
                    team={openTeam}
                    onUpdate={onTeamUpdate}
                    onDeleteRequest={onTeamDelete}
                    onBack={() => setOpenTeamId(null)}
                    isGuest={isGuest}
                    matchReports={matchReports}
                />
            </div>
        );
    }

    if (isCreating) {
        return (
            <div className="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <button onClick={() => setIsCreating(false)} className="flex items-center gap-2 text-gold font-black uppercase tracking-widest text-[10px] hover:underline group italic">
                    <span className="material-symbols-outlined font-bold group-hover:-translate-x-1 transition-transform">arrow_back</span>
                    Cancelar Fundación
                </button>
                <TeamCreator onTeamCreate={handleTeamCreate} initialRosterName={initialRosterForCreation} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-gray-200 font-inter">
            {/* Header Section */}
            <header className="w-full border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-50 px-6 py-5">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-header font-black text-gold tracking-tighter uppercase italic">
                            EL GREMIO
                        </h1>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Equipos Activos: {teams.length}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative group hidden lg:block">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none material-symbols-outlined text-gray-500 text-sm">search</span>
                            <input className="bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-xs focus:ring-1 focus:ring-gold focus:border-gold w-64 text-gray-300 placeholder-gray-600 transition-all font-bold" placeholder="Filtrar franquicias..." type="text"/>
                        </div>
                        <button onClick={() => setIsCreating(true)} className="bg-pitch hover:bg-pitch-hover text-gold px-6 py-2.5 rounded-lg border border-gold/50 font-header font-bold text-xs tracking-wide shadow-lg shadow-black/40 transition-all flex items-center gap-2">
                            <span>[+]</span> FUNDAR NUEVA FRANQUICIA
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8 space-y-10">
                {/* Dynamic Stats Summary Bar */}
                {activeSummaryTeam && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                        <h2 className="text-sm font-header font-bold text-gold uppercase tracking-widest flex items-center gap-3">
                            <span className="opacity-50 text-[10px]">RESUMEN:</span> {activeSummaryTeam.name}
                        </h2>
                        <section className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-white/10 rounded-2xl overflow-hidden bg-white/[0.02]">
                            <div className="px-8 py-6 border-r border-white/10 bg-gradient-to-r from-gold/5 to-transparent">
                                <p className="text-[10px] text-gray-500 font-black tracking-[0.2em] uppercase">Partidos Totales</p>
                                <p className="text-3xl font-header font-bold text-gray-200 mt-1">{activeSummaryTeamData.total}</p>
                            </div>
                            <div className="px-8 py-6 border-r border-white/10 bg-gradient-to-r from-gold/5 to-transparent">
                                <p className="text-[10px] text-gray-500 font-black tracking-[0.2em] uppercase">Victorias</p>
                                <p className="text-3xl font-header font-bold text-gold mt-1">{activeSummaryTeamData.wins}</p>
                            </div>
                            <div className="px-8 py-6 bg-gradient-to-r from-gold/5 to-transparent">
                                <p className="text-[10px] text-gray-500 font-black tracking-[0.2em] uppercase">Palmarés</p>
                                <p className="text-3xl font-header font-bold text-gray-200 mt-1">0 <span className="text-xs font-normal text-gray-500 uppercase ml-2 italic">Títulos</span></p>
                            </div>
                        </section>
                    </div>
                )}

                {/* Team List Table */}
                <section className="border border-white/10 rounded-2xl overflow-hidden bg-black/20">
                    <div className="hidden md:grid grid-cols-12 px-8 py-4 bg-white/5 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] border-b border-white/10">
                        <div className="col-span-4">Equipo / Nombre</div>
                        <div className="col-span-2 text-center">Raza</div>
                        <div className="col-span-2 text-center">VAE</div>
                        <div className="col-span-2 text-center">Récord (V-E-D)</div>
                        <div className="col-span-2 text-right">Acción</div>
                    </div>

                    <div className="divide-y divide-white/5">
                        {teams.map(team => {
                            const isSelected = activeSummaryTeamId === team.id;
                            const isEditing = editingTeamId === team.id;
                            const tv = calculateTV(team);
                            const hasLevelUps = team.players.some(p => p.spp >= (SPP_LEVELS[p.advancements?.length || 0] || 999));
                            const hasInjuries = team.players.some(p => p.lastingInjuries?.some(i => i.includes('MNG')) || p.missNextGame);
                            const record = teamRecords[team.id || team.name] || { wins: 0, draws: 0, losses: 0 };

                            return (
                                <div 
                                    key={team.id}
                                    onClick={() => {
                                        setActiveSummaryTeamId(team.id!);
                                        setOpenTeamId(team.id!);
                                    }}
                                    className={`group cursor-pointer px-8 py-6 grid grid-cols-1 md:grid-cols-12 items-center gap-4 transition-all hover:bg-white/[0.05] ${isSelected ? 'bg-white/10 border-l-4 border-l-gold' : 'bg-transparent'}`}
                                >
                                    {/* Team Name & Crest */}
                                    <div className="col-span-4 flex items-center gap-5">
                                        <div className="w-14 h-14 bg-black/40 rounded-lg border border-white/10 flex items-center justify-center shrink-0 overflow-hidden relative group-hover:border-gold/30 transition-all">
                                            {team.crestImage ? (
                                                <img src={team.crestImage} alt={team.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="material-symbols-outlined text-gold/30 text-2xl">shield</span>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                {isEditing ? (
                                                    <input 
                                                        autoFocus
                                                        className="bg-black/60 border border-gold text-white px-2 py-0.5 rounded text-lg font-header italic outline-none"
                                                        value={newName}
                                                        onChange={(e) => setNewName(e.target.value)}
                                                        onBlur={() => handleRenameSubmit(team)}
                                                        onKeyDown={(e) => e.key === 'Enter' && handleRenameSubmit(team)}
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                ) : (
                                                    <>
                                                        <h3 className="font-header font-bold text-xl text-white truncate italic tracking-tighter uppercase">{team.name}</h3>
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); setEditingTeamId(team.id!); setNewName(team.name); }}
                                                            className="text-gold/40 hover:text-gold transition-colors"
                                                        >
                                                            <span className="material-symbols-outlined text-sm">edit</span>
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                                                <span className="text-[9px] font-mono tracking-tighter text-gray-600 mr-1 uppercase">#FR-{team.id?.slice(0, 4)}</span>
                                                {hasLevelUps && <span className="bg-gold text-black text-[8px] font-black px-1.5 py-0.5 rounded tracking-widest uppercase italic">PTE. MEJORA</span>}
                                                {hasInjuries && <span className="bg-blood text-white text-[8px] font-black px-1.5 py-0.5 rounded tracking-widest uppercase italic">LESIONADOS</span>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Race */}
                                    <div className="col-span-2 text-center">
                                        <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">{team.rosterName}</span>
                                    </div>

                                    {/* VAE */}
                                    <div className="col-span-2 text-center">
                                        <span className="font-mono text-lg font-bold text-gold">{tv.toLocaleString()}</span>
                                        <span className="text-[9px] text-gold/30 block font-black tracking-widest mt-0.5">MO</span>
                                    </div>

                                    {/* Record */}
                                    <div className="col-span-2 text-center">
                                        <span className="text-xs font-mono tracking-widest text-gray-300 bg-black/40 px-4 py-1.5 rounded-full border border-white/5 inline-block">
                                            {record.wins} - {record.draws} - {record.losses}
                                        </span>
                                    </div>

                                    {/* Action */}
                                    <div className="col-span-2 flex justify-end">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setOpenTeamId(team.id!); }}
                                            className={`w-full md:w-auto text-[10px] font-black px-5 py-2.5 rounded-lg transition-all uppercase tracking-widest font-header italic border ${isSelected ? 'bg-gold text-black border-gold hover:bg-gold/80' : 'border-gold/40 text-gold hover:bg-gold hover:text-black'}`}
                                        >
                                            Gestionar Plantilla
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                        
                        {teams.length === 0 && (
                            <div className="py-20 text-center flex flex-col items-center">
                                <span className="material-symbols-outlined text-6xl text-white/5 mb-4">stadium</span>
                                <h3 className="text-lg font-header font-black text-gray-600 uppercase italic tracking-widest">Sin franquicias registradas</h3>
                                <button onClick={() => setIsCreating(true)} className="mt-6 text-gold text-xs font-black uppercase tracking-[0.2em] hover:text-white transition-colors">Fundar Primer Equipo</button>
                            </div>
                        )}
                    </div>
                </section>
            </main>

            <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-white/5 text-center">
                <p className="text-gray-600 text-[9px] uppercase tracking-[0.4em] font-black">© 2499 Blood Bowl Management System - El Gremio de Reikland</p>
                <div className="mt-6 flex justify-center gap-6">
                    <button onClick={handleImportClick} className="text-[9px] font-black text-gray-500 hover:text-gold uppercase tracking-widest transition-all">Importar JSON</button>
                    <button onClick={() => setIsExportModalOpen(true)} className="text-[9px] font-black text-gray-500 hover:text-gold uppercase tracking-widest transition-all">Exportar Datos</button>
                </div>
                <input type="file" accept=".json" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
            </footer >

            {/* Reuse existing export modal and confirmation logic */}
            {isExportModalOpen && (
                <div className="fixed inset-0 bg-black/98 backdrop-blur-xl flex items-center justify-center z-[200] p-4" onClick={() => setIsExportModalOpen(false)}>
                    <div className="bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl" onClick={e => e.stopPropagation()}>
                        <h3 className="text-2xl font-header font-black text-gold uppercase italic tracking-tighter mb-8 text-center underline decoration-gold/20 underline-offset-8">Archivo del Gremio</h3>
                        <div className="max-h-[50vh] overflow-y-auto space-y-3 custom-scrollbar pr-2">
                             <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 cursor-pointer hover:bg-white/10 transition-all mb-4" onClick={(e) => { e.stopPropagation(); handleSelectAllForExport(selectedTeamsForExport.length !== teams.length); }}>
                                <input type="checkbox" checked={teams.length > 0 && selectedTeamsForExport.length === teams.length} readOnly className="h-4 w-4 rounded border-gold/20 text-gold focus:ring-gold bg-black/40" />
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Seleccionar Todos</span>
                            </div>
                            {teams.map(t => (
                                <div key={t.id} className="flex items-center gap-3 bg-black/40 p-4 rounded-xl border border-white/5 hover:border-gold/30 transition-all cursor-pointer" onClick={() => handleExportSelectionChange(t.id!)}>
                                    <input type="checkbox" checked={selectedTeamsForExport.includes(t.id!)} readOnly className="h-4 w-4 rounded border-gold/20 text-gold focus:ring-gold bg-black/40" />
                                    <span className="text-sm font-header font-bold text-white italic tracking-tighter uppercase">{t.name}</span>
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-8">
                            <button onClick={() => setIsExportModalOpen(false)} className="py-4 rounded-2xl bg-white/5 text-gray-500 font-header font-black uppercase text-[10px] tracking-widest hover:bg-white/10 transition-all">Cancelar</button>
                            <button onClick={triggerExport} className="py-4 rounded-2xl bg-gold text-black font-header font-black uppercase text-[10px] tracking-widest shadow-xl shadow-gold/20 hover:scale-105 active:scale-95 transition-all">Exportar (.json)</button>
                        </div>
                    </div>
                </div>
            )}

            {toastMessage && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[400] animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-gold text-black px-8 py-4 rounded-2xl shadow-glow font-black border-2 border-gold/50 text-[10px] uppercase tracking-widest">
                        {toastMessage}
                    </div>
                </div>
            )}
            
            <style>{`
                 .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                 .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.02); }
                 .custom-scrollbar::-webkit-scrollbar-thumb { background: #CA8A04; border-radius: 10px; }
                 .shadow-glow { box-shadow: 0 0 30px rgba(202, 138, 4, 0.3); }
            `}</style>
        </div >
    );
};

export default TeamManager;
