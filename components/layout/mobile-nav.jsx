"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Menu, LayoutDashboard, Upload, FileText, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Upload",
    href: "/upload",
    icon: Upload,
  },
  {
    title: "Documents",
    href: "/documents",
    icon: FileText,
  },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { logout } = useAuth();

  const handleLogout = () => {
    setOpen(false);
    logout();
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden shrink-0">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-60 p-0 overflow-hidden">
        <div className="flex flex-col h-full overflow-hidden">
          <div className="p-6 min-w-0">
            <h1 className="text-xl font-bold truncate">DocDigitize</h1>
          </div>

          <Separator />

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto min-w-0">
            {navItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                >
                  <div
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors min-w-0",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{item.title}</span>
                  </div>
                </Link>
              );
            })}
          </nav>

          <Separator />

          <div className="p-4 min-w-0">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-muted-foreground min-w-0"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span className="truncate">Logout</span>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}