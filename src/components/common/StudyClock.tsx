import React, { useState, useEffect } from 'react';
import { Clock as ClockIcon, Calendar, Sparkles } from 'lucide-react';

interface StudyClockProps {
  variant?: 'compact' | 'card' | 'badge';
  className?: string;
  defaultMode?: 'digital' | 'analog';
}

export const StudyClock: React.FC<StudyClockProps> = ({
  variant = 'card',
  className = '',
  defaultMode = 'digital',
}) => {
  const [time, setTime] = useState<Date>(new Date());
  const [mode, setMode] = useState<'digital' | 'analog'>(defaultMode);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();

  const formattedHours = (hours % 12 || 12).toString().padStart(2, '0');
  const formattedMinutes = minutes.toString().padStart(2, '0');
  const formattedSeconds = seconds.toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';

  const dateStr = time.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const fullDateStr = time.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Calculate angles for analog clock
  const secondDeg = (seconds / 60) * 360;
  const minuteDeg = ((minutes + seconds / 60) / 60) * 360;
  const hourDeg = (((hours % 12) + minutes / 60) / 12) * 360;

  if (variant === 'badge' || variant === 'compact') {
    return (
      <div
        onClick={() => setMode(mode === 'digital' ? 'analog' : 'digital')}
        className={`inline-flex items-center space-x-2 bg-white/90 hover:bg-slate-50 border border-slate-200/90 px-3 py-1.5 rounded-xl shadow-xs cursor-pointer transition-all hover:border-blue-300 group select-none ${className}`}
        title={`Live Clock (${mode.toUpperCase()}) - Click to toggle Digital/Analog`}
      >
        {mode === 'digital' ? (
          <>
            <ClockIcon className="w-4 h-4 text-blue-600 group-hover:rotate-45 transition-transform" />
            <div className="flex items-baseline space-x-1 font-mono">
              <span className="text-xs font-bold text-slate-800 tracking-tight">
                {formattedHours}:{formattedMinutes}
              </span>
              <span className="text-[10px] text-blue-600 font-semibold">{formattedSeconds}</span>
              <span className="text-[9px] font-bold text-slate-400 ml-0.5">{ampm}</span>
            </div>
          </>
        ) : (
          /* Mini Analog Dial */
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded-full border border-slate-300 relative flex items-center justify-center bg-slate-50">
              {/* Hour hand */}
              <div
                className="absolute w-0.5 h-1.5 bg-slate-800 rounded-full origin-bottom bottom-1/2"
                style={{ transform: `rotate(${hourDeg}deg)` }}
              />
              {/* Minute hand */}
              <div
                className="absolute w-0.5 h-2 bg-blue-600 rounded-full origin-bottom bottom-1/2"
                style={{ transform: `rotate(${minuteDeg}deg)` }}
              />
              {/* Center point */}
              <div className="w-1 h-1 rounded-full bg-slate-900 z-10" />
            </div>
            <span className="text-xs font-bold text-slate-800 font-mono">
              {formattedHours}:{formattedMinutes} {ampm}
            </span>
          </div>
        )}
      </div>
    );
  }

  // Full Card Variant for Dashboard
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-col justify-between relative overflow-hidden transition-all ${className}`}
    >
      {/* Card Header with Mode Toggle */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <ClockIcon className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-800">Live Clock</span>
            <p className="text-[10px] text-slate-400 leading-none">{dateStr}</p>
          </div>
        </div>

        {/* Toggle Mode Switch */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/80 text-[11px] font-semibold">
          <button
            type="button"
            onClick={() => setMode('digital')}
            className={`px-2 py-0.5 rounded-md transition-all ${
              mode === 'digital'
                ? 'bg-white text-blue-700 shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Digital
          </button>
          <button
            type="button"
            onClick={() => setMode('analog')}
            className={`px-2 py-0.5 rounded-md transition-all ${
              mode === 'analog'
                ? 'bg-white text-blue-700 shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Analog
          </button>
        </div>
      </div>

      {/* Clock Display Body */}
      {mode === 'digital' ? (
        <div className="py-2 flex flex-col items-center justify-center">
          <div className="flex items-baseline space-x-1.5 font-mono">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {formattedHours}:{formattedMinutes}
            </span>
            <span className="text-lg font-bold text-blue-600 animate-pulse">
              :{formattedSeconds}
            </span>
            <span className="text-xs font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700 ml-1">
              {ampm}
            </span>
          </div>

          <div className="flex items-center space-x-2 mt-2 text-xs text-slate-500 font-medium">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{fullDateStr}</span>
          </div>
        </div>
      ) : (
        /* Analog Dial View */
        <div className="py-2 flex flex-col items-center justify-center">
          <div className="w-28 h-28 rounded-full border-2 border-slate-200 bg-gradient-to-b from-slate-50 to-white relative shadow-inner flex items-center justify-center">
            {/* Clock Dial Numerals / Indicators */}
            {[12, 3, 6, 9].map((num) => {
              const rot = num === 12 ? 0 : num === 3 ? 90 : num === 6 ? 180 : 270;
              return (
                <div
                  key={num}
                  className="absolute text-[10px] font-bold text-slate-400 font-mono"
                  style={{
                    transform:
                      num === 12
                        ? 'translateY(-42px)'
                        : num === 3
                        ? 'translateX(42px)'
                        : num === 6
                        ? 'translateY(42px)'
                        : 'translateX(-42px)',
                  }}
                >
                  {num}
                </div>
              );
            })}

            {/* Hour hand */}
            <div
              className="absolute w-1 h-7 bg-slate-800 rounded-full origin-bottom bottom-1/2 shadow-xs transition-transform duration-200"
              style={{ transform: `rotate(${hourDeg}deg)` }}
            />

            {/* Minute hand */}
            <div
              className="absolute w-0.5 h-10 bg-slate-600 rounded-full origin-bottom bottom-1/2 shadow-xs transition-transform duration-200"
              style={{ transform: `rotate(${minuteDeg}deg)` }}
            />

            {/* Second hand */}
            <div
              className="absolute w-0.5 h-11 bg-rose-500 rounded-full origin-bottom bottom-1/2 z-10 transition-transform duration-100"
              style={{ transform: `rotate(${secondDeg}deg)` }}
            />

            {/* Center Pivot Point */}
            <div className="w-2.5 h-2.5 rounded-full bg-rose-600 border border-white z-20 shadow-xs" />
          </div>

          <p className="mt-2 text-xs font-mono font-bold text-slate-700">
            {formattedHours}:{formattedMinutes}:{formattedSeconds} {ampm}
          </p>
        </div>
      )}

      {/* Footer info */}
      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
        <span className="font-medium">Local System Time</span>
        <span className="font-mono text-slate-500">
          {Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'}
        </span>
      </div>
    </div>
  );
};
