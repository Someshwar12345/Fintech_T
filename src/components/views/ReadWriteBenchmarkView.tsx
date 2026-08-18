import React, { useState } from 'react';
import {
  Gauge,
  Play,
  Clock,
  CheckCircle,
  Database,
  ArrowDownUp,
  Cpu,
  Layers,
  RefreshCw,
  Sliders,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { API } from '../../lib/api';
import { ReadPreference, WriteConcern, ReadTestResult, WriteTestResult } from '../../types';

export const ReadWriteBenchmarkView: React.FC = () => {
  // Read test state
  const [readPref, setReadPref] = useState<ReadPreference>('primary');
  const [readCount, setReadCount] = useState<number>(100);
  const [runningRead, setRunningRead] = useState<boolean>(false);
  const [readResult, setReadResult] = useState<ReadTestResult | null>(null);

  // Write test state
  const [writeConcern, setWriteConcern] = useState<WriteConcern>('majority');
  const [writeBatchSize, setWriteBatchSize] = useState<number>(50);
  const [runningWrite, setRunningWrite] = useState<boolean>(false);
  const [writeResult, setWriteResult] = useState<WriteTestResult | null>(null);

  const handleExecuteReadTest = async () => {
    setRunningRead(true);
    try {
      const res = await API.runReadTest(readPref, readCount);
      setReadResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setRunningRead(false);
    }
  };

  const handleExecuteWriteTest = async () => {
    setRunningWrite(true);
    try {
      const res = await API.runWriteTest(writeConcern, writeBatchSize);
      setWriteResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setRunningWrite(false);
    }
  };

  return (
    <div id="high-density-benchmark" className="space-y-4 animate-fade-in pb-10 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white">
              Read / Write Performance & Replica SLA Benchmarking
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600/20 text-blue-400 border border-blue-500/30 font-mono">
              Live MongoDB Driver
            </span>
          </div>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Test Read Preferences (primary, secondaryPreferred, nearest) and Write Concerns (w:1, w:majority, w:3)
          </p>
        </div>
      </div>

      {/* 2-Column Benchmark Grid: Read Suite vs Write Suite */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 1. READ PREFERENCE BENCHMARK */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                1. Read Preference Benchmarking
              </h3>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Query Distribution
              </span>
            </div>

            {/* Read Config Form */}
            <div className="space-y-3 mt-3 font-mono text-xs">
              <div>
                <label className="text-[10px] uppercase text-slate-500 block mb-1">
                  Select Read Preference
                </label>
                <select
                  value={readPref}
                  onChange={(e) => setReadPref(e.target.value as ReadPreference)}
                  className="w-full p-2 rounded bg-slate-950 border border-slate-800 text-xs text-white"
                >
                  <option value="primary">primary (Strict Linearizability - Default)</option>
                  <option value="primaryPreferred">primaryPreferred (Primary with Secondary Fallback)</option>
                  <option value="secondary">secondary (Secondary Only - Read Scaling)</option>
                  <option value="secondaryPreferred">secondaryPreferred (Secondary Priority)</option>
                  <option value="nearest">nearest (Lowest Network Ping Latency)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase text-slate-500 block mb-1">
                  Sample Query Count: <strong className="text-white">{readCount}</strong>
                </label>
                <input
                  type="range"
                  min="20"
                  max="500"
                  step="20"
                  value={readCount}
                  onChange={(e) => setReadCount(parseInt(e.target.value, 10))}
                  className="w-full accent-blue-500 bg-slate-950"
                />
              </div>

              <button
                onClick={handleExecuteReadTest}
                disabled={runningRead}
                className="w-full py-2 px-3 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {runningRead ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                <span>{runningRead ? 'Benchmarking Reads...' : `Execute ${readCount} Read Queries`}</span>
              </button>
            </div>
          </div>

          {/* Read Benchmark Output */}
          {readResult && (
            <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center text-[10px] text-slate-500 uppercase border-b border-slate-800 pb-1.5">
                <span>Read Benchmark Output</span>
                <span className="text-emerald-400 font-bold">200 OK</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-2 bg-slate-900 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block">Avg Latency</span>
                  <p className="text-base font-bold text-white mt-0.5">{readResult.averageLatencyMs} ms</p>
                </div>
                <div className="p-2 bg-slate-900 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block">Stale Read Risk</span>
                  <p className="text-base font-bold text-amber-400 mt-0.5">{readResult.staleReadCount} txns</p>
                </div>
              </div>

              {/* Node Distribution Breakdown */}
              <div className="space-y-1.5 text-xs pt-1">
                <span className="text-[10px] font-semibold text-slate-500 uppercase block">
                  Queries Served per Node:
                </span>
                {Object.entries(readResult.nodeDistribution).map(([nodeName, count]) => {
                  const numCount = typeof count === 'number' ? count : Number(count);
                  const pct = Math.round((numCount / readResult.queryCount) * 100);
                  return (
                    <div key={nodeName} className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-300 truncate max-w-[200px]">{nodeName}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500">({numCount} txns)</span>
                        <strong className="text-emerald-400">{pct}%</strong>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 2. WRITE CONCERN BENCHMARK */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                2. Write Concern Benchmarking
              </h3>
              <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                Data Durability
              </span>
            </div>

            {/* Write Config Form */}
            <div className="space-y-3 mt-3 font-mono text-xs">
              <div>
                <label className="text-[10px] uppercase text-slate-500 block mb-1">
                  Select Write Concern Level
                </label>
                <select
                  value={writeConcern}
                  onChange={(e) => setWriteConcern(e.target.value as WriteConcern)}
                  className="w-full p-2 rounded bg-slate-950 border border-slate-800 text-xs text-white"
                >
                  <option value="1">w: 1 (Primary Node Only - Fastest Write)</option>
                  <option value="majority">w: "majority" (2 of 3 Nodes - Zero Data Loss)</option>
                  <option value="3">w: 3 (All 3 Nodes Acknowledged - Max Safety)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase text-slate-500 block mb-1">
                  Batch Size: <strong className="text-white">{writeBatchSize}</strong>
                </label>
                <input
                  type="range"
                  min="10"
                  max="200"
                  step="10"
                  value={writeBatchSize}
                  onChange={(e) => setWriteBatchSize(parseInt(e.target.value, 10))}
                  className="w-full accent-blue-500 bg-slate-950"
                />
              </div>

              <button
                onClick={handleExecuteWriteTest}
                disabled={runningWrite}
                className="w-full py-2 px-3 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {runningWrite ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                <span>{runningWrite ? 'Benchmarking Writes...' : `Insert ${writeBatchSize} Transactions`}</span>
              </button>
            </div>
          </div>

          {/* Write Benchmark Output */}
          {writeResult && (
            <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center text-[10px] text-slate-500 uppercase border-b border-slate-800 pb-1.5">
                <span>Write Benchmark Output</span>
                <span className="text-emerald-400 font-bold">ACKNOWLEDGED</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-2 bg-slate-900 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block">Total Duration</span>
                  <p className="text-base font-bold text-white mt-0.5">{writeResult.durationMs} ms</p>
                </div>
                <div className="p-2 bg-slate-900 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block">Throughput</span>
                  <p className="text-base font-bold text-emerald-400 mt-0.5">{writeResult.throughputOpsPerSec} ops/sec</p>
                </div>
              </div>

              <div className="flex justify-between items-center text-[11px] pt-1">
                <span className="text-slate-400">Acknowledged Nodes:</span>
                <span className="text-indigo-400 font-bold">
                  {writeResult.acknowledgedNodesCount} Nodes ({writeResult.writeConcern})
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
