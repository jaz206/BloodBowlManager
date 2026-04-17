import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import type { Play, PlayerPosition, ManagedTeam, ManagedPlayer, BoardToken, DrawingPath } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';

const MAX_TOKENS = 11;
const GRID_COLS = 26;
const GRID_ROWS = 15;
const GRID_CELL_SIZE = 40;
const TOKEN_SIZE = 34;

type ActiveTool = 'move' | 'pass' | 'defense' | null;
type TacticStyle = 'Defensivo' | 'Ofensivo';

const FORMATION_PRESETS: Record<string, { position: string; x: number; y: number }[]> = {
  'Defensa Estándar': [
    { position: 'Línea', x: 12, y: 7 }, { position: 'Línea', x: 12, y: 6 }, { position: 'Línea', x: 12, y: 8 },
    { position: 'Blitzer', x: 10, y: 4 }, { position: 'Blitzer', x: 10, y: 10 },
    { position: 'Corredor', x: 8, y: 7 }, { position: 'Línea', x: 8, y: 5 }, { position: 'Línea', x: 8, y: 9 },
    { position: 'Receptor', x: 5, y: 4 }, { position: 'Receptor', x: 5, y: 10 }, { position: 'Lanzador', x: 4, y: 7 },
  ],
  'Ataque Jaula': [
    { position: 'Línea', x: 12, y: 7 }, { position: 'Línea', x: 12, y: 6 }, { position: 'Línea', x: 12, y: 8 },
    { position: 'Blitzer', x: 10, y: 6 }, { position: 'Blitzer', x: 10, y: 8 },
    { position: 'Lanzador', x: 9, y: 7 }, { position: 'Corredor', x: 8, y: 7 },
    { position: 'Receptor', x: 6, y: 3 }, { position: 'Receptor', x: 6, y: 11 },
    { position: 'Línea', x: 9, y: 5 }, { position: 'Línea', x: 9, y: 9 },
  ],
  'Presión Lateral': [
    { position: 'Blitzer', x: 12, y: 3 }, { position: 'Blitzer', x: 12, y: 11 },
    { position: 'Línea', x: 12, y: 7 }, { position: 'Línea', x: 11, y: 5 }, { position: 'Línea', x: 11, y: 9 },
    { position: 'Receptor', x: 9, y: 1 }, { position: 'Receptor', x: 9, y: 13 },
    { position: 'Corredor', x: 8, y: 7 }, { position: 'Lanzador', x: 6, y: 7 },
    { position: 'Línea', x: 7, y: 5 }, { position: 'Línea', x: 7, y: 9 },
  ],
};

const positionConfig: Record<string, { icon: string; border: string; label: string }> = {
  Blitzer: { icon: 'swords', border: 'border-primary', label: 'BZ' },
  Lanzador: { icon: 'ads_click', border: 'border-slate-400', label: 'LZ' },
  Corredor: { icon: 'directions_run', border: 'border-emerald-500', label: 'CR' },
  Línea: { icon: 'shield', border: 'border-slate-600', label: 'LN' },
  Receptor: { icon: 'sports_football', border: 'border-amber-500', label: 'RC' },
  BigGuy: { icon: 'star', border: 'border-accent-gold', label: 'BG' },
};

interface PlaysProps {
  managedTeams: ManagedTeam[];
  plays: Play[];
  onSavePlay: (play: Play) => void;
  onDeletePlay: (playId: string) => void;
  initialTeamId?: string | null;
  onInitialTeamHandled?: () => void;
}

const TACTIC_STYLES: TacticStyle[] = ['Defensivo', 'Ofensivo'];

const PITCH_INFO = {
  losColumn: 13,
  homeHalfStart: 13,
  leftWideMaxRow: 3,
  rightWideMinRow: 11,
};

const ROLE_PRIORITY: PlayerPosition[] = ['Línea', 'Blitzer', 'Lanzador', 'Corredor', 'Receptor'];
const ROLE_FORMATION_SLOTS: Record<PlayerPosition, { x: number; y: number }[]> = {
  Línea: [
    { x: 13, y: 7 },
    { x: 13, y: 6 },
    { x: 13, y: 8 },
    { x: 12, y: 5 },
    { x: 12, y: 9 },
    { x: 11, y: 4 },
    { x: 11, y: 10 },
  ],
  Blitzer: [
    { x: 12, y: 7 },
    { x: 11, y: 6 },
    { x: 11, y: 8 },
    { x: 10, y: 5 },
    { x: 10, y: 9 },
  ],
  Lanzador: [
    { x: 10, y: 7 },
    { x: 9, y: 7 },
    { x: 9, y: 6 },
  ],
  Corredor: [
    { x: 9, y: 8 },
    { x: 9, y: 7 },
    { x: 8, y: 7 },
  ],
  Receptor: [
    { x: 8, y: 4 },
    { x: 8, y: 10 },
    { x: 7, y: 3 },
    { x: 7, y: 11 },
  ],
  BigGuy: [{ x: 12, y: 7 }],
};

