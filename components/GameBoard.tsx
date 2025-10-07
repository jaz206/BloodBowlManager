import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { Token, PlayerPosition, ManagedTeam, ManagedPlayer } from '../types';
import { fieldImage } from '../data/fieldImage';
import QrCodeIcon from './icons/QrCodeIcon';
import { teamsData } from '../data/teams';

declare const QRCode: any;
declare const Html5Qrcode: any;


const GRID_COLS = 15;
const GRID_ROWS = 26;

const homePositionConfig: Record<PlayerPosition, { color: string; }> = {
  Blitzer: { color: 'bg-red-700' },
  Lanzador: { color: 'bg-sky-600' },
  Corredor: { color: 'bg-emerald-600' },
  Línea: { color: 'bg-slate-500' },
  Receptor: { color: 'bg-amber-500' },
};

const awayPositionConfig: Record<PlayerPosition, { color: string; }> = {
  Blitzer: { color: 'bg-purple-700' },
  Lanzador: { color: 'bg-indigo-600' },
  Corredor: { color: 'bg-teal-600' },
  Línea: { color: 'bg-gray-600' },
  Receptor: { color: 'bg-pink-600' },
};

interface BoardToken extends Token {
    teamId: 'home' | 'away';
    playerData?: ManagedPlayer;
}

interface GameBoardProps {
  managedTeams: ManagedTeam[];
}

