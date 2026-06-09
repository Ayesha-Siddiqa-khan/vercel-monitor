"use client";

import { useEffect, useState } from "react";

interface AlertRule {
  id: string;
  metricKey: string;
  warningThreshold: number;
  dangerThreshold: number;
  criticalThreshold: number;
  cooldownMinutes: number;
  enabled: boolean;
}

export default function AlertsPage() {
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRules();
  }, []);

  async function fetchRules() {
    try {
      const res = await fetch("/api/alerts?userId=demo-user");
      const data = await res.json();
      setRules(data.rules || []);
    } catch {
      setRules([]);
    } finally {
      setLoading(false);
    }
  }

  async function updateRule(rule: AlertRule, updates: Partial<AlertRule>) {
    const updated = { ...rule, ...updates };
    try {
      await fetch("/api/alerts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "demo-user", ...updated }),
      });
      setRules(rules.map((r) => (r.id === rule.id ? updated : r)));
    } catch (err) {
      console.error("Failed to update rule:", err);
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-2">Alert Rules</h1>
      <p className="text-gray-400 text-sm mb-8">Configure thresholds for Gmail notifications</p>

      {loading ? (
        <div className="text-center py-20 text-gray-500">Loading...</div>
      ) : rules.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
          <p className="text-gray-400">No alert rules configured yet.</p>
          <p className="text-gray-500 text-sm mt-2">Connect your Vercel account first, then rules will be auto-created.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {rules.map((rule) => {
            const displayName = rule.metricKey.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
            return (
              <div key={rule.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-white">{displayName}</h3>
                  <button
                    onClick={() => updateRule(rule, { enabled: !rule.enabled })}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      rule.enabled ? "bg-emerald-500/20 text-emerald-400" : "bg-gray-700 text-gray-400"
                    }`}
                  >
                    {rule.enabled ? "Enabled" : "Disabled"}
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Warning %</label>
                    <input
                      type="number"
                      value={rule.warningThreshold}
                      onChange={(e) => updateRule(rule, { warningThreshold: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Danger %</label>
                    <input
                      type="number"
                      value={rule.dangerThreshold}
                      onChange={(e) => updateRule(rule, { dangerThreshold: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Critical %</label>
                    <input
                      type="number"
                      value={rule.criticalThreshold}
                      onChange={(e) => updateRule(rule, { criticalThreshold: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Cooldown (min)</label>
                    <input
                      type="number"
                      value={rule.cooldownMinutes}
                      onChange={(e) => updateRule(rule, { cooldownMinutes: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 bg-gray-800 border border-gray-700 rounded text-white text-sm"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
