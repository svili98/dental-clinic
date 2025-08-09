import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import type { Settings, InsertSettings } from "@shared/schema";

export function useSettings() {
  const { employee } = useAuth();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery<Settings>({
    queryKey: ['/api/settings', employee?.id],
    queryFn: () => apiRequest(`/api/settings/${employee?.id}`),
    enabled: !!employee?.id,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: Partial<InsertSettings>) => {
      return await apiRequest(`/api/settings/${employee?.id}`, 'PUT', data);
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