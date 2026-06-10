import { useState } from "react";
import {
  RefreshCw, ExternalLink, Clock, GitBranch, CheckCircle,
  AlertTriangle, Circle, Search, Filter, Plus,
} from "lucide-react";

interface Project {
  id: string;
  name: string;
  framework: string;
  env: string;
  createdAt: string;
  updatedAt: string;
  url: string;
  healthStatus: "healthy" | "watch" | "warning" | "danger";
  deployments: number;
  metrics: { cpu: number; edge: number; bandwidth: number };
}

const STATUS_META = {
  healthy: { label: "Healthy",  color: "var(--status-safe)",    bg: "var(--status-safe-bg)" },
  watch:   { label: "Watch",    color: "var(--status-watch)",   bg: "var(--status-watch-bg)" },
  warning: { label: "Warning",  color: "var(--status-warning)", bg: "var(--status-warning-bg)" },
  danger:  { label: "Danger",   color: "var(--status-danger)",  bg: "var(--status-danger-bg)" },
} as const;

const PROJECTS: Project[] = [
  {
    id: "1", name: "limitlens", framework: "Next.js", env: "production",
    createdAt: "Jun 9, 2026", updatedAt: "Jun 9, 2026", url: "limitlens.vercel.app",
    healthStatus: "danger", deployments: 14,
    metrics: { cpu: 67, edge: 89, bandwidth: 85 },
  },
  {
    id: "2", name: "mc-qs-ultimate", framework: "Services", env: "production",
    createdAt: "Jun 9, 2026", updatedAt: "Jun 9, 2026", url: "mc-qs-ultimate.vercel.app",
    healthStatus: "warning", deployments: 8,
    metrics: { cpu: 45, edge: 52, bandwidth: 38 },
  },
  {
    id: "3", name: "water-supply-reports", framework: "Flask", env: "production",
    createdAt: "Jun 2, 2026", updatedAt: "Jun 5, 2026", url: "water-supply-reports.vercel.app",
    healthStatus: "watch", deployments: 3,
    metrics: { cpu: 22, edge: 31, bandwidth: 18 },
  },
  {
    id: "4", name: "portfolio-2026", framework: "Vite", env: "production",
    createdAt: "May 18, 2026", updatedAt: "Jun 1, 2026", url: "alex-kim.vercel.app",
    healthStatus: "healthy", deployments: 22,
    metrics: { cpu: 8, edge: 12, bandwidth: 6 },
  },
];

function MiniBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "var(--muted)" }}>
        <div className="h-full rounded-full" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="text-xs w-8 text-right" style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-family-mono)" }}>{value}%</span>
    </div>
  );
}

