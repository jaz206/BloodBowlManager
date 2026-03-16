import React, { useState } from 'react';
import { useMatch } from '../../context/MatchContext';
import { skillsData } from '../../../../../data/skills';
import SkillModal from '../../../../../components/oracle/SkillModal';
import { ManagedPlayer, Skill } from '../../../../../types';

const SkillButton: React.FC<{ skillName: string; onSkillClick: (name: string) => void; disabled?: boolean }> = ({ skillName, onSkillClick, disabled }) => {
    const cleanSkillName = skillName.split('(')[0].trim();
    const hasDescription = skillsData.some(s => s.name.toLowerCase().startsWith(cleanSkillName.toLowerCase()));

    if (hasDescription) {
        return (
            <button
                onClick={() => onSkillClick(cleanSkillName)}
                disabled={disabled}
                className={`text-[10px] font-display font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg transition-premium border ${disabled 
                    ? 'bg-white/5 border-white/5 text-slate-600 line-through cursor-not-allowed opacity-50' 
                    : 'bg-sky-500/10 border-sky-500/20 text-sky-400 hover:bg-sky-500/20 hover:border-sky-500/40'}`}
            >
                {skillName}
            </button>
        );
    }
    return <span className={`border text-[10px] font-display font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg ${disabled ? 'bg-black/20 border-white/5 text-slate-800 line-through' : 'bg-white/5 border-white/10 text-white/40'}`}>{skillName}</span>;
};

