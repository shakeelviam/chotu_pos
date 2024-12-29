"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ItemGrid } from "@/components/pos/item-grid";
import { Cart } from "@/components/pos/cart";
import { CustomerSelect } from "@/components/pos/customer-select";
import { ItemGroupSelect } from "@/components/pos/item-group-select";
import { SearchInput } from "@/components/pos/search-input";
import { CartItem, Item, POSInvoice } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { mockItems } from "@/lib/mock";
import {
  RefreshCw,
  ShoppingBag,
  History,
  LogOut,
  Save,
  X as CloseIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { PaymentMethods } from "@/components/pos/payment-methods";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function POSPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSyncDialog, setShowSyncDialog] = useState(false);
  const [showClosePOSDialog, setShowClosePOSDialog] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showRecentOrders, setShowRecentOrders] = useState(false);
  const [showDraftOrders, setShowDraftOrders] = useState(false);
  const [additionalDiscount, setAdditionalDiscount] = useState(0);
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [completedInvoices, setCompletedInvoices] = useState<any[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    // Load mock items on mount
    setItems(mockItems);
  }, []);

  // Focus search input on mount and after item add
  useEffect(() => {
    searchInputRef.current?.focus();
  }, [cartItems]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    // Check for exact matches (barcode/item code)
    const exactMatch = mockItems.find(
      item => 
        item.item_code === query || // Case sensitive for exact matches
        item.barcode === query
    );

    if (exactMatch) {
      handleAddToCart(exactMatch);
      setSearchQuery(""); // Clear search after adding
      searchInputRef.current?.focus(); // Refocus search input
      return;
    }

    // Only filter for display if not an exact match and query is long enough
    if (query.length >= 3) {
      const results = mockItems.filter(item => 
        item.item_name.toLowerCase().includes(query.toLowerCase()) ||
        item.item_code.toLowerCase().includes(query.toLowerCase())
      );
      setItems(results);
    } else if (query.length === 0) {
      setItems(mockItems);
    }
  };

  const handleAddToCart = (item: Item) => {
    setCartItems((prev) => {
      const existingItem = prev.find((i) => i.item_code === item.item_code);
      if (existingItem) {
        return prev.map((i) =>
          i.item_code === item.item_code
            ? { ...i, quantity: i.quantity + 1, amount: (i.quantity + 1) * i.rate }
            : i
        );
      }
      return [...prev, {
        ...item,
        quantity: 1,
        rate: item.standard_rate,
        amount: item.standard_rate,
        discount_percentage: 0,
        discount_amount: 0
      }];
    });
  };

  const handleUpdateCartItem = (updatedItem: CartItem) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.item_code === updatedItem.item_code ? updatedItem : item
      )
    );
  };

  const handleRemoveFromCart = (item: CartItem) => {
    setCartItems((prev) => prev.filter((i) => i.item_code !== item.item_code));
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Cart is empty",
      });
      return;
    }
    setShowPayment(true);
  };

  const handlePaymentComplete = async (payments: any[]) => {
    try {
      const total = cartItems.reduce((acc, item) => acc + item.amount, 0) * (1 - additionalDiscount / 100);
      
      const invoice = {
        items: cartItems,
        total_amount: total,
        payments,
        customer: "Cash Customer",
        posting_date: new Date().toISOString(),
        is_return: false
      };
      
      // Mock successful payment
      setCompletedInvoices(prev => [...prev, invoice]);
      
      toast({
        title: "Success",
        description: "Payment completed successfully",
      });
      
      setShowPayment(false);
      setShowPrintDialog(true);
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process payment",
      });
    }
  };

  const handlePrint = () => {
    // TODO: Implement print functionality
    toast({
      title: "Success",
      description: "Invoice sent to printer",
    });
    setShowPrintDialog(false);
    setCartItems([]);
    setAdditionalDiscount(0);
  };

  const handleSaveAsDraft = async () => {
    if (cartItems.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Cart is empty",
      });
      return;
    }

    // Mock saving as draft
    toast({
      title: "Success",
      description: "Invoice saved as draft",
    });
    setCartItems([]);
  };

  const handleSync = async () => {
    try {
      // Mock sync
      toast({
        title: "Success",
        description: "Data synced successfully",
      });
      setShowSyncDialog(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to sync data",
      });
    }
  };

  const handleClosePOS = async () => {
    try {
      // Mock POS closing
      toast({
        title: "Success",
        description: "POS closed successfully",
      });
      setShowClosePOSDialog(false);
      router.push('/dashboard');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to close POS",
      });
    }
  };

  const handleLogout = () => {
    setShowSyncDialog(true);
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="flex justify-between items-center p-4 bg-background border-b">
        <div className="flex items-center gap-2">
          <div className="text-xl font-semibold">Chotu POS</div>
        </div>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSync}
                >
                  <RefreshCw className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Sync with ERPNext</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowDraftOrders(true)}
                >
                  <Save className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Saved Drafts</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowRecentOrders(true)}
                >
                  <ShoppingBag className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Recent Orders</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowRecentOrders(true)}
                >
                  <History className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Order History</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Logout</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="flex-1 flex">
        <div className="flex-1 flex flex-col p-4 overflow-hidden">
          <div className="flex gap-4 mb-4">
            <ItemGroupSelect />
            <SearchInput
              ref={searchInputRef}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="flex-1"
            />
          </div>

          {/* Items Grid */}
          <div className="flex-1 overflow-auto">
            <ItemGrid
              items={items}
              onAddToCart={handleAddToCart}
            />
          </div>
        </div>

        {/* Right Side - Cart */}
        <div className="w-[400px] border-l flex flex-col">
          <CustomerSelect />
          <Cart
            items={cartItems}
            onUpdateItem={handleUpdateCartItem}
            onRemoveItem={handleRemoveFromCart}
            onCheckout={handleCheckout}
            currencySymbol="KD"
            additionalDiscount={additionalDiscount}
            onAdditionalDiscountChange={setAdditionalDiscount}
          />
        </div>
      </div>

      {/* Payment Dialog */}
      {showPayment && (
        <PaymentMethods
          open={showPayment}
          onClose={() => setShowPayment(false)}
          total={cartItems.reduce((acc, item) => acc + item.amount, 0) * (1 - additionalDiscount / 100)}
          currencySymbol="KD"
          onSubmit={handlePaymentComplete}
        />
      )}

      {/* Print Dialog */}
      <Dialog open={showPrintDialog} onOpenChange={setShowPrintDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Print Invoice</DialogTitle>
          </DialogHeader>
          <p>Would you like to print the invoice?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowPrintDialog(false);
              setCartItems([]);
              setAdditionalDiscount(0);
            }}>
              Skip
            </Button>
            <Button onClick={handlePrint}>
              Print
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sync Dialog */}
      <Dialog open={showSyncDialog} onOpenChange={setShowSyncDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sync Required</DialogTitle>
          </DialogHeader>
          <p>Please sync all data before logging out.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSyncDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              handleSync();
              setShowClosePOSDialog(true);
            }}>
              Sync & Close POS
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Close POS Dialog */}
      <Dialog open={showClosePOSDialog} onOpenChange={setShowClosePOSDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Close POS</DialogTitle>
          </DialogHeader>
          <p>Please count your cash drawer and enter the closing amount.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowClosePOSDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleClosePOS}>
              Close POS
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
