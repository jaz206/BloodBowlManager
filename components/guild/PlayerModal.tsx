import React, { useState, useEffect, useMemo } from 'react';
import type { ManagedPlayer, Skill } from '../../types';
import SkillSelectorModal from '../oracle/SkillSelectorModal';

interface PlayerModalProps {
    player: ManagedPlayer;
    allSkills: Skill[];
    onSave: (player: ManagedPlayer) => void;
    onClose: () => void;
}

const normalizeLookupKey = (value?: string) =>
    String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();

const PlayerModal: React.FC<PlayerModalProps> = ({ player, allSkills, onSave, onClose }) => {
    const [editedPlayer, setEditedPlayer] = useState<ManagedPlayer>(player);
    const [isSkillSelectorOpen, setIsSkillSelectorOpen] = useState(false);

    useEffect(() => {
        setEditedPlayer(player);
    }, [player]);

    const resolvedSkills = useMemo(() => {
        const combined = Array.from(new Set([...(editedPlayer.skillKeys || []), ...(editedPlayer.gainedSkills || [])]));
        return combined.map((skillRef) => {
            const record = allSkills.find((skill) =>
                [skill.keyEN, skill.name_es, skill.name_en, skill.name].some(
                    (candidate) => normalizeLookupKey(candidate) === normalizeLookupKey(skillRef)
                )
            );
            return {
                key: record?.keyEN || skillRef,
                label: record?.name_es || record?.name_en || skillRef,
                isExtra: (editedPlayer.gainedSkills || []).includes(skillRef),
            };
        });
    }, [allSkills, editedPlayer.gainedSkills, editedPlayer.skillKeys]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === 'spp' || name === 'missNextGame') {
            setEditedPlayer({ ...editedPlayer, [name]: parseInt(value) || 0 });
        } else if (name === 'lastingInjuries') {
            setEditedPlayer({ ...editedPlayer, [name]: (value || '').split(',').map(s => s.trim()).filter(Boolean) });
        } else {
            setEditedPlayer({ ...editedPlayer, [name]: value });
        }
    };

    const handleSkillsSave = (newSkills: string[]) => {
        setEditedPlayer({ ...editedPlayer, gainedSkills: newSkills });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(editedPlayer);
    };

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <>
            <div
                className="fixed inset-0 bg-black/55 backdrop-blur-md flex items-center justify-center z-[220] p-4 animate-fade-in-fast"
                onClick={handleBackdropClick}
                role="dialog"
                aria-modal="true"
            >
                <div className="w-full max-w-4xl rounded-[2rem] border border-[rgba(111,87,56,0.14)] bg-[rgba(255,251,241,0.98)] shadow-[0_30px_80px_rgba(0,0,0,0.28)] overflow-hidden transform animate-slide-in-up">
                    <form onSubmit={handleSubmit}>
                        <div className="flex justify-between items-center p-8 border-b border-[rgba(111,87,56,0.12)] bg-[rgba(255,248,235,0.85)]">
                            <div>
                                <span className="block text-[10px] font-black uppercase tracking-[0.28em] text-[#8a7760] mb-2">Perfil de jugador</span>
                                <h2 className="text-3xl font-display font-black text-[#2b1d12] italic uppercase tracking-tighter">Editar jugador</h2>
                            </div>
                            <button type="button" onClick={onClose} className="text-[#8a7760] hover:text-[#2b1d12] p-2 rounded-xl hover:bg-white/60 transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-8 space-y-8 max-h-[78vh] overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_1fr] gap-8">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-bold text-[#8a7760] uppercase tracking-widest">Nombre del jugador</label>
                                        <input
                                            type="text"
                                            name="customName"
                                            value={editedPlayer.customName}
                                            onChange={handleChange}
                                            className="w-full bg-white border border-[#d7c39a] rounded-2xl py-4 px-4 text-[#2b1d12] font-display font-bold uppercase italic focus:border-premium-gold outline-none transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {[
                                            { label: 'MA', value: editedPlayer.stats.MV },
                                            { label: 'FU', value: editedPlayer.stats.FU },
                                            { label: 'AG', value: editedPlayer.stats.AG },
                                            { label: 'PA', value: editedPlayer.stats.PA },
                                            { label: 'AR', value: editedPlayer.stats.AR },
                                            { label: 'Coste', value: `${Math.round(editedPlayer.cost / 1000)}k` },
                                        ].map((item) => (
                                            <div key={item.label} className="rounded-2xl border border-[#e3cfaa] bg-[#fffaf1] p-4 text-center">
                                                <span className="block text-[9px] font-black uppercase tracking-[0.22em] text-[#8a7760] mb-1">{item.label}</span>
                                                <span className="text-xl font-display font-black italic text-[#2b1d12]">{item.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="rounded-[1.75rem] border border-[#e3cfaa] bg-[#fffaf1] p-5">
                                        <span className="block text-[10px] font-black uppercase tracking-[0.28em] text-[#8a7760] mb-4">Rol de plantilla</span>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setEditedPlayer({ ...editedPlayer, isBenched: false })}
                                                className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.22em] border transition-all ${!(editedPlayer.isBenched ?? true) ? 'bg-green-500/10 border-green-500/30 text-green-600' : 'bg-white border-[#d7c39a] text-[#8a7760] hover:border-gold/30 hover:text-gold'}`}
                                            >
                                                Titular
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setEditedPlayer({ ...editedPlayer, isBenched: true })}
                                                className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.22em] border transition-all ${(editedPlayer.isBenched ?? true) ? 'bg-[#2b1d12]/5 border-[#2b1d12]/15 text-[#6f5738]' : 'bg-white border-[#d7c39a] text-[#8a7760] hover:border-gold/30 hover:text-gold'}`}
                                            >
                                                Reserva
                                            </button>
                                        </div>
                                    </div>
                                    <div className="rounded-[1.75rem] border border-[#e3cfaa] bg-[#fffaf1] p-5">
                                        <span className="block text-[10px] font-black uppercase tracking-[0.28em] text-[#8a7760] mb-4">Progresión</span>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="block text-[10px] font-bold text-[#8a7760] uppercase tracking-widest">Puntos de estrella</label>
                                                <input
                                                    type="number"
                                                    name="spp"
                                                    value={editedPlayer.spp}
                                                    onChange={handleChange}
                                                    className="w-full bg-white border border-[#d7c39a] rounded-xl py-3 px-4 text-premium-gold font-mono font-bold focus:border-premium-gold outline-none transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-[10px] font-bold text-[#8a7760] uppercase tracking-widest">Partidos de sanción</label>
                                                <input
                                                    type="number"
                                                    name="missNextGame"
                                                    value={editedPlayer.missNextGame || 0}
                                                    onChange={handleChange}
                                                    className="w-full bg-white border border-[#d7c39a] rounded-xl py-3 px-4 text-blood-red font-mono font-bold focus:border-premium-gold outline-none transition-all"
                                                    min="0"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-8">
                                <div className="space-y-3">
                                    <label className="block text-[10px] font-bold text-[#8a7760] uppercase tracking-widest">Habilidades del jugador</label>
                                    <div className="p-4 bg-[#fffaf1] border border-[#e3cfaa] rounded-2xl min-h-[74px] flex flex-wrap gap-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
                                        {resolvedSkills.length > 0 ? (
                                            resolvedSkills.map((skill) => (
                                                <span
                                                    key={skill.key}
                                                    className={`text-[10px] font-display font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg shadow-sm border ${skill.isExtra ? 'bg-premium-gold/10 text-premium-gold border-premium-gold/20' : 'bg-[#2b1d12]/5 text-[#6f5738] border-[#d7c39a]'}`}
                                                >
                                                    {skill.label}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-[#8a7760] font-display font-bold uppercase tracking-widest text-[10px] self-center italic">Sin habilidades registradas</span>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setIsSkillSelectorOpen(true)}
                                        className="w-full bg-white border border-[#d7c39a] text-[#2b1d12] font-display font-bold uppercase tracking-[0.2em] text-[10px] py-4 px-4 rounded-2xl hover:border-premium-gold/40 hover:text-premium-gold transition-all shadow-sm"
                                    >
                                        Añadir o editar habilidades extra
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-bold text-[#8a7760] uppercase tracking-widest">Lesiones permanentes</label>
                                    <textarea
                                        name="lastingInjuries"
                                        value={editedPlayer.lastingInjuries.join(', ')}
                                        onChange={handleChange}
                                        placeholder="Ninguna"
                                        className="w-full bg-[#fffaf1] border border-[#d7c39a] rounded-2xl py-4 px-4 text-[#8f1d1d] font-display font-bold uppercase tracking-wider focus:border-blood-red outline-none transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] min-h-[140px]"
                                        rows={5}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="p-6 bg-[rgba(255,248,235,0.85)] border-t border-[rgba(111,87,56,0.12)] flex justify-end">
                            <button type="submit" className="w-full sm:w-auto bg-premium-gold text-black font-display font-black uppercase tracking-widest text-xs py-4 px-10 rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-premium-gold/20">
                                Guardar cambios
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            {isSkillSelectorOpen && (
                <SkillSelectorModal
                    allSkills={allSkills}
                    selectedSkills={editedPlayer.gainedSkills}
                    onSave={handleSkillsSave}
                    onClose={() => setIsSkillSelectorOpen(false)}
                />
            )}
        </>
    );
};

export default PlayerModal;
