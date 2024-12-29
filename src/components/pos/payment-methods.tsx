import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
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
import { Label } from '@/components/ui/label';

interface PaymentMethod {
  mode: string;
  amount: number;
  reference?: string;
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
  const [cashReceived, setCashReceived] = React.useState(total);
  const changeAmount = Math.max(0, cashReceived - total);

  const denominations = [
    { label: '0.250', value: 0.250 },
    { label: '0.500', value: 0.500 },
    { label: '1.000', value: 1.000 },
    { label: '5.000', value: 5.000 },
    { label: '10.000', value: 10.000 },
    { label: '20.000', value: 20.000 },
  ];

  const handleDenominationClick = (value: number) => {
    const newAmount = cashReceived + value;
    setCashReceived(Number(newAmount.toFixed(3)));
    handlePaymentChange(0, 'amount', newAmount);
  };

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
      [field]: field === 'amount' ? Number(Number(value).toFixed(3)) : value,
    };
    setPayments(newPayments);
    if (field === 'amount') {
      setCashReceived(Number(Number(value).toFixed(3)));
    }
  };

  const handleSubmit = () => {
    // Validate reference numbers for bank payments
    const isValid = payments.every(payment => {
      if (payment.mode !== 'cash') {
        return payment.reference && payment.reference.trim().length > 0;
      }
      return true;
    });

    if (!isValid) {
      alert('Please enter reference numbers for all bank/card payments');
      return;
    }

    if (Math.abs(remainingAmount) < 0.001) {
      onSubmit(payments);
      onClose();
    }
  };

  const isCardPayment = (mode: string) => {
    return ['card', 'knet', 'link', 'wamd'].includes(mode);
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
                    <SelectItem value="knet">KNET</SelectItem>
                    <SelectItem value="card">Credit Card</SelectItem>
                    <SelectItem value="link">Payment Link</SelectItem>
                    <SelectItem value="wamd">WAMD</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  value={payment.amount.toFixed(3)}
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
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Reference number input for bank/card payments */}
              {isCardPayment(payment.mode) && (
                <div className="space-y-1">
                  <Label htmlFor={`reference-${index}`}>Reference Number</Label>
                  <Input
                    id={`reference-${index}`}
                    type="text"
                    value={payment.reference || ''}
                    onChange={(e) => handlePaymentChange(index, 'reference', e.target.value)}
                    placeholder="Enter approval code"
                    className="w-full"
                  />
                </div>
              )}
            </div>
          ))}

          {/* Denomination buttons - only show for cash payment */}
          {payments[0].mode === 'cash' && (
            <div className="grid grid-cols-3 gap-2">
              {denominations.map((denom) => (
                <Button
                  key={denom.value}
                  variant="outline"
                  onClick={() => handleDenominationClick(denom.value)}
                  className="text-sm"
                >
                  {currencySymbol} {denom.label}
                </Button>
              ))}
            </div>
          )}

          {/* Show change amount for cash payments */}
          {payments[0].mode === 'cash' && changeAmount > 0 && (
            <div className="flex justify-between items-center text-sm font-medium">
              <span>Change</span>
              <span className="text-green-600">
                {currencySymbol} {changeAmount.toFixed(3)}
              </span>
            </div>
          )}

          {remainingAmount > 0 && (
            <div className="flex justify-between items-center">
              <span>Remaining</span>
              <span className="text-destructive">
                {currencySymbol} {remainingAmount.toFixed(3)}
              </span>
            </div>
          )}

          {remainingAmount > 0 && (
            <Button
              variant="outline"
              onClick={handleAddPayment}
              className="w-full"
            >
              Add Payment Method
            </Button>
          )}

          <Button
            onClick={handleSubmit}
            className="w-full"
            disabled={Math.abs(remainingAmount) >= 0.001}
          >
            Submit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
