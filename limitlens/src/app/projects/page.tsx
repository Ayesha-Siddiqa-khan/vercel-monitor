"use client";

import { useEffect, useState } from "react";
import {
  RefreshCw,
  ExternalLink,
  Clock,
  GitBranch,
  CheckCircle,
  AlertTriangle,
  Search,
} from "lucide-react";
import { Sidebar } from "@/components/Sidebar";

interface Project {
  id: string;
  name: string;
  framework: string | null;
  createdAt: string;
  updatedAt: string;
  targets: string[];
  vercelUrl: string;
  latestDeployment: {
    url: string;
    createdAt: string;
    state: string;
  } | null;
}

const STATUS_META = {
  healthy: { label: "Healthy", color: "var(--status-safe)", bg: "var(--status-safe-bg)" },
  watch: { label: "Watch", color: "var(--status-watch)", bg: "var(--status-watch-bg)" },
  warning: { label: "Warning", color: "var(--status-warning)", bg: "var(--status-warning-bg)" },
  danger: { label: "Danger", color: "var(--status-danger)", bg: "var(--status-danger-bg)" },
} as const;

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

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const userId = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    try {
      const res = await fetch(`/api/projects?userId=${userId}`);
      const data = await res.json();
      setProjects(data.projects || []);
      setConnected(data.connected || false);
      if (data.error) setError(data.error);
    } catch {
      setError("Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  }

  const handleRefresh = () => {
    setRefreshing(true);
    setLoading(true);
    setError(null);
    fetchProjects().finally(() => setRefreshing(false));
  };

  const filtered = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.framework || "").toLowerCase().includes(search.toLowerCase())
  );

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function getStateColor(state: string) {
    switch (state?.toLowerCase()) {
      case "ready": return "var(--status-safe)";
      case "building": return "var(--status-warning)";
      case "queued": return "var(--status-watch)";
      case "error": return "var(--status-critical)";
      default: return "var(--muted-foreground)";
    }
  }

  return (
    <div className="flex min-h-screen" style={{ background: "var(--background)" }}>
      <Sidebar connected={connected} />
      <main className="flex-1 ml-[220px] p-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.02em" }}>Projects</h1>
            <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
              {projects.length} connected Vercel projects · Monitoring active
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium border transition-all hover:opacity-80 active:scale-95"
              style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--foreground)" }}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Summary row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total Projects", value: projects.length, color: "var(--foreground)" },
            { label: "Ready", value: projects.filter((p) => p.latestDeployment?.state === "ready").length, color: "var(--status-safe)" },
            { label: "Building", value: projects.filter((p) => p.latestDeployment?.state === "building").length, color: "var(--status-warning)" },
            { label: "Errors", value: projects.filter((p) => p.latestDeployment?.state === "error").length, color: "var(--status-critical)" },
          ].map((s) => (
            <div key={s.label} className="p-3.5 rounded-xl border text-center" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
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
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="w-full pl-9 pr-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: "var(--input-background)", border: "1px solid var(--border)", color: "var(--foreground)" }}
            />
          </div>
        </div>

        {loading && !refreshing && (
          <div className="text-center py-20" style={{ color: "var(--muted-foreground)" }}>
            Loading projects...
          </div>
        )}

        {!loading && !connected && (
          <div className="p-12 rounded-xl text-center" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <p style={{ color: "var(--muted-foreground)" }}>No Vercel account connected.</p>
            <p className="text-sm mt-2" style={{ color: "var(--muted-foreground)" }}>
              Go to Settings and connect your Vercel account first.
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="p-12 rounded-xl text-center" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <p style={{ color: "var(--status-critical)" }}>{error}</p>
            <button
              onClick={fetchProjects}
              className="mt-4 px-4 py-2 rounded-lg text-sm"
              style={{ background: "var(--secondary)", color: "var(--foreground)" }}
            >
              Retry
            </button>
          </div>
        )}

        {!loading && connected && filtered.length === 0 && (
          <div className="text-center py-20 rounded-xl border" style={{ border: "1px solid var(--border)" }}>
            <Search className="w-10 h-10 mx-auto mb-3" style={{ color: "var(--muted-foreground)" }} />
            <div className="font-medium mb-1">No projects found</div>
            <div className="text-sm" style={{ color: "var(--muted-foreground)" }}>Try adjusting your search</div>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map((project) => {
              const state = project.latestDeployment?.state?.toLowerCase() || "unknown";
              const stateColor = getStateColor(state);
              return (
                <div key={project.id} className="p-5 rounded-xl border transition-all hover:border-opacity-60" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap mb-2">
                        <h3 className="font-semibold" style={{ fontFamily: "var(--font-family-mono)", fontSize: "0.9375rem" }}>
                          {project.name}
                        </h3>
                        {project.framework && (
                          <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ background: "var(--secondary)", color: "var(--muted-foreground)" }}>
                            {project.framework}
                          </span>
                        )}
                        {project.targets.length > 0 && (
                          <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ background: "var(--secondary)", color: "var(--muted-foreground)" }}>
                            {project.targets[0]}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-5 text-xs mb-4 flex-wrap" style={{ color: "var(--muted-foreground)" }}>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3" />
                          Created {formatDate(project.createdAt)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3" />
                          Updated {formatDate(project.updatedAt)}
                        </span>
                        {project.latestDeployment && (
                          <span className="flex items-center gap-1.5" style={{ color: stateColor }}>
                            <GitBranch className="w-3 h-3" />
                            {project.latestDeployment.state}
                          </span>
                        )}
                        <a href={project.vercelUrl} className="flex items-center gap-1.5 hover:opacity-80" style={{ color: "var(--primary)" }} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-3 h-3" />
                          Vercel Dashboard
                        </a>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-2 flex-shrink-0">
                      <div className="flex items-center gap-1.5 text-xs" style={{ color: stateColor }}>
                        {state === "ready" ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                        {state === "ready" ? "Healthy" : state === "building" ? "Building" : state === "error" ? "Error" : "Unknown"}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty state hint */}
        <div className="mt-6 p-4 rounded-xl border flex items-start gap-3" style={{ border: "1px solid var(--border)", background: "transparent" }}>
          <div>
            <div className="text-sm font-medium">Want to track more projects?</div>
            <div className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
              Projects are automatically detected from your connected Vercel account.
              All projects on your Hobby plan are monitored together against shared limits.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
