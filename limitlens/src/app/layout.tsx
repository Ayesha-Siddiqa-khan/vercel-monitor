import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

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
      <body style={{ background: "var(--background)", color: "var(--foreground)", fontFamily: "var(--font-family-sans)" }}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
