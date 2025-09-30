
export type PassType = 'Jugador que pasa' | 'Pase rápido' | 'Pase corto' | 'Pase largo' | 'Bomba larga';

interface PassInfo {
  name: PassType;
  color: string;
  hoverColor: string;
}

export const passTypeDetails: Record<string, PassInfo> = {
  P: { name: 'Jugador que pasa', color: 'bg-black', hoverColor: 'hover:bg-gray-800' },
  G: { name: 'Pase rápido', color: 'bg-green-600', hoverColor: 'hover:bg-green-500' },
  Y: { name: 'Pase corto', color: 'bg-yellow-500', hoverColor: 'hover:bg-yellow-400' },
  O: { name: 'Pase largo', color: 'bg-orange-600', hoverColor: 'hover:bg-orange-500' },
  B: { name: 'Bomba larga', color: 'bg-red-800', hoverColor: 'hover:bg-red-700' },
};

// G: Green, Y: Yellow, O: Orange, B: Brown/Red
export const passChartGrid: string[][] = [
//  x:0    1    2    3    4    5    6    7    8    9   10   11   12   13
  ['G', 'G', 'G', 'G', 'Y', 'Y', 'Y', 'O', 'O', 'O', 'B', 'B', 'B', 'B'], // y=0
  ['G', 'G', 'G', 'G', 'Y', 'Y', 'Y', 'O', 'O', 'O', 'B', 'B', 'B', 'B'], // y=1
  ['G', 'G', 'G', 'Y', 'Y', 'Y', 'O', 'O', 'O', 'B', 'B', 'B', 'B', 'B'], // y=2
  ['G', 'G', 'Y', 'Y', 'Y', 'Y', 'O', 'O', 'O', 'B', 'B', 'B', 'B', 'B'], // y=3
  ['Y', 'Y', 'Y', 'Y', 'Y', 'O', 'O', 'O', 'B', 'B', 'B', 'B', 'B', 'B'], // y=4
  ['Y', 'Y', 'Y', 'Y', 'O', 'O', 'O', 'O', 'B', 'B', 'B', 'B', 'B', 'B'], // y=5
  ['Y', 'Y', 'Y', 'O', 'O', 'O', 'O', 'B', 'B', 'B', 'B', 'B', 'B', 'B'], // y=6
  ['O', 'O', 'O', 'O', 'O', 'O', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B'], // y=7
  ['O', 'O', 'O', 'O', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B'], // y=8
  ['O', 'O', 'O', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B'], // y=9
  ['B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B'], // y=10
  ['B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B'], // y=11
  ['B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B'], // y=12
  ['B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B']  // y=13
];