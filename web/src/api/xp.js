// web/src/api/xp.js
import { getStats, setStats } from "./storage";
import * as XP from "../core/xp-system"; // supports named or default export

// Find a gainXP function (supports different export styles)
const gain = XP.gainXP || XP.default || ((stats, amount) => {
  // Fallback: +amount XP; +1 level per 100 XP. Adjust later to your real curve.
  const nextXP = (stats.xp || 0) + (Number(amount) || 0);
  const level = Math.floor(nextXP / 100) + 1;
  return { ...stats, xp: nextXP, level };
});

export function awardXP(amount){
  const stats = getStats();
  const next = gain(stats, Number(amount) || 0);
  setStats(next);
  return next;
}
