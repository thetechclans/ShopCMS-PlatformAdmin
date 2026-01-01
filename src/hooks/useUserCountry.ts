import { useState, useEffect } from 'react';

interface UserCountryData {
  country: string;
  countryCode: string;
  isIndia: boolean;
  isLoading: boolean;
  error: string | null;
}

const CACHE_KEY = 'user_country_data';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Hook to detect user's country using IP-based geolocation
 * Uses ip-api.com (free, no API key required, no user permission needed)
 * Results are cached in localStorage for 24 hours
 */
export function useUserCountry(): UserCountryData {
  const [data, setData] = useState<UserCountryData>({
    country: '',
    countryCode: '',
    isIndia: true, // Default to India (INR) as fallback
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const fetchCountry = async () => {
      try {
        // Check cache first
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data: cachedData, timestamp } = JSON.parse(cached);
          const isExpired = Date.now() - timestamp > CACHE_DURATION;
          
          if (!isExpired) {
            console.log('Using cached country data:', cachedData);
            setData({
              ...cachedData,
              isLoading: false,
              error: null,
            });
            return;
          } else {
            // Clear expired cache
            localStorage.removeItem(CACHE_KEY);
            console.log('Cache expired, fetching fresh country data');
          }
        }

        // Fetch from IP geolocation API (no user permission required)
        // Using ipapi.co which supports HTTPS (free tier: 1000 requests/day)
        const response = await fetch('https://ipapi.co/json/');
        console.log('IP API Response:', response);
        if (!response.ok) {
          throw new Error('Failed to detect location');
        }

        const result = await response.json();
        console.log('IP API Result:', result);
        
        const countryData = {
          country: result.country_name || '',
          countryCode: result.country_code || '',
          isIndia: result.country_code === 'IN',
        };

        // Cache the result
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          data: countryData,
          timestamp: Date.now(),
        }));

        setData({
          ...countryData,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        console.error('Error detecting country:', error);
        // Default to India on error
        setData({
          country: 'India',
          countryCode: 'IN',
          isIndia: true,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    };

    fetchCountry();
  }, []);

  return data;
}

/**
 * Helper function to format price based on currency
 */
export function formatPrice(priceINR: number, priceUSD: number | null, isIndia: boolean): string {
  if (isIndia || priceUSD === null) {
    return `₹${priceINR.toLocaleString('en-IN')}`;
  }
  return `$${priceUSD.toFixed(2)}`;
}

/**
 * Helper function to get currency symbol
 */
export function getCurrencySymbol(isIndia: boolean): string {
  return isIndia ? '₹' : '$';
}
