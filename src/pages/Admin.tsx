import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { supabase } from '../lib/supabase';
import { GlassCard } from '../components/GlassCard';
import { UserPlus, Users, Shield, Trash2, Key } from 'lucide-react';
import { User } from '../types';

export function Admin() {
  const currentUser = useStore(state => state.currentUser);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'user'>('user');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      fetchUsers();
    }
  }, [currentUser]);

  const fetchUsers = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_users', {
        p_admin_id: currentUser.id
      });
      if (error) throw error;
      if (data) setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!newUsername.trim()) {
      setError('Tên đăng nhập không được để trống');
      return;
    }

    if (!currentUser) return;
    setIsCreating(true);
    try {
      const { data, error } = await supabase.rpc('create_user', {
        p_admin_id: currentUser.id,
        p_username: newUsername.trim(),
        p_password: '123456@',
        p_role: newRole
      });

      if (error) {
        if (error.message.includes('unique constraint')) {
          throw new Error('Tên đăng nhập đã tồn tại');
        }
        throw error;
      }

      setSuccess(`Tạo người dùng "${newUsername}" thành công. Mật khẩu mặc định: 123456@`);
      setNewUsername('');
      setNewRole('user');
      fetchUsers();
    } catch (err: any) {
      console.error('Create user error:', err);
      setError(err.message || 'Có lỗi xảy ra khi tạo người dùng');
    } finally {
      setIsCreating(false);
    }
  };

  if (currentUser?.role !== 'admin') {
    return (
      <div className="p-4 sm:p-6 lg:p-8 flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <Shield className="w-16 h-16 text-error mx-auto mb-4 opacity-50" />
          <h2 className="text-2xl font-headline font-bold text-on-surface mb-2">Không có quyền truy cập</h2>
          <p className="text-on-surface-variant">Bạn cần quyền quản trị viên để xem trang này.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline font-bold text-primary neon-glow-primary mb-2">
            Quản lý người dùng
          </h1>
          <p className="text-on-surface-variant">Thêm và quản lý tài khoản hệ thống</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create User Form */}
        <div className="lg:col-span-1">
          <GlassCard className="p-6 sticky top-24">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <UserPlus className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-headline font-semibold text-on-surface">Tạo tài khoản mới</h2>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-lg text-error text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-primary/10 border border-primary/20 rounded-lg text-primary text-sm">
                {success}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">
                  Tên đăng nhập
                </label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full px-4 py-2 bg-surface-container border border-surface-container-highest rounded-xl text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="Nhập tên đăng nhập"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">
                  Vai trò
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as 'admin' | 'user')}
                  className="w-full px-4 py-2 bg-surface-container border border-surface-container-highest rounded-xl text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                >
                  <option value="user">Người dùng (User)</option>
                  <option value="admin">Quản trị viên (Admin)</option>
                </select>
              </div>

              <div className="pt-2">
                <p className="text-xs text-on-surface-variant mb-4 flex items-center gap-1">
                  <Key className="w-3 h-3" />
                  Mật khẩu mặc định: <span className="font-mono font-bold text-on-surface">123456@</span>
                </p>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="w-full py-2 px-4 bg-primary text-on-primary rounded-xl font-medium hover:bg-primary-fixed hover:text-on-primary-fixed transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isCreating ? (
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5" />
                      Tạo tài khoản
                    </>
                  )}
                </button>
              </div>
            </form>
          </GlassCard>
        </div>

        {/* Users List */}
        <div className="lg:col-span-2">
          <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                <Users className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-headline font-semibold text-on-surface">Danh sách tài khoản</h2>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12 text-on-surface-variant">
                Chưa có tài khoản nào.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-surface-container-highest">
                      <th className="py-3 px-4 font-medium text-on-surface-variant">Tên đăng nhập</th>
                      <th className="py-3 px-4 font-medium text-on-surface-variant">Vai trò</th>
                      <th className="py-3 px-4 font-medium text-on-surface-variant">Trạng thái</th>
                      <th className="py-3 px-4 font-medium text-on-surface-variant">Ngày tạo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-surface-container-highest/50 hover:bg-surface-container/50 transition-colors">
                        <td className="py-3 px-4 text-on-surface font-medium">{user.username}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.role === 'admin' 
                              ? 'bg-error/10 text-error' 
                              : 'bg-primary/10 text-primary'
                          }`}>
                            {user.role === 'admin' ? 'Admin' : 'User'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {user.is_first_login ? (
                            <span className="text-tertiary text-sm flex items-center gap-1">
                              <Shield className="w-3 h-3" />
                              Chưa đổi MK
                            </span>
                          ) : (
                            <span className="text-primary text-sm">Đã kích hoạt</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-on-surface-variant text-sm">
                          {new Date((user as any).created_at).toLocaleDateString('vi-VN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
