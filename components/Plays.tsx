

import React, { useState, useRef, useEffect } from 'react';
import type { Token, Play, PlayerPosition, ManagedTeam, ManagedPlayer } from '../types';

const PLAYS_STORAGE_KEY = 'bloodbowl-plays';
const MAX_TOKENS = 11;
const GRID_COLS = 15;
const GRID_ROWS = 13;

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

interface PlaysProps {
  managedTeams: ManagedTeam[];
}

const Plays: React.FC<PlaysProps> = ({ managedTeams }) => {
  const [tokens, setTokens] = useState<BoardToken[]>([]);
  const [savedPlays, setSavedPlays] = useState<Play[]>([]);
  const [playName, setPlayName] = useState('');
  const [selectedPlay, setSelectedPlay] = useState('');
  const [teamToLoad, setTeamToLoad] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState<ManagedPlayer | null>(null);
  
  const fieldRef = useRef<HTMLDivElement>(null);
  const draggedTokenRef = useRef<{ id: number } | null>(null);

  useEffect(() => {
    try {
      const storedPlays = localStorage.getItem(PLAYS_STORAGE_KEY);
      if (storedPlays) {
        const parsedPlays: Play[] = JSON.parse(storedPlays);
        setSavedPlays(parsedPlays);
        if (parsedPlays.length > 0) {
            setSelectedPlay(parsedPlays[0].name);
        }
      }
    } catch (error) {
      console.error("Failed to load plays from localStorage", error);
    }
  }, []);

  // Effect to clean up event listeners on unmount
  useEffect(() => {
    const cleanup = () => {
        document.removeEventListener('mousemove', handleDragMove);
        document.removeEventListener('mouseup', handleDragEnd);
        document.removeEventListener('touchmove', handleDragMove as any);
        document.removeEventListener('touchend', handleDragEnd);
    };
    return cleanup;
  }, []);

  const mapPositionToType = (position: string): PlayerPosition => {
      const lowerPos = position.toLowerCase();
      if (lowerPos.includes('blitzer') || lowerPos.includes('wardancer') || lowerPos.includes('witch') || lowerPos.includes('assassin') || lowerPos.includes('slayer')) return 'Blitzer';
      if (lowerPos.includes('thrower') || lowerPos.includes('lanzador')) return 'Lanzador';
      if (lowerPos.includes('runner') || lowerPos.includes('corredor')) return 'Corredor';
      if (lowerPos.includes('catcher') || lowerPos.includes('receptor')) return 'Receptor';
      return 'Línea';
  };

  const handleAddToken = (position: PlayerPosition) => {
    if (tokens.length < MAX_TOKENS) {
      setTokens(prev => [...prev, { id: Date.now(), x: Math.floor(GRID_COLS / 2), y: GRID_ROWS - 2, position }]);
    }
  };

  const handleClearField = () => {
    setTokens([]);
    setSelectedPlayer(null);
  };

  const handleSavePlay = () => {
    if (!playName.trim() || tokens.length === 0) {
      alert('Por favor, introduce un nombre para la jugada y añade al menos un jugador.');
      return;
    }
    const newPlay = { name: playName, tokens: tokens.map(({playerData, ...token}) => token) }; // Don't save playerData
    const existingPlayIndex = savedPlays.findIndex(p => p.name === playName);
    
    let updatedPlays;
    if (existingPlayIndex > -1) {
        updatedPlays = [...savedPlays];
        updatedPlays[existingPlayIndex] = newPlay;
    } else {
        updatedPlays = [...savedPlays, newPlay];
    }
    
    setSavedPlays(updatedPlays);
    localStorage.setItem(PLAYS_STORAGE_KEY, JSON.stringify(updatedPlays));
    setPlayName('');
    setSelectedPlay(newPlay.name);
  };

  const handleLoadPlay = () => {
    if (!selectedPlay) return;
    const playToLoad = savedPlays.find(p => p.name === selectedPlay);
    if (playToLoad) {
      setTokens(playToLoad.tokens);
      setSelectedPlayer(null);
    }
  };

  const handleLoadTeam = () => {
    setSelectedPlayer(null);
    if (!teamToLoad) return;
    const team = managedTeams.find(t => t.name === teamToLoad);
    if (team && team.players.length > 0) {
        const newTokens: BoardToken[] = team.players.map((player, index) => ({
            id: player.id,
            position: mapPositionToType(player.position),
            x: 2 + (index % 6) * 2,
            y: GRID_ROWS - 3 + Math.floor(index / 6),
            playerData: player,
        }));
        setTokens(newTokens);
    }
  };

  const handleDeletePlay = () => {
     if (!selectedPlay) return;
     if (confirm(`¿Estás seguro de que quieres borrar la jugada "${selectedPlay}"?`)) {
        const updatedPlays = savedPlays.filter(p => p.name !== selectedPlay);
        setSavedPlays(updatedPlays);
        localStorage.setItem(PLAYS_STORAGE_KEY, JSON.stringify(updatedPlays));
        if (updatedPlays.length > 0) {
            setSelectedPlay(updatedPlays[0].name);
        } else {
            setSelectedPlay('');
        }
     }
  };

  const handleDragStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>, id: number) => {
    e.preventDefault();
    const clickedToken = tokens.find(t => t.id === id);
    if (clickedToken) {
        setSelectedPlayer(clickedToken.playerData || null);
    }
    
    draggedTokenRef.current = { id };
    
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
    document.addEventListener('touchmove', handleDragMove as any, { passive: false });
    document.addEventListener('touchend', handleDragEnd);
  };

  const handleDragMove = (e: MouseEvent | TouchEvent) => {
    if (!draggedTokenRef.current || !fieldRef.current) return;
    
    // Prevent scrolling on touch devices
    if (e.cancelable) {
      e.preventDefault();
    }

    let clientX, clientY;
    if ('touches' in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }

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
    document.removeEventListener('mousemove', handleDragMove);
    document.removeEventListener('mouseup', handleDragEnd);
    document.removeEventListener('touchmove', handleDragMove as any);
    document.removeEventListener('touchend', handleDragEnd);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-amber-400 mb-2">Pizarra Táctica</h2>
        <p className="text-slate-400 max-w-lg mx-auto">Crea, guarda y carga tus jugadas. Arrastra los jugadores para posicionarlos.</p>
      </div>

      <div 
        ref={fieldRef}
        className="relative w-full aspect-[15/13] bg-green-900/70 overflow-hidden rounded-lg shadow-xl border-2 border-slate-700 select-none"
      >
        {/* Grid Background */}
        <div 
            className="absolute inset-0 grid" 
            style={{ gridTemplateColumns: 'repeat(15, 1fr)', gridTemplateRows: 'repeat(13, 1fr)' }}
        >
            {Array.from({ length: GRID_ROWS * GRID_COLS }).map((_, i) => {
                const row = Math.floor(i / GRID_COLS);
                const col = i % GRID_COLS;
                const isLight = (row + col) % 2 === 0;
                return (
                    <div
                        key={i}
                        className={`w-full h-full ${isLight ? 'bg-green-800/40' : 'bg-green-900/40'}`}
                    ></div>
                );
            })}
        </div>

        {/* Field Lines */}
        <div className="absolute left-0 right-0 h-px bg-white/50" style={{ top: `calc(100% * 3 / 13)` }}></div>
        <div className="absolute top-0 bottom-0 w-px bg-white/50" style={{ left: `calc(100% * 4 / 15)` }}></div>
        <div className="absolute top-0 bottom-0 w-px bg-white/50" style={{ left: `calc(100% * 11 / 15)` }}></div>
        
        {/* Touchdown Zone (first row) */}
        <div className="absolute top-0 left-0 right-0 bg-red-800/20" style={{ height: `calc(100% / 13)`}}></div>

        {tokens.map((token, index) => (
          <div
            key={token.id}
            onMouseDown={(e) => handleDragStart(e, token.id)}
            onTouchStart={(e) => handleDragStart(e, token.id)}
            className={`absolute flex items-center justify-center w-[6.66%] h-[7.69%] ${positionConfig[token.position]?.color || 'bg-gray-400'} text-white font-bold text-sm border-2 border-white rounded-full shadow-lg cursor-grab active:cursor-grabbing`}
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
        <div className="mt-6 bg-slate-900/70 p-4 rounded-lg border border-slate-700 animate-fade-in">
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
            <div className="col-span-1 sm:col-span-2">
              <h4 className="font-semibold text-slate-300 mb-2">Habilidades Adquiridas</h4>
              <p className="text-slate-300">{selectedPlayer.gainedSkills.length > 0 ? selectedPlayer.gainedSkills.join(', ') : 'Ninguna'}</p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-300 mb-2">Lesiones Permanentes</h4>
              <p className="text-red-400">{selectedPlayer.lastingInjuries.length > 0 ? selectedPlayer.lastingInjuries.join(', ') : 'Ninguna'}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/70 p-4 rounded-lg border border-slate-700 md:col-span-2">
            <h3 className="text-lg font-semibold text-amber-400 mb-4">Cargar Plantilla de Equipo</h3>
            {managedTeams.length > 0 ? (
                <div className="flex gap-3">
                    <select
                        value={teamToLoad}
                        onChange={e => setTeamToLoad(e.target.value)}
                        className="flex-grow bg-slate-800 border border-slate-600 rounded-md py-2 px-3 text-white focus:ring-amber-500 focus:border-amber-500"
                    >
                        <option value="">Seleccionar equipo...</option>
                        {managedTeams.map(team => <option key={team.name} value={team.name}>{team.name}</option>)}
                    </select>
                    <button onClick={handleLoadTeam} className="bg-teal-600 text-white font-bold py-2 px-6 rounded-md shadow-md hover:bg-teal-500 transition-colors">Cargar Equipo</button>
                </div>
            ) : (
                <p className="text-slate-400">No has creado ningún equipo en el "Gestor de Equipo".</p>
            )}
        </div>
        
        <div className="bg-slate-900/70 p-4 rounded-lg border border-slate-700">
            <h3 className="text-lg font-semibold text-amber-400 mb-4">Añadir Jugadores ({tokens.length}/{MAX_TOKENS})</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                {(Object.keys(positionConfig) as PlayerPosition[]).map((position) => (
                    <button 
                        key={position}
                        onClick={() => handleAddToken(position)}
                        disabled={tokens.length >= MAX_TOKENS}
                        className={`w-full ${positionConfig[position].color} ${positionConfig[position].hover} text-white font-bold py-2 px-2 rounded-md shadow-md disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors text-xs sm:text-sm`}
                    >
                        + {position}
                    </button>
                ))}
            </div>
            <button onClick={handleClearField} className="bg-rose-600 text-white font-bold py-2 px-4 rounded-md shadow-md hover:bg-rose-500 transition-colors w-full">
                Limpiar Campo
            </button>
        </div>
        
         <div className="bg-slate-900/70 p-4 rounded-lg border border-slate-700">
            <h3 className="text-lg font-semibold text-amber-400 mb-4">Mis Jugadas</h3>
            {savedPlays.length > 0 ? (
            <div className="space-y-3">
                 <select value={selectedPlay} onChange={e => setSelectedPlay(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-md py-2 px-3 text-white focus:ring-amber-500 focus:border-amber-500">
                    {savedPlays.map(play => <option key={play.name} value={play.name}>{play.name}</option>)}
                </select>
                <div className="flex flex-wrap gap-2">
                    <button onClick={handleLoadPlay} className="flex-1 bg-sky-600 text-white font-bold py-2 px-4 rounded-md shadow-md hover:bg-sky-500 transition-colors">Cargar</button>
                    <button onClick={handleDeletePlay} className="flex-1 bg-slate-600 text-white font-bold py-2 px-4 rounded-md shadow-md hover:bg-slate-500 transition-colors">Borrar</button>
                </div>
            </div>
             ) : <p className="text-slate-400">No hay jugadas guardadas.</p>}
        </div>

        <div className="bg-slate-900/70 p-4 rounded-lg border border-slate-700 md:col-span-2">
            <h3 className="text-lg font-semibold text-amber-400 mb-4">Guardar Jugada Actual</h3>
            <div className="flex gap-3">
                <input 
                    type="text"
                    value={playName}
                    onChange={e => setPlayName(e.target.value)}
                    placeholder="Nombre de la jugada"
                    className="flex-grow bg-slate-800 border border-slate-600 rounded-md py-2 px-3 text-white focus:ring-amber-500 focus:border-amber-500"
                    aria-label="Nombre de la jugada"
                />
                <button onClick={handleSavePlay} className="bg-emerald-600 text-white font-bold py-2 px-6 rounded-md shadow-md hover:bg-emerald-500 transition-colors">Guardar</button>
            </div>
        </div>
      </div>
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Plays;