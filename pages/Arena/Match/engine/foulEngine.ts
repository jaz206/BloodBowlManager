import { FoulState } from '../types/match.types';
import { ManagedPlayer, ManagedTeam, PlayerStatus } from '../../../../types';
import { casualtyResults } from '../../../../data/casualties';
import { lastingInjuryResults } from '../../../../data/lastingInjuries';

/**
 * Contexto necesario para ejecutar la lógica del motor de faltas.
 * Desacoplado del componente para facilitar tests y modularidad.
 */
interface FoulEngineContext {
    foulState: FoulState;
    setFoulState: React.Dispatch<React.SetStateAction<FoulState>>;
    liveHomeTeam: ManagedTeam | null;
    liveOpponentTeam: ManagedTeam | null;
    setLiveHomeTeam: React.Dispatch<React.SetStateAction<ManagedTeam | null>>;
    setLiveOpponentTeam: React.Dispatch<React.SetStateAction<ManagedTeam | null>>;
    updatePlayerStatus: (playerId: number, teamId: 'home' | 'opponent', status: PlayerStatus, statusDetail?: string) => void;
    logEvent: (type: any, description: string, extra?: any) => void;
    setIsFoulModalOpen: (isOpen: boolean) => void;
    initialFoulState: FoulState;
    playSound: (type: 'td' | 'injury' | 'turnover' | 'dice') => void;
}

/**
 * handleFoulActionLogic — máquina de estados para el flujo de faltas.
 * Avanza o retrocede entre pasos: selección de equipo → faltador → víctima → tiradas → resumen.
 */
