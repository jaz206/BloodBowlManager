import type { GameSection } from '../types';

export const gameSequenceData: GameSection[] = [
  {
    title: "Secuencia Anterior al Partido (Antes de empezar)",
    rules: [
      { text: "1. Contratar Sustitutos: Si un equipo no puede alinear al menos 11 jugadores, debe añadir 'Sustitutos' temporales (Líneas con Solitario 4+) hasta tener 11. Su coste se añade temporalmente a la Valoración de Equipo (VE)." },
      { text: "2. Incentivos: Compara la VE de ambos equipos (incluyendo Sustitutos). El equipo con menor VE recibe la diferencia en monedas de oro para gastar en Incentivos (sobornos, jugadores estrella, etc.)." },
      { text: "3. Hinchas y FAMA: Cada entrenador tira 2D6 y lo suma a su atributo Hinchas. El que tenga el total más alto gana +1 FAMA (Factor de Aficionados Adicional), o +2 si saca el doble o más. La FAMA afecta a varios eventos." },
      { text: "4. El Clima: Cada entrenador tira 1D6, se suman ambos resultados y se consulta la Tabla de Clima." },
      { text: "5. Plegarias a Nuffle: Después de gastar los incentivos, si un equipo sigue teniendo una VE inferior, puede tirar en la Tabla de Plegarias a Nuffle." },
      { text: "6. Determinar Equipo Pateador: Se tira una moneda. El ganador elige si patea o recibe en la primera parte." },
    ],
  },
  {
    title: "Inicio de una Entrada (Patada Inicial)",
    rules: [
      { text: "1. Despliegue: Ambos entrenadores colocan a sus jugadores en el campo (máximo 11)." },
      { text: "2. Patada Inicial: Un jugador del equipo pateador chuta el balón hacia campo rival." },
      {
        text: "3. Evento de Patada Inicial: Inmediatamente después de la patada (pero antes de que el balón se desvíe o aterrice), el entrenador del equipo pateador tira 2D6 en la Tabla de Eventos de Patada Inicial y se resuelve el resultado.",
        dice: "2D6"
      },
      { text: "4. Desvío del Balón: El entrenador del equipo pateador coloca la plantilla de devolución y tira 1D8 y 1D6 para ver dónde aterriza el balón." , dice: "1D8 + 1D6"},
      {
        text: "5. Recepción del Balón:",
        subRules: [
          { text: "Si aterriza en una casilla ocupada, ese jugador debe intentar atraparlo." },
          { text: "Si aterriza en una casilla vacía, rebota una vez.", dice: "1D8" },
          { text: "Si sale del campo, es un 'Touchback' y lo recibe un jugador del equipo receptor." },
        ],
      },
    ],
  },
  {
    title: "Turno de Equipo",
    rules: [
      { text: "Un partido se divide en dos partes de 8 turnos cada una." },
      {
        text: "Durante tu turno, puedes activar a cada jugador una vez para realizar una de las siguientes acciones:",
        subRules: [
            { text: "Mover (hasta su MV)" },
            { text: "Placar (a un jugador adyacente)" },
            { text: "Penetrar (Mover y luego Placar)" },
            { text: "Pasar (lanzar el balón)" },
            { text: "Entregar (dar el balón a un compañero adyacente)" },
            { text: "Falta (a un jugador adyacente caído)" },
        ],
      },
      {
        text: "¡Turnover! (Cambio de Turno)",
        subRules: [
            { text: "Tu turno termina inmediatamente si ocurre alguna de las siguientes situaciones:" },
            { text: "Un jugador de tu equipo es Derribado." },
            { text: "Un jugador de tu equipo con el balón falla al intentar recogerlo, atraparlo o interferir un pase, y el balón cae al suelo." },
            { text: "Un Pase es impreciso y aterriza en una casilla no ocupada por un compañero." },
            { text: "Un jugador es Expulsado por cometer una Falta." },
            { text: "Se anota un Touchdown." },
            { text: "Se acaba el tiempo de la parte." },
        ],
      },
    ],
  },
  {
    title: "Secuencia Posterior al Partido",
    rules: [
      { text: "1. Anotar el Resultado y las Ganancias: Anota el resultado y las ganancias de cada equipo (10,000 M.O. por empate, 30,000 M.O. por victoria)." },
      { text: "2. Actualizar Hinchas: Tira 1D6. Si ganas y sacas 4+, ganas 1 Hincha. Si pierdes y sacas 1, pierdes 1 Hincha. En cualquier otro caso, no cambia." },
      { text: "3. Progreso de los Jugadores: Anota los Puntos de Estrella (PE) ganados por cada jugador. Si un jugador tiene suficientes PE, puede subir de nivel y obtener una nueva habilidad o mejora de atributo." },
      { text: "4. Fichar, Despedir y Retirar Temporalmente: Puedes comprar nuevos jugadores, despedir a los existentes (recibiendo la mitad de su valor) o marcar a los lesionados para que se pierdan el próximo partido." },
      { text: "5. Errores Costosos: Si tu tesorería supera las 100,000 M.O., debes tirar en la Tabla de Errores Costosos." },
      { text: "6. Preparar el Próximo Partido: Actualiza la Valoración de Equipo." },
    ],
  },
];