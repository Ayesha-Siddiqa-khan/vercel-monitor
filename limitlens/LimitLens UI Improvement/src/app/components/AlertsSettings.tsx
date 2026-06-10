import { useState } from "react";
import {
  Bell, CheckCircle, Save, Info, Mail, Clock,
  ToggleLeft, ToggleRight, AlertTriangle,
} from "lucide-react";

interface ThresholdConfig {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  warning: number;
  danger: number;
  critical: number;
  cooldown: number;
}

const DEFAULT_CONFIGS: ThresholdConfig[] = [
  { id: "cpu",       name: "Active CPU Hours",       description: "Serverless function compute time", enabled: true,  warning: 75, danger: 85, critical: 95, cooldown: 60 },
  { id: "memory",    name: "Provisioned Memory",     description: "Memory allocated to functions",    enabled: true,  warning: 75, danger: 85, critical: 95, cooldown: 60 },
  { id: "edge",      name: "Edge Requests",          description: "Total edge network requests",      enabled: true,  warning: 75, danger: 85, critical: 95, cooldown: 60 },
  { id: "functions", name: "Function Invocations",   description: "Serverless function calls",        enabled: true,  warning: 75, danger: 85, critical: 95, cooldown: 60 },
  { id: "bandwidth", name: "Fast Data Transfer",     description: "Outbound bandwidth",               enabled: true,  warning: 70, danger: 85, critical: 95, cooldown: 60 },
  { id: "builds",    name: "Build Execution",        description: "Total build minutes",              enabled: true,  warning: 75, danger: 85, critical: 95, cooldown: 60 },
  { id: "isr_reads", name: "ISR Reads",              description: "Cache read operations",            enabled: false, warning: 80, danger: 90, critical: 95, cooldown: 120 },
  { id: "isr_writes",name: "ISR Writes",             description: "Cache write operations",           enabled: false, warning: 80, danger: 90, critical: 95, cooldown: 120 },
];

