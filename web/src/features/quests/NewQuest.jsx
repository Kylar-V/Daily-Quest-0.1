import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { addQuest } from "../../api/storage";
import { TASK_SIZES } from "../../constants/balance";

export default function NewQuest() {
  const nav = useNavigate();
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [size, setSize] = useState("Small");
  const [busy, setBusy] = useState(false);

  async function suggestEpicName() {
    const raw = title.trim();
    if (!raw) {
      window.dispatchEvent(new CustomEvent("dq:toast", { detail: { msg: "Type a task first" } }));
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("https://toolkit.rork.com/text/llm/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content:
                "You are a creative fantasy quest name generator. Transform boring daily tasks into epic RPG quest names. Keep them fun, adventurous, and under 50 characters. Examples: \"Vacuum the house\" → \"Defeat the Dust Goblins\", \"Do laundry\" → \"Slay the Laundry Dragon\", \"Drink water\" → \"Consume Healing Elixir\". Only return the quest name, nothing else."
            },
            { role: "user", content: `Transform this task into an epic fantasy quest name: "${raw}"` }
          ]
        }),
      });
      if (!res.ok) throw new Error("Name API failed");
      const data = await res.json();
      const epic = (data.completion || "").trim().replace(/(^["']|["']$)/g, "");
      if (!epic) throw new Error("No name returned");
      setTitle(epic);
      window.dispatchEvent(new CustomEvent("dq:toast", { detail: { msg: "✨ Epic name generated!" } }));
    } catch (e) {
      console.error(e);
      window.dispatchEvent(new CustomEvent("dq:toast", { detail: { msg: "Name magic failed—try again" } }));
    } finally {
      setBusy(false);
    }
  }

  function handleCreate() {
    if (!title.trim()) return;
    addQuest({
      id: "q_" + Math.random().toString(36).slice(2),
      title: title.trim(),
      desc: desc.trim() || undefined,
      size,
      xp: TASK_SIZES[size],
      done: false,
      createdAt: Date.now(),
    });
    nav("/log");
  }

  return (
    <div className="page">
      <h1>New Quest</h1>

      <label className="label">Title</label>
      <div className="row" style={{ gap: 8, alignItems: "stretch", justifyContent: "stretch" }}>
        <input
          className="input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter your task…"
          style={{ flex: 1 }}
          onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); }}
        />
        <button
          className={`btn magic ${busy ? "is-busy" : ""}`}
          onClick={suggestEpicName}
          disabled={busy}
          title="Make it epic"
          type="button"
        >
          {busy ? "…" : "✨"}
        </button>
      </div>
      <div className="muted" style={{ marginTop: 6 }}>Tip: Tap ✨ to transform your task into an epic quest name.</div>

      <label className="label">Description (optional)</label>
      <textarea
        className="input"
        rows="3"
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        placeholder="What needs to be done?"
      />

      <label className="label">Task Size</label>
      <div className="grid" style={{gridTemplateColumns:'repeat(3, minmax(0,1fr))'}}>
        {Object.keys(TASK_SIZES).map((s) => (
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

      <div className="row">
        <button className="btn" onClick={() => nav("/log")}>Cancel</button>
        <button className="cta" onClick={handleCreate}>Create Quest</button>
      </div>
    </div>
  );
}
