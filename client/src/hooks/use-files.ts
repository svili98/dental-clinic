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
    mutationFn: async (file: InsertPatientFile) => {
      const response = await apiRequest('POST', '/api/files', file);
      return response.json();
    },
    onSuccess: (_, file) => {
      queryClient.invalidateQueries({ queryKey: ['/api/patients', file.patientId, 'files'] });
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
