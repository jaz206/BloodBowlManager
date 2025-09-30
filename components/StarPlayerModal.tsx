
import React, { useState } from 'react';
import type { StarPlayer, Skill } from '../types';
import { skillsData } from '../data/skills';
import SkillModal from './SkillModal';

interface StarPlayerModalProps {
  player: StarPlayer;
  onClose: () => void;
}

const StarPlayerModal: React.FC<StarPlayerModalProps> = ({ player, onClose }) => {
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSkillClick = (skillName: string) => {
    const cleanedName = skillName.split('(')[0].trim();
    const foundSkill = skillsData.find(s => s.name.toLowerCase() === cleanedName.toLowerCase());
    if (foundSkill) {
      setSelectedSkill(foundSkill);
    } else {
      console.warn(`Skill not found: ${cleanedName}`);
    }
  };

  const handleCloseSkillModal = () => {
    setSelectedSkill(null);
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in-fast"
        onClick={handleBackdropClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby="star-player-modal-title"
      >
        <div className="bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-w-lg w-full transform animate-slide-in-up max-h-[90vh] flex flex-col">
          <div className="flex justify-between items-start p-4 border-b border-slate-700">
            <div>
              <h2 id="star-player-modal-title" className="text-xl font-bold text-amber-400">{player.name}</h2>
              <p className="text-sm text-green-400 font-semibold">{player.cost.toLocaleString()} M.O.</p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Cerrar modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-5 overflow-y-auto">
            <div className="mb-4">
              <h3 className="font-semibold text-slate-300 mb-2">Estadísticas</h3>
              <div className="flex flex-wrap gap-x-4 gap-y-1 bg-slate-900/50 p-2 rounded-md text-slate-200 text-sm">
                <span className="font-mono">MV: {player.stats.MV}</span>
                <span className="font-mono">FU: {player.stats.FU}</span>
                <span className="font-mono">AG: {player.stats.AG}</span>
                <span className="font-mono">PS: {player.stats.PS}</span>
                <span className="font-mono">AR: {player.stats.AR}</span>
              </div>
            </div>
            <div className="mb-4">
              <h3 className="font-semibold text-slate-300 mb-2">Habilidades</h3>
              <p className="text-sm text-slate-300">
                {player.skills.split(', ').map((skill, index, arr) => (
                  <React.Fragment key={skill}>
                    <button
                      onClick={() => handleSkillClick(skill)}
                      className="text-sky-400 hover:text-sky-300 hover:underline focus:outline-none focus:ring-1 focus:ring-sky-300 rounded"
                    >
                      {skill.trim()}
                    </button>
                    {index < arr.length - 1 && ', '}
                  </React.Fragment>
                ))}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-300 mb-2">Reglas Especiales</h3>
              <p className="text-sm text-slate-300 italic">{player.specialRules}</p>
            </div>
          </div>
        </div>
        <style>{`
          @keyframes fade-in-fast { from { opacity: 0; } to { opacity: 1; } }
          @keyframes slide-in-up { from { transform: translateY(20px) scale(0.98); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
          .animate-fade-in-fast { animation: fade-in-fast 0.2s ease-out forwards; }
          .animate-slide-in-up { animation: slide-in-up 0.3s ease-out forwards; }
        `}</style>
      </div>
      {selectedSkill && <SkillModal skill={selectedSkill} onClose={handleCloseSkillModal} />}
    </>
  );
};

export default StarPlayerModal;