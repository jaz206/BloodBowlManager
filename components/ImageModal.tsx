import React from 'react';

interface ImageModalProps {
  src: string;
  alt: string;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ src, alt, onClose }) => {
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-[100] p-4 animate-fade-in-fast"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      <div className="relative max-w-5xl max-h-[95vh] transform animate-slide-in-up">
        <div className="absolute inset-0 bg-premium-gold/20 blur-[100px] opacity-20 pointer-events-none"></div>
        <img src={src} alt={`Imagen ampliada de ${alt}`} className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/10 relative z-10" />
        <button
          onClick={onClose}
          className="absolute -top-6 -right-6 text-white bg-white/10 backdrop-blur-md rounded-2xl p-3 hover:bg-white/20 transition-premium border border-white/20 shadow-2xl z-20"
          aria-label="Cerrar imagen"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <style>{`
        @keyframes fade-in-fast { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in-fast { animation: fade-in-fast 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default ImageModal;
