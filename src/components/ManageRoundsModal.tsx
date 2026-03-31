import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { X, Plus, Trash2 } from 'lucide-react';

interface ManageRoundsModalProps {
  stageId: string;
  onClose: () => void;
}

export const ManageRoundsModal = ({ stageId, onClose }: ManageRoundsModalProps) => {
  const { rounds, addRound, deleteRound } = useStore();
  const [newRoundName, setNewRoundName] = useState('');
  const [newRoundDate, setNewRoundDate] = useState('');

  const stageRounds = rounds.filter(r => r.stageId === stageId);

  const handleCreate = () => {
    if (!newRoundName.trim()) return;
    addRound({
      stageId,
      name: newRoundName.trim(),
      date: newRoundDate || undefined
    });
    setNewRoundName('');
    setNewRoundDate('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-surface-container border border-on-surface/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-on-surface/10 flex items-center justify-between bg-on-surface/5">
          <h3 className="font-headline font-bold text-lg text-on-surface">Quản lý Lượt thi đấu</h3>
          <button onClick={onClose} className="p-1 hover:bg-on-surface/10 rounded-lg transition-colors text-on-surface">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex flex-col gap-2">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={newRoundName}
                onChange={(e) => setNewRoundName(e.target.value)}
                placeholder="Tên lượt (VD: Lượt 1)"
                className="flex-1 bg-surface-container-highest border border-on-surface/10 rounded-xl px-4 py-2 text-on-surface outline-none focus:border-primary transition-colors"
              />
              <input
                type="date"
                value={newRoundDate}
                onChange={(e) => setNewRoundDate(e.target.value)}
                className="bg-surface-container-highest border border-on-surface/10 rounded-xl px-4 py-2 text-on-surface outline-none focus:border-primary transition-colors"
              />
              <button
                onClick={handleCreate}
                disabled={!newRoundName.trim()}
                className="bg-primary hover:bg-primary-fixed text-on-primary-fixed p-2 rounded-xl disabled:opacity-50 transition-all flex items-center justify-center"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {stageRounds.map((r) => (
              <div key={r.id} className="flex items-center justify-between p-3 bg-surface-container-highest/50 rounded-xl border border-on-surface/5">
                <div className="font-medium text-on-surface">
                  {r.name}
                  {r.date && <span className="ml-2 text-sm text-on-surface-variant">({r.date.split('-').reverse().join('/')})</span>}
                </div>
                <button
                  onClick={() => deleteRound(r.id)}
                  className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {stageRounds.length === 0 && (
              <p className="text-center text-on-surface-variant text-sm py-4">Chưa có lượt đấu nào.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
