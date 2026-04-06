# Documentación Técnica de IA e Infraestructura

Última actualización: 2026-04-02

## Propósito

Este documento describe el estado real de la arquitectura técnica del proyecto en relación con:

- integración de IA,
- construcción y gestión de prompts,
- stack tecnológico,
- flujo de datos y persistencia,
- seguridad y autenticación,
- validación y ejecución de código,
- infraestructura y operación.

Importante:

- Aunque el requerimiento original menciona OpenAI, la implementación actual del proyecto **no usa la API de OpenAI**.
- La integración de IA actualmente detectada en código usa **Google Gemini** y **Google Imagen** a través del SDK `@google/genai`.
- Este archivo debe mantenerse actualizado conforme evolucionen las integraciones futuras.

---

## 1. Resumen Ejecutivo

### Estado actual

- La aplicación es principalmente una SPA en **React + Vite + TypeScript**.
- El backend operativo es muy ligero y se materializa en **funciones serverless de Vercel** dentro de la carpeta `api/`.
- La persistencia principal se apoya en **Firebase**:
  - **Firebase Auth**
  - **Cloud Firestore**
  - **Firebase Storage**
- La integración de IA detectada actualmente es:
  - `gemini-2.5-flash` para generación de nombres
  - `imagen-4.0-generate-001` para generación de escudos/emblemas

### Hallazgos clave

- La IA **no se llama directamente desde el frontend** en los puntos inspeccionados.
- La estrategia actual es **server-side via Vercel functions**, lo cual es correcto para ocultar la clave, pero presenta huecos operativos.
- No se detectó:
  - rate limiting por usuario
  - cuotas por usuario
  - autenticación explícita sobre las rutas `api/generate-*`
  - streaming de tokens de IA
  - saneamiento HTML con librerías como `DOMPurify`
  - validación estructural con `Zod` o `Joi`
  - ejecución sandbox de código generado por IA

### Conclusión operativa

La arquitectura actual de IA es funcional pero básica. Está bien orientada al separar frontend y proveedor de IA mediante funciones serverless, pero necesita endurecimiento en:

- seguridad,
- validación de entrada,
- gobierno de costes,
- auditoría,
- normalización de variables de entorno.

---

## 2. Arquitectura de Integración de IA

### 2.1 Patrón actual de llamada

La aplicación **no llama al proveedor de IA directamente desde el frontend** en la implementación inspeccionada.  
Las llamadas se realizan a través de un backend propio muy ligero basado en funciones serverless de Vercel:

- [`C:\Users\jazex\Documents\New project\BloodBowlManager\api\generate-name.ts`](C:/Users/jazex/Documents/New%20project/BloodBowlManager/api/generate-name.ts)
- [`C:\Users\jazex\Documents\New project\BloodBowlManager\api\generate-crest.ts`](C:/Users/jazex/Documents/New%20project/BloodBowlManager/api/generate-crest.ts)

### 2.2 Proveedor actual

Proveedor detectado:

- **Google GenAI SDK**
- Librería: `@google/genai`

Definido en:

- [`C:\Users\jazex\Documents\New project\BloodBowlManager\package.json`](C:/Users/jazex/Documents/New%20project/BloodBowlManager/package.json)

### 2.3 Modelos exactos detectados

#### Generación de nombres

Archivo:

- [`C:\Users\jazex\Documents\New project\BloodBowlManager\api\generate-name.ts`](C:/Users/jazex/Documents/New%20project/BloodBowlManager/api/generate-name.ts)

Modelo:

- `gemini-2.5-flash`

Invocación detectada:

```ts
const result = await ai.models.generateContent({
  model: 'gemini-2.5-flash',
  contents: prompt,
});
```

#### Generación de escudos

Archivo:

- [`C:\Users\jazex\Documents\New project\BloodBowlManager\api\generate-crest.ts`](C:/Users/jazex/Documents/New%20project/BloodBowlManager/api/generate-crest.ts)

Modelo:

- `imagen-4.0-generate-001`

Invocación detectada:

