import React from 'react';
import { X, Shield, Globe, CreditCard, Clock, CheckCircle, Database, Copy, Check } from 'lucide-react';
import { Transaction } from '../types';

interface TransactionModalProps {
  transaction: Transaction | null;
  onClose: () => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({ transaction, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  if (!transaction) return null;

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(transaction, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SETTLED':
      case 'CLEARED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800';
      case 'PENDING':
        return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800';
      case 'FLAGGED_REVIEW':
        return 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-800';
      case 'FAILED':
        return 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div
      id="transaction-detail-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        id="transaction-detail-modal"
        className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-mono text-sm font-bold">
              TX
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {transaction.transaction_id}
                </h3>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${getStatusBadge(
                    transaction.status
                  )}`}
                >
                  {transaction.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Fintech Ledger BSON Document Record
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Main Financial Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
            <div>
              <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase">
                Amount
              </span>
              <p className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                {transaction.currency} {transaction.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase">
                Type
              </span>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                {transaction.transaction_type}
              </p>
            </div>
            <div>
              <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase">
                Risk Score
              </span>
              <div className="flex items-center space-x-1.5 mt-0.5">
                <span
                  className={`text-sm font-bold ${
                    transaction.risk_score >= 70
                      ? 'text-rose-500'
                      : transaction.risk_score >= 30
                      ? 'text-amber-500'
                      : 'text-emerald-500'
                  }`}
                >
                  {transaction.risk_score}/100
                </span>
              </div>
            </div>
            <div>
              <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 uppercase">
                Payment Channel
              </span>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                {transaction.payment_method}
              </p>
            </div>
          </div>

          {/* Account & Location Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
                <CreditCard className="w-3.5 h-3.5" />
                <span>Account Identifiers</span>
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Customer ID:</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                    {transaction.customer_id}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Source Account:</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                    {transaction.source_account}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Destination Account:</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                    {transaction.destination_account}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
                <Globe className="w-3.5 h-3.5" />
                <span>Timestamp & Origin</span>
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Origin Location:</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {transaction.location}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Transaction Date:</span>
                  <span className="font-mono text-slate-900 dark:text-slate-100">
                    {new Date(transaction.transaction_date).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Oplog Timestamp:</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400">
                    ts: {transaction.replication_meta?.oplog_ts || 1729384920}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* MongoDB Replication Distribution Metadata */}
          <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center space-x-1.5">
              <Database className="w-3.5 h-3.5" />
              <span>MongoDB Replica Set Oplog Distribution</span>
            </h4>
            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
              <p>
                <span className="font-semibold">Write Concern:</span>{' '}
                <code className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 font-mono text-[11px]">
                  {transaction.replication_meta?.write_concern || 'majority'}
                </code>{' '}
                • Committed to Majority Quorum
              </p>
              <p>
                <span className="font-semibold">Replicated Nodes:</span>{' '}
                <span className="font-mono text-[11px] text-emerald-700 dark:text-emerald-300">
                  {transaction.replication_meta?.synced_nodes?.join(', ') ||
                    'mongo-node-1:27017, mongo-node-2:27018, mongo-node-3:27019'}
                </span>
              </p>
            </div>
          </div>

          {/* JSON Document Inspector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                MongoDB Document (JSON / BSON)
              </span>
              <button
                onClick={handleCopyJson}
                className="flex items-center space-x-1 text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
              </button>
            </div>
            <pre className="p-3.5 rounded-xl bg-slate-900 text-slate-200 text-xs font-mono overflow-x-auto max-h-48 border border-slate-800">
              {JSON.stringify(transaction, null, 2)}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
