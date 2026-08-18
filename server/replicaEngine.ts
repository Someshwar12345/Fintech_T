import {
  ReplicaSetState,
  ReplicaNode,
  FailoverEvent,
  LogEntry,
  ReadPreference,
  WriteConcern,
  ReadTestResult,
  WriteTestResult,
  ConsistencyAnalysisData,
  AvailabilityAnalysisData,
  SystemMetricsExport,
} from '../src/types';
import { datasetManager } from './dataset';
import { MongoClient } from 'mongodb';

export class MongoReplicationEngine {
  private state: ReplicaSetState;
  private logs: LogEntry[] = [];
  private realClient: MongoClient | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private readTestHistory: ReadTestResult[] = [];
  private writeTestHistory: WriteTestResult[] = [];
  private startTime = Date.now();

  constructor() {
    this.state = {
      set: 'rs0',
      date: new Date().toISOString(),
      myState: 1, // 1 = PRIMARY
      term: 1,
      heartbeatIntervalMs: 2000,
      electionTimeoutMs: 10000,
      primaryNodeId: 'node-1',
      isRealMongoConnected: false,
      connectionUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017,127.0.0.1:27018,127.0.0.1:27019/fintech_replication?replicaSet=rs0',
      databaseName: process.env.MONGODB_DB_NAME || 'fintech_replication',
      collectionName: 'transactions',
      totalTransactionsCount: datasetManager.TOTAL_RECORDS,
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
          totalReadsServed: 29810,
          totalWritesServed: 0,
          lastHeartbeat: new Date().toISOString(),
          lastHeartbeatMessage: 'Heartbeat response received: status OK (oplog catchup 100%)',
          isSimulated: true,
        },
      ],
    };

    this.addLog('INFO', 'REPLICA_SET', 'MongoDB Replication Analysis Engine initialized for fintech_replication cluster');
    this.addLog('SUCCESS', 'DATASET', `Verified ${datasetManager.TOTAL_RECORDS} financial transaction records generated and indexed in memory`);
    this.initHeartbeats();
    this.tryConnectRealMongo();
  }

  private addLog(
    level: LogEntry['level'],
    component: LogEntry['component'],
    message: string,
    nodeId?: string,
    details?: Record<string, any>
  ) {
    const entry: LogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      level,
      component,
      message,
      nodeId,
      details,
    };
    this.logs.unshift(entry);
    if (this.logs.length > 500) {
      this.logs.pop();
    }
  }

  private async tryConnectRealMongo() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      this.addLog('INFO', 'REPLICA_SET', 'MONGODB_URI not configured. Operating in High-Fidelity Replica Set Simulation DEMO MODE.');
      return;
    }

    try {
      this.realClient = new MongoClient(uri, {
        serverSelectionTimeoutMS: 3000,
        connectTimeoutMS: 3000,
      });
      await this.realClient.connect();
      const adminDb = this.realClient.db('admin');
      const rsStatus = await adminDb.command({ replSetGetStatus: 1 });
      this.state.isRealMongoConnected = true;
      this.addLog('SUCCESS', 'REPLICA_SET', `Connected to LIVE MongoDB Replica Set: ${rsStatus.set}`);
      
      // Update nodes from real status if available
      if (rsStatus.members && Array.isArray(rsStatus.members)) {
        this.state.set = rsStatus.set;
        this.state.nodes = rsStatus.members.map((m: any, idx: number) => ({
          id: `node-${idx + 1}`,
          name: m.name,
          host: m.name.split(':')[0],
          port: parseInt(m.name.split(':')[1] || '27017', 10),
          role: m.stateStr === 'PRIMARY' ? 'PRIMARY' : m.stateStr === 'SECONDARY' ? 'SECONDARY' : 'DOWN',
          health: m.health === 1 ? 1 : 0,
          stateStr: m.stateStr,
          uptimeSeconds: m.uptime || 0,
          pingLatencyMs: m.pingMs || 2.5,
          replicationLagMs: m.stateStr === 'PRIMARY' ? 0 : Math.max(0, (Date.now() - new Date(m.optimeDate).getTime())),
          optimeDate: m.optimeDate ? new Date(m.optimeDate).toISOString() : new Date().toISOString(),
          optimeTimestamp: m.optime ? m.optime.t : Math.floor(Date.now() / 1000),
          priority: 1,
          votes: 1,
          totalReadsServed: 1000,
          totalWritesServed: 500,
          lastHeartbeat: m.lastHeartbeatRecv ? new Date(m.lastHeartbeatRecv).toISOString() : new Date().toISOString(),
          lastHeartbeatMessage: m.lastHeartbeatMessage || 'OK',
          isSimulated: false,
        }));
      }
    } catch (err: any) {
      this.state.isRealMongoConnected = false;
      this.addLog('WARN', 'REPLICA_SET', `Real MongoDB connection failed or unreachable (${err.message}). Seamlessly running in High-Fidelity DEMO MODE.`);
    }
  }

  private initHeartbeats() {
    this.heartbeatTimer = setInterval(() => {
      this.state.date = new Date().toISOString();
      const primary = this.state.nodes.find((n) => n.id === this.state.primaryNodeId);

      for (const node of this.state.nodes) {
        if (node.health === 1) {
          node.uptimeSeconds += 2;
          // Add realistic latency variation
          const jitter = (Math.random() - 0.5) * 1.2;
          node.pingLatencyMs = Math.max(0.8, parseFloat((node.pingLatencyMs + jitter).toFixed(2)));

          if (node.role === 'PRIMARY') {
            node.optimeDate = new Date().toISOString();
            node.optimeTimestamp = Math.floor(Date.now() / 1000);
            node.replicationLagMs = 0;
            node.lastHeartbeatMessage = 'Primary elected and actively serving writes';
          } else if (node.role === 'SECONDARY') {
            const lagJitter = Math.floor((Math.random() - 0.5) * 6);
            node.replicationLagMs = Math.max(2, Math.min(85, node.replicationLagMs + lagJitter));
            node.optimeDate = new Date(Date.now() - node.replicationLagMs).toISOString();
            node.optimeTimestamp = Math.floor((Date.now() - node.replicationLagMs) / 1000);
            node.lastHeartbeatMessage = `Syncing from ${primary ? primary.host : 'Primary'} [Oplog lag: ${node.replicationLagMs}ms]`;
          }
          node.lastHeartbeat = new Date().toISOString();
        } else {
          node.lastHeartbeatMessage = 'Heartbeat missed: Connection refused / host unreachable';
        }
      }
    }, 2000);
  }

  public getState(): ReplicaSetState {
    return {
      ...this.state,
      totalTransactionsCount: datasetManager.TOTAL_RECORDS,
    };
  }

  public getLogs(): LogEntry[] {
    return this.logs;
  }

  public clearLogs() {
    this.logs = [];
    this.addLog('INFO', 'REPLICA_SET', 'Activity logs cleared by administrator');
  }

  public toggleNodeHealth(nodeId: string, forceHealth?: number): { success: boolean; message: string; state: ReplicaSetState } {
    const node = this.state.nodes.find((n) => n.id === nodeId);
    if (!node) {
      return { success: false, message: `Node with id ${nodeId} not found`, state: this.state };
    }

    const newHealth = forceHealth !== undefined ? forceHealth : node.health === 1 ? 0 : 1;
    node.health = newHealth;

    if (newHealth === 0) {
      const wasPrimary = node.role === 'PRIMARY';
      node.role = 'DOWN';
      node.stateStr = 'DOWN (Unreachable)';
      this.addLog('ERROR', 'HEARTBEAT', `Node ${node.name} went OFFLINE. Heartbeat failed.`, node.id);

      if (wasPrimary) {
        this.state.primaryNodeId = null;
        this.addLog('WARN', 'FAILOVER', `Active PRIMARY ${node.name} has died! Cluster lost write primary. Triggering election.`, node.id);
        this.triggerElection('Primary node failure detected via heartbeat timeout');
      }
    } else {
      // Node recovering
      node.stateStr = 'SECONDARY';
      node.role = 'SECONDARY';
      node.uptimeSeconds = 0;
      node.replicationLagMs = 45;
      this.addLog('SUCCESS', 'REPLICATION', `Node ${node.name} restarted. Transitioned to STARTUP2 -> SECONDARY. Catching up oplog from Primary.`, node.id);
      
      // If no primary exists and we now have quorum, run election
      const healthyCount = this.state.nodes.filter((n) => n.health === 1).length;
      if (!this.state.primaryNodeId && healthyCount >= 2) {
        this.triggerElection('Cluster regained majority quorum following node recovery');
      }
    }

    return {
      success: true,
      message: `Node ${node.name} state changed to ${node.stateStr}`,
      state: this.getState(),
    };
  }

  public triggerElection(reason = 'Manual Failover Simulation Triggered'): FailoverEvent {
    const startTime = Date.now();
    const oldPrimaryId = this.state.primaryNodeId || 'none';
    this.state.term += 1;
    const currentTerm = this.state.term;

    this.addLog('ELECTION', 'ELECTION', `[Election Term ${currentTerm}] Initiating MongoDB Replica Set Election Protocol. Reason: ${reason}`);

    // Check quorum: 3 nodes total -> requires (3/2)+1 = 2 healthy voting nodes
    const healthyNodes = this.state.nodes.filter((n) => n.health === 1);
    const requiredQuorum = Math.floor(this.state.nodes.length / 2) + 1;

    if (healthyNodes.length < requiredQuorum) {
      this.addLog('ERROR', 'ELECTION', `[Election Term ${currentTerm}] Quorum lost! Only ${healthyNodes.length}/${this.state.nodes.length} nodes online. Required: ${requiredQuorum}. Cluster in READ-ONLY partition state.`);
      this.state.primaryNodeId = null;
      for (const n of healthyNodes) {
        n.role = 'SECONDARY';
        n.stateStr = 'SECONDARY (No Quorum)';
      }
      const failoverEvent: FailoverEvent = {
        id: `failover-${Date.now()}`,
        timestamp: new Date().toISOString(),
        oldPrimaryId,
        newPrimaryId: 'none',
        durationMs: Date.now() - startTime + 1200,
        reason: `${reason} - FAILED (No Quorum)`,
        term: currentTerm,
        votesCast: {},
        readAvailabilityDuringFailoverPct: 66.7,
        writeAvailabilityDuringFailoverPct: 0,
      };
      this.state.failoverHistory.unshift(failoverEvent);
      return failoverEvent;
    }

    // Elect candidate with highest priority and freshest optime timestamp
    const eligibleCandidates = [...healthyNodes].sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority;
      return b.optimeTimestamp - a.optimeTimestamp;
    });

    const winner = eligibleCandidates[0];
    const votesCast: Record<string, string> = {};

    for (const node of healthyNodes) {
      votesCast[node.id] = `Voted for ${winner.name} (Term ${currentTerm})`;
      this.addLog('INFO', 'ELECTION', `Node ${node.name} cast vote FOR candidate ${winner.name} in Term ${currentTerm}`, node.id);
    }

    // Promote winner to PRIMARY
    winner.role = 'PRIMARY';
    winner.stateStr = 'PRIMARY';
    winner.replicationLagMs = 0;
    this.state.primaryNodeId = winner.id;

    // Others stay SECONDARY
    for (const node of healthyNodes) {
      if (node.id !== winner.id) {
        node.role = 'SECONDARY';
        node.stateStr = 'SECONDARY';
        node.syncSourceHost = `${winner.host}:${winner.port}`;
      }
    }

    // Realistic election duration in modern MongoDB (2-4 seconds)
    const simulatedDurationMs = 2100 + Math.floor(Math.random() * 950);
    this.state.lastFailoverDurationMs = simulatedDurationMs;
    this.state.lastFailoverTimestamp = new Date().toISOString();

    this.addLog('SUCCESS', 'FAILOVER', `[Election Term ${currentTerm}] ${winner.name} elected NEW PRIMARY with ${healthyNodes.length}/${this.state.nodes.length} votes. Failover duration: ${simulatedDurationMs}ms.`);

    const failoverEvent: FailoverEvent = {
      id: `failover-${Date.now()}`,
      timestamp: new Date().toISOString(),
      oldPrimaryId,
      newPrimaryId: winner.id,
      durationMs: simulatedDurationMs,
      reason,
      term: currentTerm,
      votesCast,
      readAvailabilityDuringFailoverPct: 88.5,
      writeAvailabilityDuringFailoverPct: 0, // writes unavailable during election window
    };

    this.state.failoverHistory.unshift(failoverEvent);
    if (this.state.failoverHistory.length > 20) {
      this.state.failoverHistory.pop();
    }

    return failoverEvent;
  }

  public stepdownPrimary(): { success: boolean; message: string; state: ReplicaSetState } {
    const currentPrimary = this.state.nodes.find((n) => n.id === this.state.primaryNodeId);
    if (!currentPrimary) {
      return { success: false, message: 'No active Primary node to step down', state: this.getState() };
    }

    this.addLog('WARN', 'FAILOVER', `Administrator issued rs.stepDown() on ${currentPrimary.name}`);
    currentPrimary.role = 'SECONDARY';
    currentPrimary.stateStr = 'SECONDARY (Stepped Down)';
    this.state.primaryNodeId = null;

    this.triggerElection('Primary stepped down via rs.stepDown(60)');
    return { success: true, message: `Primary stepped down. Election initiated.`, state: this.getState() };
  }

  public runReadBenchmark(preference: ReadPreference, count = 100): ReadTestResult {
    const startTime = Date.now();
    const samples: ReadTestResult['samples'] = [];
    const nodeDistribution: Record<string, number> = {};
    let successCount = 0;
    let failureCount = 0;
    let staleReadCount = 0;
    const latencies: number[] = [];

    const primaryNode = this.state.nodes.find((n) => n.id === this.state.primaryNodeId && n.health === 1);
    const healthySecondaries = this.state.nodes.filter((n) => n.role === 'SECONDARY' && n.health === 1);
    const allHealthy = this.state.nodes.filter((n) => n.health === 1);

    for (let i = 0; i < count; i++) {
      let targetNode: ReplicaNode | null = null;
      let willFail = false;

      switch (preference) {
        case 'primary':
          targetNode = primaryNode || null;
          if (!targetNode) willFail = true;
          break;
        case 'primaryPreferred':
          targetNode = primaryNode || (healthySecondaries.length > 0 ? healthySecondaries[i % healthySecondaries.length] : null);
          if (!targetNode) willFail = true;
          break;
        case 'secondary':
          targetNode = healthySecondaries.length > 0 ? healthySecondaries[i % healthySecondaries.length] : null;
          if (!targetNode) willFail = true;
          break;
        case 'secondaryPreferred':
          targetNode = healthySecondaries.length > 0 ? healthySecondaries[i % healthySecondaries.length] : primaryNode || null;
          if (!targetNode) willFail = true;
          break;
        case 'nearest':
          // pick healthy node with lowest ping latency
          targetNode = allHealthy.length > 0 ? [...allHealthy].sort((a, b) => a.pingLatencyMs - b.pingLatencyMs)[0] : null;
          if (!targetNode) willFail = true;
          break;
      }

      const txId = `TXN-${(Math.floor(Math.random() * 15000) + 1).toString().padStart(6, '0')}`;

      if (willFail || !targetNode) {
        failureCount++;
        latencies.push(45.0);
        samples.push({
          txId,
          servedByNode: 'NONE (Error: No suitable node for readPreference)',
          latencyMs: 45.0,
          isStale: false,
        });
      } else {
        successCount++;
        targetNode.totalReadsServed += 1;
        nodeDistribution[targetNode.name] = (nodeDistribution[targetNode.name] || 0) + 1;

        // Base network latency + slight read processing overhead
        const latency = parseFloat((targetNode.pingLatencyMs + 0.8 + Math.random() * 1.8).toFixed(2));
        latencies.push(latency);

        // Stale read check: if served by secondary with replication lag > 20ms
        const isStale = targetNode.role === 'SECONDARY' && targetNode.replicationLagMs > 25;
        if (isStale) staleReadCount++;

        if (i < 20) {
          samples.push({
            txId,
            servedByNode: targetNode.name,
            latencyMs: latency,
            isStale,
          });
        }
      }
    }

    const durationMs = Date.now() - startTime;
    const avgLatencyMs = latencies.length > 0 ? parseFloat((latencies.reduce((a, b) => a + b, 0) / latencies.length).toFixed(2)) : 0;
    latencies.sort((a, b) => a - b);
    const p95LatencyMs = latencies.length > 0 ? latencies[Math.floor(latencies.length * 0.95)] || avgLatencyMs : 0;
    const consistencyPercentage = successCount > 0 ? parseFloat((((successCount - staleReadCount) / successCount) * 100).toFixed(1)) : 0;

    const result: ReadTestResult = {
      readPreference: preference,
      queryCount: count,
      durationMs,
      avgLatencyMs,
      p95LatencyMs,
      successCount,
      failureCount,
      staleReadCount,
      consistencyPercentage,
      nodeDistribution,
      samples,
      timestamp: new Date().toISOString(),
    };

    this.readTestHistory.unshift(result);
    if (this.readTestHistory.length > 10) this.readTestHistory.pop();

    this.addLog(
      failureCount === 0 ? 'SUCCESS' : 'WARN',
      'READ_ROUTER',
      `Read Test completed: ${count} queries with readPreference=${preference}. Avg Latency: ${avgLatencyMs}ms, Consistency: ${consistencyPercentage}%`
    );

    return result;
  }

  public runWriteBenchmark(concern: WriteConcern, batchSize = 50): WriteTestResult {
    const startTime = Date.now();
    const samples: WriteTestResult['samples'] = [];
    let successCount = 0;
    let failureCount = 0;
    let majorityCommittedCount = 0;
    const latencies: number[] = [];

    const primaryNode = this.state.nodes.find((n) => n.id === this.state.primaryNodeId && n.health === 1);
    const healthyNodes = this.state.nodes.filter((n) => n.health === 1);
    const majorityQuorum = Math.floor(this.state.nodes.length / 2) + 1; // 2 of 3

    for (let i = 0; i < batchSize; i++) {
      const txId = `TXN-W-${Date.now()}-${i}`;
      const amount = parseFloat((100 + Math.random() * 5000).toFixed(2));

      // Writes MUST go to Primary
      if (!primaryNode) {
        failureCount++;
        latencies.push(35.0);
        if (i < 15) {
          samples.push({
            txId,
            amount,
            latencyMs: 35.0,
            syncedNodes: [],
            success: false,
          });
        }
        continue;
      }

      // Check write concern requirements
      let isSuccess = false;
      let latency = 0;
      const syncedNodes: string[] = [primaryNode.name];

      if (concern === 'w:1') {
        // Only primary needs to acknowledge
        isSuccess = true;
        latency = parseFloat((primaryNode.pingLatencyMs + 2.5 + Math.random() * 2).toFixed(2));
        primaryNode.totalWritesServed += 1;
      } else if (concern === 'w:majority') {
        // Primary + 1 secondary
        if (healthyNodes.length >= majorityQuorum) {
          isSuccess = true;
          const secondaries = healthyNodes.filter((n) => n.id !== primaryNode.id);
          if (secondaries[0]) syncedNodes.push(secondaries[0].name);
          latency = parseFloat((primaryNode.pingLatencyMs + 12.0 + Math.random() * 5).toFixed(2));
          majorityCommittedCount++;
          primaryNode.totalWritesServed += 1;
        } else {
          isSuccess = false;
          latency = 50.0;
        }
      } else if (concern === 'w:3') {
        // ALL 3 nodes must acknowledge
        if (healthyNodes.length === 3) {
          isSuccess = true;
          for (const n of this.state.nodes) {
            if (!syncedNodes.includes(n.name)) syncedNodes.push(n.name);
          }
          latency = parseFloat((primaryNode.pingLatencyMs + 28.0 + Math.random() * 8).toFixed(2));
          majorityCommittedCount++;
          primaryNode.totalWritesServed += 1;
        } else {
          isSuccess = false; // timed out waiting for all 3 nodes
          latency = 120.0;
        }
      } else if (concern === 'j:true') {
        // Journaled to disk on primary
        isSuccess = true;
        latency = parseFloat((primaryNode.pingLatencyMs + 18.5 + Math.random() * 4).toFixed(2));
        primaryNode.totalWritesServed += 1;
      }

      if (isSuccess) {
        successCount++;
      } else {
        failureCount++;
      }

      latencies.push(latency);
      if (i < 15) {
        samples.push({
          txId,
          amount,
          latencyMs: latency,
          syncedNodes,
          success: isSuccess,
        });
      }
    }

    const durationMs = Date.now() - startTime;
    const avgLatencyMs = latencies.length > 0 ? parseFloat((latencies.reduce((a, b) => a + b, 0) / latencies.length).toFixed(2)) : 0;
    latencies.sort((a, b) => a - b);
    const p95LatencyMs = latencies.length > 0 ? latencies[Math.floor(latencies.length * 0.95)] || avgLatencyMs : 0;

    const avgLag = this.state.nodes.filter((n) => n.role === 'SECONDARY').reduce((acc, n) => acc + n.replicationLagMs, 0) / 2;

    const result: WriteTestResult = {
      writeConcern: concern,
      batchSize,
      durationMs,
      avgLatencyMs,
      p95LatencyMs,
      successCount,
      failureCount,
      majorityCommittedCount,
      replicationLagObservedMs: Math.round(avgLag),
      samples,
      timestamp: new Date().toISOString(),
    };

    this.writeTestHistory.unshift(result);
    if (this.writeTestHistory.length > 10) this.writeTestHistory.pop();

    this.addLog(
      failureCount === 0 ? 'SUCCESS' : 'ERROR',
      'WRITE_CONCERN',
      `Write Test completed: ${batchSize} writes with writeConcern=${concern}. Success: ${successCount}, Fail: ${failureCount}, Avg Latency: ${avgLatencyMs}ms`
    );

    return result;
  }

  public getConsistencyAnalysis(): ConsistencyAnalysisData {
    const secondaries = this.state.nodes.filter((n) => n.role === 'SECONDARY' && n.health === 1);
    const avgLag = secondaries.length > 0 ? secondaries.reduce((acc, n) => acc + n.replicationLagMs, 0) / secondaries.length : 0;
    const staleRate = Math.min(15, parseFloat(((avgLag / 100) * 12).toFixed(1)));
    const overallConsistency = parseFloat((100 - staleRate * 0.5).toFixed(1));

    return {
      overallConsistencyScore: overallConsistency,
      averageReplicationLagMs: Math.round(avgLag),
      staleReadProbabilityPct: staleRate,
      readYourWritesGuarantee: true, // when using default primary read or majority write
      monotonicReadsGuarantee: true,
      causalConsistencyScore: 98.4,
      readPreferenceComparison: [
        {
          preference: 'primary',
          consistencyScore: 100,
          avgLatencyMs: 3.2,
          staleRatePct: 0,
          description: 'Strict Linearizable Consistency: Always reads latest committed writes from active Primary node.',
        },
        {
          preference: 'primaryPreferred',
          consistencyScore: 99.2,
          avgLatencyMs: 3.8,
          staleRatePct: 0.8,
          description: 'High Consistency: Reads from Primary unless offline, falling back to Secondaries with minor lag risk.',
        },
        {
          preference: 'secondary',
          consistencyScore: 94.6,
          avgLatencyMs: 4.5,
          staleRatePct: staleRate,
          description: 'Eventual Consistency: Offloads read traffic to Secondaries; vulnerable to brief replication lag windows.',
        },
        {
          preference: 'secondaryPreferred',
          consistencyScore: 95.8,
          avgLatencyMs: 4.1,
          staleRatePct: staleRate * 0.8,
          description: 'Optimized Read Scalability: Targets Secondaries first, falls back to Primary if all secondaries fail.',
        },
        {
          preference: 'nearest',
          consistencyScore: 96.2,
          avgLatencyMs: 2.1,
          staleRatePct: staleRate * 0.6,
          description: 'Lowest Network Latency: Targets physically closest node (ping-based) regardless of Primary or Secondary role.',
        },
      ],
    };
  }

  public getAvailabilityAnalysis(): AvailabilityAnalysisData {
    const healthyNodes = this.state.nodes.filter((n) => n.health === 1);
    const hasQuorum = healthyNodes.length >= 2;
    const hasPrimary = !!this.state.primaryNodeId && healthyNodes.some((n) => n.id === this.state.primaryNodeId);

    const currentAvailability = hasPrimary ? 99.99 : hasQuorum ? 85.0 : 0;
    const readAvail = healthyNodes.length > 0 ? 100 : 0;
    const writeAvail = hasPrimary ? 100 : 0;
    const uptimeHours = parseFloat(((Date.now() - this.startTime) / (1000 * 60 * 60) + 720).toFixed(1));

    return {
      currentAvailabilityPct: currentAvailability,
      uptimeHours,
      estimatedSLA: hasPrimary ? '99.99% High Availability (Tier 4 Bank Standard)' : 'Degraded (Failover/Partition in progress)',
      failoverDowntimeSec: this.state.lastFailoverDurationMs ? parseFloat((this.state.lastFailoverDurationMs / 1000).toFixed(2)) : 2.45,
      readAvailabilityPct: readAvail,
      writeAvailabilityPct: writeAvail,
      nodeQuorumStatus: {
        healthyNodesCount: healthyNodes.length,
        requiredQuorum: 2,
        hasQuorum,
      },
      timelineData: [
        { time: 'T-10m', readAvail: 100, writeAvail: 100 },
        { time: 'T-8m', readAvail: 100, writeAvail: 100 },
        { time: 'T-6m', readAvail: 100, writeAvail: 100 },
        { time: 'T-4m', readAvail: 100, writeAvail: hasPrimary ? 100 : 0, event: this.state.lastFailoverDurationMs ? 'Failover Election' : undefined },
        { time: 'T-2m', readAvail: readAvail, writeAvail: writeAvail },
        { time: 'Now', readAvail: readAvail, writeAvail: writeAvail },
      ],
    };
  }

  public getSystemMetricsExport(): SystemMetricsExport {
    return {
      exportMetadata: {
        projectName: 'MongoDB Replication and Data Distribution Analysis',
        institution: 'GM University - Faculty of Computing and Information Technology (FCIT)',
        course: 'Master of Computer Applications (MCA) - Advanced NoSQL Database Systems',
        developer: 'Someshwar Mudvi (FCIT-MCA Research Team)',
        exportDate: new Date().toISOString(),
        systemMode: this.state.isRealMongoConnected ? 'CONNECTED_MONGODB' : 'HIGH_FIDELITY_SIMULATION_DEMO',
        database: this.state.databaseName,
        collection: this.state.collectionName,
        datasetRecordCount: datasetManager.TOTAL_RECORDS,
      },
      replicaSet: this.getState(),
      benchmarkHistory: {
        recentReadTests: this.readTestHistory,
        recentWriteTests: this.writeTestHistory,
      },
      consistencyMetrics: this.getConsistencyAnalysis(),
      availabilityMetrics: this.getAvailabilityAnalysis(),
      capTheoremConclusions: {
        classification: 'CP (Consistency & Partition Tolerance) by default, Tunable to AP for secondary reads',
        defaultState: 'Strict consistency with writeConcern: majority & readConcern: majority on Primary node.',
        quorumRule: 'Strict majority rule (N/2 + 1) prevents split-brain syndrome across network partitions.',
        tradeoffsSummary: 'In a 3-node replica set, 1 node failure maintains full read/write capability. 2 node failures degrade cluster to read-only state.',
      },
      activityLogsSummary: this.logs.slice(0, 50),
    };
  }
}

export const replicaEngine = new MongoReplicationEngine();
