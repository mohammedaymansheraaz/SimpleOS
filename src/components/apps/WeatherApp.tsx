import React, { useState } from 'react';
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  CloudSnow, 
  CloudLightning, 
  Wind, 
  Droplets, 
  Eye, 
  MapPin, 
  RefreshCw 
} from 'lucide-react';
import { sound } from '../../services/audio';

interface CityWeather {
  city: string;
  country: string;
  tempC: number;
  condition: 'Sunny' | 'Partly Cloudy' | 'Rain' | 'Thunderstorm' | 'Snow';
  humidity: number;
  windSpeed: number; // km/h
  visibility: number; // km
  uvIndex: number;
  forecast: Array<{ day: string; tempC: number; condition: string }>;
}

const CITIES_WEATHER: Record<string, CityWeather> = {
  'San Francisco': {
    city: 'San Francisco',
    country: 'United States',
    tempC: 17,
    condition: 'Partly Cloudy',
    humidity: 78,
    windSpeed: 18,
    visibility: 10,
    uvIndex: 4,
    forecast: [
      { day: 'Mon', tempC: 17, condition: 'Partly Cloudy' },
      { day: 'Tue', tempC: 19, condition: 'Sunny' },
      { day: 'Wed', tempC: 16, condition: 'Rain' },
      { day: 'Thu', tempC: 18, condition: 'Sunny' },
      { day: 'Fri', tempC: 20, condition: 'Sunny' },
    ],
  },
  'London': {
    city: 'London',
    country: 'United Kingdom',
    tempC: 14,
    condition: 'Rain',
    humidity: 86,
    windSpeed: 22,
    visibility: 8,
    uvIndex: 2,
    forecast: [
      { day: 'Mon', tempC: 14, condition: 'Rain' },
      { day: 'Tue', tempC: 15, condition: 'Partly Cloudy' },
      { day: 'Wed', tempC: 16, condition: 'Sunny' },
      { day: 'Thu', tempC: 13, condition: 'Rain' },
      { day: 'Fri', tempC: 15, condition: 'Partly Cloudy' },
    ],
  },
  'Tokyo': {
    city: 'Tokyo',
    country: 'Japan',
    tempC: 24,
    condition: 'Sunny',
    humidity: 55,
    windSpeed: 12,
    visibility: 10,
    uvIndex: 7,
    forecast: [
      { day: 'Mon', tempC: 24, condition: 'Sunny' },
      { day: 'Tue', tempC: 26, condition: 'Sunny' },
      { day: 'Wed', tempC: 23, condition: 'Thunderstorm' },
      { day: 'Thu', tempC: 25, condition: 'Partly Cloudy' },
      { day: 'Fri', tempC: 27, condition: 'Sunny' },
    ],
  },
  'New York': {
    city: 'New York',
    country: 'United States',
    tempC: 21,
    condition: 'Sunny',
    humidity: 60,
    windSpeed: 14,
    visibility: 10,
    uvIndex: 6,
    forecast: [
      { day: 'Mon', tempC: 21, condition: 'Sunny' },
      { day: 'Tue', tempC: 23, condition: 'Partly Cloudy' },
      { day: 'Wed', tempC: 19, condition: 'Rain' },
      { day: 'Thu', tempC: 22, condition: 'Sunny' },
      { day: 'Fri', tempC: 24, condition: 'Sunny' },
    ],
  },
  'Paris': {
    city: 'Paris',
    country: 'France',
    tempC: 18,
    condition: 'Partly Cloudy',
    humidity: 68,
    windSpeed: 15,
    visibility: 10,
    uvIndex: 5,
    forecast: [
      { day: 'Mon', tempC: 18, condition: 'Partly Cloudy' },
      { day: 'Tue', tempC: 20, condition: 'Sunny' },
      { day: 'Wed', tempC: 19, condition: 'Sunny' },
      { day: 'Thu', tempC: 17, condition: 'Rain' },
      { day: 'Fri', tempC: 18, condition: 'Partly Cloudy' },
    ],
  },
};

