import React, { useState, useMemo, useEffect } from 'react';
import type { BoardToken } from './GameBoard';
import BlockDiceSkullIcon from './icons/BlockDiceSkullIcon';
import BlockDiceBothDownIcon from './icons/BlockDiceBothDownIcon';
import BlockDicePushIcon from './icons/BlockDicePushIcon';
import BlockDiceStumbleIcon from './icons/BlockDiceStumbleIcon';
import BlockDicePowIcon from './icons/BlockDicePowIcon';

interface BlockAssistantModalProps {
  attacker: BoardToken;
  defender: BoardToken;
  allTokens: BoardToken[];
  onClose: () => void;
}

const isAdjacent = (token1: {x:number, y:number}, token2: {x:number, y:number}): boolean => {
    return Math.abs(token1.x - token2.x) <= 1 && Math.abs(token1.y - token2.y) <= 1 && (token1.x !== token2.x || token1.y !== token2.y);
}

const calculateAssists = (playerToAssist: BoardToken, opponent: BoardToken, allTokens: BoardToken[]): number => {
    const potentialAssisters = allTokens.filter(t =>
        t.teamId === playerToAssist.teamId &&
        t.id !== playerToAssist.id &&
        isAdjacent(t, opponent)
    );

    const validAssisters = potentialAssisters.filter(assister => {
        const isMarkedByOtherOpponent = allTokens.some(otherToken =>
            otherToken.teamId !== assister.teamId &&
            otherToken.id !== opponent.id &&
            isAdjacent(assister, otherToken)
        );
        return !isMarkedByOtherOpponent;
    });

    return validAssisters.length;
};


