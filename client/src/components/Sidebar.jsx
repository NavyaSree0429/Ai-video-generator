import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Wand2, 
  Film, 
  FolderKanban, 
  Instagram, 
  Send, 
  History, 
  Settings 
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'AI Studio', path: '/studio', icon: Wand2 },
  { name: 'Video Editor', path: '/editor', icon: Film },
  { name: 'Projects', path: '/projects', icon: FolderKanban },
  { name: 'Instagram', path: '/instagram', icon: Instagram },
  { name: 'Publishing', path: '/publishing', icon: Send },
  { name: 'History', path: '/history', icon: History },
  { name: 'Settings', path: '/settings', icon: Settings },
];

const Sidebar = () => {
  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900/40 p-4 flex flex-col justify-between">
      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? 'bg-purple-600/15 text-purple-400 border border-purple-500/20 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 text-xs space-y-1.5">
        <div className="flex items-center justify-between text-slate-300 font-medium">
          <span>Telugu & English AI</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">Ready</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Free-tier failover protection active. Zero paid API charges guaranteed.
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;

