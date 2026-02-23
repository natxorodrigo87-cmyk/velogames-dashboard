
import React, { useState } from 'react';
import { Race, Result, Player, RaceStatus, Category } from '../types';
import { ChevronDown, ChevronUp, Calendar, MapPin, CheckCircle2, Clock } from 'lucide-react';

interface RaceDetailsProps {
  races: Race[];
  results: Result[];
  players: Player[];
  categories: Category[];
}

const RaceDetails: React.FC<RaceDetailsProps> = ({ races, results, players, categories }) => {
  const [openRaceId, setOpenRaceId] = useState<string | null>(null);

  const toggleRace = (id: string) => {
    setOpenRaceId(openRaceId === id ? null : id);
  };

  const getPCSRaceUrl = (raceName: string) => {
    const slugs: Record<string, string> = {
      'Tour Down Under': 'tour-down-under',
      'Alula Tour': 'alula-tour',
      'Etoile de Bessèges': 'etoile-de-besseges',
      'Comunidad Valenciana': 'volta-a-la-comunitat-valenciana',
      'Tour de Omán': 'tour-of-oman',
      'UAE Tour': 'uae-tour',
      'Vuelta al Algarve': 'volta-ao-algarve',
      'Ruta del Sol': 'vuelta-a-andalucia',
      'París-Niza': 'paris-nice',
      'Tirreno-Adriático': 'tirreno-adriatico',
      'Volta a Catalunya': 'volta-a-catalunya',
      'Itzulia Basque Country': 'itzulia-basque-country',
      'O Gran Camiño': 'o-gran-camino',
      'Tour de Romandía': 'tour-de-romandie',
      'Giro d\'Italia': 'giro-d-italia',
      'Critérium du Dauphiné': 'criterium-du-dauphine',
      'Tour de Suiza': 'tour-de-suisse',
      'Tour de France': 'tour-de-france',
      'Tour de Polonia': 'tour-de-pologne',
      'Renewi Tour': 'renewi-tour',
      'Vuelta a España': 'vuelta-a-espana',
    };
    
    const slug = slugs[raceName] || raceName.toLowerCase().replace(/\s+/g, '-');
    return `https://www.procyclingstats.com/race/${slug}/2026/route/stage-profiles`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-white">Detalle de Carreras</h2>
      </div>
      
      <div className="grid gap-3">
        {races.map((race) => {
          const isOpen = openRaceId === race.id;
          const isUpcoming = race.status === RaceStatus.UPCOMING;
          const category = categories.find(c => c.id === race.categoryId);
          const raceResults = results.filter(r => r.raceId === race.id);
          
          return (
            <div 
              key={race.id} 
              className={`group border rounded-2xl overflow-hidden transition-all duration-300 ${
                isOpen 
                  ? 'border-blue-500 bg-slate-900/80 shadow-lg shadow-blue-500/10' 
                  : 'border-slate-800 bg-slate-900/40 hover:bg-slate-900/60'
              }`}
            >
              <button 
                onClick={() => !isUpcoming && toggleRace(race.id)}
                className={`w-full px-5 py-4 flex items-center justify-between text-left ${isUpcoming ? 'cursor-default' : 'cursor-pointer'}`}
              >
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
                  <div className="flex flex-col">
                    <span className="text-white font-bold text-lg leading-tight">{race.name}</span>
                    <div className="flex items-center flex-wrap gap-3 mt-1">
                       <span className="flex items-center gap-1 text-slate-500 text-xs font-medium">
                         <Calendar className="w-3 h-3" />
                         {new Date(race.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                       </span>
                       <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                         {category?.name}
                       </span>
                       <a 
                         href={getPCSRaceUrl(race.name)} 
                         target="_blank" 
                         rel="noopener noreferrer"
                         className="flex items-center gap-1 px-2 py-0.5 rounded bg-blue-600/20 text-blue-400 text-[10px] font-black uppercase tracking-widest hover:bg-blue-600/40 transition-all border border-blue-500/30"
                         onClick={(e) => e.stopPropagation()}
                       >
                         <MapPin className="w-2.5 h-2.5" />
                         Perfiles de la carrera
                       </a>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {isUpcoming ? (
                    <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-500 px-3 py-1 rounded-full border border-amber-500/20">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="text-xs font-bold uppercase tracking-tight">Próximamente</span>
                    </div>
                  ) : (
                    <>
                      <div className="hidden md:flex -space-x-2">
                         {players.map(p => (
                           <div key={p.id} className="w-6 h-6 rounded-full border-2 border-slate-900 shadow-sm" style={{ backgroundColor: p.color }} title={p.name} />
                         ))}
                      </div>
                      <div className={`p-1 rounded-full transition-transform duration-300 ${isOpen ? 'bg-blue-500 text-white rotate-180' : 'bg-slate-800 text-slate-400'}`}>
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </>
                  )}
                </div>
              </button>

              {isOpen && !isUpcoming && (
                <div className="px-5 pb-5 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                    {players.map(player => {
                      const result = raceResults.find(r => r.playerId === player.id);
                      const isWinner = result?.points === Math.max(...raceResults.map(r => r.points));
                      
                      return (
                        <div key={player.id} className="bg-slate-950/40 p-3 rounded-xl border border-slate-800 flex flex-col items-center text-center">
                          <div className="relative mb-2">
                             <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black" style={{ backgroundColor: player.color }}>
                               {player.name.charAt(0)}
                             </div>
                             {isWinner && (
                               <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-0.5 shadow-lg border-2 border-slate-950">
                                 <CheckCircle2 className="w-3 h-3 text-black" />
                               </div>
                             )}
                          </div>
                          <span className="text-xs text-slate-400 font-semibold mb-1 uppercase tracking-wider">{player.name}</span>
                          <span className="text-lg font-black text-white">{result?.points.toLocaleString('es-ES')} <span className="text-[10px] text-slate-500 font-normal">pts</span></span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RaceDetails;
