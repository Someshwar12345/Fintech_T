import express from 'express';
import { datasetManager } from './dataset';
import { replicaEngine } from './replicaEngine';
import { GoogleGenAI } from '@google/genai';

const router = express.Router();

// 1. Status & Health Check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.get('/status', (req, res) => {
  const state = replicaEngine.getState();
  res.json({
    appName: 'MongoDB Replication & Data Distribution Analysis',
    institution: 'GM University FCIT-MCA NoSQL Assignment',
    isRealMongoConnected: state.isRealMongoConnected,
    mode: state.isRealMongoConnected ? 'LIVE_MONGODB_REPLICA_SET' : 'DEMO_MODE_SIMULATION',
    replicaSet: state.set,
    term: state.term,
    primaryNodeId: state.primaryNodeId,
    totalNodes: state.nodes.length,
    healthyNodes: state.nodes.filter((n) => n.health === 1).length,
    totalRecords: datasetManager.TOTAL_RECORDS,
    database: state.databaseName,
    collection: state.collectionName,
    serverTime: new Date().toISOString(),
  });
});

// 2. Dataset Endpoints (15,000 Transactions)
router.get('/dataset/summary', (req, res) => {
  const summary = datasetManager.getDatasetSummary();
  res.json(summary);
});

router.post('/dataset/generate', (req, res) => {
  const count = datasetManager.initializeDataset(true).length;
  res.json({
    success: true,
    message: `Generated and indexed exactly ${count} financial transaction records into fintech_replication.transactions`,
    totalRecords: count,
    timestamp: new Date().toISOString(),
  });
});

router.get('/transactions', (req, res) => {
  const page = parseInt(req.query.page as string, 10) || 1;
  const pageSize = parseInt(req.query.pageSize as string, 10) || 25;
  const search = (req.query.search as string) || '';
  const type = (req.query.type as string) || 'all';
  const status = (req.query.status as string) || 'all';
  const currency = (req.query.currency as string) || 'all';
  const paymentMethod = (req.query.paymentMethod as string) || 'all';
  const riskCategory = (req.query.riskCategory as any) || 'all';
  const sortBy = (req.query.sortBy as string) || 'transaction_date';
  const sortOrder = ((req.query.sortOrder as string) || 'desc') as 'asc' | 'desc';

  const result = datasetManager.getTransactions({
    page,
    pageSize,
    search,
    type,
    status,
    currency,
    paymentMethod,
    riskCategory,
    sortBy,
    sortOrder,
  });

  res.json(result);
});

router.get('/transactions/:id', (req, res) => {
  const tx = datasetManager.getTransactionById(req.params.id);
  if (!tx) {
    return res.status(404).json({ error: `Transaction ${req.params.id} not found` });
  }
  res.json(tx);
});

// 3. Replica Set Endpoints
router.get('/replica/status', (req, res) => {
  res.json(replicaEngine.getState());
});

router.post('/replica/node-toggle', (req, res) => {
  const { nodeId, forceHealth } = req.body;
  if (!nodeId) {
    return res.status(400).json({ error: 'nodeId is required' });
  }
  const result = replicaEngine.toggleNodeHealth(nodeId, forceHealth);
  res.json(result);
});

router.post('/replica/failover', (req, res) => {
  const { reason } = req.body;
  const event = replicaEngine.triggerElection(reason || 'Manual Failover Simulation Triggered from Web UI');
  res.json({
    success: true,
    message: `Election completed for Term ${event.term}. Primary elected: ${event.newPrimaryId}`,
    failoverEvent: event,
    replicaState: replicaEngine.getState(),
  });
});

router.post('/replica/stepdown', (req, res) => {
  const result = replicaEngine.stepdownPrimary();
  res.json(result);
});

// 4. Benchmarking & Read / Write Preference Testing
router.post('/benchmarks/read-test', (req, res) => {
  const { readPreference = 'primary', queryCount = 100 } = req.body;
  const result = replicaEngine.runReadBenchmark(readPreference, parseInt(queryCount, 10) || 100);
  res.json(result);
});

router.post('/benchmarks/write-test', (req, res) => {
  const { writeConcern = 'w:majority', batchSize = 50 } = req.body;
  const result = replicaEngine.runWriteBenchmark(writeConcern, parseInt(batchSize, 10) || 50);
  res.json(result);
});

// 5. Analytics Endpoints
router.get('/analytics/consistency', (req, res) => {
  res.json(replicaEngine.getConsistencyAnalysis());
});

router.get('/analytics/availability', (req, res) => {
  res.json(replicaEngine.getAvailabilityAnalysis());
});

// 6. Activity Logs
router.get('/logs', (req, res) => {
  res.json(replicaEngine.getLogs());
});

router.post('/logs/clear', (req, res) => {
  replicaEngine.clearLogs();
  res.json({ success: true, message: 'Logs cleared' });
});

