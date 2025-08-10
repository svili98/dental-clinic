import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Patient, InsertPatient, PaginatedResponse } from "@shared/schema";

interface PatientsQueryParams {
  search?: string;
  pageNumber?: number;
  pageSize?: number;
}

export function usePatients(params: PatientsQueryParams = {}) {
  const searchParams = new URLSearchParams();
  if (params.search) searchParams.append('search', params.search);
  if (params.pageNumber) searchParams.append('pageNumber', params.pageNumber.toString());
  if (params.pageSize) searchParams.append('pageSize', params.pageSize.toString());

  return useQuery<PaginatedResponse<Patient>>({
    queryKey: ['/api/patients', params],
    queryFn: async () => {
      const response = await fetch(`/api/patients?${searchParams.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch patients');
      return response.json();
    },
  });
}

export function usePatient(id?: number) {
  return useQuery<Patient>({
    queryKey: ['/api/patients', id],
    queryFn: async () => {
      const response = await fetch(`/api/patients/${id}`);
      if (!response.ok) throw new Error('Failed to fetch patient');
      return response.json();
    },
    enabled: !!id,
  });
}

export function useCreatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (patient: InsertPatient) => {
      const response = await apiRequest('POST', '/api/patients', patient);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/patients'] });
    },
  });
}

export function useUpdatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, patient }: { id: number; patient: Partial<InsertPatient> }) => {
      const response = await apiRequest('PUT', `/api/patients/${id}`, patient);
      return response.json();
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['/api/patients'] });
      queryClient.invalidateQueries({ queryKey: ['/api/patients', id] });
    },
  });
}

export function useDeletePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/patients/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/patients'] });
    },
  });
}
