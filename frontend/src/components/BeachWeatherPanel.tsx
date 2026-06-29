import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Cloud,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Drop,
  Sun,
  Thermometer,
  Waves,
  type Icon,
} from '@phosphor-icons/react';
import { useBeaches } from '../hooks/useBeaches';
import { useWeather } from '../hooks/useWeather';
import { useSunTimes } from '../hooks/useSunTimes';
import type { SunTimes, WeatherData, DailyForecast } from '../types/weather';

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
  if (uv <= 7) return 'text-[var(--color-uv-high)]';
  if (uv <= 10) return 'text-[var(--color-quality-poor)]';
  return 'text-[var(--color-uv-extreme)]';
}

function uvLabelKey(uv: number): string {
  if (uv <= 2) return 'weather.uvLow';
  if (uv <= 5) return 'weather.uvModerate';
  if (uv <= 7) return 'weather.uvHigh';
  if (uv <= 10) return 'weather.uvVeryHigh';
  return 'weather.uvExtreme';
}

type WeatherPresentation = {
  Icon: Icon;
  label: string;
  className: string;
};

function weatherPresentation(code: number, t: (k: string) => string): WeatherPresentation {
  if (code === 0) {
    return {
      Icon: Sun,
      label: t('weather.conditionClear'),
      className:
        'border-amber-300/50 bg-amber-100/70 text-amber-700 dark:border-amber-300/20 dark:bg-amber-400/15 dark:text-amber-200',
    };
  }
  if (code === 1) {
    return {
      Icon: CloudSun,
      label: t('weather.conditionMainlyClear'),
      className:
        'border-sky-300/45 bg-sky-100/60 text-sky-700 dark:border-sky-300/20 dark:bg-sky-400/15 dark:text-sky-200',
    };
  }
  if (code === 2) {
    return {
      Icon: CloudSun,
      label: t('weather.conditionPartlyCloudy'),
      className:
        'border-sky-300/45 bg-sky-100/60 text-sky-700 dark:border-sky-300/20 dark:bg-sky-400/15 dark:text-sky-200',
    };
  }
  if (code === 3) {
    return {
      Icon: Cloud,
      label: t('weather.conditionOvercast'),
      className:
        'border-slate-300/50 bg-slate-100/60 text-slate-600 dark:border-slate-300/20 dark:bg-slate-400/15 dark:text-slate-200',
    };
  }
  if (code === 45 || code === 48) {
    return {
      Icon: CloudFog,
      label: t('weather.conditionFog'),
      className:
        'border-zinc-300/50 bg-zinc-100/60 text-zinc-600 dark:border-zinc-300/20 dark:bg-zinc-400/15 dark:text-zinc-200',
    };
  }
  if ([51, 53, 55, 56, 57].includes(code)) {
    return {
      Icon: CloudRain,
      label: t('weather.conditionDrizzle'),
      className:
        'border-sky-300/50 bg-sky-100/60 text-sky-700 dark:border-sky-300/20 dark:bg-sky-400/15 dark:text-sky-200',
    };
  }
  if ([61, 63, 65, 66, 67].includes(code)) {
    return {
      Icon: CloudRain,
      label: t('weather.conditionRain'),
      className:
        'border-blue-300/50 bg-blue-100/60 text-blue-700 dark:border-blue-300/20 dark:bg-blue-400/15 dark:text-blue-200',
    };
  }
  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return {
      Icon: CloudSnow,
      label: t('weather.conditionSnow'),
      className:
        'border-cyan-300/50 bg-cyan-100/60 text-cyan-700 dark:border-cyan-300/20 dark:bg-cyan-400/15 dark:text-cyan-100',
    };
  }
  if ([80, 81, 82].includes(code)) {
    return {
      Icon: CloudRain,
      label: t('weather.conditionShowers'),
      className:
        'border-blue-300/50 bg-blue-100/60 text-blue-700 dark:border-blue-300/20 dark:bg-blue-400/15 dark:text-blue-200',
    };
  }
  if ([95, 96, 99].includes(code)) {
    return {
      Icon: CloudLightning,
      label: t('weather.conditionThunderstorm'),
      className:
        'border-orange-300/60 bg-orange-100/70 text-orange-800 dark:border-orange-300/25 dark:bg-orange-400/15 dark:text-orange-200',
    };
  }
  return {
    Icon: Cloud,
    label: t('weather.conditionOvercast'),
    className:
      'border-slate-300/50 bg-slate-100/60 text-slate-600 dark:border-slate-300/20 dark:bg-slate-400/15 dark:text-slate-200',
  };
}

