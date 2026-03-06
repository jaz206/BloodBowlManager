

import React, { useState, useMemo } from 'react';
import { teamsData } from '../data/teams';
import { skillsData } from '../data/skills';
import type { Team, Skill } from '../types';
import { useAuth } from '../hooks/useAuth';
import SkillModal from './SkillModal';
import ImageModal from './ImageModal';
import RadarChart from './RadarChart';
import RadarChartModal from './RadarChartModal';

const TeamCard: React.FC<{ team: Team, onViewRoster: () => void, onViewImage: (e: React.MouseEvent) => void }> = ({ team, onViewRoster, onViewImage }) => {
    return (
        <div
            onClick={onViewRoster}
            className="group bg-slate-800 rounded-lg shadow-lg border border-slate-700 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-amber-500/10 hover:border-slate-600 hover:-translate-y-1"
            role="button"
            tabIndex={0}
            onKeyPress={(e) => (e.key === 'Enter' || e.key === ' ') && onViewRoster()}
        >
            <div className="relative">
                <img
                    src={team.image}
                    alt={`Arte de ${team.name}`}
                    className="w-full h-40 object-cover object-center transition-transform duration-300 group-hover:scale-110"
                    onClick={onViewImage}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-800 via-slate-800/50 to-transparent"></div>
            </div>
            <div className="p-4 relative">
                <h3 className="text-lg font-bold text-amber-400 truncate group-hover:text-amber-300">{team.name}</h3>
                <div className="flex justify-between items-center text-xs text-slate-400 mt-1">
                    <span>Tier: {team.tier}</span>
                    <span>Reroll: {team.rerollCost / 1000}k</span>
                </div>
            </div>
        </div>
    );
};

