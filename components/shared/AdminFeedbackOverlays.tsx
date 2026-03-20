import React from 'react';

type SyncProgress = 'idle' | 'syncing' | 'done' | 'error';

type ConfirmModal = {
    title: string;
    message: string;
    onConfirm: () => void;
    danger?: boolean;
} | null;

type ToastMessage = {
    text: string;
    type: 'success' | 'error';
} | null;

type AdminFeedbackOverlaysProps = {
    syncProgress: SyncProgress;
    confirmModal: ConfirmModal;
    toastMessage: ToastMessage;
    onDismissConfirm: () => void;
};

const AdminFeedbackOverlays: React.FC<AdminFeedbackOverlaysProps> = ({
    syncProgress,
    confirmModal,
    toastMessage,
    onDismissConfirm,
}) => {
    return (
        <>
            {syncProgress === 'syncing' && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-[500] gap-8 pointer-events-none">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-20 h-20 rounded-3xl bg-premium-gold/10 border border-premium-gold/20 flex items-center justify-center">
                            <span className="w-10 h-10 border-4 border-premium-gold/30 border-t-premium-gold rounded-full animate-spin"></span>
                        </div>
                        <p className="text-premium-gold font-black uppercase tracking-widest text-sm animate-pulse">Sincronizando con Nuffle...</p>
                        <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-premium-gold rounded-full animate-progress-bar"></div>
                        </div>
                    </div>
                </div>
            )}

            {confirmModal && (
                <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-[400] p-4">
                    <div className="bg-[#0a0a0a] border border-white/10 p-10 rounded-[2.5rem] shadow-2xl max-w-sm w-full text-center space-y-6">
                        <div className={`size-16 rounded-3xl flex items-center justify-center mx-auto ${confirmModal.danger ? 'bg-red-500/10 text-red-500' : 'bg-premium-gold/10 text-premium-gold'}`}>
                            <span className="material-symbols-outlined text-4xl">
                                {confirmModal.danger ? 'dangerous' : 'sync'}
                            </span>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">{confirmModal.title}</h3>
                            <p className="text-slate-400 text-sm font-medium leading-relaxed">{confirmModal.message}</p>
                        </div>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={confirmModal.onConfirm}
                                className={`w-full py-4 font-black text-xs uppercase tracking-widest rounded-2xl transition-all ${confirmModal.danger
                                    ? 'bg-red-600 text-white hover:bg-red-500 shadow-xl shadow-red-600/20'
                                    : 'bg-premium-gold text-black hover:bg-premium-gold/90 shadow-xl shadow-premium-gold/20'
                                    }`}
                            >
                                CONFIRMAR
                            </button>
                            <button
                                onClick={onDismissConfirm}
                                className="w-full py-4 bg-white/5 text-slate-400 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all"
                            >
                                CANCELAR
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {toastMessage && (
                <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[500] animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className={`px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 backdrop-blur-xl border ${toastMessage.type === 'error'
                        ? 'bg-red-950/80 border-red-500/30'
                        : 'bg-zinc-900/90 border-white/10'
                        }`}>
                        <span className={`material-symbols-outlined font-bold ${toastMessage.type === 'error' ? 'text-red-400' : 'text-premium-gold'}`}>
                            {toastMessage.type === 'error' ? 'error' : 'check_circle'}
                        </span>
                        <p className="text-white font-bold text-sm max-w-xs">{toastMessage.text}</p>
                    </div>
                </div>
            )}
        </>
    );
};

export default AdminFeedbackOverlays;
