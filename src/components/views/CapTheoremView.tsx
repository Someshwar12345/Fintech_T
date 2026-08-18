import React, { useState } from 'react';
import {
  Boxes,
  ShieldCheck,
  Zap,
  Layers,
  Network,
} from 'lucide-react';

export const CapTheoremView: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState<'default' | 'partition' | 'analytical'>('default');

  return (
    <div id="high-density-cap" className="space-y-4 animate-fade-in pb-10 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white">
              CAP Theorem & MongoDB Distributed Trade-Offs
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600/20 text-blue-400 border border-blue-500/30 font-mono">
              CP by Default • Tunable AP
            </span>
          </div>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Eric Brewer's CAP Theorem and Daniel Abadi's PACELC Theorem in fintech replication
          </p>
        </div>
      </div>

      {/* 3 Pillars Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Consistency */}
        <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-2 font-mono text-xs">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase">
            <ShieldCheck className="w-4 h-4" />
            <span>Consistency (C)</span>
          </div>
          <p className="text-xs text-slate-400 font-sans leading-relaxed">
            Every client read receives the most recent write or errors out. MongoDB guarantees strict linearizability with <code className="text-indigo-400 font-bold">w: "majority"</code> and primary reads.
          </p>
          <div className="p-2 bg-slate-950 rounded border border-slate-800 text-[10px] text-emerald-400">
            Primary Read: Zero Stale Reads
          </div>
        </div>

        {/* Availability */}
        <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-2 font-mono text-xs">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase">
            <Zap className="w-4 h-4" />
            <span>Availability (A)</span>
          </div>
          <p className="text-xs text-slate-400 font-sans leading-relaxed">
            Non-failing nodes return responses. Reading from secondaries yields 99.99% read uptime even during failover elections when writes are temporarily paused.
          </p>
          <div className="p-2 bg-slate-950 rounded border border-slate-800 text-[10px] text-blue-400">
            Secondary Read: Continuous Reads
          </div>
        </div>

        {/* Partition Tolerance */}
        <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-2 font-mono text-xs">
          <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase">
            <Network className="w-4 h-4" />
            <span>Partition Tolerance (P)</span>
          </div>
          <p className="text-xs text-slate-400 font-sans leading-relaxed">
            System continues operating despite arbitrary message loss or network partitions. Handled by Raft election term validation and majority quorum (2 of 3).
          </p>
          <div className="p-2 bg-slate-950 rounded border border-slate-800 text-[10px] text-purple-400">
            Majority Quorum: (3/2) + 1 = 2 Nodes
          </div>
        </div>
      </div>

      {/* Interactive Scenario Sandbox */}
      <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Interactive Scenario Sandbox: CP vs AP Trade-offs
          </h3>
          <div className="flex gap-1.5 font-mono text-xs">
            <button
              onClick={() => setSelectedScenario('default')}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                selectedScenario === 'default'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Default CP Mode
            </button>
            <button
              onClick={() => setSelectedScenario('partition')}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                selectedScenario === 'partition'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Partition (Loss of Quorum)
            </button>
            <button
              onClick={() => setSelectedScenario('analytical')}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                selectedScenario === 'analytical'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Tunable AP Mode
            </button>
          </div>
        </div>

        <div className="p-4 rounded bg-slate-950 border border-slate-800 font-mono text-xs space-y-3">
          {selectedScenario === 'default' && (
            <div>
              <h4 className="text-emerald-400 font-bold mb-1">CP Configuration (Fintech Recommended)</h4>
              <p className="text-slate-300 font-sans leading-relaxed text-xs">
                Write Concern <code className="text-emerald-400 font-bold">w: "majority"</code> + Read Preference <code className="text-blue-400 font-bold">"primary"</code> ensures all financial balances and transaction logs remain 100% consistent across all nodes.
              </p>
            </div>
          )}

          {selectedScenario === 'partition' && (
            <div>
              <h4 className="text-rose-400 font-bold mb-1">Network Partition Behavior (Majority Loss)</h4>
              <p className="text-slate-300 font-sans leading-relaxed text-xs">
                When 2 of 3 nodes are disconnected, the isolated primary detects the absence of heartbeats from the majority and steps down to SECONDARY. New writes are rejected to protect consistency and prevent split-brain syndrome.
              </p>
            </div>
          )}

          {selectedScenario === 'analytical' && (
            <div>
              <h4 className="text-blue-400 font-bold mb-1">Tunable AP Configuration (Reporting & Analytics)</h4>
              <p className="text-slate-300 font-sans leading-relaxed text-xs">
                Read Preference <code className="text-blue-400 font-bold">"secondaryPreferred"</code> enables clients to continue querying read-only dashboards and financial statements even during primary elections or network failures.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
