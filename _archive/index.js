import readline from "readline";
import {
  data,
  addTask,
  clearCompletedTasks,
  getSortedTasks,
  showProgressBar,
  getNextLevelXP,
  MAX_LEVEL,
  getTaskById,
  setClass,
  getCurrentClass,
  getCurrentProgress,
  addXPToCurrentClass,
  QUEST_TYPES,
  applyClassBonus,
  updateTask,
  deleteTask,
  toggleHideCompleted,
  setFilters,
  getFilters
} from "./src/xp-system.js";

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise(res => rl.question(q, a => res(a)));

// --- helper: what class bonus percent WOULD apply for this quest/batch? ---
function classBonusPercentForQuest(cls, quest, batchCount) {
  if (cls === "Rogue") return batchCount > 1 ? 10 : 0;
  if (cls === "Mage") return quest.type === "knowledge" ? 15 : 0;
  if (cls === "Warrior") return quest.size === "large" ? 20 : 0;
  if (cls === "Ranger") return quest.size === "medium" ? 10 : 0;
  return 0;
}

// ---- Views ----
function viewStats() {
  const cls = getCurrentClass();
  const prog = getCurrentProgress();
  const title = `${data.name} the ${cls}`;
  console.log(`\n🎮 ${title}`);
  console.log(`Level: ${prog.level}`);
  console.log(`XP: ${prog.xp}/${getNextLevelXP(prog.level)}`);
  console.log(showProgressBar());
}

function applyFiltersToList(list) {
  const hideCompleted = !!data.settings?.hideCompleted;
  const f = getFilters();

  let out = [...list];

  // Quick toggle applies only when status == "all"
  if (hideCompleted && f.status === "all") {
    out = out.filter(q => !q.completed);
  }

  // Status filter
  if (f.status === "incomplete") out = out.filter(q => !q.completed);
  else if (f.status === "completed") out = out.filter(q => q.completed);

  // Size filter
  if (["small","medium","large"].includes(f.size)) {
    out = out.filter(q => q.size === f.size);
  }

  // Type filter
  if (QUEST_TYPES.includes(f.type)) {
    out = out.filter(q => q.type === f.type);
  }

  return out;
}

function filterSummary() {
  const f = getFilters();
  const bits = [];
  bits.push(`Status: ${f.status}`);
  bits.push(`Size: ${f.size}`);
  bits.push(`Type: ${f.type}`);
  if (data.settings?.hideCompleted && f.status === "all") bits.push(`(Hide Completed ON)`);
  return bits.join(" | ");
}

function viewQuests() {
  console.log("\n📜 Quests:");
  let quests = getSortedTasks();
  quests = applyFiltersToList(quests);

  console.log(`Filters → ${filterSummary()}`);
  console.log(`Showing ${quests.length} quest(s).`);
  if (quests.length === 0) {
    console.log("(no quests to show)");
    return;
  }

  quests.forEach((q, i) => {
    console.log(`${i}: [${q.completed ? "✅" : "❌"}] ${q.description}`);
  });
}

// ---- Filters submenu (now accepts free-form input like "all", "small", "knowledge") ----
async function filtersMenu() {
  const isStatus = v => ["all","incomplete","completed"].includes(v);
  const isSize   = v => ["any","small","medium","large"].includes(v);
  const isType   = v => v === "any" || QUEST_TYPES.includes(v);

  while (true) {
    console.log("\n=== Quest Filters ===");
    console.log(`Current → ${filterSummary()}`);
    console.log("1. Status (all / incomplete / completed)");
    console.log("2. Size (any / small / medium / large)");
    console.log(`3. Type (any / ${QUEST_TYPES.join(" / ")})`);
    console.log("4. Reset filters to defaults");
    console.log("5. Back");

    const raw = (await ask("Choose an option (or type a value like 'incomplete', 'small', 'knowledge'): ")).trim().toLowerCase();

    // Old-school numeric flow
    if (raw === "1") {
      const v = (await ask("Enter status (all/incomplete/completed): ")).trim().toLowerCase();
      if (isStatus(v)) {
        setFilters({ status: v });
        console.log("✅ Status filter updated.");
      } else {
        console.log("❌ Invalid status.");
      }
      continue;
    }
    if (raw === "2") {
      const v = (await ask("Enter size (any/small/medium/large): ")).trim().toLowerCase();
      if (isSize(v)) {
        setFilters({ size: v });
        console.log("✅ Size filter updated.");
      } else {
        console.log("❌ Invalid size.");
      }
      continue;
    }
    if (raw === "3") {
      const v = (await ask(`Enter type (any/${QUEST_TYPES.join("/")}) : `)).trim().toLowerCase();
      if (isType(v)) {
        setFilters({ type: v });
        console.log("✅ Type filter updated.");
      } else {
        console.log("❌ Invalid type.");
      }
      continue;
    }
    if (raw === "4" || raw === "reset") {
      setFilters({ status: "all", size: "any", type: "any" });
      console.log("🔄 Filters reset.");
      continue;
    }
    if (raw === "5" || raw === "back") {
      return;
    }

    // New: free-form quick commands
    if (isStatus(raw)) {
      setFilters({ status: raw });
      console.log("✅ Status filter updated.");
      continue;
    }
    if (isSize(raw)) {
      setFilters({ size: raw });
      console.log("✅ Size filter updated.");
      continue;
    }
    if (isType(raw)) {
      setFilters({ type: raw });
      console.log("✅ Type filter updated.");
      continue;
    }

    console.log("Invalid option.");
  }
}

