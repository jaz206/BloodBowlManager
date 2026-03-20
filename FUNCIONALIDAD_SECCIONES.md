# Funcionalidad de secciones

## Home
- Dashboard principal con competicion activa.
- Acceso rapido a gremio, oraculo y arena.
- Navegacion directa al partido cuando hay uno pendiente.

## Gremio
- Gestion de equipos.
- Fichas con roster, habilidades y pizarra tactica.
- Creacion y edicion de equipos.

## Oraculo
- Biblioteca de equipos, habilidades, star players e incentivos.
- Calculadoras y ayudas de reglas.

## Arena
- Mis ligas y mis torneos para el usuario.
- Descubrir competiciones publicas.
- Organizacion para el creador de la competicion.
- Subcolecciones de competiciones con permisos heredados del propietario.

## Admin
- El panel se partio en formularios separados por dominio.
- Editar equipos, estrellas, habilidades, incentivos y heraldo ya no depende de un bloque gigante unico.
- El selector de imagenes del admin usa `Bloodbowl-image` y carga la carpeta correcta segun el tipo de item.
- Esto hace mas comoda la edicion y reduce errores de wiring entre componentes.
