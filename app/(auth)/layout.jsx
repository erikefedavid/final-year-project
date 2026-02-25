"use client";

import { useAuth } from "@/context/auth-context";
import  Loader from "@/components/shared/loading-spinner";

export default function AuthLayout({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader/>;
  }

  if (user) {
    return <Loader text="Redirecting..." />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        {children}
      </div>
    </div>
  );
}