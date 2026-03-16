import { ManagedPlayer, ManagedTeam, SppActionType } from '../../../../types';

interface SppEngineContext {
    setLiveHomeTeam: React.Dispatch<React.SetStateAction<ManagedTeam | null>>;
    setLiveOpponentTeam: React.Dispatch<React.SetStateAction<ManagedTeam | null>>;
    logEvent: (type: any, description: string, extra?: any) => void;
    setSppModalState: (state: any) => void;
}

export const updatePlayerSppActionLogic = (ctx: SppEngineContext, player: ManagedPlayer, teamId: 'home' | 'opponent', spp: number, action: SppActionType, description: string) => {
    const { setLiveHomeTeam, setLiveOpponentTeam, logEvent, setSppModalState } = ctx;
    
    if (player.isStarPlayer) return; // Star Players never gain SPP
    const setTeam = teamId === 'home' ? setLiveHomeTeam : setLiveOpponentTeam;

    setTeam(prev => {
        if (!prev) return null;
        return {
            ...prev,
            players: prev.players.map(p => {
                if (p.id === player.id) {
                    const newActions = { ...(p.sppActions || {}) };
                    newActions[action] = (newActions[action] || 0) + 1;
                    return { ...p, spp: p.spp + spp, sppActions: newActions };
                }
                return p;
            })
        };
    });

    const actionTypeMap: Record<SppActionType, string> = {
        'TD': 'touchdown',
        'CASUALTY': 'injury_casualty',
        'PASS': 'pass_complete',
        'INT': 'interception',
        'MVP': 'mvp_awarded',
        'INTERFERENCE': 'INFO',
        'DEFLECT': 'DEFLECT',
        'THROW_TEAM_MATE': 'THROW_TEAM_MATE'
    };

    logEvent(actionTypeMap[action] || 'INFO', `${player.customName} gana ${spp} PE por ${description}.`, { team: teamId, player: player.id });
    setSppModalState({ isOpen: false, type: null, step: 'select_team', teamId: null, selectedPlayer: null });
};
