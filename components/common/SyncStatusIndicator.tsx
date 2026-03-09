import React from 'react';
import CheckCircleIcon from '../icons/CheckCircleIcon';
import ExclamationCircleIcon from '../icons/ExclamationCircleIcon';

type SyncStatus = 'synced' | 'syncing' | 'error';

interface SyncStatusIndicatorProps {
  status: SyncStatus;
  origin?: 'firestore' | 'static';
}

const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({ status, origin = 'static' }) => {
  const statusConfig: Record<SyncStatus, { icon: React.ReactElement; text: string; color: string; tooltip: string }> = {
    synced: {
      icon: <CheckCircleIcon />,
      text: origin === 'firestore' ? 'LIVE DATA' : 'SYNCED (LOCAL)',
      color: origin === 'firestore' ? 'text-green-400' : 'text-amber-400',
      tooltip: origin === 'firestore' ? 'Conectado a Firestore. Datos actualizados en tiempo real.' : 'Cambios guardados localmente. Datos estáticos del proyecto.',
    },
    syncing: {
      icon: (
        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ),
      text: 'Sincronizando...',
      color: 'text-yellow-400',
      tooltip: 'Guardando cambios en la nube...',
    },
    error: {
      icon: <ExclamationCircleIcon />,
      text: 'Offline',
      color: 'text-red-500',
      tooltip: 'No se pudo conectar con Firestore. Revisa las reglas de seguridad.',
    },
  };

  const currentStatus = statusConfig[status];

  return (
    <div className={`relative group flex items-center gap-2 text-[10px] font-display font-black uppercase tracking-wider px-3 py-1.5 rounded-full bg-white/5 border border-white/5 ${currentStatus.color}`}>
      <div className={`w-2 h-2 rounded-full bg-current ${status === 'syncing' ? '' : 'animate-pulse'} shadow-[0_0_10px_currentColor]`} />
      <span className="hidden lg:inline">{currentStatus.text}</span>
      <div className="absolute top-full right-0 mt-3 w-64 glass-panel p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none shadow-2xl z-[100] border-white/10">
        <p className="text-white normal-case tracking-normal font-sans font-medium text-[11px] leading-relaxed italic">{currentStatus.tooltip}</p>
      </div>
    </div>
  );
};

export default SyncStatusIndicator;
