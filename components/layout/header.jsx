"use client";

import { useAuth } from "@/context/auth-context";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Header() {
  const { user } = useAuth();

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-10 h-16 border-b bg-card flex items-center justify-between px-4 md:px-6 min-w-0 overflow-hidden">
      {/* Left side */}
      <div className="flex items-center gap-2 shrink-0">
        <MobileNav />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3 min-w-0">
        <ThemeToggle />
        
        <div className="flex items-center gap-2 min-w-0">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="text-xs">
              {getInitials(user?.name)}
            </AvatarFallback>
          </Avatar>
          
          <span className="text-sm font-medium hidden sm:inline-block truncate max-w-[150px]">
            {user?.name}
          </span>
        </div>
      </div>
    </header>
  );
}