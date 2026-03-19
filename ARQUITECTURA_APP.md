# 🩸 Blood Bowl Assistant – Arquitectura de la Aplicación

Documento de diseño de navegación, arquitectura y estructura del proyecto para **Blood Bowl Assistant**.

## stack tecnológico (V2026)
- **Framework**: React 19 + Vite (Rápido, tipado estricto).
- **Lenguaje**: TypeScript (Contratos robustos).
- **Backend / DB**: Firebase Firestore (Clones de equipo en la nube).
- **Almacenamiento**: Firebase Storage (Escudos y posters).
- **Estilo**: Tailwind CSS (Glassmorphism, Dark Fantasy Premium).

---

## 🗺️ Mapa de Navegación Maestro

### HOME (Portal Principal)
- **Estado de la Arena**: Dashboard dinámico con `activeCompId`.
  - Selector de liga propio/participante.
  - Pestañas: Clasificación | Anotadores | Carniceros.
  - Siguiente Encuentro: Enlace directo al Match Center con pre-carga de equipos.
- **Acceso Rápido**: Gremio (Equipos), Oráculo (Reglas), Arena (Ligas).

### ORÁCULO (Enciclopedia)
- **Enciclopedia de Equipos**: Ficha detallada + Radar Chart.
- **Manual de Habilidades**: Listado bilingüe categorizado (ahora incluye Triquiñuelas S3).
- **Jugadores Estrella**: Compendio de mercenarios.
- **Calculadora**: Probabilidades de tiradas 1D6, 2D6 y Bloqueos.

### GREMIO (Gestión de Equipos)
- **Mis Equipos**: Lista filtrable por valor y raza.
- **Ficha de Equipo**:
  - Roster / Jugadores / Snapshots (Cápsulas de tiempo).
  - Pizarra táctica / Historial de crónicas.
- **Creación de Equipo**: Draft interactivo S3.

### ARENA (Competición)
- **Ligas (Pestañas)**:
  - **Mis Ligas**: Liguillas Round-Robin jugadas por el usuario.
  - **Mis Torneos**: Brackets y eliminatorias jugadas por el usuario.
  - **Descubrir**: Buscador de competiciones públicas.
  - **Organización**: Herramientas de administrador para ligas creadas.
- **Partido en Vivo**:
  - **Consola de Match**: Orquestador de turnos y eventos técnicos.
  - **El Cronista de Nuffle**: Narración automática épica en vivo.
  - **Post-Game Wizard**: Cierre de acta, SPP, MVP y Crónica final.

---

## 📁 Arquitectura Documental del Código

```text
src/
├── components/
│   ├── arena/           # MatchCenterPage, MatchOrchestrator, EventLog.
│   ├── common/          # Componentes básicos (MiniField, PlayerStatusCard).
│   ├── layout/          # Navbar, Sidebars, Footer.
│   └── modals/          # RulesModals (Injury, Foul), SystemModals (Join, Delete).
├── pages/
│   ├── Home/            # Estado de la Arena dashboard.
│   ├── Oracle/          # SkillsPage, StarPlayersPage, Inducements.
│   ├── Guild/           # ManageTeams, TeamDetailDashboard.
│   └── Arena/           # LeaguesPage (Tabs architecture).
├── contexts/
│   ├── LanguageContext/ # Bilingüismo (ES/EN).
│   └── MatchContext/    # Estado inyectado para el partido en vivo.
├── data/                # skills_es.ts, teams.ts, match_rules_s3.
└── types.ts             # El contrato maestro de interfaces (Competition, ManagedTeam, MatchReport).
```

---

## 🎮 El Motor de Nuffle (Lógica de Partido)
El partido funciona como una **línea temporal de eventos inyectada**.
1. **MatchProvider**: Crea el almacén de datos (teams, turns, events).
2. **MatchEngine**: Procesa la entrada (click en "Touchdown") y genera:
   - Actualización de marcador.
   - SPP para el autor.
   - Log técnico.
   - **Narrativa Épica**: El motor de `newsGenerator` traduce el dato a un relato periódico.

Esto permite que al final del encuentro, la aplicación genere un **MatchReport** persistente en Firestore que alimenta **La Gaceta** de la liga.

---

## 🎯 Objetivo: La Biblia del Blood Bowl
Este documento debe servir como blueprint para una futura migración a **Android (Kotlin/Compose)**. Los estados de Firestore y la lógica de los Engines son la única fuente de verdad (Single Source of Truth).