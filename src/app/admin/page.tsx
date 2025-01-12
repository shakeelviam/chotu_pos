"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Icons } from "@/components/icons";


export default function AdminPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [erpUrl, setErpUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");

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

  const handleSave = () => {
    localStorage.setItem("ERP_URL", erpUrl);
    localStorage.setItem("API_KEY", apiKey);
    localStorage.setItem("API_SECRET", apiSecret);
    toast({
      variant: "success",
      title: "Configuration Saved",
      description: "ERPNext configuration has been saved successfully.",
    });
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <Icons.spinner className="h-8 w-8 animate-spin mb-4" />
      <div className="w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Admin Configuration</h2>
        <input
          type="text"
          placeholder="ERPNext URL"
          value={erpUrl}
          onChange={(e) => setErpUrl(e.target.value)}
          className="mb-2 p-2 border rounded w-full"
        />
        <input
          type="text"
          placeholder="API Key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="mb-2 p-2 border rounded w-full"
        />
        <input
          type="text"
          placeholder="API Secret"
          value={apiSecret}
          onChange={(e) => setApiSecret(e.target.value)}
          className="mb-4 p-2 border rounded w-full"
        />
        <button
          onClick={handleSave}
          className="bg-blue-500 text-white p-2 rounded w-full"
        >
          Save
        </button>
      </div>
    </div>
  );
}