```ts
const imageResponse = await ai.models.generateImages({
  model: 'imagen-4.0-generate-001',
  prompt,
  config: {
    numberOfImages: 1,
    outputMimeType: 'image/png',
    aspectRatio: '1:1',
  },
});
```

### 2.4 Parámetros de configuración detectados

#### `generate-name.ts`

No se detectan parámetros explícitos para:

- `temperature`
- `max_tokens` / `max_output_tokens`
- `top_p`
- `top_k`
- `stop sequences`
- `response schema`
- `safety settings`
- `systemInstruction`

Estado real:

- Se está usando la configuración por defecto del proveedor.

#### `generate-crest.ts`

Se detectan estos parámetros:

- `numberOfImages: 1`
- `outputMimeType: 'image/png'`
- `aspectRatio: '1:1'`

No se detectan:

- seeds deterministas
- safety config explícita
- clasificación de contenido
- control de estilo estructurado por schema

### 2.5 Streaming de IA

No se detecta streaming de respuestas de IA.

No se encontró uso de:

- SSE para tokens
- WebSocket para streaming de texto
- streams del SDK de IA

Estado actual:

- Las respuestas son **request/response completas**.
- El frontend, en los puntos inspeccionados, no consume respuesta incremental.

### 2.6 Observación importante

En el código inspeccionado **no se localizaron llamadas activas desde el frontend** a:

- `/api/generate-name`
- `/api/generate-crest`

Esto sugiere que la infraestructura de IA existe, pero esas rutas pueden estar:

- en integración parcial,
- en desuso temporal,
- o pendientes de conexión desde la UI.

---

## 3. Gestión de Prompts (Prompt Engineering)

### 3.1 Estrategia actual

La construcción de prompts actual es **inline**, manual y muy simple.

No existe una capa centralizada tipo:

- `promptBuilder`
- `system message manager`
- `template registry`
- `versionado de prompts`

### 3.2 Prompt de generación de nombres

Archivo:

- [`C:\Users\jazex\Documents\New project\BloodBowlManager\api\generate-name.ts`](C:/Users/jazex/Documents/New%20project/BloodBowlManager/api/generate-name.ts)

Patrón detectado:

- se construye un string
- se interpola `rosterName`
- se envía como `contents`

Ejemplo estructural:

```ts
const prompt = `Actúa como generador de nombres para Blood Bowl. 
Genera un único nombre para un equipo de la facción "${rosterName}".
Debe ser creativo, temático y fácil de recordar. 
Evita lenguaje ofensivo.
Devuelve únicamente el nombre.`;
```

Características:

- Prompt único
- Sin capa de sistema explícita
- Sin few-shot examples
- Sin validación de formato de salida más allá de una instrucción en lenguaje natural

Postprocesado detectado:

```ts
const generatedName = result.text.trim().replace(/"/g, '');
```

Esto elimina comillas pero **no garantiza estructura ni seguridad semántica**.

### 3.3 Prompt de generación de escudos

Archivo:

- [`C:\Users\jazex\Documents\New project\BloodBowlManager\api\generate-crest.ts`](C:/Users/jazex/Documents/New%20project/BloodBowlManager/api/generate-crest.ts)

Se construye un prompt en inglés con interpolación de:

- `teamName`
- `rosterName`

Patrón detectado:

```ts
const prompt = `A fantasy football team emblem for a team called "${teamName}" from the "${rosterName}" faction. Vector graphic, centered on plain white background, epic, iconic.`;
```

Características:

- Inline
- Sin prompt template reusable
- Sin variables tipadas
- Sin validación estructural del prompt

### 3.4 System Message

No se detecta una capa formal de `System Message`.

Estado actual:

- La conducta esperada se indica dentro del propio prompt textual.
- Eso implica menos control y menos consistencia que un sistema con:
  - `system`
  - `developer`
  - `user`
  roles separados.

### 3.5 Interpolación de datos de usuario

La interpolación se hace por template string nativo de JavaScript.

Ejemplos:

- `${rosterName}`
- `${teamName}`

No se detecta:

- escaping estructural
- validación fuerte previa con schemas
- listas blancas estrictas para longitud, caracteres o categorías permitidas

