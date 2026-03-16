# 📜 Reglamento de la Arena: Season 3 (2025)

Esta guía sirve como referencia rápida para la lógica de juego implementada en el Match Engine de la Season 3.

---

## 1. Secuencia Anterior al Partido (Pre-Match)
Pasos obligatorios para determinar los recursos iniciales antes del despliegue.

*   **Factor de Hinchas**: Cada entrenador lanza **1D3** y suma sus aficionados ocasionales.
*   **El Clima**: Se lanzan **2D6** y se consulta la tabla:
    *   **2 (Calor Asfixiante)**: Posibles desmayos al final de cada entrada (drive).
    *   **3 (Muy Soleado)**: -1 a los chequeos de Pase.
    *   **4-10 (Clima Perfecto)**: Sin efectos.
    *   **11 (Lluvioso)**: -1 a Recoger, Atrapar e Interceptar.
    *   **12 (Ventisca)**: -1 a Forzar la marcha (Rush). Solo pases rápidos o cortos.
*   **Incentivos**: Se calcula la diferencia de VAE. El equipo con menor VAE recibe la diferencia. 
    > [!TIP]
    > **Novedad S3**: El equipo con mayor valoración puede añadir hasta **50,000 MO** de su propia tesorería para completar sus compras.
*   **Determinar Equipo Pateador**: Tirada enfrentada de **1D6**. El ganador elige si patea o recibe.

---

## 2. Eventos de Patada Inicial (Kick-Off)
Tras el despliegue y antes de que el balón caiga, el pateador lanza **2D6**:

| Dado | Evento | Efecto |
| :--- | :--- | :--- |
| **2** | Árbitro Intimidado | Ambos equipos reciben un Soborno gratuito. |
| **3** | Tiempo Muerto | Se ajustan los marcadores de turno (±1). |
| **4** | Defensa Sólida | El pateador redespliega 1D3+3 jugadores desmarcados. |
| **5** | Patada Alta | El receptor coloca un jugador directamente bajo el balón. |
| **6** | Hinchas Animan | Tirada enfrentada (1D6+Animadoras). +1 apoyo ofensivo. |
| **7** | Entrenador Brillante | Tirada enfrentada (1D6+Ayudantes). +1 Reroll extra para el drive. |
| **8** | Clima Cambiante | Nueva tirada en la tabla de Clima. |
| **9** | Anticipación | El receptor mueve 1D3+3 jugadores (1 casilla). |
| **10** | ¡A la Carga! (Blitz) | El pateador activa 1D3+3 jugadores desmarcados; uno puede hacer Blitz. |
| **11** | Indigestión | Tirada enfrentada 1D6. Perdedor aplica -1 MV/AR a un jugador al azar. |
| **12** | Invasión de Campo | Tirada enfrentada (1D6+Hinchas). El perdedor tiene 1D3 Aturdidos. |

---

## 3. Acciones en la Arena
Acciones activadas basadas en atributos del jugador (MA, ST, AG, PA, AR).

### Movimiento y Posicionamiento
*   **Forzar la Marcha (Rush/GFI)**: Lanza 1D6. Éxito con 2+. Un 1 natural derriba al jugador.
*   **Esquivar**: Lanza 1D6 contra AG (ej. 3+). -1 por cada zona de defensa en la casilla de destino.
*   **Brincar**: Lanza 1D6 contra AG con modificadores por zonas de defensa enemigas.

### Combate (Placajes)
*   **Determinación de Dados**:
    *   FU igual: **1 dado**.
    *   FU superior: **2 dados** (atacante elige).
    *   FU el doble o más: **3 dados** (atacante elige).
*   **Valentía (Dauntless)**: Si el rival es más fuerte, lanza 1D6 + FU propia. Si iguala/supera la FU rival, se igualan fuerzas para ese placaje.

### Manejo del Balón
*   **Recoger**: Lanza 1D6 contra AG con modificadores (Clima, Zonas de defensa).
*   **Asegurar el Balón (S3)**: Acción especial (balón suelto a 2 casillas o más de enemigos). Éxito 2+, el jugador recoge el balón y termina su activación.
*   **Pase / Lanzar Compañero**: Lanza 1D6 contra Atributo de Pase (PA). Modificadores por distancia y zonas de defensa.
*   **Intercepción**: Un rival en trayectoria puede intentar interceptar con un **6 natural (1D6)**.

---

## 4. Resolución de Daño (Lesiones)
Secuencia obligatoria al derribar a un jugador:

1.  **Tirada de Armadura**: Se lanzan **2D6**. Si el resultado > **AR**, la armadura se rompe.
2.  **Tirada de Heridas**: Se lanzan **2D6**.
    *   **2-7**: Aturdido (Stunned).
    *   **8-9**: Inconsciente (KO).
    *   **10-12**: Lesionado (zona de Lesionados).
3.  **Tabla de Lesiones (1D16)**:
    *   **1-8**: Magullado (Badly Hurt). Solo pierde este partido.
    *   **9-10**: Apaleado (MNG). Pierde este partido y el siguiente.
    *   **11-12**: Herida Grave. Pierde el siguiente.
    *   **13-14**: Herida Permanente. Reducción de Atributo (1D6) y pierde el siguiente.
    *   **15-16**: **¡MUERTO!** Se elimina de la plantilla.

---

## 5. Eventos Especiales S3

> [!IMPORTANT]
> **Retener el Balón (Stalling / Frenazo)**: Si un jugador puede anotar pero no lo hace, lanza 1D6. Si **Resultado ≥ Turno Actual**, el jugador cae, hay **Turnover** y pierde el balón.

*   **Turnover**: Ocurre si un jugador cae, se pierde el balón, falla un pase, se anota TD o hay expulsión.
*   **Expulsiones**: En una Falta, si sale un **doble natural** en Armadura o Heridas, el jugador es expulsado.

---

## 6. Secuencia Post-Partido
Gestión de ganancias y crecimiento del equipo.

*   **Ganancias**: `(Suma de hinchas de ambos equipos) * 10,000 MO`. (+1 si no se retuvo el balón).
*   **Actualizar Hinchas**: 1D6. Si ganas y sacas ≥ hinchas actuales, suben +1 (máx 7). Si pierdes y sacas <, bajan -1.
*   **PE (Puntos de Estrellato)**:
    *   Pase/Lanzar: +1 PE.
    *   Intercepción: +2 PE.
    *   Baja (CAS): +2 PE (**Brutos Brutales S3/Khorne: +3 PE**).
    *   Touchdown (TD): +3 PE (**Brutos Brutales S3/Khorne: +2 PE**).
    *   MVP: 4 PE (Lanzar 1D6 entre 6 nominados).
*   **Errores Costosos**: Si tienes ≥ 100,000 MO, lanza 1D6 para ver si pierdes tesorería.
