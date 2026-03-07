import React, { useState, useRef, useEffect } from 'react';
import { useLanguage, Language } from '../../contexts/LanguageContext';

const LanguageSelector: React.FC = () => {
    const { language, setLanguage } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const toggleDropdown = () => setIsOpen(!isOpen);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectLanguage = (lang: Language) => {
        setLanguage(lang);
        setIsOpen(false);
    };

    const languages: { code: Language; label: string; flag: string }[] = [
        { code: 'es', label: 'Español', flag: '🇪🇸' },
        { code: 'en', label: 'English', flag: '🇺🇸' },
    ];

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={toggleDropdown}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-premium-gold/50 transition-all group"
            >
                <span className="text-xl leading-none">
                    {languages.find(l => l.code === language)?.flag}
                </span>
                <span className="text-[10px] font-display font-black uppercase tracking-widest text-slate-400 group-hover:text-white transition-colors">
                    {language}
                </span>
                <svg
                    className={`w-3 h-3 text-slate-500 group-hover:text-premium-gold transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-32 glass-panel border border-white/10 shadow-2xl z-[150] animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden bg-black/90 backdrop-blur-2xl rounded-xl">
                    <div className="p-1">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => selectLanguage(lang.code)}
                                className={`w-full flex items-center justify-between px-3 py-2 text-left rounded-lg transition-all ${language === lang.code
                                        ? 'bg-premium-gold/20 text-premium-gold'
                                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-lg leading-none">{lang.flag}</span>
                                    <span className="text-[10px] font-display font-bold uppercase tracking-widest">
                                        {lang.label}
                                    </span>
                                </div>
                                {language === lang.code && (
                                    <div className="w-1 h-1 rounded-full bg-premium-gold animate-pulse shadow-[0_0_8px_currentColor]" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LanguageSelector;
