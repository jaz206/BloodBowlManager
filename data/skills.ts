import { Skill } from "../types";

export const skillsData: Skill[] = [
  {
    "name": "Dauntless",
    "category": "General",
    "description": "When this player performs a Block action (on its own or as part of a Blitz action), if the nominated target has a higher Strength characteristic than this player before counting offensive or defensive assists but after applying any other modifiers, roll a D6 and add this player’s Strength characteristic to the result. If the total is higher than the target’s Strength characteristic, this player increases their Strength characteristic to be equal to that of the target of the Block action, before countingoffensive or defensive assists, for the duration of this Block action.\n\nIf this player has another Skill that allows them to perform more than one Block action, such as Frenzy, they must make a Dauntless roll before each separate Block action is performed."
  },
  {
    "name": "Claws",
    "category": "Mutation",
    "description": "When you make an Armour roll against an opposition player that was Knocked Down as the result of a Block action performed by this player, a roll of 8+ before applying any modifiers will break their armour, regardless of their actual Armour Value."
  },
  {
    "name": "Bombardier",
    "category": "Trait",
    "description": "When activated and if they are Standing, this player can perform a ‘Throw Bomb’ Special action. This Special action is neither a Pass action nor a Throw Team-mate action, so does not prevent another player performing one of those actions during the same team turn. However, only a single player with this Trait may perform this Special action each team turn.\n\nA Bomb can be thrown and caught, and the throw interfered with, just like a ball, using the rules for Pass actions as described on page 48, with the following exceptions:\n\n• A player may not stand up or move before performing a Throw Bomb action.\n• Bombs do not bounce and can come to rest on the ground in an occupied square. Should a player fail to catch a Bomb, it will come to rest on the ground in the square that player occupies.\n• If a Bomb is fumbled, it will explode immediately in the square occupied by the player attempting to throw it.\n• If a Bomb comes to rest on the ground in an empty square or is caught by an opposition player, no Turnover is caused.\n• A player that is in possession of the ball can still catch a Bomb.\n• Any Skills that can be used when performing a Pass action can also be used when performing a Throw Bomb Special action, with the exception of On the Ball.\n\nIf a Bomb is caught by a player on either team, roll a D6:\n\n• On a roll of 4+, the Bomb explodes immediately, as described below.\n• On a roll of 1-3, that player must throw the Bomb again immediately. This throw takes place out of the normal sequence of play. \n\nShould a Bomb ever leave the pitch, it explodes in the crowd with no effect (on the game) before the crowd can throw it back.\n\nWhen a Bomb comes to rest on the ground, in either an unoccupied square, in a square occupied by a player that failed to catch the Bomb or in a square occupied by a Prone or Stunned player, it will explode immediately:\n\n• If the Bomb explodes in an occupied square, that player is automatically hit by the explosion.\n• Roll a D6 for each player (from either team) that occupies a square adjacent to the one in which the Bomb exploded:\n- On a roll of 4+, the player has been hit by the explosion.\n- On a roll of 1-3, the player manages to avoid the explosion.\n• Any Standing players hit by the explosion are Placed Prone.\n• An Armour roll (and possibly an Injury roll as well) is made against any player hit by the explosion, even if they were already Prone or Stunned. \n• You may apply a +1 modifier to either the Armour roll or Injury roll. This modifier may be applied after the roll has been made."
  },
  {
    "name": "Break Tackle",
    "category": "Strength",
    "description": "Once during their activation, after making an Agility test in order to Dodge, this player may modify the dice roll by +1 if their Strength characteristic is 4 or less, or by +2 if their Strength characteristic is 5 or more."
  },
  {
    "name": "Catch",
    "category": "Agility",
    "description": "This player may re-roll a failed Agility test when attempting to catch the ball."
  },
  {
    "name": "Bone Head",
    "category": "Trait",
    "description": "When this player is activated, even if they are Prone or have lost their Tackle Zone, immediately after declaring the action they will perform but before performing the action, roll a D6:\n\n• On a roll of 1, this player forgets what they are doing and their activation ends immediately. Additionally, this player loses their Tackle Zone until they are next activated.\n• On a roll of 2+, this player continues their activation as normal and completes their declared action.\n\nIf you declared that this player would perform an action which can only be performed once per team turn and this player’s activation ended before the action could be completed, the action is considered to have been performed and no other player on your team may perform the same action this team turn."
  },
  {
    "name": "Chainsaw",
    "category": "Trait",
    "description": "Instead of performing a Block action (on its own or as part of a Blitz action), this player may perform a ‘Chainsaw Attack’ Special action. Exactly as described for a Block action, nominate a single Standing player to be the target of the Chainsaw Attack Special action. There is no limit to how many players with this Trait may perform this Special action each team turn.\n\nTo perform a Chainsaw Attack Special action, roll a D6:\n\n• On a roll of 2+, the nominated target is hit by a Chainsaw!\n• On a roll of 1, the Chainsaw will violently ‘kick-back’ and hit the player wielding it.\n• In either case, an Armour roll is made against the player hit by the Chainsaw, adding +3 to the result.\n• If the armour of the player hit is broken, they become Prone and an Injury roll is made against them. This Injury roll cannot be modified in any way.\n• If the armour of the player hit is not broken, this Trait has no effect.\n\nThis player can only use the Chainsaw once per turn (i.e., a Chainsaw cannot be used with Frenzy or Multiple Block) and if used as part of a Blitz action, this player cannot continue moving after using it.\n\nIf this player Falls Over or is Knocked Down, the opposing coach may add +3 to the Armour roll made against the player.\n\nIf an opposition player performs a Block action targeting this player and a Player Down! or a POW! result is applied, +3 is added to the Armour roll. If a Both Down result is applied, +3 is added to both Armour rolls.\n\nFinally, this player may use their Chainsaw when they perform a Foul action. Roll a D6 for kick-back as described above. Once again, an Armour roll is made against the player hit by the Chainsaw, adding +3 to the score."
  },
  {
    "name": "Block",
    "category": "General",
    "description": "When a Both Down result is applied during a Block action, this player may choose to ignore it and not be Knocked Down, as described on page 57."
  },
  {
    "name": "Big Hand",
    "category": "Mutation",
    "description": "This player may ignore any modifier(s) for being Marked or for Pouring Rain weather conditions when they attempt to pick up the ball."
  },
  {
    "name": "Ball & Chain",
    "category": "Trait",
    "description": "When this player is activated, the only action they may perform is a ‘Ball & Chain Move’ Special action. There is no limit to how many players with this Trait may perform this Special action each team turn.\n\nWhen this player performs this Special action:\n\n• Place the Throw-in template over the player, facing towards either End Zone or either sideline as you wish.\n• Roll a D6 and move the player one square in the direction indicated.\n• A player with a Ball & Chain automatically passes any Agility tests they may be required to make in order to Dodge, regardless of any modifiers.\n• If this movement takes the player off the pitch, they risk Injury by the Crowd.\n• If this movement takes the player into a square in which the ball is placed, the player is considered to have moved involuntarily. Therefore, they may not attempt to pick the ball up and the ball will bounce.\n\nRepeat this process for each square the player moves.\n\nIf this player would move into a square that is occupied by a Standing player from either team, they must perform a Block action against that player, following the normal rules, but with the following exceptions:\n\n• A Ball & Chain player ignores the Foul Appearance skill.\n• A Ball & Chain player must follow-up if they push-back another player.\n\nIf this player moves into a square that is occupied by a Prone or Stunned player from either team, for any reason, that player is immediately pushed back and an Armour roll is made against them.\n\nThis player may Rush. Declare that the player will Rush before placing the Throw-in template and rolling the D6 to determine direction:\n\n• If this player Rushes into an unoccupied square, move them as normal and roll a D6:\n- On a roll of 2+, this player moves without mishap.\n- On a roll of 1 (before or after modification), the player Falls Over.\n• If this player Rushes into a square that is occupied by a standing player from either team, roll a D6:\n- On a roll of 2+, this player moves without mishap and will perform a Block action against the player occupying the square as described previously.\n- On a roll of 1 (before or after modification), the player occupying the square is pushed back and this player will Fall Over after moving into the vacated square.\n\nIf this player ever Falls Over, is Knocked Down or is Placed Prone, an Injury roll is immediately made against them (no Armour roll is required), treating a Stunned result as a KO’d result.\n\nA player with this Trait cannot also have the Diving Tackle, Frenzy, Grab, Leap, Multiple Block, On the Ball or Shadowing skills. This Trait must still be used if the player is Prone or has lost their Tackle Zone."
  },
  {
    "name": "Animosity",
    "category": "Trait",
    "description": "This player is jealous of and dislikes certain other players on their team, as shown in brackets after the name of the Skill on this player’s profile. This may be defined by position or race. For example, a Skaven Thrower on an Underworld Denizens team has Animosity (Underworld Goblin Linemen), meaning they suffer Animosity towards any Underworld Goblin Linemen players on their team. Whereas a Skaven Renegade on a Chaos Renegade team has Animosity (all team-mates), meaning they suffer Animosity towards all of their team-mates equally.\n\nWhen this player wishes to perform a Hand-off action to a team-mate of the type listed, or attempts to perform a Pass action and the target square is occupied by a team-mate of the type listed, this player may refuse to do so. Roll a D6. On a roll of 1, this player refuses to perform the action and their activation comes to an end. Animosity does not extend to Mercenaries or Star Players."
  },
  {
    "name": "Always Hungry",
    "category": "Trait",
    "description": "If this player wishes to perform a Throw Team-mate action, roll a D6 after they have finished moving, but before they throw their team-mate. On a roll of 2+, continue with the throw as normal. On a roll of 1, this player will attempt to eat their team-mate. Roll another D6:\n\n• On a roll of 1, the team-mate has been eaten and is immediately removed from the Team Draft list. No apothecary can save them and no Regeneration attempts can be made. If the team-mate was in possession of the ball, it will bounce from the square this player occupies.\n• On a roll of 2+, the team-mate squirms free and the Throw Team-mate action is automatically fumbled, as described on page 53."
  },
  {
    "name": "Accurate",
    "category": "Passing",
    "description": "When this player performs a Quick Pass action or a Short Pass action, you may apply an additional +1 modifier to the Passing Ability test."
  },
  {
    "name": "Nerves of Steel",
    "category": "Passing",
    "description": "This player may ignore any modifier(s) for being Marked when they attempt to perform a Pass action, attempt to catch the ball or attempt to interfere with a pass."
  },
  {
    "name": "Grab",
    "category": "Strength",
    "description": "When this player performs a Block action (on its own or as part of a Blitz action), using this Skill prevents the target of the Block action from using the Sidestep skill.\n\nAdditionally, when this player performs a Block Action on its own (but not as part of a Blitz action), if the target is pushed back, this player may choose any unoccupied square adjacent to the target to push that player into. If there are no unoccupied squares, this Skill cannot be used.\n\nA player with this Skill cannot also have the Frenzy skill."
  },
  {
    "name": "Juggernaut",
    "category": "Strength",
    "description": "When this player performs a Block action as part of a Blitz action (but not on its own), they may choose to treat a Both Down result as a Push Back result. In addition, when this player performs a Block action as part of a Blitz action, the target of the Block action may not use the Fend, Stand Firm or Wrestle skills."
  },
  {
    "name": "Foul Appearance",
    "category": "Mutation",
    "description": "When an opposition player declares a Block action targeting this player (on its own or as part of a Blitz action), or any Special action that targets this player, their coach must first roll a D6, even if this player has lost their Tackle Zone. On a roll of 1, the player cannot perform the declared action and the action is wasted. This Skill may still be used if the player is Prone, Stunned, or has lost their Tackle Zone."
  },
  {
    "name": "Guard",
    "category": "Strength",
    "description": "This player can offer both offensive and defensive assists regardless of how many opposition players are Marking them."
  },
  {
    "name": "Hypnotic Gaze",
    "category": "Trait",
    "description": "During their activation, this player may perform a ‘Hypnotic Gaze’ Special action. There is no limit to how many players with this Trait may perform this Special action each team turn.\n\nTo perform a Hypnotic Gaze Special action, nominate a single Standing opposition player that has not lost their Tackle Zone and that this player is Marking. Then make an Agility test for this player, applying a -1 modifier for every player (other than the nominated player) that is Marking this player. If the test is passed, the nominated player loses their Tackle Zone until they are next activated.\n\nThis player may move before performing this Special action, following all of the normal movement rules. However, once this Special action has been performed, this player may not move further and their activation comes to an end."
  },
  {
    "name": "Mighty Blow (+1)",
    "category": "Strength",
    "description": "When an opposition player is Knocked Down as the result of a Block action performed by this player (on its own or as part of a Blitz action), you may modify either the Armour roll or Injury roll by the amount shown in brackets. This modifier may be applied after the roll has been made. This Skill cannot be used with the Stab or Chainsaw traits."
  },
  {
    "name": "Multiple Block",
    "category": "Strength",
    "description": "When this player performs a Block action on its own (but not as part of a Blitz action), they may choose to perform two Block actions, each targeting a different player they are Marking. However, doing so will reduce this player’s Strength characteristic by 2 for the duration of this activation. Both Block actions are performed simultaneously, meaning both are resolved in full even if one or both result in a Turnover. The dice rolls for each Block action should be kept separate to avoid confusion. This player cannot follow-up when using this Skill.\n\nNote that choosing to use this Skill means this player will be unable to use the Frenzy skill during the same activation."
  },
  {
    "name": "Frenzy",
    "category": "General",
    "description": "Every time this player performs a Block action (on its own or as part of a Blitz action), they must follow-up if the target is pushed back and if they are able. If the target is still Standing after being pushed back, and if this player was able to follow-up, this player must then perform a second Block action against the same target, again following-up if the target is pushed back.\n\nIf this player is performing a Blitz action, performing a second Block action will also cost them one square of their Movement Allowance. If this player has no Movement Allowance left to perform a second Block action, they must Rush to do so. If they cannot Rush, they cannot perform a second Block action. \n\nNote that if an opposition player in possession of the ball is pushed back into your End Zone and is still Standing, a touchdown will be scored, ending the drive. In this case, the second Block action is not performed.\n\nA player with this Skill cannot also have the Grab skill."
  },
  {
    "name": "Pass",
    "category": "Passing",
    "description": "This player may re-roll a failed Passing Ability test when performing a Pass action."
  },
  {
    "name": "Hail Mary Pass",
    "category": "Passing",
    "description": "When this player performs a Pass action (or a Throw Bomb action), the target square can be anywhere on the pitch and the range ruler does not need to be used. A Hail Mary pass is never accurate, regardless of the result of the Passing Ability test it will always be inaccurate at best. A Passing Ability test is made and can be re-rolled as normal in order to determine if the Hail Mary pass is wildly inaccurate or is fumbled. A Hail Mary pass cannot be interfered with. This Skill may not be used ina Blizzard."
  },
  {
    "name": "Fend",
    "category": "General",
    "description": "If this player is pushed back as the result of any block dice result being applied against them, they may choose to prevent the player that pushed them back from following-up. However, the player that pushed them back may continue to move as part of a Blitz action if they have Movement Allowance remaining or by Rushing.\n\nThis Skill cannot be used when this player is chain-pushed, against a player with the Ball & Chain trait or against a player with the Juggernaut skill that performed the Block action as part of a Blitz."
  },
  {
    "name": "Leap",
    "category": "Agility",
    "description": "During their movement, instead of jumping over a single square that is occupied by a Prone or Stunned player, as described on page 45, a player with this Skill may choose to Leap over any single adjacent square, including unoccupied squares and squares occupied by Standing players.\n\nAdditionally, this player may reduce any negative modifier applied to the Agility test when they attempt to Jump over a Prone or Stunned player, or to Leap over an empty square or a square occupied by a Standing player by 1, to a minimum of -1.\n\nA player with this Skill cannot also have the Pogo Stick trait."
  },
  {
    "name": "No Hands",
    "category": "Trait",
    "description": "The player is unable to pick up, intercept or carry the ball and will fail any catch roll automatically, either because he literally has no hands or because his hands are full. If he attempts to pick up the ball then it will bounce, and will causes a turnover if it is his team’s turn."
  },
  {
    "name": "Horns",
    "category": "Trait",
    "description": "When this player performs a Block action as part of a Blitz action (but not on its own), you may apply a +1 modifier to this player’s Strength characteristic. This modifier is applied before counting assists, before applying any other Strength modifiers and before using any other Skills or Traits."
  },
  {
    "name": "Extra Arms",
    "category": "Mutation",
    "description": "This player may apply a +1 modifier when they attempt to pick up or catch the ball, or when they attempt to interfere with a pass."
  },
  {
    "name": "Leader",
    "category": "Passing",
    "description": "A team which has one or more players with this Skill gains a single extra team re-roll, called a Leader re-roll. However, the Leader re-roll can only be used if there is at least one player with this Skill on the pitch (even if the player with this Skill is Prone, Stunned or has lost their Tackle Zone). If all players with this Skill are removed from play before the Leader re-roll is used, it is lost. The Leader re-roll can be carried over into extra time if it is not used, but the team does not receive a new one at the start of extra time. Unlike standard Team Re-rolls, the Leader Re-roll cannot be lost due to a Halfling Master Chef. Otherwise, the Leader re-roll is treated just like a normal team re-roll."
  },
  {
    "name": "Prehensile Tail",
    "category": "Mutation",
    "description": "When an active opposition player attempts to Dodge, Jump or Leap in order to vacate a square in which they are being Marked by this player, there is an additional -1 modifier applied to the active player’s Agility test.\n\nIf the opposition player is being Marked by more than one player with this Mutation, only one player may use it."
  },
  {
    "name": "Diving Tackle",
    "category": "Agility",
    "description": "Should an active opposition player that is attempting to Dodge, Jump or Leap in order to vacate a square in which they are being Marked by this player pass their Agility test, you may declare that this player will use this Skill. Your opponent must immediately subtract 2 from the result of the Agility test. This player is then Placed Prone in the square vacated by the opposition player.\n\nIf the opposition player was being Marked by more than one player with this Skill, only one player may use it."
  },
  {
    "name": "Diving Catch",
    "category": "Agility",
    "description": "This player may attempt to catch the ball if a pass, throw-in or kick-off causes it to land in a square within their Tackle Zone after scattering or deviating. This Skill does not allow this player to attempt to catch the ball if it bounces into a square within their Tackle Zone.\n\nAdditionally, this player may apply a +1 modifier to any attempt to catch an accurate pass if they occupy the target square."
  },
  {
    "name": "Kick",
    "category": "General",
    "description": "If this player is nominated to be the kicking player during a kick-off, you may choose to halve the result of the D6 to determine the number of squares that the ball deviates, rounding any fractions down."
  },
  {
    "name": "Loner (4+)",
    "category": "Trait",
    "description": "If this player wishes to use a team re-roll, roll a D6. If you roll equal to or higher than the target number shown in brackets, this player may use the team re-roll as normal. Otherwise, the original result stands without being re-rolled but the team re-roll is lost just as if it had been used. This Trait must still be used if the player is Prone or has lost their Tackle Zone."
  },
  {
    "name": "Dump-Off",
    "category": "Passing",
    "description": "If this player is nominated as the target of a Block action (or a Special action granted by a Skill or Trait that can be performed instead of a Block action) and if they are in possession of the ball, they may immediately perform a Quick Pass action, interrupting the activation of the opposition player performing the Block action (or Special action) to do so. This Quick Pass action cannot cause a Turnover, but otherwise all of the normal rules for passing the ball apply. Once the Quick Pass action is resolved, the active player performs the Block action and their team turn continues."
  },
  {
    "name": "Dodge",
    "category": "Agility",
    "description": "Once per team turn, during their activation, this player may re-roll a failed Agility test when attempting to Dodge.\n\nAdditionally, this player may choose to use this Skill when they are the target of a Block action and a Stumble result is applied against them, as described on page 57."
  },
  {
    "name": "Really Stupid",
    "category": "Trait",
    "description": "When this player is activated, even if they are Prone or have lost their Tackle Zone, immediately after declaring the action they will perform but before performing the action, roll a D6, applying a +2 modifier to the dice roll if this player is currently adjacent to one or more Standing team-mates that do not have this Trait:\n\n• On a roll of 1-3, this player forgets what they are doing and their activation ends immediately. Additionally, this player loses their Tackle Zone until they are next activated.\n• On a roll of 4+, this player continues their activation as normal and completes their declared action.\n\nNote that if you declared that this player would perform an action which can only be performed once per team turn and this player’s activation ended before the action could be completed, the action is considered to have been performed and no other player on your team may perform the same action this team turn."
  },
  {
    "name": "Jump Up",
    "category": "Agility",
    "description": "If this player is Prone they may stand up for free (i.e., standing up does not cost this player three (3) squares of their Movement Allowance, as it normally would).\n\nAdditionally, if this player is Prone when activated, they may attempt to Jump Up and perform a Block action. This player makes an Agility test, applying a +1 modifier. If this test is passed, they stand up and may perform a Block action. If the test is failed, they remain Prone and their activation ends. This Skill may still be used if the player is Prone or has lost their Tackle Zone."
  },
  {
    "name": "Disturbing Presence",
    "category": "Mutation",
    "description": "When an opposition player performs either a Pass action, a Throw Team-mate action or a Throw Bomb Special action, or attempts to either interfere with a pass or to catch the ball, they must apply a -1 modifier to the test for each player on your team with this Skill that is within three squares of them, even if the player with this Skill is Prone, Stunned or has lost their Tackle Zone."
  },
  {
    "name": "Dirty Player (+1)",
    "category": "General",
    "description": "When this player commits a Foul action, either the Armour roll or Injury roll made against the victim may be modified by the amount shown in brackets. This modifier may be applied after the roll has been made."
  },
  {
    "name": "Secret Weapon",
    "category": "Trait",
    "description": "When a drive in which this player took part ends, even if this player was not on the pitch at the end of the drive, this player will be Sent-off for committing a Foul, as described on page 63."
  },
  {
    "name": "Right Stuff",
    "category": "Trait",
    "description": "If this player also has a Strength characteristic of 3 or less, they can be thrown by a team-mate with the Throw Team-mate skill, as described on page 52. This Trait may still be used if the player is Prone, Stunned, or has lost their Tackle Zone."
  },
  {
    "name": "Sidestep",
    "category": "Agility",
    "description": "If this player is pushed back for any reason, they are not moved into a square chosen by the opposing coach. Instead you may choose any unoccupied square adjacent to this player. This player is pushed back into that square instead. If there are no unoccupied squares adjacent to this player, this Skill cannot be used."
  },
  {
    "name": "Safe Pass",
    "category": "Passing",
    "description": "Should this player fumble a Pass action, the ball is not dropped, does not bounce from the square this player occupies, and no Turnover is caused. Instead, this player retains possession of the ball and their activation ends."
  },
  {
    "name": "Shadowing",
    "category": "General",
    "description": "This player can use this Skill when an opposition player they are Marking voluntarily moves out of a square within this player’s Tackle Zone. Roll a D6, adding the MA of this player to the roll and then subtracting the MA of the opposition player. If the result is 6 or higher, or if the roll is a natural 6, this player may immediately move into the square vacated by the opposition player (this player does not need to Dodge to make this move). If, however, the result is 5 or lower, or if the roll is a natural 1, this Skill has no further effect.\n\nA player may use this Skill any number of times per turn, during either team’s turn. If an opposition player is being Marked by more than one player with this Skill, only one player may use it."
  },
  {
    "name": "Sneaky Git",
    "category": "Agility",
    "description": "When this player performs a Foul action, they are not Sent-off for committing a Foul should they roll a natural double on the Armour roll.\n\nAdditionally, the activation of this player does not have to end once the Foul has been committed. If you wish and if this player has not used their full Movement Allowance, they may continue to move after committing the Foul."
  },
  {
    "name": "Stunty",
    "category": "Trait",
    "description": "When this player makes an Agility test in order to Dodge, they ignore any -1 modifiers for being Marked in the square they have moved into, unless they also have either the Bombardier trait, the Chainsaw trait or the Swoop trait.\n\nHowever, when an opposition player attempts to interfere with a Pass action performed by this player, that player may apply a +1 modifier to their Agility test.\n\nFinally, players with this Trait are more prone to injury. Therefore, when an Injury roll is made against this player, roll 2D6 and consult the Stunty Injury table, on page 60. This Trait must still be used if the player is Prone, Stunned, or has lost their Tackle Zone."
  },
  {
    "name": "Stab",
    "category": "Trait",
    "description": "Instead of performing a Block action (on its own or as part of a Blitz action), this player may perform a ‘Stab’ Special action. Exactly as described for a Block action, nominate a single Standing player to be the target of the Stab Special action. There is no limit to how many players with this Trait may perform this Special action each team turn.\n\nTo perform a Stab Special action, make an unmodified Armour roll against the target:\n\n• If the Armour of the player hit is broken, they become Prone and an Injury roll is made against them. This Injury roll cannot be modified in any way.\n• If the Armour of the player hit is not broken, this Trait has no effect.\n• If Stab is used as part of a Blitz action, the player cannot continue moving after using it."
  },
  {
    "name": "Titchy",
    "category": "Trait",
    "description": "This player may apply a +1 modifier to any Agility tests they make in order to Dodge. However, if an opposition player dodges into a square within the Tackle Zone of this player, this player does not count as Marking the moving player for the purposes of calculating Agility test modifiers."
  },
  {
    "name": "Take Root",
    "category": "Trait",
    "description": "When this player is activated, even if they are Prone or have lost their Tackle Zone, immediately after declaring the action they will perform but before performing the action, roll a D6:\n\n• On a roll of 1, this player becomes ’Rooted’:\n- A Rooted player cannot move from the square they currently occupy for any reason, voluntarily or otherwise, until the end of this drive, or until they are Knocked Down or Placed Prone.\n- A Rooted player may perform any action available to them provided they can do so without moving. For example, a Rooted player may perform a Pass action but may not move before making the pass, and so on.\n• On a roll of 2+, this player continues their activation as normal.\n\nIf you declared that this player would perform any action that includes movement (Pass, Hand-off, Blitz or Foul) prior to them becoming Rooted, they may complete the action if possible. If they cannot, the action is considered to have been performed and no other player on your team may perform the same action this team turn."
  },
  {
    "name": "Throw Team-mate",
    "category": "Trait",
    "description": "If this player also has a Strength characteristic of 5 or more, they may perform a Throw Team-mate action, as described on page 52, allowing them to throw a teammate with the Right Stuff trait."
  },
  {
    "name": "Two Heads",
    "category": "Mutation",
    "description": "This player may apply a +1 modifier to the Agility test when they attempt to Dodge."
  },
  {
    "name": "Tackle",
    "category": "General",
    "description": "When an active opposition player attempts to Dodge from a square in which they were being Marked by one or more players on your team with this Skill, that player cannot use the Dodge skill.\n\nAdditionally, when an opposition player is targeted by a Block action performed by a player with this Skill, that player cannot use the Dodge skill if a Stumble result is applied against them."
  },
  {
    "name": "Thick Skull",
    "category": "Strength",
    "description": "When an Injury roll is made against this player (even if this player is Prone, Stunned or has lost their Tackle Zone), they can only be KO’d on a roll of 9, and will treat a roll of 8 as a Stunned result. If this player also has the Stunty trait, they can only be KO’d on a roll of 8, and will treat a roll of 7 as a Stunned result. All other results are unaffected."
  },
  {
    "name": "Very Long Legs",
    "category": "Mutation",
    "description": "This player may reduce any negative modifier applied to the Agility test when they attempt to Jump over a Prone or Stunned player (or to Leap over an empty square or a square occupied by a Standing player, if this player has the Leap skill) by 1, to a minimum of -1.\n\nAdditionally, this player may apply a +2 modifier to any attempts to interfere with a pass they make.\n\nFinally, this player ignores the Cloud Burster skill."
  },
  {
    "name": "Sure Hands",
    "category": "General",
    "description": "This player may re-roll any failed attempt to pick up the ball. In addition, the Strip Ball skill cannot be used against a player with this Skill."
  },
  {
    "name": "Sure Feet",
    "category": "Agility",
    "description": "Once per team turn, during their activation, this player may re-roll the D6 when attempting to Rush."
  },
  {
    "name": "Animal Savagery",
    "category": "Trait",
    "description": "When this player is activated, even if they are Prone or have lost their Tackle Zone, immediately after declaring the action they will perform but before performing the action, roll a D6, applying a +2 modifier to the dice roll if you declared the player would perform a Block or Blitz action (or a Special action granted by a Skill or Trait that can be performed instead of a Block action):\n\n• On a roll of 1-3, this player lashes out at their team-mates:\n- One Standing team-mate of your choice that is currently adjacent to this player is immediately Knocked Down by this player. This does not cause a Turnover unless the Knocked Down player was in possession of the ball. After making an Armour roll (and possible Injury roll) against the Knocked Down player, this player may continue their activation and complete their declared action if able. Note that, if this player has any applicable Skills, the coach of the opposing team may use them when making an Armour roll (and possible Injury roll) against the Knocked Down player.\n- If this player is not currently adjacent to any Standing team-mates, this player’s activation ends immediately. Additionally, this player loses their Tackle Zone until they are next activated.\n• On a roll of 4+, this player continues their activation as\nnormal and completes their declared action.\n\nIf you declared that this player would perform an action which can only be performed once per team turn and this player’s activation ended before the action could be completed, the action is considered to have been performed and no other player on your team may perform the same action this team turn."
  },
  {
    "name": "Regeneration",
    "category": "Trait",
    "description": "After a Casualty roll has been made against this player, roll a D6. On a roll of 4+, the Casualty roll is discarded without effect and the player is placed in the Reserves box rather than the Casualty box of their team dugout. On a roll of 1-3, however, the result of the Casualty roll is applied as normal. This Trait may still be used if the player is Prone, Stunned, or has lost their Tackle Zone."
  },
  {
    "name": "Stand Firm",
    "category": "Strength",
    "description": "This player may choose not to be pushed back, either as the result of a Block action made against them or by a chain-push. Using this Skill does not prevent an opposition player with the Frenzy skill from performing a second Block action if this player is still Standing after the first."
  },
  {
    "name": "Strip Ball",
    "category": "General",
    "description": "When this player targets an opposition player that is in possession of the ball with a Block action (on its own or as part of a Blitz action), choosing to apply a Push Back result will cause that player to drop the ball in the square they are pushed back into. The ball will bounce from the square the player is pushed back into, as if they had been Knocked Down."
  },
  {
    "name": "Tentacles",
    "category": "Mutation",
    "description": "This player can use this Skill when an opposition player they are Marking voluntarily moves out of a square within this player’s Tackle Zone. Roll a D6, adding the ST of this player to the roll and then subtracting the ST of the opposition player. If the result is 6 or higher, or if the roll is a natural 6, the opposition player is held firmly in place and their movement comes to an end. If, however, the result is 5 or lower, or if the roll is a natural 1, this Skill has no further effect.\n\nA player may use this Skill any number of times per turn, during either team’s turn. If an opposition player is being Marked by more than one player with this Skill, only one player may use it."
  },
  {
    "name": "Strong Arm",
    "category": "Trait",
    "description": "This player may apply a +1 modifier to any Passing Ability test rolls they make when performing a Throw Team-mate action.\n\nA player that does not have the Throw Team-mate trait cannot have this Skill."
  },
  {
    "name": "Sprint",
    "category": "Trait",
    "description": "When this player performs any action that includes movement, they may attempt to Rush three times, rather than the usual two."
  },
  {
    "name": "Pro",
    "category": "General",
    "description": "During their activation, this player may attempt to re-roll one dice. This dice may have been rolled either as a single dice roll, as part of a multiple dice roll or as part of a dice pool, but cannot be a dice that was rolled as part of an Armour, Injury or Casualty roll. Roll a D6:\n\n• On a roll of 3+, the dice can be\nre-rolled.\n• On a roll of 1 or 2, the dice cannot\nbe re-rolled.\n\nOnce this player has attempted to use this Skill, they may not use a re-roll from any other source to re-roll this one dice."
  },
  {
    "name": "Kick Team-Mate",
    "category": "Trait",
    "description": "Once per team turn, in addition to another player performing either a Pass or a Throw Team-mate action, a single player with this Trait on the active team can perform a ‘Kick Team-mate’ Special action and attempt to kick a Standing team-mate with the Right Stuff trait that is in a square adjacent to them.\n\nTo perform a Kick Team-mate Special action, follow the rules for Throw Team-mate actions as described on page 52.\n\nHowever, if the Kick Team-mate Special action is fumbled, the kicked player is automatically removed from play and an Injury roll is made against them, treating a Stunned result as a KO’d result (note that, if the player that performed this action also has the Mighty Blow (+X) skill, the coach of the opposing team may use that Skill on this Injury roll). If the kicked player was in possession of the ball when removed from play, the ball will bounce from the square they occupied."
  },
  {
    "name": "Monstrous Mouth",
    "category": "Mutation",
    "description": "This player may re-roll any failed attempt to catch the ball. In addition, the Strip Ball skill cannot be used against this player."
  },
  {
    "name": "Plague Ridden",
    "category": "Trait",
    "description": "Once per game, if an opposition player with a Strength characteristic of 4 or less that does not have the Decay, Regeneration or Stunty traits suffers a Casualty result of 15-16, DEAD as the result of a Block action performed or a Foul action committed by a player with this Trait that belongs to your team, and if that player cannot be saved by an apothecary, you may choose to use this Trait. If you do, that player does not die; they have instead been infected with a virulent plague!\n\nIf your team has the ‘Favoured of Nurgle’ special rule, a new ‘Rotter Lineman’ player, drawn from the Nurgle roster, can be placed immediately in the Reserves box of your team’s dugout (this may cause a team to have more than 16 players for the remainder of this game). During step 4 of the post-game sequence, this player may be permanently hired, exactly as you would a Journeyman player that had played for your team (see page 72)."
  },
  {
    "name": "Timmm-ber!",
    "category": "Trait",
    "description": "If this player has a Movement Allowance of 2 or less, apply a +1 modifier to the dice roll when they attempt to stand up (as described on page 44) for each Open, Standing team-mate they are currently adjacent to. A natural 1 is always a failure, no matter how many teammates are helping. This Trait may still be used if the player is Prone or has lost their Tackle Zone."
  },
  {
    "name": "Wrestle",
    "category": "General",
    "description": "This player may use this Skill when a Both Down result is applied, either when they perform a Block action or when they are the target of a Block action. Instead of applying the Both Down result as normal, and regardless of any other Skills either player may possess, both players are Placed Prone."
  },
  {
    "name": "Swoop",
    "category": "Trait",
    "description": "If this player is thrown by a team-mate, as described on page 52, they do not scatter before landing as they normally would. Instead, you may place the Throw-in template over the player, facing towards either End Zone or either sideline as you wish. The player then moves from the target square D3 squares in a direction determined by rolling a D6 and referring to the Throw-in template."
  },
  {
    "name": "Swarming",
    "category": "Trait",
    "description": "During each Start of Drive sequence, after Step 2 but before Step 3, you may remove D3 players with this Trait from the Reserves box of your dugout and set them up on the pitch, allowing you to set up more than the usual 11 players. These extra players may not be placed on the Line of Scrimmage or in a Wide Zone.\n\nWhen using Swarming, a coach may not set up more players wwith the Swarming trait onto the pitch than the number of freindly players with the Swarming trait that were already set up. So, if a team had 2 players with the Swarmaing trait already set up on the pitch, and then rolled for 3 more players to enter the pitch via Swarming, only a maximum of two more Swarming players could be set up on the pitch."
  },
  {
    "name": "Treacherous Trapdoor",
    "category": "Trait",
    "description": "Until the end of this half, every time any player enters a Trapdoor square, for any reason, roll a D6. On a roll of 1, the trapdoor falls open and the player is immediately removed from play. Treat them exactly as if they had been pushed into the crowd. If the player was in possession of the ball, it bounces from the trapdoor square."
  },
  {
    "name": "Friends with the Ref",
    "category": "Trait",
    "description": "Until the end of this drive, you may treat a roll of 5 or 6 on the Argue the Call table as a “Well, When You Put It Like That…” result and a roll of 2-4 as an “I Don’t Care!” result."
  },
  {
    "name": "Stiletto",
    "category": "Trait",
    "description": "Randomly select one player on your team that is available to play during this drive and that does not have the Loner (X+) trait. Until the end of this drive, that player gains the Stab trait."
  },
  {
    "name": "Iron Man",
    "category": "Trait",
    "description": "Choose one player on your team that is available to play during this drive and that does not have the Loner (X+) trait. Until the end of this game, that player improves their AV by 1, to a maximum of 11+."
  },
  {
    "name": "Knuckle Dusters",
    "category": "Trait",
    "description": "Choose one player on your team that is available to play during this drive and that does not have the Loner (X+) trait. Until the end of this drive, that player gains the Mighty Blow (+1) skill."
  },
  {
    "name": "Bad Habits",
    "category": "Trait",
    "description": "Randomly select D3 opposition players that are available to play during this drive and that do not have the Loner (X+) trait. Until the end of this drive, those players gain the Loner (2+) trait."
  },
  {
    "name": "Greasy Cleats",
    "category": "Trait",
    "description": "Randomly select one opposition player that is available to play during this drive. That player has had their boots tampered with! Until the end of this drive, their MA is reduced by 1."
  },
  {
    "name": "Blessed Statue of Nuffle",
    "category": "Trait",
    "description": "Choose one player on your team that is available to play during this drive and that does not have the Loner (X+) trait. Until the end of this game, that player gains the Pro skill."
  },
  {
    "name": "Moles Under the Pitch",
    "category": "Trait",
    "description": "Until the end of this half, apply a -1 modifier every time any player attempts to Rush an extra square (-2 should it occur that both coaches have rolled this result)."
  },
  {
    "name": "Perfect Passing",
    "category": "Trait",
    "description": "Until the end of this game, any player on your team that makes a Completion earns 2 SPP, rather than the usual 1 SPP."
  },
  {
    "name": "Fan Interaction",
    "category": "Trait",
    "description": "Until the end of this drive, if a player on your team causes a Casualty by pushing an opponent into the crowd, that player will earn 2 SPP exactly as if they had caused a Casualty by performing a Block action."
  },
  {
    "name": "Necessary Violence",
    "category": "Trait",
    "description": "Until the end of this drive, any player on your team that causes a Casualty earns 3 SPP, rather than the usual 2 SPP."
  },
  {
    "name": "Fouling Frenzy",
    "category": "Trait",
    "description": "Until the end of this drive, any player on your team that causes a Casualty with a Foul action earns 2 SPP exactly as if they had caused a Casualty by performing a Block action."
  },
  {
    "name": "Throw a Rock",
    "category": "Trait",
    "description": "Until the end of this drive, should an opposition player Stall, at the end of their team turn you may roll a D6. On a roll of 5+, an angry fan throws a rock at that player. The player is immediately Knocked Down."
  },
  {
    "name": "Under Scrutiny",
    "category": "Trait",
    "description": "Until the end of this half, any player on the opposing team that commits a Foul action is automatically seen by the referee, even if a natural double is not rolled."
  },
  {
    "name": "Intensive Training",
    "category": "Trait",
    "description": "Randomly select one player on your team that is available to play during this drive and that does not have the Loner (X+) trait. Until the end of this game, that player gains a single Primary skill of your choice."
  },
  {
    "name": "Defensive",
    "category": "Trait",
    "description": "During your opponent’s team turn (but not during your own team turn), any opposition players being Marked by this player cannot use the Guard skill."
  },
  {
    "name": "Safe Pair of Hands",
    "category": "Agility",
    "description": "If this player is Knocked Down or Placed Prone (but not if they Fall Over) whilst in possession of the ball, the ball does not bounce. Instead, you may place the ball in an unoccupied square adjacent to the one this player occupies when they become Prone. This Skill may still be used if the player is Prone."
  },
  {
    "name": "Iron Hard Skin",
    "category": "Mutation",
    "description": "Opposing players cannot modify any Armour rolls made against this player. In addition, the Claws skill cannot be used when making an Armour roll against this player. This Skill may still be used if the player is Prone, Stunned or has lost their Tackle Zone."
  },
  {
    "name": "Cannoneer",
    "category": "Passing",
    "description": "When this player performs a Long Pass action or a Long Bomb Pass action, you may apply an additional +1 modifier to the Passing Ability test."
  },
  {
    "name": "Cloud Burster",
    "category": "Passing",
    "description": "When this player performs a Long Pass action or a Long Bomb Pass action, you may choose to make the opposing coach re-roll a successful attempt to interfere with the pass."
  },
  {
    "name": "Fumblerooskie",
    "category": "Passing",
    "description": "When this player performs a Move or Blitz action whilst in possession of the ball, they may choose to ‘drop’ the ball. The ball may be placed in any square the player vacates during their movement and does not bounce. No Turnover is caused."
  },
  {
    "name": "On the Ball",
    "category": "Passing",
    "description": "This player may move up to three squares (regardless of their MA), following all of the normal movement rules, when the opposing coach declares that one of their players is going to perform a Pass action. This move is made after the range has been measured and the target square declared, but before the active player makes a Passing Ability test. Making this move interrupts the activation of the opposition player performing the Pass action. A player may use this Skill when an opposition player uses the Dump-off skill, but should this player Fall Over whilst moving, a Turnover is caused.\n\nAdditionally, during each Start of Drive sequence, after Step 2 but before Step 3, one Open player with this Skill on the receiving team may move up to three squares (regardless of their MA). This Skill may not be used if a touchback is caused when the kick deviates and does not allow the player to cross into their opponent’s half of the pitch."
  },
  {
    "name": "Running Pass",
    "category": "Passing",
    "description": "If this player performs a Quick Pass action, their activation does not have to end once the pass is resolved. If you wish and if this player has not used their full Movement Allowance, they may continue to move after resolving the pass."
  },
  {
    "name": "Arm Bar",
    "category": "Strength",
    "description": "If an opposition player Falls Over as the result of failing their Agility test when attempting to Dodge, Jump or Leap out of a square in which they were being Marked by this player, you may apply a +1 modifier to either the Armour roll or Injury roll. This modifier may be applied after the roll has been made and may be applied even if this player is now Prone.\n\nIf the opposition player was being Marked by more than one player with this Skill, only one player may use it."
  },
  {
    "name": "Brawler",
    "category": "Strength",
    "description": "When this player performs a Block action on its own (but not as part of a Blitz action), this player may re-roll a single Both Down result."
  },
  {
    "name": "Pile Driver",
    "category": "Strength",
    "description": "When an opposition player is Knocked Down by this player as the result of a Block action (on its own or as part of a Blitz action), this player may immediately commit a free Foul action against the Knocked Down player. To use this Skill, this player must be Standing after the block dice result has been selected and applied, and must occupy a square adjacent to the Knocked Down player. After using this Skill, this player is Placed Prone and their activation ends immediately."
  },
  {
    "name": "Decay",
    "category": "Trait",
    "description": "If this player suffers a Casualty result on the Injury table, there is a +1 modifier applied to all rolls made against this player on the Casualty table."
  },
  {
    "name": "Pogo Stick",
    "category": "Trait",
    "description": "During their movement, instead of jumping over a single square that is occupied by a Prone or Stunned player, as described on page 45, a player with this Trait may choose to Leap over any single adjacent square, including unoccupied squares and squares occupied by Standing players.\n\nAdditionally, when this player makes an Agility test to Jump over a Prone or Stunned player, or to Leap over an empty square or a square occupied by a Standing player, they may ignore any negative modifiers that would normally be applied for being Marked in the square they jumped or leaped from and/or for being Marked in the square they have jumped or leaped into.\n\nA player with this Trait cannot also have the Leap skill."
  },
  {
    "name": "Projectile Vomit",
    "category": "Trait",
    "description": "Instead of performing a Block action (on its own or as part of a Blitz action), this player may perform a ‘Projectile Vomit’ Special action. Exactly as described for a Block action, nominate a single Standing player to be the target of the Projectile Vomit Special action. There is no limit to how many players with this Trait may perform this Special action each team turn.\n\nTo perform a Projectile Vomit Special action, roll a D6:\n\n• On a roll of 2+, this player regurgitates acidic bile onto the nominated target.\n• On a roll of 1, this player belches and snorts, before covering itself in acidic bile.\n• In either case, an Armour roll is made against the player hit by the Projectile Vomit. This Armour roll cannot be modified in any way.\n• If the armour of the player hit is broken, they become Prone and an Injury roll is made against them. This Injury roll cannot be modified in any way.\n• If the armour of the player hit is not broken, this Trait has no effect.\n\nA player can only perform this Special action once per turn (i.e., Projectile Vomit cannot be used with Frenzy or Multiple Block)."
  },
  {
    "name": "Unchannelled Fury",
    "category": "Trait",
    "description": "When this player is activated, even if they are Prone or have lost their Tackle Zone, immediately after declaring the action they will perform but before performing the action, roll a D6, applying a +2 modifier to the dice roll if you declared the player would perform a Block or Blitz action (or a Special action granted by a Skill or Trait that can be performed instead of a Block action):\n\n• On a roll of 1-3, this player rages incoherently at others but achieves little else. Their activation ends immediately.\n• On a roll of 4+, this player continues their activation as normal and completes their declared action.\n\nIf you declared that this player would perform an action which can only be performed once per team turn and this player’s activation ended before the action could be completed, the action is considered to have been performed and no other player on your team may perform the same action this team turn."
  },
  {
    "name": "Loner (5+)",
    "category": "Trait",
    "description": "If this player wishes to use a team re-roll, roll a D6. If you roll equal to or higher than the target number shown in brackets, this player may use the team re-roll as normal. Otherwise, the original result stands without being re-rolled but the team re-roll is lost just as if it had been used. This Trait must still be used if the player is Prone or has lost their Tackle Zone."
  },
  {
    "name": "Low Cost Linemen",
    "category": "Trait",
    "description": "Teams with this special rule are not very particular about\nthe Linemen they hire. To make up for this, they don’t\nusually bother to pay them:\n\n• In league play (but not in exhibition play), when\ncalculating the Current Value of any permanently hired\nLineman players on a team with this special rule, the\nHiring Fee of that player is not included."
  },
  {
    "name": "Bribery and Corruption",
    "category": "Trait",
    "description": "It takes a strong-willed referee indeed to risk making\nan enemy of a team so renowned for reacting… poorly\ntowards any official that would rebuke its behaviour:\n\n• Once per game, when rolling on the Argue the Call\ntable, you may re-roll a roll of a natural 1.\n\nIn addition, a team with this special rule can\npurchase certain Inducements for a reduced price, as\nnoted in the description of that Inducement."
  },
  {
    "name": "Masters of Undeath",
    "category": "Trait",
    "description": "The Head Coach of this team is replaced by a\nNecromancer. Once per game, they can ‘Raise the Dead’:\n\n• If a player on the opposing team with a Strength\ncharacteristic of 4 or less and that does not have the\nRegeneration or Stunty traits suffers a Casualty result\nof 15-16, DEAD, and if they cannot be saved by an\napothecary, a new rookie Zombie Lineman player can\nbe placed immediately in the Reserves box of this\nteam’s dugout. Note that this may cause the team\nto have more than 16 players for the remainder of\nthe game.\n\n• During Step 4 of the post-game sequence, this player\nmay be permanently hired for free if the team has\nfewer than 16 players on its Team Draft list, otherwise\nit will be lost. The player’s full value still counts towards\nthe Team Value.\n\nAdditionally, just like the Head Coach of any other\nteam, a Necromancer can Argue the Call when one of\ntheir players is Sent-off for committing a Foul, as long as\nthey haven’t been sent off themselves."
  },
  {
    "name": "Loner (3+)",
    "category": "Trait",
    "description": "If this player wishes to use a team re-roll, roll a D6. If you roll equal to or higher than the target number shown in brackets, this player may use the team re-roll as normal. Otherwise, the original result stands without being re-rolled but the team re-roll is lost just as if it had been used. This Trait must still be used if the player is Prone or has lost their Tackle Zone."
  },
  {
    "name": "Mighty Blow (+2)",
    "category": "Strength",
    "description": "When an opposition player is Knocked Down as the result of a Block action performed by this player (on its own or as part of a Blitz action), you may modify either the Armour roll or Injury roll by the amount shown in brackets. This modifier may be applied after the roll has been made. This Skill cannot be used with the Stab or Chainsaw traits."
  },
  {
    "name": "Dirty Player (+2)",
    "category": "General",
    "description": "When this player commits a Foul action, either the Armour roll or Injury roll made against the victim may be modified by the amount shown in brackets. This modifier may be applied after the roll has been made."
  },
  {
    "name": "Drunkard",
    "category": "Trait",
    "description": "This player suffers a -1 penalty to the dice roll when attempting to Rush."
  },
  {
    "name": "Pick-Me-Up",
    "category": "Trait",
    "description": "At the end of the opponent's team turn, roll a D6 for each Prone, non-Stunned team-mate within three squares of a Standing player with the Trait. On a 5+, the Prone player may immediately stand up."
  },
  {
    "name": "Portal Navigator",
    "category": "Trait",
    "description": "When this player teleports using a Portal, they may re-roll the D6 to determine which Portal they teleport to."
  },
  {
    "name": "Give and Go",
    "category": "Trait",
    "description": "If this player performs a Hand-Off action, their activation does not have to end once the Hand-Off is resolved. If you wish and if this player has not used their full Movement Allowance, they may continue to move after resolving the Hand-Off."
  },
  {
    "name": "Portal Passer",
    "category": "Trait",
    "description": "During its activation, when this player teleports through a Portal, it may declare a Pass action after determining which Portal it is teleporting to. This Skill may be used even if the player did not declare a Pass action at the beginning of their activation."
  },
  {
    "name": "Wall Thrower",
    "category": "Trait",
    "description": "When this player throws the ball at the wall, they may apply a +1 modifier when testing for the accuracy of the pass."
  },
  {
    "name": "College Wizard",
    "category": "Trait",
    "description": "A College Wizard may only use their spell once per game."
  },
  {
    "name": "Hit and Run",
    "category": "Trait",
    "description": "After a player with this trait performs a Block action, they may immediately move one free square ignoring Tackle Zones so long as they are still Standing. They must ensure that after this move, they are not Marked by or Marking any opposition players."
  },
  {
    "name": "Bloodlust (2+)",
    "category": "Trait",
    "description": "To keep control of their wits, Vampires need a supply of fresh blood. Whenever a player with this trait activates, after declaring their action, they must roll a D6, adding 1 to the roll if they declared a Block action or a Blitz action. If they roll equal to or higher than the number shown in brackets, they may act as normal.\n\nIf the player rolls lower than the number shown in brackets, or rolls a natural 1, they may continue their activation as normal thogh they may change their declared action to a Move action if they wish. If the player declared an action that can only be performed once per team turn (such as a Blitz action), this will still count as the one of that action for the team turn. At the end of their activation they may bite an adjacent Thrall Lineman team-mate (Standing, Prone or Stunned). If they bite a Thrall, immediately make an injury roll for the Thrall treating any Casualty result as Badly Hurt; this will not cause a Turnover unless the Thrall was holding the ball. If they do not bite a Thrall for any reason then a Turnover is caused, the player will lose their Tackle Zone until they are next activated, and will immediately drop the ball if they were holding it. If the player was in the opposing End Zone, no Touchdown is socred. If a player who failed this roll wants to make a Pass action, Hand-off, or score, then they must bite a Thrall before they perform the action or score."
  },
  {
    "name": "Bloodlust (3+)",
    "category": "Trait",
    "description": "To keep control of their wits, Vampires need a supply of fresh blood. Whenever a player with this trait activates, after declaring their action, they must roll a D6, adding 1 to the roll if they declared a Block action or a Blitz action. If they roll equal to or higher than the number shown in brackets, they may act as normal.\n\nIf the player rolls lower than the number shown in brackets, or rolls a natural 1, they may continue their activation as normal thogh they may change their declared action to a Move action if they wish. If the player declared an action that can only be performed once per team turn (such as a Blitz action), this will still count as the one of that action for the team turn. At the end of their activation they may bite an adjacent Thrall Lineman team-mate (Standing, Prone or Stunned). If they bite a Thrall, immediately make an injury roll for the Thrall treating any Casualty result as Badly Hurt; this will not cause a Turnover unless the Thrall was holding the ball. If they do not bite a Thrall for any reason then a Turnover is caused, the player will lose their Tackle Zone until they are next activated, and will immediately drop the ball if they were holding it. If the player was in the opposing End Zone, no Touchdown is socred. If a player who failed this roll wants to make a Pass action, Hand-off, or score, then they must bite a Thrall before they perform the action or score."
  },
  {
    "name": "My Ball",
    "category": "Trait",
    "description": "A player with this Trait may not willingly give up the ball when in possession of it, and so may not make Pass actions, Hand-off actions, or use any other Skill or Trait that would allow them to relinquish possession of the ball. The only way they can lose possession of the ball is by being Knockes Down, Placed Prone, Falling Over or by the effect of a Skill, Trait, or special rule of an opposing model."
  },
  {
    "name": "Trickster",
    "category": "Trait",
    "description": "When this player is hit by a Block action or a Special action that replaces a Block action (with the exception of a Block action caused by the Ball and Chain Move Special action), before determining how many dice are rolled, they may be removed from the pitch and placed in any other unoccupied square adjacent to the player performing the Block action. The Block action then takes place as normal. If the player using this Trait is holding the ball and places themselves in the opposition End Zone, the Block action wil still be fully resolved before any touchdown is resolved."
  },
  {
    "name": "Breathe Fire",
    "category": "Trait",
    "description": "Once per activation, instead of performing a Block action (either on its own or as part of a Blitz action), this player may perform a Breathe Fire Special action. When a player makes a Breathe Fire Special action they may choose one Standing opposition player they are Marking and roll a D6, applying a -1 modifier if the target has a ST of 5 or higher. On a 1, the player gets overeager, engulfing themself in flame and is immediately Knocked Down. On a 2-3, the opposition player ducks the gout of flame and nothing happens. On a 4+, the opposition player takes a ball of fire straight to the face and is immediately Placed Prone. However, if the roll is a natural 6, the potent pyro has taken its toll and the opposition player is Knocked Down instead. After the Breathe Fire Special action has been resolved, this player's activation immediately ends."
  },
  {
    "name": "Argue the Call",
    "category": "Trait",
    "description": "Any time a player is sent off for committing a foul or using a Secret Weapon, you can ‘Argue the Call’: \nRoll a D6. \n• 1 - The player is sent off, a turnover is caused and for the rest of the game you cannot argue any calls. Furthermore if the ‘Brilliant Coaching’ result is rolled on the Kick-off table, subtract 1 from your dice roll.\n• 2-5 - The player is sent off and a turnover is caused.\n• 6 - The player in question stays on the field if Argue the Call was used when a foul was committed, a turnover is still caused. If used when a player is sent of for using a Secret Weapon, the player is put in the reserves box.\nAfter the Argue the Call roll, unless a 1 was rolled, you may use a bribe to try to keep the player in play (and not cause a turnover)."
  },
  {
    "name": "A Sneaky Pair",
    "category": "Trait",
    "description": "Dribl & Drull must be hired as a pair but only counts as one Star Player choice. However, they will still take up two spaces on a team's Team Roster.  Additionally, whenever Dribl or Drull perform either a Stab or Foul action against an opposition player marked by both Dribl & Drull, they may apply a +1 modifier to the Injury roll."
  },
  {
    "name": "Two for One",
    "category": "Trait",
    "description": "Grak and Crumbleberry must be hired as a pair but only counts as one Star Player choice. However, they will still take up two spaces on a team's Team Roster. Additionally, if either Grak or Crumbleberry is removed from play due to suffering a KO’d or Casualty! result on the Injury table, the other replaces the Loner (4+) trait with the Loner (2+) trait."
  },
  {
    "name": "Dedicated Fans (League)",
    "category": "Trait",
    "description": "Every Blood Bowl team is supported by a strong following of Dedicated Fans, those loyal supporters that will follow their team in good times and bad. This dedicated fan base is made both of those eager to show their support for a local franchise and those from further afield who support the team for less easily identified reasons. Many dedicated fans support a team because their parents did. Others do so simply because they find the team colours fetching.\n\n\nWhen a team is drafted, it will have a Dedicated Fans characteristic of 1 recorded on the Team Draft list (representing roughly 1,000 Dedicated Fans). Over the course of a league season, this characteristic will increase and decrease, though it will never fall below 1.\n\n\nAdditionally, when a team is drafted it can improve its Dedicated Fans characteristic by 1, up to a maximum of 6, at a cost of 10,000 gold pieces per improvement. For example, a team may improve its Dedicated Fans characteristic from 1 to 3 at a cost of 20,000 gold pieces from its Team Draft budget."
  },
  {
    "name": "Dedicated Fans (Exhibition)",
    "category": "Trait",
    "description": "Unlike a team drafted for league play, a team drafted for exhibition play will have a Dedicated Fans characteristic of 0.\n\n\nHowever, teams drafted for exhibition play can still improve this up to a maximum of 6, at a cost of 10,000 gold pieces per improvement, as described on page 35. For example, an exhibition team may purchase a Dedicated Fans characteristic of 3 at a cost of 30,000 gold pieces."
  }
];
