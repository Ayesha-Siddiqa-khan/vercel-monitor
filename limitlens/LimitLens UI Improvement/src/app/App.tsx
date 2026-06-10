import { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { LandingPage } from "./components/LandingPage";
import { Dashboard } from "./components/Dashboard";
import { UsageHistory } from "./components/UsageHistory";
import { Projects } from "./components/Projects";
import { AlertsSettings } from "./components/AlertsSettings";
import { VercelSetup } from "./components/VercelSetup";

type Page = "landing" | "dashboard" | "history" | "projects" | "alerts" | "settings" | "setup";

export default function App() {
  /* MARKER-MAKE-KIT-INVOKED */
  const [page, setPage] = useState<Page>("landing");
  const [connected, setConnected] = useState(false);

  // Landing page occupies full screen (no sidebar)
  if (page === "landing") {
    return (
      <LandingPage
        onGetStarted={() => {
          if (connected) {
            setPage("dashboard");
          } else {
            setPage("setup");
          }
        }}
      />
    );
  }

  const renderPage = () => {
    switch (page) {
      case "dashboard": return <Dashboard />;
      case "history":   return <UsageHistory />;
      case "projects":  return <Projects />;
      case "alerts":    return <AlertsSettings />;
      case "settings":  return <VercelSetup onConnected={() => { setConnected(true); setPage("dashboard"); }} />;
      case "setup":     return <VercelSetup onConnected={() => { setConnected(true); setPage("dashboard"); }} />;
      default:          return <Dashboard />;
    }
  };

  // Map setup/settings to "settings" for sidebar active state
  const sidebarPage: Exclude<Page, "landing" | "setup"> =
    page === "setup" ? "settings" : (page as Exclude<Page, "landing" | "setup">);

  return (
    <div className="flex min-h-screen" style={{ background: "var(--background)" }}>
      <Sidebar
        currentPage={sidebarPage}
        onNavigate={(p) => setPage(p)}
        connected={connected}
        alertCount={3}
      />
      <main
        className="flex-1 overflow-y-auto"
        style={{ marginLeft: "220px", minHeight: "100vh" }}>
        {renderPage()}
      </main>
    </div>
  );
}
