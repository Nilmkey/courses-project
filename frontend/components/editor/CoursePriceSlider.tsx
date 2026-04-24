"use client";

import { Label } from "@/components/ui/label";
import { useState, useCallback } from "react";

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
  max = 100000,
  step = 1,
}: CoursePriceSliderProps) {
  const [inputValue, setInputValue] = useState(value.toString());
  const percentage = ((value - min) / (max - min)) * 100;

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value.replace(/\D/g, ""); // Удаляем все нецифровые символы
      setInputValue(newValue);

      if (newValue === "") {
        onChange(0);
      } else {
        const numValue = parseInt(newValue, 10);
        onChange(Math.min(numValue, max));
      }
    },
    [onChange, max],
  );

  const handleInputBlur = useCallback(() => {
    const numValue = parseInt(inputValue, 10);
    if (isNaN(numValue) || numValue < min) {
      setInputValue(min.toString());
      onChange(min);
    } else if (numValue > max) {
      setInputValue(max.toString());
      onChange(max);
    } else {
      setInputValue(numValue.toString());
      onChange(numValue);
    }
  }, [inputValue, min, max, onChange]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-bold text-slate-700 dark:text-slate-300">
          Стоимость курса
        </Label>
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
          <input
            type="text"
            inputMode="numeric"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            className="max-w-[80px] bg-transparent text-right text-lg font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-green-500 rounded px-1"
          />
          <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            ₸
          </span>
        </div>
      </div>

      <div className="relative h-12 flex items-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all duration-1"
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
          onChange={(e) => {
            onChange(Number(e.target.value));
            setInputValue(e.target.value);
          }}
          className="
            absolute inset-0 w-full h-full
            opacity-0 cursor-pointer
          "
        />

        <div
          className="
            absolute h-6 w-6 bg-white border-2 border-green-600
            rounded-full shadow-lg pointer-events-none
            transition-all duration-1
            flex items-center justify-center
          "
          style={{ left: `calc(${percentage}% - 12px)` }}
        >
          <div className="w-2 h-2 bg-green-600 rounded-full" />
        </div>
      </div>

      <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>Бесплатно</span>
        <span>{max.toLocaleString("ru-RU")} ₸</span>
      </div>
    </div>
  );
}
