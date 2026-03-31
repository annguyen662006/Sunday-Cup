import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { supabase } from '../lib/supabase';
import { GlassCard } from '../components/GlassCard';
import { Key, User } from 'lucide-react';

export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const setCurrentUser = useStore(state => state.setCurrentUser);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.rpc('login_user', {
        p_username: username,
        p_password: password
      });

      if (error) throw error;

      if (data && data.length > 0) {
        const user = data[0];
        setCurrentUser(user);
        const from = location.state?.from?.pathname || '/';
        navigate(from, { replace: true });
      } else {
        setError('Tên đăng nhập hoặc mật khẩu không đúng');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError('Có lỗi xảy ra khi đăng nhập');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <GlassCard className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-headline font-bold text-primary mb-2">Đăng nhập</h1>
            <p className="text-on-surface-variant">Vui lòng đăng nhập để tiếp tục</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-xl text-error text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-2">
                Tên đăng nhập
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-on-surface-variant" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 bg-surface-container border border-surface-container-highest rounded-xl text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="Nhập tên đăng nhập"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-5 w-5 text-on-surface-variant" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 bg-surface-container border border-surface-container-highest rounded-xl text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="Nhập mật khẩu"
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
                'Đăng nhập'
              )}
            </button>
          </form>
        </GlassCard>
      </div>
    </div>
  );
}
