# 🚀 Guía de Despliegue y Configuración de Entorno

Instrucciones para configurar, arrancar y desplegar el proyecto **Blood Bowl Manager**.

---

## 1. Requisitos Previos
- **Node.js**: Versión 18 o superior.
- **Firebase Project**: Necesitas una cuenta en Firebase con **Firestore**, **Authentication** y **Storage** activados.

---

## 2. Variables de Entorno (`.env`)
Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido (sustituye por tus claves de Firebase):

```bash
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto_id
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
```

---

## 3. Instalación y Ejecución Local
1. Clona el repositorio.
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Arranca el servidor de desarrollo:
   ```bash
   npm run dev
   ```
   La aplicación debería estar visible en `http://localhost:5173`.

---

## 4. Despliegue en Vercel
Este proyecto está optimizado para **Vercel**. Sigue estos pasos:
1. Conecta tu repositorio de GitHub a Vercel.
2. En la configuración del proyecto de Vercel (Project Settings > Environment Variables), añade todas las variables definidas en el punto 2.
3. Asegúrate de que el comando de build sea: `npm run build`.
4. El directorio de salida debe ser: `dist`.

> **Nota Crítica sobre Mayúsculas**: Git debe estar configurado para ser sensible a las mayúsculas para evitar errores en Vercel:
> `git config core.ignorecase false`

---

## 5. Configuración de Seguridad (Firebase)

### Firestore Rules
Copia el contenido de `FIRESTORE_RULES.md` en la consola de Firebase. Reglas básicas aplicadas:
- Usuarios autenticados pueden leer y escribir sus propios equipos (`managedTeams`).
- Solo propietarios de ligas pueden editar la configuración de las mismas.
- El Admin Panel requiere el flag `isAdmin: true` en el documento del usuario.

### Firebase Storage Rules
Asegúrate de permitir la subida de imágenes (.webp, .png, .jpg) a la carpeta `/crests/` para los escudos de equipo.

---

## 6. Mantenimiento de Datos (Panel de Admin)
Para poblar la base de datos con los rosters de 2026:
1. Accede a la pestaña **Admin** dentro del Oráculo (requiere permisos de Admin).
2. Usa el botón **Sincronizar Datos Maestos**. Esto leerá los archivos `data/teams.ts` y `data/skills_es.ts` y los subirá a Firestore como registros oficiales.
