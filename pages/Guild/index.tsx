
import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { ManagedPlayer, ManagedTeam } from '../../types';
import TeamCreator from './CreateTeamPage';
import { TeamDashboard } from '../../components/guild/TeamDashboard';
import { calculateTeamValue } from '../../utils/teamUtils';
import { getTeamLogoUrl } from '../../utils/imageUtils';
import { teamsData } from '../../data/teams';
import { useAuth } from '../../hooks/useAuth';
import type { Competition } from '../../types';

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

const normalizeSearchValue = (value: string) =>
    value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

const getNextSppThreshold = (player: ManagedPlayer) => {
    const advancementCount = player.advancements?.length || 0;
    return SPP_LEVELS[advancementCount + 1] ?? null;
};

const canPlayerLevelUp = (player: ManagedPlayer) => {
    const nextThreshold = getNextSppThreshold(player);
    return nextThreshold !== null && player.spp >= nextThreshold;
};

const isPlayerUnavailableForNextMatch = (player: ManagedPlayer) => {
    if ((player.missNextGame || 0) > 0) return true;
    if (player.lastingInjuries?.some((injury) => injury.toUpperCase().includes('MNG'))) return true;
    return ['Muerto', 'Expulsado'].includes(player.status);
};

const calculatePlayerImprovementValue = (player: ManagedPlayer) => {
    if (player.advancements && player.advancements.length > 0) {
        return player.advancements.reduce((advSum, adv) => {
            let baseValue = 0;
            switch (adv.type) {
                case 'RandomPrimary': baseValue = 10000; break;
                case 'ChosenPrimary': baseValue = 20000; break;
                case 'RandomSecondary': baseValue = 20000; break;
                case 'ChosenSecondary': baseValue = 40000; break;
                case 'Characteristic':
                    if (adv.characteristicName === 'FU') baseValue = 60000;
                    else if (adv.characteristicName === 'AG') baseValue = 30000;
                    else if (adv.characteristicName === 'PA' || adv.characteristicName === 'MV') baseValue = 20000;
                    else baseValue = 10000;
                    break;
            }
            return advSum + baseValue;
        }, 0);
    }

    return (player.gainedSkills || []).reduce((sum, skillName) => {
        const isSecondary = skillName?.toLowerCase().includes('secundaria');
        return sum + (isSecondary ? 40000 : 20000);
    }, 0);
};

const calculateManagedPlayerValue = (player: ManagedPlayer) => player.cost + calculatePlayerImprovementValue(player);

const calculateRealTV = (team: ManagedTeam) => {
    const baseTV = calculateTV(team);
    const unavailableValue = team.players
        .filter(isPlayerUnavailableForNextMatch)
        .reduce((sum, player) => sum + calculateManagedPlayerValue(player), 0);

    return Math.max(0, baseTV - unavailableValue);
};

const getRosterAliases = (rosterName: string) => {
    const normalized = normalizeSearchValue(rosterName);
    const aliases: Record<string, string[]> = {
        "amazons": ['amazonas'],
        "black orcs": ['orcos negros'],
        "chosen of chaos": ['elegidos del caos'],
        "chaos dwarfs": ['enanos del caos', 'caos enano'],
        "chaos renegades": ['renegados del caos'],
        "dark elves": ['elfos oscuros'],
        "dwarfs": ['enanos'],
        "elven union": ['union elfica', 'union elfica'],
        "gnomes": ['gnomos'],
        "goblins": ['goblins'],
        "halflings": ['halflings'],
        "high elves": ['altos elfos', 'elfos altos'],
        "humans": ['humanos'],
        "imperial nobility": ['nobleza imperial'],
        "khorne": ['khorne'],
        "lizardmen": ['hombres lagarto', 'lagartos'],
        "necromantic horror": ['horror nigromantico', 'no muertos nigromanticos'],
        "norse": ['nordicos', 'nordicos'],
        "nurgle": ['nurgle'],
        "ogres": ['ogros'],
        "old world alliance": ['alianza del viejo mundo'],
        "orcs": ['orcos'],
        "shambling undead": ['no muertos'],
        "skaven": ['skaven'],
        "snotling": ['snotling', 'snotlings'],
        "tomb kings": ['reyes de la tumba', 'reyes de las tumbas'],
        "underworld denizens": ['habitantes del inframundo'],
        "vampires": ['vampiros'],
        "wood elves": ['elfos silvanos'],
        "bretonnians": ['bretonianos'],
    };

    return aliases[normalized] || [];
};

const resolveGuildTeamCrestUrl = (team: ManagedTeam): string => {
    const staticTeam = teamsData.find(t => t.name === team.rosterName);
    return (
        team.crestImage ||
        staticTeam?.crestImage ||
        staticTeam?.image ||
        getTeamLogoUrl(team.rosterName) ||
        ''
    );
};

const getGuildListCrestStyle = (team: ManagedTeam): React.CSSProperties => ({
    transform: `scale(${team.crestScale ?? 1.18}) translateY(${team.crestOffsetY ?? 0}px)`,
    transformOrigin: 'center center',
});

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
    onOpenTacticalBoard?: (teamId: string) => void;
    competitions?: Competition[];
}

