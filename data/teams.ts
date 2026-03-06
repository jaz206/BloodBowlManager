import type { Team } from "../types";

export const teamsData: Team[] = [
  {
    "name": "Equipos Amazons",
    "specialRules": "Lustrian Superleague, Team Management",
    "rerollCost": 50000,
    "tier": 1,
    "apothecary": "Sí",
    "image": "https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0",
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
        "position": "Eagle Warrior Linewoman",
        "cost": 50000,
        "stats": {
          "MV": 6,
          "FU": "3",
          "AG": "3+",
          "PS": "4+",
          "AR": "8+"
        },
        "skills": "Dodge",
        "primary": "G",
        "secondary": "AS"
      },
      {
        "qty": "0-2",
        "position": "Python Warrior Thrower",
        "cost": 80000,
        "stats": {
          "MV": 6,
          "FU": "3",
          "AG": "3+",
          "PS": "3+",
          "AR": "8+"
        },
        "skills": "Dodge, On the Ball, Pass, Safe Pass",
        "primary": "GP",
        "secondary": "AS"
      },
      {
        "qty": "0-16",
        "position": "Jaguar Warrior Blocker",
        "cost": 110000,
        "stats": {
          "MV": 6,
          "FU": "4",
          "AG": "3+",
          "PS": "5+",
          "AR": "9+"
        },
        "skills": "Defensive, Dodge",
        "primary": "GS",
        "secondary": "A"
      },
      {
        "qty": "0-2",
        "position": "Piranha Warrior Blitzer",
        "cost": 90000,
        "stats": {
          "MV": 7,
          "FU": "3",
          "AG": "3+",
          "PS": "5+",
          "AR": "8+"
        },
        "skills": "Dodge, Hit and Run, Jump Up",
        "primary": "AG",
        "secondary": "S"
      }
    ]
  },
  {
    "name": "Equipos Black Orcs",
    "specialRules": "Badlands Brawl, Team Management, Bribery and Corruption",
    "rerollCost": 50000,
    "tier": 1,
    "apothecary": "Sí",
    "image": "https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0",
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
        "position": "Goblin Bruiser Lineman",
        "cost": 45000,
        "stats": {
          "MV": 6,
          "FU": "2",
          "AG": "3+",
          "PS": "4+",
          "AR": "8+"
        },
        "skills": "Dodge, Right Stuff, Stunty, Thick Skull",
        "primary": "A",
        "secondary": "GPS"
      },
      {
        "qty": "0-6",
        "position": "Black Orc",
        "cost": 90000,
        "stats": {
          "MV": 4,
          "FU": "4",
          "AG": "4+",
          "PS": "5+",
          "AR": "10+"
        },
        "skills": "Brawler, Grab",
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
        "skills": "Always Hungry, Loner (3+), Mighty Blow (+1), Projectile Vomit, Really Stupid, Regeneration, Throw Team-mate",
        "primary": "S",
        "secondary": "AGP"
      }
    ]
  },
  {
    "name": "Equipos Chaos Chosen",
    "specialRules": "Favored of..., Team Management",
    "rerollCost": 50000,
    "tier": 2,
    "apothecary": "Sí",
    "image": "https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0",
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
        "position": "Chosen Blocker",
        "cost": 100000,
        "stats": {
          "MV": 5,
          "FU": "4",
          "AG": "3+",
          "PS": "5+",
          "AR": "10+"
        },
        "skills": "<characteristic name=\"Primary\" typeId=\"fda4-6261-f0d2-ba0d\">GMS",
        "primary": "",
        "secondary": "A"
      }
    ]
  },
  {
    "name": "Equipos Chaos Dwarfs",
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
        "position": "Hobgoblin Lineman",
        "cost": 40000,
        "stats": {
          "MV": 6,
          "FU": "3",
          "AG": "3+",
          "PS": "4+",
          "AR": "8+"
        },
        "skills": "<characteristic name=\"Primary\" typeId=\"fda4-6261-f0d2-ba0d\">G",
        "primary": "",
        "secondary": "AS"
      },
      {
        "qty": "0-4",
        "position": "Chaos Dwarf Blocker",
        "cost": 70000,
        "stats": {
          "MV": 4,
          "FU": "3",
          "AG": "4+",
          "PS": "6+",
          "AR": "10+"
        },
        "skills": "Block, Iron Hard Skin, Thick Skull",
        "primary": "GS",
        "secondary": "AM"
      },
      {
        "qty": "0-2",
        "position": "Bull Centaur Blitzer",
        "cost": 130000,
        "stats": {
          "MV": 6,
          "FU": "4",
          "AG": "4+",
          "PS": "6+",
          "AR": "10+"
        },
        "skills": "Sprint, Sure Feet, Thick Skull",
        "primary": "GS",
        "secondary": "AM"
      },
      {
        "qty": "0-1",
        "position": "Renegade Minotaur",
        "cost": 150000,
        "stats": {
          "MV": 5,
          "FU": "5",
          "AG": "4+",
          "PS": "-",
          "AR": "9+"
        },
        "skills": "Frenzy, Horns, Loner (4+), Mighty Blow (+1), Thick Skull, Unchannelled Fury",
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
        "skills": "Shadowing, Stab",
        "primary": "G",
        "secondary": "AS"
      }
    ]
  },
  {
    "name": "Equipos Chaos Renegades",
    "specialRules": "Favored of..., Team Management",
    "rerollCost": 50000,
    "tier": 3,
    "apothecary": "Sí",
    "image": "https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0",
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
        "skills": "Animosity (all team-mates)",
        "primary": "GM",
        "secondary": "AS"
      },
      {
        "qty": "0-1",
        "position": "Renegade Dark Elf",
        "cost": 75000,
        "stats": {
          "MV": 6,
          "FU": "3",
          "AG": "2+",
          "PS": "3+",
          "AR": "9+"
        },
        "skills": "Animosity (all team-mates)",
        "primary": "AGM",
        "secondary": "PS"
      },
      {
        "qty": "0-1",
        "position": "Renegade Ogre",
        "cost": 140000,
        "stats": {
          "MV": 5,
          "FU": "5",
          "AG": "4+",
          "PS": "5+",
          "AR": "10+"
        },
        "skills": "Bone Head, Loner (4+), Mighty Blow (+1), Thick Skull, Throw Team-mate",
        "primary": "S",
        "secondary": "AGM"
      },
      {
        "qty": "0-1",
        "position": "Renegade Orc",
        "cost": 50000,
        "stats": {
          "MV": 5,
          "FU": "3",
          "AG": "3+",
          "PS": "5+",
          "AR": "10+"
        },
        "skills": "Animosity (all team-mates)",
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
        "skills": "Always Hungry, Loner (4+), Mighty Blow (+1), Projectile Vomit, Really Stupid, Regeneration, Throw Team-mate",
        "primary": "S",
        "secondary": "AGM"
      },
      {
        "qty": "0-1",
        "position": "Renegade Goblin",
        "cost": 40000,
        "stats": {
          "MV": 6,
          "FU": "2",
          "AG": "3+",
          "PS": "4+",
          "AR": "8+"
        },
        "skills": "Animosity (all team-mates), Dodge, Right Stuff, Stunty",
        "primary": "AM",
        "secondary": "GP"
      },
      {
        "qty": "0-1",
        "position": "Renegade Minotaur",
        "cost": 150000,
        "stats": {
          "MV": 5,
          "FU": "5",
          "AG": "4+",
          "PS": "-",
          "AR": "9+"
        },
        "skills": "Loner (4+), Frenzy, Horns, Mighty Blow (+1), Thick Skull, Unchannelled Fury",
        "primary": "S",
        "secondary": "AGM"
      },
      {
        "qty": "0-12",
        "position": "Renegade Human Lineman",
        "cost": 50000,
        "stats": {
          "MV": 6,
          "FU": "3",
          "AG": "3+",
          "PS": "4+",
          "AR": "9+"
        },
        "skills": "<characteristic name=\"Primary\" typeId=\"fda4-6261-f0d2-ba0d\">GM",
        "primary": "",
        "secondary": "AS"
      },
      {
        "qty": "0-1",
        "position": "Renegade Human Thrower",
        "cost": 75000,
        "stats": {
          "MV": 6,
          "FU": "3",
          "AG": "3+",
          "PS": "3+",
          "AR": "9+"
        },
        "skills": "Animosity (all team-mates), Pass, Safe Pair of Hands",
        "primary": "GMP",
        "secondary": "AS"
      },
      {
        "qty": "0-1",
        "position": "Renegade Rat Ogre",
        "cost": 150000,
        "stats": {
          "MV": 6,
          "FU": "5",
          "AG": "4+",
          "PS": "-",
          "AR": "9+"
        },
        "skills": "Animal Savagery, Frenzy, Loner (4+), Mighty Blow (+1), Prehensile Tail",
        "primary": "S",
        "secondary": "AGM"
      }
    ]
  },
  {
    "name": "Equipos Dark Elves",
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
        "position": "Runner",
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
        "skills": "Shadowing, Stab",
        "primary": "AG",
        "secondary": "PS"
      },
      {
        "qty": "0-4",
        "position": "Blitzer",
        "cost": 100000,
        "stats": {
          "MV": 7,
          "FU": "3",
          "AG": "2+",
          "PS": "4+",
          "AR": "9+"
        },
        "skills": "Block",
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
        "skills": "Dodge, Frenzy, Jump Up",
        "primary": "AG",
        "secondary": "PS"
      },
      {
        "qty": "0-12",
        "position": "Dark Elf Lineman",
        "cost": 70000,
        "stats": {
          "MV": 6,
          "FU": "3",
          "AG": "2+",
          "PS": "4+",
          "AR": "9+"
        },
        "skills": "<characteristic name=\"Primary\" typeId=\"fda4-6261-f0d2-ba0d\">AG",
        "primary": "",
        "secondary": "S"
      }
    ]
  },
  {
    "name": "Equipos Dwarves",
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
        "position": "Dwarf Blocker Lineman",
        "cost": 70000,
        "stats": {
          "MV": 4,
          "FU": "3",
          "AG": "4+",
          "PS": "5+",
          "AR": "10+"
        },
        "skills": "Block, Tackle, Thick Skull",
        "primary": "GS",
        "secondary": "A"
      },
      {
        "qty": "0-2",
        "position": "Runner",
        "cost": 85000,
        "stats": {
          "MV": 6,
          "FU": "3",
          "AG": "3+",
          "PS": "4+",
          "AR": "9+"
        },
        "skills": "Sure Hands, Thick Skull",
        "primary": "GP",
        "secondary": "AS"
      },
      {
        "qty": "0-2",
        "position": "Blitzer",
        "cost": 80000,
        "stats": {
          "MV": 5,
          "FU": "3",
          "AG": "3+",
          "PS": "4+",
          "AR": "10+"
        },
        "skills": "Block, Thick Skull",
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
        "skills": "Block, Dauntless, Frenzy, Thick Skull",
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
        "skills": "Break Tackle, Dirty Player (+2), Juggernaut, Loner (5+), Mighty Blow (+1), No Hands, Secret Weapon, Stand Firm",
        "primary": "S",
        "secondary": "AG"
      }
    ]
  },
  {
    "name": "Equipos Elven Union",
    "specialRules": "Elven Kingdoms League, Team Management",
    "rerollCost": 50000,
    "tier": 2,
    "apothecary": "Sí",
    "image": "https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0",
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
        "position": "Catcher",
        "cost": 100000,
        "stats": {
          "MV": 8,
          "FU": "3",
          "AG": "2+",
          "PS": "4+",
          "AR": "8+"
        },
        "skills": "Catch, Nerves of Steel",
        "primary": "AG",
        "secondary": "S"
      },
      {
        "qty": "0-2",
        "position": "Blitzer",
        "cost": 115000,
        "stats": {
          "MV": 7,
          "FU": "3",
          "AG": "2+",
          "PS": "3+",
          "AR": "9+"
        },
        "skills": "Block, Sidestep",
        "primary": "AG",
        "secondary": "PS"
      },
      {
        "qty": "0-12",
        "position": "Lineman",
        "cost": 60000,
        "stats": {
          "MV": 6,
          "FU": "3",
          "AG": "2+",
          "PS": "4+",
          "AR": "8+"
        },
        "skills": "<characteristic name=\"Primary\" typeId=\"fda4-6261-f0d2-ba0d\">AG",
        "primary": "",
        "secondary": "S"
      },
      {
        "qty": "0-2",
        "position": "Thrower",
        "cost": 75000,
        "stats": {
          "MV": 6,
          "FU": "3",
          "AG": "2+",
          "PS": "2+",
          "AR": "8+"
        },
        "skills": "Pass",
        "primary": "AGP",
        "secondary": "S"
      }
    ]
  },
  {
    "name": "Equipos Gnomes",
    "specialRules": "Halfling Thimble Cup, Team Management, Tier 3, Team Management",
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
        "position": "Gnome Lineman",
        "cost": 40000,
        "stats": {
          "MV": 5,
          "FU": "2",
          "AG": "3+",
          "PS": "4+",
          "AR": "7+"
        },
        "skills": "Jump Up, Right Stuff, Stunty, Wrestle",
        "primary": "A",
        "secondary": "GS"
      },
      {
        "qty": "0-2",
        "position": "Gnome Beastmaster",
        "cost": 55000,
        "stats": {
          "MV": 5,
          "FU": "2",
          "AG": "3+",
          "PS": "4+",
          "AR": "8+"
        },
        "skills": "Guard, Jump Up, Stunty, Wrestle",
        "primary": "A",
        "secondary": "GS"
      },
      {
        "qty": "0-2",
        "position": "Gnome Illusionist",
        "cost": 50000,
        "stats": {
          "MV": 5,
          "FU": "2",
          "AG": "3+",
          "PS": "3+",
          "AR": "7+"
        },
        "skills": "Jump Up, Stunty, Trickster, Wrestle",
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
        "skills": "Dodge, My Ball, Sidestep, Stunty",
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
        "skills": "Mighty Blow (+1), Stand Firm, Strong Arm, Take Root, Thick Skull, Throw Team-mate, Timmm-ber!",
        "primary": "S",
        "secondary": "AGP"
      }
    ]
  },
  {
    "name": "Equipos Goblins",
    "specialRules": "Underworld Challenge, Team Management, Badlands Brawl, Team Management, Bribery and Corruption, Tier 3, Team Management",
    "rerollCost": 50000,
    "tier": 2,
    "apothecary": "Sí",
    "image": "https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0",
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
        "skills": "Bombardier, Dodge, Secret Weapon, Stunty",
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
        "skills": "Right Stuff, Stunty, Swoop",
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
        "skills": "Ball & Chain, No Hands, Secret Weapon, Stunty",
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
        "skills": "Chainsaw, Secret Weapon, Stunty",
        "primary": "A",
        "secondary": "GS"
      },
      {
        "qty": "0-16",
        "position": "Goblin Lineman",
        "cost": 40000,
        "stats": {
          "MV": 6,
          "FU": "2",
          "AG": "3+",
          "PS": "4+",
          "AR": "8+"
        },
        "skills": "Dodge, Right Stuff, Stunty",
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
        "skills": "Always Hungry, Loner (3+), Mighty Blow (+1), Projectile Vomit, Really Stupid, Regeneration, Throw Team-mate",
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
        "skills": "Dodge, Pogo Stick, Stunty",
        "primary": "A",
        "secondary": "GPS"
      }
    ]
  },
  {
    "name": "Equipos Halflings",
    "specialRules": "Old World Classic, Team Management, Halfling Thimble Cup, Team Management, Tier 3, Team Management",
    "rerollCost": 50000,
    "tier": 3,
    "apothecary": "Sí",
    "image": "https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0",
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
        "position": "Halfling Hopeful Lineman",
        "cost": 30000,
        "stats": {
          "MV": 5,
          "FU": "2",
          "AG": "3+",
          "PS": "4+",
          "AR": "7+"
        },
        "skills": "Dodge, Right Stuff, Stunty",
        "primary": "A",
        "secondary": "GS"
      },
      {
        "qty": "0-2",
        "position": "Halfling Hefty",
        "cost": 50000,
        "stats": {
          "MV": 5,
          "FU": "2",
          "AG": "3+",
          "PS": "3+",
          "AR": "8+"
        },
        "skills": "Dodge, Fend, Stunty",
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
        "skills": "Mighty Blow (+1), Stand Firm, Strong Arm, Take Root, Thick Skull, Throw Team-mate, Timmm-ber!",
        "primary": "S",
        "secondary": "AGP"
      },
      {
        "qty": "0-2",
        "position": "Halfling Catcher",
        "cost": 55000,
        "stats": {
          "MV": 5,
          "FU": "2",
          "AG": "3+",
          "PS": "5+",
          "AR": "7+"
        },
        "skills": "Catch, Dodge, Right Stuff, Sprint, Stunty",
        "primary": "A",
        "secondary": "GS"
      }
    ]
  },
  {
    "name": "Equipos High Elves",
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
        "position": "Blitzer",
        "cost": 100000,
        "stats": {
          "MV": 7,
          "FU": "3",
          "AG": "2+",
          "PS": "4+",
          "AR": "9+"
        },
        "skills": "Block",
        "primary": "AG",
        "secondary": "PS"
      },
      {
        "qty": "0-16",
        "position": "Lineman",
        "cost": 70000,
        "stats": {
          "MV": 6,
          "FU": "3",
          "AG": "2+",
          "PS": "4+",
          "AR": "9+"
        },
        "skills": "<characteristic name=\"Primary\" typeId=\"fda4-6261-f0d2-ba0d\">AG",
        "primary": "",
        "secondary": "PS"
      },
      {
        "qty": "0-4",
        "position": "Catcher",
        "cost": 90000,
        "stats": {
          "MV": 8,
          "FU": "3",
          "AG": "2+",
          "PS": "5+",
          "AR": "8+"
        },
        "skills": "Catch",
        "primary": "AG",
        "secondary": "S"
      },
      {
        "qty": "0-2",
        "position": "Thrower",
        "cost": 100000,
        "stats": {
          "MV": 6,
          "FU": "3",
          "AG": "2+",
          "PS": "2+",
          "AR": "9+"
        },
        "skills": "Cloud Burster, Pass, Safe Pass",
        "primary": "AGP",
        "secondary": "S"
      }
    ]
  },
  {
    "name": "Equipos Humans",
    "specialRules": "Old World Classic, Team Management",
    "rerollCost": 50000,
    "tier": 3,
    "apothecary": "Sí",
    "image": "https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0",
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
        "position": "Thrower",
        "cost": 80000,
        "stats": {
          "MV": 6,
          "FU": "3",
          "AG": "3+",
          "PS": "2+",
          "AR": "9+"
        },
        "skills": "Pass, Sure Hands",
        "primary": "GP",
        "secondary": "AS"
      },
      {
        "qty": "0-4",
        "position": "Catcher",
        "cost": 65000,
        "stats": {
          "MV": 8,
          "FU": "2",
          "AG": "3+",
          "PS": "5+",
          "AR": "8+"
        },
        "skills": "Catch, Dodge",
        "primary": "AG",
        "secondary": "PS"
      },
      {
        "qty": "0-4",
        "position": "Blitzer",
        "cost": 85000,
        "stats": {
          "MV": 7,
          "FU": "3",
          "AG": "3+",
          "PS": "4+",
          "AR": "9+"
        },
        "skills": "Block",
        "primary": "GS",
        "secondary": "AP"
      },
      {
        "qty": "0-1",
        "position": "Ogre",
        "cost": 140000,
        "stats": {
          "MV": 5,
          "FU": "5",
          "AG": "4+",
          "PS": "5+",
          "AR": "10+"
        },
        "skills": "Bone Head, Loner (4+), Mighty Blow (+1), Thick Skull, Throw Team-mate",
        "primary": "S",
        "secondary": "AG"
      },
      {
        "qty": "0-16",
        "position": "Human Lineman",
        "cost": 50000,
        "stats": {
          "MV": 6,
          "FU": "3",
          "AG": "3+",
          "PS": "4+",
          "AR": "9+"
        },
        "skills": "<characteristic name=\"Primary\" typeId=\"fda4-6261-f0d2-ba0d\">G",
        "primary": "",
        "secondary": "AS"
      },
      {
        "qty": "0-3",
        "position": "Halfling Hopeful",
        "cost": 30000,
        "stats": {
          "MV": 5,
          "FU": "2",
          "AG": "3+",
          "PS": "4+",
          "AR": "7+"
        },
        "skills": "Dodge, Right Stuff, Stunty",
        "primary": "A",
        "secondary": "GS"
      }
    ]
  },
  {
    "name": "Equipos Lizardmen",
    "specialRules": "Lustrian Superleague, Team Management",
    "rerollCost": 50000,
    "tier": 1,
    "apothecary": "Sí",
    "image": "https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0",
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
        "skills": "Bone Head, Loner (4+), Mighty Blow (+1), Prehensile Tail, Thick Skull",
        "primary": "S",
        "secondary": "AG"
      },
      {
        "qty": "0-6",
        "position": "Saurus Blocker",
        "cost": 85000,
        "stats": {
          "MV": 6,
          "FU": "4",
          "AG": "5+",
          "PS": "6+",
          "AR": "10+"
        },
        "skills": "<characteristic name=\"Primary\" typeId=\"fda4-6261-f0d2-ba0d\">GS",
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
        "skills": "Dodge, On the Ball, Shadowing, Stunty",
        "primary": "A",
        "secondary": "GPS"
      },
      {
        "qty": "0-12",
        "position": "Skink Runner Lineman",
        "cost": 60000,
        "stats": {
          "MV": 8,
          "FU": "2",
          "AG": "3+",
          "PS": "4+",
          "AR": "8+"
        },
        "skills": "Dodge, Stunty",
        "primary": "A",
        "secondary": "GPS"
      }
    ]
  },
  {
    "name": "Equipos Necromantic Horror",
    "specialRules": "Sylvanian Spotlight, Team Management, Masters of Undeath",
    "rerollCost": 50000,
    "tier": 1,
    "apothecary": "No",
    "image": "https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0",
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
        "position": "Zombie Lineman",
        "cost": 40000,
        "stats": {
          "MV": 4,
          "FU": "3",
          "AG": "4+",
          "PS": "-",
          "AR": "9+"
        },
        "skills": "Regeneration",
        "primary": "G",
        "secondary": "AS"
      },
      {
        "qty": "0-2",
        "position": "Wraith",
        "cost": 95000,
        "stats": {
          "MV": 6,
          "FU": "3",
          "AG": "3+",
          "PS": "-",
          "AR": "9+"
        },
        "skills": "Block, Foul Appearance, No Hands, Regeneration, Sidestep",
        "primary": "GS",
        "secondary": "A"
      },
      {
        "qty": "0-2",
        "position": "Ghoul Runner",
        "cost": 75000,
        "stats": {
          "MV": 7,
          "FU": "3",
          "AG": "3+",
          "PS": "4+",
          "AR": "8+"
        },
        "skills": "Dodge",
        "primary": "AG",
        "secondary": "PS"
      },
      {
        "qty": "0-2",
        "position": "Flesh Golem",
        "cost": 115000,
        "stats": {
          "MV": 4,
          "FU": "4",
          "AG": "4+",
          "PS": "-",
          "AR": "10+"
        },
        "skills": "Regeneration, Stand Firm, Thick Skull",
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
        "skills": "Claws, Frenzy, Regeneration",
        "primary": "AG",
        "secondary": "PS"
      }
    ]
  },
  {
    "name": "Equipos Norse",
    "specialRules": "Favored of..., Old World Classic",
    "rerollCost": 50000,
    "tier": 1,
    "apothecary": "Sí",
    "image": "https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0",
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
        "position": "Norse Raider Lineman",
        "cost": 50000,
        "stats": {
          "MV": 6,
          "FU": "3",
          "AG": "3+",
          "PS": "4+",
          "AR": "8+"
        },
        "skills": "Block, Drunkard, Thick Skull",
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
        "skills": "Frenzy",
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
        "skills": "Claws, Disturbing Presence, Frenzy, Loner (4+), Unchannelled Fury",
        "primary": "S",
        "secondary": "AG"
      },
      {
        "qty": "0-2",
        "position": "Norse Berserker",
        "cost": 90000,
        "stats": {
          "MV": 6,
          "FU": "3",
          "AG": "3+",
          "PS": "5+",
          "AR": "8+"
        },
        "skills": "Block, Frenzy, Jump Up",
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
        "skills": "Dodge, No Hands, Pick-me-up, Stunty, Titchy",
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
        "skills": "Catch, Dauntless, Pass, Strip Ball",
        "primary": "AGP",
        "secondary": "S"
      }
    ]
  },
  {
    "name": "Equipos Nurgle",
    "specialRules": "Favored of..., Team Management",
    "rerollCost": 50000,
    "tier": 2,
    "apothecary": "Sí",
    "image": "https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0",
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
        "skills": "Disturbing Presence, Foul Appearance, Plague Ridden, Regeneration",
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
        "skills": "Disturbing Presence, Foul Appearance, Loner (4+), Mighty Blow (+1), Plague Ridden, Really Stupid, Regeneration, Tentacles",
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
        "skills": "Horns, Plague Ridden, Regeneration",
        "primary": "GMS",
        "secondary": "AP"
      },
      {
        "qty": "0-12",
        "position": "Rotter Lineman",
        "cost": 35000,
        "stats": {
          "MV": 5,
          "FU": "3",
          "AG": "3+",
          "PS": "6+",
          "AR": "9+"
        },
        "skills": "Decay, Plague Ridden",
        "primary": "GM",
        "secondary": "AS"
      }
    ]
  },
  {
    "name": "Equipos Ogres",
    "specialRules": "Old World Classic, Team Management, Badlands Brawl, Team Management, Low Cost Linemen, Tier 3, Team Management",
    "rerollCost": 50000,
    "tier": 4,
    "apothecary": "Sí",
    "image": "https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0",
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
        "position": "Ogre Runt Punter",
        "cost": 145000,
        "stats": {
          "MV": 5,
          "FU": "5",
          "AG": "4+",
          "PS": "4+",
          "AR": "10+"
        },
        "skills": "Bone Head, Kick Team-Mate, Mighty Blow (+1), Thick Skull",
        "primary": "PS",
        "secondary": "AG"
      },
      {
        "qty": "0-16",
        "position": "Gnoblar Lineman",
        "cost": 0,
        "stats": {
          "MV": 5,
          "FU": "1",
          "AG": "3+",
          "PS": "5+",
          "AR": "6+"
        },
        "skills": "Dodge, Right Stuff, Sidestep, Stunty, Titchy",
        "primary": "A",
        "secondary": "G"
      },
      {
        "qty": "0-6",
        "position": "Ogre Blocker",
        "cost": 140000,
        "stats": {
          "MV": 5,
          "FU": "5",
          "AG": "4+",
          "PS": "5+",
          "AR": "10+"
        },
        "skills": "Bone Head, Mighty Blow (+1), Thick Skull, Throw Team-mate,",
        "primary": "S",
        "secondary": "AGP"
      }
    ]
  },
  {
    "name": "Equipos Old World Alliance",
    "specialRules": "Old World Classic, Team Management",
    "rerollCost": 50000,
    "tier": 1,
    "apothecary": "Sí",
    "image": "https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0",
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
        "position": "Old World Human Blitzer",
        "cost": 90000,
        "stats": {
          "MV": 7,
          "FU": "3",
          "AG": "3+",
          "PS": "4+",
          "AR": "9+"
        },
        "skills": "Animosity (all Dwarf and Halfling team-mates), Block",
        "primary": "GS",
        "secondary": "A"
      },
      {
        "qty": "0-1",
        "position": "Old World Human Catcher",
        "cost": 65000,
        "stats": {
          "MV": 8,
          "FU": "2",
          "AG": "3+",
          "PS": "6+",
          "AR": "8+"
        },
        "skills": "Animosity (all Dwarf and Halfling team-mates), Catch, Dodge",
        "primary": "AG",
        "secondary": "S"
      },
      {
        "qty": "0-12",
        "position": "Old World Human Lineman",
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
        "position": "Old World Human Thrower",
        "cost": 80000,
        "stats": {
          "MV": 6,
          "FU": "3",
          "AG": "3+",
          "PS": "3+",
          "AR": "9+"
        },
        "skills": "Animosity (all Dwarf and Halfling team-mates), Pass, Sure Hands",
        "primary": "GP",
        "secondary": "AS"
      },
      {
        "qty": "0-2",
        "position": "Old World Halfling Hopeful",
        "cost": 30000,
        "stats": {
          "MV": 5,
          "FU": "2",
          "AG": "3+",
          "PS": "4+",
          "AR": "7+"
        },
        "skills": "Animosity (all Dwarf and Human team-mates), Dodge, Right Stuff, Stunty",
        "primary": "A",
        "secondary": "GS"
      },
      {
        "qty": "0-1",
        "position": "Old World Dwarf Blitzer",
        "cost": 80000,
        "stats": {
          "MV": 5,
          "FU": "3",
          "AG": "3+",
          "PS": "4+",
          "AR": "10+"
        },
        "skills": "Block, Loner (3+), Thick Skull",
        "primary": "GS",
        "secondary": "A"
      },
      {
        "qty": "0-2",
        "position": "Old World Dwarf Blocker",
        "cost": 75000,
        "stats": {
          "MV": 4,
          "FU": "3",
          "AG": "4+",
          "PS": "5+",
          "AR": "10+"
        },
        "skills": "Arm Bar, Brawler, Loner (3+), Thick Skull",
        "primary": "GS",
        "secondary": "A"
      },
      {
        "qty": "0-1",
        "position": "Old World Dwarf Runner",
        "cost": 85000,
        "stats": {
          "MV": 6,
          "FU": "3",
          "AG": "3+",
          "PS": "4+",
          "AR": "9+"
        },
        "skills": "Loner (3+), Sure Hands, Thick Skull",
        "primary": "GP",
        "secondary": "AS"
      },
      {
        "qty": "0-1",
        "position": "Old World Dwarf Troll Slayer",
        "cost": 95000,
        "stats": {
          "MV": 5,
          "FU": "3",
          "AG": "4+",
          "PS": "-",
          "AR": "9+"
        },
        "skills": "Block, Dauntless, Frenzy, Loner (3+), Thick Skull",
        "primary": "GS",
        "secondary": "A"
      }
    ]
  },
  {
    "name": "Equipos Orcs",
    "specialRules": "Badlands Brawl, Team Management",
    "rerollCost": 50000,
    "tier": 1,
    "apothecary": "Sí",
    "image": "https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0",
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
        "position": "Orc Lineman",
        "cost": 50000,
        "stats": {
          "MV": 5,
          "FU": "3",
          "AG": "3+",
          "PS": "4+",
          "AR": "10+"
        },
        "skills": "Animosity (Orc Linemen)",
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
        "skills": "Always Hungry, Loner (4+), Mighty Blow (+1), Projectile Vomit, Really Stupid, Regeneration, Throw Team-mate",
        "primary": "S",
        "secondary": "AGP"
      },
      {
        "qty": "0-4",
        "position": "Goblin",
        "cost": 40000,
        "stats": {
          "MV": 6,
          "FU": "2",
          "AG": "3+",
          "PS": "4+",
          "AR": "8+"
        },
        "skills": "Dodge, Right Stuff, Stunty",
        "primary": "A",
        "secondary": "GS"
      },
      {
        "qty": "0-2",
        "position": "Thrower",
        "cost": 65000,
        "stats": {
          "MV": 5,
          "FU": "3",
          "AG": "3+",
          "PS": "3+",
          "AR": "9+"
        },
        "skills": "Animosity (all team-mates), Pass, Sure Hnds",
        "primary": "GS",
        "secondary": "AP"
      },
      {
        "qty": "0-4",
        "position": "Big Un Blocker",
        "cost": 90000,
        "stats": {
          "MV": 5,
          "FU": "4",
          "AG": "4+",
          "PS": "-",
          "AR": "10+"
        },
        "skills": "Animosity (Big Un Blockers)",
        "primary": "GS",
        "secondary": "A"
      },
      {
        "qty": "0-4",
        "position": "Blitzer",
        "cost": 80000,
        "stats": {
          "MV": 6,
          "FU": "3",
          "AG": "3+",
          "PS": "4+",
          "AR": "10+"
        },
        "skills": "Animosity (all team-mates), Block",
        "primary": "GS",
        "secondary": "AP"
      }
    ]
  },
  {
    "name": "Equipos Shambling Undead",
    "specialRules": "Sylvanian Spotlight, Team Management, Masters of Undeath",
    "rerollCost": 50000,
    "tier": 1,
    "apothecary": "No",
    "image": "https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0",
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
        "position": "Skeleton Lineman",
        "cost": 40000,
        "stats": {
          "MV": 5,
          "FU": "3",
          "AG": "4+",
          "PS": "6+",
          "AR": "8+"
        },
        "skills": "Regeneration, Thick Skull",
        "primary": "G",
        "secondary": "AS"
      },
      {
        "qty": "0-4",
        "position": "Ghoul Runner",
        "cost": 75000,
        "stats": {
          "MV": 7,
          "FU": "3",
          "AG": "3+",
          "PS": "4+",
          "AR": "8+"
        },
        "skills": "Dodge",
        "primary": "AG",
        "secondary": "PS"
      },
      {
        "qty": "0-2",
        "position": "Mummy",
        "cost": 125000,
        "stats": {
          "MV": 3,
          "FU": "5",
          "AG": "5+",
          "PS": "-",
          "AR": "10+"
        },
        "skills": "Mighty Blow (+1), Regeneration",
        "primary": "S",
        "secondary": "AG"
      },
      {
        "qty": "0-2",
        "position": "Wight Blitzer",
        "cost": 90000,
        "stats": {
          "MV": 6,
          "FU": "3",
          "AG": "3+",
          "PS": "5+",
          "AR": "9+"
        },
        "skills": "Block, Regeneration",
        "primary": "GS",
        "secondary": "AP"
      },
      {
        "qty": "0-12",
        "position": "Zombie Lineman",
        "cost": 40000,
        "stats": {
          "MV": 4,
          "FU": "3",
          "AG": "4+",
          "PS": "-",
          "AR": "9+"
        },
        "skills": "Regeneration",
        "primary": "G",
        "secondary": "AS"
      }
    ]
  },
  {
    "name": "Equipos Skaven",
    "specialRules": "Underworld Challenge, Team Management",
    "rerollCost": 50000,
    "tier": 1,
    "apothecary": "Sí",
    "image": "https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0",
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
        "position": "Rat Ogre",
        "cost": 150000,
        "stats": {
          "MV": 6,
          "FU": "5",
          "AG": "4+",
          "PS": "-",
          "AR": "9+"
        },
        "skills": "Animal Savagery, Frenzy, Loner (4+), Mighty Blow (+1), Prehensile Tail",
        "primary": "S",
        "secondary": "AGM"
      },
      {
        "qty": "0-2",
        "position": "Blitzer",
        "cost": 90000,
        "stats": {
          "MV": 7,
          "FU": "3",
          "AG": "3+",
          "PS": "5+",
          "AR": "9+"
        },
        "skills": "Block",
        "primary": "GS",
        "secondary": "AMP"
      },
      {
        "qty": "0-4",
        "position": "Gutter Runner",
        "cost": 85000,
        "stats": {
          "MV": 9,
          "FU": "2",
          "AG": "2+",
          "PS": "4+",
          "AR": "8+"
        },
        "skills": "Dodge",
        "primary": "AG",
        "secondary": "MPS"
      },
      {
        "qty": "0-2",
        "position": "Thrower",
        "cost": 85000,
        "stats": {
          "MV": 7,
          "FU": "3",
          "AG": "3+",
          "PS": "2+",
          "AR": "8+"
        },
        "skills": "Pass, Sure Hands",
        "primary": "GP",
        "secondary": "AMS"
      },
      {
        "qty": "0-16",
        "position": "Skaven Clanrat Lineman",
        "cost": 50000,
        "stats": {
          "MV": 7,
          "FU": "3",
          "AG": "3+",
          "PS": "4+",
          "AR": "8+"
        },
        "skills": "<characteristic name=\"Primary\" typeId=\"fda4-6261-f0d2-ba0d\">G",
        "primary": "",
        "secondary": "AMS"
      }
    ]
  },
  {
    "name": "Equipos Slann (NAF)",
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
        "position": "Lineman",
        "cost": 60000,
        "stats": {
          "MV": 6,
          "FU": "3",
          "AG": "3+",
          "PS": "4+",
          "AR": "9+"
        },
        "skills": "Pogo Stick, Very Long Legs",
        "primary": "G",
        "secondary": "AS"
      },
      {
        "qty": "0-4",
        "position": "Catcher",
        "cost": 80000,
        "stats": {
          "MV": 7,
          "FU": "2",
          "AG": "2+",
          "PS": "4+",
          "AR": "8+"
        },
        "skills": "Diving Catch, Pogo Stick, Very Long Legs",
        "primary": "GA",
        "secondary": "SP"
      },
      {
        "qty": "0-4",
        "position": "Blitzer",
        "cost": 110000,
        "stats": {
          "MV": 7,
          "FU": "3",
          "AG": "3+",
          "PS": "4+",
          "AR": "9+"
        },
        "skills": "Diving Tackle, Jump Up, Pogo Stick, Very Long Legs",
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
        "skills": "Bone Head, Loner (4+), Mighty Blow (+1), Prehensile Tail, Thick Skull",
        "primary": "S",
        "secondary": "GA"
      }
    ]
  },
  {
    "name": "Equipos Tomb Kings",
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
        "position": "Anointed Blitzer",
        "cost": 90000,
        "stats": {
          "MV": 6,
          "FU": "3",
          "AG": "4+",
          "PS": "6+",
          "AR": "9+"
        },
        "skills": "Block, Regeneration, Thick Skull",
        "primary": "GS",
        "secondary": "AP"
      },
      {
        "qty": "0-2",
        "position": "Anointed Thrower",
        "cost": 70000,
        "stats": {
          "MV": 6,
          "FU": "3",
          "AG": "4+",
          "PS": "3+",
          "AR": "8+"
        },
        "skills": "Pass, Regeneration, Sure Hands, Thick Skull",
        "primary": "GP",
        "secondary": "A"
      },
      {
        "qty": "0-16",
        "position": "Skeleton Lineman",
        "cost": 40000,
        "stats": {
          "MV": 5,
          "FU": "3",
          "AG": "4+",
          "PS": "6+",
          "AR": "8+"
        },
        "skills": "Regeneration, Thick Skull",
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
        "skills": "Decay, Regeneration",
        "primary": "S",
        "secondary": "AG"
      }
    ]
  },
  {
    "name": "Equipos Underworld Denizens",
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
        "skills": "Always Hungry, Loner (4+), Mighty Blow (+1), Projectile Vomit, Really Stupid, Regeneration, Throw Team-mate",
        "primary": "MS",
        "secondary": "AGP"
      },
      {
        "qty": "0-12",
        "position": "Underworld Goblin Lineman",
        "cost": 40000,
        "stats": {
          "MV": 6,
          "FU": "2",
          "AG": "3+",
          "PS": "4+",
          "AR": "8+"
        },
        "skills": "Dodge, Right Stuff, Stunty",
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
        "skills": "Animosity (Underworld Goblin Linemen)",
        "primary": "GM",
        "secondary": "AS"
      },
      {
        "qty": "0-1",
        "position": "Skaven Thrower",
        "cost": 85000,
        "stats": {
          "MV": 7,
          "FU": "3",
          "AG": "3+",
          "PS": "2+",
          "AR": "8+"
        },
        "skills": "Animosity (Underworld Goblin Linemen), Pass, Sure Hands",
        "primary": "GMP",
        "secondary": "AS"
      },
      {
        "qty": "0-1",
        "position": "Skaven Blitzer",
        "cost": 90000,
        "stats": {
          "MV": 7,
          "FU": "3",
          "AG": "3+",
          "PS": "5+",
          "AR": "9+"
        },
        "skills": "Animosity (Underworld Goblin Linemen), Block",
        "primary": "GMS",
        "secondary": "AP"
      },
      {
        "qty": "0-1",
        "position": "Gutter Runner",
        "cost": 85000,
        "stats": {
          "MV": 9,
          "FU": "2",
          "AG": "2+",
          "PS": "4+",
          "AR": "8+"
        },
        "skills": "Animosity (Underworld Goblin Linemen), Dodge",
        "primary": "AGM",
        "secondary": "PS"
      },
      {
        "qty": "0-1",
        "position": "Mutant Rat Ogre",
        "cost": 150000,
        "stats": {
          "MV": 6,
          "FU": "5",
          "AG": "4+",
          "PS": "-",
          "AR": "9+"
        },
        "skills": "Animal Savagery, Frenzy, Loner (4+), Mighty Blow (+1), Prehensile Tail",
        "primary": "MS",
        "secondary": "AG"
      },
      {
        "qty": "0-6",
        "position": "Underworld Snotling",
        "cost": 15000,
        "stats": {
          "MV": 5,
          "FU": "1",
          "AG": "3+",
          "PS": "5+",
          "AR": "6+"
        },
        "skills": "Dodge, Right Stuff, Sidestep, Stunty, Swarming, Titchy",
        "primary": "AM",
        "secondary": "G"
      }
    ]
  },
  {
    "name": "Equipos Vampires",
    "specialRules": "Sylvanian Spotlight, Team Management, Vampire Lord",
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
        "position": "Thrall Lineman",
        "cost": 40000,
        "stats": {
          "MV": 6,
          "FU": "3",
          "AG": "3+",
          "PS": "4+",
          "AR": "8+"
        },
        "skills": "<characteristic name=\"Primary\" typeId=\"fda4-6261-f0d2-ba0d\">G",
        "primary": "",
        "secondary": "AS"
      },
      {
        "qty": "0-2",
        "position": "Vampire Blitzer",
        "cost": 110000,
        "stats": {
          "MV": 6,
          "FU": "4",
          "AG": "2+",
          "PS": "5+",
          "AR": "9+"
        },
        "skills": "Bloodlust (3+), Hypnotic Gaze, Juggernaut, Regeneration",
        "primary": "AGS",
        "secondary": "<characteristic name=\"Cost\" typeId=\"ee01-7448-8c3f-a882\">110000"
      },
      {
        "qty": "0-2",
        "position": "Vampire Runner",
        "cost": 100000,
        "stats": {
          "MV": 8,
          "FU": "3",
          "AG": "2+",
          "PS": "4+",
          "AR": "8+"
        },
        "skills": "Bloodlust (2+), Hypnotic Gaze, Regeneration",
        "primary": "AG",
        "secondary": "PS"
      },
      {
        "qty": "0-2",
        "position": "Vampire Thrower",
        "cost": 110000,
        "stats": {
          "MV": 6,
          "FU": "4",
          "AG": "2+",
          "PS": "2+",
          "AR": "9+"
        },
        "skills": "Bloodlust (2+), Hypnotic Gaze, Pass,  Regeneration",
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
        "skills": "Bloodlust (3+), Claws, Frenzy, Loner (4+), Regeneration",
        "primary": "S",
        "secondary": "AG"
      }
    ]
  },
  {
    "name": "Equipos Wood Elves",
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
        "position": "Catcher",
        "cost": 90000,
        "stats": {
          "MV": 8,
          "FU": "2",
          "AG": "2+",
          "PS": "4+",
          "AR": "8+"
        },
        "skills": "Catch, Dodge",
        "primary": "AG",
        "secondary": "PS"
      },
      {
        "qty": "0-12",
        "position": "Wood Elf Lineman",
        "cost": 70000,
        "stats": {
          "MV": 7,
          "FU": "3",
          "AG": "2+",
          "PS": "4+",
          "AR": "8+"
        },
        "skills": "<characteristic name=\"Primary\" typeId=\"fda4-6261-f0d2-ba0d\">AG",
        "primary": "",
        "secondary": "S"
      },
      {
        "qty": "0-2",
        "position": "Thrower",
        "cost": 95000,
        "stats": {
          "MV": 7,
          "FU": "3",
          "AG": "2+",
          "PS": "2+",
          "AR": "8+"
        },
        "skills": "Pass",
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
        "skills": "Block, Dodge, Leap",
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
        "skills": "Loner (4+), Mighty Blow (+1), Stand Firm, Strong Arm, Take Root, Thick Skull, Throw Team-mate",
        "primary": "S",
        "secondary": "AG"
      }
    ]
  }
];
