import { ManagedTeam, ManagedPlayer, PlayerStatus } from '../types';
import { teamsData } from '../data/teams';

const generateId = () => Math.floor(Math.random() * 1000000);

const createPlayerFromRoster = (teamRoster: any[], positionName: string, customName: string, id: number): ManagedPlayer => {
  const rosterEntry = teamRoster.find(p => p.position === positionName);
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

  return [humanTeam, orcTeam];
};
