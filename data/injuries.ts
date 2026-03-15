
import type { InjuryEvent } from '../types';

export const injuryResults: InjuryEvent[] = [
  {
    diceRoll: '2-7',
    title: 'Aturdido',
    description: 'El jugador queda aturdido, y es colocado boca abajo en el campo.'
  },
  {
    diceRoll: '8-9',
    title: 'Inconsciente',
    description: 'El jugador es retirado inmediatamente del juego y es colocado en la Zona de Inconscientes del Banquillo. Al final de cada entrada, hay una posibilidad de que los jugadores se recuperen y vuelvan al juego.'
  },
  {
    diceRoll: '10-12',
    title: '¡Lesionado!',
    description: 'El jugador sufre una Lesión, de modo que es retirado del juego inmediatamente y colocado en la Zona de Lesionados del Banquillo. El entrenador rival hace una Tirada de Lesiones contra el jugador.'
  }
];
