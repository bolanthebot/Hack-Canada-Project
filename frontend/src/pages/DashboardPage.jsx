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
      <div className="min-h-screen p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-gray-500 text-sm">
          <div className="w-4 h-4 border-2 border-gray-600 border-t-gray-300 rounded-full animate-spin" />
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest animate-pulse">
            Syncing Urban Intelligence...
          </div>
        </div>
      </div>
    );
  }

  return (
<div className="min-h-screen p-4 sm:p-6 lg:p-8">
  <div className="max-w-[1100px] mx-auto">
    
    <div className="mb-8 flex items-end justify-between gap-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-100 mb-1">
          GTA Mobility Overview
        </h1>
        <p className="text-sm text-gray-500">
          Crowdsourced data from across the Greater Toronto Area
        </p>
      </div>

      {/* Live status / time */}
      <div className="flex items-center gap-2 text-[11px] text-gray-400">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>

        <span className="uppercase tracking-widest text-gray-500 text-[10px]">
          Live
        </span>

        <span className="ml-2 text-gray-400">
          {new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
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
