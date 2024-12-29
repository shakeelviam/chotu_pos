"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { useInvoiceStore } from "@/lib/store/invoice-store";
import { ReturnDialog } from "./return-dialog";
import { InvoiceDialog } from "./invoice-dialog";
import { Search, FileText, History } from "lucide-react";

export function OrdersDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState("recent");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);

  const invoices = useInvoiceStore((state) => state.invoices);
  
  const recentOrders = useMemo(() => {
    return invoices
      .filter(inv => inv.status === "Paid" && !inv.is_return)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10);
  }, [invoices]);

  const filteredOrders = useMemo(() => {
    const orders = activeTab === "recent" ? recentOrders : invoices;
    return orders.filter(order => 
      order.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [activeTab, recentOrders, invoices, searchTerm]);

  const handleReturn = (invoice: any) => {
    if (invoice.status !== "Paid") {
      alert("Only paid invoices can be returned");
      return;
    }
    setSelectedInvoice(invoice);
    setShowReturnDialog(true);
  };

  const handleViewInvoice = (invoice: any) => {
    setSelectedInvoice(invoice);
    setShowInvoiceDialog(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Orders</DialogTitle>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="recent">Recent Orders</TabsTrigger>
              <TabsTrigger value="history">Order History</TabsTrigger>
            </TabsList>

            <TabsContent value="recent" className="mt-4">
              <OrdersTable
                orders={recentOrders}
                onReturn={handleReturn}
                onView={handleViewInvoice}
              />
            </TabsContent>

            <TabsContent value="history" className="mt-4">
              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <Button variant="ghost" size="icon">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              <OrdersTable
                orders={filteredOrders}
                onReturn={handleReturn}
                onView={handleViewInvoice}
              />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {selectedInvoice && (
        <>
          <ReturnDialog
            invoice={selectedInvoice}
            open={showReturnDialog}
            onClose={() => {
              setShowReturnDialog(false);
              setSelectedInvoice(null);
            }}
          />
          <InvoiceDialog
            invoice={selectedInvoice}
            open={showInvoiceDialog}
            onClose={() => {
              setShowInvoiceDialog(false);
              setSelectedInvoice(null);
            }}
          />
        </>
      )}
    </>
  );
}

function OrdersTable({ 
  orders, 
  onReturn, 
  onView 
}: { 
  orders: any[];
  onReturn: (invoice: any) => void;
  onView: (invoice: any) => void;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order #</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.name || `order-${order.created_at}-${order.grand_total}`}>
            <TableCell>{order.name}</TableCell>
            <TableCell>
              {new Date(order.created_at).toLocaleDateString()}
            </TableCell>
            <TableCell>
              {order.customer_name || order.customer}
            </TableCell>
            <TableCell>
              <span
                className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                  order.status === "Paid"
                    ? "bg-green-50 text-green-700"
                    : order.status === "Return"
                    ? "bg-red-50 text-red-700"
                    : order.status === "Draft"
                    ? "bg-yellow-50 text-yellow-700"
                    : "bg-gray-50 text-gray-700"
                }`}
              >
                {order.status}
              </span>
            </TableCell>
            <TableCell className="text-right">
              {formatCurrency(order.grand_total)}
            </TableCell>
            <TableCell>
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onView(order)}
                >
                  <FileText className="h-4 w-4" />
                </Button>
                {order.status === "Paid" && !order.is_return && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onReturn(order)}
                  >
                    <History className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
        {orders.length === 0 && (
          <TableRow key="no-orders">
            <TableCell colSpan={6} className="text-center py-4">
              No orders found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
