"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--background)" }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "var(--primary)" }}
          >
            <span
              className="text-sm font-bold"
              style={{ color: "var(--primary-foreground)", fontFamily: "var(--font-family-mono)" }}
            >
              LL
            </span>
          </div>
          <span
            className="text-xl font-semibold tracking-tight"
            style={{ color: "var(--foreground)" }}
          >
            LimitLens
          </span>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8 border"
          style={{ background: "var(--card)", borderColor: "var(--border)" }}
        >
          <h1
            className="text-2xl font-semibold mb-2"
            style={{ color: "var(--foreground)" }}
          >
            Welcome back
          </h1>
          <p className="mb-6" style={{ color: "var(--muted-foreground)" }}>
            Sign in to monitor your Vercel usage
          </p>

          {error && (
            <div
              className="mb-4 p-3 rounded-lg text-sm"
              style={{ background: "var(--status-danger-bg)", color: "var(--status-danger)" }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--foreground)" }}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none transition-colors"
                style={{
                  background: "var(--background)",
                  borderColor: "var(--border)",
                  color: "var(--foreground)",
                }}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--foreground)" }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 pr-10 rounded-lg border text-sm outline-none transition-colors"
                  style={{
                    background: "var(--background)",
                    borderColor: "var(--border)",
                    color: "var(--foreground)",
                  }}
                  placeholder="Your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-opacity disabled:opacity-50"
              style={{
                background: "var(--primary)",
                color: "var(--primary-foreground)",
              }}
            >
              {loading ? "Signing in..." : "Sign In"}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <p className="mt-6 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-medium hover:opacity-80 transition-opacity"
              style={{ color: "var(--primary)" }}
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
