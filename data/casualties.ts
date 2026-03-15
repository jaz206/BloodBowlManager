
import type { CasualtyEvent } from '../types';

export const casualtyResults: CasualtyEvent[] = [
  {
    diceRoll: '1-8',
    title: 'Malherido',
    description: 'El Jugador se pierde el resto del partido, pero sin secuelas duraderas.'
  },
  {
    diceRoll: '9-10',
    title: 'Gravemente Herido',
    description: 'El Jugador se pierde el proximo partido.'
  },
  {
    diceRoll: '11-12',
    title: 'Lesion Seria',
    description: 'El Jugador se pierde el proximo partido. Además recibe un +1 en la proxima tirada de la tabla de lesiones.'
  },
  {
    diceRoll: '13-14',
    title: 'Lesion Permanente',
    description: 'El Jugador se pierde el proximo partido. Además recibe una reduccion de Caracteristica.'
  },
  {
    diceRoll: '15-16',
    title: 'Muerto',
    description: 'El Jugador esta demasiado muerto para jugar a Blood Bowl.'
  }
];
