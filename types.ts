
export type Category = {
  id: string;
  name: string;
};

export type Player = {
  id: string;
  name: string;
  color: string;
};

export enum RaceStatus {
  PLAYED = 'played',
  UPCOMING = 'upcoming'
}

export type Race = {
  id: string;
  name: string;
  categoryId: string;
  date: string;
  status: RaceStatus;
};

export type Result = {
  id: string;
  raceId: string;
  playerId: string;
  points: number;
};

export type MortadelaEntry = {
  cyclist: string;
  points: number;
  playerName: string;
  raceName: string;
};

export type WithdrawalRecord = {
  playerName: string;
  races: {
    [raceName: string]: string; // Lista de ciclistas o "0" / "no la hizo"
  };
  total: number;
};

export type GlobalStats = {
  playerId: string;
  totalPoints: number;
  racesWon: number;
  averagePoints: number;
};

export type ChartDataPoint = {
  raceName: string;
  date: string;
  [key: string]: string | number;
};

export type LeagueSummary = {
  leaderName: string;
  leaderColor: string;
  totalRaces: number;
  completedRaces: number;
  topScore: number;
  topScorePlayer: string;
};
