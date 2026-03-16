import React, { createContext, useContext, ReactNode } from 'react';
import { useMatchState } from '../hooks/useMatchState';
import { useMatchActions } from '../hooks/useMatchActions';
import { GameBoardProps } from '../types/match.types';

type MatchContextType = ReturnType<typeof useMatchState> & ReturnType<typeof useMatchActions>;

const MatchContext = createContext<MatchContextType | undefined>(undefined);

export const MatchProvider: React.FC<{ children: ReactNode; props: GameBoardProps }> = ({ children, props }) => {
    const state = useMatchState(props);
    const actions = useMatchActions(state, props);

    const value = {
        ...state,
        ...actions
    };

    return (
        <MatchContext.Provider value={value}>
            {children}
        </MatchContext.Provider>
    );
};

export const useMatch = () => {
    const context = useContext(MatchContext);
    if (!context) {
        throw new Error('useMatch must be used within a MatchProvider');
    }
    return context;
};
