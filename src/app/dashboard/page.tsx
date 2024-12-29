"use client";

import { useEffect, useState, ChangeEvent } from "react";
import { ItemCard } from "@/components/pos/item-card";
import { Cart } from "@/components/pos/cart";
import { Customer, Item, POSProfile, CartItem } from "@/types";
import { Input } from "@/components/ui/input";
import { Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

export default function DashboardPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [customerQuery, setCustomerQuery] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [posProfile, setPosProfile] = useState<POSProfile | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadInitialData();
  }, []);

  // Debounce search to handle barcode scanner input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        handleSearch(searchQuery);
      }
    }, 150); // Small delay to handle barcode scanner input

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadInitialData = async () => {
    try {
      // Load Items
      const result = await window.electron.getItems();
      if (result.success) {
        setItems(result.items);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load items",
        });
      }

      // Load default customer if any
      const customerResult = await window.electron.getDefaultCustomer();
      if (customerResult.success && customerResult.customer) {
        setSelectedCustomer(customerResult.customer);
      }
    } catch (error) {
      console.error("Failed to load initial data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load initial data",
      });
    }
  };

  const handleSearch = (query: string) => {
    const searchTerm = query.trim().toLowerCase();
    if (!searchTerm) return;

    // Try exact match first (prioritize barcode, then item code)
    const exactMatch = items.find(
      item => 
        item.barcode?.toLowerCase() === searchTerm ||
        item.item_code.toLowerCase() === searchTerm
    );

    if (exactMatch) {
      handleAddToCart(exactMatch);
      setSearchQuery('');
      return;
    }

    // Only show error for barcode/item code searches
    if (searchTerm.length >= 5) {
      toast({
        variant: "destructive",
        title: "Not Found",
        description: "No matching item found",
      });
    }
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const searchCustomers = async (query: string) => {
    if (query.length < 3) return;
    try {
      const result = await window.electron.searchCustomers(query);
      if (result.success) {
        setCustomers(result.customers);
      }
    } catch (error) {
      console.error("Failed to search customers:", error);
    }
  };

  const handleAddToCart = (item: Item) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.item_code === item.item_code);
      if (existing) {
        return prev.map((i) =>
          i.item_code === item.item_code
            ? { ...i, quantity: (i.quantity || 0) + 1 }
            : i
        );
      }
      return [...prev, { ...item, quantity: 1, rate: item.standard_rate, amount: item.standard_rate }];
    });
  };

  const handleUpdateQuantity = (itemCode: string, quantity: number) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.item_code === itemCode
          ? { ...item, quantity, amount: item.rate * quantity }
          : item
      )
    );
  };

  const handleRemoveItem = (itemCode: string) => {
    setCartItems((prev) => prev.filter((item) => item.item_code !== itemCode));
  };

  const handleCheckout = async () => {
    if (!selectedCustomer) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a customer before checkout",
      });
      return;
    }

    if (cartItems.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Cart is empty",
      });
      return;
    }

    try {
      const sale = {
        customer: selectedCustomer.name,
        items: cartItems,
        pos_profile: posProfile?.name,
        company: posProfile?.company,
        warehouse: posProfile?.warehouse,
        posting_date: new Date().toISOString().split('T')[0],
        posting_time: new Date().toISOString().split('T')[1],
      };

      const result = await window.electron.createSale(sale);
      if (result.success) {
        setCartItems([]);
        toast({
          title: "Success",
          description: "Sale completed successfully",
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Failed to create sale:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create sale",
      });
    }
  };

  const filteredItems = items.filter((item) =>
    item.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.item_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.barcode && item.barcode.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex gap-6 h-[calc(100vh-2.5rem)]">
      {/* Left Side - Items */}
      <div className="flex-1 flex flex-col">
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search items by name, code or scan barcode..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-9"
            autoFocus
          />
        </div>

        {/* Items Grid */}
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4">
            {filteredItems.map((item) => (
              <ItemCard
                key={item.item_code}
                item={item}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Customer & Cart */}
      <div className="w-[400px] flex flex-col">
        {/* Customer Section */}
        <Card className="p-4 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <User className="h-4 w-4" />
            <h2 className="font-semibold">Customer</h2>
          </div>

          <div className="space-y-4">
            <Input
              placeholder="Search customer by name or mobile..."
              value={customerQuery}
              onChange={(e) => {
                setCustomerQuery(e.target.value);
                searchCustomers(e.target.value);
              }}
            />

            {customers.length > 0 && (
              <Card className="absolute w-[368px] mt-1 p-2 shadow-lg z-10">
                <div className="max-h-48 overflow-auto">
                  {customers.map((customer) => (
                    <Button
                      key={customer.id}
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        setSelectedCustomer(customer);
                        setCustomers([]);
                        setCustomerQuery("");
                      }}
                    >
                      <div>
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {customer.mobile}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </Card>
            )}

            {selectedCustomer && (
              <Card className="p-3">
                <div className="font-medium">{selectedCustomer.name}</div>
                <div className="text-sm text-muted-foreground">
                  {selectedCustomer.mobile}
                </div>
                {selectedCustomer.loyalty_points && (
                  <div className="text-sm text-primary mt-1">
                    Loyalty Points: {selectedCustomer.loyalty_points}
                  </div>
                )}
              </Card>
            )}
          </div>
        </Card>

        {/* Cart Section */}
        <div className="flex-1 overflow-hidden">
          <Cart
            items={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onCheckout={handleCheckout}
            currencySymbol={posProfile?.currency || "KD"}
          />
        </div>
      </div>
    </div>
  );
}
