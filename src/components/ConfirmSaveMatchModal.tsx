import { X, AlertTriangle } from 'lucide-react';
import { useStore } from '../store/useStore';

interface ConfirmSaveMatchModalProps {
  matchId: number;
  onClose: () => void;
  onConfirm: () => void;
}

export const ConfirmSaveMatchModal = ({ matchId, onClose, onConfirm }: ConfirmSaveMatchModalProps) => {
  const { matches, teams } = useStore();
  const match = matches.find(m => m.id === matchId);
  
  if (!match) return null;
  
  const homeTeam = teams.find(t => t.id === match.homeId);
  const awayTeam = teams.find(t => t.id === match.awayId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-surface-container border border-on-surface/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-on-surface/10 flex items-center justify-between bg-on-surface/5">
          <h3 className="font-headline font-bold text-lg flex items-center gap-2 text-on-surface">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            Xác nhận lưu kết quả
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-on-surface/10 rounded-lg transition-colors text-on-surface">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-6">
          <p className="text-on-surface/80 text-sm text-center">
            Bạn có chắc chắn muốn lưu kết quả trận đấu này không? Sau khi lưu, bạn sẽ không thể chỉnh sửa thông tin trận đấu nữa.
          </p>
          
          <div className="bg-surface-container-highest rounded-xl p-4 flex items-center justify-between">
            <div className="flex flex-col items-center gap-2 flex-1">
              <img src={homeTeam?.logo || undefined} alt={homeTeam?.name} className="w-12 h-12 object-cover rounded-full" />
              <span className="font-bold text-sm text-center text-on-surface">{homeTeam?.name}</span>
            </div>
            <div className="flex items-center gap-3 px-4">
              <span className="font-headline font-black text-3xl text-primary">{match.homeScore ?? 0}</span>
              <span className="text-on-surface/20 font-bold">-</span>
              <span className="font-headline font-black text-3xl text-primary">{match.awayScore ?? 0}</span>
            </div>
            <div className="flex flex-col items-center gap-2 flex-1">
              <img src={awayTeam?.logo || undefined} alt={awayTeam?.name} className="w-12 h-12 object-cover rounded-full" />
              <span className="font-bold text-sm text-center text-on-surface">{awayTeam?.name}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-surface-container-highest hover:bg-on-surface/10 text-on-surface font-bold py-3 rounded-xl transition-all"
            >
              Hủy
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="flex-1 bg-primary hover:bg-primary-fixed text-on-primary-fixed font-bold py-3 rounded-xl transition-all"
            >
              Xác nhận lưu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
