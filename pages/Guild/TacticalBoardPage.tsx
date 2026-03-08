import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import type { Play, PlayerPosition, ManagedTeam, ManagedPlayer, BoardToken } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';

const MAX_TOKENS = 11;
const GRID_COLS = 26; // Professional Blood Bowl pitch is 26 squares long
const GRID_ROWS = 15; // and 15 squares wide (including wide zones)

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
}

const Plays: React.FC<PlaysProps> = ({ managedTeams, plays, onSavePlay, onDeletePlay }) => {
  const [tokens, setTokens] = useState<BoardToken[]>([]);
  const [playName, setPlayName] = useState('');
  const [selectedPlayId, setSelectedPlayId] = useState<string | undefined>(plays.length > 0 ? plays[0].id : undefined);
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [selectedPlayer, setSelectedPlayer] = useState<ManagedPlayer | null>(null);
  const [zoom, setZoom] = useState(1);

  const fieldRef = useRef<HTMLDivElement>(null);
  const draggedTokenRef = useRef<{ id: number } | null>(null);

  // Sync selection
  useEffect(() => {
    if (plays.length > 0 && !plays.find(p => p.id === selectedPlayId)) {
      setSelectedPlayId(plays[0].id);
    } else if (plays.length === 0) {
      setSelectedPlayId(undefined);
    }
  }, [plays, selectedPlayId]);

  const handleDragMove = useCallback((e: MouseEvent | TouchEvent) => {
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
  }, []);

  const handleDragEnd = useCallback(() => {
    draggedTokenRef.current = null;
  }, []);

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
      setTokens(prev => [...prev, {
        id: Date.now(),
        x: 4, // Defensive line start
        y: Math.floor(GRID_ROWS / 2),
        position,
        teamSide: 'home'
      }]);
    }
  };

  const handleClearField = () => {
    setTokens([]);
    setSelectedPlayer(null);
  };

  const handleSavePlay = () => {
    if (!playName.trim() || tokens.length === 0) {
      alert('Introduce un nombre y posiciona jugadores.');
      return;
    }
    const existingPlay = plays.find(p => p.name.toLowerCase() === playName.trim().toLowerCase());
    const newPlay: Play = {
      id: existingPlay?.id,
      name: playName.trim(),
      rosterName: managedTeams.find(t => t.id === selectedTeamId)?.rosterName || 'Táctica',
      tokens: tokens.map(({ playerData, ...token }) => token)
    };
    onSavePlay(newPlay);
    setPlayName('');
  };

  const handleLoadPlay = (id: string) => {
    const playToLoad = plays.find(p => p.id === id);
    if (playToLoad) {
      setTokens(playToLoad.tokens);
      setPlayName(playToLoad.name);
      setSelectedPlayId(id);
    }
  };

  const handleLoadTeam = (teamId: string) => {
    const team = managedTeams.find(t => t.id === teamId);
    if (team) {
      setSelectedTeamId(teamId);
      const newTokens: BoardToken[] = team.players.slice(0, 11).map((player, index) => ({
        id: player.id,
        position: mapPositionToType(player.position),
        x: index < 3 ? 12 : (index < 7 ? 10 : 8), // Basic formation
        y: 4 + (index % 7),
        playerData: player,
        teamSide: 'home'
      }));
      setTokens(newTokens);
    }
  };

  const handleDeletePlay = (id: string) => {
    if (confirm('¿Borrar esta jugada?')) {
      onDeletePlay(id);
    }
  };

  const handleTokenClick = (id: number) => {
    const token = tokens.find(t => t.id === id);
    if (token?.playerData) {
      setSelectedPlayer(token.playerData);
    }
    draggedTokenRef.current = { id };
  };

  return (
    <div className="flex h-screen w-full flex-col bg-background-dark text-slate-100 overflow-hidden font-display">
      <style>{`
        .pitch-grid {
          background-image: 
            linear-gradient(to right, rgba(245, 159, 10, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(245, 159, 10, 0.1) 1px, transparent 1px);
          background-size: 40px 40px;
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
      <header className="flex items-center justify-between border-b border-primary/20 bg-panel-dark px-6 py-3 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-primary">
            <span className="material-symbols-outlined text-3xl">sports_football</span>
            <h1 className="text-xl font-bold tracking-tight uppercase">Pizarra <span className="text-slate-100">Táctica</span></h1>
          </div>
          <div className="h-6 w-px bg-primary/20 mx-2"></div>
          <div className="flex items-center gap-3">
            <input
              value={playName}
              onChange={e => setPlayName(e.target.value)}
              placeholder="Nueva Estrategia..."
              className="bg-transparent border-none outline-none text-sm font-semibold text-slate-300 placeholder:text-slate-600 w-48"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <button className="flex items-center gap-2 rounded-lg bg-background-dark border border-primary/30 px-4 py-2 text-xs font-bold text-slate-100 uppercase tracking-widest hover:border-primary transition-colors">
              <span className="material-symbols-outlined text-primary text-sm">folder_open</span>
              Formaciones
              <span className="material-symbols-outlined text-sm">expand_more</span>
            </button>
            <div className="absolute right-0 top-full mt-2 w-64 bg-panel-dark border border-primary/20 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 p-2 overflow-hidden">
              {plays.length > 0 ? plays.map(p => (
                <div key={p.id} className="flex items-center justify-between group/item p-2 hover:bg-white/5 rounded-lg transition-colors cursor-pointer" onClick={() => handleLoadPlay(p.id!)}>
                  <span className="text-xs font-bold text-slate-300 truncate pr-2">{p.name}</span>
                  <button className="opacity-0 group-hover/item:opacity-100 text-red-500 hover:text-red-400 p-1" onClick={(e) => { e.stopPropagation(); handleDeletePlay(p.id!); }}>
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              )) : <div className="text-[10px] text-slate-500 p-3 italic">Sin jugadas guardadas</div>}
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
        <aside className="w-72 bg-panel-dark border-r border-primary/10 flex flex-col p-5 gap-8 shrink-0">
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Tokens de Equipo</h2>
              <div className="relative group">
                <span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20 font-black cursor-pointer hover:bg-primary/20 transition-colors">
                  {managedTeams.find(t => t.id === selectedTeamId)?.name || 'Seleccionar'}
                </span>
                <div className="absolute left-0 top-full mt-2 w-48 bg-panel-dark border border-primary/20 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 p-1">
                  {managedTeams.map(t => (
                    <button key={t.id} className="w-full text-left p-2 hover:bg-white/5 rounded-lg text-[10px] font-bold text-slate-300" onClick={() => handleLoadTeam(t.id!)}>
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
                    <span className="material-symbols-outlined text-2xl text-slate-300 group-hover:text-primary transition-colors">
                      {positionConfig[pos].icon}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{pos}</span>
                </button>
              ))}
            </div>
          </section>

          <div className="h-px bg-white/5"></div>

          <section className="space-y-4">
            <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Herramientas</h2>
            <div className="flex flex-col gap-2">
              <button className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 text-primary border border-primary/20 font-bold text-[10px] uppercase tracking-widest hover:bg-primary/20 transition-all">
                <span className="material-symbols-outlined text-sm">brush</span>
                Ruta Movimiento
              </button>
              <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-white/5 hover:text-slate-300 transition-all font-bold text-[10px] uppercase tracking-widest">
                <span className="material-symbols-outlined text-sm">near_me</span>
                Pase / Trayectoria
              </button>
              <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-white/5 hover:text-slate-300 transition-all font-bold text-[10px] uppercase tracking-widest">
                <span className="material-symbols-outlined text-sm">groups</span>
                Zonas Defensa
              </button>
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
                  className="bg-primary/5 rounded-2xl p-4 border border-primary/10 mb-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[9px] font-black text-primary uppercase">Detalle: {selectedPlayer.customName}</span>
                    <button onClick={() => setSelectedPlayer(null)} className="text-slate-600 hover:text-white">
                      <span className="material-symbols-outlined text-xs">close</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-5 gap-1 text-center mb-2">
                    {['MV', 'FU', 'AG', 'PS', 'AR'].map(stat => (
                      <div key={stat} className="flex flex-col">
                        <span className="text-[8px] text-slate-600 font-bold">{stat}</span>
                        <span className="text-[10px] text-slate-100 font-black">{(selectedPlayer.stats as any)[stat]}</span>
                      </div>
                    ))}
                  </div>
                  <div className="text-[8px] text-accent-gold italic font-medium leading-relaxed">
                    {selectedPlayer.skills}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="bg-panel-dark rounded-2xl p-4 border border-white/5">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-primary text-xs">analytics</span>
                <span className="text-[9px] font-black text-slate-300 uppercase italic">Resumen Táctico</span>
              </div>
              <div className="flex justify-between text-[10px] mb-2">
                <span className="text-slate-500 font-bold uppercase tracking-tighter">Jugadores:</span>
                <span className="text-primary font-black italic">{tokens.length}/11</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-500 font-bold uppercase tracking-tighter">Prob. Éxito:</span>
                <span className="text-green-500 font-black italic">68%</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Pitch Workspace */}
        <section className="flex-1 bg-background-dark relative flex items-center justify-center p-10 overflow-auto scrollbar-hide">
          {/* Zoom & View Controls Overlay */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-panel-dark/80 backdrop-blur-xl p-2 rounded-2xl border border-primary/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-40">
            <div className="flex items-center bg-black/40 rounded-xl p-1">
              <button
                onClick={() => setZoom(prev => Math.min(prev + 0.1, 1.5))}
                className="p-2 rounded-lg hover:bg-primary/20 text-slate-400 hover:text-primary transition-all"
              >
                <span className="material-symbols-outlined text-sm">zoom_in</span>
              </button>
              <button
                onClick={() => setZoom(prev => Math.max(prev - 0.1, 0.5))}
                className="p-2 rounded-lg hover:bg-primary/20 text-slate-400 hover:text-primary transition-all"
              >
                <span className="material-symbols-outlined text-sm">zoom_out</span>
              </button>
            </div>
            <div className="w-px h-6 bg-white/10"></div>
            <button className="p-2 rounded-xl hover:bg-white/5 text-slate-500"><span className="material-symbols-outlined text-sm">undo</span></button>
            <button className="p-2 rounded-xl hover:bg-white/5 text-slate-500"><span className="material-symbols-outlined text-sm">redo</span></button>
            <div className="w-px h-6 bg-white/10"></div>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-red-500/10 text-red-500/60 hover:text-red-500 transition-all">
              <span className="material-symbols-outlined text-sm">grid_view</span>
              <span className="text-[10px] font-black uppercase tracking-widest">Rejilla</span>
            </button>
          </div>

          {/* The Pitch Rendering */}
          <div
            ref={fieldRef}
            className="pitch-lines shadow-[0_0_100px_rgba(0,0,0,0.8)] relative"
            style={{
              width: `${GRID_COLS * 40}px`,
              height: `${GRID_ROWS * 40}px`,
              transform: `scale(${zoom})`,
              transition: 'transform 0.3s cubic-bezier(0.2, 0, 0, 1)'
            }}
          >
            {/* Texture/Grid Layer */}
            <div className="absolute inset-0 pitch-grid opacity-20"></div>

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
                    className={`absolute size-10 rounded-full bg-background-dark border-2 ${config.border} flex items-center justify-center shadow-2xl cursor-grab active:cursor-grabbing z-30 transition-shadow active:shadow-primary/40`}
                    style={{
                      left: `${token.x * 40 + 20}px`,
                      top: `${token.y * 40 + 20}px`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    <span className="text-[10px] font-black text-slate-100 italic">{config.label}</span>
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
            <div className="bg-panel-dark/90 backdrop-blur-xl p-5 rounded-[2rem] border border-primary/20 shadow-2xl w-64 translate-y-2 group hover:translate-y-0 transition-transform">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 pl-1">Preajustes Rápidos</h3>
              <div className="space-y-2">
                {['Defensa Estándar', 'Ataque Jaula', 'Presión Lateral'].map(preset => (
                  <button key={preset} className="w-full text-left px-4 py-3 rounded-2xl bg-white/5 border border-white/5 text-[10px] font-black text-slate-300 uppercase italic tracking-widest hover:bg-primary/10 hover:border-primary/20 hover:text-primary transition-all">
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Bottom Status Bar */}
      <footer className="h-10 bg-background-dark border-t border-primary/10 flex items-center px-6 justify-between text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic">
        <div className="flex gap-8">
          <span className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-primary/40 animate-pulse"></span>
            Modo Estratega
          </span>
          <span className="text-slate-600">Blood Bowl 2020 Draft Edition</span>
        </div>
        <div className="flex gap-6 items-center">
          <span className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-green-500"></span>
            Nuffle's Link
          </span>
          <span className="opacity-40">v2.4.0-Alpha</span>
        </div>
      </footer>
    </div>
  );
};

export default Plays;