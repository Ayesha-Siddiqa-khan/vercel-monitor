"use client";

import { useEffect, useState } from "react";

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

function getStatusColor(pct: number) {
  if (pct >= 95) return { bg: "bg-red-500/20", text: "text-red-400", bar: "bg-red-500", label: "CRITICAL" };
  if (pct >= 85) return { bg: "bg-orange-500/20", text: "text-orange-400", bar: "bg-orange-500", label: "DANGER" };
  if (pct >= 75) return { bg: "bg-amber-500/20", text: "text-amber-400", bar: "bg-amber-500", label: "WARNING" };
  if (pct >= 50) return { bg: "bg-yellow-500/20", text: "text-yellow-400", bar: "bg-yellow-500", label: "WATCH" };
  return { bg: "bg-emerald-500/20", text: "text-emerald-400", bar: "bg-emerald-500", label: "SAFE" };
}

function formatValue(value: number, unit: string) {
  if (["invocations", "requests", "reads", "writes"].includes(unit)) {
    return value.toLocaleString();
  }
  return value.toFixed(1);
}

function ResourceCard({ metric }: { metric: UsageMetric }) {
  const status = getStatusColor(metric.percentageUsed);
  const displayName = metric.metricKey.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-300">{displayName}</h3>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${status.bg} ${status.text}`}>
          {status.label}
        </span>
      </div>
      <div className="mb-3">
        <span className="text-2xl font-bold text-white">{formatValue(metric.usedValue, metric.unit)}</span>
        <span className="text-gray-500 text-sm"> / {formatValue(metric.limitValue, metric.unit)} {metric.unit}</span>
      </div>
      <div className="w-full bg-gray-800 rounded-full h-2 mb-2">
        <div
          className={`h-2 rounded-full ${status.bar} transition-all duration-500`}
          style={{ width: `${Math.min(100, metric.percentageUsed)}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>{metric.percentageUsed.toFixed(1)}% used</span>
        <span>{formatValue(metric.remainingValue, metric.unit)} {metric.unit} remaining</span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [usage, setUsage] = useState<UsageMetric[]>([]);
  const [lastChecked, setLastChecked] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsage();
  }, []);

  async function fetchUsage() {
    try {
      const res = await fetch("/api/usage?userId=demo-user");
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

  const overallStatus = usage.length > 0
    ? usage.reduce((worst, m) => {
        const order = { critical: 4, danger: 3, warning: 2, watch: 1, safe: 0 };
        const current = getStatusColor(m.percentageUsed);
        const worstKey = Object.keys(order).find((k) => order[k as keyof typeof order] === worst) || "safe";
        return Math.max(worst, order[current.label.toLowerCase() as keyof typeof order] || 0);
      }, 0)
    : 0;

  const overallLabel = ["SAFE", "WATCH", "WARNING", "DANGER", "CRITICAL"][overallStatus] || "SAFE";
  const overallColor = getStatusColor(overallStatus === 0 ? 0 : overallStatus * 25);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Usage Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Vercel Hobby plan resource monitoring</p>
        </div>
        <div className="flex items-center gap-4">
          {lastChecked && (
            <span className="text-xs text-gray-500">
              Last checked: {new Date(lastChecked).toLocaleString()}
            </span>
          )}
          <button
            onClick={fetchUsage}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className={`mb-8 p-4 rounded-xl border ${overallColor.bg} border-gray-800 flex items-center gap-4`}>
        <div className={`w-12 h-12 rounded-lg ${overallColor.bg} flex items-center justify-center ${overallColor.text} text-xl font-bold`}>
          {overallStatus === 0 && "\u2714"}
          {overallStatus === 1 && "\u2139"}
          {overallStatus === 2 && "\u26a0"}
          {overallStatus === 3 && "\u26a0"}
          {overallStatus >= 4 && "\u2716"}
        </div>
        <div>
          <h2 className="font-semibold text-white">Overall Health: {overallLabel}</h2>
          <p className="text-sm text-gray-400">
            {overallStatus <= 1
              ? "All resources are within safe limits."
              : overallStatus <= 2
              ? "Some resources are approaching warning levels."
              : overallStatus <= 3
              ? "Action needed - some resources are near their limits."
              : "Critical resources detected - take immediate action."}
          </p>
        </div>
      </div>

      {loading && (
        <div className="text-center py-20 text-gray-500">
          <div className="animate-spin w-8 h-8 border-2 border-gray-600 border-t-emerald-500 rounded-full mx-auto mb-4" />
          Loading usage data...
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
          <p className="text-red-400">Error: {error}</p>
          <p className="text-gray-500 text-sm mt-2">Make sure you have connected your Vercel account in Settings.</p>
        </div>
      )}

      {!loading && !error && usage.length === 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
          <p className="text-gray-400 text-lg mb-2">No usage data available yet</p>
          <p className="text-gray-500 text-sm">Connect your Vercel account in Settings, then run the monitor to collect usage data.</p>
        </div>
      )}

      {usage.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {usage.map((metric) => (
            <ResourceCard key={metric.metricKey} metric={metric} />
          ))}
        </div>
      )}
    </div>
  );
}
