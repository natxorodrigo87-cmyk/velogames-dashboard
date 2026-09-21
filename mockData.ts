
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

export const MORTADELAS_2026: MortadelaEntry[] = [
  { cyclist: 'Mezgec', points: 153, playerName: 'CHARLOTTE / POSTAL', raceName: 'UAE Tour' },
  { cyclist: 'Froidevaux', points: 194, playerName: 'LA GALIA', raceName: 'Alula' },
  { cyclist: 'Van Der Tuk', points: 190, playerName: 'US POSTAL', raceName: 'Valenciana' },
  { cyclist: 'Mouris', points: 138, playerName: 'US POSTAL', raceName: 'Besseges' },
  { cyclist: 'Bleddyn', points: 112, playerName: 'CHARLOTTE / POSTAL', raceName: 'TDU' },
  { cyclist: 'Hvideberg', points: 96, playerName: 'US POSTAL', raceName: 'Oman' },
  { cyclist: 'Vanghelewe', points: 48, playerName: 'US POSTAL', raceName: 'Oman' },
  { cyclist: 'Ibon Ruiz', points: 74, playerName: 'TEAM CHARLOTTE', raceName: 'Itzulia' },
];

export const WITHDRAWALS_2026: WithdrawalRecord[] = [
  {
    playerName: 'US POSTAL',
    total: 13,
    races: {
      'TDU': 'Narváez, Van Poppel',
      'Alula': '0',
      'CV': '0',
      'Besseges': 'Groenewegen',
      'Omán': '0',
      'UAE Tour': '0',
      'Algarve': 'Morgado',
      'Ruta del Sol': 'Laporte',
      'PN': 'Girmay, Bol, Ayuso, Arndt',
      'Tirreno': '0',
      'Volta': 'Pidcock',
      'Itzulia': 'del Toro, Okamika, Veistroffer',
      'Romandía': '0',
      'Giro': '0',
      'Dauphiné': '0',
      'Suiza': '0',
      'Tour': '0',
      'Polonia': '0',
      'Renewi': '0',
      'Vuelta': '0'
    }
  },
  {
    playerName: 'VOXDALÁS',
    total: 17,
    races: {
      'TDU': 'Narváez, Strong, Torres, Van der Meulen',
      'Alula': 'no la hizo',
      'CV': 'Cian',
      'Besseges': 'Groenewegen, Biermans',
      'Omán': 'Oliveira, Bettiol',
      'UAE Tour': '0',
      'Algarve': '0',
      'Ruta del Sol': '0',
      'PN': 'Girmay, Onley',
      'Tirreno': '0',
      'Volta': 'Pidcock, Lutsenko, Patrick Gamper',
      'Itzulia': 'Tulett, Elósegui, Ermakov',
      'Romandía': '0',
      'Giro': '0',
      'Dauphiné': '0',
      'Suiza': '0',
      'Tour': '0',
      'Polonia': '0',
      'Renewi': '0',
      'Vuelta': '0'
    }
  },
  {
    playerName: 'LA GALIA',
    total: 17,
    races: {
      'TDU': 'Narváez, Van Etvelt',
      'Alula': '0',
      'CV': 'Pedersen',
      'Besseges': 'Van Hemelen, Pringle',
      'Omán': 'Lemmen',
      'UAE Tour': '0',
      'Algarve': '0',
      'Ruta del Sol': '0',
      'PN': 'Ayuso, Onley, Costiou, Pluimers y F. Christen',
      'Tirreno': 'Van Wilder, Kron, Strong',
      'Volta': 'Pidcock',
      'Itzulia': 'del Toro, Labrosse',
      'Romandía': '0',
      'Giro': '0',
      'Dauphiné': '0',
      'Suiza': '0',
      'Tour': '0',
      'Polonia': '0',
      'Renewi': '0',
      'Vuelta': '0'
    }
  },
  {
    playerName: 'TEAM CHARLOTTE',
    total: 15,
    races: {
      'TDU': 'Narváez, Van Eetvelt, Van Poppel',
      'Alula': "D'Amato",
      'CV': 'Foss',
      'Besseges': 'Crabbe, Pringle, Parisini',
      'Omán': '0',
      'UAE Tour': '0',
      'Algarve': '0',
      'Ruta del Sol': 'Laporte',
      'PN': 'Ayuso, Bol',
      'Tirreno': '0',
      'Volta': '0',
      'Itzulia': 'Ayuso, del Toro, Brenner, Fernández',
      'Romandía': '0',
      'Giro': '0',
      'Dauphiné': '0',
      'Suiza': '0',
      'Tour': '0',
      'Polonia': '0',
      'Renewi': '0',
      'Vuelta': '0'
    }
  }
];

