import React from 'react';
import { MatchProvider } from './Match/context/MatchContext';
import MatchOrchestrator from './Match/MatchOrchestrator';
import { GameBoardProps } from './Match/types/match.types';

/**
 * MatchPage (GameBoard)
 * 
 * Componente principal de la arena de juego. 
 * Ahora actúa como un orquestador ligero que provee el contexto de partido
 * y delega la renderización a MatchOrchestrator.
 * 
 * @param props Datos iniciales del partido y callbacks de persistencia.
 */
const GameBoard: React.FC<GameBoardProps> = (props) => {
    return (
        <MatchProvider props={props}>
            <MatchOrchestrator />
        </MatchProvider>
    );
};

export default GameBoard;
