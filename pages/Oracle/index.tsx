import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Subpáginas del Oráculo
import Teams from './TeamsPage';
import Skills from './SkillsPage';
import StarPlayers from './StarPlayersPage';
import ProbabilityCalculator from './ProbabilitiesPage';
import InducementTable from './InducementsPage';
import RulesPage from './RulesPage';
import { useLanguage } from '../../contexts/LanguageContext';
import { useMasterData } from '../../hooks/useMasterData';
import { getStarPlayerImageUrl } from '../../utils/imageUtils';
import { teamsData as staticTeams } from '../../data/teams';
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
    const { skills, starPlayers } = useMasterData();
    const [activeView, setActiveView] = useState<SubView>('hub');
    const [selectedHubTeam, setSelectedHubTeam] = useState<string | null>(null);
    const [initialSkillCategory, setInitialSkillCategory] = useState<string>('General');
    const [hubSearchTerm, setHubSearchTerm] = useState(initialSearchTerm);
    const hubSearchInputRef = useRef<HTMLInputElement>(null);

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

    const codexCategories = useMemo(() => {
        return SKILL_CATEGORIES.map(category => ({
            ...category,
            count: skills.filter(skill => skill.category === category.id).length
        }));
    }, [skills]);

    const featuredTeams = useMemo(() => staticTeams.slice(0, 4), []);
    const featuredStarPlayers = useMemo(() => starPlayers.slice(0, 4), [starPlayers]);

    const handleBackToHub = () => {
        setActiveView('hub');
        setSelectedHubTeam(null);
    };

    const handleNavigateToSkills = (category: string) => {
        setInitialSkillCategory(category);
        setActiveView('skills');
    };

    const openSubview = (view: Exclude<SubView, 'hub'>) => {
        setActiveView(view);
        setSelectedHubTeam(null);
        if (view !== 'skills') {
            setHubSearchTerm('');
        }
    };

    const hubView = (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-10 pb-24"
        >
            <section className="blood-ui-light-card rounded-[2.5rem] p-8 md:p-10 shadow-[0_24px_60px_rgba(75,52,27,0.14)]">
                <div className="flex flex-col gap-4 text-center md:text-left max-w-4xl">
                    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                        <span className="px-3 py-1 rounded-full border border-[rgba(111,87,56,0.22)] bg-[rgba(255,249,236,0.7)] text-[10px] font-black uppercase tracking-[0.25em] text-[#6b553b] italic">Equipos</span>
                        <span className="px-3 py-1 rounded-full border border-[rgba(111,87,56,0.22)] bg-[rgba(255,249,236,0.7)] text-[10px] font-black uppercase tracking-[0.25em] text-[#6b553b] italic">Codex</span>
                        <span className="px-3 py-1 rounded-full border border-[rgba(111,87,56,0.22)] bg-[rgba(255,249,236,0.7)] text-[10px] font-black uppercase tracking-[0.25em] text-[#6b553b] italic">Estrellas</span>
                    </div>
                    <h1 className="blood-ui-light-title text-4xl md:text-6xl font-black leading-tight tracking-tighter italic uppercase">
                        {t('oracle.hub.title')}
                    </h1>
                    <p className="blood-ui-light-body text-lg md:text-xl font-bold tracking-widest uppercase underline decoration-blood-red decoration-2 underline-offset-8">
                        {t('oracle.hub.subtitle')}
                    </p>
                    <p className="blood-ui-light-body text-sm md:text-base leading-relaxed max-w-3xl">
                        Tres puertas del mismo santuario: consulta tus franquicias, domina el reglamento y despliega leyendas cuando la mesa lo exija.
                    </p>
                </div>
                <div className="relative mt-8 max-w-4xl mx-auto md:mx-0">
                    <div className="blood-ui-light-card blood-ui-light-input flex w-full items-stretch rounded-2xl h-16 focus-within:border-premium-gold/50 transition-all group">
                        <div className="text-premium-gold flex items-center justify-center pl-6">
                            <span className="material-symbols-outlined font-bold group-hover:scale-110 transition-transform">search</span>
                        </div>
                        <input
                            className="blood-ui-input w-full bg-transparent border-none focus:ring-0 text-[#2b1d12] placeholder:text-[#7b6853] px-6 text-lg font-medium rounded-r-2xl"
                            placeholder="Buscar equipos, habilidades, reglas o estrellas..."
                            value={hubSearchTerm}
                            onChange={(e) => setHubSearchTerm(e.target.value)}
                        />
                        <div className="flex items-center pr-2">
                            <button
                                onClick={() => setActiveView('skills')}
                                className="blood-ui-button-primary px-8 h-12 rounded-xl uppercase italic tracking-tighter"
                            >
                                Buscar
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="blood-ui-light-card rounded-[2.5rem] p-8 md:p-10 flex flex-col gap-6">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.25em] font-black text-[#7b6853] italic mb-2">Enciclopedia viva</p>
                            <h2 className="blood-ui-light-title text-2xl md:text-3xl font-black uppercase italic tracking-tighter">Equipos</h2>
                        </div>
                        <button onClick={() => setActiveView('teams')} className="blood-ui-button-primary px-5 py-3 rounded-2xl text-[10px] uppercase italic tracking-widest">Abrir</button>
                    </div>

                    <p className="blood-ui-light-body text-sm leading-relaxed">
                        Consulta las franquicias, sus plantillas y el ADN táctico de cada raza.
                    </p>

                    <div className="space-y-3">
                        {featuredTeams.map(team => (
                            <button
                                key={team.name}
                                onClick={() => {
                                    setSelectedHubTeam(team.name);
                                    setActiveView('teams');
                                }}
                                className="w-full blood-ui-light-card rounded-2xl p-4 flex items-center gap-4 text-left hover:border-[rgba(202,138,4,0.28)] transition-all"
                            >
                                <div className="size-14 rounded-2xl overflow-hidden flex-shrink-0 border border-[rgba(111,87,56,0.16)] bg-[rgba(255,249,236,0.42)]">
                                    <img src={team.image} alt={team.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-[10px] uppercase tracking-[0.22em] font-black text-[#7b6853] italic mb-1">Tier {team.tier}</p>
                                    <h3 className="blood-ui-light-title text-base md:text-lg font-black uppercase italic leading-tight truncate">{team.name}</h3>
                                </div>
                                <span className="material-symbols-outlined text-premium-gold/80">chevron_right</span>
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => setActiveView('teams')}
                        className="blood-ui-light-button-secondary px-6 py-4 rounded-2xl text-xs uppercase italic tracking-widest"
                    >
                        Ver catálogo de equipos
                    </button>
                </div>

                <div className="blood-ui-light-card rounded-[2.5rem] p-8 md:p-10 flex flex-col gap-6">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.25em] font-black text-[#7b6853] italic mb-2">Codex de Nuffle</p>
                            <h2 className="blood-ui-light-title text-2xl md:text-3xl font-black uppercase italic tracking-tighter">Habilidades y rasgos</h2>
                        </div>
                        <button onClick={() => setActiveView('skills')} className="blood-ui-button-primary px-5 py-3 rounded-2xl text-[10px] uppercase italic tracking-widest">Abrir</button>
                    </div>

                    <p className="blood-ui-light-body text-sm leading-relaxed">
                        Entra por categoría y navega el catálogo completo de habilidades, reglas y rasgos.
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                        {codexCategories.map(category => (
                            <button
                                key={category.id}
                                onClick={() => handleNavigateToSkills(category.id)}
                                className="blood-ui-light-card rounded-2xl p-4 text-left hover:scale-[1.01] transition-all border border-[rgba(111,87,56,0.12)]"
                            >
                                <p className="text-[10px] uppercase tracking-[0.22em] font-black text-[#7b6853] italic mb-2">{category.label}</p>
                                <div className="flex items-end justify-between gap-2">
                                    <span className="blood-ui-light-title text-3xl font-black italic leading-none">{category.count}</span>
                                    <span className="material-symbols-outlined text-premium-gold/80 text-lg">library_books</span>
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="blood-ui-light-card rounded-2xl p-5 border border-[rgba(111,87,56,0.12)]">
                        <p className="text-[10px] uppercase tracking-[0.25em] font-black text-[#7b6853] italic mb-2">Acceso directo</p>
                        <p className="blood-ui-light-body text-sm leading-relaxed">
                            Pulsa una categoría para abrir su catálogo completo. Cada rama vive en su propia pantalla para que el acceso sea rápido.
                        </p>
                    </div>
                </div>

                <div className="blood-ui-light-card rounded-[2.5rem] p-8 md:p-10 flex flex-col gap-6 relative overflow-hidden">
                    <div className="absolute -right-8 -top-8 text-[220px] leading-none text-[rgba(202,138,4,0.08)] pointer-events-none select-none">star</div>
                    <div className="relative z-10 flex items-start justify-between gap-4">
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.25em] font-black text-[#7b6853] italic mb-2">Catálogo de leyendas</p>
                            <h2 className="blood-ui-light-title text-2xl md:text-3xl font-black uppercase italic tracking-tighter">Jugadores estrella</h2>
                        </div>
                        <button onClick={() => setActiveView('star_players')} className="blood-ui-button-primary px-5 py-3 rounded-2xl text-[10px] uppercase italic tracking-widest">Abrir</button>
                    </div>

                    <p className="blood-ui-light-body text-sm leading-relaxed relative z-10">
                        Leyendas, mercenarios y piezas míticas listas para entrar al campo cuando una franquicia necesita un golpe de autoridad.
                    </p>

                    <div className="relative z-10 space-y-3">
                        {featuredStarPlayers.map(player => (
                            <button
                                key={player.name}
                                onClick={() => setActiveView('star_players')}
                                className="w-full blood-ui-light-card rounded-2xl p-4 flex items-center gap-4 text-left hover:border-[rgba(202,138,4,0.28)] transition-all"
                            >
                                <div className="size-14 rounded-2xl overflow-hidden flex-shrink-0 border border-[rgba(111,87,56,0.16)] bg-[rgba(255,249,236,0.42)]">
                                    <img
                                        src={getStarPlayerImageUrl(player.name)}
                                        alt={player.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            const img = e.target as HTMLImageElement;
                                            if (player.image && img.src !== player.image) {
                                                img.src = player.image;
                                            }
                                        }}
                                    />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-[10px] uppercase tracking-[0.22em] font-black text-[#7b6853] italic mb-1">{player.playsFor?.[0] || 'Leyenda'}</p>
                                    <h3 className="blood-ui-light-title text-base md:text-lg font-black uppercase italic leading-tight truncate">{player.name}</h3>
                                </div>
                                <span className="material-symbols-outlined text-premium-gold/80">chevron_right</span>
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => setActiveView('star_players')}
                        className="blood-ui-light-button-secondary px-6 py-4 rounded-2xl text-xs uppercase italic tracking-widest relative z-10"
                    >
                        Ver catálogo de estrellas
                    </button>
                </div>
            </div>

            <section className="blood-ui-light-card rounded-[2rem] p-6 md:p-8 shadow-[0_24px_60px_rgba(75,52,27,0.14)]">
                <div className="flex items-center justify-between gap-4 mb-5">
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.25em] font-black text-[#7b6853] italic mb-2">Accesos de mando</p>
                        <h3 className="blood-ui-light-title text-xl md:text-2xl uppercase italic tracking-tighter">Herramientas del Oráculo</h3>
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.28em] font-black text-[#7b6853] italic">Rápido / Directo / Siempre visible</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { id: 'calculator', title: 'Calculadora', desc: 'Probabilidades de tirada y apoyo matemático.', icon: 'calculate' },
                        { id: 'inducements', title: 'Incentivos', desc: 'Sobornos, magos, apotecarios y más.', icon: 'payments' },
                        { id: 'rules', title: 'Manual', desc: 'Patada inicial, clima y reglas del campo.', icon: 'menu_book' }
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => openSubview(item.id as Exclude<SubView, 'hub'>)}
                            className="blood-ui-light-card rounded-2xl p-5 text-left flex items-center gap-4 hover:border-[rgba(202,138,4,0.28)] transition-all group"
                        >
                            <div className="size-14 rounded-2xl bg-[rgba(202,138,4,0.12)] border border-[rgba(202,138,4,0.16)] flex items-center justify-center text-[#ca8a04] shrink-0 group-hover:bg-[rgba(202,138,4,0.18)] transition-colors">
                                <span className="material-symbols-outlined">{item.icon}</span>
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="blood-ui-light-title text-base uppercase italic leading-tight">{item.title}</p>
                                <p className="blood-ui-light-body text-[11px] mt-1 leading-relaxed">{item.desc}</p>
                            </div>
                            <span className="material-symbols-outlined text-[rgba(202,138,4,0.9)]">chevron_right</span>
                        </button>
                    ))}
                </div>
            </section>
        </motion.div>
    );
    return (
        <div className="blood-ui-shell min-h-screen px-4 md:px-0">
            <AnimatePresence mode="wait">
                {activeView === 'hub' && hubView}
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
                            className="bg-[rgba(255,249,236,0.92)] text-[#2b1d12] border border-[rgba(111,87,56,0.16)] flex items-center gap-3 mb-8 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.22em] shadow-[0_10px_24px_rgba(92,68,39,0.12)] hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(92,68,39,0.16)] transition-all group italic"
                        >
                            <span className="material-symbols-outlined font-bold transform group-hover:-translate-x-1 transition-transform text-[#ca8a04]">arrow_back</span>
                            {t('common.back')}
                        </button>

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
                                <div className="blood-ui-light-card max-w-3xl mx-auto py-10 p-8 rounded-[2.5rem] shadow-[0_24px_60px_rgba(75,52,27,0.14)]">
                                    <h3 className="blood-ui-light-title text-xl md:text-2xl font-black italic tracking-tighter uppercase mb-4 text-center">{t('oracle.calculator.title')}</h3>
                                    <ProbabilityCalculator />
                                </div>
                            )}
                            {activeView === 'inducements' && (
                                <div className="blood-ui-light-card max-w-5xl mx-auto py-10 p-8 rounded-[2.5rem] shadow-[0_24px_60px_rgba(75,52,27,0.14)]">
                                    <h3 className="blood-ui-light-title text-xl md:text-2xl font-black italic tracking-tighter uppercase mb-4 text-center">{t('oracle.inducements.title')}</h3>
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




