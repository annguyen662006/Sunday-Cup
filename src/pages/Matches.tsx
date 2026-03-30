import { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { vi } from '../lang/vi';
import { GlassCard } from '../components/GlassCard';
import { ChevronDown, Calendar, Plus, Minus, CheckCircle, PlusCircle, X } from 'lucide-react';
import { cn } from '../utils/cn';
import { CreateMatchModal } from '../components/CreateMatchModal';
import { SelectPlayerModal } from '../components/SelectPlayerModal';
import { ConfirmSaveMatchModal } from '../components/ConfirmSaveMatchModal';
import { ConfirmDeleteMatchModal } from '../components/ConfirmDeleteMatchModal';

export const Matches = () => {
  const { matches, teams, players, updateMatchStatus, addMatchEvent, removeLastMatchEvent, deleteMatch } = useStore();
  const [selectedRound, setSelectedRound] = useState<number>(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [scoringTeam, setScoringTeam] = useState<{ matchId: number, teamId: string } | null>(null);
  const [confirmingMatchId, setConfirmingMatchId] = useState<number | null>(null);
  const [deletingMatchId, setDeletingMatchId] = useState<number | null>(null);

  const filteredMatches = useMemo(() => {
    return matches.filter((m) => m.round === selectedRound);
  }, [matches, selectedRound]);

  const getTeam = (teamId: string) => teams.find((t) => t.id === teamId);
  const getPlayerName = (playerId: number) => players.find(p => p.id === playerId)?.name;

  const handleGoalScored = (playerId: number) => {
    if (!scoringTeam) return;
    const now = new Date();
    const timestamp = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    addMatchEvent(scoringTeam.matchId, {
      type: 'goal',
      teamId: scoringTeam.teamId,
      playerId,
      timestamp,
    });
    setScoringTeam(null);
  };

  const handleSaveMatch = (matchId: number) => {
    updateMatchStatus(matchId, 'played');
    setConfirmingMatchId(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-700">
      {/* Page Header & Filter */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6 mb-8 md:mb-12">
        <div>
          <h3 className="font-headline font-extrabold text-3xl md:text-4xl tracking-tighter text-on-surface mb-1 md:mb-2 italic uppercase">
            {vi.matches.leagueName}
          </h3>
          <p className="text-on-surface-variant font-medium text-sm md:text-base">
            {vi.matches.seasonInfo} • <span className="text-primary">{vi.matches.liveUpdate}</span>
          </p>
        </div>

        <div className="relative w-full md:w-auto">
          <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-2 block ml-1">
            {vi.matches.selectPhase}
          </label>
          <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md rounded-xl p-1 border border-white/5 shadow-xl w-full md:w-auto">
            <select
              value={selectedRound}
              onChange={(e) => setSelectedRound(Number(e.target.value))}
              className="appearance-none bg-transparent text-white text-sm font-bold px-4 py-3 md:py-2 outline-none cursor-pointer flex-1 md:flex-none"
            >
              {Array.from({ length: 10 }, (_, i) => i + 1).map((round) => (
                <option key={round} value={round} className="bg-surface text-white">
                  {vi.matches.round} {round}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-white/50 mr-2 pointer-events-none absolute right-12 md:static" />
            <div className="h-6 w-[1px] bg-white/10 mx-1 hidden md:block"></div>
            <button className="p-3 md:p-2 rounded-lg text-on-surface-variant hover:text-white transition-all shrink-0">
              <Calendar className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="mt-4 md:mt-0 md:ml-4 w-full md:w-auto bg-primary/20 hover:bg-primary/30 text-primary font-bold py-3 md:py-2 px-4 rounded-xl border border-primary/30 transition-all flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-5 h-5" />
            Tạo trận đấu
          </button>
        </div>
      </section>

      {/* Matches List */}
      <div className="space-y-4">
        {filteredMatches.map((match) => {
          const homeTeam = getTeam(match.homeId);
          const awayTeam = getTeam(match.awayId);

          return (
            <GlassCard
              key={match.id}
              className="p-4 md:p-6 group hover:border-primary/20 transition-all duration-500 overflow-hidden relative"
            >
              <div className="absolute -right-12 -top-12 w-32 h-32 bg-primary/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <button
                onClick={() => setDeletingMatchId(match.id)}
                className="absolute top-2 right-2 p-2 text-white/30 hover:text-error hover:bg-error/10 rounded-full transition-colors z-10"
                title="Xoá kết quả"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8 mt-4 md:mt-0">
                {/* Mobile: Stacked layout, Desktop: Row layout */}
                <div className="flex items-center justify-between w-full md:w-auto">
                  {/* Home Team */}
                  <div className="flex flex-col md:flex-row items-center justify-end flex-1 gap-2 md:gap-6">
                    <span className="font-headline font-bold text-xs md:text-lg text-on-surface tracking-tight text-center md:text-right order-2 md:order-1">
                      {homeTeam?.name}
                    </span>
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-900/40 p-2 border border-blue-400/20 shadow-lg shrink-0 order-1 md:order-2">
                      <img src={homeTeam?.logo} alt={homeTeam?.name} className="w-full h-full object-contain filter drop-shadow-md" />
                    </div>
                  </div>

                  {/* Score Center - Mobile Only */}
                  <div className="flex md:hidden flex-col items-center gap-1 px-3 py-2 bg-black/20 rounded-2xl border border-white/5 mx-2">
                    <div className="flex items-center justify-between w-full px-2">
                      <button 
                        onClick={() => setScoringTeam({ matchId: match.id, teamId: match.homeId })}
                        disabled={match.status === 'played'}
                        className="p-1 text-primary hover:bg-primary/20 rounded-full disabled:opacity-50"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setScoringTeam({ matchId: match.id, teamId: match.awayId })}
                        disabled={match.status === 'played'}
                        className="p-1 text-primary hover:bg-primary/20 rounded-full disabled:opacity-50"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-surface-container-lowest/40 border border-white/10 rounded-xl flex items-center justify-center font-headline font-black text-xl text-primary neon-glow-primary">
                        {match.homeScore ?? 0}
                      </div>
                      <span className="font-headline font-bold text-xl text-white/20">:</span>
                      <div className="w-10 h-10 bg-surface-container-lowest/40 border border-white/10 rounded-xl flex items-center justify-center font-headline font-black text-xl text-primary neon-glow-primary">
                        {match.awayScore ?? 0}
                      </div>
                    </div>
                    <div className="flex items-center justify-between w-full px-2">
                      <button 
                        onClick={() => removeLastMatchEvent(match.id, match.homeId)}
                        disabled={match.status === 'played' || !match.homeScore}
                        className="p-1 text-error hover:bg-error/20 rounded-full disabled:opacity-50"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => removeLastMatchEvent(match.id, match.awayId)}
                        disabled={match.status === 'played' || !match.awayScore}
                        className="p-1 text-error hover:bg-error/20 rounded-full disabled:opacity-50"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Away Team */}
                  <div className="flex flex-col md:flex-row items-center flex-1 gap-2 md:gap-6">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-red-500/20 to-red-900/40 p-2 border border-red-400/20 shadow-lg shrink-0">
                      <img src={awayTeam?.logo} alt={awayTeam?.name} className="w-full h-full object-contain filter drop-shadow-md" />
                    </div>
                    <span className="font-headline font-bold text-xs md:text-lg text-on-surface tracking-tight text-center md:text-left">
                      {awayTeam?.name}
                    </span>
                  </div>
                </div>

                {/* Score Center - Desktop Only */}
                <div className="hidden md:flex flex-col items-center gap-2 px-6 py-2 bg-black/20 rounded-2xl border border-white/5">
                  <div className="flex items-center justify-between w-full px-2">
                    <button 
                      onClick={() => setScoringTeam({ matchId: match.id, teamId: match.homeId })}
                      disabled={match.status === 'played'}
                      className="p-1 text-primary hover:bg-primary/20 rounded-full transition-colors disabled:opacity-50"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => setScoringTeam({ matchId: match.id, teamId: match.awayId })}
                      disabled={match.status === 'played'}
                      className="p-1 text-primary hover:bg-primary/20 rounded-full transition-colors disabled:opacity-50"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-surface-container-lowest/40 border border-white/10 rounded-xl flex items-center justify-center font-headline font-black text-2xl text-primary neon-glow-primary">
                      {match.homeScore ?? 0}
                    </div>
                    <span className="font-headline font-bold text-2xl text-white/20">:</span>
                    <div className="w-14 h-14 bg-surface-container-lowest/40 border border-white/10 rounded-xl flex items-center justify-center font-headline font-black text-2xl text-primary neon-glow-primary">
                      {match.awayScore ?? 0}
                    </div>
                  </div>
                  <div className="flex items-center justify-between w-full px-2">
                    <button 
                      onClick={() => removeLastMatchEvent(match.id, match.homeId)}
                      disabled={match.status === 'played' || !match.homeScore}
                      className="p-1 text-error hover:bg-error/20 rounded-full transition-colors disabled:opacity-50"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => removeLastMatchEvent(match.id, match.awayId)}
                      disabled={match.status === 'played' || !match.awayScore}
                      className="p-1 text-error hover:bg-error/20 rounded-full transition-colors disabled:opacity-50"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Action */}
                <div className="w-full md:w-auto md:pl-4 md:border-l border-white/5 pt-3 md:pt-0 border-t md:border-t-0 mt-2 md:mt-0 flex flex-col items-center justify-center gap-2">
                  <div className="text-xs text-white/40 font-medium">
                    {match.date}
                  </div>
                  {match.status === 'played' ? (
                    <div className="w-full md:w-auto bg-surface-container-highest text-white/50 font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 text-sm uppercase tracking-tight">
                      <CheckCircle className="w-4 h-4" />
                      Đã lưu
                    </div>
                  ) : (
                    <button 
                      onClick={() => setConfirmingMatchId(match.id)}
                      className="w-full md:w-auto bg-primary hover:bg-primary-fixed text-on-primary-fixed font-bold py-3 px-6 rounded-xl shadow-[0_0_20px_rgba(142,255,113,0.3)] transition-all active:scale-95 text-sm uppercase tracking-tight"
                    >
                      {vi.matches.save}
                    </button>
                  )}
                </div>
              </div>

              {/* Match Events */}
              {match.events && match.events.length > 0 && (
                <div className="mt-6 pt-4 border-t border-white/5 grid grid-cols-2 gap-4">
                  <div className="space-y-2 text-right pr-4 border-r border-white/5">
                    {match.events.filter(e => e.teamId === match.homeId).map(e => (
                      <div key={e.id} className="text-sm text-white/80 flex items-center justify-end gap-2">
                        <span>{getPlayerName(e.playerId)}</span>
                        <span className="text-xs text-white/40">{e.timestamp}</span>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2 pl-4">
                    {match.events.filter(e => e.teamId === match.awayId).map(e => (
                      <div key={e.id} className="text-sm text-white/80 flex items-center gap-2">
                        <span className="text-xs text-white/40">{e.timestamp}</span>
                        <span>{getPlayerName(e.playerId)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </GlassCard>
          );
        })}
        {filteredMatches.length === 0 && (
          <div className="text-center text-white/50 py-12">
            Không có trận đấu nào trong lượt này.
          </div>
        )}
      </div>

      {isCreateModalOpen && (
        <CreateMatchModal round={selectedRound} onClose={() => setIsCreateModalOpen(false)} />
      )}
      {scoringTeam && (
        <SelectPlayerModal 
          teamId={scoringTeam.teamId} 
          onClose={() => setScoringTeam(null)} 
          onSelect={handleGoalScored} 
        />
      )}
      {confirmingMatchId && (
        <ConfirmSaveMatchModal
          matchId={confirmingMatchId}
          onClose={() => setConfirmingMatchId(null)}
          onConfirm={() => handleSaveMatch(confirmingMatchId)}
        />
      )}
      {deletingMatchId && (
        <ConfirmDeleteMatchModal
          onClose={() => setDeletingMatchId(null)}
          onConfirm={() => {
            deleteMatch(deletingMatchId);
            setDeletingMatchId(null);
          }}
        />
      )}
    </div>
  );
};
