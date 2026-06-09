"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [vercelToken, setVercelToken] = useState("");
  const [teamId, setTeamId] = useState("");
  const [userId, setUserId] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleConnect(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/vercel/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId || "demo-user",
          vercelToken,
          teamId: teamId || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setStatus("success");
      setMessage("Vercel account connected successfully!");
      setVercelToken("");
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-2">Settings</h1>
      <p className="text-gray-400 text-sm mb-8">Configure your Vercel connection and alert preferences</p>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">Connect Vercel Account</h2>
        <p className="text-sm text-gray-400 mb-4">
          Enter your Vercel access token to allow LimitLens to monitor your usage.
          Your token is encrypted at rest and never exposed in the UI or logs.
        </p>

        <form onSubmit={handleConnect} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">User ID</label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="demo-user"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Vercel Access Token</label>
            <input
              type="password"
              value={vercelToken}
              onChange={(e) => setVercelToken(e.target.value)}
              placeholder="your-vercel-token"
              required
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Team ID (optional)</label>
            <input
              type="text"
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
              placeholder="team_xxxxxxxx"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 text-white rounded-lg font-medium transition-colors"
          >
            {status === "loading" ? "Connecting..." : "Connect Vercel Account"}
          </button>
        </form>

        {message && (
          <div className={`mt-4 p-3 rounded-lg text-sm ${status === "success" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
            {message}
          </div>
        )}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Environment Variables</h2>
        <p className="text-sm text-gray-400 mb-4">
          For production use, configure these environment variables:
        </p>
        <div className="bg-gray-950 rounded-lg p-4 font-mono text-xs text-gray-400 space-y-1">
          <div><span className="text-emerald-400">DATABASE_URL</span>=postgresql://...</div>
          <div><span className="text-emerald-400">ENCRYPTION_KEY</span>=32-byte-hex-key</div>
          <div><span className="text-emerald-400">GMAIL_USER</span>=your@gmail.com</div>
          <div><span className="text-emerald-400">GMAIL_APP_PASSWORD</span>=xxxx-xxxx-xxxx-xxxx</div>
          <div><span className="text-emerald-400">ALERT_TO_EMAIL</span>=your@gmail.com</div>
          <div><span className="text-emerald-400">MONITOR_API_SECRET</span>=random-secret-string</div>
        </div>
      </div>
    </div>
  );
}