const GameBoard: React.FC<GameBoardProps> = ({ managedTeams }) => {
  const [gameState, setGameState] = useState<'setup' | 'hosting' | 'joining' | 'playing'>('setup');
  
  const [selectedHomeId, setSelectedHomeId] = useState<string | null>(null);
  const [selectedAwayId, setSelectedAwayId] = useState<string | null>(null);

  const homeTeam = useMemo(() => managedTeams.find(t => t.id === selectedHomeId) || null, [selectedHomeId, managedTeams]);
  const awayTeam = useMemo(() => managedTeams.find(t => t.id === selectedAwayId) || null, [selectedAwayId, managedTeams]);

  const [tokens, setTokens] = useState<BoardToken[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<ManagedPlayer | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  
  const fieldRef = useRef<HTMLDivElement>(null);
  const draggedTokenRef = useRef<{ id: number } | null>(null);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);
  const scannerContainerRef = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<any>(null);

  useEffect(() => {
    if (isInviteModalOpen && qrCanvasRef.current && homeTeam) {
        const shareableTeam = {
            n: homeTeam.name,
            rN: homeTeam.rosterName,
            t: homeTeam.treasury,
            rr: homeTeam.rerolls,
            df: homeTeam.dedicatedFans,
            ch: homeTeam.cheerleaders,
            ac: homeTeam.assistantCoaches,
            ap: homeTeam.apothecary,
            pl: homeTeam.players.map(p => ({
                p: p.position,
                cN: p.customName,
                s: p.spp,
                gS: p.gainedSkills,
                lI: p.lastingInjuries,
            }))
        };
        const teamJson = JSON.stringify(shareableTeam);
        QRCode.toCanvas(qrCanvasRef.current, teamJson, { width: 256, margin: 2, errorCorrectionLevel: 'L' }, (error: any) => {
          if (error) console.error(error);
        });
    }
  }, [isInviteModalOpen, homeTeam]);

  useEffect(() => {
    if (gameState === 'joining' && scannerContainerRef.current) {
        scannerRef.current = new Html5Qrcode(scannerContainerRef.current.id);
        scannerRef.current.start(
            { facingMode: "environment" }, { fps: 10, qrbox: { width: 250, height: 250 } },
            (decodedText: string) => {
                if (scannerRef.current?.isScanning) {
                    scannerRef.current.stop();
                }
                try {
                    const parsedTeam = JSON.parse(decodedText);
                    const isNewFormat = 'n' in parsedTeam && 'rN' in parsedTeam;
                    
                    const teamName = isNewFormat ? parsedTeam.n : parsedTeam.name;
                    const rosterName = isNewFormat ? parsedTeam.rN : parsedTeam.rosterName;

                    if (!teamName || !rosterName) {
                        throw new Error("El código QR no contiene un equipo válido.");
                    }

                    const baseTeam = teamsData.find(t => t.name === rosterName);
                    if (!baseTeam) {
                        throw new Error(`Facción "${rosterName}" no encontrada.`);
                    }

                    const playersData = isNewFormat ? parsedTeam.pl : parsedTeam.players;
                    const fullPlayers: ManagedPlayer[] = playersData.map((p: any, i: number) => {
                        const position = isNewFormat ? p.p : p.position;
                        const basePlayer = baseTeam.roster.find(bp => bp.position === position);
                        if (!basePlayer) throw new Error(`Jugador base para la posición "${position}" no encontrado.`);

                        return {
                            ...basePlayer,
                            id: Date.now() + i,
                            customName: (isNewFormat ? p.cN : p.customName) || basePlayer.position,
                            spp: (isNewFormat ? p.s : p.spp) || 0,
                            gainedSkills: (isNewFormat ? p.gS : p.gainedSkills) || [],
                            lastingInjuries: (isNewFormat ? p.lI : p.lastingInjuries) || [],
                        };
                    });

                    const importedTeam: ManagedTeam = {
                        name: teamName,
                        rosterName: rosterName,
                        treasury: (isNewFormat ? parsedTeam.t : parsedTeam.treasury) || 0,
                        rerolls: (isNewFormat ? parsedTeam.rr : parsedTeam.rerolls) || 0,
                        dedicatedFans: (isNewFormat ? parsedTeam.df : parsedTeam.dedicatedFans) || 1,
                        cheerleaders: (isNewFormat ? parsedTeam.ch : parsedTeam.cheerleaders) || 0,
                        assistantCoaches: (isNewFormat ? parsedTeam.ac : parsedTeam.assistantCoaches) || 0,
                        apothecary: (isNewFormat ? parsedTeam.ap : parsedTeam.apothecary) || false,
                        players: fullPlayers,
                    };
                    
                    const importedTeamWithId = { ...importedTeam, id: `imported_${Date.now()}`};
                    setSelectedAwayId(importedTeamWithId.id);
                    setGameState('hosting');
                } catch (e: any) {
                    setScanError(`Error al procesar el código QR: ${e.message}`);
                }
            }, () => {} 
        ).catch((err: any) => {
            setScanError(`Error al iniciar la cámara: ${err}. Es posible que necesites dar permisos en tu navegador.`);
        });
    }
    return () => { if (scannerRef.current?.isScanning) { scannerRef.current.stop().catch((e:any) => {}); }};
  }, [gameState]);


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

  const loadTeamToBoard = (team: ManagedTeam, teamId: 'home' | 'away') => {
    const playersOnField = team.players.filter(p => !(p.isBenched ?? false));
    const newTokens: BoardToken[] = playersOnField.map((player, index) => {
        const yPos = teamId === 'home' 
            ? GRID_ROWS - 5 + Math.floor(index / (Math.floor(GRID_COLS/2)-1))
            : 4 - Math.floor(index / (Math.floor(GRID_COLS/2)-1));
        return {
            id: player.id + (teamId === 'away' ? 999999 : 0),
            position: mapPositionToType(player.position),
            x: 2 + (index % (Math.floor(GRID_COLS/2)-1)) * 2,
            y: yPos,
            playerData: player,
            teamId: teamId
        }
    });
    setTokens(prev => [...prev.filter(t => t.teamId !== teamId), ...newTokens]);
  };
  
  const handleSelectHomeTeam = (teamId: string) => {
    setSelectedHomeId(teamId);
    if (teamId === selectedAwayId) {
      setSelectedAwayId(null);
    }
  };
  
  const handleSelectAwayTeam = (teamId: string) => {
    setSelectedAwayId(teamId);
    if (teamId === selectedHomeId) {
        setSelectedHomeId(null);
    }
  };

  const handleDragStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>, id: number) => { e.preventDefault(); const clickedToken = tokens.find(t => t.id === id); if (clickedToken) setSelectedPlayer(clickedToken.playerData || null); draggedTokenRef.current = { id }; };
  const handleDragMove = (e: MouseEvent | TouchEvent) => { if (!draggedTokenRef.current || !fieldRef.current) return; if (e.cancelable) e.preventDefault(); const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX; const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY; const fieldRect = fieldRef.current.getBoundingClientRect(); const x = clientX - fieldRect.left; const y = clientY - fieldRect.top; const colWidth = fieldRect.width / GRID_COLS; const rowHeight = fieldRect.height / GRID_ROWS; let gridX = Math.floor(x / colWidth); let gridY = Math.floor(y / rowHeight); gridX = Math.max(0, Math.min(GRID_COLS - 1, gridX)); gridY = Math.max(0, Math.min(GRID_ROWS - 1, gridY)); setTokens(currentTokens => currentTokens.map(token => token.id === draggedTokenRef.current?.id ? { ...token, x: gridX, y: gridY } : token)); };
  const handleDragEnd = () => { draggedTokenRef.current = null; };

  const renderSetup = () => (
    <div className="text-center p-8 max-w-md mx-auto">
        <h2 className="text-3xl font-bold text-amber-400 mb-4">Modo Versus</h2>
        <p className="text-slate-400 mb-8">Crea una partida para que un amigo se una, o únete a la partida de un amigo escaneando su código QR.</p>
        <div className="space-y-4">
            <button onClick={() => setGameState('hosting')} className="w-full bg-amber-500 text-slate-900 font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-amber-400">Crear Partida</button>
            <div className="relative flex py-2 items-center"><div className="flex-grow border-t border-slate-600"></div><span className="flex-shrink mx-4 text-slate-400">O</span><div className="flex-grow border-t border-slate-600"></div></div>
            <button onClick={() => setGameState('joining')} className="w-full flex items-center justify-center gap-2 bg-sky-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-sky-500"><QrCodeIcon/> Unirse a Partida</button>
        </div>
    </div>
  );

  const renderHosting = () => {
    const availableHomeTeams = managedTeams.filter(t => t.id !== selectedAwayId);
    const availableAwayTeams = managedTeams.filter(t => t.id !== selectedHomeId);
    
    return (
        <div className="p-4 max-w-2xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-amber-400 text-center">Configurar Equipos</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {/* Home Team Selection */}
                <div className="bg-slate-900/70 p-4 rounded-lg border border-sky-500">
                    <h3 className="text-lg font-semibold text-sky-400 mb-4">Equipo Local</h3>
                    {homeTeam ? (
                         <div className="text-slate-300">
                            <p className="font-bold text-lg">{homeTeam.name}</p>
                            <p className="text-sm text-slate-400">{homeTeam.rosterName}</p>
                            <button onClick={() => setSelectedHomeId(null)} className="text-xs text-amber-400 hover:underline mt-2">Cambiar</button>
                        </div>
                    ) : (
                        managedTeams.length > 0 ? (
                            <select value={selectedHomeId || ""} onChange={e => handleSelectHomeTeam(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded-md py-2 px-3 text-white focus:ring-amber-500 focus:border-amber-500">
                                <option value="" disabled>Selecciona tu equipo...</option>
                                {availableHomeTeams.map(team => <option key={team.id} value={team.id!}>{team.name}</option>)}
                            </select>
                        ) : <p className="text-slate-400">No tienes equipos creados.</p>
                    )}
                </div>

                {/* Away Team Section */}
                <div className="bg-slate-900/70 p-4 rounded-lg border border-red-500">
                    <h3 className="text-lg font-semibold text-red-400 mb-4">Equipo Visitante</h3>
                    {awayTeam ? (
                        <div className="text-slate-300">
                            <p className="font-bold text-lg">{awayTeam.name}</p>
                            <p className="text-sm text-slate-400">{awayTeam.rosterName}</p>
                            <button onClick={() => setSelectedAwayId(null)} className="text-xs text-amber-400 hover:underline mt-2">Cambiar</button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {availableAwayTeams.length > 0 ? (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Seleccionar oponente local</label>
                                        <select 
                                            value={selectedAwayId || ""}
                                            onChange={e => handleSelectAwayTeam(e.target.value)} 
                                            className="w-full bg-slate-800 border border-slate-600 rounded-md py-2 px-3 text-white focus:ring-amber-500 focus:border-amber-500"
                                        >
                                            <option value="" disabled>Elige un oponente...</option>
                                            {availableAwayTeams.map(team => <option key={team.id} value={team.id!}>{team.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="relative flex py-1 items-center">
                                        <div className="flex-grow border-t border-slate-600"></div>
                                        <span className="flex-shrink mx-4 text-slate-400 text-xs">O</span>
                                        <div className="flex-grow border-t border-slate-600"></div>
                                    </div>
                                </>
                            ) : null}
                            
                            <div className="text-center">
                                 <button onClick={() => { if(homeTeam) { setIsInviteModalOpen(true); } else { alert("Selecciona primero tu equipo local para generar la invitación."); } }} className="bg-teal-600 text-white font-bold py-2 px-4 rounded-md shadow-md hover:bg-teal-500 text-sm">
                                    Invitar Oponente (QR)
                                 </button>
                                 {availableAwayTeams.length === 0 && homeTeam && (
                                    <p className="text-xs text-slate-400 mt-2">No tienes otros equipos locales. Invita a un amigo con QR o crea otro equipo.</p>
                                 )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {homeTeam && awayTeam && (
                <div className="text-center mt-6">
                    <button onClick={() => { loadTeamToBoard(homeTeam, 'home'); loadTeamToBoard(awayTeam, 'away'); setGameState('playing'); }} className="w-full max-w-sm bg-green-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-green-500 transition-colors">
                        ¡Comenzar Partido!
                    </button>
                </div>
            )}

            <div className="text-center"><button onClick={() => { setGameState('setup'); setSelectedHomeId(null); setSelectedAwayId(null); }} className="text-amber-400 hover:underline mt-4">Volver</button></div>
        </div>
    );
  };
  
  const renderJoining = () => (
    <div className="p-4 max-w-md mx-auto text-center">
        <button onClick={() => setGameState('setup')} className="text-amber-400 hover:underline mb-4">&larr; Volver</button>
        <h2 className="text-2xl font-bold text-amber-400 mb-4">Unirse a Partida</h2>
        <p className="text-slate-400 mb-6">Escanea el código QR de tu amigo para cargar su equipo.</p>
        {scanError && <p className="text-red-400 bg-red-900/50 p-3 rounded-md mb-4">{scanError}</p>}
        <div id="qr-reader" ref={scannerContainerRef} className="w-full aspect-square bg-slate-900 rounded-lg overflow-hidden border-2 border-slate-700"></div>
    </div>
  );

  const renderPlaying = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-amber-400 mb-2">Campo de Juego</h2>
        <div className="flex justify-center items-center gap-4 text-sm">
            <span className="text-sky-400 font-bold">{homeTeam?.name || 'Local'}</span>
            <span className="text-slate-400">vs</span>
            <span className="text-red-400 font-bold">{awayTeam?.name || 'Visitante'}</span>
        </div>
      </div>

      <div ref={fieldRef} className="relative w-full max-w-4xl mx-auto aspect-[15/26] bg-slate-900 rounded-lg shadow-xl border-2 border-slate-700 select-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform rotate-90" style={{ width: '173.33%', height: '57.7%' }}><img src={fieldImage} alt="Campo de Blood Bowl" className="w-full h-full object-cover"/></div>
        <div className="absolute inset-0 grid pointer-events-none" style={{ gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`, gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)` }}>
            {Array.from({ length: GRID_ROWS * GRID_COLS }).map((_, i) => (<div key={i} className="w-full h-full border border-black/20"></div>))}
        </div>

        {tokens.map((token, index) => {
            const config = token.teamId === 'home' ? homePositionConfig : awayPositionConfig;
            return (
              <div key={token.id} onMouseDown={(e) => handleDragStart(e, token.id)} onTouchStart={(e) => handleDragStart(e, token.id)} className={`absolute flex items-center justify-center w-[6.66%] h-[3.84%] ${config[token.position]?.color || 'bg-gray-400'} text-white font-bold text-xs border-2 border-white rounded-full shadow-lg cursor-grab active:cursor-grabbing`} style={{ left: `${((token.x + 0.5) / GRID_COLS) * 100}%`, top: `${((token.y + 0.5) / GRID_ROWS) * 100}%`, transform: 'translate(-50%, -50%)', touchAction: 'none' }}>
                {index + 1}
              </div>
            );
        })}
      </div>
       {selectedPlayer && (
        <div className="mt-6 bg-slate-900/70 p-4 rounded-lg border border-slate-700 animate-fade-in max-w-4xl mx-auto">
          <div className="flex justify-between items-start"><h3 className="text-xl font-bold text-amber-400">{selectedPlayer.customName}</h3><button onClick={() => setSelectedPlayer(null)} className="text-slate-400 hover:text-white p-1 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button></div>
          <p className="text-slate-400 text-sm">{selectedPlayer.position}</p>
        </div>
      )}
      <div className="text-center"><button onClick={() => { setGameState('setup'); setSelectedHomeId(null); setSelectedAwayId(null); setTokens([]); }} className="text-amber-400 hover:underline mt-4">Reiniciar Partida</button></div>
    </div>
  );

  return (
    <div className="animate-fade-in-slow">
      {gameState === 'setup' && renderSetup()}
      {gameState === 'hosting' && renderHosting()}
      {gameState === 'joining' && renderJoining()}
      {gameState === 'playing' && renderPlaying()}

      {isInviteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => setIsInviteModalOpen(false)}>
            <div className="bg-slate-800 p-6 rounded-lg shadow-xl border border-slate-700" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-amber-400 mb-4 text-center">Invitar a Oponente</h3>
                <canvas ref={qrCanvasRef}></canvas>
                <p className="text-xs text-slate-400 mt-2 text-center">Pídele a tu amigo que escanee este código.</p>
            </div>
        </div>
      )}

      <style>{`@keyframes fade-in-slow { from { opacity: 0; } to { opacity: 1; } } .animate-fade-in-slow { animation: fade-in-slow 0.5s ease-out forwards; }`}</style>
    </div>
  );
};

export default GameBoard;
