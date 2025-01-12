import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CartItem } from "@/types";
import { Minus, Plus, X } from "lucide-react";
import { ItemDetailsDialog } from "./item-details-dialog";

interface CartProps {
  items: CartItem[];
  onUpdateItem: (item: CartItem) => void;
  onRemoveItem: (item: CartItem) => void;
  onCheckout: () => void;
  currencySymbol: string;
  additionalDiscount: number;
  onAdditionalDiscountChange: (value: number) => void;
}

export function Cart({
  items,
  onUpdateItem,
  onRemoveItem,
  onCheckout,
  currencySymbol,
  additionalDiscount,
  onAdditionalDiscountChange,
}: CartProps) {
  const [selectedItem, setSelectedItem] = useState<CartItem | null>(null);

  // Calculate totals with quantity
  const subtotal = items.reduce((sum, item) => sum + item.rate * item.quantity, 0);
  const totalDiscount = items.reduce((sum, item) => sum + (item.discount_amount || 0) * item.quantity, 0);
  const additionalDiscountAmount = additionalDiscount
    ? (subtotal - totalDiscount) * (additionalDiscount / 100)
    : 0;
  const tax = 0; // TODO: Implement tax calculation
  const grandTotal = subtotal - totalDiscount - additionalDiscountAmount + tax;

  const updateItemQuantity = (item: CartItem, newQuantity: number) => {
    const quantity = Math.max(1, newQuantity);
    const amount = item.rate * quantity;
    const discount_amount = item.discount_percentage
      ? amount * (item.discount_percentage / 100)
      : item.discount_amount || 0;

    onUpdateItem({
      ...item,
      quantity,
      amount,
      discount_amount,
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="font-medium">Shopping Cart</div>
        <div className="text-sm text-muted-foreground">
          {items.length} {items.length === 1 ? "item" : "items"}
        </div>
      </div>

      <div className="flex flex-col h-[calc(100vh-280px)]">
        {/* Cart Items Section - Scrollable */}
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            {items.map((item) => (
              <div
                key={item.item_code}
                className="flex gap-4 p-3 rounded-lg border bg-card hover:bg-accent cursor-pointer"
                onClick={() => setSelectedItem(item)}
              >
                {/* Item Image */}
                <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.item_name}
                      className="w-full h-full object-cover rounded-md"
                    />
                  ) : (
                    <div className="text-xs text-muted-foreground">No Image</div>
                  )}
                </div>

                {/* Item Details */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{item.item_name}</div>
                  <div className="text-sm text-muted-foreground truncate">
                    {item.item_code}
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateItemQuantity(item, item.quantity - 1);
                        }}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <div className="w-8 text-center">{item.quantity}</div>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateItemQuantity(item, item.quantity + 1);
                        }}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="text-sm">× {item.rate.toFixed(3)}</div>
                  </div>
                </div>

                {/* Price and Remove */}
                <div className="flex flex-col items-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveItem(item);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <div className="font-medium">
                    {currencySymbol} {(item.rate * item.quantity).toFixed(3)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Totals and Checkout Section - Fixed */}
        <div className="border-t bg-background p-4 space-y-4">
          {/* Net Total */}
          <div className="flex justify-between items-center">
            <span>Net Total</span>
            <span>
              {currencySymbol} {subtotal.toFixed(3)}
            </span>
          </div>

          {/* Item Discount */}
          {totalDiscount > 0 && (
            <div className="flex justify-between text-sm text-destructive">
              <span>Item Discount</span>
              <span>
                - {currencySymbol} {totalDiscount.toFixed(3)}
              </span>
            </div>
          )}

          {/* Additional Discount */}
          <div className="flex gap-2 items-center">
            <span className="text-sm text-muted-foreground">
              Additional Discount (%)
            </span>
            <Input
              type="text"
              inputMode="decimal"
              value={additionalDiscount || ""}
              onChange={(e) => {
                const value = e.target.value.replace(/[^\d.]/g, "");
                const numValue = parseFloat(value);
                if (!value) {
                  onAdditionalDiscountChange(0);
                } else if (!isNaN(numValue) && numValue <= 100) {
                  onAdditionalDiscountChange(numValue);
                }
              }}
              className="w-20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="text-sm text-muted-foreground">
              - {currencySymbol} {additionalDiscountAmount.toFixed(3)}
            </span>
          </div>

          {/* Tax (placeholder for future implementation) */}
          {tax > 0 && (
            <div className="flex justify-between text-sm">
              <span>Tax</span>
              <span>
                {currencySymbol} {tax.toFixed(3)}
              </span>
            </div>
          )}

          {/* Grand Total */}
          <div className="flex justify-between font-bold">
            <span>Grand Total</span>
            <span>
              {currencySymbol} {grandTotal.toFixed(3)}
            </span>
          </div>

          {/* Checkout Button */}
          <Button
            className="w-full"
            size="lg"
            onClick={() => onCheckout()}
            disabled={items.length === 0}
          >
            Checkout
          </Button>
        </div>
      </div>

      {selectedItem && (
        <ItemDetailsDialog
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onUpdate={(item) => {
            onUpdateItem(item);
            setSelectedItem(null);
          }}
          userRole="Cashier"
        />
      )}
    </div>
  );
}