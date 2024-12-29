"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const formSchema = z.object({
  company: z.string().min(1, "Company is required"),
  posProfile: z.string().min(1, "POS Profile is required"),
  balanceDetails: z.array(z.object({
    modeOfPayment: z.string().min(1, "Mode of Payment is required"),
    openingAmount: z.number().min(0, "Amount must be 0 or greater"),
  })).min(1, "At least one payment mode is required"),
});

type OpeningEntryData = z.infer<typeof formSchema>;

interface OpeningEntryProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: OpeningEntryData) => void;
}

export function POSOpeningEntry({ open, onClose, onSubmit }: OpeningEntryProps) {
  const form = useForm<OpeningEntryData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      company: "",
      posProfile: "",
      balanceDetails: [
        { modeOfPayment: "", openingAmount: 0 }
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "balanceDetails"
  });

  const { toast } = useToast();

  const handleSubmit = async (data: OpeningEntryData) => {
    try {
      await onSubmit(data);
      onClose();
    } catch (error) {
      console.error("Error submitting opening entry:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit opening entry",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create POS Opening Entry</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select company" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="company1">Company 1</SelectItem>
                      <SelectItem value="company2">Company 2</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="posProfile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>POS Profile</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select POS profile" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="retail">Retail POS</SelectItem>
                      <SelectItem value="restaurant">Restaurant POS</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Opening Balance Details</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ modeOfPayment: "", openingAmount: 0 })}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Row
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mode of Payment</TableHead>
                    <TableHead>Opening Amount</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => (
                    <TableRow key={field.id}>
                      <TableCell>
                        <FormField
                          control={form.control}
                          name={`balanceDetails.${index}.modeOfPayment`}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select mode" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="cash">Cash</SelectItem>
                                <SelectItem value="card">Card</SelectItem>
                                <SelectItem value="bank">Bank Transfer</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <FormField
                          control={form.control}
                          name={`balanceDetails.${index}.openingAmount`}
                          render={({ field }) => (
                            <Input
                              type="number"
                              {...field}
                              onChange={e => field.onChange(parseFloat(e.target.value))}
                            />
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(index)}
                          disabled={fields.length === 1}
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit">Submit</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
