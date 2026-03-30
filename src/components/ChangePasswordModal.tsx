import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { supabase } from '../lib/supabase';
import { GlassCard } from './GlassCard';
import { KeyRound, ShieldAlert } from 'lucide-react';

export function ChangePasswordModal() {
  const currentUser = useStore(state => state.currentUser);
  const setCurrentUser = useStore(state => state.setCurrentUser);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!currentUser || !currentUser.is_first_login) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error: rpcError } = await supabase.rpc('change_password', {
        p_user_id: currentUser.id,
        p_new_password: newPassword
      });

      if (rpcError) throw rpcError;

      if (data) {
        setCurrentUser({ ...currentUser, is_first_login: false });
      } else {
        setError('Không thể đổi mật khẩu, vui lòng thử lại');
      }
    } catch (err: any) {
      console.error('Change password error:', err);
      setError('Có lỗi xảy ra khi đổi mật khẩu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md">
        <GlassCard className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-error/10 text-error rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-headline font-bold text-on-surface mb-2">
              Đổi mật khẩu bắt buộc
            </h2>
            <p className="text-on-surface-variant text-sm">
              Đây là lần đăng nhập đầu tiên của bạn. Vui lòng đổi mật khẩu để bảo mật tài khoản.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-xl text-error text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-2">
                Mật khẩu mới
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound className="h-5 w-5 text-on-surface-variant" />
                </div>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 bg-surface-container border border-surface-container-highest rounded-xl text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="Nhập mật khẩu mới"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-2">
                Xác nhận mật khẩu mới
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound className="h-5 w-5 text-on-surface-variant" />
                </div>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 bg-surface-container border border-surface-container-highest rounded-xl text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="Nhập lại mật khẩu mới"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-primary text-on-primary rounded-xl font-medium hover:bg-primary-fixed hover:text-on-primary-fixed transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                'Đổi mật khẩu'
              )}
            </button>
          </form>
        </GlassCard>
      </div>
    </div>
  );
}
