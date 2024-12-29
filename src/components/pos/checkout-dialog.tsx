import { useState } from "react";
import { CreditCard, Wallet, QrCode, Receipt, X } from "lucide-react";
import { CartItem } from "@/types";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

interface CheckoutDialogProps {
  open: boolean;
  onClose: () => void;
  items: CartItem[];
}

const PAYMENT_METHODS = [
  {
    id: "cash",
    name: "Cash",
    icon: Wallet,
    description: "Pay with cash",
  },
  {
    id: "card",
    name: "Card",
    icon: CreditCard,
    description: "Credit or debit card",
  },
  {
    id: "knet",
    name: "KNET",
    icon: Receipt,
    description: "Pay with KNET",
  },
  {
    id: "qr",
    name: "QR Code",
    icon: QrCode,
    description: "Scan QR code to pay",
  },
];

export function CheckoutDialog({ open, onClose, items }: CheckoutDialogProps) {
  const [selectedMethod, setSelectedMethod] = useState(PAYMENT_METHODS[0].id);
  const [cashReceived, setCashReceived] = useState("");

  const subtotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
  const tax = subtotal * 0.05; // 5% tax
  const total = subtotal + tax;
  const change = parseFloat(cashReceived) - total;

  const handlePayment = () => {
    // TODO: Implement payment processing
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-2xl font-semibold">Checkout</h2>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <Tabs
          defaultValue={selectedMethod}
          value={selectedMethod}
          onValueChange={setSelectedMethod}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-4 gap-4">
            {PAYMENT_METHODS.map((method) => (
              <TabsTrigger
                key={method.id}
                value={method.id}
                className="flex flex-col items-center gap-2 p-4 data-[state=active]:bg-primary/10"
              >
                <method.icon className="h-6 w-6" />
                <span className="text-sm font-medium">{method.name}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Cash Payment */}
          <TabsContent value="cash" className="space-y-4 mt-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="amount">Amount Received</Label>
                <Input
                  id="amount"
                  placeholder="Enter amount"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  type="number"
                  step="0.001"
                  min={total}
                />
              </div>
              {parseFloat(cashReceived) > 0 && (
                <div className="rounded-lg border p-4 bg-secondary/10">
                  <div className="flex justify-between text-sm">
                    <span>Change</span>
                    <span className="font-medium">
                      KD {Math.max(0, change).toFixed(3)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Card Payment */}
          <TabsContent value="card" className="space-y-4 mt-4">
            <div className="rounded-lg border p-4 bg-secondary/10">
              <p className="text-center text-sm text-muted-foreground">
                Please insert or tap card on the payment terminal
              </p>
            </div>
          </TabsContent>

          {/* KNET Payment */}
          <TabsContent value="knet" className="space-y-4 mt-4">
            <div className="rounded-lg border p-4 bg-secondary/10">
              <p className="text-center text-sm text-muted-foreground">
                Please insert your KNET card
              </p>
            </div>
          </TabsContent>

          {/* QR Payment */}
          <TabsContent value="qr" className="space-y-4 mt-4">
            <div className="rounded-lg border p-8 bg-secondary/10">
              <div className="aspect-square w-full max-w-[200px] mx-auto bg-white p-4">
                {/* Placeholder for QR code */}
                <div className="w-full h-full border-2 border-dashed rounded flex items-center justify-center">
                  <span className="text-sm text-muted-foreground">QR Code</span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Order Summary */}
        <div className="space-y-4">
          <Separator />
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>KD {subtotal.toFixed(3)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax (5%)</span>
              <span>KD {tax.toFixed(3)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-medium">
              <span>Total</span>
              <span className="text-primary">KD {total.toFixed(3)}</span>
            </div>
          </div>

          <Button
            className="w-full bg-gradient-to-r from-primary to-primary-foreground hover:opacity-90"
            size="lg"
            onClick={handlePayment}
            disabled={
              selectedMethod === "cash"
                ? parseFloat(cashReceived) < total
                : false
            }
          >
            Pay KD {total.toFixed(3)}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
