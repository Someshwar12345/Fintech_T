import React, { useState } from 'react';
import {
  TerminalSquare,
  Search,
  Download,
  Trash2,
  RefreshCw,
  Clock,
  Filter,
} from 'lucide-react';
import { LogEntry } from '../../types';

interface ActivityLogsViewProps {
  logs: LogEntry[];
  onClearLogs: () => void;
  onRefreshLogs: () => void;
}

export const ActivityLogsView: React.FC<ActivityLogsViewProps> = ({
  logs,
  onClearLogs,
  onRefreshLogs,
}) => {
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterComponent, setFilterComponent] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  const filteredLogs = logs.filter((log) => {
    if (filterLevel !== 'all' && log.level !== filterLevel) return false;
    if (filterComponent !== 'all' && log.component !== filterComponent) return false;
    if (search && !log.message.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleExportText = () => {
    const text = logs
      .map((l) => `[${l.timestamp}] [${l.level}] [${l.component}] ${l.message}`)
      .join('\n');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mongodb-replication-logs-${new Date().toISOString().slice(0, 10)}.log`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getBorderColor = (level: string) => {
    switch (level) {
      case 'SUCCESS':
        return 'border-l-2 border-emerald-500';
      case 'WARN':
        return 'border-l-2 border-amber-500';
      case 'ERROR':
        return 'border-l-2 border-rose-500';
      default:
        return 'border-l-2 border-blue-500';
    }
  };

  return (
    <div id="high-density-logs" className="space-y-4 animate-fade-in pb-10 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white">
              System Activity & Replication Telemetry Logs
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600/20 text-blue-400 border border-blue-500/30 font-mono">
              Live Ring Buffer ({logs.length} Entries)
            </span>
          </div>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Diagnostic event stream for heartbeat polls, failover elections, oplog sync, and read/write tests
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={handleExportText}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export .log</span>
          </button>
          <button
            onClick={onClearLogs}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 text-rose-400 hover:bg-rose-950/40 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
          <button
            onClick={onRefreshLogs}
            className="p-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex flex-wrap gap-2 text-xs font-mono">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search log messages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-600 focus:outline-hidden"
          />
        </div>

        <select
          value={filterLevel}
          onChange={(e) => setFilterLevel(e.target.value)}
          className="p-1.5 rounded bg-slate-950 border border-slate-800 text-xs text-slate-200"
        >
          <option value="all">All Levels</option>
          <option value="INFO">INFO</option>
          <option value="SUCCESS">SUCCESS</option>
          <option value="WARN">WARN</option>
          <option value="ERROR">ERROR</option>
        </select>

        <select
          value={filterComponent}
          onChange={(e) => setFilterComponent(e.target.value)}
          className="p-1.5 rounded bg-slate-950 border border-slate-800 text-xs text-slate-200"
        >
          <option value="all">All Components</option>
          <option value="HEARTBEAT">HEARTBEAT</option>
          <option value="ELECTION">ELECTION</option>
          <option value="FAILOVER">FAILOVER</option>
          <option value="REPLICATION">REPLICATION</option>
          <option value="WRITE_CONCERN">WRITE_CONCERN</option>
          <option value="READ_PREFERENCE">READ_PREFERENCE</option>
          <option value="DATABASE">DATABASE</option>
          <option value="REPLICA_SET">REPLICA_SET</option>
        </select>
      </div>

      {/* Logs Container in High Density Terminal Format */}
      <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-2.5 font-mono text-xs max-h-[560px] overflow-y-auto">
        {filteredLogs.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            No log entries found matching filters.
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className={`${getBorderColor(log.level)} pl-3 py-1 bg-slate-950/40 rounded-r hover:bg-slate-950 transition-colors`}
            >
              <div className="flex items-center gap-2 text-[10px] text-slate-500">
                <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                <span>•</span>
                <span className="text-slate-400 font-bold">[{log.component}]</span>
                <span>•</span>
                <span
                  className={
                    log.level === 'SUCCESS'
                      ? 'text-emerald-400 font-bold'
                      : log.level === 'WARN'
                      ? 'text-amber-400 font-bold'
                      : log.level === 'ERROR'
                      ? 'text-rose-400 font-bold'
                      : 'text-blue-400 font-bold'
                  }
                >
                  {log.level}
                </span>
                {log.nodeId && <span className="text-indigo-400">({log.nodeId})</span>}
              </div>
              <div className="text-xs text-slate-200 mt-0.5">{log.message}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
