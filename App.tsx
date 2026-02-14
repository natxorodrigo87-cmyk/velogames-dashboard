
import React, { useState, useMemo } from 'react';
import Layout from './components/Layout.tsx';
import GeneralTable from './components/GeneralTable.tsx';
import EvolutionChart from './components/EvolutionChart.tsx';
import RaceDetails from './components/RaceDetails.tsx';
import Filters from './components/Filters.tsx';
import SummaryCards from './components/SummaryCards.tsx';
import MortadelaTable from './components/MortadelaTable.tsx';
import AbandonosTable from './components/AbandonosTable.tsx';
import CyclingAI from './components/CyclingAI.tsx';
import { PLAYERS, RACES, MOCK_RESULTS as RESULTS, CATEGORIES, MORTADELAS, WITHDRAWALS } from './mockData.ts';
import { GlobalStats, ChartDataPoint, RaceStatus, LeagueSummary } from './types.ts';
import { LayoutDashboard, Flame, BrainCircuit, ArrowRight } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'mortadela' | 'ai'>('general');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  // Calculate global stats
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

  // League Summary
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

  // Chart data
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

      {/* Navegación Principal */}
      <div className="flex flex-col gap-4 max-w-md mx-auto md:mx-0 mb-10">
        {/* Selector de Pestañas (Solo 2 botones ahora) */}
        <div className="flex items-center p-1.5 bg-slate-900/60 border border-white/5 rounded-2xl backdrop-blur-md">
          <button
            onClick={() => setActiveTab('general')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all ${
              activeTab === 'general' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Clasificación
          </button>
          <button
            onClick={() => setActiveTab('mortadela')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all ${
              activeTab === 'mortadela' 
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            Records
          </button>
        </div>

        {/* Botón "Entrenador Personal" debajo de los otros botones */}
        <button 
          onClick={() => setActiveTab('ai')}
          className={`w-full relative group overflow-hidden p-4 rounded-2xl shadow-xl border transition-all active:scale-95 ${
            activeTab === 'ai' 
              ? 'bg-purple-600 border-purple-400/50 shadow-purple-900/40' 
              : 'bg-gradient-to-r from-purple-900/40 to-slate-900/60 border-white/5 hover:border-purple-500/30'
          }`}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(168,85,247,0.15)_0%,_transparent_100%)]"></div>
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-xl backdrop-blur-md ${activeTab === 'ai' ? 'bg-white/20' : 'bg-purple-600/20 text-purple-400'}`}>
                <BrainCircuit className={`w-5 h-5 ${activeTab === 'ai' ? 'text-white' : 'text-purple-400'}`} />
              </div>
              <div className="text-left">
                <span className={`block text-[8px] font-black uppercase tracking-widest leading-none mb-1 ${activeTab === 'ai' ? 'text-purple-200' : 'text-purple-500'}`}>
                  PCS Live Advisor
                </span>
                <span className="block text-sm font-black text-white uppercase italic tracking-tighter leading-none">
                  Entrenador Personal
                </span>
              </div>
            </div>
            <ArrowRight className={`w-4 h-4 transition-transform ${activeTab === 'ai' ? 'text-white translate-x-1' : 'text-slate-600 group-hover:text-purple-400'}`} />
          </div>
        </button>
      </div>

      {activeTab === 'general' ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 order-2 lg:order-1">
              <EvolutionChart data={chartData} players={PLAYERS} />
            </div>
            
            <div className="order-1 lg:order-2">
              <GeneralTable players={PLAYERS} stats={stats} />
            </div>
          </div>

          <div className="mt-16">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-3xl font-black text-white italic uppercase tracking-tight">Calendario & <span className="text-blue-500">Resultados</span></h2>
                <p className="text-slate-500 text-sm font-medium mt-1">Detalle de puntos asignados por carrera y categoría.</p>
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
        </>
      ) : activeTab === 'mortadela' ? (
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="max-w-4xl mx-auto">
             <MortadelaTable entries={MORTADELAS} players={PLAYERS} />
             <div className="mt-12 p-8 bg-amber-500/5 border border-amber-500/10 rounded-3xl text-center">
                <h3 className="text-xl font-black text-amber-500 uppercase italic tracking-tighter mb-2">¿Qué es una Mortadela?</h3>
                <p className="text-slate-400 text-sm leading-relaxed max-w-2xl mx-auto italic">
                  "Dícese de aquel rendimiento ciclista individual que rompe todos los esquemas, 
                  consiguiendo una puntuación desorbitada en una sola carrera. Un hito de fuerza bruta 
                  y mortadela que solo los elegidos pueden alcanzar."
                </p>
              </div>
          </div>

          <AbandonosTable records={WITHDRAWALS} players={PLAYERS} />
        </div>
      ) : (
        <CyclingAI />
      )}
    </Layout>
  );
};

export default App;
