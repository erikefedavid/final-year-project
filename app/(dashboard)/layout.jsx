"use client";

import { useAuth } from "@/context/auth-context";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import Loader from "@/components/shared/loading-spinner";
import { ErrorBoundary } from "@/components/shared/error-boundary";

export default function DashboardLayout({ children }) {
  const { loading } = useAuth();

  if (loading) {
    return <Loader text="Loading your dashboard..." />;
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-4 md:p-6">
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
      </div>
    </div>
  );
}