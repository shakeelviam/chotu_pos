"use client";

import { POSInvoice } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { useEffect } from "react";

interface InvoicePrintProps {
  invoice: POSInvoice;
  onPrintComplete: () => void;
}

export function InvoicePrint({ invoice, onPrintComplete }: InvoicePrintProps) {
  useEffect(() => {
    const printContent = () => {
      window.print();
      onPrintComplete();
    };

    // Small delay to ensure content is rendered
    const timer = setTimeout(printContent, 100);
    return () => clearTimeout(timer);
  }, [onPrintComplete]);

  return (
    <div className="p-8 max-w-[80mm] mx-auto print:max-w-full print:mx-0 print:p-0 print:text-sm">
      {/* Company Header */}
      <div className="text-center mb-4">
        <h1 className="font-bold text-xl">{invoice.company}</h1>
        <div className="text-sm text-muted-foreground">
          {invoice.warehouse}
        </div>
      </div>

      {/* Invoice Details */}
      <div className="mb-4 text-sm">
        <div className="flex justify-between">
          <span>Invoice #:</span>
          <span>{invoice.name}</span>
        </div>
        <div className="flex justify-between">
          <span>Date:</span>
          <span>{new Date(invoice.posting_date).toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between">
          <span>Time:</span>
          <span>{invoice.posting_time}</span>
        </div>
        <div className="flex justify-between">
          <span>Customer:</span>
          <span>{invoice.customer_name || invoice.customer}</span>
        </div>
      </div>

      {/* Items */}
      <div className="border-t border-b py-2 mb-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-1">Item</th>
              <th className="text-right py-1">Qty</th>
              <th className="text-right py-1">Price</th>
              <th className="text-right py-1">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => (
              <tr key={index} className="border-b last:border-b-0">
                <td className="py-1">{item.item_name}</td>
                <td className="text-right py-1">{item.quantity}</td>
                <td className="text-right py-1">{formatCurrency(item.rate)}</td>
                <td className="text-right py-1">{formatCurrency(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="space-y-1 text-sm mb-4">
        <div className="flex justify-between">
          <span>Net Total:</span>
          <span>{formatCurrency(invoice.net_total)}</span>
        </div>
        {invoice.discount_amount > 0 && (
          <div className="flex justify-between text-destructive">
            <span>Discount:</span>
            <span>- {formatCurrency(invoice.discount_amount)}</span>
          </div>
        )}
        {invoice.tax_amount > 0 && (
          <div className="flex justify-between">
            <span>Tax:</span>
            <span>{formatCurrency(invoice.tax_amount)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold border-t pt-1">
          <span>Grand Total:</span>
          <span>{formatCurrency(invoice.grand_total)}</span>
        </div>
      </div>

      {/* Payments */}
      <div className="mb-4 text-sm">
        <div className="font-bold mb-1">Payments</div>
        {invoice.payments.map((payment, index) => (
          <div key={index} className="flex justify-between">
            <span>{payment.mode_of_payment}:</span>
            <span>{formatCurrency(payment.amount)}</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="text-center text-sm mt-8">
        <div>Thank you for your business!</div>
        <div className="text-muted-foreground">
          {new Date().toLocaleString()}
        </div>
      </div>
    </div>
  );
}
