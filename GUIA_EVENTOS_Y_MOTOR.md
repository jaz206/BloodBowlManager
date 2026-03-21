# Guia de Eventos y Motor Tecnico

Este documento explica como la aplicacion traduce acciones de mesa en estado, log y cronica.

## 1. Estructura de evento
Cada accion relevante genera un objeto `GameEvent` que alimenta:
- el log del partido,
- la cronica,
- el postpartido,
- y, si procede, el historial de competicion.

Campos habituales:
- `id`
- `turn`
- `half`
- `team`
- `player`
- `type`
- `result`
- `target`
- `description`
- `timestamp`

## 2. Tipos de evento
Los eventos mas relevantes hoy son:
- `TURNOVER`
- `TOUCHDOWN`
- `INJURY`
- `FOUL`
- `PASS`
- `CASUALTY`
- `MVP`
- `WEATHER`
- `INFO`
- `WARNING`
- `SUCCESS`

## 3. Fases del partido
La arena se divide en estas fases:
1. `selection`
2. `pre_game`
3. `in_progress`
4. `ko_recovery`
5. `post_game`
6. `reports`

## 4. Acciones del jugador
La interfaz del partido usa un panel unico con acciones de mesa:
- `ACCION OK`
- `CAIDA / FALLO`
- `PLACAJE`
- `FALTA`
- `PASE`
- `TOUCHDOWN`
- `ASEGURAR`

## 5. Sistema de tiradas
Todas las tiradas siguen el mismo patron:
- entrada manual por casillas,
- o resolucion automatica.

El modal muestra titulo contextual para saber si se esta tirando:
- armadura,
- heridas,
- pase,
- bloqueo,
- esquiva,
- sprint,
- falta,
- o asegurado.

## 6. Caida de mesa
El flujo de `CAIDA / FALLO` en arena sigue la logica de Blood Bowl de mesa:
- fallo de esquiva o sprint -> turnover;
- el jugador queda derribado;
- si no rompe armadura, la secuencia acaba;
- si rompe armadura, se resuelve herida;
- el resultado puede dejar al jugador aturdido, KO o lesionado;
- el cierre se registra en log y cronica.

## 7. Integracion narrativa
La cronica se alimenta de los eventos del partido y del cierre del acta.
El `newsGenerator.ts` puede transformar el resumen tecnico en un reporte narrativo de la jornada.
