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
            `CRÓNICA NEGRA: ${concederName.toUpperCase()} LANZA LA TOALLA EN UN ACTO DE COBARDÍA HISTÓRICA`,
            `¡DESHONRA EN LA ARENA! LA RENDICIÓN DE ${concederName.toUpperCase()} MANCHA EL BALÓN`,
            `PÁNICO Y RETIRADA: ${concederName.toUpperCase()} HUYE DEL CÉSPED ANTE LA SUPERIORIDAD RIVAL`
        ];
    } else if (victor) {
        headlines = [
            `ÉPICA Y SANGRE: ${victor.toUpperCase()} IMPONE SU LEY EN UN PARTIDO PARA EL RECUERDO`,
            `¡CÁTEDRA DE BLOOD BOWL! ${victor.toUpperCase()} DESARTICULA A UN DESCONOCIDO ${loser.toUpperCase()}`,
            `EL TRONO DE NUFFLE TIENE DUEÑO: EXHIBICIÓN TOTAL DE ${victor.toUpperCase()}`,
            `TORMENTA PERFECTA: ${victor.toUpperCase()} PASA POR ENCIMA DE ${loser.toUpperCase()} CON UN JUEGO DEVASTADOR`
        ];
    } else {
        headlines = [
            `GUERRA SIN VENCEDOR: ${homeTeam.name.toUpperCase()} Y ${opponentTeam.name.toUpperCase()} FIRMAN LAS TABLAS EN EL INFIERNO`,
            `BATALLA DE DESGASTE: NADIE CEDE EN EL CHOQUE DE TRENES ENTRE ${homeTeam.name.toUpperCase()} Y ${opponentTeam.name.toUpperCase()}`,
            `REPARTO DE GOLPES Y PUNTOS: EL EMPREARRILLADO NO DICTA SENTENCIA`,
        ];
    }

    const subHeadlines = [
        "Las gradas rugieron ante un despliegue de violencia gratuita y técnica exquisita que dignifica este deporte.",
        "Nuffle dictó sentencia en una tarde donde la estrategia se escribió con sudor y se selló con hematomas.",
        "Un duelo de alta tensión donde cada yarda ganada se pagó con el precio del dolor y la gloria.",
        "La táctica y la furia se fundieron en un abrazo mortal sobre el césped recién cortado (y pronto ensangrentado)."
    ];

    const intros = [
        `La tarde se presentaba con ese aroma inconfundible a día grande. Bajo un cielo ${weather || 'amenazador'}, ${homeTeam.name} y ${opponentTeam.name} saltaron al campo con el cuchillo entre los dientes. Lo que siguió fue una oda al Blood Bowl más puro, ese donde los esquemas saltan por los aires al primer crujido de costillas. `,
        `Abran paso a los gladiadores. El coliseo estaba a reventar para presenciar el duelo entre ${homeTeam.name} y ${opponentTeam.name}. No hubo tregua ni piedad desde el primer silbato. En el emparrillado, cada centímetro era una trinchera y cada posesión un tesoro custodiado con la vida. `,
        `Si existe un paraíso para los amantes del contacto extremo, hoy estuvo ubicado en esta Arena. ${homeTeam.name} y ${opponentTeam.name} nos recordaron por qué el Blood Bowl es el deporte de los dioses. Crónica de una batalla anunciada que cumplió con creces las expectativas de los paladares más exigentes. `
    ];

    let body = "";
    
    // Group events and clean names/descriptions
    const cleanDescription = (desc: string) => desc.replace('!', '.').replace('¡', '').trim();

    const tds = gameLog.filter(e => String(e.type).toLowerCase() === 'touchdown' || String(e.type).toLowerCase() === 'td').reverse();
    const casualties = gameLog.filter(e => String(e.type).toLowerCase().includes('injury') || String(e.type).toLowerCase().includes('casualty'));
    const fouls = gameLog.filter(e => String(e.type).toLowerCase().includes('foul') || String(e.type).toLowerCase().includes('expulsion'));
    const superbActions = gameLog.filter(e => String(e.type).toLowerCase() === 'interception' || String(e.type).toLowerCase() === 'pass_complete');

    if (tds.length > 0) {
        body += "\n\nMAGIA EN LA ZONA DE ANOTACIÓN\n";
        tds.forEach((td, i) => {
            const prefix = i === 0 ? "La cuenta se abrió de forma magistral cuando" : (i === tds.length -1 && tds.length > 1 ? "La puntilla definitiva llegó de la mano de" : "La sangría no se detuvo y");
            const desc = cleanDescription(td.description);
            body += `${prefix} ${desc.charAt(0).toLowerCase() + desc.slice(1)}. Una jugada que será analizada por los expertos de Cabalvisión durante meses. `;
        });
    } else {
        body += "\n\nDEFENSAS DE HIERRO Y CIERRE TOTAL\n";
        body += `Fue un partido de colmillo retorcido en las zonas rojas. Las defensas se impusieron con una disciplina espartana, convirtiendo cada intento de Touchdown en un muro infranqueable de carne y mala leche. No hubo fisuras, solo resistencia pura. `;
    }

    if (casualties.length > 0) {
        body += "\n\nPARTE MÉDICO: LA ENFERMERÍA NO DA ABASTO\n";
        body += `La dureza del choque se cobró su peaje en el físico de los jugadores. Los camilleros fueron los protagonistas secundarios de una tarde accidentada. `;
        casualties.slice(0, 3).forEach(cas => {
            const desc = cleanDescription(cas.description);
            body += `El silencio se hizo en la grada cuando ${desc.charAt(0).toLowerCase() + desc.slice(1)}. Un impacto que se escuchó hasta en los palcos de lujo. `;
        });
        if (casualties.length > 3) {
            body += `Al final, un total de ${casualties.length} bajas confirmadas dejan claro que hoy nadie vino a hacer amigos. `;
        }
    }

    if (superbActions.length > 0) {
        body += "\n\nDETALLES DE CALIDAD\n";
        const bestAction = cleanDescription(superbActions[0].description);
        body += `Más allá de los golpes, hubo espacio para la estética. ${bestAction.charAt(0).toLowerCase() + bestAction.slice(1)} fue el momento 'premium' de un encuentro que también tuvo su dosis de finura táctica. `;
    }

    if (fouls.length > 0) {
        body += "\n\nPOLÉMICA Y JUEGO SUBTERRÁNEO\n";
        const firstFoul = cleanDescription(fouls[0].description);
        body += `¿Hubo juego sucio? No pregunten al árbitro, que estuvo 'despistado' en momentos clave. La tensión estalló cuando ${firstFoul.charAt(0).toLowerCase() + firstFoul.slice(1)}. El reglamento se convirtió en una sugerencia y el césped en una taberna tras la medianoche. `;
    }

    const outro = victor 
        ? `\n\nCon el silbatazo final, la justicia (o la fortuna de Nuffle) coronó a ${victor}. El vestuario perdedor era un poema de frustración, mientras que los ganadores ya preparan los barriles de cerveza para celebrar una victoria que cimenta su estatus en la liga.`
        : `\n\nEl cronómetro se agotó con un empate que sabe a poco para unos y a gloria para otros. ${homeTeam.name} y ${opponentTeam.name} se retiraron lamiéndose las heridas, sabiendo que este duelo no se ha cerrado, solo se ha pospuesto para una futura revancha sangrienta.`;

    const generatedArticle = `${intros[Math.floor(Math.random() * intros.length)]}${body}${outro}`;

    return {
        headline: headlines[Math.floor(Math.random() * headlines.length)],
        subHeadline: subHeadlines[Math.floor(Math.random() * subHeadlines.length)],
        article: generatedArticle,
        summary: `Ficha Técnica: ${homeTeam.name} ${homeScore} - ${awayScore} ${opponentTeam.name}. Total: ${tds.length} TD(s), ${casualties.length} Lesión(es).`
    };
};
