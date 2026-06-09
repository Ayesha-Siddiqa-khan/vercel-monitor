import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LimitLens - Vercel Hobby Usage Monitor",
  description: "Monitor your Vercel Hobby plan usage and stay within free limits",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-gray-100 min-h-screen">
        <nav className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">LL</div>
                <span className="text-lg font-semibold text-white">LimitLens</span>
              </div>
              <div className="flex gap-6 text-sm text-gray-400">
                <a href="/dashboard" className="hover:text-white transition-colors">Dashboard</a>
                <a href="/projects" className="hover:text-white transition-colors">Projects</a>
                <a href="/alerts" className="hover:text-white transition-colors">Alerts</a>
                <a href="/settings" className="hover:text-white transition-colors">Settings</a>
              </div>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
      </body>
    </html>
  );
}
