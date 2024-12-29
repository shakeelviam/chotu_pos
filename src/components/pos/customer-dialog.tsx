"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { Search } from "lucide-react";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface CustomerDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (customer: Customer) => void;
}

const mockCustomers: Customer[] = [
  {
    id: "CUST001",
    name: "John Doe",
    email: "john@example.com",
    phone: "+965 1234 5678"
  },
  {
    id: "CUST002",
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "+965 2345 6789"
  },
  // Add more mock customers as needed
];

export function CustomerDialog({ open, onClose, onSelect }: CustomerDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = mockCustomers.filter(
      customer =>
        customer.name.toLowerCase().includes(query.toLowerCase()) ||
        customer.id.toLowerCase().includes(query.toLowerCase()) ||
        customer.phone.includes(query)
    );
    setCustomers(filtered);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Customer</DialogTitle>
        </DialogHeader>
        
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customers by name, ID or phone..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-8"
          />
        </div>

        <ScrollArea className="flex-1 mt-4">
          <div className="space-y-2">
            {customers.map((customer) => (
              <Button
                key={customer.id}
                variant="outline"
                className="w-full justify-start"
                onClick={() => onSelect(customer)}
              >
                <div className="flex flex-col items-start">
                  <div className="font-medium">{customer.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {customer.id} | {customer.phone}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
