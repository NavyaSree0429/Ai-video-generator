import React from 'react';
import { Wand2, Sparkles, Video, Languages } from 'lucide-react';

const VideoStudio = () => {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Wand2 className="w-6 h-6 text-purple-400" />
            AI Video Studio
          </h2>
          <p className="text-xs text-slate-400">
            Generate AI short and long-form videos with Telugu & English narration
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Phase 3 Feature (Awaiting Phase 1 Approval)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <h3 className="font-semibold text-lg text-white">Text-to-Video</h3>
          <p className="text-xs text-slate-400">
            Convert detailed creative prompts into animated video reels using free cloud AI.
          </p>
          <div className="h-40 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-center text-slate-500 text-xs">
            Prompt editor & Telugu/English model selector ready for Phase 3.
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <h3 className="font-semibold text-lg text-white">Image-to-Video</h3>
          <p className="text-xs text-slate-400">
            Animate uploaded character or devotional imagery with smooth camera motion.
          </p>
          <div className="h-40 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-center text-slate-500 text-xs">
            Drag-and-drop media uploader ready for Phase 3.
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoStudio;

