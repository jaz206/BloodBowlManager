service cloud.firestore {
  match /databases/{database}/documents {
    
    // 🛡️ Helper: ¿Es el usuario un Administrador?
    // Debe tener el campo "isAdmin: true" en su documento /users/{uid}
    function isAdmin() {
      return request.auth != null && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }

    // 🩸 DATOS MAESTROS (Equipos, Habilidades, etc.)
    // Cualquiera puede leerlos (público), pero solo el Admin puede editarlos.
    match /master_data/{document} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // 🏆 USUARIOS
    // Solo el dueño puede leer/escribir su perfil.
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // 🏟️ EQUIPOS GESTIONADOS (Managed Teams)
    // Público para ver (compartir rosters), solo usuarios logueados pueden crear/editar.
    match /managed_teams/{teamId} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // ⚔️ PARTIDOS (Live Matches)
    match /live_matches/{matchId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // 🎨 PIZARRAS TÁCTICAS
    match /tactical_plays/{playId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Configuración global (Admin Only para escribir)
    match /settings_master/{document} {
      allow read: if true;
      allow write: if isAdmin();
    }
  }
}
