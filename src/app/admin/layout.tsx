"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRouter, usePathname } from "next/navigation";
import {
  Settings,
  Users,
  Database,
  Activity,
  LogOut,
} from "lucide-react";
import { Icons } from "@/components/icons";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState("settings");

  // Don't render admin layout for login page
  if (pathname === "/admin/login") {
    return children;
  }

  const handleLogout = async () => {
    try {
      await window.electron.logout();
      router.push("/admin/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const navigation = [
    {
      name: "ERPNext Settings",
      href: "/admin/settings",
      icon: Settings,
      id: "settings",
    },
    {
      name: "Role Management",
      href: "/admin/roles",
      icon: Users,
      id: "roles",
    },
    {
      name: "System Settings",
      href: "/admin/system",
      icon: Database,
      id: "system",
    },
    {
      name: "Logs",
      href: "/admin/logs",
      icon: Activity,
      id: "logs",
    },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r">
        <div className="h-16 flex items-center px-4 border-b">
          <h1 className="text-lg font-semibold">Admin Panel</h1>
        </div>
        <nav className="p-4 space-y-2">
          {navigation.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              className={cn(
                "w-full justify-start gap-2",
                activeTab === item.id && "bg-blue-50 text-blue-600"
              )}
              onClick={() => {
                setActiveTab(item.id);
                router.push(item.href);
              }}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Button>
          ))}
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </nav>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
