"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
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
import { POSClosingDialog } from "@/components/pos/pos-closing-dialog";
import { RecentOrders } from "@/components/pos/recent-orders";
import { ReturnDialog } from "@/components/pos/return-dialog";

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
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [currentInvoice, setCurrentInvoice] = useState<POSInvoice | null>(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [showRecentOrders, setShowRecentOrders] = useState(false);
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [showPOSClosing, setShowPOSClosing] = useState(false);
  const [showDraftsDialog, setShowDraftsDialog] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const itemGroups = ["all", "group1", "group2"]; // Define your item groups here
  const { toast } = useToast();
  const router = useRouter();
  const addInvoice = useInvoiceStore((state) => state.addInvoice);
  const saveDraft = useInvoiceStore((state) => state.saveDraft);
  const drafts = useInvoiceStore((state) => state.drafts);
  const resumeDraft = useInvoiceStore((state) => state.resumeDraft);

  useEffect(() => {
    console.log("Mock Items:", mockItems);  // Check if mockItems are available
    setItems(mockItems);
  }, []);

  const filteredItems = useMemo(() => {
    console.log("Filtering for group:", selectedGroup);
    return selectedGroup.toLowerCase() === "all"
      ? items
      : items.filter(
          (item) => item.item_group?.toLowerCase() === selectedGroup.toLowerCase()
        );
  }, [selectedGroup, items]);



  const handleResumeDraft = (draftName: string) => {
    const draft = resumeDraft(draftName);
    if (draft) {
      setCartItems(draft.items);
      toast({
        title: "Success",
        description: "Draft resumed successfully",
      });
    }
  };

  const handleUpdateItem = (updatedItem: CartItem) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.item_code === updatedItem.item_code ? updatedItem : item
      )
    );
  };

  const handleRemoveItem = (itemToRemove: CartItem) => {
    setCartItems((prev) =>
      prev.filter((item) => item.item_code !== itemToRemove.item_code)
    );
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="flex justify-between items-center p-4 bg-background border-b">
        <div className="text-xl font-semibold">Chotu POS</div>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon">
                  <RefreshCw className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Sync with ERPNext</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => saveDraft()}>
                  <Save className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Save as Draft</p>
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
                  onClick={() => router.push("/")}
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
            <ItemGroupSelect
              value={selectedGroup}
              onValueChange={setSelectedGroup}
              groups={itemGroups}
            />
            <SearchInput
              ref={searchInputRef}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
          </div>
          <ItemGrid
            items={items.filter(
              (item) =>
                selectedGroup === "All" ||
                item.item_group === selectedGroup
            )}
            onAddToCart={(item) =>
              setCartItems((prev) => [...prev, { ...item, quantity: 1 }])
            }
          />
        </div>
        <div className="w-[400px] border-l flex flex-col">
          <CustomerSelect />
          <Cart
            items={cartItems}
            onUpdateItem={handleUpdateItem}
            onRemoveItem={handleRemoveItem}
            onCheckout={() => setShowPayment(true)}
            currencySymbol="KD"
            additionalDiscount={additionalDiscount}
            onAdditionalDiscountChange={(value) => setAdditionalDiscount(value)}
          />
        </div>
      </div>

      {/* Drafts Dialog */}
      <Dialog open={showDraftsDialog} onOpenChange={setShowDraftsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Saved Drafts</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {drafts?.length === 0 ? (
              <p className="text-center text-muted-foreground">
                No drafts found
              </p>
            ) : (
              drafts?.map((draft) => (
                <div
                  key={draft.name || draft.created_at}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{draft.customer_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(draft.created_at).toLocaleDateString()} •{" "}
                      {draft.items.length} items
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        draft.name ? handleResumeDraft(draft.name) : null
                      }
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

      {/* Return Dialog */}
      {currentInvoice && (
        <ReturnDialog
          invoice={currentInvoice}
          open={showReturnDialog}
          onClose={() => setShowReturnDialog(false)}
        />
      )}
    </div>
  );
}
