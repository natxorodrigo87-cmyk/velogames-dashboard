import React, { useState, useMemo } from 'react';
import Layout from './components/Layout';
import GeneralTable from './components/GeneralTable';
import EvolutionChart from './components/EvolutionChart';
import RaceDetails from './components/RaceDetails';
import Filters from './components/Filters';
import SummaryCards from './components/SummaryCards';
import MortadelaTable from './components/MortadelaTable';
import AbandonosTable from './components/AbandonosTable';
import CyclingAI from './components/CyclingAI';
import { PLAYERS, RACES, MOCK_RESULTS as RESULTS, CATEGORIES, MORTADELAS, WITHDRAWALS } from './mockData';
import { GlobalStats, ChartDataPoint, RaceStatus, LeagueSummary } from './types';
import { LayoutDashboard, Flame, BrainCircuit, ChevronRight, Zap } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'records' | 'ai'>('general');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const stats = useMemo<GlobalStats[]>(() => {
    return PLAYERS.map(player => {
      const playerResults = RESULTS.filter(r => r.playerId === player.id);
      const totalPoints = playerResults.reduce((acc, curr) => acc + curr.points, 0);
      
      let racesWon = 0;
      RACES.filter(r => r.status === RaceStatus.PLAYED).forEach(race => {
        const raceResults = RESULTS.filter(res => res.raceId === race.id);
        const maxPoints = Math.max(...raceResults.map(r => r.points));
        const playerResult = raceResults.find(r => r.playerId === player.id);
        if (playerResult && playerResult.points === maxPoints && playerResult.points > 0) {
          racesWon++;
        }
      });

      return {
        playerId: player.id,
        totalPoints,
        racesWon,
        averagePoints: playerResults.length > 0 ? totalPoints / playerResults.length : 0
      };
    });
  }, []);

  const summary = useMemo<LeagueSummary>(() => {
    const sortedByPoints = [...stats].sort((a, b) => b.totalPoints - a.totalPoints);
    const leader = PLAYERS.find(p => p.id === sortedByPoints[0]?.playerId);
    
    const maxWins = Math.max(...stats.map(s => s.racesWon));
    const mostWinsPlayers = stats
      .filter(s => s.racesWon === maxWins && maxWins > 0)
      .map(s => PLAYERS.find(p => p.id === s.playerId)?.name || '---');

    return {
      leaderName: leader?.name || '---',
      leaderColor: leader?.color || '#fff',
      totalRaces: RACES.length,
      completedRaces: RACES.filter(r => r.status === RaceStatus.PLAYED).length,
      mostWinsPlayers: mostWinsPlayers.length > 0 ? mostWinsPlayers : ['---'],
      mostWinsCount: maxWins
    };
  }, [stats]);

  const chartData = useMemo<ChartDataPoint[]>(() => {
    const playedRaces = [...RACES]
      .filter(r => r.status === RaceStatus.PLAYED)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const data: ChartDataPoint[] = [];
    const cumulativePoints: Record<string, number> = {};
    PLAYERS.forEach(p => cumulativePoints[p.id] = 0);

    playedRaces.forEach(race => {
      const point: ChartDataPoint = {
        raceName: race.name,
        date: race.date
      };

      PLAYERS.forEach(player => {
        const result = RESULTS.find(r => r.raceId === race.id && r.playerId === player.id);
        cumulativePoints[player.id] += result ? result.points : 0;
        point[player.name] = cumulativePoints[player.id];
      });

      data.push(point);
    });

    return data;
  }, []);

  const filteredRaces = useMemo(() => {
    let list = [...RACES].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    if (selectedCategoryId) {
      list = list.filter(r => r.categoryId === selectedCategoryId);
    }
    return list;
  }, [selectedCategoryId]);

  return (
    <Layout>
      <SummaryCards summary={summary} />

      {/* NAVEGACIÓN SUPERIOR */}
      <nav className="relative flex flex-col gap-3 mt-4">
        {/* PESTAÑAS PRINCIPALES */}
        <div className="flex gap-2 bg-slate-900/60 p-1.5 rounded-[24px] border border-white/10 backdrop-blur-xl shadow-2xl">
          <button
            onClick={() => setActiveTab('general')}
            className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[18px] text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
              activeTab === 'general' 
                ? 'bg-blue-600 text-white shadow-[0_10px_30px_rgba(37,99,235,0.3)]' 
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Clasificación
          </button>
          
          <button
            onClick={() => setActiveTab('records')}
            className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[18px] text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
              activeTab === 'records' 
                ? 'bg-amber-500 text-white shadow-[0_10px_30px_rgba(245,158,11,0.3)]' 
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
            }`}
          >
            <Flame className="w-4 h-4" />
            Records
          </button>
        </div>

        {/* BOTÓN ENTRENADOR VIRTUAL DESTACADO */}
        <button
          onClick={() => setActiveTab('ai')}
          className={`group relative overflow-hidden flex items-center justify-between gap-4 p-5 rounded-[26px] transition-all duration-500 border ${
            activeTab === 'ai' 
              ? 'bg-gradient-to-r from-purple-600 to-blue-600 border-purple-400 text-white shadow-[0_20px_50px_rgba(168,85,247,0.3)] scale-[1.01]' 
              : 'bg-gradient-to-r from-purple-900/50 to-slate-900 border-purple-500/20 text-slate-300 hover:border-purple-500/50 hover:shadow-xl'
          }`}
        >
          <div className="flex items-center gap-5">
            <div className={`w-12 h-12 rounded-[18px] flex items-center justify-center transition-all duration-500 shadow-lg ${activeTab === 'ai' ? 'bg-white/20 scale-110' : 'bg-purple-600 group-hover:scale-110'}`}>
              <BrainCircuit className="w-7 h-7 text-white" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2 mb-0.5">
                <span className={`text-[9px] font-black uppercase tracking-[0.3em] ${activeTab === 'ai' ? 'text-purple-200' : 'text-purple-400'}`}>SISTEMA AI ACTIVO</span>
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
              </div>
              <h3 className="text-base font-black italic uppercase tracking-tight">Soy tu entrenador virtual</h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-black uppercase tracking-widest hidden sm:block ${activeTab === 'ai' ? 'text-white' : 'text-slate-500'}`}>Consultar</span>
            <ChevronRight className={`w-5 h-5 transition-transform duration-500 group-hover:translate-x-1.5 ${activeTab === 'ai' ? 'text-white' : 'text-purple-500'}`} />
          </div>
          
          {/* Efecto de barrido de luz */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] transition-transform duration-1000"></div>
        </button>
      </nav>

      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>

      {/* CONTENIDO SEGÚN PESTAÑA */}
      <div className="mt-8">
        {activeTab === 'general' ? (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-12">
            <GeneralTable players={PLAYERS} stats={stats} />
            <div className="h-[450px]">
              <EvolutionChart data={chartData} players={PLAYERS} />
            </div>
            
            <div className="pt-16">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
                <div className="text-center md:text-left">
                  <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter font-heading leading-none">
                    Resultados <span className="text-blue-500 block sm:inline">de Etapa</span>
                  </h2>
                  <div className="h-1 w-20 bg-blue-600 mt-2 mx-auto md:mx-0"></div>
                </div>
                <Filters 
                  categories={CATEGORIES} 
                  selectedCategoryId={selectedCategoryId} 
                  onSelectCategory={setSelectedCategoryId} 
                />
              </div>
              <RaceDetails 
                races={filteredRaces} 
                results={RESULTS} 
                players={PLAYERS} 
                categories={CATEGORIES}
              />
            </div>
          </div>
        ) : activeTab === 'records' ? (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-12">
            <MortadelaTable entries={MORTADELAS} players={PLAYERS} />
            <AbandonosTable records={WITHDRAWALS} players={PLAYERS} />
          </div>
        ) : (
          <CyclingAI />
        )}
      </div>
    </Layout>
  );
};

export default App;