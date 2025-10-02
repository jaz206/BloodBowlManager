
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const UserProfile: React.FC = () => {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  if (!user) {
    // This case should not be reached if App.tsx handles routing correctly,
    // but as a fallback, we render nothing.
    return null; 
  }

  const handleLogout = () => {
    setIsDropdownOpen(false);
    logout();
  }

  return (
    <div className="relative">
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
      <style>{`
        @keyframes fade-in-fast {
            from { opacity: 0; transform: translateY(-5px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-fast { animation: fade-in-fast 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default UserProfile;
