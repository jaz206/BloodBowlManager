import React, { useState, useMemo, useEffect } from 'react';
// FIX: BoardToken is defined in types.ts, not GameBoard.tsx. BlockResolution is exported from GameBoard.
import type { BlockResolution } from './GameBoard';
import type { BoardToken } from '../types';
import BlockDiceSkullIcon from './icons/BlockDiceSkullIcon';
import BlockDiceBothDownIcon from './icons/BlockDiceBothDownIcon';
import BlockDicePushIcon from './icons/BlockDicePushIcon';
import BlockDiceStumbleIcon from './icons/BlockDiceStumbleIcon';
import BlockDicePowIcon from './icons/BlockDicePowIcon';

interface BlockAssistantModalProps {
  attacker: BoardToken;
  defender: BoardToken;
  allTokens: BoardToken[];
  ballCarrierId: number | null;
  onClose: () => void;
  onBlockResolved: (outcome: BlockResolution) => void;
}

const isAdjacent = (token1: {x:number, y:number}, token2: {x:number, y:number}): boolean => {
    return Math.abs(token1.x - token2.x) <= 1 && Math.abs(token1.y - token2.y) <= 1 && (token1.x !== token2.x || token1.y !== token2.y);
}

const calculateAssists = (playerToAssist: BoardToken, opponent: BoardToken, allTokens: BoardToken[]): number => {
    const potentialAssisters = allTokens.filter(t =>
        t.teamId === playerToAssist.teamId &&
        t.id !== playerToAssist.id &&
        isAdjacent(t, opponent) &&
        !t.isDown
    );

    const validAssisters = potentialAssisters.filter(assister => {
        const assisterSkills = (assister.playerData?.skills || '') + ',' + (assister.playerData?.gainedSkills.join(',') || '');
        const hasTackleZoneSkill = assisterSkills.includes('Luchador');
        if (hasTackleZoneSkill) return true;

        const isMarkedByOtherOpponent = allTokens.some(otherToken =>
            otherToken.teamId !== assister.teamId &&
            otherToken.id !== opponent.id &&
            isAdjacent(assister, otherToken) &&
            !otherToken.isDown
        );
        return !isMarkedByOtherOpponent;
    });

    return validAssisters.length;
};


