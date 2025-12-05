import { useQuery, UseQueryOptions, useMutation, UseMutationOptions } from "@tanstack/react-query";
import { useTenant } from "@/contexts/TenantContext";

/**
 * Tenant-aware query hook that automatically includes tenant context
 * and prevents queries from running without a tenant
 */
export function useTenantQuery<TData = unknown, TError = Error>(
  queryKey: unknown[],
  queryFn: (tenantId: string) => Promise<TData>,
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>
) {
  const { tenant } = useTenant();
  
  return useQuery<TData, TError>({
    queryKey: [...queryKey, tenant?.id],
    queryFn: () => {
      if (!tenant?.id) {
        throw new Error("Tenant context required");
      }
      return queryFn(tenant.id);
    },
    enabled: !!tenant?.id && (options?.enabled !== false),
    ...options,
  });
}

/**
 * Tenant-aware mutation hook that validates tenant context
 */
export function useTenantMutation<TData = unknown, TError = Error, TVariables = void>(
  mutationFn: (variables: TVariables & { tenantId: string }) => Promise<TData>,
  options?: Omit<UseMutationOptions<TData, TError, TVariables>, 'mutationFn'>
) {
  const { tenant } = useTenant();
  
  return useMutation<TData, TError, TVariables>({
    mutationFn: (variables) => {
      if (!tenant?.id) {
        throw new Error("Tenant context required for mutations");
      }
      return mutationFn({ ...variables, tenantId: tenant.id } as TVariables & { tenantId: string });
    },
    ...options,
  });
}
