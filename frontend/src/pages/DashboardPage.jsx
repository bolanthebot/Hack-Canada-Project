import { useState, useEffect } from 'react';
import StatsCards from '../components/Dashboard/StatsCards';
import DashboardCharts from '../components/Dashboard/DashboardCharts';
import SafetyScoreGauge from '../components/Dashboard/SafetyScoreGauge';
import SafetyAlertFeed from '../components/Dashboard/SafetyAlertFeed';
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
    const interval = setInterval(() => fetchStats(false), 30000); // 30s refresh
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-[6px] border-blue-50 border-t-blue-600 rounded-full animate-spin shadow-xl" />
          <div className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] animate-pulse">
            Syncing Urban Intelligence...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 lg:p-16">
      <div className="max-w-[1600px] mx-auto">
        {/* Header Section */}
        <div className="mb-16 flex flex-col xl:flex-row xl:items-end justify-between gap-10 animate-in fade-in slide-in-from-top-8 duration-1000 ease-out">
          <div>
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-white border border-gray-100 mb-6 shadow-sm group cursor-default">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </span>
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">Network Intelligence Live</span>
            </div>
            <h1 className="text-6xl font-black text-gray-900 tracking-tighter leading-tight mb-4">
              Urban Intelligence Hub
            </h1>
            <p className="text-lg font-bold text-gray-400 max-w-3xl leading-relaxed">
              Real-time mobility insights and safety metrics aggregated across the <span className="text-gray-900 underline decoration-blue-500/20 underline-offset-8">Greater Toronto Area</span> via distributed sensor networks.
            </p>
          </div>

          <div className="flex items-center gap-8">
            <div className="text-right hidden xl:block border-l border-gray-100 pl-10">
              <div className="text-[9px] font-black text-gray-300 uppercase tracking-[0.4em] mb-2">Protocol Health</div>
              <div className="text-xs font-black text-emerald-500 tabular-nums">99.9% Uptime</div>
            </div>
            <div className="text-right border-l border-gray-100 pl-10">
              <div className="text-[9px] font-black text-gray-300 uppercase tracking-[0.4em] mb-2">Data Synchronicity</div>
              <div className="text-xs font-bold text-gray-600 bg-white px-5 py-2.5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} Freshness
              </div>
            </div>
          </div>
        </div>

        {/* Top Tier: Critical Metrics */}
        <div className="mb-16">
          <StatsCards stats={stats} />
        </div>

        {/* Main Intelligence Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 lg:grid-rows-2 gap-10 mb-16">
          {/* Index Gauge (1x2) */}
          <div className="lg:col-span-1 lg:row-span-2 order-2 lg:order-1">
            <SafetyScoreGauge stats={stats} />
          </div>

          {/* Core Analytics (2x2) */}
          <div className="lg:col-span-2 lg:row-span-2 order-1 lg:order-2">
            <DashboardCharts stats={stats} />
          </div>

          {/* Live Feed (1x2) */}
          <div className="lg:col-span-1 lg:row-span-2 order-3">
            <SafetyAlertFeed reports={stats?.recentReports} />
          </div>
        </div>

        {/* Footer: Strategic Analysis */}
        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-1000">
          <div className="flex items-center gap-8">
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.5em]">GTA Regional Partners</div>
            <div className="flex gap-6 items-center">
              <span className="text-[11px] font-black text-gray-300">City of Toronto</span>
              <span className="text-[11px] font-black text-gray-300">Metrolinx AI</span>
              <span className="text-[11px] font-black text-gray-300">TTC Digital</span>
            </div>
          </div>
          <div className="text-[10px] font-bold text-gray-300 italic">
            Targeting Vision Zero by 2030 • UrbanFlow Core Engine v2.4.0
          </div>
        </div>
      </div>
    </div>
  );
}
