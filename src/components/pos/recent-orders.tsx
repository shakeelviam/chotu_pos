"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { ScrollArea } from "../ui/scroll-area";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Search } from "lucide-react";

interface Order {
  id: string;
  customer: string;
  date: string;
  total: number;
  status: string;
  items: Array<{
    item_code: string;
    item_name: string;
    quantity: number;
    rate: number;
  }>;
}

interface RecentOrdersProps {
  open: boolean;
  onClose: () => void;
}

// Mock data
const mockOrders: Order[] = [
  {
    id: "SO-2024-001",
    customer: "John Doe",
    date: "2024-12-29",
    total: 150.500,
    status: "Paid",
    items: [
      {
        item_code: "ITEM-001",
        item_name: "Laptop",
        quantity: 1,
        rate: 150.500
      }
    ]
  },
  {
    id: "SO-2024-002",
    customer: "Jane Smith",
    date: "2024-12-29",
    total: 49.990,
    status: "Paid",
    items: [
      {
        item_code: "ITEM-002",
        item_name: "Mouse",
        quantity: 1,
        rate: 49.990
      }
    ]
  }
];

export function RecentOrders({ open, onClose }: RecentOrdersProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [orders, setOrders] = useState<Order[]>(mockOrders);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filtered = mockOrders.filter(
      order =>
        order.id.toLowerCase().includes(query.toLowerCase()) ||
        order.customer.toLowerCase().includes(query.toLowerCase())
    );
    setOrders(filtered);
  };

  const handleOrderClick = (order: Order) => {
    // TODO: Implement order details view
    console.log("Order clicked:", order);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Recent Orders</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders by ID or customer name..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-8"
          />
        </div>

        <ScrollArea className="flex-1 mt-4">
          <div className="space-y-2">
            {orders.map((order) => (
              <Button
                key={order.id}
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleOrderClick(order)}
              >
                <div className="flex justify-between w-full">
                  <div className="flex flex-col items-start">
                    <div className="font-medium">{order.id}</div>
                    <div className="text-sm text-muted-foreground">
                      {order.customer} | {order.date}
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="font-medium">KD {order.total.toFixed(3)}</div>
                    <div className="text-sm text-muted-foreground">
                      {order.status}
                    </div>
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
