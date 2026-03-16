import { InjuryState } from '../types/match.types';
import { ManagedPlayer, ManagedTeam, PlayerStatus, SppActionType } from '../../../../types';
import { casualtyResults } from '../../../../data/casualties';
import { lastingInjuryResults } from '../../../../data/lastingInjuries';

/**
 * Contexto necesario para ejecutar la lógica del motor de lesiones.
 */
interface InjuryEngineContext {
    injuryState: InjuryState;
    setInjuryState: React.Dispatch<React.SetStateAction<InjuryState>>;
    liveHomeTeam: ManagedTeam | null;
    liveOpponentTeam: ManagedTeam | null;
    setLiveHomeTeam: React.Dispatch<React.SetStateAction<ManagedTeam | null>>;
    setLiveOpponentTeam: React.Dispatch<React.SetStateAction<ManagedTeam | null>>;
    updatePlayerStatus: (playerId: number, teamId: 'home' | 'opponent', status: PlayerStatus, statusDetail?: string) => void;
    updatePlayerSppAndAction: (player: ManagedPlayer, teamId: 'home' | 'opponent', spp: number, action: SppActionType, description: string) => void;
    logEvent: (type: any, description: string, extra?: any) => void;
    setIsInjuryModalOpen: (isOpen: boolean) => void;
    setIsApothecaryModalOpen: (isOpen: boolean) => void;
    initialInjuryState: InjuryState;
    playSound: (type: 'td' | 'injury' | 'turnover' | 'dice') => void;
    turn: number;
}

/**
 * handleInjuryActionLogic — máquina de estados para el flujo de lesiones.
 * Fases: tipo → atacante → víctima → armadura → heridas → apotecario → baja → lesión permanente → regeneración → resumen.
 */
