import React, { useState, useEffect } from 'react';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw,
  RotateCcw,
} from 'lucide-react';
import { API } from '../../lib/api';
import { Transaction } from '../../types';

interface TransactionsViewProps {
  onSelectTransaction: (tx: Transaction) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({ onSelectTransaction }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(15000);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [totalPages, setTotalPages] = useState(600);

  // Filters
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [status, setStatus] = useState('all');
  const [currency, setCurrency] = useState('all');
  const [paymentMethod, setPaymentMethod] = useState('all');
  const [riskCategory, setRiskCategory] = useState('all');
  const [sortBy, setSortBy] = useState('transaction_date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Stats
  const [stats, setStats] = useState({
    totalAmountUSD: 0,
    totalSettled: 0,
    totalPending: 0,
    totalFlagged: 0,
    totalFailed: 0,
    avgRiskScore: 0,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await API.getTransactions({
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
      setTransactions(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages);
      if (res.stats) setStats(res.stats);
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, pageSize, type, status, currency, paymentMethod, riskCategory, sortBy, sortOrder]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadData();
  };

  const handleResetFilters = () => {
    setSearch('');
    setType('all');
    setStatus('all');
    setCurrency('all');
    setPaymentMethod('all');
    setRiskCategory('all');
    setSortBy('transaction_date');
    setSortOrder('desc');
    setPage(1);
  };

  const getStatusBadge = (txStatus: string) => {
    switch (txStatus) {
      case 'SETTLED':
      case 'CLEARED':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'PENDING':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'FLAGGED_REVIEW':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'FAILED':
        return 'bg-slate-800 text-slate-400 border-slate-700';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div id="high-density-transactions" className="space-y-4 animate-fade-in pb-10">
      {/* Header & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white">
              15,000 Financial Transactions Ledger
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600/20 text-blue-400 border border-blue-500/30 font-mono">
              rs0 Replicated
            </span>
          </div>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            Indexed collection: <code className="text-emerald-400">fintech_replication.transactions</code> (15k docs)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetFilters}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 4 Mini Stat Summary Boxes */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
          <span className="text-slate-500 uppercase text-[10px] tracking-wider block">Filtered / Total</span>
          <p className="text-lg font-bold text-white mt-0.5">
            {total.toLocaleString()} <span className="text-xs font-normal text-slate-500">/ 15,000</span>
          </p>
        </div>
        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
          <span className="text-slate-500 uppercase text-[10px] tracking-wider block">Settled / Cleared</span>
          <p className="text-lg font-bold text-emerald-400 mt-0.5">
            {stats.totalSettled.toLocaleString()}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
          <span className="text-slate-500 uppercase text-[10px] tracking-wider block">Flagged Review</span>
          <p className="text-lg font-bold text-rose-400 mt-0.5">
            {stats.totalFlagged.toLocaleString()}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
          <span className="text-slate-500 uppercase text-[10px] tracking-wider block">Avg Risk Score</span>
          <p className="text-lg font-bold text-indigo-400 mt-0.5">
            {stats.avgRiskScore} / 100
          </p>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Tx ID, Customer ID, Account ID, Location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded bg-slate-950 border border-slate-800 text-white font-mono placeholder:text-slate-600 focus:outline-hidden focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors"
          >
            Search
          </button>
        </form>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs font-mono">
          <div>
            <label className="text-[10px] uppercase text-slate-500 block mb-1">Type</label>
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setPage(1);
              }}
              className="w-full p-1.5 rounded bg-slate-950 border border-slate-800 text-xs text-slate-200"
            >
              <option value="all">All Types</option>
              <option value="Wire Transfer">Wire Transfer</option>
              <option value="Card Payment">Card Payment</option>
              <option value="Instant P2P">Instant P2P</option>
              <option value="Merchant POS">Merchant POS</option>
              <option value="Loan Repayment">Loan Repayment</option>
              <option value="FX Exchange">FX Exchange</option>
              <option value="ATM Withdrawal">ATM Withdrawal</option>
              <option value="Crypto Swap">Crypto Swap</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase text-slate-500 block mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full p-1.5 rounded bg-slate-950 border border-slate-800 text-xs text-slate-200"
            >
              <option value="all">All Statuses</option>
              <option value="SETTLED">SETTLED</option>
              <option value="CLEARED">CLEARED</option>
              <option value="PENDING">PENDING</option>
              <option value="FLAGGED_REVIEW">FLAGGED_REVIEW</option>
              <option value="FAILED">FAILED</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase text-slate-500 block mb-1">Currency</label>
            <select
              value={currency}
              onChange={(e) => {
                setCurrency(e.target.value);
                setPage(1);
              }}
              className="w-full p-1.5 rounded bg-slate-950 border border-slate-800 text-xs text-slate-200"
            >
              <option value="all">All Currencies</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="INR">INR (₹)</option>
              <option value="JPY">JPY (¥)</option>
              <option value="CAD">CAD (C$)</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase text-slate-500 block mb-1">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => {
                setPaymentMethod(e.target.value);
                setPage(1);
              }}
              className="w-full p-1.5 rounded bg-slate-950 border border-slate-800 text-xs text-slate-200"
            >
              <option value="all">All Methods</option>
              <option value="ACH">ACH</option>
              <option value="SEPA">SEPA</option>
              <option value="SWIFT">SWIFT</option>
              <option value="FedNow">FedNow</option>
              <option value="UPI">UPI</option>
              <option value="VisaNet">VisaNet</option>
              <option value="Internal Ledger">Internal Ledger</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase text-slate-500 block mb-1">Risk Band</label>
            <select
              value={riskCategory}
              onChange={(e) => {
                setRiskCategory(e.target.value);
                setPage(1);
              }}
              className="w-full p-1.5 rounded bg-slate-950 border border-slate-800 text-xs text-slate-200"
            >
              <option value="all">All Risk</option>
              <option value="low">Low (&lt; 30)</option>
              <option value="medium">Med (30-69)</option>
              <option value="high">High (≥ 70)</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase text-slate-500 block mb-1">Sort Order</label>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split('-');
                setSortBy(sb);
                setSortOrder(so as 'asc' | 'desc');
              }}
              className="w-full p-1.5 rounded bg-slate-950 border border-slate-800 text-xs text-slate-200"
            >
              <option value="transaction_date-desc">Newest First</option>
              <option value="transaction_date-asc">Oldest First</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="amount-asc">Lowest Amount</option>
              <option value="risk_score-desc">Highest Risk</option>
            </select>
          </div>
        </div>
      </div>

      {/* High Density Transactions Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden font-mono text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-500 uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Transaction ID</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Account & Customer</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Method / Route</th>
                <th className="py-2.5 px-3">Risk</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3 text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500 font-sans">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-blue-500 mb-2" />
                    <span>Loading documents from MongoDB...</span>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500 font-sans">
                    No transactions match your search filter.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr
                    key={tx.transaction_id}
                    onClick={() => onSelectTransaction(tx)}
                    className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 px-3 font-bold text-white">
                      {tx.transaction_id}
                    </td>
                    <td className="py-2.5 px-3 font-sans text-slate-300">
                      {tx.transaction_type}
                    </td>
                    <td className="py-2.5 px-3 text-[11px]">
                      <div className="text-slate-300">{tx.account_id}</div>
                      <div className="text-[9px] text-slate-500">{tx.customer_id}</div>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-emerald-400">
                      {tx.currency} {tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3 text-[11px] font-sans">
                      <div>{tx.payment_method}</div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[110px]">{tx.location}</div>
                    </td>
                    <td className="py-2.5 px-3 font-bold">
                      <span
                        className={
                          tx.risk_score >= 70
                            ? 'text-rose-400'
                            : tx.risk_score >= 30
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }
                      >
                        {tx.risk_score}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase border ${getStatusBadge(
                          tx.status
                        )}`}
                      >
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[10px] text-slate-400">
                      {new Date(tx.transaction_date).toLocaleDateString()}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTransaction(tx);
                        }}
                        className="p-1 rounded text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <span>
              Rows {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, total)} of{' '}
              <strong className="text-white">{total.toLocaleString()}</strong>
            </span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(parseInt(e.target.value, 10));
                setPage(1);
              }}
              className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-300 text-xs"
            >
              <option value="25">25 / page</option>
              <option value="50">50 / page</option>
              <option value="100">100 / page</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>
              {page} / {totalPages || 1}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
