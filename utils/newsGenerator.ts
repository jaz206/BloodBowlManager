import { MatchReport, GameEvent } from '../types';

export const generateMatchArticle = (report: MatchReport) => {
    const { homeTeam, opponentTeam, gameLog, winner, weather } = report;
    
    const headlines = [
        `¡GLORIA EN EL COLISEO! ${homeTeam.score} - ${opponentTeam.score}`,
        `SANGRE Y ARENA: EL DUELO ENTRE ${homeTeam.name.toUpperCase()} Y ${opponentTeam.name.toUpperCase()}`,
        `NUEVA JORNADA DE LANZARROC EN NUFFLE`,
        `CRÓNICA DE UN CHOQUE BRUTAL`,
    ];

    const subHeadlines = [
        "Los gritos de la grada aún resuenan en las gradas del estadio local.",
        "Un partido que pasará a los anales de la historia por su violencia y técnica.",
        "Nuffle bendijo a los valientes en una tarde marcada por el destino.",
    ];

    const intro = `En una jornada marcada por un clima ${weather || 'cambiante'}, los equipos de ${homeTeam.name} y ${opponentTeam.name} se vieron las caras en un duelo que no dejó a nadie indiferente. `;

    let development = '';
    const tds = gameLog.filter(e => {
        const type = (e.type as string).toUpperCase();
        return type === 'TOUCHDOWN' || type === 'TD';
    });
    const injuries = gameLog.filter(e => {
        const type = (e.type as string).toUpperCase();
        return type === 'INJURY' || type.includes('INJURY') || type === 'ARMOR_BREAK';
    });

    if (tds.length > 0) {
        development += `El marcador se movió gracias a las espectaculares jugadas de los anotadores, destacando el despliegue táctico de ${winner === 'home' ? homeTeam.name : winner === 'opponent' ? opponentTeam.name : 'ambos bandos'}. `;
    } else {
        development += "Fue un partido defensivo, donde avanzar cada yarda era una auténtica odisea contra muros de carne y hueso. ";
    }

    if (injuries.length > 0) {
        development += `La enfermería no tuvo descanso; con ${injuries.length} bajas registradas, el suelo de la arena quedó teñido de rojo. `;
    }

    let conclusion = '';
    if (winner === 'draw') {
        conclusion = "Al final, el empate deja un sabor agridulce y promete una revancha sangrienta en el futuro.";
    } else {
        const winnerName = winner === 'home' ? homeTeam.name : opponentTeam.name;
        conclusion = `Con este resultado, ${winnerName} se alza con la victoria, dejando a sus rivales lamiéndose las heridas bajo la sombra de la derrota.`;
    }

    return {
        headline: headlines[Math.floor(Math.random() * headlines.length)],
        subHeadline: subHeadlines[Math.floor(Math.random() * subHeadlines.length)],
        article: intro + development + conclusion,
        summary: `Final: ${homeTeam.score} - ${opponentTeam.score}. ${tds.length} Touchdowns y ${injuries.length} bajas.`
    };
};
