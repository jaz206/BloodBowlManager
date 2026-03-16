# 🏟️ Arquitectura y Funcionamiento: Blood Bowl Arena (Match Engine)

Este documento detalla la lógica interna, los cálculos y el flujo de trabajo del Match Engine de la Arena, diseñado para cumplir con las reglas de la **Season 3 (2025)**.

---

## 1. Arquitectura de Estados
La Arena se gestiona mediante un **Orquestador Central** (`MatchOrchestrator.tsx`) y un **Contexto Global** (`MatchContext.tsx`).

### Estados de Partida (`GameState`)
- **`selection`**: Configuración de equipos (Carga vía QR o manual) y modo de juego (Amistoso/Competición).
- **`pre_game`**: Secuencia de 4 pasos (Journeymen, Mercado de Incentivos/Clima/Sorteo, Despliegue, Kickoff).
- **`in_progress`**: El bucle principal del partido.
- **`ko_recovery`**: Fase intermedia entre drives para recuperar jugadores inconscientes.
- **`post_game`**: Cierre de acta, SPP, MVP y actualización de base de datos.

---

## 2. Motores de Reglas (`engine/`)

### A. Motor de Lesiones (`injuryEngine.ts`)
Gestiona la lógica de daños cuando un jugador es derribado.
- **Tirada de Armadura (2D6)**: Compara contra atributo `AR`.
- **Tirada de Heridas (2D6)**: Determina Aturdido, KO o Lesionado.
    - *Modificador Stunty*: Umbrales de herida reducidos para jugadores pequeños.
- **Intervención del Apotecario**: Permite repetir tiradas de KO o Lesión.
- **Regeneración**: Chequeo 4+ para jugadores no-muertos.
- **Devolver el Favor (S3)**: Si un jugador sufre una lesión grave, tiene un 50% (4+) de ganar el rasgo **Odio** contra su agresor.

### B. Motor de Faltas (`foulEngine.ts`)
- **Doble Natural**: Si sale un doble en la tirada de Armadura o Heridas, el jugador es expulsado.
- **Árbitro Parcial**: El incentivo permite evitar la expulsión con un 2+ en 1D6.

### C. Lógica de Juego (`matchEngine.ts`)
- **Turnos**: 8 turnos por parte. El turno avanza tras la activación del equipo visitante.
- **Stalling (Frenazo)**: Lanza 1D6 al activar un jugador que puede anotar. Si `Dado >= Turno Actual`, ocurre un Turnover.
- **SPP Dinámico (S3)**:
    - Normal: TD (3), Baja (2).
    - **Brutos Brutales (S3)**: TD (2), Baja (3).

---

## 3. Acciones de Juego (Vínculo de Nuffle)

Implementadas en `S3ActionOrchestrator.tsx`, estas acciones permiten digitalizar las tiradas de dados físicas:

| Acción | Dado | Lógica |
| :--- | :--- | :--- |
| **GFI (Rush)** | 1D6 | Fallo con 1 natural. |
| **Asegurar Balón** | 1D6 | Requiere 2+ para éxito. |
| **Falta** | 2D6 | Lanza Armadura automáticamente contra el objetivo. |
| **Bone Head** | 1D6 | Si saca 1, el jugador queda **Distraído** (Pierde ZD y Habilidades). |
| **Placaje** | Block | Dados de placaje (Calaveras, Both Down, Empujón, etc). |

---

## 4. UI y Modales
- **MiniField**: Representación táctica para despliegue y visualización de estados (Balón, Distraído, Indigestión).
- **PlayerStatusCard**: Gestión individual de condiciones S3:
    - **Distraído**: El CSS aplica `grayscale` y una línea sobre las habilidades, indicando que no tiene Zona de Defensa.
    - **Indigestión**: Aplica penalizador automático de -1 MA y -1 AR visible en la ficha.
- **Quick Dice Grid**: Interfaz de entrada rápida para resultados 2-12 que agiliza el uso de la app durante partidos con dados físicos.

---

## 5. Secuencia de Turno y Continuidad
1. **Inicio de Turno**: Se limpian las acciones estratégicas (Blitz, Pase, Falta, Handoff).
2. **Activación de Jugador**: El usuario selecciona un jugador y realiza acciones.
3. **Turnover**: Disparado por fallos críticos (GFI 1, Pase fallido, Muerte, Stalling).
4. **Final de Turno**: Se alterna el equipo activo y se comprueba el límite de tiempo/turnos.

---

## 6. Integración de Datos
- **QR Code**: Serializa el equipo en un formato comprimido para transferencia offline entre dispositivos.
- **Post-Game**: Actualiza la tesorería del equipo basándose en la FAMA y el Factor de Hinchas según la tabla de ganancias S3.
