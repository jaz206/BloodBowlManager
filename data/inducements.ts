
import { Inducement } from '../types';

export const inducements: Inducement[] = [
    {
        name: "Barriles de Bloodweiser",
        cost: 50000,
        description: "Ayudan a los jugadores a recuperarse de los Noqueos (K.O.). Suma +1 a la tirada de recuperación por cada barril (máximo 2).",
        strategy: "Excelente contra equipos que golpean fuerte si tienes una armadura baja."
    },
    {
        name: "Chef de Entrenamiento Halfling",
        cost: 300000, // 100k for halflings
        description: "Al inicio de cada parte, tira 3D6. Por cada resultado de 4+, robas una Segunda Oportunidad (Reroll) del oponente y la sumas a tu equipo.",
        strategy: "El mejor incentivo del juego si puedes permitírtelo. Destruye la gestión de recursos del rival."
    },
    {
        name: "Médico Errante (Apotecario)",
        cost: 100000,
        description: "Un segundo apotecario para usar durante el partido.",
        strategy: "Imprescindible si tus jugadores estrella están en peligro."
    },
    {
        name: "Soborno",
        cost: 100000, // 50k for bribes
        description: "Permite argumentar con el árbitro cuando un jugador es expulsado. Tira 1D6: con 2-6 el jugador vuelve al banquillo en lugar de ser expulsado.",
        strategy: "Fundamental para equipos de juego sucio (Goblins, Snotlings)."
    },
    {
        name: "Asistente de Necromante",
        cost: 100000,
        description: "Un ayudante que permite repetir una tirada de Regeneración.",
        strategy: "Solo para equipos con la regla Regeneración."
    },
    {
        name: "Fichaje de Jugador Estrella",
        cost: 80000, // starting cost for some
        description: "Contrata a un mercenario legendario para este partido.",
        strategy: "Busca un jugador que cubra las debilidades actuales de tu roster."
    }
];
