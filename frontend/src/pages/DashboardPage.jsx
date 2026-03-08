import { useState, useEffect } from 'react';
import StatsCards from '../components/Dashboard/StatsCards';
import DashboardCharts from '../components/Dashboard/DashboardCharts';
import { dashboardApi } from '../api';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // NOTE: Dashboard backend has been deleted.
    dashboardApi
      .getStats()
      .then((res) => setStats(res.data))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <div className="w-4 h-4 border-2 border-gray-600 border-t-gray-300 rounded-full animate-spin" />
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-[1100px] mx-auto">
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-gray-100 mb-1">GTA Mobility Overview</h1>
          <p className="text-sm text-gray-500">
            Crowdsourced data from across the Greater Toronto Area
          </p>
        </div>

        <div className="space-y-3">
          <StatsCards stats={stats} />
          <DashboardCharts stats={stats} />
        </div>
      </div>
    </div>
  );
}
