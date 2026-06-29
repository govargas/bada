export interface DailyForecast {
  /** ISO date (YYYY-MM-DD) in the beach's local timezone */
  date: string;
  weatherCode: number;
  tempMax: number;
  tempMin: number;
  uvMax: number;
  /** Max probability of precipitation for the day, 0–100 */
  precipProbability: number | null;
}

export interface WeatherData {
  temperature: number;
  feelsLike: number;
  uvIndex: number;
  weatherCode: number;
  waterTemperature: number | null;
  fetchedAt: string;
  /** Today + next days (planning ahead, not just "right now") */
  forecast: DailyForecast[];
}

export interface SunTimes {
  sunrise: Date;
  sunset: Date;
  solarNoon: Date;
  dayLengthSeconds: number;
  goldenHourMorningEnd: Date;
  goldenHourEveningStart: Date;
  civilTwilightBegin: Date;
  civilTwilightEnd: Date;
  nauticalTwilightBegin: Date;
  nauticalTwilightEnd: Date;
  astronomicalTwilightBegin: Date;
  astronomicalTwilightEnd: Date;
}
