export type TimerPreset = {
  id: "extended" | "classic" | "flexible";
  label: string;
  workMinutes: number;
  breakMinutes: number;
};

export const TIMER_PRESETS: TimerPreset[] = [
  {
    id: "extended",
    label: "50 min work / 10 min break",
    workMinutes: 50,
    breakMinutes: 10,
  },
  {
    id: "classic",
    label: "25 min work / 5 min break",
    workMinutes: 25,
    breakMinutes: 5,
  },
  {
    id: "flexible",
    label: "45 min work / 15 min break",
    workMinutes: 45,
    breakMinutes: 15,
  },
];

export const DEFAULT_TIMER_PRESET = TIMER_PRESETS[0];
export const WORK_MINUTES = DEFAULT_TIMER_PRESET.workMinutes;
export const BREAK_MINUTES = DEFAULT_TIMER_PRESET.breakMinutes;

// Chime scheduling offset in milliseconds.
// You currently trigger the chime slightly before the final second.
export const CHIME_OFFSET_MS = 1000 - 220;
