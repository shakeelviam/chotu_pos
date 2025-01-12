// src/components/pos/pos-closing.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { POSClosingDetail, POSSessionBalance } from "@/types";

const closingSchema = z.object({
  closing_details: z.array(z.object({
    mode_of_payment: z.string(),
    opening_amount: z.number(),
    expected_amount: z.number(),
    closing_amount: z.number(),
    difference: z.number(),
  })),
});

type FormData = z.infer<typeof closingSchema>;

interface POSClosingProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function POSClosing({ onClose, onSuccess }: POSClosingProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [balance, setBalance] = useState<POSSessionBalance | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(closingSchema),
    defaultValues: {
      closing_details: [],
    },
  });

  useEffect(() => {
    const loadBalance = async () => {
      try {
        const response = await window.electron.getCurrentBalance();
        if (response.success && response.balance) {
          setBalance(response.balance);

          // Pre-fill the form with expected amounts
          form.reset({
            closing_details: response.balance.expected.map(detail => ({
              ...detail,
              closing_amount: detail.expected_amount,
              difference: 0,
            })),
          });
        }
      } catch (error) {
        console.error('Failed to load balance:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load current balance",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadBalance();
  }, []);

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const currentSession = await window.electron.getCurrentPOSEntry();
      if (!currentSession?.entry?.id) {
        throw new Error('No active POS session found');
      }

      const result = await window.electron.createPOSClosing({
        pos_opening_entry: currentSession.entry.id,
        closing_details: data.closing_details,
      });

      if (result.success) {
        toast({
          title: "Success",
          description: "POS closing entry created successfully",
        });
        onSuccess();
      } else {
        throw new Error(result.error || 'Failed to create POS closing entry');
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to submit closing entry",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClosingAmountChange = (index: number, value: number) => {
    const details = form.getValues('closing_details');
    const detail = details[index];
    const difference = value - detail.expected_amount;

    form.setValue(`closing_details.${index}.closing_amount`, value);
    form.setValue(`closing_details.${index}.difference`, difference);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Close POS Session</h2>
        <p className="text-sm text-muted-foreground">Enter closing amounts for each payment method</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payment Method</TableHead>
                <TableHead className="text-right">Opening</TableHead>
                <TableHead className="text-right">Expected</TableHead>
                <TableHead className="text-right">Closing</TableHead>
                <TableHead className="text-right">Difference</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {form.watch('closing_details').map((detail, index) => (
                <TableRow key={detail.mode_of_payment}>
                  <TableCell>{detail.mode_of_payment}</TableCell>
                  <TableCell className="text-right">
                    {detail.opening_amount.toFixed(3)}
                  </TableCell>
                  <TableCell className="text-right">
                    {detail.expected_amount.toFixed(3)}
                  </TableCell>
                  <TableCell>
                    <FormField
                      control={form.control}
                      name={`closing_details.${index}.closing_amount`}
                      render={({ field }) => (
                        <FormControl>
                          <Input
                            type="number"
                            step="0.001"
                            className="text-right"
                            {...field}
                            onChange={e => handleClosingAmountChange(index, parseFloat(e.target.value))}
                          />
                        </FormControl>
                      )}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={detail.difference < 0 ? 'text-red-500' : 'text-green-500'}>
                      {detail.difference.toFixed(3)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}