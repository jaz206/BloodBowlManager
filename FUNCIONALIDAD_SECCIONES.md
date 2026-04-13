# Funcionalidad de secciones y páginas

Este documento explica el objetivo de cada sección principal de la aplicación y cómo funciona por dentro, para que sirva como guía rápida de producto, navegación y mantenimiento.

## 1. Flujo general de la aplicación

La app sigue este recorrido base:

1. El usuario entra en `Login`.
2. Si la autenticación es correcta, `App.tsx` carga `MainApp`.
3. `MainApp` decide qué sección mostrar con `activeView`.
4. Cada sección puede resetear su estado al volver a pulsar la misma pestaña superior.
5. Los datos se leen de Firestore, de `localStorage` o de catálogos locales según la sección.

### Navegación principal

La barra superior abre estas vistas:

- `Home`
- `Oráculo`
- `Gremio`
- `Ligas`
- `Arena`
- `Pizarra`
- `Admin` solo para usuarios con permisos

Cuando se vuelve a pulsar una pestaña ya activa, la vista se reinicia para que el usuario vuelva al punto de entrada de esa sección.

## 2. Mapa rápido por sección

| Sección | Páginas / componentes principales | Objetivo | Cómo funciona |
| --- | --- | --- | --- |
| Home | `pages/Home/index.tsx` | Dashboard de entrada | Resume la actividad reciente, muestra accesos rápidos y abre otras secciones |
| Oráculo | `pages/Oracle/*` | Enciclopedia del juego | Consulta equipos, habilidades, estrellas, reglas, incentivos y calculadora |
| Gremio | `pages/Guild/*`, `components/guild/*` | Gestión de franquicias | Crea, edita y administra los equipos del usuario |
| Ligas | `pages/Arena/LeaguesPage.tsx` y componentes auxiliares | Gestión de competiciones | Crea ligas/torneos, clasifica equipos y prepara partidos |
| Arena | `pages/Arena/MatchPage.tsx` y submódulos de `pages/Arena/Match/*` | Motor de partido | Ejecuta la partida por fases y guarda el resultado |
| Pizarra | `pages/Guild/TacticalBoardPage.tsx` | Pizarra táctica | Guarda jugadas y esquemas de estrategia |
| Admin | `components/shared/AdminPanel.tsx` y formularios | Administración maestra | Edita datos base, imágenes, settings y utilidades de sincronización |

## 3. Home

### Objetivo

La página de inicio es el tablero general. Debe responder a la pregunta: "¿qué está pasando en mi cuenta y a qué sección quiero ir ahora?".

### Qué muestra

- Imagen hero principal
- Resumen de actividad
- Accesos rápidos a Oráculo, Gremio, Ligas y Arena
- Contenido reciente y atajos de navegación

### Cómo funciona

- Recibe `managedTeams`, `competitions`, `recentEvents`, `matchReports` y la imagen hero desde `MainApp`.
- Usa esos datos para construir el dashboard.
- Llama a `onNavigate(...)` para abrir otras secciones.

### Resultado esperado

- El usuario entra y tiene contexto inmediato.
- Desde aquí puede saltar al equipo, a una competición o al manual del juego sin buscar menús extra.

## 4. Oráculo

### Objetivo

Oráculo es la biblioteca de consulta del juego. Sirve para leer reglas, revisar plantillas, comparar habilidades y entender el sistema sin editar nada.

### Páginas y subpáginas

- `pages/Oracle/index.tsx`
- `pages/Oracle/TeamsPage.tsx`
- `pages/Oracle/SkillsPage.tsx`
- `pages/Oracle/StarPlayersPage.tsx`
- `pages/Oracle/RulesPage.tsx`
- `pages/Oracle/InducementsPage.tsx`
- `pages/Oracle/ProbabilitiesPage.tsx`
- `pages/Oracle/TeamDetailPage.tsx`

### Cómo funciona

