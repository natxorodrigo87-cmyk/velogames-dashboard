
import React from 'react';
import { LeagueSummary } from '../types';
import { Trophy, Activity, Zap } from 'lucide-react';

interface SummaryCardsProps {
  summary: LeagueSummary;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ summary }) => {
  const cards = [
    {
      title: 'Líder Actual',
      value: summary.leaderName,
      icon: Trophy,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/20',
      accentColor: summary.leaderColor
    },
    {
      title: 'Carreras Finalizadas',
      value: `${summary.completedRaces}`,
      icon: Activity,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
      accentColor: '#3b82f6'
    },
    {
      title: 'Récord en Carrera',
      value: `${summary.topScore} pts`,
      subValue: `Logrado por ${summary.topScorePlayer}`,
      icon: Zap,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
      accentColor: '#a855f7'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
      {cards.map((card, i) => (
        <div 
          key={i} 
          className="relative overflow-hidden bg-slate-900/40 border border-white/5 rounded-3xl p-6 backdrop-blur-xl group hover:border-white/10 transition-all duration-500"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">{card.title}</p>
              <h3 className="text-2xl font-black text-white italic tracking-tight leading-none uppercase">
                {card.value}
              </h3>
              {card.subValue && (
                <p className="text-slate-400 text-[9px] font-bold mt-2 uppercase opacity-60 italic">{card.subValue}</p>
              )}
            </div>
            <div className={`p-3 rounded-2xl ${card.bgColor} ${card.borderColor} border transition-transform duration-500 group-hover:scale-110`}>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
          </div>
          
          <div 
            className="absolute bottom-0 left-0 h-1 transition-all duration-700 group-hover:w-full opacity-50" 
            style={{ backgroundColor: card.accentColor, width: i === 0 ? '100%' : '20%' }}
          />
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;
