import React, { useState } from 'react';
import type { ManagedPlayer, AdvancementType, Advancement, Skill } from '../../types';
import { skillsData } from '../../data/skills';

interface PlayerAdvancementModalProps {
    player: ManagedPlayer;
    isOpen: boolean;
    onClose: () => void;
    onAdvance: (updatedPlayer: ManagedPlayer) => void;
}

const ADVANCEMENT_COSTS: Record<number, Record<AdvancementType, number>> = {
    1: { RandomPrimary: 3, ChosenPrimary: 6, RandomSecondary: 6, ChosenSecondary: 12, Characteristic: 18 },
    2: { RandomPrimary: 4, ChosenPrimary: 8, RandomSecondary: 8, ChosenSecondary: 14, Characteristic: 20 },
    3: { RandomPrimary: 6, ChosenPrimary: 12, RandomSecondary: 12, ChosenSecondary: 18, Characteristic: 24 },
    4: { RandomPrimary: 8, ChosenPrimary: 16, RandomSecondary: 16, ChosenSecondary: 22, Characteristic: 28 },
    5: { RandomPrimary: 10, ChosenPrimary: 20, RandomSecondary: 20, ChosenSecondary: 26, Characteristic: 32 },
    6: { RandomPrimary: 15, ChosenPrimary: 30, RandomSecondary: 30, ChosenSecondary: 40, Characteristic: 50 },
};

const CATEGORY_MAP: Record<string, string> = {
    'G': 'General',
    'A': 'Agility',
    'S': 'Strength',
    'P': 'Passing',
    'M': 'Mutation'
};

const getAvailableSkillCategories = (categoriesString: string): string[] => {
    return categoriesString.split('').map(char => CATEGORY_MAP[char]).filter(Boolean);
};

