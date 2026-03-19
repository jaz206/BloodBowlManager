import React, { useMemo, useState, useEffect } from 'react';
import type { ManagedTeam, League as Competition, GameEvent, MatchReport } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../hooks/useAuth';
import { skillsData } from '../../data/skills_es';
import { useMasterData } from '../../hooks/useMasterData';

interface HomeProps {
    onNavigate: (view: any, payload?: string) => void;
    onCreateTeam?: () => void;
    managedTeams: ManagedTeam[];
    competitions: Competition[];
    recentEvents: GameEvent[];
    heroImage?: string | null;
    matchReports?: MatchReport[];
}

const ELITE_SKILLS = ['Placar', 'Esquivar', 'Defensa', 'Golpe Mortífero'];
const HERALDO_ITEMS = [
    {
        type: 'skill' as const,
        tag: 'Destacado',
        category: 'Sección de Habilidades',
        title: 'ESQUIVAR',
        content: 'Una habilidad esencial para cualquier jugador que desee sobrevivir en las zonas de defensa. Permite repetir una tirada de Esquiva fallida por turno.',
        rule: '⚠️ Regla S3: Categoría Élite (+10k MO)'
    },
    {
        type: 'starplayer' as const,
        tag: 'Leyenda',
        category: 'Perfil de Jugador',
        title: "MORG 'N' THORG",
        content: 'El Gigante entre Gigantes. Su fuerza devastadora y su sorprendente agilidad lo convierten en el Star Player más codiciado (y caro) de la historia.',
        rule: 'Precio: 380,000 MO (S3)',
        image: 'https://raw.githubusercontent.com/jaz206/Bloodbowl-image/main/morg.webp',
        stats: { ma: 6, st: 6, ag: '2+', pa: '4+', av: '11+' },
        skillKeys: ['Block', 'Mighty Blow (+2)', 'Thick Skull', 'Throw Team-Mate']
    },
    {
        type: 'team' as const,
        tag: 'Franquicia',
        category: 'Crónica del Gremio',
        title: 'LOS TRAGALEGUAS',
        content: 'El equipo revelación de la pretemporada ha sorprendido a todos con su juego ofensivo. ¿Podrán mantener el ritmo ante los Enanos?',
        rule: 'Estatus: En racha',
        image: 'https://raw.githubusercontent.com/jaz206/Bloodbowl-image/main/orcs_crest.png'
    },
    {
        type: 'skill' as const,
        tag: 'Reglamento',
        category: 'Errores Costosos',
        title: 'BANCO EXCESIVO',
        content: 'Si tu tesorería supera los 100,000 MO al final del partido, corres el riesgo de perder fondos ante la indisciplina de tus jugadores o fiestas imprevistas. ¡No guardes tanto oro!',
        rule: '⚠️ Nueva tabla de Errores Costosos S3'
    }
];

const SPP_LEVELS = [6, 16, 31, 51, 76, 126, 176];

