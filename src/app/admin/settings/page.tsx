"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Icons } from "@/components/icons";
import { Switch } from "@/components/ui/switch";

interface ERPNextConfig {
  url: string;
  api_key: string;
  api_secret: string;
  useMockData: boolean;
  syncInterval: number;
}

export default function SettingsPage() {
  const { toast } = useToast();
  const [config, setConfig] = useState<ERPNextConfig>({
    url: "",
    api_key: "",
    api_secret: "",
    useMockData: true,
    syncInterval: 15
  });
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [isElectronReady, setIsElectronReady] = useState(false);

  useEffect(() => {
    const checkElectron = () => {
      if (window.electron?.getERPNextConfig) {
        setIsElectronReady(true);
        loadConfig();
      } else {
        setTimeout(checkElectron, 100);
      }
    };
    checkElectron();
  }, []);

  const loadConfig = async () => {
    if (!isElectronReady) return;
    
    try {
      const result = await window.electron.getERPNextConfig();
      if (result.success && result.config) {
        setConfig({
          ...result.config,
          useMockData: result.config.useMockData ?? true,
          syncInterval: result.config.syncInterval ?? 15
        });
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
        toast({
          title: "Success",
          description: "Configuration saved successfully.",
        });
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

  const testConnection = async () => {
    try {
      setTesting(true);
      const result = await window.electron.testERPNextConnection(config);
      if (result.success) {
        toast({
          title: "Success",
          description: "Connection test successful.",
        });
      } else {
        throw new Error(result.error || "Connection test failed");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Connection test failed.",
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">ERPNext Settings</h1>
        <div className="flex items-center gap-2">
          <Switch
            id="mock-mode"
            checked={config.useMockData}
            onCheckedChange={(checked) => setConfig({ ...config, useMockData: checked })}
          />
          <Label htmlFor="mock-mode">Use Mock Data</Label>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Connection Details</CardTitle>
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

            <div className="space-y-2">
              <Label htmlFor="sync_interval">Sync Interval (minutes)</Label>
              <Input
                id="sync_interval"
                type="number"
                min="5"
                max="60"
                value={config.syncInterval}
                onChange={(e) => setConfig({ ...config, syncInterval: parseInt(e.target.value) || 15 })}
              />
            </div>

            <div className="flex gap-2">
              <Button
                className="flex-1"
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

              <Button
                variant="outline"
                onClick={testConnection}
                disabled={testing}
              >
                {testing ? (
                  <>
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  "Test Connection"
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
