# 🩸 BITÁCORA DE CAMPAÑA: BLOOD BOWL MANAGER 🩸

Bienvenido, Entrenador. Este tomo contiene el registro sagrado de la construcción del **Asistente Digital de Blood Bowl**, una herramienta forjada en las fraguas de la tecnología moderna para llevar la gloria (y la carnicería) al campo de juego. Aquí documentamos cada táctica, cada formación y cada gota de sudor invertida en este proyecto.

---

## 🛠️ PORTAL DE PODER (Plataforma y Tecnologías)
Nuestra fortaleza ha sido construida con los materiales más resistentes del reino digital:

*   **El Corazón (Framework)**: [React 19](https://react.dev/) con el rayo de [Vite](https://vitejs.dev/) para una velocidad de carga de vértigo.
*   **La Mente (Lenguaje)**: [TypeScript](https://www.typescriptlang.org/), asegurando que cada orden sea precisa y sin errores de bulto.
*   **El Archivo (Base de Datos)**: [Firebase Firestore](https://firebase.google.com/), donde las leyendas de los equipos quedan grabadas en la eternidad del servidor.
*   **La Armadura (Estilo)**: [Tailwind CSS](https://tailwindcss.com/) con tonalidades Amber y Slate para ese aspecto premium de las ligas mayores.
*   **El Almacén (Storage)**: [Firebase Storage](https://firebase.google.com/) para guardar los estandartes y escudos de cada facción.

---

## 🎯 OBJETIVO DE LA MISIÓN
En el caos del Blood Bowl, la información es poder. Este proyecto resuelve el problema de la desinformación en el banquillo, aportando:
1.  **Sabiduría Instantánea**: Consulta de reglas, tiers y rosters de todas las facciones oficiales (Temporada 2020).
2.  **Estrategia Dinámica**: Gráficos de radar para visualizar las fortalezas y debilidades de cada equipo.
3.  **Gestión de Leyendas**: Capacidad para que un Comisionado (Admin) actualice los registros y escudos en tiempo real para todos los entrenadores del reino.

---

## 🏛️ ARQUITECTURA DEL ESTADIO (Estructura del Proyecto)

```text
root/
├── components/          # Las gradas y el campo: Componentes visuales de la interfaz.
│   ├── Teams.tsx        # El Gran Estadio: Visualización de todas las facciones.
│   ├── Skills.tsx       # El Manual de Tácticas: Listado de todas las habilidades.
│   └── TeamCreator.tsx  # El Centro de Reclutamiento: Forja de nuevos equipos.
├── data/                # Los Textos Antiguos: Datos estáticos de respaldo.
│   ├── teams.ts         # Registros locales de las facciones.
│   └── skills.ts        # Diccionario local de habilidades.
├── hooks/               # Las Maniobras de Juego: Lógica reutilizable y estados.
│   └── useMasterData.ts # El Mensajero: Sincroniza la voluntad de Firebase con la UI.
├── contexts/            # El Aura del Vestuario: Estados globales como la Autentificación.
├── firebaseConfig.ts    # El Contrato con los Dioses: Configuración de la conexión a Firebase.
└── types.ts             # El Código de Honor: Definiciones de interfaces y tipos.
```

---

## ⚔️ CÓMO FUNCIONA EL JUEGO (Flujo de Sesión)

1.  **Invocación**: El Entrenador entra en la aplicación y es recibido por el muro de escudos.
2.  **Exploración**: Se filtran los equipos por nombre para encontrar la facción deseada.
3.  **Consulta de Roster**: Se despliega el pergamino del equipo, mostrando costes y habilidades (con descripciones traducidas del inglés antiguo).
4.  **Intervención Divina (Admin)**: Si el usuario tiene rango de Comisionado, puede cambiar el escudo de un equipo o sincronizar los registros maestros con un solo clic.

---

## 📜 REGISTRO DE CAMBIOS (Hitos Importantes)

### [2026-03-06] El Gran Despertar del Comisionado
*   **Gestión Maestra**: Migración de datos estáticos a **Firebase Firestore**. Ahora los equipos viven en la nube.
*   **Estandartes Dinámicos**: Implementación de **Firebase Storage** para subir imágenes de escudos desde el dispositivo.
*   **Mantenimiento de Campo**: Se solventaron errores de importación que bloqueaban el despliegue en Vercel.
*   **Visión de Águila**: Añadido buscador en las vistas de Equipos y Habilidades.
*   *Archivos Afectados*: `useMasterData.ts`, `Teams.tsx`, `firebaseConfig.ts`, `Skills.tsx`.

### [2026-03-06] El Oráculo de Nuffle y la Crónica de la Arena
*   **Crónica en Vivo**: Implementación de **MatchNarrator.tsx**, un cronista épico impulsado por las sombras de Nuffle que genera relatos heroicos de cada partido en tiempo real.
*   **La Arena de la Gloria**: Refactorización completa de **GameBoard.tsx** para incluir gestión de turnos, eventos de campo (Touchdowns, Heridas, Faltas) y un sistema de pestañas para alternar entre el Asistente Técnico y la Narración Épica.
*   **Sincronización Divina**: El Panel de Administración ahora permite la sincronización masiva de datos maestros (equipos, estrellas, incentivos) con Firestore mediante un solo botón, resolviendo conflictos de tipos y garantizando coherencia en el reino.
*   **Código de Honor Reforzado**: Actualización masiva de **types.ts** para dar soporte a parejas de Jugadores Estrella, estados de clima y acciones de puntos de estrellato (PE).
*   *Archivos Afectados*: `GameBoard.tsx`, `MatchNarrator.tsx`, `AdminPanel.tsx`, `types.ts`, `useMasterData.ts`.

### [2026-03-07] La Gran Forja de Rutas y Tipos
*   **Reestructuración del Reino**: Refactorización masiva de importaciones para adaptarse a la nueva arquitectura dividida en `Arena`, `Gremio` y `Oráculo`.
*   **Código de Honor Unificado**: Centralización y expansión de `types.ts`. Se han forjado nuevos contratos para Plegarias, Progresión de Jugadores (`Advancement`), y la Pizarra Táctica (`Token`, `PlayerPosition`).
*   **Estabilidad en el Campo**: Corrección de componentes críticos como `MatchPage.tsx`, `TacticalBoardPage.tsx`, `TeamDetailPage.tsx` y `PostGameWizard.tsx`.
*   **Limpieza de Arsenales**: Eliminación de duplicados y reubicación de `MiniField.tsx` a `components/common/`.
*   **Sincronización Divina Forzada**: Se ha ajustado la configuración de Git (`core.ignorecase false`) y reseteado la caché para asegurar que Vercel respete la sensibilidad de mayúsculas en los nombres de archivos y carpetas.
*   *Archivos Afectados*: `types.ts`, `MatchPage.tsx`, `TacticalBoardPage.tsx`, `TeamDetailPage.tsx`, `PostGameWizard.tsx`, `ApothecaryModal.tsx`, `MiniField.tsx`, `PlayerStatusCard.tsx`, y múltiples componentes en `oracle`, `guild` y `shared`.

### [2026-03-07] La Torre de Babel (Internacionalización)
*   **Motor de Lenguaje**: Creación de `LanguageContext.tsx` y `LanguageProvider` para gestionar el estado del idioma (Español/Inglés) de forma global, con persistencia en `localStorage` y detección automática del navegador.
*   **Selector de Estandarte**: Implementación del componente `LanguageSelector.tsx` en la cabecera, permitiendo a los entrenadores alternar entre idiomas con una interfaz premium.
*   **Traducción Maestra**: Creación y traducción completa de los diccionarios de datos: `skills_es.ts`, `skills_en.ts`, `inducements_en.ts`. Ahora las descripciones de habilidades e incentivos son 100% legibles en ambos idiomas.
*   **IU Localizada**: Integración de la función `t()` en componentes clave: `MainApp`, `OraclePage`, `SkillsPage`, `StarPlayersPage`, e `InducementTable`.
*   *Archivos Afectados*: `LanguageContext.tsx`, `LanguageSelector.tsx`, `MainApp.tsx`, `useMasterData.ts`, `skills_es.ts`, `skills_en.ts`, `inducements_en.ts`, y las páginas del Oráculo.

### [2026-03-08] El Renacer del Estadio (Rediseño de Inicio)
*   **Nueva Experiencia de Inicio**: Rediseño total de `pages/Home/index.tsx` con una estética de "Alta Fantasía". Incluye una sección Hero dinámica con imágenes épicas y botones premium.
*   **Acceso Rápido**: Implementación de tarjetas de acceso estilizadas para el Oráculo, el Gremio y la Arena, mejorando la usabilidad y el flujo visual.
*   **Cimientos Visuales**: Adición de las fuentes **Inter** y **Material Symbols** en `index.html` para un look moderno y profesional.
*   **Estructura Completa**: Incorporación de un **Footer** (pie de página) en `MainApp.tsx` con enlaces de soporte y créditos, cerrando el ciclo de diseño de la aplicación.
*   **Internacionalización de Inicio**: Integración de todas las nuevas cadenas de texto en `LanguageContext.tsx` para soporte bilingüe completo en la página principal.
*   *Archivos Afectados*: `Home/index.tsx`, `MainApp.tsx`, `index.html`, `LanguageContext.tsx`, `BITACORA.md`.

### [2026-03-08] El Draft de Nuffle (Nuevo Sistema de Creación)
*   **Experiencia de Reclutamiento Integrada**: Rediseño de `CreateTeamPage.tsx` para permitir el reclutamiento completo de jugadores durante la creación del equipo.
*   **Gestión de Bienes**: Añadida la lógica para comprar Segundas Oportunidades, Médicos, Fans y Staff (Asistentes y Animadoras) con cálculo de presupuesto en tiempo real.
*   **Resumen Dinámico**: Panel lateral de "Resumen de Valor" que muestra el presupuesto restante, el Team Value acumulado y la lista de jugadores contratados.
*   **Estéticas de Alta Fantasía**: Aplicación del diseño premium con bordes de bronce, fondos de cristal oscuro y tipografía optimizada (MA, ST, AG, PA, AV).
*   **Internacionalización Completa**: Soporte bilingüe para todas las etiquetas del proceso de draft.
*   *Archivos Afectados*: `CreateTeamPage.tsx`, `LanguageContext.tsx`, `BITACORA.md`.

### [2026-03-08] El Oráculo de Nuffle (Hub de Sabiduría)
*   **Portal Centralizado**: Rediseño integral de `Oracle/index.tsx` creando un "Hub" de sabiduría que organiza el acceso a equipos, habilidades y calculadoras.
*   **Oracle Dice & Incentivos**: Implementación de tarjetas dinámicas con gradientes premium para el cálculo de probabilidades y la tabla de incentivos.
*   **Codex de Habilidades**: Nuevo flujo de navegación para el Codex, con etiquetas de categoría y previsualización rápida.
*   **Estéticas de Alta Fantasía**: Uso extensivo de glassmorphism, gradientes **premium-gold** y animaciones fluidas con **Framer Motion**.
*   **Internacionalización Robusta**: Implementación de soporte bilingüe completo para todas las nuevas secciones del Hub.
*   *Archivos Afectados*: `Oracle/index.tsx`, `LanguageContext.tsx`, `BITACORA.md`.

### [2026-03-09] Auditoría UI/UX - Sprint 1, 2 & 3
*   **Reestilizado de Ligas**: Transformación total de `LeaguesPage.tsx` a la estética Dark Fantasy (zinc-900, premium-gold, glassmorphism).
*   **Sistema de Modales Premium**: Sustitución de todos los `alert()` nativos en la aplicación por un sistema de modales de confirmación integrado y animado. Eliminación de `alert()` en `GuildPage`, `LeaguesPage` y el resto de flujos.
*   **Sistema de Toasts**: Nuevo componente de notificación temporal (toast) en el Gremio para confirmar acciones sin interrumpir el flujo del usuario (crear equipo, importar, exportar).
*   **Buscador Global**: Conexión del buscador de la Home con el Oráculo, con soporte bilingüe en las etiquetas sugeridas.
*   **Refinamiento de Navegación**: Botones de "Volver" mejorados con animaciones hover, corrección de enlaces rotos en la sección Hero.
*   **Llamadas a la Acción (CTA)**: Mejora de los estados vacíos en la Home y el Gremio con invitaciones directas a la creación de equipos.
*   **Banner de Invitado Inmersivo**: Rediseño del aviso de invitado como píldora flotante no intrusiva con efecto glassmorphism.
*   *Archivos Afectados*: `LeaguesPage.tsx`, `Guild/index.tsx`, `MainApp.tsx`, `Home/index.tsx`, `SkillsPage.tsx`, `LanguageContext.tsx`.

### [2026-03-09] La Gran Corrección de Datos (Rosters y Encoding)
*   **Encoding Limpio**: Corrección masiva de mojibake en `data/teams.ts`. Todos los caracteres especiales (tildes, eñes) ahora se muestran correctamente en la UI (`"LÃ­nea"` → `"Línea"`, etc.).
*   **Elegidos del Caos — Roster Completo**: Añadidas las posiciones faltantes: `Marauder Línea`, `Beastman Renegado` (Horns), y `Chaos Minotauro` (Frenzy/Horns/MB/Unchannelled Fury).
*   **Humanos — Blitzer Añadido**: Incorporado `Placador Blitzer` (MV7, Block) siguiendo el rulebook BB2020 oficial. El Halfling Hopeful ahora tiene 0-3 correcto.
*   **Orcos — Roster Fiel a BB2020**: Añadido `Blitzer Orco` (Block, Break Tackle) como posición separada. El `Fortachón Bloqueador` corregido con `Mighty Blow (+1) + Thick Skull` (sin `Tackle` que es del Placador). Eliminada la posición duplicada "Placador" de Orcos.
*   **Vampiros — Bug Secondary Corregido**: La posición `Vampiros Placador` tenía `secondary: "110000"` (coste colado por error). Corregido a `secondary: "P"`.
*   **Habitantes del Inframundo — Traducción**: `specialRules` traducido a español.
*   *Archivos Afectados*: `data/teams.ts`, `scripts/fix_encoding.cjs` (nuevo).

---
### [2026-03-12] Gestión Masiva y Crónicas de Nuffle
*   **Exportación/Importación CSV**: Implementado sistema de gestión masiva en el Panel de Administración. Incluye botones de exportación (Teams/Stars) e importación con **barra de progreso real** y manejo de errores fila por fila.
*   **Sincronización de Partidos**: Optimización de la consulta de Firestore para reportes (`createdAt` desc) y adición de **actualizaciones optimistas** para feedback instantáneo al cerrar partidos.
*   **El Cronista de Nuffle (News Edition)**: Implementación de `newsGenerator.ts`, un motor narrativo que generates titulares y artículos estilo periódico deportivo basados en los eventos reales del partido.
*   **Rediseño de Reportes**: Actualización de `MatchSummaryModal` con estética de periódico antiguo (fuentes serif, capitulares, dos columnas) para visualizar la crónica del encuentro.
*   **Self-Healing Post-Game**: Corrección de error crítico `localeCompare` en la asignación de habilidades post-partido mediante validación de tipos y fallbacks seguros.
*   *Archivos Afectados*: `AdminPanel.tsx`, `MatchPage.tsx`, `PostGameWizard.tsx`, `newsGenerator.ts`, `types.ts`, `MainApp.tsx`.

### [2026-03-12] Estabilidad de la Arena y Corrección de Datos
*   **Limpieza de Standing**: Corregido un error de cálculo en `LeaguesPage.tsx` donde los Touchdowns a favor se comparaban contra sí mismos en lugar de contra los recibidos en la lógica de desempate.
*   **Blindaje contra Nulls (Sorting)**: Implementada una capa de seguridad en todas las funciones de ordenación (`sort`) que utilizan `localeCompare`. Ahora el sistema maneja de forma segura valores `undefined` o `null` en nombres de habilidades, equipos y estrellas, evitando crashes en el Admin Panel y el Wizard Post-Partido.
*   **Sincronización de Habilidades**: Refinada la lógica de visualización de habilidades en el Panel de Administración para asegurar que se use el nombre localizado (ES/EN) correctamente según el idioma del usuario.
*   *Archivos Afectados*: `LeaguesPage.tsx`, `AdminPanel.tsx`, `PostGameWizard.tsx` (Guild & Arena), `TeamsPage.tsx`.

### [2026-03-14] El Cronista de Nuffle (Edición de Oro)
*   **Narrativa "Diario Marca"**: Refactorización del motor de crónicas (`newsGenerator.ts` y `MatchNarrator.tsx`) para generar artículos con una estética periodística premium, titulares dinámicos y secciones estructuradas por eventos (Touchdowns, Heridas, Faltas).
*   **Persistencia de Relato**: Implementación de memoria de estado en el `MatchPage` para que las crónicas generadas no se pierdan al cambiar de pestaña.
*   **Archivo Histórico**: Vinculación total de las crónicas con la colección `matchReports` de Firestore, permitiendo consultar el artículo completo de partidos pasados desde la sección Arena.
*   **Limpieza de Campo**: Eliminación del footer global para evitar solapamientos con las barras de navegación fijas y uso de React Portals para el Post-Game Wizard, garantizando su visibilidad total.
*   *Archivos Afectados*: `MatchNarrator.tsx`, `MatchPage.tsx`, `newsGenerator.ts`, `MainApp.tsx`, `PostGameWizard.tsx`.
# 🩸 BITÁCORA DE CAMPAÑA: BLOOD BOWL MANAGER 🩸

Bienvenido, Entrenador. Este tomo contiene el registro sagrado de la construcción del **Asistente Digital de Blood Bowl**, una herramienta forjada en las fraguas de la tecnología moderna para llevar la gloria (y la carnicería) al campo de juego. Aquí documentamos cada táctica, cada formación y cada gota de sudor invertida en este proyecto.

---

## 🛠️ PORTAL DE PODER (Plataforma y Tecnologías)
Nuestra fortaleza ha sido construida con los materiales más resistentes del reino digital:

*   **El Corazón (Framework)**: [React 19](https://react.dev/) con el rayo de [Vite](https://vitejs.dev/) para una velocidad de carga de vértigo.
*   **La Mente (Lenguaje)**: [TypeScript](https://www.typescriptlang.org/), asegurando que cada orden sea precisa y sin errores de bulto.
*   **El Archivo (Base de Datos)**: [Firebase Firestore](https://firebase.google.com/), donde las leyendas de los equipos quedan grabadas en la eternidad del servidor.
*   **La Armadura (Estilo)**: [Tailwind CSS](https://tailwindcss.com/) con tonalidades Amber y Slate para ese aspecto premium de las ligas mayores.
*   **El Almacén (Storage)**: [Firebase Storage](https://firebase.google.com/) para guardar los estandartes y escudos de cada facción.

---

## 🎯 OBJETIVO DE LA MISIÓN
En el caos del Blood Bowl, la información es poder. Este proyecto resuelve el problema de la desinformación en el banquillo, aportando:
1.  **Sabiduría Instantánea**: Consulta de reglas, tiers y rosters de todas las facciones oficiales (Temporada 2020).
2.  **Estrategia Dinámica**: Gráficos de radar para visualizar las fortalezas y debilidades de cada equipo.
3.  **Gestión de Leyendas**: Capacidad para que un Comisionado (Admin) actualice los registros y escudos en tiempo real para todos los entrenadores del reino.

---

## 🏛️ ARQUITECTURA DEL ESTADIO (Estructura del Proyecto)

```text
root/
├── components/          # Las gradas y el campo: Componentes visuales de la interfaz.
│   ├── Teams.tsx        # El Gran Estadio: Visualización de todas las facciones.
│   ├── Skills.tsx       # El Manual de Tácticas: Listado de todas las habilidades.
│   └── TeamCreator.tsx  # El Centro de Reclutamiento: Forja de nuevos equipos.
├── data/                # Los Textos Antiguos: Datos estáticos de respaldo.
│   ├── teams.ts         # Registros locales de las facciones.
│   └── skills.ts        # Diccionario local de habilidades.
├── hooks/               # Las Maniobras de Juego: Lógica reutilizable y estados.
│   └── useMasterData.ts # El Mensajero: Sincroniza la voluntad de Firebase con la UI.
├── contexts/            # El Aura del Vestuario: Estados globales como la Autentificación.
├── firebaseConfig.ts    # El Contrato con los Dioses: Configuración de la conexión a Firebase.
└── types.ts             # El Código de Honor: Definiciones de interfaces y tipos.
```

---

## ⚔️ CÓMO FUNCIONA EL JUEGO (Flujo de Sesión)

1.  **Invocación**: El Entrenador entra en la aplicación y es recibido por el muro de escudos.
2.  **Exploración**: Se filtran los equipos por nombre para encontrar la facción deseada.
3.  **Consulta de Roster**: Se despliega el pergamino del equipo, mostrando costes y habilidades (con descripciones traducidas del inglés antiguo).
4.  **Intervención Divina (Admin)**: Si el usuario tiene rango de Comisionado, puede cambiar el escudo de un equipo o sincronizar los registros maestros con un solo clic.

---

## 📜 REGISTRO DE CAMBIOS (Hitos Importantes)

### [2026-03-06] El Gran Despertar del Comisionado
*   **Gestión Maestra**: Migración de datos estáticos a **Firebase Firestore**. Ahora los equipos viven en la nube.
*   **Estandartes Dinámicos**: Implementación de **Firebase Storage** para subir imágenes de escudos desde el dispositivo.
*   **Mantenimiento de Campo**: Se solventaron errores de importación que bloqueaban el despliegue en Vercel.
*   **Visión de Águila**: Añadido buscador en las vistas de Equipos y Habilidades.
*   *Archivos Afectados*: `useMasterData.ts`, `Teams.tsx`, `firebaseConfig.ts`, `Skills.tsx`.

### [2026-03-06] El Oráculo de Nuffle y la Crónica de la Arena
*   **Crónica en Vivo**: Implementación de **MatchNarrator.tsx**, un cronista épico impulsado por las sombras de Nuffle que genera relatos heroicos de cada partido en tiempo real.
*   **La Arena de la Gloria**: Refactorización completa de **GameBoard.tsx** para incluir gestión de turnos, eventos de campo (Touchdowns, Heridas, Faltas) y un sistema de pestañas para alternar entre el Asistente Técnico y la Narración Épica.
*   **Sincronización Divina**: El Panel de Administración ahora permite la sincronización masiva de datos maestros (equipos, estrellas, incentivos) con Firestore mediante un solo botón, resolviendo conflictos de tipos y garantizando coherencia en el reino.
*   **Código de Honor Reforzado**: Actualización masiva de **types.ts** para dar soporte a parejas de Jugadores Estrella, estados de clima y acciones de puntos de estrellato (PE).
*   *Archivos Afectados*: `GameBoard.tsx`, `MatchNarrator.tsx`, `AdminPanel.tsx`, `types.ts`, `useMasterData.ts`.

### [2026-03-07] La Gran Forja de Rutas y Tipos
*   **Reestructuración del Reino**: Refactorización masiva de importaciones para adaptarse a la nueva arquitectura dividida en `Arena`, `Gremio` y `Oráculo`.
*   **Código de Honor Unificado**: Centralización y expansión de `types.ts`. Se han forjado nuevos contratos para Plegarias, Progresión de Jugadores (`Advancement`), y la Pizarra Táctica (`Token`, `PlayerPosition`).
*   **Estabilidad en el Campo**: Corrección de componentes críticos como `MatchPage.tsx`, `TacticalBoardPage.tsx`, `TeamDetailPage.tsx` y `PostGameWizard.tsx`.
*   **Limpieza de Arsenales**: Eliminación de duplicados y reubicación de `MiniField.tsx` a `components/common/`.
*   **Sincronización Divina Forzada**: Se ha ajustado la configuración de Git (`core.ignorecase false`) y reseteado la caché para asegurar que Vercel respete la sensibilidad de mayúsculas en los nombres de archivos y carpetas.
*   *Archivos Afectados*: `types.ts`, `MatchPage.tsx`, `TacticalBoardPage.tsx`, `TeamDetailPage.tsx`, `PostGameWizard.tsx`, `ApothecaryModal.tsx`, `MiniField.tsx`, `PlayerStatusCard.tsx`, y múltiples componentes en `oracle`, `guild` y `shared`.

### [2026-03-07] La Torre de Babel (Internacionalización)
*   **Motor de Lenguaje**: Creación de `LanguageContext.tsx` y `LanguageProvider` para gestionar el estado del idioma (Español/Inglés) de forma global, con persistencia en `localStorage` y detección automática del navegador.
*   **Selector de Estandarte**: Implementación del componente `LanguageSelector.tsx` en la cabecera, permitiendo a los entrenadores alternar entre idiomas con una interfaz premium.
*   **Traducción Maestra**: Creación y traducción completa de los diccionarios de datos: `skills_es.ts`, `skills_en.ts`, `inducements_en.ts`. Ahora las descripciones de habilidades e incentivos son 100% legibles en ambos idiomas.
*   **IU Localizada**: Integración de la función `t()` en componentes clave: `MainApp`, `OraclePage`, `SkillsPage`, `StarPlayersPage`, e `InducementTable`.
*   *Archivos Afectados*: `LanguageContext.tsx`, `LanguageSelector.tsx`, `MainApp.tsx`, `useMasterData.ts`, `skills_es.ts`, `skills_en.ts`, `inducements_en.ts`, y las páginas del Oráculo.

### [2026-03-08] El Renacer del Estadio (Rediseño de Inicio)
*   **Nueva Experiencia de Inicio**: Rediseño total de `pages/Home/index.tsx` con una estética de "Alta Fantasía". Incluye una sección Hero dinámica con imágenes épicas y botones premium.
*   **Acceso Rápido**: Implementación de tarjetas de acceso estilizadas para el Oráculo, el Gremio y la Arena, mejorando la usabilidad y el flujo visual.
*   **Cimientos Visuales**: Adición de las fuentes **Inter** y **Material Symbols** en `index.html` para un look moderno y profesional.
*   **Estructura Completa**: Incorporación de un **Footer** (pie de página) en `MainApp.tsx` con enlaces de soporte y créditos, cerrando el ciclo de diseño de la aplicación.
*   **Internacionalización de Inicio**: Integración de todas las nuevas cadenas de texto en `LanguageContext.tsx` para soporte bilingüe completo en la página principal.
*   *Archivos Afectados*: `Home/index.tsx`, `MainApp.tsx`, `index.html`, `LanguageContext.tsx`, `BITACORA.md`.

### [2026-03-08] El Draft de Nuffle (Nuevo Sistema de Creación)
*   **Experiencia de Reclutamiento Integrada**: Rediseño de `CreateTeamPage.tsx` para permitir el reclutamiento completo de jugadores durante la creación del equipo.
*   **Gestión de Bienes**: Añadida la lógica para comprar Segundas Oportunidades, Médicos, Fans y Staff (Asistentes y Animadoras) con cálculo de presupuesto en tiempo real.
*   **Resumen Dinámico**: Panel lateral de "Resumen de Valor" que muestra el presupuesto restante, el Team Value acumulado y la lista de jugadores contratados.
*   **Estéticas de Alta Fantasía**: Aplicación del diseño premium con bordes de bronce, fondos de cristal oscuro y tipografía optimizada (MA, ST, AG, PA, AV).
*   **Internacionalización Completa**: Soporte bilingüe para todas las etiquetas del proceso de draft.
*   *Archivos Afectados*: `CreateTeamPage.tsx`, `LanguageContext.tsx`, `BITACORA.md`.

### [2026-03-08] El Oráculo de Nuffle (Hub de Sabiduría)
*   **Portal Centralizado**: Rediseño integral de `Oracle/index.tsx` creando un "Hub" de sabiduría que organiza el acceso a equipos, habilidades y calculadoras.
*   **Oracle Dice & Incentivos**: Implementación de tarjetas dinámicas con gradientes premium para el cálculo de probabilidades y la tabla de incentivos.
*   **Codex de Habilidades**: Nuevo flujo de navegación para el Codex, con etiquetas de categoría y previsualización rápida.
*   **Estéticas de Alta Fantasía**: Uso extensivo de glassmorphism, gradientes **premium-gold** y animaciones fluidas con **Framer Motion**.
*   **Internacionalización Robusta**: Implementación de soporte bilingüe completo para todas las nuevas secciones del Hub.
*   *Archivos Afectados*: `Oracle/index.tsx`, `LanguageContext.tsx`, `BITACORA.md`.

### [2026-03-09] Auditoría UI/UX - Sprint 1, 2 & 3
*   **Reestilizado de Ligas**: Transformación total de `LeaguesPage.tsx` a la estética Dark Fantasy (zinc-900, premium-gold, glassmorphism).
*   **Sistema de Modales Premium**: Sustitución de todos los `alert()` nativos en la aplicación por un sistema de modales de confirmación integrado y animado. Eliminación de `alert()` en `GuildPage`, `LeaguesPage` y el resto de flujos.
*   **Sistema de Toasts**: Nuevo componente de notificación temporal (toast) en el Gremio para confirmar acciones sin interrumpir el flujo del usuario (crear equipo, importar, exportar).
*   **Buscador Global**: Conexión del buscador de la Home con el Oráculo, con soporte bilingüe en las etiquetas sugeridas.
*   **Refinamiento de Navegación**: Botones de "Volver" mejorados con animaciones hover, corrección de enlaces rotos en la sección Hero.
*   **Llamadas a la Acción (CTA)**: Mejora de los estados vacíos en la Home y el Gremio con invitaciones directas a la creación de equipos.
*   **Banner de Invitado Inmersivo**: Rediseño del aviso de invitado como píldora flotante no intrusiva con efecto glassmorphism.
*   *Archivos Afectados*: `LeaguesPage.tsx`, `Guild/index.tsx`, `MainApp.tsx`, `Home/index.tsx`, `SkillsPage.tsx`, `LanguageContext.tsx`.

### [2026-03-09] La Gran Corrección de Datos (Rosters y Encoding)
*   **Encoding Limpio**: Corrección masiva de mojibake en `data/teams.ts`. Todos los caracteres especiales (tildes, eñes) ahora se muestran correctamente en la UI (`"LÃ­nea"` → `"Línea"`, etc.).
*   **Elegidos del Caos — Roster Completo**: Añadidas las posiciones faltantes: `Marauder Línea`, `Beastman Renegado` (Horns), y `Chaos Minotauro` (Frenzy/Horns/MB/Unchannelled Fury).
*   **Humanos — Blitzer Añadido**: Incorporado `Placador Blitzer` (MV7, Block) siguiendo el rulebook BB2020 oficial. El Halfling Hopeful ahora tiene 0-3 correcto.
*   **Orcos — Roster Fiel a BB2020**: Añadido `Blitzer Orco` (Block, Break Tackle) como posición separada. El `Fortachón Bloqueador` corregido con `Mighty Blow (+1) + Thick Skull` (sin `Tackle` que es del Placador). Eliminada la posición duplicada "Placador" de Orcos.
*   **Vampiros — Bug Secondary Corregido**: La posición `Vampiros Placador` tenía `secondary: "110000"` (coste colado por error). Corregido a `secondary: "P"`.
*   **Habitantes del Inframundo — Traducción**: `specialRules` traducido a español.
*   *Archivos Afectados*: `data/teams.ts`, `scripts/fix_encoding.cjs` (nuevo).

---
### [2026-03-12] Gestión Masiva y Crónicas de Nuffle
*   **Exportación/Importación CSV**: Implementado sistema de gestión masiva en el Panel de Administración. Incluye botones de exportación (Teams/Stars) e importación con **barra de progreso real** y manejo de errores fila por fila.
*   **Sincronización de Partidos**: Optimización de la consulta de Firestore para reportes (`createdAt` desc) y adición de **actualizaciones optimistas** para feedback instantáneo al cerrar partidos.
*   **El Cronista de Nuffle (News Edition)**: Implementación de `newsGenerator.ts`, un motor narrativo que generates titulares y artículos estilo periódico deportivo basados en los eventos reales del partido.
*   **Rediseño de Reportes**: Actualización de `MatchSummaryModal` con estética de periódico antiguo (fuentes serif, capitulares, dos columnas) para visualizar la crónica del encuentro.
*   **Self-Healing Post-Game**: Corrección de error crítico `localeCompare` en la asignación de habilidades post-partido mediante validación de tipos y fallbacks seguros.
*   *Archivos Afectados*: `AdminPanel.tsx`, `MatchPage.tsx`, `PostGameWizard.tsx`, `newsGenerator.ts`, `types.ts`, `MainApp.tsx`.

### [2026-03-12] Estabilidad de la Arena y Corrección de Datos
*   **Limpieza de Standing**: Corregido un error de cálculo en `LeaguesPage.tsx` donde los Touchdowns a favor se comparaban contra sí mismos en lugar de contra los recibidos en la lógica de desempate.
*   **Blindaje contra Nulls (Sorting)**: Implementada una capa de seguridad en todas las funciones de ordenación (`sort`) que utilizan `localeCompare`. Ahora el sistema maneja de forma segura valores `undefined` o `null` en nombres de habilidades, equipos y estrellas, evitando crashes en el Admin Panel y el Wizard Post-Partido.
*   **Sincronización de Habilidades**: Refinada la lógica de visualización de habilidades en el Panel de Administración para asegurar que se use el nombre localizado (ES/EN) correctamente según el idioma del usuario.
*   *Archivos Afectados*: `LeaguesPage.tsx`, `AdminPanel.tsx`, `PostGameWizard.tsx` (Guild & Arena), `TeamsPage.tsx`.

### [2026-03-14] El Cronista de Nuffle (Edición de Oro)
*   **Narrativa "Diario Marca"**: Refactorización del motor de crónicas (`newsGenerator.ts` y `MatchNarrator.tsx`) para generar artículos con una estética periodística premium, titulares dinámicos y secciones estructuradas por eventos (Touchdowns, Heridas, Faltas).
*   **Persistencia de Relato**: Implementación de memoria de estado en el `MatchPage` para que las crónicas generadas no se pierdan al cambiar de pestaña.
*   **Archivo Histórico**: Vinculación total de las crónicas con la colección `matchReports` de Firestore, permitiendo consultar el artículo completo de partidos pasados desde la sección Arena.
*   **Limpieza de Campo**: Eliminación del footer global para evitar solapamientos con las barras de navegación fijas y uso de React Portals para el Post-Game Wizard, garantizando su visibilidad total.
*   *Archivos Afectados*: `MatchNarrator.tsx`, `MatchPage.tsx`, `newsGenerator.ts`, `MainApp.tsx`, `PostGameWizard.tsx`.

### 15 de Marzo, 2026: Evolución Season 3 — Élite, Triquiñuelas y Crónicas de Cabalvisión
*   **Habilidades de Élite**: Implementado el recargo de **+10,000 MO** en la Valoración de Equipo (VAE) para las habilidades *Placar (Block)*, *Esquivar (Dodge)*, *Defensa (Guard)* y *Golpe mortífero (Mighty Blow)*, siguiendo la normativa de la Temporada 3.
*   **Categoría Triquiñuelas (T)**: Incorporación de 12 nuevas habilidades especializadas (Agresor Discreto, Crujir, Dejada, Falta Rápida, etc.) en el Oráculo y la base de datos bilingüe.
*   **Crónicas de Cabalvisión**: Refactorización del motor narrativo (`newsGenerator.ts` y `MatchNarrator.tsx`) para adoptar un estilo de cronista veterano. Los eventos técnicos ahora se transforman en relatos épicos y viscerales, eliminando tecnicismos como "tirada" o "dado".
*   **Blindaje de Estabilidad**: Solución a errores críticos `TypeError` que causaban crashes al entrar en la Arena o calcular el valor de equipos sin reglas especiales definidas.
*   **Lógica de Concesión BB2025**: Implementación total del protocolo de rendición. Los equipos que conceden reciben **0 ganancias** y pierden **1D3 Fans Dedicados**, mientras que el ganador obtiene un MVP adicional.
*   **Normalización de Formatos**: Sincronización de las verificaciones de habilidades para soportar tanto el nuevo sistema de claves (`skillKeys`) como el antiguo formato de cadenas, garantizando compatibilidad total.
*   *Archivos Afectados*: `newsGenerator.ts`, `MatchNarrator.tsx`, `utils/teamUtils.ts`, `MatchPage.tsx`, `types.ts`, `data/skills.ts`, `BITACORA.md`.

### 15 de Marzo, 2026: Línea de Tiempo y Estados de la S3 (Arena & Gremio)
*   **Línea de Tiempo del Gremio**: Implementación de un sistema de "Cápsulas de Tiempo" (Snapshots) que permite a los entrenadores guardar el estado exacto de su equipo (jugadores, tesorería, staff) y restaurarlo en el futuro.
*   **Gestión de Snapshots**: Interfaz premium en la ficha de equipo con previsualización de datos históricos y modal de confirmación épico ("Viaje en el Tiempo").
*   **Estados Season 3 (S3)**: Implementación de los estados *Distraído* (Aura roja) e *Indigestión* (-1 MV, -1 AR) con indicadores visuales interactivos.
*   **Snapshots en Amistosos**: Integración del selector de snapshots en la Arena.

### [2026-03-16] Gran Refactorización de la Arena (Arquitectura Modular)
*   **MatchPage Orchestrator**: Refactorización radical de `MatchPage.tsx`, que pasó de ser un monolito de +3,500 líneas a un orquestador ligero. Ahora utiliza `MatchProvider` para inyectar el estado y delega el renderizado a `MatchOrchestrator.tsx`.
*   **Segmentación del Motor**: Extracción de la lógica de negocio a `pages/Arena/Match/engine/` (`matchEngine.ts`, `injuryEngine.ts`, `foulEngine.ts`, `sppEngine.ts`), permitiendo testeo unitario y claridad en las reglas.
*   **Vistas por Etapa**: División de las fases del partido en componentes independientes en `pages/Arena/Match/views/` (`SelectionStage`, `PreGameStage`, `MatchInProgress`, `PostGameStage`, `ReportsStage`, `KoRecoveryStage`).
*   **Reorganización de Modales**: Reubicación de todos los modales en subcarp`etas semánticas (`rules/`, `system/`, `shared/`) dentro de `components/modals/`, mejorando la mantenibilidad y reduciendo el ruido en el directorio raíz.
*   **Resolución de Bloqueo "Initializing System"**: Corregido el error que impedía cargar la selección de equipo al añadir el caso `setup` en el orquestador y asegurar que las utilidades de cálculo de VAE (`calculateTeamValue`) estén disponibles en el contexto.
*   **Crónicas Históricas**: Refactorización de `MatchSummaryModal.tsx` para permitir la visualización de reportes archivados mediante props, manteniendo la compatibilidad con el modo de juego en vivo vía contexto.
*   **Suministro de Datos Seguro**: Implementación de guards para `managedTeams` y simplificación de importaciones estáticas para evitar problemas de resolución de módulos en el build de producción.
*   **Estabilización del Flujo Pre-Game**: Corregido el bloqueo en "Invocando Equipos..." y "Levantamiento de Muertos" mediante la inicialización automática de equipos en vivo (`liveHomeTeam`/`liveOpponentTeam`), cálculo de incentivos (underdog) y avance forzado al Paso 1 (Centro de Mando) cuando no hay heridos.
*   **Compatibilidad con Vercel (Producción)**: Corregidas más de 20 rutas de importación relativas en los modales y componentes de Arena que causaban fallos en el proceso de build tras la reestructuración de subcarpetas.
*   *Archivos Afectados*: `useMatchState.ts`, `SelectionStage.tsx`, `PreGameStage.tsx`, `MatchOrchestrator.tsx`, y múltiples archivos en `Match/components/modals/`.

### [2026-03-16] Gestor de Ligas Elite y Configuración Avanzada
- **Refinamiento Elite**: Implementación de la interfaz de creación dual-column con soporte interactivo para reglas (Muerte Súbita, Incentivos, Tiempo por Turno).
- **Inscripción del Organizador**: Nuevo sistema de pre-registro que permite al creador de la liga añadir su propio equipo inmediatamente.
- **Vista de Detalle Premium**: Rediseño de la vista de gestión de liga con resumen de reglas y estética de Dark Fantasy.
- **Persistencia de Reglas**: Actualización del sistema de clonación y tipos de datos para asegurar que las configuraciones de liga se mantengan.
- *Archivos Afectados*: `LeaguesPage.tsx`, `types.ts`.

---
¡Por Nuffle, que los dados siempre te favorezcan! 🎲🎲
