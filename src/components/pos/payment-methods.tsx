import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PaymentMethod {
  mode: string;
  amount: number;
}

interface PaymentMethodsProps {
  open: boolean;
  onClose: () => void;
  total: number;
  currencySymbol: string;
  onSubmit: (payments: PaymentMethod[]) => void;
}

export function PaymentMethods({
  open,
  onClose,
  total,
  currencySymbol,
  onSubmit,
}: PaymentMethodsProps) {
  const [payments, setPayments] = React.useState<PaymentMethod[]>([
    { mode: 'cash', amount: total },
  ]);

  const remainingAmount = total - payments.reduce((sum, p) => sum + p.amount, 0);

  const handleAddPayment = () => {
    if (remainingAmount > 0) {
      setPayments([...payments, { mode: 'cash', amount: remainingAmount }]);
    }
  };

  const handleRemovePayment = (index: number) => {
    setPayments(payments.filter((_, i) => i !== index));
  };

  const handlePaymentChange = (index: number, field: keyof PaymentMethod, value: string | number) => {
    const newPayments = [...payments];
    newPayments[index] = {
      ...newPayments[index],
      [field]: field === 'amount' ? Number(value) : value,
    };
    setPayments(newPayments);
  };

  const handleSubmit = () => {
    if (Math.abs(remainingAmount) < 0.001) {
      onSubmit(payments);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Payment</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-medium">Total Amount</span>
            <span className="font-bold">
              {currencySymbol} {total.toFixed(3)}
            </span>
          </div>

          {payments.map((payment, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center gap-2">
                <Select
                  value={payment.mode}
                  onValueChange={(value) => handlePaymentChange(index, 'mode', value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select payment mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  value={payment.amount}
                  onChange={(e) => handlePaymentChange(index, 'amount', e.target.value)}
                  className="flex-1"
                  step="0.001"
                  min="0"
                />
                {index > 0 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemovePayment(index)}
                    className="text-destructive"
                  >
                    ×
                  </Button>
                )}
              </div>
            </div>
          ))}

          <div className="flex justify-between items-center text-sm">
            <span>Remaining</span>
            <span className={remainingAmount > 0 ? 'text-destructive' : 'text-green-600'}>
              {currencySymbol} {Math.abs(remainingAmount).toFixed(3)}
            </span>
          </div>

          <div className="flex justify-between gap-2">
            <Button
              variant="outline"
              onClick={handleAddPayment}
              disabled={remainingAmount <= 0}
            >
              Add Payment Method
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={Math.abs(remainingAmount) >= 0.001}
            >
              Submit
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
