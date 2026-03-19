# 🩸 Blood Bowl Manager – Funcionalidad de Secciones

Guía detallada del comportamiento y propósito de cada sección de la aplicación **Blood Bowl Assistant** (Actualizada a Versión 2026).

---

## 🏠 I. HOME: EL PORTAL DE ACCESO (ESTADO DE LA ARENA)
Es el centro neurálgico que organiza la sesión del entrenador.

### Funcionalidad Principal: Dashboard Dinámico
- **Selector de Competición**: Desplegable estilizado que filtra todas las ligas/torneos donde el usuario participa.
- **Pestaña de Clasificación**: Tabla rápida con puntos, victorias y récord de la liga elegida.
- **Pestaña de Anotadores (TD)**: Ranking de los 10 mejores anotadores de la competición.
- **Pestaña de Carniceros (CAS)**: Ranking de los 10 jugadores con más bajas causadas.
- **Próximo Encuentro Inteligente**: Panel interactivo que busca el partido pendiente del usuario.
  - **Botón Match Center**: Carga automáticamente el `arenaMatchConfig` con los equipos reales y navega al partido.

---

## ⚔️ II. EL GREMIO DE ENTRENADORES (GESTIÓN)
Centro de control de tus franquicias y equipos.

### Mis Equipos
- **Ficha de Equipo**: Gestión de jugadores con SPP y habilidades.
- **Snapshots (Viaje en el Tiempo)**: Permite guardar estados del equipo y restaurarlos.
- **Pizarra Táctica**: Arrastra y suelta jugadores (MiniField) para diseñar formaciones.

### Crear Equipo (Draft S3)
- **Editor Interactivo**: Compra de jugadores, rerolls, staff e incentivos permanentes.
- **Presupuesto Real**: El sistema calcula el TV (Team Value) y el presupuesto restante en tiempo real.

---

## 📚 III. EL ORÁCULO DE NUFFLE (BIBLIOTECA)
Enciclopedia bilingüe (ES/EN) de conocimiento del Viejo Mundo.

- **Equipos**: Roster oficial con radar chart de MA, ST, AG, PA, AV.
- **Codex de Habilidades**: Diccionario categorizado de todas las habilidades S3.
- **Jugadores Estrella**: Ficha de mercenarios con costes y reglas especiales.
- **Herramientas**: Calculadora de dados 2D6 y Tabla de Incentivos dinámica según TV relativo.

---

## 🏟️ IV. LA ARENA DE LA GLORIA (COMPETICIÓN)
El corazón multijugador y de organización.

### El Sistema de 4 Pestañas
1. **Mis Ligas**: Solo competiciones de formato Liguilla con tu equipo dentro.
2. **Mis Torneos**: Solo brackets y eliminatorias con tu equipo dentro.
3. **Descubrir**: Buscador de competiciones públicas abiertas a inscripción.
4. **Organización**: El panel de mando para fundadores de ligas.
   - Herramientas: Invitar participantes, Editar calendario, Eliminar liga.

### La Gaceta (Periódico Deportivo)
- **Feed de Noticias**: Lista cronológica de crónicas generadas por el sistema o redactadas por el administrador.
- **Redactor de Crónicas**: Modal dedicado para que el dueño de la liga publique crónicas manuales.
- **Resultados Históricos**: Visualización del acta del partido en formato prensa antigua.

### Estadísticas de Competición
- **Ranking Interno**: Seguimiento del Top 10 de jugadores locales por touchdowns y bajas producidas dentro de esa liga específica.

---

## 🎯 Objetivo Global del Sistema
Centralizar la experiencia de Blood Bowl: de la consulta de una regla rápida en el Oráculo al inicio de un partido directo de liga desde la Home, cerrando el ciclo con la publicación de la crónica en La Gaceta.