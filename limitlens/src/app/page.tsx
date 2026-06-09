export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
      <div className="w-20 h-20 bg-emerald-500 rounded-2xl flex items-center justify-center text-white font-bold text-3xl mb-6">
        LL
      </div>
      <h1 className="text-4xl font-bold text-white mb-4">LimitLens</h1>
      <p className="text-gray-400 text-lg max-w-2xl mb-8">
        Monitor your Vercel Hobby plan usage. Stay within free limits.
        Get proactive Gmail alerts before you hit dangerous levels.
      </p>
      <div className="flex gap-4">
        <a
          href="/dashboard"
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors"
        >
          View Dashboard
        </a>
        <a
          href="/settings"
          className="px-6 py-3 border border-gray-700 hover:border-gray-500 text-gray-300 rounded-lg font-medium transition-colors"
        >
          Connect Vercel
        </a>
      </div>
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-left">
          <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 mb-3">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          </div>
          <h3 className="font-semibold text-white mb-1">Usage Tracking</h3>
          <p className="text-sm text-gray-400">Monitor CPU, edge requests, functions, bandwidth, and more</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-left">
          <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center text-amber-400 mb-3">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          </div>
          <h3 className="font-semibold text-white mb-1">Smart Alerts</h3>
          <p className="text-sm text-gray-400">Gmail alerts before you hit warning, danger, and critical levels</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-left">
          <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-400 mb-3">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <h3 className="font-semibold text-white mb-1">Secure & Private</h3>
          <p className="text-sm text-gray-400">Vercel tokens encrypted at rest, never exposed in logs or UI</p>
        </div>
      </div>
    </div>
  );
}
