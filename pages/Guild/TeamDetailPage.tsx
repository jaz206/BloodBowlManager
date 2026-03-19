import React from 'react';
import type { ManagedTeam, MatchReport } from '../../types';
import { TeamDashboard } from '../../components/guild/TeamDashboard';

interface TeamDetailPageProps {
    team: ManagedTeam;
    onUpdate: (team: ManagedTeam) => void;
    onDeleteRequest: (teamId: string) => void;
    onBack: () => void;
    isGuest: boolean;
    matchReports?: MatchReport[];
}

const TeamDetailPage: React.FC<TeamDetailPageProps> = ({ 
    team, 
    onUpdate, 
    onDeleteRequest, 
    onBack, 
    isGuest, 
    matchReports = [] 
}) => {
    return (
        <TeamDashboard 
            team={team}
            onUpdate={onUpdate}
            onDeleteRequest={onDeleteRequest}
            onBack={onBack}
            isGuest={isGuest}
            matchReports={matchReports}
        />
    );
};

export default TeamDetailPage;

