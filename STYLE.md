# Blood Bowl Manager - Guía de Estilo (Nuffle's Design System)

Esta guía define el lenguaje visual de la aplicación para asegurar consistencia en el desarrollo. Basada en una estética **Dark Fantasy Premium**, combina elementos de juegos de mesa clásicos con interfaces modernas de alto rendimiento.

## 🎨 Paleta de Colores

### Colores Principales (Core)
- **Premium Gold:** `#CA8A04` (Accent principal, botones primarios, bordes de enfoque).
- **Blood Red:** `#8B0000` (Errores, avisos de lesiones, estados críticos).
- **Pitch Green:** `#1B4332` (Elementos de campo, tácticas, éxito).

### Fondos y Superficies
- **Deep Black/Dark Slate:** `#0a0a0a` / `#0f172a` (Fondos base).
- **Surface Dark:** `rgba(0, 0, 0, 0.4)` (Tarjetas Bento).
- **Glass Overlay:** `rgba(255, 255, 255, 0.03)` con `backdrop-blur(12px)`.

---

## 🖋️ Tipografía

### Fuente Display (Títulos)
- **Familia:** `Epilogue`, sans-serif.
- **Uso:** H1, H2, H3, Botones de acción principal.
- **Estilo Recomendado:** `font-black`, `uppercase`, `italic`, `tracking-tighter`.

### Fuente Base (Contenido)
- **Familia:** `Inter`, sans-serif.
- **Uso:** Texto de párrafo, tablas, labels.
- **Estilo Recomendado:** `font-normal` o `font-medium` para legibilidad.

---

## 🧊 Componentes y Patrones Visuales

### 1. Panel Glassmorphism (`.glass-panel`)
Utilizado para secciones principales y headers que flotan sobre el fondo.
```css
background: rgba(255, 255, 255, 0.03);
backdrop-filter: blur(12px);
border: 1px solid rgba(255, 255, 255, 0.08);
border-radius: 1.5rem;
```

### 2. Tarjetas Bento (`.bento-card`)
Bloques de contenido rectangulares con esquinas muy redondeadas.
- **Borde base:** `rgba(255, 255, 255, 0.05)`.
- **Hover:** Borde cambia a `premium-gold` al 30% (`#CA8A044D`), ligera elevación (`-2px`).

### 3. Iconografía
Utilizamos **Material Symbols Outlined** con grosores variables (`font-bold`).
- Primario: `text-premium-gold`.
- Secundario: `text-slate-500`.

---

## 🎬 Animaciones y Micro-interacciones

### Sistema de Transiciones
- **Bezier Premium:** `cubic-bezier(0.16, 1, 0.3, 1)` (Salidas rápidas y suaves).
- **Feedback:** Los botones de acción deben tener `active:scale-95` y `hover:scale-105`.

### Efectos Dinámicos
- **Entrada de Páginas:** `animate-in fade-in slide-in-from-bottom-4 duration-700`.
- **Dados:** Animación de rotación 3D en `360deg` sobre múltiples ejes.

---

## 🛠️ Tailwind Configuration (Inline)
La aplicación utiliza Tailwind vía CDN con la siguiente extensión de tema:

```javascript
tailwind.config = {
  theme: {
    extend: {
      colors: {
        "primary": "#f59f0a",
        "background-dark": "#221c10",
        blood: { red: '#8B0000', dark: '#450a0a' },
        pitch: { green: '#1B4332', dark: '#081c15' },
        premium: { gold: '#CA8A04', light: '#fde047' }
      },
      fontFamily: {
        "display": ["Epilogue", "Inter", "sans-serif"],
        "sans": ["Inter", "system-ui", "sans-serif"],
      }
    }
  }
}
```

---

## 🏟️ Elementos Específicos
- **Mini Field:** Representación esquemática del campo con cuadrícula sutil (`15x13` o similar).
- **Radar Chart:** Polígono recortado con `clip-path` para visualizar estadísticas de equipo.
- **Hero Image:** Filtro `grayscale` al 100% por defecto, transicionando a color en `hover` (duración 1000ms).
