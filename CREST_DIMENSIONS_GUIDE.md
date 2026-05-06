# Medidas de Escudo

Fuente única para preparar escudos de equipo en la web.

## Archivo maestro recomendado
- Formato: `PNG` cuadrado
- Tamaño ideal: `1024 x 1024 px`
- Zona segura recomendada: `820 x 820 px`
- Margen exterior recomendado: `~10%`
- Composición: emblema centrado, sin texto pegado al borde, evitando coronas o marcos demasiado finos en el perímetro

## Superficies reales de la app

### Gremio
- Dossier de franquicia, cabecera: `128 x 128 px`
  - Archivo: `C:\Users\jazex\Documents\New project\BloodBowlManager\components\guild\TeamDashboard.tsx`
  - Caja real: `w-32 h-32` en desktop, `w-28 h-28` en tamaños inferiores
  - Ajuste por defecto: `scale 1.14`
- Lista de equipos, vista lista: `192 x 192 px`
  - Archivo: `C:\Users\jazex\Documents\New project\BloodBowlManager\pages\Guild\index.tsx`
  - Caja real: `md:w-48 md:h-48`
  - Ajuste por defecto: `scale 1.18`
- Lista de equipos, vista cuadrícula / resumen: `160 x 160 px`
  - Archivo: `C:\Users\jazex\Documents\New project\BloodBowlManager\pages\Guild\index.tsx`
  - Caja real: `md:w-40 md:h-40`
  - Ajuste por defecto: `scale 1.18`

### Fundar equipo
- Carrusel principal activo: `208 x 208 px`
  - Archivo: `C:\Users\jazex\Documents\New project\BloodBowlManager\pages\Guild\CreateTeamPage.tsx`
  - Caja real: `lg:w-52 lg:h-52`
  - Escudo muy protagonista, conviene poco margen muerto
- Carrusel secundario: `144 x 144 px`
  - Caja real: `lg:w-36 lg:h-36`
- Miniatura lateral: `112 x 112 px`
  - Caja real: `lg:w-28 lg:h-28`
- Selector móvil: `96 x 96 px`
  - Caja real: `w-24 h-24`

### Oráculo
- Card destacada de equipo: `100% x 176 px`
  - Archivo: `C:\Users\jazex\Documents\New project\BloodBowlManager\pages\Oracle\TeamsPage.tsx`
  - Uso actual: `object-cover`
  - Recomendación: el PNG maestro debe incluir suficiente aire exterior para aguantar recorte horizontal sin perder el símbolo
- Dossier de equipo / hero: `450 x 253 px` aprox.
  - Archivo: `C:\Users\jazex\Documents\New project\BloodBowlManager\pages\Oracle\TeamDetailPage.tsx`
  - Caja real: `md:w-[450px] aspect-video`
  - Uso actual: `object-cover`
  - Recomendación: evitar detalles críticos en esquinas y borde superior
- Fullscreen / modal: `object-contain`
  - Aquí el PNG cuadrado maestro se ve completo

### Admin
- Preview compacta del editor de equipo: `112 x 80 px`
  - Archivo: `C:\Users\jazex\Documents\New project\BloodBowlManager\components\shared\AdminTeamForm.tsx`
- Preview secundaria de URL manual: `96 x 64 px`
  - Archivo: `C:\Users\jazex\Documents\New project\BloodBowlManager\components\shared\AdminTeamForm.tsx`
- Tarjeta de referencia del panel admin: `96 x 96 px`
  - Archivo: `C:\Users\jazex\Documents\New project\BloodBowlManager\components\shared\AdminPanel.tsx`

## Ajuste recomendado en la app
- `crestScale`: `1.12 - 1.18`
- `crestOffsetY`: `-4 a +4 px`
- Subir a `1.22+` solo si el escudo tiene mucho aire alrededor
- Usar offset vertical solo para centrar composiciones con texto inferior o corona superior

## Regla práctica
Si un escudo se prepara bien para:
- `1024 x 1024 px`
- zona segura central `820 x 820 px`
- símbolo principal ocupando `~72% - 80%` del lienzo

entonces debería encajar correctamente en todas las superficies actuales de la web con un ajuste muy pequeño o nulo.