### 3.6 Recomendación futura

Conviene evolucionar a:

- plantillas versionadas de prompt
- capa de `system message`
- validación de input con `Zod`
- validación de output con schema

---

## 4. Stack Tecnológico

### 4.1 Frontend

Tecnologías detectadas:

- **React 19**
- **TypeScript**
- **Vite**
- **Framer Motion**
- **Firebase SDK**

Archivos relevantes:

- [`C:\Users\jazex\Documents\New project\BloodBowlManager\package.json`](C:/Users/jazex/Documents/New%20project/BloodBowlManager/package.json)
- [`C:\Users\jazex\Documents\New project\BloodBowlManager\vite.config.ts`](C:/Users/jazex/Documents/New%20project/BloodBowlManager/vite.config.ts)

### 4.2 Backend

No existe un backend monolítico clásico.

La parte backend se resuelve con:

- **Vercel Serverless Functions**
- carpeta `api/`

Esto equivale a un backend tipo:

- Node.js serverless

### 4.3 Persistencia

- **Cloud Firestore**
- **Firebase Storage**
- **localStorage** para modo invitado o fallback local en algunos flujos

### 4.4 Autenticación

- **Firebase Authentication**
- Google Sign-In con popup

### 4.5 Manejo de streaming

No se detecta streaming de IA.

Sí existe uso intensivo de:

- `onSnapshot` de Firestore para datos en tiempo real

Es decir:

- hay streaming/reactividad de base de datos,
- pero no streaming de modelos generativos.

---

## 5. Flujo de Datos y Persistencia

### 5.1 Datos maestros

La app consume datos maestros desde Firestore con fallback local.

Hook principal:

- [`C:\Users\jazex\Documents\New project\BloodBowlManager\hooks\useMasterData.ts`](C:/Users/jazex/Documents/New%20project/BloodBowlManager/hooks/useMasterData.ts)

Documentos/colecciones detectados:

- `master_data/teams`
- `master_data/skills`
- `master_data/star_players`
- `master_data/inducements_es`
- `master_data/inducements_en`
- `master_data/heraldo`
- `master_data/meta`
- `settings_master/home_hero`

Fallbacks locales:

- [`C:\Users\jazex\Documents\New project\BloodBowlManager\data\teams.ts`](C:/Users/jazex/Documents/New%20project/BloodBowlManager/data/teams.ts)
- [`C:\Users\jazex\Documents\New project\BloodBowlManager\data\skills.ts`](C:/Users/jazex/Documents/New%20project/BloodBowlManager/data/skills.ts)
- [`C:\Users\jazex\Documents\New project\BloodBowlManager\data\starPlayers.ts`](C:/Users/jazex/Documents/New%20project/BloodBowlManager/data/starPlayers.ts)

### 5.2 Datos de usuario

Persistencia detectada en:

- [`C:\Users\jazex\Documents\New project\BloodBowlManager\components\shared\MainApp.tsx`](C:/Users/jazex/Documents/New%20project/BloodBowlManager/components/shared/MainApp.tsx)

Ubicaciones Firestore:

- `users/{uid}/teams`
- `users/{uid}/plays`
- `users/{uid}/matchReports`
- `leagues`

### 5.3 Outputs de IA

No se detectó una persistencia estructurada y ampliamente usada de outputs de IA en Firestore dentro de los flujos inspeccionados.

Rutas IA actuales:

- `generate-name` devuelve JSON con `name`
- `generate-crest` devuelve JSON con la imagen en base64

No se observó un pipeline centralizado que:

- reciba la respuesta,
- la valide,
- la persista de forma auditada,
- y registre metadatos de coste o trazabilidad.

### 5.4 Saneamiento antes de guardar

No se detecta sanitización semántica robusta.

Sí se detecta un patrón de serialización para limpiar `undefined` antes de persistir algunos objetos:

```ts
const sanitizedTeam = JSON.parse(JSON.stringify(newTeamData));
```

Esto:

- elimina `undefined`
- fuerza serialización JSON simple

Pero **no es saneamiento de seguridad HTML/XSS**.

