import { create } from 'zustand';
import { Team, Match, Player, MatchEvent, User, Tournament, Stage, Round } from '../types';
import { supabase } from '../lib/supabase';
import { deleteImage } from '../lib/storage';

interface StoreState {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  tournaments: Tournament[];
  stages: Stage[];
  rounds: Round[];
  teams: Team[];
  matches: Match[];
  players: Player[];
  isLoading: boolean;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  fetchData: () => Promise<void>;
  addTournament: (tournament: Omit<Tournament, 'id'>) => Promise<void>;
  updateTournament: (id: string, tournament: Partial<Tournament>) => Promise<void>;
  deleteTournament: (id: string) => Promise<void>;
  addStage: (stage: Omit<Stage, 'id'>) => Promise<void>;
  updateStage: (id: string, stage: Partial<Stage>) => Promise<void>;
  deleteStage: (id: string) => Promise<void>;
  addRound: (round: Omit<Round, 'id'>) => Promise<void>;
  updateRound: (id: string, round: Partial<Round>) => Promise<void>;
  deleteRound: (id: string) => Promise<void>;
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
  currentUser: JSON.parse(localStorage.getItem('currentUser') || 'null'),
  setCurrentUser: (user) => {
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
    }
    set({ currentUser: user });
  },
  tournaments: [],
  stages: [],
  rounds: [],
  teams: [],
  matches: [],
  players: [],
  isLoading: false,
  isDarkMode: localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches),

  toggleDarkMode: () => {
    set((state) => {
      const newIsDarkMode = !state.isDarkMode;
      if (newIsDarkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      return { isDarkMode: newIsDarkMode };
    });
  },

  fetchData: async () => {
    set({ isLoading: true });
    try {
      const [tournamentsRes, stagesRes, roundsRes, teamsRes, playersRes, matchesRes] = await Promise.all([
        supabase.from('tournaments').select('*'),
        supabase.from('stages').select('*'),
        supabase.from('rounds').select('*'),
        supabase.from('teams').select('*'),
        supabase.from('players').select('*'),
        supabase.from('matches').select('*')
      ]);

      if (tournamentsRes.error) throw tournamentsRes.error;
      if (stagesRes.error) throw stagesRes.error;
      if (roundsRes.error) throw roundsRes.error;
      if (teamsRes.error) throw teamsRes.error;
      if (playersRes.error) throw playersRes.error;
      if (matchesRes.error) throw matchesRes.error;

      const tournaments = tournamentsRes.data.map(t => ({
        id: t.id,
        name: t.name
      }));

      const stages = stagesRes.data.map(s => ({
        id: s.id,
        tournamentId: s.tournament_id,
        name: s.name,
        date: s.start_date
      }));

      const rounds = roundsRes.data.map(r => ({
        id: r.id,
        stageId: r.stage_id,
        name: r.name,
        date: r.start_date
      }));

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
        roundId: m.round_id,
        events: m.events || []
      }));

      set({ tournaments, stages, rounds, teams, players, matches, isLoading: false });
    } catch (error) {
      console.error('Error fetching data:', error);
      set({ isLoading: false });
    }
  },

  addTournament: async (tournament) => {
    const tempId = Date.now().toString();
    const tempTournament = { id: tempId, name: tournament.name };

    set((state) => ({
      tournaments: [...state.tournaments, tempTournament],
    }));

    const newTournament = {
      name: tournament.name
    };

    const { data, error } = await supabase.from('tournaments').insert([newTournament]).select().single();
    if (error) {
      console.error('Error adding tournament:', error);
      set((state) => ({
        tournaments: state.tournaments.filter(t => t.id !== tempId)
      }));
    } else if (data) {
      set((state) => ({
        tournaments: state.tournaments.map(t => 
          t.id === tempId ? { ...t, id: data.id } : t
        )
      }));
    }
  },

  updateTournament: async (id, tournament) => {
    set((state) => ({
      tournaments: state.tournaments.map((t) => (t.id === id ? { ...t, ...tournament } : t)),
    }));

    await supabase.from('tournaments').update(tournament).eq('id', id);
  },

  deleteTournament: async (id) => {
    set((state) => {
      const stagesToDelete = state.stages.filter(s => s.tournamentId === id).map(s => s.id);
      const roundsToDelete = state.rounds.filter(r => stagesToDelete.includes(r.stageId)).map(r => r.id);
      
      return {
        tournaments: state.tournaments.filter((t) => t.id !== id),
        stages: state.stages.filter((s) => s.tournamentId !== id),
        rounds: state.rounds.filter((r) => !stagesToDelete.includes(r.stageId)),
        matches: state.matches.filter((m) => !roundsToDelete.includes(m.roundId))
      };
    });

    await supabase.from('tournaments').delete().eq('id', id);
  },

  addStage: async (stage) => {
    const tempStageId = Date.now().toString();
    
    set((state) => ({
      stages: [...state.stages, { ...stage, id: tempStageId }],
    }));

    const newStage = {
      tournament_id: stage.tournamentId,
      name: stage.name,
      start_date: stage.date
    };

    const { data: stageData, error: stageError } = await supabase.from('stages').insert([newStage]).select().single();
    
    if (stageError) {
      console.error('Error adding stage:', stageError);
      set((state) => ({
        stages: state.stages.filter(s => s.id !== tempStageId)
      }));
      return;
    }

    if (stageData) {
      set((state) => ({
        stages: state.stages.map(s => 
          s.id === tempStageId ? { ...s, id: stageData.id } : s
        )
      }));

      // Auto-generate 10 rounds for the new stage
      const newRounds = Array.from({ length: 10 }).map((_, i) => ({
        stage_id: stageData.id,
        name: `Lượt ${i + 1}`
      }));

      const { data: roundsData, error: roundsError } = await supabase.from('rounds').insert(newRounds).select();
      
      if (roundsError) {
        console.error('Error adding rounds:', roundsError);
      } else if (roundsData) {
        set((state) => ({
          rounds: [
            ...state.rounds,
            ...roundsData.map(r => ({
              id: r.id,
              stageId: r.stage_id,
              name: r.name
            }))
          ]
        }));
      }
    }
  },

  updateStage: async (id, stage) => {
    set((state) => ({
      stages: state.stages.map((s) => (s.id === id ? { ...s, ...stage } : s)),
    }));

    const updates: any = {};
    if (stage.name !== undefined) updates.name = stage.name;
    if (stage.date !== undefined) updates.start_date = stage.date;
    if (stage.tournamentId !== undefined) updates.tournament_id = stage.tournamentId;

    await supabase.from('stages').update(updates).eq('id', id);
  },

  deleteStage: async (id) => {
    set((state) => {
      const roundsToDelete = state.rounds.filter(r => r.stageId === id).map(r => r.id);
      return {
        stages: state.stages.filter((s) => s.id !== id),
        rounds: state.rounds.filter((r) => r.stageId !== id),
        matches: state.matches.filter((m) => !roundsToDelete.includes(m.roundId)),
      };
    });

    await supabase.from('stages').delete().eq('id', id);
  },

  addRound: async (round) => {
    const tempId = Date.now().toString();

    set((state) => ({
      rounds: [...state.rounds, { ...round, id: tempId }],
    }));

    const newRound = {
      stage_id: round.stageId,
      name: round.name,
      start_date: round.date
    };

    const { data, error } = await supabase.from('rounds').insert([newRound]).select().single();
    if (error) {
      console.error('Error adding round:', error);
      set((state) => ({
        rounds: state.rounds.filter(r => r.id !== tempId)
      }));
    } else if (data) {
      set((state) => ({
        rounds: state.rounds.map(r => 
          r.id === tempId ? { ...r, id: data.id } : r
        )
      }));
    }
  },

  updateRound: async (id, round) => {
    set((state) => ({
      rounds: state.rounds.map((r) => (r.id === id ? { ...r, ...round } : r)),
    }));

    const updates: any = {};
    if (round.name !== undefined) updates.name = round.name;
    if (round.stageId !== undefined) updates.stage_id = round.stageId;
    if (round.date !== undefined) updates.start_date = round.date;

    await supabase.from('rounds').update(updates).eq('id', id);
  },

  deleteRound: async (id) => {
    set((state) => ({
      rounds: state.rounds.filter((r) => r.id !== id),
      matches: state.matches.filter((m) => m.roundId !== id),
    }));

    await supabase.from('rounds').delete().eq('id', id);
  },

  updateMatchScore: async (matchId, homeScore, awayScore) => {
    set((state) => ({
      matches: state.matches.map((m) =>
        m.id === matchId ? { ...m, homeScore, awayScore } : m
      ),
    }));
    const { error } = await supabase
      .from('matches')
      .update({ home_score: homeScore, away_score: awayScore })
      .eq('id', matchId);
    if (error) {
      console.error('Error updating match score:', error);
    }
  },

  addMatch: async (match) => {
    const tempId = Date.now();
    
    // Optimistic update with temporary ID
    set((state) => ({
      matches: [
        ...state.matches,
        {
          ...match,
          id: tempId,
          status: 'live',
          homeScore: 0,
          awayScore: 0,
          events: [],
        },
      ],
    }));

    const newMatch = {
      home_id: match.homeId,
      away_id: match.awayId,
      home_score: 0,
      away_score: 0,
      status: 'live',
      round_id: match.roundId,
      events: []
    };

    const { data, error } = await supabase.from('matches').insert([newMatch]).select().single();
    if (error) {
      console.error('Error adding match:', error);
      // Revert optimistic update on error
      set((state) => ({
        matches: state.matches.filter(m => m.id !== tempId)
      }));
    } else if (data) {
      // Update the temporary ID with the real ID from database
      set((state) => ({
        matches: state.matches.map(m => 
          m.id === tempId ? {
            ...m,
            id: data.id
          } : m
        )
      }));
    }
  },

  updateMatchStatus: async (matchId, status) => {
    set((state) => ({
      matches: state.matches.map((m) =>
        m.id === matchId ? { ...m, status } : m
      ),
    }));
    const { error } = await supabase
      .from('matches')
      .update({ status })
      .eq('id', matchId);
    if (error) {
      console.error('Error updating match status:', error);
    }
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

    const { error: matchError } = await supabase
      .from('matches')
      .update({ events, home_score: homeScore, away_score: awayScore })
      .eq('id', matchId);
    if (matchError) console.error('Error adding match event:', matchError);

    if (event.type === 'goal') {
      const player = state.players.find(p => p.id === event.playerId);
      if (player) {
        const { error: playerError } = await supabase
          .from('players')
          .update({ goals: (player.goals || 0) + 1 })
          .eq('id', event.playerId);
        if (playerError) console.error('Error updating player goals:', playerError);
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

    const { error: matchError } = await supabase
      .from('matches')
      .update({ events, home_score: homeScore, away_score: awayScore })
      .eq('id', matchId);
    if (matchError) console.error('Error removing match event:', matchError);

    if (lastEvent.type === 'goal') {
      const player = state.players.find(p => p.id === lastEvent.playerId);
      if (player) {
        const { error: playerError } = await supabase
          .from('players')
          .update({ goals: Math.max(0, (player.goals || 0) - 1) })
          .eq('id', lastEvent.playerId);
        if (playerError) console.error('Error updating player goals:', playerError);
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
    const tempId = team.id || Date.now().toString();

    set((state) => ({
      teams: [...state.teams, { ...team, id: tempId }],
    }));

    const newTeam = {
      name: team.name,
      short_name: team.shortName,
      logo: team.logo
    };

    const { data, error } = await supabase.from('teams').insert([newTeam]).select().single();
    if (error) {
      console.error('Error adding team:', error);
      set((state) => ({
        teams: state.teams.filter(t => t.id !== tempId)
      }));
    } else if (data) {
      set((state) => ({
        teams: state.teams.map(t => 
          t.id === tempId ? { ...t, id: data.id } : t
        )
      }));
    }
  },

  updateTeam: async (id, team) => {
    const state = get();
    const currentTeam = state.teams.find(t => t.id === id);

    // If logo is being updated and there was an old logo, delete the old one
    if (team.logo !== undefined && currentTeam?.logo && currentTeam.logo !== team.logo) {
      await deleteImage(currentTeam.logo);
    }

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
    // Get team and players to delete their images
    const state = get();
    const teamToDelete = state.teams.find(t => t.id === id);
    const playersToDelete = state.players.filter(p => p.teamId === id);

    if (teamToDelete?.logo) {
      await deleteImage(teamToDelete.logo);
    }

    for (const player of playersToDelete) {
      if (player.avatar) {
        await deleteImage(player.avatar);
      }
    }

    set((state) => ({
      teams: state.teams.filter((t) => t.id !== id),
      players: state.players.filter((p) => p.teamId !== id),
      matches: state.matches.filter((m) => m.homeId !== id && m.awayId !== id),
    }));

    // Explicitly delete matches and players from the database first to avoid foreign key constraints
    await supabase.from('matches').delete().or(`home_id.eq.${id},away_id.eq.${id}`);
    await supabase.from('players').delete().eq('team_id', id);
    await supabase.from('teams').delete().eq('id', id);
  },

  addPlayer: async (player) => {
    const tempId = Date.now();

    set((state) => ({
      players: [...state.players, { ...player, id: tempId }],
    }));

    const newPlayer = {
      name: player.name,
      team_id: player.teamId,
      birth_year: player.birthYear,
      avatar: player.avatar,
      goals: player.goals || 0,
      assists: player.assists || 0
    };

    const { data, error } = await supabase.from('players').insert([newPlayer]).select().single();
    if (error) {
      console.error('Error adding player:', error);
      set((state) => ({
        players: state.players.filter(p => p.id !== tempId)
      }));
    } else if (data) {
      set((state) => ({
        players: state.players.map(p => 
          p.id === tempId ? { ...p, id: data.id } : p
        )
      }));
    }
  },

  updatePlayer: async (id, player) => {
    const state = get();
    const currentPlayer = state.players.find(p => p.id === id);

    // If avatar is being updated and there was an old avatar, delete the old one
    if (player.avatar !== undefined && currentPlayer?.avatar && currentPlayer.avatar !== player.avatar) {
      await deleteImage(currentPlayer.avatar);
    }

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
    const state = get();
    const playerToDelete = state.players.find(p => p.id === id);
    
    if (playerToDelete?.avatar) {
      await deleteImage(playerToDelete.avatar);
    }

    set((state) => ({
      players: state.players.filter((p) => p.id !== id),
    }));

    await supabase.from('players').delete().eq('id', id);
  },
}));
