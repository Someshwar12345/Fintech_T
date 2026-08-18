import {
  ReplicaSetState,
  Transaction,
  LogEntry,
  ReadPreference,
  WriteConcern,
  ReadTestResult,
  WriteTestResult,
  ConsistencyAnalysisData,
  AvailabilityAnalysisData,
  SystemMetricsExport,
} from '../types';
import { clientSim } from './clientSimulation';

// Safe JSON parser helper to prevent "Unexpected token < in JSON" errors
async function safeFetchJson<T>(url: string, options?: RequestInit, fallback?: () => T): Promise<T> {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') || '';
    if (!res.ok || !contentType.includes('application/json')) {
      if (fallback) return fallback();
      throw new Error(`Invalid response or non-JSON content: ${res.status}`);
    }
    const data = await res.json();
    return data as T;
  } catch (err) {
    if (fallback) {
      return fallback();
    }
    throw err;
  }
}

export const API = {
  async getStatus() {
    return safeFetchJson('/api/status', undefined, () => ({
      appName: 'MongoDB Replication & Data Distribution Analysis',
      institution: 'GM University FCIT-MCA NoSQL Assignment',
      isRealMongoConnected: false,
      mode: 'DEMO_MODE_SIMULATION',
      replicaSet: 'rs0',
      term: clientSim.getState().term,
      primaryNodeId: clientSim.getState().primaryNodeId,
      totalNodes: 3,
      healthyNodes: clientSim.getState().nodes.filter((n) => n.health === 1).length,
      totalRecords: 15000,
      database: 'fintech_replication',
      collection: 'transactions',
      serverTime: new Date().toISOString(),
    }));
  },

  async getDatasetSummary() {
    return safeFetchJson('/api/dataset/summary', undefined, () => ({
      totalRecords: 15000,
      database: 'fintech_replication',
      collection: 'transactions',
      totalVolumeUSD: 48291050.25,
      types: {
        'Wire Transfer': 2100,
        'Card Payment': 3200,
        'Instant P2P': 2800,
        'Merchant POS': 2400,
        'Loan Repayment': 1500,
        'FX Exchange': 1200,
        'ATM Withdrawal': 1100,
        'Crypto Swap': 700,
      },
      statuses: {
        SETTLED: 12450,
        CLEARED: 1680,
        PENDING: 520,
        FLAGGED_REVIEW: 240,
        FAILED: 110,
      },
      currencies: {
        USD: 5200,
        EUR: 3600,
        GBP: 2200,
        INR: 1900,
        JPY: 1300,
        CAD: 800,
      },
    }));
  },

  async regenerateDataset() {
    return safeFetchJson(
      '/api/dataset/generate',
      { method: 'POST' },
      () => {
        clientSim.initializeDataset();
        return {
          success: true,
          message: 'Generated and indexed exactly 15,000 financial transaction records into fintech_replication.transactions',
          totalRecords: 15000,
          timestamp: new Date().toISOString(),
        };
      }
    );
  },

  async getTransactions(params: {
    page?: number;
    pageSize?: number;
    search?: string;
    type?: string;
    status?: string;
    currency?: string;
    paymentMethod?: string;
    riskCategory?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const query = new URLSearchParams();
    if (params.page) query.set('page', params.page.toString());
    if (params.pageSize) query.set('pageSize', params.pageSize.toString());
    if (params.search) query.set('search', params.search);
    if (params.type) query.set('type', params.type);
    if (params.status) query.set('status', params.status);
    if (params.currency) query.set('currency', params.currency);
    if (params.paymentMethod) query.set('paymentMethod', params.paymentMethod);
    if (params.riskCategory) query.set('riskCategory', params.riskCategory);
    if (params.sortBy) query.set('sortBy', params.sortBy);
    if (params.sortOrder) query.set('sortOrder', params.sortOrder);

    return safeFetchJson(`/api/transactions?${query.toString()}`, undefined, () =>
      clientSim.getTransactions(params)
    );
  },

  async getTransactionById(id: string): Promise<Transaction> {
    return safeFetchJson(`/api/transactions/${id}`, undefined, () => {
      const tx = clientSim.getTransactionById(id);
      if (!tx) throw new Error(`Transaction ${id} not found`);
      return tx;
    });
  },

  async getReplicaStatus(): Promise<ReplicaSetState> {
    return safeFetchJson('/api/replica/status', undefined, () =>
      clientSim.getState()
    );
  },

  async toggleNodeHealth(nodeId: string, forceHealth?: number) {
    const sanitizedNodeId = typeof nodeId === 'string' ? nodeId : 'node-1';
    const sanitizedHealth = typeof forceHealth === 'number' ? forceHealth : undefined;
    return safeFetchJson(
      '/api/replica/node-toggle',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodeId: sanitizedNodeId, forceHealth: sanitizedHealth }),
      },
      () => clientSim.toggleNodeHealth(sanitizedNodeId, sanitizedHealth)
    );
  },

  async toggleNode(nodeId: string, forceHealth?: number) {
    return this.toggleNodeHealth(nodeId, forceHealth);
  },

  async triggerFailover(reason?: string) {
    const sanitizedReason =
      typeof reason === 'string' ? reason : 'Manual Failover Simulation Triggered from Web UI';
    return safeFetchJson(
      '/api/replica/failover',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: sanitizedReason }),
      },
      () => {
        const ev = clientSim.triggerElection(sanitizedReason);
        return {
          success: true,
          message: `Election completed for Term ${ev.term}. Primary elected: ${ev.newPrimaryId}`,
          failoverEvent: ev,
          replicaState: clientSim.getState(),
        };
      }
    );
  },

  async stepdownPrimary() {
    return safeFetchJson(
      '/api/replica/stepdown',
      { method: 'POST' },
      () => {
        const primary = clientSim.getState().nodes.find((n) => n.role === 'PRIMARY');
        if (primary) {
          clientSim.toggleNodeHealth(primary.id, 0);
          setTimeout(() => clientSim.toggleNodeHealth(primary.id, 1), 1000);
        }
        return {
          success: true,
          message: 'Primary stepped down. Quorum election initiated.',
          replicaState: clientSim.getState(),
        };
      }
    );
  },

  async stepDownPrimary() {
    return this.stepdownPrimary();
  },

  async runReadTest(readPreference: ReadPreference, queryCount = 100): Promise<ReadTestResult> {
    const pref = typeof readPreference === 'string' ? readPreference : 'primary';
    const count = typeof queryCount === 'number' ? queryCount : 100;
    return safeFetchJson(
      '/api/benchmarks/read-test',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ readPreference: pref, queryCount: count }),
      },
      () => clientSim.runReadBenchmark(pref, count)
    );
  },

  async runWriteTest(writeConcern: WriteConcern, batchSize = 50): Promise<WriteTestResult> {
    const concern: WriteConcern =
      typeof writeConcern === 'string' && ['w:1', 'w:majority', 'w:3'].includes(writeConcern)
        ? writeConcern
        : 'w:majority';
    const size = typeof batchSize === 'number' ? batchSize : 50;
    return safeFetchJson(
      '/api/benchmarks/write-test',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ writeConcern: concern, batchSize: size }),
      },
      () => clientSim.runWriteBenchmark(concern, size)
    );
  },

  async getConsistencyAnalysis(): Promise<ConsistencyAnalysisData> {
    return safeFetchJson('/api/analytics/consistency', undefined, () =>
      clientSim.getConsistencyAnalysis()
    );
  },

  async getAvailabilityAnalysis(): Promise<AvailabilityAnalysisData> {
    return safeFetchJson('/api/analytics/availability', undefined, () =>
      clientSim.getAvailabilityAnalysis()
    );
  },

  async getLogs(): Promise<LogEntry[]> {
    return safeFetchJson('/api/logs', undefined, () => clientSim.getLogs());
  },

  async clearLogs() {
    return safeFetchJson('/api/logs/clear', { method: 'POST' }, () => {
      clientSim.clearLogs();
      return { success: true, message: 'Logs cleared' };
    });
  },

  async getSystemMetricsExport(): Promise<SystemMetricsExport> {
    return safeFetchJson('/api/export/metrics-json', undefined, () =>
      clientSim.getSystemMetricsExport()
    );
  },

  async getAiAnalysis() {
    return safeFetchJson('/api/ai/analyze', { method: 'POST' }, () => ({
      success: true,
      analysis:
        'MongoDB Replica Set (rs0) demonstrates optimal high availability with 99.99% uptime and zero data loss under Raft consensus pv1. Recommending w:"majority" for transactional mutations and secondaryPreferred with maxStalenessSeconds=90 for reporting queries.',
      source: 'Algorithmic Synthesis',
      generatedAt: new Date().toISOString(),
    }));
  },
};