function ConditionMark({
  presentation,
  size = 'md',
}: {
  presentation: WeatherPresentation;
  size?: 'md' | 'lg';
}) {
  const WeatherIcon = presentation.Icon;
  const sizeClass = size === 'lg' ? 'size-14' : 'size-9';
  const iconSize = size === 'lg' ? 30 : 21;

  return (
    <span
      className={`${sizeClass} shrink-0 rounded-full border grid place-items-center ${presentation.className}`}
      title={presentation.label}
      aria-label={presentation.label}
    >
      <WeatherIcon size={iconSize} weight="duotone" aria-hidden="true" />
    </span>
  );
}

function MetricTile({
  icon: MetricIcon,
  label,
  value,
  detail,
  valueClassName = 'text-ink',
}: {
  icon: Icon;
  label: string;
  value: ReactNode;
  detail?: ReactNode;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-xl border border-border/40 bg-surface-muted/35 dark:bg-surface-muted/20 px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-xs text-ink-muted">
        <MetricIcon size={15} weight="bold" aria-hidden="true" />
        <span>{label}</span>
      </div>
      <div className={`mt-1 text-2xl font-semibold leading-none tabular-nums ${valueClassName}`}>
        {value}
      </div>
      {detail && <div className="mt-1 text-xs text-ink-muted">{detail}</div>}
    </div>
  );
}

// Returns whole-hour marks (every 6h for long days, every 3h for short)
// that fall within [barStart, barEnd], expressed as { pct, label }.
function buildHourMarks(barStart: number, barEnd: number) {
  const spanHours = (barEnd - barStart) / 3_600_000;
  const step = spanHours > 16 ? 6 : spanHours > 10 ? 3 : 2;
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Stockholm',
    hour: 'numeric',
    hour12: false,
  });

  const marks: { pct: number; label: string }[] = [];
  // Iterate every UTC hour in the window; keep those whose Stockholm hour
  // is a multiple of `step` and falls comfortably inside the bar.
  const startH = Math.floor(barStart / 3_600_000);
  const endH = Math.ceil(barEnd / 3_600_000);
  for (let h = startH; h <= endH; h++) {
    const ms = h * 3_600_000;
    const seHour = Number(fmt.format(new Date(ms))) % 24; // guard against "24"
    if (seHour % step === 0) {
      const p = ((ms - barStart) / (barEnd - barStart)) * 100;
      if (p > 3 && p < 97) {
        marks.push({ pct: p, label: String(seHour).padStart(2, '0') });
      }
    }
  }
  return marks;
}

// --- Sun arc bar ---
// Gradient strip from civil twilight begin → end with golden-hour zones,
// fixed hour-reference ticks, and a live "now" dot.
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

  const hourMarks = buildHourMarks(barStart, barEnd);

  // Clamp sunrise/sunset labels away from card edges so text doesn't clip
  const srLabel = Math.max(5, Math.min(95, srPct));
  const ssLabel = Math.max(5, Math.min(95, ssPct));

  return (
    <div className="mt-1 mb-3">
      {/* Gradient bar */}
      <div
        className="relative h-5 rounded-full overflow-hidden"
        style={{ background: gradient }}
        aria-hidden="true"
      >
        {/* Hour reference ticks — short lines at the bottom of the bar */}
        {hourMarks.map(({ pct: p }) => (
          <div
            key={p}
            className="absolute bottom-0 w-px h-2 bg-white/25"
            style={{ left: `${p}%` }}
          />
        ))}
        {/* Sunrise / sunset full-height ticks */}
        <div className="absolute top-0 h-full w-px bg-white/50" style={{ left: `${srPct}%` }} />
        <div className="absolute top-0 h-full w-px bg-white/50" style={{ left: `${ssPct}%` }} />
        {/* Now marker */}
        {isNow && (
          <div
            className="absolute w-2.5 h-2.5 rounded-full bg-white shadow border border-white/80"
            style={{ left: `${nowPct}%`, top: '50%', transform: 'translate(-50%, -50%)' }}
          />
        )}
      </div>

      {/* Hour reference labels */}
      <div className="relative h-3.5 mt-0.5" aria-hidden="true">
        {hourMarks.map(({ pct: p, label }) => (
          <span
            key={p}
            className="absolute text-[9px] text-ink-muted/60 -translate-x-1/2 leading-none"
            style={{ left: `${p}%` }}
          >
            {label}
          </span>
        ))}
      </div>

      {/* Sunrise / sunset time labels — clamped from edges */}
      <div className="relative h-4 mt-0.5">
        <span
          className="absolute text-[10px] text-ink-muted -translate-x-1/2"
          style={{ left: `${srLabel}%` }}
        >
          {formatTime(sun.sunrise)}
        </span>
        <span
          className="absolute text-[10px] text-ink-muted -translate-x-1/2"
          style={{ left: `${ssLabel}%` }}
        >
          {formatTime(sun.sunset)}
        </span>
      </div>
    </div>
  );
}

