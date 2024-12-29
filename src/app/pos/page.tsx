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
  LogOut,
  Save,
  X as CloseIcon,
  FileText,
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
import { InvoiceDialog } from "@/components/pos/invoice-dialog";
import { createInvoice, printInvoice, emailInvoice } from "@/lib/invoice";
import { useInvoiceStore } from "@/lib/store/invoice-store";
import { OrdersDialog } from "@/components/pos/orders-dialog";

export default function POSPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSyncDialog, setShowSyncDialog] = useState(false);
  const [showClosePOSDialog, setShowClosePOSDialog] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showOrdersDialog, setShowOrdersDialog] = useState(false);
  const [additionalDiscount, setAdditionalDiscount] = useState(0);
  const [customer, setCustomer] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [currentInvoice, setCurrentInvoice] = useState<POSInvoice | null>(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [showRecentOrders, setShowRecentOrders] = useState(false);
  const [showDraftOrders, setShowDraftOrders] = useState(false);
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [completedInvoices, setCompletedInvoices] = useState<any[]>([]);
  const [showDraftsDialog, setShowDraftsDialog] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const router = useRouter();
  const addInvoice = useInvoiceStore((state) => state.addInvoice);
  const saveDraft = useInvoiceStore((state) => state.saveDraft);
  const drafts = useInvoiceStore((state) => state.drafts);
  const resumeDraft = useInvoiceStore((state) => state.resumeDraft);

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
      const invoice = createInvoice(cartItems, "Cash Customer", payments, additionalDiscount);
      
      // Add to invoice store
      addInvoice(invoice);
      
      // Set current invoice for display
      setCurrentInvoice(invoice);
      
      toast({
        title: "Success",
        description: "Payment completed successfully",
      });
      
      setShowPayment(false);
      setShowInvoice(true);
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process payment",
      });
    }
  };

  const handlePrintInvoice = async () => {
    if (!currentInvoice) return;
    
    try {
      await printInvoice(currentInvoice);
      toast({
        title: "Success",
        description: "Invoice sent to printer",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to print invoice",
      });
    }
  };

  const handleEmailInvoice = async () => {
    if (!currentInvoice) return;
    
    try {
      // For now, we'll just use a dummy email
      await emailInvoice(currentInvoice, "customer@example.com");
      toast({
        title: "Success",
        description: "Invoice sent to email",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to email invoice",
      });
    }
  };

  const handleCloseInvoice = () => {
    setShowInvoice(false);
    setCurrentInvoice(null);
    setCartItems([]);
    setAdditionalDiscount(0);
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

  const handleSaveDraft = () => {
    if (cartItems.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Cannot save empty cart as draft",
      });
      return;
    }

    const draft = {
      customer: "Cash Customer",
      customer_name: "Cash Customer",
      items: cartItems,
      total: cartItems.reduce((sum, item) => sum + item.amount, 0),
      grand_total: cartItems.reduce((sum, item) => sum + item.amount, 0),
      net_total: cartItems.reduce((sum, item) => sum + item.amount, 0),
      status: "Draft",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    saveDraft(draft);
    toast({
      title: "Success",
      description: "Draft saved successfully",
    });
    setCartItems([]);
  };

  const handleResumeDraft = (draftId: string) => {
    const draft = resumeDraft(draftId);
    if (draft) {
      setCartItems(draft.items);
      toast({
        title: "Success",
        description: "Draft loaded successfully",
      });
    }
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
                  onClick={() => setShowDraftsDialog(true)}
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
                  onClick={() => setShowOrdersDialog(true)}
                >
                  <ShoppingBag className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View Orders</p>
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
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSaveDraft}
            className="gap-2"
          >
            <FileText className="h-4 w-4" />
            Save Draft
          </Button>
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
          total={(() => {
            const subtotal = cartItems.reduce((sum, item) => sum + item.amount, 0);
            const totalDiscount = cartItems.reduce((sum, item) => sum + (item.discount_amount || 0), 0);
            const additionalDiscountAmount = additionalDiscount ? (subtotal - totalDiscount) * (additionalDiscount / 100) : 0;
            return subtotal - totalDiscount - additionalDiscountAmount;
          })()}
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

      {/* Invoice Dialog */}
      {currentInvoice && (
        <InvoiceDialog
          invoice={currentInvoice}
          open={showInvoice}
          onClose={handleCloseInvoice}
          onPrint={handlePrintInvoice}
          onEmail={handleEmailInvoice}
        />
      )}

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

      {/* Drafts Dialog */}
      <Dialog open={showDraftsDialog} onOpenChange={setShowDraftsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Saved Drafts</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {drafts.length === 0 ? (
              <p className="text-center text-muted-foreground">No drafts found</p>
            ) : (
              drafts.map((draft) => (
                <div
                  key={draft.name}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{draft.customer_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(draft.created_at).toLocaleDateString()} • {draft.items.length} items
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleResumeDraft(draft.name)}
                    >
                      Resume
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Orders Dialog */}
      <OrdersDialog 
        open={showOrdersDialog} 
        onClose={() => setShowOrdersDialog(false)} 
      />
    </div>
  );
}
