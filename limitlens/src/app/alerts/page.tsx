"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  CheckCircle,
  Save,
  Info,
  Mail,
  Clock,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
} from "lucide-react";
import { Sidebar } from "@/components/Sidebar";

interface AlertRule {
  id: string;
  metricKey: string;
  warningThreshold: number;
  dangerThreshold: number;
  criticalThreshold: number;
  cooldownMinutes: number;
  enabled: boolean;
}

const METRIC_DISPLAY_NAMES: Record<string, string> = {
  active_cpu_hours: "Active CPU Hours",
  provisioned_memory: "Provisioned Memory",
  edge_requests: "Edge Requests",
  function_invocations: "Function Invocations",
  fast_data_transfer: "Fast Data Transfer",
  isr_reads: "ISR Reads",
  isr_writes: "ISR Writes",
  build_execution_minutes: "Build Execution Minutes",
  project_count: "Project Count",
};

function NumberInput({
  value,
  onChange,
  min = 0,
  max = 100,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <input
      type="number"
      value={value}
      min={min}
      max={max}
      onChange={(e) =>
        onChange(
          Math.max(min, Math.min(max, parseInt(e.target.value) || 0))
        )
      }
      className="w-full px-3 py-2 rounded-lg text-sm outline-none text-center transition-all"
      style={{
        background: "var(--input-background)",
        border: "1px solid var(--border)",
        color: "var(--foreground)",
        fontFamily: "var(--font-family-mono)",
      }}
    />
  );
}

