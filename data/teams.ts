import type { Team } from '../types';

export const teamsData: Team[] = [
    {
        "name":  "Amazons",
        "specialRules":  "None",
        "rerollCost":  60000,
        "tier":  1,
        "apothecary":  "Yes",
        "image":  "https://raw.githubusercontent.com/jaz206/Bloodbowl-image/main/Escudos/Amazonas.png",
        "ratings":  {
                        "fuerza":  65,
                        "agilidad":  80,
                        "velocidad":  75,
                        "armadura":  83,
                        "pase":  55
                    },
        "roster":  [
                       {
                           "qty":  "0-16",
                           "position":  "Eagle Warrior",
                           "cost":  50000,
                           "stats":  {
                                         "MV":  6,
                                         "FU":  "3",
                                         "AG":  "3+",
                                         "PA":  "4+",
                                         "AR":  "8+"
                                     },
                           "skillKeys":  [
                                             "Dodge"
                           ],
                           "primary":  "G",
                           "secondary":  "AS"
                       },
                       {
                           "qty":  "0-2",
                           "position":  "Python Warrior",
                           "cost":  80000,
                           "stats":  {
                                         "MV":  6,
                                         "FU":  "3",
                                         "AG":  "3+",
                                         "PA":  "3+",
                                         "AR":  "8+"
                                     },
                           "skillKeys":  [
                                             "Dodge",
                                             "Kick-Off Return",
                                             "Pass",
                                             "Safe Pass"
                           ],
                           "primary":  "GP",
                           "secondary":  "AS"
                       },
                       {
                           "qty":  "0-2",
                           "position":  "Jaguar Warrior",
                           "cost":  110000,
                           "stats":  {
                                         "MV":  6,
                                         "FU":  "4",
                                         "AG":  "3+",
                                         "PA":  "4+",
                                         "AR":  "9+"
                                     },
                           "skillKeys":  [
                                             "Defensive",
                                             "Dodge"
                                         ],
                           "primary":  "GS",
                           "secondary":  "A"
                       },
                       {
                           "qty":  "0-2",
                           "position":  "Piranha Warrior",
                           "cost":  90000,
                           "stats":  {
                                         "MV":  7,
                                         "FU":  "3",
                                         "AG":  "3+",
                                         "PA":  "5+",
                                         "AR":  "8+"
                                     },
                           "skillKeys":  [
                                             "Dodge",
                                             "Hit and Run",
                                             "Jump Up"
                                         ],
                           "primary":  "AG",
                           "secondary":  "S"
                       }
                   ],
        "specialRules_es":  "Ninguna",
        "specialRules_en":  "None",
        "description": "League: Lustrian Superleague"
    },
    {
        "name": "Black Orcs",
        "specialRules": "Brutal Bruisers, Bribery and Corruption",
        "rerollCost": 60000,
        "tier": 3,
        "apothecary": "Yes",
        "image": "https://raw.githubusercontent.com/jaz206/Bloodbowl-image/main/Escudos/Black%20Orcs.png",
        "ratings": {
            "fuerza": 73,
            "agilidad": 60,
            "velocidad": 56,
            "armadura": 93,
            "pase": 47
        },
        "roster": [
            {
                "qty": "0-16",
                "position": "Goblin Bruiser",
                "cost": 45000,
                "stats": {
                    "MV": 6,
                    "FU": "2",
                    "AG": "3+",
                    "PA": "4+",
                    "AR": "8+"
                },
                "skillKeys": [
                    "Dodge",
                    "Right Stuff",
                    "Stunty",
                    "Thick Skull"
                ],
                "primary": "A",
                "secondary": "FGP"
            },
            {
                "qty": "0-6",
                "position": "Black Orc",
                "cost": 90000,
                "stats": {
                    "MV": 4,
                    "FU": "4",
                    "AG": "4+",
                    "PA": "5+",
                    "AR": "10+"
                },
                "skillKeys": [
                    "Brawler",
                    "Grab"
                ],
                "primary": "FG",
                "secondary": "AT"
            },
            {
                "qty": "0-1",
                "position": "Trained Troll",
                "cost": 115000,
                "stats": {
                    "MV": 4,
                    "FU": "5",
                    "AG": "5+",
                    "PA": "5+",
                    "AR": "10+"
                },
                "skillKeys": [
                    "Mighty Blow (+1)",
                    "Throw Team-mate",
                    "Projectile Vomit",
                    "Regeneration",
                    "Really Stupid",
                    "Always Hungry"
                ],
                "primary": "F",
                "secondary": "AGP"
            }
        ],
        "specialRules_es": "Brutos brutales, Soborno y corrupci?n",
        "specialRules_en": "Brutal Bruisers, Bribery and Corruption",
        "description": "Leagues: Badlands Brawl"
    },
    {
        "name": "Chosen of Chaos",
        "specialRules": "Favoured of..., Team Management",
        "rerollCost": 50000,
        "tier": 3,
        "apothecary": "Yes",
        "image": "https://raw.githubusercontent.com/jaz206/Bloodbowl-image/main/Escudos/Chosen%20of%20Chaos.png",
        "ratings": {
            "fuerza": 80,
            "agilidad": 80,
            "velocidad": 60,
            "armadura": 100,
            "pase": 40
        },
        "roster": [
            {
                "qty": "0-16",
                "position": "Beastman Lineman",
                "cost": 55000,
                "stats": {
                    "MV": 6,
                    "FU": "3",
                    "AG": "3+",
                    "PA": "3+",
                    "AR": "9+"
                },
                "skillKeys": [
                    "Thick Skull",
                    "Horns"
                ],
                "primary": "GM",
                "secondary": "AFPT"
            },
            {
                "qty": "0-4",
                "position": "Chaos Warrior",
                "cost": 100000,
                "stats": {
                    "MV": 5,
                    "FU": "4",
                    "AG": "3+",
                    "PA": "5+",
                    "AR": "10+"
                },
                "skillKeys": [
                    "Arm Bar"
                ],
                "primary": "FGM",
                "secondary": "AT"
            },
            {
                "qty": "0-1",
                "position": "Chaos Troll",
                "cost": 115000,
                "stats": {
                    "MV": 4,
                    "FU": "5",
                    "AG": "5+",
                    "PA": "5+",
                    "AR": "10+"
                },
                "skillKeys": [
                    "Mighty Blow (+1)",
                    "Throw Team-mate",
                    "Projectile Vomit",
                    "Regeneration",
                    "Really Stupid",
                    "Always Hungry",
                    "Loner (4+)"
                ],
                "primary": "FM",
                "secondary": "AGP"
            },
            {
                "qty": "0-1",
                "position": "Chaos Ogre",
                "cost": 140000,
                "stats": {
                    "MV": 5,
                    "FU": "5",
                    "AG": "4+",
                    "PA": "5+",
                    "AR": "10+"
                },
                "skillKeys": [
                    "Bone Head",
                    "Really Stupid",
                    "Mighty Blow (+1)",
                    "Throw Team-mate",
                    "Loner (3+)"
                ],
                "primary": "FM",
                "secondary": "AG"
            },
            {
                "qty": "0-1",
                "position": "Minotaur",
                "cost": 150000,
                "stats": {
                    "MV": 5,
                    "FU": "5",
                    "AG": "4+",
                    "PA": "5+",
                    "AR": "9+"
                },
                "skillKeys": [
                    "Thick Skull",
                    "Horns",
                    "Frenzy",
                    "Mighty Blow (+1)",
                    "Unchannelled Fury",
                    "Loner (4+)"
                ],
                "primary": "FM",
                "secondary": "AG"
            }
        ],
        "specialRules_es": "Favorito de..., Gesti?n de Equipo",
        "specialRules_en": "Favoured of..., Team Management",
        "description": "Leagues: Chaos Cup"
    },
    {
        "name": "Chaos Dwarfs",
        "specialRules": "Chosen of Hashut",
        "rerollCost": 70000,
        "tier": 1,
        "apothecary": "Yes",
        "image": "https://raw.githubusercontent.com/jaz206/Bloodbowl-image/main/Escudos/Chaos%20Dwarfs.png",
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
                "position": "Hobgoblin",
                "cost": 40000,
                "stats": {
                    "MV": 6,
                    "FU": "3",
                    "AG": "3+",
                    "PA": "4+",
                    "AR": "8+"
                },
                "skillKeys": [],
                "primary": "T",
                "secondary": "AFG"
            },
            {
                "qty": "0-2",
                "position": "Hobgoblin Sneaky Stabba",
                "cost": 60000,
                "stats": {
                    "MV": 6,
                    "FU": "3",
                    "AG": "3+",
                    "PA": "5+",
                    "AR": "8+"
                },
                "skillKeys": [
                    "Stab",
                    "Shadowing"
                ],
                "primary": "GT",
                "secondary": "AF"
            },
            {
                "qty": "0-4",
                "position": "Chaos Dwarf Blocker",
                "cost": 70000,
                "stats": {
                    "MV": 4,
                    "FU": "3",
                    "AG": "4+",
                    "PA": "6+",
                    "AR": "10+"
                },
                "skillKeys": [
                    "Thick Skull",
                    "Iron Hard Skin",
                    "Block"
                ],
                "primary": "FG",
                "secondary": "AMT"
            },
            {
                "qty": "0-2",
                "position": "Flamesmith",
                "cost": 80000,
                "stats": {
                    "MV": 5,
                    "FU": "3",
                    "AG": "4+",
                    "PA": "6+",
                    "AR": "10+"
                },
                "skillKeys": [
                    "Breath Weapon",
                    "Thick Skull",
                    "Brawler",
                    "Disturbing Presence"
                ],
                "primary": "FG",
                "secondary": "AMT"
            },
            {
                "qty": "0-2",
                "position": "Bull Centaur Blitzer",
                "cost": 130000,
                "stats": {
                    "MV": 6,
                    "FU": "4",
                    "AG": "4+",
                    "PA": "6+",
                    "AR": "10+"
                },
                "skillKeys": [
                    "Thick Skull",
                    "Sprint",
                    "Sure Feet",
                    "Sure Hands"
                ],
                "primary": "FG",
                "secondary": "AMT"
            },
            {
                "qty": "0-1",
                "position": "Minotaur",
                "cost": 150000,
                "stats": {
                    "MV": 5,
                    "FU": "5",
                    "AG": "4+",
                    "PA": "-",
                    "AR": "9+"
                },
                "skillKeys": [
                    "Thick Skull",
                    "Horns",
                    "Frenzy",
                    "Mighty Blow (+1)",
                    "Unchannelled Fury",
                    "Loner (4+)"
                ],
                "primary": "FM",
                "secondary": "AG"
            }
        ],
        "specialRules_es": "Elegidos de Hashut",
        "specialRules_en": "Chosen of Hashut",
        "description": "Leagues: Badlands Brawl or Chaos Cup"
    },
    {
        "name": "Chaos Renegades",
        "specialRules": "Favoured of? (choose one): Chaos Undivided, Khorne, Nurgle, Slaanesh, Tzeentch",
        "rerollCost": 70000,
        "tier": 3,
        "apothecary": "Yes",
        "image": "https://raw.githubusercontent.com/jaz206/Bloodbowl-image/main/Escudos/Chaos%20Renegades.png",
        "ratings": {
            "fuerza": 74,
            "agilidad": 72,
            "velocidad": 67,
            "armadura": 91,
            "pase": 50
        },
        "roster": [
            {
                "qty": "0-16",
                "position": "Renegade Human Lineman",
                "cost": 50000,
                "stats": {
                    "MV": 6,
                    "FU": "3",
                    "AG": "3+",
                    "PA": "4+",
                    "AR": "9+"
                },
                "skillKeys": [
                    "Animosity (all team-mates)"
                ],
                "primary": "GMT",
                "secondary": "AF"
            },
            {
                "qty": "0-1",
                "position": "Renegade Goblin",
                "cost": 40000,
                "stats": {
                    "MV": 6,
                    "FU": "2",
                    "AG": "3+",
                    "PA": "4+",
                    "AR": "8+"
                },
                "skillKeys": [
                    "Animosity (all team-mates)",
                    "Stunty",
                    "Dodge",
                    "Right Stuff"
                ],
                "primary": "AMT",
                "secondary": "GP"
            },
            {
                "qty": "0-1",
                "position": "Renegade Orc",
                "cost": 50000,
                "stats": {
                    "MV": 5,
                    "FU": "3",
                    "AG": "3+",
                    "PA": "5+",
                    "AR": "10+"
                },
                "skillKeys": [
                    "Animosity (all team-mates)"
                ],
                "primary": "GMT",
                "secondary": "AF"
            },
            {
                "qty": "0-1",
                "position": "Renegade Skaven",
                "cost": 50000,
                "stats": {
                    "MV": 7,
                    "FU": "3",
                    "AG": "3+",
                    "PA": "4+",
                    "AR": "8+"
                },
                "skillKeys": [
                    "Animosity (all team-mates)"
                ],
                "primary": "GMT",
                "secondary": "AF"
            },
            {
                "qty": "0-1",
                "position": "Renegade Dark Elf",
                "cost": 65000,
                "stats": {
                    "MV": 6,
                    "FU": "3",
                    "AG": "2+",
                    "PA": "3+",
                    "AR": "9+"
                },
                "skillKeys": [
                    "Animosity (all team-mates)"
                ],
                "primary": "AG",
                "secondary": "MTFP"
            },
            {
                "qty": "0-1",
                "position": "Renegade Human Thrower",
                "cost": 75000,
                "stats": {
                    "MV": 6,
                    "FU": "3",
                    "AG": "3+",
                    "PA": "3+",
                    "AR": "9+"
                },
                "skillKeys": [
                    "Animosity (all team-mates)",
                    "Sure Hands",
                    "Pass"
                ],
                "primary": "GMPT",
                "secondary": "AF"
            },
            {
                "qty": "0-1",
                "position": "Renegade Troll",
                "cost": 115000,
                "stats": {
                    "MV": 4,
                    "FU": "5",
                    "AG": "5+",
                    "PA": "5+",
                    "AR": "10+"
                },
                "skillKeys": [
                    "Mighty Blow (+1)",
                    "Throw Team-mate",
                    "Projectile Vomit",
                    "Really Stupid",
                    "Regeneration",
                    "Always Hungry",
                    "Loner (4+)"
                ],
                "primary": "F",
                "secondary": "AGMP"
            },
            {
                "qty": "0-1",
                "position": "Renegade Ogre",
                "cost": 140000,
                "stats": {
                    "MV": 5,
                    "FU": "5",
                    "AG": "4+",
                    "PA": "5+",
                    "AR": "10+"
                },
                "skillKeys": [
                    "Bone Head",
                    "Mighty Blow (+1)",
                    "Really Stupid",
                    "Throw Team-mate",
                    "Loner (4+)"
                ],
                "primary": "F",
                "secondary": "AGM"
            },
            {
                "qty": "0-1",
                "position": "Renegade Minotaur",
                "cost": 150000,
                "stats": {
                    "MV": 5,
                    "FU": "5",
                    "AG": "4+",
                    "PA": "6+",
                    "AR": "9+"
                },
                "skillKeys": [
                    "Thick Skull",
                    "Horns",
                    "Frenzy",
                    "Mighty Blow (+1)",
                    "Unchannelled Fury",
                    "Loner (4+)"
                ],
                "primary": "F",
                "secondary": "AGM"
            },
            {
                "qty": "0-1",
                "position": "Renegade Rat Ogre",
                "cost": 150000,
                "stats": {
                    "MV": 6,
                    "FU": "5",
                    "AG": "4+",
                    "PA": "6+",
                    "AR": "9+"
                },
                "skillKeys": [
                    "Animal Savagery",
                    "Prehensile Tail",
                    "Frenzy",
                    "Mighty Blow (+1)",
                    "Loner (4+)"
                ],
                "primary": "F",
                "secondary": "AGM"
            }
        ],
        "specialRules_es": "Elegidos de? (elige uno): Caos Absoluto, Khorne, Nurgle, Slaanesh, Tzeentch",
        "specialRules_en": "Favoured of? (choose one): Chaos Undivided, Khorne, Nurgle, Slaanesh, Tzeentch",
        "description": "Leagues: Chaos Cup"
    },
    {
        "name": "Dark Elves",
        "specialRules": "None",
        "rerollCost": 50000,
        "tier": 1,
        "apothecary": "Yes",
        "image": "https://raw.githubusercontent.com/jaz206/Bloodbowl-image/main/Escudos/Dark%20Elves.png",
        "ratings": {
            "fuerza": 60,
            "agilidad": 100,
            "velocidad": 82,
            "armadura": 84,
            "pase": 56
        },
        "roster": [
            {
                "qty": "0-12",
                "position": "Dark Elf Lineman",
                "cost": 65000,
                "stats": {
                    "MV": 6,
                    "FU": "3",
                    "AG": "2+",
                    "PA": "3+",
                    "AR": "9+"
                },
                "skillKeys": [],
                "primary": "AG",
                "secondary": "FT"
            },
            {
                "qty": "0-2",
                "position": "Runner",
                "cost": 80000,
                "stats": {
                    "MV": 7,
                    "FU": "3",
                    "AG": "2+",
                    "PA": "3+",
                    "AR": "8+"
                },
                "skillKeys": [
                    "Dump-Off",
                    "Kick"
                ],
                "primary": "AGP",
                "secondary": "FT"
            },
            {
                "qty": "0-2",
                "position": "Assassin",
                "cost": 90000,
                "stats": {
                    "MV": 7,
                    "FU": "3",
                    "AG": "2+",
                    "PA": "4+",
                    "AR": "8+"
                },
                "skillKeys": [
                    "Stab",
                    "Hit and Run",
                    "Shadowing"
                ],
                "primary": "AT",
                "secondary": "FG"
            },
            {
                "qty": "0-2",
                "position": "Blitzer",
                "cost": 105000,
                "stats": {
                    "MV": 7,
                    "FU": "3",
                    "AG": "2+",
                    "PA": "3+",
                    "AR": "9+"
                },
                "skillKeys": [
                    "Block"
                ],
                "primary": "AG",
                "secondary": "FPT"
            },
            {
                "qty": "0-2",
                "position": "Witch Elf",
                "cost": 110000,
                "stats": {
                    "MV": 7,
                    "FU": "3",
                    "AG": "2+",
                    "PA": "4+",
                    "AR": "8+"
                },
                "skillKeys": [
                    "Jump Up",
                    "Dodge",
                    "Frenzy"
                ],
                "primary": "AG",
                "secondary": "FT"
            }
        ],
        "specialRules_es": "Ninguna",
        "specialRules_en": "None",
        "description": "Leagues: Elven Kingdoms League"
    },
    {
        "name": "Dwarfs",
        "specialRules": "Brutal Bruisers, Bribery and Corruption",
        "rerollCost": 50000,
        "tier": 1,
        "apothecary": "Yes",
        "image": "https://raw.githubusercontent.com/jaz206/Bloodbowl-image/main/Escudos/Dwarfs.png",
        "ratings": {
            "fuerza": 76,
            "agilidad": 64,
            "velocidad": 58,
            "armadura": 98,
            "pase": 40
        },
        "roster": [
            {
                "qty": "0-16",
                "position": "Dwarf Blocker",
                "cost": 70000,
                "stats": {
                    "MV": 4,
                    "FU": "3",
                    "AG": "4+",
                    "PA": "5+",
                    "AR": "10+"
                },
                "skillKeys": [
                    "Thick Skull",
                    "Block",
                    "Defensive"
                ],
                "primary": "GT",
                "secondary": "F"
            },
            {
                "qty": "0-2",
                "position": "Runner",
                "cost": 80000,
                "stats": {
                    "MV": 6,
                    "FU": "3",
                    "AG": "3+",
                    "PA": "4+",
                    "AR": "9+"
                },
                "skillKeys": [
                    "Thick Skull",
                    "Sure Hands",
                    "Sprint"
                ],
                "primary": "GP",
                "secondary": "F"
            },
            {
                "qty": "0-2",
                "position": "Blitzer",
                "cost": 100000,
                "stats": {
                    "MV": 5,
                    "FU": "3",
                    "AG": "3+",
                    "PA": "4+",
                    "AR": "10+"
                },
                "skillKeys": [
                    "Thick Skull",
                    "Defensive",
                    "Deflection",
                    "Block"
                ],
                "primary": "FG",
                "secondary": "P"
            },
            {
                "qty": "0-2",
                "position": "Troll Slayer",
                "cost": 95000,
                "stats": {
                    "MV": 5,
                    "FU": "3",
                    "AG": "4+",
                    "PA": "-",
                    "AR": "9+"
                },
                "skillKeys": [
                    "Dauntless",
                    "Thick Skull",
                    "Frenzy",
                    "Hatred (Troll)",
                    "Block"
                ],
                "primary": "FG",
                "secondary": "T"
            },
            {
                "qty": "0-1",
                "position": "Deathroller",
                "cost": 170000,
                "stats": {
                    "MV": 4,
                    "FU": "7",
                    "AG": "5+",
                    "PA": "-",
                    "AR": "11+"
                },
                "skillKeys": [
                    "Break Tackle",
                    "Secret Weapon",
                    "Juggernaut",
                    "Dirty Player (+1)",
                    "Stand Firm",
                    "Mighty Blow (+1)",
                    "No Hands",
                    "Loner (4+)"
                ],
                "primary": "FT",
                "secondary": "G"
            }
        ],
        "specialRules_es": "Brutos brutales, Soborno y corrupci?n",
        "specialRules_en": "Brutal Bruisers, Bribery and Corruption",
        "description": "Leagues: World's Edge Superleague"
    },
    {
        "name": "Elven Union",
        "specialRules": "None",
        "rerollCost": 50000,
        "tier": 2,
        "apothecary": "Yes",
        "image": "https://raw.githubusercontent.com/jaz206/Bloodbowl-image/main/Escudos/Elven%20Union.png",
        "ratings": {
            "fuerza": 60,
            "agilidad": 100,
            "velocidad": 81,
            "armadura": 83,
            "pase": 75
        },
        "roster": [
            {
                "qty": "0-16",
                "position": "Elven Union Lineman",
                "cost": 65000,
                "stats": {
                    "MV": 6,
                    "FU": "3",
                    "AG": "2+",
                    "PA": "3+",
                    "AR": "8+"
                },
                "skillKeys": [
                    "Dump-Off"
                ],
                "primary": "AG",
                "secondary": "F"
            },
            {
                "qty": "0-2",
                "position": "Elven Union Thrower",
                "cost": 75000,
                "stats": {
                    "MV": 6,
                    "FU": "3",
                    "AG": "2+",
                    "PA": "2+",
                    "AR": "8+"
                },
                "skillKeys": [
                    "Pass",
                    "Hail Mary Pass"
                ],
                "primary": "AGP",
                "secondary": "F"
            },
            {
                "qty": "0-2",
                "position": "Elven Union Catcher",
                "cost": 100000,
                "stats": {
                    "MV": 8,
                    "FU": "3",
                    "AG": "2+",
                    "PA": "4+",
                    "AR": "8+"
                },
                "skillKeys": [
                    "Catch",
                    "Nerves of Steel",
                    "Heroic Catch"
                ],
                "primary": "AG",
                "secondary": "F"
            },
            {
                "qty": "0-2",
                "position": "Elven Union Blitzer",
                "cost": 115000,
                "stats": {
                    "MV": 7,
                    "FU": "3",
                    "AG": "2+",
                    "PA": "3+",
                    "AR": "9+"
                },
                "skillKeys": [
                    "Block",
                    "Side Step"
                ],
                "primary": "AG",
                "secondary": "FP"
            }
        ],
        "specialRules_es": "Ninguna",
        "specialRules_en": "None",
        "description": "Leagues: Elven Kingdoms League"
    },
    {
        "name": "Gnomes",
        "specialRules": "None",
        "rerollCost": 50000,
        "tier": 4,
        "apothecary": "Yes",
        "image": "https://raw.githubusercontent.com/jaz206/Bloodbowl-image/main/Escudos/Gnomes.png",
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
                    "PA": "4+",
                    "AR": "7+"
                },
                "skillKeys": [
                    "Jump Up",
                    "Stunty",
                    "Wrestle",
                    "Right Stuff"
                ],
                "primary": "A",
                "secondary": "FGT"
            },
            {
                "qty": "0-2",
                "position": "Woodland Fox",
                "cost": 50000,
                "stats": {
                    "MV": 7,
                    "FU": "2",
                    "AG": "2+",
                    "PA": "-",
                    "AR": "6+"
                },
                "skillKeys": [
                    "Side Step",
                    "Stunty",
                    "Dodge",
                    "My Ball"
                ],
                "primary": "-",
                "secondary": "A"
            },
            {
                "qty": "0-2",
                "position": "Illusionist",
                "cost": 50000,
                "stats": {
                    "MV": 5,
                    "FU": "2",
                    "AG": "3+",
                    "PA": "3+",
                    "AR": "7+"
                },
                "skillKeys": [
                    "Trickster",
                    "Jump Up",
                    "Stunty",
                    "Wrestle"
                ],
                "primary": "AP",
                "secondary": "GT"
            },
            {
                "qty": "0-2",
                "position": "Beastmaster",
                "cost": 55000,
                "stats": {
                    "MV": 5,
                    "FU": "2",
                    "AG": "3+",
                    "PA": "4+",
                    "AR": "8+"
                },
                "skillKeys": [
                    "Defensive",
                    "Jump Up",
                    "Stunty",
                    "Wrestle"
                ],
                "primary": "A",
                "secondary": "FGT"
            },
            {
                "qty": "0-2",
                "position": "Altern Forest Treeman",
                "cost": 120000,
                "stats": {
                    "MV": 2,
                    "FU": "6",
                    "AG": "5+",
                    "PA": "5+",
                    "AR": "11+"
                },
                "skillKeys": [
                    "Strong Arm",
                    "Thick Skull",
                    "Mighty Blow (+1)",
                    "Take Root",
                    "Throw Team-mate",
                    "Stand Firm",
                    "Timmm-ber!"
                ],
                "primary": "F",
                "secondary": "AGP"
            }
        ],
        "specialRules_es": "Ninguna",
        "specialRules_en": "None",
        "description": "Leagues: Halfling Thimble Cup or Forests League"
    },
    {
        "name": "Goblins",
        "specialRules": "Bribery and Corruption",
        "rerollCost": 60000,
        "tier": 4,
        "apothecary": "Yes",
        "image": "https://raw.githubusercontent.com/jaz206/Bloodbowl-image/main/Escudos/Goblins.png",
        "ratings": {
            "fuerza": 63,
            "agilidad": 74,
            "velocidad": 65,
            "armadura": 83,
            "pase": 37
        },
        "roster": [
            {
                "qty": "0-16",
                "position": "Goblin Lineman",
                "cost": 40000,
                "stats": {
                    "MV": 6,
                    "FU": "2",
                    "AG": "3+",
                    "PA": "4+",
                    "AR": "8+"
                },
                "skillKeys": [
                    "Dodge",
                    "Right Stuff",
                    "Stunty"
                ],
                "primary": "AT",
                "secondary": "FGP"
            },
            {
                "qty": "0-1",
                "position": "Looney",
                "cost": 40000,
                "stats": {
                    "MV": 6,
                    "FU": "2",
                    "AG": "3+",
                    "PA": "-",
                    "AR": "8+"
                },
                "skillKeys": [
                    "Secret Weapon",
                    "No Hands?",
                    "Stunty",
                    "Chainsaw"
                ],
                "primary": "T",
                "secondary": "AFG"
            },
            {
                "qty": "0-1",
                "position": "Bomma",
                "cost": 45000,
                "stats": {
                    "MV": 6,
                    "FU": "2",
                    "AG": "3+",
                    "PA": "4+",
                    "AR": "8+"
                },
                "skillKeys": [
                    "Secret Weapon",
                    "Bombardier",
                    "Dodge",
                    "Stunty"
                ],
                "primary": "PT",
                "secondary": "AFG"
            },
            {
                "qty": "0-1",
                "position": "Hooligan",
                "cost": 60000,
                "stats": {
                    "MV": 6,
                    "FU": "2",
                    "AG": "3+",
                    "PA": "6+",
                    "AR": "8+"
                },
                "skillKeys": [
                    "Dodge",
                    "Stunty",
                    "Right Stuff",
                    "Dirty Player (+1)",
                    "Disturbing Presence",
                    "Pro"
                ],
                "primary": "AT",
                "secondary": "FG"
            },
            {
                "qty": "0-1",
                "position": "Doom Diver",
                "cost": 65000,
                "stats": {
                    "MV": 6,
                    "FU": "2",
                    "AG": "3+",
                    "PA": "6+",
                    "AR": "8+"
                },
                "skillKeys": [
                    "Stunty",
                    "Dodge",
                    "Right Stuff",
                    "Plunge"
                ],
                "primary": "A",
                "secondary": "FGT"
            },
            {
                "qty": "0-1",
                "position": "Fanatic",
                "cost": 70000,
                "stats": {
                    "MV": 3,
                    "FU": "7",
                    "AG": "3+",
                    "PA": "-",
                    "AR": "8+"
                },
                "skillKeys": [
                    "Secret Weapon",
                    "Ball and Chain",
                    "Stunty",
                    "No Hands"
                ],
                "primary": "FT",
                "secondary": "AG"
            },
            {
                "qty": "0-1",
                "position": "Pogoer",
                "cost": 75000,
                "stats": {
                    "MV": 7,
                    "FU": "2",
                    "AG": "3+",
                    "PA": "4+",
                    "AR": "8+"
                },
                "skillKeys": [
                    "Stunty",
                    "Dodge",
                    "Pogo Stick"
                ],
                "primary": "A",
                "secondary": "FGT"
            },
            {
                "qty": "0-2",
                "position": "Trained Troll",
                "cost": 115000,
                "stats": {
                    "MV": 4,
                    "FU": "5",
                    "AG": "5+",
                    "PA": "5+",
                    "AR": "10+"
                },
                "skillKeys": [
                    "Mighty Blow (+1)",
                    "Throw Team-mate",
                    "Projectile Vomit",
                    "Regeneration",
                    "Really Stupid",
                    "Always Hungry"
                ],
                "primary": "F",
                "secondary": "AGP"
            }
        ],
        "specialRules_es": "Soborno y corrupci?n",
        "specialRules_en": "Bribery and Corruption",
        "description": "Leagues: Badlands Brawl or Underworld Challenge"
    },
    {
        "name": "Halflings",
        "specialRules": "None",
        "rerollCost": 60000,
        "tier": 4,
        "apothecary": "Yes",
        "image": "https://raw.githubusercontent.com/jaz206/Bloodbowl-image/main/Escudos/Halflings.png",
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
                "position": "Halfling Lineman",
                "cost": 30000,
                "stats": {
                    "MV": 5,
                    "FU": "2",
                    "AG": "3+",
                    "PA": "4+",
                    "AR": "7+"
                },
                "skillKeys": [
                    "Dodge",
                    "Right Stuff",
                    "Stunty"
                ],
                "primary": "A",
                "secondary": "FGT"
            },
            {
                "qty": "0-2",
                "position": "Halfling Hefty",
                "cost": 50000,
                "stats": {
                    "MV": 5,
                    "FU": "2",
                    "AG": "3+",
                    "PA": "3+",
                    "AR": "8+"
                },
                "skillKeys": [
                    "Dodge",
                    "Sidestep",
                    "Stunty"
                ],
                "primary": "AP",
                "secondary": "FGT"
            },
            {
                "qty": "0-2",
                "position": "Halfling Catcher",
                "cost": 55000,
                "stats": {
                    "MV": 5,
                    "FU": "2",
                    "AG": "3+",
                    "PA": "4+",
                    "AR": "7+"
                },
                "skillKeys": [
                    "Catch",
                    "Dodge",
                    "Right Stuff",
                    "Sprint",
                    "Stunty"
                ],
                "primary": "A",
                "secondary": "FGT"
            },
            {
                "qty": "0-2",
                "position": "Altern Forest Treeman",
                "cost": 120000,
                "stats": {
                    "MV": 2,
                    "FU": "6",
                    "AG": "5+",
                    "PA": "5+",
                    "AR": "11+"
                },
                "skillKeys": [
                    "Strong Arm",
                    "Thick Skull",
                    "Mighty Blow (+1)",
                    "Take Root",
                    "Throw Team-mate",
                    "Stand Firm",
                    "Timmm-ber!"
                ],
                "primary": "F",
                "secondary": "AGP"
            }
        ],
        "specialRules_es": "Ninguna",
        "specialRules_en": "None",
        "description": "Leagues: Halfling Thimble Cup or Forests League"
    },
    {
        "name": "High Elves",
        "specialRules": "None",
        "rerollCost": 50000,
        "tier": 1,
        "apothecary": "Yes",
        "image": "https://raw.githubusercontent.com/jaz206/Bloodbowl-image/main/Escudos/High%20Elves.png",
        "ratings": {
            "fuerza": 60,
            "agilidad": 100,
            "velocidad": 81,
            "armadura": 88,
            "pase": 65
        },
        "roster": [
            {
                "qty": "0-12",
                "position": "High Elf Lineman",
                "cost": 65000,
                "stats": {
                    "MV": 6,
                    "FU": "3",
                    "AG": "2+",
                    "PA": "3+",
                    "AR": "9+"
                },
                "skillKeys": [],
                "primary": "AG",
                "secondary": "FP"
            },
            {
                "qty": "0-4",
                "position": "High Elf Catcher",
                "cost": 90000,
                "stats": {
                    "MV": 8,
                    "FU": "3",
                    "AG": "2+",
                    "PA": "3+",
                    "AR": "8+"
                },
                "skillKeys": [
                    "Catch"
                ],
                "primary": "AG",
                "secondary": "F"
            },
            {
                "qty": "0-2",
                "position": "High Elf Thrower",
                "cost": 100000,
                "stats": {
                    "MV": 6,
                    "FU": "3",
                    "AG": "2+",
                    "PA": "2+",
                    "AR": "9+"
                },
                "skillKeys": [
                    "Cloud Burster",
                    "Pass",
                    "Safe Pass"
                ],
                "primary": "AGP",
                "secondary": "F"
            },
            {
                "qty": "0-2",
                "position": "High Elf Blitzer",
                "cost": 100000,
                "stats": {
                    "MV": 7,
                    "FU": "3",
                    "AG": "2+",
                    "PA": "4+",
                    "AR": "9+"
                },
                "skillKeys": [
                    "Block"
                ],
                "primary": "AG",
                "secondary": "FP"
            }
        ],
        "specialRules_es": "Ninguna",
        "specialRules_en": "None",
        "description": "Leagues: Elven Kingdoms League"
    },
    {
        "name": "Humans",
        "specialRules": "Team Captain",
        "rerollCost": 50000,
        "tier": 2,
        "apothecary": "Yes",
        "image": "https://raw.githubusercontent.com/jaz206/Bloodbowl-image/main/Escudos/Humans.png",
        "ratings": {
            "fuerza": 60,
            "agilidad": 77,
            "velocidad": 74,
            "armadura": 87,
            "pase": 60
        },
        "roster": [
            {
                "qty": "0-16",
                "position": "Human Lineman",
                "cost": 50000,
                "stats": {
                    "MV": 6,
                    "FU": "3",
                    "AG": "3+",
                    "PA": "4+",
                    "AR": "9+"
                },
                "skillKeys": [],
                "primary": "G",
                "secondary": "AFT"
            },
            {
                "qty": "0-3",
                "position": "Halfling",
                "cost": 30000,
                "stats": {
                    "MV": 5,
                    "FU": "2",
                    "AG": "3+",
                    "PA": "4+",
                    "AR": "7+"
                },
                "skillKeys": [
                    "Stunty",
                    "Dodge",
                    "Right Stuff"
                ],
                "primary": "A",
                "secondary": "FGT"
            },
            {
                "qty": "0-2",
                "position": "Catcher",
                "cost": 75000,
                "stats": {
                    "MV": 8,
                    "FU": "3",
                    "AG": "3+",
                    "PA": "4+",
                    "AR": "8+"
                },
                "skillKeys": [
                    "Catch",
                    "Dodge"
                ],
                "primary": "AG",
                "secondary": "FPT"
            },
            {
                "qty": "0-2",
                "position": "Thrower",
                "cost": 80000,
                "stats": {
                    "MV": 6,
                    "FU": "3",
                    "AG": "3+",
                    "PA": "3+",
                    "AR": "9+"
                },
                "skillKeys": [
                    "Sure Hands",
                    "Pass"
                ],
                "primary": "GP",
                "secondary": "AFT"
            },
            {
                "qty": "0-2",
                "position": "Blitzer",
                "cost": 85000,
                "stats": {
                    "MV": 7,
                    "FU": "3",
                    "AG": "3+",
                    "PA": "4+",
                    "AR": "9+"
                },
                "skillKeys": [
                    "Defensive",
                    "Block"
                ],
                "primary": "FG",
                "secondary": "AT"
            },
            {
                "qty": "0-1",
                "position": "Ogre",
                "cost": 140000,
                "stats": {
                    "MV": 5,
                    "FU": "5",
                    "AG": "4+",
                    "PA": "5+",
                    "AR": "10+"
                },
                "skillKeys": [
                    "Bone Head",
                    "Really Stupid",
                    "Mighty Blow (+1)",
                    "Throw Team-mate",
                    "Loner (3+)"
                ],
                "primary": "F",
                "secondary": "AG"
            }
        ],
        "specialRules_es": "Capit?n del equipo",
        "specialRules_en": "Team Captain",
        "description": "Leagues: Old World Classic"
    },
    {
        "name": "Lizardmen",
        "specialRules": "None",
        "rerollCost": 70000,
        "tier": 1,
        "apothecary": "Yes",
        "image": "https://raw.githubusercontent.com/jaz206/Bloodbowl-image/main/Escudos/Lizardmen.png",
        "ratings": {
            "fuerza": 65,
            "agilidad": 60,
            "velocidad": 81,
            "armadura": 90,
            "pase": 45
        },
        "roster": [
            {
                "qty": "0-16",
                "position": "Skink Lineman",
                "cost": 60000,
                "stats": {
                    "MV": 8,
                    "FU": "2",
                    "AG": "3+",
                    "PA": "4+",
                    "AR": "8+"
                },
                "skillKeys": [
                    "Stunty",
                    "Dodge"
                ],
                "primary": "A",
                "secondary": "FGPT"
            },
            {
                "qty": "0-2",
                "position": "Chameleon Skink",
                "cost": 70000,
                "stats": {
                    "MV": 7,
                    "FU": "2",
                    "AG": "3+",
                    "PA": "3+",
                    "AR": "8+"
                },
                "skillKeys": [
                    "On the Ball",
                    "Stunty",
                    "Dodge",
                    "Shadowing"
                ],
                "primary": "AP",
                "secondary": "FGT"
            },
            {
                "qty": "0-6",
                "position": "Saurus",
                "cost": 90000,
                "stats": {
                    "MV": 6,
                    "FU": "4",
                    "AG": "5+",
                    "PA": "6+",
                    "AR": "10+"
                },
                "skillKeys": [
                    "Juggernaut",
                    "Thick Skull"
                ],
                "primary": "FG",
                "secondary": "A"
            },
            {
                "qty": "0-1",
                "position": "Kroxigor",
                "cost": 140000,
                "stats": {
                    "MV": 6,
                    "FU": "5",
                    "AG": "5+",
                    "PA": "6+",
                    "AR": "10+"
                },
                "skillKeys": [
                    "Bone Head",
                    "Prehensile Tail",
                    "Mighty Blow (+1)",
                    "Really Stupid",
                    "Loner (4+)"
                ],
                "primary": "F",
                "secondary": "AG"
            }
        ],
        "specialRules_es": "Ninguna",
        "specialRules_en": "None",
        "description": "Leagues: Lustrian Superleague"
    },
    {
        "name": "Necromantic Horror",
        "specialRules": "Masters of Undeath",
        "rerollCost": 70000,
        "tier": 2,
        "apothecary": "No",
        "image": "https://raw.githubusercontent.com/jaz206/Bloodbowl-image/main/Escudos/Necromantic%20Horror.png",
        "ratings": {
            "fuerza": 72,
            "agilidad": 68,
            "velocidad": 72,
            "armadura": 87,
            "pase": 42
        },
        "roster": [
            {
                "qty": "0-16",
                "position": "Zombie",
                "cost": 40000,
                "stats": {
                    "MV": 4,
                    "FU": "3",
                    "AG": "4+",
                    "PA": "6+",
                    "AR": "9+"
                },
                "skillKeys": [
                    "Sneaky Git",
                    "Thick Skull",
                    "Regeneration"
                ],
                "primary": "GT",
                "secondary": "AF"
            },
            {
                "qty": "0-2",
                "position": "Ghoul",
                "cost": 75000,
                "stats": {
                    "MV": 7,
                    "FU": "3",
                    "AG": "3+",
                    "PA": "3+",
                    "AR": "8+"
                },
                "skillKeys": [
                    "Dodge",
                    "Regeneration"
                ],
                "primary": "AG",
                "secondary": "FPT"
            },
            {
                "qty": "0-2",
                "position": "Wraith",
                "cost": 95000,
                "stats": {
                    "MV": 6,
                    "FU": "3",
                    "AG": "3+",
                    "PA": "-",
                    "AR": "9+"
                },
                "skillKeys": [
                    "Foul Appearance",
                    "Side Step",
                    "Block",
                    "Regeneration",
                    "No Hands"
                ],
                "primary": "FG",
                "secondary": "AT"
            },
            {
                "qty": "0-2",
                "position": "Flesh Golem",
                "cost": 115000,
                "stats": {
                    "MV": 4,
                    "FU": "4",
                    "AG": "4+",
                    "PA": "-",
                    "AR": "10+"
                },
                "skillKeys": [
                    "Thick Skull",
                    "Stand Firm",
                    "Regeneration"
                ],
                "primary": "FG",
                "secondary": "AT"
            },
            {
                "qty": "0-2",
                "position": "Werewolf",
                "cost": 120000,
                "stats": {
                    "MV": 8,
                    "FU": "3",
                    "AG": "3+",
                    "PA": "3+",
                    "AR": "9+"
                },
                "skillKeys": [
                    "Frenzy",
                    "Claws",
                    "Regeneration"
                ],
                "primary": "AG",
                "secondary": "FPT"
            }
        ],
        "specialRules_es": "Se?ores de los No Muertos",
        "specialRules_en": "Masters of Undeath",
        "description": "Leagues: Sylvanian Selective"
    },
    {
        "name": "Norse",
        "specialRules": "If in Chaos Cup, gain Chosen of Khorne",
        "rerollCost": 60000,
        "tier": 1,
        "apothecary": "Yes",
        "image": "https://raw.githubusercontent.com/jaz206/Bloodbowl-image/main/Escudos/Norse.png",
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
                    "PA": "4+",
                    "AR": "8+"
                },
                "skillKeys": [
                    "Drunkard",
                    "Thick Skull",
                    "Block"
                ],
                "primary": "G",
                "secondary": "AFP"
            },
            {
                "qty": "0-2",
                "position": "Beer Boar",
                "cost": 20000,
                "stats": {
                    "MV": 5,
                    "FU": "1",
                    "AG": "3+",
                    "PA": "-",
                    "AR": "6+"
                },
                "skillKeys": [
                    "Titchy",
                    "Stunty",
                    "Dodge",
                    "Pickup Team-mate",
                    "No Hands"
                ],
                "primary": "-",
                "secondary": "A"
            },
            {
                "qty": "0-2",
                "position": "Berserker",
                "cost": 90000,
                "stats": {
                    "MV": 6,
                    "FU": "3",
                    "AG": "3+",
                    "PA": "5+",
                    "AR": "8+"
                },
                "skillKeys": [
                    "Jump Up",
                    "Frenzy",
                    "Block"
                ],
                "primary": "FG",
                "secondary": "AP"
            },
            {
                "qty": "0-2",
                "position": "Valkyrie",
                "cost": 95000,
                "stats": {
                    "MV": 7,
                    "FU": "3",
                    "AG": "3+",
                    "PA": "3+",
                    "AR": "8+"
                },
                "skillKeys": [
                    "Catch",
                    "Dauntless",
                    "Pass",
                    "Strip Ball"
                ],
                "primary": "AGP",
                "secondary": "F"
            },
            {
                "qty": "0-2",
                "position": "Ulfwerener",
                "cost": 105000,
                "stats": {
                    "MV": 6,
                    "FU": "4",
                    "AG": "4+",
                    "PA": "6+",
                    "AR": "9+"
                },
                "skillKeys": [
                    "Frenzy",
                    "Thick Skull"
                ],
                "primary": "FG",
                "secondary": "A"
            },
            {
                "qty": "0-2",
                "position": "Yeti",
                "cost": 140000,
                "stats": {
                    "MV": 5,
                    "FU": "5",
                    "AG": "4+",
                    "PA": "6+",
                    "AR": "9+"
                },
                "skillKeys": [
                    "Frenzy",
                    "Claws",
                    "Unchannelled Fury",
                    "Disturbing Presence",
                    "Loner (4+)"
                ],
                "primary": "F",
                "secondary": "AG"
            }
        ],
        "specialRules_es": "Si es Competici?n del Caos, gana Elegidos de Khorne",
        "specialRules_en": "If in Chaos Cup, gain Chosen of Khorne",
        "description": "Leagues: Old World Classic or Chaos Cup"
    },
    {
        "name": "Nurgle",
        "specialRules": "Brutal Bruisers, Chosen of Nurgle",
        "rerollCost": 60000,
        "tier": 3,
        "apothecary": "No",
        "image": "https://raw.githubusercontent.com/jaz206/Bloodbowl-image/main/Escudos/Nurgle.png",
        "ratings": {
            "fuerza": 75,
            "agilidad": 65,
            "velocidad": 57,
            "armadura": 95,
            "pase": 30
        },
        "roster": [
            {
                "qty": "0-12",
                "position": "Rotter Lineman",
                "cost": 40000,
                "stats": {
                    "MV": 5,
                    "FU": "3",
                    "AG": "4+",
                    "PA": "6+",
                    "AR": "9+"
                },
                "skillKeys": [
                    "Decay",
                    "Nurgle?s Rot"
                ],
                "primary": "GMT",
                "secondary": "AF"
            },
            {
                "qty": "0-2",
                "position": "Pestigor",
                "cost": 70000,
                "stats": {
                    "MV": 6,
                    "FU": "3",
                    "AG": "3+",
                    "PA": "4+",
                    "AR": "9+"
                },
                "skillKeys": [
                    "Thick Skull",
                    "Horns",
                    "Sure Feet",
                    "Nurgle?s Rot",
                    "Regeneration"
                ],
                "primary": "FGM",
                "secondary": "APT"
            },
            {
                "qty": "0-4",
                "position": "Bloater",
                "cost": 110000,
                "stats": {
                    "MV": 4,
                    "FU": "4",
                    "AG": "4+",
                    "PA": "6+",
                    "AR": "10+"
                },
                "skillKeys": [
                    "Foul Appearance",
                    "Thick Skull",
                    "Stand Firm",
                    "Disturbing Presence",
                    "Nurgle?s Rot",
                    "Regeneration"
                ],
                "primary": "FGM",
                "secondary": "AT"
            },
            {
                "qty": "0-1",
                "position": "Rotspawn",
                "cost": 140000,
                "stats": {
                    "MV": 4,
                    "FU": "5",
                    "AG": "5+",
                    "PA": "6+",
                    "AR": "10+"
                },
                "skillKeys": [
                    "Foul Appearance",
                    "Mighty Blow (+1)",
                    "Pickup Team-mate",
                    "Disturbing Presence",
                    "Nurgle?s Rot",
                    "Regeneration",
                    "Really Stupid",
                    "Loner (4+)",
                    "Tentacles"
                ],
                "primary": "F",
                "secondary": "GMT"
            }
        ],
        "specialRules_es": "Brutos brutales, Elegidos de Nurgle",
        "specialRules_en": "Brutal Bruisers, Chosen of Nurgle",
        "description": "Leagues: Chaos Cup"
    },
    {
        "name": "Ogres",
        "specialRules": "Brutal Bruisers, Low Cost Linemen",
        "rerollCost": 70000,
        "tier": 4,
        "apothecary": "Yes",
        "image": "https://raw.githubusercontent.com/jaz206/Bloodbowl-image/main/Escudos/Ogres.png",
        "ratings": {
            "fuerza": 73,
            "agilidad": 67,
            "velocidad": 60,
            "armadura": 87,
            "pase": 47
        },
        "roster": [
            {
                "qty": "0-16",
                "position": "Gnoblar Lineman",
                "cost": 15000,
                "stats": {
                    "MV": 5,
                    "FU": "1",
                    "AG": "3+",
                    "PA": "4+",
                    "AR": "6+"
                },
                "skillKeys": [
                    "Titchy",
                    "Side Step",
                    "Stunty",
                    "Dodge",
                    "Right Stuff"
                ],
                "primary": "AT",
                "secondary": "G"
            },
            {
                "qty": "0-1",
                "position": "Ogre",
                "cost": 140000,
                "stats": {
                    "MV": 5,
                    "FU": "5",
                    "AG": "4+",
                    "PA": "5+",
                    "AR": "10+"
                },
                "skillKeys": [
                    "Bone Head",
                    "Mighty Blow (+1)",
                    "Really Stupid",
                    "Throw Team-mate"
                ],
                "primary": "F",
                "secondary": "AGPT"
            },
            {
                "qty": "0-1",
                "position": "Runt Punter",
                "cost": 145000,
                "stats": {
                    "MV": 5,
                    "FU": "5",
                    "AG": "4+",
                    "PA": "4+",
                    "AR": "10+"
                },
                "skillKeys": [
                    "Bone Head",
                    "Kick Team-mate",
                    "Mighty Blow (+1)",
                    "Thick Skull"
                ],
                "primary": "FP",
                "secondary": "AGT"
            }
        ],
        "specialRules_es": "Brutos brutales, L?neas prescindibles",
        "specialRules_en": "Brutal Bruisers, Low Cost Linemen",
        "description": "Leagues: Old World Classic or Badlands Brawl"
    },
    {
    "name": "Old World Alliance",
    "specialRules": "None",
    "rerollCost": 70000,
    "tier": 1,
    "apothecary": "Yes",
    "image": "https://raw.githubusercontent.com/jaz206/Bloodbowl-image/main/Escudos/Old%20World%20Alliance.png",
    "ratings": {
        "fuerza": 61,
        "agilidad": 70,
        "velocidad": 63,
        "armadura": 91,
        "pase": 56
    },
    "roster": [
        {
            "qty": "0-12",
            "position": "Human Lineman",
            "cost": 50000,
            "stats": {
                "MV": 6,
                "FU": "3",
                "AG": "3+",
                "PA": "4+",
                "AR": "9+"
            },
            "skillKeys": [],
            "primary": "G",
            "secondary": "AS"
        },
        {
            "qty": "0-1",
            "position": "Human Catcher",
            "cost": 75000,
            "stats": {
                "MV": 8,
                "FU": "3",
                "AG": "3+",
                "PA": "4+",
                "AR": "8+"
            },
            "skillKeys": [
                "Catch",
                "Dodge"
            ],
            "primary": "AG",
            "secondary": "SP"
        },
        {
            "qty": "0-1",
            "position": "Human Thrower",
            "cost": 75000,
            "stats": {
                "MV": 6,
                "FU": "3",
                "AG": "3+",
                "PA": "3+",
                "AR": "9+"
            },
            "skillKeys": [
                "Sure Hands",
                "Pass"
            ],
            "primary": "GP",
            "secondary": "AS"
        },
        {
            "qty": "0-1",
            "position": "Human Blitzer",
            "cost": 85000,
            "stats": {
                "MV": 7,
                "FU": "3",
                "AG": "3+",
                "PA": "4+",
                "AR": "9+"
            },
            "skillKeys": [
                "Defensive",
                "Block"
            ],
            "primary": "GS",
            "secondary": "A"
        },
        {
            "qty": "0-3",
            "position": "Dwarf Blocker",
            "cost": 70000,
            "stats": {
                "MV": 4,
                "FU": "3",
                "AG": "4+",
                "PA": "5+",
                "AR": "10+"
            },
            "skillKeys": [
                "Thick Skull",
                "Block",
                "Defensive"
            ],
            "primary": "GS",
            "secondary": "A"
        },
        {
            "qty": "0-1",
            "position": "Dwarf Blitzer",
            "cost": 100000,
            "stats": {
                "MV": 5,
                "FU": "3",
                "AG": "4+",
                "PA": "4+",
                "AR": "10+"
            },
            "skillKeys": [
                "Thick Skull",
                "Defensive",
                "Arm Bar",
                "Block"
            ],
            "primary": "GS",
            "secondary": "P"
        },
        {
            "qty": "0-1",
            "position": "Dwarf Runner",
            "cost": 80000,
            "stats": {
                "MV": 6,
                "FU": "3",
                "AG": "3+",
                "PA": "4+",
                "AR": "9+"
            },
            "skillKeys": [
                "Thick Skull",
                "Sure Hands",
                "Sprint"
            ],
            "primary": "GP",
            "secondary": "AS"
        },
        {
            "qty": "0-1",
            "position": "Dwarf Troll Slayer",
            "cost": 95000,
            "stats": {
                "MV": 5,
                "FU": "3",
                "AG": "4+",
                "PA": "5+",
                "AR": "9+"
            },
            "skillKeys": [
                "Dauntless",
                "Thick Skull",
                "Frenzy",
                "Block",
                "Hate (Troll)"
            ],
            "primary": "GS",
            "secondary": "A"
        },
        {
            "qty": "0-3",
            "position": "Halfling Hopeful",
            "cost": 30000,
            "stats": {
                "MV": 5,
                "FU": "2",
                "AG": "3+",
                "PA": "4+",
                "AR": "7+"
            },
            "skillKeys": [
                "Right Stuff",
                "Dodge",
                "Stunty"
            ],
            "primary": "A",
            "secondary": "GS"
        },
        {
            "qty": "0-1",
            "position": "Altern Forest Treeman",
            "cost": 120000,
            "stats": {
                "MV": 2,
                "FU": "6",
                "AG": "5+",
                "PA": "5+",
                "AR": "11+"
            },
            "skillKeys": [
                "Strong Arm",
                "Thick Skull",
                "Mighty Blow (+1)",
                "Take Root",
                "Throw Team-mate",
                "Stand Firm",
                "Timmm-ber!"
            ],
            "primary": "S",
            "secondary": "AGP"
        },
        {
            "qty": "0-1",
            "position": "Ogre",
            "cost": 140000,
            "stats": {
                "MV": 5,
                "FU": "5",
                "AG": "4+",
                "PA": "5+",
                "AR": "10+"
            },
            "skillKeys": [
                "Thick Skull",
                "Mighty Blow (+1)",
                "Bone Head",
                "Throw Team-mate",
                "Loner (3+)"
            ],
            "primary": "S",
            "secondary": "AG"
        }
    ],
    "specialRules_es": "Ninguna",
    "specialRules_en": "None",
    "description": "League: Old World Classic"
},
    {
    "name": "Bretonnians",
    "specialRules": "None",
    "rerollCost": 60000,
    "tier": 2,
    "apothecary": "Yes",
    "image": "https://raw.githubusercontent.com/jaz206/Bloodbowl-image/main/Escudos/Bretonnians.png",
    "ratings": {
        "fuerza": 64,
        "agilidad": 73,
        "velocidad": 72,
        "armadura": 88,
        "pase": 58
    },
    "roster": [
        {
            "qty": "0-16",
            "position": "Squire",
            "cost": 50000,
            "stats": {
                "MV": 6,
                "FU": "3",
                "AG": "3+",
                "PA": "4+",
                "AR": "8+"
            },
            "skillKeys": [
                "Wrestle"
            ],
            "primary": "G",
            "secondary": "AS"
        },
        {
            "qty": "0-2",
            "position": "Knight Receiver",
            "cost": 85000,
            "stats": {
                "MV": 7,
                "FU": "3",
                "AG": "3+",
                "PA": "4+",
                "AR": "9+"
            },
            "skillKeys": [
                "Dauntless",
                "Catch",
                "Nerves of Steel"
            ],
            "primary": "AG",
            "secondary": "S"
        },
        {
            "qty": "0-2",
            "position": "Knight Thrower",
            "cost": 80000,
            "stats": {
                "MV": 6,
                "FU": "3",
                "AG": "3+",
                "PA": "3+",
                "AR": "9+"
            },
            "skillKeys": [
                "Dauntless",
                "Nerves of Steel",
                "Pass"
            ],
            "primary": "GP",
            "secondary": "AS"
        },
        {
            "qty": "0-2",
            "position": "Grail Knight",
            "cost": 95000,
            "stats": {
                "MV": 7,
                "FU": "3",
                "AG": "3+",
                "PA": "4+",
                "AR": "10+"
            },
            "skillKeys": [
                "Dauntless",
                "Stand Firm",
                "Block"
            ],
            "primary": "GS",
            "secondary": "A"
        }
    ],
    "specialRules_es": "Ninguna",
    "specialRules_en": "None",
    "description": "League: Old World Classic"
},
    {
        "name": "Imperial Nobility",
        "specialRules": "None",
        "rerollCost": 60000,
        "tier": 2,
        "apothecary": "Yes",
        "image": "https://raw.githubusercontent.com/jaz206/Bloodbowl-image/main/Escudos/Imperial%20Nobility.png",
        "ratings": {
            "fuerza": 60,
            "agilidad": 75,
            "velocidad": 66,
            "armadura": 86,
            "pase": 58
        },
        "roster": [
            {
                "qty": "0-16",
                "position": "Imperial Retainer Lineman",
                "cost": 45000,
                "stats": {
                    "MV": 6,
                    "FU": "3",
                    "AG": "3+",
                    "PA": "4+",
                    "AR": "8+"
                },
                "skillKeys": [
                    "Fend"
                ],
                "primary": "G",
                "secondary": "AF"
            },
            {
                "qty": "0-2",
                "position": "Imperial Thrower",
                "cost": 75000,
                "stats": {
                    "MV": 6,
                    "FU": "3",
                    "AG": "3+",
                    "PA": "2+",
                    "AR": "9+"
                },
                "skillKeys": [
                    "Running Pass",
                    "Pro"
                ],
                "primary": "GP",
                "secondary": "AF"
            },
            {
                "qty": "0-4",
                "position": "Bodyguard",
                "cost": 85000,
                "stats": {
                    "MV": 5,
                    "FU": "3",
                    "AG": "3+",
                    "PA": "4+",
                    "AR": "9+"
                },
                "skillKeys": [
                    "Wrestle",
                    "Stand Firm"
                ],
                "primary": "FG",
                "secondary": "A"
            },
            {
                "qty": "0-2",
                "position": "Noble Blitzer",
                "cost": 90000,
                "stats": {
                    "MV": 7,
                    "FU": "3",
                    "AG": "3+",
                    "PA": "4+",
                    "AR": "9+"
                },
                "skillKeys": [
                    "Catch",
                    "Block",
                    "Pro"
                ],
                "primary": "AG",
                "secondary": "FP"
            },
            {
                "qty": "0-1",
                "position": "Ogre",
                "cost": 140000,
                "stats": {
                    "MV": 5,
                    "FU": "5",
                    "AG": "4+",
                    "PA": "5+",
                    "AR": "10+"
                },
                "skillKeys": [
                    "Bone Head",
                    "Mighty Blow (+1)",
                    "Really Stupid",
                    "Throw Team-mate",
                    "Loner (3+)"
                ],
                "primary": "F",
                "secondary": "AG"
            }
        ],
        "specialRules_es": "Ninguna",
        "specialRules_en": "None",
        "description": "Leagues: Old World Classic"
    },
    {
        "name": "Khorne",
        "specialRules": "Brutal Bruisers, Chosen of Khorne",
        "rerollCost": 60000,
        "tier": 3,
        "apothecary": "Yes",
        "image": "https://raw.githubusercontent.com/jaz206/Bloodbowl-image/main/Escudos/Khorne.png",
        "ratings": {
            "fuerza": 82,
            "agilidad": 60,
            "velocidad": 68,
            "armadura": 88,
            "pase": 42
        },
        "roster": [
            {
                "qty": "0-16",
                "position": "Bloodborn Marauder",
                "cost": 50000,
                "stats": {
                    "MV": 6,
                    "FU": "3",
                    "AG": "3+",
                    "PA": "4+",
                    "AR": "8+"
                },
                "skillKeys": [
                    "Frenzy"
                ],
                "primary": "GM",
                "secondary": "AFT"
            },
            {
                "qty": "0-2",
                "position": "Khorngor",
                "cost": 70000,
                "stats": {
                    "MV": 6,
                    "FU": "3",
                    "AG": "3+",
                    "PA": "4+",
                    "AR": "9+"
                },
                "skillKeys": [
                    "Thick Skull",
                    "Horns",
                    "Jump Up",
                    "Juggernaut"
                ],
                "primary": "FGM",
                "secondary": "APT"
            },
            {
                "qty": "0-4",
                "position": "Bloodseeker",
                "cost": 105000,
                "stats": {
                    "MV": 5,
                    "FU": "4",
                    "AG": "4+",
                    "PA": "6+",
                    "AR": "10+"
                },
                "skillKeys": [
                    "Frenzy"
                ],
                "primary": "FGM",
                "secondary": "AT"
            },
            {
                "qty": "0-1",
                "position": "Bloodspawn",
                "cost": 160000,
                "stats": {
                    "MV": 5,
                    "FU": "5",
                    "AG": "4+",
                    "PA": "6+",
                    "AR": "9+"
                },
                "skillKeys": [
                    "Frenzy",
                    "Claws",
                    "Mighty Blow (+1)",
                    "Unchannelled Fury",
                    "Loner (4+)"
                ],
                "primary": "FM",
                "secondary": "AG"
            }
        ],
        "specialRules_es": "Brutos brutales, Elegidos de Khorne",
        "specialRules_en": "Brutal Bruisers, Chosen of Khorne",
        "description": "Leagues: Chaos Cup"
    },
    {
        "name": "Snotling",
        "specialRules": "Swarming, Low Cost Linemen, Bribery and Corruption",
        "rerollCost": 70000,
        "tier": 4,
        "apothecary": "Yes",
        "image": "https://raw.githubusercontent.com/jaz206/Bloodbowl-image/main/Escudos/Snotling.png",
        "ratings": {
            "fuerza": 32,
            "agilidad": 88,
            "velocidad": 73,
            "armadura": 54,
            "pase": 44
        },
        "roster": [
            {
                "qty": "0-16",
                "position": "Snotling",
                "cost": 15000,
                "stats": {
                    "MV": 5,
                    "FU": "1",
                    "AG": "3+",
                    "PA": "4+",
                    "AR": "6+"
                },
                "skillKeys": [
                    "Titchy",
                    "Sneaky Git",
                    "Side Step",
                    "Stunty",
                    "Dodge",
                    "Right Stuff"
                ],
                "primary": "AT",
                "secondary": "G"
            },
            {
                "qty": "0-2",
                "position": "Fun-Hopper",
                "cost": 20000,
                "stats": {
                    "MV": 6,
                    "FU": "1",
                    "AG": "3+",
                    "PA": "4+",
                    "AR": "6+"
                },
                "skillKeys": [
                    "Side Step",
                    "Stunty",
                    "Stunty",
                    "Dodge",
                    "Pogo Stick"
                ],
                "primary": "AT",
                "secondary": "G"
            },
            {
                "qty": "0-2",
                "position": "Stilty Runna",
                "cost": 20000,
                "stats": {
                    "MV": 6,
                    "FU": "1",
                    "AG": "3+",
                    "PA": "4+",
                    "AR": "6+"
                },
                "skillKeys": [
                    "Side Step",
                    "Stunty",
                    "Dodge",
                    "Sprint",
                    "Right Stuff"
                ],
                "primary": "AT",
                "secondary": "G"
            },
            {
                "qty": "0-2",
                "position": "Fungus Flinga",
                "cost": 30000,
                "stats": {
                    "MV": 5,
                    "FU": "1",
                    "AG": "3+",
                    "PA": "4+",
                    "AR": "6+"
                },
                "skillKeys": [
                    "Secret Weapon",
                    "Bombardier",
                    "Titchy",
                    "Dodge",
                    "Side Step",
                    "Stunty",
                    "Right Stuff"
                ],
                "primary": "APT",
                "secondary": "G"
            },
            {
                "qty": "0-2",
                "position": "Pump Wagon",
                "cost": 100000,
                "stats": {
                    "MV": 5,
                    "FU": "5",
                    "AG": "5+",
                    "PA": "6+",
                    "AR": "9+"
                },
                "skillKeys": [
                    "Mighty Blow (+1)",
                    "Juggernaut",
                    "Dirty Player (+1)",
                    "Stand Firm",
                    "Really Stupid"
                ],
                "primary": "FT",
                "secondary": "AG"
            },
            {
                "qty": "0-1",
                "position": "Trained Troll",
                "cost": 115000,
                "stats": {
                    "MV": 4,
                    "FU": "5",
                    "AG": "5+",
                    "PA": "5+",
                    "AR": "10+"
                },
                "skillKeys": [
                    "Mighty Blow (+1)",
                    "Throw Team-mate",
                    "Projectile Vomit",
                    "Really Stupid",
                    "Regeneration",
                    "Always Hungry"
                ],
                "primary": "F",
                "secondary": "AGP"
            }
        ],
        "specialRules_es": "Colarse, L?neas prescindibles, Soborno y corrupci?n",
        "specialRules_en": "Swarming, Low Cost Linemen, Bribery and Corruption",
        "description": "Leagues: Underworld Challenge"
    },
{
    "name": "Vampires",
    "specialRules": "Lords of the Undead",
    "rerollCost": 60000,
    "tier": 2,
    "apothecary": "Yes",
    "image": "https://raw.githubusercontent.com/jaz206/Bloodbowl-image/main/Escudos/Vampires.png",
    "ratings": {
        "fuerza": 76,
        "agilidad": 88,
        "velocidad": 74,
        "armadura": 88,
        "pase": 57
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
                "PA": "4+",
                "AR": "8+"
            },
            "skillKeys": [],
            "primary": "G",
            "secondary": "AS"
        },
        {
            "qty": "0-2",
            "position": "Vampire Runner",
            "cost": 100000,
            "stats": {
                "MV": 8,
                "FU": "3",
                "AG": "2+",
                "PA": "3+",
                "AR": "8+"
            },
            "skillKeys": [
                "Bloodlust (2+)",
                "Hypnotic Gaze",
                "Regeneration"
            ],
            "primary": "AG",
            "secondary": "SP"
        },
        {
            "qty": "0-2",
            "position": "Vampire Thrower",
            "cost": 110000,
            "stats": {
                "MV": 6,
                "FU": "4",
                "AG": "2+",
                "PA": "2+",
                "AR": "9+"
            },
            "skillKeys": [
                "Bloodlust (2+)",
                "Hypnotic Gaze",
                "Pass",
                "Regeneration"
            ],
            "primary": "AGP",
            "secondary": "S"
        },
        {
            "qty": "0-2",
            "position": "Vampire Blitzer",
            "cost": 110000,
            "stats": {
                "MV": 6,
                "FU": "4",
                "AG": "2+",
                "PA": "4+",
                "AR": "9+"
            },
            "skillKeys": [
                "Bloodlust (3+)",
                "Juggernaut",
                "Hypnotic Gaze",
                "Regeneration"
            ],
            "primary": "AGS",
            "secondary": ""
        },
        {
            "qty": "0-1",
            "position": "Vargheist",
            "cost": 150000,
            "stats": {
                "MV": 5,
                "FU": "5",
                "AG": "4+",
                "PA": "6+",
                "AR": "10+"
            },
            "skillKeys": [
                "Bloodlust (3+)",
                "Claws",
                "Frenzy",
                "Loner (4+)",
                "Regeneration"
            ],
            "primary": "S",
            "secondary": "AG"
        }
    ],
    "specialRules_es": "Se?ores de los No Muertos",
    "specialRules_en": "Lords of the Undead",
    "description": "League: Sylvanian Selective"
},
{
    "name": "Wood Elves",
    "specialRules": "None",
    "rerollCost": 50000,
    "tier": 1,
    "apothecary": "Yes",
    "image": "https://raw.githubusercontent.com/jaz206/Bloodbowl-image/main/Escudos/Wood%20Elves.png",
    "ratings": {
        "fuerza": 68,
        "agilidad": 89,
        "velocidad": 79,
        "armadura": 84,
        "pase": 63
    },
    "roster": [
        {
            "qty": "0-16",
            "position": "Wood Elf Lineman",
            "cost": 65000,
            "stats": {
                "MV": 7,
                "FU": "3",
                "AG": "2+",
                "PA": "3+",
                "AR": "8+"
            },
            "skillKeys": [],
            "primary": "AG",
            "secondary": "S"
        },
        {
            "qty": "0-2",
            "position": "Thrower",
            "cost": 85000,
            "stats": {
                "MV": 7,
                "FU": "3",
                "AG": "2+",
                "PA": "2+",
                "AR": "8+"
            },
            "skillKeys": [
                "Safe Pass",
                "Pass"
            ],
            "primary": "AGP",
            "secondary": "S"
        },
        {
            "qty": "0-2",
            "position": "Catcher",
            "cost": 90000,
            "stats": {
                "MV": 8,
                "FU": "2",
                "AG": "2+",
                "PA": "3+",
                "AR": "8+"
            },
            "skillKeys": [
                "Catch",
                "Dodge",
                "Sprint"
            ],
            "primary": "AG",
            "secondary": "SP"
        },
        {
            "qty": "0-2",
            "position": "Wardancer",
            "cost": 130000,
            "stats": {
                "MV": 8,
                "FU": "3",
                "AG": "2+",
                "PA": "3+",
                "AR": "8+"
            },
            "skillKeys": [
                "Dodge",
                "Block",
                "Leap"
            ],
            "primary": "AG",
            "secondary": "SP"
        },
        {
            "qty": "0-1",
            "position": "Loren Treeman",
            "cost": 120000,
            "stats": {
                "MV": 2,
                "FU": "6",
                "AG": "5+",
                "PA": "5+",
                "AR": "11+"
            },
            "skillKeys": [
                "Strong Arm",
                "Thick Skull",
                "Mighty Blow (+1)",
                "Take Root",
                "Throw Team-mate",
                "Stand Firm",
                "Loner (4+)"
            ],
            "primary": "S",
            "secondary": "AG"
        }
    ],
    "specialRules_es": "Ninguna",
    "specialRules_en": "None",
    "description": "Leagues: Elven Kingdoms League, Forest League"
},
{
    "name": "Slann (NAF)",
    "specialRules": "NAF Pending Approval",
    "rerollCost": 50000,
    "tier": 2,
    "apothecary": "Yes",
    "image": "https://raw.githubusercontent.com/jaz206/Bloodbowl-image/main/Escudos/Slann%20(NAF).png",
    "ratings": {
        "fuerza": 66,
        "agilidad": 77,
        "velocidad": 78,
        "armadura": 90,
        "pase": 50
    },
    "roster": [
        {
            "qty": "0-16",
            "position": "Slann Lineman",
            "cost": 60000,
            "stats": {
                "MV": 6,
                "FU": "3",
                "AG": "3+",
                "PA": "4+",
                "AR": "9+"
            },
            "skillKeys": [
                "Very Long Legs",
                "Pogo Stick"
            ],
            "primary": "G",
            "secondary": "AS"
        },
        {
            "qty": "0-4",
            "position": "Slann Catcher",
            "cost": 80000,
            "stats": {
                "MV": 7,
                "FU": "2",
                "AG": "2+",
                "PA": "4+",
                "AR": "8+"
            },
            "skillKeys": [
                "Very Long Legs",
                "Pogo Stick",
                "Diving Catch"
            ],
            "primary": "AG",
            "secondary": "SP"
        },
        {
            "qty": "0-2",
            "position": "Slann Blitzer",
            "cost": 110000,
            "stats": {
                "MV": 7,
                "FU": "3",
                "AG": "3+",
                "PA": "4+",
                "AR": "9+"
            },
            "skillKeys": [
                "Jump Up",
                "Defensive",
                "Very Long Legs",
                "Pogo Stick"
            ],
            "primary": "AGS",
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
                "PA": "6+",
                "AR": "10+"
            },
            "skillKeys": [
                "Bone Head",
                "Prehensile Tail",
                "Mighty Blow (+1)",
                "Loner (4+)",
                "Thick Skull"
            ],
            "primary": "S",
            "secondary": "AG"
        }
    ],
    "specialRules_es": "Pendiente de aprobaci?n por la NAF",
    "specialRules_en": "NAF Pending Approval",
    "description": "League: Lustrian Superleague"
}
];