function NumberInput({ value, onChange, min = 0, max = 100 }: { value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  return (
    <input
      type="number"
      value={value}
      min={min}
      max={max}
      onChange={e => onChange(Math.max(min, Math.min(max, parseInt(e.target.value) || 0)))}
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

export function AlertsSettings() {
  const [configs, setConfigs] = useState<ThresholdConfig[]>(DEFAULT_CONFIGS);
  const [email, setEmail] = useState("alex@gmail.com");
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<"thresholds" | "notifications">("thresholds");

  const update = (id: string, field: keyof ThresholdConfig, value: any) => {
    setConfigs(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const enabledCount = configs.filter(c => c.enabled).length;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.02em" }}>Alerts & Settings</h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
            Configure notification thresholds and delivery preferences
          </p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90 active:scale-95"
          style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
          {saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-lg mb-6 w-fit" style={{ background: "var(--secondary)" }}>
        {(["thresholds", "notifications"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="px-4 py-2 rounded-md text-sm font-medium capitalize transition-all"
            style={{
              background: activeTab === tab ? "var(--card)" : "transparent",
              color: activeTab === tab ? "var(--foreground)" : "var(--muted-foreground)",
            }}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "thresholds" && (
        <>
          {/* Info banner */}
          <div className="flex items-start gap-3 p-4 rounded-xl mb-6"
            style={{ background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.2)" }}>
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "var(--status-watch)" }} />
            <div className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              <span className="font-medium" style={{ color: "var(--foreground)" }}>How thresholds work: </span>
              When a resource crosses a threshold, LimitLens sends an email alert. Cooldown prevents duplicate alerts.
              <strong> {enabledCount}</strong> of {configs.length} metrics are currently monitored.
            </div>
          </div>

          {/* Summary row */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: "Warning threshold", value: "75%", color: "var(--status-warning)", desc: "Get early notice" },
              { label: "Danger threshold",  value: "85%", color: "var(--status-danger)",  desc: "Act soon" },
              { label: "Critical threshold",value: "95%", color: "var(--status-critical)",desc: "Urgent action needed" },
            ].map(t => (
              <div key={t.label} className="p-3.5 rounded-xl border text-center"
                style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                <div className="text-lg font-semibold mb-0.5" style={{ color: t.color, fontFamily: "var(--font-family-mono)" }}>{t.value}</div>
                <div className="text-xs font-medium">{t.label}</div>
                <div className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{t.desc}</div>
              </div>
            ))}
          </div>

          {/* Config table header */}
          <div className="hidden sm:grid grid-cols-[1fr_80px_80px_80px_80px_72px] gap-3 px-5 pb-2 text-xs font-medium"
            style={{ color: "var(--muted-foreground)" }}>
            <div>Resource</div>
            <div className="text-center" style={{ color: "var(--status-warning)" }}>Warning %</div>
            <div className="text-center" style={{ color: "var(--status-danger)" }}>Danger %</div>
            <div className="text-center" style={{ color: "var(--status-critical)" }}>Critical %</div>
            <div className="text-center">Cooldown</div>
            <div className="text-center">Enabled</div>
          </div>

          {/* Config rows */}
          <div className="space-y-2">
            {configs.map(config => (
              <div key={config.id}
                className="p-5 rounded-xl border transition-all"
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  opacity: config.enabled ? 1 : 0.6,
                }}>
                {/* Mobile layout */}
                <div className="flex items-start justify-between mb-4 sm:hidden">
                  <div>
                    <div className="font-medium text-sm">{config.name}</div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{config.description}</div>
                  </div>
                  <button onClick={() => update(config.id, "enabled", !config.enabled)}
                    className="transition-colors" style={{ color: config.enabled ? "var(--primary)" : "var(--muted-foreground)" }}>
                    {config.enabled ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:hidden">
                  {[
                    { label: "Warning %", color: "var(--status-warning)", field: "warning" as const },
                    { label: "Danger %",  color: "var(--status-danger)",  field: "danger" as const },
                    { label: "Critical %",color: "var(--status-critical)",field: "critical" as const },
                    { label: "Cooldown (min)", color: "var(--muted-foreground)", field: "cooldown" as const },
                  ].map(f => (
                    <div key={f.field}>
                      <label className="text-xs mb-1 block" style={{ color: f.color }}>{f.label}</label>
                      <NumberInput value={config[f.field] as number} onChange={v => update(config.id, f.field, v)}
                        max={f.field === "cooldown" ? 1440 : 100} />
                    </div>
                  ))}
                </div>

                {/* Desktop layout */}
                <div className="hidden sm:grid grid-cols-[1fr_80px_80px_80px_80px_72px] gap-3 items-center">
                  <div>
                    <div className="font-medium text-sm">{config.name}</div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{config.description}</div>
                  </div>
                  <NumberInput value={config.warning}  onChange={v => update(config.id, "warning",  v)} />
                  <NumberInput value={config.danger}   onChange={v => update(config.id, "danger",   v)} />
                  <NumberInput value={config.critical} onChange={v => update(config.id, "critical", v)} />
                  <NumberInput value={config.cooldown} onChange={v => update(config.id, "cooldown", v)} max={1440} />
                  <div className="flex justify-center">
                    <button onClick={() => update(config.id, "enabled", !config.enabled)}
                      className="transition-colors" style={{ color: config.enabled ? "var(--primary)" : "var(--muted-foreground)" }}>
                      {config.enabled ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                    </button>
                  </div>
                </div>

                {/* Validation hint */}
                {config.warning >= config.danger && (
                  <div className="flex items-center gap-2 mt-3 text-xs" style={{ color: "var(--status-warning)" }}>
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Warning % should be less than Danger %
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === "notifications" && (
        <div className="space-y-4">
          {/* Email config */}
          <div className="p-5 rounded-xl border" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "rgba(16,185,129,0.1)" }}>
                <Mail className="w-4.5 h-4.5" style={{ color: "var(--primary)" }} />
              </div>
              <div>
                <div className="font-medium">Gmail Notifications</div>
                <div className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                  Alert emails are sent from LimitLens to your configured address
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium block mb-1.5">Alert email address</label>
                <input
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                  style={{ background: "var(--input-background)", border: "1px solid var(--border)", color: "var(--foreground)" }}
                />
                <p className="text-xs mt-1.5" style={{ color: "var(--muted-foreground)" }}>
                  All threshold alerts will be sent to this address
                </p>
              </div>
            </div>
          </div>

          {/* Alert format preview */}
          <div className="p-5 rounded-xl border" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "rgba(245,158,11,0.1)" }}>
                <Bell className="w-4.5 h-4.5" style={{ color: "var(--status-warning)" }} />
              </div>
              <div>
                <div className="font-medium">Alert Email Preview</div>
                <div className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>What your alerts look like</div>
              </div>
            </div>
            <div className="rounded-xl p-4" style={{ background: "var(--secondary)", border: "1px solid var(--border)" }}>
              <div className="text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>Subject:</div>
              <div className="text-sm font-medium mb-3">⚠️ LimitLens Alert: Edge Requests at 89% — Danger threshold crossed</div>
              <div className="text-xs" style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-family-mono)", lineHeight: 1.8 }}>
                Resource: Edge Requests<br />
                Current usage: 89,100 / 100,000 requests (89%)<br />
                Threshold crossed: Danger (85%)<br />
                Time: Jun 9, 2026 at 10:47 AM UTC<br />
                <br />
                Manage alerts → limitlens.app/alerts
              </div>
            </div>
          </div>

          {/* Cooldown info */}
          <div className="p-5 rounded-xl border" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "rgba(6,182,212,0.1)" }}>
                <Clock className="w-4.5 h-4.5" style={{ color: "var(--status-watch)" }} />
              </div>
              <div>
                <div className="font-medium">Cooldown Period</div>
                <div className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                  Prevents duplicate alerts for the same resource
                </div>
              </div>
            </div>
            <div className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
              After an alert fires for a resource, no additional alerts for that resource will
              be sent until the cooldown period expires. Set per-resource in the Thresholds tab.
              Default is <span style={{ color: "var(--foreground)", fontFamily: "var(--font-family-mono)" }}>60 minutes</span>.
            </div>
          </div>
        </div>
      )}

      {/* Save bar */}
      <div className="mt-8 pt-6 border-t flex items-center justify-between"
        style={{ borderColor: "var(--border)" }}>
        <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>
          Changes are applied to the next monitoring cycle
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all hover:opacity-90 active:scale-95"
          style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
          {saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? "Saved successfully!" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
