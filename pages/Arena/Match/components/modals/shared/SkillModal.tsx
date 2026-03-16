import React from 'react';
import { useMatch } from '../../../context/MatchContext';
import SkillModalBase from '../../../../../../components/oracle/SkillModal';

const SkillModal: React.FC = () => {
    const { 
        selectedSkillForModal, 
        setSelectedSkillForModal 
    } = useMatch();

    if (!selectedSkillForModal) return null;

    return (
        <SkillModalBase 
            skill={selectedSkillForModal} 
            onClose={() => setSelectedSkillForModal(null)} 
        />
    );
};

export default SkillModal;
