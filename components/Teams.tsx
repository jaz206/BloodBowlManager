
import React, { useState } from 'react';
import { teamsData } from '../data/teams';
import { skillsData } from '../data/skills';
import type { Team, Skill } from '../types';
import SkillModal from './SkillModal';
import ImageModal from './ImageModal';

const TeamCard: React.FC<{ team: Team, onViewRoster: () => void, onViewImage: (e: React.MouseEvent) => void }> = ({ team, onViewRoster, onViewImage }) => {
  return (
    <div 
      onClick={onViewRoster}
      className="group bg-slate-800 rounded-lg shadow-lg border border-slate-700 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-amber-500/10 hover:border-slate-600 hover:-translate-y-1"
      role="button"
      tabIndex={0}
      onKeyPress={(e) => (e.key === 'Enter' || e.key === ' ') && onViewRoster()}
    >
      <div className="relative">
        <img 
          src={team.image} 
          alt={`Arte de ${team.name}`} 
          className="w-full h-40 object-cover object-center transition-transform duration-300 group-hover:scale-110" 
          onClick={onViewImage}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-800 via-slate-800/50 to-transparent"></div>
      </div>
      <div className="p-4 relative">
        <h3 className="text-lg font-bold text-amber-400 truncate group-hover:text-amber-300">{team.name}</h3>
        <div className="flex justify-between items-center text-xs text-slate-400 mt-1">
          <span>Tier: {team.tier}</span>
          <span>Reroll: {team.rerollCost / 1000}k</span>
        </div>
      </div>
    </div>
  );
};

const TeamModal: React.FC<{ team: Team, onSkillClick: (skillName: string) => void, onClose: () => void }> = ({ team, onSkillClick, onClose }) => {
    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in-fast"
            onClick={handleBackdropClick}
            role="dialog"
            aria-modal="true"
        >
            <div className="bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-w-6xl w-full transform animate-slide-in-up max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-slate-700">
                    <h2 className="text-xl sm:text-2xl font-semibold text-amber-400">{team.name}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                </div>
                <div className="p-4 sm:p-5 overflow-y-auto">
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-300 mb-4">
                        <p><span className='font-bold text-slate-400'>Coste Reroll:</span> {team.rerollCost.toLocaleString()} M.O.</p>
                        <p><span className='font-bold text-slate-400'>Rango:</span> {team.tier}</p>
                        <p><span className='font-bold text-slate-400'>Boticario:</span> {team.apothecary}</p>
                        <p className="w-full"><span className='font-bold text-slate-400'>Reglas especiales:</span> {team.specialRules}</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-slate-700 text-amber-300">
                                <tr>
                                    <th className="p-2">Cant.</th>
                                    <th className="p-2">Posición</th>
                                    <th className="p-2">Coste</th>
                                    <th className="p-2 text-center">MV</th><th className="p-2 text-center">FU</th><th className="p-2 text-center">AG</th><th className="p-2 text-center">PS</th><th className="p-2 text-center">AR</th>
                                    <th className="p-2">Habilidades y Rasgos</th>
                                    <th className="p-2">Primarias</th>
                                    <th className="p-2">Secundarias</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {team.roster.map(player => (
                                    <tr key={player.position} className="bg-slate-800/50">
                                        <td className="p-2">{player.qty}</td>
                                        <td className="p-2 font-semibold text-slate-200">{player.position}</td>
                                        <td className="p-2">{player.cost.toLocaleString()}</td>
                                        <td className="p-2 text-center">{player.stats.MV}</td><td className="p-2 text-center">{player.stats.FU}</td><td className="p-2 text-center">{player.stats.AG}</td><td className="p-2 text-center">{player.stats.PS}</td><td className="p-2 text-center">{player.stats.AR}</td>
                                        <td className="p-2 text-xs">
                                        {player.skills.split(', ').map((skill, index, arr) => {
                                            const cleanSkillName = skill.trim();
                                            if (cleanSkillName && cleanSkillName.toLowerCase() !== 'ninguna') {
                                                return (
                                                    <React.Fragment key={skill}>
                                                        <button onClick={() => onSkillClick(cleanSkillName)} className="text-sky-400 hover:text-sky-300 hover:underline">{cleanSkillName}</button>
                                                        {index < arr.length - 1 && ', '}
                                                    </React.Fragment>
                                                );
                                            }
                                            return cleanSkillName + (index < arr.length - 1 ? ', ' : '');
                                        })}
                                        </td>
                                        <td className="p-2 text-center font-mono">{player.primary}</td>
                                        <td className="p-2 text-center font-mono">{player.secondary}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
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
    );
};


const Teams: React.FC = () => {
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
    const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
    const [enlargedImage, setEnlargedImage] = useState<{src: string, alt: string} | null>(null);

    const handleSkillClick = (skillName: string) => {
        const cleanedName = skillName.split('(')[0].trim();
        const foundSkill = skillsData.find(s => s.name.toLowerCase() === cleanedName.toLowerCase());
        if (foundSkill) setSelectedSkill(foundSkill);
    };

    const handleImageClick = (e: React.MouseEvent, team: Team) => {
        e.stopPropagation();
        if(team.image) setEnlargedImage({src: team.image, alt: team.name});
    };

  return (
    <>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {teamsData.map((team) => (
            <TeamCard 
                key={team.name} 
                team={team}
                onViewRoster={() => setSelectedTeam(team)}
                onViewImage={(e) => handleImageClick(e, team)}
            />
        ))}
        </div>
        {selectedTeam && <TeamModal team={selectedTeam} onClose={() => setSelectedTeam(null)} onSkillClick={handleSkillClick} />}
        {selectedSkill && <SkillModal skill={selectedSkill} onClose={() => setSelectedSkill(null)} />}
        {enlargedImage && <ImageModal src={enlargedImage.src} alt={enlargedImage.alt} onClose={() => setEnlargedImage(null)} />}
    </>
  );
};

export default Teams;
