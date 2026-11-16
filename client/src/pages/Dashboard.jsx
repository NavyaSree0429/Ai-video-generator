import React, { useState, useEffect } from 'react';
import { 
  FolderKanban, 
  Video, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Activity,
  ArrowRight,
  Sparkles,
  Server
} from 'lucide-react';
import api from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProjects: 0,
    generatedVideos: 0,
    draftVideos: 0,
    publishedVideos: 0,
    scheduledVideos: 0
  });

  const [systemStatus, setSystemStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const statusRes = await api.get('/system-status');
        if (statusRes.success) {
          setSystemStatus(statusRes.data);
        }
      } catch (err) {
        console.warn('Backend system status check:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    { label: 'Total Projects', value: stats.totalProjects, icon: FolderKanban, color: 'from-blue-500 to-cyan-500' },
    { label: 'Generated Videos', value: stats.generatedVideos, icon: Video, color: 'from-purple-500 to-indigo-500' },
    { label: 'Scheduled Posts', value: stats.scheduledVideos, icon: Calendar, color: 'from-amber-500 to-orange-500' },
    { label: 'Published to IG', value: stats.publishedVideos, icon: CheckCircle2, color: 'from-emerald-500 to-teal-500' },
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-slate-900 border border-purple-500/20 p-8">
        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Phase 1 Initialized — Core Architecture Ready</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white">
            AI Video Studio & Instagram Auto Publisher
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Create AI short & long-form videos with Telugu & English narration, edit scenes with FFmpeg, and auto-publish or schedule directly to your Instagram Creator account without incurring any paid API costs.
          </p>
          <div className="pt-2 flex items-center gap-3">
            <a
              href="/studio"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-sm transition shadow-lg shadow-purple-600/20"
            >
              <span>Launch AI Studio</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="/projects"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium transition border border-slate-700"
            >
              View Projects
            </a>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="rounded-xl bg-slate-900/60 border border-slate-800 p-5 flex items-center justify-between"
            >
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-400">{card.label}</p>
                <p className="text-2xl font-bold text-white">{card.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${card.color} flex items-center justify-center text-white shadow-md`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Architecture & System Status Card */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Server className="w-5 h-5 text-purple-400" />
            <h3 className="font-semibold text-white text-base">Backend & Service Integration Status</h3>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
            Strictly Free Tier
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Database Engine</span>
              <span className="text-[11px] font-semibold text-purple-400">MongoDB Atlas / Mongoose</span>
            </div>
            <p className="text-sm font-medium text-slate-200">
              {systemStatus?.database?.connected ? 'Connected' : 'Configured (Atlas M0)'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">AI Inference Service</span>
              <span className="text-[11px] font-semibold text-emerald-400">FastAPI + Free Providers</span>
            </div>
            <p className="text-sm font-medium text-slate-200">
              Pollinations + Edge-TTS + Gemini
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Video Processing</span>
              <span className="text-[11px] font-semibold text-indigo-400">FFmpeg (Static)</span>
            </div>
            <p className="text-sm font-medium text-slate-200">
              Reels 9:16 + Scene Stitching
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

