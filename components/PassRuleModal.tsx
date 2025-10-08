
import React from 'react';

const PassRuleModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] p-4 animate-fade-in-fast"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-w-2xl w-full transform animate-slide-in-up flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-slate-700">
          <h2 className="text-xl font-bold text-amber-400">Reglas de Pase</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl font-bold">&times;</button>
        </div>
        <div className="p-5 overflow-y-auto space-y-4 text-slate-300">
          <div className="space-y-2">
            <h3 className="font-semibold text-lg text-amber-300">1. Medir Distancia y Modificadores</h3>
            <p>La distancia del pase determina la dificultad. Se cuenta el número de casillas horizontales (X) y verticales (Y) desde el lanzador al objetivo.</p>
            <ul className="list-disc list-inside space-y-1 pl-4">
              <li><span className="font-semibold text-white">Pase rápido:</span> Sin modificador.</li>
              <li><span className="font-semibold text-white">Pase corto:</span> Modificador de -1.</li>
              <li><span className="font-semibold text-white">Pase largo:</span> Modificador de -2.</li>
              <li><span className="font-semibold text-white">Bomba larga:</span> Modificador de -3.</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-lg text-amber-300">2. Chequeo de Precisión (1D6)</h3>
            <p>Para completar el pase, el resultado de <span className="font-mono text-amber-400">1D6 + Modificador</span> debe ser igual o mayor que el atributo de <span className="font-bold">PS</span> del lanzador.</p>
            <ul className="list-disc list-inside space-y-1 pl-4">
              <li>Una tirada de <span className="font-bold text-green-400">6 natural</span> siempre es un <span className="font-semibold">Pase Preciso</span>.</li>
              <li>Una tirada de <span className="font-bold text-red-400">1 natural</span> siempre es un <span className="font-semibold">Balón Perdido</span> (¡Turnover!).</li>
            </ul>
          </div>
           <div className="space-y-2">
            <h3 className="font-semibold text-lg text-amber-300">3. Resultados del Pase</h3>
            <ul className="list-disc list-inside space-y-1 pl-4">
              <li><span className="font-semibold text-green-400">Pase Preciso:</span> El balón aterriza en la casilla objetivo.</li>
              <li><span className="font-semibold text-yellow-400">Pase Impreciso:</span> Si el chequeo falla, el balón se desvía desde la <span className="underline">casilla objetivo</span>.</li>
              <li><span className="font-semibold text-orange-400">Pase MUY Impreciso:</span> Si el resultado final (tirada + modificador) es 1 o menos, el balón se desvía desde la <span className="underline">casilla del LANZADOR</span>.</li>
              <li><span className="font-semibold text-red-400">Balón Perdido:</span> Con un 1 natural, el balón rebota desde la <span className="underline">casilla del LANZADOR</span> y se produce un cambio de turno.</li>
            </ul>
          </div>
        </div>
        <div className="p-4 bg-slate-900/50 border-t border-slate-700 flex justify-end">
          <button onClick={onClose} className="bg-amber-500 text-slate-900 font-bold py-2 px-6 rounded-md">Entendido</button>
        </div>
      </div>
       <style>{`
          @keyframes fade-in-fast { from { opacity: 0; } to { opacity: 1; } }
          @keyframes slide-in-up { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
          .animate-fade-in-fast { animation: fade-in-fast 0.2s ease-out forwards; }
          .animate-slide-in-up { animation: slide-in-up 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default PassRuleModal;
