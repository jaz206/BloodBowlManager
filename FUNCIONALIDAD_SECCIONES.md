# 🩸 Blood Bowl Assistant – Funcionalidad de Secciones

Este documento describe el funcionamiento de cada sección principal de la aplicación **Blood Bowl Assistant**, incluyendo su objetivo, los elementos que debe contener y cómo interactúa el usuario con ella.

La aplicación se organiza en tres áreas principales:

1. El Oráculo de Nuffle (consulta de conocimiento)
2. El Gremio de Entrenadores (gestión de equipos)
3. La Arena de la Gloria (ligas y partidos)

---

# 📚 I. EL ORÁCULO DE NUFFLE
## Base de conocimiento del juego

### Objetivo

Permitir consultar rápidamente toda la información relevante del juego durante la preparación de equipos o durante una partida.

Debe ser **rápido, claro y fácil de buscar**.

---

## Contenido de la sección

Esta sección contiene:

- Enciclopedia de equipos
- Base de datos de habilidades
- Jugadores estrella
- Calculadora de probabilidades
- Tabla de incentivos

---

## Funcionalidad general

El usuario puede:

- Buscar información mediante un **buscador global**
- Filtrar contenido por categorías
- Acceder rápidamente a fichas detalladas

Esta sección no modifica datos del usuario, solo consulta información.

---

## Enciclopedia de Equipos

### Qué contiene

Lista de todas las facciones del juego.

Cada equipo tiene:

- nombre
- tier
- descripción
- roster de jugadores
- coste de cada posición
- habilidades iniciales
- coste de rerolls
- disponibilidad de apotecario
- icono o escudo

También debe mostrar:

- atributos promedio del equipo
- gráfico radar comparativo

Atributos representados:

- MA (Movimiento)
- ST (Fuerza)
- AG (Agilidad)
- PA (Pase)
- AV (Armadura)

---

## Codex de Habilidades

### Qué contiene

Lista completa de habilidades del juego.

Cada habilidad tiene:

- nombre
- descripción
- categoría
- icono
- color de categoría

Categorías:

- General
- Fuerza
- Agilidad
- Pase
- Mutación
- Triquiñuelas

---

### Funcionalidad

El usuario puede:

- buscar habilidades
- filtrar por categoría
- abrir la ficha de una habilidad

Esta sección es especialmente útil durante partidas.

---

## Compendio de Jugadores Estrella

### Qué contiene

Listado de todos los **Star Players** del juego.

Cada jugador estrella tiene:

- nombre
- coste de contratación
- atributos
- habilidades
- equipos que pueden contratarlo
- reglas especiales
- imagen del jugador
- descripción temática

---

### Funcionalidad

El usuario puede:

- buscar jugadores estrella
- filtrar por equipo compatible
- filtrar por coste
- comparar varios jugadores estrella

---

## Calculadora de Probabilidades

### Objetivo

Permitir calcular rápidamente probabilidades de éxito de acciones del juego.

---

### Acciones que debe calcular

- tiradas de agilidad
- tiradas con segunda oportunidad (reroll)
- bloqueos con distintos dados
- esquivas
- recoger balón
- pases

---

### Ejemplo de uso

El usuario selecciona:

Objetivo de dado → 3+

¿Usar reroll? → Sí

Resultado:

Probabilidad de éxito → 88.9%

---

## Tabla de Incentivos

### Objetivo

Ayudar a elegir incentivos cuando hay diferencia de valor de equipo.

---

### Funcionamiento

El usuario introduce:

- TV equipo A
- TV equipo B

La aplicación calcula:

- diferencia de valor
- presupuesto de incentivos

---

### La app muestra sugerencias

Ejemplos:

- Barriles de Bloodweiser
- Mercenarios
- Jugadores estrella
- Chef Halfling

Cada incentivo muestra:

- coste
- efecto
- recomendación estratégica

---

# ⚔️ II. EL GREMIO DE ENTRENADORES
## Gestión de equipos

### Objetivo

Permitir que los usuarios creen, gestionen y evolucionen sus equipos.

Todos los datos se guardan en **Firestore**.

---

## Contenido de la sección

- Mis equipos
- Crear equipo
- Gestión de roster
- Gestión de jugadores
- Historial de partidos
- Pizarra táctica

