import React from 'react';
import type { Competition, CompetitionTeam } from '../../types';

interface CompetitionCardProps {
    competition: Competition;
    myTeamInComp?: CompetitionTeam;
    onClick: () => void;
}

const CompetitionCard: React.FC<CompetitionCardProps> = ({ competition, myTeamInComp, onClick }) => {
    const statusColor = competition.status === 'Open'
        ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]'
        : competition.status === 'In Progress'
            ? 'bg-yellow-400 shadow-[0_0_8px_rgba(234,179,8,0.5)]'
            : 'bg-slate-500';

    return (
        <div
            className="group bg-zinc-900/40 border border-white/5 p-6 rounded-[2rem] hover:bg-zinc-800/60 transition-all relative overflow-hidden cursor-pointer"
            onClick={onClick}
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-primary/10 transition-colors" />
            <div className="relative z-10 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                        <span className={`w-2 h-2 shrink-0 rounded-full ${statusColor}`} />
                        <h3 className="text-xl font-black text-white uppercase italic tracking-tight truncate group-hover:text-primary transition-colors">
                            {competition.name}
                        </h3>
                    </div>
                    <span className="shrink-0 ml-2 text-[9px] font-black bg-white/5 text-slate-400 px-2 py-1 rounded-lg uppercase tracking-widest">
                        {competition.format === 'Liguilla' ? 'LIGA' : 'TORNEO'}
                    </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                    <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px] text-primary/50">person</span>
                        {competition.ownerName}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-slate-700" />
                    <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px] text-primary/50">groups</span>
                        {competition.teams.length}{competition.maxTeams ? `/${competition.maxTeams}` : ''} equipos
                    </span>
                    {competition.rules?.reglamento && (
                        <>
                            <span className="w-1 h-1 rounded-full bg-slate-700" />
                            <span className="text-primary/60">{competition.rules.reglamento}</span>
                        </>
                    )}
                </div>

                {myTeamInComp && (
                    <div className="mt-2 pt-3 border-t border-white/5 flex items-center justify-between">
                        <div className="flex gap-4">
                            <div>
                                <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Tu equipo</p>
                                <p className="text-[11px] font-black text-white italic truncate max-w-[130px]">{myTeamInComp.teamName}</p>
                            </div>
                            {myTeamInComp.stats && (
                                <div>
                                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Record</p>
                                    <p className="text-[11px] font-black text-primary italic">{myTeamInComp.stats.won}V {myTeamInComp.stats.drawn}E {myTeamInComp.stats.lost}D</p>
                                </div>
                            )}
                            {myTeamInComp.stats && (
                                <div>
                                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Puntos</p>
                                    <p className="text-[11px] font-black text-yellow-400 italic">{(myTeamInComp.stats.won || 0) * 3 + (myTeamInComp.stats.drawn || 0)} PTS</p>
                                </div>
                            )}
                        </div>
                        <span className="material-symbols-outlined text-primary/40 text-sm">arrow_forward_ios</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CompetitionCard;
