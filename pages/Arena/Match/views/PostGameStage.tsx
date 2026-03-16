import React from 'react';
import { useMatch } from '../context/MatchContext';

/**
 * PostGameStage — renderiza el asistente post-partido.
 * Incluye: MVP, bajas, ingresos, resumen y guardado de datos.
 *
 * NOTE: Placeholder para migración del case 'post_game' de MatchPage.tsx.
 * La lógica real (PostGameWizardComponent) se encapsula aquí.
 */
import PostGameWizardComponent from '../../../../components/arena/PostGameWizard';

/**
 * PostGameStage — renderiza el asistente post-partido.
 * Incluye: MVP, bajas, ingresos, resumen y guardado de datos.
 */
const PostGameStage: React.FC = () => {
    const {
        score,
        liveHomeTeam,
        liveOpponentTeam,
        homeTeam,
        fame,
        playersMissingNextGame,
        concessionState,
        handleConfirmPostGame
    } = useMatch();

    if (!homeTeam || !liveHomeTeam || !liveOpponentTeam) {
        return <div className="flex items-center justify-center py-20 text-premium-gold font-display font-black animate-pulse uppercase tracking-widest">Finalizando Encuentro...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto py-6 animate-fade-in">
            <PostGameWizardComponent 
                initialHomeTeam={homeTeam} 
                finalHomeTeam={liveHomeTeam} 
                opponentTeam={liveOpponentTeam} 
                score={score} 
                fame={fame.home} 
                playersMNG={playersMissingNextGame.filter(p => p.teamId === 'home')} 
                onConfirm={handleConfirmPostGame} 
                initialConcession={concessionState} 
            />
        </div>
    );
};

export default PostGameStage;
