import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  Users, Package, Store, ShoppingBag,
  Flag, UserCheck, TrendingUp, Shield,
  ChevronRight, AlertTriangle, Eye,
  DollarSign, Clock, Activity, ShieldCheck,
} from 'lucide-react';
import AdminService from '@api/services/admin.service';
import { queryKeys } from '@lib/queryClient';
import { Card } from '@components/ui/Card';
import Spinner from '@components/ui/Spinner';
import Avatar from '@components/ui/Avatar';
import { formatCompactNumber, formatDate, formatRelativeTime } from '@utils/formatters';
import { cn } from '@lib/utils';

const stagger = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  hidden:  { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function AdminDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.admin.dashboard(),
    queryFn:  () => AdminService.getDashboard(),
    refetchInterval: 30000,
  });

  const stats = data?.data;

  // Recent logs
  const { data: logsData } = useQuery({
    queryKey: queryKeys.admin.logs({ page: 1, limit: 8 }),
    queryFn:  () => AdminService.getLogs({ page: 1, limit: 8 }),
  });

  // Pending reports
  const { data: reportsData } = useQuery({
    queryKey: queryKeys.admin.reports({ status: 'pending', page: 1, limit: 5 }),
    queryFn:  () => AdminService.getReports({ status: 'pending', page: 1, limit: 5 }),
  });

  // Pending verifications
  const { data: verificationsData } = useQuery({
    queryKey: queryKeys.admin.verifications({ page: 1, limit: 1 }),
    queryFn:  () => AdminService.getVerifications({ page: 1, limit: 1 }),
  });

  // Recent users
  const { data: usersData } = useQuery({
    queryKey: queryKeys.admin.users({ page: 1, limit: 5 }),
    queryFn:  () => AdminService.getUsers({ page: 1, limit: 5 }),
  });

  const logs    = logsData?.data || [];
  const reports = reportsData?.data || [];
  const users   = usersData?.data || [];
  const pendingVerificationsCount = verificationsData?.pagination?.total || verificationsData?.data?.length || 0;

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  const mainStats = [
    {
      label: 'Total Users',
      value: stats?.total_users || 0,
      icon:  Users,
      color: '#3B82F6',
      bg:    'linear-gradient(135deg, #3B82F6, #1D4ED8)',
      to:    '/admin/users',
    },
    {
      label: 'Total Products',
      value: stats?.total_products || 0,
      icon:  Package,
      color: '#8B5CF6',
      bg:    'linear-gradient(135deg, #8B5CF6, #6D28D9)',
      to:    '/admin/products',
    },
    {
      label: 'Total Stores',
      value: stats?.total_stores || 0,
      icon:  Store,
      color: '#06B6D4',
      bg:    'linear-gradient(135deg, #06B6D4, #0891B2)',
      to:    '/admin/stores',
    },
    {
      label: 'Total Sales',
      value: stats?.total_sales || 0,
      icon:  ShoppingBag,
      color: '#10B981',
      bg:    'linear-gradient(135deg, #10B981, #059669)',
      to:    null,
    },
  ];

  const secondaryStats = [
    {
      label: 'Seller Verifications',
      value: pendingVerificationsCount,
      icon:  ShieldCheck,
      color: '#10B981',
      to:    '/admin/verifications',
      urgent: pendingVerificationsCount > 0,
    },
    {
      label: 'Pending Reports',
      value: stats?.pending_reports || 0,
      icon:  Flag,
      color: 'var(--color-error)',
      to:    '/admin/reports',
      urgent: (stats?.pending_reports || 0) > 0,
    },
    {
      label: 'New Today',
      value: stats?.new_users_today || 0,
      icon:  UserCheck,
      color: 'var(--color-warning)',
      to:    '/admin/users',
    },
  ];

  return (
    <>
      <Helmet>
        <title>Admin Dashboard — Aliwayz</title>
      </Helmet>

      <div className="space-y-6">
        {/* ── Welcome Header ──────────────────────────────── */}
        <div>
          <h1
            className="text-2xl sm:text-3xl font-bold"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Dashboard
          </h1>
          <p
            className="text-sm mt-1"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Welcome back, admin. Here's what's happening on your platform.
          </p>
        </div>

        {/* ── Main Stats ──────────────────────────────────── */}
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          {mainStats.map((stat) => {
            const Icon = stat.icon;
            const content = (
              <motion.div key={stat.label} variants={fadeUp}>
                <div
                  className="relative overflow-hidden rounded-2xl p-4 sm:p-5 text-white h-full"
                  style={{
                    background: stat.bg,
                    boxShadow: `0 8px 25px ${stat.color}30`,
                  }}
                >
                  {/* Background decoration */}
                  <div
                    className="absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-20"
                    style={{ backgroundColor: 'white' }}
                  />

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                      >
                        <Icon size={20} />
                      </div>
                      <TrendingUp size={14} style={{ opacity: 0.7 }} />
                    </div>

                    <p className="text-2xl sm:text-3xl font-bold">
                      {formatCompactNumber(stat.value)}
                    </p>
                    <p className="text-xs mt-0.5 text-white/70">
                      {stat.label}
                    </p>
                  </div>
                </div>
              </motion.div>
            );

            return stat.to ? (
              <Link key={stat.label} to={stat.to}>
                {content}
              </Link>
            ) : (
              <div key={stat.label}>{content}</div>
            );
          })}
        </motion.div>

        {/* ── Secondary Stats + Urgent ─────────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          {secondaryStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link key={stat.label} to={stat.to}>
                <Card
                  className={cn(
                    'p-4 flex items-center gap-3 hover-lift',
                    stat.urgent && 'ring-2'
                  )}
                  style={{
                    ringColor: stat.urgent
                      ? 'var(--color-error)'
                      : undefined,
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center relative flex-shrink-0"
                    style={{
                      backgroundColor: `${stat.color}15`,
                      color: stat.color,
                    }}
                  >
                    <Icon size={18} />
                    {stat.urgent && (
                      <motion.div
                        className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
                        style={{ backgroundColor: 'var(--color-error)' }}
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    )}
                  </div>
                  <div>
                    <p
                      className="text-xl font-bold"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {stat.value}
                    </p>
                    <p
                      className="text-xs"
                      style={{
                        color: stat.urgent
                          ? 'var(--color-error)'
                          : 'var(--color-text-muted)',
                      }}
                    >
                      {stat.label}
                    </p>
                  </div>
                  <ChevronRight
                    size={16}
                    className="ml-auto"
                    style={{ color: 'var(--color-text-muted)' }}
                  />
                </Card>
              </Link>
            );
          })}
        </div>

        {/* ── Two Column Layout ────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* ── Pending Reports ─────────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3
                className="font-semibold text-sm flex items-center gap-2"
                style={{ color: 'var(--color-text-primary)' }}
              >
                <Flag size={16} style={{ color: 'var(--color-error)' }} />
                Pending Reports
                {reports.length > 0 && (
                  <span
                    className="px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                    style={{
                      backgroundColor: 'rgba(239,68,68,0.1)',
                      color: 'var(--color-error)',
                    }}
                  >
                    {reports.length}
                  </span>
                )}
              </h3>
              <Link
                to="/admin/reports"
                className="text-xs font-medium hover:underline"
                style={{ color: 'var(--color-brand)' }}
              >
                View all →
              </Link>
            </div>

            <Card className="divide-y divide-[var(--color-border)]">
              {reports.length === 0 ? (
                <div className="py-8 text-center">
                  <span className="text-3xl">🎉</span>
                  <p
                    className="text-sm mt-2"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    No pending reports
                  </p>
                </div>
              ) : (
                reports.map((report) => (
                  <Link
                    key={report.id}
                    to="/admin/reports"
                    className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-[var(--glass-bg-strong)]"
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: 'rgba(239,68,68,0.1)' }}
                    >
                      <AlertTriangle
                        size={14}
                        style={{ color: 'var(--color-error)' }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-xs font-semibold capitalize truncate"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        {report.reason} — {report.target_type}
                      </p>
                      <p
                        className="text-[11px]"
                        style={{ color: 'var(--color-text-muted)' }}
                      >
                        by @{report.reporter?.username} ·{' '}
                        {formatRelativeTime(report.created_at)}
                      </p>
                    </div>
                    <ChevronRight
                      size={14}
                      style={{ color: 'var(--color-text-muted)' }}
                    />
                  </Link>
                ))
              )}
            </Card>
          </div>

          {/* ── Recent Users ────────────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3
                className="font-semibold text-sm flex items-center gap-2"
                style={{ color: 'var(--color-text-primary)' }}
              >
                <Users size={16} style={{ color: 'var(--color-brand)' }} />
                Recent Users
              </h3>
              <Link
                to="/admin/users"
                className="text-xs font-medium hover:underline"
                style={{ color: 'var(--color-brand)' }}
              >
                View all →
              </Link>
            </div>

            <Card className="divide-y divide-[var(--color-border)]">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center gap-3 px-4 py-3"
                >
                  <Avatar
                    src={u.avatar_url}
                    name={u.username}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-xs font-semibold truncate"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {u.full_name || u.username}
                    </p>
                    <p
                      className="text-[11px]"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      @{u.username} · {u.role}
                    </p>
                  </div>
                  <span
                    className="px-2 py-0.5 rounded-full text-[9px] font-bold capitalize"
                    style={{
                      backgroundColor:
                        u.account_status === 'active'
                          ? 'rgba(16,185,129,0.1)'
                          : 'rgba(239,68,68,0.1)',
                      color:
                        u.account_status === 'active'
                          ? 'var(--color-success)'
                          : 'var(--color-error)',
                    }}
                  >
                    {u.account_status}
                  </span>
                </div>
              ))}
            </Card>
          </div>
        </div>

        {/* ── Activity Log ─────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3
              className="font-semibold text-sm flex items-center gap-2"
              style={{ color: 'var(--color-text-primary)' }}
            >
              <Activity size={16} style={{ color: '#8B5CF6' }} />
              Admin Activity
            </h3>
            <Link
              to="/admin/logs"
              className="text-xs font-medium hover:underline"
              style={{ color: 'var(--color-brand)' }}
            >
              View all →
            </Link>
          </div>

          <Card className="overflow-hidden">
            <div className="divide-y divide-[var(--color-border)]">
              {logs.length === 0 ? (
                <div className="py-8 text-center">
                  <p
                    className="text-sm"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    No activity yet
                  </p>
                </div>
              ) : (
                logs.map((log, i) => (
                  <motion.div
                    key={log.id}
                    className="flex items-center gap-3 px-4 py-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    {/* Timeline dot */}
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: '#8B5CF6' }}
                      />
                      {i < logs.length - 1 && (
                        <div
                          className="w-px h-8 mt-1"
                          style={{ backgroundColor: 'var(--color-border)' }}
                        />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p
                          className="text-xs font-semibold"
                          style={{ color: 'var(--color-text-primary)' }}
                        >
                          {log.action?.replace(/_/g, ' ')}
                        </p>
                        {log.target_type && (
                          <span
                            className="px-1.5 py-0.5 rounded text-[9px] font-medium"
                            style={{
                              backgroundColor: 'var(--color-surface-elevated)',
                              color: 'var(--color-text-muted)',
                            }}
                          >
                            {log.target_type}
                          </span>
                        )}
                      </div>
                      <p
                        className="text-[11px]"
                        style={{ color: 'var(--color-text-muted)' }}
                      >
                        by @{log.admin?.username} ·{' '}
                        {formatRelativeTime(log.created_at)}
                      </p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}