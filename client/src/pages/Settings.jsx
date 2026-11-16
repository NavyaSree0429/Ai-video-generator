import React from 'react';
import { Settings as SettingsIcon, Shield, Sliders } from 'lucide-react';

const Settings = () => {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-purple-400" />
            Application Settings
          </h2>
          <p className="text-xs text-slate-400">
            Configure free AI providers, API tokens, and publishing safeguards
          </p>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 max-w-2xl space-y-4">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-emerald-400" />
          <h3 className="font-semibold text-white">Strict Free-Tier Enforcer</h3>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          The system is configured to never use paid API credits. Fallback is strictly routed between eligible zero-cost providers.
        </p>
      </div>
    </div>
  );
};

export default Settings;

