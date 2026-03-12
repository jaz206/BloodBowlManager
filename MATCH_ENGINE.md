# 🩸 Blood Bowl Assistant – Match Engine (Modo Mesa)

Este documento define el funcionamiento del **Modo Mesa**, la interfaz utilizada para registrar lo que ocurre durante un partido de Blood Bowl.

El objetivo del Match Engine es permitir:

- Registrar el desarrollo del partido en tiempo real
- Generar estadísticas automáticamente
- Crear una crónica del encuentro
- Mantener el historial del partido
- Permitir futuras funciones como replay del partido

---

# 🎮 Concepto del Match Engine

El Match Engine no simula el juego.

El partido ocurre **en la mesa física**, y la aplicación funciona como:

- registro digital del partido
- asistente de gestión
- generador de estadísticas
- cronista narrativo

Cada acción relevante del partido se registra como **evento**.

---

# 🧭 Flujo del Partido

Un partido sigue esta estructura básica:


Inicio del partido
↓
Turnos alternos de los equipos
↓
Registro de eventos
↓
Touchdowns
↓
Final del partido


---

# 🏟 Pantalla de Partido

La consola del partido debe mostrar siempre:

## Cabecera del partido

Información visible permanentemente:

- equipo A
- equipo B
- marcador
- turno actual
- equipo activo
- rerolls restantes
- contador de tiempo (opcional)

Ejemplo:


ORCOS 1 - 0 HUMANOS

Turno 5
Equipo activo: Orcos

Rerolls
Orcos: 2
Humanos: 3


---

# 🎛 Panel de Control

Debajo del marcador debe haber **botones grandes y rápidos** para registrar acciones.

Eventos más comunes:


Bloqueo
Movimiento
Esquiva
Pase
Recoger balón
Falta
Touchdown


Cada botón abre un pequeño menú para registrar el resultado.

---

# 🤜 Ejemplo: Bloqueo

Usuario pulsa:


Bloqueo


La aplicación pregunta:

- jugador atacante
- jugador defensor
- resultado del dado

Opciones:


Empujón
Derribo
Ambos al suelo
Atacante al suelo


Si el jugador cae, se continúa con:


Tirada de armadura


---

# 💥 Resolución de daño

Si la armadura se rompe:

Opciones de resultado:


Aturdido
KO
Lesión grave


Esto genera eventos:


armor_break
injury_ko


---

# 🏈 Acciones con balón

Acciones registrables:


Recoger balón
Pase
Entrega
Intercepción
Balón suelto


Ejemplo:

Usuario pulsa:


Pase


Opciones:


Pase completado
Pase fallido
Intercepción


---

# 🎯 Touchdown

Cuando se marca touchdown:

Usuario pulsa:


Touchdown


La app registra:

- jugador que anota
- turno
- equipo

Luego actualiza:

- marcador
- estadísticas del jugador

---

# 🔄 Cambio de Turno

El cambio de turno se registra manualmente.

Botón:


Finalizar turno


Esto genera evento:


turn_end


Y cambia el equipo activo.

---

# 🎲 Uso de recursos

Durante el partido pueden usarse recursos.

Botones rápidos:


Usar reroll
Usar apotecario
Usar soborno


Eventos generados:


reroll_used
apothecary_used
bribe_used


---

# ⭐ Jugadores Estrella

Si un equipo contrata un jugador estrella antes del partido:

Evento registrado:


star_player_hired


El jugador aparece en el roster del partido.

---

# 📜 Registro de Eventos

Todos los eventos aparecen en una **línea temporal del partido**.

Ejemplo:


Turno 1
Blitzer Orco bloquea a Línea Humano (Empujón)

Turno 2
Línea Humano recoge el balón

Turno 3
Blitzer Orco rompe armadura (KO)

Turno 4
Touchdown de Orcos


---

### Generación de Crónica (Sports News Edition)

Al terminar el partido:

1. Se recopilan todos los eventos registrados.
2. El motor de narrativa `newsGenerator.ts` crea un titular impactante.
3. Se redacta un artículo estilo prensa deportiva detallando el encuentro.
4. El reporte se guarda con metadatos de "periódico" para su consulta posterior.

Ejemplo:

> Los Orcos dominaron el primer tiempo con una brutal presión sobre la línea humana. En el turno 4, el blitzer Gorbag rompió la defensa rival y anotó el primer touchdown del encuentro.

---

# 📊 Estadísticas Automáticas

A partir de los eventos se generan estadísticas:

## Jugadores

- touchdowns
- bajas causadas
- intercepciones
- pases completados

## Equipos

- touchdowns
- bajas totales
- posesión del balón

---

# 🎥 Futuro: Replay del Partido

Gracias al registro de eventos, el partido puede reconstruirse.

Ejemplo:


Turno 1
Jugador mueve

Turno 2
Pase completado

Turno 3
Bloqueo

Turno 4
Touchdown


Esto permitiría reproducir el partido en un tablero visual.

---

# 🎯 Objetivo del Match Engine

Crear una consola simple, rápida y usable durante un partido real.

Debe permitir:

- registrar eventos en segundos
- no interrumpir el flujo del juego
- generar automáticamente estadísticas y crónicas