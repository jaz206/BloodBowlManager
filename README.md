# Blood Bowl Manager

Blood Bowl Manager es una aplicacion React + Vite para gestionar equipos, competiciones, reglas y contenido maestro de Blood Bowl.

## Lo que hace la app
- Gestion de equipos, estrellas, habilidades, incentivos y heraldo desde el panel de admin.
- Explorador de competiciones con ligas y torneos.
- Biblioteca de reglas, jugadores estrella y datos del juego.
- Integracion con Firestore para persistencia.
- Explorador de imagenes desde el repositorio `jaz206/Bloodbowl-image` para escudos y star players.

## Estructura actual del proyecto
- `components/shared/AdminPanel.tsx`: panel principal de administracion, filtros, import/export CSV y sincronizacion.
- `components/shared/AdminEditorModal.tsx`: modal de edicion de items maestros.
- `components/shared/AdminGeneralForm.tsx`, `AdminTeamForm.tsx`, `AdminStarForm.tsx`, `AdminSkillsForm.tsx`, `AdminInducementForm.tsx`, `AdminHeraldoForm.tsx`: formularios separados por dominio.
- `components/shared/AdminGitHubImagePicker.tsx`: selector plegable para buscar imagenes en GitHub.
- `pages/Arena/LeaguesPage.tsx`: vista de competiciones, ya separada en piezas reutilizables.
- `pages/Arena/CompetitionCard.tsx`, `LeaguesTabbedList.tsx`, `competitionUtils.ts`: componentes y utilidades extraidos de la vista principal.
- `components/shared/adminPanelUtils.ts`: utilidades comunes del admin.

## Datos y reglas
- Firestore usa una base `deny-by-default`.
- `master_data` y `settings_master` solo admiten escritura de admins.
- `users/{uid}` queda aislado por propietario.
- `competitions` y `leagues` son compatibles con el modelo nuevo (`createdBy`) y el legado (`ownerId`).
- `live_matches` y `tactical_plays` exigen que el creador sea el propietario del documento.

## Imagenes
- Los escudos viven en `Bloodbowl-image/Escudos`.
- Las imagenes de star players viven en `Bloodbowl-image/Star Players`.
- El panel de admin carga esas carpetas de forma dinamica y usa las URLs directas de `raw.githubusercontent.com`.

## Desarrollo local
1. Instala dependencias con `npm install`.
2. Configura Firebase en `.env.local`.
3. Arranca con `npm run dev`.
4. Compila con `npm run build`.

## Variables de entorno
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `GEMINI_API_KEY` para las funciones de generacion de nombre y escudo.

## Nota sobre el refactor
El admin se dividio para que editar sea mas comodo y seguro:
- la logica pesada quedo en el modal y en formularios especializados,
- el selector de imagenes quedo aislado,
- los bloques de feedback y utilidades estan separados,
- la vista de ligas se partio en componentes mas pequenos.
