# Auditoria Tecnica de Seguridad, Rendimiento e Integracion IA

Fecha: 2026-04-02  
Auditor: analisis estatico del codigo fuente del repositorio  
Alcance: frontend, persistencia Firebase, funciones serverless, integracion IA, configuracion, observabilidad y deuda tecnica

---

## 0. Resumen ejecutivo

### Estado general

La aplicacion presenta una base funcional razonable para una SPA moderna, pero combina:

- logica de negocio compleja en cliente,
- Firestore como autoridad de datos,
- funciones serverless ligeras sin endurecimiento,
- dependencias externas cargadas por CDN,
- y una estrategia de datos maestros aun hibrida.

### Conclusiones mas importantes

1. **La integracion IA no usa OpenAI actualmente**.  
   El repositorio usa `@google/genai` con:
   - `gemini-2.5-flash`
   - `imagen-4.0-generate-001`

2. **Las rutas de IA no estan endurecidas**.  
   No se detecta:
   - autenticacion obligatoria,
   - rate limiting,
   - cuotas por usuario,
   - validacion con schemas,
   - registro de uso por usuario.

3. **Hay exposicion de datos "privados" en Firestore por reglas demasiado permisivas**.  
   `competitions`, `leagues`, `live_matches` y `tactical_plays` tienen `allow read: if true;`.  
   Esto hace que la privacidad dependa de la UI, no de la base de datos.

4. **El modelo de datos maestros en Firestore es monolitico y poco escalable**.  
   `master_data/teams`, `master_data/skills` y `master_data/star_players` guardan arrays completos en un unico documento, lo que incrementa:
   - riesgo de colisiones,
   - write amplification,
   - riesgo de alcanzar limites de documento,
   - deuda tecnica de sincronizacion.

5. **No existe una politica de seguridad web moderna visible en la app**.  
   No se detecta:
   - CSP
   - HSTS
   - X-Frame-Options
   - Permissions-Policy
   - Referrer-Policy

6. **El frontend carga demasiado codigo y demasiadas dependencias globales**.  
   Se cargan por CDN:
   - Tailwind runtime
   - Google Sign-In script
   - QRCode
   - html5-qrcode
   - xlsx
   - fuentes externas

7. **No se detecta ninguna ejecucion de codigo generado por IA**.  
   Esto reduce riesgo critico inmediato, pero tambien significa que no existe sandbox, contenedor o VM porque hoy no hace falta.

---

## 1. Arquitectura de alto nivel

### 1.1 Arquitectura actual

La aplicacion es una SPA cliente-heavy basada en React y Vite, apoyada en Firebase para identidad y persistencia, y en Vercel para funciones serverless.

### 1.2 Componentes principales

- Cliente web:
  - React 19
  - Vite 6
  - TypeScript
  - Framer Motion
- Persistencia:
  - Firebase Auth
  - Cloud Firestore
  - Firebase Storage
- Backend ligero:
  - Vercel serverless functions en `api/`
- IA:
  - Google GenAI SDK
  - Gemini / Imagen

### 1.3 Diagrama conceptual

```text
                       +----------------------+
                       |  Usuario / Navegador |
                       +----------+-----------+
                                  |
                                  v
                  +-----------------------------------+
                  | React SPA (Vite, CSR, TS)         |
                  | MainApp + modulos funcionales     |
                  +----+---------------+--------------+
                       |               |
                       |               |
                       v               v
            +----------------+   +----------------------+
            | Firebase Auth  |   | Cloud Firestore      |
            | Google login   |   | users, leagues,      |
            | Guest mode     |   | master_data, reports |
            +----------------+   +----------------------+
                       |
                       v
                +-------------+
                | Storage     |
                | imagenes    |
                +-------------+

                                  (server-side)
                                       |
                                       v
                       +-------------------------------+
                       | Vercel Functions /api/*       |
                       | generate-name / generate-crest|
                       +---------------+---------------+
                                       |
                                       v
                           +------------------------+
                           | Google Gemini / Imagen |
                           +------------------------+
```

### 1.4 Flujo de usuario actual

#### Login / bootstrap

1. El usuario entra a la SPA.
2. El cliente inicializa Firebase desde [`firebaseConfig.ts`](/C:/Users/jazex/Documents/New%20project/BloodBowlManager/firebaseConfig.ts).
3. `AuthContext` resuelve:
   - sesion Google con Firebase Auth, o
   - modo invitado desde `localStorage`.
