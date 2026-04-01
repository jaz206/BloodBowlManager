
import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import type { Skill } from '../../types';

interface SkillModalProps {
  skill: Skill;
  onClose: () => void;
}

const SkillModal: React.FC<SkillModalProps> = ({ skill, onClose }) => {
  const { language } = useLanguage();

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const name = language === 'es' ? (skill.name_es || skill.name_en) : skill.name_en;
  const description = language === 'es' ? (skill.desc_es || skill.desc_en) : skill.desc_en;


  return (
    <div
      className="fixed inset-0 bg-[rgba(255,248,231,0.68)] backdrop-blur-md flex items-center justify-center z-[2000] p-4 animate-fade-in-fast"
      style={{ zIndex: 2000 }}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="skill-modal-title"
    >
      <div className="blood-ui-light-card max-w-lg w-full transform animate-slide-in-up overflow-hidden shadow-[0_24px_70px_rgba(92,68,39,0.16)] rounded-[1.8rem]">
        <div className="flex justify-between items-center p-6 border-b border-[rgba(111,87,56,0.12)] bg-[rgba(255,251,241,0.55)]">
          <h2 id="skill-modal-title" className="blood-ui-light-title text-2xl uppercase italic tracking-tighter">{name}</h2>
          <button
            onClick={onClose}
            className="text-[#7b6853] hover:text-[#2b1d12] transition-premium p-2 rounded-xl hover:bg-white/50 focus:outline-none"
            aria-label="Cerrar modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-8 space-y-4">
          <div className={`text-[10px] font-display font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full border inline-block ${skill.category === 'Rasgo' || skill.category === 'Trait' ? 'bg-[rgba(202,138,4,0.14)] text-[#2b1d12] border-[rgba(202,138,4,0.25)]' : 'bg-white/60 text-[#4b3a28] border-[rgba(111,87,56,0.12)]'}`}>
            {skill.category}
          </div>
          <p className="blood-ui-light-body font-medium leading-relaxed italic text-base">{description}</p>
        </div>
        <div className="p-6 bg-[rgba(255,251,241,0.62)] border-t border-[rgba(111,87,56,0.12)] flex justify-end">
          <button onClick={onClose} className="blood-ui-button-secondary w-full sm:w-auto py-3 px-8 rounded-2xl text-[10px]">
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
