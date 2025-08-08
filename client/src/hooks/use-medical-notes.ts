import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

export function useMedicalNotes(patientId: number) {
  return useQuery({
    queryKey: ['/api/patients', patientId, 'medical-notes'],
    enabled: !!patientId && patientId > 0,
  });
}

export function useCreateMedicalNote() {
  return useMutation({
    mutationFn: async ({ patientId, title, content, noteType }: { 
      patientId: number; 
      title: string; 
      content: string; 
      noteType: string 
    }) => {
      const response = await fetch(`/api/patients/${patientId}/medical-notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, content, noteType }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create medical note');
      }
      
      return response.json();
    },
    onSuccess: (_, { patientId }) => {
      queryClient.invalidateQueries({ queryKey: ['/api/patients', patientId, 'medical-notes'] });
    },
  });
}