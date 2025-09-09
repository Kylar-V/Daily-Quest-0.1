import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getQuests } from "../../api/storage";
import QuestCard from "./QuestCard";

export default function QuestLog() {
  const nav = useNavigate();
  const [quests, setQuests] = useState([]);

  function refresh(){ setQuests(getQuests()); }

  useEffect(() => { refresh(); }, []);

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
            <QuestCard key={q.id} q={q} onUpdated={refresh} />
          ))}
        </div>
      )}

      <button className="fab" onClick={() => nav("/new")} aria-label="Add quest" title="Add New Quest">
  Add Quest
</button>

    </div>
  );
}
