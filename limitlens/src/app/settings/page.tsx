"use client";

import { useState } from "react";
import {
  Check,
  Eye,
  EyeOff,
  ExternalLink,
  Shield,
  ChevronRight,
  Loader2,
  CheckCircle,
  AlertCircle,
  Key,
  Zap,
} from "lucide-react";
import { Sidebar } from "@/components/Sidebar";

type Step = "token" | "verify" | "success";

export default function SettingsPage() {
  const [step, setStep] = useState<Step>("token");
  const [token, setToken] = useState("");
  const [teamId, setTeamId] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");

  const handleConnect = async () => {
    if (!token.trim()) {
      setError("Vercel access token is required");
      return;
    }
    setError("");
    setVerifying(true);

    try {
      const res = await fetch("/api/vercel/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vercelToken: token,
          teamId: teamId || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setStep("verify");
      await new Promise((r) => setTimeout(r, 800));
      setStep("success");
    } catch (err: any) {
      setError(err.message);
      setVerifying(false);
    }
  };

  if (step === "success") {
    return (
      <div className="flex min-h-screen" style={{ background: "var(--background)" }}>
        <Sidebar connected={true} />
        <main className="flex-1 ml-[220px] p-8 max-w-lg mx-auto">
          <div className="text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ background: "var(--status-safe-bg)" }}
            >
              <CheckCircle
                className="w-8 h-8"
                style={{ color: "var(--status-safe)" }}
              />
            </div>
            <h2
              className="mb-3"
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                letterSpacing: "-0.02em",
              }}
            >
              Vercel Connected!
            </h2>
            <p
              className="mb-8 leading-relaxed"
              style={{ color: "var(--muted-foreground)" }}
            >
              LimitLens is now monitoring your Vercel Hobby plan. We&apos;ll
              send Gmail alerts when you approach resource limits.
            </p>

            <div
              className="p-4 rounded-xl mb-6 text-left space-y-3"
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
              }}
            >
              {[
                {
                  label: "Account type",
                  value: "Hobby (Free plan)",
                },
                {
                  label: "Monitoring status",
                  value: "Active",
                  green: true,
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between"
                >
                  <span
                    className="text-sm"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    {row.label}
                  </span>
                  <span
                    className="text-sm font-medium"
                    style={{
                      color: row.green
                        ? "var(--status-safe)"
                        : "var(--foreground)",
                    }}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            <a
              href="/dashboard"
              className="w-full py-3 rounded-lg font-medium transition-all hover:opacity-90 active:scale-95 flex items-center justify-center gap-2"
              style={{
                background: "var(--primary)",
                color: "var(--primary-foreground)",
              }}
            >
              Go to Dashboard
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen" style={{ background: "var(--background)" }}>
      <Sidebar connected={false} />
      <main className="flex-1 ml-[220px] p-8 max-w-2xl mx-auto">
        <div className="mb-8">
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            Connect Vercel Account
          </h1>
          <p
            className="text-sm mt-1"
            style={{ color: "var(--muted-foreground)" }}
          >
            Enter your Vercel access token to begin monitoring your usage
            limits
          </p>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center gap-2 mb-8">
          {([
            { id: "token" as Step, label: "Token" },
            { id: "verify" as Step, label: "Verify" },
            { id: "success" as Step, label: "Done" },
          ]).map((s, i) => {
            const isActive = s.id === step;
            const isDone = i === 0 && step === "verify";
            return (
              <div key={s.id} className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold"
                    style={{
                      background: isDone
                        ? "var(--primary)"
                        : isActive
                          ? "var(--secondary)"
                          : "transparent",
                      border: `1.5px solid ${isDone ? "var(--primary)" : isActive ? "var(--border)" : "var(--muted)"}`,
                      color: isDone
                        ? "var(--primary-foreground)"
                        : isActive
                          ? "var(--foreground)"
                          : "var(--muted-foreground)",
                    }}
                  >
                    {isDone ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      i + 1
                    )}
                  </div>
                  <span
                    className="text-sm"
                    style={{
                      color: isActive
                        ? "var(--foreground)"
                        : "var(--muted-foreground)",
                    }}
                  >
                    {s.label}
                  </span>
                </div>
                {i < 2 && (
                  <div
                    className="w-8 h-px"
                    style={{ background: "var(--border)" }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {step === "verify" ? (
          <div className="text-center py-16">
            <Loader2
              className="w-10 h-10 mx-auto mb-4 animate-spin"
              style={{ color: "var(--primary)" }}
            />
            <div className="font-medium mb-1">
              Verifying your Vercel token...
            </div>
            <div
              className="text-sm"
              style={{ color: "var(--muted-foreground)" }}
            >
              Checking account access and detecting projects
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Main form */}
            <div
              className="p-6 rounded-xl border"
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
              }}
            >
              <div className="space-y-5">
                {/* Token */}
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    <span className="flex items-center gap-2">
                      <Key className="w-3.5 h-3.5" />
                      Vercel Access Token{" "}
                      <span style={{ color: "var(--status-critical)" }}>*</span>
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type={showToken ? "text" : "password"}
                      value={token}
                      onChange={(e) => {
                        setToken(e.target.value);
                        setError("");
                      }}
                      placeholder="your-vercel-access-token"
                      className="w-full px-3 py-2.5 pr-10 rounded-lg text-sm outline-none"
                      style={{
                        background: "var(--input-background)",
                        border: `1px solid ${error ? "var(--status-critical)" : "var(--border)"}`,
                        color: "var(--foreground)",
                        fontFamily: "var(--font-family-mono)",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowToken(!showToken)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-60"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      {showToken ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {error && (
                    <p
                      className="text-xs mt-1.5 flex items-center gap-1"
                      style={{ color: "var(--status-critical)" }}
                    >
                      <AlertCircle className="w-3 h-3" />
                      {error}
                    </p>
                  )}
                  <p
                    className="text-xs mt-1.5"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    Create a token in Vercel → Settings → Tokens with
                    &quot;Read&quot; scope.{" "}
                    <a
                      href="#"
                      className="underline hover:opacity-80"
                      style={{ color: "var(--primary)" }}
                    >
                      How to get your token{" "}
                      <ExternalLink className="w-3 h-3 inline" />
                    </a>
                  </p>
                </div>

                {/* Team ID (optional) */}
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Team ID{" "}
                    <span
                      className="text-xs font-normal"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      (optional)
                    </span>
                  </label>
                  <input
                    value={teamId}
                    onChange={(e) => setTeamId(e.target.value)}
                    placeholder="team_xxxxxxxx"
                    className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                    style={{
                      background: "var(--input-background)",
                      border: "1px solid var(--border)",
                      color: "var(--foreground)",
                      fontFamily: "var(--font-family-mono)",
                    }}
                  />
                  <p
                    className="text-xs mt-1.5"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    Leave blank for personal (Hobby) accounts
                  </p>
                </div>
              </div>
            </div>

            {/* Security note */}
            <div
              className="flex items-start gap-3 p-4 rounded-xl"
              style={{
                background: "rgba(16,185,129,0.06)",
                border: "1px solid rgba(16,185,129,0.15)",
              }}
            >
              <Shield
                className="w-4 h-4 flex-shrink-0 mt-0.5"
                style={{ color: "var(--primary)" }}
              />
              <div
                className="text-sm"
                style={{ color: "var(--muted-foreground)" }}
              >
                <span
                  className="font-medium"
                  style={{ color: "var(--foreground)" }}
                >
                  Your token stays secure.
                </span>{" "}
                It&apos;s encrypted with AES-256 at rest and never exposed in
                the UI, logs, or API responses. LimitLens only requests
                read-only access to your usage data.
              </div>
            </div>

            {/* Env vars reference */}
            <div
              className="p-5 rounded-xl border"
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Zap
                  className="w-4 h-4"
                  style={{ color: "var(--muted-foreground)" }}
                />
                <span className="text-sm font-medium">
                  Self-hosted environment variables
                </span>
              </div>
              <div
                className="rounded-lg p-3 text-xs leading-loose"
                style={{
                  background: "var(--secondary)",
                  fontFamily: "var(--font-family-mono)",
                  color: "#10b981",
                }}
              >
                DATABASE_URL=postgresql://...
                <br />
                ENCRYPTION_KEY=32-byte-hex-key
                <br />
                GMAIL_USER=your@gmail.com
                <br />
                GMAIL_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx
                <br />
                ALERT_TO_EMAIL=your@gmail.com
                <br />
                MONITOR_API_SECRET=random-secret-string
              </div>
            </div>

            {/* Connect button */}
            <button
              onClick={handleConnect}
              disabled={verifying}
              className="w-full py-3 rounded-lg font-medium transition-all hover:opacity-90 active:scale-95 flex items-center justify-center gap-2"
              style={{
                background: "var(--primary)",
                color: "var(--primary-foreground)",
                opacity: verifying ? 0.7 : 1,
              }}
            >
              {verifying ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Zap className="w-4 h-4" />
              )}
              {verifying ? "Connecting..." : "Connect Vercel Account"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
