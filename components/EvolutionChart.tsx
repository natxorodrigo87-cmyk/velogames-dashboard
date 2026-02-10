
import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Player, ChartDataPoint } from '../types';
import { TrendingUp } from 'lucide-react';

interface EvolutionChartProps {
  data: ChartDataPoint[];
  players: Player[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl shadow-2xl backdrop-blur-md">
        <p className="text-slate-400 text-[10px] font-black uppercase mb-3 border-b border-slate-800 pb-2">{label}</p>
        <div className="space-y-2">
          {payload.sort((a: any, b: any) => b.value - a.value).map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-8">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-white text-xs font-bold uppercase">{entry.name}</span>
              </div>
              <span className="text-white text-sm font-black tabular-nums">{entry.value} <span className="text-[10px] text-slate-500 font-normal">pts</span></span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const EvolutionChart: React.FC<EvolutionChartProps> = ({ data, players }) => {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-md shadow-2xl h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter flex items-center gap-2">
          <TrendingUp className="text-blue-500 w-6 h-6" />
          Evolución <span className="text-slate-500 text-xs font-medium lowercase italic hidden sm:inline">(puntos acumulados)</span>
        </h2>
      </div>
      
      <div className="flex-grow min-h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.2} />
            <XAxis 
              dataKey="raceName" 
              stroke="#64748b" 
              fontSize={9} 
              tickLine={false} 
              axisLine={false}
              dy={15}
              angle={-15}
              textAnchor="end"
            />
            <YAxis 
              stroke="#64748b" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#334155', strokeWidth: 1 }} />
            {players.map(player => (
              <Line
                key={player.id}
                type="monotone"
                dataKey={player.name}
                stroke={player.color}
                strokeWidth={4}
                dot={{ r: 4, fill: player.color, strokeWidth: 0 }}
                activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                animationDuration={1500}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EvolutionChart;
