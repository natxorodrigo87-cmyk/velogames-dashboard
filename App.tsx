
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
import { LayoutDashboard, Flame, BrainCircuit, ChevronRight } from 'lucide-react';

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
      <SummaryCards summary={summary} />

      {/* NAVEGACIÓN SUPERIOR */}
      <nav className="flex flex-col gap-3 mt-4">
        <div className="flex gap-2 bg-slate-900/50 p-1.5 rounded-[22px] border border-white/5 backdrop-blur-md">
          <button
            onClick={() => setActiveTab('general')}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === 'general' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Clasificación
          </button>
          
          <button
            onClick={() => setActiveTab('records')}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === 'records' 
                ? 'bg-amber-500 text-white shadow-lg shadow-amber-600/20' 
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            Records
          </button>
        </div>

        <button
          onClick={() => setActiveTab('ai')}
          className={`group relative overflow-hidden flex items-center justify-between gap-4 p-5 rounded-[22px] transition-all border ${
            activeTab === 'ai' 
              ? 'bg-purple-600 border-purple-500 text-white shadow-[0_15px_40px_rgba(168,85,247,0.25)]' 
              : 'bg-gradient-to-r from-purple-900/40 to-slate-900 border-purple-500/20 text-slate-300 hover:border-purple-500/50'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${activeTab === 'ai' ? 'bg-white/20' : 'bg-purple-600'}`}>
              <BrainCircuit className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-0.5 ${activeTab === 'ai' ? 'text-purple-200' : 'text-purple-400'}`}>Acceso Prioritario</p>
              <h3 className="text-sm font-black italic uppercase tracking-tight">Soy tu entrenador virtual</h3>
            </div>
          </div>
          <ChevronRight className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${activeTab === 'ai' ? 'text-white' : 'text-purple-500'}`} />
          
          {/* Efecto de brillo */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
        </button>
      </nav>

      {/* CONTENIDO SEGÚN PESTAÑA */}
      <div className="mt-8">
        {activeTab === 'general' ? (
          <div className="animate-in fade-in duration-700 space-y-12">
            <GeneralTable players={PLAYERS} stats={stats} />
            <div className="h-[400px]">
              <EvolutionChart data={chartData} players={PLAYERS} />
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
        ) : activeTab === 'records' ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-12">
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
