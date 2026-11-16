import React from 'react';
import { Send, Calendar, Clock } from 'lucide-react';

const Publishing = () => {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Send className="w-6 h-6 text-purple-400" />
            Publish & Schedule
          </h2>
          <p className="text-xs text-slate-400">
            Manual publishing, automated scheduling, and caption/hashtag generation
          </p>
        </div>
      </div>

      <div className="p-12 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
        <Send className="w-10 h-10 text-slate-500 mx-auto" />
        <h3 className="text-lg font-semibold text-white">Publishing Engine</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Schedule Reels, generate AI captions with Gemini, and publish directly to Instagram Creator accounts. (Phase 5 module)
        </p>
      </div>
    </div>
  );
};

export default Publishing;

