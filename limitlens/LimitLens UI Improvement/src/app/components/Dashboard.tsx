import { useState } from "react";
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

interface Metric {
  id: string;
  name: string;
  used: number;
  limit: number;
  unit: string;
  icon: React.ElementType;
  description: string;
}

const METRICS: Metric[] = [
  { id: "cpu",       name: "Active CPU Hours",       used: 67.2,  limit: 100,      unit: "hrs",   icon: Cpu,      description: "Serverless function compute time" },
  { id: "memory",    name: "Provisioned Memory",     used: 42.8,  limit: 100,      unit: "GB·hrs",icon: Database,  description: "Memory allocated to functions" },
  { id: "edge",      name: "Edge Requests",           used: 89100, limit: 100000,   unit: "req",   icon: Globe,    description: "Total edge network requests" },
  { id: "functions", name: "Function Invocations",   used: 234000,limit: 1000000,  unit: "inv",   icon: Zap,      description: "Serverless function calls" },
  { id: "bandwidth", name: "Fast Data Transfer",     used: 85.3,  limit: 100,      unit: "GB",    icon: HardDrive,description: "Outbound bandwidth usage" },
  { id: "builds",    name: "Build Execution",        used: 3240,  limit: 6000,     unit: "min",   icon: GitBranch,description: "Total build minutes consumed" },
  { id: "isr_reads", name: "ISR Reads",              used: 12400, limit: 50000,    unit: "reads", icon: BookOpen, description: "Incremental static regen cache reads" },
  { id: "isr_writes",name: "ISR Writes",             used: 890,   limit: 2000,     unit: "writes",icon: PenTool,  description: "Incremental static regen cache writes" },
];

const ALERTS = [
  { id: 1, metric: "Fast Data Transfer", pct: 85, status: "danger" as Status,   time: "14 min ago",   sent: true },
  { id: 2, metric: "Edge Requests",       pct: 89, status: "danger" as Status,   time: "32 min ago",   sent: true },
  { id: 3, metric: "Active CPU Hours",    pct: 67, status: "warning" as Status,  time: "1 hr ago",     sent: true },
  { id: 4, metric: "Build Execution",     pct: 54, status: "watch" as Status,    time: "3 hrs ago",    sent: false },
];

function StatusBadge({ status }: { status: Status }) {
  const meta = STATUS_META[status];
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
      style={{ background: meta.bg, color: meta.color }}>
      {meta.label}
    </span>
  );
}

function ProgressBar({ pct, status }: { pct: number; status: Status }) {
  const color = STATUS_META[status].color;
  return (
    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--muted)" }}>
      <div className="h-full rounded-full transition-all duration-500"
        style={{ width: `${Math.min(pct, 100)}%`, background: color }} />
    </div>
  );
}

function UsageCard({ metric }: { metric: Metric }) {
  const pct = Math.round((metric.used / metric.limit) * 100);
  const status = getStatus(pct);
  const meta = STATUS_META[status];
  const Icon = metric.icon;

  const formatValue = (v: number, unit: string) => {
    if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
    if (v >= 1000) return `${(v / 1000).toFixed(1)}k`;
    return `${v}`;
  };

  const formatLimit = (v: number, unit: string) => {
    if (v >= 1000000) return `${(v / 1000000).toFixed(0)}M`;
    if (v >= 1000) return `${(v / 1000).toFixed(0)}k`;
    return `${v}`;
  };

  return (
    <div className="p-5 rounded-xl border transition-all hover:border-opacity-60 group"
      style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: meta.bg }}>
            <Icon className="w-4 h-4" style={{ color: meta.color }} />
          </div>
          <div>
            <div className="text-sm font-medium leading-tight">{metric.name}</div>
            <div className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{metric.description}</div>
          </div>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="flex items-end justify-between mb-2">
        <div>
          <span className="text-xl font-semibold" style={{ fontFamily: "var(--font-family-mono)", color: meta.color }}>
            {formatValue(metric.used, metric.unit)}
          </span>
          <span className="text-sm ml-1" style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-family-mono)" }}>
            / {formatLimit(metric.limit, metric.unit)} {metric.unit}
          </span>
        </div>
        <span className="text-sm font-semibold" style={{ color: meta.color, fontFamily: "var(--font-family-mono)" }}>{pct}%</span>
      </div>

      <ProgressBar pct={pct} status={status} />

      <div className="flex items-center justify-between mt-2">
        <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
          {formatLimit(metric.limit - metric.used, metric.unit)} {metric.unit} remaining
        </span>
        {pct >= 75 && (
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
          <circle cx="50" cy="50" r={r} fill="none" stroke="var(--muted)" strokeWidth="8" />
          <circle cx="50" cy="50" r={r} fill="none" strokeWidth="8"
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round" style={{ stroke: meta.color, transition: "stroke-dashoffset 0.8s ease" }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold" style={{ color: meta.color, fontFamily: "var(--font-family-mono)", lineHeight: 1 }}>{score}</span>
          <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>/100</span>
        </div>
      </div>
      <div>
        <div className="text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>Health Score</div>
        <StatusBadge status={status} />
        <div className="text-xs mt-2 leading-relaxed" style={{ color: "var(--muted-foreground)", maxWidth: "180px" }}>
          {score >= 80 ? "All resources are within safe limits." :
           score >= 60 ? "Some resources need attention." :
           score >= 40 ? "Multiple resources are near critical levels." :
           "Immediate action required on several resources."}
        </div>
      </div>
    </div>
  );
}

