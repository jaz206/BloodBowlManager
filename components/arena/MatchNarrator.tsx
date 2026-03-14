import React, { useMemo, useState } from 'react';
import { GameEvent } from '../../types';
import BookOpenIcon from '../icons/BookOpenIcon';
import FireIcon from '../icons/FireIcon';
import TdIcon from '../icons/TdIcon';
import CasualtyIcon from '../icons/CasualtyIcon';

interface MatchNarratorProps {
    events: GameEvent[];
    homeTeamName: string;
    awayTeamName: string;
}

const MatchNarrator: React.FC<MatchNarratorProps> = ({ events, homeTeamName, awayTeamName }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [chronicle, setChronicle] = useState<string | null>(null);

    const epicEvents = useMemo(() => {
        return events.filter(e => [
            'touchdown', 'TOUCHDOWN',
            'injury', 'INJURY', 'injury_casualty', 'injury_ko',
            'turnover', 'TURNOVER',
            'foul', 'FOUL', 'foul_success'
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
                    `¡BAÑO DE SANGRE Y GLORIA! ${winner.toUpperCase()} CONQUISTA EL EMPARRILLADO ANTE ${loser.toUpperCase()}`,
                    `¡EXHIBICIÓN HISTÓRICA! ${winner.toUpperCase()} APLASTA LAS ESPERANZAS DE ${loser.toUpperCase()}`,
                    `¡LOCURA EN EL ESTADIO! ${winner.toUpperCase()} SE IMPONE EN UN DUELO DE TITANES CONTRA ${loser.toUpperCase()}`
                ]
                : [
                    `¡COMBATE NULO! SANGRE Y SUDOR PERO SIN VENCEDOR ENTRE ${homeTeamName.toUpperCase()} Y ${awayTeamName.toUpperCase()}`,
                    `¡TABLAS EN EL INFIERNO! ${homeTeamName.toUpperCase()} Y ${awayTeamName.toUpperCase()} SE REPARTEN LOS GOLPES`,
                ];

            const intros = [
                `El ambiente era eléctrico desde el silbatazo inicial. Los aficionados llenaban las gradas sabiendo que el choque entre ${homeTeamName} y ${awayTeamName} no iba a decepcionar a los paladares más exigentes de la violencia deportiva.`,
                `Nuffle sonrió hoy desde las alturas. En una tarde donde el olor a linimento y sangre fresca dominaba el aire, ${homeTeamName} y ${awayTeamName} nos regalaron un espectáculo brutal.`,
                `Si alguien dudaba de por qué este es el deporte rey del Viejo Mundo, el partido de hoy entre ${homeTeamName} y ${awayTeamName} despejó cualquier interrogante a base de placajes rompehuesos y fintas imposibles.`
            ];

            let body = "";
            
            // Group events
            const tds = events.filter(e => String(e.type).toLowerCase() === 'touchdown').reverse(); // oldest first roughly if assumed append-top
            const casualties = events.filter(e => String(e.type).toLowerCase().includes('injury_casualty'));
            const fouls = events.filter(e => String(e.type).toLowerCase().includes('foul_success') || String(e.type).toLowerCase().includes('foul'));

            if (tds.length > 0) {
                body += "\n\nLA FIESTA DE LA ANOTACIÓN\n";
                tds.forEach((td, i) => {
                    const prefix = i === 0 ? "El marcador se inauguró cuando" : (i === tds.length -1 && tds.length > 1 ? "Para poner la estocada final, presenciamos cómo" : "La locura continuó cuando");
                    let textClean = td.description.replace('!', '.').replace('¡', '');
                    body += `${prefix} ${textClean.charAt(0).toLowerCase() + textClean.slice(1)} Una jugada maestra que sin duda ocupará las portadas de Cabalvisión la próxima semana. `;
                });
            }

            if (casualties.length > 0) {
                body += "\n\nHOSPITAL DE CAMPAÑA\n";
                body += `Pero este deporte no va solo de proteger el óvalo. La enfermería tuvo trabajo extra y los boticarios sudaron la gota gorda. `;
                casualties.slice(0, 3).forEach(cas => {
                    let textClean = cas.description.replace('!', '.').replace('¡', '');
                    body += `Las gradas enmudecieron por un segundo tras ver cómo ${textClean.charAt(0).toLowerCase() + textClean.slice(1)} `;
                });
                if (casualties.length > 3) {
                    body += `¡Y eso fue solo el calentamiento! Una verdadera sangría sobre el tapete verde. `;
                }
            }

            if (fouls.length > 0) {
                body += "\n\nLA POLÉMICA DEL PARTIDO\n";
                let firstFoul = fouls[0].description.replace('!', '.').replace('¡', '');
                body += `¿Y qué sería de un gran partido sin su buena dosis de juego sucio? El colegiado, que parecía haber extraviado el silbato, ignoró las airadas protestas cuando ${firstFoul.charAt(0).toLowerCase() + firstFoul.slice(1)} `;
                if (fouls.length > 1) {
                    body += `La tensión fue en aumento, convirtiendo algunas trincheras del campo en una auténtica pelea de taberna. `;
                }
            }

            const finalHome = events.find(e => e.type === 'match_end' && e.description.includes('Resultado Final:'))?.description.match(/\d+ - \d+/)?.[0] || `${homeScore}-${awayScore}`;

            const outro = winner 
                ? `\n\nAl dictado del cronómetro, ${winner} cantó victoria definitiva en la Arena. El cuerpo técnico perdedor tendrá que dar muchas explicaciones a la directiva esta misma noche, mientras que los ganadores ya celebran en la taberna local con rondas infinitas de Bugman's XXXXXX. ¡Un partido para los anales de la historia!`
                : `\n\nCon el pitido de cierre, el luminoso reflejó el inamovible empate. Ambos séquitos regresan a los vestuarios lamiéndose las heridas, sabiendo que en el próximo cruce, los Dioses del Caos exigirán un vencedor absoluto.`;

            const fullText = `${headlines[Math.floor(Math.random() * headlines.length)]}\n\n${intros[Math.floor(Math.random() * intros.length)]}${body}${outro}`;
            
            setChronicle(fullText);
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
                            onClick={() => setChronicle(null)}
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
                                {e.type.toLowerCase().includes('foul') && <div className="w-5 h-5 bg-red-600 rounded blur-sm opacity-50 group-hover:opacity-100 transition-opacity" />}
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
