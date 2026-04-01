import React, { useState, useMemo } from 'react';
import { useMasterData } from '../../hooks/useMasterData';
import { useLanguage } from '../../contexts/LanguageContext';

const InducementTable: React.FC = () => {
    const { inducements, loading } = useMasterData();
    const { t } = useLanguage();
    const [tv1, setTv1] = useState(1000);
    const [tv2, setTv2] = useState(1150);

    const budget = useMemo(() => {
        const diff = Math.abs(tv1 - tv2);
        return diff * 1000;
    }, [tv1, tv2]);

    const recommendations = useMemo(() => {
        return inducements
            .filter(ind => ind.cost <= budget)
            .sort((a, b) => b.cost - a.cost);
    }, [budget, inducements]);

    if (loading) {
        return <div className="animate-pulse text-[#7b6853] text-center py-10">{t('loading.sync')}</div>;
    }

    return (
        <div className="blood-ui-light-card rounded-[2rem] p-6 md:p-8 border border-[rgba(111,87,56,0.12)] shadow-[0_18px_45px_rgba(92,68,39,0.12)] space-y-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="blood-ui-light-meta text-[9px] uppercase tracking-[0.35em] font-black">Tabla de incentivos</p>
                    <h3 className="blood-ui-light-title text-2xl uppercase italic mt-2">Gestor de incentivos</h3>
                </div>
                <div className="size-12 rounded-2xl bg-[rgba(202,138,4,0.12)] border border-[rgba(202,138,4,0.18)] flex items-center justify-center text-[#ca8a04]">
                    <span className="material-symbols-outlined">payments</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-[#7b6853] font-bold">{t('oracle.inducements.teamA')}</label>
                    <input
                        type="number"
                        value={tv1}
                        onChange={(e) => setTv1(Number(e.target.value))}
                        className="w-full bg-[rgba(255,251,241,0.72)] border border-[rgba(111,87,56,0.12)] rounded-2xl p-3 text-[#2b1d12] font-mono focus:border-[rgba(202,138,4,0.35)] outline-none"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-[#7b6853] font-bold">{t('oracle.inducements.teamB')}</label>
                    <input
                        type="number"
                        value={tv2}
                        onChange={(e) => setTv2(Number(e.target.value))}
                        className="w-full bg-[rgba(255,251,241,0.72)] border border-[rgba(111,87,56,0.12)] rounded-2xl p-3 text-[#2b1d12] font-mono focus:border-[rgba(202,138,4,0.35)] outline-none"
                    />
                </div>
            </div>

            <div className="p-4 bg-[linear-gradient(180deg,rgba(202,138,4,0.16),rgba(255,251,241,0.82))] border border-[rgba(202,138,4,0.18)] rounded-2xl flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest text-[#8a5f10] font-black italic">{t('oracle.inducements.budget')}:</span>
                <span className="text-2xl font-black text-[#2b1d12] italic">{budget.toLocaleString()} MO</span>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
                {recommendations.length > 0 ? recommendations.map(ind => (
                    <div key={ind.name} className="p-4 bg-[rgba(255,251,241,0.72)] border border-[rgba(111,87,56,0.12)] rounded-2xl hover:border-[rgba(202,138,4,0.24)] transition-colors group">
                        <div className="flex justify-between items-start mb-1">
                            <h4 className="text-sm font-black text-[#2b1d12] group-hover:text-[#ca8a04] transition-colors italic uppercase">{ind.name}</h4>
                            <span className="text-xs font-mono text-[#7b6853]">{ind.cost.toLocaleString()} MO</span>
                        </div>
                        <p className="text-[11px] text-[#6f5738] leading-relaxed mb-2 italic">{ind.description}</p>
                        {ind.strategy && (
                            <div className="text-[10px] italic text-[#8a5f10] border-t border-[rgba(111,87,56,0.08)] pt-2">
                                <span className="font-bold">{t('oracle.inducements.strategy')}:</span> {ind.strategy}
                            </div>
                        )}
                    </div>
                )) : (
                    <div className="text-center py-8 text-[#7b6853] italic text-xs">
                        {t('oracle.inducements.empty')}
                    </div>
                )}
            </div>
        </div>
    );
};

export default InducementTable;
