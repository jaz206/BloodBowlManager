

import React from 'react';
import { useAuth } from './hooks/useAuth';
import Login from './components/Login';
import MainApp from './components/MainApp';
import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

// Your web app's Firebase configuration is now hardcoded as per your request
const firebaseConfig = {
  apiKey: "AIzaSyAiHG1HLEdt-kVtYrtPdOopr5RrQha1cTs",
  authDomain: "asistente-blood-bowl.firebaseapp.com",
  projectId: "asistente-blood-bowl",
  storageBucket: "asistente-blood-bowl.firebasestorage.app",
  messagingSenderId: "789696388629",
  appId: "1:789696388629:web:e856e15e3f33a78045b81c"
};

// Initialize Firebase
let app: FirebaseApp | null = null;
export let auth: Auth | null = null;
export let db: Firestore | null = null;

let firebaseError: string | null = null;

if (!firebaseConfig.apiKey) {
    firebaseError = "La configuración de Firebase es inválida o no está presente. Asegúrate de que las credenciales de Firebase estén configuradas correctamente en el entorno de la aplicación.";
} else {
    try {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
    } catch (e: any) {
        console.error("Firebase initialization failed:", e);
        firebaseError = `Error al inicializar Firebase: ${e.message}. Revisa la configuración de tus credenciales.`;
    }
}


const App: React.FC = () => {
    if (firebaseError) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-4">
                 <div className="text-center max-w-lg">
                    <h1 className="text-2xl text-red-500 font-bold">Error de Configuración de Firebase</h1>
                    <p className="text-lg mt-4 text-slate-300">
                        {firebaseError}
                    </p>
                 </div>
            </div>
        );
    }

    const { user, isLoading } = useAuth();
    
    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
                <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-amber-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-lg mt-4">Cargando...</p>
            </div>
        );
    }
    
    return user ? <MainApp /> : <Login />;
}

export default App;