export const RACES_2026: Race[] = [
  { id: 'r_tdu', name: 'Tour Down Under', categoryId: 'c3', date: '2026-01-20', status: RaceStatus.PLAYED },
  { id: 'r_alula', name: 'Alula Tour', categoryId: 'c4', date: '2026-01-27', status: RaceStatus.PLAYED },
  { id: 'r_besseges', name: 'Etoile de Bessèges', categoryId: 'c4', date: '2026-02-04', status: RaceStatus.PLAYED },
  { id: 'r_valenciana', name: 'Comunidad Valenciana', categoryId: 'c4', date: '2026-02-04', status: RaceStatus.PLAYED },
  { id: 'r_oman', name: 'Tour de Omán', categoryId: 'c4', date: '2026-02-10', status: RaceStatus.PLAYED },
  { id: 'r_uae', name: 'UAE Tour', categoryId: 'c3', date: '2026-02-16', status: RaceStatus.PLAYED },
  { id: 'r_alg', name: 'Vuelta al Algarve', categoryId: 'c4', date: '2026-02-18', status: RaceStatus.PLAYED },
  { id: 'r_sol', name: 'Ruta del Sol', categoryId: 'c4', date: '2026-02-18', status: RaceStatus.PLAYED },
  { id: 'r_pn', name: 'París-Niza', categoryId: 'c2', date: '2026-03-08', status: RaceStatus.PLAYED },
  { id: 'r_ta', name: 'Tirreno-Adriático', categoryId: 'c2', date: '2026-03-09', status: RaceStatus.PLAYED },
  { id: 'r_cat', name: 'Volta a Catalunya', categoryId: 'c2', date: '2026-03-23', status: RaceStatus.PLAYED },
  { id: 'r_itz', name: 'Itzulia Basque Country', categoryId: 'c2', date: '2026-04-06', status: RaceStatus.PLAYED },
  { id: 'r_rom', name: 'Tour de Romandía', categoryId: 'c3', date: '2026-04-28', status: RaceStatus.PLAYED },
  { id: 'r_giro', name: "Giro d'Italia", categoryId: 'c1', date: '2026-05-08', status: RaceStatus.PLAYED },
  { id: 'r_dau', name: 'Critérium du Dauphiné', categoryId: 'c2', date: '2026-06-07', status: RaceStatus.PLAYED },
  { id: 'r_sui', name: 'Tour de Suiza', categoryId: 'c3', date: '2026-06-17', status: RaceStatus.PLAYED },
  { id: 'r_tour', name: 'Tour de France', categoryId: 'c1', date: '2026-07-04', status: RaceStatus.PLAYED },
  { id: 'r_pol', name: 'Tour de Polonia', categoryId: 'c3', date: '2026-08-03', status: RaceStatus.PLAYED },
  { id: 'r_ren', name: 'Renewi Tour', categoryId: 'c3', date: '2026-08-19', status: RaceStatus.PLAYED },
  { id: 'r_vuelta', name: 'Vuelta a España', categoryId: 'c1', date: '2026-08-22', status: RaceStatus.PLAYED },
];

