"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { LayoutDashboard, Upload, FileText, LogOut } from "lucide-react";
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

export function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col h-full w-60 shrink-0 border-r bg-card overflow-hidden"
    >
      <div className="p-6 min-w-0">
        <Link href="/dashboard">
          <h1 className="text-xl font-bold truncate">DocDigitize</h1>
        </Link>
      </div>

      <Separator />

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto min-w-0">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors min-w-0",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.title}</span>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <Separator />

      <div className="p-4 min-w-0">
        <motion.div whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-muted-foreground min-w-0"
            onClick={logout}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span className="truncate">Logout</span>
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}