const PlayerCardModal: React.FC = () => {
    const {
        viewingPlayer,
        setViewingPlayer,
        ballCarrierId,
        handleBallToggle,
        handleUpdatePlayerCondition,
        liveHomeTeam,
        selectedSkillForModal,
        setSelectedSkillForModal
    } = useMatch();

    const [internalSkill, setInternalSkill] = useState<Skill | null>(null);

    if (!viewingPlayer) return null;

    const onClose = () => setViewingPlayer(null);

    const isBallCarrier = ballCarrierId === viewingPlayer.id;
    const teamId = liveHomeTeam?.players.some(p => p.id === viewingPlayer.id) ? 'home' : 'opponent';

    const handleSkillClick = (skillName: string) => {
        const foundSkill = skillsData.find(s => s.name.toLowerCase().startsWith(skillName.toLowerCase()));
        if (foundSkill) {
            setInternalSkill(foundSkill);
        }
    };

    const allSkills = [...(viewingPlayer.skills ? viewingPlayer.skills.split(', ').filter(s => s.toLowerCase() !== 'ninguna') : []), ...viewingPlayer.gainedSkills];

    return (
        <>
            <div
                className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[500] p-4 animate-fade-in-fast"
                onClick={onClose}
                role="dialog"
                aria-modal="true"
            >
                <div className="glass-panel max-w-lg w-full transform animate-slide-in-up border-white/10 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] max-h-[95vh] flex flex-col bg-black" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-start p-6 border-b border-white/5 bg-white/5">
                        <div>
                            <h2 className="text-2xl font-display font-black text-white italic uppercase tracking-tighter leading-none">{viewingPlayer.customName}</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <p className="text-[10px] font-display font-bold text-slate-500 uppercase tracking-widest">
                                    {viewingPlayer.position}
                                </p>
                                {viewingPlayer.isJourneyman && <span className="text-premium-gold text-[9px] font-display font-black uppercase tracking-widest bg-premium-gold/10 px-1.5 py-0.5 rounded border border-premium-gold/20 italic">Sustituto Temporal</span>}
                                {viewingPlayer.isStarPlayer && <span className="text-sky-400 text-[9px] font-display font-black uppercase tracking-widest bg-sky-400/10 px-1.5 py-0.5 rounded border border-sky-400/20 italic">Jugador Estrella</span>}
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-premium"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    <div className="p-8 overflow-y-auto space-y-8 custom-scrollbar">
                        {/* S3 Conditions Quick Panel */}
                        <div className="bg-black/40 border border-white/5 rounded-[2.5rem] p-6 space-y-4">
                            <h3 className="text-[10px] font-display font-black text-slate-500 uppercase tracking-[0.3em] mb-2 px-4 italic">Intervenciones del Caos</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => handleUpdatePlayerCondition(viewingPlayer.id, teamId, 'isDistracted')}
                                    className={`group relative flex flex-col items-center justify-center p-5 rounded-3xl border-2 transition-all duration-300 ${viewingPlayer.isDistracted
                                        ? 'bg-red-600 border-red-500 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)]'
                                        : 'bg-white/5 border-white/10 text-slate-500 hover:border-red-500/50 hover:text-red-400'
                                        }`}
                                >
                                    <span className={`material-symbols-outlined text-3xl mb-2 transition-transform duration-500 ${viewingPlayer.isDistracted ? 'scale-110' : 'group-hover:rotate-12'}`}>psychology_alt</span>
                                    <span className="text-[10px] font-display font-black uppercase tracking-widest">Distraído</span>
                                    {viewingPlayer.isDistracted && <div className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full animate-ping"></div>}
                                </button>

                                <button
                                    onClick={() => handleUpdatePlayerCondition(viewingPlayer.id, teamId, 'hasIndigestion')}
                                    className={`group relative flex flex-col items-center justify-center p-5 rounded-3xl border-2 transition-all duration-300 ${viewingPlayer.hasIndigestion
                                        ? 'bg-amber-500 border-amber-400 text-black shadow-[0_0_20px_rgba(245,159,10,0.4)]'
                                        : 'bg-white/5 border-white/10 text-slate-500 hover:border-amber-500/50 hover:text-amber-400'
                                        }`}
                                >
                                    <span className={`material-symbols-outlined text-3xl mb-2 transition-transform duration-500 ${viewingPlayer.hasIndigestion ? 'scale-110' : 'group-hover:rotate-12'}`}>restaurant</span>
                                    <span className="text-[10px] font-display font-black uppercase tracking-widest leading-tight">Indigestión<br/><span className="text-[8px] opacity-70">-1 MV/AR</span></span>
                                    {viewingPlayer.hasIndigestion && <div className="absolute top-2 right-2 w-2 h-2 bg-black rounded-full animate-ping"></div>}
                                </button>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-[10px] font-display font-bold text-slate-500 uppercase tracking-[0.2em] mb-4 px-2">Estadísticas de Campo</h3>
                            <div className="grid grid-cols-5 gap-3">
                                {Object.entries(viewingPlayer.stats).map(([stat, value]) => {
                                    let displayValue = value;
                                    let isModified = false;
                                    if (viewingPlayer.hasIndigestion) {
                                        if (stat === 'MV') {
                                            displayValue = Math.max(1, (value as number) - 1);
                                            isModified = true;
                                        }
                                        if (stat === 'AR') {
                                            const arValue = parseInt((value as string).replace('+', ''));
                                            displayValue = `${Math.max(1, arValue - 1)}+`;
                                            isModified = true;
                                        }
                                    }
                                    return (
                                        <div key={stat} className={`bg-black/40 border rounded-2xl p-4 text-center group/stat transition-premium ${isModified ? 'border-amber-500/30' : 'border-white/5 hover:border-premium-gold/30'}`}>
                                            <span className={`block text-[8px] font-display font-black uppercase tracking-widest mb-1 ${isModified ? 'text-amber-400' : 'text-slate-500 group-hover/stat:text-premium-gold/60'}`}>{stat}</span>
                                            <span className={`text-lg font-display font-black italic ${isModified ? 'text-amber-400' : 'text-white'}`}>{displayValue}</span>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="mt-4 bg-premium-gold/5 border border-premium-gold/20 rounded-xl p-3 flex justify-between items-center">
                                <span className="text-[10px] font-display font-black text-premium-gold uppercase tracking-widest">Puntos de Estrellato</span>
                                <span className="text-lg font-display font-black text-white italic">{viewingPlayer.spp} SPP</span>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-[10px] font-display font-bold text-slate-500 uppercase tracking-[0.2em] mb-4 px-2">Habilidades & Tratos</h3>
                            <div className="flex flex-wrap gap-2">
                                {allSkills.length > 0 ? allSkills.map((skill, index) => (
                                    <div key={`${skill}-${index}`} className="flex items-center">
                                        <SkillButton skillName={skill} onSkillClick={handleSkillClick} disabled={viewingPlayer.isDistracted} />
                                    </div>
                                )) : <span className="text-white/20 font-display font-medium italic">Sin habilidades especiales</span>}
                            </div>
                        </div>

                        {viewingPlayer.lastingInjuries && viewingPlayer.lastingInjuries.length > 0 && (
                            <div className="bento-card border-red-500/30 bg-red-500/5 p-6">
                                <h3 className="text-[10px] font-display font-bold text-red-400 uppercase tracking-[0.2em] mb-3">Registros Médicos: Lesiones</h3>
                                <div className="flex flex-wrap gap-2">
                                    {viewingPlayer.lastingInjuries.map((injury, i) => (
                                        <span key={i} className="bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-display font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg">{injury}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex gap-4 pt-4">
                            <button
                                onClick={() => handleBallToggle(viewingPlayer.id)}
                                className={`flex-1 flex flex-col items-center justify-center p-6 rounded-[2.5rem] border-2 transition-all duration-300 font-display font-black uppercase tracking-[0.2em] italic ${isBallCarrier
                                    ? 'bg-sky-500 border-sky-400 text-black shadow-[0_0_30px_rgba(14,165,233,0.4)]'
                                    : 'bg-white/5 border-white/10 text-slate-500 hover:border-sky-500/50 hover:text-sky-400'
                                    }`}
                            >
                                <span className="text-3xl mb-2">{isBallCarrier ? '🏈' : '🏉'}</span>
                                <span className="text-[10px]">{isBallCarrier ? 'Tiene el Balón' : 'Dar Balón'}</span>
                            </button>
                        </div>
                    </div>
                    <div className="p-4 bg-black/20 border-t border-white/5">
                        <button
                            onClick={onClose}
                            className="w-full text-[10px] font-display font-black uppercase tracking-[0.3em] text-slate-500 hover:text-white transition-premium py-4"
                        >
                            Cerrar Visor de Jugador
                        </button>
                    </div>
                </div>
            </div>
            {internalSkill && <SkillModal skill={internalSkill} onClose={() => setInternalSkill(null)} />}
        </>
    );
};

export default PlayerCardModal;
