import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  Server,
  Activity,
  CheckCircle,
  AlertTriangle,
  Clock,
  Zap,
} from 'lucide-react';
import { API } from '../../lib/api';
import { AvailabilityAnalysisData } from '../../types';

export const AvailabilityView: React.FC = () => {
  const [data, setData] = useState<AvailabilityAnalysisData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await API.getAvailabilityAnalysis();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="high-density-availability" className="space-y-4 animate-fade-in pb-10 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white">
              MongoDB Availability & Fault Tolerance SLA Analysis
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600/20 text-blue-400 border border-blue-500/30 font-mono">
              Quorum: (N/2) + 1
            </span>
          </div>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Evaluating cluster survivability, split-brain prevention, and recovery time objectives (RTO)
          </p>
        </div>
      </div>

      {/* 4 Stat Overview Boxes */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
          <span className="text-slate-500 uppercase text-[10px] tracking-wider block">Cluster Availability</span>
          <p className="text-lg font-bold text-emerald-400 mt-0.5">
            {data?.currentAvailabilityPct || 99.99}%
          </p>
        </div>
        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
          <span className="text-slate-500 uppercase text-[10px] tracking-wider block">Read Availability</span>
          <p className="text-lg font-bold text-blue-400 mt-0.5">
            {data?.readAvailabilityPct || 100}%
          </p>
        </div>
        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
          <span className="text-slate-500 uppercase text-[10px] tracking-wider block">Write Availability</span>
          <p className="text-lg font-bold text-indigo-400 mt-0.5">
            {data?.writeAvailabilityPct || 100}%
          </p>
        </div>
        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
          <span className="text-slate-500 uppercase text-[10px] tracking-wider block">Quorum Majority</span>
          <p className="text-lg font-bold text-emerald-400 mt-0.5">
            {data?.nodeQuorumStatus.healthyNodes || 3}/3 NODES
          </p>
        </div>
      </div>

      {/* Failure Scenario Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3 font-mono text-xs">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
          Fault Tolerance Matrix (3-Node Replica Set: rs0)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-500 uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Failure Scenario</th>
                <th className="py-2.5 px-3">Remaining Nodes</th>
                <th className="py-2.5 px-3">Quorum Status</th>
                <th className="py-2.5 px-3">Write Availability</th>
                <th className="py-2.5 px-3">Read Availability</th>
                <th className="py-2.5 px-3">Split-Brain Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr className="hover:bg-slate-800/50">
                <td className="py-2.5 px-3 font-bold text-emerald-400">0 Nodes Down (Healthy)</td>
                <td className="py-2.5 px-3">3 of 3 (100%)</td>
                <td className="py-2.5 px-3 font-bold text-emerald-400">Majority (3/3)</td>
                <td className="py-2.5 px-3 text-emerald-400">100% Available</td>
                <td className="py-2.5 px-3 text-emerald-400">100% Available</td>
                <td className="py-2.5 px-3 text-slate-400">0.00%</td>
              </tr>
              <tr className="hover:bg-slate-800/50">
                <td className="py-2.5 px-3 font-bold text-amber-400">1 Node Down (Secondary or Primary)</td>
                <td className="py-2.5 px-3">2 of 3 (66.7%)</td>
                <td className="py-2.5 px-3 font-bold text-emerald-400">Majority (2/3)</td>
                <td className="py-2.5 px-3 text-emerald-400">100% Available (Post-Election)</td>
                <td className="py-2.5 px-3 text-emerald-400">100% Available</td>
                <td className="py-2.5 px-3 text-slate-400">0.00% (Strict Quorum)</td>
              </tr>
              <tr className="hover:bg-slate-800/50">
                <td className="py-2.5 px-3 font-bold text-rose-400">2 Nodes Down (Simultaneous Crash)</td>
                <td className="py-2.5 px-3">1 of 3 (33.3%)</td>
                <td className="py-2.5 px-3 font-bold text-rose-400">No Quorum (1/3 &lt; 2)</td>
                <td className="py-2.5 px-3 text-rose-400">0% (Writes Blocked)</td>
                <td className="py-2.5 px-3 text-amber-400">Read-Only (Secondary Mode)</td>
                <td className="py-2.5 px-3 text-slate-400">0.00% (Prevented by Raft)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
