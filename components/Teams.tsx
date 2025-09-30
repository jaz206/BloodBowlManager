
import React, { useState } from 'react';
import { teamsData } from '../data/teams';
import { skillsData } from '../data/skills';
import type { Team, Skill } from '../types';
import ChevronDownIcon from './icons/ChevronDownIcon';
import ChevronUpIcon from './icons/ChevronUpIcon';
import SkillModal from './SkillModal';

const TeamCard: React.FC<{ team: Team, isOpen: boolean, onToggle: () => void, onSkillClick: (skillName: string) => void }> = ({ team, isOpen, onToggle, onSkillClick }) => {
  return (
    <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex justify-between items-center p-4 sm:p-5 text-left bg-slate-800 hover:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50 transition-colors duration-200"
        aria-expanded={isOpen}
      >
        <h2 className="text-xl sm:text-2xl font-semibold text-amber-400">{team.name}</h2>
        {isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
      </button>
      <div
        className={`transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        } overflow-hidden`}
      >
        <div className="p-4 sm:p-5 border-t border-slate-700">
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-300 mb-4">
                <p><span className='font-bold text-slate-400'>Coste Reroll:</span> {team.rerollCost.toLocaleString()} M.O.</p>
                <p><span className='font-bold text-slate-400'>Rango:</span> {team.tier}</p>
                <p><span className='font-bold text-slate-400'>Boticario:</span> {team.apothecary}</p>
                <p className="w-full"><span className='font-bold text-slate-400'>Reglas especiales:</span> {team.specialRules}</p>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-700 text-amber-300">
                        <tr>
                            <th className="p-2">Cant.</th>
                            <th className="p-2">Posición</th>
                            <th className="p-2">Coste</th>
                            <th className="p-2 text-center">MV</th>
                            <th className="p-2 text-center">FU</th>
                            <th className="p-2 text-center">AG</th>
                            <th className="p-2 text-center">PS</th>
                            <th className="p-2 text-center">AR</th>
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
                                <td className="p-2 text-center">{player.stats.MV}</td>
                                <td className="p-2 text-center">{player.stats.FU}</td>
                                <td className="p-2 text-center">{player.stats.AG}</td>
                                <td className="p-2 text-center">{player.stats.PS}</td>
                                <td className="p-2 text-center">{player.stats.AR}</td>
                                <td className="p-2 text-xs">
                                  {player.skills.split(', ').map((skill, index, arr) => {
                                      const cleanSkillName = skill.trim();
                                      if (cleanSkillName && cleanSkillName.toLowerCase() !== 'ninguna') {
                                          return (
                                              <React.Fragment key={skill}>
                                                  <button 
                                                      onClick={() => onSkillClick(cleanSkillName)} 
                                                      className="text-sky-400 hover:text-sky-300 hover:underline focus:outline-none focus:ring-1 focus:ring-sky-300 rounded"
                                                  >
                                                      {cleanSkillName}
                                                  </button>
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
    </div>
  );
};

const Teams: React.FC = () => {
    const [expandedTeam, setExpandedTeam] = useState<string | null>(null);
    const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

    const handleToggle = (teamName: string) => {
        setExpandedTeam(prev => (prev === teamName ? null : teamName));
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
    
    const handleCloseModal = () => {
        setSelectedSkill(null);
    };

  return (
    <div className="space-y-4">
      {teamsData.map((team) => (
        <TeamCard 
            key={team.name} 
            team={team}
            isOpen={expandedTeam === team.name}
            onToggle={() => handleToggle(team.name)}
            onSkillClick={handleSkillClick}
        />
      ))}
      {selectedSkill && <SkillModal skill={selectedSkill} onClose={handleCloseModal} />}
    </div>
  );
};

export default Teams;