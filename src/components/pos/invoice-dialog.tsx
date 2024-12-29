"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { POSInvoice } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Printer, Mail, Download } from "lucide-react";

interface InvoiceDialogProps {
  invoice: POSInvoice;
  open: boolean;
  onClose: () => void;
  onPrint: () => void;
  onEmail: () => void;
}

export function InvoiceDialog({
  invoice,
  open,
  onClose,
  onPrint,
  onEmail,
}: InvoiceDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Invoice #{invoice.name}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[600px] pr-4">
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Customer</div>
              <div className="font-medium">{invoice.customer_name || invoice.customer}</div>
            </div>

            {/* Invoice Details */}
            <div className="space-y-4">
              <div className="text-sm font-medium">Invoice Details</div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Date</div>
                  <div>{new Date(invoice.posting_date).toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Time</div>
                  <div>{invoice.posting_time}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Status</div>
                  <div>{invoice.status}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Invoice Type</div>
                  <div>{invoice.is_return ? "Return" : "Sales"}</div>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-4">
              <div className="text-sm font-medium">Items</div>
              <div className="space-y-2">
                {invoice.items.map((item, index) => (
                  <div
                    key={`${item.item_code}-${index}`}
                    className="grid grid-cols-[1fr,auto] gap-4 text-sm"
                  >
                    <div>
                      <div className="font-medium">{item.item_name}</div>
                      <div className="text-muted-foreground">
                        {item.quantity} × {formatCurrency(item.rate)}
                      </div>
                      {item.discount_percentage > 0 && (
                        <div className="text-destructive">
                          Discount: {item.discount_percentage}%
                        </div>
                      )}
                    </div>
                    <div className="font-medium">
                      {formatCurrency(item.amount)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="space-y-2 border-t pt-4">
              <div className="flex justify-between text-sm">
                <span>Net Total</span>
                <span>{formatCurrency(invoice.net_total)}</span>
              </div>
              {invoice.discount_amount > 0 && (
                <div className="flex justify-between text-sm text-destructive">
                  <span>Discount</span>
                  <span>- {formatCurrency(invoice.discount_amount)}</span>
                </div>
              )}
              {invoice.tax_amount > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>{formatCurrency(invoice.tax_amount)}</span>
                </div>
              )}
              <div className="flex justify-between font-medium text-lg pt-2 border-t">
                <span>Grand Total</span>
                <span>{formatCurrency(invoice.grand_total)}</span>
              </div>
            </div>

            {/* Payments */}
            <div className="space-y-4">
              <div className="text-sm font-medium">Payments</div>
              <div className="space-y-2">
                {invoice.payments.map((payment, index) => (
                  <div
                    key={index}
                    className="flex justify-between text-sm"
                  >
                    <span>{payment.mode_of_payment}</span>
                    <span>{formatCurrency(payment.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={onPrint}
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={onEmail}
          >
            <Mail className="h-4 w-4" />
            Email
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
