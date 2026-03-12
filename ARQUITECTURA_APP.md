# 🩸 Blood Bowl Assistant – Arquitectura de la Aplicación

Documento de diseño de navegación, arquitectura y estructura del proyecto para **Blood Bowl Assistant**.

El objetivo es crear una herramienta completa para entrenadores de Blood Bowl que combine:

- Enciclopedia del juego
- Gestión de equipos
- Gestión de ligas y torneos
- Control de partidos en mesa
- Narración automática de partidos

Stack tecnológico:

- React + Vite
- TypeScript
- Firebase Firestore
- Firebase Storage
- Tailwind CSS

---

# 🧠 Modelo Mental de la Aplicación

La aplicación se divide en **tres modos principales** que representan tres necesidades del jugador:

1. Consultar información del juego  
2. Gestionar equipos  
3. Gestionar ligas y jugar partidos  

Por lo tanto, la navegación principal se organiza en tres áreas:


ORÁCULO
GREMIO
ARENA


---

# 🗺️ Arquitectura de Navegación

Mapa completo de páginas de la aplicación:


HOME
│
├── ORÁCULO
│ ├── Enciclopedia de Equipos
│ │ └── Ficha de Equipo
│ │
│ ├── Habilidades
│ │
│ ├── Jugadores Estrella
│ │ └── Ficha Jugador Estrella
│ │
│ ├── Calculadora de Probabilidades
│ │
│ └── Incentivos
│
├── GREMIO
│ ├── Mis Equipos
│ │ └── Ficha Equipo
│ │ ├── Roster
│ │ ├── Jugadores
│ │ ├── Historial
│ │ └── Pizarra táctica
│ │
│ └── Crear Equipo
│
└── ARENA
├── Ligas
│ └── Ficha Liga
│ ├── Clasificación
│ ├── Calendario
│ └── Partidos
│
├── Partidos
│ ├── Consola de Partido
│ └── Crónica
│
└── Historial de Partidos


Esta estructura permite que el usuario entienda rápidamente la aplicación.

---

# 🏠 Diseño de la Home

La página principal debe funcionar como **selector de modo**.

Ejemplo conceptual:

    BLOOD BOWL ASSISTANT

📚 ORÁCULO DE NUFFLE
Reglas, habilidades y equipos

[ CONSULTAR ]

⚔️ GREMIO DE ENTRENADORES
Gestiona tus equipos y jugadores

[ MIS EQUIPOS ]

🏟 ARENA DE LA GLORIA
Ligas, torneos y partidos

[ JUGAR ]


Esto permite que cualquier usuario entienda la aplicación en pocos segundos.

---

# 📚 Navegación dentro del ORÁCULO

Menú interno:


ORÁCULO

Equipos
Habilidades
Jugadores estrella
Probabilidades
Incentivos


Pantalla principal:

- Buscador global
- Acceso rápido a equipos y habilidades

---

# ⚔️ Navegación dentro del GREMIO

Menú interno:


GREMIO

Mis equipos
Crear equipo
Pizarra táctica


Pantalla principal:

- Lista de equipos del usuario
- Botón para crear equipo

---

# 🏟 Navegación dentro del ARENA

Menú interno:


ARENA

Iniciar partido
Ligas
Historial de partidos
Crónicas


---

# 📁 Arquitectura de Carpetas (React)

Estructura recomendada del proyecto:


src

components
│
├── common
│ Button
│ Modal
│ Card
│
├── oracle
│ TeamCard
│ SkillCard
│ StarPlayerCard
│
├── guild
│ TeamList
│ PlayerCard
│ FormationBoard
│
├── arena
│ MatchConsole
│ EventLog
│ Scoreboard
│

pages
│
├── Home
│
├── Oracle
│ Teams
│ Skills
│ StarPlayers
│ Probabilities
│ Inducements
│
├── Guild
│ Teams
│ TeamDetail
│ CreateTeam
│
└── Arena
Leagues
Match
MatchHistory

hooks

contexts

firebase

types


Esta estructura permite escalar el proyecto sin perder organización.

---

# 🗄️ Modelo de Datos Principal (Firestore)

Colecciones principales:


teams
players
matches
leagues
starPlayers
skills
events


Ejemplo de estructura:

### teams


teamId
name
race
value
players[]


### matches


matchId
teamA
teamB
score
events[]


### leagues


leagueId
teams[]
standings[]


### events


eventId
matchId
turn
type
description


---

# 🎮 Arquitectura del Partido en Vivo

El partido funciona como **una línea temporal de eventos**.

Ejemplo:


Turno 1

Bloqueo

Derribo

Turno 2

Esquiva

Pase

Turno 3

Baja causada


Cada evento alimenta:

- el log del partido
- la narración automática
- las estadísticas del equipo

---

### El Cronista de Nuffle (Narración IA y Periodismo)

Proceso de generación de narrativa:

1. Evento registrado en vivo.
2. Generación de **Titular y Artículo Deportivo** (`newsGenerator.ts`).
3. Almacenamiento en `MatchReport` (Firestore).
4. Visualización en formato Periódico Antiguo.

> **Ejemplo**: "Turno 3. El Blitzer Orco rompe la línea humana. La prensa de Altdorf califica el encuentro como 'Una carnicería necesaria'."

---

# ⭐ Feature Avanzada Propuesta

## Replay Visual del Partido

Gracias al sistema de eventos, el partido podría reproducirse.

Ejemplo:


Turno 1
jugador mueve

Turno 2
pase

Turno 3
touchdown


La aplicación podría reconstruir visualmente el partido en el tablero.

Esto convertiría la aplicación en una herramienta única para la comunidad.

---

# 🎯 Objetivo Final

Crear la herramienta definitiva para Blood Bowl que combine:

- Enciclopedia del juego
- Gestión avanzada de equipos
- Organización de ligas
- Control de partidos en mesa
- Crónicas automáticas
- Replay de partidos

Todo sincronizado en la nube y accesible desde:

- ordenador
- tablet
- móvil