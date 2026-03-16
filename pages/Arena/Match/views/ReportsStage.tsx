import React, { useState } from 'react';
import { useMatch } from '../context/MatchContext';
import ShieldCheckIcon from '../../../../components/icons/ShieldCheckIcon';
import MatchSummaryModal from '../components/modals/system/MatchSummaryModal';
import { MatchReport } from '../../../../types';

/**
 * ReportsStage — archivo de crónicas de partidos pasados.
 */
const ReportsStage: React.FC = () => {
    const { matchReports, setGameState } = useMatch();
    const [selectedReport, setSelectedReport] = useState<MatchReport | null>(null);

    return (
        <div className="max-w-4xl mx-auto py-10 px-4 animate-fade-in space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-4xl font-display font-black text-white uppercase italic tracking-tighter">Archivo de <span className="text-premium-gold">Crónicas</span></h2>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">El eco de los gritos aún resuena en las gradas</p>
                </div>
                <button 
                    onClick={() => setGameState('setup')} 
                    className="bg-white/5 hover:bg-white/10 text-slate-400 p-4 rounded-2xl border border-white/10 transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                >
                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                    Cerrar Archivo
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {matchReports && matchReports.length > 0 ? matchReports.map(report => (
                    <div
                        key={report.id}
                        onClick={() => setSelectedReport(report)}
                        className="glass-panel p-6 border-white/5 bg-black/40 hover:border-premium-gold/30 hover:bg-premium-gold/5 transition-all cursor-pointer group flex flex-col md:flex-row items-center justify-between gap-6"
                    >
                        <div className="flex items-center gap-6 flex-1">
                            <div className="flex -space-x-4">
                                <div className="w-14 h-14 rounded-2xl bg-black border border-white/10 overflow-hidden shadow-2xl relative z-10 group-hover:scale-105 transition-transform">
                                    {report.homeTeam.crestImage ? <img src={report.homeTeam.crestImage} className="w-full h-full object-cover" /> : <ShieldCheckIcon className="p-3 text-sky-500/30" />}
                                </div>
                                <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/10 overflow-hidden shadow-2xl relative z-0 group-hover:scale-105 transition-transform delay-75">
                                    {report.opponentTeam.crestImage ? <img src={report.opponentTeam.crestImage} className="w-full h-full object-cover" /> : <ShieldCheckIcon className="p-3 text-red-500/30" />}
                                </div>
                            </div>
                            <div>
                                <p className="text-[9px] font-display font-black text-slate-500 uppercase tracking-widest mb-1">{report.date}</p>
                                <h4 className="text-lg font-display font-black text-white uppercase italic tracking-tighter leading-none group-hover:text-premium-gold transition-colors">
                                    {report.homeTeam.name} <span className="text-slate-600 px-2">vs</span> {report.opponentTeam.name}
                                </h4>
                                {report.summary && <p className="text-[10px] text-slate-400 mt-2 line-clamp-1 uppercase tracking-wider font-bold">{report.summary}</p>}
                            </div>
                        </div>
                        <div className="flex items-center gap-8">
                            <div className="text-center">
                                <p className="text-2xl font-display font-black text-white italic tracking-tighter drop-shadow-sm">{report.homeTeam.score} - {report.opponentTeam.score}</p>
                                <p className="text-[8px] font-display font-black text-slate-600 uppercase tracking-widest mt-1">Resultado Final</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 group-hover:bg-premium-gold group-hover:text-black transition-all">
                                <span className="material-symbols-outlined text-xl">auto_stories</span>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="py-24 text-center glass-panel border-dashed border-white/5 flex flex-col items-center justify-center gap-6 opacity-30">
                        <span className="material-symbols-outlined text-6xl">history_edu</span>
                        <p className="text-sm font-display font-black text-slate-500 uppercase tracking-[0.4em]">El pergamino está en blanco</p>
                    </div>
                )}
            </div>

            {selectedReport && (
                <MatchSummaryModal
                    isOpen={!!selectedReport}
                    onClose={() => setSelectedReport(null)}
                    homeTeam={{ name: selectedReport.homeTeam.name, rosterName: selectedReport.homeTeam.rosterName, crestImage: selectedReport.homeTeam.crestImage } as any}
                    opponentTeam={{ name: selectedReport.opponentTeam.name, rosterName: selectedReport.opponentTeam.rosterName, crestImage: selectedReport.opponentTeam.crestImage } as any}
                    gameLog={selectedReport.gameLog}
                    currentScore={{ home: selectedReport.homeTeam.score, opponent: selectedReport.opponentTeam.score }}
                    headline={selectedReport.headline}
                    subHeadline={selectedReport.subHeadline}
                    article={selectedReport.article}
                    stats={selectedReport.stats}
                    spectators={selectedReport.spectators}
                    weather={selectedReport.weather}
                />
            )}
        </div>
    );
};

export default ReportsStage;
