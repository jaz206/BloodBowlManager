import { Inducement } from '../types';

export const inducementsData: Inducement[] = [
    {
        name: "Bloodweiser Kegs",
        cost: 50000,
        description: "Help players recover from Knockouts (K.O.). Add +1 to the recovery roll for each keg (max 2).",
        strategy: "Excellent against teams that hit hard if you have low armour."
    },
    {
        name: "Halfling Master Chef",
        cost: 300000,
        description: "At the start of each half, roll 3D6. For each 4+, you steal a Team Re-roll from the opponent.",
        strategy: "The best inducement in the game if you can afford it. Destroys the opponent's resource management."
    },
    {
        name: "Wandering Apothecary",
        cost: 100000,
        description: "A second apothecary to use during the match.",
        strategy: "Essential if your star players are at risk."
    },
    {
        name: "Bribe",
        cost: 100000,
        description: "Allows you to argue with the referee when a player is sent off. Roll 1D6: on 2-6 the player goes to reserves instead.",
        strategy: "Fundamental for foul-play teams (Goblins, Snotlings)."
    },
    {
        name: "Necromancer's Assistant",
        cost: 100000,
        description: "An assistant that allows you to re-roll a Regeneration roll.",
        strategy: "Only for teams with the Regeneration rule."
    },
    {
        name: "Star Player Signing",
        cost: 80000,
        description: "Hire a legendary mercenary for this match.",
        strategy: "Search for a player that covers your current roster's weaknesses."
    }
];
