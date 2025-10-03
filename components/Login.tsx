import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import UserIcon from './icons/UserIcon';
import GoogleIcon from './icons/GoogleIcon';

const Login: React.FC = () => {
    const { login, loginAsGuest } = useAuth();
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGoogleLogin = async () => {
        setIsLoggingIn(true);
        setError(null);
        try {
            await login();
        } catch (err: any) {
            console.error("Google login failed", err);
            if (err.code === 'auth/unauthorized-domain') {
                const domain = window.location.hostname;
                setError(`Error de dominio no autorizado: El dominio '${domain}' no está permitido. Ve a tu Consola de Firebase > Authentication > Pestaña 'Sign-in method' (Método de inicio de sesión) > Dominios autorizados, y añade '${domain}' a la lista.`);
            } else if (err.code === 'auth/auth-domain-config-required') {
                setError("Error de configuración de Firebase: Falta el 'authDomain'. Por favor, verifica la configuración de Firebase en el código de la aplicación.");
            } else {
                setError(`Error al iniciar sesión: ${err.message}`);
            }
            setIsLoggingIn(false);
        }
    };
    
    return (
        <div 
            className="min-h-screen bg-cover bg-center text-slate-200 font-sans flex flex-col items-center justify-center p-4 relative"
            style={{ backgroundImage: "url('https://i.pinimg.com/736x/f2/0e/e7/f20ee7e03f9f5f73bcae432aa3039ba0.jpg')" }}
        >
            <div className="absolute inset-0 bg-slate-900 bg-opacity-75 z-0"></div>

            <main className="relative z-10 bg-slate-800/60 border border-slate-700 rounded-2xl shadow-2xl p-8 sm:p-12 max-w-md w-full text-center animate-fade-in-slow backdrop-blur-sm">
                <h1 className="text-4xl font-bold text-amber-400 tracking-wider mb-2" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
                    Asistente de Blood Bowl
                </h1>
                <p className="text-slate-400 mb-10">Tu Asistente de Entrenador Definitivo</p>

                <div className="space-y-4">
                     <button onClick={loginAsGuest} className="w-full flex items-center justify-center gap-3 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold py-3 px-4 rounded-lg transition-colors text-lg">
                        <UserIcon className="w-6 h-6" />
                        <span>Acceder como Invitado</span>
                    </button>
                    
                    <div className="relative flex py-3 items-center">
                        <div className="flex-grow border-t border-slate-600"></div>
                        <span className="flex-shrink mx-4 text-slate-400 text-sm">O</span>
                        <div className="flex-grow border-t border-slate-600"></div>
                    </div>
                    
                    <button 
                        onClick={handleGoogleLogin} 
                        disabled={isLoggingIn}
                        className="w-full flex items-center justify-center gap-3 bg-white text-slate-800 font-semibold py-3 px-4 rounded-lg transition-colors text-lg hover:bg-slate-200 disabled:bg-slate-400 disabled:cursor-wait"
                    >
                        {isLoggingIn ? (
                             <svg className="animate-spin h-6 w-6 text-slate-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        ) : (
                            <GoogleIcon className="w-6 h-6" />
                        )}
                        <span>{isLoggingIn ? 'Iniciando sesión...' : 'Iniciar con Google'}</span>
                    </button>
                </div>

                {error && <p className="mt-6 text-red-400 bg-red-900/50 border border-red-700 p-3 rounded-lg text-sm">{error}</p>}
            </main>

            <footer className="absolute bottom-4 text-center text-slate-400 text-sm z-10">
                <p>Hecho para entrenadores de Blood Bowl en todo el mundo.</p>
            </footer>
             <style>{`
                @supports (backdrop-filter: blur(4px)) {
                    .backdrop-blur-sm {
                        backdrop-filter: blur(4px);
                    }
                }
                @keyframes fade-in-slow {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-slow {
                    animation: fade-in-slow 0.6s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default Login;
