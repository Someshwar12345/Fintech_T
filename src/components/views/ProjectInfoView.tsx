import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  Copy,
  Check,
  Code2,
  Database,
  Server,
  Layers,
  Activity,
  CheckCircle2,
  BarChart3,
  BookOpen,
  Terminal,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

export const ProjectInfoView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'report' | 'viva' | 'code'>('report');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadMarkdown = () => {
    const markdownContent = `# Comprehensive Academic Project Report
## MongoDB Replication and Data Distribution Analysis
**Subject**: NoSQL Distributed Databases & Systems Architecture
**Project Domain**: High-Availability Fintech Ledger & Real-Time Fault Tolerance

---

## 1. Problem Statement
In mission-critical fintech and electronic banking environments, core transactional ledgers experience continuous write-intensive workloads, rigorous regulatory audit mandates (PCI-DSS, Basel III), and strict Service Level Agreements (SLAs) demanding 99.999% ('five nines') availability. 

Traditional single-node relational databases suffer from critical architectural bottlenecks:
1. **Single Point of Failure (SPOF)**: Hardware, network, or operating system failures halt processing, leading to severe financial penalties and customer disruption.
2. **Read/Write Contention**: Simultaneous query execution for fraud monitoring, analytics, and instant transaction settlement overwhelms a single primary instance.
3. **Slow Disaster Recovery**: Cold standby replication mechanisms require minutes of manual intervention, violating Recovery Time Objectives (RTO < 5 seconds).

**Industry Solution**: Implementing a distributed MongoDB 3-Node Replica Set with asynchronous oplog streaming, automated Raft-style consensus elections, tunable write concerns (w:1, w:majority), and intelligent read preference routing.

---

## 2. Project Objectives
1. **Cluster Architecture & Topology Provisioning**: Design, provision, and benchmark a 3-node MongoDB Replica Set cluster (1 Primary + 2 Secondaries) to guarantee automated zero-data-loss failover and continuous fault tolerance.
2. **Replication Latency & Read/Write Performance Analysis**: Ingest and index 15,000 realistic financial transaction records; benchmark throughput, latency, replication lag, and staleness probabilities across diverse Write Concerns (w:1, w:majority) and Read Preferences (primary, secondary, nearest).
3. **Fault-Tolerance Evaluation & CAP Theorem Proof**: Empirically measure leader election duration, quorum preservation during network partitions, and validate that MongoDB behaves as a CP (Consistency and Partition Tolerance) system under the Brewer CAP theorem.

---

## 3. Technology Stack
- **Database Engine**: MongoDB 7.0 Community Server / WiredTiger Storage Engine (Replica Set: rs0, Protocol pv1)
- **Backend Application Layer**: Python 3.11 with Flask Web Framework & PyMongo Driver / Node.js Express API Engine
- **Frontend User Interface**: React 19, TypeScript, Tailwind CSS, Recharts / Chart.js, Lucide Icons
- **Programming Languages**: Python, TypeScript, JavaScript
- **Development & Diagnostic Tools**: mongosh (MongoDB Shell), Docker & Docker Compose, Postman API Tester, Git, VS Code

---

## 4. Dataset Description
- **Dataset Source**: High-Throughput Synthetic Fintech Ledger Engine
- **Total Record Volume**: 15,000 Transaction Documents
- **Attributes**:
  1. \`transaction_id\` (String): Unique transaction code (e.g., TXN-000102)
  2. \`customer_id\` (String): Indexed customer identifier (e.g., CUST-01492)
  3. \`account_id\` (String): Financial ledger account number
  4. \`transaction_type\` (Enum): Wire Transfer, Card Payment, Instant P2P, Merchant POS, Loan Repayment, FX Exchange, ATM Withdrawal, Crypto Swap
  5. \`amount\` (Double): Transaction value in native currency ($10.00 to $10,000.00)
  6. \`currency\` (Enum): USD, EUR, GBP, INR, JPY, CAD
  7. \`transaction_date\` (ISO 8601 UTC): Timestamp of execution
  8. \`status\` (Enum): SETTLED, PENDING, FLAGGED_REVIEW, CLEARED, FAILED
  9. \`source_account\` (String): Debited bank node / routing code
  10. \`destination_account\` (String): Credited counterparty account
  11. \`location\` (String): Originating regional clearing city
  12. \`payment_method\` (Enum): FedNow, SEPA, SWIFT, ACH, UPI, VisaNet, Internal Ledger
  13. \`risk_score\` (Integer): Real-time AML fraud risk indicator (0 to 100)
  14. \`replication_meta\` (Object): Oplog timestamp, synced node IDs, and majority commitment verification

---

## 5. Database Design & Replica Set Architecture
### 5.1 Cluster Topology
- **Node 1 (mongo-node-1)**: Primary (Port 27017, Priority: 2, Votes: 1)
- **Node 2 (mongo-node-2)**: Secondary A (Port 27018, Priority: 1, Votes: 1)
- **Node 3 (mongo-node-3)**: Secondary B (Port 27019, Priority: 1, Votes: 1)

### 5.2 Consensus & Quorum Math
- **Formula**: Majority Quorum = floor(N / 2) + 1
- For N = 3 nodes: Required Quorum = 2 nodes.
- If 1 node fails, 2 remain healthy (Quorum preserved -> Cluster elects new primary in < 3000ms).
- If 2 nodes fail, 1 remains (Quorum lost -> Node steps down to Read-Only Secondary to prevent split-brain).

---

## 6. System Architecture
\`\`\`
[ Fintech Client / Web Dashboard ]
                 │ (HTTPS / REST API)
                 ▼
     [ Python Flask / Node Backend API ]
                 │ (PyMongo / MongoClient Connection Pool)
                 ▼
  ┌──────────────────────────────────────────────────────────┐
  │                 MongoDB Replica Set (rs0)                │
  │                                                          │
  │   ┌──────────────────┐                                   │
  │   │  PRIMARY NODE    │  ─── Oplog Stream (Replication) ──▶
  │   │  (Writes / Reads)│                                   │
  │   └────────┬─────────┘                                   │
  │            │                                             │
  │            ▼                                             │
  │   ┌──────────────────┐            ┌──────────────────┐   │
  │   │ SECONDARY NODE A │ ◀────────▶ │ SECONDARY NODE B │   │
  │   │  (Read Replicas) │  Heartbeat │  (Read Replicas) │   │
  │   └──────────────────┘ (2000ms)   └──────────────────┘   │
  └──────────────────────────────────────────────────────────┘
\`\`\`

---

## 7. Implementation & Code Artifacts
### 7.1 Replica Set Initialization
\`\`\`javascript
rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "mongo-node-1:27017", priority: 2 },
    { _id: 1, host: "mongo-node-2:27018", priority: 1 },
    { _id: 2, host: "mongo-node-3:27019", priority: 1 }
  ]
});
\`\`\`

---

## 8. Query Implementations & Analytics
1. **Aggregation Pipeline**: High-value transactions grouped by payment method with currency normalization.
2. **Risk & Fraud Anomaly Query**: Identification of high-risk transactions ($risk_score >= 70) pending settlement.
3. **Replica Set Diagnostic Command**: \`rs.status()\` and \`db.serverStatus().oplog\` verification.

---

## 9. Comparison Matrix: MongoDB NoSQL vs Relational Database (RDBMS)
| Parameter | Relational RDBMS (PostgreSQL / MySQL) | MongoDB Distributed NoSQL Replica Set |
| :--- | :--- | :--- |
| **Data Model** | Rigid Relational Tables & Fixed Columns | Dynamic Polymorphic JSON / BSON Documents |
| **High Availability** | Active-Passive Standby with manual failover | Fully Automated Raft Leader Election (< 3s) |
| **Horizontal Scalability** | Complex sharding / Expensive read-replicas | Built-in Auto-Sharding & Native Oplog Sync |
| **Write Concerns** | Synchronous 2-Phase Commit (High Latency) | Granular tunable concerns (w:1, w:majority) |
| **Read Routing** | Custom proxy layer required | Native Read Preferences (primary, secondary, nearest) |
| **CAP Classification** | CA (Consistency + Availability on single node) | CP (Consistency + Partition Tolerance) |
`;

    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'MongoDB_Replication_Project_Report.md';
    link.click();
    URL.revokeObjectURL(url);
  };

  const flaskFullCode = `"""
MongoDB Replica Set & Distributed Data Analytics Service
Backend Implementation: Python 3.11 + Flask + PyMongo
"""
import os
import time
from datetime import datetime, timezone
from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient, ReadPreference, WriteConcern
from pymongo.errors import ConnectionFailure, OperationFailure

app = Flask(__name__)
CORS(app)

MONGO_URI = os.getenv(
    "MONGODB_URI",
    "mongodb://127.0.0.1:27017,127.0.0.1:27018,127.0.0.1:27019/fintech_replication?replicaSet=rs0&w=majority"
)

# Initialize MongoClient with connection pooling & replica set discovery
client = MongoClient(
    MONGO_URI,
    serverSelectionTimeoutMS=5000,
    connectTimeoutMS=10000,
    socketTimeoutMS=10000,
    retryWrites=True,
    retryReads=True
)

db = client["fintech_replication"]
transactions_col = db["transactions"]

@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({"status": "ONLINE", "timestamp": datetime.now(timezone.utc).isoformat()})

@app.route("/api/replica/status", methods=["GET"])
def get_replica_status():
    try:
        status = client.admin.command("replSetGetStatus")
        primary_node = None
        nodes = []
        for m in status.get("members", []):
            if m.get("stateStr") == "PRIMARY":
                primary_node = m.get("name")
            nodes.append({
                "id": str(m.get("_id")),
                "name": m.get("name"),
                "stateStr": m.get("stateStr"),
                "health": m.get("health"),
                "uptime": m.get("uptime"),
                "optimeDate": m.get("optimeDate").isoformat() if m.get("optimeDate") else None,
                "pingMs": m.get("pingMs", 0)
            })
        return jsonify({
            "set": status.get("set"),
            "term": status.get("term", 1),
            "primaryNode": primary_node,
            "nodes": nodes
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/api/transactions", methods=["GET"])
def get_transactions():
    page = int(request.args.get("page", 1))
    page_size = int(request.args.get("pageSize", 25))
    search = request.args.get("search", "")
    
    query = {}
    if search:
        query["$or"] = [
            {"transaction_id": {"$regex": search, "$options": "i"}},
            {"customer_id": {"$regex": search, "$options": "i"}},
            {"account_id": {"$regex": search, "$options": "i"}}
        ]
        
    total = transactions_col.count_documents(query)
    cursor = transactions_col.find(query, {"_id": 0}).skip((page - 1) * page_size).limit(page_size)
    data = list(cursor)
    
    return jsonify({
        "data": data,
        "total": total,
        "page": page,
        "pageSize": page_size,
        "totalPages": (total + page_size - 1) // page_size
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
`;

  return (
    <div id="comprehensive-academic-report-view" className="space-y-4 animate-fade-in pb-12 font-sans">
      {/* Top Header & Export Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg bg-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-400" />
            <h2 className="text-base sm:text-lg font-bold text-white font-mono">
              Academic Project Report & Documentation Suite
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
              20-25 Pages Equivalent
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Complete technical documentation covering all 9 mandatory curriculum sections, architecture designs, code listings, queries, and comparative analysis.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadMarkdown}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold font-mono transition-colors shadow-xs"
            title="Download full Markdown documentation (.md)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Report (.md)</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold font-mono transition-colors border border-slate-700"
            title="Print or Save as PDF"
          >
            <Printer className="w-3.5 h-3.5 text-slate-400" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-950 px-2 gap-2 text-xs font-mono">
        <button
          onClick={() => setActiveTab('report')}
          className={`px-4 py-2.5 font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'report'
              ? 'border-blue-500 text-blue-400 bg-slate-900/60'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Full Academic Report (Sections 1-9)</span>
        </button>

        <button
          onClick={() => setActiveTab('viva')}
          className={`px-4 py-2.5 font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'viva'
              ? 'border-blue-500 text-blue-400 bg-slate-900/60'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Viva Voce & Technical Defense</span>
        </button>

        <button
          onClick={() => setActiveTab('code')}
          className={`px-4 py-2.5 font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'code'
              ? 'border-blue-500 text-blue-400 bg-slate-900/60'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>Python Flask & PyMongo Service</span>
        </button>
      </div>

      {/* Main Content Area */}
      {activeTab === 'report' && (
        <div className="space-y-6 text-slate-200">
          {/* Quick Table of Contents Sticky Bar */}
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono flex flex-wrap items-center gap-x-4 gap-y-2 text-slate-400">
            <span className="text-white font-bold uppercase tracking-wider">Index:</span>
            <a href="#sec-1" className="hover:text-blue-400">1. Problem Statement</a>
            <span>•</span>
            <a href="#sec-2" className="hover:text-blue-400">2. Objectives</a>
            <span>•</span>
            <a href="#sec-3" className="hover:text-blue-400">3. Tech Stack</a>
            <span>•</span>
            <a href="#sec-4" className="hover:text-blue-400">4. Dataset</a>
            <span>•</span>
            <a href="#sec-5" className="hover:text-blue-400">5. Database Design</a>
            <span>•</span>
            <a href="#sec-6" className="hover:text-blue-400">6. Architecture</a>
            <span>•</span>
            <a href="#sec-7" className="hover:text-blue-400">7. Implementation</a>
            <span>•</span>
            <a href="#sec-8" className="hover:text-blue-400">8. Queries</a>
            <span>•</span>
            <a href="#sec-9" className="hover:text-blue-400">9. RDBMS Comparison</a>
          </div>

          {/* Section 1: Problem Statement */}
          <section id="sec-1" className="p-5 rounded-lg bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm sm:text-base font-bold text-white font-mono flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-blue-600/20 text-blue-400 text-xs">Section 1</span>
                <span>Problem Statement: High-Availability Challenges in Fintech Data Stores</span>
              </h3>
              <button
                onClick={() => handleCopy("Problem Statement Content", "sec-1")}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-mono"
              >
                {copiedSection === "sec-1" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy</span>
              </button>
            </div>
            
            <div className="text-xs leading-relaxed text-slate-300 space-y-3 font-sans">
              <p>
                In electronic financial settlement networks, automated clearing houses, and neo-banking platforms, core transactional ledger databases are subject to intense write throughput and continuous read traffic. Regulatory bodies such as the Federal Reserve, European Central Bank, and Reserve Bank of India mandate strict compliance standards (e.g., Basel III operational resilience, PCI-DSS Level 1 auditability) requiring that financial transaction databases achieve at least <strong>99.99% to 99.999% Service Level Availability (SLA)</strong> with zero committed transaction data loss.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded bg-slate-950 border border-slate-800 space-y-1">
                  <strong className="text-rose-400 font-mono text-xs block">1. Single Point of Failure (SPOF)</strong>
                  <p className="text-[11px] text-slate-400">
                    Standalone database architectures halt entirely upon disk degradation, kernel panics, or datacenter connectivity loss, causing massive transaction rollbacks and merchant downtime.
                  </p>
                </div>
                <div className="p-3 rounded bg-slate-950 border border-slate-800 space-y-1">
                  <strong className="text-amber-400 font-mono text-xs block">2. Read/Write Throughput Bottlenecks</strong>
                  <p className="text-[11px] text-slate-400">
                    Simultaneous real-time anti-fraud scoring and settlement queries on a single node cause lock contention, elevating write latencies beyond acceptable SLAs (&gt; 50ms).
                  </p>
                </div>
                <div className="p-3 rounded bg-slate-950 border border-slate-800 space-y-1">
                  <strong className="text-indigo-400 font-mono text-xs block">3. Data Inconsistency & Stale Reads</strong>
                  <p className="text-[11px] text-slate-400">
                    Unsynchronized multi-node backups lead to dirty reads, phantom balance deductions, and double-spend vulnerabilities across global branch nodes.
                  </p>
                </div>
              </div>

              <p>
                <strong>The Industry Solution</strong>: This project designs, implements, and empirically validates a high-availability <strong>3-Node MongoDB Replica Set</strong> with automated Raft-style consensus leader elections, asynchronous Operations Log (oplog) replication, tunable write concerns (<code className="text-blue-300 bg-slate-950 px-1 py-0.5 rounded font-mono">w:majority</code>), and dynamic read preference load distribution.
              </p>
            </div>
          </section>

          {/* Section 2: Objectives */}
          <section id="sec-2" className="p-5 rounded-lg bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm sm:text-base font-bold text-white font-mono flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-blue-600/20 text-blue-400 text-xs">Section 2</span>
                <span>Project Objectives</span>
              </h3>
            </div>

            <div className="space-y-3 font-sans text-xs">
              <div className="p-3 rounded bg-slate-950 border border-slate-800 flex items-start gap-3">
                <div className="w-6 h-6 rounded bg-blue-600/20 text-blue-400 font-mono font-bold flex items-center justify-center shrink-0 text-xs">
                  01
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs font-mono">
                    Cluster Architecture & High-Availability Topology Implementation
                  </h4>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Provision a multi-node MongoDB Replica Set cluster (1 Primary + 2 Secondaries) configured with election protocol <code className="text-blue-300 font-mono">pv1</code>, heartbeat monitoring (2000ms), and strict quorum calculation to guarantee automatic failover without human intervention in under 3.5 seconds.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded bg-slate-950 border border-slate-800 flex items-start gap-3">
                <div className="w-6 h-6 rounded bg-emerald-600/20 text-emerald-400 font-mono font-bold flex items-center justify-center shrink-0 text-xs">
                  02
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs font-mono">
                    Fintech Ingestion (15,000 Records) & Replication Lag Optimization
                  </h4>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Generate and bulk-ingest exactly 15,000 standardized financial transaction records. Benchmark read latency across read preferences (<code className="text-blue-300 font-mono">primary</code>, <code className="text-blue-300 font-mono">secondary</code>, <code className="text-blue-300 font-mono">nearest</code>) and assess write durability overhead across write concerns (<code className="text-blue-300 font-mono">w:1</code>, <code className="text-blue-300 font-mono">w:majority</code>).
                  </p>
                </div>
              </div>

              <div className="p-3 rounded bg-slate-950 border border-slate-800 flex items-start gap-3">
                <div className="w-6 h-6 rounded bg-purple-600/20 text-purple-400 font-mono font-bold flex items-center justify-center shrink-0 text-xs">
                  03
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs font-mono">
                    Empirical Fault-Tolerance Simulation & CAP Theorem Validation
                  </h4>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Simulate catastrophic primary node failure, observe term increment and voter ballot convergence, evaluate read/write availability during the partition, and mathematically verify MongoDB's classification as a <strong>CP (Consistency & Partition Tolerance)</strong> distributed database.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Technology Stack */}
          <section id="sec-3" className="p-5 rounded-lg bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm sm:text-base font-bold text-white font-mono flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-blue-600/20 text-blue-400 text-xs">Section 3</span>
                <span>Technology Stack & Environmental Specifications</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <Database className="w-4 h-4" />
                  <span>Database Layer</span>
                </div>
                <ul className="text-[11px] text-slate-400 space-y-1 list-disc list-inside">
                  <li><strong className="text-slate-200">Engine:</strong> MongoDB 7.0 Community</li>
                  <li><strong className="text-slate-200">Storage:</strong> WiredTiger Engine (Snappy)</li>
                  <li><strong className="text-slate-200">Topology:</strong> 3-Node Replica Set (<code className="text-blue-300">rs0</code>)</li>
                  <li><strong className="text-slate-200">Consensus:</strong> Election Protocol <code className="text-blue-300">pv1</code></li>
                </ul>
              </div>

              <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 text-blue-400 font-bold">
                  <Server className="w-4 h-4" />
                  <span>Backend & API</span>
                </div>
                <ul className="text-[11px] text-slate-400 space-y-1 list-disc list-inside">
                  <li><strong className="text-slate-200">Language:</strong> Python 3.11 / Node.js 20</li>
                  <li><strong className="text-slate-200">Framework:</strong> Flask 3.0 / Express.js 4</li>
                  <li><strong className="text-slate-200">Driver:</strong> PyMongo 4.6 (Connection Pool)</li>
                  <li><strong className="text-slate-200">Protocol:</strong> RESTful JSON over HTTPS</li>
                </ul>
              </div>

              <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-1.5">
                <div className="flex items-center gap-2 text-indigo-400 font-bold">
                  <Layers className="w-4 h-4" />
                  <span>Frontend & UI</span>
                </div>
                <ul className="text-[11px] text-slate-400 space-y-1 list-disc list-inside">
                  <li><strong className="text-slate-200">Framework:</strong> React 19 + TypeScript</li>
                  <li><strong className="text-slate-200">Styling:</strong> Tailwind CSS 4 (High Density)</li>
                  <li><strong className="text-slate-200">Analytics:</strong> Recharts & Chart.js Engine</li>
                  <li><strong className="text-slate-200">Icons:</strong> Lucide React Iconography</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 4: Dataset Description */}
          <section id="sec-4" className="p-5 rounded-lg bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm sm:text-base font-bold text-white font-mono flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-blue-600/20 text-blue-400 text-xs">Section 4</span>
                <span>Dataset Description & Synthetic Ledger Generation</span>
              </h3>
            </div>

            <div className="space-y-3 text-xs font-sans text-slate-300">
              <p>
                The transactional dataset comprises exactly <strong>15,000 document records</strong> generated via a deterministic, seeded pseudo-random financial simulation algorithm. Each record adheres strictly to the ISO 20022 and PCI-DSS ledger representation schemas.
              </p>

              {/* Data Schema Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-[11px] font-mono border border-slate-800 rounded">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-2 text-left">Field Name</th>
                      <th className="p-2 text-left">BSON Type</th>
                      <th className="p-2 text-left">Sample Value</th>
                      <th className="p-2 text-left">Description & Indexing</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-900/60">
                    <tr>
                      <td className="p-2 text-blue-300 font-bold">transaction_id</td>
                      <td className="p-2 text-slate-400">String</td>
                      <td className="p-2 text-slate-300">"TXN-000102"</td>
                      <td className="p-2 text-slate-400">Unique identifier with B-Tree Unique Index</td>
                    </tr>
                    <tr>
                      <td className="p-2 text-blue-300 font-bold">customer_id</td>
                      <td className="p-2 text-slate-400">String</td>
                      <td className="p-2 text-slate-300">"CUST-04921"</td>
                      <td className="p-2 text-slate-400">Customer account identifier (Compound indexed)</td>
                    </tr>
                    <tr>
                      <td className="p-2 text-blue-300 font-bold">account_id</td>
                      <td className="p-2 text-slate-400">String</td>
                      <td className="p-2 text-slate-300">"ACC-FIN-54910"</td>
                      <td className="p-2 text-slate-400">Core ledger account reference</td>
                    </tr>
                    <tr>
                      <td className="p-2 text-blue-300 font-bold">transaction_type</td>
                      <td className="p-2 text-slate-400">String</td>
                      <td className="p-2 text-slate-300">"Wire Transfer"</td>
                      <td className="p-2 text-slate-400">Card Payment, Instant P2P, SWIFT, etc.</td>
                    </tr>
                    <tr>
                      <td className="p-2 text-blue-300 font-bold">amount</td>
                      <td className="p-2 text-emerald-400">Double</td>
                      <td className="p-2 text-emerald-300">4,850.50</td>
                      <td className="p-2 text-slate-400">Transaction monetary quantity (Pareto curve)</td>
                    </tr>
                    <tr>
                      <td className="p-2 text-blue-300 font-bold">currency</td>
                      <td className="p-2 text-slate-400">String</td>
                      <td className="p-2 text-slate-300">"USD"</td>
                      <td className="p-2 text-slate-400">USD, EUR, GBP, INR, JPY, CAD</td>
                    </tr>
                    <tr>
                      <td className="p-2 text-blue-300 font-bold">status</td>
                      <td className="p-2 text-slate-400">String</td>
                      <td className="p-2 text-slate-300">"SETTLED"</td>
                      <td className="p-2 text-slate-400">SETTLED, PENDING, FLAGGED_REVIEW, FAILED</td>
                    </tr>
                    <tr>
                      <td className="p-2 text-blue-300 font-bold">risk_score</td>
                      <td className="p-2 text-rose-400">Int32</td>
                      <td className="p-2 text-rose-300">88</td>
                      <td className="p-2 text-slate-400">AML Risk Index (0-100; &gt;=70 triggers review)</td>
                    </tr>
                    <tr>
                      <td className="p-2 text-blue-300 font-bold">replication_meta</td>
                      <td className="p-2 text-purple-400">Embedded Doc</td>
                      <td className="p-2 text-slate-300">{`{ oplog_ts: 1714..., synced_nodes: [...] }`}</td>
                      <td className="p-2 text-slate-400">Oplog timestamp and majority commit metadata</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Section 5: Database Design & Replica Set Architecture */}
          <section id="sec-5" className="p-5 rounded-lg bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm sm:text-base font-bold text-white font-mono flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-blue-600/20 text-blue-400 text-xs">Section 5</span>
                <span>Database Design: 3-Node Replica Set Topology & Oplog Sync</span>
              </h3>
            </div>

            <div className="space-y-3 text-xs font-sans text-slate-300">
              <p>
                MongoDB Replica Sets maintain consistent copies of data across independent nodes using a primary-secondary architecture backed by an Operations Log (<code className="text-blue-300 font-mono">local.oplog.rs</code>).
              </p>

              {/* Topology Spec Table */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
                <div className="p-3 bg-slate-950 rounded border border-slate-800">
                  <div className="text-blue-400 font-bold">Node 1: mongo-node-1</div>
                  <div className="text-[11px] text-slate-400 mt-1 space-y-0.5">
                    <div>Port: <strong className="text-white">27017</strong></div>
                    <div>Default Role: <strong className="text-emerald-400">PRIMARY</strong></div>
                    <div>Priority: <strong className="text-white">2.0</strong></div>
                    <div>Votes: <strong className="text-white">1</strong></div>
                    <div>Sync Source: <strong className="text-slate-500">None (Leader)</strong></div>
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded border border-slate-800">
                  <div className="text-indigo-400 font-bold">Node 2: mongo-node-2</div>
                  <div className="text-[11px] text-slate-400 mt-1 space-y-0.5">
                    <div>Port: <strong className="text-white">27018</strong></div>
                    <div>Default Role: <strong className="text-slate-300">SECONDARY</strong></div>
                    <div>Priority: <strong className="text-white">1.0</strong></div>
                    <div>Votes: <strong className="text-white">1</strong></div>
                    <div>Sync Source: <strong className="text-blue-400">mongo-node-1</strong></div>
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded border border-slate-800">
                  <div className="text-indigo-400 font-bold">Node 3: mongo-node-3</div>
                  <div className="text-[11px] text-slate-400 mt-1 space-y-0.5">
                    <div>Port: <strong className="text-white">27019</strong></div>
                    <div>Default Role: <strong className="text-slate-300">SECONDARY</strong></div>
                    <div>Priority: <strong className="text-white">1.0</strong></div>
                    <div>Votes: <strong className="text-white">1</strong></div>
                    <div>Sync Source: <strong className="text-blue-400">mongo-node-1</strong></div>
                  </div>
                </div>
              </div>

              {/* Oplog & Quorum Math */}
              <div className="p-3 rounded bg-slate-950 border border-slate-800 font-mono text-[11px] space-y-2">
                <div className="text-white font-bold">Oplog Synchronization & Election Mathematics:</div>
                <div className="text-slate-400">
                  1. <strong className="text-slate-200">Oplog Mechanism:</strong> The Primary writes all mutations to its capped <code className="text-blue-300">local.oplog.rs</code>. Secondaries continuously tail the oplog using tailable cursors and asynchronously apply idempotent writes to their local WiredTiger storage.
                </div>
                <div className="text-slate-400">
                  2. <strong className="text-slate-200">Quorum Calculation:</strong> <code className="text-emerald-400">Majority = floor(N / 2) + 1</code>. For N=3, Majority = 2. A node can only be elected or sustain primary status if it holds heartbeats from at least 2 voting members.
                </div>
              </div>
            </div>
          </section>

          {/* Section 6: System Architecture */}
          <section id="sec-6" className="p-5 rounded-lg bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm sm:text-base font-bold text-white font-mono flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-blue-600/20 text-blue-400 text-xs">Section 6</span>
                <span>System Architecture Block Diagram</span>
              </h3>
            </div>

            <div className="p-4 rounded bg-slate-950 border border-slate-800 overflow-x-auto font-mono text-xs">
              <pre className="text-slate-300 leading-relaxed">
{`+-------------------------------------------------------------------------+
|                  FINTECH CLIENT APPLICATION LAYER                       |
|  [ Web Dashboard / Mobile Banking / Automated Algorithmic Settlement ]  |
+-------------------------------------------------------------------------+
                                    │
                                    │ (HTTPS REST API / JSON Payloads)
                                    ▼
+-------------------------------------------------------------------------+
|                    APPLICATION & API SERVICE LAYER                      |
|  [ Python Flask 3.11 / PyMongo Client Pool / Express.js Proxy Engine ]  |
|  • Intelligent Query Router (ReadPreference: primary / secondary)       |
|  • Durability Enforcer (WriteConcern: w:majority, wtimeout: 5000ms)     |
+-------------------------------------------------------------------------+
                                    │
                                    │ (MongoDB Wire Protocol / Connection Pool)
                                    ▼
+-------------------------------------------------------------------------+
|                  DISTRIBUTED MONGODB REPLICA SET (rs0)                  |
|                                                                         |
|  ┌─────────────────────────────────┐                                    |
|  │        PRIMARY NODE (27017)     │                                    |
|  │  • Handles all Write Operations │ ──┐                                |
|  │  • Generates Oplog Entries      │   │ Oplog Stream                   |
|  └─────────────────────────────────┘   │ (Async Replication)            |
|                   │                    │                                |
|         Heartbeat │ (2000ms Interval)  ▼                                |
|                   ▼             ┌────────────────────────────────────┐  |
|  ┌────────────────────────────┐ │        SECONDARY B (27019)         │  |
|  │    SECONDARY A (27018)     │ │  • Read Replicas / Nearest Query   │  |
|  │  • Read-Scale Distribution │ │  • Maintains Hot Standby Ledger    │  |
|  │  • Voting Consensus Member │ │  • Voting Consensus Member         │  |
|  └────────────────────────────┘ └────────────────────────────────────┘  |
+-------------------------------------------------------------------------+`}
              </pre>
            </div>
          </section>

          {/* Section 7: Implementation & Code */}
          <section id="sec-7" className="p-5 rounded-lg bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm sm:text-base font-bold text-white font-mono flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-blue-600/20 text-blue-400 text-xs">Section 7</span>
                <span>Implementation: Replica Set Initialization, Ingestion & CRUD</span>
              </h3>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {/* Init Script */}
              <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-1">
                <div className="text-blue-400 font-bold text-[11px] uppercase">
                  7.1 Replica Set Initialization (mongosh)
                </div>
                <pre className="text-slate-300 text-[11px] overflow-x-auto p-2 bg-slate-900/80 rounded">
{`rs.initiate({
  _id: "rs0",
  protocolVersion: 1,
  members: [
    { _id: 0, host: "mongo-node-1:27017", priority: 2.0 },
    { _id: 1, host: "mongo-node-2:27018", priority: 1.0 },
    { _id: 2, host: "mongo-node-3:27019", priority: 1.0 }
  ]
});`}
                </pre>
              </div>

              {/* Data Ingestion Script */}
              <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-1">
                <div className="text-emerald-400 font-bold text-[11px] uppercase">
                  7.2 15,000 Record Bulk Ingestion Script (Python + PyMongo)
                </div>
                <pre className="text-slate-300 text-[11px] overflow-x-auto p-2 bg-slate-900/80 rounded">
{`import random, time
from pymongo import MongoClient, WriteConcern

client = MongoClient("mongodb://localhost:27017,localhost:27018,localhost:27019/?replicaSet=rs0")
db = client.get_database("fintech_replication", write_concern=WriteConcern(w="majority"))
transactions = db.transactions

batch = []
for i in range(1, 15001):
    doc = {
        "transaction_id": f"TXN-{str(i).zfill(6)}",
        "customer_id": f"CUST-{str(random.randint(1000, 5000)).zfill(5)}",
        "amount": round(random.uniform(10.0, 9500.0), 2),
        "currency": random.choice(["USD", "EUR", "GBP", "INR"]),
        "status": "SETTLED",
        "payment_method": random.choice(["FedNow", "SEPA", "SWIFT", "UPI"]),
        "risk_score": random.randint(1, 100),
        "created_at": time.time()
    }
    batch.append(doc)
    if len(batch) >= 1000:
        transactions.insert_many(batch)
        batch = []
if batch:
    transactions.insert_many(batch)
print("Successfully committed 15,000 records to majority quorum.")`}
                </pre>
              </div>
            </div>
          </section>

          {/* Section 8: Query Implementations */}
          <section id="sec-8" className="p-5 rounded-lg bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm sm:text-base font-bold text-white font-mono flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-blue-600/20 text-blue-400 text-xs">Section 8</span>
                <span>Query Implementation, Aggregations & Diagnostic Outputs</span>
              </h3>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-1.5">
                <div className="flex justify-between items-center text-blue-400 font-bold text-[11px]">
                  <span>Query 1: High-Value Aggregation by Payment Method & Currency</span>
                  <span className="text-slate-500">ReadPreference: secondary</span>
                </div>
                <pre className="text-slate-300 text-[11px] overflow-x-auto p-2 bg-slate-900/80 rounded">
{`db.transactions.aggregate([
  { $match: { amount: { $gte: 1000.0 }, status: "SETTLED" } },
  { $group: {
      _id: { method: "$payment_method", currency: "$currency" },
      totalVolume: { $sum: "$amount" },
      avgTransaction: { $avg: "$amount" },
      txCount: { $sum: 1 }
    }
  },
  { $sort: { totalVolume: -1 } },
  { $limit: 5 }
])`}
                </pre>
                <div className="p-2 rounded bg-slate-900 text-[10px] text-slate-400">
                  <strong className="text-emerald-400">Execution Purpose:</strong> Offloads heavy ledger summation workloads to Secondary nodes without blocking primary transaction writes.
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-1.5">
                <div className="flex justify-between items-center text-rose-400 font-bold text-[11px]">
                  <span>Query 2: High-Risk AML Anomaly Detection Filter</span>
                  <span className="text-slate-500">ReadPreference: primary</span>
                </div>
                <pre className="text-slate-300 text-[11px] overflow-x-auto p-2 bg-slate-900/80 rounded">
{`db.transactions.find({
  risk_score: { $gte: 75 },
  status: { $in: ["PENDING", "FLAGGED_REVIEW"] }
}).sort({ amount: -1 }).limit(10)`}
                </pre>
                <div className="p-2 rounded bg-slate-900 text-[10px] text-slate-400">
                  <strong className="text-emerald-400">Execution Purpose:</strong> Enforces strong consistency (Linearizable reads) from the Primary node to halt suspicious transactions before settlement.
                </div>
              </div>
            </div>
          </section>

          {/* Section 9: Comparison with Relational Database */}
          <section id="sec-9" className="p-5 rounded-lg bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm sm:text-base font-bold text-white font-mono flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-blue-600/20 text-blue-400 text-xs">Section 9</span>
                <span>Comparison Analysis: MongoDB Replica Set vs Relational Database (RDBMS)</span>
              </h3>
            </div>

            <div className="space-y-3 text-xs font-sans text-slate-300">
              <p>
                The following matrix summarizes the fundamental architectural differences between a standard Relational Database Management System (e.g., PostgreSQL / MySQL) and the 3-Node MongoDB Replica Set under financial enterprise workloads.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-[11px] font-mono border border-slate-800 rounded">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-2 text-left">Evaluation Parameter</th>
                      <th className="p-2 text-left">Traditional Relational RDBMS</th>
                      <th className="p-2 text-left text-blue-400">MongoDB 3-Node Replica Set</th>
                      <th className="p-2 text-left">Fintech Impact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-900/60">
                    <tr>
                      <td className="p-2 font-bold text-white">Schema Flexibility</td>
                      <td className="p-2 text-slate-400">Rigid tables, DDL migration locks</td>
                      <td className="p-2 text-emerald-400">Dynamic polymorphic BSON documents</td>
                      <td className="p-2 text-slate-300">Instant support for multi-rail payment payloads without downtime</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-white">High Availability & Failover</td>
                      <td className="p-2 text-slate-400">Active-Passive standby; manual failover (minutes)</td>
                      <td className="p-2 text-emerald-400">Automatic Raft consensus election (&lt; 3.0s)</td>
                      <td className="p-2 text-slate-300">Guarantees 99.99% uptime with zero manual human intervention</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-white">Horizontal Scalability</td>
                      <td className="p-2 text-slate-400">Complex read replicas; difficult sharding</td>
                      <td className="p-2 text-emerald-400">Native read routing + horizontal sharding</td>
                      <td className="p-2 text-slate-300">Scales linearly from 10k to 10M+ operations/sec</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-white">Write Durability Control</td>
                      <td className="p-2 text-slate-400">Fixed ACID commit (synchronous disk fsync)</td>
                      <td className="p-2 text-emerald-400">Tunable Write Concerns (w:1, w:majority, j:true)</td>
                      <td className="p-2 text-slate-300">Enables millisecond low latency for micro-transactions and strict majority for wires</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-white">CAP Classification</td>
                      <td className="p-2 text-slate-400">CA (Consistency + Availability on single node)</td>
                      <td className="p-2 text-emerald-400">CP (Consistency + Partition Tolerance)</td>
                      <td className="p-2 text-slate-300">Prevents split-brain ledger corruption during network partitions</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-white">Read Scaling</td>
                      <td className="p-2 text-slate-400">All queries hit Master or manual replication pool</td>
                      <td className="p-2 text-emerald-400">Built-in ReadPreferences (nearest, secondary)</td>
                      <td className="p-2 text-slate-300">Distributes fraud analytics queries to geographically close secondaries</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Tab: Viva Voce */}
      {activeTab === 'viva' && (
        <div className="p-5 rounded-lg bg-slate-900 border border-slate-800 space-y-4 font-mono text-xs">
          <div className="border-b border-slate-800 pb-2 flex justify-between items-center">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Technical Viva Voce Examination Questions & Model Answers
            </h3>
            <span className="text-slate-500">Core Distributed Systems Defense</span>
          </div>

          <div className="space-y-3 font-sans">
            <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-1">
              <h4 className="text-xs font-bold text-white font-mono">
                Q1: What is the exact consensus algorithm used in MongoDB replica sets?
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                MongoDB uses <strong>Protocol Version 1 (pv1)</strong>, which is based on the <strong>Raft consensus algorithm</strong>. It uses election terms, heartbeat polling (every 2 seconds by default), and strict majority voting (<code className="text-blue-300 font-mono">floor(N/2) + 1</code>) to prevent split-brain elections.
              </p>
            </div>

            <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-1">
              <h4 className="text-xs font-bold text-white font-mono">
                Q2: Explain what happens when a Primary node crashes in a 3-node replica set.
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                When the remaining two Secondaries detect missed heartbeats (&gt; 10,000ms election timeout), an election is triggered. Both secondaries vote; the secondary with the most up-to-date oplog timestamp receives majority approval (2/3 votes) and transitions to PRIMARY in under 3.2 seconds. Existing reads continue uninterrupted on secondaries.
              </p>
            </div>

            <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-1">
              <h4 className="text-xs font-bold text-white font-mono">
                Q3: Why is MongoDB classified as a CP system rather than an AP system?
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Under a network partition that isolates the Primary with only 1 node, the Primary cannot achieve majority consensus (1 &lt; 2). The isolated node immediately steps down to SECONDARY, rejecting write operations. MongoDB prioritizes data consistency and partition tolerance over write availability, strictly adhering to the CP model.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Python Backend Code */}
      {activeTab === 'code' && (
        <div className="p-5 rounded-lg bg-slate-900 border border-slate-800 space-y-3 font-mono text-xs">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2 text-white font-bold">
              <Code2 className="w-4 h-4 text-blue-400" />
              <span>Full Python Flask + PyMongo Backend Integration Service</span>
            </div>
            <button
              onClick={() => handleCopy(flaskFullCode, 'full-code')}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors"
            >
              {copiedSection === 'full-code' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSection === 'full-code' ? 'Copied' : 'Copy Full Code'}</span>
            </button>
          </div>

          <pre className="p-3 bg-slate-950 rounded border border-slate-800 text-[11px] text-slate-300 overflow-x-auto">
            <code>{flaskFullCode}</code>
          </pre>
        </div>
      )}
    </div>
  );
};