const BlockAssistantModal: React.FC<BlockAssistantModalProps> = ({ attacker, defender, allTokens, onClose }) => {
  const [attackerAssists, setAttackerAssists] = useState(0);
  const [defenderAssists, setDefenderAssists] = useState(0);
  const [rolledDice, setRolledDice] = useState<string[] | null>(null);

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
    if (finalDefenderStrength > finalAttackerStrength * 2) return { text: "3 DADOS EN TU CONTRA", color: "text-red-400", diceCount: 3 };
    if (finalDefenderStrength > finalAttackerStrength) return { text: "2 DADOS EN TU CONTRA", color: "text-red-400", diceCount: 2 };
    return { text: "Resultado no válido", color: "text-gray-400", diceCount: 0 };
  }, [finalAttackerStrength, finalDefenderStrength]);

  const relevantSkills = useMemo(() => {
    const skills: { player: string, name: string, description: string }[] = [];
    const attackerSkills = (attacker.playerData?.skills || '') + ',' + (attacker.playerData?.gainedSkills.join(',') || '');
    const defenderSkills = (defender.playerData?.skills || '') + ',' + (defender.playerData?.gainedSkills.join(',') || '');

    if (attackerSkills.includes('Placar')) skills.push({ player: attacker.playerData!.customName, name: 'Placar', description: 'Puede repetir un resultado de "Ambos Derribados".' });
    if (defenderSkills.includes('Placaje defensivo')) skills.push({ player: defender.playerData!.customName, name: 'Placaje Defensivo', description: 'Cancela la habilidad "Esquivar" del oponente.' });
    if (defenderSkills.includes('Esquivar') && !attackerSkills.includes('Placaje defensivo')) skills.push({ player: defender.playerData!.customName, name: 'Esquivar', description: 'Trata un "Empujón y Caída" como un simple "Empujón".' });
    if (attackerSkills.includes('Lucha') || defenderSkills.includes('Lucha')) skills.push({ player: 'Ambos', name: 'Lucha', description: 'En un "Ambos Derribados", ambos jugadores caen bocarriba sin cambio de turno.' });
    if (attackerSkills.includes('Furia')) skills.push({ player: attacker.playerData!.customName, name: 'Furia', description: 'Debe seguir al oponente si es empujado y realizar otro placaje si es posible.' });

    return skills;
  }, [attacker, defender]);

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
    
    const results: string[] = [];
    for (let i = 0; i < diceCount; i++) {
        results.push(diceFaceNames[Math.floor(Math.random() * diceFaceNames.length)]);
    }
    setRolledDice(results);
  };
  

  const DiceResultDisplay = ({ Icon, name }: { Icon: React.FC, name: string }) => (
    <div className="flex items-center gap-2 bg-slate-700/50 p-2 rounded">
        <Icon />
        <span className="text-sm font-semibold">{name}</span>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] p-4" onClick={handleBackdropClick}>
      <div className="bg-slate-800 rounded-lg shadow-xl border border-slate-700 max-w-3xl w-full" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-amber-400 text-center">Asistente de Placaje</h2>
        </div>
        <div className="p-5 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                {/* Attacker */}
                <div className="bg-slate-900/70 p-4 rounded-lg border border-sky-500">
                    <h3 className="font-bold text-sky-400 text-lg">Atacante: {attacker.playerData?.customName}</h3>
                    <p>Fuerza Base: <span className="font-bold">{attackerStrength}</span></p>
                    <div className="flex items-center gap-2 mt-2">
                        <label>Apoyos:</label>
                        <input type="number" min="0" max="10" value={attackerAssists} onChange={e => setAttackerAssists(parseInt(e.target.value) || 0)} className="w-16 bg-slate-700 p-1 rounded text-center" />
                    </div>
                    <p className="mt-2 text-xl">Fuerza Final: <span className="font-bold text-white">{finalAttackerStrength}</span></p>
                </div>
                {/* Defender */}
                <div className="bg-slate-900/70 p-4 rounded-lg border border-red-500">
                    <h3 className="font-bold text-red-400 text-lg">Defensor: {defender.playerData?.customName}</h3>
                    <p>Fuerza Base: <span className="font-bold">{defenderStrength}</span></p>
                     <div className="flex items-center gap-2 mt-2">
                        <label>Apoyos:</label>
                        <input type="number" min="0" max="10" value={defenderAssists} onChange={e => setDefenderAssists(parseInt(e.target.value) || 0)} className="w-16 bg-slate-700 p-1 rounded text-center" />
                    </div>
                     <p className="mt-2 text-xl">Fuerza Final: <span className="font-bold text-white">{finalDefenderStrength}</span></p>
                </div>
            </div>
            
            <div className="text-center bg-slate-900 p-4 rounded-lg">
                <h3 className="text-xl font-bold">Resultado</h3>
                <p className={`text-2xl font-extrabold ${blockDiceResult.color}`}>{blockDiceResult.text}</p>
            </div>

            {rolledDice ? (
                 <div className="text-center bg-slate-900 p-4 rounded-lg">
                    <h3 className="text-xl font-bold mb-4">Tirada</h3>
                    <div className="flex justify-center items-center gap-4">
                        {rolledDice.map((result, index) => {
                            const Icon = diceFaceMap[result];
                            return <div key={index} className="flex flex-col items-center gap-1"><Icon /><span className="text-xs">{result}</span></div>;
                        })}
                    </div>
                </div>
            ) : (
                <div className="space-y-3">
                    <h4 className="font-semibold text-amber-300">Resultados Posibles del Dado:</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        <DiceResultDisplay Icon={BlockDiceSkullIcon} name="Derribado" />
                        <DiceResultDisplay Icon={BlockDiceBothDownIcon} name="Ambos Derribados" />
                        <DiceResultDisplay Icon={BlockDicePushIcon} name="Empujón" />
                        <DiceResultDisplay Icon={BlockDiceStumbleIcon} name="Empujón y Caída" />
                        <DiceResultDisplay Icon={BlockDicePowIcon} name="¡Placaje!" />
                    </div>
                </div>
            )}

            {relevantSkills.length > 0 && (
                <div className="space-y-2">
                    <h4 className="font-semibold text-amber-300">Habilidades Relevantes:</h4>
                    <ul className="list-disc list-inside text-sm text-slate-300">
                        {relevantSkills.map(skill => <li key={skill.name}><strong>{skill.name}</strong> ({skill.player}): {skill.description}</li>)}
                    </ul>
                </div>
            )}
        </div>
        <div className="p-4 bg-slate-900/50 border-t border-slate-700 flex justify-between items-center">
            <button onClick={onClose} className="bg-slate-600 text-white font-bold py-2 px-6 rounded-md shadow-md hover:bg-slate-500 transition-colors">Cerrar</button>
            {rolledDice ? (
                <button onClick={() => setRolledDice(null)} className="bg-sky-600 text-white font-bold py-2 px-6 rounded-md shadow-md hover:bg-sky-500 transition-colors">
                    Reiniciar Tirada
                </button>
            ) : (
                <button onClick={handleRollDice} className="bg-amber-500 text-slate-900 font-bold py-2 px-6 rounded-md shadow-md hover:bg-amber-400 transition-colors">
                    Lanzar Dados
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default BlockAssistantModal;