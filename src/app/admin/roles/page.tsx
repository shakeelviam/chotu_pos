"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface UserConfig {
  userId: string;
  posProfile: string;
  maxDiscountPercent: number;
}

export default function RolesPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserConfig | null>(null);

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      const result = await window.electron.getRoleConfigs();
      if (result.success && result.roles) {
        setUsers(result.roles.map(role => ({
          userId: role.role,
          posProfile: role.posProfile,
          maxDiscountPercent: role.maxDiscountPercent
        })));
      }
    } catch (error) {
      console.error("Failed to load roles:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load role configurations",
      });
    }
  };

  const handleSave = async (user: UserConfig) => {
    try {
      setLoading(true);
      const result = await window.electron.saveRoleConfig({
        role: user.userId,
        posProfile: user.posProfile,
        maxDiscountPercent: user.maxDiscountPercent
      });
      if (result.success) {
        await loadRoles();
        setShowDialog(false);
        toast({
          title: "Success",
          description: "Role configuration saved successfully",
        });
      }
    } catch (error: any) {
      console.error("Failed to save role:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save role configuration",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId: string) => {
    try {
      const result = await window.electron.deleteRoleConfig(userId);
      if (result.success) {
        await loadRoles();
        toast({
          title: "Success",
          description: "Role configuration deleted successfully",
        });
      }
    } catch (error: any) {
      console.error("Failed to delete role:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete role configuration",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">User Management</h1>
        <Button onClick={() => {
          setCurrentUser(null);
          setShowDialog(true);
        }}>
          Add User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Configurations</CardTitle>
          <CardDescription>Manage user-based permissions and POS profiles</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>POS Profile</TableHead>
                <TableHead>Max Discount %</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.userId}>
                  <TableCell>{user.userId}</TableCell>
                  <TableCell>{user.posProfile}</TableCell>
                  <TableCell>{user.maxDiscountPercent}%</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setCurrentUser(user);
                        setShowDialog(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => handleDelete(user.userId)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentUser ? 'Edit User' : 'Add User'}</DialogTitle>
            <DialogDescription>
              Configure user permissions and POS profile mapping
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userId">User ID</Label>
              <Input
                id="userId"
                value={currentUser?.userId ?? ''}
                onChange={(e) => setCurrentUser(prev => ({ ...prev!, userId: e.target.value }))}
                placeholder="e.g., user123"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="posProfile">POS Profile</Label>
              <Input
                id="posProfile"
                value={currentUser?.posProfile ?? ''}
                onChange={(e) => setCurrentUser(prev => ({ ...prev!, posProfile: e.target.value }))}
                placeholder="ERPNext POS Profile"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxDiscountPercent">Maximum Discount Percentage</Label>
              <Input
                id="maxDiscountPercent"
                type="number"
                min="0"
                max="100"
                value={currentUser?.maxDiscountPercent ?? 0}
                onChange={(e) => setCurrentUser(prev => ({ ...prev!, maxDiscountPercent: parseFloat(e.target.value) || 0 }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => currentUser && handleSave(currentUser)}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
