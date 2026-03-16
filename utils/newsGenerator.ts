import { MatchReport, GameEvent } from '../types';

/**
 * Transforma descripciones técnicas en pura poesía de sangre y barro (estilo Cabalvisión).
 */
export const transformToEpic = (event: GameEvent): string => {
    const desc = event.description.toLowerCase();
    
    // CASUALTIES & DEATHS
    if (desc.includes('muerte') || event.type === 'DEATH') {
        const name = event.description.split('!')[1]?.trim() || 'el jugador';
        const options = [
            `Nuffle reclamó el alma de ${name} en un impacto que hizo temblar los cimientos del estadio. Su último aliento se mezcló con el barro.`,
            `El sonido del cuello de ${name} quebrándose fue como música para las gradas. Los camilleros solo podrán recoger pedazos de lo que fue una promesa.`,
            `Un impacto definitivo. ${name} exhaló su último suspiro mientras sus compañeros contemplaban, atónitos, la brevedad de la gloria en este juego.`
        ];
        return options[Math.floor(Math.random() * options.length)];
    }

    if (desc.includes('herida') || desc.includes('lesión') || event.type === 'INJURY' || event.type === 'injury_casualty') {
        const options = [
            `El crujido de los huesos de la víctima se escuchó desde los palcos de lujo. Una carnicería necesaria para el espectáculo.`,
            `Su armadura voló en mil pedazos bajo una fuerza bruta inhumana. La enfermería ya está preparando la sierra.`,
            `Un grito de agonía desgarró el aire cuando el impacto encontró su objetivo. Ese jugador no volverá a caminar igual.`
        ];
        return options[Math.floor(Math.random() * options.length)];
    }

    // TOUCHDOWNS
    if (desc.includes('touchdown') || event.type === 'TOUCHDOWN' || event.type === 'touchdown') {
        const options = [
            `Atravesó la línea de gol en un estallido de velocidad y sudor, dejando a los defensas mordiendo el polvo.`,
            `Una internada magistral que culminó con el balón besando el césped de la zona de anotación. ¡Pura magia en el emparrillado!`,
            `Con la gracia de un bailarín y la mala leche de un ogro, consiguió la anotación que hace rugir a las masas.`
        ];
        return options[Math.floor(Math.random() * options.length)];
    }

    // FOULS & EXPULSIONS
    if (desc.includes('falta') || desc.includes('foul') || event.type === 'EXPULSION' || desc.includes('expulsión')) {
        const options = [
            `El reglamento se convirtió en una sugerencia cuando el baco se hundió en las costillas del rival caído.`,
            `¿Fue un golpe bajo? Quizás, pero para cuando el árbitro quiso mirar, el daño ya estaba hecho y la sangre corría.`,
            `Un acto de justicia poética (o juego sucio, según a quién preguntes) que terminó con el infractor camino de las duchas.`
        ];
        return options[Math.floor(Math.random() * options.length)];
    }

    // PASSES & INTERCEPTIONS
    if (desc.includes('intercepción') || desc.includes('interception')) {
        return `¡Un robo de guante blanco! El esferoide cambió de manos en pleno vuelo, cortando la respiración de toda la grada.`;
    }

    if (desc.includes('pase') || desc.includes('pass')) {
        return `El balón surcó los aires dibujando una parábola perfecta antes de encontrar unas manos ansiosas de gloria.`;
    }

    // Default cleaning
    return event.description.replace('!', '.').replace('¡', '').trim();
};

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
        "Las gradas rugieron ante un despliegue de violencia gratuita y técnica exquisita.",
        "Nuffle dictó sentencia en una tarde donde la estrategia se escribió con sudor y se selló con hematomas.",
        "Un duelo de alta tensión donde cada yarda ganada se pagó con el precio del dolor.",
        "La táctica y la furia se fundieron en un abrazo mortal sobre el césped recién cortado."
    ];

    const intros = [
        `La tarde se presentaba con ese aroma inconfundible a día grande. Bajo un cielo ${weather || 'amenazador'}, ${homeTeam.name} y ${opponentTeam.name} saltaron al campo con el cuchillo entre los dientes. Lo que siguió fue una oda al Blood Bowl más puro, ese donde los esquemas saltan por los aires al primer crujido de costillas. `,
        `Abran paso a los gladiadores. El coliseo estaba a reventar para presenciar el duelo entre ${homeTeam.name} y ${opponentTeam.name}. No hubo tregua ni piedad desde el primer silbato. En el emparrillado, cada centímetro era una trinchera. `,
        `Si existe un paraíso para los amantes del contacto extremo, hoy estuvo ubicado en esta Arena. ${homeTeam.name} y ${opponentTeam.name} nos recordaron por qué el Blood Bowl es el deporte de los dioses. `
    ];

    let body = "";
    
    const tds = gameLog.filter(e => String(e.type).toLowerCase() === 'touchdown' || String(e.type).toLowerCase() === 'td').reverse();
    const casualties = gameLog.filter(e => String(e.type).toLowerCase().includes('injury') || String(e.type).toLowerCase().includes('casualty') || String(e.type) === 'DEATH');
    const fouls = gameLog.filter(e => e.type === 'EXPULSION' || String(e.type).toLowerCase().includes('foul'));
    const superbActions = gameLog.filter(e => String(e.type).toLowerCase() === 'interception' || String(e.type).toLowerCase() === 'pass_complete');

    if (tds.length > 0) {
        body += "\n\nMAGIA EN LA ZONA DE ANOTACIÓN\n";
        tds.forEach((td, i) => {
            const prefix = i === 0 ? "La cuenta se abrió de forma magistral cuando" : (i === tds.length -1 && tds.length > 1 ? "La puntilla definitiva llegó cuando" : "La sangría no se detuvo y");
            body += `${prefix} ${transformToEpic(td).toLowerCase()}. `;
        });
    }

    if (casualties.length > 0) {
        body += "\n\nPARTE MÉDICO: LA ENFERMERÍA NO DA ABASTO\n";
        body += `La dureza del choque se cobró su peaje. Los camilleros fueron los protagonistas secundarios de una tarde accidentada. `;
        casualties.slice(0, 3).forEach(cas => {
            body += `${transformToEpic(cas)} `;
        });
        if (casualties.length > 3) {
            body += `Al final, un total de ${casualties.length} bajas confirmadas dejan claro que hoy nadie vino a hacer amigos. `;
        }
    }

    if (superbActions.length > 0) {
        body += "\n\nDETALLES DE CALIDAD\n";
        body += `Más allá de los golpes, hubo espacio para la estética. ${transformToEpic(superbActions[0])} `;
    }

    if (fouls.length > 0) {
        body += "\n\nPOLÉMICA Y JUEGO SUBTERRÁNEO\n";
        body += `¿Hubo juego sucio? No pregunten al árbitro, que estuvo 'despistado'. La tensión estalló en múltiples ocasiones. ${transformToEpic(fouls[0])} `;
    }

    const s3Incidents = gameLog.filter(e => e.description.includes('¡INCIDENCIA S3!'));
    if (s3Incidents.length > 0) {
        body += "\n\nCRÁNICAS DE LA TEMPORADA 3: CAOS EN EL VESTUARIO\n";
        body += "No todo fueron golpes y carreras; el extraño clima de esta temporada dejó su huella. ";
        
        s3Incidents.forEach(inc => {
            const isDistracted = inc.description.toLowerCase().includes('distraído');
            const isIndigestion = inc.description.toLowerCase().includes('indigestión');
            const playerName = inc.description.match(/! (.*?) sufre/)?.[1] || "Un jugador";

            if (isDistracted) {
                const options = [
                    `${playerName} se quedó mirando fijamente una mosca que pasaba por allí en el momento más inoportuno. ¡Alguien debería recordarle que hay un partido en juego!`,
                    `¿Es un pájaro? ¿Es un avión? No, es ${playerName} perdiendo el hilo del partido mientras contemplaba las nubes.`,
                    `La concentración de ${playerName} brilló por su ausencia. Parecía más interesado en el vendedor de perritos calientes que en el balón.`
                ];
                body += `${options[Math.floor(Math.random() * options.length)]} `;
            } else if (isIndigestion) {
                const options = [
                    `A ${playerName} le pasó factura el estofado de trolls de la noche anterior. Su movimiento en el campo era... accidentado.`,
                    `Se comenta que ${playerName} visitó demasiadas veces el puesto de tartas antes del partido. Su armadura parecía apretarle más de la cuenta.`,
                    `Con una mano en el estómago y la otra en el balón, ${playerName} intentó ocultar su malestar, pero Nuffle no perdona una digestión pesada.`
                ];
                body += `${options[Math.floor(Math.random() * options.length)]} `;
            }
        });
    }

    const outro = victor 
        ? `\n\nCon el silbatazo final, la justicia (o la fortuna de Nuffle) coronó a ${victor}. Los ganadores ya preparan los barriles de cerveza para celebrar una victoria que cimenta su estatus en la liga.`
        : `\n\nEl cronómetro se agotó con un empate que sabe a poco. ${homeTeam.name} y ${opponentTeam.name} se retiraron lamiéndose las heridas, sabiendo que este duelo no se ha cerrado, solo se ha pospuesto.`;

    const generatedArticle = `${intros[Math.floor(Math.random() * intros.length)]}${body}${outro}`;

    return {
        headline: headlines[Math.floor(Math.random() * headlines.length)],
        subHeadline: subHeadlines[Math.floor(Math.random() * subHeadlines.length)],
        article: generatedArticle,
        summary: `Ficha Técnica: ${homeTeam.name} ${homeScore} - ${awayScore} ${opponentTeam.name}.`
    };
};
