# Guia Razas

Listado actual de razas/equipos base presentes en la web.

Fuente de referencia usada para este documento:
- `C:\Users\jazex\Documents\New project\BloodBowlManager\data\teams.ts`

## Resumen
- Total actual: `26` razas/equipos
- Nombre canonico: el que usa la app internamente
- Nombre en espanol: referencia amigable para contenido, documentacion y carpetas legacy

## Catalogo actual

| # | Nombre canonico | Nombre en espanol | Tier |
|---|---|---|---|
| 1 | Amazons | Amazonas | 1 |
| 2 | Black Orcs | Orcos Negros | 3 |
| 3 | Chosen of Chaos | Elegidos del Caos | 3 |
| 4 | Chaos Dwarfs | Enanos del Caos | 1 |
| 5 | Chaos Renegades | Renegados del Caos | 3 |
| 6 | Dark Elves | Elfos Oscuros | 1 |
| 7 | Dwarfs | Enanos | 1 |
| 8 | Elven Union | Union Elfica | 2 |
| 9 | Gnomes | Gnomos | 4 |
| 10 | Goblins | Goblins | 4 |
| 11 | Halflings | Halflings | 4 |
| 12 | High Elves | Elfos Altos | 1 |
| 13 | Humans | Humanos | 2 |
| 14 | Lizardmen | Hombres Lagarto | 1 |
| 15 | Necromantic Horror | Horror Nigromantico | 2 |
| 16 | Norse | Nordicos | 1 |
| 17 | Nurgle | Nurgle | 3 |
| 18 | Ogres | Ogros | 4 |
| 19 | Old World Alliance | Alianza del Viejo Mundo | 1 |
| 20 | Bretonnians | Bretonianos | 2 |
| 21 | Imperial Nobility | Nobleza Imperial | 2 |
| 22 | Khorne | Khorne | 3 |
| 23 | Snotling | Snotling | 4 |
| 24 | Vampires | Vampiros | 2 |
| 25 | Wood Elves | Elfos Silvanos | 1 |
| 26 | Slann (NAF) | Slann (NAF) | 2 |

## Uso recomendado
- Para Firebase, mantener siempre el `Nombre canonico` como fuente de verdad.
- Para carpetas de fotos nuevas, usar tambien el `Nombre canonico` exacto.
- Para textos de interfaz o documentacion en espanol, usar la columna `Nombre en espanol`.

## Nota
Si mas adelante el catalogo oficial pasa a leerse solo desde Firebase para esta parte, convendra regenerar este documento con esa fuente y no desde `teams.ts`.
