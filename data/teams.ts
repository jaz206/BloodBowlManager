import type { Team } from "../types";

export const teamsData: Team[] = [
  {
    "name": "Amazons",
    "specialRules": "Lustrian Superleague, Team Management",
    "rerollCost": 50000,
    "tier": 1,
    "apothecary": "Sí",
    "image": "https://i.pinimg.com/736x/b2/f0/5c/b2f05c2fcd61096bbf20a2b194bad517.jpg",
    "ratings": {
      "fuerza": 65,
      "agilidad": 80,
      "velocidad": 75,
      "armadura": 83,
      "pase": 55
    },
    "roster": [
      {
        "qty": "0-16",
        "position": "Eagle Guerrero Línea",
        "cost": 50000,
        "stats": {
          "MV": 6,
          "FU": "3",
          "AG": "3+",
          "PS": "4+",
          "AR": "8+"
        },
        "skills": "Esquivar",
        "primary": "G",
        "secondary": "AS"
      },
      {
        "qty": "0-2",
        "position": "Python Guerrero Lanzador",
        "cost": 80000,
        "stats": {
          "MV": 6,
          "FU": "3",
          "AG": "3+",
          "PS": "3+",
          "AR": "8+"
        },
        "skills": "Esquivar, On the Ball, Pasar, Safe Pasar",
        "primary": "GP",
        "secondary": "AS"
      },
      {
        "qty": "0-16",
        "position": "Jaguar Guerrero Bloqueador",
        "cost": 110000,
        "stats": {
          "MV": 6,
          "FU": "4",
          "AG": "3+",
          "PS": "5+",
          "AR": "9+"
        },
        "skills": "Defensive, Esquivar",
        "primary": "GS",
        "secondary": "A"
      },
      {
        "qty": "0-2",
        "position": "Piranha Guerrero Placador",
        "cost": 90000,
        "stats": {
          "MV": 7,
          "FU": "3",
          "AG": "3+",
          "PS": "5+",
          "AR": "8+"
        },
        "skills": "Esquivar, Hit and Run, Saltar",
        "primary": "AG",
        "secondary": "S"
      }
    ]
  },
  {
    "name": "Black Orcs",
    "specialRules": "Badlands Brawl, Team Management, Bribery and Corruption",
    "rerollCost": 50000,
    "tier": 1,
    "apothecary": "Sí",
    "image": "https://i.pinimg.com/736x/01/95/95/0195951b4bb9081cf33a85740fedb59c.jpg",
    "ratings": {
      "fuerza": 73,
      "agilidad": 60,
      "velocidad": 56,
      "armadura": 93,
      "pase": 47
    },
    "roster": [
      {
        "qty": "0-12",
        "position": "Goblins Bruiser Línea",
        "cost": 45000,
        "stats": {
          "MV": 6,
          "FU": "2",
          "AG": "3+",
          "PS": "4+",
          "AR": "8+"
        },
        "skills": "Esquivar, Buena Gente, Canijo, Cabeza Dura",
        "primary": "A",
        "secondary": "GPS"
      },
      {
        "qty": "0-6",
        "position": "Orcos Negros",
        "cost": 90000,
        "stats": {
          "MV": 4,
          "FU": "4",
          "AG": "4+",
          "PS": "5+",
          "AR": "10+"
        },
        "skills": "Brawler, Agarrar",
        "primary": "GS",
        "secondary": "AP"
      },
      {
        "qty": "0-1",
        "position": "Trained Troll",
        "cost": 115000,
        "stats": {
          "MV": 4,
          "FU": "5",
          "AG": "5+",
          "PS": "5+",
          "AR": "10+"
        },
        "skills": "Siempre Hambriento, Solitario (3+), Golpe Mortífero (+1), Projectile Vomit, Realmente Estúpido, Regeneración, Throw Team-mate",
        "primary": "S",
        "secondary": "AGP"
      }
    ]
  },
  {
    "name": "Elegidos del Caos",
    "specialRules": "Favored of..., Team Management",
    "rerollCost": 50000,
    "tier": 2,
    "apothecary": "Sí",
    "image": "https://i.pinimg.com/736x/76/4c/a7/764ca7f2f36fbd1cd1a513191cb31c9b.jpg",
    "ratings": {
      "fuerza": 80,
      "agilidad": 80,
      "velocidad": 60,
      "armadura": 100,
      "pase": 40
    },
    "roster": [
      {
        "qty": "0-4",
        "position": "Chosen Bloqueador",
        "cost": 100000,
        "stats": {
          "MV": 5,
          "FU": "4",
          "AG": "3+",
          "PS": "5+",
          "AR": "10+"
        },
        "skills": "GMS",
        "primary": "",
        "secondary": "A"
      }
    ]
  },
  {
    "name": "Chaos Dwarfs",
    "specialRules": "Favored of..., Team Management, Worlds Edge Superleague, Team Management, Badlands Brawl, Team Management",
    "rerollCost": 50000,
    "tier": 2,
    "apothecary": "Sí",
    "image": "https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0",
    "ratings": {
      "fuerza": 72,
      "agilidad": 68,
      "velocidad": 65,
      "armadura": 90,
      "pase": 32
    },
    "roster": [
      {
        "qty": "0-16",
        "position": "Hobgoblin Línea",
        "cost": 40000,
        "stats": {
          "MV": 6,
          "FU": "3",
          "AG": "3+",
          "PS": "4+",
          "AR": "8+"
        },
        "skills": "G",
        "primary": "",
        "secondary": "AS"
      },
      {
        "qty": "0-4",
        "position": "Enanos del Caos Bloqueador",
        "cost": 70000,
        "stats": {
          "MV": 4,
          "FU": "3",
          "AG": "4+",
          "PS": "6+",
          "AR": "10+"
        },
        "skills": "Placaje, Iron Hard Skin, Cabeza Dura",
        "primary": "GS",
        "secondary": "AM"
      },
      {
        "qty": "0-2",
        "position": "Bull Centaur Placador",
        "cost": 130000,
        "stats": {
          "MV": 6,
          "FU": "4",
          "AG": "4+",
          "PS": "6+",
          "AR": "10+"
        },
        "skills": "Esprintar, Pies Firmes, Cabeza Dura",
        "primary": "GS",
        "secondary": "AM"
      },
      {
        "qty": "0-1",
        "position": "Renegade Minotauro",
        "cost": 150000,
        "stats": {
          "MV": 5,
          "FU": "5",
          "AG": "4+",
          "PS": "-",
          "AR": "9+"
        },
        "skills": "Furia, Horns, Solitario (4+), Golpe Mortífero (+1), Cabeza Dura, Unchannelled Fury",
        "primary": "S",
        "secondary": "AGM"
      },
      {
        "qty": "0-2",
        "position": "Hobgoblin Sneaky Stabba",
        "cost": 70000,
        "stats": {
          "MV": 6,
          "FU": "3",
          "AG": "3+",
          "PS": "5+",
          "AR": "8+"
        },
        "skills": "Marcaje, Stab",
        "primary": "G",
        "secondary": "AS"
      }
    ]
  },
  {
    "name": "Renegados del Caos",
    "specialRules": "Favored of..., Team Management",
    "rerollCost": 50000,
    "tier": 3,
    "apothecary": "Sí",
    "image": "https://i.pinimg.com/736x/c3/bc/00/c3bc00232d9e1ffccb8fa176aeb236c2.jpg",
    "ratings": {
      "fuerza": 74,
      "agilidad": 72,
      "velocidad": 67,
      "armadura": 91,
      "pase": 50
    },
    "roster": [
      {
        "qty": "0-1",
        "position": "Renegade Skaven",
        "cost": 50000,
        "stats": {
          "MV": 7,
          "FU": "3",
          "AG": "3+",
          "PS": "4+",
          "AR": "8+"
        },
        "skills": "Animosidad (all team-mates)",
        "primary": "GM",
        "secondary": "AS"
      },
      {
        "qty": "0-1",
        "position": "Renegade Elfos Oscuros",
        "cost": 75000,
        "stats": {
          "MV": 6,
          "FU": "3",
          "AG": "2+",
          "PS": "3+",
          "AR": "9+"
        },
        "skills": "Animosidad (all team-mates)",
        "primary": "AGM",
        "secondary": "PS"
      },
      {
        "qty": "0-1",
        "position": "Renegade Ogros",
        "cost": 140000,
        "stats": {
          "MV": 5,
          "FU": "5",
          "AG": "4+",
          "PS": "5+",
          "AR": "10+"
        },
        "skills": "Bone Head, Solitario (4+), Golpe Mortífero (+1), Cabeza Dura, Throw Team-mate",
        "primary": "S",
        "secondary": "AGM"
      },
      {
        "qty": "0-1",
        "position": "Renegade Orcos",
        "cost": 50000,
        "stats": {
          "MV": 5,
          "FU": "3",
          "AG": "3+",
          "PS": "5+",
          "AR": "10+"
        },
        "skills": "Animosidad (all team-mates)",
        "primary": "GM",
        "secondary": "AS"
      },
      {
        "qty": "0-1",
        "position": "Renegade Troll",
        "cost": 115000,
        "stats": {
          "MV": 4,
          "FU": "5",
          "AG": "5+",
          "PS": "5+",
          "AR": "10+"
        },
        "skills": "Siempre Hambriento, Solitario (4+), Golpe Mortífero (+1), Projectile Vomit, Realmente Estúpido, Regeneración, Throw Team-mate",
        "primary": "S",
        "secondary": "AGM"
      },
      {
        "qty": "0-1",
        "position": "Renegade Goblins",
        "cost": 40000,
        "stats": {
          "MV": 6,
          "FU": "2",
          "AG": "3+",
          "PS": "4+",
          "AR": "8+"
        },
        "skills": "Animosidad (all team-mates), Esquivar, Buena Gente, Canijo",
        "primary": "AM",
        "secondary": "GP"
      },
      {
        "qty": "0-1",
        "position": "Renegade Minotauro",
        "cost": 150000,
        "stats": {
          "MV": 5,
          "FU": "5",
          "AG": "4+",
          "PS": "-",
          "AR": "9+"
        },
        "skills": "Solitario (4+), Furia, Horns, Golpe Mortífero (+1), Cabeza Dura, Unchannelled Fury",
        "primary": "S",
        "secondary": "AGM"
      },
      {
        "qty": "0-12",
        "position": "Renegade Humanos Línea",
        "cost": 50000,
        "stats": {
          "MV": 6,
          "FU": "3",
          "AG": "3+",
          "PS": "4+",
          "AR": "9+"
        },
        "skills": "GM",
        "primary": "",
        "secondary": "AS"
      },
      {
        "qty": "0-1",
        "position": "Renegade Humanos Lanzador",
        "cost": 75000,
        "stats": {
          "MV": 6,
          "FU": "3",
          "AG": "3+",
          "PS": "3+",
          "AR": "9+"
        },
        "skills": "Animosidad (all team-mates), Pasar, Safe Pair of Hands",
        "primary": "GMP",
        "secondary": "AS"
      },
      {
        "qty": "0-1",
        "position": "Renegade Rat Ogros",
        "cost": 150000,
        "stats": {
          "MV": 6,
          "FU": "5",
          "AG": "4+",
          "PS": "-",
          "AR": "9+"
        },
        "skills": "Animal Savagery, Furia, Solitario (4+), Golpe Mortífero (+1), Prehensile Tail",
        "primary": "S",
        "secondary": "AGM"
      }
    ]
  },
  {
    "name": "Dark Elves",
    "specialRules": "Elven Kingdoms League, Team Management",
    "rerollCost": 50000,
    "tier": 2,
    "apothecary": "Sí",
    "image": "https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0",
    "ratings": {
      "fuerza": 60,
      "agilidad": 100,
      "velocidad": 82,
      "armadura": 84,
      "pase": 56
    },
    "roster": [
      {
        "qty": "0-2",
        "position": "Corredor",
        "cost": 80000,
        "stats": {
          "MV": 7,
          "FU": "3",
          "AG": "2+",
          "PS": "3+",
          "AR": "8+"
        },
        "skills": "Dump-off",
        "primary": "AGP",
        "secondary": "S"
      },
      {
        "qty": "0-2",
        "position": "Assassin",
        "cost": 85000,
        "stats": {
          "MV": 7,
          "FU": "3",
          "AG": "2+",
          "PS": "5+",
          "AR": "8+"
        },
        "skills": "Marcaje, Stab",
        "primary": "AG",
        "secondary": "PS"
      },
      {
        "qty": "0-4",
        "position": "Placador",
        "cost": 100000,
        "stats": {
          "MV": 7,
          "FU": "3",
          "AG": "2+",
          "PS": "4+",
          "AR": "9+"
        },
        "skills": "Placaje",
        "primary": "AG",
        "secondary": "PS"
      },
      {
        "qty": "0-2",
        "position": "Witch Elf",
        "cost": 110000,
        "stats": {
          "MV": 7,
          "FU": "3",
          "AG": "2+",
          "PS": "5+",
          "AR": "8+"
        },
        "skills": "Esquivar, Furia, Saltar",
        "primary": "AG",
        "secondary": "PS"
      },
      {
        "qty": "0-12",
        "position": "Elfos Oscuros Línea",
        "cost": 70000,
        "stats": {
          "MV": 6,
          "FU": "3",
          "AG": "2+",
          "PS": "4+",
          "AR": "9+"
        },
        "skills": "AG",
        "primary": "",
        "secondary": "S"
      }
    ]
  },
  {
    "name": "Dwarves",
    "specialRules": "Old World Classic, Team Management, Worlds Edge Superleague, Team Management",
    "rerollCost": 50000,
    "tier": 2,
    "apothecary": "Sí",
    "image": "https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0",
    "ratings": {
      "fuerza": 76,
      "agilidad": 64,
      "velocidad": 58,
      "armadura": 98,
      "pase": 40
    },
    "roster": [
      {
        "qty": "0-12",
        "position": "Enanos Bloqueador Línea",
        "cost": 70000,
        "stats": {
          "MV": 4,
          "FU": "3",
          "AG": "4+",
          "PS": "5+",
          "AR": "10+"
        },
        "skills": "Placaje, Placar, Cabeza Dura",
        "primary": "GS",
        "secondary": "A"
      },
      {
        "qty": "0-2",
        "position": "Corredor",
        "cost": 85000,
        "stats": {
          "MV": 6,
          "FU": "3",
          "AG": "3+",
          "PS": "4+",
          "AR": "9+"
        },
        "skills": "Manos Seguras, Cabeza Dura",
        "primary": "GP",
        "secondary": "AS"
      },
      {
        "qty": "0-2",
        "position": "Placador",
        "cost": 80000,
        "stats": {
          "MV": 5,
          "FU": "3",
          "AG": "3+",
          "PS": "4+",
          "AR": "10+"
        },
        "skills": "Placaje, Cabeza Dura",
        "primary": "GS",
        "secondary": "AP"
      },
      {
        "qty": "0-2",
        "position": "Troll Slayer",
        "cost": 95000,
        "stats": {
          "MV": 5,
          "FU": "3",
          "AG": "4+",
          "PS": "-",
          "AR": "9+"
        },
        "skills": "Placaje, Agallas, Furia, Cabeza Dura",
        "primary": "GS",
        "secondary": "A"
      },
      {
        "qty": "0-1",
        "position": "Deathroller",
        "cost": 170000,
        "stats": {
          "MV": 4,
          "FU": "7",
          "AG": "5+",
          "PS": "-",
          "AR": "11+"
        },
        "skills": "Break Placar, Jugador Sucio (+2), Juggernaut, Solitario (5+), Golpe Mortífero (+1), No Hands, Secret Weapon, Mantenerse Firme",
        "primary": "S",
        "secondary": "AG"
      }
    ]
  },
  {
    "name": "Unión Élfica",
    "specialRules": "Elven Kingdoms League, Team Management",
    "rerollCost": 50000,
    "tier": 2,
    "apothecary": "Sí",
    "image": "https://i.pinimg.com/736x/00/92/17/0092173b8d1e26ac361e877e871a6977.jpg",
    "ratings": {
      "fuerza": 60,
      "agilidad": 100,
      "velocidad": 81,
      "armadura": 83,
      "pase": 75
    },
    "roster": [
      {
        "qty": "0-4",
        "position": "Receptor",
        "cost": 100000,
        "stats": {
          "MV": 8,
          "FU": "3",
          "AG": "2+",
          "PS": "4+",
          "AR": "8+"
        },
        "skills": "Atrapar, Nervios de Acero",
        "primary": "AG",
        "secondary": "S"
      },
      {
        "qty": "0-2",
        "position": "Placador",
        "cost": 115000,
        "stats": {
          "MV": 7,
          "FU": "3",
          "AG": "2+",
          "PS": "3+",
          "AR": "9+"
        },
        "skills": "Placaje, Echarse a un lado",
        "primary": "AG",
        "secondary": "PS"
      },
      {
        "qty": "0-12",
        "position": "Línea",
        "cost": 60000,
        "stats": {
          "MV": 6,
          "FU": "3",
          "AG": "2+",
          "PS": "4+",
          "AR": "8+"
        },
        "skills": "AG",
        "primary": "",
        "secondary": "S"
      },
      {
        "qty": "0-2",
        "position": "Lanzador",
        "cost": 75000,
        "stats": {
          "MV": 6,
          "FU": "3",
          "AG": "2+",
          "PS": "2+",
          "AR": "8+"
        },
        "skills": "Pasar",
        "primary": "AGP",
        "secondary": "S"
      }
    ]
  },
  {
    "name": "Gnomes",
    "specialRules": "Halflings Thimble Cup, Team Management, Tier 3, Team Management",
    "rerollCost": 50000,
    "tier": 1,
    "apothecary": "Sí",
    "image": "https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0",
    "ratings": {
      "fuerza": 56,
      "agilidad": 76,
      "velocidad": 58,
      "armadura": 78,
      "pase": 52
    },
    "roster": [
      {
        "qty": "0-16",
        "position": "Gnomos Línea",
        "cost": 40000,
        "stats": {
          "MV": 5,
          "FU": "2",
          "AG": "3+",
          "PS": "4+",
          "AR": "7+"
        },
        "skills": "Saltar, Buena Gente, Canijo, Lucha",
        "primary": "A",
        "secondary": "GS"
      },
      {
        "qty": "0-2",
        "position": "Gnomos Beastmaster",
        "cost": 55000,
        "stats": {
          "MV": 5,
          "FU": "2",
          "AG": "3+",
          "PS": "4+",
          "AR": "8+"
        },
        "skills": "Defensa, Saltar, Canijo, Lucha",
        "primary": "A",
        "secondary": "GS"
      },
      {
        "qty": "0-2",
        "position": "Gnomos Illusionist",
        "cost": 50000,
        "stats": {
          "MV": 5,
          "FU": "2",
          "AG": "3+",
          "PS": "3+",
          "AR": "7+"
        },
        "skills": "Saltar, Canijo, Trickster, Lucha",
        "primary": "AP",
        "secondary": "G"
      },
      {
        "qty": "0-2",
        "position": "Woodland Fox",
        "cost": 50000,
        "stats": {
          "MV": 7,
          "FU": "2",
          "AG": "2+",
          "PS": "-",
          "AR": "6+"
        },
        "skills": "Esquivar, My Ball, Echarse a un lado, Canijo",
        "primary": "-",
        "secondary": "A"
      },
      {
        "qty": "0-2",
        "position": "Altern Forest Treeman",
        "cost": 120000,
        "stats": {
          "MV": 2,
          "FU": "6",
          "AG": "5+",
          "PS": "5+",
          "AR": "11+"
        },
        "skills": "Golpe Mortífero (+1), Mantenerse Firme, Brazo Fuerte, Take Root, Cabeza Dura, Throw Team-mate, Timmm-ber!",
        "primary": "S",
        "secondary": "AGP"
      }
    ]
  },
  {
    "name": "Goblins",
    "specialRules": "Underworld Challenge, Team Management, Badlands Brawl, Team Management, Bribery and Corruption, Tier 3, Team Management",
    "rerollCost": 50000,
    "tier": 2,
    "apothecary": "Sí",
    "image": "https://i.pinimg.com/736x/20/90/b4/2090b456fd49abe77abc7362c8181b0d.jpg",
    "ratings": {
      "fuerza": 63,
      "agilidad": 74,
      "velocidad": 65,
      "armadura": 83,
      "pase": 37
    },
    "roster": [
      {
        "qty": "0-1",
        "position": "Bomma",
        "cost": 45000,
        "stats": {
          "MV": 6,
          "FU": "2",
          "AG": "3+",
          "PS": "4+",
          "AR": "8+"
        },
        "skills": "Bombardier, Esquivar, Secret Weapon, Canijo",
        "primary": "AP",
        "secondary": "GS"
      },
      {
        "qty": "0-1",
        "position": "Doom Diver",
        "cost": 60000,
        "stats": {
          "MV": 6,
          "FU": "2",
          "AG": "3+",
          "PS": "6+",
          "AR": "8+"
        },
        "skills": "Buena Gente, Canijo, Swoop",
        "primary": "A",
        "secondary": "GS"
      },
      {
        "qty": "0-1",
        "position": "Fanatic",
        "cost": 70000,
        "stats": {
          "MV": 3,
          "FU": "7",
          "AG": "3+",
          "PS": "-",
          "AR": "8+"
        },
        "skills": "Ball & Chain, No Hands, Secret Weapon, Canijo",
        "primary": "S",
        "secondary": "AG"
      },
      {
        "qty": "0-1",
        "position": "Looney",
        "cost": 40000,
        "stats": {
          "MV": 6,
          "FU": "2",
          "AG": "3+",
          "PS": "-",
          "AR": "8+"
        },
        "skills": "Chainsaw, Secret Weapon, Canijo",
        "primary": "A",
        "secondary": "GS"
      },
      {
        "qty": "0-16",
        "position": "Goblins Línea",
        "cost": 40000,
        "stats": {
          "MV": 6,
          "FU": "2",
          "AG": "3+",
          "PS": "4+",
          "AR": "8+"
        },
        "skills": "Esquivar, Buena Gente, Canijo",
        "primary": "A",
        "secondary": "GPS"
      },
      {
        "qty": "0-2",
        "position": "Trained Troll",
        "cost": 115000,
        "stats": {
          "MV": 4,
          "FU": "5",
          "AG": "5+",
          "PS": "5+",
          "AR": "10+"
        },
        "skills": "Siempre Hambriento, Solitario (3+), Golpe Mortífero (+1), Projectile Vomit, Realmente Estúpido, Regeneración, Throw Team-mate",
        "primary": "S",
        "secondary": "AGP"
      },
      {
        "qty": "0-1",
        "position": "Pogoer",
        "cost": 75000,
        "stats": {
          "MV": 7,
          "FU": "2",
          "AG": "3+",
          "PS": "5+",
          "AR": "8+"
        },
        "skills": "Esquivar, Pogo Stick, Canijo",
        "primary": "A",
        "secondary": "GPS"
      }
    ]
  },
  {
    "name": "Halflings",
    "specialRules": "Old World Classic, Team Management, Halflings Thimble Cup, Team Management, Tier 3, Team Management",
    "rerollCost": 50000,
    "tier": 3,
    "apothecary": "Sí",
    "image": "https://i.pinimg.com/736x/b2/f0/5c/b2f05c2fcd61096bbf20a2b194bad517.jpg",
    "ratings": {
      "fuerza": 60,
      "agilidad": 70,
      "velocidad": 51,
      "armadura": 83,
      "pase": 55
    },
    "roster": [
      {
        "qty": "0-16",
        "position": "Halflings Hopeful Línea",
        "cost": 30000,
        "stats": {
          "MV": 5,
          "FU": "2",
          "AG": "3+",
          "PS": "4+",
          "AR": "7+"
        },
        "skills": "Esquivar, Buena Gente, Canijo",
        "primary": "A",
        "secondary": "GS"
      },
      {
        "qty": "0-2",
        "position": "Halflings Hefty",
        "cost": 50000,
        "stats": {
          "MV": 5,
          "FU": "2",
          "AG": "3+",
          "PS": "3+",
          "AR": "8+"
        },
        "skills": "Esquivar, Apartar, Canijo",
        "primary": "AP",
        "secondary": "GS"
      },
      {
        "qty": "0-2",
        "position": "Altern Forest Treeman",
        "cost": 120000,
        "stats": {
          "MV": 2,
          "FU": "6",
          "AG": "5+",
          "PS": "5+",
          "AR": "11+"
        },
        "skills": "Golpe Mortífero (+1), Mantenerse Firme, Brazo Fuerte, Take Root, Cabeza Dura, Throw Team-mate, Timmm-ber!",
        "primary": "S",
        "secondary": "AGP"
      },
      {
        "qty": "0-2",
        "position": "Halflings Receptor",
        "cost": 55000,
        "stats": {
          "MV": 5,
          "FU": "2",
          "AG": "3+",
          "PS": "5+",
          "AR": "7+"
        },
        "skills": "Atrapar, Esquivar, Buena Gente, Esprintar, Canijo",
        "primary": "A",
        "secondary": "GS"
      }
    ]
  },
  {
    "name": "High Elves",
    "specialRules": "Elven Kingdoms League, Team Management",
    "rerollCost": 50000,
    "tier": 2,
    "apothecary": "Sí",
    "image": "https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0",
    "ratings": {
      "fuerza": 60,
      "agilidad": 100,
      "velocidad": 81,
      "armadura": 88,
      "pase": 65
    },
    "roster": [
      {
        "qty": "0-2",
        "position": "Placador",
        "cost": 100000,
        "stats": {
          "MV": 7,
          "FU": "3",
          "AG": "2+",
          "PS": "4+",
          "AR": "9+"
        },
        "skills": "Placaje",
        "primary": "AG",
        "secondary": "PS"
      },
      {
        "qty": "0-16",
        "position": "Línea",
        "cost": 70000,
        "stats": {
          "MV": 6,
          "FU": "3",
          "AG": "2+",
          "PS": "4+",
          "AR": "9+"
        },
        "skills": "AG",
        "primary": "",
        "secondary": "PS"
      },
      {
        "qty": "0-4",
        "position": "Receptor",
        "cost": 90000,
        "stats": {
          "MV": 8,
          "FU": "3",
          "AG": "2+",
          "PS": "5+",
          "AR": "8+"
        },
        "skills": "Atrapar",
        "primary": "AG",
        "secondary": "S"
      },
      {
        "qty": "0-2",
        "position": "Lanzador",
        "cost": 100000,
        "stats": {
          "MV": 6,
          "FU": "3",
          "AG": "2+",
          "PS": "2+",
          "AR": "9+"
        },
        "skills": "Rompe nubes, Pasar, Safe Pasar",
        "primary": "AGP",
        "secondary": "S"
      }
    ]
  },
  {
    "name": "Humans",
    "specialRules": "Old World Classic, Team Management",
    "rerollCost": 50000,
    "tier": 3,
    "apothecary": "Sí",
    "image": "https://i.pinimg.com/736x/c2/63/6b/c2636b8d808236de876bc37716a39f49.jpg",
    "ratings": {
      "fuerza": 60,
      "agilidad": 77,
      "velocidad": 74,
      "armadura": 87,
      "pase": 60
    },
    "roster": [
      {
        "qty": "0-2",
        "position": "Lanzador",
        "cost": 80000,
        "stats": {
          "MV": 6,
          "FU": "3",
          "AG": "3+",
          "PS": "2+",
          "AR": "9+"
        },
        "skills": "Pasar, Manos Seguras",
        "primary": "GP",
        "secondary": "AS"
      },
      {
        "qty": "0-4",
        "position": "Receptor",
        "cost": 65000,
        "stats": {
          "MV": 8,
          "FU": "2",
          "AG": "3+",
          "PS": "5+",
          "AR": "8+"
        },
        "skills": "Atrapar, Esquivar",
        "primary": "AG",
        "secondary": "PS"
      },
      {
        "qty": "0-4",
        "position": "Placador",
        "cost": 85000,
        "stats": {
          "MV": 7,
          "FU": "3",
          "AG": "3+",
          "PS": "4+",
          "AR": "9+"
        },
        "skills": "Placaje",
        "primary": "GS",
        "secondary": "AP"
      },
      {
        "qty": "0-1",
        "position": "Ogros",
        "cost": 140000,
        "stats": {
          "MV": 5,
          "FU": "5",
          "AG": "4+",
          "PS": "5+",
          "AR": "10+"
        },
        "skills": "Bone Head, Solitario (4+), Golpe Mortífero (+1), Cabeza Dura, Throw Team-mate",
        "primary": "S",
        "secondary": "AG"
      },
      {
        "qty": "0-16",
        "position": "Humanos Línea",
        "cost": 50000,
        "stats": {
          "MV": 6,
          "FU": "3",
          "AG": "3+",
          "PS": "4+",
          "AR": "9+"
        },
        "skills": "G",
        "primary": "",
        "secondary": "AS"
      },
      {
        "qty": "0-3",
        "position": "Halflings Hopeful",
        "cost": 30000,
        "stats": {
          "MV": 5,
          "FU": "2",
          "AG": "3+",
          "PS": "4+",
          "AR": "7+"
        },
        "skills": "Esquivar, Buena Gente, Canijo",
        "primary": "A",
        "secondary": "GS"
      }
    ]
  },
  {
    "name": "Hombres Lagarto",
    "specialRules": "Lustrian Superleague, Team Management",
    "rerollCost": 50000,
    "tier": 1,
    "apothecary": "Sí",
    "image": "https://i.pinimg.com/736x/b4/c1/f5/b4c1f571ca61aaba9bc450b462b1783d.jpg",
    "ratings": {
      "fuerza": 65,
      "agilidad": 60,
      "velocidad": 81,
      "armadura": 90,
      "pase": 45
    },
    "roster": [
      {
        "qty": "0-1",
        "position": "Kroxigor",
        "cost": 140000,
        "stats": {
          "MV": 6,
          "FU": "5",
          "AG": "5+",
          "PS": "-",
          "AR": "10+"
        },
        "skills": "Bone Head, Solitario (4+), Golpe Mortífero (+1), Prehensile Tail, Cabeza Dura",
        "primary": "S",
        "secondary": "AG"
      },
      {
        "qty": "0-6",
        "position": "Saurus Bloqueador",
        "cost": 85000,
        "stats": {
          "MV": 6,
          "FU": "4",
          "AG": "5+",
          "PS": "6+",
          "AR": "10+"
        },
        "skills": "GS",
        "primary": "",
        "secondary": "A"
      },
      {
        "qty": "0-2",
        "position": "Chameleon Skink",
        "cost": 70000,
        "stats": {
          "MV": 7,
          "FU": "2",
          "AG": "3+",
          "PS": "3+",
          "AR": "8+"
        },
        "skills": "Esquivar, On the Ball, Marcaje, Canijo",
        "primary": "A",
        "secondary": "GPS"
      },
      {
        "qty": "0-12",
        "position": "Skink Corredor Línea",
        "cost": 60000,
        "stats": {
          "MV": 8,
          "FU": "2",
          "AG": "3+",
          "PS": "4+",
          "AR": "8+"
        },
        "skills": "Esquivar, Canijo",
        "primary": "A",
        "secondary": "GPS"
      }
    ]
  },
  {
    "name": "Horror Nigromántico",
    "specialRules": "Sylvanian Spotlight, Team Management, Masters of Undeath",
    "rerollCost": 50000,
    "tier": 1,
    "apothecary": "No",
    "image": "https://i.pinimg.com/736x/a9/d0/c9/a9d0c9c23d2a99e34d6e0dae24ab2e1d.jpg",
    "ratings": {
      "fuerza": 64,
      "agilidad": 72,
      "velocidad": 70,
      "armadura": 90,
      "pase": 36
    },
    "roster": [
      {
        "qty": "0-16",
        "position": "Zombie Línea",
        "cost": 40000,
        "stats": {
          "MV": 4,
          "FU": "3",
          "AG": "4+",
          "PS": "-",
          "AR": "9+"
        },
        "skills": "Regeneración",
        "primary": "G",
        "secondary": "AS"
      },
      {
        "qty": "0-2",
        "position": "Espectro",
        "cost": 95000,
        "stats": {
          "MV": 6,
          "FU": "3",
          "AG": "3+",
          "PS": "-",
          "AR": "9+"
        },
        "skills": "Placaje, Foul Appearance, No Hands, Regeneración, Echarse a un lado",
        "primary": "GS",
        "secondary": "A"
      },
      {
        "qty": "0-2",
        "position": "Ghoul Corredor",
        "cost": 75000,
        "stats": {
          "MV": 7,
          "FU": "3",
          "AG": "3+",
          "PS": "4+",
          "AR": "8+"
        },
        "skills": "Esquivar",
        "primary": "AG",
        "secondary": "PS"
      },
      {
        "qty": "0-2",
        "position": "Flesh Golem de Carne",
        "cost": 115000,
        "stats": {
          "MV": 4,
          "FU": "4",
          "AG": "4+",
          "PS": "-",
          "AR": "10+"
        },
        "skills": "Regeneración, Mantenerse Firme, Cabeza Dura",
        "primary": "GS",
        "secondary": "A"
      },
      {
        "qty": "0-2",
        "position": "Werewolf",
        "cost": 125000,
        "stats": {
          "MV": 8,
          "FU": "3",
          "AG": "3+",
          "PS": "4+",
          "AR": "9+"
        },
        "skills": "Claws, Furia, Regeneración",
        "primary": "AG",
        "secondary": "PS"
      }
    ]
  },
  {
    "name": "Nórdicos",
    "specialRules": "Favored of..., Old World Classic",
    "rerollCost": 50000,
    "tier": 1,
    "apothecary": "Sí",
    "image": "https://i.pinimg.com/736x/b2/f0/5c/b2f05c2fcd61096bbf20a2b194bad517.jpg",
    "ratings": {
      "fuerza": 63,
      "agilidad": 73,
      "velocidad": 70,
      "armadura": 80,
      "pase": 40
    },
    "roster": [
      {
        "qty": "0-16",
        "position": "Nórdicos Raider Línea",
        "cost": 50000,
        "stats": {
          "MV": 6,
          "FU": "3",
          "AG": "3+",
          "PS": "4+",
          "AR": "8+"
        },
        "skills": "Placaje, Drunkard, Cabeza Dura",
        "primary": "G",
        "secondary": "APS"
      },
      {
        "qty": "0-2",
        "position": "Ulfwerener",
        "cost": 105000,
        "stats": {
          "MV": 6,
          "FU": "4",
          "AG": "4+",
          "PS": "-",
          "AR": "9+"
        },
        "skills": "Furia",
        "primary": "GS",
        "secondary": "A"
      },
      {
        "qty": "0-1",
        "position": "Yhetee",
        "cost": 140000,
        "stats": {
          "MV": 5,
          "FU": "5",
          "AG": "4+",
          "PS": "-",
          "AR": "9+"
        },
        "skills": "Claws, Disturbing Presence, Furia, Solitario (4+), Unchannelled Fury",
        "primary": "S",
        "secondary": "AG"
      },
      {
        "qty": "0-2",
        "position": "Nórdicos Berserker",
        "cost": 90000,
        "stats": {
          "MV": 6,
          "FU": "3",
          "AG": "3+",
          "PS": "5+",
          "AR": "8+"
        },
        "skills": "Placaje, Furia, Saltar",
        "primary": "GS",
        "secondary": "AP"
      },
      {
        "qty": "0-2",
        "position": "Beer Boar",
        "cost": 20000,
        "stats": {
          "MV": 5,
          "FU": "1",
          "AG": "3+",
          "PS": "-",
          "AR": "6+"
        },
        "skills": "Esquivar, No Hands, Pick-me-up, Canijo, Diminuto",
        "primary": "-",
        "secondary": "A"
      },
      {
        "qty": "0-2",
        "position": "Valkyrie",
        "cost": 95000,
        "stats": {
          "MV": 7,
          "FU": "3",
          "AG": "3+",
          "PS": "3+",
          "AR": "8+"
        },
        "skills": "Atrapar, Agallas, Pasar, Balón Robado",
        "primary": "AGP",
        "secondary": "S"
      }
    ]
  },
  {
    "name": "Nurgle",
    "specialRules": "Favored of..., Team Management",
    "rerollCost": 50000,
    "tier": 2,
    "apothecary": "Sí",
    "image": "https://i.pinimg.com/736x/d3/c6/1f/d3c61fa5d46fc5872dd609282a34047d.jpg",
    "ratings": {
      "fuerza": 75,
      "agilidad": 65,
      "velocidad": 57,
      "armadura": 95,
      "pase": 30
    },
    "roster": [
      {
        "qty": "0-4",
        "position": "Bloater",
        "cost": 115000,
        "stats": {
          "MV": 4,
          "FU": "4",
          "AG": "4+",
          "PS": "6+",
          "AR": "10+"
        },
        "skills": "Disturbing Presence, Foul Appearance, Plague Ridden, Regeneración",
        "primary": "GMS",
        "secondary": "A"
      },
      {
        "qty": "0-1",
        "position": "Rotspawn",
        "cost": 140000,
        "stats": {
          "MV": 4,
          "FU": "5",
          "AG": "5+",
          "PS": "-",
          "AR": "10+"
        },
        "skills": "Disturbing Presence, Foul Appearance, Solitario (4+), Golpe Mortífero (+1), Plague Ridden, Realmente Estúpido, Regeneración, Tentacles",
        "primary": "S",
        "secondary": "AGM"
      },
      {
        "qty": "0-4",
        "position": "Pestigor",
        "cost": 75000,
        "stats": {
          "MV": 6,
          "FU": "3",
          "AG": "3+",
          "PS": "4+",
          "AR": "9+"
        },
        "skills": "Horns, Plague Ridden, Regeneración",
        "primary": "GMS",
        "secondary": "AP"
      },
      {
        "qty": "0-12",
        "position": "Rotter Línea",
        "cost": 35000,
        "stats": {
          "MV": 5,
          "FU": "3",
          "AG": "3+",
          "PS": "6+",
          "AR": "9+"
        },
        "skills": "Descomposición, Plague Ridden",
        "primary": "GM",
        "secondary": "AS"
      }
    ]
  },
  {
    "name": "Ogres",
    "specialRules": "Old World Classic, Team Management, Badlands Brawl, Team Management, Low Cost Linemen, Tier 3, Team Management",
    "rerollCost": 50000,
    "tier": 4,
    "apothecary": "Sí",
    "image": "https://i.pinimg.com/736x/9b/77/bd/9b77bd2d5538a9bfd2be58af2186de82.jpg",
    "ratings": {
      "fuerza": 73,
      "agilidad": 67,
      "velocidad": 60,
      "armadura": 87,
      "pase": 47
    },
    "roster": [
      {
        "qty": "0-1",
        "position": "Ogros Runt Punter",
        "cost": 145000,
        "stats": {
          "MV": 5,
          "FU": "5",
          "AG": "4+",
          "PS": "4+",
          "AR": "10+"
        },
        "skills": "Bone Head, Patada Team-Mate, Golpe Mortífero (+1), Cabeza Dura",
        "primary": "PS",
        "secondary": "AG"
      },
      {
        "qty": "0-16",
        "position": "Gnoblar Línea",
        "cost": 0,
        "stats": {
          "MV": 5,
          "FU": "1",
          "AG": "3+",
          "PS": "5+",
          "AR": "6+"
        },
        "skills": "Esquivar, Buena Gente, Echarse a un lado, Canijo, Diminuto",
        "primary": "A",
        "secondary": "G"
      },
      {
        "qty": "0-6",
        "position": "Ogros Bloqueador",
        "cost": 140000,
        "stats": {
          "MV": 5,
          "FU": "5",
          "AG": "4+",
          "PS": "5+",
          "AR": "10+"
        },
        "skills": "Bone Head, Golpe Mortífero (+1), Cabeza Dura, Throw Team-mate,",
        "primary": "S",
        "secondary": "AGP"
      }
    ]
  },
  {
    "name": "Alianza del Viejo Mundo",
    "specialRules": "Old World Classic, Team Management",
    "rerollCost": 50000,
    "tier": 1,
    "apothecary": "Sí",
    "image": "https://i.pinimg.com/736x/d3/a2/19/d3a219f32e89433aa05b5396f935d334.jpg",
    "ratings": {
      "fuerza": 56,
      "agilidad": 76,
      "velocidad": 69,
      "armadura": 89,
      "pase": 51
    },
    "roster": [
      {
        "qty": "0-1",
        "position": "Old World Humanos Placador",
        "cost": 90000,
        "stats": {
          "MV": 7,
          "FU": "3",
          "AG": "3+",
          "PS": "4+",
          "AR": "9+"
        },
        "skills": "Animosidad (all Enanos and Halflings team-mates), Placaje",
        "primary": "GS",
        "secondary": "A"
      },
      {
        "qty": "0-1",
        "position": "Old World Humanos Receptor",
        "cost": 65000,
        "stats": {
          "MV": 8,
          "FU": "2",
          "AG": "3+",
          "PS": "6+",
          "AR": "8+"
        },
        "skills": "Animosidad (all Enanos and Halflings team-mates), Atrapar, Esquivar",
        "primary": "AG",
        "secondary": "S"
      },
      {
        "qty": "0-12",
        "position": "Old World Humanos Línea",
        "cost": 50000,
        "stats": {
          "MV": 6,
          "FU": "3",
          "AG": "3+",
          "PS": "4+",
          "AR": "9+"
        },
        "skills": "-",
        "primary": "G",
        "secondary": "AS"
      },
      {
        "qty": "0-1",
        "position": "Old World Humanos Lanzador",
        "cost": 80000,
        "stats": {
          "MV": 6,
          "FU": "3",
          "AG": "3+",
          "PS": "3+",
          "AR": "9+"
        },
        "skills": "Animosidad (all Enanos and Halflings team-mates), Pasar, Manos Seguras",
        "primary": "GP",
        "secondary": "AS"
      },
      {
        "qty": "0-2",
        "position": "Old World Halflings Hopeful",
        "cost": 30000,
        "stats": {
          "MV": 5,
          "FU": "2",
          "AG": "3+",
          "PS": "4+",
          "AR": "7+"
        },
        "skills": "Animosidad (all Enanos and Humanos team-mates), Esquivar, Buena Gente, Canijo",
        "primary": "A",
        "secondary": "GS"
      },
      {
        "qty": "0-1",
        "position": "Old World Enanos Placador",
        "cost": 80000,
        "stats": {
          "MV": 5,
          "FU": "3",
          "AG": "3+",
          "PS": "4+",
          "AR": "10+"
        },
        "skills": "Placaje, Solitario (3+), Cabeza Dura",
        "primary": "GS",
        "secondary": "A"
      },
      {
        "qty": "0-2",
        "position": "Old World Enanos Bloqueador",
        "cost": 75000,
        "stats": {
          "MV": 4,
          "FU": "3",
          "AG": "4+",
          "PS": "5+",
          "AR": "10+"
        },
        "skills": "Arm Bar, Brawler, Solitario (3+), Cabeza Dura",
        "primary": "GS",
        "secondary": "A"
      },
      {
        "qty": "0-1",
        "position": "Old World Enanos Corredor",
        "cost": 85000,
        "stats": {
          "MV": 6,
          "FU": "3",
          "AG": "3+",
          "PS": "4+",
          "AR": "9+"
        },
        "skills": "Solitario (3+), Manos Seguras, Cabeza Dura",
        "primary": "GP",
        "secondary": "AS"
      },
      {
        "qty": "0-1",
        "position": "Old World Enanos Troll Slayer",
        "cost": 95000,
        "stats": {
          "MV": 5,
          "FU": "3",
          "AG": "4+",
          "PS": "-",
          "AR": "9+"
        },
        "skills": "Placaje, Agallas, Furia, Solitario (3+), Cabeza Dura",
        "primary": "GS",
        "secondary": "A"
      }
    ]
  },
  {
    "name": "Orcs",
    "specialRules": "Badlands Brawl, Team Management",
    "rerollCost": 50000,
    "tier": 1,
    "apothecary": "Sí",
    "image": "https://i.pinimg.com/736x/c4/15/c0/c415c0a781138589868249c294e95b4a.jpg",
    "ratings": {
      "fuerza": 67,
      "agilidad": 70,
      "velocidad": 62,
      "armadura": 95,
      "pase": 53
    },
    "roster": [
      {
        "qty": "0-16",
        "position": "Orcos Línea",
        "cost": 50000,
        "stats": {
          "MV": 5,
          "FU": "3",
          "AG": "3+",
          "PS": "4+",
          "AR": "10+"
        },
        "skills": "Animosidad (Orcos Linemen)",
        "primary": "G",
        "secondary": "AS"
      },
      {
        "qty": "0-1",
        "position": "Untrained Troll",
        "cost": 115000,
        "stats": {
          "MV": 4,
          "FU": "5",
          "AG": "5+",
          "PS": "5+",
          "AR": "10+"
        },
        "skills": "Siempre Hambriento, Solitario (4+), Golpe Mortífero (+1), Projectile Vomit, Realmente Estúpido, Regeneración, Throw Team-mate",
        "primary": "S",
        "secondary": "AGP"
      },
      {
        "qty": "0-4",
        "position": "Goblins",
        "cost": 40000,
        "stats": {
          "MV": 6,
          "FU": "2",
          "AG": "3+",
          "PS": "4+",
          "AR": "8+"
        },
        "skills": "Esquivar, Buena Gente, Canijo",
        "primary": "A",
        "secondary": "GS"
      },
      {
        "qty": "0-2",
        "position": "Lanzador",
        "cost": 65000,
        "stats": {
          "MV": 5,
          "FU": "3",
          "AG": "3+",
          "PS": "3+",
          "AR": "9+"
        },
        "skills": "Animosidad (all team-mates), Pasar, Sure Hnds",
        "primary": "GS",
        "secondary": "AP"
      },
      {
        "qty": "0-4",
        "position": "Fortachón Bloqueador",
        "cost": 90000,
        "stats": {
          "MV": 5,
          "FU": "4",
          "AG": "4+",
          "PS": "-",
          "AR": "10+"
        },
        "skills": "Animosidad (Fortachón Blockers)",
        "primary": "GS",
        "secondary": "A"
      },
      {
        "qty": "0-4",
        "position": "Placador",
        "cost": 80000,
        "stats": {
          "MV": 6,
          "FU": "3",
          "AG": "3+",
          "PS": "4+",
          "AR": "10+"
        },
        "skills": "Animosidad (all team-mates), Placaje",
        "primary": "GS",
        "secondary": "AP"
      }
    ]
  },
  {
    "name": "No Muertos",
    "specialRules": "Sylvanian Spotlight, Team Management, Masters of Undeath",
    "rerollCost": 50000,
    "tier": 1,
    "apothecary": "No",
    "image": "https://i.pinimg.com/736x/40/d3/3f/40d33f8e8aee4cc2a793df0b0f3b3619.jpg",
    "ratings": {
      "fuerza": 68,
      "agilidad": 64,
      "velocidad": 60,
      "armadura": 88,
      "pase": 32
    },
    "roster": [
      {
        "qty": "0-12",
        "position": "Esqueleto Línea",
        "cost": 40000,
        "stats": {
          "MV": 5,
          "FU": "3",
          "AG": "4+",
          "PS": "6+",
          "AR": "8+"
        },
        "skills": "Regeneración, Cabeza Dura",
        "primary": "G",
        "secondary": "AS"
      },
      {
        "qty": "0-4",
        "position": "Ghoul Corredor",
        "cost": 75000,
        "stats": {
          "MV": 7,
          "FU": "3",
          "AG": "3+",
          "PS": "4+",
          "AR": "8+"
        },
        "skills": "Esquivar",
        "primary": "AG",
        "secondary": "PS"
      },
      {
        "qty": "0-2",
        "position": "Momia",
        "cost": 125000,
        "stats": {
          "MV": 3,
          "FU": "5",
          "AG": "5+",
          "PS": "-",
          "AR": "10+"
        },
        "skills": "Golpe Mortífero (+1), Regeneración",
        "primary": "S",
        "secondary": "AG"
      },
      {
        "qty": "0-2",
        "position": "Túmulo Placador",
        "cost": 90000,
        "stats": {
          "MV": 6,
          "FU": "3",
          "AG": "3+",
          "PS": "5+",
          "AR": "9+"
        },
        "skills": "Placaje, Regeneración",
        "primary": "GS",
        "secondary": "AP"
      },
      {
        "qty": "0-12",
        "position": "Zombie Línea",
        "cost": 40000,
        "stats": {
          "MV": 4,
          "FU": "3",
          "AG": "4+",
          "PS": "-",
          "AR": "9+"
        },
        "skills": "Regeneración",
        "primary": "G",
        "secondary": "AS"
      }
    ]
  },
  {
    "name": "Skaven",
    "specialRules": "Underworld Challenge, Team Management",
    "rerollCost": 50000,
    "tier": 1,
    "apothecary": "Sí",
    "image": "https://i.pinimg.com/736x/88/35/53/88355314bb5c808eb7dc95fac928d1e4.jpg",
    "ratings": {
      "fuerza": 64,
      "agilidad": 80,
      "velocidad": 86,
      "armadura": 84,
      "pase": 56
    },
    "roster": [
      {
        "qty": "0-1",
        "position": "Rat Ogros",
        "cost": 150000,
        "stats": {
          "MV": 6,
          "FU": "5",
          "AG": "4+",
          "PS": "-",
          "AR": "9+"
        },
        "skills": "Animal Savagery, Furia, Solitario (4+), Golpe Mortífero (+1), Prehensile Tail",
        "primary": "S",
        "secondary": "AGM"
      },
      {
        "qty": "0-2",
        "position": "Placador",
        "cost": 90000,
        "stats": {
          "MV": 7,
          "FU": "3",
          "AG": "3+",
          "PS": "5+",
          "AR": "9+"
        },
        "skills": "Placaje",
        "primary": "GS",
        "secondary": "AMP"
      },
      {
        "qty": "0-4",
        "position": "Gutter Corredor",
        "cost": 85000,
        "stats": {
          "MV": 9,
          "FU": "2",
          "AG": "2+",
          "PS": "4+",
          "AR": "8+"
        },
        "skills": "Esquivar",
        "primary": "AG",
        "secondary": "MPS"
      },
      {
        "qty": "0-2",
        "position": "Lanzador",
        "cost": 85000,
        "stats": {
          "MV": 7,
          "FU": "3",
          "AG": "3+",
          "PS": "2+",
          "AR": "8+"
        },
        "skills": "Pasar, Manos Seguras",
        "primary": "GP",
        "secondary": "AMS"
      },
      {
        "qty": "0-16",
        "position": "Skaven Clanrat Línea",
        "cost": 50000,
        "stats": {
          "MV": 7,
          "FU": "3",
          "AG": "3+",
          "PS": "4+",
          "AR": "8+"
        },
        "skills": "G",
        "primary": "",
        "secondary": "AMS"
      }
    ]
  },
  {
    "name": "Slann (NAF)",
    "specialRules": "Lustrian Superleague, Team Management",
    "rerollCost": 50000,
    "tier": 2,
    "apothecary": "Sí",
    "image": "https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0",
    "ratings": {
      "fuerza": 65,
      "agilidad": 75,
      "velocidad": 78,
      "armadura": 90,
      "pase": 50
    },
    "roster": [
      {
        "qty": "0-16",
        "position": "Línea",
        "cost": 60000,
        "stats": {
          "MV": 6,
          "FU": "3",
          "AG": "3+",
          "PS": "4+",
          "AR": "9+"
        },
        "skills": "Pogo Stick, Piernas Muy Largas",
        "primary": "G",
        "secondary": "AS"
      },
      {
        "qty": "0-4",
        "position": "Receptor",
        "cost": 80000,
        "stats": {
          "MV": 7,
          "FU": "2",
          "AG": "2+",
          "PS": "4+",
          "AR": "8+"
        },
        "skills": "Diving Atrapar, Pogo Stick, Piernas Muy Largas",
        "primary": "GA",
        "secondary": "SP"
      },
      {
        "qty": "0-4",
        "position": "Placador",
        "cost": 110000,
        "stats": {
          "MV": 7,
          "FU": "3",
          "AG": "3+",
          "PS": "4+",
          "AR": "9+"
        },
        "skills": "Diving Placar, Saltar, Pogo Stick, Piernas Muy Largas",
        "primary": "GAS",
        "secondary": "P"
      },
      {
        "qty": "0-1",
        "position": "Kroxigor",
        "cost": 140000,
        "stats": {
          "MV": 6,
          "FU": "5",
          "AG": "5+",
          "PS": "-",
          "AR": "10+"
        },
        "skills": "Bone Head, Solitario (4+), Golpe Mortífero (+1), Prehensile Tail, Cabeza Dura",
        "primary": "S",
        "secondary": "GA"
      }
    ]
  },
  {
    "name": "Reyes de las Tumbas",
    "specialRules": "Sylvanian Spotlight, Team Management",
    "rerollCost": 50000,
    "tier": 1,
    "apothecary": "Sí",
    "image": "https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0",
    "ratings": {
      "fuerza": 70,
      "agilidad": 55,
      "velocidad": 63,
      "armadura": 88,
      "pase": 35
    },
    "roster": [
      {
        "qty": "0-2",
        "position": "Anointed Placador",
        "cost": 90000,
        "stats": {
          "MV": 6,
          "FU": "3",
          "AG": "4+",
          "PS": "6+",
          "AR": "9+"
        },
        "skills": "Placaje, Regeneración, Cabeza Dura",
        "primary": "GS",
        "secondary": "AP"
      },
      {
        "qty": "0-2",
        "position": "Anointed Lanzador",
        "cost": 70000,
        "stats": {
          "MV": 6,
          "FU": "3",
          "AG": "4+",
          "PS": "3+",
          "AR": "8+"
        },
        "skills": "Pasar, Regeneración, Manos Seguras, Cabeza Dura",
        "primary": "GP",
        "secondary": "A"
      },
      {
        "qty": "0-16",
        "position": "Esqueleto Línea",
        "cost": 40000,
        "stats": {
          "MV": 5,
          "FU": "3",
          "AG": "4+",
          "PS": "6+",
          "AR": "8+"
        },
        "skills": "Regeneración, Cabeza Dura",
        "primary": "G",
        "secondary": "AS"
      },
      {
        "qty": "0-4",
        "position": "Tomb Guardian",
        "cost": 100000,
        "stats": {
          "MV": 4,
          "FU": "5",
          "AG": "5+",
          "PS": "-",
          "AR": "10+"
        },
        "skills": "Descomposición, Regeneración",
        "primary": "S",
        "secondary": "AG"
      }
    ]
  },
  {
    "name": "Habitantes del Inframundo",
    "specialRules": "Underworld Challenge, Team Management, Bribery and Corruption",
    "rerollCost": 50000,
    "tier": 1,
    "apothecary": "Sí",
    "image": "https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0",
    "ratings": {
      "fuerza": 60,
      "agilidad": 75,
      "velocidad": 77,
      "armadura": 83,
      "pase": 53
    },
    "roster": [
      {
        "qty": "0-1",
        "position": "Underworld Troll",
        "cost": 115000,
        "stats": {
          "MV": 4,
          "FU": "5",
          "AG": "5+",
          "PS": "5+",
          "AR": "10+"
        },
        "skills": "Siempre Hambriento, Solitario (4+), Golpe Mortífero (+1), Projectile Vomit, Realmente Estúpido, Regeneración, Throw Team-mate",
        "primary": "MS",
        "secondary": "AGP"
      },
      {
        "qty": "0-12",
        "position": "Underworld Goblins Línea",
        "cost": 40000,
        "stats": {
          "MV": 6,
          "FU": "2",
          "AG": "3+",
          "PS": "4+",
          "AR": "8+"
        },
        "skills": "Esquivar, Buena Gente, Canijo",
        "primary": "AM",
        "secondary": "GS"
      },
      {
        "qty": "0-3",
        "position": "Skaven Clanrat",
        "cost": 50000,
        "stats": {
          "MV": 7,
          "FU": "3",
          "AG": "3+",
          "PS": "4+",
          "AR": "8+"
        },
        "skills": "Animosidad (Underworld Goblins Linemen)",
        "primary": "GM",
        "secondary": "AS"
      },
      {
        "qty": "0-1",
        "position": "Skaven Lanzador",
        "cost": 85000,
        "stats": {
          "MV": 7,
          "FU": "3",
          "AG": "3+",
          "PS": "2+",
          "AR": "8+"
        },
        "skills": "Animosidad (Underworld Goblins Linemen), Pasar, Manos Seguras",
        "primary": "GMP",
        "secondary": "AS"
      },
      {
        "qty": "0-1",
        "position": "Skaven Placador",
        "cost": 90000,
        "stats": {
          "MV": 7,
          "FU": "3",
          "AG": "3+",
          "PS": "5+",
          "AR": "9+"
        },
        "skills": "Animosidad (Underworld Goblins Linemen), Placaje",
        "primary": "GMS",
        "secondary": "AP"
      },
      {
        "qty": "0-1",
        "position": "Gutter Corredor",
        "cost": 85000,
        "stats": {
          "MV": 9,
          "FU": "2",
          "AG": "2+",
          "PS": "4+",
          "AR": "8+"
        },
        "skills": "Animosidad (Underworld Goblins Linemen), Esquivar",
        "primary": "AGM",
        "secondary": "PS"
      },
      {
        "qty": "0-1",
        "position": "Mutant Rat Ogros",
        "cost": 150000,
        "stats": {
          "MV": 6,
          "FU": "5",
          "AG": "4+",
          "PS": "-",
          "AR": "9+"
        },
        "skills": "Animal Savagery, Furia, Solitario (4+), Golpe Mortífero (+1), Prehensile Tail",
        "primary": "MS",
        "secondary": "AG"
      },
      {
        "qty": "0-6",
        "position": "Underworld Snotlings",
        "cost": 15000,
        "stats": {
          "MV": 5,
          "FU": "1",
          "AG": "3+",
          "PS": "5+",
          "AR": "6+"
        },
        "skills": "Esquivar, Buena Gente, Echarse a un lado, Canijo, Swarming, Diminuto",
        "primary": "AM",
        "secondary": "G"
      }
    ]
  },
  {
    "name": "Vampires",
    "specialRules": "Sylvanian Spotlight, Team Management, Vampiros Lord",
    "rerollCost": 50000,
    "tier": 1,
    "apothecary": "Sí",
    "image": "https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0",
    "ratings": {
      "fuerza": 76,
      "agilidad": 88,
      "velocidad": 74,
      "armadura": 88,
      "pase": 56
    },
    "roster": [
      {
        "qty": "0-16",
        "position": "Thrall Línea",
        "cost": 40000,
        "stats": {
          "MV": 6,
          "FU": "3",
          "AG": "3+",
          "PS": "4+",
          "AR": "8+"
        },
        "skills": "G",
        "primary": "",
        "secondary": "AS"
      },
      {
        "qty": "0-2",
        "position": "Vampiros Placador",
        "cost": 110000,
        "stats": {
          "MV": 6,
          "FU": "4",
          "AG": "2+",
          "PS": "5+",
          "AR": "9+"
        },
        "skills": "Bloodlust (3+), Hypnotic Gaze, Juggernaut, Regeneración",
        "primary": "AGS",
        "secondary": "110000"
      },
      {
        "qty": "0-2",
        "position": "Vampiros Corredor",
        "cost": 100000,
        "stats": {
          "MV": 8,
          "FU": "3",
          "AG": "2+",
          "PS": "4+",
          "AR": "8+"
        },
        "skills": "Bloodlust (2+), Hypnotic Gaze, Regeneración",
        "primary": "AG",
        "secondary": "PS"
      },
      {
        "qty": "0-2",
        "position": "Vampiros Lanzador",
        "cost": 110000,
        "stats": {
          "MV": 6,
          "FU": "4",
          "AG": "2+",
          "PS": "2+",
          "AR": "9+"
        },
        "skills": "Bloodlust (2+), Hypnotic Gaze, Pasar,  Regeneración",
        "primary": "AGP",
        "secondary": "S"
      },
      {
        "qty": "0-1",
        "position": "Vargheist",
        "cost": 150000,
        "stats": {
          "MV": 5,
          "FU": "5",
          "AG": "4+",
          "PS": "-",
          "AR": "10+"
        },
        "skills": "Bloodlust (3+), Claws, Furia, Solitario (4+), Regeneración",
        "primary": "S",
        "secondary": "AG"
      }
    ]
  },
  {
    "name": "Wood Elves",
    "specialRules": "Elven Kingdoms League, Team Management",
    "rerollCost": 50000,
    "tier": 2,
    "apothecary": "Sí",
    "image": "https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0",
    "ratings": {
      "fuerza": 68,
      "agilidad": 88,
      "velocidad": 77,
      "armadura": 86,
      "pase": 64
    },
    "roster": [
      {
        "qty": "0-4",
        "position": "Receptor",
        "cost": 90000,
        "stats": {
          "MV": 8,
          "FU": "2",
          "AG": "2+",
          "PS": "4+",
          "AR": "8+"
        },
        "skills": "Atrapar, Esquivar",
        "primary": "AG",
        "secondary": "PS"
      },
      {
        "qty": "0-12",
        "position": "Elfos Silvanos Línea",
        "cost": 70000,
        "stats": {
          "MV": 7,
          "FU": "3",
          "AG": "2+",
          "PS": "4+",
          "AR": "8+"
        },
        "skills": "AG",
        "primary": "",
        "secondary": "S"
      },
      {
        "qty": "0-2",
        "position": "Lanzador",
        "cost": 95000,
        "stats": {
          "MV": 7,
          "FU": "3",
          "AG": "2+",
          "PS": "2+",
          "AR": "8+"
        },
        "skills": "Pasar",
        "primary": "AGP",
        "secondary": "S"
      },
      {
        "qty": "0-2",
        "position": "Wardancer",
        "cost": 125000,
        "stats": {
          "MV": 8,
          "FU": "3",
          "AG": "2+",
          "PS": "4+",
          "AR": "8+"
        },
        "skills": "Placaje, Esquivar, Salto",
        "primary": "AG",
        "secondary": "PS"
      },
      {
        "qty": "0-1",
        "position": "Loren Forest Treeman",
        "cost": 120000,
        "stats": {
          "MV": 2,
          "FU": "6",
          "AG": "5+",
          "PS": "5+",
          "AR": "11+"
        },
        "skills": "Solitario (4+), Golpe Mortífero (+1), Mantenerse Firme, Brazo Fuerte, Take Root, Cabeza Dura, Throw Team-mate",
        "primary": "S",
        "secondary": "AG"
      }
    ]
  }
];
