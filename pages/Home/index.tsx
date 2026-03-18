import React, { useMemo, useState, useEffect } from 'react';
import type { ManagedTeam, League as Competition, GameEvent, MatchReport } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../hooks/useAuth';
import { skillsData } from '../../data/skills_es';

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
        tag: 'Destacado',
        category: 'Sección de Habilidades',
        title: 'ESQUIVAR',
        content: 'Una habilidad esencial para cualquier jugador que desee sobrevivir en las zonas de defensa. Permite repetir una tirada de Esquiva fallida por turno.',
        rule: '⚠️ Regla S3: Categoría Élite (+10k MO)',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAoZFoF0guWdurhfUKnNWrVyO86UnCzaVNhEgSYsfz0T93F7TeH25iZmLeS0QWa4IjVeaSyiPc0YqB3eFm5rQfrzw2l2zKd5EZ5nQdipG9E46n6q-mKEbwK1JLI3jma1w-xhZRAc_0cy9a6LCcKOxweoygH8Xz9VJw4cHQlCh9bbOS7SaO-MGxmF0o-_WeV64RUwxLcRvF4wP2oQyv_K-CRVFV1ebuoX2BzEG6zGAhSgSM01rFTFKFJ7oUYyQVQbtTZeczuFYnxLQM'
    },
    {
        tag: 'Leyenda',
        category: 'Perfil de Jugador',
        title: "MORG 'N' THORG",
        content: 'El Gigante entre Gigantes. Su fuerza devastadora y su sorprendente agilidad lo convierten en el Star Player más codiciado (y caro) de la historia.',
        rule: 'Precio: 380,000 MO (S3)',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAoZFoF0guWdurhfUKnNWrVyO86UnCzaVNhEgSYsfz0T93F7TeH25iZmLeS0QWa4IjVeaSyiPc0YqB3eFm5rQfrzw2l2zKd5EZ5nQdipG9E46n6q-mKEbwK1JLI3jma1w-xhZRAc_0cy9a6LCcKOxweoygH8Xz9VJw4cHQlCh9bbOS7SaO-MGxmF0o-_WeV64RUwxLcRvF4wP2oQyv_K-CRVFV1ebuoX2BzEG6zGAhSgSM01rFTFKFJ7oUYyQVQbtTZeczuFYnxLQM'
    },
    {
        tag: 'Reglamento',
        category: 'Errores Costosos',
        title: 'BANCO EXCESIVO',
        content: 'Si tu tesorería supera los 100,000 MO al final del partido, corres el riesgo de perder fondos ante la indisciplina de tus jugadores o fiestas imprevistas.',
        rule: '⚠️ Nueva tabla de Errores Costosos S3',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAoZFoF0guWdurhfUKNWrVyO86UnCzaVNhEgSYsfz0T93F7TeH25iZmLeS0QWa4IjVeaSyiPc0YqB3eFm5rQfrzw2l2zKd5EZ5nQdipG9E46n6q-mKEbwK1JLI3jma1w-xhZRAc_0cy9a6LCcKOxweoygH8Xz9VJw4cHQlCh9bbOS7SaO-MGxmF0o-_WeV64RUwxLcRvF4wP2oQyv_K-CRVFV1ebuoX2BzEG6zGAhSgSM01rFTFKFJ7oUYyQVQbtTZeczuFYnxLQM'
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
    
    // States for interactive modules
    const [oracleSearch, setOracleSearch] = useState('');
    const [heraldoIndex, setHeraldoIndex] = useState(0);
    const [compTab, setCompTab] = useState<'ligas' | 'torneos'>('ligas');

    // Oracle Search Logic
    const filteredSkills = useMemo(() => {
        if (!oracleSearch) return skillsData.slice(0, 5);
        return skillsData
            .filter(s => s.name.toLowerCase().includes(oracleSearch.toLowerCase()))
            .slice(0, 10);
    }, [oracleSearch]);

    // Heraldo Rotation Logic
    useEffect(() => {
        const timer = setInterval(() => {
            setHeraldoIndex(prev => (prev + 1) % HERALDO_ITEMS.length);
        }, 20000); // 20 seconds as requested
        return () => clearInterval(timer);
    }, []);

    // Logic for Competición: Active league and its standings
    const activeLeague = useMemo(() => 
        competitions.find(c => c.format === 'Liguilla' && (c.status as string) === 'In Progress'),
    [competitions]);

    const leagueStandings = useMemo(() => {
        if (!activeLeague || !activeLeague.schedule || !activeLeague.teams) return [];
        
        const teamsStats = activeLeague.teams.map(({ teamName }) => {
            let p = 0, w = 0, l = 0, d = 0, tdF = 0, tdA = 0;
            const history: ('W' | 'L' | 'D')[] = [];

            if (activeLeague.schedule) {
                Object.values(activeLeague.schedule).forEach(round => {
                    (round as any[]).forEach(match => {
                        if ((match.team1 === teamName || match.team2 === teamName) && match.score1 != null && match.score2 != null) {
                            p++;
                            const isTeam1 = match.team1 === teamName;
                            const sF = isTeam1 ? match.score1 : match.score2;
                            const sA = isTeam1 ? match.score2 : match.score1;
                            tdF += sF;
                            tdA += sA;
                            if (sF > sA) {
                                w++;
                                history.push('W');
                            } else if (sA > sF) {
                                l++;
                                history.push('L');
                            } else {
                                d++;
                                history.push('D');
                            }
                        }
                    });
                });
            }

            return {
                name: teamName,
                played: p,
                points: w * 3 + d,
                goalsDiff: tdF - tdA,
                form: history.slice(-5).reverse()
            };
        });

        return teamsStats.sort((a, b) => b.points - a.points || b.goalsDiff - a.goalsDiff).slice(0, 5);
    }, [activeLeague]);

    return (
        <main className="max-w-[1600px] mx-auto w-full space-y-8 pb-32 animate-in fade-in duration-700 bg-[radial-gradient(circle_at_center,_rgba(202,138,4,0.03)_0%,_transparent_70%)]">
            
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
                                    onClick={() => onNavigate('guild')}
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
                                            <h3 className="font-header text-lg group-hover:text-primary transition-colors">{team.name}</h3>
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
                        {t('home.hero.manageGuild') || 'GESTIONAR MI BANQUILLO'}
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
                    <h2 onClick={() => onNavigate('leagues')} className="font-header text-4xl section-title">Competición</h2>
                    <div className="flex p-1 bg-black/40 border border-white/5 rounded-xl">
                        <button 
                            onClick={() => setCompTab('ligas')}
                            className={`px-10 py-2.5 rounded-lg text-xs font-header tracking-widest font-bold transition-all ${compTab === 'ligas' ? 'bg-primary text-black' : 'text-slate-500 hover:text-white'}`}
                        >
                            LIGAS
                        </button>
                        <button 
                            onClick={() => setCompTab('torneos')}
                            className={`px-10 py-2.5 rounded-lg text-xs font-header tracking-widest font-bold transition-all ${compTab === 'torneos' ? 'bg-primary text-black' : 'text-slate-500 hover:text-white'}`}
                        >
                            TORNEOS
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-8">
                    {/* Left: Standings/Bracket */}
                    <div className="col-span-12 lg:col-span-7 bg-black/30 rounded-2xl border border-white/5 overflow-hidden">
                        {compTab === 'ligas' ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-white/5 border-b border-white/10">
                                            <th className="p-4 text-[10px] font-header text-primary tracking-widest uppercase">Pos</th>
                                            <th className="p-4 text-[10px] font-header text-primary tracking-widest uppercase">Equipo</th>
                                            <th className="p-4 text-[10px] font-header text-primary tracking-widest uppercase">Pts</th>
                                            <th className="p-4 text-[10px] font-header text-primary tracking-widest uppercase hidden md:table-cell">Récord</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm font-sans">
                                        {leagueStandings.length > 0 ? leagueStandings.map((entry, idx) => (
                                            <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                <td className="p-4 font-header font-bold text-primary">{String(idx + 1).padStart(2, '0')}</td>
                                                <td className="p-4 font-bold uppercase tracking-tight text-white">{entry.name}</td>
                                                <td className="p-4 font-bold">{entry.points}</td>
                                                <td className="p-4 hidden md:table-cell">
                                                    <div className="flex gap-1.5">
                                                        {entry.form?.map((res, i) => (
                                                            <div 
                                                                key={i} 
                                                                className={`size-2 rounded-full ${res === 'W' ? 'bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]' : res === 'D' ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                            />
                                                        ))}
                                                    </div>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={4} className="p-10 text-center text-slate-500 font-header text-xs tracking-widest">NO HAY DATOS DE CLASIFICACIÓN</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="p-12 flex flex-col items-center justify-center gap-6 opacity-40 grayscale min-h-[300px]">
                                <span className="material-symbols-outlined text-6xl">account_tree</span>
                                <p className="font-header text-xs tracking-widest uppercase">Visualizador de Brackets (Beta S3)</p>
                            </div>
                        )}
                    </div>

                    {/* Right: Match Day Info */}
                    <div className="col-span-12 lg:col-span-5 flex flex-col gap-4">
                        <div className="flex-1 bg-gradient-to-br from-white/[0.08] to-transparent rounded-2xl border border-white/10 p-8 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-3 bg-primary/20 border-l border-b border-primary/30 text-[10px] font-header font-bold text-primary rounded-bl-xl tracking-widest">
                                PRÓXIMO ENCUENTRO
                            </div>
                            
                            <div className="flex items-center gap-8 mb-10">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="size-20 rounded-full bg-background-dark border-2 border-primary/40 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                                        <span className="material-symbols-outlined text-4xl text-primary/80">shield</span>
                                    </div>
                                    <span className="text-[10px] font-header tracking-widest text-slate-300">LOCAL</span>
                                </div>
                                <span className="text-3xl font-header text-slate-800 italic">VS</span>
                                <div className="flex flex-col items-center gap-3">
                                    <div className="size-20 rounded-full bg-background-dark border-2 border-white/10 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-4xl text-slate-700">shield</span>
                                    </div>
                                    <span className="text-[10px] font-header tracking-widest text-slate-500">RIVAL</span>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <p className="text-3xl font-header text-white uppercase italic tracking-tighter">Match Day 04</p>
                                <div className="flex items-center justify-center gap-2 text-primary">
                                    <span className="material-symbols-outlined text-sm">schedule</span>
                                    <span className="text-sm font-bold font-sans uppercase tracking-tighter italic">Fecha pendiente de sorteo</span>
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={() => onNavigate('arena')}
                            className="w-full bg-white/5 border border-white/10 hover:border-primary/50 text-white font-header text-xs py-5 rounded-xl tracking-widest transition-all btn-interact uppercase"
                        >
                            ACCEDER AL MATCH CENTER
                        </button>
                    </div>
                </div>
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
                        <div className="flex-1 flex items-center px-8 gap-8 py-4 transition-all duration-500">
                            {/* Left Media Item */}
                            <div className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0 relative">
                                <div className="absolute inset-0 bg-neutral-900/10 rounded-full blur-xl"></div>
                                <img 
                                    alt="News media" 
                                    className="w-full h-full object-contain ink-edges" 
                                    src={HERALDO_ITEMS[heraldoIndex].image} 
                                />
                            </div>

                            {/* Center Content */}
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] bg-blood/10 text-blood font-black px-2 py-0.5 rounded border border-blood/20 uppercase tracking-tighter">
                                        {HERALDO_ITEMS[heraldoIndex].tag}
                                    </span>
                                    <span className="text-[10px] text-neutral-900/60 font-serif font-bold italic">
                                        {HERALDO_ITEMS[heraldoIndex].category}
                                    </span>
                                </div>
                                <h3 className="font-header text-3xl md:text-4xl text-neutral-900 tracking-tight leading-none drop-shadow-sm transition-all duration-500">
                                    {HERALDO_ITEMS[heraldoIndex].title}
                                </h3>
                                <div className="max-w-xl">
                                    <p className="font-serif text-base md:text-lg text-neutral-800 leading-tight drop-cap">
                                        {HERALDO_ITEMS[heraldoIndex].content} 
                                        <span className="font-bold text-blood ml-2 whitespace-nowrap">{HERALDO_ITEMS[heraldoIndex].rule}</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Footer & Progress */}
                        <div className="relative h-2 bg-black/5 mt-auto">
                            <div 
                                key={heraldoIndex} // Key forces re-animation on index change
                                className="absolute inset-0 bg-blood/40 progress-bar-20s origin-left"
                            ></div>
                            <div className="px-8 flex justify-between items-center absolute -top-8 left-0 right-0">
                                <span className="font-serif italic text-[10px] text-neutral-900/50">Circulación Imperial Registrada • Nuffle's Will Be Done</span>
                                <div className="flex gap-4">
                                    <span className="font-serif font-bold text-[10px] text-neutral-900/40 uppercase">Item {heraldoIndex + 1}/{HERALDO_ITEMS.length}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </main>
    );
};

export default Home;
