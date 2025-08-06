import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Appointment, InsertAppointment, PaginatedResponse } from "@shared/schema";

interface AppointmentsQueryParams {
  patientId?: number;
  date?: string;
  pageNumber?: number;
  pageSize?: number;
}

export function useAppointments(params: AppointmentsQueryParams = {}) {
  const searchParams = new URLSearchParams();
  if (params.patientId) searchParams.append('patientId', params.patientId.toString());
  if (params.date) searchParams.append('date', params.date);
  if (params.pageNumber) searchParams.append('pageNumber', params.pageNumber.toString());
  if (params.pageSize) searchParams.append('pageSize', params.pageSize.toString());

  return useQuery<PaginatedResponse<Appointment>>({
    queryKey: ['/api/appointments', params],
    queryFn: async () => {
      const response = await fetch(`/api/appointments?${searchParams.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch appointments');
      return response.json();
    },
  });
}

export function useTodayAppointments() {
  return useQuery<Appointment[]>({
    queryKey: ['/api/appointments/today'],
    queryFn: async () => {
      const response = await fetch('/api/appointments/today');
      if (!response.ok) throw new Error('Failed to fetch today\'s appointments');
      return response.json();
    },
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (appointment: InsertAppointment) => {
      const response = await apiRequest('POST', '/api/appointments', appointment);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/appointments/today'] });
    },
  });
}
