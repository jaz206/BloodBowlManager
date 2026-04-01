import React, { useMemo, useState } from 'react';

const ProbabilityCalculator: React.FC = () => {
    const [target, setTarget] = useState(3);
    const [hasReroll, setHasReroll] = useState(true);

    const probability = useMemo(() => {
        const singleSuccess = (7 - target) / 6;
        const singleFail = 1 - singleSuccess;
        const totalProb = hasReroll ? 1 - (singleFail * singleFail) : singleSuccess;
        return (Math.max(0, Math.min(1, totalProb)) * 100).toFixed(1);
    }, [target, hasReroll]);

    return (
        <div className="blood-ui-light-card rounded-[2rem] p-6 md:p-8 border border-[rgba(111,87,56,0.12)] shadow-[0_18px_45px_rgba(92,68,39,0.12)] space-y-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="blood-ui-light-meta text-[9px] uppercase tracking-[0.35em] font-black">Calculadora viva</p>
                    <h3 className="blood-ui-light-title text-2xl uppercase italic mt-2">Probabilidades</h3>
                </div>
                <div className="size-12 rounded-2xl bg-[rgba(202,138,4,0.12)] border border-[rgba(202,138,4,0.18)] flex items-center justify-center text-[#ca8a04]">
                    <span className="material-symbols-outlined">casino</span>
                </div>
            </div>

            <div className="grid grid-cols-5 gap-2">
                {[2, 3, 4, 5, 6].map(num => (
                    <button
                        key={num}
                        onClick={() => setTarget(num)}
                        className={`py-3 rounded-2xl border text-sm font-black italic transition-all ${
                            target === num
                                ? 'bg-[#ca8a04] border-[rgba(202,138,4,0.28)] text-[#2b1d12] shadow-[0_10px_24px_rgba(202,138,4,0.18)]'
                                : 'bg-[rgba(255,251,241,0.72)] border-[rgba(111,87,56,0.12)] text-[#7b6853] hover:border-[rgba(202,138,4,0.22)]'
                        }`}
                    >
                        {num}+
                    </button>
                ))}
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl border border-[rgba(111,87,56,0.12)] bg-[rgba(255,251,241,0.72)]">
                <div>
                    <p className="text-[10px] uppercase tracking-[0.28em] font-black text-[#7b6853] italic">¿Usar Segunda Oportunidad?</p>
                    <p className="text-xs text-[#6f5738] mt-1">Aplica la curva de reroll sobre el objetivo actual.</p>
                </div>
                <button
                    onClick={() => setHasReroll(!hasReroll)}
                    className={`w-14 h-8 rounded-full relative transition-colors ${hasReroll ? 'bg-[#ca8a04]' : 'bg-[rgba(111,87,56,0.18)]'}`}
                    aria-pressed={hasReroll}
                >
                    <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all shadow ${hasReroll ? 'left-7' : 'left-1'}`} />
                </button>
            </div>

            <div className="rounded-[1.6rem] border border-[rgba(202,138,4,0.18)] bg-[linear-gradient(180deg,rgba(202,138,4,0.16),rgba(255,251,241,0.82))] p-5 text-center">
                <p className="text-[10px] uppercase tracking-[0.25em] font-black text-[#7b6853] italic">Probabilidad de éxito</p>
                <div className="mt-2 text-5xl md:text-6xl font-black italic text-[#2b1d12] tracking-tight">
                    {probability}%
                </div>
                <p className="text-[10px] uppercase tracking-[0.28em] font-black text-[#7b6853] mt-2">
                    Tirada de agilidad / pase
                </p>
            </div>
        </div>
    );
};

export default ProbabilityCalculator;
