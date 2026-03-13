# 🩸 Guía Técnica: Secuencia de Partido y Progresión

Este documento detalla el flujo oficial de juego y el sistema de desarrollo de jugadores para **Blood Bowl Assistant**, basado en el reglamento de la *Season 3 (2025)*.

---

## 1. Secuencia Anterior al Partido (Pre-Game Sequence)
Antes de que ruede el balón, se resuelven estos cinco pasos fundamentales:

1.  **Factor de Hinchas (Fans):** Representa cuántos miles de aficionados acuden al estadio.
    *   **Cálculo:** Cada entrenador tira **1D3** y suma el número de aficionados ocasionales de su Hoja de Plantilla.
    *   **Efecto:** Influye en eventos de patada inicial y determina las ganancias económicas finales.

2.  **El Clima (The Weather):** Se lanzan **2D6** y se consulta la tabla:
    *   **2 (Calor Asfixiante):** Posibles desmayos al final de cada entrada.
    *   **3 (Muy Soleado):** -1 a los chequeos de Pase.
    *   **4-10 (Clima Perfecto):** Sin efectos.
    *   **11 (Lluvioso):** -1 a recoger, atrapar o interceptar el balón.
    *   **12 (Ventisca):** -1 a Forzar la marcha (Rush) y solo pases rápidos o cortos.

3.  **Contratar Sustitutos (Solo en Ligas):** Si un equipo tiene menos de 11 jugadores disponibles:
    *   Se añaden "Sustitutos" (posiciones de Línea) gratis hasta completar los 11.
    *   Tienen el rasgo **Solitario (4+)**.
    *   Suman a la Valoración Actual de Equipo (VAE) para los Incentivos.

4.  **Adquirir Incentivos:** Se compara la VAE de ambos equipos. El equipo con menor valoración recibe la diferencia en efectivo.
    *   **Novedad S3:** El equipo con menor VAE puede gastar hasta **50,000 monedas de oro adicionales** de su propia tesorería.
    *   **Ejemplos:** Plegarias a Nuffle (10k), Ayudantes (20k), Animadoras (5k), Sobornos (100k/50k), Star Players.

5.  **Determinar Equipo Pateador:** Tirada enfrentada (1D6 cada uno). El ganador elige quién es el **pateador** (defensa) y quién el **receptor** (ataque).

---

## 2. Inicio de una Entrada (Drive)

### A. Despliegue (Set-up)
1.  **El Pateador se acomoda primero:** El defensor coloca sus 11 jugadores en su mitad.
2.  **El Receptor se acomoda segundo:** El atacante despliega después.
3.  **Restricciones:** Mínimo 3 en la línea de placajes (centro), máximo 2 por banda lateral.
4.  **Insignificante (Swarming):** Permite añadir 1D3 jugadores adicionales tras el despliegue normal.

### B. La Patada Inicial (Kick-off)
1.  **Designar Pateador:** Debe ser un jugador que no esté en la línea ni en bandas (si es posible).
2.  **Colocar el Balón:** Elegir casilla objetivo en la mitad rival.
3.  **Desvío:** Se lanza 1D8 (dirección) y 1D6 (distancia). *Habilidad Patada: reduce distancia a 1D3*.

### C. Tabla de Eventos de Patada Inicial (2D6)
Mientras el balón está en el aire, se lanza 2D6 para determinar qué ocurre:

| 2D6 | Evento | Descripción del Efecto |
|:---:|:---|:---|
| **2** | **Árbitro Intimidado** | Cada equipo recibe un **Soborno** gratuito que debe usarse antes del final del partido. |
| **3** | **Tiempo Muerto** | Si el equipo pateador está en su turno 6, 7 u 8, ambos marcadores de turno retroceden un espacio; de lo contrario, avanzan uno. |
| **4** | **Defensa Sólida** | El pateador puede elegir **1D3+3** jugadores desmarcados para recolocarlos en su campo. |
| **5** | **Patada Alta** | Un jugador del equipo receptor desmarcado puede colocarse en la casilla donde caerá el balón. |
| **6** | **Los Hinchas Animan** | Tirada enfrentada (1D6 + Animadoras). El ganador recibe apoyo ofensivo adicional en el primer placaje de su turno. |
| **7** | **Entrenador Brillante** | Tirada enfrentada (1D6 + Ayudantes). El ganador recibe una **RR gratuita** válida solo para esa entrada. |
| **8** | **Clima Cambiante** | Se tira de nuevo en la tabla de Clima. Si sale "Clima perfecto", el balón se escora (3 casillas) antes de aterrizar. |
| **9** | **Anticipación** | El receptor elige **1D3+3** jugadores desmarcados para moverlos una casilla (incluso a la mitad rival). |
| **10** | **¡A la Carga! (Blitz)** | El pateador activa **1D3+3** jugadores desmarcados para mover. Uno puede hacer Blitz, otro Lanzar Compañero y otro Patear Compañero. |
| **11** | **Indigestión** | Tirada enfrentada (1D6). El perdedor elige un jugador al azar: con 2+, -1 MV/AR; con 1, va a Reservas por evacuación. |
| **12** | **Invasión de Campo** | Tirada enfrentada (1D6 + Factor de Hinchas). El perdedor tiene **1D3** jugadores (al azar) Tumbados y Aturdidos. |

