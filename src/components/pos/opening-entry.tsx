"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  company: z.string().min(1, "Company is required"),
  posProfile: z.string().min(1, "POS Profile is required"),
  balanceDetails: z.array(z.object({
    modeOfPayment: z.string().min(1, "Mode of Payment is required"),
    openingAmount: z.number().min(0, "Amount must be 0 or greater"),
  })).min(1, "At least one payment mode is required"),
});

type OpeningEntryData = z.infer<typeof formSchema>;

interface Company {
  name: string;
  label: string;
}

interface POSProfile {
  name: string;
  label: string;
}

interface PaymentMethod {
  name: string;
  type: string;
}

export default function POSOpeningPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [profiles, setProfiles] = useState<POSProfile[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const router = useRouter();
  const { toast } = useToast();

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

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Load companies
        const companiesResponse = await window.electron.getCompanies();
        if (companiesResponse.success) {
          setCompanies(companiesResponse.companies);
        }

        // Load payment methods
        const methodsResponse = await window.electron.getPaymentMethods();
        if (methodsResponse.success) {
          setPaymentMethods(methodsResponse.methods);
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Failed to load initial data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load required data. Please try again.",
        });
      }
    };

    loadInitialData();
  }, []);

  // Load POS profiles when company changes
  const onCompanyChange = async (company: string) => {
    try {
      const response = await window.electron.getPOSProfiles(company);
      if (response.success) {
        setProfiles(response.profiles);
        form.setValue("company", company);
        form.setValue("posProfile", ""); // Reset POS profile when company changes
      }
    } catch (error) {
      console.error("Failed to load POS profiles:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load POS profiles",
      });
    }
  };

  const handleSubmit = async (data: OpeningEntryData) => {
    setIsSubmitting(true);
    try {
      const result = await window.electron.createPOSOpening(data);
      if (result.success) {
        toast({
          title: "Success",
          description: "POS Opening Entry created successfully",
        });
        router.push("/pos"); // Redirect to POS interface
      } else {
        throw new Error(result.error || "Failed to create POS Opening Entry");
      }
    } catch (error: any) {
      console.error("Error submitting opening entry:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to submit opening entry",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Create POS Opening Entry</h1>
          <p className="text-muted-foreground">Enter opening balance details to start POS session</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company</FormLabel>
                  <Select
                    onValueChange={(value) => onCompanyChange(value)}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select company" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company.name} value={company.name}>
                          {company.label}
                        </SelectItem>
                      ))}
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
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select POS profile" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {profiles.map((profile) => (
                        <SelectItem key={profile.name} value={profile.name}>
                          {profile.label}
                        </SelectItem>
                      ))}
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
                  Add Payment Method
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
                                  <SelectValue placeholder="Select payment mode" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {paymentMethods.map((method) => (
                                  <SelectItem key={method.name} value={method.name}>
                                    {method.name}
                                  </SelectItem>
                                ))}
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
                              step="0.001"
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
              <Button variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}