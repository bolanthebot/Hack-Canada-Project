import { useState, useEffect } from 'react';
import StatsCards from '../components/Dashboard/StatsCards';
import DashboardCharts from '../components/Dashboard/DashboardCharts';
import { dashboardApi } from '../api';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = (isInitial = false) => {
      dashboardApi
        .getStats()
        .then((res) => setStats(res.data))
        .catch(() => { })
        .finally(() => {
          if (isInitial) setLoading(false);
        });
    };

    fetchStats(true);
    const interval = setInterval(() => fetchStats(false), 30000); // Refresh every 30s
    return () => clearInterval(interval);
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
    <div className="min-h-screen bg-white p-8 lg:p-16">
      <div className="max-w-[1440px] mx-auto">
        <div className="mb-16 flex flex-col xl:flex-row xl:items-end justify-between gap-8 animate-in fade-in slide-in-from-top-6 duration-1000 ease-out">
          <div>
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-blue-50/50 border border-blue-100/50 mb-6 group cursor-default">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse shadow-[0_0_12px_rgba(37,99,235,0.4)]"></span>
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.25em]">Live Intelligence Sync</span>
            </div>
            <h1 className="text-5xl font-black text-gray-900 tracking-tighter leading-tight mb-4">
              Urban Intelligence Hub
            </h1>
            <p className="text-base font-bold text-gray-400 max-w-2xl leading-relaxed">
              Real-time mobility insights and safety metrics aggregated across the <span className="text-gray-900">Greater Toronto Area</span> via distributed sensor networks and user-submitted reports.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right hidden xl:block border-l border-gray-100 pl-8">
              <div className="text-[9px] font-black text-gray-300 uppercase tracking-[0.3em] mb-2">Network Latency</div>
              <div className="text-xs font-black text-emerald-500 tabular-nums">24ms (Optimal)</div>
            </div>
            <div className="text-right border-l border-gray-100 pl-8">
              <div className="text-[9px] font-black text-gray-300 uppercase tracking-[0.3em] mb-2">Data Freshness</div>
              <div className="text-xs font-bold text-gray-600 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 shadow-sm flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Synced at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
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
