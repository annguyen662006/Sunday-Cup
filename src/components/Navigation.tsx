import { NavLink } from 'react-router-dom';
import { Home, Trophy, BarChart2, Users, User } from 'lucide-react';
import { vi } from '../lang/vi';
import { cn } from '../utils/cn';

export const Navigation = () => {
  const navItems = [
    { path: '/', label: vi.nav.home, icon: Home },
    { path: '/statistics', label: vi.nav.statistics, icon: BarChart2 },
    { path: '/teams', label: vi.nav.teams, icon: Users },
    { path: '/matches', label: vi.nav.matches, icon: Trophy },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-slate-900/40 dark:bg-zinc-950/40 backdrop-blur-xl border-r border-white/10 z-50 flex-col shadow-[20px_0_30px_rgba(0,0,0,0.3)]">
        <div className="p-6">
          <h1 className="text-xl font-black text-[#39FF14] drop-shadow-[0_0_10px_rgba(57,255,20,0.5)] font-headline tracking-tight">
            {vi.app.title}
          </h1>
          <p className="text-xs text-on-surface-variant font-medium opacity-70 tracking-widest mt-1 uppercase">
            {vi.app.subtitle}
          </p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-headline font-bold',
                  isActive
                    ? 'bg-[#39FF14]/10 text-[#39FF14] border-r-4 border-[#39FF14] shadow-[0_0_15px_rgba(57,255,20,0.2)]'
                    : 'text-white/60 hover:text-white/90 hover:bg-white/5'
                )
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-6 border-t border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center overflow-hidden border border-white/10 shrink-0">
              <img
                alt="User Profile"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuANUuqcreiOx4lSM8of1bgX0E7BNUDfQ_ndlqj-QqTYVy--sWMKUDNgENqsUBBOw92DQcSQUryyEid-oYtt0OnYZ9-xZdQoKVmtPT3X8VGP3FbUgIpSaAZu9SpJchoZGW-Erg7NFzBo8n6KI_1RaQCF8BHEgdQ_2L4dYqyKlSYIuijsyixP7XmviPKBr3mQDuk2Jy0F59JoOkV0T5uRndjiITvDgeWoVqNzqFPSA2icRfWbtGBXhAsFOMHbbR0OE3WzgLogCEUGLuw"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{vi.app.admin}</p>
              <p className="text-[10px] text-primary uppercase tracking-tighter truncate">{vi.app.proMember}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface-container-highest/90 backdrop-blur-xl border-t border-white/10 z-50 flex justify-around items-center p-2 pb-safe">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-1 p-2 rounded-xl transition-all flex-1',
                isActive
                  ? 'text-primary'
                  : 'text-white/50 hover:text-white/90'
              )
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] font-bold font-headline truncate w-full text-center">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
};
