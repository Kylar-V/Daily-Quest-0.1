// src/xp-system.js
import { storage } from "./storage/index.js";

// ===== Constants =====
export const MAX_LEVEL = 100;
export const CLASSES = ["Warrior", "Mage", "Ranger", "Rogue"];
export const QUEST_TYPES = ["knowledge", "physical", "focus", "general"];
export const DEFAULT_SETTINGS = {
  hideCompleted: false,
  filters: {
    status: "all",   // "all" | "incomplete" | "completed"
    size: "any",     // "any" | "small" | "medium" | "large"
    type: "any"      // "any" | QUEST_TYPES
  }
};

// XP rewards per quest size (hidden from UI)
const XP_REWARDS = { small: 5, medium: 10, large: 20 };

// ---- helpers ----
function generateId() {
  return (Date.now().toString(36) + Math.random().toString(36).slice(2, 8)).toUpperCase();
}

// XP curve (10% growth per level)
export function getNextLevelXP(level) {
  let xp = 100; // L1 -> L2
  for (let i = 1; i < level; i++) xp = Math.floor(xp * 1.1);
  return xp;
}

// ---- data (schema v5: per-class + types + settings with filters) ----
export let data = {
  schemaVersion: 5,
  name: "Kai",
  class: null, // current class
  classesProgress: {
    Warrior: { level: 1, xp: 0 },
    Mage:    { level: 1, xp: 0 },
    Ranger:  { level: 1, xp: 0 },
    Rogue:   { level: 1, xp: 0 }
  },
  tasks: [],
  settings: JSON.parse(JSON.stringify(DEFAULT_SETTINGS))
};

// ---- persistence via adapter ----
export function saveData() {
  storage.save(data);
}

export function loadData() {
  const loaded = storage.load();
  if (!loaded) return; // keep defaults

  // Base normalize to latest shape
  let normalized = {
    schemaVersion: 5,
    name: loaded.name || "Kai",
    class: loaded.class ?? null,
    classesProgress: loaded.classesProgress,
    tasks: Array.isArray(loaded.tasks) ? loaded.tasks : [],
    settings: loaded.settings || {}
  };

  // v1 -> v2 migration (per-class progress)
  if (!normalized.classesProgress) {
    const oldLevel = Number(loaded.level) || 1;
    const oldXp = Number(loaded.xp) || 0;
    const currentClass = loaded.class && CLASSES.includes(loaded.class) ? loaded.class : "Mage";
    const base = { level: 1, xp: 0 };
    normalized.classesProgress = {
      Warrior: { ...base },
      Mage:    { ...base },
      Ranger:  { ...base },
      Rogue:   { ...base }
    };
    normalized.classesProgress[currentClass] = { level: oldLevel, xp: oldXp };
  } else {
    // ensure all four classes exist and are sane
    const ensure = (p) => ({ level: Number(p?.level) || 1, xp: Number(p?.xp) || 0 });
    normalized.classesProgress = {
      Warrior: ensure(loaded.classesProgress.Warrior),
      Mage:    ensure(loaded.classesProgress.Mage),
      Ranger:  ensure(loaded.classesProgress.Ranger),
      Rogue:   ensure(loaded.classesProgress.Rogue)
    };
  }

  // v2 -> v3 migration (quest type + IDs)
  // v3 -> v4 migration (settings.hideCompleted)
  // v4 -> v5 migration (settings.filters)
  normalized.tasks = normalized.tasks.map(t => {
    const size = ["small","medium","large"].includes(t.size) ? t.size : "small";
    const type = QUEST_TYPES.includes(t.type) ? t.type : "general";
    return {
      id: t.id || generateId(),
      description: String(t.description || "").trim(),
      size,
      type,
      xp: Number(t.xp) || XP_REWARDS[size] || XP_REWARDS.small,
      completed: Boolean(t.completed)
    };
  });

  normalized.settings = {
    ...DEFAULT_SETTINGS,
    ...(loaded.settings || {}),
    filters: {
      ...DEFAULT_SETTINGS.filters,
      ...(loaded.settings?.filters || {})
    }
  };

  data = normalized;
}

// ---- per-class accessors ----
function ensureClassProgress(cls) {
  if (!CLASSES.includes(cls)) return null;
  const p = data.classesProgress[cls];
  if (!p) {
    data.classesProgress[cls] = { level: 1, xp: 0 };
    return data.classesProgress[cls];
  }
  p.level = Number(p.level) || 1;
  p.xp = Number(p.xp) || 0;
  return p;
}

