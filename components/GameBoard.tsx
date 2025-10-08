
import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { Token, PlayerPosition, ManagedTeam, ManagedPlayer } from '../types';
import { fieldImage } from '../data/fieldImage';
import QrCodeIcon from './icons/QrCodeIcon';
import { teamsData } from '../data/teams';
import ShieldCheckIcon from './icons/ShieldCheckIcon';
import BallIcon from './icons/BallIcon';
import { passChartGrid, passTypeDetails } from '../data/passChart';
import PassRuleModal from './PassRuleModal';


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

type GameState = 'setup' | 'select_home' | 'select_away' | 'scanning_qr' | 'playing';
type ActionMode = null | 'passing';

const GameBoard: React.FC<GameBoardProps> = ({ managedTeams }) => {
  const [gameState, setGameState] = useState<GameState>('setup');
  
  const [selectedHomeId, setSelectedHomeId] = useState<string | null>(null);
  const [selectedAwayId, setSelectedAwayId] = useState<string | null>(null);
  const [importedAwayTeam, setImportedAwayTeam] = useState<ManagedTeam | null>(null);

  const homeTeam = useMemo(() => managedTeams.find(t => t.id === selectedHomeId) || null, [selectedHomeId, managedTeams]);
  const awayTeam = useMemo(() => 
    managedTeams.find(t => t.id === selectedAwayId) || (importedAwayTeam?.id === selectedAwayId ? importedAwayTeam : null), 
    [selectedAwayId, managedTeams, importedAwayTeam]
  );

  const [tokens, setTokens] = useState<BoardToken[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<ManagedPlayer | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  const [ballPosition, setBallPosition] = useState({ x: Math.floor(GRID_COLS / 2), y: Math.floor(GRID_ROWS / 2) });
  const [ballCarrierId, setBallCarrierId] = useState<number | null>(null);
  const [contextMenu, setContextMenu] = useState<{ visible: boolean, x: number, y: number, playerId: number | null }>({ visible: false, x: 0, y: 0, playerId: null });
  
  const [actionMode, setActionMode] = useState<ActionMode>(null);
  const [activePlayerId, setActivePlayerId] = useState<number | null>(null);
  const [passTargetInfo, setPassTargetInfo] = useState<{ x: number, y: number, type: string, modifier: number } | null>(null);
  const [isPassRuleModalVisible, setIsPassRuleModalVisible] = useState(false);
  const [passResult, setPassResult] = useState<string | null>(null);

  const fieldRef = useRef<HTMLDivElement>(null);
  const draggedItemRef = useRef<{ type: 'ball' | 'token' | null, id: number | null }>({ type: null, id: null });
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
  
  const handleStartGame = (hTeam: ManagedTeam, aTeam: ManagedTeam) => {
    loadTeamToBoard(hTeam, 'home');
    loadTeamToBoard(aTeam, 'away');
    setGameState('playing');
  };
  
  useEffect(() => {
    if (gameState === 'scanning_qr' && scannerContainerRef.current) {
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
                    if (homeTeam) {
                        setImportedAwayTeam(importedTeamWithId);
                        setSelectedAwayId(importedTeamWithId.id);
                        handleStartGame(homeTeam, importedTeamWithId);
                    } else {
                        throw new Error("No se ha seleccionado equipo local.");
                    }
                } catch (e: any) {
                    setScanError(`Error al procesar el código QR: ${e.message}`);
                    setGameState('select_away');
                }
            }, () => {} 
        ).catch((err: any) => {
            setScanError(`Error al iniciar la cámara: ${err}. Es posible que necesites dar permisos en tu navegador.`);
            setGameState('select_away');
        });
    }
    return () => { if (scannerRef.current?.isScanning) { scannerRef.current.stop().catch((e:any) => {}); }};
  }, [gameState, homeTeam]);

  useEffect(() => {
    const handleGlobalDragMove = (e: MouseEvent | TouchEvent) => handleDragMove(e);
    const handleGlobalDragEnd = (e: MouseEvent | TouchEvent) => handleDragEnd(e);
    const handleGlobalClick = () => setContextMenu(prev => ({ ...prev, visible: false }));

    document.addEventListener('mousemove', handleGlobalDragMove);
    document.addEventListener('mouseup', handleGlobalDragEnd);
    document.addEventListener('touchmove', handleGlobalDragMove as any, { passive: false });
    document.addEventListener('touchend', handleGlobalDragEnd);
    if (contextMenu.visible) {
        document.addEventListener('click', handleGlobalClick);
    }
    
    return () => {
        document.removeEventListener('mousemove', handleGlobalDragMove);
        document.removeEventListener('mouseup', handleGlobalDragEnd);
        document.removeEventListener('touchmove', handleGlobalDragMove as any);
        document.removeEventListener('touchend', handleGlobalDragEnd);
        document.removeEventListener('click', handleGlobalClick);
    };
  }, [contextMenu.visible, ballCarrierId, ballPosition.x, ballPosition.y]);

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
            ? GRID_ROWS - 5 - Math.floor(index / (Math.floor(GRID_COLS/2)-1))
            : 4 + Math.floor(index / (Math.floor(GRID_COLS/2)-1));
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

  const handleDragStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>, id: number) => { 
    e.preventDefault(); 
    setContextMenu(prev => ({...prev, visible: false}));
    const clickedToken = tokens.find(t => t.id === id); 
    if (clickedToken) {
        setSelectedPlayer(clickedToken.playerData || null);
    }
    draggedItemRef.current = { type: 'token', id }; 
  };
  
  const handleBallDragStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu(prev => ({...prev, visible: false}));
    if (ballCarrierId) setBallCarrierId(null);
    draggedItemRef.current = { type: 'ball', id: null };
  };

  const handleDragMove = (e: MouseEvent | TouchEvent) => { 
    if (!draggedItemRef.current.type || !fieldRef.current) return; 
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
    
    if (draggedItemRef.current.type === 'token') {
        setTokens(currentTokens => currentTokens.map(token => token.id === draggedItemRef.current.id ? { ...token, x: gridX, y: gridY } : token)); 
    } else if (draggedItemRef.current.type === 'ball') {
        setBallPosition({ x: gridX, y: gridY });
    }
  };

  const handleDragEnd = (e: MouseEvent | TouchEvent) => {
    const { type, id } = draggedItemRef.current;
    const fieldNode = fieldRef.current;
  
    if (!type || !fieldNode) {
      draggedItemRef.current = { type: null, id: null };
      return;
    }
  
    const clientX = 'changedTouches' in e && e.changedTouches[0] ? e.changedTouches[0].clientX : (e as MouseEvent).clientX;
    const clientY = 'changedTouches' in e && e.changedTouches[0] ? e.changedTouches[0].clientY : (e as MouseEvent).clientY;

    if (clientX === undefined || clientY === undefined) {
        draggedItemRef.current = { type: null, id: null };
        return;
    }

    const fieldRect = fieldNode.getBoundingClientRect();
    const x = clientX - fieldRect.left;
    const y = clientY - fieldRect.top;
    const colWidth = fieldRect.width / GRID_COLS;
    const rowHeight = fieldRect.height / GRID_ROWS;
    let gridX = Math.floor(x / colWidth);
    let gridY = Math.floor(y / rowHeight);
  
    gridX = Math.max(0, Math.min(GRID_COLS - 1, gridX));
    gridY = Math.max(0, Math.min(GRID_ROWS - 1, gridY));
  
    if (type === 'ball') {
      const carrier = tokens.find(t => t.x === gridX && t.y === gridY);
      if (carrier) {
        setBallCarrierId(carrier.id);
      } else {
        setBallPosition({ x: gridX, y: gridY });
      }
    } else if (type === 'token' && id !== null) {
        setTokens(currentTokens => {
            return currentTokens.map(token => token.id === id ? { ...token, x: gridX, y: gridY } : token);
        });
        if (!ballCarrierId && gridX === ballPosition.x && gridY === ballPosition.y) {
            setBallCarrierId(id);
        }
    }
  
    draggedItemRef.current = { type: null, id: null };
  };

  const handleContextMenu = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ visible: true, x: e.clientX, y: e.clientY, playerId: id });
  };
  const closeContextMenu = () => setContextMenu(prev => ({...prev, visible: false}));

  const handleMenuAction = (action: string) => {
    closeContextMenu();
    if (action === "Pasar") {
        if (contextMenu.playerId) {
            if (contextMenu.playerId === ballCarrierId) {
                setActivePlayerId(contextMenu.playerId);
                setActionMode('passing');
                setIsPassRuleModalVisible(true);
                return;
            } else {
                alert("Este jugador no tiene el balón para pasar.");
            }
        }
    }
  };

  const handleGridMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (actionMode !== 'passing' || !activePlayerId || !fieldRef.current) return;
    const passer = tokens.find(t => t.id === activePlayerId);
    if (!passer) return;

    const fieldRect = fieldRef.current.getBoundingClientRect();
    const x = e.clientX - fieldRect.left;
    const y = e.clientY - fieldRect.top;
    const colWidth = fieldRect.width / GRID_COLS;
    const rowHeight = fieldRect.height / GRID_ROWS;
    const gridX = Math.max(0, Math.min(GRID_COLS - 1, Math.floor(x / colWidth)));
    const gridY = Math.max(0, Math.min(GRID_ROWS - 1, Math.floor(y / rowHeight)));

    const dx = Math.abs(gridX - passer.x);
    const dy = Math.abs(gridY - passer.y);

    if (dx >= 14 || dy >= 14 || (dx === 0 && dy === 0)) {
        setPassTargetInfo(null);
        return;
    }

    const typeKey = passChartGrid[dy][dx];
    const info = passTypeDetails[typeKey];
    let modifier = 0;
    if (info.name === 'Pase corto') modifier = -1;
    if (info.name === 'Pase largo') modifier = -2;
    if (info.name === 'Bomba larga') modifier = -3;

    setPassTargetInfo({ x: gridX, y: gridY, type: info.name, modifier });
  };
  
  const handleGridClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (actionMode !== 'passing' || !activePlayerId || !fieldRef.current) {
        setContextMenu(prev => ({ ...prev, visible: false }));
        return;
      };
      e.stopPropagation();

      const fieldRect = fieldRef.current.getBoundingClientRect();
      const x = e.clientX - fieldRect.left;
      const y = e.clientY - fieldRect.top;
      const colWidth = fieldRect.width / GRID_COLS;
      const rowHeight = fieldRect.height / GRID_ROWS;
      const gridX = Math.max(0, Math.min(GRID_COLS - 1, Math.floor(x / colWidth)));
      const gridY = Math.max(0, Math.min(GRID_ROWS - 1, Math.floor(y / rowHeight)));

      const passer = tokens.find(t => t.id === activePlayerId);
      if (!passer || !passer.playerData?.stats.PS || passer.playerData.stats.PS === '-') {
        setActionMode(null);
        setActivePlayerId(null);
        setPassTargetInfo(null);
        return;
      }
  
      const dx = Math.abs(gridX - passer.x);
      const dy = Math.abs(gridY - passer.y);
  
      if (dx >= 14 || dy >= 14 || (dx === 0 && dy === 0)) {
          setActionMode(null);
          setActivePlayerId(null);
          setPassTargetInfo(null);
          return;
      }
  
      const typeKey = passChartGrid[dy][dx];
      const info = passTypeDetails[typeKey];
      let modifier = 0;
      if (info.name === 'Pase corto') modifier = -1;
      if (info.name === 'Pase largo') modifier = -2;
      if (info.name === 'Bomba larga') modifier = -3;
  
      const roll = Math.floor(Math.random() * 6) + 1;
      const targetPS = parseInt(passer.playerData.stats.PS);
      const finalResult = roll + modifier;
      const isSuccess = finalResult >= targetPS;
  
      let outcomeMessage = '';
  
      const scatterBall = (fromX: number, fromY: number) => {
          const direction = Math.floor(Math.random() * 8);
          const directions = [[0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]];
          let newX = fromX + directions[direction][0];
          let newY = fromY + directions[direction][1];
          newX = Math.max(0, Math.min(GRID_COLS - 1, newX));
          newY = Math.max(0, Math.min(GRID_ROWS - 1, newY));
          
          const landingSpotPlayer = tokens.find(t => t.x === newX && t.y === newY);
          if (landingSpotPlayer) {
            setBallCarrierId(landingSpotPlayer.id);
          } else {
            setBallPosition({ x: newX, y: newY });
            setBallCarrierId(null);
          }
      };
  
      if (roll === 1) {
          outcomeMessage = `¡Balón Perdido! Tirada: 1. El balón rebota desde ${passer.playerData.customName}. ¡Cambio de turno!`;
          scatterBall(passer.x, passer.y);
      } else if (roll === 6 || isSuccess) {
          outcomeMessage = `¡Pase Preciso! Tirada: ${roll} (Mod: ${modifier}) vs PS ${targetPS}+.`;
          const receiver = tokens.find(t => t.x === gridX && t.y === gridY);
          if (receiver) {
              outcomeMessage += ` Atrapado por ${receiver.playerData?.customName}.`;
              setBallCarrierId(receiver.id);
          } else {
              setBallPosition({ x: gridX, y: gridY });
              setBallCarrierId(null);
          }
      } else { // Imprecise
          if (finalResult <= 1) {
              outcomeMessage = `¡Pase MUY Impreciso! Tirada: ${roll} (Mod: ${modifier}, Final: ${finalResult}) vs PS ${targetPS}+. El balón se desvía desde el lanzador.`;
              scatterBall(passer.x, passer.y);
          } else {
              outcomeMessage = `¡Pase Impreciso! Tirada: ${roll} (Mod: ${modifier}, Final: ${finalResult}) vs PS ${targetPS}+. El balón se desvía desde el objetivo.`;
              scatterBall(gridX, gridY);
          }
      }
  
      setPassResult(outcomeMessage);
      setTimeout(() => setPassResult(null), 5000);
  
      setActionMode(null);
      setActivePlayerId(null);
      setPassTargetInfo(null);
  };

  const renderSetup = () => (
    <div className="text-center p-8 max-w-md mx-auto">
        <h2 className="text-3xl font-bold text-amber-400 mb-4">Configurar Partido</h2>
        <p className="text-slate-400 mb-8">Selecciona tu equipo y el de tu oponente, ya sea otro de tus equipos o el de un amigo mediante código QR.</p>
        <button 
            onClick={() => {
                if (managedTeams.length === 0) {
                    alert("Debes crear al menos un equipo en el 'Gestor de Equipo' para poder jugar.");
                    return;
                }
                setGameState('select_home');
            }} 
            className="w-full bg-amber-500 text-slate-900 font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-amber-400"
        >
            Comenzar Configuración
        </button>
    </div>
  );

  const renderSelectHome = () => (
    <div className="text-center p-4 sm:p-8 max-w-md mx-auto">
        <h2 className="text-3xl font-bold text-amber-400 mb-4">Paso 1: Elige tu Equipo</h2>
        <div className="space-y-3">
            {managedTeams.map(team => (
                <button 
                    key={team.id} 
                    onClick={() => { 
                        setSelectedHomeId(team.id!); 
                        setGameState('select_away'); 
                    }} 
                    className="w-full flex items-center gap-4 text-left bg-slate-700/50 p-4 rounded-lg shadow-md hover:bg-slate-700 hover:text-white transition-colors"
                >
                    {team.crestImage ? (
                        <img src={team.crestImage} alt="Escudo" className="w-12 h-12 rounded-full object-cover bg-slate-900" />
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0">
                            <ShieldCheckIcon className="w-8 h-8 text-slate-600" />
                        </div>
                    )}
                    <div className="flex-grow min-w-0">
                        <p className="font-semibold truncate">{team.name}</p>
                        <p className="text-xs text-slate-400 truncate">{team.rosterName}</p>
                    </div>
                </button>
            ))}
        </div>
        <button onClick={() => setGameState('setup')} className="text-amber-400 hover:underline mt-6 text-sm">&larr; Volver</button>
    </div>
  );

  const renderSelectAway = () => {
      const availableOpponents = managedTeams.filter(t => t.id !== selectedHomeId);
      return (
          <div className="p-4 max-w-2xl mx-auto space-y-6">
              <button onClick={() => { setSelectedHomeId(null); setSelectedAwayId(null); setImportedAwayTeam(null); setGameState('select_home'); }} className="text-amber-400 hover:underline text-sm">&larr; Cambiar equipo local</button>
              <h2 className="text-2xl font-bold text-amber-400 text-center">Paso 2: Elige al Oponente</h2>
              <div className="bg-slate-900/70 p-4 rounded-lg border border-sky-500 text-center">
                  <p className="text-slate-400">Equipo Local</p>
                  <p className="font-bold text-lg text-sky-400">{homeTeam?.name}</p>
              </div>

              <div className="bg-slate-900/70 p-4 rounded-lg border border-red-500">
                  <h3 className="text-lg font-semibold text-red-400 mb-4">Oponente Local</h3>
                  {availableOpponents.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {availableOpponents.map(team => (
                               <button 
                                  key={team.id} 
                                  onClick={() => {
                                      if (homeTeam) {
                                          setSelectedAwayId(team.id!);
                                          handleStartGame(homeTeam, team);
                                      }
                                  }}
                                  className="w-full text-left bg-slate-700/50 p-3 rounded-md hover:bg-slate-700 transition-colors"
                              >
                                <p className="font-semibold text-white">{team.name}</p>
                                <p className="text-xs text-slate-400">{team.rosterName}</p>
                              </button>
                          ))}
                      </div>
                  ) : (
                      <p className="text-slate-400 text-sm text-center">No tienes otros equipos locales para seleccionar.</p>
                  )}
              </div>

              <div className="bg-slate-900/70 p-4 rounded-lg border border-slate-600">
                  <h3 className="text-lg font-semibold text-slate-300 mb-4 text-center">Oponente Remoto</h3>
                  <div className="flex justify-center gap-4">
                      <button onClick={() => setIsInviteModalOpen(true)} className="bg-teal-600 text-white font-bold py-2 px-4 rounded-md shadow-md hover:bg-teal-500 text-sm">Invitar (Mostrar QR)</button>
                      <button onClick={() => setGameState('scanning_qr')} className="bg-sky-600 text-white font-bold py-2 px-4 rounded-md shadow-md hover:bg-sky-500 text-sm">Unirse (Escanear QR)</button>
                  </div>
              </div>
          </div>
      );
  };
  
  const renderScanningQR = () => (
    <div className="p-4 max-w-md mx-auto text-center">
        <button onClick={() => setGameState('select_away')} className="text-amber-400 hover:underline mb-4">&larr; Volver</button>
        <h2 className="text-2xl font-bold text-amber-400 mb-4">Unirse a Partida</h2>
        <p className="text-slate-400 mb-6">Escanea el código QR de tu amigo para cargar su equipo.</p>
        {scanError && <p className="text-red-400 bg-red-900/50 p-3 rounded-md mb-4">{scanError}</p>}
        <div id="qr-reader" ref={scannerContainerRef} className="w-full aspect-square bg-slate-900 rounded-lg overflow-hidden border-2 border-slate-700"></div>
    </div>
  );

  const renderPlaying = () => {
      const ballCarrier = tokens.find(t => t.id === ballCarrierId);
      const ballStyle = {
          left: ballCarrier ? `${((ballCarrier.x + 0.5) / GRID_COLS) * 100}%` : `${((ballPosition.x + 0.5) / GRID_COLS) * 100}%`,
          top: ballCarrier ? `${((ballCarrier.y + 0.5) / GRID_ROWS) * 100}%` : `${((ballPosition.y + 0.5) / GRID_ROWS) * 100}%`,
          transform: ballCarrier ? 'translate(25%, -75%)' : 'translate(-50%, -50%)',
          width: ballCarrier ? '3.5%' : '4%',
          height: ballCarrier ? '2%' : '2.3%',
          zIndex: 20,
      };

      return (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-amber-400 mb-2">Campo de Juego</h2>
            <div className="flex justify-center items-center gap-4 text-sm">
                <span className="text-sky-400 font-bold">{homeTeam?.name || 'Local'}</span>
                <span className="text-slate-400">vs</span>
                <span className="text-red-400 font-bold">{awayTeam?.name || 'Visitante'}</span>
            </div>
          </div>

          <div ref={fieldRef} 
            className="relative w-full max-w-4xl mx-auto aspect-[15/26] bg-slate-900 rounded-lg shadow-xl border-2 border-slate-700 select-none overflow-hidden"
            onMouseMove={handleGridMouseMove}
            onClick={handleGridClick}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform rotate-90" style={{ width: '173.33%', height: '57.7%' }}><img src={fieldImage} alt="Campo de Blood Bowl" className="w-full h-full object-cover"/></div>
            <div className="absolute inset-0 grid pointer-events-none" style={{ gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`, gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)` }}>
                {Array.from({ length: GRID_ROWS * GRID_COLS }).map((_, i) => (<div key={i} className="w-full h-full border border-black/20"></div>))}
            </div>

            {actionMode === 'passing' && (
                <div className="absolute inset-0 grid pointer-events-none" style={{ gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`, gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)` }}>
                    {Array.from({ length: GRID_ROWS * GRID_COLS }).map((_, i) => {
                        const row = Math.floor(i / GRID_COLS);
                        const col = i % GRID_COLS;
                        if (passTargetInfo && col === passTargetInfo.x && row === passTargetInfo.y) {
                          return <div key={i} className="bg-white/30 border border-white"></div>;
                        }
                        return <div key={i} />;
                    })}
                </div>
            )}

            {tokens.map((token) => {
                const config = token.teamId === 'home' ? homePositionConfig : awayPositionConfig;
                const borderColor = token.teamId === 'home' ? 'border-sky-400' : 'border-red-500';
                
                const getPlayerNumber = () => {
                    if (!token.playerData) return '?';
                    const team = token.teamId === 'home' ? homeTeam : awayTeam;
                    const index = team?.players.findIndex(p => p.id === token.playerData!.id);
                    return (index !== undefined && index > -1) ? index + 1 : '?';
                };
                const playerNumber = getPlayerNumber();

                return (
                  <div 
                    key={token.id} 
                    onMouseDown={(e) => handleDragStart(e, token.id)} 
                    onTouchStart={(e) => handleDragStart(e, token.id)}
                    onContextMenu={(e) => handleContextMenu(e, token.id)}
                    className={`absolute flex flex-col items-center justify-center w-[6.66%] h-[3.84%] p-0.5 ${config[token.position]?.color || 'bg-gray-400'} text-white border-2 ${borderColor} rounded-full shadow-lg cursor-grab active:cursor-grabbing`} 
                    style={{ left: `${((token.x + 0.5) / GRID_COLS) * 100}%`, top: `${((token.y + 0.5) / GRID_ROWS) * 100}%`, transform: 'translate(-50%, -50%)', touchAction: 'none' }}
                  >
                    <div className="text-center leading-tight">
                        <div className="font-bold text-[10px]">#{playerNumber}</div>
                        <div className="text-[7px] truncate w-full px-1">{token.playerData?.customName}</div>
                    </div>
                  </div>
                );
            })}
             <div
                onMouseDown={handleBallDragStart}
                onTouchStart={handleBallDragStart}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing transition-all duration-100 ease-out"
                style={{ ...ballStyle }}
            >
                <BallIcon className="w-full h-full" />
            </div>
            {actionMode === 'passing' && passTargetInfo && (
                <div 
                    className="absolute pointer-events-none p-2 bg-black/70 text-white text-xs rounded-md"
                    style={{
                        left: `${(passTargetInfo.x + 0.5) / GRID_COLS * 100}%`,
                        top: `${(passTargetInfo.y + 0.5) / GRID_ROWS * 100}%`,
                        transform: 'translate(-50%, -120%)',
                    }}
                >
                    <div>{passTargetInfo.type}</div>
                    <div>Modificador: {passTargetInfo.modifier}</div>
                </div>
            )}
          </div>
           {selectedPlayer && (
            <div className="mt-6 bg-slate-900/70 p-4 rounded-lg border border-slate-700 animate-fade-in max-w-4xl mx-auto">
              <div className="flex justify-between items-start"><h3 className="text-xl font-bold text-amber-400">{selectedPlayer.customName}</h3><button onClick={() => setSelectedPlayer(null)} className="text-slate-400 hover:text-white p-1 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button></div>
              <p className="text-slate-400 text-sm">{selectedPlayer.position}</p>
            </div>
          )}
          <div className="text-center"><button onClick={() => { setGameState('setup'); setSelectedHomeId(null); setSelectedAwayId(null); setTokens([]); setImportedAwayTeam(null); setBallCarrierId(null); setBallPosition({ x: Math.floor(GRID_COLS / 2), y: Math.floor(GRID_ROWS / 2) }); }} className="text-amber-400 hover:underline mt-4">Reiniciar Partida</button></div>
        </div>
      );
  };

  const renderContent = () => {
    switch(gameState) {
      case 'setup': return renderSetup();
      case 'select_home': return renderSelectHome();
      case 'select_away': return renderSelectAway();
      case 'scanning_qr': return renderScanningQR();
      case 'playing': return renderPlaying();
      default: return renderSetup();
    }
  };

  const actions = ["Mover", "Placar", "Penetrar", "Pasar", "Entregar", "Falta"];

  return (
    <div className="animate-fade-in-slow">
      {renderContent()}

      {isInviteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => setIsInviteModalOpen(false)}>
            <div className="bg-slate-800 p-6 rounded-lg shadow-xl border border-slate-700" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-amber-400 mb-4 text-center">Invitar a Oponente</h3>
                <canvas ref={qrCanvasRef}></canvas>
                <p className="text-xs text-slate-400 mt-2 text-center">Pídele a tu amigo que escanee este código.</p>
            </div>
        </div>
      )}
      
      {contextMenu.visible && (
        <div 
            style={{ top: contextMenu.y, left: contextMenu.x }}
            className="fixed bg-slate-900 border border-slate-700 rounded-md shadow-lg z-50 py-2 w-40"
            onClick={(e) => e.stopPropagation()}
        >
            {actions.map(action => (
                <button 
                    key={action}
                    onClick={() => handleMenuAction(action)}
                    className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700"
                >
                    {action}
                </button>
            ))}
        </div>
      )}
      
      {isPassRuleModalVisible && <PassRuleModal onClose={() => setIsPassRuleModalVisible(false)} />}
      
      {passResult && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-slate-900 border border-amber-400 text-white p-4 rounded-lg shadow-lg z-[70] animate-fade-in-fast">
            {passResult}
        </div>
      )}

      <style>{`
      @keyframes fade-in-slow { from { opacity: 0; } to { opacity: 1; } } 
      .animate-fade-in-slow { animation: fade-in-slow 0.5s ease-out forwards; }
      @keyframes fade-in-fast { from { opacity: 0; } to { opacity: 1; } }
      .animate-fade-in-fast { animation: fade-in-fast 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default GameBoard;
