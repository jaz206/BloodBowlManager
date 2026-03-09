import { Skill } from "../types";

export const skillsData: Skill[] = [
  {
    "keyEN": "Dauntless",
    "name": "Agallas",
    "category": "General",
    "description": "Cuando este jugador realiza una acciÃ³n de Bloqueo (por sÃ­ sola o como parte de un Blitz), si el objetivo tiene una Fuerza mayor que la de este jugador antes de contar apoyos pero despuÃ©s de otros modificadores, lanza 1D6 y suma la Fuerza de este jugador. Si el total es mayor que la Fuerza del objetivo, la Fuerza de este jugador aumenta para igualar la del objetivo durante este Bloqueo."
  },
  {
    "keyEN": "Claws",
    "name": "Garras",
    "category": "MutaciÃ³n",
    "description": "Cuando realices una tirada de Armadura contra un jugador oponente que haya sido Derribado como resultado de un Bloqueo realizado por este jugador, un resultado de 8+ antes de aplicar modificadores romperÃ¡ su armadura, independientemente de su valor de Armadura real."
  },
  {
    "keyEN": "Bombardier",
    "name": "Bombardero",
    "category": "Rasgo",
    "description": "When activated and if they are Standing, this player can perform a â€˜Throw Bombâ€™ Special action. This Special action is neither a Pass action nor a Throw Team-mate action, so does not prevent another player performing one of those actions during the same team turn. However, only a single player with this Trait may perform this Special action each team turn.\n\nA Bomb can be thrown and caught, and the throw interfered with, just like a ball, using the rules for Pass actions as described on page 48, with the following exceptions:\n\nâ€¢ A player may not stand up or move before performing a Throw Bomb action.\nâ€¢ Bombs do not bounce and can come to rest on the ground in an occupied square. Should a player fail to catch a Bomb, it will come to rest on the ground in the square that player occupies.\nâ€¢ If a Bomb is fumbled, it will explode immediately in the square occupied by the player attempting to throw it.\nâ€¢ If a Bomb comes to rest on the ground in an empty square or is caught by an opposition player, no Turnover is caused.\nâ€¢ A player that is in possession of the ball can still catch a Bomb.\nâ€¢ Any Skills that can be used when performing a Pass action can also be used when performing a Throw Bomb Special action, with the exception of On the Ball.\n\nIf a Bomb is caught by a player on either team, roll a D6:\n\nâ€¢ On a roll of 4+, the Bomb explodes immediately, as described below.\nâ€¢ On a roll of 1-3, that player must throw the Bomb again immediately. This throw takes place out of the normal sequence of play. \n\nShould a Bomb ever leave the pitch, it explodes in the crowd with no effect (on the game) before the crowd can throw it back.\n\nWhen a Bomb comes to rest on the ground, in either an unoccupied square, in a square occupied by a player that failed to catch the Bomb or in a square occupied by a Prone or Stunned player, it will explode immediately:\n\nâ€¢ If the Bomb explodes in an occupied square, that player is automatically hit by the explosion.\nâ€¢ Roll a D6 for each player (from either team) that occupies a square adjacent to the one in which the Bomb exploded:\n- On a roll of 4+, the player has been hit by the explosion.\n- On a roll of 1-3, the player manages to avoid the explosion.\nâ€¢ Any Standing players hit by the explosion are Placed Prone.\nâ€¢ An Armour roll (and possibly an Injury roll as well) is made against any player hit by the explosion, even if they were already Prone or Stunned. \nâ€¢ You may apply a +1 modifier to either the Armour roll or Injury roll. This modifier may be applied after the roll has been made."
  },
  {
    "keyEN": "Break Tackle",
    "name": "Romper Placaje",
    "category": "Fuerza",
    "description": "Once during their activation, after making an Agility test in order to Dodge, this player may modify the dice roll by +1 if their Strength characteristic is 4 or less, or by +2 if their Strength characteristic is 5 or more."
  },
  {
    "keyEN": "Catch",
    "name": "Atrapar",
    "category": "Agilidad",
    "description": "Este jugador puede repetir una tirada de Agilidad fallida al intentar atrapar el balÃ³n."
  },
  {
    "keyEN": "Bone Head",
    "name": "Cabeza de Hueso",
    "category": "Rasgo",
    "description": "Cuando este jugador se activa, incluso si estÃ¡ Derribado o ha perdido su Zona de Defensa, despuÃ©s de declarar la acciÃ³n pero antes de realizarla, lanza 1D6. Con un 1, el jugador olvida quÃ© estaba haciendo y su activaciÃ³n termina. Pierde su Zona de Defensa hasta su prÃ³xima activaciÃ³n. Con un 2+, continÃºa normalmente."
  },
  {
    "keyEN": "Chainsaw",
    "name": "Motosierra",
    "category": "Rasgo",
    "description": "Puede realizar un ataque de Motosierra en lugar de bloquear. Suma +3 a la tirada de armadura, pero puede lastimarse a sÃ­ mismo con un 1."
  },
  {
    "keyEN": "Tackle",
    "name": "Placaje",
    "category": "General",
    "description": "Cuando un jugador oponente intenta Esquivar desde una casilla en la que estÃ¡ marcado por este jugador, ese oponente no puede usar la habilidad Esquivar. AdemÃ¡s, si este jugador realiza un Bloqueo y el resultado es 'TropezÃ³n', el oponente no puede usar Esquivar."
  },
  {
    "keyEN": "Big Hand",
    "name": "Mano Grande",
    "category": "MutaciÃ³n",
    "description": "Ignora modificadores por estar marcado o por lluvia al intentar recoger el balÃ³n."
  },
  {
    "keyEN": "Ball & Chain",
    "name": "Bola y Cadena",
    "category": "Rasgo",
    "description": "When this player is activated, the only action they may perform is a â€˜Ball & Chain Moveâ€™ Special action. There is no limit to how many players with this Trait may perform this Special action each team turn.\n\nWhen this player performs this Special action:\n\nâ€¢ Place the Throw-in template over the player, facing towards either End Zone or either sideline as you wish.\nâ€¢ Roll a D6 and move the player one square in the direction indicated.\nâ€¢ A player with a Ball & Chain automatically passes any Agility tests they may be required to make in order to Dodge, regardless of any modifiers.\nâ€¢ If this movement takes the player off the pitch, they risk Injury by the Crowd.\nâ€¢ If this movement takes the player into a square in which the ball is placed, the player is considered to have moved involuntarily. Therefore, they may not attempt to pick the ball up and the ball will bounce.\n\nRepeat this process for each square the player moves.\n\nIf this player would move into a square that is occupied by a Standing player from either team, they must perform a Block action against that player, following the normal rules, but with the following exceptions:\n\nâ€¢ A Ball & Chain player ignores the Foul Appearance skill.\nâ€¢ A Ball & Chain player must follow-up if they push-back another player.\n\nIf this player moves into a square that is occupied by a Prone or Stunned player from either team, for any reason, that player is immediately pushed back and an Armour roll is made against them.\n\nThis player may Rush. Declare that the player will Rush before placing the Throw-in template and rolling the D6 to determine direction:\n\nâ€¢ If this player Rushes into an unoccupied square, move them as normal and roll a D6:\n- On a roll of 2+, this player moves without mishap.\n- On a roll of 1 (before or after modification), the player Falls Over.\nâ€¢ If this player Rushes into a square that is occupied by a standing player from either team, roll a D6:\n- On a roll of 2+, this player moves without mishap and will perform a Block action against the player occupying the square as described previously.\n- On a roll of 1 (before or after modification), the player occupying the square is pushed back and this player will Fall Over after moving into the vacated square.\n\nIf this player ever Falls Over, is Knocked Down or is Placed Prone, an Injury roll is immediately made against them (no Armour roll is required), treating a Stunned result as a KOâ€™d result.\n\nA player with this Trait cannot also have the Diving Tackle, Frenzy, Grab, Leap, Multiple Block, On the Ball or Shadowing skills. This Trait must still be used if the player is Prone or has lost their Tackle Zone."
  },
  {
    "keyEN": "Animosity (all team-mates)",
    "name": "Animosidad",
    "category": "Rasgo",
    "description": "This player is jealous of and dislikes certain other players on their team, as shown in brackets after the name of the Skill on this playerâ€™s profile. This may be defined by position or race. For example, a Skaven Thrower on an Underworld Denizens team has Animosity (Underworld Goblin Linemen), meaning they suffer Animosity towards any Underworld Goblin Linemen players on their team. Whereas a Skaven Renegade on a Chaos Renegade team has Animosity (all team-mates), meaning they suffer Animosity towards all of their team-mates equally.\n\nWhen this player wishes to perform a Hand-off action to a team-mate of the type listed, or attempts to perform a Pass action and the target square is occupied by a team-mate of the type listed, this player may refuse to do so. Roll a D6. On a roll of 1, this player refuses to perform the action and their activation comes to an end. Animosity does not extend to Mercenaries or Star Players."
  },
  {
    "keyEN": "Always Hungry",
    "name": "Siempre Hambriento",
    "category": "Rasgo",
    "description": "Si este jugador intenta Lanzar CompaÃ±ero, lanza 1D6. Con un 1, intenta comerse al compaÃ±ero. Lanza otro 1D6: con 1 el compaÃ±ero es devorado y eliminado definitivamente."
  },
  {
    "keyEN": "Accurate",
    "name": "Preciso",
    "category": "Pase",
    "description": "When this player performs a Quick Pass action or a Short Pass action, you may apply an additional +1 modifier to the Passing Ability test."
  },
  {
    "keyEN": "Nerves of Steel",
    "name": "Nervios de Acero",
    "category": "Pase",
    "description": "This player may ignore any modifier(s) for being Marked when they attempt to perform a Pass action, attempt to catch the ball or attempt to interfere with a pass."
  },
  {
    "keyEN": "Grab",
    "name": "Agarrar",
    "category": "Fuerza",
    "description": "Evita que el objetivo use Echarse a un lado. Al empujar, puede elegir cualquier casilla adyacente libre para el oponente."
  },
  {
    "keyEN": "Juggernaut",
    "name": "Juggernaut",
    "category": "Fuerza",
    "description": "En un Blitz, puede tratar el resultado 'Ambos Derribados' como 'EmpujÃ³n'. El objetivo no puede usar Mantenerse Firme o Lucha."
  },
  {
    "keyEN": "Foul Appearance",
    "name": "Apariencia Asquerosa",
    "category": "MutaciÃ³n",
    "description": "Cualquier jugador que declare un Bloqueo o acciÃ³n especial contra este jugador debe sacar primero un 2+ en 1D6 o la acciÃ³n se pierde."
  },
  {
    "keyEN": "Guard",
    "name": "Defensa",
    "category": "Fuerza",
    "description": "Este jugador puede ofrecer apoyos tanto ofensivos como defensivos independientemente de cuÃ¡ntos jugadores oponentes lo estÃ©n marcando."
  },
  {
    "name": "Mirada HipnÃ³tica",
    "category": "Rasgo",
    "description": "AcciÃ³n especial: realiza una tirada de Agilidad contra un oponente marcado. Si tiene Ã©xito, el oponente pierde su Zona de Defensa."
  },
  {
    "keyEN": "Mighty Blow (+1)",
    "name": "Golpe Poderoso (+1)",
    "category": "Fuerza",
    "description": "Cuando un jugador oponente es Derribado como resultado de un Bloqueo de este jugador, puedes modificar la tirada de Armadura o de Herida en +1. El modificador se aplica despuÃ©s de realizar la tirada."
  },
  {
    "name": "Placaje MÃºltiple",
    "category": "Fuerza",
    "description": "Puede realizar dos bloqueos simultÃ¡neos a oponentes marcados, pero resta -2 a su Fuerza."
  },
  {
    "keyEN": "Frenzy",
    "name": "Furia",
    "category": "General",
    "description": "Cada vez que este jugador realiza un Bloqueo, debe seguir al oponente si es empujado. Si el objetivo sigue en pie, este jugador debe realizar un segundo Bloqueo contra el mismo objetivo si puede seguirlo."
  },
  {
    "keyEN": "Pass",
    "name": "Pasar",
    "category": "Pase",
    "description": "Este jugador puede repetir una tirada de Habilidad de Pase fallida al realizar una acciÃ³n de Pase."
  },
  {
    "keyEN": "Hail Mary Pass",
    "name": "Hail Mary Pass",
    "category": "Pase",
    "description": "When this player performs a Pass action (or a Throw Bomb action), the target square can be anywhere on the pitch and the range ruler does not need to be used. A Hail Mary pass is never accurate, regardless of the result of the Passing Ability test it will always be inaccurate at best. A Passing Ability test is made and can be re-rolled as normal in order to determine if the Hail Mary pass is wildly inaccurate or is fumbled. A Hail Mary pass cannot be interfered with. This Skill may not be used ina Blizzard."
  },
  {
    "keyEN": "Fend",
    "name": "Apartar",
    "category": "General",
    "description": "Cuando es empujado, puede impedir que el atacante lo siga (a menos que el atacante tenga Juggernaut o sea un Blitz)."
  },
  {
    "keyEN": "Leap",
    "name": "Salto",
    "category": "Agilidad",
    "description": "Puede saltar sobre cualquier casilla adyacente ocupada o no. Reduce en 1 los modificadores negativos al saltar."
  },
  {
    "keyEN": "No Hands",
    "name": "Sin Manos",
    "category": "Rasgo",
    "description": "The player is unable to pick up, intercept or carry the ball and will fail any catch roll automatically, either because he literally has no hands or because his hands are full. If he attempts to pick up the ball then it will bounce, and will causes a turnover if it is his teamâ€™s turn."
  },
  {
    "keyEN": "Horns",
    "name": "Cuernos",
    "category": "Rasgo",
    "description": "Cuando realiza un Blitz, suma +1 a su Fuerza durante el Bloqueo."
  },
  {
    "keyEN": "Extra Arms",
    "name": "Brazos Extras",
    "category": "MutaciÃ³n",
    "description": "Suma +1 al recoger el balÃ³n, atraparlo o intentar una intercepciÃ³n."
  },
  {
    "name": "LÃ­der",
    "category": "Pase",
    "description": "A team which has one or more players with this Skill gains a single extra team re-roll, called a Leader re-roll. However, the Leader re-roll can only be used if there is at least one player with this Skill on the pitch (even if the player with this Skill is Prone, Stunned or has lost their Tackle Zone). If all players with this Skill are removed from play before the Leader re-roll is used, it is lost. The Leader re-roll can be carried over into extra time if it is not used, but the team does not receive a new one at the start of extra time. Unlike standard Team Re-rolls, the Leader Re-roll cannot be lost due to a Halfling Master Chef. Otherwise, the Leader re-roll is treated just like a normal team re-roll."
  },
  {
    "keyEN": "Prehensile Tail",
    "name": "Cola Prensil",
    "category": "MutaciÃ³n",
    "description": "Los oponentes que intenten Esquivar o Saltar fuera de su Zona de Defensa restan -1 a su tirada de Agilidad."
  },
  {
    "keyEN": "Diving Tackle",
    "name": "Placaje de Buceo",
    "category": "Agilidad",
    "description": "Should an active opposition player that is attempting to Dodge, Jump or Leap in order to vacate a square in which they are being Marked by this player pass their Agility test, you may declare that this player will use this Skill. Your opponent must immediately subtract 2 from the result of the Agility test. This player is then Placed Prone in the square vacated by the opposition player.\n\nIf the opposition player was being Marked by more than one player with this Skill, only one player may use it."
  },
  {
    "name": "RecepciÃ³n en Plancha",
    "category": "Agilidad",
    "description": "This player may attempt to catch the ball if a pass, throw-in or kick-off causes it to land in a square within their Tackle Zone after scattering or deviating. This Skill does not allow this player to attempt to catch the ball if it bounces into a square within their Tackle Zone.\n\nAdditionally, this player may apply a +1 modifier to any attempt to catch an accurate pass if they occupy the target square."
  },
  {
    "keyEN": "Kick",
    "name": "Patada",
    "category": "General",
    "description": "Al sacar de centro, puedes dividir por dos la distancia de dispersiÃ³n del balÃ³n."
  },
  {
    "keyEN": "Loner (4+)",
    "name": "Loner (4+)",
    "category": "Rasgo",
    "description": "If this player wishes to use a team re-roll, roll a D6. If you roll equal to or higher than the target number shown in brackets, this player may use the team re-roll as normal. Otherwise, the original result stands without being re-rolled but the team re-roll is lost just as if it had been used. This Trait must still be used if the player is Prone or has lost their Tackle Zone."
  },
  {
    "name": "Pase RÃ¡pido",
    "category": "Pase",
    "description": "Si es el objetivo de un Bloqueo y tiene el balÃ³n, puede realizar un Pase RÃ¡pido antes del bloqueo."
  },
  {
    "keyEN": "Dodge",
    "name": "Esquivar",
    "category": "Agilidad",
    "description": "Una vez por turno de equipo, este jugador puede repetir una tirada de Agilidad fallida al intentar Esquivar. AdemÃ¡s, puede elegir usar esta habilidad cuando es el objetivo de un Bloqueo y se aplica un resultado de 'TropezÃ³n'."
  },
  {
    "name": "Realmente EstÃºpido",
    "category": "Rasgo",
    "description": "Igual que Cabeza de Hueso pero con 1-3 falla (4+ Ã©xito). Si hay un compaÃ±ero cerca sin esta habilidad, suma +2 a la tirada."
  },
  {
    "keyEN": "Jump Up",
    "name": "Saltar",
    "category": "Agilidad",
    "description": "Si estÃ¡ derribado, levantarse es gratis. Puede intentar levantarse y bloquear con una tirada de Agilidad (+1)."
  },
  {
    "keyEN": "Disturbing Presence",
    "name": "Presencia Perturbadora",
    "category": "MutaciÃ³n",
    "description": "Los oponentes a 3 casillas o menos restan -1 a sus tiradas de Pase, Atrapar o Interceptar."
  },
  {
    "keyEN": "Dirty Player (+1)",
    "name": "Jugador Sucio (+1)",
    "category": "General",
    "description": "Suma +1 a la tirada de Armadura o Herida al cometer una Falta."
  },
  {
    "keyEN": "Secret Weapon",
    "name": "Arma Secreta",
    "category": "Rasgo",
    "description": "When a drive in which this player took part ends, even if this player was not on the pitch at the end of the drive, this player will be Sent-off for committing a Foul, as described on page 63."
  },
  {
    "keyEN": "Right Stuff",
    "name": "Buena Gente",
    "category": "Rasgo",
    "description": "Si este jugador tiene Fuerza 3 o menos, puede ser lanzado por un compaÃ±ero con la habilidad Lanzar CompaÃ±ero."
  },
  {
    "keyEN": "Sidestep",
    "name": "Echarse a un lado",
    "category": "Agilidad",
    "description": "Cuando es empujado, el entrenador elige a quÃ© casilla adyacente libre se mueve en lugar del oponente."
  },
  {
    "keyEN": "Safe Pass",
    "name": "Pase Seguro",
    "category": "Pase",
    "description": "Si pifia un Pase, no suelta el balÃ³n ni hay cambio de turno. Mantiene la posesiÃ³n y termina su activaciÃ³n."
  },
  {
    "keyEN": "Shadowing",
    "name": "Marcaje",
    "category": "General",
    "description": "Puede moverse a la casilla que deja libre un oponente que se aleja con una tirada competitiva de Movimiento."
  },
  {
    "keyEN": "Sneaky Git",
    "name": "Sucio y Rastrero",
    "category": "Agilidad",
    "description": "Al cometer una falta, no es expulsado si saca un doble natural en armadura. Puede seguir moviÃ©ndose tras la falta."
  },
  {
    "keyEN": "Stunty",
    "name": "Canijo",
    "category": "Rasgo",
    "description": "Ignora modificadores por ser marcado al Esquivar (a menos que tenga Motosierra, etc.). Las tiradas de Herida contra Ã©l usan la tabla de Canijos."
  },
  {
    "name": "PuÃ±alada",
    "category": "Rasgo",
    "description": "En lugar de bloquear, realiza una tirada de armadura sin modificar contra el objetivo. Si rompe armadura, queda derribado y se tira herida."
  },
  {
    "keyEN": "Titchy",
    "name": "Diminuto",
    "category": "Rasgo",
    "description": "Suma +1 a las tiradas de Agilidad para Esquivar. Los oponentes que esquiven hacia su Zona de Defensa no sufren penalizaciÃ³n."
  },
  {
    "keyEN": "Take Root",
    "name": "Enraizarse",
    "category": "Rasgo",
    "description": "Al activarse, lanza 1D6. Con un 1, el jugador queda Enraizado: no puede moverse de su casilla hasta el final de la entrada o hasta ser Derribado."
  },
  {
    "name": "Lanzar CompaÃ±ero",
    "category": "Rasgo",
    "description": "Si este jugador tiene Fuerza 5 o mÃ¡s, puede realizar la acciÃ³n Lanzar CompaÃ±ero con un compaÃ±ero que tenga la habilidad Buena Gente."
  },
  {
    "keyEN": "Two Heads",
    "name": "Dos Cabezas",
    "category": "MutaciÃ³n",
    "description": "Suma +1 a las tiradas de Agilidad para Esquivar."
  },
  {
    "keyEN": "Block",
    "name": "Placar",
    "category": "General",
    "description": "Cuando se aplica un resultado de 'Ambos Derribados' durante un Bloqueo, este jugador puede elegir ignorarlo y no ser Derribado."
  },
  {
    "keyEN": "Thick Skull",
    "name": "Cabeza Dura",
    "category": "Fuerza",
    "description": "Solo queda KO con un 9 en la tirada de Herida (8 se trata como Aturdido). Si es Canijo, queda KO con un 8."
  },
  {
    "keyEN": "Very Long Legs",
    "name": "Piernas Muy Largas",
    "category": "MutaciÃ³n",
    "description": "Reduce en 1 los modificadores negativos al Saltar. Suma +2 a las intercepciones."
  },
  {
    "keyEN": "Sure Hands",
    "name": "Manos Seguras",
    "category": "General",
    "description": "Este jugador puede repetir cualquier intento fallido de recoger el balÃ³n. AdemÃ¡s, la habilidad BalÃ³n Robado no puede usarse contra Ã©l."
  },
  {
    "keyEN": "Sure Feet",
    "name": "Pies Firmes",
    "category": "Agilidad",
    "description": "Una vez por turno de equipo, este jugador puede repetir la tirada de 1D6 al intentar un Ir a por Todo (Rush)."
  },
  {
    "keyEN": "Animal Savagery",
    "name": "Salvajismo Animal",
    "category": "Rasgo",
    "description": "Al activarse, lanza 1D6 (+2 si es Bloqueo/Blitz). Con 1-3, ataca a un compaÃ±ero adyacente derribÃ¡ndolo."
  },
  {
    "name": "RegeneraciÃ³n",
    "category": "Rasgo",
    "description": "DespuÃ©s de una tirada de Casualidad contra este jugador, lanza 1D6. Con un 4+, la Casualidad se descarta y el jugador va a la caja de Reservas."
  },
  {
    "keyEN": "Stand Firm",
    "name": "Mantenerse Firme",
    "category": "Fuerza",
    "description": "Este jugador puede elegir no ser empujado, ya sea como resultado de un Bloqueo realizado contra Ã©l o por un empujÃ³n en cadena."
  },
  {
    "name": "BalÃ³n Robado",
    "category": "General",
    "description": "Si empuja a un oponente con el balÃ³n, este lo suelta en la casilla a la que es empujado."
  },
  {
    "name": "TentÃ¡culos",
    "category": "MutaciÃ³n",
    "description": "Cuando un oponente marcado por este jugador intenta moverse, lanza 1D6 + Fuerza de este jugador - Fuerza del oponente. Con 6+, el oponente queda retenido."
  },
  {
    "keyEN": "Strong Arm",
    "name": "Brazo Fuerte",
    "category": "Rasgo",
    "description": "Suma +1 a las tiradas de Pase de CompaÃ±ero."
  },
  {
    "keyEN": "Sprint",
    "name": "Esprintar",
    "category": "Rasgo",
    "description": "Cuando este jugador realiza cualquier acciÃ³n que incluya movimiento, puede intentar Ir a por Todo tres veces en lugar de las dos habituales."
  },
  {
    "keyEN": "Pro",
    "name": "Profesional",
    "category": "General",
    "description": "Una vez por activaciÃ³n, puede intentar repetir un dado. Lanza 1D6: con 3+ puede repetirlo. No acumulable con otros re-rolls."
  },
  {
    "keyEN": "Kick Team-mate",
    "name": "Kick Team-Mate",
    "category": "Rasgo",
    "description": "Once per team turn, in addition to another player performing either a Pass or a Throw Team-mate action, a single player with this Trait on the active team can perform a â€˜Kick Team-mateâ€™ Special action and attempt to kick a Standing team-mate with the Right Stuff trait that is in a square adjacent to them.\n\nTo perform a Kick Team-mate Special action, follow the rules for Throw Team-mate actions as described on page 52.\n\nHowever, if the Kick Team-mate Special action is fumbled, the kicked player is automatically removed from play and an Injury roll is made against them, treating a Stunned result as a KOâ€™d result (note that, if the player that performed this action also has the Mighty Blow (+X) skill, the coach of the opposing team may use that Skill on this Injury roll). If the kicked player was in possession of the ball when removed from play, the ball will bounce from the square they occupied."
  },
  {
    "keyEN": "Monstrous Mouth",
    "name": "Boca Monstruosa",
    "category": "MutaciÃ³n",
    "description": "This player may re-roll any failed attempt to catch the ball. In addition, the Strip Ball skill cannot be used against this player."
  },
  {
    "keyEN": "Plague Ridden",
    "name": "Plagado",
    "category": "Rasgo",
    "description": "Once per game, if an opposition player with a Strength characteristic of 4 or less that does not have the Decay, Regeneration or Stunty traits suffers a Casualty result of 15-16, DEAD as the result of a Block action performed or a Foul action committed by a player with this Trait that belongs to your team, and if that player cannot be saved by an apothecary, you may choose to use this Trait. If you do, that player does not die; they have instead been infected with a virulent plague!\n\nIf your team has the â€˜Favoured of Nurgleâ€™ special rule, a new â€˜Rotter Linemanâ€™ player, drawn from the Nurgle roster, can be placed immediately in the Reserves box of your teamâ€™s dugout (this may cause a team to have more than 16 players for the remainder of this game). During step 4 of the post-game sequence, this player may be permanently hired, exactly as you would a Journeyman player that had played for your team (see page 72)."
  },
  {
    "name": "Â¡Timmm-ber!",
    "category": "Rasgo",
    "description": "If this player has a Movement Allowance of 2 or less, apply a +1 modifier to the dice roll when they attempt to stand up (as described on page 44) for each Open, Standing team-mate they are currently adjacent to. A natural 1 is always a failure, no matter how many teammates are helping. This Trait may still be used if the player is Prone or has lost their Tackle Zone."
  },
  {
    "keyEN": "Wrestle",
    "name": "Lucha",
    "category": "General",
    "description": "Este jugador puede usar esta habilidad cuando se aplica un resultado de 'Ambos Derribados'. En lugar de aplicarlo normalmente, ambos jugadores quedan Derribados (sin tirar armadura excepto si otras reglas lo indican)."
  },
  {
    "keyEN": "Swoop",
    "name": "Planeo",
    "category": "Rasgo",
    "description": "If this player is thrown by a team-mate, as described on page 52, they do not scatter before landing as they normally would. Instead, you may place the Throw-in template over the player, facing towards either End Zone or either sideline as you wish. The player then moves from the target square D3 squares in a direction determined by rolling a D6 and referring to the Throw-in template."
  },
  {
    "keyEN": "Swarming",
    "name": "Enjambre",
    "category": "Rasgo",
    "description": "During each Start of Drive sequence, after Step 2 but before Step 3, you may remove D3 players with this Trait from the Reserves box of your dugout and set them up on the pitch, allowing you to set up more than the usual 11 players. These extra players may not be placed on the Line of Scrimmage or in a Wide Zone.\n\nWhen using Swarming, a coach may not set up more players wwith the Swarming trait onto the pitch than the number of freindly players with the Swarming trait that were already set up. So, if a team had 2 players with the Swarmaing trait already set up on the pitch, and then rolled for 3 more players to enter the pitch via Swarming, only a maximum of two more Swarming players could be set up on the pitch."
  },
  {
    "name": "Treacherous Trapdoor",
    "category": "Rasgo",
    "description": "Until the end of this half, every time any player enters a Trapdoor square, for any reason, roll a D6. On a roll of 1, the trapdoor falls open and the player is immediately removed from play. Treat them exactly as if they had been pushed into the crowd. If the player was in possession of the ball, it bounces from the trapdoor square."
  },
  {
    "name": "Friends with the Ref",
    "category": "Rasgo",
    "description": "Until the end of this drive, you may treat a roll of 5 or 6 on the Argue the Call table as a â€œWell, When You Put It Like Thatâ€¦â€ result and a roll of 2-4 as an â€œI Donâ€™t Care!â€ result."
  },
  {
    "name": "Stiletto",
    "category": "Rasgo",
    "description": "Randomly select one player on your team that is available to play during this drive and that does not have the Loner (X+) trait. Until the end of this drive, that player gains the Stab trait."
  },
  {
    "name": "Iron Man",
    "category": "Rasgo",
    "description": "Choose one player on your team that is available to play during this drive and that does not have the Loner (X+) trait. Until the end of this game, that player improves their AV by 1, to a maximum of 11+."
  },
  {
    "name": "Knuckle Dusters",
    "category": "Rasgo",
    "description": "Choose one player on your team that is available to play during this drive and that does not have the Loner (X+) trait. Until the end of this drive, that player gains the Mighty Blow (+1) skill."
  },
  {
    "name": "Bad Habits",
    "category": "Rasgo",
    "description": "Randomly select D3 opposition players that are available to play during this drive and that do not have the Loner (X+) trait. Until the end of this drive, those players gain the Loner (2+) trait."
  },
  {
    "name": "Greasy Cleats",
    "category": "Rasgo",
    "description": "Randomly select one opposition player that is available to play during this drive. That player has had their boots tampered with! Until the end of this drive, their MA is reduced by 1."
  },
  {
    "name": "Blessed Statue of Nuffle",
    "category": "Rasgo",
    "description": "Choose one player on your team that is available to play during this drive and that does not have the Loner (X+) trait. Until the end of this game, that player gains the Pro skill."
  },
  {
    "name": "Moles Under the Pitch",
    "category": "Rasgo",
    "description": "Until the end of this half, apply a -1 modifier every time any player attempts to Rush an extra square (-2 should it occur that both coaches have rolled this result)."
  },
  {
    "name": "Perfect Passing",
    "category": "Rasgo",
    "description": "Until the end of this game, any player on your team that makes a Completion earns 2 SPP, rather than the usual 1 SPP."
  },
  {
    "name": "Fan Interaction",
    "category": "Rasgo",
    "description": "Until the end of this drive, if a player on your team causes a Casualty by pushing an opponent into the crowd, that player will earn 2 SPP exactly as if they had caused a Casualty by performing a Block action."
  },
  {
    "name": "Necessary Violence",
    "category": "Rasgo",
    "description": "Until the end of this drive, any player on your team that causes a Casualty earns 3 SPP, rather than the usual 2 SPP."
  },
  {
    "name": "Fouling Frenzy",
    "category": "Rasgo",
    "description": "Until the end of this drive, any player on your team that causes a Casualty with a Foul action earns 2 SPP exactly as if they had caused a Casualty by performing a Block action."
  },
  {
    "name": "Throw a Rock",
    "category": "Rasgo",
    "description": "Until the end of this drive, should an opposition player Stall, at the end of their team turn you may roll a D6. On a roll of 5+, an angry fan throws a rock at that player. The player is immediately Knocked Down."
  },
  {
    "name": "Under Scrutiny",
    "category": "Rasgo",
    "description": "Until the end of this half, any player on the opposing team that commits a Foul action is automatically seen by the referee, even if a natural double is not rolled."
  },
  {
    "name": "Intensive Training",
    "category": "Rasgo",
    "description": "Randomly select one player on your team that is available to play during this drive and that does not have the Loner (X+) trait. Until the end of this game, that player gains a single Primary skill of your choice."
  },
  {
    "keyEN": "Guard",
    "name": "Defensa",
    "category": "Rasgo",
    "description": "Este jugador puede ofrecer apoyos tanto ofensivos como defensivos independientemente de cuÃ¡ntos jugadores oponentes lo estÃ©n marcando."
  },
  {
    "keyEN": "Sure Hands",
    "name": "Manos Seguras",
    "category": "Agilidad",
    "description": "Este jugador puede repetir cualquier intento fallido de recoger el balÃ³n. AdemÃ¡s, la habilidad BalÃ³n Robado no puede usarse contra Ã©l."
  },
  {
    "keyEN": "Iron Hard Skin",
    "name": "Piel de Hierro",
    "category": "MutaciÃ³n",
    "description": "Opposing players cannot modify any Armour rolls made against this player. In addition, the Claws skill cannot be used when making an Armour roll against this player. This Skill may still be used if the player is Prone, Stunned or has lost their Tackle Zone."
  },
  {
    "name": "CaÃ±onero",
    "category": "Pase",
    "description": "When this player performs a Long Pass action or a Long Bomb Pass action, you may apply an additional +1 modifier to the Passing Ability test."
  },
  {
    "keyEN": "Cloud Burster",
    "name": "Rompe nubes",
    "category": "Pase",
    "description": "When this player performs a Long Pass action or a Long Bomb Pass action, you may choose to make the opposing coach re-roll a successful attempt to interfere with the pass."
  },
  {
    "keyEN": "Fumblerooskie",
    "name": "Fumblerooskie",
    "category": "Pase",
    "description": "When this player performs a Move or Blitz action whilst in possession of the ball, they may choose to â€˜dropâ€™ the ball. The ball may be placed in any square the player vacates during their movement and does not bounce. No Turnover is caused."
  },
  {
    "name": "A por el balÃ³n",
    "category": "Pase",
    "description": "This player may move up to three squares (regardless of their MA), following all of the normal movement rules, when the opposing coach declares that one of their players is going to perform a Pass action. This move is made after the range has been measured and the target square declared, but before the active player makes a Passing Ability test. Making this move interrupts the activation of the opposition player performing the Pass action. A player may use this Skill when an opposition player uses the Dump-off skill, but should this player Fall Over whilst moving, a Turnover is caused.\n\nAdditionally, during each Start of Drive sequence, after Step 2 but before Step 3, one Open player with this Skill on the receiving team may move up to three squares (regardless of their MA). This Skill may not be used if a touchback is caused when the kick deviates and does not allow the player to cross into their opponentâ€™s half of the pitch."
  },
  {
    "keyEN": "Running Pass",
    "name": "Running Pass",
    "category": "Pase",
    "description": "If this player performs a Quick Pass action, their activation does not have to end once the pass is resolved. If you wish and if this player has not used their full Movement Allowance, they may continue to move after resolving the pass."
  },
  {
    "keyEN": "Arm Bar",
    "name": "Palanca de Brazo",
    "category": "Fuerza",
    "description": "If an opposition player Falls Over as the result of failing their Agility test when attempting to Dodge, Jump or Leap out of a square in which they were being Marked by this player, you may apply a +1 modifier to either the Armour roll or Injury roll. This modifier may be applied after the roll has been made and may be applied even if this player is now Prone.\n\nIf the opposition player was being Marked by more than one player with this Skill, only one player may use it."
  },
  {
    "keyEN": "Brawler",
    "name": "Luchador",
    "category": "Fuerza",
    "description": "When this player performs a Block action on its own (but not as part of a Blitz action), this player may re-roll a single Both Down result."
  },
  {
    "keyEN": "Pile Driver",
    "name": "Pile Driver",
    "category": "Fuerza",
    "description": "When an opposition player is Knocked Down by this player as the result of a Block action (on its own or as part of a Blitz action), this player may immediately commit a free Foul action against the Knocked Down player. To use this Skill, this player must be Standing after the block dice result has been selected and applied, and must occupy a square adjacent to the Knocked Down player. After using this Skill, this player is Placed Prone and their activation ends immediately."
  },
  {
    "name": "DescomposiciÃ³n",
    "category": "Rasgo",
    "description": "If this player suffers a Casualty result on the Injury table, there is a +1 modifier applied to all rolls made against this player on the Casualty table."
  },
  {
    "keyEN": "Pogo Stick",
    "name": "Pogo Stick",
    "category": "Rasgo",
    "description": "During their movement, instead of jumping over a single square that is occupied by a Prone or Stunned player, as described on page 45, a player with this Trait may choose to Leap over any single adjacent square, including unoccupied squares and squares occupied by Standing players.\n\nAdditionally, when this player makes an Agility test to Jump over a Prone or Stunned player, or to Leap over an empty square or a square occupied by a Standing player, they may ignore any negative modifiers that would normally be applied for being Marked in the square they jumped or leaped from and/or for being Marked in the square they have jumped or leaped into.\n\nA player with this Trait cannot also have the Leap skill."
  },
  {
    "name": "VÃ³mito Proyectil",
    "category": "Rasgo",
    "description": "Instead of performing a Block action (on its own or as part of a Blitz action), this player may perform a â€˜Projectile Vomitâ€™ Special action. Exactly as described for a Block action, nominate a single Standing player to be the target of the Projectile Vomit Special action. There is no limit to how many players with this Trait may perform this Special action each team turn.\n\nTo perform a Projectile Vomit Special action, roll a D6:\n\nâ€¢ On a roll of 2+, this player regurgitates acidic bile onto the nominated target.\nâ€¢ On a roll of 1, this player belches and snorts, before covering itself in acidic bile.\nâ€¢ In either case, an Armour roll is made against the player hit by the Projectile Vomit. This Armour roll cannot be modified in any way.\nâ€¢ If the armour of the player hit is broken, they become Prone and an Injury roll is made against them. This Injury roll cannot be modified in any way.\nâ€¢ If the armour of the player hit is not broken, this Trait has no effect.\n\nA player can only perform this Special action once per turn (i.e., Projectile Vomit cannot be used with Frenzy or Multiple Block)."
  },
  {
    "keyEN": "Unchannelled Fury",
    "name": "Furia Desencadenada",
    "category": "Rasgo",
    "description": "Al activarse, lanza 1D6 (+2 si es Bloqueo/Blitz). Con 1-3 su activaciÃ³n termina inmediatamente."
  },
  {
    "keyEN": "Loner (5+)",
    "name": "Loner (5+)",
    "category": "Rasgo",
    "description": "If this player wishes to use a team re-roll, roll a D6. If you roll equal to or higher than the target number shown in brackets, this player may use the team re-roll as normal. Otherwise, the original result stands without being re-rolled but the team re-roll is lost just as if it had been used. This Trait must still be used if the player is Prone or has lost their Tackle Zone."
  },
  {
    "name": "Low Cost Linemen",
    "category": "Rasgo",
    "description": "Teams with this special rule are not very particular about\nthe Linemen they hire. To make up for this, they donâ€™t\nusually bother to pay them:\n\nâ€¢ In league play (but not in exhibition play), when\ncalculating the Current Value of any permanently hired\nLineman players on a team with this special rule, the\nHiring Fee of that player is not included."
  },
  {
    "name": "Bribery and Corruption",
    "category": "Rasgo",
    "description": "It takes a strong-willed referee indeed to risk making\nan enemy of a team so renowned for reactingâ€¦ poorly\ntowards any official that would rebuke its behaviour:\n\nâ€¢ Once per game, when rolling on the Argue the Call\ntable, you may re-roll a roll of a natural 1.\n\nIn addition, a team with this special rule can\npurchase certain Inducements for a reduced price, as\nnoted in the description of that Inducement."
  },
  {
    "name": "Masters of Undeath",
    "category": "Rasgo",
    "description": "The Head Coach of this team is replaced by a\nNecromancer. Once per game, they can â€˜Raise the Deadâ€™:\n\nâ€¢ If a player on the opposing team with a Strength\ncharacteristic of 4 or less and that does not have the\nRegeneration or Stunty traits suffers a Casualty result\nof 15-16, DEAD, and if they cannot be saved by an\napothecary, a new rookie Zombie Lineman player can\nbe placed immediately in the Reserves box of this\nteamâ€™s dugout. Note that this may cause the team\nto have more than 16 players for the remainder of\nthe game.\n\nâ€¢ During Step 4 of the post-game sequence, this player\nmay be permanently hired for free if the team has\nfewer than 16 players on its Team Draft list, otherwise\nit will be lost. The playerâ€™s full value still counts towards\nthe Team Value.\n\nAdditionally, just like the Head Coach of any other\nteam, a Necromancer can Argue the Call when one of\ntheir players is Sent-off for committing a Foul, as long as\nthey havenâ€™t been sent off themselves."
  },
  {
    "keyEN": "Loner (3+)",
    "name": "Loner (3+)",
    "category": "Rasgo",
    "description": "If this player wishes to use a team re-roll, roll a D6. If you roll equal to or higher than the target number shown in brackets, this player may use the team re-roll as normal. Otherwise, the original result stands without being re-rolled but the team re-roll is lost just as if it had been used. This Trait must still be used if the player is Prone or has lost their Tackle Zone."
  },
  {
    "keyEN": "Mighty Blow (+1)",
    "name": "Golpe Poderoso (+2)",
    "category": "Fuerza",
    "description": "Cuando un jugador oponente es Derribado como resultado de un Bloqueo de este jugador, puedes modificar la tirada de Armadura o de Herida en +2. El modificador se aplica despuÃ©s de realizar la tirada."
  },
  {
    "keyEN": "Dirty Player (+1)",
    "name": "Jugador Sucio (+2)",
    "category": "General",
    "description": "Suma +2 a la tirada de Armadura o Herida al cometer una Falta."
  },
  {
    "keyEN": "Drunkard",
    "name": "Drunkard",
    "category": "Rasgo",
    "description": "This player suffers a -1 penalty to the dice roll when attempting to Rush."
  },
  {
    "keyEN": "Pick-Me-Up",
    "name": "Levantarse",
    "category": "Rasgo",
    "description": "At the end of the opponent's team turn, roll a D6 for each Prone, non-Stunned team-mate within three squares of a Standing player with the Trait. On a 5+, the Prone player may immediately stand up."
  },
  {
    "name": "Portal Navigator",
    "category": "Rasgo",
    "description": "When this player teleports using a Portal, they may re-roll the D6 to determine which Portal they teleport to."
  },
  {
    "keyEN": "Give and Go",
    "name": "Give and Go",
    "category": "Rasgo",
    "description": "If this player performs a Hand-Off action, their activation does not have to end once the Hand-Off is resolved. If you wish and if this player has not used their full Movement Allowance, they may continue to move after resolving the Hand-Off."
  },
  {
    "name": "Portal Passer",
    "category": "Rasgo",
    "description": "During its activation, when this player teleports through a Portal, it may declare a Pass action after determining which Portal it is teleporting to. This Skill may be used even if the player did not declare a Pass action at the beginning of their activation."
  },
  {
    "name": "Wall Thrower",
    "category": "Rasgo",
    "description": "When this player throws the ball at the wall, they may apply a +1 modifier when testing for the accuracy of the pass."
  },
  {
    "name": "College Wizard",
    "category": "Rasgo",
    "description": "A College Wizard may only use their spell once per game."
  },
  {
    "keyEN": "Hit and Run",
    "name": "Hit and Run",
    "category": "Rasgo",
    "description": "After a player with this trait performs a Block action, they may immediately move one free square ignoring Tackle Zones so long as they are still Standing. They must ensure that after this move, they are not Marked by or Marking any opposition players."
  },
  {
    "keyEN": "Bloodlust (2+)",
    "name": "Sed de Sangre (2+)",
    "category": "Rasgo",
    "description": "Al activarse, lanza 1D6 (+1 si Bloqueo/Blitz). Si falla, debe morder a un compaÃ±ero al final de su activaciÃ³n o habrÃ¡ cambio de turno."
  },
  {
    "keyEN": "Bloodlust (3+)",
    "name": "Sed de Sangre (3+)",
    "category": "Rasgo",
    "description": "Al activarse, lanza 1D6 (+1 si Bloqueo/Blitz). Si falla, debe morder a un compaÃ±ero al final de su activaciÃ³n o habrÃ¡ cambio de turno."
  },
  {
    "keyEN": "My Ball",
    "name": "My Ball",
    "category": "Rasgo",
    "description": "A player with this Trait may not willingly give up the ball when in possession of it, and so may not make Pass actions, Hand-off actions, or use any other Skill or Trait that would allow them to relinquish possession of the ball. The only way they can lose possession of the ball is by being Knockes Down, Placed Prone, Falling Over or by the effect of a Skill, Trait, or special rule of an opposing model."
  },
  {
    "keyEN": "Trickster",
    "name": "Tramposo",
    "category": "Rasgo",
    "description": "Cuando va a ser bloqueado, puede colocarse en cualquier casilla adyacente libre al atacante antes de tirar dados."
  },
  {
    "keyEN": "Breathe Fire",
    "name": "Breathe Fire",
    "category": "Rasgo",
    "description": "Once per activation, instead of performing a Block action (either on its own or as part of a Blitz action), this player may perform a Breathe Fire Special action. When a player makes a Breathe Fire Special action they may choose one Standing opposition player they are Marking and roll a D6, applying a -1 modifier if the target has a ST of 5 or higher. On a 1, the player gets overeager, engulfing themself in flame and is immediately Knocked Down. On a 2-3, the opposition player ducks the gout of flame and nothing happens. On a 4+, the opposition player takes a ball of fire straight to the face and is immediately Placed Prone. However, if the roll is a natural 6, the potent pyro has taken its toll and the opposition player is Knocked Down instead. After the Breathe Fire Special action has been resolved, this player's activation immediately ends."
  },
  {
    "name": "Argue the Call",
    "category": "Rasgo",
    "description": "Any time a player is sent off for committing a foul or using a Secret Weapon, you can â€˜Argue the Callâ€™:Â \nRoll a D6.Â \nâ€¢ 1 - The player is sent off, a turnover is caused and for the rest of the game you cannot argue any calls. Furthermore if the â€˜Brilliant Coachingâ€™ result is rolled on the Kick-off table, subtract 1 from your dice roll.\nâ€¢ 2-5 - The player is sent off and a turnover is caused.\nâ€¢ 6 - The player in question stays on the field if Argue the Call was used when a foul was committed, a turnover is still caused. If used when a player is sent of for using a Secret Weapon, the player is put in the reserves box.\nAfter the Argue the Call roll, unless a 1 was rolled, you may use a bribe to try to keep the player in play (and not cause a turnover)."
  },
  {
    "name": "A Sneaky Pair",
    "category": "Rasgo",
    "description": "Dribl & Drull must be hired as a pair but only counts as one Star Player choice. However, they will still take up two spaces on a team's Team Roster.Â  Additionally, whenever Dribl orÂ Drull perform either a Stab or Foul actionÂ against an opposition player marked byÂ both Dribl & Drull, they may apply a +1Â modifier to the Injury roll."
  },
  {
    "name": "Two for One",
    "category": "Rasgo",
    "description": "Grak and Crumbleberry must be hired as a pair but only counts as one Star Player choice. However, they will still take up two spaces on a team's Team Roster. Additionally, if either Grak or Crumbleberry is removed from play due to suffering a KOâ€™d or Casualty! result on the Injury table, the other replaces the Loner (4+) trait with the Loner (2+) trait."
  },
  {
    "name": "Dedicated Fans (League)",
    "category": "Rasgo",
    "description": "Every Blood Bowl team is supported by a strong following of Dedicated Fans, those loyal supporters that will follow their team in good times and bad. This dedicated fan base is made both of those eager to show their support for a local franchise and those from further afield who support the team for less easily identified reasons. Many dedicated fans support a team because their parents did. Others do so simply because they find the team colours fetching.\n\n\nWhen a team is drafted, it will have a Dedicated Fans characteristic of 1 recorded on the Team Draft list (representing roughly 1,000 Dedicated Fans). Over the course of a league season, this characteristic will increase and decrease, though it will never fall below 1.\n\n\nAdditionally, when a team is drafted it can improve its Dedicated Fans characteristic by 1, up to a maximum of 6, at a cost of 10,000 gold pieces per improvement. For example, a team may improve its Dedicated Fans characteristic from 1 to 3 at a cost of 20,000 gold pieces from its Team Draft budget."
  },
  {
    "name": "Dedicated Fans (Exhibition)",
    "category": "Rasgo",
    "description": "Unlike a team drafted for league play, a team drafted for exhibition play will have a Dedicated Fans characteristic of 0.\n\n\nHowever, teams drafted for exhibition play can still improve this up to a maximum of 6, at a cost of 10,000 gold pieces per improvement, as described on page 35. For example, an exhibition team may purchase a Dedicated Fans characteristic of 3 at a cost of 30,000 gold pieces."
  }
];

