
import type { KickoffEvent } from '../types';

export const kickoffEvents: KickoffEvent[] = [
  {
    diceRoll: '2',
    title: 'Árbitro Intimidado',
    description: 'Cada equipo recibe un incentivo de Soborno gratuito. Este incentivo debe usarse antes del final del partido o se pierde.'
  },
  {
    diceRoll: '3',
    title: 'Tiempo Muerto',
    description: 'Si la ficha de turno del equipo pateador está en el turno 6, 7 u 8 de esa parte, ambos entrenadores mueven su ficha de turno un espacio hacia atrás. En cualquier otro caso, ambos entrenadores mueven su ficha de turno un espacio hacia delante.'
  },
  {
    diceRoll: '4',
    title: 'Defensa Sólida',
    description: '1D3+3 jugadores Desmarcados del equipo pateador pueden ser retirados y desplegados de nuevo en casillas diferentes siguiendo las reglas normales de despliegue.'
  },
  {
    diceRoll: '5',
    title: 'Patada Alta',
    description: 'Un jugador Desmarcado del equipo receptor puede ser movido cualquier número de casillas, sin importar su atributo de MV, hasta ser colocado en la misma casilla en la que va a caer el balón.'
  },
  {
    diceRoll: '6',
    title: 'Los Hinchas Animan',
    description: 'Cada entrenador tira 1D6 + número de animadoras. El ganador recibe un apoyo ofensivo adicional en el primer placaje de su siguiente turno.'
  },
  {
    diceRoll: '7',
    title: 'Entrenador Brillante',
    description: 'Cada entrenador tira 1D6 + número de ayudantes. El ganador obtiene una Segunda Oportunidad adicional para la inminente entrada. Si esa Segunda Oportunidad no se usa antes del final de la entrada, se pierde.'
  },
  {
    diceRoll: '8',
    title: 'Clima Cambiante',
    description: 'Haz una nueva tirada en la Tabla de Clima y aplica ese resultado. Si esta tirada obtiene un resultado de «Clima Perfecto», el balón se escorará (3 casillas) antes de caer al suelo.'
  },
  {
    diceRoll: '9',
    title: 'Anticipación',
    description: 'El entrenador del equipo receptor puede mover 1D3+3 jugadores desmarcados una casilla en cualquier dirección.'
  },
  {
    diceRoll: '10',
    title: '¡A la Carga! (Blitz)',
    description: 'El equipo pateador activa 1D3+3 jugadores desmarcados para realizar una acción de movimiento gratuita. Uno de ellos puede realizar una acción de Blitz, otro una acción de Paso o Lanzar Compañero y otro una acción de Patear Compañero.'
  },
  {
    diceRoll: '11',
    title: 'Indigestión',
    description: 'Tirada enfrentada de 1D6. El perdedor elige un jugador al azar: con 2+, pierde -1 MV y -1 AR por esa entrada; con 1, el jugador va a Reservas por "evacuación forzosa".'
  },
  {
    diceRoll: '12',
    title: 'Invasión de Campo',
    description: 'Tirada enfrentada (1D6 + Factor de Hinchas). El perdedor elige aleatoriamente 1D3 jugadores de su equipo que estén en el campo; todos los jugadores elegidos quedan Tumbados y Aturdidos.'
  }
];