export const handleFoulActionLogic = (ctx: FoulEngineContext, action: 'next' | 'back') => {
    const {
        foulState, setFoulState,
        liveHomeTeam, liveOpponentTeam,
        setLiveHomeTeam, setLiveOpponentTeam,
        updatePlayerStatus, logEvent, setIsFoulModalOpen,
        initialFoulState, playSound
    } = ctx;

    const {
        step, foulingPlayer, victimPlayer, armorRollInput,
        log, foulingTeamId, injuryRollInput, casualtyRollInput,
        lastingInjuryRollInput, wasExpelled
    } = foulState;

    if (action === 'back') {
        const steps: FoulState['step'][] = [
            'select_fouler_team', 'select_fouler', 'select_victim',
            'armor_roll', 'injury_roll', 'casualty_roll', 'lasting_injury_roll', 'summary'
        ];
        const currentIndex = steps.indexOf(step);
        if (currentIndex > 0) setFoulState(prev => ({ ...prev, step: steps[currentIndex - 1] }));
        return;
    }

    const foulingTeam = foulingTeamId === 'home' ? liveHomeTeam : liveOpponentTeam;
    const setFoulingTeam = foulingTeamId === 'home' ? setLiveHomeTeam : setLiveOpponentTeam;

    switch (step) {
        case 'select_fouler':
            if (foulingPlayer) setFoulState(prev => ({ ...prev, step: 'select_victim' }));
            break;

        case 'select_victim':
            if (victimPlayer) setFoulState(prev => ({ ...prev, step: 'armor_roll' }));
            break;

        case 'armor_roll': {
            const die1 = parseInt(armorRollInput.die1), die2 = parseInt(armorRollInput.die2);
            if (isNaN(die1) || isNaN(die2)) break;
            const roll = die1 + die2;
            const armorValue = parseInt(victimPlayer!.stats.AR.replace('+', ''));
            const armorBroken = roll > armorValue;
            const isDoubles = die1 === die2;
            let logMsg = `Tirada Armadura (${victimPlayer!.stats.AR}) a ${victimPlayer!.customName}: ${die1}+${die2}=${roll}.`;
            if (isDoubles) logMsg += ' ¡Dobles!';

            let currentlyExpelled = isDoubles;
            if (isDoubles && foulingTeam?.biasedRef) {
                const biasedRoll = Math.floor(Math.random() * 6) + 1;
                if (biasedRoll >= 2) {
                    logMsg += ` ¡Árbitro Parcial (${biasedRoll}) evita la expulsión!`;
                    currentlyExpelled = false;
                } else {
                    logMsg += ` ¡Árbitro Parcial (${biasedRoll}) falla!`;
                    setFoulingTeam(prev => prev ? ({ ...prev, biasedRef: false }) : null);
                }
            }

            const nextStep = armorBroken ? 'injury_roll' : 'summary';
            logMsg += armorBroken ? ' ¡Rota!' : ' Aguanta.';
            setFoulState(prev => ({
                ...prev, armorRoll: { roll, armorBroken }, step: nextStep,
                log: [...log, logMsg],
                wasExpelled: wasExpelled || currentlyExpelled,
                expulsionReason: currentlyExpelled ? `¡${foulingPlayer?.customName} expulsado por dobles!` : ''
            }));
            break;
        }

        case 'injury_roll': {
            const die1 = parseInt(injuryRollInput.die1), die2 = parseInt(injuryRollInput.die2);
            if (isNaN(die1) || isNaN(die2)) break;
            const roll = die1 + die2;
            const isDoubles = die1 === die2;
            const resultText = roll <= 7 ? 'Aturdido' : roll <= 9 ? 'Inconsciente (KO)' : '¡Lesionado!';
            const finalStatus: PlayerStatus = roll <= 7 ? 'Activo' : roll <= 9 ? 'KO' : 'Lesionado';
            let logMsg = `Tirada Heridas: ${die1}+${die2}=${roll} -> ${resultText}.`;
            if (isDoubles) logMsg += ' ¡Dobles!';

            let currentlyExpelled = wasExpelled || isDoubles;
            if (isDoubles && foulingTeam?.biasedRef && !wasExpelled) {
                const biasedRoll = Math.floor(Math.random() * 6) + 1;
                if (biasedRoll >= 2) {
                    logMsg += ` ¡Árbitro Parcial (${biasedRoll}) evita la expulsión!`;
                    currentlyExpelled = false;
                } else {
                    logMsg += ` ¡Árbitro Parcial (${biasedRoll}) falla!`;
                    setFoulingTeam(prev => prev ? ({ ...prev, biasedRef: false }) : null);
                }
            }

            const victimTeamId = foulingTeamId === 'home' ? 'opponent' : 'home';
            updatePlayerStatus(victimPlayer!.id, victimTeamId, finalStatus, resultText);

            setFoulState(prev => ({
                ...prev, injuryRoll: { roll, result: resultText },
                step: finalStatus === 'Lesionado' ? 'casualty_roll' : 'summary',
                log: [...log, logMsg],
                wasExpelled: currentlyExpelled,
                expulsionReason: currentlyExpelled ? `¡${foulingPlayer?.customName} expulsado por dobles!` : prev.expulsionReason
            }));
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
            const victimTeamId = foulingTeamId === 'home' ? 'opponent' : 'home';
            updatePlayerStatus(victimPlayer!.id, victimTeamId, event.title === 'Muerto' ? 'Muerto' : 'Lesionado', event.title);
            setFoulState(prev => ({
                ...prev, casualtyRoll: { roll, result: event.title },
                step: event.title === 'Lesion Permanente' ? 'lasting_injury_roll' : 'summary',
                log: [...log, `Tirada Lesión (D16): ${roll} -> ${event.title}.`]
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
            const victimTeamId = foulingTeamId === 'home' ? 'opponent' : 'home';
            const setVictimTeam = victimTeamId === 'home' ? setLiveHomeTeam : setLiveOpponentTeam;
            setVictimTeam(prev => prev ? ({
                ...prev,
                players: prev.players.map(p => p.id === victimPlayer!.id ? {
                    ...p, lastingInjuries: [...p.lastingInjuries, `${event.permanentInjury} (${event.characteristicReduction})`]
                } : p)
            }) : null);
            setFoulState(prev => ({
                ...prev,
                lastingInjuryRoll: { roll, result: event.permanentInjury, characteristic: event.characteristicReduction },
                step: 'summary',
                log: [...log, `Lesión Permanente (D6): ${roll} -> ${event.permanentInjury} (${event.characteristicReduction}).`]
            }));
            break;
        }

        case 'summary': {
            if (wasExpelled && foulingPlayer && foulingTeamId) {
                const foulTeamId = foulingTeamId === 'home' ? 'home' : 'opponent';
                updatePlayerStatus(foulingPlayer.id, foulTeamId, 'Expulsado', 'Expulsado por falta');
                logEvent('EXPULSION', `¡${foulingPlayer.customName} expulsado!`, { team: foulTeamId, player: foulingPlayer.id });
            }
            logEvent(
                'foul_attempt',
                `Falta de ${foulingPlayer?.customName} sobre ${victimPlayer?.customName}. ${foulState.log.join(' ')}`,
                { team: foulingTeamId, player: foulingPlayer?.id }
            );
            setIsFoulModalOpen(false);
            setFoulState(initialFoulState);
            break;
        }
    }
};