export const PlayerAdvancementModal: React.FC<PlayerAdvancementModalProps> = ({ player, isOpen, onClose, onAdvance }) => {
    const [step, setStep] = useState<'TYPE' | 'SKILL_SELECT' | 'CHARACTERISTIC_ROLL' | 'CHARACTERISTIC_SELECT'>('TYPE');
    const [selectedType, setSelectedType] = useState<AdvancementType | null>(null);
    const [randomSkill, setRandomSkill] = useState<string | null>(null);
    const [charRoll, setCharRoll] = useState<number | null>(null);

    if (!isOpen) return null;

    const currentAdvancementCount = (player.advancements?.length || 0) + 1;
    const costs = ADVANCEMENT_COSTS[currentAdvancementCount] || ADVANCEMENT_COSTS[6];

    const handleTypeSelect = (type: AdvancementType) => {
        if (player.spp < costs[type]) return;

        setSelectedType(type);
        if (type === 'RandomPrimary' || type === 'RandomSecondary') {
            const categories = getAvailableSkillCategories(type === 'RandomPrimary' ? player.primary : player.secondary);
            const availableSkills = skillsData.filter(h =>
                categories.includes(h.category) &&
                !player.skills.includes(h.name) &&
                !player.gainedSkills.includes(h.name)
            );
            if (availableSkills.length > 0) {
                const random = availableSkills[Math.floor(Math.random() * availableSkills.length)];
                setRandomSkill(random.name);
                setStep('SKILL_SELECT');
            }
        } else if (type === 'ChosenPrimary' || type === 'ChosenSecondary') {
            setStep('SKILL_SELECT');
        } else if (type === 'Characteristic') {
            setStep('CHARACTERISTIC_ROLL');
        }
    };

    const confirmSkill = (skillName: string) => {
        const newAdvancement: Advancement = {
            type: selectedType!,
            sppCost: costs[selectedType!],
            skillName
        };

        const updatedPlayer: ManagedPlayer = {
            ...player,
            spp: player.spp - costs[selectedType!],
            gainedSkills: [...player.gainedSkills, skillName],
            advancements: [...(player.advancements || []), newAdvancement]
        };

        onAdvance(updatedPlayer);
        resetAndClose();
    };

    const handleCharRoll = () => {
        const roll = (Math.floor(Math.random() * 6) + 1) + (Math.floor(Math.random() * 6) + 1);
        setCharRoll(roll);
        setStep('CHARACTERISTIC_SELECT');
    };

    const confirmCharacteristic = (charName: 'MV' | 'FU' | 'AG' | 'PS' | 'AR') => {
        const newStats = { ...player.stats };

        if (charName === 'MV') {
            newStats.MV = Math.min(9, player.stats.MV + 1);
        } else if (charName === 'FU') {
            const currentFu = parseInt(player.stats.FU);
            newStats.FU = Math.min(8, currentFu + 1).toString();
        } else if (charName === 'AG') {
            const currentAg = parseInt(player.stats.AG.replace('+', ''));
            newStats.AG = `${Math.max(1, currentAg - 1)}+`;
        } else if (charName === 'PS') {
            if (player.stats.PS === '-') {
                // Cannot improve PS if it's - (normally)
            } else {
                const currentPs = parseInt(player.stats.PS.replace('+', ''));
                newStats.PS = `${Math.max(1, currentPs - 1)}+`;
            }
        } else if (charName === 'AR') {
            const currentAr = parseInt(player.stats.AR.replace('+', ''));
            newStats.AR = `${Math.min(11, currentAr + 1)}+`;
        }

        const newAdvancement: Advancement = {
            type: 'Characteristic',
            sppCost: costs.Characteristic,
            characteristicName: charName
        };

        const updatedPlayer: ManagedPlayer = {
            ...player,
            spp: player.spp - costs.Characteristic,
            stats: newStats,
            advancements: [...(player.advancements || []), newAdvancement]
        };

        onAdvance(updatedPlayer);
        resetAndClose();
    };

    const resetAndClose = () => {
        setStep('TYPE');
        setSelectedType(null);
        setRandomSkill(null);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="glass-panel w-full max-w-lg border-white/10 overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="bg-gradient-to-r from-premium-gold/20 to-transparent p-6 border-b border-white/5">
                    <h3 className="text-2xl font-display font-black text-white italic tracking-tighter uppercase leading-none">
                        Mejora de Jugador <span className="text-premium-gold font-normal not-italic ml-2">#{currentAdvancementCount}</span>
                    </h3>
                    <p className="text-slate-400 font-display font-bold uppercase tracking-widest text-[10px] mt-2 italic">{player.customName} ({player.position})</p>
                </div>

                <div className="p-6">
                    {step === 'TYPE' && (
                        <div className="space-y-4">
                            <p className="text-slate-300 text-xs font-display mb-4">Elige el tipo de avance para gastar los PE acumulados ({player.spp} PE disponibles):</p>
                            <div className="grid grid-cols-1 gap-3">
                                <AdvancementOption
                                    title="Habilidad Primaria Aleatoria"
                                    cost={costs.RandomPrimary}
                                    available={player.spp >= costs.RandomPrimary}
                                    onClick={() => handleTypeSelect('RandomPrimary')}
                                />
                                <AdvancementOption
                                    title="Habilidad Primaria Elegida"
                                    cost={costs.ChosenPrimary}
                                    available={player.spp >= costs.ChosenPrimary}
                                    onClick={() => handleTypeSelect('ChosenPrimary')}
                                />
                                <AdvancementOption
                                    title="Habilidad Secundaria Aleatoria"
                                    cost={costs.RandomSecondary}
                                    available={player.spp >= costs.RandomSecondary}
                                    onClick={() => handleTypeSelect('RandomSecondary')}
                                />
                                <AdvancementOption
                                    title="Habilidad Secundaria Elegida"
                                    cost={costs.ChosenSecondary}
                                    available={player.spp >= costs.ChosenSecondary}
                                    onClick={() => handleTypeSelect('ChosenSecondary')}
                                />
                                <AdvancementOption
                                    title="Mejora de Característica"
                                    cost={costs.Characteristic}
                                    available={player.spp >= costs.Characteristic}
                                    onClick={() => handleTypeSelect('Characteristic')}
                                />
                            </div>
                        </div>
                    )}

                    {step === 'SKILL_SELECT' && (
                        <div>
                            {randomSkill ? (
                                <div className="text-center space-y-6">
                                    <p className="text-slate-300 text-sm">Nuffle ha hablado. La habilidad obtenida es:</p>
                                    <div className="text-4xl font-display font-black text-premium-gold uppercase tracking-tighter italic animate-bounce">
                                        {randomSkill}
                                    </div>
                                    <button
                                        onClick={() => confirmSkill(randomSkill)}
                                        className="w-full bg-premium-gold text-black font-display font-black uppercase tracking-widest py-4 rounded-xl shadow-2xl hover:bg-white transition-premium"
                                    >
                                        Aceptar Mejora
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <p className="text-slate-300 text-xs font-display mb-2">Elige una habilidad de las categorías disponibles:</p>
                                    <div className="max-h-60 overflow-y-auto pr-2 space-y-1">
                                        {skillsData
                                            .filter(s => {
                                                const categories = getAvailableSkillCategories(selectedType === 'ChosenPrimary' ? player.primary : player.secondary);
                                                return categories.includes(s.category) && !player.skills.includes(s.name) && !player.gainedSkills.includes(s.name);
                                            })
                                            .map(skill => (
                                                <button
                                                    key={skill.name}
                                                    onClick={() => confirmSkill(skill.name)}
                                                    className="w-full text-left p-3 rounded-lg bg-white/5 border border-white/5 hover:border-premium-gold/50 hover:bg-premium-gold/5 transition-premium group"
                                                >
                                                    <div className="font-display font-bold text-white group-hover:text-premium-gold">{skill.name}</div>
                                                    <div className="text-[10px] text-slate-500 line-clamp-1 italic opacity-70">{skill.desc_es || skill.description}</div>
                                                </button>
                                            ))
                                        }
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {step === 'CHARACTERISTIC_ROLL' && (
                        <div className="text-center space-y-8 py-4">
                            <div className="w-24 h-24 mx-auto bg-premium-gold/10 rounded-full flex items-center justify-center border-2 border-premium-gold/20 animate-pulse">
                                <span className="material-symbols-outlined text-premium-gold text-5xl">casino</span>
                            </div>
                            <div className="space-y-2">
                                <p className="text-slate-300 text-sm">Lanza 2D6 para determinar las opciones de mejora de característica.</p>
                                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Respetando las limitaciones de Nuffle</p>
                            </div>
                            <button
                                onClick={handleCharRoll}
                                className="w-full bg-premium-gold text-black font-display font-black uppercase tracking-widest py-4 rounded-xl shadow-[0_10px_30px_rgba(202,138,4,0.3)] hover:scale-105 transition-premium"
                            >
                                Lanzar Dados
                            </button>
                        </div>
                    )}

                    {step === 'CHARACTERISTIC_SELECT' && (
                        <div className="space-y-6">
                            <div className="flex justify-center items-center gap-4">
                                <div className="text-6xl font-display font-black text-white italic drop-shadow-xl animate-bounce-in">{charRoll}</div>
                                <div className="h-10 w-px bg-white/10"></div>
                                <div className="text-left">
                                    <p className="text-[10px] text-premium-gold uppercase font-black tracking-widest">Resultado</p>
                                    <p className="text-xs text-slate-400 font-bold uppercase italic">Tabla de Mejora</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-2">
                                <CharOption
                                    name="Mejorar Movimiento (+1 MV)"
                                    available={true} // 2-12
                                    onClick={() => confirmCharacteristic('MV')}
                                    description="Aumenta el MA hasta un máximo de 9."
                                />
                                <CharOption
                                    name="Mejorar Armadura (+1 AR)"
                                    available={true} // 2-12
                                    onClick={() => confirmCharacteristic('AR')}
                                    description="Aumenta el AV hasta un máximo de 11+."
                                />
                                <CharOption
                                    name="Mejorar Pase (+1 PS)"
                                    available={charRoll! >= 8 && player.stats.PS !== '-'}
                                    onClick={() => confirmCharacteristic('PS')}
                                    description="Reduce la dificultad de Pase (mínimo 1+)."
                                />
                                <CharOption
                                    name="Mejorar Agilidad (+1 AG)"
                                    available={charRoll! >= 10}
                                    onClick={() => confirmCharacteristic('AG')}
                                    description="Reduce la dificultad de Agilidad (mínimo 1+)."
                                />
                                <CharOption
                                    name="Mejorar Fuerza (+1 FU)"
                                    available={charRoll! === 12}
                                    onClick={() => confirmCharacteristic('FU')}
                                    description="Aumenta la Fuerza hasta un máximo de 8."
                                />
                            </div>

                            <p className="text-[10px] text-slate-500 italic text-center">Nota: Si no deseas mejorar una característica, puedes elegir una Habilidad Primaria (si el resultado es 2-11) o Secundaria (si es 12) según las reglas oficiales de BB2020.</p>
                        </div>
                    )}
                </div>

                <div className="p-6 bg-black/20 border-t border-white/5 flex justify-end">
                    <button
                        onClick={resetAndClose}
                        className="text-slate-400 font-display font-bold uppercase tracking-widest text-xs hover:text-white transition-premium"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
};

const CharOption: React.FC<{ name: string; available: boolean; onClick: () => void; description: string }> = ({ name, available, onClick, description }) => (
    <button
        disabled={!available}
        onClick={onClick}
        className={`w-full text-left p-3 rounded-lg border transition-premium ${available
            ? 'bg-white/5 border-white/10 hover:border-premium-gold/50 hover:bg-premium-gold/5 group'
            : 'bg-black/20 border-white/5 opacity-40 cursor-not-allowed'
            }`}
    >
        <div className="flex justify-between items-center mb-1">
            <span className={`font-display font-bold uppercase tracking-tight ${available ? 'text-white group-hover:text-premium-gold' : 'text-slate-600'}`}>
                {name}
            </span>
            {available && <span className="material-symbols-outlined text-sm text-premium-gold opacity-0 group-hover:opacity-100 transition-opacity">add_circle</span>}
        </div>
        <p className="text-[10px] text-slate-500">{description}</p>
    </button>
);

const AdvancementOption: React.FC<{ title: string; cost: number; available: boolean; onClick: () => void }> = ({ title, cost, available, onClick }) => (
    <button
        disabled={!available}
        onClick={onClick}
        className={`w-full flex justify-between items-center p-4 rounded-xl border transition-premium ${available
            ? 'bg-white/5 border-white/10 hover:border-premium-gold/50 hover:bg-premium-gold/5 group'
            : 'bg-black/20 border-white/5 opacity-40 cursor-not-allowed'
            }`}
    >
        <span className={`font-display font-black uppercase tracking-tight italic ${available ? 'text-white group-hover:text-premium-gold' : 'text-slate-600'}`}>
            {title}
        </span>
        <span className={`font-mono font-bold px-3 py-1 rounded-full text-xs ${available ? 'bg-premium-gold/20 text-premium-gold' : 'bg-slate-800 text-slate-600'}`}>
            {cost} PE
        </span>
    </button>
);