export const handleInjuryActionLogic = (ctx: InjuryEngineContext, action: 'next' | 'back') => {
    const {
        injuryState, setInjuryState,
        liveHomeTeam, liveOpponentTeam,
        setLiveHomeTeam, setLiveOpponentTeam,
        updatePlayerStatus, updatePlayerSppAndAction,
        logEvent, setIsInjuryModalOpen,
        setIsApothecaryModalOpen, initialInjuryState, playSound
    } = ctx;

    const {
        step, victimPlayer, armorRollInput, log, victimTeamId,
        injuryRollInput, casualtyRollInput, lastingInjuryRollInput,
        casualtyRoll, apothecaryAction, isStunty, regenerationRollInput,
        attackerPlayer, attackerTeamId, isCasualty
    } = injuryState;

    if (action === 'back') {
        const steps: InjuryState['step'][] = [
            'select_casualty_type', 'select_attacker_team', 'select_attacker',
            'select_victim_team', 'select_victim', 'armor_roll', 'injury_roll',
            'apothecary', 'casualty_roll', 'lasting_injury_roll',
            'regeneration_check', 'regeneration_roll', 'staff_reroll_choice', 'summary'
        ];
        const currentIndex = steps.indexOf(step);
        if (currentIndex > 0) setInjuryState(prev => ({ ...prev, step: steps[currentIndex - 1] }));
        return;
    }

    const victimTeam = victimTeamId === 'home' ? liveHomeTeam : liveOpponentTeam;
    const setVictimTeam = victimTeamId === 'home' ? setLiveHomeTeam : setLiveOpponentTeam;

    switch (step) {
        case 'select_casualty_type':
        case 'select_attacker_team':
        case 'select_victim_team':
            // Gestionado por botones en la UI
            break;

        case 'select_attacker':
            if (attackerPlayer) setInjuryState(prev => ({ ...prev, step: 'select_victim_team' }));
            break;

        case 'select_victim':
            if (victimPlayer) {
                const hasStunty = victimPlayer.skills.toLowerCase().includes('escurridizo')
                    || (victimPlayer.skillKeys || []).includes('Stunty');
                setInjuryState(prev => ({ ...prev, step: 'armor_roll', isStunty: !!hasStunty }));
            }
            break;

        case 'armor_roll': {
            const die1 = parseInt(armorRollInput.die1), die2 = parseInt(armorRollInput.die2);
            if (isNaN(die1) || isNaN(die2)) break;
            const roll = die1 + die2;
            const armorValue = parseInt(victimPlayer!.stats.AR.replace('+', ''));
            const armorBroken = roll > armorValue;
            const logMsg = `Tirada Armadura (${victimPlayer!.stats.AR}) a ${victimPlayer!.customName}: ${die1}+${die2}=${roll}. ${armorBroken ? '¡Rota!' : 'Aguanta.'}`;
            setInjuryState(prev => ({
                ...prev, armorRoll: { roll, armorBroken },
                step: armorBroken ? 'injury_roll' : 'summary',
                log: [...log, logMsg]
            }));
            break;
        }

        case 'injury_roll': {
            const die1 = parseInt(injuryRollInput.die1), die2 = parseInt(injuryRollInput.die2);
            if (isNaN(die1) || isNaN(die2)) break;
            const roll = die1 + die2;
            let result: PlayerStatus = 'Activo', resultText = '';

            if (isStunty) {
                if (roll <= 6) { result = 'Activo'; resultText = 'Aturdido'; }
                else if (roll <= 8) { result = 'KO'; resultText = 'Inconsciente (KO)'; }
                else if (roll === 9) { result = 'Lesionado'; resultText = 'Magullado (solo reservas)'; }
                else { result = 'Lesionado'; resultText = '¡Lesionado!'; }
            } else {
                if (roll <= 7) { result = 'Activo'; resultText = 'Aturdido'; }
                else if (roll <= 9) { result = 'KO'; resultText = 'Inconsciente (KO)'; }
                else { result = 'Lesionado'; resultText = '¡Lesionado!'; }
            }

            const logMsg = `Tirada Heridas: ${die1}+${die2}=${roll} -> ${resultText}.`;
            const hasApo = victimTeam?.apothecary || (victimTeam?.wanderingApothecaries && victimTeam.wanderingApothecaries > 0);

            if (hasApo && (result === 'KO' || result === 'Lesionado')) {
                setIsApothecaryModalOpen(true);
                setInjuryState(prev => ({ ...prev, injuryRoll: { roll, result: resultText }, step: 'apothecary', log: [...log, logMsg] }));
            } else {
                playSound('injury');
                if (result !== 'Lesionado' || resultText === 'Magullado (solo reservas)') {
                    updatePlayerStatus(victimPlayer!.id, victimTeamId!, result, resultText);
                }
                setInjuryState(prev => ({
                    ...prev, injuryRoll: { roll, result: resultText },
                    step: result === 'Lesionado' && resultText !== 'Magullado (solo reservas)' ? 'regeneration_check' : 'summary',
                    log: [...log, logMsg]
                }));
            }
            break;
        }

        case 'casualty_roll': {
            const roll = parseInt(casualtyRollInput);
            if (isNaN(roll) || roll < 1 || roll > 16) break;
            const event = casualtyResults.find(e => {
                const range = e.diceRoll.split('-').map(Number);
                return range.length > 1 ? (roll >= range[0] && roll <= range[1]) : roll === range[0];
            });
            if (!event) return;
            const logMsg = `Tirada Lesión (D16)${casualtyRoll?.rerolled ? ' (repetida)' : ''}: ${roll} -> ${event.title}.`;
            const hasApo = victimTeam?.apothecary || (victimTeam?.wanderingApothecaries && victimTeam.wanderingApothecaries > 0);

            if (hasApo && !casualtyRoll?.rerolled && apothecaryAction !== 'patch_ko') {
                setIsApothecaryModalOpen(true);
                setInjuryState(prev => ({ ...prev, casualtyRoll: { roll, result: event.title, rerolled: false }, step: 'apothecary', log: [...log, logMsg] }));
            } else {
                setInjuryState(prev => ({ ...prev, casualtyRoll: { ...(prev.casualtyRoll || { roll: 0, result: '', rerolled: false }), roll, result: event.title }, step: 'regeneration_check', log: [...log, logMsg] }));
            }
            break;
        }

        case 'regeneration_check': {
            const hasRegeneration = victimPlayer?.skills.toLowerCase().includes('regeneración')
                || (victimPlayer?.skillKeys || []).includes('Regeneration');
            if (hasRegeneration) {
                setInjuryState(prev => ({ ...prev, step: 'regeneration_roll' }));
            } else {
                const eventTitle = injuryState.casualtyRoll?.result;
                if (eventTitle) {
                    updatePlayerStatus(victimPlayer!.id, victimTeamId!, eventTitle === 'Muerto' ? 'Muerto' : 'Lesionado', eventTitle);
                    setInjuryState(prev => ({ ...prev, step: eventTitle === 'Lesion Permanente' ? 'lasting_injury_roll' : 'summary' }));
                } else {
                    setInjuryState(prev => ({ ...prev, step: 'summary' }));
                }
            }
            break;
        }

        case 'regeneration_roll': {
            const roll = parseInt(regenerationRollInput);
            if (isNaN(roll) || roll < 1 || roll > 6) break;
            const success = roll >= 4;
            const logMsg = `Tirada Regeneración: ${roll} -> ${success ? '¡Éxito!' : 'Falla.'}`;
            const hasStaff = (victimTeam?.mortuaryAssistants && victimTeam.mortuaryAssistants > 0)
                || (victimTeam?.plagueDoctors && victimTeam.plagueDoctors > 0);

            if (success) {
                updatePlayerStatus(victimPlayer!.id, victimTeamId!, 'Reserva', 'Regenerado');
                setInjuryState(prev => ({ ...prev, regenerationRoll: { roll, success }, step: 'summary', log: [...log, logMsg] }));
            } else if (hasStaff && !injuryState.regenerationRoll) {
                setInjuryState(prev => ({ ...prev, regenerationRoll: { roll, success }, step: 'staff_reroll_choice', log: [...log, logMsg] }));
            } else {
                const eventTitle = injuryState.casualtyRoll?.result;
                updatePlayerStatus(victimPlayer!.id, victimTeamId!, eventTitle === 'Muerto' ? 'Muerto' : 'Lesionado', eventTitle);
                setInjuryState(prev => ({
                    ...prev, regenerationRoll: { roll, success },
                    step: eventTitle === 'Lesion Permanente' ? 'lasting_injury_roll' : 'summary',
                    log: [...log, logMsg]
                }));
            }
            break;
        }

        case 'staff_reroll_choice': {
            const eventTitle = injuryState.casualtyRoll?.result;
            updatePlayerStatus(victimPlayer!.id, victimTeamId!, eventTitle === 'Muerto' ? 'Muerto' : 'Lesionado', eventTitle);
            setInjuryState(prev => ({
                ...prev,
                step: eventTitle === 'Lesion Permanente' ? 'lasting_injury_roll' : 'summary',
                log: [...log, 'No se utiliza personal médico.']
            }));
            break;
        }

        case 'lasting_injury_roll': {
            const roll = parseInt(lastingInjuryRollInput);
            if (isNaN(roll) || roll < 1 || roll > 6) break;
            const event = lastingInjuryResults.find(e => {
                const range = e.diceRoll.split('-').map(Number);
                return range.length > 1 ? (roll >= range[0] && roll <= range[1]) : roll === range[0];
            });
            if (!event) return;
            setVictimTeam(prev => prev ? ({
                ...prev,
                players: prev.players.map(p => p.id === victimPlayer!.id ? {
                    ...p, lastingInjuries: [...p.lastingInjuries, `${event.permanentInjury} (${event.characteristicReduction})`]
                } : p)
            }) : null);
            setInjuryState(prev => ({
                ...prev,
                lastingInjuryRoll: { roll, result: event.permanentInjury, characteristic: event.characteristicReduction },
                step: 'summary',
                log: [...log, `Lesión Permanente (D6): ${roll} -> ${event.permanentInjury} (${event.characteristicReduction}).`]
            }));
            break;
        }

        case 'summary': {
            const finalLog = injuryState.log.join(' ');
            const casualtyResult = injuryState.casualtyRoll?.result;
            const isDeath = casualtyResult === 'Muerto';
            const isGraveInjury = casualtyResult && ['Gravemente Herido', 'Lesion Seria', 'Lesion Permanente'].includes(casualtyResult);
            const isRealCasualty = casualtyResult && casualtyResult !== 'Malherido';

            if (isDeath) {
                logEvent('DEATH', `¡MUERTE! ${victimPlayer?.customName} ha fallecido en el campo.`, { team: victimTeamId!, player: victimPlayer?.id });
            }

            // Devolver el Favor (Sección 5 Manual S3)
            if (isGraveInjury) {
                const hateRoll = Math.floor(Math.random() * 6) + 1;
                if (hateRoll >= 4) {
                    const attackerName = attackerPlayer?.customName || 'un rival desconocido';
                    setVictimTeam(prev => prev ? ({
                        ...prev,
                        players: prev.players.map(p => p.id === victimPlayer!.id ? {
                            ...p, gainedSkills: [...(p.gainedSkills || []), `Odio (${attackerPlayer?.position || 'Rival'}) (S3)`]
                        } : p)
                    }) : null);
                    logEvent('SKILL_GAIN', `¡DEVOLVER EL FAVOR! ${victimPlayer?.customName} gana el rasgo Odio tras una lesión grave (Dado ${hateRoll} >= 4).`, { team: victimTeamId!, player: victimPlayer?.id });
                }
            }

            if (isCasualty && isRealCasualty && attackerPlayer && attackerTeamId) {
                updatePlayerSppAndAction(attackerPlayer, attackerTeamId, 2, 'CASUALTY', `causar una baja a ${victimPlayer?.customName}`);
                logEvent('injury_casualty', `Baja causada por ${attackerPlayer.customName} sobre ${victimPlayer?.customName}. ${finalLog}`, { team: attackerTeamId, player: attackerPlayer.id, target: victimPlayer?.id });
            } else {
                logEvent('injury_casualty', `Herida a ${victimPlayer?.customName}. ${finalLog}`, { team: victimTeamId!, player: victimPlayer?.id });
            }

            setIsInjuryModalOpen(false);
            setInjuryState(initialInjuryState);
            break;
        }
    }
};

/**
 * checkBoneHeadS3 — Aplica la lógica de S3 para Cabeza Dura.
 */
export const checkBoneHeadS3 = (dieRoll: number, player: ManagedPlayer): { success: boolean; isDistracted: boolean } => {
    if (dieRoll === 1) {
        return { success: false, isDistracted: true };
    }
    return { success: dieRoll >= 2, isDistracted: false };
};
