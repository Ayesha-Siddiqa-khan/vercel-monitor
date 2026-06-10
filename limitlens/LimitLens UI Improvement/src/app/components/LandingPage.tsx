import { Shield, Bell, BarChart3, Zap, ArrowRight, CheckCircle, AlertTriangle, TrendingUp, Eye } from "lucide-react";

interface LandingPageProps {
  onGetStarted: () => void;
}

const features = [
  {
    icon: Eye,
    title: "Real-time Usage Monitoring",
    description: "Track CPU hours, bandwidth, edge requests, and function invocations against your Vercel Hobby plan limits — updated every cycle.",
  },
  {
    icon: Bell,
    title: "Proactive Alerts Before You Hit Limits",
    description: "Get Gmail notifications at custom warning, danger, and critical thresholds — before Vercel cuts you off.",
  },
  {
    icon: BarChart3,
    title: "Usage History & Trends",
    description: "See how your resource consumption changes over time with clear visual charts. Spot patterns before they become problems.",
  },
  {
    icon: Shield,
    title: "Secure Token Storage",
    description: "Your Vercel access token is encrypted at rest and never exposed in the UI or logs.",
  },
];

const metrics = [
  { label: "Active CPU Hours", used: 67, limit: 100, unit: "hrs", status: "warning" },
  { label: "Edge Requests", used: 89, limit: 100, unit: "k", status: "danger" },
  { label: "Fast Data Transfer", used: 42, limit: 100, unit: "GB", status: "watch" },
  { label: "Function Invocations", used: 23, limit: 100, unit: "%", status: "safe" },
];

const statusColor: Record<string, string> = {
  safe: "var(--status-safe)",
  watch: "var(--status-watch)",
  warning: "var(--status-warning)",
  danger: "var(--status-danger)",
  critical: "var(--status-critical)",
};

