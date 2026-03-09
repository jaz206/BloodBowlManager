import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'es' | 'en';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
    es: {
        'nav.home': 'Inicio',
        'nav.oracle': 'Oráculo',
        'nav.guild': 'Gremio',
        'nav.tactical': 'Pizarra',
        'nav.arena': 'Arena',
        'nav.admin': 'Admin',
        'loading.sync': 'Sincronizando con Nuffle...',
        'guest.warning': 'Estás en modo Invitado. Tu progreso no se guardará al cerrar o recargar la página.',
        'header.title': 'BLOOD BOWL',
        'header.subtitle': 'ASSISTANT',
        'common.back': 'Volver',
        'common.save': 'Guardar',
        'common.delete': 'Eliminar',
        'common.cancel': 'Cancelar',
        'common.add': 'Añadir',
        'common.edit': 'Editar',
        'oracle.tabs.teams': 'Equipos',
        'oracle.tabs.skills': 'Habilidades',
        'oracle.tabs.stars': 'Estrellas',
        'oracle.tabs.oracle': 'Oráculo',
        'oracle.tabs.inducements': 'Incentivos',
        'oracle.calculator.title': 'Calculadora de Nuffle',
        'oracle.inducements.title': 'Tabla de Incentivos',
        'oracle.inducements.teamA': 'Valor Equipo A (k)',
        'oracle.inducements.teamB': 'Valor Equipo B (k)',
        'oracle.inducements.budget': 'Presupuesto de Incentivos',
        'oracle.inducements.strategy': 'Estrategia',
        'oracle.inducements.empty': 'No hay incentivos disponibles para esta diferencia de TV.',
        'oracle.skills.title': 'REFERENCIA DE HABILIDADES',
        'oracle.skills.filter': 'Filtrar habilidades...',
        'oracle.skills.empty': 'No se encontraron habilidades que coincidan con tu búsqueda.',
        'oracle.stars.search': 'Buscar jugador o habilidad...',
        'oracle.stars.all': 'Todas las facciones',
        'oracle.stars.empty': 'Nuffle dice que aquí no hay nadie... Reintenta con otro filtro.',
        'home.welcome': 'BIENVENIDO,',
        'home.coach': 'ENTRENADOR.',
        'home.hero.subtitle': 'Domina el campo con las bendiciones de Nuffle y gestiona tu equipo hacia la gloria eterna.',
        'home.hero.newRoster': 'Nuevo Roster',
        'home.hero.matchReports': 'Resúmenes de Partido',
        'home.cards.oracle.title': 'El Oráculo de Nuffle',
        'home.cards.oracle.desc': 'Domina el Códice de Habilidades, consulta las reglas oficiales y estadísticas de cada raza.',
        'home.cards.oracle.btn': 'Acceder Archivos',
        'home.cards.guild.title': 'El Gremio de Entrenadores',
        'home.cards.guild.desc': 'Reúne a tu equipo, gestiona lesiones, subidas de nivel y transacciones del mercado.',
        'home.cards.guild.btn': 'Gestionar Equipos',
        'home.cards.arena.title': 'La Arena de la Gloria',
        'home.cards.arena.desc': 'Inicia la Consola de Partido en Vivo para llevar el control de turnos, rerolls y bajas en tiempo real.',
        'home.cards.arena.btn': 'Entrar en la Arena',
        'home.activeTeams.title': 'Últimos Equipos Activos',
        'home.activeTeams.viewAll': 'Ver Todos',
        'home.search.title': 'Búsqueda en el Oráculo',
        'home.search.frequent': 'Búsquedas Frecuentes',
        'team.create.title': 'Crear Nuevo Equipo',
        'team.create.draft': 'Draft de Temporada 2024',
        'team.create.save': 'GUARDAR ROSTER',
        'team.create.data': 'DATOS DEL CLUB',
        'team.create.name': 'Nombre del Equipo',
        'team.create.faction': 'Raza / Facción',
        'team.create.coach': 'Nombre del Entrenador',
        'team.create.hire': 'Contratar Jugadores',
        'team.create.hire.limit': 'Límite: 16 jugadores',
        'team.create.goods': 'Bienes del Equipo',
        'team.create.rerolls': 'Segundas Oportunidades',
        'team.create.apothecary': 'Médico',
        'team.create.fans': 'Fans Dedicados',
        'team.create.assistants': 'Asistentes',
        'team.create.cheerleaders': 'Animadoras',
        'team.create.summary': 'Resumen de Valor',
        'team.create.budget': 'Presupuesto Restante',
        'team.create.tv': 'Team Value',
        'team.create.players': 'Jugadores',
        'team.create.currentRoster': 'Roster Actual',
        'team.create.finalize': 'Finalizar Equipo',
        'team.create.rules': 'Reglas de Raza',
        'team.create.noStaff': '- Sin Staff -',
        'oracle.hub.title': 'El Oráculo de Nuffle',
        'oracle.hub.subtitle': 'Toda la sabiduría de Nuffle a tu alcance',
        'oracle.hub.search.placeholder': 'Equipos, habilidades, estrellas o incentivos...',
        'oracle.hub.teams.title': 'Enciclopedia de Equipos',
        'oracle.hub.teams.viewAll': 'Ver todos',
        'oracle.hub.dice.title': 'ORACLE DICE',
        'oracle.hub.dice.success': 'Probabilidad de éxito (2+ con RR):',
        'oracle.hub.dice.btn': 'Calculadora',
        'oracle.hub.skills.title': 'Codex de Habilidades',
        'oracle.hub.inducements.title': 'Incentivos',
        'oracle.hub.inducements.desc': 'Calcula la diferencia de Valor de Equipo (TV) y descubre qué favores puedes comprar.',
        'oracle.hub.inducements.yourTv': 'TU TV',
        'oracle.hub.inducements.rivalTv': 'RIVAL TV',
        'oracle.hub.inducements.budget': 'Presupuesto:',
        'oracle.hub.inducements.btn': 'Ver Recomendaciones',
        'oracle.hub.recent.title': 'Consultas Recientes',
        'oracle.hub.recent.weather': 'Reglas de Clima',
        'oracle.hub.recent.injuries': 'Tabla de Lesiones',
        'oracle.hub.recent.throwFriend': 'Lanzamiento de Compañero',
        'oracle.hub.recent.stars': 'Jugadores Estrella',
        'oracle.hub.stars.title': 'Compendio de Estrellas',
        'oracle.hub.stars.desc': 'Consulta las leyendas vivas y mercenarios de élite disponibles para tu equipo.',
        'oracle.hub.stars.btn': 'Ver Jugadores Estrella',
        'home.activeTeams.empty': 'Tu salón de la fama está vacío todavía...',
        'home.activeTeams.createFirst': 'Recluta tu primer equipo',
        'home.search.tag.mightyBlow': 'Golpe Mortífero',
        'home.search.tag.foulAppearance': 'Presencia Perturbadora',
        'home.search.tag.dodge': 'Esquivar',
        'home.search.tag.wrestle': 'Forcejeo',
        'home.search.tag.rules': 'Reglas 2024',
    },
    en: {
        'nav.home': 'Home',
        'nav.oracle': 'Oracle',
        'nav.guild': 'Guild',
        'nav.tactical': 'Board',
        'nav.arena': 'Arena',
        'nav.admin': 'Admin',
        'loading.sync': 'Syncing with Nuffle...',
        'guest.warning': 'You are in Guest mode. Your progress will not be saved when closing or reloading the page.',
        'header.title': 'BLOOD BOWL',
        'header.subtitle': 'ASSISTANT',
        'common.back': 'Back',
        'common.save': 'Save',
        'common.delete': 'Delete',
        'common.cancel': 'Cancel',
        'common.add': 'Add',
        'common.edit': 'Edit',
        'oracle.tabs.teams': 'Teams',
        'oracle.tabs.skills': 'Skills',
        'oracle.tabs.stars': 'Star Players',
        'oracle.tabs.oracle': 'Oracle',
        'oracle.tabs.inducements': 'Inducements',
        'oracle.calculator.title': 'Nuffle Calculator',
        'oracle.inducements.title': 'Inducement Table',
        'oracle.inducements.teamA': 'Team A Value (k)',
        'oracle.inducements.teamB': 'Team B Value (k)',
        'oracle.inducements.budget': 'Inducement Budget',
        'oracle.inducements.strategy': 'Strategy',
        'oracle.inducements.empty': 'No inducements available for this TV difference.',
        'oracle.skills.title': 'SKILLS REFERENCE',
        'oracle.skills.filter': 'Filter skills...',
        'oracle.skills.empty': 'No skills found matching your search.',
        'oracle.stars.search': 'Search player or skill...',
        'oracle.stars.all': 'All factions',
        'oracle.stars.empty': 'Nuffle says there is no one here... Try another filter.',
        'home.welcome': 'WELCOME,',
        'home.coach': 'COACH.',
        'home.hero.subtitle': 'Dominate the field with Nuffle\'s blessings and manage your team toward eternal glory.',
        'home.hero.newRoster': 'New Roster',
        'home.hero.matchReports': 'Match Reports',
        'home.cards.oracle.title': 'The Oracle of Nuffle',
        'home.cards.oracle.desc': 'Master the Codex of Skills, consult official rules and stats for each race.',
        'home.cards.oracle.btn': 'Access Files',
        'home.cards.guild.title': 'The Coaches Guild',
        'home.cards.guild.desc': 'Gather your team, manage injuries, level ups, and market transactions.',
        'home.cards.guild.btn': 'Manage Teams',
        'home.cards.arena.title': 'The Arena of Glory',
        'home.cards.arena.desc': 'Start the Live Match Console to control turns, rerolls, and casualties in real-time.',
        'home.cards.arena.btn': 'Enter the Arena',
        'home.activeTeams.title': 'Latest Active Teams',
        'home.activeTeams.viewAll': 'View All',
        'home.search.title': 'Search in the Oracle',
        'home.search.frequent': 'Frequent Searches',
        'team.create.title': 'Create New Team',
        'team.create.draft': 'Draft Season 2024',
        'team.create.save': 'SAVE ROSTER',
        'team.create.data': 'CLUB DATA',
        'team.create.name': 'Team Name',
        'team.create.faction': 'Race / Faction',
        'team.create.coach': 'Coach Name',
        'team.create.hire': 'Hire Players',
        'team.create.hire.limit': 'Limit: 16 players',
        'team.create.goods': 'Team Goods',
        'team.create.rerolls': 'Re-rolls',
        'team.create.apothecary': 'Apothecary',
        'team.create.fans': 'Dedicated Fans',
        'team.create.assistants': 'Assistant Coaches',
        'team.create.cheerleaders': 'Cheerleaders',
        'team.create.summary': 'Value Summary',
        'team.create.budget': 'Remaining Budget',
        'team.create.tv': 'Team Value',
        'team.create.players': 'Players',
        'team.create.currentRoster': 'Current Roster',
        'team.create.finalize': 'Finalize Team',
        'team.create.rules': 'Race Rules',
        'team.create.noStaff': '- No Staff -',
        'oracle.hub.title': "Nuffle's Oracle",
        'oracle.hub.subtitle': "All of Nuffle's wisdom at your fingertips",
        'oracle.hub.search.placeholder': 'Teams, skills, star players, or inducements...',
        'oracle.hub.teams.title': 'Team Encyclopedia',
        'oracle.hub.teams.viewAll': 'View all',
        'oracle.hub.dice.title': 'ORACLE DICE',
        'oracle.hub.dice.success': 'Success probability (2+ with RR):',
        'oracle.hub.dice.btn': 'Calculator',
        'oracle.hub.skills.title': 'Skill Codex',
        'oracle.hub.inducements.title': 'Inducements',
        'oracle.hub.inducements.desc': 'Calculate the Team Value (TV) difference and discover what favors you can buy.',
        'oracle.hub.inducements.yourTv': 'YOUR TV',
        'oracle.hub.inducements.rivalTv': 'RIVAL TV',
        'oracle.hub.inducements.budget': 'Budget:',
        'oracle.hub.inducements.btn': 'View Recommendations',
        'oracle.hub.recent.title': 'Recent Queries',
        'oracle.hub.recent.weather': 'Weather Rules',
        'oracle.hub.recent.injuries': 'Injury Table',
        'oracle.hub.recent.throwFriend': 'Throw Team-Mate',
        'oracle.hub.recent.stars': 'Star Players',
        'oracle.hub.stars.title': 'Star Player Compendium',
        'oracle.hub.stars.desc': 'Check the living legends and elite mercenaries available for your team.',
        'oracle.hub.stars.btn': 'View Star Players',
        'home.activeTeams.empty': 'Your Hall of Fame is still empty...',
        'home.activeTeams.createFirst': 'Recruit your first team',
        'home.search.tag.mightyBlow': 'Mighty Blow',
        'home.search.tag.foulAppearance': 'Foul Appearance',
        'home.search.tag.dodge': 'Dodge',
        'home.search.tag.wrestle': 'Wrestle',
        'home.search.tag.rules': '2024 Rules',
    }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>(() => {
        const saved = localStorage.getItem('bb_assistant_lang') as Language;
        if (saved && (saved === 'es' || saved === 'en')) return saved;
        const browserLang = navigator.language.split('-')[0];
        return browserLang === 'es' ? 'es' : 'en';
    });

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('bb_assistant_lang', lang);
        document.documentElement.lang = lang;
    };

    useEffect(() => {
        document.documentElement.lang = language;
    }, [language]);

    const t = (key: string) => {
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
