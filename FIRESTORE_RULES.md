# Reglas de Firestore

Este archivo documenta las reglas reales que debe tener Firestore en este proyecto.
La version viva debe mantenerse sincronizada con `firestore.rules`.

## Objetivo
- Deny by default.
- Mantener compatibilidad con documentos nuevos (`createdBy`) y antiguos (`ownerId`).
- Proteger datos maestros, usuarios y competiciones.
- Mantener el admin panel funcional sin abrir escritura global.

## Reglas actuales

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // -----------------------------
    // HELPERS
    // -----------------------------
    function signedIn() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return signedIn() && request.auth.uid == userId;
    }

    function isAdmin() {
      return signedIn()
        && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }

    // Compatibilidad: aceptamos createdBy nuevo y ownerId legado
    function isDocOwnerOrCreator() {
      return signedIn()
        && (
          resource.data.createdBy == request.auth.uid
          || resource.data.ownerId == request.auth.uid
        );
    }

    function hasValidOwnershipOnCreate() {
      return signedIn()
        && (
          (('createdBy' in request.resource.data) && request.resource.data.createdBy == request.auth.uid)
          || (('ownerId' in request.resource.data) && request.resource.data.ownerId == request.auth.uid)
        );
    }

    // Evita cambiar ownership en updates
    function keepsOwnership() {
      return (
        !('createdBy' in request.resource.data)
        || !('createdBy' in resource.data)
        || request.resource.data.createdBy == resource.data.createdBy
      ) && (
        !('ownerId' in request.resource.data)
        || !('ownerId' in resource.data)
        || request.resource.data.ownerId == resource.data.ownerId
      );
    }

    // DueÃ±o de una competiciÃ³n padre (colecciÃ³n nueva)
    function isCompetitionOwner(compId) {
      return signedIn()
        && (
          get(/databases/$(database)/documents/competitions/$(compId)).data.createdBy == request.auth.uid
          || get(/databases/$(database)/documents/competitions/$(compId)).data.ownerId == request.auth.uid
        );
    }

    // DueÃ±o de una liga padre (colecciÃ³n legado)
    function isLeagueOwner(compId) {
      return signedIn()
        && (
          get(/databases/$(database)/documents/leagues/$(compId)).data.createdBy == request.auth.uid
          || get(/databases/$(database)/documents/leagues/$(compId)).data.ownerId == request.auth.uid
        );
    }

    // -----------------------------
    // MASTER DATA & SETTINGS
    // -----------------------------
    match /master_data/{document} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /settings_master/{document} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // -----------------------------
    // USERS (privado por dueÃ±o)
    // -----------------------------
    match /users/{userId} {
      allow read: if isOwner(userId);

      // No auto-escalado a admin al crear
      allow create: if isOwner(userId)
        && !(request.resource.data.isAdmin == true);

      // DueÃ±o puede editar su doc, pero no tocar isAdmin (salvo admin real)
      allow update, delete: if isOwner(userId)
        && (
          !('isAdmin' in request.resource.data)
          || request.resource.data.isAdmin == resource.data.isAdmin
          || isAdmin()
        );

      // Subcolecciones del usuario (teams, etc.)
      match /{document=**} {
        allow read, write: if isOwner(userId);
      }
    }

    // -----------------------------
    // COMPETITIONS
    // -----------------------------
    match /competitions/{compId} {
      allow read: if true;

      // Acepta createdBy nuevo u ownerId legado, pero siempre ligado al usuario actual
      allow create: if hasValidOwnershipOnCreate();

      // Solo creador/admin y sin cambiar ownership
      allow update: if (isAdmin() || isDocOwnerOrCreator()) && keepsOwnership();
      allow delete: if isAdmin() || isDocOwnerOrCreator();

      // Subcolecciones: heredan permiso del dueÃ±o de la competiciÃ³n padre
      match /{document=**} {
        allow read: if true;
        allow write: if isAdmin() || isCompetitionOwner(compId);
      }
    }

    // Compatibilidad con la colecciÃ³n actualmente usada por la app
    match /leagues/{compId} {
      allow read: if true;

      allow create: if hasValidOwnershipOnCreate();
      allow update: if (isAdmin() || isDocOwnerOrCreator()) && keepsOwnership();
      allow delete: if isAdmin() || isDocOwnerOrCreator();

      match /{document=**} {
        allow read: if true;
        allow write: if isAdmin() || isLeagueOwner(compId);
      }
    }

    // -----------------------------
    // LIVE MATCHES
    // -----------------------------
    match /live_matches/{matchId} {
      allow read: if true;

      allow create: if signedIn()
        && ('createdBy' in request.resource.data)
        && request.resource.data.createdBy == request.auth.uid;

      allow update: if (isAdmin() || isDocOwnerOrCreator()) && keepsOwnership();
      allow delete: if isAdmin() || isDocOwnerOrCreator();
    }

    // -----------------------------
    // TACTICAL PLAYS
    // -----------------------------
    match /tactical_plays/{playId} {
      allow read: if true;

      allow create: if signedIn()
        && ('createdBy' in request.resource.data)
        && request.resource.data.createdBy == request.auth.uid;

      allow update: if (isAdmin() || isDocOwnerOrCreator()) && keepsOwnership();
      allow delete: if isAdmin() || isDocOwnerOrCreator();
    }

    // -----------------------------
    // DENY BY DEFAULT
    // -----------------------------
    match /{document=**} {
      allow read, write: if false;
    }
  }
}

```

## Resumen operativo
- `master_data` y `settings_master` permiten lectura publica y escritura solo a admins.
- `users/{uid}` queda aislado por propietario.
- `competitions` y `leagues` aceptan ownership por `createdBy` o `ownerId`.
- `live_matches` y `tactical_plays` solo aceptan documentos creados por el usuario autenticado.
- Las subcolecciones heredan permisos del documento padre.

## Migracion
- Si un documento viejo solo tiene `ownerId`, sigue siendo valido.
- Si creas o actualizas datos nuevos, usa `createdBy`.
- Cuando puedas, migra los documentos antiguos para que lleven ambos campos durante la transicion.
