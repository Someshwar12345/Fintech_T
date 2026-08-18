export type TransactionType =
  | 'Wire Transfer'
  | 'Card Payment'
  | 'Instant P2P'
  | 'Merchant POS'
  | 'Loan Repayment'
  | 'FX Exchange'
  | 'ATM Withdrawal'
  | 'Crypto Swap';

export type TransactionStatus =
  | 'SETTLED'
  | 'PENDING'
  | 'FLAGGED_REVIEW'
  | 'CLEARED'
  | 'FAILED';

export type PaymentMethod =
  | 'ACH'
  | 'SEPA'
  | 'SWIFT'
  | 'FedNow'
  | 'UPI'
  | 'VisaNet'
  | 'Internal Ledger';

export type Currency = 'USD' | 'EUR' | 'GBP' | 'INR' | 'JPY' | 'CAD';

export interface Transaction {
  transaction_id: string;
  customer_id: string;
  account_id: string;
  transaction_type: TransactionType;
  amount: number;
  currency: Currency;
  transaction_date: string;
  status: TransactionStatus;
  source_account: string;
  destination_account: string;
  location: string;
  payment_method: PaymentMethod;
  risk_score: number;
  replication_meta?: {
    oplog_ts: number;
    synced_nodes: string[];
    write_concern: string;
    committed_to_majority: boolean;
  };
}

export type NodeRole = 'PRIMARY' | 'SECONDARY' | 'DOWN' | 'ARBITER';

export interface ReplicaNode {
  id: string;
  name: string;
  host: string;
  port: number;
  role: NodeRole;
  health: number; // 1 = healthy, 0 = down
  stateStr: string;
  uptimeSeconds: number;
  pingLatencyMs: number;
  replicationLagMs: number;
  optimeDate: string;
  optimeTimestamp: number;
  priority: number;
  votes: number;
  syncSourceHost?: string;
  totalReadsServed: number;
  totalWritesServed: number;
  lastHeartbeat: string;
  lastHeartbeatMessage: string;
  isSimulated: boolean;
}

export interface ReplicaSetState {
  set: string;
  date: string;
  myState: number;
  term: number;
  heartbeatIntervalMs: number;
  electionTimeoutMs: number;
  primaryNodeId: string | null;
  nodes: ReplicaNode[];
  isRealMongoConnected: boolean;
  connectionUri: string;
  databaseName: string;
  collectionName: string;
  totalTransactionsCount: number;
  lastFailoverDurationMs?: number;
  lastFailoverTimestamp?: string;
  failoverHistory: FailoverEvent[];
}

export interface FailoverEvent {
  id: string;
  timestamp: string;
  oldPrimaryId: string;
  newPrimaryId: string;
  durationMs: number;
  reason: string;
  term: number;
  votesCast: Record<string, string>;
  readAvailabilityDuringFailoverPct: number;
  writeAvailabilityDuringFailoverPct: number;
}

export type TabId =
  | 'dashboard'
  | 'transactions'
  | 'replica-set'
  | 'failover'
  | 'read-write'
  | 'consistency'
  | 'availability'
  | 'cap-theorem'
  | 'charts'
  | 'logs'
  | 'project-info';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'SUCCESS' | 'WARN' | 'ERROR' | 'ELECTION' | 'REPLICATION';
  component: 'REPLICA_SET' | 'OPLOG' | 'HEARTBEAT' | 'FAILOVER' | 'READ_ROUTER' | 'WRITE_CONCERN' | 'DATASET' | 'ELECTION' | 'REPLICATION';
  message: string;
  nodeId?: string;
  details?: Record<string, any>;
}

export type ReadPreference =
  | 'primary'
  | 'primaryPreferred'
  | 'secondary'
  | 'secondaryPreferred'
  | 'nearest';

export type WriteConcern = 'w:1' | 'w:majority' | 'w:3' | 'j:true';

export interface ReadTestResult {
  readPreference: ReadPreference;
  queryCount: number;
  durationMs: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
  successCount: number;
  failureCount: number;
  staleReadCount: number;
  consistencyPercentage: number;
  nodeDistribution: Record<string, number>;
  samples: {
    txId: string;
    servedByNode: string;
    latencyMs: number;
    isStale: boolean;
  }[];
  timestamp: string;
}

export interface WriteTestResult {
  writeConcern: WriteConcern;
  batchSize: number;
  durationMs: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
  successCount: number;
  failureCount: number;
  majorityCommittedCount: number;
  replicationLagObservedMs: number;
  samples: {
    txId: string;
    amount: number;
    latencyMs: number;
    syncedNodes: string[];
    success: boolean;
  }[];
  timestamp: string;
}

export interface ConsistencyAnalysisData {
  overallConsistencyScore: number;
  averageReplicationLagMs: number;
  staleReadProbabilityPct: number;
  readYourWritesGuarantee: boolean;
  monotonicReadsGuarantee: boolean;
  causalConsistencyScore: number;
  readPreferenceComparison: {
    preference: ReadPreference;
    consistencyScore: number;
    avgLatencyMs: number;
    staleRatePct: number;
    description: string;
  }[];
}

export interface AvailabilityAnalysisData {
  currentAvailabilityPct: number;
  uptimeHours: number;
  estimatedSLA: string;
  failoverDowntimeSec: number;
  readAvailabilityPct: number;
  writeAvailabilityPct: number;
  nodeQuorumStatus: {
    healthyNodesCount: number;
    requiredQuorum: number;
    hasQuorum: boolean;
  };
  timelineData: {
    time: string;
    readAvail: number;
    writeAvail: number;
    event?: string;
  }[];
}

export interface CapTheoremScenario {
  id: string;
  title: string;
  description: string;
  networkPartition: boolean;
  mongoConfig: {
    readPreference: ReadPreference;
    writeConcern: WriteConcern;
    readConcern: string;
  };
  consistencyLevel: 'Strong (Linearizable)' | 'Causal' | 'Eventual' | 'Weak';
  availabilityLevel: 'High' | 'Degraded (Reads Only)' | 'Unavailable Writes' | 'Low';
  partitionToleranceLevel: 'High (Cluster survives partition)' | 'Quorum preserved' | 'Split-brain prevented';
  analysis: string;
}

export interface SystemMetricsExport {
  exportMetadata: {
    projectName: string;
    institution: string;
    course: string;
    developer: string;
    exportDate: string;
    systemMode: 'CONNECTED_MONGODB' | 'HIGH_FIDELITY_SIMULATION_DEMO';
    database: string;
    collection: string;
    datasetRecordCount: number;
  };
  replicaSet: ReplicaSetState;
  benchmarkHistory: {
    recentReadTests: ReadTestResult[];
    recentWriteTests: WriteTestResult[];
  };
  consistencyMetrics: ConsistencyAnalysisData;
  availabilityMetrics: AvailabilityAnalysisData;
  capTheoremConclusions: {
    classification: string;
    defaultState: string;
    quorumRule: string;
    tradeoffsSummary: string;
  };
  activityLogsSummary: LogEntry[];
}