export function getCurrentClass() {
  const cls = data.class && CLASSES.includes(data.class) ? data.class : "Mage";
  if (data.class !== cls) data.class = cls;
  ensureClassProgress(cls);
  return cls;
}

export function getCurrentProgress() {
  const cls = getCurrentClass();
  return ensureClassProgress(cls);
}

export function setClass(cls) {
  if (!CLASSES.includes(cls)) return false;
  data.class = cls;
  ensureClassProgress(cls);
  saveData();
  return true;
}

// Add XP to current class, return { levelUps }
export function addXPToCurrentClass(totalXP) {
  const prog = getCurrentProgress();
  let levelUps = 0;

  if (prog.level >= MAX_LEVEL) {
    prog.level = MAX_LEVEL;
    prog.xp = getNextLevelXP(prog.level);
  } else {
    prog.xp += Number(totalXP) || 0;
    let need = getNextLevelXP(prog.level);
    while (prog.xp >= need && prog.level < MAX_LEVEL) {
      prog.xp -= need;
      prog.level++;
      levelUps++;
      need = getNextLevelXP(prog.level);
    }
  }

  saveData();
  return { levelUps };
}

// ---- quests (internally "tasks") ----
export function addTask(description, size, type = "general") {
  const cleanSize = ["small", "medium", "large"].includes(size) ? size : "small";
  const cleanType = QUEST_TYPES.includes(type) ? type : "general";
  data.tasks.push({
    id: generateId(),
    description,
    size: cleanSize,
    type: cleanType,
    xp: XP_REWARDS[cleanSize],
    completed: false
  });
  saveData();
  console.log(`📝 Quest added: "${description}"`);
}

export function getTaskById(id) {
  return data.tasks.find(t => t.id === id) || null;
}

export function getSortedTasks() {
  return data.tasks.map((q, i) => ({ ...q, originalIndex: i }));
}

export function clearCompletedTasks() {
  data.tasks = data.tasks.filter(q => !q.completed);
  saveData();
}

// Edit / Delete
export function updateTask(id, { description, size, type } = {}) {
  const t = getTaskById(id);
  if (!t) return false;

  if (typeof description === "string" && description.trim()) {
    t.description = description.trim();
  }
  if (size && ["small", "medium", "large"].includes(size)) {
    t.size = size;
    t.xp = XP_REWARDS[size];
  }
  if (type && QUEST_TYPES.includes(type)) {
    t.type = type;
  }

  saveData();
  return true;
}

export function deleteTask(id) {
  const before = data.tasks.length;
  data.tasks = data.tasks.filter(t => t.id !== id);
  const changed = data.tasks.length !== before;
  if (changed) saveData();
  return changed;
}

// ---- settings helpers ----
export function toggleHideCompleted() {
  data.settings.hideCompleted = !data.settings.hideCompleted;
  saveData();
  return data.settings.hideCompleted;
}

export function setFilters({ status, size, type }) {
  const f = data.settings.filters || (data.settings.filters = { ...DEFAULT_SETTINGS.filters });

  if (status && ["all","incomplete","completed"].includes(status)) f.status = status;
  if (size && ["any","small","medium","large"].includes(size)) f.size = size;
  if (type && (type === "any" || QUEST_TYPES.includes(type))) f.type = type;

  saveData();
  return f;
}

export function getFilters() {
  return data.settings.filters || { ...DEFAULT_SETTINGS.filters };
}

// ---- Progress bar (uses current class progress) ----
export function showProgressBar() {
  const prog = getCurrentProgress();
  const needed = getNextLevelXP(prog.level);
  const totalBars = 20;
  const filled = Math.max(0, Math.min(totalBars, Math.round((prog.xp / needed) * totalBars)));
  return `[${"#".repeat(filled)}${"-".repeat(totalBars - filled)}] ${prog.xp}/${needed} XP`;
}

// ---- Class bonus application ----
// (We keep floats here; callers round once per quest afterward.)
export function applyClassBonus(xp, quest, batchCount) {
  const cls = getCurrentClass();

  // Rogue: +10% if completing 2+ quests
  if (cls === "Rogue" && batchCount > 1) xp = xp * 1.10;

  // Mage: +15% on knowledge quests
  if (cls === "Mage" && quest.type === "knowledge") xp = xp * 1.15;

  // Warrior: +20% on large quests
  if (cls === "Warrior" && quest.size === "large") xp = xp * 1.20;

  // Ranger: +10% on medium quests
  if (cls === "Ranger" && quest.size === "medium") xp = xp * 1.10;

  return xp;
}

// init
loadData ();