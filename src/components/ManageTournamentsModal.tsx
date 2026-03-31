import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { X, Plus, Trash2 } from 'lucide-react';

interface ManageTournamentsModalProps {
  onClose: () => void;
}

export const ManageTournamentsModal = ({ onClose }: ManageTournamentsModalProps) => {
  const { tournaments, addTournament, deleteTournament } = useStore();
  const [newTournamentName, setNewTournamentName] = useState('');

  const handleCreate = () => {
    if (!newTournamentName.trim()) return;
    addTournament({ name: newTournamentName.trim() });
    setNewTournamentName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-surface-container border border-on-surface/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-on-surface/10 flex items-center justify-between bg-on-surface/5">
          <h3 className="font-headline font-bold text-lg text-on-surface">Quản lý Giải đấu</h3>
          <button onClick={onClose} className="p-1 hover:bg-on-surface/10 rounded-lg transition-colors text-on-surface">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTournamentName}
              onChange={(e) => setNewTournamentName(e.target.value)}
              placeholder="Tên giải đấu mới..."
              className="flex-1 bg-surface-container-highest border border-on-surface/10 rounded-xl px-4 py-2 text-on-surface outline-none focus:border-primary transition-colors"
            />
            <button
              onClick={handleCreate}
              disabled={!newTournamentName.trim()}
              className="bg-primary hover:bg-primary-fixed text-on-primary-fixed p-2 rounded-xl disabled:opacity-50 transition-all"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {tournaments.map((t) => (
              <div key={t.id} className="flex items-center justify-between p-3 bg-surface-container-highest/50 rounded-xl border border-on-surface/5">
                <span className="font-medium text-on-surface">{t.name}</span>
                <button
                  onClick={() => deleteTournament(t.id)}
                  className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {tournaments.length === 0 && (
              <p className="text-center text-on-surface-variant text-sm py-4">Chưa có giải đấu nào.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
