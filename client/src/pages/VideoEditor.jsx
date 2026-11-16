import React from 'react';
import { Film, Scissors, Type, Music } from 'lucide-react';

const VideoEditor = () => {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Film className="w-6 h-6 text-purple-400" />
            Video Editor
          </h2>
          <p className="text-xs text-slate-400">
            FFmpeg-powered trimming, subtitle burn-in, audio mixing & aspect-ratio conversion
          </p>
        </div>
      </div>

      <div className="p-12 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
        <Film className="w-10 h-10 text-slate-500 mx-auto" />
        <h3 className="text-lg font-semibold text-white">Video Editor Studio</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Trim clips, combine scenes, render Telugu/English subtitles, and format 9:16 vertical reels using local FFmpeg. (Phase 4 module)
        </p>
      </div>
    </div>
  );
};

export default VideoEditor;

