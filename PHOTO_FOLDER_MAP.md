# PHOTO_FOLDER_MAP

Documento vivo para mantener alineados:
- los nombres canonicos de las razas
- las carpetas de `Foto plantilla`
- las subcarpetas de posiciones
- y la logica de sincronizacion de imagenes del codigo

La referencia principal del codigo esta en:
- [`utils/imageUtils.ts`](utils/imageUtils.ts)

## Regla general

Para anadir nuevas fotos de plantilla:
1. usa el nombre canonico de la raza
2. mete la imagen en la carpeta de esa raza
3. si la raza usa subcarpetas, usa la subcarpeta de posicion correcta
4. nombra la imagen con un numero o identificador coherente con el resto del stock

## Carpetas raiz canonicas

Estas son las carpetas que la app debe intentar por defecto en `Foto plantilla`:

| Raza en la app | Carpeta raiz canonica | Alias legados detectados |
|---|---|---|
| Amazons | `Amazonas` | `Amazons` |
| Old World Alliance | `Alianza del Viejo Mundo` | `Old World Alliance` |
| Chosen of Chaos | `Elegidos del Caos` | `Chosen of Chaos` |
| High Elves | `Elfos Altos` | `Altos Elfos` |
| Dark Elves | `Elfos Oscuros` | `Dark Elves` |
| Wood Elves | `Elfos Silvanos` | `Wood Elves` |
| Dwarfs | `Enanos` | `Dwarfs` |
| Chaos Dwarfs | `Enanos del caos` | `Enanos del Caos`, `Chaos Dwarfs` |
| Gnomes | `Gnomos` | `Gnomes` |
| Goblins | `Goblins` | - |
| Underworld Denizens | `Habitantes del Inframundo` | `Underworld Denizens` |
| Halflings | `Halflings` | - |
| Lizardmen | `Hombres Lagarto` | `Lagartos`, `Lizardmen` |
| Necromantic Horror | `Horror Nigromantico` | `Horror Nigromantico`, `Horror Nigromantico legacy`, `Necromantic Horror` |
| Humans | `Humano` | `Humanos`, `Humans` |
| Shambling Undead | `No Muertos` | `Shambling Undead` |
| Norse | `Nordicos` | `Nordicos`, `Norse` |
| Nurgle | `Nurgle` | - |
| Ogres | `Ogros` | `Ogres` |
| Orcs | `Orcos` | `Orcs` |
| Black Orcs | `Orcos negros` | `Black Orcs` |
| Chaos Renegades | `Renegados` | `Renegados del Caos`, `Chaos Renegades` |
| Tomb Kings | `Reyes de las Tumbas` | `Tomb Kings` |
| Skaven | `Skaven` | - |
| Slann (NAF) | `Slann (NAF)` | - |
| Elven Union | `Union Elfica` | `Union Elfica`, `Unión Elfica`, `Elven Union` |
| Vampires | `Vampiros` | `Vampires` |

## Subcarpetas canonicas de posicion

Las siguientes subcarpetas son las que el codigo usa para construir las rutas de fotos de jugador.
Si existe un alias antiguo en GitHub, el codigo intenta normalizarlo al nombre canonico.

### Amazonas
- `eagle-guerrero-linea`
- `python-guerrero-lanzador`
- `jaguar-guerrero-bloqueador`
- `piranha-guerrero-placador`

### Alianza del Viejo Mundo
- `old-world-humanos-linea`
- `old-world-humanos-lanzador`
- `old-world-humanos-placador`
- `old-world-humanos-receptor`
- `old-world-enanos-bloqueador`
- `old-world-enanos-corredor`
- `old-world-enanos-placador`
- `old-world-enanos-troll-slayer`
- `old-world-halflings-hopeful`

### Elegidos del Caos
- `bestia-del-caos`
- `elegido-bloqueador`
- `minotauro-del-caos`

### Elfos Altos
- `linea`
- `lanzador`
- `placador`
- `receptor`

### Elfos Oscuros
- `elfos-oscuros-linea`
- `corredor`
- `assassin`
- `placador`
- `witch-elf`

### Elfos Silvanos
- `elfos-silvanos-linea`
- `lanzador`
- `receptor`
- `wardancer`
- `loren-forest-treeman`

### Enanos
- `enanos-bloqueador-linea`
- `corredor`
- `placador`
- `troll-slayer`
- `deathroller`

### Enanos del caos
- `hobgoblin-linea`
- `hobgoblin-sneaky-stabba`
- `enanos-del-caos-bloqueador`
- `bull-centaur-placador`
- `renegade-minotauro`

### Gnomos
- `gnomos-linea`
- `gnomos-beastmaster`
- `gnomos-illusionist`
- `woodland-fox`
- `altern-forest-treeman`

### Goblins
- `goblins-linea`
- `looney`
- `bomma`
- `hooligan`
- `doom-diver`
- `fanatic`
- `pogoer`
- `trained-troll`

