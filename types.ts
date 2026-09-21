
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
  grandToursWon?: number;
  averagePoints: number;
};

export type ChartDataPoint = {
  raceName: string;
  date: string;
  [key: string]: string | number;
};

export type LeaderChronologyEntry = {
  raceNumber: number;
  raceName: string;
  date: string;
  leaderName: string;
  leaderColor: string;
  points: number;
  gapWithSecond: number;
  isTie: boolean;
};

export type PlayerLeadershipStats = {
  playerName: string;
  color: string;
  racesAsLeader: number;
  consecutiveRaces?: number;
  consecutiveDays: number;
  dateRangeText?: string;
};

export type LeagueSummary = {
  leaderName: string;
  leaderColor: string;
  totalRaces: number;
  completedRaces: number;
  mostWinsPlayers: string[];
  mostWinsCount: number;
  leadershipStats?: PlayerLeadershipStats[];
  longestStreakPlayer?: {
    playerName: string;
    color?: string;
    days: number;
    races: number;
    periodText?: string;
    startDate?: string;
    endDate?: string;
  };
  chronology?: LeaderChronologyEntry[];
};