export default function AlertsPage() {
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<"thresholds" | "notifications">(
    "thresholds"
  );
  const [email, setEmail] = useState("alex@gmail.com");

  const userId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

  useEffect(() => {
    fetchRules();
  }, []);

  async function fetchRules() {
    try {
      const res = await fetch(`/api/alerts?userId=${userId}`);
      const data = await res.json();
      const fetchedRules = data.rules || [];

      if (fetchedRules.length === 0) {
        await createDefaultRules();
      } else {
        setRules(fetchedRules);
      }
    } catch {
      setRules([]);
    } finally {
      setLoading(false);
    }
  }

  async function createDefaultRules() {
    setCreating(true);
    try {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      setRules(data.rules || []);
    } catch {
      setRules([]);
    } finally {
      setCreating(false);
    }
  }

  async function updateRule(rule: AlertRule, updates: Partial<AlertRule>) {
    const updated = { ...rule, ...updates };
    try {
      await fetch("/api/alerts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...updated }),
      });
      setRules(rules.map((r) => (r.id === rule.id ? updated : r)));
    } catch (err) {
      console.error("Failed to update rule:", err);
    }
  }

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const enabledCount = rules.filter((r) => r.enabled).length;

  return (
    <div className="flex min-h-screen" style={{ background: "var(--background)" }}>
      <Sidebar connected={true} alertCount={enabledCount} />
      <main className="flex-1 ml-[220px] p-8 max-w-4xl mx-auto">
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
              Alerts & Settings
            </h1>
            <p
              className="text-sm mt-1"
              style={{ color: "var(--muted-foreground)" }}
            >
              Configure notification thresholds and delivery preferences
            </p>
          </div>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90 active:scale-95"
            style={{
              background: "var(--primary)",
              color: "var(--primary-foreground)",
            }}
          >
            {saved ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saved ? "Saved!" : "Save Changes"}
          </button>
        </div>

        {/* Tabs */}
        <div
          className="flex gap-1 p-1 rounded-lg mb-6 w-fit"
          style={{ background: "var(--secondary)" }}
        >
          {(["thresholds", "notifications"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-4 py-2 rounded-md text-sm font-medium capitalize transition-all"
              style={{
                background:
                  activeTab === tab ? "var(--card)" : "transparent",
                color:
                  activeTab === tab
                    ? "var(--foreground)"
                    : "var(--muted-foreground)",
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {loading || creating ? (
          <div
            className="text-center py-20"
            style={{ color: "var(--muted-foreground)" }}
          >
            {creating ? "Creating default alert rules..." : "Loading..."}
          </div>
        ) : (
          <>
            {activeTab === "thresholds" && (
              <>
                {/* Info banner */}
                <div
                  className="flex items-start gap-3 p-4 rounded-xl mb-6"
                  style={{
                    background: "rgba(6,182,212,0.08)",
                    border: "1px solid rgba(6,182,212,0.2)",
                  }}
                >
                  <Info
                    className="w-4 h-4 flex-shrink-0 mt-0.5"
                    style={{ color: "var(--status-watch)" }}
                  />
                  <div
                    className="text-sm"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    <span
                      className="font-medium"
                      style={{ color: "var(--foreground)" }}
                    >
                      How thresholds work:{" "}
                    </span>
                    When a resource crosses a threshold, LimitLens sends an
                    email alert. Cooldown prevents duplicate alerts.{" "}
                    <strong>{enabledCount}</strong> of {rules.length} metrics
                    are currently monitored.
                  </div>
                </div>

                {/* Summary row */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[
                    {
                      label: "Warning threshold",
                      value: "75%",
                      color: "var(--status-warning)",
                      desc: "Get early notice",
                    },
                    {
                      label: "Danger threshold",
                      value: "85%",
                      color: "var(--status-danger)",
                      desc: "Act soon",
                    },
                    {
                      label: "Critical threshold",
                      value: "95%",
                      color: "var(--status-critical)",
                      desc: "Urgent action needed",
                    },
                  ].map((t) => (
                    <div
                      key={t.label}
                      className="p-3.5 rounded-xl border text-center"
                      style={{
                        background: "var(--card)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <div
                        className="text-lg font-semibold mb-0.5"
                        style={{
                          color: t.color,
                          fontFamily: "var(--font-family-mono)",
                        }}
                      >
                        {t.value}
                      </div>
                      <div className="text-xs font-medium">{t.label}</div>
                      <div
                        className="text-xs mt-0.5"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        {t.desc}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Config table header */}
                <div
                  className="hidden sm:grid grid-cols-[1fr_80px_80px_80px_80px_72px] gap-3 px-5 pb-2 text-xs font-medium"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  <div>Resource</div>
                  <div
                    className="text-center"
                    style={{ color: "var(--status-warning)" }}
                  >
                    Warning %
                  </div>
                  <div
                    className="text-center"
                    style={{ color: "var(--status-danger)" }}
                  >
                    Danger %
                  </div>
                  <div
                    className="text-center"
                    style={{ color: "var(--status-critical)" }}
                  >
                    Critical %
                  </div>
                  <div className="text-center">Cooldown</div>
                  <div className="text-center">Enabled</div>
                </div>

                {/* Config rows */}
                <div className="space-y-2">
                  {rules.map((rule) => {
                    const displayName =
                      METRIC_DISPLAY_NAMES[rule.metricKey] ||
                      rule.metricKey
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase());
                    return (
                      <div
                        key={rule.id}
                        className="p-5 rounded-xl border transition-all"
                        style={{
                          background: "var(--card)",
                          border: "1px solid var(--border)",
                          opacity: rule.enabled ? 1 : 0.6,
                        }}
                      >
                        {/* Mobile layout */}
                        <div className="flex items-start justify-between mb-4 sm:hidden">
                          <div>
                            <div className="font-medium text-sm">
                              {displayName}
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              updateRule(rule, { enabled: !rule.enabled })
                            }
                            className="transition-colors"
                            style={{
                              color: rule.enabled
                                ? "var(--primary)"
                                : "var(--muted-foreground)",
                            }}
                          >
                            {rule.enabled ? (
                              <ToggleRight className="w-6 h-6" />
                            ) : (
                              <ToggleLeft className="w-6 h-6" />
                            )}
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3 sm:hidden">
                          {[
                            {
                              label: "Warning %",
                              color: "var(--status-warning)",
                              field: "warningThreshold" as const,
                            },
                            {
                              label: "Danger %",
                              color: "var(--status-danger)",
                              field: "dangerThreshold" as const,
                            },
                            {
                              label: "Critical %",
                              color: "var(--status-critical)",
                              field: "criticalThreshold" as const,
                            },
                            {
                              label: "Cooldown (min)",
                              color: "var(--muted-foreground)",
                              field: "cooldownMinutes" as const,
                            },
                          ].map((f) => (
                            <div key={f.field}>
                              <label
                                className="text-xs mb-1 block"
                                style={{ color: f.color }}
                              >
                                {f.label}
                              </label>
                              <NumberInput
                                value={rule[f.field]}
                                onChange={(v) =>
                                  updateRule(rule, { [f.field]: v })
                                }
                                max={f.field === "cooldownMinutes" ? 1440 : 100}
                              />
                            </div>
                          ))}
                        </div>

                        {/* Desktop layout */}
                        <div className="hidden sm:grid grid-cols-[1fr_80px_80px_80px_80px_72px] gap-3 items-center">
                          <div>
                            <div className="font-medium text-sm">
                              {displayName}
                            </div>
                          </div>
                          <NumberInput
                            value={rule.warningThreshold}
                            onChange={(v) =>
                              updateRule(rule, { warningThreshold: v })
                            }
                          />
                          <NumberInput
                            value={rule.dangerThreshold}
                            onChange={(v) =>
                              updateRule(rule, { dangerThreshold: v })
                            }
                          />
                          <NumberInput
                            value={rule.criticalThreshold}
                            onChange={(v) =>
                              updateRule(rule, { criticalThreshold: v })
                            }
                          />
                          <NumberInput
                            value={rule.cooldownMinutes}
                            onChange={(v) =>
                              updateRule(rule, { cooldownMinutes: v })
                            }
                            max={1440}
                          />
                          <div className="flex justify-center">
                            <button
                              onClick={() =>
                                updateRule(rule, { enabled: !rule.enabled })
                              }
                              className="transition-colors"
                              style={{
                                color: rule.enabled
                                  ? "var(--primary)"
                                  : "var(--muted-foreground)",
                              }}
                            >
                              {rule.enabled ? (
                                <ToggleRight className="w-6 h-6" />
                              ) : (
                                <ToggleLeft className="w-6 h-6" />
                              )}
                            </button>
                          </div>
                        </div>

                        {rule.warningThreshold >= rule.dangerThreshold && (
                          <div
                            className="flex items-center gap-2 mt-3 text-xs"
                            style={{ color: "var(--status-warning)" }}
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Warning % should be less than Danger %
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {activeTab === "notifications" && (
              <div className="space-y-4">
                {/* Email config */}
                <div
                  className="p-5 rounded-xl border"
                  style={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center"
                      style={{ background: "rgba(16,185,129,0.1)" }}
                    >
                      <Mail
                        className="w-4 h-4"
                        style={{ color: "var(--primary)" }}
                      />
                    </div>
                    <div>
                      <div className="font-medium">Gmail Notifications</div>
                      <div
                        className="text-xs mt-0.5"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        Alert emails are sent from LimitLens to your configured
                        address
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium block mb-1.5">
                        Alert email address
                      </label>
                      <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                        style={{
                          background: "var(--input-background)",
                          border: "1px solid var(--border)",
                          color: "var(--foreground)",
                        }}
                      />
                      <p
                        className="text-xs mt-1.5"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        All threshold alerts will be sent to this address
                      </p>
                    </div>
                  </div>
                </div>

                {/* Alert format preview */}
                <div
                  className="p-5 rounded-xl border"
                  style={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center"
                      style={{ background: "rgba(245,158,11,0.1)" }}
                    >
                      <Bell
                        className="w-4 h-4"
                        style={{ color: "var(--status-warning)" }}
                      />
                    </div>
                    <div>
                      <div className="font-medium">Alert Email Preview</div>
                      <div
                        className="text-xs mt-0.5"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        What your alerts look like
                      </div>
                    </div>
                  </div>
                  <div
                    className="rounded-xl p-4"
                    style={{
                      background: "var(--secondary)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div
                      className="text-xs mb-1"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      Subject:
                    </div>
                    <div className="text-sm font-medium mb-3">
                      ⚠️ LimitLens Alert: Edge Requests at 89% — Danger
                      threshold crossed
                    </div>
                    <div
                      className="text-xs"
                      style={{
                        color: "var(--muted-foreground)",
                        fontFamily: "var(--font-family-mono)",
                        lineHeight: 1.8,
                      }}
                    >
                      Resource: Edge Requests
                      <br />
                      Current usage: 89,100 / 100,000 requests (89%)
                      <br />
                      Threshold crossed: Danger (85%)
                      <br />
                      Time: Jun 9, 2026 at 10:47 AM UTC
                      <br />
                      <br />
                      Manage alerts → limitlens.app/alerts
                    </div>
                  </div>
                </div>

                {/* Cooldown info */}
                <div
                  className="p-5 rounded-xl border"
                  style={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center"
                      style={{ background: "rgba(6,182,212,0.1)" }}
                    >
                      <Clock
                        className="w-4 h-4"
                        style={{ color: "var(--status-watch)" }}
                      />
                    </div>
                    <div>
                      <div className="font-medium">Cooldown Period</div>
                      <div
                        className="text-xs mt-0.5"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        Prevents duplicate alerts for the same resource
                      </div>
                    </div>
                  </div>
                  <div
                    className="text-sm leading-relaxed"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    After an alert fires for a resource, no additional alerts for
                    that resource will be sent until the cooldown period expires.
                    Set per-resource in the Thresholds tab. Default is{" "}
                    <span
                      style={{
                        color: "var(--foreground)",
                        fontFamily: "var(--font-family-mono)",
                      }}
                    >
                      60 minutes
                    </span>
                    .
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Save bar */}
        <div
          className="mt-8 pt-6 border-t flex items-center justify-between"
          style={{ borderColor: "var(--border)" }}
        >
          <div
            className="text-xs"
            style={{ color: "var(--muted-foreground)" }}
          >
            Changes are applied to the next monitoring cycle
          </div>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all hover:opacity-90 active:scale-95"
            style={{
              background: "var(--primary)",
              color: "var(--primary-foreground)",
            }}
          >
            {saved ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saved ? "Saved successfully!" : "Save Changes"}
          </button>
        </div>
      </main>
    </div>
  );
}
