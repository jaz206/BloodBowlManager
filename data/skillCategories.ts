
export interface SkillCategory {
    category: string;
    skills: {
        roll: string;
        name: string;
    }[];
}

export const skillCategories: SkillCategory[] = [
    {
        category: 'Agilidad',
        skills: [
            { roll: '11', name: 'Atrapar' },
            { roll: '12', name: 'Echarse a un lado' },
            { roll: '13', name: 'En pie de un salto' },
            { roll: '14', name: 'Esprintar' },
            { roll: '15', name: 'Esquivar' },
            { roll: '16', name: 'Golpe a la carrera' },
            { roll: '21', name: 'Pies firmes' },
            { roll: '22', name: 'Placaje heroico' },
            { roll: '23', name: 'Proteger el cuero' },
            { roll: '24', name: 'Recepción heroica' },
            { roll: '25', name: 'Romper defensas' },
            { roll: '26', name: 'Saltar' }
        ]
    },
    {
        category: 'General',
        skills: [
            { roll: '11', name: 'Agallas' },
            { roll: '12', name: 'Equilibrio firme' },
            { roll: '13', name: 'Forcejear' },
            { roll: '14', name: 'Furia' },
            { roll: '15', name: 'Manos seguras' },
            { roll: '16', name: 'Patada' },
            { roll: '21', name: 'Placaje defensivo' },
            { roll: '22', name: 'Placar' },
            { roll: '23', name: 'Profesional' },
            { roll: '24', name: 'Provocar' },
            { roll: '25', name: 'Robar balón' },
            { roll: '26', name: 'Safarse' }
        ]
    },
    {
        category: 'Mutación',
        skills: [
            { roll: '11', name: 'Apariencia asq.' },
            { roll: '12', name: 'Boca monstruosa' },
            { roll: '13', name: 'Brazos adicionales' },
            { roll: '14', name: 'Cola prensil' },
            { roll: '15', name: 'Cuernos' },
            { roll: '16', name: 'Dos cabezas' },
            { roll: '21', name: 'Garras' },
            { roll: '22', name: 'Mano grande' },
            { roll: '23', name: 'Piel férrea' },
            { roll: '24', name: 'Piernas largas' },
            { roll: '25', name: 'Presencia pert.' },
            { roll: '26', name: 'Tentáculos' }
        ]
    },
    {
        category: 'Pase',
        skills: [
            { roll: '11', name: 'Atento al balón' },
            { roll: '12', name: 'Cañonero' },
            { roll: '13', name: 'Líder' },
            { roll: '14', name: 'Nervios de acero' },
            { roll: '15', name: 'Partenuves' },
            { roll: '16', name: 'Pasar' },
            { roll: '21', name: 'Pasar y seguir' },
            { roll: '22', name: 'Pase a lo loco' },
            { roll: '23', name: 'Pase precipitado' },
            { roll: '24', name: 'Pase seguro' },
            { roll: '25', name: 'Patada de despeje' },
            { roll: '26', name: 'Precisión' }
        ]
    },
    {
        category: 'Fuerza',
        skills: [
            { roll: '11', name: 'Abrirse paso' },
            { roll: '12', name: 'Apartar' },
            { roll: '13', name: 'Brazo fuerte' },
            { roll: '14', name: 'Cabeza dura' },
            { roll: '15', name: 'Defensa' },
            { roll: '16', name: 'Golpe mortífero' },
            { roll: '21', name: 'Imparable' },
            { roll: '22', name: 'Llave de brazo' },
            { roll: '23', name: 'Luchador' },
            { roll: '24', name: 'Mantenerse firme' },
            { roll: '25', name: 'Ojo de halcón' },
            { roll: '26', name: 'Placaje múltiple' }
        ]
    },
    {
        category: 'Triquiñuelas',
        skills: [
            { roll: '11', name: 'Agresor discreto' },
            { roll: '12', name: 'Crujir' },
            { roll: '13', name: 'Dejada' },
            { roll: '14', name: 'Falta rápida' },
            { roll: '15', name: 'Furtivo' },
            { roll: '16', name: 'Innovador violento' },
            { roll: '21', name: 'Jugar sucio' },
            { roll: '22', name: 'Meter la bota' },
            { roll: '23', name: 'Perseguir' },
            { roll: '24', name: 'Piquete de ojos' },
            { roll: '25', name: 'Saboteador' },
            { roll: '26', name: 'Vuelo letal' }
        ]
    }
];
