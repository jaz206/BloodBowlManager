import { initializeApp, FirebaseApp, getApps, getApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

// Your web app's Firebase configuration is now hardcoded
const firebaseConfig = {
  apiKey: "AIzaSyAiHG1HLEdt-kVtYrtPdOopr5RrQha1cTs",
  authDomain: "asistente-blood-bowl.firebaseapp.com",
  projectId: "asistente-blood-bowl",
  storageBucket: "asistente-blood-bowl.firebasestorage.app",
  messagingSenderId: "789696388629",
  appId: "1:789696388629:web:e856e15e3f33a78045b81c"
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let firebaseError: string | null = null;

if (!firebaseConfig.apiKey) {
    firebaseError = "La configuración de Firebase es inválida o no está presente. Asegúrate de que las credenciales de Firebase estén configuradas correctamente en el entorno de la aplicación.";
} else {
    try {
        if (!getApps().length) {
            app = initializeApp(firebaseConfig);
        } else {
            app = getApp();
        }
        auth = getAuth(app);
        db = getFirestore(app);
    } catch (e: any) {
        console.error("Firebase initialization failed:", e);
        firebaseError = `Error al inicializar Firebase: ${e.message}. Revisa la configuración de tus credenciales.`;
    }
}

export { app, auth, db, firebaseError };
