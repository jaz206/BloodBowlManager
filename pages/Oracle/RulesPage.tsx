import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const KICKOFF_EVENTS = [
    { roll: '2', name: 'Árbitro Intimidado', desc: 'Cada equipo recibe un Soborno gratuito que debe usarse antes del final del partido.' },
    { roll: '3', name: 'Tiempo Muerto', desc: 'Si el equipo pateador está en su turno 6, 7 u 8, ambos equipos retroceden una casilla en el marcador de turnos; en caso contrario, ambos avanzan una casilla.' },
    { roll: '4', name: 'Defensa Sólida', desc: 'El entrenador pateador puede retirar y volver a desplegar 1D3+3 jugadores desmarcados siguiendo las reglas normales.' },
    { roll: '5', name: 'Patada Alta', desc: 'Un jugador desmarcado del equipo receptor puede colocarse en la casilla donde caerá el balón.' },
    { roll: '6', name: 'Los Hinchas Animan', desc: 'Se realiza una tirada enfrentada (1D6 + Animadoras). El ganador recibe un apoyo ofensivo adicional en su siguiente placaje.' },
    { roll: '7', name: 'Entrenador Brillante', desc: 'Tirada enfrentada (1D6 + Ayudantes). El ganador recibe una Segunda Oportunidad gratuita válida solo para esa entrada.' },
    { roll: '8', name: 'Clima Cambiante', desc: 'Se vuelve a tirar en la tabla de clima. Si sale Clima Agradable, el balón rebota una vez antes de caer.' },
    { roll: '9', name: '¡Corre, Muchacho, Corre!', desc: 'Cualquier jugador que no esté en una zona de defensa rival puede moverse una casilla inmediatamente.' },
    { roll: '10', name: '¡A la Carga!', desc: 'El equipo pateador puede realizar un turno adicional inmediato, pero solo con D3+3 jugadores.' },
    { roll: '11', name: 'Disturbios', desc: 'Tira 1D6. Con un 1-3, ambos marcadores de turno retroceden una casilla. Con 4-6, ambos avanzan.' },
    { roll: '12', name: 'Invasión de Campo', desc: 'Ambos entrenadores tiran 1D6 + Factor de Hinchas. El que saque menos ve cómo sus jugadores quedan aturdidos por la afición rival.' }
];

const WEATHER_TABLE = [
    { roll: '2', name: 'Calor Asfixiante', desc: 'Al final de cada entrada, tira 1D6 por cada jugador en el campo. Con un 1, el jugador se desmaya y debe ir al banquillo de Reservas.' },
    { roll: '3', name: 'Soleado', desc: 'El sol brilla con fuerza. Todas las tiradas de Pase tienen un penalizador de -1 por deslumbramiento.' },
    { roll: '4-10', name: 'Clima Agradable', desc: 'Condiciones perfectas para jugar al Blood Bowl.' },
    { roll: '11', name: 'Lluvia', desc: 'El balón se vuelve resbaladizo. Todas las tiradas para Recoger el balón tienen un penalizador de -1.' },
    { roll: '12', name: 'Ventisca', desc: 'La visibilidad es mala. Solo se pueden realizar Pases Rápidos o Cortos, y las tiradas de A por ellos fallan con un 1-2.' }
];

const PRE_MATCH_STEPS = [
    {
        step: 1,
        title: 'Determinar factor de hinchas',
        desc: 'Cada entrenador tira 1D3 y suma los aficionados ocasionales de su hoja de plantilla.',
        effect: 'Crucial para Invasión de Campo y ganancias finales.'
    },
    {
        step: 2,
        title: 'Determinar el clima',
        desc: 'Ambos entrenadores tiran 2D6 y consultan la tabla de clima.',
        effect: 'Afecta al movimiento, los pases y el manejo del balón.'
    },
    {
        step: 3,
        title: 'Conseguir incentivos',
        desc: 'El equipo con menos valor de plantilla recibe presupuesto igual a la diferencia.',
        effect: 'Úsalo en Jugadores Estrella, Sobornos, Médicos y más.'
    },
    {
        step: 4,
        title: 'Rezos a Nuffle',
        desc: 'Si tras los incentivos sigue habiendo diferencia, el equipo inferior tira en la tabla de Rezos.',
        effect: 'Efectos aleatorios beneficiosos para el underdog.'
    },
    {
        step: 5,
        title: 'Lanzamiento de moneda',
        desc: 'Tirada enfrentada de 1D6. El ganador elige patear o recibir.',
        effect: 'Define la estrategia de la primera parte.'
    }
];

