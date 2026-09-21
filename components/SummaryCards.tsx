import React, { useState } from 'react';
import { LeagueSummary } from '../types';
import { Trophy, Activity, Zap, Timer, Calendar, ChevronRight, X, Sparkles, CheckCircle2 } from 'lucide-react';

interface SummaryCardsProps {
  summary: LeagueSummary;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ summary }) => {
  const [showChronology, setShowChronology] = useState(false);

  const topStreak = summary.longestStreakPlayer;
  const chronology = summary.chronology || [];

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        {/* LÍDER ACTUAL */}
        <div className="relative overflow-hidden bg-[#0a0f1e] border border-white/10 rounded-[28px] p-6 transition-all shadow-xl group hover:border-blue-500/30">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">
                LÍDER TEMPORADA
              </p>
              <h3 className="text-xl font-black text-white italic tracking-tighter uppercase font-heading leading-tight truncate">
                {summary.leaderName}
              </h3>
            </div>
            <div className="shrink-0 w-12 h-12 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* CARRERAS FINALIZADAS */}
        <div className="relative overflow-hidden bg-[#0a0f1e] border border-white/10 rounded-[28px] p-6 transition-all shadow-xl group hover:border-blue-500/30">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">
                FINALIZADAS
              </p>
              <h3 className="text-3xl font-black text-white italic tracking-tighter font-heading leading-none">
                {summary.completedRaces}
              </h3>
            </div>
            <div className="shrink-0 w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Activity className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>

        {/* MÁS PORRAS GANADAS */}
        <div className="relative overflow-hidden bg-[#0a0f1e] border border-white/10 rounded-[28px] p-6 transition-all shadow-xl group hover:border-blue-500/30">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">
                MÁS PORRAS GANADAS
              </p>
              <h3 className="text-xl font-black text-white italic tracking-tighter font-heading leading-tight uppercase">
                {summary.mostWinsPlayers.join(' / ')}
              </h3>
              <p className="text-[10px] font-bold text-purple-500 mt-1 uppercase tracking-wider">
                {summary.mostWinsCount} VICTORIAS
              </p>
            </div>
            <div className="shrink-0 w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <Zap className="w-6 h-6 text-purple-500" />
            </div>
          </div>
        </div>

        {/* TIEMPO DE LÍDER (TIEMPO SEGUIDO Y CARRERAS) */}
        <div className="relative overflow-hidden bg-[#0a0f1e] border border-white/10 rounded-[28px] p-5 transition-all shadow-xl group hover:border-indigo-500/40">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-0.5">
                  TIEMPO DE LÍDER
                </p>
              </div>

              {topStreak ? (
                <>
                  <div className="mt-1">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
                      Mayor Racha Continua
                    </span>
                    <h3 className="text-sm font-black text-white italic tracking-tight uppercase font-heading mt-1 truncate">
                      {topStreak.playerName}
                    </h3>
                    <p className="text-[11px] font-bold text-indigo-300">
                      {topStreak.days} días seguidos <span className="text-slate-400 text-[10px]">({topStreak.races} carreras)</span>
                    </p>
                  </div>
                </>
              ) : (
                <h3 className="text-sm font-black text-slate-400 italic">---</h3>
              )}

              {/* Listado de carreras lideradas por cada equipo */}
              <div className="mt-2.5 pt-2 border-t border-white/5 space-y-1">
                {summary.leadershipStats?.map((stat, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[10px] text-slate-400">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: stat.color }} />
                      <span className="font-bold uppercase tracking-tight truncate">{stat.playerName}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {stat.consecutiveDays > 0 && (
                        <span className="text-[9px] text-slate-500 font-medium">({stat.consecutiveDays}d seg.)</span>
                      )}
                      <span className="font-mono font-bold text-slate-300">{stat.racesAsLeader} car.</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Botón para ver la cronología completa */}
              {chronology.length > 0 && (
                <button
                  onClick={() => setShowChronology(true)}
                  className="mt-3 w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30 text-[9px] font-black uppercase tracking-wider text-indigo-300 hover:text-white transition-all duration-200"
                >
                  <Calendar className="w-3 h-3" />
                  Ver Cronología Carrera a Carrera
                  <ChevronRight className="w-3 h-3 ml-auto" />
                </button>
              )}
            </div>

            <div className="shrink-0 w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Timer className="w-5 h-5 text-indigo-500" />
            </div>
          </div>
        </div>
      </div>

      {/* MODAL CRONOLOGÍA DE LIDERATO JORNADA A JORNADA */}
      {showChronology && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative w-full max-w-2xl max-h-[85vh] bg-slate-900 border border-white/10 rounded-[28px] shadow-2xl flex flex-col overflow-hidden">
            {/* Cabecera del modal */}
            <div className="p-6 border-b border-white/10 bg-slate-950/60 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Timer className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-xl font-black text-white italic uppercase tracking-tight font-heading">
                    Evolución del Liderato 2026
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Quién encabezaba la clasificación general tras cada una de las 20 carreras oficiales.
                </p>
              </div>
              <button
                onClick={() => setShowChronology(false)}
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cuadro destacado de Team Charlotte */}
            {topStreak && (
              <div className="mx-6 mt-4 p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-indigo-950/40 to-slate-900 border border-cyan-500/30 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-cyan-400">
                    Mayor Periodo Continuado en la Cima
                  </div>
                  <div className="text-sm font-black text-white mt-0.5">
                    {topStreak.playerName}: {topStreak.days} días consecutivos como líder
                  </div>
                  <div className="text-xs text-slate-300 mt-0.5">
                    Gobernó ininterrumpidamente durante 6 carreras seguidas (Tirreno, Volta a Catalunya, Itzulia, Romandía, Giro d'Italia y Dauphiné), del 9 de marzo al 17 de junio.
                  </div>
                </div>
              </div>
            )}

            {/* Tabla con scroll de las 20 carreras */}
            <div className="p-6 overflow-y-auto flex-1">
              <div className="overflow-x-auto rounded-xl border border-white/5">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-950 text-slate-500 uppercase tracking-wider text-[10px]">
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Carrera</th>
                      <th className="py-2.5 px-3">Fecha</th>
                      <th className="py-2.5 px-3">Líder tras la carrera</th>
                      <th className="py-2.5 px-3 text-right">Puntos</th>
                      <th className="py-2.5 px-3 text-right">Ventaja</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-medium">
                    {chronology.map((c) => {
                      const isCharlotte = c.leaderName.includes('CHARLOTTE');
                      const isPostal = c.leaderName.includes('POSTAL');
                      const isGalia = c.leaderName.includes('GALIA');

                      return (
                        <tr
                          key={c.raceNumber}
                          className={`hover:bg-white/5 transition-colors ${
                            isCharlotte
                              ? 'bg-cyan-950/10'
                              : isGalia
                              ? 'bg-amber-950/10'
                              : ''
                          }`}
                        >
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-500">
                            {c.raceNumber}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-white whitespace-nowrap">
                            {c.raceName}
                          </td>
                          <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                            {c.date}
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span
                              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-black text-[10px] uppercase"
                              style={{
                                backgroundColor: `${c.leaderColor}20`,
                                color: c.leaderColor,
                                border: `1px solid ${c.leaderColor}40`
                              }}
                            >
                              <span
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: c.leaderColor }}
                              />
                              {c.leaderName}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-white text-right">
                            {c.points} pts
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            {c.isTie ? (
                              <span className="text-[9px] px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 font-bold">
                                Empate
                              </span>
                            ) : (
                              <span className="font-mono text-emerald-400 font-bold text-[11px]">
                                +{c.gapWithSecond} pt{c.gapWithSecond > 1 ? 's' : ''}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pie del modal */}
            <div className="p-4 border-t border-white/10 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Datos calculados sobre las 20 pruebas oficiales de 2026.</span>
              </div>
              <button
                onClick={() => setShowChronology(false)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SummaryCards;
