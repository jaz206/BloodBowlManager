
import type { WeatherCondition } from '../types';

export const weatherConditions: WeatherCondition[] = [
  {
    diceRoll: "2",
    title: "Calor Asfixiante",
    description: "¡Algunos jugadores se desmayan por el calor insoportable! 1D3 jugadores aleatorios de cada equipo que están en el campo cuando termine una entrada son colocados en la zona de RESERVAS. Deberán perderse la siguiente entrada."
  },
  {
    diceRoll: "3",
    title: "Muy Soleado",
    description: "Hace un día excelente, pero el cielo despejado y la luz del sol dificultan el juego de pase. Aplica un modificador de -1 a todos los chequeos de Pasar."
  },
  {
    diceRoll: "4-10",
    title: "Clima Perfecto",
    description: "Ni demasiado frío ni demasiado calor. Un día cálido, seco y ligeramente nublado, el ambiente perfecto para jugar a Blood Bowl."
  },
  {
    diceRoll: "11",
    title: "Lluvioso",
    description: "¡Una lluvia torrencial deja a los jugadores empapados y el balón resbaladizo! Aplica un modificador de -1 a los chequeos de Agilidad para intentar atrapar o recoger el balón, o al intentar interferir en un pase."
  },
  {
    diceRoll: "12",
    title: "Ventisca",
    description: "El ambiente helado y la nieve que cae hacen que el suelo sea traicionero. Aplica un modificador de -1 a los intentos de forzar la marcha. Además, la mala visibilidad hace que solo puedan intentarse Pases Rápidos y Pases Cortos."
  }
];
