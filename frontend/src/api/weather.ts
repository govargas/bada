import type { WeatherData } from '../types/weather';

const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const MARINE_URL = 'https://marine-api.open-meteo.com/v1/marine';

interface OpenMeteoForecastResponse {
  current: {
    temperature_2m: number;
    apparent_temperature: number;
    uv_index: number;
    time: string;
  };
}

interface OpenMeteoMarineResponse {
  current: {
    sea_surface_temperature: number;
  };
}

async function fetchForecast(lat: number, lon: number): Promise<OpenMeteoForecastResponse> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: 'temperature_2m,apparent_temperature,uv_index',
    timezone: 'auto',
  });
  const res = await fetch(`${FORECAST_URL}?${params}`);
  if (!res.ok) throw new Error(`Open-Meteo forecast error: ${res.status}`);
  return res.json();
}

async function fetchMarine(lat: number, lon: number): Promise<number | null> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: 'sea_surface_temperature',
  });
  const res = await fetch(`${MARINE_URL}?${params}`);
  if (!res.ok) return null;
  const data: OpenMeteoMarineResponse = await res.json();
  return data.current?.sea_surface_temperature ?? null;
}

export async function fetchBeachWeather(lat: number, lon: number): Promise<WeatherData> {
  const [forecast, waterTemperature] = await Promise.all([
    fetchForecast(lat, lon),
    fetchMarine(lat, lon),
  ]);

  return {
    temperature: forecast.current.temperature_2m,
    feelsLike: forecast.current.apparent_temperature,
    uvIndex: forecast.current.uv_index,
    waterTemperature,
    fetchedAt: forecast.current.time,
  };
}
