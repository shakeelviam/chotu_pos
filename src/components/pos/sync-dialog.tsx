"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Icons } from "@/components/icons";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from 'date-fns';

interface SyncDialogProps {
  open: boolean;
  onClose: () => void;
}

type SyncStatus = {
  entity_type: string;
  last_sync_time: string;
  last_sync_status: string;
  error_message: string | null;
};

type PendingCount = {
  entity_type: string;
  count: number;
};

export function SyncDialog({ open, onClose }: SyncDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus[]>([]);
  const [pendingCounts, setPendingCounts] = useState<PendingCount[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchStatus();
    }
  }, [open]);

  const fetchStatus = async () => {
    try {
      const result = await window.electron.invoke('sync:status');
      if (result.success) {
        setSyncStatus(result.status);
        setPendingCounts(result.pendingCounts);
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to fetch sync status",
      });
    }
  };

  const handleSync = async (entityType: string = 'all') => {
    setIsLoading(true);
    try {
      const result = await window.electron.invoke('sync:force', entityType);
      if (result.success) {
        toast({
          title: "Success",
          description: "Sync completed successfully",
        });
        await fetchStatus();
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Sync failed",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="success">Success</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const getPendingCount = (entityType: string) => {
    const count = pendingCounts.find(p => p.entity_type === entityType)?.count || 0;
    return count > 0 ? <Badge variant="secondary">{count}</Badge> : null;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Data Synchronization</DialogTitle>
        </DialogHeader>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Entity Type</TableHead>
              <TableHead>Last Sync</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Pending</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {syncStatus.map((status) => (
              <TableRow key={status.entity_type}>
                <TableCell className="font-medium">
                  {status.entity_type.charAt(0).toUpperCase() + status.entity_type.slice(1)}
                </TableCell>
                <TableCell>
                  {status.last_sync_time
                    ? formatDistanceToNow(new Date(status.last_sync_time), { addSuffix: true })
                    : 'Never'}
                </TableCell>
                <TableCell>
                  {getStatusBadge(status.last_sync_status)}
                </TableCell>
                <TableCell>
                  {getPendingCount(status.entity_type)}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSync(status.entity_type)}
                    disabled={isLoading}
                  >
                    {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                    Sync
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <DialogFooter className="gap-2 sm:gap-0">
          <div className="flex items-center text-sm text-muted-foreground">
            {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? 'Syncing...' : 'Last checked just now'}
          </div>
          <div>
            <Button
              variant="outline"
              onClick={onClose}
              className="mr-2"
            >
              Close
            </Button>
            <Button
              onClick={() => handleSync()}
              disabled={isLoading}
            >
              {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
              Sync All
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}