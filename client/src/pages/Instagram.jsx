import React from 'react';
import { Instagram as InstagramIcon, CheckCircle2, ShieldCheck } from 'lucide-react';

const Instagram = () => {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <InstagramIcon className="w-6 h-6 text-pink-500" />
            Instagram Account
          </h2>
          <p className="text-xs text-slate-400">
            Connect an Instagram Creator account for auto-publishing and scheduling
          </p>
        </div>
      </div>

      <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 max-w-xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
            <InstagramIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Instagram Creator Account</h3>
            <p className="text-xs text-slate-400">Official Meta Graph API Integration</p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300 space-y-1">
          <div className="flex items-center gap-2 font-medium">
            <ShieldCheck className="w-4 h-4" />
            <span>Developer Sandbox / Mock Mode Active</span>
          </div>
          <p className="text-slate-400">
            You can test the entire auto-publish and scheduling pipeline safely even before live Meta App verification.
          </p>
        </div>

        <button className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-medium text-sm transition shadow-md shadow-pink-600/20">
          Connect Creator Account
        </button>
      </div>
    </div>
  );
};

export default Instagram;

