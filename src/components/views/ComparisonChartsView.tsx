import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  Layers,
  Activity,
  Zap,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { ReplicaSetState } from '../../types';

interface ComparisonChartsViewProps {
  replicaState: ReplicaSetState | null;
}

export const ComparisonChartsView: React.FC<ComparisonChartsViewProps> = ({ replicaState }) => {
  // Read Latency vs Consistency Data
  const latencyData = [
    { name: 'primary', latency: 2.1, consistency: 100, staleRisk: 0, fill: '#3b82f6' },
    { name: 'primaryPref', latency: 3.4, consistency: 96, staleRisk: 2, fill: '#6366f1' },
    { name: 'secondary', latency: 3.8, consistency: 88, staleRisk: 8, fill: '#10b981' },
    { name: 'secPref', latency: 4.2, consistency: 90, staleRisk: 6, fill: '#14b8a6' },
    { name: 'nearest', latency: 1.8, consistency: 82, staleRisk: 14, fill: '#f59e0b' },
  ];

  // Write Concern Benchmark Latency Data
  const writeConcernData = [
    { concern: 'w: 1', duration: 18, ackNodes: 1, safety: 65, fill: '#10b981' },
    { concern: 'w: majority (2/3)', duration: 42, ackNodes: 2, safety: 100, fill: '#3b82f6' },
    { concern: 'w: 3 (All Nodes)', duration: 68, ackNodes: 3, safety: 100, fill: '#8b5cf6' },
  ];

  // Transaction Status Distribution
  const statusData = [
    { name: 'Settled', value: 12450, color: '#10b981' },
    { name: 'Cleared', value: 1680, color: '#3b82f6' },
    { name: 'Pending', value: 520, color: '#f59e0b' },
    { name: 'Flagged Review', value: 240, color: '#f43f5e' },
    { name: 'Failed', value: 110, color: '#64748b' },
  ];

  // Real-time Replication Lag Stream (ms)
  const lagTimeSeries = [
    { time: '12:00', node1: 0, node2: 8, node3: 14 },
    { time: '12:01', node1: 0, node2: 6, node3: 12 },
    { time: '12:02', node1: 0, node2: 12, node3: 18 },
    { time: '12:03', node1: 0, node2: 9, node3: 15 },
    { time: '12:04', node1: 0, node2: 7, node3: 11 },
    { time: '12:05', node1: 0, node2: 8, node3: 14 },
  ];

  return (
    <div id="high-density-charts" className="space-y-4 animate-fade-in pb-10 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white">
              Replication Performance & Transaction Analytics Charts
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600/20 text-blue-400 border border-blue-500/30 font-mono">
              Recharts Visualizer
            </span>
          </div>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Comparative analysis of replication lag, read latency tradeoffs, and write durability SLAs
          </p>
        </div>
      </div>

      {/* 2x2 High Density Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Chart 1: Read Preference Latency vs Consistency */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Read Preference Latency (ms) vs Consistency (%)
            </h3>
            <span className="text-[10px] font-mono text-slate-500">Benchmark</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={latencyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    color: '#f8fafc',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                  }}
                />
                <Bar dataKey="latency" name="Latency (ms)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="staleRisk" name="Stale Read Risk (%)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Write Concern Latency & Durability */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Write Concern Acknowledgment Time (ms)
            </h3>
            <span className="text-[10px] font-mono text-slate-500">Durability</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={writeConcernData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="concern" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    color: '#f8fafc',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                  }}
                />
                <Bar dataKey="duration" name="Duration (ms)" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: 15k Transactions Status Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
              15,000 Transactions Status Breakdown
            </h3>
            <span className="text-[10px] font-mono text-slate-500">Settlement</span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    color: '#f8fafc',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                  }}
                />
                <Legend
                  formatter={(value) => <span className="text-xs text-slate-400 font-mono">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Continuous Oplog Replication Lag (ms) */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Continuous Oplog Replication Lag (ms)
            </h3>
            <span className="text-[10px] font-mono text-slate-500">Real-time</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lagTimeSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    color: '#f8fafc',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="node2"
                  name="mongo-node-2 Lag"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="node3"
                  name="mongo-node-3 Lag"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
