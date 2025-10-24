import React, { useRef, useCallback, useEffect } from 'react';
import type { ManagedPlayer } from '../types';

interface MiniFieldProps {
    players: ManagedPlayer[];
    teamColor: string;
    onPlayerMove: (playerId: number, newPos: { x: number; y: number }) => void;
    onPlayerClick?: (player: ManagedPlayer) => void;
}

const MiniField: React.FC<MiniFieldProps> = ({ players, teamColor, onPlayerMove, onPlayerClick }) => {
    const GRID_COLS = 15;
    const GRID_ROWS = 7;
    const fieldRef = useRef<HTMLDivElement>(null);
    const draggedPlayerRef = useRef<{ id: number; offsetX: number; offsetY: number } | null>(null);

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>, player: ManagedPlayer) => {
        e.preventDefault();
        const tokenRect = e.currentTarget.getBoundingClientRect();
        draggedPlayerRef.current = {
            id: player.id,
            offsetX: e.clientX - tokenRect.left,
            offsetY: e.clientY - tokenRect.top,
        };
        e.currentTarget.style.cursor = 'grabbing';
    };

    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>, player: ManagedPlayer) => {
        e.preventDefault();
        const touch = e.touches[0];
        const tokenRect = e.currentTarget.getBoundingClientRect();
        draggedPlayerRef.current = {
            id: player.id,
            offsetX: touch.clientX - tokenRect.left,
            offsetY: touch.clientY - tokenRect.top,
        };
    };

    const movePlayer = useCallback((clientX: number, clientY: number) => {
        if (!draggedPlayerRef.current || !fieldRef.current) return;

        const fieldRect = fieldRef.current.getBoundingClientRect();
        const x = clientX - fieldRect.left - draggedPlayerRef.current.offsetX;
        const y = clientY - fieldRect.top - draggedPlayerRef.current.offsetY;

        const cellWidth = fieldRect.width / GRID_COLS;
        const cellHeight = fieldRect.height / GRID_ROWS;

        let gridX = Math.round(x / cellWidth);
        let gridY = Math.round(y / cellHeight);

        gridX = Math.max(0, Math.min(GRID_COLS - 1, gridX));
        gridY = Math.max(0, Math.min(GRID_ROWS - 1, gridY));
        
        // Prevent placing on opponent's side of scrimmage (assuming this is for one team's half)
        if (gridY < 3) gridY = 3;

        onPlayerMove(draggedPlayerRef.current.id, { x: gridX, y: gridY });
    }, [onPlayerMove]);

    const handleMouseMove = useCallback((e: MouseEvent) => movePlayer(e.clientX, e.clientY), [movePlayer]);
    const handleTouchMove = useCallback((e: TouchEvent) => {
        if (e.cancelable) e.preventDefault();
        movePlayer(e.touches[0].clientX, e.touches[0].clientY);
    }, [movePlayer]);

    const handleMouseUp = useCallback(() => {
        if (draggedPlayerRef.current) {
            draggedPlayerRef.current = null;
        }
    }, []);
    
    useEffect(() => {
        const upHandler = () => handleMouseUp();
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', upHandler);
        window.addEventListener('touchmove', handleTouchMove, { passive: false });
        window.addEventListener('touchend', upHandler);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', upHandler);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', upHandler);
        };
    }, [handleMouseMove, handleMouseUp, handleTouchMove]);

    return (
        <div 
            ref={fieldRef}
            className="relative w-full aspect-[15/7] bg-green-900/50 rounded-md border-2 border-green-700/50 select-none touch-none"
        >
            {/* Grid */}
            <div className="absolute inset-0 grid" style={{gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`, gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`}}>
                {Array.from({ length: GRID_COLS * GRID_ROWS }).map((_, i) => (
                    <div key={i} className="border border-green-300/10"></div>
                ))}
            </div>
            {/* Field Markings */}
            <div className="absolute top-[42.85%] left-0 w-full h-[1px] bg-white/50"></div> {/* Scrimmage Line (y=3/7)*/}
            <div className="absolute top-0 left-[26.66%] w-[1px] h-full bg-white/30"></div> {/* Left Wide Zone */}
            <div className="absolute top-0 right-[26.66%] w-[1px] h-full bg-white/30"></div> {/* Right Wide Zone */}

            {/* Players */}
            {players.map((player, index) => {
                if (!player.fieldPosition) return null;
                return (
                    <div 
                        key={player.id}
                        onMouseDown={(e) => handleMouseDown(e, player)}
                        onTouchStart={(e) => handleTouchStart(e, player)}
                        onClick={() => onPlayerClick && onPlayerClick(player)}
                        className="absolute w-[6.66%] h-[14.28%] transform -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing z-10"
                        style={{ 
                            top: `${(player.fieldPosition.y + 0.5) / GRID_ROWS * 100}%`, 
                            left: `${(player.fieldPosition.x + 0.5) / GRID_COLS * 100}%`,
                            touchAction: 'none'
                        }}
                    >
                        <div className={`w-full h-full rounded-full ${teamColor} border-2 border-white/80 shadow-lg flex items-center justify-center text-white font-bold text-xs`}>
                            {index + 1}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default MiniField;
