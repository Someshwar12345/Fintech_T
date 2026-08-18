import React, { useEffect, useState } from 'react';
import { X, Download, Copy, Check, FileJson, HardDrive, RefreshCw } from 'lucide-react';
import { API } from '../lib/api';
import { SystemMetricsExport } from '../types';

interface ExportMetricsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportMetricsModal: React.FC<ExportMetricsModalProps> = ({ isOpen, onClose }) => {
  const [data, setData] = useState<SystemMetricsExport | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchExportData();
    }
  }, [isOpen]);

  const fetchExportData = async () => {
    setLoading(true);
    try {
      const result = await API.getSystemMetricsExport();
      setData(result);
    } catch (err) {
      console.error('Failed to load export metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadJson = () => {
    if (!data) return;
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const filename = `mongodb-replication-analysis-metrics-${new Date().toISOString().slice(0, 10)}.json`;
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  const handleCopy = () => {
    if (!data) return;
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div
      id="export-metrics-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        id="export-metrics-modal"
        className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <FileJson className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Export System Metrics & Test Logs (Desktop JSON)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Complete dataset summary, replication logs, failovers, consistency & CAP conclusions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-300">
            <div className="flex items-center space-x-2">
              <HardDrive className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>
                Export includes 15,000 transactions audit, 3-node replication health, failover timeline, read/write benchmarks, and GM University MCA assignment metadata.
              </span>
            </div>
            <button
              onClick={fetchExportData}
              disabled={loading}
              className="px-2.5 py-1 rounded bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 font-semibold hover:bg-emerald-100 dark:hover:bg-slate-700 transition-colors flex items-center space-x-1"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center space-y-2 text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin text-emerald-500" />
              <p className="text-xs">Generating JSON snapshot...</p>
            </div>
          ) : data ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono">
                <span>File: mongodb-replication-analysis-metrics.json</span>
                <span>Size: ~{(JSON.stringify(data).length / 1024).toFixed(1)} KB</span>
              </div>
              <pre className="p-4 rounded-xl bg-slate-900 text-emerald-400 text-xs font-mono overflow-x-auto max-h-80 border border-slate-800 leading-relaxed select-all">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          ) : (
            <p className="text-xs text-rose-500">Failed to generate export data.</p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
          <button
            onClick={handleCopy}
            disabled={!data}
            className="flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied to Clipboard' : 'Copy JSON'}</span>
          </button>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
            >
              Close
            </button>
            <button
              id="btn-confirm-download-json"
              onClick={handleDownloadJson}
              disabled={!data}
              className="flex items-center space-x-2 px-5 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all"
            >
              {downloaded ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
              <span>{downloaded ? 'Downloaded to Desktop!' : 'Save JSON to Desktop'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