// ---- Class selection ----
async function chooseClass() {
  console.log("\nChoose your class:");
  console.log("1) ⚔️  Warrior");
  console.log("2) 🧙  Mage");
  console.log("3) 🏹  Ranger");
  console.log("4) 🗡️  Rogue");
  const choice = (await ask("Enter 1-4: ")).trim();
  const map = { "1": "Warrior", "2": "Mage", "3": "Ranger", "4": "Rogue" };
  const cls = map[choice];
  if (!cls) {
    console.log("Invalid choice.");
    return;
  }
  setClass(cls);
  console.log(`✅ Class set to ${cls}!`);
  viewStats();
}

// ---- Add Quests ----
async function addQuests() {
  while (true) {
    const description = (await ask("Quest name/description: ")).trim();
    if (!description) { console.log("Please enter a quest name."); continue; }

    let size;
    while (true) {
      const ans = await ask("Quest size (small / medium / large): ");
      size = ans.toLowerCase().trim();
      if (["small", "medium", "large"].includes(size)) break;
      console.log("Invalid size. Try again.");
    }

    let type;
    while (true) {
      const ans = await ask(`Quest type (${QUEST_TYPES.join(" / ")}): `);
      type = ans.toLowerCase().trim();
      if (QUEST_TYPES.includes(type)) break;
      console.log("Invalid type. Try again.");
    }

    addTask(description, size, type);

    const more = (await ask("Add another quest? (y/n): ")).toLowerCase();
    if (more !== "y") break;
  }
}

// ---- Edit Quest ----
async function editQuest() {
  let shown = applyFiltersToList(getSortedTasks());
  if (shown.length === 0) {
    console.log("No quests to edit.");
    return;
  }
  viewQuests();
  const raw = await ask("Enter quest number to edit: ");
  const i = parseInt(raw.trim(), 10);
  if (isNaN(i) || i < 0 || i >= shown.length) {
    console.log("❌ Invalid quest number.");
    return;
  }
  const q = shown[i];
  const full = getTaskById(q.id);
  if (!full) { console.log("❌ Quest not found."); return; }

  console.log(`Editing "${full.description}"`);
  const newDesc = (await ask(`New name (leave blank to keep): `)).trim();

  const sizeAns = (await ask(`New size (small/medium/large, blank to keep "${full.size}"): `)).trim().toLowerCase();
  const newSize = sizeAns ? (["small","medium","large"].includes(sizeAns) ? sizeAns : null) : null;
  if (sizeAns && !newSize) console.log("⚠️ Invalid size. Keeping existing.");

  const typeAns = (await ask(`New type (${QUEST_TYPES.join("/")}, blank to keep "${full.type}"): `)).trim().toLowerCase();
  const newType = typeAns ? (QUEST_TYPES.includes(typeAns) ? typeAns : null) : null;
  if (typeAns && !newType) console.log("⚠️ Invalid type. Keeping existing.");

  const ok = updateTask(full.id, {
    description: newDesc || undefined,
    size: newSize || undefined,
    type: newType || undefined
  });

  console.log(ok ? "✅ Quest updated." : "❌ Failed to update quest.");
}

// ---- Delete Quest(s) — supports multiple indices ----
async function deleteQuests() {
  let shown = applyFiltersToList(getSortedTasks());
  if (shown.length === 0) {
    console.log("No quests to delete.");
    return;
  }
  viewQuests();
  const raw = await ask("Enter quest numbers to delete (comma-separated): ");
  let indices = raw
    .split(",")
    .map(s => parseInt(s.trim(), 10))
    .filter(i => !isNaN(i) && i >= 0 && i < shown.length);

  if (indices.length === 0) {
    console.log("❌ No valid quest numbers entered.");
    return;
  }

  // Deduplicate while preserving order
  const seen = new Set();
  indices = indices.filter(i => (seen.has(i) ? false : (seen.add(i), true)));

  const selected = indices.map(i => shown[i]);
  const names = selected.map(q => `"${q.description}"`).join(", ");

  const confirm = (await ask(`Delete ${selected.length} quest(s): ${names}? (y/n): `))
    .trim()
    .toLowerCase();
  if (confirm !== "y") {
    console.log("Deletion cancelled.");
    return;
  }

  let deleted = 0;
  selected.forEach(q => {
    if (deleteTask(q.id)) deleted++;
  });

  console.log(deleted > 0 ? `🗑️ Deleted ${deleted} quest(s).` : "❌ No quests were deleted.");
}

