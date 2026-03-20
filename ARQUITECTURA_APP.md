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
- Dashboard de arena con competicion activa.
- Accesos rapidos a gremio, oraculo y arena.

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

### Competiciones
La vista de ligas tambien se separo:
- `pages/Arena/LeaguesPage.tsx`
- `pages/Arena/CompetitionCard.tsx`
- `pages/Arena/LeaguesTabbedList.tsx`
- `pages/Arena/competitionUtils.ts`

## Flujo del admin
1. `AdminPanel` carga maestros y estado de arena.
2. `AdminEditorModal` recibe props y decide que formulario renderizar.
3. Los formularios especializados actualizan solo su dominio.
4. El selector de imagenes consulta GitHub y guarda URLs directas.
5. El modal escribe `createdBy` cuando toca competiciones o contenido con ownership.

## Flujo de imagenes
- Equipos -> carpeta `Escudos`.
- Star players -> carpeta `Star Players`.
- El panel consulta la API de GitHub por carpeta, no por la raiz del repo.
- Las URLs se guardan como enlaces directos a `raw.githubusercontent.com`.

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
- Los archivos grandes que mas conviene seguir partiendo son `AdminPanel.tsx` y `AdminEditorModal.tsx`.
