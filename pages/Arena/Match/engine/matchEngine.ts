import { GameState, GameStatusState } from '../types/match.types';
import { ManagedTeam } from '../../../../types';

interface MatchEngineContext {
    turn: number;
    half: number;
    setTurn: React.Dispatch<React.SetStateAction<number>>;
    setHalf: React.Dispatch<React.SetStateAction<number>>;
    setGameState: React.Dispatch<React.SetStateAction<GameState>>;
    setGameStatus: React.Dispatch<React.SetStateAction<GameStatusState>>;
    firstHalfReceiver: 'home' | 'opponent' | null;
    homeTeam: ManagedTeam | null;
    opponentTeam: ManagedTeam | null;
    logEvent: (type: any, description: string, extra?: any) => void;
}

interface NextTurnContext {
    activeTeamId: 'home' | 'opponent';
    half: number;
    setTurn: React.Dispatch<React.SetStateAction<number>>;
    setActiveTeamId: React.Dispatch<React.SetStateAction<'home' | 'opponent'>>;
    setTurnActions: React.Dispatch<React.SetStateAction<any>>;
    handleHalftime: () => void;
    setGameState: React.Dispatch<React.SetStateAction<GameState>>;
    logEvent: (type: any, description: string) => void;
}

/**
 * handleHalftimeLogic — transición al descanso entre partes.
 * Reinicia el turno, cambia a la segunda parte, determina el equipo receptor
 * y envía al estado pre_game (fase de despliegue).
 */
export const handleHalftimeLogic = (ctx: MatchEngineContext) => {
    const {
        setTurn, setHalf, logEvent, setGameStatus,
        firstHalfReceiver, homeTeam, opponentTeam, setGameState
    } = ctx;

    setTurn(0);
    setHalf(2);
    logEvent('INFO', 'Fin de la primera parte. ¡Comienza la segunda parte!');
    setGameStatus(prev => ({ ...prev, kickoffEvent: null }));

    if (firstHalfReceiver) {
        const secondHalfReceiver = firstHalfReceiver === 'home' ? 'opponent' : 'home';
        setGameStatus(prev => ({ ...prev, receivingTeam: secondHalfReceiver }));
        const receiverName = secondHalfReceiver === 'home' ? homeTeam?.name : opponentTeam?.name;
        logEvent('INFO', `Recibe en la segunda parte: ${receiverName}.`);
    }

    // Ir directamente al despliegue de segunda parte (paso 2 del pre_game)
    setGameState('pre_game');
};

/**
 * handleNextTurnLogic — avanza el turno y alterna el equipo activo.
 * Al final de los 8 turnos del equipo visitante, inicia el descanso o fin de partido.
 */
export const handleNextTurnLogic = (ctx: NextTurnContext) => {
    const {
        activeTeamId, setTurn, setActiveTeamId,
        setTurnActions, half, handleHalftime, setGameState, logEvent
    } = ctx;

    if (activeTeamId === 'opponent') {
        setTurn(t => {
            const nextTurn = t + 1;
            if (nextTurn > 8) {
                if (half === 1) handleHalftime();
                else {
                    logEvent('INFO', '¡Fin del partido!');
                    setGameState('post_game');
                }
                return t;
            }
            logEvent('INFO', `Comienza el Turno ${nextTurn}.`);
            return nextTurn;
        });
        setActiveTeamId('home');
    } else {
        setActiveTeamId('opponent');
    }

    setTurnActions({
        home: { blitz: false, pass: false, foul: false, handoff: false },
        opponent: { blitz: false, pass: false, foul: false, handoff: false }
    });
};
