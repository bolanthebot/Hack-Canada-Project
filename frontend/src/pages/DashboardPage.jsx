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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-12 h-12 border-4 border-blue-50 border-t-blue-600 rounded-full animate-spin shadow-sm" />
          <div className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] animate-pulse">
            Syncing Mobility Intelligence...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-8 lg:p-12">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 mb-4">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Live System Analytics</span>
            </div>
            <h1 className="text-4xl font-black text-gray-800 tracking-tight leading-none mb-3">
              Urban Intelligence Hub
            </h1>
            <p className="text-sm font-semibold text-gray-400 max-w-lg leading-relaxed">
              Real-time mobility insights and safety metrics aggregated across the Greater Toronto Area.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Data Freshness</div>
              <div className="text-xs font-bold text-gray-500 bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">
                Synced at {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-12">
          <StatsCards stats={stats} />

          <div className="relative pt-4">
            <div className="absolute inset-x-0 top-[calc(50%+8px)] h-px bg-gray-100"></div>
            <div className="relative inline-flex items-center gap-2 pr-6 bg-white text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">
              Deep Insights & Distribution
            </div>
          </div>

          <DashboardCharts stats={stats} />
        </div>
      </div>
    </div>
  );
}
