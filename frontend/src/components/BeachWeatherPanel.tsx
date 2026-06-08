import { useTranslation } from 'react-i18next';
import { useBeaches } from '../hooks/useBeaches';
import { useWeather } from '../hooks/useWeather';
import { useSunTimes } from '../hooks/useSunTimes';
import type { SunTimes, WeatherData } from '../types/weather';

// The API signals "does not occur" with a 1970 epoch date (Nordic midnight sun)
function occurs(d: Date): boolean {
  return d.getFullYear() > 1970;
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString('sv-SE', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Stockholm',
    hour12: false,
  });
}

function formatDayLength(seconds: number, t: (k: string) => string): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}${t('sun.hourShort')} ${m}${t('sun.minuteShort')}`;
}

function uvColor(uv: number): string {
  if (uv <= 2) return 'text-[var(--color-quality-good)]';
  if (uv <= 5) return 'text-[var(--color-quality-sufficient)]';
  if (uv <= 7) return 'text-[#e67e22]';
  if (uv <= 10) return 'text-[var(--color-quality-poor)]';
  return 'text-[#9b59b6]';
}

function uvLabelKey(uv: number): string {
  if (uv <= 2) return 'weather.uvLow';
  if (uv <= 5) return 'weather.uvModerate';
  if (uv <= 7) return 'weather.uvHigh';
  if (uv <= 10) return 'weather.uvVeryHigh';
  return 'weather.uvExtreme';
}

// --- Sun arc bar ---
// Shows a gradient strip from civil twilight begin → end, with
// golden-hour zones highlighted and a "now" marker.
function SunArc({ sun }: { sun: SunTimes }) {
  const barStart = sun.civilTwilightBegin.getTime();
  const barEnd = sun.civilTwilightEnd.getTime();
  const span = barEnd - barStart;
  if (span <= 0) return null;

  function pct(d: Date) {
    return Math.max(0, Math.min(100, ((d.getTime() - barStart) / span) * 100));
  }

  const srPct = pct(sun.sunrise);
  const gmPct = pct(sun.goldenHourMorningEnd);
  const gePct = pct(sun.goldenHourEveningStart);
  const ssPct = pct(sun.sunset);
  const nowPct = pct(new Date());
  const isNow = nowPct > 0 && nowPct < 100;

  const gradient = `linear-gradient(to right,
    #334155 0%,
    #334155 ${srPct.toFixed(1)}%,
    #f59e0b ${srPct.toFixed(1)}%,
    #fde68a ${gmPct.toFixed(1)}%,
    #fffbeb ${((gmPct + gePct) / 2).toFixed(1)}%,
    #fde68a ${gePct.toFixed(1)}%,
    #f59e0b ${ssPct.toFixed(1)}%,
    #334155 ${ssPct.toFixed(1)}%,
    #334155 100%
  )`;

  return (
    <div className="mt-1 mb-3">
      <div
        className="relative h-5 rounded-full overflow-hidden"
        style={{ background: gradient }}
        aria-hidden="true"
      >
        {/* Sunrise tick */}
        <div
          className="absolute top-0 h-full w-px bg-white/50"
          style={{ left: `${srPct}%` }}
        />
        {/* Sunset tick */}
        <div
          className="absolute top-0 h-full w-px bg-white/50"
          style={{ left: `${ssPct}%` }}
        />
        {/* Now marker */}
        {isNow && (
          <div
            className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white shadow border border-white/80"
            style={{ left: `${nowPct}%`, transform: 'translate(-50%, -50%)' }}
          />
        )}
      </div>
      {/* Time labels below the bar */}
      <div className="relative h-4 mt-0.5">
        <span
          className="absolute text-[10px] text-ink-muted -translate-x-1/2"
          style={{ left: `${srPct}%` }}
        >
          {formatTime(sun.sunrise)}
        </span>
        <span
          className="absolute text-[10px] text-ink-muted -translate-x-1/2"
          style={{ left: `${ssPct}%` }}
        >
          {formatTime(sun.sunset)}
        </span>
      </div>
    </div>
  );
}

// --- Weather card ---
function WeatherCard({ weather, t }: { weather: WeatherData; t: (k: string) => string }) {
  const uv = weather.uvIndex;
  return (
    <div className="card p-4 space-y-3">
      <h2 className="font-spectral text-lg">{t('weather.title')}</h2>

      {/* Temp row — two big numbers */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-xs text-ink-muted">{t('weather.temperature')}</div>
          <div className="text-3xl font-semibold tabular-nums leading-none">
            {Math.round(weather.temperature)}°
          </div>
        </div>
        <div>
          <div className="text-xs text-ink-muted">{t('weather.feelsLike')}</div>
          <div className="text-3xl font-semibold tabular-nums leading-none text-ink-muted">
            {Math.round(weather.feelsLike)}°
          </div>
        </div>
      </div>

      {/* Secondary row */}
      <div className="grid grid-cols-2 gap-3 text-sm pt-1 border-t border-border/40">
        <div>
          <div className="text-xs text-ink-muted">{t('weather.waterTemp')}</div>
          <div className="font-medium">
            {weather.waterTemperature != null
              ? `${Math.round(weather.waterTemperature)}°C`
              : <span className="text-ink-muted">{t('weather.notAvailable')}</span>}
          </div>
        </div>
        <div>
          <div className="text-xs text-ink-muted">{t('weather.uvIndex')}</div>
          <div className={`font-medium ${uvColor(uv)}`}>
            {uv.toFixed(1)}&thinsp;—&thinsp;{t(uvLabelKey(uv))}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Sun times card ---
function SunCard({ sun, t }: { sun: SunTimes; t: (k: string) => string }) {
  return (
    <div className="card p-4 space-y-3">
      <h2 className="font-spectral text-lg">{t('sun.title')}</h2>

      <SunArc sun={sun} />

      {/* Golden hour */}
      <div className="rounded-xl border border-amber-300/50 bg-amber-50/60 dark:bg-amber-900/15 dark:border-amber-700/30 px-3 py-2">
        <div className="text-[11px] font-medium text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-1.5">
          {t('sun.goldenHour')}
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <div className="text-xs text-ink-muted">{t('sun.morning')}</div>
            <div className="tabular-nums">
              {formatTime(sun.sunrise)} – {formatTime(sun.goldenHourMorningEnd)}
            </div>
          </div>
          <div>
            <div className="text-xs text-ink-muted">{t('sun.evening')}</div>
            <div className="tabular-nums">
              {formatTime(sun.goldenHourEveningStart)} – {formatTime(sun.sunset)}
            </div>
          </div>
        </div>
      </div>

      {/* Twilight rows */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <div className="text-xs text-ink-muted">{t('sun.civilTwilightBegin')}</div>
          <div className="tabular-nums">{formatTime(sun.civilTwilightBegin)}</div>
        </div>
        <div>
          <div className="text-xs text-ink-muted">{t('sun.civilTwilightEnd')}</div>
          <div className="tabular-nums">{formatTime(sun.civilTwilightEnd)}</div>
        </div>

        {occurs(sun.nauticalTwilightBegin) && (
          <>
            <div>
              <div className="text-xs text-ink-muted">{t('sun.nauticalTwilightBegin')}</div>
              <div className="tabular-nums">{formatTime(sun.nauticalTwilightBegin)}</div>
            </div>
            <div>
              <div className="text-xs text-ink-muted">{t('sun.nauticalTwilightEnd')}</div>
              <div className="tabular-nums">{formatTime(sun.nauticalTwilightEnd)}</div>
            </div>
          </>
        )}
      </div>

      {/* Day length */}
      <div className="text-sm text-ink-muted border-t border-border/40 pt-2">
        {t('sun.dayLength')}
        {': '}
        <span className="text-ink font-medium tabular-nums">
          {formatDayLength(sun.dayLengthSeconds, t)}
        </span>
      </div>
    </div>
  );
}

// --- Panel (entry point used by BeachDetailPage) ---
interface Props {
  beachId: string;
}

export default function BeachWeatherPanel({ beachId }: Props) {
  const { t } = useTranslation();
  const { data: beaches } = useBeaches();
  const beach = beaches?.find((b) => b.id === beachId);

  const { data: weather, isLoading: wLoading, isError: wError } = useWeather(
    beach?.lat,
    beach?.lon
  );
  const { data: sun, isLoading: sLoading, isError: sError } = useSunTimes(
    beach?.lat,
    beach?.lon
  );

  return (
    <div className="space-y-4">
      {/* Weather */}
      {wLoading && (
        <div className="card p-4 space-y-3">
          <div className="h-5 w-24 bg-surface-muted rounded animate-pulse" />
          <div className="grid grid-cols-2 gap-3">
            <div className="h-10 bg-surface-muted rounded animate-pulse" />
            <div className="h-10 bg-surface-muted rounded animate-pulse" />
          </div>
        </div>
      )}
      {wError && (
        <div className="card p-4">
          <p className="text-sm text-ink-muted">{t('weather.error')}</p>
        </div>
      )}
      {weather && <WeatherCard weather={weather} t={t} />}

      {/* Sun times */}
      {sLoading && (
        <div className="card p-4 space-y-3">
          <div className="h-5 w-28 bg-surface-muted rounded animate-pulse" />
          <div className="h-5 w-full bg-surface-muted rounded-full animate-pulse" />
          <div className="grid grid-cols-2 gap-3">
            <div className="h-8 bg-surface-muted rounded animate-pulse" />
            <div className="h-8 bg-surface-muted rounded animate-pulse" />
          </div>
        </div>
      )}
      {sError && (
        <div className="card p-4">
          <p className="text-sm text-ink-muted">{t('sun.error')}</p>
        </div>
      )}
      {sun && <SunCard sun={sun} t={t} />}
    </div>
  );
}