4. `MainApp` monta listeners `onSnapshot` para:
   - equipos
   - jugadas
   - reportes
   - competiciones
   - datos maestros

#### Funcionalidad principal

La aplicacion usa sobre todo:

- Oraculo
- Gremio
- Ligas
- Arena
- Admin

#### Flujo IA real

No se ha encontrado una llamada activa desde frontend a las rutas IA:

- `/api/generate-name`
- `/api/generate-crest`

Esto indica que la infraestructura IA existe pero no esta integrada de forma claramente activa en la UI actual.

### 1.5 Puntos criticos de exposicion de datos

1. Firestore:
   - `leagues` legible publicamente
   - `competitions` legible publicamente
   - `live_matches` legible publicamente
   - `tactical_plays` legible publicamente

2. Frontend:
   - guest mode persistido en `localStorage`
   - lenguaje y otros estados de UI en `localStorage`
   - Firebase Auth con persistencia cliente por defecto

3. Serverless IA:
   - endpoints sin auth fuerte ni quota

4. CDN / terceros:
   - scripts y assets externos sin SRI

---

## 2. Frontend y gestion de estado

### 2.1 Stack frontend

Detectado en [`package.json`](/C:/Users/jazex/Documents/New%20project/BloodBowlManager/package.json):

- `react` `^19.1.1`
- `react-dom` `^19.1.1`
- `firebase` `^12.3.0`
- `framer-motion` `^11.0.0`
- `vite` `^6.2.0`
- `@vitejs/plugin-react` `^5.0.0`
- `typescript` `~5.8.2`

Dependencias de runtime cargadas por CDN en [`index.html`](/C:/Users/jazex/Documents/New%20project/BloodBowlManager/index.html):

- Tailwind runtime via `cdn.tailwindcss.com`
- QRCode
- html5-qrcode
- xlsx
- Google Identity Services
- Google Fonts

### 2.2 Gestion de estado

No se detecta una libreria centralizada de estado como:

- Redux
- Zustand
- MobX
- Recoil

Estado actual:

- `useState`
- `useMemo`
- `useEffect`
- `Context API`
- hooks custom:
  - `AuthContext`
  - `LanguageContext`
  - `useMasterData`
  - `useArenaConfig`

### 2.3 Evaluacion de la estrategia

Ventajas:

- baja complejidad inicial
- curva de aprendizaje baja
- razonable para un SPA mediano

Debilidades:

- estado repartido en demasiadas capas
- listeners globales en raiz
- riesgo de rerenders innecesarios
- dificultad para auditar flujo de datos
- complejidad de sincronizacion al crecer el producto

### 2.4 Estrategia de renderizado

Estado actual:

- **CSR** puro
- no se detecta SSR
- no se detecta SSG
- no se detecta route-level lazy loading consistente

Impacto:

- SEO limitado
- TTFB depende totalmente del cliente
- bundle inicial mas pesado
- mayor exposicion de configuracion cliente

### 2.5 Riesgos XSS

#### Riesgo actual

No se detecta uso extendido de:

- `dangerouslySetInnerHTML`
- `DOMPurify`
- `sanitize-html`

Esto reduce el riesgo de XSS reflejado o almacenado en HTML crudo, porque React renderiza como texto.

#### Riesgo residual

Sigue existiendo superficie si en el futuro:

- se renderiza contenido enriquecido desde Firestore,
- se inyecta HTML de cronicias o notas,
- o se incorpora Markdown sin sanitizacion.

### 2.6 Manejo inseguro de datos en cliente

Hallazgos:

- guest mode en `localStorage`
- datos auxiliares de idioma en `localStorage`
- posible persistencia por defecto de Firebase Auth en almacenamiento accesible a JS

Impacto:

- si existe XSS, los tokens/estado de sesion del cliente son mas faciles de extraer que con cookies HttpOnly

### 2.7 Fugas de informacion sensible

Hallazgos:

- `vite.config.ts` inyecta:
  - `process.env.API_KEY`
  - `process.env.GEMINI_API_KEY`

Archivo:

- [`vite.config.ts`](/C:/Users/jazex/Documents/New%20project/BloodBowlManager/vite.config.ts)

Esto es especialmente delicado porque rompe la separacion conceptual entre:

- secretos server-only
- configuracion cliente

Riesgo:

- exposicion accidental de claves o de convenciones sensibles

### 2.8 Cuellos de botella de rendimiento frontend

1. Carga global de scripts por CDN en todas las pantallas.
2. Tailwind runtime en navegador en lugar de CSS purgado build-time.
3. Sin code splitting real entre modulos.
4. Listeners Firestore globales desde `MainApp`.
5. Service worker cacheando una lista enorme y heterogenea, incluyendo terceros.

---

## 3. Integracion con Firebase

### 3.1 Firebase Auth

Archivo:

- [`contexts/AuthContext.tsx`](/C:/Users/jazex/Documents/New%20project/BloodBowlManager/contexts/AuthContext.tsx)

Metodos detectados:

- Google Sign-In con `GoogleAuthProvider`
- `signInWithPopup`
- modo invitado via `localStorage`

#### Riesgos

1. No se detecta `setPersistence(...)` explicito.
2. No se usan cookies HttpOnly.
3. No se usa App Check.
4. No existe validacion backend obligatoria del token de Firebase para rutas sensibles de IA.

#### Evaluacion de token handling

Estado actual:

- Firebase Auth cliente-side
- sesion probablemente persistida con mecanismo por defecto del SDK
- guest mode guardado manualmente en `localStorage`

Comparativa:

- `localStorage`: alto riesgo ante XSS
- cookies HttpOnly: mucho mas robustas contra exfiltracion por JS

Conclusión:

La aplicacion usa una estrategia de sesion centrada en cliente, comoda pero menos robusta.

### 3.2 Firestore

#### Estructura detectada

Datos maestros:

- `master_data/teams`
- `master_data/skills`
- `master_data/star_players`
- `master_data/inducements_es`
- `master_data/inducements_en`
- `master_data/heraldo`
- `master_data/meta`
- `settings_master/home_hero`

Datos de usuario:

- `users/{uid}/teams`
- `users/{uid}/plays`
- `users/{uid}/matchReports`

Datos operativos:

- `leagues`
- `competitions`
- `live_matches`
- `tactical_plays`

#### Evaluacion de escalabilidad

Problema serio:

Los datos maestros se guardan como arrays completos en un solo documento.

Impacto:

- alto coste de escritura
- race conditions al editar arrays
- imposibilidad de updates parciales finos
- riesgo de toparse con limite de tamaño de documento de Firestore
- peor diff y peor auditoria de cambios

Esto es una deuda tecnica estructural.

### 3.3 Analisis critico de Firestore Rules

Archivo:

- [`firestore.rules`](/C:/Users/jazex/Documents/New%20project/BloodBowlManager/firestore.rules)

#### Hallazgo critico 1: competiciones privadas no son privadas en DB

Regla actual:

```text
match /competitions/{compId} {
  allow read: if true;
}

match /leagues/{compId} {
  allow read: if true;
}
```

Riesgo explotable:

- cualquier usuario autenticado o no autenticado puede leer competiciones
- si la app marca `Private` solo en frontend, eso es privacidad cosmética
- un atacante puede enumerar documentos y extraer metadata de ligas privadas

#### Hallazgo critico 2: partidas y pizarras tacticas publicas

Reglas actuales:

```text
match /live_matches/{matchId} {
  allow read: if true;
}

match /tactical_plays/{playId} {
  allow read: if true;
}
```

Riesgo:

- exposicion de estado de partido
- exposicion de jugadas o esquemas tacticos
- scraping trivial

#### Hallazgo medio: ausencia de validacion de schema en reglas

Las reglas protegen ownership, pero no validan:

- estructura minima
- tipos permitidos
- campos inesperados
- limites de arrays

Consecuencia:

- un owner puede escribir payloads tecnicamente validos pero semanticamente corruptos

### 3.4 Reglas mejoradas recomendadas

