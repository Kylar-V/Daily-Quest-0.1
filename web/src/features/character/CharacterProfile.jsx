import { Link } from "react-router-dom";
import { getHero, getStats } from "../../api/storage";

export default function CharacterProfile() {
  const hero = getHero() || { name: "Adventurer", class: "Wizard" };
  const stats = getStats();

  // Placeholder: XP bar shows progress within the current 100-XP band
  const xpPct = Math.max(0, Math.min(100, stats.xp % 100));

  return (
    <div className="page">
      <header className="header">
        <h1>{hero.name}</h1>
        <Link to="/log" className="link">← Quest Log</Link>
      </header>

      <div className="card">
        <div className="muted">Class</div>
        <div className="big">{hero.class}</div>
      </div>

      <div className="card">
        <div className="muted">Level</div>
        <div className="big">{stats.level ?? 1}</div>
      </div>

      <div className="card">
        <div className="muted">XP</div>
        <div className="bar">
          <div className="bar-fill" style={{ width: `${xpPct}%` }} />
        </div>
      </div>

      <div className="card">
        <div className="muted">HP</div>
        <div className="bar">
          <div
            className="bar-fill bar-fill--hp"
            style={{ width: `${Math.round((stats.hp / (stats.maxHp || 1)) * 100)}%` }}
          />
        </div>
      </div>

      <button
        className="btn danger"
        onClick={() => { localStorage.removeItem("dq:v1"); location.href = "/"; }}
      >
        Reset Data
      </button>
    </div>
  );
}
