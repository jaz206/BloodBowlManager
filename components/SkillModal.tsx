
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
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in-fast"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="skill-modal-title"
    >
      <div className="bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-w-lg w-full transform animate-slide-in-up">
        <div className="flex justify-between items-center p-4 border-b border-slate-700">
          <h2 id="skill-modal-title" className="text-xl font-bold text-amber-400">{skill.name}</h2>
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
        <div className="p-5">
          <span className={`text-xs font-bold px-2 py-1 rounded-full mb-4 inline-block ${categoryColor[skill.category] || 'bg-gray-500'}`}>
            {skill.category}
          </span>
          <p className="text-slate-300">{skill.description}</p>
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