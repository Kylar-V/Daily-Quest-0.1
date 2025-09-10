// web/src/features/quests/QuestCard.jsx
import { awardXP } from "../../api/xp";
import { updateQuest } from "../../api/storage";

function IconBolt() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M13 2L3 14h7l-1 8 10-12h-7l1-8Z"/>
    </svg>
  );
}
function IconTarget() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2Zm0 18a8 8 0 1 1 8-8a8.009 8.009 0 0 1-8 8Zm0-12a4 4 0 1 0 4 4a4 4 0 0 0-4-4Zm0 6a2 2 0 1 1 2-2a2 2 0 0 1-2 2Z"/>
    </svg>
  );
}
function IconCheck() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
    </svg>
  );
}

export default function QuestCard({ q, onUpdated }) {
  function completeQuest() {
    if (q.done) return;
    const completedAt = Date.now();
    updateQuest(q.id, { done: true, completedAt });
    awardXP(q.xp ?? 0, { size: q.size, completedAt });
    onUpdated?.();
  }

  return (
    <div className={`card ${q.done ? "card--done" : ""}`}>
      <div className="card-head">
        <div className="card-title">{q.title}</div>
        {q.done && (
          <span className="badge badge--done" aria-label="Completed">
            <IconCheck /> Completed
          </span>
        )}
      </div>

      {q.desc && <div className="card-desc">{q.desc}</div>}

      <div className="badges">
        <span className="badge">
          <IconTarget />
          <span>Size: <strong>{q.size}</strong></span>
        </span>
        <span className="badge">
          <IconBolt />
          <span>XP: <strong>{q.xp ?? 0}</strong></span>
        </span>
      </div>

      <div className="row" style={{ marginTop: 10 }}>
        {q.done ? (
          <button className="btn" disabled aria-disabled="true">
            Completed ✓
          </button>
        ) : (
          <button className="cta" onClick={completeQuest}>
            Mark Complete
          </button>
        )}
      </div>
    </div>
  );
}
