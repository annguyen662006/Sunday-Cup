import { create } from 'zustand';
import { Team, Match, Player, MatchEvent } from '../types';
import { supabase } from '../lib/supabase';

interface StoreState {
  teams: Team[];
  matches: Match[];
  players: Player[];
  isLoading: boolean;
  fetchData: () => Promise<void>;
  updateMatchScore: (matchId: number, homeScore: number, awayScore: number) => Promise<void>;
  addMatch: (match: Omit<Match, 'id' | 'status' | 'homeScore' | 'awayScore' | 'events'>) => Promise<void>;
  updateMatchStatus: (matchId: number, status: 'pending' | 'live' | 'played') => Promise<void>;
  addMatchEvent: (matchId: number, event: Omit<MatchEvent, 'id'>) => Promise<void>;
  removeLastMatchEvent: (matchId: number, teamId: string) => Promise<void>;
  deleteMatch: (matchId: number) => Promise<void>;
  addTeam: (team: Omit<Team, 'id'> & { id?: string }) => Promise<void>;
  updateTeam: (id: string, team: Partial<Team>) => Promise<void>;
  deleteTeam: (id: string) => Promise<void>;
  addPlayer: (player: Omit<Player, 'id'>) => Promise<void>;
  updatePlayer: (id: number, player: Partial<Player>) => Promise<void>;
  deletePlayer: (id: number) => Promise<void>;
}

