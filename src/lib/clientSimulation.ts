import {
  ReplicaSetState,
  Transaction,
  TransactionType,
  TransactionStatus,
  PaymentMethod,
  Currency,
  LogEntry,
  ReadPreference,
  WriteConcern,
  ReadTestResult,
  WriteTestResult,
  ConsistencyAnalysisData,
  AvailabilityAnalysisData,
  SystemMetricsExport,
  FailoverEvent,
} from '../types';

class SeededRandom {
  private seed: number;
  constructor(seed = 4289) {
    this.seed = seed;
  }
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
}

class ClientSimulationEngine {
  public TOTAL_RECORDS = 15000;
  private transactions: Transaction[] = [];
  private state: ReplicaSetState;
  private logs: LogEntry[] = [];
  private failoverHistory: FailoverEvent[] = [];
  private term = 1;

  constructor() {
    this.state = {
      set: 'rs0',
      date: new Date().toISOString(),
      myState: 1,
      term: 1,
      heartbeatIntervalMs: 2000,
      electionTimeoutMs: 10000,
      primaryNodeId: 'node-1',
      isRealMongoConnected: false,
      connectionUri: 'mongodb://127.0.0.1:27017,127.0.0.1:27018,127.0.0.1:27019/fintech_replication?replicaSet=rs0',
      databaseName: 'fintech_replication',
      collectionName: 'transactions',
      totalTransactionsCount: this.TOTAL_RECORDS,
      failoverHistory: [],
      nodes: [
        {
          id: 'node-1',
          name: 'mongo-node-1 (Primary Default)',
          host: 'mongo-node-1.fintech.local',
          port: 27017,
          role: 'PRIMARY',
          health: 1,
          stateStr: 'PRIMARY',
          uptimeSeconds: 86400,
          pingLatencyMs: 2.1,
          replicationLagMs: 0,
          optimeDate: new Date().toISOString(),
          optimeTimestamp: Math.floor(Date.now() / 1000),
          priority: 2,
          votes: 1,
          totalReadsServed: 48920,
          totalWritesServed: 15280,
          lastHeartbeat: new Date().toISOString(),
          lastHeartbeatMessage: 'Heartbeat response received: status OK',
          isSimulated: true,
        },
        {
          id: 'node-2',
          name: 'mongo-node-2 (Secondary A)',
          host: 'mongo-node-2.fintech.local',
          port: 27018,
          role: 'SECONDARY',
          health: 1,
          stateStr: 'SECONDARY',
          uptimeSeconds: 86400,
          pingLatencyMs: 3.4,
          replicationLagMs: 8,
          optimeDate: new Date(Date.now() - 8).toISOString(),
          optimeTimestamp: Math.floor((Date.now() - 8) / 1000),
          priority: 1,
          votes: 1,
          syncSourceHost: 'mongo-node-1.fintech.local:27017',
          totalReadsServed: 32140,
          totalWritesServed: 0,
          lastHeartbeat: new Date().toISOString(),
          lastHeartbeatMessage: 'Heartbeat response received: status OK (oplog catchup 100%)',
          isSimulated: true,
        },
        {
          id: 'node-3',
          name: 'mongo-node-3 (Secondary B)',
          host: 'mongo-node-3.fintech.local',
          port: 27019,
          role: 'SECONDARY',
          health: 1,
          stateStr: 'SECONDARY',
          uptimeSeconds: 86400,
          pingLatencyMs: 4.8,
          replicationLagMs: 14,
          optimeDate: new Date(Date.now() - 14).toISOString(),
          optimeTimestamp: Math.floor((Date.now() - 14) / 1000),
          priority: 1,
          votes: 1,
          syncSourceHost: 'mongo-node-1.fintech.local:27017',
          totalReadsServed: 29850,
          totalWritesServed: 0,
          lastHeartbeat: new Date().toISOString(),
          lastHeartbeatMessage: 'Heartbeat response received: status OK (oplog catchup 100%)',
          isSimulated: true,
        },
      ],
    };

    this.initializeDataset();
    this.addLog('SUCCESS', 'REPLICA_SET', 'Fintech replication engine initialized with 15,000 transactions');
  }