### 5.5 Saneamiento antes de renderizar en DOM

No se detectó uso de:

- `DOMPurify`
- `sanitize-html`
- `dangerouslySetInnerHTML`

La app renderiza mayoritariamente datos como texto React estándar, lo cual reduce riesgo XSS mientras no se inyecte HTML arbitrario.

Conclusión:

- no hay una librería dedicada de sanitización HTML,
- y tampoco parece haber un caso central de renderizado HTML crudo.

---

## 6. Seguridad y Autenticación

### 6.1 Protección de claves

#### Estado actual deseado

La clave del proveedor IA debería residir solo en backend/serverless.

#### Estado real detectado

Las funciones serverless leen:

- `process.env.API_KEY`

Archivos:

- [`C:\Users\jazex\Documents\New project\BloodBowlManager\api\generate-name.ts`](C:/Users/jazex/Documents/New%20project/BloodBowlManager/api/generate-name.ts)
- [`C:\Users\jazex\Documents\New project\BloodBowlManager\api\generate-crest.ts`](C:/Users/jazex/Documents/New%20project/BloodBowlManager/api/generate-crest.ts)

Sin embargo, en:

- [`C:\Users\jazex\Documents\New project\BloodBowlManager\vite.config.ts`](C:/Users/jazex/Documents/New%20project/BloodBowlManager/vite.config.ts)

se define:

```ts
'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
```

Esto implica un riesgo arquitectónico:

- la convención de entorno está mezclada,
- y existe inyección build-time de valores bajo el namespace `process.env.*` también para frontend.

Recomendación:

- separar estrictamente variables server-only y client-safe,
- no exponer claves de IA en `define` de Vite.

### 6.2 Método de autenticación

Archivo:

- [`C:\Users\jazex\Documents\New project\BloodBowlManager\contexts\AuthContext.tsx`](C:/Users/jazex/Documents/New%20project/BloodBowlManager/contexts/AuthContext.tsx)

Métodos detectados:

- `GoogleAuthProvider`
- `signInWithPopup`
- modo invitado mediante `localStorage`

El privilegio admin se determina por:

- UID hardcodeado (`ADMIN_UID`)
- o `users/{uid}.isAdmin`

### 6.3 Reglas de acceso a Firestore

Archivo:

- [`C:\Users\jazex\Documents\New project\BloodBowlManager\firestore.rules`](C:/Users/jazex/Documents/New%20project/BloodBowlManager/firestore.rules)

Puntos relevantes:

- `master_data/*`: lectura pública, escritura solo admin
- `settings_master/*`: lectura pública, escritura solo admin
- `users/{userId}`: controlado por propietario
- otras colecciones con lógica de ownership/admin

### 6.4 Rate limiting

No se detectó implementación explícita de:

- rate limiting por IP
- rate limiting por usuario
- throttling de rutas IA
- bucket de requests

No se detectaron librerías tipo:

- `express-rate-limit`
- `rate-limiter-flexible`
- middleware equivalente

### 6.5 Cuotas por usuario

No se detecta:

- contabilidad por usuario de tokens o imágenes
- límites diarios/mensuales
- créditos por usuario
- bloqueo por consumo

### 6.6 Prevención de abuso de tokens

No se detecta un mecanismo específico para:

- limitar el número de requests de IA por sesión
- limitar la longitud del prompt
- proteger las rutas de generación con autenticación fuerte
- impedir llamadas automatizadas no autenticadas

Estado actual:

- las rutas IA están demasiado abiertas para un entorno de producción estricto.

---

## 7. Validación y Ejecución de Código

### 7.1 Validación de entrada

No se detectó uso de librerías estructurales como:

- `Zod`
- `Joi`
- `Yup`
- `Valibot`

La validación actual es principalmente manual, del tipo:

```ts
if (!rosterName) {
  return response.status(400).json({ error: 'rosterName is required' });
}
```

Esto es suficiente para checks básicos, pero insuficiente para:

- contratos tipados de entrada/salida
- sanitización robusta
- mensajes de error consistentes
- defensa ante payloads complejos

