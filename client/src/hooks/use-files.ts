import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { PatientFile, InsertPatientFile } from "@shared/schema";

export function usePatientFiles(patientId: number) {
  return useQuery<PatientFile[]>({
    queryKey: ['/api/patients', patientId, 'files'],
    queryFn: async () => {
      const response = await fetch(`/api/patients/${patientId}/files`);
      if (!response.ok) throw new Error('Failed to fetch patient files');
      return response.json();
    },
    enabled: !!patientId,
  });
}

export function useCreatePatientFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, metadata }: { file: File, metadata: InsertPatientFile }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('patientId', metadata.patientId.toString());
      formData.append('category', metadata.category || 'document');
      formData.append('description', metadata.description || '');
      if (metadata.tags) {
        formData.append('tags', metadata.tags.join(', '));
      }
      if (metadata.toothNumbers && metadata.toothNumbers.length > 0) {
        formData.append('toothNumbers', metadata.toothNumbers.join(', '));
      }
      if (metadata.treatmentDate) {
        formData.append('treatmentDate', metadata.treatmentDate);
      }

      const response = await fetch('/api/files', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }
      
      return response.json();
    },
    onSuccess: (_, { metadata }) => {
      queryClient.invalidateQueries({ queryKey: ['/api/patients', metadata.patientId, 'files'] });
    },
  });
}

export function useDeletePatientFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/files/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/patients'] });
    },
  });
}
