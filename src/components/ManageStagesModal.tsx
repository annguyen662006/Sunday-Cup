import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { X, Plus, Trash2 } from 'lucide-react';

interface ManageStagesModalProps {
  tournamentId: string;
  onClose: () => void;
}

export const ManageStagesModal = ({ tournamentId, onClose }: ManageStagesModalProps) => {
  const { stages, addStage, deleteStage } = useStore();
  const [newStageName, setNewStageName] = useState('');
  const [newStageDate, setNewStageDate] = useState('');

  const tournamentStages = stages.filter(s => s.tournamentId === tournamentId);

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '';
    const parts = dateString.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateString;
  };

  const handleCreate = () => {
    if (!newStageName.trim() || !newStageDate.trim()) return;
    addStage({
      tournamentId,
      name: newStageName.trim(),
      date: newStageDate.trim()
    });
    setNewStageName('');
    setNewStageDate('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-surface-container border border-on-surface/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-on-surface/10 flex items-center justify-between bg-on-surface/5">
          <h3 className="font-headline font-bold text-lg text-on-surface">Quản lý Vòng thi đấu</h3>
          <button onClick={onClose} className="p-1 hover:bg-on-surface/10 rounded-lg transition-colors text-on-surface">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex flex-col gap-2">
            <input
              type="text"
              value={newStageName}
              onChange={(e) => setNewStageName(e.target.value)}
              placeholder="Tên vòng (VD: Vòng 1)"
              className="w-full bg-surface-container-highest border border-on-surface/10 rounded-xl px-4 py-2 text-on-surface outline-none focus:border-primary transition-colors"
            />
            <div className="flex gap-2">
              <input
                type="date"
                value={newStageDate}
                onChange={(e) => setNewStageDate(e.target.value)}
                className="flex-1 bg-surface-container-highest border border-on-surface/10 rounded-xl px-4 py-2 text-on-surface outline-none focus:border-primary transition-colors"
              />
              <button
                onClick={handleCreate}
                disabled={!newStageName.trim() || !newStageDate.trim()}
                className="bg-primary hover:bg-primary-fixed text-on-primary-fixed p-2 rounded-xl disabled:opacity-50 transition-all"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {tournamentStages.map((s) => (
              <div key={s.id} className="flex items-center justify-between p-3 bg-surface-container-highest/50 rounded-xl border border-on-surface/5">
                <div>
                  <div className="font-medium text-on-surface">{s.name}</div>
                  <div className="text-xs text-on-surface-variant">{formatDate(s.date)}</div>
                </div>
                <button
                  onClick={() => deleteStage(s.id)}
                  className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {tournamentStages.length === 0 && (
              <p className="text-center text-on-surface-variant text-sm py-4">Chưa có vòng đấu nào.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
