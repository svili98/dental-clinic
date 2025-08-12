import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Currency } from "@/lib/currency";

export interface FinancialTransaction {
  id: number;
  patientId: number;
  type: 'payment' | 'charge' | 'refund' | 'adjustment';
  amount: number; // in smallest currency unit
  currency: Currency;
  description: string;
  category?: string;
  paymentMethod?: string;
  transactionReference?: string;
  appointmentId?: number;
  treatmentId?: number;
  recordedBy: number;
  authorizedBy?: number;
  status: 'completed' | 'pending' | 'cancelled' | 'refunded';
  notes?: string;
  processedAt: string;
  createdAt: string;
  recordedByName?: string; // Employee name who recorded the transaction
}

export interface PatientFinancialSummary {
  patientId: number;
  totalCharges: Record<Currency, number>;
  totalPayments: Record<Currency, number>;
  totalRefunds: Record<Currency, number>;
  balance: Record<Currency, number>;
  lastTransactionDate?: string;
  transactionCount: number;
}

// Hook to get financial transactions for a patient
export function usePatientTransactions(patientId: number) {
  return useQuery({
    queryKey: ['/api/patients', patientId, 'transactions'],
    enabled: !!patientId && patientId > 0,
  });
}

// Hook to get patient financial summary
export function usePatientFinancialSummary(patientId: number) {
  return useQuery({
    queryKey: ['/api/patients', patientId, 'financial-summary'],
    enabled: !!patientId && patientId > 0,
  });
}

// Hook to create a new financial transaction
export function useCreateTransaction() {
  const { employee } = useAuth();
  
  return useMutation({
    mutationFn: async (data: {
      patientId: number;
      type: 'payment' | 'charge' | 'refund' | 'adjustment';
      amount: number;
      currency: Currency;
      description: string;
      category?: string;
      paymentMethod?: string;
      transactionReference?: string;
      appointmentId?: number;
      treatmentId?: number;
      notes?: string;
    }) => {
      if (!employee) throw new Error('User not authenticated');
      
      const response = await fetch('/api/financial-transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          recordedBy: employee.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create transaction');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ 
        queryKey: ['/api/patients', variables.patientId, 'transactions'] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['/api/patients', variables.patientId, 'financial-summary'] 
      });
    },
  });
}

// Hook to record a payment (convenience wrapper)
export function useRecordPayment() {
  const createTransaction = useCreateTransaction();
  
  return useMutation({
    mutationFn: async (data: {
      patientId: number;
      amount: number;
      currency: Currency;
      paymentMethod: string;
      description: string;
      treatmentId?: number;
      appointmentId?: number;
      notes?: string;
    }) => {
      return createTransaction.mutateAsync({
        ...data,
        type: 'payment',
        amount: -Math.abs(data.amount), // Payments are negative
      });
    },
  });
}

// Hook to record a charge (convenience wrapper)
export function useRecordCharge() {
  const createTransaction = useCreateTransaction();
  
  return useMutation({
    mutationFn: async (data: {
      patientId: number;
      amount: number;
      currency: Currency;
      description: string;
      category?: string;
      treatmentId?: number;
      appointmentId?: number;
      notes?: string;
    }) => {
      return createTransaction.mutateAsync({
        ...data,
        type: 'charge',
        amount: Math.abs(data.amount), // Charges are positive
      });
    },
  });
}

// Hook to record outstanding balance
export function useRecordOutstanding() {
  const createTransaction = useCreateTransaction();
  
  return useMutation({
    mutationFn: async (data: {
      patientId: number;
      amount: number;
      currency: Currency;
      description: string;
      reason?: string;
      treatmentId?: number;
      appointmentId?: number;
    }) => {
      return createTransaction.mutateAsync({
        ...data,
        type: 'charge',
        amount: Math.abs(data.amount), // Outstanding amounts are positive charges
        category: 'outstanding',
        description: data.description,
        notes: data.reason,
      });
    },
  });
}

// Hook to record a refund
export function useRecordRefund() {
  const createTransaction = useCreateTransaction();
  
  return useMutation({
    mutationFn: async (data: {
      patientId: number;
      amount: number;
      currency: Currency;
      reason: string;
      originalTransactionId?: number;
      paymentMethod?: string;
    }) => {
      return createTransaction.mutateAsync({
        ...data,
        type: 'refund',
        amount: Math.abs(data.amount), // Refunds are positive (money back to patient)
        description: `Refund: ${data.reason}`,
        notes: data.originalTransactionId 
          ? `Refund for transaction #${data.originalTransactionId}` 
          : undefined,
      });
    },
  });
}

// Hook to update transaction status
export function useUpdateTransaction() {
  return useMutation({
    mutationFn: async ({ 
      id, 
      updates 
    }: { 
      id: number; 
      updates: {
        status?: 'completed' | 'pending' | 'cancelled' | 'refunded';
        notes?: string;
        authorizedBy?: number;
      }
    }) => {
      const response = await fetch(`/api/financial-transactions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update transaction');
      }

      return response.json();
    },
    onSuccess: (transaction) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ 
        queryKey: ['/api/patients', transaction.patientId, 'transactions'] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['/api/patients', transaction.patientId, 'financial-summary'] 
      });
    },
  });
}

// Legacy hooks for backward compatibility with existing payment system
export function usePaymentRecords(patientId: number) {
  return usePatientTransactions(patientId);
}

export function useCreatePaymentRecord() {
  return useRecordPayment();
}