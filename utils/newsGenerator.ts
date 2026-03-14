import { MatchReport, GameEvent } from '../types';

export const generateMatchArticle = (report: MatchReport) => {
    const { homeTeam, opponentTeam, gameLog, winner, weather } = report;
    
    const homeScore = homeTeam.score;
    const awayScore = opponentTeam.score;

    const victor = homeScore > awayScore ? homeTeam.name : (awayScore > homeScore ? opponentTeam.name : null);
    const loser = victor === homeTeam.name ? opponentTeam.name : homeTeam.name;

    let headlines = [];
    if (report.wasConceded && report.wasConceded !== 'none') {
        const concederName = report.wasConceded === 'home' ? homeTeam.name : opponentTeam.name;
        headlines = [
            `¡HUÍDA Y DESHONRA! ${concederName.toUpperCase()} ABANDONA EL CAMPO ANTE EL TERROR`,
            `ESCÁNDALO EN LA ARENA: VERGONZOSA RENDICIÓN DE ${concederName.toUpperCase()}`
        ];
    } else if (victor) {
        headlines = [
            `¡BAÑO DE SANGRE Y GLORIA! ${victor.toUpperCase()} CONQUISTA EL EMPARRILLADO ANTE ${loser.toUpperCase()}`,
            `¡EXHIBICIÓN HISTÓRICA! ${victor.toUpperCase()} APLASTA LAS ESPERANZAS DE ${loser.toUpperCase()}`,
            `¡LOCURA EN EL ESTADIO! ${victor.toUpperCase()} SE IMPONE EN UN DUELO DE TITANES CONTRA ${loser.toUpperCase()}`
        ];
    } else {
        headlines = [
            `¡COMBATE NULO! SANGRE Y SUDOR PERO SIN VENCEDOR ENTRE ${homeTeam.name.toUpperCase()} Y ${opponentTeam.name.toUpperCase()}`,
            `¡TABLAS EN EL INFIERNO! ${homeTeam.name.toUpperCase()} Y ${opponentTeam.name.toUpperCase()} SE REPARTEN LOS GOLPES`,
        ];
    }

    const subHeadlines = [
        "Un partido que pasará a los anales de la historia por su violencia y técnica despiadada.",
        "Los gritos de la grada aún resuenan y el césped sigue teñido de un intenso rojo carmesí.",
        "Nuffle sonrió a los valientes en una tarde donde la táctica se diluyó en un baño de sangre."
    ];

    const intros = [
        `El ambiente era eléctrico desde el silbatazo inicial bajo un clima ${weather || 'inclemente'}. Los aficionados abarrotaron el coliseo sabiendo que el choque entre ${homeTeam.name} y ${opponentTeam.name} no decepcionaría a los paladares más crudos. `,
        `En una tarde donde el olor a linimento, cerveza enana y sangre fresca dominaba el aire, ${homeTeam.name} y ${opponentTeam.name} nos regalaron un espectáculo brutal bajo los dominios territoriales de Nuffle. `,
        `Si algún elfo estirado dudaba de por qué este es el deporte rey del Viejo Mundo, este partido despejó las dudas a base de placajes rompehuesos y fintas imposibles. `
    ];

    let body = "";
    
    // Group events
    const tds = gameLog.filter(e => String(e.type).toLowerCase() === 'touchdown').reverse();
    const casualties = gameLog.filter(e => String(e.type).toLowerCase().includes('injury_casualty'));
    const fouls = gameLog.filter(e => String(e.type).toLowerCase().includes('foul_success') || String(e.type).toLowerCase().includes('foul'));

    if (tds.length > 0) {
        body += "\n\nLA FIESTA DE LA ANOTACIÓN\n";
        tds.forEach((td, i) => {
            const prefix = i === 0 ? "El marcador se inauguró cuando" : (i === tds.length -1 && tds.length > 1 ? "Para poner la estocada final, presenciamos cómo" : "La sangría de puntos continuó cuando");
            let textClean = td.description.replace('!', '.').replace('¡', '');
            body += `${prefix} ${textClean.charAt(0).toLowerCase() + textClean.slice(1)} Una jugada maestra que sin duda ocupará las portadas de Cabalvisión la próxima semana. `;
        });
    } else {
        body += "\n\nMURO DE CARNE Y HUESO\n";
        body += `Fue un partido extremadamente correoso en las trincheras, una auténtica odisea donde avanzar cada yarda se cobraba en cuervos y moretones. La defensa reinó sobre el ataque en estado puro. `;
    }

    if (casualties.length > 0) {
        body += "\n\nHOSPITAL DE CAMPAÑA\n";
        body += `Pero este deporte no va solo de proteger el óvalo pigmeo. La enfermería tuvo trabajo extra y los boticarios sudaron la gota gorda. `;
        casualties.slice(0, 3).forEach(cas => {
            let textClean = cas.description.replace('!', '.').replace('¡', '');
            body += `Las gradas enmudecieron por un segundo tras ver cómo ${textClean.charAt(0).toLowerCase() + textClean.slice(1)} `;
        });
        if (casualties.length > 3) {
            body += `¡Y eso fue solo el triste calentamiento! Se registraron ${casualties.length} bajas confirmadas. `;
        }
    }

    if (fouls.length > 0) {
        body += "\n\nLA POLÉMICA DEL PARTIDO\n";
        let firstFoul = fouls[0].description.replace('!', '.').replace('¡', '');
        body += `¿Y qué sería de un gran partido sin su buena dosis de juego sucio? La grada enloqueció y el colegiado desvió la mirada sospechosamente cuando ${firstFoul.charAt(0).toLowerCase() + firstFoul.slice(1)} `;
        if (fouls.length > 1) {
            body += `La tensión fue en constante aumento, convirtiendo ciertas franjas del césped en una pelea barriobajera que terminó con quejas a la comisión de reglas. `;
        }
    }

    const outro = victor 
        ? `\n\nAl dictado inexorable del cronómetro, ${victor} cantó victoria definitiva en la Arena. El cuerpo técnico perdedor tendrá que dar exhaustivas explicaciones a la directiva esta noche, mientras que los ganadores ya celebran su legado con rondas infinitas en la taberna.`
        : `\n\nCon el pitido de cierre, el luminoso reflejó el inamovible y desgastador empate. Ambos séquitos regresan a los vestuarios lamiéndose las heridas, sabiendo que Nuffle exigirá un vencedor la próxima vez.`;

    const generatedArticle = `${intros[Math.floor(Math.random() * intros.length)]}${body}${outro}`;

    return {
        headline: headlines[Math.floor(Math.random() * headlines.length)],
        subHeadline: subHeadlines[Math.floor(Math.random() * subHeadlines.length)],
        article: generatedArticle,
        summary: `Final: ${homeTeam.name} ${homeScore} - ${awayScore} ${opponentTeam.name}. ${tds.length} TDs, ${casualties.length} bajas mayores.`
    };
};