- Lee datos maestros desde `useMasterData`.
- Si Firestore no tiene el dato, cae al catálogo local.
- El hub del Oráculo permite buscar por equipo, habilidad, estrella, incentivo o regla.
- Algunas búsquedas abren directamente una subvista concreta.
- Desde equipos y habilidades se puede saltar al Gremio para crear o revisar una franquicia relacionada.

### Qué resuelve

- Consulta rápida de reglas
- Comparación de razas
- Revisión de habilidades
- Consulta de jugadores estrella
- Tabla de incentivos
- Calculadora de probabilidades

## 5. Gremio

### Objetivo

Gremio es la parte de gestión de franquicias. Aquí el usuario funda equipos, los edita, mueve jugadores entre reserva y titular, modifica dorsales y revisa el dossier completo.

### Páginas y componentes

- `pages/Guild/index.tsx`
- `pages/Guild/CreateTeamPage.tsx`
- `pages/Guild/TeamDetailPage.tsx`
- `pages/Guild/TacticalBoardPage.tsx`
- `components/guild/TeamDashboard.tsx`
- `components/guild/PlayerModal.tsx`

### Cómo funciona

- La lista principal muestra las franquicias del usuario en `managedTeams`.
- Al abrir un equipo aparece el dossier.
- Desde el dossier se gestionan:
  - plantilla activa
  - reclutamiento
  - staff
  - historia
  - escudo
- Los cambios de nombre, dorsal, rol y habilidades del jugador se guardan y se reflejan en la lista.
- El botón de crear franquicia abre el flujo de fundación con selección de raza y previsualización de escudo.

### Flujo interno

- `pages/Guild/index.tsx` controla la lista general.
- `CreateTeamPage.tsx` crea una nueva franquicia.
- `TeamDashboard.tsx` muestra el dossier, el resumen y la plantilla.
- `PlayerModal.tsx` edita jugadores de forma individual.

### Objetivo funcional

Gremio debe permitir:

- fundar una franquicia
- renombrarla
- cambiar el escudo
- editar dorsales
- mover jugadores entre reserva y titular
- modificar habilidades extra
- revisar estadísticas del equipo

## 6. Ligas

### Objetivo

Ligas es la sección de organización competitiva. Se usa para crear, listar y seguir competiciones públicas o privadas.

### Páginas y componentes

- `pages/Arena/LeaguesPage.tsx`
- `pages/Arena/CompetitionCard.tsx`
- `pages/Arena/LeaguesTabbedList.tsx`
- `pages/Arena/competitionUtils.ts`

### Cómo funciona

- Lee competiciones desde Firestore y también desde una copia local si hace falta.
- Normaliza el registro de equipos, propietario y participantes.
- Permite crear competiciones nuevas con `createdBy` / `ownerId`.
- Permite unirse mediante código.
- Delega la navegación al partido cuando una competición ya tiene emparejamientos.

### Qué muestra

- Ligas activas
- Torneos
- Estadísticas de competiciones
- Equipos inscritos
- Estado de partidos

### Objetivo práctico

Ligas actúa como la mesa de control previa al partido: quién juega, en qué formato, con qué estado y cómo se accede a la arena.

## 7. Arena

### Objetivo

Arena es el motor de partido. Aquí se juega el encuentro paso a paso, con tiradas, decisiones, estados y cronología.

### Páginas y componentes

- `pages/Arena/MatchPage.tsx`
- `pages/Arena/Match/MatchOrchestrator.tsx`
- `pages/Arena/Match/views/PreGameStage.tsx`
- `pages/Arena/Match/views/SelectionStage.tsx`
- `pages/Arena/Match/views/MatchInProgress.tsx`
- `pages/Arena/Match/views/KoRecoveryStage.tsx`
- `pages/Arena/Match/views/ReportsStage.tsx`
- `pages/Arena/Match/views/PostGameStage.tsx`
- `pages/Arena/Match/components/S3ActionOrchestrator.tsx`

