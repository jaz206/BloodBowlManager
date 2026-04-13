# Biblioteca de Blood Bowl

Este documento es la base de conocimiento viva del proyecto.

La idea es usarlo como notebook de referencia para:

- manuales de Blood Bowl
- fichas oficiales de equipos
- equipos canónicos de la aplicación
- criterios de diseño y reglas que afecten a la app
- decisiones futuras que no deban perder contexto

No pretende duplicar el código. Su función es explicar la verdad de dominio que la aplicación intenta representar.

## 1. Qué debe vivir aquí

### Manuales

Cada manual, PDF o documento de referencia debería dejar aquí:

- nombre del archivo o fuente
- edición o versión
- qué parte del juego cubre
- qué capítulos impactan en la app
- reglas o matices importantes
- dudas abiertas o contradicciones

### Equipos

Cada equipo debería documentarse con:

- nombre canónico en inglés
- alias en español
- tier
- roster base
- posiciones
- atributos
- habilidades iniciales
- coste
- rerolls
- boticario
- ligas o formato
- imagen base
- notas de encuadre del escudo

### Reglas y excepciones

Si una regla cambia una decisión de UI, de datos o de lógica, debe quedar anotada aquí para poder debatirla después sin volver a leer todo el PDF.

## 2. Relación con la app

### Oráculo

Oráculo es la cara consultiva de esta biblioteca.

- lee equipos, habilidades, estrellas, reglas e incentivos
- permite navegar por la información
- debe reflejar la versión canónica más reciente

### Gremio

Gremio usa la biblioteca para:

- fundar equipos
- mostrar nombres canónicos
- resolver escudos
- enseñar roster y habilidades base
- gestionar la plantilla activa

### Admin

Admin escribe parte del contenido de esta biblioteca en Firestore:

- `master_data`
- `settings_master`

Cuando se actualiza una ficha o un roster en el admin, la base documental debe reflejar esa decisión.

### Arena

Arena usa la biblioteca para:

- saber cómo se resuelven las acciones
- entender el flujo de turno
- aplicar reglas de partido
- alinear estados y resultados con el juego real

## 3. Cómo documentar un manual

### Plantilla recomendada

```md
## [Nombre del manual]

- Fuente:
- Edición:
- Archivo:
- Qué cubre:
- Qué toca en la app:
- Reglas relevantes:
- Cambios respecto a versiones anteriores:
- Dudas o puntos abiertos:
```

### Qué interesa anotar de verdad

- cambios de reglas
- nombres de categorías
- diferencias entre ediciones
- condiciones especiales por raza
- mecánicas que afecten a interfaz o persistencia

### Qué no hace falta repetir

- texto largo completo del manual
- explicaciones obvias que ya vivan en el código
- reglas que no impacten en la app

## 4. Cómo documentar un equipo

### Plantilla recomendada

```md
## [Nombre canónico]

- Alias:
- Tier:
- Liga(s):
- Roster base:
- Coste de reroll:
- Boticario:
- Regla especial:
- Posiciones:
- Habilidades iniciales:
- Atributos importantes:
- Imagen canónica:
- Escudo canónico:
- Notas de UI:
- Observaciones de balance:
```

### Campos importantes

#### Nombre canónico

Siempre conviene usar un nombre canónico en inglés para evitar doble interpretación en:

- código
- Firestore
- buscador
- imagenes

#### Alias

Sirven para:

- búsquedas en español
- nombres históricos
- compatibilidad con datos viejos

#### Posiciones

Para cada posición conviene guardar:

- nombre
- cantidad
- coste
- MA / ST / AG / PA / AV
- habilidades iniciales
- primarias
- secundarias

#### Escudo

El escudo se documenta con:

- nombre exacto del archivo
- carpeta de origen
- escala visual recomendada
- desplazamiento recomendado si hace falta
- observaciones de encuadre

## 5. Convenciones que usa la app

### Nombres

- La app trabaja mejor si el nombre canónico vive en inglés.
- Los nombres en español pueden quedar como alias o referencia de búsqueda.
- Si un equipo tiene variantes viejas o mojibake, la base documental debe recogerlas para poder normalizarlas.

### Imágenes

- `Escudos` para escudos de raza o franquicia según el caso.
- `Star Players` para jugadores estrella.
- `Foto plantilla` para imágenes de jugadores o roster.

### Persistencia

- `master_data` para el catálogo base.
- `managedTeams` para equipos creados por usuario.
- `competitions` y `leagues` para competiciones.

### Interfaz

- los nombres largos deben priorizar legibilidad
- las tarjetas deben respirar
- el escudo debe ocupar espacio útil
- la información clave debe ir primero

## 6. Cómo usar esta biblioteca como notebook

La mejor forma de usarla es ir añadiendo notas pequeñas y verificables.

### Para cada cambio importante

1. Anota la fuente.
2. Anota la decisión.
3. Anota dónde se refleja en la app.
4. Anota si hay compatibilidad con datos viejos.
5. Anota si hay impacto visual.

### Ejemplo de nota corta

```md
## Cambio de roster

- Fuente: Nufflepedia v0.03
- Decisión: el roster canónico queda en inglés
- Impacto: afecta a Oráculo, Gremio y Firestore
- Compatibilidad: mantener alias en español para búsqueda
```

## 7. Índice sugerido

Puedes ir ampliando este documento con secciones como:

- Manuales oficiales
- Equipos base
- Star players
- Incentivos
- Reglas de campo
- Cambios por edición
- Decisiones de UI
- Cambios de balance
- Historial de normalización de nombres
- Casos especiales de imágenes

## 8. Cómo se conecta con el código

Los archivos del repo que más conviene cruzar con esta biblioteca son:

- `CEREBRO_APP.md`
- `FUNCIONALIDAD_SECCIONES.md`
- `ARQUITECTURA_APP.md`
- `data/teams.ts`
- `hooks/useMasterData.ts`
- `utils/teamData.ts`
- `utils/imageUtils.ts`
- `components/shared/AdminPanel.tsx`
- `components/shared/AdminTeamForm.tsx`
- `pages/Oracle/*`
- `pages/Guild/*`
- `pages/Arena/*`

## 9. Regla de mantenimiento

Si una nueva decisión cambia la forma en que la app entiende Blood Bowl, debe quedar reflejada aquí antes o justo después de tocar el código.

La meta es que este archivo permita responder preguntas como:

- ¿por qué este equipo tiene este tier?
- ¿por qué esta habilidad se muestra así?
- ¿qué archivo de imagen es el canónico?
- ¿qué parte del manual justifica este comportamiento?
- ¿qué debemos cambiar si sale una nueva edición?

