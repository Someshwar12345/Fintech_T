import { Transaction, TransactionType, TransactionStatus, PaymentMethod, Currency } from '../src/types';

const TRANSACTION_TYPES: TransactionType[] = [
  'Wire Transfer',
  'Card Payment',
  'Instant P2P',
  'Merchant POS',
  'Loan Repayment',
  'FX Exchange',
  'ATM Withdrawal',
  'Crypto Swap',
];

const TRANSACTION_STATUSES: TransactionStatus[] = [
  'SETTLED',
  'SETTLED',
  'SETTLED',
  'CLEARED',
  'CLEARED',
  'PENDING',
  'FLAGGED_REVIEW',
  'FAILED',
];

const CURRENCIES: Currency[] = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD'];

const PAYMENT_METHODS: PaymentMethod[] = [
  'ACH',
  'SEPA',
  'SWIFT',
  'FedNow',
  'UPI',
  'VisaNet',
  'Internal Ledger',
];

const LOCATIONS = [
  'New York, USA',
  'London, UK',
  'Singapore, SG',
  'Mumbai, IN',
  'Tokyo, JP',
  'Frankfurt, DE',
  'Zurich, CH',
  'Dubai, UAE',
  'Toronto, CA',
  'Sydney, AU',
  'Hong Kong, HK',
  'Bangalore, IN',
];

// Pseudo-random deterministic generator using LCG for consistent repeatable dataset
class SeededRandom {
  private state: number;
  constructor(seed = 123456789) {
    this.state = seed;
  }
  next(): number {
    this.state = (this.state * 1664525 + 1013904223) % 4294967296;
    return this.state / 4294967296;
  }
  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }
  intRange(min: number, max: number): number {
    return Math.floor(this.range(min, max + 1));
  }
  pick<T>(array: T[]): T {
    return array[Math.floor(this.next() * array.length)];
  }
}

export class FintechDatasetManager {
  private transactions: Transaction[] = [];
  public readonly TOTAL_RECORDS = 15000;
  private isInitialized = false;

  constructor() {
    this.initializeDataset();
  }

  public initializeDataset(forceRecreate = false): Transaction[] {
    if (this.isInitialized && !forceRecreate && this.transactions.length === this.TOTAL_RECORDS) {
      return this.transactions;
    }

    const rng = new SeededRandom(987654321);
    const generated: Transaction[] = new Array(this.TOTAL_RECORDS);
    const now = Date.now();
    const ninetyDaysAgo = now - 90 * 24 * 60 * 60 * 1000;

    for (let i = 0; i < this.TOTAL_RECORDS; i++) {
      const idNum = (i + 1).toString().padStart(6, '0');
      const txnType = rng.pick(TRANSACTION_TYPES);
      const currency = rng.pick(CURRENCIES);
      const status = rng.pick(TRANSACTION_STATUSES);
      const paymentMethod = rng.pick(PAYMENT_METHODS);
      const location = rng.pick(LOCATIONS);

      // Realistic amounts tailored to transaction type
      let amount = 0;
      if (txnType === 'Wire Transfer') {
        amount = parseFloat(rng.range(5000, 450000).toFixed(2));
      } else if (txnType === 'Crypto Swap') {
        amount = parseFloat(rng.range(250, 85000).toFixed(2));
      } else if (txnType === 'Card Payment' || txnType === 'Merchant POS') {
        amount = parseFloat(rng.range(12, 1850).toFixed(2));
      } else if (txnType === 'Instant P2P') {
        amount = parseFloat(rng.range(5, 3500).toFixed(2));
      } else if (txnType === 'Loan Repayment') {
        amount = parseFloat(rng.range(300, 24000).toFixed(2));
      } else if (txnType === 'FX Exchange') {
        amount = parseFloat(rng.range(1000, 120000).toFixed(2));
      } else {
        amount = parseFloat(rng.range(20, 1200).toFixed(2));
      }

      // Customer and account IDs
      const custIdNum = rng.intRange(1000, 4500);
      const customerId = `CUST-${custIdNum}`;
      const srcAccNum = rng.intRange(100000, 999999);
      const destAccNum = rng.intRange(100000, 999999);
      const currPrefix = currency.slice(0, 2);

      const sourceAccount = `ACC-${currPrefix}-${srcAccNum}`;
      const destAccount = `ACC-${rng.pick(['US', 'GB', 'IN', 'EU', 'JP'])}-${destAccNum}`;

      // Risk score: Higher if flagged or high-value crypto / wire
      let baseRisk = rng.intRange(5, 45);
      if (status === 'FLAGGED_REVIEW') {
        baseRisk = rng.intRange(75, 99);
      } else if (status === 'FAILED') {
        baseRisk = rng.intRange(60, 92);
      } else if (amount > 100000) {
        baseRisk = Math.min(95, baseRisk + rng.intRange(20, 40));
      }

      // Timestamp spread across the last 90 days
      const txTime = new Date(rng.range(ninetyDaysAgo, now)).toISOString();

      generated[i] = {
        transaction_id: `TXN-${idNum}`,
        customer_id: customerId,
        account_id: sourceAccount,
        transaction_type: txnType,
        amount,
        currency,
        transaction_date: txTime,
        status,
        source_account: sourceAccount,
        destination_account: destAccount,
        location,
        payment_method: paymentMethod,
        risk_score: baseRisk,
        replication_meta: {
          oplog_ts: Math.floor(new Date(txTime).getTime() / 1000),
          synced_nodes: ['mongo-node-1:27017', 'mongo-node-2:27018', 'mongo-node-3:27019'],
          write_concern: 'majority',
          committed_to_majority: true,
        },
      };
    }

    this.transactions = generated;
    this.isInitialized = true;
    return this.transactions;
  }