### 7.2 Ejecución de código generado por IA

No se detectó ninguna infraestructura para ejecutar código generado por IA.

No hay rastro de:

- `eval`
- `new Function`
- `child_process`
- Docker local
- VM embebida
- sandbox de ejecución de snippets
- Web Workers usados para ejecutar código arbitrario generado por IA

Conclusión crítica:

- **La web no ejecuta código generado por IA** en el estado inspeccionado.
- Por tanto, no existe actualmente:
  - sandbox,
  - contenedor,
  - aislamiento de procesos,
  - política de ejecución segura.

Esto es bueno desde el punto de vista de reducción de riesgo, pero debe quedar claro:

- si en el futuro se quiere ejecutar código generado, habrá que diseñar una capa específica de sandboxing.

### 7.3 Saneamiento de contenido renderizado

No se detecta `DOMPurify`.
No se detecta `dangerouslySetInnerHTML` como patrón extendido.

Eso reduce superficie de ataque XSS mientras el contenido permanezca como texto normal React.

---

## 8. Infraestructura

### 8.1 Hosting

Patrón actual:

- Frontend: Vercel
- Backend serverless: Vercel Functions
- Base de datos y auth: Firebase

### 8.2 Variables de entorno

Estado detectado:

- `.env` en raíz está vacío
- existe guía de despliegue con `.env.local` sugerido:
  - [`C:\Users\jazex\Documents\New project\BloodBowlManager\GUIA_DESPLIEGUE_Y_ENTORNO.md`](C:/Users/jazex/Documents/New%20project/BloodBowlManager/GUIA_DESPLIEGUE_Y_ENTORNO.md)

Pero en código real:

- Firebase config está hardcodeado en:
  - [`C:\Users\jazex\Documents\New project\BloodBowlManager\firebaseConfig.ts`](C:/Users/jazex/Documents/New%20project/BloodBowlManager/firebaseConfig.ts)
- la IA usa `process.env.API_KEY` en serverless
- Vite inyecta `GEMINI_API_KEY` en `define`

Conclusión:

- la estrategia de variables de entorno necesita consolidación.

### 8.3 Logs y monitoreo

No se detecta una capa formal de observabilidad tipo:

- Sentry
- Datadog
- Logtail
- OpenTelemetry

Sí se detecta uso básico de:

- `console.error`
- `console.warn`

Esto es útil en desarrollo, pero limitado para:

- trazabilidad de incidencias
- auditoría de prompts
- análisis de costes
- detección de abuso

---

## 9. Librerías de Validación y Saneamiento

### 9.1 Validación estructural

Librerías detectadas:

- Ninguna de tipo `Zod`, `Joi`, `Yup` o equivalente para validación centralizada de requests IA

Estado actual:

- validación manual por `if`

### 9.2 Saneamiento HTML / DOM

Librerías detectadas:

- Ninguna de tipo `DOMPurify` o `sanitize-html`

Estado actual:

- React renderiza texto como nodos normales
- no se detecta pipeline de HTML arbitrario

### 9.3 Saneamiento de persistencia

Patrón detectado:

- `JSON.parse(JSON.stringify(...))`

Uso:

- limpieza de valores no serializables o `undefined`

Limitación:

- no es un mecanismo de seguridad contra XSS o payload malicioso

---

## 10. Riesgos Actuales

### Riesgo 1. Inconsistencia de secretos

`vite.config.ts` inyecta variables relacionadas con IA en el frontend namespace.

Impacto:

- riesgo de exponer configuración sensible
- confusión entre env client-side y server-side

### Riesgo 2. Rutas IA sin endurecimiento suficiente

No se detectan:

- auth obligatoria
- rate limit
- cuotas
- anti-abuse

Impacto:

- consumo no controlado
- sobrecoste
- uso indebido automatizado

### Riesgo 3. Validación insuficiente

No se usan schemas estructurados.

Impacto:

- prompts poco controlados
- payloads frágiles
- errores inconsistentes

### Riesgo 4. Baja observabilidad

No hay monitoreo serio de:

- requests IA
- latencia
- errores por proveedor
- consumo por usuario

