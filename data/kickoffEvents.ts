
import type { KickoffEvent } from '../types';

export const kickoffEvents: KickoffEvent[] = [
  {
    diceRoll: '2',
    title: 'Árbitro intimidado',
    description: 'Cada equipo recive un incentivo de Soborno gratuito. Este incentivo debe usarse antes del final del partido o se pierde.'
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
    description: 'Un jugador Desmarcado del equipo receptor puede ser movido cualquier número de casillas, sin importar su atributo de MV, hasta ser colocado en la misma casilla en la que va a caer el balon.'
  },
  {
    diceRoll: '6',
    title: 'Los Hinchas Animan',
    description: 'Cada entrenador tira 1D6 y le suma el número de animadoras de su Hoja de plantilla. El entrenador que obtenga un resultado total más alto puede hacer de inmediato una tirada de la Tabla de Plegarias de Nuffle. en caso de empate en la tirada del D6+ el numero de animadoras, nadie tira en la Tabla de Plegarias de Nuffle. Al tirar en la Tabla de Plegarias de Nuffle ten en cuenta que, si obtienes un resultado que está activo ahora mismo, debes volver a tirar. En cambio, si es un resultado que ya había salido pero cuyo efecto ha acabado, no se vuelve a tirar.'
  },
  {
    diceRoll: '7',
    title: 'Clima Cambiante',
    description: 'Haz una nueva tirada en la Tabla de Clima y aplica ese resultado. Si esta tirada obtiene un resultado de «Clima Perfecto«, el balón se escorará antes de caer al suelo.'
  },
  {
    diceRoll: '8',
    title: 'Entrenador Brillante',
    description: 'Cada entrenador tira 1D6 y le suma el número de ayudantes del entrenador de su hoja de plantilla. El entrenador con un resultado total más alto obtiene una Segunda oportunidad adicional para la inminente entrada. Si esa Segunda oportunidad no se usa antes del final de la entrada, se pierde. En caso de empate en la tirada del D6 + el número de ayudantes del entrenador, nadie obtiene una Segunda oportunidad adicional.'
  },
  {
    diceRoll: '9',
    title: 'Anticipación',
    description: 'El entrenador del equipo receptor puede mover 1D3+3 jugadores desmarcados una casilla en cualquier dirección.'
  },
  {
    diceRoll: '10',
    title: '¡Penetración!',
    description: '1D3+3 jugadores Desmarcados del equipo pateador se pueden activar de inmediato para realizar una acción de Movimiento. Uno de ellos puede realizar una acción de Penetración y otro una acción de Pase o Lanzar Compañero. Si un jugador se Cae o es Derribado, no se pueden activar mas jugadores y el evento termina inmediatamente.'
  },
  {
    diceRoll: '11',
    title: 'Árbitro Buscabroncas',
    description: 'Cada entrenador tira 1D6 y suma su Factor de Hinchas al resultado. El entrenador que obtenga un resultado total más bajo elige aleatoriamente un jugador de su equipo que esté en el campo. En caso de empate en la tirada del D6+ el Factor de Hinchas, ambos entrenadores eligen un jugador aleatorio de su equipo. Se tira 1D6 por cada jugador elegido. Con un 2+, el jugador en cuestión y el árbitro llegan a las manos, debido a lo cual el jugador es colocado Tumbado boca arriba y queda Aturdido. Con un 1, en cambio, el jugador es Expulsado inmediatamente.'
  },
  {
    diceRoll: '12',
    title: 'Invasión del Campo',
    description: 'Cada entrenador tira 1D6 y suma su Factor de Hinchas al resultado. El entrenador que obtenga un resultado total más bajo elige aleatoriamente 1D3 jugadores de su equipo que estén en el campo. En caso de empate en la tirada del D6+ el Factor de Hinchas, ambos entrenadores eligen aleatoriamente 1D3 jugadores de su equipo que estén en el campo. Todos los jugadores elegidos son colocados Tumbados boca abajo y quedan Aturdidos.'
  }
];