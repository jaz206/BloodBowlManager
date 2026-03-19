# 🩸 CODEX DE REGLAS: Blood Bowl Manager (Season 3)

Este documento es la **Única Fuente de Verdad** para las reglas de juego y su implementación lógica en la aplicación. Reemplaza a todos los reglamentos fragmentados anteriores.

---

## I. SECUENCIA PRE-PARTIDO (PRE-MATCH)
Pasos obligatorios que el `MatchOrchestrator` debe validar antes del despliegue.

1.  **Factor de Hinchas (Fans)**:
    - Cada entrenador lanza **1D3** + Aficionados Ocasionales.
    - El total determina las ganancias y bonificadores para eventos de Kick-off.
2.  **El Clima**:
    - Lanzar **2D6**.
    - **2 (Calor)**: Tirada de desmayo al final de cada drive.
    - **3 (Muy Soleado)**: -1 PA.
    - **4-10 (Perfecto)**: Sin efectos.
    - **11 (Lluvioso)**: -1 Atrapar/Interceptar/Recoger.
    - **12 (Ventisca)**: -1 GFI, solo pases cortos.
3.  **Contratar Sustitutos (Journeymen)**:
    - Si el equipo tiene < 11 jugadores, añadir Líneas gratis con el rasgo **Solitario (4+)**.
4.  **Adquirir Incentivos (Incentives)**:
    - Cálculo de diferencia de VAE (Valoración Actual de Equipo).
    - El equipo inferior recibe la diferencia + **50,000 MO** extra de su tesorería (opcional).
5.  **Lanzamiento de Moneda**:
    - Ganador elige Patear o Recibir.

---

## II. LÓGICA DE PARTIDO (MATCH LOGIC)

### Eventos de Patada Inicial (2D6)
| Dado | Evento | Efecto para el Motor |
| :--- | :--- | :--- |
| **2** | Árbitro Intimidado | `+1 Soborno` a ambos equipos. |
| **3** | Tiempo Muerto | `TurnCounter ± 1`. |
| **4** | Defensa Sólida | Pateador redespliega 1D3+3 jugadores. |
| **5** | Patada Alta | Receptor coloca un jugador bajo el balón. |
| **6** | Hinchas Animan | Tirada enfrentada. Ganador recibe apoyo en primer placaje. |
| **7** | Entrenador Brillante | Tirada enfrentada. Ganador gana `+1 RR` para el drive. |
| **8** | Clima Cambiante | Nueva tirada de clima. |
| **9** | Anticipación | Receptor mueve 1D3+3 jugadores (1 casilla). |
| **10** | ¡A la Carga! | Pateador activa 1D3+3 jugadores para un Blitz. |
| **11** | Indigestion | Tirada enfrentada. Perdedor aplica `-1 MV/AR` a un jugador. |
| **12** | Invasión de Campo | Perdedor tiene 1D3 jugadores `Aturdidos`. |

### Reglas Críticas S3
- **Retener el Balón (Stalling)**: Si el jugador puede anotar pero no lo hace al final de su activación, lanza **1D6**. Si `Resultado >= Turno del equipo`, el jugador cae, hay **Turnover** y pierde el balón.
- **Expulsiones**: Durante una Falta, cualquier **doble natural** en Armadura o Heridas resulta en expulsión inmediata (salvo soborno).

---

## III. MOTOR DE DAÑO (INJURY ENGINE)

### Secuencia de Resolución
1.  **Tirada de Armadura (2D6)**: Éxito si `Resultado > AR`.
    - *Mighty Blow (+X)*: Añade el bonificador si el resultado base no rompió la AR.
2.  **Tirada de Heridas (2D6)**:
    - **2-7**: Aturdido (Stunned).
    - **8-9**: Inconsciente (KO) - Tira recuperación 4+ en cada Kick-off.
    - **10-12**: Lesión (Injury).
3.  **Tabla de Lesiones graves (1D16)**:
    - **1-8**: Magullado (BHL). Solo falta este partido.
    - **9-10**: Apaleado (MNG). Falta este y el siguiente.
    - **11-12**: Herida Grave. Permanente y MNG.
    - **13-14**: Herida Permanente. Atributo -1 (1D6) y MNG.
    - **15-16**: **¡MUERTO!**.

---

## IV. SECUENCIA POST-PARTIDO (POST-MATCH)

1.  **Ganancias**: `((Afluencia total / 2) + TDs + 1*) * 10,000 MO`. 
    - `*+1` si el equipo NO hizo stalling durante el partido.
2.  **Actualizar Hinchas**: 1D6. Si Ganas y de sacas `>= actual`, sube +1. Si pierdes y sacas `< actual`, baja -1.
3.  **Acumulación de SPP (PE)**:
    - **Pase/Lanzar**: 1 PE.
    - **Casualty/Intercepción**: 2 PE.
    - **Touchdown**: 3 PE.
    - **MVP**: 4 PE (Elegido entre 6 nominados mediante 1D6).
    - *Regla Brutos Brutales*: CAS (3 PE) / TD (2 PE).
4.  **Errores Costosos**: Si Tesorería `>= 100,000 MO`, tira 1D6 para posible pérdida de fondos.

---

## V. PROGRESIÓN Y VALORACIÓN (VAE)

### Gastar PE (Level Up)
| Tipo | Azar | Elegida | Impacto en VAE |
| :--- | :--- | :--- | :--- |
| **Primaria** | 3 PE | 6 PE | **+20,000 MO** |
| **Secundaria** | - | 12 PE | **+40,000 MO** |
| **Atributo** | 14 PE (1D8) | - | **+10k a +60k** |

> [!IMPORTANT]
> **Habilidades de Élite S3**: Las habilidades **Placar (Block)**, **Esquivar (Dodge)**, **Defensa (Guard)** y **Golpe mortífero (Mighty Blow)** tienen un recargo adicional de **+10,000 MO** acumulable al coste normal.

---

## VI. ESTRUCTURA DE REFERENCIA (DATA ROSTERS)
Para consultar los datos de jugadores y equipos, referirse al archivo **`DATA_ROSTERS_S3.md`**.
- La aplicación debe usar este archivo como semilla para poblar las razas iniciales.
- El desarrollador debe mapear la columna `PRIMARIAS` y `SECUNDARIAS` a las categorías de habilidades del motor de progresión.
