# PHOTO_FOLDER_MAP

Documento vivo para mantener alineados:
- los nombres canónicos de las razas
- las carpetas de `Foto plantilla`
- las subcarpetas de posiciones
- y la lógica de sincronización de imágenes del código

La referencia principal del código está en:
- [`utils/imageUtils.ts`](utils/imageUtils.ts)

## Regla general

Para añadir nuevas fotos de plantilla:
1. usa el nombre canónico de la raza
2. mete la imagen en la carpeta de esa raza
3. si la raza usa subcarpetas, usa la subcarpeta de posición correcta
4. nombra la imagen con un número o un identificador coherente con el resto del stock

## Carpetas raíz canónicas

Estas son las carpetas que la app debe intentar por defecto en `Foto plantilla`:

| Raza en la app | Carpeta raíz canónica | Alias legados detectados |
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
| Necromantic Horror | `Horror Nigromántico` | `Horror NigromÃ¡ntico`, `Necromantic Horror` |
| Humans | `Humano` | `Humanos`, `Humans` |
| Shambling Undead | `No Muertos` | `Shambling Undead` |
| Norse | `Nórdicos` | `Nordicos`, `Norse` |
| Nurgle | `Nurgle` | - |
| Ogres | `Ogros` | `Ogres` |
| Orcs | `Orcos` | `Orcs` |
| Black Orcs | `Orcos negros` | `Black Orcs` |
| Chaos Renegades | `Renegados` | `Renegados del Caos`, `Chaos Renegades` |
| Tomb Kings | `Reyes de las Tumbas` | `Tomb Kings` |
| Skaven | `Skaven` | - |
| Slann (NAF) | `Slann (NAF)` | - |
| Elven Union | `Union Elfica` | `Unión Élfica`, `Elven Union` |
| Vampires | `Vampiros` | `Vampires` |

## Subcarpetas canónicas de posición

Las siguientes subcarpetas son las que el código usa para construir las rutas de fotos de jugador.
Si existe un alias antiguo en GitHub, el código intenta normalizarlo al nombre canónico.

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

### Horror Nigromántico
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

### Nórdicos
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
- `Horror NigromÃ¡ntico` y `Horror Nigromántico`
- `Unión �0lfica` y `Union Elfica`
- algunas subcarpetas `la-nea` / `linea`
- algunas subcarpetas `na-rdicos-*` frente a `nordicos-*`
- algunas subcarpetas `zombie-la-nea` frente a `zombie-linea`

La idea es:
- carpeta canónica para nuevas fotos
- alias de lectura para fotos antiguas
- rutas generadas siempre desde el nombre canónico

## Cómo se sincroniza la app

1. La raza se normaliza con `getTeamPrefix(...)`.
2. Se intenta leer la carpeta raíz canónica y sus alias.
3. Si hay subcarpetas, se normalizan a su tag canónico.
4. `TeamDashboard` reparte fotos por posición sin repetir mientras haya stock.
5. Si una imagen falla, se intenta la siguiente disponible.

## Regla de oro

Si vas a subir fotos nuevas:
- usa primero la carpeta canónica
- usa los nombres de subcarpeta de esta guía
- evita crear una segunda carpeta con el mismo equipo salvo que sea un alias viejo que ya existe
