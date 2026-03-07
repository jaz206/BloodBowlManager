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
            const intros = [
                `¡Por las barbas de Nuffle! El encuentro entre ${homeTeamName} y ${awayTeamName} ha sido una carnicería digna de las sagas más sangrientas.`,
                `Los vientos del destino soplaron con fuerza sobre el emparrillado mientras ${homeTeamName} se veía las caras con ${awayTeamName}.`,
                `Bajo la mirada atenta de los dioses del Caos, ${homeTeamName} y ${awayTeamName} se entregaron a un festival de violencia y gloria.`
            ];

            const outro = events.length > 20
                ? "Un partido que será recordado por las generaciones venideras como el epítome del Blood Bowl."
                : "Un encuentro breve pero que deja claro que en este deporte, la sangre siempre paga el precio de la victoria.";

            let body = "";
            const highlights = epicEvents.slice(0, 5); // Take top 5 highlights

            highlights.forEach(e => {
                const type = e.type.toLowerCase();
                if (type === 'touchdown') body += `\n- El estadio rugió cuando ${e.description}. ¡Una jugada bendecida por el mismísimo Nuffle!`;
                else if (type.includes('injury')) body += `\n- Crujido de huesos y gritos de agonía: ${e.description}. La medicina será cara esta noche.`;
                else if (type === 'turnover') body += `\n- ¡El caos se desató! ${e.description}. Un error que costó caro en el momento más crítico.`;
                else if (type.includes('foul')) body += `\n- ¡Juego sucio! El árbitro miró a otro lado mientras ${e.description}.`;
            });

            const fullText = `${intros[Math.floor(Math.random() * intros.length)]}\n\n${body}\n\n${outro}`;
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
