import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
// FIX: Imported BoardToken from types.ts to make it globally available.
import type { Token, PlayerPosition, ManagedTeam, ManagedPlayer, PlayerStatus, BoardToken } from '../types';
import { fieldImage } from '../data/fieldImage';
import QrCodeIcon from './icons/QrCodeIcon';
import { teamsData } from '../data/teams';
import ShieldCheckIcon from './icons/ShieldCheckIcon';
import BallIcon from './icons/BallIcon';
import { passChartGrid, passTypeDetails } from '../data/passChart';
import PassRuleModal from './PassRuleModal';
import BlockAssistantModal from './BlockAssistantModal';
import ZoomInIcon from './icons/ZoomInIcon';
import ZoomOutIcon from './icons/ZoomOutIcon';
import ChevronDownIcon from './icons/ChevronDownIcon';
import PlayerDetailPanel from './PlayerDetailPanel';


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

// FIX: Removed local BoardToken definition, it is now in types.ts

export interface BlockResolution {
    knockDowns: { id: number; isTurnoverSource: boolean }[];
    ballBecomesLoose: boolean;
    pushes?: any[]; // For future implementation
}


interface GameBoardProps {
  managedTeams: ManagedTeam[];
}

type GameState = 'setup' | 'select_home' | 'select_away' | 'scanning_qr' | 'playing';
type ActionMode = null | 'passing' | 'blocking';

// FIX: Defined the missing `isAdjacent` utility function to check if two tokens are adjacent on the grid. This resolves the 'Cannot find name' error.
const isAdjacent = (token1: {x:number, y:number}, token2: {x:number, y:number}): boolean => {
    return Math.abs(token1.x - token2.x) <= 1 && Math.abs(token1.y - token2.y) <= 1 && (token1.x !== token2.x || token1.y !== token2.y);
};

const cloneTeamForGame = (team: ManagedTeam): ManagedTeam => {
    // Robust deep-clone to create plain JS objects and prevent circular reference errors from Firestore objects.
    const clonedPlayers = team.players.map(p => {
        const cleanPlayer: ManagedPlayer = {
            qty: p.qty,
            position: p.position,
            cost: p.cost,
            stats: { ...p.stats },
            skills: p.skills,
            primary: p.primary,
            secondary: p.secondary,
            id: p.id,
            customName: p.customName,
            spp: p.spp,
            gainedSkills: [...p.gainedSkills],
            lastingInjuries: [...p.lastingInjuries],
            status: p.status || 'Reserva',
            statusDetail: p.statusDetail,
            isStarPlayer: p.isStarPlayer,
            sppActions: p.sppActions ? { ...p.sppActions } : {},
            isJourneyman: p.isJourneyman,
            missNextGame: p.missNextGame,
            isBenched: p.isBenched,
        };
        return cleanPlayer;
    });

    return {
        id: team.id,
        name: team.name,
        rosterName: team.rosterName,
        treasury: team.treasury,
        rerolls: team.rerolls,
        dedicatedFans: team.dedicatedFans,
        cheerleaders: team.cheerleaders,
        assistantCoaches: team.assistantCoaches,
        apothecary: team.apothecary,
        players: clonedPlayers,
        crestImage: team.crestImage,
    };
};

const passOverlayColors: Record<string, string> = {
  G: 'bg-green-600/30',
  Y: 'bg-yellow-500/30',
  O: 'bg-orange-600/30',
  B: 'bg-red-800/30',
};

