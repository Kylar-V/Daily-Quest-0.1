import React, { useMemo, useState } from "react";
import "./App.css";
import ProgressBar from "./components/ProgressBar.jsx";

import {
  data,
  getCurrentClass,
  getCurrentProgress,
  getNextLevelXP,
  showProgressBar, // kept for now, but we use the visual one too
  getSortedTasks,
  addTask,
  deleteTask,
  setClass,
  toggleHideCompleted,
  getFilters,
  setFilters,
  QUEST_TYPES,
  addXPToCurrentClass,
  applyClassBonus,
  MAX_LEVEL
} from "./core/xp-system.js";

// Same filtering rules as the CLI
function filteredTasks(list, filters, hideCompleted) {
  let out = [...list];
  if (hideCompleted && filters.status === "all") out = out.filter(q => !q.completed);
  if (filters.status === "incomplete") out = out.filter(q => !q.completed);
  if (filters.status === "completed") out = out.filter(q => q.completed);
  if (["small","medium","large"].includes(filters.size)) out = out.filter(q => q.size === filters.size);
  if (QUEST_TYPES.includes(filters.type)) out = out.filter(q => q.type === filters.type);
  return out;
}

export default function App() {
  const [, rerender] = useState(0);
  const force = () => rerender(x => x + 1);

  const cls = getCurrentClass();
  const prog = getCurrentProgress();
  const needed = getNextLevelXP(prog.level);
  const filters = getFilters();
  const hideCompleted = !!data.settings?.hideCompleted;

  const tasks = useMemo(() => {
    const list = getSortedTasks();
    return filteredTasks(list, filters, hideCompleted);
  }, [filters, hideCompleted, data.tasks.length, prog.level, prog.xp]);

  const [newQuest, setNewQuest] = useState({ description: "", size: "small", type: "general" });
  const [batchSelect, setBatchSelect] = useState(new Set());

  const toggleSelect = (id) => {
    const next = new Set(batchSelect);
    if (next.has(id)) next.delete(id); else next.add(id);
    setBatchSelect(next);
  };

  const completeSelected = () => {
    const ids = tasks.filter(t => batchSelect.has(t.id) && !t.completed).map(t => t.id);
    if (ids.length === 0) return;

    let multiplier = 1 + 0.05 * (ids.length - 1);
    if (multiplier > 1.25) multiplier = 1.25;

    let totalXP = 0;
    ids.forEach(id => {
      const q = data.tasks.find(t => t.id === id);
      if (!q || q.completed) return;
      let earned = q.xp * multiplier;
      earned = applyClassBonus(earned, q, ids.length);
      earned = Math.round(earned);
      totalXP += earned;
      q.completed = true;
    });
    addXPToCurrentClass(totalXP);
    setBatchSelect(new Set());
    force();
  };

  const completeSingle = (q) => {
    if (q.completed) return;
    let earned = q.xp;
    earned = applyClassBonus(earned, q, 1);
    earned = Math.round(earned);
    q.completed = true;
    addXPToCurrentClass(earned);
    force();
  };

  return (
    <div className="app">
      <header className="spread">
        <div>
          <h1 style={{ margin: 0 }}>Daily Quest</h1>
          <div>{data.name} the <strong>{cls}</strong></div>
        </div>
        <div className="hstack">
          <label className="hstack">
            <span className="label-muted">Class:</span>
            <select
              value={cls}
              onChange={(e) => { setClass(e.target.value); force(); }}
            >
              {["Warrior","Mage","Ranger","Rogue"].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
        </div>
      </header>

      <section className="card">
        <div><strong>Level:</strong> {prog.level} / {MAX_LEVEL}</div>
        <div className="hstack spread" style={{ marginTop: 6 }}>
          <span><strong>XP:</strong> {prog.xp}/{needed}</span>
          <span className="badge">{Math.round((prog.xp / needed) * 100 || 0)}%</span>
        </div>
        <div style={{ marginTop: 8 }}>
          <ProgressBar value={prog.xp} max={needed} />
        </div>
        {/* Keep ASCII bar for debugging if you like */}
        {/* <div style={{ fontFamily: "monospace", marginTop: 6 }}>{showProgressBar()}</div> */}
      </section>

      <section className="card">
        <h3 style={{ marginTop: 0 }}>Add Quest</h3>
        <div className="hstack wrap">
          <input
            type="text"
            style={{ flex: 2, minWidth: 220 }}
            placeholder="Quest description"
            value={newQuest.description}
            onChange={(e) => setNewQuest({ ...newQuest, description: e.target.value })}
          />
          <select value={newQuest.size} onChange={(e) => setNewQuest({ ...newQuest, size: e.target.value })}>
            <option value="small">small</option>
            <option value="medium">medium</option>
            <option value="large">large</option>
          </select>
          <select value={newQuest.type} onChange={(e) => setNewQuest({ ...newQuest, type: e.target.value })}>
            {["general","knowledge","physical","focus"].map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <button
            onClick={() => {
              const d = newQuest.description.trim();
              if (!d) return;
              addTask(d, newQuest.size, newQuest.type);
              setNewQuest({ description: "", size: "small", type: "general" });
              force();
            }}
          >
            Add
          </button>
        </div>
      </section>

      <section className="card">
        <div className="hstack">
          <h3 style={{ margin: 0 }}>Quests</h3>
          <label className="hstack">
            <input
              type="checkbox"
              checked={hideCompleted}
              onChange={() => { toggleHideCompleted(); force(); }}
            />
            <span className="label-muted">Hide completed</span>
          </label>
          <span style={{ marginLeft: "auto" }} className="label-muted">
            Showing {tasks.length} quest(s)
          </span>
        </div>

        <div className="hstack wrap" style={{ marginTop: 8 }}>
          <select
            value={filters.status}
            onChange={(e) => { setFilters({ status: e.target.value }); force(); }}
          >
            <option value="all">status: all</option>
            <option value="incomplete">status: incomplete</option>
            <option value="completed">status: completed</option>
          </select>

          <select
            value={filters.size}
            onChange={(e) => { setFilters({ size: e.target.value }); force(); }}
          >
            <option value="any">size: any</option>
            <option value="small">size: small</option>
            <option value="medium">size: medium</option>
            <option value="large">size: large</option>
          </select>

          <select
            value={filters.type}
            onChange={(e) => { setFilters({ type: e.target.value }); force(); }}
          >
            <option value="any">type: any</option>
            {["knowledge","physical","focus","general"].map(t => <option key={t} value={t}>type: {t}</option>)}
          </select>
        </div>

        <ul className="list">
          {tasks.map(q => (
            <li key={q.id}>
              <input
                type="checkbox"
                checked={q.completed || batchSelect.has(q.id)}
                onChange={() => toggleSelect(q.id)}
                title="Select for batch complete"
              />
              <span style={{ textDecoration: q.completed ? "line-through" : "none", flex: 1 }}>
                {q.description}
              </span>
              {!q.completed && (
                <button onClick={() => completeSingle(q)}>Complete</button>
              )}
              <button onClick={() => { deleteTask(q.id); force(); }}>Delete</button>
            </li>
          ))}
        </ul>

        <div className="hstack">
          <button onClick={completeSelected} disabled={batchSelect.size === 0}>
            Complete Selected ({batchSelect.size})
          </button>
        </div>
      </section>
    </div>
  );
}
