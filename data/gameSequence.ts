import type { GameSection } from '../types';

export const gameSequenceData: GameSection[] = [
  {
    title: "Secuencia Anterior al Partido (Pre-Game)",
    rules: [
      { text: "1. Factor de Hinchas: Cada entrenador tira 1D3 y suma los aficionados ocasionales de su hoja. El total es el Factor de Hinchas para el partido." },
      { text: "2. El Clima: Se lanzan 2D6 y se consulta la Tabla de Clima.", dice: "2D6" },
      { text: "3. Contratar Sustitutos: Si un equipo tiene menos de 11 jugadores, añade Sustitutos (Líneas con Solitario 4+) gratis hasta tener 11." },
      { text: "4. Adquirir Incentivos: El equipo con menor VAE recibe la diferencia en efectivo. Puede gastar hasta 50,000 monedas extra de su propia tesorería." },
      { text: "5. Determinar Equipo Pateador: Tirada enfrentada (1D6 cada uno). El ganador elige si patea o recibe.", dice: "1D6 vs 1D6" },
    ],
  },
  {
    title: "Inicio de una Entrada (Drive)",
    rules: [
      { text: "1. Despliegue: El pateador se coloca primero (mín. 3 en el centro, máx. 2 por banda). Luego el receptor despliega." },
      { text: "2. La Patada Inicial: Se designa un pateador y se elige casilla objetivo en campo rival." },
      {
        text: "3. Evento de Patada Inicial: Mientras el balón vuela, se lanza 2D6 y se consulta la tabla de eventos (¡A la carga!, Indigestión, etc.).",
        dice: "2D6"
      },
      { text: "4. Desvío: El balón se desvía 1D8 (dirección) y 1D6 (distancia). Habilidad Patada reduce a 1D3.", dice: "1D8 + 1D6" },
      {
        text: "5. Recepción:",
        subRules: [
          { text: "Si cae en casilla ocupada, el jugador intenta atraparlo automáticamente." },
          { text: "Si cae en casilla vacía, rebota una vez.", dice: "1D8" },
          { text: "Si sale del campo, es Touchback (el receptor elige quién lo recibe)." },
        ],
      },
    ],
  },
  {
    title: "Turno de Equipo",
    rules: [
      { text: "Un partido tiene dos partes de 8 turnos cada una." },
      {
        text: "Cada jugador puede activarse una vez para realizar una acción:",
        subRules: [
            { text: "Mover (hasta su MV)" },
            { text: "Placar (a un rival adyacente)" },
            { text: "Blitz (Mover + Placar) - 1 por turno" },
            { text: "Pase (lanzar el balón) - 1 por turno" },
            { text: "Entrega en mano (compañero adyacente) - 1 por turno" },
            { text: "Lanzar Compañero - 1 por turno" },
            { text: "Falta (a un jugador caído) - 1 por turno" },
        ],
      },
      {
        text: "¡Turnover! (Cambio de Turno):",
        subRules: [
            { text: "El turno termina si: un jugador propio es derribado, se falla una recogida/atrapada y el balón cae, o se anota Touchdown." },
        ],
      },
    ],
  },
  {
    title: "Secuencia Posterior al Partido",
    rules: [
      { text: "1. Ganancias: Se calcula la Afluencia (suma de Hinchas de ambos). Fórmula: ((Afluencia/2) + TDs + 1*) x 10,000 monedas." },
      { text: "2. Actualizar Hinchas: Gana: 1D6 ≥ actual (+1). Pierde: 1D6 < actual (-1). Empate: no varía.", dice: "1D6" },
      { text: "3. Progreso (PE): El entrenador elige a 6 candidatos y lanza 1D6 para asignar los 4 PE del MJP.", dice: "1D6" },
      { text: "4. Plantilla: Fichar nuevos jugadores, despedir o contratar permanentemente a un Sustituto." },
      { text: "5. Errores Costosos: Si la tesorería tiene ≥ 100k, tira 1D6 para comprobar pérdidas.", dice: "1D6" },
      { text: "6. Actualizar VAE: Recalcula el valor total. Los lesionados (MNG) no cuentan para el próximo partido." },
    ],
  },
];