// 7. System Metrics Export (Download JSON format for desktop file post-analysis)
router.get('/export/metrics-json', (req, res) => {
  const data = replicaEngine.getSystemMetricsExport();
  res.setHeader('Content-Type', 'application/json');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="mongodb-replication-analysis-metrics-${new Date().toISOString().slice(0, 10)}.json"`
  );
  res.json(data);
});

// 8. AI Analysis using Gemini API (or structured algorithmic analysis)
router.post('/ai/analyze', async (req, res) => {
  const state = replicaEngine.getState();
  const consistency = replicaEngine.getConsistencyAnalysis();
  const availability = replicaEngine.getAvailabilityAnalysis();

  const prompt = `You are a NoSQL Database Architect and MongoDB High-Availability Expert evaluating a Fintech Replica Set.
Analyze the following cluster state and metrics for the GM University FCIT-MCA NoSQL Assignment:
- Database: ${state.databaseName}, Collection: ${state.collectionName} (${state.totalTransactionsCount} transactions)
- Active Nodes: ${state.nodes.map((n) => `${n.name} [${n.role}, Health: ${n.health}, Lag: ${n.replicationLagMs}ms]`).join(', ')}
- Current Primary: ${state.primaryNodeId || 'NONE (Election Required)'}
- Term: ${state.term}, Quorum Status: ${availability.nodeQuorumStatus.hasQuorum ? 'QUORUM_OK (2/3)' : 'NO_QUORUM'}
- Read Availability: ${availability.readAvailabilityPct}%, Write Availability: ${availability.writeAvailabilityPct}%
- Average Replication Lag: ${consistency.averageReplicationLagMs}ms, Stale Read Risk: ${consistency.staleReadProbabilityPct}%
- Last Failover Duration: ${state.lastFailoverDurationMs || 'N/A'}ms

Provide a clear, professional 4-section executive evaluation:
1. Replica Set Health & Failover Readiness Assessment
2. CAP Theorem Trade-off Evaluation (CP default vs AP secondary routing)
3. Financial Transaction Safety & Zero Data Loss Strategy (Write Concern majority vs w:1)
4. Recommended Production Tuning for Fintech SLA (Heartbeat, Election Timeout, WiredTiger Oplog)`;

  if (process.env.GEMINI_API_KEY) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
      });
      return res.json({
        analysis: response.text,
        generatedAt: new Date().toISOString(),
        poweredBy: 'Gemini 3.7 Flash',
      });
    } catch (err: any) {
      console.warn('Gemini API call failed, falling back to algorithmic report:', err.message);
    }
  }

  // Fallback intelligent evaluation
  const fallbackAnalysis = `### 1. Replica Set Health & Failover Readiness Assessment
The cluster currently operates with **${state.nodes.filter((n) => n.health === 1).length}/${state.nodes.length} healthy nodes** in election Term **${state.term}**. With MongoDB's Raft-inspired election protocol, the cluster guarantees automatic primary re-election within ~${state.lastFailoverDurationMs || 2450}ms. Secondary nodes maintain an average oplog sync lag of **${consistency.averageReplicationLagMs}ms**, ensuring swift sync recovery.

### 2. CAP Theorem Trade-off Evaluation
MongoDB functions as a **CP (Consistency & Partition Tolerance)** distributed system by default:
- **During Normal Operation**: Primary node handles all writes with linearizable consistency.
- **During Network Partition**: The minority partition becomes read-only (preventing split-brain syndrome), while the majority partition elects a single authoritative Primary.
- **AP Tunability**: By setting \`readPreference: 'secondary'\`, applications trade strict consistency for high availability and horizontal read scaling, incurring a **${consistency.staleReadProbabilityPct}%** stale-read window.

### 3. Financial Transaction Safety & Zero Data Loss Strategy
In this fintech environment managing **${datasetManager.TOTAL_RECORDS.toLocaleString()} financial records**, preventing duplicate charges and rollback anomalies is vital:
- **Mandatory Write Concern**: \`{ w: "majority", j: true, wtimeout: 5000 }\` guarantees transaction permanence across a quorum of disk-journaled nodes before returning success.
- **Read Concern**: \`{ readConcern: "majority" }\` avoids dirty reads of uncommitted transactions during transient primary stepdowns.

### 4. Recommended Production Tuning for Fintech SLA
1. **Election Timeout**: Configure \`electionTimeoutMillis: 5000\` (default 10,000ms) to detect network partitions faster.
2. **Heartbeat Frequency**: Maintain 2,000ms ping intervals across nodes.
3. **Oplog Sizing**: Allocate at least 5% of physical disk to the capped \`local.oplog.rs\` collection to prevent replication truncation during high-volume spikes.`;

  res.json({
    analysis: fallbackAnalysis,
    generatedAt: new Date().toISOString(),
    poweredBy: 'High-Availability NoSQL Analyzer',
  });
});

export default router;
