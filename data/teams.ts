import type { Team } from '../types';

export const teamsData: Team[] = [
    {
        "name":  "Amazonas",
        "specialRules":  "Superliga Lustria, GestiÃ³n de Equipo",
        "rerollCost":  50000,
        "tier":  1,
        "apothecary":  "SÃ­",
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
                           "position":  "Eagle Guerrero LÃ­nea",
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
                           "position":  "Python Guerrero Lanzador",
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
                           "qty":  "0-16",
                           "position":  "Jaguar Guerrero Bloqueador",
                           "cost":  110000,
                           "stats":  {
                                         "MV":  6,
                                         "FU":  "4",
                                         "AG":  "3+",
                                         "PA":  "5+",
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
                           "position":  "Piranha Guerrero Placador",
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
                                             "Leap"
                                         ],
                           "primary":  "AG",
                           "secondary":  "S"
                       }
                   ],
        "specialRules_es":  "Superliga Lustria, GestiÃ³n de Equipo",
        "specialRules_en":  "Superliga Lustria, GestiÃ³n de Equipo"
    },
    {
        "name":  "Orcos Negros",
        "specialRules":  "Pelea de Badlands, GestiÃ³n de Equipo, Soborno y CorrupciÃ³n",
        "rerollCost":  50000,
        "tier":  3,
        "apothecary":  "SÃ­",
        "image":  "https://raw.githubusercontent.com/jaz206/Bloodbowl-image/main/Escudos/Orcos%20Negros.png",
        "ratings":  {
                        "fuerza":  73,
                        "agilidad":  60,
                        "velocidad":  56,
                        "armadura":  93,
                        "pase":  47
                    },
        "roster":  [
                       {
                           "qty":  "0-12",
                           "position":  "Goblins Bruiser LÃ­nea",
                           "cost":  45000,
                           "stats":  {
                                         "MV":  6,
                                         "FU":  "2",
                                         "AG":  "3+",
                                         "PA":  "4+",
                                         "AR":  "8+"
                                     },
                           "skillKeys":  [
                                             "Dodge",
                                             "Right Stuff",
                                             "Stunty",
                                             "Thick Skull"
                                         ],
                           "primary":  "A",
                           "secondary":  "GPS"
                       },
                       {
                           "qty":  "0-6",
                           "position":  "Orcos Negros",
                           "cost":  90000,
                           "stats":  {
                                         "MV":  4,
                                         "FU":  "4",
                                         "AG":  "4+",
                                         "PA":  "5+",
                                         "AR":  "10+"
                                     },
                           "skillKeys":  [
                                             "Brawler",
                                             "Grab"
                                         ],
                           "primary":  "GS",
                           "secondary":  "AP"
                       },
                       {
                           "qty":  "0-1",
                           "position":  "Trained Troll",
                           "cost":  115000,
                           "stats":  {
                                         "MV":  4,
                                         "FU":  "5",
                                         "AG":  "5+",
                                         "PA":  "5+",
                                         "AR":  "10+"
                                     },
                           "skillKeys":  [
                                             "Always Hungry",
                                             "Loner (3+)",
                                             "Mighty Blow (+1)",
                                             "Projectile Vomit",
                                             "Really Stupid",
                                             "Regeneration",
                                             "Throw Team-mate"
                                         ],
                           "primary":  "S",
                           "secondary":  "AGP"
                       }
                   ],
        "specialRules_es":  "Pelea de Badlands, GestiÃ³n de Equipo, Soborno y CorrupciÃ³n",
        "specialRules_en":  "Pelea de Badlands, GestiÃ³n de Equipo, Soborno y CorrupciÃ³n"
    },
    {
        "name":  "Elegidos del Caos",
        "specialRules":  "Favorito de..., GestiÃ³n de Equipo",
        "rerollCost":  50000,
        "tier":  2,
        "apothecary":  "SÃ­",
        "image":  "https://raw.githubusercontent.com/jaz206/Bloodbowl-image/main/Escudos/Elegidos%20del%20Caos.png",
        "ratings":  {
                        "fuerza":  80,
                        "agilidad":  80,
                        "velocidad":  60,
                        "armadura":  100,
                        "pase":  40
                    },
        "roster":  [
                       {
                           "qty":  "0-16",
                           "position":  "Bestia del Caos",
                           "cost":  60000,
                           "stats":  {
                                         "MV":  6,
                                         "FU":  "3",
                                         "AG":  "3+",
                                         "PA":  "4+",
                                         "AR":  "9+"
                                     },
                           "skillKeys":  [
                                             "Horns"
                                         ],
                           "primary":  "GS",
                           "secondary":  "AM"
                       },
                       {
                           "qty":  "0-4",
                           "position":  "Elegido Bloqueador",
                           "cost":  100000,
                           "stats":  {
                                         "MV":  5,
                                         "FU":  "4",
                                         "AG":  "3+",
                                         "PA":  "5+",
                                         "AR":  "10+"
                                     },
                           "skillKeys":  [

                                         ],
                           "primary":  "GS",
                           "secondary":  "AM"
                       },
                       {
                           "qty":  "0-1",
                           "position":  "Minotauro del Caos",
                           "cost":  150000,
                           "stats":  {
                                         "MV":  5,
                                         "FU":  "5",
                                         "AG":  "4+",
                                         "PA":  "-",
                                         "AR":  "9+"
                                     },
                           "skillKeys":  [
                                             "Animal Savagery",
                                             "Frenzy",
                                             "Horns",
                                             "Mighty Blow (+1)",
                                             "Loner (4+)"
                                         ],
                           "primary":  "S",
                           "secondary":  "GMA"
                       }
                   ],
        "specialRules_es":  "Favorito de..., GestiÃ³n de Equipo",
        "specialRules_en":  "Favorito de..., GestiÃ³n de Equipo"
    },
    {
        "name":  "Enanos del Caos",
        "specialRules":  "Favorito de..., GestiÃ³n de Equipo, Superliga del Borde del Mundo, Pelea de Badlands",
        "rerollCost":  50000,
        "tier":  1,
        "apothecary":  "SÃ­",
        "image":  "https://raw.githubusercontent.com/jaz206/Bloodbowl-image/main/Escudos/Enanos%20del%20caos.png",
        "ratings":  {
                        "fuerza":  72,
                        "agilidad":  68,
                        "velocidad":  65,
                        "armadura":  90,
                        "pase":  32
                    },
        "roster":  [
                       {
                           "qty":  "0-16",
                           "position":  "Hobgoblin LÃ­nea",
                           "cost":  40000,
                           "stats":  {
                                         "MV":  6,
                                         "FU":  "3",
                                         "AG":  "3+",
                                         "PA":  "4+",
                                         "AR":  "8+"
                                     },
                           "skillKeys":  [

                                         ],
                           "primary":  "",
                           "secondary":  "AS"
                       },
                       {
                           "qty":  "0-4",
                           "position":  "Enanos del Caos Bloqueador",
                           "cost":  70000,
                           "stats":  {
                                         "MV":  4,
                                         "FU":  "3",
                                         "AG":  "4+",
                                         "PA":  "6+",
                                         "AR":  "10+"
                                     },
                           "skillKeys":  [
                                             "Tackle",
                                             "Iron Hard Skin",
                                             "Thick Skull"
                                         ],
                           "primary":  "GS",
                           "secondary":  "AM"
                       },
                       {
                           "qty":  "0-2",
                           "position":  "Bull Centaur Placador",
                           "cost":  130000,
                           "stats":  {
                                         "MV":  6,
                                         "FU":  "4",
                                         "AG":  "4+",
                                         "PA":  "6+",
                                         "AR":  "10+"
                                     },
                           "skillKeys":  [
                                             "Sprint",
                                             "Sure Feet",
                                             "Thick Skull"
                                         ],
                           "primary":  "GS",
                           "secondary":  "AM"
                       },
                       {
                           "qty":  "0-1",
                           "position":  "Renegade Minotauro",
                           "cost":  150000,
                           "stats":  {
                                         "MV":  5,
                                         "FU":  "5",
                                         "AG":  "4+",
                                         "PA":  "-",
                                         "AR":  "9+"
                                     },
                           "skillKeys":  [
                                             "Frenzy",
                                             "Horns",
                                             "Loner (4+)",
                                             "Mighty Blow (+1)",
                                             "Thick Skull",
                                             "Unchannelled Fury"
                                         ],
                           "primary":  "S",
                           "secondary":  "AGM"
                       },
                       {
                           "qty":  "0-2",
                           "position":  "Hobgoblin Sneaky Stabba",
                           "cost":  70000,
                           "stats":  {
                                         "MV":  6,
                                         "FU":  "3",
                                         "AG":  "3+",
                                         "PA":  "5+",
                                         "AR":  "8+"
                                     },
                           "skillKeys":  [
                                             "Shadowing",
                                             "Stab"
                                         ],
                           "primary":  "G",
                           "secondary":  "AS"
                       }
                   ],
        "specialRules_es":  "Favorito de..., GestiÃ³n de Equipo, Superliga del Borde del Mundo, Pelea de Badlands",
        "specialRules_en":  "Favorito de..., GestiÃ³n de Equipo, Superliga del Borde del Mundo, Pelea de Badlands"
    },
    {
        "name":  "Renegados del Caos",
        "specialRules":  "Favorito de..., GestiÃ³n de Equipo",
        "rerollCost":  50000,
        "tier":  2,
        "apothecary":  "SÃ­",
        "image":  "https://raw.githubusercontent.com/jaz206/Bloodbowl-image/main/Escudos/Renegados%20del%20Caos.png",
        "ratings":  {
                        "fuerza":  74,
                        "agilidad":  72,
                        "velocidad":  67,
                        "armadura":  91,
                        "pase":  50
                    },
        "roster":  [
                       {
                           "qty":  "0-1",
                           "position":  "Renegade Skaven",
                           "cost":  50000,
                           "stats":  {
                                         "MV":  7,
                                         "FU":  "3",
                                         "AG":  "3+",
                                         "PA":  "4+",
                                         "AR":  "8+"
                                     },
                           "skillKeys":  [
                                             "Animosity (all team-mates)"
                                         ],
                           "primary":  "GM",
                           "secondary":  "AS"
                       },
                       {
                           "qty":  "0-1",
                           "position":  "Renegade Elfos Oscuros",
                           "cost":  75000,
                           "stats":  {
                                         "MV":  6,
                                         "FU":  "3",
                                         "AG":  "2+",
                                         "PA":  "3+",
                                         "AR":  "9+"
                                     },
                           "skillKeys":  [
                                             "Animosity (all team-mates)"
                                         ],
                           "primary":  "AGM",
                           "secondary":  "PS"
                       },
                       {
                           "qty":  "0-1",
                           "position":  "Renegade Ogros",
                           "cost":  140000,
                           "stats":  {
                                         "MV":  5,
                                         "FU":  "5",
                                         "AG":  "4+",
                                         "PA":  "5+",
                                         "AR":  "10+"
                                     },
                           "skillKeys":  [
                                             "Bone Head",
                                             "Loner (4+)",
                                             "Mighty Blow (+1)",
                                             "Thick Skull",
                                             "Throw Team-mate"
                                         ],
                           "primary":  "S",
                           "secondary":  "AGM"
                       },
                       {
                           "qty":  "0-1",
                           "position":  "Renegade Orcos",
                           "cost":  50000,
                           "stats":  {
                                         "MV":  5,
                                         "FU":  "3",
                                         "AG":  "3+",
                                         "PA":  "5+",
                                         "AR":  "10+"
                                     },
                           "skillKeys":  [
                                             "Animosity (all team-mates)"
                                         ],
                           "primary":  "GM",
                           "secondary":  "AS"
                       },
                       {
                           "qty":  "0-1",
                           "position":  "Renegade Troll",
                           "cost":  115000,
                           "stats":  {
                                         "MV":  4,
                                         "FU":  "5",
                                         "AG":  "5+",
                                         "PA":  "5+",
                                         "AR":  "10+"
                                     },
                           "skillKeys":  [
                                             "Always Hungry",
                                             "Loner (4+)",
                                             "Mighty Blow (+1)",
                                             "Projectile Vomit",
                                             "Really Stupid",
                                             "Regeneration",
                                             "Throw Team-mate"
                                         ],
                           "primary":  "S",
                           "secondary":  "AGM"
                       },
                       {
                           "qty":  "0-1",
                           "position":  "Renegade Goblins",
                           "cost":  40000,
                           "stats":  {
                                         "MV":  6,
                                         "FU":  "2",
                                         "AG":  "3+",
                                         "PA":  "4+",
                                         "AR":  "8+"
                                     },
                           "skillKeys":  [
                                             "Animosity (all team-mates)",
                                             "Dodge",
                                             "Right Stuff",
                                             "Stunty"
                                         ],
                           "primary":  "AM",
                           "secondary":  "GP"
                       },
                       {
                           "qty":  "0-1",
                           "position":  "Renegade Minotauro",
                           "cost":  150000,
                           "stats":  {
                                         "MV":  5,
                                         "FU":  "5",
                                         "AG":  "4+",
                                         "PA":  "-",
                                         "AR":  "9+"
                                     },
                           "skillKeys":  [
                                             "Loner (4+)",
                                             "Frenzy",
                                             "Horns",
                                             "Mighty Blow (+1)",
                                             "Thick Skull",
                                             "Unchannelled Fury"
                                         ],
                           "primary":  "S",
                           "secondary":  "AGM"
                       },
                       {
                           "qty":  "0-12",
                           "position":  "Renegade Humanos LÃ­nea",
                           "cost":  50000,
                           "stats":  {
                                         "MV":  6,
                                         "FU":  "3",
                                         "AG":  "3+",
                                         "PA":  "4+",
                                         "AR":  "9+"
                                     },
                           "skillKeys":  [

                                         ],
                           "primary":  "",
                           "secondary":  "AS"
                       },
                       {
                           "qty":  "0-1",
                           "position":  "Renegade Humanos Lanzador",
                           "cost":  75000,
                           "stats":  {
                                         "MV":  6,
                                         "FU":  "3",
                                         "AG":  "3+",
                                         "PA":  "3+",
                                         "AR":  "9+"
                                     },
                           "skillKeys":  [
                                             "Animosity (all team-mates)",
                                             "Pass",
                                             "Sure Hands"
                                         ],
                           "primary":  "GMP",
                           "secondary":  "AS"
                       },
                       {
                           "qty":  "0-1",
                           "position":  "Renegade Rat Ogros",
                           "cost":  150000,
                           "stats":  {
                                         "MV":  6,
                                         "FU":  "5",
                                         "AG":  "4+",
                                         "PA":  "-",
                                         "AR":  "9+"
                                     },
                           "skillKeys":  [
                                             "Animal Savagery",
                                             "Frenzy",
                                             "Loner (4+)",
                                             "Mighty Blow (+1)",
                                             "Prehensile Tail"
                                         ],
                           "primary":  "S",
                           "secondary":  "AGM"
                       }
                   ],
        "specialRules_es":  "Favorito de..., GestiÃ³n de Equipo",
        "specialRules_en":  "Favorito de..., GestiÃ³n de Equipo"
    },
    {
        "name":  "Elfos Oscuros",
        "specialRules":  "Liga de los Reinos Ã‰lficos, GestiÃ³n de Equipo",
        "rerollCost":  50000,
        "tier":  1,
        "apothecary":  "SÃ­",
        "image":  "https://raw.githubusercontent.com/jaz206/Bloodbowl-image/main/Escudos/Elfos%20Oscuros.png",
        "ratings":  {
                        "fuerza":  60,
                        "agilidad":  100,
                        "velocidad":  82,
                        "armadura":  84,
                        "pase":  56
                    },
        "roster":  [
                       {
                           "qty":  "0-2",
                           "position":  "Corredor",
                           "cost":  80000,
                           "stats":  {
                                         "MV":  7,
                                         "FU":  "3",
                                         "AG":  "2+",
                                         "PA":  "3+",
                                         "AR":  "8+"
                                     },
                           "skillKeys":  [
                                             "Dump-Off"
                                         ],
                           "primary":  "AGP",
                           "secondary":  "S"
                       },
                       {
                           "qty":  "0-2",
                           "position":  "Assassin",
                           "cost":  85000,
                           "stats":  {
                                         "MV":  7,
                                         "FU":  "3",
                                         "AG":  "2+",
                                         "PA":  "5+",
                                         "AR":  "8+"
                                     },
                           "skillKeys":  [
                                             "Shadowing",
                                             "Stab"
                                         ],
                           "primary":  "AG",
                           "secondary":  "PS"
                       },
                       {
                           "qty":  "0-4",
                           "position":  "Placador",
                           "cost":  100000,
                           "stats":  {
                                         "MV":  7,
                                         "FU":  "3",
                                         "AG":  "2+",
                                         "PA":  "4+",
                                         "AR":  "9+"
                                     },
                           "skillKeys":  [
                                             "Tackle"
                                         ],
                           "primary":  "AG",
                           "secondary":  "PS"
                       },
                       {
                           "qty":  "0-2",
                           "position":  "Witch Elf",
                           "cost":  110000,
                           "stats":  {
                                         "MV":  7,
                                         "FU":  "3",
                                         "AG":  "2+",
                                         "PA":  "5+",
                                         "AR":  "8+"
                                     },
                           "skillKeys":  [
                                             "Dodge",
                                             "Frenzy",
                                             "Leap"
                                         ],
                           "primary":  "AG",
                           "secondary":  "PS"
                       },
                       {
                           "qty":  "0-12",
                           "position":  "Elfos Oscuros LÃ­nea",
                           "cost":  70000,
                           "stats":  {
                                         "MV":  6,
                                         "FU":  "3",
                                         "AG":  "2+",
                                         "PA":  "4+",
                                         "AR":  "9+"
                                     },
                           "skillKeys":  [

                                         ],
                           "primary":  "",
                           "secondary":  "S"
                       }
                   ],
        "specialRules_es":  "Liga de los Reinos Ã‰lficos, GestiÃ³n de Equipo",
        "specialRules_en":  "Liga de los Reinos Ã‰lficos, GestiÃ³n de Equipo"
    },
    {
        "name":  "Enanos",
        "specialRules":  "ClÃ¡sico del Viejo Mundo, GestiÃ³n de Equipo, Superliga del Borde del Mundo",
        "rerollCost":  50000,
        "tier":  1,
        "apothecary":  "SÃ­",
        "image":  "https://raw.githubusercontent.com/jaz206/Bloodbowl-image/main/Escudos/Enanos.png",
        "ratings":  {
                        "fuerza":  76,
                        "agilidad":  64,
                        "velocidad":  58,
                        "armadura":  98,
                        "pase":  40
                    },
        "roster":  [
                       {
                           "qty":  "0-12",
                           "position":  "Enanos Bloqueador LÃ­nea",
                           "cost":  70000,
                           "stats":  {
                                         "MV":  4,
                                         "FU":  "3",
                                         "AG":  "4+",
                                         "PA":  "5+",
                                         "AR":  "10+"
                                     },
                           "skillKeys":  [
                                             "Tackle",
                                             "Block",
                                             "Thick Skull"
                                         ],
                           "primary":  "GS",
                           "secondary":  "A"
                       },
                       {
                           "qty":  "0-2",
                           "position":  "Corredor",
                           "cost":  85000,
                           "stats":  {
                                         "MV":  6,
                                         "FU":  "3",
                                         "AG":  "3+",
                                         "PA":  "4+",
                                         "AR":  "9+"
                                     },
                           "skillKeys":  [
                                             "Sure Hands",
                                             "Thick Skull"
                                         ],
                           "primary":  "GP",
                           "secondary":  "AS"
                       },
                       {
                           "qty":  "0-2",
                           "position":  "Placador",
                           "cost":  80000,
                           "stats":  {
                                         "MV":  5,
                                         "FU":  "3",
                                         "AG":  "3+",
                                         "PA":  "4+",
                                         "AR":  "10+"
                                     },
                           "skillKeys":  [
                                             "Tackle",
                                             "Thick Skull"
                                         ],
                           "primary":  "GS",
                           "secondary":  "AP"
                       },
                       {
                           "qty":  "0-2",
                           "position":  "Troll Slayer",
                           "cost":  95000,
                           "stats":  {
                                         "MV":  5,
                                         "FU":  "3",
                                         "AG":  "4+",
                                         "PA":  "-",
                                         "AR":  "9+"
                                     },
                           "skillKeys":  [
                                             "Tackle",
                                             "Dauntless",
                                             "Frenzy",
                                             "Thick Skull"
                                         ],
                           "primary":  "GS",
                           "secondary":  "A"
                       },
                       {
                           "qty":  "0-1",
                           "position":  "Deathroller",
                           "cost":  170000,
                           "stats":  {
                                         "MV":  4,
                                         "FU":  "7",
                                         "AG":  "5+",
                                         "PA":  "-",
                                         "AR":  "11+"
                                     },
                           "skillKeys":  [
                                             "Break Tackle",
                                             "Dirty Player (+1)",
                                             "Juggernaut",
                                             "Loner (5+)",
                                             "Mighty Blow (+1)",
                                             "No Hands",
                                             "Secret Weapon",
                                             "Stand Firm"
                                         ],
                           "primary":  "S",
                           "secondary":  "AG"
                       }
                   ],
        "specialRules_es":  "ClÃ¡sico del Viejo Mundo, GestiÃ³n de Equipo, Superliga del Borde del Mundo",
        "specialRules_en":  "ClÃ¡sico del Viejo Mundo, GestiÃ³n de Equipo, Superliga del Borde del Mundo"
    },
    {
        "name":  "UniÃ³n Ã‰lfica",
        "specialRules":  "Liga de los Reinos Ã‰lficos, GestiÃ³n de Equipo",
        "rerollCost":  50000,
        "tier":  2,
        "apothecary":  "SÃ­",
        "image":  "https://i.pinimg.com/736x/00/92/17/0092173b8d1e26ac361e877e871a6977.jpg",
        "ratings":  {
                        "fuerza":  60,
                        "agilidad":  100,
                        "velocidad":  81,
                        "armadura":  83,
                        "pase":  75
                    },
        "roster":  [
                       {
                           "qty":  "0-4",
                           "position":  "Receptor",
                           "cost":  100000,
                           "stats":  {
                                         "MV":  8,
                                         "FU":  "3",
                                         "AG":  "2+",
                                         "PA":  "4+",
                                         "AR":  "8+"
                                     },
                           "skillKeys":  [
                                             "Catch",
                                             "Nerves of Steel"
                                         ],
                           "primary":  "AG",
                           "secondary":  "S"
                       },
                       {
                           "qty":  "0-2",
                           "position":  "Placador",
                           "cost":  115000,
                           "stats":  {
                                         "MV":  7,
                                         "FU":  "3",
                                         "AG":  "2+",
                                         "PA":  "3+",
                                         "AR":  "9+"
                                     },
                           "skillKeys":  [
                                             "Tackle",
                                             "Side Step"
                                         ],
                           "primary":  "AG",
                           "secondary":  "PS"
                       },
                       {
                           "qty":  "0-12",
                           "position":  "LÃ­nea",
                           "cost":  60000,
                           "stats":  {
                                         "MV":  6,
                                         "FU":  "3",
                                         "AG":  "2+",
                                         "PA":  "4+",
                                         "AR":  "8+"
                                     },
                           "skillKeys":  [

                                         ],
                           "primary":  "",
                           "secondary":  "S"
                       },
                       {
                           "qty":  "0-2",
                           "position":  "Lanzador",
                           "cost":  75000,
                           "stats":  {
                                         "MV":  6,
                                         "FU":  "3",
                                         "AG":  "2+",
                                         "PA":  "2+",
                                         "AR":  "8+"
                                     },
                           "skillKeys":  [
                                             "Pass"
                                         ],
                           "primary":  "AGP",
                           "secondary":  "S"
                       }
                   ],
        "specialRules_es":  "Liga de los Reinos Ã‰lficos, GestiÃ³n de Equipo",
        "specialRules_en":  "Liga de los Reinos Ã‰lficos, GestiÃ³n de Equipo"
    },
    {
        "name":  "Gnomos",
        "specialRules":  "Copa Dedal Halfling, GestiÃ³n de Equipo, Nivel 3",
        "rerollCost":  50000,
        "tier":  3,
        "apothecary":  "SÃ­",
        "image":  "https://raw.githubusercontent.com/jaz206/Bloodbowl-image/main/Escudos/Gnomos.png",
        "ratings":  {
                        "fuerza":  56,
                        "agilidad":  76,
                        "velocidad":  58,
                        "armadura":  78,
                        "pase":  52
                    },
        "roster":  [
                       {
                           "qty":  "0-16",
                           "position":  "Gnomos LÃ­nea",
                           "cost":  40000,
                           "stats":  {
                                         "MV":  5,
                                         "FU":  "2",
                                         "AG":  "3+",
                                         "PA":  "4+",
                                         "AR":  "7+"
                                     },
                           "skillKeys":  [
                                             "Leap",
                                             "Right Stuff",
                                             "Stunty",
                                             "Wrestle"
                                         ],
                           "primary":  "A",
                           "secondary":  "GS"
                       },
                       {
                           "qty":  "0-2",
                           "position":  "Gnomos Beastmaster",
                           "cost":  55000,
                           "stats":  {
                                         "MV":  5,
                                         "FU":  "2",
                                         "AG":  "3+",
                                         "PA":  "4+",
                                         "AR":  "8+"
                                     },
                           "skillKeys":  [
                                             "Defensive",
                                             "Leap",
                                             "Stunty",
                                             "Wrestle"
                                         ],
                           "primary":  "A",
                           "secondary":  "GS"
                       },
                       {
                           "qty":  "0-2",
                           "position":  "Gnomos Illusionist",
                           "cost":  50000,
                           "stats":  {
                                         "MV":  5,
                                         "FU":  "2",
                                         "AG":  "3+",
                                         "PA":  "3+",
                                         "AR":  "7+"
                                     },
                           "skillKeys":  [
                                             "Leap",
                                             "Stunty",
                                             "Trickster",
                                             "Wrestle"
                                         ],
                           "primary":  "AP",
                           "secondary":  "G"
                       },
                       {
                           "qty":  "0-2",
                           "position":  "Woodland Fox",
                           "cost":  50000,
                           "stats":  {
                                         "MV":  7,
                                         "FU":  "2",
                                         "AG":  "2+",
                                         "PA":  "-",
                                         "AR":  "6+"
                                     },
                           "skillKeys":  [
                                             "Dodge",
                                             "My Ball",
                                             "Side Step",
                                             "Stunty"
                                         ],
                           "primary":  "-",
                           "secondary":  "A"
                       },
                       {
                           "qty":  "0-2",
                           "position":  "Altern Forest Treeman",
                           "cost":  120000,
                           "stats":  {
                                         "MV":  2,
                                         "FU":  "6",
                                         "AG":  "5+",
                                         "PA":  "5+",
                                         "AR":  "11+"
                                     },
                           "skillKeys":  [
                                             "Mighty Blow (+1)",
                                             "Stand Firm",
                                             "Strong Arm",
                                             "Take Root",
                                             "Thick Skull",
                                             "Throw Team-mate"
                                         ],
                           "primary":  "S",
                           "secondary":  "AGP"
                       }
                   ],
        "specialRules_es":  "Copa Dedal Halfling, GestiÃ³n de Equipo, Nivel 3",
        "specialRules_en":  "Copa Dedal Halfling, GestiÃ³n de Equipo, Nivel 3"
    },
    {
        "name":  "Goblins",
        "specialRules":  "DesafÃ­o SubterrÃ¡neo, GestiÃ³n de Equipo, Pelea de Badlands, Soborno y CorrupciÃ³n, Nivel 3",
        "rerollCost":  50000,
        "tier":  3,
        "apothecary":  "SÃ­",
        "image":  "https://raw.githubusercontent.com/jaz206/Bloodbowl-image/main/Escudos/Goblins.png",
        "ratings":  {
                        "fuerza":  63,
                        "agilidad":  74,
                        "velocidad":  65,
                        "armadura":  83,
                        "pase":  37
                    },
        "roster":  [
                       {
                           "qty":  "0-1",
                           "position":  "Bomma",
                           "cost":  45000,
                           "stats":  {
                                         "MV":  6,
                                         "FU":  "2",
                                         "AG":  "3+",
                                         "PA":  "4+",
                                         "AR":  "8+"
                                     },
                           "skillKeys":  [
                                             "Bombardier",
                                             "Dodge",
                                             "Secret Weapon",
                                             "Stunty"
                                         ],
                           "primary":  "AP",
                           "secondary":  "GS"
                       },
                       {
                           "qty":  "0-1",
                           "position":  "Doom Diver",
                           "cost":  60000,
                           "stats":  {
                                         "MV":  6,
                                         "FU":  "2",
                                         "AG":  "3+",
                                         "PA":  "6+",
                                         "AR":  "8+"
                                     },
                           "skillKeys":  [
                                             "Right Stuff",
                                             "Stunty",
                                             "Swoop"
                                         ],
                           "primary":  "A",
                           "secondary":  "GS"
                       },
                       {
                           "qty":  "0-1",
                           "position":  "Fanatic",
                           "cost":  70000,
                           "stats":  {
                                         "MV":  3,
                                         "FU":  "7",
                                         "AG":  "3+",
                                         "PA":  "-",
                                         "AR":  "8+"
                                     },
                           "skillKeys":  [
                                             "Ball \u0026 Chain",
                                             "No Hands",
                                             "Secret Weapon",
                                             "Stunty"
                                         ],
                           "primary":  "S",
                           "secondary":  "AG"
                       },
                       {
                           "qty":  "0-1",
                           "position":  "Looney",
                           "cost":  40000,
                           "stats":  {
                                         "MV":  6,
                                         "FU":  "2",
                                         "AG":  "3+",
                                         "PA":  "-",
                                         "AR":  "8+"
                                     },
                           "skillKeys":  [
                                             "Chainsaw",
                                             "Secret Weapon",
                                             "Stunty"
                                         ],
                           "primary":  "A",
                           "secondary":  "GS"
                       },
                       {
                           "qty":  "0-16",
                           "position":  "Goblins LÃ­nea",
                           "cost":  40000,
                           "stats":  {
                                         "MV":  6,
                                         "FU":  "2",
                                         "AG":  "3+",
                                         "PA":  "4+",
                                         "AR":  "8+"
                                     },
                           "skillKeys":  [
                                             "Dodge",
                                             "Right Stuff",
                                             "Stunty"
                                         ],
                           "primary":  "A",
                           "secondary":  "GPS"
                       },
                       {
                           "qty":  "0-2",
                           "position":  "Trained Troll",
                           "cost":  115000,
                           "stats":  {
                                         "MV":  4,
                                         "FU":  "5",
                                         "AG":  "5+",
                                         "PA":  "5+",
                                         "AR":  "10+"
                                     },
                           "skillKeys":  [
                                             "Always Hungry",
                                             "Loner (3+)",
                                             "Mighty Blow (+1)",
                                             "Projectile Vomit",
                                             "Really Stupid",
                                             "Regeneration",
                                             "Throw Team-mate"
                                         ],
                           "primary":  "S",
                           "secondary":  "AGP"
                       },
                       {
                           "qty":  "0-1",
                           "position":  "Pogoer",
                           "cost":  75000,
                           "stats":  {
                                         "MV":  7,
                                         "FU":  "2",
                                         "AG":  "3+",
                                         "PA":  "5+",
                                         "AR":  "8+"
                                     },
                           "skillKeys":  [
                                             "Dodge",
                                             "Pogo Stick",
                                             "Stunty"
                                         ],
                           "primary":  "A",
                           "secondary":  "GPS"
                       }
                   ],
        "specialRules_es":  "DesafÃ­o SubterrÃ¡neo, GestiÃ³n de Equipo, Pelea de Badlands, Soborno y CorrupciÃ³n, Nivel 3",
        "specialRules_en":  "DesafÃ­o SubterrÃ¡neo, GestiÃ³n de Equipo, Pelea de Badlands, Soborno y CorrupciÃ³n, Nivel 3"
    },
    {
        "name":  "Halflings",
        "specialRules":  "ClÃ¡sico del Viejo Mundo, GestiÃ³n de Equipo, Copa Dedal Halfling, Nivel 3",
        "rerollCost":  50000,
        "tier":  3,
        "apothecary":  "SÃ­",
        "image":  "https://raw.githubusercontent.com/jaz206/Bloodbowl-image/main/Escudos/Halflings.png",
        "ratings":  {
                        "fuerza":  60,
                        "agilidad":  70,
                        "velocidad":  51,
                        "armadura":  83,
                        "pase":  55
                    },
        "roster":  [
                       {
                           "qty":  "0-16",
                           "position":  "Halflings Hopeful LÃ­nea",
                           "cost":  30000,
                           "stats":  {
                                         "MV":  5,
                                         "FU":  "2",
                                         "AG":  "3+",
                                         "PA":  "4+",
                                         "AR":  "7+"
                                     },
                           "skillKeys":  [
                                             "Dodge",
                                             "Right Stuff",
                                             "Stunty"
                                         ],
                           "primary":  "A",
                           "secondary":  "GS"
                       },
                       {
                           "qty":  "0-2",
                           "position":  "Halflings Hefty",
                           "cost":  50000,
                           "stats":  {
                                         "MV":  5,
                                         "FU":  "2",
                                         "AG":  "3+",
                                         "PA":  "3+",
                                         "AR":  "8+"
                                     },
                           "skillKeys":  [
                                             "Dodge",
                                             "Fend",
                                             "Stunty"
                                         ],
                           "primary":  "AP",
                           "secondary":  "GS"
                       },
                       {
                           "qty":  "0-2",
                           "position":  "Altern Forest Treeman",
                           "cost":  120000,
                           "stats":  {
                                         "MV":  2,
                                         "FU":  "6",
                                         "AG":  "5+",
                                         "PA":  "5+",
                                         "AR":  "11+"
                                     },
                           "skillKeys":  [
                                             "Mighty Blow (+1)",
                                             "Stand Firm",
                                             "Strong Arm",
                                             "Take Root",
                                             "Thick Skull",
                                             "Throw Team-mate"
                                         ],
                           "primary":  "S",
                           "secondary":  "AGP"
                       },
                       {
                           "qty":  "0-2",
                           "position":  "Halflings Receptor",
                           "cost":  55000,
                           "stats":  {
                                         "MV":  5,
                                         "FU":  "2",
                                         "AG":  "3+",
                                         "PA":  "5+",
                                         "AR":  "7+"
                                     },
                           "skillKeys":  [
                                             "Catch",
                                             "Dodge",
                                             "Right Stuff",
                                             "Sprint",
                                             "Stunty"
                                         ],
                           "primary":  "A",
                           "secondary":  "GS"
                       }
                   ],
        "specialRules_es":  "ClÃ¡sico del Viejo Mundo, GestiÃ³n de Equipo, Copa Dedal Halfling, Nivel 3",
        "specialRules_en":  "ClÃ¡sico del Viejo Mundo, GestiÃ³n de Equipo, Copa Dedal Halfling, Nivel 3"
    },
    {
        "name":  "Altos Elfos",
        "specialRules":  "Liga de los Reinos Ã‰lficos, GestiÃ³n de Equipo",
        "rerollCost":  50000,
        "tier":  1,
        "apothecary":  "SÃ­",
        "image":  "https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0",
        "ratings":  {
                        "fuerza":  60,
                        "agilidad":  100,
                        "velocidad":  81,
                        "armadura":  88,
                        "pase":  65
                    },
        "roster":  [
                       {
                           "qty":  "0-2",
                           "position":  "Placador",
                           "cost":  100000,
                           "stats":  {
                                         "MV":  7,
                                         "FU":  "3",
                                         "AG":  "2+",
                                         "PA":  "4+",
                                         "AR":  "9+"
                                     },
                           "skillKeys":  [
                                             "Tackle"
                                         ],
                           "primary":  "AG",
                           "secondary":  "PS"
                       },
                       {
                           "qty":  "0-16",
                           "position":  "LÃ­nea",
                           "cost":  70000,
                           "stats":  {
                                         "MV":  6,
                                         "FU":  "3",
                                         "AG":  "2+",
                                         "PA":  "4+",
                                         "AR":  "9+"
                                     },
                           "skillKeys":  [

                                         ],
                           "primary":  "",
                           "secondary":  "PS"
                       },
                       {
                           "qty":  "0-4",
                           "position":  "Receptor",
                           "cost":  90000,
                           "stats":  {
                                         "MV":  8,
                                         "FU":  "3",
                                         "AG":  "2+",
                                         "PA":  "5+",
                                         "AR":  "8+"
                                     },
                           "skillKeys":  [
                                             "Catch"
                                         ],
                           "primary":  "AG",
                           "secondary":  "S"
                       },
                       {
                           "qty":  "0-2",
                           "position":  "Lanzador",
                           "cost":  100000,
                           "stats":  {
                                         "MV":  6,
                                         "FU":  "3",
                                         "AG":  "2+",
                                         "PA":  "2+",
                                         "AR":  "9+"
                                     },
                           "skillKeys":  [
                                             "Cloud Burster",
                                             "Pass",
                                             "Safe Pass"
                                         ],
                           "primary":  "AGP",
                           "secondary":  "S"
                       }
                   ],
        "specialRules_es":  "Liga de los Reinos Ã‰lficos, GestiÃ³n de Equipo",
        "specialRules_en":  "Liga de los Reinos Ã‰lficos, GestiÃ³n de Equipo"
    },
    {
        "name":  "Humanos",
        "specialRules":  "ClÃ¡sico del Viejo Mundo, GestiÃ³n de Equipo",
        "rerollCost":  50000,
        "tier":  2,
        "apothecary":  "SÃ­",
        "image":  "https://i.pinimg.com/736x/c2/63/6b/c2636b8d808236de876bc37716a39f49.jpg",
        "ratings":  {
                        "fuerza":  60,
                        "agilidad":  77,
                        "velocidad":  74,
                        "armadura":  87,
                        "pase":  60
                    },
        "roster":  [
                       {
                           "qty":  "0-2",
                           "position":  "Lanzador",
                           "cost":  80000,
                           "stats":  {
                                         "MV":  6,
                                         "FU":  "3",
                                         "AG":  "3+",
                                         "PA":  "2+",
                                         "AR":  "9+"
                                     },
                           "skillKeys":  [
                                             "Pass",
                                             "Sure Hands"
                                         ],
                           "primary":  "GP",
                           "secondary":  "AS"
                       },
                       {
                           "qty":  "0-4",
                           "position":  "Receptor",
                           "cost":  65000,
                           "stats":  {
                                         "MV":  8,
                                         "FU":  "2",
                                         "AG":  "3+",
                                         "PA":  "5+",
                                         "AR":  "8+"
                                     },
                           "skillKeys":  [
                                             "Catch",
                                             "Dodge"
                                         ],
                           "primary":  "AG",
                           "secondary":  "PS"
                       },
                       {
                           "qty":  "0-4",
                           "position":  "Placador",
                           "cost":  85000,
                           "stats":  {
                                         "MV":  7,
                                         "FU":  "3",
                                         "AG":  "3+",
                                         "PA":  "4+",
                                         "AR":  "9+"
                                     },
                           "skillKeys":  [
                                             "Tackle"
                                         ],
                           "primary":  "GS",
                           "secondary":  "AP"
                       },
                       {
                           "qty":  "0-1",
                           "position":  "Ogros",
                           "cost":  140000,
                           "stats":  {
                                         "MV":  5,
                                         "FU":  "5",
                                         "AG":  "4+",
                                         "PA":  "5+",
                                         "AR":  "10+"
                                     },
                           "skillKeys":  [
                                             "Bone Head",
                                             "Loner (4+)",
                                             "Mighty Blow (+1)",
                                             "Thick Skull",
                                             "Throw Team-mate"
                                         ],
                           "primary":  "S",
                           "secondary":  "AG"
                       },
                       {
                           "qty":  "0-4",
                           "position":  "Placador Blitzer",
                           "cost":  85000,
                           "stats":  {
                                         "MV":  7,
                                         "FU":  "3",
                                         "AG":  "3+",
                                         "PA":  "4+",
                                         "AR":  "9+"
                                     },
                           "skillKeys":  [
                                             "Block"
                                         ],
                           "primary":  "GS",
                           "secondary":  "AP"
                       },
                       {
                           "qty":  "0-16",
                           "position":  "Humanos LÃ­nea",
                           "cost":  50000,
                           "stats":  {
                                         "MV":  6,
                                         "FU":  "3",
                                         "AG":  "3+",
                                         "PA":  "4+",
                                         "AR":  "9+"
                                     },
                           "skillKeys":  [

                                         ],
                           "primary":  "G",
                           "secondary":  "AS"
                       },
                       {
                           "qty":  "0-3",
                           "position":  "Halflings Hopeful",
                           "cost":  30000,
                           "stats":  {
                                         "MV":  5,
                                         "FU":  "2",
                                         "AG":  "3+",
                                         "PA":  "4+",
                                         "AR":  "7+"
                                     },
                           "skillKeys":  [
                                             "Dodge",
                                             "Right Stuff",
                                             "Stunty"
                                         ],
                           "primary":  "A",
                           "secondary":  "GS"
                       }
                   ],
        "specialRules_es":  "ClÃ¡sico del Viejo Mundo, GestiÃ³n de Equipo",
        "specialRules_en":  "ClÃ¡sico del Viejo Mundo, GestiÃ³n de Equipo"
    },
    {
        "name":  "Hombres Lagarto",
        "specialRules":  "Superliga Lustria, GestiÃ³n de Equipo",
        "rerollCost":  50000,
        "tier":  1,
        "apothecary":  "SÃ­",
        "image":  "https://i.pinimg.com/736x/b4/c1/f5/b4c1f571ca61aaba9bc450b462b1783d.jpg",
        "ratings":  {
                        "fuerza":  65,
                        "agilidad":  60,
                        "velocidad":  81,
                        "armadura":  90,
                        "pase":  45
                    },
        "roster":  [
                       {
                           "qty":  "0-1",
                           "position":  "Kroxigor",
                           "cost":  140000,
                           "stats":  {
                                         "MV":  6,
                                         "FU":  "5",
                                         "AG":  "5+",
                                         "PA":  "-",
                                         "AR":  "10+"
                                     },
                           "skillKeys":  [
                                             "Bone Head",
                                             "Loner (4+)",
                                             "Mighty Blow (+1)",
                                             "Prehensile Tail",
                                             "Thick Skull"
                                         ],
                           "primary":  "S",
                           "secondary":  "AG"
                       },
                       {
                           "qty":  "0-6",
                           "position":  "Saurus Bloqueador",
                           "cost":  85000,
                           "stats":  {
                                         "MV":  6,
                                         "FU":  "4",
                                         "AG":  "5+",
                                         "PA":  "6+",
                                         "AR":  "10+"
                                     },
                           "skillKeys":  [

                                         ],
                           "primary":  "",
                           "secondary":  "A"
                       },
                       {
                           "qty":  "0-2",
                           "position":  "Chameleon Skink",
                           "cost":  70000,
                           "stats":  {
                                         "MV":  7,
                                         "FU":  "2",
                                         "AG":  "3+",
                                         "PA":  "3+",
                                         "AR":  "8+"
                                     },
                           "skillKeys":  [
                                             "Dodge",
                                             "Kick-Off Return",
                                             "Shadowing",
                                             "Stunty"
                                         ],
                           "primary":  "A",
                           "secondary":  "GPS"
                       },
                       {
                           "qty":  "0-12",
                           "position":  "Skink Corredor LÃ­nea",
                           "cost":  60000,
                           "stats":  {
                                         "MV":  8,
                                         "FU":  "2",
                                         "AG":  "3+",
                                         "PA":  "4+",
                                         "AR":  "8+"
                                     },
                           "skillKeys":  [
                                             "Dodge",
                                             "Stunty"
                                         ],
                           "primary":  "A",
                           "secondary":  "GPS"
                       }
                   ],
        "specialRules_es":  "Superliga Lustria, GestiÃ³n de Equipo",
        "specialRules_en":  "Superliga Lustria, GestiÃ³n de Equipo"
    },
    {
        "name":  "Horror NigromÃ¡ntico",
        "specialRules":  "Escaparate Sylvaniano, GestiÃ³n de Equipo, Maestros de la No-Muerte",
        "rerollCost":  50000,
        "tier":  1,
        "apothecary":  "No",
        "image":  "https://i.pinimg.com/736x/a9/d0/c9/a9d0c9c23d2a99e34d6e0dae24ab2e1d.jpg",
        "ratings":  {
                        "fuerza":  64,
                        "agilidad":  72,
                        "velocidad":  70,
                        "armadura":  90,
                        "pase":  36
                    },
        "roster":  [
                       {
                           "qty":  "0-16",
                           "position":  "Zombie LÃ­nea",
                           "cost":  40000,
                           "stats":  {
                                         "MV":  4,
                                         "FU":  "3",
                                         "AG":  "4+",
                                         "PA":  "-",
                                         "AR":  "9+"
                                     },
                           "skillKeys":  [
                                             "Regeneration"
                                         ],
                           "primary":  "G",
                           "secondary":  "AS"
                       },
                       {
                           "qty":  "0-2",
                           "position":  "Espectro",
                           "cost":  95000,
                           "stats":  {
                                         "MV":  6,
                                         "FU":  "3",
                                         "AG":  "3+",
                                         "PA":  "-",
                                         "AR":  "9+"
                                     },
                           "skillKeys":  [
                                             "Tackle",
                                             "Foul Appearance",
                                             "No Hands",
                                             "Regeneration",
                                             "Side Step"
                                         ],
                           "primary":  "GS",
                           "secondary":  "A"
                       },
                       {
                           "qty":  "0-2",
                           "position":  "Ghoul Corredor",
                           "cost":  75000,
                           "stats":  {
                                         "MV":  7,
                                         "FU":  "3",
                                         "AG":  "3+",
                                         "PA":  "4+",
                                         "AR":  "8+"
                                     },
                           "skillKeys":  [
                                             "Dodge"
                                         ],
                           "primary":  "AG",
                           "secondary":  "PS"
                       },
                       {
                           "qty":  "0-2",
                           "position":  "Flesh Golem de Carne",
                           "cost":  115000,
                           "stats":  {
                                         "MV":  4,
                                         "FU":  "4",
                                         "AG":  "4+",
                                         "PA":  "-",
                                         "AR":  "10+"
                                     },
                           "skillKeys":  [
                                             "Regeneration",
                                             "Stand Firm",
                                             "Thick Skull"
                                         ],
                           "primary":  "GS",
                           "secondary":  "A"
                       },
                       {
                           "qty":  "0-2",
                           "position":  "Werewolf",
                           "cost":  125000,
                           "stats":  {
                                         "MV":  8,
                                         "FU":  "3",
                                         "AG":  "3+",
                                         "PA":  "4+",
                                         "AR":  "9+"
                                     },
                           "skillKeys":  [
                                             "Claws",
                                             "Frenzy",
                                             "Regeneration"
                                         ],
                           "primary":  "AG",
                           "secondary":  "PS"
                       }
                   ],
        "specialRules_es":  "Escaparate Sylvaniano, GestiÃ³n de Equipo, Maestros de la No-Muerte",
        "specialRules_en":  "Escaparate Sylvaniano, GestiÃ³n de Equipo, Maestros de la No-Muerte"
    },
    {
        "name":  "NÃ³rdicos",
        "specialRules":  "Favorito de..., ClÃ¡sico del Viejo Mundo",
        "rerollCost":  50000,
        "tier":  1,
        "apothecary":  "SÃ­",
        "image":  "https://i.pinimg.com/736x/b2/f0/5c/b2f05c2fcd61096bbf20a2b194bad517.jpg",
        "ratings":  {
                        "fuerza":  63,
                        "agilidad":  73,
                        "velocidad":  70,
                        "armadura":  80,
                        "pase":  40
                    },
        "roster":  [
                       {
                           "qty":  "0-16",
                           "position":  "NÃ³rdicos Raider LÃ­nea",
                           "cost":  50000,
                           "stats":  {
                                         "MV":  6,
                                         "FU":  "3",
                                         "AG":  "3+",
                                         "PA":  "4+",
                                         "AR":  "8+"
                                     },
                           "skillKeys":  [
                                             "Tackle",
                                             "Drunkard",
                                             "Thick Skull"
                                         ],
                           "primary":  "G",
                           "secondary":  "APS"
                       },
                       {
                           "qty":  "0-2",
                           "position":  "Ulfwerener",
                           "cost":  105000,
                           "stats":  {
                                         "MV":  6,
                                         "FU":  "4",
                                         "AG":  "4+",
                                         "PA":  "-",
                                         "AR":  "9+"
                                     },
                           "skillKeys":  [
                                             "Frenzy"
                                         ],
                           "primary":  "GS",
                           "secondary":  "A"
                       },
                       {
                           "qty":  "0-1",
                           "position":  "Yhetee",
                           "cost":  140000,
                           "stats":  {
                                         "MV":  5,
                                         "FU":  "5",
                                         "AG":  "4+",
                                         "PA":  "-",
                                         "AR":  "9+"
                                     },
                           "skillKeys":  [
                                             "Claws",
                                             "Disturbing Presence",
                                             "Frenzy",
                                             "Loner (4+)",
                                             "Unchannelled Fury"
                                         ],
                           "primary":  "S",
                           "secondary":  "AG"
                       },
                       {
                           "qty":  "0-2",
                           "position":  "NÃ³rdicos Berserker",
                           "cost":  90000,
                           "stats":  {
                                         "MV":  6,
                                         "FU":  "3",
                                         "AG":  "3+",
                                         "PA":  "5+",
                                         "AR":  "8+"
                                     },
                           "skillKeys":  [
                                             "Tackle",
                                             "Frenzy",
                                             "Leap"
                                         ],
                           "primary":  "GS",
                           "secondary":  "AP"
                       },
                       {
                           "qty":  "0-2",
                           "position":  "Beer Boar",
                           "cost":  20000,
                           "stats":  {
                                         "MV":  5,
                                         "FU":  "1",
                                         "AG":  "3+",
                                         "PA":  "-",
                                         "AR":  "6+"
                                     },
                           "skillKeys":  [
                                             "Dodge",
                                             "No Hands",
                                             "Jump Up",
                                             "Stunty",
                                             "Titchy"
                                         ],
                           "primary":  "-",
                           "secondary":  "A"
                       },
                       {
                           "qty":  "0-2",
                           "position":  "Valkyrie",
                           "cost":  95000,
                           "stats":  {
                                         "MV":  7,
                                         "FU":  "3",
                                         "AG":  "3+",
                                         "PA":  "3+",
                                         "AR":  "8+"
                                     },
                           "skillKeys":  [
                                             "Catch",
                                             "Dauntless",
                                             "Pass",
                                             "Strip Ball"
                                         ],
                           "primary":  "AGP",
                           "secondary":  "S"
                       }
                   ],
        "specialRules_es":  "Favorito de..., ClÃ¡sico del Viejo Mundo",
        "specialRules_en":  "Favorito de..., ClÃ¡sico del Viejo Mundo"
    },
    {
        "name":  "Nurgle",
        "specialRules":  "Favorito de..., GestiÃ³n de Equipo",
        "rerollCost":  50000,
        "tier":  3,
        "apothecary":  "SÃ­",
        "image":  "https://i.pinimg.com/736x/d3/c6/1f/d3c61fa5d46fc5872dd609282a34047d.jpg",
        "ratings":  {
                        "fuerza":  75,
                        "agilidad":  65,
                        "velocidad":  57,
                        "armadura":  95,
                        "pase":  30
                    },
        "roster":  [
                       {
                           "qty":  "0-4",
                           "position":  "Bloater",
                           "cost":  115000,
                           "stats":  {
                                         "MV":  4,
                                         "FU":  "4",
                                         "AG":  "4+",
                                         "PA":  "6+",
                                         "AR":  "10+"
                                     },
                           "skillKeys":  [
                                             "Disturbing Presence",
                                             "Foul Appearance",
                                             "Plague Ridden",
                                             "Regeneration"
                                         ],
                           "primary":  "GMS",
                           "secondary":  "A"
                       },
                       {
                           "qty":  "0-1",
                           "position":  "Rotspawn",
                           "cost":  140000,
                           "stats":  {
                                         "MV":  4,
                                         "FU":  "5",
                                         "AG":  "5+",
                                         "PA":  "-",
                                         "AR":  "10+"
                                     },
                           "skillKeys":  [
                                             "Disturbing Presence",
                                             "Foul Appearance",
                                             "Loner (4+)",
                                             "Mighty Blow (+1)",
                                             "Plague Ridden",
                                             "Really Stupid",
                                             "Regeneration",
                                             "Tentacles"
                                         ],
                           "primary":  "S",
                           "secondary":  "AGM"
                       },
                       {
                           "qty":  "0-4",
                           "position":  "Pestigor",
                           "cost":  75000,
                           "stats":  {
                                         "MV":  6,
                                         "FU":  "3",
                                         "AG":  "3+",
                                         "PA":  "4+",
                                         "AR":  "9+"
                                     },
                           "skillKeys":  [
                                             "Horns",
                                             "Plague Ridden",
                                             "Regeneration"
                                         ],
                           "primary":  "GMS",
                           "secondary":  "AP"
                       },
                       {
                           "qty":  "0-12",
                           "position":  "Rotter LÃ­nea",
                           "cost":  35000,
                           "stats":  {
                                         "MV":  5,
                                         "FU":  "3",
                                         "AG":  "3+",
                                         "PA":  "6+",
                                         "AR":  "9+"
                                     },
                           "skillKeys":  [
                                             "Decay",
                                             "Plague Ridden"
                                         ],
                           "primary":  "GM",
                           "secondary":  "AS"
                       }
                   ],
        "specialRules_es":  "Favorito de..., GestiÃ³n de Equipo",
        "specialRules_en":  "Favorito de..., GestiÃ³n de Equipo"
    },
    {
        "name":  "Ogros",
        "specialRules":  "ClÃ¡sico del Viejo Mundo, GestiÃ³n de Equipo, Pelea de Badlands, Peones Baratos, Nivel 4",
        "rerollCost":  50000,
        "tier":  3,
        "apothecary":  "SÃ­",
        "image":  "https://i.pinimg.com/736x/9b/77/bd/9b77bd2d5538a9bfd2be58af2186de82.jpg",
        "ratings":  {
                        "fuerza":  73,
                        "agilidad":  67,
                        "velocidad":  60,
                        "armadura":  87,
                        "pase":  47
                    },
        "roster":  [
                       {
                           "qty":  "0-1",
                           "position":  "Ogros Runt Punter",
                           "cost":  145000,
                           "stats":  {
                                         "MV":  5,
                                         "FU":  "5",
                                         "AG":  "4+",
                                         "PA":  "4+",
                                         "AR":  "10+"
                                     },
                           "skillKeys":  [
                                             "Bone Head",
                                             "Kick Team-mate",
                                             "Mighty Blow (+1)",
                                             "Thick Skull"
                                         ],
                           "primary":  "PS",
                           "secondary":  "AG"
                       },
                       {
                           "qty":  "0-16",
                           "position":  "Gnoblar LÃ­nea",
                           "cost":  0,
                           "stats":  {
                                         "MV":  5,
                                         "FU":  "1",
                                         "AG":  "3+",
                                         "PA":  "5+",
                                         "AR":  "6+"
                                     },
                           "skillKeys":  [
                                             "Dodge",
                                             "Right Stuff",
                                             "Side Step",
                                             "Stunty",
                                             "Titchy"
                                         ],
                           "primary":  "A",
                           "secondary":  "G"
                       },
                       {
                           "qty":  "0-6",
                           "position":  "Ogros Bloqueador",
                           "cost":  140000,
                           "stats":  {
                                         "MV":  5,
                                         "FU":  "5",
                                         "AG":  "4+",
                                         "PA":  "5+",
                                         "AR":  "10+"
                                     },
                           "skillKeys":  [
                                             "Bone Head",
                                             "Mighty Blow (+1)",
                                             "Thick Skull",
                                             "Throw Team-mate"
                                         ],
                           "primary":  "S",
                           "secondary":  "AGP"
                       }
                   ],
        "specialRules_es":  "ClÃ¡sico del Viejo Mundo, GestiÃ³n de Equipo, Pelea de Badlands, Peones Baratos, Nivel 4",
        "specialRules_en":  "ClÃ¡sico del Viejo Mundo, GestiÃ³n de Equipo, Pelea de Badlands, Peones Baratos, Nivel 4"
    },
    {
        "name":  "Alianza del Viejo Mundo",
        "specialRules":  "ClÃ¡sico del Viejo Mundo, GestiÃ³n de Equipo",
        "rerollCost":  50000,
        "tier":  2,
        "apothecary":  "SÃ­",
        "image":  "https://i.pinimg.com/736x/d3/a2/19/d3a219f32e89433aa05b5396f935d334.jpg",
        "ratings":  {
                        "fuerza":  56,
                        "agilidad":  76,
                        "velocidad":  69,
                        "armadura":  89,
                        "pase":  51
                    },
        "roster":  [
                       {
                           "qty":  "0-1",
                           "position":  "Old World Humanos Placador",
                           "cost":  90000,
                           "stats":  {
                                         "MV":  7,
                                         "FU":  "3",
                                         "AG":  "3+",
                                         "PA":  "4+",
                                         "AR":  "9+"
                                     },
                           "skillKeys":  [
                                             "Animosity (all team-mates)",
                                             "Tackle"
                                         ],
                           "primary":  "GS",
                           "secondary":  "A"
                       },
                       {
                           "qty":  "0-1",
                           "position":  "Old World Humanos Receptor",
                           "cost":  65000,
                           "stats":  {
                                         "MV":  8,
                                         "FU":  "2",
                                         "AG":  "3+",
                                         "PA":  "6+",
                                         "AR":  "8+"
                                     },
                           "skillKeys":  [
                                             "Animosity (all team-mates)",
                                             "Catch",
                                             "Dodge"
                                         ],
                           "primary":  "AG",
                           "secondary":  "S"
                       },
                       {
                           "qty":  "0-12",
                           "position":  "Old World Humanos LÃ­nea",
                           "cost":  50000,
                           "stats":  {
                                         "MV":  6,
                                         "FU":  "3",
                                         "AG":  "3+",
                                         "PA":  "4+",
                                         "AR":  "9+"
                                     },
                           "skillKeys":  [

                                         ],
                           "primary":  "G",
                           "secondary":  "AS"
                       },
                       {
                           "qty":  "0-1",
                           "position":  "Old World Humanos Lanzador",
                           "cost":  80000,
                           "stats":  {
                                         "MV":  6,
                                         "FU":  "3",
                                         "AG":  "3+",
                                         "PA":  "3+",
                                         "AR":  "9+"
                                     },
                           "skillKeys":  [
                                             "Animosity (all team-mates)",
                                             "Pass",
                                             "Sure Hands"
                                         ],
                           "primary":  "GP",
                           "secondary":  "AS"
                       },
                       {
                           "qty":  "0-2",
                           "position":  "Old World Halflings Hopeful",
                           "cost":  30000,
                           "stats":  {
                                         "MV":  5,
                                         "FU":  "2",
                                         "AG":  "3+",
                                         "PA":  "4+",
                                         "AR":  "7+"
                                     },
                           "skillKeys":  [
                                             "Animosity (all team-mates)",
                                             "Dodge",
                                             "Right Stuff",
                                             "Stunty"
                                         ],
                           "primary":  "A",
                           "secondary":  "GS"
                       },
                       {
                           "qty":  "0-1",
                           "position":  "Old World Enanos Placador",
                           "cost":  80000,
                           "stats":  {
                                         "MV":  5,
                                         "FU":  "3",
                                         "AG":  "3+",
                                         "PA":  "4+",
                                         "AR":  "10+"
                                     },
                           "skillKeys":  [
                                             "Tackle",
                                             "Loner (3+)",
                                             "Thick Skull"
                                         ],
                           "primary":  "GS",
                           "secondary":  "A"
                       },
                       {
                           "qty":  "0-2",
                           "position":  "Old World Enanos Bloqueador",
                           "cost":  75000,
                           "stats":  {
                                         "MV":  4,
                                         "FU":  "3",
                                         "AG":  "4+",
                                         "PA":  "5+",
                                         "AR":  "10+"
                                     },
                           "skillKeys":  [
                                             "Arm Bar",
                                             "Brawler",
                                             "Loner (3+)",
                                             "Thick Skull"
                                         ],
                           "primary":  "GS",
                           "secondary":  "A"
                       },
                       {
                           "qty":  "0-1",
                           "position":  "Old World Enanos Corredor",
                           "cost":  85000,
                           "stats":  {
                                         "MV":  6,
                                         "FU":  "3",
                                         "AG":  "3+",
                                         "PA":  "4+",
                                         "AR":  "9+"
                                     },
                           "skillKeys":  [
                                             "Loner (3+)",
                                             "Sure Hands",
                                             "Thick Skull"
                                         ],
                           "primary":  "GP",
                           "secondary":  "AS"
                       },
                       {
                           "qty":  "0-1",
                           "position":  "Old World Enanos Troll Slayer",
                           "cost":  95000,
                           "stats":  {
                                         "MV":  5,
                                         "FU":  "3",
                                         "AG":  "4+",
                                         "PA":  "-",
                                         "AR":  "9+"
                                     },
                           "skillKeys":  [
                                             "Tackle",
                                             "Dauntless",
                                             "Frenzy",
                                             "Loner (3+)",
                                             "Thick Skull"
                                         ],
                           "primary":  "GS",
                           "secondary":  "A"
                       }
                   ],
        "specialRules_es":  "ClÃ¡sico del Viejo Mundo, GestiÃ³n de Equipo",
        "specialRules_en":  "ClÃ¡sico del Viejo Mundo, GestiÃ³n de Equipo"
    },
    {
        "name":  "Orcos",
        "specialRules":  "Pelea de Badlands, GestiÃ³n de Equipo",
        "rerollCost":  50000,
        "tier":  1,
        "apothecary":  "SÃ­",
        "image":  "https://i.pinimg.com/736x/c4/15/c0/c415c0a781138589868249c294e95b4a.jpg",
        "ratings":  {
                        "fuerza":  67,
                        "agilidad":  70,
                        "velocidad":  62,
                        "armadura":  95,
                        "pase":  53
                    },
        "roster":  [
                       {
                           "qty":  "0-16",
                           "position":  "Orcos LÃ­nea",
                           "cost":  50000,
                           "stats":  {
                                         "MV":  5,
                                         "FU":  "3",
                                         "AG":  "3+",
                                         "PA":  "4+",
                                         "AR":  "10+"
                                     },
                           "skillKeys":  [
                                             "Animosity (all team-mates)"
                                         ],
                           "primary":  "G",
                           "secondary":  "AS"
                       },
                       {
                           "qty":  "0-1",
                           "position":  "Untrained Troll",
                           "cost":  115000,
                           "stats":  {
                                         "MV":  4,
                                         "FU":  "5",
                                         "AG":  "5+",
                                         "PA":  "5+",
                                         "AR":  "10+"
                                     },
                           "skillKeys":  [
                                             "Always Hungry",
                                             "Loner (4+)",
                                             "Mighty Blow (+1)",
                                             "Projectile Vomit",
                                             "Really Stupid",
                                             "Regeneration",
                                             "Throw Team-mate"
                                         ],
                           "primary":  "S",
                           "secondary":  "AGP"
                       },
                       {
                           "qty":  "0-4",
                           "position":  "Goblins",
                           "cost":  40000,
                           "stats":  {
                                         "MV":  6,
                                         "FU":  "2",
                                         "AG":  "3+",
                                         "PA":  "4+",
                                         "AR":  "8+"
                                     },
                           "skillKeys":  [
                                             "Dodge",
                                             "Right Stuff",
                                             "Stunty"
                                         ],
                           "primary":  "A",
                           "secondary":  "GS"
                       },
                       {
                           "qty":  "0-2",
                           "position":  "Lanzador",
                           "cost":  65000,
                           "stats":  {
                                         "MV":  5,
                                         "FU":  "3",
                                         "AG":  "3+",
                                         "PA":  "3+",
                                         "AR":  "9+"
                                     },
                           "skillKeys":  [
                                             "Animosity (all team-mates)",
                                             "Pass",
                                             "Sure Hands"
                                         ],
                           "primary":  "GS",
                           "secondary":  "AP"
                       },
                       {
                           "qty":  "0-4",
                           "position":  "Blitzer Orco",
                           "cost":  80000,
                           "stats":  {
                                         "MV":  6,
                                         "FU":  "3",
                                         "AG":  "3+",
                                         "PA":  "4+",
                                         "AR":  "10+"
                                     },
                           "skillKeys":  [
                                             "Animosity (all team-mates)",
                                             "Block",
                                             "Break Tackle"
                                         ],
                           "primary":  "GS",
                           "secondary":  "AP"
                       },
                       {
                           "qty":  "0-4",
                           "position":  "FortachÃ³n Bloqueador",
                           "cost":  90000,
                           "stats":  {
                                         "MV":  5,
                                         "FU":  "4",
                                         "AG":  "4+",
                                         "PA":  "-",
                                         "AR":  "10+"
                                     },
                           "skillKeys":  [
                                             "Animosity (all team-mates)",
                                             "Mighty Blow (+1)",
                                             "Thick Skull"
                                         ],
                           "primary":  "GS",
                           "secondary":  "A"
                       }
                   ],
        "specialRules_es":  "Pelea de Badlands, GestiÃ³n de Equipo",
        "specialRules_en":  "Pelea de Badlands, GestiÃ³n de Equipo"
    },
    {
        "name":  "No Muertos",
        "specialRules":  "Escaparate Sylvaniano, GestiÃ³n de Equipo, Maestros de la No-Muerte",
        "rerollCost":  50000,
        "tier":  1,
        "apothecary":  "No",
        "image":  "https://i.pinimg.com/736x/40/d3/3f/40d33f8e8aee4cc2a793df0b0f3b3619.jpg",
        "ratings":  {
                        "fuerza":  68,
                        "agilidad":  64,
                        "velocidad":  60,
                        "armadura":  88,
                        "pase":  32
                    },
        "roster":  [
                       {
                           "qty":  "0-12",
                           "position":  "Esqueleto LÃ­nea",
                           "cost":  40000,
                           "stats":  {
                                         "MV":  5,
                                         "FU":  "3",
                                         "AG":  "4+",
                                         "PA":  "6+",
                                         "AR":  "8+"
                                     },
                           "skillKeys":  [
                                             "Regeneration",
                                             "Thick Skull"
                                         ],
                           "primary":  "G",
                           "secondary":  "AS"
                       },
                       {
                           "qty":  "0-4",
                           "position":  "Ghoul Corredor",
                           "cost":  75000,
                           "stats":  {
                                         "MV":  7,
                                         "FU":  "3",
                                         "AG":  "3+",
                                         "PA":  "4+",
                                         "AR":  "8+"
                                     },
                           "skillKeys":  [
                                             "Dodge"
                                         ],
                           "primary":  "AG",
                           "secondary":  "PS"
                       },
                       {
                           "qty":  "0-2",
                           "position":  "Momia",
                           "cost":  125000,
                           "stats":  {
                                         "MV":  3,
                                         "FU":  "5",
                                         "AG":  "5+",
                                         "PA":  "-",
                                         "AR":  "10+"
                                     },
                           "skillKeys":  [
                                             "Mighty Blow (+1)",
                                             "Regeneration"
                                         ],
                           "primary":  "S",
                           "secondary":  "AG"
                       },
                       {
                           "qty":  "0-2",
                           "position":  "TÃºmulo Placador",
                           "cost":  90000,
                           "stats":  {
                                         "MV":  6,
                                         "FU":  "3",
                                         "AG":  "3+",
                                         "PA":  "5+",
                                         "AR":  "9+"
                                     },
                           "skillKeys":  [
                                             "Tackle",
                                             "Regeneration"
                                         ],
                           "primary":  "GS",
                           "secondary":  "AP"
                       },
                       {
                           "qty":  "0-12",
                           "position":  "Zombie LÃ­nea",
                           "cost":  40000,
                           "stats":  {
                                         "MV":  4,
                                         "FU":  "3",
                                         "AG":  "4+",
                                         "PA":  "-",
                                         "AR":  "9+"
                                     },
                           "skillKeys":  [
                                             "Regeneration"
                                         ],
                           "primary":  "G",
                           "secondary":  "AS"
                       }
                   ],
        "specialRules_es":  "Escaparate Sylvaniano, GestiÃ³n de Equipo, Maestros de la No-Muerte",
        "specialRules_en":  "Escaparate Sylvaniano, GestiÃ³n de Equipo, Maestros de la No-Muerte"
    },
    {
        "name":  "Skaven",
        "specialRules":  "DesafÃ­o SubterrÃ¡neo, GestiÃ³n de Equipo",
        "rerollCost":  50000,
        "tier":  1,
        "apothecary":  "SÃ­",
        "image":  "https://i.pinimg.com/736x/88/35/53/88355314bb5c808eb7dc95fac928d1e4.jpg",
        "ratings":  {
                        "fuerza":  64,
                        "agilidad":  80,
                        "velocidad":  86,
                        "armadura":  84,
                        "pase":  56
                    },
        "roster":  [
                       {
                           "qty":  "0-1",
                           "position":  "Rat Ogros",
                           "cost":  150000,
                           "stats":  {
                                         "MV":  6,
                                         "FU":  "5",
                                         "AG":  "4+",
                                         "PA":  "-",
                                         "AR":  "9+"
                                     },
                           "skillKeys":  [
                                             "Animal Savagery",
                                             "Frenzy",
                                             "Loner (4+)",
                                             "Mighty Blow (+1)",
                                             "Prehensile Tail"
                                         ],
                           "primary":  "S",
                           "secondary":  "AGM"
                       },
                       {
                           "qty":  "0-2",
                           "position":  "Placador",
                           "cost":  90000,
                           "stats":  {
                                         "MV":  7,
                                         "FU":  "3",
                                         "AG":  "3+",
                                         "PA":  "5+",
                                         "AR":  "9+"
                                     },
                           "skillKeys":  [
                                             "Tackle"
                                         ],
                           "primary":  "GS",
                           "secondary":  "AMP"
                       },
                       {
                           "qty":  "0-4",
                           "position":  "Gutter Corredor",
                           "cost":  85000,
                           "stats":  {
                                         "MV":  9,
                                         "FU":  "2",
                                         "AG":  "2+",
                                         "PA":  "4+",
                                         "AR":  "8+"
                                     },
                           "skillKeys":  [
                                             "Dodge"
                                         ],
                           "primary":  "AG",
                           "secondary":  "MPS"
                       },
                       {
                           "qty":  "0-2",
                           "position":  "Lanzador",
                           "cost":  85000,
                           "stats":  {
                                         "MV":  7,
                                         "FU":  "3",
                                         "AG":  "3+",
                                         "PA":  "2+",
                                         "AR":  "8+"
                                     },
                           "skillKeys":  [
                                             "Pass",
                                             "Sure Hands"
                                         ],
                           "primary":  "GP",
                           "secondary":  "AMS"
                       },
                       {
                           "qty":  "0-16",
                           "position":  "Skaven Clanrat LÃ­nea",
                           "cost":  50000,
                           "stats":  {
                                         "MV":  7,
                                         "FU":  "3",
                                         "AG":  "3+",
                                         "PA":  "4+",
                                         "AR":  "8+"
                                     },
                           "skillKeys":  [

                                         ],
                           "primary":  "",
                           "secondary":  "AMS"
                       }
                   ],
        "specialRules_es":  "DesafÃ­o SubterrÃ¡neo, GestiÃ³n de Equipo",
        "specialRules_en":  "DesafÃ­o SubterrÃ¡neo, GestiÃ³n de Equipo"
    },
    {
        "name":  "Slann (NAF)",
        "specialRules":  "Superliga Lustria, GestiÃ³n de Equipo",
        "rerollCost":  50000,
        "tier":  2,
        "apothecary":  "SÃ­",
        "image":  "https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0",
        "ratings":  {
                        "fuerza":  65,
                        "agilidad":  75,
                        "velocidad":  78,
                        "armadura":  90,
                        "pase":  50
                    },
        "roster":  [
                       {
                           "qty":  "0-16",
                           "position":  "LÃ­nea",
                           "cost":  60000,
                           "stats":  {
                                         "MV":  6,
                                         "FU":  "3",
                                         "AG":  "3+",
                                         "PA":  "4+",
                                         "AR":  "9+"
                                     },
                           "skillKeys":  [
                                             "Pogo Stick",
                                             "Very Long Legs"
                                         ],
                           "primary":  "G",
                           "secondary":  "AS"
                       },
                       {
                           "qty":  "0-4",
                           "position":  "Receptor",
                           "cost":  80000,
                           "stats":  {
                                         "MV":  7,
                                         "FU":  "2",
                                         "AG":  "2+",
                                         "PA":  "4+",
                                         "AR":  "8+"
                                     },
                           "skillKeys":  [
                                             "Diving Catch",
                                             "Pogo Stick",
                                             "Very Long Legs"
                                         ],
                           "primary":  "GA",
                           "secondary":  "SP"
                       },
                       {
                           "qty":  "0-4",
                           "position":  "Placador",
                           "cost":  110000,
                           "stats":  {
                                         "MV":  7,
                                         "FU":  "3",
                                         "AG":  "3+",
                                         "PA":  "4+",
                                         "AR":  "9+"
                                     },
                           "skillKeys":  [
                                             "Diving Tackle",
                                             "Leap",
                                             "Pogo Stick",
                                             "Very Long Legs"
                                         ],
                           "primary":  "GAS",
                           "secondary":  "P"
                       },
                       {
                           "qty":  "0-1",
                           "position":  "Kroxigor",
                           "cost":  140000,
                           "stats":  {
                                         "MV":  6,
                                         "FU":  "5",
                                         "AG":  "5+",
                                         "PA":  "-",
                                         "AR":  "10+"
                                     },
                           "skillKeys":  [
                                             "Bone Head",
                                             "Loner (4+)",
                                             "Mighty Blow (+1)",
                                             "Prehensile Tail",
                                             "Thick Skull"
                                         ],
                           "primary":  "S",
                           "secondary":  "GA"
                       }
                   ],
        "specialRules_es":  "Superliga Lustria, GestiÃ³n de Equipo",
        "specialRules_en":  "Superliga Lustria, GestiÃ³n de Equipo"
    },
    {
        "name":  "Reyes de las Tumbas",
        "specialRules":  "Escaparate Sylvaniano, GestiÃ³n de Equipo",
        "rerollCost":  50000,
        "tier":  2,
        "apothecary":  "SÃ­",
        "image":  "https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0",
        "ratings":  {
                        "fuerza":  70,
                        "agilidad":  55,
                        "velocidad":  63,
                        "armadura":  88,
                        "pase":  35
                    },
        "roster":  [
                       {
                           "qty":  "0-2",
                           "position":  "Anointed Placador",
                           "cost":  90000,
                           "stats":  {
                                         "MV":  6,
                                         "FU":  "3",
                                         "AG":  "4+",
                                         "PA":  "6+",
                                         "AR":  "9+"
                                     },
                           "skillKeys":  [
                                             "Tackle",
                                             "Regeneration",
                                             "Thick Skull"
                                         ],
                           "primary":  "GS",
                           "secondary":  "AP"
                       },
                       {
                           "qty":  "0-2",
                           "position":  "Anointed Lanzador",
                           "cost":  70000,
                           "stats":  {
                                         "MV":  6,
                                         "FU":  "3",
                                         "AG":  "4+",
                                         "PA":  "3+",
                                         "AR":  "8+"
                                     },
                           "skillKeys":  [
                                             "Pass",
                                             "Regeneration",
                                             "Sure Hands",
                                             "Thick Skull"
                                         ],
                           "primary":  "GP",
                           "secondary":  "A"
                       },
                       {
                           "qty":  "0-16",
                           "position":  "Esqueleto LÃ­nea",
                           "cost":  40000,
                           "stats":  {
                                         "MV":  5,
                                         "FU":  "3",
                                         "AG":  "4+",
                                         "PA":  "6+",
                                         "AR":  "8+"
                                     },
                           "skillKeys":  [
                                             "Regeneration",
                                             "Thick Skull"
                                         ],
                           "primary":  "G",
                           "secondary":  "AS"
                       },
                       {
                           "qty":  "0-4",
                           "position":  "Tomb Guardian",
                           "cost":  100000,
                           "stats":  {
                                         "MV":  4,
                                         "FU":  "5",
                                         "AG":  "5+",
                                         "PA":  "-",
                                         "AR":  "10+"
                                     },
                           "skillKeys":  [
                                             "Decay",
                                             "Regeneration"
                                         ],
                           "primary":  "S",
                           "secondary":  "AG"
                       }
                   ],
        "specialRules_es":  "Escaparate Sylvaniano, GestiÃ³n de Equipo",
        "specialRules_en":  "Escaparate Sylvaniano, GestiÃ³n de Equipo"
    },
    {
        "name":  "Habitantes del Inframundo",
        "specialRules":  "DesafÃ­o SubterrÃ¡neo, GestiÃ³n de Equipo, Soborno y CorrupciÃ³n",
        "rerollCost":  50000,
        "tier":  3,
        "apothecary":  "SÃ­",
        "image":  "https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0",
        "ratings":  {
                        "fuerza":  60,
                        "agilidad":  75,
                        "velocidad":  77,
                        "armadura":  83,
                        "pase":  53
                    },
        "roster":  [
                       {
                           "qty":  "0-1",
                           "position":  "Underworld Troll",
                           "cost":  115000,
                           "stats":  {
                                         "MV":  4,
                                         "FU":  "5",
                                         "AG":  "5+",
                                         "PA":  "5+",
                                         "AR":  "10+"
                                     },
                           "skillKeys":  [
                                             "Always Hungry",
                                             "Loner (4+)",
                                             "Mighty Blow (+1)",
                                             "Projectile Vomit",
                                             "Really Stupid",
                                             "Regeneration",
                                             "Throw Team-mate"
                                         ],
                           "primary":  "MS",
                           "secondary":  "AGP"
                       },
                       {
                           "qty":  "0-12",
                           "position":  "Underworld Goblins LÃ­nea",
                           "cost":  40000,
                           "stats":  {
                                         "MV":  6,
                                         "FU":  "2",
                                         "AG":  "3+",
                                         "PA":  "4+",
                                         "AR":  "8+"
                                     },
                           "skillKeys":  [
                                             "Dodge",
                                             "Right Stuff",
                                             "Stunty"
                                         ],
                           "primary":  "AM",
                           "secondary":  "GS"
                       },
                       {
                           "qty":  "0-3",
                           "position":  "Skaven Clanrat",
                           "cost":  50000,
                           "stats":  {
                                         "MV":  7,
                                         "FU":  "3",
                                         "AG":  "3+",
                                         "PA":  "4+",
                                         "AR":  "8+"
                                     },
                           "skillKeys":  [
                                             "Animosity (all team-mates)"
                                         ],
                           "primary":  "GM",
                           "secondary":  "AS"
                       },
                       {
                           "qty":  "0-1",
                           "position":  "Skaven Lanzador",
                           "cost":  85000,
                           "stats":  {
                                         "MV":  7,
                                         "FU":  "3",
                                         "AG":  "3+",
                                         "PA":  "2+",
                                         "AR":  "8+"
                                     },
                           "skillKeys":  [
                                             "Animosity (all team-mates)",
                                             "Pass",
                                             "Sure Hands"
                                         ],
                           "primary":  "GMP",
                           "secondary":  "AS"
                       },
                       {
                           "qty":  "0-1",
                           "position":  "Skaven Placador",
                           "cost":  90000,
                           "stats":  {
                                         "MV":  7,
                                         "FU":  "3",
                                         "AG":  "3+",
                                         "PA":  "5+",
                                         "AR":  "9+"
                                     },
                           "skillKeys":  [
                                             "Animosity (all team-mates)",
                                             "Tackle"
                                         ],
                           "primary":  "GMS",
                           "secondary":  "AP"
                       },
                       {
                           "qty":  "0-1",
                           "position":  "Gutter Corredor",
                           "cost":  85000,
                           "stats":  {
                                         "MV":  9,
                                         "FU":  "2",
                                         "AG":  "2+",
                                         "PA":  "4+",
                                         "AR":  "8+"
                                     },
                           "skillKeys":  [
                                             "Animosity (all team-mates)",
                                             "Dodge"
                                         ],
                           "primary":  "AGM",
                           "secondary":  "PS"
                       },
                       {
                           "qty":  "0-1",
                           "position":  "Mutant Rat Ogros",
                           "cost":  150000,
                           "stats":  {
                                         "MV":  6,
                                         "FU":  "5",
                                         "AG":  "4+",
                                         "PA":  "-",
                                         "AR":  "9+"
                                     },
                           "skillKeys":  [
                                             "Animal Savagery",
                                             "Frenzy",
                                             "Loner (4+)",
                                             "Mighty Blow (+1)",
                                             "Prehensile Tail"
                                         ],
                           "primary":  "MS",
                           "secondary":  "AG"
                       },
                       {
                           "qty":  "0-6",
                           "position":  "Underworld Snotlings",
                           "cost":  15000,
                           "stats":  {
                                         "MV":  5,
                                         "FU":  "1",
                                         "AG":  "3+",
                                         "PA":  "5+",
                                         "AR":  "6+"
                                     },
                           "skillKeys":  [
                                             "Dodge",
                                             "Right Stuff",
                                             "Side Step",
                                             "Stunty",
                                             "Swarming",
                                             "Titchy"
                                         ],
                           "primary":  "AM",
                           "secondary":  "G"
                       }
                   ],
        "specialRules_es":  "DesafÃ­o SubterrÃ¡neo, GestiÃ³n de Equipo, Soborno y CorrupciÃ³n",
        "specialRules_en":  "DesafÃ­o SubterrÃ¡neo, GestiÃ³n de Equipo, Soborno y CorrupciÃ³n"
    },
    {
        "name":  "Vampiros",
        "specialRules":  "Escaparate Sylvaniano, GestiÃ³n de Equipo, Lord Vampiro",
        "rerollCost":  50000,
        "tier":  2,
        "apothecary":  "SÃ­",
        "image":  "https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0",
        "ratings":  {
                        "fuerza":  76,
                        "agilidad":  88,
                        "velocidad":  74,
                        "armadura":  88,
                        "pase":  56
                    },
        "roster":  [
                       {
                           "qty":  "0-16",
                           "position":  "Thrall LÃ­nea",
                           "cost":  40000,
                           "stats":  {
                                         "MV":  6,
                                         "FU":  "3",
                                         "AG":  "3+",
                                         "PA":  "4+",
                                         "AR":  "8+"
                                     },
                           "skillKeys":  [

                                         ],
                           "primary":  "",
                           "secondary":  "AS"
                       },
                       {
                           "qty":  "0-2",
                           "position":  "Vampiros Placador",
                           "cost":  110000,
                           "stats":  {
                                         "MV":  6,
                                         "FU":  "4",
                                         "AG":  "2+",
                                         "PA":  "5+",
                                         "AR":  "9+"
                                     },
                           "skillKeys":  [
                                             "Bloodlust (3+)",
                                             "Hypnotic Gaze",
                                             "Juggernaut",
                                             "Regeneration"
                                         ],
                           "primary":  "AGS",
                           "secondary":  "P"
                       },
                       {
                           "qty":  "0-2",
                           "position":  "Vampiros Corredor",
                           "cost":  100000,
                           "stats":  {
                                         "MV":  8,
                                         "FU":  "3",
                                         "AG":  "2+",
                                         "PA":  "4+",
                                         "AR":  "8+"
                                     },
                           "skillKeys":  [
                                             "Bloodlust (2+)",
                                             "Hypnotic Gaze",
                                             "Regeneration"
                                         ],
                           "primary":  "AG",
                           "secondary":  "PS"
                       },
                       {
                           "qty":  "0-2",
                           "position":  "Vampiros Lanzador",
                           "cost":  110000,
                           "stats":  {
                                         "MV":  6,
                                         "FU":  "4",
                                         "AG":  "2+",
                                         "PA":  "2+",
                                         "AR":  "9+"
                                     },
                           "skillKeys":  [
                                             "Bloodlust (2+)",
                                             "Hypnotic Gaze",
                                             "Pass",
                                             "Regeneration"
                                         ],
                           "primary":  "AGP",
                           "secondary":  "S"
                       },
                       {
                           "qty":  "0-1",
                           "position":  "Vargheist",
                           "cost":  150000,
                           "stats":  {
                                         "MV":  5,
                                         "FU":  "5",
                                         "AG":  "4+",
                                         "PA":  "-",
                                         "AR":  "10+"
                                     },
                           "skillKeys":  [
                                             "Bloodlust (3+)",
                                             "Claws",
                                             "Frenzy",
                                             "Loner (4+)",
                                             "Regeneration"
                                         ],
                           "primary":  "S",
                           "secondary":  "AG"
                       }
                   ],
        "specialRules_es":  "Escaparate Sylvaniano, GestiÃ³n de Equipo, Lord Vampiro",
        "specialRules_en":  "Escaparate Sylvaniano, GestiÃ³n de Equipo, Lord Vampiro"
    },
    {
        "name":  "Elfos Silvanos",
        "specialRules":  "Liga de los Reinos Ã‰lficos, GestiÃ³n de Equipo",
        "rerollCost":  50000,
        "tier":  1,
        "apothecary":  "SÃ­",
        "image":  "https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0",
        "ratings":  {
                        "fuerza":  68,
                        "agilidad":  88,
                        "velocidad":  77,
                        "armadura":  86,
                        "pase":  64
                    },
        "roster":  [
                       {
                           "qty":  "0-4",
                           "position":  "Receptor",
                           "cost":  90000,
                           "stats":  {
                                         "MV":  8,
                                         "FU":  "2",
                                         "AG":  "2+",
                                         "PA":  "4+",
                                         "AR":  "8+"
                                     },
                           "skillKeys":  [
                                             "Catch",
                                             "Dodge"
                                         ],
                           "primary":  "AG",
                           "secondary":  "PS"
                       },
                       {
                           "qty":  "0-12",
                           "position":  "Elfos Silvanos LÃ­nea",
                           "cost":  70000,
                           "stats":  {
                                         "MV":  7,
                                         "FU":  "3",
                                         "AG":  "2+",
                                         "PA":  "4+",
                                         "AR":  "8+"
                                     },
                           "skillKeys":  [

                                         ],
                           "primary":  "",
                           "secondary":  "S"
                       },
                       {
                           "qty":  "0-2",
                           "position":  "Lanzador",
                           "cost":  95000,
                           "stats":  {
                                         "MV":  7,
                                         "FU":  "3",
                                         "AG":  "2+",
                                         "PA":  "2+",
                                         "AR":  "8+"
                                     },
                           "skillKeys":  [
                                             "Pass"
                                         ],
                           "primary":  "AGP",
                           "secondary":  "S"
                       },
                       {
                           "qty":  "0-2",
                           "position":  "Wardancer",
                           "cost":  125000,
                           "stats":  {
                                         "MV":  8,
                                         "FU":  "3",
                                         "AG":  "2+",
                                         "PA":  "4+",
                                         "AR":  "8+"
                                     },
                           "skillKeys":  [
                                             "Tackle",
                                             "Dodge",
                                             "Leap"
                                         ],
                           "primary":  "AG",
                           "secondary":  "PS"
                       },
                       {
                           "qty":  "0-1",
                           "position":  "Loren Forest Treeman",
                           "cost":  120000,
                           "stats":  {
                                         "MV":  2,
                                         "FU":  "6",
                                         "AG":  "5+",
                                         "PA":  "5+",
                                         "AR":  "11+"
                                     },
                           "skillKeys":  [
                                             "Loner (4+)",
                                             "Mighty Blow (+1)",
                                             "Stand Firm",
                                             "Strong Arm",
                                             "Take Root",
                                             "Thick Skull",
                                             "Throw Team-mate"
                                         ],
                           "primary":  "S",
                           "secondary":  "AG"
                       }
                   ],
        "specialRules_es":  "Liga de los Reinos Ã‰lficos, GestiÃ³n de Equipo",
        "specialRules_en":  "Liga de los Reinos Ã‰lficos, GestiÃ³n de Equipo"
    },

    {
        "name":  "Bretonnian",
        "specialRules":  "Equipos de Leyenda, Gesti?n de Equipo",
        "rerollCost":  70000,
        "tier":  2,
        "apothecary":  "S?",
        "ratings":  {
                        "fuerza":  68,
                        "agilidad":  72,
                        "velocidad":  73,
                        "armadura":  83,
                        "pase":  58
                    },
        "roster":  [
                       {
                           "qty":  "0-16",
                           "position":  "L?nea Bret?n",
                           "cost":  40000,
                           "stats":  { "MV":  6, "FU":  "3", "AG":  "3+", "PA":  "4+", "AR":  "8+" },
                           "skillKeys":  ["Stand Firm"],
                           "primary":  "G",
                           "secondary":  "AS"
                       },
                       {
                           "qty":  "0-4",
                           "position":  "Yeoman",
                           "cost":  70000,
                           "stats":  { "MV":  6, "FU":  "3", "AG":  "3+", "PA":  "5+", "AR":  "9+" },
                           "skillKeys":  ["Wrestle"],
                           "primary":  "GS",
                           "secondary":  "A"
                       },
                       {
                           "qty":  "0-4",
                           "position":  "Blitzer Bret?n",
                           "cost":  105000,
                           "stats":  { "MV":  7, "FU":  "3", "AG":  "3+", "PA":  "3+", "AR":  "9+" },
                           "skillKeys":  ["Catch", "Dauntless", "Block"],
                           "primary":  "GAS",
                           "secondary":  "P"
                       }
                   ],
        "specialRules_es":  "Equipos de Leyenda, Gesti?n de Equipo",
        "specialRules_en":  "Legend Teams, Team Management"
    },
    {
        "name":  "Imperial Nobility",
        "specialRules":  "Cl?sica del Viejo Mundo, Gesti?n de Equipo",
        "rerollCost":  70000,
        "tier":  2,
        "apothecary":  "S?",
        "ratings":  {
                        "fuerza":  72,
                        "agilidad":  67,
                        "velocidad":  64,
                        "armadura":  88,
                        "pase":  60
                    },
        "roster":  [
                       {
                           "qty":  "0-16",
                           "position":  "Criado Imperial",
                           "cost":  45000,
                           "stats":  { "MV":  6, "FU":  "3", "AG":  "4+", "PA":  "4+", "AR":  "8+" },
                           "skillKeys":  ["Fend"],
                           "primary":  "G",
                           "secondary":  "AS"
                       },
                       {
                           "qty":  "0-4",
                           "position":  "Lanzador",
                           "cost":  75000,
                           "stats":  { "MV":  6, "FU":  "3", "AG":  "3+", "PA":  "3+", "AR":  "8+" },
                           "skillKeys":  ["Sure Hands", "Pass"],
                           "primary":  "GP",
                           "secondary":  "A"
                       },
                       {
                           "qty":  "0-2",
                           "position":  "Blitzer Noble",
                           "cost":  105000,
                           "stats":  { "MV":  7, "FU":  "3", "AG":  "3+", "PA":  "4+", "AR":  "9+" },
                           "skillKeys":  ["Catch", "Block"],
                           "primary":  "GAS",
                           "secondary":  "P"
                       },
                       {
                           "qty":  "0-4",
                           "position":  "Guardaespaldas",
                           "cost":  90000,
                           "stats":  { "MV":  6, "FU":  "3", "AG":  "3+", "PA":  "5+", "AR":  "9+" },
                           "skillKeys":  ["Stand Firm", "Wrestle"],
                           "primary":  "GS",
                           "secondary":  "A"
                       },
                       {
                           "qty":  "0-1",
                           "position":  "Ogro",
                           "cost":  140000,
                           "stats":  { "MV":  5, "FU":  "5", "AG":  "4+", "PA":  "5+", "AR":  "10+" },
                           "skillKeys":  ["Bone Head", "Loner (4+)", "Mighty Blow (+1)", "Throw Team-mate"],
                           "primary":  "F",
                           "secondary":  "AGP"
                       }
                   ],
        "specialRules_es":  "Cl?sica del Viejo Mundo, Gesti?n de Equipo",
        "specialRules_en":  "Old World Classic, Team Management"
    },
    {
        "name":  "Khorne",
        "specialRules":  "Favoritos de los Dioses, Gesti?n de Equipo",
        "rerollCost":  60000,
        "tier":  2,
        "apothecary":  "S?",
        "ratings":  {
                        "fuerza":  82,
                        "agilidad":  60,
                        "velocidad":  68,
                        "armadura":  88,
                        "pase":  42
                    },
        "roster":  [
                       {
                           "qty":  "0-16",
                           "position":  "L?nea Merodeador",
                           "cost":  50000,
                           "stats":  { "MV":  6, "FU":  "3", "AG":  "3+", "PA":  "4+", "AR":  "8+" },
                           "skillKeys":  ["Frenzy"],
                           "primary":  "GM",
                           "secondary":  "AS"
                       },
                       {
                           "qty":  "0-4",
                           "position":  "Buscador de Sangre",
                           "cost":  105000,
                           "stats":  { "MV":  5, "FU":  "4", "AG":  "4+", "PA":  "6+", "AR":  "10+" },
                           "skillKeys":  ["Frenzy"],
                           "primary":  "F",
                           "secondary":  "GM"
                       },
                       {
                           "qty":  "0-2",
                           "position":  "Khorngor",
                           "cost":  70000,
                           "stats":  { "MV":  6, "FU":  "3", "AG":  "3+", "PA":  "4+", "AR":  "9+" },
                           "skillKeys":  ["Horns", "Frenzy", "Juggernaut"],
                           "primary":  "GM",
                           "secondary":  "AS"
                       },
                       {
                           "qty":  "0-1",
                           "position":  "Engendro de Sangre",
                           "cost":  160000,
                           "stats":  { "MV":  5, "FU":  "5", "AG":  "4+", "PA":  "-", "AR":  "10+" },
                           "skillKeys":  ["Claws", "Frenzy", "Loner (4+)", "Mighty Blow (+1)", "Unchannelled Fury"],
                           "primary":  "F",
                           "secondary":  "AGM"
                       }
                   ],
        "specialRules_es":  "Favoritos de los Dioses, Gesti?n de Equipo",
        "specialRules_en":  "Favoured of the Gods, Team Management"
    },
    {
        "name":  "Snotling",
        "specialRules":  "Desaf?o del Inframundo, Gesti?n de Equipo",
        "rerollCost":  60000,
        "tier":  3,
        "apothecary":  "S?",
        "ratings":  {
                        "fuerza":  32,
                        "agilidad":  88,
                        "velocidad":  73,
                        "armadura":  54,
                        "pase":  44
                    },
        "roster":  [
                       {
                           "qty":  "0-16",
                           "position":  "L?nea Snotling",
                           "cost":  15000,
                           "stats":  { "MV":  5, "FU":  "1", "AG":  "3+", "PA":  "5+", "AR":  "5+" },
                           "skillKeys":  ["Dodge", "Right Stuff", "Sidestep", "Sneaky Git", "Swarming"],
                           "primary":  "A",
                           "secondary":  "G"
                       },
                       {
                           "qty":  "0-2",
                           "position":  "Fun-Hopper",
                           "cost":  20000,
                           "stats":  { "MV":  6, "FU":  "1", "AG":  "3+", "PA":  "5+", "AR":  "5+" },
                           "skillKeys":  ["Dodge", "Right Stuff", "Sidestep", "Pogo Stick"],
                           "primary":  "A",
                           "secondary":  "G"
                       },
                       {
                           "qty":  "0-2",
                           "position":  "Stilty Runna",
                           "cost":  20000,
                           "stats":  { "MV":  6, "FU":  "1", "AG":  "3+", "PA":  "5+", "AR":  "5+" },
                           "skillKeys":  ["Dodge", "Right Stuff", "Sidestep", "Sprint"],
                           "primary":  "A",
                           "secondary":  "G"
                       },
                       {
                           "qty":  "0-2",
                           "position":  "Fungus Flinga",
                           "cost":  30000,
                           "stats":  { "MV":  5, "FU":  "1", "AG":  "3+", "PA":  "4+", "AR":  "5+" },
                           "skillKeys":  ["Bombardier", "Dodge", "Right Stuff", "Secret Weapon", "Sidestep"],
                           "primary":  "A",
                           "secondary":  "GP"
                       },
                       {
                           "qty":  "0-2",
                           "position":  "Pump Wagon",
                           "cost":  105000,
                           "stats":  { "MV":  4, "FU":  "5", "AG":  "5+", "PA":  "-", "AR":  "8+" },
                           "skillKeys":  ["Dirty Player (+1)", "Loner (4+)", "Mighty Blow (+1)", "No Hands", "Secret Weapon", "Stand Firm"],
                           "primary":  "F",
                           "secondary":  "G"
                       },
                       {
                           "qty":  "0-2",
                           "position":  "Troll Entrenado",
                           "cost":  115000,
                           "stats":  { "MV":  4, "FU":  "5", "AG":  "4+", "PA":  "5+", "AR":  "10+" },
                           "skillKeys":  ["Always Hungry", "Loner (4+)", "Mighty Blow (+1)", "Really Stupid", "Regeneration", "Throw Team-mate", "Projectile Vomit"],
                           "primary":  "F",
                           "secondary":  "AGP"
                       }
                   ],
        "specialRules_es":  "Desaf?o del Inframundo, Gesti?n de Equipo",
        "specialRules_en":  "Underworld Challenge, Team Management"
    }

];

