import { create } from "zustand";
import { POSInvoice } from "@/types";

interface InvoiceStore {
  invoices: POSInvoice[];
  drafts: POSInvoice[];
  setInvoices: (invoices: POSInvoice[]) => void;
  addInvoice: (invoice: POSInvoice) => void;
  updateInvoice: (invoice: POSInvoice) => void;
  saveDraft: (draft: POSInvoice) => void;
  deleteDraft: (draftId: string) => void;
  resumeDraft: (draftId: string) => POSInvoice | null;
  getRecentOrders: (limit?: number) => POSInvoice[];
  getOrderHistory: () => POSInvoice[];
  createReturn: (originalInvoice: POSInvoice, returnItems: any[], returnType: "credit" | "refund", reason: string) => void;
}

export const useInvoiceStore = create<InvoiceStore>((set, get) => ({
  invoices: [],
  drafts: [],
  
  setInvoices: (invoices) => set({ invoices }),
  
  addInvoice: (invoice) =>
    set((state) => ({
      invoices: [...state.invoices, invoice],
    })),
  
  updateInvoice: (updatedInvoice) =>
    set((state) => ({
      invoices: state.invoices.map((invoice) =>
        invoice.name === updatedInvoice.name ? updatedInvoice : invoice
      ),
    })),

  saveDraft: (draft) =>
    set((state) => {
      // Generate a draft ID if not present
      const draftToSave = draft.name ? draft : {
        ...draft,
        name: `DRAFT-${Date.now()}`,
        status: "Draft",
        created_at: new Date().toISOString(),
      };
      
      // Update existing draft or add new one
      const existingDraftIndex = state.drafts.findIndex(d => d.name === draftToSave.name);
      const newDrafts = existingDraftIndex >= 0
        ? state.drafts.map((d, i) => i === existingDraftIndex ? draftToSave : d)
        : [...state.drafts, draftToSave];
      
      return { drafts: newDrafts };
    }),

  deleteDraft: (draftId) =>
    set((state) => ({
      drafts: state.drafts.filter(draft => draft.name !== draftId),
    })),

  resumeDraft: (draftId) => {
    const state = get();
    const draft = state.drafts.find(d => d.name === draftId);
    if (draft) {
      set((state) => ({
        drafts: state.drafts.filter(d => d.name !== draftId),
      }));
      return draft;
    }
    return null;
  },

  getRecentOrders: (limit = 10) => {
    const state = get();
    return state.invoices
      .filter(inv => inv.status === "Paid" && !inv.is_return)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);
  },

  getOrderHistory: () => {
    const state = get();
    return state.invoices
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },
  
  createReturn: (originalInvoice, returnItems, returnType, reason) => {
    const now = new Date();
    const returnInvoice: POSInvoice = {
      name: `RET-${Date.now()}`,
      posting_date: now.toISOString().split("T")[0],
      posting_time: now.toTimeString().split(" ")[0],
      customer: originalInvoice.customer,
      customer_name: originalInvoice.customer_name,
      total: returnItems.reduce((sum, item) => sum + (item.rate * item.returnQuantity), 0),
      grand_total: returnItems.reduce((sum, item) => sum + (item.rate * item.returnQuantity), 0),
      net_total: returnItems.reduce((sum, item) => sum + (item.rate * item.returnQuantity), 0),
      status: "Return",
      is_return: true,
      return_against: originalInvoice.name,
      return_reason: reason,
      pos_profile: originalInvoice.pos_profile,
      company: originalInvoice.company,
      warehouse: originalInvoice.warehouse,
      currency: originalInvoice.currency,
      items: returnItems,
      payments: [
        {
          mode_of_payment: returnType === "credit" ? "Store Credit" : "Cash",
          amount: returnItems.reduce((sum, item) => sum + (item.rate * item.returnQuantity), 0),
        },
      ],
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    };

    set((state) => ({
      invoices: [...state.invoices, returnInvoice],
    }));
  },
}));