const TeamModal: React.FC<{ team: Team, onSkillClick: (skillName: string) => void, onClose: () => void, onImageClick: (e: React.MouseEvent) => void, onRequestTeamCreation: (rosterName: string) => void }> = ({ team, onSkillClick, onClose, onImageClick, onRequestTeamCreation }) => {
    const [isRadarModalOpen, setIsRadarModalOpen] = useState(false);
    const { isAdmin } = useAuth() as { isAdmin: boolean };
    const [isEditingImage, setIsEditingImage] = useState(false);
    const [newImageUrl, setNewImageUrl] = useState(team.image || '');

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <>
            <div
                className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-2 sm:p-4 animate-fade-in-fast"
                onClick={handleBackdropClick}
                role="dialog"
                aria-modal="true"
            >
                <div className="bg-slate-900 border border-white/10 shadow-2xl rounded-2xl max-w-6xl w-full mx-auto transform animate-slide-in-up max-h-[92vh] flex flex-col overflow-hidden relative">
                    <div className="flex justify-between items-center p-4 sm:p-6 border-b border-white/5 bg-white/5">
                        <h2 className="text-2xl sm:text-3xl font-display font-black text-amber-400 tracking-tight italic uppercase">{team.name}</h2>
                        <div className="flex items-center gap-2 sm:gap-4">
                            <button
                                onClick={() => { onRequestTeamCreation(team.name); onClose(); }}
                                className="bg-amber-500 text-slate-900 font-bold py-2.5 px-4 sm:px-6 rounded-full shadow-lg hover:bg-amber-400 transition-premium text-xs sm:text-sm uppercase tracking-widest"
                            >
                                Crear equipo
                            </button>
                            <button onClick={onClose} className="text-slate-400 hover:text-white hover:bg-white/10 p-2 rounded-full transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div className="p-4 sm:p-5 overflow-y-auto">
                        <div className="flex flex-col sm:flex-row gap-x-6 gap-y-4 mb-6">
                            {(team.image || isAdmin) && (
                                <div className="flex-shrink-0 sm:w-48 mx-auto relative group">
                                    <img
                                        src={isEditingImage ? newImageUrl : team.image}
                                        alt={`Escudo de ${team.name}`}
                                        className="w-full h-auto object-contain rounded-md bg-slate-900/50 p-2 border border-slate-700 cursor-pointer transition-transform hover:scale-105"
                                        onClick={onImageClick}
                                    />
                                    {isAdmin && (
                                        <div className="mt-2 space-y-2">
                                            {isEditingImage ? (
                                                <div className="flex flex-col gap-2">
                                                    <input
                                                        type="text"
                                                        value={newImageUrl}
                                                        onChange={(e) => setNewImageUrl(e.target.value)}
                                                        className="text-xs bg-slate-800 border border-slate-600 rounded p-1 w-full text-white"
                                                        placeholder="URL de la imagen..."
                                                    />
                                                    <div className="flex gap-1">
                                                        <button
                                                            onClick={() => { team.image = newImageUrl; setIsEditingImage(false); }}
                                                            className="text-[10px] bg-green-600 px-2 py-1 rounded text-white"
                                                        >
                                                            Guardar
                                                        </button>
                                                        <button
                                                            onClick={() => { setIsEditingImage(false); setNewImageUrl(team.image || ''); }}
                                                            className="text-[10px] bg-slate-600 px-2 py-1 rounded text-white"
                                                        >
                                                            Cancelar
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setIsEditingImage(true)}
                                                    className="w-full text-[10px] bg-amber-600/20 hover:bg-amber-600/40 border border-amber-600/50 text-amber-400 py-1 rounded"
                                                >
                                                    Cambiar Escudo (Admin)
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                            <div className="flex-grow sm:w-1/2">
                                {team.ratings && (
                                    <button onClick={() => setIsRadarModalOpen(true)} className="w-full max-w-xs mx-auto rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-amber-400" aria-label="Ampliar gráfico de estadísticas">
                                        <RadarChart ratings={[{ data: team.ratings, color: '#f59e0b' }]} />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="text-sm text-slate-300 space-y-2 mb-6 bg-white/5 p-4 rounded-xl border border-white/5">
                            <p><span className='font-bold text-slate-400'>Coste Segunda Oportunidad:</span> {team.rerollCost.toLocaleString()} M.O.</p>
                            <p><span className='font-bold text-slate-400'>Nivel (Tier):</span> {team.tier}</p>
                            <p><span className='font-bold text-slate-400'>Médico (Boticario):</span> {team.apothecary}</p>
                            <p><span className='font-bold text-slate-400'>Reglas especiales:</span> {team.specialRules}</p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm border-collapse">
                                <thead className="bg-white/10 text-amber-300 font-display">
                                    <tr>
                                        <th className="p-3 border-b border-white/10">Cant.</th>
                                        <th className="p-3 border-b border-white/10">Posición</th>
                                        <th className="p-3 border-b border-white/10">Coste</th>
                                        <th className="p-3 border-b border-white/10 text-center">MA</th>
                                        <th className="p-3 border-b border-white/10 text-center">FU</th>
                                        <th className="p-3 border-b border-white/10 text-center">AG</th>
                                        <th className="p-3 border-b border-white/10 text-center">PA</th>
                                        <th className="p-3 border-b border-white/10 text-center">AR</th>
                                        <th className="p-3 border-b border-white/10">Habilidades y Rasgos</th>
                                        <th className="p-3 border-b border-white/10 text-center">Prim.</th>
                                        <th className="p-3 border-b border-white/10 text-center">Sec.</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700">
                                    {team.roster.map(player => (
                                        <tr key={player.position} className="bg-white/5 hover:bg-white/10 transition-colors">
                                            <td className="p-3 border-b border-white/5 whitespace-nowrap">{player.qty}</td>
                                            <td className="p-3 border-b border-white/5 font-semibold text-slate-100 whitespace-nowrap">{player.position}</td>
                                            <td className="p-3 border-b border-white/5 whitespace-nowrap text-amber-200/80">{player.cost.toLocaleString()}</td>
                                            <td className="p-3 border-b border-white/5 text-center">{player.stats.MV}</td>
                                            <td className="p-3 border-b border-white/5 text-center font-bold text-slate-300">{player.stats.FU}</td>
                                            <td className="p-3 border-b border-white/5 text-center">{player.stats.AG}</td>
                                            <td className="p-3 border-b border-white/5 text-center">{player.stats.PS}</td>
                                            <td className="p-3 border-b border-white/5 text-center">{player.stats.AR}</td>
                                            <td className="p-3 border-b border-white/5 text-xs whitespace-normal min-w-[250px] leading-relaxed">
                                                {player.skills.split(', ').map((skill, index, arr) => {
                                                    const cleanSkillName = skill.trim();
                                                    if (cleanSkillName && cleanSkillName.toLowerCase() !== 'ninguna' && cleanSkillName.toLowerCase() !== 'none') {
                                                        return (
                                                            <React.Fragment key={skill}>
                                                                <button onClick={() => onSkillClick(cleanSkillName)} className="text-sky-400 hover:text-sky-300 hover:underline">{cleanSkillName}</button>
                                                                {index < arr.length - 1 && ', '}
                                                            </React.Fragment>
                                                        );
                                                    }
                                                    return cleanSkillName + (index < arr.length - 1 ? ', ' : '');
                                                })}
                                            </td>
                                            <td className="p-3 border-b border-white/5 text-center font-mono text-xs">{player.primary}</td>
                                            <td className="p-3 border-b border-white/5 text-center font-mono text-xs">{player.secondary}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <style>{`
                    @keyframes fade-in-fast { from { opacity: 0; } to { opacity: 1; } }
                    @keyframes slide-in-up { from { transform: translateY(20px) scale(0.98); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
                    .animate-fade-in-fast { animation: fade-in-fast 0.2s ease-out forwards; }
                    .animate-slide-in-up { animation: slide-in-up 0.3s ease-out forwards; }
                `}</style>
            </div>
            {isRadarModalOpen && <RadarChartModal team={team} onClose={() => setIsRadarModalOpen(false)} />}
        </>
    );
};

interface TeamsProps {
    onRequestTeamCreation?: (rosterName: string) => void;
}

const Teams: React.FC<TeamsProps> = ({ onRequestTeamCreation = () => { } }) => {
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
    const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
    const [enlargedImage, setEnlargedImage] = useState<{ src: string, alt: string } | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredTeams = useMemo(() => {
        if (!searchTerm) {
            return teamsData;
        }
        return teamsData.filter(team =>
            team.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm]);

    const handleSkillClick = (skillName: string) => {
        const cleanedName = skillName.split('(')[0].trim();
        const foundSkill = skillsData.find(s => s.name.toLowerCase().startsWith(cleanedName.toLowerCase()));
        if (foundSkill) setSelectedSkill(foundSkill);
    };

    const handleImageClick = (e: React.MouseEvent, team: Team) => {
        e.stopPropagation();
        if (team.image) setEnlargedImage({ src: team.image, alt: team.name });
    };

    return (
        <div className="space-y-6">
            <div className="sticky top-2 z-10 mb-6">
                <input
                    type="text"
                    placeholder="Buscar equipo..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full max-w-md mx-auto bg-slate-900 border-2 border-slate-600 rounded-lg py-3 px-4 text-white placeholder-slate-400 focus:ring-amber-500 focus:border-amber-500 shadow-lg"
                    aria-label="Buscar equipo por nombre"
                />
            </div>

            {filteredTeams.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {filteredTeams.map((team) => (
                        <TeamCard
                            key={team.name}
                            team={team}
                            onViewRoster={() => setSelectedTeam(team)}
                            onViewImage={(e) => handleImageClick(e, team)}
                        />
                    ))}
                </div>
            ) : (
                <p className="text-center text-slate-400 py-8">
                    No se encontraron equipos que coincidan con "{searchTerm}".
                </p>
            )}

            {selectedTeam && <TeamModal team={selectedTeam} onClose={() => setSelectedTeam(null)} onSkillClick={handleSkillClick} onImageClick={(e) => handleImageClick(e, selectedTeam)} onRequestTeamCreation={onRequestTeamCreation} />}
            {selectedSkill && <SkillModal skill={selectedSkill} onClose={() => setSelectedSkill(null)} />}
            {enlargedImage && <ImageModal src={enlargedImage.src} alt={enlargedImage.alt} onClose={() => setEnlargedImage(null)} />}
        </div>
    );
};

export default Teams;