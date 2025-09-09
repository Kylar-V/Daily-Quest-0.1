import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function QuestLog() {
  const nav = useNavigate();
  const [quests, setQuests] = useState([]);

  useEffect(() => {
    const s = JSON.parse(localStorage.getItem("dq:v1") || "{}");
    setQuests(s.quests || []);
  }, []);

  return (
    <div className="page">
      <header className="header">
        <h1>Quest Log</h1>
        <Link to="/character" className="link">Character →</Link>
      </header>

      {quests.length === 0 ? (
        <div className="empty">
          <p>No quests yet.</p>
          <p className="muted">Tap the + to add your first quest.</p>
        </div>
      ) : (
        <div className="list">
          {quests.map((q) => (
            <div key={q.id} className={`card ${q.done ? "card--done" : ""}`}>
              <div className="card-title">{q.title}</div>
              {q.desc && <div className="card-desc">{q.desc}</div>}
              <div className="row">
                <span>XP: {q.xp ?? 0}</span>
                <span>HP: {q.hp ?? 0}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <button className="fab" onClick={() => nav("/new")} aria-label="Add quest">＋</button>
    </div>
  );
}
