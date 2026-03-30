import { Outlet, useLocation } from 'react-router-dom';
import { Navigation } from './Navigation';
import { Search, Bell, Settings, Sun, Moon } from 'lucide-react';
import { vi } from '../lang/vi';
import { useStore } from '../store/useStore';

export const Layout = () => {
  const location = useLocation();
  const { isDarkMode, toggleDarkMode } = useStore();
  
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return vi.dashboard.title;
      case '/matches': return vi.matches.title;
      case '/statistics': return vi.statistics.title;
      case '/teams': return vi.nav.teams || 'Đội bóng';
      case '/login': return 'Đăng nhập';
      case '/admin': return 'Quản lý';
      default: return vi.app.title;
    }
  };

  return (
    <div className="flex min-h-screen bg-surface font-body text-on-surface selection:bg-primary selection:text-on-primary">
      <Navigation />
      
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen pb-20 md:pb-0 min-w-0">
        <header className="sticky top-0 w-full h-14 md:h-16 bg-surface-container-lowest/30 backdrop-blur-md border-b border-on-surface/5 flex justify-between items-center px-4 md:px-8 z-40">
          <div className="flex items-center gap-2 md:gap-4 truncate min-w-0">
            <h2 className="text-lg md:text-2xl font-black italic tracking-tighter text-on-surface font-headline uppercase truncate">
              {getPageTitle()}
            </h2>
          </div>
          <div className="flex items-center gap-4 md:gap-6 shrink-0">
            <div className="hidden md:flex relative group">
              <input
                type="text"
                placeholder={vi.dashboard.searchPlaceholder}
                className="bg-surface-container-lowest/15 border-none rounded-full px-4 py-1.5 text-sm w-64 focus:ring-1 focus:ring-primary placeholder:text-on-surface-variant/50 transition-all font-label text-on-surface"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface/30 w-4 h-4" />
            </div>
            <div className="flex items-center gap-3 md:gap-4">
              <Search className="w-5 h-5 text-on-surface/70 hover:text-primary transition-colors cursor-pointer md:hidden" />
              <Bell className="w-5 h-5 text-on-surface/70 hover:text-primary transition-colors cursor-pointer" />
              <button
                onClick={toggleDarkMode}
                className="p-1.5 rounded-full hover:bg-on-surface/5 text-on-surface/70 hover:text-primary transition-colors md:hidden"
                aria-label="Toggle Dark Mode"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <Settings className="w-5 h-5 text-on-surface/70 hover:text-primary transition-colors cursor-pointer hidden sm:block" />
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 mesh-gradient relative overflow-x-hidden min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
