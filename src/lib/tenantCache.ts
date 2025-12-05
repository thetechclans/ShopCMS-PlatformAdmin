import { QueryClient } from "@tanstack/react-query";

/**
 * Cache invalidation utilities for tenant-specific data
 */

export const invalidateHomepageCache = (queryClient: QueryClient, tenantId: string) => {
  queryClient.invalidateQueries({ queryKey: ["carousel-slides", tenantId] });
  queryClient.invalidateQueries({ queryKey: ["published-categories", tenantId] });
  queryClient.invalidateQueries({ queryKey: ["home-page-sections", tenantId] });
};

export const invalidateNavbarCache = (queryClient: QueryClient, tenantId: string) => {
  queryClient.invalidateQueries({ queryKey: ["navbar-config", tenantId] });
  queryClient.invalidateQueries({ queryKey: ["menu-items", tenantId] });
};

export const invalidateFooterCache = (queryClient: QueryClient, tenantId: string) => {
  queryClient.invalidateQueries({ queryKey: ["footer-config", tenantId] });
  queryClient.invalidateQueries({ queryKey: ["social-links", tenantId] });
  queryClient.invalidateQueries({ queryKey: ["footer-quick-links", tenantId] });
};

export const invalidateProductCache = (queryClient: QueryClient, tenantId: string) => {
  queryClient.invalidateQueries({ queryKey: ["products", tenantId] });
  queryClient.invalidateQueries({ queryKey: ["published-products", tenantId] });
};

export const invalidateCategoryCache = (queryClient: QueryClient, tenantId: string) => {
  queryClient.invalidateQueries({ queryKey: ["categories", tenantId] });
  queryClient.invalidateQueries({ queryKey: ["published-categories", tenantId] });
};
