"use client";

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
import { Checkbox } from "@/components/ui/checkbox";
import { POSInvoice, CartItem } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface ReturnDialogProps {
  invoice: POSInvoice;
  open: boolean;
  onClose: () => void;
}

interface ReturnItem extends CartItem {
  isSelected: boolean;
  returnQuantity: number;
}

export function ReturnDialog({ invoice, open, onClose }: ReturnDialogProps) {
  const [returnType, setReturnType] = useState<"credit" | "refund">("refund");
  const [returnItems, setReturnItems] = useState<ReturnItem[]>(
    invoice.items.map(item => ({
      ...item,
      isSelected: false,
      returnQuantity: 0
    }))
  );
  const [reason, setReason] = useState("");

  const totalReturnAmount = returnItems.reduce((sum, item) => {
    if (item.isSelected) {
      return sum + (item.rate * item.returnQuantity);
    }
    return sum;
  }, 0);

  const handleQuantityChange = (index: number, quantity: string) => {
    const newQuantity = parseInt(quantity) || 0;
    if (newQuantity <= returnItems[index].quantity && newQuantity >= 0) {
      setReturnItems(items => 
        items.map((item, i) => 
          i === index 
            ? { ...item, returnQuantity: newQuantity, isSelected: newQuantity > 0 }
            : item
        )
      );
    }
  };

  const handleItemSelect = (index: number, checked: boolean) => {
    setReturnItems(items =>
      items.map((item, i) =>
        i === index
          ? { ...item, isSelected: checked, returnQuantity: checked ? item.quantity : 0 }
          : item
      )
    );
  };

  const handleSubmit = async () => {
    const itemsToReturn = returnItems.filter(item => item.isSelected && item.returnQuantity > 0);
    if (itemsToReturn.length === 0) return;

    try {
      // TODO: Implement return submission
      console.log({
        originalInvoice: invoice.name,
        returnType,
        items: itemsToReturn,
        totalAmount: totalReturnAmount,
        reason
      });
      
      onClose();
    } catch (error) {
      console.error('Failed to process return:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Return Items from Invoice #{invoice.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Return Type</label>
            <Select
              value={returnType}
              onValueChange={(value: "credit" | "refund") => setReturnType(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="refund">Cash Refund</SelectItem>
                <SelectItem value="credit">Store Credit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border rounded-lg">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-2 text-left">Select</th>
                  <th className="px-4 py-2 text-left">Item</th>
                  <th className="px-4 py-2 text-right">Original Qty</th>
                  <th className="px-4 py-2 text-right">Return Qty</th>
                  <th className="px-4 py-2 text-right">Rate</th>
                  <th className="px-4 py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {returnItems.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="px-4 py-2">
                      <Checkbox
                        checked={item.isSelected}
                        onCheckedChange={(checked) => 
                          handleItemSelect(index, checked as boolean)
                        }
                      />
                    </td>
                    <td className="px-4 py-2">{item.item_name}</td>
                    <td className="px-4 py-2 text-right">{item.quantity}</td>
                    <td className="px-4 py-2">
                      <Input
                        type="number"
                        min="0"
                        max={item.quantity}
                        value={item.returnQuantity}
                        onChange={(e) => handleQuantityChange(index, e.target.value)}
                        className="w-20 text-right"
                        disabled={!item.isSelected}
                      />
                    </td>
                    <td className="px-4 py-2 text-right">
                      {formatCurrency(item.rate)}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {formatCurrency(item.rate * item.returnQuantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Return Reason</label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for return"
            />
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-lg font-medium">
              Total Return Amount: {formatCurrency(totalReturnAmount)}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={totalReturnAmount === 0}
          >
            Process Return
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
