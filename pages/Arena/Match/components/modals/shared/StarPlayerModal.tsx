import React from 'react';
import { useMatch } from '../../../context/MatchContext';
import StarPlayerModalBase from '../../../../../components/oracle/StarPlayerModal';

const StarPlayerModal: React.FC = () => {
    const { 
        selectedStarPlayer, 
        setSelectedStarPlayer 
    } = useMatch();

    if (!selectedStarPlayer) return null;

    return (
        <StarPlayerModalBase 
            player={selectedStarPlayer} 
            onClose={() => setSelectedStarPlayer(null)} 
        />
    );
};

export default StarPlayerModal;
