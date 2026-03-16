import React from 'react';
import { useMatch } from '../../context/MatchContext';
import PlayerStatusCard from '../../../../../components/arena/PlayerStatusCard';

/**
 * MatchSidebarLeft — sidebar izquierdo del partido en curso.
 * Muestra el equipo local: jugadores en campo, banquillo, bajas y estadísticas.
 */
const MatchSidebarLeft: React.FC = () => {
    const {
        liveHomeTeam,
        homeTV,
        score,
        ballCarrierId,
        handleSkillClick,
        setViewingPlayer,
        handlePlayerStatusToggle,
        handleBallToggle,
        handleUpdatePlayerCondition,
        setSelectedPlayerForAction,
        selectedPlayerForAction
    } = useMatch();

    if (!liveHomeTeam) return null;

    const onField = liveHomeTeam.players.filter(p => p.status === 'Activo');
    const onBench = liveHomeTeam.players.filter(p => p.status === 'Reserva');
    const casualties = liveHomeTeam.players.filter(p =>
        p.status === 'KO' || p.status === 'Lesionado' || p.status === 'Muerto' || p.status === 'Expulsado'
    );

    return (
        <div className="flex flex-col gap-4 h-full overflow-y-auto">
            {/* Header del equipo */}
            <div className="flex items-center justify-between px-1">
                <div>
                    <h3 className="text-base font-display font-black text-sky-400 uppercase italic leading-none">
                        {liveHomeTeam.name}
                    </h3>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{liveHomeTeam.rosterName}</p>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-display font-black text-white">{score.home}</p>
                    <p className="text-[8px] text-slate-500 uppercase font-bold">TDs</p>
                </div>
            </div>

            {/* Jugadores en campo */}
            <div>
                <p className="text-[9px] font-display font-black text-slate-500 uppercase tracking-widest mb-2">
                    En Campo ({onField.length}/11)
                </p>
                <div className="space-y-1">
                    {onField.map(player => (
                        <PlayerStatusCard
                            key={player.id}
                            player={player}
                            onViewPlayer={setViewingPlayer}
                            onSkillClick={handleSkillClick}
                            canToggleStatus={false}
                        />
                    ))}
                </div>
            </div>

            {/* Banquillo */}
            {onBench.length > 0 && (
                <div>
                    <p className="text-[9px] font-display font-black text-slate-500 uppercase tracking-widest mb-2">
                        Reservas ({onBench.length})
                    </p>
                    <div className="space-y-1">
                        {onBench.map(player => (
                            <PlayerStatusCard
                                key={player.id}
                                player={player}
                                onViewPlayer={setViewingPlayer}
                                onSkillClick={handleSkillClick}
                                canToggleStatus={false}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Bajas */}
            {casualties.length > 0 && (
                <div>
                    <p className="text-[9px] font-display font-black text-red-500/70 uppercase tracking-widest mb-2">
                        Bajas ({casualties.length})
                    </p>
                    <div className="space-y-1">
                        {casualties.map(player => (
                            <PlayerStatusCard
                                key={player.id}
                                player={player}
                                onViewPlayer={setViewingPlayer}
                                onSkillClick={handleSkillClick}
                                canToggleStatus={false}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MatchSidebarLeft;