  public initializeDataset(): Transaction[] {
    if (this.transactions.length === this.TOTAL_RECORDS) return this.transactions;
    const rng = new SeededRandom(7821);
    const types: TransactionType[] = [
      'Wire Transfer',
      'Card Payment',
      'Instant P2P',
      'Merchant POS',
      'Loan Repayment',
      'FX Exchange',
      'ATM Withdrawal',
      'Crypto Swap',
    ];
    const currencies: Currency[] = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD'];
    const statuses: TransactionStatus[] = [
      'SETTLED',
      'SETTLED',
      'SETTLED',
      'CLEARED',
      'PENDING',
      'FLAGGED_REVIEW',
      'FAILED',
    ];
    const methods: PaymentMethod[] = [
      'FedNow',
      'SEPA',
      'SWIFT',
      'ACH',
      'UPI',
      'VisaNet',
      'Internal Ledger',
    ];
    const locations = [
      'New York, US',
      'London, UK',
      'Frankfurt, DE',
      'Mumbai, IN',
      'Tokyo, JP',
      'Toronto, CA',
      'Singapore, SG',
      'Sydney, AU',
    ];

    const txs: Transaction[] = [];
    const now = Date.now();
    for (let i = 1; i <= this.TOTAL_RECORDS; i++) {
      const type = types[Math.floor(rng.next() * types.length)];
      const currency = currencies[Math.floor(rng.next() * currencies.length)];
      const status = statuses[Math.floor(rng.next() * statuses.length)];
      const paymentMethod = methods[Math.floor(rng.next() * methods.length)];
      const location = locations[Math.floor(rng.next() * locations.length)];
      const amount = parseFloat((rng.next() * 8500 + 10).toFixed(2));
      const riskScore = Math.floor(rng.next() * 100);
      const daysAgo = rng.next() * 45;
      const txDate = new Date(now - daysAgo * 86400000).toISOString();

      txs.push({
        transaction_id: `TXN-${String(i).padStart(6, '0')}`,
        customer_id: `CUST-${String(Math.floor(rng.next() * 4500) + 1000).padStart(5, '0')}`,
        account_id: `ACC-FIN-${String(Math.floor(rng.next() * 2500) + 50000)}`,
        transaction_type: type,
        amount,
        currency,
        transaction_date: txDate,
        status,
        source_account: `SRC-NODE-${String(Math.floor(rng.next() * 9000) + 1000)}`,
        destination_account: `DST-NODE-${String(Math.floor(rng.next() * 9000) + 1000)}`,
        location,
        payment_method: paymentMethod,
        risk_score: riskScore,
        replication_meta: {
          oplog_ts: Math.floor((now - daysAgo * 86400000) / 1000),
          synced_nodes: ['node-1', 'node-2', 'node-3'],
          write_concern: 'w:majority',
          committed_to_majority: true,
        },
      });
    }
    this.transactions = txs;
    return this.transactions;
  }

  public getTransactions(params: any = {}) {
    const page = params.page || 1;
    const pageSize = params.pageSize || 25;
    let filtered = [...this.transactions];

    if (params.search) {
      const s = params.search.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.transaction_id.toLowerCase().includes(s) ||
          t.customer_id.toLowerCase().includes(s) ||
          t.account_id.toLowerCase().includes(s) ||
          t.location.toLowerCase().includes(s)
      );
    }
    if (params.type && params.type !== 'all') filtered = filtered.filter((t) => t.transaction_type === params.type);
    if (params.status && params.status !== 'all') filtered = filtered.filter((t) => t.status === params.status);
    if (params.currency && params.currency !== 'all') filtered = filtered.filter((t) => t.currency === params.currency);
    if (params.paymentMethod && params.paymentMethod !== 'all') filtered = filtered.filter((t) => t.payment_method === params.paymentMethod);
    if (params.riskCategory && params.riskCategory !== 'all') {
      if (params.riskCategory === 'low') filtered = filtered.filter((t) => t.risk_score < 30);
      else if (params.riskCategory === 'medium') filtered = filtered.filter((t) => t.risk_score >= 30 && t.risk_score < 70);
      else if (params.riskCategory === 'high') filtered = filtered.filter((t) => t.risk_score >= 70);
    }

