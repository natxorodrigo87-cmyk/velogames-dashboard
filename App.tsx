
import React, { useState, useMemo } from 'react';
import Layout from './components/Layout.tsx';
import GeneralTable from './components/GeneralTable.tsx';
import EvolutionChart from './components/EvolutionChart.tsx';
import RaceDetails from './components/RaceDetails.tsx';
import Filters from './components/Filters.tsx';
import SummaryCards from './components/SummaryCards.tsx';
import MortadelaTable from './components/MortadelaTable.tsx';
import AbandonosTable from './components/AbandonosTable.tsx';
import { PLAYERS, RACES, MOCK_RESULTS as RESULTS, CATEGORIES, MORTADELAS, WITHDRAWALS } from './mockData.ts';
import { GlobalStats, ChartDataPoint, RaceStatus, LeagueSummary } from './types.ts';
import { LayoutDashboard, Flame } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'mortadela'>('general');
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
    const sorted = [...stats].sort((a, b) => b.totalPoints - a.totalPoints);
    const leader = PLAYERS.find(p => p.id === sorted[0]?.playerId);
    
    let topScore = 0;
    let topPlayerId = '';
    RESULTS.forEach(r => {
      if (r.points > topScore) {
        topScore = r.points;
        topPlayerId = r.playerId;
      }
    });

    return {
      leaderName: leader?.name || '---',
      leaderColor: leader?.color || '#fff',
      totalRaces: RACES.length,
      completedRaces: RACES.filter(r => r.status === RaceStatus.PLAYED).length,
      topScore,
      topScorePlayer: PLAYERS.find(p => p.id === topPlayerId)?.name || '---'
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
      {/* Sección superior de tarjetas - Siempre centrada y de ancho moderado */}
      <SummaryCards summary={summary} />

      {activeTab === 'general' ? (
        <div className="animate-in fade-in duration-700 space-y-16 pb-32">
          {/* La clasificación general ahora puede ocupar más ancho en escritorio */}
          <div className="grid grid-cols-1 gap-12">
            <GeneralTable players={PLAYERS} stats={stats} />
            <div className="h-[400px]">
              <EvolutionChart data={chartData} players={PLAYERS} />
            </div>
          </div>
          
          <div className="pt-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
              <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter font-heading underline decoration-blue-500 decoration-4 underline-offset-8">Resultados</h2>
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
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-12 pb-32">
          <MortadelaTable entries={MORTADELAS} players={PLAYERS} />
          <AbandonosTable records={WITHDRAWALS} players={PLAYERS} />
        </div>
      )}

      {/* NAVEGACIÓN INFERIOR FIJA - ESTILO EXACTO CAPTURA */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-sm">
        <div className="flex items-center p-1.5 bg-[#0a0f1e]/90 border border-white/10 rounded-[32px] backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <button
            onClick={() => setActiveTab('general')}
            className={`flex-1 flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-[26px] text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
              activeTab === 'general' 
                ? 'bg-[#3b82f6] text-white shadow-lg shadow-blue-600/40' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Clasificación
          </button>
          <button
            onClick={() => setActiveTab('mortadela')}
            className={`flex-1 flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-[26px] text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
              activeTab === 'mortadela' 
                ? 'bg-[#f59e0b] text-white shadow-lg shadow-amber-600/40' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Flame className="w-4 h-4" />
            Records
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default App;
