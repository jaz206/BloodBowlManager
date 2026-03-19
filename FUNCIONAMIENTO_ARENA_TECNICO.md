# 🏟️ Arquitectura y Funcionamiento Técnico: La Arena (V2026)

Este documento detalla la lógica de negocio, arquitectura de datos y motores de reglas para la gestión de competiciones.

---

## 1. El Dashboard Dinámico (`Home/index.tsx`)
El panel de "Estado de la Arena" opera mediante inyección de contexto competidor.

- **Estado `activeCompId`**: Los componentes de Home (`HomeLeaderboard`, `HomeNextMatch`) se suscriben a este ID.
- **`useMemo` de Estadísticas**:
  - `homeStandings`: Filtra, ordena por puntos (3 pts V, 1 pt E) y desempate por TD-Net.
  - `homeScorers`: Aplana los jugadores de todos los equipos de la liga, filtra por `sppActions.TD > 0` y ordena descendente.
  - `homeBashers`: Aplana jugadores, filtra por `sppActions.CASUALTY > 0` y ordena descendente.
- **Navegación Selectiva**: Solo el encabezado del dashboard (`h2`) y el chevron icon disparan `onNavigate('leagues')`. El `select` nativo está blindado con `e.stopPropagation()` para permitir interacción sin navegar.

---

## 2. El Sistema de 4 Pestañas (`LeaguesPage/renderTabbedList`)
La arquitectura de `LeaguesPage.tsx` se basa en filtros derivados del array maestro de `competitions`.

1. **`my-leagues`**: `competitions.filter(c => c.format === 'Liguilla' && c.teams.some(t => t.ownerId === user.id))`.
2. **`my-tournaments`**: `competitions.filter(c => c.format === 'Torneo' && c.teams.some(t => t.ownerId === user.id))`.
3. **`discover`**: Filtra ligas públicas (`visibility === 'public'`), abiertas (`status === 'Open'`) y donde el usuario aún no tiene plaza.
4. **`organization`**: Filtra ligas donde `ownerId === user.id`. Centra el acceso a modales de gestión (Reports, Admin, Delete).

---

## 3. "La Gaceta" y Sistema de Crónicas
El sistema de noticias opera sobre el array `Competition.reports`.

- **Modelo `MatchReport`**:
  - `id`: UUID.
  - `headline`, `subHeadline`, `article`: Texto narrativo.
  - `homeTeam`, `opponentTeam`: Objeto con `name`, `score` y `rosterName`.
  - `date`: Fecha de publicación.
- **Generación Automática**: El `PostGameWizard` puede disparar el `newsGenerator.ts` para crear un reporte base al cerrar el acta.
- **Redacción Manual**: El organizador puede inyectar nuevos reportes vía modal, los cuales se añaden al principio del array (`[newReport, ...oldReports]`) para visualización cronológica inversa.

---

## 4. Gestión de Clones (ManagedTeam)
Para competiciones, se utiliza una copia profunda de la franquicia original.

- **Ficha Técnica**: Al seleccionar un equipo en el detalle de liga, se inyecta su `teamState` (un `ManagedTeam` de Firestore) en el modal `StatsModalTeam`.
- **Integridad de Datos**: Las actualizaciones en el clon (lesiones, SPP) se guardan en el objeto `CompetitionTeam` y no afectan al equipo base del Gremio hasta que el usuario decida sincronizarlo explícitamente.

---

## 5. Próximo Encuentro Inteligente
Lógica de detección de partido pendiente para el usuario en una competencia:

```typescript
const nextMatch = useMemo(() => {
    if (activeComp.format === 'Liguilla') {
        const schedule = activeComp.schedule || {};
        // Busca en todas las jornadas (rounds) el primer partido del usuario sin score
        for (const matchups of Object.values(schedule)) {
            const match = matchups.find(m => 
                (m.team1 === myTeamName || m.team2 === myTeamName) && 
                m.score1 === null && m.score2 === null
            );
            if (match) return match;
        }
    }
}, [activeComp, user]);
```

---

## 🎲 Conclusión para Android (Mesa de Estrategia)
Para la futura aplicación **Blood Bowl Android**:
- Replicar la lógica `useMemo` de los rankings en `ViewModel` de Kotlin.
- Implementar el sistema de pestañas Arena mediante `Navigation Component` o `Compose Tabs`.
- Utilizar el motor de crónicas para generar notificaciones push de "Nueva Crónica en La Gaceta".
