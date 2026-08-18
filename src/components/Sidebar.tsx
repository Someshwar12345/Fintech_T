import React from 'react';
import {
  LayoutDashboard,
  ReceiptText,
  Network,
  ZapOff,
  Gauge,
  CheckCircle2,
  ShieldAlert,
  Boxes,
  BarChart3,
  TerminalSquare,
  GraduationCap,
  X,
} from 'lucide-react';
import { ReplicaSetState, TabId } from '../types';

interface SidebarProps {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
  replicaState: ReplicaSetState | null;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  replicaState,
  isOpen,
  onClose,
}) => {
  const primaryNode = replicaState?.nodes.find((n) => n.role === 'PRIMARY');

  const navItems: { id: TabId; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'transactions',
      label: 'Transactions',
      icon: <ReceiptText className="w-4 h-4" />,
      badge: '15k',
    },
    {
      id: 'replica-set',
      label: 'Replica Set Monitor',
      icon: <Network className="w-4 h-4" />,
      badge: '3 Nodes',
    },
    {
      id: 'failover',
      label: 'Failover Simulation',
      icon: <ZapOff className="w-4 h-4" />,
    },
    {
      id: 'read-write',
      label: 'Read/Write Performance',
      icon: <Gauge className="w-4 h-4" />,
    },
    {
      id: 'consistency',
      label: 'Consistency Analysis',
      icon: <CheckCircle2 className="w-4 h-4" />,
    },
    {
      id: 'availability',
      label: 'Availability & SLA',
      icon: <ShieldAlert className="w-4 h-4" />,
    },
    {
      id: 'cap-theorem',
      label: 'CAP Theorem Analysis',
      icon: <Boxes className="w-4 h-4" />,
    },
    {
      id: 'charts',
      label: 'Comparison Charts',
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      id: 'logs',
      label: 'System Logs',
      icon: <TerminalSquare className="w-4 h-4" />,
    },
    {
      id: 'project-info',
      label: 'Project Info & Viva',
      icon: <GraduationCap className="w-4 h-4" />,
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        id="high-density-sidebar"
        className={`fixed lg:sticky top-0 left-0 z-50 lg:z-20 w-64 h-full lg:h-[calc(100vh-3.5rem-2rem)] bg-slate-900 border-r border-slate-800 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div className="text-blue-400 font-bold text-xs uppercase tracking-widest font-mono">
              Fintech Cluster
            </div>
            <button onClick={onClose} className="lg:hidden text-slate-500 hover:text-white p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
          <h1 className="text-base font-bold text-white leading-tight mt-1">
            NoSQL Replication Analysis
          </h1>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
            High-Availability & Fault-Tolerance Suite
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 p-3 space-y-1 text-xs overflow-y-auto">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => {
                  onSelectTab(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors cursor-pointer text-left ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {isActive ? (
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-transparent shrink-0" />
                  )}
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="bg-slate-800 px-1.5 py-0.5 rounded text-[10px] text-slate-500 font-mono">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer: Current Primary Node Indicator */}
        <div className="p-4 bg-slate-900/90 border-t border-slate-800">
          <div className="text-[10px] uppercase text-slate-500 mb-1.5 tracking-widest font-mono">
            Current Primary
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                primaryNode ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
              }`}
            />
            <span className="text-xs font-mono text-emerald-400 font-bold truncate">
              {primaryNode ? primaryNode.name.split(' ')[0] : 'NONE (Election Required)'}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
