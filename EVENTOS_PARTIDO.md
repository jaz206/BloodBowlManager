# 🩸 Blood Bowl Assistant – Sistema de Eventos del Partido

Este documento define el sistema de **eventos de partido** utilizado por la aplicación.

El sistema de eventos es el núcleo del **Modo Mesa** y permite:

- registrar lo que ocurre en el partido
- generar estadísticas
- construir la crónica narrativa
- almacenar el historial
- permitir futuras funciones como replay del partido

Cada acción relevante del partido se registra como un **evento**.

---

# 🎮 Concepto de Evento

Un evento representa una acción o resultado importante durante el partido.

Ejemplo:

Turno 3  
Blitzer Orco derriba a un Línea Humano.

Esto se registra como un evento.

---

# 📦 Estructura de un Evento

Todos los eventos siguen esta estructura básica:

```json
{
  "id": "event_id",
  "matchId": "match_id",
  "team": "team_id",
  "player": "player_id",
  "turn": 3,
  "type": "block_knockdown",
  "result": "success",
  "target": "player_id",
  "timestamp": 1710000000
}

Campos:

Campo	Descripción
id	identificador del evento
matchId	partido al que pertenece
team	equipo que realiza la acción
player	jugador que realiza la acción
turn	turno del partido
type	tipo de evento
result	resultado de la acción
target	jugador afectado
timestamp	momento en que ocurre
🧭 Categorías de Eventos

Los eventos se agrupan en categorías.

Eventos de Partido

inicio de partido

final de partido

inicio de turno

cambio de turno

final de turno

Tipos:

match_start
match_end
turn_start
turn_end
🏃 Eventos de Movimiento

Acciones relacionadas con el movimiento del jugador.

Tipos:

move
rush
rush_fail
dodge
dodge_fail
pickup_ball
pickup_fail

Ejemplo:

Jugador intenta recoger el balón.

Evento:

pickup_ball

Si falla:

pickup_fail
🤜 Eventos de Bloqueo

Acciones relacionadas con bloqueos.

Tipos:

block
push
knockdown
both_down
attacker_down

Ejemplo:

Blitzer orco realiza un bloqueo.

Evento inicial:

block

Resultado posible:

knockdown
push
attacker_down
both_down
💥 Eventos de Armadura y Lesiones

Cuando un jugador cae al suelo puede sufrir daño.

Tipos:

armor_break
armor_hold
injury_stunned
injury_ko
injury_casualty

Ejemplo:

Armadura rota → lesión grave.

🏈 Eventos de Balón

Acciones relacionadas con el balón.

Tipos:

pass_attempt
pass_complete
pass_failed
interception
handoff
ball_scatter
ball_drop
🎯 Eventos de Anotación

Eventos relacionados con anotar puntos.

Tipos:

touchdown
extra_point
☠️ Eventos de Faltas

Eventos relacionados con faltas.

Tipos:

foul_attempt
foul_success
foul_fail
player_sent_off
⭐ Eventos de Jugadores Estrella

Eventos especiales cuando participa un Star Player.

Tipos:

star_player_hired
star_player_action

Ejemplo:

Contratación de Morg 'n' Thorg.

Evento:

star_player_hired
🔄 Eventos de Recursos

Eventos relacionados con recursos del equipo.

Tipos:

reroll_used
apothecary_used
bribe_used
📊 Eventos de Estadísticas

Estos eventos alimentan estadísticas del equipo.

Tipos:

touchdown
casualty
interception
pass_complete
mvp_awarded
📜 Línea Temporal del Partido

El partido se almacena como una secuencia de eventos.

Ejemplo:

Turno 1

block
push

Turno 2

dodge
pickup_ball

Turno 3

block
knockdown
armor_break
injury_ko

Turno 4

touchdown

Esta línea temporal permite:

reconstruir el partido

generar narraciones

crear estadísticas

📖 Generación de Crónica

La crónica del partido se genera analizando los eventos.

Ejemplo:

Eventos registrados:

block
knockdown
injury_ko

Narración generada:

El Blitzer Orco atraviesa la línea humana y derriba brutalmente a su rival. El jugador queda inconsciente mientras la multitud ruge de emoción.

🎥 Futuro: Replay del Partido

El sistema de eventos permite reconstruir el partido visualmente.

Ejemplo:

Turno 1
Jugador mueve

Turno 2
Pase completado

Turno 3
Touchdown

La aplicación podría reproducir el partido paso a paso.

🎯 Objetivo del Sistema de Eventos

El sistema de eventos permite que la aplicación:

registre partidos

genere estadísticas

cree crónicas automáticas

reconstruya partidos

analice el rendimiento de equipos

Este sistema es el núcleo del modo Arena.


---