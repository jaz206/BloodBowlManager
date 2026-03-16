import { GameEvent, GameEventType } from '../../../../types';

/**
 * formatLogEntry — formatea un evento del log para su visualización.
 * Retorna un objeto con el texto formateado, color e icono según el tipo.
 */
export const formatLogEntry = (event: GameEvent): {
    text: string;
    colorClass: string;
    icon: string;
    badge?: string;
} => {
    const typeMap: Partial<Record<GameEventType | string, { color: string; icon: string; badge?: string }>> = {
        'touchdown': { color: 'text-premium-gold', icon: 'emoji_events', badge: 'TD' },
        'EXPULSION': { color: 'text-red-400', icon: 'person_off', badge: '🟥' },
        'DEATH': { color: 'text-blood-red', icon: 'skull', badge: '💀' },
        'injury_casualty': { color: 'text-orange-400', icon: 'emergency', badge: '🩸' },
        'foul_attempt': { color: 'text-yellow-400', icon: 'sports_kabaddi', badge: '⚡' },
        'KICKOFF': { color: 'text-sky-400', icon: 'sports_football', badge: 'KB' },
        'WEATHER': { color: 'text-cyan-400', icon: 'thunderstorm', badge: '🌤' },
        'INFO': { color: 'text-slate-400', icon: 'info', badge: '' },
        'pass_complete': { color: 'text-blue-400', icon: 'sports_football', badge: 'PA' },
        'interception': { color: 'text-purple-400', icon: 'back_hand', badge: 'INT' },
        'mvp_awarded': { color: 'text-premium-gold', icon: 'military_tech', badge: 'MVP' },
    };

    const config = typeMap[event.type] || { color: 'text-slate-500', icon: 'notes', badge: '' };

    const timestamp = event.timestamp ? `[${event.timestamp}]` : '';
    const turnInfo = event.turn ? `T${event.turn}/${event.half === 1 ? '1ª' : '2ª'}` : '';

    return {
        text: event.description,
        colorClass: config.color,
        icon: config.icon,
        badge: config.badge
    };
};

/**
 * filterLogByType — filtra eventos del log por tipo.
 * Útil para el resumen post-partido.
 */
export const filterLogByType = (log: GameEvent[], types: string[]): GameEvent[] => {
    return log.filter(e => types.includes(e.type));
};

/**
 * getMatchStats — calcula estadísticas básicas del partido a partir del log.
 */
export const getMatchStats = (log: GameEvent[], teamId: 'home' | 'opponent') => {
    const teamEvents = log.filter(e => e.team === teamId);
    return {
        touchdowns: teamEvents.filter(e => e.type === 'touchdown').length,
        casualties: teamEvents.filter(e => e.type === 'injury_casualty').length,
        fouls: teamEvents.filter(e => e.type === 'foul_attempt').length,
        expulsions: teamEvents.filter(e => e.type === 'EXPULSION').length,
        passes: teamEvents.filter(e => e.type === 'pass_complete').length,
        interceptions: teamEvents.filter(e => e.type === 'interception').length,
    };
};
