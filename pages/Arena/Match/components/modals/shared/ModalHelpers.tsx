import React from 'react';
import { ManagedPlayer } from '../../../../../types';
import DiceIcon from '../../../../../components/icons/DiceIcon';

export const PlayerButton: React.FC<{ player: ManagedPlayer, onSelect: (p: ManagedPlayer) => void, disabled?: boolean }> = ({ player, onSelect, disabled }) => (
    <button onClick={() => onSelect(player)} className="bento-card w-full text-left p-4 disabled:opacity-30 disabled:cursor-not-allowed group" disabled={disabled}>
        <div className="flex justify-between items-start">
            <p className="font-display text-lg font-bold text-white group-hover:text-premium-gold transition-colors">
                {player.isStarPlayer && <span className="text-premium-gold mr-2">★</span>}
                {player.customName}
            </p>
            {player.isJourneyman && <span className="text-[10px] font-display bg-white/10 px-2 py-0.5 rounded text-slate-400 uppercase tracking-tighter">Sustituto</span>}
        </div>
        <p className="text-xs font-display text-slate-500 uppercase tracking-wider mt-1">{player.position}</p>
    </button>
);

export const DiceBulletIcon = () => (
    <div className="grid grid-cols-2 gap-1 px-1">
        <div className="w-1.5 h-1.5 bg-blood-red rounded-full"></div>
        <div className="w-1.5 h-1.5 bg-blood-red rounded-full"></div>
        <div className="w-1.5 h-1.5 bg-blood-red rounded-full"></div>
        <div className="w-1.5 h-1.5 bg-blood-red rounded-full"></div>
    </div>
);

export const DiceRollButton = ({ onRoll, max = 6, onPlaySound }: { onRoll: (val: number) => void, max?: number, onPlaySound?: () => void }) => {
    const [isRolling, setIsRolling] = React.useState(false);
    const handleRoll = () => {
        setIsRolling(true);
        if (onPlaySound) onPlaySound();
        setTimeout(() => {
            const roll = Math.floor(Math.random() * max) + 1;
            onRoll(roll);
            setIsRolling(false);
        }, 600);
    };

    return (
        <button
            onClick={handleRoll}
            disabled={isRolling}
            className={`die-container ${isRolling ? 'animate-roll shake' : ''} bg-white rounded-lg shadow-lg flex items-center justify-center border-2 border-slate-200 hover:border-premium-gold transition-colors w-12 h-12`}
            title={`Lanzar D${max}`}
        >
            <div className="die-face relative flex items-center justify-center w-full h-full">
                {max === 6 ? (
                    <DiceBulletIcon />
                ) : (
                    <span className="text-xl font-display font-black text-blood-red drop-shadow-sm">
                        {max}
                    </span>
                )}
                <div className="absolute -bottom-1 -right-1 text-[8px] font-bold text-slate-400 opacity-50 bg-white/80 px-0.5 rounded">
                    D{max}
                </div>
            </div>
        </button>
    );
};

export const RollInputStep = ({ title, value, onChange, onNext, onBack, label, pattern, placeholder, onPlaySound }: { title: string, value: string, onChange: (v: string) => void, onNext: () => void, onBack?: () => void, label: string, pattern: string, placeholder?: string, onPlaySound?: () => void }) => {
    const maxVal = pattern.includes('16') ? 16 : 6;
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h3 className="text-2xl font-display font-bold text-premium-gold mb-4 uppercase tracking-wider underline decoration-premium-gold/30 underline-offset-8">{title}</h3>
            <label className="block text-xs font-display font-bold text-slate-400 mb-2 uppercase tracking-widest">{label}</label>

            <div className="flex items-center gap-6 mb-8 bg-black/20 p-6 rounded-2xl border border-white/5">
                <input
                    type="text"
                    pattern={pattern}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    className="flex-1 bg-black/40 border border-white/10 rounded-xl py-3 px-6 text-xl text-white font-display focus:border-premium-gold/50 outline-none transition-premium"
                    placeholder={placeholder || ""}
                    autoFocus
                />
                <div className="w-px h-12 bg-white/10"></div>
                <DiceRollButton max={maxVal} onRoll={v => onChange(v.toString())} onPlaySound={() => onPlaySound && onPlaySound()} />
            </div>

            <div className="flex justify-between gap-4">
                {onBack && <button onClick={onBack} className="flex-1 font-display font-bold uppercase tracking-widest text-slate-400 py-3 px-6 rounded-xl border border-white/10 hover:bg-white/5 transition-premium">Atrás</button>}
                <button onClick={onNext} className="flex-1 bg-premium-gold text-black font-display font-black uppercase tracking-widest py-3 px-6 rounded-xl shadow-2xl hover:bg-premium-light transition-premium">Siguiente</button>
            </div>
        </div>
    );
};

