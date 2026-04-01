export interface User {
  id: string;
  username: string;
  role: 'admin' | 'user';
  is_first_login: boolean;
  last_login?: string;
  total_time?: number;
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  logo: string;
}

export interface MatchEvent {
  id: string;
  type: 'goal';
  teamId: string;
  playerId: number | null;
  timestamp: string;
}

export interface Tournament {
  id: string;
  name: string;
}

export interface Stage {
  id: string;
  tournamentId: string;
  name: string;
  date: string;
}

export interface Round {
  id: string;
  stageId: string;
  name: string;
  date?: string;
}

export interface Match {
  id: number;
  roundId: string;
  homeId: string;
  awayId: string;
  homeScore: number | null;
  awayScore: number | null;
  status: 'played' | 'pending' | 'live';
  events?: MatchEvent[];
}

export interface Player {
  id: number;
  name: string;
  teamId: string;
  goals: number;
  assists: number;
  avatar?: string;
  birthYear?: number;
}

export interface TeamStanding {
  teamId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}
