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
