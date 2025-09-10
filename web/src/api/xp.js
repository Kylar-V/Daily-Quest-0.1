// web/src/api/xp.js
import { getStats, setStats, getHero, getState } from "./storage";
import * as XP from "../core/xp-system";
import { VOLUME_TIERS, classScale } from "../constants/balance";

/* ---------- helpers ---------- */

function levelFromXP(xp) {
  const n = Number(xp) || 0;
  return Math.floor(n / 100) + 1; // fallback curve; swap to your real curve later
}

function dayKey(ts) {
  const d = new Date(ts || Date.now());
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function getTodayCompletedCount(state, todayKey) {
  const quests = state.quests || [];
  return quests.filter(q => q.done && q.completedAt && dayKey(q.completedAt) === todayKey).length;
}

function updateStreak(stats, completedAt) {
  const today = dayKey(completedAt);
  const last  = stats.lastQuestDay || null;
  if (last === today) return stats;

  const d = new Date(completedAt);
  const y = dayKey(new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1).getTime());
  const streak = (last === y) ? (Number(stats.streak)||0) + 1 : 1;
  return { ...stats, streak, lastQuestDay: today };
}

function getVolumeMultiplier(countToday) {
  let mult = 1.0;
  for (const tier of VOLUME_TIERS) {
    if (countToday >= tier.count) mult = tier.mult;
  }
  return mult;
}

function getClassMultiplier(heroClass, size, countToday, stats) {
  const lvl  = stats.level ?? levelFromXP(stats.xp);
  const base = classScale(lvl); // 1.10 / 1.12 / 1.15

  switch (heroClass) {
    case "Knight": return size === "Large"  ? base : 1.0;
    case "Archer": return size === "Medium" ? base : 1.0;
    case "Rogue":  return countToday >= 3   ? base : 1.0;      // 3rd+ quest today
    case "Wizard": return (stats.streak||0) >= 2 ? base : 1.0; // streak active (2+ days)
    default:       return 1.0;
  }
}

/* ---------- SAFE wrapper around any xp-system ---------- */

function applyGain(before, amount) {
  let res;
  try {
    if (typeof XP.gainXP === "function") res = XP.gainXP(before, amount);
    else if (typeof XP.default === "function") res = XP.default(before, amount);
  } catch {
    /* ignore and fallback */
  }

  if (typeof res === "number") {
    const nextXP = (Number(before.xp)||0) + Number(res);
    return { ...before, xp: nextXP, level: levelFromXP(nextXP) };
  }

  if (res && typeof res === "object" && "xp" in res) {
    const nextXP = Number(res.xp) || 0;
    return { ...before, ...res, xp: nextXP, level: res.level ?? levelFromXP(nextXP) };
  }

  const nextXP = (Number(before.xp)||0) + (Number(amount)||0);
  return { ...before, xp: nextXP, level: levelFromXP(nextXP) };
}

/* ---------- main API ---------- */

// Award XP with quest context: { size, completedAt }
export function awardXP(baseAmount, context = {}) {
  const hero        = getHero() || {};
  const size        = context.size || "Small";
  const completedAt = context.completedAt || Date.now();

  const state      = getState();
  const today      = dayKey(completedAt);
  const countToday = getTodayCompletedCount(state, today);

  let before = getStats();
  before = {
    ...before,
    xp: Number(before.xp) || 0,
    level: before.level ?? levelFromXP(before.xp),
    hp: Number(before.hp) || 100,
    maxHp: Number(before.maxHp) || 100,
  };

  before = updateStreak(before, completedAt);

  const volumeMult = getVolumeMultiplier(countToday);
  const classMult  = getClassMultiplier(hero.class, size, countToday, before);

  const amount = Math.round((Number(baseAmount)||0) * volumeMult * classMult);

  const after = applyGain(before, amount);
  setStats(after);

  // NEW: celebratory toast
  window.dispatchEvent(new CustomEvent("dq:toast", {
    detail: { msg: `+${amount} XP` }
  }));

  // Level-up banner event
  const prevLevel = before.level ?? levelFromXP(before.xp);
  const nextLevel = after.level  ?? levelFromXP(after.xp);
  if (nextLevel > prevLevel) {
    window.dispatchEvent(new CustomEvent("dq:levelup", { detail: { from: prevLevel, to: nextLevel } }));
  }

  return after;
}
