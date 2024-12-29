"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CartItem } from "@/types";
import { NumberPad } from "./number-pad";
import Image from "next/image";
import { X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface ItemDetailsDialogProps {
  item: CartItem;
  onClose: () => void;
  onUpdate: (item: CartItem) => void;
  userRole: string;
}

export function ItemDetailsDialog({ item, onClose, onUpdate, userRole }: ItemDetailsDialogProps) {
  const [quantity, setQuantity] = useState(item.quantity.toString());
  const [rate, setRate] = useState(item.rate.toString());
  const [discountPercentage, setDiscountPercentage] = useState(item.discount_percentage?.toString() || "0");
  const [activeInput, setActiveInput] = useState<"quantity" | "rate" | "discount">("quantity");
  const [requiresApproval, setRequiresApproval] = useState(false);
  const { toast } = useToast();

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
    }
  };

  const handleUpdate = () => {
    const qty = parseFloat(quantity);
    const newRate = parseFloat(rate);
    const discount = parseFloat(discountPercentage);

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
        description: `Only ${item.actual_qty} ${item.uom} available`,
      });
      return;
    }

    if (newRate <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid rate",
        description: "Rate must be greater than 0",
      });
      return;
    }

    // Rate change validation
    const rateChange = Math.abs((newRate - item.standard_rate) / item.standard_rate * 100);
    if (rateChange > 10 && userRole !== "Manager") {
      setRequiresApproval(true);
      return;
    }

    // Calculate amounts
    const discountAmount = (qty * newRate * discount) / 100;
    const amount = qty * newRate - discountAmount;

    onUpdate({
      ...item,
      quantity: qty,
      rate: newRate,
      discount_percentage: discount,
      discount_amount: discountAmount,
      amount
    });
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle>Item Details</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            {/* Item Image and Basic Info */}
            <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.item_name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  No Image
                </div>
              )}
            </div>

            <div>
              <h3 className="font-medium">{item.item_name}</h3>
              <p className="text-sm text-muted-foreground">{item.item_code}</p>
            </div>

            {/* Item Details */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label>UOM</Label>
                <div className="mt-1">{item.uom}</div>
              </div>
              <div>
                <Label>Conversion Factor</Label>
                <div className="mt-1">{item.conversion_factor}</div>
              </div>
              <div>
                <Label>Available Qty</Label>
                <div className="mt-1">{item.actual_qty} {item.uom}</div>
              </div>
              <div>
                <Label>Standard Rate</Label>
                <div className="mt-1">{item.standard_rate.toFixed(3)} KD</div>
              </div>
              <div>
                <Label>Warehouse</Label>
                <div className="mt-1">{item.warehouse}</div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Quantity, Rate, Discount Inputs */}
            <div className="space-y-4">
              <div>
                <Label>Quantity ({item.uom})</Label>
                <Input
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  onFocus={() => setActiveInput("quantity")}
                  className="text-right"
                />
              </div>

              <div>
                <Label>Rate (KD)</Label>
                <Input
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  onFocus={() => setActiveInput("rate")}
                  className="text-right"
                />
              </div>

              <div>
                <Label>Discount (%)</Label>
                <Input
                  value={discountPercentage}
                  onChange={(e) => setDiscountPercentage(e.target.value)}
                  onFocus={() => setActiveInput("discount")}
                  className="text-right"
                />
              </div>
            </div>

            {/* Number Pad */}
            <NumberPad
              onNumberClick={handleNumberClick}
              onBackspace={handleBackspace}
              onClear={handleClear}
              onDot={handleDot}
            />

            {/* Total */}
            <div className="text-right space-y-2">
              <div className="text-sm text-muted-foreground">
                {quantity} {item.uom} × {rate} KD
                {parseFloat(discountPercentage) > 0 && ` - ${discountPercentage}%`}
              </div>
              <div className="text-lg font-medium">
                Total: {(parseFloat(quantity) * parseFloat(rate) * (1 - parseFloat(discountPercentage) / 100)).toFixed(3)} KD
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={handleUpdate}>Update</Button>
            </div>
          </div>
        </div>

        {/* Manager Approval Dialog */}
        {requiresApproval && (
          <Dialog open={requiresApproval} onOpenChange={() => setRequiresApproval(false)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Manager Approval Required</DialogTitle>
              </DialogHeader>
              <p>Rate change exceeds 10%. Please get manager approval to proceed.</p>
              <div className="flex justify-end space-x-2 mt-4">
                <Button variant="outline" onClick={() => setRequiresApproval(false)}>Cancel</Button>
                <Button onClick={() => {
                  setRequiresApproval(false);
                  // TODO: Implement manager approval flow
                }}>
                  Get Approval
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
}