const FALLBACK_FORMATION_SLOTS = [
  { x: 13, y: 7 },
  { x: 13, y: 6 },
  { x: 13, y: 8 },
  { x: 12, y: 5 },
  { x: 12, y: 9 },
  { x: 11, y: 4 },
  { x: 11, y: 10 },
  { x: 10, y: 7 },
  { x: 9, y: 6 },
  { x: 9, y: 8 },
  { x: 8, y: 7 },
];

const normalizePositionType = (position: string): PlayerPosition => {
  const lowerPos = position.toLowerCase();
  if (lowerPos.includes('blitzer') || lowerPos.includes('wardancer') || lowerPos.includes('witch') || lowerPos.includes('assassin') || lowerPos.includes('slayer')) return 'Blitzer';
  if (lowerPos.includes('thrower') || lowerPos.includes('lanzador')) return 'Lanzador';
  if (lowerPos.includes('runner') || lowerPos.includes('corredor')) return 'Corredor';
  if (lowerPos.includes('catcher') || lowerPos.includes('receptor')) return 'Receptor';
  return 'Línea';
};

const getLoadPriority = (player: ManagedPlayer) => {
  const normalized = player.position.toLowerCase();
  if (player.status === 'Activo' || !player.isBenched) return 0;
  if (normalized.includes('línea') || normalized.includes('linea')) return 1;
  if (normalized.includes('blitzer') || normalized.includes('lanzador')) return 2;
  if (normalized.includes('corredor') || normalized.includes('receptor')) return 3;
  return 4;
};

const getRoleSlot = (position: PlayerPosition, index: number) => {
  const slots = ROLE_FORMATION_SLOTS[position] || FALLBACK_FORMATION_SLOTS;
  return slots[index % slots.length];
};

const buildTeamLoadFormation = (players: ManagedPlayer[]): BoardToken[] => {
  const ordered = [...players]
    .sort((a, b) => getLoadPriority(a) - getLoadPriority(b))
    .slice(0, MAX_TOKENS);

  const roleCounters: Record<string, number> = {};

  return ordered.map((player, index) => {
    const role = normalizePositionType(player.position);
    const slotIndex = roleCounters[role] ?? 0;
    roleCounters[role] = slotIndex + 1;
    const slot = getRoleSlot(role, slotIndex) || FALLBACK_FORMATION_SLOTS[index % FALLBACK_FORMATION_SLOTS.length];

    return {
      id: player.id,
      position: role,
      x: slot.x,
      y: slot.y,
      playerData: player,
      teamSide: 'home' as const,
    };
  });
};

const buildFormationStatus = (tokens: BoardToken[]) => {
  const onLoS = tokens.filter(token => token.x === PITCH_INFO.losColumn && token.y >= 4 && token.y <= 10).length;
  const onLeftWide = tokens.filter(token => token.x >= PITCH_INFO.homeHalfStart && token.y >= 0 && token.y <= PITCH_INFO.leftWideMaxRow).length;
  const onRightWide = tokens.filter(token => token.x >= PITCH_INFO.homeHalfStart && token.y >= PITCH_INFO.rightWideMinRow && token.y < GRID_ROWS).length;
  const totalOnField = tokens.length;
  const inOwnHalf = tokens.filter(token => token.x >= PITCH_INFO.homeHalfStart).length;
  const isLegal = onLoS >= 3 && onLeftWide <= 2 && onRightWide <= 2 && totalOnField <= 11 && inOwnHalf === totalOnField;
  return { onLoS, onLeftWide, onRightWide, totalOnField, inOwnHalf, isLegal };
};

