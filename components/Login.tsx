import React, { useRef, useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import QuestionMarkCircleIcon from './icons/QuestionMarkCircleIcon';
import UserIcon from './icons/UserIcon';

const Login: React.FC = () => {
    const { loginAsGuest, isGsiInitialized, setAndStoreGoogleClientId } = useAuth();
    const googleButtonRef = useRef<HTMLDivElement>(null);
    const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
    const [clientIdInput, setClientIdInput] = useState('');
    const [showInstructions, setShowInstructions] = useState(false);
    const [gsiRenderFailed, setGsiRenderFailed] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleCopyOrigin = () => {
        navigator.clipboard.writeText(window.location.origin).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }, (err) => {
            console.error('Could not copy text: ', err);
            alert('No se pudo copiar la URL.');
        });
    };

    useEffect(() => {
        if (isGsiInitialized && googleButtonRef.current) {
            // If GSI is initialized, we try to render the button
            if (window.google && window.google.accounts && window.google.accounts.id) {
                setGsiRenderFailed(false);

                if (googleButtonRef.current.childElementCount === 0) {
                    window.google.accounts.id.renderButton(
                        googleButtonRef.current,
                        { theme: 'filled_black', size: 'large', type: 'standard', text: 'signin_with', shape: 'pill', logo_alignment: 'left' }
                    );
                }
                window.google.accounts.id.prompt();
                
                // After a delay, check if the button actually rendered.
                // The GSI library fails silently on origin_mismatch by not rendering the button.
                const timeoutId = setTimeout(() => {
                    if (googleButtonRef.current && googleButtonRef.current.childElementCount === 0) {
                        setGsiRenderFailed(true);
                    }
                }, 2500);

                return () => clearTimeout(timeoutId);
            }
        }
    }, [isGsiInitialized]);
    
    const handleSaveClientId = () => {
        if (clientIdInput.trim()) {
            setAndStoreGoogleClientId(clientIdInput.trim());
            setIsConfigModalOpen(false);
        } else {
            alert("Por favor, introduce un ID de cliente válido.");
        }
    };
    
    const SetupGuideModal = () => (
      <div 
        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in-fast" 
        onClick={() => setIsConfigModalOpen(false)}
        role="dialog" aria-modal="true"
      >
        <div className="bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-w-2xl w-full transform animate-slide-in-up" onClick={e => e.stopPropagation()}>
          <div className="p-4 border-b border-slate-700 flex justify-between items-center">
            <h2 className="text-xl font-bold text-amber-400">Conectar con Google</h2>
            <button onClick={() => setIsConfigModalOpen(false)} className="text-slate-400 hover:text-white">&times;</button>
          </div>
          <div className="p-5 max-h-[70vh] overflow-y-auto text-slate-300 space-y-4 text-sm">
              <p>Para usar tu cuenta de Google, la aplicación necesita un ID de cliente de Google. Es un paso único y rápido para tu seguridad.</p>
              <div>
                  <label htmlFor="clientIdInput" className="block text-sm font-medium text-slate-200 mb-1">Pega tu ID de cliente de Google aquí:</label>
                  <input 
                      id="clientIdInput"
                      type="text"
                      value={clientIdInput}
                      onChange={e => setClientIdInput(e.target.value)}
                      placeholder="xxxx-xxxx.apps.googleusercontent.com"
                      className="w-full bg-slate-900 border-2 border-slate-600 rounded-lg py-2 px-3 text-white placeholder-slate-500 focus:ring-amber-500 focus:border-amber-500"
                  />
              </div>
               <button onClick={() => setShowInstructions(!showInstructions)} className="text-xs text-sky-400 hover:underline flex items-center gap-1">
                  <QuestionMarkCircleIcon className="w-4 h-4" />
                  {showInstructions ? 'Ocultar instrucciones' : '¿Cómo obtengo un ID de cliente?'}
              </button>
  
              {showInstructions && (
                <div className="mt-4 p-3 bg-slate-900/50 rounded-lg border border-slate-700 space-y-3">
                    <ol className="list-decimal list-inside space-y-3 pl-2">
                      <li>Ve a la <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">Consola de Google Cloud</a>.</li>
                      <li>Crea o selecciona un proyecto.</li>
                      <li>Ve a <strong className="text-slate-200">APIs y Servicios &rarr; Credenciales</strong>.</li>
                      <li>Haz clic en <strong className="text-slate-200">"+ CREAR CREDENCIALES"</strong> y elige <strong className="text-slate-200">"ID de cliente de OAuth"</strong>.</li>
                      <li>Elige <strong className="text-slate-200">"Aplicación web"</strong>.</li>
                      <li>
                        En <strong className="text-slate-200">"Orígenes de JavaScript autorizados"</strong>, añade la siguiente URL:
                        <div className="flex items-center justify-center bg-slate-700 p-2 rounded-md my-2 gap-4">
                            <strong className="text-amber-300 font-mono text-base">{window.location.origin}</strong>
                            <button type="button" onClick={handleCopyOrigin} className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-1 px-3 rounded-md text-xs">
                                {copied ? '¡Copiado!' : 'Copiar'}
                            </button>
                        </div>
                      </li>
                      <li>Haz clic en <strong className="text-slate-200">"Crear"</strong> y copia el <strong className="text-slate-200">"ID de cliente"</strong>.</li>
                    </ol>
                </div>
              )}
          </div>
          <div className="p-4 bg-slate-900/50 border-t border-slate-700 flex justify-end gap-3">
               <button onClick={() => setIsConfigModalOpen(false)} className="bg-slate-600 text-white font-bold py-2 px-4 rounded-md shadow-md hover:bg-slate-500">Cancelar</button>
               <button onClick={handleSaveClientId} className="bg-amber-500 text-slate-900 font-bold py-2 px-6 rounded-md shadow-md hover:bg-amber-400">Guardar y Activar</button>
          </div>
        </div>
      </div>
    );

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
                    
                    {gsiRenderFailed && (
                        <div className="p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-sm space-y-3">
                            <p className="font-bold">¡Error de Configuración de Google!</p>
                            <p>La aplicación no puede mostrar el botón de Google. Esto es un <strong className="text-amber-300">problema de configuración externo</strong>, no un error del código de la aplicación.</p>
                            <p>La causa más común es un error de <code className="bg-red-800/50 p-1 rounded font-mono">origin_mismatch</code>. Para solucionarlo, copia la siguiente URL y añádela a los "Orígenes de JavaScript autorizados" en tu Google Cloud Console:</p>
                            <div className="flex items-center justify-center bg-slate-700 p-2 rounded-md my-2 gap-4">
                                <strong className="text-amber-300 font-mono text-base">{window.location.origin}</strong>
                                <button type="button" onClick={handleCopyOrigin} className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-1 px-3 rounded-md text-xs">
                                    {copied ? '¡Copiado!' : 'Copiar'}
                                </button>
                            </div>
                            <button 
                                onClick={() => setIsConfigModalOpen(true)} 
                                className="w-full bg-red-600 hover:bg-red-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors mt-2"
                            >
                                Abrir Guía de Configuración
                            </button>
                        </div>
                    )}
            
                    {!isGsiInitialized && !gsiRenderFailed && (
                         <div className="p-4 bg-sky-900/50 border border-sky-700 rounded-lg text-sky-300 text-sm space-y-3">
                            <p className="font-bold">Configuración de Google Sign-In</p>
                            <p>Para habilitar el inicio de sesión con Google, necesitas proporcionar un ID de cliente válido.</p>
                            <button 
                                onClick={() => setIsConfigModalOpen(true)} 
                                className="w-full bg-sky-600 hover:bg-sky-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors mt-2"
                            >
                                Configurar ID de Cliente
                            </button>
                        </div>
                    )}

                    <div ref={googleButtonRef} id="google-signin-button" className={`flex justify-center min-h-[44px] ${gsiRenderFailed || !isGsiInitialized ? 'hidden' : ''}`}></div>
                    
                    {isGsiInitialized && !gsiRenderFailed && (
                        <button 
                            onClick={() => setIsConfigModalOpen(true)} 
                            className="text-xs text-slate-400 hover:text-slate-200 hover:underline pt-1 flex items-center justify-center gap-1 w-full"
                        >
                            <QuestionMarkCircleIcon className="w-4 h-4" />
                            <span>Reconfigurar ID de Cliente de Google</span>
                        </button>
                    )}
                </div>
            </main>

            {isConfigModalOpen && <SetupGuideModal />}

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
                @keyframes fade-in-fast { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slide-in-up { from { transform: translateY(20px) scale(0.98); opacity: 0; } to { transform: translateY(0) scale(1); } }
                .animate-fade-in-fast { animation: fade-in-fast 0.2s ease-out forwards; }
                .animate-slide-in-up { animation: slide-in-up 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default Login;
