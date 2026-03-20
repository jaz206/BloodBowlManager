# 🩸 BITÁCORA DE CAMPAÑA: BLOOD BOWL MANAGER 🩸

Bienvenido, Entrenador. Este tomo contiene el registro sagrado de la construcción del **Asistente Digital de Blood Bowl**, una herramienta forjada en las fraguas de la tecnología moderna para llevar la gloria (y la carnicería) al campo de juego. Aquí documentamos cada táctica, cada formación y cada gota de sudor invertida en este proyecto.

---

## 🛠️ PORTAL DE PODER (Plataforma y Tecnologías)
Nuestra fortaleza ha sido construida con los materiales más resistentes del reino digital:

*   **El Corazón (Framework)**: [React 19](https://react.dev/) con el rayo de [Vite](https://vitejs.dev/) para una velocidad de carga de vértigo.
*   **La Mente (Lenguaje)**: [TypeScript](https://www.typescriptlang.org/), asegurando que cada orden sea precisa y sin errores de bulto.
*   **El Archivo (Base de Datos)**: [Firebase Firestore](https://firebase.google.com/), donde las leyendas de los equipos quedan grabadas en la eternidad del servidor.
*   **La Armadura (Estilo)**: [Tailwind CSS](https://tailwindcss.com/) con tonalidades Amber, Zinc y Slate para ese aspecto premium de las ligas mayores.
*   **El Almacén (Storage)**: [Firebase Storage](https://firebase.google.com/) para guardar los estandartes y escudos de cada facción.

---

## 🎯 OBJETIVO DE LA MISIÓN
En el caos del Blood Bowl, la información es poder. Este proyecto resuelve el problema de la desinformación en el banquillo, aportando:
1.  **Sabiduría Instantánea**: Consulta de reglas, tiers y rosters de todas las facciones oficiales (Temporada 2020/2025).
2.  **Estrategia Dinámica**: Gráficos de radar y pizarras tácticas para visualizar las fortalezas y debilidades.
3.  **Gestión de Leyendas**: Organización de ligas y torneos con seguimiento real de bajas y SPP.

---

## 🏛️ ARQUITECTURA DEL ESTADIO (Estructura del Proyecto)

```text
root/
├── components/          # Las gradas y el campo: Componentes visuales de la interfaz.
│   ├── arena/           # Módulos específicos de la gestión de partidos.
│   ├── shared/          # UI común (Modales, Botones, Toasts).
│   └── modals/          # Sistema de ventanas emergentes (Reglas, Confirmación).
├── pages/               # Las salas del estadio: Secciones principales (Home, Oracle, Guild, Arena).
├── data/                # Los Textos Antiguos: Datos estáticos y diccionarios bilingües.
├── hooks/               # Las Maniobras de Juego: Lógica reutilizable (useMatchState, useMasterData).
├── contexts/            # El Aura del Vestuario: Estados globales (Language, Auth, Match).
├── types.ts             # El Código de Honor: Definiciones de interfaces y tipos maestros.
└── BITACORA.md          # Este mismo registro sagrado.
```

---

## 📜 REGISTRO DE CAMBIOS RECIENTES (Hitos Temporada 3)

### [2026-03-19] El Renacer de la Arena y El Heraldo de Nuffle
*   **Estado de la Arena (Dashboard)**: Rediseño total del panel central en la Home. Ahora es un dashboard dinámico que permite elegir entre tus ligas/torneos mediante un selector premium.
*   **Rankings en Vivo**: Implementación de tablas switchables para ver la `Clasificación`, los `Anotadores` (TD) y los `Carniceros` (CAS) de tu liga seleccionada sin salir de la Home.
*   **Acceso Directo al Match Center**: El botón de "Próximo Encuentro" ahora detecta tu siguiente rival real y te permite iniciar el partido pre-cargando los clones de ambos equipos con un clic.
*   **Arquitectura Arena 4-Tab**: Reestructuración radical de `LeaguesPage.tsx` en 4 pestañas:
    - `Mis Ligas`: Solo tus liguillas activas.
    - `Mis Torneos`: Solo tus copas y eliminatorias.
    - `Descubrir`: Buscador unificado de ligas públicas.
    - `Organización`: Panel de mando para las ligas creadas por ti.
*   **La Gaceta (Noticiario)**: Nuevo sistema de noticias estilo periódico. Los administradores pueden redactar crónicas manuales para inundar la arena de sabor narrativo.
*   **Estadísticas de Liga**: Añadida pestaña de "Estadísticas" dentro del detalle de liga para seguir el Top 10 de jugadores locales.
*   **Pulido UI Google Antigravity**: Aplicación de glassmorphism avanzado, selectores estilizados con SVG y tipografía inmersiva en todas las secciones.
*   *Archivos Afectados*: `Home/index.tsx`, `LeaguesPage.tsx`, `newsGenerator.ts`, `MatchSummaryModal.tsx`, `types.ts`.

### [2026-03-16] El Orquestador de la Arena (Modularización)
*   **MatchPage Orchestrator**:- [x] Normalización de nombres de Star Players (comillas y '&').
- [x] Implementación de fallback heráldico en Dashboard y Gremio.
- [x] Actualización de reglas de seguridad Firestore (v2 Segura).
- [x] Separación de activos para Orcos y Orcos Negros.
 independientes.
*   **Motor de Reglas S3**: Extracción de `injuryEngine`, `foulEngine` y `sppEngine`.
*   *Archivos Afectados*: `MatchPage.tsx`, `MatchOrchestrator.tsx`, `useMatchState.ts`.

---
¡Por Nuffle, que los dados siempre te favorezcan! 🎲🎲
