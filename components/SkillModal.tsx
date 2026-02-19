
import React from 'react';
import type { Skill } from '../types';

interface SkillModalProps {
  skill: Skill;
  onClose: () => void;
}

const SkillModal: React.FC<SkillModalProps> = ({ skill, onClose }) => {
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const categoryColor: Record<string, string> = {
    'General': 'bg-slate-600 text-slate-200',
    'Agilidad': 'bg-emerald-600 text-white',
    'Fuerza': 'bg-red-700 text-white',
    'Pase': 'bg-sky-600 text-white',
    'Mutaciones': 'bg-purple-600 text-white',
    'Rasgo': 'bg-yellow-700 text-white',
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in-fast"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="skill-modal-title"
    >
      <div className="glass-panel max-w-lg w-full transform animate-slide-in-up border-white/10 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        <div className="flex justify-between items-center p-6 border-b border-white/5 bg-white/5">
          <h2 id="skill-modal-title" className="text-2xl font-display font-black text-premium-gold italic uppercase tracking-tighter">{skill.name}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-premium p-2 rounded-xl hover:bg-white/5 focus:outline-none"
            aria-label="Cerrar modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-8 space-y-4">
          <div className={`text-[10px] font-display font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-lg border inline-block ${skill.category === 'Rasgo' ? 'bg-premium-gold/10 text-premium-gold border-premium-gold/20' : 'bg-white/5 text-slate-300 border-white/10'}`}>
            {skill.category}
          </div>
          <p className="text-white font-medium leading-relaxed italic opacity-90">{skill.description}</p>
        </div>
        <div className="p-6 bg-black/20 border-t border-white/5 flex justify-end">
          <button onClick={onClose} className="w-full sm:w-auto bg-white/5 border border-white/10 text-white font-display font-bold uppercase tracking-widest text-[10px] py-3 px-8 rounded-lg hover:bg-white/10 transition-premium">
            Entendido
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fade-in-fast {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes slide-in-up {
            from { transform: translateY(20px) scale(0.98); opacity: 0; }
            to { transform: translateY(0) scale(1); opacity: 1; }
        }
        .animate-fade-in-fast { animation: fade-in-fast 0.2s ease-out forwards; }
        .animate-slide-in-up { animation: slide-in-up 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default SkillModal;