  public getTransactions(options: {
    page?: number;
    pageSize?: number;
    search?: string;
    type?: string;
    status?: string;
    currency?: string;
    paymentMethod?: string;
    riskCategory?: 'all' | 'low' | 'medium' | 'high';
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): {
    data: Transaction[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    stats: {
      totalAmountUSD: number;
      totalSettled: number;
      totalPending: number;
      totalFlagged: number;
      totalFailed: number;
      avgRiskScore: number;
    };
  } {
    const {
      page = 1,
      pageSize = 25,
      search = '',
      type = 'all',
      status = 'all',
      currency = 'all',
      paymentMethod = 'all',
      riskCategory = 'all',
      sortBy = 'transaction_date',
      sortOrder = 'desc',
    } = options;

    let filtered = this.transactions;

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(
        (t) =>
          t.transaction_id.toLowerCase().includes(q) ||
          t.customer_id.toLowerCase().includes(q) ||
          t.account_id.toLowerCase().includes(q) ||
          t.source_account.toLowerCase().includes(q) ||
          t.destination_account.toLowerCase().includes(q) ||
          t.location.toLowerCase().includes(q)
      );
    }

    if (type && type !== 'all') {
      filtered = filtered.filter((t) => t.transaction_type === type);
    }

    if (status && status !== 'all') {
      filtered = filtered.filter((t) => t.status === status);
    }

    if (currency && currency !== 'all') {
      filtered = filtered.filter((t) => t.currency === currency);
    }

    if (paymentMethod && paymentMethod !== 'all') {
      filtered = filtered.filter((t) => t.payment_method === paymentMethod);
    }

    if (riskCategory && riskCategory !== 'all') {
      if (riskCategory === 'low') filtered = filtered.filter((t) => t.risk_score < 30);
      else if (riskCategory === 'medium') filtered = filtered.filter((t) => t.risk_score >= 30 && t.risk_score < 70);
      else if (riskCategory === 'high') filtered = filtered.filter((t) => t.risk_score >= 70);
    }

    // Sorting
    filtered.sort((a: any, b: any) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (sortBy === 'transaction_date') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    const total = filtered.length;
    const totalPages = Math.ceil(total / pageSize);
    const startIdx = (page - 1) * pageSize;
    const paginated = filtered.slice(startIdx, startIdx + pageSize);

    // Compute overview stats from the full dataset for quick cards
    const totalSettled = this.transactions.filter((t) => t.status === 'SETTLED' || t.status === 'CLEARED').length;
    const totalPending = this.transactions.filter((t) => t.status === 'PENDING').length;
    const totalFlagged = this.transactions.filter((t) => t.status === 'FLAGGED_REVIEW').length;
    const totalFailed = this.transactions.filter((t) => t.status === 'FAILED').length;
    const totalAmount = this.transactions.reduce((acc, t) => acc + t.amount, 0);
    const avgRisk = parseFloat((this.transactions.reduce((acc, t) => acc + t.risk_score, 0) / this.transactions.length).toFixed(1));

    return {
      data: paginated,
      total,
      page,
      pageSize,
      totalPages,
      stats: {
        totalAmountUSD: totalAmount,
        totalSettled,
        totalPending,
        totalFlagged,
        totalFailed,
        avgRiskScore: avgRisk,
      },
    };
  }

  public getTransactionById(id: string): Transaction | undefined {
    return this.transactions.find((t) => t.transaction_id === id);
  }

  public appendTransaction(tx: Transaction): Transaction {
    this.transactions.unshift(tx);
    return tx;
  }

  public getDatasetSummary() {
    const typeDistribution: Record<string, number> = {};
    const statusDistribution: Record<string, number> = {};
    const currencyDistribution: Record<string, number> = {};
    const paymentMethodDistribution: Record<string, number> = {};
    const riskBuckets = { low: 0, medium: 0, high: 0 };

    for (const t of this.transactions) {
      typeDistribution[t.transaction_type] = (typeDistribution[t.transaction_type] || 0) + 1;
      statusDistribution[t.status] = (statusDistribution[t.status] || 0) + 1;
      currencyDistribution[t.currency] = (currencyDistribution[t.currency] || 0) + 1;
      paymentMethodDistribution[t.payment_method] = (paymentMethodDistribution[t.payment_method] || 0) + 1;

      if (t.risk_score < 30) riskBuckets.low++;
      else if (t.risk_score < 70) riskBuckets.medium++;
      else riskBuckets.high++;
    }

    return {
      totalCount: this.transactions.length,
      typeDistribution,
      statusDistribution,
      currencyDistribution,
      paymentMethodDistribution,
      riskBuckets,
      lastUpdated: new Date().toISOString(),
    };
  }
}

export const datasetManager = new FintechDatasetManager();
