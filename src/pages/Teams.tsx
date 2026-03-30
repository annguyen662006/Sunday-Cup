import React, { useState, useRef } from 'react';
import { useStore } from '../store/useStore';
import { GlassCard } from '../components/GlassCard';
import { ImageCropperModal } from '../components/ImageCropperModal';
import { Edit, Trash2, Plus, X, Save, Image as ImageIcon, Users, AlertTriangle, Shield, User, Upload } from 'lucide-react';
import { cn } from '../utils/cn';
import { Team, Player } from '../types';
import { uploadImage } from '../lib/storage';

export const Teams = () => {
  const { teams, players, addTeam, updateTeam, deleteTeam, addPlayer, updatePlayer, deletePlayer } = useStore();
  
  const [isAddTeamModalOpen, setIsAddTeamModalOpen] = useState(false);
  const [isAddPlayersModalOpen, setIsAddPlayersModalOpen] = useState(false);
  const [isEditTeamModalOpen, setIsEditTeamModalOpen] = useState(false);
  const [isDeleteTeamModalOpen, setIsDeleteTeamModalOpen] = useState(false);
  
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [newTeamData, setNewTeamData] = useState({ name: '', shortName: '', logo: '' });
  const [newPlayerData, setNewPlayerData] = useState({ name: '', birthYear: '', avatar: '' });
  const [editingPlayerId, setEditingPlayerId] = useState<number | null>(null);

  const [cropperState, setCropperState] = useState<{
    isOpen: boolean;
    imageSrc: string;
    onComplete: (blob: Blob) => void;
  }>({
    isOpen: false,
    imageSrc: '',
    onComplete: () => {},
  });
  const [isUploading, setIsUploading] = useState(false);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>, callback: (blob: Blob) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setCropperState({
        isOpen: true,
        imageSrc: reader.result as string,
        onComplete: callback,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // Reset input
  };

  const handleAddTeamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamData.name || !newTeamData.shortName) return;
    
    const newTeamId = Math.random().toString(36).substr(2, 9);
    const newTeam = { ...newTeamData, id: newTeamId };
    addTeam(newTeam);

    addPlayer({
      name: 'Không rõ Danh tính',
      teamId: newTeamId,
      birthYear: 2000,
      avatar: 'https://img.freepik.com/hinh-chup-mien-phi/nguoi-dan-ong-khong-ro-danh-tinh-tao-dang-nhin-tu-phia-sau_23-2149417562.jpg',
      goals: 0,
      assists: 0,
    });

    setCurrentTeam(newTeam);
    setIsAddTeamModalOpen(false);
    setIsAddPlayersModalOpen(true);
  };

  const handleAddPlayerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerData.name || !currentTeam) return;

    if (editingPlayerId) {
      updatePlayer(editingPlayerId, {
        name: newPlayerData.name,
        birthYear: newPlayerData.birthYear ? parseInt(newPlayerData.birthYear) : undefined,
        avatar: newPlayerData.avatar,
      });
      setEditingPlayerId(null);
    } else {
      addPlayer({
        name: newPlayerData.name,
        teamId: currentTeam.id,
        birthYear: newPlayerData.birthYear ? parseInt(newPlayerData.birthYear) : undefined,
        avatar: newPlayerData.avatar,
        goals: 0,
        assists: 0,
      });
    }
    setNewPlayerData({ name: '', birthYear: '', avatar: '' });
  };

  const handleEditTeamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTeam || !currentTeam.name || !currentTeam.shortName) return;
    updateTeam(currentTeam.id, { name: currentTeam.name, shortName: currentTeam.shortName, logo: currentTeam.logo });
    setIsEditTeamModalOpen(false);
  };

  const handleDeleteTeam = () => {
    if (!currentTeam) return;
    deleteTeam(currentTeam.id);
    setIsDeleteTeamModalOpen(false);
    setCurrentTeam(null);
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl md:text-3xl font-black font-headline uppercase italic tracking-tighter">Đội bóng</h2>
        <button
          onClick={() => {
            setNewTeamData({ name: '', shortName: '', logo: '' });
            setIsAddTeamModalOpen(true);
          }}
          className="flex items-center gap-2 bg-primary hover:bg-primary-fixed text-on-primary-fixed font-bold py-2 px-4 rounded-xl shadow-[0_0_15px_rgba(142,255,113,0.3)] transition-all active:scale-95 text-sm uppercase tracking-tight"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Thêm đội bóng</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team) => {
          const teamPlayers = players.filter(p => p.teamId === team.id);
          return (
            <GlassCard key={team.id} className="p-6 flex flex-col relative overflow-hidden group">
              <div className="absolute -right-12 -top-12 w-32 h-32 bg-primary/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="flex items-start justify-between mb-4 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 shrink-0 p-2">
                    {team.logo ? (
                      <img src={team.logo} alt={team.name} className="w-full h-full object-contain" />
                    ) : (
                      <Shield className="w-8 h-8 text-white/20" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-headline font-bold text-xl">{team.name}</h3>
                    <p className="text-sm text-on-surface-variant uppercase tracking-widest">{team.shortName}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setCurrentTeam(team);
                      setIsEditTeamModalOpen(true);
                    }}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setCurrentTeam(team);
                      setIsDeleteTeamModalOpen(true);
                    }}
                    className="p-2 rounded-lg bg-error/10 hover:bg-error/20 text-error transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between text-sm text-on-surface-variant relative z-10">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{teamPlayers.length} cầu thủ</span>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Add Team Modal */}
      {isAddTeamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <GlassCard className="w-full max-w-md p-6 relative">
            <button onClick={() => setIsAddTeamModalOpen(false)} className="absolute top-4 right-4 text-white/50 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-2xl font-black font-headline uppercase italic tracking-tighter mb-6">Thêm đội bóng mới</h3>
            <form onSubmit={handleAddTeamSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Tên đội bóng</label>
                <input
                  type="text"
                  required
                  value={newTeamData.name}
                  onChange={(e) => setNewTeamData({ ...newTeamData, name: e.target.value })}
                  className="w-full bg-surface-container-lowest/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  placeholder="Nhập tên đội bóng"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Tên viết tắt</label>
                <input
                  type="text"
                  required
                  value={newTeamData.shortName}
                  onChange={(e) => setNewTeamData({ ...newTeamData, shortName: e.target.value })}
                  className="w-full bg-surface-container-lowest/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  placeholder="Ví dụ: MU, MC, ARS"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Logo (Tuỳ chọn)</label>
                <div className="flex items-center gap-4">
                  {newTeamData.logo && (
                    <div className="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 shrink-0 p-2 overflow-hidden">
                      <img src={newTeamData.logo} alt="Logo preview" className="w-full h-full object-contain" />
                    </div>
                  )}
                  <div className="flex-1 relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageSelect(e, async (blob) => {
                        setCropperState(prev => ({ ...prev, isOpen: false }));
                        setIsUploading(true);
                        const url = await uploadImage(blob, 'logos');
                        if (url) setNewTeamData({ ...newTeamData, logo: url });
                        setIsUploading(false);
                      })}
                      className="hidden"
                      id="team-logo-upload"
                      disabled={isUploading}
                    />
                    <label
                      htmlFor="team-logo-upload"
                      className={cn(
                        "flex items-center justify-center gap-2 w-full bg-surface-container-lowest/40 hover:bg-white/5 border border-white/10 border-dashed rounded-xl px-4 py-3 text-white cursor-pointer transition-all",
                        isUploading && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <Upload className="w-5 h-5 text-white/50" />
                      <span className="text-sm font-medium text-white/70">
                        {isUploading ? 'Đang tải...' : 'Tải ảnh lên'}
                      </span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsAddTeamModalOpen(false)} className="px-6 py-3 rounded-xl font-bold text-white/70 hover:text-white hover:bg-white/5 transition-colors">
                  Hủy
                </button>
                <button type="submit" className="px-6 py-3 rounded-xl font-bold bg-primary text-on-primary-fixed hover:bg-primary-fixed shadow-[0_0_15px_rgba(142,255,113,0.3)] transition-all">
                  Tiếp tục
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

      {/* Add Players Modal */}
      {isAddPlayersModalOpen && currentTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <GlassCard className="w-full max-w-2xl p-6 relative max-h-[90vh] flex flex-col">
            <button onClick={() => setIsAddPlayersModalOpen(false)} className="absolute top-4 right-4 text-white/50 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-2xl font-black font-headline uppercase italic tracking-tighter mb-2">Thêm cầu thủ</h3>
            <p className="text-on-surface-variant mb-6">Đội bóng: <span className="text-primary font-bold">{currentTeam.name}</span></p>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-6">
              <form onSubmit={handleAddPlayerSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-white/5 p-4 rounded-xl border border-white/10">
                <div className="md:col-span-4">
                  <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Họ và tên</label>
                  <input
                    type="text"
                    required
                    value={newPlayerData.name}
                    onChange={(e) => setNewPlayerData({ ...newPlayerData, name: e.target.value })}
                    className="w-full bg-surface-container-lowest/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-primary outline-none"
                    placeholder="Tên cầu thủ"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Năm sinh</label>
                  <input
                    type="number"
                    value={newPlayerData.birthYear}
                    onChange={(e) => setNewPlayerData({ ...newPlayerData, birthYear: e.target.value })}
                    className="w-full bg-surface-container-lowest/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-primary outline-none"
                    placeholder="YYYY"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Avatar</label>
                  <div className="flex items-center gap-2">
                    {newPlayerData.avatar && (
                      <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center border border-white/10 shrink-0 overflow-hidden">
                        <img src={newPlayerData.avatar} alt="Avatar preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageSelect(e, async (blob) => {
                          setCropperState(prev => ({ ...prev, isOpen: false }));
                          setIsUploading(true);
                          const url = await uploadImage(blob, 'avatars');
                          if (url) setNewPlayerData({ ...newPlayerData, avatar: url });
                          setIsUploading(false);
                        })}
                        className="hidden"
                        id="player-avatar-upload"
                        disabled={isUploading}
                      />
                      <label
                        htmlFor="player-avatar-upload"
                        className={cn(
                          "flex items-center justify-center gap-1 w-full bg-surface-container-lowest/40 hover:bg-white/5 border border-white/10 border-dashed rounded-lg px-2 py-2 text-white cursor-pointer transition-all",
                          isUploading && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <Upload className="w-4 h-4 text-white/50" />
                        <span className="text-xs font-medium text-white/70 truncate">
                          {isUploading ? 'Đang tải...' : 'Tải ảnh'}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <button type="submit" className="w-full py-2 rounded-lg font-bold bg-primary/20 text-primary hover:bg-primary/30 transition-colors text-sm flex items-center justify-center gap-1">
                    {editingPlayerId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {editingPlayerId ? 'Lưu' : 'Thêm'}
                  </button>
                </div>
              </form>

              <div className="space-y-2">
                <h4 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest">Danh sách cầu thủ ({players.filter(p => p.teamId === currentTeam.id).length})</h4>
                {players.filter(p => p.teamId === currentTeam.id).map(player => (
                  <div key={player.id} className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-surface-container-highest overflow-hidden shrink-0">
                        {player.avatar ? <img src={player.avatar} alt={player.name} className="w-full h-full object-cover" /> : <User className="w-full h-full p-2 text-white/20" />}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{player.name}</p>
                        <p className="text-xs text-on-surface-variant">{player.birthYear ? `Sinh năm: ${player.birthYear}` : 'Chưa cập nhật năm sinh'}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => {
                        setEditingPlayerId(player.id);
                        setNewPlayerData({ name: player.name, birthYear: player.birthYear?.toString() || '', avatar: player.avatar || '' });
                      }} className="p-1.5 rounded-md text-white/50 hover:text-white hover:bg-white/10 transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => deletePlayer(player.id)} className="p-1.5 rounded-md text-error/70 hover:text-error hover:bg-error/10 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="pt-6 mt-auto border-t border-white/5 flex justify-end">
              <button onClick={() => setIsAddPlayersModalOpen(false)} className="px-6 py-3 rounded-xl font-bold bg-primary text-on-primary-fixed hover:bg-primary-fixed shadow-[0_0_15px_rgba(142,255,113,0.3)] transition-all">
                Hoàn tất
              </button>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Edit Team Modal */}
      {isEditTeamModalOpen && currentTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <GlassCard className="w-full max-w-2xl p-6 relative max-h-[90vh] flex flex-col">
            <button onClick={() => setIsEditTeamModalOpen(false)} className="absolute top-4 right-4 text-white/50 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-2xl font-black font-headline uppercase italic tracking-tighter mb-6">Chỉnh sửa đội bóng</h3>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-6">
              <form onSubmit={handleEditTeamSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Tên đội bóng</label>
                    <input
                      type="text"
                      required
                      value={currentTeam.name}
                      onChange={(e) => setCurrentTeam({ ...currentTeam, name: e.target.value })}
                      className="w-full bg-surface-container-lowest/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Tên viết tắt</label>
                    <input
                      type="text"
                      required
                      value={currentTeam.shortName}
                      onChange={(e) => setCurrentTeam({ ...currentTeam, shortName: e.target.value })}
                      className="w-full bg-surface-container-lowest/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">Logo</label>
                  <div className="flex items-center gap-4">
                    {currentTeam.logo && (
                      <div className="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 shrink-0 p-2 overflow-hidden">
                        <img src={currentTeam.logo} alt="Logo preview" className="w-full h-full object-contain" />
                      </div>
                    )}
                    <div className="flex-1 relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageSelect(e, async (blob) => {
                          setCropperState(prev => ({ ...prev, isOpen: false }));
                          setIsUploading(true);
                          const url = await uploadImage(blob, 'logos');
                          if (url) setCurrentTeam({ ...currentTeam, logo: url });
                          setIsUploading(false);
                        })}
                        className="hidden"
                        id="edit-team-logo-upload"
                        disabled={isUploading}
                      />
                      <label
                        htmlFor="edit-team-logo-upload"
                        className={cn(
                          "flex items-center justify-center gap-2 w-full bg-surface-container-lowest/40 hover:bg-white/5 border border-white/10 border-dashed rounded-xl px-4 py-3 text-white cursor-pointer transition-all",
                          isUploading && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <Upload className="w-5 h-5 text-white/50" />
                        <span className="text-sm font-medium text-white/70">
                          {isUploading ? 'Đang tải...' : 'Tải ảnh lên'}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button type="submit" className="px-6 py-2 rounded-xl font-bold bg-white/10 text-white hover:bg-white/20 transition-all flex items-center gap-2">
                    <Save className="w-4 h-4" /> Lưu thông tin đội
                  </button>
                </div>
              </form>

              <div className="border-t border-white/10 pt-6">
                <h4 className="text-lg font-bold font-headline mb-4">Quản lý cầu thủ</h4>
                <form onSubmit={handleAddPlayerSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-white/5 p-4 rounded-xl border border-white/10 mb-4">
                  <div className="md:col-span-4">
                    <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Họ và tên</label>
                    <input
                      type="text"
                      required
                      value={newPlayerData.name}
                      onChange={(e) => setNewPlayerData({ ...newPlayerData, name: e.target.value })}
                      className="w-full bg-surface-container-lowest/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-primary outline-none"
                      placeholder="Tên cầu thủ"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Năm sinh</label>
                    <input
                      type="number"
                      value={newPlayerData.birthYear}
                      onChange={(e) => setNewPlayerData({ ...newPlayerData, birthYear: e.target.value })}
                      className="w-full bg-surface-container-lowest/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-primary outline-none"
                      placeholder="YYYY"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Avatar</label>
                    <div className="flex items-center gap-2">
                      {newPlayerData.avatar && (
                        <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center border border-white/10 shrink-0 overflow-hidden">
                          <img src={newPlayerData.avatar} alt="Avatar preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1 relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageSelect(e, async (blob) => {
                            setCropperState(prev => ({ ...prev, isOpen: false }));
                            setIsUploading(true);
                            const url = await uploadImage(blob, 'avatars');
                            if (url) setNewPlayerData({ ...newPlayerData, avatar: url });
                            setIsUploading(false);
                          })}
                          className="hidden"
                          id="edit-player-avatar-upload"
                          disabled={isUploading}
                        />
                        <label
                          htmlFor="edit-player-avatar-upload"
                          className={cn(
                            "flex items-center justify-center gap-1 w-full bg-surface-container-lowest/40 hover:bg-white/5 border border-white/10 border-dashed rounded-lg px-2 py-2 text-white cursor-pointer transition-all",
                            isUploading && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          <Upload className="w-4 h-4 text-white/50" />
                          <span className="text-xs font-medium text-white/70 truncate">
                            {isUploading ? 'Đang tải...' : 'Tải ảnh'}
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <button type="submit" className="w-full py-2 rounded-lg font-bold bg-primary/20 text-primary hover:bg-primary/30 transition-colors text-sm flex items-center justify-center gap-1">
                      {editingPlayerId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      {editingPlayerId ? 'Lưu' : 'Thêm'}
                    </button>
                  </div>
                </form>

                <div className="space-y-2">
                  {players.filter(p => p.teamId === currentTeam.id).map(player => (
                    <div key={player.id} className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-surface-container-highest overflow-hidden shrink-0">
                          {player.avatar ? <img src={player.avatar} alt={player.name} className="w-full h-full object-cover" /> : <User className="w-full h-full p-2 text-white/20" />}
                        </div>
                        <div>
                          <p className="font-bold text-sm">{player.name}</p>
                          <p className="text-xs text-on-surface-variant">{player.birthYear ? `Sinh năm: ${player.birthYear}` : 'Chưa cập nhật năm sinh'}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => {
                          setEditingPlayerId(player.id);
                          setNewPlayerData({ name: player.name, birthYear: player.birthYear?.toString() || '', avatar: player.avatar || '' });
                        }} className="p-1.5 rounded-md text-white/50 hover:text-white hover:bg-white/10 transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => deletePlayer(player.id)} className="p-1.5 rounded-md text-error/70 hover:text-error hover:bg-error/10 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Delete Team Modal */}
      {isDeleteTeamModalOpen && currentTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <GlassCard className="w-full max-w-md p-6 relative text-center">
            <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-error" />
            </div>
            <h3 className="text-2xl font-black font-headline uppercase italic tracking-tighter mb-2">Xóa đội bóng?</h3>
            <p className="text-on-surface-variant mb-6">
              Bạn có chắc chắn muốn xóa đội <span className="text-white font-bold">{currentTeam.name}</span>? Hành động này sẽ xóa toàn bộ cầu thủ thuộc đội bóng này và không thể hoàn tác.
            </p>
            <div className="flex justify-center gap-3">
              <button onClick={() => setIsDeleteTeamModalOpen(false)} className="px-6 py-3 rounded-xl font-bold text-white/70 hover:text-white hover:bg-white/5 transition-colors">
                Hủy
              </button>
              <button onClick={handleDeleteTeam} className="px-6 py-3 rounded-xl font-bold bg-error text-white hover:bg-error/80 shadow-[0_0_15px_rgba(255,84,73,0.3)] transition-all">
                Xóa đội bóng
              </button>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Image Cropper Modal */}
      {cropperState.isOpen && (
        <ImageCropperModal
          imageSrc={cropperState.imageSrc}
          onCropComplete={cropperState.onComplete}
          onCancel={() => setCropperState(prev => ({ ...prev, isOpen: false }))}
          aspectRatio={1}
        />
      )}
    </div>
  );
};
