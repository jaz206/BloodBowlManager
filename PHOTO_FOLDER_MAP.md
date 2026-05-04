# PHOTO_FOLDER_MAP

Guia viva para mantener alineadas:
- la BBDD (`master_data/teams`)
- la app web
- y la carpeta de fotos en `C:\Users\jazex\Documents\GitHub\Bloodbowl-image\Foto plantilla`

## Regla canonica nueva

La estructura buena, a partir de ahora, es:

```text
Foto plantilla/
  <Team.name exacto de Firebase>/
    <Player.position exacto de Firebase>/
      00.png
      01.png
      02.png
```

Ejemplos reales:

```text
Foto plantilla/
  Amazons/
    Eagle Warrior/
      00.png
      01.png
      02.png
    Jaguar Warrior/
      00.png
      01.png

  Dwarfs/
    Dwarf Blocker/
      00.png
      01.png
    Troll Slayer/
      00.png
```

## Convencion de ficheros

- `00.png`: imagen generica de la posicion
- `01.png`, `02.png`, `03.png`...: variantes unicas

La app prioriza ya esta estructura:
1. carpeta de equipo exacta
2. carpeta de posicion exacta
3. ficheros numerados

Si no encuentra eso, sigue tolerando temporalmente carpetas legacy antiguas para no romper lo ya subido.

## Que nombres usar

Usa siempre los nombres exactos que ya viven en Firebase:

- Equipo: `team.name`
- Posicion: `player.position`

No traduzcas ni conviertas a slug si no hace falta.

Ejemplos correctos:
- `Amazons`
- `Black Orcs`
- `Necromantic Horror`
- `Elven Union`
- `Eagle Warrior`
- `Python Warrior`
- `Dwarf Blocker`
- `Goblin Bruiser`
- `Orc Lineman`

## Estado actual del repo de imagenes

Ahora mismo en `Bloodbowl-image` conviven dos mundos:

### Estructura legacy
- carpetas de raza en espanol
- subcarpetas slugged
- algunas duplicadas
- algunos nombres con mojibake

Ejemplos:
- `Amazonas/eagle-guerrero-linea`
- `Enanos/enanos-bloqueador-linea`
- `Orcos/blitzer-orco`
- `Horror NigromÃ¡ntico`
- `Nordicos`
- `Unión �0lfica`

### Estructura objetivo
- carpetas exactas de Firebase
- sin slugs manuales
- sin nombres duplicados
- sin mojibake

## Compatibilidad actual del codigo

La web ya esta preparada para:

1. intentar primero la estructura nueva exacta
2. aceptar aun las carpetas legacy antiguas como fallback
3. leer stock aunque las carpetas viejas sigan existiendo

Esto permite migrar sin romper la app.

## Plan de limpieza recomendado

### Fase 1
Para fotos nuevas:
- usa solo estructura canonica nueva
- no anadas nada nuevo en carpetas legacy

### Fase 2
Migra poco a poco las carpetas antiguas:
- `Amazonas` -> `Amazons`
- `Enanos` -> `Dwarfs`
- `Orcos` -> `Orcs`
- `Horror NigromÃ¡ntico` -> `Necromantic Horror`
- `Nordicos` / `Nórdicos` -> `Norse`
- `Union Elfica` / `Unión �0lfica` -> `Elven Union`

### Fase 3
Dentro de cada equipo:
- `eagle-guerrero-linea` -> `Eagle Warrior`
- `python-guerrero-lanzador` -> `Python Warrior`
- `enanos-bloqueador-linea` -> `Dwarf Blocker`
- `blitzer-orco` -> `Blitzer`
- `orcos-linea` -> `Orc Lineman`

## Regla de oro

Si quieres que una foto sincronice de inmediato en la web:

- crea la carpeta del equipo con el nombre exacto de Firebase
- crea la carpeta de posicion con el nombre exacto de Firebase
- mete `00.png`, `01.png`, `02.png`...

Eso ya es lo que la app entiende como estructura prioritaria.
