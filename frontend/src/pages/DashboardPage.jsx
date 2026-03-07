import { useState, useEffect } from 'react';
import StatsCards from '../components/Dashboard/StatsCards';
import DashboardCharts from '../components/Dashboard/DashboardCharts';
import { dashboardApi } from '../api';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // NOTE: Dashboard backend is usually expected to return aggregate data.
    dashboardApi
      .getStats()
      .then((res) => setStats(res.data))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0c0f14] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin" />
          <div className="text-xs font-bold text-gray-500 uppercase tracking-widest animate-pulse">
            Analyzing GTA Mobility Data...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0c0f14] p-6 lg:p-10">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></span>
              <span className="text-[10px] font-black text-teal-400 uppercase tracking-widest">Live System Analytics</span>
            </div>
            <h1 className="text-3xl font-black text-gray-100 tracking-tight leading-none mb-2">
              Urban Intelligence Hub
            </h1>
            <p className="text-sm font-medium text-gray-500 max-w-md">
              Real-time mobility insights and safety metrics aggregated from across the Greater Toronto Area.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden md:block">
              <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Last Updated</div>
              <div className="text-xs font-bold text-gray-400">{new Date().toLocaleTimeString()}</div>
            </div>
          </div>
        </div>

        <div className="space-y-10">
          <StatsCards stats={stats} />

          <div className="relative">
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-white/[0.04]"></div>
            <div className="relative inline-flex items-center gap-2 pr-4 bg-[#0c0f14] text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">
              Deep Insights & Distribution
            </div>
          </div>

          <DashboardCharts stats={stats} />
        </div>
      </div>
    </div>
  );
}
