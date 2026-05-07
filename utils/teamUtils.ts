
import { ManagedPlayer, ManagedTeam, ELITE_SKILLS, ManagedTeamSnapshot, Team, Skill } from '../types';
import { findSkillRecord } from './skillUtils';

export const calculateTeamValue = (
    team: ManagedTeam | null | undefined,
    includeInducements = false,
    baseRoster?: Team | null,
    skillCatalog: Skill[] = []
): number => {
    if (!team) return 0;
    if (!baseRoster) return 0;

    const playersValue = team.players.reduce((sum, p) => {
        let improvementsValue = 0;
        if (p.advancements && p.advancements.length > 0) {
            improvementsValue = p.advancements.reduce((advSum, adv) => {
                let baseValue = 0;
                switch (adv.type) {
                    case 'RandomPrimary': baseValue = 10000; break;
                    case 'ChosenPrimary': baseValue = 20000; break;
                    case 'RandomSecondary': baseValue = 20000; break;
                    case 'ChosenSecondary': baseValue = 40000; break;
                    case 'Characteristic':
                        // Season 3 Cost Table (Attribute increments)
                        if (adv.characteristicName === 'FU') baseValue = 60000;
                        else if (adv.characteristicName === 'AG') baseValue = 30000;
                        else if (adv.characteristicName === 'PA' || adv.characteristicName === 'MV') baseValue = 20000;
                        else baseValue = 10000; // AR
                        break;
                }
                
                // Add Season 3 Elite Penalty (+10k MO)
                let eliteBonus = 0;
                if (adv.skillName) {
                    const skillEntry = findSkillRecord(skillCatalog, adv.skillName);
                    if (skillEntry && (skillEntry.isElite || ELITE_SKILLS.includes(skillEntry.keyEN))) {
                        eliteBonus = 10000;
                    }
                }
                
                return advSum + baseValue + eliteBonus;
            }, 0);
        } else {
            // Fallback for legacy skills
            improvementsValue = (p.gainedSkills || []).reduce((skillSum, skillName) => {
                // Heuristic for secondary skills if not explicitly marked
                const isSecondary = skillName?.toLowerCase().includes('secundaria');
                let baseValue = isSecondary ? 40000 : 20000;
                
                // Add Season 3 Elite Penalty (+10k MO)
                let eliteBonus = 0;
                const skillEntry = findSkillRecord(skillCatalog, skillName);
                if (skillEntry && (skillEntry.isElite || ELITE_SKILLS.includes(skillEntry.keyEN))) {
                    eliteBonus = 10000;
                }
                
                return skillSum + baseValue + eliteBonus;
            }, 0);
        }
        return sum + p.cost + improvementsValue;
    }, 0);

    const rerollsValue = team.rerolls * baseRoster.rerollCost;
    const apothecaryValue = team.apothecary ? 50000 : 0;
    const dedicatedFansValue = Math.max(0, (team.dedicatedFans - 1) * 10000);
    const cheerleadersValue = team.cheerleaders * 10000;
    const assistantCoachesValue = team.assistantCoaches * 10000;

    let total = playersValue + rerollsValue + apothecaryValue + cheerleadersValue + assistantCoachesValue + dedicatedFansValue;

    if (includeInducements) {
        // Add temporary staff
        total += (team.tempCheerleaders || 0) * 10000;
        total += (team.tempAssistantCoaches || 0) * 10000;
        
        // Add bribes (50k for specific teams, 100k for others)
        if (team.tempBribes) {
            const bribeCost = (baseRoster.specialRules || []).includes("Sobornos y corrupción") ? 50000 : 100000;
            total += team.tempBribes * bribeCost;
        }
    }

    return total;
};

export interface MatchReadyTeamSummary {
    matchReadyTeam: ManagedTeam;
    availablePlayers: ManagedPlayer[];
    unavailablePlayers: ManagedPlayer[];
    availableCount: number;
    unavailableCount: number;
    journeymenNeeded: number;
    realTV: number;
    fullTV: number;
    tvLoss: number;
}

export const buildMatchReadyTeamSummary = (
    team: ManagedTeam | null | undefined,
    baseRoster?: Team | null,
    skillCatalog: Skill[] = []
): MatchReadyTeamSummary | null => {
    if (!team) return null;

    const unavailablePlayers = team.players.filter(player =>
        player.status === 'Muerto' ||
        player.status === 'Lesionado' ||
        (player.missNextGame || 0) > 0
    );

    const availablePlayers = team.players.filter(player =>
        !unavailablePlayers.some(unavailable => unavailable.id === player.id)
    );

    const matchReadyTeam: ManagedTeam = {
        ...team,
        players: availablePlayers.map(player => ({
            ...player,
            status: player.status === 'Activo' ? 'Activo' : 'Reserva',
        })),
    };

    const fullTV = baseRoster
        ? calculateTeamValue(team, false, baseRoster, skillCatalog)
        : (team.totalTV || 0);
    const realTV = baseRoster
        ? calculateTeamValue(matchReadyTeam, false, baseRoster, skillCatalog)
        : (team.totalTV || 0);

    return {
        matchReadyTeam: {
            ...matchReadyTeam,
            totalTV: realTV,
        },
        availablePlayers,
        unavailablePlayers,
        availableCount: availablePlayers.length,
        unavailableCount: unavailablePlayers.length,
        journeymenNeeded: Math.max(0, 11 - availablePlayers.length),
        realTV,
        fullTV,
        tvLoss: Math.max(0, fullTV - realTV),
    };
};

export const createTeamSnapshot = (team: ManagedTeam, matchId?: string): ManagedTeamSnapshot => {
    // Deep clone the team but exclude snapshots to avoid circular/deep nesting
    const { snapshots, ...teamState } = JSON.parse(JSON.stringify(team));
    
    return {
        id: new Date().getTime().toString(),
        timestamp: new Date().toISOString(),
        matchId,
        teamState: teamState as any
    };
};
