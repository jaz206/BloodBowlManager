
import React, { useState } from 'react';
import { passChartGrid, passTypeDetails } from '../data/passChart';

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
      <h2 className="text-2xl font-semibold text-amber-400 mb-3">Tabla de Pases</h2>
      <p className="text-slate-400 mb-6 max-w-lg mx-auto">
        Calcula la distancia horizontal (eje X) y vertical (eje Y) entre el lanzador y el receptor para encontrar el tipo de pase. Haz clic en una casilla para ver los detalles.
      </p>

      <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 mb-6">
        {Object.values(passTypeDetails).map(({ name, color }) => (
          <div key={name} className="flex items-center space-x-2">
            <div className={`w-5 h-5 rounded-full ${color} border-2 border-slate-500 flex-shrink-0`}></div>
            <span className="text-slate-300 text-sm">{name}</span>
          </div>
        ))}
      </div>

      <div className="relative mx-auto" style={{ maxWidth: 'min(70vw, 600px)'}}>
        <div className="aspect-square">
          <div className="grid grid-cols-15 gap-0.5 p-2 sm:p-4 bg-slate-900/70 border border-slate-700 rounded-lg">
            {/* Corner */}
            <div className="flex items-center justify-center text-slate-400 text-xs font-bold">Y\X</div>
            {/* X-axis labels */}
            {Array.from({ length: GRID_SIZE }).map((_, i) => (
              <div key={`x-label-${i}`} className="flex items-center justify-center text-slate-400 text-xs sm:text-sm font-bold">{i}</div>
            ))}

            {Array.from({ length: GRID_SIZE }).map((_, y) => (
              <React.Fragment key={`row-${y}`}>
                {/* Y-axis label */}
                <div className="flex items-center justify-center text-slate-400 text-xs sm:text-sm font-bold">{y}</div>
                {/* Grid cells */}
                {Array.from({ length: GRID_SIZE }).map((_, x) => {
                  const typeKey = passChartGrid[y][x];
                  const info = passTypeDetails[typeKey];
                  const isSelected = selectedCell && selectedCell.x === x && selectedCell.y === y;
                  return (
                    <div
                      key={`${x}-${y}`}
                      onClick={() => handleCellClick(x, y)}
                      className={`aspect-square cursor-pointer transition-all duration-150 rounded-sm ${info.color} ${info.hoverColor} ${isSelected ? 'ring-2 ring-offset-2 ring-offset-slate-800 ring-amber-400 scale-110 z-10' : 'hover:scale-105'}`}
                      aria-label={`Distancia x: ${x}, y: ${y}. Tipo de pase: ${info.name}`}
                    ></div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
      
      {selectedCell && selectedPassTypeKey && (
        <div className="mt-8 p-6 bg-slate-900/70 border border-slate-700 rounded-lg shadow-xl text-left animate-fade-in max-w-md mx-auto">
          <h3 className="text-xl font-bold text-amber-300 mb-2">
            Distancia ({selectedCell.x}, {selectedCell.y}): {passTypeDetails[selectedPassTypeKey].name}
          </h3>
          <p className="text-slate-300">
            Un pase a una distancia de {selectedCell.x} casillas horizontales y {selectedCell.y} casillas verticales se considera un <span className="font-bold">{passTypeDetails[selectedPassTypeKey].name.toLowerCase()}</span>.
          </p>
        </div>
      )}

      <style>{`
        .grid-cols-15 { grid-template-columns: repeat(15, minmax(0, 1fr)); }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default PassChart;