// ---- Complete Quests (single or batch) ----
async function completeQuests() {
  let shown = applyFiltersToList(getSortedTasks());
  if (shown.length === 0) {
    console.log("No quests to complete.");
    return;
  }

  viewQuests();
  const raw = await ask("Enter quest numbers to complete (comma-separated): ");
  const indices = raw
    .split(",")
    .map(s => parseInt(s.trim(), 10))
    .filter(i => !isNaN(i) && i >= 0 && i < shown.length);

  if (indices.length === 0) {
    console.log("❌ No valid quest numbers entered.");
    return;
  }

  const cls = getCurrentClass();

  // Single quest flow (round once after all multipliers)
  if (indices.length === 1) {
    const quest = shown[indices[0]];
    const full = getTaskById(quest.id);
    if (!full) { console.log("❌ Quest not found."); return; }
    if (full.completed) { console.log(`⚠️ "${full.description}" is already completed.`); return; }

    let earned = full.xp;
    earned = applyClassBonus(earned, full, 1);
    earned = Math.round(earned);

    full.completed = true;

    const { levelUps } = addXPToCurrentClass(earned);

    const bonusPct = classBonusPercentForQuest(cls, full, 1);
    const bonusNote = bonusPct > 0 ? ` (+${bonusPct}% ${cls} bonus!)` : "";
    console.log(`✅ Completed "${full.description}" and earned ${earned} XP!${bonusNote}`);

    const prog = getCurrentProgress();
    for (let k = 0; k < levelUps; k++) {
      console.log(`🎉 You leveled up! You are now level ${prog.level - levelUps + k + 1}`);
    }
    return;
  }

  // Batch flow (5% per extra quest, capped 25%) then class bonus per quest; round once per quest
  let completedCount = 0;
  let totalXP = 0;

  let multiplier = 1 + 0.05 * (indices.length - 1);
  if (multiplier > 1.25) multiplier = 1.25;
  const batchPercent = Math.round((multiplier - 1) * 100);

  let classBonusAppliedPct = 0;
  indices.forEach(i => {
    const quest = shown[i];
    const full = getTaskById(quest.id);
    if (full && !full.completed) {
      let earned = full.xp * multiplier;
      earned = applyClassBonus(earned, full, indices.length);
      earned = Math.round(earned);

      const pct = classBonusPercentForQuest(getCurrentClass(), full, indices.length);
      if (pct > 0) classBonusAppliedPct = pct;

      totalXP += earned;
      full.completed = true;
      completedCount++;
    }
  });

  if (completedCount === 0) {
    console.log("⚠️ No new quests were completed.");
    return;
  }

  const { levelUps } = addXPToCurrentClass(totalXP);

  const notes = [];
  if (batchPercent > 0) notes.push(`+${batchPercent}% batch bonus`);
  if (classBonusAppliedPct > 0) notes.push(`+${classBonusAppliedPct}% ${getCurrentClass()} bonus`);

  const noteStr = notes.length ? ` (including ${notes.join(", ")})` : "";
  console.log(`✅ You completed ${completedCount} quests and earned ${totalXP} XP${noteStr}!`);

  const prog = getCurrentProgress();
  for (let k = 0; k < levelUps; k++) {
    console.log(`🎉 You leveled up! You are now level ${prog.level - levelUps + k + 1}`);
  }
}

// ---- Toggle hide completed ----
function toggleHideCompletedMenu() {
  const newState = toggleHideCompleted();
  console.log(`👁️  Hide completed is now ${newState ? "ON" : "OFF"}.`);
}

// ---- Menu ----
async function mainMenu() {
  while (true) {
    console.log("\n=== Daily Quest Menu ===");
    console.log("1. View Stats & Progress");
    console.log("2. View Quests");
    console.log("3. Add Quest(s)");
    console.log("4. Complete Quest(s)");
    console.log("5. Clear Completed Quests");
    console.log("6. Choose/Change Class");
    console.log("7. Edit Quest");
    console.log("8. Delete Quest(s)");
    console.log("9. Toggle Hide Completed");
    console.log("10. Quest Filters");
    console.log("11. Exit");

    const choice = (await ask("Choose an option: ")).trim();
    switch (choice) {
      case "1": viewStats(); break;
      case "2": viewQuests(); break;
      case "3": await addQuests(); break;
      case "4": await completeQuests(); break;
      case "5":
        clearCompletedTasks();
        console.log("🧹 Cleared completed quests.");
        break;
      case "6": await chooseClass(); break;
      case "7": await editQuest(); break;
      case "8": await deleteQuests(); break;
      case "9": toggleHideCompletedMenu(); break;
      case "10": await filtersMenu(); break;
      case "11":
        console.log("Goodbye!");
        rl.close();
        return;
      default:
        console.log("Invalid option. Try again.");
    }
  }
}

console.log("\nWelcome to Daily Quest!");
if (!data.class) {
  console.log("Tip: set your class from the menu (option 6).");
}
mainMenu();