export const RESULTS_2026: Result[] = [
  // TDU
  { id: 'res_1', raceId: 'r_tdu', playerId: 'p1', points: 6 },
  { id: 'res_2', raceId: 'r_tdu', playerId: 'p2', points: 1 },
  { id: 'res_3', raceId: 'r_tdu', playerId: 'p3', points: 3 },
  { id: 'res_4', raceId: 'r_tdu', playerId: 'p4', points: 2 },
  // Alula
  { id: 'res_5', raceId: 'r_alula', playerId: 'p1', points: 2 },
  { id: 'res_6', raceId: 'r_alula', playerId: 'p2', points: 0 },
  { id: 'res_7', raceId: 'r_alula', playerId: 'p3', points: 1 },
  { id: 'res_8', raceId: 'r_alula', playerId: 'p4', points: 3 },
  // Besseges
  { id: 'res_9', raceId: 'r_besseges', playerId: 'p1', points: 2 },
  { id: 'res_10', raceId: 'r_besseges', playerId: 'p2', points: 1 },
  { id: 'res_11', raceId: 'r_besseges', playerId: 'p3', points: 0 },
  { id: 'res_12', raceId: 'r_besseges', playerId: 'p4', points: 4 },
  // Valenciana
  { id: 'res_13', raceId: 'r_valenciana', playerId: 'p1', points: 7 },
  { id: 'res_14', raceId: 'r_valenciana', playerId: 'p2', points: 0 },
  { id: 'res_15', raceId: 'r_valenciana', playerId: 'p3', points: 2 },
  { id: 'res_16', raceId: 'r_valenciana', playerId: 'p4', points: 1 },
  // Oman
  { id: 'res_17', raceId: 'r_oman', playerId: 'p1', points: 1 },
  { id: 'res_18', raceId: 'r_oman', playerId: 'p2', points: 0 },
  { id: 'res_19', raceId: 'r_oman', playerId: 'p3', points: 4 },
  { id: 'res_20', raceId: 'r_oman', playerId: 'p4', points: 2 },
  // UAE
  { id: 'res_21', raceId: 'r_uae', playerId: 'p1', points: 2 },
  { id: 'res_22', raceId: 'r_uae', playerId: 'p2', points: 1 },
  { id: 'res_23', raceId: 'r_uae', playerId: 'p3', points: 3 },
  { id: 'res_24', raceId: 'r_uae', playerId: 'p4', points: 5 },
  // Sol
  { id: 'res_25', raceId: 'r_sol', playerId: 'p1', points: 3 },
  { id: 'res_26', raceId: 'r_sol', playerId: 'p2', points: 0 },
  { id: 'res_27', raceId: 'r_sol', playerId: 'p3', points: 2 },
  { id: 'res_28', raceId: 'r_sol', playerId: 'p4', points: 1 },
  // Algarve
  { id: 'res_29', raceId: 'r_alg', playerId: 'p1', points: 1 },
  { id: 'res_30', raceId: 'r_alg', playerId: 'p2', points: 0 },
  { id: 'res_31', raceId: 'r_alg', playerId: 'p3', points: 3 },
  { id: 'res_32', raceId: 'r_alg', playerId: 'p4', points: 2 },
  // Paris-Nice
  { id: 'res_33', raceId: 'r_pn', playerId: 'p3', points: 10 },
  { id: 'res_34', raceId: 'r_pn', playerId: 'p2', points: 6 },
  { id: 'res_35', raceId: 'r_pn', playerId: 'p1', points: 4 },
  { id: 'res_36', raceId: 'r_pn', playerId: 'p4', points: 2 },
  // Tirreno
  { id: 'res_37', raceId: 'r_ta', playerId: 'p3', points: 9 },
  { id: 'res_38', raceId: 'r_ta', playerId: 'p1', points: 6 },
  { id: 'res_39', raceId: 'r_ta', playerId: 'p4', points: 4 },
  { id: 'res_40', raceId: 'r_ta', playerId: 'p2', points: 2 },
  // Catalunya
  { id: 'res_41', raceId: 'r_cat', playerId: 'p4', points: 9 },
  { id: 'res_42', raceId: 'r_cat', playerId: 'p2', points: 6 },
  { id: 'res_43', raceId: 'r_cat', playerId: 'p3', points: 4 },
  { id: 'res_44', raceId: 'r_cat', playerId: 'p1', points: 2 },
  // Itzulia
  { id: 'res_45', raceId: 'r_itz', playerId: 'p2', points: 9 },
  { id: 'res_46', raceId: 'r_itz', playerId: 'p1', points: 6 },
  { id: 'res_47', raceId: 'r_itz', playerId: 'p4', points: 4 },
  { id: 'res_48', raceId: 'r_itz', playerId: 'p3', points: 2 },
  // Romandia
  { id: 'res_49', raceId: 'r_rom', playerId: 'p4', points: 5 },
  { id: 'res_50', raceId: 'r_rom', playerId: 'p3', points: 3 },
  { id: 'res_51', raceId: 'r_rom', playerId: 'p2', points: 2 },
  { id: 'res_52', raceId: 'r_rom', playerId: 'p1', points: 1 },
  // Giro d'Italia
  { id: 'res_53', raceId: 'r_giro', playerId: 'p2', points: 15 },
  { id: 'res_54', raceId: 'r_giro', playerId: 'p3', points: 10 },
  { id: 'res_55', raceId: 'r_giro', playerId: 'p1', points: 7 },
  { id: 'res_56', raceId: 'r_giro', playerId: 'p4', points: 4 },
  // Dauphine
  { id: 'res_57', raceId: 'r_dau', playerId: 'p4', points: 9 },
  { id: 'res_58', raceId: 'r_dau', playerId: 'p1', points: 6 },
  { id: 'res_59', raceId: 'r_dau', playerId: 'p2', points: 4 },
  { id: 'res_60', raceId: 'r_dau', playerId: 'p3', points: 2 },
  // Suiza
  { id: 'res_61', raceId: 'r_sui', playerId: 'p1', points: 5 },
  { id: 'res_62', raceId: 'r_sui', playerId: 'p3', points: 3 },
  { id: 'res_63', raceId: 'r_sui', playerId: 'p4', points: 2 },
  { id: 'res_64', raceId: 'r_sui', playerId: 'p2', points: 1 },
  // Tour de France
  { id: 'res_65', raceId: 'r_tour', playerId: 'p4', points: 15 },
  { id: 'res_66', raceId: 'r_tour', playerId: 'p3', points: 10 },
  { id: 'res_67', raceId: 'r_tour', playerId: 'p1', points: 7 },
  { id: 'res_68', raceId: 'r_tour', playerId: 'p2', points: 4 },
  // Polonia
  { id: 'res_69', raceId: 'r_pol', playerId: 'p1', points: 8 },
  { id: 'res_70', raceId: 'r_pol', playerId: 'p3', points: 3 },
  { id: 'res_71', raceId: 'r_pol', playerId: 'p2', points: 2 },
  { id: 'res_72', raceId: 'r_pol', playerId: 'p4', points: 1 },
  // Renewi
  { id: 'res_73', raceId: 'r_ren', playerId: 'p1', points: 5 },
  { id: 'res_74', raceId: 'r_ren', playerId: 'p3', points: 3 },
  { id: 'res_75', raceId: 'r_ren', playerId: 'p2', points: 2 },
  { id: 'res_76', raceId: 'r_ren', playerId: 'p4', points: 1 },
  // Vuelta a España
  { id: 'res_77', raceId: 'r_vuelta', playerId: 'p4', points: 15 },
  { id: 'res_78', raceId: 'r_vuelta', playerId: 'p1', points: 10 },
  { id: 'res_79', raceId: 'r_vuelta', playerId: 'p2', points: 7 },
  { id: 'res_80', raceId: 'r_vuelta', playerId: 'p3', points: 4 },
];

