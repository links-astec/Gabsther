'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface HeatmapCalendarProps {
  activityDates: string[];   // ISO date strings: '2025-03-01'
  weeks?: number;            // How many weeks to show
}

export function HeatmapCalendar({ activityDates, weeks = 20 }: HeatmapCalendarProps) {
  const activitySet = useMemo(() => new Set(activityDates), [activityDates]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Build grid: [week][day] from oldest → today
  const grid = useMemo(() => {
    const totalDays = weeks * 7;
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - totalDays + 1);

    const days: Array<{ date: Date; hasActivity: boolean }> = [];
    for (let i = 0; i < totalDays; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const isoDate = d.toISOString().split('T')[0];
      days.push({ date: d, hasActivity: activitySet.has(isoDate) });
    }

    // Group into weeks
    const weekGroups: Array<typeof days> = [];
    for (let i = 0; i < days.length; i += 7) {
      weekGroups.push(days.slice(i, i + 7));
    }
    return weekGroups;
  }, [activitySet, weeks, today]);

  const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Compute month label positions
  const monthLabels = useMemo(() => {
    const labels: Array<{ label: string; colIndex: number }> = [];
    grid.forEach((week, wi) => {
      const first = week[0];
      if (first && first.date.getDate() <= 7) {
        labels.push({
          label: MONTH_LABELS[first.date.getMonth()],
          colIndex: wi,
        });
      }
    });
    return labels;
  }, [grid]);

  return (
    <div className="overflow-x-auto scrollbar-hide">
      <div className="min-w-max">
        {/* Month labels */}
        <div className="flex mb-1 ml-6">
          {grid.map((_, wi) => {
            const ml = monthLabels.find((m) => m.colIndex === wi);
            return (
              <div key={wi} className="w-4 mr-0.5">
                {ml && (
                  <span className="text-[9px] text-gray-400 dark:text-gray-500 font-medium whitespace-nowrap">
                    {ml.label}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex gap-0.5">
          {/* Day labels */}
          <div className="flex flex-col gap-0.5 mr-1">
            {DAY_LABELS.map((d, i) => (
              <div
                key={i}
                className="w-3 h-4 flex items-center justify-end"
              >
                {(i === 1 || i === 3 || i === 5) && (
                  <span className="text-[9px] text-gray-400 dark:text-gray-500">{d}</span>
                )}
              </div>
            ))}
          </div>

          {/* Cells grid */}
          {grid.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-0.5">
              {week.map(({ date, hasActivity }, di) => {
                const isToday =
                  date.toISOString().split('T')[0] ===
                  today.toISOString().split('T')[0];
                const isFuture = date > today;

                return (
                  <div
                    key={di}
                    title={date.toLocaleDateString('en-US', {
                      weekday: 'short', month: 'short', day: 'numeric',
                    })}
                    className={cn(
                      'w-4 h-4 rounded-sm transition-colors',
                      isFuture
                        ? 'bg-gray-50 dark:bg-gray-900'
                        : hasActivity
                        ? 'bg-brand-blue dark:bg-blue-500'
                        : 'bg-gray-100 dark:bg-gray-800',
                      isToday && 'ring-2 ring-offset-1 ring-brand-blue dark:ring-blue-400 ring-offset-white dark:ring-offset-gray-900'
                    )}
                  />
                );
              })}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 mt-2 ml-6">
          <span className="text-[10px] text-gray-400">Less</span>
          {[false, false, true, true, true].map((active, i) => (
            <div
              key={i}
              className={cn(
                'w-3 h-3 rounded-sm',
                active
                  ? i === 4
                    ? 'bg-blue-700 dark:bg-blue-400'
                    : i === 3
                    ? 'bg-blue-500 dark:bg-blue-500'
                    : 'bg-blue-300 dark:bg-blue-700'
                  : 'bg-gray-100 dark:bg-gray-800'
              )}
            />
          ))}
          <span className="text-[10px] text-gray-400">More</span>
        </div>
      </div>
    </div>
  );
}