export const DoubleDiceInputStep = ({ title, value, onChange, onNext, onBack, label, onPlaySound }: { title: string, value: { die1: string; die2: string; }, onChange: (v: { die1: string; die2: string; }) => void, onNext: () => void, onBack?: () => void, label: string, onPlaySound?: () => void }) => {
    const die1Ref = React.useRef<HTMLInputElement>(null);
    const die2Ref = React.useRef<HTMLInputElement>(null);

    const handleDie1Change = (v: string) => {
        const clean = v.replace(/[^1-6]/g, '').slice(-1);
        onChange({ ...value, die1: clean });
        if (clean) die2Ref.current?.focus();
    };

    const handleDie2Change = (v: string) => {
        const clean = v.replace(/[^1-6]/g, '').slice(-1);
        onChange({ ...value, die2: clean });
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h3 className="text-2xl font-display font-bold text-premium-gold mb-4 uppercase tracking-wider underline decoration-premium-gold/30 underline-offset-8">{title}</h3>
            <label className="block text-xs font-display font-bold text-slate-400 mb-2 uppercase tracking-widest">{label}</label>

            <div className="flex items-center justify-center gap-6 mb-8 bg-black/20 p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden">
                <div className="flex gap-4">
                    <input
                        ref={die1Ref}
                        type="text"
                        value={value.die1}
                        onChange={e => handleDie1Change(e.target.value)}
                        className="w-16 h-16 bg-white rounded-2xl text-center text-3xl font-display font-black text-blood-red shadow-inner outline-none focus:ring-4 ring-premium-gold/20 transition-all placeholder:text-slate-200"
                        placeholder="?"
                        autoFocus
                    />
                    <input
                        ref={die2Ref}
                        type="text"
                        value={value.die2}
                        onChange={e => handleDie2Change(e.target.value)}
                        className="w-16 h-16 bg-white rounded-2xl text-center text-3xl font-display font-black text-blood-red shadow-inner outline-none focus:ring-4 ring-premium-gold/20 transition-all placeholder:text-slate-200"
                        placeholder="?"
                    />
                </div>
                <div className="w-px h-16 bg-white/10"></div>
                <DiceRollButton onRoll={v => {
                    const d1 = Math.floor(Math.random() * 6) + 1;
                    const d2 = Math.floor(Math.random() * 6) + 1;
                    onChange({ die1: d1.toString(), die2: d2.toString() });
                }} onPlaySound={() => onPlaySound && onPlaySound()} />
            </div>

            <div className="flex justify-between gap-4">
                {onBack && <button onClick={onBack} className="flex-1 font-display font-bold uppercase tracking-widest text-slate-400 py-3 px-6 rounded-xl border border-white/10 hover:bg-white/5 transition-premium">Atrás</button>}
                <button onClick={onNext} className="flex-1 bg-premium-gold text-black font-display font-black uppercase tracking-widest py-3 px-6 rounded-xl shadow-2xl hover:bg-premium-light transition-premium">Siguiente</button>
            </div>
        </div>
    );
};
