"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import Link from "next/link";
import { 
  LogOut, 
  ShoppingCart, 
  RefreshCw, 
  Minus, 
  Square, 
  X,
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      if (window.electron?.syncInventory) {
        await window.electron.syncInventory();
      }
    } catch (error) {
      console.error("Sync failed:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (window.electron?.logout) {
        await window.electron.logout();
        router.push("/");
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleMinimize = () => {
    if (window.electron?.minimize) {
      window.electron.minimize();
    }
  };

  const handleMaximize = () => {
    if (window.electron?.maximize) {
      window.electron.maximize();
    }
  };

  const handleClose = () => {
    if (window.electron?.close) {
      window.electron.close();
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Main Content */}
      <main className="flex-1 container py-6">
        {children}
      </main>
    </div>
  );
}