### Riesgo 5. Arquitectura híbrida de datos

Los datos maestros aún conviven con fallbacks estáticos.

Impacto:

- discrepancias entre Firebase y datos embebidos
- bugs por falta de sincronía

---

## 11. Recomendaciones Prioritarias

### Prioridad alta

1. Migrar a un esquema `Firebase-first` real para datos maestros.
2. Mover completamente la clave IA a variables solo server-side.
3. Eliminar la exposición de `GEMINI_API_KEY` en `vite.config.ts`.
4. Proteger las rutas IA con autenticación y autorización mínima.
5. Añadir rate limiting por usuario/IP en serverless.

### Prioridad media

1. Introducir `Zod` para validación de requests y outputs de IA.
2. Registrar auditoría mínima:
   - usuario
   - timestamp
   - modelo
   - tipo de operación
   - éxito/error
3. Añadir cuotas o crédito por usuario para generación.

### Prioridad media-baja

1. Unificar estrategia de `.env.local`, Vercel env vars y configuración Firebase.
2. Añadir observabilidad real.
3. Centralizar plantillas de prompt.

---

## 12. Estado Objetivo Recomendado

### IA

- Backend-only
- autenticado
- rate-limited
- schema-validated
- auditado

### Datos

- Firestore como fuente maestra
- fallbacks locales solo para desarrollo o contingencia

### Seguridad

- sin secretos expuestos al bundle
- sin rutas de generación abiertas
- sin renderizado HTML no saneado

### Operación

- logs centralizados
- métricas de coste
- alertas de abuso

---

## 13. Archivos Clave Auditados

- [`C:\Users\jazex\Documents\New project\BloodBowlManager\package.json`](C:/Users/jazex/Documents/New%20project/BloodBowlManager/package.json)
- [`C:\Users\jazex\Documents\New project\BloodBowlManager\api\generate-name.ts`](C:/Users/jazex/Documents/New%20project/BloodBowlManager/api/generate-name.ts)
- [`C:\Users\jazex\Documents\New project\BloodBowlManager\api\generate-crest.ts`](C:/Users/jazex/Documents/New%20project/BloodBowlManager/api/generate-crest.ts)
- [`C:\Users\jazex\Documents\New project\BloodBowlManager\vite.config.ts`](C:/Users/jazex/Documents/New%20project/BloodBowlManager/vite.config.ts)
- [`C:\Users\jazex\Documents\New project\BloodBowlManager\firebaseConfig.ts`](C:/Users/jazex/Documents/New%20project/BloodBowlManager/firebaseConfig.ts)
- [`C:\Users\jazex\Documents\New project\BloodBowlManager\contexts\AuthContext.tsx`](C:/Users/jazex/Documents/New%20project/BloodBowlManager/contexts/AuthContext.tsx)
- [`C:\Users\jazex\Documents\New project\BloodBowlManager\hooks\useMasterData.ts`](C:/Users/jazex/Documents/New%20project/BloodBowlManager/hooks/useMasterData.ts)
- [`C:\Users\jazex\Documents\New project\BloodBowlManager\components\shared\MainApp.tsx`](C:/Users/jazex/Documents/New%20project/BloodBowlManager/components/shared/MainApp.tsx)
- [`C:\Users\jazex\Documents\New project\BloodBowlManager\firestore.rules`](C:/Users/jazex/Documents/New%20project/BloodBowlManager/firestore.rules)
- [`C:\Users\jazex\Documents\New project\BloodBowlManager\GUIA_DESPLIEGUE_Y_ENTORNO.md`](C:/Users/jazex/Documents/New%20project/BloodBowlManager/GUIA_DESPLIEGUE_Y_ENTORNO.md)

---

## 14. Próxima actualización recomendada

Actualizar este documento cuando ocurra cualquiera de estos eventos:

- migración de Gemini a OpenAI
- incorporación de streaming
- activación real de los endpoints IA desde frontend
- introducción de validación con `Zod` o similar
- despliegue de rate limiting
- ejecución de código generativo en sandbox
- migración completa de datos maestros a Firebase-first

