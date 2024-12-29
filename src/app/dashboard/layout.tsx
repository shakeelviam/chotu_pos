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

interface WindowWithElectron extends Window {
  electron?: {
    minimize: () => void;
    maximize: () => void;
    close: () => void;
    syncInventory: () => Promise<void>;
    logout: () => Promise<void>;
  };
}

declare const window: WindowWithElectron;

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
      {/* Custom Title Bar */}
      <div className="h-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b flex items-center justify-between draggable">
        {/* Left section */}
        <div className="flex items-center px-3 gap-2">
          <span className="text-sm font-medium">Chotu POS</span>
        </div>

        {/* Center section - make it draggable */}
        <div className="flex-1 h-full draggable"></div>

        {/* Right section - window controls */}
        <div className="flex items-center h-full">
          {/* Sync button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-none"
            onClick={handleSync}
            disabled={isSyncing}
          >
            {isSyncing && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            <RefreshCw className="h-4 w-4" />
          </Button>

          {/* Cart */}
          <Link href="/pos">
            <Button 
              variant="ghost" 
              size="icon"
              className="relative h-10 w-10 rounded-none"
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
                0
              </span>
            </Button>
          </Link>

          {/* Window controls */}
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-none hover:bg-accent"
            onClick={handleMinimize}
          >
            <Minus className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-none hover:bg-accent"
            onClick={handleMaximize}
          >
            <Square className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-none hover:bg-destructive"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Logout */}
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-none hover:bg-accent"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 container py-6">
        {children}
      </main>
    </div>
  );
}
