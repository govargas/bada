import { useQuery } from '@tanstack/react-query';
import { fetchBeachWeather } from '../api/weather';
import type { WeatherData } from '../types/weather';

export function useWeather(lat: number | undefined, lon: number | undefined) {
  return useQuery<WeatherData>({
    queryKey: ['weather', lat, lon],
    enabled: lat != null && lon != null,
    queryFn: () => fetchBeachWeather(lat!, lon!),
    staleTime: 30 * 60 * 1000,
  });
}
