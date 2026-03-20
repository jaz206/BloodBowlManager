# Guia de despliegue y entorno

## Requisitos
- Node.js 18 o superior.
- Firebase con Authentication, Firestore y, si aplica, Storage.
- Claves de Gemini si usas las funciones de generacion.

## Variables de entorno
En `.env.local`:

```bash
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto_id
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
GEMINI_API_KEY=tu_gemini_api_key
```

## Arranque local
1. `npm install`
2. `npm run dev`
3. Abre `http://localhost:5173`

## Build
- `npm run build`
- La salida va a `dist`

## Despliegue en Vercel
1. Conecta el repo a Vercel.
2. Carga las variables de entorno.
3. Verifica que el build sea `npm run build`.
4. Usa `dist` como output.

## Seguridad Firestore
- Copia el contenido de `FIRESTORE_RULES.md` en Firebase.
- La app actual usa reglas compatibles con `competitions` y `leagues`.
- Los documentos con ownership deben guardar `createdBy` o `ownerId` segun el origen del dato.

## Panel de admin
- El panel de admin esta dividido en formularios por dominio.
- El explorador de imagenes carga `Escudos/` para equipos y `Star Players/` para estrellas.
- Los escudos y retratos se toman desde `jaz206/Bloodbowl-image`.

## Mantenimiento de datos
- Usa la sincronizacion del admin para subir maestros a Firestore.
- Exporta e importa CSV desde el panel si necesitas revisar datos puntuales.
