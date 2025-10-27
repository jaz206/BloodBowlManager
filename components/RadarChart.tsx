import React from 'react';

interface RadarChartProps {
  ratings: {
    data: Record<string, number>;
    color: string;
    name?: string;
  }[];
  size?: number; // Añadimos la propiedad size
  showValues?: boolean; // Y la propiedad para mostrar valores
}

const RadarChart: React.FC<RadarChartProps> = ({ ratings, size = 200, showValues = false }) => {
  const center = size / 2;
  const labels = ['Velocidad', 'Fuerza', 'Pase', 'Armadura', 'Agilidad'];
  const numAxes = labels.length;
  const angleSlice = (Math.PI * 2) / numAxes;
  const levels = 5; 
  const maxRadius = center * 0.75;

  const getPoint = (value: number, index: number, radiusMultiplier: number = 1) => {
    const angle = angleSlice * index - Math.PI / 2;
    const radius = (value / 100) * maxRadius * radiusMultiplier;
    return {
        x: center + radius * Math.cos(angle),
        y: center + radius * Math.sin(angle),
    };
  };

  const getPointString = (value: number, index: number, radiusMultiplier: number = 1) => {
    const point = getPoint(value, index, radiusMultiplier);
    return `${point.x},${point.y}`;
  };

  const dataKeys = ['velocidad', 'fuerza', 'pase', 'armadura', 'agilidad'];
  
  return (
    <div className="relative aspect-square">
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full">
            <g className="grid">
            {[...Array(levels)].map((_, i) => (
                <polygon
                key={`grid-${i}`}
                points={[...Array(numAxes)].map((_, j) => getPointString(100, j, (i + 1) / levels)).join(' ')}
                fill={i % 2 === 0 ? "#1e293b" : "#334155"}
                stroke="#475569"
                strokeWidth="0.5"
                />
            ))}
            </g>
            <g className="axes">
            {[...Array(numAxes)].map((_, i) => (
                <line
                key={`axis-${i}`}
                x1={center}
                y1={center}
                x2={getPoint(100, i).x}
                y2={getPoint(100, i).y}
                stroke="#475569"
                strokeWidth="1"
                />
            ))}
            </g>
            <g className="labels">
            {labels.map((label, i) => {
                const labelOffset = showValues ? 125 : 118;
                const fontSize = showValues ? '12px' : '8px';
                const { x, y } = getPoint(labelOffset, i); // Aumentamos la distancia para que no se solape
                return (
                <text
                    key={`label-${i}`}
                    x={x}
                    y={y}
                    dy="0.35em"
                    textAnchor="middle"
                    className="fill-slate-400 font-semibold"
                    style={{ fontSize }}
                >
                    {label}
                </text>
                );
            })}
            </g>
             {showValues && (
              <g className="values">
                {ratings.length > 0 && dataKeys.map((key, i) => {
                  const { x, y } = getPoint(105, i);
                  return (
                    <text
                      key={`value-${i}`}
                      x={x}
                      y={y}
                      dy="0.35em"
                      textAnchor="middle"
                      className="text-[10px] fill-amber-300 font-bold"
                    >
                      {ratings[0].data[key.toLowerCase()] || 0}
                    </text>
                  );
                })}
              </g>
            )}
            <g className="data">
            {ratings.map((teamRating, idx) => {
                const points = dataKeys.map((key, i) => getPointString(teamRating.data[key.toLowerCase()] || 0, i)).join(' ');
                return (
                <polygon
                    key={`data-${idx}`}
                    points={points}
                    fill={teamRating.color}
                    fillOpacity="0.5"
                    stroke={teamRating.color}
                    strokeWidth="2"
                />
                );
            })}
            </g>
        </svg>
    </div>
  );
};

export default RadarChart;
