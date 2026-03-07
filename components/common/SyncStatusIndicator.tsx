import React from 'react';
import CheckCircleIcon from '../icons/CheckCircleIcon';
import ExclamationCircleIcon from '../icons/ExclamationCircleIcon';

type SyncStatus = 'synced' | 'syncing' | 'error';

interface SyncStatusIndicatorProps {
  status: SyncStatus;
}

const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({ status }) => {
  const statusConfig: Record<SyncStatus, { icon: React.ReactElement; text: string; color: string; tooltip: string }> = {
    synced: {
      icon: <CheckCircleIcon />,
      text: 'Sincronizado',
      color: 'text-green-400',
      tooltip: 'Todos los cambios están guardados en la nube.',
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
      text: 'Error de Sincronización',
      color: 'text-red-500',
      tooltip: 'No se pudieron guardar los últimos cambios. Comprueba tu conexión.',
    },
  };

  const currentStatus = statusConfig[status];

  return (
    <div className={`relative group flex items-center gap-2 text-[10px] font-display font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-white/5 border border-white/5 ${currentStatus.color}`}>
      <div className="w-2 h-2 rounded-full bg-current animate-pulse shadow-[0_0_10px_currentColor]" />
      <span className="hidden md:inline">{currentStatus.text}</span>
      <div className="absolute bottom-full right-0 mb-2 w-max max-w-xs glass-panel py-2 px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none shadow-2xl z-[100]">
        <p className="text-white normal-case tracking-normal font-sans font-medium">{currentStatus.tooltip}</p>
      </div>
    </div>
  );
};

export default SyncStatusIndicator;
