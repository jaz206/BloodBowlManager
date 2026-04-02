import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ManagedTeam, Team, Player, ManagedPlayer, Skill, StarPlayer } from '../../types';
import { useMasterData } from '../../hooks/useMasterData';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../hooks/useAuth';
import SkillModal from '../../components/oracle/SkillModal';
import { PLAYER_NAMES } from './playerNames';
import { fetchTeamImageStock, getPlayerImageUrl, getPosTag, getTeamLogoUrl, getStarPlayerImageUrl, type PositionStock } from '../../utils/imageUtils';

interface TeamCreatorProps {
    onTeamCreate: (team: Omit<ManagedTeam, 'id'>) => Promise<void> | void;
    initialRosterName?: string | null;
}

type CreatorStep = 'selection' | 'draft';

const TeamCreator: React.FC<TeamCreatorProps> = ({ onTeamCreate, initialRosterName }) => {
    const { t, language } = useLanguage();
    const { user } = useAuth();
    const { teams: rosterTemplates, loading, skills: allSkills, starPlayers } = useMasterData();
    
    // Flow State
    const [step, setStep] = useState<CreatorStep>('selection');
    const [selectedFactionIdx, setSelectedFactionIdx] = useState(0);
    
    // Draft State
    const [teamName, setTeamName] = useState('');
    const [draftedPlayers, setDraftedPlayers] = useState<ManagedPlayer[]>([]);
    const [rerolls, setRerolls] = useState(0);
    const [dedicatedFans, setDedicatedFans] = useState(1);
    const [assistantCoaches, setAssistantCoaches] = useState(0);
    const [cheerleaders, setCheerleaders] = useState(0);
    const [apothecary, setApothecary] = useState(false);
    const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imageStock, setImageStock] = useState<PositionStock>({});

    // Initial Budget
    const startingTreasury = 1000000;

    const filteredFactions = useMemo(() => {
        return rosterTemplates.filter(rt => rt.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [rosterTemplates, searchQuery]);

    const currentFaction = useMemo(() => {
        return rosterTemplates[selectedFactionIdx] || null;
    }, [rosterTemplates, selectedFactionIdx]);

    const selectedFactionInFilteredIdx = useMemo(() => {
        if (!currentFaction) return -1;
        return filteredFactions.findIndex(tm => tm.name === currentFaction.name);
    }, [currentFaction, filteredFactions]);

    const visibleFactions = useMemo(() => {
        if (filteredFactions.length === 0) return [];

        const centerIdx = selectedFactionInFilteredIdx >= 0 ? selectedFactionInFilteredIdx : 0;
        const windowSize = 2;
        const start = Math.max(0, centerIdx - windowSize);
        const end = Math.min(filteredFactions.length - 1, centerIdx + windowSize);

        return filteredFactions.slice(start, end + 1).map((tm, localIdx) => {
            const globalIdx = start + localIdx;
            return {
                tm,
                globalIdx,
                distance: Math.abs(globalIdx - centerIdx),
                isActive: globalIdx === centerIdx,
            };
        });
    }, [filteredFactions, selectedFactionInFilteredIdx]);

    const factionStars = useMemo(() => {
        if (!currentFaction) return [];
        return starPlayers.filter(star => 
            star.playsFor?.some(p => p.toLowerCase() === currentFaction.name.toLowerCase()) ||
            star.playsFor?.includes('Any') ||
            star.playsFor?.includes('Global')
        );
    }, [starPlayers, currentFaction]);

    useEffect(() => {
        if (!loading && initialRosterName && rosterTemplates.length > 0) {
            const index = rosterTemplates.findIndex(tm => tm.name === initialRosterName);
            if (index !== -1) setSelectedFactionIdx(index);
        }
    }, [initialRosterName, rosterTemplates, loading]);

    useEffect(() => {
        setDraftedPlayers([]);
        setRerolls(0);
        setDedicatedFans(1);
        setAssistantCoaches(0);
        setCheerleaders(0);
        setApothecary(false);
        setImageStock({});
    }, [selectedFactionIdx]);

    useEffect(() => {
        let cancelled = false;

        const loadImageStock = async () => {
            if (!currentFaction?.name) return;
            const stock = await fetchTeamImageStock(currentFaction.name);
            if (!cancelled) setImageStock(stock);
        };

        loadImageStock();
        return () => {
            cancelled = true;
        };
    }, [currentFaction?.name]);

    const scrollCarousel = (direction: 'left' | 'right') => {
        if (!filteredFactions.length) return;
        const currentFilteredIdx = selectedFactionInFilteredIdx >= 0 ? selectedFactionInFilteredIdx : 0;
        const nextIdx = direction === 'left'
            ? Math.max(0, currentFilteredIdx - 1)
            : Math.min(filteredFactions.length - 1, currentFilteredIdx + 1);
        const nextMasterIdx = rosterTemplates.findIndex(tm => tm.name === filteredFactions[nextIdx]?.name);
        if (nextMasterIdx !== -1) {
            setSelectedFactionIdx(nextMasterIdx);
        }
    };

    const totalCost = useMemo(() => {
        const playersCost = draftedPlayers.reduce((sum, p) => sum + p.cost, 0);
        const rerollCost = rerolls * (currentFaction?.rerollCost || 0);
        const fansCost = (dedicatedFans - 1) * 10000;
        const staffCost = (assistantCoaches + cheerleaders) * 10000;
        const apoCost = apothecary ? 50000 : 0;
        return playersCost + rerollCost + fansCost + staffCost + apoCost;
    }, [draftedPlayers, rerolls, dedicatedFans, assistantCoaches, cheerleaders, apothecary, currentFaction]);

    const remainingBudget = startingTreasury - totalCost;
    const isBudgetNegative = remainingBudget < 0;
    const canFinalize = teamName.trim().length >= 3 && draftedPlayers.length >= 11 && !isBudgetNegative;
    const finalizeHints = useMemo(() => {
        const hints: string[] = [];
        if (teamName.trim().length < 3) hints.push('elige un nombre de al menos 3 caracteres');
        if (draftedPlayers.length < 11) hints.push(`faltan ${11 - draftedPlayers.length} jugadores para el mÃ­nimo`);
        if (isBudgetNegative) hints.push('ajusta el presupuesto para no quedar en negativo');
        return hints;
    }, [teamName, draftedPlayers.length, isBudgetNegative]);

    const getRandomFantasyName = (faction: string, position: string, teamPlayers: ManagedPlayer[]): string => {
        const posLower = position.toLowerCase();
        const facLower = faction.toLowerCase();
        
        let raceKey = '';

        // 1. LOGICA POR EQUIPO ESPECIFICO (Mapeo avanzado)
        if (facLower.includes('alianza') || facLower.includes('old world')) {
            if (posLower.includes('corredor') || posLower.includes('blitzer') || posLower.includes('matatrolls') || posLower.includes('blocker')) raceKey = 'ENANOS';
            else if (posLower.includes('hopeful')) raceKey = 'HALFLINGS';
            else if (posLower.includes('ogro') || posLower.includes('tree')) raceKey = 'OGROS';
            else raceKey = 'HUMANOS';
        } 
        else if (facLower.includes('negros') || facLower.includes('black orc')) {
            if (posLower.includes('goblin')) raceKey = 'GOBLINS';
            else if (posLower.includes('troll')) raceKey = 'ORCOS';
            else raceKey = 'ORCOS NEGROS';
        }
        else if (facLower.includes('orco') || facLower.includes('orc')) {
            if (posLower.includes('goblin')) raceKey = 'GOBLINS';
            else if (posLower.includes('troll')) raceKey = 'ORCOS';
            else raceKey = 'ORCOS';
        }
        else if (facLower.includes('chozas') || facLower.includes('chosen') || facLower.includes('elegidos')) {
            if (posLower.includes('beastman') || posLower.includes('hombre bestia')) raceKey = 'CAOS';
            else if (posLower.includes('ogro') || posLower.includes('minotaur') || posLower.includes('troll')) raceKey = 'ELEGIDOS DEL CAOS';
            else raceKey = 'ELEGIDOS DEL CAOS';
        }
        else if (facLower.includes('caos') && facLower.includes('enanos')) {
            if (posLower.includes('hobgoblin')) raceKey = 'GOBLINS';
            else if (posLower.includes('minotauro') || posLower.includes('centauro')) raceKey = 'ENANOS DEL CAOS';
            else raceKey = 'ENANOS DEL CAOS';
        }
        else if (facLower.includes('lagarto') || facLower.includes('lizard')) {
            raceKey = 'HOMBRES LAGARTO';
        }
        else if (facLower.includes('funerarios') || facLower.includes('khemri') || facLower.includes('tomb king')) {
            if (posLower.includes('mummy') || posLower.includes('guardian')) raceKey = 'REYES DE LA TUMBA';
            else raceKey = 'NO MUERTOS';
        }
        else if (facLower.includes('nigro') || facLower.includes('necro')) {
            if (posLower.includes('zombie') || posLower.includes('ghoul')) raceKey = 'NO MUERTOS';
            else raceKey = 'HORROR NECROMÃNTICO';
        }
        else if (facLower.includes('vampiro')) {
            if (posLower.includes('thrall') || posLower.includes('esclavo')) raceKey = 'HUMANOS';
            else raceKey = 'VAMPIROS';
        }
        else if (facLower.includes('inframundo') || facLower.includes('underworld')) {
            if (posLower.includes('goblin') || posLower.includes('snotling')) raceKey = 'GOBLINS';
            else if (posLower.includes('skaven')) raceKey = 'SKAVENS';
            else raceKey = 'HABITANTES DEL INFRAMUNDO';
        }
        else if (facLower.includes('nobleza') || facLower.includes('nobility')) {
            if (posLower.includes('ogro')) raceKey = 'OGROS';
            else raceKey = 'NOBLEZA IMPERIAL';
        }
        else if (facLower.includes('khorne')) raceKey = 'KHORNE';
        else if (facLower.includes('nurgle')) raceKey = 'NURGLE';
        else if (facLower.includes('enano') || facLower.includes('dwarf')) raceKey = 'ENANOS';
        else if (facLower.includes('skaven')) raceKey = 'SKAVENS';
        else if (facLower.includes('humano') || facLower.includes('human')) raceKey = 'HUMANOS';
        else if (facLower.includes('oscuros')) raceKey = 'ELFOS OSCUROS';
        else if (facLower.includes('silvanos')) raceKey = 'ELFOS SILVANOS';
        else if (facLower.includes('altos elfos')) raceKey = 'ALTOS ELFOS';
        else if (facLower.includes('elfos') || facLower.includes('union')) raceKey = 'UNIÃ“N Ã‰LFICA';
        else if (facLower.includes('ogro')) raceKey = 'OGROS';
        else if (facLower.includes('halfling')) raceKey = 'HALFLINGS';
        else if (facLower.includes('goblin')) raceKey = 'GOBLINS';
        else if (facLower.includes('snotling')) raceKey = 'SNOTLINGS';
        else if (facLower.includes('nÃ³rdico') || facLower.includes('norse')) raceKey = 'NÃ“RDICOS';
        else if (facLower.includes('slann')) raceKey = 'SLANN';
        else if (facLower.includes('amazonas')) raceKey = 'AMAZONAS';

        // 2. DETECCION POR PALABRA CLAVE (Fallback)
        if (!raceKey) {
            if (posLower.includes('orco negro') || posLower.includes('black orc')) raceKey = 'ORCOS NEGROS';
            else if (posLower.includes('orco') || posLower.includes('orc')) raceKey = 'ORCOS';
            else if (posLower.includes('enano') || posLower.includes('dwarf')) raceKey = 'ENANOS';
            else if (posLower.includes('elfo oscuro') || posLower.includes('dark elf')) raceKey = 'ELFOS OSCUROS';
            else if (posLower.includes('elfo silvano') || posLower.includes('wood elf')) raceKey = 'ELFOS SILVANOS';
            else if (posLower.includes('alto elfo') || posLower.includes('high elf')) raceKey = 'ALTOS ELFOS';
            else if (posLower.includes('elfo') || posLower.includes('elf')) raceKey = 'UNIÃ“N Ã‰LFICA';
            else if (posLower.includes('humano') || posLower.includes('human')) raceKey = 'HUMANOS';
            else if (posLower.includes('skaven')) raceKey = 'SKAVENS';
            else if (posLower.includes('ogro') || posLower.includes('ogre')) raceKey = 'OGROS';
            else if (posLower.includes('goblin')) raceKey = 'GOBLINS';
            else if (posLower.includes('snotling')) raceKey = 'SNOTLINGS';
        }

        if (raceKey && PLAYER_NAMES[raceKey]) {
            const list = PLAYER_NAMES[raceKey];
            const usedNames = teamPlayers.map(p => p.customName);
            const available = list.filter(name => !usedNames.includes(name));
            
            if (available.length > 0) {
                return available[Math.floor(Math.random() * available.length)];
            }
            return list[Math.floor(Math.random() * list.length)];
        }

        return `${position} #${teamPlayers.length + 1}`;
    };

    const extractFilenameFromUrl = (url?: string): string => {
        if (!url) return '';
        const parts = url.split('/').map(part => decodeURIComponent(part));
        return parts[parts.length - 1] || '';
    };

    const buildDraftPlayerImage = (
        position: string,
        draftIndexForPosition: number,
        existingPlayers: ManagedPlayer[],
        stockSource: PositionStock = imageStock
    ): string => {
        const rosterName = currentFaction?.name || '';
        const stockEntry = stockSource[getPosTag(position).toLowerCase()];

        if (stockEntry?.files?.length) {
            const usedFiles = existingPlayers
                .filter(player => player.position === position)
                .map(player => extractFilenameFromUrl(player.image));

            const availableFiles = stockEntry.files.filter(file => !usedFiles.includes(file));
            const selectedFilename = availableFiles[0] || stockEntry.files[draftIndexForPosition % stockEntry.files.length];
            const fileMatch = selectedFilename.match(/(\d+)\.png$/i);
            const fileNumber = fileMatch ? parseInt(fileMatch[1], 10) : draftIndexForPosition + 1;

            return getPlayerImageUrl(
                rosterName,
                position,
                fileNumber,
                stockEntry.storage,
                selectedFilename
            );
        }

        return getPlayerImageUrl(rosterName, position, draftIndexForPosition + 1);
    };

    useEffect(() => {
        if (!currentFaction?.name || Object.keys(imageStock).length === 0 || draftedPlayers.length === 0) return;

        setDraftedPlayers(prevPlayers => {
            const seenByPosition: Record<string, number> = {};
            return prevPlayers.map((player, index) => {
                const draftIndexForPosition = seenByPosition[player.position] || 0;
                seenByPosition[player.position] = draftIndexForPosition + 1;
                return {
                    ...player,
                    image: buildDraftPlayerImage(player.position, draftIndexForPosition, prevPlayers.slice(0, index))
                };
            });
        });
    }, [imageStock, currentFaction?.name]);

    const handleHirePlayer = (pos: Player) => {
        if (draftedPlayers.length >= 16) return;
        const count = draftedPlayers.filter(p => p.position === pos.position).length;
        const limitStr = pos.qty.split('-')[1] || pos.qty;
        if (count >= parseInt(limitStr)) return;

        const countInDraft = draftedPlayers.filter(p => p.position === pos.position).length;
        const playerImageUrl = buildDraftPlayerImage(pos.position, countInDraft, draftedPlayers);

        const newPlayer: ManagedPlayer = {
            ...pos,
            id: Date.now() + Math.random(),
            customName: getRandomFantasyName(currentFaction?.name || '', pos.position, draftedPlayers),
            spp: 0,
            gainedSkills: [],
            lastingInjuries: [],
            status: 'Activo',
            image: playerImageUrl,
        };
        setDraftedPlayers([...draftedPlayers, newPlayer]);
    };

    const handleFirePlayer = (id: number) => {
        setDraftedPlayers(draftedPlayers.filter(p => p.id !== id));
    };

    const localizeSkill = (keyEN: string): string => {
        const found = allSkills.find(s => s.keyEN === keyEN);
        return found?.name_es || found?.nameEN || keyEN;
    };

    const handleSubmit = async () => {
        if (!canFinalize || !currentFaction) return;
        setSubmitError(null);
        setIsSubmitting(true);
        const finalStock = Object.keys(imageStock).length > 0
            ? imageStock
            : await fetchTeamImageStock(currentFaction.name);
        const finalPlayers = draftedPlayers.map((player, index) => {
            const priorPlayers = draftedPlayers.slice(0, index);
            const draftIndexForPosition = priorPlayers.filter(p => p.position === player.position).length;
            return {
                ...player,
                image: buildDraftPlayerImage(player.position, draftIndexForPosition, priorPlayers, finalStock)
            };
        });
        const newTeam: Omit<ManagedTeam, 'id'> = {
            name: teamName.trim(),
            rosterName: currentFaction.name,
            treasury: remainingBudget,
            rerolls,
            dedicatedFans,
            assistantCoaches,
            cheerleaders,
            apothecary,
            players: finalPlayers,
            crestImage: getTeamLogoUrl(currentFaction.name) || currentFaction.image
        };
        try {
            await onTeamCreate(newTeam);
        } catch (error) {
            setSubmitError(error instanceof Error ? error.message : 'No se pudo fundar la franquicia.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading || !currentFaction) {
        return (
            <div className="flex flex-col items-center justify-center p-20 min-h-[60vh] bg-[radial-gradient(circle_at_top,rgba(255,248,233,0.98),rgba(226,194,142,0.86))] text-[#2b1d12]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#CA8A04] mb-4"></div>
                <p className="text-[#8d7863] font-display animate-pulse uppercase tracking-widest italic">Invocando al Comisario...</p>
            </div>
        );
    }

    // PHASE 1: DISCOVERY (NUFFLE GRIMDARK)
    if (step === 'selection') {
        const ratings = currentFaction.ratings || { fuerza: 50, agilidad: 50, velocidad: 50, armadura: 50, pase: 50 };
        const getPoint = (val: number, angle: number) => {
            const r = (val / 100) * 45;
            const x = 50 + r * Math.cos((angle * Math.PI) / 180);
            const y = 50 + r * Math.sin((angle * Math.PI) / 180);
            return `${x},${y}`;
        };
        const radarPoints = [
            getPoint(ratings.fuerza || 50, 270),
            getPoint(ratings.armadura || 50, 0),
            getPoint(ratings.velocidad || 50, 90),
            getPoint(ratings.agilidad || 50, 180)
        ].join(' ');

        return (
            <div className="guild-creation-light min-h-screen w-full flex flex-col bg-[radial-gradient(circle_at_top,rgba(255,248,233,0.98),rgba(226,194,142,0.86))] text-[#2b1d12] font-inter overflow-x-hidden antialiased selection:bg-gold selection:text-black">
                {/* 1. COMPACT RACE SELECTOR */}
                <nav className="w-full bg-[rgba(255,248,233,0.86)] backdrop-blur-xl border-b border-[rgba(111,87,56,0.12)] py-4 px-8 sticky top-16 z-[100] shadow-[0_14px_32px_rgba(89,59,21,0.08)]">
                    <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-8">
                        <div className="flex flex-col shrink-0">
                            <h2 className="text-[9px] font-black text-gold uppercase tracking-[0.4em] mb-0.5">CÃ¡tedra de Nuffle</h2>
                            <p className="text-[12px] font-header font-black text-[#2b1d12] italic uppercase tracking-tighter">ElecciÃ³n de Franquicia</p>
                        </div>

                        <div className="relative flex-1 max-w-4xl px-12 group">
                             <button 
                                onClick={() => scrollCarousel('left')} 
                                className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-gold hover:bg-gold/10 rounded-full transition-all z-20 border border-gold/10 bg-[rgba(255,251,241,0.7)] backdrop-blur"
                            >
                                <span className="material-symbols-outlined font-black text-base">chevron_left</span>
                            </button>
                            
                            <div className="flex items-center justify-center gap-4 py-2">
                                <div className="hidden lg:flex items-center gap-4">
                                    {visibleFactions.map(({ tm, globalIdx, distance, isActive }) => {
                                        const masterIdx = rosterTemplates.findIndex(f => f.name === tm.name);
                                        const sizeClass =
                                            distance === 0 ? 'w-40 h-40 lg:w-44 lg:h-44' :
                                            distance === 1 ? 'w-28 h-28 lg:w-32 lg:h-32' :
                                            'w-24 h-24 lg:w-28 lg:h-28';
                                        const toneClass = isActive
                                            ? 'opacity-100 scale-100'
                                            : distance === 1
                                                ? 'opacity-75 scale-95'
                                                : 'opacity-35 scale-90 grayscale';

                                        return (
                                            <button
                                                key={tm.name}
                                                onClick={() => setSelectedFactionIdx(masterIdx)}
                                                className={`relative flex-none flex flex-col items-center gap-3 transition-all duration-500 outline-none ${toneClass}`}
                                            >
                                                <div className={`rounded-[1.5rem] overflow-hidden bg-[rgba(255,251,241,0.74)] border transition-all duration-500 relative ${sizeClass} ${isActive ? 'border-gold shadow-[0_0_28px_rgba(202,138,4,0.35)] -translate-y-1' : 'border-[rgba(111,87,56,0.10)] hover:border-gold/20'}`}>
                                                    <img
                                                        src={getTeamLogoUrl(tm.name)}
                                                        onError={(e) => {
                                                            const img = e.target as HTMLImageElement;
                                                            if (img.src !== tm.image) img.src = tm.image;
                                                        }}
                                                        alt={tm.name}
                                                        className="w-full h-full object-contain p-3"
                                                    />
                                                    {isActive && (
                                                        <motion.div layoutId="active-bg" className="absolute inset-0 bg-gold/10 pointer-events-none" />
                                                    )}
                                                </div>
                                                <span className={`w-32 text-[9px] font-black uppercase tracking-tight leading-tight text-center transition-all ${isActive ? 'text-[#2b1d12] border-b border-gold pb-1 text-[10px]' : 'text-[#8d7863]'}`}>
                                                    {tm.name}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="lg:hidden flex items-center gap-3 overflow-x-auto no-scrollbar py-1 px-2">
                                    {filteredFactions.map((tm) => {
                                        const masterIdx = rosterTemplates.findIndex(f => f.name === tm.name);
                                        const isSelected = selectedFactionIdx === masterIdx;
                                        return (
                                            <button
                                                key={tm.name}
                                                onClick={() => setSelectedFactionIdx(masterIdx)}
                                                className={`flex-none flex flex-col items-center gap-2 group transition-all duration-500 outline-none ${isSelected ? 'scale-105' : 'opacity-30 grayscale'}`}
                                            >
                                                <div className={`w-24 h-24 rounded-2xl overflow-hidden bg-[rgba(255,251,241,0.76)] border transition-all duration-500 relative ${isSelected ? 'border-gold shadow-[0_0_15px_rgba(202,138,4,0.3)]' : 'border-white/5'}`}>
                                                    <img
                                                        src={getTeamLogoUrl(tm.name)}
                                                        onError={(e) => {
                                                            const img = e.target as HTMLImageElement;
                                                            if (img.src !== tm.image) img.src = tm.image;
                                                        }}
                                                        alt={tm.name}
                                                        className="w-full h-full object-contain p-2"
                                                    />
                                                    {isSelected && (
                                                        <motion.div layoutId="active-bg-mobile" className="absolute inset-0 bg-gold/5 pointer-events-none" />
                                                    )}
                                                </div>
                                                <span className={`w-24 text-[9px] font-black uppercase tracking-tight leading-tight text-center transition-colors ${isSelected ? 'text-[#2b1d12] border-b border-gold pb-0.5' : 'text-[#8d7863]'}`}>{tm.name}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <button 
                                onClick={() => scrollCarousel('right')} 
                                className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-gold hover:bg-gold/10 rounded-full transition-all z-20 border border-gold/10 bg-[rgba(255,251,241,0.7)] backdrop-blur"
                            >
                                <span className="material-symbols-outlined font-black text-base">chevron_right</span>
                            </button>
                        </div>

                        <div className="relative w-64 shrink-0">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gold/30 text-base">search</span>
                            <input 
                                value={searchQuery} 
                                onChange={(e) => setSearchQuery(e.target.value)} 
                                className="w-full blood-ui-light-input rounded-lg py-2 pl-10 pr-4 text-[10px] tracking-widest text-[#2b1d12] focus:ring-1 focus:ring-gold/50 transition-all placeholder:text-[#8d7863] outline-none uppercase font-bold" 
                                placeholder="RASTREAR RAZA..." 
                                type="text"
                            />
                        </div>
                    </div>
                </nav>                <main className="max-w-[1500px] mx-auto px-6 pt-24 pb-48 grid grid-cols-1 md:grid-cols-12 gap-8 items-start relative">
                    {/* Background Illustration Glow */}
                    <AnimatePresence mode="wait">
                        <motion.div 
                            key={currentFaction.name}
                            initial={{ opacity: 0, scale: 0.8, x: 50 }}
                            animate={{ opacity: 0.08, scale: 0.9, x: 0 }}
                            exit={{ opacity: 0, scale: 1.1, x: -50 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="absolute right-0 top-24 w-[600px] h-[600px] pointer-events-none z-0 overflow-hidden"
                        >
                            <img 
                                src={currentFaction.image} 
                                alt="" 
                                className="w-full h-full object-contain filter grayscale invert"
                            />
                        </motion.div>
                    </AnimatePresence>

                    {/* CONTENT AREA (8 COLS) */}
                    <section className="col-span-12 xl:col-span-8 flex flex-col gap-8 relative z-10">
                        <motion.div 
                            key={currentFaction.name + '-info'}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-3"
                        >
                            <h1 className="text-4xl font-header font-black text-[#2b1d12] italic tracking-tighter uppercase leading-none drop-shadow-2xl">
                                {currentFaction.name}
                            </h1>
                            <p className="text-[#7b6853] text-[10px] font-black tracking-[0.4em] uppercase italic border-l-2 border-gold pl-4 py-0.5">
                                {language === 'es' ? currentFaction.specialRules_es : currentFaction.specialRules_en}
                            </p>
                        </motion.div>

                        <div className="blood-ui-light-card rounded-3xl shadow-[0_24px_60px_rgba(89,59,21,0.16)] backdrop-blur-md overflow-hidden">
                            <div className="px-6 py-4 border-b border-white/5 bg-[rgba(255,251,241,0.7)] flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-header font-black italic text-[#2b1d12] uppercase tracking-tighter">Plantilla Base</h3>
                                    <p className="text-[#8d7863] text-[8px] font-black tracking-[0.4em] uppercase mt-0.5">S3 Competitive Standard</p>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex flex-col items-end">
                                        <span className="text-[7px] font-bold text-[#8d7863] uppercase tracking-widest">Reroll Cost</span>
                                        <span className="text-lg font-header font-black text-gold italic">{(currentFaction.rerollCost / 1000)}k</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-[rgba(111,87,56,0.10)] text-[8px] text-[#7b6853] uppercase tracking-[0.3em] font-black bg-[rgba(255,251,241,0.6)]">
                                            <th className="py-3 px-6">PosiciÃ³n</th>
                                            <th className="py-3 px-1 text-center">MA</th>
                                            <th className="py-3 px-1 text-center">ST</th>
                                            <th className="py-3 px-1 text-center">AG</th>
                                            <th className="py-3 px-1 text-center">PA</th>
                                            <th className="py-3 px-1 text-center">AV</th>
                                            <th className="py-3 px-6 text-right">Coste</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentFaction.roster.map((pos, pidx) => (
                                            <tr key={pidx} className="border-b border-[rgba(111,87,56,0.08)] hover:bg-[rgba(255,251,241,0.75)] transition-all group">
                                                <td className="py-3 px-6">
                                                    <div className="flex flex-col">
                                                        <span className="text-base font-black text-[#2b1d12] uppercase italic tracking-tighter group-hover:text-gold transition-colors">{pos.position}</span>
                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                            {pos.skillKeys.length > 0 ? pos.skillKeys.slice(0, 4).map(sk => {
                                                                const skillObj = allSkills.find(s => s.keyEN === sk);
                                                                return (
                                                                    <button 
                                                                        key={sk} 
                                                                        onClick={() => skillObj && setSelectedSkill(skillObj)}
                                                                        className="px-1.5 py-0 bg-white/5 hover:bg-gold hover:text-black text-[7px] font-black rounded-sm uppercase tracking-widest text-gold/80 transition-all border border-gold/10"
                                                                    >
                                                                        {localizeSkill(sk)}
                                                                    </button>
                                                                );
                                                            }) : <span className="text-[7px] font-black uppercase text-[#7b6853]">Roster BÃ¡sico</span>}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-1 text-center text-[#2b1d12] font-mono font-bold text-sm">{pos.stats.MV}</td>
                                                <td className="py-3 px-1 text-center text-[#2b1d12] font-mono font-bold text-sm">{pos.stats.FU}</td>
                                                <td className="py-3 px-1 text-center text-[#2b1d12] font-mono font-bold text-sm">{pos.stats.AG}</td>
                                                <td className="py-3 px-1 text-center text-[#2b1d12] font-mono font-bold text-sm">{pos.stats.PA}</td>
                                                <td className="py-3 px-1 text-center text-[#2b1d12] font-mono font-bold text-sm">{pos.stats.AR}</td>
                                                <td className="py-3 px-6 text-right">
                                                    <span className="font-header text-lg font-black text-gold italic">{(pos.cost / 1000).toLocaleString()}k</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2 blood-ui-light-card p-6 rounded-2xl space-y-3">
                                <h3 className="text-[9px] font-black text-gold uppercase tracking-[0.4em]">Resiliencia HistÃ³rica</h3>
                                <p className="text-[#4b3a28] leading-relaxed text-xs italic font-medium">
                                    {language === 'es' 
                                        ? "El Ã©xito en los campos de Nuffle no se mide solo en touchdowns, sino en el miedo que inspiras al desplazar la lÃ­nea. Esta formaciÃ³n prioriza el control territorial y el impacto fÃ­sico." 
                                        : "Success on Nuffle's fields is measured not just in touchdowns, but in the fear you inspire."}
                                </p>
                            </div>
                            <div className="blood-ui-light-card p-6 rounded-2xl flex flex-col items-center justify-center text-center group hover:bg-[rgba(255,251,241,0.92)] transition-colors">
                                <span className="text-[8px] font-black text-gold uppercase tracking-[0.4em] mb-2 italic opacity-60">Status Tier</span>
                                <span className="text-3xl font-header font-black text-[#2b1d12] italic tracking-tighter">Tier {currentFaction.tier}</span>
                            </div>
                        </div>
                    </section>

                    {/* SIDEBAR (4 COLS) */}
                    <aside className="col-span-12 xl:col-span-4 flex flex-col gap-8 sticky top-32 z-10 lg:pl-10">
                        {/* Radar Chart (The Diamond) - Compact */}
                        <div className="blood-ui-card-strong p-8 border border-[rgba(111,87,56,0.10)] rounded-3xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            <h3 className="text-[9px] font-black text-gold mb-8 uppercase tracking-[0.3em] flex items-center justify-between">
                                AnÃ¡lisis Atributivo
                            </h3>
                            
                            <div className="relative aspect-square flex items-center justify-center p-4">
                                <svg className="w-full h-full max-w-[200px] overflow-visible" viewBox="-15 -15 130 130">
                                    {/* Grids */}
                                    <polygon className="stroke-white/5 fill-none" points="50,0 100,50 50,100 0,50" strokeWidth="0.5"></polygon>
                                    <polygon className="stroke-white/5 fill-none" points="50,25 75,50 50,75 25,50" strokeWidth="0.5"></polygon>
                                    <line x1="50" y1="0" x2="50" y2="100" className="stroke-white/5" strokeWidth="0.5"></line>
                                    <line x1="0" y1="50" x2="100" y2="50" className="stroke-white/5" strokeWidth="0.5"></line>
                                    
                                    {/* The Polygon */}
                                    <motion.polygon 
                                        key={currentFaction.name}
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="radar-fill fill-gold/20 stroke-gold/60" 
                                        points={radarPoints} 
                                        strokeWidth="2"
                                    ></motion.polygon>
                                    
                                    {/* Labels with fixed positions */}
                                    <text className="fill-[#7b6853] text-[8px] font-black uppercase italic" textAnchor="middle" x="50" y="-12">ST</text>
                                    <text className="fill-[#7b6853] text-[8px] font-black uppercase italic" textAnchor="start" x="110" y="53">AV</text>
                                    <text className="fill-[#7b6853] text-[8px] font-black uppercase italic" textAnchor="middle" x="50" y="118">MV</text>
                                    <text className="fill-[#7b6853] text-[8px] font-black uppercase italic" textAnchor="end" x="-10" y="53">AG</text>
                                </svg>
                            </div>
                        </div>

                        {/* Star Players - Compact Grid */}
                        <div className="flex flex-col gap-4">
                            <h3 className="text-[10px] font-black text-[#7b6853] uppercase tracking-[0.4em] flex items-center gap-4">
                                Staff Estelar
                                <div className="h-px flex-1 bg-[rgba(111,87,56,0.12)]"></div>
                            </h3>
                            <div className="grid grid-cols-3 gap-3">
                                {factionStars.slice(0, 6).map((star, sidx) => (
                                    <div key={sidx} className="blood-ui-light-card p-2 rounded-xl group cursor-pointer hover:bg-[rgba(255,251,241,0.9)] hover:border-gold/20 transition-all">
                                        <div className="aspect-square bg-[rgba(255,251,241,0.76)] rounded-lg overflow-hidden mb-2 border border-[rgba(111,87,56,0.10)]">
                                            <img 
                                                src={getStarPlayerImageUrl(star.name)} 
                                                onError={(e) => {
                                                    const img = e.target as HTMLImageElement;
                                                    if (img.src !== star.image) img.src = star.image;
                                                }}
                                                alt={star.name} 
                                                className="object-cover w-full h-full grayscale group-hover:grayscale-0 transition-opacity opacity-60 group-hover:opacity-100" 
                                            />
                                        </div>
                                        <p className="text-[7px] font-black text-center text-[#7b6853] group-hover:text-gold uppercase tracking-tighter truncate">{star.name}</p>
                                    </div>
                                ))}
                                {factionStars.length === 0 && (
                                    <div className="col-span-3 py-8 text-center border border-dashed border-white/5 rounded-2xl opacity-20 text-[8px] uppercase font-black tracking-widest text-[#7b6853]">
                                        Sin Contratos
                                    </div>
                                )}
                            </div>
                        </div>
                    </aside>
                </main>

                {/* ACTION FOOTER - DYNAMIC ISLAND PILL */}
                <footer className="fixed bottom-8 left-0 w-full flex justify-center z-[110] pointer-events-none">
                    <div className="pointer-events-auto">
                        <button 
                            onClick={() => setStep('draft')}
                            className="bg-gold hover:bg-white text-black font-header italic font-black text-xl px-20 py-4 tracking-tighter uppercase transition-all transform hover:scale-105 active:scale-95 shadow-[0_15px_40px_rgba(202,138,4,0.3)] relative group overflow-hidden rounded-full flex items-center gap-3 border border-black/10"
                        >
                            <span className="material-symbols-outlined text-2xl font-black">token</span>
                            <span>Fundar esta Franquicia</span>
                            <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:left-full transition-all duration-1000 ease-in-out"></div>
                        </button>
                    </div>
                </footer>

                <AnimatePresence>
                    {selectedSkill && <SkillModal skill={selectedSkill} onClose={() => setSelectedSkill(null)} />}
                </AnimatePresence>
                
                <style>{`
                    .radar-fill { filter: drop-shadow(0 0 8px #CA8A04); transition: all 1s ease; }
                    .custom-scrollbar::-webkit-scrollbar { display: none; }
                    .no-scrollbar::-webkit-scrollbar { display: none; }
                `}</style>
            </div>
        );
    }

    // PHASE 2: DRAFT (NUFFLE COMMISSARY)
    return (
        <div className="h-screen w-full flex flex-col bg-[radial-gradient(circle_at_top,rgba(255,248,233,0.98),rgba(226,194,142,0.86))] text-[#2b1d12] overflow-hidden font-inter select-none">
            {/* Header / Command Center - COMPACT */}
            <header className="flex-none bg-[rgba(255,248,233,0.90)] backdrop-blur-xl border-b border-[rgba(111,87,56,0.12)] shadow-[0_12px_28px_rgba(89,59,21,0.08)] px-6 py-3 z-50">
                <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setStep('selection')} 
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-gold hover:bg-gold hover:text-black transition-all group"
                        >
                            <span className="material-symbols-outlined text-sm font-black group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
                        </button>
                        <div className="flex flex-col">
                            <h1 className="text-[9px] font-black text-gold uppercase tracking-[0.4em] leading-none mb-0.5">Mesa de ContrataciÃ³n</h1>
                            <p className="text-sm font-header font-black text-[#2b1d12] italic uppercase tracking-tighter">{currentFaction.name}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                         <div className="px-4 py-1 rounded-xl border border-white/5 bg-white/[0.02] flex items-center gap-3">
                            <span className="text-[8px] font-black text-[#8d7863] uppercase tracking-widest italic">Race:</span>
                            <img src={currentFaction.image} className="w-4 h-4 object-contain grayscale opacity-50" alt="" />
                            <span className="text-[8px] font-black text-[#2b1d12] uppercase tracking-widest italic">{currentFaction.name}</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* TEAM NAME HERO - REDUCED SCALE */}
            <section className="flex-none px-6 py-6 bg-[rgba(255,251,241,0.65)] border-b border-[rgba(111,87,56,0.12)]">
                <div className="max-w-screen-2xl mx-auto">
                    <div className="max-w-xl">
                        <label className="text-[8px] font-black text-gold uppercase tracking-[0.5em] ml-1 mb-2 block opacity-50">DesignaciÃ³n de la Franquicia</label>
                        <input 
                            className="w-full bg-transparent border-none p-0 text-3xl font-header font-black text-[#2b1d12] italic placeholder:text-[#8d7863] outline-none uppercase tracking-tighter selection:bg-gold selection:text-black" 
                            placeholder="ESCRIBE EL NOMBRE..." 
                            type="text"
                            value={teamName}
                            onChange={(e) => setTeamName(e.target.value)}
                            maxLength={40}
                        />
                    </div>
                </div>
            </section>

            {/* MAIN COMMAND INTERFACE */}
            <main className="flex-1 flex overflow-hidden">
                {/* MARKET: Player Recruitment - DENSER GRID */}
                <section className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar">
                    <div className="flex items-center gap-3">
                        <h2 className="text-[9px] font-black text-[#7b6853] uppercase tracking-[0.5em] italic">Mercado de Jugadores</h2>
                        <div className="h-px flex-1 bg-[rgba(111,87,56,0.12)]"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
                        {currentFaction.roster.map((pos, idx) => {
                            const count = draftedPlayers.filter(p => p.position === pos.position).length;
                            const limitStr = pos.qty.split('-')[1] || pos.qty;
                            const limit = parseInt(limitStr);
                            const isFull = count >= limit;
                            const canAfford = remainingBudget >= pos.cost;

                            return (
                                <motion.div 
                                    layout 
                                    key={idx} 
                                    className={`relative blood-ui-light-card border rounded-2xl p-4 flex flex-col justify-between transition-all group overflow-hidden ${
                                        isFull 
                                        ? 'opacity-30 border-white/5' 
                                        : 'border-[rgba(111,87,56,0.10)] hover:border-gold/30 hover:bg-[rgba(255,251,241,0.88)] shadow-xl'
                                    }`}
                                >
                                    {isFull && <div className="absolute inset-0 bg-[rgba(111,87,56,0.12)] backdrop-grayscale pointer-events-none z-10" />}
                                    
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-header font-black text-[#2b1d12] uppercase italic tracking-tighter group-hover:text-gold transition-colors truncate max-w-[120px]">{pos.position}</span>
                                                <div className="relative group/skill-tip">
                                                    <span className="material-symbols-outlined text-[#7b6853] text-[12px] cursor-help hover:text-gold transition-colors font-black">help</span>
                                                    {pos.skillKeys && pos.skillKeys.length > 0 && (
                                                        <div className="absolute bottom-full left-0 mb-3 hidden group-hover/skill-tip:flex flex-wrap gap-1 p-3 blood-ui-light-card border border-[rgba(111,87,56,0.14)] rounded-xl shadow-2xl z-50 w-48 backdrop-blur-xl">
                                                            {pos.skillKeys.map(sk => {
                                                                const skillFound = allSkills.find(s => s.keyEN === sk);
                                                                return (
                                                                    <span 
                                                                        key={sk} 
                                                                        onClick={() => skillFound && setSelectedSkill(skillFound)}
                                                                        className="text-[7px] font-black px-1.5 py-0.5 rounded bg-gold/10 text-gold uppercase border border-gold/10 tracking-widest cursor-pointer hover:bg-gold hover:text-black transition-all"
                                                                    >
                                                                        {localizeSkill(sk)}
                                                                    </span>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-sm font-header font-black text-gold italic">{pos.cost / 1000}k</span>
                                                <span className="text-[7px] font-black text-[#7b6853]">MO</span>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleHirePlayer(pos)} 
                                            disabled={isFull || !canAfford} 
                                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                                                isFull || !canAfford 
                                                ? 'bg-white/[0.02] text-[#2b1d12]/5 cursor-not-allowed border border-white/5' 
                                                : 'bg-gold text-black hover:scale-110 active:scale-95 shadow-lg shadow-gold/10 font-black'
                                            }`}
                                        >
                                            <span className="material-symbols-outlined font-black text-lg">person_add</span>
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                                        <div className="flex gap-2">
                                            {['MV', 'FU', 'AG', 'PA', 'AR'].map(s => (
                                                <div key={s} className="flex flex-col items-center">
                                                    <span className="text-[6px] font-black text-[#7b6853] uppercase">{s.replace('MV','MA').replace('FU','ST').replace('AR','AV')}</span>
                                                    <span className="text-[10px] font-mono font-bold text-[#2b1d12]">{(pos.stats as any)[s]}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <span className="text-[8px] font-black text-[#7b6853] uppercase tracking-widest italic">{count} / {limit}</span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </section>

                {/* SIDEBAR: Command Status - COMPACT WIDTH */}
                <aside id="squad_list" className="w-[340px] blood-ui-light-card border-l border-[rgba(111,87,56,0.12)] flex flex-col h-full shadow-inner">
                    {/* 1. Treasury Summary - Top Fixed */}
                    <div className="p-5 bg-[rgba(255,251,241,0.65)] border-b border-[rgba(111,87,56,0.12)]">
                        <span className="text-[8px] uppercase font-black text-[#7b6853] tracking-[0.4em] italic mb-1 block">TesorerÃ­a Inicial</span>
                        <div className="flex items-baseline gap-1.5">
                            <span className={`text-2xl font-header font-black italic tracking-tighter ${isBudgetNegative ? 'text-blood animate-pulse' : 'text-[#2b1d12]'}`}>
                                {remainingBudget.toLocaleString()}
                            </span>
                            <small className="text-[10px] font-black text-gold italic">MO</small>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-4">
                            <div className="blood-ui-light-card p-2 rounded-lg">
                                <span className="text-[7px] font-black text-[#7b6853] uppercase tracking-widest block">Roster</span>
                                <span className={`text-sm font-header font-black italic ${draftedPlayers.length < 11 ? 'text-blood' : 'text-gold'}`}>{draftedPlayers.length} / 16</span>
                            </div>
                            <div className="blood-ui-light-card p-2 rounded-lg">
                                <span className="text-[7px] font-black text-[#7b6853] uppercase tracking-widest block">VAE</span>
                                <span className="text-sm font-header font-black italic text-[#2b1d12]">{(totalCost / 1000).toLocaleString()}k</span>
                            </div>
                        </div>
                    </div>

                    {/* 2. SQUAD LIST (Scrollable priority) */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-2 no-scrollbar bg-[rgba(255,248,233,0.18)]">
                         <div className="flex items-center gap-2 mb-2">
                            <span className="text-[8px] font-black text-[#7b6853] uppercase tracking-widest">Contrataciones</span>
                            <div className="h-px flex-1 bg-[rgba(111,87,56,0.12)]"></div>
                        </div>
                        <AnimatePresence>
                            {draftedPlayers.map((p, idx) => (
                                <motion.div 
                                    key={p.id} 
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="bg-white/[0.02] border border-white/5 rounded-lg p-2 flex items-center justify-between group hover:border-gold/20 transition-all shadow-sm"
                                >
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <span className="text-[8px] font-mono font-black text-gold/20 shrink-0">#{String(idx + 1).padStart(2, '0')}</span>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-header font-black text-[#2b1d12] italic uppercase tracking-tighter truncate leading-none">{p.position}</span>
                                            <span className="text-[7px] font-black text-gold/30 uppercase">{(p.cost/1000)}k</span>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleFirePlayer(p.id as number)} 
                                        className="w-6 h-6 rounded flex items-center justify-center text-[#7b6853] hover:bg-blood hover:text-[#2b1d12] transition-all"
                                    >
                                        <span className="material-symbols-outlined text-[12px]">close</span>
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {draftedPlayers.length === 0 && (
                            <div className="py-6 text-center border border-dashed border-white/5 rounded-xl opacity-10">
                                <p className="text-[7px] font-black uppercase tracking-widest italic leading-none">Esperando Reclutas</p>
                            </div>
                        )}
                    </div>

                    {/* 3. INCENTIVOS (Bottom Sticky area) */}
                    <div className="p-5 border-t border-[rgba(111,87,56,0.12)] space-y-3 blood-ui-light-card">
                        <h3 className="text-[8px] font-black text-[#7b6853] uppercase tracking-[0.4em] italic">Incentivos</h3>
                        <div className="grid grid-cols-1 gap-2">
                            {[
                                { name: 'Rerolls', cost: currentFaction.rerollCost, val: rerolls, set: setRerolls, icon: 'refresh' },
                                { name: 'Fans', cost: 10000, val: dedicatedFans, set: setDedicatedFans, min: 1, icon: 'groups' },
                            ].map(staff => (
                                <div key={staff.name} className="flex items-center justify-between group blood-ui-light-card p-2 rounded-lg border border-[rgba(111,87,56,0.10)]">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[#7b6853] text-[14px]">{(staff as any).icon}</span>
                                        <p className="text-[8px] font-black uppercase text-[#7b6853] italic tracking-widest">{staff.name}</p>
                                    </div>
                                    <div className="flex items-center gap-2 bg-white/5 rounded p-1">
                                        <button onClick={() => staff.set(Math.max(staff.min || 0, staff.val - 1))} className="w-5 h-5 rounded bg-white/5 hover:bg-white/10 text-[10px] flex items-center justify-center">-</button>
                                        <span className="text-[10px] font-mono font-black text-gold w-4 text-center italic">{staff.val}</span>
                                        <button onClick={() => staff.set(staff.val + 1)} disabled={remainingBudget < staff.cost} className={`w-5 h-5 rounded border border-gold/20 text-gold flex items-center justify-center transition-all ${remainingBudget < staff.cost ? 'opacity-10' : 'bg-gold/10 hover:bg-gold hover:text-black'}`}>+</button>
                                    </div>
                                </div>
                            ))}
                            <button 
                                onClick={() => setApothecary(!apothecary)} 
                                disabled={!apothecary && remainingBudget < 50000} 
                                className={`w-full py-2 rounded-lg text-[8px] font-black tracking-[0.1em] italic transition-all border ${
                                    apothecary 
                                    ? 'bg-gold text-black border-gold shadow-md' 
                                    : 'text-[#8d7863] bg-white/5 border-white/10 hover:border-gold/30 hover:text-gold'
                                }`}
                            >
                                {apothecary ? 'APOTICARIO ADQUIRIDO' : 'APOTICARIO (+50K)'}
                            </button>
                        </div>
                    </div>

                    {/* FINAL ACTION - COMPACT */}
                    <div className="p-5 border-t border-[rgba(111,87,56,0.12)] blood-ui-light-card">
                        <button 
                            disabled={!canFinalize || isSubmitting}
                            onClick={handleSubmit}
                            className={`w-full py-4 rounded-xl font-header font-black text-lg tracking-tighter uppercase italic flex items-center justify-center gap-3 transition-all duration-500 ${
                                canFinalize && !isSubmitting
                                ? 'blood-ui-button-primary hover:scale-[1.01] active:scale-95 shadow-lg shadow-gold/20' 
                                : 'bg-white/30 text-[#8d7863] border border-white/10 cursor-not-allowed'
                            }`}
                        >
                            <span className="material-symbols-outlined text-lg font-black">gavel</span>
                            {isSubmitting ? 'Sellando...' : 'Sellar Franquicia'}
                        </button>
                        <p className={`mt-3 text-center text-[9px] font-black uppercase tracking-[0.15em] ${canFinalize ? 'text-emerald-500' : 'text-[#8d7863]'}`}>
                            {canFinalize ? 'Plantilla lista para fundarse' : finalizeHints.join(' Â· ')}
                        </p>
                        {submitError && (
                            <p className="mt-2 text-center text-[10px] font-black uppercase tracking-[0.12em] text-blood">
                                {submitError}
                            </p>
                        )}
                    </div>
                </aside>
            </main>

            <AnimatePresence>
                {selectedSkill && <SkillModal skill={selectedSkill} onClose={() => setSelectedSkill(null)} />}
            </AnimatePresence>

            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .shimmer-text { background: linear-gradient(90deg, #CA8A04 0%, #ffe4a3 50%, #CA8A04 100%); background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent; animation: shimmer 4s infinite linear; }
                @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
            `}</style>
        </div>
    );
};

export default TeamCreator;


