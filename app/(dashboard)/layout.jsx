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
    <div className="min-h-screen flex overflow-hidden max-w-[100vw]">
      {/* Sidebar - shrink-0 prevents it from being squished */}
      <div className="hidden md:flex shrink-0">
        <Sidebar />
      </div>

      {/* Main content wrapper - min-w-0 is CRITICAL */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        
        {/* Scrollable content area */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto overflow-x-hidden min-w-0">
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
      </div>
    </div>
  );
}