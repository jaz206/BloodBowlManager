import React, { useRef, useEffect } from 'react';
import { useMatch } from '../context/MatchContext';
import { formatLogEntry } from './logFormatter';

/**
 * GameLog — componente de bitácora del partido en tiempo real.
 * Muestra los eventos en orden cronológico inverso con color e icono por tipo.
 * Auto-scroll al evento más reciente.
 */
const GameLog: React.FC = () => {
    const { gameLog, handleExportLog } = useMatch() as any;
    const topRef = useRef<HTMLDivElement>(null);

    // Auto-scroll al nuevo evento
    useEffect(() => {
        topRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [gameLog.length]);

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-3 px-1 shrink-0">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-premium-gold text-base">receipt_long</span>
                    <h4 className="text-[10px] font-display font-black text-slate-400 uppercase tracking-widest">
                        Bitácora
                    </h4>
                    <span className="text-[8px] bg-white/5 text-slate-500 px-2 py-0.5 rounded-full font-bold">
                        {gameLog.length}
                    </span>
                </div>
                {handleExportLog && (
                    <button
                        onClick={handleExportLog}
                        className="text-[8px] font-display font-black text-slate-500 hover:text-premium-gold transition-colors uppercase tracking-widest flex items-center gap-1"
                        title="Exportar a Excel"
                    >
                        <span className="material-symbols-outlined text-sm">download</span>
                        XLSX
                    </button>
                )}
            </div>

            {/* Log entries */}
            <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                <div ref={topRef} />
                {gameLog.length === 0 ? (
                    <p className="text-center text-slate-600 text-xs italic py-8">
                        El diario de batalla está vacío...
                    </p>
                ) : (
                    gameLog.map((event: any) => {
                        const { text, colorClass, icon, badge } = formatLogEntry(event);
                        return (
                            <div
                                key={event.id}
                                className={`flex items-start gap-2 p-2 rounded-xl bg-white/3 border border-white/5 hover:bg-white/5 transition-all group ${colorClass}`}
                            >
                                <span className="material-symbols-outlined text-[14px] mt-0.5 shrink-0 opacity-70 group-hover:opacity-100">
                                    {icon}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                        {badge && (
                                            <span className="text-[7px] font-display font-black uppercase tracking-wider opacity-60">
                                                {badge}
                                            </span>
                                        )}
                                        {event.turn > 0 && (
                                            <span className="text-[7px] text-slate-600 font-bold">
                                                T{event.turn}/{event.half === 1 ? '1ª' : '2ª'}
                                            </span>
                                        )}
                                        <span className="text-[7px] text-slate-700 ml-auto font-mono">
                                            {event.timestamp}
                                        </span>
                                    </div>
                                    <p className="text-[10px] leading-snug text-slate-300 group-hover:text-white transition-colors break-words">
                                        {text}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default GameLog;