### Habitantes del Inframundo
- `underworld-goblins-linea`
- `gutter-corredor`
- `skaven-clanrat-linea`
- `skaven-lanzador`
- `skaven-placador`
- `underworld-snotlings`
- `underworld-troll`
- `mutant-rat-ogros`

### Halflings
- `halflings-hopeful-linea`
- `halflings-hefty`
- `halflings-receptor`
- `altern-forest-treeman`

### Hombres Lagarto
- `skink-corredor-linea`
- `chameleon-skink`
- `saurus-bloqueador`
- `kroxigor`

### Horror Nigromantico
- `zombie-linea`
- `ghoul-corredor`
- `espectro`
- `flesh-golem-de-carne`
- `werewolf`

### Humano
- `humanos-linea`
- `lanzador`
- `placador-blitzer`
- `receptor`
- `ogros`
- `halflings-hopeful`

### No Muertos
- `zombie-linea`
- `esqueleto-linea`
- `ghoul-corredor`
- `momia`
- `tumulo-placador`

### Nordicos
- `nordicos-berserker`
- `nordicos-raider-linea`
- `beer-boar`
- `ulfwerener`
- `valkyrie`
- `yhetee`

### Nurgle
- `rotter-linea`
- `pestigor`
- `bloater`
- `rotspawn`

### Ogros
- `gnoblar-linea`
- `ogros-bloqueador`
- `ogros-runt-punter`

### Orcos
- `orcos-linea`
- `lanzador`
- `blitzer-orco`
- `fortachon-bloqueador`
- `goblins`
- `untrained-troll`

### Orcos negros
- `orcos-negros`
- `goblins-bruiser-linea`
- `trained-troll`

### Renegados
- `renegade-humanos-linea`
- `renegade-humanos-lanzador`
- `renegade-goblins`
- `renegade-orcos`
- `renegade-skaven`
- `renegade-elfos-oscuros`
- `renegade-troll`
- `renegade-ogros`
- `renegade-minotauro`
- `renegade-rat-ogros`

### Reyes de las Tumbas
- `esqueleto-linea`
- `anointed-lanzador`
- `anointed-placador`
- `tomb-guardian`

### Skaven
- `skaven-clanrat-linea`
- `gutter-corredor`
- `lanzador`
- `placador`
- `rat-ogros`

### Slann (NAF)
- `linea`
- `placador`
- `receptor`
- `kroxigor`

### Union Elfica
- `la-nea`
- `lanzador`
- `placador`
- `receptor`

### Vampiros
- `thrall-linea`
- `vampiros-corredor`
- `vampiros-lanzador`
- `vampiros-placador`
- `vargheist`

## Alias y carpetas legacy

Hay carpetas duplicadas o con mojibake que la app sigue tolerando para no romper el stock ya existente:

- `Nordicos` y `Nórdicos`
- `Horror Nigromantico` y `Horror Nigromántico`
- `Union Elfica` y `Unión Elfica`
- algunas subcarpetas `la-nea` / `linea`
- algunas subcarpetas `na-rdicos-*` frente a `nordicos-*`
- algunas subcarpetas `zombie-la-nea` frente a `zombie-linea`

La idea es:
- carpeta canónica para nuevas fotos
- alias de lectura para fotos antiguas
- rutas generadas siempre desde el nombre canónico

## Duplicados detectados en disco

En la carpeta real de `Foto plantilla`, conviene considerar estas como las carpetas canónicas:

- `Elfos Altos`
- `Elfos Silvanos`
- `Horror Nigromántico`
- `Nórdicos`
- `Union Elfica`

Y tratar estas como legacy o duplicadas:

- `Altos Elfos`
- `Wood Elves`
- `Horror NigromÃ¡ntico`
- `Nordicos`
- `Unión �0lfica`

El resto de razas ya queda alineado con la app:

- `Amazonas`
- `Alianza del Viejo Mundo`
- `Elegidos del Caos`
- `Enanos`
- `Enanos del caos`
- `Gnomos`
- `Goblins`
- `Habitantes del Inframundo`
- `Halflings`
- `Hombres Lagarto`
- `Humano`
- `No Muertos`
- `Nurgle`
- `Ogros`
- `Orcos`
- `Orcos negros`
- `Renegados`
- `Reyes de las Tumbas`
- `Skaven`
- `Slann (NAF)`
- `Vampiros`

## Como se sincroniza la app

1. La raza se normaliza con `getTeamPrefix(...)`.
2. Se intenta leer la carpeta raiz canonica y sus alias.
3. Si hay subcarpetas, se normalizan a su tag canonico.
4. `TeamDashboard` reparte fotos por posicion sin repetir mientras haya stock.
5. Si una imagen falla, se intenta la siguiente disponible.

## Regla de oro

Si vas a subir fotos nuevas:
- usa primero la carpeta canónica
- usa los nombres de subcarpeta de esta guía
- evita crear una segunda carpeta con el mismo equipo salvo que sea un alias viejo que ya existe
