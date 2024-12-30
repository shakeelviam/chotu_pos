"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Icons } from "@/components/icons";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SystemConfig {
  offlineMode: {
    enabled: boolean;
    maxStorage: number;
    syncPriority: string[];
  };
  backup: {
    enabled: boolean;
    frequency: number;
    retentionDays: number;
  };
  debug: {
    enabled: boolean;
    logLevel: string;
  };
}

export default function SystemPage() {
  const { toast } = useToast();
  const [config, setConfig] = useState<SystemConfig>({
    offlineMode: {
      enabled: true,
      maxStorage: 1000,
      syncPriority: ['transactions', 'items', 'customers'],
    },
    backup: {
      enabled: true,
      frequency: 24,
      retentionDays: 7,
    },
    debug: {
      enabled: false,
      logLevel: 'info',
    },
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const result = await window.electron.getSystemConfig();
      if (result.success && result.config) {
        setConfig(result.config);
      }
    } catch (error) {
      console.error("Failed to load config:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load system configuration.",
      });
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const result = await window.electron.saveSystemConfig(config);
      if (result.success) {
        toast({
          title: "Success",
          description: "System configuration saved successfully.",
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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">System Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Offline Mode</CardTitle>
          <CardDescription>Configure offline operation settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="offline-mode">Enable Offline Mode</Label>
              <Switch
                id="offline-mode"
                checked={config.offlineMode.enabled}
                onCheckedChange={(checked) => 
                  setConfig(prev => ({
                    ...prev,
                    offlineMode: { ...prev.offlineMode, enabled: checked }
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max-storage">Maximum Storage (MB)</Label>
              <Input
                id="max-storage"
                type="number"
                value={config.offlineMode.maxStorage}
                onChange={(e) => 
                  setConfig(prev => ({
                    ...prev,
                    offlineMode: { ...prev.offlineMode, maxStorage: parseInt(e.target.value) || 1000 }
                  }))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Backup Settings</CardTitle>
          <CardDescription>Configure automatic backup settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="backup-enabled">Enable Auto Backup</Label>
              <Switch
                id="backup-enabled"
                checked={config.backup.enabled}
                onCheckedChange={(checked) => 
                  setConfig(prev => ({
                    ...prev,
                    backup: { ...prev.backup, enabled: checked }
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="backup-frequency">Backup Frequency (hours)</Label>
              <Input
                id="backup-frequency"
                type="number"
                value={config.backup.frequency}
                onChange={(e) => 
                  setConfig(prev => ({
                    ...prev,
                    backup: { ...prev.backup, frequency: parseInt(e.target.value) || 24 }
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="retention-days">Retention Period (days)</Label>
              <Input
                id="retention-days"
                type="number"
                value={config.backup.retentionDays}
                onChange={(e) => 
                  setConfig(prev => ({
                    ...prev,
                    backup: { ...prev.backup, retentionDays: parseInt(e.target.value) || 7 }
                  }))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Debug Settings</CardTitle>
          <CardDescription>Configure debugging and logging options</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="debug-mode">Enable Debug Mode</Label>
              <Switch
                id="debug-mode"
                checked={config.debug.enabled}
                onCheckedChange={(checked) => 
                  setConfig(prev => ({
                    ...prev,
                    debug: { ...prev.debug, enabled: checked }
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="log-level">Log Level</Label>
              <Select
                value={config.debug.logLevel}
                onValueChange={(value) => 
                  setConfig(prev => ({
                    ...prev,
                    debug: { ...prev.debug, logLevel: value }
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select log level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="warn">Warning</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="debug">Debug</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? (
            <>
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Settings"
          )}
        </Button>
      </div>
    </div>
  );
}
