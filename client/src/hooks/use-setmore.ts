import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { SetmoreService, SetmoreStaff, SetmoreTimeSlot, SetmoreSlotsRequest } from "@shared/setmore-types";

export function useSetmoreServices() {
  return useQuery<{ response: boolean; data: { services: SetmoreService[] } }>({
    queryKey: ['/api/setmore/services'],
    queryFn: async () => {
      const response = await fetch('/api/setmore/services');
      if (!response.ok) throw new Error('Failed to fetch services');
      return response.json();
    },
  });
}

export function useSetmoreStaff() {
  return useQuery<{ response: boolean; data: { staffs: SetmoreStaff[] } }>({
    queryKey: ['/api/setmore/staff'],
    queryFn: async () => {
      const response = await fetch('/api/setmore/staff');
      if (!response.ok) throw new Error('Failed to fetch staff');
      return response.json();
    },
  });
}

export function useSetmoreSlots() {
  return useMutation<
    { response: boolean; data: { slots: SetmoreTimeSlot[] } },
    Error,
    SetmoreSlotsRequest
  >({
    mutationFn: async (request: SetmoreSlotsRequest) => {
      const response = await fetch('/api/setmore/slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      if (!response.ok) throw new Error('Failed to fetch slots');
      return response.json();
    },
  });
}

export function useCreateSetmoreAppointment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (appointment: any) => {
      const response = await apiRequest('POST', '/api/appointments/setmore', appointment);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/appointments/today'] });
    },
  });
}