### Cómo funciona

- `MatchPage` delega en `MatchOrchestrator`.
- El partido avanza por etapas:
  - prepartido
  - selección
  - partido en curso
  - recuperación KO
  - informes
  - postpartido
- Las tiradas y acciones usan modales y orquestadores comunes.
- El estado del partido se guarda y se puede resumir al final en reportes.

### Qué cubre

- flujo de turno
- acciones del jugador
- tiradas automáticas o manuales
- heridas, turnover y resolución de secuencias
- postpartido y cronología

### Objetivo práctico

Arena debe sentirse como una mesa digital fiel al juego, no como un formulario.

## 8. Pizarra

### Objetivo

Pizarra es el espacio para guardar jugadas, ideas tácticas y esquemas de partido reutilizables.

### Página principal

- `pages/Guild/TacticalBoardPage.tsx`

### Cómo funciona

- Permite crear, editar y borrar jugadas.
- Sirve para documentar setups, movimientos tipo y patrones recurrentes.
- Está pensada para apoyarse en el trabajo de la plantilla y del partido, no para sustituirlo.

### Uso esperado

- Guardar una apertura
- Preparar una secuencia táctica
- Reutilizar una jugada en otra partida

## 9. Admin

### Objetivo

Admin es la consola de mantenimiento de datos maestros y ajustes globales.

### Páginas y componentes

- `components/shared/AdminPanel.tsx`
- `components/shared/AdminEditorModal.tsx`
- `components/shared/AdminGeneralForm.tsx`
- `components/shared/AdminTeamForm.tsx`
- `components/shared/AdminStarForm.tsx`
- `components/shared/AdminSkillsForm.tsx`
- `components/shared/AdminInducementForm.tsx`
- `components/shared/AdminHeraldoForm.tsx`

### Cómo funciona

- Edita `master_data` y `settings_master`.
- Permite importar y exportar datos.
- Ofrece sincronización inteligente entre el catálogo local y Firestore.
- Usa imágenes de `Bloodbowl-image` para escudos, plantillas y estrellas.
- Incluye guías de encuadre para que los escudos se vean bien sin tener que editarlos a mano.

### Qué gestiona

- Equipos
- Habilidades
- Jugadores estrella
- Incentivos
- Heraldo
- Imagen hero
- Configuración de arena
- Competiciones de prueba

### Objetivo práctico

Admin es la herramienta que mantiene la app viva y coherente. La UI se edita aquí, pero la fuente de verdad final está en Firestore.

## 10. Datos y persistencia

### Colecciones principales

- `master_data`: catálogos maestros
- `settings_master`: configuración visual y general
- `managedTeams`: franquicias del usuario
- `competitions` y `leagues`: competiciones
- `users/{uid}/matchReports`: informes y resultados

### Almacenamiento local

- `bb-local-competitions-<uid>` para copias locales de competiciones
- notificaciones de la app

### Imágenes

- Escudos: `Bloodbowl-image/Escudos`
- Jugadores estrella: `Bloodbowl-image/Star Players`
- Fotos de plantilla: `Bloodbowl-image/Foto plantilla`

## 11. Resumen funcional por sección

- **Home**: punto de entrada y panel de control.
- **Oráculo**: consulta y referencia del juego.
- **Gremio**: gestión de franquicias y plantilla.
- **Ligas**: administración competitiva.
- **Arena**: ejecución del partido.
- **Pizarra**: jugadas y notas tácticas.
- **Admin**: mantenimiento de datos maestros y configuración.

## 12. Cómo mantener este documento

- Si se añade una nueva sección del menú superior, hay que incorporar:
  - objetivo
  - páginas afectadas
  - datos que consume
  - qué guarda
  - cómo navega a otras secciones
- Si cambia el flujo de guardado o la fuente de verdad, este documento debe actualizarse al mismo tiempo que el código.

