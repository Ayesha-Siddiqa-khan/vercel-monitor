"use client";

import { useEffect, useState } from "react";

interface Project {
  id: string;
  name: string;
  framework: string | null;
  createdAt: string;
  updatedAt: string;
  targets: string[];
  latestDeployment: {
    url: string;
    createdAt: string;
    state: string;
  } | null;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    try {
      const res = await fetch("/api/projects?userId=a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11");
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

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function getStateColor(state: string) {
    switch (state?.toLowerCase()) {
      case "ready": return "text-emerald-400";
      case "building": return "text-yellow-400";
      case "queued": return "text-blue-400";
      case "error": return "text-red-400";
      default: return "text-gray-400";
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Projects</h1>
          <p className="text-gray-400 text-sm">Connected Vercel projects</p>
        </div>
        <button
          onClick={() => { setLoading(true); fetchProjects(); }}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm transition-colors"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-500">Loading projects...</div>
      ) : !connected ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
          <p className="text-gray-400">No Vercel account connected.</p>
          <p className="text-gray-500 text-sm mt-2">Go to Settings and connect your Vercel account first.</p>
        </div>
      ) : error ? (
        <div className="bg-gray-900 border border-red-800 rounded-xl p-12 text-center">
          <p className="text-red-400">{error}</p>
          <button
            onClick={fetchProjects}
            className="mt-4 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm"
          >
            Retry
          </button>
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
          <p className="text-gray-400">No projects found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h3 className="font-medium text-white">{project.name}</h3>
                  {project.framework && (
                    <span className="px-2 py-0.5 bg-gray-800 text-gray-400 text-xs rounded">
                      {project.framework}
                    </span>
                  )}
                </div>
                {project.latestDeployment && (
                  <span className={`text-xs font-medium ${getStateColor(project.latestDeployment.state)}`}>
                    {project.latestDeployment.state}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <span>Created {formatDate(project.createdAt)}</span>
                <span>Updated {formatDate(project.updatedAt)}</span>
                {project.targets.length > 0 && (
                  <span>{project.targets.join(", ")}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
