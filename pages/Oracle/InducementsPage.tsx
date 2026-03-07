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
        return <div className="animate-pulse text-slate-500 text-center py-10">{t('loading.sync')}</div>;
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">{t('oracle.inducements.teamA')}</label>
                    <input
                        type="number"
                        value={tv1}
                        onChange={(e) => setTv1(Number(e.target.value))}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white font-mono focus:border-premium-gold outline-none"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">{t('oracle.inducements.teamB')}</label>
                    <input
                        type="number"
                        value={tv2}
                        onChange={(e) => setTv2(Number(e.target.value))}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white font-mono focus:border-premium-gold outline-none"
                    />
                </div>
            </div>

            <div className="p-3 bg-blood-red/10 border border-blood-red/20 rounded-lg flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest text-blood-red font-black italic">{t('oracle.inducements.budget')}:</span>
                <span className="text-xl font-display font-black text-white italic">{budget.toLocaleString()} MO</span>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {recommendations.length > 0 ? recommendations.map(ind => (
                    <div key={ind.name} className="p-3 bg-white/5 border border-white/10 rounded-md hover:bg-white/10 transition-colors group">
                        <div className="flex justify-between items-start mb-1">
                            <h4 className="text-sm font-bold text-premium-gold group-hover:text-white transition-colors">{ind.name}</h4>
                            <span className="text-xs font-mono text-slate-400">{ind.cost.toLocaleString()} MO</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed mb-2">{ind.description}</p>
                        {ind.strategy && (
                            <div className="text-[10px] italic text-premium-gold/60 border-t border-white/5 pt-1">
                                <span className="font-bold">{t('oracle.inducements.strategy')}:</span> {ind.strategy}
                            </div>
                        )}
                    </div>
                )) : (
                    <div className="text-center py-8 text-slate-500 italic text-xs">
                        {t('oracle.inducements.empty')}
                    </div>
                )}
            </div>
        </div>
    );
};

export default InducementTable;
