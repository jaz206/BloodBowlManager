
import type { InjuryEvent } from '../types';

export const stuntyInjuryResults: InjuryEvent[] = [
  {
    diceRoll: '2-6',
    title: 'Aturdido',
    description: 'El jugador queda aturdido, y es colocado boca abajo en el campo.'
  },
  {
    diceRoll: '7-8',
    title: 'Inconsciente',
    description: 'El jugador es retirado inmediatamente del juego y es colocado en la Zona de Inconscientes del Banquillo. Al final de cada entrada, hay una posibilidad de que los jugadores se recuperen y vuelvan al juego.'
  },
  {
    diceRoll: '9',
    title: 'Magullado',
    description: 'El jugador sufre una Lesión, de modo que es retirado del juego inmediatamente y colocado en la Zona de Lesionados del Banquillo. No tires en la Tabla de Lesiones; en lugar de eso, se le aplica de manera automática un resultado de Magullado.'
  },
  {
    diceRoll: '10-12',
    title: '¡Lesionado!',
    description: 'El jugador sufre una Lesión, de modo que es retirado del juego inmediatamente y colocado en la Zona de Lesionados del Banquillo. El entrenador rival hace una Tirada de Lesiones contra el jugador.'
  }
];