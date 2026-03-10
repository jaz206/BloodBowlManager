

import React, { useState, useEffect } from 'react';
import type { ManagedPlayer, Skill } from '../../types';
import SkillSelectorModal from '../oracle/SkillSelectorModal';

interface PlayerModalProps {
    player: ManagedPlayer;
    allSkills: Skill[];
    onSave: (player: ManagedPlayer) => void;
    onClose: () => void;
}

const PlayerModal: React.FC<PlayerModalProps> = ({ player, allSkills, onSave, onClose }) => {
    const [editedPlayer, setEditedPlayer] = useState<ManagedPlayer>(player);
    const [isSkillSelectorOpen, setIsSkillSelectorOpen] = useState(false);

    useEffect(() => {
        setEditedPlayer(player);
    }, [player]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === "spp" || name === "missNextGame") {
            setEditedPlayer({ ...editedPlayer, [name]: parseInt(value) || 0 });
        } else if (name === "lastingInjuries") {
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
                className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in-fast"
                onClick={handleBackdropClick}
                role="dialog"
                aria-modal="true"
            >
                <div className="glass-panel max-w-lg w-full transform animate-slide-in-up border-white/10 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                    <form onSubmit={handleSubmit}>
                        <div className="flex justify-between items-center p-6 border-b border-white/5 bg-white/5">
                            <h2 className="text-2xl font-display font-black text-white italic uppercase tracking-tighter">Editar Jugador</h2>
                            <button type="button" onClick={onClose} className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-premium">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-display font-bold text-slate-500 uppercase tracking-widest">Nombre del Jugador</label>
                                <input
                                    type="text"
                                    name="customName"
                                    value={editedPlayer.customName}
                                    onChange={handleChange}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white font-display font-bold uppercase italic focus:border-premium-gold outline-none transition-premium shadow-inner"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-display font-bold text-slate-500 uppercase tracking-widest">Puntos de Estrella (PE)</label>
                                    <input
                                        type="number"
                                        name="spp"
                                        value={editedPlayer.spp}
                                        onChange={handleChange}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-premium-gold font-mono font-bold focus:border-premium-gold outline-none transition-premium"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-display font-bold text-slate-500 uppercase tracking-widest">Partidos de Sanción</label>
                                    <input
                                        type="number"
                                        name="missNextGame"
                                        value={editedPlayer.missNextGame || 0}
                                        onChange={handleChange}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-blood-red font-mono font-bold focus:border-premium-gold outline-none transition-premium"
                                        min="0"
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="block text-[10px] font-display font-bold text-slate-500 uppercase tracking-widest">Habilidades Adquiridas</label>
                                <div className="p-4 bg-black/40 border border-white/5 rounded-xl min-h-[60px] flex flex-wrap gap-2 shadow-inner">
                                    {editedPlayer.gainedSkills.length > 0 ? (
                                        editedPlayer.gainedSkills.map(skill => (
                                            <span key={skill} className="bg-premium-gold/10 text-premium-gold border border-premium-gold/20 text-[10px] font-display font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg shadow-lg">{skill}</span>
                                        ))
                                    ) : (
                                        <span className="text-slate-600 font-display font-bold uppercase tracking-widest text-[10px] self-center italic">Ninguna habilidad extra</span>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsSkillSelectorOpen(true)}
                                    className="w-full bg-white/5 border border-white/10 text-white font-display font-bold uppercase tracking-[0.2em] text-[10px] py-4 px-4 rounded-xl hover:bg-white/10 transition-premium shadow-xl group"
                                >
                                    <span className="group-hover:text-premium-gold transition-colors">Añadir/Editar Habilidades</span>
                                </button>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-[10px] font-display font-bold text-slate-500 uppercase tracking-widest">Lesiones Permanentes</label>
                                <textarea
                                    name="lastingInjuries"
                                    value={editedPlayer.lastingInjuries.join(', ')}
                                    onChange={handleChange}
                                    placeholder="Ninguna"
                                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-blood-red font-display font-bold uppercase tracking-wider focus:border-blood-red outline-none transition-premium shadow-inner min-h-[80px]"
                                    rows={2}
                                />
                            </div>
                        </div>
                        <div className="p-6 bg-black/20 border-t border-white/5 flex justify-end">
                            <button type="submit" className="w-full sm:w-auto bg-premium-gold text-black font-display font-black uppercase tracking-widest text-xs py-4 px-10 rounded-xl transition-premium hover:scale-105 active:scale-95 shadow-2xl shadow-premium-gold/20">
                                Guardar Cambios
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
