# ⚙️ Guía de Eventos y Motor Técnico (Match Engine)

Este documento es la referencia técnica para desarrolladores sobre cómo la aplicación traduce las acciones del campo de juego en datos estructurados y estados lógicos.

---

## 1. Estructura Técnica del Evento (JSON)
Cada interacción en la Arena genera un objeto `GameEvent` que se almacena en el log del partido y en Firestore.

```json
{
  "id": 171023456,
  "matchId": "uuid_del_partido",
  "team": "identificador_del_equipo",
  "player": "id_o_nombre_del_jugador",
  "turn": 5,
  "half": 1,
  "type": "TOUCHDOWN",
  "result": "success",
  "target": "id_del_afectado",
  "description": "Gorbag anota tras una carrera épica.",
  "timestamp": "2026-03-19T14:15:00Z"
}
```

---

## 2. Catálogo de Tipos de Eventos (`GameEventType`)

| Categoría | Tipos Principales |
| :--- | :--- |
| **Partido/Turno** | `match_start`, `match_end`, `turn_start`, `turn_end`, `KICKOFF`, `TURNOVER` |
| **Anotación/SPP** | `TOUCHDOWN`, `INJURY`, `FOUL`, `INTERCEPTION`, `PASS`, `MVP_AWARDED` |
| **Movimiento** | `move`, `rush`, `rush_fail`, `dodge`, `dodge_fail`, `pickup_ball`, `pickup_fail` |
| **Combate** | `block`, `push`, `knockdown`, `both_down`, `attacker_down` |
| **Daño/Médico** | `armor_break`, `armor_hold`, `injury_stunned`, `injury_ko`, `injury_casualty`, `DEATH` |
| **Recursos** | `reroll_used`, `apothecary_used`, `bribe_used` |

---

## 3. Máquina de Estados del Partido (`GameState`)
El orquestador central (`MatchOrchestrator.tsx`) gestiona el flujo del partido a través de estas fases:

1. **`selection`**: Carga de equipos (QR/Firestore) y validación de rosters.
2. **`pre_game`**: 
   - Paso 1: Jornaleros (Journeymen).
   - Paso 2: Compra de Incentivos (Underdog + Tesorería propia).
   - Paso 3: Clima, Sorteo y Patada Inicial.
3. **`in_progress`**: El bucle principal de juego (8 turnos por parte).
4. **`ko_recovery`**: Intermedio entre drives para chequear recuperación de jugadores bajo el clima actual.
5. **`post_game`**: Wizard de cierre (Ganancias, SPP, MVP, Crónica).
6. **`reports`**: Visualización de "La Gaceta" y estadísticas finales.

---

## 4. Panel de Control (Acciones Registrables)
La interfaz del Match Center presenta botones de acción rápida que disparan secuencias lógicas:

- **Placaje (Block)**: Dispara la secuencia `Dice Selection -> Armor Roll -> Injury Roll`.
- **Falta (Foul)**: Activa el `foulEngine` para chequear expulsión (dobles naturales).
- **Asegurar Balón**: Acción automática S3 (2+ en 1D6) que termina la activación.
- **Bone Head / Stupid**: Aplica el estado **Distraído** (Pérdida de ZD y habilidades).
- **Stalling**: Chequeo automático al final del turno si el jugador retiene el balón en zona de marca.

---

## 5. Integración Narrativa
Cada evento procesado por esta lógica alimenta el `newsGenerator.ts`, que traduce los códigos (ej: `injury_casualty`) en frases descriptivas para la crónica final del partido en Firestore.
