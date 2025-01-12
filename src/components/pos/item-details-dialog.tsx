"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CartItem } from "@/types";
import { NumberPad } from "./number-pad";
import { useToast } from "@/components/ui/use-toast";

interface ItemDetailsDialogProps {
  item: CartItem;
  onClose: () => void;
  onUpdate: (item: CartItem) => void;
}

export function ItemDetailsDialog({ item, onClose, onUpdate }: ItemDetailsDialogProps) {
  const [quantity, setQuantity] = useState(item.quantity.toString());
  const [rate, setRate] = useState(item.rate.toString());
  const [discountPercentage, setDiscountPercentage] = useState(item.discount_percentage?.toString() || "0");
  const [discountAmount, setDiscountAmount] = useState(item.discount_amount?.toString() || "0");
  const [activeInput, setActiveInput] = useState<"quantity" | "rate" | "discount" | "discountAmount">("quantity");
  const { toast } = useToast();

  // Calculate total amount before discount
  const totalBeforeDiscount = parseFloat(quantity) * parseFloat(rate);

  // Update discount amount when percentage changes
  useEffect(() => {
    if (activeInput === "discount") {
      const percentage = parseFloat(discountPercentage);
      const amount = (totalBeforeDiscount * percentage) / 100;
      setDiscountAmount(amount.toFixed(3));
    }
  }, [discountPercentage, totalBeforeDiscount]);

  // Update discount percentage when amount changes
  useEffect(() => {
    if (activeInput === "discountAmount") {
      const amount = parseFloat(discountAmount);
      const percentage = totalBeforeDiscount > 0 ? (amount / totalBeforeDiscount) * 100 : 0;
      setDiscountPercentage(percentage.toFixed(3));
    }
  }, [discountAmount, totalBeforeDiscount]);

  const handleNumberClick = (value: string) => {
    switch (activeInput) {
      case "quantity":
        setQuantity(prev => (prev === "0" ? value : prev + value));
        break;
      case "rate":
        setRate(prev => (prev === "0" ? value : prev + value));
        break;
      case "discount":
        setDiscountPercentage(prev => (prev === "0" ? value : prev + value));
        break;
      case "discountAmount":
        setDiscountAmount(prev => (prev === "0" ? value : prev + value));
        break;
    }
  };

  const handleBackspace = () => {
    switch (activeInput) {
      case "quantity":
        setQuantity(prev => prev.slice(0, -1) || "0");
        break;
      case "rate":
        setRate(prev => prev.slice(0, -1) || "0");
        break;
      case "discount":
        setDiscountPercentage(prev => prev.slice(0, -1) || "0");
        break;
      case "discountAmount":
        setDiscountAmount(prev => prev.slice(0, -1) || "0");
        break;
    }
  };

  const handleClear = () => {
    switch (activeInput) {
      case "quantity":
        setQuantity("0");
        break;
      case "rate":
        setRate("0");
        break;
      case "discount":
        setDiscountPercentage("0");
        break;
      case "discountAmount":
        setDiscountAmount("0");
        break;
    }
  };

  const handleDot = () => {
    switch (activeInput) {
      case "quantity":
        if (!quantity.includes(".")) setQuantity(prev => prev + ".");
        break;
      case "rate":
        if (!rate.includes(".")) setRate(prev => prev + ".");
        break;
      case "discount":
        if (!discountPercentage.includes(".")) setDiscountPercentage(prev => prev + ".");
        break;
      case "discountAmount":
        if (!discountAmount.includes(".")) setDiscountAmount(prev => prev + ".");
        break;
    }
  };

  const handleUpdate = () => {
    const qty = parseFloat(quantity);
    const newRate = parseFloat(rate);
    const discount = parseFloat(discountPercentage);
    const discountAmt = parseFloat(discountAmount);

    // Validation
    if (qty <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid quantity",
        description: "Quantity must be greater than 0",
      });
      return;
    }

    if (item.actual_qty !== undefined && qty > item.actual_qty) {
      toast({
        variant: "destructive",
        title: "Insufficient stock",
        description: `Only ${item.actual_qty} units available`,
      });
      return;
    }

    // Calculate amounts
    const amount = qty * newRate;

    onUpdate({
      ...item,
      quantity: qty,
      rate: newRate,
      amount: amount - discountAmt,
      discount_percentage: discount,
      discount_amount: discountAmt
    });
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{item.item_name}</DialogTitle>
          <DialogDescription>Item Code: {item.item_code}</DialogDescription>
        </DialogHeader>

        <div className="max-h-[600px] overflow-y-auto pr-4">
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input
                type="text"
                value={quantity}
                className="text-left"
                readOnly
                onClick={() => setActiveInput("quantity")}
              />
            </div>

            <div className="space-y-2">
              <Label>Rate (KD)</Label>
              <Input
                type="text"
                value={rate}
                className="text-left"
                readOnly
                onClick={() => setActiveInput("rate")}
              />
            </div>

            <div className="space-y-2">
              <Label>Discount (%)</Label>
              <Input
                type="text"
                value={discountPercentage}
                className="text-left"
                readOnly
                onClick={() => setActiveInput("discount")}
              />
            </div>

            <div className="space-y-2">
              <Label>Discount Amount (KD)</Label>
              <Input
                type="text"
                value={discountAmount}
                className="text-left"
                readOnly
                onClick={() => setActiveInput("discountAmount")}
              />
            </div>

            <NumberPad
              onNumberClick={handleNumberClick}
              onBackspace={handleBackspace}
              onClear={handleClear}
              onDot={handleDot}
              onQuantity={() => setActiveInput("quantity")}
              onRate={() => setActiveInput("rate")}
              onDiscount={() => setActiveInput("discount")}
              onDiscountAmount={() => setActiveInput("discountAmount")}
              activeInput={activeInput}
              className="mt-2"
            />

            <div className="space-y-2 pt-4">
              <div className="flex justify-between text-sm">
                <span>Amount</span>
                <span>KD {totalBeforeDiscount.toFixed(3)}</span>
              </div>
              {parseFloat(discountAmount) > 0 && (
                <div className="flex justify-between text-sm text-destructive">
                  <span>Discount ({discountPercentage}%)</span>
                  <span>- KD {parseFloat(discountAmount).toFixed(3)}</span>
                </div>
              )}
              <div className="flex justify-between font-medium border-t pt-2">
                <span>Total</span>
                <span>KD {(totalBeforeDiscount - parseFloat(discountAmount)).toFixed(3)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleUpdate}>Update</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}