import React from 'react';
import { FolderKanban, Plus } from 'lucide-react';

const Projects = () => {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-purple-400" />
            Project Library
          </h2>
          <p className="text-xs text-slate-400">
            Manage your video creation projects and generated clips
          </p>
        </div>
        <button className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md shadow-purple-600/20 transition">
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      <div className="p-12 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
        <FolderKanban className="w-10 h-10 text-slate-500 mx-auto" />
        <h3 className="text-lg font-semibold text-white">No Projects Yet</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Start by creating a new video project in Phase 2 to organize prompts, scenes, and generated media.
        </p>
      </div>
    </div>
  );
};

export default Projects;