export function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>

      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-4 border-b" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "var(--primary)" }}>
            <span className="text-xs font-bold" style={{ color: "var(--primary-foreground)", fontFamily: "var(--font-family-mono)" }}>LL</span>
          </div>
          <span className="font-semibold tracking-tight" style={{ letterSpacing: "-0.02em" }}>LimitLens</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#features" className="text-sm hover:opacity-80 transition-opacity" style={{ color: "var(--muted-foreground)" }}>Features</a>
          <a href="#how" className="text-sm hover:opacity-80 transition-opacity" style={{ color: "var(--muted-foreground)" }}>How it works</a>
          <button
            onClick={onGetStarted}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90 active:scale-95"
            style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
            Get Started Free
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-8 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-8"
          style={{ background: "rgba(16,185,129,0.1)", color: "var(--primary)", border: "1px solid rgba(16,185,129,0.2)" }}>
          <Zap className="w-3.5 h-3.5" />
          Built for Vercel Hobby plan users
        </div>

        <h1 className="max-w-3xl mx-auto mb-6" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.03em" }}>
          Monitor your Vercel limits{" "}
          <span style={{ color: "var(--primary)" }}>before they monitor you</span>
        </h1>

        <p className="text-lg max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
          LimitLens tracks every Vercel Hobby plan resource in real time and alerts you via Gmail
          when you're approaching limits — so you're never caught off guard mid-deployment.
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <button
            onClick={onGetStarted}
            className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all hover:opacity-90 active:scale-95"
            style={{ background: "var(--primary)", color: "var(--primary-foreground)", fontSize: "0.9375rem" }}>
            Connect Vercel Account
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onGetStarted}
            className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all hover:opacity-80"
            style={{ background: "var(--card)", color: "var(--foreground)", border: "1px solid var(--border)", fontSize: "0.9375rem" }}>
            View Demo Dashboard
          </button>
        </div>

        <p className="mt-4 text-xs" style={{ color: "var(--muted-foreground)" }}>
          Free to use · No credit card required · Your token stays encrypted
        </p>
      </section>

      {/* Dashboard preview */}
      <section className="max-w-5xl mx-auto px-8 pb-24">
        <div className="rounded-2xl overflow-hidden p-px" style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.3), rgba(6,182,212,0.1), rgba(16,185,129,0.05))" }}>
          <div className="rounded-2xl p-6" style={{ background: "var(--card)" }}>
            {/* Mini dashboard mockup */}
            <div className="flex items-center gap-2 mb-6">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#ef4444" }} />
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#f59e0b" }} />
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#10b981" }} />
              <div className="ml-4 text-xs font-medium" style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-family-mono)" }}>
                limitlens.app/dashboard
              </div>
            </div>

            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>Overall Health</div>
                <div className="flex items-center gap-3">
                  <div className="text-2xl font-semibold" style={{ color: "var(--status-warning)", fontFamily: "var(--font-family-mono)" }}>68</div>
                  <div className="px-2 py-0.5 rounded text-xs font-medium" style={{ background: "var(--status-warning-bg)", color: "var(--status-warning)" }}>Watch</div>
                </div>
              </div>
              <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>Synced 2 min ago</div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {metrics.map((m) => (
                <div key={m.label} className="p-3 rounded-xl" style={{ background: "var(--secondary)" }}>
                  <div className="text-xs mb-2 truncate" style={{ color: "var(--muted-foreground)" }}>{m.label}</div>
                  <div className="flex items-end justify-between mb-2">
                    <span className="text-sm font-semibold" style={{ fontFamily: "var(--font-family-mono)", color: statusColor[m.status] }}>
                      {m.used}{m.unit !== "%" ? "" : "%"}
                    </span>
                    <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{m.used}%</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--muted)" }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${m.used}%`, background: statusColor[m.status] }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 rounded-xl flex items-start gap-3" style={{ background: "var(--status-danger-bg)", border: "1px solid rgba(249,115,22,0.2)" }}>
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "var(--status-danger)" }} />
              <div>
                <div className="text-sm font-medium" style={{ color: "var(--status-danger)" }}>Edge Requests at 89% — Danger threshold crossed</div>
                <div className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>Alert sent to alex@gmail.com · 14 min ago</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-5xl mx-auto px-8 pb-24">
        <div className="text-center mb-12">
          <h2 className="mb-3" style={{ fontSize: "1.875rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
            Everything you need to stay under the limit
          </h2>
          <p style={{ color: "var(--muted-foreground)" }}>
            Purpose-built for Vercel Hobby plan users who can't afford surprises.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {features.map((f) => (
            <div key={f.title} className="p-6 rounded-xl border transition-all hover:border-opacity-60"
              style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-4"
                style={{ background: "rgba(16,185,129,0.1)" }}>
                <f.icon className="w-4.5 h-4.5" style={{ color: "var(--primary)" }} />
              </div>
              <h3 className="mb-2" style={{ fontSize: "1rem", fontWeight: 600 }}>{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="max-w-5xl mx-auto px-8 pb-24">
        <div className="text-center mb-12">
          <h2 className="mb-3" style={{ fontSize: "1.875rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
            Up and running in 2 minutes
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            { step: "01", title: "Connect Vercel", desc: "Paste your Vercel access token. We encrypt it immediately." },
            { step: "02", title: "Set Thresholds", desc: "Define warning, danger, and critical percentages for each resource." },
            { step: "03", title: "Relax & Monitor", desc: "LimitLens watches your usage and emails you before things get critical." },
          ].map((s) => (
            <div key={s.step} className="text-center">
              <div className="text-3xl font-bold mb-3" style={{ color: "var(--primary)", fontFamily: "var(--font-family-mono)" }}>{s.step}</div>
              <h3 className="mb-2" style={{ fontWeight: 600 }}>{s.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-8 pb-24">
        <div className="rounded-2xl p-12 text-center" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <TrendingUp className="w-8 h-8 mx-auto mb-4" style={{ color: "var(--primary)" }} />
          <h2 className="mb-3" style={{ fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
            Start monitoring for free
          </h2>
          <p className="mb-8" style={{ color: "var(--muted-foreground)" }}>
            No credit card. No install. Just connect your Vercel token and go.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {["Encrypted token storage", "Gmail alerts", "5-minute setup"].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
                <CheckCircle className="w-4 h-4" style={{ color: "var(--primary)" }} />
                {item}
              </div>
            ))}
          </div>
          <button
            onClick={onGetStarted}
            className="mt-8 flex items-center gap-2 px-8 py-3 rounded-lg font-medium mx-auto transition-all hover:opacity-90 active:scale-95"
            style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
            Connect Vercel Account
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-6 px-8 text-center text-xs" style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
        © 2026 LimitLens · Built for Vercel Hobby users · Your data stays yours
      </footer>
    </div>
  );
}
