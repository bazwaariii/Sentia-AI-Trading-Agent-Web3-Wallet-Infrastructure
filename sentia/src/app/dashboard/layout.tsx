import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard — Sentia",
  description: "Monitor your AI agent spending, manage limits, and approve transactions.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
