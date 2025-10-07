import React, { useState, useRef, useEffect } from 'react';
import type { Token, PlayerPosition, ManagedTeam, ManagedPlayer } from '../types';
import { fieldImage } from '../data/fieldImage';

const GRID_COLS = 15;
const GRID_ROWS = 26;

const positionConfig: Record<PlayerPosition, { color: string; hover: string; }> = {
  Blitzer: { color: 'bg-red-700', hover: 'hover:bg-red-600' },
  Lanzador: { color: 'bg-sky-600', hover: 'hover:bg-sky-500' },
  Corredor: { color: 'bg-emerald-600', hover: 'hover:bg-emerald-500' },
  Línea: { color: 'bg-slate-500', hover: 'hover:bg-slate-400' },
  Receptor: { color: 'bg-amber-500', hover: 'hover:bg-amber-500' },
};

interface BoardToken extends Token {
    playerData?: ManagedPlayer;
}

interface GameBoardProps {
  managedTeams: ManagedTeam[];
}

const GameBoard: React.FC<GameBoardProps> = ({ managedTeams }) => {
  const [tokens, setTokens] = useState<BoardToken[]>([]);
  const [teamToLoad, setTeamToLoad] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState<ManagedPlayer | null>(null);
  
  const fieldRef = useRef<HTMLDivElement>(null);
  const draggedTokenRef = useRef<{ id: number } | null>(null);

  useEffect(() => {
    const handleGlobalDragMove = (e: MouseEvent | TouchEvent) => handleDragMove(e);
    const handleGlobalDragEnd = () => handleDragEnd();

    document.addEventListener('mousemove', handleGlobalDragMove);
    document.addEventListener('mouseup', handleGlobalDragEnd);
    document.addEventListener('touchmove', handleGlobalDragMove as any, { passive: false });
    document.addEventListener('touchend', handleGlobalDragEnd);

    return () => {
        document.removeEventListener('mousemove', handleGlobalDragMove);
        document.removeEventListener('mouseup', handleGlobalDragEnd);
        document.removeEventListener('touchmove', handleGlobalDragMove as any);
        document.removeEventListener('touchend', handleGlobalDragEnd);
    };
  }, []);

  const mapPositionToType = (position: string): PlayerPosition => {
      const lowerPos = position.toLowerCase();
      if (lowerPos.includes('blitzer') || lowerPos.includes('wardancer') || lowerPos.includes('witch') || lowerPos.includes('assassin') || lowerPos.includes('slayer')) return 'Blitzer';
      if (lowerPos.includes('thrower') || lowerPos.includes('lanzador')) return 'Lanzador';
      if (lowerPos.includes('runner') || lowerPos.includes('corredor')) return 'Corredor';
      if (lowerPos.includes('catcher') || lowerPos.includes('receptor')) return 'Receptor';
      return 'Línea';
  };

  const handleLoadTeam = () => {
    setSelectedPlayer(null);
    if (!teamToLoad) return;
    const team = managedTeams.find(t => t.name === teamToLoad);
    if (team && team.players.length > 0) {
        const playersOnField = team.players.filter(p => !(p.isBenched ?? false));
        const newTokens: BoardToken[] = playersOnField.map((player, index) => ({
            id: player.id,
            position: mapPositionToType(player.position),
            x: 2 + (index % (Math.floor(GRID_COLS/2)-1)) * 2,
            y: GRID_ROWS - 5 + Math.floor(index / (Math.floor(GRID_COLS/2)-1)),
            playerData: player,
        }));
        setTokens(newTokens);
    }
  };

  const handleDragStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>, id: number) => {
    e.preventDefault();
    const clickedToken = tokens.find(t => t.id === id);
    if (clickedToken) {
        setSelectedPlayer(clickedToken.playerData || null);
    }
    draggedTokenRef.current = { id };
  };

  const handleDragMove = (e: MouseEvent | TouchEvent) => {
    if (!draggedTokenRef.current || !fieldRef.current) return;
    
    if (e.cancelable) e.preventDefault();

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const fieldRect = fieldRef.current.getBoundingClientRect();
    const x = clientX - fieldRect.left;
    const y = clientY - fieldRect.top;

    const colWidth = fieldRect.width / GRID_COLS;
    const rowHeight = fieldRect.height / GRID_ROWS;

    let gridX = Math.floor(x / colWidth);
    let gridY = Math.floor(y / rowHeight);

    gridX = Math.max(0, Math.min(GRID_COLS - 1, gridX));
    gridY = Math.max(0, Math.min(GRID_ROWS - 1, gridY));

    setTokens(currentTokens => currentTokens.map(token => 
        token.id === draggedTokenRef.current?.id ? { ...token, x: gridX, y: gridY } : token
    ));
  };
  
  const handleDragEnd = () => {
    draggedTokenRef.current = null;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-amber-400 mb-2">Campo de Juego</h2>
        <p className="text-slate-400 max-w-lg mx-auto">Carga tu equipo y posiciona a tus jugadores en el campo.</p>
      </div>

      <div 
        ref={fieldRef}
        className="relative w-full max-w-4xl mx-auto aspect-[15/26] bg-slate-900 rounded-lg shadow-xl border-2 border-slate-700 select-none overflow-hidden"
      >
        <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform rotate-90"
            style={{ width: '173.33%', height: '57.7%' }} // Swap aspect ratio for rotation
        >
            <img 
                src={fieldImage} 
                alt="Campo de Blood Bowl"
                className="w-full h-full object-cover"
            />
        </div>
        <div 
            className="absolute inset-0 grid pointer-events-none" 
            style={{ 
                gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`, 
                gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)` 
            }}
        >
            {Array.from({ length: GRID_ROWS * GRID_COLS }).map((_, i) => (
                <div
                    key={i}
                    className="w-full h-full border border-black/20"
                ></div>
            ))}
        </div>

        {tokens.map((token, index) => (
          <div
            key={token.id}
            onMouseDown={(e) => handleDragStart(e, token.id)}
            onTouchStart={(e) => handleDragStart(e, token.id)}
            className={`absolute flex items-center justify-center w-[6.66%] h-[3.84%] ${positionConfig[token.position]?.color || 'bg-gray-400'} text-white font-bold text-xs border-2 border-white rounded-full shadow-lg cursor-grab active:cursor-grabbing`}
            style={{
              left: `${((token.x + 0.5) / GRID_COLS) * 100}%`,
              top: `${((token.y + 0.5) / GRID_ROWS) * 100}%`,
              transform: 'translate(-50%, -50%)',
              touchAction: 'none'
            }}
          >
            {index + 1}
          </div>
        ))}
      </div>

       {selectedPlayer && (
        <div className="mt-6 bg-slate-900/70 p-4 rounded-lg border border-slate-700 animate-fade-in max-w-4xl mx-auto">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold text-amber-400">{selectedPlayer.customName}</h3>
              <p className="text-slate-400 text-sm">{selectedPlayer.position}</p>
            </div>
            <button onClick={() => setSelectedPlayer(null)} className="text-slate-400 hover:text-white p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-white" aria-label="Cerrar detalles del jugador">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
          </div>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="col-span-1 sm:col-span-3">
              <h4 className="font-semibold text-slate-300 mb-2">Estadísticas</h4>
              <div className="flex flex-wrap gap-x-4 gap-y-1 bg-slate-800 p-2 rounded-md text-slate-200">
                <span className="font-mono">MV: {selectedPlayer.stats.MV}</span>
                <span className="font-mono">FU: {selectedPlayer.stats.FU}</span>
                <span className="font-mono">AG: {selectedPlayer.stats.AG}</span>
                <span className="font-mono">PS: {selectedPlayer.stats.PS}</span>
                <span className="font-mono">AR: {selectedPlayer.stats.AR}</span>
                <span className="font-bold text-amber-300 font-mono">PE: {selectedPlayer.spp}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <div className="bg-slate-900/70 p-4 rounded-lg border border-slate-700">
            <h3 className="text-lg font-semibold text-amber-400 mb-4">Cargar Plantilla de Equipo</h3>
            {managedTeams.length > 0 ? (
                <div className="flex gap-3">
                    <select
                        value={teamToLoad}
                        onChange={e => setTeamToLoad(e.target.value)}
                        className="flex-grow bg-slate-800 border border-slate-600 rounded-md py-2 px-3 text-white focus:ring-amber-500 focus:border-amber-500"
                    >
                        <option value="">Seleccionar equipo...</option>
                        {managedTeams.map(team => <option key={team.id || team.name} value={team.name}>{team.name}</option>)}
                    </select>
                    <button onClick={handleLoadTeam} className="bg-teal-600 text-white font-bold py-2 px-6 rounded-md shadow-md hover:bg-teal-500 transition-colors">Cargar Equipo</button>
                </div>
            ) : (
                <p className="text-slate-400">No has creado ningún equipo en el "Gestor de Equipo".</p>
            )}
        </div>
      </div>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default GameBoard;
