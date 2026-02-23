
export const advancementCosts = [
    { level: 'Experimentado', randomPrimary: 3, chosenPrimary: 6, chosenSecondary: 10, attribute: 14 },
    { level: 'Veterano', randomPrimary: 4, chosenPrimary: 8, chosenSecondary: 12, attribute: 16 },
    { level: 'Estrella Emergente', randomPrimary: 6, chosenPrimary: 12, chosenSecondary: 16, attribute: 20 },
    { roll: 4, level: 'Estrella', randomPrimary: 8, chosenPrimary: 16, chosenSecondary: 20, attribute: 24 },
    { roll: 5, level: 'Super Estrella', randomPrimary: 10, chosenPrimary: 20, chosenSecondary: 24, attribute: 28 },
    { roll: 6, level: 'Leyenda', randomPrimary: 15, chosenPrimary: 30, chosenSecondary: 34, attribute: 38 },
];

export const valuationIncreases = [
    { item: 'Habilidad Primaria', value: '+20.000' },
    { item: 'Habilidad Secundaria', value: '+40.000' },
    { item: 'Habilidad Elite', value: '+10.000' },
    { item: '+1 AR', value: '+10.000' },
    { item: '+1 MV', value: '+20.000' },
    { item: '+1 PA', value: '+20.000' },
    { item: '+1 AG', value: '+30.000' },
    { item: '+1 FU', value: '+60.000' },
];

export const costlyErrors = [
    { range: '100.000 - 195.000', common: '1 Incidente Menor (1)', safe: '2-6 Crisis Evitada' },
    { range: '200.000 - 295.000', common: '1-2 Incidente Menor', safe: '3-6 Crisis Evitada' },
    { range: '300.000 - 395.000', common: '1 Incidente Grave (1), 2-3 Incidente Menor', safe: '4-6 Crisis Evitada' },
    { range: '400.000 - 495.000', common: '1-2 Incidente Grave, 3-4 Incidente Menor', safe: '5-6 Crisis Evitada' },
    { range: '500.000 - 595.000', common: '1 Catástrofe (1), 2-3 Incidente Grave, 4-5 Incidente Menor', safe: '6 Crisis Evitada' },
    { range: '> 595.000', common: '1-2 Catástrofe, 3-4 Incidente Grave, 5-6 Incidente Menor', safe: 'Nunca se evita' },
];

export const errorDefinitions = {
    minor: '1D3 x 10.000 monedas perdidas.',
    grave: 'Pierdes la mitad de la tesorería.',
    catastrophe: 'Solo se salva 2D6 x 10.000 monedas.',
};
