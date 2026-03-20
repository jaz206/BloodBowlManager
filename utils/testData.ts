import { ManagedTeam, ManagedPlayer, PlayerStatus } from '../types';
import { teamsData } from '../data/teams';

const generateId = () => Math.floor(Math.random() * 1000000);

const normalizeRosterLabel = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/gi, '')
    .toLowerCase();

const createPlayerFromRoster = (teamRoster: any[], positionName: string, customName: string, id: number): ManagedPlayer => {
  const normalizedTarget = normalizeRosterLabel(positionName);
  const rosterEntry = teamRoster.find(p => {
    if (!p?.position) return false;
    if (p.position === positionName) return true;

    const normalizedRosterPosition = normalizeRosterLabel(String(p.position));
    return normalizedRosterPosition === normalizedTarget
      || normalizedRosterPosition.includes(normalizedTarget)
      || normalizedTarget.includes(normalizedRosterPosition);
  });
  if (!rosterEntry) {
    throw new Error(`Position ${positionName} not found in roster`);
  }
  return {
    ...rosterEntry,
    id,
    customName,
    spp: 0,
    gainedSkills: [],
    lastingInjuries: [],
    status: 'Activo' as PlayerStatus,
    sppActions: {}
  };
};

export const getGuestTeams = (): ManagedTeam[] => {
  const humanRoster = teamsData.find(t => t.name === 'Humanos')?.roster || [];
  const orcRoster = teamsData.find(t => t.name === 'Orcos')?.roster || [];

  const humanTeam: ManagedTeam = {
    id: 'guest-team-humans',
    name: 'Reikland Reavers',
    rosterName: 'Humanos',
    treasury: 150000,
    rerolls: 3,
    dedicatedFans: 1,
    cheerleaders: 0,
    assistantCoaches: 0,
    apothecary: true,
    players: [
      createPlayerFromRoster(humanRoster, 'Lanzador', 'Griff Oberwald Jr.', 101),
      createPlayerFromRoster(humanRoster, 'Placador Blitzer', 'Gunter Von Meinkopt', 102),
      createPlayerFromRoster(humanRoster, 'Placador Blitzer', 'Klaus Von Steiner', 103),
      createPlayerFromRoster(humanRoster, 'Receptor', 'Dieter Hammer', 104),
      createPlayerFromRoster(humanRoster, 'Receptor', 'Johann Faust', 105),
      createPlayerFromRoster(humanRoster, 'Humanos Línea', 'Hans "El Sufrido"', 106),
      createPlayerFromRoster(humanRoster, 'Humanos Línea', 'Fritz "Cabeza-Cubo"', 107),
      createPlayerFromRoster(humanRoster, 'Humanos Línea', 'Otto "Muela-Rota"', 108),
      createPlayerFromRoster(humanRoster, 'Humanos Línea', 'Gunter "El Calvo"', 109),
      createPlayerFromRoster(humanRoster, 'Humanos Línea', 'Karl "Piernas-Largueras"', 110),
      createPlayerFromRoster(humanRoster, 'Humanos Línea', 'Stefan "Dedos-Torcidos"', 111),
    ],
    crestImage: 'https://i.pinimg.com/736x/c2/63/6b/c2636b8d808236de876bc37716a39f49.jpg'
  };

  const orcTeam: ManagedTeam = {
    id: 'guest-team-orcs',
    name: 'Orcland Raiders',
    rosterName: 'Orcos',
    treasury: 120000,
    rerolls: 3,
    dedicatedFans: 1,
    cheerleaders: 0,
    assistantCoaches: 0,
    apothecary: true,
    players: [
      createPlayerFromRoster(orcRoster, 'Lanzador', 'Morkal "El Ojo"', 201),
      createPlayerFromRoster(orcRoster, 'Blitzer Orco', 'Gruk "Dientes de Acero"', 202),
      createPlayerFromRoster(orcRoster, 'Blitzer Orco', 'Zog "El Triturador"', 203),
      createPlayerFromRoster(orcRoster, 'Blitzer Orco', 'Borag "Sanguinario"', 204),
      createPlayerFromRoster(orcRoster, 'Blitzer Orco', 'Snag "El Rápido"', 205),
      createPlayerFromRoster(orcRoster, 'Fortachón Bloqueador', 'Hulk "El Muro"', 206),
      createPlayerFromRoster(orcRoster, 'Fortachón Bloqueador', 'Grug "Arranca-Cabezas"', 207),
      createPlayerFromRoster(orcRoster, 'Orcos Línea', 'Urk #1', 208),
      createPlayerFromRoster(orcRoster, 'Orcos Línea', 'Urk #2', 209),
      createPlayerFromRoster(orcRoster, 'Orcos Línea', 'Urk #3', 210),
      createPlayerFromRoster(orcRoster, 'Orcos Línea', 'Urk #4', 211),
    ],
    crestImage: 'https://i.pinimg.com/736x/c4/15/c0/c415c0a781138589868249c294e95b4a.jpg'
  };

  // Add snapshots for testing
  humanTeam.snapshots = [
    {
      id: 'snap-1',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      teamState: { ...humanTeam, name: 'Reikland Reavers (Veteranos)', treasury: 50000 }
    }
  ];

  orcTeam.snapshots = [
    {
      id: 'snap-2',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
      teamState: { ...orcTeam, name: 'Orcland Raiders (Campeones)', treasury: 200000 }
    }
  ];


  return [humanTeam, orcTeam];
};

