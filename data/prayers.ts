
import type { Prayer } from '../types';

export const prayersData: Prayer[] = [
  { diceRoll: "1", title: "Trampilla traicionera", description: "Cualquier jugador que se coloque sobre cualquier trampilla lanza 1D6, si sale 1 el jugador es retirado como si hubiera sido retirado del campo por las bandas." },
  { diceRoll: "2", title: "Amigo del árbitro", description: "Las tiradas de 5 al protestar contra el árbitro se toman como 6." },
  { diceRoll: "3", title: "Puñal", description: "Elije un jugador que esté disponible este partido, ese jugador gana el rasgo Puñalar." },
  { diceRoll: "4", title: "Músculos de hierro", description: "Elije un jugador al azar que esté disponible para jugar y no tenga Solitario, ese jugador gana +1 Armadura." },
  { diceRoll: "5", title: "Nudilleras", description: "Elije un jugador al azar que esté disponible para jugar y no tenga Solitario, obtiene Golpe Mortífero." },
  { diceRoll: "6", title: "Malas costumbres", description: "Elije 1D3 jugadores rivales al azar que estén disponibles para jugar y no tengan Solitario, esos jugadores obtienen Solitario +2." },
  { diceRoll: "7", title: "Tacos engrasados", description: "Elije un jugador rival al azar que esté disponible para jugar, ese jugador reduce en 1 su Movimiento." },
  { diceRoll: "8", title: "Bendición de Nuffle", description: "Elije un jugador al azar de tu equipo que esté disponible para jugar y no tenga Solitario, ese jugador obtiene la habilidad de Profesional." },
  { diceRoll: "9", title: "Topos bajo el campo", description: "Hasta el final del partido, aplica un modificador de -1 a las tiradas de Forzar la Marcha." },
  { diceRoll: "10", title: "Pase perfecto", description: "Cualquier jugador de tu equipo que logre un pase completo gana 2 PE en lugar de 1 PE." },
  { diceRoll: "11", title: "Recepción deslumbrante", description: "Cualquier jugador de tu equipo que logre atrapar un pase gana 1 PE." },
  { diceRoll: "12", title: "Apoyo del público", description: "Cualquier oponente queda herido por ser empujado fuera del campo, el jugador que lo empujó gana 2 PE." },
  { diceRoll: "13", title: "Con faltas a lo loco", description: "Si un jugador de tu equipo lesiona a otro jugador obtendrá 2 PE." },
  { diceRoll: "14", title: "Pedrada", description: "Una vez por partido, en cualquiera de tus turnos, puedes elegir al azar a un jugador oponente, tira 1D6 con 4+, el jugador es DERRIBADO." },
  { diceRoll: "15", title: "Escrutinio arbitral", description: "Cualquier jugador rival que cometa una falta y supere la armadura será visto por el árbitro." },
  { diceRoll: "16", title: "Entrenamiento intensivo", description: "Elije al azar un jugador de tu equipo que esté disponible para jugar y no tenga Solitario. Hasta el final del partido, ese jugador obtiene una Habilidad Primaria a tu elección." }
];
