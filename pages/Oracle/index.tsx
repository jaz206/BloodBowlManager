import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Sub-páginas del Oráculo
import Teams from './TeamsPage';
import Skills from './SkillsPage';
import StarPlayers from './StarPlayersPage';
import ProbabilityCalculator from './ProbabilitiesPage';
import InducementTable from './InducementsPage';
import RulesPage from './RulesPage';
import { useLanguage } from '../../contexts/LanguageContext';
import type { ManagedTeam } from '../../types';

type SubView = 'hub' | 'teams' | 'skills' | 'star_players' | 'calculator' | 'inducements' | 'rules';

const SKILL_CATEGORIES = [
    { id: 'General', label: 'General' },
    { id: 'Strength', label: 'Fuerza' },
    { id: 'Agility', label: 'Agilidad' },
    { id: 'Passing', label: 'Pase' },
    { id: 'Mutation', label: 'Mutación' }
];

interface OraclePageProps {
    managedTeams?: ManagedTeam[];
    onRequestTeamCreation?: (rosterName: string) => void;
    initialSearchTerm?: string;
}

const OraclePage: React.FC<OraclePageProps> = ({ managedTeams = [], onRequestTeamCreation = () => { }, initialSearchTerm = '' }) => {
    const { t } = useLanguage();
    const [activeView, setActiveView] = useState<SubView>('hub');
    const [selectedHubTeam, setSelectedHubTeam] = useState<string | null>(null);
    const [initialSkillCategory, setInitialSkillCategory] = useState<string>('General');
    const [hubSearchTerm, setHubSearchTerm] = useState(initialSearchTerm);

    // Update search term when initialSearchTerm changes from outside
    React.useEffect(() => {
        if (initialSearchTerm) {
            const navigationalPayloads = ['teams', 'skills', 'stars', 'calculator', 'rules', 'Habilidades', 'Star Player', 'Calculadora'];
            
            if (navigationalPayloads.includes(initialSearchTerm)) {
                if (initialSearchTerm === 'teams') setActiveView('teams');
                else if (initialSearchTerm === 'skills' || initialSearchTerm === 'Habilidades') setActiveView('skills');
                else if (initialSearchTerm === 'stars' || initialSearchTerm === 'Star Player') setActiveView('star_players');
                else if (initialSearchTerm === 'calculator' || initialSearchTerm === 'Calculadora') setActiveView('calculator');
                else if (initialSearchTerm === 'rules') setActiveView('rules');
                
                setHubSearchTerm(''); // Clear search if it was a tab navigation
            } else {
                // If it's actual text, stay in hub and search (unless we are already in a subview, then maybe we want to search there?)
                setHubSearchTerm(initialSearchTerm);
            }
        }
    }, [initialSearchTerm]);

    const userTv = useMemo(() => {
        if (managedTeams.length === 0) return 1000000;
        const team = managedTeams[0];
        let total = 0;
        team.players.forEach(p => { total += p.cost; });
        total += (team.rerolls || 0) * 60000;
        total += (team.cheerleaders || 0) * 10000;
        total += (team.assistantCoaches || 0) * 10000;
        total += (team.dedicatedFans || 0) * 10000;
        if (team.apothecary) total += 50000;
        return total;
    }, [managedTeams]);

    const rivalTv = useMemo(() => userTv + 230000, [userTv]);

    const handleBackToHub = () => {
        setActiveView('hub');
        setSelectedHubTeam(null);
    };

    const handleNavigateToSkills = (category: string) => {
        setInitialSkillCategory(category);
        setActiveView('skills');
    };

    const handleNavigateToTeam = (teamName: string) => {
        setSelectedHubTeam(teamName);
        setActiveView('teams');
    };

    const HubView = () => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-12 pb-20"
        >
            {/* Hero Section & Search */}
            <section className="flex flex-col gap-6 py-6 text-center md:text-left">
                <div className="flex flex-col gap-2">
                    <h1 className="text-white text-4xl md:text-6xl font-black leading-tight tracking-tighter italic uppercase">
                        {t('oracle.hub.title')}
                    </h1>
                    <p className="text-premium-gold text-lg md:text-xl font-bold tracking-widest uppercase opacity-80 decoration-blood-red decoration-2 underline-offset-8 underline">
                        {t('oracle.hub.subtitle')}
                    </p>
                </div>
                <div className="relative mt-8 max-w-3xl mx-auto md:mx-0">
                    <div className="flex w-full items-stretch rounded-2xl h-16 bg-zinc-900/80 border border-white/5 focus-within:border-premium-gold/50 transition-all shadow-2xl backdrop-blur-xl group">
                        <div className="text-premium-gold flex items-center justify-center pl-6">
                            <span className="material-symbols-outlined font-bold group-hover:scale-110 transition-transform">search</span>
                        </div>
                        <input
                            className="w-full bg-transparent border-none focus:ring-0 text-white placeholder:text-slate-600 px-6 text-lg font-medium"
                            placeholder={t('oracle.hub.search.placeholder')}
                            value={hubSearchTerm}
                            onChange={(e) => setHubSearchTerm(e.target.value)}
                        />
                        <div className="flex items-center pr-2">
                            <button
                                onClick={() => setActiveView('skills')}
                                className="bg-premium-gold text-black font-black px-8 h-12 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-premium-gold/20 uppercase italic tracking-tighter"
                            >
                                Buscar
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Grid Layout for Main Features */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Enciclopedia de Equipos */}
                <div className="lg:col-span-8 flex flex-col gap-6 bg-zinc-900/40 p-8 rounded-[2.5rem] border border-white/5 shadow-inner group">
                    <div className="flex items-center justify-between border-b border-white/5 pb-4">
                        <div className="flex items-center gap-4">
                            <div className="size-10 rounded-xl bg-premium-gold/10 flex items-center justify-center text-premium-gold border border-premium-gold/20">
                                <span className="material-symbols-outlined font-bold">groups</span>
                            </div>
                            <h2 className="text-white text-xl font-black uppercase italic tracking-tighter">{t('oracle.hub.teams.title')}</h2>
                        </div>
                        <button
                            onClick={() => setActiveView('teams')}
                            className="text-premium-gold text-[10px] font-black uppercase tracking-[0.2em] hover:underline"
                        >
                            {t('oracle.hub.teams.viewAll')}
                        </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2">
                        {/* Team Cards */}
                        {[
                            { name: 'No Muertos', icon: 'skull', key: 'No Muertos' },
                            { name: 'Elfos Silvanos', icon: 'forest', key: 'Elfos Silvanos' },
                            { name: 'Humanos', icon: 'shield', key: 'Humanos' },
                            { name: 'Orcos', icon: 'bolt', key: 'Orcos' }
                        ].map((race) => (
                            <div
                                key={race.key}
                                onClick={() => handleNavigateToTeam(race.key)}
                                className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-black/40 border border-white/5 hover:border-premium-gold/50 cursor-pointer group/card transition-all hover:scale-105 hover:shadow-2xl shadow-premium-gold/5"
                            >
                                <div className="size-16 rounded-full bg-zinc-800 flex items-center justify-center border border-white/5 group-hover/card:bg-premium-gold/10 group-hover/card:border-premium-gold/40 transition-all">
                                    <span className="material-symbols-outlined text-4xl text-slate-500 group-hover/card:text-premium-gold transition-colors">{race.icon}</span>
                                </div>
                                <span className="text-slate-300 text-[10px] font-black uppercase tracking-widest text-center">{race.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Probabilidades Card (Oracle Dice) */}
                <div className="lg:col-span-4 bg-gradient-to-br from-premium-gold to-orange-600 p-8 rounded-[2.5rem] flex flex-col justify-between shadow-2xl shadow-premium-gold/10 border-4 border-black/10 group overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-1000"></div>
                    <div className="flex items-center gap-4 text-black relative">
                        <span className="material-symbols-outlined text-4xl font-black italic">casino</span>
                        <h2 className="text-2xl font-black uppercase italic tracking-tighter">{t('oracle.hub.dice.title')}</h2>
                    </div>
                    <div className="py-8 relative">
                        <div className="bg-black/10 rounded-2xl p-6 backdrop-blur-md border border-white/10 shadow-inner">
                            <p className="text-black font-black text-[10px] uppercase tracking-[0.2em] mb-3 opacity-70 italic">{t('oracle.hub.dice.success')}</p>
                            <div className="text-5xl font-black text-black tracking-tighter italic">97.2%</div>
                        </div>
                    </div>
                    <button
                        onClick={() => setActiveView('calculator')}
                        className="w-full bg-black text-premium-gold font-black py-4 rounded-2xl hover:scale-[1.03] active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs italic shadow-xl relative"
                    >
                        {t('oracle.hub.dice.btn')} <span className="material-symbols-outlined text-sm font-bold">arrow_forward</span>
                    </button>
                </div>

                {/* Codex de Habilidades */}
                <div className="lg:col-span-8 bg-zinc-900/40 p-8 rounded-[2.5rem] border border-white/5 shadow-inner">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 border-b border-white/5 pb-4">
                        <div className="flex items-center gap-4">
                            <div className="size-10 rounded-xl bg-premium-gold/10 flex items-center justify-center text-premium-gold border border-premium-gold/20">
                                <span className="material-symbols-outlined font-bold">auto_awesome</span>
                            </div>
                            <h2 className="text-white text-xl font-black uppercase italic tracking-tighter">{t('oracle.hub.skills.title')}</h2>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {SKILL_CATEGORIES.map((cat, i) => (
                                <button
                                    key={cat.id}
                                    onClick={() => handleNavigateToSkills(cat.id)}
                                    className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 ${i === 0 ? 'bg-premium-gold text-black' : 'bg-black/40 text-slate-500 border border-white/5 hover:text-white hover:bg-premium-gold/20 hover:border-premium-gold/30'}`}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div
                            onClick={() => setActiveView('skills')}
                            className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-premium-gold/30 hover:bg-black/60 transition-all cursor-pointer group"
                        >
                            <div className="flex items-center gap-5">
                                <span className="size-10 rounded-xl bg-premium-gold/10 flex items-center justify-center text-premium-gold font-black italic shadow-inner border border-premium-gold/20">G</span>
                                <div>
                                    <h4 className="text-white font-black text-sm italic uppercase tracking-tight group-hover:text-premium-gold transition-colors">Placar (Block)</h4>
                                    <p className="text-slate-500 text-xs font-medium italic">No cae al obtener un resultado de "Ambos Derribados".</p>
                                </div>
                            </div>
                            <span className="material-symbols-outlined text-slate-700 group-hover:text-premium-gold transition-all transform group-hover:translate-x-1">chevron_right</span>
                        </div>
                        <div
                            onClick={() => setActiveView('skills')}
                            className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-premium-gold/30 hover:bg-black/60 transition-all cursor-pointer group"
                        >
                            <div className="flex items-center gap-5">
                                <span className="size-10 rounded-xl bg-premium-gold/10 flex items-center justify-center text-premium-gold font-black italic shadow-inner border border-premium-gold/20">G</span>
                                <div>
                                    <h4 className="text-white font-black text-sm italic uppercase tracking-tight group-hover:text-premium-gold transition-colors">Esquivar (Dodge)</h4>
                                    <p className="text-slate-500 text-xs font-medium italic">Repite una tirada fallida de esquiva por turno.</p>
                                </div>
                            </div>
                            <span className="material-symbols-outlined text-slate-700 group-hover:text-premium-gold transition-all transform group-hover:translate-x-1">chevron_right</span>
                        </div>
                    </div>
                </div>

                {/* Tabla de Incentivos */}
                <div className="lg:col-span-4 bg-zinc-900/60 p-8 rounded-[2.5rem] border border-white/5 flex flex-col gap-6 shadow-2xl relative overflow-hidden">
                    <div className="flex items-center gap-4">
                        <div className="size-10 rounded-xl bg-premium-gold/10 flex items-center justify-center text-premium-gold border border-premium-gold/20">
                            <span className="material-symbols-outlined font-bold">payments</span>
                        </div>
                        <h2 className="text-white text-xl font-black uppercase italic tracking-tighter">{t('oracle.hub.inducements.title')}</h2>
                    </div>
                    <p className="text-slate-500 text-xs font-medium italic leading-relaxed">{t('oracle.hub.inducements.desc')}</p>
                    <div className="mt-4 space-y-6">
                        <div className="flex flex-col gap-2">
                            <span className="text-[10px] text-slate-600 uppercase font-black tracking-widest ml-1">{t('oracle.hub.inducements.yourTv')}</span>
                            <div className="bg-black/60 border border-white/5 rounded-2xl p-4 text-premium-gold font-mono text-2xl text-center italic font-black shadow-inner">
                                {userTv.toLocaleString()}
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <span className="text-[10px] text-slate-600 uppercase font-black tracking-widest ml-1">{t('oracle.hub.inducements.rivalTv')}</span>
                            <div className="bg-black/60 border border-white/5 rounded-2xl p-4 text-slate-400 font-mono text-2xl text-center italic font-black shadow-inner">
                                {rivalTv.toLocaleString()}
                            </div>
                        </div>
                        <div className="pt-6 border-t border-white/5 mt-2">
                            <div className="flex justify-between items-center mb-6 px-1">
                                <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">{t('oracle.hub.inducements.budget')}</span>
                                <span className="text-premium-gold text-2xl font-black italic tracking-tighter">
                                    {Math.max(0, (rivalTv - userTv) / 1000)}k
                                </span>
                            </div>
                            <button
                                onClick={() => setActiveView('inducements')}
                                className="w-full bg-premium-gold text-black font-black py-4 rounded-2xl hover:scale-[1.03] active:scale-95 transition-all shadow-xl shadow-premium-gold/10 uppercase tracking-widest text-xs italic"
                            >
                                {t('oracle.hub.inducements.btn')}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Star Player Compendium */}
                <div className="lg:col-span-8 bg-zinc-900/40 p-8 rounded-[2.5rem] border border-white/5 shadow-inner relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-10 transition-opacity pointer-events-none">
                        <span className="material-symbols-outlined !text-[180px] text-premium-gold font-black">star</span>
                    </div>

                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="size-10 rounded-xl bg-premium-gold/10 flex items-center justify-center text-premium-gold border border-premium-gold/20">
                                    <span className="material-symbols-outlined font-bold">star</span>
                                </div>
                                <h2 className="text-white text-xl font-black uppercase italic tracking-tighter">{t('oracle.hub.stars.title')}</h2>
                            </div>
                            <p className="text-slate-500 text-sm font-medium italic leading-relaxed max-w-lg mb-8">
                                {t('oracle.hub.stars.desc')}
                            </p>

                            <div className="flex flex-wrap gap-4 mb-8">
                                {[
                                    { name: 'Griff Oberwald', role: 'Human Super Star' },
                                    { name: 'Morg \'n\' Thorg', role: 'Ogre Mercenary' },
                                    { name: 'Deeproot Strongbranch', role: 'Treeman Legend' }
                                ].map(p => (
                                    <div key={p.name} className="px-4 py-2 bg-black/40 border border-white/5 rounded-xl">
                                        <p className="text-[10px] text-premium-gold font-black uppercase tracking-tight leading-none mb-1">{p.name}</p>
                                        <p className="text-[8px] text-slate-600 font-bold uppercase italic">{p.role}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={() => setActiveView('star_players')}
                            className="w-auto self-start bg-white/5 border border-white/10 text-white font-black py-4 px-10 rounded-2xl hover:bg-premium-gold hover:text-black hover:border-premium-gold transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs italic shadow-xl group/btn"
                        >
                            {t('oracle.hub.stars.btn')}
                            <span className="material-symbols-outlined text-sm font-bold group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
                        </button>
                    </div>
                </div>

                {/* Rules & Sequences Card */}
                <div className="lg:col-span-4 bg-zinc-900/60 p-8 rounded-[2.5rem] border border-white/5 flex flex-col justify-between shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-1000"></div>
                    <div>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                <span className="material-symbols-outlined font-bold">menu_book</span>
                            </div>
                            <h2 className="text-white text-xl font-black uppercase italic tracking-tighter">Manual de Campo</h2>
                        </div>
                        <p className="text-slate-500 text-xs font-medium italic leading-relaxed mb-8">
                            Consulta las secuencias oficiales de Pre-Partido, Post-Partido y Tablas de Eventos de la Season 3.
                        </p>
                    </div>
                    <button
                        onClick={() => setActiveView('rules')}
                        className="w-full bg-white/5 border border-white/10 text-white font-black py-4 rounded-xl hover:bg-primary hover:text-black hover:border-primary transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-[10px] italic"
                    >
                        Abrir Manual
                    </button>
                </div>
            </div>

            {/* Quick Links / Recent Rules */}
            <section className="mt-12 bg-zinc-900/20 p-8 rounded-[2.5rem] border border-white/5">
                <h3 className="text-white text-lg font-black italic uppercase tracking-tighter mb-8 flex items-center gap-3">
                    <span className="material-symbols-outlined text-premium-gold font-bold">history</span>
                    {t('oracle.hub.recent.title')}
                </h3>
                <div className="flex flex-wrap gap-4">
                    {[
                        { label: t('oracle.hub.recent.weather'), icon: 'device_thermostat', act: 'inducements' },
                        { label: t('oracle.hub.recent.injuries'), icon: 'medication', act: 'inducements' },
                        { label: t('oracle.hub.recent.throwFriend'), icon: 'sports_kabaddi', act: 'skills', cat: 'Strength' },
                        { label: t('oracle.hub.recent.stars'), icon: 'star', act: 'star_players' }
                    ].map((link) => (
                        <button
                            key={link.label}
                            onClick={() => {
                                if (!link.act) return;
                                if (link.act === 'skills' && (link as any).cat) {
                                    handleNavigateToSkills((link as any).cat);
                                } else {
                                    setActiveView(link.act as SubView);
                                }
                            }}
                            className="px-6 py-3 bg-black/40 border border-white/5 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:border-premium-gold/40 hover:text-premium-gold hover:scale-105 transition-all flex items-center gap-3 shadow-lg"
                        >
                            <span className="material-symbols-outlined text-sm font-bold opacity-60">{link.icon}</span>
                            {link.label}
                        </button>
                    ))}
                </div>
            </section>
        </motion.div>
    );

    return (
        <div className="min-h-screen px-4 md:px-0">
            <AnimatePresence mode="wait">
                {activeView === 'hub' && <HubView key="hub" />}
                {activeView !== 'hub' && (
                    <motion.div
                        key="subview"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                    >
                        <button
                            onClick={handleBackToHub}
                            className="flex items-center gap-3 text-premium-gold font-black uppercase tracking-widest text-[10px] mb-8 hover:underline group italic"
                        >
                            <span className="material-symbols-outlined font-bold transform group-hover:-translate-x-1 transition-transform">arrow_back</span>
                            {t('common.back')}
                        </button>

                        {/* Traditional Tab Navigation for sub-views */}
                        <div className="flex border-b border-white/5 mb-8 bg-[#0a0a0a]/80 rounded-2xl overflow-hidden shadow-xl sticky top-16 z-20 backdrop-blur-xl transition-all">
                            {[
                                { id: 'teams', label: t('oracle.tabs.teams') },
                                { id: 'skills', label: t('oracle.tabs.skills') },
                                { id: 'star_players', label: t('oracle.tabs.stars') },
                                { id: 'calculator', label: t('oracle.tabs.oracle') },
                                { id: 'inducements', label: t('oracle.tabs.inducements') },
                                { id: 'rules', label: 'Manual' }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => {
                                        setActiveView(tab.id as SubView);
                                        if (tab.id !== 'skills') setHubSearchTerm('');
                                        setSelectedHubTeam(null);
                                    }}
                                    className={`flex-1 py-4 px-2 text-center transition-all duration-300 relative font-display uppercase tracking-widest text-[10px] font-black ${activeView === tab.id ? 'text-premium-gold' : 'text-slate-500 hover:text-white'}`}
                                >
                                    {tab.label}
                                    {activeView === tab.id && (
                                        <motion.div layoutId="oracle-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-premium-gold shadow-[0_0_10px_rgba(202,138,4,0.5)]" />
                                    )}
                                </button>
                            ))}
                        </div>

                        <div className="max-w-6xl mx-auto">
                            {activeView === 'teams' && (
                                <Teams
                                    onRequestTeamCreation={onRequestTeamCreation}
                                    initialTeamName={selectedHubTeam}
                                />
                            )}
                            {activeView === 'skills' && <Skills initialCategory={initialSkillCategory} initialSearchTerm={hubSearchTerm} />}
                            {activeView === 'star_players' && <StarPlayers />}
                            {activeView === 'calculator' && (
                                <div className="max-w-md mx-auto py-10 bg-zinc-900/40 p-8 rounded-[2.5rem] border border-white/5">
                                    <h3 className="text-xl font-display font-black text-white italic tracking-tighter uppercase mb-8 text-center">{t('oracle.calculator.title')}</h3>
                                    <ProbabilityCalculator />
                                </div>
                            )}
                            {activeView === 'inducements' && (
                                <div className="max-w-4xl mx-auto py-10 bg-zinc-900/40 p-8 rounded-[2.5rem] border border-white/5">
                                    <h3 className="text-xl font-display font-black text-white italic tracking-tighter uppercase mb-8 text-center">{t('oracle.inducements.title')}</h3>
                                    <InducementTable />
                                </div>
                            )}
                            {activeView === 'rules' && <RulesPage />}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default OraclePage;
