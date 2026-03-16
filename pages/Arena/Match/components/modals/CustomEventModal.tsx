import React from 'react';
import { useMatch } from '../../context/MatchContext';

const CustomEventModal: React.FC = () => {
    const {
        isCustomEventModalOpen,
        setIsCustomEventModalOpen,
        customEventDescription,
        setCustomEventDescription,
        logEvent
    } = useMatch();

    // Since this modal is usually toggled outside the MatchProvider in some contexts or needs its own state check
    if (!isCustomEventModalOpen) return null;

    const handleConfirm = () => {
        if (customEventDescription.trim()) {
            logEvent('OTHER', customEventDescription);
        }
        setIsCustomEventModalOpen(false);
        setCustomEventDescription('');
    };

    const handleCancel = () => {
        setIsCustomEventModalOpen(false);
        setCustomEventDescription('');
    };

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[250] p-4" onClick={handleCancel}>
            <div className="glass-panel max-w-md w-full border-white/10 bg-black shadow-4xl animate-slide-in-up" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-white/5 bg-white/5">
                    <h2 className="text-xl font-display font-black text-white uppercase italic tracking-tighter">Cronista de Guerra</h2>
                    <p className="text-[9px] font-display font-black text-slate-500 uppercase tracking-widest">Registrar evento personalizado</p>
                </div>
                <div className="p-6">
                    <textarea
                        value={customEventDescription}
                        onChange={e => setCustomEventDescription(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-display text-sm focus:border-premium-gold outline-none transition-all placeholder:text-slate-600 italic custom-scrollbar"
                        rows={4}
                        placeholder="Nuffle ha intervenido... describe el caos ocurrido en la arena."
                        autoFocus
                    ></textarea>
                </div>
                <div className="p-6 bg-black/40 border-t border-white/5 flex justify-end gap-3">
                    <button onClick={handleCancel} className="px-6 py-2.5 rounded-xl text-[10px] font-display font-black text-slate-500 uppercase tracking-[0.2em] hover:text-white transition-colors">Descartar</button>
                    <button onClick={handleConfirm} className="px-8 py-2.5 bg-premium-gold text-black rounded-xl text-[10px] font-display font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all">Sellar Destino</button>
                </div>
            </div>
        </div>
    );
};

export default CustomEventModal;