const Plays: React.FC<PlaysProps> = ({ managedTeams, plays, onSavePlay, onDeletePlay, initialTeamId, onInitialTeamHandled }) => {
  const [tokens, setTokens] = useState<BoardToken[]>([]);
  const [drawnPaths, setDrawnPaths] = useState<DrawingPath[]>([]);
  const [history, setHistory] = useState<{ tokens: BoardToken[], paths: DrawingPath[] }[]>([{ tokens: [], paths: [] }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [playName, setPlayName] = useState('');
  const [selectedPlayId, setSelectedPlayId] = useState<string | undefined>(plays.length > 0 ? plays[0].id : undefined);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [selectedStyle, setSelectedStyle] = useState<TacticStyle>('Defensivo');
  const [styleMenuExpanded, setStyleMenuExpanded] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<ManagedPlayer | null>(null);
  const [zoom, setZoom] = useState(1);
  const [activeTool, setActiveTool] = useState<ActiveTool>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPathPoints, setCurrentPathPoints] = useState<{ x: number, y: number }[]>([]);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const pushHistory = (newTokens: BoardToken[], newPaths?: DrawingPath[]) => {
    const pathsToSave = newPaths !== undefined ? newPaths : drawnPaths;
    setHistory(prev => {
      const sliced = prev.slice(0, historyIndex + 1);
      return [...sliced, { tokens: newTokens, paths: pathsToSave }];
    });
    setHistoryIndex(prev => prev + 1);
    setTokens(newTokens);
    if (newPaths !== undefined) setDrawnPaths(newPaths);
  };

  const handleUndo = () => {
    if (historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    const state = history[newIndex];
    setHistoryIndex(newIndex);
    setTokens(state.tokens);
    setDrawnPaths(state.paths);
  };

  const handleRedo = () => {
    if (historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    const state = history[newIndex];
    setHistoryIndex(newIndex);
    setTokens(state.tokens);
    setDrawnPaths(state.paths);
  };

  const fieldRef = useRef<HTMLDivElement>(null);
  const styleMenuRef = useRef<HTMLDivElement>(null);
  const draggedTokenRef = useRef<{ id: number } | null>(null);
  const formationStatus = useMemo(() => buildFormationStatus(tokens), [tokens]);

  // Sync selection
  useEffect(() => {
    if (plays.length > 0 && !plays.find(p => p.id === selectedPlayId)) {
      setSelectedPlayId(plays[0].id);
    } else if (plays.length === 0) {
      setSelectedPlayId(undefined);
    }
  }, [plays, selectedPlayId]);

  useEffect(() => {
    if (!styleMenuExpanded) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (styleMenuRef.current && !styleMenuRef.current.contains(event.target as Node)) {
        setStyleMenuExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [styleMenuExpanded]);

  const handleDragMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!fieldRef.current) return;

    if (e.cancelable) e.preventDefault();

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const fieldRect = fieldRef.current.getBoundingClientRect();

    if (draggedTokenRef.current) {
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
    } else if (isDrawing && activeTool) {
      const x = (clientX - fieldRect.left) / zoom;
      const y = (clientY - fieldRect.top) / zoom;

      // Avoid adding duplicate points or points too close
      setCurrentPathPoints(prev => {
        if (prev.length === 0) return [{ x, y }];
        const last = prev[prev.length - 1];
        const dist = Math.sqrt(Math.pow(x - last.x, 2) + Math.pow(y - last.y, 2));
        if (dist < 10) return prev;
        return [...prev, { x, y }];
      });
    }
  }, [isDrawing, activeTool, zoom]);

  const handleDragEnd = useCallback(() => {
    if (draggedTokenRef.current) {
      pushHistory(tokens);
      draggedTokenRef.current = null;
    } else if (isDrawing && activeTool && currentPathPoints.length > 1) {
      const newPath: DrawingPath = {
        id: Date.now().toString(),
        type: activeTool,
        points: currentPathPoints
      };
      const newPaths = [...drawnPaths, newPath];
      pushHistory(tokens, newPaths);
      setIsDrawing(false);
      setCurrentPathPoints([]);
    } else {
      setIsDrawing(false);
      setCurrentPathPoints([]);
    }
  }, [draggedTokenRef, isDrawing, activeTool, currentPathPoints, tokens, drawnPaths, pushHistory]);

  const handleFieldMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (!activeTool || !fieldRef.current) return;
    const clientX = 'touches' in e ? e.nativeEvent instanceof TouchEvent ? e.nativeEvent.touches[0].clientX : (e.nativeEvent as any).clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.nativeEvent instanceof TouchEvent ? e.nativeEvent.touches[0].clientY : (e.nativeEvent as any).clientY : (e as React.MouseEvent).clientY;

    const fieldRect = fieldRef.current.getBoundingClientRect();
    const x = (clientX - fieldRect.left) / zoom;
    const y = (clientY - fieldRect.top) / zoom;

    setIsDrawing(true);
    setCurrentPathPoints([{ x, y }]);
  };

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
      const newTokens = [...tokens, {
        id: Date.now(),
        x: 4,
        y: Math.floor(GRID_ROWS / 2),
        position,
        teamSide: 'home' as const
      }];
      pushHistory(newTokens);
    }
  };

  const handleClearField = () => {
    pushHistory([], []);
    setSelectedPlayer(null);
  };

  const handleSavePlay = () => {
    if (!playName.trim()) { setSaveError('Introduce un nombre para la jugada.'); return; }
    if (tokens.length === 0 && drawnPaths.length === 0) { setSaveError('Posiciona al menos un jugador o dibuja una ruta.'); return; }
    setSaveError(null);
    const existingPlay = plays.find(p => p.name.toLowerCase() === playName.trim().toLowerCase());
    const newPlay: Play = {
      id: existingPlay?.id,
      name: playName.trim(),
      style: selectedStyle,
      rosterName: managedTeams.find(t => t.id === selectedTeamId)?.rosterName || 'Táctica',
      tokens: tokens.map(({ playerData, ...token }) => token),
      paths: drawnPaths
    };
    onSavePlay(newPlay);
    setPlayName('');
    setStyleMenuExpanded(false);
    showToast('Jugada guardada correctamente.');
  };

  const handleLoadPlay = (id: string) => {
    const playToLoad = plays.find(p => p.id === id);
    if (playToLoad) {
      setTokens(playToLoad.tokens);
      setDrawnPaths(playToLoad.paths || []);
      setHistory([{ tokens: playToLoad.tokens, paths: playToLoad.paths || [] }]);
      setHistoryIndex(0);
      setPlayName(playToLoad.name);
      setSelectedStyle((playToLoad.style as TacticStyle) || 'Defensivo');
      setStyleMenuExpanded(false);
      setSelectedPlayId(id);
    }
  };

  const handleLoadTeam = (teamId: string) => {
    const team = managedTeams.find(t => t.id === teamId);
    if (team) {
      setSelectedTeamId(teamId);
      const matchingPlay = [...plays]
        .reverse()
        .find((play) => (play.teamId && play.teamId === teamId) || normalizeLookupKey(play.rosterName) === normalizeLookupKey(team.rosterName));

      if (matchingPlay) {
        setTokens(matchingPlay.tokens);
        setDrawnPaths(matchingPlay.paths || []);
        setHistory([{ tokens: matchingPlay.tokens, paths: matchingPlay.paths || [] }]);
        setHistoryIndex(0);
        setPlayName(matchingPlay.name);
        setSelectedStyle((matchingPlay.style as TacticStyle) || 'Defensivo');
        setSelectedPlayId(matchingPlay.id);
        showToast(`T?ctica ${matchingPlay.name} cargada.`);
        return;
      }

      const newTokens = buildTeamLoadFormation(team.players);
      pushHistory(newTokens);
      showToast(`Plantilla ${team.name} alineada.`);
    }
  };

  useEffect(() => {
    if (!initialTeamId || managedTeams.length === 0) return;

    const team = managedTeams.find((item) => item.id === initialTeamId);
    if (!team) return;

    setSelectedTeamId(initialTeamId);

    const matchingPlay = [...plays]
      .reverse()
      .find((play) => (play.teamId && play.teamId === initialTeamId) || normalizeLookupKey(play.rosterName) === normalizeLookupKey(team.rosterName));

    if (matchingPlay) {
      setTokens(matchingPlay.tokens);
      setDrawnPaths(matchingPlay.paths || []);
      setHistory([{ tokens: matchingPlay.tokens, paths: matchingPlay.paths || [] }]);
      setHistoryIndex(0);
      setPlayName(matchingPlay.name);
      setSelectedStyle((matchingPlay.style as TacticStyle) || 'Defensivo');
      setSelectedPlayId(matchingPlay.id);
    } else {
      handleLoadTeam(initialTeamId);
    }

    onInitialTeamHandled?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTeamId, managedTeams, plays, onInitialTeamHandled]);

  const handleDeletePlay = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDeletePlay = (id: string) => {
    onDeletePlay(id);
    setDeleteConfirmId(null);
    showToast('Jugada eliminada.');
  };

  const handleApplyPreset = (presetName: string) => {
    const preset = FORMATION_PRESETS[presetName];
    if (!preset) return;
    const newTokens: BoardToken[] = preset.map((p, index) => ({
      id: Date.now() + index,
      position: p.position as PlayerPosition,
      x: p.x,
      y: p.y,
      teamSide: 'home'
    }));
    pushHistory(newTokens);
    showToast(`Formación "${presetName}" aplicada.`);
  };

  const handleTokenClick = (id: number) => {
    const token = tokens.find(t => t.id === id);
    if (token?.playerData) {
      setSelectedPlayer(token.playerData);
    }
    draggedTokenRef.current = { id };
  };

  return (
    <div className="guild-board-light flex h-screen w-full flex-col bg-background-dark text-[#2b1d12] overflow-hidden font-display relative">
      {/* Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-14 left-1/2 -translate-x-1/2 z-[100] bg-primary text-black font-black text-[10px] uppercase tracking-widest italic px-6 py-4 rounded-2xl shadow-2xl"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-[rgba(255,250,240,0.98)] border border-red-500/20 rounded-[2rem] p-8 max-w-sm w-full shadow-2xl text-[#2b1d12]"
            >
              <h3 className="text-[#2b1d12] font-black italic uppercase text-xl mb-2">¿Borrar jugada?</h3>
              <p className="text-[#8f745c] text-xs mb-6 font-medium">Esta acción no se puede deshacer.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-3 rounded-xl bg-[rgba(255,251,241,0.96)] text-[#2b1d12] font-black text-xs uppercase tracking-widest hover:bg-[rgba(202,138,4,0.10)] transition-all border border-[rgba(111,87,56,0.12)]">Cancelar</button>
                <button onClick={() => confirmDeletePlay(deleteConfirmId)} className="flex-1 py-3 rounded-xl bg-red-600 text-white font-black text-xs uppercase tracking-widest hover:bg-red-500 transition-all">Borrar</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <style>{`
        .guild-board-light {
          background:
            radial-gradient(circle at top left, rgba(245, 158, 11, 0.12), transparent 28%),
            radial-gradient(circle at bottom right, rgba(120, 53, 15, 0.08), transparent 24%),
            linear-gradient(180deg, #f3e3c1 0%, #ead2a6 100%);
          color: #2b1d12;
        }
        .guild-board-light .bg-background-dark,
        .guild-board-light footer.bg-background-dark,
        .guild-board-light section.bg-background-dark {
          background: linear-gradient(180deg, rgba(255, 249, 236, 0.98), rgba(240, 227, 199, 0.95)) !important;
          color: #2b1d12 !important;
        }
        .guild-board-light .bg-panel-dark,
        .guild-board-light .bg-panel-dark\/90,
        .guild-board-light .bg-panel-dark\/80 {
          background: linear-gradient(180deg, rgba(255, 250, 240, 0.98), rgba(240, 227, 199, 0.95)) !important;
          border-color: rgba(111, 87, 56, 0.14) !important;
          color: #2b1d12 !important;
        }
        .guild-board-light .bg-black\/40,
        .guild-board-light .bg-black\/30 {
          background: rgba(255, 251, 241, 0.96) !important;
          border-color: rgba(111, 87, 56, 0.12) !important;
          color: #2b1d12 !important;
        }
        .guild-board-light .blood-ui-header,
        .guild-board-light .blood-ui-card-strong,
        .guild-board-light .blood-ui-card,
        .guild-board-light .glass-panel,
        .guild-board-light .glass,
        .guild-board-light .glass-dark {
          background: linear-gradient(180deg, rgba(255, 249, 236, 0.98), rgba(240, 227, 199, 0.95)) !important;
          border-color: rgba(111, 87, 56, 0.14) !important;
          color: #2b1d12 !important;
        }
        .guild-board-light .bg-background-dark *,
        .guild-board-light .bg-panel-dark *,
        .guild-board-light .bg-panel-dark\/90 *,
        .guild-board-light .bg-panel-dark\/80 *,
        .guild-board-light .bg-black\/40 *,
        .guild-board-light .bg-black\/30 *,
        .guild-board-light .blood-ui-header *,
        .guild-board-light .blood-ui-card-strong *,
        .guild-board-light .blood-ui-card *,
        .guild-board-light .glass-panel *,
        .guild-board-light .glass *,
        .guild-board-light .glass-dark * {
          color: #2b1d12 !important;
        }
        .guild-board-light .text-slate-400,
        .guild-board-light .text-slate-500,
        .guild-board-light .text-slate-600 {
          color: #bca78a !important;
        }
        .guild-board-light .pitch-lines {
          border-color: rgba(202, 138, 4, 0.28);
          background: radial-gradient(circle at center, #2f4f2f 0%, #1d2d1d 100%);
        }
        .guild-board-light footer {
          border-top-color: rgba(202, 138, 4, 0.15) !important;
        }
        .pitch-grid {
          background-image: 
            linear-gradient(to right, rgba(245, 159, 10, 0.18) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(245, 159, 10, 0.18) 1px, transparent 1px);
          background-size: 40px 40px;
          opacity: 0.42;
        }
        .pitch-lines {
          border: 2px solid rgba(245, 159, 10, 0.3);
          background: radial-gradient(circle at center, #233123 0%, #171f17 100%);
          position: relative;
        }
        .pitch-lines::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          opacity: 0.1;
          pointer-events: none;
        }
      `}</style>

      {/* Top Header */}
      <header className="flex items-center justify-between border-b border-[rgba(111,87,56,0.14)] bg-[rgba(255,249,236,0.98)] px-6 py-3 shrink-0 shadow-[0_14px_34px_rgba(89,59,21,0.08)]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-primary">
            <span className="material-symbols-outlined text-3xl">sports_football</span>
            <h1 className="text-xl font-bold tracking-tight uppercase text-[#2b1d12]">Pizarra <span className="text-[#ca8a04]">Táctica</span></h1>
          </div>
          <div className="h-6 w-px bg-[rgba(111,87,56,0.14)] mx-2"></div>
          <div className="flex items-center gap-3">
            <input
              value={playName}
              onChange={e => { setPlayName(e.target.value); setSaveError(null); }}
              placeholder="Nueva Estrategia..."
              className={`bg-transparent border-none outline-none text-sm font-semibold placeholder:text-[#8f745c] w-48 ${saveError ? 'text-red-500' : 'text-[#2b1d12]'
                }`}
            />
            <div ref={styleMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setStyleMenuExpanded(prev => !prev)}
                className="flex items-center gap-2 rounded-full bg-[rgba(202,138,4,0.08)] border border-[rgba(202,138,4,0.18)] px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-[#8f5a00] hover:bg-[rgba(202,138,4,0.14)] transition-colors"
              >
                <span className="material-symbols-outlined text-xs">tune</span>
                {selectedStyle}
              </button>
              <AnimatePresence>
                {styleMenuExpanded && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="absolute right-0 top-full mt-2 w-40 rounded-2xl border border-[rgba(111,87,56,0.14)] bg-[rgba(255,250,240,0.98)] p-1 shadow-2xl z-50"
                  >
                    {TACTIC_STYLES.map(style => (
                      <button
                        key={style}
                        type="button"
                        onClick={() => {
                          setSelectedStyle(style);
                          setStyleMenuExpanded(false);
                        }}
                        className={`w-full rounded-xl px-3 py-2 text-left text-[10px] font-black uppercase tracking-widest transition-colors ${selectedStyle === style ? 'bg-primary text-black' : 'text-[#6f5738] hover:bg-[rgba(202,138,4,0.08)]'}`}
                      >
                        {style}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {saveError && <span className="text-[9px] text-red-400 font-bold italic">{saveError}</span>}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <button className="flex items-center gap-2 rounded-lg bg-[rgba(255,251,241,0.96)] border border-[rgba(111,87,56,0.14)] px-4 py-2 text-xs font-bold text-[#2b1d12] uppercase tracking-widest hover:border-[rgba(202,138,4,0.35)] transition-colors shadow-[0_8px_20px_rgba(89,59,21,0.05)]">
              <span className="material-symbols-outlined text-[#ca8a04] text-sm">folder_open</span>
              Formaciones
              <span className="material-symbols-outlined text-sm">expand_more</span>
            </button>
            <div className="absolute right-0 top-full mt-2 w-64 bg-[rgba(255,250,240,0.98)] border border-[rgba(111,87,56,0.14)] rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 p-2 overflow-hidden">
              {plays.length > 0 ? plays.map(p => (
                <div key={p.id} className="flex items-center justify-between group/item p-2 hover:bg-white/5 rounded-lg transition-colors cursor-pointer" onClick={() => handleLoadPlay(p.id!)}>
                  <div className="flex min-w-0 flex-col pr-2">
                    <span className="text-xs font-bold text-[#2b1d12] truncate">{p.name}</span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#8f745c]">{p.style || 'Defensivo'}</span>
                  </div>
                  <button className="opacity-0 group-hover/item:opacity-100 text-red-600 hover:text-red-500 p-1" onClick={(e) => { e.stopPropagation(); handleDeletePlay(p.id!); }}>
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              )) : <div className="text-[10px] text-[#8f745c] p-3 italic">Sin jugadas guardadas</div>}
            </div>
          </div>

          <button
            onClick={handleSavePlay}
            className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-xs font-black text-background-dark uppercase tracking-widest hover:bg-primary-dark transition-all shadow-[0_0_20px_rgba(245,159,10,0.2)]"
          >
            <span className="material-symbols-outlined text-sm">save</span>
            Guardar
          </button>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-72 bg-[rgba(255,250,240,0.98)] border-r border-[rgba(111,87,56,0.12)] flex flex-col p-5 gap-8 shrink-0 shadow-[0_0_0_1px_rgba(255,255,255,0.35)_inset] overflow-y-auto">
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Tokens de Equipo</h2>
              <div className="relative group">
                <span className="text-[9px] bg-[rgba(202,138,4,0.08)] text-[#8f5a00] px-2 py-0.5 rounded-full border border-[rgba(202,138,4,0.18)] font-black cursor-pointer hover:bg-[rgba(202,138,4,0.14)] transition-colors">
                  {managedTeams.find(t => t.id === selectedTeamId)?.name || 'Seleccionar'}
                </span>
                <div className="absolute left-0 top-full mt-2 w-48 bg-[rgba(255,250,240,0.98)] border border-[rgba(111,87,56,0.14)] rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 p-1">
                  {managedTeams.map(t => (
                    <button key={t.id} className="w-full text-left p-2 hover:bg-[rgba(202,138,4,0.08)] rounded-lg text-[10px] font-bold text-[#2b1d12]" onClick={() => handleLoadTeam(t.id!)}>
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {(Object.keys(positionConfig) as Array<keyof typeof positionConfig>).slice(0, 4).map((pos) => (
                <button
                  key={pos}
                  onClick={() => handleAddToken(pos as PlayerPosition)}
                  disabled={tokens.length >= MAX_TOKENS}
                  className="group flex flex-col items-center gap-2 cursor-grab active:cursor-grabbing disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className={`relative flex items-center justify-center size-14 rounded-full bg-background-dark border-4 ${positionConfig[pos].border} shadow-lg transition-transform group-hover:scale-110`}>
                    <span className="material-symbols-outlined text-2xl text-[#8f745c] group-hover:text-[#ca8a04] transition-colors">
                      {positionConfig[pos].icon}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-[#8f745c] uppercase tracking-widest">{pos}</span>
                </button>
              ))}
            </div>
          </section>

          <div className="h-px bg-white/5"></div>

          <section className="space-y-4">
            <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Herramientas</h2>
            <div className="flex flex-col gap-2">
              {([
                { id: 'move', icon: 'brush', label: 'Ruta Movimiento' },
                { id: 'pass', icon: 'near_me', label: 'Pase / Trayectoria' },
                { id: 'defense', icon: 'groups', label: 'Zonas Defensa' },
              ] as { id: ActiveTool; icon: string; label: string }[]).map(tool => (
                <button
                  key={tool.id}
                  onClick={() => setActiveTool(prev => prev === tool.id ? null : tool.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${activeTool === tool.id
                    ? 'bg-primary text-black shadow-lg shadow-primary/20'
                    : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'
                    }`}
                >
                  <span className="material-symbols-outlined text-sm">{tool.icon}</span>
                  {tool.label}
                </button>
              ))}
              <button onClick={handleClearField} className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-all font-bold text-[10px] uppercase tracking-widest mt-2">
                <span className="material-symbols-outlined text-sm">backspace</span>
                Limpiar Todo
              </button>
            </div>
          </section>

          <div className="mt-auto">
            <AnimatePresence>
              {selectedPlayer && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="bg-[rgba(255,251,241,0.96)] rounded-2xl p-4 border border-[rgba(111,87,56,0.12)] mb-4 shadow-[0_10px_24px_rgba(89,59,21,0.05)]"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[9px] font-black text-[#ca8a04] uppercase">Detalle: {selectedPlayer.customName}</span>
                    <button onClick={() => setSelectedPlayer(null)} className="text-[#8f745c] hover:text-[#2b1d12]">
                      <span className="material-symbols-outlined text-xs">close</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-5 gap-1 text-center mb-2">
                    {['MV', 'FU', 'AG', 'PA', 'AR'].map(stat => (
                      <div key={stat} className="flex flex-col">
                        <span className="text-[8px] text-[#8f745c] font-bold">{stat}</span>
                        <span className="text-[10px] text-[#2b1d12] font-black">{(selectedPlayer.stats as any)[stat]}</span>
                      </div>
                    ))}
                  </div>
                  <div className="text-[8px] text-[#8f745c] italic font-medium leading-relaxed line-clamp-3">
                    {selectedPlayer.skills}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="bg-[rgba(255,251,241,0.96)] rounded-2xl p-4 border border-[rgba(111,87,56,0.12)] shadow-[0_10px_24px_rgba(89,59,21,0.05)]">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-[#ca8a04] text-xs">analytics</span>
                <span className="text-[9px] font-black text-[#2b1d12] uppercase italic">Resumen Táctico</span>
              </div>
              <div className="flex justify-between text-[10px] mb-2">
                <span className="text-[#8f745c] font-bold uppercase tracking-tighter">Jugadores:</span>
                <span className="text-[#ca8a04] font-black italic">{tokens.length}/11</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-[#8f745c] font-bold uppercase tracking-tighter">Prob. Éxito:</span>
                <span className="text-emerald-600 font-black italic">68%</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Pitch Workspace */}
        <section className="flex-1 bg-[linear-gradient(180deg,rgba(255,250,240,0.98),rgba(240,227,199,0.98))] relative flex items-center justify-center p-10 overflow-auto scrollbar-hide">
          {/* Zoom & View Controls Overlay */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-[rgba(255,250,240,0.98)] p-2 rounded-2xl border border-[rgba(111,87,56,0.14)] shadow-[0_20px_50px_rgba(89,59,21,0.10)] z-40">
            <div className={`flex items-center gap-2 rounded-xl px-3 py-2 border ${formationStatus.isLegal ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700' : 'border-red-500/20 bg-red-500/10 text-red-700'}`}>
              <span className="material-symbols-outlined text-sm">{formationStatus.isLegal ? 'verified' : 'warning'}</span>
              <div className="flex flex-col leading-none">
                <span className="text-[9px] font-black uppercase tracking-widest">{formationStatus.isLegal ? 'Legal' : 'Ilegal'}</span>
                <span className="text-[9px] font-bold opacity-80">{formationStatus.totalOnField}/11</span>
              </div>
            </div>
            <div className="flex items-center bg-[rgba(255,251,241,0.96)] rounded-xl p-1 border border-[rgba(111,87,56,0.10)]">
              <button
                onClick={() => setZoom(prev => Math.min(prev + 0.1, 1.5))}
                className="p-2 rounded-lg hover:bg-[rgba(202,138,4,0.12)] text-[#8f745c] hover:text-[#ca8a04] transition-all"
              >
                <span className="material-symbols-outlined text-sm">zoom_in</span>
              </button>
              <button
                onClick={() => setZoom(prev => Math.max(prev - 0.1, 0.5))}
                className="p-2 rounded-lg hover:bg-[rgba(202,138,4,0.12)] text-[#8f745c] hover:text-[#ca8a04] transition-all"
              >
                <span className="material-symbols-outlined text-sm">zoom_out</span>
              </button>
            </div>
            <div className="w-px h-6 bg-[rgba(111,87,56,0.14)]"></div>
            <button
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="p-2 rounded-xl hover:bg-[rgba(202,138,4,0.10)] text-[#8f745c] hover:text-[#2b1d12] transition-all disabled:opacity-20 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-sm">undo</span>
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="p-2 rounded-xl hover:bg-[rgba(202,138,4,0.10)] text-[#8f745c] hover:text-[#2b1d12] transition-all disabled:opacity-20 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-sm">redo</span>
            </button>
            <div className="w-px h-6 bg-[rgba(111,87,56,0.14)]"></div>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-red-500/10 text-red-500/70 hover:text-red-600 transition-all">
              <span className="material-symbols-outlined text-sm">grid_view</span>
              <span className="text-[10px] font-black uppercase tracking-widest">Rejilla</span>
            </button>
          </div>

          {/* The Pitch Rendering */}
          <div
            ref={fieldRef}
            onMouseDown={handleFieldMouseDown}
            onTouchStart={handleFieldMouseDown}
            className="pitch-lines shadow-[0_0_100px_rgba(0,0,0,0.8)] relative"
            style={{
              width: `${GRID_COLS * GRID_CELL_SIZE}px`,
              height: `${GRID_ROWS * GRID_CELL_SIZE}px`,
              transform: `scale(${zoom})`,
              transition: 'transform 0.3s cubic-bezier(0.2, 0, 0, 1)'
            }}
          >
            {/* SVG Drawing Layer */}
            <svg className="absolute inset-0 z-20 pointer-events-none w-full h-full overflow-visible">
              <filter id="glow">
                <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              {drawnPaths.map(path => (
                <polyline
                  key={path.id}
                  points={path.points.map(p => `${p.x},${p.y}`).join(' ')}
                  fill="none"
                  stroke={path.type === 'move' ? '#f59f0a' : path.type === 'pass' ? '#10b981' : '#ef4444'}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray={path.type === 'pass' ? '8,6' : '0'}
                  style={{ filter: 'url(#glow)' }}
                />
              ))}
              {currentPathPoints.length > 0 && (
                <polyline
                  points={currentPathPoints.map(p => `${p.x},${p.y}`).join(' ')}
                  fill="none"
                  stroke={activeTool === 'move' ? '#f59f0a' : activeTool === 'pass' ? '#10b981' : '#ef4444'}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray={activeTool === 'pass' ? '8,6' : '0'}
                  opacity="0.6"
                />
              )}
            </svg>

            {/* Texture/Grid Layer */}
            <div className="absolute inset-0 pitch-grid opacity-20 pointer-events-none"></div>

            {/* Pitch Markings */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {/* Line of Scrimmage */}
              <div className="h-full w-1 bg-primary/20 shadow-[0_0_20px_rgba(245,159,10,0.2)]"></div>
              {/* Center Circle */}
              <div className="absolute size-32 border-2 border-primary/20 rounded-full"></div>
              {/* End Zones */}
              <div className="absolute left-0 h-full w-[40px] bg-primary/5 border-r border-primary/20"></div>
              <div className="absolute right-0 h-full w-[40px] bg-primary/5 border-l border-primary/20"></div>
              {/* Wide Zones (Approx 4 rows from top/bottom) */}
              <div className="absolute top-[160px] w-full h-[1px] bg-primary/10 border-t border-dashed border-primary/20"></div>
              <div className="absolute bottom-[160px] w-full h-[1px] bg-primary/10 border-t border-dashed border-primary/20"></div>
            </div>

            {/* Placed Tokens */}
            <AnimatePresence>
              {tokens.map((token) => {
                const config = positionConfig[token.position] || positionConfig.Línea;
                return (
                  <motion.div
                    key={token.id}
                    layout
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    onMouseDown={(e) => { e.stopPropagation(); handleTokenClick(token.id); }}
                    onTouchStart={(e) => { e.stopPropagation(); handleTokenClick(token.id); }}
                    className={`absolute rounded-full bg-background-dark border-2 ${config.border} flex items-center justify-center shadow-2xl cursor-grab active:cursor-grabbing z-30 transition-shadow active:shadow-primary/40`}
                    style={{
                      width: `${TOKEN_SIZE}px`,
                      height: `${TOKEN_SIZE}px`,
                      left: `${token.x * GRID_CELL_SIZE + GRID_CELL_SIZE / 2}px`,
                      top: `${token.y * GRID_CELL_SIZE + GRID_CELL_SIZE / 2}px`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    <span className="text-[9px] font-black text-slate-100 italic">{config.label}</span>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Ball */}
            <motion.div
              animate={{ y: [0, -5, 0], scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-accent-gold z-40 drop-shadow-[0_0_10px_rgba(212,175,55,0.4)] pointer-events-none"
            >
              <span className="material-symbols-outlined text-2xl fill-1">sports_football</span>
            </motion.div>
          </div>

          {/* Bottom Formation Presets Overlay */}
          <div className="absolute bottom-10 right-10 flex flex-col gap-4 items-end">
            <div className="bg-[rgba(255,250,240,0.98)] p-5 rounded-[2rem] border border-[rgba(111,87,56,0.14)] shadow-2xl w-64 translate-y-2 group hover:translate-y-0 transition-transform">
              <h3 className="text-[10px] font-black text-[#8f745c] uppercase tracking-[0.2em] mb-4 pl-1">Preajustes Rápidos</h3>
              <div className="space-y-2">
                {['Defensa Estándar', 'Ataque Jaula', 'Presión Lateral'].map(preset => (
                  <button
                    key={preset}
                    onClick={() => handleApplyPreset(preset)}
                    className="w-full text-left px-4 py-3 rounded-2xl bg-white/70 border border-[rgba(111,87,56,0.10)] text-[10px] font-black text-[#2b1d12] uppercase italic tracking-widest hover:bg-[rgba(202,138,4,0.08)] hover:border-[rgba(202,138,4,0.18)] hover:text-[#ca8a04] transition-all"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Bottom Status Bar */}
      <footer className="h-10 bg-[rgba(255,249,236,0.98)] border-t border-[rgba(111,87,56,0.12)] flex items-center px-6 justify-between text-[10px] font-black text-[#8f745c] uppercase tracking-[0.2em] italic">
        <div className="flex gap-8">
          <span className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-[#ca8a04]/40 animate-pulse"></span>
            Modo Estratega
          </span>
          <span className="text-[#8f745c]">Blood Bowl 2020 Draft Edition</span>
        </div>
        <div className="flex gap-6 items-center">
          <span className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-green-500"></span>
            Enlace de Nuffle
          </span>
          <span className="opacity-40">v2.4.0-Alpha</span>
        </div>
      </footer>
    </div>
  );
};

export default Plays;

