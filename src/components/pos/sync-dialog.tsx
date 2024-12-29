import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface SyncDialogProps {
  open: boolean;
  onClose: () => void;
  onSync: () => void;
}

export function SyncDialog({ open, onClose, onSync }: SyncDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sync Required</DialogTitle>
        </DialogHeader>
        <p>Please sync all data before logging out.</p>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSync}>Sync & Close POS</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
