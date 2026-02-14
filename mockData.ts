
import { Player, Category, Race, Result, RaceStatus, MortadelaEntry, WithdrawalRecord } from './types';

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

export const MORTADELAS: MortadelaEntry[] = [
  { cyclist: 'Froidevaux', points: 194, playerName: 'LA GALIA', raceName: 'Alula' },
  { cyclist: 'Van Der Tuk', points: 190, playerName: 'US POSTAL', raceName: 'Valenciana' },
  { cyclist: 'Mouris', points: 138, playerName: 'US POSTAL', raceName: 'Besseges' },
  { cyclist: 'Bleddyn', points: 112, playerName: 'CHARLOTTE / POSTAL', raceName: 'TDU' },
  { cyclist: 'Hvideberg', points: 96, playerName: 'US POSTAL', raceName: 'Oman' },
  { cyclist: 'Vanghelewe', points: 48, playerName: 'US POSTAL', raceName: 'Oman' },
];

export const WITHDRAWALS: WithdrawalRecord[] = [
  {
    playerName: 'US POSTAL',
    total: 3,
    races: {
      'TDU': 'Narváez, Van Poppel',
      'Alula': '0',
      'CV': '0',
      'Besseges': 'Groenewegen',
      'Omán': '0'
    }
  },
  {
    playerName: 'VOXDALÁS',
    total: 9,
    races: {
      'TDU': 'Narváez, Strong, Torres, Van der Meulen',
      'Alula': 'no la hizo',
      'CV': 'Cian',
      'Besseges': 'Groenewegen, Biermans',
      'Omán': 'Oliveira, Bettiol'
    }
  },
  {
    playerName: 'LA GALIA',
    total: 6,
    races: {
      'TDU': 'Narváez, Van Etvelt',
      'Alula': '0',
      'CV': 'Pedersen',
      'Besseges': 'Van Hemelen, Pringle',
      'Omán': 'Lemmen'
    }
  },
  {
    playerName: 'TEAM CHARLOTTE',
    total: 8,
    races: {
      'TDU': 'Narváez, Van Eetvelt, Van Poppel',
      'Alula': "D'Amato",
      'CV': 'Foss',
      'Besseges': 'Crabbe, Pringle, Parisini',
      'Omán': '0'
    }
  }
];

export const RACES: Race[] = [
  { id: 'r_tdu', name: 'Tour Down Under', categoryId: 'c3', date: '2026-01-20', status: RaceStatus.PLAYED },
  { id: 'r_alula', name: 'Alula Tour', categoryId: 'c4', date: '2026-01-27', status: RaceStatus.PLAYED },
  { id: 'r_besseges', name: 'Etoile de Bessèges', categoryId: 'c4', date: '2026-02-04', status: RaceStatus.PLAYED },
  { id: 'r_valenciana', name: 'Comunidad Valenciana', categoryId: 'c4', date: '2026-02-04', status: RaceStatus.PLAYED },
  { id: 'r_oman', name: 'Tour de Omán', categoryId: 'c4', date: '2026-02-10', status: RaceStatus.PLAYED },
  { id: 'r_uae', name: 'UAE Tour', categoryId: 'c3', date: '2026-02-16', status: RaceStatus.UPCOMING },
  { id: 'r_alg', name: 'Vuelta al Algarve', categoryId: 'c4', date: '2026-02-18', status: RaceStatus.UPCOMING },
  { id: 'r_sol', name: 'Ruta del Sol', categoryId: 'c4', date: '2026-02-18', status: RaceStatus.UPCOMING },
  { id: 'r_pn', name: 'París-Niza', categoryId: 'c2', date: '2026-03-08', status: RaceStatus.UPCOMING },
  { id: 'r_ta', name: 'Tirreno-Adriático', categoryId: 'c2', date: '2026-03-09', status: RaceStatus.UPCOMING },
  { id: 'r_cat', name: 'Volta a Catalunya', categoryId: 'c2', date: '2026-03-23', status: RaceStatus.UPCOMING },
  { id: 'r_itz', name: 'Itzulia Basque Country', categoryId: 'c2', date: '2026-04-06', status: RaceStatus.UPCOMING },
  { id: 'r_gc', name: 'O Gran Camiño', categoryId: 'c4', date: '2026-04-14', status: RaceStatus.UPCOMING },
  { id: 'r_rom', name: 'Tour de Romandía', categoryId: 'c3', date: '2026-04-28', status: RaceStatus.UPCOMING },
  { id: 'r_giro', name: 'Giro d\'Italia', categoryId: 'c1', date: '2026-05-08', status: RaceStatus.UPCOMING },
  { id: 'r_dau', name: 'Critérium du Dauphiné', categoryId: 'c2', date: '2026-06-07', status: RaceStatus.UPCOMING },
  { id: 'r_sui', name: 'Tour de Suiza', categoryId: 'c3', date: '2026-06-17', status: RaceStatus.UPCOMING },
  { id: 'r_tour', name: 'Tour de France', categoryId: 'c1', date: '2026-07-04', status: RaceStatus.UPCOMING },
  { id: 'r_pol', name: 'Tour de Polonia', categoryId: 'c3', date: '2026-08-03', status: RaceStatus.UPCOMING },
  { id: 'r_ren', name: 'Renewi Tour', categoryId: 'c3', date: '2026-08-19', status: RaceStatus.UPCOMING },
  { id: 'r_vuelta', name: 'Vuelta a España', categoryId: 'c1', date: '2026-08-22', status: RaceStatus.UPCOMING },
];

export const RESULTS: Result[] = [
  { id: 'res_1', raceId: 'r_tdu', playerId: 'p1', points: 6 },
  { id: 'res_2', raceId: 'r_tdu', playerId: 'p2', points: 1 },
  { id: 'res_3', raceId: 'r_tdu', playerId: 'p3', points: 3 },
  { id: 'res_4', raceId: 'r_tdu', playerId: 'p4', points: 2 },
  { id: 'res_5', raceId: 'r_alula', playerId: 'p1', points: 2 },
  { id: 'res_6', raceId: 'r_alula', playerId: 'p2', points: 0 },
  { id: 'res_7', raceId: 'r_alula', playerId: 'p3', points: 1 },
  { id: 'res_8', raceId: 'r_alula', playerId: 'p4', points: 3 },
  { id: 'res_9', raceId: 'r_besseges', playerId: 'p1', points: 2 },
  { id: 'res_10', raceId: 'r_besseges', playerId: 'p2', points: 1 },
  { id: 'res_11', raceId: 'r_besseges', playerId: 'p3', points: 0 },
  { id: 'res_12', raceId: 'r_besseges', playerId: 'p4', points: 4 },
  { id: 'res_13', raceId: 'r_valenciana', playerId: 'p1', points: 7 },
  { id: 'res_14', raceId: 'r_valenciana', playerId: 'p2', points: 0 },
  { id: 'res_15', raceId: 'r_valenciana', playerId: 'p3', points: 2 },
  { id: 'res_16', raceId: 'r_valenciana', playerId: 'p4', points: 1 },
  { id: 'res_17', raceId: 'r_oman', playerId: 'p1', points: 1 },
  { id: 'res_18', raceId: 'r_oman', playerId: 'p2', points: 0 },
  { id: 'res_19', raceId: 'r_oman', playerId: 'p3', points: 4 },
  { id: 'res_20', raceId: 'r_oman', playerId: 'p4', points: 2 },
];

export const MOCK_RESULTS = RESULTS;
