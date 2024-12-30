"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Icons } from "@/components/icons";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  details?: any;
}

export default function LogsPage() {
  const { toast } = useToast();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    loadLogs();
    // Set up real-time log updates
    const interval = setInterval(loadLogs, 5000);
    return () => clearInterval(interval);
  }, [filter]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const result = await window.electron.getSystemLogs(filter);
      if (result.success && result.logs) {
        setLogs(result.logs);
      }
    } catch (error) {
      console.error("Failed to load logs:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load system logs.",
      });
    } finally {
      setLoading(false);
    }
  };

  const clearLogs = async () => {
    try {
      const result = await window.electron.clearSystemLogs();
      if (result.success) {
        setLogs([]);
        toast({
          title: "Success",
          description: "System logs cleared successfully.",
        });
      }
    } catch (error) {
      console.error("Failed to clear logs:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to clear system logs.",
      });
    }
  };

  const exportLogs = async () => {
    try {
      const result = await window.electron.exportSystemLogs();
      if (result.success) {
        toast({
          title: "Success",
          description: "System logs exported successfully.",
        });
      }
    } catch (error) {
      console.error("Failed to export logs:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to export system logs.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">System Logs</h1>
        <div className="flex items-center gap-2">
          <Select
            value={filter}
            onValueChange={setFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter logs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Logs</SelectItem>
              <SelectItem value="error">Errors</SelectItem>
              <SelectItem value="warn">Warnings</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="debug">Debug</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportLogs}>
            Export
          </Button>
          <Button variant="destructive" onClick={clearLogs}>
            Clear
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Log Entries</CardTitle>
          <CardDescription>System activity and error logs</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Icons.spinner className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log, index) => (
                  <TableRow key={index}>
                    <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                    <TableCell>
                      <span className={
                        log.level === 'error' ? 'text-red-500' :
                        log.level === 'warn' ? 'text-yellow-500' :
                        log.level === 'info' ? 'text-blue-500' :
                        'text-gray-500'
                      }>
                        {log.level.toUpperCase()}
                      </span>
                    </TableCell>
                    <TableCell>{log.message}</TableCell>
                    <TableCell>
                      {log.details && (
                        <pre className="text-xs">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
