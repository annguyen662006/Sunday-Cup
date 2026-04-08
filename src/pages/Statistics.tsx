import { useState } from 'react';
import { useStore } from '../store/useStore';
import { useStandings } from '../hooks/useStandings';
import { vi } from '../lang/vi';
import { GlassCard } from '../components/GlassCard';
import { Shield, ArrowRight, ArrowLeft } from 'lucide-react';
import { cn } from '../utils/cn';
import { TeamMatchHistoryModal } from '../components/TeamMatchHistoryModal';
import { StatisticsCharts } from '../components/StatisticsCharts';

export const Statistics = () => {
  const { matches, teams } = useStore();
  const standings = useStandings(matches, teams);
  const [selectedTeamHistory, setSelectedTeamHistory] = useState<string | null>(null);
  const [showTeamCards, setShowTeamCards] = useState(false);

  const getTeamName = (teamId: string) => teams.find((t) => t.id === teamId)?.name;
  const getTeamLogo = (teamId: string) => teams.find((t) => t.id === teamId)?.logo;

  const getRecentMatches = (teamId: string) => {
    return matches
      .filter(m => (m.homeId === teamId || m.awayId === teamId) && m.status === 'played')
      .sort((a, b) => b.id - a.id)
      .slice(0, 4);
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-700 w-full">
      {!showTeamCards ? (
        <StatisticsCharts onTeamClick={() => setShowTeamCards(true)} />
      ) : (
        <div className="space-y-6">
          <button 
            onClick={() => setShowTeamCards(false)}
            className="flex items-center gap-2 text-primary hover:underline font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại biểu đồ
          </button>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 w-full animate-in slide-in-from-bottom-4 duration-500">
            {standings.length === 0 ? (
              <div className="col-span-full text-center py-12 text-on-surface/50 bg-surface-container-low/40 rounded-3xl border border-on-surface/5">
                Chưa có dữ liệu đội bóng. Vui lòng thêm đội bóng ở trang Đội bóng.
              </div>
            ) : (
              standings.map((teamStanding, index) => {
                const teamInfo = teams.find((t) => t.id === teamStanding.teamId);
                const totalGoals = teamStanding.goalsFor + teamStanding.goalsAgainst;
                const goalsForPercent = totalGoals > 0 ? (teamStanding.goalsFor / totalGoals) * 100 : 50;
                const goalsAgainstPercent = totalGoals > 0 ? (teamStanding.goalsAgainst / totalGoals) * 100 : 50;
                const recentMatches = getRecentMatches(teamStanding.teamId);
                
                return (
                  <GlassCard key={teamStanding.teamId} className="p-4 md:p-6 relative overflow-hidden h-full w-full flex flex-col">
                    <div className="absolute -right-20 -top-20 w-48 h-48 md:w-64 md:h-64 bg-primary/10 blur-[80px] md:blur-[100px] rounded-full"></div>
                    
                    <div className="flex items-center justify-between mb-6 md:mb-8 relative z-10 gap-2">
                      <div className="flex items-center gap-3 md:gap-4 min-w-0">
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-surface-container-highest flex items-center justify-center border border-on-surface/10 shadow-lg shrink-0 overflow-hidden">
                          {teamInfo?.logo ? (
                            <img src={teamInfo.logo} alt={teamInfo?.name} className="w-full h-full object-cover" />
                          ) : (
                            <Shield className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h2 className="font-headline font-extrabold text-lg sm:text-xl md:text-2xl tracking-tight truncate">{teamInfo?.name}</h2>
                          <p className="text-[10px] sm:text-xs md:text-sm text-on-surface-variant flex items-center gap-2 truncate uppercase tracking-widest">
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0"></span> <span className="truncate">{teamInfo?.shortName}</span>
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0 pl-2">
                        <p className="text-[10px] md:text-xs text-on-surface-variant uppercase tracking-tighter">{vi.statistics.winRate}</p>
                        <p className="font-headline font-black text-xl sm:text-2xl md:text-3xl text-primary">
                          {teamStanding.played ? ((teamStanding.won / teamStanding.played) * 100).toFixed(1) : 0}%
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 sm:gap-6 md:gap-12 relative z-10 mb-6 flex-1">
                      <div className="space-y-2 md:space-y-4 min-w-0">
                        <div className="flex justify-between items-end">
                          <div className="min-w-0">
                            <p className="text-[8px] md:text-[10px] uppercase font-bold text-on-surface-variant tracking-wider truncate">{vi.statistics.goalsFor}</p>
                            <p className="text-3xl sm:text-4xl md:text-5xl font-headline font-black truncate">{teamStanding.goalsFor || 0}</p>
                          </div>
                        </div>
                        <div className="w-full h-2 md:h-3 bg-on-surface/5 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-primary/40 to-primary rounded-full neon-glow-primary" style={{ width: `${goalsForPercent}%` }}></div>
                        </div>
                      </div>
                      <div className="space-y-2 md:space-y-4 min-w-0">
                        <div className="flex justify-between items-end text-right">
                          <div className="w-full min-w-0">
                            <p className="text-[8px] md:text-[10px] uppercase font-bold text-on-surface-variant tracking-wider truncate">{vi.statistics.goalsAgainst}</p>
                            <p className="text-3xl sm:text-4xl md:text-5xl font-headline font-black truncate">{teamStanding.goalsAgainst || 0}</p>
                          </div>
                        </div>
                        <div className="w-full h-2 md:h-3 bg-on-surface/5 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-secondary/40 to-secondary rounded-full" style={{ width: `${goalsAgainstPercent}%` }}></div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-auto relative z-10 border-t border-on-surface/5 pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">Lịch sử thi đấu</p>
                        <button 
                          onClick={() => setSelectedTeamHistory(teamStanding.teamId)}
                          className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1"
                        >
                          Xem thêm <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                      
                      {recentMatches.length === 0 ? (
                        <div className="text-xs text-on-surface/40 italic text-center py-2">Chưa có trận đấu</div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          {recentMatches.map(match => {
                            const isHome = match.homeId === teamStanding.teamId;
                            const opponentId = isHome ? match.awayId : match.homeId;
                            const teamScore = isHome ? match.homeScore : match.awayScore;
                            const opponentScore = isHome ? match.awayScore : match.homeScore;
                            
                            let resultColor = 'text-on-surface-variant';
                            if (teamScore !== null && opponentScore !== null) {
                              if (teamScore > opponentScore) resultColor = 'text-primary';
                              else if (teamScore < opponentScore) resultColor = 'text-error';
                            }

                            const homeTeam = teams.find(t => t.id === match.homeId);
                            const awayTeam = teams.find(t => t.id === match.awayId);

                            return (
                              <div key={match.id} className="flex items-center justify-center bg-on-surface/5 rounded-lg p-2 text-[10px] font-bold gap-1.5">
                                <span className={isHome ? resultColor : 'text-on-surface-variant'}>{homeTeam?.shortName}</span>
                                {homeTeam?.logo ? (
                                  <img src={homeTeam.logo} alt={homeTeam.shortName} className="w-3 h-3 rounded-full object-cover" />
                                ) : (
                                  <Shield className="w-3 h-3 text-on-surface-variant" />
                                )}
                                <div className="flex gap-1 mx-1">
                                  <span className={isHome ? resultColor : 'text-on-surface-variant'}>{match.homeScore}</span>
                                  <span className="text-on-surface/30">:</span>
                                  <span className={!isHome ? resultColor : 'text-on-surface-variant'}>{match.awayScore}</span>
                                </div>
                                {awayTeam?.logo ? (
                                  <img src={awayTeam.logo} alt={awayTeam.shortName} className="w-3 h-3 rounded-full object-cover" />
                                ) : (
                                  <Shield className="w-3 h-3 text-on-surface-variant" />
                                )}
                                <span className={!isHome ? resultColor : 'text-on-surface-variant'}>{awayTeam?.shortName}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </GlassCard>
                );
              })
            )}
          </div>
        </div>
      )}

      {selectedTeamHistory && (
        <TeamMatchHistoryModal
          teamId={selectedTeamHistory}
          onClose={() => setSelectedTeamHistory(null)}
        />
      )}
    </div>
  );
};
