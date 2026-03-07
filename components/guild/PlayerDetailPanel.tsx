import React, { useState } from 'react';
import type { BoardToken, Skill } from '../types';
import { skillsData } from '../data/skills';
import SkillModal from './SkillModal';

interface PlayerDetailPanelProps {
  playerToken: BoardToken;
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


const PlayerDetailPanel: React.FC<PlayerDetailPanelProps> = ({ playerToken, onClose }) => {
    const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
    
    const player = playerToken.playerData;

    if (!player) return null;

    const handleSkillClick = (skillName: string) => {
        const foundSkill = skillsData.find(s => s.name.toLowerCase().startsWith(skillName.toLowerCase()));
        if (foundSkill) {
          setSelectedSkill(foundSkill);
        }
    };
    
    const allSkills = [...(player.skills ? player.skills.split(', ').filter(s => s.toLowerCase() !== 'ninguna') : []), ...player.gainedSkills];

    const teamColor = playerToken.teamId === 'home' ? 'border-sky-500' : 'border-red-500';

    return (
        <>
            <div
                className={`fixed top-0 right-0 bottom-0 bg-slate-800/80 backdrop-blur-sm shadow-2xl border-l-2 ${teamColor} w-80 z-40 transform transition-transform duration-300 ease-in-out`}
                role="dialog"
                aria-modal="true"
            >
                <div className="h-full flex flex-col">
                    <div className={`flex justify-between items-start p-4 border-b-2 ${teamColor}`}>
                        <div>
                            <h2 className="text-xl font-bold text-amber-400">{player.customName}</h2>
                            <p className="text-sm text-slate-400">{player.position}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-white transition-colors p-1 rounded-full"
                            aria-label="Cerrar panel"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div className="p-5 overflow-y-auto space-y-4 flex-grow">
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
                            <h3 className="font-semibold text-slate-300 mb-2">Estado en Campo</h3>
                            <p className={`text-sm font-bold ${playerToken.isDown ? 'text-orange-400' : 'text-green-400'}`}>
                                {playerToken.isDown ? 'Derribado' : 'En Pie'}
                            </p>
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
            </div>
            {selectedSkill && <SkillModal skill={selectedSkill} onClose={() => setSelectedSkill(null)} />}
             <style>{`
                @keyframes slide-in-right { from { transform: translateX(100%); } to { transform: translateX(0); } }
                .animate-slide-in-right { animation: slide-in-right 0.3s ease-out forwards; }
            `}</style>
        </>
    );
};

export default PlayerDetailPanel;
