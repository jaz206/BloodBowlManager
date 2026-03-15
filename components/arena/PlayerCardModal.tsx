

import React, { useState } from 'react';
import type { ManagedPlayer, Skill } from '../../types';
import { skillsData } from '../../data/skills';
import SkillModal from '../oracle/SkillModal';

interface PlayerCardModalProps {
  player: ManagedPlayer;
  onClose: () => void;
  isBallCarrier?: boolean;
  onBallToggle?: () => void;
  onConditionToggle?: (condition: 'isDistracted' | 'hasIndigestion') => void;
}

const SkillButton: React.FC<{ skillName: string; onSkillClick: (name: string) => void }> = ({ skillName, onSkillClick }) => {
  const cleanSkillName = skillName.split('(')[0].trim();
  const hasDescription = skillsData.some(s => s.name.toLowerCase().startsWith(cleanSkillName.toLowerCase()));

  if (hasDescription) {
    return (
      <button
        onClick={() => onSkillClick(cleanSkillName)}
        className="bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[10px] font-display font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg hover:bg-sky-500/20 hover:border-sky-500/40 transition-premium"
      >
        {skillName}
      </button>
    );
  }
  return <span className="bg-white/5 border border-white/10 text-white/40 text-[10px] font-display font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg">{skillName}</span>;
};

