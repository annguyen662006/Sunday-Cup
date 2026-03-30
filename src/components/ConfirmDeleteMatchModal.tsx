import { X, AlertTriangle } from 'lucide-react';

interface ConfirmDeleteMatchModalProps {
  onClose: () => void;
  onConfirm: () => void;
}

export const ConfirmDeleteMatchModal = ({ onClose, onConfirm }: ConfirmDeleteMatchModalProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-surface-container border border-white/10 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
          <h3 className="font-headline font-bold text-lg text-error flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Xác nhận xoá
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-6">
          <p className="text-white/80 text-sm">
            Bạn có chắc chắn muốn xoá kết quả trận đấu này? Hành động này không thể hoàn tác và sẽ cập nhật lại thống kê của các cầu thủ.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-surface-container-highest hover:bg-white/10 text-white font-bold py-3 rounded-xl transition-all"
            >
              Huỷ
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 bg-error hover:bg-error/80 text-white font-bold py-3 rounded-xl transition-all"
            >
              Xoá
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