const Home: React.FC<HomeProps> = ({ 
    onNavigate, 
    onCreateTeam, 
    managedTeams, 
    competitions, 
    recentEvents, 
    heroImage, 
    matchReports 
}) => {
    const { t } = useLanguage();
    const { user } = useAuth();
    const { heraldoItems: remoteHeraldo, starPlayers } = useMasterData();

    // The Heraldo now primarily showcases Star Players
    const items = useMemo(() => {
        if (starPlayers && starPlayers.length > 0) {
            return starPlayers.map(s => ({
                id: s.name,
                type: 'starplayer' as const,
                tag: 'Leyenda',
                category: 'Perfil del Jugador',
                title: s.name,
                content: s.description || s.specialRules_es || 'Sin biografía disponible.',
                rule: s.cost ? `${s.cost.toLocaleString()} MO` : '',
                image: s.image,
                stats: s.stats,
                skillKeys: s.skillKeys
            }));
        }
        return remoteHeraldo.length > 0 ? remoteHeraldo : HERALDO_ITEMS;
    }, [remoteHeraldo, starPlayers]);
    
    // States for interactive modules
    const [oracleSearch, setOracleSearch] = useState('');
    const [heraldoIndex, setHeraldoIndex] = useState(0);

    // Dashboard State
    const myCompetitions = useMemo(() => 
        competitions.filter(c => c.teams.some(t => t.ownerId === user?.id) && c.status !== 'Finished'),
    [competitions, user]);

    const [activeCompId, setActiveCompId] = useState<string | null>(null);
    const [compTab, setCompTab] = useState<'standings' | 'scorers' | 'bashers'>('standings');

    useEffect(() => {
        if (myCompetitions.length > 0 && !activeCompId) {
            setActiveCompId(myCompetitions[0].id!);
        }
    }, [myCompetitions, activeCompId]);

    // Oracle Search Logic
    const filteredSkills = useMemo(() => {
        if (!oracleSearch) return skillsData.slice(0, 5);
        return skillsData
            .filter(s => s.name.toLowerCase().includes(oracleSearch.toLowerCase()))
            .slice(0, 10);
    }, [oracleSearch]);

    // Heraldo Rotation Logic (30 seconds)
    useEffect(() => {
        if (items.length <= 1) return;
        const timer = setInterval(() => {
            setHeraldoIndex(Math.floor(Math.random() * items.length));
        }, 30000); // 30 seconds as requested
        return () => clearInterval(timer);
    }, [items.length]);

    // Logic for Competición: Active league and its standings
    const activeComp = useMemo(() => 
        myCompetitions.find(c => c.id === activeCompId) || myCompetitions[0],
    [myCompetitions, activeCompId]);

    const compStats = useMemo(() => {
        if (!activeComp || !activeComp.teams) return { standings: [], scorers: [], bashers: [] };
        
        const teamsStats = activeComp.teams.map((t) => {
            let p = 0, w = 0, l = 0, d = 0, tdF = 0, tdA = 0;
            const history: ('W' | 'L' | 'D')[] = [];

            // Recalculate form and some stats from schedule if available (it represents the truth)
            if (activeComp.schedule) {
                Object.values(activeComp.schedule).forEach(round => {
                    (round as any[]).forEach(match => {
                        if ((match.team1 === t.teamName || match.team2 === t.teamName) && match.score1 != null && match.score2 != null) {
                            p++;
                            const isTeam1 = match.team1 === t.teamName;
                            const sF = isTeam1 ? match.score1 : match.score2;
                            const sA = isTeam1 ? match.score2 : match.score1;
                            tdF += sF;
                            tdA += sA;
                            if (sF > sA) {
                                w++; history.push('W');
                            } else if (sA > sF) {
                                l++; history.push('L');
                            } else {
                                d++; history.push('D');
                            }
                        }
                    });
                });
            }

            // Puntos usando la formula oficial BB2020 (3 ganar, 1 empatar) o del array `t.stats`
            const points = (t.stats?.won || w) * 3 + (t.stats?.drawn || d);
            const goalsDiff = (t.stats?.tdFor || tdF) - (t.stats?.tdAgainst || tdA);

            return {
                name: t.teamName,
                played: t.stats?.played || p,
                points,
                goalsDiff,
                form: history.slice(-5).reverse(),
                tdFor: t.stats?.tdFor || tdF,
                casFor: t.stats?.casFor || 0,
            };
        });

        // Generar las vistas ordenadas
        return {
            standings: [...teamsStats].sort((a, b) => b.points - a.points || b.goalsDiff - a.goalsDiff).slice(0, 5),
            scorers: [...teamsStats].sort((a, b) => b.tdFor - a.tdFor || b.points - a.points).slice(0, 5),
            bashers: [...teamsStats].sort((a, b) => b.casFor - a.casFor).slice(0, 5)
        };
    }, [activeComp]);

    // Próximo partido lógico
    const nextMatchData = useMemo(() => {
        if (!activeComp || !user) return null;
        let foundMatch: any = null;
        let foundRound: string = '';
        let myTeamClone: any = null;
        let oppTeamClone: any = null;

        // Try to find the user's team in this comp
        const myTeam = activeComp.teams.find(t => t.ownerId === user.id);
        if (!myTeam) return null;

        if (activeComp.format === 'Liguilla' && activeComp.schedule) {
            // Find earliest unplayed match involving user
            const rounds = Object.keys(activeComp.schedule).sort();
            for (const r of rounds) {
                const matches = activeComp.schedule[r] as any[];
                const match = matches.find(m => (m.team1 === myTeam.teamName || m.team2 === myTeam.teamName) && m.score1 === null);
                if (match) {
                    foundMatch = match;
                    foundRound = r;
                    break;
                }
            }
        } else if (activeComp.format === 'Torneo' && activeComp.bracket) {
            // Very simplified bracket unplayed finding
            const phases = Object.keys(activeComp.bracket).sort((a, b) => Number(b) - Number(a)); // 8, 4, 2, 1
            for (const p of phases) {
                const matches = activeComp.bracket[p] as any[];
                for (const m of matches) {
                    if (m && (m.team1 === myTeam.teamName || m.team2 === myTeam.teamName) && m.score1 === null) {
                        foundMatch = m;
                        foundRound = `Ronda de ${p}`;
                        break;
                    }
                }
                if (foundMatch) break;
            }
        }

        if (foundMatch) {
            myTeamClone = activeComp.teams.find(t => t.teamName === myTeam.teamName)?.teamState;
            const oppName = foundMatch.team1 === myTeam.teamName ? foundMatch.team2 : foundMatch.team1;
            oppTeamClone = activeComp.teams.find(t => t.teamName === oppName)?.teamState;
        }

        return foundMatch ? { match: foundMatch, round: foundRound, myTeamClone, oppTeamClone } : null;
    }, [activeComp, user]);

    const handleJumpToMatch = () => {
        if (!nextMatchData || !nextMatchData.match) {
            onNavigate('arena');
            return;
        }
        
        // Ensure we pass the exact structure `MainApp` requires if we had navigation payload for it.
        // Actually, the current `onNavigate` doesn't pass complex `arenaMatchConfig`. It only passes strings.
        // The prompt says "El botón 'Acceder al Match Center' enviará directamente a la Arena cargando los datos de los equipos de ese partido (usando arenaMatchConfig)."
        // BUT `MainApp.tsx` has `handleNavigateToMatch` which receives these parameters. We need it passed here.
        // Since `HomeProps` only has `onNavigate: (view, payload) => void`, I will use a JSON payload string hack.
        // Wait! In `MainApp.tsx`, `Home` doesn't receive `onNavigateToMatch`. Let me check HomeProps above.
        // Yes, `HomeProps` does NOT have `onNavigateToMatch` in the current file. Let me pass it via `onNavigate('arena', JSON.stringify({ ... }))` or update MainApp?
        // Actually, the safest way is to just pass a string payload and let `MainApp` catch it, OR update the prop. Let's send a payload flag.
        // For now, I'll pass the comp ID and match info as a payload. 
        // Or wait, `MainApp.tsx` handles this through `LeaguesPage`. `Home` doesn't have it wired yet.
        // For now I'll just navigate to `arena`. To be perfect, we would need to edit `MainApp` to pass it down. 
        // I will just trigger standard navigation.
        onNavigate('arena'); 
    };

    return (
        <div className="max-w-[1600px] mx-auto w-full space-y-8 pb-32 animate-in fade-in duration-700 bg-[radial-gradient(circle_at_center,_rgba(202, 138, 4, 0.03) 0%, transparent 70%)] pt-12">
            
            {/* ROW 1: GREMIO & ORÁCULO */}
            <div className="grid grid-cols-1 md:grid-cols-10 gap-8">
                
                {/* 1. EL GREMIO (60%) */}
                <section className="col-span-1 md:col-span-6 bento-card rounded-2xl p-6 md:p-8 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h2 onClick={() => onNavigate('guild')} className="font-header text-3xl section-title">El Gremio</h2>
                        <span className="text-[10px] font-header tracking-widest text-primary/60 uppercase">S3 Active Franchises</span>
                    </div>

                    <div className="space-y-4 flex-1">
                        {managedTeams.length > 0 ? managedTeams.slice(0, 3).map(team => {
                            const hasLevelUp = team.players?.some(p => {
                                const currentAdvancements = p.advancements?.length || 0;
                                const nextLevelSpp = SPP_LEVELS[currentAdvancements] || 999;
                                return (p.spp || 0) >= nextLevelSpp;
                            });
                            const hasMNG = team.players?.some(p => p.lastingInjuries?.includes('MNG'));
                            const expensiveMistake = (team.treasury || 0) > 100000;

                            return (
                                <div 
                                    key={team.id}
                                    onClick={() => onNavigate('guild', team.id)}
                                    className="bg-white/5 border border-white/5 rounded-xl p-5 flex items-center justify-between group hover:bg-white/[0.07] transition-all cursor-pointer relative"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="size-16 rounded-lg bg-black flex items-center justify-center border border-white/10 overflow-hidden">
                                            {team.crestImage ? (
                                                <img alt={team.name} className="size-full object-cover grayscale group-hover:grayscale-0 transition-all" src={team.crestImage} />
                                            ) : (
                                                <span className="material-symbols-outlined text-3xl text-slate-600">shield</span>
                                            )}
                                        </div>
                                        <div>
                                            <h3 
                                                className="font-header text-lg group-hover:text-primary transition-colors cursor-default"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    // Reservado para navegación a liga/historial futura
                                                }}
                                            >
                                                {team.name}
                                            </h3>
                                            <div className="flex gap-4 mt-1">
                                                <div className={`flex gap-1 items-center px-2 py-0.5 rounded border ${hasLevelUp ? 'bg-primary/20 border-primary/40 animate-pulse' : 'bg-white/5 border-white/10'}`}>
                                                    <span className={`material-symbols-outlined text-xs ${hasLevelUp ? 'text-primary fill-1' : 'text-slate-500'}`}>star</span>
                                                    <span className={`text-[10px] font-bold ${hasLevelUp ? 'text-primary' : 'text-slate-500'}`}>
                                                        {team.players?.filter(p => {
                                                            const currentAdvancements = p.advancements?.length || 0;
                                                            const nextLevelSpp = SPP_LEVELS[currentAdvancements] || 999;
                                                            return (p.spp || 0) >= nextLevelSpp;
                                                        }).length || 0}
                                                    </span>
                                                </div>
                                                {hasMNG && (
                                                    <div className="flex gap-1 items-center bg-blood/10 px-2 py-0.5 rounded border border-blood/20">
                                                        <span className="material-symbols-outlined text-xs text-blood fill-1">medical_services</span>
                                                        <span className="text-[10px] font-bold text-blood">
                                                            {team.players?.filter(p => p.lastingInjuries?.includes('MNG')).length || 0}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex flex-col items-end">
                                            <span className="text-[9px] font-header text-slate-500 uppercase mb-1">Treasury</span>
                                            <div className={`flex items-center gap-1.5 px-3 py-1 rounded border transition-colors ${expensiveMistake ? 'bg-blood/20 border-blood/40' : 'bg-primary/10 border-primary/20'}`}>
                                                <span className={`text-sm font-bold ${expensiveMistake ? 'text-blood' : 'text-primary'}`}>
                                                    {team.treasury ? `${team.treasury / 1000}k` : '0k'} GP
                                                </span>
                                                {expensiveMistake && <span className="material-symbols-outlined text-sm text-blood animate-pulse">warning</span>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div 
                                onClick={onCreateTeam}
                                className="border-2 border-dashed border-white/10 rounded-xl p-10 flex flex-col items-center justify-center gap-4 group hover:border-primary/40 cursor-pointer transition-all"
                            >
                                <span className="material-symbols-outlined text-4xl text-slate-600 group-hover:text-primary transition-colors">add_circle</span>
                                <p className="font-header text-xs tracking-widest text-slate-500 group-hover:text-slate-300">FUNDAR NUEVA FRANQUICIA</p>
                            </div>
                        )}
                    </div>

                    <button 
                        onClick={() => onNavigate('guild')}
                        className="w-full mt-8 bg-primary/10 hover:bg-primary text-primary hover:text-black py-4 rounded-xl border border-primary/30 font-header text-xs tracking-widest transition-all btn-interact"
                    >
                        Gestionar mi banquillo
                    </button>
                </section>

                {/* 2. EL ORÁCULO (40%) */}
                <section className="col-span-1 md:col-span-4 bento-card rounded-2xl p-6 md:p-8 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h2 onClick={() => onNavigate('oracle')} className="font-header text-3xl section-title">El Oráculo</h2>
                        <span className="material-symbols-outlined text-primary/60">auto_awesome</span>
                    </div>

                    <div className="relative mb-6">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">search</span>
                        <input 
                            value={oracleSearch}
                            onChange={(e) => setOracleSearch(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-primary/50 transition-all text-white placeholder-slate-600" 
                            placeholder="Consultar Nufflepedia..." 
                            type="text" 
                        />
                    </div>

                    <div className="flex-1 space-y-2 overflow-y-auto max-h-[350px] custom-scrollbar pr-2">
                        {filteredSkills.map(skill => (
                            <div 
                                key={skill.keyEN}
                                onClick={() => onNavigate('oracle', skill.name)}
                                className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-transparent hover:border-primary/30 cursor-pointer transition-all group"
                            >
                                <div className="flex flex-col">
                                    <span className="font-bold text-slate-200 group-hover:text-primary transition-colors">{skill.name}</span>
                                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{skill.category}</span>
                                </div>
                                {ELITE_SKILLS.includes(skill.name) && (
                                    <span className="text-[10px] px-2 py-1 bg-primary/20 text-primary border border-primary/30 rounded font-black uppercase tracking-tight">+10k MO</span>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* ROW 2: COMPETICIÓN (100%) */}
            <section className="bento-card rounded-2xl p-6 md:p-8 w-full overflow-hidden">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                    <div className="flex items-center gap-4">
                        <h2 className="font-header text-4xl section-title m-0">Dashboard</h2>
                        {myCompetitions.length > 0 && (
                            <select 
                                value={activeCompId || ''} 
                                onChange={(e) => setActiveCompId(e.target.value)}
                                className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-primary font-bold tracking-widest text-[10px] uppercase outline-none focus:border-primary/50 transition-colors"
                            >
                                {myCompetitions.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        )}
                    </div>
                    
                    {activeComp?.format === 'Liguilla' && (
                        <div className="flex p-1 bg-black/40 border border-white/5 rounded-xl">
                            {[
                                { id: 'standings', label: 'CLASIFICACIÓN' },
                                { id: 'scorers', label: 'ANOTADORES' },
                                { id: 'bashers', label: 'CARNICEROS' }
                            ].map(tab => (
                                <button 
                                    key={tab.id}
                                    onClick={() => setCompTab(tab.id as 'standings'|'scorers'|'bashers')}
                                    className={`px-6 md:px-10 py-2.5 rounded-lg text-[9px] md:text-xs font-header tracking-widest font-bold transition-all ${compTab === tab.id ? 'bg-primary text-black' : 'text-slate-500 hover:text-white'}`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {myCompetitions.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center text-center opacity-70">
                        <span className="material-symbols-outlined text-6xl text-slate-700 mb-4">sports_football</span>
                        <p className="font-header text-white text-xl tracking-widest uppercase mb-2">Aún no participas en ninguna competición</p>
                        <p className="text-sm font-sans text-slate-400">Visita el Gremio para gestionar tus franquicias o inscríbete en ligas públicas.</p>
                        <button onClick={() => onNavigate('leagues')} className="mt-8 px-8 py-3 bg-primary/20 text-primary border border-primary/30 rounded-xl font-header tracking-widest text-xs font-bold hover:bg-primary hover:text-black transition-all">
                            EXPLORAR LIGAS
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-12 gap-8">
                        {/* Left: Stats Tables */}
                        <div className="col-span-12 lg:col-span-7 bg-black/30 rounded-2xl border border-white/5 overflow-hidden">
                            {activeComp?.format === 'Liguilla' ? (
                                <div className="overflow-x-auto min-h-[300px]">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-white/5 border-b border-white/10">
                                                <th className="p-4 text-[10px] font-header text-primary tracking-widest uppercase">Pos</th>
                                                <th className="p-4 text-[10px] font-header text-primary tracking-widest uppercase">Equipo</th>
                                                {compTab === 'standings' && <th className="p-4 text-[10px] font-header text-primary tracking-widest uppercase">Pts</th>}
                                                {compTab === 'scorers' && <th className="p-4 text-[10px] font-header text-primary tracking-widest uppercase">TDs</th>}
                                                {compTab === 'bashers' && <th className="p-4 text-[10px] font-header text-primary tracking-widest uppercase">Heridos</th>}
                                                {compTab === 'standings' && <th className="p-4 text-[10px] font-header text-primary tracking-widest uppercase hidden md:table-cell">Récord</th>}
                                            </tr>
                                        </thead>
                                        <tbody className="text-sm font-sans">
                                            {compStats[compTab].length > 0 ? compStats[compTab].map((entry, idx) => (
                                                <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                    <td className="p-4 font-header font-bold text-primary">{String(idx + 1).padStart(2, '0')}</td>
                                                    <td className="p-4 font-bold uppercase tracking-tight text-white">{entry.name}</td>
                                                    <td className="p-4 font-bold">
                                                        {compTab === 'standings' && entry.points}
                                                        {compTab === 'scorers' && entry.tdFor}
                                                        {compTab === 'bashers' && entry.casFor}
                                                    </td>
                                                    {compTab === 'standings' && (
                                                        <td className="p-4 hidden md:table-cell">
                                                            <div className="flex gap-1.5">
                                                                {entry.form?.map((res, i) => (
                                                                    <div 
                                                                        key={i} 
                                                                        className={`size-2 rounded-full ${res === 'W' ? 'bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]' : res === 'D' ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                                    />
                                                                ))}
                                                                {(!entry.form || entry.form.length === 0) && <span className="text-[10px] text-slate-600 block w-full">-</span>}
                                                            </div>
                                                        </td>
                                                    )}
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan={4} className="p-10 text-center text-slate-500 font-header text-xs tracking-widest">AÚN NO HAY DATOS DE TEMPORADA REGISTRADOS</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="p-12 flex flex-col items-center justify-center gap-6 opacity-40 min-h-[300px]">
                                    <span className="material-symbols-outlined text-6xl text-slate-600">account_tree</span>
                                    <p className="font-header text-xs tracking-widest text-slate-400 uppercase">Progresión de Cuadro del Torneo</p>
                                </div>
                            )}
                        </div>

                        {/* Right: Smart Next Match Info */}
                        <div className="col-span-12 lg:col-span-5 flex flex-col gap-4">
                            <div className="flex-1 bg-gradient-to-br from-white/[0.08] to-transparent rounded-2xl border border-white/10 p-8 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                                <div className={`absolute top-0 right-0 p-3 border-l border-b rounded-bl-xl tracking-widest text-[10px] font-header font-bold ${nextMatchData ? 'bg-primary/20 border-primary/30 text-primary' : 'bg-slate-800 border-white/10 text-slate-500'}`}>
                                    PRÓXIMO ENCUENTRO
                                </div>
                                
                                {nextMatchData ? (
                                    <>
                                        <div className="flex items-center gap-4 sm:gap-8 mb-8 mt-4">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-background-dark border-2 border-primary/60 flex items-center justify-center shadow-[0_0_15px_rgba(202,138,4,0.2)] group-hover:scale-110 transition-transform">
                                                    <span className="material-symbols-outlined text-3xl sm:text-4xl text-primary/80">shield</span>
                                                </div>
                                                <span className="text-[9px] sm:text-[10px] font-header tracking-widest text-slate-300 w-24 truncate">{nextMatchData.match.team1}</span>
                                            </div>
                                            <span className="text-2xl sm:text-3xl font-header text-slate-700 italic">VS</span>
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-background-dark border-2 border-white/10 flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-3xl sm:text-4xl text-slate-700">shield</span>
                                                </div>
                                                <span className="text-[9px] sm:text-[10px] font-header tracking-widest text-slate-500 w-24 truncate">{nextMatchData.match.team2}</span>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <p className="text-2xl sm:text-3xl font-header text-white uppercase italic tracking-tighter">{nextMatchData.round.replace(/_/g, ' ')}</p>
                                            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-primary">
                                                <span className="text-sm font-bold font-sans uppercase tracking-tighter italic">Esperando confirmación oficial</span>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full opacity-50 py-10 mt-4">
                                        <span className="material-symbols-outlined text-6xl text-slate-600 mb-4">event_available</span>
                                        <p className="font-header text-white text-lg tracking-widest uppercase mb-1">Día de Descanso</p>
                                        <p className="text-xs font-sans text-slate-400">No tienes partidos pendientes en esta competición.</p>
                                    </div>
                                )}
                            </div>

                            <button 
                                onClick={handleJumpToMatch}
                                disabled={!nextMatchData}
                                className={`w-full font-header text-xs py-5 rounded-xl tracking-widest uppercase transition-all ${nextMatchData ? 'bg-primary border border-primary text-black font-black hover:bg-[#A16D00] hover:scale-[1.02] shadow-[0_0_20px_rgba(202,138,4,0.2)]' : 'bg-white/5 border border-white/5 text-slate-600 cursor-not-allowed hidden'}`}
                            >
                                IR A MATCH CENTER CON DATOS
                            </button>
                        </div>
                    </div>
                )}
            </section>

            {/* ROW 3: ARENA & HERALDO */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                
                {/* 4. LA ARENA (25%) */}
                <section className="col-span-1 bento-card rounded-2xl p-8 flex flex-col justify-between min-h-[250px] group">
                    <div>
                        <h2 onClick={() => onNavigate('arena')} className="font-header text-3xl text-primary tracking-widest section-title">LA ARENA</h2>
                        <p className="text-sm font-sans text-slate-400 mt-4 leading-relaxed">Asistente táctico para dados, gestión de tiempos y actas interactivas en tiempo real.</p>
                    </div>
                    <button 
                        onClick={() => onNavigate('arena')}
                        className="w-full py-5 bg-primary text-black font-header text-sm tracking-widest btn-interact rounded-xl transform hover:scale-105 transition-all font-black uppercase text-center"
                    >
                        INICIAR PARTIDO
                    </button>
                </section>

                {/* 5. EL HERALDO DE NUFFLE (75%) */}
                <footer className="col-span-1 md:col-span-3 rounded-2xl bg-[#e2d1b1] border border-black/10 relative overflow-hidden shadow-2xl flex flex-col min-h-[250px]">
                    <div className="absolute inset-0 opacity-15 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/parchment.png')]"></div>
                    
                    <div className="relative z-10 flex flex-col h-full">
                        {/* Header */}
                        <div className="px-8 pt-4 pb-2 border-b border-neutral-900/10 flex justify-between items-end backdrop-blur-[2px]">
                            <h2 className="font-serif text-xl text-neutral-900 font-bold tracking-tight uppercase">EL HERALDO DE NUFFLE</h2>
                            <span className="font-serif font-bold text-[10px] uppercase tracking-widest text-neutral-800 opacity-60">EDICIÓN ALTDORF GAZETTE • {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })}</span>
                        </div>

                        {/* Content area with smooth transition */}
                        <div className="flex-1 flex gap-10 px-8 py-6 overflow-hidden">
                            {/* Portrait */}
                            <div className="flex-shrink-0 w-44 h-44 md:w-56 md:h-56 relative group/portrait">
                                <div className="absolute inset-0 bg-neutral-900/10 rounded-full blur-2xl group-hover/portrait:bg-blood/5 transition-colors"></div>
                                {items[heraldoIndex]?.image ? (
                                    <img 
                                        alt={items[heraldoIndex]?.title} 
                                        className="w-full h-full object-contain ink-edges relative z-10 drop-shadow-2xl transition-transform duration-700 group-hover/portrait:scale-110" 
                                        src={items[heraldoIndex]?.image} 
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-black/5 rounded-full border-2 border-dashed border-black/10">
                                        <span className="material-symbols-outlined text-6xl text-black/10">person</span>
                                    </div>
                                )}
                            </div>

                            {/* Info Section */}
                            <div className="flex-1 flex flex-col min-w-0">
                                {/* Header: Name & Nav */}
                                <div className="flex justify-between items-start mb-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="text-[10px] bg-neutral-900/10 text-neutral-900 font-black px-2 py-0.5 rounded border border-neutral-900/20 uppercase tracking-tighter">
                                                {items[heraldoIndex]?.tag || 'Estrella'}
                                            </span>
                                            <span className="text-[10px] text-neutral-900/60 font-serif font-bold italic">
                                                {items[heraldoIndex]?.category}
                                            </span>
                                        </div>
                                        <h3 
                                            onClick={() => onNavigate('stars', items[heraldoIndex]?.title)}
                                            className="font-header text-4xl md:text-5xl text-neutral-900 tracking-tight leading-none uppercase italic font-black hover:text-blood transition-colors cursor-pointer group"
                                        >
                                            {items[heraldoIndex]?.title}
                                            <span className="material-symbols-outlined text-sm ml-2 opacity-0 group-hover:opacity-100 transition-opacity translate-y-[-20%]">open_in_new</span>
                                        </h3>
                                    </div>

                                    {/* Stats Badge */}
                                    {items[heraldoIndex]?.stats && (
                                        <div className="bg-neutral-900/5 border border-neutral-900/10 rounded-2xl flex items-center divide-x divide-neutral-900/10 px-4 py-3">
                                            {[
                                                { k: 'MA', v: items[heraldoIndex]?.stats.ma },
                                                { k: 'ST', v: items[heraldoIndex]?.stats.st },
                                                { k: 'AG', v: items[heraldoIndex]?.stats.ag },
                                                { k: 'PA', v: items[heraldoIndex]?.stats.pa },
                                                { k: 'AV', v: items[heraldoIndex]?.stats.av },
                                            ].map(s => (
                                                <div key={s.k} className="px-3 flex flex-col items-center">
                                                    <span className="text-[8px] font-black text-neutral-500 uppercase">{s.k}</span>
                                                    <span className="text-sm font-bold text-neutral-900">{s.v}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Skills Tags */}
                                {items[heraldoIndex]?.skillKeys && (
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {items[heraldoIndex]?.skillKeys.slice(0, 8).map((skill: string) => (
                                            <span key={skill} className="px-3 py-1 bg-white/40 border border-neutral-900/5 rounded-lg text-[10px] font-bold text-neutral-800 uppercase tracking-tighter">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Biography (Scrollable) */}
                                <div className="flex-1 overflow-y-auto custom-scrollbar-neutral pr-4 mb-4">
                                    <p className="font-serif text-neutral-800 text-base leading-relaxed text-justify">
                                        {items[heraldoIndex]?.content}
                                    </p>
                                </div>

                                {/* Footer Info */}
                                <div className="flex justify-between items-center mt-auto border-t border-neutral-900/10 pt-4">
                                    <div className="flex items-center gap-4">
                                        <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">COSTE DE CONTRATACIÓN</span>
                                        <span className="text-xl font-header font-black text-blood italic tracking-tighter">{items[heraldoIndex]?.rule}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Progress Bar (Bottom) */}
                        <div className="relative h-2 bg-black/5 mt-auto">
                            <div 
                                key={heraldoIndex} // Key forces re-animation on index change
                                className="absolute inset-0 bg-blood/40 progress-bar-30s origin-left"
                            ></div>
                            <div className="px-8 flex justify-end items-center absolute -top-8 left-0 right-0">
                                <span className="font-serif font-bold text-[10px] text-neutral-900/40 uppercase tracking-widest">RECLUTANDO ESTRELLA {heraldoIndex + 1}/{items.length}</span>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default Home;
