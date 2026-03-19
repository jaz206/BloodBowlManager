# 🩸 Blood Bowl Manager - Guía de Estilo (Nuffle's Design System)

Esta guía define el lenguaje visual de la aplicación para asegurar consistencia en el "Google Antigravity Premium Style", combinando alta fantasía oscura con interfaces modernas.

## 🎨 Paleta de Colores Maestro

### Núcleo (Core)
- **Primary Gold**: `#fcc15` / `primary` (Acentos, bordes de enfoque, texto destacado).
- **Deep Zinc**: `zinc-900`, `zinc-950` (Fondos bases, tarjetas bento ocultas).
- **Status Colors**:
  - `green-500`: Éxito, Ligas Abiertas.
  - `yellow-400`: Ligas En Progreso, Avisos.
  - `red-500`: Ligas Finalizadas, Lesiones, Bajas.
  - `slate-500`: Texto secundario, deshabilitado.

---

## 🧊 Componentes Premium (Google Antigravity)

### 1. Glassmorphism Avanzado (`.backdrop-blur-md`)
- **Uso**: Headers, Modales, Navbars fijas.
- **Especificación**: `bg-zinc-900/60`, `backdrop-blur-md`, `border border-white/5`.

### 2. Tarjetas Bento de Arena (`.bento-card`)
- **Fondo**: `bg-zinc-900/40`.
- **Efecto Hover**: `hover:bg-zinc-800/60`, `hover:border-primary/20`.
- **Iconografía**: `Material Symbols Outlined` (grosor `font-bold`).

### 3. El Estilo "La Gaceta" (Newspaper)
Para crónicas y reportes históricos.
- **Tipografía**: `font-serif` para titulares de noticias (`H2`, `H3`).
- **Layout**: Columnas de lectura fácil, capitulares (`::first-letter` con estilo primario).
- **Fondos**: `bg-zinc-950/40` con bordes sutiles `border-white/5`.

---

## 🛠️ Controles de Formulario Stylized

### Selector Premium (Custom Select)
- **Base**: `bg-zinc-900`, `border-primary/20`.
- **Tipografía**: `font-black`, `uppercase`, `text-[10px]`, `tracking-widest`.
- **Icono**: Flecha SVG embebida (`appearance-none`) en color primario.
- **Transición**: `focus:border-primary/60`, `hover:border-primary/40`.

### Pestañas de Navegación (Tabs)
Misma estética para Home, Arena y Detalle de Liga:
- **Activa**: `bg-primary`, `text-black`, `shadow-lg shadow-primary/20`.
- **Inactiva**: `text-slate-500`, `hover:text-white`.
- **Icono**: `material-symbols-outlined text-sm font-bold`.

---

## 🖋️ Tipografía e Iconos

### Títulos de Sección (`.section-title`)
- **Fuente**: `font-header` (Epilogue).
- **Estilo**: `text-4xl`, `font-black`, `italic`, `uppercase`, `tracking-tighter`.
- **Color**: Blanco por defecto, primario para énfasis.

### Iconos (`material-symbols-outlined`)
- **Grosor**: Usar `font-bold` para dar peso visual.
- **Color**: `text-primary/60` para decorativos, `text-primary` para activos.

---

## 🎬 Animaciones Globales
- **Entrada de Componentes**: `animate-in fade-in slide-in-from-bottom-4 duration-700`.
- **Interacción Botón**: `hover:scale-105 active:scale-95 transition-all`.
- **Framer Motion**: Suaves `opacity:0 -> 1` con `y:20 -> 0` para modales y switchers.

---

## 🏟️ Layout Específico
- **MiniField**: S3 Grid con aura de estados (Rojo: Distraído, Azul/Gris: Indigestión).
- **Radar Charts**: Polígonos semitransparentes `bg-primary/20` con bordes `border-primary`.
- **Hero Sections**: Gradientes radiales desde `primary/10` en el centro a `transparent`.
