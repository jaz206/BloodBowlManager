

import React from 'react';
import type { ManagedPlayer, PlayerStatus, SppActionType } from '../types';
import TdIcon from './icons/TdIcon';
import PassIcon from './icons/PassIcon';
import CasualtyIcon from './icons/CasualtyIcon';
import InterferenceIcon from './icons/InterferenceIcon';

interface PlayerStatusCardProps {
    player: ManagedPlayer;
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

const PlayerStatusCard: React.FC<PlayerStatusCardProps> = ({ player, onViewPlayer, onSkillClick, onStatusToggle, canToggleStatus }) => {
    const statusConfig: Record<PlayerStatus, { bg: string; text: string; label: string; }> = {
        Activo: { bg: 'bg-green-600/20', text: 'text-green-400', label: 'Activo' },
        Reserva: { bg: 'bg-transparent', text: 'text-slate-300', label: 'Reserva' },
        KO: { bg: 'bg-yellow-600/30', text: 'text-yellow-400', label: 'KO' },
        Lesionado: { bg: 'bg-orange-600/30', text: 'text-orange-400', label: 'Lesionado' },
        Expulsado: { bg: 'bg-red-600/30', text: 'text-red-400', label: 'Expulsado' },
        Muerto: { bg: 'bg-black/50 border-red-800', text: 'text-red-500 font-extrabold', label: '☠ MUERTO ☠' },
    };
    
    const status = player.status || 'Activo';
    const config = statusConfig[status];
    const displayLabel = player.statusDetail || config.label;

    const nameClass = status === 'Muerto' 
        ? 'text-red-500' 
        : player.isJourneyman
            ? 'text-slate-400 italic'
            : 'text-white';

    return (
        <div className={`p-2 rounded-md transition-colors duration-300 ${config.bg} border-b border-slate-700/50`}>
            <div className="flex justify-between items-center">
                 <div className="flex items-center gap-2 flex-grow min-w-0">
                    <div className="truncate flex items-center gap-2">
                        <button 
                            type="button"
                            onClick={() => onViewPlayer(player)}
                            className="font-bold text-left hover:underline focus:outline-none focus:ring-1 focus:ring-amber-400 rounded-sm px-1 -mx-1 truncate"
                        >
                            <span className={nameClass}>
                                {player.isStarPlayer && <span className="text-amber-400 mr-1">★</span>}
                                {player.customName}
                            </span>
                        </button>
                        <SppActionIcons actions={player.sppActions || {}} />
                    </div>
                </div>
                <p className="text-sm font-mono text-amber-300 ml-2 flex-shrink-0">{player.spp}</p>
            </div>
            <div className="flex justify-between items-center text-xs mt-1">
                <div className="flex items-center gap-2">
                    <p className="text-slate-400 truncate">{player.position}</p>
                     {canToggleStatus && (player.status === 'Activo' || player.status === 'Reserva') && (
                        <button 
                            onClick={() => onStatusToggle?.(player)}
                            className="text-xs bg-slate-600 hover:bg-slate-500 text-white font-semibold py-0.5 px-2 rounded-full"
                        >
                            {player.status === 'Activo' ? '→ Banquillo' : '→ Al Campo'}
                        </button>
                    )}
                </div>
                <p className={`font-semibold ${config.text}`}>{displayLabel}</p>
            </div>
            {player.lastingInjuries && player.lastingInjuries.length > 0 && (
                <div className="mt-1 text-xs text-red-400 font-semibold">
                    {player.lastingInjuries.join(', ')}
                </div>
            )}
        </div>
    );
};

export default PlayerStatusCard;