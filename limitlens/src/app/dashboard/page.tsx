"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  RefreshCw,
  Clock,
  Cpu,
  Database,
  Globe,
  Zap,
  HardDrive,
  GitBranch,
  BookOpen,
  PenTool,
} from "lucide-react";
import { Sidebar } from "@/components/Sidebar";

const STATUS_META = {
  safe:     { label: "Safe",     color: "var(--status-safe)",     bg: "var(--status-safe-bg)" },
  watch:    { label: "Watch",    color: "var(--status-watch)",    bg: "var(--status-watch-bg)" },
  warning:  { label: "Warning",  color: "var(--status-warning)",  bg: "var(--status-warning-bg)" },
  danger:   { label: "Danger",   color: "var(--status-danger)",   bg: "var(--status-danger-bg)" },
  critical: { label: "Critical", color: "var(--status-critical)", bg: "var(--status-critical-bg)" },
} as const;

type Status = keyof typeof STATUS_META;

function getStatus(pct: number): Status {
  if (pct >= 95) return "critical";
  if (pct >= 85) return "danger";
  if (pct >= 75) return "warning";
  if (pct >= 50) return "watch";
  return "safe";
}

interface UsageMetric {
  id: string;
  metricKey: string;
  usedValue: number;
  limitValue: number;
  percentageUsed: number;
  remainingValue: number;
  unit: string;
  checkedAt: string;
}

const METRIC_ICONS: Record<string, React.ElementType> = {
  active_cpu_hours: Cpu,
  provisioned_memory: Database,
  edge_requests: Globe,
  function_invocations: Zap,
  fast_data_transfer: HardDrive,
  build_execution_minutes: GitBranch,
  isr_reads: BookOpen,
  isr_writes: PenTool,
  project_count: BookOpen,
};

const METRIC_DESCRIPTIONS: Record<string, string> = {
  active_cpu_hours: "Serverless function compute time",
  provisioned_memory: "Memory allocated to functions",
  edge_requests: "Total edge network requests",
  function_invocations: "Serverless function calls",
  fast_data_transfer: "Outbound bandwidth usage",
  build_execution_minutes: "Total build minutes consumed",
  isr_reads: "Incremental static regen cache reads",
  isr_writes: "Incremental static regen cache writes",
  project_count: "Total Vercel projects",
};

function StatusBadge({ status }: { status: Status }) {
  const meta = STATUS_META[status];
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
      style={{ background: meta.bg, color: meta.color }}
    >
      {meta.label}
    </span>
  );
}

