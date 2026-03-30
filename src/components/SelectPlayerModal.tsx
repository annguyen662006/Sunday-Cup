import { useState } from 'react';
import { useStore } from '../store/useStore';
import { X } from 'lucide-react';

interface SelectPlayerModalProps {
  teamId: string;
  onClose: () => void;
  onSelect: (playerId: number) => void;
}

export const SelectPlayerModal = ({ teamId, onClose, onSelect }: SelectPlayerModalProps) => {
  const { players, teams } = useStore();
  const teamPlayers = players.filter(p => p.teamId === teamId);
  const team = teams.find(t => t.id === teamId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-surface-container border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
          <h3 className="font-headline font-bold text-lg">Chọn cầu thủ ghi bàn ({team?.name})</h3>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-2">
          {teamPlayers.length === 0 ? (
            <p className="text-center text-white/50 py-4">Không có cầu thủ nào trong đội này.</p>
          ) : (
            teamPlayers.map(player => (
              <button
                key={player.id}
                onClick={() => {
                  onSelect(player.id);
                  onClose();
                }}
                className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-white/10 transition-colors text-left"
              >
                <img src={player.avatar || `https://ui-avatars.com/api/?name=${player.name}&background=random`} alt={player.name} className="w-10 h-10 rounded-full object-cover" />
                <span className="font-bold text-white">{player.name}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
