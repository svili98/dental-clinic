import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import type { Settings, InsertSettings } from "@shared/schema";

export function useSettings() {
  const { employee } = useAuth();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery<Settings>({
    queryKey: ['/api/settings', employee?.id],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/settings/${employee?.id}`);
      return response.json();
    },
    enabled: !!employee?.id,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: Partial<InsertSettings>) => {
      const response = await apiRequest('PUT', `/api/settings/${employee?.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings', employee?.id] });
    },
  });

  return {
    settings,
    isLoading,
    updateSettings: updateSettingsMutation.mutate,
    isUpdating: updateSettingsMutation.isPending,
  };
}