export function Dashboard() {
  const [syncing, setSyncing] = useState(false);
  const [lastSync] = useState("2 min ago");

  const criticalCount = METRICS.filter(m => getStatus(Math.round((m.used / m.limit) * 100)) === "critical").length;
  const dangerCount = METRICS.filter(m => getStatus(Math.round((m.used / m.limit) * 100)) === "danger").length;
  const avgPct = Math.round(METRICS.reduce((acc, m) => acc + (m.used / m.limit) * 100, 0) / METRICS.length);
  const healthScore = Math.max(10, 100 - avgPct);
  const healthStatus = getStatus(100 - healthScore);

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => setSyncing(false), 1800);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.02em" }}>Dashboard</h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
            Vercel Hobby plan · Billing cycle resets Jun 30, 2026
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs" style={{ color: "var(--muted-foreground)" }}>
            <Clock className="w-3.5 h-3.5" />
            Synced {lastSync}
          </div>
          <button
            onClick={handleSync}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium border transition-all hover:opacity-80 active:scale-95"
            style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--foreground)" }}>
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Top summary row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {/* Health ring */}
        <div className="p-5 rounded-xl border sm:col-span-1"
          style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <HealthRing score={healthScore} status={healthStatus} />
        </div>

        {/* Stat cards */}
        <div className="sm:col-span-2 grid grid-cols-3 gap-4">
          {[
            { label: "Resources at Risk", value: dangerCount + criticalCount, icon: AlertTriangle, color: "var(--status-danger)", bg: "var(--status-danger-bg)" },
            { label: "Active Alerts", value: ALERTS.filter(a => a.sent).length, icon: AlertTriangle, color: "var(--status-warning)", bg: "var(--status-warning-bg)" },
            { label: "Resources Safe", value: METRICS.filter(m => getStatus(Math.round((m.used / m.limit) * 100)) === "safe").length, icon: CheckCircle, color: "var(--status-safe)", bg: "var(--status-safe-bg)" },
          ].map((s) => (
            <div key={s.label} className="p-4 rounded-xl border text-center"
              style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center mx-auto mb-3"
                style={{ background: s.bg }}>
                <s.icon className="w-4.5 h-4.5" style={{ color: s.color }} />
              </div>
              <div className="text-2xl font-bold mb-1" style={{ fontFamily: "var(--font-family-mono)", color: s.color }}>{s.value}</div>
              <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>{s.label}</div>
            </div>
          ))}

          {/* Trend card */}
          <div className="col-span-3 p-4 rounded-xl border flex items-center justify-between"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <div className="flex items-center gap-3">
              <TrendingUp className="w-4.5 h-4.5" style={{ color: "var(--status-danger)" }} />
              <div>
                <div className="text-sm font-medium">Edge Requests trending fast</div>
                <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>+12k in the last 6 hours · 11k until limit</div>
              </div>
            </div>
            <div className="px-2.5 py-1 rounded text-xs font-medium"
              style={{ background: "var(--status-danger-bg)", color: "var(--status-danger)" }}>
              At pace to hit limit in ~5 hrs
            </div>
          </div>
        </div>
      </div>

      {/* Active alerts banner */}
      {(dangerCount > 0 || criticalCount > 0) && (
        <div className="mb-6 p-4 rounded-xl flex items-start gap-3"
          style={{ background: "var(--status-critical-bg)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <AlertTriangle className="w-4.5 h-4.5 flex-shrink-0 mt-0.5" style={{ color: "var(--status-critical)" }} />
          <div>
            <div className="text-sm font-medium" style={{ color: "var(--status-critical)" }}>
              {criticalCount + dangerCount} resource{criticalCount + dangerCount !== 1 ? "s" : ""} need immediate attention
            </div>
            <div className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
              Fast Data Transfer is at 85% · Edge Requests at 89% · Alert emails sent
            </div>
          </div>
        </div>
      )}

      {/* Usage grid */}
      <h2 className="mb-4" style={{ fontSize: "1rem", fontWeight: 600 }}>Resource Usage</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4 mb-8">
        {METRICS.map((m) => (
          <UsageCard key={m.id} metric={m} />
        ))}
      </div>

      {/* Recent alerts */}
      <div>
        <h2 className="mb-4" style={{ fontSize: "1rem", fontWeight: 600 }}>Recent Alert Activity</h2>
        <div className="rounded-xl border overflow-hidden" style={{ border: "1px solid var(--border)" }}>
          {ALERTS.map((alert, i) => {
            const meta = STATUS_META[alert.status];
            return (
              <div key={alert.id}
                className={`flex items-center gap-4 px-5 py-3.5 ${i < ALERTS.length - 1 ? "border-b" : ""}`}
                style={{ borderColor: "var(--border)", background: i % 2 === 0 ? "var(--card)" : "transparent" }}>
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: meta.color }} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{alert.metric}</div>
                  <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                    Crossed {alert.pct}% threshold
                  </div>
                </div>
                <StatusBadge status={alert.status} />
                <div className="text-xs w-20 text-right" style={{ color: "var(--muted-foreground)" }}>{alert.time}</div>
                <div className="text-xs w-16 text-right" style={{ color: alert.sent ? "var(--status-safe)" : "var(--muted-foreground)" }}>
                  {alert.sent ? "✓ Sent" : "Skipped"}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
