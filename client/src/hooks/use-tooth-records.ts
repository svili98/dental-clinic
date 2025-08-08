import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { ToothRecord, InsertToothRecord } from "@shared/schema";

export function usePatientToothRecords(patientId: number) {
  return useQuery<ToothRecord[]>({
    queryKey: ["/api/patients", patientId, "teeth"],
    enabled: !!patientId,
  });
}

export function useCreateToothRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: InsertToothRecord): Promise<ToothRecord> => {
      const response = await apiRequest("POST", "/api/teeth", data);
      return response.json();
    },
    onSuccess: (newRecord) => {
      // Invalidate patient tooth records
      queryClient.invalidateQueries({
        queryKey: ["/api/patients", newRecord.patientId, "teeth"],
      });
    },
  });
}

export function useUpdateToothRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertToothRecord> }): Promise<ToothRecord> => {
      const response = await apiRequest("PUT", `/api/teeth/${id}`, data);
      return response.json();
    },
    onSuccess: (updatedRecord) => {
      // Invalidate patient tooth records
      queryClient.invalidateQueries({
        queryKey: ["/api/patients", updatedRecord.patientId, "teeth"],
      });
    },
  });
}

export function useDeleteToothRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      await apiRequest("DELETE", `/api/teeth/${id}`);
    },
    onSuccess: () => {
      // Invalidate all tooth record queries
      queryClient.invalidateQueries({
        queryKey: ["/api/patients"],
      });
    },
  });
}