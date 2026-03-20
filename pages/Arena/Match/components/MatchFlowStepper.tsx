import React from 'react';
import type { GameState } from '../types/match.types';

const FLOW_STEPS: Array<{
    key: GameState;
    label: string;
    description: string;
}> = [
    { key: 'selection', label: 'Selección', description: 'Elegimos equipos y modo de partida' },
    { key: 'pre_game', label: 'Prepartido', description: 'Clima, incentivos y saque inicial' },
    { key: 'in_progress', label: 'Partido', description: 'Turnos, bajas, SPP y jugadas' },
    { key: 'ko_recovery', label: 'KO', description: 'Recuperación entre drives' },
    { key: 'post_game', label: 'Postpartido', description: 'Acta, MVP, lesiones y recompensas' },
    { key: 'reports', label: 'Archivo', description: 'Crónicas y memoria histórica' },
];

const getStepIndex = (state: GameState) => {
    if (state === 'setup') return 0;
    const index = FLOW_STEPS.findIndex(step => step.key === state);
    return index >= 0 ? index : 0;
};

interface MatchFlowStepperProps {
    gameState: GameState;
    matchMode: 'friendly' | 'competition';
}

const MatchFlowStepper: React.FC<MatchFlowStepperProps> = ({ gameState, matchMode }) => {
    const activeIndex = getStepIndex(gameState);

    return (
        <div className="max-w-[1600px] mx-auto px-6 pt-6">
            <div className="glass-panel bg-black/50 border-white/5 rounded-[2rem] px-5 py-4">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-500">Arena Flow</p>
                        <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">
                            {FLOW_STEPS[activeIndex]?.label || 'Arena'}
                            <span className="text-primary ml-2">{matchMode === 'friendly' ? 'Amistoso' : 'Competición'}</span>
                        </h3>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-1">
                            {FLOW_STEPS[activeIndex]?.description || 'Flujo de partido'}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {FLOW_STEPS.map((step, index) => {
                            const isActive = index === activeIndex;
                            const isDone = index < activeIndex;
                            return (
                                <div
                                    key={step.key}
                                    className={`min-w-[110px] rounded-2xl border px-3 py-2 transition-all ${
                                        isActive
                                            ? 'bg-primary text-black border-primary shadow-[0_0_20px_rgba(202,138,4,0.2)]'
                                            : isDone
                                                ? 'bg-primary/10 text-primary border-primary/20'
                                                : 'bg-white/5 text-slate-500 border-white/5'
                                    }`}
                                >
                                    <p className="text-[9px] font-black uppercase tracking-[0.25em]">{step.label}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MatchFlowStepper;