Tras resolver el evento, el balón cae (atrapada o rebote) y comienza el turno del receptor.

---

## 3. Secuencia Posterior al Partido (Post-Game Sequence)
Una vez suena el pitido final, ambos entrenadores deben seguir estos pasos de forma detallada:

### 1. Anotar el Resultado y las Ganancias
*   **Resultado y Puntos:** Victoria (3 pts), Empate (1 pt), Derrota (0 pts). Registrar TDs anotados y bajas causadas (solo las que generen Puntos de Estrellato).
*   **Cálculo de Ganancias:** 
    *   **Afluencia:** Suma del Factor de Hinchas de ambos equipos.
    *   **Fórmula:** `((Afluencia / 2) + TDs propios + 1*) * 10,000 monedas de oro`.
    *   *\*Extra (+1):** Si el equipo no Retuvo el Balón en ningún momento del partido.
    *   El oro se añade inmediatamente a la Tesorería.

### 2. Actualizar Hinchas
La popularidad del equipo fluctúa según su desempeño:
*   **Si ganaste:** Tira 1D6. Si es **≥ Hinchas actuales**, aumenta en +1 (máx 7).
*   **Si perdiste:** Tira 1D6. Si es **< Hinchas actuales**, se reduce en -1 (mín 1).
*   **Si empataste:** El atributo de Hinchas no varía.

### 3. Progreso de los Jugadores (PE / SPP)
Los jugadores acumulan **Puntos de Estrellato (PE)**:
*   **Acciones estándar:**
    *   Pase completo / Lanzar compañero con éxito: **1 PE**.
    *   Intercepción: **2 PE**.
    *   Lesionar a un rival (Casualty): **2 PE**.
    *   Touchdown: **3 PE**.
*   **Regla Brutos Brutales (Ej: Orcos Negros, Khorne):** Lesión (**3 PE**) / Touchdown (**2 PE**).
*   **Mejor Jugador del Partido (MJP):** El entrenador elige a **6 jugadores** que hayan participado; tira 1D6 para asignar **4 PE** a uno de ellos.

**Gastar PE (Mejoras):**
*   **Habilidad Primaria:** 6 PE (o 3 PE si es al azar).
*   **Habilidad Secundaria:** 12 PE.
*   **Mejora de Atributo:** 14 PE (USA **1D8** en lugar de 1D16).

### 4. Plantilla: Fichar, Despedir o Retirar
*   **Bajas:** Eliminar jugadores muertos.
*   **Fichajes:** Contratar nuevos jugadores usando el oro de la Tesorería.
*   **Sustitutos (Journeymen):** Puedes contratar permanentemente a un Sustituto que haya jugado el partido pagando su coste. Conserva sus PE y pierde el rasgo Solitario.
*   **Retiro Temporal:** Jugadores con heridas graves pueden descansar el resto de la temporada para intentar recuperarse para la siguiente.

### 5. Errores Costosos
Si tras las ganancias la Tesorería tiene **100,000 monedas o más**, tira **1D6** para determinar si hay mala gestión (pérdida de oro por escándalos o accidentes).

### 6. Actualizar Valoración Actual de Equipo (VAE)
Recalcula el valor total del equipo:
*   **Coste de jugadores:** Incluye mejoras (Primaria +20k, Secundaria +40k, Atributos +10k a +60k).
*   **Extras:** Personal técnico, Segundas Oportunidades e Hinchas.
*   **Importante:** Los jugadores lesionados (MNG) que se perderán el próximo partido **no cuentan para la VAE** de ese encuentro (ayuda a conseguir más incentivos).