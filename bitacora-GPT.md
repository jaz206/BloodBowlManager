# BITACORA GPT - BLOOD BOWL MANAGER

Documento vivo para retomar el trabajo sin perder el hilo.  
Ultima actualizacion: 2026-03-21

## Proposito

Registrar el estado real del proyecto, las decisiones tomadas y el siguiente paso recomendado en cada bloque importante:
- Admin panel
- Arena / Match Engine
- Ligas y torneos
- Home / Oraculo / Gremio
- Reglas, datos y documentacion

## Estado general actual

El proyecto ya tiene:
- Admin panel modularizado y dividido en subformularios.
- Ligas y torneos con competiciones privadas de prueba.
- Clonacion de equipos para competiciones.
- Arena orientada a partido de mesa, no a videojuego completo.
- Flujo de acciones del partido en panel lateral.
- Tiradas manuales o automaticas en el motor de acciones.
- Postpartido y cronica conectados al cierre del encuentro.
- Escudos e imagenes alineados con el repo `Bloodbowl-image`.

## Lo que ya se hizo

### Admin panel
- Se separo `AdminPanel` en varios componentes.
- Se extrajeron formularios por dominio:
  - equipos
  - estrellas
  - skills
  - inducements
  - heraldo
  - general
  - competiciones
- Se corrigieron varios `ReferenceError` por props que no estaban llegando.
- Se reconnected el explorador de imagenes al repositorio correcto.
- Se anadio autocompletado de imagenes por nombre para reducir trabajo manual.

### Home / Gremio / Oraculo
- La Home recupera mejor los escudos del gremio.
- El Oraculo abre modal de habilidades desde la lista.
- Se corrigieron imports y errores de render que rompian la pagina.

### Ligas y torneos
- Se ajusto el flujo para crear competiciones de prueba desde el admin.
- Se anadio visibilidad de competiciones privadas de test.
- Se reforzo la integracion de `createdBy`, `ownerId` y `joinCode`.
- Se anadio cierre de partido con acta completa para actualizar:
  - clasificacion
  - bracket
  - clones
  - cronica

### Arena / Match
- La arena se esta reorientando como una suite circular:
  - prepartido
  - partido
  - postpartido
  - cronica
- El panel principal de partido ya muestra dos plantillas y un panel de accion.
- El jugador seleccionado se puede marcar como agotado / usado.
- `Caida / Fallo` ya no salta turno en bruto: pasa por el flujo de tirada.
- Las tiradas admiten:
  - entrada manual por casillas
  - resolucion automatica con boton
- El motor ya resuelve turnovers y daño automatico en fallos de `DODGE` y `RUSH`.

## Ultimas decisiones de diseno

### Flujo de acciones en partido
El tablero debe ser rapido y de mesa, no una doble capa de juego.

Reglas de interfaz acordadas:
- `ACCION OK`
  - termina la accion
  - no genera log
  - el jugador queda gris / deshabilitado
- `CAIDA / FALLO`
  - abre tirada de dados
  - permite manual o automatico
  - el motor aplica armadura + heridas
  - si falla esquiva o sprint, termina en turnover y cambia turno
- Todas las tiradas de la arena deben seguir el mismo patron:
  - tirada manual por casillas
  - o resolucion automatica con boton

### Visual de la arena
- No se quieren dos sistemas superpuestos.
- La mesa de partido debe ser unica y clara.
- El panel derecho es el centro de interaccion del jugador.
- Los jugadores activados deben verse apagados y no volver a ser clicables hasta renovar turno.

## Estado tecnico importante

### Ficheros clave de Arena
- `pages/Arena/Match/views/MatchInProgress.tsx`
- `pages/Arena/Match/hooks/useMatchActions.ts`
- `pages/Arena/Match/components/S3ActionOrchestrator.tsx`
- `pages/Arena/Match/components/MatchTeamRoster.tsx`
- `pages/Arena/Match/engine/injuryEngine.ts`
- `pages/Arena/Match/engine/foulEngine.ts`

### Ficheros clave de competiciones
- `pages/Arena/LeaguesPage.tsx`
- `pages/Arena/competitionUtils.ts`
- `pages/Arena/CompetitionMatchResolutionModal.tsx`
- `components/shared/MainApp.tsx`
- `components/shared/AdminCompetitionLab.tsx`

### Documentacion ya existente
- `BITACORA.md`
- `ARQUITECTURA_APP.md`
- `FUNCIONAMIENTO_ARENA_TECNICO.md`
- `GUIA_EVENTOS_Y_MOTOR.md`
- `FIRESTORE_RULES.md`
- `CODEX_REGLAS_S3.md`

## Ultimo estado verificado

- Build correcto con `npm run build`.
- Cambios recientes ya subidos a `main`.
- La bitacora nueva aun no se ha sincronizado como referencia oficial del proyecto.

## Pendientes inmediatos

1. Unificar visualmente todas las tiradas de la arena en un componente/modal comun.
2. Hacer que las tiradas de lesiones y faltas sigan el mismo patron manual/auto.
3. Afinar la lectura de estados de jugador:
   - activado
   - lesionado
   - KO
   - MNG
   - subida pendiente
4. Completar el analisis de equipo con historial de partidos jugados, resultados y eventos.
5. Seguir simplificando la UI de `AdminPanel` y `Arena` si aparece otro bloque demasiado largo.

## Regla de oro para continuar

Antes de cambiar algo grande:
- revisar este archivo
- revisar `BITACORA.md`
- comprobar si el cambio afecta a:
  - data del clon
  - cronica
  - clasificacion
  - turno actual
  - tiradas manuales / automaticas

## Ultima nota

Si el trabajo se queda a medias, retomar por este orden:
1. Arena / tiradas
2. Postpartido / cronica
3. Competiciones / clones
4. Admin panel / datos maestros