export const MORTADELAS_2027: MortadelaEntry[] = [];

export const WITHDRAWALS_2027: WithdrawalRecord[] = [
  {
    playerName: 'US POSTAL',
    total: 0,
    races: {
      'TDU': '0', 'Alula': '0', 'CV': '0', 'Besseges': '0', 'Omán': '0',
      'UAE Tour': '0', 'Algarve': '0', 'Ruta del Sol': '0', 'PN': '0', 'Tirreno': '0',
      'Volta': '0', 'Itzulia': '0', 'Romandía': '0', 'Giro': '0', 'Dauphiné': '0',
      'Suiza': '0', 'Tour': '0', 'Polonia': '0', 'Renewi': '0', 'Vuelta': '0'
    }
  },
  {
    playerName: 'VOXDALÁS',
    total: 0,
    races: {
      'TDU': '0', 'Alula': '0', 'CV': '0', 'Besseges': '0', 'Omán': '0',
      'UAE Tour': '0', 'Algarve': '0', 'Ruta del Sol': '0', 'PN': '0', 'Tirreno': '0',
      'Volta': '0', 'Itzulia': '0', 'Romandía': '0', 'Giro': '0', 'Dauphiné': '0',
      'Suiza': '0', 'Tour': '0', 'Polonia': '0', 'Renewi': '0', 'Vuelta': '0'
    }
  },
  {
    playerName: 'LA GALIA',
    total: 0,
    races: {
      'TDU': '0', 'Alula': '0', 'CV': '0', 'Besseges': '0', 'Omán': '0',
      'UAE Tour': '0', 'Algarve': '0', 'Ruta del Sol': '0', 'PN': '0', 'Tirreno': '0',
      'Volta': '0', 'Itzulia': '0', 'Romandía': '0', 'Giro': '0', 'Dauphiné': '0',
      'Suiza': '0', 'Tour': '0', 'Polonia': '0', 'Renewi': '0', 'Vuelta': '0'
    }
  },
  {
    playerName: 'TEAM CHARLOTTE',
    total: 0,
    races: {
      'TDU': '0', 'Alula': '0', 'CV': '0', 'Besseges': '0', 'Omán': '0',
      'UAE Tour': '0', 'Algarve': '0', 'Ruta del Sol': '0', 'PN': '0', 'Tirreno': '0',
      'Volta': '0', 'Itzulia': '0', 'Romandía': '0', 'Giro': '0', 'Dauphiné': '0',
      'Suiza': '0', 'Tour': '0', 'Polonia': '0', 'Renewi': '0', 'Vuelta': '0'
    }
  }
];

