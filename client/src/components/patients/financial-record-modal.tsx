import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useCreatePaymentRecord } from "@/hooks/use-payments";
import { useToast } from "@/hooks/use-toast";
import { SUPPORTED_CURRENCIES } from "@/lib/currency";
import { CreditCard, DollarSign } from "lucide-react";

interface FinancialRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: number;
}

export function FinancialRecordModal({ isOpen, onClose, patientId }: FinancialRecordModalProps) {
  const [activeTab, setActiveTab] = useState("payment");
  
  // Payment fields
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentCurrency, setPaymentCurrency] = useState("EUR");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [treatmentContext, setTreatmentContext] = useState("");
  const [doctorName, setDoctorName] = useState("");
  
  // Outstanding balance fields
  const [outstandingAmount, setOutstandingAmount] = useState("");
  const [outstandingCurrency, setOutstandingCurrency] = useState("EUR");
  const [outstandingReason, setOutstandingReason] = useState("treatment");
  const [outstandingDescription, setOutstandingDescription] = useState("");
  const [outstandingTreatmentContext, setOutstandingTreatmentContext] = useState("");
  const [outstandingDoctorName, setOutstandingDoctorName] = useState("");
  const [dueDate, setDueDate] = useState("");

  const createPaymentMutation = useCreatePaymentRecord();
  const { toast } = useToast();

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amountFloat = parseFloat(paymentAmount);
    if (!amountFloat || amountFloat <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid payment amount",
        variant: "destructive",
      });
      return;
    }

    try {
      // Convert amount based on currency
      let amountInSmallestUnit: number;
      if (paymentCurrency === "RSD") {
        amountInSmallestUnit = Math.round(amountFloat * 100); // RSD paras
      } else {
        amountInSmallestUnit = Math.round(amountFloat * 100); // EUR/CHF cents
      }

      await createPaymentMutation.mutateAsync({
        patientId,
        amount: amountInSmallestUnit,
        currency: paymentCurrency,
        paymentMethod,
        treatmentContext: treatmentContext.trim() || undefined,
        doctorName: doctorName.trim() || undefined,
        notes: paymentNotes.trim() || undefined,
      });

      toast({
        title: "Success",
        description: "Payment recorded successfully",
      });

      resetForms();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record payment",
        variant: "destructive",
      });
    }
  };

  const handleOutstandingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amountFloat = parseFloat(outstandingAmount);
    if (!amountFloat || amountFloat <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid outstanding amount",
        variant: "destructive",
      });
      return;
    }

    try {
      // Convert amount based on currency
      let amountInSmallestUnit: number;
      if (outstandingCurrency === "RSD") {
        amountInSmallestUnit = Math.round(amountFloat * 100); // RSD paras
      } else {
        amountInSmallestUnit = Math.round(amountFloat * 100); // EUR/CHF cents
      }

      await createPaymentMutation.mutateAsync({
        patientId,
        amount: amountInSmallestUnit,
        currency: outstandingCurrency,
        paymentMethod: "outstanding",
        treatmentContext: outstandingTreatmentContext.trim() || undefined,
        doctorName: outstandingDoctorName.trim() || undefined,
        notes: `Outstanding Balance - ${outstandingReason}: ${outstandingDescription}${dueDate ? ` (Due: ${dueDate})` : ''}`,
      });

      toast({
        title: "Success",
        description: "Outstanding balance recorded successfully",
      });

      resetForms();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record outstanding balance",
        variant: "destructive",
      });
    }
  };

  const resetForms = () => {
    setPaymentAmount("");
    setPaymentCurrency("EUR");
    setPaymentMethod("cash");
    setPaymentNotes("");
    setTreatmentContext("");
    setDoctorName("");
    setOutstandingAmount("");
    setOutstandingCurrency("EUR");
    setOutstandingReason("treatment");
    setOutstandingDescription("");
    setOutstandingTreatmentContext("");
    setOutstandingDoctorName("");
    setDueDate("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Financial Record</DialogTitle>
          <DialogDescription>
            Record payments or outstanding balances for this patient
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="payment" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Payment
            </TabsTrigger>
            <TabsTrigger value="outstanding" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Outstanding
            </TabsTrigger>
          </TabsList>

          <TabsContent value="payment" className="space-y-4 mt-4">
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="payment-amount">Amount *</Label>
                  <Input
                    id="payment-amount"
                    type="number"
                    step="0.01"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="0.00"
                    min="0.01"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="payment-currency">Currency *</Label>
                  <Select value={paymentCurrency} onValueChange={setPaymentCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPORTED_CURRENCIES.map((currency) => (
                        <SelectItem key={currency.value} value={currency.value}>
                          {currency.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="payment-method">Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="insurance">Insurance</SelectItem>
                    <SelectItem value="installment">Installment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="treatment-context">Treatment Context</Label>
                  <Input
                    id="treatment-context"
                    value={treatmentContext}
                    onChange={(e) => setTreatmentContext(e.target.value)}
                    placeholder="e.g., orthodontic, emergency"
                  />
                </div>
                <div>
                  <Label htmlFor="doctor-name">Doctor Name</Label>
                  <Input
                    id="doctor-name"
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    placeholder="e.g., Dr. Sarah, Dr. John"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="payment-notes">Notes (optional)</Label>
                <Textarea
                  id="payment-notes"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="Payment details or reference..."
                  rows={2}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createPaymentMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {createPaymentMutation.isPending ? "Recording..." : "Record Payment"}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="outstanding" className="space-y-4 mt-4">
            <form onSubmit={handleOutstandingSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="outstanding-amount">Outstanding Amount *</Label>
                  <Input
                    id="outstanding-amount"
                    type="number"
                    step="0.01"
                    value={outstandingAmount}
                    onChange={(e) => setOutstandingAmount(e.target.value)}
                    placeholder="0.00"
                    min="0.01"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="outstanding-currency">Currency *</Label>
                  <Select value={outstandingCurrency} onValueChange={setOutstandingCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPORTED_CURRENCIES.map((currency) => (
                        <SelectItem key={currency.value} value={currency.value}>
                          {currency.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="outstanding-reason">Reason</Label>
                  <Select value={outstandingReason} onValueChange={setOutstandingReason}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="treatment">Treatment Cost</SelectItem>
                      <SelectItem value="consultation">Consultation Fee</SelectItem>
                      <SelectItem value="lab_work">Lab Work</SelectItem>
                      <SelectItem value="materials">Materials</SelectItem>
                      <SelectItem value="installment_due">Installment Due</SelectItem>
                      <SelectItem value="insurance_pending">Insurance Pending</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="due-date">Due Date (optional)</Label>
                  <Input
                    id="due-date"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="outstanding-treatment-context">Treatment Context</Label>
                  <Input
                    id="outstanding-treatment-context"
                    value={outstandingTreatmentContext}
                    onChange={(e) => setOutstandingTreatmentContext(e.target.value)}
                    placeholder="e.g., orthodontic, emergency"
                  />
                </div>
                <div>
                  <Label htmlFor="outstanding-doctor-name">Doctor Name</Label>
                  <Input
                    id="outstanding-doctor-name"
                    value={outstandingDoctorName}
                    onChange={(e) => setOutstandingDoctorName(e.target.value)}
                    placeholder="e.g., Dr. Sarah, Dr. John"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="outstanding-description">Description</Label>
                <Textarea
                  id="outstanding-description"
                  value={outstandingDescription}
                  onChange={(e) => setOutstandingDescription(e.target.value)}
                  placeholder="Describe the outstanding balance..."
                  rows={2}
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createPaymentMutation.isPending}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {createPaymentMutation.isPending ? "Recording..." : "Record Outstanding"}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}