const GameBoard: React.FC<GameBoardProps> = ({ managedTeams }) => {
  const [gameState, setGameState] = useState<GameState>('setup');
  
  const [selectedHomeId, setSelectedHomeId] = useState<string | null>(null);
  const [selectedAwayId, setSelectedAwayId] = useState<string | null>(null);
  const [importedAwayTeam, setImportedAwayTeam] = useState<ManagedTeam | null>(null);
  const [selectedPlayerToken, setSelectedPlayerToken] = useState<BoardToken | null>(null);

  const homeTeam = useMemo(() => {
    const team = managedTeams.find(t => t.id === selectedHomeId);
    if (!team) return null;
    return cloneTeamForGame(team);
  }, [selectedHomeId, managedTeams]);
  
  const awayTeam = useMemo(() => {
    const localTeam = managedTeams.find(t => t.id === selectedAwayId);
    if (localTeam) {
        return cloneTeamForGame(localTeam);
    }
    const imported = (importedAwayTeam?.id === selectedAwayId ? importedAwayTeam : null);
    if (imported) {
        return cloneTeamForGame(imported);
    }
    return null;
  }, [selectedAwayId, managedTeams, importedAwayTeam]);

  const [tokens, setTokens] = useState<BoardToken[]>([]);
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
  const [blockModalState, setBlockModalState] = useState<{ isOpen: boolean; attacker: BoardToken | null; defender: BoardToken | null }>({ isOpen: false, attacker: null, defender: null });
  const [turnoverMessage, setTurnoverMessage] = useState<string | null>(null);
  
  // New UI states
  const [score, setScore] = useState({ home: 0, away: 0 });
  const [rerolls, setRerolls] = useState({ home: 0, away: 0 });
  const [turn, setTurn] = useState(1);
  const [half, setHalf] = useState(1);
  const [isZoomedOut, setIsZoomedOut] = useState(false);
  const [dugoutsVisible, setDugoutsVisible] = useState({ home: true, away: true });


  const fieldRef = useRef<HTMLDivElement>(null);
  const draggedItemRef = useRef<{ type: 'ball' | 'token' | null, id: number | null }>({ type: null, id: null });
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);
  const scannerContainerRef = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<any>(null);
  const isDraggingRef = useRef(false);

  const activePlayer = useMemo(() => tokens.find(t => t.id === activePlayerId), [activePlayerId, tokens]);

  const resetActionMode = useCallback(() => {
    setActionMode(null);
    setActivePlayerId(null);
    setPassTargetInfo(null);
    setIsPassRuleModalVisible(false);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            resetActionMode();
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
    };
  }, [resetActionMode]);

  const validBlockTargets = useMemo(() => {
      if (actionMode !== 'blocking' || !activePlayer) return [];
      
      const targets: {x: number, y: number}[] = [];
      const { x, y } = activePlayer;
      const adjacentCoords = [
          { x: x - 1, y: y - 1 }, { x, y: y - 1 }, { x: x + 1, y: y - 1 },
          { x: x - 1, y },                     { x: x + 1, y },
          { x: x - 1, y: y + 1 }, { x, y: y + 1 }, { x: x + 1, y: y + 1 },
      ];

      for (const coord of adjacentCoords) {
          const opponent = tokens.find(t => t.x === coord.x && t.y === coord.y && t.teamId !== activePlayer.teamId);
          if (opponent) {
              targets.push(coord);
          }
      }
      return targets;
  }, [actionMode, activePlayer, tokens]);

  const mapPositionToType = (position: string): PlayerPosition => {
      const lowerPos = position.toLowerCase();
      if (lowerPos.includes('blitzer') || lowerPos.includes('wardancer') || lowerPos.includes('witch') || lowerPos.includes('assassin') || lowerPos.includes('slayer')) return 'Blitzer';
      if (lowerPos.includes('thrower') || lowerPos.includes('lanzador')) return 'Lanzador';
      if (lowerPos.includes('runner') || lowerPos.includes('corredor')) return 'Corredor';
      if (lowerPos.includes('catcher') || lowerPos.includes('receptor')) return 'Receptor';
      return 'Línea';
  };

  const generateTokensForTeam = (team: ManagedTeam, teamId: 'home' | 'away'): BoardToken[] => {
    const playersOnField = team.players.filter(p => !(p.isBenched ?? false));
    return playersOnField.map((player, index) => {
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
        };
    });
  };

  const handleStartGame = () => {
    try {
        if (!homeTeam || !awayTeam) {
            alert("Error: No se han podido cargar los datos de uno o ambos equipos.");
            return;
        }
        
        const homeTokens = generateTokensForTeam(homeTeam, 'home');
        const awayTokens = generateTokensForTeam(awayTeam, 'away');

        setTokens([...homeTokens, ...awayTokens]);
        setRerolls({ home: homeTeam.rerolls, away: awayTeam.rerolls });
        setGameState('playing');
    } catch (error) {
        console.error("CRITICAL ERROR in handleStartGame:", error);
        alert(`Se ha producido un error crítico al iniciar el partido: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

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
                            status: 'Reserva',
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
                    setImportedAwayTeam(importedTeamWithId);
                    setSelectedAwayId(importedTeamWithId.id);
                    setGameState('select_away');
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
  }, [gameState]);

  const handleDragMove = useCallback((e: MouseEvent | TouchEvent) => { 
    if (!draggedItemRef.current.type || !fieldRef.current) return; 
    isDraggingRef.current = true;
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
  }, []);

  const handleDragEnd = useCallback((e: MouseEvent | TouchEvent) => {
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
    setTimeout(() => { isDraggingRef.current = false; }, 100);
  }, [tokens, ballCarrierId, ballPosition.x, ballPosition.y]);

  useEffect(() => {
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
    document.addEventListener('touchmove', handleDragMove as any, { passive: false });
    document.addEventListener('touchend', handleDragEnd);

    return () => {
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
      document.removeEventListener('touchmove', handleDragMove as any);
      document.removeEventListener('touchend', handleDragEnd);
    };
  }, [handleDragMove, handleDragEnd]);

  useEffect(() => {
    const handleGlobalClick = () => {
        setContextMenu(prev => ({ ...prev, visible: false }));
    };

    if (contextMenu.visible) {
      document.addEventListener('click', handleGlobalClick);
    }
    return () => {
      document.removeEventListener('click', handleGlobalClick);
    };
  }, [contextMenu.visible]);

  const handleDragStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>, id: number) => { 
    e.preventDefault(); 
    isDraggingRef.current = false;
    setContextMenu(prev => ({...prev, visible: false}));
    draggedItemRef.current = { type: 'token', id }; 
  };
  
  const handleBallDragStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    isDraggingRef.current = false;
    setContextMenu(prev => ({...prev, visible: false}));
    if (ballCarrierId) setBallCarrierId(null);
    draggedItemRef.current = { type: 'ball', id: null };
  };

  const handleContextMenu = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (actionMode) return;
    setContextMenu({ visible: true, x: e.clientX, y: e.clientY, playerId: id });
  };
  const closeContextMenu = () => setContextMenu(prev => ({...prev, visible: false}));

  const handleMenuAction = (action: string) => {
    closeContextMenu();
    if (contextMenu.playerId) {
        setTokens(prev => prev.map(t => t.id === contextMenu.playerId ? { ...t, isDown: false } : t));
        
        setActivePlayerId(contextMenu.playerId);
        if (action === "Pasar") {
            if (contextMenu.playerId === ballCarrierId) {
                setActionMode('passing');
            } else {
                alert("Este jugador no tiene el balón para pasar.");
                setActivePlayerId(null);
            }
        } else if (action === "Placar") {
             setActionMode('blocking');
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
  
  const getGridCoordsFromClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const fieldRect = fieldRef.current!.getBoundingClientRect();
    const x = e.clientX - fieldRect.left;
    const y = e.clientY - fieldRect.top;
    const colWidth = fieldRect.width / GRID_COLS;
    const rowHeight = fieldRect.height / GRID_ROWS;
    let gridX = Math.floor(x / colWidth);
    let gridY = Math.floor(y / rowHeight);
    gridX = Math.max(0, Math.min(GRID_COLS - 1, gridX));
    gridY = Math.max(0, Math.min(GRID_ROWS - 1, gridY));
    return { gridX, gridY };
  };

  const handleGridClick = (e: React.MouseEvent<HTMLDivElement>) => {
    closeContextMenu();
    if (isDraggingRef.current) return;

    const targetElement = e.target as HTMLElement;
    const tokenElement = targetElement.closest('[data-token-id]');
    const clickedTokenId = tokenElement ? parseInt(tokenElement.getAttribute('data-token-id')!, 10) : null;
    const { gridX, gridY } = getGridCoordsFromClick(e);

    if (actionMode && activePlayerId) {
        e.stopPropagation();
        
        if (clickedTokenId === activePlayerId) {
            resetActionMode();
            return;
        }
        
        const activePlayer = tokens.find(t => t.id === activePlayerId);
        if (!activePlayer) {
            resetActionMode();
            return;
        }

        if (actionMode === 'passing') {
            handlePassAction(activePlayer, gridX, gridY);
        } else if (actionMode === 'blocking') {
            if (clickedTokenId) {
                handleBlockAction(activePlayer, gridX, gridY);
            }
        }
    } else {
        if (clickedTokenId) {
            e.stopPropagation();
            const token = tokens.find(t => t.id === clickedTokenId)!;
            setSelectedPlayerToken(current => current?.id === token.id ? null : token);
        } else {
            setSelectedPlayerToken(null);
        }
    }
  };

  const handlePassAction = (passer: BoardToken, gridX: number, gridY: number) => {
    if (!passer.playerData?.stats.PS || passer.playerData.stats.PS === '-') {
        resetActionMode();
        return;
    }

    const dx = Math.abs(gridX - passer.x);
    const dy = Math.abs(gridY - passer.y);

    if (dx >= 14 || dy >= 14 || (dx === 0 && dy === 0)) {
        resetActionMode();
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

    resetActionMode();
  };
  
  const handleBlockAction = (attacker: BoardToken, gridX: number, gridY: number) => {
    const defender = tokens.find(t => t.x === gridX && t.y === gridY);
    
    if (defender && defender.teamId !== attacker.teamId && isAdjacent(attacker, defender)) {
        setBlockModalState({ isOpen: true, attacker, defender });
    }
  };

  const handleBlockResolved = (outcome: BlockResolution) => {
    const knockDownIds = new Set(outcome.knockDowns.map(kd => kd.id));
    setTokens(prev => prev.map(t => knockDownIds.has(t.id) ? { ...t, isDown: true } : t));

    if (outcome.ballBecomesLoose) {
        setBallCarrierId(null);
    }
    
    const turnoverSource = outcome.knockDowns.find(kd => kd.isTurnoverSource);
    if (turnoverSource) {
        const turnoverPlayer = tokens.find(t => t.id === turnoverSource.id);
        const message = `¡TURNOVER! ${turnoverPlayer?.playerData?.customName || 'Un jugador'} ha sido derribado.`;
        setTurnoverMessage(message);
        setTimeout(() => setTurnoverMessage(null), 4000);
    }
    resetActionMode();
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
              <h2 className="text-2xl font-bold text-amber-400 text-center">Paso 2: Configurar Oponente</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-900/70 p-4 rounded-lg border border-sky-500 text-center">
                      <p className="text-slate-400">Equipo Local</p>
                      <p className="font-bold text-lg text-sky-400">{homeTeam?.name}</p>
                  </div>
                  {awayTeam ? (
                       <div className="bg-slate-900/70 p-4 rounded-lg border border-red-500 text-center">
                          <p className="text-slate-400">Equipo Visitante</p>
                          <p className="font-bold text-lg text-red-400">{awayTeam.name}</p>
                          <button onClick={() => { setSelectedAwayId(null); setImportedAwayTeam(null); }} className="text-xs text-slate-400 hover:underline mt-2">Cambiar</button>
                      </div>
                  ) : (
                      <div className="bg-slate-900/70 p-4 rounded-lg border border-dashed border-slate-600 text-center flex items-center justify-center">
                          <p className="text-slate-500">Esperando oponente...</p>
                      </div>
                  )}
              </div>

              {!awayTeam && (
                  <>
                      <div className="bg-slate-900/70 p-4 rounded-lg border border-slate-600">
                          <h3 className="text-lg font-semibold text-slate-300 mb-4">Oponente Local</h3>
                          {availableOpponents.length > 0 ? (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  {availableOpponents.map(team => (
                                      <button
                                          key={team.id}
                                          onClick={() => setSelectedAwayId(team.id!)}
                                          className="w-full flex items-center gap-4 text-left bg-slate-700/50 p-3 rounded-lg shadow-md hover:bg-slate-700 hover:text-white transition-colors"
                                      >
                                          {team.crestImage ? (
                                              <img src={team.crestImage} alt="Escudo" className="w-10 h-10 rounded-full object-cover bg-slate-900 flex-shrink-0" />
                                          ) : (
                                              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0">
                                                  <ShieldCheckIcon className="w-6 h-6 text-slate-600" />
                                              </div>
                                          )}
                                          <div className="flex-grow min-w-0">
                                              <p className="font-semibold text-white truncate">{team.name}</p>
                                              <p className="text-xs text-slate-400 truncate">{team.rosterName}</p>
                                          </div>
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
                  </>
              )}
              
              {homeTeam && awayTeam && (
                  <div className="text-center pt-4">
                      <button onClick={handleStartGame} className="w-full max-w-sm mx-auto bg-green-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-green-500 transition-colors animate-pulse">
                          ¡Iniciar Partido!
                      </button>
                  </div>
              )}
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
      if (!homeTeam || !awayTeam) return null;

      const Scoreboard = () => (
        <div className="flex-shrink-0 bg-slate-800/70 p-2 border-b-2 border-slate-700 shadow-md">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <div className="flex items-center gap-3 w-1/3">
                    {homeTeam.crestImage ? <img src={homeTeam.crestImage} className="w-12 h-12 rounded-full object-cover"/> : <ShieldCheckIcon className="w-12 h-12 text-slate-600"/>}
                    <h3 className="text-lg font-bold text-sky-400 hidden md:block truncate">{homeTeam.name}</h3>
                </div>
                <div className="text-center">
                    <div className="text-4xl font-black text-white">{score.home} - {score.away}</div>
                    <div className="text-xs text-amber-400">Parte {half} - Turno {turn}</div>
                </div>
                <div className="flex items-center gap-3 w-1/3 justify-end">
                    <h3 className="text-lg font-bold text-red-400 hidden md:block truncate text-right">{awayTeam.name}</h3>
                    {awayTeam.crestImage ? <img src={awayTeam.crestImage} className="w-12 h-12 rounded-full object-cover"/> : <ShieldCheckIcon className="w-12 h-12 text-slate-600"/>}
                </div>
            </div>
            <div className="flex justify-between items-center max-w-3xl mx-auto mt-2 px-4 text-xs">
                <div className="flex gap-2"><span>Rerolls:</span> {Array(rerolls.home).fill(0).map((_,i) => <div key={i} className="w-3 h-3 rounded-full bg-sky-400"/>)}</div>
                <div className="flex gap-2"><span>Rerolls:</span> {Array(rerolls.away).fill(0).map((_,i) => <div key={i} className="w-3 h-3 rounded-full bg-red-400"/>)}</div>
            </div>
        </div>
      );

      const Dugout = ({ team, teamId }: {team: ManagedTeam, teamId: 'home' | 'away'}) => {
        const { reserves, kos, casualties } = useMemo(() => {
            const players = teamId === 'home' ? (homeTeam?.players || []) : (awayTeam?.players || []);
            return {
                reserves: players.filter(p => p.status === 'Reserva'),
                kos: players.filter(p => p.status === 'KO'),
                casualties: players.filter(p => ['Lesionado', 'Expulsado', 'Muerto'].includes(p.status!)),
            };
        }, [teamId, homeTeam?.players, awayTeam?.players]);
        
        const isVisible = dugoutsVisible[teamId];

        return (
            <div className={`flex-shrink-0 bg-slate-800/50 rounded-lg shadow-lg h-full flex transition-all duration-300 ease-in-out ${isVisible ? 'w-48 p-2' : 'w-8'}`}>
                <button 
                    onClick={() => setDugoutsVisible(p => ({...p, [teamId]: !p[teamId]}))} 
                    className="h-full w-8 bg-slate-700/50 hover:bg-slate-700 rounded-md flex items-center justify-center"
                    aria-label={`${isVisible ? 'Ocultar' : 'Mostrar'} banquillo ${teamId === 'home' ? 'local' : 'visitante'}`}
                >
                    <ChevronDownIcon className={`w-5 h-5 transition-transform duration-300 ${teamId === 'home' ? 'transform -rotate-90' : 'transform rotate-90'} ${isVisible ? 'rotate-180' : ''}`} />
                </button>
                <div className={`flex-grow overflow-hidden transition-opacity ${isVisible ? 'opacity-100 delay-200' : 'opacity-0'}`}>
                    <div className="h-full overflow-y-auto px-2 space-y-3">
                        <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reservas ({reserves.length})</h4>
                            {reserves.map(p => <div key={p.id} className="text-xs p-1 bg-slate-700/50 rounded mt-1">{p.customName}</div>)}
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-yellow-400 uppercase tracking-wider">KO ({kos.length})</h4>
                            {kos.map(p => <div key={p.id} className="text-xs p-1 bg-yellow-800/50 rounded mt-1">{p.customName}</div>)}
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider">Bajas ({casualties.length})</h4>
                            {casualties.map(p => <div key={p.id} className="text-xs p-1 bg-red-800/50 rounded mt-1">{p.customName} ({p.status})</div>)}
                        </div>
                    </div>
                </div>
            </div>
        );
      };

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
        <div className="w-full h-[calc(100vh-80px)] flex flex-col bg-slate-900 text-white">
          <Scoreboard />
          <div className="flex-grow flex items-center justify-center p-2 sm:p-4 overflow-hidden relative">
             <Dugout team={homeTeam} teamId="home" />

            <div className="flex-grow h-full flex items-center justify-center">
                <div className={`relative transition-transform duration-500 ease-in-out h-full ${isZoomedOut ? 'scale-[0.6]' : 'scale-100'}`}>
                    <div ref={fieldRef} 
                        className="relative w-full h-full aspect-[15/26] bg-slate-900 rounded-lg shadow-xl border-2 border-slate-700 select-none overflow-hidden"
                        onMouseMove={handleGridMouseMove}
                        onClick={handleGridClick}
                    >
                        {actionMode && activePlayer && (
                            <div className="absolute top-0 left-0 right-0 bg-black/70 p-2 flex justify-between items-center z-30 animate-fade-in-fast">
                                <p className="text-amber-400 font-bold flex items-center gap-2">
                                    <span className={`w-3 h-3 rounded-full ${actionMode === 'passing' ? 'bg-sky-400' : 'bg-red-500'} animate-pulse`}></span>
                                    {actionMode === 'passing' ? 'Pase en curso' : 'Placar en curso'}: Selecciona un objetivo
                                </p>
                                <button onClick={resetActionMode} className="bg-red-600 text-white font-bold py-1 px-3 rounded text-sm hover:bg-red-500">
                                    Cancelar Acción
                                </button>
                            </div>
                        )}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform rotate-90" style={{ width: '173.33%', height: '57.7%' }}><img src={fieldImage} alt="Campo de Blood Bowl" className="w-full h-full object-cover"/></div>
                        <div className="absolute inset-0 grid pointer-events-none" style={{ gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`, gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)` }}>
                            {Array.from({ length: GRID_ROWS * GRID_COLS }).map((_, i) => (<div key={i} className="w-full h-full border border-black/20"></div>))}
                        </div>
                        {actionMode === 'passing' && activePlayer && (
                            <div className="absolute inset-0 grid pointer-events-none" style={{ gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`, gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)` }}>
                                {Array.from({ length: GRID_ROWS }).map((_, y) =>
                                    Array.from({ length: GRID_COLS }).map((_, x) => {
                                        const dx = Math.abs(x - activePlayer.x);
                                        const dy = Math.abs(y - activePlayer.y);
                                        if ((dx === 0 && dy === 0) || dx >= 14 || dy >= 14) return null;
                                        const typeKey = passChartGrid[dy][dx];
                                        const colorClass = passOverlayColors[typeKey];
                                        return <div key={`${x}-${y}`} className={`w-full h-full ${colorClass || ''}`}></div>;
                                    })
                                )}
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
                            const isActive = token.id === activePlayerId;
                            return (
                              <div 
                                key={token.id} 
                                data-token-id={token.id}
                                onMouseDown={(e) => handleDragStart(e, token.id)} 
                                onTouchStart={(e) => handleDragStart(e, token.id)}
                                onContextMenu={(e) => handleContextMenu(e, token.id)}
                                className={`absolute flex items-center justify-center w-[6.66%] h-[3.84%] ${config[token.position]?.color} text-white font-bold text-[10px] border-2 ${borderColor} rounded-full shadow-lg cursor-grab active:cursor-grabbing transition-all duration-300 ${token.isDown ? 'opacity-60' : ''} ${isActive ? 'ring-4 ring-amber-400 ring-offset-2 ring-offset-slate-900' : ''}`} 
                                style={{ left: `${((token.x + 0.5) / GRID_COLS) * 100}%`, top: `${((token.y + 0.5) / GRID_ROWS) * 100}%`, transform: `translate(-50%, -50%) ${token.isDown ? 'rotate(90deg)' : ''}`, touchAction: 'none' }}
                              >
                                {getPlayerNumber()}
                              </div>
                            );
                        })}
                         <div onMouseDown={handleBallDragStart} onTouchStart={handleBallDragStart} className="absolute cursor-grab active:cursor-grabbing" style={ballStyle}><BallIcon className="w-full h-full" /></div>
                          {passTargetInfo && actionMode !== 'passing' && (
                            <div
                                className="absolute w-[6.66%] h-[3.84%] bg-white/20 border-2 border-dashed border-white/50 rounded-lg pointer-events-none z-20"
                                style={{
                                    left: `${((passTargetInfo.x + 0.5) / GRID_COLS) * 100}%`,
                                    top: `${((passTargetInfo.y + 0.5) / GRID_ROWS) * 100}%`,
                                    transform: 'translate(-50%, -50%)',
                                }}
                            >
                                <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-xs px-2 py-0.5 rounded shadow-lg whitespace-nowrap">
                                    {passTargetInfo.type}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Dugout team={awayTeam} teamId="away" />
            
            {selectedPlayerToken && <PlayerDetailPanel playerToken={selectedPlayerToken} onClose={() => setSelectedPlayerToken(null)} />}
            
            <button
                onClick={() => setIsZoomedOut(!isZoomedOut)}
                className="absolute bottom-4 right-4 bg-slate-700 text-white p-3 rounded-full shadow-lg hover:bg-slate-600 transition-colors"
                aria-label={isZoomedOut ? "Acercar" : "Alejar"}
            >
                {isZoomedOut ? <ZoomInIcon /> : <ZoomOutIcon />}
            </button>
          </div>
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

      {blockModalState.isOpen && blockModalState.attacker && blockModalState.defender && (
          <BlockAssistantModal 
              attacker={blockModalState.attacker}
              defender={blockModalState.defender}
              allTokens={tokens}
              ballCarrierId={ballCarrierId}
              onBlockResolved={handleBlockResolved}
              onClose={() => {
                  setBlockModalState({isOpen: false, attacker: null, defender: null});
                  resetActionMode();
              }}
          />
      )}

      <style>{`
      @keyfreames fade-in-slow { from { opacity: 0; } to { opacity: 1; } } 
      .animate-fade-in-slow { animation: fade-in-slow 0.5s ease-out forwards; }
      @keyframes fade-in-fast { from { opacity: 0; } to { opacity: 1; } }
      .animate-fade-in-fast { animation: fade-in-fast 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default GameBoard;