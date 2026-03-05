"use client";

import { Label } from "@/components/ui/label";
import { DollarSign } from "lucide-react";

export interface CoursePriceSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export function CoursePriceSlider({
  value,
  onChange,
  min = 0,
  max = 10000,
  step = 100,
}: CoursePriceSliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-bold text-slate-700 dark:text-slate-300">
          Стоимость курса
        </Label>
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <DollarSign className="h-4 w-4 text-green-600" />
          <span className="text-lg font-bold text-slate-900 dark:text-white">
            {value.toLocaleString("ru-RU")}
          </span>
        </div>
      </div>

      <div className="relative h-12 flex items-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all duration-150"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="
            absolute inset-0 w-full h-full 
            opacity-0 cursor-pointer
          "
        />

        <div
          className="
            absolute h-6 w-6 bg-white border-2 border-green-600 
            rounded-full shadow-lg pointer-events-none
            transition-all duration-150
            flex items-center justify-center
          "
          style={{ left: `calc(${percentage}% - 12px)` }}
        >
          <div className="w-2 h-2 bg-green-600 rounded-full" />
        </div>
      </div>

      <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>Бесплатно</span>
        <span>{max.toLocaleString("ru-RU")} ₽</span>
      </div>
    </div>
  );
}
