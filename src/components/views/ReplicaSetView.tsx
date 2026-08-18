import React from 'react';
import {
  Network,
  Server,
  Zap,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Clock,
  Radio,
  Share2,
} from 'lucide-react';
import { ReplicaSetState, ReplicaNode } from '../../types';

interface ReplicaSetViewProps {
  replicaState: ReplicaSetState | null;
  onToggleNode: (nodeId: string) => void;
  onTriggerFailover: () => void;
  onStepDownPrimary: () => void;
}

export const ReplicaSetView: React.FC<ReplicaSetViewProps> = ({
  replicaState,
  onToggleNode,
  onTriggerFailover,
  onStepDownPrimary,
}) => {
  const healthyCount = replicaState?.nodes.filter((n) => n.health === 1).length || 0;
  const primaryNode = replicaState?.nodes.find((n) => n.role === 'PRIMARY');

  return (
    <div id="high-density-replicaset" className="space-y-4 animate-fade-in pb-10 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white">
              MongoDB Replica Set Architecture & Node Monitoring
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600/20 text-blue-400 border border-blue-500/30 font-mono">
              rs0 (3 Voting Members)
            </span>
          </div>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Protocol pv1 • Heartbeat interval: 2,000ms • Election timeout: 10,000ms
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onStepDownPrimary}
            className="px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 text-xs font-mono font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            rs.stepDown()
          </button>
          <button
            onClick={onTriggerFailover}
            className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all"
          >
            Trigger Failover Test
          </button>
        </div>
      </div>

      {/* Cluster Health & Consensus Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
          <span className="text-slate-500 uppercase text-[10px] tracking-wider block">Active Quorum</span>
          <p className="text-lg font-bold text-emerald-400 mt-0.5">
            {healthyCount} / 3 Nodes ({healthyCount >= 2 ? 'Majority OK' : 'No Majority'})
          </p>
        </div>
        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
          <span className="text-slate-500 uppercase text-[10px] tracking-wider block">Active Primary</span>
          <p className="text-lg font-bold text-white mt-0.5 truncate">
            {primaryNode ? primaryNode.name.split(' ')[0] : 'NONE (In Election)'}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
          <span className="text-slate-500 uppercase text-[10px] tracking-wider block">Current Term</span>
          <p className="text-lg font-bold text-indigo-400 mt-0.5">
            Term {replicaState?.term || 1}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
          <span className="text-slate-500 uppercase text-[10px] tracking-wider block">Replication Sync</span>
          <p className="text-lg font-bold text-blue-400 mt-0.5">
            Oplog Streamed 100%
          </p>
        </div>
      </div>

      {/* 3 Node Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {replicaState?.nodes.map((node, index) => {
          const isPrimary = node.role === 'PRIMARY';
          const isDown = node.health === 0;

          return (
            <div
              key={node.id}
              className={`bg-slate-900 border rounded-lg p-4 flex flex-col justify-between space-y-4 transition-all ${
                isDown
                  ? 'border-rose-500/40 opacity-80'
                  : isPrimary
                  ? 'border-emerald-500/50 shadow-xs'
                  : 'border-slate-800'
              }`}
            >
              {/* Node Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-md border flex items-center justify-center font-mono font-black text-xs ${
                      isDown
                        ? 'bg-rose-500/20 border-rose-500 text-rose-400'
                        : isPrimary
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                        : 'bg-blue-500/20 border-blue-500 text-blue-400'
                    }`}
                  >
                    {isDown ? 'X' : isPrimary ? 'P' : 'S'}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white font-mono">{node.name}</h3>
                    <p className="text-[10px] text-slate-500 font-mono">
                      {node.host}:{node.port}
                    </p>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border font-mono ${
                    isDown
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      : isPrimary
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                  }`}
                >
                  {node.role}
                </span>
              </div>

              {/* Node Telemetry Grid */}
              <div className="space-y-2 text-xs font-mono divide-y divide-slate-800/60 pt-1">
                <div className="flex justify-between items-center py-1">
                  <span className="text-[10px] text-slate-500 uppercase">State / Health</span>
                  <span className={isDown ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                    {isDown ? '0 (OFFLINE)' : '1 (HEALTHY)'}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-[10px] text-slate-500 uppercase">Ping Latency</span>
                  <span className="text-white">{isDown ? 'TIMEOUT' : `${node.pingLatencyMs} ms`}</span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-[10px] text-slate-500 uppercase">Replication Lag</span>
                  <span className={node.replicationLagMs > 30 ? 'text-amber-400 font-bold' : 'text-slate-300'}>
                    {isDown ? 'N/A' : isPrimary ? '0 ms (Source)' : `${node.replicationLagMs} ms`}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-[10px] text-slate-500 uppercase">Priority / Votes</span>
                  <span className="text-slate-300">
                    Priority {node.priority} • {node.votes} Vote
                  </span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-[10px] text-slate-500 uppercase">Queries Served</span>
                  <span className="text-slate-300">
                    {node.totalReadsServed.toLocaleString()} R / {node.totalWritesServed.toLocaleString()} W
                  </span>
                </div>

                <div className="py-1">
                  <span className="text-[10px] text-slate-500 uppercase block mb-0.5">Last Heartbeat</span>
                  <p className="text-[10px] text-slate-400 truncate" title={node.lastHeartbeatMessage}>
                    {node.lastHeartbeatMessage || 'Heartbeat response received OK'}
                  </p>
                </div>
              </div>

              {/* Node Action Button */}
              <div className="pt-2 border-t border-slate-800">
                <button
                  onClick={() => onToggleNode(node.id)}
                  className={`w-full py-1.5 px-3 rounded text-xs font-bold transition-all ${
                    isDown
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30'
                  }`}
                >
                  {isDown ? 'Restart Node (Power ON)' : 'Simulate Crash (Kill Node)'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Oplog & Synchronization Architecture Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3 font-mono">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
          Replication Mechanism: local.oplog.rs & WiredTiger Storage Engine
        </h3>
        <p className="text-xs text-slate-400 font-sans leading-relaxed">
          In MongoDB replication, writes are initially recorded into the WiredTiger journal and the capped collection <code className="text-emerald-400">local.oplog.rs</code> on the PRIMARY node. Secondary members continuously poll the primary via tailable cursors and replay operations asynchronously, maintaining causal consistency.
        </p>

        <div className="p-3 bg-slate-950 rounded border border-slate-800 text-[11px] space-y-1 text-slate-300">
          <div><strong className="text-indigo-400">Oplog Size:</strong> 2048 MB (Capped)</div>
          <div><strong className="text-emerald-400">Replication Protocol:</strong> Version 1 (Raft-style leader election & term counters)</div>
          <div><strong className="text-blue-400">Sync Source:</strong> Automatic chaining enabled with ping latency-based peer selection</div>
        </div>
      </div>
    </div>
  );
};
