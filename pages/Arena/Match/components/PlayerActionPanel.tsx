import React from 'react';
import { useMatch } from '../context/MatchContext';

/**
 * PlayerActionPanel — panel central de acciones durante el turno activo.
 * Muestra las acciones disponibles: Blitz, Pase, Falta, Manos.
 * Cada acción solo puede usarse una vez por turno (TurnActions tracking).
 */
const PlayerActionPanel: React.FC = () => {
    const {
        activeTeamId,
        turnActions,
        liveHomeTeam,
        liveOpponentTeam,
        handleStrategicAction,
        handleNextTurn,
        setIsTdModalOpen,
        setTdModalTeam,
        setIsInjuryModalOpen,
        setInjuryState,
        openSppModal
    } = useMatch();

    const activeTeam = activeTeamId === 'home' ? liveHomeTeam : liveOpponentTeam;
    const actions = turnActions[activeTeamId];

    const actionButtons = [
        { key: 'blitz', label: 'Blitz', icon: 'sports_martial_arts', color: 'red' },
        { key: 'pass', label: 'Pase', icon: 'sports_football', color: 'blue' },
        { key: 'foul', label: 'Falta', icon: 'sports_kabaddi', color: 'yellow' },
        { key: 'handoff', label: 'Pase de Mano', icon: 'swap_horiz', color: 'purple' }
    ] as const;

    return (
        <div className="flex flex-wrap gap-3 p-4">
            {actionButtons.map(({ key, label, icon, color }) => (
                <button
                    key={key}
                    disabled={actions[key]}
                    onClick={() => handleStrategicAction(key)}
                    className={`action-btn ${actions[key] ? 'opacity-40 cursor-not-allowed' : ''}`}
                    title={actions[key] ? `Ya usaste ${label} este turno` : label}
                >
                    <span className="material-symbols-outlined">{icon}</span>
                    <span className="text-[10px] font-display font-black uppercase tracking-widest">{label}</span>
                    {actions[key] && <span className="text-[8px] text-green-500">✓</span>}
                </button>
            ))}

            <button
                onClick={() => { setTdModalTeam(activeTeamId); setIsTdModalOpen(true); }}
                className="action-btn action-btn--td"
            >
                <span className="material-symbols-outlined">emoji_events</span>
                <span className="text-[10px] font-display font-black uppercase tracking-widest">TD</span>
            </button>

            <button
                onClick={() => setIsInjuryModalOpen(true)}
                className="action-btn action-btn--injury"
            >
                <span className="material-symbols-outlined">emergency</span>
                <span className="text-[10px] font-display font-black uppercase tracking-widest">Lesión</span>
            </button>

            <button
                onClick={handleNextTurn}
                className="action-btn action-btn--turn ml-auto"
            >
                <span className="material-symbols-outlined">skip_next</span>
                <span className="text-[10px] font-display font-black uppercase tracking-widest">Fin Turno</span>
            </button>
        </div>
    );
};

export default PlayerActionPanel;
