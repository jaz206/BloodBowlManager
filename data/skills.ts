import { Skill } from '../types';

/**
 * Master Bilingual Blood Bowl 2020 Skills Dictionary
 * Consolidated from skills_en.ts and skills_es.ts
 */
export const skillsData: Skill[] = [
  {
    "keyEN": "Block",
    "name_en": "Block",
    "name_es": "Placar",
    "category": "General",
    "desc_en": "A player with the Block skill is proficient at knocking opponents down. The Block skill, if used, affects the results rolled with the Block dice, as explained in the Blocking rules.",
    "desc_es": "Cuando se aplica un resultado 'Ambos Derribados' durante un Bloqueo en el que este jugador participa, este jugador puede elegir ignorar el resultado y no ser Derribado."
  },
  {
    "keyEN": "Dauntless",
    "name_en": "Dauntless",
    "name_es": "Agallas",
    "category": "General",
    "desc_en": "When this player performs a Block action, if the target has a higher Strength (before assists), roll a D6 and add this player's Strength. If the total exceeds the target's Strength, this player's Strength is increased to match the target's for this block.",
    "desc_es": "Cuando este jugador realiza una acción de Bloqueo y el objetivo tiene Fuerza mayor, lanza 1D6 y suma la Fuerza de este jugador. Si el total supera la Fuerza del objetivo, la Fuerza de este jugador se iguala a la del objetivo durante este Bloqueo."
  },
  {
    "keyEN": "Dirty Player (+1)",
    "name_en": "Dirty Player (+1)",
    "name_es": "Jugador Sucio (+1)",
    "category": "General",
    "desc_en": "Add +1 to any Armour roll or Injury roll made by this player when they commit a Foul. You may only modify one of the dice rolls per foul.",
    "desc_es": "Suma +1 a la tirada de Armadura o de Herida al cometer una Falta. Solo se puede modificar una de las dos tiradas."
  },
  {
    "keyEN": "Fend",
    "name_en": "Fend",
    "name_es": "Apartar",
    "category": "General",
    "desc_en": "Opposing players may not follow up blocks made against this player even if the Fend player is Knocked Down. The opposing player may still continue moving after blocking if they declared a Blitz action.",
    "desc_es": "Los jugadores oponentes no pueden seguir los bloqueos realizados contra este jugador, incluso si es Derribado. El oponente puede seguir moviéndose si declaró una acción de Blitz."
  },
  {
    "keyEN": "Frenzy",
    "name_en": "Frenzy",
    "name_es": "Furia",
    "category": "General",
    "desc_en": "Must always follow up if the opponent is pushed. If a 'Pushed' or 'Defender Stumbles' result was chosen, the player must immediately throw a second block against the same opponent as long as they are both still standing and adjacent.",
    "desc_es": "Debe seguir al oponente si es empujado. Si el resultado fue 'Empujón' o 'Tropezón', debe realizar un segundo bloqueo contra el mismo objetivo si ambos siguen en pie y adyacentes."
  },
  {
    "keyEN": "Kick",
    "name_en": "Kick",
    "name_es": "Patada",
    "category": "General",
    "desc_en": "When this team kicks off, you may choose to halve the number of squares that the ball scatters, rounding down fractions. The player must be set up on the pitch and not in a wide zone or on the line of scrimmage.",
    "desc_es": "Al sacar de centro, puedes elegir dividir por dos la distancia de dispersión del balón, redondeando hacia abajo. El jugador no puede estar en zona ancha ni en la línea de scrimmage."
  },
  {
    "keyEN": "Kick-Off Return",
    "name_en": "Kick-Off Return",
    "name_es": "A por el balón",
    "category": "General",
    "desc_en": "A player on the receiving team that is not on the Line of Scrimmage or in an opposing tackle zone may use this skill when the ball has been kicked. It allows the player to move up to 3 squares after the ball has been scattered but before rolling on the Kick-Off table.",
    "desc_es": "Un jugador del equipo receptor que no esté en la Línea de Scrimmage podrá usar esta habilidad cuando el balón haya sido pateado. Le permite moverse hasta 3 casillas tras la dispersión del balón, antes de tirar en la tabla de Saque."
  },
  {
    "keyEN": "Pass Block",
    "name_en": "Pass Block",
    "name_es": "Bloqueo de Pase",
    "category": "General",
    "desc_en": "When the opposing coach announces that one of their players is going to perform a Pass action, this player may move up to three squares. The move must put this player in a position to attempt an interception or bring their tackle zone on the passer or catcher.",
    "desc_es": "Cuando el entrenador oponente anuncia que un jugador va a realizar una acción de Pase, este jugador puede moverse hasta 3 casillas para ponerse en posición de interceptar o marcar al lanzador o receptor."
  },
  {
    "keyEN": "Pro",
    "name_en": "Pro",
    "name_es": "Pro",
    "category": "General",
    "desc_en": "Once per turn, a Pro may re-roll any one dice roll they have made (other than Armour, Injury, or Casualty). Before the re-roll, their coach must roll a D6. On 3+, the dice can be re-rolled. On 1 or 2, the dice cannot be re-rolled.",
    "desc_es": "Una vez por turno, puede repetir cualquier tirada que haya realizado (excepto Armadura, Herida o Casualidad). Primero lanza 1D6: con 3+, puede repetirla; con 1-2, no puede."
  },
  {
    "keyEN": "Shadowing",
    "name_en": "Shadowing",
    "name_es": "Marcaje",
    "category": "General",
    "desc_en": "When an opposition player they are Marking moves out of their Tackle Zone, roll a D6 adding this player's MA and subtracting the opposition's MA. On 6+, or a natural 6, this player may immediately move into the vacated square.",
    "desc_es": "Cuando un oponente que está marcando se aleja, lanza 1D6 + Movimiento de este jugador - Movimiento del oponente. Con 6+ o un 6 natural, puede moverse inmediatamente a la casilla vacada."
  },
  {
    "keyEN": "Strip Ball",
    "name_en": "Strip Ball",
    "name_es": "Balón Robado",
    "category": "General",
    "desc_en": "When blocking an opponent with the ball, applying a 'Pushed' or 'Defender Stumbles' result causes the opposing player to drop the ball in the square they are pushed to, even if they are not Knocked Down.",
    "desc_es": "Al empujar a un oponente con el balón, el resultado 'Empujón' o 'Tropezón' provoca que el oponente suelte el balón en la casilla a la que es empujado, aunque no haya sido Derribado."
  },
  {
    "keyEN": "Sure Hands",
    "name_en": "Sure Hands",
    "name_es": "Manos Seguras",
    "category": "General",
    "desc_en": "May re-roll a failed attempt to pick up the ball. In addition, the Strip Ball skill cannot be used against this player.",
    "desc_es": "Puede repetir un intento fallido de recoger el balón. Además, la habilidad Balón Robado no puede usarse contra este jugador."
  },
  {
    "keyEN": "Tackle",
    "name_en": "Tackle",
    "name_es": "Placaje",
    "category": "General",
    "desc_en": "Opposing players in any of this player's tackle zones cannot use the Dodge skill when they attempt to dodge or when this player throws a block at them using the Tackle skill.",
    "desc_es": "Los jugadores oponentes en la Zona de Defensa de este jugador no pueden usar Esquivar al intentar esquivar desde ella, ni cuando este jugador les lanza un bloqueo con Placaje activo."
  },
  {
    "keyEN": "Wrestle",
    "name_en": "Wrestle",
    "name_es": "Lucha",
    "category": "General",
    "desc_en": "May use Wrestle when blocking or being blocked if a 'Both Down' result is chosen. Instead of applying 'Both Down', both players are Placed Prone without Armour rolls. Does not cause a Turnover unless the active player held the ball.",
    "desc_es": "Puede usar Lucha cuando bloquea o es bloqueado y se elige un resultado 'Ambos Derribados'. Ambos jugadores son colocados Boca Abajo sin tiradas de Armadura. No causa un cambio de turno salvo que el jugador activo lleve el balón."
  },
  {
    "keyEN": "Catch",
    "name_en": "Catch",
    "name_es": "Atrapar",
    "category": "Agility",
    "desc_en": "May re-roll a failed Agility test when attempting to catch the ball. Also allows re-rolling if the player drops a hand-off or fails to make an interception.",
    "desc_es": "Puede repetir una prueba de Agilidad fallida al intentar atrapar el balón. También permite repetir si suelta un pase en mano o falla una intercepción."
  },
  {
    "keyEN": "Defensive",
    "name_en": "Defensive",
    "name_es": "Defensa",
    "category": "Agility",
    "desc_en": "During the opponent's team turn (but not during your own turn), any opposition player being marked by this player cannot use the Guard skill.",
    "desc_es": "Durante el turno de equipo del oponente (no el propio), ningún jugador oponente marcado por este jugador puede usar la habilidad Defensa (Guard)."
  },
  {
    "keyEN": "Diving Catch",
    "name_en": "Diving Catch",
    "name_es": "Recepción en Plancha",
    "category": "Agility",
    "desc_en": "Add +1 to any catch roll from an accurate pass targeted at this player's square. Also, this player can attempt to catch any pass, kick-off, or crowd throw-in that would land in an empty square within one of their tackle zones.",
    "desc_es": "Suma +1 a la tirada de atrapar un pase preciso dirigido a su casilla. Además, puede intentar atrapar cualquier pase, saque o devolución de gentío que aiterre en una casilla vacía dentro de su Zona de Defensa."
  },
  {
    "keyEN": "Diving Tackle",
    "name_en": "Diving Tackle",
    "name_es": "Placaje de Buceo",
    "category": "Agility",
    "desc_en": "If an opponent marked by this player passes their Agility test to Dodge or Leap, this player may be Placed Prone in the vacated square to subtract 2 from the result of that roll.",
    "desc_es": "Si un oponente marcado por este jugador supera la tirada de Agilidad para Esquivar o Saltar, puede colocarse Boca Abajo en la casilla vacada para restar 2 al resultado de esa tirada."
  },
  {
    "keyEN": "Dodge",
    "name_en": "Dodge",
    "name_es": "Esquivar",
    "category": "Agility",
    "desc_en": "May re-roll one failed Dodge roll per turn. In addition, the Dodge skill affects 'Stumble' results on the Block dice.",
    "desc_es": "Una vez por turno de equipo, puede repetir una prueba de Agilidad fallida al intentar Esquivar. Además, afecta al resultado 'Tropezón' en los dados de Bloqueo a favor de este jugador."
  },
  {
    "keyEN": "Jump Up",
    "name_en": "Jump Up",
    "name_es": "Levantarse",
    "category": "Agility",
    "desc_en": "If the player declares any action other than a Block action, they may stand up for free. May also declare a Block action while Prone by making an Agility test (+2 modifier).",
    "desc_es": "Si está Boca Abajo y declara cualquier acción que no sea Bloqueo, puede levantarse gratis. También puede declarar una acción de Bloqueo Boca Abajo realizando una prueba de Agilidad (+2)."
  },
  {
    "keyEN": "Leap",
    "name_en": "Leap",
    "name_es": "Salto",
    "category": "Agility",
    "desc_en": "During movement, may Leap over any single adjacent square, including unoccupied squares and squares occupied by Standing players. Reduces any negative modifier applied to the Agility test when leaping by 1, to a minimum of -1.",
    "desc_es": "Durante el movimiento, puede saltar sobre cualquier casilla adyacente, ocupada o no. Reduce en 1 cualquier modificador negativo de Agilidad al saltar, hasta un mínimo de -1."
  },
  {
    "keyEN": "Safe Pair of Hands",
    "name_en": "Safe Pair of Hands",
    "name_es": "Manos con Agarre",
    "category": "Agility",
    "desc_en": "If this player is Knocked Down or Placed Prone while in possession of the ball, the ball does not bounce. Instead, you may place the ball in any unoccupied adjacent square.",
    "desc_es": "Si este jugador cae Boca Abajo o es Derribado con el balón, el balón no rebota. En cambio, puede colocarse en cualquier casilla vacía adyacente."
  },
  {
    "keyEN": "Side Step",
    "name_en": "Side Step",
    "name_es": "Echarse a un lado",
    "category": "Agility",
    "desc_en": "When pushed back for any reason, you may choose any unoccupied adjacent square to push this player into instead of the square chosen by the opposing coach.",
    "desc_es": "Cuando es empujado por cualquier motivo, el entrenador elige a qué casilla adyacente libre se mueve en lugar del oponente."
  },
  {
    "keyEN": "Sneaky Git",
    "name_en": "Sneaky Git",
    "name_es": "Sucio y Rastrero",
    "category": "Agility",
    "desc_en": "During a Foul action, a player with this skill is not ejected for rolling natural doubles on the Armour roll.",
    "desc_es": "Al cometer una Falta, este jugador no es expulsado si saca un doble natural en la tirada de Armadura."
  },
  {
    "keyEN": "Sprint",
    "name_en": "Sprint",
    "name_es": "Esprintar",
    "category": "Agility",
    "desc_en": "When this player performs any action that includes movement, they may attempt to Rush (Go For It) three times, rather than the usual two.",
    "desc_es": "Cuando realiza cualquier acción que incluya movimiento, puede intentar Correr a todo o Correr al Límite (Rush) tres veces en lugar de las dos habituales."
  },
  {
    "keyEN": "Sure Feet",
    "name_en": "Sure Feet",
    "name_es": "Pies Firmes",
    "category": "Agility",
    "desc_en": "Once per team turn, during their activation, this player may re-roll the D6 when attempting to Rush (Go For It).",
    "desc_es": "Una vez por turno de equipo, durante su activación, puede repetir la tirada de 1D6 al intentar Correr al Límite (Rush)."
  },
  {
    "keyEN": "Accurate",
    "name_en": "Accurate",
    "name_es": "Preciso",
    "category": "Passing",
    "desc_en": "Add an additional +1 modifier to the Passing Ability test when performing a Quick Pass or a Short Pass.",
    "desc_es": "Aplica un modificador adicional de +1 a la prueba de Habilidad de Pase al realizar un Pase Rápido o un Pase Corto."
  },
  {
    "keyEN": "Cannoneer",
    "name_en": "Cannoneer",
    "name_es": "Cañonero",
    "category": "Passing",
    "desc_en": "When performing a Long Pass or Long Bomb Pass action, apply an additional +1 modifier to the Passing Ability test.",
    "desc_es": "Al realizar una acción de Pase Largo o Pase Bomba Larga, aplica un modificador adicional de +1 a la prueba de Habilidad de Pase."
  },
  {
    "keyEN": "Cloud Burster",
    "name_en": "Cloud Burster",
    "name_es": "Rompe nubes",
    "category": "Passing",
    "desc_en": "When performing a Long Pass or Long Bomb Pass action, you may choose to make the opposing coach re-roll a successful attempt to interfere with the pass.",
    "desc_es": "Al realizar una acción de Pase Largo o Pase Bomba Larga, puedes hacer que el entrenador oponente repita un intento de intercepción exitoso."
  },
  {
    "keyEN": "Dump-Off",
    "name_en": "Dump-Off",
    "name_es": "Pase Rápido",
    "category": "Passing",
    "desc_en": "If nominatred as the target of a Block action while in possession of the ball, may immediately perform a Quick Pass action before the block is resolved. This pass cannot cause a Turnover.",
    "desc_es": "Si es el objetivo de un Bloqueo y lleva el balón, puede realizar inmediatamente un Pase Rápido antes de que se resuelva el bloqueo. Este pase no puede causar un cambio de turno."
  },
  {
    "keyEN": "Fumblerooskie",
    "name_en": "Fumblerooskie",
    "name_es": "Fumblerooskie",
    "category": "Passing",
    "desc_en": "When performing a Move or Blitz action while in possession of the ball, may choose to 'drop' the ball in any square they vacate during movement. No Turnover is caused.",
    "desc_es": "Al realizar una acción de Movimiento o Blitz con el balón, puede elegir 'soltar' el balón en cualquier casilla que abandone durante su movimiento. No se produce cambio de turno."
  },
  {
    "keyEN": "Give and Go",
    "name_en": "Give and Go",
    "name_es": "Dar y Correr",
    "category": "Passing",
    "desc_en": "If this player performs a Hand-off action, their activation does not have to end. If they have not used their full Movement Allowance, they may continue to move after resolving the Hand-off.",
    "desc_es": "Si realiza una acción de Pase en Mano, su activación no tiene que terminar una vez resuelta. Si no ha agotado su Movimiento, puede seguir moviéndose."
  },
  {
    "keyEN": "Hail Mary Pass",
    "name_en": "Hail Mary Pass",
    "name_es": "Hail Mary Pass",
    "category": "Passing",
    "desc_en": "May throw the ball to any square on the pitch — the range ruler is not used. On a 1, the pass is fumbled. On 2-6, the pass is made but is never accurate — the ball automatically scatters three squares. Cannot be intercepted.",
    "desc_es": "Puede lanzar el balón a cualquier casilla del campo sin usar la regla de distancia. Con un 1, pifa. Con 2-6, el pase nunca es preciso: el balón dispersa 3 casillas. No se puede interceptar."
  },
  {
    "keyEN": "Leader",
    "name_en": "Leader",
    "name_es": "Líder",
    "category": "Passing",
    "desc_en": "A team with one or more players with this Skill gains a single extra team re-roll, which can only be used if at least one player with this Skill is on the pitch.",
    "desc_es": "El equipo obtiene una Segunda Oportunidad de equipo adicional que solo puede usarse si al menos un jugador con esta habilidad está en el campo."
  },
  {
    "keyEN": "Nerves of Steel",
    "name_en": "Nerves of Steel",
    "name_es": "Nervios de Acero",
    "category": "Passing",
    "desc_en": "This player ignores any modifier for being Marked when attempting to Pass, catch, or intercept the ball.",
    "desc_es": "Ignora cualquier modificador por estar marcado al intentar realizar un Pase, atrapar el balón o intentar interceptarlo."
  },
  {
    "keyEN": "On The Ball",
    "name_en": "On The Ball",
    "name_es": "Al Acecho",
    "category": "Passing",
    "desc_en": "When the opposing coach declares a Pass action, this player may move up to 3 squares (ignoring their MA) before the Passing Ability test. Also, during each Start of Drive, one Open player with this Skill may move up to 3 squares.",
    "desc_es": "Cuando el oponente declara una acción de Pase, puede moverse hasta 3 casillas (ignorando su Movimiento normal) antes de la prueba. También puede moverse 3 casillas al inicio de cada serie, antes del saque."
  },
  {
    "keyEN": "Pass",
    "name_en": "Pass",
    "name_es": "Pasar",
    "category": "Passing",
    "desc_en": "May re-roll a failed Passing Ability test when performing a Pass action (inaccurate pass or fumble).",
    "desc_es": "Puede repetir una prueba de Habilidad de Pase fallida al realizar una acción de Pase (pase impreciso o pifia)."
  },
  {
    "keyEN": "Running Pass",
    "name_en": "Running Pass",
    "name_es": "Pase en Carrera",
    "category": "Passing",
    "desc_en": "If this player performs a Quick Pass action, their activation does not have to end. If they have not used their full Movement Allowance, they may continue to move after resolving the pass.",
    "desc_es": "Si realiza una acción de Pase Rápido, su activación no tiene que terminar. Si no ha agotado su Movimiento, puede seguir moviéndose tras resolver el pase."
  },
  {
    "keyEN": "Safe Pass",
    "name_en": "Safe Pass",
    "name_es": "Pase Seguro",
    "category": "Passing",
    "desc_en": "Should this player fumble a Pass action, the ball is not dropped and no Turnover is caused. Instead, this player retains possession and their activation ends.",
    "desc_es": "Si pifa una acción de Pase, el balón no cae y no hay cambio de turno. El jugador retiene la posesión y su activación termina."
  },
  {
    "keyEN": "Arm Bar",
    "name_en": "Arm Bar",
    "name_es": "Palanca de Brazo",
    "category": "Strength",
    "desc_en": "If an opposition player Falls Over as a result of failing their Agility test when Dodging, Jumping, or Leaping out of a square in which they were being Marked by this player, apply a +1 modifier to either the Armour roll or Injury roll.",
    "desc_es": "Si un oponente cae al fallar una prueba de Agilidad al Esquivar, Saltar o Rebotar desde una casilla en la que estaba marcado por este jugador, aplica un +1 a la tirada de Armadura o Herida."
  },
  {
    "keyEN": "Brawler",
    "name_en": "Brawler",
    "name_es": "Luchador",
    "category": "Strength",
    "desc_en": "When performing a Block action on its own (not as part of a Blitz action), this player may re-roll a single Both Down result.",
    "desc_es": "Al realizar una acción de Bloqueo por sí solo (no como parte de un Blitz), puede repetir un único resultado 'Ambos Derribados'."
  },
  {
    "keyEN": "Break Tackle",
    "name_en": "Break Tackle",
    "name_es": "Romper Placar",
    "category": "Strength",
    "desc_en": "Once per activation, when making an Agility test to Dodge, this player may modify the roll by +1 if their ST is 4 or less, or +2 if their ST is 5 or more.",
    "desc_es": "Una vez por activación, después de realizar una prueba de Agilidad para Esquivar, puede modifcar el resultado en +1 si su Fuerza es 4 o menos, o en +2 si su Fuerza es 5 o más."
  },
  {
    "keyEN": "Grab",
    "name_en": "Grab",
    "name_es": "Agarrar",
    "category": "Strength",
    "desc_en": "When blocking results in a push back, may choose any empty adjacent square to push the opponent into. Cannot be used with Frenzy. A player with Grab can never learn Frenzy and vice versa.",
    "desc_es": "Al empujar a un oponente, puede elegir cualquier casilla adyacente libre en lugar de la casilla estándar de empuje. No puede usarse con Furia. Un jugador con Agarrar no puede aprender Furia y viceversa."
  },
  {
    "keyEN": "Guard",
    "name_en": "Guard",
    "name_es": "Defensa",
    "category": "Strength",
    "desc_en": "When performing a Block action, this player can offer both offensive and defensive assists regardless of how many opposition players are Marking them. Cannot be used to assist a foul.",
    "desc_es": "Al realizar una acción de Bloqueo, puede ofrecer apoyos tanto ofensivos como defensivos independientemente de cuántos oponentes lo estén marcando. No puede usarse para apoyar una Falta."
  },
  {
    "keyEN": "Juggernaut",
    "name_en": "Juggernaut",
    "name_es": "Juggernaut",
    "category": "Strength",
    "desc_en": "During a Blitz action, the opposing player cannot use Fend, Stand Firm, or Wrestle. This player may also treat a 'Both Down' result as 'Pushed' for blocks made during a Blitz.",
    "desc_es": "En un Blitz, el oponente no puede usar Apartar, Mantenerse Firme o Lucha. Además, puede tratar un resultado 'Ambos Derribados' como 'Empujón' durante un Blitz."
  },
  {
    "keyEN": "Mighty Blow (+1)",
    "name_en": "Mighty Blow (+1)",
    "name_es": "Golpe Mortífero (+1)",
    "category": "Strength",
    "desc_en": "Add +1 to any Armour or Injury roll when an opponent is Knocked Down as a result of a block by this player. Only one of the dice rolls may be modified.",
    "desc_es": "Cuando un oponente es Derribado como resultado de un bloqueo realizado por este jugador, puede modificar la tirada de Armadura o de Herida en +1. Solo se puede modificar una de las dos tiradas."
  },
  {
    "keyEN": "Multiple Block",
    "name_en": "Multiple Block",
    "name_es": "Placaje Múltiple",
    "category": "Strength",
    "desc_en": "May throw blocks against two adjacent opponents. Each defender's strength is increased by 2. Cannot follow up either block. Cannot be used together with Frenzy.",
    "desc_es": "Puede lanzar bloqueos contra dos oponentes adyacentes. La Fuerza de cada defensor aumenta en 2. No puede seguir a ninguno de los bloqueos. No puede usarse junto con Furia."
  },
  {
    "keyEN": "Piling On",
    "name_en": "Piling On",
    "name_es": "Piling On",
    "category": "Strength",
    "desc_en": "After making a block that Knocks Down the victim, may re-roll the Armour roll or Injury roll for the victim. The Piling On player is then Placed Prone in their own square.",
    "desc_es": "Después de realizar un bloqueo que derriba al objetivo, puede repetir la tirada de Armadura o de Herida. El jugador con Piling On queda Boca Abajo en su propia casilla."
  },
  {
    "keyEN": "Pile Driver",
    "name_en": "Pile Driver",
    "name_es": "Martillo",
    "category": "Strength",
    "desc_en": "When an opposition player is Knocked Down as a result of a block, this player may immediately commit a free Foul action against them. After using this Skill, this player is Placed Prone and their activation ends.",
    "desc_es": "Cuando un oponente es Derribado como resultado de un bloqueo, puede cometer inmediatamente una Falta gratuita contra él. Tras usarla, este jugador queda Boca Abajo y su activación termina."
  },
  {
    "keyEN": "Stand Firm",
    "name_en": "Stand Firm",
    "name_es": "Mantenerse Firme",
    "category": "Strength",
    "desc_en": "May choose not to be pushed back, whether as a result of a Block action or a chain push.",
    "desc_es": "Puede elegir no ser empujado como resultado de un Bloqueo realizado contra él o de un empujón en cadena."
  },
  {
    "keyEN": "Strong Arm",
    "name_en": "Strong Arm",
    "name_es": "Brazo Fuerte",
    "category": "Strength",
    "desc_en": "Apply a +1 modifier to any Passing Ability test rolls when performing a Throw Team-mate action. Only a player with the Throw Team-mate trait can have this Skill.",
    "desc_es": "Aplica un +1 a las pruebas de Habilidad de Pase al realizar una acción Lanzar Compañero. Solo puede tenerla un jugador con el rasgo Lanzar Compañero."
  },
  {
    "keyEN": "Thick Skull",
    "name_en": "Thick Skull",
    "name_es": "Cabeza Dura",
    "category": "Strength",
    "desc_en": "When an Injury roll is made against this player, they can only be KO'd on a roll of 9, and a roll of 8 is treated as Stunned. If this player also has the Stunty trait, they can only be KO'd on a roll of 8 (7 = Stunned).",
    "desc_es": "Solo puede quedar KO con un 9 en la tirada de Herida (un 8 se trata como Aturdido). Si también tiene el rasgo Canijo, solo queda KO con un 8 (7 = Aturdido)."
  },
  {
    "keyEN": "Big Hand",
    "name_en": "Big Hand",
    "name_es": "Mano Grande",
    "category": "Mutation",
    "desc_en": "Ignores modifiers for enemy tackle zones or Pouring Rain weather when attempting to pick up the ball.",
    "desc_es": "Ignora modificadores por estar marcado o por lluvia al intentar recoger el balón."
  },
  {
    "keyEN": "Claws",
    "name_en": "Claws",
    "name_es": "Garras",
    "category": "Mutation",
    "desc_en": "When an opponent is Knocked Down by this player during a block, any Armour roll of 8 or more after modifications automatically breaks armour.",
    "desc_es": "Cuando un oponente es Derribado como resultado de un bloqueo de este jugador, cualquier tirada de Armadura de 8 o más (antes de modificadores) rompe automáticamente su armadura."
  },
  {
    "keyEN": "Disturbing Presence",
    "name_en": "Disturbing Presence",
    "name_es": "Presencia Perturbadora",
    "category": "Mutation",
    "desc_en": "Any player must subtract 1 from the D6 when they pass, intercept, or catch for each opposing player with Disturbing Presence within three squares of them.",
    "desc_es": "Cualquier jugador a 3 casillas o menos resta -1 a sus tiradas de Pase, Atrapar o Interceptar por cada jugador oponente con esta habilidad en ese rango."
  },
  {
    "keyEN": "Extra Arms",
    "name_en": "Extra Arms",
    "name_es": "Brazos Extras",
    "category": "Mutation",
    "desc_en": "Add +1 to any attempt to pick up, catch, or intercept the ball.",
    "desc_es": "Suma +1 a cualquier intento de recoger, atrapar o interceptar el balón."
  },
  {
    "keyEN": "Foul Appearance",
    "name_en": "Foul Appearance",
    "name_es": "Apariencia Asquerosa",
    "category": "Mutation",
    "desc_en": "When an opposition player declares a Block or special action targeting this player, their coach must first roll a D6. On a 1, the action cannot be performed and is wasted.",
    "desc_es": "Cuando un oponente declara un Bloqueo o acción especial contra este jugador, primero debe sacar 2+ en 1D6. Con un 1, la acción no puede realizarse y se pierde."
  },
  {
    "keyEN": "Horns",
    "name_en": "Horns",
    "name_es": "Cuernos",
    "category": "Mutation",
    "desc_en": "Adds +1 to this player's Strength for any block(s) made during a Blitz action.",
    "desc_es": "Suma +1 a la Fuerza de este jugador para cualquier bloqueo realizado durante una acción de Blitz."
  },
  {
    "keyEN": "Iron Hard Skin",
    "name_en": "Iron Hard Skin",
    "name_es": "Piel de Hierro",
    "category": "Mutation",
    "desc_en": "Opposing players cannot modify any Armour rolls made against this player. In addition, the Claws skill cannot be used when making an Armour roll against this player.",
    "desc_es": "Los jugadores oponentes no pueden modificar las tiradas de Armadura realizadas contra este jugador. Además, la habilidad Garras no puede usarse contra él."
  },
  {
    "keyEN": "Monstrous Mouth",
    "name_en": "Monstrous Mouth",
    "name_es": "Boca Monstruosa",
    "category": "Mutation",
    "desc_en": "May re-roll any failed attempt to catch the ball. In addition, the Strip Ball skill cannot be used against this player.",
    "desc_es": "Puede repetir cualquier intento fallido de atrapar el balón. Además, la habilidad Balón Robado no puede usarse contra este jugador."
  },
  {
    "keyEN": "Prehensile Tail",
    "name_en": "Prehensile Tail",
    "name_es": "Cola Prensil",
    "category": "Mutation",
    "desc_en": "When an active opposition player attempts to Dodge, Jump, or Leap from a square in which they are being Marked by this player, apply an additional -1 modifier to their Agility test.",
    "desc_es": "Cuando un oponente activo intenta Esquivar, Saltar o Rebotar desde una casilla en la que está marcado por este jugador, aplica un modificador adicional de -1 a su prueba de Agilidad."
  },
  {
    "keyEN": "Tentacles",
    "name_en": "Tentacles",
    "name_es": "Tentáculos",
    "category": "Mutation",
    "desc_en": "When a marked opposition player moves out of this player's Tackle Zone, roll a D6 adding this player's ST and subtracting the opposition's ST. On 6+, the opposition player is held firmly in place.",
    "desc_es": "Cuando un oponente marcado intenta moverse fuera de la Zona de Defensa, lanza 1D6 + Fuerza de este jugador - Fuerza del oponente. Con 6+ o un 6 natural, el oponente queda retenido."
  },
  {
    "keyEN": "Two Heads",
    "name_en": "Two Heads",
    "name_es": "Dos Cabezas",
    "category": "Mutation",
    "desc_en": "Apply a +1 modifier to the Agility test when attempting to Dodge.",
    "desc_es": "Aplica un modificador de +1 a la prueba de Agilidad al intentar Esquivar."
  },
  {
    "keyEN": "Very Long Legs",
    "name_en": "Very Long Legs",
    "name_es": "Piernas Muy Largas",
    "category": "Mutation",
    "desc_en": "Reduce any negative modifier applied to the Agility test when jumping or leaping by 1 (minimum -1). Also apply a +2 modifier to any interception attempts. Ignores the Cloud Burster skill.",
    "desc_es": "Reduce en 1 los modificadores negativos para saltar (mínimo -1). Suma +2 a las intercepciones. Ignora la habilidad Rompe Nubes (Cloud Burster)."
  },
  {
    "keyEN": "Always Hungry",
    "name_en": "Always Hungry",
    "name_es": "Siempre Hambriento",
    "category": "Trait",
    "desc_en": "When performing a Throw Team-mate action, roll a D6 first. On 2+, continue normally. On 1, this player tries to eat their team-mate. Roll again: on 1, the team-mate is eaten and permanently removed.",
    "desc_es": "Al intentar Lanzar Compañero, lanza primero 1D6. Con 2+, continúa normalmente. Con 1, intenta comerse al compañero. Lanza otro 1D6: con 1, el compañero es devorado y eliminado definitivamente."
  },
  {
    "keyEN": "Animal Savagery",
    "name_en": "Animal Savagery",
    "name_es": "Salvajismo Animal",
    "category": "Trait",
    "desc_en": "When activated, roll a D6 (+2 modifier if declaring a Block or Blitz action). On 1-3, must immediately Knock Down an adjacent Standing team-mate. If no adjacent team-mate, activation ends and this player loses their Tackle Zone.",
    "desc_es": "Al activarse, lanza 1D6 (+2 si Bloqueo o Blitz). Con 1-3, debe Derribar inmediatamente a un compañero adyacente de pie. Si no hay ninguno, su activación termina y pierde su Zona de Defensa."
  },
  {
    "keyEN": "Animosity (all team-mates)",
    "name_en": "Animosity (all team-mates)",
    "name_es": "Animosidad (todos los compañeros)",
    "category": "Trait",
    "desc_en": "When attempting to Hand-off or Pass to any team-mate, roll a D6. On a 1, the player refuses to do so and their activation ends.",
    "desc_es": "Al intentar pasar en mano o pasar a cualquier compañero, lanza 1D6. Con un 1, el jugador se niega y su activación termina."
  },
  {
    "keyEN": "Ball & Chain",
    "name_en": "Ball & Chain",
    "name_es": "Bola y Cadena",
    "category": "Trait",
    "desc_en": "The only action this player may perform is a 'Ball and Chain Move'. Move using the throw-in template direction. Automatically passes any Dodge Agility tests. Must perform a Block against any standing player in their path. If they Fall Over, an Injury roll is made automatically.",
    "desc_es": "Solo puede realizar acciones de 'Movimiento Bola y Cadena'. Usa la plantilla de devolución. Pasa automáticamente las pruebas de Esquivar. Debe bloquear a cualquier jugador en pie en su camino. Si cae, se tira herida automáticamente."
  },
  {
    "keyEN": "Bloodlust (2+)",
    "name_en": "Bloodlust (2+)",
    "name_es": "Sed de Sangre (2+)",
    "category": "Trait",
    "desc_en": "When activated, roll a D6 (+1 if Block/Blitz). On 2+, activate normally. If lower, may continue but must bite an adjacent Thrall at activation end or a Turnover is caused and this player loses their Tackle Zone.",
    "desc_es": "Al activarse, lanza 1D6 (+1 si Bloqueo/Blitz). Con 2+, se activa normalmente. Si falla, puede continuar pero al final de su activación debe morder a un Aprendiz adyacente o se produce un cambio de turno y pierde su Zona de Defensa."
  },
  {
    "keyEN": "Bloodlust (3+)",
    "name_en": "Bloodlust (3+)",
    "name_es": "Sed de Sangre (3+)",
    "category": "Trait",
    "desc_en": "When activated, roll a D6 (+1 if Block/Blitz). On 3+, activate normally. If lower, may continue but must bite an adjacent Thrall at activation end or a Turnover is caused and this player loses their Tackle Zone.",
    "desc_es": "Al activarse, lanza 1D6 (+1 si Bloqueo/Blitz). Con 3+, se activa normalmente. Si falla, puede continuar pero al final de su activación debe morder a un Aprendiz adyacente o se produce un cambio de turno y pierde su Zona de Defensa."
  },
  {
    "keyEN": "Bombardier",
    "name_en": "Bombardier",
    "name_es": "Bombardero",
    "category": "Trait",
    "desc_en": "When activated and Standing, may perform a 'Throw Bomb' Special action. A Bomb is thrown and caught like a ball. If caught, it detonates on 4+; on 1-3 it must be thrown again immediately.",
    "desc_es": "Cuando se activa y está de Pie, puede realizar una acción especial 'Lanzar Bomba'. La bomba se lanza como el balón pero: no puede moverse antes, las bombas no rebotan. Si una bomba es atrapada, detona con 4+; con 1-3 debe volver a lanzarse."
  },
  {
    "keyEN": "Bone Head",
    "name_en": "Bone Head",
    "name_es": "Cabeza de Hueso",
    "category": "Trait",
    "desc_en": "When activated, roll a D6. On a 1, the player forgets what they were doing and their activation ends. They also lose their Tackle Zone until their next activation.",
    "desc_es": "Al activarse, lanza 1D6. Con un 1, el jugador olvida qué estaba haciendo, su activación termina y pierde su Zona de Defensa hasta su próxima activación. Con 2+, continúa normalmente."
  },
  {
    "keyEN": "Breathe Fire",
    "name_en": "Breathe Fire",
    "name_es": "Escupir Fuego",
    "category": "Trait",
    "desc_en": "Once per activation, instead of a Block action, may perform a Breathe Fire Special action. Roll a D6 against a Standing opponent (-1 if ST 5+): 1 = self knocked down, 2-3 = nothing, 4+ = opponent Placed Prone, 6 = opponent Knocked Down.",
    "desc_es": "Una vez por activación, en lugar de un Bloqueo, puede realizar una acción especial Escupir Fuego. Lanza 1D6 contra un oponente de Pie marcado (-1 si FU 5+): 1 = se derriba a sí mismo, 2-3 = nada, 4+ = oponente Boca Abajo, 6 = oponente Derribado."
  },
  {
    "keyEN": "Chainsaw",
    "name_en": "Chainsaw",
    "name_es": "Motosierra",
    "category": "Trait",
    "desc_en": "Instead of blocking, perform a Chainsaw Attack. Roll a D6: on 2+, the target is hit; on 1, the chainsaw kickbacks and hits this player (Turnover). An Armour roll is made with +3. This player can only use the Chainsaw once per turn.",
    "desc_es": "En lugar de bloquear, realiza un Ataque de Motosierra. Lanza 1D6: con 2+, el objetivo es golpeado; con 1, la motosierra da una patada hacia atrás y golpea al propio jugador (cambio de turno). La tirada de Armadura tiene +3."
  },
  {
    "keyEN": "Decay",
    "name_en": "Decay",
    "name_es": "Descomposición",
    "category": "Trait",
    "desc_en": "If this player suffers a Casualty result on the Injury table, there is a +1 modifier applied to all rolls made against this player on the Casualty table.",
    "desc_es": "Si sufre un resultado de Casualidad en la tabla de Heridas, hay un modificador de +1 a todas las tiradas contra este jugador en la tabla de Casualidades."
  },
  {
    "keyEN": "Drunkard",
    "name_en": "Drunkard",
    "name_es": "Borracho",
    "category": "Trait",
    "desc_en": "This player suffers a -1 penalty to the dice roll when attempting to Rush (Go For It).",
    "desc_es": "Sufre un penalizador de -1 a la tirada de dado al intentar Correr al Límite (Rush)."
  },
  {
    "keyEN": "Fan Favourite",
    "name_en": "Fan Favourite",
    "name_es": "Favorito del Público",
    "category": "Trait",
    "desc_en": "For each player with Fan Favourite on the pitch, the team receives an additional +1 FAME modifier for any Kick-Off table results (but not for the Winnings roll).",
    "desc_es": "Por cada jugador con este rasgo en el campo, el equipo recibe un modificador FAME adicional de +1 para cualquier resultado de la tabla de Saque (pero no para la tirada de Ganancias)."
  },
  {
    "keyEN": "Hit and Run",
    "name_en": "Hit and Run",
    "name_es": "Pegar y Correr",
    "category": "Trait",
    "desc_en": "After performing a Block action, may immediately move one free square ignoring Tackle Zones as long as they are still Standing. Must not be Marking or being Marked after the free move.",
    "desc_es": "Después de realizar una acción de Bloqueo, puede moverse una casilla libre ignorando Zonas de Defensa, siempre que siga de Pie y no quede marcando ni siendo marcado tras el movimiento."
  },
  {
    "keyEN": "Hypnotic Gaze",
    "name_en": "Hypnotic Gaze",
    "name_es": "Mirada Hipnótica",
    "category": "Trait",
    "desc_en": "At the end of a Move action, may target an adjacent opponent. Make an Agility roll (-1 for each opposing tackle zone other than the victim's). If successful, the opponent loses their tackle zone and cannot catch, intercept, pass, assist, or move voluntarily until their next action.",
    "desc_es": "Al final de una acción de Movimiento, puede usar la Mirada Hipnótica contra un oponente adyacente. Realiza una prueba de Agilidad (-1 por cada Zona de Defensa oponente excepto la de la víctima). Si tiene éxito, el oponente pierde su Zona de Defensa y no puede atrapar, interceptar, pasar, asistir ni moverse voluntariamente."
  },
  {
    "keyEN": "Kick Team-mate",
    "name_en": "Kick Team-mate",
    "name_es": "Patada Team-Mate",
    "category": "Trait",
    "desc_en": "Once per team turn, in addition to another player performing a Throw Team-mate or Pass action, a player with this Trait may perform a 'Kick Team-mate' Special action following Throw Team-mate rules.",
    "desc_es": "Una vez por turno de equipo, además de que otro jugador realice un Pase o Lanzar Compañero, un jugador con este Rasgo puede realizar una acción especial 'Patada a Compañero', siguiendo las reglas de Lanzar Compañero."
  },
  {
    "keyEN": "Loner (3+)",
    "name_en": "Loner (3+)",
    "name_es": "Solitario (3+)",
    "category": "Trait",
    "desc_en": "To use a team re-roll, roll a D6. On 3+, the team re-roll may be used as normal. Otherwise, the original result stands but the team re-roll is still lost.",
    "desc_es": "Para usar una Segunda Oportunidad de equipo, lanza 1D6. Con 3+, puede usarla normalmente. De lo contrario, el resultado original se mantiene y la Segunda Oportunidad se pierde de todos modos."
  },
  {
    "keyEN": "Loner (4+)",
    "name_en": "Loner (4+)",
    "name_es": "Solitario (4+)",
    "category": "Trait",
    "desc_en": "To use a team re-roll, roll a D6. On 4+, the team re-roll may be used as normal. Otherwise, the original result stands but the team re-roll is still lost.",
    "desc_es": "Para usar una Segunda Oportunidad de equipo, lanza 1D6. Con 4+, puede usarla normalmente. De lo contrario, el resultado original se mantiene y la Segunda Oportunidad se pierde de todos modos."
  },
  {
    "keyEN": "Loner (5+)",
    "name_en": "Loner (5+)",
    "name_es": "Solitario (5+)",
    "category": "Trait",
    "desc_en": "To use a team re-roll, roll a D6. On 5+, the team re-roll may be used as normal. Otherwise, the original result stands but the team re-roll is still lost.",
    "desc_es": "Para usar una Segunda Oportunidad de equipo, lanza 1D6. Con 5+, puede usarla normalmente. De lo contrario, el resultado original se mantiene y la Segunda Oportunidad se pierde de todos modos."
  },
  {
    "keyEN": "My Ball",
    "name_en": "My Ball",
    "name_es": "My Ball",
    "category": "Trait",
    "desc_en": "Cannot willingly give up the ball. May not make Pass, Hand-off actions, or use any Skill that would relinquish possession. Can only lose the ball by being Knocked Down, Placed Prone, or Falling Over.",
    "desc_es": "No puede ceder el balón voluntariamente. No puede realizar Pases, Pases en Mano ni usar ninguna habilidad que implique ceder la posesión. Solo puede perder el balón siendo Derribado o Boca Abajo."
  },
  {
    "keyEN": "No Hands",
    "name_en": "No Hands",
    "name_es": "Sin Manos",
    "category": "Trait",
    "desc_en": "Cannot pick up, intercept or carry the ball and automatically fails any catch roll. Causes a Turnover if attempting to pick up the ball.",
    "desc_es": "No puede recoger, interceptar ni llevar el balón y fallará automáticamente cualquier tirada de atrapar. Si intenta recoger el balón, rebota y causa un cambio de turno."
  },
  {
    "keyEN": "Pick-Me-Up",
    "name_en": "Pick-Me-Up",
    "name_es": "Levántame",
    "category": "Trait",
    "desc_en": "At the end of the opposition's team turn, roll a D6 for each Prone, non-Stunned team-mate within three squares of a Standing player with this Trait. On a 5+, that Prone player may immediately stand up.",
    "desc_es": "Al final del turno de equipo del oponente, lanza 1D6 por cada compañero Boca Abajo (no Aturdido) a tres casillas o menos de este jugador de Pie. Con 5+, ese compañero puede levantarse inmediatamente."
  },
  {
    "keyEN": "Plague Ridden",
    "name_en": "Plague Ridden",
    "name_es": "Plagado",
    "category": "Trait",
    "desc_en": "Once per game, if an opposition player with ST 4 or less suffers a Casualty result of DEAD as a result of a block or foul by this player and cannot be saved, you may choose to infect them with the plague instead.",
    "desc_es": "Una vez por partido, si un jugador oponente con FU 4 o menos muere como resultado de un bloqueo o falta de este jugador y no puede ser salvado, puedes elegir infectarlo con la plaga en lugar de morir."
  },
  {
    "keyEN": "Pogo Stick",
    "name_en": "Pogo Stick",
    "name_es": "Pogo Stick",
    "category": "Trait",
    "desc_en": "During movement, may Leap over any single adjacent square. When making an Agility test to jump or leap, may ignore negative modifiers for being Marked in the originating and landing squares. Cannot have the Leap skill.",
    "desc_es": "Durante el movimiento, puede saltar sobre cualquier casilla adyacente. Al saltar, puede ignorar los modificadores negativos por estar marcado en la casilla de origen y destino. No puede tener la habilidad Salto (Leap)."
  },
  {
    "keyEN": "Projectile Vomit",
    "name_en": "Projectile Vomit",
    "name_es": "Vómito Proyectil",
    "category": "Trait",
    "desc_en": "Instead of blocking, may perform a Projectile Vomit Special action. Roll a D6: on 2+ the target is hit; on 1, this player covers itself. An unmodifiable Armour roll is made against the player hit.",
    "desc_es": "En lugar de bloquear, puede realizar una acción especial de Vómito Proyectil. Lanza 1D6: con 2+, el objetivo es afectado; con 1, se cubre a sí mismo. Se realiza una tirada de Armadura sin modificar contra el jugador afectado."
  },
  {
    "keyEN": "Really Stupid",
    "name_en": "Really Stupid",
    "name_es": "Realmente Estúpido",
    "category": "Trait",
    "desc_en": "When activated, roll a D6 (+2 if adjacent to a Standing team-mate without this Trait). On 1-3, the player forgets and activation ends. They lose their Tackle Zone until next activation.",
    "desc_es": "Al activarse, lanza 1D6 (+2 si hay un compañero adyacente de Pie sin este Rasgo). Con 1-3, el jugador olvida qué estaba haciendo, su activación termina y pierde su Zona de Defensa."
  },
  {
    "keyEN": "Regeneration",
    "name_en": "Regeneration",
    "name_es": "Regeneración",
    "category": "Trait",
    "desc_en": "After a Casualty roll, roll a D6. On a 4+, the result is discarded and the player is placed in the Reserves box. On 1-3, the Casualty roll is applied as normal.",
    "desc_es": "Después de una tirada de Casualidad, lanza 1D6. Con 4+, el resultado se descarta y el jugador va a la caja de Reservas. Con 1-3, el resultado de Casualidad se aplica normalmente."
  },
  {
    "keyEN": "Right Stuff",
    "name_en": "Right Stuff",
    "name_es": "Buena Gente",
    "category": "Trait",
    "desc_en": "If this player's Strength is 3 or less, they can be thrown by a team-mate with Throw Team-mate.",
    "desc_es": "Si la Fuerza de este jugador es 3 o menos, puede ser lanzado por un compañero con el rasgo Lanzar Compañero."
  },
  {
    "keyEN": "Secret Weapon",
    "name_en": "Secret Weapon",
    "name_es": "Arma Secreta",
    "category": "Trait",
    "desc_en": "When a drive in which this player took part ends, this player is Sent-off for committing a Foul (unless a bribe is used to avoid ejection).",
    "desc_es": "Cuando termina una entrada en la que este jugador participó, es expulsado por cometer una Falta (salvo que se use un soborno para evitarlo)."
  },
  {
    "keyEN": "Stab",
    "name_en": "Stab",
    "name_es": "Puñalada",
    "category": "Trait",
    "desc_en": "Instead of blocking, perform a Stab Special action: make an unmodified Armour roll against the target. If broken, the target is Placed Prone and an unmodifiable Injury roll is made.",
    "desc_es": "En lugar de bloquear, realiza una acción especial de Puñalada: realiza una tirada de Armadura sin modificar contra el objetivo. Si se rompe, queda Boca Abajo y se realiza una tirada de Herida sin modificar."
  },
  {
    "keyEN": "Stakes",
    "name_en": "Stakes",
    "name_es": "Estacas",
    "category": "Trait",
    "desc_en": "May add +1 to the Armour roll when making a Stab attack against any player playing for a Khemri, Necromantic, Undead, or Vampire team.",
    "desc_es": "Puede sumar +1 a la tirada de Armadura al realizar un ataque de Puñalada contra cualquier jugador de los equipos Khemri, Necromante, No-Muerto o Vampiro."
  },
  {
    "keyEN": "Stunty",
    "name_en": "Stunty",
    "name_es": "Canijo",
    "category": "Trait",
    "desc_en": "When Dodging, this player ignores any -1 modifiers for being Marked in the destination square. However, opponents interfering with this player's passes apply +1 to their test. Injury rolls against this player use the Stunty Injury table.",
    "desc_es": "Al Esquivar, ignora los modificadores de -1 por estar marcado en la casilla de destino. Sin embargo, los oponentes que intercepten sus pases aplican +1 a su prueba. Las tiradas de Herida usan la Tabla de Heridas de Canijo."
  },
  {
    "keyEN": "Swarming",
    "name_en": "Swarming",
    "name_es": "Enjambre",
    "category": "Trait",
    "desc_en": "During each Start of Drive, after Step 2, you may remove D3 players with this Trait from the Reserves box and set them up on the pitch (not on the Line of Scrimmage or Wide Zones). These extra players must be in the team's half.",
    "desc_es": "Al inicio de cada serie, tras el Paso 2, puedes retirar 1D3 jugadores con este Rasgo de la caja de Reservas y colocarlos en el campo (no en la Línea de Scrimmage ni en Zona Ancha). Solo puedes añadir tantos como ya estén en el campo."
  },
  {
    "keyEN": "Swoop",
    "name_en": "Swoop",
    "name_es": "Planeo",
    "category": "Trait",
    "desc_en": "If this player is thrown by a team-mate, they do not scatter before landing. Instead, place the Throw-in template over the player and roll D3 squares in a direction determined by rolling a D6.",
    "desc_es": "Si este jugador es lanzado por un compañero, no dispersa antes de aterrizar. En cambio, coloca la plantilla de devolución sobre el jugador y muévelo 1D3 casillas en la dirección determinada por 1D6."
  },
  {
    "keyEN": "Take Root",
    "name_en": "Take Root",
    "name_es": "Enraizarse",
    "category": "Trait",
    "desc_en": "When activated, roll a D6. On a 1, this player becomes 'Rooted' and cannot move from their current square until the end of the drive or until they are Knocked Down.",
    "desc_es": "Al activarse, lanza 1D6. Con un 1, el jugador queda 'Enraizado': no puede moverse de su casilla hasta el final de la entrada o hasta ser Derribado."
  },
  {
    "keyEN": "Throw Team-mate",
    "name_en": "Throw Team-mate",
    "name_es": "Lanzar Compañero",
    "category": "Trait",
    "desc_en": "If this player's Strength is 5 or more, they may perform a Throw Team-mate action, throwing a team-mate with the Right Stuff trait.",
    "desc_es": "Si la Fuerza de este jugador es 5 o más, puede realizar una acción Lanzar Compañero con un compañero que tenga el rasgo Buena Gente."
  },
  {
    "keyEN": "Titchy",
    "name_en": "Titchy",
    "name_es": "Diminuto",
    "category": "Trait",
    "desc_en": "Add +1 to any Agility tests when Dodging. However, if an opposition player dodges into a square within this player's Tackle Zone, this player does not count as Marking the moving player for modifier purposes.",
    "desc_es": "Suma +1 a las pruebas de Agilidad para Esquivar. Sin embargo, los oponentes que esquiven hacia su Zona de Defensa no sufren penalizador por ser marcados por este jugador."
  },
  {
    "keyEN": "Trickster",
    "name_en": "Trickster",
    "name_es": "Tramposo",
    "category": "Trait",
    "desc_en": "When about to be hit by a Block or equivalent Special action, before determining dice count, this player may be placed in any other unoccupied adjacent square. The Block then takes place as normal.",
    "desc_es": "Cuando un oponente está a punto de golpearlo con un Bloqueo o acción especial equivalente, antes de determinar los dados, puede colocarse en cualquier otra casilla adyacente libre. El Bloqueo se resuelve entonces normalmente."
  },
  {
    "keyEN": "Unchannelled Fury",
    "name_en": "Unchannelled Fury",
    "name_es": "Furia Desencadenada",
    "category": "Trait",
    "desc_en": "When activated, roll a D6 (+2 if Block/Blitz). On 1-3, this player rages incoherently and their activation ends immediately. On 4+, they continue normally.",
    "desc_es": "Al activarse, lanza 1D6 (+2 si Bloqueo o Blitz). Con 1-3, el jugador grita incoherentemente y su activación termina de inmediato. Con 4+, continúa normalmente."
  },
  {
    "keyEN": "No Ball",
    "name_en": "No Ball",
    "name_es": "Sin Manos",
    "category": "Trait",
    "desc_en": "This player is unable to pick up, intercept or carry the ball.",
    "desc_es": "Este jugador no puede recoger, interceptar ni llevar el balón."
  },
{
    "keyEN": "Timmm-ber!",
    "name_en": "Timmm-ber!",
    "name_es": "¡Meeeedra!",
    "category": "Trait",
    "desc_en": "If this player has a Strength of 5 or more and is attempting to Stand Up, they gain a +1 modifier to the 4+ roll for each adjacent standing team-mate.",
    "desc_es": "Si este jugador tiene Fuerza 5 o más e intenta Levantarse, gana un modificador de +1 a la tirada de 4+ por cada compañero adyacente que esté de pie."
  },
{
    "keyEN": "Lone Fouler",
    "name_en": "Lone Fouler",
    "name_es": "Faltón Solitario",
    "category": "Trait",
    "desc_en": "This player is so committed to fouling that they do not require assistance to be more effective.",
    "desc_es": "Este jugador está tan comprometido con las faltas que no requiere asistencia para ser más efectivo."
  },
{
    "keyEN": "Quick Foul",
    "name_en": "Quick Foul",
    "name_es": "Falta Rápida",
    "category": "Trait",
    "desc_en": "This player may commit a Foul action as part of a Move or Blitz action, though their activation ends immediately after.",
    "desc_es": "Este jugador puede realizar una acción de Falta como parte de un Movimiento o Blitz, aunque su activación termina inmediatamente después."
  },
{
    "keyEN": "Bullseye",
    "name_en": "Bullseye",
    "name_es": "Ojo de Buey",
    "category": "Trait",
    "desc_en": "This player is exceptionally accurate when throwing teammates or bombs.",
    "desc_es": "Este jugador es excepcionalmente preciso al lanzar compañeros o bombas."
  },
{
    "keyEN": "Ghostly Flames",
    "name_en": "Ghostly Flames",
    "name_es": "Llamas Espectrales",
    "category": "Trait",
    "desc_en": "A mystical aura of fire that burns opponents upon contact.",
    "desc_es": "Un aura mística de fuego que quema a los oponentes al contacto."
  },
{
    "keyEN": "Brutal Block",
    "name_en": "Brutal Block",
    "name_es": "Bloqueo Brutal",
    "category": "Trait",
    "desc_en": "A powerful block that ignores certain defensive abilities.",
    "desc_es": "Un bloqueo poderoso que ignora ciertas habilidades defensivas."
  },
{
    "keyEN": "Unsteady",
    "name_en": "Unsteady",
    "name_es": "Inestable",
    "category": "Trait",
    "desc_en": "This player is poorly balanced. If pushed, they always fall over.",
    "desc_es": "Este jugador tiene poco equilibrio. Si es empujado, siempre se cae."
  },
{
    "keyEN": "Hatred (Undead)",
    "name_en": "Hatred (Undead)",
    "name_es": "Odio (No Muertos)",
    "category": "Trait",
    "desc_en": "This player gains bonuses when blocking Undead opponents.",
    "desc_es": "Este jugador gana bonificaciones al bloquear a oponentes No Muertos."
  },
{
    "keyEN": "Hatred (Dwarf)",
    "name_en": "Hatred (Dwarf)",
    "name_es": "Odio (Enanos)",
    "category": "Trait",
    "desc_en": "This player gains bonuses when blocking Dwarf opponents.",
    "desc_es": "Este jugador gana bonificaciones al bloquear a oponentes Enanos."
  },
{
    "keyEN": "Hatred (Big Guy)",
    "name_en": "Hatred (Big Guy)",
    "name_es": "Odio (Tipos Grandes)",
    "category": "Trait",
    "desc_en": "This player gains bonuses when blocking Big Guys.",
    "desc_es": "Este jugador gana bonificaciones al bloquear a Tipos Grandes."
  },
{
    "keyEN": "Lethal Flight",
    "name_en": "Lethal Flight",
    "name_es": "Vuelo Letal",
    "category": "Trait",
    "desc_en": "If this player lands in an occupied square, they make an Armour roll against the occupant.",
    "desc_es": "Si este jugador aterriza en una casilla ocupada, realiza una tirada de Armadura contra el ocupante."
  },
  {
    "keyEN": "Taunt",
    "name_en": "Taunt",
    "name_es": "Provocar",
    "category": "Trait",
    "desc_en": "Once per game, force an opponent to move towards and block this player.",
    "desc_es": "Una vez por partido, obliga a un oponente a moverse hacia este jugador y bloquearlo."
  },
  {
    "keyEN": "Steady Footing",
    "name_en": "Steady Footing",
    "name_es": "Pie Firme",
    "category": "Trait",
    "desc_en": "Once per game, pass a Dodge, Leap or Rush test on a 2+ regardless of modifiers.",
    "desc_es": "Una vez por partido, supera una prueba de Esquiva, Salto o A Todo Gas con un 2+ sin importar los modificadores."
  },
  {
    "keyEN": "Put the Boot In",
    "name_en": "Put the Boot In",
    "name_es": "Meter la Bota",
    "category": "Trait",
    "desc_en": "Provides bonuses when performing a Foul action.",
    "desc_es": "Proporciona bonificaciones al realizar una acción de Falta."
  }
];
