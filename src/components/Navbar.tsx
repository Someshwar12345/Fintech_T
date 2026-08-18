import React from 'react';
import {
  Server,
  Download,
  Moon,
  Sun,
  RefreshCw,
  Sparkles,
  Zap,
  Menu,
  X,
} from 'lucide-react';
import { ReplicaSetState } from '../types';

interface NavbarProps {
  darkMode: boolean;
  onToggleTheme: () => void;
  onOpenExport: () => void;
  onOpenAi: () => void;
  onToggleSidebar: () => void;
  replicaState?: ReplicaSetState | null;
  onTriggerFailover?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  darkMode,
  onToggleTheme,
  onOpenExport,
  onOpenAi,
  onToggleSidebar,
  replicaState,
  onTriggerFailover,
}) => {
  const healthyCount = replicaState?.nodes.filter((n) => n.health === 1).length || 0;
  const isConnected = replicaState?.isRealMongoConnected;
  const primaryNode = replicaState?.nodes.find((n) => n.role === 'PRIMARY');
  const uptimeSec = primaryNode?.uptimeSeconds || 511924;
  const uptimeFormatted = `${Math.floor(uptimeSec / 3600)}h ${Math.floor((uptimeSec % 3600) / 60)}m ${uptimeSec % 60}s`;

  return (
    <header
      id="high-density-header"
      className="h-14 bg-slate-900/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-slate-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30 select-none"
    >
      {/* Left status chips & mobile menu toggle */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white lg:hidden transition-colors"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-mono hidden sm:inline">Status:</span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${
                healthyCount >= 2
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              }`}
            >
              {healthyCount >= 2 ? 'Healthy (Quorum 2/3)' : 'Degraded (No Quorum)'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-mono hidden sm:inline">Mode:</span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${
                isConnected
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
              }`}
            >
              {isConnected ? 'LIVE MONGO' : 'DEMO MODE'}
            </span>
          </div>

          <div className="hidden xl:flex items-center gap-1.5 text-xs font-mono text-slate-400">
            <span className="text-slate-500">ReplicaSet:</span>
            <span className="text-blue-400 font-bold">rs0 (pv1)</span>
          </div>
        </div>
      </div>

      {/* Right controls & high-density action buttons */}
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="text-right hidden md:block">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Cluster Uptime</div>
          <div className="text-xs font-mono text-slate-300 font-semibold">{uptimeFormatted}</div>
        </div>

        {/* AI Analysis Button */}
        <button
          id="btn-ai-analyze-nav"
          onClick={onOpenAi}
          className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs px-2.5 sm:px-3 py-1.5 rounded-md font-semibold transition-colors"
          title="Run Gemini AI Replica Health Audit"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">AI Audit</span>
        </button>

        {/* Export JSON Button */}
        <button
          id="btn-export-json-nav"
          onClick={onOpenExport}
          className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs px-2.5 sm:px-3 py-1.5 rounded-md font-semibold transition-colors"
          title="Export metrics directly as JSON"
        >
          <Download className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Export JSON</span>
        </button>

        {/* Failover Quick Trigger */}
        {onTriggerFailover && (
          <button
            onClick={onTriggerFailover}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1.5 rounded-md font-bold transition-all shadow-xs"
            title="Execute automatic failover test"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Run Failover Test</span>
          </button>
        )}

        {/* Theme toggle */}
        <button
          onClick={onToggleTheme}
          className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Toggle theme"
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-400" />}
        </button>
      </div>
    </header>
  );
};
