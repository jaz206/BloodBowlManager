# Arquitectura y Funcionamiento Tecnico: La Arena

Este documento resume como funciona hoy la arena de partido.

## 1. Objetivo de la arena
La arena no pretende ser un videojuego paralelo. Su objetivo es servir como suite de gestion de un partido de mesa:
- preparar el encuentro,
- resolver acciones del turno,
- registrar eventos relevantes,
- cerrar el partido,
- aplicar consecuencias al clon y a la cronica.

## 2. Flujo general
1. `selection`: carga y preparacion de equipos.
2. `pre_game`: jornaleros, incentivos, clima y patada inicial.
3. `in_progress`: mesa de partido con dos plantillas y panel de accion.
4. `ko_recovery`: recuperacion de KO entre drives.
5. `post_game`: cierre de acta, SPP, cronica y persistencia.
6. `reports`: archivo de partidos y estadisticas.

## 3. Mesa de partido
- La pantalla principal muestra dos plantillas.
- Solo actua el equipo activo.
- El jugador seleccionado abre su panel lateral de acciones.
- El otro equipo queda bloqueado visualmente.
- El botonera inferior de accion duplicada ya no forma parte del flujo principal.

## 4. Sistema de acciones
El panel del jugador se centra en las acciones que generan resultado real:
- `ACCION OK`: cierra la accion y apaga la ficha.
- `CAIDA / FALLO`: abre tirada, resuelve daño y turnover.
- `PLACAJE`
- `FALTA`
- `PASE`
- `TOUCHDOWN`
- `ASEGURAR`

## 5. Tiradas
Las tiradas siguen un patron comun:
- entrada manual por casillas,
- o resolucion automatica con boton.

Esto se aplica a:
- bloqueo,
- pase,
- falta,
- esquiva,
- sprint,
- cabeza dura,
- lesiones,
- y el resto de secuencias que necesitan dados.

## 6. Caidas y lesiones
La caida en mesa se modela asi:
- fallo de esquiva o sprint -> turnover;
- el jugador queda derribado;
- si no rompe armadura, la secuencia termina ahi;
- si rompe armadura, se pasa a herida;
- el resultado puede dejar al jugador aturdido, KO o lesionado;
- el cierre se registra para cronica, postpartido y competicion.

## 7. Postpartido
El cierre consolida:
- marcador,
- MVP,
- SPP,
- lesiones,
- bajas,
- historial del clon,
- noticias / cronica,
- y actualizacion de competicion si existe.

## 8. Reglas de interfaz acordadas
- El jugador activado queda gris o deshabilitado.
- No se registran logs vacios por mover sin evento.
- Las tiradas siempre muestran un titulo contextual.
- `Stalling` se marca como estado de equipo en la cabecera.
- La arena debe ser rapida, clara y consistente con Blood Bowl de mesa.
