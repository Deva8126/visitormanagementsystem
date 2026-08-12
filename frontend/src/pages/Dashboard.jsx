import React, { useState, useEffect } from 'react';
import API from '../utils/api';
import {
  Users,
  UserCheck,
  UserMinus,
  UserSquare2,
  TrendingUp,
  Calendar,
  Loader2,
  AlertCircle
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [visitors, setVisitors] = useState([]);
  const [error, setError] = useState('');

  // Metrics
  const [stats, setStats] = useState({
    todayTotal: 0,
    insideCount: 0,
    exitedCount: 0,
    topHosts: [],
    trendData: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await API.get('/visitors/history');
      const data = response.data || [];
      setVisitors(data);
      calculateStats(data);
    } catch (err) {
      console.error(err);
      setError('Could not retrieve dashboard statistics. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const todayStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // 1. Core counters
    let todayTotal = 0;
    let insideCount = 0;
    let exitedCount = 0;

    data.forEach(v => {
      if (v.status === 'Inside') {
        insideCount++;
      } else if (v.status === 'Exited') {
        exitedCount++;
      }

      // Check if visited today
      if (v.timestamp && v.timestamp.startsWith(todayStr)) {
        todayTotal++;
      }
    });

    // 2. Most Visited Hosts (Top 5)
    const hostCounts = {};
    data.forEach(v => {
      if (v.hostName) {
        hostCounts[v.hostName] = (hostCounts[v.hostName] || 0) + 1;
      }
    });

    const topHosts = Object.keys(hostCounts)
      .map(name => ({ name, visits: hostCounts[name] }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 5);

    // 3. Daily trends (Last 7 days)
    // Create map for last 7 dates
    const trendMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      const displayLabel = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      trendMap[dateKey] = { date: displayLabel, visitors: 0 };
    }

    // Populate counts
    data.forEach(v => {
      if (v.timestamp) {
        const dateKey = v.timestamp.split('T')[0];
        if (trendMap[dateKey]) {
          trendMap[dateKey].visitors++;
        }
      }
    });

    const trendData = Object.keys(trendMap)
      .sort()
      .map(key => trendMap[key]);

    setStats({
      todayTotal,
      insideCount,
      exitedCount,
      topHosts,
      trendData
    });
  };

  const COLORS = ['#0e92eb', '#0273ca', '#035ca3', '#074e87', '#0c4270'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-10 w-10 text-corporate-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-semibold text-sm">Crunching live gate logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Visitor Dashboard</h2>
          <p className="text-sm text-slate-500 font-medium">Real-time gateway statistics and host mappings.</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm text-sm text-slate-600 font-semibold self-start md:self-auto">
          <Calendar className="h-4 w-4 text-corporate-500" />
          <span>{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-sm flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {/* Stats Grid Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Today total card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5 hover:shadow-md transition">
          <div className="h-12 w-12 bg-corporate-50 rounded-xl flex items-center justify-center text-corporate-600">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Today's Total Check-Ins</span>
            <span className="text-3xl font-black text-slate-800 leading-none">{stats.todayTotal}</span>
          </div>
        </div>

        {/* Current Inside count card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5 hover:shadow-md transition">
          <div className="h-12 w-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
            <UserCheck className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Current Visitors Inside</span>
            <span className="text-3xl font-black text-slate-800 leading-none">{stats.insideCount}</span>
          </div>
        </div>

        {/* Exited count card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5 hover:shadow-md transition">
          <div className="h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
            <UserMinus className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Total Checked Out</span>
            <span className="text-3xl font-black text-slate-800 leading-none">{stats.exitedCount}</span>
          </div>
        </div>
      </div>

      {/* Main Charts & Rankings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Trend Area Chart (Recharts) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-6 flex items-center gap-2">
            <TrendingUp className="h-4.5 w-4.5 text-corporate-600" />
            Daily Visitor Trends (Last 7 Days)
          </h3>
          <div className="h-72">
            {stats.trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.trendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0e92eb" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0e92eb" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#0f172a', borderRadius: '8px', color: '#fff', border: 'none', fontSize: '12px' }}
                    labelClassName="font-bold mb-1"
                  />
                  <Area
                    type="monotone"
                    dataKey="visitors"
                    stroke="#0e92eb"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorVisitors)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                No recent trends data available.
              </div>
            )}
          </div>
        </div>

        {/* Top Visited Hosts */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-6 flex items-center gap-2">
              <UserSquare2 className="h-4.5 w-4.5 text-corporate-600" />
              Most Visited Hosts
            </h3>
            <div className="space-y-4">
              {stats.topHosts.length > 0 ? (
                stats.topHosts.map((host, idx) => (
                  <div key={host.name} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
                        style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                      >
                        {idx + 1}
                      </div>
                      <span className="text-sm font-semibold text-slate-700">{host.name}</span>
                    </div>
                    <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full border border-slate-200 shadow-sm">
                      {host.visits} visits
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-slate-400 text-sm">
                  No hosts data recorded yet.
                </div>
              )}
            </div>
          </div>

          {/* Bottom stats callout */}
          {stats.topHosts.length > 0 && (
            <div className="mt-6 p-4 bg-corporate-50 border border-corporate-100 rounded-xl text-xs text-corporate-850 font-medium">
              Host <span className="font-bold text-corporate-900">{stats.topHosts[0]?.name}</span> has received the maximum number of visits.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
