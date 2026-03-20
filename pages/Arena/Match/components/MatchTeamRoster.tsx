import React from 'react';
import type { ManagedPlayer, ManagedTeam } from '../../../../../types';

type TeamSide = 'home' | 'opponent';

interface MatchTeamRosterProps {
  team: ManagedTeam;
  side: TeamSide;
  activeTeamId: TeamSide;
  selectedPlayerId: number | null;
  onSelectPlayer: (player: ManagedPlayer, side: TeamSide) => void;
}

const getAccent = (side: TeamSide) => (
  side === 'home'
    ? {
        panel: 'border-sky-500/20 bg-sky-500/5',
        chip: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
        title: 'text-sky-400',
        glow: 'shadow-[0_0_20px_rgba(14,165,233,0.08)]',
      }
    : {
        panel: 'border-red-500/20 bg-red-500/5',
        chip: 'bg-red-500/10 text-red-400 border-red-500/20',
        title: 'text-red-400',
        glow: 'shadow-[0_0_20px_rgba(239,68,68,0.08)]',
      }
);

const MatchTeamRoster: React.FC<MatchTeamRosterProps> = ({ team, side, activeTeamId, selectedPlayerId, onSelectPlayer }) => {
  const accent = getAccent(side);
  const isActiveSide = activeTeamId === side;

  return (
    <section className={`rounded-[2rem] border bg-black/25 backdrop-blur-xl p-5 ${accent.panel} ${accent.glow}`}>
      <div className="flex items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="size-12 rounded-2xl bg-black/50 border border-white/5 overflow-hidden flex items-center justify-center shrink-0">
            {team.crestImage ? (
              <img src={team.crestImage} alt={team.name} className="w-full h-full object-cover" />
            ) : (
              <span className="material-symbols-outlined text-primary">shield</span>
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${accent.title}`}>{side === 'home' ? 'LOCAL' : 'RIVAL'}</p>
              {isActiveSide && (
                <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest bg-primary text-black">
                  Activo
                </span>
              )}
            </div>
            <h3 className="text-lg font-black italic uppercase tracking-tighter text-white truncate">{team.name}</h3>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 truncate">{team.rosterName}</p>
          </div>
        </div>
        <div className={`px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${accent.chip}`}>
          {team.players.length} fichas
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[540px] overflow-y-auto pr-1 custom-scrollbar">
        {team.players.map(player => {
          const hasLevelUp = player.spp >= (((player.advancements?.length || 0) + 1) * 16);
          const isSelected = selectedPlayerId === player.id;
          const isMNG = (player.missNextGame || 0) > 0;
          const injuries = player.lastingInjuries?.length || 0;
          const statusTone = player.status === 'Muerto'
            ? 'text-slate-500 border-white/5 bg-white/5'
            : player.status === 'Lesionado' || isMNG
              ? 'text-blood border-blood/20 bg-blood/10'
              : player.status === 'KO'
                ? 'text-amber-300 border-amber-500/20 bg-amber-500/10'
                : hasLevelUp
                  ? 'text-primary border-primary/25 bg-primary/10'
                  : 'text-slate-300 border-white/10 bg-white/5';

          return (
            <button
              key={player.id}
              onClick={() => onSelectPlayer(player, side)}
              className={`relative text-left rounded-2xl border p-4 transition-all overflow-hidden group/card hover:-translate-y-0.5 hover:border-primary/30 hover:bg-white/5 ${
                isSelected ? 'border-primary bg-primary/10 shadow-[0_0_24px_rgba(202,138,4,0.12)]' : 'border-white/5 bg-black/35'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="size-14 rounded-xl bg-black border border-white/10 overflow-hidden shrink-0 relative">
                  {player.image ? (
                    <img src={player.image} alt={player.customName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-700 font-black italic">
                      #{player.id.toString().slice(-2)}
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[10px] font-black text-primary uppercase tracking-widest">#{player.id.toString().slice(-2)}</p>
                      <h4 className="text-sm font-black italic uppercase tracking-tighter text-white truncate">{player.customName}</h4>
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest truncate">{player.position}</p>
                    </div>
                    {hasLevelUp && (
                      <span className="material-symbols-outlined text-primary text-sm animate-pulse">star</span>
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className={`px-2 py-1 rounded-full border text-[8px] font-black uppercase tracking-widest ${statusTone}`}>
                      {player.statusDetail || player.status}
                    </span>
                    {hasLevelUp && (
                      <span className="px-2 py-1 rounded-full border text-[8px] font-black uppercase tracking-widest bg-primary/10 border-primary/20 text-primary">
                        Subida
                      </span>
                    )}
                    {isMNG && (
                      <span className="px-2 py-1 rounded-full border text-[8px] font-black uppercase tracking-widest bg-blood/10 border-blood/20 text-blood">
                        MNG x{player.missNextGame}
                      </span>
                    )}
                    {injuries > 0 && (
                      <span className="px-2 py-1 rounded-full border text-[8px] font-black uppercase tracking-widest bg-white/5 border-white/10 text-slate-300">
                        {injuries} lesión{injuries > 1 ? 'es' : ''}
                      </span>
                    )}
                  </div>

                  <div className="mt-3 grid grid-cols-5 gap-1 text-center">
                    {[
                      ['MV', player.stats.MV],
                      ['FU', player.stats.FU],
                      ['AG', player.stats.AG],
                      ['PA', player.stats.PA],
                      ['AV', player.stats.AR],
                    ].map(([label, value]) => (
                      <div key={label as string} className="rounded-lg bg-black/30 border border-white/5 py-1">
                        <p className="text-[7px] text-slate-600 font-black uppercase">{label}</p>
                        <p className="text-[10px] font-black text-white">{String(value)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default MatchTeamRoster;
