import { X, Shield } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { useStore } from '../store/useStore';
import { format } from 'date-fns';

interface TeamMatchHistoryModalProps {
  teamId: string;
  onClose: () => void;
}

export const TeamMatchHistoryModal = ({ teamId, onClose }: TeamMatchHistoryModalProps) => {
  const { matches, teams, rounds, stages } = useStore();
  const team = teams.find(t => t.id === teamId);

  const teamMatches = matches
    .filter(m => (m.homeId === teamId || m.awayId === teamId) && m.status === 'played')
    .sort((a, b) => {
      const roundA = rounds.find(r => r.id === a.roundId);
      const stageA = stages.find(s => s.id === roundA?.stageId);
      const roundB = rounds.find(r => r.id === b.roundId);
      const stageB = stages.find(s => s.id === roundB?.stageId);

      // Sort by stage date first if available
      if (stageA?.date && stageB?.date) {
        const dateA = new Date(stageA.date).getTime();
        const dateB = new Date(stageB.date).getTime();
        if (dateA !== dateB) return dateA - dateB;
      }

      // If dates are the same or not available, sort by stage name (e.g., "Vòng 1" before "Vòng 2")
      if (stageA?.name && stageB?.name) {
        return stageA.name.localeCompare(stageB.name, undefined, { numeric: true });
      }

      // Fallback to match ID ascending
      return a.id - b.id;
    });

  const getTeamName = (id: string) => teams.find(t => t.id === id)?.name;
  const getTeamLogo = (id: string) => teams.find(t => t.id === id)?.logo;
  const getTeamShortName = (id: string) => teams.find(t => t.id === id)?.shortName;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <GlassCard className="w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-on-surface/10 bg-surface-container-low/50">
          <div className="flex items-center gap-4">
            {team?.logo ? (
              <img src={team.logo} alt={team.name} className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <Shield className="w-10 h-10 text-primary" />
            )}
            <h2 className="text-2xl font-headline font-bold text-on-surface">Lịch sử thi đấu: {team?.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-on-surface/10 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {teamMatches.length === 0 ? (
            <div className="text-center text-on-surface-variant py-8">
              Chưa có trận đấu nào được ghi nhận.
            </div>
          ) : (
            teamMatches.map(match => {
              const isHome = match.homeId === teamId;
              const opponentId = isHome ? match.awayId : match.homeId;
              const teamScore = isHome ? match.homeScore : match.awayScore;
              const opponentScore = isHome ? match.awayScore : match.homeScore;
              
              let resultColor = 'text-on-surface-variant';
              let resultText = 'H';
              if (teamScore !== null && opponentScore !== null) {
                if (teamScore > opponentScore) {
                  resultColor = 'text-primary';
                  resultText = 'T';
                } else if (teamScore < opponentScore) {
                  resultColor = 'text-error';
                  resultText = 'B';
                }
              }

              const homeTeamLogo = getTeamLogo(match.homeId);
              const awayTeamLogo = getTeamLogo(match.awayId);
              const homeTeamShort = getTeamShortName(match.homeId);
              const awayTeamShort = getTeamShortName(match.awayId);

              const round = rounds.find(r => r.id === match.roundId);
              const stage = stages.find(s => s.id === round?.stageId);
              const stageName = stage?.name || 'Vòng đấu';
              const stageDate = stage?.date ? ` (${format(new Date(stage.date), 'dd/MM/yyyy')})` : '';

              return (
                <div key={match.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-4 rounded-xl bg-surface-container-lowest border border-on-surface/5 hover:border-primary/20 transition-colors">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center font-bold text-sm ${
                      resultText === 'T' ? 'bg-primary/20 text-primary' : 
                      resultText === 'B' ? 'bg-error/20 text-error' : 
                      'bg-on-surface/10 text-on-surface-variant'
                    }`}>
                      {resultText}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] sm:text-xs text-on-surface-variant uppercase tracking-wider">
                        {isHome ? 'Sân nhà' : 'Sân khách'}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5 sm:mt-1">
                        <span className="font-bold text-on-surface text-sm sm:text-base">{stageName}{stageDate}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-start sm:justify-end gap-1.5 sm:gap-3 font-headline font-black text-base sm:text-xl ml-11 sm:ml-0">
                    <span className={isHome ? resultColor : 'text-on-surface-variant'}>{homeTeamShort}</span>
                    {homeTeamLogo ? (
                      <img src={homeTeamLogo} alt={homeTeamShort} className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover" />
                    ) : (
                      <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-on-surface-variant" />
                    )}
                    <span className={isHome ? resultColor : 'text-on-surface-variant'}>{match.homeScore ?? '-'}</span>
                    <span className="text-on-surface/30">:</span>
                    <span className={!isHome ? resultColor : 'text-on-surface-variant'}>{match.awayScore ?? '-'}</span>
                    {awayTeamLogo ? (
                      <img src={awayTeamLogo} alt={awayTeamShort} className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover" />
                    ) : (
                      <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-on-surface-variant" />
                    )}
                    <span className={!isHome ? resultColor : 'text-on-surface-variant'}>{awayTeamShort}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </GlassCard>
    </div>
  );
};
