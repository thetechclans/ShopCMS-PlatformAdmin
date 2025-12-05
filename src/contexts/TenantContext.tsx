import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { isPlatformDomain } from '@/lib/platformConfig';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  subdomain: string;
  status: string;
}

interface TenantContextType {
  tenant: Tenant | null;
  tenantId: string | null;
  isLoading: boolean;
  error: string | null;
  isPlatformDomain: boolean;
  requireTenant: () => string; // Throws if no tenant
}

const TenantContext = createContext<TenantContextType>({
  tenant: null,
  tenantId: null,
  isLoading: true,
  error: null,
  isPlatformDomain: false,
  requireTenant: () => {
    throw new Error("Tenant context not initialized");
  },
});

export const useTenant = () => useContext(TenantContext);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlatform, setIsPlatform] = useState(false);

  useEffect(() => {
    const detectTenant = async () => {
      try {
        const hostname = window.location.hostname;
        console.log('Detecting tenant for hostname:', hostname);
        
        // First priority: Check if on platform domain (serves both landing and admin)
        if (isPlatformDomain(hostname)) {
          setIsPlatform(true);
          setTenant(null);
          setIsLoading(false);
          return;
        }

        // Second priority: Check for query parameter (for development/preview mode)
        const urlParams = new URLSearchParams(window.location.search);
        console.log('tenantSlug :', urlParams.get('tenant'));
        const tenantSlug = urlParams.get('tenant');
        
        if (tenantSlug) {
          const { data, error } = await supabase
            .from('tenants')
            .select('*')
            .eq('slug', tenantSlug)
            .eq('status', 'active')
            .maybeSingle();
          
          console.log('tenant data by slug:', data, error);

          if (error) {
            console.error('Error fetching tenant by slug:', error);
            setError(null);
            setTenant(null);
          } else if (data) {
            setTenant(data);
          } else {
            setError(null);
            setTenant(null);
          }
          setIsLoading(false);
          return;
        }

        // Third priority: Check custom domain or subdomain
        // const parts = hostname.split('.');
        const parts = hostname;
        console.log('Hostname parts:', parts);
        
        let tenantQuery;

        // Check if it's a custom domain (e.g., sunware.com)
        if (parts.length === 2 || (parts.length === 3 && parts[0] === 'www')) {
          // Query by custom domain
          const domain = parts.length === 3 ? `${parts[1]}.${parts[2]}` : hostname;
          
          const { data: domainData, error: domainError } = await supabase
            .from('tenant_domains')
            .select('tenant_id')
            .eq('domain', domain)
            .eq('is_verified', true)
            .maybeSingle();

          if (domainError) {
            console.error('Error fetching domain:', domainError);
          }

          if (domainData) {
            tenantQuery = supabase
              .from('tenants')
              .select('*')
              .eq('id', domainData.tenant_id)
              .eq('status', 'active')
              .maybeSingle();
          }
        } else if (parts.length >= 3) {
          // Subdomain-based (e.g., shop.myplatform.com)
          const subdomain = parts[0];
          
          tenantQuery = supabase
            .from('tenants')
            .select('*')
            .eq('subdomain', subdomain)
            .eq('status', 'active')
            .maybeSingle();
        }

        if (tenantQuery) {
          const { data, error: tenantError } = await tenantQuery;

          if (tenantError) {
            console.error('Error fetching tenant:', tenantError);
            setError(null);
            setTenant(null);
          } else if (data) {
            setTenant(data);
          } else {
            setError(null);
            setTenant(null);
          }
        } else {
          // No tenant found - show default empty shop template instead of error
          setTenant(null);
          setError(null); // Clear error to show default template
        }
      } catch (err) {
        console.error('Error detecting tenant:', err);
        setError(null); // Show default template instead of error page
        setTenant(null);
      } finally {
        setIsLoading(false);
      }
    };

    detectTenant();
  }, []);

  const requireTenant = () => {
    if (!tenant?.id) {
      throw new Error("Tenant context required but not available");
    }
    return tenant.id;
  };

  return (
    <TenantContext.Provider 
      value={{ 
        tenant, 
        tenantId: tenant?.id || null,
        isLoading, 
        error, 
        isPlatformDomain: isPlatform,
        requireTenant 
      }}
    >
      {children}
    </TenantContext.Provider>
  );
};