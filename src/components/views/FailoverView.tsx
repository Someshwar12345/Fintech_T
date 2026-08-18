import React, { useState } from 'react';
import {
  ZapOff,
  Zap,
  RotateCcw,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Vote,
  ShieldCheck,
} from 'lucide-react';
import { ReplicaSetState, FailoverEvent } from '../../types';

interface FailoverViewProps {
  replicaState: ReplicaSetState | null;
  onTriggerFailover: (reason?: string) => Promise<any>;
  onStepDownPrimary: () => void;
  onToggleNode: (nodeId: string) => void;
}

export const FailoverView: React.FC<FailoverViewProps> = ({
  replicaState,
  onTriggerFailover,
  onStepDownPrimary,
  onToggleNode,
}) => {
  const [simulating, setSimulating] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [lastEvent, setLastEvent] = useState<FailoverEvent | null>(
    replicaState?.failoverHistory?.[0] || null
  );

  const primaryNode = replicaState?.nodes.find((n) => n.role === 'PRIMARY');
  const healthyCount = replicaState?.nodes.filter((n) => n.health === 1).length || 0;

  const handleRunStepByStepSimulation = async () => {
    setSimulating(true);
    setCurrentStep(1); // Step 1: Kill Primary

    setTimeout(async () => {
      setCurrentStep(2); // Step 2: Heartbeat timeout & detection

      setTimeout(async () => {
        setCurrentStep(3); // Step 3: Election Term & Raft Voting

        setTimeout(async () => {
          setCurrentStep(4); // Step 4: Election Winner & Primary Promotion
          try {
            const res = await onTriggerFailover('Interactive Failover Simulation via Step-by-Step UI');
            if (res?.failoverEvent) {
              setLastEvent(res.failoverEvent);
            }
          } catch (e) {
            console.error(e);
          } finally {
            setTimeout(() => {
              setSimulating(false);
              setCurrentStep(0);
            }, 1200);
          }
        }, 800);
      }, 800);
    }, 800);
  };

  const steps = [
    {
      num: 1,
      title: 'Primary Heartbeat Lost',
      desc: 'Active primary node fails to respond to 10s heartbeat window',
      color: 'border-rose-500 text-rose-400 bg-rose-500/10',
    },
    {
      num: 2,
      title: 'Election Call Initiated',
      desc: 'Secondaries detect quorum loss and increment term counter',
      color: 'border-amber-500 text-amber-400 bg-amber-500/10',
    },
    {
      num: 3,
      title: 'Raft Voting & Optime Check',
      desc: 'Nodes compare highest optime timestamp to prevent rollback',
      color: 'border-blue-500 text-blue-400 bg-blue-500/10',
    },
    {
      num: 4,
      title: 'New Leader Promoted',
      desc: 'Winning secondary transitions to PRIMARY and opens write pipeline',
      color: 'border-emerald-500 text-emerald-400 bg-emerald-500/10',
    },
  ];

  return (
    <div id="high-density-failover" className="space-y-4 animate-fade-in pb-10 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white">
              Node Failure & Automated Failover Simulation
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20 uppercase font-mono">
              Raft Consensus
            </span>
          </div>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Demonstrates election mechanics, quorum majority (2/3), and zero-data-loss transition in fintech
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onStepDownPrimary}
            disabled={simulating}
            className="px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 text-xs font-mono font-semibold text-slate-300 hover:bg-slate-800 disabled:opacity-50"
          >
            rs.stepDown()
          </button>
          <button
            onClick={handleRunStepByStepSimulation}
            disabled={simulating}
            className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5"
          >
            <Zap className={`w-3.5 h-3.5 ${simulating ? 'animate-bounce' : ''}`} />
            <span>{simulating ? 'Executing Failover...' : 'Trigger Automated Failover'}</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Overview Boxes */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
          <span className="text-slate-500 uppercase text-[10px] tracking-wider block">Current Primary</span>
          <p className="text-lg font-bold text-emerald-400 mt-0.5 truncate">
            {primaryNode ? primaryNode.name.split(' ')[0] : 'NONE (Election Running)'}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
          <span className="text-slate-500 uppercase text-[10px] tracking-wider block">Last Recovery Time</span>
          <p className="text-lg font-bold text-white mt-0.5">
            {lastEvent ? `${lastEvent.durationMs} ms` : '2,420 ms'}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
          <span className="text-slate-500 uppercase text-[10px] tracking-wider block">Election Protocol</span>
          <p className="text-lg font-bold text-indigo-400 mt-0.5">
            MongoDB pv1
          </p>
        </div>
        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
          <span className="text-slate-500 uppercase text-[10px] tracking-wider block">Data Loss Risk</span>
          <p className="text-lg font-bold text-emerald-400 mt-0.5">
            0.00% (Majority)
          </p>
        </div>
      </div>

      {/* Step-by-Step Failover State Machine */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Raft Consensus Failover Sequence (4 Phases)
          </h3>
          <span className="text-[10px] font-mono text-slate-500">
            {simulating ? `Active Phase: Step ${currentStep}/4` : 'Ready for Simulation'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {steps.map((step) => {
            const isActive = currentStep === step.num;
            const isDone = currentStep > step.num;

            return (
              <div
                key={step.num}
                className={`p-3.5 rounded-lg border flex flex-col justify-between space-y-2 transition-all ${
                  isActive
                    ? 'border-blue-500 bg-blue-600/10 shadow-md ring-1 ring-blue-500'
                    : isDone
                    ? 'border-emerald-500/40 bg-emerald-500/5'
                    : 'border-slate-800 bg-slate-950/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs font-bold border ${
                      isActive
                        ? 'bg-blue-500 text-white border-blue-400'
                        : isDone
                        ? 'bg-emerald-500 text-white border-emerald-400'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {step.num}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">Phase {step.num}</span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-white">{step.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Failover History Audit Trail */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3 font-mono text-xs">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
          Failover Event Audit Trail (Timestamped)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-500 uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Demoted Primary</th>
                <th className="py-2.5 px-3">Elected New Primary</th>
                <th className="py-2.5 px-3">Recovery Duration</th>
                <th className="py-2.5 px-3">Reason</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {replicaState?.failoverHistory && replicaState.failoverHistory.length > 0 ? (
                replicaState.failoverHistory.map((ev, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/50">
                    <td className="py-2.5 px-3 text-[11px] text-slate-400">
                      {new Date(ev.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-2.5 px-3 text-rose-400 font-bold">{ev.oldPrimaryId || 'mongo-node-1'}</td>
                    <td className="py-2.5 px-3 text-emerald-400 font-bold">{ev.newPrimaryId}</td>
                    <td className="py-2.5 px-3 text-white font-bold">{ev.durationMs} ms</td>
                    <td className="py-2.5 px-3 text-slate-400 text-[11px] font-sans truncate max-w-[200px]">
                      {ev.reason}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        SUCCESS
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-500 font-sans">
                    No failover events recorded yet. Click "Trigger Automated Failover" to run test.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
