export interface User {
  id: string;
  username: string;
  role: 'admin' | 'user';
  is_first_login: boolean;
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
  playerId: number;
  timestamp: string;
}

export interface Match {
  id: number;
  round: number;
  date: string;
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
