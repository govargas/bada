import { useQuery } from '@tanstack/react-query';
import { fetchSunTimes } from '../api/sun';
import type { SunTimes } from '../types/weather';

export function useSunTimes(lat: number | undefined, lon: number | undefined) {
  const today = new Date().toISOString().split('T')[0];
  return useQuery<SunTimes>({
    queryKey: ['sun', lat, lon, today],
    enabled: lat != null && lon != null,
    queryFn: () => fetchSunTimes(lat!, lon!),
    staleTime: 12 * 60 * 60 * 1000,
  });
}
