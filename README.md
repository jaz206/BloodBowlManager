# Blood Bowl Manager

Blood Bowl Manager es una aplicacion React + Vite para gestionar equipos, competiciones, reglas y contenido maestro de Blood Bowl.

## Documentacion viva
- [CEREBRO_APP.md](CEREBRO_APP.md): mapa tecnico principal de la aplicacion, enlaces entre modulos, estilo CSS/UIX y flujo de datos.
- [BIBLIOTECA_BLOOD_BOWL.md](BIBLIOTECA_BLOOD_BOWL.md): base de conocimiento para manuales, equipos, reglas y decisiones de dominio.
- [FUNCIONALIDAD_SECCIONES.md](FUNCIONALIDAD_SECCIONES.md): objetivo y funcionamiento de cada seccion.
- [PHOTO_FOLDER_MAP.md](PHOTO_FOLDER_MAP.md): mapa canónico de carpetas de fotos, alias legacy y rutas de plantilla.

## Que hace ahora
- Gestion de equipos, estrellas, habilidades, incentivos, heraldo y competiciones desde el panel de admin.
- Explorador de competiciones con ligas, torneos, organizacion y competiciones privadas de prueba.
- Arena de partido orientada a mesa: prepartido, accion del jugador, tiradas manuales o automaticas, postpartido y cronica.
- Biblioteca de reglas, jugadores estrella y datos del juego.
- Integracion con Firestore para persistencia.
- Explorador de imagenes desde `jaz206/Bloodbowl-image` para escudos y jugadores.

## Estructura actual del proyecto
- `components/shared/AdminPanel.tsx`: contenedor principal de administracion, filtros, import/export CSV y sincronizacion.
- `components/shared/AdminEditorModal.tsx`: modal de edicion de items maestros.
- `components/shared/AdminGeneralForm.tsx`, `AdminTeamForm.tsx`, `AdminStarForm.tsx`, `AdminSkillsForm.tsx`, `AdminInducementForm.tsx`, `AdminHeraldoForm.tsx`: formularios separados por dominio.
- `components/shared/AdminGitHubImagePicker.tsx`: selector plegable para buscar imagenes en GitHub.
- `components/shared/AdminCompetitionLab.tsx`: laboratorio para crear competiciones privadas de prueba.
- `pages/Arena/LeaguesPage.tsx`: vista de competiciones, ya separada en piezas reutilizables.
- `pages/Arena/CompetitionCard.tsx`, `LeaguesTabbedList.tsx`, `competitionUtils.ts`: componentes y utilidades extraidos de la vista principal.
- `pages/Arena/Match/views/MatchInProgress.tsx`: mesa de partido con panel de jugador y cronista.
- `pages/Arena/Match/components/S3ActionOrchestrator.tsx`: modal unico de tiradas manuales / automaticas.
- `components/shared/adminPanelUtils.ts`: utilidades comunes del admin.

## Datos y reglas
- Firestore usa una base `deny-by-default`.
- `master_data` y `settings_master` solo admiten escritura de admins.
- `users/{uid}` queda aislado por propietario.
- `competitions` y `leagues` son compatibles con `createdBy` y `ownerId`.
- `live_matches` y `tactical_plays` exigen que el creador sea el propietario del documento.

## Imagenes
- Los escudos viven en `Bloodbowl-image/Escudos`.
- Las imagenes de star players viven en `Bloodbowl-image/Star Players`.
- Las fotos de plantillas viven en `Bloodbowl-image/Foto plantilla/<raza>`.
- El panel de admin carga esas carpetas de forma dinamica y usa URLs directas de `raw.githubusercontent.com`.
- El sistema de jugador reparte mejor imagenes con nombres compuestos como `Blitzer orco 05.png`.

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
- la vista de ligas se partio en componentes mas pequenos,
- la arena ahora usa un modal comun de tiradas y un panel lateral de accion.
