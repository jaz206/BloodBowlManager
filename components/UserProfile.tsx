import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import QuestionMarkCircleIcon from './icons/QuestionMarkCircleIcon';
import GoogleIcon from './icons/GoogleIcon';

const UserIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" clipRule="evenodd" />
    </svg>
);


const UserProfile: React.FC = () => {
  const { user, logout, isLoading, isGsiInitialized, loginAsGuest, setAndStoreGoogleClientId } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [clientIdInput, setClientIdInput] = useState('');
  const [showInstructions, setShowInstructions] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoading && !user && isGsiInitialized && googleButtonRef.current) {
        if (window.google && window.google.accounts && window.google.accounts.id) {
            // Ensure the button isn't rendered multiple times
            if (googleButtonRef.current.childElementCount === 0) {
                window.google.accounts.id.renderButton(
                    googleButtonRef.current,
                    { theme: 'outline', size: 'medium', type: 'standard', text: 'signin_with' }
                );
            }
             window.google.accounts.id.prompt(); // Display the One Tap prompt
        }
    }
  }, [user, isLoading, isGsiInitialized]);

  if (isLoading) {
    return <div className="w-10 h-10 bg-slate-700 rounded-full animate-pulse"></div>;
  }
  
  const handleLogout = () => {
    setIsDropdownOpen(false);
    logout();
  }

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
                    <li>En <strong className="text-slate-200">"Orígenes de JavaScript autorizados"</strong>, añade la URL donde se ejecuta esta aplicación (p. ej., <code className="bg-slate-700 px-1 rounded">http://localhost:3000</code> o la URL de tu despliegue).</li>
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
    <>
      <div className="relative">
        {user ? (
          <div className="flex items-center gap-2">
              <span className="text-sm text-slate-300 hidden sm:inline">Hola, {user.name.split(' ')[0]}</span>
              <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-amber-400 rounded-full">
                  <img
                      src={user.picture}
                      alt="User avatar"
                      className="w-10 h-10 rounded-full border-2 border-slate-600 hover:border-amber-400 transition-colors bg-slate-700"
                  />
              </button>
              {isDropdownOpen && (
                  <div className="absolute top-12 right-0 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-lg py-1 z-20 animate-fade-in-fast">
                      <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-700"
                      >
                          Cerrar sesión
                      </button>
                  </div>
              )}
          </div>
        ) : (
          <div className="bg-slate-900/70 p-4 rounded-lg border border-slate-700 text-center space-y-3 w-64">
            <button onClick={loginAsGuest} className="w-full flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold py-2 px-4 rounded-lg transition-colors">
                <UserIcon className="w-5 h-5" />
                <span>Entrar como Invitado</span>
            </button>
            {isGsiInitialized ? (
                <div ref={googleButtonRef} id="google-signin-button" className="flex justify-center"></div>
            ) : (
                <button 
                    onClick={() => setIsConfigModalOpen(true)} 
                    className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-400 font-semibold py-2 px-4 rounded-lg transition-colors border border-slate-600"
                >
                    <GoogleIcon className="w-5 h-5" />
                    <span>Iniciar sesión con Google</span>
                     <QuestionMarkCircleIcon className="w-4 h-4 text-slate-500" />
                </button>
            )}
          </div>
        )}
      </div>
      {isConfigModalOpen && <SetupGuideModal />}
      <style>{`
        @keyframes fade-in-fast {
            from { opacity: 0; transform: translateY(-5px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-in-up { 
            from { transform: translateY(20px) scale(0.98); opacity: 0; } 
            to { transform: translateY(0) scale(1); opacity: 1; } 
        }
        .animate-fade-in-fast { animation: fade-in-fast 0.2s ease-out forwards; }
        .animate-slide-in-up { animation: slide-in-up 0.3s ease-out forwards; }
      `}</style>
    </>
  );
};

export default UserProfile;
