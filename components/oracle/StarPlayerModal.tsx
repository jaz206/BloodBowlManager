

import React, { useState } from 'react';
import type { StarPlayer, Skill } from '../types';
import { skillsData } from '../data/skills';
import SkillModal from './SkillModal';
import ImageModal from './ImageModal';

interface StarPlayerModalProps {
  player: StarPlayer;
  onClose: () => void;
}

const StarPlayerModal: React.FC<StarPlayerModalProps> = ({ player, onClose }) => {
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [isImageEnlarged, setIsImageEnlarged] = useState(false);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSkillClick = (skillName: string) => {
    const cleanedName = skillName.split('(')[0].trim();
    const foundSkill = skillsData.find(s => s.name.toLowerCase().startsWith(cleanedName.toLowerCase()));
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
        className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in-fast"
        onClick={handleBackdropClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby="star-player-modal-title"
      >
        <div className="glass-panel max-w-3xl w-full transform animate-slide-in-up border-white/10 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] max-h-[90vh] flex flex-col">
          <div className="flex justify-between items-start p-6 border-b border-white/5 bg-white/5">
            <div>
              <h2 id="star-player-modal-title" className="text-3xl font-display font-black text-white italic uppercase tracking-tighter leading-none">{player.name}</h2>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] font-display font-bold text-premium-gold uppercase tracking-[0.2em] bg-premium-gold/10 px-2 py-0.5 rounded border border-premium-gold/20">Jugador Estrella</span>
                <span className="text-sm text-white font-display font-black italic">{player.cost.toLocaleString()} M.O.</span>
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
          <div className="p-8 overflow-y-auto scrollbar-hide">
            <div className="flex flex-col md:flex-row gap-8">
              {player.image && (
                <div className="md:w-1/3 flex-shrink-0 group">
                  <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/40 aspect-[3/4] shadow-2xl">
                    <img
                      src={player.image}
                      alt={player.name}
                      className="w-full h-full object-cover transition-premium group-hover:scale-110 cursor-pointer"
                      onClick={() => setIsImageEnlarged(true)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                      <span className="text-[10px] font-display font-black text-white uppercase tracking-widest">Ver Ampliado</span>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex-grow space-y-6">
                {player.pair ? (
                  <div className="space-y-8">
                    {player.pair.map((p) => (
                      <div key={p.name} className="bento-card bg-white/5 border-white/5 p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700"></div>
                        <h3 className="text-xl font-display font-black text-white italic uppercase tracking-tighter mb-4 relative z-10">{p.name}</h3>

                        <div className="grid grid-cols-5 gap-2 mb-6 relative z-10">
                          {Object.entries(p.stats).map(([stat, value]) => (
                            <div key={stat} className="bg-black/40 border border-white/5 rounded-xl p-2 text-center group/stat hover:border-premium-gold/30 transition-premium">
                              <span className="block text-[8px] font-display font-black text-slate-500 uppercase tracking-widest mb-1 group-hover/stat:text-premium-gold/60">{stat}</span>
                              <span className="text-sm font-display font-black text-white italic">{value}</span>
                            </div>
                          ))}
                        </div>

                        <div className="relative z-10">
                          <h4 className="text-[10px] font-display font-bold text-slate-500 uppercase tracking-[0.2em] mb-2">Habilidades</h4>
                          <div className="flex flex-wrap gap-2">
                            {p.skills.split(', ').map((skill) => (
                              <button
                                key={`${p.name}-${skill}`}
                                onClick={() => handleSkillClick(skill)}
                                className="bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[10px] font-display font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg hover:bg-sky-500/20 hover:border-sky-500/40 transition-premium"
                              >
                                {skill.trim()}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}

                    {player.skills && (
                      <div className="bento-card border-premium-gold/20 bg-premium-gold/5 p-6">
                        <h3 className="text-[10px] font-display font-bold text-premium-gold uppercase tracking-[0.2em] mb-3">Habilidades de Dúo</h3>
                        <div className="flex flex-wrap gap-2">
                          {player.skills.split(', ').map((skill) => (
                            <button
                              key={`pair-${skill}`}
                              onClick={() => handleSkillClick(skill)}
                              className="bg-premium-gold/10 border border-premium-gold/30 text-premium-gold text-[10px] font-display font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg hover:bg-premium-gold/20 transition-premium"
                            >
                              {skill.trim()}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      <div className="bento-card border-white/5 bg-white/5 p-6">
                        <h3 className="text-[10px] font-display font-bold text-slate-500 uppercase tracking-[0.2em] mb-2">Reglas Especiales</h3>
                        <p className="text-white/80 font-display font-medium italic italic leading-relaxed">{player.specialRules}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] font-display font-bold text-slate-500 uppercase tracking-[0.2em]">Juega para:</span>
                        <div className="flex flex-wrap gap-2">
                          {player.playsFor.map(team => (
                            <span key={team} className="text-[10px] font-display font-black text-white/40 uppercase tracking-widest border border-white/10 px-3 py-1 rounded-full">{team}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="bento-card bg-white/5 border-white/5 p-6">
                      <h3 className="text-[10px] font-display font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Estadísticas de Perfil</h3>
                      <div className="grid grid-cols-5 gap-3">
                        {player.stats && Object.entries(player.stats).map(([stat, value]) => (
                          <div key={stat} className="bg-black/40 border border-white/10 rounded-2xl p-4 text-center group/stat hover:border-premium-gold/30 transition-premium">
                            <span className="block text-[8px] font-display font-black text-slate-500 uppercase tracking-widest mb-1 group-hover/stat:text-premium-gold/60">{stat}</span>
                            <span className="text-lg font-display font-black text-white italic">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bento-card border-white/5 bg-white/5 p-6">
                      <h3 className="text-[10px] font-display font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Repertorio de Habilidades</h3>
                      <div className="flex flex-wrap gap-2">
                        {(player.skills || '').split(', ').map((skill) => (
                          <button
                            key={skill}
                            onClick={() => handleSkillClick(skill)}
                            className="bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[10px] font-display font-bold uppercase tracking-widest px-4 py-2 rounded-xl hover:bg-sky-500/20 hover:border-sky-500/40 transition-premium"
                          >
                            {skill.trim()}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="bento-card border-premium-gold/10 bg-premium-gold/5 p-6">
                        <h3 className="text-[10px] font-display font-bold text-premium-gold uppercase tracking-[0.2em] mb-2">Regla Especial</h3>
                        <p className="text-white/80 font-display font-medium italic leading-relaxed border-l-2 border-premium-gold/30 pl-4">{player.specialRules}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] font-display font-bold text-slate-500 uppercase tracking-[0.2em]">Juega para:</span>
                        <div className="flex flex-wrap gap-2">
                          {player.playsFor.map(team => (
                            <span key={team} className="text-[10px] font-display font-black text-white/40 uppercase tracking-widest border border-white/10 px-3 py-1 rounded-full">{team}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
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
      {isImageEnlarged && player.image && <ImageModal src={player.image} alt={player.name} onClose={() => setIsImageEnlarged(false)} />}
    </>
  );
};

export default StarPlayerModal;