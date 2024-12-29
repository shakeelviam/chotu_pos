"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { InvoiceDialog } from "@/components/pos/invoice-dialog";
import { POSInvoice } from "@/types";
import { Search, FileText, RefreshCcw } from "lucide-react";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { addDays } from "date-fns";
import { ReturnDialog } from "@/components/pos/return-dialog";
import { useInvoiceStore } from "@/lib/store/invoice-store";
import { toast } from "@/lib/utils/toast";

export default function InvoicesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({
    from: new Date(),
    to: addDays(new Date(), 7),
  });
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedInvoice, setSelectedInvoice] = useState<POSInvoice | null>(null);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [showReturnDialog, setShowReturnDialog] = useState(false);

  const invoices = useInvoiceStore((state) => state.invoices);
  const createReturn = useInvoiceStore((state) => state.createReturn);

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer.toLowerCase().includes(searchTerm.toLowerCase());
    
    const invoiceDate = new Date(invoice.posting_date);
    const matchesDate =
      (!dateRange.from || invoiceDate >= dateRange.from) &&
      (!dateRange.to || invoiceDate <= dateRange.to);
    
    const matchesStatus =
      statusFilter === "all" || invoice.status?.toLowerCase() === statusFilter;

    return matchesSearch && matchesDate && matchesStatus;
  });

  const handleViewInvoice = (invoice: POSInvoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceDialog(true);
  };

  const handleReturn = async (invoice: POSInvoice) => {
    setSelectedInvoice(invoice);
    setShowReturnDialog(true);
  };

  const handleReturnSubmit = async (
    returnItems: any[],
    returnType: "credit" | "refund",
    reason: string
  ) => {
    if (!selectedInvoice) return;

    try {
      createReturn(selectedInvoice, returnItems, returnType, reason);
      toast({
        title: "Success",
        description: "Return processed successfully",
      });
      setShowReturnDialog(false);
      setSelectedInvoice(null);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process return",
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <Button variant="outline" size="sm" className="gap-2">
          <RefreshCcw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="flex gap-2">
              <Input
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Button variant="ghost" size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </div>

            <DatePickerWithRange
              date={dateRange}
              setDate={setDateRange}
            />

            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="return">Return</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow key={invoice.name}>
                  <TableCell>{invoice.name}</TableCell>
                  <TableCell>
                    {new Date(invoice.posting_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {invoice.customer_name || invoice.customer}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        invoice.status === "Paid"
                          ? "bg-green-50 text-green-700"
                          : invoice.status === "Return"
                          ? "bg-red-50 text-red-700"
                          : "bg-gray-50 text-gray-700"
                      }`}
                    >
                      {invoice.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(invoice.grand_total)}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewInvoice(invoice)}
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                      {invoice.status === "Paid" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReturn(invoice)}
                        >
                          <RefreshCcw className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredInvoices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    No invoices found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedInvoice && (
        <>
          <InvoiceDialog
            invoice={selectedInvoice}
            open={showInvoiceDialog}
            onClose={() => {
              setShowInvoiceDialog(false);
              setSelectedInvoice(null);
            }}
            onPrint={() => {}}
            onEmail={() => {}}
          />
          <ReturnDialog
            invoice={selectedInvoice}
            open={showReturnDialog}
            onClose={() => {
              setShowReturnDialog(false);
              setSelectedInvoice(null);
            }}
            onSubmit={handleReturnSubmit}
          />
        </>
      )}
    </div>
  );
}