const PlayerCardModal: React.FC<PlayerCardModalProps> = ({ player, onClose, isBallCarrier, onBallToggle, onConditionToggle }) => {
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
        className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in-fast"
        onClick={handleBackdropClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby="player-card-modal-title"
      >
        <div className="glass-panel max-w-lg w-full transform animate-slide-in-up border-white/10 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] max-h-[95vh] flex flex-col">
          <div className="flex justify-between items-start p-6 border-b border-white/5 bg-white/5">
            <div>
              <h2 id="player-card-modal-title" className="text-2xl font-display font-black text-white italic uppercase tracking-tighter leading-none">{player.customName}</h2>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-[10px] font-display font-bold text-slate-500 uppercase tracking-widest">
                  {player.position}
                </p>
                {player.isJourneyman && <span className="text-premium-gold text-[9px] font-display font-black uppercase tracking-widest bg-premium-gold/10 px-1.5 py-0.5 rounded border border-premium-gold/20 italic">Sustituto Temporal</span>}
                {player.isStarPlayer && <span className="text-sky-400 text-[9px] font-display font-black uppercase tracking-widest bg-sky-400/10 px-1.5 py-0.5 rounded border border-sky-400/20 italic">Jugador Estrella</span>}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-premium"
              aria-label="Cerrar modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-8 overflow-y-auto space-y-8 custom-scrollbar">
            {/* S3 Conditions Quick Panel */}
            <div className="bg-black/40 border border-white/5 rounded-[2.5rem] p-6 space-y-4">
              <h3 className="text-[10px] font-display font-black text-slate-500 uppercase tracking-[0.3em] mb-2 px-4 italic">Intervenciones del Caos</h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => onConditionToggle?.('isDistracted')}
                  className={`group relative flex flex-col items-center justify-center p-5 rounded-3xl border-2 transition-all duration-300 ${player.isDistracted
                    ? 'bg-red-600 border-red-500 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)]'
                    : 'bg-white/5 border-white/10 text-slate-500 hover:border-red-500/50 hover:text-red-400'
                    }`}
                >
                  <span className={`material-symbols-outlined text-3xl mb-2 transition-transform duration-500 ${player.isDistracted ? 'scale-110' : 'group-hover:rotate-12'}`}>block</span>
                  <span className="text-[10px] font-display font-black uppercase tracking-widest">Distraído</span>
                  {player.isDistracted && <div className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full animate-ping"></div>}
                </button>

                <button
                  onClick={() => onConditionToggle?.('hasIndigestion')}
                  className={`group relative flex flex-col items-center justify-center p-5 rounded-3xl border-2 transition-all duration-300 ${player.hasIndigestion
                    ? 'bg-amber-500 border-amber-400 text-black shadow-[0_0_20px_rgba(245,159,10,0.4)]'
                    : 'bg-white/5 border-white/10 text-slate-500 hover:border-amber-500/50 hover:text-amber-400'
                    }`}
                >
                  <span className={`material-symbols-outlined text-3xl mb-2 transition-transform duration-500 ${player.hasIndigestion ? 'scale-110' : 'group-hover:rotate-12'}`}>restaurant</span>
                  <span className="text-[10px] font-display font-black uppercase tracking-widest leading-tight">Indigestión<br/><span className="text-[8px] opacity-70">-1 MV/AR</span></span>
                  {player.hasIndigestion && <div className="absolute top-2 right-2 w-2 h-2 bg-black rounded-full animate-ping"></div>}
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-[10px] font-display font-bold text-slate-500 uppercase tracking-[0.2em] mb-4 px-2">Estadísticas de Campo</h3>
              <div className="grid grid-cols-5 gap-3">
                {Object.entries(player.stats).map(([stat, value]) => {
                  let displayValue = value;
                  let isModified = false;
                  if (player.hasIndigestion) {
                    if (stat === 'MV') {
                      displayValue = Math.max(1, (value as number) - 1);
                      isModified = true;
                    }
                    if (stat === 'AR') {
                      const arValue = parseInt((value as string).replace('+', ''));
                      displayValue = `${arValue + 1}+`;
                      isModified = true;
                    }
                  }
                  return (
                    <div key={stat} className={`bg-black/40 border rounded-2xl p-4 text-center group/stat transition-premium ${isModified ? 'border-amber-500/30' : 'border-white/5 hover:border-premium-gold/30'}`}>
                      <span className={`block text-[8px] font-display font-black uppercase tracking-widest mb-1 ${isModified ? 'text-amber-400' : 'text-slate-500 group-hover/stat:text-premium-gold/60'}`}>{stat}</span>
                      <span className={`text-lg font-display font-black italic ${isModified ? 'text-amber-400' : 'text-white'}`}>{displayValue}</span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 bg-premium-gold/5 border border-premium-gold/20 rounded-xl p-3 flex justify-between items-center">
                <span className="text-[10px] font-display font-black text-premium-gold uppercase tracking-widest">Puntos de Estrellato</span>
                <span className="text-lg font-display font-black text-white italic">{player.spp} SPP</span>
              </div>
            </div>

            <div>
              <h3 className="text-[10px] font-display font-bold text-slate-500 uppercase tracking-[0.2em] mb-4 px-2">Habilidades & Tratos</h3>
              <div className="flex flex-wrap gap-2">
                {allSkills.length > 0 ? allSkills.map((skill, index) => (
                  <div key={`${skill}-${index}`} className="flex items-center">
                    <SkillButton skillName={skill} onSkillClick={handleSkillClick} />
                  </div>
                )) : <span className="text-white/20 font-display font-medium italic">Sin habilidades especiales</span>}
              </div>
            </div>

            {player.lastingInjuries && player.lastingInjuries.length > 0 && (
              <div className="bento-card border-red-500/30 bg-red-500/5 p-6 animate-pulse-slow">
                <h3 className="text-[10px] font-display font-bold text-red-400 uppercase tracking-[0.2em] mb-3">Registros Médicos: Lesiones</h3>
                <div className="flex flex-wrap gap-2">
                  {player.lastingInjuries.map((injury, i) => (
                    <span key={i} className="bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-display font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg">{injury}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <button
                onClick={onBallToggle}
                className={`flex-1 flex flex-col items-center justify-center p-6 rounded-[2.5rem] border-2 transition-all duration-300 font-display font-black uppercase tracking-[0.2em] italic ${isBallCarrier
                  ? 'bg-sky-500 border-sky-400 text-black shadow-[0_0_30px_rgba(14,165,233,0.4)]'
                  : 'bg-white/5 border-white/10 text-slate-500 hover:border-sky-500/50 hover:text-sky-400'
                  }`}
              >
                <span className="text-3xl mb-2">{isBallCarrier ? '🏈' : '🏉'}</span>
                <span className="text-[10px]">{isBallCarrier ? 'Tiene el Balón' : 'Dar Balón'}</span>
              </button>
            </div>
          </div>
          <div className="p-4 bg-black/20 border-t border-white/5">
            <button
              onClick={onClose}
              className="w-full text-[10px] font-display font-black uppercase tracking-[0.3em] text-slate-500 hover:text-white transition-premium py-4"
            >
              Cerrar Visor de Jugador
            </button>
          </div>
        </div>
        <style>{`
          @keyframes fade-in-fast { from { opacity: 0; } to { opacity: 1; } }
          @keyframes slide-in-up { from { transform: translateY(20px) scale(0.98); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
          .animate-fade-in-fast { animation: fade-in-fast 0.2s ease-out forwards; }
          .animate-slide-in-up { animation: slide-in-up 0.3s ease-out forwards; }
          .custom-scrollbar::-webkit-scrollbar { width: 4px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,184,76,0.1); border-radius: 20px; }
        `}</style>
      </div>
      {selectedSkill && <SkillModal skill={selectedSkill} onClose={() => setSelectedSkill(null)} />}
    </>
  );
};

export default PlayerCardModal;