export const RACES_2027: Race[] = [
  { id: 'r27_tdu', name: 'Tour Down Under', categoryId: 'c3', date: '2027-01-19', status: RaceStatus.UPCOMING },
  { id: 'r27_alula', name: 'Alula Tour', categoryId: 'c4', date: '2027-01-26', status: RaceStatus.UPCOMING },
  { id: 'r27_besseges', name: 'Etoile de Bessèges', categoryId: 'c4', date: '2027-02-03', status: RaceStatus.UPCOMING },
  { id: 'r27_valenciana', name: 'Comunidad Valenciana', categoryId: 'c4', date: '2027-02-03', status: RaceStatus.UPCOMING },
  { id: 'r27_oman', name: 'Tour de Omán', categoryId: 'c4', date: '2027-02-09', status: RaceStatus.UPCOMING },
  { id: 'r27_uae', name: 'UAE Tour', categoryId: 'c3', date: '2027-02-15', status: RaceStatus.UPCOMING },
  { id: 'r27_alg', name: 'Vuelta al Algarve', categoryId: 'c4', date: '2027-02-17', status: RaceStatus.UPCOMING },
  { id: 'r27_sol', name: 'Ruta del Sol', categoryId: 'c4', date: '2027-02-17', status: RaceStatus.UPCOMING },
  { id: 'r27_pn', name: 'París-Niza', categoryId: 'c2', date: '2027-03-07', status: RaceStatus.UPCOMING },
  { id: 'r27_ta', name: 'Tirreno-Adriático', categoryId: 'c2', date: '2027-03-08', status: RaceStatus.UPCOMING },
  { id: 'r27_cat', name: 'Volta a Catalunya', categoryId: 'c2', date: '2027-03-22', status: RaceStatus.UPCOMING },
  { id: 'r27_itz', name: 'Itzulia Basque Country', categoryId: 'c2', date: '2027-04-05', status: RaceStatus.UPCOMING },
  { id: 'r27_rom', name: 'Tour de Romandía', categoryId: 'c3', date: '2027-04-27', status: RaceStatus.UPCOMING },
  { id: 'r27_giro', name: "Giro d'Italia", categoryId: 'c1', date: '2027-05-08', status: RaceStatus.UPCOMING },
  { id: 'r27_dau', name: 'Critérium du Dauphiné', categoryId: 'c2', date: '2027-06-06', status: RaceStatus.UPCOMING },
  { id: 'r27_sui', name: 'Tour de Suiza', categoryId: 'c3', date: '2027-06-13', status: RaceStatus.UPCOMING },
  { id: 'r27_tour', name: 'Tour de France', categoryId: 'c1', date: '2027-07-03', status: RaceStatus.UPCOMING },
  { id: 'r27_pol', name: 'Tour de Polonia', categoryId: 'c3', date: '2027-08-02', status: RaceStatus.UPCOMING },
  { id: 'r27_ren', name: 'Renewi Tour', categoryId: 'c3', date: '2027-08-18', status: RaceStatus.UPCOMING },
  { id: 'r27_vuelta', name: 'Vuelta a España', categoryId: 'c1', date: '2027-08-21', status: RaceStatus.UPCOMING },
];

export const RESULTS_2027: Result[] = [];

export interface SeasonData {
  year: '2026' | '2027';
  title: string;
  isFinished: boolean;
  races: Race[];
  results: Result[];
  mortadelas: MortadelaEntry[];
  withdrawals: WithdrawalRecord[];
  champion?: {
    playerId: string;
    playerName: string;
    points: number;
    grandTours: number;
    reason: string;
  };
}

export const SEASONS_DATA: Record<'2026' | '2027', SeasonData> = {
  '2026': {
    year: '2026',
    title: 'Temporada 2026',
    isFinished: true,
    races: RACES_2026,
    results: RESULTS_2026,
    mortadelas: MORTADELAS_2026,
    withdrawals: WITHDRAWALS_2026,
    champion: {
      playerId: 'p4',
      playerName: 'LA GALIA',
      points: 91,
      grandTours: 2,
      reason: 'Ganador por desempate oficial en Grandes Vueltas (Tour de Francia y Vuelta a España)'
    }
  },
  '2027': {
    year: '2027',
    title: 'Temporada 2027',
    isFinished: false,
    races: RACES_2027,
    results: RESULTS_2027,
    mortadelas: MORTADELAS_2027,
    withdrawals: WITHDRAWALS_2027
  }
};

// Legacy compatibility exports
export const RACES = RACES_2026;
export const RESULTS = RESULTS_2026;
export const MOCK_RESULTS = RESULTS_2026;
export const MORTADELAS = MORTADELAS_2026;
export const WITHDRAWALS = WITHDRAWALS_2026;