const BlockAssistantModal: React.FC<BlockAssistantModalProps> = ({ attacker, defender, allTokens, ballCarrierId, onClose, onBlockResolved }) => {
  const [attackerAssists, setAttackerAssists] = useState(0);
  const [defenderAssists, setDefenderAssists] = useState(0);
  const [rolledDice, setRolledDice] = useState<string[] | null>(null);
  const [selectedDie, setSelectedDie] = useState<string | null>(null);
  const [useBlockSkill, setUseBlockSkill] = useState(true);

  useEffect(() => {
    if (attacker && defender && allTokens) {
        const attAssists = calculateAssists(attacker, defender, allTokens);
        const defAssists = calculateAssists(defender, attacker, allTokens);
        setAttackerAssists(attAssists);
        setDefenderAssists(defAssists);
    }
  }, [attacker, defender, allTokens]);

  const attackerStrength = useMemo(() => parseInt(attacker.playerData?.stats.FU || '0'), [attacker]);
  const defenderStrength = useMemo(() => parseInt(defender.playerData?.stats.FU || '0'), [defender]);

  const finalAttackerStrength = attackerStrength + attackerAssists;
  const finalDefenderStrength = defenderStrength + defenderAssists;

  const blockDiceResult = useMemo(() => {
    if (finalAttackerStrength > finalDefenderStrength * 2) return { text: "3 DADOS A TU FAVOR", color: "text-green-400", diceCount: 3 };
    if (finalAttackerStrength > finalDefenderStrength) return { text: "2 DADOS A TU FAVOR", color: "text-green-400", diceCount: 2 };
    if (finalAttackerStrength === finalDefenderStrength) return { text: "1 DADO", color: "text-yellow-400", diceCount: 1 };
    if (finalDefenderStrength > finalAttackerStrength * 2) return { text: "3 DADOS EN TU CONTRA", color: "text-red-400", diceCount: -3 };
    if (finalDefenderStrength > finalAttackerStrength) return { text: "2 DADOS EN TU CONTRA", color: "text-red-400", diceCount: -2 };
    return { text: "Resultado no válido", color: "text-gray-400", diceCount: 0 };
  }, [finalAttackerStrength, finalDefenderStrength]);

  const attackerSkills = useMemo(() => (attacker.playerData?.skills || '') + ',' + (attacker.playerData?.gainedSkills.join(',') || ''), [attacker]);
  const defenderSkills = useMemo(() => (defender.playerData?.skills || '') + ',' + (defender.playerData?.gainedSkills.join(',') || ''), [defender]);

  const outcome = useMemo((): (BlockResolution & { summary: string[] }) | null => {
    if (!selectedDie) return null;
    
    const hasBlock = attackerSkills.includes('Placar');
    const hasWrestle = attackerSkills.includes('Lucha') || defenderSkills.includes('Lucha');
    const hasDodge = defenderSkills.includes('Esquivar') && !attackerSkills.includes('Placaje defensivo');
    const hasStripBall = attackerSkills.includes('Robar balón');

    let knockDowns: { id: number; isTurnoverSource: boolean }[] = [];
    let ballBecomesLoose = false;
    let summary: string[] = [];

    switch (selectedDie) {
        case 'Derribado':
            knockDowns.push({ id: attacker.id, isTurnoverSource: true });
            summary.push(`¡${attacker.playerData?.customName} es derribado!`, `¡CAMBIO DE TURNO!`);
            break;
        case 'Ambos Derribados':
            if (hasWrestle) {
                knockDowns.push({ id: attacker.id, isTurnoverSource: false }, { id: defender.id, isTurnoverSource: false });
                summary.push(`Ambos jugadores usan Lucha. Son colocados boca arriba, sin cambio de turno.`);
            } else if (hasBlock && useBlockSkill) {
                knockDowns.push({ id: defender.id, isTurnoverSource: false });
                summary.push(`${attacker.playerData?.customName} usa Placar para permanecer en pie.`);
                summary.push(`${defender.playerData?.customName} es derribado.`);
            } else {
                knockDowns.push({ id: attacker.id, isTurnoverSource: true }, { id: defender.id, isTurnoverSource: false });
                summary.push(`Ambos jugadores son derribados.`, `¡CAMBIO DE TURNO por el atacante!`);
            }
            break;
        case 'Empujón y Caída':
            if (hasDodge) {
                summary.push(`${defender.playerData?.customName} usa Esquivar. El resultado se trata como un Empujón.`);
            } else {
                knockDowns.push({ id: defender.id, isTurnoverSource: false });
                summary.push(`${defender.playerData?.customName} es derribado.`);
            }
            break;
        case '¡Placaje!':
            knockDowns.push({ id: defender.id, isTurnoverSource: false });
            summary.push(`¡${defender.playerData?.customName} es derribado con violencia!`);
            break;
        case 'Empujón':
            summary.push(`${defender.playerData?.customName} es empujado.`);
            break;
    }

    const defenderIsCarrier = defender.id === ballCarrierId;
    const defenderKnockedDown = knockDowns.some(kd => kd.id === defender.id);
    const isPushed = ['Empujón', 'Empujón y Caída', '¡Placaje!'].includes(selectedDie) || (selectedDie === 'Ambos Derribados' && hasBlock && useBlockSkill);

    if (defenderIsCarrier && (defenderKnockedDown || (isPushed && hasStripBall))) {
        ballBecomesLoose = true;
        summary.push("¡El balón queda suelto!");
    }

    return { knockDowns, ballBecomesLoose, summary };
  }, [selectedDie, attacker, defender, ballCarrierId, attackerSkills, defenderSkills, useBlockSkill]);


  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const diceFaceMap: Record<string, React.FC<{className?: string}>> = {
    'Derribado': BlockDiceSkullIcon,
    'Ambos Derribados': BlockDiceBothDownIcon,
    'Empujón': BlockDicePushIcon,
    'Empujón y Caída': BlockDiceStumbleIcon,
    '¡Placaje!': BlockDicePowIcon
  };
  const diceFaceNames = Object.keys(diceFaceMap);

  const handleRollDice = () => {
    const { diceCount } = blockDiceResult;
    if (diceCount === 0) return;
    const absDiceCount = Math.abs(diceCount);
    
    const results: string[] = [];
    for (let i = 0; i < absDiceCount; i++) {
        results.push(diceFaceNames[Math.floor(Math.random() * diceFaceNames.length)]);
    }
    setRolledDice(results);
  };
  
  const handleConfirm = () => {
    if (outcome) {
        onBlockResolved(outcome);
        onClose();
    }
  };
  
  const handleReset = () => {
    setRolledDice(null);
    setSelectedDie(null);
  }

  const attackerIsHome = attacker.teamId === 'home';
  const defenderIsHome = defender.teamId === 'home';

  const attackerBorder = attackerIsHome ? 'border-sky-500' : 'border-red-500';
  const attackerText = attackerIsHome ? 'text-sky-400' : 'text-red-400';

  const defenderBorder = defenderIsHome ? 'border-sky-500' : 'border-red-500';
  const defenderText = defenderIsHome ? 'text-sky-400' : 'text-red-400';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] p-4" onClick={handleBackdropClick}>
      <div className="bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-w-lg w-full" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-amber-400 text-center">Asistente de Placaje</h2>
        </div>
        {!rolledDice ? (
            <div className="p-5 space-y-4">
                {/* Pre-roll view */}
                <div className="grid grid-cols-2 gap-4 items-start">
                    <div className={`bg-slate-900/70 p-3 rounded-lg border ${attackerBorder}`}>
                        <h3 className={`font-bold ${attackerText}`}>Atacante: {attacker.playerData?.customName}</h3>
                        <p>Fuerza Base: <span className="font-bold">{attackerStrength}</span></p>
                        <p>Apoyos: <span className="font-bold">{attackerAssists}</span></p>
                        <p className="mt-1 text-lg">Fuerza Final: <span className="font-bold text-white">{finalAttackerStrength}</span></p>
                    </div>
                    <div className={`bg-slate-900/70 p-3 rounded-lg border ${defenderBorder}`}>
                        <h3 className={`font-bold ${defenderText}`}>Defensor: {defender.playerData?.customName}</h3>
                        <p>Fuerza Base: <span className="font-bold">{defenderStrength}</span></p>
                        <p>Apoyos: <span className="font-bold">{defenderAssists}</span></p>
                        <p className="mt-1 text-lg">Fuerza Final: <span className="font-bold text-white">{finalDefenderStrength}</span></p>
                    </div>
                </div>
                <div className="text-center bg-slate-900 p-3 rounded-lg">
                    <h3 className="text-lg font-bold">Resultado</h3>
                    <p className={`text-xl font-extrabold ${blockDiceResult.color}`}>{blockDiceResult.text}</p>
                </div>
            </div>
        ) : !selectedDie ? (
             <div className="p-5 text-center">
                 <h3 className="text-xl font-bold mb-4">Selecciona el resultado del dado</h3>
                 <div className="flex justify-center items-center gap-4 flex-wrap">
                     {rolledDice.map((result, index) => {
                         const Icon = diceFaceMap[result];
                         return (
                            <button key={index} onClick={() => setSelectedDie(result)} className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-slate-700 transition-colors">
                                <Icon />
                                <span className="text-xs">{result}</span>
                            </button>
                         );
                     })}
                 </div>
             </div>
        ) : (
             <div className="p-5 space-y-4">
                <h3 className="text-xl font-bold text-center">Consecuencias</h3>
                <div className="bg-slate-900/50 p-3 rounded-lg">
                    <h4 className="font-semibold text-amber-300 mb-2">Resultado seleccionado:</h4>
                    <div className="flex items-center gap-2">
                        {React.createElement(diceFaceMap[selectedDie], {className: "w-8 h-8"})}
                        <span className="font-bold text-lg">{selectedDie}</span>
                    </div>
                </div>

                {selectedDie === 'Ambos Derribados' && attackerSkills.includes('Placar') && !attackerSkills.includes('Lucha') && (
                    <div className="flex items-center gap-2 p-2 bg-slate-700 rounded-md">
                        <input id="useBlock" type="checkbox" checked={useBlockSkill} onChange={() => setUseBlockSkill(!useBlockSkill)} className="h-4 w-4 rounded text-amber-500 focus:ring-amber-400" />
                        <label htmlFor="useBlock" className="text-sm">Usar habilidad <strong>Placar</strong> para permanecer en pie</label>
                    </div>
                )}
                
                {outcome && (
                    <div className="bg-slate-900/50 p-3 rounded-lg space-y-1">
                        <h4 className="font-semibold text-amber-300 mb-2">Lo que sucede:</h4>
                        {outcome.summary.map((line, i) => <p key={i} className="text-sm">{line}</p>)}
                    </div>
                )}

                 <div className="flex justify-between items-center pt-4">
                     <button onClick={() => setSelectedDie(null)} className="text-sm text-sky-400 hover:underline">Elegir otro dado</button>
                     <button onClick={handleConfirm} className="bg-green-600 text-white font-bold py-2 px-4 rounded-md shadow-md hover:bg-green-500 transition-colors">Confirmar y Aplicar</button>
                 </div>
             </div>
        )}
        <div className="p-4 bg-slate-900/50 border-t border-slate-700 flex justify-between items-center">
            <button onClick={onClose} className="bg-slate-600 text-white font-bold py-2 px-6 rounded-md shadow-md hover:bg-slate-500 transition-colors">Cerrar</button>
            {!rolledDice ? (
                <button onClick={handleRollDice} className="bg-amber-500 text-slate-900 font-bold py-2 px-6 rounded-md shadow-md hover:bg-amber-400 transition-colors">
                    Lanzar Dados
                </button>
            ) : (
                <button onClick={handleReset} className="bg-sky-600 text-white font-bold py-2 px-6 rounded-md shadow-md hover:bg-sky-500 transition-colors">
                    Volver a Tirar
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default BlockAssistantModal;