function ProgressBar({ pct, status }: { pct: number; status: Status }) {
  const color = STATUS_META[status].color;
  return (
    <div
      className="h-1.5 rounded-full overflow-hidden"
      style={{ background: "var(--muted)" }}
    >
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${Math.min(pct, 100)}%`, background: color }}
      />
    </div>
  );
}

function UsageCard({ metric }: { metric: UsageMetric }) {
  const status = getStatus(metric.percentageUsed);
  const meta = STATUS_META[status];
  const Icon = METRIC_ICONS[metric.metricKey] || Cpu;
  const description =
    METRIC_DESCRIPTIONS[metric.metricKey] ||
    metric.metricKey.replace(/_/g, " ");
  const displayName =
    metric.metricKey.replace(/_/g, " ").replace(/\b\w/g, (l) =>
      l.toUpperCase()
    );

  const formatValue = (v: number, unit: string) => {
    if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
    if (v >= 1000) return `${(v / 1000).toFixed(1)}k`;
    return `${v}`;
  };

  return (
    <div
      className="p-5 rounded-xl border transition-all hover:border-opacity-60 group"
      style={{ background: "var(--card)", border: "1px solid var(--border)" }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: meta.bg }}
          >
            <Icon className="w-4 h-4" style={{ color: meta.color }} />
          </div>
          <div>
            <div className="text-sm font-medium leading-tight">
              {displayName}
            </div>
            <div
              className="text-xs mt-0.5"
              style={{ color: "var(--muted-foreground)" }}
            >
              {description}
            </div>
          </div>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="flex items-end justify-between mb-2">
        <div>
          <span
            className="text-xl font-semibold"
            style={{
              fontFamily: "var(--font-family-mono)",
              color: meta.color,
            }}
          >
            {formatValue(metric.usedValue, metric.unit)}
          </span>
          <span
            className="text-sm ml-1"
            style={{
              color: "var(--muted-foreground)",
              fontFamily: "var(--font-family-mono)",
            }}
          >
            / {formatValue(metric.limitValue, metric.unit)} {metric.unit}
          </span>
        </div>
        <span
          className="text-sm font-semibold"
          style={{ color: meta.color, fontFamily: "var(--font-family-mono)" }}
        >
          {metric.percentageUsed.toFixed(0)}%
        </span>
      </div>

      <ProgressBar pct={metric.percentageUsed} status={status} />

      <div className="flex items-center justify-between mt-2">
        <span
          className="text-xs"
          style={{ color: "var(--muted-foreground)" }}
        >
          {formatValue(metric.remainingValue, metric.unit)} {metric.unit}{" "}
          remaining
        </span>
        {metric.percentageUsed >= 75 && (
          <span className="text-xs" style={{ color: meta.color }}>
            ⚑ threshold crossed
          </span>
        )}
      </div>
    </div>
  );
}

function HealthRing({ score, status }: { score: number; status: Status }) {
  const meta = STATUS_META[status];
  const r = 40;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;

  return (
    <div className="flex items-center gap-6">
      <div className="relative w-24 h-24 flex-shrink-0">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke="var(--muted)"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            strokeWidth="8"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{
              stroke: meta.color,
              transition: "stroke-dashoffset 0.8s ease",
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-xl font-bold"
            style={{
              color: meta.color,
              fontFamily: "var(--font-family-mono)",
              lineHeight: 1,
            }}
          >
            {score}
          </span>
          <span
            className="text-xs"
            style={{ color: "var(--muted-foreground)" }}
          >
            /100
          </span>
        </div>
      </div>
      <div>
        <div
          className="text-xs mb-1"
          style={{ color: "var(--muted-foreground)" }}
        >
          Health Score
        </div>
        <StatusBadge status={status} />
        <div
          className="text-xs mt-2 leading-relaxed"
          style={{ color: "var(--muted-foreground)", maxWidth: "180px" }}
        >
          {score >= 80
            ? "All resources are within safe limits."
            : score >= 60
              ? "Some resources need attention."
              : score >= 40
                ? "Multiple resources are near critical levels."
                : "Immediate action required on several resources."}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [usage, setUsage] = useState<UsageMetric[]>([]);
  const [lastChecked, setLastChecked] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsage();
  }, []);

  async function fetchUsage() {
    try {
      const res = await fetch("/api/usage");
      if (!res.ok) throw new Error("Failed to fetch usage");
      const data = await res.json();
      setUsage(data.usage || []);
      setLastChecked(data.lastChecked);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleRefresh = () => {
    setSyncing(true);
    setLoading(true);
    setError(null);
    fetchUsage().finally(() => setSyncing(false));
  };

  const criticalCount = usage.filter(
    (m) => getStatus(m.percentageUsed) === "critical"
  ).length;
  const dangerCount = usage.filter(
    (m) => getStatus(m.percentageUsed) === "danger"
  ).length;
  const safeCount = usage.filter(
    (m) => getStatus(m.percentageUsed) === "safe"
  ).length;
  const avgPct =
    usage.length > 0
      ? Math.round(
          usage.reduce((acc, m) => acc + m.percentageUsed, 0) / usage.length
        )
      : 0;
  const healthScore = Math.max(10, 100 - avgPct);
  const healthStatus = getStatus(100 - healthScore);

  const lastSyncText = lastChecked
    ? (() => {
        const diff = Date.now() - new Date(lastChecked).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return "just now";
        if (mins < 60) return `${mins} min ago`;
        const hrs = Math.floor(mins / 60);
        return `${hrs} hr${hrs > 1 ? "s" : ""} ago`;
      })()
    : "never";

  return (
    <div className="flex min-h-screen" style={{ background: "var(--background)" }}>
      <Sidebar connected={true} />
      <main className="flex-1 ml-[220px] p-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                letterSpacing: "-0.02em",
              }}
            >
              Dashboard
            </h1>
            <p
              className="text-sm mt-1"
              style={{ color: "var(--muted-foreground)" }}
            >
              Vercel Hobby plan · Billing cycle resets Jun 30, 2026
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div
              className="flex items-center gap-2 text-xs"
              style={{ color: "var(--muted-foreground)" }}
            >
              <Clock className="w-3.5 h-3.5" />
              Synced {lastSyncText}
            </div>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium border transition-all hover:opacity-80 active:scale-95"
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                color: "var(--foreground)",
              }}
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>

        {loading && !syncing && (
          <div
            className="text-center py-20"
            style={{ color: "var(--muted-foreground)" }}
          >
            <div
              className="animate-spin w-8 h-8 border-2 rounded-full mx-auto mb-4"
              style={{
                borderColor: "var(--border)",
                borderTopColor: "var(--primary)",
              }}
            />
            Loading usage data...
          </div>
        )}

        {error && (
          <div
            className="p-6 rounded-xl text-center mb-8"
            style={{
              background: "var(--status-critical-bg)",
              border: "1px solid rgba(239,68,68,0.2)",
            }}
          >
            <p style={{ color: "var(--status-critical)" }}>Error: {error}</p>
            <p
              className="text-sm mt-2"
              style={{ color: "var(--muted-foreground)" }}
            >
              Make sure you have connected your Vercel account in Settings.
            </p>
          </div>
        )}

        {!loading && usage.length > 0 && (
          <>
            {/* Top summary row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {/* Health ring */}
              <div
                className="p-5 rounded-xl border sm:col-span-1"
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                }}
              >
                <HealthRing score={healthScore} status={healthStatus} />
              </div>

              {/* Stat cards */}
              <div className="sm:col-span-2 grid grid-cols-3 gap-4">
                {[
                  {
                    label: "Resources at Risk",
                    value: dangerCount + criticalCount,
                    icon: AlertTriangle,
                    color: "var(--status-danger)",
                    bg: "var(--status-danger-bg)",
                  },
                  {
                    label: "Warnings",
                    value: usage.filter(
                      (m) => getStatus(m.percentageUsed) === "warning"
                    ).length,
                    icon: AlertTriangle,
                    color: "var(--status-warning)",
                    bg: "var(--status-warning-bg)",
                  },
                  {
                    label: "Resources Safe",
                    value: safeCount,
                    icon: CheckCircle,
                    color: "var(--status-safe)",
                    bg: "var(--status-safe-bg)",
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="p-4 rounded-xl border text-center"
                    style={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center mx-auto mb-3"
                      style={{ background: s.bg }}
                    >
                      <s.icon className="w-4 h-4" style={{ color: s.color }} />
                    </div>
                    <div
                      className="text-2xl font-bold mb-1"
                      style={{
                        fontFamily: "var(--font-family-mono)",
                        color: s.color,
                      }}
                    >
                      {s.value}
                    </div>
                    <div
                      className="text-xs"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      {s.label}
                    </div>
                  </div>
                ))}

                {/* Trend card */}
                <div
                  className="col-span-3 p-4 rounded-xl border flex items-center justify-between"
                  style={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <TrendingUp
                      className="w-4 h-4"
                      style={{ color: "var(--status-danger)" }}
                    />
                    <div>
                      <div className="text-sm font-medium">
                        Usage trending up
                      </div>
                      <div
                        className="text-xs"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        Average usage at {avgPct}% across all resources
                      </div>
                    </div>
                  </div>
                  <div
                    className="px-2.5 py-1 rounded text-xs font-medium"
                    style={{
                      background:
                        healthScore >= 60
                          ? "var(--status-safe-bg)"
                          : "var(--status-danger-bg)",
                      color:
                        healthScore >= 60
                          ? "var(--status-safe)"
                          : "var(--status-danger)",
                    }}
                  >
                    Health {healthScore}/100
                  </div>
                </div>
              </div>
            </div>

            {/* Active alerts banner */}
            {(dangerCount > 0 || criticalCount > 0) && (
              <div
                className="mb-6 p-4 rounded-xl flex items-start gap-3"
                style={{
                  background: "var(--status-critical-bg)",
                  border: "1px solid rgba(239,68,68,0.2)",
                }}
              >
                <AlertTriangle
                  className="w-4 h-4 flex-shrink-0 mt-0.5"
                  style={{ color: "var(--status-critical)" }}
                />
                <div>
                  <div
                    className="text-sm font-medium"
                    style={{ color: "var(--status-critical)" }}
                  >
                    {criticalCount + dangerCount} resource
                    {criticalCount + dangerCount !== 1 ? "s" : ""} need
                    immediate attention
                  </div>
                  <div
                    className="text-xs mt-0.5"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    Some resources have crossed danger thresholds
                  </div>
                </div>
              </div>
            )}

            {/* Usage grid */}
            <h2
              className="mb-4"
              style={{ fontSize: "1rem", fontWeight: 600 }}
            >
              Resource Usage
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {usage.map((metric) => (
                <UsageCard key={metric.metricKey} metric={metric} />
              ))}
            </div>
          </>
        )}

        {!loading && usage.length === 0 && !error && (
          <div
            className="p-12 rounded-xl text-center"
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
            }}
          >
            <p
              className="text-lg mb-2"
              style={{ color: "var(--muted-foreground)" }}
            >
              No usage data available yet
            </p>
            <p
              className="text-sm"
              style={{ color: "var(--muted-foreground)" }}
            >
              Connect your Vercel account in Settings, then run the monitor to
              collect usage data.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