const POST_MATCH_STEPS = [
    {
        title: 'Determinar MVP',
        icon: 'military_tech',
        desc: 'Elige un jugador, o tira aleatoriamente, para que reciba 4 PE adicionales.'
    },
    {
        title: 'Errores costosos',
        icon: 'money_off',
        desc: 'Si tienes más de 100k en el banco, corres riesgo de perder parte de la tesorería.'
    },
    {
        title: 'Actualizar hinchas',
        icon: 'trending_up',
        desc: 'Tira 2D6 + factores. Si superas tu Hinchada actual, ganas +1. Si fallas por mucho, pierdes popularidad.'
    }
];


const RulesPage: React.FC = () => {
    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="blood-ui-light-card rounded-[2.5rem] p-8 md:p-10 shadow-[0_24px_60px_rgba(75,52,27,0.14)]">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 rounded-full border border-[rgba(111,87,56,0.18)] bg-[rgba(255,251,241,0.72)] text-[10px] font-black uppercase tracking-[0.25em] text-[#6b553b] italic">Manual vivo</span>
                        <span className="px-3 py-1 rounded-full border border-[rgba(111,87,56,0.18)] bg-[rgba(255,251,241,0.72)] text-[10px] font-black uppercase tracking-[0.25em] text-[#6b553b] italic">BB2025</span>
                        <span className="px-3 py-1 rounded-full border border-[rgba(111,87,56,0.18)] bg-[rgba(255,251,241,0.72)] text-[10px] font-black uppercase tracking-[0.25em] text-[#6b553b] italic">Mesa de juego</span>
                    </div>
                    <h2 className="blood-ui-light-title text-4xl md:text-6xl font-black italic uppercase tracking-tighter">
                        Manual de <span className="text-[#ca8a04]">Campo</span>
                    </h2>
                    <p className="blood-ui-light-body text-sm md:text-base max-w-3xl leading-relaxed">
                        Reglas oficiales de la Tercera Temporada. Todo lo que necesitas saber antes, durante y despu?s del caos en el emparrillado.
                    </p>
                </div>
            </header>

            <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {sections.map((section) => (
                    <div
                        key={section.id}
                        className="blood-ui-light-card rounded-[1.8rem] p-5 border border-[rgba(111,87,56,0.12)] shadow-[0_12px_30px_rgba(75,52,27,0.10)]"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <span className="material-symbols-outlined text-[#ca8a04] text-lg">{section.icon}</span>
                            <h3 className="blood-ui-light-title text-lg uppercase italic tracking-tighter">{section.label}</h3>
                        </div>
                        <p className="blood-ui-light-body text-sm leading-relaxed">
                            {section.id === 'pre' && 'Incentivos, clima, hinchas, moneda y orden de preparaci?n.'}
                            {section.id === 'kick' && 'Patada inicial, eventos aleatorios y cambios de ritmo del drive.'}
                            {section.id === 'weather' && 'Tabla completa del clima y sus efectos en mesa.'}
                            {section.id === 'post' && 'Cierre de partido, econom?a y seguimiento final.'}
                        </p>
                    </div>
                ))}
            </section>

            <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
                {PRE_MATCH_STEPS.map((item) => (
                    <article
                        key={item.step}
                        className="blood-ui-light-card rounded-[2rem] p-6 md:p-8 shadow-[0_18px_45px_rgba(92,68,39,0.12)] hover:border-[rgba(202,138,4,0.22)] transition-all"
                    >
                        <span className="text-[#ca8a04] font-black text-[10px] uppercase tracking-widest mb-3 block italic opacity-80">
                            Paso {item.step}
                        </span>
                        <h3 className="blood-ui-light-title text-2xl uppercase italic tracking-tighter mb-3">
                            {item.title}
                        </h3>
                        <p className="blood-ui-light-body text-sm leading-relaxed italic mb-4">
                            {item.desc}
                        </p>
                        <div className="p-4 rounded-2xl border border-[rgba(111,87,56,0.12)] bg-[rgba(255,251,241,0.68)]">
                            <p className="text-[10px] text-[#ca8a04] font-black uppercase tracking-widest leading-tight">
                                {item.effect}
                            </p>
                        </div>
                    </article>
                ))}
            </motion.section>

            <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="blood-ui-light-card rounded-[2rem] overflow-hidden shadow-[0_18px_45px_rgba(92,68,39,0.12)]"
            >
                <div className="px-6 md:px-8 pt-6 md:pt-8">
                    <p className="text-[10px] uppercase tracking-[0.25em] font-black text-[#7b6853] italic mb-2">Patada inicial</p>
                    <h3 className="blood-ui-light-title text-3xl uppercase italic tracking-tighter">Secuencia de kickoff</h3>
                    <p className="blood-ui-light-body text-sm mt-3 max-w-3xl">
                        Tras la patada, cada evento modifica el ritmo del drive y puede cambiar el estado del partido de forma inmediata.
                    </p>
                </div>
                <div className="overflow-x-auto mt-6">
                    <table className="w-full text-left min-w-[760px]">
                        <thead className="bg-[rgba(255,251,241,0.55)] text-[#7b6853] text-[10px] uppercase tracking-[0.28em]">
                            <tr>
                                <th className="py-5 px-8 font-black w-24">2D6</th>
                                <th className="py-5 px-8 font-black">Evento</th>
                                <th className="py-5 px-8 font-black">Efecto del caos</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[rgba(111,87,56,0.08)]">
                            {KICKOFF_EVENTS.map((event) => (
                                <tr key={event.roll} className="hover:bg-[rgba(202,138,4,0.04)] transition-colors group">
                                    <td className="py-5 px-8">
                                        <div className="w-11 h-11 rounded-2xl bg-[rgba(202,138,4,0.12)] border border-[rgba(202,138,4,0.18)] flex items-center justify-center text-[#ca8a04] font-black text-lg shadow-inner group-hover:bg-[#ca8a04] group-hover:text-[#2b1d12] transition-all">
                                            {event.roll}
                                        </div>
                                    </td>
                                    <td className="py-5 px-8">
                                        <h4 className="blood-ui-light-title text-base uppercase italic tracking-tight">{event.name}</h4>
                                    </td>
                                    <td className="py-5 px-8">
                                        <p className="blood-ui-light-body text-sm italic leading-relaxed">{event.desc}</p>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.section>

            <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
                {WEATHER_TABLE.map((weather) => (
                    <article
                        key={weather.roll}
                        className="blood-ui-light-card rounded-[2rem] p-6 md:p-7 flex gap-5 shadow-[0_18px_45px_rgba(92,68,39,0.12)] hover:border-[rgba(202,138,4,0.22)] transition-all"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-[rgba(202,138,4,0.12)] border border-[rgba(202,138,4,0.16)] flex flex-col items-center justify-center shrink-0 shadow-inner">
                            <span className="text-[10px] text-[#7b5530] font-black uppercase tracking-widest">{weather.roll === '4-10' ? 'ROLL' : '2D6'}</span>
                            <span className="text-2xl font-black text-[#2b1d12] italic">{weather.roll}</span>
                        </div>
                        <div>
                            <h3 className="blood-ui-light-title text-xl uppercase italic tracking-tight mb-1">{weather.name}</h3>
                            <p className="blood-ui-light-body text-sm italic leading-relaxed">{weather.desc}</p>
                        </div>
                    </article>
                ))}
            </motion.section>

            <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
            >
                <div className="blood-ui-light-card rounded-[2rem] p-6 md:p-8 shadow-[0_18px_45px_rgba(92,68,39,0.12)]">
                    <h3 className="text-[#ca8a04] font-black uppercase italic tracking-widest text-lg mb-4 flex items-center gap-3">
                        <span className="material-symbols-outlined">payments</span>
                        Gesti?n econ?mica
                    </h3>
                    <div className="rounded-2xl border border-[rgba(111,87,56,0.12)] bg-[rgba(255,251,241,0.72)] p-6">
                        <p className="blood-ui-light-body text-sm mb-4 font-medium italic">Calcula tus ganancias tras el pitido final:</p>
                        <div className="text-3xl md:text-4xl font-black text-[#2b1d12] tracking-tighter italic mb-4">
                            (Afluencia / 2) + TDs + 1*
                        </div>
                        <p className="text-[9px] text-[#7b6853] uppercase font-bold tracking-widest">
                            *Bono si no retuviste el bal?n. Multiplica el total por 10,000 monedas de oro.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {POST_MATCH_STEPS.map((card) => (
                        <article
                            key={card.title}
                            className="blood-ui-light-card rounded-[1.8rem] p-6 flex flex-col items-center text-center shadow-[0_18px_45px_rgba(92,68,39,0.12)] hover:border-[rgba(202,138,4,0.22)] transition-all"
                        >
                            <div className="size-14 rounded-2xl bg-[rgba(202,138,4,0.12)] border border-[rgba(202,138,4,0.16)] flex items-center justify-center text-[#ca8a04] mb-4">
                                <span className="material-symbols-outlined text-3xl">{card.icon}</span>
                            </div>
                            <h4 className="blood-ui-light-title text-xs mb-3 tracking-widest uppercase italic">{card.title}</h4>
                            <p className="blood-ui-light-body text-[10px] font-medium leading-relaxed italic">{card.desc}</p>
                        </article>
                    ))}
                </div>
            </motion.section>
        </div>
    );
};

export default RulesPage;
