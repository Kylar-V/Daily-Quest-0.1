import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { addQuest } from "../../api/storage";
import { TASK_SIZES, CATEGORIES } from "../../constants/balance";

export default function NewQuest() {
  const nav = useNavigate();
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [size, setSize] = useState("Small");
  const [category, setCategory] = useState("General");

  function handleCreate() {
    if (!title.trim()) return;

    addQuest({
      id: "q_" + Math.random().toString(36).slice(2),
      title: title.trim(),
      desc: desc.trim(),
      size,              // NEW: size field
      category,          // NEW: category field (for future bonuses)
      xp: TASK_SIZES[size], // auto-calculated XP
      done: false,
      createdAt: Date.now(),
    });

    nav("/log");
  }

  return (
    <div className="page">
      <h1>New Quest</h1>

      <label className="label">Title</label>
      <input className="input" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Make it epic…" />

      <label className="label">Description (optional)</label>
      <textarea className="input" rows="3" value={desc} onChange={e=>setDesc(e.target.value)} placeholder="What needs to be done?" />

      <label className="label">Task Size</label>
      <div className="grid" style={{gridTemplateColumns:'repeat(3, minmax(0,1fr))'}}>
        {Object.keys(TASK_SIZES).map(s => (
          <button
            key={s}
            className={`chip ${size === s ? "chip--active" : ""}`}
            onClick={() => setSize(s)}
            type="button"
          >
            {s} ({TASK_SIZES[s]} XP)
          </button>
        ))}
      </div>

      <label className="label">Category</label>
      <select className="input" value={category} onChange={e=>setCategory(e.target.value)}>
        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
      </select>

      <div className="row">
        <button className="btn" onClick={()=>nav("/log")}>Cancel</button>
        <button className="cta" onClick={handleCreate}>Create Quest</button>
      </div>
    </div>
  );
}
