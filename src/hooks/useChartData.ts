import { useMemo } from 'react';
import { Match, Team, Round, Stage } from '../types';

export const useChartData = (matches: Match[], teams: Team[], rounds: Round[], stages: Stage[]) => {
  return useMemo(() => {
    // 1. Determine date for each match
    const matchDates = new Map<number, string>();
    matches.forEach(match => {
      const round = rounds.find(r => r.id === match.roundId);
      let dateStr = round?.date;
      if (!dateStr && round) {
        const stage = stages.find(s => s.id === round.stageId);
        dateStr = stage?.date;
      }
      if (dateStr) {
        matchDates.set(match.id, dateStr);
      }
    });

    // 2. Group matches by month
    // Format: YYYY-MM
    const matchesByMonth = new Map<string, Match[]>();
    matches.forEach(match => {
      if (match.status !== 'played' || match.homeScore === null || match.awayScore === null) return;
      
      const dateStr = matchDates.get(match.id);
      if (!dateStr) return; // Skip matches without date

      const date = new Date(dateStr);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!matchesByMonth.has(monthKey)) {
        matchesByMonth.set(monthKey, []);
      }
      matchesByMonth.get(monthKey)!.push(match);
    });

    // Sort months
    const sortedMonths = Array.from(matchesByMonth.keys()).sort();

    // 3. Calculate points per month
    const pointsPerMonth: Record<string, Record<string, number>> = {};
    sortedMonths.forEach(month => {
      pointsPerMonth[month] = {};
      teams.forEach(team => {
        pointsPerMonth[month][team.id] = 0;
      });

      const monthMatches = matchesByMonth.get(month)!;
      monthMatches.forEach(match => {
        if (match.homeScore! > match.awayScore!) {
          pointsPerMonth[month][match.homeId] += 3;
        } else if (match.homeScore! < match.awayScore!) {
          pointsPerMonth[month][match.awayId] += 3;
        } else {
          pointsPerMonth[month][match.homeId] += 1;
          pointsPerMonth[month][match.awayId] += 1;
        }
      });
    });

    // 4. Format data for Bar Chart (Points by month)
    const barChartData = sortedMonths.map(month => {
      const [year, m] = month.split('-');
      const dataPoint: any = {
        name: `Tháng ${parseInt(m)}`,
        sortKey: month,
      };
      teams.forEach(team => {
        dataPoint[team.name] = pointsPerMonth[month][team.id];
      });
      return dataPoint;
    });

    // 5. Format data for Line Chart (Cumulative points)
    let cumulativePoints: Record<string, number> = {};
    teams.forEach(team => {
      cumulativePoints[team.id] = 0;
    });

    const lineChartData = sortedMonths.map(month => {
      const [year, m] = month.split('-');
      const dataPoint: any = {
        name: `Tháng ${parseInt(m)}`,
        sortKey: month,
      };
      teams.forEach(team => {
        cumulativePoints[team.id] += pointsPerMonth[month][team.id];
        dataPoint[team.name] = cumulativePoints[team.id];
      });
      return dataPoint;
    });

    // 6. Format data for Pie Chart (Total points ratio)
    const pieChartData = teams.map(team => {
      return {
        name: team.name,
        value: cumulativePoints[team.id] || 0,
        shortName: team.shortName,
        id: team.id
      };
    }).filter(t => t.value > 0);

    return {
      barChartData,
      lineChartData,
      pieChartData
    };
  }, [matches, teams, rounds, stages]);
};
