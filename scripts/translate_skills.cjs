const fs = require('fs');
const path = 'c:/Users/jazex/Documents/Antigravity/BloodBowlManager/data/skills.ts';
let content = fs.readFileSync(path, 'utf8');

const translations = {
    "Agallas": "Cuando este jugador realiza una acción de Bloqueo (por sí sola o como parte de un Blitz), si el objetivo tiene una Fuerza mayor que la de este jugador antes de contar apoyos pero después de otros modificadores, lanza 1D6 y suma la Fuerza de este jugador. Si el total es mayor que la Fuerza del objetivo, la Fuerza de este jugador aumenta para igualar la del objetivo durante este Bloqueo.",
    "Garras": "Cuando realices una tirada de Armadura contra un jugador oponente que haya sido Derribado como resultado de un Bloqueo realizado por este jugador, un resultado de 8+ antes de aplicar modificadores romperá su armadura, independientemente de su valor de Armadura real.",
    "Atrapar": "Este jugador puede repetir una tirada de Agilidad fallida al intentar atrapar el balón.",
    "Cabeza de Hueso": "Cuando este jugador se activa, incluso si está Derribado o ha perdido su Zona de Defensa, después de declarar la acción pero antes de realizarla, lanza 1D6. Con un 1, el jugador olvida qué estaba haciendo y su activación termina. Pierde su Zona de Defensa hasta su próxima activación. Con un 2+, continúa normalmente.",
    "Placar": "Cuando se aplica un resultado de 'Ambos Derribados' durante un Bloqueo, este jugador puede elegir ignorarlo y no ser Derribado.",
    "Placaje": "Cuando un jugador oponente intenta Esquivar desde una casilla en la que está marcado por este jugador, ese oponente no puede usar la habilidad Esquivar. Además, si este jugador realiza un Bloqueo y el resultado es 'Tropezón', el oponente no puede usar Esquivar.",
    "Esquivar": "Una vez por turno de equipo, este jugador puede repetir una tirada de Agilidad fallida al intentar Esquivar. Además, puede elegir usar esta habilidad cuando es el objetivo de un Bloqueo y se aplica un resultado de 'Tropezón'.",
    "Defensa": "Este jugador puede ofrecer apoyos tanto ofensivos como defensivos independientemente de cuántos jugadores oponentes lo estén marcando.",
    "Mantenerse Firme": "Este jugador puede elegir no ser empujado, ya sea como resultado de un Bloqueo realizado contra él o por un empujón en cadena.",
    "Golpe Poderoso (+1)": "Cuando un jugador oponente es Derribado como resultado de un Bloqueo de este jugador, puedes modificar la tirada de Armadura o de Herida en +1. El modificador se aplica después de realizar la tirada.",
    "Golpe Poderoso (+2)": "Cuando un jugador oponente es Derribado como resultado de un Bloqueo de este jugador, puedes modificar la tirada de Armadura o de Herida en +2. El modificador se aplica después de realizar la tirada.",
    "Pasar": "Este jugador puede repetir una tirada de Habilidad de Pase fallida al realizar una acción de Pase.",
    "Manos Seguras": "Este jugador puede repetir cualquier intento fallido de recoger el balón. Además, la habilidad Balón Robado no puede usarse contra él.",
    "Pies Firmes": "Una vez por turno de equipo, este jugador puede repetir la tirada de 1D6 al intentar un Ir a por Todo (Rush).",
    "Esprintar": "Cuando este jugador realiza cualquier acción que incluya movimiento, puede intentar Ir a por Todo tres veces en lugar de las dos habituales.",
    "Lucha": "Este jugador puede usar esta habilidad cuando se aplica un resultado de 'Ambos Derribados'. En lugar de aplicarlo normalmente, ambos jugadores quedan Derribados (sin tirar armadura excepto si otras reglas lo indican).",
    "Furia": "Cada vez que este jugador realiza un Bloqueo, debe seguir al oponente si es empujado. Si el objetivo sigue en pie, este jugador debe realizar un segundo Bloqueo contra el mismo objetivo si puede seguirlo.",
    "Regeneración": "Después de una tirada de Casualidad contra este jugador, lanza 1D6. Con un 4+, la Casualidad se descarta y el jugador va a la caja de Reservas.",
    "Enraizarse": "Al activarse, lanza 1D6. Con un 1, el jugador queda Enraizado: no puede moverse de su casilla hasta el final de la entrada o hasta ser Derribado.",
    "Siempre Hambriento": "Si este jugador intenta Lanzar Compañero, lanza 1D6. Con un 1, intenta comerse al compañero. Lanza otro 1D6: con 1 el compañero es devorado y eliminado definitivamente.",
    "Lanzar Compañero": "Si este jugador tiene Fuerza 5 o más, puede realizar la acción Lanzar Compañero con un compañero que tenga la habilidad Buena Gente.",
    "Buena Gente": "Si este jugador tiene Fuerza 3 o menos, puede ser lanzado por un compañero con la habilidad Lanzar Compañero.",
    "Canijo": "Ignora modificadores por ser marcado al Esquivar (a menos que tenga Motosierra, etc.). Las tiradas de Herida contra él usan la tabla de Canijos.",
    "Diminuto": "Suma +1 a las tiradas de Agilidad para Esquivar. Los oponentes que esquiven hacia su Zona de Defensa no sufren penalización.",
    "Cola Prensil": "Los oponentes que intenten Esquivar o Saltar fuera de su Zona de Defensa restan -1 a su tirada de Agilidad.",
    "Cuernos": "Cuando realiza un Blitz, suma +1 a su Fuerza durante el Bloqueo.",
    "Tentáculos": "Cuando un oponente marcado por este jugador intenta moverse, lanza 1D6 + Fuerza de este jugador - Fuerza del oponente. Con 6+, el oponente queda retenido.",
    "Presencia Perturbadora": "Los oponentes a 3 casillas o menos restan -1 a sus tiradas de Pase, Atrapar o Interceptar.",
    "Apariencia Asquerosa": "Cualquier jugador que declare un Bloqueo o acción especial contra este jugador debe sacar primero un 2+ en 1D6 o la acción se pierde.",
    "Cabeza Dura": "Solo queda KO con un 9 en la tirada de Herida (8 se trata como Aturdido). Si es Canijo, queda KO con un 8.",
    "Profesional": "Una vez por activación, puede intentar repetir un dado. Lanza 1D6: con 3+ puede repetirlo. No acumulable con otros re-rolls.",
    "Mano Grande": "Ignora modificadores por estar marcado o por lluvia al intentar recoger el balón.",
    "Brazos Extras": "Suma +1 al recoger el balón, atraparlo o intentar una intercepción.",
    "Dos Cabezas": "Suma +1 a las tiradas de Agilidad para Esquivar.",
    "Piernas Muy Largas": "Reduce en 1 los modificadores negativos al Saltar. Suma +2 a las intercepciones.",
    "Pase Seguro": "Si pifia un Pase, no suelta el balón ni hay cambio de turno. Mantiene la posesión y termina su activación.",
    "Pase Rápido": "Si es el objetivo de un Bloqueo y tiene el balón, puede realizar un Pase Rápido antes del bloqueo.",
    "Apartar": "Cuando es empujado, puede impedir que el atacante lo siga (a menos que el atacante tenga Juggernaut o sea un Blitz).",
    "Agarrar": "Evita que el objetivo use Echarse a un lado. Al empujar, puede elegir cualquier casilla adyacente libre para el oponente.",
    "Echarse a un lado": "Cuando es empujado, el entrenador elige a qué casilla adyacente libre se mueve en lugar del oponente.",
    "Balón Robado": "Si empuja a un oponente con el balón, este lo suelta en la casilla a la que es empujado.",
    "Motosierra": "Puede realizar un ataque de Motosierra en lugar de bloquear. Suma +3 a la tirada de armadura, pero puede lastimarse a sí mismo con un 1.",
    "Puñalada": "En lugar de bloquear, realiza una tirada de armadura sin modificar contra el objetivo. Si rompe armadura, queda derribado y se tira herida.",
    "Salvajismo Animal": "Al activarse, lanza 1D6 (+2 si es Bloqueo/Blitz). Con 1-3, ataca a un compañero adyacente derribándolo.",
    "Realmente Estúpido": "Igual que Cabeza de Hueso pero con 1-3 falla (4+ éxito). Si hay un compañero cerca sin esta habilidad, suma +2 a la tirada.",
    "Furia Desencadenada": "Al activarse, lanza 1D6 (+2 si es Bloqueo/Blitz). Con 1-3 su activación termina inmediatamente.",
    "Patada": "Al sacar de centro, puedes dividir por dos la distancia de dispersión del balón.",
    "Pase de Ave María": "Puede lanzar el balón a cualquier parte del campo sin usar regla de pase. Siempre es impreciso como mínimo.",
    "Salto": "Puede saltar sobre cualquier casilla adyacente ocupada o no. Reduce en 1 los modificadores negativos al saltar.",
    "Saltar": "Si está derribado, levantarse es gratis. Puede intentar levantarse y bloquear con una tirada de Agilidad (+1).",
    "Marcaje": "Puede moverse a la casilla que deja libre un oponente que se aleja con una tirada competitiva de Movimiento.",
    "Jugador Sucio (+1)": "Suma +1 a la tirada de Armadura o Herida al cometer una Falta.",
    "Jugador Sucio (+2)": "Suma +2 a la tirada de Armadura o Herida al cometer una Falta.",
    "Sucio y Rastrero": "Al cometer una falta, no es expulsado si saca un doble natural en armadura. Puede seguir moviéndose tras la falta.",
    "Placaje Múltiple": "Puede realizar dos bloqueos simultáneos a oponentes marcados, pero resta -2 a su Fuerza.",
    "Juggernaut": "En un Blitz, puede tratar el resultado 'Ambos Derribados' como 'Empujón'. El objetivo no puede usar Mantenerse Firme o Lucha.",
    "Brazo Fuerte": "Suma +1 a las tiradas de Pase de Compañero.",
    "Sed de Sangre (2+)": "Al activarse, lanza 1D6 (+1 si Bloqueo/Blitz). Si falla, debe morder a un compañero al final de su activación o habrá cambio de turno.",
    "Sed de Sangre (3+)": "Al activarse, lanza 1D6 (+1 si Bloqueo/Blitz). Si falla, debe morder a un compañero al final de su activación o habrá cambio de turno.",
    "Tramposo": "Cuando va a ser bloqueado, puede colocarse en cualquier casilla adyacente libre al atacante antes de tirar dados.",
    "Mirada Hipnótica": "Acción especial: realiza una tirada de Agilidad contra un oponente marcado. Si tiene éxito, el oponente pierde su Zona de Defensa."
};

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

Object.entries(translations).forEach(([name, desc]) => {
    const escapedName = escapeRegExp(name);
    const regex = new RegExp('("name": "' + escapedName + '",[\\s\\S]*?"description": ")[^"]*(")', 'g');
    if (content.match(regex)) {
        content = content.replace(regex, '$1' + desc + '$2');
        console.log('Translated: ' + name);
    } else {
        // console.log('Not found: ' + name);
    }
});

fs.writeFileSync(path, content, 'utf8');
console.log('Translations applied.');
