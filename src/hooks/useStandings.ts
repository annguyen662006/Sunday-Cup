import { useMemo } from 'react';
import { Match, Team, TeamStanding } from '../types';

export const useStandings = (matches: Match[], teams: Team[]) => {
  return useMemo(() => {
    const standingsMap = new Map<string, TeamStanding>();

    // Initialize standings for all teams
    teams.forEach((team) => {
      standingsMap.set(team.id, {
        teamId: team.id,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
      });
    });

    // Calculate standings based on played matches
    matches.forEach((match) => {
      if (match.status === 'played' && match.homeScore !== null && match.awayScore !== null) {
        const homeTeam = standingsMap.get(match.homeId);
        const awayTeam = standingsMap.get(match.awayId);

        if (homeTeam && awayTeam) {
          homeTeam.played += 1;
          awayTeam.played += 1;

          homeTeam.goalsFor += match.homeScore;
          homeTeam.goalsAgainst += match.awayScore;
          awayTeam.goalsFor += match.awayScore;
          awayTeam.goalsAgainst += match.homeScore;

          if (match.homeScore > match.awayScore) {
            homeTeam.won += 1;
            homeTeam.points += 3;
            awayTeam.lost += 1;
          } else if (match.homeScore < match.awayScore) {
            awayTeam.won += 1;
            awayTeam.points += 3;
            homeTeam.lost += 1;
          } else {
            homeTeam.drawn += 1;
            homeTeam.points += 1;
            awayTeam.drawn += 1;
            awayTeam.points += 1;
          }
        }
      }
    });

    // Calculate goal difference and convert to array
    const standingsArray = Array.from(standingsMap.values()).map((standing) => {
      standing.goalDifference = standing.goalsFor - standing.goalsAgainst;
      return standing;
    });

    // Sort: Points DESC -> GD DESC -> GF DESC
    standingsArray.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      return b.goalsFor - a.goalsFor;
    });

    return standingsArray;
  }, [matches, teams]);
};
