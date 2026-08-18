import React, { useEffect, useState } from 'react';
import {
  Server,
  Zap,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Clock,
  Radio,
  Eye,
  ShieldCheck,
  Cpu,
  Layers,
  Database,
} from 'lucide-react';
import { ReplicaSetState, Transaction, TabId } from '../../types';
import { API } from '../../lib/api';

interface DashboardViewProps {
  replicaState: ReplicaSetState | null;
  onSelectTab: (tab: TabId) => void;
  onSelectTransaction: (tx: Transaction) => void;
  onToggleNode: (nodeId: string) => void;
  onTriggerFailover: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  replicaState,
  onSelectTab,
  onSelectTransaction,
  onToggleNode,
  onTriggerFailover,
}) => {
  const [recentTxns, setRecentTxns] = useState<Transaction[]>([]);
  const [loadingTxns, setLoadingTxns] = useState(false);

  useEffect(() => {
    const fetchRecent = async () => {
      setLoadingTxns(true);
      try {
        const res = await API.getTransactions({ page: 1, pageSize: 6 });
        setRecentTxns(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingTxns(false);
      }
    };
    fetchRecent();
  }, []);

  const healthyCount = replicaState?.nodes.filter((n) => n.health === 1).length || 0;
  const primaryNode = replicaState?.nodes.find((n) => n.role === 'PRIMARY');
  const secondaryNodes = replicaState?.nodes.filter((n) => n.role === 'SECONDARY') || [];

  return (
    <div id="high-density-dashboard" className="space-y-4 animate-fade-in pb-10">
      {/* 4 Top KPI Stat Boxes */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Transactions */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg flex flex-col justify-between">
          <div>
            <div className="text-xs text-slate-500 uppercase font-semibold tracking-wider">
              Total Transactions
            </div>
            <div className="text-3xl font-bold mt-1 text-white font-mono">15,000</div>
          </div>
          <div className="text-xs text-emerald-400 flex items-center gap-1 font-mono mt-3">
            +0.00% Write Success Rate
          </div>
        </div>

        {/* Avg Latency */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg flex flex-col justify-between">
          <div>
            <div className="text-xs text-slate-500 uppercase font-semibold tracking-wider">
              Avg Latency
            </div>
            <div className="text-3xl font-bold mt-1 text-white font-mono">
              14.2<span className="text-sm text-slate-500 ml-1 font-sans">ms</span>
            </div>
          </div>
          <div className="text-xs text-slate-400 font-mono mt-3">
            Local Read: 2ms | Remote: 28ms
          </div>
        </div>

        {/* Replication Lag */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg flex flex-col justify-between">
          <div>
            <div className="text-xs text-slate-500 uppercase font-semibold tracking-wider">
              Replication Lag
            </div>
            <div className="text-3xl font-bold mt-1 text-white font-mono">
              0.8<span className="text-sm text-slate-500 ml-1 font-sans">sec</span>
            </div>
          </div>
          <div
            onClick={() => onSelectTab('consistency')}
            className="text-xs text-blue-400 font-mono underline cursor-pointer mt-3 hover:text-blue-300"
          >
            Sync Status: Majority Quorum
          </div>
        </div>

        {/* Availability */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg flex flex-col justify-between">
          <div>
            <div className="text-xs text-slate-500 uppercase font-semibold tracking-wider">
              Availability
            </div>
            <div className="text-3xl font-bold mt-1 text-white font-mono">
              99.99<span className="text-sm text-slate-500 ml-1 font-sans">%</span>
            </div>
          </div>
          <div className="text-xs text-slate-400 font-mono italic mt-3">
            ReplicaSet (n=3) active
          </div>
        </div>
      </section>

      {/* Main Grid: Architecture Visualizer + Activity Log */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Replica Set Architecture (col-span-2) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Replica Set Architecture: fintech_replication (rs0)
            </h3>
            <div className="text-[10px] text-slate-500 font-mono">
              Visualizing Node Consensus • Protocol pv1
            </div>
          </div>

          {/* Node Consensus Visualization Diagram */}
          <div className="py-6 px-4 relative flex items-center justify-around">
            {/* Connecting Horizontal Bus Line */}
            <div className="absolute top-1/2 left-[15%] right-[15%] h-[2px] bg-slate-800 -z-0" />

            {replicaState?.nodes.map((node) => {
              const isPrimary = node.role === 'PRIMARY';
              const isDown = node.health === 0;

              return (
                <div key={node.id} className="relative z-10 flex flex-col items-center gap-2">
                  <button
                    onClick={() => onToggleNode(node.id)}
                    title={`Click to toggle ${node.name}`}
                    className={`w-14 h-14 rounded-full border-2 flex items-center justify-center font-black text-sm transition-transform active:scale-95 shadow-md ${
                      isDown
                        ? 'bg-rose-500/20 border-rose-500 text-rose-500'
                        : isPrimary
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-emerald-500/20'
                        : 'bg-blue-500/20 border-blue-500 text-blue-400'
                    }`}
                  >
                    {isDown ? 'X' : isPrimary ? 'P' : 'S'}
                  </button>

                  <div className="text-center">
                    <div className="text-[11px] text-white font-mono font-bold">
                      {node.name.split(' ')[0]} ({node.host.split('.')[0]})
                    </div>
                    <div className="text-[9px] text-slate-400 uppercase tracking-tight mt-0.5">
                      {isDown
                        ? 'Down / Offline'
                        : isPrimary
                        ? 'Primary / Healthy'
                        : `Secondary / Lag: ${node.replicationLagMs}ms`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Node Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800/80 text-xs">
            <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
              <span>Active Quorum: <strong className="text-white">{healthyCount}/3</strong></span>
              <span>•</span>
              <span>Term: <strong className="text-indigo-400">Term {replicaState?.term || 1}</strong></span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onSelectTab('replica-set')}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Inspect 3 Nodes
              </button>
              <button
                onClick={() => onTriggerFailover('Automated Failover via Dashboard')}
                className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
              >
                Simulate Failover
              </button>
            </div>
          </div>
        </div>

        {/* System Activity Log (col-span-1) */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col justify-between space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
              System Activity Log
            </h3>
            <button
              onClick={() => onSelectTab('logs')}
              className="text-[10px] text-blue-400 hover:underline font-mono"
            >
              View All
            </button>
          </div>

          <div className="flex-1 space-y-2.5 text-xs overflow-hidden">
            <div className="border-l-2 border-emerald-500 pl-3 py-0.5">
              <div className="text-[10px] text-slate-500 font-mono">12:04:15 - [DB_OP]</div>
              <div className="text-xs text-slate-300">Bulk Insert: 500 records processed</div>
            </div>

            <div className="border-l-2 border-blue-500 pl-3 py-0.5">
              <div className="text-[10px] text-slate-500 font-mono">12:04:12 - [RS_MON]</div>
              <div className="text-xs text-slate-300">Heartbeat from mongo-node-3 received</div>
            </div>

            <div className="border-l-2 border-amber-500 pl-3 py-0.5">
              <div className="text-[10px] text-slate-500 font-mono">12:03:55 - [TEST]</div>
              <div className="text-xs text-slate-300">Read Preference: secondaryPreferred</div>
            </div>

            <div className="border-l-2 border-emerald-500 pl-3 py-0.5">
              <div className="text-[10px] text-slate-500 font-mono">12:03:40 - [DB_OP]</div>
              <div className="text-xs text-slate-300">Write Majority Concern: Success</div>
            </div>

            <div className="border-l-2 border-slate-700 pl-3 py-0.5 opacity-60">
              <div className="text-[10px] text-slate-500 font-mono">12:03:10 - [INIT]</div>
              <div className="text-xs text-slate-300">System initialized in HIGH-DENSITY MODE</div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Grid: CAP Theorem Progress + Transaction Type Distribution */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* CAP Theorem Analysis */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
              CAP Theorem Analysis
            </h3>
            <button
              onClick={() => onSelectTab('cap-theorem')}
              className="text-[10px] text-blue-400 hover:underline font-mono"
            >
              Details
            </button>
          </div>

          <div className="space-y-2.5">
            <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
              <div className="flex justify-between text-[10px] font-bold mb-1">
                <span className="text-slate-400">CONSISTENCY (w: majority)</span>
                <span className="text-blue-400 font-mono">HIGH (98.5%)</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full" style={{ width: '90%' }} />
              </div>
            </div>

            <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
              <div className="flex justify-between text-[10px] font-bold mb-1">
                <span className="text-slate-400">AVAILABILITY (Secondary Read)</span>
                <span className="text-emerald-400 font-mono">MAX (99.99%)</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full" style={{ width: '100%' }} />
              </div>
            </div>

            <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
              <div className="flex justify-between text-[10px] font-bold mb-1">
                <span className="text-slate-400">PARTITION TOLERANCE (Raft)</span>
                <span className="text-purple-400 font-mono">STRICT (2/3 Quorum)</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full" style={{ width: '100%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Distribution by Transaction Type */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Distribution by Transaction Type (15,000 Records)
            </h3>
            <button
              onClick={() => onSelectTab('charts')}
              className="text-[10px] text-blue-400 hover:underline font-mono"
            >
              Analytics Charts
            </button>
          </div>

          <div className="flex items-end justify-between h-20 gap-2 px-4">
            <div className="w-1/6 bg-blue-500/30 border-t-2 border-blue-400 rounded-t" style={{ height: '80%' }} />
            <div className="w-1/6 bg-emerald-500/30 border-t-2 border-emerald-400 rounded-t" style={{ height: '45%' }} />
            <div className="w-1/6 bg-purple-500/30 border-t-2 border-purple-400 rounded-t" style={{ height: '90%' }} />
            <div className="w-1/6 bg-amber-500/30 border-t-2 border-amber-400 rounded-t" style={{ height: '30%' }} />
            <div className="w-1/6 bg-slate-700/30 border-t-2 border-slate-400 rounded-t" style={{ height: '60%' }} />
            <div className="w-1/6 bg-red-500/30 border-t-2 border-red-400 rounded-t" style={{ height: '15%' }} />
          </div>

          <div className="flex justify-between text-[9px] text-slate-500 mt-2 uppercase tracking-tighter font-mono">
            <span>Wire</span>
            <span>Card</span>
            <span>P2P</span>
            <span>POS</span>
            <span>FX</span>
            <span>Crypto</span>
          </div>
        </div>
      </section>

      {/* Recent Transactions Table in High Density Format */}
      <section className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Latest Replicated Financial Transactions (from 15,000 Ledger)
          </h3>
          <button
            onClick={() => onSelectTab('transactions')}
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
          >
            <span>Explore 15,000 Ledger</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-500 uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Transaction ID</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Account</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Method</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {recentTxns.map((tx) => (
                <tr
                  key={tx.transaction_id}
                  onClick={() => onSelectTransaction(tx)}
                  className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                >
                  <td className="py-2.5 px-3 font-bold text-white">
                    {tx.transaction_id}
                  </td>
                  <td className="py-2.5 px-3 font-sans">{tx.transaction_type}</td>
                  <td className="py-2.5 px-3 text-slate-400">{tx.account_id}</td>
                  <td className="py-2.5 px-3 font-bold text-emerald-400">
                    {tx.currency} {tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 font-sans">{tx.payment_method}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                        tx.status === 'SETTLED' || tx.status === 'CLEARED'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : tx.status === 'PENDING'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}
                    >
                      {tx.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTransaction(tx);
                      }}
                      className="p-1 rounded text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
