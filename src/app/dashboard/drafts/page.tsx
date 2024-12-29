"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { POSInvoice } from "@/types";
import { Search, FileText, Trash2, Play } from "lucide-react";
import { useInvoiceStore } from "@/lib/store/invoice-store";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

export default function DraftsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const router = useRouter();
  const invoices = useInvoiceStore((state) => 
    state.invoices.filter(inv => inv.status === "Draft")
  );

  const filteredDrafts = invoices.filter((invoice) =>
    invoice.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.customer.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const handleResume = (draft: POSInvoice) => {
    // TODO: Implement resume draft functionality
    router.push("/pos");
  };

  const handleDelete = (draft: POSInvoice) => {
    // TODO: Implement delete draft functionality
    toast({
      title: "Success",
      description: "Draft deleted successfully",
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Saved Drafts</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Drafts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Search drafts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Button variant="ghost" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Draft #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDrafts.map((draft) => (
                <TableRow key={draft.name}>
                  <TableCell>{draft.name}</TableCell>
                  <TableCell>
                    {new Date(draft.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {draft.customer_name || draft.customer}
                  </TableCell>
                  <TableCell>{draft.items.length} items</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(draft.grand_total)}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleResume(draft)}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(draft)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredDrafts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    No drafts found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
