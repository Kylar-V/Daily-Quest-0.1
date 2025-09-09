import { awardXP } from "../../api/xp";
import { updateQuest } from "../../api/storage";

export default function QuestCard({ q, onUpdated }) {
  function completeQuest(){
    if (q.done) return;
    const completedAt = Date.now();
    updateQuest(q.id, { done: true, completedAt });
    awardXP(q.xp ?? 0, { size: q.size, completedAt });
    onUpdated?.();
  }

  return (
    <div className={`card ${q.done ? "card--done" : ""}`}>
      <div className="card-title">{q.title}</div>
      {q.desc && <div className="card-desc">{q.desc}</div>}
      <div className="row">
        <span>Size: {q.size}</span>
        <span>XP: {q.xp ?? 0}</span>
        
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
