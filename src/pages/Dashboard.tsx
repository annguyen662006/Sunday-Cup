import { useState } from 'react';
import { useStore } from '../store/useStore';
import { useStandings } from '../hooks/useStandings';
import { vi } from '../lang/vi';
import { Trophy, Shield, Maximize2, X } from 'lucide-react';
import { cn } from '../utils/cn';
import { GlassCard } from '../components/GlassCard';

export const Dashboard = () => {
  const { matches, teams, players } = useStore();
  const standings = useStandings(matches, teams);
  const [isHorizontalView, setIsHorizontalView] = useState(false);

  const topScorers = [...players].sort((a, b) => b.goals - a.goals).slice(0, 5);

  const getTeamLogo = (teamId: string) => teams.find(t => t.id === teamId)?.logo;
  const getTeamName = (teamId: string) => teams.find(t => t.id === teamId)?.name;

  const renderTable = (isModal = false) => (
    <table className={cn("w-full text-left border-separate", isModal ? "border-spacing-y-1 table-fixed" : "border-spacing-y-2 md:border-spacing-y-3 min-w-[700px]")}>
      <thead>
        <tr className={cn("text-on-surface-variant font-bold tracking-widest uppercase", isModal ? "text-[8px]" : "text-[10px] md:text-xs")}>
          <th className={cn("pb-1 md:pb-2", isModal ? "px-0.5 w-[8%]" : "px-3 md:px-6")}>Hạng</th>
          <th className={cn("pb-1 md:pb-2", isModal ? "px-0.5 w-[32%]" : "px-2 md:px-4")}>Tên đội bóng</th>
          <th className={cn("pb-1 md:pb-2 text-center", isModal ? "px-0.5 w-[6%]" : "px-2 md:px-4")}>P</th>
          <th className={cn("pb-1 md:pb-2 text-center", isModal ? "px-0.5 w-[6%]" : "px-2 md:px-4")}>W</th>
          <th className={cn("pb-1 md:pb-2 text-center", isModal ? "px-0.5 w-[6%]" : "px-2 md:px-4")}>D</th>
          <th className={cn("pb-1 md:pb-2 text-center", isModal ? "px-0.5 w-[6%]" : "px-2 md:px-4")}>L</th>
          <th className={cn("pb-1 md:pb-2 text-center", isModal ? "px-0.5 w-[7%]" : "px-2 md:px-4")}>GF</th>
          <th className={cn("pb-1 md:pb-2 text-center", isModal ? "px-0.5 w-[7%]" : "px-2 md:px-4")}>GA</th>
          <th className={cn("pb-1 md:pb-2 text-center", isModal ? "px-0.5 w-[7%]" : "px-2 md:px-4")}>GD</th>
          <th className={cn("pb-1 md:pb-2 text-center", isModal ? "px-0.5 w-[15%]" : "px-2 md:px-4")}>PTS</th>
        </tr>
      </thead>
      <tbody>
        {standings.length === 0 ? (
          <tr>
            <td colSpan={10} className="text-center py-8 text-on-surface/50">
              Chưa có dữ liệu đội bóng. Vui lòng thêm đội bóng ở trang Đội bóng.
            </td>
          </tr>
        ) : (
          standings.map((team, index) => (
            <tr
              key={team.teamId}
              className={cn(
                'transition-all',
                isModal ? 'rounded-lg' : 'rounded-xl md:rounded-2xl',
                index === 0
                  ? 'group gold-glow overflow-hidden hover:scale-[1.01]'
                  : 'bg-surface-container-highest/20 hover:bg-on-surface/5'
              )}
            >
              <td className={cn(isModal ? "px-1 py-1.5 rounded-l-lg" : "px-3 md:px-6 py-3 md:py-4 rounded-l-xl md:rounded-l-2xl")}>
                <div
                  className={cn(
                    'flex items-center justify-center font-bold',
                    isModal ? 'w-5 h-5 text-[10px] rounded-full' : 'w-6 h-6 md:w-8 md:h-8 text-xs md:text-sm rounded-full',
                    index === 0
                      ? 'bg-primary text-on-primary font-black shadow-[0_0_15px_color-mix(in_srgb,var(--color-primary)_40%,transparent)]'
                      : 'bg-on-surface/5 text-on-surface-variant border border-on-surface/10'
                  )}
                >
                  {index + 1}
                </div>
              </td>
              <td className={cn(isModal ? "px-1 py-1.5" : "px-2 md:px-4 py-3 md:py-4")}>
                <div className={cn("flex items-center", isModal ? "gap-1.5" : "gap-3 md:gap-4")}>
                  <div
                    className={cn(
                      'rounded-full bg-on-surface/5 flex items-center justify-center border border-on-surface/10 transition-colors shrink-0 overflow-hidden',
                      isModal ? 'w-6 h-6' : 'w-8 h-8 md:w-10 md:h-10',
                      index === 0 && 'group-hover:border-primary/50'
                    )}
                  >
                    {getTeamLogo(team.teamId) ? (
                      <img src={getTeamLogo(team.teamId)} alt={team.teamId} className="w-full h-full object-cover" />
                    ) : (
                      <Shield className={cn("text-on-surface/50", isModal ? "w-3 h-3" : "w-5 h-5 md:w-6 md:h-6")} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className={cn("font-bold text-on-surface font-headline truncate", isModal ? "text-xs max-w-[120px]" : "text-sm md:text-base")}>{getTeamName(team.teamId)}</p>
                    <p className={cn("text-on-surface-variant uppercase tracking-widest truncate", isModal ? "text-[7px]" : "text-[8px] md:text-[10px]")}>
                      {index === 0 ? vi.dashboard.champion : index === 1 ? vi.dashboard.risingStar : index === 2 ? vi.dashboard.localRival : ''}
                    </p>
                  </div>
                </div>
              </td>
              <td className={cn("text-center font-bold text-on-surface", isModal ? "px-1 py-1.5 text-xs" : "px-2 md:px-4 py-3 md:py-4 text-sm md:text-base")}>{team.played}</td>
              <td className={cn("text-center font-medium text-success", isModal ? "px-1 py-1.5 text-xs" : "px-2 md:px-4 py-3 md:py-4 text-sm md:text-base")}>{team.won}</td>
              <td className={cn("text-center font-medium text-warning", isModal ? "px-1 py-1.5 text-xs" : "px-2 md:px-4 py-3 md:py-4 text-sm md:text-base")}>{team.drawn}</td>
              <td className={cn("text-center font-medium text-error", isModal ? "px-1 py-1.5 text-xs" : "px-2 md:px-4 py-3 md:py-4 text-sm md:text-base")}>{team.lost}</td>
              <td className={cn("text-center font-medium text-on-surface/70", isModal ? "px-1 py-1.5 text-xs" : "px-2 md:px-4 py-3 md:py-4 text-sm md:text-base")}>{team.goalsFor}</td>
              <td className={cn("text-center font-medium text-on-surface/70", isModal ? "px-1 py-1.5 text-xs" : "px-2 md:px-4 py-3 md:py-4 text-sm md:text-base")}>{team.goalsAgainst}</td>
              <td
                className={cn(
                  'text-center font-medium',
                  isModal ? "px-1 py-1.5 text-xs" : "px-2 md:px-4 py-3 md:py-4 text-sm md:text-base",
                  team.goalDifference > 0 ? (index === 0 ? 'text-primary' : 'text-on-surface/70') : 'text-error'
                )}
              >
                {team.goalDifference > 0 ? '+' : ''}{team.goalDifference}
              </td>
              <td className={cn("text-center", isModal ? "px-1 py-1.5 rounded-r-lg" : "px-2 md:px-4 py-3 md:py-4 rounded-r-xl md:rounded-r-2xl")}>
                <span
                  className={cn(
                    'font-black font-headline',
                    isModal ? "text-sm" : "text-lg md:text-xl",
                    index === 0 ? 'text-primary' : 'text-on-surface'
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
  );

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-700">
      {/* Hero Header */}
      <section className="relative overflow-hidden rounded-2xl md:rounded-[2rem] p-6 md:p-12 bg-surface-container-low/40 backdrop-blur-2xl border border-on-surface/5">
        <div className="relative z-10 max-w-4xl">
          <span className="inline-block px-3 py-1 md:px-4 md:py-1 rounded-full bg-primary/10 text-primary text-[10px] md:text-xs font-bold tracking-widest uppercase mb-3 md:mb-4 border border-primary/20">
            {vi.dashboard.currentSeason}
          </span>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black font-headline text-on-surface leading-tight neon-glow-primary">
            {vi.dashboard.heroTitle}
          </h1>
        </div>
        <div className="absolute -right-20 -top-20 w-64 h-64 md:w-96 md:h-96 bg-primary/10 rounded-full blur-[80px] md:blur-[100px]"></div>
        <div className="absolute -bottom-20 -left-20 w-48 h-48 md:w-80 md:h-80 bg-secondary/5 rounded-full blur-[60px] md:blur-[80px]"></div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        {/* Main Standings Table */}
        <div className="lg:col-span-8 space-y-6 min-w-0">
          <GlassCard className="pastel-blue p-4 md:p-8">
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <div className="flex items-center gap-2 md:gap-3">
                <Trophy className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                <h3 className="text-lg md:text-xl font-bold font-headline">{vi.dashboard.standingsTitle}</h3>
              </div>
              <button 
                onClick={() => setIsHorizontalView(true)}
                className="text-[10px] md:text-xs font-bold text-primary flex items-center gap-1 md:gap-2 hover:underline sm:hidden"
              >
                <span>Xem ngang</span>
                <Maximize2 className="w-3 h-3 md:w-4 md:h-4" />
              </button>
            </div>
            
            <div className="overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0">
              {renderTable()}
            </div>
          </GlassCard>
        </div>

        {/* Mini Sidebar Stats */}
        <div className="lg:col-span-4 space-y-6 md:space-y-8 min-w-0">
          {/* Top Scorers */}
          <GlassCard className="pastel-pink p-4 md:p-6 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h3 className="text-base md:text-lg font-bold font-headline flex items-center gap-2">
                <Trophy className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                {vi.dashboard.topScorers}
              </h3>
            </div>
            <div className="space-y-3 md:space-y-4">
              {topScorers.length === 0 ? (
                <div className="text-center py-4 text-on-surface/50 text-sm">Chưa có dữ liệu cầu thủ.</div>
              ) : (
                topScorers.map((player) => (
                  <div key={player.id} className="flex items-center justify-between p-2 md:p-3 rounded-xl md:rounded-2xl bg-on-surface/5 hover:bg-on-surface/10 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-on-surface/10 overflow-hidden shrink-0">
                        <img src={player.avatar || `https://ui-avatars.com/api/?name=${player.name}&background=random`} alt={player.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs md:text-sm font-bold font-headline group-hover:text-primary transition-colors truncate">{player.name}</p>
                        <p className="text-[8px] md:text-[10px] text-on-surface-variant font-bold uppercase tracking-tight truncate">{getTeamName(player.teamId)}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 pl-2">
                      <p className="text-lg md:text-xl font-black font-headline text-on-surface leading-none">{player.goals}</p>
                      <p className="text-[7px] md:text-[8px] text-primary uppercase font-black">{vi.dashboard.goals}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Horizontal View Modal for Mobile */}
      {isHorizontalView && (
        <div className="fixed inset-0 z-[100] bg-background sm:hidden">
          <div 
            className="absolute top-1/2 left-1/2 bg-surface-container-low shadow-2xl flex flex-col"
            style={{
              width: '100vh',
              height: '100vw',
              transform: 'translate(-50%, -50%) rotate(90deg)',
              transformOrigin: 'center center'
            }}
          >
            <div className="p-3 flex items-center justify-between bg-surface-container-low z-10 border-b border-on-surface/10 shrink-0">
              <h3 className="text-base font-bold font-headline flex items-center gap-2">
                <Trophy className="w-4 h-4 text-primary" />
                {vi.dashboard.standingsTitle}
              </h3>
              <button 
                onClick={() => setIsHorizontalView(false)}
                className="p-1.5 bg-on-surface/5 hover:bg-on-surface/10 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-on-surface" />
              </button>
            </div>
            <div className="p-2 overflow-y-auto flex-1">
              {renderTable(true)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