// --- 5-day forecast strip ---
function ForecastStrip({
  forecast,
  lang,
  t,
}: {
  forecast: DailyForecast[];
  lang: string;
  t: (k: string) => string;
}) {
  if (!forecast.length) return null;
  const weekdayFmt = new Intl.DateTimeFormat(lang === 'en' ? 'en-GB' : 'sv-SE', {
    weekday: 'short',
    timeZone: 'Europe/Stockholm',
  });

  return (
    <div className="pt-3 border-t border-border/40">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="text-xs font-medium text-ink">{t('weather.forecast')}</div>
        <div className="hidden sm:flex items-center gap-3 text-[10px] text-ink-muted">
          <span>{t('weather.high')}</span>
          <span>{t('weather.low')}</span>
          <span>{t('weather.rain')}</span>
        </div>
      </div>
      <ul className="grid grid-cols-1 sm:grid-cols-5 gap-2">
        {forecast.slice(0, 5).map((d, i) => {
          // Parse as local date; append noon to avoid TZ day-shift
          const day = new Date(`${d.date}T12:00:00`);
          const condition = weatherPresentation(d.weatherCode, t);
          const rain =
            d.precipProbability == null
              ? t('weather.notAvailable')
              : `${Math.round(d.precipProbability)}%`;

          return (
            <li
              key={d.date}
              className="rounded-xl border border-border/40 bg-surface-muted/35 dark:bg-surface-muted/20 p-2.5"
            >
              <div className="flex items-center gap-2 sm:block sm:text-center">
                <div className="text-[11px] font-medium text-ink-muted capitalize">
                  {i === 0 ? t('weather.today') : weekdayFmt.format(day)}
                </div>
                <div className="sm:mx-auto sm:mt-1 sm:w-fit">
                  <ConditionMark presentation={condition} />
                </div>
              </div>

              <div className="mt-2 grid grid-cols-3 gap-1 text-left sm:text-center">
                <div>
                  <div className="text-[10px] text-ink-muted">{t('weather.high')}</div>
                  <div className="text-sm font-semibold tabular-nums">
                    {Math.round(d.tempMax)}°
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-ink-muted">{t('weather.low')}</div>
                  <div className="text-sm font-medium text-ink-muted tabular-nums">
                    {Math.round(d.tempMin)}°
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-ink-muted">{t('weather.rain')}</div>
                  <div className="flex items-center gap-0.5 text-sm font-medium text-[var(--color-accent)] tabular-nums sm:justify-center">
                    <Drop size={12} weight="fill" aria-hidden="true" />
                    {rain}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// --- Weather card ---
function WeatherCard({
  weather,
  lang,
  t,
}: {
  weather: WeatherData;
  lang: string;
  t: (k: string) => string;
}) {
  const uv = weather.uvIndex;
  const condition = weatherPresentation(weather.weatherCode, t);

  return (
    <div className="card p-4 space-y-3">
      <div className="rounded-xl border border-border/40 bg-surface-muted/45 dark:bg-surface-muted/25 p-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex items-center gap-3">
            <ConditionMark presentation={condition} size="lg" />
            <div className="min-w-0">
              <h2 className="font-display text-lg leading-tight">{t('weather.title')}</h2>
              <div className="text-sm text-ink-muted">{condition.label}</div>
            </div>
          </div>
          <div className="shrink-0 text-left sm:text-right">
            <div className="text-4xl font-semibold tabular-nums leading-none tracking-tight">
              {Math.round(weather.temperature)}°
            </div>
            <div className="mt-1 text-xs text-ink-muted">{t('weather.temperature')}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <MetricTile
          icon={Waves}
          label={t('weather.waterTemp')}
          value={
            weather.waterTemperature != null
              ? `${Math.round(weather.waterTemperature)}°`
              : t('weather.notAvailable')
          }
          valueClassName="text-accent"
        />
        <MetricTile
          icon={Thermometer}
          label={t('weather.feelsLike')}
          value={`${Math.round(weather.feelsLike)}°`}
        />
        <MetricTile
          icon={Sun}
          label={t('weather.uvIndex')}
          value={uv.toFixed(1)}
          detail={t(uvLabelKey(uv))}
          valueClassName={uvColor(uv)}
        />
      </div>

      <ForecastStrip forecast={weather.forecast} lang={lang} t={t} />
    </div>
  );
}

// --- Sun times card ---
function SunCard({ sun, t }: { sun: SunTimes; t: (k: string) => string }) {
  return (
    <div className="card p-4 space-y-3">
      <h2 className="font-display text-lg">{t('sun.title')}</h2>

      <SunArc sun={sun} />

      {/* Golden hour */}
      <div className="rounded-lg border border-amber-300/50 bg-amber-50/60 dark:bg-amber-900/15 dark:border-amber-700/30 px-3 py-2">
        <div className="text-[11px] font-medium text-amber-950 dark:text-amber-400 uppercase tracking-wide mb-1.5">
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
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
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
      {weather && <WeatherCard weather={weather} lang={lang} t={t} />}

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
