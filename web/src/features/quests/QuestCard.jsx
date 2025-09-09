// web/src/features/quests/QuestCard.jsx
import { awardXP } from "../../api/xp";
import { updateQuest } from "../../api/storage";

export default function QuestCard({ q, onUpdated }) {
  function completeQuest(){
    if (q.done) return;
    updateQuest(q.id, { done: true, completedAt: Date.now() });
    awardXP(q.xp ?? 0);
    onUpdated?.(); // ask parent to refresh the list
  }

  return (
    <div className={`card ${q.done ? "card--done" : ""}`}>
      <div className="card-title">{q.title}</div>
      {q.desc && <div className="card-desc">{q.desc}</div>}
      <div className="row">
        <span>XP: {q.xp ?? 0}</span>
        <span>HP: {q.hp ?? 0}</span>
      </div>
      <div className="row" style={{ marginTop: 10 }}>
        {q.done ? (
          <button className="btn" disabled>Completed ✓</button>
        ) : (
          <button className="cta" onClick={completeQuest}>Mark Complete</button>
        )}
      </div>
    </div>
  );
}
