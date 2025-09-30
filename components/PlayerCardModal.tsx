

import React, { useState } from 'react';
import type { ManagedPlayer, Skill } from '../types';
import { skillsData } from '../data/skills';
import SkillModal from './SkillModal';

interface PlayerCardModalProps {
  player: ManagedPlayer;
  onClose: () => void;
}

const SkillButton: React.FC<{ skillName: string; onSkillClick: (name: string) => void }> = ({ skillName, onSkillClick }) => {
    const cleanSkillName = skillName.split('(')[0].trim();
    const hasDescription = skillsData.some(s => s.name.toLowerCase().startsWith(cleanSkillName.toLowerCase()));

    if (hasDescription) {
        return (
            <button 
                onClick={() => onSkillClick(cleanSkillName)} 
                className="text-sky-400 hover:text-sky-300 hover:underline focus:outline-none focus:ring-1 focus:ring-sky-300 rounded"
            >
                {skillName}
            </button>
        );
    }
    return <span>{skillName}</span>;
};

const PlayerCardModal: React.FC<PlayerCardModalProps> = ({ player, onClose }) => {
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSkillClick = (skillName: string) => {
    const foundSkill = skillsData.find(s => s.name.toLowerCase().startsWith(skillName.toLowerCase()));
    if (foundSkill) {
      setSelectedSkill(foundSkill);
    }
  };

  const allSkills = [...(player.skills ? player.skills.split(', ').filter(s => s.toLowerCase() !== 'ninguna') : []), ...player.gainedSkills];

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in-fast"
        onClick={handleBackdropClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby="player-card-modal-title"
      >
        <div className="bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-w-lg w-full transform animate-slide-in-up max-h-[90vh] flex flex-col">
          <div className="flex justify-between items-start p-4 border-b border-slate-700">
            <div>
              <h2 id="player-card-modal-title" className="text-xl font-bold text-amber-400">{player.customName}</h2>
              <p className="text-sm text-slate-400">
                {player.position}
                {player.isJourneyman && <span className="italic text-slate-500 ml-2">(Sustituto)</span>}
              </p>
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
          <div className="p-5 overflow-y-auto space-y-4">
            <div>
              <h3 className="font-semibold text-slate-300 mb-2">Estadísticas</h3>
              <div className="flex flex-wrap gap-x-4 gap-y-1 bg-slate-900/50 p-2 rounded-md text-slate-200 text-sm">
                <span className="font-mono">MV: {player.stats.MV}</span>
                <span className="font-mono">FU: {player.stats.FU}</span>
                <span className="font-mono">AG: {player.stats.AG}</span>
                <span className="font-mono">PS: {player.stats.PS}</span>
                <span className="font-mono">AR: {player.stats.AR}</span>
                <span className="font-bold text-amber-300 font-mono">PE: {player.spp}</span>
              </div>
            </div>
             <div>
              <h3 className="font-semibold text-slate-300 mb-2">Habilidades</h3>
              <p className="text-sm text-slate-300">
                {allSkills.length > 0 ? allSkills.map((skill, index) => (
                    <React.Fragment key={`${skill}-${index}`}>
                        <SkillButton skillName={skill} onSkillClick={handleSkillClick} />
                        {index < allSkills.length - 1 && ', '}
                    </React.Fragment>
                )) : 'Ninguna'}
              </p>
            </div>
            {player.lastingInjuries && player.lastingInjuries.length > 0 && (
                <div>
                    <h3 className="font-semibold text-red-400 mb-2">Lesiones Permanentes</h3>
                    <p className="text-sm text-red-400">{player.lastingInjuries.join(', ')}</p>
                </div>
            )}
          </div>
        </div>
        <style>{`
          @keyframes fade-in-fast { from { opacity: 0; } to { opacity: 1; } }
          @keyframes slide-in-up { from { transform: translateY(20px) scale(0.98); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
          .animate-fade-in-fast { animation: fade-in-fast 0.2s ease-out forwards; }
          .animate-slide-in-up { animation: slide-in-up 0.3s ease-out forwards; }
        `}</style>
      </div>
      {selectedSkill && <SkillModal skill={selectedSkill} onClose={() => setSelectedSkill(null)} />}
    </>
  );
};

export default PlayerCardModal;