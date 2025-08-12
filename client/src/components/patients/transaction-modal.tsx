import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { 
  useRecordPayment, 
  useRecordCharge, 
  useRecordRefund 
} from "@/hooks/use-financial";
import { type Currency, toSmallestUnit, SUPPORTED_CURRENCIES } from "@/lib/currency";

const transactionSchema = z.object({
  amount: z.string().min(1, "Amount is required").refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    "Amount must be a positive number"
  ),
  currency: z.enum(["EUR", "RSD", "CHF"]).default("EUR"),
  description: z.string().min(1, "Description is required"),
  paymentMethod: z.string().optional(),
  category: z.string().optional(),
  notes: z.string().optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: number;
  type: 'payment' | 'charge' | 'refund';
}

export function TransactionModal({ isOpen, onClose, patientId, type }: TransactionModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const recordPayment = useRecordPayment();
  const recordCharge = useRecordCharge();
  const recordRefund = useRecordRefund();

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      amount: "",
      currency: "EUR",
      description: "",
      paymentMethod: type === 'payment' ? 'cash' : undefined,
      category: "",
      notes: "",
    },
  });

  const getModalTitle = () => {
    switch (type) {
      case 'payment':
        return 'Record Payment';
      case 'charge':
        return 'Add Charge';
      case 'refund':
        return 'Process Refund';
      default:
        return 'Financial Transaction';
    }
  };

  const getModalDescription = () => {
    switch (type) {
      case 'payment':
        return 'Record a payment received from the patient';
      case 'charge':
        return 'Add a new charge or outstanding balance for the patient';
      case 'refund':
        return 'Process a refund to the patient';
      default:
        return 'Add a new financial transaction';
    }
  };

  const onSubmit = async (data: TransactionFormData) => {
    setIsSubmitting(true);
    try {
      const amount = toSmallestUnit(parseFloat(data.amount), data.currency as Currency);
      
      const transactionData = {
        patientId,
        amount,
        currency: data.currency as Currency,
        description: data.description,
        notes: data.notes || undefined,
      };

      switch (type) {
        case 'payment':
          await recordPayment.mutateAsync({
            ...transactionData,
            paymentMethod: data.paymentMethod || 'cash',
          });
          toast({
            title: "Payment Recorded",
            description: "The payment has been successfully recorded.",
          });
          break;
        case 'charge':
          await recordCharge.mutateAsync({
            ...transactionData,
            category: data.category || 'treatment',
          });
          toast({
            title: "Charge Added",
            description: "The charge has been successfully added.",
          });
          break;
        case 'refund':
          await recordRefund.mutateAsync({
            ...transactionData,
            reason: data.description,
            paymentMethod: data.paymentMethod,
          });
          toast({
            title: "Refund Processed",
            description: "The refund has been successfully processed.",
          });
          break;
      }

      onClose();
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process transaction. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{getModalTitle()}</DialogTitle>
          <DialogDescription>{getModalDescription()}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        data-testid="input-amount"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-currency">
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SUPPORTED_CURRENCIES.map((currency) => (
                          <SelectItem key={currency} value={currency}>
                            {currency}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {type === 'refund' ? 'Reason for Refund' : 'Description'}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={
                        type === 'payment' 
                          ? 'Payment for dental cleaning' 
                          : type === 'charge'
                            ? 'Orthodontic treatment'
                            : 'Reason for refund'
                      }
                      data-testid="input-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {(type === 'payment' || type === 'refund') && (
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-payment-method">
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="card">Credit/Debit Card</SelectItem>
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                        <SelectItem value="check">Check</SelectItem>
                        <SelectItem value="insurance">Insurance</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {type === 'charge' && (
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="treatment">Treatment</SelectItem>
                        <SelectItem value="consultation">Consultation</SelectItem>
                        <SelectItem value="emergency">Emergency</SelectItem>
                        <SelectItem value="equipment">Equipment</SelectItem>
                        <SelectItem value="outstanding">Outstanding Balance</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Additional notes..."
                      rows={3}
                      data-testid="textarea-notes"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                data-testid="button-submit"
              >
                {isSubmitting ? 'Processing...' : getModalTitle()}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}