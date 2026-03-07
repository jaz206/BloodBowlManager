import { Skill } from "../types";

export const skillsData: Skill[] = [
    {
        "name": "Agallas",
        "category": "General",
        "description": "Cuando este jugador realiza una acción de Bloqueo (por sí sola o como parte de un Blitz), si el objetivo tiene una Fuerza mayor que la de este jugador antes de contar apoyos pero después de otros modificadores, lanza 1D6 y suma la Fuerza de este jugador. Si el total es mayor que la Fuerza del objetivo, la Fuerza de este jugador aumenta para igualar la del objetivo durante este Bloqueo."
    },
    {
        "name": "Garras",
        "category": "Mutación",
        "description": "Cuando realices una tirada de Armadura contra un jugador oponente que haya sido Derribado como resultado de un Bloqueo realizado por este jugador, un resultado de 8+ antes de aplicar modificadores romperá su armadura, independientemente de su valor de Armadura real."
    },
    {
        "name": "Bombardero",
        "category": "Rasgo",
        "description": "Cuando se activa y si está de pie, este jugador puede realizar una acción especial de 'Lanzar Bomba'. Esta acción especial no es ni una acción de Pase ni de Lanzar Compañero. Una Bomba se puede lanzar y atrapar igual que un balón, siguiendo las reglas de Pase pero con excepciones: no puede moverse antes, las bombas no rebotan, y si se pifa explota en la casilla del lanzador. Si un jugador atrapa una bomba, esta explota con un 4+; con un 1-3 debe volver a lanzarla inmediatamente."
    },
    {
        "name": "Romper Placaje",
        "category": "Fuerza",
        "description": "Una vez durante su activación, después de realizar una tirada de Agilidad para Esquivar, este jugador puede modificar el resultado del dado en +1 si su Fuerza es 4 o menos, o en +2 si su Fuerza es 5 o más."
    },
    {
        "name": "Atrapar",
        "category": "Agilidad",
        "description": "Este jugador puede repetir una tirada de Agilidad fallida al intentar atrapar el balón."
    },
    {
        "name": "Cabeza de Hueso",
        "category": "Rasgo",
        "description": "Cuando este jugador se activa, incluso si está Derribado o ha perdido su Zona de Defensa, después de declarar la acción pero antes de realizarla, lanza 1D6. Con un 1, el jugador olvida qué estaba haciendo y su activación termina. Pierde su Zona de Defensa hasta su próxima activación. Con un 2+, continúa normalmente."
    },
    {
        "name": "Motosierra",
        "category": "Rasgo",
        "description": "Puede realizar un ataque de Motosierra en lugar de bloquear. Suma +3 a la tirada de armadura, pero puede lastimarse a sí mismo con un 1."
    },
    {
        "name": "Placaje",
        "category": "General",
        "description": "Cuando un jugador oponente intenta Esquivar desde una casilla en la que está marcado por este jugador, ese oponente no puede usar la habilidad Esquivar. Además, si este jugador realiza un Bloqueo y el resultado es 'Tropezón', el oponente no puede usar Esquivar."
    },
    {
        "name": "Mano Grande",
        "category": "Mutación",
        "description": "Ignora modificadores por estar marcado o por lluvia al intentar recoger el balón."
    },
    {
        "name": "Bola y Cadena",
        "category": "Rasgo",
        "description": "Este jugador solo puede realizar la acción especial de 'Movimiento de Bola y Cadena'. Se mueve usando la plantilla de devolución de balón. Pasa automáticamente cualquier prueba de Agilidad para Esquivar. Si entra en una casilla con un jugador de pie, debe realizar un Bloqueo contra él. Si entra en una casilla con un jugador derribado, este es empujado. Si este jugador cae, se tira herida automáticamente (KO se trata como herida)."
    },
    {
        "name": "Animosidad",
        "category": "Rasgo",
        "description": "El jugador tiene celos de ciertos compañeros. Al intentar entregar el balón o pasar a un compañero del tipo indicado, lanza 1D6. Con un 1, se niega a realizar la acción y su activación termina."
    },
    {
        "name": "Siempre Hambriento",
        "category": "Rasgo",
        "description": "Si este jugador intenta Lanzar Compañero, lanza 1D6. Con un 1, intenta comerse al compañero. Lanza otro 1D6: con 1 el compañero es devorado y eliminado definitivamente."
    },
    {
        "name": "Preciso",
        "category": "Pase",
        "description": "Al realizar un Pase Rápido o un Pase Corto, se suma un modificador adicional de +1 a la tirada de Habilidad de Pase."
    },
    {
        "name": "Nervios de Acero",
        "category": "Pase",
        "description": "Este jugador ignora cualquier modificador por estar marcado al intentar realizar un Pase, atrapar el balón o intentar interferir en un pase."
    },
    {
        "name": "Agarrar",
        "category": "Fuerza",
        "description": "Evita que el objetivo use Echarse a un lado. Al empujar, puede elegir cualquier casilla adyacente libre para el oponente."
    },
    {
        "name": "Juggernaut",
        "category": "Fuerza",
        "description": "En un Blitz, puede tratar el resultado 'Ambos Derribados' como 'Empujón'. El objetivo no puede usar Mantenerse Firme o Lucha."
    },
    {
        "name": "Apariencia Asquerosa",
        "category": "Mutación",
        "description": "Cualquier jugador que declare un Bloqueo o acción especial contra este jugador debe sacar primero un 2+ en 1D6 o la acción se pierde."
    },
    {
        "name": "Defensa",
        "category": "Fuerza",
        "description": "Este jugador puede ofrecer apoyos tanto ofensivos como defensivos independientemente de cuántos jugadores oponentes lo estén marcando."
    },
    {
        "name": "Mirada Hipnótica",
        "category": "Rasgo",
        "description": "Acción especial: realiza una tirada de Agilidad contra un oponente marcado. Si tiene éxito, el oponente pierde su Zona de Defensa."
    },
    {
        "name": "Golpe Poderoso (+1)",
        "category": "Fuerza",
        "description": "Cuando un jugador oponente es Derribado como resultado de un Bloqueo de este jugador, puedes modificar la tirada de Armadura o de Herida en +1. El modificador se aplica después de realizar la tirada."
    },
    {
        "name": "Placaje Múltiple",
        "category": "Fuerza",
        "description": "Puede realizar dos bloqueos simultáneos a oponentes marcados, pero resta -2 a su Fuerza."
    },
    {
        "name": "Furia",
        "category": "General",
        "description": "Cada vez que este jugador realiza un Bloqueo, debe seguir al oponente si es empujado. Si el objetivo sigue en pie, este jugador debe realizar un segundo Bloqueo contra el mismo objetivo si puede seguirlo."
    },
    {
        "name": "Pasar",
        "category": "Pase",
        "description": "Este jugador puede repetir una tirada de Habilidad de Pase fallida al realizar una acción de Pase."
    },
    {
        "name": "Hail Mary Pass",
        "category": "Pase",
        "description": "Al realizar una acción de Pase, el objetivo puede estar en cualquier parte del campo. El pase nunca es preciso. Se hace una prueba de Habilidad de Pase para ver si se pifa o es muy impreciso. No se puede interferir."
    },
    {
        "name": "Apartar",
        "category": "General",
        "description": "Cuando es empujado, puede impedir que el atacante lo siga (a menos que el atacante tenga Juggernaut o sea un Blitz)."
    },
    {
        "name": "Salto",
        "category": "Agilidad",
        "description": "Puede saltar sobre cualquier casilla adyacente ocupada o no. Reduce en 1 los modificadores negativos al saltar."
    },
    {
        "name": "Sin Manos",
        "category": "Rasgo",
        "description": "El jugador no puede recoger, interceptar ni llevar el balón. Fallará automáticamente cualquier tirada de atrapar."
    },
    {
        "name": "Cuernos",
        "category": "Rasgo",
        "description": "Cuando realiza un Blitz, suma +1 a su Fuerza durante el Bloqueo."
    },
    {
        "name": "Brazos Extras",
        "category": "Mutación",
        "description": "Suma +1 al recoger el balón, atraparlo o intentar una intercepción."
    },
    {
        "name": "Líder",
        "category": "Pase",
        "description": "Proporciona una Segunda Oportunidad de equipo adicional que solo puede usarse si el jugador con esta habilidad está en el campo."
    },
    {
        "name": "Cola Prensil",
        "category": "Mutación",
        "description": "Los oponentes que intenten Esquivar o Saltar fuera de su Zona de Defensa restan -1 a su tirada de Agilidad."
    },
    {
        "name": "Placaje de Buceo",
        "category": "Agilidad",
        "description": "Si un oponente que está siendo marcado por este jugador supera su tirada de Agilidad para Esquivar o Saltar, este jugador puede tirarse al suelo para restar 2 al resultado de esa tirada."
    },
    {
        "name": "Recepción en Plancha",
        "category": "Agilidad",
        "description": "Este jugador puede intentar atrapar el balón si aterriza en una casilla de su Zona de Defensa tras dispersarse. Además, suma +1 a las tiradas de atrapar pases precisos."
    },
    {
        "name": "Patada",
        "category": "General",
        "description": "Al sacar de centro, puedes dividir por dos la distancia de dispersión del balón."
    },
    {
        "name": "Solitario (4+)",
        "category": "Rasgo",
        "description": "Para usar una Segunda Oportunidad de equipo, debe sacar un 4+ en 1D6. Si falla, el resultado original se mantiene y se pierde el reroll."
    },
    {
        "name": "Pase Rápido",
        "category": "Pase",
        "description": "Si es el objetivo de un Bloqueo y tiene el balón, puede realizar un Pase Rápido antes del bloqueo."
    },
    {
        "name": "Esquivar",
        "category": "Agilidad",
        "description": "Una vez por turno de equipo, este jugador puede repetir una tirada de Agilidad fallida al intentar Esquivar. Además, puede elegir usar esta habilidad cuando es el objetivo de un Bloqueo y se aplica un resultado de 'Tropezón'."
    },
    {
        "name": "Realmente Estúpido",
        "category": "Rasgo",
        "description": "Igual que Cabeza de Hueso pero con 1-3 falla (4+ éxito). Si hay un compañero cerca sin esta habilidad, suma +2 a la tirada."
    },
    {
        "name": "En pie de un salto",
        "category": "Agilidad",
        "description": "Si está derribado, levantarse es gratis. Puede intentar levantarse y bloquear con una tirada de Agilidad (+1)."
    },
    {
        "name": "Presencia Perturbadora",
        "category": "Mutación",
        "description": "Los oponentes a 3 casillas o menos restan -1 a sus tiradas de Pase, Atrapar o Interceptar."
    },
    {
        "name": "Jugador Sucio (+1)",
        "category": "General",
        "description": "Suma +1 a la tirada de Armadura o Herida al cometer una Falta."
    },
    {
        "name": "Arma Secreta",
        "category": "Rasgo",
        "description": "Al final de la entrada, este jugador es expulsado por el árbitro (a menos que se use un soborno)."
    },
    {
        "name": "Buena Gente",
        "category": "Rasgo",
        "description": "Si este jugador tiene Fuerza 3 o menos, puede ser lanzado por un compañero con la habilidad Lanzar Compañero."
    },
    {
        "name": "Echarse a un lado",
        "category": "Agilidad",
        "description": "Cuando es empujado, el entrenador elige a qué casilla adyacente libre se mueve en lugar del oponente."
    },
    {
        "name": "Pase Seguro",
        "category": "Pase",
        "description": "Si pifia un Pase, no suelta el balón ni hay cambio de turno. Mantiene la posesión y termina su activación."
    },
    {
        "name": "Marcaje",
        "category": "General",
        "description": "Puede moverse a la casilla que deja libre un oponente que se aleja con una tirada competitiva de Movimiento."
    },
    {
        "name": "Sucio y Rastrero",
        "category": "Agilidad",
        "description": "Al cometer una falta, no es expulsado si saca un doble natural en armadura. Puede seguir moviéndose tras la falta."
    },
    {
        "name": "Canijo",
        "category": "Rasgo",
        "description": "Ignora modificadores por ser marcado al Esquivar. Las tiradas de Herida contra él usan la tabla de Canijos."
    },
    {
        "name": "Puñalada",
        "category": "Rasgo",
        "description": "En lugar de bloquear, realiza una tirada de armadura sin modificar contra el objetivo. Si rompe armadura, queda derribado y se tira herida."
    },
    {
        "name": "Diminuto",
        "category": "Rasgo",
        "description": "Suma +1 a las tiradas de Agilidad para Esquivar. Los oponentes que esquiven hacia su Zona de Defensa no sufren penalización."
    },
    {
        "name": "Enraizarse",
        "category": "Rasgo",
        "description": "Al activarse, lanza 1D6. Con un 1, el jugador queda Enraizado: no puede moverse de su casilla hasta el final de la entrada o hasta ser Derribado."
    },
    {
        "name": "Lanzar Compañero",
        "category": "Rasgo",
        "description": "Si este jugador tiene Fuerza 5 o más, puede realizar la acción Lanzar Compañero con un compañero que tenga la habilidad Buena Gente."
    },
    {
        "name": "Dos Cabezas",
        "category": "Mutación",
        "description": "Suma +1 a las tiradas de Agilidad para Esquivar."
    },
    {
        "name": "Placar",
        "category": "General",
        "description": "Cuando se aplica un resultado de 'Ambos Derribados' durante un Bloqueo, este jugador puede elegir ignorarlo y no ser Derribado."
    },
    {
        "name": "Cabeza Dura",
        "category": "Fuerza",
        "description": "Solo queda KO con un 9 en la tirada de Herida (8 se trata como Aturdido)."
    },
    {
        "name": "Piernas Muy Largas",
        "category": "Mutación",
        "description": "Reduce en 1 los modificadores negativos al Saltar. Suma +2 a las intercepciones."
    },
    {
        "name": "Manos Seguras",
        "category": "General",
        "description": "Este jugador puede repetir cualquier intento fallido de recoger el balón. Además, la habilidad Balón Robado no puede usarse contra él."
    },
    {
        "name": "Pies Firmes",
        "category": "Agilidad",
        "description": "Una vez por turno de equipo, este jugador puede repetir la tirada de 1D6 al intentar un Ir a por Todo (Rush)."
    },
    {
        "name": "Salvajismo Animal",
        "category": "Rasgo",
        "description": "Al activarse, lanza 1D6 (+2 si es Bloqueo/Blitz). Con 1-3, debe atacar a un compañero adyacente para poder activarse."
    },
    {
        "name": "Regeneración",
        "category": "Rasgo",
        "description": "Después de una tirada de Casualidad contra este jugador, lanza 1D6. Con un 4+, la Casualidad se descarta y el jugador va a la caja de Reservas."
    },
    {
        "name": "Mantenerse Firme",
        "category": "Fuerza",
        "description": "Este jugador puede elegir no ser empujado, ya sea como resultado de un Bloqueo realizado contra él o por un empujón en cadena."
    },
    {
        "name": "Balón Robado",
        "category": "General",
        "description": "Si empuja a un oponente con el balón, este lo suelta en la casilla a la que es empujado."
    },
    {
        "name": "Tentáculos",
        "category": "Mutación",
        "description": "Cuando un oponente marcado por este jugador intenta moverse, lanza 1D6 + Fuerza de este jugador - Fuerza del oponente. Con 6+, el oponente queda retenido."
    }
];
