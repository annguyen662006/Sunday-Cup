import { Outlet, useLocation } from 'react-router-dom';
import { Navigation } from './Navigation';
import { Search, Bell, Settings } from 'lucide-react';
import { vi } from '../lang/vi';

export const Layout = () => {
  const location = useLocation();
  
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return vi.dashboard.title;
      case '/matches': return vi.matches.title;
      case '/statistics': return vi.statistics.title;
      default: return vi.app.title;
    }
  };

  return (
    <div className="flex min-h-screen bg-surface font-body text-on-surface selection:bg-primary selection:text-on-primary">
      <Navigation />
      
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen pb-20 md:pb-0 min-w-0">
        <header className="sticky top-0 w-full h-14 md:h-16 bg-slate-900/30 dark:bg-zinc-950/30 backdrop-blur-md border-b border-white/5 flex justify-between items-center px-4 md:px-8 z-40">
          <div className="flex items-center gap-2 md:gap-4 truncate min-w-0">
            <h2 className="text-lg md:text-2xl font-black italic tracking-tighter text-white font-headline uppercase truncate">
              {getPageTitle()}
            </h2>
          </div>
          <div className="flex items-center gap-4 md:gap-6 shrink-0">
            <div className="hidden md:flex relative group">
              <input
                type="text"
                placeholder={vi.dashboard.searchPlaceholder}
                className="bg-surface-container-lowest/15 border-none rounded-full px-4 py-1.5 text-sm w-64 focus:ring-1 focus:ring-primary placeholder:text-on-surface-variant/50 transition-all font-label text-white"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 w-4 h-4" />
            </div>
            <div className="flex items-center gap-3 md:gap-4">
              <Search className="w-5 h-5 text-white/70 hover:text-primary transition-colors cursor-pointer md:hidden" />
              <Bell className="w-5 h-5 text-white/70 hover:text-primary transition-colors cursor-pointer" />
              <Settings className="w-5 h-5 text-white/70 hover:text-primary transition-colors cursor-pointer hidden sm:block" />
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
