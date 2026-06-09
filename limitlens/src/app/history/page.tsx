"use client";

import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Calendar, TrendingUp, TrendingDown } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";

const RANGES = ["7 days", "14 days", "30 days"] as const;
type Range = (typeof RANGES)[number];

const METRIC_OPTIONS = [
  { id: "edge_requests", label: "Edge Requests", color: "#f97316", limit: 100000 },
  { id: "active_cpu_hours", label: "Active CPU Hours", color: "#10b981", limit: 100 },
  { id: "fast_data_transfer", label: "Fast Data Transfer", color: "#ef4444", limit: 100 },
  { id: "function_invocations", label: "Function Invocations", color: "#06b6d4", limit: 1000000 },
  { id: "build_execution_minutes", label: "Build Execution", color: "#f59e0b", limit: 6000 },
  { id: "provisioned_memory", label: "Provisioned Memory", color: "#8b5cf6", limit: 100 },
  { id: "isr_reads", label: "ISR Reads", color: "#10b981", limit: 50000 },
  { id: "isr_writes", label: "ISR Writes", color: "#06b6d4", limit: 2000 },
];

function generateHistory(
  limit: number,
  days: number,
  trend: "up" | "down" | "flat",
  baseRatio: number
) {
  const data = [];
  let val = limit * baseRatio;
  for (let i = days; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const noise = (Math.random() - 0.5) * limit * 0.06;
    const drift =
      trend === "up"
        ? limit * 0.02
        : trend === "down"
          ? -limit * 0.01
          : 0;
    val = Math.max(0, Math.min(limit, val + drift + noise));
    data.push({
      date: label,
      value: Math.round(val),
      pct: Math.round((val / limit) * 100),
    });
  }
  return data;
}

const HISTORIES: Record<
  string,
  Record<Range, { date: string; value: number; pct: number }[]>
> = {
  edge_requests: {
    "7 days": generateHistory(100000, 7, "up", 0.72),
    "14 days": generateHistory(100000, 14, "up", 0.55),
    "30 days": generateHistory(100000, 30, "up", 0.3),
  },
  active_cpu_hours: {
    "7 days": generateHistory(100, 7, "up", 0.45),
    "14 days": generateHistory(100, 14, "up", 0.35),
    "30 days": generateHistory(100, 30, "up", 0.2),
  },
  fast_data_transfer: {
    "7 days": generateHistory(100, 7, "up", 0.68),
    "14 days": generateHistory(100, 14, "up", 0.5),
    "30 days": generateHistory(100, 30, "flat", 0.3),
  },
  function_invocations: {
    "7 days": generateHistory(1000000, 7, "flat", 0.22),
    "14 days": generateHistory(1000000, 14, "flat", 0.2),
    "30 days": generateHistory(1000000, 30, "down", 0.25),
  },
  build_execution_minutes: {
    "7 days": generateHistory(6000, 7, "up", 0.48),
    "14 days": generateHistory(6000, 14, "up", 0.38),
    "30 days": generateHistory(6000, 30, "flat", 0.25),
  },
  provisioned_memory: {
    "7 days": generateHistory(100, 7, "flat", 0.42),
    "14 days": generateHistory(100, 14, "up", 0.35),
    "30 days": generateHistory(100, 30, "flat", 0.25),
  },
  isr_reads: {
    "7 days": generateHistory(50000, 7, "up", 0.24),
    "14 days": generateHistory(50000, 14, "flat", 0.2),
    "30 days": generateHistory(50000, 30, "down", 0.3),
  },
  isr_writes: {
    "7 days": generateHistory(2000, 7, "flat", 0.44),
    "14 days": generateHistory(2000, 14, "flat", 0.4),
    "30 days": generateHistory(2000, 30, "down", 0.5),
  },
};

function formatVal(v: number, limit: number) {
  if (limit >= 1000000) return `${(v / 1000).toFixed(0)}k`;
  if (limit >= 1000) return `${v}`;
  return `${v.toFixed(1)}`;
}

const CustomTooltip = ({
  active,
  payload,
  label,
  limit,
}: any) => {
  if (!active || !payload?.length) return null;
  const pct = payload[0]?.payload?.pct;
  const val = payload[0]?.value;
  return (
    <div
      className="px-3 py-2 rounded-lg shadow-lg text-sm"
      style={{
        background: "var(--popover)",
        border: "1px solid var(--border)",
        fontFamily: "var(--font-family-mono)",
      }}
    >
      <div
        className="mb-1"
        style={{
          color: "var(--muted-foreground)",
          fontFamily: "var(--font-family-sans)",
          fontSize: "0.75rem",
        }}
      >
        {label}
      </div>
      <div style={{ color: "var(--foreground)" }}>
        {formatVal(val, limit)} ({pct}%)
      </div>
    </div>
  );
};

