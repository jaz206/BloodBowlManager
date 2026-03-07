

import React from 'react';
import type { ManagedPlayer, PlayerStatus, SppActionType } from '../types';
import TdIcon from './icons/TdIcon';
import PassIcon from './icons/PassIcon';
import CasualtyIcon from './icons/CasualtyIcon';
import InterferenceIcon from './icons/InterferenceIcon';

interface PlayerStatusCardProps {
    player: ManagedPlayer;
    playerNumber?: number;
    onViewPlayer: (player: ManagedPlayer) => void;
    onSkillClick: (skillName: string) => void;
    onStatusToggle?: (player: ManagedPlayer) => void;
    canToggleStatus?: boolean;
}

const SppActionIcons: React.FC<{ actions: Partial<Record<SppActionType, number>> }> = ({ actions }) => {
    if (!actions || Object.keys(actions).length === 0) return null;

    const iconMap: Record<SppActionType, { icon: React.ReactElement<{ className?: string }>; title: string }> = {
        TD: { icon: <TdIcon />, title: 'Touchdown' },
        PASS: { icon: <PassIcon />, title: 'Pase Completado' },
        CASUALTY: { icon: <CasualtyIcon />, title: 'Lesión Causada' },
        INTERFERENCE: { icon: <InterferenceIcon />, title: 'Interferencia' },
    };

    return (
        <div className="flex items-center gap-1.5">
            {(Object.keys(actions) as SppActionType[]).map(action => {
                const count = actions[action];
                if (!count) return null;
                const { icon, title } = iconMap[action];
                return (
                    <div key={action} className="flex items-center text-xs text-amber-300" title={`${title} (x${count})`}>
                        {React.cloneElement(icon, { className: 'w-3.5 h-3.5' })}
                        {count > 1 && <span className="ml-0.5 font-bold text-xs">x{count}</span>}
                    </div>
                );
            })}
        </div>
    );
};

const PlayerStatusCard: React.FC<PlayerStatusCardProps> = ({ player, playerNumber, onViewPlayer, onSkillClick, onStatusToggle, canToggleStatus }) => {
    const statusConfig: Record<PlayerStatus, { bg: string; text: string; label: string; shadow: string }> = {
        Activo: { bg: 'bg-green-500/10 border-green-500/20', text: 'text-green-400', label: 'Activo', shadow: 'shadow-green-500/5' },
        Reserva: { bg: 'bg-white/5 border-white/10', text: 'text-slate-400', label: 'Reserva', shadow: 'shadow-transparent' },
        KO: { bg: 'bg-amber-500/10 border-amber-500/20', text: 'text-amber-400', label: 'KO', shadow: 'shadow-amber-500/5' },
        Lesionado: { bg: 'bg-orange-500/10 border-orange-500/20', text: 'text-orange-400', label: 'Lesionado', shadow: 'shadow-orange-500/5' },
        Expulsado: { bg: 'bg-red-500/10 border-red-500/20', text: 'text-red-400', label: 'Expulsado', shadow: 'shadow-red-500/5' },
        Muerto: { bg: 'bg-black/60 border-blood-red/40', text: 'text-blood-red font-black', label: '☠ MUERTO ☠', shadow: 'shadow-blood-red/20' },
    };

    const status = player.status || 'Activo';
    const config = statusConfig[status];
    const displayLabel = player.statusDetail || config.label;

    const nameClass = status === 'Muerto'
        ? 'text-blood-red'
        : player.isStarPlayer
            ? 'text-premium-gold'
            : 'text-white';

    return (
        <div className={`bento-card p-4 transition-premium border ${config.bg} ${config.shadow} group/card`}>
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3 flex-grow min-w-0">
                    {playerNumber && (
                        <div className="flex-shrink-0 w-8 h-8 bg-black/40 border border-white/10 rounded-lg flex items-center justify-center text-xs font-display font-bold text-premium-gold">
                            {playerNumber}
                        </div>
                    )}
                    <div className="truncate flex flex-col">
                        <button
                            type="button"
                            onClick={() => onViewPlayer(player)}
                            className="font-display font-bold text-lg text-left hover:text-premium-gold transition-colors outline-none truncate"
                        >
                            <span className={nameClass}>
                                {player.customName}
                            </span>
                        </button>
                        <div className="flex items-center gap-2">
                            <p className="text-[10px] font-display text-slate-500 uppercase tracking-widest truncate">{player.position}</p>
                            <SppActionIcons actions={player.sppActions || {}} />
                        </div>
                    </div>
                </div>
                <div className="text-right flex flex-col items-end">
                    <p className="text-sm font-display font-black text-premium-gold tracking-widest">{player.spp}<span className="text-[8px] ml-0.5 opacity-50">PE</span></p>
                    <p className={`text-[10px] font-display font-bold uppercase tracking-tighter mt-1 px-2 py-0.5 rounded ${config.bg} ${config.text}`}>
                        {displayLabel}
                    </p>
                </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-white/5">
                <div className="flex items-center gap-2">
                    {canToggleStatus && (player.status === 'Activo' || player.status === 'Reserva') && (
                        <button
                            onClick={() => onStatusToggle?.(player)}
                            className="text-[10px] font-display font-bold uppercase tracking-widest bg-white/5 border border-white/10 hover:bg-white/10 text-white py-1 px-3 rounded-md transition-premium"
                        >
                            {player.status === 'Activo' ? '→ Banquillo' : '→ Al Campo'}
                        </button>
                    )}
                </div>
                {player.lastingInjuries && player.lastingInjuries.length > 0 && (
                    <div className="text-[10px] font-display font-bold text-blood-red uppercase tracking-tight flex items-center gap-1">
                        <span className="animate-pulse">⚠</span> {player.lastingInjuries.join(', ')}
                    </div>
                )}
            </div>
        </div>
    );
};

export default React.memo(PlayerStatusCard);