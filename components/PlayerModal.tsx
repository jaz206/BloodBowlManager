
import React, { useState, useEffect } from 'react';
import type { ManagedPlayer, Skill } from '../types';
import SkillSelectorModal from './SkillSelectorModal';

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
        if (name === "spp") {
            setEditedPlayer({ ...editedPlayer, [name]: parseInt(value) || 0 });
        } else if (name === "lastingInjuries") {
            setEditedPlayer({ ...editedPlayer, [name]: value.split(',').map(s => s.trim()).filter(Boolean) });
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
                className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in-fast" 
                onClick={handleBackdropClick}
                role="dialog"
                aria-modal="true"
            >
                <div className="bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-w-lg w-full transform animate-slide-in-up">
                    <form onSubmit={handleSubmit}>
                        <div className="flex justify-between items-center p-4 border-b border-slate-700">
                            <h2 className="text-xl font-bold text-amber-400">Editar Jugador</h2>
                            <button type="button" onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-full">
                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-5 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Nombre del Jugador</label>
                                <input
                                    type="text"
                                    name="customName"
                                    value={editedPlayer.customName}
                                    onChange={handleChange}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Puntos de Estrella (PE)</label>
                                <input
                                    type="number"
                                    name="spp"
                                    value={editedPlayer.spp}
                                    onChange={handleChange}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white"
                                />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Habilidades Adquiridas</label>
                                <div className="p-3 bg-slate-900/50 rounded-md min-h-[40px] flex flex-wrap gap-2 mb-3">
                                    {editedPlayer.gainedSkills.length > 0 ? (
                                        editedPlayer.gainedSkills.map(skill => (
                                            <span key={skill} className="bg-sky-700 text-white text-xs font-semibold px-2.5 py-1 rounded-full">{skill}</span>
                                        ))
                                    ) : (
                                        <span className="text-slate-400 text-sm">Ninguna</span>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsSkillSelectorOpen(true)}
                                    className="w-full bg-teal-600 text-white font-bold py-2 px-4 rounded-md shadow-md hover:bg-teal-500 transition-colors"
                                >
                                    Añadir/Editar Habilidades
                                </button>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Lesiones Permanentes (separadas por coma)</label>
                                <textarea
                                    name="lastingInjuries"
                                    value={editedPlayer.lastingInjuries.join(', ')}
                                    onChange={handleChange}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white"
                                    rows={2}
                                />
                            </div>
                        </div>
                        <div className="p-4 bg-slate-900/50 border-t border-slate-700 flex justify-end">
                            <button type="submit" className="bg-amber-500 text-slate-900 font-bold py-2 px-6 rounded-md shadow-md hover:bg-amber-400 transition-colors">
                                Guardar Cambios
                            </button>
                        </div>
                    </form>
                </div>
                 <style>{`
                    @keyframes fade-in-fast { from { opacity: 0; } to { opacity: 1; } }
                    @keyframes slide-in-up { from { transform: translateY(20px) scale(0.98); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
                    .animate-fade-in-fast { animation: fade-in-fast 0.2s ease-out forwards; }
                    .animate-slide-in-up { animation: slide-in-up 0.3s ease-out forwards; }
                `}</style>
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