import React, { useMemo, useState } from 'react';
import { GameEvent } from '../../types';
import BookOpenIcon from '../icons/BookOpenIcon';
import FireIcon from '../icons/FireIcon';
import TdIcon from '../icons/TdIcon';
import CasualtyIcon from '../icons/CasualtyIcon';
import { transformToEpic } from '../../utils/newsGenerator';

interface MatchNarratorProps {
    events: GameEvent[];
    homeTeamName: string;
    awayTeamName: string;
    initialChronicle?: string | null;
    onChronicleGenerated?: (text: string | null) => void;
}

const MatchNarrator: React.FC<MatchNarratorProps> = ({ events, homeTeamName, awayTeamName, initialChronicle, onChronicleGenerated }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [chronicle, setChronicle] = useState<string | null>(initialChronicle || null);

    const epicEvents = useMemo(() => {
        return events.filter(e => [
            'touchdown', 'TOUCHDOWN',
            'injury', 'INJURY', 'injury_casualty', 'injury_ko',
            'turnover', 'TURNOVER',
            'foul', 'FOUL', 'foul_success', 'DEATH'
        ].includes(e.type));
    }, [events]);

    const generateChronicle = () => {
        setIsGenerating(true);
        // Simulate "AI" thinking
        setTimeout(() => {
            const homeScore = events.filter(e => String(e.type).toLowerCase() === 'touchdown' && e.team === 'home').length;
            const awayScore = events.filter(e => String(e.type).toLowerCase() === 'touchdown' && e.team === 'opponent').length;

            const winner = homeScore > awayScore ? homeTeamName : (awayScore > homeScore ? awayTeamName : null);
            const loser = winner === homeTeamName ? awayTeamName : homeTeamName;

            const headlines = winner 
                ? [
                    `¡BAÑO DE SANGRE Y GLORIA! ${winner.toUpperCase()} CONQUISTA EL EMPARRILLADO`,
                    `¡EXHIBICIÓN HISTÓRICA! ${winner.toUpperCase()} APLASTA LAS ESPERANZAS DE ${loser.toUpperCase()}`,
                    `¡LOCURA EN EL ESTADIO! ${winner.toUpperCase()} SE IMPONE EN UN DUELO DE TITANES`
                ]
                : [
                    `¡COMBATE NULO! SANGRE Y SUDOR ENTRE ${homeTeamName.toUpperCase()} Y ${awayTeamName.toUpperCase()}`,
                    `¡TABLAS EN EL INFIERNO! ${homeTeamName.toUpperCase()} Y ${awayTeamName.toUpperCase()} SE REPARTEN LOS GOLPES`,
                ];

            const intros = [
                `El ambiente era eléctrico. Los aficionados sabían que el choque entre ${homeTeamName} y ${awayTeamName} no iba a decepcionar a los paladares más exigentes de la violencia deportiva.`,
                `Nuffle sonrió hoy desde las alturas. El olor a linimento y sangre fresca dominaba el aire en este duelo entre ${homeTeamName} y ${awayTeamName}.`,
                `Si alguien dudaba de por qué este es el deporte rey, el partido de hoy entre ${homeTeamName} y ${awayTeamName} despejó cualquier interrogante.`
            ];

            let body = "";
            
            const tds = events.filter(e => String(e.type).toLowerCase() === 'touchdown');
            const casualties = events.filter(e => String(e.type).toLowerCase().includes('injury_casualty') || e.type === 'DEATH');
            const fouls = events.filter(e => String(e.type).toLowerCase().includes('foul_success') || e.type === 'EXPULSION');
            const s3Incidents = events.filter(e => e.description.includes('¡INCIDENCIA S3!'));

            if (tds.length > 0) {
                body += "\n\nLA FIESTA DE LA ANOTACIÓN\n";
                tds.forEach((td, i) => {
                    const prefix = i === 0 ? "El marcador se inauguró cuando" : "La locura continuó cuando";
                    body += `${prefix} ${transformToEpic(td).toLowerCase()} `;
                });
            }

            if (s3Incidents.length > 0) {
                body += "\n\nANECDOTARIO DE LA TEMPORADA\n";
                body += "Nuffle pareció divertirse con los problemas mundanos de los jugadores. ";
                const inc = s3Incidents[0]; // Just take one for the chronicle to keep it concise
                if (inc.description.includes('Distraído')) {
                    body += `¡Vaya despiste! El público no daba crédito cuando alguien perdió la noción de la realidad en pleno césped. `;
                } else {
                    body += `Los problemas intestinales marcaron el ritmo de algunos, dejando un rastro de duda (y algo más) en la arena. `;
                }
            }

            if (casualties.length > 0) {
                body += "\n\nHOSPITAL DE CAMPAÑA\n";
                body += `La enfermería tuvo trabajo extra. `;
                casualties.slice(0, 3).forEach(cas => {
                    body += `${transformToEpic(cas)} `;
                });
            }

            if (fouls.length > 0) {
                body += "\n\nLA POLÉMICA DEL PARTIDO\n";
                body += `¿Y qué sería de un gran partido sin su dosis de juego sucio? El colegiado ignoró las protestas cuando ${transformToEpic(fouls[0]).toLowerCase()} `;
            }

            const finalHome = events.find(e => e.type === 'match_end' && e.description.includes('Resultado Final:'))?.description.match(/\d+ - \d+/)?.[0] || `${homeScore}-${awayScore}`;

            const outro = winner 
                ? `\n\nAl dictado del cronómetro, ${winner} cantó victoria definitiva. Los ganadores ya celebran en la taberna local con rondas infinitas de Bugman's. ¡Un partido para la historia!`
                : `\n\nCon el pitido de cierre, el luminoso reflejó un inamovible empate. Ambos séquitos regresan a los vestuarios lamiéndose las heridas.`;

            const fullText = `${headlines[Math.floor(Math.random() * headlines.length)]}\n\n${intros[Math.floor(Math.random() * intros.length)]}${body}${outro}`;
            
            setChronicle(fullText);
            onChronicleGenerated?.(fullText);
            setIsGenerating(false);
        }, 1500);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-display font-black text-premium-gold uppercase tracking-wider flex items-center gap-2">
                    <BookOpenIcon className="w-6 h-6" />
                    Crónica del Narrador
                </h3>
                <button
                    onClick={generateChronicle}
                    disabled={isGenerating || events.length === 0}
                    className={`px-4 py-2 rounded-lg font-display font-black text-[10px] uppercase tracking-widest transition-all ${isGenerating
                        ? 'bg-slate-800 text-slate-500 cursor-wait'
                        : 'bg-premium-gold text-black hover:scale-105 active:scale-95 shadow-lg shadow-premium-gold/20'
                        }`}
                >
                    {isGenerating ? 'Consultando a Nuffle...' : 'Generar Crónica'}
                </button>
            </div>

            {chronicle ? (
                <div className="glass-panel p-6 border-premium-gold/20 animate-fade-in-slow relative overflow-hidden bg-black/40">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <FireIcon className="w-24 h-24" />
                    </div>
                    <p className="text-slate-300 font-serif italic text-lg leading-relaxed whitespace-pre-line relative z-10">
                        "{chronicle}"
                    </p>
                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={() => { setChronicle(null); onChronicleGenerated?.(null); }}
                            className="text-[10px] font-display font-bold text-slate-500 uppercase tracking-widest hover:text-white transition-colors"
                        >
                            Borrar Crónica
                        </button>
                    </div>
                </div>
            ) : (
                <div className="bg-black/20 rounded-2xl p-10 border border-white/5 border-dashed text-center">
                    <p className="text-slate-500 font-display text-xs uppercase tracking-widest mb-2">Esperando momentos de gloria...</p>
                    <p className="text-slate-600 text-[10px]">Los eventos clave del partido aparecerán aquí para alimentar la leyenda.</p>
                </div>
            )}

            {epicEvents.length > 0 && !chronicle && (
                <div className="space-y-3">
                    <p className="text-[10px] font-display font-bold text-slate-500 uppercase tracking-widest ml-1">Momentos Destacados</p>
                    {epicEvents.slice(0, 10).map(e => (
                        <div key={e.id} className="flex gap-4 p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors group">
                            <div className="flex-shrink-0 mt-1">
                                {e.type.toLowerCase() === 'touchdown' && <TdIcon className="w-5 h-5 text-green-400" />}
                                {e.type.toLowerCase().includes('injury') && <CasualtyIcon className="w-5 h-5 text-blood-red" />}
                                {e.type.toLowerCase() === 'turnover' && <FireIcon className="w-5 h-5 text-amber-500" />}
                                {e.description.includes('¡INCIDENCIA S3!') && (
                                    <span className="material-symbols-outlined text-premium-gold text-xl">
                                        {e.description.includes('Distraído') ? 'psychology_alt' : 'restaurant'}
                                    </span>
                                )}
                                {(e.type.toLowerCase().includes('foul') && !e.description.includes('¡INCIDENCIA S3!')) && <div className="w-5 h-5 bg-red-600 rounded blur-sm opacity-50 group-hover:opacity-100 transition-opacity" />}
                            </div>
                            <div>
                                <p className="text-[10px] font-display font-black text-slate-500 uppercase tracking-[0.2em] mb-1">
                                    Turno {e.turn} · Parte {e.half}
                                </p>
                                <p className="text-white font-display text-sm italic group-hover:text-premium-gold transition-colors">
                                    {e.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <style>{`
                 @keyframes fade-in-slow {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-slow {
                    animation: fade-in-slow 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
        </div>
    );
};

export default MatchNarrator;
