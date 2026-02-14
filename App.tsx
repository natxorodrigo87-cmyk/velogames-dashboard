
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
import { LayoutDashboard, Flame, Search, BookOpen, X } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'mortadela'>('general');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [activeAI, setActiveAI] = useState<'pcs' | 'encyclopedia' | null>(null);

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
      <div className="flex flex-col gap-4 max-w-xs mx-auto md:mx-0 mb-10">
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
      </div>

      {activeTab === 'general' ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <div className="lg:col-span-2 order-2 lg:order-1">
              <EvolutionChart data={chartData} players={PLAYERS} />
            </div>
            
            <div className="order-1 lg:order-2 flex flex-col gap-6">
              <GeneralTable players={PLAYERS} stats={stats} />
              
              {/* BLOQUE DE IA ESPECIALIZADA */}
              <div className="grid grid-cols-1 gap-3">
                <button 
                  onClick={() => setActiveAI('pcs')}
                  className="group relative flex items-center gap-4 p-4 bg-slate-900 border border-blue-500/20 rounded-2xl hover:border-blue-500 transition-all shadow-xl overflow-hidden"
                >
                  <div className="absolute inset-0 bg-blue-600/5 group-hover:bg-blue-600/10 transition-colors" />
                  <div className="p-3 bg-blue-600 rounded-xl text-white shadow-lg group-hover:scale-110 transition-transform">
                    <Search className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <span className="block text-[10px] font-black text-blue-500 uppercase tracking-widest leading-none mb-1">Análisis Real</span>
                    <span className="block text-sm font-black text-white italic uppercase tracking-tighter">IA de Procyclingstats</span>
                  </div>
                </button>

                <button 
                  onClick={() => setActiveAI('encyclopedia')}
                  className="group relative flex items-center gap-4 p-4 bg-slate-900 border border-amber-500/20 rounded-2xl hover:border-amber-500 transition-all shadow-xl overflow-hidden"
                >
                  <div className="absolute inset-0 bg-amber-600/5 group-hover:bg-amber-600/10 transition-colors" />
                  <div className="p-3 bg-amber-600 rounded-xl text-white shadow-lg group-hover:scale-110 transition-transform">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <span className="block text-[10px] font-black text-amber-500 uppercase tracking-widest leading-none mb-1">Cultura & Historia</span>
                    <span className="block text-sm font-black text-white italic uppercase tracking-tighter">Enciclopedia del Ciclismo</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* ASISTENTE AI OVERLAY */}
          {activeAI && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
              <div className="relative w-full max-w-4xl max-h-[90vh]">
                <button 
                  onClick={() => setActiveAI(null)}
                  className="absolute -top-12 right-0 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
                <CyclingAI mode={activeAI} />
              </div>
            </div>
          )}

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
      ) : (
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
      )}
    </Layout>
  );
};

export default App;
