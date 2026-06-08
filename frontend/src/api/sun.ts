import type { SunTimes } from '../types/weather';

const SUN_URL = 'https://api.sunrise-sunset.org/json';

const ONE_HOUR_MS = 60 * 60 * 1000;

interface SunriseSunsetResponse {
  status: string;
  results: {
    sunrise: string;
    sunset: string;
    solar_noon: string;
    day_length: number;
    civil_twilight_begin: string;
    civil_twilight_end: string;
    nautical_twilight_begin: string;
    nautical_twilight_end: string;
    astronomical_twilight_begin: string;
    astronomical_twilight_end: string;
  };
}

export async function fetchSunTimes(lat: number, lon: number, date?: Date): Promise<SunTimes> {
  const params = new URLSearchParams({
    lat: String(lat),
    lng: String(lon),
    formatted: '0',
  });
  if (date) {
    params.set('date', date.toISOString().split('T')[0]);
  }

  const res = await fetch(`${SUN_URL}?${params}`);
  if (!res.ok) throw new Error(`sunrise-sunset.org error: ${res.status}`);

  const data: SunriseSunsetResponse = await res.json();
  if (data.status !== 'OK') throw new Error(`sunrise-sunset.org status: ${data.status}`);

  const r = data.results;
  const sunrise = new Date(r.sunrise);
  const sunset = new Date(r.sunset);

  return {
    sunrise,
    sunset,
    solarNoon: new Date(r.solar_noon),
    dayLengthSeconds: r.day_length,
    goldenHourMorningEnd: new Date(sunrise.getTime() + ONE_HOUR_MS),
    goldenHourEveningStart: new Date(sunset.getTime() - ONE_HOUR_MS),
    civilTwilightBegin: new Date(r.civil_twilight_begin),
    civilTwilightEnd: new Date(r.civil_twilight_end),
    nauticalTwilightBegin: new Date(r.nautical_twilight_begin),
    nauticalTwilightEnd: new Date(r.nautical_twilight_end),
    astronomicalTwilightBegin: new Date(r.astronomical_twilight_begin),
    astronomicalTwilightEnd: new Date(r.astronomical_twilight_end),
  };
}
