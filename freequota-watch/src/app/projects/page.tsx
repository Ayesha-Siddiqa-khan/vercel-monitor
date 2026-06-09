"use client";

export default function ProjectsPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-2">Projects</h1>
      <p className="text-gray-400 text-sm mb-8">Connected Vercel projects</p>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
        <p className="text-gray-400">Project listing will appear after connecting your Vercel account and running the monitor.</p>
        <p className="text-gray-500 text-sm mt-2">The collector will fetch your project list and display it here.</p>
      </div>
    </div>
  );
}
