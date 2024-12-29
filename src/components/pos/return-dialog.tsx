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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ReturnDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    returnType: "credit" | "refund";
    invoiceNumber?: string;
    amount: number;
  }) => void;
}

export function ReturnDialog({ open, onClose, onSubmit }: ReturnDialogProps) {
  const [returnType, setReturnType] = useState<"credit" | "refund">("credit");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [amount, setAmount] = useState("");

  const handleSubmit = () => {
    const returnAmount = parseFloat(amount);
    if (!isNaN(returnAmount) && returnAmount > 0) {
      onSubmit({
        returnType,
        invoiceNumber: invoiceNumber || undefined,
        amount: returnAmount,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Return Items</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label>Return Type</label>
            <Select
              value={returnType}
              onValueChange={(value: "credit" | "refund") => setReturnType(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="credit">Store Credit</SelectItem>
                <SelectItem value="refund">Cash Refund</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label>Original Invoice Number (Optional)</label>
            <Input
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              placeholder="Enter invoice number"
            />
          </div>

          <div className="space-y-2">
            <label>Return Amount</label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter return amount"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Process Return
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