const TeamManager: React.FC<TeamManagerProps> = ({ teams, onTeamCreate, onTeamUpdate, onTeamDelete, requestedRoster, onRosterRequestHandled = () => { }, isGuest, matchReports, initialTeamId, onInitialTeamHandled = () => {}, onOpenTacticalBoard, competitions }) => {
    const { user } = useAuth();
    // State for which team is shown in the top summary bar
    const [activeSummaryTeamId, setActiveSummaryTeamId] = useState<string | null>(null);
    // State for which team is being edited (inline rename)
    const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
    const [newName, setNewName] = useState('');
    // State to open the Detailed Roster View
    const [openTeamId, setOpenTeamId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    
    const [isCreating, setIsCreating] = useState(requestedRoster !== null && requestedRoster !== undefined);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [selectedTeamsForExport, setSelectedTeamsForExport] = useState<string[]>([]);
    const [initialRosterForCreation, setInitialRosterForCreation] = useState<string | null>(requestedRoster ?? null);
    const [confirmation, setConfirmation] = useState<{ title: string; message: string; onConfirm: () => void; type?: 'danger' | 'info' } | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [teamViewMode, setTeamViewMode] = useState<'list' | 'grid'>('list');
    const [sortMode, setSortMode] = useState<'tv' | 'treasury' | 'name'>('tv');
    const [statusFilters, setStatusFilters] = useState({
        levelUps: false,
        injuries: false,
        incomplete: false,
    });

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
        const record = tId ? teamRecords[tId] : null;
        return record || { wins: 0, draws: 0, losses: 0, total: 0 };
    }, [activeSummaryTeamId, teamRecords, teams]);

    // Safety effect: If the active team is deleted, fallback to the first available team
    useEffect(() => {
        if (activeSummaryTeamId && !teams.some(t => t.id === activeSummaryTeamId)) {
            setActiveSummaryTeamId(teams.length > 0 ? (teams[0].id || null) : null);
        }
    }, [teams, activeSummaryTeamId]);

    const activeSummaryTeam = useMemo(() => {
        return teams.find(t => t.id === activeSummaryTeamId) || teams[0] || null;
    }, [activeSummaryTeamId, teams]);

    const teamInsights = useMemo(() => {
        return Object.fromEntries(
            teams.map((team) => {
                const record = teamRecords[team.id || team.name] || { wins: 0, draws: 0, losses: 0, total: 0 };
                const pendingLevelUps = team.players.filter(canPlayerLevelUp).length;
                const unavailablePlayers = team.players.filter(isPlayerUnavailableForNextMatch);
                const availablePlayers = team.players.length - unavailablePlayers.length;
                const realTV = calculateRealTV(team);
                const baseTV = calculateTV(team);
                const rosterIsIncomplete = availablePlayers < 11;

                return [
                    team.id || team.name,
                    {
                        record,
                        pendingLevelUps,
                        unavailableCount: unavailablePlayers.length,
                        availablePlayers,
                        rosterCount: team.players.length,
                        rosterIsIncomplete,
                        realTV,
                        baseTV,
                        tvReduced: realTV < baseTV,
                        treasury: team.treasury || 0,
                    },
                ];
            })
        );
    }, [teams, teamRecords]);

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
            const message = 'Ya existe un equipo con este nombre en el Gremio.';
            showToast(message);
            throw new Error(message);
        }
        const { id, ...teamData } = newTeam;
        try {
            await onTeamCreate(teamData);
            setIsCreating(false);
            showToast('¡Franquicia fundada con éxito!');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Error al fundar la franquicia.';
            showToast(message);
            throw error;
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

    const requestTeamDeletion = (team: ManagedTeam) => {
        const activeComp = competitions?.find(c =>
            c.status === 'In Progress' &&
            c.teams.some(t => t.teamName === team.name && t.ownerId === user?.id)
        );

        if (activeComp) {
            setConfirmation({
                title: 'Equipo en Competición',
                message: `No puedes disolver a los "${team.name}" porque están disputando la competición "${activeComp.name}". Retira al equipo de la competición o finalízala antes de borrarlo.`,
                type: 'info',
                onConfirm: () => setConfirmation(null)
            });
            return;
        }

        setConfirmation({
            title: '¿Abandonar Franquicia?',
            message: `Vas a retirar permanentemente a los "${team.name}" del Gremio. Todo su progreso se perderá.`,
            type: 'danger',
            onConfirm: () => {
                if (openTeamId === team.id) {
                    setOpenTeamId(null);
                }
                onTeamDelete(team.id!);
            }
        });
    };

    const renderTeamCard = (team: ManagedTeam) => {
        const isSelected = activeSummaryTeamId === team.id;
        const isEditing = editingTeamId === team.id;
        const insight = teamInsights[team.id || team.name];
        const tv = insight?.realTV ?? calculateTV(team);
        const baseTV = insight?.baseTV ?? tv;
        const hasLevelUps = (insight?.pendingLevelUps || 0) > 0;
        const hasInjuries = (insight?.unavailableCount || 0) > 0;
        const record = insight?.record || teamRecords[team.id || team.name] || { wins: 0, draws: 0, losses: 0 };
        const rosterLabel = team.rosterName;
        const rosterStatus = `${insight?.rosterCount ?? team.players.length}/16`;
        const isIncomplete = !!insight?.rosterIsIncomplete;

        if (teamViewMode === 'grid') {
            return (
                <div
                    key={team.id}
                    onClick={() => setActiveSummaryTeamId(team.id!)}
                    className={`group relative rounded-[2rem] border overflow-hidden transition-all duration-300 p-6 md:p-7 ${
                        isSelected
                            ? 'bg-[rgba(255,251,241,0.9)] border-gold/40 shadow-[0_20px_40px_rgba(89,59,21,0.08)]'
                            : 'bg-[rgba(255,251,241,0.76)] border-[rgba(111,87,56,0.10)] hover:border-[rgba(111,87,56,0.18)] shadow-[0_16px_34px_rgba(89,59,21,0.06)]'
                    }`}
                >
                    <div className={`absolute inset-y-0 left-0 w-1.5 ${isSelected ? 'bg-gold' : 'bg-[rgba(111,87,56,0.10)] group-hover:bg-gold/20'} transition-colors`} />
                    <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(202,138,4,0.12),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.08),transparent_28%)]" />

                    <div className="relative z-10 flex flex-col gap-5 min-w-0">
                        <div className="flex items-start gap-5 min-w-0">
                            <div className="w-32 h-32 md:w-40 md:h-40 bg-[rgba(36,26,17,0.86)] rounded-[1.75rem] border border-[rgba(111,87,56,0.12)] p-2 flex items-center justify-center shrink-0 overflow-hidden relative shadow-xl shadow-black/10 group-hover:border-gold/30 transition-all">
                                <img
                                    src={resolveGuildTeamCrestUrl(team)}
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
                                    style={getGuildListCrestStyle(team)}
                                    className="w-full h-full object-contain drop-shadow-[0_0_12px_rgba(255,255,255,0.06)] transform-gpu"
                                />
                            </div>

                            <div className="min-w-0 flex-1">
                                <div className="flex items-start gap-2 mb-2 min-w-0">
                                    {isEditing ? (
                                        <input
                                            autoFocus
                                            className="bg-black/60 border-b-2 border-gold text-white px-0 py-1 rounded-none text-xl md:text-2xl font-header italic outline-none w-full"
                                            value={newName}
                                            onChange={(e) => setNewName(e.target.value)}
                                            onBlur={() => handleRenameSubmit(team)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleRenameSubmit(team)}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    ) : (
                                        <>
                                            <h3
                                                onClick={(e) => { e.stopPropagation(); setOpenTeamId(team.id!); }}
                                                className="font-header font-black text-[clamp(1rem,1.05vw,1.45rem)] text-[#2b1d12] italic tracking-tighter uppercase group-hover:text-gold transition-colors cursor-pointer whitespace-nowrap leading-none max-w-full"
                                            >
                                                {team.name}
                                            </h3>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setEditingTeamId(team.id!); setNewName(team.name); }}
                                                className="opacity-0 group-hover:opacity-100 text-gold/55 hover:text-gold transition-all ml-1 mt-1 shrink-0"
                                            >
                                                <span className="material-symbols-outlined text-sm">edit</span>
                                            </button>
                                        </>
                                    )}
                                </div>

                                <p className="text-[11px] font-black uppercase tracking-[0.26em] text-[#8d7863] italic">{rosterLabel}</p>
                                <div className="flex items-center gap-2 mt-3 flex-wrap">
                                    <span className="text-[10px] font-mono tracking-tighter text-[#7b6853] uppercase">#FR-{team.id?.slice(0, 4)}</span>
                                    <span className={`text-[8px] font-black px-2.5 py-1 rounded-full border uppercase tracking-widest ${isIncomplete ? 'bg-[rgba(220,38,38,0.08)] border-[rgba(220,38,38,0.16)] text-[#b91c1c]' : 'bg-[rgba(255,251,241,0.72)] border-[rgba(111,87,56,0.10)] text-[#7b6853]'}`}>
                                        Plantilla {rosterStatus}
                                    </span>
                                    <span className={`text-[8px] font-black px-2.5 py-1 rounded-full border uppercase tracking-widest ${team.apothecary ? 'bg-[rgba(22,163,74,0.12)] border-[rgba(22,163,74,0.18)] text-[#16a34a]' : 'bg-[rgba(255,251,241,0.72)] border-[rgba(111,87,56,0.10)] text-[#7b6853]'}`}>
                                        {team.apothecary ? 'Boticario' : 'Sin boticario'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 mt-3 flex-wrap min-h-[24px]">
                                    {hasLevelUps && <span className="bg-[rgba(202,138,4,0.16)] text-[#8a5b05] text-[8px] font-black px-2 py-1 rounded-full tracking-widest uppercase italic">STAR {insight?.pendingLevelUps}</span>}
                                    {hasInjuries && <span className="bg-[rgba(220,38,38,0.12)] text-[#b91c1c] text-[8px] font-black px-2 py-1 rounded-full tracking-widest uppercase italic">MNG {insight?.unavailableCount}</span>}
                                    {isIncomplete && <span className="bg-[rgba(245,158,11,0.14)] text-[#a16207] text-[8px] font-black px-2 py-1 rounded-full tracking-widest uppercase italic">Aviso &lt; 11</span>}
                                    {!hasLevelUps && !hasInjuries && !isIncomplete && (
                                        <span className="text-[8px] font-black px-2 py-1 rounded-full tracking-widest uppercase italic bg-[rgba(22,163,74,0.10)] text-[#15803d] border border-[rgba(22,163,74,0.14)]">
                                            Listo para el partido
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="rounded-[1.4rem] bg-[rgba(255,251,241,0.72)] border border-[rgba(111,87,56,0.10)] px-4 py-4 min-w-0 min-h-[116px] flex flex-col justify-between">
                                <div className="flex items-center gap-2">
                                    <p className="text-[9px] font-black uppercase tracking-[0.26em] text-[#8d7863] italic mb-2">TV real</p>
                                    {tv < baseTV && <span className="material-symbols-outlined text-[14px] text-[#b91c1c]">healing</span>}
                                </div>
                                <p className="font-epilogue text-2xl lg:text-[1.9rem] font-black italic tracking-tight text-gold leading-none">{tv.toLocaleString()}</p>
                                <p className="text-[8px] text-[#7b6853] block font-black tracking-widest mt-1">MO</p>
                            </div>
                            <div className="rounded-[1.4rem] bg-[rgba(255,251,241,0.72)] border border-[rgba(111,87,56,0.10)] px-4 py-4 min-w-0 min-h-[116px] flex flex-col justify-between">
                                <p className="text-[9px] font-black uppercase tracking-[0.26em] text-[#8d7863] italic mb-2">Tesoreria</p>
                                <p className="font-epilogue text-2xl lg:text-[1.9rem] font-black italic tracking-tight text-[#2b1d12] leading-none">{(insight?.treasury || 0).toLocaleString()}</p>
                                <p className="text-[8px] text-[#7b6853] block font-black tracking-widest mt-1">MO</p>
                            </div>
                            <div className="rounded-[1.4rem] bg-[rgba(255,251,241,0.72)] border border-[rgba(111,87,56,0.10)] px-4 py-4 min-w-0 min-h-[116px] flex flex-col justify-between">
                                <p className="text-[9px] font-black uppercase tracking-[0.26em] text-[#8d7863] italic mb-2">Estado</p>
                                <div className="inline-flex items-center gap-2 bg-[rgba(255,251,241,0.72)] px-3 py-2 rounded-2xl border border-[rgba(111,87,56,0.10)] w-fit">
                                    <span className="text-[11px] font-black text-[#2b1d12]">{record.wins}</span>
                                    <span className="text-[#7b6853]">•</span>
                                    <span className="text-[11px] font-black text-[#2b1d12]">{record.draws}</span>
                                    <span className="text-[#7b6853]">•</span>
                                    <span className="text-[11px] font-black text-[#2b1d12]">{record.losses}</span>
                                </div>
                                <p className={`text-[8px] font-black tracking-widest uppercase mt-2 ${isIncomplete ? 'text-[#b91c1c]' : 'text-[#7b6853]'}`}>
                                    Plantilla {rosterStatus}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 relative z-10 pt-1">
                            <button
                                onClick={(e) => { e.stopPropagation(); setOpenTeamId(team.id!); }}
                                className="px-6 py-3 rounded-xl bg-gold text-black font-header font-black text-[10px] uppercase tracking-widest shadow-xl shadow-gold/10 hover:shadow-gold/20 hover:scale-105 active:scale-95 transition-all"
                            >
                                Abrir dossier
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); requestTeamDeletion(team); }}
                                className="w-12 h-12 rounded-xl border border-[rgba(111,87,56,0.12)] bg-[rgba(255,251,241,0.72)] text-[#7b6853] hover:bg-blood hover:text-white hover:border-blood transition-all flex items-center justify-center group/del"
                            >
                                <span className="material-symbols-outlined text-lg">delete</span>
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div
                key={team.id}
                onClick={() => setActiveSummaryTeamId(team.id!)}
                className={`group relative grid grid-cols-1 md:grid-cols-[minmax(0,3.15fr)_minmax(110px,0.54fr)_minmax(165px,0.66fr)_minmax(165px,0.7fr)] items-center gap-6 px-10 py-8 border rounded-[2rem] overflow-hidden transition-all duration-300 ${
                    isSelected
                        ? 'bg-[rgba(255,251,241,0.88)] border-gold/40 shadow-[0_20px_40px_rgba(89,59,21,0.08)]'
                        : 'bg-[rgba(255,251,241,0.74)] border-[rgba(111,87,56,0.10)] hover:border-[rgba(111,87,56,0.18)] shadow-[0_16px_34px_rgba(89,59,21,0.06)]'
                }`}
            >
                <div className={`absolute inset-y-0 left-0 w-1.5 ${isSelected ? 'bg-gold' : 'bg-[rgba(111,87,56,0.10)] group-hover:bg-gold/20'} transition-colors`} />
                <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(202,138,4,0.12),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.08),transparent_28%)]" />

                <div className="flex items-start md:items-center gap-5 relative z-10 min-w-0">
                    <div className="w-40 h-40 md:w-48 md:h-48 bg-[rgba(36,26,17,0.86)] rounded-[1.75rem] border border-[rgba(111,87,56,0.12)] p-1 flex items-center justify-center shrink-0 overflow-hidden relative shadow-xl shadow-black/10 group-hover:border-gold/30 transition-all">
                        <img
                            src={resolveGuildTeamCrestUrl(team)}
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
                            style={getGuildListCrestStyle(team)}
                            className="w-full h-full object-contain drop-shadow-[0_0_12px_rgba(255,255,255,0.06)] transform-gpu"
                        />
                    </div>
                    <div className="min-w-0 flex-1 pr-6">
                        <div className="flex items-start gap-2 mb-1 min-w-0">
                            {isEditing ? (
                                <input
                                    autoFocus
                                    className="bg-black/60 border-b-2 border-gold text-white px-0 py-1 rounded-none text-2xl font-header italic outline-none w-full"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    onBlur={() => handleRenameSubmit(team)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleRenameSubmit(team)}
                                    onClick={(e) => e.stopPropagation()}
                                />
                            ) : (
                                <>
                                    <h3
                                        onClick={(e) => { e.stopPropagation(); setOpenTeamId(team.id!); }}
                                        className="font-header font-black text-[clamp(0.98rem,1.1vw,1.6rem)] text-[#2b1d12] italic tracking-tighter uppercase group-hover:text-gold transition-colors cursor-pointer whitespace-nowrap leading-none max-w-full"
                                    >
                                        {team.name}
                                    </h3>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setEditingTeamId(team.id!); setNewName(team.name); }}
                                        className="opacity-0 group-hover:opacity-100 text-gold/55 hover:text-gold transition-all ml-1 mt-1 shrink-0"
                                    >
                                        <span className="material-symbols-outlined text-sm">edit</span>
                                    </button>
                                </>
                            )}
                        </div>
                        <p className="text-[11px] font-black uppercase tracking-[0.26em] text-[#8d7863] italic">{rosterLabel}</p>
                        <div className="flex items-center gap-2 mt-3 flex-wrap">
                            <span className="text-[10px] font-mono tracking-tighter text-[#7b6853] uppercase">#FR-{team.id?.slice(0, 4)}</span>
                            {hasLevelUps && <span className="bg-[rgba(202,138,4,0.16)] text-[#8a5b05] text-[8px] font-black px-2 py-0.5 rounded-sm tracking-widest uppercase italic">STAR {insight?.pendingLevelUps}</span>}
                            {hasInjuries && <span className="bg-[rgba(220,38,38,0.12)] text-[#b91c1c] text-[8px] font-black px-2 py-0.5 rounded-sm tracking-widest uppercase italic">MNG {insight?.unavailableCount}</span>}
                            {isIncomplete && <span className="bg-[rgba(245,158,11,0.14)] text-[#a16207] text-[8px] font-black px-2 py-0.5 rounded-sm tracking-widest uppercase italic">Aviso &lt; 11</span>}
                            {!hasLevelUps && !hasInjuries && !isIncomplete && (
                                <span className="text-[8px] font-black px-2 py-0.5 rounded-sm tracking-widest uppercase italic bg-[rgba(22,163,74,0.10)] text-[#15803d] border border-[rgba(22,163,74,0.14)]">
                                    Listo para el partido
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="text-center relative z-10">
                    <span className="text-[9px] text-[#7b6853] font-black uppercase tracking-[0.35em] block mb-1">TV real</span>
                    <div className="inline-flex items-center justify-center gap-2">
                        <span className="font-header text-3xl font-black text-gold italic leading-none">{tv.toLocaleString()}</span>
                        {tv < baseTV && <span className="material-symbols-outlined text-[16px] text-[#b91c1c]">healing</span>}
                    </div>
                    <span className="text-[8px] text-[#7b6853] block font-black tracking-widest mt-1">MO</span>
                </div>

                <div className="text-center relative z-10">
                    <span className="text-[9px] text-[#7b6853] font-black uppercase tracking-[0.35em] block mb-1">Plantilla / Tesoreria</span>
                    <div className="space-y-2">
                        <div className={`text-[11px] font-black uppercase tracking-[0.16em] ${isIncomplete ? 'text-[#b91c1c]' : 'text-[#2b1d12]'}`}>
                            {rosterStatus}
                        </div>
                        <div className="text-xl font-header font-black italic text-[#2b1d12] leading-none">
                            {(insight?.treasury || 0).toLocaleString()}
                            <span className="text-[9px] text-[#7b6853] font-black tracking-widest ml-1 not-italic">MO</span>
                        </div>
                        <div className="inline-flex items-center gap-2 bg-[rgba(255,251,241,0.72)] px-4 py-2.5 rounded-2xl border border-[rgba(111,87,56,0.10)] group-hover:border-gold/20 transition-colors">
                            <span className="text-[11px] font-black text-[#2b1d12]">{record.wins}</span>
                            <span className="text-[#7b6853]">•</span>
                            <span className="text-[11px] font-black text-[#2b1d12]">{record.draws}</span>
                            <span className="text-[#7b6853]">•</span>
                            <span className="text-[11px] font-black text-[#2b1d12]">{record.losses}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 relative z-10">
                    <button
                        onClick={(e) => { e.stopPropagation(); setOpenTeamId(team.id!); }}
                        className="px-5 py-3 rounded-xl bg-gold text-black font-header font-black text-[10px] uppercase tracking-widest shadow-xl shadow-gold/10 hover:shadow-gold/20 hover:scale-105 active:scale-95 transition-all"
                    >
                        Abrir dossier
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); requestTeamDeletion(team); }}
                        className="w-12 h-12 rounded-xl border border-[rgba(111,87,56,0.12)] bg-[rgba(255,251,241,0.72)] text-[#7b6853] hover:bg-blood hover:text-white hover:border-blood transition-all flex items-center justify-center group/del"
                    >
                        <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                </div>
            </div>
        );
    };

    const filterCounts = useMemo(() => ({
        levelUps: teams.filter((team) => (teamInsights[team.id || team.name]?.pendingLevelUps || 0) > 0).length,
        injuries: teams.filter((team) => (teamInsights[team.id || team.name]?.unavailableCount || 0) > 0).length,
        incomplete: teams.filter((team) => !!teamInsights[team.id || team.name]?.rosterIsIncomplete).length,
    }), [teams, teamInsights]);

    const filteredTeams = useMemo(() => {
        const query = normalizeSearchValue(searchTerm.trim());

        return [...teams]
            .filter((team) => {
                const searchHaystack = [
                    team.name,
                    team.rosterName,
                    ...getRosterAliases(team.rosterName),
                ]
                    .map((value) => normalizeSearchValue(value))
                    .join(' ');

                if (query && !searchHaystack.includes(query)) return false;

                const insight = teamInsights[team.id || team.name];
                if (!insight) return false;
                if (statusFilters.levelUps && insight.pendingLevelUps === 0) return false;
                if (statusFilters.injuries && insight.unavailableCount === 0) return false;
                if (statusFilters.incomplete && !insight.rosterIsIncomplete) return false;

                return true;
            })
            .sort((a, b) => {
                const insightA = teamInsights[a.id || a.name];
                const insightB = teamInsights[b.id || b.name];
                if (!insightA || !insightB) return 0;

                if (sortMode === 'treasury') return insightB.treasury - insightA.treasury;
                if (sortMode === 'name') return a.name.localeCompare(b.name, 'es', { sensitivity: 'base' });
                return insightB.realTV - insightA.realTV;
            });
    }, [teams, teamInsights, searchTerm, statusFilters, sortMode]);

    if (openTeam) {
        return (
            <div className="animate-in fade-in duration-500">
                <TeamDashboard
                    team={openTeam}
                    onUpdate={onTeamUpdate}
                    onDeleteRequest={() => requestTeamDeletion(openTeam)}
                    onBack={() => setOpenTeamId(null)}
                    onOpenTacticalBoard={onOpenTacticalBoard}
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
        <div className="blood-ui-shell min-h-screen text-gray-200 font-inter">
            {/* Confirmation Modal */}
            {confirmation && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[500] p-4">
                    <div className="blood-ui-card-strong rounded-2xl p-6 max-w-sm w-full">
                        <h3 className="text-xl font-header font-black text-white uppercase italic mb-2">{confirmation.title}</h3>
                        <p className="text-gray-400 text-sm mb-6">{confirmation.message}</p>
                        <div className="flex gap-3">
                            <button onClick={() => setConfirmation(null)} className="flex-1 py-3 rounded-xl blood-ui-button-secondary text-gray-400 font-bold text-[10px] uppercase tracking-widest">Cancelar</button>
                            <button 
                                onClick={() => { confirmation.onConfirm(); setConfirmation(null); }}
                                className={`flex-1 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${confirmation.type === 'danger' ? 'blood-ui-button-danger' : 'blood-ui-button-primary'}`}
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header Section */}
            <header className="blood-ui-header w-full sticky top-16 z-50 px-6 py-4">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-5">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-3 py-1 rounded-full bg-[rgba(255,251,241,0.78)] border border-[rgba(111,87,56,0.12)] text-[9px] font-black uppercase tracking-[0.28em] text-[#7b6853] italic">
                                Dossier de gremio
                            </span>
                            <span className="px-3 py-1 rounded-full bg-[rgba(202,138,4,0.14)] border border-[rgba(202,138,4,0.14)] text-[9px] font-black uppercase tracking-[0.28em] text-[#ca8a04] italic">
                                {teams.length} franquicias
                            </span>
                        </div>
                        <h1 className="text-3xl font-header font-black text-gold tracking-tight uppercase italic leading-none text-shadow-premium">
                            EL GREMIO
                        </h1>
                        <p className="text-[10px] text-[#7b6853] font-black uppercase tracking-[0.2em]">Gestiona altas, escudos y archivos de franquicia</p>
                    </div>
                    
                    <div className="flex items-center gap-4 flex-1 md:justify-end">
                        <div className="relative group max-w-xs w-full">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none material-symbols-outlined text-[#7b6853] text-sm">search</span>
                            <input 
                                className="blood-ui-input w-full rounded-xl pl-10 pr-4 py-2.5 text-[10px] text-[#2b1d12] placeholder:text-[#8d7863] transition-all font-bold uppercase tracking-widest" 
                                placeholder="Filtrar por nombre o raza..." 
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button onClick={() => setIsCreating(true)} className="blood-ui-button-primary px-6 py-2.5 rounded-xl font-header font-black text-[10px] tracking-widest shadow-lg transition-all flex items-center gap-2 group">
                            <span className="opacity-50 group-hover:opacity-100 transition-opacity">[+]</span> FUNDAR NUEVA FRANQUICIA
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8 space-y-10">
                {/* Dynamic Stats Summary Bar */}
                {activeSummaryTeam && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                        <h2 className="text-[10px] font-black text-gold uppercase tracking-[0.3em] flex items-center gap-3">
                            <span className="opacity-50">RESUMEN:</span> {activeSummaryTeam.name}
                        </h2>
                        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="guild-summary-card rounded-2xl px-10 py-8 group transition-all">
                                <p className="text-[10px] text-[#7b6853] font-black tracking-[0.3em] uppercase mb-4">Total Partidos</p>
                                <p className="text-6xl font-header font-black text-[#2b1d12] group-hover:text-gold transition-colors">{activeSummaryTeamData?.total || 0}</p>
                            </div>
                            <div className="guild-summary-card rounded-2xl px-10 py-8 group transition-all">
                                <p className="text-[10px] text-[#7b6853] font-black tracking-[0.3em] uppercase mb-4">Victorias</p>
                                <p className="text-6xl font-header font-black text-gold">{activeSummaryTeamData?.wins || 0}</p>
                            </div>
                            <div className="guild-summary-card rounded-2xl px-10 py-8 group transition-all">
                                <p className="text-[10px] text-[#7b6853] font-black tracking-[0.3em] uppercase mb-4">Palmarés</p>
                                <p className="text-6xl font-header font-black text-[#2b1d12] group-hover:text-gold transition-colors">
                                    {activeSummaryTeam ? (activeSummaryTeam as any).titles || 0 : 0} 
                                    <span className="text-xs font-black text-[#7b6853] uppercase ml-4 tracking-widest italic">Título</span>
                                </p>
                            </div>
                        </section>
                    </div>
                )}

                {/* Team List Table */}
                <section className="space-y-4">
                    <div className="flex flex-col gap-4 px-2">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="text-[9px] font-black text-[#7b6853] uppercase tracking-[0.3em]">
                                Mostrando {filteredTeams.length} franquicias
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="inline-flex rounded-2xl border border-[rgba(111,87,56,0.12)] bg-[rgba(255,251,241,0.72)] p-1 shadow-[0_10px_24px_rgba(89,59,21,0.04)]">
                                    <button
                                        onClick={() => setTeamViewMode('list')}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                                            teamViewMode === 'list'
                                                ? 'bg-gold text-black shadow-lg shadow-gold/10'
                                                : 'text-[#7b6853] hover:text-[#2b1d12]'
                                        }`}
                                    >
                                        <span className="material-symbols-outlined text-sm">view_list</span>
                                        Lista
                                    </button>
                                    <button
                                        onClick={() => setTeamViewMode('grid')}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                                            teamViewMode === 'grid'
                                                ? 'bg-gold text-black shadow-lg shadow-gold/10'
                                                : 'text-[#7b6853] hover:text-[#2b1d12]'
                                        }`}
                                    >
                                        <span className="material-symbols-outlined text-sm">grid_view</span>
                                        Cuadrícula
                                    </button>
                                </div>
                                <select
                                    value={sortMode}
                                    onChange={(e) => setSortMode(e.target.value as 'tv' | 'treasury' | 'name')}
                                    className="blood-ui-input rounded-xl px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-[#2b1d12]"
                                >
                                    <option value="tv">Orden: TV real</option>
                                    <option value="treasury">Orden: Tesoreria</option>
                                    <option value="name">Orden: Nombre</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            {[
                                { key: 'levelUps', label: 'Con subidas', count: filterCounts.levelUps },
                                { key: 'injuries', label: 'Con bajas', count: filterCounts.injuries },
                                { key: 'incomplete', label: 'Incompleta', count: filterCounts.incomplete },
                            ].map((filter) => {
                                const active = statusFilters[filter.key as keyof typeof statusFilters];
                                return (
                                    <button
                                        key={filter.key}
                                        onClick={() =>
                                            setStatusFilters((prev) => ({
                                                ...prev,
                                                [filter.key]: !prev[filter.key as keyof typeof prev],
                                            }))
                                        }
                                        className={`px-4 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all ${
                                            active
                                                ? 'bg-gold text-black border-gold shadow-lg shadow-gold/10'
                                                : 'bg-[rgba(255,251,241,0.72)] text-[#7b6853] border-[rgba(111,87,56,0.12)] hover:text-[#2b1d12]'
                                        }`}
                                    >
                                        {filter.label} ({filter.count})
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {teamViewMode === 'list' ? (
                        <>
                            <div className="hidden md:grid grid-cols-1 md:grid-cols-[minmax(0,3.15fr)_minmax(110px,0.54fr)_minmax(165px,0.66fr)_minmax(165px,0.7fr)] px-10 py-4 text-[9px] font-black text-[#7b6853] uppercase tracking-[0.3em]">
                                <div className="text-left">Equipo / Nombre</div>
                                <div className="text-center">TV real</div>
                                <div className="text-center">Plantilla / Tesoreria / Record</div>
                                <div className="text-right">Acción</div>
                            </div>

                            <div className="space-y-3">
                                {filteredTeams.map(renderTeamCard)}

                                {filteredTeams.length === 0 && (
                                    <div className="py-32 text-center bg-[rgba(255,251,241,0.5)] border border-dashed border-[rgba(111,87,56,0.12)] rounded-3xl">
                                        <span className="material-symbols-outlined text-6xl text-[#7b6853]/20 mb-6">stadia_controller</span>
                                        <h3 className="text-sm font-header font-black text-[#7b6853] uppercase italic tracking-widest mb-4">No se encontraron franquicias activas</h3>
                                        <button onClick={() => setIsCreating(true)} className="px-8 py-3 rounded-xl bg-gold text-black border border-gold/20 text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all">Fundar Primer Equipo</button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-5">
                            {filteredTeams.map(renderTeamCard)}

                            {filteredTeams.length === 0 && (
                                <div className="md:col-span-2 xl:col-span-2 py-32 text-center bg-[rgba(255,251,241,0.5)] border border-dashed border-[rgba(111,87,56,0.12)] rounded-3xl">
                                    <span className="material-symbols-outlined text-6xl text-[#7b6853]/20 mb-6">stadia_controller</span>
                                    <h3 className="text-sm font-header font-black text-[#7b6853] uppercase italic tracking-widest mb-4">No se encontraron franquicias activas</h3>
                                    <button onClick={() => setIsCreating(true)} className="px-8 py-3 rounded-xl bg-gold text-black border border-gold/20 text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all">Fundar Primer Equipo</button>
                                </div>
                            )}
                        </div>
                    )}
                </section>
            </main>

            <footer className="max-w-7xl mx-auto px-6 py-20 border-t border-white/5 text-center mt-20">
                <p className="text-gray-600 text-[10px] uppercase tracking-[0.6em] font-black">© 2499 BLOOD BOWL MANAGEMENT SYSTEM — EL GREMIO DE REIKLAND</p>
                <div className="mt-6 flex justify-center gap-6">
                    <button onClick={handleImportClick} className="text-[9px] font-black text-gray-500 hover:text-gold uppercase tracking-widest transition-all">Importar JSON</button>
                    <button onClick={() => setIsExportModalOpen(true)} className="text-[9px] font-black text-gray-500 hover:text-gold uppercase tracking-widest transition-all">Exportar Datos</button>
                </div>
                <input type="file" accept=".json" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
            </footer>

            {/* Reuse existing export modal and confirmation logic */}
            {isExportModalOpen && (
                <div className="fixed inset-0 bg-black/98 backdrop-blur-xl flex items-center justify-center z-[200] p-4" onClick={() => setIsExportModalOpen(false)}>
                    <div className="bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl" onClick={e => e.stopPropagation()}>
                        <h3 className="text-2xl font-header font-black text-gold uppercase italic tracking-tighter mb-8 text-center underline decoration-gold/20 underline-offset-8">Archivo del Gremio</h3>
                        <div className="max-h-[50vh] overflow-y-auto space-y-3 custom-scrollbar pr-2">
                             <div className="flex items-center gap-3 p-3 blood-ui-light-card rounded-xl border border-[rgba(111,87,56,0.10)] cursor-pointer hover:bg-[rgba(255,251,241,0.9)] transition-all mb-4" onClick={(e) => { e.stopPropagation(); handleSelectAllForExport(selectedTeamsForExport.length !== teams.length); }}>
                                <input type="checkbox" checked={teams.length > 0 && selectedTeamsForExport.length === teams.length} readOnly className="h-4 w-4 rounded border-gold/20 text-gold focus:ring-gold bg-black/40" />
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Seleccionar Todos</span>
                            </div>
                            {teams.map(t => (
                                <div key={t.id} className="flex items-center gap-3 blood-ui-light-card p-4 rounded-xl border border-[rgba(111,87,56,0.10)] hover:border-gold/30 transition-all cursor-pointer" onClick={() => handleExportSelectionChange(t.id!)}>
                                    <input type="checkbox" checked={selectedTeamsForExport.includes(t.id!)} readOnly className="h-4 w-4 rounded border-gold/20 text-gold focus:ring-gold bg-black/40" />
                                    <span className="text-sm font-header font-bold text-[#2b1d12] italic tracking-tighter uppercase">{t.name}</span>
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
        </div>
    );
};

export default TeamManager;








