"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Icons } from "@/components/icons";
import { useToast } from "@/components/ui/use-toast";

export default function AdminPage() {
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const { success, user } = await window.electron.getCurrentUser();
        if (!success || !user) {
          router.push("/admin/login");
          return;
        }
        
        if (user.role !== "super_admin") {
          toast({
            variant: "destructive",
            title: "Access Denied",
            description: "Only super admins can access this page.",
          });
          router.push("/");
          return;
        }
        
        router.push("/admin/settings");
      } catch (error) {
        console.error("Failed to check access:", error);
        router.push("/admin/login");
      }
    };

    checkAccess();
  }, [router, toast]);

  return (
    <div className="h-screen flex items-center justify-center">
      <Icons.spinner className="h-8 w-8 animate-spin" />
    </div>
  );
}
