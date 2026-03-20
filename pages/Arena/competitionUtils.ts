import type { Competition, Matchup } from '../../types';

const cloneJson = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

export const generateJoinCode = (name: string): string => {
    const prefix = (name || 'BLOODBOWL')
        .replace(/[^a-z0-9]/gi, '')
        .slice(0, 4)
        .toUpperCase() || 'BOWL';

    const entropy = typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID().split('-')[0].toUpperCase()
        : Math.random().toString(36).slice(2, 8).toUpperCase();

    return `${prefix}-${entropy}`;
};

export const cloneCompetition = (comp: Competition): Competition => {
    const newComp: Competition = {
        id: comp.id,
        name: comp.name,
        format: comp.format,
        teams: comp.teams.map(t => ({
            ...t,
            teamState: t.teamState ? cloneJson(t.teamState) : t.teamState,
            stats: t.stats ? { ...t.stats } : t.stats,
        })),
        ownerId: comp.ownerId,
        ownerName: comp.ownerName,
        createdBy: comp.createdBy,
        joinCode: comp.joinCode,
        visibility: comp.visibility,
        maxTeams: comp.maxTeams,
        status: comp.status,
        rules: comp.rules ? { ...comp.rules } : undefined,
        baseTeam: comp.baseTeam ? cloneJson(comp.baseTeam) : comp.baseTeam,
        createdAt: comp.createdAt,
        reports: comp.reports ? cloneJson(comp.reports) : [],
    };
    if (comp.schedule) {
        newComp.schedule = {};
        for (const round in comp.schedule) {
            if (Object.prototype.hasOwnProperty.call(comp.schedule, round)) {
                newComp.schedule[round] = comp.schedule[round].map(matchup => ({
                    ...matchup,
                    resolution: matchup.resolution ? JSON.parse(JSON.stringify(matchup.resolution)) : undefined,
                }));
            }
        }
    } else {
        newComp.schedule = null;
    }
    if (comp.bracket) {
        newComp.bracket = {};
        for (const round in comp.bracket) {
            if (Object.prototype.hasOwnProperty.call(comp.bracket, round)) {
                newComp.bracket[round] = comp.bracket[round].map(matchup => ({
                    ...matchup,
                    resolution: matchup.resolution ? JSON.parse(JSON.stringify(matchup.resolution)) : undefined,
                }));
            }
        }
    } else {
        newComp.bracket = null;
    }
    return newComp;
};

export const generateSchedule = (teamNames: string[]): Record<string, Matchup[]> => {
    const teams = [...teamNames];
    if (teams.length % 2 !== 0) {
        teams.push('BYE');
    }
    const numTeams = teams.length;
    const rounds: Record<string, Matchup[]> = {};
    const teamIndices = teams.map((_, i) => i);
    for (let r = 0; r < numTeams - 1; r++) {
        const round: Matchup[] = [];
        for (let i = 0; i < numTeams / 2; i++) {
            const team1Index = teamIndices[i];
            const team2Index = teamIndices[numTeams - 1 - i];
            if (teams[team1Index] !== 'BYE' && teams[team2Index] !== 'BYE') {
                round.push({ team1: teams[team1Index], team2: teams[team2Index] });
            }
        }
        rounds[r.toString()] = round;
        const last = teamIndices.pop()!;
        teamIndices.splice(1, 0, last);
    }
    return rounds;
};

export const generateBracket = (teamNames: string[]): Record<string, Matchup[]> => {
    const shuffledTeams = [...teamNames].sort(() => 0.5 - Math.random());
    let numTeams = shuffledTeams.length;
    const nextPowerOfTwo = Math.pow(2, Math.ceil(Math.log2(numTeams)));
    const byesToAdd = nextPowerOfTwo - numTeams;
    for (let i = 0; i < byesToAdd; i++) {
        shuffledTeams.push('BYE');
    }
    numTeams = nextPowerOfTwo;
    const bracket: Record<string, Matchup[]> = {};
    const firstRound: Matchup[] = [];
    for (let i = 0; i < numTeams; i += 2) {
        const match: Matchup = { team1: shuffledTeams[i], team2: shuffledTeams[i + 1] || 'BYE' };
        if (match.team1 === 'BYE') match.winner = match.team2;
        if (match.team2 === 'BYE') match.winner = match.team1;
        firstRound.push(match);
    }
    bracket['0'] = firstRound;
    let currentRound = firstRound;
    let roundIndex = 1;
    while (currentRound.length > 1) {
        const nextRound: Matchup[] = [];
        for (let i = 0; i < currentRound.length; i += 2) {
            nextRound.push({
                team1: currentRound[i].winner || 'Por determinar',
                team2: currentRound[i + 1]?.winner || 'Por determinar',
            });
        }
        bracket[roundIndex.toString()] = nextRound;
        currentRound = nextRound;
        roundIndex++;
    }
    return bracket;
};
