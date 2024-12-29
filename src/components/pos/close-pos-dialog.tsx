import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface ClosePOSDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (closingAmount: number) => void;
}

export function ClosePOSDialog({ open, onClose, onSubmit }: ClosePOSDialogProps) {
  const [closingAmount, setClosingAmount] = useState("");

  const handleSubmit = () => {
    const amount = parseFloat(closingAmount);
    if (!isNaN(amount)) {
      onSubmit(amount);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Close POS</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p>Please count your cash drawer and enter the closing amount.</p>
          <Input
            type="number"
            value={closingAmount}
            onChange={(e) => setClosingAmount(e.target.value)}
            placeholder="Enter closing amount"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Close POS</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
