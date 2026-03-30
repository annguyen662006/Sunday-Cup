import { useStore } from '../store/useStore';
import { useStandings } from '../hooks/useStandings';
import { vi } from '../lang/vi';
import { Trophy, ArrowRight, Shield, ShieldAlert, ShieldCheck } from 'lucide-react';
import { cn } from '../utils/cn';

export const Dashboard = () => {
  const { matches, teams, players } = useStore();
  const standings = useStandings(matches, teams);

  const topScorers = [...players].sort((a, b) => b.goals - a.goals).slice(0, 5);
  const topAssists = [...players].sort((a, b) => b.assists - a.assists).slice(0, 5);

  const getTeamLogo = (teamId: string) => teams.find(t => t.id === teamId)?.logo;
  const getTeamName = (teamId: string) => teams.find(t => t.id === teamId)?.name;

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-700">
      {/* Hero Header */}
      <section className="relative overflow-hidden rounded-2xl md:rounded-[2rem] p-6 md:p-12 bg-surface-container-low/40 backdrop-blur-2xl border border-white/5">
        <div className="relative z-10 max-w-4xl">
          <span className="inline-block px-3 py-1 md:px-4 md:py-1 rounded-full bg-primary/10 text-primary text-[10px] md:text-xs font-bold tracking-widest uppercase mb-3 md:mb-4 border border-primary/20">
            {vi.dashboard.currentSeason}
          </span>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black font-headline text-white leading-tight neon-glow-primary">
            {vi.dashboard.heroTitle}
          </h1>
        </div>
        <div className="absolute -right-20 -top-20 w-64 h-64 md:w-96 md:h-96 bg-primary/10 rounded-full blur-[80px] md:blur-[100px]"></div>
        <div className="absolute -bottom-20 -left-20 w-48 h-48 md:w-80 md:h-80 bg-secondary/5 rounded-full blur-[60px] md:blur-[80px]"></div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        {/* Main Standings Table */}
        <div className="lg:col-span-8 space-y-6 min-w-0">
          <div className="bg-surface-container-low/40 backdrop-blur-xl rounded-2xl md:rounded-3xl p-4 md:p-8 border border-white/5 shadow-2xl">
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <div className="flex items-center gap-2 md:gap-3">
                <Trophy className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                <h3 className="text-lg md:text-xl font-bold font-headline">{vi.dashboard.standingsTitle}</h3>
              </div>
              <button className="text-[10px] md:text-xs font-bold text-primary flex items-center gap-1 md:gap-2 hover:underline">
                <span className="hidden sm:inline">{vi.dashboard.viewDetailedStats}</span>
                <span className="sm:hidden">Chi tiết</span>
                <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
              </button>
            </div>
            
            <div className="overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0">
              <table className="w-full text-left border-separate border-spacing-y-2 md:border-spacing-y-3 min-w-[500px]">
                <thead>
                  <tr className="text-on-surface-variant text-[10px] md:text-xs font-bold tracking-widest uppercase">
                    <th className="px-3 md:px-6 pb-2">{vi.dashboard.rank}</th>
                    <th className="px-2 md:px-4 pb-2">{vi.dashboard.teamName}</th>
                    <th className="px-2 md:px-4 pb-2 text-center">{vi.dashboard.played}</th>
                    <th className="px-2 md:px-4 pb-2 text-center">{vi.dashboard.goalDiff}</th>
                    <th className="px-2 md:px-4 pb-2 text-center">{vi.dashboard.points}</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-white/50">
                        Chưa có dữ liệu đội bóng. Vui lòng thêm đội bóng ở trang Đội bóng.
                      </td>
                    </tr>
                  ) : (
                    standings.map((team, index) => (
                      <tr
                        key={team.teamId}
                        className={cn(
                          'rounded-xl md:rounded-2xl transition-all',
                          index === 0
                            ? 'group gold-glow overflow-hidden hover:scale-[1.01]'
                            : 'bg-surface-container-highest/20 hover:bg-white/5'
                        )}
                      >
                        <td className="px-3 md:px-6 py-3 md:py-4 rounded-l-xl md:rounded-l-2xl">
                          <div
                            className={cn(
                              'w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center font-bold text-xs md:text-sm',
                              index === 0
                                ? 'bg-primary text-on-primary font-black shadow-[0_0_15px_rgba(142,255,113,0.4)]'
                                : 'bg-white/5 text-on-surface-variant border border-white/10'
                            )}
                          >
                            {index + 1}
                          </div>
                        </td>
                        <td className="px-2 md:px-4 py-3 md:py-4">
                          <div className="flex items-center gap-3 md:gap-4">
                            <div
                              className={cn(
                                'w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-white/5 flex items-center justify-center border border-white/10 transition-colors shrink-0',
                                index === 0 && 'group-hover:border-primary/50'
                              )}
                            >
                              {getTeamLogo(team.teamId) ? (
                                <img src={getTeamLogo(team.teamId)} alt={team.teamId} className="w-5 h-5 md:w-6 md:h-6 object-contain" />
                              ) : (
                                <Shield className="w-5 h-5 md:w-6 md:h-6 text-white/50" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-white font-headline text-sm md:text-base truncate">{getTeamName(team.teamId)}</p>
                              <p className="text-[8px] md:text-[10px] text-on-surface-variant uppercase tracking-widest truncate">
                                {index === 0 ? vi.dashboard.champion : index === 1 ? vi.dashboard.risingStar : vi.dashboard.localRival}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-2 md:px-4 py-3 md:py-4 text-center font-bold text-white text-sm md:text-base">{team.played}</td>
                        <td
                          className={cn(
                            'px-2 md:px-4 py-3 md:py-4 text-center font-medium text-sm md:text-base',
                            team.goalDifference > 0 ? (index === 0 ? 'text-primary' : 'text-white/70') : 'text-error'
                          )}
                        >
                          {team.goalDifference > 0 ? '+' : ''}{team.goalDifference}
                        </td>
                        <td className="px-2 md:px-4 py-3 md:py-4 text-center rounded-r-xl md:rounded-r-2xl">
                          <span
                            className={cn(
                              'text-lg md:text-xl font-black font-headline',
                              index === 0 ? 'text-primary' : 'text-white'
                            )}
                          >
                            {team.points}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Mini Sidebar Stats */}
        <div className="lg:col-span-4 space-y-6 md:space-y-8 min-w-0">
          {/* Top Scorers */}
          <div className="bg-surface-container-low/40 backdrop-blur-xl rounded-2xl md:rounded-3xl p-4 md:p-6 border border-white/5 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h3 className="text-base md:text-lg font-bold font-headline flex items-center gap-2">
                <Trophy className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                {vi.dashboard.topScorers}
              </h3>
            </div>
            <div className="space-y-3 md:space-y-4">
              {topScorers.length === 0 ? (
                <div className="text-center py-4 text-white/50 text-sm">Chưa có dữ liệu cầu thủ.</div>
              ) : (
                topScorers.map((player) => (
                  <div key={player.id} className="flex items-center justify-between p-2 md:p-3 rounded-xl md:rounded-2xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-white/10 overflow-hidden shrink-0">
                        <img src={player.avatar || `https://ui-avatars.com/api/?name=${player.name}&background=random`} alt={player.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs md:text-sm font-bold font-headline group-hover:text-primary transition-colors truncate">{player.name}</p>
                        <p className="text-[8px] md:text-[10px] text-on-surface-variant font-bold uppercase tracking-tight truncate">{getTeamName(player.teamId)}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 pl-2">
                      <p className="text-lg md:text-xl font-black font-headline text-white leading-none">{player.goals}</p>
                      <p className="text-[7px] md:text-[8px] text-primary uppercase font-black">{vi.dashboard.goals}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Top Assists */}
          <div className="bg-surface-container-low/40 backdrop-blur-xl rounded-2xl md:rounded-3xl p-4 md:p-6 border border-white/5 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h3 className="text-base md:text-lg font-bold font-headline flex items-center gap-2">
                <Trophy className="w-4 h-4 md:w-5 md:h-5 text-secondary" />
                {vi.dashboard.topAssists}
              </h3>
            </div>
            <div className="space-y-3 md:space-y-4">
              {topAssists.length === 0 ? (
                <div className="text-center py-4 text-white/50 text-sm">Chưa có dữ liệu cầu thủ.</div>
              ) : (
                topAssists.map((player) => (
                  <div key={player.id} className="flex items-center justify-between p-2 md:p-3 rounded-xl md:rounded-2xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-white/10 overflow-hidden shrink-0">
                        <img src={player.avatar || `https://ui-avatars.com/api/?name=${player.name}&background=random`} alt={player.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs md:text-sm font-bold font-headline group-hover:text-secondary transition-colors truncate">{player.name}</p>
                        <p className="text-[8px] md:text-[10px] text-on-surface-variant font-bold uppercase tracking-tight truncate">{getTeamName(player.teamId)}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 pl-2">
                      <p className="text-lg md:text-xl font-black font-headline text-white leading-none">{player.assists}</p>
                      <p className="text-[7px] md:text-[8px] text-secondary uppercase font-black">{vi.dashboard.assists}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