Ejemplo seguro para competiciones:

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function signedIn() {
      return request.auth != null;
    }

    function isAdmin() {
      return signedIn() &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }

    function isCompetitionOwner() {
      return signedIn() &&
        resource.data.createdBy == request.auth.uid;
    }

    function isCompetitionParticipant() {
      return signedIn() &&
        resource.data.participantIds.hasAny([request.auth.uid]);
    }

    function isPublicCompetition() {
      return resource.data.visibility == 'Public';
    }

    match /competitions/{compId} {
      allow read: if isPublicCompetition() || isCompetitionOwner() || isCompetitionParticipant() || isAdmin();

      allow create: if signedIn()
        && request.resource.data.createdBy == request.auth.uid
        && request.resource.data.visibility in ['Public', 'Private']
        && request.resource.data.name is string
        && request.resource.data.name.size() > 0
        && request.resource.data.name.size() <= 120;

      allow update: if isCompetitionOwner() || isAdmin();
      allow delete: if isCompetitionOwner() || isAdmin();
    }
  }
}
```

### 3.5 Cloud Functions

No se han encontrado Firebase Cloud Functions en el repositorio.

No hay uso de:

- `firebase/functions`
- `getFunctions`
- `httpsCallable`

Conclusión:

- la capa server-side actual **no es Firebase Functions**
- la capa server-side actual es **Vercel Functions**

Si existen Functions fuera de repo, no son auditables con el material disponible.

### 3.6 Storage

Firebase Storage se inicializa en:

- [`firebaseConfig.ts`](/C:/Users/jazex/Documents/New%20project/BloodBowlManager/firebaseConfig.ts)

Se detecta uso cliente-side en:

- [`pages/Oracle/TeamsPage.tsx`](/C:/Users/jazex/Documents/New%20project/BloodBowlManager/pages/Oracle/TeamsPage.tsx)

Problema importante:

- no existe `storage.rules` versionado en el repositorio

Impacto:

- no se puede auditar el control de acceso real a Storage desde IaC
- hay riesgo de drift entre consola Firebase y codigo

Riesgos:

- exposicion publica no intencionada
- uploads indebidamente permitidos
- sobreescritura de assets

### 3.7 App Check

No se detecta integracion con Firebase App Check.

Impacto:

- mayor facilidad de abuso automatizado del backend Firebase
- mayor superficie para bots y clientes no confiables

---

## 4. Integracion con OpenAI / Codex

### 4.1 Estado real actual

No se detecta API de OpenAI en el codigo actual.

La integracion detectada usa:

- `@google/genai`
- `gemini-2.5-flash`
- `imagen-4.0-generate-001`

Rutas:

- [`api/generate-name.ts`](/C:/Users/jazex/Documents/New%20project/BloodBowlManager/api/generate-name.ts)
- [`api/generate-crest.ts`](/C:/Users/jazex/Documents/New%20project/BloodBowlManager/api/generate-crest.ts)

### 4.2 Arquitectura recomendada para OpenAI/Codex

Patron recomendado:

```text
Frontend -> Backend propio / Vercel Function -> Verificacion Firebase ID Token ->
Validacion Zod -> Rate limit -> OpenAI API -> Sanitizacion de salida -> Persistencia opcional
```

### 4.3 Riesgos actuales de la integracion IA

1. Endpoints sin autenticacion.
2. Sin rate limiting.
3. Sin quotas.
4. Sin Zod/Joi.
5. Sin observabilidad por usuario.
6. Sin controles contra prompt injection contextual.
7. Sin validacion fuerte del output antes de uso.

### 4.4 Prompt engineering actual

Estado:

- prompts inline
- sin versionado
- sin system layer
- interpolacion directa de variables

Riesgo:

- salidas inconsistentes
- dificultad para hardening
- dificultad para testeo

### 4.5 Estrategias contra prompt injection

Actualmente no se detecta una defensa explicita contra:

- prompt injection
- prompt leaking
- instruction override
- data exfil via model instructions

### 4.6 Ejemplo de llamada segura a OpenAI

Ejemplo recomendado en backend Node/Vercel:

```ts
import OpenAI from 'openai';
import { z } from 'zod';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const BodySchema = z.object({
  rosterName: z.string().min(1).max(80),
  teamName: z.string().min(1).max(120).optional(),
});

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const parsed = BodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid payload', issues: parsed.error.flatten() });
  }

  const { rosterName } = parsed.data;

  const response = await openai.responses.create({
    model: 'gpt-5.4-mini',
    input: [
      {
        role: 'system',
        content: 'Genera un unico nombre de equipo para Blood Bowl. No devuelvas HTML ni Markdown. No incluyas texto adicional.'
      },
      {
        role: 'user',
        content: `Faccion: ${rosterName}`
      }
    ]
  });

  const output = response.output_text.trim();

  if (output.length > 120) {
    return res.status(502).json({ error: 'Model output invalid' });
  }

  return res.status(200).json({ name: output });
}
```

### 4.7 Recomendacion concreta

Si se migra a OpenAI:

- nunca llamar desde frontend
- usar backend dedicado
- verificar ID token Firebase
- aplicar `Zod`
- aplicar rate limiting
- almacenar metadatos de uso por usuario

---

## 5. Analisis por modulos

### 5.1 Home / Dashboard

Funcionalidad:

- landing operativa
- accesos a modulos
- resumen de actividad

Datos:

- equipos
- ligas
- eventos
- hero image

Riesgos:

- bajos a medios
- depende de datos maestros publicos
- riesgo principal es performance y consistencia visual, no acceso indebido

### 5.2 Oraculo

Funcionalidad:

- catalogo de equipos
- habilidades
- reglas
- estrellas
- incentivos
- calculadora

Datos:

- `master_data/*`
- assets de imagen desde GitHub raw
- en algunos casos Storage

Permisos:

- lectura publica
- operaciones admin sobre datos maestros desde cliente

Riesgos:

- lectura publica total de catalogos
- carga de imagenes desde GitHub raw y GitHub API
- potencial de rate limit externo por GitHub API
- deuda tecnica por mezclas con fallback estatico
- subida/actualizacion de imagenes desde cliente si reglas de Storage son debiles

### 5.3 Gremio

Funcionalidad:

- crear equipos
- gestionar plantilla
- staff
- historia
- export/import de franquicias

Datos:

- `users/{uid}/teams`
- reportes
- imagenes

Permisos:

- owner-only en subcolecciones de usuario

Riesgos:

- modo invitado usa `localStorage`
- import/export JSON cliente-side sin validacion fuerte
- posibilidad de datos corruptos importados
- gran parte de la logica de integridad vive en cliente

### 5.4 Ligas

Funcionalidad:

- crear competiciones
- participar
- calendario
- clasificacion
- resolucion de partidos

Datos:

- `leagues`
- `competitions`

Permisos:

- ownership para escritura
- lectura publica segun reglas actuales

Riesgos criticos:

- exposicion de ligas privadas
- posible manipulacion de clasificaciones por owner malicioso
- falta de validacion server-side del estado competitivo

### 5.5 Arena

Funcionalidad:

- seleccion
- prepartido
- partido
- KO recovery
- postpartido
- reportes

Datos:

- equipos gestionados
- clones competitivos
- reportes
- eventos de partido

Riesgos:

- mucha logica de arbitraje vive en frontend
- no hay motor servidor autoritativo
- si se persiste resultado desde cliente, puede haber manipulacion deliberada
- integridad competitiva dependiente de confianza en cliente

### 5.6 Pizarra tactica

Funcionalidad:

- jugadas / esquemas

Datos:

- `tactical_plays`

Riesgo fuerte:

- las reglas actuales permiten lectura publica de `tactical_plays`
- eso contradice la idea de estrategia privada o propietaria

### 5.7 Admin Panel

Funcionalidad:

- editar datos maestros
- importar/exportar
- autofill de imagenes
- ajustes

Datos:

- `master_data/*`
- `settings_master/*`

Permisos:

- UI oculta para no admins
- escritura protegida por Firestore rules

Riesgos:

- no hay auditoria server-side de cambios
- panel corre enteramente en cliente
- si se compromete una sesion admin, el atacante edita datos maestros directamente
- imports CSV sin validacion estructural robusta

---

## 6. Capa de seguridad actual

### 6.1 Validacion de datos

Estado detectado:

- validacion manual con `if`
- no `Zod`
- no `Joi`
- no `Yup`

Problema:

- contratos fragiles
- errores inconsistentes
- posibilidad de payloads semanticamente invalidos

### 6.2 Cabeceras de seguridad

No se detecta configuracion explicita de:

- CORS allowlist
- Content-Security-Policy
- Strict-Transport-Security
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy
- Permissions-Policy

Impacto:

- mayor superficie ante XSS si se introduce HTML futuro
- clickjacking no mitigado
- dependencia de defaults del hosting

### 6.3 Gestion de secretos

Estado:

- `API_KEY` en funciones serverless
- `GEMINI_API_KEY` inyectado via Vite `define`
- Firebase config hardcodeado

Analisis:

- la `apiKey` web de Firebase no es un secreto critico por si sola
- pero hardcodearla dificulta segregacion por entorno
- la mezcla de variables IA entre frontend y backend si es preocupante

### 6.4 Configuraciones debiles detectadas

1. `master_data` lectura publica indiscriminada
2. `competitions/leagues/live_matches/tactical_plays` lectura publica
3. ausencia de App Check
4. ausencia de headers de seguridad
5. ausencia de rate limiting
6. ausencia de validacion estructural

---

## 7. Infraestructura y CI/CD

### 7.1 Hosting

Estado inferido:

- Vercel para frontend y funciones `/api`
- Firebase para datos/autenticacion/storage

### 7.2 Pipeline de despliegue

No se detectan workflows en:

- `.github/workflows`

Conclusión:

- no hay pipeline CI/CD versionado en repo
- el despliegue probablemente depende de:
  - Vercel Git integration
  - o despliegues manuales

### 7.3 Gestion de secretos en CI/CD

No auditable desde repo.

Lo que si se observa:

- dependencia de variables de entorno en Vercel
- estrategia de entorno inconsistente

### 7.4 Rollback

No se detecta estrategia versionada de rollback en repo.

Si Vercel esta conectado a Git, el rollback dependera de:

- redeploy de commit anterior
- o UI de Vercel

Esto no sustituye una politica formal de rollback.

### 7.5 Riesgos CI/CD

- falta de pipeline auditable
- falta de checks automáticos de seguridad
- falta de escaneo de secretos
- falta de deploy gates

---

## 8. Auditoria de seguridad y recomendaciones

### 8.1 Vulnerabilidades priorizadas

#### Criticas

1. **Lectura publica de competiciones privadas**
   - OWASP A01 Broken Access Control
   - archivo: [`firestore.rules`](/C:/Users/jazex/Documents/New%20project/BloodBowlManager/firestore.rules)

2. **Lectura publica de live matches y tactical plays**
   - OWASP A01 Broken Access Control
   - archivo: [`firestore.rules`](/C:/Users/jazex/Documents/New%20project/BloodBowlManager/firestore.rules)

3. **Rutas IA sin autenticacion, cuotas ni rate limiting**
   - OWASP A04 Insecure Design
   - OWASP API Security: Unrestricted Resource Consumption
   - archivos:
     - [`api/generate-name.ts`](/C:/Users/jazex/Documents/New%20project/BloodBowlManager/api/generate-name.ts)
     - [`api/generate-crest.ts`](/C:/Users/jazex/Documents/New%20project/BloodBowlManager/api/generate-crest.ts)

#### Altas

4. **Inyeccion de variables IA en frontend via Vite**
   - OWASP A05 Security Misconfiguration
   - archivo: [`vite.config.ts`](/C:/Users/jazex/Documents/New%20project/BloodBowlManager/vite.config.ts)

5. **Ausencia de headers de seguridad**
   - OWASP A05 Security Misconfiguration
   - archivo implicado: [`index.html`](/C:/Users/jazex/Documents/New%20project/BloodBowlManager/index.html)

6. **Sin App Check**
   - abuso automatizado de Firebase

7. **Storage rules no auditables desde repo**
   - riesgo de configuracion debil fuera de codigo

#### Medias

8. **Documentos maestros monoliticos**
   - rendimiento
   - integridad
   - colisiones de escritura

9. **Listeners globales siempre activos**
   - rendimiento
   - coste Firestore

10. **CDN runtime para dependencias criticas**
   - cadena de suministro
   - CSP mas dificil
   - performance

11. **Service worker con estrategia de cache arriesgada**
   - stale assets
   - cache de terceros
   - complejidad de invalidacion

#### Bajas

12. **Admin sin backend de auditoria**
13. **Codigo muerto / imports no usados**
14. **Fallbacks estaticos mezclados con datos maestros**

### 8.2 Quick wins

1. Cerrar lecturas publicas de `competitions`, `leagues`, `live_matches`, `tactical_plays`.
2. Eliminar `process.env.API_KEY` y `process.env.GEMINI_API_KEY` del `define` de Vite.
3. Añadir `Zod` a rutas IA.
4. Añadir verificacion de Firebase ID token en rutas IA.
5. Añadir rate limiting server-side.
6. Introducir CSP minima y `X-Frame-Options: DENY`.

### 8.3 Mejoras estructurales

1. Migrar master data a colecciones document-per-item.
2. Pasar a backend mas autoritativo para operaciones competitivas criticas.
3. Añadir App Check.
4. Migrar scripts CDN a dependencias empaquetadas.
5. Reemplazar service worker actual por estrategia basada en build outputs.

---

## 9. Observabilidad y rendimiento

### 9.1 Logging

Estado actual:

- `console.error`
- `console.warn`
- logs locales

No se detecta:

- Sentry
- Datadog
- OpenTelemetry
- Cloud Logging estructurado

### 9.2 Monitorizacion

No se detectan:

- dashboards de latencia
- alertas de error
- metrica de consumo IA
- alertas de Firestore read/write spikes

### 9.3 Deteccion de anomalias

No hay mecanismos visibles para:

- detectar abuso de endpoints IA
- detectar scrapers de Firestore
- detectar picos de Storage
- detectar write loops en listeners

### 9.4 Cuellos de botella potenciales

#### Firebase

- listeners globales en raiz
- arrays completos en docs maestros
- writes masivos con `setDoc`

#### IA

- sin cola
- sin budget por usuario
- sin memoizacion
- sin retry policy ni circuit breaker

#### Frontend

- CSR completo
- scripts globales
- importaciones eager
- service worker cache agresivo

---

## 10. Ejemplos tecnicos de mitigacion

### 10.1 Middleware de validacion + auth en Vercel

```ts
import { z } from 'zod';
import { getAuth } from 'firebase-admin/auth';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const BodySchema = z.object({
  rosterName: z.string().min(1).max(80),
});

export async function requireUser(req: VercelRequest) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Missing bearer token');
  }

  const token = authHeader.slice('Bearer '.length);
  return await getAuth().verifyIdToken(token);
}

export function validateBody(req: VercelRequest) {
  const parsed = BodySchema.safeParse(req.body);
  if (!parsed.success) {
    throw new Error('Invalid request body');
  }
  return parsed.data;
}
```

### 10.2 Ejemplo de rate limiting

```ts
const quotaMap = new Map<string, { count: number; resetAt: number }>();

function enforceRateLimit(key: string, limit = 10, windowMs = 60_000) {
  const now = Date.now();
  const entry = quotaMap.get(key);

  if (!entry || entry.resetAt < now) {
    quotaMap.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }

  if (entry.count >= limit) {
    throw new Error('Rate limit exceeded');
  }

  entry.count += 1;
}
```

### 10.3 Regla segura para Storage

```js
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    function signedIn() {
      return request.auth != null;
    }

    function isAdmin() {
      return signedIn() &&
        firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }

    match /team-crests/{teamId}/{fileName} {
      allow read: if true;
      allow write: if isAdmin()
        && request.resource.size < 2 * 1024 * 1024
        && request.resource.contentType.matches('image/.*');
    }
  }
}
```

### 10.4 Manejo correcto de autenticacion

Patron recomendado:

```text
Frontend obtiene Firebase ID token
-> Backend Vercel verifica token con firebase-admin
-> Backend evalua rol y cuota
-> Backend llama a IA
-> Backend registra uso
-> Backend devuelve salida validada
```

---

## 11. Plan de remediacion sugerido

### Fase 1 - endurecimiento inmediato

1. Reglas Firestore para privacidad real.
2. Quitar env IA del bundle.
3. Zod en rutas IA.
4. Verificacion de ID token.
5. Rate limiting.
6. CSP minima.

### Fase 2 - robustez operativa

1. App Check.
2. Logging estructurado.
3. metrica de uso IA por usuario.
4. versionado de prompts.
5. document-per-item en `master_data`.

### Fase 3 - seguridad y rendimiento estructural

1. reemplazar CDN runtime
2. code splitting por modulos
3. service worker basado en assets build
4. backend autoritativo para competiciones criticas

---

## 12. Veredicto final

La base del producto es valida, pero hoy la arquitectura presenta varios riesgos reales y explotables:

- control de acceso demasiado laxo en Firestore
- ausencia de controles de abuso sobre IA
- configuracion de entorno inconsistente
- datos maestros poco escalables
- dependencias externas cargadas en cliente sin endurecimiento suficiente

La prioridad numero uno no es estetica ni refactor menor:

1. control de acceso,
2. proteccion del backend IA,
3. consolidacion de datos maestros,
4. y observabilidad.

Si se corrigen esos cuatro frentes, la aplicacion pasa de "funcional con riesgo operativo" a una base mucho mas profesional y defendible.

