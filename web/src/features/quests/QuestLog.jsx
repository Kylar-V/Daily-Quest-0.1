import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { getQuests } from "../../api/storage";
import QuestCard from "./QuestCard";

export default function QuestLog() {
  const nav = useNavigate();
  const [quests, setQuests] = useState([]);

  function refresh() {
    setQuests(getQuests());
  }

  useEffect(() => {
    refresh();
  }, []);

  // Active (done === false) at the top, newest first; then completed, newest first
  const sorted = useMemo(() => {
    return [...(quests || [])].sort((a, b) => {
      if (!!a.done === !!b.done) {
        return (b.createdAt || 0) - (a.createdAt || 0);
      }
      return a.done ? 1 : -1; // push completed to the bottom
    });
  }, [quests]);

  return (
    <div className="page">
      <header className="header">
        <h1>Quest Log</h1>
        <div className="header-actions">
          <Link to="/character" className="link">Character →</Link>
        </div>
      </header>

      {sorted.length === 0 ? (
        <div className="empty">
          <p>No quests yet.</p>
          <p className="muted">Tap the Add Quest button to begin.</p>
        </div>
      ) : (
        <div className="list">
          {sorted.map((q) => (
            <QuestCard key={q.id} q={q} onUpdated={refresh} />
          ))}
        </div>
      )}

      <button
        className="fab"
        onClick={() => nav("/new")}
        aria-label="Add quest"
        title="Add New Quest"
      >
        Add Quest
      </button>
    </div>
  );
}
