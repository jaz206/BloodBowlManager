
import React, { useState } from 'react';
import { passChartGrid, passTypeDetails } from '../../data/passChart';

const GRID_SIZE = 14;

const PassChart: React.FC = () => {
  const [selectedCell, setSelectedCell] = useState<{ x: number, y: number } | null>(null);

  const handleCellClick = (x: number, y: number) => {
    if (selectedCell && selectedCell.x === x && selectedCell.y === y) {
      setSelectedCell(null);
    } else {
      setSelectedCell({ x, y });
    }
  };

  const selectedPassTypeKey = selectedCell ? passChartGrid[selectedCell.y][selectedCell.x] : null;

  return (
    <div className="text-center">
      <h2 className="text-3xl font-display font-black text-white italic uppercase tracking-tighter mb-4 shadow-xl">Tabla de Pases</h2>
      <p className="text-[10px] font-display font-bold text-slate-500 uppercase tracking-[0.2em] mb-8 max-w-lg mx-auto leading-relaxed border-b border-white/5 pb-4">
        Cálculo de trayectorias tácticas: cruza las distancias X e Y para determinar la dificultad del lanzamiento.
      </p>

      <div className="flex flex-wrap justify-center items-center gap-6 mb-8 bg-black/20 p-4 rounded-xl border border-white/5">
        {Object.values(passTypeDetails).map(({ name, color }) => (
          <div key={name} className="flex items-center space-x-3">
            <div className={`w-4 h-4 rounded-md ${color} shadow-[0_0_10px_rgba(255,255,255,0.1)] border border-white/10 flex-shrink-0`}></div>
            <span className="text-white/60 text-[10px] font-display font-bold uppercase tracking-widest">{name}</span>
          </div>
        ))}
      </div>

      <div className="relative mx-auto" style={{ maxWidth: 'min(90vw, 700px)' }}>
        <div className="glass-panel p-3 sm:p-6 border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <div className="grid grid-cols-15 gap-1">
            {/* Corner */}
            <div className="flex items-center justify-center text-slate-500 text-[10px] font-display font-black tracking-tighter bg-white/5 rounded-md">Y\X</div>
            {/* X-axis labels */}
            {Array.from({ length: GRID_SIZE }).map((_, i) => (
              <div key={`x-label-${i}`} className="flex items-center justify-center text-premium-gold text-xs font-display font-black bg-white/5 rounded-md py-1">{i}</div>
            ))}

            {Array.from({ length: GRID_SIZE }).map((_, y) => (
              <React.Fragment key={`row-${y}`}>
                {/* Y-axis label */}
                <div className="flex items-center justify-center text-premium-gold text-xs font-display font-black bg-white/5 rounded-md py-1">{y}</div>
                {/* Grid cells */}
                {Array.from({ length: GRID_SIZE }).map((_, x) => {
                  const typeKey = passChartGrid[y][x];
                  const info = passTypeDetails[typeKey];
                  const isSelected = selectedCell && selectedCell.x === x && selectedCell.y === y;
                  return (
                    <div
                      key={`${x}-${y}`}
                      onClick={() => handleCellClick(x, y)}
                      className={`aspect-square cursor-pointer transition-premium rounded-md ${info.color} ${isSelected ? 'ring-4 ring-premium-gold scale-125 z-20 shadow-2xl relative' : 'hover:scale-110 hover:z-10 opacity-80 hover:opacity-100 hover:shadow-xl'}`}
                      title={`${info.name} (${x}, ${y})`}
                    ></div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {selectedCell && selectedPassTypeKey && (
        <div className="mt-8 p-6 glass-panel border-premium-gold/30 bg-premium-gold/5 shadow-2xl text-left animate-slide-in-up max-w-md mx-auto relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <svg className="w-16 h-16 text-premium-gold" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
          </div>
          <h3 className="text-xl font-display font-black text-white italic uppercase tracking-tighter mb-2 flex items-center gap-3">
            <span className="w-8 h-8 bg-premium-gold text-black rounded-lg flex items-center justify-center text-sm not-italic shadow-lg border border-white/20">!</span>
            {passTypeDetails[selectedPassTypeKey].name}
          </h3>
          <p className="text-slate-300 font-display font-medium tracking-wide">
            Un pase táctico a una distancia de <span className="text-premium-gold font-bold">{selectedCell.x}</span>x<span className="text-premium-gold font-bold">{selectedCell.y}</span> se clasifica estrictamente como un <span className="text-white font-black uppercase italic tracking-tighter">{passTypeDetails[selectedPassTypeKey].name}</span>.
          </p>
        </div>
      )}

      <style>{`
        .grid-cols-15 { grid-template-columns: repeat(15, minmax(0, 1fr)); }
        @keyframes slide-in-up { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-slide-in-up { animation: slide-in-up 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
      `}</style>
    </div>
  );
};

export default PassChart;
