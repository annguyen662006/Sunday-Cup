import { useState } from 'react';
import { useStore } from '../store/useStore';
import { X } from 'lucide-react';

interface CreateMatchModalProps {
  round: number;
  onClose: () => void;
}

export const CreateMatchModal = ({ round, onClose }: CreateMatchModalProps) => {
  const { teams, addMatch } = useStore();
  const [homeId, setHomeId] = useState<string>('');
  const [awayId, setAwayId] = useState<string>('');

  const handleCreate = () => {
    if (!homeId || !awayId || homeId === awayId) return;
    addMatch({
      round,
      date: new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      homeId,
      awayId,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-surface-container border border-on-surface/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-on-surface/10 flex items-center justify-between bg-on-surface/5">
          <h3 className="font-headline font-bold text-lg text-on-surface">Tạo trận đấu - Lượt {round}</h3>
          <button onClick={onClose} className="p-1 hover:bg-on-surface/10 rounded-lg transition-colors text-on-surface">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Đội nhà</label>
            <select
              value={homeId}
              onChange={(e) => setHomeId(e.target.value)}
              className="w-full bg-surface-container-highest border border-on-surface/10 rounded-xl px-4 py-3 text-on-surface outline-none focus:border-primary transition-colors"
            >
              <option value="">-- Chọn đội nhà --</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id} disabled={t.id === awayId}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Đội khách</label>
            <select
              value={awayId}
              onChange={(e) => setAwayId(e.target.value)}
              className="w-full bg-surface-container-highest border border-on-surface/10 rounded-xl px-4 py-3 text-on-surface outline-none focus:border-primary transition-colors"
            >
              <option value="">-- Chọn đội khách --</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id} disabled={t.id === homeId}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleCreate}
            disabled={!homeId || !awayId || homeId === awayId}
            className="w-full bg-primary hover:bg-primary-fixed text-on-primary-fixed font-bold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Tạo trận đấu
          </button>
        </div>
      </div>
    </div>
  );
};
