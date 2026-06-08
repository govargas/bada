export interface WeatherData {
  temperature: number;
  feelsLike: number;
  uvIndex: number;
  waterTemperature: number | null;
  fetchedAt: string;
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
