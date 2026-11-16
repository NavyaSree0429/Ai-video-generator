import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Video, User, LogOut, Bell, Sparkles } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/60 backdrop-blur px-6 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
          <Video className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-lg text-white flex items-center gap-2">
            AI Video Studio
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
              MVP
            </span>
          </h1>
          <p className="text-xs text-slate-400">Instagram Auto Publisher</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Strictly Free Tier Mode</span>
        </div>

        <button 
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
        </button>

        {user ? (
          <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-purple-400 font-semibold border border-slate-700">
                {user.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <span className="font-medium text-slate-200">{user.name}</span>
            </div>
            <button
              onClick={logout}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <a
              href="/login"
              className="text-sm px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              Sign In
            </a>
            <a
              href="/register"
              className="text-sm px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium transition shadow-sm"
            >
              Register
            </a>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;