---

## Mis Equipos

### Qué contiene

Lista de todos los equipos creados por el usuario.

Cada equipo muestra:

- nombre
- raza
- valor del equipo (TV)
- número de jugadores
- escudo del equipo

---

### Funcionalidad

El usuario puede:

- abrir la ficha del equipo
- editar el equipo
- ver historial de partidos
- acceder a la pizarra táctica

---

## Ficha de Equipo

Contiene varias pestañas.

### Roster

Lista de jugadores del equipo.

Cada jugador muestra:

- nombre
- posición
- atributos
- habilidades
- lesiones

---

### Jugadores

Ficha individual de cada jugador.

Contiene:

- atributos
- habilidades
- puntos de estrellato (SPP)
- estadísticas

---

### Estadísticas del jugador

- touchdowns
- bajas causadas
- intercepciones
- pases completados
- MVP obtenidos

---

### Historial de Partidos

Lista de partidos jugados por el equipo.

Cada partido muestra:

- rival
- resultado
- fecha
- **Crónica Deportiva**: Enlace a la narración estilo periódico generada al finalizar.

---

## Crear Equipo

### Funcionamiento

El usuario selecciona:

- facción
- nombre del equipo
- escudo

Luego construye el roster:

- añadir jugadores
- añadir rerolls
- añadir staff

---

### El sistema calcula automáticamente

- coste total
- valor del equipo (TV)
- límites del roster

---

## Pizarra Táctica

### Objetivo

Permitir diseñar formaciones antes de los partidos.

---

### Funcionalidad

El usuario puede:

- arrastrar jugadores sobre el campo
- moverlos libremente
- guardar formaciones

Ejemplos de formaciones:

- defensa contra elfos
- jaula ofensiva
- defensa profunda

---

# 🏟 III. LA ARENA DE LA GLORIA
## Ligas y partidos

### Objetivo

Gestionar competiciones y registrar lo que ocurre durante los partidos.

---

## Contenido de la sección

- Ligas
- Partidos
- Consola de partido en vivo
- Crónicas
- Historial de partidos

---

## Gestor de Ligas

### Funcionalidad

Permite crear:

- ligas
- torneos
- temporadas

---

### Cada liga contiene

- equipos participantes
- clasificación
- calendario de partidos
- historial de resultados

---

## Consola de Partido en Vivo

### Objetivo

Registrar lo que ocurre durante el partido.

Optimizada para **tablet o móvil**.

---

### Elementos de la consola

- contador de turnos
- marcador
- registro de eventos
- uso de rerolls

---

### Acciones registrables

- touchdown
- baja causada
- falta
- intercepción
- recogida de balón
- pase completado
- expulsión
- lesión grave

---

## Contratación de Jugadores Estrella

Durante el partido el sistema puede permitir contratar Star Players.

Esto ocurre cuando hay diferencia de valor de equipo.

---

### Funcionamiento

La app muestra:

- jugadores estrella disponibles
- coste
- equipos compatibles

Si el usuario lo contrata:

- se descuenta del presupuesto de incentivos
- se añade al roster del partido

El jugador solo participa en ese partido.

---

# 📖 EL CRONISTA DE NUFFLE
## Narración automática del partido

### Objetivo

Generar una crónica narrativa automática del encuentro.

---

### Funcionamiento

1. **Captura en Vivo**: Cada evento registrado durante el partido se guarda en Firestore.
2. **Generación Narrativa**: Al finalizar, el sistema procesa el log completo y genera un titular impactante y un artículo detallado.
3. **Formato Periódico**: El resultado se presenta en el "Diario Deportivo de Altdorf", con maquetación de diario clásico (serif, columnas, capitulares).

---

### Ejemplo de resultado

Turno 3.

El blitzer orco Gorbag atravesó la línea humana con una brutal embestida y dejó fuera de combate a un rival.

La multitud rugía mientras el árbitro fingía no haber visto nada.

---

# 🎯 Objetivo del sistema

Crear la herramienta definitiva para jugadores de Blood Bowl que combine:

- consulta de reglas
- gestión de equipos
- control de partidos
- narración automática
- historial de ligas

Todo sincronizado en la nube y accesible desde ordenador, tablet o móvil.