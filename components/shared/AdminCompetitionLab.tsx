import React, { useMemo, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import type { Competition, CompetitionTeam, ManagedTeam } from '../../types';
import { generateBracket, generateJoinCode, generateSchedule } from '../../pages/Arena/competitionUtils';
import { getGuestTeams } from '../../utils/testData';

type AdminCompetitionLabProps = {
  managedTeams: ManagedTeam[];
  onCompetitionCreate: (comp: Omit<Competition, 'id'>) => void | Promise<void>;
};

const COMPETITION_RULES: Competition['rules'] = {
  reglamento: 'BB2025',
  muerteSubita: false,
  incentivos: 'Todos',
  tiempoTurno: 4,
  mercenarios: true,
};

const cloneTeamState = (team: ManagedTeam) => JSON.parse(JSON.stringify(team)) as ManagedTeam;

const createCompetitionTeam = (
  team: ManagedTeam,
  ownerId: string,
  ownerName: string,
): CompetitionTeam => {
  const teamState = cloneTeamState(team);
  teamState.record = { wins: 0, draws: 0, losses: 0 };
  teamState.history = [];
  teamState.snapshots = [];
  teamState.updatedAt = undefined;

  return {
    teamName: team.name,
    ownerId,
    ownerName,
    teamState,
    stats: {
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      tdFor: 0,
      tdAgainst: 0,
      casFor: 0,
      casAgainst: 0,
      points: 0,
    },
  };
};

const buildTestOpponents = (format: 'Liguilla' | 'Torneo', minTeams: number): ManagedTeam[] => {
  const seeds = getGuestTeams();
  const suffixes = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Omega', 'Sigma', 'Lambda'];
  const opponents: ManagedTeam[] = [];

  for (let index = 0; opponents.length < minTeams - 1; index += 1) {
    const seed = seeds[index % seeds.length];
    const suffix = suffixes[index] || `Test ${index + 1}`;
    const cloned = cloneTeamState(seed);
    cloned.id = `lab-${format.toLowerCase()}-${index + 1}`;
    cloned.name = `${seed.name} ${suffix}`;
    cloned.ownerId = `lab-opponent-${index + 1}`;
    cloned.record = { wins: 0, draws: 0, losses: 0 };
    cloned.history = [];
    cloned.snapshots = [];
    cloned.updatedAt = undefined;
    opponents.push(cloned);
  }

  return opponents;
};

const AdminCompetitionLab: React.FC<AdminCompetitionLabProps> = ({ managedTeams, onCompetitionCreate }) => {
  const { user } = useAuth();
  const [selectedTeamName, setSelectedTeamName] = useState('');
  const [format, setFormat] = useState<'Liguilla' | 'Torneo'>('Liguilla');
  const [competitionName, setCompetitionName] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const minTeams = format === 'Torneo' ? 4 : 2;

  const hostTeams = useMemo(() => managedTeams.slice().sort((a, b) => a.name.localeCompare(b.name)), [managedTeams]);
  const selectedHostTeam = useMemo(
    () => hostTeams.find(team => team.name === selectedTeamName) || hostTeams[0] || null,
    [hostTeams, selectedTeamName]
  );

  const previewTeams = useMemo(() => {
    if (!selectedHostTeam || !user) return [];

    const hostClone = cloneTeamState(selectedHostTeam);
    hostClone.record = { wins: 0, draws: 0, losses: 0 };
    hostClone.history = [];
    hostClone.snapshots = [];
    hostClone.updatedAt = undefined;
    hostClone.ownerId = user.id;

    const teams = [createCompetitionTeam(hostClone, user.id, user.name)];
    const opponents = buildTestOpponents(format, minTeams);

    opponents.forEach((opponent, index) => {
      teams.push(createCompetitionTeam(
        opponent,
        opponent.ownerId || `lab-opponent-${index + 1}`,
        opponent.ownerId?.startsWith('lab-') ? 'Nuffle Lab' : 'Opponent Test',
      ));
    });

    return teams;
  }, [format, minTeams, selectedHostTeam, user]);

  const suggestedName = useMemo(() => {
    if (!selectedHostTeam) return 'Competiciones de prueba';
    return `${format === 'Liguilla' ? 'Liga' : 'Torneo'} privada - ${selectedHostTeam.name}`;
  }, [format, selectedHostTeam]);

  const handleCreate = async () => {
    if (!selectedHostTeam || !user) return;
    setIsCreating(true);
    setStatusMessage(null);

    try {
      const name = competitionName.trim() || suggestedName;
      const teams = previewTeams;
      const comp: Omit<Competition, 'id'> = {
        name,
        ownerId: user.id,
        ownerName: user.name,
        createdBy: user.id,
        joinCode: generateJoinCode(name),
        format,
        status: 'Open',
        visibility: 'Private',
        maxTeams: minTeams,
        teams,
        schedule: format === 'Liguilla' ? generateSchedule(teams.map(team => team.teamName)) : null,
        bracket: format === 'Torneo' ? generateBracket(teams.map(team => team.teamName)) : null,
        rules: COMPETITION_RULES,
        baseTeam: cloneTeamState(selectedHostTeam),
        reports: [],
      };

      await Promise.resolve(onCompetitionCreate(comp));
      setCompetitionName('');
      setStatusMessage('Competicion creada y lista para probar.');
    } catch (error) {
      console.error('Error creating lab competition:', error);
      setStatusMessage('No se pudo crear la competicion.');
    } finally {
      setIsCreating(false);
    }
  };

  if (!user) {
    return (
      <section className="glass-panel p-8 border-white/5 bg-black/40">
        <h4 className="text-2xl font-display font-black text-white uppercase italic tracking-tighter">Competiciones de prueba</h4>
        <p className="mt-4 text-sm text-slate-400">
          Necesitas iniciar sesion para crear ligas y torneos de prueba.
        </p>
      </section>
    );
  }

  if (!hostTeams.length) {
    return (
      <section className="glass-panel p-8 border-white/5 bg-black/40">
        <h4 className="text-2xl font-display font-black text-white uppercase italic tracking-tighter">Competiciones de prueba</h4>
        <p className="mt-4 text-sm text-slate-400">
          No tienes equipos en el gremio para usar como base.
        </p>
      </section>
    );
  }

  return (
    <section className="glass-panel p-8 border-white/5 bg-black/40 space-y-8">
      <div className="flex flex-col gap-2">
        <h4 className="text-2xl font-display font-black text-white uppercase italic tracking-tighter">
          Competiciones de prueba
        </h4>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
          Crea ligas o torneos privados con tu equipo del gremio y rivales de test ya preparados.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Equipo base
            </label>
            <select
              value={selectedTeamName || hostTeams[0].name}
              onChange={(e) => setSelectedTeamName(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-5 text-white focus:outline-none focus:ring-2 focus:ring-premium-gold/30"
            >
              {hostTeams.map(team => (
                <option key={team.id || team.name} value={team.name}>{team.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Formato
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(['Liguilla', 'Torneo'] as const).map(option => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setFormat(option)}
                  className={`rounded-2xl border px-4 py-4 text-left transition-all ${
                    format === option
                      ? 'bg-premium-gold text-black border-premium-gold'
                      : 'bg-white/5 text-slate-400 border-white/10 hover:text-white hover:border-white/20'
                  }`}
                >
                  <span className="block text-[10px] font-black uppercase tracking-widest">{option}</span>
                  <span className="block mt-1 text-[9px] opacity-70">
                    {option === 'Liguilla' ? 'Minimo 2 equipos' : 'Minimo 4 equipos'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Nombre de la competicion
            </label>
            <input
              value={competitionName}
              onChange={(e) => setCompetitionName(e.target.value)}
              placeholder={suggestedName}
              className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-5 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-premium-gold/30"
            />
          </div>

          <div className="rounded-2xl border border-white/5 bg-black/30 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Visibilidad</p>
                <p className="text-sm font-black text-white uppercase italic">Privada</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Equipos</p>
                <p className="text-sm font-black text-white uppercase italic">{minTeams}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-[2rem] border border-white/5 bg-zinc-950/60 p-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Vista previa</p>
            <div className="space-y-3">
              {previewTeams.map(team => (
                <div key={`${team.ownerId}-${team.teamName}`} className="flex items-center justify-between gap-3 rounded-2xl border border-white/5 bg-white/5 px-4 py-3">
                  <div className="min-w-0">
                    <p className="font-black text-white uppercase italic truncate">{team.teamName}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">{team.ownerId === user.id ? 'Tu equipo' : 'Rival de prueba'}</p>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-premium-gold">
                    {team.ownerId === user.id ? 'HOST' : 'TEST'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleCreate}
            disabled={isCreating || !selectedHostTeam}
            className="w-full rounded-2xl bg-premium-gold px-6 py-5 text-black font-black uppercase tracking-[0.2em] italic shadow-xl shadow-premium-gold/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? 'Creando...' : 'Crear competicion privada de prueba'}
          </button>

          {statusMessage && (
            <p className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400">
              {statusMessage}
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default AdminCompetitionLab;
