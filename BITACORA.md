# BITACORA DE CAMPAÑA: BLOOD BOWL MANAGER

Registro vivo del estado del proyecto.
Ultima actualizacion: 2026-03-21

## Proposito

Dejar constancia de las decisiones reales del proyecto para poder retomarlo sin perder contexto.

---

## Estado actual del proyecto

La aplicacion ya cubre estas piezas:
- Admin panel modularizado por dominios.
- Gestion de equipos, estrellas, skills, incentivos, heraldo y competiciones.
- Exploracion de imagenes desde `Bloodbowl-image` para escudos y jugadores.
- Ligas y torneos con competiciones publicas y privadas.
- Creacion de competiciones privadas de prueba desde admin.
- Clonacion de equipos para competiciones y acta de partido.
- Arena orientada a partida de mesa con flujo prepartido, partido, postpartido y cronica.
- Tiradas manuales o automaticas en un modal unico.
- Caidas que reutilizan el flujo de lesion y terminan en turnover.

---

## Cambios de alto nivel ya aplicados

### Admin panel
- `AdminPanel` se separo en componentes y formularios por dominio.
- Se movio el editor pesado a `AdminEditorModal`.
- Se extrajeron formularios para equipos, estrellas, skills, inducements, heraldo, general y competiciones.
- Se separaron overlays de feedback y utilidades de CSV / imagenes.
- Se corrigieron varios `ReferenceError` al pasar estados y props entre panel y modal.

### Imagenes
- Los escudos del gremio y las fichas de jugador usan el repo `Bloodbowl-image`.
- El explorador de GitHub apunta a la carpeta correcta segun el tipo de item.
- Se mejoro el parseo de nombres de archivos compuestos como `Blitzer orco 05.png`.
- La sincronizacion de imagenes ahora puede reparar imagenes viejas o invalidas.

### Home / Gremio / Oraculo
- La Home muestra mejor escudos y permite abrir habilidades con modal.
- El Gremio deja ver fotos en color y estados mas claros por jugador.
- El analisis de historial de equipo incluye partidos, resultado y resumen.

### Competiciones
- Se introdujo un laboratorio de competiciones privadas desde el admin.
- Las competiciones usan `createdBy` y siguen siendo compatibles con `ownerId`.
- Se mantuvo compatibilidad con `competitions` y `leagues` para no romper la app.
- Se anadio cierre de partido con acta que actualiza clasificacion, bracket, clones y cronica.

### Arena
- La arena se redirigio a un flujo unico, mas de mesa que de videojuego.
- El panel principal muestra dos equipos y el panel lateral de accion del jugador.
- El jugador seleccionado se marca como usado / gris.
- `ACCION OK` termina la accion sin log.
- `CAIDA / FALLO` abre tirada y pasa por el flujo de lesion antes del turnover.
- Todas las tiradas de la arena se resuelven con el mismo patron:
  - entrada manual por casillas
  - resolucion automatica con boton

---

## Hitos recientes

### 2026-03-21
- Se actualizo la bitacora viva del proyecto.
- Se alineo la documentacion con el estado actual de la arena, el admin y las competiciones.
- Se dejo constancia del flujo actual de caidas:
  - la esquiva o sprint fallido abre la tirada
  - la resolucion puede ser manual o automatica
  - si la caida sigue, el modal de lesion continua con armadura y heridas
  - el turnover se resuelve al final de la secuencia

### 2026-03-19
- Redisenio del dashboard de arena en Home.
- Reestructuracion de la pagina de ligas en 4 pestañas:
  - Mis Ligas
  - Mis Torneos
  - Descubrir
  - Organizacion
- Nuevo flujo de noticias y cronicas.
- Mejor integracion del siguiente partido y de las estadisticas basicas.

### 2026-03-16
- Normalizacion de nombres de star players.
- Fallback herladico para imagenes.
- Reglas Firestore endurecidas.
- Separacion de activos para Orcos y Orcos Negros.

---

## Reglas de trabajo

Antes de tocar una pieza grande:
- Revisar `BITACORA.md`
- Revisar `bitacora-GPT.md`
- Comprobar impacto en:
  - clones
  - cronica
  - clasificacion
  - turno actual
  - tiradas manuales / automaticas

---

## Siguiente foco recomendado

1. Consolidar un modal comun para todas las tiradas de la arena.
2. Completar el analisis de equipos con historial de partidos y eventos.
3. Seguir limpiando la UI de arena para que sea mas rapida y clara.
4. Mantener la documentacion sincronizada con cualquier refactor de competiciones o admin.
