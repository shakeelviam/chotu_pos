import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Customer } from "@/types";
import { User } from "lucide-react";

export function CustomerSelect() {
  const [open, setOpen] = useState(false);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [search, setSearch] = useState("");

  return (
    <div>
      <Button
        variant="outline"
        className="w-full flex justify-between items-center h-auto py-3"
        onClick={() => setOpen(true)}
      >
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <div className="text-left">
            <div className="font-medium">
              {customer ? customer.name : "Cash Customer"}
            </div>
            <div className="text-xs text-muted-foreground">
              Click to add email / phone
            </div>
          </div>
        </div>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Customer</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Search Customer</Label>
              <Input
                placeholder="Search by name, phone or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  setCustomer(null);
                  setOpen(false);
                }}
              >
                <div>
                  <div className="font-medium">Cash Customer</div>
                  <div className="text-xs text-muted-foreground">Walk-in Customer</div>
                </div>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
