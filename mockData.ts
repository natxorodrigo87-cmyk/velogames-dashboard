import { Player, Category, Race, Result, RaceStatus } from './types';

export const PLAYERS: Player[] = [
  { id: 'p1', name: 'US POSTAL', color: '#1e40af' },
  { id: 'p2', name: 'VOXDALÁS', color: '#fbbf24' },
  { id: 'p3', name: 'TEAM CHARLOTTE', color: '#3b82f6' },
  { id: 'p4', name: 'LA GALIA', color: '#ef4444' },
];

export const CATEGORIES: Category[] = [
  { id: 'c1', name: 'CATEGORÍA 1 (15-10-7-4)' },
  { id: 'c2', name: 'CATEGORÍA 2 (9-6-4-2)' },
  { id: 'c3', name: 'CATEGORÍA 3 (5-3-2-1)' },
  { id: 'c4', name: 'CATEGORÍA 4 (3-2-1-0)' },
];

export const RACES: Race[] = [
  // CATEGORÍA 3 - Tour Down Under (Jugada)
  { id: 'r_tdu', name: 'Tour Down Under', categoryId: 'c3', date: '2024-01-16', status: RaceStatus.PLAYED },
  
  // CATEGORÍA 4 - Alula, Bessèges, Valenciana (Jugadas)
  { id: 'r_alula', name: 'Alula Tour', categoryId: 'c4', date: '2024-01-30', status: RaceStatus.PLAYED },
  { id: 'r_besseges', name: 'Etoile de Bessèges', categoryId: 'c4', date: '2024-01-31', status: RaceStatus.PLAYED },
  { id: 'r_valenciana', name: 'Comunidad Valenciana', categoryId: 'c4', date: '2024-01-31', status: RaceStatus.PLAYED },

  // CATEGORÍA 1 (GVs)
  { id: 'r_giro', name: 'Giro d\'Italia', categoryId: 'c1', date: '2024-05-04', status: RaceStatus.UPCOMING },
  { id: 'r_tour', name: 'Tour de France', categoryId: 'c1', date: '2024-06-29', status: RaceStatus.UPCOMING },
  { id: 'r_vuelta', name: 'Vuelta a España', categoryId: 'c1', date: '2024-08-17', status: RaceStatus.UPCOMING },

  // CATEGORÍA 2 (Week WT)
  { id: 'r_pn', name: 'París-Niza', categoryId: 'c2', date: '2024-03-03', status: RaceStatus.UPCOMING },
  { id: 'r_ta', name: 'Tirreno-Adriático', categoryId: 'c2', date: '2024-03-04', status: RaceStatus.UPCOMING },
  { id: 'r_cat', name: 'Volta a Catalunya', categoryId: 'c2', date: '2024-03-18', status: RaceStatus.UPCOMING },
  { id: 'r_itz', name: 'Itzulia Basque Country', categoryId: 'c2', date: '2024-04-01', status: RaceStatus.UPCOMING },
  { id: 'r_dau', name: 'Critérium du Dauphiné', categoryId: 'c2', date: '2024-06-02', status: RaceStatus.UPCOMING },

  // CATEGORÍA 3 (Otros WT)
  { id: 'r_uae', name: 'UAE Tour', categoryId: 'c3', date: '2024-02-19', status: RaceStatus.UPCOMING },
  { id: 'r_rom', name: 'Tour de Romandía', categoryId: 'c3', date: '2024-04-23', status: RaceStatus.UPCOMING },
  { id: 'r_sui', name: 'Tour de Suiza', categoryId: 'c3', date: '2024-06-09', status: RaceStatus.UPCOMING },
  { id: 'r_pol', name: 'Tour de Polonia', categoryId: 'c3', date: '2024-08-12', status: RaceStatus.UPCOMING },
  { id: 'r_ren', name: 'Renewi Tour', categoryId: 'c3', date: '2024-08-28', status: RaceStatus.UPCOMING },

  // CATEGORÍA 4 (Otros ProSeries/2.1)
  { id: 'r_oman', name: 'Tour de Omán', categoryId: 'c4', date: '2024-02-10', status: RaceStatus.UPCOMING },
  { id: 'r_alg', name: 'Vuelta al Algarve', categoryId: 'c4', date: '2024-02-14', status: RaceStatus.UPCOMING },
  { id: 'r_sol', name: 'Ruta del Sol', categoryId: 'c4', date: '2024-02-14', status: RaceStatus.UPCOMING },
  { id: 'r_gc', name: 'O Gran Camiño', categoryId: 'c4', date: '2024-02-22', status: RaceStatus.UPCOMING },
];

export const RESULTS: Result[] = [
  // Tour Down Under: 6 pts (Ajustado para total 17)
  { id: 'res_1', raceId: 'r_tdu', playerId: 'p1', points: 6 },
  { id: 'res_2', raceId: 'r_tdu', playerId: 'p2', points: 1 },
  { id: 'res_3', raceId: 'r_tdu', playerId: 'p3', points: 3 },
  { id: 'res_4', raceId: 'r_tdu', playerId: 'p4', points: 2 },
  
  // Alula Tour: 2 pts
  { id: 'res_5', raceId: 'r_alula', playerId: 'p1', points: 2 },
  { id: 'res_6', raceId: 'r_alula', playerId: 'p2', points: 0 },
  { id: 'res_7', raceId: 'r_alula', playerId: 'p3', points: 1 },
  { id: 'res_8', raceId: 'r_alula', playerId: 'p4', points: 3 },
  
  // Bessèges: 2 pts
  { id: 'res_9', raceId: 'r_besseges', playerId: 'p1', points: 2 },
  { id: 'res_10', raceId: 'r_besseges', playerId: 'p2', points: 1 },
  { id: 'res_11', raceId: 'r_besseges', playerId: 'p3', points: 0 },
  { id: 'res_12', raceId: 'r_besseges', playerId: 'p4', points: 4 },
  
  // Comunidad Valenciana: 7 pts
  { id: 'res_13', raceId: 'r_valenciana', playerId: 'p1', points: 7 },
  { id: 'res_14', raceId: 'r_valenciana', playerId: 'p2', points: 0 },
  { id: 'res_15', raceId: 'r_valenciana', playerId: 'p3', points: 2 },
  { id: 'res_16', raceId: 'r_valenciana', playerId: 'p4', points: 1 },
];

export const MOCK_RESULTS = RESULTS;
