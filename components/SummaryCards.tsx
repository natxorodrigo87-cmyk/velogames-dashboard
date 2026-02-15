
import React from 'react';
import { LeagueSummary } from '../types';
import { Trophy, Activity, Zap } from 'lucide-react';

interface SummaryCardsProps {
  summary: LeagueSummary;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ summary }) => {
  return (
    <div className="flex flex-col gap-5 max-w-2xl mx-auto md:mx-0 w-full">
      
      {/* LÍDER ACTUAL */}
      <div className="relative overflow-hidden bg-[#0a0f1e] border border-white/5 rounded-[32px] p-8 md:p-10 transition-all shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.25em] mb-3">LÍDER ACTUAL</p>
            <h3 className="text-3xl md:text-4xl font-black text-white italic tracking-tighter uppercase font-heading leading-none">
              {summary.leaderName}
            </h3>
          </div>
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-[24px] bg-[#fbbf24]/10 border border-[#fbbf24]/20 flex items-center justify-center shadow-inner">
            <Trophy className="w-8 h-8 md:w-10 md:h-10 text-[#fbbf24]" />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 h-1.5 w-full bg-gradient-to-r from-[#fbbf24] to-transparent opacity-10" />
      </div>

      {/* CARRERAS FINALIZADAS */}
      <div className="relative overflow-hidden bg-[#0a0f1e] border border-white/5 rounded-[32px] p-8 md:p-10 transition-all shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.25em] mb-3">CARRERAS FINALIZADAS</p>
            <h3 className="text-5xl md:text-6xl font-black text-white italic tracking-tighter font-heading leading-none">
              {summary.completedRaces}
            </h3>
          </div>
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-[24px] bg-[#3b82f6]/10 border border-[#3b82f6]/20 flex items-center justify-center shadow-inner">
            <Activity className="w-8 h-8 md:w-10 md:h-10 text-[#3b82f6]" />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 h-1.5 w-[35%] bg-[#3b82f6] opacity-40 rounded-r-full" />
      </div>

      {/* RÉCORD EN CARRERA */}
      <div className="relative overflow-hidden bg-[#0a0f1e] border border-white/5 rounded-[32px] p-8 md:p-10 transition-all shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.25em] mb-3">RÉCORD EN CARRERA</p>
            <h3 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter font-heading leading-none">
              {summary.topScore} <span className="text-xl md:text-2xl font-black">PTS</span>
            </h3>
            <p className="text-slate-500 text-[10px] font-black mt-4 uppercase tracking-widest italic opacity-50">
              LOGRADO POR {summary.topScorePlayer}
            </p>
          </div>
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-[24px] bg-[#a855f7]/10 border border-[#a855f7]/20 flex items-center justify-center shadow-inner">
            <Zap className="w-8 h-8 md:w-10 md:h-10 text-[#a855f7]" />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 h-1.5 w-full bg-gradient-to-r from-[#a855f7]/40 to-transparent" />
      </div>

    </div>
  );
};

export default SummaryCards;
