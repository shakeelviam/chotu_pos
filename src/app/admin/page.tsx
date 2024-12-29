"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Icons } from "@/components/icons";

interface ERPNextConfig {
  url: string;
  api_key: string;
  api_secret: string;
}

export default function AdminPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [config, setConfig] = useState<ERPNextConfig>({ url: "", api_key: "", api_secret: "" });
  const [loading, setLoading] = useState(false);
  const [accessChecked, setAccessChecked] = useState(false);

  useEffect(() => {
    checkAccess();
    loadConfig();
  }, []);

  const checkAccess = async () => {
    try {
      const { success, user } = await window.electron.getCurrentUser();
      if (!success || !user || user.role !== "super_admin") {
        router.push("/");
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "Only super admins can access this page.",
        });
      }
      setAccessChecked(true);
    } catch (error) {
      console.error("Failed to check access:", error);
      router.push("/");
    }
  };

  const loadConfig = async () => {
    try {
      const result = await window.electron.getERPNextConfig();
      if (result.success && result.config) {
        setConfig(result.config);
      }
    } catch (error) {
      console.error("Failed to load config:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load ERPNext configuration.",
      });
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const result = await window.electron.saveERPNextConfig(config);
      if (result.success) {
        // Try to sync after saving config
        const syncResult = await window.electron.syncAll();
        if (syncResult.success) {
          toast({
            title: "Success",
            description: "Configuration saved and data synced successfully.",
          });
        } else {
          throw new Error(syncResult.error || "Sync failed");
        }
      }
    } catch (error: any) {
      console.error("Failed to save config:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save configuration.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!accessChecked) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Icons.spinner className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Admin Configuration</h1>
      <Card>
        <CardHeader>
          <CardTitle>ERPNext Configuration</CardTitle>
          <CardDescription>Configure your ERPNext instance connection details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url">ERPNext URL</Label>
              <Input
                id="url"
                placeholder="https://your-erpnext-instance.com"
                value={config.url}
                onChange={(e) => setConfig({ ...config, url: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="api_key">API Key</Label>
              <Input
                id="api_key"
                placeholder="Your API Key"
                value={config.api_key}
                onChange={(e) => setConfig({ ...config, api_key: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="api_secret">API Secret</Label>
              <Input
                id="api_secret"
                type="password"
                placeholder="Your API Secret"
                value={config.api_secret}
                onChange={(e) => setConfig({ ...config, api_secret: e.target.value })}
              />
            </div>

            <Button
              className="w-full"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Configuration"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
