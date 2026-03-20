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

    // Creador del documento actual (para update/delete)
    function isDocCreator() {
      return signedIn()
        && resource.data.createdBy == request.auth.uid;
    }

    // Evita cambiar ownership en updates
    function keepsCreatedBy() {
      return !('createdBy' in request.resource.data)
        || request.resource.data.createdBy == resource.data.createdBy;
    }

    // Dueño de una competición padre (para subcolecciones)
    function isCompetitionOwner(compId) {
      return signedIn()
        && get(/databases/$(database)/documents/competitions/$(compId)).data.createdBy == request.auth.uid;
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
    // USERS (privado por dueño)
    // -----------------------------
    match /users/{userId} {
      allow read: if isOwner(userId);

      // No auto-escalado a admin al crear
      allow create: if isOwner(userId)
        && !(request.resource.data.isAdmin == true);

      // Dueño puede editar su doc, pero no tocar isAdmin (salvo admin real)
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

      // Exigimos createdBy siempre y debe ser el uid actual
      allow create: if signedIn()
        && ('createdBy' in request.resource.data)
        && request.resource.data.createdBy == request.auth.uid;

      // Solo creador/admin y sin cambiar createdBy
      allow update: if (isAdmin() || isDocCreator()) && keepsCreatedBy();
      allow delete: if isAdmin() || isDocCreator();

      // Subcolecciones: heredan permiso del dueño de la competición padre
      match /{document=**} {
        allow read: if true;
        allow write: if isAdmin() || isCompetitionOwner(compId);
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

      allow update: if (isAdmin() || isDocCreator()) && keepsCreatedBy();
      allow delete: if isAdmin() || isDocCreator();
    }

    // -----------------------------
    // TACTICAL PLAYS
    // -----------------------------
    match /tactical_plays/{playId} {
      allow read: if true;

      allow create: if signedIn()
        && ('createdBy' in request.resource.data)
        && request.resource.data.createdBy == request.auth.uid;

      allow update: if (isAdmin() || isDocCreator()) && keepsCreatedBy();
      allow delete: if isAdmin() || isDocCreator();
    }

    // -----------------------------
    // DENY BY DEFAULT
    // -----------------------------
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
