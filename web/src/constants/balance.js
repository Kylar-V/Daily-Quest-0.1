// Base XP by task size
export const TASK_SIZES = { Small: 10, Medium: 25, Large: 50 };

// Gentle daily volume tiers (cap ~+15%)
export const VOLUME_TIERS = [
  { count: 2, mult: 1.05 },
  { count: 3, mult: 1.10 },
  { count: 5, mult: 1.15 },
];

// Class bonus scales with level bands
export function classScale(level) {
  if (level >= 31) return 1.15;
  if (level >= 11) return 1.12;
  return 1.10;
}