    const total = filtered.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const data = filtered.slice(start, start + pageSize);

    return {
      data,
      total,
      page,
      pageSize,
      totalPages,
      stats: {
        totalAmountUSD: 48291050.25,
        totalSettled: 12450,
        totalPending: 520,
        totalFlagged: 240,
        totalFailed: 110,
        avgRiskScore: 34,
      },
    };
  }

  public getTransactionById(id: string) {
    return this.transactions.find((t) => t.transaction_id === id) || null;
  }

  public getState(): ReplicaSetState {
    return {
      ...this.state,
      totalTransactionsCount: this.TOTAL_RECORDS,
    };
  }

  public getLogs(): LogEntry[] {
    return this.logs;
  }

  public clearLogs() {
    this.logs = [];
    this.addLog('INFO', 'REPLICA_SET', 'Activity logs cleared by administrator');
  }

  public toggleNodeHealth(nodeId: string, forceHealth?: number) {
    const node = this.state.nodes.find((n) => n.id === nodeId);
    if (!node) return { success: false, message: 'Node not found', state: this.state };

    const newHealth = forceHealth !== undefined ? forceHealth : node.health === 1 ? 0 : 1;
    node.health = newHealth;

    if (newHealth === 0) {
      const wasPrimary = node.role === 'PRIMARY';
      node.role = 'DOWN';
      node.stateStr = 'DOWN (Unreachable)';
      this.addLog('ERROR', 'HEARTBEAT', `Node ${node.name} went OFFLINE. Heartbeat failed.`, node.id);

      if (wasPrimary) {
        this.state.primaryNodeId = null;
        this.addLog('WARN', 'FAILOVER', `Active PRIMARY ${node.name} failed! Quorum election running.`, node.id);
        this.triggerElection('Primary node failure detected');
      }
    } else {
      node.stateStr = 'SECONDARY';
      node.role = 'SECONDARY';
      node.uptimeSeconds = 0;
      node.replicationLagMs = 45;
      this.addLog('SUCCESS', 'REPLICATION', `Node ${node.name} restarted and joined as SECONDARY.`, node.id);

      const healthyCount = this.state.nodes.filter((n) => n.health === 1).length;
      if (!this.state.primaryNodeId && healthyCount >= 2) {
        this.triggerElection('Cluster regained majority quorum');
      }
    }

    return {
      success: true,
      message: `Node ${node.name} is now ${node.health === 1 ? 'HEALTHY' : 'DOWN'}`,
      action: node.health === 1 ? 'up' : 'down',
      replicaState: this.getState(),
    };
  }

  public triggerElection(reason = 'Manual Failover'): FailoverEvent {
    this.term += 1;
    this.state.term = this.term;
    const oldPrimaryId = this.state.primaryNodeId || 'none';

    const eligible = this.state.nodes.filter((n) => n.health === 1);
    if (eligible.length < 2) {
      this.state.primaryNodeId = null;
      this.addLog('ERROR', 'ELECTION', `Election aborted: Insufficient quorum (${eligible.length}/3 nodes). Writes disabled.`);
      const failEvent: FailoverEvent = {
        id: `fail-${Date.now()}`,
        timestamp: new Date().toISOString(),
        term: this.term,
        reason,
        durationMs: 3200,
        oldPrimaryId,
        newPrimaryId: 'NONE',
        votesCast: {},
        readAvailabilityDuringFailoverPct: 100,
        writeAvailabilityDuringFailoverPct: 0,
      };
      return failEvent;
    }

    const newPrimary = eligible[Math.floor(Math.random() * eligible.length)];
    for (const node of this.state.nodes) {
      if (node.health === 1) {
        if (node.id === newPrimary.id) {
          node.role = 'PRIMARY';
          node.stateStr = 'PRIMARY';
          node.replicationLagMs = 0;
        } else {
          node.role = 'SECONDARY';
          node.stateStr = 'SECONDARY';
        }
      }
    }

    this.state.primaryNodeId = newPrimary.id;
    const durationMs = Math.floor(Math.random() * 800 + 1800);
    const event: FailoverEvent = {
      id: `fail-${Date.now()}`,
      timestamp: new Date().toISOString(),
      term: this.term,
      reason,
      durationMs,
      oldPrimaryId,
      newPrimaryId: newPrimary.name,
      votesCast: { 'node-1': newPrimary.id, 'node-2': newPrimary.id, 'node-3': newPrimary.id },
      readAvailabilityDuringFailoverPct: 99.8,
      writeAvailabilityDuringFailoverPct: 0,
    };

    this.failoverHistory.unshift(event);
    this.state.failoverHistory = this.failoverHistory;
    this.addLog('SUCCESS', 'FAILOVER', `Election Term ${this.term} completed. Promoted ${newPrimary.name} in ${durationMs}ms.`);

    return event;
  }

  public runReadBenchmark(readPreference: ReadPreference, queryCount = 100): ReadTestResult {
    let avgLatency = 2.1;
    let staleRisk = 0;
    const dist: Record<string, number> = {};

    if (readPreference === 'primary') {
      avgLatency = 2.1;
      staleRisk = 0;
      dist['mongo-node-1 (PRIMARY)'] = queryCount;
    } else if (readPreference === 'secondary') {
      avgLatency = 3.8;
      staleRisk = Math.floor(queryCount * 0.04);
      dist['mongo-node-2 (SECONDARY)'] = Math.floor(queryCount / 2);
      dist['mongo-node-3 (SECONDARY)'] = Math.ceil(queryCount / 2);
    } else if (readPreference === 'nearest') {
      avgLatency = 1.8;
      staleRisk = Math.floor(queryCount * 0.08);
      dist['mongo-node-1 (PRIMARY)'] = Math.floor(queryCount * 0.5);
      dist['mongo-node-2 (SECONDARY)'] = Math.floor(queryCount * 0.3);
      dist['mongo-node-3 (SECONDARY)'] = Math.floor(queryCount * 0.2);
    } else {
      avgLatency = 2.8;
      staleRisk = Math.floor(queryCount * 0.02);
      dist['mongo-node-1 (PRIMARY)'] = Math.floor(queryCount * 0.7);
      dist['mongo-node-2 (SECONDARY)'] = Math.floor(queryCount * 0.3);
    }

    return {
      readPreference,
      queryCount,
      durationMs: Math.round(avgLatency * queryCount),
      avgLatencyMs: parseFloat(avgLatency.toFixed(2)),
      p95LatencyMs: parseFloat((avgLatency * 1.8).toFixed(2)),
      successCount: queryCount,
      failureCount: 0,
      staleReadCount: staleRisk,
      consistencyPercentage: 100 - Math.round((staleRisk / queryCount) * 100),
      nodeDistribution: dist,
      samples: [
        {
          txId: 'TXN-000102',
          servedByNode: 'mongo-node-1 (PRIMARY)',
          latencyMs: 2.1,
          isStale: false,
        },
      ],
      timestamp: new Date().toISOString(),
    };
  }

  public runWriteBenchmark(writeConcern: WriteConcern, batchSize = 50): WriteTestResult {
    let duration = 24;

    if (writeConcern === 'w:1') {
      duration = Math.floor(batchSize * 0.35 + 8);
    } else if (writeConcern === 'w:majority') {
      duration = Math.floor(batchSize * 0.75 + 18);
    } else {
      duration = Math.floor(batchSize * 1.2 + 30);
    }

    return {
      writeConcern,
      batchSize,
      durationMs: duration,
      avgLatencyMs: parseFloat((duration / batchSize).toFixed(2)),
      p95LatencyMs: parseFloat(((duration / batchSize) * 1.6).toFixed(2)),
      successCount: batchSize,
      failureCount: 0,
      majorityCommittedCount: batchSize,
      replicationLagObservedMs: 8.5,
      samples: [
        {
          txId: 'TXN-000840',
          amount: 450.0,
          latencyMs: 3.2,
          syncedNodes: ['node-1', 'node-2'],
          success: true,
        },
      ],
      timestamp: new Date().toISOString(),
    };
  }

  public getConsistencyAnalysis(): ConsistencyAnalysisData {
    return {
      overallConsistencyScore: 98.5,
      averageReplicationLagMs: 11.2,
      staleReadProbabilityPct: 1.4,
      readYourWritesGuarantee: true,
      monotonicReadsGuarantee: true,
      causalConsistencyScore: 99.2,
      readPreferenceComparison: [
        {
          preference: 'primary',
          consistencyScore: 100,
          avgLatencyMs: 2.1,
          staleRatePct: 0.0,
          description: 'Strict linearizability, zero staleness risk',
        },
        {
          preference: 'primaryPreferred',
          consistencyScore: 96,
          avgLatencyMs: 3.4,
          staleRatePct: 2.1,
          description: 'Primary default with secondary fallback',
        },
        {
          preference: 'secondary',
          consistencyScore: 88,
          avgLatencyMs: 3.8,
          staleRatePct: 4.8,
          description: 'Secondary read distribution, bounded staleness',
        },
      ],
    };
  }

  public getAvailabilityAnalysis(): AvailabilityAnalysisData {
    const healthy = this.state.nodes.filter((n) => n.health === 1).length;
    return {
      currentAvailabilityPct: healthy >= 2 ? 99.99 : 33.3,
      uptimeHours: 720,
      estimatedSLA: healthy >= 2 ? 'Four Nines (99.99%) - High Availability' : 'Degraded SLA (Write Outage)',
      failoverDowntimeSec: 2.4,
      readAvailabilityPct: healthy > 0 ? 100 : 0,
      writeAvailabilityPct: healthy >= 2 ? 100 : 0,
      nodeQuorumStatus: {
        healthyNodesCount: healthy,
        requiredQuorum: 2,
        hasQuorum: healthy >= 2,
      },
      timelineData: [
        { time: '12:00', readAvail: 100, writeAvail: 100 },
        { time: '12:15', readAvail: 100, writeAvail: 100 },
        { time: '12:30', readAvail: 100, writeAvail: 100 },
      ],
    };
  }

  public getSystemMetricsExport(): SystemMetricsExport {
    return {
      exportMetadata: {
        projectName: 'MongoDB Replication and Data Distribution Analysis',
        institution: 'GM University',
        course: 'FCIT - MCA NoSQL Distributed Databases',
        developer: 'FCIT-MCA Research Team',
        exportDate: new Date().toISOString(),
        systemMode: 'HIGH_FIDELITY_SIMULATION_DEMO',
        database: 'fintech_replication',
        collection: 'transactions',
        datasetRecordCount: this.TOTAL_RECORDS,
      },
      replicaSet: this.getState(),
      benchmarkHistory: {
        recentReadTests: [],
        recentWriteTests: [],
      },
      consistencyMetrics: this.getConsistencyAnalysis(),
      availabilityMetrics: this.getAvailabilityAnalysis(),
      capTheoremConclusions: {
        classification: 'CP (Consistency & Partition Tolerance)',
        defaultState: 'Linearizable Primary Writes with w:majority',
        quorumRule: 'Majority = (N / 2) + 1 => (3/2) + 1 = 2 Nodes',
        tradeoffsSummary: 'Guarantees ledger consistency at the expense of temporary write blocking during quorum loss.',
      },
      activityLogsSummary: this.logs,
    };
  }

  private addLog(
    level: LogEntry['level'],
    component: LogEntry['component'],
    message: string,
    nodeId?: string
  ) {
    this.logs.unshift({
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      level,
      component,
      message,
      nodeId,
    });
    if (this.logs.length > 500) this.logs.pop();
  }
}

export const clientSim = new ClientSimulationEngine();