export default function HistoryPage() {
  const [range, setRange] = useState<Range>("7 days");
  const [selectedMetric, setSelectedMetric] = useState("edge_requests");

  const metric = METRIC_OPTIONS.find((m) => m.id === selectedMetric)!;
  const data = HISTORIES[selectedMetric]?.[range] || [];
  const first = data[0]?.pct ?? 0;
  const last = data[data.length - 1]?.pct ?? 0;
  const delta = last - first;
  const trend = delta > 2 ? "up" : delta < -2 ? "down" : "flat";

  return (
    <div className="flex min-h-screen" style={{ background: "var(--background)" }}>
      <Sidebar connected={true} />
      <main className="flex-1 ml-[220px] p-8 max-w-6xl mx-auto">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                letterSpacing: "-0.02em",
              }}
            >
              Usage History
            </h1>
            <p
              className="text-sm mt-1"
              style={{ color: "var(--muted-foreground)" }}
            >
              Historical resource consumption across your billing cycle
            </p>
          </div>
          <div
            className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg"
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              color: "var(--muted-foreground)",
            }}
          >
            <Calendar className="w-3.5 h-3.5" />
            Billing cycle: Jun 1 – Jun 30, 2026
          </div>
        </div>

        {/* Metric selector */}
        <div className="flex flex-wrap gap-2 mb-6">
          {METRIC_OPTIONS.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedMetric(m.id)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background:
                  selectedMetric === m.id ? m.color + "22" : "var(--card)",
                border: `1px solid ${selectedMetric === m.id ? m.color + "55" : "var(--border)"}`,
                color:
                  selectedMetric === m.id
                    ? m.color
                    : "var(--muted-foreground)",
              }}
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: m.color }}
              />
              {m.label}
            </button>
          ))}
        </div>

        {/* Chart card */}
        <div
          className="rounded-xl border p-6 mb-6"
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
          }}
        >
          {/* Chart header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 style={{ fontWeight: 600, fontSize: "1.0625rem" }}>
                  {metric.label}
                </h2>
                <div
                  className="flex items-center gap-1.5 text-xs px-2 py-0.5 rounded"
                  style={{
                    background:
                      trend === "up"
                        ? "var(--status-danger-bg)"
                        : trend === "down"
                          ? "var(--status-safe-bg)"
                          : "var(--muted)",
                    color:
                      trend === "up"
                        ? "var(--status-danger)"
                        : trend === "down"
                          ? "var(--status-safe)"
                          : "var(--muted-foreground)",
                  }}
                >
                  {trend === "up" ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : trend === "down" ? (
                    <TrendingDown className="w-3 h-3" />
                  ) : null}
                  {trend === "flat"
                    ? "Stable"
                    : `${Math.abs(delta)}% ${trend === "up" ? "increase" : "decrease"}`}
                </div>
              </div>
              <p
                className="text-xs"
                style={{ color: "var(--muted-foreground)" }}
              >
                Usage over the last {range} · Current:{" "}
                <span
                  style={{
                    color: metric.color,
                    fontFamily: "var(--font-family-mono)",
                  }}
                >
                  {last}%
                </span>
              </p>
            </div>
            {/* Range selector */}
            <div
              className="flex items-center gap-1 p-1 rounded-lg"
              style={{ background: "var(--secondary)" }}
            >
              {RANGES.map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className="px-3 py-1.5 rounded-md text-xs font-medium transition-all"
                  style={{
                    background:
                      range === r ? "var(--card)" : "transparent",
                    color:
                      range === r
                        ? "var(--foreground)"
                        : "var(--muted-foreground)",
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Chart */}
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart
              data={data}
              margin={{ top: 5, right: 5, bottom: 5, left: -20 }}
            >
              <defs>
                <linearGradient
                  id={`grad-${metric.id}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor={metric.color}
                    stopOpacity={0.2}
                  />
                  <stop
                    offset="95%"
                    stopColor={metric.color}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border)"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{
                  fill: "var(--muted-foreground)",
                  fontSize: 11,
                  fontFamily: "var(--font-family-mono)",
                }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{
                  fill: "var(--muted-foreground)",
                  fontSize: 11,
                  fontFamily: "var(--font-family-mono)",
                }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}%`}
                domain={[0, 100]}
              />
              <Tooltip
                content={<CustomTooltip limit={metric.limit} />}
              />
              <Area
                type="monotone"
                dataKey="pct"
                stroke={metric.color}
                strokeWidth={2}
                fill={`url(#grad-${metric.id})`}
                dot={false}
                activeDot={{
                  r: 4,
                  fill: metric.color,
                  stroke: "var(--card)",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className="flex items-center gap-6 mt-2 justify-center">
            <div
              className="flex items-center gap-2 text-xs"
              style={{ color: "var(--muted-foreground)" }}
            >
              <div
                className="w-4 h-0.5"
                style={{ background: metric.color }}
              />
              Usage %
            </div>
            <div
              className="flex items-center gap-2 text-xs"
              style={{ color: "var(--muted-foreground)" }}
            >
              <div
                className="w-4 h-0 border-t border-dashed"
                style={{ borderColor: "var(--status-warning)" }}
              />
              Warning (75%)
            </div>
            <div
              className="flex items-center gap-2 text-xs"
              style={{ color: "var(--muted-foreground)" }}
            >
              <div
                className="w-4 h-0 border-t border-dashed"
                style={{ borderColor: "var(--status-danger)" }}
              />
              Danger (85%)
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              label: "Peak Usage",
              value: `${Math.max(...data.map((d) => d.pct))}%`,
              desc: "Highest in period",
            },
            {
              label: "Average",
              value: `${Math.round(data.reduce((a, d) => a + d.pct, 0) / data.length)}%`,
              desc: "Mean over period",
            },
            { label: "Current", value: `${last}%`, desc: "Right now" },
            { label: "Days to Reset", value: "21", desc: "Billing cycle end" },
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
                className="text-lg font-semibold mb-1"
                style={{
                  fontFamily: "var(--font-family-mono)",
                  color: metric.color,
                }}
              >
                {s.value}
              </div>
              <div className="text-sm font-medium">{s.label}</div>
              <div
                className="text-xs mt-0.5"
                style={{ color: "var(--muted-foreground)" }}
              >
                {s.desc}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
