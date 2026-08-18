import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { TransactionModal } from './components/TransactionModal';
import { ExportMetricsModal } from './components/ExportMetricsModal';
import { AiAnalysisModal } from './components/AiAnalysisModal';

// Views
import { DashboardView } from './components/views/DashboardView';
import { TransactionsView } from './components/views/TransactionsView';
import { ReplicaSetView } from './components/views/ReplicaSetView';
import { FailoverView } from './components/views/FailoverView';
import { ReadWriteBenchmarkView } from './components/views/ReadWriteBenchmarkView';
import { ConsistencyView } from './components/views/ConsistencyView';
import { AvailabilityView } from './components/views/AvailabilityView';
import { CapTheoremView } from './components/views/CapTheoremView';
import { ComparisonChartsView } from './components/views/ComparisonChartsView';
import { ActivityLogsView } from './components/views/ActivityLogsView';
import { ProjectInfoView } from './components/views/ProjectInfoView';

import { API } from './lib/api';
import { ReplicaSetState, LogEntry, Transaction, TabId } from './types';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  // Core Real-time State
  const [replicaState, setReplicaState] = useState<ReplicaSetState | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);

  // Toast notifications
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'warn' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'warn' | 'info' | 'error' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Synchronize Dark Mode Class with <html>
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Polling Real-Time Replica State and Activity Logs
  const fetchTelemetry = useCallback(async () => {
    try {
      const [rs, logRes] = await Promise.all([
        API.getReplicaStatus(),
        API.getLogs(),
      ]);
      setReplicaState(rs);
      setLogs(logRes);
    } catch (err) {
      console.error('Failed to poll replica telemetry:', err);
    }
  }, []);

  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 3000);
    return () => clearInterval(interval);
  }, [fetchTelemetry]);

  // Handler: Toggle Node Power / Failure
  const handleToggleNode = async (nodeId: string) => {
    try {
      const res = await API.toggleNode(nodeId);
      setReplicaState(res.replicaState);
      fetchTelemetry();
      showToast(res.message, res.action === 'down' ? 'warn' : 'success');
    } catch (err: any) {
      showToast(err?.response?.data?.error || 'Node toggle failed', 'error');
    }
  };

  // Handler: Trigger Failover Simulation
  const handleTriggerFailover = async (reason?: string) => {
    try {
      const res = await API.triggerFailover(reason);
      setReplicaState(res.replicaState);
      fetchTelemetry();
      showToast(
        `Failover complete in ${res.failoverEvent?.durationMs || 2400}ms: Promoted ${res.failoverEvent?.newPrimaryId}`,
        'success'
      );
      return res;
    } catch (err: any) {
      showToast(err?.response?.data?.error || 'Failover failed', 'error');
      throw err;
    }
  };

  // Handler: Step Down Primary
  const handleStepDownPrimary = async () => {
    try {
      const res = await API.stepDownPrimary();
      setReplicaState(res.replicaState);
      fetchTelemetry();
      showToast('Primary stepped down successfully. New election completed.', 'success');
    } catch (err: any) {
      showToast(err?.response?.data?.error || 'Step down failed', 'error');
    }
  };

  // Handler: Clear Logs
  const handleClearLogs = async () => {
    try {
      await API.clearLogs();
      setLogs([]);
      showToast('Activity logs cleared', 'info');
    } catch (err) {
      showToast('Failed to clear logs', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans transition-colors duration-200 overflow-x-hidden">
      {/* Top High-Density Navigation Bar */}
      <Navbar
        darkMode={darkMode}
        onToggleTheme={() => setDarkMode(!darkMode)}
        onOpenExport={() => setShowExportModal(true)}
        onOpenAi={() => setShowAiModal(true)}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        replicaState={replicaState}
        onTriggerFailover={() => handleTriggerFailover('Manual trigger via Navbar')}
      />

      {/* Main Body with High Density Sidebar and Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* High Density Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            setSidebarOpen(false);
          }}
          replicaState={replicaState}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* High Density Content Canvas */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6 bg-slate-950">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && (
              <DashboardView
                replicaState={replicaState}
                onSelectTab={setActiveTab}
                onSelectTransaction={setSelectedTx}
                onToggleNode={handleToggleNode}
                onTriggerFailover={handleTriggerFailover}
              />
            )}

            {activeTab === 'transactions' && (
              <TransactionsView onSelectTransaction={setSelectedTx} />
            )}

            {activeTab === 'replica-set' && (
              <ReplicaSetView
                replicaState={replicaState}
                onToggleNode={handleToggleNode}
                onTriggerFailover={handleTriggerFailover}
                onStepDownPrimary={handleStepDownPrimary}
              />
            )}

            {activeTab === 'failover' && (
              <FailoverView
                replicaState={replicaState}
                onTriggerFailover={handleTriggerFailover}
                onStepDownPrimary={handleStepDownPrimary}
                onToggleNode={handleToggleNode}
              />
            )}

            {activeTab === 'read-write' && <ReadWriteBenchmarkView />}

            {activeTab === 'consistency' && <ConsistencyView />}

            {activeTab === 'availability' && <AvailabilityView />}

            {activeTab === 'cap-theorem' && <CapTheoremView />}

            {activeTab === 'charts' && <ComparisonChartsView replicaState={replicaState} />}

            {activeTab === 'logs' && (
              <ActivityLogsView
                logs={logs}
                onClearLogs={handleClearLogs}
                onRefreshLogs={fetchTelemetry}
              />
            )}

            {activeTab === 'project-info' && <ProjectInfoView />}
          </div>
        </main>
      </div>

      {/* High Density Footer Status Bar */}
      <footer className="h-8 bg-slate-900 border-t border-slate-800 px-4 sm:px-6 flex items-center justify-between text-[10px] text-slate-500 font-mono select-none z-20">
        <div>Project: MongoDB Replication Fintech Analysis (MCA-2024)</div>
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline">ENV: PRODUCTION_SHADOW</span>
          <span className="hidden md:inline">MONGO_REPL_SET: rs0</span>
          <span className="text-emerald-500 font-bold">API: OK</span>
        </div>
      </footer>

      {/* Modals */}
      <TransactionModal
        transaction={selectedTx}
        onClose={() => setSelectedTx(null)}
        replicaState={replicaState}
      />

      <ExportMetricsModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        replicaState={replicaState}
      />

      <AiAnalysisModal
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
        replicaState={replicaState}
      />

      {/* Toast Notification */}
      {toast && (
        <div
          id="high-density-toast"
          className={`fixed bottom-12 right-6 z-50 px-4 py-2.5 rounded-lg shadow-2xl border flex items-center space-x-3 text-xs font-mono font-semibold animate-fade-in ${
            toast.type === 'success'
              ? 'bg-slate-900 text-emerald-400 border-emerald-500/40'
              : toast.type === 'warn'
              ? 'bg-slate-900 text-amber-400 border-amber-500/40'
              : toast.type === 'error'
              ? 'bg-slate-900 text-rose-400 border-rose-500/40'
              : 'bg-slate-900 text-slate-200 border-slate-700'
          }`}
        >
          {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
          {toast.type === 'warn' && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />}
          {toast.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />}
          {toast.type === 'info' && <Info className="w-4 h-4 text-blue-400 shrink-0" />}
          <span>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-white p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
