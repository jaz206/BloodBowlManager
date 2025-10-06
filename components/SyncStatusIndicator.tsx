import React from 'react';
import CheckCircleIcon from './icons/CheckCircleIcon';
import ExclamationCircleIcon from './icons/ExclamationCircleIcon';

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
    <div className={`relative group flex items-center gap-2 text-sm ${currentStatus.color}`}>
      {currentStatus.icon}
      <span className="hidden md:inline">{currentStatus.text}</span>
      <div className="absolute bottom-full right-0 mb-2 w-max max-w-xs bg-slate-900 text-white text-xs rounded-lg py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none border border-slate-700 shadow-lg z-10">
        {currentStatus.tooltip}
      </div>
    </div>
  );
};

export default SyncStatusIndicator;
