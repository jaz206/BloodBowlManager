import React, { useState, useMemo } from 'react';
import DiceIcon from '../../components/icons/DiceIcon';

const ProbabilityCalculator: React.FC = () => {
    const [target, setTarget] = useState(3);
    const [hasReroll, setHasReroll] = useState(true);

    const probability = useMemo(() => {
        const singleSuccess = (7 - target) / 6;
        if (!hasReroll) {
            return (singleSuccess * 100).toFixed(1);
        }
        // Prob = 1 - (fail * fail)
        const singleFail = 1 - singleSuccess;
        const totalProb = 1 - (singleFail * singleFail);
        return (totalProb * 100).toFixed(1);
    }, [target, hasReroll]);

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-widest text-slate-400 font-bold">Objetivo de dado</label>
                <div className="flex gap-2">
                    {[2, 3, 4, 5, 6].map(num => (
                        <button
                            key={num}
                            onClick={() => setTarget(num)}
                            className={`flex-1 py-2 rounded border transition-all ${target === num ? 'bg-premium-gold/20 border-premium-gold text-premium-gold shadow-[0_0_15px_rgba(202,138,4,0.3)]' : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/30'}`}
                        >
                            {num}+
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-white/5 rounded border border-white/10">
                <span className="text-sm font-medium text-slate-200">¿Usar Segunda Oportunidad?</span>
                <button
                    onClick={() => setHasReroll(!hasReroll)}
                    className={`w-12 h-6 rounded-full relative transition-colors ${hasReroll ? 'bg-premium-gold' : 'bg-slate-700'}`}
                >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${hasReroll ? 'left-7' : 'left-1'}`}></div>
                </button>
            </div>

            <div className="p-4 bg-gradient-to-br from-premium-gold/20 to-transparent rounded-lg border border-premium-gold/30 text-center">
                <p className="text-xs uppercase tracking-[0.2em] text-premium-gold/80 mb-1 font-bold">Probabilidad de éxito</p>
                <div className="text-4xl font-display font-black text-white italic">
                    {probability}%
                </div>
                <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-widest">Calculado para tirada de Agilidad / Pase</p>
            </div>
        </div>
    );
};

export default ProbabilityCalculator;
