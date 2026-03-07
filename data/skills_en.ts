import { Skill } from "../types";

export const skillsData: Skill[] = [
    {
        "name": "Dauntless",
        "category": "General",
        "description": "When this player performs a Block action, if the target has a higher Strength, roll a D6 and add this player's Strength. If the total exceeds the target's Strength, this player's Strength is increased to match the target's for this block."
    },
    {
        "name": "Claws",
        "category": "Mutation",
        "description": "When an Armour roll is made against an opponent as a result of a block by this player, a result of 8+ (before modifiers) breaks their armour, regardless of their actual AV."
    },
    {
        "name": "Bombardier",
        "category": "Trait",
        "description": "When activated and if Standing, this player can perform a 'Throw Bomb' action. It's similar to a Pass but cannot move first, bombs don't bounce, and if fumbled, it explodes in the player's square. If caught, it explodes on 4+; on 1-3, it must be thrown again."
    },
    {
        "name": "Break Tackle",
        "category": "Strength",
        "description": "Once per activation, when making an Agility test to Dodge, this player may modify the roll by +1 if ST is 4 or less, or +2 if ST is 5 or more."
    },
    {
        "name": "Catch",
        "category": "Agility",
        "description": "This player can re-roll a failed Agility test when attempting to catch the ball."
    },
    {
        "name": "Bone Head",
        "category": "Trait",
        "description": "When activated, roll a D6. On a 1, the player forgets what they were doing and their activation ends. They lose their Tackle Zone until their next activation."
    },
    {
        "name": "Chainsaw",
        "category": "Trait",
        "description": "The player can perform a Chainsaw attack instead of a block. Add +3 to the Armour roll, but may hit themselves on a natural 1."
    },
    {
        "name": "Tackle",
        "category": "General",
        "description": "Opponents dodging from this player's Tackle Zone cannot use the Dodge skill. Also applies if this player performs a Block and the result is 'Stumble'."
    },
    {
        "name": "Big Hand",
        "category": "Mutation",
        "description": "Ignore modifiers for being marked or rain when attempting to pick up the ball."
    },
    {
        "name": "Ball & Chain",
        "category": "Trait",
        "description": "This player can only perform 'Ball & Chain Move' actions using the throw-in template. Automatically passes Dodge tests. Must block any standing player in their path. If they fall, an Injury roll is made automatically."
    },
    {
        "name": "Animosity",
        "category": "Trait",
        "description": "Roll a D6 when attempting to hand-off or pass to a teamwork of the listed type. On a 1, the player refuses to do so and their activation ends."
    },
    {
        "name": "Always Hungry",
        "category": "Trait",
        "description": "When attempting Throw Team-mate, roll a D6. On a 1, try to eat the team-mate. Roll another D6: on a 1 the team-mate is eaten and permanently removed."
    },
    {
        "name": "Accurate",
        "category": "Pass",
        "description": "Add an additional +1 modifier to the Passing Ability test when performing a Quick or Short Pass."
    },
    {
        "name": "Nerves of Steel",
        "category": "Pass",
        "description": "The player may ignore any modifier for being Marked when they attempt to perform a Pass action, catch the ball, or interfere with a pass."
    },
    {
        "name": "Grab",
        "category": "Strength",
        "description": "Prevents the target from using Sidestep. When pushing, the player may choose any free adjacent square for the opponent."
    },
    {
        "name": "Juggernaut",
        "category": "Strength",
        "description": "On a Blitz, can treat 'Both Down' as 'Push Back'. Target cannot use Stand Firm or Wrestle."
    },
    {
        "name": "Foul Appearance",
        "category": "Mutation",
        "description": "Any player declaring a Block or special action against this player must first roll 2+ on 1D6 or the action is lost."
    },
    {
        "name": "Guard",
        "category": "Strength",
        "description": "This player can offer offensive and defensive assists regardless of how many opposing players are marking them."
    },
    {
        "name": "Hypnotic Gaze",
        "category": "Trait",
        "description": "Special action: make an Agility test against a marked opponent. If successful, the opponent loses their Tackle Zone."
    },
    {
        "name": "Mighty Blow (+1)",
        "category": "Strength",
        "description": "When an opponent is Knocked Down as a result of a block by this player, you may modify the Armour or Injury roll by +1."
    },
    {
        "name": "Multiple Block",
        "category": "Strength",
        "description": "Can perform two simultaneous blocks against marked opponents, but subtracts -2 from Strength."
    },
    {
        "name": "Frenzy",
        "category": "General",
        "description": "Must follow up if the opponent is pushed. If the target is still standing, must perform a second block if able."
    },
    {
        "name": "Pass",
        "category": "Pass",
        "description": "This player may re-roll a failed Passing Ability test when performing a Pass action."
    },
    {
        "name": "Hail Mary Pass",
        "category": "Pass",
        "description": "Pass target can be anywhere on the pitch. Never accurate. Test Mapping Ability to determine if wildly inaccurate or fumbled. Cannot be interfered with."
    },
    {
        "name": "Stand Firm",
        "category": "General",
        "description": "May choose not to be pushed back, whether as a result of a Block or chain push."
    },
    {
        "name": "Leap",
        "category": "Agility",
        "description": "May jump over any adjacent square (occupied or not). Reduces negative modifiers when jumping by 1."
    },
    {
        "name": "No Hands",
        "category": "Trait",
        "description": "The player cannot pick up, intercept, or carry the ball. Automatically fails any catch roll."
    },
    {
        "name": "Horns",
        "category": "Trait",
        "description": "On a Blitz, adds +1 to Strength during the block."
    },
    {
        "name": "Extra Arms",
        "category": "Mutation",
        "description": "Add +1 when picking up the ball, catching it, or attempting an interception."
    },
    {
        "name": "Leader",
        "category": "Pass",
        "description": "Gains a single extra team re-roll, which can only be used if there is at least one player with this skill on the pitch."
    },
    {
        "name": "Prehensile Tail",
        "category": "Mutation",
        "description": "Opponents attempting to Dodge or Jump out of this player's Tackle Zone subtract 1 from their Agility test."
    },
    {
        "name": "Diving Tackle",
        "category": "Agility",
        "description": "If an opponent marked by this player passes their Agility test to Dodge or Jump, this player can be Placed Prone to subtract 2 from the result."
    },
    {
        "name": "Diving Catch",
        "category": "Agility",
        "description": "May attempt to catch the ball if it lands in their Tackle Zone after scattering. Add +1 to catch attempts for accurate pases."
    },
    {
        "name": "Kick",
        "category": "General",
        "description": "When kicking off, you may halve the scatter distance of the ball."
    },
    {
        "name": "Loner (4+)",
        "category": "Trait",
        "description": "To use a team re-roll, must first roll 4+ on 1D6. If failed, the re-roll is lost and the original result stands."
    },
    {
        "name": "Dump-off",
        "category": "Pass",
        "description": "If targeted by a Block and in possession of the ball, may perform a Quick Pass before the block is resolved."
    },
    {
        "name": "Dodge",
        "category": "Agility",
        "description": "Once per team turn, may re-roll a failed Agility test when Dodging. Also applies when targeted by a Block if the result is 'Stumble'."
    },
    {
        "name": "Really Stupid",
        "category": "Trait",
        "description": "Like Bone Head but fails on 1-3 (4+ success). If an adjacent team-mate lacks this trait, add +2 to the roll."
    },
    {
        "name": "Jump Up",
        "category": "Agility",
        "description": "Standing up is free. May attempt to stand up and block with an Agility test (+1)."
    },
    {
        "name": "Disturbing Presence",
        "category": "Mutation",
        "description": "Opponents within 3 squares subtract 1 from Pass, Catch, or Intercept tests."
    },
    {
        "name": "Dirty Player (+1)",
        "category": "General",
        "description": "Add +1 to Armour or Injury rolls when committing a Foul."
    },
    {
        "name": "Secret Weapon",
        "category": "Trait",
        "description": "When a drive ends, this player is Sent-off for committing a Foul (unless a bribe is used)."
    },
    {
        "name": "Right Stuff",
        "category": "Trait",
        "description": "If Strength is 3 or less, may be thrown by a team-mate with Throw Team-mate skill."
    },
    {
        "name": "Sidestep",
        "category": "Agility",
        "description": "When pushed back, the coach chooses which free adjacent square the player moves to."
    },
    {
        "name": "Safe Pass",
        "category": "Pass",
        "description": "If a pass is fumbled, the player keeps the ball and their activation ends. No turnover unless they were forced to fumble."
    },
    {
        "name": "Shadowing",
        "category": "General",
        "description": "May move into the square vacated by an opponent who leaves their Tackle Zone with a competitive Movement test."
    },
    {
        "name": "Sneaky Pete",
        "category": "Agility",
        "description": "When fouling, not sent-off if a natural double is rolled on armor. May continue moving after the foul."
    },
    {
        "name": "Stunty",
        "category": "Trait",
        "description": "Ignores modifiers for being marked when Dodging. Injury rolls against them use the Stunty table."
    },
    {
        "name": "Stab",
        "category": "Trait",
        "description": "Instead of blocking, make an unmodified Armour roll against the target. If broken, they are knocked down and an Injury roll is made."
    },
    {
        "name": "Titchy",
        "category": "Trait",
        "description": "Add +1 to Agility tests for Dodging. Opponents dodging into their Tackle Zone suffer no penalty."
    },
    {
        "name": "Take Root",
        "category": "Trait",
        "description": "When activated, roll a D6. On a 1, the player becomes Rooted: cannot move from their square until the end of the drive or until knocked down."
    },
    {
        "name": "Throw Team-mate",
        "category": "Trait",
        "description": "If ST 5 or more, can perform Throw Team-mate action with a team-mate who has the Right Stuff trait."
    },
    {
        "name": "Two Heads",
        "category": "Mutation",
        "description": "Add +1 to Agility tests for Dodging."
    },
    {
        "name": "Block",
        "category": "General",
        "description": "Can choose to ignore a 'Both Down' result during a Block and not be Knocked Down."
    },
    {
        "name": "Thick Skull",
        "category": "Strength",
        "description": "Treated as KO only on a roll of 9 on the Injury table (8 is treated as Stunned)."
    },
    {
        "name": "Very Long Legs",
        "category": "Mutation",
        "description": "Reduces negative modifiers for Jumping by 1. Add +2 to Interceptions."
    },
    {
        "name": "Sure Hands",
        "category": "General",
        "description": "May re-roll a failed attempt to pick up the ball. Strip Ball skill cannot be used against this player."
    },
    {
        "name": "Sure Feet",
        "category": "Agility",
        "description": "Once per team turn, may re-roll the D6 when attempting to Rush (Go For It)."
    },
    {
        "name": "Animal Savagery",
        "category": "Trait",
        "description": "When activated, roll a D6 (+2 if Block/Blitz). On 1-3, must attack an adjacent team-mate to proceed."
    },
    {
        "name": "Regeneration",
        "category": "Trait",
        "description": "After a Casualty roll, roll a D6. On a 4+, the casualty is discarded and the player is placed in the Reserves box."
    },
    {
        "name": "Tentacles",
        "category": "Mutation",
        "description": "When a marked opponent attempts to move, roll 1D6 + this player's ST - opponent's ST. On 6+, the opponent is held."
    }
];