export const useStore = create<StoreState>()((set, get) => ({
  teams: [],
  matches: [],
  players: [],
  isLoading: false,

  fetchData: async () => {
    set({ isLoading: true });
    try {
      const [teamsRes, playersRes, matchesRes] = await Promise.all([
        supabase.from('teams').select('*'),
        supabase.from('players').select('*'),
        supabase.from('matches').select('*')
      ]);

      if (teamsRes.error) throw teamsRes.error;
      if (playersRes.error) throw playersRes.error;
      if (matchesRes.error) throw matchesRes.error;

      // Map snake_case to camelCase
      const teams = teamsRes.data.map(t => ({
        id: t.id,
        name: t.name,
        shortName: t.short_name,
        logo: t.logo
      }));

      const players = playersRes.data.map(p => ({
        id: p.id,
        name: p.name,
        teamId: p.team_id,
        birthYear: p.birth_year,
        avatar: p.avatar,
        goals: p.goals,
        assists: p.assists
      }));

      const matches = matchesRes.data.map(m => ({
        id: m.id,
        homeId: m.home_id,
        awayId: m.away_id,
        homeScore: m.home_score,
        awayScore: m.away_score,
        status: m.status,
        round: m.round,
        date: m.date,
        events: m.events || []
      }));

      set({ teams, players, matches, isLoading: false });
    } catch (error) {
      console.error('Error fetching data:', error);
      set({ isLoading: false });
    }
  },

  updateMatchScore: async (matchId, homeScore, awayScore) => {
    set((state) => ({
      matches: state.matches.map((m) =>
        m.id === matchId ? { ...m, homeScore, awayScore } : m
      ),
    }));
    await supabase
      .from('matches')
      .update({ home_score: homeScore, away_score: awayScore })
      .eq('id', matchId);
  },

  addMatch: async (match) => {
    const newMatch = {
      id: Date.now(),
      home_id: match.homeId,
      away_id: match.awayId,
      home_score: 0,
      away_score: 0,
      status: 'live',
      round: match.round,
      date: match.date,
      events: []
    };

    set((state) => ({
      matches: [
        ...state.matches,
        {
          ...match,
          id: newMatch.id,
          status: 'live',
          homeScore: 0,
          awayScore: 0,
          events: [],
        },
      ],
    }));

    await supabase.from('matches').insert([newMatch]);
  },

  updateMatchStatus: async (matchId, status) => {
    set((state) => ({
      matches: state.matches.map((m) =>
        m.id === matchId ? { ...m, status } : m
      ),
    }));
    await supabase
      .from('matches')
      .update({ status })
      .eq('id', matchId);
  },

  addMatchEvent: async (matchId, event) => {
    const state = get();
    const match = state.matches.find(m => m.id === matchId);
    if (!match) return;

    const newEvent = { ...event, id: Math.random().toString(36).substr(2, 9) };
    const events = [...(match.events || []), newEvent];
    const homeScore = match.homeId === event.teamId ? (match.homeScore || 0) + 1 : match.homeScore;
    const awayScore = match.awayId === event.teamId ? (match.awayScore || 0) + 1 : match.awayScore;

    set((state) => ({
      matches: state.matches.map((m) =>
        m.id === matchId ? { ...m, events, homeScore, awayScore } : m
      ),
      players: state.players.map((p) =>
        p.id === event.playerId && event.type === 'goal'
          ? { ...p, goals: (p.goals || 0) + 1 }
          : p
      ),
    }));

    await supabase
      .from('matches')
      .update({ events, home_score: homeScore, away_score: awayScore })
      .eq('id', matchId);

    if (event.type === 'goal') {
      const player = state.players.find(p => p.id === event.playerId);
      if (player) {
        await supabase
          .from('players')
          .update({ goals: (player.goals || 0) + 1 })
          .eq('id', event.playerId);
      }
    }
  },

  removeLastMatchEvent: async (matchId, teamId) => {
    const state = get();
    const match = state.matches.find(m => m.id === matchId);
    if (!match || !match.events) return;

    const teamEvents = match.events.filter(e => e.teamId === teamId);
    if (teamEvents.length === 0) return;
    
    const lastEvent = teamEvents[teamEvents.length - 1];
    const events = match.events.filter(e => e.id !== lastEvent.id);
    const homeScore = match.homeId === teamId ? Math.max(0, (match.homeScore || 0) - 1) : match.homeScore;
    const awayScore = match.awayId === teamId ? Math.max(0, (match.awayScore || 0) - 1) : match.awayScore;

    set((state) => ({
      matches: state.matches.map((m) =>
        m.id === matchId ? { ...m, events, homeScore, awayScore } : m
      ),
      players: state.players.map((p) =>
        p.id === lastEvent.playerId && lastEvent.type === 'goal'
          ? { ...p, goals: Math.max(0, (p.goals || 0) - 1) }
          : p
      ),
    }));

    await supabase
      .from('matches')
      .update({ events, home_score: homeScore, away_score: awayScore })
      .eq('id', matchId);

    if (lastEvent.type === 'goal') {
      const player = state.players.find(p => p.id === lastEvent.playerId);
      if (player) {
        await supabase
          .from('players')
          .update({ goals: Math.max(0, (player.goals || 0) - 1) })
          .eq('id', lastEvent.playerId);
      }
    }
  },

  deleteMatch: async (matchId) => {
    const state = get();
    const matchToDelete = state.matches.find(m => m.id === matchId);
    if (!matchToDelete) return;

    const playerGoalReductions: Record<number, number> = {};
    if (matchToDelete.events) {
      matchToDelete.events.forEach(event => {
        if (event.type === 'goal') {
          playerGoalReductions[event.playerId] = (playerGoalReductions[event.playerId] || 0) + 1;
        }
      });
    }

    set((state) => ({
      matches: state.matches.filter(m => m.id !== matchId),
      players: state.players.map(p => {
        if (playerGoalReductions[p.id]) {
          return { ...p, goals: Math.max(0, (p.goals || 0) - playerGoalReductions[p.id]) };
        }
        return p;
      }),
    }));

    await supabase.from('matches').delete().eq('id', matchId);

    for (const [playerId, reduction] of Object.entries(playerGoalReductions)) {
      const player = state.players.find(p => p.id === Number(playerId));
      if (player) {
        await supabase
          .from('players')
          .update({ goals: Math.max(0, (player.goals || 0) - reduction) })
          .eq('id', Number(playerId));
      }
    }
  },

  addTeam: async (team) => {
    const newTeam = {
      id: team.id || Math.random().toString(36).substr(2, 9),
      name: team.name,
      short_name: team.shortName,
      logo: team.logo
    };

    set((state) => ({
      teams: [...state.teams, { ...team, id: newTeam.id }],
    }));

    await supabase.from('teams').insert([newTeam]);
  },

  updateTeam: async (id, team) => {
    set((state) => ({
      teams: state.teams.map((t) => (t.id === id ? { ...t, ...team } : t)),
    }));

    const updates: any = {};
    if (team.name !== undefined) updates.name = team.name;
    if (team.shortName !== undefined) updates.short_name = team.shortName;
    if (team.logo !== undefined) updates.logo = team.logo;

    await supabase.from('teams').update(updates).eq('id', id);
  },

  deleteTeam: async (id) => {
    set((state) => ({
      teams: state.teams.filter((t) => t.id !== id),
      players: state.players.filter((p) => p.teamId !== id),
      matches: state.matches.filter((m) => m.homeId !== id && m.awayId !== id),
    }));

    await supabase.from('teams').delete().eq('id', id);
  },

  addPlayer: async (player) => {
    const newPlayer = {
      id: Date.now(),
      name: player.name,
      team_id: player.teamId,
      birth_year: player.birthYear,
      avatar: player.avatar,
      goals: player.goals || 0,
      assists: player.assists || 0
    };

    set((state) => ({
      players: [...state.players, { ...player, id: newPlayer.id }],
    }));

    await supabase.from('players').insert([newPlayer]);
  },

  updatePlayer: async (id, player) => {
    set((state) => ({
      players: state.players.map((p) => (p.id === id ? { ...p, ...player } : p)),
    }));

    const updates: any = {};
    if (player.name !== undefined) updates.name = player.name;
    if (player.teamId !== undefined) updates.team_id = player.teamId;
    if (player.birthYear !== undefined) updates.birth_year = player.birthYear;
    if (player.avatar !== undefined) updates.avatar = player.avatar;
    if (player.goals !== undefined) updates.goals = player.goals;
    if (player.assists !== undefined) updates.assists = player.assists;

    await supabase.from('players').update(updates).eq('id', id);
  },

  deletePlayer: async (id) => {
    set((state) => ({
      players: state.players.filter((p) => p.id !== id),
    }));

    await supabase.from('players').delete().eq('id', id);
  },
}));
