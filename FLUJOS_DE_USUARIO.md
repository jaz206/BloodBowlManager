# 🗺️ Flujos de Usuario Críticos (UX Flow)

Mapa lógico de los procesos principales que ocurren en **Blood Bowl Manager**.

---

## 1. Flujo de Preparación (El Gremio)
Cómo el usuario construye su leyenda.

### Registro de Nueva Franquicia (Draft)
1. **Entrada**: Página de "Gremio" -> "Crear Equipo".
2. **Selección**: Escoger Facción (Teams Data) y Nombre personalizado.
3. **Reclutamiento**:
   - Añadir jugadores hasta cumplir el mínimo (11) y no exceder el máximo (16).
   - Comprar incentivos permanentes (Rerolls, Medico, Fans).
4. **Validación**: El sistema bloquea el guardado si el TV excede 1,000,000 MO (o el valor inicial configurado).
5. **Cierre**: Se genera el documento del equipo en Firestore (`managedTeams`).

---

## 2. Flujo de Competición (La Arena)
Cómo se organiza la carnicería colectiva.

### Crear e Invitar a una Liga
1. **Configuración**: "Arena" -> "Organización" -> "Nueva Liga".
2. **Reglas**: Seleccionar Formato (Liguilla/Torneo), Visibilidad y Reglas S3.
3. **Invitación**: El sistema genera un link único que contiene el `competitionId`.
4. **Inscripción**: Los rivales abren el link con su equipo seleccionado. El sistema crea una **Copia/Clon** del equipo del rival y lo mete en el array `teams` de la liga.

---

## 3. Flujo de Partido Vivo (Match Center)
La experiencia central de juego.

### Inicio de Encuentro (Match Setup)
1. **Entrada**: "Home" -> "Próximo Encuentro" (Detectado automáticamente).
2. **Carga**: Se recuperan los clones de los equipos de la Liga.
3. **Pre-Game (4 Pasos)**:
   - Paso 1: Añadir Jornaleros (si hay < 11 jugadores).
   - Paso 2: Gastar presupuesto de Incentivos e inducements (Underdog).
   - Paso 3: Sorteo de moneda, Clima inicial y Kickoff.
   - Paso 4: Carga del tablero táctico (MiniField).
4. **Match loop**: Registro de TDs, Bajas y Faltas hasta el fin de turnos.

### Cierre de Acta (Post-Game Wizard)
1. **Recogida**: Suma de TDs y Bajas en la ficha temporal.
2. **Progreso**:
   - Asignación de MVP (3 candidatos).
   - Tirada de Ganancias (Tesorería).
   - Ganancia/Pérdida de Fans Dedicados.
3. **Sincronización**: Los cambios se guardan permanentemente en el **Clon** de la liga y se genera la Crónica del partido en Firestore para "La Gaceta".

---

## 4. Flujo de Progresión (Gestión de Jugadores)
La evolución de las leyendas.

### Subida de Habilidades (Level Up)
1. **Entrada**: "Gremio" -> Ficha de Equipo -> Jugador con SPP suficiente.
2. **Acción**: Seleccionar tipo de avance (Habilidad Primaria, Secundaria o Características).
3. **Gasto**: Cálculo automático de puntos consumidos.
4. **Snapshot**: El sistema crea una "Cápsula de Tiempo" del equipo antes y después de la subida para control de historial.

---

## 🎯 Conclusión para Desarrollo Móvil
Para la App Android, estos flujos deben mapearse a pantallas (`Fragments` o `Compose Screens`). Cada transición de flecha (->) es una navegación que requiere verificar el estado en la base de datos para cargar los datos correctos.
