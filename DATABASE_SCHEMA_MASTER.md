# 🗄️ Esquema Maestro de Base de Datos (Firestore)

Este documento define la estructura de datos oficial de **Blood Bowl Manager**. Es la "Single Source of Truth" para cualquier implementación (Web o Android).

---

## 1. Colección: `competitions` (Ligas y Torneos)
Cada documento representa una competición organizada.

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | `string` | UUID de la competición. |
| `name` | `string` | Nombre público. |
| `format` | `'Liguilla' \| 'Torneo'` | Tipo de formato competitivo. |
| `status` | `'Open' \| 'In Progress' \| 'Finished'` | Estado de la inscripción/juego. |
| `visibility` | `'Public' \| 'Private'` | Visibilidad en el buscador "Descubrir". |
| `maxTeams` | `number` | Límite de participantes (S3). |
| `ownerId` | `string` | ID del usuario creador. |
| `teams` | `Array<CompetitionTeam>` | Lista de participantes y sus clones (ver abajo). |
| `schedule` | `Map<string, Matchup[]>` | Calendario (Formato Liguilla). |
| `bracket` | `Map<string, Matchup[]>` | Cuadro eliminatorio (Formato Torneo). |
| `rules` | `CompetitionRules` | Configuración (Muerte súbita, tiempo turno, etc). |
| `reports` | `Array<MatchReport>` | Feed de noticias "La Gaceta". |

### Sub-objeto: `CompetitionTeam`
- `teamName`: Nombre del equipo.
- `ownerId`: Usuario que lo controla.
- `teamState`: (**ManagedTeam**) Clon exacto del equipo en el momento de inscripción.
- `stats`: Objeto con `played`, `won`, `lost`, `tdFor`, `casFor`, `points`.

---

## 2. Colección: `managedTeams` (Gremio)
Equipos persistentes propiedad de los usuarios.

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | `string` | ID del equipo. |
| `ownerId` | `string` | Propietario. |
| `name` | `string` | Nombre personalizado. |
| `rosterName` | `string` | Raza/Facción (ej: "Orcos"). |
| `treasury` | `number` | Monedas de oro disponibles. |
| `players` | `Array<ManagedPlayer>` | Lista de jugadores (ver abajo). |
| `totalTV` | `number` | Valor de Equipo (Team Value) calculado. |
| `rerolls` | `number` | Cantidad de segundas oportunidades compradas. |
| `snapshots` | `Array<Snapshot>` | Historial de estados pasados ("Cápsulas de tiempo"). |

### Sub-objeto: `ManagedPlayer`
- `customName`: Nombre del jugador.
- `stats`: `{ MV, FU, AG, PA, AR }`.
- `skillKeys`: Array de identificadores de habilidades (ej: `["Block", "Dodge"]`).
- `spp`: Puntos de estrellato acumulados.
- `status`: `'Activo' \| 'KO' \| 'Lesionado' | 'Muerto'`.
- `sppActions`: Record de `TD`, `CAS`, `MVP` conseguidos.

---

## 3. Colección: `matchReports` (Historial/Crónicas)
Documentos que guardan el resultado de un encuentro.

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | `string` | ID del reporte. |
| `headline` | `string` | Titular del periódico. |
| `article` | `string` | Cuerpo de la noticia narrativa. |
| `homeTeam` / `opponentTeam` | `Object` | Datos resumidos: `name`, `score`, `rosterName`. |
| `gameLog` | `Array<GameEvent>` | Lista técnica de cada click realizado en el Match Center. |
| `wasConceded` | `'home' \| 'opponent' \| 'none'` | Indica si hubo rendición. |

---

## 4. Colección: `masterData` (Referencia)
Documentos de solo lectura para los usuarios (Admin Panel).
- `teams`: Rosters oficiales y costes.
- `skills`: Diccionario bilingüe de habilidades.
- `starPlayers`: Definiciones de estrellas y parejas.

---

## 🔗 Relaciones Clave
1. **User -> Teams**: Un usuario tiene N `managedTeams`.
2. **Competition -> ManagedTeam (Clon)**: Al unirse a una liga, se copia el estado actual del equipo del usuario dentro del array `teams` de la liga. El equipo original NO se modifica durante el partido; los cambios se aplican al clon y se sincronizan al finalizar si el usuario lo acepta.
3. **MatchReport -> Competition**: Cada reporte generado en una liga se guarda dentro del array `reports` de la competición para alimentar "La Gaceta".
