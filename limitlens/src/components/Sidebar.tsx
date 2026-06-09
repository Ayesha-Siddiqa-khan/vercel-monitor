"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  FolderGit2,
  BarChart3,
  Bell,
  Settings,
  Zap,
  ExternalLink,
  ChevronRight,
  Circle,
} from "lucide-react";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { id: "projects", label: "Projects", icon: FolderGit2, href: "/projects" },
  { id: "history", label: "Usage History", icon: BarChart3, href: "/history" },
  { id: "alerts", label: "Alerts", icon: Bell, href: "/alerts" },
  { id: "settings", label: "Settings", icon: Settings, href: "/settings" },
];

interface SidebarProps {
  connected?: boolean;
  alertCount?: number;
}

export function Sidebar({ connected = false, alertCount = 0 }: SidebarProps) {
  const pathname = usePathname();

  const getCurrentPage = () => {
    if (pathname === "/dashboard") return "dashboard";
    if (pathname === "/projects") return "projects";
    if (pathname === "/history") return "history";
    if (pathname === "/alerts") return "alerts";
    if (pathname === "/settings" || pathname === "/setup") return "settings";
    return "dashboard";
  };

  const currentPage = getCurrentPage();

  return (
    <aside
      className="fixed left-0 top-0 h-screen w-[220px] flex flex-col z-40"
      style={{ background: "var(--sidebar)", borderRight: "1px solid var(--sidebar-border)" }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-5 py-5 border-b"
        style={{ borderColor: "var(--sidebar-border)" }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: "var(--primary)" }}
        >
          <span
            className="text-xs font-bold"
            style={{ color: "var(--primary-foreground)", fontFamily: "var(--font-family-mono)" }}
          >
            LL
          </span>
        </div>
        <span
          className="font-semibold tracking-tight"
          style={{ color: "var(--sidebar-accent-foreground)", letterSpacing: "-0.02em" }}
        >
          LimitLens
        </span>
      </div>

      {/* Connection status */}
      <div
        className="px-4 py-3 mx-3 mt-3 rounded-lg"
        style={{
          background: connected
            ? "rgba(16,185,129,0.08)"
            : "rgba(245,158,11,0.08)",
        }}
      >
        <div className="flex items-center gap-2">
          <Circle
            className="w-2 h-2 fill-current flex-shrink-0"
            style={{
              color: connected ? "var(--status-safe)" : "var(--status-warning)",
            }}
          />
          <span
            className="text-xs font-medium"
            style={{
              color: connected ? "var(--status-safe)" : "var(--status-warning)",
            }}
          >
            {connected ? "Vercel Connected" : "Not Connected"}
          </span>
        </div>
        {!connected && (
          <Link
            href="/settings"
            className="mt-1 text-xs flex items-center gap-1 hover:opacity-80 transition-opacity"
            style={{ color: "var(--status-warning)" }}
          >
            Connect now <ChevronRight className="w-3 h-3" />
          </Link>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ id, label, icon: Icon, href }) => {
          const active = currentPage === id;
          return (
            <Link
              key={id}
              href={href}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all group relative"
              style={{
                background: active ? "var(--sidebar-accent)" : "transparent",
                color: active ? "var(--sidebar-accent-foreground)" : "var(--sidebar-foreground)",
              }}
            >
              {active && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                  style={{ background: "var(--primary)" }}
                />
              )}
              <Icon
                className="w-4 h-4 flex-shrink-0"
                style={{
                  color: active ? "var(--primary)" : "var(--sidebar-foreground)",
                }}
              />
              <span className="flex-1 text-left">{label}</span>
              {id === "alerts" && alertCount > 0 && (
                <span
                  className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                  style={{
                    background: "var(--status-danger-bg)",
                    color: "var(--status-danger)",
                  }}
                >
                  {alertCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        className="px-3 py-4 border-t space-y-1"
        style={{ borderColor: "var(--sidebar-border)" }}
      >
        <Link
          href="/settings"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all hover:opacity-80"
          style={{ color: "var(--sidebar-foreground)" }}
        >
          <Zap className="w-4 h-4" />
          <span>Vercel Setup</span>
        </Link>
        <a
          href="#"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all hover:opacity-80"
          style={{ color: "var(--sidebar-foreground)" }}
        >
          <ExternalLink className="w-4 h-4" />
          <span>Docs</span>
        </a>

        {/* User */}
        <div className="flex items-center gap-3 px-3 py-2.5 mt-1">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold"
            style={{ background: "var(--muted)", color: "var(--foreground)" }}
          >
            A
          </div>
          <div className="flex-1 min-w-0">
            <div
              className="text-xs font-medium truncate"
              style={{ color: "var(--sidebar-accent-foreground)" }}
            >
              Alex Kim
            </div>
            <div
              className="text-xs truncate"
              style={{ color: "var(--sidebar-foreground)" }}
            >
              Hobby plan
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