export const WeatherApp: React.FC = () => {
  const [selectedCity, setSelectedCity] = useState<string>('San Francisco');
  const [unit, setUnit] = useState<'C' | 'F'>('C');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const data = CITIES_WEATHER[selectedCity] || CITIES_WEATHER['San Francisco'];

  const convertTemp = (tempC: number) => {
    if (unit === 'F') {
      return Math.round((tempC * 9) / 5 + 32);
    }
    return tempC;
  };

  const getWeatherIcon = (cond: string, size = 'w-6 h-6') => {
    if (cond.includes('Sun') || cond.includes('Clear')) {
      return <Sun className={`${size} text-amber-400`} />;
    }
    if (cond.includes('Rain')) {
      return <CloudRain className={`${size} text-sky-400`} />;
    }
    if (cond.includes('Snow')) {
      return <CloudSnow className={`${size} text-cyan-200`} />;
    }
    if (cond.includes('Thunder')) {
      return <CloudLightning className={`${size} text-yellow-400`} />;
    }
    return <Cloud className={`${size} text-stone-300`} />;
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    sound.playClick();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 400);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#09090b] text-stone-200 font-sans select-none overflow-y-auto p-6">
      {/* Top Header & City Switcher */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-stone-400" />
          <select
            value={selectedCity}
            onChange={(e) => {
              setSelectedCity(e.target.value);
              sound.playClick();
            }}
            className="bg-black/60 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-stone-100 font-semibold outline-none cursor-pointer"
          >
            {Object.keys(CITIES_WEATHER).map((c) => (
              <option key={c} value={c}>
                {c}, {CITIES_WEATHER[c].country}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-black/40 p-0.5 rounded-xl border border-white/10 text-xs font-mono">
            <button
              onClick={() => setUnit('C')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                unit === 'C' ? 'bg-stone-200 text-stone-950 font-bold' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              °C
            </button>
            <button
              onClick={() => setUnit('F')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                unit === 'F' ? 'bg-stone-200 text-stone-950 font-bold' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              °F
            </button>
          </div>

          <button
            onClick={handleRefresh}
            className={`p-2 rounded-xl bg-white/5 hover:bg-white/10 text-stone-400 hover:text-stone-200 transition-colors ${
              isRefreshing ? 'animate-spin' : ''
            }`}
            title="Refresh Forecast"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Current Weather Card */}
      <div className="my-6 p-6 rounded-3xl bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/10 flex items-center justify-between">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-stone-400 mb-1">
            Current Atmosphere
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-6xl font-light font-mono text-stone-100 tracking-tight">
              {convertTemp(data.tempC)}°
            </span>
            <span className="text-sm font-sans text-stone-400">{unit}</span>
          </div>
          <div className="text-sm font-medium text-stone-200 mt-2 flex items-center gap-2">
            {getWeatherIcon(data.condition, 'w-4 h-4')}
            <span>{data.condition}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center">
          {getWeatherIcon(data.condition, 'w-16 h-16')}
        </div>
      </div>

      {/* Weather Metrics Grid */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
            <Droplets className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-stone-500 uppercase tracking-wider">Humidity</div>
            <div className="text-xs font-mono font-semibold text-stone-200">{data.humidity}%</div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400">
            <Wind className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-stone-500 uppercase tracking-wider">Wind</div>
            <div className="text-xs font-mono font-semibold text-stone-200">{data.windSpeed} km/h</div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
            <Sun className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-stone-500 uppercase tracking-wider">UV Index</div>
            <div className="text-xs font-mono font-semibold text-stone-200">{data.uvIndex} (Mod)</div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-stone-500 uppercase tracking-wider">Visibility</div>
            <div className="text-xs font-mono font-semibold text-stone-200">{data.visibility} km</div>
          </div>
        </div>
      </div>

      {/* 5-Day Forecast */}
      <div>
        <h3 className="text-xs font-semibold text-stone-300 mb-3 uppercase tracking-wider">5-Day Outlook</h3>
        <div className="grid grid-cols-5 gap-2">
          {data.forecast.map((fc, i) => (
            <div
              key={fc.day}
              className={`p-3.5 rounded-2xl border text-center flex flex-col items-center justify-between gap-2 ${
                i === 0 ? 'bg-white/[0.06] border-white/15' : 'bg-white/[0.02] border-white/5'
              }`}
            >
              <div className="text-xs font-medium text-stone-400">{fc.day}</div>
              <div className="my-1">{getWeatherIcon(fc.condition, 'w-6 h-6')}</div>
              <div className="text-xs font-mono font-bold text-stone-100">{convertTemp(fc.tempC)}°</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
