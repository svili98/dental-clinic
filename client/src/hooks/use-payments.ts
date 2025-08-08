import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

export function usePaymentRecords(patientId: number) {
  return useQuery({
    queryKey: ['/api/patients', patientId, 'payments'],
    enabled: !!patientId && patientId > 0,
  });
}

export function useCreatePaymentRecord() {
  return useMutation({
    mutationFn: async ({ 
      patientId, 
      amount, 
      paymentMethod, 
      appointmentId, 
      treatmentId, 
      notes 
    }: { 
      patientId: number;
      amount: number;
      paymentMethod: string;
      appointmentId?: number;
      treatmentId?: number;
      notes?: string;
    }) => {
      const response = await fetch(`/api/patients/${patientId}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          amount, 
          paymentMethod, 
          appointmentId, 
          treatmentId, 
          notes 
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create payment record');
      }
      
      return response.json();
    },
    onSuccess: (_, { patientId }) => {
      queryClient.invalidateQueries({ queryKey: ['/api/patients', patientId, 'payments'] });
    },
  });
}