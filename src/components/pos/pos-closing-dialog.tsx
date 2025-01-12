// src/components/pos/pos-closing-dialog.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { POSClosing } from "./pos-closing";

interface POSClosingDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function POSClosingDialog({ open, onClose, onSuccess }: POSClosingDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Close POS Session</DialogTitle>
        </DialogHeader>
        <POSClosing onClose={onClose} onSuccess={onSuccess} />
      </DialogContent>
    </Dialog>
  );
}