'use client';

import React from 'react';

export interface DaySliderProps {
  value: number;
  onChange: (day: number) => void;
}

const DAYS = ['Today', '+1d', '+2d', '+3d', '+4d', '+5d', '+6d'];

export default function DaySlider({ value, onChange }: DaySliderProps) {
  return (
    <div className="flex items-center gap-2 mt-3 text-[11px] text-[#a1b9b0] flex-wrap">
      <span className="font-semibold text-[#a1b9b0]">Forecast:</span>
      <div className="flex items-center gap-1.5 flex-wrap">
        {DAYS.map((label, day) => {
          const isActive = value === day;
          return (
            <button
              key={day}
              type="button"
              onClick={() => onChange(day)}
              className={`px-2 py-1 rounded-md text-[10px] font-semibold border transition-colors cursor-pointer ${
                isActive
                  ? 'bg-[#13845f] border-[#13845f] text-white'
                  : 'bg-[#1a332d] border-[#2b4940] text-[#a1b9b0] hover:bg-[#20423a] hover:text-[#e7f5ef]'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { DaySlider };
