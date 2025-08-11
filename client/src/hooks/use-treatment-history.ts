import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

export function useTreatmentHistory(patientId: number) {
  return useQuery({
    queryKey: ['/api/patients', patientId, 'treatment-history'],
    enabled: !!patientId && patientId > 0,
  });
}

export function useCreateTreatmentHistory() {
  return useMutation({
    mutationFn: async ({ 
      patientId, 
      treatmentType, 
      description, 
      toothNumbers, 
      duration, 
      cost,
      currency,
      notes 
    }: { 
      patientId: number;
      treatmentType: string;
      description: string;
      toothNumbers?: string;
      duration?: number;
      cost?: number;
      currency?: string;
      notes?: string;
    }) => {
      const response = await fetch(`/api/patients/${patientId}/treatment-history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          treatmentType, 
          description, 
          toothNumbers, 
          duration, 
          cost,
          currency,
          notes 
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create treatment history');
      }
      
      return response.json();
    },
    onSuccess: (_, { patientId }) => {
      queryClient.invalidateQueries({ queryKey: ['/api/patients', patientId, 'treatment-history'] });
    },
  });
}