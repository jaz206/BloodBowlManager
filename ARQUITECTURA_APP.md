# Arquitectura de la Aplicacion

Documento de referencia del estado actual de Blood Bowl Manager.

## Stack
- React 19
- Vite
- TypeScript
- Firestore
- Tailwind CSS
- Framer Motion

## Mapa funcional

### Home
- Dashboard con acceso rapido a gremio, oraculo, arena y ligas.
- Bloque de gremio con escudos y acceso a equipos.
- Bloque de oraculo con modal de habilidades.

### Oraculo
- Equipos.
- Habilidades.
- Star players.
- Incentivos.
- Reglas y calculadoras.

### Gremio
- Gestion de equipos.
- Roster.
- Pizarra tactica.
- Historico y snapshots.

### Arena
- Mis ligas.
- Mis torneos.
- Descubrir.
- Organizacion.
- Partido en vivo y cronica.
- Laboratorio de competiciones privadas de prueba.

## Particion del codigo

### Admin panel
El panel de admin se dividio en piezas pequenas para reducir acoplamiento:
- `components/shared/AdminPanel.tsx`: contenedor principal y logica de datos.
- `components/shared/AdminEditorModal.tsx`: modal de edicion.
- `components/shared/AdminGeneralForm.tsx`: editor general.
- `components/shared/AdminTeamForm.tsx`: editor de equipos.
- `components/shared/AdminStarForm.tsx`: editor de estrellas.
- `components/shared/AdminSkillsForm.tsx`: editor de habilidades.
- `components/shared/AdminInducementForm.tsx`: editor de incentivos.
- `components/shared/AdminHeraldoForm.tsx`: editor de heraldo.
- `components/shared/AdminGitHubImagePicker.tsx`: explorador de imagenes.
- `components/shared/AdminFeedbackOverlays.tsx`: overlays de feedback.
- `components/shared/adminPanelUtils.ts`: CSV y normalizacion de URLs.
- `components/shared/AdminCompetitionLab.tsx`: creacion de competiciones de prueba.

### Competiciones
La vista de ligas tambien se separo:
- `pages/Arena/LeaguesPage.tsx`
- `pages/Arena/CompetitionCard.tsx`
- `pages/Arena/LeaguesTabbedList.tsx`
- `pages/Arena/competitionUtils.ts`
- `pages/Arena/CompetitionMatchResolutionModal.tsx`

### Arena / Match
La arena vive como una suite de partido completa:
- `pages/Arena/Match/views/MatchInProgress.tsx`
- `pages/Arena/Match/components/MatchTeamRoster.tsx`
- `pages/Arena/Match/components/S3ActionOrchestrator.tsx`
- `pages/Arena/Match/hooks/useMatchState.ts`
- `pages/Arena/Match/hooks/useMatchActions.ts`
- `pages/Arena/Match/engine/injuryEngine.ts`
- `pages/Arena/Match/engine/foulEngine.ts`

## Flujo del admin
1. `AdminPanel` carga maestros y estado de arena.
2. `AdminEditorModal` recibe props y decide que formulario renderizar.
3. Los formularios especializados actualizan solo su dominio.
4. El selector de imagenes consulta GitHub y guarda URLs directas.
5. El laboratorio de competiciones crea ligas y torneos privados de prueba.

## Flujo de imagenes
- Equipos -> carpeta `Escudos`.
- Star players -> carpeta `Star Players`.
- Plantillas -> carpeta `Foto plantilla/<raza>`.
- El panel consulta la API de GitHub por carpeta, no por la raiz del repo.
- Las URLs se guardan como enlaces directos a `raw.githubusercontent.com`.

## Arena / Match
- El turno se gestiona desde una sola mesa de partido.
- El panel de jugador contiene las acciones relevantes.
- Las tiradas usan un modal comun con modo manual o automatico.
- `Accion OK` apaga la ficha y no ensucia el log.
- `Caida / Fallo` pasa por lesion y termina en turnover.
- El postpartido consolida el acta, la cronica y los cambios del clon.

## Firestore
- `master_data`: lectura publica, escritura admin.
- `settings_master`: lectura publica, escritura admin.
- `users/{uid}`: solo propietario.
- `competitions` y `leagues`: compatibles con `createdBy` y `ownerId`.
- `live_matches` y `tactical_plays`: creador o admin.
- Deny-by-default al final.

## Notas de mantenimiento
- Cuando un bloque de UI se haga largo, debe salir a un subcomponente o a un hook.
- Si una vista mezcla logica de datos y markup, conviene separar primero las utilidades puras.
- Los archivos grandes que mas conviene seguir vigilando son `MatchInProgress.tsx`, `AdminPanel.tsx` y `AdminEditorModal.tsx`.
