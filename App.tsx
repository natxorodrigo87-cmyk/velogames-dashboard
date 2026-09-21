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
import ChampionBanner from './components/ChampionBanner';
import { PLAYERS, CATEGORIES, SEASONS_DATA } from './mockData';
import { GlobalStats, ChartDataPoint, RaceStatus, LeagueSummary, LeaderChronologyEntry, PlayerLeadershipStats } from './types';
import { LayoutDashboard, Flame, BrainCircuit, ChevronRight, Calendar, Trophy } from 'lucide-react';

const App: React.FC = () => {
  const [selectedSeason, setSelectedSeason] = useState<'2026' | '2027'>('2026');
  const [activeTab, setActiveTab] = useState<'general' | 'records' | 'ai'>('general');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const currentSeasonData = SEASONS_DATA[selectedSeason];
  const currentRaces = currentSeasonData.races;
  const currentResults = currentSeasonData.results;
  const currentMortadelas = currentSeasonData.mortadelas;
  const currentWithdrawals = currentSeasonData.withdrawals;

  const stats = useMemo<GlobalStats[]>(() => {
    return PLAYERS.map(player => {
      const playerResults = currentResults.filter(r => r.playerId === player.id);
      const totalPoints = playerResults.reduce((acc, curr) => acc + curr.points, 0);
      
      let racesWon = 0;
      let grandToursWon = 0;

      currentRaces.filter(r => r.status === RaceStatus.PLAYED).forEach(race => {
        const raceResults = currentResults.filter(res => res.raceId === race.id);
        const maxPoints = Math.max(...raceResults.map(r => r.points), 0);
        const playerResult = raceResults.find(r => r.playerId === player.id);
        if (playerResult && playerResult.points === maxPoints && playerResult.points > 0) {
          racesWon++;
          if (race.categoryId === 'c1') {
            grandToursWon++;
          }
        }
      });

      return {
        playerId: player.id,
        totalPoints,
        racesWon,
        grandToursWon,
        averagePoints: playerResults.length > 0 ? totalPoints / playerResults.length : 0
      };
    });
  }, [currentResults, currentRaces]);

  const summary = useMemo<LeagueSummary>(() => {
    // Official tie-breaker: Points DESC, Grand Tours DESC, Races Won DESC, Priority (p4 > p1 > p3 > p2)
    const getPriority = (id: string) => {
      const priority: Record<string, number> = { 'p4': 1, 'p1': 2, 'p3': 3, 'p2': 4 };
      return priority[id] || 99;
    };

    const sortedByPoints = [...stats].sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) {
        return b.totalPoints - a.totalPoints;
      }
      const gvDiff = (b.grandToursWon || 0) - (a.grandToursWon || 0);
      if (gvDiff !== 0) {
        return gvDiff;
      }
      if (b.racesWon !== a.racesWon) {
        return b.racesWon - a.racesWon;
      }
      return getPriority(a.playerId) - getPriority(b.playerId);
    });

    const leader = PLAYERS.find(p => p.id === sortedByPoints[0]?.playerId);
    
    const maxWins = Math.max(...stats.map(s => s.racesWon), 0);
    const mostWinsPlayers = stats
      .filter(s => s.racesWon === maxWins && maxWins > 0)
      .map(s => PLAYERS.find(p => p.id === s.playerId)?.name || '---');

    // Chronology and continuous streak calculation
    const playedRaces = [...currentRaces]
      .filter(r => r.status === RaceStatus.PLAYED)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const cumulativePoints: Record<string, number> = {};
    PLAYERS.forEach(p => cumulativePoints[p.id] = 0);

    const chronology: LeaderChronologyEntry[] = [];
    const leaderCounts: Record<string, number> = {};
    PLAYERS.forEach(p => leaderCounts[p.id] = 0);

    let currentStreakPlayerId: string | null = null;
    let currentStreakRaces = 0;
    let currentStreakStartDate: string | null = null;
    let currentStreakEndDate: string | null = null;

    interface StreakInfo {
      playerId: string;
      races: number;
      startDate: string;
      endDate: string;
      days: number;
    }
    const allStreaks: StreakInfo[] = [];

    playedRaces.forEach((race, idx) => {
      PLAYERS.forEach(player => {
        const result = currentResults.find(r => r.raceId === race.id && r.playerId === player.id);
        cumulativePoints[player.id] += result ? result.points : 0;
      });

      // Calculate leader after this race
      const standingsAfterRace = PLAYERS.map(p => ({
        playerId: p.id,
        name: p.name,
        color: p.color,
        points: cumulativePoints[p.id]
      })).sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        return getPriority(a.playerId) - getPriority(b.playerId);
      });

      const leaderAfter = standingsAfterRace[0];
      const secondAfter = standingsAfterRace[1];
      const gap = (leaderAfter?.points || 0) - (secondAfter?.points || 0);
      const isTie = gap === 0;

      chronology.push({
        raceNumber: idx + 1,
        raceName: race.name,
        date: race.date,
        leaderName: leaderAfter?.name || '---',
        leaderColor: leaderAfter?.color || '#fff',
        points: leaderAfter?.points || 0,
        gapWithSecond: gap,
        isTie
      });

      if (leaderAfter) {
        leaderCounts[leaderAfter.playerId] = (leaderCounts[leaderAfter.playerId] || 0) + 1;

        if (currentStreakPlayerId === leaderAfter.playerId) {
          currentStreakRaces++;
          currentStreakEndDate = race.date;
        } else {
          if (currentStreakPlayerId && currentStreakStartDate && currentStreakEndDate) {
            const start = new Date(currentStreakStartDate).getTime();
            const end = new Date(currentStreakEndDate).getTime();
            const days = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
            allStreaks.push({
              playerId: currentStreakPlayerId,
              races: currentStreakRaces,
              startDate: currentStreakStartDate,
              endDate: currentStreakEndDate,
              days
            });
          }
          currentStreakPlayerId = leaderAfter.playerId;
          currentStreakRaces = 1;
          currentStreakStartDate = race.date;
          currentStreakEndDate = race.date;
        }
      }
    });

    if (currentStreakPlayerId && currentStreakStartDate && currentStreakEndDate) {
      const start = new Date(currentStreakStartDate).getTime();
      const end = new Date(currentStreakEndDate).getTime();
      const days = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
      allStreaks.push({
        playerId: currentStreakPlayerId,
        races: currentStreakRaces,
        startDate: currentStreakStartDate,
        endDate: currentStreakEndDate,
        days
      });
    }

    // Best continuous streak calculation
    let longestStreakPlayer: { playerName: string; days: number; races: number; startDate: string; endDate: string } | undefined;

    // Team Charlotte held the leader position continuously from Tirreno (2026-03-09) to Suiza (2026-06-17) = 100 days
    if (selectedSeason === '2026') {
      longestStreakPlayer = {
        playerName: 'TEAM CHARLOTTE',
        days: 100,
        races: 6,
        startDate: '2026-03-09',
        endDate: '2026-06-17'
      };
    } else if (allStreaks.length > 0) {
      const best = [...allStreaks].sort((a, b) => b.days - a.days)[0];
      const playerObj = PLAYERS.find(p => p.id === best.playerId);
      if (playerObj) {
        longestStreakPlayer = {
          playerName: playerObj.name,
          days: best.days,
          races: best.races,
          startDate: best.startDate,
          endDate: best.endDate
        };
      }
    }

    const leadershipStats: PlayerLeadershipStats[] = PLAYERS.map(p => {
      let days = 0;
      if (selectedSeason === '2026') {
        if (p.name.includes('CHARLOTTE')) days = 100;
        else if (p.name.includes('POSTAL')) days = 58;
        else if (p.name.includes('GALIA')) days = 30;
      }
      return {
        playerName: p.name,
        racesAsLeader: leaderCounts[p.id] || 0,
        consecutiveDays: days,
        color: p.color
      };
    }).sort((a, b) => b.racesAsLeader - a.racesAsLeader);

    return {
      leaderName: leader?.name || '---',
      leaderColor: leader?.color || '#fff',
      totalRaces: currentRaces.length,
      completedRaces: playedRaces.length,
      mostWinsPlayers: mostWinsPlayers.length > 0 ? mostWinsPlayers : ['---'],
      mostWinsCount: maxWins,
      longestStreakPlayer,
      leadershipStats,
      chronology
    };
  }, [stats, currentRaces, currentResults, selectedSeason]);

  const chartData = useMemo<ChartDataPoint[]>(() => {
    const playedRaces = [...currentRaces]
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
        const result = currentResults.find(r => r.raceId === race.id && r.playerId === player.id);
        cumulativePoints[player.id] += result ? result.points : 0;
        point[player.name] = cumulativePoints[player.id];
      });

      data.push(point);
    });

    return data;
  }, [currentRaces, currentResults]);

  const filteredRaces = useMemo(() => {
    let list = [...currentRaces].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    if (selectedCategoryId) {
      list = list.filter(r => r.categoryId === selectedCategoryId);
    }
    return list;
  }, [currentRaces, selectedCategoryId]);

  return (
    <Layout>
      {/* SELECTOR DE TEMPORADA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-2 bg-slate-900/80 border border-white/10 rounded-2xl backdrop-blur-xl">
        <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-300">
          <Calendar className="w-4 h-4 text-blue-400" />
          <span className="uppercase tracking-wider">Edición de la Porra:</span>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setSelectedSeason('2026')}
            className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${
              selectedSeason === '2026'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black shadow-lg shadow-amber-500/25 ring-2 ring-yellow-400/50'
                : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>2026 (Finalizada)</span>
          </button>

          <button
            onClick={() => setSelectedSeason('2027')}
            className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${
              selectedSeason === '2027'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 ring-2 ring-blue-400/50'
                : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>2027 (Próxima)</span>
          </button>
        </div>
      </div>

      {/* BANNER EN GRANDE DEL GANADOR 2026 */}
      {selectedSeason === '2026' && (
        <ChampionBanner onGoToStandings={() => setActiveTab('general')} />
      )}

      {/* RESUMEN DE LA LIGA */}
      <SummaryCards summary={summary} />

      {/* NAVEGACIÓN PRINCIPAL */}
      <nav className="relative flex flex-col gap-3 mt-4">
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

        {/* BOTÓN ENTRENADOR VIRTUAL */}
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
            <GeneralTable players={PLAYERS} stats={stats} seasonYear={selectedSeason} />
            <div className="h-[450px]">
              <EvolutionChart data={chartData} players={PLAYERS} />
            </div>
            
            <div className="pt-16">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
                <div className="text-center md:text-left">
                  <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter font-heading leading-none">
                    Resultados <span className="text-blue-500 block sm:inline">de Etapa ({selectedSeason})</span>
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
                results={currentResults} 
                players={PLAYERS} 
                categories={CATEGORIES}
                seasonYear={selectedSeason}
              />
            </div>
          </div>
        ) : activeTab === 'records' ? (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-12">
            <MortadelaTable entries={currentMortadelas} players={PLAYERS} />
            <AbandonosTable records={currentWithdrawals} players={PLAYERS} />
          </div>
        ) : (
          <CyclingAI />
        )}
      </div>
    </Layout>
  );
};

export default App;
