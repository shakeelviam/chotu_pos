import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CartItem } from "@/types";
import { Minus, Plus, Trash2, X } from "lucide-react";
import { ItemDetailsDialog } from "./item-details-dialog";
import { cn } from "@/lib/utils";

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

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const totalDiscount = items.reduce((sum, item) => sum + (item.discount_amount || 0), 0);
  const additionalDiscountAmount = (subtotal * additionalDiscount) / 100;
  const tax = 0; // TODO: Implement tax calculation
  const grandTotal = subtotal - totalDiscount - additionalDiscountAmount + tax;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="font-medium">Shopping Cart</div>
        <div className="text-sm text-muted-foreground">
          {items.length} {items.length === 1 ? "item" : "items"}
        </div>
      </div>

      {/* Items */}
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
                        onUpdateItem({
                          ...item,
                          quantity: Math.max(1, item.quantity - 1),
                        });
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
                        onUpdateItem({
                          ...item,
                          quantity: item.quantity + 1,
                        });
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
                  {currencySymbol} {item.amount.toFixed(3)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Totals */}
      <div className="border-t p-4 space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Net Total</span>
            <span>
              {currencySymbol} {subtotal.toFixed(3)}
            </span>
          </div>
          {totalDiscount > 0 && (
            <div className="flex justify-between text-sm text-destructive">
              <span>Item Discount</span>
              <span>
                - {currencySymbol} {totalDiscount.toFixed(3)}
              </span>
            </div>
          )}
          <div className="flex gap-4">
            <Input
              type="number"
              min="0"
              max="100"
              value={additionalDiscount}
              onChange={(e) =>
                onAdditionalDiscountChange(parseFloat(e.target.value) || 0)
              }
              className="w-20"
            />
            <div className="flex-1 flex justify-between text-sm text-destructive">
              <span>Additional Discount (%)</span>
              <span>
                - {currencySymbol} {additionalDiscountAmount.toFixed(3)}
              </span>
            </div>
          </div>
          {tax > 0 && (
            <div className="flex justify-between text-sm">
              <span>Tax</span>
              <span>
                {currencySymbol} {tax.toFixed(3)}
              </span>
            </div>
          )}
          <div className="flex justify-between font-medium text-lg pt-2 border-t">
            <span>Grand Total</span>
            <span>
              {currencySymbol} {grandTotal.toFixed(3)}
            </span>
          </div>
        </div>

        <Button
          className="w-full"
          size="lg"
          onClick={onCheckout}
          disabled={items.length === 0}
        >
          Checkout
        </Button>
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
