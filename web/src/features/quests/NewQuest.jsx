import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { addQuest } from "../../api/storage";

export default function NewQuest() {
  const nav = useNavigate();
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [xp, setXp] = useState(10);
  const [hp, setHp] = useState(0);

  function handleCreate() {
    if (!title.trim()) return;

    addQuest({
      id: "q_" + Math.random().toString(36).slice(2),
      title: title.trim(),
      desc: desc.trim(),
      xp: Number(xp) || 0,
      hp: Number(hp) || 0,
      done: false,
      createdAt: Date.now()
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

      <div className="row">
        <div className="col">
          <label className="label">XP</label>
          <input className="input" type="number" value={xp} onChange={e=>setXp(e.target.value)} />
        </div>
        <div className="col">
          <label className="label">HP</label>
          <input className="input" type="number" value={hp} onChange={e=>setHp(e.target.value)} />
        </div>
      </div>

      <div className="row">
        <button className="btn" onClick={()=>nav("/log")}>Cancel</button>
        <button className="cta" onClick={handleCreate}>Create Quest</button>
      </div>
    </div>
  );
}