export function Projects() {
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const filtered = PROJECTS.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.framework.toLowerCase().includes(search.toLowerCase())
  );

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.02em" }}>Projects</h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
            {PROJECTS.length} connected Vercel projects · Monitoring active
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium border transition-all hover:opacity-80 active:scale-95"
            style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--foreground)" }}>
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Projects", value: PROJECTS.length, color: "var(--foreground)" },
          { label: "Healthy", value: PROJECTS.filter(p => p.healthStatus === "healthy").length, color: "var(--status-safe)" },
          { label: "Needs Attention", value: PROJECTS.filter(p => ["warning", "danger"].includes(p.healthStatus)).length, color: "var(--status-warning)" },
          { label: "At Risk", value: PROJECTS.filter(p => p.healthStatus === "danger").length, color: "var(--status-danger)" },
        ].map(s => (
          <div key={s.label} className="p-3.5 rounded-xl border text-center"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <div className="text-xl font-bold mb-0.5" style={{ fontFamily: "var(--font-family-mono)", color: s.color }}>{s.value}</div>
            <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--muted-foreground)" }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="w-full pl-9 pr-3 py-2 rounded-lg text-sm outline-none"
            style={{ background: "var(--input-background)", border: "1px solid var(--border)", color: "var(--foreground)" }} />
        </div>
        <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-all hover:opacity-80"
          style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--muted-foreground)" }}>
          <Filter className="w-3.5 h-3.5" />
          Filter
        </button>
      </div>

      {/* Projects list */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 rounded-xl border" style={{ border: "1px solid var(--border)" }}>
          <Search className="w-10 h-10 mx-auto mb-3" style={{ color: "var(--muted-foreground)" }} />
          <div className="font-medium mb-1">No projects found</div>
          <div className="text-sm" style={{ color: "var(--muted-foreground)" }}>Try adjusting your search</div>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((project) => {
            const meta = STATUS_META[project.healthStatus];
            return (
              <div key={project.id}
                className="p-5 rounded-xl border transition-all hover:border-opacity-60"
                style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  {/* Left: name + badges */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-2">
                      <h3 className="font-semibold" style={{ fontFamily: "var(--font-family-mono)", fontSize: "0.9375rem" }}>
                        {project.name}
                      </h3>
                      <span className="px-2 py-0.5 rounded text-xs font-medium"
                        style={{ background: "var(--secondary)", color: "var(--muted-foreground)" }}>
                        {project.framework}
                      </span>
                      <span className="px-2 py-0.5 rounded text-xs font-medium"
                        style={{ background: "var(--secondary)", color: "var(--muted-foreground)" }}>
                        {project.env}
                      </span>
                      <span className="px-2 py-0.5 rounded text-xs font-medium"
                        style={{ background: meta.bg, color: meta.color }}>
                        {meta.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-5 text-xs mb-4 flex-wrap" style={{ color: "var(--muted-foreground)" }}>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        Created {project.createdAt}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        Updated {project.updatedAt}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <GitBranch className="w-3 h-3" />
                        {project.deployments} deployments
                      </span>
                      <a href={`https://${project.url}`} className="flex items-center gap-1.5 hover:opacity-80" style={{ color: "var(--primary)" }}>
                        <ExternalLink className="w-3 h-3" />
                        {project.url}
                      </a>
                    </div>

                    {/* Mini metric bars */}
                    <div className="grid grid-cols-3 gap-x-6 gap-y-2">
                      {[
                        { label: "CPU", value: project.metrics.cpu, threshold: 75 },
                        { label: "Edge", value: project.metrics.edge, threshold: 75 },
                        { label: "Bandwidth", value: project.metrics.bandwidth, threshold: 75 },
                      ].map(m => {
                        const barColor = m.value >= 85 ? "var(--status-danger)" :
                          m.value >= 75 ? "var(--status-warning)" :
                          m.value >= 50 ? "var(--status-watch)" : "var(--status-safe)";
                        return (
                          <div key={m.label}>
                            <div className="text-xs mb-1" style={{ color: "var(--muted-foreground)" }}>{m.label}</div>
                            <MiniBar value={m.value} color={barColor} />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right: health indicator */}
                  <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-2 flex-shrink-0">
                    <div className="flex items-center gap-1.5 text-xs" style={{ color: meta.color }}>
                      {project.healthStatus === "healthy" ?
                        <CheckCircle className="w-4 h-4" /> :
                        <AlertTriangle className="w-4 h-4" />
                      }
                      {meta.label}
                    </div>
                    {project.healthStatus !== "healthy" && (
                      <div className="text-xs" style={{ color: "var(--muted-foreground)" }}>Alerts active</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state hint */}
      <div className="mt-6 p-4 rounded-xl border flex items-start gap-3"
        style={{ border: "1px solid var(--border)", background: "transparent" }}>
        <Plus className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "var(--muted-foreground)" }} />
        <div>
          <div className="text-sm font-medium">Want to track more projects?</div>
          <div className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
            Projects are automatically detected from your connected Vercel account.
            All projects on your Hobby plan are monitored together against shared limits.
          </div>
        </div>
      </div>
    </div>
  );
}
